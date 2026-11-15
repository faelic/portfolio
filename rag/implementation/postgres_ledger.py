"""Neon-compatible PostgreSQL ledger; short transactions, no provider I/O in locks."""
from contextlib import contextmanager, asynccontextmanager
from pathlib import Path
import time

import certifi
import psycopg

from .protection import Ledger, ProtectionError, logger, client_limits, debit_quote, PRICE_VERSION


def failure_category(exc):
    """Return fixed labels only. Never emit libpq messages or diagnostic fields."""
    categories = {
        '28P01': 'authentication', '28000': 'authentication',
        '3D000': 'database_missing', '42501': 'permission_denied',
        '42P01': 'schema_missing', '42703': 'schema_mismatch',
        '53300': 'connection_capacity', '57P03': 'server_unavailable',
        '57014': 'statement_timeout_or_cancel', '55P03': 'lock_timeout',
    }
    category = categories.get(getattr(exc, 'sqlstate', None))
    if category:
        return category
    # libpq connection failures often have no SQLSTATE. Inspect internally, but
    # return only our labels: messages may contain DSNs, passwords or SQL values.
    message = str(exc).lower()
    for label, fragments in (
        ('authentication', ('password authentication failed', 'no password supplied', 'no pg_hba.conf entry')),
        ('dns', ('could not translate host name', 'failed to resolve host', 'could not resolve hostname', 'name or service not known', 'temporary failure in name resolution', 'nodename nor servname provided')),
        ('channel_binding', ('channel binding',)),
        ('tls', ('certificate verify failed', 'certificate verification failed', 'root certificate', 'does not match host name', 'ssl error', 'ssl connection', 'tls error', 'server does not support ssl')),
        ('connect_timeout', ('connection timeout expired', 'timeout expired', 'connection timed out')),
        ('connection_refused', ('connection refused',)),
        ('network_unreachable', ('network is unreachable', 'no route to host')),
        ('connection_lost', ('server closed the connection unexpectedly', 'connection reset by peer')),
    ):
        if any(fragment in message for fragment in fragments):
            return label
    return 'unknown'


def log_failure(exc, phase):
    logger.warning('postgres_failed phase=%s category=%s', phase, failure_category(exc))


def connect(database_url):
    # No persistent connection/heartbeat: let Neon scale to zero when idle.
    # Disable prepared statements for transaction-pooler compatibility.
    # libpq otherwise looks for ~/.postgresql/root.crt, which this non-root
    # container does not have. Use a maintained public CA bundle explicitly.
    return psycopg.connect(database_url, sslrootcert=certifi.where(),
                           connect_timeout=5, prepare_threshold=None)


def configure(db, *, readonly=False):
    # One round trip, static SQL only. All settings end with the transaction.
    db.execute(configuration(readonly))


def configuration(readonly=False):
    return (('SET TRANSACTION READ ONLY; ' if readonly else 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED; ')
            + 'SET LOCAL statement_timeout = 2000; '
            + 'SET LOCAL lock_timeout = 2000; '
            + 'SET LOCAL idle_in_transaction_session_timeout = 5000; '
            + 'SET LOCAL search_path TO portfolio_rag, pg_catalog')


def initialize_postgres(database_url):
    """Owner-only, transactional first initialization; never clear existing data."""
    phase = 'connect'
    try:
        with connect(database_url) as db:
            phase = 'initialize'
            configure(db)
            # Coordinate two accidental operator initializations too.
            db.execute('SELECT pg_advisory_xact_lock(741829364)')
            if db.execute("SELECT to_regclass('portfolio_rag.metadata')").fetchone()[0]:
                raise FileExistsError('PostgreSQL ledger already exists; use check, never reset it')
            schema = Path(__file__).with_name('ledger_schema.sql').read_text()
            # psycopg owns this transaction (the SQL-editor copy has wrappers).
            db.execute(schema.replace('BEGIN;\n', '').replace('COMMIT;\n', ''))
    except psycopg.Error as exc:
        log_failure(exc, phase)
        raise ProtectionError() from None


class UnavailableLedger:
    """Production without DATABASE_URL is live but cannot dispatch paid work."""
    def check(self, *_args, **_kwargs):
        raise ProtectionError()

    probe = admit = debit = check


class PostgresLedger(Ledger):
    def __init__(self, database_url, daily_micro=1_000_000, monthly_micro=10_000_000):
        self._database_url = database_url
        self.daily, self.monthly = daily_micro, monthly_micro

    @staticmethod
    def execute(db, query, parameters=()):
        # Only our fixed internal qmark SQL is translated. Values stay bound.
        return db.execute(query.replace('?', '%s'), parameters)

    @contextmanager
    def transaction(self):
        phase = 'connect'
        try:
            with connect(self._database_url) as db:
                phase = 'configure'
                configure(db)
                phase = 'query'
                # One singleton row serializes admissions and budget checks across
                # connections/processes. The following statements see committed
                # predecessors at READ COMMITTED; check+insert is atomic.
                if db.execute('SELECT version FROM metadata WHERE id=1 FOR UPDATE').fetchall() != [(1,)]:
                    raise ProtectionError()
                yield db
                phase = 'commit'
        except (psycopg.Error, OSError) as exc:
            log_failure(exc, phase)
            raise ProtectionError() from None

    def check(self):
        # Deployment SQL is explicit, not a runtime migration or reset.
        self.probe()

    def probe(self):
        phase = 'connect'
        try:
            with connect(self._database_url) as db:
                phase = 'configure'
                configure(db, readonly=True)
                phase = 'query'
                if db.execute('SELECT version FROM metadata WHERE id=1').fetchall() != [(1,)]:
                    raise ProtectionError()
                db.execute('SELECT at FROM admissions LIMIT 1').fetchall()
                db.execute('SELECT micro_usd FROM debits LIMIT 1').fetchall()
                db.execute('SELECT at, visitor, ip FROM client_admissions LIMIT 1').fetchall()
        except (psycopg.Error, OSError) as exc:
            log_failure(exc, phase)
            raise ProtectionError() from None

    def summary(self):
        with self.transaction() as db:
            return db.execute("SELECT to_char(to_timestamp(at) AT TIME ZONE 'UTC','YYYY-MM-DD'), "
                              'SUM(micro_usd),COUNT(*) FROM debits GROUP BY 1 ORDER BY 1').fetchall()

    @asynccontextmanager
    async def atransaction(self, *, readonly=False):
        db = None
        phase = 'connect'
        try:
            db = await psycopg.AsyncConnection.connect(
                self._database_url, sslrootcert=certifi.where(), connect_timeout=5, prepare_threshold=None)
            phase = 'configure'
            await db.execute(configuration(readonly))
            phase = 'query'
            query = 'SELECT version FROM metadata WHERE id=1' + ('' if readonly else ' FOR UPDATE')
            if await (await db.execute(query)).fetchall() != [(1,)]:
                raise ProtectionError()
            yield db
            phase = 'commit'
            await db.commit()
        except (psycopg.Error, OSError) as exc:
            log_failure(exc, phase)
            raise ProtectionError() from None
        finally:
            # Close even on cancellation/uncertain COMMIT. Do not retry or refund.
            # Closing avoids a separate potentially blocked rollback round trip.
            if db is not None:
                await db.close()

    async def aprobe(self):
        async with self.atransaction(readonly=True) as db:
            await db.execute('SELECT at FROM admissions LIMIT 1')
            await db.execute('SELECT micro_usd FROM debits LIMIT 1')
            await db.execute('SELECT at, visitor, ip FROM client_admissions LIMIT 1')

    async def aadmit(self, now=None, *, visitor=None, ip=None):
        now = time.time() if now is None else now
        async with self.atransaction() as db:
            if visitor is not None or ip is not None:
                limits = client_limits(visitor, ip)
                await db.execute('DELETE FROM client_admissions WHERE at<=%s', (now-86400,))
                failures = []
                for column, identity, window, limit, code in limits:
                    count, oldest = await (await db.execute(
                        f'SELECT COUNT(*), MIN(at) FROM client_admissions WHERE {column}=%s AND at>%s',
                        (identity, now-window))).fetchone()
                    if count >= limit:
                        failures.append((oldest+window-now, code))
                if failures:
                    retry, code = max(failures)
                    raise ProtectionError(code, retry)
            await db.execute('DELETE FROM admissions WHERE at<=%s', (now-60,))
            count, oldest = await (await db.execute('SELECT COUNT(*), MIN(at) FROM admissions')).fetchone()
            if count >= 30:
                raise ProtectionError('rate_limited', oldest+60-now)
            await db.execute('INSERT INTO admissions VALUES (%s)', (now,))
            if visitor is not None:
                await db.execute('INSERT INTO client_admissions VALUES (%s,%s,%s)', (now, visitor, ip))

    async def adebit(self, request_id, stage, model, payload, maximum_output, now=None):
        now, day, month, next_month, micro = debit_quote(stage, model, payload, maximum_output, now)
        async with self.atransaction() as db:
            daily = (await (await db.execute('SELECT COALESCE(SUM(micro_usd),0) FROM debits WHERE at>=%s', (day,))).fetchone())[0]
            monthly = (await (await db.execute('SELECT COALESCE(SUM(micro_usd),0) FROM debits WHERE at>=%s', (month,))).fetchone())[0]
            if monthly+micro > self.monthly:
                raise ProtectionError('budget_exhausted', next_month-now)
            if daily+micro > self.daily:
                raise ProtectionError('budget_exhausted', day+86400-now)
            await db.execute('INSERT INTO debits VALUES (%s,%s,%s,%s,%s)', (now, request_id, stage, micro, PRICE_VERSION))
        logger.info('provider_debit request_id=%s stage=%s micro_usd=%d price_version=%s', request_id, stage, micro, PRICE_VERSION)
        return micro
