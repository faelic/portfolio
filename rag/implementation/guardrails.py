"""Small deterministic boundaries, not a prompt-injection detector."""
import json
import logging
from functools import lru_cache

import tiktoken
from openai import APIConnectionError, APITimeoutError, RateLimitError

if __package__:
    from .config import (
        QUESTION_CHAR_LIMIT, QUESTION_TOKEN_LIMIT, HISTORY_MESSAGE_LIMIT,
        HISTORY_TOKEN_LIMIT, CONTEXT_TOKEN_LIMIT, RETRIEVAL_K, MARKDOWN_BYTE_LIMIT,
    )
else:
    from config import (
        QUESTION_CHAR_LIMIT, QUESTION_TOKEN_LIMIT, HISTORY_MESSAGE_LIMIT,
        HISTORY_TOKEN_LIMIT, CONTEXT_TOKEN_LIMIT, RETRIEVAL_K, MARKDOWN_BYTE_LIMIT,
    )

logger = logging.getLogger(__name__)


class IndexNotReadyError(RuntimeError):
    """Local readiness details; public adapters must replace the message."""


@lru_cache(maxsize=1)
def get_tokenizer():
    return tiktoken.get_encoding('cl100k_base')


def token_count(text):
    return len(get_tokenizer().encode(text, disallowed_special=()))


def json_text(value):
    return json.dumps(value, ensure_ascii=False)


def bounded_history(history=None):
    if history is None:
        return []
    if not isinstance(history, list) or len(history) > HISTORY_MESSAGE_LIMIT:
        raise ValueError('History must be a list of at most 12 messages')
    checked = []
    for message in history:
        if (not isinstance(message, dict) or message.get('role') not in ('user', 'assistant')
                or not isinstance(message.get('content'), str)
                or len(message['content']) > QUESTION_CHAR_LIMIT):
            raise ValueError('History must contain bounded user/assistant text messages')
        checked.append({'role': message['role'], 'content': message['content']})
    # Group each user message with subsequent assistant messages, then drop whole turns.
    turns = []
    for message in checked:
        if message['role'] == 'user' or not turns:
            turns.append([])
        turns[-1].append(message)
    while turns and token_count(json_text([m for turn in turns for m in turn])) > HISTORY_TOKEN_LIMIT:
        turns.pop(0)
    return [message for turn in turns for message in turn]


def validate_request(question, history=None):
    if not isinstance(question, str) or len(question) > QUESTION_CHAR_LIMIT or not question.strip():
        raise ValueError('Question must be nonempty text of at most 2000 characters')
    history = bounded_history(history)
    question = question.strip()
    if token_count(question) > QUESTION_TOKEN_LIMIT:
        raise ValueError('Question exceeds the token limit')
    return question, history


def bounded_output(text, tokens):
    # Character bound also keeps subsequent history validation predictable.
    text = text[:QUESTION_CHAR_LIMIT]
    encoding = get_tokenizer()
    return encoding.decode(encoding.encode(text, disallowed_special=())[:tokens], errors='ignore').strip()


def context_records(documents):
    records = []
    for document in documents:
        metadata = document.metadata
        records.append({
            'document_id': str(metadata.get('document_id', 'unknown'))[:200],
            'title': str(metadata.get('document_title', 'Portfolio document'))[:300],
            'sections': [str(path)[:300] for path in metadata.get('section_paths', [])[:12]],
            'text': document.page_content,
        })
    return records


def select_context(documents):
    selected, seen = [], set()
    for document in documents[:RETRIEVAL_K]:
        text = document.page_content
        if text in seen or len(text) > MARKDOWN_BYTE_LIMIT:
            continue
        seen.add(text)
        candidate = selected + [document]
        if token_count(json_text(context_records(candidate))) <= CONTEXT_TOKEN_LIMIT:
            selected.append(document)
    return selected


def public_error(exc):
    """Do not stringify exceptions: provider messages can contain private payloads."""
    logger.warning('rag_request_failed exception_class=%s cause_class=%s',
                   type(exc).__name__, type(exc.__cause__).__name__ if exc.__cause__ else 'none')
    if isinstance(exc, IndexNotReadyError):
        return 'The portfolio index is unavailable. Ask the developer to check ingestion.'
    if isinstance(exc, RateLimitError):
        return 'The service is busy. Please try again later.'
    if isinstance(exc, APITimeoutError):
        return 'The model provider took too long to respond. Please try again shortly.'
    if isinstance(exc, APIConnectionError):
        return 'The assistant couldn’t connect to its model provider. Please try again shortly.'
    if isinstance(exc, ValueError):
        return 'Invalid request. Check the input format and length, then try again.'
    return 'The request could not be completed. Please try again later.'
