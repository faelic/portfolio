"""Local batch dashboard for the existing sequential evaluation functions."""
import gradio as gr
import pandas as pd
from openai import OpenAIError

from evaluation.eval import (
    evaluate_all_answers, evaluate_all_retrieval, summarize_retrieval,
)
from implementation.answer import IndexNotReadyError

ANSWER_METRICS = ('accuracy', 'completeness', 'relevance', 'grounding')


def retrieval_charts(rows):
    """Adapt existing category averages for plotting; omit unavailable scores."""
    data = pd.DataFrame(rows, columns=[
        'Category', 'Eligible', 'Excluded unanswerable', 'MRR', 'Mean evidence coverage',
    ]).dropna(subset=['MRR', 'Mean evidence coverage'])
    return (None, None) if data.empty else (data, data)


def answer_charts(rows):
    data = pd.DataFrame(rows, columns=[
        'Category', 'Cases', 'Accuracy', 'Completeness', 'Relevance', 'Grounding',
    ])
    return (None,) * 4 if data.empty else (data,) * 4


def run_retrieval_evaluation(progress=gr.Progress()):
    """Macro-average eligible cases; unanswerable cases remain N/A."""
    results = []
    try:
        for test, result, fraction in evaluate_all_retrieval():
            results.append((test, result))
            progress(fraction, desc=f'{test.id}: {len(results)} cases processed')
    except (IndexNotReadyError, OpenAIError, ValueError) as exc:
        raise gr.Error(f'Retrieval run stopped after {len(results)} cases: {exc}') from exc
    summary = summarize_retrieval(results)
    summary['processed_cases'] = len(results)
    categories = [
        [category, scores['eligible_cases'], scores['excluded_unanswerable'],
         scores['mrr'], scores['mean_evidence_coverage']]
        for category, scores in summary['categories'].items()
    ]
    cases = [
        [test.id, test.category, test.answerability, result.reciprocal_rank,
         result.matched_groups, result.total_groups, result.evidence_coverage]
        for test, result in results
    ]
    return summary, categories, cases


def summarize_answers(results):
    """Equal weight per question; partial and unanswerable answers also count."""
    def means(rows):
        return {
            'cases': len(rows),
            **{name: sum(getattr(score, name) for _, score in rows) / len(rows) if rows else None
               for name in ANSWER_METRICS},
        }

    return {
        **means(results),
        'categories': {
            category: means([(test, score) for test, score in results if test.category == category])
            for category in sorted({test.category for test, _ in results})
        },
    }


def run_answer_evaluation(progress=gr.Progress()):
    """Run generation and judging sequentially, including all four score fields."""
    results = []
    try:
        for test, score, fraction in evaluate_all_answers():
            results.append((test, score))
            progress(fraction, desc=f'{test.id}: {len(results)} cases processed')
    except (IndexNotReadyError, OpenAIError, ValueError) as exc:
        raise gr.Error(f'Answer run stopped after {len(results)} cases: {exc}') from exc
    summary = summarize_answers(results)
    categories = [
        [category, scores['cases'], *[scores[name] for name in ANSWER_METRICS]]
        for category, scores in summary['categories'].items()
    ]
    cases = [
        [test.id, test.category, test.answerability,
         *[getattr(score, name) for name in ANSWER_METRICS], score.feedback]
        for test, score in results
    ]
    return summary, categories, cases


def build_ui():
    with gr.Blocks(title="Favour's portfolio — batch evaluation", analytics_enabled=False) as ui:
        gr.Markdown("# Portfolio batch evaluation\nEvaluate the full authored question set using the existing local pipeline.")
        gr.Markdown(
            'Opening this dashboard makes no provider calls. Run buttons use OpenAI services '
            'and require the existing `docs` index; they never ingest or rebuild it. '
            'For chat and individual cases, use `app.py`.'
        )
        with gr.Tab('Retrieval'):
            gr.Markdown(
                'Run retrieval across all cases. Eligible questions request query embeddings; '
                'unanswerable cases skip retrieval. MRR and section-based evidence coverage '
                'range from 0–1 and exclude unanswerable cases. A section match does not prove '
                'that every required fact was retrieved. Blank scores mean not applicable.'
            )
            retrieval_button = gr.Button('Run all retrieval cases (query embeddings)', variant='primary')
            retrieval_summary = gr.JSON(label='Retrieval summary')
            with gr.Row():
                mrr_chart = gr.BarPlot(x='Category', y='MRR', title='MRR by category',
                                      y_lim=[0, 1], x_label_angle=-30)
                coverage_chart = gr.BarPlot(x='Category', y='Mean evidence coverage',
                                           title='Evidence coverage by category',
                                           y_lim=[0, 1], x_label_angle=-30)
            retrieval_categories = gr.Dataframe(
                headers=['Category', 'Eligible', 'Excluded unanswerable', 'MRR', 'Mean evidence coverage'],
                type='array', interactive=False, label='Retrieval by category',
            )
            with gr.Accordion('Individual retrieval results', open=False):
                retrieval_cases = gr.Dataframe(
                    headers=['Test ID', 'Category', 'Answerability', 'Reciprocal rank',
                             'Matched groups', 'Required groups', 'Evidence coverage'],
                    type='array', interactive=False, label='Retrieval cases',
                )
            retrieval_outputs = [retrieval_summary, retrieval_categories, retrieval_cases]
            retrieval_categories.change(retrieval_charts, inputs=retrieval_categories,
                                        outputs=[mrr_chart, coverage_chart])
            retrieval_button.click(lambda: (None, [], []), outputs=retrieval_outputs).then(
                run_retrieval_evaluation, outputs=retrieval_outputs,
                concurrency_id='evaluation', concurrency_limit=1,
            )

        with gr.Tab('Answers'):
            gr.Markdown(
                'Run a fresh standalone answer and judge call for every case, in addition to '
                'query embeddings. All cases count, including partial and unanswerable questions. '
                'Accuracy, completeness, relevance, and grounding range from 1–5. These are '
                'model judgments, not independently verified facts. No pass/fail thresholds are assigned.'
            )
            answer_button = gr.Button('Run all answers + judging (paid model calls)', variant='primary')
            answer_summary = gr.JSON(label='Answer score summary')
            answer_plots = []
            for metrics in (('Accuracy', 'Completeness'), ('Relevance', 'Grounding')):
                with gr.Row():
                    for metric in metrics:
                        answer_plots.append(gr.BarPlot(
                            x='Category', y=metric, title=f'{metric} by category',
                            y_lim=[0, 5], x_label_angle=-30,
                        ))
            answer_categories = gr.Dataframe(
                headers=['Category', 'Cases', 'Accuracy', 'Completeness', 'Relevance', 'Grounding'],
                type='array', interactive=False, label='Answer scores by category',
            )
            with gr.Accordion('Individual answer scores and feedback', open=False):
                answer_cases = gr.Dataframe(
                    headers=['Test ID', 'Category', 'Answerability', 'Accuracy', 'Completeness',
                             'Relevance', 'Grounding', 'Feedback'],
                    type='array', interactive=False, label='Answer cases',
                )
            answer_outputs = [answer_summary, answer_categories, answer_cases]
            answer_categories.change(answer_charts, inputs=answer_categories, outputs=answer_plots)
            answer_button.click(lambda: (None, [], []), outputs=answer_outputs).then(
                run_answer_evaluation, outputs=answer_outputs,
                concurrency_id='evaluation', concurrency_limit=1,
            )
    return ui


def main():
    build_ui().launch(server_name='127.0.0.1', share=False, inbrowser=True)


if __name__ == '__main__':
    main()
