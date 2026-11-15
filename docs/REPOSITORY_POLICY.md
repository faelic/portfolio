# Git tracking and deployment inputs

Updated 15 November 2026. Git history, frontend upload/build inputs, and the backend runtime image have different boundaries. A file can belong in Git without belonging in either production artifact.

## What stays in Git

- Frontend/backend source, package manifests and lockfiles, build/deployment configuration, and CI workflows.
- `rag/knowledge/`: the curated public corpus required by production ingestion and index compatibility checks.
- `rag/implementation/`: runtime modules, owner maintenance commands, PostgreSQL initialization SQL, and the two public JSON registries.
- `rag/index/knowledge.json` and `knowledge.sha256`: reviewed public release embeddings, intentionally tracked and shipped. This is not a live vector database or private ledger dump.
- Unit/browser/backend tests and authored evaluation fixtures. They prove behavior and must not be hidden to make the working tree smaller.
- Documentation, curated design captures under `docs/design/`, and historical benchmark snapshots under `docs/performance/`. These are reviewed evidence, not automatically deployed pages or current performance guarantees.
- `rag/sources/`, DATA_CONTRACT and SOURCE_MAP: authoring provenance, excluded from the runtime image and frontend upload.
- Production-used icons, fonts, portraits, screenshots and metadata under `public/`. Do not ignore images, JSON, Markdown or lockfiles globally.

New runtime files that are currently untracked must be included deliberately in the release commit. Ignore rules do not stage source code, commit changes or deploy anything.

## Local-only and generated material

`.gitignore` excludes installed dependencies, virtual environments, compiler/cache files, Python tool caches, test/coverage outputs, secrets/local environment files, local platform/tool state, generated vector databases and protection ledgers, owner evaluation/deployment outputs, the retired prototype, reference-input screenshots and the original exploratory `rag/app.ipynb`.

The notebook and two reference PNGs were removed only from Git's index; their local copies were preserved byte-for-byte. Existing staged prototype removals were left alone. Their old commits are not rewritten. Clean Python modules and test fixtures remain version-controlled/eligible for tracking.

Use `git ls-files -ci --exclude-standard` to find tracked files covered by ignore rules. Adding a pattern alone never untracks an existing file. Use explicit `git rm --cached` paths, not a blanket repository reset, and verify local copies before/after.

## Frontend deployment

For CLI uploads, `.vercelignore` allows only frontend build inputs: source, public assets, package/lock files, TypeScript/Vite/test configuration, tests needed by the referenced test typecheck, and Vercel configuration. Only the built `dist/` is served.

Two backend-folder files are required by React and must be uploaded:

- `rag/implementation/public_sources.json`
- `rag/implementation/approved_links.json`

The rest of `rag/`, Git/CI/tool metadata, documentation, references, prototype, local environments/caches and generated reports are excluded from CLI frontend upload. Git-triggered builds may clone tracked authoring/source files, but only dist/ is published; those files are not public runtime assets. Tests/configuration retained for TypeScript are build inputs, not browser-served runtime files. `VITE_API_ORIGIN` is set through the host's build environment, never a committed local secret file.

Explicitly unused original assets (old Marcus/Brooklyn portraits, original background/portrait PNG, dock photograph, old lamp PNGs) remain in Git but are omitted from the hosted frontend input, along with the preview-asset README. A small build-only Vite cleanup removes this same exact list from dist/, so Git-triggered builds also omit these obsolete files. Source copies remain untouched. Current portrait WebPs, project screenshots, SVG icons, fonts and referenced lamp WebPs remain available. If a future feature starts using an excluded original, update the rule and verify the filtered build first.

## Backend deployment

Build from the `rag` context with its Dockerfile and default-deny `.dockerignore`. The context includes only Dockerfile, pyproject/uv lock, api.py, Python implementation modules, ledger_schema.sql and ledger_runtime_grants.sql, the two public registries, curated knowledge Markdown, and the two named release-index files. Dependencies are installed from the lock; credentials arrive through platform Secrets and mutable ledger state lives in Neon. No Pxxl volume is needed.

Notebooks, Gradio/evaluation entry points, evaluation cases/reports, tests, authoring sources/docs, local environments, credentials, caches and existing databases are not copied into the image. The image retains ingestion/protection CLI modules for deliberate authenticated owner maintenance. No paid ingestion or model call occurs as a build/startup side effect.

## Validation

The frontend was built from a temporary copy filtered through `.vercelignore`, using the existing installed dependencies. This checks the actual TypeScript/Vite build with the omitted files absent, rather than merely checking patterns in isolation. A normal repository build also passed; both dist/ outputs were inspected to confirm the obsolete assets are absent and current portrait/project/icon assets remain. It is not a hosted Vercel deployment or a fresh remote dependency install.

The backend image was rebuilt from the tightened context and checked with networking disabled, including startup, liveness, safe unready/disabled denials, public registries/corpus, and absence of workbench packages. See [RAG security](RAG_SECURITY.md) and [deployment checks](PXXL_DEPLOYMENT.md). Local source files remain available and no Git history rewrite, commit, push or hosting change was made.
