# Source map and evidence gaps

## Source integrity and scope

The original factual source is [the archived portfolio knowledge](sources/original-portfolio-knowledge.md), originally named `rag/knowledge/faour ututu portfolio knowledge.md`. Its 168 lines and 15,023 bytes remain preserved byte-for-byte. The corpus now also uses [individually confirmed portfolio details](sources/confirmed-portfolio-details.md), supplied by Favour on 10 November 2026.

SHA-256: `83d70cd06ce32fb461a34a55bbd19377c537dd393c6b04444b4d6a809def1538`.

The topic documents reorganize supplied claims and apply owner-confirmed corrections; they do not independently verify them. Local repository content was used to propose missing details, which Favour then confirmed individually. Only those explicit confirmations were incorporated. The original source has no reliable as-of date; the supplemental source dates only the specific owner confirmations it records.

## Section coverage

Line ranges refer to the immutable archive. Parent headings are included so the full original hierarchy is accounted for. Every nonempty source section is represented below. The correction table that follows records the newer AI experience wording and other individually approved additions.

| Original section or field | Source lines | Destination and treatment |
|---|---|---|
| Identity, Software Engineer title, professional focus, other work | 1–6 | [Overview](knowledge/profile/overview.md): preserve full name, positioning, and work areas. |
| Identity preamble email | 7 | [Availability and contact](knowledge/opportunities/availability-and-contact.md): consolidate with the repeated closing email. |
| About Favour | 9–15 | [Overview](knowledge/profile/overview.md): retain biography, core tools, brief project examples, Flamong frontend role, AI interests, and ongoing agentic learning. Detailed explanations belong to the topic documents. |
| In Favour's words | 17–33 | Parent grouping becomes [perspective and interests](knowledge/profile/engineering-perspective-and-interests.md). |
| In Favour's words > How I think about engineering | 19–27 | [Perspective](knowledge/profile/engineering-perspective-and-interests.md): preserve the first-person paragraphs verbatim, including frontend beginnings, interface performance, security, AI safety, release discipline, tool access, approvals, and unexpected agent behavior. |
| In Favour's words > What I enjoy | 29–33 | [Interests](knowledge/profile/engineering-perspective-and-interests.md): preserve the first-person paragraphs verbatim, including LLM experimentation and video games. |
| What Favour works on | 35–65 | Parent grouping is consolidated with technical skills in [expertise](knowledge/expertise/engineering-and-technical-skills.md); detailed project examples move to their principal documents. |
| What Favour works on > Backend engineering | 37–43 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): retain backend areas and tools. [Monierave](knowledge/projects/monierave.md): retain repeated-request idempotency, locks, double-entry records, durable outbox, worker retries without a shared database/queue transaction, rotating tokens, session revocation, audits, reconciliation, and simulation scope. |
| What Favour works on > Frontend engineering | 45–51 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): retain interface types and tools. [Policy.ng](knowledge/experience/flamong-policy-ng.md): preserve React Hook Form/Zod, authentication, permissions, post-action state updates, failure handling without lost work, and testing. [BlockScan](knowledge/projects/blockscan.md): preserve live-data updates that avoid overwriting valid information, route loading, watchlist, and accessible search. |
| What Favour works on > AI engineering | 53–59 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): preserve AI application practice, document preparation, retrieval stages, prompts, evaluation, and ongoing agentic learning. [Assistant status](knowledge/portfolio/assistant-status.md): consolidate planned purpose and not-implemented status. |
| What Favour works on > Blockchain engineering | 61–65 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): preserve Solidity/Ethereum work, wallet and network mismatch handling, approvals, events, receipts, RPC data, tools, and the BucketFlow/Approval Cleanup examples. |
| Professional experience | 67–82 | Parent grouping becomes [Flamong / Policy.ng](knowledge/experience/flamong-policy-ng.md). |
| Professional experience > Flamong — Frontend Developer Intern | 69–82 | [Flamong / Policy.ng](knowledge/experience/flamong-policy-ng.md): preserve title, product URL and purpose, sole frontend role, public/admin workflows, backend collaboration, nested replies, validation, duplicate-submission protection, unsaved-edit warnings, refreshed state, selected tests, and collaboration roles. Preserve the explicit separation from backend and underlying AI ownership. |
| Independent projects | 84–136 | Parent grouping supplies the four original documents in `knowledge/projects/`; Escrow is added separately from owner-confirmed information below. |
| Independent projects > Monierave — Full-stack banking simulation | 86–101 | [Monierave](knowledge/projects/monierave.md): preserve type, both URLs, complete stack, registration/verification, authentication, accounts, beneficiaries, transfers, history, statements, profile/security, ledger, transactions, locks, idempotency, backend rules, outbox/Redis/Asynq, sessions, audits, reconciliation, frontend forms/server data, backend/integration/end-to-end/concurrency tests, and real-money limitation. |
| Independent projects > BucketFlow — Stablecoin allocation application | 103–114 | [BucketFlow](knowledge/projects/bucketflow.md): preserve type, both URLs, full stack, full-deposit USDC allocation, interface/vault contribution, approvals, deposits, receipts, balances, withdrawals, pending versus confirmed states, savings cooldown, Sepolia scope, and non-regulated demonstration status. |
| Independent projects > BlockScan — Sepolia blockchain explorer | 116–125 | [BlockScan](knowledge/projects/blockscan.md): preserve type, full stack, Sepolia, blocks/transactions/addresses/activity/NFTs, typed search, non-overlapping requests, duplicate prevention, retained results after refresh failures, hidden-page polling behavior, persistent watchlist, keyboard access, route splitting, and server-side Alchemy credential protection. No absent URLs are supplied. |
| Independent projects > Approval Cleanup — ERC-20 wallet-permission manager | 127–136 | [Approval Cleanup](knowledge/projects/approval-cleanup.md): preserve type, full stack, recent Approval events, latest observed token/spender allowances, unlimited/older approvals, RPC-limited batches, separate normalization/risk checks, wallet updates/revocation, recent-window incompleteness, non-standard tokens, and provider constraints. |
| Technical skills | 138–148 | Consolidated by domain into [expertise](knowledge/expertise/engineering-and-technical-skills.md), with all five original skill groups retained. |
| Technical skills > Backend and data | 140 | [Expertise: backend](knowledge/expertise/engineering-and-technical-skills.md#backend-engineering-and-data): retain all listed tools and concepts, including SQL, REST APIs, concurrency control, and transactional outbox. |
| Technical skills > Frontend | 142 | [Expertise: frontend](knowledge/expertise/engineering-and-technical-skills.md#frontend-engineering): retain all items, including Vite, React Router, Wouter, Radix UI, accessibility, and client/server state management. |
| Technical skills > AI application engineering | 144 | [Expertise: AI](knowledge/expertise/engineering-and-technical-skills.md#ai-application-engineering-and-ongoing-learning): retain LLMs, RAG, ingestion, chunking, embeddings, vector databases, semantic search, retrieval, reranking, context construction, grounded generation, evaluation, and the agentic-learning qualification. |
| Technical skills > Testing and delivery | 146 | [Expertise: testing and delivery](knowledge/expertise/engineering-and-technical-skills.md#testing-and-delivery): retain every tool and delivery practice. |
| Technical skills > Blockchain | 148 | [Expertise: blockchain](knowledge/expertise/engineering-and-technical-skills.md#blockchain-engineering): retain every tool. Merge the equivalent tool list from “What Favour works on.” |
| Education and training | 150–156 | [Education](knowledge/education/education-and-training.md): preserve the institution and degree wording, Alchemy training content, and completed Cyfrin training. Do not infer dates or certifications. |
| Portfolio AI assistant | 158–162 | [Assistant status](knowledge/portfolio/assistant-status.md): preserve website URL, planned/unavailable status, intended RAG knowledge, and all four example question areas. |
| Professional opportunities | 164–168 | [Availability and contact](knowledge/opportunities/availability-and-contact.md): preserve worldwide availability, four engineering role areas, application/backend and AI-product interests, and email. |

## Consolidation and isolated-section review

Original facts and qualifications are retained in the mapped destinations except where explicitly superseded by the owner confirmations below. In particular, broad original wording implying multiple AI applications has been corrected: the portfolio assistant is Favour's first AI application project. Repeated prose is consolidated where it describes the same evidence. The overview keeps short project descriptions to answer broad biography questions; expertise keeps brief examples. The original first-person passages remain unchanged beneath attributed headings and express personal perspective rather than proof of deployed AI applications.

Project sections name their subject through body text or heading context. Monierave and BucketFlow overviews state their simulation/test-network scope; Approval Cleanup's overview and processing sections repeat the limited coverage where it qualifies scan results. Policy.ng's responsibility section explicitly separates frontend integration from underlying AI and backend services. Future chunking must retain these boundaries, as specified in the data contract.

## Owner-confirmed additions and corrections

All entries below refer to sections of [the confirmation record](sources/confirmed-portfolio-details.md), dated 10 November 2026. Existing topic IDs and primary archive references are preserved; amended documents identify this additional source in frontmatter. Escrow uses the confirmation record as its primary source.

| Confirmation section | Approved information | Destination and treatment |
|---|---|---|
| Current role and start date | Frontend Developer Intern at Flamong, working on Policy.ng; May 2026–Present | [Experience](knowledge/experience/flamong-policy-ng.md): add the employment period and owner-confirmation date. Total career duration remains unknown. |
| Escrow | Independent Sepolia learning project; React frontend and Solidity contract built by Favour; depositor/beneficiary/arbiter flow; arbiter release/refund; frontend not deployed; confirmed GitHub repository | New [Escrow document](knowledge/projects/escrow.md) and a short example in [overview](knowledge/profile/overview.md). Add no unconfirmed contract mechanics or deployment URL. |
| Professional opportunities | Full-time and freelance/contract work; frontend, backend, full-stack, and AI engineering; worldwide interest; remote work and discussing relocation | [Opportunities](knowledge/opportunities/availability-and-contact.md): expand hiring preferences with the confirmation date; do not infer work authorization. |
| Public location | Resides in Nigeria; no city-level location approved | [Overview](knowledge/profile/overview.md) and [opportunities](knowledge/opportunities/availability-and-contact.md): share the country only. No city imported from the website. |
| Project links and names | BlockScan and Approval Cleanup application/repository links; Escrow repository; Approval Cleanup is the main name, with Cleanup and Allowance Cleanup as aliases | Relevant project documents: add the confirmed URLs and approved aliases. Escrow's repository is also recorded under its own confirmation section. No link-uptime or README-completeness verification is claimed. |
| Public contact | Gmail, GitHub, LinkedIn, and X destinations approved for sharing | [Contact](knowledge/opportunities/availability-and-contact.md): preserve the existing email and add the confirmed profiles. |
| AI application experience | The portfolio assistant is Favour's first AI application project | [Overview](knowledge/profile/overview.md), [expertise](knowledge/expertise/engineering-and-technical-skills.md), and [assistant status](knowledge/portfolio/assistant-status.md): replace wording implying multiple built AI applications; retain current AI focus/learning topics and the not-implemented status. |
| Source approval and visitor scope | Confirm each extra portfolio detail individually; answer visitor questions concisely and direct deeper implementation questions to GitHub | Data contract and README: document curation and referral rules outside the corpus. [Assistant status](knowledge/portfolio/assistant-status.md): describe the intended visitor-facing purpose. |

## Remaining evidence boundaries — excluded from the corpus

| Gap | Evidence boundary and handling |
|---|---|
| Employment chronology | Flamong's May 2026 start and current role are owner-confirmed. The start of Favour's entire professional career and exact total years of professional experience remain unspecified. |
| Education chronology and credentials | No education dates, grades, or formal Alchemy/Cyfrin certification details are supplied. Completed training does not establish an additional credential. |
| Detailed implementation beyond approved summaries | The corpus supports project purpose, contribution, stack, selected features, and limitations. For unrecorded mechanics, give the supported context and share the relevant confirmed repository. Do not infer that a particular README section exists. |
| Work authorization and hiring logistics | Worldwide interest, remote work, and openness to discussing relocation are confirmed. Salary expectations, notice period, work authorization, and relocation eligibility were not supplied. |
| Outcome and assurance evidence | No quantified business outcomes, production scale, or independent security audit results are supplied. Technical implementation claims do not establish those outcomes. |
| Currency of mutable claims | Specific employment, opportunities, public location, links, and AI project status statements were owner-confirmed on 10 November 2026. Other original claims remain undated. Confirmation does not establish indefinite freshness or external uptime. |

Close remaining gaps only through individually approved evidence. Missing-information and partial-answer evaluation cases exercise these limits. Escrow and Flamong's start date are now answerable; their old missing-information expectations have been updated.
