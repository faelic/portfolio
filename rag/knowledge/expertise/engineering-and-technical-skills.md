---
id: expertise-engineering
title: Favour's engineering areas and technical skills
category: expertise
topics:
- Backend engineering
- Frontend engineering
- AI application engineering
- Blockchain engineering
- Retrieval-augmented generation
- Authentication and sessions
- Database transactions
- Background processing
- Software testing
- Continuous delivery
- Full-stack engineering
- Python
- Large language models
- Semantic search
- Evaluation
entities:
- Favour Chukwuemerie Ututu
- Monierave
- Policy.ng
- BlockScan
- BucketFlow
- Approval Cleanup
- Portfolio RAG Assistant
- LangChain
- OpenAI
- Chroma
- Gradio
provenance:
- path: rag/sources/original-portfolio-knowledge.md
  sections:
  - What Favour works on > Backend engineering
  - What Favour works on > Frontend engineering
  - What Favour works on > AI engineering
  - What Favour works on > Blockchain engineering
  - Technical skills
- path: rag/sources/confirmed-portfolio-details.md
  sections:
  - AI application experience
  - Professional positioning and portfolio RAG implementation
---

# Favour's engineering areas and technical skills

## Backend engineering and data

Favour builds API-driven backend systems with Go. His backend project work covers authentication, account and session management, database transactions, background jobs, and testing.

**Backend and data:** Go, Gin, SQL, PostgreSQL, SQLC, pgx, Redis, Asynq, REST APIs, authentication, session management, database transactions, idempotency, concurrency control, background jobs, transactional outbox.

Monierave is Favour's main documented backend example: a banking simulation exploring transaction integrity, secure sessions, and background processing. It is not a licensed bank or a service for customers' real money.

## Frontend engineering

Favour builds frontend interfaces for public websites, administration dashboards, financial workflows, blockchain explorers, and wallet-connected applications.

**Frontend:** TypeScript, JavaScript, React, Next.js, Vite, React Router, Wouter, Tailwind CSS, Radix UI, TanStack Query, React Hook Form, Zod, accessible interfaces, client and server state management.

Favour's frontend examples include Policy.ng's public website and administrative tools, and BlockScan's live blockchain explorer. Favour's Policy.ng responsibility is frontend engineering, including the AI-assisted question interface; the backend and underlying AI services are separate responsibilities.

## AI application engineering

Favour builds LLM-powered applications with Python. His Portfolio RAG Assistant connects visitor questions to curated portfolio knowledge, retrieves relevant passages, and generates concise answers grounded in those passages.

Favour implemented Markdown ingestion with YAML metadata extraction, heading-aware token-bounded chunking, embedding generation and vector storage, semantic retrieval, conversation-aware query rewriting, prompt and context construction, and grounded answering. The implementation uses LangChain, OpenAI embeddings and chat models, and Chroma.

**AI engineering:** Python, large language models (LLMs), retrieval-augmented generation (RAG), document ingestion, YAML metadata, text chunking, embeddings, vector databases, semantic search, context construction, prompt engineering, grounded generation, and evaluation.

Favour also implemented a 50-question evaluation dataset, section-based retrieval scoring using mean reciprocal rank (MRR) and evidence-group coverage, and structured answer judging for accuracy, completeness, relevance, and grounding. Gradio interfaces support conversational testing, evidence inspection, individual cases, and category-level evaluation charts. Implemented evaluation tooling does not by itself establish measured retrieval quality.

## Blockchain engineering

Favour has built Solidity contracts and Ethereum-connected applications. His work covers wallet connections, token approvals, contract events, transaction receipts, RPC data, and handling wallet or network mismatches in the UI.

**Blockchain:** Solidity, Ethereum, Foundry, Hardhat, OpenZeppelin, wagmi, viem, Ethers.js, Alchemy SDK/RPC.

BucketFlow and Approval Cleanup are examples of how Favour has combined smart-contract behavior with frontend interfaces.

## Testing and delivery

Favour's testing and delivery skills include Go testing, Vitest, Playwright, React Testing Library, MSW, Docker, Git, GitHub Actions, CI/CD, and Vercel.
