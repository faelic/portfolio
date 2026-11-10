# Backend Schema and Current Data Model

Updated: 10 November 2026 · Remediated pre-RAG implementation. Historical source baseline: `ebd7c51`.

## Backend boundary

**Implemented:** this portfolio has **no backend or database schema**. There are no server-side entities, SQL tables, migrations, application API endpoints, account records, authentication tokens, vector indexes, or chat records. This document describes what the current frontend stores and consumes; its filename does not imply a server exists.

Content is compiled from TypeScript and components. Local/session storage belong to each visitor's browser and are not authoritative shared databases. External map services do not persist portfolio business records on the app's behalf. Monierave's ledger and Policy.ng's admin APIs are descriptions of other projects, not entities in this portfolio.

**Deferred:** designing a database or backend for RAG. Do not convert these UI types into database tables automatically. See the [PRD](PRD.md) for requirements and the [TRD](TRD.md) for execution boundaries.

## Content ownership

| Domain | Current source of truth | Consumption |
|---|---|---|
| Projects and hash conversion | [projects.ts](../src/data/projects.ts) | Desktop labels/hover summaries, window content, featured assets, project URLs |
| Model interfaces | [portfolio.ts](../src/types/portfolio.ts) | TypeScript compile-time checks; no runtime validation |
| Notes/experience | [notes.ts](../src/data/notes.ts) | Read-only Notes window |
| Profile and biography | [profile.ts](../src/data/profile.ts) | Shared identity, biography, and shorter Notes introduction |
| Social profiles and badge version | [Dock.tsx](../src/components/dock/Dock.tsx) | Embedded links and local badge preference |
| Geography | [locations.ts](../src/data/locations.ts) | Globe hub, connections, continent labels |
| Default mobile slots | [mobileLayout.ts](../src/data/mobileLayout.ts) | Icon placement and nearest-slot selection |
| SEO/social metadata | [index.html](../index.html) | Static page head; distinct from profile copy |
| Candidate knowledge content | [12 topic-based Markdown documents](../rag/README.md) | **Prepared:** corpus, metadata contract, original and owner-confirmed source mapping, evaluation cases. **Deferred:** runtime import and ingestion |

The knowledge corpus remains reference material under `rag/knowledge/`. GAP-03 corrected the original assistant passages to planned/not available; those qualifications survive the reorganization. The original source is preserved outside the corpus. The [data contract](../rag/DATA_CONTRACT.md) defines the content interface and a future chunking baseline; it does not implement ingestion or independently audit professional claims.

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

`AppKey` is `"about" | "notes"`. `WindowKey` is `` `project:${ProjectKey}` | AppKey ``. About and Notes have no implemented URL fragments. Registry order is Monierave, BucketFlow, BlockScan, Cleanup, Escrow, Policy.ng; spatial placement is configured separately.

`projectToHash` reads the explicit `slug` field. `hashToProject` removes a leading `#`, lowercases input, and matches that stable slug; it does not provide aliases such as `#policy.ng`, `#blockexplorer`, or `#approvalcleanup`. Unknown or empty input yields `undefined`. Title edits no longer change public hashes or storage identities (GAP-04 resolved).

## Project content model

**Implemented:** `projects` has type `Record<ProjectKey, Project>`. Optional properties below correspond to `?` in the source interface. Types constrain development builds, not untrusted runtime input.

| Fields | Type / optionality | Current use |
|---|---|---|
| `key`, `title`, `slug`, `desktopLabel` | `ProjectKey` and required strings | Internal identity, display title, stable fragment, icon label |
| `icon`, `accent` | `string`; required | Root-relative icon URL and window accent |
| `githubAccent` | Optional `string` | Repository action background; readable heading variants are defined in CSS |
| `desktopSummary`, `desktopStack` | `string`; required | Desktop hover/focus summary |
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
| App transients | Booting, entry-ready, hovered project, hint visibility, mobile arrangement mode, lamp state. |
| View transients | Selected note, pointer drag state, launch/close animation, dock tooltip/magnification, map readiness/error/interaction. |

Closing a window destroys its view state. Reopening an existing instance raises it without remounting; reloading loses all windows except a project reopened from a recognized fragment. Opener and window DOM references remain outside reducer state. No visitor-authored content is stored. Layout drafts are transient and become persisted preferences only on Done/Enter.

## Browser storage contracts

**Implemented:** exact keys and encodings below. Local-storage values are JSON encoded by [storage.ts](../src/utils/storage.ts); session values are raw strings. “Session” follows browser `sessionStorage` lifetime, including reloads in the same page session; there is no app-defined expiry time.

| Key | Store / value | Default and lifecycle | Owner / failure behavior |
|---|---|---|---|
| `favour.shortcut-layout.v2` | Local; JSON `Partial<Record<ProjectKey, Point>>` | `{}` means CSS desktop defaults; persists until removed/cleared | Layout hook; read/write/remove errors caught |
| `favour.shortcut-layout.mobile.v1` | Local; same JSON shape | `{}` means mobile defaults; separate from desktop | Layout hook; draft previews stay in memory; Done commits; errors caught |
| `favour.about-update-seen.v2` | Local; JSON boolean | Missing/false displays badge; opening About writes `true` | Dock; helper catches access/parse errors |
| `favour.boot-seen.v1` | Session; string `"true"` | Missing uses first-visit boot minimum; written after boot readiness | Preloader; read/write guarded |
| `favour.pendant-lamp-on.v1` | Session; string `"true"` / `"false"` | Lamp is on unless stored value is exactly `"false"` | App; read/write guarded; toggle still changes in-memory state |
| `favour.interaction-hint-seen.v2` | Session; string `"true"` | Only the string `"true"` suppresses the hint; invalid values use unseen default | App through guarded session helper, including delayed write (GAP-06 resolved) |

Example layout record:

```json
{
  "champ": { "x": 17.5, "y": 27 },
  "silences": { "x": 43.5, "y": 27 }
}
```

**Implemented default mobile layout:** Monierave `(4,27)`, BucketFlow `(36,27)`, BlockScan `(68,27)`, Cleanup `(4,54)`, Policy `(36,54)`, Escrow `(68,54)`. Values are percentages. A drop snaps to the nearest default slot by Euclidean distance; if occupied, its project is moved to the dragged project's original slot. Outside arrangement mode, reset removes only the current scope key. In arrangement mode it previews `{}`; Done removes the key and Cancel discards the preview. Scope changes cancel unsaved drafts.

**Implemented validation (GAP-06):** local-storage reads require a validator. Layout loading accepts only object containers and known finite points; invalid desktop entries are dropped and valid points clamp to actual icon bounds in the mounted view. Mobile overrides are accepted only when the effective six-slot layout is a unique permutation of the defined slots. Invalid records fall back to defaults. Badge values must be boolean. Session values are exactly raw `"true"` / `"false"`; unknown values use each flag’s default.

All store access, writes, removals, and delayed hint writes are guarded. Denied persistence preserves in-memory use; it cannot guarantee reload persistence. Version suffixes and encodings remain unchanged, with no migration or cross-tab synchronization.

**Verification:** V-06, V-08, and V-11 in the [scenario matrix](IMPLEMENTATION_PLAN.md#verification-scenarios) cover transactional save/cancel/reset, isolation, displacement, denied storage, and invalid records. RAG entities and backend wire contracts remain **Deferred**.
