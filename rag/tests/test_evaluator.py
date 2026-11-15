"""Offline batch-dashboard checks: only synthetic scores are aggregated."""
import asyncio
import runpy
import socket
import unittest
from unittest.mock import Mock, patch

import gradio as gr

import evaluator
from evaluation.eval import AnswerEval, RetrievalEval
from evaluation.test import load_tests as load_questions
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


def retrieval_score(rank, coverage, matched=1, total=2):
    return RetrievalEval(k=10, reciprocal_rank=rank, evidence_coverage=coverage,
                         matched_groups=matched, total_groups=total)


def answer_score(value, grounding=5):
    return AnswerEval(feedback='Synthetic feedback', accuracy=value, completeness=value,
                      relevance=value, grounding=grounding)


def build_in_running_loop(factory):
    # Gradio's synchronous lock helpers otherwise allocate a fresh unclosed
    # event loop per lock. Exercise UI construction within an owned loop.
    async def build():
        return factory()
    return asyncio.run(build())


class BatchDashboardTests(unittest.TestCase):
    def setUp(self):
        tests = load_questions()
        self.first = tests[0]
        self.second = self.first.model_copy(update={'id': 'synthetic-second'})
        self.third = self.first.model_copy(update={'id': 'synthetic-third', 'category': 'temporal'})
        self.unanswerable = next(test for test in tests if test.answerability == 'unanswerable')

    def test_retrieval_reuses_summary_and_excludes_unanswerable(self):
        rows = [
            (self.first, retrieval_score(.5, .5), 1 / 3),
            (self.third, retrieval_score(1, 1, 2, 2), 2 / 3),
            (self.unanswerable, retrieval_score(None, None, 0, 0), 1),
        ]
        progress = Mock()
        with patch.object(evaluator, 'evaluate_all_retrieval', return_value=iter(rows)):
            summary, categories, cases = evaluator.run_retrieval_evaluation(progress)
        self.assertEqual(summary['processed_cases'], 3)
        self.assertEqual(summary['eligible_cases'], 2)
        self.assertEqual(summary['excluded_unanswerable'], 1)
        self.assertEqual(summary['mrr'], .75)
        self.assertEqual(summary['mean_evidence_coverage'], .75)
        self.assertEqual(categories[0], ['direct_fact', 1, 1, .5, .5])
        self.assertEqual(cases[-1], [self.unanswerable.id, self.unanswerable.category,
                                     'unanswerable', None, 0, 0, None])
        self.assertEqual(progress.call_count, 3)
        progress.assert_called_with(1, desc=f'{self.unanswerable.id}: 3 cases processed')

    def test_answer_means_weight_questions_and_include_grounding(self):
        rows = [(self.first, answer_score(1), .25), (self.second, answer_score(3), .5),
                (self.third, answer_score(5), .75),
                (self.unanswerable, answer_score(3, grounding=1), 1)]
        progress = Mock()
        with patch.object(evaluator, 'evaluate_all_answers', return_value=iter(rows)):
            summary, categories, cases = evaluator.run_answer_evaluation(progress)
        self.assertEqual(summary['cases'], 4)
        self.assertEqual(summary['accuracy'], 3)
        self.assertEqual(summary['grounding'], 4)
        self.assertEqual(summary['categories']['direct_fact']['cases'], 3)
        self.assertEqual(len(categories[0]), 6)
        self.assertEqual(cases[-1][-2:], [1, 'Synthetic feedback'])
        self.assertEqual(cases[-1][2], 'unanswerable')
        self.assertEqual(progress.call_count, 4)
        # Three eligible question scores average to 3, not the category-mean average 3.5.
        self.assertEqual(evaluator.summarize_answers([(test, score) for test, score, _ in rows[:3]])['accuracy'], 3)

    def test_empty_and_only_unanswerable_runs_do_not_divide_by_zero(self):
        with patch.object(evaluator, 'evaluate_all_retrieval', return_value=iter([])):
            summary, categories, cases = evaluator.run_retrieval_evaluation(Mock())
        self.assertIsNone(summary['mrr'])
        self.assertEqual(summary['processed_cases'], 0)
        self.assertEqual((categories, cases), ([], []))
        row = (self.unanswerable, retrieval_score(None, None, 0, 0), 1)
        with patch.object(evaluator, 'evaluate_all_retrieval', return_value=iter([row])):
            summary, categories, _ = evaluator.run_retrieval_evaluation(Mock())
        self.assertEqual(summary['eligible_cases'], 0)
        self.assertIsNone(categories[0][-1])
        with patch.object(evaluator, 'evaluate_all_answers', return_value=iter([])):
            summary, categories, cases = evaluator.run_answer_evaluation(Mock())
        self.assertEqual(summary['cases'], 0)
        self.assertIsNone(summary['accuracy'])
        self.assertIsNone(summary['grounding'])
        self.assertEqual((categories, cases), ([], []))

    def test_failures_report_completed_count_without_returning_success(self):
        def failed_retrieval():
            yield self.first, retrieval_score(1, 1, 2, 2), .5
            raise IndexNotReadyError('Missing docs index')
        def failed_answers():
            raise ValueError('Malformed test record')
            yield
        with patch.object(evaluator, 'evaluate_all_retrieval', failed_retrieval):
            with self.assertRaisesRegex(gr.Error, 'stopped after 1 cases.*portfolio index is unavailable'):
                evaluator.run_retrieval_evaluation(Mock())
        with patch.object(evaluator, 'evaluate_all_answers', failed_answers):
            with self.assertRaisesRegex(gr.Error, 'stopped after 0 cases.*Invalid request'):
                evaluator.run_answer_evaluation(Mock())

    def test_import_and_ui_build_do_not_run_evaluations(self):
        with patch.object(evaluator, 'evaluate_all_retrieval', side_effect=AssertionError('Live retrieval')), \
             patch.object(evaluator, 'evaluate_all_answers', side_effect=AssertionError('Live generation')), \
             patch('langchain_openai.ChatOpenAI', side_effect=AssertionError('Client construction')), \
             patch('dotenv.load_dotenv', side_effect=AssertionError('Environment override')):
            runpy.run_path(str(config.RAG_DIR / 'evaluator.py'), run_name='import_check')
            ui = build_in_running_loop(evaluator.build_ui)
        self.assertFalse(ui.analytics_enabled)
        labels = [component['props'].get('label') for component in ui.config['components']]
        self.assertIn('Answer scores by category', labels)
        self.assertIn('Retrieval summary', labels)
        self.assertNotIn('Normalized DCG (nDCG)', labels)
        # Both provider loops share a sequential queue; no evaluation is a load event.
        dependencies = ui.config['dependencies']
        self.assertEqual(sum(function.concurrency_id == 'evaluation' for function in ui.fns.values()), 2)
        self.assertFalse(any(target[1] == 'load' for dep in dependencies for target in dep['targets']))
        ui.close()

    def test_main_launches_only_on_localhost(self):
        with patch.object(evaluator, 'build_ui') as build:
            evaluator.main()
        build.return_value.launch.assert_called_once_with(server_name='127.0.0.1', share=False, inbrowser=True)

    def test_charts_use_existing_averages_and_preserve_zero_scores(self):
        rows = [['direct_fact', 2, 1, 0, .5], ['temporal', 0, 1, None, None]]
        mrr, coverage = evaluator.retrieval_charts(rows)
        self.assertEqual(mrr['Category'].tolist(), ['direct_fact'])
        self.assertEqual(mrr['MRR'].tolist(), [0])
        self.assertEqual(coverage['Mean evidence coverage'].tolist(), [.5])
        gr.BarPlot(x='Category', y='MRR').postprocess(mrr)
        plots = evaluator.answer_charts([['temporal', 3, 4, 3, 5, 2]])
        for metric, data in zip(('Accuracy', 'Completeness', 'Relevance', 'Grounding'), plots):
            gr.BarPlot(x='Category', y=metric).postprocess(data)
        self.assertEqual(plots[-1]['Grounding'].tolist(), [2])
        self.assertEqual(evaluator.retrieval_charts([]), (None, None))
        self.assertEqual(evaluator.retrieval_charts([rows[1]]), (None, None))
        self.assertEqual(evaluator.answer_charts([]), (None,) * 4)
