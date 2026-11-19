# Source map and evidence gaps

## Source integrity and scope

The original factual source is [the archived portfolio knowledge](sources/original-portfolio-knowledge.md), originally named `rag/knowledge/faour ututu portfolio knowledge.md`. Its 168 lines and 15,023 bytes remain preserved byte-for-byte. The corpus now also uses [individually confirmed portfolio details](sources/confirmed-portfolio-details.md), supplied by Favour on 10 and 11 November 2026.

SHA-256: `83d70cd06ce32fb461a34a55bbd19377c537dd393c6b04444b4d6a809def1538`.

The topic documents reorganize supplied claims and apply owner-confirmed corrections; they do not independently verify them. Local repository content was used to propose missing details, which Favour then confirmed individually. Only those explicit confirmations were incorporated. The original source has no reliable as-of date; the supplemental source dates only the specific owner confirmations it records.

## Section coverage

Line ranges refer to the immutable archive. Parent headings are included so the full original hierarchy is accounted for. Every nonempty source section is represented below. The correction table that follows records the newer AI experience wording and other individually approved additions.

| Original section or field | Source lines | Destination and treatment |
|---|---|---|
| Identity, Software Engineer title, professional focus, other work | 1–6 | [Overview](knowledge/profile/overview.md): preserve full name, positioning, and work areas. |
| Identity preamble email | 7 | [Availability and contact](knowledge/opportunities/availability-and-contact.md): consolidate with the repeated closing email. |
| About Favour | 9–15 | [Overview](knowledge/profile/overview.md): retain biography, core tools, brief project examples, Flamong frontend role, applied AI project work and current full-stack/AI positioning under the 11 November correction. Detailed explanations belong to the topic documents. |
| In Favour's words | 17–33 | Parent grouping becomes [perspective and interests](knowledge/profile/engineering-perspective-and-interests.md). |
| In Favour's words > How I think about engineering | 19–27 | [Perspective](knowledge/profile/engineering-perspective-and-interests.md): preserve first-person perspective with narrow owner-approved wording edits on 11 November 2026, including frontend beginnings, interface performance, security, AI safety, release discipline, tool access, approvals, and unexpected agent behavior. |
| In Favour's words > What I enjoy | 29–33 | [Interests](knowledge/profile/engineering-perspective-and-interests.md): preserve first-person perspective with narrow owner-approved wording edits on 11 November 2026, including LLM experimentation and video games. |
| What Favour works on | 35–65 | Parent grouping is consolidated with technical skills in [expertise](knowledge/expertise/engineering-and-technical-skills.md); detailed project examples move to their principal documents. |
| What Favour works on > Backend engineering | 37–43 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): retain backend areas and tools. [Monierave](knowledge/projects/monierave.md): retain repeated-request idempotency, locks, double-entry records, durable outbox, worker retries without a shared database/queue transaction, rotating tokens, session revocation, audits, reconciliation, and simulation scope. |
| What Favour works on > Frontend engineering | 45–51 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): retain interface types and tools. [Policy.ng](knowledge/experience/flamong-policy-ng.md): preserve React Hook Form/Zod, authentication, permissions, post-action state updates, failure handling without lost work, and testing. [BlockScan](knowledge/projects/blockscan.md): preserve live-data updates that avoid overwriting valid information, route loading, watchlist, and accessible search. |
| What Favour works on > AI engineering | 53–59 | [Expertise](knowledge/expertise/engineering-and-technical-skills.md): preserve AI application practice, document preparation, retrieval stages, prompts, evaluation, and the owner-approved applied AI project description. [Assistant status](knowledge/portfolio/assistant-status.md): retain availability and visitor purpose, superseding obsolete status through the 11 November confirmation; implementation evidence lives in the new RAG project document. |
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
| Technical skills > AI application engineering | 144 | [Expertise: AI](knowledge/expertise/engineering-and-technical-skills.md#ai-application-engineering): retain supported LLM/RAG implementation areas and add Python and implemented tools. Learning-only agentic and reranking topics are omitted from current visitor-facing capabilities under the approved correction. |
| Technical skills > Testing and delivery | 146 | [Expertise: testing and delivery](knowledge/expertise/engineering-and-technical-skills.md#testing-and-delivery): retain every tool and delivery practice. |
| Technical skills > Blockchain | 148 | [Expertise: blockchain](knowledge/expertise/engineering-and-technical-skills.md#blockchain-engineering): retain every tool. Merge the equivalent tool list from “What Favour works on.” |
| Education and training | 150–156 | [Education](knowledge/education/education-and-training.md): preserve the institution and degree wording, Alchemy training content, and completed Cyfrin training. Do not infer dates or certifications. |
| Portfolio AI assistant | 158–162 | [Assistant status](knowledge/portfolio/assistant-status.md): preserve the website URL and visitor workflow, update availability from the owner confirmation, and describe supported question areas including the Python RAG project. |
| Professional opportunities | 164–168 | [Availability and contact](knowledge/opportunities/availability-and-contact.md): preserve worldwide availability, four engineering role areas, application/backend and AI-product interests, and email. |

## Consolidation and isolated-section review

Original facts and qualifications are retained in the mapped destinations except where explicitly superseded by the owner confirmations below. Current positioning and implemented work follow the 11 November correction. Historical first-application statements remain only in excluded source records; the corpus does not infer multiple AI applications. Repeated prose is consolidated where it describes the same evidence. The overview keeps short project descriptions to answer broad biography questions; expertise keeps brief examples. The first-person passages retain attribution and receive narrow owner-approved wording updates and express personal perspective rather than proof of deployed AI applications.

Project sections name their subject through body text or heading context. Monierave and BucketFlow overviews state their simulation/test-network scope; Approval Cleanup's overview and processing sections repeat the limited coverage where it qualifies scan results. Policy.ng's responsibility section explicitly separates frontend integration from underlying AI and backend services. Future chunking must retain these boundaries, as specified in the data contract.

## Owner-confirmed additions and corrections

All entries below refer to sections of [the confirmation record](sources/confirmed-portfolio-details.md), with original confirmations dated 10 November 2026 and education/development-history additions dated 11 November 2026. Existing document IDs and all source references are preserved. Every document now uses `category` for folder grouping and one `provenance` list containing `path` and `sections` entries. Amended documents list both contributing records; Escrow and the new RAG project cite the confirmation record. The original archive remains immutable; current documents apply the explicitly approved corrections.

| Confirmation section | Approved information | Destination and treatment |
|---|---|---|
| Current role and start date | Frontend Developer Intern at Flamong, working on Policy.ng; May 2026–Present | [Experience](knowledge/experience/flamong-policy-ng.md): add the employment period and owner-confirmation date. Total career duration remains unknown. |
| Escrow | Independent Sepolia payment project; React frontend and Solidity contract built by Favour; depositor/beneficiary/arbiter flow; arbiter release/refund; frontend not deployed; confirmed GitHub repository | New [Escrow document](knowledge/projects/escrow.md) and a short example in [overview](knowledge/profile/overview.md). Add no unconfirmed contract mechanics or deployment URL. |
| Professional opportunities | Full-time and freelance/contract work; frontend, backend, full-stack, and AI engineering; worldwide interest; remote work and discussing relocation | [Opportunities](knowledge/opportunities/availability-and-contact.md): expand hiring preferences with the confirmation date; do not infer work authorization. |
| Public location | Resides in Nigeria; no city-level location approved | [Overview](knowledge/profile/overview.md) and [opportunities](knowledge/opportunities/availability-and-contact.md): share the country only. No city imported from the website. |
| Project links and names | BlockScan and Approval Cleanup application/repository links; Escrow repository; Approval Cleanup is the main name, with Cleanup and Allowance Cleanup as aliases | Relevant project documents: add the confirmed URLs and approved aliases. Escrow's repository is also recorded under its own confirmation section. No link-uptime or README-completeness verification is claimed. |
| Public contact | Gmail, GitHub, LinkedIn, and X destinations approved for sharing | [Contact](knowledge/opportunities/availability-and-contact.md): preserve the existing email and add the confirmed profiles. |
| AI application experience | The portfolio assistant is Favour's first AI application project | [Overview](knowledge/profile/overview.md), [expertise](knowledge/expertise/engineering-and-technical-skills.md), and [assistant status](knowledge/portfolio/assistant-status.md): replace wording implying multiple built AI applications; retain the historical confirmation in sources; current corpus framing and status are superseded by the 11 November correction below. |
| Education dates | Confirmed 11 November 2026: university 2018–2025; Alchemy frontend training 2025–2026 | [Education](knowledge/education/education-and-training.md): add approved year ranges; [overview](knowledge/profile/overview.md): include the training period in the career narrative. |
| Development beginnings | Confirmed 11 November 2026: self-directed learning and freelance development work before structured Alchemy training | [Overview](knowledge/profile/overview.md): add the approved paragraph without inventing earlier dates, clients, or project details. |
| Source approval and visitor scope | Confirm each extra portfolio detail individually; answer visitor questions concisely and direct deeper implementation questions to GitHub | Data contract and README: document curation and referral rules outside the corpus. [Assistant status](knowledge/portfolio/assistant-status.md): describe the intended visitor-facing purpose. |

## Current positioning and AI project correction — 11 November 2026

The confirmation section **Professional positioning and portfolio RAG implementation** supplies the approved replacement wording and implementation summary:

| Approved correction | Destination and treatment |
|---|---|
| Full-stack Software Engineer and AI Engineer; Python and applied AI work | [Overview](knowledge/profile/overview.md) and [expertise](knowledge/expertise/engineering-and-technical-skills.md): establish professional identity and connect capabilities to implemented work. |
| Portfolio RAG Assistant implementation | New [project](knowledge/projects/portfolio-rag-assistant.md), stable ID `project-portfolio-rag-assistant`: contribution, stack, retrieval, evaluation, Gradio interfaces, approved repository, and limitations. |
| Owner-confirmed public availability | [Assistant status](knowledge/portfolio/assistant-status.md): availability and visitor-question/knowledge/GitHub relationship. No independent uptime or original launch date is inferred. |
| Remove learner and first-application positioning | Overview, expertise, perspective, Escrow, and Monierave: narrow approved edits; historical education/development beginnings and project limitations survive. Historical source entries remain excluded from ingestion. |
| Updated retrieval labels | JSONL remains 50 cases with stable IDs and category/answerability counts; affected references, exact quotes, and section labels follow the current corpus. The new project is covered by existing cases. |

The corpus now contains 13 documents. The first-person perspective is owner-approved edited wording rather than an unchanged transcription. Detailed project explanations remain in the principal project documents, with concise references in profile and expertise.

## Remaining evidence boundaries — excluded from the corpus

| Gap | Evidence boundary and handling |
|---|---|
| Employment chronology | Flamong's May 2026 start and current role are owner-confirmed. The start of Favour's entire professional career and exact total years of professional experience remain unspecified. |
| Education chronology and credentials | University years 2018–2025 and Alchemy frontend training years 2025–2026 are owner-confirmed. Exact months, grades, Cyfrin dates, and additional certification details remain unspecified. Completed training does not establish an additional credential. |
| Detailed implementation beyond approved summaries | The corpus supports project purpose, contribution, stack, selected features, and limitations. For unrecorded mechanics, give the supported context and share the relevant confirmed repository. Do not infer that a particular README section exists. |
| Work authorization and hiring logistics | Worldwide interest, remote work, and openness to discussing relocation are confirmed. Salary expectations, notice period, work authorization, and relocation eligibility were not supplied. |
| Outcome and assurance evidence | No quantified business outcomes, production scale, or independent security audit results are supplied. Technical implementation claims do not establish those outcomes. |
| Currency of mutable claims | Employment, opportunities, public location, and selected links were confirmed on 10 November 2026; revised positioning, AI implementation, and public assistant availability were confirmed on 11 November 2026. Other original claims remain undated. Confirmation does not establish indefinite freshness or external uptime. |

Close remaining gaps only through individually approved evidence. Missing-information and partial-answer evaluation cases exercise these limits. Escrow and Flamong's start date are now answerable; their old missing-information expectations have been updated.

## Evaluation-driven evidence boundaries — 19 November 2026

Six documents (education, professional overview, BlockScan, Monierave, BucketFlow, and Portfolio RAG Assistant) now explicitly state existing evidence limits after the AI-assisted diagnostic runs. Their provenance points to the new section in the confirmation record. These are AI-authored clarifications under the owner’s correction request, not newly verified personal or production facts. Original benchmark questions, reference answers, and evidence labels remain unchanged.
