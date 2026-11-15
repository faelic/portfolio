# Backend Schema and Current Data Model

## Current contract — 15 November 2026

Conversation history remains browser-owned, but the backend now has durable Neon PostgreSQL metadata, admissions, client_admissions and debits tables in the portfolio_rag schema. Signed browser identity and HMAC IP keys support atomic quotas; process-local concurrency is 5 global / 1 visitor / 2 IP by default. See the current protection schema below.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

## Current data extensions — 12 November 2026

Desktop and mobile now store separate validated six-project orders in favour.shortcut-layout.v4 and favour.shortcut-layout.mobile.v3. Legacy coordinate records are read only for relative-order migration and remain available for rollback. Reset persists the default order and offers a short Undo. Sound defaults off; its saved volume defaults to 20%.

The shared profile supplies the portrait, role and contact. Public presentation config selects the featured project and optional resume destination. Typed case summaries add problem, personal contribution, engineering decision and limitation boundaries, while existing stable project keys/hashes remain intact.

The assistant accepts `X-Portfolio-References: 1` as a response-extension request. Its optional references event has at most ten registry-controlled items and a 12,000-byte UTF-8 batch budget: id, canonical title/href, up to three section labels of 160 characters, and an excerpt of 400 characters. The same public registry is bundled by React and copied into the Python image. Text-only requests retain the old protocol. Optional saved references are revalidated and never become model history. See [evaluation reporting](AI_EVALUATION.md) for owner-only result artifacts; the older tables below are historical where superseded.


Updated: 11 November 2026. The [assistant guide](ASSISTANT.md) owns the new local API and chat storage contract. Historical pre-RAG source baseline: `ebd7c51`.

## Backend boundary

**Implemented locally:** a stateless FastAPI `POST /api/chat` endpoint and Python/Chroma RAG pipeline, with optional browser-owned chat persistence. There are no account records or server-side conversation database. A separate Neon PostgreSQL protection ledger stores quotas and conservative spend; initialization is explicit owner-only SQL. Production retrieval uses a verified packaged embedding index; local workbench Chroma and SQLite remain available. The [assistant guide](ASSISTANT.md) specifies request/events, limits, and chat storage. This document retains the existing portfolio UI/content contracts.

Content is compiled from TypeScript and components. Local/session storage belong to each visitor's browser and are not authoritative shared databases. External map services do not persist portfolio business records on the app's behalf. Monierave's ledger and Policy.ng's admin APIs are descriptions of other projects, not entities in this portfolio.

**Deferred:** public backend deployment and server-side conversation persistence. Do not convert these UI types into database tables automatically. See the [PRD](PRD.md) for requirements and the [TRD](TRD.md) for execution boundaries.

## Content ownership

| Domain | Current source of truth | Consumption |
|---|---|---|
| Projects and hash conversion | [projects.ts](../src/data/projects.ts) | Desktop labels, window content, featured assets, project URLs |
| Model interfaces | [portfolio.ts](../src/types/portfolio.ts) | TypeScript compile-time checks; no runtime validation |
| Notes/experience | [notes.ts](../src/data/notes.ts) | Read-only Notes window |
| Profile and biography | [profile.ts](../src/data/profile.ts) | Shared identity, biography, and shorter Notes introduction |
| Social profiles and badge version | [Dock.tsx](../src/components/dock/Dock.tsx) | Embedded links and local badge preference |
| Geography | [locations.ts](../src/data/locations.ts) | Globe hub, connections, continent labels |
| Default mobile slots | [mobileLayout.ts](../src/data/mobileLayout.ts) | Icon placement and nearest-slot selection |
| SEO/social metadata | [index.html](../index.html) | Static page head; distinct from profile copy |
| Curated knowledge content | [13 topic-based Markdown documents](../rag/README.md) | Python ingestion/retrieval; source/archive and evaluation material excluded; no browser corpus import |

The curated corpus remains under `rag/knowledge/`; the original source is preserved outside it. The [data contract](../rag/DATA_CONTRACT.md) defines the content/chunk metadata interface. Owner-confirmed availability is qualified separately from deployment verification. The integration does not modify the corpus or automatically ingest it.

## Identifiers and URL mapping

**Implemented:** legacy keys are stable internal identifiers; display names, desktop labels, and fragments are different fields. Preserve these keys and versioned layout records in this documentation pass.

| `ProjectKey` | Project title | Desktop label | Window key | Canonical fragment |
|---|---|---|---|---|
| `champ` | Monierave | Monierave | `project:champ` | `#monierave` |
| `silences` | BucketFlow | BucketFlow | `project:silences` | `#bucketflow` |
| `revolte` | BlockScan | Blockexplorer | `project:revolte` | `#blockscan` |
| `lisiere` | Cleanup | Cleanup | `project:lisiere` | `#cleanup` |
| `elan` | Escrow | Escrow | `project:elan` | `#escrow` |
| `eau` | Policy.ng | Policy | `project:eau` | `#policyng` |

`AppKey` is `"about" | "notes" | "assistant"`. `WindowKey` is `` `project:${ProjectKey}` | AppKey ``. Dock applications have no implemented URL fragments. Registry order is Monierave, BucketFlow, BlockScan, Cleanup, Escrow, Policy.ng; spatial placement is configured separately.

`projectToHash` reads the explicit `slug` field. `hashToProject` removes a leading `#`, lowercases input, and matches that stable slug; it does not provide aliases such as `#policy.ng`, `#blockexplorer`, or `#approvalcleanup`. Unknown or empty input yields `undefined`. Title edits no longer change public hashes or storage identities (GAP-04 resolved).

## Project content model

**Implemented:** `projects` has type `Record<ProjectKey, Project>`. Optional properties below correspond to `?` in the source interface. Types constrain development builds, not untrusted runtime input.

| Fields | Type / optionality | Current use |
|---|---|---|
| `key`, `title`, `slug`, `desktopLabel` | `ProjectKey` and required strings | Internal identity, display title, stable fragment, icon label |
| `icon`, `accent` | `string`; required | Root-relative icon URL and window accent |
| `githubAccent` | Optional `string` | Repository action background; readable heading variants are defined in CSS |
| `desktopSummary`, `desktopStack` | `string`; required | Retained project metadata; launcher subtitles and hover previews are removed |
| `techStack` | `string[]`; required | Rendered stack tags |
| `featuredImageIndex` | Optional `number` | Selects `images[index]`, defaults to index 0 |
| `windowStory` | Required object | Main rendered narrative; fields below |
| `liveUrl`, `repoUrl` | Optional `string` | Conditional external links; neither is a backend integration |
| `images` | `ProjectImage[]`; required | Only the selected image is rendered in the current window |
| `description` | Required `string` | Content available in data, not currently rendered by the project window |
| `thesis` | Required object: `number`, `title`, `body` strings; `rotation` number | Not rendered by current app |
| `primaryActionLabel`, `sourceActionLabel`, `previewNote` | Optional `string` | Not consumed by current project renderer; action labels are fixed “View live” and “GitHub” |
| `capabilities` | Required `ProjectCapability[]` | Not rendered by current app |
| `artifact` | Optional object: `eyebrow`, `title`, `body` strings and `steps: string[]` | Not rendered by current app; Escrow instead uses the renderer's generic repository-only placeholder |
| `meta` | Required `Array<[string, string]>` | Not rendered by current app |

`windowStory` contains optional `learnedTitle` and required `learned` / `howItWorks` strings. The heading defaults to “What I learnt.” Narrative text is split into paragraphs on blank lines and rendered as React text; this is not a Markdown/HTML renderer.

`ProjectImage` contains required `src`, `alt`, `action`, and `caption` strings, plus `treatment: "interface" | "interface-policy"`. The `image()` data helper prefixes filenames with `/assets/projects/`. Only `src` and `alt` are consumed by the resilient featured-image component. Missing selected image data yields the repository-only placeholder; a network failure loading a supplied `src` instead shows “Preview unavailable” with the project label (GAP-11 resolved).

`ProjectCapability` contains required string fields `id`, `title`, `description`, `proof`, and a `visual: CapabilityVisualKey`. The visual union permits `ledger`, `sessions`, `operations`, `split`, `chain-sync`, `guardrails`, `chain-data`, `navigation`, `learning`, `approval-scan`, `risk-review`, `revoke`, `roles`, `lifecycle`, `wallet-sync`, `frontend-system`, `information`, and `collaboration`. These are typed content identifiers, not mounted visualization components.

## Notes, identity, and geography

**Implemented Notes:** an `as const` object with keys `about` and `experience`. Both have `title` and display `date`. About has `paragraphs: string[]`; Experience has `roles[]` with `title`, `place`, `date`, and `bullets[]`. These shapes are inferred from source; About paragraphs reuse the shared profile introduction. Role entries cover the Flamong / Policy.ng internship and independent projects.

The reader initially selects About, while the tabs display Experience first. Selection is component-local and the reader is read-only. Display dates are strings, not fabricated ISO timestamps: About says “January 22, 2026 at 11:35 AM,” Experience says “Updated August 2026.” Both preview and reader now use that note’s single `date` field (GAP-08 resolved).

**Implemented identity:** [profile.ts](../src/data/profile.ts) exports the name, “Software Engineer” position, email, biography, and introduction. About and Notes consume it. HTML metadata stays static but uses aligned positioning. The avatar remains presentation in About; this is a frontend content object, not a database profile table (GAP-02 resolved).

**Implemented geography:** `LocationPoint = { name: string; lng: number; lat: number }`. The hub is Lagos at longitude `3.3792`, latitude `6.5244`. `locationLevels` contains:

| Level | First matching condition | Destination limit |
|---|---|---|
| global | zoom `< 2.25` | 7 |
| regional | zoom `< 4.9` | 7 |
| nigeria | zoom `< 8.2` | 7 |
| lagos | remaining zooms; upper bound is infinity | 8 |

Each level owns a location array. Continent labels are a separate `LocationPoint[]`. The globe derives marker subsets and GeoJSON line collections in memory using angular distance and great-circle interpolation. These connections are illustrative geographic data, not a record of Favour's employers, customers, travel, or visitor locations.

## In-memory UI model

**Implemented** in [useWindowManager](../src/hooks/useWindowManager.ts) and [App](../src/App.tsx):

| Model | Fields / meaning |
|---|---|
| `Point` | Numeric `x`, `y`; units depend on consumer. Icon layouts use percentages, windows use pixels relative to the desktop. |
| `Bounds` | Extends `Point` with numeric `width`, `height`; defined in shared types, unused by the current app. |
| `PortfolioWindow` | Required `key`, `zIndex`, `expanded`; optional `projectKey`, `position: Point`. No minimized field exists. |
| Window collection | Pure reducer state `{ windows: PortfolioWindow[], nextZ: number }`, initially empty/110. Unique keys; meaningful focus/open/expand advances z-order; repeated active focus is a no-op. |
| App transients | Selected project, settings-open state, arrangement method/draft, assistant request/mount state, sound preferences. |
| View transients | Selected note, pointer drag state, launch/close animation, dock tooltip/magnification, map readiness/error/interaction. |

Closing ordinary windows destroys their view state. Assistant state lives above its conditional window, survives close/reopen, and persists through reload only when saving is enabled. Reopening an existing instance raises it without remounting; reloading loses window positions except a project reopened from a recognized fragment. Opener and window DOM references remain outside reducer state. Layout drafts become persisted preferences only on Done/Enter. Chat storage keys and validation are specified in the [assistant guide](ASSISTANT.md#history-and-storage).

## Browser storage contracts

Current localStorage contracts are validated and guarded. Earlier coordinate/session keys may remain for rollback but are not new writes by the current studio.

| Key | Store / value | Current behavior |
|---|---|---|
| favour.shortcut-layout.v4 | Local; six unique ProjectKey values | Desktop relative order; defaults to curated order |
| favour.shortcut-layout.mobile.v3 | Local; six unique ProjectKey values | Independent mobile relative order |
| favour.arrangement-method.v1 | Local; drag or arrows | Drag default; keyboard movement remains available |
| favour.interface-sound.v1 | Local; boolean | Muted default |
| favour.interface-volume.v1 | Local; number 0–1 | 0.2 default; changing while muted does not play sound |
| favour.assistant-keep-history.v1 | Local; boolean | False default |
| favour.assistant-history.v1 | Local; bounded validated completed exchanges | Optional history; see ASSISTANT.md |

Example order: `["champ", "eau", "silences", "revolte", "lisiere", "elan"]`. This means Monierave, Policy.ng, BucketFlow, BlockScan, Cleanup and Escrow. Positions are derived from responsive slots rather than saved screen coordinates. Dragging swaps slots. Keyboard/directional arrangement shares the draft; Done persists, Cancel discards, and a scope change cancels unsaved work. Reset outside arrangement persists defaults and offers an eight-second Undo.

Malformed/denied storage falls back to an in-memory default. The old desktop v2/v3 and mobile v1/v2 keys are retained as migration inputs; inactive lamp/badge/boot flags are not current preference controls. No cross-tab synchronization is promised.

## Current protection ledger

Production selects Neon with DATABASE_URL and never falls back to local storage. The SQL schema is rag/implementation/ledger_schema.sql; the local-only ledger path remains RAG_DATA_DIR/protection.sqlite3. Tables are independent of chat history:

| Table | Fields / purpose |
|---|---|
| metadata | singleton id=1 primary key and version=1 compatibility marker / transaction lock |
| admissions | at timestamp; global rolling-minute admissions |
| client_admissions | at, visitor, ip; HMAC identities and 24-hour admission window |
| debits | at, request_id, stage, positive micro_usd, price_version; conservative provider reservations |

Indexes cover admission time, visitor/time, IP/time and debit time. SELECT FOR UPDATE on the singleton metadata row serializes admission/debit decisions at READ COMMITTED isolation. The following bound queries read committed usage before inserting. Provider calls occur after commit. Startup/readiness use read-only bounded SELECTs, not schema creation. Owner SQL initializes once and refuses existing state. Local SQLite retains BEGIN IMMEDIATE for workbench tests. Active global/visitor/IP counters are process-local and never persist coordinates, raw IPs, cookie values, prompts or transcripts. Keep one worker/replica.

The verified release index lives at rag/index/knowledge.json with a SHA-256 sidecar. It contains 33 public chunks and 3072-dimensional vectors, model/metric configuration and the corpus fingerprint. It is not a mutable Chroma database. Deployment/runtime checks reject stale, incomplete or incompatible artifacts. DATABASE_URL is a backend-only secret; production requires sslmode=verify-full. See [the deployment guide](PXXL_DEPLOYMENT.md).

The HttpOnly signed visitor cookie is separate from localStorage history. generated/restored answer links use approved_links.json plus registered public-source destinations. Model/history text cannot extend either registry.


The owner-applied ledger_runtime_grants.sql preserves admissions pruning but makes debit rows append-only for the non-owner runtime role (SELECT/INSERT only). Reapply it to repair earlier DELETE grants. Sync owner CLI and async API operations share price calculation and client-window policy; both serialize mutations on metadata. API operations close their connection on cancellation and never refund uncertain committed work.
