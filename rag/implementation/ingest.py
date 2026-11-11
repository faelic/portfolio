"""Load curated Markdown, split original text, and synchronize the OpenAI index."""
import hashlib
import json
import re
from functools import lru_cache

import tiktoken
import yaml
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

if __package__:
    from .config import (
        RAG_DIR, DB_NAME, COLLECTION_NAME, EMBEDDING_MODEL,
        CHUNK_SIZE, CHUNK_OVERLAP, get_embeddings,
    )
else:
    from config import (
        RAG_DIR, DB_NAME, COLLECTION_NAME, EMBEDDING_MODEL,
        CHUNK_SIZE, CHUNK_OVERLAP, get_embeddings,
    )

KNOWLEDGE_BASE_PATH = RAG_DIR / "knowledge"


def fetch_documents() -> list[Document]:
    documents = []
    seen_ids = set()
    for path in sorted(KNOWLEDGE_BASE_PATH.rglob("*.md")):
        match = re.fullmatch(
            r"---\n(.*?)\n---\n(.*)", path.read_text(encoding="utf-8"), re.DOTALL,
        )
        if not match:
            raise ValueError(f"Missing YAML frontmatter: {path}")
        header = yaml.safe_load(match[1])
        if not isinstance(header, dict):
            raise ValueError(f"Invalid YAML frontmatter: {path}")
        for key in ("id", "title", "category"):
            if not isinstance(header.get(key), str) or not header[key].strip():
                raise ValueError(f"Missing or invalid {key}: {path}")
        if header["id"] in seen_ids:
            raise ValueError(f"Duplicate document ID: {header['id']}")
        body = match[2].strip()
        if not body:
            raise ValueError(f"Empty Markdown body: {path}")
        metadata = {
            "document_id": header["id"], "document_title": header["title"],
            "category": header["category"],
            "source_path": path.resolve().relative_to(RAG_DIR.parent).as_posix(),
            "document_topics": header["topics"], "document_entities": header["entities"],
        }
        if header.get("aliases"):
            metadata["document_aliases"] = header["aliases"]
        # Detailed provenance stays in authoring frontmatter and the source map.
        documents.append(Document(page_content=body, metadata=metadata))
        seen_ids.add(header["id"])
    if not documents:
        raise ValueError(f"No Markdown documents found in {KNOWLEDGE_BASE_PATH}")
    return documents


@lru_cache(maxsize=1)
def get_tokenizer():
    return tiktoken.get_encoding("cl100k_base")


def token_count(text: str) -> int:
    return len(get_tokenizer().encode(text, disallowed_special=()))


def create_chunks(documents: list[Document]) -> list[Document]:
    chunks = []
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[("#", "h1"), ("##", "h2"), ("###", "h3")],
        strip_headers=False,
    )
    for document in documents:
        sections = markdown_splitter.split_text(document.page_content)
        paths = [
            " > ".join(section.metadata.values())
            if "h2" in section.metadata or "h3" in section.metadata else "__preamble__"
            for section in sections
        ]
        pieces = []
        if token_count(document.page_content) <= CHUNK_SIZE:
            pieces.append((paths, document.page_content))
        else:
            for path, section in zip(paths, sections):
                prefix = f"Document: {document.metadata['document_title']}\nSection: {path}\n\n"
                # Reserve space for title, heading, and token-boundary effects.
                budget = CHUNK_SIZE - token_count(prefix) - 8
                if budget <= CHUNK_OVERLAP:
                    raise ValueError(f"Section context exceeds chunk budget: {path}")
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=budget, chunk_overlap=CHUNK_OVERLAP,
                    length_function=token_count, keep_separator=True,
                    strip_whitespace=False,
                )
                for piece in splitter.split_text(section.page_content):
                    content = prefix + piece
                    if token_count(content) > CHUNK_SIZE:
                        raise ValueError(f"Chunk exceeds {CHUNK_SIZE} tokens: {path}")
                    pieces.append(([path], content))
        for index, (paths, content) in enumerate(pieces):
            identity = json.dumps(
                [document.metadata["document_id"], paths, index, content],
                ensure_ascii=False,
            )
            chunk_id = hashlib.sha256(identity.encode("utf-8")).hexdigest()
            metadata = {
                **document.metadata, "section_paths": paths,
                "chunk_index": index, "chunk_id": chunk_id,
            }
            chunks.append(Document(id=chunk_id, page_content=content, metadata=metadata))
    return chunks


def create_embeddings(chunks: list[Document]) -> Chroma:
    """Synchronize a complete corpus snapshot, not a subset of its documents."""
    if not chunks or any(not chunk.id for chunk in chunks):
        raise ValueError("Refusing to synchronize an empty or unidentified chunk list")
    ids = [chunk.id for chunk in chunks]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate chunk IDs")
    vectorstore = Chroma(
        collection_name=COLLECTION_NAME, persist_directory=DB_NAME,
        embedding_function=get_embeddings(),
        collection_metadata={"embedding_model": EMBEDDING_MODEL},
    )
    previous_ids = set(vectorstore.get(include=[])["ids"])
    # LangChain embeds before upserting. Failed writes never trigger cleanup.
    vectorstore.add_documents(documents=chunks, ids=ids)
    stored_ids = set(vectorstore.get(include=[])["ids"])
    if not set(ids).issubset(stored_ids):
        raise RuntimeError("Not all current chunks were stored; old records were retained")
    stale_ids = sorted(previous_ids - set(ids))
    if stale_ids:
        vectorstore.delete(ids=stale_ids)
    print(f"Synchronized {len(chunks)} chunks in '{COLLECTION_NAME}'")
    return vectorstore


if __name__ == "__main__":
    documents = fetch_documents()
    chunks = create_chunks(documents)
    create_embeddings(chunks)
