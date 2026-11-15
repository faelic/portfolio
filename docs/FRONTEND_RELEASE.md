# Frontend studio release — 15 November 2026

This release publishes the studio frontend that previously existed only in the working tree. It includes the centered introduction and portrait, six project launchers, desktop settings and arrangement demonstration, responsive project windows/navigation, sound preferences, and lazy-loaded assistant UI. It also includes their public assets, dependency lockfile, browser/unit regressions, and Vercel build-input configuration.

The Neon ledger, packaged backend index, backend dependency changes, PostgreSQL tests, and backend CI job are a separate pending release. This frontend commit changes no files under rag/ and does not initialize a database or enable paid chat. The two existing public link/source registries remain frontend imports.

## Verified release inputs

Validation used an isolated export of the Git index, not the mixed working directory. Dependencies were installed from the staged lockfile using npm ci on Node 22.22.2. The exported backend files and CI workflow matched the preceding commit, confirming that pending Neon changes were not included.

- ESLint and TypeScript checks passed.
- All 53 unit tests passed.
- The Vite production build passed.
- All 87 browser regressions passed across desktop Chromium, mobile Chromium and WebKit, against a fresh preview server serving that build.
- npm ci reported zero vulnerabilities. A staged-text credential-pattern scan and git diff --cached --check passed.

The assistant and globe remain lazy-loaded and produce large-chunk build warnings. These are recorded warnings, not measured hosted performance results. Assistant browser tests use mocked streams and make no paid model calls.

## Vercel settings

Build the repository root as Vite using npm run build and publish dist/. The package requires Node 22 (>=22.12 and <23). vercel.json owns the build command, output directory, SPA rewrite and security headers. .vercelignore limits CLI upload inputs; Vite's build plugin excludes known obsolete public assets from the published build for Git-based deployments too.

For live assistant answers, set the public backend origin in Vercel's Production build environment as VITE_API_ORIGIN, then rebuild. Use the actual HTTPS API origin with no credentials or path. Never put OPENAI_API_KEY, DATABASE_URL or CHAT_IDENTITY_SECRET in Vercel frontend variables or VITE_ settings. The Neon backend must be initialized, verified and deliberately enabled separately; publishing this interface does not make that service ready.

A successful local build or push does not certify a Vercel production deployment. Verify the deployment's source commit, build result and production-domain assignment in Vercel after GitHub receives this release.
