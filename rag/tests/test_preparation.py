"""No provider calls: protect database preparation before streams exist."""
import asyncio
import json
import time
from dataclasses import replace
import unittest
from unittest.mock import Mock, patch
from starlette.requests import Request

import api
from implementation.identity import COOKIE_NAME, visitor_identity

SECRET = 'offline-secret-for-preparation-tests-only'


def scope(index=0, *, same_ip=False):
    cookie = visitor_identity(None, SECRET)[1]
    return {'type': 'http', 'path': '/api/chat', 'method': 'POST',
            'client': ('192.0.2.1' if same_ip else f'192.0.2.{index+1}', 50000),
            'headers': [(b'content-type', b'application/json'),
                        (b'cookie', f'{COOKIE_NAME}={cookie}'.encode())]}


async def receive():
    return {'type': 'http.request', 'body': b'{}', 'more_body': False}


async def application(_scope, _receive, send):
    await send({'type': 'http.response.start', 'status': 200, 'headers': []})
    await send({'type': 'http.response.body', 'body': b'{}'})


class PreparationTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        api.active_requests = 0
        api.active_visitors.clear()
        api.active_ips.clear()
        api.readiness_running = False
        self.settings = replace(api.settings, production=True, chat_enabled=True, identity_secret=SECRET)

    async def test_ip_and_global_caps_apply_before_database_work_without_extra_probes(self):
        for same_ip, expected in ((True, 2), (False, 5)):
            with self.subTest(same_ip=same_ip):
                entered, release = asyncio.Queue(), asyncio.Event()
                class SlowLedger:
                    async def aadmit(self, **kwargs):
                        await entered.put(True)
                        await release.wait()
                    async def aprobe(self):
                        raise AssertionError('Chat must not open a readiness connection')
                messages = []
                async def send(message): messages.append(message)
                with patch.object(api, 'settings', self.settings), patch.object(api, 'ledger', SlowLedger()), \
                     patch.object(api, 'get_vectorstore'), patch.object(api, 'ready', side_effect=AssertionError('Per-chat readiness')):
                    tasks = [asyncio.create_task(api.LocalRequests(application)(scope(i, same_ip=same_ip), receive, send)) for i in range(12)]
                    try:
                        for _ in range(expected): await asyncio.wait_for(entered.get(), 1)
                        self.assertTrue(entered.empty())
                        self.assertEqual(api.active_requests, expected)
                        self.assertEqual(sum(message.get('status') == 429 for message in messages), 12-expected)
                    finally:
                        release.set()
                        await asyncio.gather(*tasks)
                self.assertEqual(api.active_requests, 0)
                self.assertFalse(api.active_ips)
                self.assertFalse(api.active_visitors)

    async def test_preparation_and_total_deadlines_cancel_admission_before_dispatch(self):
        for preparation, total in ((.02, 90), (8, .02)):
            with self.subTest(preparation=preparation, total=total):
                closed = asyncio.Event()
                class SlowLedger:
                    async def aadmit(self, **kwargs):
                        try: await asyncio.Event().wait()
                        finally: closed.set()
                messages, app = [], Mock()
                async def send(message): messages.append(message)
                with patch.object(api, 'settings', self.settings), patch.object(api, 'ledger', SlowLedger()), \
                     patch.object(api, 'get_vectorstore'), patch.object(api, 'PREPARATION_DEADLINE', preparation), \
                     patch.object(api, 'REQUEST_DEADLINE', total):
                    await asyncio.wait_for(api.LocalRequests(app)(scope(), receive, send), 1)
                self.assertEqual(messages[0]['status'], 503)
                self.assertTrue(closed.is_set())
                self.assertEqual(api.active_requests, 0)
                self.assertFalse(api.active_ips)
                app.assert_not_called()

    async def test_client_cancellation_retains_capacity_until_database_cleanup_finishes(self):
        entered, closing, finish_close = asyncio.Event(), asyncio.Event(), asyncio.Event()
        class SlowLedger:
            async def aadmit(self, **kwargs):
                entered.set()
                try: await asyncio.Event().wait()
                finally:
                    closing.set()
                    await finish_close.wait()
        async def send(_): pass
        with patch.object(api, 'settings', self.settings), patch.object(api, 'ledger', SlowLedger()), patch.object(api, 'get_vectorstore'):
            task = asyncio.create_task(api.LocalRequests(application)(scope(), receive, send))
            await asyncio.wait_for(entered.wait(), 1)
            task.cancel()
            try:
                await asyncio.wait_for(closing.wait(), 1)
                self.assertEqual(api.active_requests, 1)
            finally:
                finish_close.set()
                with self.assertRaises(asyncio.CancelledError): await task
        self.assertEqual(api.active_requests, 0)
        self.assertFalse(api.active_ips)

    async def test_readiness_is_single_flight_and_times_out_without_leaking_the_guard(self):
        entered, closed = asyncio.Event(), asyncio.Event()
        class SlowLedger:
            async def aprobe(self):
                entered.set()
                try: await asyncio.Event().wait()
                finally: closed.set()
        with patch.object(api, 'settings', self.settings), patch.object(api, 'ledger', SlowLedger()), \
             patch.object(api, 'get_vectorstore'), patch.object(api, 'PREPARATION_DEADLINE', .05):
            first = asyncio.create_task(api.ready())
            await entered.wait()
            self.assertEqual(await asyncio.gather(*(api.ready() for _ in range(12))), [False]*12)
            self.assertFalse(await asyncio.wait_for(first, 1))
        self.assertTrue(closed.is_set())
        self.assertFalse(api.readiness_running)

    async def test_time_spent_before_streaming_does_not_start_a_fresh_response_budget(self):
        async def generate(*args, **kwargs):
            await asyncio.Event().wait()
            yield 'Late answer'
        request_scope = {'type':'http', 'method':'POST', 'path':'/api/chat', 'headers':[],
                         'state':{'started_at':time.perf_counter()-11, 'request_id':'expired-fixture'}}
        with patch.object(api,'REQUEST_DEADLINE',10), patch.object(api,'stream_answer',generate):
            response = await api.chat(api.ChatRequest(question='Question'), Request(request_scope))
            async def collect(): return [json.loads(part) async for part in response.body_iterator]
            events = await asyncio.wait_for(collect(),1)
        self.assertEqual([event['type'] for event in events],['error'])
        self.assertEqual(events[0]['code'],'timeout')
