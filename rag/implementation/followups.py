"""One optional, curated follow-up; no generation, retrieval, or stored state."""
import re

# Aliases, supporting document, and (question, already-discussed, evidence) patterns.
TOPICS = (
    (r'\bmonierave\b', 'project-monierave', (
        ('What happens if a notification fails?', r'email|notification|outbox', r'outbox'),
        ('How does Monierave handle repeated transfers?', r'idempoten|duplicat|repeat.*transfer', r'idempotency'),
        ('How does Monierave handle concurrent transfers?', r'concurren|row.lock', r'row.level locking'),
        ('How does Monierave manage login sessions?', r'session|refresh.token', r'revocable sessions'),
    )),
    (r'\bpolicy\.?ng\b', 'experience-flamong-policy-ng', (
        ('What did Favour own on Policy.ng?', r'ownership|responsib|sole.frontend|contribut', r'responsibility'),
        ('How did he handle administrative workflows?', r'admin|moderation|permission', r'administrat'),
        ('How did he collaborate with the backend engineer?', r'collaborat|backend engineer', r'backend engineer'),
    )),
    (r'\bblockscan\b', 'project-blockscan', (
        ('How does BlockScan handle failed live updates?', r'fail|refresh|poll|live.block', r'refresh fails'),
        ('How does BlockScan protect provider credentials?', r'credential|proxy|proxies|api.key', r'Alchemy credentials'),
        ('What can visitors save in BlockScan?', r'watchlist|saved.*address', r'watchlist'),
    )),
    (r'\b(?:approval cleanup|allowance cleanup|cleanup)\b', 'project-approval-cleanup', (
        ('What can Cleanup miss during a scan?', r'limit|miss|window|non.standard|complete', r'block window'),
        ('How can a visitor revoke an allowance?', r'revok|revocat|wallet.action', r'revocation'),
    )),
    (r'\bbucketflow\b', 'project-bucketflow', (
        ('How does the savings withdrawal cooldown work?', r'cooldown|withdraw', r'30.day withdrawal cooldown'),
        ('How does BucketFlow split a deposit?', r'allocat|split|bucket', r'full deposit'),
    )),
    (r'\bescrow\b', 'project-escrow', (
        ('What can the arbiter do in Escrow?', r'arbiter|release|refund', r'arbiter'),
        ('Where can I explore the Escrow implementation?', r'github|repository|deployed', r'github.com/faelic/escrow-webapp'),
    )),
    (r'\b(?:rag|portfolio assistant|ai assistant)\b', 'project-portfolio-rag-assistant', (
        ('How is the assistant evaluated?', r'evaluat|accuracy|metric|test', r'evaluation'),
        ('How does the assistant use retrieved evidence?', r'retriev|ground|evidence', r'retriev'),
    )),
    (r'\b(?:experience|career|work|build|background|favour)\b', 'profile-overview', (
        ('What did Favour contribute to Policy.ng?', r'policy\.?ng|flamong', r'Policy.ng'),
        ('What backend work did Favour build in Monierave?', r'monierave|banking', r'Monierave'),
        ('What AI application has Favour built?', r'\bai\b|assistant|\brag\b', r'RAG'),
    )),
)
UNCERTAIN = re.compile(r'not (?:documented|provided|recorded|established)|\bunknown\b|cannot (?:verify|confirm|answer)|outside (?:my|the) scope|not related', re.I)


def suggest_followup(question, answer, history, documents):
    if not answer.strip() or UNCERTAIN.search(answer):
        return None
    named = TOPICS[:-1]
    def matches(text):
        return [topic for topic in named if re.search(topic[0], text, re.I)]
    choices = matches(question)
    broad = re.search(r'who.*favour|what.*favour.*(?:build|work)|(?:his|favour.s) (?:experience|background|career)', question, re.I)
    if not choices and broad:
        choices = [TOPICS[-1]]
    if not choices:
        for message in reversed(history):
            if message['role'] == 'user':
                choices = matches(message['content'])
                if choices:
                    break
    if not choices:
        choices = matches(answer)
    if not choices and re.search(TOPICS[-1][0], question, re.I):
        choices = [TOPICS[-1]]
    if len(choices) != 1:
        return None
    _, document_id, candidates = choices[0]
    evidence = '\n'.join(doc.page_content for doc in documents if doc.metadata.get('document_id') == document_id)
    if not evidence or (document_id != 'profile-overview' and not re.search(choices[0][0], answer, re.I)):
        return None
    discussed = question + '\n' + answer + '\n' + '\n'.join(m['content'] for m in history if m['role'] == 'user')
    for candidate, subject, required in candidates:
        if not re.search(subject, discussed, re.I) and re.search(required, evidence, re.I):
            return candidate
    return None
