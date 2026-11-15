"""Offline enforcement checks; no real index or provider calls."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch, Mock, AsyncMock
from fastapi.testclient import TestClient
import api
from implementation.config import ANSWER_MODEL, EMBEDDING_MODEL
from implementation.protection import Ledger, ProtectionError, initialize, budget_guard
from implementation.settings import Settings

class LedgerTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name)/'ledger.sqlite3'
        initialize(self.path)

    def test_missing_corrupt_and_blank_state_fail_closed(self):
        for name, content in [('missing',None),('corrupt',b'not sqlite'),('blank',b'')]:
            path=Path(self.folder.name)/name
            if content is not None: path.write_bytes(content)
            with self.assertRaises(ProtectionError): Ledger(path).check()
            if content is None: self.assertFalse(path.exists())
        with self.assertRaises(FileExistsError): initialize(self.path)
        Ledger(self.path).check()

    def test_rolling_admission_is_atomic_and_survives_reopen(self):
        ledger=Ledger(self.path)
        def admit(_):
            try:
                ledger.admit(now=1000)
                return True
            except ProtectionError: return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(admit,range(60))),30)
        with self.assertRaises(ProtectionError) as failure: Ledger(self.path).admit(now=1059)
        self.assertEqual(failure.exception.code,'rate_limited')
        self.assertEqual(failure.exception.retry_after,1)
        Ledger(self.path).admit(now=1060)

    def test_spend_is_atomic_and_unknown_prices_fail_closed(self):
        ledger=Ledger(self.path,104,104)
        def debit(_):
            try:
                ledger.debit('id','answer',ANSWER_MODEL,'x',0,now=1000)
                return True
            except ProtectionError: return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(debit,range(20))),2)
        self.assertEqual(Ledger(self.path).summary()[0][1],104)
        with self.assertRaises(ProtectionError): ledger.debit('id','answer','unpriced','x',0)

    def test_daily_monthly_rollover_and_uncertain_work_stays_charged(self):
        ledger=Ledger(self.path,1,2)
        at=lambda value: datetime.fromisoformat(value).replace(tzinfo=timezone.utc).timestamp()
        first=at('2026-11-12')
        ledger.debit('cancelled','embedding',EMBEDDING_MODEL,'x',0,first)
        with self.assertRaises(ProtectionError) as failure: ledger.debit('retry','embedding',EMBEDDING_MODEL,'x',0,first+1)
        self.assertEqual(failure.exception.retry_after,86399)
        ledger.debit('crashed','embedding',EMBEDDING_MODEL,'x',0,first+86400)
        with self.assertRaises(ProtectionError): Ledger(self.path,1,2).debit('next','embedding',EMBEDDING_MODEL,'x',0,first+172800)
        ledger.debit('new-month','embedding',EMBEDDING_MODEL,'x',0,at('2026-12-01'))
        self.assertEqual(len(ledger.summary()),3)

    def test_utf8_output_bounds_and_no_payload_storage(self):
        debit=Ledger(self.path).debit('id','answer',ANSWER_MODEL,'PRIVATE 🔒',512)
        self.assertGreater(debit,512*1.6)
        with sqlite3.connect(self.path) as db: rows=str(db.execute('SELECT * FROM debits').fetchall())
        self.assertNotIn('PRIVATE',rows)

class TransportTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        api.active_requests = 0

    async def test_budget_failure_prevents_dispatch(self):
        from implementation import answer
        ledger=Mock()
        ledger.debit.side_effect=ProtectionError('budget_exhausted')
        with patch.object(answer,'get_vectorstore',return_value=Mock()),patch.object(answer,'get_embeddings') as embedding:
            with self.assertRaises(ProtectionError):
                _=[part async for part in answer.stream_answer('Question',reserve=budget_guard(ledger,'id'))]
            embedding.assert_not_called()

    async def test_startup_prewarms_existing_tokenizer_without_model_requests(self):
        with patch.object(api, 'settings', replace(api.settings, production=True)), patch.object(api, 'get_tokenizer') as tokenizer, patch.object(api, 'ready', new_callable=AsyncMock), patch.object(api, 'close_providers', new_callable=AsyncMock) as close, patch.object(api, 'stream_answer') as stream:
            async with api.lifespan(api.app):
                tokenizer.assert_called_once()
                stream.assert_not_called()
            close.assert_awaited_once()

    async def test_body_timeout_releases_capacity(self):
        scope={'type':'http','path':'/api/chat','method':'POST','headers':[(b'content-type',b'application/json')]}
        messages=[]
        async def slow(): await asyncio.sleep(1)
        async def send(message): messages.append(message)
        with patch.object(api,'BODY_DEADLINE',.01): await api.LocalRequests(Mock())(scope,slow,send)
        self.assertEqual(messages[0]['status'],408)
        self.assertEqual(api.active_requests,0)

    async def test_early_disconnect_releases_capacity(self):
        scope={'type':'http','path':'/api/chat','method':'POST','headers':[(b'content-type',b'application/json')]}
        async def receive(): return {'type':'http.disconnect'}
        async def send(_): self.fail('Disconnected request must not send')
        application=Mock()
        await api.LocalRequests(application)(scope,receive,send)
        application.assert_not_called()
        self.assertEqual(api.active_requests,0)

class SettingsAndApiTests(unittest.TestCase):
    def test_production_settings_are_explicit(self):
        environment={'APP_ENV':'production','OPENAI_API_KEY':'offline','ALLOWED_HOSTS':'rag-api.favourututu.com,127.0.0.1',
                     'ALLOWED_ORIGINS':'https://www.favourututu.com,https://favourututu.com', 'CHAT_IDENTITY_SECRET':'x'*32}
        with patch.dict(os.environ,environment,clear=True):
            settings=Settings.from_env()
            self.assertFalse(settings.chat_enabled)
            self.assertEqual(settings.data_dir,Path('/data'))
            for key,value in [('ALLOWED_HOSTS','*'),('ALLOWED_ORIGINS','https://*.example.com'),('CHAT_DAILY_MICRO_USD','2000000'),('OPENAI_API_KEY','')]:
                with patch.dict(os.environ,{key:value}):
                    with self.assertRaises(ValueError): Settings.from_env()

    def test_preflight_denials_and_health_never_call_providers(self):
        client=TestClient(api.app,base_url='http://localhost')
        self.addCleanup(client.close)
        origin='http://localhost:5173'
        with patch.object(api,'stream_answer') as stream:
            response=client.options('/api/chat',headers={'Origin':origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'})
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.headers['access-control-allow-origin'],origin)
            self.assertEqual(response.headers['access-control-allow-credentials'],'true')
            with patch.object(api,'settings',replace(api.settings,production=True,chat_enabled=False)):
                response=client.post('/api/chat',json={'question':'Hello'},headers={'Origin':origin})
            self.assertEqual(response.status_code,503)
            self.assertIn('x-request-id',response.headers)
            self.assertEqual(response.headers['access-control-allow-origin'],origin)
            with tempfile.TemporaryDirectory() as folder:
                with patch.object(api,'settings',replace(api.settings,production=True,chat_enabled=True)),patch.object(api,'ledger',Ledger(Path(folder)/'missing')),patch.object(api,'get_vectorstore') as store:
                    self.assertEqual(client.get('/health/live').status_code,200)
                    self.assertEqual(client.get('/health/ready').status_code,503)
                    self.assertEqual(client.post('/api/chat',json={'question':'Hello'}).status_code,503)
                    store.assert_not_called()
            stream.assert_not_called()


class ProductionApiTests(unittest.TestCase):
    def setUp(self):
        api.active_requests = 0

    def test_global_quota_after_individual_checks_precedes_body_validation_and_cannot_reach_chroma_routes(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"ledger"
            initialize(path)
            ledger=Ledger(path)
            client=TestClient(api.app,base_url="http://localhost",client=("10.0.0.1",50000))
            try:
                with patch.object(api,"settings",replace(api.settings,production=True,chat_enabled=True,trusted_proxy_cidrs=("10.0.0.1/32",))), patch.object(api,"ledger",ledger), patch.object(api,"get_vectorstore",return_value=Mock()), patch.object(api,"stream_answer") as stream:
                    for index in range(30):
                        client.cookies.clear()
                        self.assertEqual(client.post("/api/chat",json={"question":""},headers={"X-Forwarded-For":f"192.0.2.{index+1}"}).status_code,422)
                    response=client.post("/api/chat",json={"question":"Private question"},headers={"X-Forwarded-For":"198.51.100.1"})
                    self.assertEqual(response.status_code,429)
                    self.assertEqual(response.json()["code"],"rate_limited")
                    self.assertIn("retry-after",response.headers)
                    for endpoint in ("/api/v2/tenants/default_tenant/databases/default_database/collections", "/ingest", "/vector_db/chroma.sqlite3", "/evaluation"):
                        self.assertEqual(client.post(endpoint,json={}).status_code,404)
                    stream.assert_not_called()
            finally:
                client.close()
                api.active_requests=0

    def test_budget_denial_inside_stream_is_safe_and_releases_capacity(self):
        async def generate(question, history, *, reserve, request_id, **_options):
            await reserve("answer", ANSWER_MODEL, "Private material", 512)
            yield "Should not be emitted"
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"ledger"
            initialize(path)
            client=TestClient(api.app,base_url="http://localhost",client=("10.0.0.1",50000))
            try:
                with patch.object(api,"settings",replace(api.settings,production=True,chat_enabled=True)), patch.object(api,"ledger",Ledger(path,1,1)), patch.object(api,"get_vectorstore",return_value=Mock()), patch.object(api,"stream_answer",generate):
                    response=client.post("/api/chat",json={"question":"Private question"})
                    self.assertEqual(response.status_code,200)
                    self.assertIn('"code": "budget_exhausted"',response.text)
                    self.assertNotIn("Private",response.text)
                    self.assertNotIn("Should not",response.text)
                    self.assertEqual(api.active_requests,0)
            finally:
                client.close()

    def test_changed_fingerprint_is_not_ready_and_does_not_query(self):
        from implementation import answer, config
        store=Mock()
        store._collection.metadata={"embedding_model":config.EMBEDDING_MODEL,"corpus_fingerprint":"stale"}
        store.get.return_value={"ids":["one"]}
        answer.get_vectorstore.cache_clear()
        try:
            with patch.object(answer,"PRODUCTION",True), patch.object(answer.Path,"is_file",return_value=True), patch.object(answer,"get_embeddings",return_value=Mock()),patch.object(answer,"Chroma",return_value=store):
                with self.assertRaises(answer.IndexNotReadyError): answer.get_vectorstore()
                store.similarity_search_by_vector.assert_not_called()
        finally:
            answer.get_vectorstore.cache_clear()
