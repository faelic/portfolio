"""Local Gradio workbench. Provider calls happen only through explicit actions."""
import gradio as gr
from openai import OpenAIError

from evaluation.eval import evaluate_answer, evaluate_retrieval
from evaluation.test import load_tests
from implementation.answer import IndexNotReadyError, answer_question, fetch_context

EMPTY_CONTEXT = "Retrieved passages will appear here."
RETRIEVAL_ONLY = "Retrieval only (query embedding)"
ANSWER_AND_JUDGE = "Answer + judge (query embedding + two model calls)"


def format_context(documents):
    """Plain text keeps source content inspectable without rendering its HTML."""
    passages = []
    for rank, document in enumerate(documents, 1):
        metadata = document.metadata
        passages.append(
            f"[{rank}] {metadata.get('document_title', 'Portfolio document')}\n"
            f"Document: {metadata.get('document_id', 'Unknown')}\n"
            f"Chunk: {metadata.get('chunk_id', document.id)}\n"
            f"Source: {metadata.get('source_path', 'Unknown')}\n"
            f"Sections: {'; '.join(metadata.get('section_paths', []))}\n\n"
            f"{document.page_content}"
        )
    return '\n\n-----\n\n'.join(passages) or 'No passages returned.'


def chat(message, history):
    """Keep plain-text history in session state, independent of Gradio's format."""
    if not message.strip():
        return message, history, history, gr.skip()
    try:
        response, documents = answer_question(message.strip(), history)
    except (IndexNotReadyError, OpenAIError, ValueError) as exc:
        raise gr.Error(str(exc)) from exc
    updated = history + [
        {'role': 'user', 'content': message.strip()},
        {'role': 'assistant', 'content': response},
    ]
    return '', updated, updated, format_context(documents)


def clear_chat():
    return '', [], [], EMPTY_CONTEXT


def preview_case(case_id):
    test = next(test for test in load_tests() if test.id == case_id)
    return test.model_dump(), None, '', EMPTY_CONTEXT


def run_case(case_id, mode):
    test = next(test for test in load_tests() if test.id == case_id)
    try:
        if mode == RETRIEVAL_ONLY:
            # The evaluator skips retrieval entirely for unanswerable cases.
            # Fetch here only for eligible cases so the UI can display the passages.
            documents = fetch_context(test.question) if test.answerability != 'unanswerable' else []
            answer_text = ''
            answer_scores = None
        elif mode == ANSWER_AND_JUDGE:
            answer_scores, answer_text, documents = evaluate_answer(test)
        else:
            raise ValueError('Choose an evaluation mode')
        retrieval = evaluate_retrieval(test, retrieved_docs=documents)
    except (IndexNotReadyError, OpenAIError, ValueError) as exc:
        raise gr.Error(str(exc)) from exc
    result = {
        'test_id': test.id, 'category': test.category, 'answerability': test.answerability,
        'retrieval': retrieval.model_dump(),
        'answer_scores': answer_scores.model_dump() if answer_scores else None,
    }
    return result, answer_text, format_context(documents)


def build_ui():
    tests = load_tests()
    with gr.Blocks(title="Favour's portfolio assistant — local testing", analytics_enabled=False) as ui:
        gr.Markdown("# Favour's portfolio assistant\nChat and inspect evidence, or test one evaluation case at a time.")
        gr.Markdown(
            "Opening this page makes no model calls. Sending a message or running an evaluation "
            "uses the configured OpenAI services. The existing `docs` index must already be ingested."
        )
        with gr.Tab('Assistant'):
            history = gr.State([])
            with gr.Row():
                with gr.Column():
                    conversation = gr.Chatbot(label='Conversation', height=440, allow_tags=False,
                                              buttons=['copy', 'copy_all'])
                    message = gr.Textbox(label='Your question', placeholder='What did Favour build at Policy.ng?')
                    with gr.Row():
                        send = gr.Button('Send', variant='primary')
                        clear = gr.Button('Clear conversation')
                context = gr.Textbox(label='Retrieved passages', value=EMPTY_CONTEXT,
                                     lines=22, max_lines=30, interactive=False)
            for event in (send.click, message.submit):
                event(chat, inputs=[message, history], outputs=[message, history, conversation, context],
                      concurrency_id='provider_calls', concurrency_limit=1)
            clear.click(clear_chat, outputs=[message, history, conversation, context],
                        concurrency_id='provider_calls', concurrency_limit=1)
            conversation.clear(clear_chat, outputs=[message, history, conversation, context],
                               concurrency_id='provider_calls', concurrency_limit=1)

        with gr.Tab('Evaluation'):
            case = gr.Dropdown(
                label='Evaluation case',
                choices=[(f'{test.id} · {test.category} · {test.question}', test.id) for test in tests],
                value=tests[0].id,
            )
            with gr.Accordion('Question, reference answer, and expected evidence', open=False):
                expected = gr.JSON(value=tests[0].model_dump(), label='Authored test case')
            mode = gr.Radio([RETRIEVAL_ONLY, ANSWER_AND_JUDGE], value=RETRIEVAL_ONLY, label='Evaluation mode')
            gr.Markdown(
                'Section-based evidence coverage measures section matches, not exact fact coverage. '
                'Unanswerable cases have no retrieval score; retrieval-only mode skips their search. '
                'Answer + judge generates a fresh standalone answer and judges it, independently of chat.'
            )
            run = gr.Button('Run selected case', variant='primary')
            with gr.Row():
                with gr.Column():
                    result = gr.JSON(label='Evaluation result')
                    generated = gr.Textbox(label='Generated answer', lines=6, interactive=False)
                evidence = gr.Textbox(label='Retrieved passages', value=EMPTY_CONTEXT,
                                      lines=22, max_lines=30, interactive=False)
            case.change(preview_case, inputs=case, outputs=[expected, result, generated, evidence])
            # Changing modes must not leave scores that look like a new run.
            mode.change(lambda: (None, '', EMPTY_CONTEXT), outputs=[result, generated, evidence])
            run.click(run_case, inputs=[case, mode], outputs=[result, generated, evidence],
                      concurrency_id='provider_calls', concurrency_limit=1)
    return ui


def main():
    build_ui().launch(server_name='127.0.0.1', share=False, inbrowser=True)


if __name__ == '__main__':
    main()
