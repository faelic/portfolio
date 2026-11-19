# Portfolio RAG security and release contract

Updated 15 November 2026. This is the current backend/API security contract. Earlier dated delivery and design records describe historical snapshots. Local tests establish implementation behavior; public hosting and real-model quality require separate evidence.

## Small-system architecture

Use one non-root Pxxl Free container and one Python worker, a packaged public embedding index, and a Neon PostgreSQL protection ledger. No Redis, account system, public ingestion, model tools, or vector database server is needed. Five active requests is a policy cap, not a measured hosting capacity. Do not add workers/replicas without revisiting process-local concurrency and storage semantics.

## Threat model and boundaries

| Boundary | Untrusted input / risk | Deterministic control | Remaining limitation |
|---|---|---|---|
| Browser to API | Oversized/slow bodies, forged history, repeated requests | Exact hosts/origins, JSON-only POST, 64 KiB/10-second body cap, bounded history/tokens | CORS is not authentication; non-browser clients can omit Origin |
| Edge to application | Forged client IP / direct bypass | Only explicit trusted TCP peers may supply XFF; right-to-left chain resolution; direct-edge restrictions required | Proxy peers and edge header handling must be verified on the actual host |
| Anonymous identity | Cookie reset, new tabs/clients, shared networks | Signed HttpOnly cookie plus independent hashed-IP quotas and concurrency | A cookie identifies a browser, not a person; VPN/address rotation and shared-IP tradeoffs remain |
| Prompt to model | Direct injection, poisoned history/passages, unsupported facts | User/history/evidence remain data; no execution/browsing/admin tools; bounded context/output | Prompt compliance and factual grounding are probabilistic and need live evaluation |
| Answer to browser | HTML, tracking images, phishing links | No raw HTML/images/embeds; only exact approved destinations become clickable | Approved destinations may themselves change; review the registry deliberately |
| API to provider/storage | Cost exhaustion, errors, corrupt state | Pre-dispatch conservative debits, no automatic production retries, safe errors, fail-closed PostgreSQL transactions | Reservations are not actual bills; platform/provider logs and retention need operator review |
| Owner to index | Incorrect/private/stale content | Curated Markdown only, path/size checks, deterministic chunks and versioned corpus fingerprint | All indexed content must be treated as publicly extractable |

## Current production limits

| Scope | Limit |
|---|---|
| Visitor cookie | 3 admitted POSTs per rolling 60 seconds; 1 active request |
| IP | 6 admitted POSTs per rolling 60 seconds; 20 per rolling 24 hours |
| IP concurrency | 2 by default; `CHAT_MAX_ACTIVE_PER_IP` accepts 1–5 |
| Entire worker | 30 admitted POSTs per rolling 60 seconds; 5 active requests |
| Spending | Default ceilings $1 per UTC day and $10 per UTC month, using conservative reservations |
| Request processing | 90-second stream-processing deadline; provider timeout 30 seconds; output at most 512 configured tokens and 2,000 characters |

Visitor/IP/global admission is one atomic PostgreSQL transaction serialized by the singleton metadata row lock. Process-local capacity is acquired before database/index preparation. Each chat performs admission without an extra readiness probe; a busy visitor/IP/global request makes no database call. Quota and busy rejections consume no admission allowance. Admitted invalid input still counts. Concurrency is acquired without intervening awaits and released in ASGI cleanup, including failure, cancellation and disconnect. Fresh cookies do not bypass the IP concurrency cap. Local development skips persistent client/spend limits and retains the five-request global cap.

Pre-stream denials use HTTP 429 and Retry-After with separate visitor/network/global codes; spending failures after streaming starts use an error event. Drafts survive errors and the frontend never automatically retries a paid request. Denial logs contain request ID, fixed reason code and retry timing, never raw IPs, cookies, prompts or exception bodies.

## Identity, privacy and links

Production requires a stable cryptographically random `CHAT_IDENTITY_SECRET` of at least 32 bytes. The host-only 30-day visitor cookie is HttpOnly, Secure and SameSite=None. Frontend requests include credentials; CORS permits only exact configured origins. Blocked/cleared cookies reduce visitor-level enforcement, but IP/global controls remain. The cookie is independent of optional chat-history storage.

The ledger stores domain-separated HMAC visitor/IP keys and timestamps, not raw addresses or cookie values. Old client admissions are excluded after 24 hours and pruned on subsequent successful admissions. Hashed identifiers are pseudonymous; do not describe them as proof of anonymity. Rotating the signing key changes these keys but does not reset global admission or spending history.

`public_sources.json` owns canonical retrieved-reference destinations. `approved_links.json` adds explicitly reviewed project/repository/contact destinations for generated Markdown links. The renderer accepts only those exact normalized HTTPS/mailto destinations: unknown hosts, unapproved paths, queries, credentials, unsafe schemes and lookalikes render as text. This policy also applies to restored answers. New links require an owner-reviewed registry edit and tests; it is not a host-wide allowlist.

Do not put credentials or private information into the knowledge base or claim that hidden UI references restrict access. Visitor questions/history are processed by the model provider; optional local saving does not mean the text is never sent elsewhere. Hosting/provider retention remains an operator responsibility.

## Readiness and maintenance

Startup prewarms the checksum-verified tokenizer, probes the explicitly initialized Neon schema, and verifies the packaged index. No startup database creation, migrations, paid ingestion or disk restoration runs. Missing DATABASE_URL/schema or invalid index keeps liveness available and readiness false; production never falls back to SQLite.

Routine readiness uses one in-flight read-only schema/data probe and the cached compatible index handle; overlapping probes return unavailable immediately. API database I/O is asynchronous, with an 8-second operation/preparation budget covering connection and pool waits, plus up to 5 seconds of driver cancellation cleanup. Connections close on failure/cancellation, and uncertain commits are neither retried nor refunded. Preparation/body time reduces the remaining 90-second response budget. It does not run integrity scans, aggregate the ledger, or acquire a write transaction. Actual admission/debit transactions still fail closed on storage errors. After initialization/recovery/ingestion, restart and verify readiness.

For owner maintenance, `python -m implementation.protection check` validates the configured Neon schema without resetting allowances. The SQL initializer is owner-only and refuses existing state. Keep chat disabled during explicit local ingestion/export. Back up the PostgreSQL ledger; never restore an old ledger to replenish a quota. Existing chunker version 1 keeps the previous fingerprint unchanged; future splitting changes must bump `CHUNKER_VERSION` and explicitly reingest.

## CI and local verification

CI prepares the public tokenizer vocabulary before network-blocked unit tests. Tiktoken verifies the asset checksum. The reviewed current system prompt remains unchanged; its corrected snapshot hash is checked alongside independent conversation/security behavior fixtures.

The offline container smoke test generates a disposable signing secret, starts with chat disabled and network access off, checks liveness and unready missing state, and always removes its container. Production secrets are never used by CI. Hosted GitHub execution is not implied by a local pass.

From `rag`, prepare once and run the offline suite:

```bash
uv sync --locked --group workbench
uv run --locked python -c "from implementation.guardrails import get_tokenizer; get_tokenizer()"
uv run --locked python -m unittest discover -s tests
```

The preparation downloads only the public tokenizer vocabulary if absent. It does not embed, generate, or ingest. Use a writable persistent `TIKTOKEN_CACHE_DIR` in restricted environments. Keep the production image's separate tokenizer prewarm.

## Acceptance evidence and remaining work

Local regressions cover rolling quota boundaries, parallel admissions, tampered/expired cookies, spoofed forwarding, same-IP fresh-cookie concurrency, cancellation cleanup, migration preservation, read-only readiness, exact-link safety, prompt behavior and separate section/quote retrieval scores.

Real-model quality is still unmeasured by these tests. Section coverage measures metadata matches; labelled-quote coverage measures normalized literal evidence inside passages. Neither proves support for generated claims. A separate [19 November AI-assisted before/after experiment](evaluations/2026-11-19/COMPARISON.md) records actual model outputs and AI scores, including an unresolved legal-status overstatement; it is not independent human or adversarial validation. Use the [evaluation guide](AI_EVALUATION.md) for opt-in paid runs, human review and experiment provenance. No reranker or automatic model change is introduced.

Before public enablement, complete the [deployment checks](PXXL_DEPLOYMENT.md): actual proxy ranges/header handling, edge-only access, certificate/CORS/cookie behavior, Neon ledger persistence across application restarts, streaming/cancellation and measured five-request capacity. Review dependency exceptions rather than equating a scanner pass with security. Emergency controls remain CHAT_ENABLED=false, edge maintenance and credential revocation.


## Local hardening verification — 15 November 2026

- 111 Python offline tests passed, including the corrected prompt snapshot and new IP-concurrency/readiness/evidence regressions. Dependency-level event-loop ResourceWarnings remain visible; they are not reported as production failures or silently suppressed.
- 52 frontend unit/component tests and 87 browser regressions passed across desktop Chromium, mobile Chromium and WebKit, including approved/unapproved link rendering. TypeScript/production build and ESLint passed; existing lazy-bundle size advisories remain.
- The non-root production image built and passed a network-disabled startup/liveness/unready/disabled-chat check with a disposable signing secret. The public corpus and new link registry were packaged; no provider call or ingestion was made. The smoke container was removed.
- npm audit found zero vulnerabilities. The production Python audit passed under the existing exact advisory-ID exception policy; its tool summary reported five ignored entries. This is an exception-qualified pass, not a zero-advisory or comprehensive security guarantee.
- The redacted current-source scanner and Git-history scanner found no matching secrets; 14 commits were scanned. Ignored local secrets were not printed or incorporated into the image.
- All 13 Markdown documents under docs were reconciled and local file-link targets checked. Historical JSON measurements/screenshots remain unchanged.

No hosted GitHub run, commit/push, Pxxl configuration, public deployment, paid model evaluation or real-provider capacity benchmark is claimed. Proxy ranges, cross-domain cookies, hosted Neon persistence/connectivity and a reviewed answer-quality baseline remain operator evidence tasks.


Approved bare HTTPS/mailto URLs in answer prose are also linked automatically, even when the model omits Markdown link syntax. The exact destination policy remains the same; unknown destinations stay text. Existing Markdown links are not nested and code examples remain literal. This renderer behavior also applies to restored answers and requires only the current frontend build.


See the [Git and deployment input policy](REPOSITORY_POLICY.md) for what stays version-controlled, local-only artifacts, the frontend registry exceptions and the backend image allowlist.


CI runner/action compatibility: both jobs pin ubuntu-24.04; checkout/setup-node/upload-artifact use v7 with Node24 internally. The application remains on its declared Node22 engine. Browser failure reports upload only after a failed browser step, not after an earlier unit failure. The public-positioning regression distinguishes owner-confirmed availability from independently verified uptime.


The non-owner runtime role has SELECT/INSERT only on debits, with no UPDATE/DELETE/TRUNCATE. Admissions retain DELETE for pruning. Existing deployments must run ledger_runtime_grants.sql as owner to revoke the earlier DELETE grant; a new GRANT alone does not remove it. Tests exercise both sync owner and async API paths, cleanup during pool/query waits, and retention of an uncertain committed reservation.
