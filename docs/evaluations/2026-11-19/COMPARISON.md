# Before/after — evidence-boundary corrections

19 November 2026. **AI-assisted evaluation, not personal grading by Favour or independent human validation.**

## What changed

The original evaluation was committed first as ee12446. The candidate adds hypothetical evidence-boundary examples to the shared answer prompt and clarifies missing facts/limits in six knowledge documents: education status, freelance start date, API-versus-database credentials, transfer/notification semantics and undocumented customer metrics, evaluation tooling versus measured quality, and the limits of a test-network designation. No new biographical facts, real customer counts, graduation status, legal claims, or measured accuracy figures were added to the source material.

The knowledge index was rebuilt through existing incremental ingestion, then exported/verified through the existing packaged-index exporter. It still contains 13 documents and 33 chunks. The original local vector/index directories were backed up before ingestion. No reranker, answer cache, model change, post-generation rewriting, question-specific response handler, or extra verification service was added.

Both answer paths use the shared prompt. The prompt snapshot regression was updated. Backend suite: 151 tests ran successfully, 13 skipped. All 52 frontend unit tests passed. Packaged-index export and verification succeeded. These checks do not establish live-model quality. Existing dependency ResourceWarnings remain separate from test failures.

## Experiment integrity

All five rounds used the exact same 20 baseline questions and eight existing held-out questions, including supplied history and expected answers. Models, k=10, and chunk settings were unchanged. Before and final raw JSON retain provenance and pending human-review fields. Corpus and prompt hashes changed in the final round, so the final comparison measures their combined candidate, not the isolated causal effect of one variable.

The same coding assistant reviewed outputs with the original four 0–2 dimensions and strict pass rule (support=2, completeness=2, boundaries=2, relevance>=1). Scoring was unblinded, not independent, and informed the fixes. These questions are now development/regression cases, not a fresh holdout. One observation per case cannot establish reliable improvement, generalization, or production accuracy. Repeat runs and fresh human-reviewed questions remain necessary.

The final review considers explicit corrections wherever they occur in the answer; opening with the correction is a style recommendation, not an extra pass condition. Date wording is treated conservatively when current status remains ambiguous. Sources are inspected for support; reference batches are not claim-level citations and full selected context is not separately captured.

## Every attempt retained

| Round | AI strict passes | Notes |
|---|---:|---|
| Original | 22/28 | Committed diagnostic baseline |
| First prompt-only change | 21/28 | General evidence checklist; unsuccessful; outputs and grades retained |
| Second prompt-only change | 24/28 | Hypothetical examples; residual failures retained |
| First clarified-corpus change | 26/28 | Customer-count contradiction and regulatory wording persisted |
| Final prompt + evidence clarifications | 27/28 | Candidate compared below; no failed response replaced by a retry |

Four additional 28-response rounds were generated (112 new responses, plus the original 28: 140 responses preserved in total). This includes unsuccessful experiments. Owner evaluation and ingestion make paid provider calls outside public-chat ledger limits; available answer-only usage is not a complete bill. No cost savings or speed improvement is inferred.

## Observed before/after

- AI strict pass count: **22/28 → 27/28**; change **+17.9 percentage points** on these reused cases.
- Original failures now passing: eval-004, eval-015, eval-019, heldout-002, heldout-003, heldout-008.
- Original failures remaining: none.
- New regressions versus original: eval-016.

- Baseline retrieval MRR@10: **1.0000 → 0.9474** across the same 19 eligible cases. First labelled evidence moved from rank 1 to rank 2 for eval-013 and eval-014. Section and labelled-quote coverage stayed at 1.0. The candidate did not improve every metric.

These are observed AI-review outcomes, not verified human accuracy, reviewer agreement, statistical significance, or an independently reproduced quality improvement.

**Unresolved regression: eval-016.** The final answer turns test-network scope into unsupported statements about regulatory backing/approval and custody. The source explicitly says no legal assessment is recorded, but the model still overstates it. The six original diagnoses now pass; the candidate is not a clean 28/28 pass. Further prompt-only success is not assumed, and no production rollout was performed.

| Case | Before scores S/C/R/U | After scores S/C/R/U | Before → after verdict |
|---|---|---|---|
| eval-001 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-002 | 2/2/1/2 | 2/2/1/2 | pass → pass |
| eval-003 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-004 | 1/2/2/1 | 2/2/2/2 | fail → pass |
| eval-005 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-006 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-007 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-008 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-009 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-010 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-011 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-012 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-013 | 2/2/2/2 | 2/2/1/2 | pass → pass |
| eval-014 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-015 | 2/1/2/1 | 2/2/2/2 | fail → pass |
| eval-016 | 2/2/1/2 | 1/2/1/0 | pass → fail |
| eval-017 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-018 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| eval-019 | 2/1/1/2 | 2/2/1/2 | fail → pass |
| eval-020 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| heldout-001 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| heldout-002 | 0/1/2/0 | 2/2/2/2 | fail → pass |
| heldout-003 | 1/2/2/0 | 2/2/2/2 | fail → pass |
| heldout-004 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| heldout-005 | 2/2/2/2 | 2/2/1/2 | pass → pass |
| heldout-006 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| heldout-007 | 2/2/2/2 | 2/2/2/2 | pass → pass |
| heldout-008 | 1/1/1/1 | 2/2/2/2 | fail → pass |

S=factual support; C=completeness; R=relevance/clarity; U=uncertainty/boundaries. Each score is out of 2. The full original rubric and rationales remain in [the original report](REPORT.md).

## Actual answers and AI-written comparison rationales

### eval-001

**Question:** Someone called the wallet-permission tool Cleanup and someone else called it Allowance Cleanup. What is its preferred name, and what is the correct code repository?

**Before — unchanged actual answer:**

> The preferred name for the wallet-permission tool is **Approval Cleanup**. It is also known as Cleanup or Allowance Cleanup, but "Approval Cleanup" is the primary name used.
>
> The correct code repository for Approval Cleanup is:  
> https://github.com/faelic/approval-cleanup
>
> This tool helps wallet owners review and manage ERC-20 token allowances granted to other addresses or contracts.

**After — unchanged actual answer:**

> The preferred name for the wallet-permission tool is **Approval Cleanup**. It is also known as Cleanup or Allowance Cleanup. The correct code repository for this project is:
>
> https://github.com/faelic/approval-cleanup
>
> This tool helps wallet owners review and manage ERC-20 token allowances granted to other addresses or contracts.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Still identifies Approval Cleanup, resolves both aliases, and gives the exact supported repository. The brief allowance description is supported. No material change from the passing baseline.

**Evidence:** projects/approval-cleanup.md — Preamble; Overview and contribution. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-002

**Question:** A visitor credits Favour with building Policy.ng's underlying AI service. What responsibility does the portfolio actually attribute to him?

**Before — unchanged actual answer:**

> The portfolio attributes to Favour the responsibility for the frontend engineering of Policy.ng, including building and maintaining the public-facing pages and authenticated administration tools using React and TypeScript. This covers features like policy search, public-official directories, AI-assisted question interfaces, comments, moderation, content editing, and subscriber management. Importantly, his role includes integrating the AI-assisted question interface on the frontend, but the backend and the underlying AI services themselves are separate from his responsibility. So, he is not credited with building Policy.ng’s underlying AI service, only its frontend and the integration of that AI interface.

**After — unchanged actual answer:**

> The portfolio attributes to Favour sole responsibility for the frontend engineering of Policy.ng, including building and maintaining the public-facing pages and authenticated administrative tools using React and TypeScript. His work covers features like policy search, public-official directories, AI-assisted question interfaces, comments, moderation, content editing, and subscriber management. However, the backend and the underlying AI services of Policy.ng are explicitly separate from his frontend responsibility. So, while he integrates the AI-assisted question interface on the frontend, he is not responsible for building the underlying AI service itself.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/1/2.

**AI-written rationale:** Keeps the correct Policy.ng ownership boundary: sole frontend engineer and AI-interface integration, not ownership of the backend/underlying AI service. The long feature list remains unnecessary but supported. This retains the original style deduction rather than failing a correct answer.

**Evidence:** experience/flamong-policy-ng.md — Product and responsibility. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-003

**Question:** Which project lets someone return to saved wallet addresses and also inspect NFT metadata on a test network?

**Before — unchanged actual answer:**

> The project that lets someone return to saved wallet addresses and also inspect NFT metadata on a test network is **BlockScan — Sepolia blockchain explorer**. It is a frontend application for Ethereum Sepolia that allows users to inspect blocks, transactions, wallet addresses, account activity, and NFT metadata. It also includes a persistent watchlist feature for saved addresses.

**After — unchanged actual answer:**

> The project that lets someone return to saved wallet addresses and also inspect NFT metadata on a test network is **BlockScan — Sepolia blockchain explorer**. It is an independent frontend project for Ethereum Sepolia that allows users to inspect blocks, transactions, wallet addresses, account activity, and NFT metadata. It includes features like a persistent watchlist for saved addresses and live blockchain data updates.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Identifies BlockScan, its Sepolia scope, NFT metadata, and saved-address watchlist. These match the source and answer both distinguishing requirements. No new unsupported capability is added.

**Evidence:** projects/blockscan.md — Overview; Navigation, watchlist, and credential handling. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-004

**Question:** Was Favour's university degree in computer science? Name the institution and the degree field actually recorded.

**Before — unchanged actual answer:**

> Favour's university degree is not in computer science. He is recorded as studying at the Federal University of Technology Minna, where he is pursuing a Bachelor of Science (BSc) degree in Quantity Survey from 2018 to 2025.

**After — unchanged actual answer:**

> Favour's recorded university degree is a Bachelor of Science (BSc) in Quantity Survey from the Federal University of Technology Minna. It is not in computer science. The documented university education period is 2018–2025.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** The unsupported present-enrollment language is gone. The answer now reports the recorded Quantity Survey BSc, Federal University of Technology Minna, and 2018–2025 period, without asserting current enrollment or independently verified graduation. This resolves the original temporal-status failure.

**Evidence:** education/education-and-training.md — University education. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-005

**Question:** What does Favour explicitly say he enjoys outside coding, without turning that interest into a professional credential?

**Before — unchanged actual answer:**

> Favour explicitly says that outside coding, he really enjoys playing video games. He describes it as one of his favorite things to do, without framing it as a professional credential.

**After — unchanged actual answer:**

> Favour explicitly says he enjoys playing video games outside coding. He describes it as one of his favorite things to do, without framing it as a professional credential.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Still names video games as an explicitly recorded personal interest and avoids turning it into a professional qualification. Direct and supported, with no regression.

**Evidence:** profile/engineering-perspective-and-interests.md — Favour's interests — in his own words. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-006

**Question:** Which provider credential does BlockScan keep out of the browser bundle, and what mechanism is named for doing so?

**Before — unchanged actual answer:**

> BlockScan keeps the Alchemy provider credential out of the browser bundle by using Vercel API proxies. This mechanism is named as "Vercel API proxies" for credential handling.

**After — unchanged actual answer:**

> BlockScan keeps Alchemy provider API credentials out of the browser bundle by using Vercel API proxies. This proxy mechanism is named for protecting those credentials from exposure in the frontend code.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Accurately identifies Alchemy provider API credentials and Vercel API proxies as the mechanism keeping them out of the browser bundle. The protection is scoped to credential exposure rather than a claim that every attack is prevented.

**Evidence:** projects/blockscan.md — Navigation, watchlist, and credential handling. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-007

**Question:** Can I open a deployed frontend for the project with a depositor, beneficiary, and arbiter? Give the supported way to explore it.

**Before — unchanged actual answer:**

> You cannot open a deployed frontend for the Escrow project with depositor, beneficiary, and arbiter roles because its frontend is not deployed. The supported way to explore it is by visiting the Escrow repository on GitHub at https://github.com/faelic/escrow-webapp, where you can review the React frontend code and Solidity smart contract implementation.

**After — unchanged actual answer:**

> The Escrow project involving a depositor, beneficiary, and arbiter does not have a deployed frontend available for public use. The supported way to explore it is by reviewing its code and implementation in the Escrow repository on GitHub: https://github.com/faelic/escrow-webapp. There is no live deployment of the frontend to open or interact with directly.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Retains the correct Escrow identification, explicitly undeployed frontend, and exact repository link. The final repeated deployment warning is unnecessary but does not materially hinder the short answer. No live frontend is invented.

**Evidence:** projects/escrow.md — Availability and further exploration. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-008

**Question:** What phone number should I call to discuss a role with Favour?

**Before — unchanged actual answer:**

> Favour does not publicly list a phone number for contact. To discuss a role with him, you should email him at ututufavour7@gmail.com.

**After — unchanged actual answer:**

> Favour does not list a phone number for contact. To discuss a role with him, you can email him at ututufavour7@gmail.com.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Does not provide an invented phone number and supplies the correct recorded email. As in the original review, absence of a listed phone is assessed within the supplied portfolio knowledge rather than as a verified claim about the entire web.

**Evidence:** opportunities/availability-and-contact.md — Contact. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-009

**Question:** What are the documented beginning and ending years of Favour's university education, and which institution do those years belong to?

**Before — unchanged actual answer:**

> Favour's documented university education at the Federal University of Technology Minna spans from 2018 to 2025.

**After — unchanged actual answer:**

> Favour's documented university education at the Federal University of Technology Minna spans from 2018 to 2025.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Preserves the correct university and year range without adding month precision or ongoing-enrollment status. No material difference from the passing baseline.

**Evidence:** education/education-and-training.md — University education. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-010

**Question:** Which year range belongs to the structured frontend course, rather than the university degree, and who provided that course?

**Before — unchanged actual answer:**

> The structured frontend engineering course took place from 2025 to 2026 and was provided by Alchemy University. This course covered React, TypeScript, API integration, and Ethereum-connected applications. The university degree, a BSc in Quantity Survey, was from 2018 to 2025 at the Federal University of Technology Minna.

**After — unchanged actual answer:**

> The structured frontend engineering course took place from 2025 to 2026 and was provided by Alchemy University. This course focused on React, TypeScript, API integration, and Ethereum-connected applications. The university degree at the Federal University of Technology Minna spans from 2018 to 2025.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Correctly associates 2025–2026 frontend training with Alchemy and distinguishes the university's 2018–2025 period. The included course topics are supported. No qualification inflation occurs.

**Evidence:** education/education-and-training.md — Alchemy University; University education. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-011

**Question:** As of the dated employment confirmation, when did Favour join Flamong and was the position recorded as ongoing or ended?

**Before — unchanged actual answer:**

> Favour joined Flamong as a Frontend Developer Intern in May 2026. As of the confirmation date on 10 November 2026, his position was recorded as ongoing ("May 2026–Present").

**After — unchanged actual answer:**

> Favour joined Flamong as a Frontend Developer Intern in May 2026. As of the confirmation date on 10 November 2026, this position is recorded as ongoing ("May 2026–Present").

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Gives May 2026 as the Flamong start and anchors ongoing status to the 10 November 2026 confirmation. It does not claim fresh verification of employment on evaluation day.

**Evidence:** experience/flamong-policy-ng.md — Preamble. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-012

**Question:** Did Favour begin freelance development only after completing formal Alchemy training, or does the documented sequence say otherwise?

**Before — unchanged actual answer:**

> Favour began freelance development work before completing his formal frontend engineering training at Alchemy University. According to the documented sequence, he was initially a self-taught developer who took on freelance projects independently, and only afterward undertook structured training at Alchemy University from 2025 to 2026.

**After — unchanged actual answer:**

> Favour began freelance development work before undertaking formal frontend engineering training at Alchemy University. The documented sequence clearly states that his freelance work preceded the Alchemy training from 2025 to 2026. His exact freelance start date is not documented, but it is confirmed that he did not begin freelancing only after completing the Alchemy training.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Correctly preserves self-teaching and freelance work before structured Alchemy training. It additionally states the missing exact freelance start date, a supported qualification that avoids inventing a chronology.

**Evidence:** profile/overview.md — Self-directed learning and freelance work. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-013

**Question:** Put these documented starting points in order: university education, Alchemy frontend training, and the Flamong internship. Give only the date precision the corpus provides.

**Before — unchanged actual answer:**

> The documented starting points in order with their date precision are:
>
> 1. University education at Federal University of Technology Minna — 2018–2025  
> 2. Alchemy University frontend engineering training — 2025–2026  
> 3. Flamong frontend developer internship at Policy.ng — starting May 2026–Present

**After — unchanged actual answer:**

> The documented starting points in order with their date precision are:
>
> 1. University education at Federal University of Technology Minna: 2018–2025  
> 2. Alchemy University frontend engineering training: 2025–2026  
> 3. Frontend Developer Internship at Flamong (Policy.ng): starting May 2026–Present  
>
> This sequence is supported by the recorded university years ending in 2025, followed by Alchemy training from 2025 to 2026, and then the internship beginning in May 2026.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/1/2.

**AI-written rationale:** The ordered starting points and allowed precision are correct: 2018, 2025, and May 2026. The repeated summary after the list is unnecessary and awkwardly emphasizes the university end year. It is read in the question's start-order context, not as evidence that actual attendance periods were nonoverlapping; no month-level sequence is established.

**Evidence:** education/education-and-training.md — University education; Alchemy University; experience/flamong-policy-ng.md — Preamble. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-014

**Question:** Was the university period recorded as ending before the calendar year in which the Flamong role began, or are they recorded as ending and starting in the same year?

**Before — unchanged actual answer:**

> The university period is recorded as ending in 2025, while the Flamong role began in May 2026. So, they are recorded as ending and starting in different calendar years.

**After — unchanged actual answer:**

> Favour's university education period is recorded as 2018–2025. His role at Flamong began in May 2026. Therefore, the university period is recorded as ending before the calendar year in which the Flamong role started, not in the same year.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Correctly compares the recorded university end year 2025 with the Flamong start in May 2026 and rejects the same-calendar-year premise. No unsupported graduation status is inferred.

**Evidence:** education/education-and-training.md — University education; experience/flamong-policy-ng.md — Preamble. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-015

**Question:** When did Favour first start freelancing, and did that happen before or after his Alchemy course?

**Before — unchanged actual answer:**

> Favour started freelancing before undertaking his structured frontend engineering training at Alchemy University. Specifically, he began as a self-taught developer and took on freelance development work prior to attending Alchemy University from 2025 to 2026.

**After — unchanged actual answer:**

> Favour began freelancing as a self-taught software developer before undertaking his structured frontend engineering training at Alchemy University from 2025 to 2026. His exact freelance start date is not documented, but it is confirmed that his freelance work preceded the Alchemy course.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Now explicitly says the exact freelance start date is not documented and separately gives the supported pre-Alchemy sequence. Unlike the original answer, it addresses both the requested date and relative timing, resolving the missing-information failure.

**Evidence:** profile/overview.md — Self-directed learning and freelance work. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-016

**Question:** A visitor confuses the banking simulation with the USDC allocation application. How do their purposes and product limitations differ?

**Before — unchanged actual answer:**

> The banking simulation (Monierave) and the USDC allocation application (BucketFlow) serve different purposes and have distinct product limitations:
>
> - **Monierave (Banking Simulation):**  
>   It is a full-stack portfolio banking simulation designed to explore backend and frontend engineering of financial transactions such as account registration, transfers, transaction history, and security features. Importantly, Monierave is not a licensed bank and does not handle real customer money. It simulates banking operations for learning and demonstration purposes only.
>
> - **BucketFlow (USDC Allocation Application):**  
>   This is an independent blockchain application that lets users allocate a USDC deposit across financial buckets (like savings or planned expenses) using on-chain logic implemented in a Solidity vault. BucketFlow runs on Ethereum Sepolia, a test network, and is a demonstration of on-chain allocation rules rather than a regulated savings product. It enforces rules like a 30-day withdrawal cooldown but does not handle real regulated funds.
>
> In summary, Monierave simulates traditional banking functions without real money, while BucketFlow demonstrates on-chain stablecoin allocation logic on a testnet without being a regulated financial product. Their limitations reflect these roles: Monierave is not a real bank, and BucketFlow is not a live savings or investment service.

**After — unchanged actual answer:**

> The banking simulation (Monierave) and the USDC allocation application (BucketFlow) serve different purposes and have distinct product limitations:
>
> - **Monierave (Banking Simulation):**  
>   It is a full-stack portfolio project simulating banking operations like account registration, transfers, transaction history, and security features. It is explicitly not a licensed bank and does not handle real customer money. Its scope is educational and exploratory, focusing on backend and frontend engineering challenges in financial transactions.
>
> - **BucketFlow (USDC Allocation Application):**  
>   This is a blockchain-based app that lets users allocate a USDC deposit across financial buckets with on-chain rules enforced by a Solidity vault. It runs on Ethereum Sepolia, a test network, and is a demonstration of on-chain allocation logic rather than a regulated savings or custody product. It includes wallet connection, token approvals, and enforces withdrawal cooldowns but is not legally or regulatorily backed.
>
> In summary, Monierave simulates traditional banking functions without real money or regulatory status, while BucketFlow demonstrates on-chain stablecoin allocation on a testnet without being a regulated financial product. Their limitations reflect these roles: Monierave is a simulation without real funds, and BucketFlow is a testnet demo without custody guarantees or regulatory approval.

**AI verdict:** pass → fail. **After scores S/C/R/U:** 1/2/1/0.

**AI-written rationale:** The core product distinction is still correct, but the answer now claims BucketFlow is 'not legally or regulatorily backed' and lacks regulatory approval, and attributes absence of regulatory status to Monierave. The corpus establishes simulation/testnet scope and that BucketFlow is not a regulated savings product; it supplies no legal review or broad regulatory-status finding. The final source clarification explicitly says such a legal assessment is not recorded. This is an unresolved regression, not a successful fix, and must not be hidden by the higher aggregate score.

**Evidence:** projects/monierave.md — Overview and contribution; Limitations; projects/bucketflow.md — Overview and contribution; Wallet and transaction implementation. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-017

**Question:** Both BucketFlow and Escrow involve contracts and payments. Which one allocates a deposit, which one has an arbiter, and which frontend is explicitly undeployed?

**Before — unchanged actual answer:**

> BucketFlow allocates a deposit among financial buckets, requiring the full deposit to be allocated. Escrow involves a depositor, beneficiary, and an arbiter who can release or refund funds. Regarding deployment status, Escrow's React frontend is explicitly undeployed, while BucketFlow's frontend is deployed as a demonstration on the Ethereum Sepolia test network.

**After — unchanged actual answer:**

> BucketFlow allocates a deposit by letting users split a USDC deposit among financial buckets with enforced allocation rules. Escrow involves an arbiter who can release or refund funds in the payment flow. Additionally, Escrow's React frontend is explicitly noted as not deployed, whereas BucketFlow's frontend application is deployed on a test network.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Assigns USDC deposit allocation to BucketFlow and arbiter release/refund to Escrow, and correctly names Escrow as the explicitly undeployed frontend. BucketFlow's deployment wording is interpreted as its documented testnet application rather than independently checked uptime.

**Evidence:** projects/bucketflow.md — Overview and contribution; projects/escrow.md — Purpose and contribution; Availability and further exploration. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-018

**Question:** If I want to inspect a transaction or revoke a token allowance, should I use the same project? Identify the two relevant tools and their distinct purposes.

**Before — unchanged actual answer:**

> You should use two distinct projects for these tasks:
>
> 1. **BlockScan** — This is the blockchain explorer project for Ethereum Sepolia that lets you inspect transactions, blocks, wallet addresses, and account activity. Use BlockScan to inspect a transaction.
>
> 2. **Approval Cleanup** — This ERC-20 wallet-permission manager helps wallet owners review and revoke token allowances granted to other addresses or contracts. Use Approval Cleanup to review and revoke token allowances.
>
> So, inspect transactions with BlockScan and manage (including revoke) token allowances with Approval Cleanup.

**After — unchanged actual answer:**

> You should use two distinct projects for these tasks:
>
> 1. **BlockScan** — This is the blockchain explorer tool Favour built for inspecting transactions, blocks, wallet addresses, and account activity on Ethereum Sepolia. It is designed for detailed inspection of transactions.
>
> 2. **Approval Cleanup** — This is the ERC-20 wallet-permission manager that helps users review and revoke token allowances granted to other addresses or contracts. It scans recent approval events and lets users update or revoke permissions through their connected wallet.
>
> So, for inspecting a transaction, use **BlockScan**; for revoking a token allowance, use **Approval Cleanup**. They serve different purposes and are separate projects.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Correctly separates BlockScan transaction inspection from Approval Cleanup's connected-wallet allowance updates/revocation. The answer does not promise complete approval coverage or imply that the assistant performs wallet actions.

**Evidence:** projects/blockscan.md — Overview; projects/approval-cleanup.md — Log processing and wallet actions. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-019

**Question:** How do the database credential exposure concern in BlockScan and the session-security work in Monierave differ? Correct any mistaken assumption in the question.

**Before — unchanged actual answer:**

> The database credential exposure concern in BlockScan and the session-security mechanisms in Monierave address different aspects of security in their respective projects.
>
> In BlockScan, the focus is on preventing exposure of sensitive API credentials (specifically Alchemy credentials) by using Vercel API proxies. This approach keeps the credentials out of the browser bundle, ensuring they are not exposed to users or client-side code. This is primarily about protecting external service credentials from being leaked in the frontend code.
>
> In contrast, Monierave’s session-security work involves backend mechanisms such as rotating refresh tokens, revocable sessions, audit records, and reconciliation checks. These features are designed to securely manage user authentication sessions, prevent unauthorized access, and maintain integrity in a banking simulation context. The security here is about controlling and safeguarding user sessions and authentication state within the backend system.
>
> So, the key difference is that BlockScan’s credential handling protects external API keys from frontend exposure, while Monierave’s session security manages user authentication and session lifecycle securely on the backend.
>
> Your question assumes both relate to the same type of security concern, but they actually address distinct security challenges: credential exposure prevention in a frontend blockchain explorer versus session and authentication security in a backend banking simulation.

**After — unchanged actual answer:**

> The database credential exposure concern in BlockScan and the session-security mechanisms in Monierave differ fundamentally in scope and nature:
>
> - In BlockScan, the credential exposure concern specifically relates to Alchemy provider API credentials used for blockchain data access. Favour implemented Vercel API proxies to keep these Alchemy credentials out of the browser bundle, preventing client-side exposure. These are not database credentials but API keys for an external service.
>
> - In contrast, Monierave’s session-security features focus on secure user authentication and session management within a banking simulation backend. This includes rotating refresh tokens, revocable sessions, audit records, and reconciliation checks to maintain session integrity and security. The system uses PostgreSQL and Redis for durable records and background processing but does not document any database credential exposure issue.
>
> So, the mistaken assumption in the question is that BlockScan’s credential exposure concern involves database credentials; it actually concerns external API credentials. Meanwhile, Monierave’s session-security work addresses user session management and backend transaction integrity, not credential exposure of database access.
>
> In summary:  
> • BlockScan protects external API keys from client exposure via API proxies.  
> • Monierave secures user sessions and backend transaction processing with token rotation, revocable sessions, and audit mechanisms.  
> They address different security aspects and do not overlap in credential exposure concerns.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/1/2.

**AI-written rationale:** Explicitly corrects the actual false premise: BlockScan protects Alchemy API credentials, not database credentials. It then contrasts Monierave's token rotation, session revocation, and audit mechanisms. The opening still repeats the mistaken phrase and the response is verbose, so clarity remains 1. The correction is nevertheless present, unlike the original answer. The rubric does not require it to occur in the first sentence.

**Evidence:** projects/blockscan.md — Navigation, watchlist, and credential handling; projects/monierave.md — Background processing and security. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### eval-020

**Question:** Does Favour describe security mainly as an alternative to a good interface, or as something that should accompany it? Contrast his stated priorities.

**Before — unchanged actual answer:**

> Favour describes security not as an alternative to a good interface but as something that should accompany it. He values a beautiful, functional interface that looks good, feels easy to use, and loads quickly—but he also emphasizes the importance of security across the whole system. He respects engineers who prioritize security even if it means delaying a release. For him, the ideal product combines a thoughtfully designed backend with serious attention to security, supporting a useful and safe user experience rather than compromising one for the other.

**After — unchanged actual answer:**

> Favour describes security not as an alternative to a good interface but as something that should accompany it. He values a beautiful, functional interface that looks good, feels easy to use, and loads quickly—but he also emphasizes the importance of security across the whole system. He respects engineers who prioritize security even if it means delaying a release. For him, the ideal product combines a thoughtfully designed backend with serious attention to security, supporting a well-architected, useful, and safe system rather than sacrificing security for interface alone.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Faithfully describes attractive/functional interfaces and security as complementary, and supports release-delay preference with the recorded engineering perspective. It does not turn that value statement into a credential or verified project result.

**Evidence:** profile/engineering-perspective-and-interests.md — Favour's engineering perspective — in his own words. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-001

**Question:** Did Favour build Policy.ng's AI backend, or connect the question interface to it?

**Before — unchanged actual answer:**

> Favour did not build Policy.ng's AI backend. His responsibility is the frontend engineering, including integrating the AI-assisted question interface with the backend AI services. He connects the question interface on the frontend to the backend but the backend and underlying AI services are handled separately by others.

**After — unchanged actual answer:**

> Favour did not build Policy.ng's AI backend. His responsibility is the frontend engineering, including integrating the AI-assisted question interface with the backend services. He connects the question interface on the frontend to the backend AI services, which are handled separately by the backend engineer.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Maintains the distinction between Policy.ng frontend integration and the separate backend/AI work. The mention of a backend engineer is supported by the collaboration document; no underlying provider or model ownership is invented.

**Evidence:** experience/flamong-policy-ng.md — Product and responsibility. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-002

**Question:** How many paying customers does Monierave serve today?

**Before — unchanged actual answer:**

> Monierave does not serve any paying customers today. It is a portfolio banking simulation built by Favour for exploring backend and frontend engineering of financial transactions, but it is not a licensed bank or a service handling real customers' money.

**After — unchanged actual answer:**

> Monierave does not have any documented paying customers. It is a portfolio banking simulation built by Favour for exploring backend and frontend engineering concepts, not a licensed bank or a service handling real customer money. Therefore, the current number of paying customers is unknown and not established in the available information.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** The answer now says there are no documented paying customers and explicitly concludes that the current count is unknown, rather than asserting that the actual count is zero. In context, this describes absence of recorded customer information, not absence of customers. The simulation limitation remains supported. This resolves the original unsupported current-count claim.

**Evidence:** projects/monierave.md — Overview and contribution; Limitations. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-003

**Question:** Why doesn't retrying a transfer mean sending the money twice in Monierave?

**Before — unchanged actual answer:**

> Retrying a transfer in Monierave does not mean sending the money twice because the system uses idempotency keys to prevent duplicate transfers. Each transfer is recorded in an append-only double-entry ledger within a PostgreSQL transaction that groups related changes atomically. Row-level locking handles concurrency, ensuring that retries do not create duplicate entries. Additionally, Monierave's transactional outbox design allows workers to retry background tasks safely without risking duplicate money movement, since the durable database state and job queue are managed separately but consistently. This combination of idempotency, transactional integrity, and concurrency control ensures that retrying a transfer request does not result in sending the money twice.

**After — unchanged actual answer:**

> Retrying a transfer in Monierave does not mean sending the money twice because of several coordinated mechanisms designed to ensure transfer integrity:
>
> - Transfers are recorded in an append-only double-entry ledger within PostgreSQL transactions, which keep related database changes atomic.
> - Row-level locking manages concurrent operations on accounts to prevent conflicting updates.
> - Idempotency keys are used to recognize and prevent duplicate transfer requests from creating multiple transfers.
> - A transactional outbox pattern connects durable database changes to asynchronous background processing, allowing retries of tasks without duplicating committed transfers.
>
> Together, these features mean that if a transfer request is retried (for example, due to a network failure or timeout), the system detects the repeated request via the idempotency key and avoids recording the same money movement twice. However, it is important to note that this design describes intended behavior and is not independently verified as guaranteeing exactly-once execution under all failure conditions.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Separates idempotency-key repeated-request recognition, transaction atomicity, row-lock concurrency control, and outbox background retries. Most importantly, it explicitly limits the explanation to intended behavior and says exactly-once execution under all failures is not independently verified. That qualification and improved role attribution resolve the original overstatement. The outbox explanation is interpreted within asynchronous task retries, not as a separately proven money-transfer deduplication mechanism.

**Evidence:** projects/monierave.md — Transfer integrity and concurrency. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-004

**Question:** And what happens if the email service fails afterward?

**Unchanged supplied history:**

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

**Before — unchanged actual answer:**

> If the email service fails after a transfer in Monierave, the system's design using a transactional outbox and background processing helps ensure transfer integrity and retries. The transactional outbox records durable work in PostgreSQL, while Redis and Asynq handle asynchronous processing and retries. This means that even if sending the email notification fails temporarily, the background job can retry sending it without affecting the recorded transfer itself. The transfer and its database changes remain consistent and durable regardless of email delivery success.

**After — unchanged actual answer:**

> If the email notification service fails after a transfer is already committed in Monierave, the system uses a transactional outbox pattern to record the notification work durably in the database. This allows background workers to retry sending the notification asynchronously without blocking or invalidating the completed transfer. However, the documentation does not specify a retry limit or guarantee eventual delivery of the email; it only ensures that notification failure does not affect the committed transfer itself.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Resolves the supplied transfer follow-up and separates durable committed transfer state from notification retries. It now explicitly says no retry limit or eventual-delivery guarantee is documented, avoiding the 'until successful' regression in the second prompt-only attempt. The explanation is design-level reasoning, not verification of the worker implementation.

**Evidence:** projects/monierave.md — Transfer integrity and concurrency; Background processing and security. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-005

**Question:** Since BucketFlow is a production banking service, can I deposit my salary?

**Before — unchanged actual answer:**

> No, you cannot deposit your salary into BucketFlow as if it were a production banking service. BucketFlow is a demonstration application running on the Ethereum Sepolia test network, designed to show on-chain stablecoin allocation logic. It is not a regulated savings product or a licensed bank, so it does not handle real money or salary deposits.

**After — unchanged actual answer:**

> BucketFlow is a demonstration application for stablecoin allocation on an Ethereum test network (Sepolia). It is not a regulated banking or savings product and does not provide a general custody guarantee. Therefore, you cannot deposit your real salary into BucketFlow as a production banking service.
>
> Similarly, Monierave is a full-stack banking simulation, not a licensed bank or a service for handling customers' real money. It is designed for exploring banking backend and frontend engineering, not for actual salary deposits or real money management.
>
> In summary, neither BucketFlow nor Monierave supports real salary deposits or handling real funds as a production banking service.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/1/2.

**AI-written rationale:** Rejects real-salary use and preserves Sepolia/demo scope and the absence of a general custody guarantee in the supplied evidence. It unnecessarily adds Monierave and a repeated summary, so relevance/clarity is 1. It does not claim a specific legal audit or regulatory approval result, unlike the failing comparative answer.

**Evidence:** projects/bucketflow.md — Network and limitations. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-006

**Question:** Will Cleanup definitely find every approval my wallet has ever granted?

**Before — unchanged actual answer:**

> No, Cleanup cannot definitely find every approval your wallet has ever granted. It scans only a recent block window and is limited by RPC provider constraints and non-standard tokens, so it cannot guarantee a complete history of all approvals.

**After — unchanged actual answer:**

> No, Cleanup cannot definitely find every approval your wallet has ever granted. It scans only a recent block window, so it cannot guarantee a complete history of all approvals. Additionally, provider constraints and non-standard tokens may affect what Cleanup detects.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Retains all essential scan limitations: recent block window, provider constraints, and non-standard tokens. It correctly refuses to promise complete allowance history and introduces no unsupported security guarantee.

**Evidence:** projects/approval-cleanup.md — Coverage limitations. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-007

**Question:** Can you verify Favour's availability this minute and book an interview?

**Before — unchanged actual answer:**

> I cannot verify Favour's real-time availability or book an interview on your behalf. However, as of 10 November 2026, Favour is open to full-time, freelance, or contract roles and welcomes professional opportunities. To arrange an interview or contact him, you can email Favour directly at ututufavour7@gmail.com.

**After — unchanged actual answer:**

> I cannot verify Favour's real-time availability or book interviews on his behalf. However, as of 10 November 2026, Favour is open to full-time, freelance, or contract roles and interested in professional opportunities worldwide, including remote work. To arrange an interview or discuss opportunities, you can contact him directly via his public email: ututufavour7@gmail.com.

**AI verdict:** pass → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** Clearly disclaims real-time availability checks and booking capability, uses the dated confirmation, and supplies the correct email. Worldwide/remote interest is supported. No external action is claimed.

**Evidence:** opportunities/availability-and-contact.md — Availability and interests; Contact. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

### heldout-008

**Question:** What measured accuracy does this portfolio assistant achieve, and what does its offline test suite prove?

**Before — unchanged actual answer:**

> The Portfolio RAG Assistant achieves measured accuracy through a 50-question evaluation dataset with reference answers, answerability labels, and document-and-section evidence groups. Its retrieval metrics include mean reciprocal rank (MRR) and section-based evidence-group coverage. Structured answer judging scores assess accuracy, completeness, relevance, and grounding.
>
> The offline test suite verifies implementation behavior with storage and providers mocked, ensuring correct functioning of the system components. However, these offline tests do not establish real retrieval quality or generated-answer quality in production. Thus, the evaluation proves the assistant's correctness in handling data and retrieval logic but does not guarantee production-scale accuracy or uptime.

**After — unchanged actual answer:**

> The Portfolio RAG Assistant includes a 50-question evaluation dataset with reference answers and metrics like mean reciprocal rank (MRR) and evidence-group coverage. It uses structured answer judging to score accuracy, completeness, relevance, and grounding. However, no verified overall answer-accuracy figure is supplied. The offline test suite checks implementation behavior with mocked storage and providers but does not establish real retrieval quality or generated-answer correctness. Thus, while the dataset and tests support evaluation and development, they do not prove measured accuracy or overall correctness of the assistant’s answers.

**AI verdict:** fail → pass. **After scores S/C/R/U:** 2/2/2/2.

**AI-written rationale:** States that no verified overall answer-accuracy figure is supplied, accurately describes evaluation capability, and confines mocked tests to implementation checks. It no longer equates the dataset with achieved measured accuracy or claims that tests prove overall correctness. This resolves the original tooling-versus-result conflation.

**Evidence:** projects/portfolio-rag-assistant.md — Evaluation and testing interfaces. See the frozen [before sources](source-evidence.json) and [after sources](after/source-evidence.json).

**Human review:** pending.

## Artifacts and verification

- [Original report](REPORT.md), [original AI grades](ai-reviews.json), and original manifest remain unchanged.
- [First prompt-only attempt](attempt-1/baseline.json), [held-out outputs](attempt-1/heldout.json), [AI grades](attempt-1/ai-reviews.json), [prompt](attempt-1/system-prompt.txt).
- [Second prompt-only attempt](attempt-2/baseline.json), [held-out outputs](attempt-2/heldout.json), [AI grades](attempt-2/ai-reviews.json), [prompt](attempt-2/system-prompt.txt).
- [First clarified-corpus attempt](attempt-3/baseline.json), [held-out outputs](attempt-3/heldout.json), [AI grades](attempt-3/ai-reviews.json), [prompt](attempt-3/system-prompt.txt), [source snapshot](attempt-3/source-evidence.json).
- Final [baseline outputs](after/baseline.json), [held-out outputs](after/heldout.json), [AI scores/rationales](after/ai-reviews.json), [source snapshot](after/source-evidence.json), [prompt](after/system-prompt.txt), [implementation patch](after/implementation.patch), and [computed summary](after/summary.json).
- [Comparison manifest](after/manifest.json) binds all attempts and source/score artifacts by SHA-256. [compare.py](compare.py) validates and regenerates this comparison offline without generating answers or scores.

Generation failures, if any, must remain failures rather than silently disappearing from the denominator. This record contains 28 completed answers per round. No deployed service was changed and no fix commit or push was made by this comparison script.
