# Favour Portfolio

FAVOUR is a React/TypeScript working desktop for exploring six project cases, About, and Notes. Desktop windows stack; mobile uses full-screen reading views. Favour is presented as a **Software Engineer**, working across backend, frontend, AI, and blockchain applications, with agentic AI engineering as continuing learning.

## Documentation

Updated 10 November 2026 after the pre-RAG gap remediation. Specifications separate **Implemented**, **Gap**, **Proposed**, and **Deferred** behavior and retain stable requirement/flow/gap/verification IDs.

| Document | Purpose |
|---|---|
| [PRD](docs/PRD.md) | Audience, goals, six-project inventory, requirements, acceptance |
| [TRD](docs/TRD.md) | Architecture, dependencies, lifecycle, state, build/deployment |
| [UI/UX design](DESIGN.md) | Established visual system, responsive behavior, accessible controls, failures |
| [App flows](docs/APP_FLOW.md) | Seven Mermaid visitor journeys and recovery paths |
| [Backend schema / current data model](docs/BACKEND_SCHEMA.md) | Frontend content, stable identifiers, memory state, browser storage; no backend exists |
| [Implementation and verification](docs/IMPLEMENTATION_PLAN.md) | Gap closures, tests, historical evidence, performance findings, remaining limits |

[PRODUCT.md](PRODUCT.md) captures durable product context. The [knowledge base](rag/README.md) contains 12 topic documents under `rag/knowledge/`, with a data contract, source map, owner-confirmed additions, and retrieval evaluation cases outside the corpus. The original source is preserved separately. The portfolio assistant is Favour's first AI application project; it remains planned and the corpus is not imported or ingested. **RAG, backend APIs, database, and authentication are not implemented.**

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

Windows raise on pointer/focus entry, drag on desktop, expand/restore, and close. Yellow minimize is decorative. Dismissal restores focus; mobile covered windows/backgrounds are inert. Supported hashes remain `#monierave`, `#bucketflow`, `#blockscan`, `#cleanup`, `#escrow`, `#policyng`. Back/Forward and direct fragment changes reconcile projects; empty/unknown hashes dismiss project windows and retain About/Notes. Focus alone does not push history.

The lamp preference persists for the page session. Reduced motion affects supported effects. Interface sounds have no app-level mute control. Static Lagos location remains readable if the near-view lazy globe fails; module/map failures have explicit Retry. [Prototype](prototype/) and [references](references/) remain historical material, not current application behavior. No tunnel or gallery is mounted.

## Content and deployment

Edit project stories, slugs, links, and media in [projects.ts](src/data/projects.ts). Existing legacy keys/public slugs should remain stable. The renderer shows one featured image; Escrow is repository-only, and Policy.ng has no GitHub link. Local assets live under [public/assets](public/assets/).

Identity, biography, and intro live in [profile.ts](src/data/profile.ts); note content and authoritative dates in [notes.ts](src/data/notes.ts); social destinations in [Dock.tsx](src/components/dock/Dock.tsx). Align static metadata in [index.html](index.html) when positioning changes.

Vercel settings: Vite framework, repository root, `npm ci`, `npm run build`, output `dist`, Node 22. No environment variables are required. [vercel.json](vercel.json) supplies SPA fallback and security headers; external map resources remain network dependencies. These are repository settings, not an audit of the production project. Nothing is deployed by this change.
