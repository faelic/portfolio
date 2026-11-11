# Portfolio knowledge base

This directory prepares Favour Chukwuemerie Ututu's portfolio knowledge for a future retrieval-augmented generation (RAG) assistant. The corpus contains 12 topic documents, based on the original supplied Markdown and individually confirmed additions. Ingestion, embeddings, retrieval, and chat are not implemented.

The intended assistant helps visitors understand Favour, his experience, his contributions, and his projects. It provides concise supported answers and directs deeper implementation questions to the relevant GitHub repository. The portfolio assistant is Favour's first AI application project and is currently at knowledge-base preparation.

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
| `portfolio-assistant-status` | [Planned assistant status and purpose](knowledge/portfolio/assistant-status.md) |
| `opportunities-contact` | [Availability and contact](knowledge/opportunities/availability-and-contact.md) |

## Supporting material

- [Data contract](DATA_CONTRACT.md): metadata, authoring rules, and the initial future chunking baseline.
- [Source map](SOURCE_MAP.md): every source section, consolidation decisions, integrity checksum, and coverage gaps.
- [Retrieval evaluation cases](evaluation/retrieval-cases.md): 23 questions covering topic lookup, aliases, public contact, supported GitHub referrals, and missing information.
- [Original source](sources/original-portfolio-knowledge.md): the supplied Markdown, preserved byte-for-byte outside the corpus.
- [Owner-confirmed details](sources/confirmed-portfolio-details.md): individually approved additions and corrections from 10 and 11 November 2026, including source approval boundaries.

## Python environment

The RAG folder uses `uv` with Python 3.12 or newer. From the repository root:

```bash
cd rag
uv sync --locked
uv run python -c "from dotenv import load_dotenv; from openai import OpenAI; print('Imports successful')"
```

`python-dotenv` provides `.env` loading; `openai` provides the Python API client. Dependency installation does not implement ingestion or make an API request. Run Python scripts from this folder with `uv run python your_script.py`.

Keep `pyproject.toml` and `uv.lock` in Git. The local `.venv/`, Python bytecode caches, and notebook checkpoints are ignored.

## Maintaining the dataset

Edit the appropriate topic document rather than the archived source. Keep stable document IDs, name the subject of a section explicitly, and keep contribution boundaries and limitations alongside the relevant claims. Every corpus document has a folder category (`category`), a list of subjects and concepts (`topics`), and named subjects (`entities`). Approved alternative names use optional `aliases`; all approved source references use a single `provenance` list of `path` and `sections` objects. Reuse topic labels consistently across files and ground them in the document text; see the data contract for labeling and future chunk metadata rules. The metadata migration changes document headers only; the notebook loader and chunking code have not been migrated yet. Confirm each new portfolio detail with Favour, record its provenance, and update the source map and evaluation cases. Source references establish provenance, not independent verification.

The original archive supplied no reliable as-of date. The supplemental source records owner confirmations from 10 November 2026 for specific facts, including employment, opportunities, public location, links, and AI project status. Education year ranges and self-taught/freelance beginnings were additionally confirmed on 11 November 2026. This does not date or verify every original claim. Review mutable statements before treating them as current indefinitely.

Preserve concise context in biography and expertise documents, and keep project-specific explanations in their corresponding documents. Full implementation breakdowns belong in the linked repositories. Share Nigeria as the public country of residence; do not add a city from other repository files. Do not expand the corpus with paraphrased FAQs solely to match evaluation questions.

## Completion and limits

The organization is intended to support section-aware chunking and grounded answers. Actual retrieval quality, chunk sizes, ranking, and answer quality remain unmeasured until a working pipeline is evaluated. There is no runtime change to the portfolio website.
