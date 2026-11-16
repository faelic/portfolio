# Personal studio implementation

## Current contract — 16 November 2026

The 13 November implementation and screenshot record below is historical. Later owner revisions removed the lamp, hover previews, app subtitles and separate name heading; restored original project windows with Previous/Next; and added the settings modal with miniature arrangement demonstrations. The backend/API security batch is independently described in RAG_SECURITY.md and does not change that visual design.

Owner revision on 16 November: remove the preloader entirely (including unused component, CSS and dependency); keep landing controls usable during image/font loading. Start with BlockScan is the recommended action. Contact retains the original envelope outline, with a short opening-flap hover/focus animation and static reduced-motion behavior. The other selected animated icons remain. Mobile header alignment and shared utility/dock footer are retained.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

Implemented the approved centered studio and connected project journey on 13 November 2026. This replaces the earlier left-introduction/right-grid composition. Backend services and assistant internals were outside this change.

## Historical 13 November behavior

- Centered portrait, proportionate identity, one value statement, featured case and Contact. Six project launchers form one row at 1200px+, otherwise a 3×2 grid. Wide/mobile docks remain fixed; the 768–1199px dock follows the grid in document flow.
- 180ms hover/focus intent previews show existing contribution/decision text and a 24–33KB screenshot derivative. Touch opens the case directly. Preview content is hoverable and Escape-dismissible; no full project screenshots or assistant requests on initial entry.
- Shared native window motion originates from actual launchers, with 240ms opening/180ms closing, reduced-motion fades, one close lifecycle, focus restoration, and cancellation on resize/reopening. Direct fragment visits fade in.
- Stateful 44px utility controls, preserved muted-by-default sound preference, restrained optional semantic cues, existing interactive illumination, real dock running indicators, and no automatic invitation/unread badge.
- Cases show their role, premise, and workflow screenshot before the longer engineering explanation. Previous/Next reuse window geometry, reset the reader/gallery, and preserve browser Back/Forward. The final case leads to Contact; Back to desktop dismisses open windows and focuses the current project launcher.
- Slot-based drag/keyboard arrangement stores separate validated desktop/mobile orders in `favour.shortcut-layout.v4` and `favour.shortcut-layout.mobile.v3`. Migration preserves relative reading order and older storage keys. Save/Cancel/Reset and unavailable-storage fallbacks remain supported.

## Verification

- Production build, TypeScript and ESLint passed. Vite retains existing large-chunk advisories for lazy assistant/globe bundles.
- 46 unit tests passed, including migration, cancellation, scope isolation, and interrupted-close behavior.
- 69 browser regressions passed across Chromium, mobile Chromium, and WebKit. These include responsive geometry, keyboard/focus, touch, history, case navigation, asset/storage failures, reduced motion, lamp/sound state, assistant regression coverage with mocked service responses, and no initial model/gallery requests.
- Three additional native assistive-activation checks passed, verifying click activation and opener focus on all three browser targets (72 browser checks in total).
- An independent visual reviewer inspected desktop (1440×900 and 1280×720), tablet (1024×768), mobile (390×844), preview and case captures. The reviewer scored compact-dock overlap and delayed case evidence resolved, with a ship disposition at that reviewed-finding scope.
- Automated reflow covers 720×450 and smaller viewports. Native Chrome access was not approved, so actual browser 200% zoom and a full screen-reader/device audit remain manual checks. Reflow tests are not a substitute for native zoom verification.

## Evidence

Screenshots in [design/studio](design/studio): desktop, mobile, compact initial/scrolled, preview, case, mobile case, and 1280px desktop. These are browser captures of the implementation, not generated mockups. These dated captures include superseded preview and lamp states; they are archived design evidence, not screenshots of the 16 November interface. Current system guidance is merged into [DESIGN.md](../DESIGN.md).

The local production preview is `http://127.0.0.1:4173/`. No deployment, commit or push was performed.
