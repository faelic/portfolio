# RAG security boundaries

Current backend/CI hardening (15 November 2026): see the [security and release contract](../docs/RAG_SECURITY.md). It covers reproducible tokenizer/signing-secret setup, 5 global / 1 visitor / 2 IP active requests, approved generated links, read-only readiness and evaluation evidence boundaries. Earlier dated results remain historical.

## Public reference extension — 12 November 2026

The visitor API now exposes bounded public excerpts from its selected generation context, using the fixed public_sources.json registry for readable titles and permitted destinations. Unknown identities and internal paths are omitted. This is intentionally public portfolio information, not a raw corpus/file endpoint. The React renderer revalidates IDs and bounds, ignores supplied URLs, and excludes reference metadata from model history. Retrieved references do not prove every generated claim.

The owner-only report runner can inject a supplied adversarial passage for security evaluation; this option is not accepted by the strict HTTP request schema. It requires explicit paid-run invocation for real requests. Local generated reports remain ignored and must be reviewed/sanitized before any intentional publication.


This document describes implemented local protections, not a public-service security certification. The assistant remains portfolio-focused, uses the current LangChain/OpenAI/Chroma configuration, and has no browsing, filesystem, shell, or tool access available to the model. No screening-model call is added.

## Threats and controls

| Threat | Implemented boundary | Residual risk |
|---|---|---|
| Direct instructions, spoofed roles, poisoned passages | Static system messages; current question, bounded history, and selected excerpts are JSON reference data in a user message. History roles never become trusted instructions. | Prompt separation reduces confusion; a model can still be manipulated or hallucinate. |
| Fabricated assistant history | History resolves references; portfolio facts must come from retrieved evidence. | Caller-provided history is not authenticated. A future backend must own session history. |
| Resource/cost exhaustion | Input, history, context and output budgets; finite local queues; bounded provider retries. The local HTTP API also caps bodies and deadlines as described below. | No distributed rate limit or spending quota exists. Gradio has no HTTP-wide deadline. |
| Tracking images, HTML, malicious Markdown | Chat text is explicitly HTML-escaped before display, with HTML sanitization enabled and Markdown disabled; raw text remains in session state. Source inspection is a plain-text textbox. | Gradio sanitizer settings alone permit images; explicit escaping is required. The string can still contain a deceptive URL. People can copy it; future clients must also render safely. |
| Exception disclosure | UI adapters replace raw errors with stable messages. Failure logs record event code, exception class and direct cause class, without exception bodies or tracebacks. | Developer CLI exceptions are local diagnostic output; never expose the CLI as a public endpoint. |
| Unsafe or oversized corpus files | Fixed curated boundary, symlink/path rejection, preflight file/corpus sizes and bounded reads, safe YAML loading. | This is an owner-controlled repository. It does not detect malicious claims or protect against an attacker who can change application code. |
| Wrong embedding index | Missing/incompatible collection embedding-model metadata fails readiness/synchronization without recreating a collection. | Metadata is not a cryptographic authenticity or corpus-freshness guarantee. |
| Redundant ingestion cost or failed synchronization | Embed only new IDs or changed metadata; verify all expected IDs before deleting stale records. | Synchronization is not atomic; readers can see mixed revisions. Do not pass partial snapshots. |
| Indexed artifacts in Git | Generated indexes are ignored/untracked while local files are preserved. | Historical Git commits still contain previously tracked files; history is not rewritten. |

## Budgets

| Item | Limit |
|---|---:|
| Question | 2,000 characters and 512 tokens |
| Accepted prior history | 12 user/assistant messages, each at most 2,000 characters |
| History sent to models | 1,500 tokens of JSON data, removing oldest complete turns |
| Retrieved context | 4,000 tokens including JSON source labels, up to ten ranked passages |
| Query rewrite | 128 output tokens; empty/oversized rewrites fall back to the original validated question |
| Answer | 512 output tokens; returned text also capped to 2,000 characters for subsequent history |
| Structured judge | 768 output tokens |
| Pending Gradio jobs | 16 per local app; provider tasks remain sequential within that process |
| Markdown input | 64 KiB per file and 1 MiB per complete corpus |

Token counts use `cl100k_base`. The tokenizer vocabulary must be cached for offline tests. Questions are character-checked and history is shape/character-checked before tokenization. Gradio retains at most six exchanges; older exchanges can also be dropped to meet the history token budget. Current questions are never trimmed away. This can reduce recall of older conversation details.

Context uses only parent ID, readable title, heading labels, and passage text. Exact duplicate passage text is removed; whole passages are selected in rank order when they fit the context budget. A passage that cannot fit is skipped. Returned documents are the same selected documents used for generation. After successful retrieval, an empty selected context still reaches the answering prompt as `excerpts: []`. This lets the prompt distinguish social/identity messages from unsupported factual questions; it does not prove that a live model will follow those rules. Missing, empty, or incompatible indexes remain operational errors.

The provider timeout is 30 seconds with at most two retries **per request**, not a 30-second wall-clock guarantee. Follow-ups add a rewrite request; judging adds another model request. No response cache, new model, reranking, or uncalibrated similarity threshold is introduced.

## Development surfaces and logging

`app.py` and `evaluator.py` are localhost-only developer interfaces, with sharing and analytics disabled. Evaluation runners and raw source inspection are not visitor endpoints. Hiding buttons or API documentation is not authorization. Only an explicit action initiates provider work; there are no automatic evaluation/startup calls. Invalid input, unavailable index, provider failure, and rate-limit errors have stable UI messages. Queue saturation uses Gradio's bounded queue response.

The Python services do not persist conversations or request payloads. The React visitor interface offers browser-local opt-in history, described below. Default failure logs contain only event code, exception class and direct cause class (or `none`). Connection errors and provider timeouts have distinct safe visitor messages. Optional INFO-level success logs contain duration, estimated reference-payload token count, and passage count, not raw text or actual billed usage. Do not enable provider HTTP/debug payload logging in a public deployment. Logging a Python exception object with `exc_info` would undo the UI adapter's error privacy boundary.

## Offline verification

`evaluation/security-cases.jsonl` contains 24 fixtures: 18 adversarial inputs and six benign controls. It is excluded from ingestion and separate from the unchanged 50-case quality benchmark. Cases cover instruction overrides, source poisoning, forged history, rewrite hijacking, role/delimiter spoofing, prompt extraction, private-information requests, bulk extraction, malicious markup/links, and input/history exhaustion. Benign cases include RAG security questions and quoted attacks; there is no keyword blacklist.

The security tests enforce deterministic limits, verify prompt placement, reject unsafe corpus paths and oversized files, check embedding metadata, verify incremental synchronization behavior, inspect safe UI settings and session isolation, and confirm error/log redaction. Storage, retrieval, and models are mocked and network connections are blocked. Mock model outputs do not prove that a live model follows the security policy. A separately authorized adversarial run remains necessary before claiming behavioral resistance.

During implementation, protected knowledge, source/archive, notebook, quality-benchmark, and database checksums must remain unchanged. Removing Git tracking is a repository-index change, not a database deletion. Existing automated checks and a mocked browser rendering check validate implementation behavior only.

## Local frontend integration — 11 November 2026

The separate `api.py` process now connects the React assistant locally. It enforces a 64 KiB request-body limit, shared input/history/output budgets, a 90-second deadline, five concurrent chat slots per backend process, loopback host/origin checks, and safe error messages. Async provider work is cancelled on disconnect/Stop; already-running local Chroma thread work cannot be forcibly interrupted. Sources/evaluation/ingestion are not visitor endpoints. Browser history is optional and untrusted; no server-side conversation database exists. The Markdown renderer excludes raw HTML/images/embeds and restricts links. See [the assistant guide](../docs/ASSISTANT.md) for the complete local boundary. This does not implement public-service authentication, distributed quotas, or verified deployment.

## Before connecting a public backend

Implement transport/body limits, server-owned conversation history, per-client and global rate limits, spend quotas, administrative authentication, request deadlines/cancellation, safe output rendering, server-side secret management, and abuse monitoring. CORS is not authentication. Public chat must not expose ingestion, evaluation runners, file access, model overrides, or database paths. In-memory Gradio queues do not coordinate limits across processes.

No private data should be indexed; prompt instructions are not a confidentiality boundary. The public portfolio corpus is intentionally public, and this stage does not claim to prevent reconstruction of public facts. It constrains raw dumping and cost, not ownership of already public knowledge.

## Validation record — 11 November 2026

The full offline suite passed 56 tests, including the existing pipeline, UI, evaluation, and chart checks. The 24 fixtures retain their 18-adversarial/six-benign split, and the original 50-case quality benchmark is unchanged. Protected knowledge, source records, notebook, and local database hashes matched their pre-change values. Generated indexes were removed only from Git tracking.

A localhost browser check with mocked responses tested malicious-looking HTML and Markdown in both user and assistant messages on desktop and mobile. The initial check demonstrated that Gradio sanitizer/Markdown flags alone permitted a remote image. After explicit display escaping, the repeat check observed no script execution, no active image tags, no JavaScript links, no tracking-URL requests, no page errors, and successful clearing. The preview server was stopped afterward. No live retrieval, embedding, generation, judging, or ingestion was run.

The Gradio build/close unit tests emit dependency-level event-loop ResourceWarnings; these do not fail the suite. They are not evidence of prompt-injection resistance. Model-behavior fixtures still require a separately authorized live run.

## Pxxl deployment package — 12 November 2026

The production configuration, durable rate/spend controls, container packaging, and operator rollout checks are documented in [the deployment guide](../docs/PXXL_DEPLOYMENT.md). This supersedes earlier local-only transport boundaries above; actual public deployment and host controls require the checks in that guide. Evaluation improvements remain deferred.


### Production visitor/IP admission

The anonymous API now layers 3 requests/minute per signed browser cookie, 6/minute and 20/rolling 24 hours per IP, and 30/minute globally. SQLite admission is atomic and persistent; all windows roll independently of UTC calendar spending periods. One response per visitor and five per process are held until ASGI cleanup. Only hashed client keys and admission times are retained; raw IPs/cookies are not logged or stored.

CHAT_IDENTITY_SECRET is mandatory in production (minimum 32 bytes, cryptographically random, stable across restarts). This cookie is not authentication and can be cleared/blocked; IP limits and global spending remain backstops. Exact-origin credentialed CORS permits the HttpOnly Secure cookie. TRUSTED_PROXY_CIDRS is an explicit peer allowlist; arbitrary forwarded headers are ignored. Trusted edges must sanitize/append XFF and direct service bypass must remain restricted. Proxy ranges and hosted behavior still require operator verification. See ../docs/PXXL_DEPLOYMENT.md.
