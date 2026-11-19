"""Rebuild this fixed evaluation record offline; never generate answers or grades."""
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import statistics

HERE = Path(__file__).resolve().parent


def read(name):
    return json.loads((HERE / name).read_text())


def main():
    reports = [read('baseline.json'), read('heldout.json')]
    reviews = read('ai-reviews.json')
    evidence = read('source-evidence.json')
    selected = read('selected-cases.json')
    for document in evidence['documents'].values():
        assert hashlib.sha256(document['text'].encode()).hexdigest() == document['sha256']
    for report in reports:
        fixtures = selected[report['suite']]
        assert [row['id'] for row in report['cases']] == [case['id'] for case in fixtures]
        for row, case in zip(report['cases'], fixtures):
            assert row['question'] == case['question']
            assert row['history'] == case.get('history', [])
    by_id = {row['id']: (report, row) for report in reports for row in report['cases']}
    grades = {row['id']: row for row in reviews['cases']}
    assert len(by_id) == len(grades) == 28 and by_id.keys() == grades.keys()
    assert [len(report['cases']) for report in reports] == [20, 8]
    assert all(report['status'] == 'complete' for report in reports)
    assert len({(r['prompt_sha256'], r['corpus_fingerprint'], r['answer_model'],
                 r['embedding_model'], json.dumps(r['retrieval_index'], sort_keys=True))
                for r in reports}) == 1, 'Runs used different pipeline/index settings'
    for grade in grades.values():
        assert len(grade['scores']) == 4 and all(type(s) is int and 0 <= s <= 2 for s in grade['scores'])
        support, completeness, relevance, boundaries = grade['scores']
        passes = support == completeness == boundaries == 2 and relevance >= 1
        assert grade['verdict'] == ('pass' if passes else 'fail')
        for item in grade['evidence']:
            assert item['quote'] in evidence['documents'][item['path']]['text']
    for _, row in by_id.values():
        assert row['status'] == 'complete' and row['answer'].strip()
        assert row['human_review']['verdict'] == 'pending'
    counts = Counter(g['verdict'] for g in grades.values())
    metrics = {}
    for name in ('retrieval_ms', 'first_text_ms', 'completion_ms'):
        values = sorted(row['timing'][name] for _, row in by_id.values() if name in row['timing'])
        metrics[name] = {'samples': len(values), 'median': statistics.median(values) if values else None,
                         'p95': values[math.ceil(.95 * len(values)) - 1] if len(values) >= 20 else None}
    summary = {'evaluation_type': 'AI-assisted evaluation', 'human_reviewed': 0,
               'attempted': 28, 'completed': 28, 'generation_failures': 0,
               'ai_passes': counts['pass'], 'ai_failures': counts['fail'],
               'ai_pass_fraction': counts['pass'] / 28,
               'baseline_passes': sum(grades[row['id']]['verdict'] == 'pass' for row in reports[0]['cases']),
               'heldout_passes': sum(grades[row['id']]['verdict'] == 'pass' for row in reports[1]['cases']),
               'score_means': dict(zip(reviews['score_order'], [sum(g['scores'][i] for g in grades.values()) / 28 for i in range(4)])),
               'timing_ms': metrics, 'baseline_retrieval': reports[0]['retrieval_summary'],
               'unsupported_claim_rate': None,
               'limitations': 'One AI reviewer; non-random sample; no human/independent validation; no before/after quality comparison; claim counts not annotated.'}
    (HERE / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    lines = ['# Portfolio assistant — 28-response AI-assisted evaluation', '',
             'Evaluation documented: 19 November 2026. **AI-assisted evaluation; not personally graded by Favour and not independent human validation.**', '',
             '## Method', '',
             'Ran the existing local streaming answering pipeline with real provider calls, using the packaged production knowledge index. No ingestion, prompt tuning, reranking, application deployment, or runtime changes were made. The 20 baseline cases ran first, followed by all eight held-out cases. Original answers were retained without retries to replace unfavorable answers.', '',
             'The sample is the first 20 baseline cases in existing file order plus all eight held-out cases, not a randomized or representative quality estimate. Baseline categories are direct_fact (8, including one unanswerable), temporal (7), and comparative (5). Conversation and adversarial suites were not run. The held-out fixtures were pre-existing and visible to the reviewer; this is not a newly blind holdout experiment.', '',
             'Codex read every generated answer and assessed it against the recorded question/history, expected behavior, original source documents, and bounded reference metadata. The frozen corpus is in source-evidence.json. Exact full selected context was not separately captured; the raw reports preserve bounded references and excerpts, so source support must not be equated with verified claim-level citation or entailment.', '',
             'The exact reviewer runtime model identifier is not available in this record. These are direct coding-assistant judgments, not results of the separate gpt-4.1-mini judge tool. No additional judge API calls were made. The answer model is gpt-4.1-mini; embeddings use text-embedding-3-large; retrieval k=10. Raw reports record revision, dirty-tree state, prompt/dataset/code fingerprints and packaged-index hashes. A dirty tree includes documentation changes; no pipeline change was made between suites.', '',
             'This exercise bypasses the deployed HTTP API. It does not test hosted rate limits, cookies, concurrency, production latency, or browser rendering. Owner evaluation makes paid calls outside the public-chat spending ledger. Recorded answer usage, where present, excludes embeddings and follow-up rewriting and is not a complete bill.', '',
             '## Fixed rubric and verdict rule', '',
             '| Dimension | 0 | 1 | 2 |', '|---|---|---|---|',
             '| Factual support | Material unsupported/false core claim | Minor unsupported detail or overstatement | Claims supported by the source, including clearly justified design inferences |',
             '| Completeness | Misses the main request | Omits a required part or qualification | Answers all essential parts |',
             '| Relevance and clarity | Largely irrelevant or misleading | Verbose, repetitive, or imprecise | Direct and clear |',
             '| Uncertainty and boundaries | Invents unknown facts or asserts an unsupported guarantee | Incomplete qualification | Appropriate limits and uncertainty |', '',
             'Strict pass: support=2, completeness=2, boundaries=2, relevance>=1. Stylistic verbosity alone does not fail an otherwise adequate answer. Missing an explicitly requested evidence boundary does. Scores are ordinal reviewer judgments, not calibrated probabilities. No composite score or unsupported-claim rate is reported; atomic claim counts were not annotated. A reasonable human reviewer may disagree with the strict failure on an implicit rather than explicit premise correction (eval-019).', '',
             'No individual reference-precision score is assigned: supporting sources are inspected, but the returned reference batch contains additional documents and is not a claim-level citation system. Verified registered destinations do not prove answer correctness.', '',
             '## Observed results', '',
             f'- Actual responses: **28/28 completed**, zero generation failures.',
             f'- AI-assisted strict verdicts: **{counts["pass"]}/28 pass ({counts["pass"]/28:.1%}); {counts["fail"]}/28 fail**.',
             f'- Baseline: **{summary["baseline_passes"]}/20** pass; held-out: **{summary["heldout_passes"]}/8** pass. Human-reviewed: **0**.',
             '- Baseline retrieval: MRR@10=1.0, section evidence coverage@10=1.0, labelled-quote coverage@10=1.0 across 19 eligible cases; one unanswerable case excluded. This is this sample only, not full-benchmark accuracy. Held-out cases have no comparable authored retrieval labels.', '',
             'Perfect sampled retrieval scores coexisted with answer failures. This is evidence that retrieving expected sections is insufficient to establish answer quality; it is not evidence that a reranker would fix these failures.', '',
             '| Local pipeline timing | Samples | Median ms | p95 ms |', '|---|---:|---:|---:|']
    for name, value in metrics.items():
        lines.append(f'| {name} | {value["samples"]} | {value["median"]:.1f} | {value["p95"]:.1f} |')
    lines += ['', 'Times are application-instrumented local pipeline observations with real external provider networking, not hosted browser latency or a controlled before/after speed improvement. p95 uses nearest rank and has only 28 observations.', '',
              '## Failure analysis and next experiments', '',
              '| Case | Failure | Candidate change, not yet implemented or validated |', '|---|---|---|',
              '| eval-004 | Unsupported present enrollment status | Require dated wording and avoid inferring current enrollment from a year range |',
              '| eval-015 | Missing explicit unknown freelance start date | State missing date before providing the supported relative sequence |',
              '| eval-019 | False database-credential premise not explicitly corrected | Correct the mistaken credential type in the opening sentence |',
              '| heldout-002 | Unsupported current zero paying-customer count | Distinguish missing metrics from evidence of zero |',
              '| heldout-003 | Overstated duplicate-prevention guarantees | Separate idempotency, atomicity, locking and outbox roles; qualify documented design |',
              '| heldout-008 | Evaluation tooling confused with measured accuracy | Lead with absence of a verified quality figure; distinguish tests from proof |', '',
              'These changes are hypotheses. This record establishes a first AI-assisted diagnostic baseline, not quality uplift, reviewer agreement, reduced evaluation time, or cost savings. If these cases guide tuning, retain them as development cases and create fresh validation cases. Any human validation must record actual human decisions separately.', '',
              '## Score register', '', '| Case | Support | Complete | Relevant/clear | Boundaries | AI verdict |', '|---|---:|---:|---:|---:|---|']
    for case_id, grade in grades.items():
        lines.append('| ' + case_id + ' | ' + ' | '.join(map(str, grade['scores'])) + ' | ' + grade['verdict'] + ' |')
    lines += ['', '## Preserved answers and written rationales', '']
    for case_id, grade in grades.items():
        report, row = by_id[case_id]
        lines += [f'### {case_id}', '', f'Run ID: `{report["run_id"]}`. Generation status: {row["status"]}. **AI verdict: {grade["verdict"]}.**', '',
                  '**Question:** ' + row['question'], '']
        if row['history']:
            lines += ['**Supplied history:**', '', '```json', json.dumps(row['history'], indent=2), '```', '']
        lines += ['**Expected behavior/reference answer:** ' + str(row['expected_behavior']), '', '**Actual assistant answer, unchanged:**', '']
        lines += ['> ' + line if line else '>' for line in row['answer'].splitlines()]
        lines += ['', '**AI scores:** ' + ', '.join(f'{name}={score}/2' for name, score in zip(reviews['score_order'], grade['scores'])) + '.', '',
                  '**Written rationale — AI-authored:** ' + grade['rationale'], '', '**Source evidence:**', '']
        for item in grade['evidence']:
            path = HERE / '../../../rag/knowledge' / item['path']
            assert path.exists()
            lines += [f'- [{item["path"]}](../../../rag/knowledge/{item["path"]}), {item["section"]}: “{item["quote"]}”' + (' ' + item['additional_support'] if item.get('additional_support') else '')]
        lines += ['', '**Suggested correction/improvement:** ' + grade['improvement'], '',
                  '**Human review:** pending; no human score is inferred.', '']
    lines += ['## Files and preservation', '',
              '- [baseline.json](baseline.json) and [heldout.json](heldout.json): byte-for-byte copies of actual generation reports; existing human-review fields stay pending.',
              '- [ai-reviews.json](ai-reviews.json): separate AI scores and rationales. It is deliberately not submitted to the human-review importer.',
              '- [source-evidence.json](source-evidence.json): frozen knowledge documents and SHA-256 hashes used to review answers.',
              '- [selected-cases.json](selected-cases.json): exact selected fixtures, including histories and reference answers.',
              '- [summary.json](summary.json): computed AI-only counts and local timings.',
              '- [manifest.json](manifest.json): hashes binding the preserved raw reports, evidence, reviews, and readable report.',
              '- [build_report.py](build_report.py): offline renderer/validator; no provider calls and no automated grade generation.', '',
              'All evaluated questions are public portfolio questions. The reviewed evidence contains owner-approved public knowledge; no provider credentials, private transcripts, or environment values are included. Original ignored reports also remain under rag/evaluation/reports. Do not treat repository files as visitor API routes.', '',
              '## Defensible description', '',
              '“Executed and documented a 28-response AI-assisted RAG evaluation using real model outputs, source-backed rationales, and a four-dimension rubric; identified six strict-rubric failures despite perfect expected-evidence retrieval metrics on the eligible 19-case baseline subset.”', '',
              'This describes one observed diagnostic exercise. It does not claim personally graded human evaluation or a verified improvement in answer quality.', '']
    (HERE / 'REPORT.md').write_text('\n'.join(lines))
    artifacts = ['baseline.json', 'heldout.json', 'ai-reviews.json', 'source-evidence.json', 'selected-cases.json', 'summary.json', 'REPORT.md', 'build_report.py']
    manifest = {'record_date': '2026-11-19', 'reviewer_type': 'AI-assisted evaluation',
                'generation_run_ids': [report['run_id'] for report in reports],
                'sha256': {name: hashlib.sha256((HERE / name).read_bytes()).hexdigest() for name in artifacts}}
    (HERE / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'completed': 28, 'ai_passes': counts['pass'], 'ai_failures': counts['fail'], 'human_reviewed': 0, 'timing_ms': metrics}, indent=2))


if __name__ == '__main__':
    main()
