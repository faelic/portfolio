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
  case-text: "#c6c8c3"
  studio-muted: "#c3c4c0"
  studio-action: "#efeee7"
  preview-surface: "#232420"
  assistant-accent: "#B9D7E8"
  assistant-accent-ink: "#101A20"
  assistant-user-surface: "#1C2B35"
  assistant-user-text: "#E5F0F6"
  assistant-reply-surface: "#191C1F"
  assistant-reply-text: "#E7E9EB"
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
  studio-name:
    fontFamily: '"Zalando Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "38px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  studio-role:
    fontFamily: '"Zalando Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.1em"
  studio-summary:
    fontFamily: '"Zalando Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  project-title:
    fontFamily: '"Zalando Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "clamp(28px, 2.5vw, 36px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  project-body:
    fontFamily: '"Zalando Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  desktop: "clamp(28px, 2.54vw, 52px)"
  window: "clamp(13px, 1.15vw, 23px)"
  project-panel: "12px"
  preview: "14px"
  action: "8px"
  stack-tag: "6px"
  pill: "999px"
components:
  studio-primary-action:
    backgroundColor: "{colors.studio-action}"
    textColor: "#161714"
    rounded: "{rounded.action}"
    padding: "10px 17px"
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

**Implemented visual baseline:** a quiet near-black studio with a centered real portrait and identity, six glossy project apps and a glassy dock. Opening a project places a light window titlebar around a dark reading workspace. The portrait establishes the person; actual project artifacts carry the richer evidence. Preserve the centered studio direction approved on 13 November 2026; its history and current owner revisions are recorded in the [studio implementation](docs/STUDIO_IMPLEMENTATION.md).

This document captures the remediated interface and its local Assistant addition. The original 10 November review is historical; current controls, focus, failures, and readable accents are described here. Preserve the clean, restrained, editorial, premium, slightly experimental character established in [PRODUCT.md](PRODUCT.md). The [PRD](docs/PRD.md) owns audience and product requirements; [app flows](docs/APP_FLOW.md) own journeys; the [gap register](docs/IMPLEMENTATION_PLAN.md#gap-register) separates proposed changes from current behavior. The [assistant guide](docs/ASSISTANT.md) owns its local runtime contract.

**Key Characteristics:**

- Dark spatial canvas with lighting tied to icon placement.
- Familiar window and dock cues with minimal persistent navigation.
- Readable Zalando Sans studio and project-case text, with the existing About and Notes typography retained.
- Color concentrated in project artwork, project accents, status, and selected Notes.
- Full-screen reading views on mobile instead of draggable miniature desktop windows.

Source authority: [studio CSS](src/styles/portfolio.css), [global CSS](src/styles/global.css), [lamp CSS](src/components/effects/PendantLamp.css), [project data](src/data/projects.ts), and mounted components. Studio guidance refreshed 13 November 2026; prior remediation history remains in the implementation specification. Frontmatter captures current extracted values; runtime CSS remains the implementation source. Component frontmatter describes the default state; minimum heights and other behavior are documented in the component prose. No universal spacing scale or form-control system is implied.

## Colors

The palette uses near-black neutrals, soft white text, and localized accents. Frontmatter owns the extracted shared values; this section explains their roles.

### Primary and contextual accents

- **Project identity:** GitHub backgrounds come from each project's `githubAccent`, with the window's `accent` as fallback. BucketFlow and Escrow actions use dark text on their lighter accent backgrounds. Current case titles use neutral light text; retain project color in artwork and repository actions rather than tinting the reading surface.
- **Soft ivory action:** `live-action` makes the live-product link distinct inside dark case studies; text is dark. Hover becomes white while keeping dark text.
- **Warm note selection:** `notes-yellow` describes the Notes accent family. Actual selected surfaces use translucent warm gradients and a pale focus outline rather than a solid yellow fill.
- **Network green:** `network-green` belongs to globe connections. The availability indicator uses its own green gradient and glow; neither is a general action color.

| Project | Window accent | Repository background | Legacy heading reference |
|---|---|---|---|
| Monierave | `#79672d` | `#6855E7` | `#a99cff` |
| BucketFlow | `#63762c` | `#869B4D` | `#a8bd71` |
| BlockScan | `#087b9f` | `#1B274A` | `#a2b8ed` |
| Cleanup | `#1667d9` | `#156EEC` | `#79acff` |
| Escrow | `#5961d9` | `#F1744A` | `#ff9b78` |
| Policy.ng | `#07542f` | `#317450` | `#78bd8a` |

The heading column preserves earlier project identity references; it is not the current case-title styling. Earlier contrast calculations do not certify the current composite or interactive states.

### Neutral

- **Desktop and outside surfaces:** `desktop-surface` and `outside-surface` establish the quiet environment.
- **Text roles:** `primary-text`, `muted-text`, and `quiet-text` support hierarchy on dark surfaces. The studio summary uses `studio-muted`; current case reading uses `case-text`. The incumbent `story-text` remains for legacy story/About styles.
- **Studio materials:** `studio-action` is the warm primary launcher; `preview-surface` provides a restrained olive-neutral preview backdrop.
- **Window chrome:** white/light titlebars frame dark content; do not infer a light page theme from the frame's white base.
- **Borders:** `subtle-border` and other low-opacity separators define hierarchy without heavy outlines.

**The Contextual Accent Rule.** Keep project colors with their project and warm selection with Notes; adding a new feature does not redefine the whole desktop palette.

## Typography

**Implemented families:** locally served Zalando Sans Expanded for the FAVOUR wordmark, Zalando Sans for the studio and current project cases, the system stack for window chrome and Notes, and the incumbent monospace stack for much of About and legacy story styles. Both local fonts declare variable weights 200–900 and `font-display: swap`.

| Role | Implemented hierarchy and behavior |
|---|---|
| Brand | Uppercase; desktop size/weight/spacing in frontmatter. Mobile changes to 15px with tighter tracking. |
| Studio identity | Name, role, and summary roles in frontmatter. Mobile name is 32px, role 12px with .08em tracking, and summary remains 17px. The user-pinned uppercase 13px desktop role is intentional. |
| Project title | Neutral light text in the frontmatter role, shared across desktop and mobile. |
| Case-study body | Frontmatter role with a maximum 70ch paragraph width. Expanded implementation paragraphs use 15px / 1.75. |
| Case-study section heading | Zalando Sans, weight 600, 16px. The premise is 20px / 1.5 (19px on mobile), maximum 65ch. |
| About heading | System stack, weight 700, `clamp(25px, 2.4vw, 42px)`; mobile 34px. |
| Notes title/body | System stack; reader heading `clamp(23px, 2vw, 34px)` at weight 650; body `clamp(10px, 0.93vw, 16px)` at line-height 1.42. Mobile heading 34px and body 15px / 1.55. |
| Stack tags and metadata | Compact labels with lower contrast and controlled spacing; wrap tags rather than truncating the technology list. |

**The Reading Surface Rule.** Keep longer copy inside scrollable windows with an explicit hierarchy of title, role, premise, visual evidence, contribution, and engineering decision. Keep current case prose at 15px on mobile as well as desktop. Extraction is not approval of every contrast or control measurement.

## Layout

**Implemented studio:** the environment fills the viewport and its home surface scrolls vertically when needed. Center the portrait, identity, summary, and primary/contact actions above the six project apps. Keep persistent app descriptions. At widths ≥1200px apps occupy one row; below that they occupy three columns by two rows. Rearrangement swaps slots and preserves saved order rather than free-floating permanent coordinates. The lamp is centered and availability occupies the upper rail. Windows remain fixed and scroll internally; an open window locks home scrolling.

The wide dock is fixed near the bottom. At 768–1199px it enters normal document flow after the app grid with 40px top separation; this prevents overlap when the second row becomes visible. At ≤767px it returns to a fixed safe-area-aware bottom position. Reserve bottom room in the scrolling home so controls and final-row labels remain reachable. Short wide screens tighten vertical gaps without shrinking the identity.

Project and About windows begin at left 8%, top 14.8%, width 70.4%, with a bottom dock allowance. Notes begins at left 37.9%, top 17.7%, width 45.1%, height 59.3%. Expanded windows use near-edge insets while reserving the dock area. These are defaults, not a grid visitors must retain after dragging.

Project content has a plain dark outer workspace with a full-width inset reading panel, 16px workspace padding, and 24px content padding. Place title/status/role and live/repository actions first, followed by the short premise and real screenshot gallery (or explicit repository evidence). Only then introduce the longer contribution and engineering-decision columns. Engineering focus, collapsed implementation detail, stack, and project navigation follow. About retains width `min(84%, 1080px)`; Notes retains its 33% sidebar and remaining-width reader.

**Implemented mobile at widths ≤767px:** the desktop uses dynamic viewport height and safe-area spacing. Icons use two rows of three default slots with a separately saved mobile order. Opening any window hides desktop shortcuts and dock. Windows become edge-to-edge with a 52px titlebar plus top safe area, a 44px close target, and no drag/expand/minimize affordances. Case contribution and engineering-focus columns collapse to one column; preserve the same evidence-first order and 22px by 18px content padding. Notes tabs form a two-column row above its reader. Panels retain internal scrolling and bottom safe-area padding.

Desktop layouts at widths 768–850px or heights ≤580px reduce window minimum dimensions. The lamp has a separate desktop short-height adjustment at ≤620px. These rules are not proof of coverage across all tablets, landscape phones, text zoom, and browser chrome configurations; V-07 remains a regression scenario.

## Elevation & Depth

**Implemented:** depth combines tonal layers, diffuse shadows, transparent materials, and light. Keep the real transparent portrait, glossy app artwork, lamp illumination, and translucent dock as the studio’s material cues. The dock uses a translucent gray gradient with `blur(20px) saturate(1.08)`. Current project cases use a plain dark workspace and shadow-free inset reading panel; the window frame supplies the structural depth.

- **Window shadow:** `0 22px 55px rgba(0, 0, 0, 0.19), 0 2px 8px rgba(0, 0, 0, 0.08)`. Inactive windows use a softer shadow and muted title text.
- **Dock shadow:** inset highlight plus `0 8px 21px rgba(0, 0, 0, 0.22)`; keep background translucency visible.
- **Project preview shadow:** `0 16px 40px #0009` separates the compact hover/focus evidence card from the desktop.
- **Lamp influence:** JavaScript derives icon highlights and shadows from distance to the lamp source. Turning it off resets those values. Opening any window subdues the fixture and beam.

**The Content Priority Rule.** An open window receives visual priority: lighting subdues, desktop hover summaries disappear, and the dock dims behind an active project until pointer/focus interaction restores it. On mobile the dock hides entirely while a window is open.

## Shapes

**Implemented:** round-cornered desktop/windows and inset panels share a soft material language. The observed radius references are in frontmatter; expanded windows use `clamp(13px, 1vw, 20px)`, and mobile windows become square/edge-to-edge. Current project panels and gallery images use the project-panel radius; About retains its existing panel treatment. The transparent studio portrait has no added enclosing background or rounded crop. Wide app artwork is 80px with 18px corners; mobile uses 64px with 15px corners. Dock and app artwork use rounded silhouettes, traffic lights are circular, and availability/tooltips are pill-shaped.

Tags use compact corners, actions slightly larger corners, and panels larger corners. Do not turn a few observed sizes into an invented global spacing or radius scale. Borders are generally thin and low-contrast, with explicit focus treatment on interactive controls.

## Components

### Studio introduction

**Implemented:** a transparent real portrait above the role and concise scope summary, “Start with BlockScan,” and Contact. Contact keeps its envelope outline and visible label; its flap opens once on hover/focus and returns when interaction ends. Reduced motion leaves the envelope closed and static. Only render the résumé link when a real URL is supplied. Keep centered alignment, generous breathing room, and text selection. Open windows subdue the introduction; mobile hides it while reading. The [studio implementation](docs/STUDIO_IMPLEMENTATION.md) records the current composition and historical revisions.

### Desktop icons

**Implemented:** image and label act as one semantic button with “Open [project]” as the accessible name. Rest, hover/focus, launch, drag, and lamp-off states exist. Fine-pointer hover lifts and slightly enlarges the artwork. Keyboard Enter/Space launches. Drag commits by swapping grid slots; mobile hold enters slot arrangement with a toolbar. Arrange apps opens a draft session shared with mobile hold. Clicking/tapping or focusing an icon selects it. Direction controls and arrow keys move among adjacent grid slots and swap occupants without wrapping; six columns become three below 1200px. Done/Enter saves; Cancel/Escape restores the snapshot; Reset previews defaults. Selection has an outline and instructions/status feedback.

### Project previews

**Implemented:** hover or keyboard focus intentionally waits 180ms before revealing a viewport-clamped 320px evidence card. Use the small real JPEG preview rather than downloading full gallery assets; the card names the contribution and an engineering decision. Escrow shows an explicit repository-only note. Pointer travel into the card keeps it visible, and Escape dismisses it. Hide previews during arrangement and whenever a window opens. Keep the delay intentional.

### Window frame and controls

**Implemented:** light titlebar, optional project icon, title, and functional circular close and expand buttons. The decorative minimize light is removed. Close and expand have accessible labels and focus rings; expansion updates its pressed state. Window elements are labeled dialogs; focus is applied after mount and DOM visibility settle. Desktop dialogs are nonmodal; they do not claim `aria-modal`.

**Implemented — GAP-05:** focus entering a window raises it, dismissal restores the next active window or explicit launcher, and mobile covered/background controls are inert. Launchers pass their DOM reference to cover touch/WebKit clicks that do not focus buttons. Desktop close/expand hit areas are 24px around 12px visual lights; the mobile close target is 44px. Lamp and utility focus have explicit outlines. A closing window becomes inert during its exit, then is removed when the animation settles. These improvements do not establish full accessibility conformance.

### Project evidence, actions, and tags

**Implemented:** the gallery shows real project images with `object-fit: contain`, natural width, and a 460px maximum image height. Captioned screenshot-choice buttons expose `aria-pressed`; opening an image reveals its full-size asset. Place this evidence immediately after the premise and role, before longer contribution and decision copy. Escrow has an explicit repository-only section. Live actions are ivory/dark text; GitHub actions use project identity with a readable text treatment. Actions retain minimum 42px height, rounded corners, and visible focus. Stack tags are informational, not buttons. Assistant retains its own composer styles.

**The Evidence Order Rule.** Let visitors inspect a real artifact before reading the longer explanation. Keep contribution boundaries visible, implementation detail collapsible, and curated Previous/Next navigation inside the same project window. Its order is independent of visitor app rearrangement; the final case offers Contact, and Back to desktop restores the home. Preserve hashes and browser history through the journey.

**Implemented — GAP-11:** failed supplied screenshots show “Preview unavailable” with a project label in the image’s reserved space. Failed icons use an inline drawn fallback without another image request; titlebar and repository-only icon uses share it. Changing the source retries. Escrow’s intentionally absent screenshot remains a distinct repository-only state.

### Dock and application navigation

**Implemented:** About, Notes, Assistant, a divider, then GitHub, X, and LinkedIn. Hover/focus labels are white tooltips; keyboard focus gets an outline. Fine-pointer proximity gently magnifies neighboring icons up to scale 1.2; reduced motion keeps scale 1 and coarse/no-hover input bypasses magnification. Current targets are 44px. A small running dot appears only for an actually open About, Notes, or Assistant window, with “Window open” exposed to assistive technology; social links receive no running indicator. The arrangement toolbar replaces the dock during rearranging.

**Assistant discovery:** the permanent dock launcher opens the Assistant. The prior timed floating invitation and unread About badge are absent from the centered studio shell. Preserve the existing Assistant surface and lazy runtime behavior below.

### Assistant

**Implemented locally — refreshed 14 November:** a third dock application with a soft ice blue (`#B9D7E8`) chat icon and Send button. The assistant reading surface, loading state, and titlebar share the landing canvas (`#080808` via `--surface`), with Zalando Sans text and a subdued composer. Ice-blue controls use dark ink (`#101A20`) for readable contrast. The introduction centers Favour’s uploaded portrait, a short heading and description above the bottom composer. Self-hosted transparent WebP assets also replace the About and About dock portrait placeholders. The Assistant launcher keeps its chat icon.

Visitor bubbles align right with blue-tinted graphite (`#1C2B35`) and cool off-white text (`#E5F0F6`); assistant bubbles align left on neutral charcoal (`#191C1F`) with soft white text (`#E7E9EB`) and a portrait beside every response. Metadata reads `HH:mm · You` and `Avartar · HH:mm` in local 24-hour time. Reply timestamps begin with the first visible text and remain fixed; older saved chats without a time show only sender identity. The portrait and “Avartar is thinking…” precede visible output; reduced motion removes the subtle ellipsis animation. User text stays plain; assistant text supports safe basic Markdown. The history preference uses a sliding switch with a 44px label target and visible keyboard focus. The welcome heading is “Hi! I'm Favour's assistant”, followed by “Ask me about his work, projects, or experience. My answers draw from his portfolio.” Short suggested questions use an inline, wrapping row with the black canvas background, subtle neutral borders that remain unchanged on hover, and a hand cursor as the only hover change. Their keyboard outline is neutral, not ice blue. Suggestions fill a draft and require Send. Clear conversation is an icon-only trash control with a tooltip and accessible label, disabled when empty. Retrieved references are not displayed beneath answers, including restored messages; the underlying grounding pipeline is unchanged.

Desktop begins at left 22%, top 10%, width 56%, with the existing dock allowance. Mobile inherits the full-screen frame; visual-viewport resize events keep the composer above the keyboard. History preference and Clear conversation occupy a compact top rail, with 44px mobile interaction heights. Send/Stop and the composer stay at the bottom; the transcript scrolls independently and follows new output only while near the bottom. Status announcements avoid reading every token. Error copy preserves drafts; stopped responses stay labelled. See `src/components/assistant/assistant.css` for scoped styles.

### Arrangement toolbar

**Implemented:** a small Arrange apps utility opens the mode. The toolbar names the selected app, explains saving, and exposes four 44px direction controls plus Reset, Cancel, and Done. It uses the existing dark material and rounded controls, replaces the dock during arrangement, and wraps into two rows on mobile. Direction glyphs are authored SVG. Scope changes discard unsaved drafts.

### Notes

**Implemented:** Experience and About are tabs, About initially selected. Selection uses a warm translucent gradient and lighter type; keyboard arrows wrap and Home/End navigate. The reader is a labeled, focusable tab panel. Both visual and ARIA selection update together. Preview and reader now share each note’s authoritative date without changing the underlying authored/updated dates (GAP-08 resolved).

### Loading, lamp, and globe

**Implemented studio motion:** the desktop is available directly. The preloader component, boot timers/session writes, overlay CSS, and preloader-only orb dependency are removed; landing images and fonts never gate interaction. Native Web Animations launch windows from their visible launcher over 240ms and return them over 180ms; a direct hash visit fades because it has no real launcher. Reduced motion uses an 80ms opacity fade without translation or scaling. Project-to-project navigation replaces content within the same window without replaying entrance motion. Resize and preference changes settle active animations. The former lamp is not mounted. The globe retains module-loading and geographic-loading states, then a green connection network.

**Interface sound:** default off, with a visible sound preference that controls all cuelume paths and persists locally. Engine volume is 0.2; opening, closing, and lamp changes use quiet semantic cues rather than continuous hover sounds. Reduced motion also stops globe idle rotation and dock magnification. No motion/sound accessibility certification is implied.

**Implemented — GAP-07:** “Based in Lagos, Nigeria” remains outside the optional map. The module loads near the section; a local boundary/deadline handles download failures. Map initialization has a 10-second watchdog; fatal errors/context loss show an unavailable state and explicit Retry. Recoverable resource errors preserve the globe with a warning. The globe is supplementary image content rather than an application-role widget. Rotation pauses offscreen, in hidden documents, and when About is inactive.

## Do's and Don'ts

### Do

- **Do** preserve FAVOUR, the working desktop, the lamp, the dock, and the six real project identities.
- **Do** retain the desktop/mobile distinction and safe-area-aware full-screen reading behavior.
- **Do** keep contribution boundaries and repository-only evidence explicit, especially for Policy.ng and Escrow.
- **Do** carry focus, reduced motion, loading, and failure states into future designs; retain the tested save/cancel and fallback contracts.
- **Do** use the existing project accent and current studio/case type roles when extending a surface.
- **Do** retain the centered real portrait, readable identity, persistent app descriptions, deliberate preview delay, truthful running states, and compact dock flow.

### Don't

- **Don't** present a tunnel, real minimization, or contact form as an existing component. The screenshot gallery and local Assistant chat are implemented; public backend deployment remains separate.
- **Don't** fabricate deployed screenshots, backend capabilities, AI experience claims, or measured accessibility/performance results.
- **Don't** replace the approved dark desktop identity as a side effect of adding documentation or later RAG functionality.
- **Don't** assume every translucent label, project accent, or small control is accessible merely because it is documented here.


### Desktop settings

The gear opens a native modal with a black canvas, neutral border, 44px controls, keyboard focus containment and Escape dismissal. Focus returns to the gear. Drag is the default preference; arrow controls are optional, and keyboard arrows remain available in either arrangement mode. Rearrange apps closes the modal before entering the existing Done/Cancel workflow. Reset affects the current desktop/mobile order and offers Undo for eight seconds. Layout storage keys and existing orders remain intact.

The Drag/Arrows segmented selector includes a miniature demonstration using real project icons. It plays once on method changes, uses a static example for reduced motion, and never changes the actual arrangement. Reset to default is a quiet action shown only for customized orders; default layouts show Default order. Undo remains available after reset.

The separate speaker remains a quick mute control. Settings contains a sound switch and a 0–100% volume slider with a visible percentage. While muted, the slider is gray and labelled Saved volume; when audible, it uses the existing ice-blue accent. Play sample appears only when sound is audible. Defaults remain muted and 20%. Moving the slider does not enable sound or play samples. Preferences persist locally with guarded storage, under `favour.arrangement-method.v1` and `favour.interface-volume.v1`; audio enablement retains its existing key.


### Restored original project windows — 14 November

The previous project-window component and project-specific CSS are restored from repository history to reproduce the supplied video, not reinterpret its composition. Preserve the original monospace typography, project-colored headings, story sections, compact static featured image, original inset-panel spacing and surface treatment, and original responsive behavior. Monierave uses its public hero image, matching the recording. Project titlebars use circular close/expand indicators within equal 24px targets; the inactive minimize indicator is removed. Mobile keeps its 44px close control. The only added in-content controls are Previous project and Next project after the original story/actions. On mobile the sequence navigation is ordered after all main content and source links. There is no Back to desktop, final contact callout, screenshot picker, case-overview redesign, or Ask AI button. Navigation continues to reuse the window and support hashes and browser history.
