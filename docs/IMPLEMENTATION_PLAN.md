# Portfolio Implementation and Verification Record

## Neon review corrections — 15 November 2026

Addressed four review findings: remote database preparation now runs after local concurrency admission without a redundant per-chat probe; the runtime-grants SQL revokes UPDATE/DELETE/TRUNCATE on debits; async PostgreSQL calls have preparation/operation deadlines and close on cancellation without refunding uncertain commits; evaluation schema version 2 records retrieval mode plus index/search-code hashes. Added regressions for blocked preparation, connection cleanup before SQL settings, total deadlines, concurrent readiness, existing-grant repair, async/sync quota sharing and uncertain COMMIT. All 140 backend tests passed, including PostgreSQL cancellation, repaired grants and uncertain COMMIT; the production image built successfully. Hosted Neon/Pxxl checks remain separate from local verification.

## Pxxl Free / Neon migration — 15 November 2026

Implemented a PostgreSQL ledger with a singleton row lock, bound queries, explicit owner SQL initialization, verified production TLS and bounded transactions. Production without DATABASE_URL or required schema fails closed; local SQLite remains available. Packaged 33 existing source-matched embeddings and added build/runtime checksum, configuration, corpus and vector validation. Exact squared-L2 search matched Chroma top-10 order for all 33 stored-vector queries. These are offline parity checks, not paid answer-quality results. CI adds disposable PostgreSQL regressions; the [deployment runbook](PXXL_DEPLOYMENT.md) replaces the paid-volume plan. Hosted Neon credentials, initialization, connectivity and final enabled-chat checks remain operator steps. Initial migration validation: 128 backend tests passed, including disposable PostgreSQL concurrency/role/API-outage checks; the production image built with release-index validation; dependency audit passed with existing exceptions only; current-source scan found no secret matches.

## Current contract — 15 November 2026

The CI/security hardening batch repairs the prompt snapshot and tokenizer/secret setup, adds per-IP concurrency and denial logs, restricts generated links, separates readiness from integrity/migration, and adds labelled-quote evidence coverage plus explicit chunker provenance. Older test counts and performance records below remain dated historical evidence.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

Historical record: 10 November 2026 · Remediation of the pre-RAG baseline originally reviewed at runtime revision `ebd7c51`. The record below predates RAG integration. See the [11 November local assistant guide](ASSISTANT.md) for the subsequent implementation and current verification; no public deployment is included.

## Delivery and compatibility

**Implemented:** shared Software Engineer profile and rewritten intro/biography, truthful planned-assistant reference content, authoritative note dates, deterministic window transitions and hash reconciliation, explicit opener focus, mobile inertness, accessible arrangement drafts, validated guarded persistence, local globe recovery, resilient images, regression infrastructure, and measured near-view geography loading.

The [PRD](PRD.md) owns REQ IDs; [APP_FLOW](APP_FLOW.md) owns FLOW IDs; [BACKEND_SCHEMA](BACKEND_SCHEMA.md), [TRD](TRD.md), and [DESIGN](../DESIGN.md) define current contracts. [README](../README.md) is the entry point.

Preserved: FAVOUR identity, six showcases, project contribution boundaries, external links, existing hashes and legacy keys, storage keys/encodings, desktop stacking, and mobile reading views. The prototype/reference assets and unrelated `.DS_Store` change were not modified. The knowledge file moved externally during remediation to `rag/knowledge/`. A subsequent [knowledge organization pass](../rag/README.md) split it into topic documents, preserved the original outside the corpus, and updated tests and links.

## Gap register

Stable IDs describe the original findings; remediation status is distinct from a full accessibility or security certification.

| ID | Original finding | Current implementation / evidence |
|---|---|---|
| GAP-01 | README referenced absent tunnel/gallery/minimization behavior | **Implemented:** corrected in documentation baseline; current README remains accurate. REQ-03/04/14. |
| GAP-02 | Public copy and metadata emphasized backend-only positioning | **Implemented:** shared profile, rewritten About/intro, aligned metadata and reference heading; AI work/agentic learning described without new achievements. REQ-01; V-15. |
| GAP-03 | Knowledge described a portfolio assistant as already live | **Implemented:** both passages now describe it as planned/not available. No runtime ingestion introduced. REQ-01; V-15. |
| GAP-04 | Partial hash/history synchronization; title-derived slugs | **Implemented:** explicit preserved slugs, shared native-event reconciliation, idempotent reducer, stacking preserved, empty/unknown navigation removes projects only. REQ-07; FLOW-07; V-05. |
| GAP-05 | Focus restoration/accessibility and non-drag arrangement missing | **Implemented:** explicit openers, bounded visible-target focus, focus/z-order synchronization, mobile inertness, 24/44px targets, readable accents/location, Arrange apps with direction buttons/keys and save/cancel. REQ-04/05/09; FLOW-03/06; V-04/07/08/10. |
| GAP-06 | Unguarded hint/session path and unvalidated saved shapes | **Implemented:** guarded local/session helpers, validated flags/layouts, desktop clamping, valid mobile permutations, draft/scope isolation. REQ-06/11; V-06/08/11. |
| GAP-07 | Optional map could remain loading or fail outside a local boundary | **Implemented:** near-view loader, module/map deadlines, error boundary, fatal/recoverable distinction, context-loss handling, explicit fresh Retry, cleanup, readable location. REQ-12; FLOW-04; V-13. |
| GAP-08 | Note list and reader dates conflicted | **Implemented:** both consume each note's existing authoritative date; no invented timestamps. REQ-08; FLOW-05; V-09/15. |
| GAP-09 | Large lazy MapLibre chunk without performance measurements | **Implemented investigation:** controlled before/after runs, offscreen work confirmed, near-view loading/rotation gating added. Chunk warning retained; no arbitrary bundle-reduction claim. REQ-14; V-14. |
| GAP-10 | No application regression suite or CI | **Implemented:** Vitest/Testing Library/jsdom, three browser projects, separate real-map smoke command, CI configuration and failure artifacts. REQ-14; all flows. |
| GAP-11 | Broken displayed images lacked replacements | **Implemented:** labeled screenshot fallback and inline icon fallback across desktop, titlebar, and repository presentation; source changes retry without recursive requests. REQ-03/10; V-12. |

## Implementation sequence and important decisions

1. Added test tooling and pure window/layout contracts; retained typechecked tests outside production inputs.
2. Rewrote profile/intro and aligned static metadata; corrected planned-assistant wording and note dates.
3. Connected navigation/focus/persistence and transactional rearranging. Desktop dialogs remain nonmodal; mobile covered surfaces are inert. Pointer/touch launchers pass their opener explicitly because button focus differs across browsers.
4. Added bounded optional-module/map recovery and reusable displayed-image fallbacks. The map's private transform use was replaced by public coordinate round trips.
5. Measured initial/About/map loading and deferred map work until near view; paused custom rotation when inactive, offscreen, hidden, or reduced-motion.
6. Updated all six specifications and verified source/document consistency. Build/lint/type/unit/browser commands form the local acceptance gate; hosted CI execution awaits a push.

The arrangement session is deliberately transactional: selection, directional moves, dragging, swapping, and reset update a draft; Done/Enter persists and Cancel/Escape discards. Mobile long press enters that same session. Ordinary desktop free drag outside the session still saves directly. Device-scope changes cancel drafts.

## Verification scenarios

The original V IDs remain stable. Automated coverage is focused on observable transitions/failure behavior, not broad CSS snapshots. The final local execution result is recorded below; manual limitations are not converted into passes by automation.

| ID | Scenario | Coverage / limits |
|---|---|---|
| V-01 | Immediate entry, failed assets, optional import waits | Browser entry remains interactive with stalled portraits/fonts, failed images, or denied storage. No preloader or authored boot minimum remains. Optional-import deadlines and static-icon fallback are tested separately. |
| V-02 | All six projects, link/evidence parity, duplicate windows | Browser cases across three projects; reducer/manager duplicate-event tests. External project services are not audited. |
| V-03 | Window focus, stacking, close, expand/restore, drag | Focus/stacking/dismissal regressions and pure transitions; browser-driven desktop Chromium/WebKit titlebar drag and expand/restore checks passed. |
| V-04 | Keyboard launch, active window, Escape, tabs, restored focus | Browser launch/focus/inertness, unit consumed Escape and Notes navigation. Full screen-reader matrix remains manual. |
| V-05 | Valid/invalid/uppercase fragments, native history, unrelated close | Unit/manager and browser Back/Forward/direct-fragment cases; slugs remain explicit. |
| V-06 | Desktop draft/persistence, reset, reload, scope isolation | Hook and browser save/cancel/reset/reload/geometry checks. |
| V-07 | Mobile full-screen behavior and 767/768 transition | Browser covered-window inertness, draft cancellation, bounds; desktop/mobile screenshots and text enlargement review. Physical devices remain manual. |
| V-08 | Direction alternatives, adjacent swap, Done/Cancel | Browser keyboard/pointer-direction controls and mobile displacement; layout-unit permutations. A mobile-width pointer-driven long-press/drag/swap/save check also passed; physical touch-device coverage remains manual. |
| V-09 | Both Notes, date consistency, About/contact | Unit/browser authoritative dates and tabs; source checks for preserved email/social destinations. Email delivery is not tested. |
| V-10 | Reduced motion, lamp session restoration, readable controls | Three-browser reduced-motion/lamp/date/text-enlargement case; globe motion gating source/visual review. No full motion/sound accessibility certification. |
| V-11 | Denied stores, invalid flags/JSON/records, bounds | Unit denied getter/write/remove helpers and wrong-shape cases; browser denied stores and corrupt desktop/mobile records. |
| V-12 | Failed screenshots/icons and evidence distinctions | Component source-retry test; browser rejected image requests, fallback labels, Escrow/Policy.ng parity. |
| V-13 | Module rejection/retry, map startup, timeout, recoverable errors, context loss | Unit map event/deadline/cleanup cases; browser real failed native chunk/retry; separate real-service smoke check. |
| V-14 | Lint, TypeScript, tests, build, split resources, performance | Local commands and recorded measurements; CI is configured, not claimed as executed remotely. |
| V-15 | Biography, intro, metadata, knowledge truth and dates | Unit content/metadata/reference assertions and source review. Other repositories' claims are not independently audited. |

**Local check result (10 November 2026):** lint, typecheck, production build, **25 unit/component tests**, **24 browser regressions** (eight each in desktop Chromium, mobile-touch Chromium, and WebKit), and the separate **real-service map smoke check** passed. Additional browser-driven pointer checks passed for desktop Chromium/WebKit titlebar dragging and expand/restore, plus mobile-width long press, draft dragging, slot swapping, and save. Final desktop/mobile normal, arrangement, project, unavailable-map, 767/768px, and doubled Notes-text screenshots were reviewed in one inspection plus one bounded confirmation. No horizontal page overflow was found; close targets measured 24×24px desktop and 44×44px mobile. Hosted CI and deployment were not performed.

Representative solid-color contrast calculations found project headings at 7.58–9.06:1 against the lightest dark reading-panel base and GitHub text/background pairs at 4.69:1 or higher. Window-title and hint pairs exceeded 4.5:1. These selected calculations do not certify every composited/interactive state or full accessibility conformance.

Final documentation checks passed: eight authored/updated Markdown files, **139 relative file/heading links**, seven Mermaid blocks, DESIGN frontmatter/token references/canonical section order, 14 requirement IDs, 11 gap IDs, seven flow IDs, and 15 verification IDs. `git diff --check` passed. Raw performance records are additional JSON artifacts.

## Historical baseline

Before remediation on 10 November 2026, lint, typecheck, and production build passed at `ebd7c51`. The bounded local review observed entry, Monierave opening/expansion/close, a 390×844 project view, Notes switching, and a successful real globe. It did not exercise every keyboard, failure, persistence, or history edge case.

The original documentation pass parsed eight authored/updated Markdown files, resolved 152 relative links/heading targets, parsed seven Mermaid diagrams, validated DESIGN frontmatter/token references/section order, and checked 14 requirements, 11 gaps, seven flows, and 15 verification IDs. Those counts describe that historical pass; current counts are revalidated after remediation.

## Performance findings

Six cold-context baseline runs (three per desktop/mobile-touch profile) were captured from the original production build, then matched against the remediated build. The script is [measure-performance.mjs](../scripts/measure-performance.mjs).
[Raw baseline runs](performance/before.json) and [raw final runs](performance/after.json) preserve all six measurements per version. The final run was isolated from other browser tests. Medians:

| Profile | Entry before (ms) | Entry after (ms) | Pre-scroll rAF callbacks before / 1s | After / 1s | About-open to map-settled before (ms) | After (ms) | Ready after |
|---|---|---|---|---|---|---|---|
| desktop | 2513 | 2452 | 601 | 0 | 7764 | 11816 | 2/3 |
| mobile-touch | 2444 | 2391 | 900 | 0 | 7714 | 6200 | 3/3 |

All final runs made **zero geographic requests before scrolling** and recorded zero page rAF callbacks in the sampled offscreen interval. Baseline pre-scroll geographic counts were 0/1/1 on desktop and 1/5/1 on mobile. Callback counts are all-page callbacks, not display FPS or only the custom rotation loop.

The map-settled timer starts at About activation and includes the scripted 3-second pre-scroll observation plus module/network/worker/map initialization. It does not isolate WebGL constructor CPU time. Five final runs reached ready; one desktop run reached the bounded unavailable fallback. All six baseline runs eventually reached ready without the new deadline. These uncontrolled external-service timings do not establish a map-speed improvement. The separate real-service smoke check passed; service variability remains an external dependency.

Build output: entry JS changed from about **285.29kB / 91.92kB gzip** to **292.19kB / 94.46kB gzip**. Lazy map JS changed from **1062.15kB / 288.19kB gzip** to **1082.12kB / 297.69kB gzip**, with a separate **517.95kB decoded worker** emitted by patched MapLibre 6. Local preview resource transfer sizes are uncompressed and available in the raw records. The worker/map bytes remain deferred; total geography bytes did not shrink. The justified optimization is avoiding pre-view network/animation work, with the large-chunk warning retained.


The baseline confirmed map requests and substantial all-page animation callback activity before scrolling to the location section. Callback counts include MapLibre/internal/application work; they are not a direct count of only the custom rotation loop. The new loader avoids importing/initializing the map before its section approaches view, and custom rotation pauses when inactive or hidden.

The comparison uses headless Chromium, loopback production preview, fresh contexts, desktop 1280×720 and mobile-touch 390×844, and uncontrolled external geographic networking. Wall-clock values are not production latency or Core Web Vitals. MapLibre's security upgrade changes worker packaging and total geography bytes, so report those costs rather than claiming all resources shrank.

## Dependency follow-up and remaining limits

A pre-existing critical MapLibre attribution-sanitizer advisory was verified against the [maintainer advisory](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579) and resolved by updating to patched 6.x. Compatible non-forced audit fixes also updated Vite/transitive packages. MapLibre 6's explicit worker asset is emitted by Vite and tested with the real service.

The last full audit after those updates reported seven **moderate development-tool** advisories in the typescript-eslint/minimatch dependency chain. No forced downgrade or incompatible override was applied. The final production-only audit reported **zero advisories**. This is a concrete dependency follow-up, not a claim of a comprehensive security audit.

Full screen-reader coverage, physical-device testing, production headers, external project uptime, hosted CI execution, and deployed behavior are not certified. Interface sounds still have no app-level mute control; real minimization/gallery/new product features remain outside this release.

## Handoff to RAG planning

**Prepared through knowledge organization and individually confirmed updates:** 12 topic documents, frontmatter metadata with topics and approved aliases, a source map, a documented chunking baseline, and 23 retrieval evaluation cases. Owner confirmations add Escrow, approved links and opportunity preferences, country-only public residence, the Flamong start date, and the first-AI-project correction. See the [knowledge base guide](../rag/README.md). The supplied source remains preserved byte-for-byte outside the ingestion boundary.

**Deferred:** chat UI, providers, ingestion/chunking execution, embeddings, retrieval/reranking, vector schema, grounded generation/citations, conversation storage, credentials, cost controls, evaluation execution, and deployment. The knowledge corpus preserves the planned assistant status and has no ingestion/runtime connection. Review the completed baseline, data contract, and recorded limitations before specifying the working RAG pipeline.


## Local hardening verification — 15 November 2026

- 111 Python offline tests passed, including the corrected prompt snapshot and new IP-concurrency/readiness/evidence regressions. Dependency-level event-loop ResourceWarnings remain visible; they are not reported as production failures or silently suppressed.
- 52 frontend unit/component tests and 87 browser regressions passed across desktop Chromium, mobile Chromium and WebKit, including approved/unapproved link rendering. TypeScript/production build and ESLint passed; existing lazy-bundle size advisories remain.
- The non-root production image built and passed a network-disabled startup/liveness/unready/disabled-chat check with a disposable signing secret. The public corpus and new link registry were packaged; no provider call or ingestion was made. The smoke container was removed.
- npm audit found zero vulnerabilities. The production Python audit passed under the existing exact advisory-ID exception policy; its tool summary reported five ignored entries. This is an exception-qualified pass, not a zero-advisory or comprehensive security guarantee.
- The redacted current-source scanner and Git-history scanner found no matching secrets; 14 commits were scanned. Ignored local secrets were not printed or incorporated into the image.
- All 13 Markdown documents under docs were reconciled and local file-link targets checked. Historical JSON measurements/screenshots remain unchanged.

No hosted GitHub run, commit/push, Pxxl configuration, public deployment, paid model evaluation or real-provider capacity benchmark is claimed. Proxy ranges, cross-domain cookies, volume persistence and a reviewed answer-quality baseline remain operator evidence tasks.


## CI failure correction — 15 November 2026

The verify failure on d339810 was the old content assertion expecting a planned/unavailable assistant while the current corpus records owner-confirmed availability. The current test explicitly requires public availability plus its owner-confirmed/non-uptime qualification and rejects the old planned text; no availability fact was reverted to silence the test.

Both jobs now pin ubuntu-24.04. checkout/setup-node/upload-artifact use v7 with a Node24 action runtime; the application still installs Node22 to match package.json. Browser regressions have an explicit step ID, and failure-artifact upload runs only when that step fails, with missing files ignored. A unit failure before Playwright is therefore not a missing-browser-report warning.

Local validation: all 53 frontend tests, ESLint, TypeScript/production build, workflow YAML/conditions and whitespace checks passed. These workflow changes require a new committed/pushed revision; re-running the old commit does not use local files. No hosted Actions result is claimed for the corrected workflow.
