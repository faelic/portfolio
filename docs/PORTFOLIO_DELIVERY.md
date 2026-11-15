# Portfolio Improvement Delivery Record

## Current contract — 15 November 2026

The 12 November tables below are historical delivery evidence. Current backend hardening adds reproducible CI setup, 2 active requests/IP by default (5 global, 1 visitor), exact approved generated links, read-only readiness, denial logging and separate labelled-quote retrieval scores. Paid quality evaluation and hosted rollout remain pending.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

12 November 2026. This records implemented local behavior and verification separately from live-model quality and public hosting. The [implementation plan](PORTFOLIO_IMPROVEMENT_PLAN.md) remains the scope reference.

## Delivered on 12 November 2026

| Plan area | Local result |
|---|---|
| First screen and avatar | Prominent identity, existing transparent portrait, concrete work summary, featured Monierave entry, Contact, persistent app descriptions and six original projects |
| Desktop compatibility | App-region coordinates, collision-resolving legacy migration, retained legacy keys, reset without old-layout resurrection, keyboard arrangement and compact scrolling |
| Entry and usability | No mounted blocking boot, no initial project screenshot preloads, compressed lamp art, explicit globe launch, sound off by default, functional close/expand and readable case copy |
| Project evidence | Problem, contribution, status, decision and live/source actions first; real selectable screenshots; optional deeper stories; explicit learning/team/testnet/repository boundaries |
| Assistant | Suggested questions fill drafts; bounded canonical public references attach to answers, survive compatible history restoration, clear with messages and stay out of model history |
| Transport compatibility | New clients opt into references via X-Portfolio-References; old requests keep delta/done/error. Unicode batch bounds and per-frame parsing tolerate proxy-coalesced frames |
| AI evaluation | Separate unchanged 50-case baseline, new eight-case held-out set, existing conversation/security suites, deliberate paid-run flag, durable JSON/Markdown, provenance and run-bound human review |
| Packaging and documentation | Public registry included in the non-root runtime image; current product, visual, flow, data, assistant and security documents reconciled without deleting historical records |

The resume link is intentionally omitted until a real asset or destination is available. The introduction uses the existing shared portrait; no generated portrait replaces the user's photo.

## Verification

- TypeScript/production build, ESLint and 42 frontend unit/component tests passed.
- Python suite passed 94 tests with provider/storage behavior mocked as appropriate. Gradio UI construction fixtures use an owned running loop, reducing unnecessary loop creation; dependency-level ResourceWarnings still occur and are not hidden.
- The full cross-browser run passed 61 scenarios across desktop Chromium, mobile Chromium and WebKit. Five legacy floating-invitation scenarios are intentionally skipped for mobile, where the dock remains the entry point. The new responsive and reference scenarios run on all three browser projects.
- A focused three-browser reference-restoration run verifies the final opt-in protocol/parser build after the full run. No paid generation is used by these checks.
- Browser inspection compared the accepted avatar mock with the 1440×900 implementation in a combined full view and focused identity crop. A 390×844 adaptation, mobile case reading and assistant draft behavior were also inspected. The exercised browser console check returned no warnings/errors. See [design QA](../design-qa.md) and [comparison evidence](design/implementation/comparison-final.jpg).
- The final production backend image built. An isolated container with networking disabled confirmed UID 10001, the 13-entry public registry, no Gradio runtime package, healthy liveness and unready missing-index behavior. This is local packaging evidence, not hosted readiness.
- Original quality, conversation and security fixtures remain byte-for-byte identical to the pre-implementation snapshot. No corpus ingestion or local-index rebuild occurred.
- Working-source changes were preserved; no commit, push or public deployment was performed.

## Entry performance

The two lamp PNG originals total 1,338,320 bytes. Their WebP runtime derivatives total 29,650 bytes, with the originals retained. Unopened project screenshots are no longer initial-entry requests; map and assistant resources stay deferred.

Six fresh browser contexts against the local production preview recorded desktop entry times of 472/164/193ms and mobile-touch times of 175/120/187ms. Medians were 193ms and 175ms respectively. These are unthrottled loopback measurements from the existing entry script, not hosted latency, field Core Web Vitals or statistical reliability claims. See [raw entry measurements](performance/implementation-entry.json).

Large lazy map and assistant chunks still produce Vite's chunk-size warning. They remain deferred; the performance change does not claim that their total bytes disappeared.

## Remaining work and dependencies

| Work | Required condition |
|---|---|
| Resume action | An actual resume file or verified destination |
| Measured AI quality and public result summary | An intentional live evaluation run, provider credit and human review; no measured score has been invented |
| Hosted rollout and reliability evidence | Target-host access, edge controls, persistent volume verification, streaming/cancellation checks and a concrete release approval |
| Monierave executable transfer demo | Its actual repository and permitted test artifacts; the portfolio repository contains case descriptions, not the Go implementation |
| Deeper Policy.ng workflow proof | Publishable team artifacts and contribution evidence |
| Accessibility completion | Physical touch devices, full screen-reader coverage and true browser 200% zoom remain manual checks |

Use the [evaluation guide](AI_EVALUATION.md) for owner-only reporting and the existing [deployment guide](PXXL_DEPLOYMENT.md) for hosted checks. Existing application budgets and privacy boundaries remain in force; local fixture timings and conservative spending reservations are not provider quality or billing measurements.

## Local preview

The implementation preview runs at http://127.0.0.1:5174/ during this handoff. The temporary production benchmark server was stopped after measurement. The browser deliverable remains open on the first screen.


## Local hardening verification — 15 November 2026

- 111 Python offline tests passed, including the corrected prompt snapshot and new IP-concurrency/readiness/evidence regressions. Dependency-level event-loop ResourceWarnings remain visible; they are not reported as production failures or silently suppressed.
- 52 frontend unit/component tests and 87 browser regressions passed across desktop Chromium, mobile Chromium and WebKit, including approved/unapproved link rendering. TypeScript/production build and ESLint passed; existing lazy-bundle size advisories remain.
- The non-root production image built and passed a network-disabled startup/liveness/unready/disabled-chat check with a disposable signing secret. The public corpus and new link registry were packaged; no provider call or ingestion was made. The smoke container was removed.
- npm audit found zero vulnerabilities. The production Python audit passed under the existing exact advisory-ID exception policy; its tool summary reported five ignored entries. This is an exception-qualified pass, not a zero-advisory or comprehensive security guarantee.
- The redacted current-source scanner and Git-history scanner found no matching secrets; 14 commits were scanned. Ignored local secrets were not printed or incorporated into the image.
- All 13 Markdown documents under docs were reconciled and local file-link targets checked. Historical JSON measurements/screenshots remain unchanged.

No hosted GitHub run, commit/push, Pxxl configuration, public deployment, paid model evaluation or real-provider capacity benchmark is claimed. Proxy ranges, cross-domain cookies, volume persistence and a reviewed answer-quality baseline remain operator evidence tasks.
