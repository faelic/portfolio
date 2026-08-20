# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are hiring managers and technical recruiters evaluating FAVOUR for software engineering roles, plus product and design leaders assessing fit for senior or product-engineering roles.

Secondary audiences include selective freelance clients and potential collaborators in web3, fintech, and creative-tech ecosystems.

## Product Purpose

This portfolio exists to function as a hiring artifact that proves FAVOUR can design, ship, and maintain premium interactive product experiences at a high bar. It should communicate technical depth, product fluency, systems thinking, and interactive craftsmanship through a runnable, inspectable interface rather than through static promotional copy alone.

## Positioning

The product is a credible, testable product statement rather than a portfolio brochure. Its differentiator is that it presents engineering range, product judgment, and interface craft through a macOS-inspired interactive environment with real project evidence, deep-linkable navigation, and project-aware case surfaces.

## Operating Context

Visitors explore the work through a desktop-like web interface with draggable and rearrangeable project icons, a dock, multiple windows, hover and focus states, URL-state and deep-linking behavior, and keyboard-friendly dismissal patterns such as Escape to close. The product is evaluated as both a portfolio and a working interaction system, so the experience itself is part of the evidence.

## Capabilities and Constraints

- The core interaction model must remain intact: macOS-inspired desktop metaphor, draggable and rearrangeable desktop icons, dock behavior, project/about/notes windows, hover and focus behavior, URL-state and deep-linking, and Escape-to-close patterns.
- The core showcase set must remain present: Monierave, BucketFlow, Cleanup, Policy.ng, BlockScan, and Escrow.
- Project-aware content structure, callouts, screenshots, and live-link or repository parity should remain consistent with the current case-study model.
- Maintainability matters. Favor the established modern frontend stack and avoid rewrites that destabilize the interaction system without a clear product benefit.
- New features are welcome only when they improve clarity, signal, or user outcomes. Do not replace working behavior for novelty alone.

## Brand Commitments

- Always represent the product as FAVOUR.
- Preserve the existing brand tone: clean, restrained, editorial, premium, and slightly experimental without becoming flashy.
- Preserve the dark FAVOUR environment, restrained palette, glassy dock-and-window layering, and lightweight motion character unless the user explicitly decides to rebrand.

## Evidence on Hand

- Real project cases and structured portfolio content live in [src/data/projects.ts](/Users/favour/Desktop/portfolio/src/data/projects.ts:1).
- The interactive portfolio shell and product framing live in [src/App.tsx](/Users/favour/Desktop/portfolio/src/App.tsx:1), [src/components/windows/AboutWindow.tsx](/Users/favour/Desktop/portfolio/src/components/windows/AboutWindow.tsx:1), and [src/styles/global.css](/Users/favour/Desktop/portfolio/src/styles/global.css:1).
- Real screenshots and supporting visual references are present in `/public/assets/projects` and `/references`.
- Escrow intentionally has repository-only evidence and no fabricated deployed screenshots.

## Product Principles

- Prove capability through interaction, not claims.
- Preserve clarity over novelty.
- Keep technical depth legible to non-engineering evaluators.
- Treat polish as evidence of product judgment, not decoration.
- Let real project truth lead every showcase surface.

## Accessibility & Inclusion

Accessibility must remain meaningful rather than cosmetic. Preserve keyboard access for controls, Escape-to-close behavior, visible focus states, readable contrast in text-heavy surfaces, and responsive interactions that remain usable across device sizes.
