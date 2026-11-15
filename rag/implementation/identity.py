"""Anonymous browser identity and explicitly trusted proxy resolution; no IP logs."""
import hashlib
import hmac
from http.cookies import SimpleCookie
from ipaddress import ip_address, ip_network
import re
import secrets
import time

from .protection import ProtectionError

COOKIE_NAME = 'portfolio_visitor'
COOKIE_AGE = 30 * 86400


def digest(secret, purpose, value):
    return hmac.new(secret.encode(), f'{purpose}:{value}'.encode(), hashlib.sha256).hexdigest()


def visitor_identity(cookie, secret, now=None):
    now = int(time.time() if now is None else now)
    if cookie and len(cookie) <= 160:
        parts = cookie.split('.')
        if len(parts) == 3:
            identifier, issued, signature = parts
            if re.fullmatch(r'[0-9a-f]{32}', identifier) and re.fullmatch(r'[0-9]{1,12}', issued) and re.fullmatch(r'[0-9a-f]{64}', signature):
                payload = f'{identifier}.{issued}'
                if 0 <= now - int(issued) < COOKIE_AGE and hmac.compare_digest(signature, digest(secret, 'cookie', payload)):
                    return digest(secret, 'visitor', identifier), None
    payload = f'{secrets.token_hex(16)}.{now}'
    return digest(secret, 'visitor', payload.split('.')[0]), f'{payload}.{digest(secret, "cookie", payload)}'


def cookie_header(value, production):
    cookie = SimpleCookie()
    cookie[COOKIE_NAME] = value
    item = cookie[COOKIE_NAME]
    item['path'] = '/api/chat'
    item['httponly'] = True
    item['max-age'] = COOKIE_AGE
    item['samesite'] = 'None' if production else 'Lax'
    if production:
        item['secure'] = True
    return item.OutputString().encode('latin-1')


def address(value):
    parsed = ip_address(value)
    return getattr(parsed, 'ipv4_mapped', None) or parsed


def client_ip(scope, trusted_proxies):
    """Walk XFF from the peer inward; ignore all headers from untrusted peers.

    Uvicorn proxy_headers stays False so scope.client is the actual TCP peer.
    A trusted edge must overwrite or append the real connecting client to XFF.
    """
    try:
        peer = address(scope['client'][0])
        networks = tuple(ip_network(value) for value in trusted_proxies)
        trusted = lambda ip: any(ip in network for network in networks)
        if not trusted(peer):
            return str(peer)
        values = [value.decode('latin-1') for key, value in scope['headers'] if key.lower() == b'x-forwarded-for']
        if not values or sum(map(len, values)) > 2048:
            raise ValueError()
        chain = [address(value.strip()) for value in ','.join(values).split(',')]
        if not chain or len(chain) > 32:
            raise ValueError()
        for candidate in reversed(chain):
            if not trusted(candidate):
                return str(candidate)
        # An all-trusted chain has no verifiable visitor boundary.
        raise ValueError()
    except (ValueError, KeyError, TypeError, IndexError):
        raise ProtectionError() from None
