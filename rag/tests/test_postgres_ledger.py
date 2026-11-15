"""Real PostgreSQL regressions. Only run against the disposable test database."""
import os
import asyncio
from pathlib import Path
import unittest
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from unittest.mock import patch, Mock, AsyncMock

import psycopg
from psycopg.conninfo import conninfo_to_dict

from implementation.config import ANSWER_MODEL, EMBEDDING_MODEL
from implementation.postgres_ledger import PostgresLedger, initialize_postgres
from implementation.protection import ProtectionError, create_ledger, call_ledger
from implementation.settings import Settings

TEST_URL = os.getenv('LEDGER_TEST_DATABASE_URL', '')


class DatabaseSettingsTests(unittest.TestCase):
    def test_timeout_before_server_settings_cancels_and_closes_the_connection(self):
        from implementation import postgres_ledger, protection
        async def stall(*args, **kwargs): await asyncio.Event().wait()
        connection = Mock(execute=AsyncMock(side_effect=stall), close=AsyncMock())
        async def run():
            with patch.object(postgres_ledger.psycopg.AsyncConnection, 'connect', return_value=connection), patch.object(protection, 'LEDGER_DEADLINE', .02):
                with self.assertRaises(ProtectionError):
                    await call_ledger(PostgresLedger('postgresql://db.example/ledger'), 'probe')
            connection.close.assert_awaited_once()
        asyncio.run(run())

    def test_connections_supply_a_real_ca_bundle_and_disable_prepared_statements(self):
        from implementation import postgres_ledger
        from pathlib import Path
        with patch.object(postgres_ledger.psycopg, 'connect') as connect:
            postgres_ledger.connect('postgresql://db.example/ledger?sslmode=verify-full')
            self.assertTrue(Path(connect.call_args.kwargs['sslrootcert']).is_file())
            self.assertIsNone(connect.call_args.kwargs['prepare_threshold'])
            self.assertEqual(connect.call_args.kwargs['connect_timeout'], 5)

    def test_production_never_falls_back_to_local_sqlite(self):
        ledger = create_ledger(replace(Settings(), production=True))
        for method, args in ((ledger.check, ()), (ledger.probe, ()), (ledger.admit, ()),
                             (ledger.debit, ('id', 'answer', ANSWER_MODEL, 'x', 0))):
            with self.assertRaises(ProtectionError): method(*args)

    def test_database_url_is_hidden_and_production_requires_verified_tls(self):
        environment = {'APP_ENV': 'production', 'OPENAI_API_KEY': 'offline',
                       'ALLOWED_HOSTS': 'localhost', 'ALLOWED_ORIGINS': 'https://www.favourututu.com',
                       'CHAT_IDENTITY_SECRET': 'x'*32}
        for sslmode in ('disable', 'prefer', 'require', ''):
            with patch.dict(os.environ, {**environment, 'DATABASE_URL': f'postgresql://user:private@db.example/ledger?sslmode={sslmode}'}, clear=True):
                with self.assertRaises(ValueError): Settings.from_env()
        with patch.dict(os.environ, {**environment, 'DATABASE_URL': 'postgresql://user:private@db.example/ledger?sslmode=verify-full'}, clear=True):
            settings = Settings.from_env()
            self.assertNotIn('private', repr(settings))
            self.assertIsInstance(create_ledger(settings), PostgresLedger)

    def test_connection_errors_are_redacted_and_fail_closed(self):
        ledger = PostgresLedger('postgresql://secret:password@db.example/db')
        with patch('implementation.postgres_ledger.connect', side_effect=psycopg.OperationalError('secret password')):
            with self.assertLogs('implementation.protection', level='WARNING') as logs:
                with self.assertRaises(ProtectionError) as error: ledger.admit()
            self.assertNotIn('password', ''.join(logs.output)+str(error.exception))
            with self.assertRaises(ProtectionError): ledger.probe()


@unittest.skipUnless(TEST_URL, 'Set LEDGER_TEST_DATABASE_URL for disposable PostgreSQL integration tests')
class PostgresLedgerTests(unittest.TestCase):
    def setUp(self):
        info = conninfo_to_dict(TEST_URL)
        if info.get('dbname') != 'portfolio_ledger_test' or info.get('host') not in ('localhost', '127.0.0.1'):
            self.fail('Refusing destructive test setup outside localhost/portfolio_ledger_test')
        with psycopg.connect(TEST_URL, autocommit=True) as db:
            db.execute('DROP SCHEMA IF EXISTS portfolio_rag CASCADE')
        initialize_postgres(TEST_URL)
        self.ledger = PostgresLedger(TEST_URL)

    def successful(self, call, count):
        def run(index):
            try:
                call(index)
                return True
            except ProtectionError as exc:
                if exc.code == 'unavailable': raise
                return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            return sum(pool.map(run, range(count)))

    def test_concurrent_global_limit_survives_new_connections_and_reinit_refuses(self):
        self.assertEqual(self.successful(lambda _: PostgresLedger(TEST_URL).admit(now=1000), 45), 30)
        with self.assertRaises(FileExistsError): initialize_postgres(TEST_URL)
        with self.assertRaises(ProtectionError) as error: PostgresLedger(TEST_URL).admit(now=1059)
        self.assertEqual((error.exception.code, error.exception.retry_after), ('rate_limited', 1))
        self.ledger.admit(now=1060)

    def test_concurrent_ip_and_visitor_windows(self):
        self.assertEqual(self.successful(lambda i: self.ledger.admit(now=1000, visitor=f'v{i}', ip='same'), 15), 6)
        self.assertEqual(self.successful(lambda _: self.ledger.admit(now=1060, visitor='same', ip='other'), 10), 3)

    def test_rolling_day_and_denial_rollback(self):
        for i in range(20): self.ledger.admit(now=1000+i*61, visitor=f'v{i}', ip='same')
        with self.assertRaises(ProtectionError) as error:
            self.ledger.admit(now=87399, visitor='new', ip='same')
        self.assertEqual((error.exception.code, error.exception.retry_after), ('ip_daily_limited', 1))
        with self.ledger.transaction() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM client_admissions').fetchone()[0], 20)
        PostgresLedger(TEST_URL).admit(now=87400, visitor='new', ip='same')

    def test_concurrent_spend_reservations_do_not_overshoot(self):
        def debit(_): PostgresLedger(TEST_URL, 104, 104).debit('id', 'answer', ANSWER_MODEL, 'x', 0, now=1000)
        self.assertEqual(self.successful(debit, 20), 2)
        self.assertEqual(PostgresLedger(TEST_URL).summary(), [('1970-01-01', 104, 2)])
        self.ledger.probe()
        with self.ledger.transaction() as db:
            self.assertEqual(db.execute('SELECT SUM(micro_usd) FROM debits').fetchone()[0], 104)

    def test_utc_budget_rollover_and_unpriced_work(self):
        ledger = PostgresLedger(TEST_URL, 1, 2)
        ledger.debit('first', 'embedding', EMBEDDING_MODEL, 'x', 0, now=1000)
        with self.assertRaises(ProtectionError): ledger.debit('same-day', 'embedding', EMBEDDING_MODEL, 'x', 0, now=1001)
        ledger.debit('next-day', 'embedding', EMBEDDING_MODEL, 'x', 0, now=87400)
        with self.assertRaises(ProtectionError): ledger.debit('month-limit', 'embedding', EMBEDDING_MODEL, 'x', 0, now=173800)
        ledger.debit('new-month', 'embedding', EMBEDDING_MODEL, 'x', 0, now=2678400)
        with self.assertRaises(ProtectionError): ledger.debit('unknown', 'answer', 'unpriced', 'x', 0)

    def test_missing_schema_and_metadata_fail_closed_without_recreating(self):
        with psycopg.connect(TEST_URL) as db:
            db.execute('DELETE FROM portfolio_rag.metadata')
        for method in (self.ledger.probe, self.ledger.admit):
            with self.assertRaises(ProtectionError): method()
        with psycopg.connect(TEST_URL) as db:
            db.execute('DROP SCHEMA portfolio_rag CASCADE')
        with self.assertRaises(ProtectionError): self.ledger.check()
        with psycopg.connect(TEST_URL) as db:
            self.assertIsNone(db.execute("SELECT to_regclass('portfolio_rag.metadata')").fetchone()[0])

    def test_timeout_is_bounded_and_probes_do_not_wait_for_writer_lock(self):
        with psycopg.connect(TEST_URL) as blocking:
            blocking.execute('SELECT * FROM portfolio_rag.metadata FOR UPDATE')
            self.ledger.probe()  # Readiness does not acquire FOR UPDATE.
            with self.assertRaises(ProtectionError): self.ledger.admit(now=1000)
        self.ledger.admit(now=1000)

    def test_runtime_role_can_enforce_limits_without_schema_ownership(self):
        # Test role is a database-local, no-login permission boundary. Remove it
        # after the transaction, rather than relying on Neon admin privileges.
        with psycopg.connect(TEST_URL, autocommit=True) as db:
            db.execute('CREATE ROLE portfolio_rag_test_runtime NOLOGIN')
        try:
            with psycopg.connect(TEST_URL) as db:
                # Simulate the earlier overly broad grant, then apply the actual
                # owner repair script so this test covers existing deployments.
                db.execute('GRANT SELECT,INSERT,DELETE ON portfolio_rag.admissions,portfolio_rag.client_admissions,portfolio_rag.debits TO portfolio_rag_test_runtime')
                grants = (Path(__file__).resolve().parents[1]/'implementation/ledger_runtime_grants.sql').read_text()
                db.execute(grants.replace('portfolio_rag_runtime', 'portfolio_rag_test_runtime').replace('BEGIN;\n', '').replace('COMMIT;\n', ''))
            from implementation import postgres_ledger
            original = postgres_ledger.connect
            def restricted(url):
                connection = original(url)
                connection.autocommit = True
                connection.execute('SET ROLE portfolio_rag_test_runtime')
                connection.autocommit = False
                return connection
            with patch.object(postgres_ledger, 'connect', restricted):
                self.ledger.probe()
                self.ledger.admit(now=1000, visitor='test', ip='test')
                self.ledger.debit('test', 'embedding', EMBEDDING_MODEL, 'x', 0, now=1000)
                self.assertEqual(self.ledger.summary(), [('1970-01-01', 1, 1)])
                with self.assertRaises(ProtectionError):
                    with self.ledger.transaction() as db: db.execute('TRUNCATE debits')
                with self.assertRaises(ProtectionError):
                    with self.ledger.transaction() as db: db.execute('DELETE FROM debits')
                with self.assertRaises(ProtectionError):
                    with self.ledger.transaction() as db: db.execute('UPDATE debits SET micro_usd=1')
                self.assertEqual(self.ledger.summary(), [('1970-01-01', 1, 1)])
            original_async = postgres_ledger.psycopg.AsyncConnection.connect
            async def restricted_async(*args, **kwargs):
                connection = await original_async(*args, **kwargs)
                await connection.set_autocommit(True)
                await connection.execute('SET ROLE portfolio_rag_test_runtime')
                await connection.set_autocommit(False)
                return connection
            async def run_restricted():
                with patch.object(postgres_ledger.psycopg.AsyncConnection, 'connect', side_effect=restricted_async):
                    await self.ledger.aprobe()
                    await self.ledger.aadmit(now=1060, visitor='async', ip='async')
                    await self.ledger.adebit('async','embedding',EMBEDDING_MODEL,'x',0,now=1000)
                    with self.assertRaises(ProtectionError):
                        async with self.ledger.atransaction() as db: await db.execute('DELETE FROM debits')
            asyncio.run(run_restricted())
            self.assertEqual(self.ledger.summary(), [('1970-01-01', 2, 2)])
        finally:
            with psycopg.connect(TEST_URL, autocommit=True) as db:
                db.execute('DROP OWNED BY portfolio_rag_test_runtime')
                db.execute('DROP ROLE portfolio_rag_test_runtime')

    def test_async_and_sync_admissions_share_the_same_atomic_global_limit(self):
        async def run():
            async def admit(index):
                try:
                    if index % 2: await self.ledger.aadmit(now=1000)
                    else: await asyncio.to_thread(self.ledger.admit, now=1000)
                    return True
                except ProtectionError as exc:
                    self.assertEqual(exc.code, 'rate_limited')
                    return False
            return sum(await asyncio.gather(*(admit(i) for i in range(40))))
        self.assertEqual(asyncio.run(run()), 30)

    def test_async_spending_and_client_limits_are_atomic_and_persistent(self):
        async def run():
            async def reserve(_):
                try:
                    await call_ledger(PostgresLedger(TEST_URL,104,104), 'debit', 'id', 'answer', ANSWER_MODEL, 'x', 0, now=1000)
                    return True
                except ProtectionError as exc:
                    self.assertEqual(exc.code, 'budget_exhausted')
                    return False
            self.assertEqual(sum(await asyncio.gather(*(reserve(i) for i in range(20)))), 2)
            for i in range(6): await self.ledger.aadmit(now=1000, visitor=f'v{i}', ip='same')
            with self.assertRaises(ProtectionError) as error: await self.ledger.aadmit(now=1000, visitor='new', ip='same')
            self.assertEqual(error.exception.code,'ip_rate_limited')
            for _ in range(3): await self.ledger.aadmit(now=1060, visitor='same', ip='other')
            with self.assertRaises(ProtectionError) as error: await self.ledger.aadmit(now=1060, visitor='same', ip='other')
            self.assertEqual(error.exception.code,'visitor_rate_limited')
        asyncio.run(run())
        self.assertEqual(PostgresLedger(TEST_URL).summary(), [('1970-01-01',104,2)])

    def test_async_timeout_cancels_locked_transaction_and_closes_connection(self):
        from implementation import postgres_ledger
        from implementation import protection
        original = postgres_ledger.psycopg.AsyncConnection.connect
        connections = []
        async def tracked(*args, **kwargs):
            connection = await original(*args, **kwargs)
            connections.append(connection)
            return connection
        async def run():
            with psycopg.connect(TEST_URL) as blocking:
                blocking.execute('SELECT * FROM portfolio_rag.metadata FOR UPDATE')
                with patch.object(postgres_ledger.psycopg.AsyncConnection,'connect',side_effect=tracked), patch.object(protection,'LEDGER_DEADLINE',.1):
                    with self.assertRaises(ProtectionError): await call_ledger(self.ledger,'admit',now=1000)
                self.assertTrue(connections)
                self.assertTrue(all(connection.closed for connection in connections))
            await self.ledger.aadmit(now=1000)
        asyncio.run(run())
        with self.ledger.transaction() as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM admissions').fetchone()[0],1)

    def test_uncertain_async_commit_is_not_retried_or_refunded(self):
        original = psycopg.AsyncConnection.commit
        async def uncertain(connection):
            await original(connection)
            raise psycopg.OperationalError('Simulated lost acknowledgment')
        async def run():
            with patch.object(psycopg.AsyncConnection, 'commit', uncertain):
                with self.assertRaises(ProtectionError):
                    await call_ledger(self.ledger,'debit','uncertain','embedding',EMBEDDING_MODEL,'x',0,now=1000)
        asyncio.run(run())
        self.assertEqual(self.ledger.summary(), [('1970-01-01',1,1)])

    def test_api_database_failure_denies_work_but_keeps_liveness(self):
        import api
        from fastapi.testclient import TestClient
        from implementation import answer
        answer.get_vectorstore.cache_clear()
        try:
            with patch.object(api, 'settings', replace(api.settings, production=True, chat_enabled=True)), \
                 patch.object(api, 'ledger', self.ledger), patch.object(answer, 'INDEX_MODE', 'packaged'), \
                 patch.object(api, 'stream_answer') as stream, \
                 patch.object(answer, 'get_embeddings', side_effect=AssertionError('Provider before validation')):
                with TestClient(api.app, base_url='http://localhost', client=('192.0.2.1', 50000)) as client:
                    self.assertEqual(client.get('/health/ready').status_code, 200)
                    self.assertEqual(client.post('/api/chat', json={'question': ''}).status_code, 422)
                    with psycopg.connect(TEST_URL) as db:
                        self.assertEqual(db.execute('SELECT COUNT(*) FROM portfolio_rag.admissions').fetchone()[0], 1)
                        db.execute('DROP SCHEMA portfolio_rag CASCADE')
                    self.assertEqual(client.get('/health/live').status_code, 200)
                    self.assertEqual(client.get('/health/ready').status_code, 503)
                    self.assertEqual(client.post('/api/chat', json={'question': 'Explain Monierave'}).status_code, 503)
                    stream.assert_not_called()
        finally:
            answer.get_vectorstore.cache_clear()
