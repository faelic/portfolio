# Dependency review — 12 November 2026

## Current contract — 15 November 2026

The advisory/package findings below are the dated 12 November review, not a fresh vulnerability database result. The Pxxl Free migration declares the existing certifi CA bundle directly and adds pinned psycopg[binary] 3.3.9 for the Neon ledger; the lockfile includes its binary distribution. CI retains exact embedded-Chroma exceptions, prepares verified tokenizer assets before offline tests, supplies a disposable signing secret for network-disabled image checks, and runs real ledger tests with a disposable PostgreSQL service. No new public HTTP/admin/model/upload surface is added.

Production retrieval now uses the packaged public index and does not open Chroma. Chroma remains installed for local export/ingestion and chunking dependencies, so the dependency audit exceptions still require review. The new external writes are fixed, bound PostgreSQL ledger statements; they do not expose a Chroma write/API surface. Psycopg uses certificate/hostname verification in production, transaction-local timeouts, and no automatic retry of uncertain writes.

See [RAG security and release contract](RAG_SECURITY.md), [assistant integration](ASSISTANT.md), and [evaluation evidence](AI_EVALUATION.md). Historical screenshots, raw performance JSON and dated measurements are preserved; they are not new security or quality results.

Audits report known advisories, not guaranteed safety. Runtime and local workbench dependencies are reviewed separately; do not install the workbench/notebook groups in production.

## Chroma: narrowly scoped runtime exceptions

The locked `chromadb==1.5.9` has these advisories without published fixed versions in the audit data:

| Advisory | Affected surface | Why the deployed application does not expose it |
|---|---|---|
| [PYSEC-2026-311](https://osv.dev/vulnerability/PYSEC-2026-311) | Collection creation with attacker-selected model repositories / remote code | No Chroma HTTP server, collection API, or caller-selected embedding configuration |
| [PYSEC-2026-3814](https://osv.dev/vulnerability/PYSEC-2026-3814) | Collection update with attacker-selected embedding code | Same boundary; ingestion is an owner-only CLI command |
| [PYSEC-2026-3815](https://osv.dev/vulnerability/PYSEC-2026-3815) | Chroma server SimpleRBAC cross-tenant authorization | Embedded single-owner index; no Chroma users/tenants exposed over HTTP |
| [PYSEC-2026-3813](https://osv.dev/vulnerability/PYSEC-2026-3813) | Chroma server cross-tenant collection access | No collection-management HTTP routes or database/file-serving routes |

CI excludes only these exact advisory IDs from the production dependency gate. Any introduction of a Chroma server, arbitrary embedding/model selection, collection endpoints, externally controlled Chroma writes, or uploads invalidates these exceptions. Recheck on each Chroma upgrade; remove exceptions when patched compatible versions exist. Tests assert that the visitor API cannot reach the collection paths. These are mitigated deployment exposures, not claims that the dependency has been patched.

## Pillow in local workbench only

The full installed workbench audit reports Pillow 12.3.0 advisories, including [GHSA-78g4-xqwv-q3g8](https://github.com/advisories/GHSA-78g4-xqwv-q3g8); the audit lists Pillow 13.0.0 as fixed. Current Gradio 6.30.0 requires `pillow<13.0`, so a targeted compatible resolution cannot adopt that fix. Do not force an unsupported dependency override.

Pillow, Gradio, pandas, notebook tooling and image inputs are excluded from the runtime dependency set/image. Keep Gradio bound to localhost with public sharing disabled, and do not process untrusted image files with this workbench. A compatible patched Gradio/Pillow release remains follow-up work; its advisories are not suppressed in the full-workbench report.

## Repository scanning

Gitleaks 8.30.1 checks Git history with redaction. The supplemental source scanner reads tracked/new source only, never ignored local `.env` files. On a finding, rotate genuine credentials before considering historical cleanup. Never publish scanner output without redaction or rewrite history automatically.


## Hardening audit — 15 November 2026

The current npm audit returned zero vulnerabilities. The locked production Python export passed the same CI audit command with the four explicit PYSEC IDs above; pip-audit reported five ignored entries. Treat this as an exception-qualified result. No dependency upgrade or additional suppression was added. Current source/history scans returned no matching secret patterns. The model/runtime dependency boundary remains embedded-only, with no Gradio or public Chroma server in the verified image.


## Pxxl Free / Neon dependency verification — 15 November 2026

The updated locked runtime export, including psycopg/psycopg-binary 3.3.9, passed pip-audit with only the four pre-existing reviewed advisory IDs above (five ignored entries). No new suppression was added. The redacted current-source scan found no matches. These checks are bounded evidence, not a security certification or hosted Neon connectivity result.

The four follow-up review corrections use the existing Psycopg async driver; no package version, dependency or advisory suppression changed. API database calls close their connection on timeout/cancellation. Owner runtime grants now revoke UPDATE/DELETE/TRUNCATE on debit records while preserving admission pruning.
