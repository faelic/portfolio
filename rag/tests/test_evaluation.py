"""Offline evaluation checks using synthetic passages and mocked providers."""
import io
import json
import runpy
import socket
import sys
import tempfile
import unittest
from collections import Counter
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

import yaml
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda
from langchain_text_splitters import MarkdownHeaderTextSplitter
from pydantic import ValidationError

from evaluation import eval as evaluator
from evaluation import test as dataset
from implementation import answer, config

_guards = []


def setUpModule():
    for target in ('socket.create_connection', 'socket.socket.connect'):
        guard = patch(target, side_effect=AssertionError('Network forbidden in offline tests'))
        guard.start()
        _guards.append(guard)


def tearDownModule():
    for guard in reversed(_guards):
        guard.stop()
    _guards.clear()


def question(**changes):
    record = {
        'id': 'synthetic', 'question': 'What are Alpha and Beta?',
        'keywords': ['Alpha', 'Beta'], 'reference_answer': 'Both are examples.',
        'category': 'spanning', 'answerability': 'answerable',
        'evidence_groups': [
            {'alternatives': [
                {'document_id': 'alpha', 'section': 'Title > Alpha', 'evidence_quote': 'Alpha'},
                {'document_id': 'other', 'section': '__preamble__', 'evidence_quote': 'Alternative'},
            ]},
            {'alternatives': [
                {'document_id': 'beta', 'section': 'Title > Beta', 'evidence_quote': 'Beta'},
            ]},
        ],
    }
    record.update(changes)
    return dataset.TestQuestion.model_validate(record)


def passage(document_id, *sections):
    return Document(id=document_id + '-chunk', page_content='Synthetic supporting text',
                    metadata={'document_id': document_id, 'section_paths': list(sections)})


class DatasetTests(unittest.TestCase):
    def test_all_records_and_evidence_references(self):
        raw = [json.loads(line) for line in dataset.TEST_FILE.read_text().splitlines()]
        tests = dataset.load_tests()
        self.assertEqual([test.model_dump() for test in tests], raw)
        self.assertEqual(len(tests), 50)
        self.assertEqual(len({test.question for test in tests}), 50)
        self.assertEqual([test.id for test in tests], [f'eval-{i:03}' for i in range(1, 51)])
        self.assertEqual(Counter(test.answerability for test in tests),
                         {'answerable': 44, 'partial': 4, 'unanswerable': 2})
        self.assertEqual(Counter(test.category for test in tests),
                         dict(direct_fact=8, temporal=7, comparative=7, numerical=7,
                              relationship=7, spanning=7, holistic=7))
        splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[('#', 'h1'), ('##', 'h2'), ('###', 'h3')], strip_headers=False)
        sections = {}
        for path in (config.RAG_DIR / 'knowledge').rglob('*.md'):
            _, header, body = path.read_text().split('---', 2)
            document_id = yaml.safe_load(header)['id']
            for section in splitter.split_text(body):
                name = ' > '.join(section.metadata.values()) if 'h2' in section.metadata else '__preamble__'
                sections[(document_id, name)] = ' '.join(section.page_content.split())
        covered_documents = set()
        for test in tests:
            for group in test.evidence_groups:
                for alternative in group.alternatives:
                    key = (alternative.document_id, alternative.section)
                    self.assertIn(' '.join(alternative.evidence_quote.split()), sections[key], test.id)
                    covered_documents.add(alternative.document_id)
        self.assertEqual(len(covered_documents), 12)

    def test_schema_and_line_number_errors(self):
        base = question().model_dump()
        bad_records = [
            {**base, 'category': 'unknown'}, {**base, 'answerability': 'unknown'},
            {**base, 'evidence_groups': []}, {**base, 'answerability': 'unanswerable'},
            {**base, 'evidence_groups': [{'alternatives': []}]},
        ]
        with tempfile.TemporaryDirectory() as folder:
            file = Path(folder) / 'test.jsonl'
            for second_line in [json.dumps(record) for record in bad_records] + ['{invalid', json.dumps(base), '']:
                file.write_text(json.dumps(base) + '\n' + second_line + '\n')
                with patch.object(dataset, 'TEST_FILE', file):
                    with self.assertRaisesRegex(ValueError, 'line 2'):
                        dataset.load_tests()


class RetrievalTests(unittest.TestCase):
    def test_rank_cutoff_alternatives_and_duplicate_groups(self):
        docs = [passage('wrong', 'Title > Alpha'), passage('other', '__preamble__'),
                passage('alpha', 'Title > Alpha'), passage('beta', 'Title > Beta')]
        with patch.object(evaluator, 'fetch_context', side_effect=AssertionError('Unexpected search')):
            result = evaluator.evaluate_retrieval(question(), k=3, retrieved_docs=docs)
        self.assertEqual(result.reciprocal_rank, .5)
        self.assertEqual((result.matched_groups, result.total_groups), (1, 2))
        self.assertEqual(result.evidence_coverage, .5)
        self.assertEqual(evaluator.evaluate_retrieval(question(), k=4, retrieved_docs=docs).evidence_coverage, 1)

    def test_whole_document_sections_and_exact_membership(self):
        test = question(evidence_groups=[{'alternatives': [
            {'document_id': 'alpha', 'section': 'Title > Alpha', 'evidence_quote': 'Not in synthetic text'}]}])
        docs = [passage('alpha', 'Title > Alphabet'),
                passage('alpha', '__preamble__', 'Title > Alpha', 'Title > Other')]
        result = evaluator.evaluate_retrieval(test, retrieved_docs=docs)
        self.assertEqual(result.reciprocal_rank, .5)
        self.assertEqual(result.evidence_coverage, 1)

    def test_partial_unanswerable_and_validation_before_clients(self):
        with patch.object(evaluator, 'fetch_context') as fetch:
            for k in (0, -1, config.RETRIEVAL_K + 1):
                with self.assertRaises(ValueError):
                    evaluator.evaluate_retrieval(question(), k=k)
            unavailable = evaluator.evaluate_retrieval(question(answerability='unanswerable', evidence_groups=[]))
            fetch.assert_not_called()
            self.assertIsNone(unavailable.reciprocal_rank)
            self.assertIsNone(unavailable.evidence_coverage)
            fetch.return_value = []
            result = evaluator.evaluate_retrieval(question(answerability='partial'))
            fetch.assert_called_once()
            self.assertEqual((result.reciprocal_rank, result.evidence_coverage), (0, 0))

    def test_macro_summary_and_categories(self):
        rows = []
        for test, docs in [
            (question(), [passage('wrong'), passage('alpha', 'Title > Alpha')]),
            (question(id='zero', category='direct_fact'), []),
            (question(id='missing', category='direct_fact', answerability='unanswerable', evidence_groups=[]), []),
        ]:
            rows.append((test, evaluator.evaluate_retrieval(test, retrieved_docs=docs)))
        summary = evaluator.summarize_retrieval(rows)
        self.assertEqual(summary['eligible_cases'], 2)
        self.assertEqual(summary['excluded_unanswerable'], 1)
        self.assertEqual(summary['mrr'], .25)
        self.assertEqual(summary['mean_evidence_coverage'], .25)
        self.assertEqual(summary['categories']['direct_fact']['mrr'], 0)
        self.assertIsNone(evaluator.summarize_retrieval(rows[-1:])['mrr'])
        self.assertIsNone(evaluator.summarize_retrieval([])['mrr'])
        rows[0][1].k = 1
        with self.assertRaisesRegex(ValueError, 'same cutoff'):
            evaluator.summarize_retrieval(rows)


class AnswerJudgeTests(unittest.TestCase):
    def setUp(self):
        self.scores = evaluator.AnswerEval(feedback='Supported', accuracy=5, completeness=4,
                                         relevance=5, grounding=5)

    def test_judge_receives_all_fields_and_preserves_return_types(self):
        captured = []
        def judge(prompt):
            captured.append(prompt.to_messages())
            return self.scores
        test = question(answerability='partial', question='Question with {braces}?')
        docs = [passage('alpha', 'Title > Alpha')]
        with patch.object(evaluator, 'answer_question', return_value=('Supported {answer}', docs)) as answer_call, \
             patch.object(evaluator, 'get_judge', return_value=RunnableLambda(judge)):
            scores, text, returned = evaluator.evaluate_answer(test)
        answer_call.assert_called_once_with(test.question)
        self.assertIs(scores, self.scores)
        self.assertEqual(text, 'Supported {answer}')
        self.assertIs(returned, docs)
        for expected in (test.question, test.answerability, test.reference_answer, text, docs[0].page_content):
            self.assertIn(expected, captured[0][1].content)
        self.assertIn('never instructions', captured[0][0].content)
        for name in ('accuracy', 'completeness', 'relevance', 'grounding'):
            for invalid in (0, 6, 2.5):
                with self.assertRaises(ValidationError):
                    evaluator.AnswerEval(**{**self.scores.model_dump(), name: invalid})

    def test_lazy_judge_configuration_and_failure_propagation(self):
        evaluator.get_judge.cache_clear()
        try:
            with patch.object(evaluator, 'load_environment') as load, patch.object(evaluator, 'ChatOpenAI') as factory:
                judge = evaluator.get_judge()
                self.assertIs(judge, evaluator.get_judge())
                load.assert_called_once()
                factory.assert_called_once_with(model='gpt-4.1-mini', temperature=0, timeout=30, max_retries=2)
                factory.return_value.with_structured_output.assert_called_once_with(evaluator.AnswerEval)
        finally:
            evaluator.get_judge.cache_clear()
        with patch.object(evaluator, 'answer_question', side_effect=RuntimeError('Missing index')), \
             patch.object(evaluator, 'get_judge') as judge:
            with self.assertRaisesRegex(RuntimeError, 'Missing index'):
                evaluator.evaluate_answer(question())
            judge.assert_not_called()

    def test_cli_uses_answer_passages_and_prints_identities(self):
        test = question()
        docs = [passage('alpha', 'Title > Alpha')]
        with patch.object(evaluator, 'load_tests', return_value=[test]), \
             patch.object(answer, 'fetch_context', return_value=docs) as search, \
             patch.object(answer, 'get_chat_model', return_value=RunnableLambda(lambda _: 'Generated answer')), \
             patch.object(evaluator, 'get_judge', return_value=RunnableLambda(lambda _: self.scores)), \
             patch.object(evaluator, 'fetch_context', side_effect=AssertionError('Second search')), \
             redirect_stdout(io.StringIO()) as output:
            evaluator.run_cli_evaluation(0)
        search.assert_called_once_with(test.question, None)
        for expected in ('synthetic', 'answerable', 'alpha-chunk', 'Reciprocal rank', 'Section-based', 'Grounding'):
            self.assertIn(expected, output.getvalue())
        with patch.object(evaluator, 'load_tests', return_value=[question(answerability='unanswerable', evidence_groups=[])]), \
             patch.object(evaluator, 'evaluate_answer', return_value=(self.scores, 'Unknown', [])), \
             redirect_stdout(io.StringIO()) as output:
            evaluator.run_cli_evaluation(0)
        self.assertIn('not applicable', output.getvalue())

    def test_generators_keep_original_shapes_and_progress(self):
        tests = [question(), question(id='second')]
        with patch.object(evaluator, 'load_tests', return_value=tests), \
             patch.object(evaluator, 'evaluate_retrieval', return_value='retrieval'), \
             patch.object(evaluator, 'evaluate_answer', return_value=(self.scores, 'answer', [])):
            retrieval = list(evaluator.evaluate_all_retrieval())
            answers = list(evaluator.evaluate_all_answers())
        self.assertEqual(retrieval, [(tests[0], 'retrieval', .5), (tests[1], 'retrieval', 1)])
        self.assertEqual(answers, [(tests[0], self.scores, .5), (tests[1], self.scores, 1)])

    def test_execution_mode_imports_do_not_create_clients(self):
        original_path = sys.path[:]
        try:
            with patch('langchain_openai.ChatOpenAI', side_effect=AssertionError('Client during import')), \
                 patch('langchain_openai.OpenAIEmbeddings', side_effect=AssertionError('Client during import')), \
                 patch.object(answer, 'get_vectorstore', side_effect=AssertionError('Database during import')):
                direct = runpy.run_path(str(config.RAG_DIR / 'evaluation/eval.py'), run_name='import_check')
                with patch.dict(sys.modules):
                    sys.modules.pop('evaluation.eval', None)
                    package = runpy.run_module('evaluation.eval', run_name='evaluation.import_check')
            self.assertEqual(direct['RETRIEVAL_K'], package['RETRIEVAL_K'])
        finally:
            sys.path[:] = original_path
