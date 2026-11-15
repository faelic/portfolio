"""Portable public-corpus embeddings; read-only exact squared-L2 search.

No live SQLite/Chroma database is shipped. Release export reuses existing,
owner-created embeddings only when text, chunk IDs and metadata match exactly.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path

from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda

if __package__:
    from .config import RAG_DIR, DB_NAME, COLLECTION_NAME, EMBEDDING_MODEL, get_embeddings
    from .fingerprint import corpus_fingerprint
    from .guardrails import IndexNotReadyError
else:
    from config import RAG_DIR, DB_NAME, COLLECTION_NAME, EMBEDDING_MODEL, get_embeddings
    from fingerprint import corpus_fingerprint
    from guardrails import IndexNotReadyError

INDEX_PATH = RAG_DIR / 'index' / 'knowledge.json'
DIMENSION = 3072
MAX_BYTES = 12 * 1024 * 1024


def current_chunks():
    if __package__:
        from .ingest import create_chunks, fetch_documents
    else:
        from ingest import create_chunks, fetch_documents
    return create_chunks(fetch_documents())


def valid_vector(vector):
    return (isinstance(vector, list) and len(vector) == DIMENSION
            and all(type(value) in (float, int) and math.isfinite(value) and abs(value) <= 1 for value in vector)
            and any(vector))


class PackagedIndex:
    def __init__(self, records):
        self._records = records

    def similarity_search_by_vector(self, vector, k=10):
        vector = list(vector)
        if not valid_vector(vector):
            raise IndexNotReadyError('Query embedding dimension or values do not match the release index')
        # Chroma's existing collection defaults to squared L2. Exhaustive search
        # is small for 33 chunks and avoids native database files at runtime.
        ranked = sorted(self._records, key=lambda record: math.fsum(
            (left-right)**2 for left, right in zip(vector, record['vector'])))
        return [Document(id=record['id'], page_content=record['text'], metadata=record['metadata'])
                for record in ranked[:k]]

    def as_retriever(self, *, search_kwargs):
        return RunnableLambda(lambda query: self.similarity_search_by_vector(
            get_embeddings().embed_query(query), k=search_kwargs.get('k', 10)))


def load_packaged_index(path=INDEX_PATH):
    try:
        if path.is_symlink() or path.stat().st_size > MAX_BYTES:
            raise ValueError('Invalid index file boundary')
        content = path.read_bytes()
        if len(content) > MAX_BYTES or hashlib.sha256(content).hexdigest() != path.with_suffix('.sha256').read_text().strip():
            raise ValueError('Release index checksum mismatch')
        payload = json.loads(content)
        if (payload['version'], payload['model'], payload['dimension'], payload['metric']) != (1, EMBEDDING_MODEL, DIMENSION, 'l2'):
            raise ValueError('Release index configuration mismatch')
        if payload['fingerprint'] != corpus_fingerprint():
            raise ValueError('Release index does not match curated knowledge')
        chunks = {chunk.id: chunk for chunk in current_chunks()}
        records = payload['records']
        if not isinstance(records, list) or len(records) != len(chunks) or len({record['id'] for record in records}) != len(chunks):
            raise ValueError('Release index chunk count mismatch')
        for record in records:
            chunk = chunks[record['id']]
            if (record['text'], record['metadata']) != (chunk.page_content, chunk.metadata) or not valid_vector(record['vector']):
                raise ValueError('Release record does not match source or embedding format')
        return PackagedIndex(records)
    except (OSError, ValueError, TypeError, KeyError, OverflowError) as exc:
        raise IndexNotReadyError('Packaged knowledge index is missing, stale or invalid; export and verify the release index') from exc


def export_index(source, destination=INDEX_PATH):
    import chromadb
    if not (source / 'chroma.sqlite3').is_file():
        raise ValueError('Existing owner-built Chroma index is required; export never embeds')
    collection = chromadb.PersistentClient(path=str(source)).get_collection(COLLECTION_NAME)
    metadata = collection.metadata or {}
    if metadata.get('embedding_model') != EMBEDDING_MODEL or metadata.get('hnsw:space', 'l2') != 'l2':
        raise ValueError('Index model or distance metric mismatch')
    # Chroma configuration is independent of metadata on recent releases.
    if collection.configuration.get('hnsw', {}).get('space', 'l2') != 'l2':
        raise ValueError('Only the existing L2 retrieval metric is supported')
    result = collection.get(include=['embeddings', 'documents', 'metadatas'])
    chunks = {chunk.id: chunk for chunk in current_chunks()}
    if set(result['ids']) != set(chunks):
        raise ValueError('Index is stale; explicitly ingest the current corpus before export')
    records = []
    for identity, text, meta, embedding in zip(result['ids'], result['documents'], result['metadatas'], result['embeddings']):
        chunk = chunks[identity]
        if (text, meta) != (chunk.page_content, chunk.metadata):
            raise ValueError('Stored content differs from the curated release corpus')
        vector = embedding.tolist()
        if not valid_vector(vector):
            raise ValueError('Stored embedding has incompatible dimensions or values')
        records.append({'id': identity, 'text': text, 'metadata': meta, 'vector': vector})
    payload = {'version': 1, 'model': EMBEDDING_MODEL, 'dimension': DIMENSION,
               'metric': 'l2', 'fingerprint': corpus_fingerprint(),
               'records': sorted(records, key=lambda record: record['id'])}
    content = (json.dumps(payload, separators=(',', ':'), ensure_ascii=False, allow_nan=False)+'\n').encode()
    if len(content) > MAX_BYTES:
        raise ValueError('Release index exceeds byte budget')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    destination.with_suffix('.sha256').write_text(hashlib.sha256(content).hexdigest()+'\n')
    load_packaged_index(destination)
    print(f'Exported and verified {len(records)} existing embeddings; no provider calls')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Owner-only release-index export/verification; no model calls')
    parser.add_argument('action', choices=('export', 'verify'))
    parser.add_argument('--source', type=Path, default=Path(DB_NAME))
    args = parser.parse_args()
    if args.action == 'export':
        export_index(args.source)
    else:
        load_packaged_index()
        print('Packaged index matches curated knowledge and configured embeddings.')
