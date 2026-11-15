"""Offline checks of authentic release data, corruption boundaries and ranking."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from implementation import answer, packaged_index as release
from implementation.guardrails import IndexNotReadyError


class PackagedIndexTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads(release.INDEX_PATH.read_text())

    def write(self, folder, payload):
        path = Path(folder)/'knowledge.json'
        content = json.dumps(payload).encode()
        path.write_bytes(content)
        path.with_suffix('.sha256').write_text(hashlib.sha256(content).hexdigest())
        return path

    def test_real_release_is_valid_and_loads_without_provider_clients(self):
        with patch('implementation.config.get_embeddings', side_effect=AssertionError('Provider during load')):
            index = release.load_packaged_index()
        self.assertEqual(len(index._records), 33)
        self.assertEqual(self.payload['dimension'], 3072)
        for record in index._records:
            first = index.similarity_search_by_vector(record['vector'], k=1)[0]
            self.assertEqual(first.id, record['id'])
            self.assertEqual(first.page_content, record['text'])

    def test_packaged_mode_never_opens_mutable_chroma(self):
        answer.get_vectorstore.cache_clear()
        try:
            with patch.object(answer, 'INDEX_MODE', 'packaged'), patch.object(answer, 'Chroma', side_effect=AssertionError('Mutable index')):
                self.assertIsInstance(answer.get_vectorstore(), release.PackagedIndex)
        finally:
            answer.get_vectorstore.cache_clear()

    def test_stale_corrupt_missing_and_incompatible_artifacts_fail_closed(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'knowledge.json'
            with self.assertRaises(IndexNotReadyError): release.load_packaged_index(path)
            path = self.write(folder, self.payload)
            path.write_text(path.read_text()+' ')
            with self.assertRaises(IndexNotReadyError): release.load_packaged_index(path)
            for mutate in (
                lambda p: p.update(fingerprint='stale'),
                lambda p: p.update(model='wrong-model'),
                lambda p: p.update(metric='cosine'),
                lambda p: p['records'].pop(),
                lambda p: p['records'][0].update(text='Invented evidence'),
                lambda p: p['records'][0]['vector'].pop(),
                lambda p: p['records'][0]['vector'].__setitem__(0, float('nan')),
                lambda p: p['records'][0].update(id=p['records'][1]['id']),
            ):
                payload = copy.deepcopy(self.payload)
                mutate(payload)
                with self.assertRaises(IndexNotReadyError): release.load_packaged_index(self.write(folder, payload))

    def test_query_validation_and_sync_retriever(self):
        index = release.load_packaged_index()
        for vector in ([0.0], [float('inf')]*3072, [0.0]*3072):
            with self.assertRaises(IndexNotReadyError): index.similarity_search_by_vector(vector)
        record = self.payload['records'][0]
        with patch.object(release, 'get_embeddings') as embeddings:
            embeddings.return_value.embed_query.return_value = record['vector']
            self.assertEqual(index.as_retriever(search_kwargs={'k': 1}).invoke('question')[0].id, record['id'])
