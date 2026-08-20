import type { Project, ProjectKey } from "../types/portfolio";

const image = (src: string, alt: string, action: string, treatment: "interface" | "interface-policy" = "interface") => ({
  src: `/assets/projects/${src}`,
  alt,
  treatment,
  action,
});

export const projects: Record<ProjectKey, Project> = {
  champ: {
    key: "champ",
    title: "Monierave",
    desktopLabel: "Monierave",
    icon: "/assets/icons/apps/monierave.svg",
    accent: "#79672d",
    desktopSummary: "Production-like banking backend",
    desktopStack: "Go · PostgreSQL · Redis",
    description: "Monierave is an advanced Go learning project designed as a production-like banking backend—not a licensed banking product. I used it to study how financial correctness, secure sessions, asynchronous delivery, auditability, reconciliation, and operational safeguards fit together inside a deliberately modular monolith.",
    liveUrl: "https://monierave.favourututu.com/",
    repoUrl: "https://github.com/faelic/monierave",
    highlights: [
      "Designed append-only double-entry ledger postings, cached balances, idempotent transfers, limits, and safe reversals",
      "Learned rotating refresh sessions, token-reuse detection, device binding, lifecycle controls, and immutable audits",
      "Built PostgreSQL transactions, Redis and Asynq outbox workers, reconciliation, metrics, rate limits, and invariant tests",
    ],
    meta: [
      ["Project type", "Advanced backend learning project"],
      ["Role", "Backend architecture & implementation"],
      ["Stack", "Go / PostgreSQL / Redis / Asynq"],
      ["Status", "Live portfolio demonstration"],
    ],
    images: [
      image("monierave-hero.png", "Monierave banking website hero with the message Banking made clear", "View the Monierave website"),
      image("monierave-dashboard.png", "Monierave banking dashboard showing accounts and money movement", "Open the Monierave dashboard"),
      image("monierave-transfer.png", "Monierave money-movement workspace reviewing an internal transfer", "Explore money movement in Monierave"),
      image("monierave-account.png", "Monierave USD account detail and transaction history", "View account activity in Monierave"),
    ],
  },
  silences: {
    key: "silences",
    title: "BucketFlow",
    desktopLabel: "BucketFlow",
    icon: "/assets/icons/apps/bucketflow.svg",
    accent: "#63762c",
    desktopSummary: "Stablecoin income infrastructure",
    desktopStack: "Solidity · Next.js · TypeScript",
    description: "BucketFlow is a live Sepolia V1 that organizes incoming USDC for freelancers and builders into practical buckets such as Rent, Savings, Tax, Family Support, and Cash-out. I built the contract and frontend together to learn how product rules, wallet interactions, event-driven receipts, and disciplined savings behavior translate into an on-chain user experience.",
    liveUrl: "https://bucketflow-tau.vercel.app/",
    repoUrl: "https://github.com/faelic/bucketflow",
    highlights: [
      "Built percentage-based split rules, token approval, vault deposit, bucket balances, and selective withdrawal flows",
      "Learned contract and frontend synchronization with Solidity, Foundry, wagmi, viem, and TanStack Query",
      "Designed event-based receipts, wrong-network states, preview mode, and a 30-day savings withdrawal cooldown",
    ],
    meta: [
      ["Project type", "Live V1 / Fintech / Web3"],
      ["Role", "Solo full-stack & smart contracts"],
      ["Stack", "Next.js / React / TypeScript / Solidity / Foundry"],
      ["Status", "Live on Ethereum Sepolia"],
    ],
    images: [
      image("bucketflow-hero.png", "BucketFlow stablecoin income organizer", "Open the live BucketFlow application"),
      image("bucketflow-dashboard.png", "BucketFlow overview dashboard", "View the BucketFlow overview"),
      image("bucketflow-buckets.png", "BucketFlow income buckets", "Explore BucketFlow income buckets"),
      image("bucketflow-split-rules.png", "BucketFlow split-rule editor", "Review BucketFlow split rules"),
      image("bucketflow-overview-focus.png", "Close view of the BucketFlow dashboard", "Open the BucketFlow dashboard"),
    ],
  },
  revolte: {
    key: "revolte",
    title: "BlockScan",
    desktopLabel: "Blockexplorer",
    icon: "/assets/icons/apps/blockexplorer.svg",
    accent: "#087b9f",
    desktopSummary: "Sepolia blockchain explorer",
    desktopStack: "React · Alchemy SDK · Web3",
    description: "BlockScan was one of my first blockchain learning projects: a React-based Sepolia explorer built to understand how frontend applications query, format, and navigate live Ethereum data through the Alchemy SDK. It brings blocks, transactions, wallet activity, NFT metadata, and a persistent watchlist into one responsive interface.",
    liveUrl: "https://blockscan-seven.vercel.app/",
    repoUrl: "https://github.com/faelic/sepolia-blockexplorer",
    highlights: [
      "Learned to query and format live blocks, transactions, balances, receipts, and gas data",
      "Built route-driven React views and unified search for blocks, transaction hashes, and addresses",
      "Worked with NFT metadata, localStorage watchlists, responsive layouts, and asynchronous UI states",
    ],
    meta: [
      ["Project type", "Early learning project / Web3"],
      ["Role", "Frontend & data integration"],
      ["Stack", "React / React Router / JavaScript / Alchemy SDK"],
      ["Status", "Live on Ethereum Sepolia"],
    ],
    images: [
      image("blockscan-home.png", "BlockScan home with unified explorer search", "Open the live BlockScan explorer"),
      image("blockscan-account.png", "BlockScan account details", "Open the live BlockScan explorer"),
      image("blockscan-nft-doodle.png", "BlockScan NFT metadata result", "Open the live BlockScan explorer"),
      image("blockscan-nft-untitled.png", "BlockScan NFT metadata fallback", "Open the live BlockScan explorer"),
    ],
  },
  lisiere: {
    key: "lisiere",
    title: "Cleanup",
    desktopLabel: "Cleanup",
    icon: "/assets/icons/apps/cleanup.svg",
    accent: "#1667d9",
    desktopSummary: "ERC-20 allowance review and revocation",
    desktopStack: "Next.js · TypeScript · wagmi",
    description: "Allowance Cleanup is a demo-ready Sepolia MVP inspired by how easy it is to forget wallet approvals. I built it to learn how approval events can be discovered, explained, created, updated, and revoked through one guided smart-contract and wallet experience—not as a production-grade security scanner.",
    liveUrl: "https://approval-cleanup-brt3.vercel.app/",
    repoUrl: "https://github.com/faelic/approval-cleanup",
    highlights: [
      "Learned to scan recent ERC-20 Approval logs in RPC-safe chunks and derive the latest token and spender state",
      "Built wallet connection, faucet, approve, update, and revoke flows with wagmi, viem, and RainbowKit",
      "Explored simple risk classification while documenting the limits of event-based approval discovery",
    ],
    meta: [
      ["Project type", "Learning MVP / Wallet security"],
      ["Role", "Solo product & engineering"],
      ["Stack", "Next.js / React / TypeScript / wagmi / viem / Hardhat"],
      ["Status", "Live Sepolia demo"],
    ],
    images: [
      image("cleanup-dashboard.png", "Allowance Cleanup dashboard", "Open the live Allowance Cleanup application"),
      image("cleanup-approvals.png", "Allowance Cleanup approval dashboard", "Review approvals in Allowance Cleanup"),
      image("cleanup-manual-approval.png", "Allowance Cleanup manual approval tool", "Open the manual approval flow"),
      image("cleanup-faucet.png", "Allowance Cleanup Sepolia faucet", "View the Allowance Cleanup faucet"),
    ],
  },
  elan: {
    key: "elan",
    title: "Escrow",
    desktopLabel: "Escrow",
    icon: "/assets/icons/apps/escrow.svg",
    accent: "#5961d9",
    desktopSummary: "Role-based smart contract workflow",
    desktopStack: "Solidity · React · ethers.js",
    description: "Escrow was a learning project built to understand how a React interface stays synchronized with an Ethereum smart contract, connected wallet, user permissions, and transaction lifecycle. It validates a focused depositor, beneficiary, and arbiter payment flow on Sepolia; the frontend has not been deployed.",
    repoUrl: "https://github.com/faelic/escrow-webapp",
    previewNote: "The frontend is not deployed, so this project intentionally includes no fabricated product screenshots. The complete contract and frontend implementation are available in the repository.",
    highlights: [
      "Learned role-based contract permissions for depositor funding and arbiter-controlled release or refund actions",
      "Implemented strict Created, Funded, Released, and Refunded lifecycle transitions with custom Solidity errors",
      "Connected React and ethers.js to MetaMask, Sepolia validation, live contract state, and transaction feedback",
    ],
    meta: [
      ["Project type", "Early learning project / Web3"],
      ["Role", "Smart contract & frontend"],
      ["Stack", "React / Vite / ethers.js / Solidity / Hardhat"],
      ["Status", "Repository only / Not deployed"],
    ],
    images: [],
  },
  eau: {
    key: "eau",
    title: "Policy.ng",
    desktopLabel: "Policy",
    icon: "/assets/icons/apps/policy.svg",
    accent: "#07542f",
    desktopSummary: "Citizen-first Nigerian policy platform",
    desktopStack: "React · Civic technology · UX",
    description: "Policy.ng is an independent, citizen-first civic technology platform that makes Nigerian policies, bills, and acts easier to discover and understand. I collaborated with the team to build the React frontend, translating its policy index and discovery experience into a clear, searchable interface.",
    liveUrl: "https://policy.ng/",
    highlights: [
      "Built responsive React interfaces for policy discovery, search, editorial content, and civic data",
      "Translated a distinctive editorial design system across light, dark, directory, AI, and administration views",
      "Collaborated within a product team while keeping dense public information readable and approachable",
    ],
    meta: [
      ["Project type", "Civic technology platform"],
      ["Role", "React frontend contributor"],
      ["Stack", "React / Responsive web interfaces"],
      ["Status", "Live collaborative product"],
    ],
    images: [
      image("policy-home.png", "Policy.ng searchable citizen index", "Open the Policy.ng homepage", "interface-policy"),
      image("policy-trending.png", "Policy.ng trending policy page", "Explore trending policies on Policy.ng", "interface-policy"),
      image("policy-about.png", "Policy.ng about page", "Read about Policy.ng", "interface-policy"),
      image("policy-directory.png", "Policy.ng policy directory", "Browse the Policy.ng directory", "interface-policy"),
      image("policy-ai.png", "Policy.ng AI assistant", "Open the Policy.ng AI assistant", "interface-policy"),
      image("policy-admin.png", "Policy.ng administration dashboard", "View the Policy.ng platform", "interface-policy"),
    ],
  },
};

export const projectList = Object.values(projects);

export const hashToProject = (hash: string): ProjectKey | undefined => {
  const slug = hash.replace(/^#/, "").toLowerCase();
  return projectList.find((project) => project.title.toLowerCase().replace(/[^a-z0-9]+/g, "") === slug)?.key;
};

export const projectToHash = (key: ProjectKey) => `#${projects[key].title.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
