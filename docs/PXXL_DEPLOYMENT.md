# Pxxl Free deployment with Neon

Updated 15 November 2026. This replaces the previous paid-volume deployment path. The backend uses one Pxxl Docker service, an external Neon PostgreSQL protection ledger, and a public knowledge-index release artifact. No Pxxl volume, Redis, vector server, background worker, or database heartbeat is required.

## Source and build

Review and publish the intended backend source changes before deploying. Local files are not automatically available in a Git-based build. Use base directory/build context `rag`, `rag/Dockerfile` (shown as `Dockerfile` relative to that context), port 8000, one replica/worker, and start command `python api.py` or the Docker CMD. Keep Blue-Green and autoscaling off; concurrent process limits are process-local.

Pxxl's isolated builder encountered missing-shell errors with the former shell-less uv stage, rejects external-image `COPY --from`, and failed command lookup with inherited `$PATH`. The Dockerfile therefore uses a single Python base, installs pinned uv through pip, and lists PATH entries explicitly. These are compatibility accommodations, not evidence of complete Docker syntax support.

Chat acquires the global/visitor/IP slots before external database work, and admission itself checks durable state without an extra readiness connection. GET `/health/ready` allows only one in-flight probe; overlapping probes return 503 instead of queuing. Readiness is freshly checked, not a cached success.

Use GET `/health/live` expecting 200 for Pxxl health checks. It is database/provider-free. Do not poll `/health/ready` frequently: its real database query can prevent Neon from scaling to zero and exhaust free compute. Readiness checks never generate embeddings or answers.

## 1. Create and initialize Neon

Create a Neon Free project near the Pxxl region. Use a dedicated database, not a shared application database. In Neon's authenticated SQL editor, run the entire [first-initialization SQL](../rag/implementation/ledger_schema.sql), including BEGIN/COMMIT. It creates only the `portfolio_rag` schema, metadata sentinel, admissions, client admissions, debits, and indexes. It deliberately refuses an existing schema. Never drop/recreate the ledger to fix a deployment.

Alternatively, an authenticated operator can initialize with the owner connection string in `DATABASE_URL`:

```bash
cd rag
uv run --locked python -m implementation.protection init
uv run --locked python -m implementation.protection check
uv run --locked python -m implementation.protection inspect
```

Do not paste real database URLs into chat, Git, logs, screenshots, or shell command arguments. Inject credentials through a secure local environment or platform Secrets. Production startup does not initialize or migrate Neon automatically. A missing database/schema stays unready and rejects paid work.

Create a dedicated non-admin login role for runtime. Use a securely generated password entered privately in Neon's controls; do not commit it. With that role named `portfolio_rag_runtime`, run these grants as the schema owner:

```sql
GRANT USAGE ON SCHEMA portfolio_rag TO portfolio_rag_runtime;
GRANT SELECT, UPDATE ON portfolio_rag.metadata TO portfolio_rag_runtime;
GRANT SELECT, INSERT, DELETE ON portfolio_rag.admissions,
    portfolio_rag.client_admissions TO portfolio_rag_runtime;
REVOKE UPDATE, DELETE, TRUNCATE ON portfolio_rag.debits FROM portfolio_rag_runtime;
GRANT SELECT, INSERT ON portfolio_rag.debits TO portfolio_rag_runtime;
```

Run the complete [runtime grants/repair script](../rag/implementation/ledger_runtime_grants.sql) as owner. Apply it even if you already used the earlier grants: adding SELECT/INSERT alone does not remove an existing DELETE grant. The script does not alter stored reservations.

The role must be able to connect to the chosen database, but must not own the schema/tables or have CREATE, TRUNCATE, superuser, or role-administration privileges. UPDATE on metadata is required by PostgreSQL for SELECT FOR UPDATE. Keep the owner connection out of the application. Schema maintenance/initialization uses the owner separately.

If any real paid admissions/debits already exist in an older SQLite deployment, stop traffic and migrate/reconcile that ledger before cutover. Do not silently replace it with an empty database. This implementation does not automatically import owner-local test history. Existing local files are retained.

## 2. Backend secrets and settings

Set these in Pxxl Project Secrets (not build args or frontend variables):

```dotenv
APP_ENV=production
CHAT_ENABLED=false
CHAT_MODEL_FOLLOWUPS=false
OPENAI_API_KEY=<dedicated backend-only production key>
CHAT_IDENTITY_SECRET=<stable cryptographically random value of at least 32 bytes>
DATABASE_URL=<runtime Neon PostgreSQL URL with sslmode=verify-full>
RAG_INDEX_MODE=packaged
PORT=8000
ALLOWED_HOSTS=<actual Pxxl hostname>,rag-api.favourututu.com,127.0.0.1
ALLOWED_ORIGINS=https://www.favourututu.com,https://favourututu.com
CHAT_DAILY_MICRO_USD=1000000
CHAT_MONTHLY_MICRO_USD=10000000
CHAT_MAX_ACTIVE_PER_IP=2
```

`CHAT_MODEL_FOLLOWUPS` defaults false in production. Keep it false for the existing plain-text answer and curated follow-up path. To enable the structured model-generated question after review, set it true on the backend and redeploy; the frontend protocol is already compatible. Disabling it is the feature rollback and does not reset Neon or disable chat. Structured mode retains the 512-token/2,000-character visible answer but reserves up to 768 generated envelope tokens and includes schema/instruction input in spend accounting. No migration or ingestion is required. The [single live check](evaluations/2026-11-19/model-followups/REPORT.md) records remaining relevance issues; it is not hosted security or throughput validation.

Use Neon's pooled endpoint and preserve any channel-binding parameter it supplies. Change `sslmode=require` to `sslmode=verify-full`: production requires certificate/hostname verification. The driver explicitly supplies the maintained certifi CA bundle, so no user-home root.crt file is needed. Keep credentials URL-encoded. The connection string is server-only and must never have a `VITE_` prefix. Credential changes require a redeploy.

Generate the signing secret with `python3 -c "import secrets; print(secrets.token_hex(32))"` and enter it directly into Secrets. Keep it unchanged across restarts. Rotating it changes visitor/IP quota keys but never resets global spending history.

`RAG_DATA_DIR=/data` is no longer required for production. An old setting is harmless: Neon and the packaged index do not use it. Production without DATABASE_URL refuses paid work and never falls back to ephemeral SQLite. Local development without DATABASE_URL continues to use the original SQLite ledger/Chroma tools.

Set `TRUSTED_PROXY_CIDRS` only to platform-confirmed TCP proxy peers. Confirm forwarded-address sanitization before relying on IP quotas. Never guess ranges or trust `0.0.0.0/0`. Hostnames have no scheme/port; origins are exact HTTPS origins without trailing slashes. Keep the standard OpenAI endpoint and payload debug logging disabled.

## 3. Knowledge release artifact

The image includes only `rag/index/knowledge.json` and its SHA-256 sidecar from the index directory. It does not copy local `vector_db`, protection SQLite, raw source archives, notebooks, secrets, reports or tests. The artifact contains public chunk text/metadata and existing text-embedding-3-large vectors, not prompts, visitor history, API keys or live database files.

The initial artifact reuses 33 existing 3072-dimensional embeddings whose IDs, text and metadata exactly match the curated corpus. Export made no paid provider calls. Exact squared-L2 search preserves the existing collection's metric; this is a retrieval implementation change, not a measured improvement in answer quality.

Verify before every release:

```bash
cd rag
uv run --locked python -m implementation.packaged_index verify
```

After a knowledge/model/chunker change, explicitly update the owner's local Chroma index first (`python -m implementation.ingest` makes paid embedding calls), then:

```bash
uv run --locked python -m implementation.packaged_index export
uv run --locked python -m implementation.packaged_index verify
```

Export itself makes no embeddings/model requests. It rejects missing/stale/mismatched content, incompatible vectors and non-L2 indexes. Review and commit both release files together. Docker verifies them against the source fingerprint, exact current chunks, dimensions and checksum during build; runtime verifies them again before caching. Corrupt, stale or missing files fail closed. No ingestion runs during startup/build and no production vector database is created.

## 4. Deploy disabled, then verify

1. Deploy the reviewed commit with CHAT_ENABLED=false. Confirm `/health/live` returns 200 and `/health/ready` returns 200 after Neon initialization. Readiness fails on missing credentials, database outage, wrong schema or index mismatch, without provider requests.
2. Restart/redeploy once, and verify ledger admissions/debits remain in Neon and the release index still loads. A code rollback must not restore an old ledger snapshot or reset budgets.
3. Add `rag-api.favourututu.com` using the exact Pxxl DNS target. Verify certificate coverage, CORS and secure cross-origin cookies from both approved portfolio origins.
4. Configure HTTPS, chat POST/OPTIONS and health GET. Do not impose JSON content type on OPTIONS/health. Disable POST retries, caching and NDJSON response buffering; allow the total 90-second application budget plus bounded cancellation cleanup and verify Stop/disconnection. HTTP streaming does not require WebSockets.
5. Verify actual client IP handling, per-IP edge throttling (6/minute on `/api/chat`), and no unprotected direct backend route. Test global 5 / visitor 1 / IP 2 active requests with offline fixtures first; this configuration is not a measured hosted capacity guarantee.
6. Set CHAT_ENABLED=true, redeploy, then run a small intentional paid smoke test. Test a supported answer, follow-up, cancellation and safe errors. Database failure must deny work rather than switch to in-memory/SQLite quotas. Never automatically retry an uncertain admission/debit or refund an uncertain provider charge.
7. Set frontend build variable `VITE_API_ORIGIN=https://rag-api.favourututu.com` and publish the reviewed frontend integration on its existing host. This URL is public; no server secret belongs in frontend configuration.
8. Remove/disable temporary domains after cutover without breaking internal health checks. Confirm elapsed retrieval/first-text timing, memory and usage on the actual hosts; local results are not Pxxl/Neon certification.

## Limits, operations and recovery

The ledger retains the existing 3/visitor/minute, 6/IP/minute, 20/IP/rolling-24h, and 30/global/minute quotas. Daily/monthly conservative spend ceilings remain $1/$10 at the existing price version. The singleton metadata row serializes short READ COMMITTED write transactions; provider calls happen after commit and outside locks. Separate database connections see committed usage. The API uses Psycopg async connections with prepared statements disabled, an 8-second operation/preparation budget (including connection and initial pool/query waits), a 5-second connect timeout and 2-second statement/lock timeouts. Cancellation asks PostgreSQL to cancel the operation; the connection closes in finally, including failed/uncertain COMMIT. Driver cancellation cleanup can add up to 5 seconds. Synchronous owner CLI commands retain their connect/server timeouts. No heartbeat or min-size connection pool keeps Neon awake.

A Neon outage, free quota suspension, invalid credential or exhausted connection capacity makes chat unavailable. Pxxl liveness remains healthy so a database incident does not cause restart loops. Free storage is durable across application deployments, but is not a guarantee of uninterrupted service or a substitute for backups. Monitor Neon compute/storage/network allowance and retain a current ledger backup through the owner's tools. Never restore an older ledger as a routine code rollback.

Keep CHAT_ENABLED=false plus edge maintenance for an emergency stop, then redeploy. Provider-key revocation is the final backstop. Logs contain request IDs, safe error classes, timing and reservation amounts, not database URLs, raw IP/cookies, prompts or transcripts. The ledger contains HMAC pseudonyms, timestamps and conservative micro-USD reservations only; those are not actual provider billing records.

See [RAG_SECURITY.md](RAG_SECURITY.md), [BACKEND_SCHEMA.md](BACKEND_SCHEMA.md), [REPOSITORY_POLICY.md](REPOSITORY_POLICY.md) and [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md).

## Sources

[Pxxl project settings/volumes](https://docs.pxxl.app/projects/overview), [Pxxl secrets](https://docs.pxxl.app/projects/secrets), [Neon pooling](https://neon.com/docs/connect/connection-pooling), [Neon scale-to-zero](https://neon.com/docs/introduction/scale-to-zero), [PostgreSQL row locks](https://www.postgresql.org/docs/current/explicit-locking.html), [Psycopg transactions](https://www.psycopg.org/psycopg3/docs/basic/transactions.html).


## Initial migration verification — 15 November 2026

128 backend tests passed with a disposable PostgreSQL 18 database, including atomic global/IP/visitor limits, budget rollover, cross-connection persistence, read-only readiness, lock timeout, restricted runtime grants, and API denial on database failure. The runtime dependency audit passed with only the pre-existing reviewed exceptions. Current-source scanning found no secret patterns. The release artifact reused 33 existing embeddings; top-10 order matched Chroma for all 33 stored-vector queries without provider calls. Production container checks confirm non-root execution, database-free liveness, fail-closed readiness when no database is configured, and no copied mutable SQLite/vector database, test directory or environment file. These results do not certify hosted Neon TLS, Pxxl proxy/cookies or real-model answer quality.


## Review corrections verification — 15 November 2026

All 140 backend tests passed, including real PostgreSQL async/sync shared quotas, append-only debit permissions after repairing old grants, cancellation/closed connections during lock waits, and retained reservations after a lost COMMIT acknowledgement. Offline ASGI tests cover global/IP capacity before preparation, no redundant chat probes, preparation/total deadlines, cleanup before slot release, single-flight health readiness, and no fresh response budget after preparation. Schema-version-2 evaluation tests verify mode, vector/search-code hashes and readable report provenance without model calls. The production image built and verified the unchanged 33-chunk release artifact; current-source secret scanning and diff checks passed. No dependencies or advisory exceptions changed during these four fixes. Hosted Neon/Pxxl TLS, proxy, cookie, edge and enabled-chat checks remain outstanding; chat should stay disabled until those pass.

## Investigating health routing without terminal access

The application exposes temporary aliases at GET /api/health/live and /api/health/ready alongside the original /health/live and /health/ready. They use the same handlers and limits: liveness makes no database/provider call; readiness is single-flight, fail-closed and makes no paid model calls. Keep CHAT_ENABLED=false during diagnosis.

Startup writes one backend_startup JSON line with a source-code fingerprint, the registered health paths, and production/chat-enabled/ledger-configured booleans. It never prints environment values, credentials, filesystem paths, or client data. Operator-only deployment logs can be used when the hosting plan does not provide a shell.

Application-handled responses include X-Portfolio-Backend with that same source fingerprint, including application 404/405 responses. This is a diagnostic marker, not authentication. Health-related GET/HEAD responses log backend_health_request with only an allowlisted static path, status and source fingerprint. Query strings, cookies, forwarded addresses and arbitrary paths are excluded.

Compare the original and /api/health aliases using the public hostname. If the app logs /live when the requested path was /health/live, an upstream path rewrite is indicated. If the /api aliases succeed while the original paths fail, inspect the host's /health routing rules; do not reinitialize Neon to repair a routing 404. If neither alias nor the new source marker appears, inspect the deployment source/start command and the backend_startup line before changing application logic. A failed database check is 503 on readiness, not a missing liveness route. The aliases and extra health logging can be removed after the hosted routing discrepancy is resolved.

### Safe PostgreSQL failure categories

Ledger failures now emit `postgres_failed phase=<phase> category=<category>` in runtime logs. Phases distinguish connection establishment, session configuration, queries, commits, and owner-only initialization. Categories use known SQLSTATE mappings first; libpq connection messages without SQLSTATE are inspected internally for fixed diagnostic hints. No raw message, traceback, DSN, username, password, hostname, SQL text, or server diagnostic field is logged. Unknown errors remain `category=unknown`; message-based categories are diagnostic hints, not proof of a root cause.

| Category | What to investigate |
| --- | --- |
| `authentication` | Runtime login credentials and authentication policy |
| `dns` | Connection-string hostname and DNS resolution from the host |
| `tls` / `channel_binding` | Verified TLS settings, certificate trust, and channel-binding requirements; retain `sslmode=verify-full` |
| `connect_timeout` / `connection_refused` / `network_unreachable` | Endpoint availability and outbound connectivity |
| `connection_lost` / `server_unavailable` / `connection_capacity` | Database availability or connection capacity |
| `database_missing` | Selected database name |
| `permission_denied` | Runtime-role grants, without switching the app to the owner login |
| `schema_missing` / `schema_mismatch` | Ledger schema and version compatibility |
| `statement_timeout_or_cancel` / `lock_timeout` | Bounded database work or lock contention |
| `unknown` | Unclassified failure; do not assume credentials are wrong |

The outer ledger deadline emits `ledger_failed category=operation_timeout`. All failures retain the existing fail-closed behavior and connection cleanup. Public readiness still returns only `{"status":"unavailable"}` with HTTP 503. After deploying, check readiness once and inspect the corresponding category in Pxxl runtime logs; do not share the connection string or reset the database.


For the follow-up continuity correction, deploy the backend accepting optional `recent_suggestions` before deploying its frontend. Existing clients may omit this bounded field; older strict backend schemas reject it. No deployment is performed by local implementation/testing. The feature flag still defaults false in production.
