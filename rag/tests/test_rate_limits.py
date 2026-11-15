"""Offline fairness, identity, proxy, migration and request-lifecycle regressions."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
import api
from implementation.identity import COOKIE_AGE, COOKIE_NAME, client_ip, digest, visitor_identity
from implementation.protection import Ledger, ProtectionError, initialize
from implementation.settings import Settings

SECRET = 'offline-secret-value-for-tests-only-0000'


class QuotaTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / 'ledger'
        initialize(self.path)
        self.ledger = Ledger(self.path)

    def rejected(self, code, **kwargs):
        with self.assertRaises(ProtectionError) as result:
            self.ledger.admit(**kwargs)
        self.assertEqual(result.exception.code, code)
        return result.exception.retry_after

    def test_visitor_window_boundary_and_rejection_does_not_charge_global(self):
        for _ in range(3):
            self.ledger.admit(now=1000, visitor='alice', ip='network')
        self.assertEqual(self.rejected('visitor_rate_limited', now=1059, visitor='alice', ip='network'), 1)
        with sqlite3.connect(self.path) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM admissions').fetchone()[0], 3)
        self.ledger.admit(now=1059, visitor='bob', ip='network')
        self.ledger.admit(now=1060, visitor='alice', ip='network')

    def test_ip_window_is_shared_across_visitors_and_atomic(self):
        def admit(index):
            try:
                self.ledger.admit(now=1000, visitor=f'visitor-{index}', ip='shared')
                return True
            except ProtectionError:
                return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(admit, range(20))), 6)
        self.assertEqual(self.rejected('ip_rate_limited', now=1059, visitor='fresh', ip='shared'), 1)
        self.ledger.admit(now=1059, visitor='fresh', ip='other')
        self.ledger.admit(now=1060, visitor='fresh', ip='shared')

    def test_visitor_limit_is_atomic(self):
        def admit(_):
            try:
                self.ledger.admit(now=1000, visitor='same', ip='same')
                return True
            except ProtectionError:
                return False
        with ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(admit, range(12))), 3)

    def test_24_hour_window_persists_and_is_not_midnight_reset(self):
        for index in range(20):
            self.ledger.admit(now=1000 + index * 61, visitor=f'v{index}', ip='same')
        self.ledger = Ledger(self.path)
        self.assertEqual(self.rejected('ip_daily_limited', now=87399, visitor='new', ip='same'), 1)
        self.ledger.admit(now=87400, visitor='new', ip='same')
        self.assertEqual(self.rejected('ip_daily_limited', now=87400, visitor='other', ip='same'), 61)

    def test_additive_migration_preserves_old_quota_and_spend(self):
        self.ledger.admit(now=1000)
        with sqlite3.connect(self.path) as db:
            db.execute('DROP TABLE client_admissions')
            db.execute("INSERT INTO debits VALUES (1000,'old','answer',99,'old-price')")
        self.ledger.check()
        self.ledger.check()
        with sqlite3.connect(self.path) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM admissions').fetchone()[0], 1)
            self.assertEqual(db.execute('SELECT SUM(micro_usd) FROM debits').fetchone()[0], 99)
        self.ledger.admit(now=1000, visitor='new', ip='new')

    def test_global_limit_remains_shared_and_does_not_charge_denied_clients(self):
        for index in range(30):
            self.ledger.admit(now=1000, visitor=f'v{index}', ip=f'ip{index}')
        self.rejected('rate_limited', now=1000, visitor='new', ip='new')
        with sqlite3.connect(self.path) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM client_admissions').fetchone()[0], 30)


class IdentityTests(unittest.TestCase):
    def test_signed_cookie_survives_reuse_but_not_tampering_expiry_or_key_rotation(self):
        visitor, cookie = visitor_identity(None, SECRET, now=1000)
        self.assertEqual(visitor_identity(cookie, SECRET, now=1050), (visitor, None))
        for value, key, now in ((cookie[:-1]+'x', SECRET, 1050), (cookie, SECRET, 999),
                                (cookie, SECRET, 1000+COOKIE_AGE), (cookie, SECRET+'new', 1050),
                                ('x'*10000, SECRET, 1050)):
            identity, replacement = visitor_identity(value, key, now=now)
            self.assertNotEqual(identity, visitor)
            self.assertIsNotNone(replacement)
        self.assertNotEqual(digest(SECRET, 'ip', 'value'), digest(SECRET, 'visitor', 'value'))

    def test_untrusted_forwarding_is_ignored_and_trusted_chain_walks_from_right(self):
        scope = {'client': ('198.51.100.1', 1234), 'headers': [(b'x-forwarded-for', b'192.0.2.1')]}
        self.assertEqual(client_ip(scope, ()), '198.51.100.1')
        scope['client'] = ('10.0.0.1', 1234)
        scope['headers'] = [(b'x-forwarded-for', b'203.0.113.200, 192.0.2.1, 10.0.0.2')]
        self.assertEqual(client_ip(scope, ('10.0.0.0/24',)), '192.0.2.1')
        scope['headers'] = [(b'x-forwarded-for', b'203.0.113.200'), (b'x-forwarded-for', b'192.0.2.1')]
        self.assertEqual(client_ip(scope, ('10.0.0.0/24',)), '192.0.2.1')
        for headers in ([], [(b'x-forwarded-for', b'unknown')], [(b'x-forwarded-for', b'10.0.0.2')]):
            scope['headers'] = headers
            with self.assertRaises(ProtectionError): client_ip(scope, ('10.0.0.0/24',))
        self.assertEqual(client_ip({'client': ('::ffff:192.0.2.1', 1), 'headers': []}, ()), '192.0.2.1')
        self.assertEqual(client_ip({'client': ('2001:0db8::1', 1), 'headers': []}, ()), '2001:db8::1')

    def test_production_requires_secret_and_disallows_trusting_every_proxy(self):
        environment = {'APP_ENV': 'production', 'OPENAI_API_KEY': 'offline',
                       'ALLOWED_HOSTS': 'localhost', 'ALLOWED_ORIGINS': 'https://localhost'}
        with patch.dict(os.environ, environment, clear=True):
            with self.assertRaises(ValueError): Settings.from_env()
            with patch.dict(os.environ, {'CHAT_IDENTITY_SECRET': SECRET}):
                self.assertEqual(Settings.from_env().trusted_proxy_cidrs, ())
                for value in ('*', '0.0.0.0/0', '::/0', 'bad'):
                    with patch.dict(os.environ, {'TRUSTED_PROXY_CIDRS': value}):
                        with self.assertRaises(ValueError): Settings.from_env()


class ProductionFairnessTests(unittest.TestCase):
    def setUp(self):
        api.active_requests = 0
        api.active_visitors.clear()
        api.active_ips.clear()
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.path = Path(self.folder.name) / 'ledger'
        initialize(self.path)
        self.ledger = Ledger(self.path)
        self.settings = replace(api.settings, production=True, chat_enabled=True, identity_secret=SECRET)
        self.client = TestClient(api.app, base_url='https://localhost', client=('192.0.2.1', 50000))
        self.addCleanup(self.client.close)

    def test_cookie_limits_safe_messages_and_other_visitors_keep_their_allowance(self):
        with patch.object(api, 'settings', self.settings), patch.object(api, 'ledger', self.ledger), \
             patch.object(api, 'ready', new_callable=AsyncMock, return_value=True), patch.object(api, 'stream_answer') as stream:
            origin = {'Origin': 'http://localhost:5173'}
            for _ in range(3):
                response = self.client.post('/api/chat', json={'question': ''}, headers=origin)
                self.assertEqual(response.status_code, 422)
            cookie = self.client.cookies.get(COOKIE_NAME)
            self.assertIsNotNone(cookie)
            denied = self.client.post('/api/chat', json={'question': 'private'}, headers=origin)
            self.assertEqual(denied.status_code, 429)
            self.assertEqual(denied.json()['code'], 'visitor_rate_limited')
            self.assertGreater(int(denied.headers['Retry-After']), 0)
            self.assertEqual(denied.headers['Access-Control-Allow-Credentials'], 'true')
            self.assertNotIn('private', denied.text)
            self.client.cookies.clear()
            for _ in range(3):
                self.assertEqual(self.client.post('/api/chat', json={'question': ''}).status_code, 422)
            self.client.cookies.clear()
            response = self.client.post('/api/chat', json={'question': ''}, headers={'X-Forwarded-For': '203.0.113.99'})
            self.assertEqual(response.json()['code'], 'ip_rate_limited')
            self.assertIn('HttpOnly', response.headers['set-cookie'])
            self.assertIn('Secure', response.headers['set-cookie'])
            self.assertIn('SameSite=None', response.headers['set-cookie'])
            self.assertEqual(api.active_requests, 0)
            self.assertFalse(api.active_visitors)
            stream.assert_not_called()
        with sqlite3.connect(self.path) as db:
            data = str(db.execute('SELECT * FROM client_admissions').fetchall())
            self.assertEqual(db.execute('SELECT COUNT(*) FROM admissions').fetchone()[0], 6)
        self.assertNotIn('192.0.2.1', data)
        self.assertNotIn(cookie, data)


class ConcurrentVisitorTests(unittest.IsolatedAsyncioTestCase):
    async def test_one_per_visitor_five_total_and_cancelled_slots_are_released(self):
        api.active_requests = 0
        api.active_visitors.clear()
        api.active_ips.clear()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'ledger'
            initialize(path)
            entered = asyncio.Queue()
            release = asyncio.Event()
            async def application(scope, receive, send):
                await receive()
                await entered.put(True)
                await release.wait()
            async def receive(): return {'type': 'http.request', 'body': b'{}', 'more_body': False}
            async def send(_): pass
            middleware = api.LocalRequests(application)
            cookies = [visitor_identity(None, SECRET)[1] for _ in range(6)]
            def scope(index):
                return {'type': 'http', 'path': '/api/chat', 'method': 'POST',
                        'client': (f'192.0.2.{index+1}', 1234), 'headers': [
                            (b'content-type', b'application/json'),
                            (b'cookie', f'{COOKIE_NAME}={cookies[index]}'.encode())]}
            tasks = []
            with patch.object(api, 'settings', replace(api.settings, production=True, chat_enabled=True, identity_secret=SECRET)), \
                 patch.object(api, 'ledger', Ledger(path)), patch.object(api, 'ready', new_callable=AsyncMock, return_value=True):
                try:
                    tasks.append(asyncio.create_task(middleware(scope(0), receive, send)))
                    await asyncio.wait_for(entered.get(), 2)
                    messages = []
                    async def collect(message): messages.append(message)
                    await middleware(scope(0), receive, collect)
                    self.assertEqual(messages[0]['status'], 429)
                    self.assertIn(b'visitor_busy', messages[1]['body'])
                    for index in range(1, 5):
                        tasks.append(asyncio.create_task(middleware(scope(index), receive, send)))
                        await asyncio.wait_for(entered.get(), 2)
                    self.assertEqual(api.active_requests, 5)
                    messages.clear()
                    await middleware(scope(5), receive, collect)
                    self.assertEqual(messages[0]['status'], 429)
                    self.assertIn(b'"busy"', messages[1]['body'])
                    tasks[0].cancel()
                    with self.assertRaises(asyncio.CancelledError): await tasks[0]
                    tasks.append(asyncio.create_task(middleware(scope(0), receive, send)))
                    await asyncio.wait_for(entered.get(), 2)
                finally:
                    release.set()
                    await asyncio.gather(*tasks, return_exceptions=True)
            self.assertEqual(api.active_requests, 0)
            self.assertFalse(api.active_visitors)
            self.assertFalse(api.active_ips)

    async def test_fresh_cookies_cannot_take_all_slots_from_one_ip_and_cancellation_recovers(self):
        api.active_requests = 0
        api.active_visitors.clear()
        api.active_ips.clear()
        entered, release = asyncio.Queue(), asyncio.Event()
        async def application(scope, receive, send):
            await receive()
            await entered.put(True)
            await release.wait()
        async def receive(): return {'type': 'http.request', 'body': b'{}', 'more_body': False}
        async def send(_): pass
        def scope():
            cookie = visitor_identity(None, SECRET)[1]
            return {'type':'http', 'path':'/api/chat', 'method':'POST', 'client':('192.0.2.1',1234),
                    'headers':[(b'content-type',b'application/json'),(b'cookie',f'{COOKIE_NAME}={cookie}'.encode())]}
        middleware, tasks = api.LocalRequests(application), []
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'ledger'
            initialize(path)
            with patch.object(api, 'settings', replace(api.settings, production=True, chat_enabled=True, identity_secret=SECRET)), \
                 patch.object(api, 'ledger', Ledger(path)), patch.object(api, 'ready', new_callable=AsyncMock, return_value=True):
                try:
                    for _ in range(2):
                        tasks.append(asyncio.create_task(middleware(scope(), receive, send)))
                        await asyncio.wait_for(entered.get(),2)
                    messages = []
                    async def collect(message): messages.append(message)
                    with self.assertLogs(api.logger,level='INFO') as logs:
                        await middleware(scope(),receive,collect)
                    self.assertEqual(messages[0]['status'],429)
                    self.assertIn(b'ip_busy',messages[1]['body'])
                    self.assertIn('code=ip_busy',' '.join(logs.output))
                    self.assertNotIn('192.0.2.1',' '.join(logs.output))
                    with sqlite3.connect(path) as db:
                        self.assertEqual(db.execute('SELECT COUNT(*) FROM admissions').fetchone()[0],2)
                    tasks[0].cancel()
                    with self.assertRaises(asyncio.CancelledError): await tasks[0]
                    tasks.append(asyncio.create_task(middleware(scope(),receive,send)))
                    await asyncio.wait_for(entered.get(),2)
                    self.assertEqual(api.active_requests,2)
                finally:
                    release.set()
                    await asyncio.gather(*tasks,return_exceptions=True)
        self.assertEqual(api.active_requests,0)
        self.assertFalse(api.active_ips)

    async def test_readiness_is_read_only_and_startup_integrity_check_is_not_per_request(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'ledger'
            initialize(path)
            ledger = Ledger(path)
            with patch.object(api,'settings',replace(api.settings,production=True)), \
                 patch.object(api,'ledger',ledger), patch.object(api,'get_vectorstore'), \
                 patch.object(ledger,'check',side_effect=AssertionError('Integrity check repeated')):
                self.assertTrue(await api.ready())
                self.assertTrue(await api.ready())
            with sqlite3.connect(path) as db:
                db.execute('DROP TABLE client_admissions')
            with self.assertRaises(ProtectionError): ledger.probe()
            ledger.check()
            ledger.probe()
