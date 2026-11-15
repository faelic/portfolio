"""Single-host durable admission and conservative spend accounting; no transcripts."""
import argparse
import asyncio
import calendar
import json
import logging
import math
import os
import sqlite3
import time
from contextlib import closing, contextmanager
from datetime import datetime, timezone
from pathlib import Path

from .config import ANSWER_MODEL, EMBEDDING_MODEL

logger = logging.getLogger(__name__)
PRICE_VERSION = 'openai-standard-2026-11-12'
# Integer hundredths of micro-USD per token (input, output, denominator).
# Equivalent uncached USD/million: 0.40/1.60 for chat and 0.13 for embeddings.
PRICES = {ANSWER_MODEL: (40, 160, 100), EMBEDDING_MODEL: (13, 0, 100)}


def client_schema(db):
    # Additive migration: preserve old global admissions, debits and version.
    db.execute('CREATE TABLE IF NOT EXISTS client_admissions (at REAL NOT NULL, visitor TEXT NOT NULL, ip TEXT NOT NULL)')
    db.execute('CREATE INDEX IF NOT EXISTS client_admissions_visitor ON client_admissions(visitor, at)')
    db.execute('CREATE INDEX IF NOT EXISTS client_admissions_ip ON client_admissions(ip, at)')
    db.execute('CREATE INDEX IF NOT EXISTS client_admissions_at ON client_admissions(at)')


class ProtectionError(RuntimeError):
    def __init__(self, code='unavailable', retry_after=60):
        self.code = code
        self.retry_after = max(1, math.ceil(retry_after))
        super().__init__(code)


def initialize(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(descriptor)
    with closing(sqlite3.connect(path)) as db:
        db.execute('PRAGMA journal_mode=WAL')
        db.executescript('''
            CREATE TABLE metadata (version INTEGER NOT NULL CHECK(version=1));
            INSERT INTO metadata VALUES (1);
            CREATE TABLE admissions (at REAL NOT NULL);
            CREATE INDEX admissions_at ON admissions(at);
            CREATE TABLE debits (at REAL NOT NULL, request_id TEXT NOT NULL,
                stage TEXT NOT NULL, micro_usd INTEGER NOT NULL CHECK(micro_usd>0), price_version TEXT NOT NULL);
            CREATE INDEX debits_at ON debits(at);
        ''')
        client_schema(db)
        db.commit()


class Ledger:
    def __init__(self, path, daily_micro=1_000_000, monthly_micro=10_000_000):
        self.path = Path(path)
        self.daily = daily_micro
        self.monthly = monthly_micro

    @contextmanager
    def transaction(self):
        try:
            with closing(sqlite3.connect(self.path.resolve().as_uri() + '?mode=rw', uri=True, timeout=2)) as db:
                db.execute('BEGIN IMMEDIATE')
                if db.execute('SELECT version FROM metadata').fetchall() != [(1,)]:
                    raise ProtectionError()
                yield db
                db.commit()
        except (sqlite3.Error, OSError) as exc:
            logger.warning('protection_failed exception_class=%s', type(exc).__name__)
            raise ProtectionError() from None

    def check(self):
        """Startup/owner integrity check and additive schema preparation."""
        with self.transaction() as db:
            if db.execute('PRAGMA quick_check').fetchone() != ('ok',):
                raise ProtectionError()
            db.execute('SELECT COUNT(*) FROM admissions').fetchone()
            db.execute('SELECT SUM(micro_usd) FROM debits').fetchone()
            client_schema(db)
            db.execute('SELECT at, visitor, ip FROM client_admissions LIMIT 1').fetchall()

    def probe(self):
        """Bounded read-only readiness: no migrations, integrity scans or sums."""
        try:
            with closing(sqlite3.connect(self.path.resolve().as_uri() + '?mode=ro', uri=True, timeout=.2)) as db:
                if db.execute('SELECT version FROM metadata LIMIT 2').fetchall() != [(1,)]:
                    raise ProtectionError()
                db.execute('SELECT at FROM admissions LIMIT 1').fetchall()
                db.execute('SELECT micro_usd FROM debits LIMIT 1').fetchall()
                db.execute('SELECT at, visitor, ip FROM client_admissions LIMIT 1').fetchall()
        except (sqlite3.Error, OSError):
            raise ProtectionError() from None

    def admit(self, now=None, *, visitor=None, ip=None):
        now = time.time() if now is None else now
        with self.transaction() as db:
            if visitor is not None or ip is not None:
                if not visitor or not ip:
                    raise ProtectionError()
                db.execute('DELETE FROM client_admissions WHERE at<=?', (now - 86400,))
                failures = []
                for column, identity, window, limit, code in (
                    ('visitor', visitor, 60, 3, 'visitor_rate_limited'),
                    ('ip', ip, 60, 6, 'ip_rate_limited'),
                    ('ip', ip, 86400, 20, 'ip_daily_limited'),
                ):
                    count, oldest = db.execute(f'SELECT COUNT(*), MIN(at) FROM client_admissions WHERE {column}=? AND at>?', (identity, now-window)).fetchone()
                    if count >= limit:
                        failures.append((oldest + window - now, code))
                if failures:
                    retry, code = max(failures)
                    raise ProtectionError(code, retry)
            db.execute('DELETE FROM admissions WHERE at<=?', (now - 60,))
            count, oldest = db.execute('SELECT COUNT(*), MIN(at) FROM admissions').fetchone()
            if count >= 30:
                raise ProtectionError('rate_limited', oldest + 60 - now)
            db.execute('INSERT INTO admissions VALUES (?)', (now,))
            if visitor is not None:
                db.execute('INSERT INTO client_admissions VALUES (?,?,?)', (now, visitor, ip))

    def debit(self, request_id, stage, model, payload, maximum_output, now=None):
        if model not in PRICES or stage not in ('rewrite', 'embedding', 'answer'):
            raise ProtectionError()
        expected_model = EMBEDDING_MODEL if stage == 'embedding' else ANSWER_MODEL
        output_limit = {'embedding': 0, 'rewrite': 128, 'answer': 512}[stage]
        if model != expected_model or type(maximum_output) is not int or not 0 <= maximum_output <= output_limit:
            raise ProtectionError()
        now = time.time() if now is None else now
        date = datetime.fromtimestamp(now, timezone.utc)
        day = date.replace(hour=0, minute=0, second=0, microsecond=0).timestamp()
        month = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0).timestamp()
        next_month = month + calendar.monthrange(date.year, date.month)[1] * 86400
        input_rate, output_rate, denominator = PRICES[model]
        input_bound = len(payload.encode('utf-8')) + (128 if stage != 'embedding' else 0)
        micro = max(1, math.ceil((input_bound * input_rate + maximum_output * output_rate) / denominator))
        with self.transaction() as db:
            daily = db.execute('SELECT COALESCE(SUM(micro_usd),0) FROM debits WHERE at>=?', (day,)).fetchone()[0]
            monthly = db.execute('SELECT COALESCE(SUM(micro_usd),0) FROM debits WHERE at>=?', (month,)).fetchone()[0]
            if monthly + micro > self.monthly:
                raise ProtectionError('budget_exhausted', next_month - now)
            if daily + micro > self.daily:
                raise ProtectionError('budget_exhausted', day + 86400 - now)
            db.execute('INSERT INTO debits VALUES (?,?,?,?,?)', (now, request_id, stage, micro, PRICE_VERSION))
        logger.info('provider_debit request_id=%s stage=%s micro_usd=%d price_version=%s', request_id, stage, micro, PRICE_VERSION)
        return micro

    def summary(self):
        with self.transaction() as db:
            return db.execute("SELECT date(at,'unixepoch'),SUM(micro_usd),COUNT(*) FROM debits GROUP BY 1 ORDER BY 1").fetchall()


def budget_guard(ledger, request_id):
    async def reserve(stage, model, payload, maximum_output):
        # Cancellation may leave this short transaction committed. Never refund
        # uncertain work; this deliberately errs toward an earlier cutoff.
        await asyncio.to_thread(ledger.debit, request_id, stage, model, payload, maximum_output)
    return reserve


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Owner-only protection ledger operations')
    parser.add_argument('action', choices=('init', 'inspect', 'check'))
    parser.add_argument('--path', type=Path, default=Path(os.getenv('RAG_DATA_DIR', '/data')) / 'protection.sqlite3')
    args = parser.parse_args()
    if args.action == 'init':
        initialize(args.path)
        print('Ledger initialized; existing ledgers are never overwritten.')
    elif args.action == 'check':
        Ledger(args.path).check()
        print('Ledger integrity and schema check passed; existing allowances retained.')
    else:
        print(json.dumps(Ledger(args.path).summary()))
