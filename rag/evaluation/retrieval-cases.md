# Portfolio retrieval evaluation cases

This file is evaluation material, excluded from `rag/knowledge/**/*.md`. The questions and expected evidence are a test specification, not additional knowledge or an executed retrieval benchmark.

There are 23 cases: 12 single-document cases, four cross-topic cases, four visitor lookup/referral cases, and three missing-information or partial-answer cases. IDs below are stable corpus document IDs. Expected documents must supply the facts needed for the visitor's question; judge the supported passages rather than requiring a full architectural explanation. Missing-information cases may retrieve nearby context, but it does not establish absent facts. Partial-answer cases require both the known information and an explicit boundary on what is not documented.

When a pipeline exists, inspect evidence in its top five results and evaluate answer grounding separately. Record case ID, retrieved document/section IDs, missing required facts, and any unsupported claims. These cases have not yet been run against a retriever.

## Single-document cases

### S01 — Professional overview

- **Question:** Who is Favour Chukwuemerie Ututu, and what kinds of software does he build?
- **Expected document IDs:** `profile-overview`.
- **Required facts:** Software Engineer; self-taught beginnings and freelance development work before structured Alchemy frontend training in 2025–2026; frontend/backend and blockchain experience; representative projects including Escrow; Flamong/Policy.ng frontend work; planned portfolio assistant is his first AI application project, currently at knowledge-base preparation; agentic engineering is ongoing learning; country of residence is Nigeria when relevant.
- **Unsupported claims to avoid:** Invented seniority, multiple completed AI applications, equal expertise depth across every domain, completed mastery of agentic engineering, or a city-level location.

### S02 — Engineering perspective and interests

- **Question:** How does Favour think about engineering, and what does he enjoy outside coding?
- **Expected document IDs:** `profile-perspective`.
- **Required facts:** Frontend beginnings; useful, attractive, fast interfaces; security and AI safety; agent boundaries and failure behavior; video games outside coding. Attribute the first-person views to Favour.
- **Unsupported claims to avoid:** Professional gaming, security certifications, or an established production agent deployment.

### S03 — AI practice and current learning

- **Question:** Which AI engineering areas does Favour work with, and what is he currently learning?
- **Expected document IDs:** `expertise-engineering`.
- **Required facts:** Portfolio assistant is his first AI application project, at knowledge-base preparation; LLM applications, RAG preparation/retrieval/evaluation subjects are current focus and learning; currently learning agentic AI engineering; portfolio assistant not implemented.
- **Unsupported claims to avoid:** Multiple built AI applications, a deployed portfolio RAG system, model training credentials, named providers/vector databases not supplied, or completed agentic expertise.

### S04 — Policy.ng contribution boundary

- **Question:** What does Favour own at Policy.ng, including its AI-assisted questions?
- **Expected document IDs:** `experience-flamong-policy-ng`.
- **Required facts:** Current Frontend Developer Intern at Flamong; employment May 2026–Present as confirmed on 10 November 2026; sole frontend engineer; public website and authenticated administration tools; React/TypeScript, TanStack Query integration; AI-assisted question interface; backend engineer collaboration; underlying backend and AI services are separate responsibilities.
- **Unsupported claims to avoid:** Ownership of Policy.ng's AI models, retrieval pipeline, or backend; an invented start date.

### S05 — Monierave backend work and code

- **Question:** Which backend problems did Favour explore in Monierave, and where can I see the implementation?
- **Expected document IDs:** `project-monierave`.
- **Required facts:** Banking simulation; concise overview of transfer correctness, repeated-request/concurrency handling, authentication, and background work; relevant technologies include Go, PostgreSQL, Redis, and Asynq; repository https://github.com/faelic/monierave for implementation exploration.
- **Unsupported claims to avoid:** Licensed banking, real customer funds, exact performance numbers, or guaranteed exactly-once distributed execution.

### S06 — BucketFlow allocation and scope

- **Question:** What does BucketFlow do with a USDC deposit, and what restrictions apply?
- **Expected document IDs:** `project-bucketflow`.
- **Required facts:** Full-deposit allocation among buckets; Solidity vault and frontend; wallet approvals/deposits/receipts/balances/withdrawals; pending versus confirmed transaction states; 30-day savings withdrawal cooldown; Ethereum Sepolia test network; demonstration rather than regulated savings product.
- **Unsupported claims to avoid:** Mainnet deployment, regulated savings, guaranteed returns, or cooldown timing mechanics absent from the source.

### S07 — BlockScan live-data behavior

- **Question:** What can users search in BlockScan, and how does it keep live data reliable?
- **Expected document IDs:** `project-blockscan`.
- **Required facts:** Sepolia blocks, transactions, addresses, activity and NFT metadata; search distinguishes block numbers/hashes/addresses; avoids overlapping requests, duplicate results and overwriting valid information; preserves results on refresh failure; avoids unnecessary hidden-page polling; persistent watchlist and keyboard-accessible search; proxies protect Alchemy credentials.
- **Unsupported claims to avoid:** Ethereum mainnet coverage, a complete on-chain index, incorrect project links, or freshly verified application uptime.

### S08 — Approval Cleanup coverage

- **Question:** Can Approval Cleanup find every approval a wallet has ever granted, and what can a user do with its results?
- **Expected document IDs:** `project-approval-cleanup`.
- **Required facts:** No complete-history guarantee; recent Approval-event window; latest observed token/spender allowances; unlimited/older permissions highlighted for review; RPC-sized batches; connected-wallet update or revocation; non-standard-token/provider limitations.
- **Unsupported claims to avoid:** Complete scanning, a guarantee that allowances are safe, or every highlighted approval being malicious.

### S09 — Education and training

- **Question:** What university education and engineering training does Favour have?
- **Expected document IDs:** `education-training`.
- **Required facts:** Federal University of Technology Minna — BSc in Quantity Survey, 2018–2025; Alchemy University frontend training, 2025–2026, with React, TypeScript, API/Ethereum integration, wallets, transaction states, reusable UI, and testing; completed Cyfrin blockchain/smart-contract training.
- **Unsupported claims to avoid:** A computer science degree, invented start/end months, grades, Cyfrin training dates, or unspecified professional certificates.

### S10 — Assistant availability

- **Question:** Can I use Favour's portfolio AI assistant now, and what is it intended to answer?
- **Expected document IDs:** `portfolio-assistant-status`.
- **Required facts:** First AI application project, currently at knowledge-base preparation; planned and not available yet; intended RAG over curated background, professional experience, contributions and projects; concise visitor answers with GitHub referrals for deeper implementation questions.
- **Unsupported claims to avoid:** A working chat endpoint, a launch date, deployed embeddings, or implemented retrieval.

### S11 — Opportunities and contact

- **Question:** What opportunities is Favour open to, where can they be based, and how should I contact him?
- **Expected document IDs:** `opportunities-contact`.
- **Required facts:** Owner-confirmed on 10 November 2026: full-time and freelance/contract opportunities in frontend, backend, full-stack software and AI engineering; worldwide interest, remote work, and discussing relocation; residence Nigeria; email `ututufavour7@gmail.com`.
- **Unsupported claims to avoid:** Undated guarantees of current availability, salary expectations, guaranteed relocation/work authorization, an invented phone number, or a city-level location.

### S12 — Escrow contribution and availability

- **Question:** What is Escrow, what did Favour build, and can I try it online?
- **Expected document IDs:** `project-escrow`.
- **Required facts:** Independent learning project on Ethereum Sepolia; Favour built both the React frontend and Solidity contract; depositor, beneficiary, and arbiter payment flow; arbiter can release or refund funds; frontend not deployed; repository https://github.com/faelic/escrow-webapp.
- **Unsupported claims to avoid:** A deployed frontend, mainnet production use, a regulated escrow service, or detailed mechanics beyond the approved summary.

## Cross-topic cases

### M01 — Backend skills supported by project evidence

- **Question:** Which backend skills does Favour list, and how does Monierave demonstrate them?
- **Expected document IDs:** `expertise-engineering`, `project-monierave`.
- **Required facts:** Go/PostgreSQL/Redis/Asynq and API/authentication/transaction/background-job areas; connect them to ledger, idempotency, locks, outbox, revocable sessions and tests in Monierave; preserve simulation scope.
- **Unsupported claims to avoid:** Extrapolated production banking employment or throughput claims.

### M02 — AI product contribution versus portfolio plans

- **Question:** Compare Favour's AI-related work on Policy.ng with his planned portfolio assistant and current learning.
- **Expected document IDs:** `experience-flamong-policy-ng`, `portfolio-assistant-status`, `expertise-engineering`.
- **Required facts:** Policy.ng frontend integration of AI-assisted questions, with underlying AI/backend responsibilities separate; portfolio assistant is Favour's first AI application project, currently at knowledge-base preparation, planned and unavailable; intended curated RAG knowledge; ongoing agentic learning.
- **Unsupported claims to avoid:** Conflating the two products or attributing Policy.ng's AI backend to Favour.

### M03 — Two blockchain applications with different limits

- **Question:** How do BucketFlow and Approval Cleanup differ, and what limitations should a visitor understand?
- **Expected document IDs:** `project-bucketflow`, `project-approval-cleanup`.
- **Required facts:** USDC bucket allocation versus ERC-20 allowance review/update/revocation; BucketFlow's Sepolia demonstration and savings cooldown; Approval Cleanup's recent scan window, provider constraints, and non-standard-token limitations.
- **Unsupported claims to avoid:** Regulated savings, guaranteed wallet security, or complete approval history.

### M04 — Frontend experience and training

- **Question:** What practical frontend work and training support Favour's interest in frontend opportunities, and how can I reach him?
- **Expected document IDs:** `experience-flamong-policy-ng`, `education-training`, `opportunities-contact`.
- **Required facts:** Policy.ng public/admin React and TypeScript interfaces, API integration and selected testing; Alchemy University's relevant training; worldwide frontend opportunities and supplied email.
- **Unsupported claims to avoid:** Invented total years of experience, education dates beyond the approved year ranges, or an unlisted credential.

## Visitor lookup and referrals

### V01 — Project described without its name

- **Question:** Which of his projects deals with banking transfers and avoiding duplicate payments?
- **Expected document IDs:** `project-monierave`.
- **Required facts:** Identify Monierave; independent banking simulation; idempotency and transaction correctness in a brief explanation; provide https://github.com/faelic/monierave when offering further exploration.
- **Unsupported claims to avoid:** Presenting it as a licensed bank, handling real customer funds, or referring to an unrelated project based only on a shared topic label.

### V02 — Cleanup aliases and links

- **Question:** Are Cleanup and Allowance Cleanup the same project? Where can I try it and see the code?
- **Expected document IDs:** `project-approval-cleanup`.
- **Required facts:** Both names refer to Approval Cleanup, the preferred main name; ERC-20 allowance review/update/revocation; application https://approval-cleanup-brt3.vercel.app/; repository https://github.com/faelic/approval-cleanup; preserve limited scan coverage if describing capability.
- **Unsupported claims to avoid:** Treating the names as separate projects, a complete-history guarantee, or claiming the application was just tested online.

### V03 — Public location and ways to connect

- **Question:** Where does Favour live, and where can I find his public profiles or email him?
- **Expected document IDs:** `opportunities-contact`.
- **Required facts:** Nigeria, without a city; Gmail `ututufavour7@gmail.com`; GitHub https://github.com/faelic; LinkedIn https://www.linkedin.com/in/favour-ututu/; X https://x.com/FavDeFi.
- **Unsupported claims to avoid:** City-level residence, extra contact details, or replacing approved destinations with guessed handles.

### V04 — Detailed implementation referral

- **Question:** What exact SQL isolation level and account-locking order does Monierave use, and where can I read the implementation?
- **Expected document IDs:** `project-monierave`.
- **Required facts:** The corpus supports PostgreSQL transactions and row-level locks but does not specify the exact isolation level or lock order; give that supported context briefly and refer to https://github.com/faelic/monierave.
- **Unsupported claims to avoid:** Inventing an isolation level or lock sequence, claiming to have inspected the code, or promising a specific README section without evidence.

## Missing-information and partial-answer cases

### U01 — Escrow implementation

- **Question:** What algorithm does Escrow use to decide disputes, and where can I try the deployed app?
- **Expected document IDs:** `project-escrow` (partial answer; no dispute-decision algorithm supplied).
- **Required facts:** Approved summary says the arbiter can release or refund funds, but no algorithm for deciding disputes is documented; frontend is not deployed; provide https://github.com/faelic/escrow-webapp for further exploration.
- **Unsupported claims to avoid:** Inventing automated dispute resolution, claiming knowledge of the arbiter's decision process, or fabricating a live application URL.

### U02 — Employment chronology

- **Question:** What month and year did Favour join Flamong, and exactly how many years of professional experience does he have?
- **Expected document IDs:** `experience-flamong-policy-ng` (partial answer; total career chronology remains unknown).
- **Required facts:** Favour joined Flamong in May 2026 and remains a Frontend Developer Intern as confirmed on 10 November 2026; the corpus does not establish enough chronology to calculate total years of professional experience.
- **Unsupported claims to avoid:** Treating May 2026 as the start of his entire career, importing unconfirmed independent-project dates, or calculating total professional experience from a file timestamp.

### U03 — Independent security assurance

- **Question:** Which independent firm audited BucketFlow's contracts, and what did its audit report conclude?
- **Expected document IDs:** `project-bucketflow` (context only; no audit evidence).
- **Required facts:** The source describes a Sepolia demonstration and its contract behavior but supplies no independent auditor or audit report.
- **Unsupported claims to avoid:** Named audit firms, invented findings, security guarantees, or claiming an audit never happened merely because the source lacks one.
