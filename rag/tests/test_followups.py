import unittest
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
                         'What happens if a notification fails?')

    def test_does_not_repeat_answered_subjects_or_previous_questions(self):
        history = [{'role': 'user', 'content': 'What happens if a notification fails?'}]
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency and row locks for concurrency.', history, [self.monierave]),
                         'How does Monierave manage login sessions?')
        history.append({'role': 'user', 'content': 'How does Monierave manage login sessions?'})
        self.assertIsNone(suggest_followup('How does Monierave prevent duplicates?',
                          'Monierave uses idempotency and row locks for concurrency.', history, [self.monierave]))

    def test_missing_evidence_ambiguity_unknowns_and_greetings_have_no_suggestion(self):
        for question, answer, documents in (
            ('Monierave?', 'Monierave uses idempotency.', []),
            ('Monierave and BlockScan?', 'Monierave and BlockScan are projects.', [self.monierave]),
            ('How many Monierave customers?', 'Monierave customer count is unknown.', [self.monierave]),
            ('Thanks', "You're welcome!", [self.monierave]),
        ):
            with self.subTest(question=question):
                self.assertIsNone(suggest_followup(question, answer, [], documents))

    def test_unrelated_retrieved_documents_do_not_set_the_topic(self):
        blockscan = source('projects/blockscan.md', 'project-blockscan')
        self.assertEqual(suggest_followup('How does Monierave prevent duplicates?',
                         'Monierave uses idempotency keys.', [], [blockscan, self.monierave]),
                         'What happens if a notification fails?')
        self.assertIsNone(suggest_followup('How does Monierave work?', 'BlockScan is an explorer.', [], [blockscan, self.monierave]))

    def test_history_resolves_followup_but_explicit_new_topic_wins(self):
        history = [{'role': 'user', 'content': 'How does Monierave work?'}]
        blockscan = source('projects/blockscan.md', 'project-blockscan')
        self.assertEqual(suggest_followup('How does it avoid duplicates?', 'Monierave uses idempotency.', history, [self.monierave]),
                         'What happens if a notification fails?')
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
