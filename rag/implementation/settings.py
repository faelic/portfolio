"""Deployment settings. Production never reads credentials from repository files."""
import os
import re
import secrets
from ipaddress import ip_network
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

LOCAL_IDENTITY_SECRET = secrets.token_hex(32)


@dataclass(frozen=True)
class Settings:
    production: bool = False
    chat_enabled: bool = True
    data_dir: Path = Path(__file__).resolve().parents[1]
    hosts: tuple[str, ...] = ('localhost', '127.0.0.1')
    origins: tuple[str, ...] = tuple(f'http://{host}:{port}' for host in ('localhost', '127.0.0.1') for port in (5173, 5174, 4173))
    daily_micro: int = 1_000_000
    monthly_micro: int = 10_000_000
    identity_secret: str = LOCAL_IDENTITY_SECRET
    trusted_proxy_cidrs: tuple[str, ...] = ()
    max_active_per_ip: int = 2
    database_url: str = field(default='', repr=False)

    @property
    def ledger_path(self):
        return self.data_dir / 'protection.sqlite3'

    @classmethod
    def from_env(cls):
        mode = os.getenv('APP_ENV', 'local')
        if mode not in ('local', 'production'):
            raise ValueError('APP_ENV must be local or production')
        production = mode == 'production'
        database_url = os.getenv('DATABASE_URL', '')
        if database_url:
            from psycopg.conninfo import conninfo_to_dict
            try:
                connection = conninfo_to_dict(database_url)
            except Exception:
                raise ValueError('DATABASE_URL must be a valid PostgreSQL connection string') from None
            if production and (connection.get('sslmode') != 'verify-full' or not connection.get('host')):
                raise ValueError('Production DATABASE_URL requires a hostname and sslmode=verify-full')
        enabled = os.getenv('CHAT_ENABLED', 'false' if production else 'true')
        if enabled not in ('true', 'false'):
            raise ValueError('CHAT_ENABLED must be true or false')
        if os.getenv('CHAT_MODEL_FOLLOWUPS', 'false' if production else 'true') not in ('true', 'false'):
            raise ValueError('CHAT_MODEL_FOLLOWUPS must be true or false')
        hosts = tuple(filter(None, (v.strip() for v in os.getenv('ALLOWED_HOSTS', '').split(',')))) if production else cls.hosts
        origins = tuple(filter(None, (v.strip() for v in os.getenv('ALLOWED_ORIGINS', '').split(',')))) if production else cls.origins
        data = Path(os.getenv('RAG_DATA_DIR', '/data' if production else str(cls.data_dir)))
        daily = int(os.getenv('CHAT_DAILY_MICRO_USD', '1000000'))
        monthly = int(os.getenv('CHAT_MONTHLY_MICRO_USD', '10000000'))
        identity_secret = os.getenv('CHAT_IDENTITY_SECRET', '' if production else LOCAL_IDENTITY_SECRET)
        if len(identity_secret.encode()) < 32:
            raise ValueError('CHAT_IDENTITY_SECRET must contain at least 32 bytes; generate a random secret')
        proxies = tuple(filter(None, (v.strip() for v in os.getenv('TRUSTED_PROXY_CIDRS', '').split(','))))
        for value in proxies:
            if ip_network(value).prefixlen == 0:
                raise ValueError('Trusted proxies must be explicit addresses or bounded CIDRs')
        max_active_per_ip = int(os.getenv('CHAT_MAX_ACTIVE_PER_IP', '2'))
        if not 1 <= max_active_per_ip <= 5:
            raise ValueError('CHAT_MAX_ACTIVE_PER_IP must be between 1 and 5')
        if min(daily, monthly) <= 0 or daily > 1_000_000 or monthly > 10_000_000:
            raise ValueError('Chat allowances must be positive and within the approved $1/day, $10/month ceilings')
        if production:
            if os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1').rstrip('/') != 'https://api.openai.com/v1':
                raise ValueError('Production pricing and credentials require the standard OpenAI endpoint')
            if os.getenv('OPENAI_LOG', '').lower() in ('debug', 'info'):
                raise ValueError('Provider payload logging is not allowed in production')
            if not os.getenv('OPENAI_API_KEY') or not data.is_absolute() or not hosts or not origins:
                raise ValueError('Production requires provider credentials, absolute storage, hosts and origins')
            if any(not re.fullmatch(r'[a-zA-Z0-9.-]+', host) for host in hosts):
                raise ValueError('Hosts must be explicit hostnames without wildcards or ports')
            for origin in origins:
                parsed = urlsplit(origin)
                if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.path or parsed.query or parsed.fragment or '*' in origin:
                    raise ValueError('Origins must be exact HTTPS origins')
        return cls(production, enabled == 'true', data, hosts, origins, daily, monthly, identity_secret, proxies, max_active_per_ip, database_url)
