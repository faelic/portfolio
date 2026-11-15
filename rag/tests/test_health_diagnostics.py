"""Safe operator diagnostics: no terminal, provider calls or secret disclosure."""
import io
import json
from contextlib import redirect_stdout
from dataclasses import replace
import unittest
from unittest.mock import AsyncMock, Mock, patch

from fastapi.testclient import TestClient
import api


class HealthDiagnosticsTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(api.app, base_url='http://localhost')
        self.addCleanup(self.client.close)

    def test_both_liveness_paths_work_without_database_index_or_model_access(self):
        with patch.object(api,'settings',replace(api.settings,production=True)), \
             patch.object(api,'ready',side_effect=AssertionError('Database check during liveness')), \
             patch.object(api,'get_vectorstore',side_effect=AssertionError('Index during liveness')), \
             patch.object(api,'stream_answer') as stream:
            for path in ('/health/live','/api/health/live'):
                response = self.client.get(path)
                self.assertEqual(response.status_code,200)
                self.assertEqual(response.json(),{'status':'live'})
                self.assertEqual(response.headers['cache-control'],'no-store')
                self.assertEqual(response.headers['x-portfolio-backend'],api.BACKEND_SOURCE)
            stream.assert_not_called()

    def test_readiness_alias_keeps_the_existing_fail_closed_contract(self):
        with patch.object(api,'ready',new_callable=AsyncMock,return_value=False) as ready:
            for path in ('/health/ready','/api/health/ready'):
                response=self.client.get(path)
                self.assertEqual(response.status_code,503)
                self.assertEqual(response.json(),{'status':'unavailable'})
            self.assertEqual(ready.await_count,2)

    def test_application_marker_is_present_on_route_errors(self):
        for path, status in (('/missing-route',404),('/api/chat',405)):
            response=self.client.get(path)
            self.assertEqual(response.status_code,status)
            self.assertEqual(response.headers['x-portfolio-backend'],api.BACKEND_SOURCE)

    def test_health_logs_use_only_fixed_paths_not_queries_cookies_or_addresses(self):
        with self.assertLogs(api.logger,level='WARNING') as logs:
            self.client.get('/health/live?token=PRIVATE_QUERY',headers={'Cookie':'PRIVATE_COOKIE=value','X-Forwarded-For':'PRIVATE_ADDRESS'})
        output=' '.join(logs.output)
        self.assertIn('path=/health/live status=200',output)
        for private in ('PRIVATE_QUERY','PRIVATE_COOKIE','PRIVATE_ADDRESS'):
            self.assertNotIn(private,output)
        with self.assertNoLogs(api.logger,level='WARNING'):
            self.client.get('/PRIVATE_PATH')


class StartupDiagnosticsTests(unittest.IsolatedAsyncioTestCase):
    async def test_startup_records_health_routes_and_boolean_configuration_only(self):
        output=io.StringIO()
        settings=replace(api.settings,production=True,chat_enabled=False,
                         database_url='postgresql://PRIVATE_USER:PRIVATE_PASSWORD@PRIVATE_HOST/neondb',
                         identity_secret='PRIVATE_SIGNING_SECRET')
        with patch.object(api,'settings',settings), patch.object(api,'get_tokenizer'), \
             patch.object(api,'ready',new_callable=AsyncMock,return_value=False), \
             patch.object(api,'close_providers',new_callable=AsyncMock), \
             patch.object(api,'stream_answer',Mock()) as stream, redirect_stdout(output):
            async with api.lifespan(api.app): pass
        text=output.getvalue()
        self.assertNotIn('PRIVATE',text)
        data=json.loads(text.removeprefix('backend_startup '))
        self.assertTrue(data['production'])
        self.assertFalse(data['chat_enabled'])
        self.assertTrue(data['ledger_configured'])
        self.assertEqual(data['source'],api.BACKEND_SOURCE)
        self.assertEqual(data['health_routes'],['/api/health/live','/api/health/ready','/health/live','/health/ready'])
        stream.assert_not_called()
