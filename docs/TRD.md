# Portfolio Technical Requirements

## Current contract — 15 November 2026

The backend remains one worker/container on Pxxl Free with a packaged embedding index and Neon PostgreSQL ledger. Initialization is explicit owner SQL; startup and routine readiness are bounded/read-only. CI prewarms tokenizer assets and uses a disposable signing secret for offline image startup. Generated links require an exact approved destination. Earlier dated UI/performance details retain historical scope.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

## Current implementation extension — 12 November 2026

The accepted avatar introduction extends the existing React desktop without a framework replacement. Identity/navigation are immediately usable; the preloader and its boot state are removed and project screenshots are requested only after case entry. Historical lamp assets remain available but the lamp is not mounted. Compact home layouts scroll, while mobile windows remain full-screen with inert backgrounds. App-region coordinates have versioned migration. Cases use explicit contribution/status/decision summaries, selected screenshot views and optional long-form details. The globe now requires an explicit action and sound defaults off.

The Python stream supports an opt-in public-reference extension with canonical destinations, Unicode-aware bounds and a 12,000-byte reference batch limit. Older clients retain text-only events; newer clients also accept old streams. Incremental parsing handles a proxy coalescing many valid frames without relaxing the per-frame bound. The owner evaluator records exact selected context, timings, available answer usage, version hashes and human-review state. Evaluation datasets/runners are not visitor endpoints. See [the delivery record](PORTFOLIO_DELIVERY.md) for current validation and outstanding hosted checks.


Updated: 11 November 2026. The [assistant guide](ASSISTANT.md) specifies the local Python API, streaming, history, dependencies, and security boundaries added to this remediated frontend. Original `ebd7c51` measurements and review evidence are retained in the [implementation record](IMPLEMENTATION_PLAN.md#historical-baseline).

## Architecture and execution boundaries

**Implemented:** a client-rendered React/TypeScript/Vite SPA. [index.html](../index.html) loads [main.tsx](../src/main.tsx), which mounts [App](../src/App.tsx) in Strict Mode. The lazy Assistant connects through a Vite proxy to a separate localhost FastAPI process. Python owns provider credentials and Chroma; the browser has no database client or account system. Gradio remains separate.

```text
Static host -> HTML -> React App
  -> Immediate centered identity and selected work
  -> DesktopIcon[] <- project data + saved/draft layout hook
  -> WindowFrame[] <- pure window reducer + manager side effects
       -> ProjectWindow + resilient images
       -> AboutWindow <- shared profile
            -> readable Lagos location
            -> Explore + near-view GlobeSection -> local boundary + lazy map/worker
       -> NotesWindow <- authoritative note dates + shared introduction
       -> lazy AssistantFeature -> /api/chat -> localhost FastAPI -> shared RAG
  -> settings/arrangement controls, dock, optional sounds
Browser state: React + localStorage + sessionStorage + project fragment
```

| Subsystem | Responsibility / source |
|---|---|
| Composition | [App](../src/App.tsx): device scope, background inertness, arrangement selection/commands, window composition. |
| Window transitions | [windows reducer](../src/state/windows.ts): pure open/focus/close/move/expand/navigation transitions and monotonic z-order. |
| Window effects | [useWindowManager](../src/hooks/useWindowManager.ts): history, registered DOM nodes/openers, deferred focus, Escape. |
| Layout | [layout utilities](../src/state/layout.ts) and [layout hook](../src/hooks/useDesktopLayout.ts): validation, clamping, mobile permutation, saved/draft transitions and persistence. |
| Content | [profile](../src/data/profile.ts), [projects](../src/data/projects.ts), [notes](../src/data/notes.ts), [locations](../src/data/locations.ts). |
| Views | [WindowFrame](../src/components/windows/WindowFrame.tsx), Project/About/Notes views, [DesktopIcon](../src/components/desktop/DesktopIcon.tsx), [Dock](../src/components/dock/Dock.tsx). |
| Optional geography | [GlobeSection](../src/components/map/GlobeSection.tsx), [LocationGlobe](../src/components/map/LocationGlobe.tsx), [import deadline](../src/utils/withDeadline.ts). |
| Resilience | [storage helpers](../src/utils/storage.ts), [ResilientImage](../src/components/shared/ResilientImage.tsx). |
| Presentation | [global CSS](../src/styles/global.css), [lamp CSS](../src/components/effects/PendantLamp.css), [design reference](../DESIGN.md). |

There is no active tunnel, Three.js dependency, gallery renderer, or real minimize action. Prototype code is excluded from lint/deployment and is not a runtime feature source.

## Dependencies and development interface

[package.json](../package.json) declares Node `>=22.12.0 <23`; use `npm ci`. [package-lock.json](../package-lock.json) is authoritative for exact versions. Current runtime dependencies include React/React DOM 19, assistant-ui, react-markdown, cuelume, Motion, and MapLibre. The preloader-only thinking-orbs dependency has been removed; MapLibre was upgraded from 5.24 to patched 6.x after the attribution-sanitizer advisory. Vite received a compatible 7.x security update. No framework rewrite was introduced.

Development-only additions: Vitest, React Testing Library, user-event, jest-dom, jsdom, Playwright, and Node typings. Test files live outside production source inputs. A separate [test TS project](../tsconfig.test.json) checks tests/configuration. [Vitest config](../vitest.config.ts) reuses Vite settings; [Playwright config](../playwright.config.ts) tests the built app.

| Script | Contract |
|---|---|
| `dev`, `preview` | Local development server / built application server |
| `lint`, `typecheck`, `build` | ESLint, referenced TypeScript projects, TypeScript then Vite bundle |
| `test`, `test:watch` | One unit/component run / watch mode |
| `test:e2e` | Desktop Chromium, mobile-touch Chromium, WebKit; external geography blocked deterministically |
| `test:map-smoke` | Separate real-service Chromium globe check; requires working external services/WebGL |
| `measure:performance -- before-or-after` | Six fresh-context production measurements, three per device profile |

[CI](../.github/workflows/quality.yml) runs on pull requests and pushes to `main`, installs Node 22 and test browsers, runs lint/typecheck/unit/build/browser checks, and uploads failure reports/traces. CI is configured locally; a hosted GitHub run is not claimed until pushed and executed.

## State and navigation contracts

Content is compile-time TypeScript; no router/global state/server-cache package is introduced. The [schema document](BACKEND_SCHEMA.md) owns exact types, IDs, slots, and storage keys.

**Windows:** unique keys; highest z-index is active; re-opening preserves position/expansion; already-active focus is a no-op. DOM nodes/openers are refs outside reducer state. Focus moves after the DOM/style update, without an entry-loading gate. Dismissal targets the next active window, otherwise the connected visible opener or desktop launcher. Desktop dialogs are nonmodal; mobile covered dialogs and background controls are inert. Focus entering a window raises it. Escape respects consumed events and arrangement mode.

**URLs:** explicit slugs preserve the six existing hashes. Mount, `popstate`, and `hashchange` share reconciliation. Valid navigation opens/raises its project with no history push; empty/unknown navigation removes only project windows. Ordinary project launches push only if the parsed project differs. Focus and About/Notes do not push history. Closing clears only a matching parsed project fragment, including uppercase recognized variants. The URL still does not serialize the complete workspace.

**Layouts:** desktop and mobile persist separately. Ordinary desktop dragging swaps responsive slots and persists the resulting order. Arrange apps/mobile hold starts a draft; direction controls/keys and dragging preview it. Mobile commits nearest-slot displacement within the draft. Done/Enter saves; Cancel/Escape discards; Reset previews defaults. Switching scope cancels the draft. Restored order derives positions from responsive slots; legacy coordinates are migration inputs only.

**Storage:** access, JSON parsing, boolean/session flags, and delayed hint writes are guarded. Current desktop/mobile order validation requires six unique known project IDs; legacy coordinate migration drops invalid entries. Denied writes preserve in-memory operation but cannot promise persistence after reload. Legacy keys remain for rollback; no cross-tab synchronization is added.

## Loading, assets, and globe lifecycle

**Entry:** The preloader component, loading overlay styles, boot state/timers, and preloader-only orb dependency are removed. Identity and launchers are immediately usable even when landing images or fonts stall; direct-link focus is not gated by asset readiness. Project screenshots load through opened cases. Optional icon-animation features load separately and do not block navigation; failure leaves static icons. Contact uses the original envelope outline with a short flap-opening hover/focus motion and a static reduced-motion state.

**Images:** [ResilientImage](../src/components/shared/ResilientImage.tsx) handles failed featured images and icon uses without fetching another fallback URL. Source changes retry naturally. Absent screenshot data remains distinct from network-failed supplied evidence. Local WOFF2 fonts/icons/screenshots remain under [public/assets](../public/assets/).

**Geography:** static Lagos text is always available. An IntersectionObserver with 200px scroll-root margin defers the lazy module until its section approaches view. Explore must also be requested before mounting the lazy map. A local boundary isolates rejected module/render failures. Module waiting and map initialization each have a 10-second bound. Retry creates a fresh lazy attempt; [Vite's globe import hook](../vite.config.ts) adds a fresh production request query so a failed native import is not permanently cached.

MapLibre 6 uses an explicit Vite `?worker&url` worker asset and `setWorkerUrl`; it no longer depends on private transform access. Public project/unproject round trips gate globe-surface interactions. The worker adds a separately fetched asset, so compare total map resources as well as the main map chunk.

Construction failure, fatal style initialization, WebGL context loss, and load timeout select the unavailable view. Recoverable resource errors after style readiness show a warning without tearing down the usable map. Failed module or map state has explicit Retry, with biography/contact outside its boundary. The globe is supplementary image content with a readable location equivalent; keyboard application semantics were removed.

Custom rotation runs only while About is active, its map intersects view, the document is visible, and reduced motion is not requested. Timers, observers, listeners, frames, markers, and map instances clean up on close/failure/retry. cuelume provides optional quiet cues with a quick mute control and settings volume; lamp/orb are not mounted.

## External services, deployment, and security

OpenFreeMap's dark style and its referenced resources remain external browser dependencies. Font requests from its font path are rewritten to MapLibre demo glyph hosting. Project/social anchors open external destinations; mailto uses the visitor's client. Lagos coordinates are configured data, not visitor geolocation.

[Vercel config](../vercel.json) builds `dist`, supplies SPA fallback, and configures `nosniff`, frame denial, strict-origin-when-cross-origin referrer policy, and disabled camera/microphone/geolocation. No environment variables or explicit CSP are introduced. Production headers/domain/branch settings were not independently audited or changed.

HTML metadata is static/global; project hashes do not generate project-specific HTML metadata. The title, description, Open Graph and Twitter image descriptions reflect the current personal studio, portrait, six apps and AI assistant, with no hanging-lamp claim. `public/og/favour-studio-v5.png` is a real 1200×630 capture of the current homepage. Its versioned absolute HTTPS URL replaces the previous v4 image in all social tags; the older asset remains available for cached links. Crawlers can read the tags and fetch the image without JavaScript. Public reading content still requires JavaScript.

To refresh the image after a visual change, build and start the local production preview, then run `npm run capture:social` (default `http://127.0.0.1:4173/`). The script verifies that the portrait, six apps and dock fit, waits for fonts/artwork, and blocks external/API requests. After capture, rebuild to copy the new PNG into `dist/`. Use a new image filename/URL for each subsequent published image revision, updating the HTML and capture script together. Deploy the HTML and image in the same release. Social services may also cache page metadata; after deployment, request a fresh scrape using the [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) where applicable. Updating the local file alone cannot invalidate third-party previews or existing shared messages.

The [knowledge base](../rag/README.md) is organized into topic documents under `rag/knowledge/`, with source and evaluation material outside the corpus. Index synchronization is an explicit Python command, never browser/startup work.

The existing MapLibre advisory was patched; compatible non-forced dependency security updates were applied. Remaining development-tool advisories, if any, are recorded in the implementation results. No forced downgrade or broad dependency override is used merely to clear audit output.

## Verification and performance

See the [verification matrix](IMPLEMENTATION_PLAN.md#verification-scenarios) and [performance findings](IMPLEMENTATION_PLAN.md#performance-findings). Compiler/lint/build success does not substitute for interaction tests. Real-service smoke checks remain separate from deterministic CI.

The large lazy-globe build warning is retained. Performance reports distinguish transfer/decode size, wall-clock timing, external-network variation, worker assets, and all-page animation callback counts. They do not claim Core Web Vitals or physical-device performance certification.


## Current RAG execution boundary

FastAPI uses pure-ASGI request middleware and one process. Durable Neon PostgreSQL admission/spending is independent of browser-owned chat history. Per-visitor/IP/global active counters are held until ASGI response cleanup; per-IP default is configurable with CHAT_MAX_ACTIVE_PER_IP. The IP resolver trusts only explicitly allowed TCP peers, with Uvicorn proxy_headers disabled.

Startup checks the explicitly initialized Neon ledger without migrations. Routine readiness uses small read-only probes and a cached index handle; admission/debit transactions enforce fail-closed write behavior. Denial events contain request IDs/reason codes, not raw identities or messages.

The answer renderer shares owner-approved destination data with the source registries; it does not accept arbitrary HTTP(S)/mailto links from the model/history. No runtime dependency is added. The existing chunker fingerprint retains value 1, now named CHUNKER_VERSION; changing its semantics must bump the version and explicitly reingest. Evaluation records that version and hashes relevant implementation files.

CI provisions public tokenizer vocabulary before network-blocked unit tests. Its production smoke test generates a temporary signing secret, uses no real provider key, disables network/chat, checks liveness/unready state, and cleans up on failure. Run the operator checks in PXXL_DEPLOYMENT.md before public enablement.


## Reviewed Neon preparation and provenance

Global/visitor/IP slots precede remote database I/O. Chat performs the atomic admission check rather than a separate readiness probe. API PostgreSQL operations use async connections with an 8-second deadline, close in finally on errors/cancellation, and preserve uncertain committed reservations. The 90-second request budget includes preparation/body time; cancellation cleanup can add up to 5 seconds. Health readiness has one in-flight probe; liveness remains database-free. Runtime grants explicitly revoke UPDATE/DELETE/TRUNCATE on spending records. Schema-version-2 evaluation manifests record retrieval mode, index-file hashes and packaged search-code hash; no paid evaluation is implied by these tests.
