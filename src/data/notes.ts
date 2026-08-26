export const notes = {
  about: {
    title: "About",
    date: "January 22, 2026 at 11:35 AM",
    paragraphs: [
      "I'm Favour, a software engineer focused on backend engineering with Go, with experience building full-stack products and blockchain applications.",
      "I work on everything from financial systems and APIs to on-chain tools and interactive interfaces. I care about reliability, clear product flows and making complex systems easier for people to understand and use.",
      "This portfolio is designed as a working desktop. Each app documents a real project, while the desktop itself is an ongoing experiment in motion, spatial interfaces, and product storytelling. It is not a finished project yet so it will keep changing as I build new projects, improve existing ones and keep learning along the way.",
    ],
  },
  experience: {
    title: "Experience",
    date: "Updated August 2026",
    roles: [
      {
        title: "Frontend Developer Intern",
        place: "Flamong · Policy.ng",
        date: "May 2026 – Present",
        bullets: [
          "Build and maintain responsive React and TypeScript interfaces for Policy.ng, a civic-tech platform that helps people find and understand Nigerian policies across its public website and authenticated admin dashboard.",
          "Delivered more than 10 public and admin modules, including policy listings and detail pages, officials directories, AI-assisted policy Q&A, content management, comment moderation, policy suggestions, editor picks, civic facts, and subscriber management.",
          "Integrated more than 40 REST API endpoints with TanStack Query, supporting data fetching, caching, search, filtering, pagination, CRUD operations, moderation actions, and session-aware admin workflows.",
          "Created reusable interface and form patterns with Tailwind CSS, Radix UI, React Hook Form, and Zod. Added responsive layouts, dark mode, loading and empty states, confirmation flows, and Vitest integration tests for three critical admin workflows.",
        ],
      },
      {
        title: "Software Engineer",
        place: "Independent Projects",
        date: "2025 – Present",
        bullets: [
          "Monierave: Designed and built a Go and PostgreSQL backend for moving money between internal accounts. Protected transfers from retries, concurrent requests, and partial updates using idempotency keys, row-level locking, atomic database transactions, and append-only double-entry postings. Added reconciliation, a transactional outbox with Redis and Asynq, revocable sessions, and race-enabled tests for ledger and concurrency guarantees.",
          "BucketFlow: Built a Solidity and Next.js USDC vault that helps freelancers divide incoming payments between Rent, Savings, Tax, Family Support, and Cash-out. Enforced allocation rules that total 100% on-chain, handled wallet connections, token allowances, wrong-network and transaction states, and implemented a 30-day Savings withdrawal cooldown.",
          "BlockScan: Created a React-based Sepolia explorer that lets users search for blocks, transactions, and wallet addresses from one input. Translated Alchemy responses into readable balances, timestamps, gas details, transaction status, address activity, and NFT information, with a local watchlist for saved addresses.",
          "Cleanup: Developed an ERC-20 permissions reviewer that scans recent Approval logs in RPC-sized chunks, reconstructs the latest token-and-spender permissions, checks current allowances, and highlights unlimited or 90-plus-day approvals for review. Built a guided Sepolia flow for claiming test tokens, creating approvals, updating allowances, and revoking access.",
        ],
      },
    ],
  },
} as const;
