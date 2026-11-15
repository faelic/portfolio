"""Fingerprint only curated source and deterministic index configuration."""
import hashlib
import json
if __package__:
    from .config import RAG_DIR, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP, CHUNKER_VERSION
else:
    from config import RAG_DIR, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP, CHUNKER_VERSION


def corpus_fingerprint():
    root = RAG_DIR / 'knowledge'
    digest = hashlib.sha256(json.dumps([CHUNKER_VERSION, EMBEDDING_MODEL, CHUNK_SIZE, CHUNK_OVERLAP]).encode())
    paths = sorted(root.rglob('*.md'))
    if not paths or root.is_symlink():
        raise ValueError('Invalid curated knowledge boundary')
    for path in paths:
        if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
            raise ValueError('Invalid curated knowledge path')
        digest.update(json.dumps([path.relative_to(root).as_posix(), path.read_text(encoding='utf-8')], ensure_ascii=False).encode())
    return digest.hexdigest()
