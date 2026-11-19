"""One optional, curated follow-up; no generation, retrieval, or stored state."""
import re
import unicodedata

# Aliases, supporting document, and (question, already-discussed, evidence) patterns.
TOPICS = (
    (r'\bmonierave\b', 'project-monierave', (
        ('What happens if a notification fails in Monierave?', r'email|notification|outbox', r'outbox'),
        ('How does Monierave handle repeated transfers?', r'idempoten|duplicat|repeat.*transfer', r'idempotency'),
        ('How does Monierave handle concurrent transfers?', r'concurren|row.lock', r'row.level locking'),
        ('How does Monierave manage login sessions?', r'session|refresh.token', r'revocable sessions'),
        ("How did Favour build Monierave's frontend?", r'frontend|tanstack|react.hook.form', r'TanStack Query'),
        ('What transfer tests are documented for Monierave?', r'\btests?\b|testing', r'tests for transfer behavior'),
    )),
    (r'\bpolicy\.?ng\b', 'experience-flamong-policy-ng', (
        ('What did Favour own on Policy.ng?', r'ownership|responsib|sole.frontend|contribut', r'responsibility'),
        ('How does Policy.ng handle administrative workflows?', r'admin|moderation|permission', r'administrat'),
        ("How did Favour collaborate on Policy.ng's backend integration?", r'collaborat|backend engineer', r'backend engineer'),
        ('How does Policy.ng handle forms and failed submissions?', r'forms?|validation|submission', r'React Hook Form'),
    )),
    (r'\bblockscan\b', 'project-blockscan', (
        ('How does BlockScan handle failed live updates?', r'fail|refresh|poll|live.block', r'refresh fails'),
        ('How does BlockScan protect provider credentials?', r'credential|proxy|proxies|api.key', r'Alchemy credentials'),
        ('What can visitors save in BlockScan?', r'watchlist|saved.*address', r'watchlist'),
        ('How does BlockScan interpret a search?', r'search', r'global search'),
    )),
    (r'\b(?:approval cleanup|allowance cleanup|cleanup)\b', 'project-approval-cleanup', (
        ('What can Cleanup miss during a scan?', r'limit|miss|window|non.standard|complete', r'block window'),
        ('How can a visitor revoke an allowance in Cleanup?', r'revok|revocat|wallet.action', r'revocation'),
        ('How does Cleanup work within RPC provider limits?', r'RPC|batch|provider.limit', r'logs in batches'),
    )),
    (r'\bbucketflow\b', 'project-bucketflow', (
        ("How does BucketFlow's savings withdrawal cooldown work?", r'cooldown|withdraw', r'30.day withdrawal cooldown'),
        ('How does BucketFlow split a deposit?', r'allocat|split|bucket', r'full deposit'),
        ('How does BucketFlow show pending transactions?', r'pending|receipt|transaction.state', r'transaction states'),
    )),
    (r'\bescrow\b', 'project-escrow', (
        ('What can the arbiter do in Escrow?', r'arbiter|release|refund', r'arbiter'),
        ('Where can I explore the Escrow implementation?', r'github|repository|deployed', r'github.com/faelic/escrow-webapp'),
    )),
    (r'\b(?:rag|portfolio assistant|ai assistant|the assistant)\b', 'project-portfolio-rag-assistant', (
        ('How is the Portfolio RAG Assistant evaluated?', r'evaluat|accuracy|metric|test', r'evaluation'),
        ('How does the Portfolio RAG Assistant use retrieved evidence?', r'retriev|ground|evidence', r'retriev'),
        ('How does the Portfolio RAG Assistant resolve conversation follow-ups?', r'follow.up|rewrit|pronoun', r'standalone retrieval query'),
    )),
    (r'\b(?:experience|career|work|build|background|favour)\b', 'profile-overview', (
        ('What did Favour contribute to Policy.ng?', r'policy\.?ng|flamong', r'Policy.ng'),
        ('What backend work did Favour build in Monierave?', r'monierave|banking', r'Monierave'),
        ('What AI application has Favour built?', r'\bai\b|assistant|\brag\b', r'RAG'),
    )),
)
# A passing mention is not an answer to a deeper question. Only suppress a
# candidate for answer coverage when the response actually explains its detail.
DETAILS = {
    'What happens if a notification fails in Monierave?': r'(?:email|notification).{0,100}(?:fail|retr(?:y|ies)|delivery)|(?:fail|retr(?:y|ies)).{0,100}(?:email|notification)',
    'How does Monierave handle repeated transfers?': r'idempotenc.{0,100}(?:repeat|duplicat)|(?:repeat|duplicat).{0,100}idempotenc',
    'How does Monierave handle concurrent transfers?': r'(?:concurren|conflicting).{0,100}(?:lock|transaction)|(?:row.lock).{0,100}(?:concurren|conflicting)',
    'How does Monierave manage login sessions?': r'rotating refresh tokens|revocable sessions.{0,70}(?:audit|revoke|rotat)',
    "How did Favour build Monierave's frontend?": r'TanStack Query.{0,150}React Hook Form',
    'What transfer tests are documented for Monierave?': r'tests?.{0,80}transfer.{0,80}concurren',
    'What did Favour own on Policy.ng?': r'sole frontend|responsib.{0,80}frontend|frontend.{0,80}responsib',
    'How does Policy.ng handle administrative workflows?': r'admin.{0,100}(?:permission|moderation|unsaved|validation)',
    "How did Favour collaborate on Policy.ng's backend integration?": r'backend engineer.{0,100}(?:endpoint|response|workflow)|collaborat.{0,100}backend',
    'How does Policy.ng handle forms and failed submissions?': r'React Hook Form.{0,80}Zod|fail.{0,80}(?:preserv|losing|work)',
    'How does BlockScan handle failed live updates?': r'preserv.{0,80}(?:fail|refresh)|fail.{0,80}(?:preserv|retain)',
    'How does BlockScan protect provider credentials?': r'(?:proxies|proxy).{0,100}(?:credential|browser)|credential.{0,100}(?:proxies|proxy)',
    'What can visitors save in BlockScan?': r'watchlist.{0,60}address|address.{0,60}watchlist',
    'How does BlockScan interpret a search?': r'search.{0,100}(?:block number|transaction hash|wallet address)',
    'What can Cleanup miss during a scan?': r'(?:window|non.standard).{0,100}(?:limit|complete|miss|constraint)|cannot guarantee.{0,100}history',
    'How can a visitor revoke an allowance in Cleanup?': r'(?:revok|revocation).{0,100}(?:wallet|allowance)|wallet.{0,100}(?:revok|revocation)',
    'How does Cleanup work within RPC provider limits?': r'logs.{0,60}batch|batch.{0,60}RPC',
    "How does BucketFlow's savings withdrawal cooldown work?": r'30.day.{0,80}(?:savings|cooldown)|savings.{0,80}30.day',
    'How does BucketFlow split a deposit?': r'(?:split|allocat).{0,100}(?:full|entire|USDC)',
    'How does BucketFlow show pending transactions?': r'pending.{0,100}(?:confirm|receipt)|receipt.{0,100}confirm',
    'What can the arbiter do in Escrow?': r'arbiter.{0,100}(?:release|refund)',
    'Where can I explore the Escrow implementation?': r'github.com/faelic/escrow-webapp',
    'How is the Portfolio RAG Assistant evaluated?': r'(?:MRR|reciprocal rank|coverage).{0,150}(?:evaluat|metric|judge|grounding)|evaluat.{0,150}(?:MRR|reciprocal rank)',
    'How does the Portfolio RAG Assistant use retrieved evidence?': r'retriev.{0,100}(?:ground|answer|passage)',
    'How does the Portfolio RAG Assistant resolve conversation follow-ups?': r'rewrit.{0,100}standalone|standalone.{0,100}rewrit',
    'What did Favour contribute to Policy.ng?': r'Policy.ng.{0,100}sole frontend|sole frontend.{0,100}Policy.ng',
    'What backend work did Favour build in Monierave?': r'Monierave.{0,200}(?:idempotenc|double.entry|outbox)',
    'What AI application has Favour built?': r'(?:portfolio|RAG).{0,60}assistant.{0,100}(?:Python|LangChain|retriev)',
}



def explicit_topics(text):
    topics = [topic for topic in TOPICS[:-1] if re.search(topic[0], text, re.I)]
    if not topics and re.search(r'who.*favour|what.*favour.*(?:build|work|do)|(?:his|favour.s) (?:experience|background|career)', text, re.I):
        return [TOPICS[-1]]
    return topics


def normalized_question(text):
    return re.sub(r'\W+', ' ', text).casefold().strip()


def bounded_suggestions(values=None):
    """Untrusted, session-only hints; never evidence or extra model history."""
    if values is None:
        return []
    if (not isinstance(values, list) or len(values) > 12
            or any(not isinstance(value, str) or not 1 <= len(value) <= 120
                   or any(unicodedata.category(char) in ('Cc', 'Cf', 'Cs') for char in value) for value in values)):
        raise ValueError('Recent suggestions must contain at most 12 bounded questions')
    return values[:]


def active_topics(question, answer, history):
    named = explicit_topics(question)
    # Broad specialty questions should continue within that specialty, rather
    # than turning the name Favour into a generic profile/Policy.ng fallback.
    if (not named or named == [TOPICS[-1]]) and re.search(r'blockchain|solidity|ethereum|web3', question, re.I):
        return [topic for topic in explicit_topics(answer) if topic[1] in {
            'project-blockscan', 'project-approval-cleanup', 'project-bucketflow', 'project-escrow'}]
    if named:
        return named
    for message in reversed(history):
        if message['role'] == 'user':
            named = explicit_topics(message['content'])
            if named:
                return named
    return explicit_topics(answer)


def already_covered(proposed, identity, answer):
    """Conservative local checks for known intents, not semantic judging."""
    for _, document_id, candidates in TOPICS:
        if document_id != identity:
            continue
        for candidate, subject, _ in candidates:
            terms = set(re.findall(r'[a-z]+', normalized_question(candidate))) - {'how', 'does', 'what', 'the', 'in', 'a', 'favour', 'did'}
            overlap = len(terms & set(re.findall(r'[a-z]+', normalized_question(proposed)))) / max(1, len(terms))
            if overlap >= 0.75 and re.search(subject, proposed, re.I) and re.search(DETAILS[candidate], answer, re.I | re.S):
                return True
    if re.search(r'technolog|tech stack|tools|framework|libraries', proposed, re.I):
        technologies = re.findall(r'React Hook Form|TanStack Query|\bZod\b|\bSolidity\b|\bFoundry\b|\bHardhat\b|\bLangChain\b|\bChroma\b', answer, re.I)
        return len(set(value.casefold() for value in technologies)) >= 2
    return False


def suggest_followup(question, answer, history, documents, recent_suggestions=None):
    if not answer.strip() or re.fullmatch(r'\s*(?:hi|hello|hey|thanks|thank you|bye|goodbye|ok|okay)[!.\s]*', question, re.I):
        return None
    # Track actual visitor questions per topic. Words in a different project
    # or a broad assistant overview must not exhaust this project's questions.
    previous_topic = None
    asked = {}
    unscoped = []
    asked_questions = {normalized_question(question)} | {normalized_question(m['content']) for m in history if m['role'] == 'user'} | {normalized_question(value) for value in (recent_suggestions or [])}
    for message in history:
        if message['role'] != 'user':
            continue
        named = explicit_topics(message['content'])
        if named:
            previous_topic = named[0] if len(named) == 1 else None
        if previous_topic:
            asked.setdefault(previous_topic[1], []).append(message['content'])
        elif not named:
            unscoped.append(message['content'])
    choices = active_topics(question, answer, history)
    if not choices:
        return None
    answer_topics = explicit_topics(answer)
    choices = [topic for topic in choices if topic[1] == 'profile-overview' or not answer_topics
               or any(other[1] == topic[1] for other in answer_topics)]
    evidence = {}
    for doc in documents:
        key = doc.metadata.get('document_id')
        evidence[key] = evidence.get(key, '') + '\n' + doc.page_content
    # Comparisons may continue with either named project. Never jump to an
    # unrelated retrieved project simply because the current topic is exhausted.
    for topic in choices:
        if not evidence.get(topic[1]):
            continue
        asked_text = '\n'.join(asked.get(topic[1], []))
        asked_text += '\n' + question + '\n' + '\n'.join(unscoped)
        for candidate, subject, required in topic[2]:
            if normalized_question(candidate) in asked_questions:
                continue
            if re.search(subject, asked_text, re.I):
                continue
            if re.search(DETAILS[candidate], answer, re.I | re.S):
                continue
            if re.search(required, evidence.get(topic[1], ''), re.I):
                return candidate
    return None
