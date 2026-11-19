"""Visitor chat transport; workbench and ingestion stay owner-only CLI tools."""
import asyncio
import hashlib
import json
import logging
import time
import uuid
from contextlib import aclosing, asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, ConfigDict, Field, StrictStr

from implementation.answer import stream_answer, get_vectorstore, get_chat_model
from implementation.references import public_references
from implementation.followups import bounded_suggestions
from implementation.config import ANSWER_OUTPUT_TOKENS, HISTORY_MESSAGE_LIMIT, close_providers, model_followups_enabled
from implementation.guardrails import IndexNotReadyError, bounded_output, public_error, validate_request, get_tokenizer
from implementation.settings import Settings
from implementation.protection import create_ledger, ProtectionError, budget_guard, call_ledger
from implementation.identity import COOKIE_NAME, visitor_identity, cookie_header, client_ip, digest

logger = logging.getLogger(__name__)
BACKEND_SOURCE = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()[:12]
HEALTH_PATHS = {'/health/live', '/health/ready', '/api/health/live', '/api/health/ready', '/live', '/ready'}
BODY_LIMIT = 64 * 1024
BODY_DEADLINE = 10
REQUEST_DEADLINE = 90
PREPARATION_DEADLINE = 8
MAX_ACTIVE_REQUESTS = 5
settings = Settings.from_env()
ledger = create_ledger(settings)
LOCAL_ORIGINS = set(settings.origins)
active_requests = 0
active_visitors = set()
active_ips = {}
readiness_running = False
MESSAGES = {
    'rate_limited': 'Too many messages. Please wait before trying again.',
    'busy': 'The assistant is busy. Please try again shortly.',
    'budget_exhausted': 'The assistant has reached its usage allowance. Please try again later.',
    'unavailable': 'The assistant is temporarily unavailable. Please try again later.',
    'visitor_rate_limited': 'You have reached 3 messages per minute. Please wait before sending another.',
    'ip_rate_limited': 'Your network has reached 6 messages per minute. Please wait before trying again.',
    'ip_daily_limited': 'Your network has reached 20 messages in 24 hours. Please try again later.',
    'visitor_busy': 'Please wait for your current answer to finish before sending another message.',
    'ip_busy': 'Your network already has the maximum number of active answers. Please try again shortly.',
}


def denied(code, retry_after=60):
    return JSONResponse({'code': code, 'message': MESSAGES[code]},
                        503 if code == 'unavailable' else 429,
                        headers={'Retry-After': str(retry_after), 'Cache-Control': 'no-store'})


async def ready():
    global readiness_running
    if not settings.production:
        return True
    # Health checks may use at most one database connection at a time. No queue
    # or periodic heartbeat; concurrent checks return unavailable immediately.
    if readiness_running:
        return False
    readiness_running = True
    try:
        async with asyncio.timeout(PREPARATION_DEADLINE):
            await call_ledger(ledger, 'probe')
            await asyncio.to_thread(get_vectorstore)
        return True
    except Exception as exc:
        logger.warning('readiness_failed exception_class=%s', type(exc).__name__)
        return False
    finally:
        readiness_running = False


@asynccontextmanager
async def lifespan(_app):
    # No embedding/generation requests or automatic ledger initialization.
    # Missing database/index state leaves liveness available and chat closed.
    # Safe operator diagnostics for hosts without terminal access. No environment
    # values, credentials, client addresses, queries, prompts or filesystem paths.
    print('backend_startup ' + json.dumps({
        'source': BACKEND_SOURCE,
        'production': settings.production,
        'chat_enabled': settings.chat_enabled,
        'model_followups_enabled': model_followups_enabled(),
        'ledger_configured': bool(settings.database_url),
        'health_routes': sorted(route.path for route in _app.routes if route.path in HEALTH_PATHS),
    }), flush=True)
    if settings.production:
        await asyncio.to_thread(get_tokenizer)
        await ready()
    try:
        yield
    finally:
        try:
            await close_providers()
        finally:
            get_chat_model.cache_clear()
            get_vectorstore.cache_clear()


class LocalRequests:
    """Bound admission/body work, and own slots until ASGI response cleanup."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        global active_requests
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        request_id = uuid.uuid4().hex
        started = time.perf_counter()
        scope.setdefault('state', {}).update(request_id=request_id, started_at=started)
        status = 500
        new_cookie = None
        visitor = None
        ip = None

        async def reject(code, retry_after=60):
            logger.info('chat_rejected request_id=%s code=%s retry_after=%d', request_id, code, retry_after)
            return await denied(code, retry_after)(scope, receive, safe_send)

        async def safe_send(message):
            nonlocal status
            if message['type'] == 'http.response.start':
                status = message['status']
                message['headers'] = list(message.get('headers', [])) + [
                    (b'x-request-id', request_id.encode()), (b'x-portfolio-backend', BACKEND_SOURCE.encode()),
                ]
                if scope['method'] in ('GET', 'HEAD') and scope['path'] in HEALTH_PATHS:
                    logger.warning('backend_health_request path=%s status=%d source=%s', scope['path'], status, BACKEND_SOURCE)
                if new_cookie is not None:
                    message['headers'].append((b'set-cookie', cookie_header(new_cookie, settings.production)))
            await send(message)

        headers = dict(scope['headers'])
        origin = headers.get(b'origin', b'').decode('latin-1')
        if origin and origin not in LOCAL_ORIGINS:
            return await JSONResponse({'message': 'Origin not allowed.'}, 403)(scope, receive, safe_send)
        if scope['path'] != '/api/chat' or scope['method'] != 'POST':
            return await self.app(scope, receive, safe_send)
        if settings.production:
            if not settings.chat_enabled:
                return await reject('unavailable')
            try:
                visitor, new_cookie = visitor_identity(Request(scope).cookies.get(COOKIE_NAME), settings.identity_secret)
                ip = digest(settings.identity_secret, 'ip', client_ip(scope, settings.trusted_proxy_cidrs))
            except ProtectionError as exc:
                return await reject(exc.code, exc.retry_after)
            if visitor in active_visitors:
                return await reject('visitor_busy', 5)
            if active_ips.get(ip, 0) >= settings.max_active_per_ip:
                return await reject('ip_busy', 5)
        if active_requests >= MAX_ACTIVE_REQUESTS:
            return await reject('busy', 5)
        active_requests += 1
        if visitor is not None:
            active_visitors.add(visitor)
            active_ips[ip] = active_ips.get(ip, 0) + 1
        try:
            if settings.production:
                try:
                    # Slots are already held before any external database work.
                    # Admission itself verifies durable schema and quotas; do not
                    # open an extra readiness connection for each message.
                    async with asyncio.timeout(min(PREPARATION_DEADLINE, REQUEST_DEADLINE)):
                        await asyncio.to_thread(get_vectorstore)
                        await call_ledger(ledger, 'admit', visitor=visitor, ip=ip)
                except ProtectionError as exc:
                    return await reject(exc.code, exc.retry_after)
                except (TimeoutError, IndexNotReadyError):
                    return await reject('unavailable')
                except Exception as exc:
                    logger.warning('preparation_failed exception_class=%s', type(exc).__name__)
                    return await reject('unavailable')
            if headers.get(b'content-type', b'').split(b';')[0].strip() != b'application/json':
                return await JSONResponse({'message': 'Expected JSON.'}, 415)(scope, receive, safe_send)
            body = bytearray()
            try:
                async with asyncio.timeout(min(BODY_DEADLINE, max(0, REQUEST_DEADLINE-(time.perf_counter()-started)))):
                    while True:
                        message = await receive()
                        if message['type'] == 'http.disconnect':
                            status = 499
                            return
                        chunk = message.get('body', b'')
                        if len(body) + len(chunk) > BODY_LIMIT:
                            return await JSONResponse({'message': 'Request is too large.'}, 413)(scope, receive, safe_send)
                        body.extend(chunk)
                        if not message.get('more_body', False):
                            break
            except TimeoutError:
                return await JSONResponse({'message': 'Request body took too long.'}, 408)(scope, receive, safe_send)
            consumed = False

            async def replay():
                nonlocal consumed
                if not consumed:
                    consumed = True
                    return {'type': 'http.request', 'body': bytes(body), 'more_body': False}
                return await receive()
            await self.app(scope, replay, safe_send)
        finally:
            active_requests -= 1
            if visitor is not None:
                active_visitors.discard(visitor)
                remaining = active_ips[ip] - 1
                if remaining:
                    active_ips[ip] = remaining
                else:
                    active_ips.pop(ip)
            logger.info('chat_request request_id=%s status=%d duration_ms=%.1f', request_id, status, (time.perf_counter()-started)*1000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra='forbid')
    question: StrictStr = Field(min_length=1, max_length=2000)
    history: list[dict] = Field(default_factory=list, max_length=HISTORY_MESSAGE_LIMIT)
    recent_suggestions: list[StrictStr] = Field(default_factory=list, max_length=12)


app = FastAPI(title='Portfolio chat', docs_url=None, redoc_url=None,
              openapi_url=None if settings.production else '/openapi.json', lifespan=lifespan)
app.add_middleware(LocalRequests)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.hosts))
# Exact allowed origins may send the HttpOnly anonymous visitor cookie.
app.add_middleware(CORSMiddleware, allow_origins=list(settings.origins),
                   allow_methods=['GET', 'POST'], allow_headers=['Content-Type', 'X-Portfolio-References'],
                   expose_headers=['Retry-After', 'X-Request-ID'], allow_credentials=True)


@app.exception_handler(RequestValidationError)
async def invalid_request(_request, _exc):
    return JSONResponse({'message': 'Invalid request. Check the input format and length, then try again.'}, 422)


@app.get('/api/health/live', include_in_schema=False)
@app.get('/health/live')
async def live():
    return JSONResponse({'status': 'live'}, headers={'Cache-Control': 'no-store'})


@app.get('/api/health/ready', include_in_schema=False)
@app.get('/health/ready')
async def readiness():
    available = await ready()
    return JSONResponse({'status': 'ready' if available else 'unavailable'}, 200 if available else 503,
                        headers={'Cache-Control': 'no-store'})


def event(kind, **fields):
    return json.dumps({'type': kind, **fields}, ensure_ascii=False) + '\n'


@app.post('/api/chat')
async def chat(body: ChatRequest, request: Request):
    try:
        question, history = validate_request(body.question, body.history)
        recent_suggestions = bounded_suggestions(body.recent_suggestions)
    except ValueError as exc:
        return JSONResponse({'message': public_error(exc)}, 422)

    async def events():
        text = ''
        first = True
        references = None
        sent_references = False
        # Accept is CORS-safelisted: the event extension adds no new header.
        # Deploy the optional recent_suggestions schema before its frontend.
        suggestion_requested = request.headers.get('accept') == 'application/x-ndjson; suggestions=1'
        generated_suggestion = None
        def receive_suggestion(value):
            nonlocal generated_suggestion
            generated_suggestion = value['question'] if value else None
        def receive_context(documents):
            nonlocal references
            references = public_references(documents)
        started = request.state.started_at
        try:
            # Preparation and body time count toward the same total budget.
            async with asyncio.timeout(max(0, REQUEST_DEADLINE-(time.perf_counter()-started))):
                options = {'reserve': budget_guard(ledger, request.state.request_id), 'request_id': request.state.request_id} if settings.production else {}
                # Old deployed clients retain the original text-only protocol.
                if request.headers.get('x-portfolio-references') == '1' or suggestion_requested:
                    options['on_context'] = receive_context
                if suggestion_requested:
                    options['on_suggestion'] = receive_suggestion
                    options['recent_suggestions'] = recent_suggestions
                async with aclosing(stream_answer(question, history, **options)) as stream:
                    async for delta in stream:
                        if references is not None and not sent_references and request.headers.get('x-portfolio-references') == '1':
                            sent_references = True
                            yield event('references', items=references)
                        if await request.is_disconnected():
                            logger.info('chat_disconnected request_id=%s', request.state.request_id)
                            return
                        if first and delta.strip():
                            logger.info('chat_first_text request_id=%s duration_ms=%.1f', request.state.request_id, (time.perf_counter()-started)*1000)
                            first = False
                        text += delta
                        yield event('delta', text=delta)
                completed = bounded_output(text, ANSWER_OUTPUT_TOKENS)
                if suggestion_requested and not await request.is_disconnected():
                    if generated_suggestion:
                        yield event('suggestion', question=generated_suggestion)
                yield event('done', text=completed)
        except ProtectionError as exc:
            logger.info('chat_denied request_id=%s code=%s', request.state.request_id, exc.code)
            yield event('error', code=exc.code, message=MESSAGES[exc.code], retry_after=exc.retry_after)
        except TimeoutError:
            yield event('error', code='timeout', message='The response took too long. Please try again.')
        except asyncio.CancelledError:
            logger.info('chat_cancelled request_id=%s', request.state.request_id)
            raise
        except Exception as exc:
            logger.warning('chat_failed request_id=%s exception_class=%s', request.state.request_id, type(exc).__name__)
            message = public_error(exc)
            if isinstance(exc, IndexNotReadyError):
                message = 'The assistant’s knowledge is temporarily unavailable. Please try again later.'
            yield event('error', code='unavailable', message=message)

    return StreamingResponse(events(), media_type='application/x-ndjson', headers={
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Accel-Buffering': 'no',
    })


if __name__ == '__main__':
    import os
    import uvicorn
    logging.basicConfig(level=logging.INFO, format='%(levelname)s %(name)s %(message)s')
    if settings.production:
        for name in ('openai', 'httpx', 'httpx2', 'httpcore'):
            logging.getLogger(name).setLevel(logging.WARNING)
    uvicorn.run(app, host='0.0.0.0' if settings.production else '127.0.0.1',
                port=int(os.getenv('PORT', '8000')), workers=1,
                proxy_headers=False, limit_concurrency=20, timeout_keep_alive=5,
                timeout_graceful_shutdown=15, log_level='warning', access_log=False)
