# Portfolio Product Requirements

Updated: 10 November 2026 · Current pre-RAG implementation. The original source baseline was `ebd7c51`; historical observations are retained in the [implementation record](IMPLEMENTATION_PLAN.md#historical-baseline).

## Purpose and reading guide

FAVOUR helps recruiters, hiring managers, engineering/product/design leads, clients, and collaborators understand Favour Chukwuemerie Ututu's engineering work, inspect evidence, and make contact. Its working desktop also demonstrates interface engineering and product judgment.

**Implemented positioning:** **Software Engineer**, working across backend, frontend, AI, and blockchain applications. AI application building is current work; agentic AI engineering is ongoing learning. This does not imply equal expertise across domains or that the portfolio assistant has shipped.

| Label | Meaning |
|---|---|
| **Implemented** | Supported by current executable source; verification is recorded separately. |
| **Gap** | An unresolved limitation or finding with evidence. |
| **Proposed** | Work not yet implemented. |
| **Deferred** | Outside the current release, including RAG design and implementation. |

Read the [TRD](TRD.md), [design system](../DESIGN.md), [app flows](APP_FLOW.md), [data model](BACKEND_SCHEMA.md), and [implementation/verification record](IMPLEMENTATION_PLAN.md). Source governs current application behavior. The [prototype](../prototype/) is historical context. The [topic-based knowledge corpus](../rag/README.md) is not imported by the app. Other projects' backend, wallet, and AI features are portfolio claims, not features of this website or an audit of those repositories.

## Visitor outcomes and project inventory

Visitors should be able to find relevant work, understand Favour's contribution, distinguish learning demonstrations from commercial/team work, inspect available live/repository evidence, and reach contact information on desktop or mobile. These are acceptance outcomes, not measured conversion rates; no analytics is installed.

| Project | Evidence / contribution | Configured actions |
|---|---|---|
| Monierave | Banking simulation / production-like Go backend; not a licensed banking service | Live and GitHub |
| BucketFlow | Sepolia USDC allocation demonstration, contracts and frontend | Live and GitHub |
| BlockScan | Sepolia explorer, frontend/data integration; desktop label “Blockexplorer” | Live and GitHub |
| Cleanup | Recent ERC-20 allowance review/revocation demonstration with documented scan limits | Live and GitHub |
| Escrow | Smart-contract and frontend learning project; no fabricated deployed screenshot | GitHub only |
| Policy.ng | Frontend contribution to a team civic-tech product | Live only |

Each case renders a title, one featured screenshot or explicit repository-only presentation, contribution/build narrative, “How it works,” stack tags, and configured links. Additional images/capability metadata in source are not a mounted gallery. A network-failed screenshot says “Preview unavailable” without changing links or narrative.

About exposes shared identity/biography, email, readable Lagos location, and an optional globe loaded near its scroll position. Notes contains About and Experience; Experience covers Flamong / Policy.ng and independent projects. The dock contains About, Notes, GitHub, X, and LinkedIn. “Available” remains static copy.

## Requirements and acceptance criteria

All capabilities below are **Implemented**; the [verification matrix](IMPLEMENTATION_PLAN.md#verification-scenarios) states what was tested and what remains a manual limitation. Stable IDs retain continuity with the original baseline.

| ID | Requirement | Acceptance |
|---|---|---|
| REQ-01 | Truthful Software Engineer positioning | About, Notes, metadata, and knowledge agree; assistant is planned. V-15; GAP-02/03. |
| REQ-02 | Six discoverable projects | Every project opens without duplicate instances. V-02. |
| REQ-03 | Clear project evidence and contribution | Content/link parity remains; Escrow and Policy.ng retain intentional omissions; failed media stays labeled. V-02/12. |
| REQ-04 | Desktop window management | Raise, drag, expand/restore, close, and Escape work; focus follows active content and dismissal. Minimize stays decorative. V-03/04. |
| REQ-05 | Responsive full-screen mobile reading | Widths ≤767px use full-screen windows, inert backgrounds/covered windows, and accessible dismissal. V-07. |
| REQ-06 | Pointer and keyboard icon rearranging | Arrange apps, directional buttons/keys, draft reset, Done, Cancel, and mobile slot swaps work; scope changes discard drafts. V-06/08. |
| REQ-07 | Stable deep links and predictable navigation | Explicit existing hashes survive title edits; valid history raises the project; empty/unknown hashes dismiss projects while retaining apps. V-05. |
| REQ-08 | Discoverable background, experience, contact | Both notes use authoritative dates; email and three social profiles remain accessible. V-09/15. |
| REQ-09 | Semantic controls and keyboard access | Focus restoration, visible focus, enlarged targets, non-drag movement alternatives, mobile inertness, and readable location exist. V-04/10. |
| REQ-10 | Bounded boot and understandable failed assets | Failed/slow preload cannot block indefinitely; failed screenshots/icons retain meaningful presentation. V-01/12. |
| REQ-11 | Optional persistence | Guarded stores, validated shapes, scope isolation, and in-memory operation with denied storage. V-11. |
| REQ-12 | Optional geographic enhancement | Local module/map failure UI, bounded waits, explicit Retry, static location, and cleanup. V-13. |
| REQ-13 | Lamp, loading orb, sounds and motion preferences | Lamp restores within a session; supported motion is reduced; optional globe rotation pauses when hidden/inactive. V-10. |
| REQ-14 | Reproducible build and focused regressions | Lint, typecheck, unit/component tests, built-app browser suite, CI configuration, and recorded performance evidence. V-14. |

## Constraints and deferred work

Preserve the dark working desktop, lamp, dock, six showcases, public hashes, external links, legacy project keys, and separate stored device layouts. Maintain the React/TypeScript/Vite application rather than replacing its framework.

**Deferred:** RAG/chat UX, model/embedding providers, ingestion, retrieval, database design, chat persistence, APIs, credentials, evaluation, and operating costs. The website still has no backend, authentication, contact form, CMS, wallet connection, or assistant. Real minimization, a gallery, analytics, and new non-RAG features are not introduced by these fixes.

**Limitations:** automated tests and targeted contrast/focus work are not full accessibility conformance. Real assistive-technology coverage and physical-device testing remain explicit follow-ups. Sounds have no app-level mute control. The build still reports the lazy globe's large chunk; this is not automatically a measured performance defect.

## Baseline evidence and review gate

On 10 November 2026, before remediation, lint/typecheck/build passed and a bounded browser review observed desktop entry, Monierave opening/expansion/close, a 390×844 project view, Notes selection, and successful globe loading. That evidence is historical, not proof that the original implementation handled failures.

Current acceptance results and gap closures are recorded in the [implementation record](IMPLEMENTATION_PLAN.md). Review this baseline before independently specifying RAG. Do not treat planned assistant language as evidence of a shipped service.
