# Knowledge document and chunking contract

## Corpus interface

The sole content boundary is `rag/knowledge/**/*.md`, resolved from the repository root. All 13 documents are UTF-8 Markdown with YAML frontmatter. Source records, evaluation cases, and authoring guidance are excluded. This contract describes the authoring schema and the local LangChain loader, chunking, and answering implementation. It does not establish deployed visitor-facing functionality or measured retrieval quality.

| Frontmatter field | Type | Meaning |
|---|---|---|
| `id` | Nonempty string | Unique, stable document identity. Preserve it across title or path changes. |
| `title` | Nonempty string | Human-readable document title, matching the single H1. |
| `category` | String | Single folder-level category: `profile`, `expertise`, `experience`, `projects`, `education`, `portfolio`, or `opportunities`. Matches the document's top-level topic folder. |
| `topics` | Nonempty list of unique, nonempty strings | Subjects and concepts explicitly discussed in the body, such as `Frontend engineering`, `AI safety`, or `Video games`. Topics can span folder categories and support future subject filtering. |
| `entities` | Nonempty list of strings | Named subjects present in the document, such as Favour, a product, an institution, or a specific technology. These identify who or what is discussed. |
| `aliases` | Optional nonempty list of unique, nonempty strings | Approved alternative names for the document's main subject. For Approval Cleanup, these are `Cleanup` and `Allowance Cleanup`. Keep its canonical title and ID stable. |
| `provenance` | Nonempty list of objects | Every object has a repository-root-relative `path` to an approved record under `rag/sources/` and a nonempty `sections` list of contributing heading paths. Use the same structure for original and owner-confirmed information. |

Example from the project corpus:

```yaml
---
id: "project-monierave"
title: "Monierave — Full-stack banking simulation"
category: "projects"
topics:
  - "Backend engineering"
  - "Frontend engineering"
  - "Banking simulation"
  - "Database transactions"
  - "Double-entry ledger"
  - "Idempotency"
  - "Concurrency control"
  - "Background processing"
  - "Authentication and sessions"
  - "Software testing"
entities: ["Favour Chukwuemerie Ututu", "Monierave"]
provenance:
  - path: "rag/sources/original-portfolio-knowledge.md"
    sections:
      - "Independent projects > Monierave — Full-stack banking simulation"
      - "What Favour works on > Backend engineering"
      - "About Favour"
---
```

The fields have distinct roles: `category: "profile"` locates the perspective document's folder category, `topics: ["AI safety", "Video games"]` describes some of its subjects, and `entities: ["Favour Chukwuemerie Ututu"]` identifies the person whose perspective it records. Topics and entities provide search context; neither establishes expertise depth, ownership, implementation status, or independent verification.

Frontmatter and guidance are not answer prose. A future loader should parse frontmatter separately and deliberately select title, approved alias, entity, and relevant topic context to include in searchable text. Document IDs identify logical documents; they do not identify versions or verify claims.

## Approved sources and dated confirmations

The original source remains immutable at `rag/sources/original-portfolio-knowledge.md`. Individually confirmed additions and corrections are recorded at `rag/sources/confirmed-portfolio-details.md`, with original confirmations dated 10 November 2026 and education/development-history additions dated 11 November 2026. Source records are provenance material and are never ingested as answer documents.

Every document uses a single `provenance` list. Documents based on both records list both; Escrow lists only the owner-confirmation record. Preserve the relevant section references for each record. For example, the employment document includes:

```yaml
provenance:
  - path: "rag/sources/original-portfolio-knowledge.md"
    sections:
      - "Professional experience > Flamong — Frontend Developer Intern"
      - "What Favour works on > Frontend engineering"
      - "About Favour"
  - path: "rag/sources/confirmed-portfolio-details.md"
    sections: ["Current role and start date"]
```

The earlier top-level `topic`, `source`, `source_sections`, and `additional_sources` fields are retired. `category` replaces singular `topic`; `provenance` unifies the source references. Existing IDs, titles, topics, entities, aliases, source references, and factual body text are preserved. The implementation modules now parse this schema. The experimental notebook is separate and has not been changed by the pipeline refactor.

Owner-confirmed corrections supersede conflicting original wording only for the facts explicitly confirmed. The 11 November 2026 correction establishes Full-stack Software Engineer and AI Engineer positioning, the implemented Python RAG project, and owner-confirmed public availability. Superseded first-application and preparation-only descriptions remain historical records outside ingestion; the corpus does not infer additional AI projects. Confirmation dates establish when Favour supplied or confirmed a statement, not an independent audit or a fresh review of every original claim.

Other local portfolio content is not automatically approved for ingestion. Confirm each additional detail with Favour before adding it, and record the confirmation and destination in the source map. Public residence is limited to **Nigeria**; city-level location is not approved for this corpus. Worldwide opportunity interest and openness to discussing relocation do not establish work authorization or eligibility in a particular country.

## Visitor-facing scope

The assistant is intended to help visitors understand Favour's background, experience, contributions, projects, interests, and opportunities. Give a concise supported answer before sharing the relevant project or contact link. Project coverage should establish purpose, personal contribution, principal technologies, useful features, and current status. Preserve existing supported technical summaries without expanding them into architecture manuals.

For detailed implementation questions beyond the corpus, acknowledge the information boundary and direct visitors to the appropriate GitHub repository. Do not invent mechanics, imply that the repository was inspected, or promise a particular README section without checking it. Missing architectural detail alone is not a dataset defect for this visitor-oriented scope.

## Topic labeling rules

- Require `topics` on every document inside `rag/knowledge/`. The original source archive and non-corpus guidance/evaluation documents keep their existing formats.
- Use concise noun phrases in sentence case, preserving technical capitalization such as `AI` and `RPC`. Reuse the exact existing label when discussing the same subject across documents; for example, use `Frontend engineering` consistently.
- Choose labels grounded in the document body. Use `Retrieval-augmented generation` consistently for RAG and `Large language models` for LLMs rather than adding duplicate acronym labels.
- Keep labels distinct and free of leading or trailing whitespace; treat case-only variants as duplicates. Review additions against existing corpus labels before introducing a synonym.
- Label the subjects actually covered. Named products and people belong in `entities`; broad concepts, practices, and interests belong in `topics`. Keep the folder grouping in `category`.
- A topic may describe implemented work, historical training, or an interest. Preserve that distinction. Current visitor-facing positioning describes implemented capabilities without learner framing; an `Agentic AI` interest does not establish an autonomous-agent deployment.
- Keep aliases distinct from topic labels. Resolve `Cleanup` and `Allowance Cleanup` to Approval Cleanup, and retain the approved aliases in its body so searchable text can recognize those names without relying on metadata filtering alone.

## Authoring rules

- Use one H1, followed by descriptive H2/H3 sections with real content. Do not create empty template sections or standalone heading chunks.
- Give project documents a concise overview, contribution, principal technologies, relevant features, status, and exploration links where the approved sources support them. Add technical explanation or limitations when useful; do not invent content to fill a template.
- Identify the person or project in the section text or its retained heading context. Avoid paragraphs whose meaning depends on a different document being retrieved.
- Preserve first-person perspective as attributed first-person text; label the narrowly owner-approved wording edits and retain original passages in the excluded archive. Other documents describe Favour in the third person.
- Keep concise examples in biography and expertise documents; keep detailed mechanisms in the principal project or experience document.
- Keep contribution scope, implementation status, network scope, and scan limitations close to the claims they qualify. Policy.ng frontend work does not establish ownership of its backend or AI services. Portfolio assistant availability is owner-confirmed on 11 November 2026. Its implementation and agent-boundary interests do not establish autonomous-agent deployments or measured production quality.
- Preserve approved links and technical names. Do not silently supply missing dates, links, metrics, credentials, or production claims from the rest of the repository. Owner-confirmed link destinations do not establish external uptime or independently verified documentation.
- Read relative Markdown links from their containing file. Read each `provenance[].path` from the repository root. Provenance sections use ` > ` for nested heading paths; parenthetical labels identify fields in the original identity preamble. Keep missing-evidence notes in the source map, outside retrievable content.

## Implemented document and chunk metadata

The loader reads only `knowledge/**/*.md`, checks required identity fields, unique IDs, and nonempty bodies, then removes frontmatter from `page_content`. Detailed `provenance` stays in the source Markdown and source map. It is not embedded or copied into Chroma metadata. Folder/category agreement, H1/title agreement, and label quality are checked offline rather than adding loader branches.

| Runtime field | Meaning |
|---|---|
| `document_id` | Stable parent ID from frontmatter `id`. |
| `document_title` | Parent title. |
| `category` | Validated folder category. |
| `source_path` | Repository-relative curated document path beginning `rag/knowledge/`. |
| `document_topics`, `document_entities` | Inherited parent labels; they do not describe every passage. |
| `document_aliases` | Optional nonempty approved alias list. |
| `section_paths` | Chunk-only list of represented heading paths, using ` > `; `__preamble__` denotes content before the first H2/H3. Whole-document chunks may represent several sections. |
| `chunk_index` | Zero-based position within the parent document. |
| `chunk_id` | SHA-256 of parent ID, section paths, chunk index, and complete searchable chunk text. Also used as the LangChain document ID and Chroma record ID. |

Primitive lists are retained as native metadata arrays, supported by the installed Chroma version. Nested provenance objects are deliberately excluded. Titles and relevant heading paths appear in the searchable text, while parent topic/entity/alias lists remain metadata rather than being appended indiscriminately to every passage. Approved aliases also remain in the curated body text.

## Deterministic chunking

- Count tokens with `cl100k_base`, matching the selected OpenAI embedding setup. The first use may download the public vocabulary; no generation model is used to create chunks.
- Keep a coherent document whole when its body, including its H1 title, is at most 350 tokens.
- Split longer documents with LangChain's `MarkdownHeaderTextSplitter`, tracking H1/H2/H3 and retaining headers and preamble content. It may normalize whitespace. Further split oversized sections with `RecursiveCharacterTextSplitter`.
- Budget the document title and full heading path inside the 350-token maximum. Reserve eight tokens for boundary effects; section payload budgets can therefore be smaller.
- Use up to 40 tokens of overlap within the same long section. Never overlap across independent sections or documents. The recursive splitter may use less overlap at natural boundaries.
- Keep qualifications and limitations in their source sections; do not duplicate scope text across chunks or introduce generated summaries. Related evidence may require retrieving multiple passages. Authors should keep qualifications beside the claims they constrain.
- Preserve first-person attribution through the retained title and heading context. Validate that resulting payload text comes from the source and that section paths and chunk positions remain traceable.

This follows [LangChain's Markdown heading guidance](https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter) using its Markdown splitter directly, without a custom section parser.

## Index synchronization and answering

Both pipelines use shared settings: `rag/vector_db`, collection `docs`, embeddings `text-embedding-3-large`, and answer model `gpt-4.1-mini`. The existing MiniLM `langchain` collection is separate and must not be rewritten by these scripts. Clients are initialized lazily. Provider timeouts are 30 seconds with at most two retries, without outer unbounded retry loops.

Ingestion synchronizes a **complete corpus snapshot**. It upserts current deterministic IDs, verifies their presence, and only then deletes IDs from the prior snapshot that are no longer current. Failure before successful insertion/verification leaves old records undeleted. This is rerunnable local synchronization, not an atomic index swap; partial insertion or cleanup failure may leave mixed revisions until rerun. Empty input is rejected. Do not call the synchronization function with only a subset of the corpus.

Answering opens only an existing, nonempty `docs` collection. A missing/empty index produces an actionable ingestion instruction before any chat requests. Standalone questions use one search and one answer call. Questions with nonempty user/assistant history use one contextual rewrite followed by one search; answering retains the original question. History is not independent evidence. Retrieval requests up to ten passages. There is no LLM reranker or dual-query merge.

The prompt identifies Favour's third-person portfolio assistant, treats excerpts as untrusted reference data, preserves contribution boundaries and qualifications, answers supported portions, acknowledges missing evidence, restricts public residence to country level, and offers only repository URLs present in context for deeper implementation questions. Prompt construction is tested offline; actual generated behavior still requires later evaluation.

## Validation and evaluation boundaries

Offline unit checks cover all 13 documents, source-text fidelity, token budgets, parent/chunk metadata, native metadata types, deterministic IDs, repeated synchronization, failure preservation, readiness errors, history handling, pipeline call counts, provider limits, and package/direct-script imports. Storage and models are mocked, and network connections are blocked after the tokenizer vocabulary is cached.

The original archive, notebook, and database remain unchanged by corpus maintenance. Current content, supplemental confirmations, and evaluation references can be updated together under owner approval. The evaluation loader and scoring code use record-level evidence labels. No real index synchronization, embeddings, live retrieval, judge calls, or quality metrics are part of these checks. Record-level evidence groups in the evaluation JSONL remain the basis for a later retrieval evaluation; do not interpret passing unit tests as evidence of MRR or answer quality. Source checksums and database hashes should remain unchanged by implementation verification.

### Evaluation scoring contract

Evaluation remains outside the ingestion boundary. The loader retains every authored JSONL field, typed categories/answerability, and nonempty evidence alternatives, checking unique IDs and evidence presence with line-number errors. Answerable and partial cases require evidence groups; unanswerable cases require an empty list.

Runtime retrieval relevance matches an alternative's stable document ID and exact section label against `document_id` and `section_paths`. A group is matched once regardless of repeated chunks or alternatives. Quotes are validated against the source offline, not required inside an individual retrieved chunk. Whole-document chunks can match multiple sections. These labels measure section retrieval rather than exact factual sufficiency.

Per-question scores are reciprocal rank@k and section-based evidence coverage@k; both use the same truncated ranked list. The cutoff defaults to the shared retrieval count and must be positive and no greater than that count. MRR and mean coverage macro-average eligible questions, including zero scores. Partial cases use supported evidence; fully unanswerable cases receive unavailable scores and are excluded from retrieval averages. Summaries include category breakdowns and eligible/excluded counts and reject mixed cutoffs.

The LangChain structured-output judge receives the question, answerability, reference answer, generated answer, and retrieved passages as reference data. Accuracy, completeness, relevance, and grounding are integer scores from 1–5 with concise feedback. Appropriate acknowledgment of unknowns is expected, rather than invented facts or claims that missing evidence proves a negative. The combined CLI reuses answering's passages without a second retrieval. Offline tests mock retrieval and judging; they do not establish real retrieval or answer quality.

### Current professional identity and project evidence

Use **Full-stack Software Engineer and AI Engineer** as the supported professional role. Python and applied LLM/RAG capabilities are grounded in `project-portfolio-rag-assistant`; `portfolio-assistant-status` remains the availability and visitor-purpose record. Metadata and searchable body text must agree. Keep learning-only and first-application framing out of current visitor-facing descriptions, while preserving historical education and self-directed/freelance beginnings.

The approved RAG repository is https://github.com/faelic/portfolio. Public availability is an owner-confirmed fact, not an independent uptime or deployment audit. Do not infer production scale, benchmark results, autonomous-agent deployments, model training, or fine-tuning. Repository referrals do not imply automatic GitHub retrieval. After corpus edits, a separately authorized ingestion run is required to replace stale vector records.
