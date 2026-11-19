import unittest
import json
from pathlib import Path

from langchain_core.documents import Document
from implementation.followups import suggest_followup, TOPICS

ROOT = Path(__file__).resolve().parents[1] / 'knowledge'


def source(path, document_id):
    return Document(page_content=(ROOT / path).read_text(), metadata={'document_id': document_id})


class FollowupTests(unittest.TestCase):
    def setUp(self):
        self.monierave = source('projects/monierave.md', 'project-monierave')

    def test_adjacent_topic_uses_current_evidence_without_another_model(self):
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency keys.', [], [self.monierave]),
                         'What happens if a notification fails in Monierave?')

    def test_does_not_repeat_answered_subjects_or_previous_questions(self):
        history = [{'role': 'user', 'content': 'What happens if a notification fails?'}]
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency and row locks for concurrency.', history, [self.monierave]),
                         'How does Monierave manage login sessions?')
        history.append({'role': 'user', 'content': 'How does Monierave manage login sessions?'})
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency and row locks for concurrency.', history, [self.monierave]),
                         "How did Favour build Monierave's frontend?")

    def test_missing_evidence_ambiguity_and_greetings_have_no_suggestion(self):
        for question, answer, documents in (
            ('Monierave?', 'Monierave uses idempotency.', []),
            ('Thanks', "You're welcome!", [self.monierave]),
        ):
            with self.subTest(question=question):
                self.assertIsNone(suggest_followup(question, answer, [], documents))

    def test_unrelated_retrieved_documents_do_not_set_the_topic(self):
        blockscan = source('projects/blockscan.md', 'project-blockscan')
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency keys.', [], [blockscan, self.monierave]),
                         'What happens if a notification fails in Monierave?')
        self.assertIsNone(suggest_followup('How does Monierave work?', 'BlockScan is an explorer.', [], [blockscan, self.monierave]))

    def test_history_resolves_followup_but_explicit_new_topic_wins(self):
        history = [{'role': 'user', 'content': 'How does Monierave work?'}]
        blockscan = source('projects/blockscan.md', 'project-blockscan')
        self.assertEqual(suggest_followup('How does it avoid duplicates?', 'Monierave uses idempotency.', history, [self.monierave]),
                         'What happens if a notification fails in Monierave?')
        self.assertEqual(suggest_followup('Tell me about BlockScan', 'BlockScan is a Sepolia explorer.', history, [blockscan, self.monierave]),
                         'How does BlockScan handle failed live updates?')
        profile = source('profile/overview.md', 'profile-overview')
        self.assertEqual(suggest_followup('Who is Favour?', 'Favour builds applications.', history, [profile, self.monierave]),
                         'What did Favour contribute to Policy.ng?')

    def test_candidates_are_bounded_and_each_project_has_a_supported_next_step(self):
        for _, _, candidates in TOPICS:
            for question, _, _ in candidates:
                self.assertLessEqual(len(question), 120)
                self.assertNotIn('\n', question)
        for name, path, doc_id in (
            ('Policy.ng', 'experience/flamong-policy-ng.md', 'experience-flamong-policy-ng'),
            ('BucketFlow', 'projects/bucketflow.md', 'project-bucketflow'),
            ('Cleanup', 'projects/approval-cleanup.md', 'project-approval-cleanup'),
            ('Escrow', 'projects/escrow.md', 'project-escrow'),
        ):
            with self.subTest(name=name):
                self.assertIsNotNone(suggest_followup(f'Tell me about {name}', f'{name} is a project.', [], [source(path, doc_id)]))

    def test_overview_mentions_do_not_exhaust_questions_and_pronouns_are_valid(self):
        self.assertEqual(suggest_followup('How does Monierave work?',
                         'Monierave uses idempotency, row locks, an outbox and revocable sessions.', [], [self.monierave]),
                         'What happens if a notification fails in Monierave?')
        self.assertEqual(suggest_followup('What if the email fails?',
                         'It retries the notification without changing the committed transfer.',
                         [{'role':'user','content':'How does Monierave work?'}], [self.monierave]),
                         'How does Monierave handle repeated transfers?')

    def test_unknown_fact_can_lead_to_a_different_documented_subject(self):
        self.assertEqual(suggest_followup('How many paying customers does Monierave have?',
                         'That count is unknown.', [], [self.monierave]),
                         'What happens if a notification fails in Monierave?')

    def test_eight_turn_fixture_stays_on_topic_and_allows_exhaustion(self):
        fixture = json.loads((ROOT.parents[1] / 'tests/fixtures/followup-conversation.json').read_text())
        documents = [self.monierave,
                     source('profile/overview.md', 'profile-overview'),
                     source('experience/flamong-policy-ng.md', 'experience-flamong-policy-ng'),
                     source('projects/portfolio-rag-assistant.md', 'project-portfolio-rag-assistant')]
        history = []
        suggestions = set()
        for turn in fixture['turns']:
            with self.subTest(question=turn['question']):
                result = suggest_followup(turn['question'], turn['answer'], history[-12:], documents)
                expected = (None if 'forms and failed' in turn['question'] else
                            'How does the Portfolio RAG Assistant resolve conversation follow-ups?'
                            if 'use retrieved evidence' in turn['question'] else turn['suggestion'])
                self.assertEqual(result, expected)
                if result:
                    self.assertNotIn(result, suggestions)
                    suggestions.add(result)
            history += [{'role':'user','content':turn['question']}, {'role':'assistant','content':turn['answer']}]


class FollowupQualityRegressionTests(unittest.TestCase):
    def test_saved_live_failures_have_supported_on_topic_continuations(self):
        from implementation.structured_answer import choose_followup
        root = Path(__file__).resolve().parents[2]
        rows = json.loads((root / 'tests/fixtures/followup-quality-regressions.json').read_text())['cases']
        expected = {
            'followup-04': 'What can the arbiter do in Escrow?',
            'followup-07': "How did Favour build Monierave's frontend?",
            'followup-09': 'How does BlockScan handle failed live updates?',
            'followup-11': 'How does the Portfolio RAG Assistant resolve conversation follow-ups?',
            'followup-12': 'What did Favour own on Policy.ng?',
        }
        for row in rows:
            old = row['followup']
            metadata = {key: old[key] for key in ('question', 'document_id', 'evidence_quote')} if old and old['source'] == 'model' else None
            docs = [Document(page_content=d['text'], metadata={'document_id': d['document_id']}) for d in row['selected_context']]
            recent = ['How does Monierave manage login sessions?'] if row['id'] == 'followup-07' else []
            with self.subTest(case=row['id']):
                new = choose_followup(metadata, row['question'], row['answer'], row['history'], docs, recent)
                self.assertEqual(new, {'question': expected[row['id']], 'source': 'curated'})

    def test_generated_unrelated_question_and_recent_duplicate_fall_back(self):
        from implementation.structured_answer import choose_followup
        monierave = source('projects/monierave.md', 'project-monierave')
        policy = source('experience/flamong-policy-ng.md', 'experience-flamong-policy-ng')
        quote = 'His responsibility at Policy.ng is the frontend, including the integration of its AI-assisted question interface.'
        result = choose_followup({'question': 'What did Favour integrate at Policy.ng?',
                                  'document_id': 'experience-flamong-policy-ng', 'evidence_quote': quote},
                                 'How does Monierave work?', 'Monierave is a banking simulation.', [], [monierave, policy])
        self.assertIn('Monierave', result['question'])
        first = suggest_followup('Monierave?', 'Monierave is a banking simulation.', [], [monierave])
        second = suggest_followup('Monierave?', 'Monierave is a banking simulation.', [], [monierave], [first])
        self.assertNotEqual(first, second)

    def test_recent_suggestions_are_bounded_untrusted_reference_data(self):
        from implementation.followups import bounded_suggestions
        self.assertEqual(bounded_suggestions(['How does Monierave work?']), ['How does Monierave work?'])
        for value in ('text', [None], ['x' * 121], ['q'] * 13, ['bad\ncontrol'], ['bad\u202econtrol']):
            with self.subTest(value=value), self.assertRaises(ValueError):
                bounded_suggestions(value)
