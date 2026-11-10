---
id: "project-approval-cleanup"
title: "Approval Cleanup — ERC-20 wallet-permission manager"
aliases: ["Cleanup", "Allowance Cleanup"]
topic: "projects"
topics:
  - "Blockchain engineering"
  - "Token approvals"
  - "Wallet permissions"
  - "RPC log processing"
  - "Wallet integration"
  - "Scan coverage"
entities: ["Favour Chukwuemerie Ututu", "Approval Cleanup", "ERC-20"]
source: "rag/sources/original-portfolio-knowledge.md"
source_sections: ["Independent projects > Approval Cleanup — ERC-20 wallet-permission manager", "What Favour works on > Blockchain engineering", "About Favour"]
additional_sources:
  - source: "rag/sources/confirmed-portfolio-details.md"
    source_sections: ["Project links and names"]
---

# Approval Cleanup — ERC-20 wallet-permission manager

**Type:** Independent blockchain application  
**Also known as:** Cleanup; Allowance Cleanup.  
**Repository:** https://github.com/faelic/approval-cleanup  
**Application:** https://approval-cleanup-brt3.vercel.app/  
**Stack:** Next.js, React, TypeScript, wagmi, viem, Hardhat, OpenZeppelin.

## Overview and contribution

Approval Cleanup helps wallet owners review ERC-20 token allowances granted to other addresses or contracts. Favour built the interface for scanning recent Approval events, identifying the latest observed token-and-spender allowances, and calling attention to permissions that deserve a closer look, including unlimited and older approvals.

Approval Cleanup scans a recent block window and cannot guarantee a complete history of every approval a wallet has ever granted.

## Log processing and wallet actions

Approval Cleanup retrieves logs in batches that work within RPC provider limits, then separates normalization and risk checks from the interface. Users can review an allowance and initiate an update or revocation through their connected wallet.

Approval Cleanup's scan covers a recent block window; provider constraints and non-standard tokens can affect the results.

## Coverage limitations

Because Approval Cleanup's scan covers a recent block window, it cannot guarantee a complete history of every approval a wallet has ever granted. Non-standard tokens and provider constraints can also affect what the application finds.
