# Portfolio App Flows

Updated: 10 November 2026 · **Implemented** remediated pre-RAG behavior. Stable flow IDs retain continuity with the original baseline. [Requirements](PRD.md), [data contracts](BACKEND_SCHEMA.md), and [verification](IMPLEMENTATION_PLAN.md#verification-scenarios) provide supporting detail.

## FLOW-01 — Entry and loading

REQ-10/11/13 · V-01/10/11/12.

```mermaid
flowchart TD
  A["Mount React"] --> B["Show orb; desktop is inert"]
  B --> C["Read guarded session boot flag"]
  C --> D["Minimum wait: 1700ms first visit or 820ms return"]
  B --> E["Preload local images and fonts; image errors settle"]
  E --> F["Readiness or 2800ms deadline"]
  D --> G["Minimum wait and bounded readiness both settle"]
  F --> G
  G --> H["Reveal; remove overlay after 460ms"]
  H --> I["Release inertness and apply pending deep-link focus"]
  I --> J["If hint unseen, show after 1500ms and hide after 6900ms"]
```

[Preloader](../src/components/effects/BootPreloader.tsx), [App](../src/App.tsx), and [session helper](../src/utils/storage.ts). Hint reads/delayed writes are guarded. Reduced motion makes the orb static and shortens supported effects, while configured boot minimums remain. The waits are not measured latency claims.

## FLOW-02 — Explore a project

REQ-02/03/05 · V-02/07/12.

```mermaid
flowchart TD
  A["Desktop project icon"] --> B["Click, tap, Enter or Space"]
  B --> C{"Already open?"}
  C -->|Yes| D["Raise existing instance; preserve position and expansion"]
  C -->|No| E["Create project window"]
  D --> F["Push explicit slug only if requested project differs"]
  E --> F
  F --> G["Focus content; floating desktop or full-screen mobile"]
  G --> H["Read contribution, behavior and tech stack"]
  H --> I["Inspect configured live or GitHub links"]
```

[DesktopIcon](../src/components/desktop/DesktopIcon.tsx), [window manager](../src/hooks/useWindowManager.ts), and [ProjectWindow](../src/components/windows/ProjectWindow.tsx). Desktop hover/focus previews appear only without an open window or arrangement session. One image renders; missing supplied image requests produce “Preview unavailable.” Escrow remains repository-only; Policy.ng remains live-link-only. External links open separately.

## FLOW-03 — Window lifecycle and focus

REQ-04/05/09 · V-03/04/07.

```mermaid
flowchart TD
  A["Open window"] --> B["Pointer or focus enters; raise unless already active"]
  B --> C{"Action"}
  C -->|Desktop drag| D["Bound pixel position; disabled while expanded"]
  C -->|Expand or restore| E["Toggle expansion; retain original position"]
  C -->|Close or unconsumed Escape| F["Remove window; clear only its matching project fragment"]
  F --> G{"Another window remains?"}
  G -->|Yes| H["Focus remaining active window"]
  G -->|No| I["Focus visible opener or desktop launcher after visibility settles"]
```

[Reducer](../src/state/windows.ts) and [WindowFrame](../src/components/windows/WindowFrame.tsx). Desktop dialogs are nonmodal; mobile backgrounds and covered windows are inert. Mobile hides expand/minimize and disables drag. Yellow minimize remains decorative. Escape first cancels an arrangement session. Close-button exit waits 180ms (zero for reduced motion); Escape dismisses immediately.

## FLOW-04 — About, contact, and optional geography

REQ-08/12 · V-09/13.

```mermaid
flowchart TD
  A["Open About; clear badge through guarded storage"] --> B["Read biography, identity, email and Lagos location"]
  B --> C["Activate email to open visitor mail client"]
  B --> D["Location section approaches scroll viewport"]
  D --> E["Lazy module with local boundary and 10-second deadline"]
  E --> F["Construct map and worker; initialize with 10-second watchdog"]
  F --> G["Ready globe; rotate only while active and visible"]
  E -->|Module failure| H["Unavailable panel; biography/contact remain usable"]
  F -->|Fatal failure or timeout| H
  G -->|Recoverable resource error| I["Keep globe; show resource warning"]
  H --> J["Explicit Retry starts a fresh module/map attempt"]
  J --> E
```

[About](../src/components/windows/AboutWindow.tsx), [GlobeSection](../src/components/map/GlobeSection.tsx), and [globe](../src/components/map/LocationGlobe.tsx). Static location does not depend on the enhancement. Connections are illustrative, not visitor/employer records. Cleanup releases resources on failure/close/retry. Dock GitHub/X/LinkedIn actions continue to open their configured profiles; there is no portfolio contact backend.

## FLOW-05 — Read Notes

REQ-08/09 · V-04/09/15.

```mermaid
flowchart TD
  A["Open or raise Notes"] --> B["New instance selects About; existing instance retains selection"]
  B --> C["Experience and About tabs"]
  C --> D["Click or arrows, Home, End selects a tab and moves focus"]
  D --> E["Read note using the same date as its list preview"]
  E --> F["Close removes component-local selection"]
```

[NotesWindow](../src/components/windows/NotesWindow.tsx), [notes data](../src/data/notes.ts), and [shared profile](../src/data/profile.ts). Desktop uses sidebar/reader; mobile places tabs above the reader. Notes remains read-only, with no note database or editing flow.

## FLOW-06 — Rearrange, reset, commit, or cancel

REQ-06/09/11 · V-06/08/11.

```mermaid
flowchart TD
  A["Arrange apps control or mobile long press"] --> B["Create draft snapshot; select an app"]
  B --> C["Select another icon by click, tap or focus"]
  C --> D["Drag, direction buttons or arrow keys preview movement"]
  D --> E["Desktop: bounded steps; mobile: adjacent slots and displacement"]
  E --> F{"Finish session"}
  F -->|Done or Enter| G["Persist draft to active scope and return focus"]
  F -->|Cancel or Escape| H["Discard draft; restore saved layout and return focus"]
  B --> I["Reset previews default layout in draft"]
  I --> F
  B --> J["Breakpoint changes cancel unsaved draft"]
```

[App commands](../src/App.tsx), [layout hook](../src/hooks/useDesktopLayout.ts), and [layout operations](../src/state/layout.ts). Desktop arrows move 10px, mobile arrows/buttons move adjacent slots without wrapping. Mobile drops snap and swap within the draft. Boundary moves clamp. A polite status announces selection/movement. Ordinary desktop dragging outside arrangement mode still persists directly. Reset outside arrangement mode affects only that scope; denied storage never prevents in-memory operation.

## FLOW-07 — Project links and browser history

REQ-07 · V-05.

```mermaid
flowchart TD
  A["Mount, popstate or hashchange"] --> B["Parse explicit stable slug, ignoring letter case"]
  B --> C{"Recognized project?"}
  C -->|Yes| D["Create or raise matching project without a history push"]
  C -->|No| E["Dismiss project windows; retain About and Notes"]
  F["Ordinary icon launch"] --> G["Preserve other windows; push only a different requested project"]
  H["Focus another window or open an app"] --> I["No history push"]
  J["Close a project"] --> K["Clear URL only when parsed fragment identifies that project"]
```

[Manager](../src/hooks/useWindowManager.ts), [reducer](../src/state/windows.ts), and [slug mapping](BACKEND_SCHEMA.md#identifiers-and-url-mapping). Duplicate native events are idempotent. The fragment selects a project but does not store the whole workspace; richer workspace history is not introduced.

**Deferred:** conversational entry, retrieval, streaming, citations, chat persistence, and assistant failures require the later RAG specification.
