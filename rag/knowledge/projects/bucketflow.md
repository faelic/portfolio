---
id: project-bucketflow
title: BucketFlow — Stablecoin allocation application
category: projects
topics:
- Blockchain engineering
- Stablecoin allocation
- Smart contracts
- Wallet integration
- Transaction states
- Test networks
entities:
- Favour Chukwuemerie Ututu
- BucketFlow
- USDC
- Ethereum Sepolia
provenance:
- path: rag/sources/original-portfolio-knowledge.md
  sections:
  - Independent projects > BucketFlow — Stablecoin allocation application
  - What Favour works on > Blockchain engineering
  - About Favour
- path: rag/sources/confirmed-portfolio-details.md
  sections:
  - Evaluation-driven evidence boundaries — 19 November 2026
---

# BucketFlow — Stablecoin allocation application

**Type:** Independent blockchain application  
**Repository:** https://github.com/faelic/bucketflow  
**Application:** https://bucketflow-tau.vercel.app/  
**Stack:** Next.js, React, TypeScript, TanStack Query, Solidity, wagmi, viem, Foundry.

## Overview and contribution

BucketFlow lets users set rules for splitting a USDC deposit among financial buckets, such as savings and other planned expenses. The allocation must account for the full deposit. Favour built the interface and connected it to a Solidity vault that applies the allocation and withdrawal rules.

BucketFlow's documented application uses Ethereum Sepolia, a test network. It is a demonstration of on-chain allocation logic, not a regulated savings product.

That scope statement is not a legal assessment of regulatory status or
backing, and does not establish a general custody guarantee. No legal or
regulatory review is recorded in this knowledge base.

## Wallet and transaction implementation

BucketFlow handles wallet connection, token spending approvals, deposits, transaction receipts, bucket balances, and withdrawals. It also shows network and transaction states so a pending on-chain action is not presented as confirmed. The contract enforces a 30-day withdrawal cooldown for its savings bucket.

## Network and limitations

The documented application uses Ethereum Sepolia, a test network. BucketFlow is a demonstration of on-chain allocation logic, not a regulated savings product.
