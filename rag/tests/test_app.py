"""Offline UI wiring checks with synthetic passages and mocked providers."""
import copy
import asyncio
import runpy
import socket
import unittest
from unittest.mock import patch

import gradio as gr
from langchain_core.documents import Document

import app
from evaluation.eval import AnswerEval
from implementation import config
from implementation.answer import IndexNotReadyError

_guards = []


def setUpModule():
    for target in ('socket.create_connection', 'socket.socket.connect'):
        guard = patch(target, side_effect=AssertionError('Network forbidden in offline tests'))
        guard.start()
        _guards.append(guard)


def tearDownModule():
    for guard in reversed(_guards):
        guard.stop()
    _guards.clear()


def build_in_running_loop(factory):
    # Gradio's synchronous lock helpers otherwise allocate a fresh unclosed
    # event loop per lock. Exercise UI construction within an owned loop.
    async def build():
        return factory()
    return asyncio.run(build())


class AppTests(unittest.TestCase):
    def setUp(self):
        self.test = app.load_tests()[0]
        self.docs = [Document(id='synthetic-chunk', page_content='<script>plain source</script>', metadata={
            'document_id': 'synthetic', 'document_title': 'Synthetic example',
            'source_path': 'rag/knowledge/example.md', 'section_paths': ['Example > Details'],
        })]

    def test_import_and_build_do_not_call_providers(self):
        with patch('langchain_openai.ChatOpenAI', side_effect=AssertionError('Model constructed')), \
             patch('implementation.answer.get_vectorstore', side_effect=AssertionError('Database opened')), \
             patch.object(app, 'answer_question', side_effect=AssertionError('Answer call')), \
             patch.object(app, 'fetch_context', side_effect=AssertionError('Retrieval call')), \
             patch.object(app, 'evaluate_answer', side_effect=AssertionError('Judge call')):
            runpy.run_path(str(config.RAG_DIR / 'app.py'), run_name='import_check')
            ui = build_in_running_loop(app.build_ui)
            labels = [component['props'].get('label') for component in ui.config['components']]
            self.assertIn('Conversation', labels)
            self.assertIn('Evaluation case', labels)
            self.assertFalse(ui.analytics_enabled)
            self.assertTrue(any(target[1] == 'clear' for dependency in ui.config['dependencies']
                                for target in dependency['targets']))
            ui.close()

    def test_chat_history_stays_plain_and_input_is_not_mutated(self):
        history = [{'role': 'user', 'content': 'Original'}, {'role': 'assistant', 'content': 'Prior'}]
        before = copy.deepcopy(history)
        with patch.object(app, 'answer_question', return_value=('New answer', self.docs)) as answer:
            message, updated, display, context = app.chat('  Follow up  ', history)
        answer.assert_called_once_with('Follow up', before)
        self.assertEqual(history, before)
        self.assertEqual(message, '')
        self.assertEqual(updated[-2:], [{'role': 'user', 'content': 'Follow up'},
                                       {'role': 'assistant', 'content': 'New answer'}])
        self.assertEqual(display, updated)
        self.assertTrue(all(isinstance(message['content'], str) for message in updated))
        for value in ('synthetic-chunk', 'rag/knowledge/example.md', 'Example > Details', '<script>'):
            self.assertIn(value, context)
        gr.Chatbot().postprocess(display)
        self.assertTrue(all(isinstance(message['content'], str) for message in updated))

    def test_blank_clear_and_missing_index(self):
        with patch.object(app, 'answer_question') as answer:
            result = app.chat('  ', [])
            answer.assert_not_called()
            self.assertEqual(result[:3], ('  ', [], []))
        self.assertEqual(app.clear_chat(), ('', [], [], app.EMPTY_CONTEXT))
        history = []
        with patch.object(app, 'answer_question', side_effect=IndexNotReadyError('Ingest docs first')):
            with self.assertRaisesRegex(gr.Error, 'portfolio index is unavailable'):
                app.chat('Question', history)
        self.assertEqual(history, [])

    def test_case_preview_is_local_and_resets_outputs(self):
        with patch.object(app, 'evaluate_answer', side_effect=AssertionError('Judge')), \
             patch.object(app, 'fetch_context', side_effect=AssertionError('Search')):
            record, scores, generated, context = app.preview_case(self.test.id)
        self.assertEqual(record, self.test.model_dump())
        self.assertIsNone(scores)
        self.assertEqual((generated, context), ('', app.EMPTY_CONTEXT))

    def test_retrieval_only_searches_once_without_answering(self):
        with patch.object(app, 'fetch_context', return_value=self.docs) as search, \
             patch.object(app, 'evaluate_answer', side_effect=AssertionError('Answer call')):
            result, generated, context = app.run_case(self.test.id, app.RETRIEVAL_ONLY)
        search.assert_called_once_with(self.test.question)
        self.assertEqual(result['test_id'], self.test.id)
        self.assertIsNone(result['answer_scores'])
        self.assertEqual(result['retrieval']['reciprocal_rank'], 0)
        self.assertEqual(generated, '')
        self.assertIn('synthetic-chunk', context)

    def test_unanswerable_retrieval_skips_providers(self):
        test = next(test for test in app.load_tests() if test.answerability == 'unanswerable')
        with patch.object(app, 'fetch_context', side_effect=AssertionError('Search')), \
             patch.object(app, 'evaluate_answer', side_effect=AssertionError('Judge')):
            result, _, _ = app.run_case(test.id, app.RETRIEVAL_ONLY)
        self.assertIsNone(result['retrieval']['reciprocal_rank'])
        self.assertIsNone(result['retrieval']['evidence_coverage'])

    def test_answer_and_judge_reuses_returned_documents(self):
        scores = AnswerEval(feedback='Synthetic result', accuracy=4, completeness=4, relevance=5, grounding=4)
        with patch.object(app, 'evaluate_answer', return_value=(scores, 'Generated', self.docs)) as evaluate, \
             patch.object(app, 'fetch_context', side_effect=AssertionError('Second search')):
            result, generated, context = app.run_case(self.test.id, app.ANSWER_AND_JUDGE)
        evaluate.assert_called_once_with(self.test)
        self.assertEqual(result['answer_scores'], scores.model_dump())
        self.assertEqual(generated, 'Generated')
        self.assertIn('synthetic-chunk', context)

    def test_main_launches_locally(self):
        with patch.object(app, 'build_ui') as build:
            app.main()
        build.return_value.launch.assert_called_once_with(server_name='127.0.0.1', share=False, inbrowser=True)
