"""Owner-only, opt-in live evaluation with durable, reviewable artifacts.

Without --run-live, this module only describes the requested run. It never
ingests, modifies the index, deploys, or runs as a visitor endpoint.
"""
import argparse
import asyncio
import hashlib
import json
import math
import statistics
import subprocess
import uuid
from datetime import datetime, timezone
from pathlib import Path

from langchain_core.documents import Document
from implementation.answer import SYSTEM_PROMPT, stream_answer, response_system_prompt
from implementation.config import ANSWER_MODEL, EMBEDDING_MODEL, RETRIEVAL_K, CHUNK_SIZE, CHUNK_OVERLAP, CHUNKER_VERSION, INDEX_MODE, DB_NAME, model_followups_enabled, GENERATION_OUTPUT_TOKENS, ANSWER_OUTPUT_TOKENS
from implementation.fingerprint import corpus_fingerprint
from implementation.references import public_references
from implementation.protection import PRICES, PRICE_VERSION
from implementation.guardrails import validate_request
from .test import load_tests
from .eval import evaluate_retrieval, summarize_retrieval

ROOT = Path(__file__).resolve().parents[1]


def load_cases(suite):
    if suite == 'baseline':
        return [case.model_dump() for case in load_tests()]
    filenames = {'heldout': 'heldout-cases.jsonl', 'conversation': 'conversation-cases.jsonl', 'security': 'security-cases.jsonl'}
    path = Path(__file__).with_name(filenames[suite])
    cases = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    if len({case['id'] for case in cases}) != len(cases):
        raise ValueError('Duplicate evaluation case identity')
    return cases


def distribution(values):
    values = sorted(value for value in values if isinstance(value, (int, float)))
    return {'samples': len(values), 'median_ms': statistics.median(values) if values else None,
            'p95_ms': values[max(0, math.ceil(len(values) * .95) - 1)] if len(values) >= 20 else None}


def index_provenance():
    if INDEX_MODE == 'packaged':
        from implementation.packaged_index import INDEX_PATH, load_packaged_index
        load_packaged_index()  # Fail before a paid run if the release is invalid.
        paths = (INDEX_PATH, INDEX_PATH.with_suffix('.sha256'))
    else:
        # Do not open/modify Chroma to describe a run. Hash its persisted files,
        # including any WAL, so local results cannot masquerade as the release.
        paths = tuple(sorted(path for path in Path(DB_NAME).rglob('*') if path.is_file() and not path.is_symlink()))
    return {'mode': INDEX_MODE,
            'artifact_sha256': {(str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else 'local-index/'+str(path.relative_to(DB_NAME))):
                                hashlib.sha256(path.read_bytes()).hexdigest() for path in paths}}


def metadata(suite):
    revision = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True, check=False)
    dirty = subprocess.run(['git', 'status', '--porcelain'], cwd=ROOT, capture_output=True, text=True, check=False)
    return {'schema_version': 2, 'run_id': uuid.uuid4().hex, 'suite': suite,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'source_revision': revision.stdout.strip() or None, 'working_tree_dirty': bool(dirty.stdout.strip()),
            'answer_model': ANSWER_MODEL, 'embedding_model': EMBEDDING_MODEL,
            'corpus_fingerprint': corpus_fingerprint(), 'prompt_sha256': hashlib.sha256(response_system_prompt().encode()).hexdigest(),
            'model_followups_enabled': model_followups_enabled(),
            'generation_output_tokens': GENERATION_OUTPUT_TOKENS if model_followups_enabled() else ANSWER_OUTPUT_TOKENS,
            'retrieval_k': RETRIEVAL_K, 'chunk_size': CHUNK_SIZE, 'chunk_overlap': CHUNK_OVERLAP,
            'chunker_version': CHUNKER_VERSION,
            'pricing_version': PRICE_VERSION,
            'retrieval_index': index_provenance(),
            'implementation_sha256': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in [ROOT / 'implementation' / name for name in ('answer.py', 'structured_answer.py', 'followups.py', 'config.py', 'ingest.py', 'packaged_index.py', 'fingerprint.py', 'guardrails.py', 'references.py', 'public_sources.json', 'approved_links.json')] + [Path(__file__)]},
            'dataset_sha256': hashlib.sha256(json.dumps(load_cases(suite), sort_keys=True).encode()).hexdigest()}


def summarize(rows):
    complete = [row for row in rows if row['status'] in ('complete', 'rejected')]
    reviewed = [row for row in complete if row.get('human_review', {}).get('verdict') in ('pass', 'fail')]
    claims = [row['human_review'] for row in reviewed if isinstance(row['human_review'].get('factual_claims'), int) and isinstance(row['human_review'].get('unsupported_claims'), int)]
    total = sum(row['factual_claims'] for row in claims)
    return {'processed': len(rows), 'completed': len(complete), 'failed': len(rows) - len(complete),
            'expected_rejections': sum(row['status'] == 'rejected' for row in complete),
            'human_reviewed': len(reviewed), 'human_passes': sum(row['human_review']['verdict'] == 'pass' for row in reviewed),
            'unsupported_claim_rate': sum(row['unsupported_claims'] for row in claims) / total if total else None,
            'reviewed_factual_claims': total,
            'retrieval': distribution([row.get('timing', {}).get('retrieval_ms') for row in complete]),
            'first_text': distribution([row.get('timing', {}).get('first_text_ms') for row in complete]),
            'completion': distribution([row.get('timing', {}).get('completion_ms') for row in complete])}


async def run_case(case):
    documents, timing, usage = [], {}, {}
    suggestion = None
    def receive_suggestion(value):
        nonlocal suggestion
        suggestion = value
    def context(selected):
        documents.extend(selected)
    def transform(selected):
        # Explicit owner-side fault injection; never accepted by the HTTP API.
        poison = case.get('reference_text')
        return [Document(page_content=poison, metadata={'document_id': 'evaluation-poison'})] + selected if poison else selected
    answer = ''
    try:
        if case.get('enforcement') == 'deterministic':
            try:
                validate_request(case['question'], case.get('history', []))
            except ValueError:
                status, error = 'rejected', None
            else:
                status, error = 'failed', 'ExpectedInputRejectionMissing'
        else:
            async for delta in stream_answer(case['question'], case.get('history', []), on_context=context,
                                             on_metrics=timing.update, on_usage=usage.update, context_transform=transform, on_suggestion=receive_suggestion):
                answer += delta
            status = 'complete' if answer.strip() else 'empty'
            error = None
    except Exception as exc:
        status, error = 'failed', type(exc).__name__
    estimate = None
    if type(usage.get('input_tokens')) is int and type(usage.get('output_tokens')) is int:
        input_rate, output_rate, denominator = PRICES[ANSWER_MODEL]
        estimate = math.ceil((usage['input_tokens'] * input_rate + usage['output_tokens'] * output_rate) / denominator)
    row = {'id': case['id'], 'kind': case.get('kind', case.get('category')), 'question': case['question'],
           'history': case.get('history', []), 'expected_behavior': case.get('expected_behavior', case.get('reference_answer')),
           'status': status, 'error_class': error, 'answer': answer,
           'references': public_references(documents), 'timing': timing,
           'followup': suggestion if status == 'complete' else None,
           'answer_provider_usage': usage or None, 'estimated_answer_micro_usd': estimate,
           'usage_scope': 'Generation stream when metadata is available; includes structured answer and follow-up when enabled. Excludes embeddings, rewriting and judging. Not a billing total.',
           'human_review': {'verdict': 'pending', 'factual_claims': None, 'unsupported_claims': None,
                            'appropriate_uncertainty': None, 'reference_correctness': None, 'notes': ''}}
    return row, documents


def write_report(path, report):
    """Atomically replace each artifact with the same completed-prefix snapshot."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    report['summary'] = summarize(report['cases'])
    data = json.dumps(report, ensure_ascii=False, indent=2)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(data)
    temporary.replace(path)
    summary = report['summary']
    lines = ['# Portfolio assistant evaluation report', '',
             f"Run: {report['run_id']} · Suite: {report['suite']} · Status: {report['status']}", '',
             f"Completed {summary['completed']} of {report['requested_cases']} requested cases; {summary['failed']} failed; {summary['expected_rejections']} expected input rejections; {summary['human_reviewed']} human reviewed.", '',
             'Section coverage measures metadata matches; labelled-quote coverage separately checks normalized literal quotes inside retrieved passages. Neither establishes semantic entailment or support for every generated claim. Human review is required for factual support, uncertainty and reference correctness.', '',
             'Provider usage, when present, covers the generation stream, including structured suggestion metadata when enabled; embeddings, rewriting and judging are excluded. No total bill or quality pass rate is inferred from missing metadata. p95 is omitted for fewer than 20 measurements.', '']
    index = report.get('retrieval_index')
    if index:
        lines += [f"Retrieval index: {index['mode']}", '',
                  'Index SHA-256: ' + json.dumps(index['artifact_sha256'], sort_keys=True), '']
    else:
        lines += ['Retrieval index: unrecorded (legacy report)', '']
    if report.get('retrieval_summary'):
        lines += [f"Retrieval summary: {json.dumps(report['retrieval_summary'], ensure_ascii=False)}", '']
    for row in report['cases']:
        lines += [f"## {row['id']}", '', row['question'], '', f"Status: {row['status']} · Human verdict: {row['human_review']['verdict']}", '',
                  'Expected behavior: ' + str(row['expected_behavior']), '', row['answer'] or '(No completed answer)', '',
                  f"Timing: {json.dumps(row['timing'])}", '', 'Human notes: ' + row['human_review']['notes'], '']
        if row.get('followup'):
            lines += ['Suggested question: ' + row['followup']['question'],
                      'Suggestion source: ' + row['followup']['source'], '']
    markdown = path.with_suffix('.md')
    temporary = markdown.with_suffix('.md.tmp')
    temporary.write_text('\n'.join(lines))
    temporary.replace(markdown)


def apply_reviews(report, reviews):
    if reviews.get('run_id') != report['run_id']:
        raise ValueError('Reviews must identify this exact run')
    rows = {row['id']: row for row in report['cases']}
    for review in reviews.get('cases', []):
        if review.get('id') not in rows or review.get('verdict') not in ('pass', 'fail', 'pending'):
            raise ValueError('Unknown case or invalid human verdict')
        total, unsupported = review.get('factual_claims'), review.get('unsupported_claims')
        if total is not None or unsupported is not None:
            if type(total) is not int or type(unsupported) is not int or not 0 <= unsupported <= total:
                raise ValueError('Invalid human claim counts')
        rows[review['id']]['human_review'] = {key: review.get(key) for key in ('verdict', 'factual_claims', 'unsupported_claims', 'appropriate_uncertainty', 'reference_correctness', 'notes')}
        rows[review['id']]['human_review']['notes'] = str(review.get('notes', ''))[:4000]


async def run(args):
    cases = load_cases(args.suite)[:args.limit]
    report = {**metadata(args.suite), 'status': 'running', 'requested_cases': len(cases), 'cases': [], 'retrieval_summary': None}
    baseline = {case.id: case for case in load_tests()} if args.suite == 'baseline' else {}
    retrieval = []
    write_report(args.output, report)
    try:
        for case in cases:
            row, docs = await run_case(case)
            if case['id'] in baseline and row['status'] == 'complete':
                result = evaluate_retrieval(baseline[case['id']], retrieved_docs=docs)
                row['retrieval'] = result.model_dump()
                retrieval.append((baseline[case['id']], result))
                report['retrieval_summary'] = summarize_retrieval(retrieval)
            report['cases'].append(row)
            write_report(args.output, report)
        report['status'] = 'complete' if all(row['status'] in ('complete', 'rejected') for row in report['cases']) else 'partial'
    except BaseException:
        report['status'] = 'interrupted'
        raise
    finally:
        write_report(args.output, report)
        from implementation.config import close_providers
        from implementation.answer import get_chat_model, get_vectorstore
        await close_providers()
        get_chat_model.cache_clear()
        get_vectorstore.cache_clear()
    return 0 if report['status'] == 'complete' else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--suite', choices=('baseline', 'heldout', 'conversation', 'security'), default='baseline')
    parser.add_argument('--limit', type=int, default=50)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--run-live', action='store_true', help='Explicitly make paid embedding/rewrite/answer calls')
    parser.add_argument('--review-report', type=Path)
    parser.add_argument('--reviews', type=Path)
    args = parser.parse_args()
    if args.review_report:
        if args.run_live or not args.reviews:
            parser.error('Review application is offline and requires --reviews')
        report = json.loads(args.review_report.read_text())
        apply_reviews(report, json.loads(args.reviews.read_text()))
        write_report(args.review_report, report)
        return 0
    if args.limit < 1:
        parser.error('--limit must be positive')
    if not args.run_live:
        print(json.dumps({'suite': args.suite, 'requested_cases': min(args.limit, len(load_cases(args.suite))),
                          'provider_calls': 0, 'next_step': 'Use --run-live and a new --output report.json for an intentional paid run.'}))
        return 0
    if not args.output or args.output.suffix != '.json' or args.output.exists() or args.output.with_suffix('.md').exists():
        parser.error('A live run requires a new --output path ending in .json; existing reports are not overwritten')
    return asyncio.run(run(args))


if __name__ == '__main__':
    raise SystemExit(main())
