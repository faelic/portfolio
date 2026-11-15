"""No provider calls: verify public evidence and report provenance boundaries."""
import json
import hashlib
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch, Mock, AsyncMock
from langchain_core.documents import Document
from implementation.references import public_references
from implementation import answer
from evaluation.report import load_cases, distribution, summarize, apply_reviews, write_report
import api
from evaluation import report as reporting
from fastapi.testclient import TestClient


class ReferenceTests(unittest.TestCase):
    def test_reference_opt_in_header_is_allowed_only_on_configured_origins(self):
        with TestClient(api.app, base_url='http://localhost') as client:
            headers = {'Origin': 'http://127.0.0.1:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Content-Type, X-Portfolio-References'}
            allowed = client.options('/api/chat', headers=headers)
            self.assertEqual(allowed.status_code, 200)
            self.assertIn('X-Portfolio-References', allowed.headers['access-control-allow-headers'])
            headers['Origin'] = 'https://attacker.example'
            self.assertEqual(client.options('/api/chat', headers=headers).status_code, 400)

    def test_unicode_reference_batch_stays_inside_the_client_frame_budget(self):
        docs = [Document(page_content='😀'*400 + str(index), metadata={'document_id': 'project-monierave', 'section_paths': ['😀'*160]*3}) for index in range(10)]
        references = public_references(docs)
        self.assertGreater(len(references), 0)
        self.assertLess(len(references), 10)
        self.assertLessEqual(len(json.dumps(references, ensure_ascii=False).encode('utf-8')), 12_000)

    def test_only_registered_sources_are_public_and_fields_are_bounded(self):
        documents = [Document(page_content='x'*600, metadata={'document_id': 'project-monierave', 'section_paths': ['A'*300], 'source_path': '/private/key'}), Document(page_content='Secret', metadata={'document_id': '/private/key'})]
        rows = public_references(documents)
        self.assertEqual(len(rows), 1)
        self.assertEqual(len(rows[0]['excerpt']), 400)
        self.assertEqual(len(rows[0]['sections'][0]), 160)
        self.assertEqual(rows[0]['href'], 'https://www.favourututu.com/#monierave')
        self.assertNotIn('/private', json.dumps(rows))

    def test_api_attaches_context_to_the_same_answer_without_a_second_search(self):
        calls = []
        async def generate(question, history, *, on_context=None, **options):
            calls.append(question)
            if on_context:
                on_context([Document(page_content='Selected passage', metadata={'document_id': 'project-monierave'})])
            yield 'Supported answer'
        with TestClient(api.app, base_url='http://localhost') as client, patch.object(api, 'stream_answer', generate):
            legacy = client.post('/api/chat', json={'question': 'Legacy question'})
            response = client.post('/api/chat', json={'question': 'Question'}, headers={'X-Portfolio-References': '1'})
        self.assertEqual([json.loads(line)['type'] for line in legacy.text.splitlines()], ['delta', 'done'])
        events = [json.loads(line) for line in response.text.splitlines()]
        self.assertEqual([row['type'] for row in events], ['references', 'delta', 'done'])
        self.assertEqual(events[0]['items'][0]['excerpt'], 'Selected passage')
        self.assertEqual(calls, ['Legacy question', 'Question'])


class TraceTests(unittest.IsolatedAsyncioTestCase):
    async def test_deterministic_security_rejection_never_calls_the_provider(self):
        case = next(case for case in load_cases('security') if case['id'] == 'sec-013')
        with patch.object(reporting, 'stream_answer') as stream:
            row, documents = await reporting.run_case(case)
        self.assertEqual(row['status'], 'rejected')
        self.assertEqual(documents, [])
        self.assertEqual(summarize([row])['expected_rejections'], 1)
        stream.assert_not_called()

    async def test_callbacks_observe_selected_context_and_real_stream_timing(self):
        store = Mock()
        docs = [Document(page_content='Evidence', metadata={'document_id': 'project-monierave'})]
        store.similarity_search_by_vector.return_value = docs
        async def generate(_):
            yield 'Answer'
        contexts, metrics = [], {}
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=Mock(aembed_query=AsyncMock(return_value=[.1]))), patch.object(answer, 'get_chat_model', return_value=Mock(astream=generate)):
            text = ''.join([part async for part in answer.stream_answer('Question', on_context=contexts.extend, on_metrics=metrics.update)])
        self.assertEqual(text, 'Answer')
        self.assertEqual(contexts, docs)
        self.assertLessEqual(metrics['retrieval_ms'], metrics['first_text_ms'])
        self.assertLessEqual(metrics['first_text_ms'], metrics['completion_ms'])

    async def test_owner_runner_persists_completed_results_without_an_implicit_judge(self):
        async def fake_stream(question, history, **hooks):
            hooks['on_context']([Document(page_content='Public evidence', metadata={'document_id': 'project-monierave'})])
            hooks['on_metrics']({'retrieval_ms': 1, 'first_text_ms': 2, 'completion_ms': 3})
            hooks['on_usage']({'input_tokens': 1000, 'output_tokens': 100})
            yield 'A fixture answer.'
        with tempfile.TemporaryDirectory() as folder, patch.object(reporting, 'stream_answer', fake_stream):
            path = Path(folder) / 'run.json'
            result = await reporting.run(Mock(suite='heldout', limit=1, output=path))
            saved = json.loads(path.read_text())
        self.assertEqual(result, 0)
        self.assertEqual(saved['status'], 'complete')
        self.assertEqual(saved['summary']['human_reviewed'], 0)
        self.assertEqual(saved['cases'][0]['estimated_answer_micro_usd'], 560)
        self.assertIn('implementation/answer.py', saved['implementation_sha256'])


class ReportTests(unittest.TestCase):
    def test_packaged_provenance_records_the_actual_mode_vectors_and_search_code(self):
        with patch.object(reporting, 'INDEX_MODE', 'packaged'):
            result = reporting.metadata('heldout')
        self.assertEqual(result['schema_version'], 2)
        self.assertEqual(result['retrieval_index']['mode'], 'packaged')
        for name in ('index/knowledge.json', 'index/knowledge.sha256'):
            expected = hashlib.sha256((reporting.ROOT/name).read_bytes()).hexdigest()
            self.assertEqual(result['retrieval_index']['artifact_sha256'][name], expected)
        path = reporting.ROOT/'implementation/packaged_index.py'
        self.assertEqual(result['implementation_sha256']['implementation/packaged_index.py'], hashlib.sha256(path.read_bytes()).hexdigest())
        with tempfile.TemporaryDirectory() as folder:
            output = Path(folder)/'report.json'
            reporting.write_report(output, {**result, 'cases':[], 'requested_cases':0, 'status':'complete'})
            markdown = output.with_suffix('.md').read_text()
            self.assertIn('Retrieval index: packaged', markdown)
            self.assertIn(result['retrieval_index']['artifact_sha256']['index/knowledge.json'], markdown)

    def test_local_index_artifact_changes_are_recorded_without_opening_chroma(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(reporting, 'INDEX_MODE', 'chroma'), patch.object(reporting, 'DB_NAME', folder):
            path = Path(folder)/'chroma.sqlite3'
            path.write_bytes(b'fixture-one')
            before = reporting.index_provenance()
            path.write_bytes(b'fixture-two')
            after = reporting.index_provenance()
        self.assertEqual(before['mode'], 'chroma')
        self.assertNotEqual(before['artifact_sha256'], after['artifact_sha256'])
        self.assertNotIn(folder, json.dumps(before))

    def test_chunker_revision_changes_fingerprint_without_changing_current_format(self):
        from implementation import fingerprint
        before = fingerprint.corpus_fingerprint()
        with patch.object(fingerprint,'CHUNKER_VERSION',fingerprint.CHUNKER_VERSION+1):
            self.assertNotEqual(fingerprint.corpus_fingerprint(),before)

    def test_datasets_stay_separate_and_small_samples_have_no_p95(self):
        self.assertEqual(len(load_cases('baseline')), 50)
        self.assertEqual(len(load_cases('heldout')), 8)
        self.assertEqual(len(load_cases('conversation')), 12)
        self.assertEqual(len(load_cases('security')), 24)
        self.assertIsNone(distribution([1, 2])['p95_ms'])
        self.assertEqual(distribution(list(range(20)))['p95_ms'], 18)

    def test_unreviewed_outputs_are_not_quality_passes_and_reviews_are_run_bound(self):
        row = {'id': 'case', 'status': 'complete', 'timing': {}, 'human_review': {'verdict': 'pending'}}
        report = {'run_id': 'run', 'cases': [row]}
        self.assertEqual(summarize([row])['human_reviewed'], 0)
        self.assertIsNone(summarize([row])['unsupported_claim_rate'])
        with self.assertRaises(ValueError):
            apply_reviews(report, {'run_id': 'other', 'cases': []})
        with self.assertRaises(ValueError):
            apply_reviews(report, {'run_id': 'run', 'cases': [{'id': 'case', 'verdict': 'pass', 'factual_claims': 1, 'unsupported_claims': 2}]})
        apply_reviews(report, {'run_id': 'run', 'cases': [{'id': 'case', 'verdict': 'fail', 'factual_claims': 4, 'unsupported_claims': 1, 'notes': 'Review'}]})
        self.assertEqual(summarize([row])['unsupported_claim_rate'], .25)

    def test_json_and_markdown_preserve_failure_and_review_state(self):
        report = {'run_id': 'run', 'suite': 'heldout', 'status': 'partial', 'requested_cases': 2, 'cases': [{'id': 'case', 'question': 'Question', 'expected_behavior': 'Do not invent', 'answer': '', 'status': 'failed', 'timing': {}, 'human_review': {'verdict': 'pending', 'notes': ''}}]}
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'report.json'
            write_report(path, report)
            self.assertEqual(json.loads(path.read_text())['summary']['failed'], 1)
            self.assertIn('0 of 2 requested', path.with_suffix('.md').read_text())
            self.assertIn('pending', path.with_suffix('.md').read_text())
