"""Bounded public references from selected evidence, never model-generated URLs."""
import json
from pathlib import Path

PUBLIC_SOURCES = json.loads(Path(__file__).with_name('public_sources.json').read_text())


def public_references(documents):
    references, seen = [], set()
    for document in documents:
        identity = document.metadata.get('document_id')
        if not isinstance(identity, str):
            continue
        source = PUBLIC_SOURCES.get(identity)
        text = document.page_content.strip()
        if not source or not text or (identity, text) in seen:
            continue
        seen.add((identity, text))
        sections = document.metadata.get('section_paths', [])
        reference = {
            'id': identity, 'title': source['title'], 'href': source['href'],
            'sections': [section[:160] for section in sections[:3] if isinstance(section, str)] if isinstance(sections, list) else [],
            'excerpt': text[:400],
        }
        if len(json.dumps(references + [reference], ensure_ascii=False).encode('utf-8')) > 12_000:
            break
        references.append(reference)
        if len(references) == 10:
            break
    return references
