---
name: FAVOUR
description: A restrained interactive desktop portfolio for a software engineer.
colors:
  desktop-surface: "#080808"
  outside-surface: "#050505"
  primary-text: "#f5f5f5"
  white: "#fff"
  muted-text: "rgba(255, 255, 255, 0.75)"
  quiet-text: "rgba(255, 255, 255, 0.5)"
  subtle-border: "rgba(255, 255, 255, 0.1)"
  story-text: "#a9aaac"
  live-action: "#ececea"
  notes-yellow: "#ffe28b"
  network-green: "#0aff3e"
typography:
  brand:
    fontFamily: '"Zalando Sans Expanded", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "clamp(11px, 1.094vw, 18px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.05em"
  project-title:
    fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    fontSize: "clamp(24px, 2.25vw, 40px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  project-body:
    fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    fontSize: "clamp(11px, 0.85vw, 15px)"
    fontWeight: 400
    lineHeight: 1.78
    letterSpacing: "-0.018em"
rounded:
  desktop: "clamp(28px, 2.54vw, 52px)"
  window: "clamp(13px, 1.15vw, 23px)"
  project-panel: "clamp(18px, 1.55vw, 27px)"
  action: "8px"
  stack-tag: "6px"
  pill: "999px"
components:
  project-live-action:
    backgroundColor: "{colors.live-action}"
    textColor: "#111"
    rounded: "{rounded.action}"
    padding: "0 15px"
  project-stack-tag:
    backgroundColor: "rgba(255, 255, 255, 0.035)"
    textColor: "#b8b9bb"
    rounded: "{rounded.stack-tag}"
    padding: "7px 9px"
---

# Design System: FAVOUR

## Overview

**Creative North Star: “The Working Desktop.”**

**Implemented visual baseline:** a quiet dark desktop with six tactile project icons, a hanging lamp, restrained branding, and a glassy dock. Opening a project places a light window titlebar around a dark reading workspace. Generous empty desktop space gives the project artifacts room to lead; richer detail lives inside windows.

This document captures the remediated pre-RAG interface, not a new visual direction. The original 10 November review is historical; current controls, focus, failures, and readable accents are described here. Preserve the clean, restrained, editorial, premium, slightly experimental character established in [PRODUCT.md](PRODUCT.md). The [PRD](docs/PRD.md) owns audience and product requirements; [app flows](docs/APP_FLOW.md) own journeys; the [gap register](docs/IMPLEMENTATION_PLAN.md#gap-register) separates proposed changes from current behavior.

**Key Characteristics:**

- Dark spatial canvas with lighting tied to icon placement.
- Familiar window and dock cues with minimal persistent navigation.
- Monospace case-study reading surfaces, supported by system UI typography.
- Color concentrated in project artwork, project accents, status, and selected Notes.
- Full-screen reading views on mobile instead of draggable miniature desktop windows.

Source authority: [global CSS](src/styles/global.css), [lamp CSS](src/components/effects/PendantLamp.css), [project data](src/data/projects.ts), and mounted components. Updated 10 November 2026; original runtime baseline `ebd7c51`. The remediation record is in the implementation specification. Frontmatter values are extracted design references; runtime CSS remains the implementation source. Component frontmatter describes the default state; minimum heights and other behavior are documented in the component prose. No universal spacing scale or form-control system is implied.

## Colors

The palette uses near-black neutrals, soft white text, and localized accents. Frontmatter owns the extracted shared values; this section explains their roles.

### Primary and contextual accents

- **Project identity:** GitHub backgrounds come from each project's `githubAccent`, with the window's `accent` as fallback. Headings use lighter, readable variants of each identity color; BucketFlow and Escrow actions use dark text on their lighter accent backgrounds. These are per-project identities, not one global CTA color.
- **Soft ivory action:** `live-action` makes the live-product link distinct inside dark case studies; text is dark. Hover becomes white while keeping dark text.
- **Warm note selection:** `notes-yellow` describes the Notes accent family. Actual selected surfaces use translucent warm gradients and a pale focus outline rather than a solid yellow fill.
- **Network green:** `network-green` belongs to globe connections. The availability indicator uses its own green gradient and glow; neither is a general action color.

| Project | Window accent | Repository background | Readable heading |
|---|---|---|---|
| Monierave | `#79672d` | `#6855E7` | `#a99cff` |
| BucketFlow | `#63762c` | `#869B4D` | `#a8bd71` |
| BlockScan | `#087b9f` | `#1B274A` | `#a2b8ed` |
| Cleanup | `#1667d9` | `#156EEC` | `#79acff` |
| Escrow | `#5961d9` | `#F1744A` | `#ff9b78` |
| Policy.ng | `#07542f` | `#317450` | `#78bd8a` |

Representative calculations put these headings at 7.58–9.06:1 against the lightest reading-panel base; current GitHub text/background pairs are at least 4.69:1. This does not certify every composite or interactive state.

### Neutral

- **Desktop and outside surfaces:** `desktop-surface` and `outside-surface` establish the quiet environment.
- **Text roles:** `primary-text`, `muted-text`, and `quiet-text` support hierarchy on dark surfaces. Case-study body uses the separate `story-text` value.
- **Window chrome:** white/light titlebars frame dark content; do not infer a light page theme from the frame's white base.
- **Borders:** `subtle-border` and other low-opacity separators define hierarchy without heavy outlines.

**The Contextual Accent Rule.** Keep project colors with their project and warm selection with Notes; adding a new feature does not redefine the whole desktop palette.

## Typography

**Implemented families:** locally served Zalando Sans Expanded for the FAVOUR wordmark, Zalando Sans for selected desktop text, the system stack for window chrome and Notes, and the monospace stack for project stories and much of About. Both local fonts declare variable weights 200–900 and `font-display: swap`.

| Role | Implemented hierarchy and behavior |
|---|---|
| Brand | Uppercase; desktop size/weight/spacing in frontmatter. Mobile changes to 15px with tighter tracking. |
| Project title | Monospace role in frontmatter; project-specific accent. Mobile uses `clamp(30px, 9.5vw, 40px)`. |
| Case-study body | Monospace role in frontmatter, maximum 68ch; mobile changes to 13px and line-height 1.72. |
| Case-study section heading | Monospace, weight 600, `clamp(13px, 1.05vw, 18px)`; mobile 14px. |
| About heading | System stack, weight 700, `clamp(25px, 2.4vw, 42px)`; mobile 34px. |
| Notes title/body | System stack; reader heading `clamp(23px, 2vw, 34px)` at weight 650; body `clamp(10px, 0.93vw, 16px)` at line-height 1.42. Mobile heading 34px and body 15px / 1.55. |
| Stack tags and metadata | Compact labels with lower contrast and controlled spacing; wrap tags rather than truncating the technology list. |

**The Reading Surface Rule.** Keep longer copy inside scrollable windows with an explicit hierarchy of title, section heading, body, and actions. Small desktop clamp sizes and muted text still require accessibility review; extraction is not approval of every measurement.

## Layout

**Implemented desktop:** the environment fills the viewport; the page itself does not scroll. Project icons use percentage positions with user overrides. The wordmark and availability occupy the upper rail, the lamp is centered above projects, and the dock sits near the bottom. Windows scroll internally.

Project and About windows begin at left 8%, top 14.8%, width 70.4%, with a bottom dock allowance. Notes begins at left 37.9%, top 17.7%, width 45.1%, height 59.3%. Expanded windows use near-edge insets while reserving the dock area. These are defaults, not a grid visitors must retain after dragging.

Project content has an outer textured gray workspace, then a dark inset scrolling panel. A two-column case layout pairs a sticky 16:9 image with narrative. The reading panel uses width `min(88%, 1220px)`; About uses `min(84%, 1080px)`. Project content padding uses fluid clamps, with column gap `clamp(30px, 3.7vw, 66px)`. Notes uses a 33% sidebar and remaining-width reader.

**Implemented mobile at widths ≤767px:** the desktop uses dynamic viewport height and safe-area spacing. Icons use two rows of three default slots with independent saved positions. Opening any window hides desktop shortcuts and dock. Windows become edge-to-edge with a 52px titlebar plus top safe area, a 44px close target, and no drag/expand/minimize affordances. Case layout becomes title, image, story, stack, links in one column. Notes tabs form a two-column row above its reader. Panels retain internal scrolling and bottom safe-area padding.

Desktop layouts at widths 768–850px or heights ≤580px reduce window minimum dimensions. The lamp has a separate desktop short-height adjustment at ≤620px. These rules are not proof of coverage across all tablets, landscape phones, text zoom, and browser chrome configurations; V-07 remains a regression scenario.

## Elevation & Depth

**Implemented:** depth combines tonal layers, diffuse shadows, transparent materials, and light. The dock uses a translucent gray gradient with `blur(20px) saturate(1.08)`. The project workspace has a faint grid and gradient, while its inset reading panel casts a broad shadow stack. This is a layered system; shadows establish windows and material hierarchy.

- **Window shadow:** `0 22px 55px rgba(0, 0, 0, 0.19), 0 2px 8px rgba(0, 0, 0, 0.08)`. Inactive windows use a softer shadow and muted title text.
- **Dock shadow:** inset highlight plus `0 8px 21px rgba(0, 0, 0, 0.22)`; keep background translucency visible.
- **Featured image shadow:** `0 18px 42px rgba(0, 0, 0, 0.32)` plus a subtle inset edge.
- **Lamp influence:** JavaScript derives icon highlights and shadows from distance to the lamp source. Turning it off resets those values. Opening any window subdues the fixture and beam.

**The Content Priority Rule.** An open window receives visual priority: lighting subdues, desktop hover summaries disappear, and the dock dims behind an active project until pointer/focus interaction restores it. On mobile the dock hides entirely while a window is open.

## Shapes

**Implemented:** round-cornered desktop/windows and inset panels share a soft material language. The observed radius references are in frontmatter; expanded windows use `clamp(13px, 1vw, 20px)`, and mobile windows become square/edge-to-edge while their reading panels use 22px corners. Project images use `clamp(12px, 1.15vw, 16px)` corners. Dock and app artwork use rounded silhouettes, traffic lights are circular, and availability/tooltips are pill-shaped.

Tags use compact corners, actions slightly larger corners, and panels larger corners. Do not turn a few observed sizes into an invented global spacing or radius scale. Borders are generally thin and low-contrast, with explicit focus treatment on interactive controls.

## Components

### Desktop icons

**Implemented:** image and label act as one semantic button with “Open [project]” as the accessible name. Rest, hover/focus, launch, drag, and lamp-off states exist. Fine-pointer hover lifts and slightly enlarges the artwork. Keyboard Enter/Space launches. Pointer drag stays inside the desktop; mobile hold enters slot arrangement with a toolbar. Arrange apps opens a draft session shared with mobile hold. Clicking/tapping or focusing an icon selects it; direction buttons and arrow keys move it. Desktop steps are 10px; mobile moves among adjacent slots and swaps occupants without wrapping. Done/Enter saves; Cancel/Escape restores the snapshot; Reset previews defaults. Selection has an outline and instructions/status feedback.

### Window frame and controls

**Implemented:** light titlebar, optional project icon, title, circular close and expand buttons, and a decorative yellow minimize light. Close and expand have accessible labels and focus rings; expansion updates its pressed state. Window elements are labeled dialogs; focus is applied after mount/boot and DOM visibility settle. Desktop dialogs are nonmodal; they do not claim `aria-modal`.

**Implemented — GAP-05:** focus entering a window raises it, dismissal restores the next active window or explicit launcher, and mobile covered/background controls are inert. Launchers pass their DOM reference to cover touch/WebKit clicks that do not focus buttons. Desktop close/expand hit areas are 24px around 12px visual lights; the mobile close target is 44px. Lamp and utility focus have explicit outlines. Visibility settles immediately on dismissal while opacity still fades. These improvements do not establish full accessibility conformance.

### Project evidence, actions, and tags

**Implemented:** a featured screenshot uses `object-fit: contain` in a 16:9 frame. Escrow has an explicit repository-only placeholder. Narrative sections have subtle top separators. Live actions are ivory/dark text; GitHub actions use project identity/white text. Actions have a minimum 42px height, rounded corners, visible focus outline, hover lift, and pressed compression. Stack tags are informational, not buttons. There is no input, chat box, gallery control, or form-field design to extract.

**Implemented — GAP-11:** failed supplied screenshots show “Preview unavailable” with a project label in the same 16:9 space. Failed icons use an inline drawn fallback without another image request; titlebar and repository-only icon uses share it. Changing the source retries. Escrow’s intentionally absent screenshot remains a distinct repository-only state.

### Dock and application navigation

**Implemented:** About, Notes, a divider, then GitHub, X, and LinkedIn. Hover/focus labels are white tooltips; keyboard focus gets an outline. Pointer proximity magnifies neighboring icons up to scale 1.84 (1.12 with reduced motion); coarse/no-hover input bypasses magnification. About starts with a numbered badge until its seen flag is set. Mobile icons are 48px and tooltips are hidden; the arrangement toolbar replaces the dock during rearranging.

### Arrangement toolbar

**Implemented:** a small Arrange apps utility opens the mode. The toolbar names the selected app, explains saving, and exposes four 44px direction controls plus Reset, Cancel, and Done. It uses the existing dark material and rounded controls, replaces the dock during arrangement, and wraps into two rows on mobile. Direction glyphs are authored SVG. Scope changes discard unsaved drafts.

### Notes

**Implemented:** Experience and About are tabs, About initially selected. Selection uses a warm translucent gradient and lighter type; keyboard arrows wrap and Home/End navigate. The reader is a labeled, focusable tab panel. Both visual and ARIA selection update together. Preview and reader now share each note’s authoritative date without changing the underlying authored/updated dates (GAP-08 resolved).

### Loading, lamp, and globe

**Implemented:** the boot overlay has a canvas orb and status semantics; the desktop is inert until boot completes. Entry staggers desktop elements. Desktop windows enter over 245ms and close over 180ms; mobile CSS uses 260ms entry and 190ms exit, while removal still follows the shared 180ms timer. Lamp transitions use `cubic-bezier(0.22, 1, 0.36, 1)` and opacity/blur changes. The globe shows module-loading and geographic-loading states, then a green connection network.

Reduced motion shortens global CSS animations/transitions, makes the orb static, stops globe idle rotation, and reduces dock magnification; it does not remove boot minimum waits. Interface sound exists without a mute UI. No motion/sound accessibility certification has been performed.

**Implemented — GAP-07:** “Based in Lagos, Nigeria” remains outside the optional map. The module loads near the section; a local boundary/deadline handles download failures. Map initialization has a 10-second watchdog; fatal errors/context loss show an unavailable state and explicit Retry. Recoverable resource errors preserve the globe with a warning. The globe is supplementary image content rather than an application-role widget. Rotation pauses offscreen, in hidden documents, and when About is inactive.

## Do's and Don'ts

### Do

- **Do** preserve FAVOUR, the working desktop, the lamp, the dock, and the six real project identities.
- **Do** retain the desktop/mobile distinction and safe-area-aware full-screen reading behavior.
- **Do** keep contribution boundaries and repository-only evidence explicit, especially for Policy.ng and Escrow.
- **Do** carry focus, reduced motion, loading, and failure states into future designs; retain the tested save/cancel and fallback contracts.
- **Do** use the existing project accent and type roles when extending a current surface.

### Don't

- **Don't** present a tunnel, gallery, real minimization, form, or chat UI as an existing component.
- **Don't** fabricate deployed screenshots, backend capabilities, AI experience claims, or measured accessibility/performance results.
- **Don't** replace the approved dark desktop identity as a side effect of adding documentation or later RAG functionality.
- **Don't** assume every translucent label, project accent, or small control is accessible merely because it is documented here.
