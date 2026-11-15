FROM python:3.12.12-slim-bookworm
# Avoid shell-less stages and cross-stage copies in hosting build sandboxes.
RUN python -m pip install --no-cache-dir --only-binary=:all: uv==0.13.1
ENV UV_LINK_MODE=copy UV_COMPILE_BYTECODE=1 PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 TIKTOKEN_CACHE_DIR=/app/tokenizer-cache \
    APP_ENV=production CHAT_ENABLED=false RAG_DATA_DIR=/data \
    ANONYMIZED_TELEMETRY=false
# Use literal paths for builders that do not expand inherited ENV variables.
ENV PATH=/app/.venv/bin:/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin
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
