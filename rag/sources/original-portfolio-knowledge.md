# Favour Chukwuemerie Ututu

**Software Engineer**

**Professional focus:** Backend systems, frontend applications, and AI systems.  
**Other work:** Blockchain applications and smart contracts.  
**Email:** ututufavour7@gmail.com

## About Favour

Favour Chukwuemerie Ututu builds software across the frontend, backend, and AI application stack. He works with Go, PostgreSQL, Redis, React, Next.js, and TypeScript, and has built blockchain applications using Solidity and Ethereum tooling.

At Flamong, he owns the frontend of [Policy.ng](https://policy.ng/), working on both the public website and the administrative tools behind it. His independent projects cover a wider range of engineering problems: Monierave is a banking simulation built around transaction integrity and reliable background processing; BucketFlow applies allocation rules through a Solidity contract; BlockScan explores live blockchain data; and Approval Cleanup helps people inspect token-spending permissions.

Favour also builds AI systems. His interests include LLM applications, retrieval-augmented generation (RAG), the data pipelines behind retrieval, and assessing whether generated answers are supported by the available information. He is currently learning **agentic AI engineering**, extending his work toward AI applications that use tools and carry out multi-step tasks.

## In Favour's words

### How I think about engineering

I started my career as a frontend engineer, so I've always loved seeing beautiful user interfaces. But they have to work, too. I love an interface that looks good, feels easy to use, and loads quickly. I don't want to wait a minute for a page to load just to do something simple.

As I kept building, I got more curious about what happens beneath the interface. Security, especially, caught my attention. It could be frontend security, backend security, or AI security. I want to understand where things can go wrong, what makes a system vulnerable, and what it takes to protect it. That curiosity is also what got me interested in AI safety.

I love learning from well-architected products and the engineers who build them. I have a lot of respect for engineers who would rather delay a release than compromise on security. For me, it's exciting to see a beautiful, functional interface sitting on top of a thoughtfully designed backend, with security taken seriously across the whole system.

I've carried that same thinking into my work with agentic systems. Getting an agent to work is one part of the challenge. I also care about the boundaries around it: what it can access, what actions it can take, what needs human approval, and how it behaves when something unexpected happens. As I continue learning agentic AI engineering, I want to get better at building systems that are useful without being careless about safety.

### What I enjoy

I love coding. I enjoy working with LLMs, experimenting with what they can do, and learning how to unlock more of AI's potential. I'm especially curious about what becomes possible as AI systems get better at using tools and handling more complex tasks.

And I love playing video games. I really do. It's one of my favourite things to do outside coding.

## What Favour works on

### Backend engineering

Favour builds API-driven backend systems with Go. He has worked with Gin, PostgreSQL, SQLC, pgx, Redis, and Asynq. His backend project work covers authentication, account and session management, database transactions, background jobs, and testing.

Monierave is his main documented example of this work. Its transfer flow uses idempotency keys to handle repeated requests, PostgreSQL row-level locks to manage concurrent operations, and double-entry postings to record money movements. A transactional outbox connects durable database changes to asynchronous processing. Workers can retry tasks without treating the database and the job queue as a single transaction.

The system also includes refresh-token rotation, session revocation, audit records, and reconciliation-related workflows. These features were built into a banking simulation and demonstrate the backend design problems Favour has chosen to study and implement.

### Frontend engineering

Favour builds interfaces with React, Next.js, TypeScript, JavaScript, Tailwind CSS, and related tools. He has worked on public websites, administration dashboards, financial workflows, blockchain explorers, and wallet-connected applications.

On Policy.ng, he maintains the React and TypeScript frontend and connects it to backend services using TanStack Query. His work includes form validation with React Hook Form and Zod, authenticated navigation, role and permission checks, state updates after administrative actions, and handling failures without losing the user's work. He has written tests with Vitest and Playwright.

In BlockScan, the problems are different. Blockchain data keeps changing, so its live-block feed has to avoid duplicate requests and updates that overwrite valid information. The application also uses route-based loading, a watchlist, and an accessible search interface.

### AI engineering

Favour builds AI applications and is developing his practice in LLM application engineering. The areas he works with include RAG, document preparation, chunking, embeddings, vector search, semantic retrieval, reranking, prompt and context construction, and evaluation of generated answers.

He plans to apply these ideas in an AI assistant on his portfolio. The assistant is not implemented yet. It is intended to use a curated knowledge base about his work to support answers to visitor questions.

Favour is **currently learning agentic AI engineering**, with an interest in how AI applications use tools, coordinate steps, and handle more involved tasks. This is part of his continuing study of AI application development.

### Blockchain engineering

Favour has built Solidity contracts and Ethereum-connected applications. His work covers wallet connections, token approvals, contract events, transaction receipts, RPC data, and handling wallet or network mismatches in the UI.

He uses Solidity, Foundry, Hardhat, OpenZeppelin, wagmi, viem, Ethers.js, and Alchemy SDK/RPC. BucketFlow and Approval Cleanup are two examples of how he has combined smart-contract behavior with frontend interfaces.

## Professional experience

### Flamong — Frontend Developer Intern

**Product:** [Policy.ng](https://policy.ng/)  
**Role:** Frontend engineering for the public website and administrative dashboard.

Policy.ng helps visitors find and understand public policies and information about public officials. It also includes civic content and AI-assisted policy questions, with administrative features for managing the information and interactions on the site.

Favour is the sole frontend engineer on the product. He builds and maintains the public-facing pages and authenticated administration tools using React and TypeScript. His work includes policy search and detail views, public-official directories, AI-assisted question interfaces, comments and administrative replies, moderation, content editing, and subscriber management.

He integrates the frontend with the backend using TanStack Query. When an API response differs from what a screen expects, or a new workflow needs an additional endpoint, he works with the backend engineer to resolve it. He has adapted the comments experience to support nested administrative replies and updated the affected UI states.

The administrative side also requires permission checks, forms that reject invalid data, protection against duplicate submissions, warnings for unsaved edits, and refreshed information after updates. Favour has added automated coverage for selected workflows with Vitest and Playwright. He collaborates with the product manager, backend engineer, mobile engineer, and company leadership during development and release.

His responsibility at Policy.ng is the frontend, including the integration of its AI-assisted question interface. The product's backend and underlying AI services are separate from that frontend responsibility.

## Independent projects

### Monierave — Full-stack banking simulation

**Type:** Independent full-stack project  
**Repository:** https://github.com/faelic/monierave  
**Application:** https://monierave.favourututu.com/  
**Stack:** Go, Gin, PostgreSQL, SQLC, pgx, Redis, Asynq, Next.js, React, TypeScript, TanStack Query, React Hook Form, Zod, Docker.

Monierave is a banking simulation through which Favour explored the backend and frontend engineering of financial transactions. He built account registration and verification, authentication, account management, beneficiaries, transfers, transaction history, statements, and profile and security features.

A transfer in Monierave is recorded through an append-only double-entry ledger. PostgreSQL transactions keep related database changes together, row-level locking deals with concurrent account operations, and idempotency keys help prevent the same request from creating duplicate transfers. Business rules are enforced by the backend.

Background work uses a transactional outbox. PostgreSQL holds the durable record of work to be performed, while Redis and Asynq support processing and retries. The system also includes rotating refresh tokens, revocable sessions, audit records, and reconciliation-related checks.

On the frontend, Favour used TanStack Query to manage server data and React Hook Form with Zod for form handling. He added backend, integration, and end-to-end tests, including tests for transfer behavior under concurrency.

Monierave is a portfolio banking simulation. It is not a licensed bank or a service for handling customers' real money.

### BucketFlow — Stablecoin allocation application

**Type:** Independent blockchain application  
**Repository:** https://github.com/faelic/bucketflow  
**Application:** https://bucketflow-tau.vercel.app/  
**Stack:** Next.js, React, TypeScript, TanStack Query, Solidity, wagmi, viem, Foundry.

BucketFlow lets users set rules for splitting a USDC deposit among financial buckets, such as savings and other planned expenses. The allocation must account for the full deposit. Favour built the interface and connected it to a Solidity vault that applies the allocation and withdrawal rules.

The application handles wallet connection, token spending approvals, deposits, transaction receipts, bucket balances, and withdrawals. It also shows network and transaction states so a pending on-chain action is not presented as confirmed. The contract enforces a 30-day withdrawal cooldown for its savings bucket.

The documented application uses Ethereum Sepolia, a test network. BucketFlow is a demonstration of on-chain allocation logic, not a regulated savings product.

### BlockScan — Sepolia blockchain explorer

**Type:** Independent frontend project  
**Stack:** React, JavaScript, React Router, React Testing Library, Alchemy SDK/RPC, Vercel.

BlockScan is a blockchain explorer for Ethereum Sepolia. It lets users inspect blocks, transactions, wallet addresses, account activity, and NFT metadata.

Favour built a global search feature that distinguishes block numbers, transaction hashes, and wallet addresses and opens the appropriate result. The live-block feed checks for new data while preventing overlapping requests and duplicate results. It preserves the existing results if a refresh fails and avoids unnecessary polling when the page is not visible.

He also built a persistent watchlist, keyboard-accessible search, route-level code splitting, and Vercel API proxies that keep Alchemy credentials out of the browser bundle.

### Approval Cleanup — ERC-20 wallet-permission manager

**Type:** Independent blockchain application  
**Stack:** Next.js, React, TypeScript, wagmi, viem, Hardhat, OpenZeppelin.

Approval Cleanup helps wallet owners review ERC-20 token allowances granted to other addresses or contracts. Favour built the interface for scanning recent Approval events, identifying the latest observed token-and-spender allowances, and calling attention to permissions that deserve a closer look, including unlimited and older approvals.

The project retrieves logs in batches that work within RPC provider limits, then separates normalization and risk checks from the interface. Users can review an allowance and initiate an update or revocation through their connected wallet.

Because the scan covers a recent block window, it cannot guarantee a complete history of every approval a wallet has ever granted. Non-standard tokens and provider constraints can also affect what the application finds.

## Technical skills

**Backend and data:** Go, Gin, SQL, PostgreSQL, SQLC, pgx, Redis, Asynq, REST APIs, authentication, session management, database transactions, idempotency, concurrency control, background jobs, transactional outbox.

**Frontend:** TypeScript, JavaScript, React, Next.js, Vite, React Router, Wouter, Tailwind CSS, Radix UI, TanStack Query, React Hook Form, Zod, accessible interfaces, client and server state management.

**AI application engineering:** Large language models (LLMs), retrieval-augmented generation (RAG), document ingestion, text chunking, embeddings, vector databases, semantic search, retrieval, reranking, context construction, grounded generation, evaluation. **Currently learning:** Agentic AI engineering.

**Testing and delivery:** Go testing, Vitest, Playwright, React Testing Library, MSW, Docker, Git, GitHub Actions, CI/CD, Vercel.

**Blockchain:** Solidity, Ethereum, Foundry, Hardhat, OpenZeppelin, wagmi, viem, Ethers.js, Alchemy SDK/RPC.

## Education and training

**Federal University of Technology Minna** — BSc in Quantity Survey.

**Alchemy University** — Frontend engineering training covering React, TypeScript, API integration, and Ethereum-connected applications. The training included wallet interaction, transaction states, reusable UI components, and testing.

**Cyfrin** — Completed blockchain and smart-contract development training.

## Portfolio AI assistant

A conversational AI assistant is planned for [favourututu.com](https://www.favourututu.com/), but is not available yet. The intended assistant will use retrieval-augmented generation to draw on curated information about Favour's professional experience, technical background, and projects.

Planned questions include Favour's contribution to Policy.ng, how Monierave manages repeated transfer requests, what BlockScan does, or which areas of AI engineering he is studying.

## Professional opportunities

Favour is available for opportunities **worldwide** in frontend engineering, backend engineering, full-stack software engineering, and AI engineering. He is interested in roles that involve building applications and backend services, as well as teams working on AI-powered products.

For opportunities or collaborations, the contact method is email: **ututufavour7@gmail.com**.
