# Portfolio knowledge base

Current backend/CI hardening (15 November 2026): see the [security and release contract](../docs/RAG_SECURITY.md). It covers reproducible tokenizer/signing-secret setup, 5 global / 1 visitor / 2 IP active requests, approved generated links, read-only readiness and evaluation evidence boundaries. Earlier dated results remain historical.

This directory contains Favour Chukwuemerie Ututu's curated portfolio knowledge and local LangChain ingestion/answering pipeline. The corpus contains 13 topic documents, based on the original supplied Markdown and individually confirmed additions. The pipeline has offline unit coverage. A separate [local streaming API](../docs/ASSISTANT.md) now connects the React assistant window to the same grounded pipeline; Gradio remains the developer workbench. Integration verification does not run live ingestion or paid model evaluation.

## Frontend integration

From this folder run `uv sync --locked`, then `uv run python api.py`. From the repository root run `npm run dev`. The API binds only to `127.0.0.1:8000`; Vite proxies `/api`. Set `OPENAI_API_KEY` in the shell or `rag/.env` and deliberately ingest the OpenAI `docs` index before sending real questions. See the [assistant guide](../docs/ASSISTANT.md) for streaming/history behavior, safe rendering, limits, and update → ingestion → Gradio → batch evaluation workflow. Public deployment remains separate.

The intended assistant helps visitors understand Favour, his experience, his contributions, and his projects. It provides concise supported answers and directs deeper implementation questions to the relevant GitHub repository. The corpus positions Favour as a Full-stack Software Engineer and AI Engineer and includes his Python-based Portfolio RAG Assistant. Public assistant availability was confirmed by Favour on 11 November 2026; this is not an independent deployment or uptime check.

## Reading and ingestion boundary

Only `rag/knowledge/**/*.md` is candidate retrieval content. Read recursively from the repository root. Exclude `sources/`, `evaluation/`, and the guidance documents beside this README: indexing them would introduce duplicate facts, editorial instructions, and evaluation answers.

Folders organize maintenance; future retrieval must search across them rather than require a visitor to select the correct folder. A Markdown link does not cause its target to be loaded or searched automatically.

| Document ID | Content |
|---|---|
| `profile-overview` | [Identity and biography](knowledge/profile/overview.md) |
| `profile-perspective` | [Engineering perspective and personal interests](knowledge/profile/engineering-perspective-and-interests.md) |
| `expertise-engineering` | [Engineering areas and technical skills](knowledge/expertise/engineering-and-technical-skills.md) |
| `experience-flamong-policy-ng` | [Flamong and Policy.ng contribution](knowledge/experience/flamong-policy-ng.md) |
| `project-monierave` | [Monierave](knowledge/projects/monierave.md) |
| `project-bucketflow` | [BucketFlow](knowledge/projects/bucketflow.md) |
| `project-blockscan` | [BlockScan](knowledge/projects/blockscan.md) |
| `project-approval-cleanup` | [Approval Cleanup](knowledge/projects/approval-cleanup.md) |
| `project-escrow` | [Escrow](knowledge/projects/escrow.md) |
| `education-training` | [Education and training](knowledge/education/education-and-training.md) |
| `project-portfolio-rag-assistant` | [Portfolio RAG Assistant](knowledge/projects/portfolio-rag-assistant.md) |
| `portfolio-assistant-status` | [Assistant availability and visitor purpose](knowledge/portfolio/assistant-status.md) |
| `opportunities-contact` | [Availability and contact](knowledge/opportunities/availability-and-contact.md) |

## Supporting material

- [Data contract](DATA_CONTRACT.md): metadata, authoring rules, and the implemented local pipeline contract.
- [Source map](SOURCE_MAP.md): every source section, consolidation decisions, integrity checksum, and coverage gaps.
- [Retrieval evaluation cases](evaluation/retrieval-cases.md): 24 questions covering topic lookup, aliases, public contact, supported GitHub referrals, and missing information.
- [Original source](sources/original-portfolio-knowledge.md): the supplied Markdown, preserved byte-for-byte outside the corpus.
- [Owner-confirmed details](sources/confirmed-portfolio-details.md): individually approved additions and corrections from 10 and 11 November 2026, including positioning, RAG implementation, and public availability confirmation boundaries.

## Python environment

The RAG folder uses `uv` with Python 3.12 or newer. From the repository root:

```bash
cd rag
uv sync --locked --group workbench
uv run python -c "from dotenv import load_dotenv; from openai import OpenAI; print('Imports successful')"
```

`python-dotenv` provides `.env` loading; LangChain integrates OpenAI embeddings/chat models and Chroma storage. Dependency installation makes no model API requests. Provider objects are created lazily. Existing shell variables take priority over `rag/.env`, followed by the repository `.env`.

Keep `pyproject.toml` and `uv.lock` in Git. The local `.venv/`, Python bytecode caches, and notebook checkpoints are ignored.

## Local pipeline

Shared settings in [config.py](implementation/config.py) select `vector_db`, the `docs` collection, `text-embedding-3-large`, and `gpt-4.1-mini`. The notebook's MiniLM `langchain` collection is separate. [Ingestion](implementation/ingest.py) loads the complete curated corpus, strips YAML, creates source-grounded chunks of at most 350 tokens including heading context, and uses up to 40 tokens of overlap within long sections. Short documents stay whole. LangChain's Markdown heading splitter handles longer documents before recursive splitting; limitations stay in their source sections without duplicated scope text. Detailed provenance remains outside vector metadata.

The following command is for an intentional ingestion run and requires an OpenAI API key. It requests embeddings and synchronizes only `docs`; it was not run as part of this refactor:

```bash
uv run python -m implementation.ingest
```

Synchronization upserts the complete current chunk snapshot before deleting obsolete IDs. Embedding, insertion, or verification failures do not trigger stale-record deletion. It is rerunnable, but not an atomic deployment: readers may see mixed revisions during ingestion, and a cleanup failure requires a rerun. Do not pass a partial corpus to `create_embeddings()`.

[Answering](implementation/answer.py) requires an existing, nonempty `docs` collection. It retrieves up to ten passages and uses one answer call for standalone questions. A nonempty user/assistant history adds one standalone-query rewrite before the single search; the final answer still receives the original question. No LLM reranking is used. Both providers have a 30-second request timeout and at most two retries.

Public interfaces are `fetch_context(question, history=None)` returning LangChain documents, and `answer_question(question, history=None)` returning `(answer_text, retrieved_documents)`. Module and direct-script imports are supported. Importing modules does not construct providers or open the database. The evaluation code uses these same interfaces and scores the passages returned by answering in combined runs.

Streaming, Gradio chat and complete-answer evaluation share the owner-supplied response prompt, installed verbatim on 12 November. The query-rewrite prompt remains separate. Successfully retrieved empty context reaches answering as `excerpts: []`, rather than bypassing the model with a fixed sentence; index-readiness and provider errors remain errors. There is no greeting classifier. Twelve separate `evaluation/conversation-cases.jsonl` fixtures exercise greetings, identity, follow-ups and scope in offline prompt-construction tests. They do not alter the 50-case benchmark, run automatically in Gradio, or establish live-model quality.

## Local evaluation

[Evaluation questions](evaluation/test.jsonl) contain 50 records: 44 answerable, four partial, and two unanswerable, across seven categories. The loader preserves IDs, answerability, evidence alternatives, and quotes; malformed records report their line numbers. [The evaluator](evaluation/eval.py) keeps sequential execution and exposes functions used by the local Gradio testing interface.

Retrieval uses **document-and-section matching** against chunk metadata. An alternative matches when its `document_id` agrees and its exact section appears in `section_paths`. Alternatives are interchangeable within a required evidence group; duplicate passages cannot increase that group's coverage. Quotes remain for authoring validation, not runtime matching.

- **Reciprocal rank@k:** `1 / rank` of the first matching passage, or zero if no passage matches.
- **Section-based evidence coverage@k:** matched required groups divided by total required groups, from zero to one. This is a section-retrieval proxy, not proof that every required fact is present.
- **MRR:** the mean reciprocal rank across eligible questions. `summarize_retrieval()` also returns mean coverage, category breakdowns, and eligible/excluded counts, weighting each eligible question equally. Inputs must use the same cutoff.

The default cutoff is the shared retrieval count (currently ten); smaller positive cutoffs score the same retrieved list after truncation. Partial cases score their supported evidence groups. Unanswerable cases have unavailable retrieval scores and are excluded from averages. Keyword scores and nDCG are no longer reported.

`evaluate_retrieval(test, k=..., retrieved_docs=None)` searches only when documents were not supplied and the case is eligible. `evaluate_answer(test)` returns `(AnswerEval, answer_text, documents)`. Existing batch generators retain `(test, result, progress)` yields. The answer judge uses LangChain structured output with `gpt-4.1-mini`, temperature zero, a 30-second timeout, and at most two retries. It receives the reference, generated answer, answerability, and retrieved context; it scores accuracy, completeness, relevance, and grounding independently from 1–5. Appropriate uncertainty is rewarded for partial and unanswerable questions. Judge scores are model opinions and should be checked against the displayed answer and passages.

For a **deliberate live evaluation** after the OpenAI index exists, this command uses a zero-based row number and makes retrieval, answer, and judge requests. It was not run during implementation:

```bash
uv run python -m evaluation.eval 0
```

Direct execution (`uv run python evaluation/eval.py 0`) is also supported. The CLI answers once, scores those same passages, and displays the stable question ID, answerability, ranked passage identities, answer, and judge feedback. It does not ingest or rebuild an index. Imports alone do not construct providers or open the database. Provider and validation failures surface without additional retry loops.

## Gradio testing UI

From the `rag` folder:

```bash
uv sync --locked --group workbench
uv run python app.py
```

The [local app](app.py) binds to `127.0.0.1`, opens a browser, and does not create a public share link. Opening it, browsing evaluation cases, and clearing chat do not call providers. It never ingests or rebuilds the index.

- **Assistant:** send a question, test follow-ups, and inspect ranked passages with source paths, section labels, and chunk IDs. Clear resets both conversation and evidence. Session state retains plain-text history independently of Gradio's display format.
- **Evaluation:** select one of the 50 authored cases, inspect its reference and labels, and explicitly run retrieval only or answer plus judging. The latter scores the same passages returned by answering, without a second search. Results include case ID, answerability, retrieval scores, and optional answer scores. This first UI does not run the full suite or show aggregate MRR.

Actual actions require the existing OpenAI `docs` index and the configured API key. Retrieval-only uses a query embedding; answer plus judging adds answer and judge calls. Chat follow-ups can add a query rewrite. Unanswerable retrieval-only cases skip providers and show unavailable scores. Missing-index and provider errors appear in the UI. Merely changing a case or mode clears previous results instead of running it.

Gradio is a direct dependency; it also installs its own dependencies, including pandas. The RAG loader and core scoring functions use LangChain documents and Python lists/dictionaries. The batch dashboard uses pandas only to adapt category rows for Gradio charts; pandas is declared directly for that use. This is a development workbench, separate from the portfolio website.

### Batch dashboard

For a separate dashboard that runs the entire question set, use:

```bash
uv run python evaluator.py
```

[The batch dashboard](evaluator.py) reuses the existing sequential evaluation generators. Opening it makes no provider calls. Its retrieval button requests query embeddings for eligible cases; its answer button requests generation and judging for every case. It requires the existing `docs` index and never runs ingestion. The dashboard binds only to localhost without a share link.

Retrieval summaries reuse `summarize_retrieval()`, excluding unanswerable cases while retaining their rows as not applicable. Answer summaries include all questions and all four score fields, with equal weight per question. Category bar charts show MRR and evidence coverage, plus accuracy, completeness, relevance, and grounding. Category tables retain counts and averages; individual tables retain test IDs, answerability, scores, and judge feedback. Tables use Python rows; small pandas adapters feed those same averages to the charts without recomputing scores. Unavailable retrieval averages are omitted from charts, while genuine zeros remain visible. Retrieval axes span 0–1 and answer axes span 0–5 (scores themselves remain 1–5). Empty runs show unavailable averages. Failed runs report the completed count instead of reporting success; previous outputs clear before a new run. No arbitrary traffic-light or pass/fail thresholds are assigned. The dashboard displays in-memory results only and does not save reports.

## Offline implementation checks

The tests mock storage and model calls and block network connections. They check implementation behavior, not retrieval quality or factual answer performance. On a new machine, first cache the public tokenizer vocabulary (a file download, not an embedding/chat API call):

```bash
uv run python -c "from implementation.ingest import get_tokenizer; get_tokenizer()"
uv run python -m unittest discover -s tests -v
```

## Maintaining the dataset

Edit the appropriate topic document rather than the archived source. Keep stable document IDs, name the subject of a section explicitly, and keep contribution boundaries and limitations alongside the relevant claims. Every corpus document has a folder category (`category`), a list of subjects and concepts (`topics`), and named subjects (`entities`). Approved alternative names use optional `aliases`; all approved source references use a single `provenance` list of `path` and `sections` objects. Reuse topic labels consistently across files and ground them in the document text; see the data contract for labeling and future chunk metadata rules. The implementation modules parse this schema; the experimental notebook is maintained separately and was not changed by this refactor. Confirm each new portfolio detail with Favour, record its provenance, and update the source map and evaluation cases. Source references establish provenance, not independent verification.

The original archive supplied no reliable as-of date. The supplemental source records owner confirmations from 10 November 2026 for specific facts, including employment, opportunities, public location, links, and AI project status. Education year ranges and self-taught/freelance beginnings were additionally confirmed on 11 November 2026. This does not date or verify every original claim. Review mutable statements before treating them as current indefinitely.

Preserve concise context in biography and expertise documents, and keep project-specific explanations in their corresponding documents. Full implementation breakdowns belong in the linked repositories. Share Nigeria as the public country of residence; do not add a city from other repository files. Do not expand the corpus with paraphrased FAQs solely to match evaluation questions.

## Completion and limits

The local pipeline implements deterministic chunking and grounded-answer prompt construction. Actual retrieval relevance and generated-answer quality remain unmeasured until a separate live evaluation is run. Local frontend integration uses the new streaming path; no index rebuild, paid evaluation, or public deployment is part of its offline verification.

## Positioning and corpus refresh — 11 November 2026

Profile and expertise lead with **Full-stack Software Engineer and AI Engineer** and connect Python/LLM skills to the Portfolio RAG Assistant project. Current visitor-facing copy describes implemented work without learner or first-application framing. Historical education, self-taught/freelance beginnings, and completed training remain; professional contribution boundaries and project limitations remain explicit.

The assistant-status document supplies owner-confirmed availability and the visitor workflow, while the new project document supplies implementation and contribution evidence. Source records retain superseded historical confirmations outside ingestion. Evaluation references follow the revised corpus. Prompt guidance favors professional identity, concrete examples and relationships, and concise answers without repetitive benefit statements.

These edits do not refresh the vector index. Until an explicitly authorized ingestion run, retrieval can still return the previous corpus text. After that run, restart running assistant/evaluation processes before checking the two example questions. No ingestion, paid model calls, or live quality evaluation were performed by this content update.

## Local security hardening

See [security boundaries](SECURITY.md) for the threat model, budgets, residual risks, and backend prerequisites. System instructions are static; selected evidence and bounded history are serialized as untrusted JSON data. Chat text is explicitly escaped before display, without active Markdown or HTML. Developer queues hold at most 16 pending jobs, and UI errors suppress raw exception details.

Ingestion rejects symlinks and oversized corpora, requires compatible collection embedding metadata, and skips embedding chunks whose IDs and vector metadata are unchanged. It still verifies the complete expected ID set before stale cleanup. Generated `vector_db/` files are ignored and removed from Git tracking, while local files remain intact. No history rewrite is performed.

The separate [security cases](evaluation/security-cases.jsonl) contain 18 adversarial and six benign fixtures. Offline tests check deterministic safeguards and untrusted-data placement; they do not establish live-model injection resistance. No ingestion, paid requests, backend integration, or live security evaluation is part of this hardening change.

## Pxxl deployment package — 12 November 2026

The production configuration, durable rate/spend controls, container packaging, and operator rollout checks are documented in [the deployment guide](../docs/PXXL_DEPLOYMENT.md). This supersedes earlier local-only transport boundaries above; actual public deployment and host controls require the checks in that guide. Evaluation improvements remain deferred.
