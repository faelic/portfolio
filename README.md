# Favour Portfolio

Backend deployment now targets Pxxl Free with a Neon PostgreSQL ledger and a packaged public knowledge index; no paid Pxxl volume is required. See [the deployment runbook](docs/PXXL_DEPLOYMENT.md) for initialization, backend-only secrets, release-index export and verification. Local SQLite/Chroma workbench tools remain available.

Current backend/CI hardening (15 November 2026): see the [security and release contract](docs/RAG_SECURITY.md). It covers reproducible tokenizer/signing-secret setup, 5 global / 1 visitor / 2 IP active requests, approved generated links, read-only readiness and evaluation evidence boundaries. Earlier dated results remain historical.

FAVOUR is a React/TypeScript working desktop for exploring six project cases, About, Notes, and an AI assistant. Desktop windows stack; mobile uses full-screen views. Favour is presented as a **Software Engineer**, working across backend, frontend, AI, and blockchain applications, with agentic AI engineering as continuing learning.

## Current portfolio experience — 16 November 2026

The first screen now includes Favour's portrait, role, concrete work summary, direct BlockScan entry and Contact with an opening-envelope hover/focus animation. The six project apps retain their windows, hashes and arrangement controls, with title-only project launchers and responsive arrangement slots. Existing arrangements migrate to versioned keys; the old keys remain available for rollback. Compact home layouts can scroll. The preloader and its unused dependency are removed entirely. Essential content is immediately usable without an asset-readiness gate or project-image preloads. Contact stays static under reduced motion.

Project cases lead with contribution, status, decisions and source/demo actions, then selectable real screenshots and optional deeper explanations. Sound is off until enabled. The globe is an explicit optional enhancement. The assistant adds suggested questions, streaming responses and optional local history. Retrieved-reference lists remain hidden; bounded reference metadata retains transport/history compatibility and is not a factual-quality certification.

See the [implementation plan](docs/PORTFOLIO_IMPROVEMENT_PLAN.md), [delivery record](docs/PORTFOLIO_DELIVERY.md), and [owner-only evaluation reporting guide](docs/AI_EVALUATION.md). Local frontend checks do not establish live answer quality or external-project correctness.

## Documentation

Updated 16 November 2026. The [assistant guide](docs/ASSISTANT.md) supersedes assistant-related boundaries in the 10 November pre-RAG specifications. The backend is deployed on Pxxl with Neon readiness verified; browser cookie, proxy/IP and enabled-chat verification remain separate rollout checks.

| Document | Purpose |
|---|---|
| [PRD](docs/PRD.md) | Audience, goals, six-project inventory, requirements, acceptance |
| [TRD](docs/TRD.md) | Architecture, dependencies, lifecycle, state, build/deployment |
| [UI/UX design](DESIGN.md) | Established visual system, responsive behavior, accessible controls, failures |
| [App flows](docs/APP_FLOW.md) | Seven Mermaid visitor journeys and recovery paths |
| [Backend schema / current data model](docs/BACKEND_SCHEMA.md) | Frontend content, stable identifiers, memory state, browser storage |
| [Local assistant](docs/ASSISTANT.md) | Python API, streaming, optional browser history, Gradio/evaluation workflow |
| [Implementation and verification](docs/IMPLEMENTATION_PLAN.md) | Gap closures, tests, historical evidence, performance findings, remaining limits |

[PRODUCT.md](PRODUCT.md) captures durable product context. The [knowledge base](rag/README.md) contains 13 topic documents under `rag/knowledge/`, with source material and evaluation cases outside the corpus. The original source is preserved separately. Python/LangChain/OpenAI/Chroma serve the local assistant; the browser never imports the corpus or provider credentials. Both Gradio developer tools remain available. The hosted backend is documented in the deployment runbook; no user-account authentication is introduced.

For chat, run `uv sync --locked` then `uv run python api.py` from `rag` in one terminal and `npm run dev` from the repository root in another. Set `OPENAI_API_KEY` server-side and use an intentionally ingested OpenAI `docs` collection. See the [assistant guide](docs/ASSISTANT.md) for setup, limits, and evaluation commands.

## Development and checks

Use Node **22.12+ within Node 22** and the committed lockfile.

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
npm run test:map-smoke
npm run preview
```

`test:watch` runs Vitest interactively. `test:e2e` uses the production build for desktop Chromium, mobile-touch Chromium, and WebKit. External geography is blocked deterministically in that suite. Run `test:map-smoke` separately for real services/WebGL; run Playwright commands sequentially because they share report directories. CI configuration runs deterministic checks on pull requests and pushes to `main`, saving failure artifacts. Hosted CI execution is not claimed until those changes are pushed.

After starting a production preview on port 4173, `npm run measure:performance -- after` captures three fresh-context runs per device profile. See [recorded findings](docs/IMPLEMENTATION_PLAN.md#performance-findings); this is a controlled local comparison, not a production Core Web Vitals claim. The lazy MapLibre chunk warning remains visible.

## Architecture and interaction model

[src/App.tsx](src/App.tsx) composes the desktop, loader, lamp, dock, windows, and arrangement controls. [src/state](src/state/) contains pure window/layout operations; [src/hooks](src/hooks/) connects them to browser state and effects. [src/data](src/data/) owns project/profile/note/geographic content. [src/components/windows](src/components/windows/) renders the content, while [src/components/map](src/components/map/) isolates optional map loading and failure recovery. [ResilientImage](src/components/shared/ResilientImage.tsx) and [storage helpers](src/utils/storage.ts) contain optional-resource failures.

Icons open by click/tap or Enter/Space. Arrange apps (or mobile long press) starts a draft: select an icon, drag or use direction buttons/arrows, then Done/Enter saves or Cancel/Escape discards. Reset previews defaults. Desktop/mobile preferences remain separate; ordinary desktop dragging persists directly.

Windows raise on pointer/focus entry, drag on desktop, expand/restore, and close. The inactive minimize control is removed. Dismissal restores focus; mobile covered windows/backgrounds are inert. Supported hashes remain `#monierave`, `#bucketflow`, `#blockscan`, `#cleanup`, `#escrow`, `#policyng`. Back/Forward and direct fragment changes reconcile projects; empty/unknown hashes dismiss project windows and retain dock applications. Focus alone does not push history.

The lamp is not mounted. Reduced motion affects supported effects; sound is muted by default with a quick mute control and settings volume. Static Lagos location remains readable without the optional Explore globe; module/map failures have explicit Retry. The local-only prototype/ and references/ folders are ignored historical inputs, not versioned application behavior. Reviewed captures remain under docs/design/. No tunnel or gallery is mounted.

## Content and deployment

Edit project stories, slugs, links, and media in [projects.ts](src/data/projects.ts). Existing legacy keys/public slugs should remain stable. The renderer shows one featured image; Escrow is repository-only, and Policy.ng has no GitHub link. Local assets live under [public/assets](public/assets/).

Identity, biography, and intro live in [profile.ts](src/data/profile.ts); note content and authoritative dates in [notes.ts](src/data/notes.ts); social destinations in [Dock.tsx](src/components/dock/Dock.tsx). Align static metadata in [index.html](index.html) when positioning changes.

Vercel settings: Vite framework, repository root, `npm ci`, `npm run build`, output `dist`, Node 22. Static portfolio rendering requires no environment variables. The Python chat service is local-only and is not provided by this static deployment. [vercel.json](vercel.json) supplies SPA fallback and security headers; external map resources remain network dependencies. These are repository settings, not an audit of the production project. Nothing is deployed by this change.

## Pxxl deployment package — 12 November 2026

The production configuration, durable rate/spend controls, container packaging, and operator rollout checks are documented in [the deployment guide](docs/PXXL_DEPLOYMENT.md). This supersedes earlier local-only transport boundaries above; actual public deployment and host controls require the checks in that guide. Evaluation improvements remain deferred.


See the [Git and deployment input policy](docs/REPOSITORY_POLICY.md) for what stays version-controlled, local-only artifacts, the frontend registry exceptions and the backend image allowlist.
