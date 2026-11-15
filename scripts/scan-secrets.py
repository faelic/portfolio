"""Supplement gitleaks with redacted checks of tracked and new source files.

Never scan ignored local credentials/environments or print matching text.
"""
import json
from pathlib import Path
import re
import subprocess
import sys

patterns = {
    'provider-key': re.compile(r'sk-(?:proj-)?[A-Za-z0-9_-]{24,}'),
    'github-token': re.compile(r'(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})'),
    'private-key': re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
    'aws-access-id': re.compile(r'AKIA[A-Z0-9]{16}'),
}
files = subprocess.check_output(['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard']).decode().split('\0')
findings = []
notebooks = []
for name in sorted(set(files) - {''}):
    path = Path(name)
    if not path.is_file() or path.is_symlink():
        continue
    try:
        content = path.read_text(encoding='utf-8')
    except UnicodeError:
        continue
    for rule, pattern in patterns.items():
        if pattern.search(content):
            findings.append({'path': name, 'rule': rule, 'match': '[REDACTED]'})
    if path.suffix == '.ipynb':
        notebook = json.loads(content)
        notebooks.append({'path': name, 'cells_with_outputs': sum(bool(cell.get('outputs')) for cell in notebook.get('cells', []))})
print(json.dumps({'findings': findings, 'notebook_review': notebooks}, indent=2))
sys.exit(bool(findings))
