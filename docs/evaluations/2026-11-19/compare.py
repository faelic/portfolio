"""Offline comparison of preserved runs and AI grades; no provider calls."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


def rows(folder):
    reports = [read(folder / f'{suite}.json') for suite in ('baseline', 'heldout')]
    assert [len(report['cases']) for report in reports] == [20, 8]
    assert all(report['status'] == 'complete' for report in reports)
    return reports, {case['id']: case for report in reports for case in report['cases']}


def grades(folder):
    review = read(folder / 'ai-reviews.json')
    assert review['reviewer_type'] == 'AI-assisted evaluation' and not review['human_reviewed']
    result = {case['id']: case for case in review['cases']}
    assert len(result) == 28
    for case in result.values():
        support, completeness, relevance, boundaries = case['scores']
        assert all(type(score) is int and 0 <= score <= 2 for score in case['scores'])
        passed = support == completeness == boundaries == 2 and relevance >= 1
        assert case['verdict'] == ('pass' if passed else 'fail')
    return result


def main():
    before_reports, before = rows(HERE)
    original = grades(HERE)
    after_folder = HERE / 'after'
    after_reports, after = rows(after_folder)
    current = grades(after_folder)
    assert before.keys() == after.keys() == current.keys() == original.keys()
    source = read(after_folder / 'source-evidence.json')
    for document in source['documents'].values():
        assert hashlib.sha256(document['text'].encode()).hexdigest() == document['sha256']
    for case_id, row in after.items():
        assert row['status'] == 'complete' and row['answer'].strip()
        assert row['human_review']['verdict'] == 'pending'
        for field in ('question', 'history', 'expected_behavior'):
            assert row[field] == before[case_id][field], (case_id, field)
    for report in after_reports:
        for key in ('answer_model', 'embedding_model', 'retrieval_k', 'chunk_size', 'chunk_overlap', 'dataset_sha256'):
            old = next(r for r in before_reports if r['suite'] == report['suite'])
            assert report[key] == old[key], key
    assert after_reports[0]['prompt_sha256'] == after_reports[1]['prompt_sha256']
    assert after_reports[0]['corpus_fingerprint'] == after_reports[1]['corpus_fingerprint']
    assert after_reports[0]['retrieval_index'] == after_reports[1]['retrieval_index']
    assert hashlib.sha256((after_folder / 'system-prompt.txt').read_bytes()).hexdigest() == after_reports[0]['prompt_sha256']
    old_pass = sum(c['verdict'] == 'pass' for c in original.values())
    new_pass = sum(c['verdict'] == 'pass' for c in current.values())
    fixed = [i for i in before if original[i]['verdict'] == 'fail' and current[i]['verdict'] == 'pass']
    regressions = [i for i in before if original[i]['verdict'] == 'pass' and current[i]['verdict'] == 'fail']
    remaining = [i for i in before if original[i]['verdict'] == current[i]['verdict'] == 'fail']
    attempts = []
    for name in ('attempt-1', 'attempt-2', 'attempt-3'):
        reports, cases = rows(HERE / name)
        review = grades(HERE / name)
        assert cases.keys() == before.keys()
        for case_id, row in cases.items():
            assert all(row[f] == before[case_id][f] for f in ('question', 'history', 'expected_behavior'))
        if name != 'attempt-3':
            assert all(r['corpus_fingerprint'] == before_reports[0]['corpus_fingerprint'] for r in reports)
        assert hashlib.sha256((HERE / name / 'system-prompt.txt').read_bytes()).hexdigest() == reports[0]['prompt_sha256']
        attempts.append({'name': name, 'passes': sum(c['verdict'] == 'pass' for c in review.values()),
                         'run_ids': [r['run_id'] for r in reports]})
    summary = {'reviewer_type': 'AI-assisted evaluation', 'human_reviewed': 0,
               'before_passes': old_pass, 'after_passes': new_pass, 'cases_per_round': 28,
               'percentage_point_change': (new_pass - old_pass) / 28 * 100,
               'original_failures_now_passing': fixed, 'original_failures_remaining': remaining,
               'new_regressions': regressions, 'intermediate_attempts': attempts,
               'new_generation_count': 112, 'before_retrieval': before_reports[0]['retrieval_summary'],
               'after_retrieval': after_reports[0]['retrieval_summary'],
               'before_run_ids': [r['run_id'] for r in before_reports],
               'after_run_ids': [r['run_id'] for r in after_reports]}
    (after_folder / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    lines = ['# Before/after — evidence-boundary corrections', '',
             '19 November 2026. **AI-assisted evaluation, not personal grading by Favour or independent human validation.**', '',
             '## What changed', '',
             'The original evaluation was committed first as ee12446. The candidate adds hypothetical evidence-boundary examples to the shared answer prompt and clarifies missing facts/limits in six knowledge documents: education status, freelance start date, API-versus-database credentials, transfer/notification semantics and undocumented customer metrics, evaluation tooling versus measured quality, and the limits of a test-network designation. No new biographical facts, real customer counts, graduation status, legal claims, or measured accuracy figures were added to the source material.', '',
             'The knowledge index was rebuilt through existing incremental ingestion, then exported/verified through the existing packaged-index exporter. It still contains 13 documents and 33 chunks. The original local vector/index directories were backed up before ingestion. No reranker, answer cache, model change, post-generation rewriting, question-specific response handler, or extra verification service was added.', '',
             'Both answer paths use the shared prompt. The prompt snapshot regression was updated. Backend suite: 151 tests ran successfully, 13 skipped. All 52 frontend unit tests passed. Packaged-index export and verification succeeded. These checks do not establish live-model quality. Existing dependency ResourceWarnings remain separate from test failures.', '',
             '## Experiment integrity', '',
             'All five rounds used the exact same 20 baseline questions and eight existing held-out questions, including supplied history and expected answers. Models, k=10, and chunk settings were unchanged. Before and final raw JSON retain provenance and pending human-review fields. Corpus and prompt hashes changed in the final round, so the final comparison measures their combined candidate, not the isolated causal effect of one variable.', '',
             'The same coding assistant reviewed outputs with the original four 0–2 dimensions and strict pass rule (support=2, completeness=2, boundaries=2, relevance>=1). Scoring was unblinded, not independent, and informed the fixes. These questions are now development/regression cases, not a fresh holdout. One observation per case cannot establish reliable improvement, generalization, or production accuracy. Repeat runs and fresh human-reviewed questions remain necessary.', '',
             'The final review considers explicit corrections wherever they occur in the answer; opening with the correction is a style recommendation, not an extra pass condition. Date wording is treated conservatively when current status remains ambiguous. Sources are inspected for support; reference batches are not claim-level citations and full selected context is not separately captured.', '',
             '## Every attempt retained', '',
             '| Round | AI strict passes | Notes |', '|---|---:|---|',
             f'| Original | {old_pass}/28 | Committed diagnostic baseline |',
             f'| First prompt-only change | {attempts[0]["passes"]}/28 | General evidence checklist; unsuccessful; outputs and grades retained |',
             f'| Second prompt-only change | {attempts[1]["passes"]}/28 | Hypothetical examples; residual failures retained |',
             f'| First clarified-corpus change | {attempts[2]["passes"]}/28 | Customer-count contradiction and regulatory wording persisted |',
             f'| Final prompt + evidence clarifications | {new_pass}/28 | Candidate compared below; no failed response replaced by a retry |', '',
             'Four additional 28-response rounds were generated (112 new responses, plus the original 28: 140 responses preserved in total). This includes unsuccessful experiments. Owner evaluation and ingestion make paid provider calls outside public-chat ledger limits; available answer-only usage is not a complete bill. No cost savings or speed improvement is inferred.', '',
             '## Observed before/after', '',
             f'- AI strict pass count: **{old_pass}/28 → {new_pass}/28**; change **{(new_pass-old_pass)/28*100:+.1f} percentage points** on these reused cases.',
             '- Original failures now passing: ' + (', '.join(fixed) or 'none') + '.',
             '- Original failures remaining: ' + (', '.join(remaining) or 'none') + '.',
             '- New regressions versus original: ' + (', '.join(regressions) or 'none') + '.', '',
             f'- Baseline retrieval MRR@10: **{before_reports[0]["retrieval_summary"]["mrr"]:.4f} → {after_reports[0]["retrieval_summary"]["mrr"]:.4f}** across the same 19 eligible cases. First labelled evidence moved from rank 1 to rank 2 for eval-013 and eval-014. Section and labelled-quote coverage stayed at 1.0. The candidate did not improve every metric.', '',
             'These are observed AI-review outcomes, not verified human accuracy, reviewer agreement, statistical significance, or an independently reproduced quality improvement.', '',
             '**Unresolved regression: eval-016.** The final answer turns test-network scope into unsupported statements about regulatory backing/approval and custody. The source explicitly says no legal assessment is recorded, but the model still overstates it. The six original diagnoses now pass; the candidate is not a clean 28/28 pass. Further prompt-only success is not assumed, and no production rollout was performed.', '',
             '| Case | Before scores S/C/R/U | After scores S/C/R/U | Before → after verdict |', '|---|---|---|---|']
    for case_id in before:
        old, new = original[case_id], current[case_id]
        lines.append(f'| {case_id} | {"/".join(map(str,old["scores"]))} | {"/".join(map(str,new["scores"]))} | {old["verdict"]} → {new["verdict"]} |')
    lines += ['', 'S=factual support; C=completeness; R=relevance/clarity; U=uncertainty/boundaries. Each score is out of 2. The full original rubric and rationales remain in [the original report](REPORT.md).', '',
              '## Actual answers and AI-written comparison rationales', '']
    for case_id, row in after.items():
        old, new = original[case_id], current[case_id]
        lines += [f'### {case_id}', '', '**Question:** ' + row['question'], '']
        if row['history']:
            lines += ['**Unchanged supplied history:**', '', '```json', json.dumps(row['history'], indent=2), '```', '']
        lines += ['**Before — unchanged actual answer:**', '']
        lines += ['> ' + line if line else '>' for line in before[case_id]['answer'].splitlines()]
        lines += ['', '**After — unchanged actual answer:**', '']
        lines += ['> ' + line if line else '>' for line in row['answer'].splitlines()]
        lines += ['', f'**AI verdict:** {old["verdict"]} → {new["verdict"]}. **After scores S/C/R/U:** ' + '/'.join(map(str,new['scores'])) + '.', '',
                  '**AI-written rationale:** ' + new['rationale'], '',
                  '**Evidence:** ' + '; '.join(item['path'] + ' — ' + item['section'] for item in old['evidence']) + '. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).', '',
                  '**Human review:** pending.', '']
    lines += ['## Artifacts and verification', '',
              '- [Original report](REPORT.md), [original AI grades](ai-reviews.json), and original manifest remain unchanged.',
              '- [First prompt-only attempt](attempt-1/baseline.json), [held-out outputs](attempt-1/heldout.json), [AI grades](attempt-1/ai-reviews.json), [prompt](attempt-1/system-prompt.txt).',
              '- [Second prompt-only attempt](attempt-2/baseline.json), [held-out outputs](attempt-2/heldout.json), [AI grades](attempt-2/ai-reviews.json), [prompt](attempt-2/system-prompt.txt).',
              '- [First clarified-corpus attempt](attempt-3/baseline.json), [held-out outputs](attempt-3/heldout.json), [AI grades](attempt-3/ai-reviews.json), [prompt](attempt-3/system-prompt.txt), [source snapshot](attempt-3/source-evidence.json).',
              '- Final [baseline outputs](after/baseline.json), [held-out outputs](after/heldout.json), [AI scores/rationales](after/ai-reviews.json), [source snapshot](after/source-evidence.json), [prompt](after/system-prompt.txt), [implementation patch](after/implementation.patch), and [computed summary](after/summary.json).',
              '- [Comparison manifest](after/manifest.json) binds all attempts and source/score artifacts by SHA-256. [compare.py](compare.py) validates and regenerates this comparison offline without generating answers or scores.', '',
              'Generation failures, if any, must remain failures rather than silently disappearing from the denominator. This record contains 28 completed answers per round. No deployed service was changed and no fix commit or push was made by this comparison script.', '']
    (HERE / 'COMPARISON.md').write_text('\n'.join(lines))
    paths = [HERE / 'COMPARISON.md', HERE / 'compare.py']
    paths += [HERE / name for name in ('baseline.json','heldout.json','ai-reviews.json','source-evidence.json','manifest.json')]
    for name in ('attempt-1', 'attempt-2', 'attempt-3', 'after'):
        paths += [p for p in (HERE / name).iterdir() if p.is_file() and p.name != 'manifest.json']
    manifest = {'evaluation_type': 'AI-assisted evaluation', 'sha256': {
        str(path.relative_to(HERE)): hashlib.sha256(path.read_bytes()).hexdigest() for path in sorted(paths)}}
    (after_folder / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
