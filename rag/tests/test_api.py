"""Offline transport and real streaming-path coverage; never call providers."""
import asyncio
import json
from pathlib import Path
import socket
import unittest
from unittest.mock import AsyncMock, Mock, patch

import httpx
from fastapi.testclient import TestClient
from openai import APIConnectionError, APITimeoutError
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda

import api
from implementation import answer
from implementation.guardrails import IndexNotReadyError, token_count
from implementation.structured_answer import choose_followup


class ApiTests(unittest.TestCase):
    def setUp(self):
        legacy = patch.object(answer, 'model_followups_enabled', return_value=False)
        legacy.start()
        self.addCleanup(legacy.stop)
        self.network = patch.object(socket.socket, 'connect', side_effect=AssertionError('Network forbidden'))
        self.network.start()
        self.client = TestClient(api.app, base_url='http://localhost')
        api.active_requests = 0

    def tearDown(self):
        self.client.close()
        api.active_requests = 0
        self.network.stop()

    def events(self, response):
        return [json.loads(line) for line in response.text.splitlines()]

    def test_suggestion_extension_is_opt_in_and_uses_selected_context(self):
        calls = []
        async def generate(question, history, **options):
            calls.append(question)
            docs = [Document(page_content='Monierave uses idempotency and a transactional outbox.', metadata={'document_id':'project-monierave'})]
            if callback := options.get('on_context'):
                callback(docs)
            yield 'Monierave uses idempotency keys.'
            if callback := options.get('on_suggestion'):
                callback(choose_followup(None, question, 'Monierave uses idempotency keys.', history, docs))
        body = {'question': 'How does Monierave prevent duplicates?'}
        with patch.object(api, 'stream_answer', generate):
            old = self.client.post('/api/chat', json=body)
            new = self.client.post('/api/chat', json=body, headers={'Accept':'application/x-ndjson; suggestions=1'})
        self.assertEqual([e['type'] for e in self.events(old)], ['delta', 'done'])
        self.assertEqual([e['type'] for e in self.events(new)], ['delta', 'suggestion', 'done'])
        self.assertEqual(self.events(new)[1]['question'], 'What happens if a notification fails in Monierave?')
        self.assertEqual(len(calls), 2)  # One generation per request, not per suggestion.

    def test_recent_suggestions_are_validated_before_generation_and_forwarded(self):
        async def generate(question, history, **options):
            self.assertEqual(options['recent_suggestions'], ['How does Monierave manage login sessions?'])
            yield 'Complete answer.'
        headers = {'Accept':'application/x-ndjson; suggestions=1'}
        with patch.object(api, 'stream_answer', generate):
            result = self.client.post('/api/chat', json={'question':'Monierave?',
                'recent_suggestions':['How does Monierave manage login sessions?']}, headers=headers)
            self.assertEqual(self.events(result)[-1], {'type':'done','text':'Complete answer.'})
        with patch.object(api, 'stream_answer') as generate:
            for recent in (['x' * 121], ['x'] * 13, ['bad\ncontrol'], [123], 'text'):
                result = self.client.post('/api/chat', json={'question':'Monierave?', 'recent_suggestions':recent}, headers=headers)
                self.assertIn(result.status_code, (400, 422))
            generate.assert_not_called()

    def test_partial_answer_does_not_emit_suggestions(self):
        async def fail(question, history, **options):
            options['on_context']([Document(page_content='Monierave uses an outbox.', metadata={'document_id':'project-monierave'})])
            yield 'Monierave uses idempotency.'
            raise RuntimeError('private')
        with patch.object(api, 'stream_answer', fail):
            result = self.client.post('/api/chat', json={'question':'Monierave?'}, headers={'Accept':'application/x-ndjson; suggestions=1'})
        self.assertEqual([e['type'] for e in self.events(result)], ['delta', 'error'])
        self.assertEqual(api.active_requests, 0)

    def test_eight_turns_allow_topic_exhaustion_without_discarding_answers(self):
        root = Path(__file__).resolve().parents[2]
        turns = json.loads((root / 'tests/fixtures/followup-conversation.json').read_text())['turns']
        documents = [Document(page_content=(root / 'rag/knowledge' / path).read_text(), metadata={'document_id':key})
                     for path, key in (
                         ('profile/overview.md', 'profile-overview'),
                         ('projects/monierave.md', 'project-monierave'),
                         ('experience/flamong-policy-ng.md', 'experience-flamong-policy-ng'),
                         ('projects/portfolio-rag-assistant.md', 'project-portfolio-rag-assistant'))]
        calls = []
        async def generate(question, history, **options):
            turn = turns[len(calls)]
            self.assertEqual(question, turn['question'])
            calls.append(question)
            options['on_context'](documents)
            yield turn['answer']
            options['on_suggestion'](choose_followup(None, question, turn['answer'], history, documents))
        history = []
        with patch.object(api, 'stream_answer', generate):
            for turn in turns:
                response = self.client.post('/api/chat', json={'question':turn['question'], 'history':history[-12:]},
                                            headers={'Accept':'application/x-ndjson; suggestions=1'})
                self.assertEqual(response.status_code, 200)
                events = self.events(response)
                expected = ([] if 'forms and failed' in turn['question'] else
                            ['How does the Portfolio RAG Assistant resolve conversation follow-ups?']
                            if 'use retrieved evidence' in turn['question'] else [turn['suggestion']])
                self.assertEqual([event['question'] for event in events if event['type'] == 'suggestion'], expected)
                self.assertEqual(events[-1], {'type':'done', 'text':turn['answer']})
                history += [{'role':'user','content':turn['question']}, {'role':'assistant','content':turn['answer']}]
        self.assertEqual(len(calls), 8)
        self.assertEqual(api.active_requests, 0)

    def test_stream_contract_context_and_no_source_disclosure(self):
        received = []
        async def stream(question, history, **_options):
            received.append((question, history))
            yield 'Favour '
            yield 'builds software. 👋'
        history = [{'role': 'user', 'content': 'Who is Favour?'}, {'role': 'assistant', 'content': 'An engineer.'}]
        with patch.object(api, 'stream_answer', stream):
            response = self.client.post('/api/chat', json={'question': 'What does he build?', 'history': history})
        self.assertEqual(response.status_code, 200)
        self.assertIn('application/x-ndjson', response.headers['content-type'])
        self.assertEqual(response.headers['cache-control'], 'no-store')
        self.assertEqual(self.events(response), [
            {'type': 'delta', 'text': 'Favour '}, {'type': 'delta', 'text': 'builds software. 👋'},
            {'type': 'done', 'text': 'Favour builds software. 👋'},
        ])
        self.assertEqual(received, [('What does he build?', history)])
        self.assertEqual(api.active_requests, 0)

    def test_bad_requests_fail_before_generation_without_echoing_payloads(self):
        cases = [{'question': ' '}, {'question': 'x'*2001}, {'question': 'ok', 'history': [{'role':'system','content':'PRIVATE'}]},
                 {'question': 'ok', 'history': [{}]*13}, {'question': 23}, {'question': 'ok', 'model':'PRIVATE'}]
        with patch.object(api, 'stream_answer') as stream:
            for body in cases:
                response = self.client.post('/api/chat', json=body)
                self.assertEqual(response.status_code, 422)
                self.assertNotIn('PRIVATE', response.text)
            stream.assert_not_called()

    def test_body_host_origin_and_content_type_boundaries(self):
        self.assertEqual(self.client.post('/api/chat', content=b'x'*(api.BODY_LIMIT+1), headers={'content-type':'application/json'}).status_code, 413)
        self.assertEqual(self.client.post('/api/chat', content='text').status_code, 415)
        self.assertEqual(self.client.post('/api/chat', json={'question':'ok'}, headers={'Origin':'https://attacker.example'}).status_code, 403)
        self.assertEqual(self.client.post('/api/chat', json={'question':'ok'}, headers={'Host':'attacker.example'}).status_code, 400)
        self.assertEqual(self.client.get('/evaluation').status_code, 404)
        self.assertEqual(self.client.get('/openapi.json').status_code, 200)

    def test_failures_are_redacted_and_slots_released(self):
        async def fail(*_, **_options):
            yield 'Partial'
            raise RuntimeError('PRIVATE provider payload or credential')
        with patch.object(api, 'stream_answer', fail):
            response = self.client.post('/api/chat', json={'question':'hello'})
        self.assertNotIn('PRIVATE', response.text)
        self.assertEqual([item['type'] for item in self.events(response)], ['delta', 'error'])
        self.assertEqual(api.active_requests, 0)
        async def missing(*_, **_options):
            raise IndexNotReadyError('/private/vector_db')
            yield
        with patch.object(api, 'stream_answer', missing):
            response = self.client.post('/api/chat', json={'question':'hello'})
        self.assertNotIn('vector_db', response.text)
        self.assertIn('unavailable', response.text)

    def test_timeout_cleans_up_stream_and_busy_is_bounded(self):
        closed = []
        async def stalled(*_, **_options):
            try:
                await asyncio.sleep(1)
                yield 'late'
            finally:
                closed.append(True)
        with patch.object(api, 'stream_answer', stalled), patch.object(api, 'REQUEST_DEADLINE', .01):
            response = self.client.post('/api/chat', json={'question':'hello'})
        self.assertEqual(self.events(response)[-1]['code'], 'timeout')
        self.assertEqual(closed, [True])
        self.assertEqual(api.active_requests, 0)
        api.active_requests = 5
        with patch.object(api, 'stream_answer') as stream:
            self.assertEqual(self.client.post('/api/chat', json={'question':'hello'}).status_code, 429)
            stream.assert_not_called()

    def test_fifth_chat_request_is_admitted_and_releases_its_slot(self):
        api.active_requests = 4
        async def answer(*_, **_options):
            self.assertEqual(api.active_requests, 5)
            yield 'Hello'
        with patch.object(api, 'stream_answer', answer):
            response = self.client.post('/api/chat', json={'question':'hello'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.events(response)[-1]['type'], 'done')
        self.assertEqual(api.active_requests, 4)

    def test_provider_connection_failures_release_slots_and_allow_a_fresh_request(self):
        request = httpx.Request('POST', 'https://example.invalid/private?key=SECRET')
        for failure, partial in ((APIConnectionError(request=request), ''),
                                 (APIConnectionError(request=request), 'Partial answer'),
                                 (APITimeoutError(request=request), '')):
            failure.__cause__ = OSError('PRIVATE transport details')
            closed = []
            async def failing(*_, **_options):
                try:
                    if partial:
                        yield partial
                    raise failure
                finally:
                    closed.append(True)
            with patch.object(api, 'stream_answer', failing):
                response = self.client.post('/api/chat', json={'question': 'Hello', 'history': []})
            events = self.events(response)
            self.assertEqual(events[-1]['type'], 'error')
            self.assertIn('provider', events[-1]['message'])
            self.assertEqual([item['type'] for item in events], ['delta', 'error'] if partial else ['error'])
            self.assertEqual(api.active_requests, 0)
            self.assertEqual(closed, [True])
            self.assertNotIn('PRIVATE', response.text)
            self.assertNotIn('SECRET', response.text)
            async def recovered(*_, **_options):
                yield 'Fresh answer.'
            with patch.object(api, 'stream_answer', recovered):
                response = self.client.post('/api/chat', json={'question': 'New question', 'history': []})
            self.assertEqual(self.events(response)[-1], {'type': 'done', 'text': 'Fresh answer.'})
            self.assertEqual(api.active_requests, 0)


class StreamingPipelineTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        legacy = patch.object(answer, 'model_followups_enabled', return_value=False)
        legacy.start()
        self.addCleanup(legacy.stop)

    async def test_failed_embedding_connection_does_not_poison_the_next_request(self):
        store = Mock()
        store.similarity_search_by_vector.return_value = [Document(page_content='Evidence')]
        failure = APIConnectionError(request=httpx.Request('POST', 'https://example.invalid'))
        embeddings = Mock(aembed_query=AsyncMock(side_effect=[failure, [.1]]))
        async def generate(_):
            yield 'Fresh answer.'
        model = Mock(astream=Mock(side_effect=generate))
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=embeddings), patch.object(answer, 'get_chat_model', return_value=model):
            with self.assertRaises(APIConnectionError):
                _ = [delta async for delta in answer.stream_answer('First question')]
            model.astream.assert_not_called()
            result = ''.join([delta async for delta in answer.stream_answer('Fresh question')])
        self.assertEqual(result, 'Fresh answer.')
        self.assertEqual(embeddings.aembed_query.await_count, 2)

    async def test_generation_streams_with_shared_prompt_and_async_embedding(self):
        prompts = []
        async def generate(prompt):
            prompts.append(prompt.to_messages())
            yield 'Favour '
            yield 'builds software.'
        store = Mock()
        store.similarity_search_by_vector.return_value = [Document(page_content='Supported evidence')]
        embeddings = Mock(aembed_query=AsyncMock(return_value=[.1, .2]))
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=embeddings), patch.object(answer, 'get_chat_model', return_value=RunnableLambda(generate)):
            chunks = [text async for text in answer.stream_answer('Who is Favour?')]
        self.assertEqual(chunks, ['Favour ', 'builds software.'])
        embeddings.aembed_query.assert_awaited_once_with('Who is Favour?')
        self.assertEqual(prompts[0][0].content, answer.SYSTEM_PROMPT)
        self.assertEqual(json.loads(prompts[0][1].content)['excerpts'][0]['text'], 'Supported evidence')

    async def test_async_followup_rewrites_once_and_keeps_original_question(self):
        prompts = []
        async def generate(prompt):
            prompts.append(prompt.to_messages())
            yield 'Favour Policy.ng contribution' if len(prompts) == 1 else 'Frontend work.'
        history = [{'role':'user','content':'Policy.ng?'}, {'role':'assistant','content':'A project.'}]
        store = Mock()
        store.similarity_search_by_vector.return_value = [Document(page_content='Frontend contribution')]
        embeddings = Mock(aembed_query=AsyncMock(return_value=[.1]))
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=embeddings), patch.object(answer, 'get_chat_model', return_value=RunnableLambda(generate)):
            text = ''.join([delta async for delta in answer.stream_answer('What did he do there?', history)])
        self.assertEqual(text, 'Frontend work.')
        embeddings.aembed_query.assert_awaited_once_with('Favour Policy.ng contribution')
        self.assertEqual(json.loads(prompts[-1][1].content)['question'], 'What did he do there?')

    async def test_limits_empty_context_and_validation(self):
        store = Mock()
        store.similarity_search_by_vector.return_value = [Document(page_content='Evidence')]
        embeddings = Mock(aembed_query=AsyncMock(return_value=[.1]))
        async def long_answer(_):
            for _ in range(1000):
                yield 'word '
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=embeddings), patch.object(answer, 'get_chat_model', return_value=RunnableLambda(long_answer)):
            text = ''.join([delta async for delta in answer.stream_answer('Question')])
        self.assertLessEqual(len(text), 2000)
        self.assertLessEqual(token_count(text), 512)
        with patch.object(answer, 'get_vectorstore') as factory:
            with self.assertRaises(ValueError):
                _ = [part async for part in answer.stream_answer(' ')]
            factory.assert_not_called()

    async def test_cancel_closes_generation(self):
        closed = []
        async def generate(_):
            try:
                yield 'First'
                await asyncio.sleep(1)
                yield 'Last'
            finally:
                closed.append(True)
        store = Mock()
        store.similarity_search_by_vector.return_value = [Document(page_content='Evidence')]
        model = Mock(astream=generate)
        with patch.object(answer, 'get_vectorstore', return_value=store), patch.object(answer, 'get_embeddings', return_value=Mock(aembed_query=AsyncMock(return_value=[.1]))), patch.object(answer, 'get_chat_model', return_value=model):
            stream = answer.stream_answer('Question')
            self.assertEqual(await anext(stream), 'First')
            await stream.aclose()
        self.assertEqual(closed, [True])

class LocalPreviewOriginTests(unittest.TestCase):
    def test_port_5174_question_reaches_generation_but_foreign_origins_do_not(self):
        async def stream(*_args, **_options):
            yield 'Supported contribution answer.'
        with TestClient(api.app, base_url='http://127.0.0.1') as client, patch.object(api, 'stream_answer', stream):
            api.active_requests = 0
            for origin in ('http://127.0.0.1:5174', 'http://localhost:5174'):
                response = client.post('/api/chat', headers={'Origin': origin}, json={'question': 'What did Favour contribute to Policy.ng?', 'history': []})
                self.assertEqual(response.status_code, 200)
                self.assertIn('"type": "done"', response.text)
            denied = client.post('/api/chat', headers={'Origin': 'http://attacker.example:5174'}, json={'question': 'Hello'})
            self.assertEqual(denied.status_code, 403)
