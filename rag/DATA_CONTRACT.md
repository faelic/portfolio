# Knowledge document and chunking contract

## Corpus interface

The sole content boundary is `rag/knowledge/**/*.md`, resolved from the repository root. All 12 documents are UTF-8 Markdown with YAML frontmatter. Source records, evaluation cases, and authoring guidance are excluded. This is a content contract for future tooling, not an implemented loader or vector-store schema.

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

The earlier top-level `topic`, `source`, `source_sections`, and `additional_sources` fields are retired. `category` replaces singular `topic`; `provenance` unifies the source references. Existing IDs, titles, topics, entities, aliases, source references, and factual body text are preserved. This is a document-schema migration only; the notebook, loader, and chunking implementation have not been changed. The current notebook loader still requires a later update to parse this schema.

Owner-confirmed corrections supersede conflicting original wording only for the facts explicitly confirmed. The portfolio assistant is Favour's first AI application project; broad original statements implying multiple AI applications are superseded in the current corpus. Confirmation dates establish when Favour supplied or confirmed a statement, not an independent audit or a fresh review of every original claim.

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
- A topic may describe an interest, training, ongoing learning, or a plan. Preserve those qualifications in the body: `Agentic AI` does not imply completed expertise, and `Portfolio assistant planning` does not imply a deployed assistant.
- Keep aliases distinct from topic labels. Resolve `Cleanup` and `Allowance Cleanup` to Approval Cleanup, and retain the approved aliases in its body so searchable text can recognize those names without relying on metadata filtering alone.

## Authoring rules

- Use one H1, followed by descriptive H2/H3 sections with real content. Do not create empty template sections or standalone heading chunks.
- Give project documents a concise overview, contribution, principal technologies, relevant features, status, and exploration links where the approved sources support them. Add technical explanation or limitations when useful; do not invent content to fill a template.
- Identify the person or project in the section text or its retained heading context. Avoid paragraphs whose meaning depends on a different document being retrieved.
- Preserve first-person perspective as attributed first-person text. Other documents describe Favour in the third person.
- Keep concise examples in biography and expertise documents; keep detailed mechanisms in the principal project or experience document.
- Keep contribution scope, implementation status, network scope, and scan limitations close to the claims they qualify. Policy.ng frontend work does not establish ownership of its backend or AI services. Agentic engineering remains ongoing learning; the portfolio assistant remains planned.
- Preserve approved links and technical names. Do not silently supply missing dates, links, metrics, credentials, or production claims from the rest of the repository. Owner-confirmed link destinations do not establish external uptime or independently verified documentation.
- Read relative Markdown links from their containing file. Read each `provenance[].path` from the repository root. Provenance sections use ` > ` for nested heading paths; parenthetical labels identify fields in the original identity preamble. Keep missing-evidence notes in the source map, outside retrievable content.

## Initial future chunking baseline

These are parameters to test when ingestion is implemented; no chunks or embeddings are generated by this change.

1. Load only corpus files and parse frontmatter separately from the body. Treat the Markdown heading hierarchy as semantic boundaries.
2. Keep a short, coherent document whole when it fits approximately 450 tokens including searchable context. Do not pad small documents or force an arbitrary minimum chunk length.
3. For longer documents, group adjacent sections on the same subject toward approximately 250–450 tokens. Never combine different documents to reach a target. Preserve a section's heading path when grouping.
4. Split a section exceeding that range at paragraph boundaries first. If one paragraph still exceeds the budget, prefer sentence boundaries; future tooling must use the chosen model's tokenizer rather than assume words or characters are tokens.
5. Use no overlap between independent sections. Start with approximately 50 tokens of overlap only when splitting the same long section, then evaluate whether the duplication helps.
6. Include document title and the relevant heading path in searchable text. Make entity names available in that text when the title and headings do not supply them. Do not expect frontmatter filters or a Markdown link to provide semantic search coverage automatically.
7. A future loader should generate document identity, title, category, and a repository-relative path to the curated knowledge file. Future chunk metadata should retain that parent context and the relevant heading paths and passage position. Inherited labels must be distinguished as document-level topics, entities, and aliases; they do not describe every passage. Keep detailed provenance in authoring records and the source map rather than copying nested objects into vector metadata. Cite the curated knowledge document and section. These are future integration requirements, not implemented chunking behavior.
8. Keep relevant document-level qualifications with extracted sections: for example, Monierave's simulation status, BucketFlow's Sepolia scope, Policy.ng's frontend contribution boundary, and Approval Cleanup's limited scan coverage. A chunk must not turn a qualified claim into a broader one. Carry that qualifying context forward when splitting; do not apply it to unrelated subjects.

Structure-aware chunking preserves meaningful context, but chunk size and overlap depend on the dataset and queries. See [Microsoft's chunking guidance](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-chunking-phase) and [LangChain's Markdown heading metadata documentation](https://docs.langchain.com/oss/python/integrations/splitters/markdown_header_metadata_splitter). These references inform the contract without selecting a framework or provider.

## Validation and later evaluation

Before ingestion, check frontmatter types, unique IDs, category/path agreement, a nonempty `topics` list with trimmed nonempty strings and no case-insensitive duplicates, consistent label spelling across documents, optional aliases with the same list constraints, exactly one matching H1, nonempty sections, every provenance object's `path` and `sections` references, and local links. Review topic labels against the body and source coverage and limitations using the source map. Check that superseded AI wording and unapproved city-level location do not appear in the active corpus. The original archive SHA-256 must continue to match its recorded value.

When retrieval exists, run the evaluation cases against only the corpus. Check whether the top five results contain the required evidence for answerable cases, with all required subjects present for cross-topic questions. Also inspect section-level evidence: retrieving a document ID alone is insufficient if the necessary passage is absent. Record retrieval and answer-grounding results separately. Missing-information cases should yield an explicit knowledge limitation without invented specifics; relevant context may still be retrieved. These checks are a starting evaluation procedure, not a claim that retrieval already passes.
