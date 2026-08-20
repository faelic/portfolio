# Favour Portfolio

A production-ready React and TypeScript implementation of Favour's interactive macOS-inspired portfolio. The original vanilla prototype remains in `prototype/` as the visual and interaction baseline.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run preview
```

## Architecture

- `src/data/` is the single source of truth for projects, notes and map locations.
- `src/hooks/` owns persistent desktop layout and window-management state.
- `src/components/desktop/` contains the desktop icons and desktop-level controls.
- `src/features/tunnel/` contains the isolated, lazy-loaded Three.js tunnel renderer, its deterministic layout, shaders and motion configuration.
- `src/components/windows/` contains the reusable window frame and app views.
- `src/components/project/` contains project presentation components.
- `src/components/dock/` contains dock behavior and social links.
- `src/components/map/` contains the lazy-loaded MapLibre globe.
- `src/styles/global.css` preserves the art-directed visual system and responsive rules.
- `public/assets/` contains locally served project images, icons and fonts.

## Interaction model

Project icons open on one click and can be dragged. Their positions persist in local storage and can be reset from the desktop. Windows can be focused, dragged, minimized, expanded and closed. Project windows are deep-linkable with hashes such as `#monierave`. Escape closes the focused window, and reduced-motion preferences are respected.

The tunnel uses project screenshots from `public/assets/projects/ambient/`. Its deterministic eight-row layout mounts every image to one of four shared corridor surfaces—left wall, right wall, ceiling or floor—with one responsive vanishing region. Side walls receive focused portrait crops while the floor and ceiling retain landscape crops. Hovering a project briefly emphasizes only its related planes; opening any window decelerates and subdues the renderer so application content remains primary.

## Content updates

Add or edit project copy, links, metadata, accents and galleries in `src/data/projects.ts`. New project assets belong under `public/assets/projects/<project-name>/` and should be referenced from the data module with root-relative `/assets/...` URLs.
