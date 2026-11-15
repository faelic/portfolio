import type { ProjectKey } from "../types/portfolio";

export const projectCases: Record<ProjectKey, { problem: string; contribution: string; decision: string; boundary: string }> = {
  champ: {
    problem: "Move money between internal accounts while handling retries, concurrent transfers, and downstream failures.",
    contribution: "Built the Go backend, PostgreSQL ledger and transaction flow, session lifecycle, and asynchronous delivery pipeline.",
    decision: "Commit ledger postings and an outbox job in the same database transaction. Deliver email afterward so a delivery failure does not undo a completed transfer.",
    boundary: "Advanced backend learning project and portfolio demonstration; not a licensed banking product. Inspect the repository for implementation and tests.",
  },
  eau: {
    problem: "Make Nigerian civic information easier to discover, and give editors a consistent way to manage it.",
    contribution: "Contributed React interfaces across the public platform and authenticated admin dashboard, including forms, content workflows, API integrations, and important admin tests.",
    decision: "Use shared interface patterns and TanStack Query across more than 40 REST endpoints to keep search, pagination, updates, and validation consistent.",
    boundary: "Collaborative product. My contribution is frontend engineering; the platform and its backend are team work.",
  },
  silences: {
    problem: "Split a freelancer's incoming USDC into useful balances before it disappears into one undifferentiated account.",
    contribution: "Built the Solidity vault and Next.js interface, including allocation rules, approvals, deposits, withdrawals, receipts, and transaction states.",
    decision: "Validate allocations in both the interface and contract, then use confirmed contract state and events to update balances and activity.",
    boundary: "Live V1 on Ethereum Sepolia. Test-network work, not a production financial service.",
  },
  revolte: {
    problem: "Make raw blockchain records easier to search, navigate, and understand.",
    contribution: "Built unified block, transaction, and wallet search, readable chain-data views, NFT metadata display, and a local address watchlist.",
    decision: "Classify the search input and route the response into a focused view instead of exposing raw RPC responses.",
    boundary: "Early blockchain learning project using Sepolia and Alchemy. Public data integration is not evidence of production-scale indexing.",
  },
  lisiere: {
    problem: "Help a wallet owner discover and review token permissions that may still be active.",
    contribution: "Built approval-event scanning, current-allowance checks, and a guided faucet, approve, update, and revoke workflow.",
    decision: "Scan smaller block ranges, reconstruct the latest token/spender relationship, and read the current allowance before presenting it for review.",
    boundary: "Sepolia MVP with a recent scan window. It does not establish complete approval coverage or identify every malicious spender.",
  },
  elan: {
    problem: "Hold a payment until an agreed arbiter decides whether to release or refund it.",
    contribution: "Built the Solidity role and lifecycle rules and connected a React interface to wallet, network, permission, and transaction state.",
    decision: "Enforce role checks and allowed state transitions in the contract, while the interface explains which actions the connected participant can take.",
    boundary: "Learning project with repository evidence. The frontend is not deployed.",
  },
};
