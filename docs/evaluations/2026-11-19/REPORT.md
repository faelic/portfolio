# Portfolio assistant — 28-response AI-assisted evaluation

Evaluation documented: 19 November 2026. **AI-assisted evaluation; not personally graded by Favour and not independent human validation.**

## Method

Ran the existing local streaming answering pipeline with real provider calls, using the packaged production knowledge index. No ingestion, prompt tuning, reranking, application deployment, or runtime changes were made. The 20 baseline cases ran first, followed by all eight held-out cases. Original answers were retained without retries to replace unfavorable answers.

The sample is the first 20 baseline cases in existing file order plus all eight held-out cases, not a randomized or representative quality estimate. Baseline categories are direct_fact (8, including one unanswerable), temporal (7), and comparative (5). Conversation and adversarial suites were not run. The held-out fixtures were pre-existing and visible to the reviewer; this is not a newly blind holdout experiment.

Codex read every generated answer and assessed it against the recorded question/history, expected behavior, original source documents, and bounded reference metadata. The frozen corpus is in source-evidence.json. Exact full selected context was not separately captured; the raw reports preserve bounded references and excerpts, so source support must not be equated with verified claim-level citation or entailment.

The exact reviewer runtime model identifier is not available in this record. These are direct coding-assistant judgments, not results of the separate gpt-4.1-mini judge tool. No additional judge API calls were made. The answer model is gpt-4.1-mini; embeddings use text-embedding-3-large; retrieval k=10. Raw reports record revision, dirty-tree state, prompt/dataset/code fingerprints and packaged-index hashes. A dirty tree includes documentation changes; no pipeline change was made between suites.

This exercise bypasses the deployed HTTP API. It does not test hosted rate limits, cookies, concurrency, production latency, or browser rendering. Owner evaluation makes paid calls outside the public-chat spending ledger. Recorded answer usage, where present, excludes embeddings and follow-up rewriting and is not a complete bill.

## Fixed rubric and verdict rule

| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Factual support | Material unsupported/false core claim | Minor unsupported detail or overstatement | Claims supported by the source, including clearly justified design inferences |
| Completeness | Misses the main request | Omits a required part or qualification | Answers all essential parts |
| Relevance and clarity | Largely irrelevant or misleading | Verbose, repetitive, or imprecise | Direct and clear |
| Uncertainty and boundaries | Invents unknown facts or asserts an unsupported guarantee | Incomplete qualification | Appropriate limits and uncertainty |

Strict pass: support=2, completeness=2, boundaries=2, relevance>=1. Stylistic verbosity alone does not fail an otherwise adequate answer. Missing an explicitly requested evidence boundary does. Scores are ordinal reviewer judgments, not calibrated probabilities. No composite score or unsupported-claim rate is reported; atomic claim counts were not annotated. A reasonable human reviewer may disagree with the strict failure on an implicit rather than explicit premise correction (eval-019).

No individual reference-precision score is assigned: supporting sources are inspected, but the returned reference batch contains additional documents and is not a claim-level citation system. Verified registered destinations do not prove answer correctness.

## Observed results

- Actual responses: **28/28 completed**, zero generation failures.
- AI-assisted strict verdicts: **22/28 pass (78.6%); 6/28 fail**.
- Baseline: **17/20** pass; held-out: **5/8** pass. Human-reviewed: **0**.
- Baseline retrieval: MRR@10=1.0, section evidence coverage@10=1.0, labelled-quote coverage@10=1.0 across 19 eligible cases; one unanswerable case excluded. This is this sample only, not full-benchmark accuracy. Held-out cases have no comparable authored retrieval labels.

Perfect sampled retrieval scores coexisted with answer failures. This is evidence that retrieving expected sections is insufficient to establish answer quality; it is not evidence that a reranker would fix these failures.

| Local pipeline timing | Samples | Median ms | p95 ms |
|---|---:|---:|---:|
| retrieval_ms | 28 | 602.6 | 1823.1 |
| first_text_ms | 28 | 1294.9 | 2435.0 |
| completion_ms | 28 | 2334.5 | 6221.2 |

Times are application-instrumented local pipeline observations with real external provider networking, not hosted browser latency or a controlled before/after speed improvement. p95 uses nearest rank and has only 28 observations.

## Failure analysis and next experiments

| Case | Failure | Candidate change, not yet implemented or validated |
|---|---|---|
| eval-004 | Unsupported present enrollment status | Require dated wording and avoid inferring current enrollment from a year range |
| eval-015 | Missing explicit unknown freelance start date | State missing date before providing the supported relative sequence |
| eval-019 | False database-credential premise not explicitly corrected | Correct the mistaken credential type in the opening sentence |
| heldout-002 | Unsupported current zero paying-customer count | Distinguish missing metrics from evidence of zero |
| heldout-003 | Overstated duplicate-prevention guarantees | Separate idempotency, atomicity, locking and outbox roles; qualify documented design |
| heldout-008 | Evaluation tooling confused with measured accuracy | Lead with absence of a verified quality figure; distinguish tests from proof |

These changes are hypotheses. This record establishes a first AI-assisted diagnostic baseline, not quality uplift, reviewer agreement, reduced evaluation time, or cost savings. If these cases guide tuning, retain them as development cases and create fresh validation cases. Any human validation must record actual human decisions separately.

## Score register

| Case | Support | Complete | Relevant/clear | Boundaries | AI verdict |
|---|---:|---:|---:|---:|---|
| eval-001 | 2 | 2 | 2 | 2 | pass |
| eval-002 | 2 | 2 | 1 | 2 | pass |
| eval-003 | 2 | 2 | 2 | 2 | pass |
| eval-004 | 1 | 2 | 2 | 1 | fail |
| eval-005 | 2 | 2 | 2 | 2 | pass |
| eval-006 | 2 | 2 | 2 | 2 | pass |
| eval-007 | 2 | 2 | 2 | 2 | pass |
| eval-008 | 2 | 2 | 2 | 2 | pass |
| eval-009 | 2 | 2 | 2 | 2 | pass |
| eval-010 | 2 | 2 | 2 | 2 | pass |
| eval-011 | 2 | 2 | 2 | 2 | pass |
| eval-012 | 2 | 2 | 2 | 2 | pass |
| eval-013 | 2 | 2 | 2 | 2 | pass |
| eval-014 | 2 | 2 | 2 | 2 | pass |
| eval-015 | 2 | 1 | 2 | 1 | fail |
| eval-016 | 2 | 2 | 1 | 2 | pass |
| eval-017 | 2 | 2 | 2 | 2 | pass |
| eval-018 | 2 | 2 | 2 | 2 | pass |
| eval-019 | 2 | 1 | 1 | 2 | fail |
| eval-020 | 2 | 2 | 2 | 2 | pass |
| heldout-001 | 2 | 2 | 2 | 2 | pass |
| heldout-002 | 0 | 1 | 2 | 0 | fail |
| heldout-003 | 1 | 2 | 2 | 0 | fail |
| heldout-004 | 2 | 2 | 2 | 2 | pass |
| heldout-005 | 2 | 2 | 2 | 2 | pass |
| heldout-006 | 2 | 2 | 2 | 2 | pass |
| heldout-007 | 2 | 2 | 2 | 2 | pass |
| heldout-008 | 1 | 1 | 1 | 1 | fail |

## Preserved answers and written rationales

### eval-001

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Someone called the wallet-permission tool Cleanup and someone else called it Allowance Cleanup. What is its preferred name, and what is the correct code repository?

**Expected behavior/reference answer:** Both names refer to Approval Cleanup. Its code repository is https://github.com/faelic/approval-cleanup.

**Actual assistant answer, unchanged:**

> The preferred name for the wallet-permission tool is **Approval Cleanup**. It is also known as Cleanup or Allowance Cleanup, but "Approval Cleanup" is the primary name used.
>
> The correct code repository for Approval Cleanup is:  
> https://github.com/faelic/approval-cleanup
>
> This tool helps wallet owners review and manage ERC-20 token allowances granted to other addresses or contracts.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Names Approval Cleanup, resolves both aliases, and supplies the exact registered repository. The brief allowance description is supported. No deployment or security guarantee is added.

**Source evidence:**

- [projects/approval-cleanup.md](../../../rag/knowledge/projects/approval-cleanup.md), Preamble; Overview and contribution: “**Also known as:** Cleanup; Allowance Cleanup.” Repository is https://github.com/faelic/approval-cleanup; overview describes ERC-20 allowance review.

**Suggested correction/improvement:** Optional: omit the final tool description for an even shorter naming/link answer.

**Human review:** pending; no human score is inferred.

### eval-002

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** A visitor credits Favour with building Policy.ng's underlying AI service. What responsibility does the portfolio actually attribute to him?

**Expected behavior/reference answer:** His responsibility is frontend engineering, including integration of the AI-assisted question interface. Policy.ng's backend and underlying AI services are separate from that responsibility.

**Actual assistant answer, unchanged:**

> The portfolio attributes to Favour the responsibility for the frontend engineering of Policy.ng, including building and maintaining the public-facing pages and authenticated administration tools using React and TypeScript. This covers features like policy search, public-official directories, AI-assisted question interfaces, comments, moderation, content editing, and subscriber management. Importantly, his role includes integrating the AI-assisted question interface on the frontend, but the backend and the underlying AI services themselves are separate from his responsibility. So, he is not credited with building Policy.ng’s underlying AI service, only its frontend and the integration of that AI interface.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=1/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Correctly rejects attribution of the underlying AI service and explains frontend integration. The added feature inventory is supported but distracts from a narrow ownership question. This is a style issue rather than a factual failure.

**Source evidence:**

- [experience/flamong-policy-ng.md](../../../rag/knowledge/experience/flamong-policy-ng.md), Product and responsibility: “His responsibility at Policy.ng is the frontend, including the integration of its AI-assisted question interface. The product's backend and underlying AI services are separate from that frontend responsibility.”

**Suggested correction/improvement:** Lead with the ownership boundary and keep one example instead of listing the whole product.

**Human review:** pending; no human score is inferred.

### eval-003

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Which project lets someone return to saved wallet addresses and also inspect NFT metadata on a test network?

**Expected behavior/reference answer:** BlockScan, an Ethereum Sepolia explorer, supports NFT metadata inspection and a persistent watchlist.

**Actual assistant answer, unchanged:**

> The project that lets someone return to saved wallet addresses and also inspect NFT metadata on a test network is **BlockScan — Sepolia blockchain explorer**. It is a frontend application for Ethereum Sepolia that allows users to inspect blocks, transactions, wallet addresses, account activity, and NFT metadata. It also includes a persistent watchlist feature for saved addresses.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Identifies BlockScan and connects both requested features to its Sepolia scope. Does not imply mainnet coverage or independently verified uptime.

**Source evidence:**

- [projects/blockscan.md](../../../rag/knowledge/projects/blockscan.md), Overview; Navigation, watchlist, and credential handling: “For BlockScan, Favour also built a persistent watchlist, keyboard-accessible search, route-level code splitting, and Vercel API proxies that keep Alchemy credentials out of the browser bundle.” Overview identifies Ethereum Sepolia and NFT metadata inspection.

**Suggested correction/improvement:** None required for the question.

**Human review:** pending; no human score is inferred.

### eval-004

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: fail.**

**Question:** Was Favour's university degree in computer science? Name the institution and the degree field actually recorded.

**Expected behavior/reference answer:** The recorded degree is a BSc in Quantity Survey from Federal University of Technology Minna, rather than a computer science degree.

**Actual assistant answer, unchanged:**

> Favour's university degree is not in computer science. He is recorded as studying at the Federal University of Technology Minna, where he is pursuing a Bachelor of Science (BSc) degree in Quantity Survey from 2018 to 2025.

**AI scores:** factual_support=1/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=1/2.

**Written rationale — AI-authored:** Institution, field, and period are correct, but 'he is pursuing' adds an unsupported present-tense enrollment claim. A dated education period does not establish current enrollment. This is an unsupported temporal claim, not proof that graduation occurred.

**Source evidence:**

- [education/education-and-training.md](../../../rag/knowledge/education/education-and-training.md), University education: “**Federal University of Technology Minna — BSc in Quantity Survey**” Recorded period is 2018–2025; the source does not say he is currently pursuing this degree.

**Suggested correction/improvement:** Say 'The recorded degree field is BSc in Quantity Survey at Federal University of Technology Minna, with an education period of 2018–2025.'

**Human review:** pending; no human score is inferred.

### eval-005

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** What does Favour explicitly say he enjoys outside coding, without turning that interest into a professional credential?

**Expected behavior/reference answer:** He says he loves playing video games. The passage presents this as a personal interest, not a professional gaming credential.

**Actual assistant answer, unchanged:**

> Favour explicitly says that outside coding, he really enjoys playing video games. He describes it as one of his favorite things to do, without framing it as a professional credential.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Answers the hobby question directly and preserves the distinction between personal enjoyment and professional credentials.

**Source evidence:**

- [profile/engineering-perspective-and-interests.md](../../../rag/knowledge/profile/engineering-perspective-and-interests.md), Favour's interests — in his own words: “And I love playing video games. I really do. It's one of my favourite things to do outside coding.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-006

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Which provider credential does BlockScan keep out of the browser bundle, and what mechanism is named for doing so?

**Expected behavior/reference answer:** BlockScan uses Vercel API proxies to keep Alchemy credentials out of the browser bundle.

**Actual assistant answer, unchanged:**

> BlockScan keeps the Alchemy provider credential out of the browser bundle by using Vercel API proxies. This mechanism is named as "Vercel API proxies" for credential handling.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Names the Alchemy credential and the documented Vercel API proxy mechanism without introducing database credentials or an unrelated secret-management mechanism.

**Source evidence:**

- [projects/blockscan.md](../../../rag/knowledge/projects/blockscan.md), Navigation, watchlist, and credential handling: “Vercel API proxies that keep Alchemy credentials out of the browser bundle.”

**Suggested correction/improvement:** The second sentence can be removed because it repeats the first.

**Human review:** pending; no human score is inferred.

### eval-007

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Can I open a deployed frontend for the project with a depositor, beneficiary, and arbiter? Give the supported way to explore it.

**Expected behavior/reference answer:** That project is Escrow. Its frontend is not deployed; visitors can explore the code at https://github.com/faelic/escrow-webapp.

**Actual assistant answer, unchanged:**

> You cannot open a deployed frontend for the Escrow project with depositor, beneficiary, and arbiter roles because its frontend is not deployed. The supported way to explore it is by visiting the Escrow repository on GitHub at https://github.com/faelic/escrow-webapp, where you can review the React frontend code and Solidity smart contract implementation.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Recognizes Escrow from its roles, states the documented frontend limitation, and supplies the exact supported repository rather than inventing a live URL.

**Source evidence:**

- [projects/escrow.md](../../../rag/knowledge/projects/escrow.md), Availability and further exploration: “Escrow's frontend is not deployed.” Repository is https://github.com/faelic/escrow-webapp; the document records React frontend and Solidity contract contributions.

**Suggested correction/improvement:** None required; deployment status is source-based, not independently rechecked.

**Human review:** pending; no human score is inferred.

### eval-008

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** What phone number should I call to discuss a role with Favour?

**Expected behavior/reference answer:** The knowledge base does not provide a phone number, so I cannot supply one.

**Actual assistant answer, unchanged:**

> Favour does not publicly list a phone number for contact. To discuss a role with him, you should email him at ututufavour7@gmail.com.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Does not invent a phone number and offers the documented email. 'Does not publicly list' is interpreted in the portfolio knowledge context; this run did not search the wider web for a phone number.

**Source evidence:**

- [opportunities/availability-and-contact.md](../../../rag/knowledge/opportunities/availability-and-contact.md), Contact: “For opportunities or collaborations, visitors can email Favour at **[ututufavour7@gmail.com](mailto:ututufavour7@gmail.com)**.” No phone number is provided in the frozen 13-document corpus.

**Suggested correction/improvement:** Prefer 'The portfolio knowledge does not provide a phone number' to make the evidence scope explicit.

**Human review:** pending; no human score is inferred.

### eval-009

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** What are the documented beginning and ending years of Favour's university education, and which institution do those years belong to?

**Expected behavior/reference answer:** The university period is 2018–2025 at Federal University of Technology Minna.

**Actual assistant answer, unchanged:**

> Favour's documented university education at the Federal University of Technology Minna spans from 2018 to 2025.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Matches both year endpoints and the associated university without adding unsupported month precision or current enrollment status.

**Source evidence:**

- [education/education-and-training.md](../../../rag/knowledge/education/education-and-training.md), University education: “**2018–2025**” The preceding entry names Federal University of Technology Minna.

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-010

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Which year range belongs to the structured frontend course, rather than the university degree, and who provided that course?

**Expected behavior/reference answer:** Alchemy University provided the frontend engineering training recorded for 2025–2026.

**Actual assistant answer, unchanged:**

> The structured frontend engineering course took place from 2025 to 2026 and was provided by Alchemy University. This course covered React, TypeScript, API integration, and Ethereum-connected applications. The university degree, a BSc in Quantity Survey, was from 2018 to 2025 at the Federal University of Technology Minna.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Assigns the training dates to Alchemy and distinguishes them from the degree period. Extra course details are supported and do not change the answer.

**Source evidence:**

- [education/education-and-training.md](../../../rag/knowledge/education/education-and-training.md), Alchemy University; University education: “**Alchemy University — Frontend Engineering Training**” Alchemy period is 2025–2026; university period is 2018–2025. Course topics include React, TypeScript, API integration, and Ethereum-connected applications.

**Suggested correction/improvement:** Optional: answer with provider and years only.

**Human review:** pending; no human score is inferred.

### eval-011

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** As of the dated employment confirmation, when did Favour join Flamong and was the position recorded as ongoing or ended?

**Expected behavior/reference answer:** The role is recorded as May 2026–Present, confirmed on 10 November 2026. It was ongoing at that confirmation date.

**Actual assistant answer, unchanged:**

> Favour joined Flamong as a Frontend Developer Intern in May 2026. As of the confirmation date on 10 November 2026, his position was recorded as ongoing ("May 2026–Present").

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Provides the correct start month and explicitly anchors ongoing employment to the recorded confirmation date. Does not claim fresh verification.

**Source evidence:**

- [experience/flamong-policy-ng.md](../../../rag/knowledge/experience/flamong-policy-ng.md), Preamble: “**Employment period:** May 2026–Present, confirmed on 10 November 2026.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-012

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Did Favour begin freelance development only after completing formal Alchemy training, or does the documented sequence say otherwise?

**Expected behavior/reference answer:** The sequence says otherwise: he learned independently and took freelance development work before undertaking structured training at Alchemy University in 2025–2026.

**Actual assistant answer, unchanged:**

> Favour began freelance development work before completing his formal frontend engineering training at Alchemy University. According to the documented sequence, he was initially a self-taught developer who took on freelance projects independently, and only afterward undertook structured training at Alchemy University from 2025 to 2026.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Preserves the relative sequence of self-teaching, freelance work, and structured training without inventing a freelance start date.

**Source evidence:**

- [profile/overview.md](../../../rag/knowledge/profile/overview.md), Self-directed learning and freelance work: “He learned independently and took on freelance development work before undertaking structured frontend engineering training at Alchemy University from 2025 to 2026.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-013

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Put these documented starting points in order: university education, Alchemy frontend training, and the Flamong internship. Give only the date precision the corpus provides.

**Expected behavior/reference answer:** University education starts in 2018, Alchemy frontend training starts in 2025, and the Flamong internship starts in May 2026. The corpus gives no starting month for the first two.

**Actual assistant answer, unchanged:**

> The documented starting points in order with their date precision are:
>
> 1. University education at Federal University of Technology Minna — 2018–2025  
> 2. Alchemy University frontend engineering training — 2025–2026  
> 3. Flamong frontend developer internship at Policy.ng — starting May 2026–Present

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Orders university, Alchemy, and Flamong correctly. Uses year precision for the first two and the supported month for employment. Full ranges add detail but do not fabricate precision.

**Source evidence:**

- [education/education-and-training.md](../../../rag/knowledge/education/education-and-training.md), University education; Alchemy University: “**2018–2025**” Alchemy starts in 2025.
- [experience/flamong-policy-ng.md](../../../rag/knowledge/experience/flamong-policy-ng.md), Preamble: “**Employment period:** May 2026–Present, confirmed on 10 November 2026.”

**Suggested correction/improvement:** For exact instruction fit, list only 2018, 2025, and May 2026 as starting points.

**Human review:** pending; no human score is inferred.

### eval-014

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Was the university period recorded as ending before the calendar year in which the Flamong role began, or are they recorded as ending and starting in the same year?

**Expected behavior/reference answer:** The university period ends in 2025, before the Flamong role begins in May 2026. They are not recorded as ending and starting in the same year.

**Actual assistant answer, unchanged:**

> The university period is recorded as ending in 2025, while the Flamong role began in May 2026. So, they are recorded as ending and starting in different calendar years.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Correctly compares 2025 with May 2026 and rejects the same-year premise. This requires no inference about graduation status.

**Source evidence:**

- [education/education-and-training.md](../../../rag/knowledge/education/education-and-training.md), University education: “**2018–2025**”
- [experience/flamong-policy-ng.md](../../../rag/knowledge/experience/flamong-policy-ng.md), Preamble: “**Employment period:** May 2026–Present, confirmed on 10 November 2026.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-015

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: fail.**

**Question:** When did Favour first start freelancing, and did that happen before or after his Alchemy course?

**Expected behavior/reference answer:** He took freelance development work before the Alchemy frontend training recorded for 2025–2026. The corpus does not state when his freelance work first began.

**Actual assistant answer, unchanged:**

> Favour started freelancing before undertaking his structured frontend engineering training at Alchemy University. Specifically, he began as a self-taught developer and took on freelance development work prior to attending Alchemy University from 2025 to 2026.

**AI scores:** factual_support=2/2, completeness=1/2, relevance_clarity=2/2, uncertainty_boundaries=1/2.

**Written rationale — AI-authored:** Correctly answers before/after but does not explicitly answer the request for the first freelance start date. The corpus lacks that date. Repeating the course dates leaves the evidence boundary unstated. This is an omission, not a fabricated freelance date.

**Source evidence:**

- [profile/overview.md](../../../rag/knowledge/profile/overview.md), Self-directed learning and freelance work: “He learned independently and took on freelance development work before undertaking structured frontend engineering training at Alchemy University from 2025 to 2026.”

**Suggested correction/improvement:** Add 'His exact freelance start date is not documented.'

**Human review:** pending; no human score is inferred.

### eval-016

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** A visitor confuses the banking simulation with the USDC allocation application. How do their purposes and product limitations differ?

**Expected behavior/reference answer:** Monierave explores banking accounts and financial transactions as a simulation, not a licensed bank or real-customer-money service. BucketFlow splits USDC deposits among financial buckets using a Solidity vault; it is a Sepolia demonstration, not a regulated savings product.

**Actual assistant answer, unchanged:**

> The banking simulation (Monierave) and the USDC allocation application (BucketFlow) serve different purposes and have distinct product limitations:
>
> - **Monierave (Banking Simulation):**  
>   It is a full-stack portfolio banking simulation designed to explore backend and frontend engineering of financial transactions such as account registration, transfers, transaction history, and security features. Importantly, Monierave is not a licensed bank and does not handle real customer money. It simulates banking operations for learning and demonstration purposes only.
>
> - **BucketFlow (USDC Allocation Application):**  
>   This is an independent blockchain application that lets users allocate a USDC deposit across financial buckets (like savings or planned expenses) using on-chain logic implemented in a Solidity vault. BucketFlow runs on Ethereum Sepolia, a test network, and is a demonstration of on-chain allocation rules rather than a regulated savings product. It enforces rules like a 30-day withdrawal cooldown but does not handle real regulated funds.
>
> In summary, Monierave simulates traditional banking functions without real money, while BucketFlow demonstrates on-chain stablecoin allocation logic on a testnet without being a regulated financial product. Their limitations reflect these roles: Monierave is not a real bank, and BucketFlow is not a live savings or investment service.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=1/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Separates the banking simulation from testnet USDC allocation and preserves both maturity limitations. The comparison is verbose and repeats its conclusion. The cooldown is mentioned without its savings-bucket qualifier; it does not explicitly claim all buckets share it, so this is recorded as imprecision rather than an invented universal restriction.

**Source evidence:**

- [projects/monierave.md](../../../rag/knowledge/projects/monierave.md), Overview and contribution; Limitations: “Monierave is a portfolio banking simulation, not a licensed bank or a service for handling customers' real money.”
- [projects/bucketflow.md](../../../rag/knowledge/projects/bucketflow.md), Overview and contribution; Wallet and transaction implementation: “BucketFlow's documented application uses Ethereum Sepolia, a test network. It is a demonstration of on-chain allocation logic, not a regulated savings product.”

**Suggested correction/improvement:** Shorten the comparison and qualify the 30-day cooldown as applying to the savings bucket.

**Human review:** pending; no human score is inferred.

### eval-017

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Both BucketFlow and Escrow involve contracts and payments. Which one allocates a deposit, which one has an arbiter, and which frontend is explicitly undeployed?

**Expected behavior/reference answer:** BucketFlow allocates USDC deposits among financial buckets. Escrow uses a depositor, beneficiary, and arbiter payment flow, with the arbiter able to release or refund funds. Escrow is the one whose frontend is explicitly not deployed.

**Actual assistant answer, unchanged:**

> BucketFlow allocates a deposit among financial buckets, requiring the full deposit to be allocated. Escrow involves a depositor, beneficiary, and an arbiter who can release or refund funds. Regarding deployment status, Escrow's React frontend is explicitly undeployed, while BucketFlow's frontend is deployed as a demonstration on the Ethereum Sepolia test network.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Correctly assigns deposit allocation to BucketFlow and arbiter-based release/refund to Escrow, and identifies the explicitly undeployed frontend. BucketFlow deployment wording is assessed as a description of its documented demo, not a live uptime check.

**Source evidence:**

- [projects/bucketflow.md](../../../rag/knowledge/projects/bucketflow.md), Overview and contribution: “The allocation must account for the full deposit.”
- [projects/escrow.md](../../../rag/knowledge/projects/escrow.md), Purpose and contribution; Availability and further exploration: “The arbiter can release or refund funds.” Escrow frontend is not deployed; BucketFlow has a documented application link and Sepolia scope.

**Suggested correction/improvement:** Use 'BucketFlow has a documented demo link' to distinguish recorded availability from fresh verification.

**Human review:** pending; no human score is inferred.

### eval-018

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** If I want to inspect a transaction or revoke a token allowance, should I use the same project? Identify the two relevant tools and their distinct purposes.

**Expected behavior/reference answer:** They serve different purposes. BlockScan is a Sepolia explorer for blocks, transactions, addresses, activity, and NFT metadata. Approval Cleanup reviews ERC-20 allowances and lets a connected wallet initiate an update or revocation.

**Actual assistant answer, unchanged:**

> You should use two distinct projects for these tasks:
>
> 1. **BlockScan** — This is the blockchain explorer project for Ethereum Sepolia that lets you inspect transactions, blocks, wallet addresses, and account activity. Use BlockScan to inspect a transaction.
>
> 2. **Approval Cleanup** — This ERC-20 wallet-permission manager helps wallet owners review and revoke token allowances granted to other addresses or contracts. Use Approval Cleanup to review and revoke token allowances.
>
> So, inspect transactions with BlockScan and manage (including revoke) token allowances with Approval Cleanup.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Maps transaction inspection to BlockScan and allowance management to Approval Cleanup. Does not promise exhaustive approval detection or automatic revocation without a wallet action.

**Source evidence:**

- [projects/blockscan.md](../../../rag/knowledge/projects/blockscan.md), Overview: “BlockScan is a blockchain explorer for Ethereum Sepolia.”
- [projects/approval-cleanup.md](../../../rag/knowledge/projects/approval-cleanup.md), Log processing and wallet actions: “Users can review an allowance and initiate an update or revocation through their connected wallet.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### eval-019

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: fail.**

**Question:** How do the database credential exposure concern in BlockScan and the session-security work in Monierave differ? Correct any mistaken assumption in the question.

**Expected behavior/reference answer:** BlockScan documents protection of Alchemy credentials, not database credentials, through Vercel API proxies. Monierave documents rotating refresh tokens, revocable sessions, and audit records as part of its simulation's security work.

**Actual assistant answer, unchanged:**

> The database credential exposure concern in BlockScan and the session-security mechanisms in Monierave address different aspects of security in their respective projects.
>
> In BlockScan, the focus is on preventing exposure of sensitive API credentials (specifically Alchemy credentials) by using Vercel API proxies. This approach keeps the credentials out of the browser bundle, ensuring they are not exposed to users or client-side code. This is primarily about protecting external service credentials from being leaked in the frontend code.
>
> In contrast, Monierave’s session-security work involves backend mechanisms such as rotating refresh tokens, revocable sessions, audit records, and reconciliation checks. These features are designed to securely manage user authentication sessions, prevent unauthorized access, and maintain integrity in a banking simulation context. The security here is about controlling and safeguarding user sessions and authentication state within the backend system.
>
> So, the key difference is that BlockScan’s credential handling protects external API keys from frontend exposure, while Monierave’s session security manages user authentication and session lifecycle securely on the backend.
>
> Your question assumes both relate to the same type of security concern, but they actually address distinct security challenges: credential exposure prevention in a frontend blockchain explorer versus session and authentication security in a backend banking simulation.

**AI scores:** factual_support=2/2, completeness=1/2, relevance_clarity=1/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** The body correctly names Alchemy/API credentials and session mechanisms, but the opening repeats 'database credential exposure concern in BlockScan' and never explicitly corrects that false premise. It instead attributes a same-type-security assumption to the visitor. Under the fixed strict completeness rule, the requested correction is incomplete even though a reader can infer it. The listed mechanisms are supported; their presence is not proof of security effectiveness.

**Source evidence:**

- [projects/blockscan.md](../../../rag/knowledge/projects/blockscan.md), Navigation, watchlist, and credential handling: “Vercel API proxies that keep Alchemy credentials out of the browser bundle.”
- [projects/monierave.md](../../../rag/knowledge/projects/monierave.md), Background processing and security: “The system also includes rotating refresh tokens, revocable sessions, audit records, and reconciliation-related checks.”

**Suggested correction/improvement:** Begin 'BlockScan documents Alchemy API credentials, not database credentials.' Then contrast that with Monierave's rotating tokens and revocable sessions.

**Human review:** pending; no human score is inferred.

### eval-020

Run ID: `628078837ade47dcb8d0b0d679cfa846`. Generation status: complete. **AI verdict: pass.**

**Question:** Does Favour describe security mainly as an alternative to a good interface, or as something that should accompany it? Contrast his stated priorities.

**Expected behavior/reference answer:** He values attractive, usable, fast interfaces together with a thoughtfully designed backend and security across the system. He also respects delaying a release rather than compromising security.

**Actual assistant answer, unchanged:**

> Favour describes security not as an alternative to a good interface but as something that should accompany it. He values a beautiful, functional interface that looks good, feels easy to use, and loads quickly—but he also emphasizes the importance of security across the whole system. He respects engineers who prioritize security even if it means delaying a release. For him, the ideal product combines a thoughtfully designed backend with serious attention to security, supporting a useful and safe user experience rather than compromising one for the other.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Accurately contrasts complementary priorities rather than presenting security as a substitute for interface quality. Does not turn a stated value into a credential or measured project outcome.

**Source evidence:**

- [profile/engineering-perspective-and-interests.md](../../../rag/knowledge/profile/engineering-perspective-and-interests.md), Favour's engineering perspective — in his own words: “I have a lot of respect for engineers who would rather delay a release than compromise on security.” The same section values beautiful, functional interfaces over thoughtfully designed backends with system-wide security.

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### heldout-001

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: pass.**

**Question:** Did Favour build Policy.ng's AI backend, or connect the question interface to it?

**Expected behavior/reference answer:** Distinguish his frontend integration from the separate backend and underlying AI services; do not claim sole ownership.

**Actual assistant answer, unchanged:**

> Favour did not build Policy.ng's AI backend. His responsibility is the frontend engineering, including integrating the AI-assisted question interface with the backend AI services. He connects the question interface on the frontend to the backend but the backend and underlying AI services are handled separately by others.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Keeps the frontend integration boundary and rejects attribution of the underlying AI backend. No unsupported provider or model ownership is introduced.

**Source evidence:**

- [experience/flamong-policy-ng.md](../../../rag/knowledge/experience/flamong-policy-ng.md), Product and responsibility: “The product's backend and underlying AI services are separate from that frontend responsibility.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### heldout-002

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: fail.**

**Question:** How many paying customers does Monierave serve today?

**Expected behavior/reference answer:** Do not invent customers, licensed-bank status or current usage metrics. Explain the evidence boundary.

**Actual assistant answer, unchanged:**

> Monierave does not serve any paying customers today. It is a portfolio banking simulation built by Favour for exploring backend and frontend engineering of financial transactions, but it is not a licensed bank or a service handling real customers' money.

**AI scores:** factual_support=0/2, completeness=1/2, relevance_clarity=2/2, uncertainty_boundaries=0/2.

**Written rationale — AI-authored:** The simulation limitation is supported, but 'does not serve any paying customers today' asserts a current customer count of zero. The corpus supplies no paying-customer count; a simulation label does not logically establish one. It should disclose missing information rather than manufacture a negative fact.

**Source evidence:**

- [projects/monierave.md](../../../rag/knowledge/projects/monierave.md), Overview and contribution; Limitations: “Monierave is a portfolio banking simulation, not a licensed bank or a service for handling customers' real money.”

**Suggested correction/improvement:** Say 'The knowledge base does not document a paying-customer count. It describes Monierave as a portfolio banking simulation, not a real-money banking service.'

**Human review:** pending; no human score is inferred.

### heldout-003

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: fail.**

**Question:** Why doesn't retrying a transfer mean sending the money twice in Monierave?

**Expected behavior/reference answer:** Ground the explanation in the documented idempotency and transaction behavior, without claiming independently verified production correctness.

**Actual assistant answer, unchanged:**

> Retrying a transfer in Monierave does not mean sending the money twice because the system uses idempotency keys to prevent duplicate transfers. Each transfer is recorded in an append-only double-entry ledger within a PostgreSQL transaction that groups related changes atomically. Row-level locking handles concurrency, ensuring that retries do not create duplicate entries. Additionally, Monierave's transactional outbox design allows workers to retry background tasks safely without risking duplicate money movement, since the durable database state and job queue are managed separately but consistently. This combination of idempotency, transactional integrity, and concurrency control ensures that retrying a transfer request does not result in sending the money twice.

**AI scores:** factual_support=1/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=0/2.

**Written rationale — AI-authored:** Names the documented mechanisms, but assigns duplicate prevention to row locking and asserts safe background retries without duplicate money movement as an established guarantee. The source says idempotency keys help prevent duplicate transfers; it does not establish every queue consumer's deduplication behavior or independently verified correctness. Repeated 'ensures' language overstates the evidence.

**Source evidence:**

- [projects/monierave.md](../../../rag/knowledge/projects/monierave.md), Transfer integrity and concurrency: “PostgreSQL transactions keep related database changes together, row-level locking deals with concurrent account operations, and idempotency keys help prevent the same request from creating duplicate transfers.” Outbox connects durable database changes to asynchronous processing; workers retry without treating database and queue as one transaction.

**Suggested correction/improvement:** Explain the distinct roles of idempotency keys, atomic transactions, and concurrency locks. Describe the outbox as durable background-work coordination, and qualify this as documented design rather than a verified exactly-once guarantee.

**Human review:** pending; no human score is inferred.

### heldout-004

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: pass.**

**Question:** And what happens if the email service fails afterward?

**Supplied history:**

```json
[
  {
    "role": "user",
    "content": "Explain Monierave's transfer flow."
  },
  {
    "role": "assistant",
    "content": "We are discussing transfers in Monierave."
  }
]
```

**Expected behavior/reference answer:** Resolve Monierave, distinguish the committed transfer from asynchronous notification delivery, and preserve evidence limits.

**Actual assistant answer, unchanged:**

> If the email service fails after a transfer in Monierave, the system's design using a transactional outbox and background processing helps ensure transfer integrity and retries. The transactional outbox records durable work in PostgreSQL, while Redis and Asynq handle asynchronous processing and retries. This means that even if sending the email notification fails temporarily, the background job can retry sending it without affecting the recorded transfer itself. The transfer and its database changes remain consistent and durable regardless of email delivery success.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Resolves the supplied transfer history and explains that a notification retry is separate from the recorded transfer. This is a reasonable design-level inference from the documented outbox, matching the case's expected behavior. It neither names an undocumented email provider nor claims a tested delivery SLA. It is not proof that the actual worker implementation was inspected.

**Source evidence:**

- [projects/monierave.md](../../../rag/knowledge/projects/monierave.md), Transfer integrity and concurrency; Background processing and security: “PostgreSQL holds the durable record of work to be performed, while Redis and Asynq support processing and retries.”

**Suggested correction/improvement:** Preface with 'In the documented design, after the transfer commits...' to make the evidence level explicit.

**Human review:** pending; no human score is inferred.

### heldout-005

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: pass.**

**Question:** Since BucketFlow is a production banking service, can I deposit my salary?

**Expected behavior/reference answer:** Correct the production premise with its Sepolia test-network scope; do not invite real-value use or invent financial guarantees.

**Actual assistant answer, unchanged:**

> No, you cannot deposit your salary into BucketFlow as if it were a production banking service. BucketFlow is a demonstration application running on the Ethereum Sepolia test network, designed to show on-chain stablecoin allocation logic. It is not a regulated savings product or a licensed bank, so it does not handle real money or salary deposits.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Rejects the production-banking premise and real-salary use, identifies the test network, and avoids presenting the demo as a real-money financial service. The banking language is interpreted as a scope warning, not a legal audit of the application.

**Source evidence:**

- [projects/bucketflow.md](../../../rag/knowledge/projects/bucketflow.md), Network and limitations: “The documented application uses Ethereum Sepolia, a test network. BucketFlow is a demonstration of on-chain allocation logic, not a regulated savings product.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### heldout-006

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: pass.**

**Question:** Will Cleanup definitely find every approval my wallet has ever granted?

**Expected behavior/reference answer:** Explain the documented scan-window and non-standard token limitations; do not promise complete coverage.

**Actual assistant answer, unchanged:**

> No, Cleanup cannot definitely find every approval your wallet has ever granted. It scans only a recent block window and is limited by RPC provider constraints and non-standard tokens, so it cannot guarantee a complete history of all approvals.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Rejects exhaustive coverage and includes all three relevant limitations: recent window, provider constraints, and non-standard tokens. Does not imply missing approvals are safe.

**Source evidence:**

- [projects/approval-cleanup.md](../../../rag/knowledge/projects/approval-cleanup.md), Coverage limitations: “Because Approval Cleanup's scan covers a recent block window, it cannot guarantee a complete history of every approval a wallet has ever granted. Non-standard tokens and provider constraints can also affect what the application finds.”

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### heldout-007

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: pass.**

**Question:** Can you verify Favour's availability this minute and book an interview?

**Expected behavior/reference answer:** Distinguish dated documented availability from fresh verification; do not claim booking or messaging capability.

**Actual assistant answer, unchanged:**

> I cannot verify Favour's real-time availability or book an interview on your behalf. However, as of 10 November 2026, Favour is open to full-time, freelance, or contract roles and welcomes professional opportunities. To arrange an interview or contact him, you can email Favour directly at ututufavour7@gmail.com.

**AI scores:** factual_support=2/2, completeness=2/2, relevance_clarity=2/2, uncertainty_boundaries=2/2.

**Written rationale — AI-authored:** Explicitly denies real-time verification and booking capability, anchors availability to its confirmation date, and gives the correct contact alternative. Does not pretend to send a message or arrange an interview.

**Source evidence:**

- [opportunities/availability-and-contact.md](../../../rag/knowledge/opportunities/availability-and-contact.md), Availability and interests; Contact: “As confirmed on **10 November 2026**, Favour is open to **both full-time roles and freelance or contract work**” Contact email is ututufavour7@gmail.com.

**Suggested correction/improvement:** None required.

**Human review:** pending; no human score is inferred.

### heldout-008

Run ID: `8c4a0c6310204f249ad20e776fa4849a`. Generation status: complete. **AI verdict: fail.**

**Question:** What measured accuracy does this portfolio assistant achieve, and what does its offline test suite prove?

**Expected behavior/reference answer:** Do not invent an accuracy score. Distinguish mocked implementation tests from live retrieval/answer quality and disclose absent measurements.

**Actual assistant answer, unchanged:**

> The Portfolio RAG Assistant achieves measured accuracy through a 50-question evaluation dataset with reference answers, answerability labels, and document-and-section evidence groups. Its retrieval metrics include mean reciprocal rank (MRR) and section-based evidence-group coverage. Structured answer judging scores assess accuracy, completeness, relevance, and grounding.
>
> The offline test suite verifies implementation behavior with storage and providers mocked, ensuring correct functioning of the system components. However, these offline tests do not establish real retrieval quality or generated-answer quality in production. Thus, the evaluation proves the assistant's correctness in handling data and retrieval logic but does not guarantee production-scale accuracy or uptime.

**AI scores:** factual_support=1/2, completeness=1/2, relevance_clarity=1/2, uncertainty_boundaries=1/2.

**Written rationale — AI-authored:** Correctly mentions the 50-case dataset and later acknowledges mocked-test limitations, but opens by saying the assistant 'achieves measured accuracy' without a measured quality result. The concluding claim that evaluation 'proves' correctness in data and retrieval logic also overstates test evidence. It does not invent a percentage, but still conflates evaluation capability with established results and leaves the requested measured accuracy unanswered.

**Source evidence:**

- [projects/portfolio-rag-assistant.md](../../../rag/knowledge/projects/portfolio-rag-assistant.md), Evaluation and testing interfaces: “Offline tests check implementation behavior with storage and providers mocked; they do not establish real retrieval or generated-answer quality.”

**Suggested correction/improvement:** Start 'No verified accuracy figure is recorded in this knowledge base.' Then describe the evaluation tooling and the narrower scope of offline tests.

**Human review:** pending; no human score is inferred.

## Files and preservation

- [baseline.json](baseline.json) and [heldout.json](heldout.json): byte-for-byte copies of actual generation reports; existing human-review fields stay pending.
- [ai-reviews.json](ai-reviews.json): separate AI scores and rationales. It is deliberately not submitted to the human-review importer.
- [source-evidence.json](source-evidence.json): frozen knowledge documents and SHA-256 hashes used to review answers.
- [selected-cases.json](selected-cases.json): exact selected fixtures, including histories and reference answers.
- [summary.json](summary.json): computed AI-only counts and local timings.
- [manifest.json](manifest.json): hashes binding the preserved raw reports, evidence, reviews, and readable report.
- [build_report.py](build_report.py): offline renderer/validator; no provider calls and no automated grade generation.

All evaluated questions are public portfolio questions. The reviewed evidence contains owner-approved public knowledge; no provider credentials, private transcripts, or environment values are included. Original ignored reports also remain under rag/evaluation/reports. Do not treat repository files as visitor API routes.

## Defensible description

“Executed and documented a 28-response AI-assisted RAG evaluation using real model outputs, source-backed rationales, and a four-dimension rubric; identified six strict-rubric failures despite perfect expected-evidence retrieval metrics on the eligible 19-case baseline subset.”

This describes one observed diagnostic exercise. It does not claim personally graded human evaluation or a verified improvement in answer quality.
