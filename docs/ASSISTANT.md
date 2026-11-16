# Portfolio assistant

Updated 15 November 2026. The [security contract](RAG_SECURITY.md) owns current protection and release behavior; the [deployment guide](PXXL_DEPLOYMENT.md) distinguishes implemented code from hosted verification. This guide describes the frontend/API integration. Earlier delivery counts remain historical evidence.

## Local development

Run the Vite app and one API worker separately. Local Vite development/preview proxy `/api` to `127.0.0.1:8000`; port 5174 is allowed alongside 5173 and 4173. Production uses the configured exact HTTPS API origin. Provider keys belong only in backend shell/platform secrets; local tools may read `rag/.env`. Never use a VITE_ provider key.

From `rag`:

```bash
uv sync --locked --group workbench
uv run --locked python -c "from implementation.guardrails import get_tokenizer; get_tokenizer()"
uv run --locked python api.py
```

Starting the API, opening the window, and loading health checks do not make model/embedding requests. Sending a question does. Local development uses the compatible curated Chroma index. Pxxl production uses the verified packaged release index and a Neon ledger; startup never ingests or initializes the database. Gradio chat/evaluation tools remain owner-only and loopback-bound.

## Visitor experience

The permanent Assistant dock button opens a stable window frame around lazy-loaded content. Hover/focus may prepare the module; no automatic invitation or notification badge is shown. Closing/reopening preserves the current in-memory conversation; opening makes no assistant request.

The empty screen says “Hi! I'm Favour's assistant” and explains that answers draw from the portfolio. Three short inline suggested questions fill the composer without sending. Their backgrounds remain black; hover uses the pointer cursor rather than a blue border. The window shares the landing page's dark canvas. Clear conversation is a labelled delete-icon control.

Contact retains the previous envelope outline with local flap-opening motion; the other selected Lucide Animated artwork uses the shared `AnimatedIcon` component (MIT attribution in `THIRD_PARTY_LICENSES.md`). Send has a brief paper-plane movement; Clear has a custom lid movement. Motion follows the whole control's pointer/keyboard/touch interaction, stays off for disabled controls and reduced-motion preferences, and never delays actions. Keep chat history remains a labelled native checkbox/switch with a short thumb transition. During a request, Send immediately becomes the existing static Stop response control. Icon animation does not imply network success. Sound artwork always reflects the actual saved sound state.

The UI uses assistant-ui runtime/primitives and react-markdown. Raw HTML, images and embeds are excluded. Generated/restored links become clickable only when their exact normalized destination is in the owner-approved link/reference registries. Other link labels render as text. No retrieved-reference list is displayed after the answer; optional bounded reference metadata remains compatible with the transport and saved history.

## History and storage

Saving defaults off. Current messages survive close/reopen but disappear on reload unless the visitor opts in. Saving writes completed pairs only, at most 50 exchanges. Turning saving off removes saved text while retaining the visible conversation. Clear stops active work and removes current/saved messages while preserving the preference.

| Key | Value |
|---|---|
| `favour.assistant-keep-history.v1` | Guarded boolean, default false |
| `favour.assistant-history.v1` | At most 100 validated completed records with IDs, roles, text and optional actual sentAt/reference metadata |

Invalid, corrupt, unavailable or denied storage falls back to memory. Legacy records load without invented timestamps. Persistence occurs after completion rather than each token. Labels, times and references are excluded from model history; at most six completed exchanges are sent. Browser storage is not encrypted or cross-device history.

The signed HttpOnly visitor cookie is separate from the history preference. It supports anonymous rate/concurrency limits, contains no transcript and is not authentication. Questions/history are sent to the AI provider for processing regardless of local saving.

## API transport

`POST /api/chat` accepts JSON `{ "question": "…", "history": [{ "role": "user", "content": "…" }] }`. Extra root fields and privileged history roles are rejected. Input is bounded and history is treated as untrusted reference data, not server-authored evidence.

The response is newline-delimited JSON with delta/done/error events. The terminal done text supplies authoritative trimming. Missing terminal events or broken JSON produce an interrupted state; partial failures are not shown as successful answers. Stop, Clear, close and disconnect propagate cancellation; ASGI cleanup releases capacity.

New clients send `X-Portfolio-References: 1`. The API may emit bounded canonical excerpts from the selected generation context before text. The public registry controls titles/URLs; metadata is not model-generated and is not proof of every claim. Legacy clients keep delta/done/error compatibility. No raw paths, arbitrary model parameters, ingestion, evaluations, file access or Chroma administration are public routes.

`fetch` includes credentials for the visitor cookie. CORS accepts exact origins and exposes Retry-After and X-Request-ID. CORS is not authentication. Browser drafts survive safe validation/quota/provider errors; automatic paid retries are disabled.

## Limits and errors

Production enforces 3 admitted requests/minute per visitor; 6/minute and 20/rolling 24 hours per IP; 30/minute globally. Five requests may be active per worker, one per visitor and two per IP by default. CHAT_MAX_ACTIVE_PER_IP allows 1–5 for shared-network tuning. Busy and quota denials do not consume admission allowance; accepted invalid requests do.

HTTP 429 reason codes distinguish visitor_rate_limited, ip_rate_limited, ip_daily_limited, visitor_busy, ip_busy and global busy/rate_limited. Responses include Retry-After. budget_exhausted may arrive as a streamed error after a response starts. Unavailable protection/index state fails closed with safe errors. Logs record request IDs/reason codes and timings, not prompts, raw addresses, cookie values or exception bodies.

The body is capped at 64 KiB and ten seconds. The total request budget is 90 seconds including preparation and body handling, with an 8-second preparation limit and bounded database cancellation cleanup; provider calls have a 30-second timeout and zero automatic retries in production. Questions are capped at 2,000 characters/512 configured tokens, history at 12 messages/1,500 tokens, evidence at 4,000 tokens, output at 512 configured tokens/2,000 characters. Production exact vector search and local workbench Chroma reads use a worker thread; already-running synchronous work cannot be forcibly stopped mid-operation.

Production defaults to chat disabled and requires a stable CHAT_IDENTITY_SECRET plus explicit hosts/origins and durable storage. Only trusted TCP proxies may supply XFF. Startup probes the explicitly initialized Neon schema without migrations; ordinary readiness is read-only, bounded, and single-flight. Chat takes local capacity before database work and does not perform an extra readiness query. PostgreSQL uses async I/O and closes connections on cancellation. Local development retains the five-slot global cap without persistent client/spend enforcement. See [RAG_SECURITY.md](RAG_SECURITY.md) for exact guarantees and limitations.

## Evidence and rollout

The [evaluation guide](AI_EVALUATION.md) describes separate baseline/held-out/conversation/security fixtures, explicit paid-run opt-in, durable report artifacts and human review. Offline tests and accurate transport do not establish real answer quality. Hosted proxy/cookie behavior, volume persistence, actual provider latency/cost, public deployment and a reviewed quality baseline remain separate verification tasks.


Approved bare HTTPS/mailto URLs in answer prose are also linked automatically, even when the model omits Markdown link syntax. The exact destination policy remains the same; unknown destinations stay text. Existing Markdown links are not nested and code examples remain literal. This renderer behavior also applies to restored answers and requires only the current frontend build.
