"""Small shared settings and lazy provider setup for both pipelines."""
from pathlib import Path
import os
import inspect
from functools import lru_cache
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

RAG_DIR = Path(__file__).resolve().parent.parent
PRODUCTION = os.getenv('APP_ENV', 'local') == 'production'
INDEX_MODE = os.getenv('RAG_INDEX_MODE', 'packaged' if PRODUCTION else 'chroma')
if INDEX_MODE not in ('chroma', 'packaged'):
    raise ValueError('RAG_INDEX_MODE must be chroma or packaged')
if PRODUCTION and INDEX_MODE != 'packaged':
    raise ValueError('Production requires the packaged knowledge index')
DB_NAME = str(Path(os.getenv('RAG_DATA_DIR', str(RAG_DIR))) / 'vector_db')
COLLECTION_NAME = "docs"
EMBEDDING_MODEL = "text-embedding-3-large"
ANSWER_MODEL = "gpt-4.1-mini"
RETRIEVAL_K = 10
CHUNK_SIZE = 350
CHUNK_OVERLAP = 40
# Bump when heading/splitting semantics change. Keeps today's fingerprint intact.
CHUNKER_VERSION = 1
REQUEST_TIMEOUT = 30
MAX_RETRIES = 2
_providers = []


def register_provider(provider):
    _providers.append(provider)
    return provider


async def close_providers():
    for provider in _providers:
        for client in (getattr(provider, 'root_client', None) or getattr(getattr(provider, 'client', None), '_client', None),
                       getattr(provider, 'root_async_client', None) or getattr(getattr(provider, 'async_client', None), '_client', None)):
            if client is not None:
                result = client.close()
                if inspect.isawaitable(result):
                    await result
    _providers.clear()
    get_embeddings.cache_clear()


def load_environment():
    """Respect shell variables, then rag/.env, then the repository .env."""
    if not PRODUCTION:
        load_dotenv(RAG_DIR / ".env")
        load_dotenv(RAG_DIR.parent / ".env")


@lru_cache(maxsize=1)
def get_embeddings():
    load_environment()
    return register_provider(OpenAIEmbeddings(
        model=EMBEDDING_MODEL, request_timeout=REQUEST_TIMEOUT,
        max_retries=0 if PRODUCTION else MAX_RETRIES,
    ))


# Local workbench budgets; backend-wide quotas remain a separate responsibility.
QUESTION_CHAR_LIMIT = 2000
QUESTION_TOKEN_LIMIT = 512
HISTORY_MESSAGE_LIMIT = 12
HISTORY_TOKEN_LIMIT = 1500
CONTEXT_TOKEN_LIMIT = 4000
REWRITE_OUTPUT_TOKENS = 128
ANSWER_OUTPUT_TOKENS = 512
JUDGE_OUTPUT_TOKENS = 768
QUEUE_SIZE = 16
MARKDOWN_BYTE_LIMIT = 64 * 1024
CORPUS_BYTE_LIMIT = 1024 * 1024
