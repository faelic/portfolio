---
id: "project-blockscan"
title: "BlockScan — Sepolia blockchain explorer"
topic: "projects"
topics:
  - "Frontend engineering"
  - "Blockchain explorers"
  - "Blockchain data"
  - "Live-data updates"
  - "Accessible interfaces"
  - "Credential handling"
entities: ["Favour Chukwuemerie Ututu", "BlockScan", "Ethereum Sepolia", "Alchemy"]
source: "rag/sources/original-portfolio-knowledge.md"
source_sections: ["Independent projects > BlockScan — Sepolia blockchain explorer", "What Favour works on > Frontend engineering", "About Favour"]
additional_sources:
  - source: "rag/sources/confirmed-portfolio-details.md"
    source_sections: ["Project links and names"]
---

# BlockScan — Sepolia blockchain explorer

**Type:** Independent frontend project  
**Repository:** https://github.com/faelic/sepolia-blockexplorer  
**Application:** https://blockscan-seven.vercel.app/  
**Stack:** React, JavaScript, React Router, React Testing Library, Alchemy SDK/RPC, Vercel.

## Overview

BlockScan is a blockchain explorer for Ethereum Sepolia. It lets users inspect blocks, transactions, wallet addresses, account activity, and NFT metadata.

## Search and live-data implementation

Favour built a global search feature that distinguishes block numbers, transaction hashes, and wallet addresses and opens the appropriate result. The live-block feed checks for new data while preventing overlapping requests and duplicate results. It preserves the existing results if a refresh fails and avoids unnecessary polling when the page is not visible.

BlockScan's live-block feed also avoids updates that overwrite valid information.

## Navigation, watchlist, and credential handling

For BlockScan, Favour also built a persistent watchlist, keyboard-accessible search, route-level code splitting, and Vercel API proxies that keep Alchemy credentials out of the browser bundle.
