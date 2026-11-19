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

### Contextual follow-up preview — 19 November 2026

With `CHAT_MODEL_FOLLOWUPS=true`, the existing answer request returns a structured internal envelope with the visitor answer and one optional model-generated follow-up. This flag defaults to true locally and false in production; false restores plain-text generation and curated suggestions. Gradio, synchronous answering, the streaming API, and the evaluation runner use the same generation mode. Their existing public return types are preserved. No frontend redesign, extra model call, new endpoint, retrieval change, or knowledge-index rebuild is involved.

Only decoded answer text streams to the browser. The answer remains bounded to 512 tokens and 2,000 characters; the complete envelope has a separate 768-token generation ceiling. Conservative spending reservations include the trusted response instructions, human payload, schema, and entire ceiling before the provider call. The existing ledger, rate limits, deadlines and cancellation behavior remain. This raises the maximum per-generation reservation; it is not a free token addition. The three bounded model handles (plain answer, structured answer, rewrite) are reused.

Generated metadata is untrusted. The question must be plain text, at most 120 characters, without links, controls, repeated recent questions, credential solicitation or unsupported numeric claims. Its source must be registered and actually supplied to generation, with a 20–240-character quote present in that source passage after whitespace normalization. These checks do not establish semantic entailment, complete safety, or independent answerability. Invalid/missing metadata uses the existing curated selector; if neither is suitable, no question is shown. Normal completion with a fully closed answer field preserves the answer even when optional metadata is malformed or truncated. An incomplete answer, provider refusal, transport failure, or cancellation keeps the existing safe incomplete/error behavior and does not publish a suggestion. No second paid attempt is made to repair metadata.

Supporting IDs and quotes stay internal: only the final question is emitted using the existing opt-in `suggestion` event before `done`. Metadata never becomes a tool call, file path, URL fetch, instruction, saved browser conversation item, or additional model history. Routine logs do not print raw JSON, quotes, prompts or suggestions. Explicit owner evaluation artifacts can record source evidence for review and must be sanitized before publication.

After each successfully completed answer, the curated fallback may supply one question. It uses the latest question, answer, recent visitor questions, and the selected documents' actual text. Explicit project names take priority; broad introductions use the profile, and pronoun-only replies retain the conversation's topic. Previous questions are tracked per project within the existing six-exchange history window. A brief mention of a project or mechanism does not count as a complete explanation: only a more specific detail pattern suppresses that follow-up. Exact previously asked questions are also excluded. When one project's available subjects are exhausted, an explicit question about a curated related project can continue the conversation, but only if its supporting evidence was retrieved. Unknown facts can lead to a different, documented subject instead of suppressing every follow-up. Greetings, ambiguous multi-project requests, missing evidence, and genuinely exhausted supported options may still produce no suggestion. Selection is deliberately keyword-based, not a measured semantic-similarity percentage or a guarantee of perfect relevance or unlimited unique questions. The fallback itself makes no provider calls.

The existing composer shows the suggestion as its native, muted placeholder only while empty and idle. It has no highlighted background and is not a prefilled draft: Enter cannot submit it and Send remains disabled until acceptance or typing. A small “Tab to complete” hint sits below the input. With the input focused, unmodified Tab accepts the full text and places the caret at its end without selecting it; the next Tab and Shift+Tab retain native navigation. Escape dismisses the placeholder without closing the window. Typing dismisses it and never replaces the visitor's draft. Touch users tap “Use suggested question” beneath the input to fill/focus it with the caret at the end, then send separately; tapping the placeholder itself only focuses the empty input and does not accept anything. Nothing automatically focuses the composer or opens a keyboard when the answer finishes. The existing welcome questions and surrounding design are preserved; no follow-up list is added.

Suggestions are ephemeral, excluded from localStorage and model history until actually sent. New requests, stop, errors, clear, and closing retire suggestions; late events cannot revive a cleared conversation. The client buffers suggestion metadata until a valid done event, ignoring malformed/oversized metadata. Accessible descriptions and the completion status announce availability. Touch targets are at least 44px, long questions wrap inside the composer, and the desktop Tab hint is hidden on touch-primary devices.

Protocol: clients opt in with the CORS-safelisted `Accept: application/x-ndjson; suggestions=1` header, retaining the existing reference extension. The API may emit `{"type":"suggestion","question":"..."}` immediately before `done`; it never emits this event to legacy clients. Questions are plain text, at most 120 characters. An older backend ignores the new Accept parameter and returns ordinary answers without suggestions; no new preflight header is required. Actual response errors/cancellation do not publish a suggestion. The feature does not alter grounded answer generation or the knowledge index.

Verification uses provider-free selector/API tests and mocked browser streams. A shared eight-turn fixture exercises renewed suggestions from introduction through Policy.ng, the RAG assistant, and Monierave; it tests pronoun resolution, related-project continuation, and the six-exchange history bound. These are mock answers, not a quality evaluation. Real Chromium/WebKit checks exercise every turn's placeholder renewal, native placeholder/empty-value behavior, hint placement below the input, caret placement without text selection, subsequent Tab navigation, Shift+Tab, typing/Escape dismissal, delayed drafts, clearing, and compact 360×640 touch acceptance with a simulated 360px keyboard viewport. Browser emulation does not establish physical iOS/Android keyboard behavior or real-model engagement improvement. No extra live-model evaluation is required to test this deterministic feature.

The permanent Assistant dock button opens a stable window frame around lazy-loaded content. On a first desktop entry in a session, its existing tooltip shows only “Assistant” and the artwork bounces gently. On mobile, only the bounce is shown, with no callout text. Both layouts use one 650ms bounce when at least 90% of the button enters view. Reduced motion suppresses the bounce. A guarded session flag (`favour.assistant-discovery.v1`) prevents repetition; denied storage falls back to the current mounted visit. The cue retires on dock interaction or when a window/settings/arrangement covers the home. It never opens/prepares the assistant or makes an API request. Hover/focus may still prepare the module. No notification badge or false running indicator is shown. Closing/reopening preserves the current in-memory conversation; opening makes no assistant request.

The empty screen says “Hi! I'm Favour's assistant” and explains that answers draw from the portfolio. Three short inline suggested questions fill the composer without sending. Their backgrounds remain black; hover uses the pointer cursor rather than a blue border. The window shares the landing page's dark canvas. Clear conversation is a labelled delete-icon control.

On mobile, each opening/reopening starts the inner conversation viewport at the top, including restored history. The composer does not autofocus or summon the keyboard. Sending a new message enables normal response following; manual conversation scrolling remains available. Desktop keeps its existing viewport and scroll behavior.

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


### Follow-up continuity correction — 19 November 2026

Generated and curated questions now stay within the active subject; comparisons can continue with either named project. Broad blockchain questions prefer the blockchain projects actually discussed. An exhausted topic may have no suggestion rather than an arbitrary project jump. One evidence-backed conversation-rewrite question extends the RAG fallback without expanding the system architecture.

The browser keeps the last 12 successfully displayed suggestions in memory and sends an optional `recent_suggestions` field. This is separate from the six-exchange model history, is cleared with the conversation, and is not added to persistent chat storage. Reloading/remounting loses this display memory. Old clients may omit it. The backend validates the list before generation (12 items, 120 characters each, no Unicode control/format/surrogate characters) and treats it as untrusted reference data. Its tokens are included in the existing conservative input reservation; no new paid request or database migration is added.

Exact recently displayed questions are rejected for both generated and curated suggestions. Local checks also reject clear overlaps with already-explained curated intents and technology-list questions after an answer already lists multiple known tools. These are conservative heuristics, not semantic equivalence guarantees. The composer appearance, optional acceptance, caret behavior, generation ceilings and production feature flag remain unchanged. See the [offline correction report](evaluations/2026-11-19/model-followups/CONTINUITY-FIX.md).
