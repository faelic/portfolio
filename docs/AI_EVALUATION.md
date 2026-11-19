# Portfolio Assistant Evaluation

## Before/after correction experiment — 19 November 2026

The [before/after comparison](evaluations/2026-11-19/COMPARISON.md) preserves the original evaluation committed as ee12446, three intermediate attempts, and a final rerun of the exact same 28 questions. The candidate adds general prompt examples and evidence-boundary clarifications to six knowledge documents, with a refreshed 33-chunk index. AI-assisted strict passes changed from 22/28 to 27/28; all six original failure cases now pass, but eval-016 regressed with unsupported legal/regulatory statements. MRR@10 on 19 eligible baseline cases decreased from 1.0 to 0.9474 while section/quote coverage remained 1.0. These are unblinded AI judgments on reused development cases, not independent human accuracy, fresh held-out validation, or proof of generalization. Four new 28-case rounds were generated; unsuccessful attempts remain visible. The fixes and comparison are local and uncommitted; no deployment is claimed.

## Recorded AI-assisted run — 19 November 2026

The [28-response evaluation report](evaluations/2026-11-19/REPORT.md) records actual paid generation through the local packaged-index pipeline: the first 20 baseline cases and all eight existing held-out cases. All 28 completed; direct AI-assisted review assigned 22 strict-rubric passes and six failures. These are AI judgments, not Favour's personal grades, independent human validation, or a before/after quality improvement. Raw generation reports retain pending human-review fields; separate AI reviews preserve scores, source evidence, and written rationales. The eligible 19-case baseline subset achieved MRR@10, section coverage, and labelled-quote coverage of 1.0, which did not prevent answer-level failures. The remaining baseline cases and the conversation/security suites were not run in this exercise. See the report for sampling, timing, provenance, artifacts, and limitations.

The Pxxl Free release path uses packaged exact squared-L2 retrieval. Artifact verification is not an answer-quality evaluation. Offline parity checks matched Chroma top-10 order for all 33 stored embedding vectors; these are corpus-vector queries, not held-out visitor questions. No new embeddings, generated answers or judge calls were used for the migration. Set RAG_INDEX_MODE=packaged when evaluating the production retrieval path.

## Current contract — 15 November 2026

Current artifacts include chunker version and ingestion/guardrail/link-registry hashes. Retrieval reports separate section-label coverage from normalized literal labelled-quote coverage. Neither is a generated-answer quality verdict. No paid baseline, model change or reranker was run as part of CI/security hardening.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

The owner-only report runner records the same streaming answer and selected passages used by the visitor API. Opening the app and describing a run make no provider calls. Evaluation never rebuilds the index or changes deployment.

## Suites

| Suite | Cases | Purpose |
|---|---:|---|
| baseline | 50 | Existing stable factual benchmark; section and labelled-quote retrieval scores |
| heldout | 8 | Additional ownership, missing-information, follow-up and scope cases |
| conversation | 12 | Existing greeting, identity, ambiguity and conversational fixtures |
| security | 24 | Existing adversarial and benign controls; poisoned evidence is injected only inside the owner evaluator |

Keep held-out fixtures out of prompt tuning and the ingested corpus. Do not silently replace baseline cases when comparing results.

## Describe without paid calls

From the `rag` directory:

```bash
uv run python -m evaluation.report --suite heldout --limit 2
```

This prints the suite and case count with `provider_calls: 0` and does not create a quality report.

## Deliberate live run

After checking the configured credentials and nonempty compatible index, the following explicit command makes paid embedding, optional follow-up rewrite and answer requests:

```bash
uv run python -m evaluation.report --suite baseline --limit 50 --output evaluation/reports/baseline.json --run-live
```

Use a new output path for each run. JSON and Markdown artifacts are written after each case; provider failures retain completed results and exception class without raw exception bodies. An interrupted or partial run is not reported as a complete success. No automatic judge requests are added by this runner; the existing separate judging tools remain available.

Artifacts record configured model identifiers, dataset and prompt hashes, corpus fingerprint, retrieval settings, source revision, dirty-tree state, exact answers, public references and measured timings. Actual provider usage is included only when the answer stream supplies it; it excludes rewriting and is not a total bill. The spending ledger's conservative reservations are not usage measurements. p95 is omitted for fewer than 20 observations. Section metrics measure metadata matches. labelled_quote_coverage separately checks whitespace-normalized, case-insensitive literal labelled quotes in matching retrieved passages. It can miss paraphrases or quotes split across chunks and does not establish entailment or answer correctness. Unanswerable cases are N/A; unmeasured legacy quote scores remain N/A, not zero.

## Human review

The [retrospective human-evaluation record](HUMAN_EVALUATION_RECORD.md) preserves two owner-pasted answers and one reported conversational issue from earlier sessions, with owner feedback separated from AI analysis. It is qualitative historical evidence, not a completed scored study. Favour reports a broader 20–30-response exercise; its case-level scores and outputs have not been recovered. No accuracy or improvement metric is inferred from that report.

Copy a report's `run_id` and add reviews in a separate JSON file:

```json
{
  "run_id": "the-exact-report-run-id",
  "cases": [
    {
      "id": "eval-001",
      "verdict": "pass",
      "factual_claims": 3,
      "unsupported_claims": 0,
      "appropriate_uncertainty": true,
      "reference_correctness": true,
      "notes": "Explain what was checked, including any qualification."
    }
  ]
}
```

Apply reviews offline:

```bash
uv run python -m evaluation.report --review-report evaluation/reports/baseline.json --reviews review.json
```

Reviews must identify the exact run and known case IDs. Pending reviews are not quality passes. The unsupported-claim rate includes only human-reviewed factual claims with valid counts. Check ownership, dated status, supported claims, unknowns, reference relevance and unsafe behavior separately.

Compare a measured baseline before changing models, prompts, chunking or retrieval. Change one meaningful variable per experiment. Keep failure examples and human disagreements. Publish only a manually reviewed, sanitized summary; full local artifacts can contain adversarial prompts or simulated private-looking input and should not be served by the visitor app.

## Public evidence contract

The API may emit one `references` event before text, containing at most ten bounded passages from the context actually supplied to generation. Each item has a registered identity, canonical title/destination, up to three bounded section labels and a 400-character excerpt, within a 12,000-byte UTF-8 batch budget. No model-provided URL or filesystem path becomes a reference destination. Legacy text-only streams remain readable. References are not claim-level citations or proof of factual correctness.

The single registry is `rag/implementation/public_sources.json`; the frontend bundles that public manifest and the Python container copies it with implementation code. Optional reference history is untrusted, bounded and revalidated on restoration. Old conversations without references still load, and reference metadata is excluded from subsequent model history. Clear removes it with the conversation.

New clients request the reference extension with `X-Portfolio-References: 1`; the API permits this header in its exact-origin CORS configuration. Requests without it retain the original delta/done/error protocol, supporting rolling frontend/API upgrades.


## Reproducible comparisons and remaining baseline

Prepare tokenizer assets using the commands in RAG_SECURITY.md before offline tests. The checked-in prompt snapshot now reflects the reviewed current prompt; behavioral fixtures remain independent. The corpus contains 13 documents / 33 current chunks. Compare k=3, 5 and 10 only as deliberate owner experiments with a fixed reviewed dataset; production remains k=10 and no reranker is introduced.

Report manifests include CHUNKER_VERSION plus hashes for ingestion, fingerprinting, guardrails and link registries as well as the original answer/configuration code. The existing version-1 index fingerprint is preserved by this change. Generated-reference excerpts remain public and are not access controls. Clickable model links now require an exact approved destination in approved_links.json or public_sources.json.

No live evaluation was run by this hardening batch. Start with a deliberately budgeted reviewed subset, including ownership, unknowns and poisoned history; then run the held-out set without tuning against it. Preserve failures and human disagreement. CI success is not a substitute for those results.


## Retrieval provenance, schema version 2

Every new JSON report and its readable Markdown companion record the retrieval mode and artifact hashes. The JSON records retrieval_index.mode (chroma or packaged), SHA-256 hashes of the active index artifacts, and implementation/packaged_index.py alongside the existing source hashes. Packaged mode validates the source-bound artifact before a paid run, then hashes knowledge.json and its sidecar. Local Chroma mode hashes existing persisted files without opening a Chroma client or calling providers; no absolute local paths are published. Keep the local index quiescent during a run: these file hashes are not an online database backup. Older schema-version-1 reports lack these fields and must not be assumed to describe the packaged production retriever. The quote/section scoring format and human-review boundaries are unchanged.
