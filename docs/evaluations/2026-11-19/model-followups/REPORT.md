# Model-generated follow-ups — one 12-turn live check

19 November 2026. **AI-assisted review, not personal grading by Favour or independent human validation.**

## Result

- All **12/12 answers completed**. Suggestions appeared after **11/12** answers: **4 model-generated**, **7 curated fallbacks**, and **1 absent**.
- No provider, parser or transport exception ended a turn. Metadata source selection does not prove the questions were all useful.
- One missing continuation, weak project transitions, reoffered unaccepted suggestions, and one redundant model question remain visible below. No repeat live run was used to replace these outcomes.
- Conservative owner reservations totaled **172,549 micro-USD ($0.172549)** against a **250,000 micro-USD ($0.25)** cap. This is not actual billing.
- The check made 12 answer/envelope requests, 12 embedding requests, and 11 normal history-rewrite requests. Follow-up generation added no separate request. Retries were disabled. No index ingestion, ledger migration, public quota consumption, commit, push, or deployment was performed by the runner.

## Method and limits

The owner-only runner used the packaged index and current model, with model follow-ups enabled. Six fixed questions alternated with six accepted preceding suggestions or a planned substitute when none existed. This exercises a growing conversation, pronouns, project changes, the recorded Monierave/experience patterns, and the existing bounded history. It is not a random sample, adversarial study, comparison proving quality uplift, or guarantee of continuous unique questions.

Visible answers retain 512-token/2,000-character bounds; the generation envelope is capped at 768 tokens. The raw report records actual timing, usage where available, call-stage reservations, code/index hashes, selected evidence and effective history. Generation usage includes JSON/suggestion tokens but excludes rewriting and embeddings; no total invoice is inferred. The API and browser path were checked separately with mocked provider responses, not by this direct local pipeline run.

Review focuses on follow-up relevance, answerability and novelty. Answerability uses the supplied source passages; literal quote presence alone does not establish entailment. The generated answers were not comprehensively claim-graded here. The coding assistant supplied these judgments after reading the real outputs and sources; no paid judge call or human score was added.

## Review register

| Turn | Source | Relevance | Answerability | Novelty | Assessment |
|---|---|---:|---:|---:|---|
| followup-01 | model | 2 | 2 | 2 | useful |
| followup-02 | curated | 2 | 2 | 1 | partly_redundant |
| followup-03 | model | 2 | 2 | 2 | useful |
| followup-04 | curated | 1 | 2 | 1 | weak_transition |
| followup-05 | curated | 2 | 2 | 1 | useful_deeper_detail |
| followup-06 | curated | 2 | 2 | 2 | useful |
| followup-07 | curated | 2 | 2 | 1 | reoffered_suggestion |
| followup-08 | curated | 2 | 2 | 2 | useful |
| followup-09 | none | N/A | N/A | N/A | missing_useful_continuation |
| followup-10 | model | 2 | 2 | 2 | useful_with_weak_quote |
| followup-11 | curated | 1 | 2 | 2 | weak_transition |
| followup-12 | model | 2 | 2 | 0 | redundant |

Scores are ordinal AI judgments from 0–2, not probabilities or independently calibrated quality metrics. No combined accuracy/pass percentage is reported.

## Actual questions, answers and suggestions

### followup-01

**Question:** Who is Favour?

**Actual answer:**

> Favour Chukwuemerie Ututu is a Full-stack Software Engineer and AI Engineer based in Nigeria. He specializes in building frontend applications, backend systems, and AI-powered solutions, including blockchain applications and smart contracts. His professional work includes frontend engineering for Policy.ng and various independent projects involving Python, Go, React, TypeScript, Solidity, and Ethereum tooling. He is open to full-time and freelance roles worldwide, including remote work.

**Suggestion:** What are some of Favour's notable projects? (model)

**AI-written rationale:** A broad introduction leads naturally to named project examples. The selected profile passage contains those examples. The quoted sentence establishes project activity but does not itself enumerate every project, so literal quote validation alone is weaker than full contextual support.

### followup-02

**Question:** What are some of Favour's notable projects?

**Actual answer:**

> Favour's notable projects include Policy.ng, where he owns the frontend engineering for both the public website and administrative tools. He developed Monierave, a banking simulation focusing on transaction integrity and reliable background processing. BucketFlow is a project applying allocation rules through a Solidity smart contract. BlockScan is a live blockchain data explorer. Approval Cleanup helps users inspect token-spending permissions, and Escrow is a Sepolia payment project with both frontend and smart contract components. Additionally, he built a Python-based Portfolio RAG Assistant that uses retrieval-augmented generation to answer questions about his portfolio.

**Suggestion:** What did Favour contribute to Policy.ng? (curated)

**AI-written rationale:** Policy.ng contribution is supported and relevant to the project list, but the answer already identifies ownership of its public/admin frontend. A deeper workflow question would add more than repeating that ownership boundary. This was a curated fallback, not a model-generated success.

### followup-03

**Question:** What's his experience?

**Actual answer:**

> Favour has experience as a Full-stack Software Engineer and AI Engineer based in Nigeria. He has professional frontend engineering experience on Policy.ng, handling both the public website and administrative tools. His backend expertise includes building API-driven systems with Go, focusing on authentication, session management, database transactions, and background jobs, exemplified by his Monierave banking simulation project. He also develops blockchain applications and smart contracts using Solidity and Ethereum tooling. Additionally, Favour builds AI-powered applications, including a Python-based Portfolio RAG Assistant that uses retrieval-augmented generation. His learning journey began with self-directed freelance work, followed by structured frontend engineering training at Alchemy University and blockchain training at Cyfrin.

**Suggestion:** Can you tell me more about Favour's blockchain engineering experience? (model)

**AI-written rationale:** The experience summary briefly mentions blockchain work; asking for more detail provides a supported new level of depth. The quoted source records implemented Solidity/Ethereum work and the related integration concerns.

### followup-04

**Question:** Can you tell me more about Favour's blockchain engineering experience?

**Actual answer:**

> Favour has solid blockchain engineering experience focused on Solidity smart contracts and Ethereum-connected applications. His work includes developing wallet connections, managing token approvals, handling contract events and transaction receipts, and dealing with wallet or network mismatches in user interfaces. He uses tools and frameworks such as Solidity, Ethereum, Foundry, Hardhat, OpenZeppelin, wagmi, viem, Ethers.js, and Alchemy SDK/RPC. Notable projects demonstrating this expertise include BucketFlow, which applies allocation rules through a Solidity contract, and Approval Cleanup, which helps users inspect token-spending permissions. Additionally, he built Escrow, a Sepolia payment project involving both frontend React components and Solidity smart contracts.

**Suggestion:** What did Favour contribute to Policy.ng? (curated)

**AI-written rationale:** The Policy.ng question is answerable but moves away from the latest blockchain discussion. It also repeats a previously displayed, unaccepted suggestion. Exact asked-question deduplication does not prevent reoffering a suggestion the visitor did not send.

### followup-05

**Question:** How does Monierave work?

**Actual answer:**

> Monierave is a full-stack banking simulation developed by Favour to explore backend and frontend engineering of financial transactions. It includes features like account registration and verification, authentication, account management, beneficiaries, transfers, transaction history, statements, and profile and security settings. On the backend, it uses a transactional outbox with PostgreSQL, Redis, and Asynq to handle reliable background processing and retries without making notification delivery a condition of a committed transfer. Transfers are recorded through an append-only double-entry ledger with PostgreSQL transactions, row-level locking for concurrency, and idempotency keys to prevent duplicate transfers. The frontend uses React with TanStack Query and React Hook Form for data management and form handling. Importantly, Monierave is a simulation and not a licensed bank or a service handling real money.

**Suggestion:** How does Monierave handle concurrent transfers? (curated)

**AI-written rationale:** Concurrency is directly related to Monierave. The overview already names locking, but a brief mechanism mention is not a detailed concurrency explanation. The follow-up can deepen that subject without inventing performance or correctness guarantees.

### followup-06

**Question:** How does Monierave handle concurrent transfers?

**Actual answer:**

> Monierave handles concurrent transfers using several coordinated backend mechanisms to ensure transaction integrity. Transfers are recorded through an append-only double-entry ledger within PostgreSQL transactions, which keep related database changes atomic. Row-level locking is used to coordinate concurrent operations on accounts, preventing conflicts. Additionally, idempotency keys help prevent duplicate transfers from repeated requests. Monierave employs a transactional outbox pattern that connects durable database changes to asynchronous background processing, allowing retries without requiring notification delivery to be part of the committed transfer. These mechanisms together aim to maintain transfer integrity and concurrency control, though exact once-only execution under all failure conditions is not independently verified.

**Suggestion:** How does Monierave manage login sessions? (curated)

**AI-written rationale:** Login sessions provide an adjacent backend-security angle not addressed by the transfer-concurrency answer. Rotating refresh tokens and revocable sessions are documented. This is a curated fallback.

### followup-07

**Question:** What happens if a notification fails?

**Actual answer:**

> If a notification fails in Monierave after a transfer has been committed, the system uses a transactional outbox pattern that allows background retries of the notification. This means the notification delivery is retried asynchronously without making successful notification delivery a condition for the transfer to be considered complete. However, the documentation does not specify any retry limits or guarantees of eventual delivery, so it is unclear how many retries occur or if delivery is assured indefinitely.

**Suggestion:** How does Monierave manage login sessions? (curated)

**AI-written rationale:** Sessions remain a supported adjacent subject, but this is the same suggestion shown after turn six. The visitor used a fixed notification question instead of accepting it, so it was not an already-asked question. Reoffering it is technically allowed but can feel repetitive.

### followup-08

**Question:** How does Monierave manage login sessions?

**Actual answer:**

> Monierave manages login sessions using rotating refresh tokens and revocable sessions as part of its backend security design. This approach helps maintain secure session management by allowing sessions to be invalidated or refreshed as needed. The system also includes audit records and reconciliation checks to support security and integrity. These features are implemented within the backend architecture that uses Go, PostgreSQL, Redis, and Asynq for reliable processing and session handling.

**Suggestion:** How did Favour build Monierave's frontend? (curated)

**AI-written rationale:** The frontend implementation is a fresh angle within Monierave after session security. The source records TanStack Query and React Hook Form/Zod. No unsupported production outcome is implied.

### followup-09

**Question:** How do BlockScan and Cleanup differ?

**Actual answer:**

> BlockScan and Approval Cleanup differ primarily in their purpose and functionality within the blockchain ecosystem. BlockScan is a blockchain explorer for the Ethereum Sepolia test network, allowing users to inspect blocks, transactions, wallet addresses, account activity, and NFT metadata. It features live data feeds, global search distinguishing block numbers, transactions, and addresses, and includes a persistent watchlist and credential handling to protect API keys. In contrast, Approval Cleanup is an ERC-20 wallet-permission manager that helps users review and manage token allowances granted to other addresses or contracts. It scans recent Approval events to identify current token-spender permissions, highlighting risky or unlimited approvals, and allows users to update or revoke these permissions through their connected wallets. While BlockScan focuses on data exploration and monitoring, Approval Cleanup centers on permission management and security for token spending.

**Suggestion:** None

**AI-written rationale:** The answer completed but no usable suggestion reached the callback. Cleanup scan limitations would have been a supported next topic. The artifacts do not retain rejected model metadata, so the exact rejection/null reason cannot be reconstructed. The curated fallback also declines ambiguous multi-project questions. This is a remaining engagement failure, not a provider or streaming failure.

### followup-10

**Question:** What limits apply to Cleanup scans?

**Actual answer:**

> Cleanup scans apply limits because they cover only a recent block window rather than the entire blockchain history. This means they cannot guarantee a complete history of every approval a wallet has ever granted. Additionally, provider constraints and non-standard tokens can affect the scan results, potentially missing some approvals or permissions. Therefore, Cleanup is best understood as a recent snapshot rather than a comprehensive audit of all token allowances.

**Suggestion:** How does Approval Cleanup identify risky or unlimited token approvals? (model)

**AI-written rationale:** Moving from scan coverage to allowance-risk indicators is relevant and answerable from the selected Cleanup passage. The literal quote ends before the explicit risk/unlimited-approval wording, so its mere presence does not independently establish that the question is supported. The full passage supplies the missing context.

### followup-11

**Question:** How is the Portfolio RAG Assistant evaluated?

**Actual answer:**

> The Portfolio RAG Assistant is evaluated using a 50-question dataset with reference answers, answerability labels, and document-and-section evidence groups. Evaluation metrics include mean reciprocal rank (MRR) for retrieval and section-based evidence-group coverage. Structured answer judging assesses accuracy, completeness, relevance, and grounding of responses. Gradio interfaces support interactive chat with retrieved passage inspection, single-case evaluation, and batch evaluation with category charts and feedback. Offline tests with mocked storage and providers check implementation behavior but do not establish real retrieval or answer quality. No verified overall accuracy figure is supplied, and the evaluation tooling itself does not prove correctness or production readiness.

**Suggestion:** How does Policy.ng handle administrative workflows? (curated)

**AI-written rationale:** Policy.ng administrative workflows are supported but weakly connected to the latest RAG-evaluation question. A supported related-project transition is not automatically a strong conversational continuation. This is a curated fallback.

### followup-12

**Question:** How does Policy.ng handle administrative workflows?

**Actual answer:**

> Policy.ng handles administrative workflows on the frontend with features such as permission checks, form validation that rejects invalid data, protection against duplicate submissions, warnings for unsaved edits, and refreshing information after updates. Favour integrates these workflows using tools like React Hook Form and Zod for validation, and TanStack Query for frontend-backend data synchronization. The administrative UI supports nested replies and updates UI states accordingly, ensuring smooth and reliable management of administrative tasks without losing user work.

**Suggestion:** What technologies does Favour use for frontend integration at Policy.ng? (model)

**AI-written rationale:** The source and quote support frontend integration technologies, but the answer already names React Hook Form, Zod and TanStack Query. Asking which technologies are used repeats answered information. Exact prior-question matching and source checks cannot detect every semantic repetition.

## Open findings

1. The mixed BlockScan/Cleanup turn produced no usable suggestion even though scan limitations offered a supported next topic. The raw report records only the final chosen suggestion, not rejected metadata or the precise rejection reason.
2. The final generated question asks about technologies already named in the answer. Exact asked-question matching cannot prevent every semantic repetition.
3. Curated fallbacks sometimes jump to a weakly related project or reoffer an unaccepted suggestion. Seven fallbacks must not be represented as seven model-generated successes.
4. Two accepted model quotes supply only partial support for the proposed question; full source context is needed. A registered ID plus literal quote is a boundary check, not a semantic guarantee.

## Preservation and provenance

- [outputs.json](outputs.json) preserves all actual answers, final questions, mode/cost/timing metadata and source counts. Raw supporting quotes, full context and history text are omitted from this shareable copy.
- [ai-review.json](ai-review.json) contains the separate AI scores/rationales. Human-reviewed count remains zero.
- The ignored owner artifact is rag/evaluation/reports/model-followups-2026-11-19.json. Its SHA-256 is recorded in outputs.json; it retains source quotes and selected passages for local review.
- The initial runner accidentally retained the generic report helper’s baseline-dataset hash. The shareable metadata labels it as a legacy baseline fixture hash and separately records the actual schedule/question hashes. The original raw report was not rewritten. The reusable runner is corrected.
- [live-runner.py.txt](live-runner.py.txt) and [live-validator.py.txt](live-validator.py.txt) preserve the exact versions used by the live run. Afterward, private-solicitation verb matching was hardened and the runner provenance corrected offline. All four accepted model questions still pass final validation; the live check was not repeated.
- [manifest.json](manifest.json) binds these artifacts and records final implementation hashes separately from the live-run hashes. The source snapshots contain code only, not environment values or credentials.

## Operational default

CHAT_MODEL_FOLLOWUPS defaults true locally and false in production. Set it to true on the backend to enable the structured mode after review; false restores plain generation plus curated suggestions. CHAT_ENABLED still controls the entire assistant. No deployment is claimed.

## Offline verification

The final backend suite ran 183 tests successfully (13 skipped). Frontend checks passed: 53 unit tests, 36 desktop/mobile Chromium and WebKit browser checks, lint and production build. Browser/provider fixtures test behavior, not answer quality. Hosted Neon integration and independent human grading were not performed in this check.
