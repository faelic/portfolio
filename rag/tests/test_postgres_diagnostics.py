"""Connection diagnostics emit fixed categories, never libpq error contents."""
import asyncio
import unittest
from unittest.mock import AsyncMock, Mock, patch

import psycopg

from implementation import postgres_ledger as pg
from implementation import protection


PRIVATE = 'PRIVATE_USER PRIVATE_PASSWORD PRIVATE_HOST PRIVATE_SQL postgresql://private/details\nFORGED_LOG'


class PostgresDiagnosticsTests(unittest.TestCase):
    def test_sqlstate_categories_take_precedence_over_message_hints(self):
        for code, category in (
            ('28P01', 'authentication'), ('28000', 'authentication'),
            ('3D000', 'database_missing'), ('42501', 'permission_denied'),
            ('42P01', 'schema_missing'), ('42703', 'schema_mismatch'),
            ('53300', 'connection_capacity'), ('57P03', 'server_unavailable'),
            ('57014', 'statement_timeout_or_cancel'), ('55P03', 'lock_timeout'),
        ):
            with self.subTest(code=code):
                exc = psycopg.errors.lookup(code)('connection refused ' + PRIVATE)
                self.assertEqual(pg.failure_category(exc), category)

    def test_libpq_hints_and_unknown_errors_are_redacted(self):
        for hint, category in (
            ('password authentication failed', 'authentication'),
            ('no password supplied', 'authentication'),
            ('could not translate host name', 'dns'),
            ('failed to resolve host', 'dns'),
            ('temporary failure in name resolution', 'dns'),
            ('channel binding required', 'channel_binding'),
            ('SSL error: certificate verify failed', 'tls'),
            ('server certificate does not match host name', 'tls'),
            ('root certificate file does not exist', 'tls'),
            ('connection timeout expired', 'connect_timeout'),
            ('connection refused', 'connection_refused'),
            ('network is unreachable', 'network_unreachable'),
            ('server closed the connection unexpectedly', 'connection_lost'),
            ('unrecognized failure', 'unknown'),
        ):
            with self.subTest(category=category):
                with self.assertLogs(protection.logger, level='WARNING') as logs:
                    pg.log_failure(psycopg.OperationalError(hint + PRIVATE), 'connect')
                self.assertEqual(logs.output, [
                    f'WARNING:implementation.protection:postgres_failed phase=connect category={category}'
                ])

    def test_all_sync_entry_points_fail_closed_with_safe_diagnostics(self):
        ledger = pg.PostgresLedger('postgresql://private/details')
        for call in (ledger.probe, ledger.admit, lambda: pg.initialize_postgres('private')):
            with self.subTest(call=call), patch.object(pg, 'connect', side_effect=psycopg.OperationalError('password authentication failed ' + PRIVATE)):
                with self.assertLogs(protection.logger, level='WARNING') as logs:
                    with self.assertRaises(protection.ProtectionError) as raised:
                        call()
                self.assertEqual(str(raised.exception), 'unavailable')
                self.assertEqual(logs.output, ['WARNING:implementation.protection:postgres_failed phase=connect category=authentication'])


class AsyncPostgresDiagnosticsTests(unittest.IsolatedAsyncioTestCase):
    async def test_async_readiness_connection_failure_is_classified_and_fail_closed(self):
        with patch.object(pg.psycopg.AsyncConnection, 'connect', side_effect=psycopg.OperationalError('could not translate host name ' + PRIVATE)):
            with self.assertLogs(protection.logger, level='WARNING') as logs:
                with self.assertRaises(protection.ProtectionError):
                    await pg.PostgresLedger('private').aprobe()
        self.assertEqual(logs.output, ['WARNING:implementation.protection:postgres_failed phase=connect category=dns'])

    async def test_configure_query_and_commit_failures_record_the_phase_and_close(self):
        for phase in ('configure', 'query', 'commit'):
            failure = psycopg.errors.InsufficientPrivilege(PRIVATE)
            result = Mock(fetchall=AsyncMock(return_value=[(1,)]))
            db = Mock(execute=AsyncMock(return_value=result), commit=AsyncMock(), close=AsyncMock())
            if phase == 'configure':
                db.execute.side_effect = failure
            elif phase == 'query':
                db.execute.side_effect = [None, failure]
            else:
                db.commit.side_effect = failure
            with self.subTest(phase=phase), patch.object(pg.psycopg.AsyncConnection, 'connect', return_value=db):
                with self.assertLogs(protection.logger, level='WARNING') as logs:
                    with self.assertRaises(protection.ProtectionError):
                        async with pg.PostgresLedger('private').atransaction():
                            pass
                self.assertEqual(logs.output, [f'WARNING:implementation.protection:postgres_failed phase={phase} category=permission_denied'])
                db.close.assert_awaited_once()

    async def test_outer_deadline_logs_fixed_label_and_still_cancels_and_closes(self):
        async def stall(*_args, **_kwargs):
            await asyncio.Event().wait()
        db = Mock(execute=AsyncMock(side_effect=stall), close=AsyncMock())
        with patch.object(pg.psycopg.AsyncConnection, 'connect', return_value=db), patch.object(protection, 'LEDGER_DEADLINE', .01):
            with self.assertLogs(protection.logger, level='WARNING') as logs:
                with self.assertRaises(protection.ProtectionError):
                    await protection.call_ledger(pg.PostgresLedger('private'), 'probe')
        self.assertEqual(logs.output, ['WARNING:implementation.protection:ledger_failed category=operation_timeout'])
        db.close.assert_awaited_once()
