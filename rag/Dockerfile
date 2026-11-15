FROM python:3.12.12-slim-bookworm
# Keep the shell-capable runtime first for hosting build-image detection.
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /usr/local/bin/uv
ENV UV_LINK_MODE=copy UV_COMPILE_BYTECODE=1 PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 TIKTOKEN_CACHE_DIR=/app/tokenizer-cache \
    APP_ENV=production CHAT_ENABLED=false RAG_DATA_DIR=/data \
    ANONYMIZED_TELEMETRY=false PATH=/app/.venv/bin:$PATH
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project && \
    .venv/bin/python -c "import tiktoken; tiktoken.get_encoding('cl100k_base')"
COPY implementation ./implementation
COPY knowledge ./knowledge
COPY api.py ./
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app && \
    mkdir -p /data && chown app:app /data && chmod -R a+rX /app/tokenizer-cache
USER 10001:10001
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s CMD python -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.getenv('PORT','8000')+'/health/live',timeout=2)"
CMD ["python", "api.py"]
