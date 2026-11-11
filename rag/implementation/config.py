"""Small shared settings and lazy provider setup for both pipelines."""
from pathlib import Path
from functools import lru_cache
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

RAG_DIR = Path(__file__).resolve().parent.parent
DB_NAME = str(RAG_DIR / "vector_db")
COLLECTION_NAME = "docs"
EMBEDDING_MODEL = "text-embedding-3-large"
ANSWER_MODEL = "gpt-4.1-mini"
RETRIEVAL_K = 10
CHUNK_SIZE = 350
CHUNK_OVERLAP = 40
REQUEST_TIMEOUT = 30
MAX_RETRIES = 2


def load_environment():
    """Respect shell variables, then rag/.env, then the repository .env."""
    load_dotenv(RAG_DIR / ".env")
    load_dotenv(RAG_DIR.parent / ".env")


@lru_cache(maxsize=1)
def get_embeddings():
    load_environment()
    return OpenAIEmbeddings(
        model=EMBEDDING_MODEL, request_timeout=REQUEST_TIMEOUT,
        max_retries=MAX_RETRIES,
    )
