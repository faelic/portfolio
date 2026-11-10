# Portfolio Technical Requirements

Updated: 10 November 2026. This specification describes the remediated pre-RAG runtime. Original `ebd7c51` measurements and review evidence are retained in the [implementation record](IMPLEMENTATION_PLAN.md#historical-baseline).

## Architecture and execution boundaries

**Implemented:** a client-rendered React/TypeScript/Vite SPA. [index.html](../index.html) loads [main.tsx](../src/main.tsx), which mounts [App](../src/App.tsx) in Strict Mode. The app has no server API, backend framework, database client, account system, or RAG pipeline.

```text
Static host -> HTML -> React App
  -> BootPreloader / loading orb
  -> DesktopIcon[] <- project data + saved/draft layout hook
  -> WindowFrame[] <- pure window reducer + manager side effects
       -> ProjectWindow + resilient images
       -> AboutWindow <- shared profile
            -> readable Lagos location
            -> near-view GlobeSection -> local boundary + lazy map/worker
       -> NotesWindow <- authoritative note dates + shared introduction
  -> arrangement controls, dock, lamp, sounds
Browser state: React + localStorage + sessionStorage + project fragment
```

| Subsystem | Responsibility / source |
|---|---|
| Composition | [App](../src/App.tsx): boot, device scope, background inertness, arrangement selection/commands, window composition. |
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

[package.json](../package.json) declares Node `>=22.12.0 <23`; use `npm ci`. [package-lock.json](../package-lock.json) is authoritative for exact versions. Current runtime dependencies remain React/React DOM 19, cuelume, thinking-orbs, and MapLibre; MapLibre was upgraded from 5.24 to patched 6.x after the attribution-sanitizer advisory. Vite received a compatible 7.x security update. No framework rewrite was introduced.

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

**Windows:** unique keys; highest z-index is active; re-opening preserves position/expansion; already-active focus is a no-op. DOM nodes/openers are refs outside reducer state. Focus waits until boot releases inertness, then moves after the DOM/style update. Dismissal targets the next active window, otherwise the connected visible opener or desktop launcher. Desktop dialogs are nonmodal; mobile covered dialogs and background controls are inert. Focus entering a window raises it. Escape respects consumed events and arrangement mode.

**URLs:** explicit slugs preserve the six existing hashes. Mount, `popstate`, and `hashchange` share reconciliation. Valid navigation opens/raises its project with no history push; empty/unknown navigation removes only project windows. Ordinary project launches push only if the parsed project differs. Focus and About/Notes do not push history. Closing clears only a matching parsed project fragment, including uppercase recognized variants. The URL still does not serialize the complete workspace.

**Layouts:** desktop and mobile persist separately. Ordinary desktop dragging persists as before. Arrange apps/mobile hold starts a draft; direction controls/keys and dragging preview it. Mobile commits nearest-slot displacement within the draft. Done/Enter saves; Cancel/Escape discards; Reset previews defaults. Switching scope cancels the draft. Desktop restored positions clamp to actual desktop/icon geometry after layout and resizing.

**Storage:** access, JSON parsing, boolean/session flags, and delayed hint writes are guarded. Desktop sanitizer drops unknown/nonfinite entries. Mobile validation requires six unique valid effective slots. Denied writes preserve in-memory operation but cannot promise persistence after reload. No cross-tab synchronization or storage migration is added.

## Loading, assets, and globe lifecycle

**Boot:** icons, featured screenshots, lamp fixtures, and fonts preload. Image errors settle promises. Minimum waits remain 1700ms first visit, 820ms return visit; assets/fonts are bounded at 2800ms, followed by a 460ms exit. These are configured waits, not measured latency. The desktop is inert during boot.

**Images:** [ResilientImage](../src/components/shared/ResilientImage.tsx) handles failed featured images and icon uses without fetching another fallback URL. Source changes retry naturally. Absent screenshot data remains distinct from network-failed supplied evidence. Local WOFF2 fonts/icons/screenshots remain under [public/assets](../public/assets/).

**Geography:** static Lagos text is always available. An IntersectionObserver with 200px scroll-root margin defers the lazy module until its section approaches view. A local boundary isolates rejected module/render failures. Module waiting and map initialization each have a 10-second bound. Retry creates a fresh lazy attempt; [Vite's globe import hook](../vite.config.ts) adds a fresh production request query so a failed native import is not permanently cached.

MapLibre 6 uses an explicit Vite `?worker&url` worker asset and `setWorkerUrl`; it no longer depends on private transform access. Public project/unproject round trips gate globe-surface interactions. The worker adds a separately fetched asset, so compare total map resources as well as the main map chunk.

Construction failure, fatal style initialization, WebGL context loss, and load timeout select the unavailable view. Recoverable resource errors after style readiness show a warning without tearing down the usable map. Failed module or map state has explicit Retry, with biography/contact outside its boundary. The globe is supplementary image content with a readable location equivalent; keyboard application semantics were removed.

Custom rotation runs only while About is active, its map intersects view, the document is visible, and reduced motion is not requested. Timers, observers, listeners, frames, markers, and map instances clean up on close/failure/retry. cuelume and existing lamp/orb behavior remain; no mute control is introduced.

## External services, deployment, and security

OpenFreeMap's dark style and its referenced resources remain external browser dependencies. Font requests from its font path are rewritten to MapLibre demo glyph hosting. Project/social anchors open external destinations; mailto uses the visitor's client. Lagos coordinates are configured data, not visitor geolocation.

[Vercel config](../vercel.json) builds `dist`, supplies SPA fallback, and configures `nosniff`, frame denial, strict-origin-when-cross-origin referrer policy, and disabled camera/microphone/geolocation. No environment variables or explicit CSP are introduced. Production headers/domain/branch settings were not independently audited or changed.

HTML metadata is static/global; project hashes do not generate project-specific HTML metadata. Public reading content requires JavaScript. The [knowledge base](../rag/README.md) is organized into topic documents under `rag/knowledge/`, with source and evaluation material outside the corpus. It is not ingested.

The existing MapLibre advisory was patched; compatible non-forced dependency security updates were applied. Remaining development-tool advisories, if any, are recorded in the implementation results. No forced downgrade or broad dependency override is used merely to clear audit output.

## Verification and performance

See the [verification matrix](IMPLEMENTATION_PLAN.md#verification-scenarios) and [performance findings](IMPLEMENTATION_PLAN.md#performance-findings). Compiler/lint/build success does not substitute for interaction tests. Real-service smoke checks remain separate from deterministic CI.

The large lazy-globe build warning is retained. Performance reports distinguish transfer/decode size, wall-clock timing, external-network variation, worker assets, and all-page animation callback counts. They do not claim Core Web Vitals or physical-device performance certification.
