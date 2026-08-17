(function () {
  "use strict";

  const projectData = {
    lisiere: {
      title: "Cleanup",
      icon: "./assets/icons/apps/cleanup.svg",
      accent: "#1667d9",
      desktopSummary: "ERC-20 allowance review and revocation",
      desktopStack: "Next.js · TypeScript · wagmi",
      description: "Allowance Cleanup is a demo-ready Sepolia MVP inspired by how easy it is to forget wallet approvals. I built it to learn how approval events can be discovered, explained, created, updated, and revoked through one guided smart-contract and wallet experience—not as a production-grade security scanner.",
      liveUrl: "https://approval-cleanup-brt3.vercel.app/",
      repoUrl: "https://github.com/faelic/approval-cleanup",
      highlights: [
        "Learned to scan recent ERC-20 Approval logs in RPC-safe chunks and derive the latest token and spender state",
        "Built wallet connection, faucet, approve, update, and revoke flows with wagmi, viem, and RainbowKit",
        "Explored simple risk classification while documenting the limits of event-based approval discovery"
      ],
      meta: [
        ["Project type", "Learning MVP / Wallet security"],
        ["Role", "Solo product & engineering"],
        ["Stack", "Next.js / React / TypeScript / wagmi / viem / Hardhat"],
        ["Status", "Live Sepolia demo"]
      ],
      story: [
        ["Challenge", "ERC-20 permissions are easy to grant and difficult to remember. The product needed to surface approvals without implying that a recent event scan was a complete security audit."],
        ["Approach", "I designed one guided Sepolia loop: claim test tokens, create an approval, scan recent Approval events, classify the result, and revoke or update the permission from the same interface."],
        ["Outcome", "The result is a demo-ready wallet-safety MVP with explicit scan limits, searchable approval records, risk summaries, and transaction feedback."],
        ["Key learning", "Event logs are useful evidence, but not a complete allowance index. Trust improves when technical limitations are visible in the product instead of hidden behind confident security language."]
      ],
      images: [
        ["./assets/projects/cleanup-dashboard.png", "Allowance Cleanup dashboard prompting a user to connect a wallet and review ERC-20 approvals on Sepolia", "interface", "Open the live Allowance Cleanup application"],
        ["./assets/projects/cleanup-approvals.png", "Allowance Cleanup approval dashboard with risk summaries, recent scan limits, search, and approval filters", "interface", "Review approvals in Allowance Cleanup"],
        ["./assets/projects/cleanup-manual-approval.png", "Allowance Cleanup manual approval tool with connected-wallet details and Sepolia transaction guidance", "interface", "Open the manual approval flow"],
        ["./assets/projects/cleanup-faucet.png", "Allowance Cleanup Sepolia faucet offering test USDC and USDT for the guided approval workflow", "interface", "View the Allowance Cleanup faucet"]
      ]
    },
    champ: {
      title: "Monierave",
      icon: "./assets/icons/apps/monierave.svg",
      accent: "#79672d",
      desktopSummary: "Production-like banking backend",
      desktopStack: "Go · PostgreSQL · Redis",
      description: "Monierave is an advanced Go learning project designed as a production-like banking backend—not a licensed banking product. I used it to study how financial correctness, secure sessions, asynchronous delivery, auditability, reconciliation, and operational safeguards fit together inside a deliberately modular monolith.",
      liveUrl: "https://monierave.favourututu.com/",
      repoUrl: "https://github.com/faelic/monierave",
      highlights: [
        "Designed append-only double-entry ledger postings, cached balances, idempotent transfers, limits, and safe reversals",
        "Learned rotating refresh sessions, token-reuse detection, device binding, lifecycle controls, and immutable audits",
        "Built PostgreSQL transactions, Redis and Asynq outbox workers, reconciliation, metrics, rate limits, and invariant tests"
      ],
      meta: [
        ["Project type", "Advanced backend learning project"],
        ["Role", "Backend architecture & implementation"],
        ["Stack", "Go / PostgreSQL / Redis / Asynq"],
        ["Status", "Live portfolio demonstration"]
      ],
      story: [
        ["Challenge", "A banking backend cannot treat balances as editable numbers. Transfers, reversals, sessions, notifications, and recovery paths all need to preserve financial and security invariants under retries and failure."],
        ["Approach", "I used a deliberately modular Go monolith with an append-only double-entry ledger, idempotency keys, database transactions, rotating refresh sessions, and a transactional outbox feeding asynchronous workers."],
        ["Outcome", "Monierave became a production-like learning system covering account lifecycle controls, transfer limits, safe reversals, audit trails, reconciliation, metrics, health checks, and invariant tests."],
        ["Key learning", "Reliable financial software is built around invariants and recovery, not only successful requests. The ledger and audit trail must remain explainable even when delivery, sessions, or downstream services fail."]
      ],
      images: [
        ["./assets/projects/monierave-hero.png", "Monierave banking website hero with the message Banking made clear", "interface", "View the Monierave website"],
        ["./assets/projects/monierave-dashboard.png", "Monierave banking dashboard showing accounts and money movement", "interface", "Open the Monierave dashboard"],
        ["./assets/projects/monierave-transfer.png", "Monierave money-movement workspace reviewing an internal transfer between verified accounts", "interface", "Explore money movement in Monierave"],
        ["./assets/projects/monierave-account.png", "Monierave USD account detail with its posted balance, account status, and transaction history", "interface", "View account activity in Monierave"]
      ]
    },
    silences: {
      title: "BucketFlow",
      icon: "./assets/icons/apps/bucketflow.svg",
      accent: "#63762c",
      desktopSummary: "Stablecoin income infrastructure",
      desktopStack: "Solidity · Next.js · TypeScript",
      description: "BucketFlow is a live Sepolia V1 that organizes incoming USDC for freelancers and builders into practical buckets such as Rent, Savings, Tax, Family Support, and Cash-out. I built the contract and frontend together to learn how product rules, wallet interactions, event-driven receipts, and disciplined savings behavior translate into an on-chain user experience.",
      liveUrl: "https://bucketflow-tau.vercel.app/",
      repoUrl: "https://github.com/faelic/bucketflow",
      highlights: [
        "Built percentage-based split rules, token approval, vault deposit, bucket balances, and selective withdrawal flows",
        "Learned contract and frontend synchronization with Solidity, Foundry, wagmi, viem, and TanStack Query",
        "Designed event-based receipts, wrong-network states, preview mode, and a 30-day savings withdrawal cooldown"
      ],
      meta: [
        ["Project type", "Live V1 / Fintech / Web3"],
        ["Role", "Solo full-stack & smart contracts"],
        ["Stack", "Next.js / React / TypeScript / Solidity / Foundry"],
        ["Status", "Live on Ethereum Sepolia"]
      ],
      story: [
        ["Challenge", "Receiving stablecoin income does not automatically create a financial plan. Freelancers still need a clear way to protect rent, tax, savings, family support, and everyday liquidity."],
        ["Approach", "I translated those priorities into percentage-based on-chain split rules, then connected approval, deposit, withdrawal, wallet, network, receipt, and savings-cooldown states through a single frontend."],
        ["Outcome", "The live V1 turns an incoming USDC payment into five visible balances, preserves an event-based receipt trail, and communicates when protected savings can next be withdrawn."],
        ["Key learning", "Smart-contract UX depends on much more than a successful transaction. Users need previews, network recovery, approval clarity, pending states, receipts, and rules explained in ordinary financial language."]
      ],
      images: [
        ["./assets/projects/bucketflow-hero.png", "BucketFlow stablecoin income organizer showing an incoming USDC payment split into practical buckets", "interface", "Open the live BucketFlow application"],
        ["./assets/projects/bucketflow-dashboard.png", "BucketFlow overview dashboard showing organized balance, savings status, receipts, and wallet actions", "interface", "View the BucketFlow overview"],
        ["./assets/projects/bucketflow-buckets.png", "BucketFlow income buckets showing balances for rent, savings, tax, family support, and cash-out", "interface", "Explore BucketFlow income buckets"],
        ["./assets/projects/bucketflow-split-rules.png", "BucketFlow split-rule editor distributing each deposit across five practical money buckets", "interface", "Review BucketFlow split rules"],
        ["./assets/projects/bucketflow-overview-focus.png", "Close view of the BucketFlow stablecoin income dashboard and total organized balance", "interface", "Open the BucketFlow dashboard"]
      ]
    },
    revolte: {
      title: "BlockScan",
      icon: "./assets/icons/apps/blockexplorer.svg",
      accent: "#087b9f",
      desktopSummary: "Sepolia blockchain explorer",
      desktopStack: "React · Alchemy SDK · Web3",
      description: "BlockScan was one of my first blockchain learning projects: a React-based Sepolia explorer built to understand how frontend applications query, format, and navigate live Ethereum data through the Alchemy SDK. It brings blocks, transactions, wallet activity, NFT metadata, and a persistent watchlist into one responsive interface.",
      liveUrl: "https://blockscan-seven.vercel.app/",
      repoUrl: "https://github.com/faelic/sepolia-blockexplorer",
      highlights: [
        "Learned to query and format live blocks, transactions, balances, receipts, and gas data",
        "Built route-driven React views and unified search for blocks, transaction hashes, and addresses",
        "Worked with NFT metadata, localStorage watchlists, responsive layouts, and asynchronous UI states"
      ],
      meta: [
        ["Project type", "Early learning project / Web3"],
        ["Role", "Frontend & data integration"],
        ["Stack", "React / React Router / JavaScript / Alchemy SDK"],
        ["Status", "Live on Ethereum Sepolia"]
      ],
      story: [
        ["Challenge", "Raw blockchain responses are precise but difficult to navigate. I wanted to understand how an explorer turns block, transaction, account, and NFT data into usable application views."],
        ["Approach", "I built route-driven React screens around Alchemy and Ethereum RPC data, with a unified search entry point, formatted transaction details, NFT metadata handling, and a persistent local watchlist."],
        ["Outcome", "This became one of my first complete blockchain learning projects and a practical introduction to asynchronous data states, chain identifiers, address handling, and explorer information architecture."],
        ["Key learning", "Blockchain interfaces must be deliberate about loading, missing metadata, long identifiers, stale responses, and unsupported queries. Clear fallback states matter as much as successful results."]
      ],
      images: [
        ["./assets/projects/blockscan-home.png", "BlockScan home dashboard with unified explorer search and live Sepolia block activity", "interface", "Open the live BlockScan explorer"],
        ["./assets/projects/blockscan-account.png", "BlockScan account details showing balance, nonce, watchlist action, and incoming transfers", "interface", "Open the live BlockScan explorer"],
        ["./assets/projects/blockscan-nft-doodle.png", "BlockScan NFT metadata result for Doodle number 16", "interface", "Open the live BlockScan explorer"],
        ["./assets/projects/blockscan-nft-untitled.png", "BlockScan NFT metadata fallback for an untitled ERC-721 token", "interface", "Open the live BlockScan explorer"]
      ]
    },
    elan: {
      title: "Escrow",
      icon: "./assets/icons/apps/escrow.svg",
      accent: "#5961d9",
      desktopSummary: "Role-based smart contract workflow",
      desktopStack: "Solidity · React · ethers.js",
      description: "Escrow was a learning project built to understand how a React interface stays synchronized with an Ethereum smart contract, connected wallet, user permissions, and transaction lifecycle. It validates a focused depositor, beneficiary, and arbiter payment flow on Sepolia; the frontend has not been deployed.",
      repoUrl: "https://github.com/faelic/escrow-webapp",
      previewIcon: "./assets/icons/apps/escrow.svg",
      previewNote: "The frontend is not deployed, so this case study intentionally includes no fabricated product screenshots. The complete contract and frontend implementation are available in the repository.",
      highlights: [
        "Learned role-based contract permissions for depositor funding and arbiter-controlled release or refund actions",
        "Implemented strict Created, Funded, Released, and Refunded lifecycle transitions with custom Solidity errors",
        "Connected React and ethers.js to MetaMask, Sepolia validation, live contract state, and transaction feedback"
      ],
      meta: [
        ["Project type", "Early learning project / Web3"],
        ["Role", "Smart contract & frontend"],
        ["Stack", "React / Vite / ethers.js / Solidity / Hardhat"],
        ["Status", "Repository only / Not deployed"]
      ],
      story: [
        ["Challenge", "An escrow interface must expose different actions to the depositor, beneficiary, and arbiter while preventing the UI from drifting away from the contract's actual lifecycle."],
        ["Approach", "I modeled strict Created, Funded, Released, and Refunded states in Solidity, enforced role permissions with custom errors, and synchronized React views with MetaMask, Sepolia, and live contract reads."],
        ["Outcome", "The repository contains a focused end-to-end learning implementation for funding, release, refund, role validation, network checks, and transaction feedback. The frontend remains intentionally undeployed."],
        ["Key learning", "The contract is the source of truth. A web3 interface should derive permissions and state from the chain, then explain unavailable actions rather than relying on optimistic local assumptions."]
      ],
      images: []
    },
    eau: {
      title: "Policy.ng",
      icon: "./assets/icons/apps/policy.svg",
      accent: "#07542f",
      desktopSummary: "Citizen-first Nigerian policy platform",
      desktopStack: "React · Civic technology · UX",
      description: "Policy.ng is an independent, citizen-first civic technology platform that makes Nigerian policies, bills, and acts easier to discover and understand. I collaborated with the team to build the React frontend, translating its policy index and discovery experience into a clear, searchable interface.",
      liveUrl: "https://policy.ng/",
      highlights: [
        "Built responsive React interfaces for policy discovery, search, editorial content, and civic data",
        "Translated a distinctive editorial design system across light, dark, directory, AI, and administration views",
        "Collaborated within a product team while keeping dense public information readable and approachable"
      ],
      meta: [
        ["Project type", "Civic technology platform"],
        ["Role", "React frontend contributor"],
        ["Stack", "React / Responsive web interfaces"],
        ["Status", "Live collaborative product"]
      ],
      story: [
        ["Challenge", "Nigerian policies, bills, and acts are important public information, but formal language and fragmented sources make them difficult for citizens to discover and understand."],
        ["Approach", "Working with the team, I helped translate the product and editorial system into responsive React views spanning discovery, search, trending policy, explanatory content, AI assistance, and administration."],
        ["Outcome", "Policy.ng presents a searchable citizen-first index with a distinctive editorial voice, clear content hierarchy, and multiple paths into complex civic information."],
        ["Key learning", "Civic interfaces need both clarity and trust. Strong typography can invite attention, but navigation, content structure, responsive behavior, and careful language make the information genuinely usable."]
      ],
      images: [
        ["./assets/projects/policy-home.png", "Policy.ng homepage with a searchable citizen index of Nigerian policies", "interface-policy", "Open the Policy.ng homepage"],
        ["./assets/projects/policy-trending.png", "Policy.ng trending page featuring the National Apprenticeship and Skills Development Bill", "interface-policy", "Explore trending policies on Policy.ng"],
        ["./assets/projects/policy-about.png", "Policy.ng about page explaining its mission to bridge governance and citizenry", "interface-policy", "Read about Policy.ng"],
        ["./assets/projects/policy-directory.png", "Policy.ng policy directory with search, categories, sorting, and featured policy cards", "interface-policy", "Browse the Policy.ng directory"],
        ["./assets/projects/policy-ai.png", "Policy.ng AI assistant with suggested questions about Nigerian policy and regulation", "interface-policy", "Open the Policy.ng AI assistant"],
        ["./assets/projects/policy-admin.png", "Policy.ng administration dashboard showing content and site-traffic metrics", "interface-policy", "View the Policy.ng platform"]
      ]
    }
  };

  const ambientProjectImages = Object.freeze(Object.entries(projectData).flatMap(([project, data]) => (
    data.images.map(([source]) => ({
      project,
      src: source.replace("./assets/projects/", "./assets/projects/ambient/").replace(/\.png$/i, ".jpg")
    }))
  )));

  const notesData = {
    about: {
      title: "About",
      date: "January 22, 2026 at 11:35 AM",
      html: `
        <p>I'm Marcus Williams, a Creative Director and Brand Designer based in Brooklyn.</p>
        <p>For the past 8 years, I've been crafting visual identities and brand systems for companies across fashion, tech, and culture. Currently leading creative at Wolff Olins, previously at Pentagram and IDEO.</p>
        <p>I believe great design isn't just aesthetically compelling — it's strategically grounded and culturally aware. My approach blends bold typography, thoughtful color systems, and contemporary minimalism to create brands that stand out and resonate.</p>
        <p>Beyond client work, I run Grid &amp; Grit, a weekly design newsletter exploring typography, color theory, and design history. It's read by 8,500+ designers at companies like Apple, Google, and Airbnb.</p>`
    },
    experience: {
      title: "Experience",
      date: "January 22, 2026 at 11:35 AM",
      html: `
        <h3>Creative Director</h3>
        <p class="role-place">Wieden+Kennedy, Los Angeles</p>
        <p class="role-date">Feb 2022 – Present</p>
        <ul>
          <li>Lead multidisciplinary teams across brand, campaign, and digital experiences.</li>
          <li>Shape creative strategy and visual systems for culture-led global clients.</li>
          <li>Mentor designers and art directors from concept through final production.</li>
        </ul>
        <h3>Associate Creative Director</h3>
        <p class="role-place">Pentagram, New York</p>
        <p class="role-date">Jun 2019 – Jan 2022</p>
        <ul>
          <li>Built identity systems, editorial frameworks, and launch campaigns.</li>
          <li>Partnered with strategy teams to turn research into clear visual direction.</li>
        </ul>
        <h3>Senior Designer</h3>
        <p class="role-place">IDEO, San Francisco</p>
        <p class="role-date">Aug 2017 – May 2019</p>
        <ul>
          <li>Designed human-centered products and brand experiences.</li>
          <li>Facilitated collaborative workshops with client and design teams.</li>
        </ul>`
    }
  };

  const LOCATION_HUB = Object.freeze({ name: "Lagos", lng: 3.3792, lat: 6.5244 });
  const LOCATION_DESTINATIONS = Object.freeze([
    { name: "New York", lng: -74.006, lat: 40.7128 },
    { name: "São Paulo", lng: -46.6333, lat: -23.5505 },
    { name: "Cape Town", lng: 18.4241, lat: -33.9249 },
    { name: "Dubai", lng: 55.2708, lat: 25.2048 },
    { name: "Mumbai", lng: 72.8777, lat: 19.076 },
    { name: "Singapore", lng: 103.8198, lat: 1.3521 },
    { name: "Tokyo", lng: 139.6917, lat: 35.6895 },
    { name: "Sydney", lng: 151.2093, lat: -33.8688 }
  ]);
  const LOCATION_NETWORK_LEVELS = Object.freeze([
    {
      id: "global",
      maxZoom: 2.25,
      limit: 7,
      locations: [
        ...LOCATION_DESTINATIONS,
        { name: "London", lng: -0.1276, lat: 51.5074 },
        { name: "Paris", lng: 2.3522, lat: 48.8566 },
        { name: "Cairo", lng: 31.2357, lat: 30.0444 },
        { name: "Toronto", lng: -79.3832, lat: 43.6532 },
        { name: "Los Angeles", lng: -118.2437, lat: 34.0522 },
        { name: "Mexico City", lng: -99.1332, lat: 19.4326 },
        { name: "Buenos Aires", lng: -58.3816, lat: -34.6037 },
        { name: "Istanbul", lng: 28.9784, lat: 41.0082 },
        { name: "Nairobi", lng: 36.8219, lat: -1.2921 },
        { name: "Beijing", lng: 116.4074, lat: 39.9042 }
      ]
    },
    {
      id: "regional",
      maxZoom: 4.9,
      limit: 7,
      locations: [
        { name: "Accra", lng: -0.187, lat: 5.6037 },
        { name: "Abidjan", lng: -4.0083, lat: 5.36 },
        { name: "Dakar", lng: -17.4677, lat: 14.7167 },
        { name: "Casablanca", lng: -7.5898, lat: 33.5731 },
        { name: "Algiers", lng: 3.0588, lat: 36.7538 },
        { name: "Tunis", lng: 10.1815, lat: 36.8065 },
        { name: "Cairo", lng: 31.2357, lat: 30.0444 },
        { name: "Addis Ababa", lng: 38.7578, lat: 8.9806 },
        { name: "Nairobi", lng: 36.8219, lat: -1.2921 },
        { name: "Johannesburg", lng: 28.0473, lat: -26.2041 },
        { name: "Cape Town", lng: 18.4241, lat: -33.9249 },
        { name: "Lisbon", lng: -9.1393, lat: 38.7223 },
        { name: "London", lng: -0.1276, lat: 51.5074 },
        { name: "Dubai", lng: 55.2708, lat: 25.2048 }
      ]
    },
    {
      id: "nigeria",
      maxZoom: 8.2,
      limit: 7,
      locations: [
        { name: "Abuja", lng: 7.3986, lat: 9.0765 },
        { name: "Ibadan", lng: 3.947, lat: 7.3775 },
        { name: "Abeokuta", lng: 3.348, lat: 7.1475 },
        { name: "Ilorin", lng: 4.5418, lat: 8.4966 },
        { name: "Akure", lng: 5.195, lat: 7.2571 },
        { name: "Benin City", lng: 5.6037, lat: 6.335 },
        { name: "Port Harcourt", lng: 7.0498, lat: 4.8156 },
        { name: "Enugu", lng: 7.4988, lat: 6.4584 },
        { name: "Jos", lng: 8.8583, lat: 9.8965 },
        { name: "Kaduna", lng: 7.4388, lat: 10.5105 },
        { name: "Kano", lng: 8.5167, lat: 12.0022 }
      ]
    },
    {
      id: "lagos",
      maxZoom: Infinity,
      limit: 8,
      locations: [
        { name: "Ikeja", lng: 3.3515, lat: 6.6018 },
        { name: "Yaba", lng: 3.3792, lat: 6.5095 },
        { name: "Surulere", lng: 3.3502, lat: 6.4969 },
        { name: "Ikoyi", lng: 3.4378, lat: 6.4541 },
        { name: "Victoria Island", lng: 3.4219, lat: 6.4281 },
        { name: "Lekki", lng: 3.4723, lat: 6.4698 },
        { name: "Badagry", lng: 2.8876, lat: 6.415 },
        { name: "Epe", lng: 3.9834, lat: 6.5841 }
      ]
    }
  ]);
  const LOCATION_CONTINENTS = Object.freeze([
    { name: "North America", lng: -103, lat: 45 },
    { name: "South America", lng: -61, lat: -18 },
    { name: "Europe", lng: 17, lat: 51 },
    { name: "Africa", lng: 20, lat: 4 },
    { name: "Asia", lng: 88, lat: 43 },
    { name: "Oceania", lng: 134, lat: -24 }
  ]);
  const LOCATION_MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";
  const MAP_ACCENT = "#0aff3e";
  const MAP_ACCENT_GLOW = "rgba(10, 255, 62, 0.52)";
  const MAP_ACCENT_MUTED = "#75b98b";
  const MAP_INITIAL_ZOOM = 1.45;
  const STOP_ROTATION_ZOOM = 2.2;
  const RESUME_ROTATION_ZOOM = 1.8;
  const MAP_ROTATION_SPEED = 7.5;
  const MAP_IDLE_RESUME_DELAY = 1500;

  const desktop = document.getElementById("desktop");
  const ambientTunnelRoot = document.getElementById("ambient-project-tunnel");
  const windowLayer = document.getElementById("window-layer");
  const shortcuts = Array.from(document.querySelectorAll(".shortcut"));
  const resetShortcutLayoutButton = document.getElementById("reset-shortcut-layout");
  const interactionHint = document.getElementById("interaction-hint");
  const projectHoverInfo = document.getElementById("project-hover-info");
  const projectHoverCopy = projectHoverInfo.querySelector(".project-hover-copy");
  const projectHoverName = projectHoverInfo.querySelector(".project-hover-name");
  const projectHoverDescription = projectHoverInfo.querySelector(".project-hover-description");
  const projectHoverStack = projectHoverInfo.querySelector(".project-hover-stack");
  const dock = document.querySelector(".dock-hit-area");
  const dockItems = Array.from(dock.querySelectorAll(".dock-hit"));
  const dockDivider = dock.querySelector(".dock-divider");
  const aboutDockButton = document.querySelector('[data-app="about"]');
  const aboutUpdateBadge = document.getElementById("about-update-badge");
  const windowRegistry = new Map();
  const suppressShortcutClick = new WeakSet();
  const shortcutLaunchTimers = new WeakMap();
  const SHORTCUT_LAYOUT_STORAGE_KEY = "favour.shortcut-layout.v1";
  const INTERACTION_HINT_STORAGE_KEY = "favour.interaction-hint-seen.v1";
  const DESKTOP_ENTRY_STORAGE_KEY = "favour.desktop-entry-seen.v1";
  const ABOUT_UPDATE_STORAGE_KEY = "favour.about-update-seen.v1";
  const projectSlugs = {
    champ: "monierave",
    silences: "bucketflow",
    revolte: "blockexplorer",
    lisiere: "cleanup",
    elan: "escrow",
    eau: "policy"
  };
  const projectKeysBySlug = Object.fromEntries(Object.entries(projectSlugs).map(([key, slug]) => [slug, key]));
  let zCounter = 110;
  let activeWindow = null;
  let activeHoverProject = null;
  let hoverInfoAnimation = null;
  let hoverInfoHideTimer = 0;
  let interactionHintTimer = 0;
  let interactionHintDismissTimer = 0;
  let tutorialNudgeTimer = 0;
  let ambientTunnel = null;

  function createAmbientProjectTunnel(root, images) {
    const stage = root?.querySelector(".ambient-tunnel-stage");
    if (!root || !stage || !images.length) {
      return {
        setState() {},
        setActiveProject() {},
        destroy() {}
      };
    }

    const stateProfiles = Object.freeze({
      IDLE: { speed: 52, intensity: 1 },
      FOCUSED_PROJECT: { speed: 48, intensity: 1 },
      DRAGGING: { speed: 26, intensity: 0.86 },
      OPENING_WINDOW: { speed: 5, intensity: 0.2 },
      WINDOW_OPEN: { speed: 0, intensity: 0.16 },
      CLOSING_WINDOW: { speed: 3, intensity: 0.18 }
    });
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMotionQuery = window.matchMedia("(max-width: 900px), (hover: none) and (pointer: coarse)");
    const farZ = -3220;
    const nearZ = 520;
    const loopDepth = nearZ - farZ;
    const laneCount = 4;
    const planeCount = 24;
    const depthStep = loopDepth / (planeCount / laneCount);
    const laneNames = ["left", "right", "ceiling", "floor"];
    let desktopWidth = 0;
    let desktopHeight = 0;
    let planeWidth = 320;
    let animationFrame = 0;
    let previousTime = 0;
    let isInViewport = true;
    let activeProject = null;
    let currentState = "IDLE";
    let currentSpeed = stateProfiles.IDLE.speed;
    let targetSpeed = currentSpeed;
    let currentIntensity = 0;
    let targetIntensity = stateProfiles.IDLE.intensity;
    let disposed = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const smoothstep = (edge0, edge1, value) => {
      const amount = clamp((value - edge0) / (edge1 - edge0), 0, 1);
      return amount * amount * (3 - 2 * amount);
    };
    const deterministicNoise = (seed) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453;
      return (value - Math.floor(value)) * 2 - 1;
    };
    const normalizeDepth = (depth) => {
      let normalized = depth;
      while (normalized > nearZ) normalized -= loopDepth;
      while (normalized < farZ) normalized += loopDepth;
      return normalized;
    };

    const planes = Array.from({ length: planeCount }, (_, index) => {
      // A coprime stride prevents each depth row from becoming a single-project band.
      const source = images[(index * 7) % images.length];
      const laneIndex = index % laneCount;
      const rowIndex = Math.floor(index / laneCount);
      const element = document.createElement("div");
      const image = document.createElement("img");
      element.className = "ambient-tunnel-plane";
      element.dataset.project = source.project;
      element.dataset.lane = laneNames[laneIndex];
      image.src = source.src;
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      image.draggable = false;
      if (index < 8) image.fetchPriority = "high";
      element.appendChild(image);
      stage.appendChild(element);

      return {
        element,
        image,
        project: source.project,
        laneIndex,
        z: normalizeDepth(-170 - rowIndex * depthStep - laneIndex * 96),
        jitterA: deterministicNoise(index + 1),
        jitterB: deterministicNoise(index + 29),
        rotation: deterministicNoise(index + 71) * 2.2
      };
    });

    function measure() {
      const rect = root.getBoundingClientRect();
      desktopWidth = rect.width;
      desktopHeight = rect.height;
      planeWidth = clamp(desktopWidth * 0.26, compactMotionQuery.matches ? 170 : 210, 470);
      planes.forEach((plane) => {
        plane.element.style.width = `${planeWidth.toFixed(2)}px`;
      });
      renderPlanes();
    }

    function planeTransform(plane) {
      const wallX = desktopWidth * 0.505 + planeWidth * 0.05;
      const floorY = desktopHeight * 0.535 + planeWidth * 0.025;
      const wallY = plane.jitterA * desktopHeight * 0.16;
      const floorX = plane.jitterA * desktopWidth * 0.25;
      const secondary = plane.jitterB * 2.2;

      if (plane.laneIndex === 0) {
        return `translate3d(${-wallX}px, ${wallY}px, ${plane.z}px) rotateY(79deg) rotateZ(${plane.rotation}deg) translate3d(-50%, -50%, 0)`;
      }
      if (plane.laneIndex === 1) {
        return `translate3d(${wallX}px, ${wallY}px, ${plane.z}px) rotateY(-79deg) rotateZ(${-plane.rotation}deg) translate3d(-50%, -50%, 0)`;
      }
      if (plane.laneIndex === 2) {
        return `translate3d(${floorX}px, ${-floorY}px, ${plane.z}px) rotateX(-79deg) rotateZ(${secondary}deg) translate3d(-50%, -50%, 0)`;
      }
      return `translate3d(${floorX}px, ${floorY}px, ${plane.z}px) rotateX(79deg) rotateZ(${-secondary}deg) translate3d(-50%, -50%, 0)`;
    }

    function renderPlanes() {
      planes.forEach((plane) => {
        const depthProgress = clamp((plane.z - farZ) / loopDepth, 0, 1);
        const farFade = smoothstep(0.02, 0.17, depthProgress);
        const nearFade = 1 - smoothstep(0.82, 1, depthProgress);
        const depthOpacity = (0.045 + depthProgress * 0.19) * farFade * nearFade;
        plane.element.style.setProperty("--plane-opacity", depthOpacity.toFixed(4));
        plane.element.style.transform = planeTransform(plane);
      });
      root.style.setProperty("--tunnel-opacity", currentIntensity.toFixed(4));
    }

    function scheduleFrame() {
      if (disposed || animationFrame || document.hidden || !isInViewport) return;
      animationFrame = requestAnimationFrame(renderFrame);
    }

    function renderFrame(timestamp) {
      animationFrame = 0;
      if (disposed || document.hidden || !isInViewport) {
        previousTime = 0;
        return;
      }

      const elapsed = previousTime ? Math.min(0.05, (timestamp - previousTime) / 1000) : 1 / 60;
      previousTime = timestamp;
      const speedRate = targetSpeed < currentSpeed ? 10.5 : 3.8;
      const intensityRate = targetIntensity < currentIntensity ? 11 : 3.9;
      currentSpeed += (targetSpeed - currentSpeed) * (1 - Math.exp(-speedRate * elapsed));
      currentIntensity += (targetIntensity - currentIntensity) * (1 - Math.exp(-intensityRate * elapsed));

      if (!reducedMotionQuery.matches) {
        const travel = currentSpeed * elapsed;
        planes.forEach((plane) => {
          plane.z += travel;
          if (plane.z > nearZ) plane.z -= loopDepth;
        });
      }

      renderPlanes();
      const isSettled = Math.abs(targetSpeed - currentSpeed) < 0.02 && Math.abs(targetIntensity - currentIntensity) < 0.002;
      if (!reducedMotionQuery.matches || !isSettled) scheduleFrame();
      else previousTime = 0;
    }

    function applyStateProfile() {
      const profile = stateProfiles[currentState] || stateProfiles.IDLE;
      const compactMultiplier = compactMotionQuery.matches ? 0.42 : 1;
      targetSpeed = reducedMotionQuery.matches ? 0 : profile.speed * compactMultiplier;
      targetIntensity = profile.intensity;
      root.dataset.state = currentState.toLowerCase();
      if (reducedMotionQuery.matches) {
        currentSpeed = 0;
        currentIntensity = targetIntensity;
        renderPlanes();
      }
      scheduleFrame();
    }

    function setState(nextState) {
      if (!stateProfiles[nextState]) return;
      currentState = nextState;
      applyStateProfile();
    }

    function setActiveProject(projectKey) {
      activeProject = projectKey || null;
      const hasRelatedPlanes = Boolean(activeProject && planes.some((plane) => plane.project === activeProject));
      root.classList.toggle("has-active-project", hasRelatedPlanes);
      planes.forEach((plane) => {
        plane.element.classList.toggle("is-related", hasRelatedPlanes && plane.project === activeProject);
      });
    }

    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    if (resizeObserver) resizeObserver.observe(root);
    else window.addEventListener("resize", measure, { passive: true });

    const intersectionObserver = typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => {
      isInViewport = entries[0]?.isIntersecting !== false;
      previousTime = 0;
      if (isInViewport) scheduleFrame();
      else if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }, { threshold: 0.01 }) : null;
    if (intersectionObserver) intersectionObserver.observe(root);

    function handleVisibilityChange() {
      previousTime = 0;
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        scheduleFrame();
      }
    }

    function handleMotionPreferenceChange() {
      previousTime = 0;
      applyStateProfile();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
    compactMotionQuery.addEventListener("change", handleMotionPreferenceChange);
    measure();
    applyStateProfile();

    const priorityImages = planes.slice(0, 8).map(({ image }) => {
      if (typeof image.decode === "function") return image.decode().catch(() => {});
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    });
    Promise.race([
      Promise.allSettled(priorityImages),
      new Promise((resolve) => window.setTimeout(resolve, 900))
    ]).then(() => {
      if (!disposed) root.classList.add("is-ready");
    });

    return {
      setState,
      setActiveProject,
      destroy() {
        disposed = true;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener("resize", measure);
        intersectionObserver?.disconnect();
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        reducedMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
        compactMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
        planes.forEach(({ element }) => element.remove());
      }
    };
  }

  function initializeAboutUpdateBadge() {
    let hasSeenUpdate = false;
    try {
      hasSeenUpdate = window.localStorage.getItem(ABOUT_UPDATE_STORAGE_KEY) === "true";
    } catch (error) { /* Storage can be unavailable in privacy mode. */ }

    if (hasSeenUpdate && aboutUpdateBadge) aboutUpdateBadge.hidden = true;
    if (aboutDockButton) aboutDockButton.setAttribute("aria-label", hasSeenUpdate ? "About me" : "About me, one new update");
  }

  function dismissAboutUpdateBadge() {
    if (!aboutUpdateBadge || aboutUpdateBadge.hidden) return;
    aboutUpdateBadge.classList.add("is-dismissed");
    if (aboutDockButton) aboutDockButton.setAttribute("aria-label", "About me");
    try { window.localStorage.setItem(ABOUT_UPDATE_STORAGE_KEY, "true"); } catch (error) { /* Non-critical preference. */ }
    window.setTimeout(() => { aboutUpdateBadge.hidden = true; }, 180);
  }

  initializeAboutUpdateBadge();

  function initializeDockMagnification() {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projectDockScale = 1.46;
    const states = dockItems.map((item) => ({
      item,
      visual: item.querySelector(".dock-visual"),
      centerX: 0,
      baseSize: 0,
      scale: 1,
      targetScale: 1,
      x: 0,
      targetX: 0,
      press: 1,
      targetPress: 1
    }));
    let dockRect = null;
    let pointerX = 0;
    let pointerInZone = false;
    let frameRequest = 0;
    let previousFrameTime = 0;
    let tooltipCandidate = -1;
    let tooltipVisible = -1;
    let tooltipTimer = 0;

    function cacheDockGeometry() {
      dockRect = dock.getBoundingClientRect();
      states.forEach((state) => {
        state.baseSize = state.item.offsetWidth;
        state.centerX = dockRect.left + state.item.offsetLeft + state.item.offsetWidth / 2;
      });

      const desktopRect = desktop.getBoundingClientRect();
      const largestIcon = states.reduce((largest, state) => Math.max(largest, state.baseSize), 0);
      const magnificationRise = largestIcon * (projectDockScale - 1);
      const safeArea = Math.ceil(desktopRect.bottom - dockRect.top + magnificationRise + 18);
      desktop.style.setProperty("--dock-safe-area", `${safeArea}px`);
      updateDockTargets();
    }

    function clearTooltipTimer() {
      if (!tooltipTimer) return;
      window.clearTimeout(tooltipTimer);
      tooltipTimer = 0;
    }

    function showOnlyTooltip(index) {
      tooltipVisible = index;
      states.forEach((state, stateIndex) => {
        state.item.classList.toggle("is-tooltip-active", stateIndex === index);
      });
    }

    function queueTooltip(index) {
      if (index === tooltipCandidate) return;
      tooltipCandidate = index;
      clearTooltipTimer();
      if (index < 0) {
        showOnlyTooltip(-1);
        return;
      }

      const delay = tooltipVisible < 0 ? 520 : 110;
      tooltipTimer = window.setTimeout(() => {
        tooltipTimer = 0;
        if (tooltipCandidate === index && pointerInZone) showOnlyTooltip(index);
      }, delay);
    }

    function scheduleDockFrame() {
      if (!frameRequest) frameRequest = requestAnimationFrame(renderDockFrame);
    }

    function updateDockTargets() {
      if (!states.length || !dockRect) return;
      const reducedMotion = reducedMotionQuery.matches;
      const maximumScale = reducedMotion
        ? 1.14
        : (desktop.classList.contains("has-focused-project") ? projectDockScale : 1.94);
      const averageSize = states.reduce((sum, state) => sum + state.baseSize, 0) / states.length;
      const sigma = averageSize * (reducedMotion ? 0.78 : 0.94);

      states.forEach((state) => {
        if (!pointerInZone) {
          state.targetScale = 1;
          return;
        }
        const distance = pointerX - (state.centerX + state.x);
        const influence = Math.exp(-(distance * distance) / (2 * sigma * sigma));
        state.targetScale = 1 + (maximumScale - 1) * influence;
      });

      const expandedCenters = [states[0].centerX];
      for (let index = 1; index < states.length; index += 1) {
        const previous = states[index - 1];
        const current = states[index];
        const restingDistance = current.centerX - previous.centerX;
        const extraDistance = (
          previous.baseSize * (previous.targetScale - 1) +
          current.baseSize * (current.targetScale - 1)
        ) / 2;
        expandedCenters[index] = expandedCenters[index - 1] + restingDistance + extraDistance;
      }

      const rawOffsets = expandedCenters.map((center, index) => center - states[index].centerX);
      const groupCenterOffset = (rawOffsets[0] + rawOffsets[rawOffsets.length - 1]) / 2;
      states.forEach((state, index) => {
        state.targetX = rawOffsets[index] - groupCenterOffset;
      });

      if (pointerInZone) {
        const strongestIndex = states.reduce((bestIndex, state, index) => (
          state.targetScale > states[bestIndex].targetScale ? index : bestIndex
        ), 0);
        const currentStrength = tooltipCandidate >= 0 ? states[tooltipCandidate].targetScale : 1;
        const strongestStrength = states[strongestIndex].targetScale;
        if (strongestStrength < 1.12) {
          queueTooltip(-1);
        } else if (tooltipCandidate < 0 || strongestIndex === tooltipCandidate || strongestStrength > currentStrength + 0.075) {
          queueTooltip(strongestIndex);
        }
      } else {
        queueTooltip(-1);
      }

      dock.classList.toggle("is-magnifying", pointerInZone);
      scheduleDockFrame();
    }

    function renderDockFrame(timestamp) {
      frameRequest = 0;
      const elapsed = previousFrameTime ? Math.min(0.05, (timestamp - previousFrameTime) / 1000) : 1 / 60;
      previousFrameTime = timestamp;
      const followSpeed = pointerInZone ? 18 : 15;
      const blend = 1 - Math.exp(-followSpeed * elapsed);
      let unsettled = false;

      states.forEach((state) => {
        state.scale += (state.targetScale - state.scale) * blend;
        state.x += (state.targetX - state.x) * blend;
        state.press += (state.targetPress - state.press) * Math.min(1, blend * 1.9);
        const renderedScale = state.scale * state.press;
        state.item.style.transform = `translate3d(${state.x.toFixed(3)}px, 0, 0)`;
        state.item.style.zIndex = String(Math.round(renderedScale * 100));
        state.visual.style.transform = `translate3d(0, 0, 0) scale(${renderedScale.toFixed(4)})`;
        state.item.style.setProperty("--dock-tooltip-lift", `${Math.max(0, (renderedScale - 1) * state.baseSize).toFixed(2)}px`);
        if (
          Math.abs(state.targetScale - state.scale) > 0.001 ||
          Math.abs(state.targetX - state.x) > 0.04 ||
          Math.abs(state.targetPress - state.press) > 0.001
        ) unsettled = true;
      });

      if (dockDivider && states.length > 2) {
        const dividerX = (states[1].x + states[2].x) / 2;
        dockDivider.style.transform = `translate3d(${dividerX.toFixed(3)}px, 0, 0)`;
      }

      if (unsettled) scheduleDockFrame();
      else previousFrameTime = 0;
    }

    document.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || !dockRect) return;
      const horizontalAllowance = 34;
      const verticalAllowanceAbove = Math.max(72, dockRect.height * 1.15);
      const verticalAllowanceBelow = 16;
      const isInside = (
        event.clientX >= dockRect.left - horizontalAllowance &&
        event.clientX <= dockRect.right + horizontalAllowance &&
        event.clientY >= dockRect.top - verticalAllowanceAbove &&
        event.clientY <= dockRect.bottom + verticalAllowanceBelow
      );
      if (!isInside && !pointerInZone) return;
      pointerX = event.clientX;
      pointerInZone = isInside;
      updateDockTargets();
    }, { passive: true });

    dock.addEventListener("focusin", (event) => {
      if (pointerInZone) return;
      const index = states.findIndex((state) => state.item === event.target.closest(".dock-hit"));
      if (index >= 0) showOnlyTooltip(index);
    });

    dock.addEventListener("focusout", () => {
      if (!pointerInZone) showOnlyTooltip(-1);
    });

    states.forEach((state) => {
      state.item.addEventListener("pointerdown", () => {
        state.targetPress = 0.96;
        scheduleDockFrame();
      });
    });

    function releaseDockPress() {
      states.forEach((state) => { state.targetPress = 1; });
      scheduleDockFrame();
    }

    document.addEventListener("pointerup", releaseDockPress, true);
    document.addEventListener("pointercancel", releaseDockPress, true);
    window.addEventListener("blur", releaseDockPress);

    const dockResizeObserver = new ResizeObserver(cacheDockGeometry);
    dockResizeObserver.observe(dock);
    reducedMotionQuery.addEventListener("change", updateDockTargets);
    window.addEventListener("resize", cacheDockGeometry, { passive: true });
    requestAnimationFrame(cacheDockGeometry);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function readLocalStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeLocalStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeLocalStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Storage can be unavailable in privacy-restricted local file contexts.
    }
  }

  function readSessionStorage(key) {
    try {
      return window.sessionStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeSessionStorage(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function initializeDesktopEntry() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const entrySeen = readSessionStorage(DESKTOP_ENTRY_STORAGE_KEY) === "true";
    if (reducedMotion || entrySeen) {
      desktop.classList.remove("is-entry-pending");
      desktop.classList.add("has-entered");
      return;
    }

    writeSessionStorage(DESKTOP_ENTRY_STORAGE_KEY, "true");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        desktop.classList.add("is-entry-ready");
        desktop.classList.remove("is-entry-pending");
      });
    });
    window.setTimeout(() => {
      desktop.classList.remove("is-entry-ready");
      desktop.classList.add("has-entered");
    }, 1120);
  }

  function updateHoverInfoContent(projectKey) {
    const project = projectData[projectKey];
    if (!project) return;
    projectHoverName.textContent = project.title;
    projectHoverDescription.textContent = project.desktopSummary || project.description;
    projectHoverStack.textContent = project.desktopStack || project.meta.find(([label]) => label === "Stack")?.[1] || "";
  }

  function showProjectHoverInfo(projectKey) {
    window.clearTimeout(hoverInfoHideTimer);
    hoverInfoHideTimer = 0;
    if (!projectData[projectKey] || activeWindow || activeHoverProject === projectKey) return;
    if (hoverInfoAnimation) hoverInfoAnimation.cancel();
    const switching = Boolean(activeHoverProject && projectHoverInfo.classList.contains("is-visible"));
    activeHoverProject = projectKey;
    ambientTunnel?.setActiveProject(projectKey);
    ambientTunnel?.setState("FOCUSED_PROJECT");

    if (switching) {
      hoverInfoAnimation = projectHoverCopy.animate([
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
        { opacity: 0.16, transform: "translate3d(0, -2px, 0)" }
      ], {
        duration: 82,
        easing: "ease-in",
        fill: "forwards"
      });
      hoverInfoAnimation.finished.then(() => {
        if (activeHoverProject !== projectKey) return;
        updateHoverInfoContent(projectKey);
        hoverInfoAnimation = projectHoverCopy.animate([
          { opacity: 0.18, transform: "translate3d(0, 3px, 0)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)" }
        ], {
          duration: 138,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both"
        });
      }).catch(() => {});
      return;
    }

    updateHoverInfoContent(projectKey);
    projectHoverInfo.classList.add("is-visible");
    projectHoverInfo.setAttribute("aria-hidden", "false");
    hoverInfoAnimation = projectHoverInfo.animate([
      { opacity: 0, transform: "translate3d(-50%, 4px, 0)" },
      { opacity: 1, transform: "translate3d(-50%, 0, 0)" }
    ], {
      duration: 190,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)"
    });
  }

  function hideProjectHoverInfo(projectKey = activeHoverProject, immediate = false) {
    if (projectKey && activeHoverProject !== projectKey) return;
    if (!activeHoverProject && !projectHoverInfo.classList.contains("is-visible")) return;
    window.clearTimeout(hoverInfoHideTimer);
    const hide = () => {
      hoverInfoHideTimer = 0;
      activeHoverProject = null;
      ambientTunnel?.setActiveProject(null);
      ambientTunnel?.setState(activeWindow ? "WINDOW_OPEN" : "IDLE");
      if (hoverInfoAnimation) hoverInfoAnimation.cancel();
      projectHoverInfo.classList.remove("is-visible");
      projectHoverInfo.setAttribute("aria-hidden", "true");
      hoverInfoAnimation = projectHoverInfo.animate([
        { opacity: 1, transform: "translate3d(-50%, 0, 0)" },
        { opacity: 0, transform: "translate3d(-50%, -2px, 0)" }
      ], {
        duration: 115,
        easing: "ease-in"
      });
    };
    if (immediate) hide();
    else hoverInfoHideTimer = window.setTimeout(hide, 64);
  }

  function initializeDesktopPointerResponse() {
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const depthFactors = [3.2, 2.1, 4.1, 2.7, 3.6, 2.35];
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let pointerInside = false;
    let frameRequest = 0;
    let previousTime = 0;

    function scheduleFrame() {
      if (!frameRequest) frameRequest = requestAnimationFrame(renderFrame);
    }

    function renderFrame(timestamp) {
      frameRequest = 0;
      const elapsed = previousTime ? Math.min(0.05, (timestamp - previousTime) / 1000) : 1 / 60;
      previousTime = timestamp;
      const blend = 1 - Math.exp(-10 * elapsed);
      currentX += (targetX - currentX) * blend;
      currentY += (targetY - currentY) * blend;
      desktop.style.setProperty("--pointer-x", `${((currentX + 1) * 50).toFixed(2)}%`);
      desktop.style.setProperty("--pointer-y", `${((currentY + 1) * 50).toFixed(2)}%`);
      desktop.style.setProperty("--ambient-opacity", pointerInside && !reducedMotionQuery.matches ? "1" : "0");

      shortcuts.forEach((shortcut, index) => {
        if (shortcut.classList.contains("is-dragging") || shortcut.classList.contains("is-launching")) return;
        const depth = depthFactors[index] || 2.5;
        shortcut.style.setProperty("--parallax-x", reducedMotionQuery.matches ? "0px" : `${(currentX * depth).toFixed(2)}px`);
        shortcut.style.setProperty("--parallax-y", reducedMotionQuery.matches ? "0px" : `${(currentY * depth * 0.72).toFixed(2)}px`);
      });

      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) scheduleFrame();
      else previousTime = 0;
    }

    desktop.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || !finePointerQuery.matches) return;
      const rect = desktop.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      pointerInside = true;
      scheduleFrame();
    }, { passive: true });

    desktop.addEventListener("pointerleave", () => {
      pointerInside = false;
      targetX = 0;
      targetY = 0;
      scheduleFrame();
    }, { passive: true });

    reducedMotionQuery.addEventListener("change", scheduleFrame);
    finePointerQuery.addEventListener("change", () => {
      if (!finePointerQuery.matches) {
        pointerInside = false;
        targetX = 0;
        targetY = 0;
      }
      scheduleFrame();
    });
  }

  function updateResetShortcutAction() {
    resetShortcutLayoutButton.disabled = !shortcuts.some((shortcut) => shortcut.style.left || shortcut.style.top);
  }

  function restoreShortcutLayout() {
    const storedLayout = readLocalStorage(SHORTCUT_LAYOUT_STORAGE_KEY);
    if (!storedLayout) {
      updateResetShortcutAction();
      return;
    }

    try {
      const layout = JSON.parse(storedLayout);
      shortcuts.forEach((shortcut) => {
        const position = layout[shortcut.dataset.project];
        if (!position) return;
        const left = Number(position.left);
        const top = Number(position.top);
        if (!Number.isFinite(left) || !Number.isFinite(top) || left < 0 || left > 100 || top < 0 || top > 100) return;
        shortcut.style.left = `${left}%`;
        shortcut.style.top = `${top}%`;
      });
    } catch (error) {
      removeLocalStorage(SHORTCUT_LAYOUT_STORAGE_KEY);
    }
    updateResetShortcutAction();
  }

  function saveShortcutLayout() {
    const layout = {};
    shortcuts.forEach((shortcut) => {
      const left = Number.parseFloat(shortcut.style.left);
      const top = Number.parseFloat(shortcut.style.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) return;
      layout[shortcut.dataset.project] = { left, top };
    });

    if (Object.keys(layout).length) {
      writeLocalStorage(SHORTCUT_LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } else {
      removeLocalStorage(SHORTCUT_LAYOUT_STORAGE_KEY);
    }
    updateResetShortcutAction();
  }

  function resetShortcutLayout() {
    removeLocalStorage(SHORTCUT_LAYOUT_STORAGE_KEY);
    shortcuts.forEach((shortcut, index) => {
      shortcut.style.setProperty("--reset-delay", `${index * 26}ms`);
      shortcut.classList.add("is-resetting");
    });
    resetShortcutLayoutButton.setAttribute("aria-busy", "true");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        shortcuts.forEach((shortcut) => {
          shortcut.style.removeProperty("left");
          shortcut.style.removeProperty("top");
        });
      });
    });
    window.setTimeout(() => {
      shortcuts.forEach((shortcut) => {
        shortcut.classList.remove("is-resetting");
        shortcut.style.removeProperty("--reset-delay");
      });
      resetShortcutLayoutButton.removeAttribute("aria-busy");
      updateResetShortcutAction();
    }, 610);
  }

  function dismissInteractionHint() {
    window.clearTimeout(interactionHintTimer);
    window.clearTimeout(interactionHintDismissTimer);
    window.clearTimeout(tutorialNudgeTimer);
    interactionHint.classList.remove("is-visible");
    shortcuts.forEach((shortcut) => shortcut.classList.remove("is-tutorial-nudge"));
    writeSessionStorage(INTERACTION_HINT_STORAGE_KEY, "true");
  }

  function showInteractionHintOnce() {
    if (readSessionStorage(INTERACTION_HINT_STORAGE_KEY)) return;
    interactionHintTimer = window.setTimeout(() => {
      interactionHint.classList.add("is-visible");
      writeSessionStorage(INTERACTION_HINT_STORAGE_KEY, "true");
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tutorialNudgeTimer = window.setTimeout(() => {
          const tutorialShortcut = document.querySelector('.shortcut[data-project="champ"]');
          if (!activeWindow && tutorialShortcut) {
            tutorialShortcut.classList.add("is-tutorial-nudge");
            window.setTimeout(() => tutorialShortcut.classList.remove("is-tutorial-nudge"), 480);
          }
        }, 560);
      }
    }, 1680);
    interactionHintDismissTimer = window.setTimeout(() => interactionHint.classList.remove("is-visible"), 6900);
  }

  function launchShortcut(shortcut, callback) {
    const existingTimer = shortcutLaunchTimers.get(shortcut);
    if (existingTimer) window.clearTimeout(existingTimer);
    shortcut.classList.remove("is-launching");
    dismissInteractionHint();
    hideProjectHoverInfo(shortcut.dataset.project, true);
    ambientTunnel?.setActiveProject(shortcut.dataset.project);
    ambientTunnel?.setState("OPENING_WINDOW");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      callback();
      return;
    }

    requestAnimationFrame(() => shortcut.classList.add("is-launching"));
    const launchTimer = window.setTimeout(() => {
      callback();
      window.setTimeout(() => shortcut.classList.remove("is-launching"), 95);
      shortcutLaunchTimers.delete(shortcut);
    }, 82);
    shortcutLaunchTimers.set(shortcut, launchTimer);
  }

  function projectKeyFromHash() {
    const slug = window.location.hash.slice(1).trim().toLowerCase();
    return projectKeysBySlug[slug] || null;
  }

  function setProjectHash(projectKey) {
    const slug = projectSlugs[projectKey];
    if (!slug || window.location.hash === `#${slug}`) return;
    try {
      window.history.pushState({ project: projectKey }, "", `#${slug}`);
    } catch (error) {
      window.location.hash = slug;
    }
  }

  function clearProjectHash(projectKey) {
    if (window.location.hash !== `#${projectSlugs[projectKey]}`) return;
    try {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    } catch (error) {
      window.location.hash = "";
    }
  }

  function createProjectCarousel(project) {
    const sourceCount = project.images.length;
    const cardCount = Math.max(12, Math.ceil(12 / sourceCount) * sourceCount);
    const carousel = document.createElement("div");
    carousel.className = "project-carousel";
    carousel.tabIndex = 0;
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", `${project.title} project previews`);

    const stage = document.createElement("div");
    stage.className = "project-carousel-stage";
    carousel.appendChild(stage);

    const cards = Array.from({ length: cardCount }, (_, index) => {
      const [src, alt, , linkLabel] = project.images[index % sourceCount];
      const card = document.createElement(project.liveUrl ? "a" : "div");
      card.className = "project-carousel-card";
      card.dataset.carouselIndex = String(index);

      if (project.liveUrl) {
        card.href = project.liveUrl;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", linkLabel || `Open ${project.title} live project`);
      }

      if (index >= sourceCount) {
        card.tabIndex = -1;
        card.setAttribute("aria-hidden", "true");
      }

      const image = document.createElement("img");
      image.className = "project-carousel-image";
      image.src = src;
      image.alt = index < sourceCount ? alt : "";
      image.draggable = false;
      card.appendChild(image);
      stage.appendChild(card);
      return card;
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const FOLLOW_RATE = 12;
    const ROTATION_LIMIT = 62;
    const DISTRIBUTION_CURVE = 0.76;
    const SCALE_FALLOFF = 0.45;
    let width = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let previousPointerX = null;
    let touchPointer = null;
    let frame = 0;
    let previousTime = 0;
    let disposed = false;

    function wrapDistance(value, period) {
      return ((value + period / 2) % period + period) % period - period / 2;
    }

    function render() {
      if (!width) return;
      const radius = width * 0.35;

      cards.forEach((card, index) => {
        const distance = wrapDistance(index - currentProgress, cardCount);
        const absoluteDistance = Math.abs(distance);
        const direction = Math.sign(distance);
        const x = direction * radius * (1 - Math.exp(-DISTRIBUTION_CURVE * absoluteDistance));
        const scale = 0.28 + 0.72 * Math.exp(-SCALE_FALLOFF * absoluteDistance);
        const rotation = direction * ROTATION_LIMIT * (1 - Math.exp(-1.85 * absoluteDistance));
        const z = -width * 0.038 * Math.min(absoluteDistance, 5.5);
        const y = Math.min(absoluteDistance, 5) * width * 0.0025;
        const opacity = Math.max(0.12, Math.exp(-0.04 * absoluteDistance * absoluteDistance));
        const blur = Math.max(0, absoluteDistance - 3.2) * 0.42;

        card.style.zIndex = String(Math.max(1, 1000 - Math.round(absoluteDistance * 100)));
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `blur(${blur.toFixed(2)}px)`;
        card.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px) rotateY(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      });
    }

    function animate(time) {
      frame = 0;
      if (disposed) return;
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = time;
      const difference = targetProgress - currentProgress;

      if (reducedMotion.matches) {
        currentProgress = targetProgress;
      } else {
        currentProgress += difference * (1 - Math.exp(-FOLLOW_RATE * elapsed));
      }

      if (Math.abs(currentProgress) > cardCount * 100) {
        const turns = Math.trunc(currentProgress / cardCount) * cardCount;
        currentProgress -= turns;
        targetProgress -= turns;
      }

      render();
      if (Math.abs(targetProgress - currentProgress) > 0.0005) {
        frame = requestAnimationFrame(animate);
      } else {
        currentProgress = targetProgress;
        render();
      }
    }

    function requestRender() {
      if (reducedMotion.matches) {
        currentProgress = targetProgress;
        render();
        return;
      }
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    }

    function pixelsPerSlide() {
      return Math.min(320, Math.max(180, width * 0.14));
    }

    function moveByPixels(deltaX) {
      if (!Number.isFinite(deltaX) || !deltaX) return;
      targetProgress += deltaX / pixelsPerSlide();
      requestRender();
    }

    function handlePointerEnter(event) {
      if (event.pointerType === "mouse") previousPointerX = event.clientX;
    }

    function handlePointerMove(event) {
      if (event.pointerType === "mouse") {
        if (previousPointerX === null) {
          previousPointerX = event.clientX;
          return;
        }
        moveByPixels(event.clientX - previousPointerX);
        previousPointerX = event.clientX;
        return;
      }

      if (!touchPointer || touchPointer.id !== event.pointerId) return;
      moveByPixels(event.clientX - touchPointer.x);
      touchPointer.x = event.clientX;
    }

    function handlePointerDown(event) {
      if (event.pointerType === "mouse") return;
      touchPointer = { id: event.pointerId, x: event.clientX };
      carousel.setPointerCapture(event.pointerId);
    }

    function handlePointerEnd(event) {
      if (event.pointerType === "mouse") {
        previousPointerX = null;
        return;
      }
      if (!touchPointer || touchPointer.id !== event.pointerId) return;
      touchPointer = null;
      if (carousel.hasPointerCapture(event.pointerId)) carousel.releasePointerCapture(event.pointerId);
    }

    function handleKeydown(event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      targetProgress += event.key === "ArrowRight" ? 0.7 : -0.7;
      requestRender();
    }

    function measure() {
      width = carousel.clientWidth;
      if (!width) return;
      const cardWidth = Math.min(560, Math.max(180, width * 0.29));
      const carouselPadding = Math.min(72, Math.max(36, width * 0.045));
      carousel.style.setProperty("--carousel-card-width", `${cardWidth}px`);
      carousel.style.setProperty("--carousel-height", `${cardWidth / 1.5 + carouselPadding}px`);
      carousel.style.setProperty("--carousel-perspective", `${Math.max(720, width * 1.08)}px`);
      render();
    }

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(carousel);
    carousel.addEventListener("pointerenter", handlePointerEnter);
    carousel.addEventListener("pointermove", handlePointerMove);
    carousel.addEventListener("pointerdown", handlePointerDown);
    carousel.addEventListener("pointerup", handlePointerEnd);
    carousel.addEventListener("pointercancel", handlePointerEnd);
    carousel.addEventListener("pointerleave", handlePointerEnd);
    carousel.addEventListener("keydown", handleKeydown);
    requestAnimationFrame(measure);

    return {
      element: carousel,
      destroy() {
        disposed = true;
        if (frame) cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        carousel.removeEventListener("pointerenter", handlePointerEnter);
        carousel.removeEventListener("pointermove", handlePointerMove);
        carousel.removeEventListener("pointerdown", handlePointerDown);
        carousel.removeEventListener("pointerup", handlePointerEnd);
        carousel.removeEventListener("pointercancel", handlePointerEnd);
        carousel.removeEventListener("pointerleave", handlePointerEnd);
        carousel.removeEventListener("keydown", handleKeydown);
      }
    };
  }

  function makeTitlebar(title, icon = "") {
    return `
      <div class="titlebar">
        <div class="traffic-lights" aria-label="Window controls">
          <button class="traffic-light traffic-light--close" type="button" aria-label="Close window"></button>
          <span class="traffic-light traffic-light--minimize" aria-hidden="true"></span>
          <button class="traffic-light traffic-light--zoom" type="button" aria-label="Expand window" aria-pressed="false"></button>
        </div>
        <span class="window-title">
          ${icon ? `<img class="window-title-icon" src="${escapeHTML(icon)}" alt="">` : ""}
          <span>${escapeHTML(title)}</span>
        </span>
      </div>`;
  }

  function makeShortcutDraggable(shortcut) {
    let dragState = null;

    function resetShortcutTilt() {
      shortcut.style.setProperty("--tilt-x", "0deg");
      shortcut.style.setProperty("--tilt-y", "0deg");
    }

    shortcut.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch" || shortcut.classList.contains("is-dragging")) return;
      showProjectHoverInfo(shortcut.dataset.project);
    });

    shortcut.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || shortcut.classList.contains("is-dragging")) return;
      const rect = shortcut.getBoundingClientRect();
      const localX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const localY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      shortcut.style.setProperty("--tilt-x", `${(-localY * 2.6).toFixed(2)}deg`);
      shortcut.style.setProperty("--tilt-y", `${(localX * 2.6).toFixed(2)}deg`);
    }, { passive: true });

    shortcut.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      shortcut.classList.remove("suppress-hover");

      const desktopRect = desktop.getBoundingClientRect();
      const shortcutRect = shortcut.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: shortcutRect.left - desktopRect.left,
        startTop: shortcutRect.top - desktopRect.top,
        moved: false
      };
      shortcut.setPointerCapture(event.pointerId);
    });

    function moveShortcut(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - dragState.startX;
      const deltaY = event.clientY - dragState.startY;
      if (!dragState.moved && Math.hypot(deltaX, deltaY) < 5) return;

      dragState.moved = true;
      shortcut.classList.add("is-dragging");
      shortcut.setAttribute("aria-grabbed", "true");
      ambientTunnel?.setActiveProject(null);
      ambientTunnel?.setState("DRAGGING");
      resetShortcutTilt();
      hideProjectHoverInfo(shortcut.dataset.project, true);
      dismissInteractionHint();

      const desktopRect = desktop.getBoundingClientRect();
      const shortcutRect = shortcut.getBoundingClientRect();
      const maxLeft = Math.max(0, desktopRect.width - shortcutRect.width);
      const maxTop = Math.max(0, desktopRect.height - shortcutRect.height);
      const nextLeft = Math.min(maxLeft, Math.max(0, dragState.startLeft + deltaX));
      const nextTop = Math.min(maxTop, Math.max(0, dragState.startTop + deltaY));

      shortcut.style.left = `${(nextLeft / desktopRect.width) * 100}%`;
      shortcut.style.top = `${(nextTop / desktopRect.height) * 100}%`;
      event.preventDefault();
    }

    function stopShortcutDrag(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const wasMoved = dragState.moved;
      dragState = null;
      if (wasMoved) {
        suppressShortcutClick.add(shortcut);
        shortcut.classList.add("suppress-hover");
        saveShortcutLayout();
        window.setTimeout(() => suppressShortcutClick.delete(shortcut), 0);
      }

      shortcut.classList.remove("is-dragging");
      shortcut.setAttribute("aria-grabbed", "false");
      ambientTunnel?.setActiveProject(null);
      ambientTunnel?.setState(activeWindow ? "WINDOW_OPEN" : "IDLE");
      resetShortcutTilt();
      if (shortcut.hasPointerCapture(event.pointerId)) shortcut.releasePointerCapture(event.pointerId);
    }

    document.addEventListener("pointermove", moveShortcut);
    document.addEventListener("pointerup", stopShortcutDrag, true);
    document.addEventListener("pointercancel", stopShortcutDrag, true);
    shortcut.addEventListener("lostpointercapture", stopShortcutDrag);
    shortcut.addEventListener("pointerleave", () => {
      resetShortcutTilt();
      hideProjectHoverInfo(shortcut.dataset.project);
      if (!shortcut.classList.contains("is-dragging")) shortcut.classList.remove("suppress-hover");
    });
  }

  function updateDesktopWindowState() {
    desktop.classList.toggle("has-focused-project", Boolean(activeWindow?.classList.contains("window--project")));
  }

  function focusWindow(windowElement) {
    if (!windowElement || windowElement.classList.contains("is-closing")) return;
    zCounter += 1;
    windowElement.style.zIndex = String(zCounter);
    document.querySelectorAll(".window.is-active").forEach((element) => element.classList.remove("is-active"));
    windowElement.classList.add("is-active");
    activeWindow = windowElement;
    updateDesktopWindowState();
    if (!windowElement.classList.contains("is-opening") && !windowElement.classList.contains("is-closing")) {
      ambientTunnel?.setActiveProject(windowElement.dataset.project || null);
      ambientTunnel?.setState("WINDOW_OPEN");
    }
  }

  function sourceElementForWindow(windowElement) {
    if (windowElement.sourceElement?.isConnected) return windowElement.sourceElement;
    if (windowElement.dataset.project) {
      return document.querySelector(`.shortcut[data-project="${windowElement.dataset.project}"] .shortcut-thumbnail`);
    }
    if (windowElement.dataset.windowKey === "app:about") {
      return document.querySelector('[data-app="about"] .dock-visual');
    }
    if (windowElement.dataset.windowKey === "app:notes") {
      return document.querySelector('[data-app="notes"] .dock-visual');
    }
    return null;
  }

  function usableRect(element) {
    if (!element?.isConnected) return null;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : null;
  }

  function sourceTransform(windowRect, sourceRect) {
    if (!sourceRect) return { transform: "scale(0.82)", radius: "32px" };
    const scale = Math.max(0.035, Math.min(0.3, Math.min(
      sourceRect.width / windowRect.width,
      sourceRect.height / windowRect.height
    )));
    const translateX = sourceRect.left + sourceRect.width / 2 - (windowRect.left + windowRect.width / 2);
    const translateY = sourceRect.top + sourceRect.height / 2 - (windowRect.top + windowRect.height / 2);
    const sourceRadius = Math.min(sourceRect.width, sourceRect.height) * 0.22;
    const unscaledRadius = Math.min(windowRect.height / 2, sourceRadius / scale);
    return {
      transform: `translate3d(${translateX.toFixed(3)}px, ${translateY.toFixed(3)}px, 0) scale(${scale.toFixed(5)})`,
      radius: `${unscaledRadius.toFixed(2)}px`
    };
  }

  function windowMotionContents(windowElement) {
    return Array.from(windowElement.children).filter((child) => child.matches(".titlebar, .window-body"));
  }

  function cancelWindowMotion(windowElement) {
    const motion = windowElement.windowMotion;
    if (!motion) return;
    [motion.shell, ...(motion.contents || [])].forEach((animation) => {
      try { animation.cancel(); } catch (error) { /* Animation may already be idle. */ }
    });
    windowElement.windowMotion = null;
    windowElement.classList.remove("is-opening", "is-closing");
  }

  function completeWindowOpen(windowElement, token) {
    const motion = windowElement.windowMotion;
    if (!motion || motion.token !== token || !windowElement.isConnected) return;
    [motion.shell, ...motion.contents].forEach((animation) => animation.cancel());
    windowElement.windowMotion = null;
    windowElement.classList.remove("is-opening", "is-closing");
    ambientTunnel?.setActiveProject(windowElement.dataset.project || null);
    ambientTunnel?.setState("WINDOW_OPEN");
  }

  function animateWindowOpen(windowElement, sourceRect) {
    cancelWindowMotion(windowElement);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const destinationRect = windowElement.getBoundingClientRect();
    const destinationStyle = getComputedStyle(windowElement);
    const origin = sourceTransform(destinationRect, reducedMotion ? null : sourceRect);
    const token = (windowElement.motionToken || 0) + 1;
    windowElement.motionToken = token;
    windowElement.classList.add("is-opening");
    ambientTunnel?.setActiveProject(windowElement.dataset.project || null);
    ambientTunnel?.setState("OPENING_WINDOW");

    const shellFrames = reducedMotion ? [
      { opacity: 0 },
      { opacity: 1 }
    ] : [
      {
        transform: origin.transform,
        opacity: 0.14,
        borderRadius: origin.radius,
        boxShadow: "0 5px 14px rgba(0, 0, 0, 0.12)"
      },
      { opacity: 0.72, offset: 0.24 },
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        opacity: 1,
        borderRadius: destinationStyle.borderRadius,
        boxShadow: destinationStyle.boxShadow
      }
    ];
    const shell = windowElement.animate(shellFrames, {
      duration: reducedMotion ? 135 : (windowElement.classList.contains("window--project") ? 390 : 360),
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both"
    });
    const contents = windowMotionContents(windowElement).map((content) => content.animate([
      { opacity: 0, filter: reducedMotion ? "none" : "blur(1.5px)" },
      { opacity: 0.03, offset: reducedMotion ? 0 : 0.2 },
      { opacity: 1, filter: "blur(0)" }
    ], {
      duration: reducedMotion ? 110 : 285,
      delay: reducedMotion ? 15 : 64,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both"
    }));

    windowElement.windowMotion = { phase: "opening", shell, contents, token };
    shell.finished.then(() => completeWindowOpen(windowElement, token)).catch(() => {});
  }

  function finalizeWindowRemoval(windowElement, token) {
    if (windowElement.motionToken !== token || !windowElement.classList.contains("is-closing")) return;
    const key = windowElement.dataset.windowKey;
    if (typeof windowElement.cleanupWindow === "function") {
      windowElement.cleanupWindow();
      windowElement.cleanupWindow = null;
    }
    cancelWindowMotion(windowElement);
    if (windowRegistry.get(key) === windowElement) windowRegistry.delete(key);
    windowElement.remove();
    const remaining = Array.from(document.querySelectorAll(".window"));
    activeWindow = remaining.sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex))[0] || null;
    if (activeWindow) activeWindow.classList.add("is-active");
    updateDesktopWindowState();
    ambientTunnel?.setActiveProject(activeWindow?.dataset.project || activeHoverProject || null);
    ambientTunnel?.setState(activeWindow ? "WINDOW_OPEN" : (activeHoverProject ? "FOCUSED_PROJECT" : "IDLE"));
  }

  function reverseWindowClose(windowElement, sourceElement) {
    const motion = windowElement.windowMotion;
    if (!motion || motion.phase !== "closing") return false;
    const token = (windowElement.motionToken || 0) + 1;
    windowElement.motionToken = token;
    windowElement.sourceElement = sourceElement || windowElement.sourceElement;
    windowElement.classList.remove("is-closing");
    motion.phase = "reopening";
    motion.token = token;
    ambientTunnel?.setActiveProject(windowElement.dataset.project || null);
    ambientTunnel?.setState("OPENING_WINDOW");
    [motion.shell, ...motion.contents].forEach((animation) => animation.reverse());
    motion.shell.finished.then(() => completeWindowOpen(windowElement, token)).catch(() => {});
    focusWindow(windowElement);
    return true;
  }

  function closeWindow(windowElement) {
    if (!windowElement || windowElement.classList.contains("is-closing")) return;
    ambientTunnel?.setActiveProject(windowElement.dataset.project || null);
    ambientTunnel?.setState("CLOSING_WINDOW");
    if (windowElement.windowGeometryAnimation) {
      windowElement.windowGeometryAnimation.cancel();
      windowElement.windowGeometryAnimation = null;
    }
    windowElement.classList.add("is-closing");
    if (windowElement.dataset.project) clearProjectHash(windowElement.dataset.project);
    const existingMotion = windowElement.windowMotion;
    const token = (windowElement.motionToken || 0) + 1;
    windowElement.motionToken = token;

    if (existingMotion?.phase === "opening" && existingMotion.shell.playState === "running") {
      existingMotion.phase = "closing";
      existingMotion.token = token;
      [existingMotion.shell, ...existingMotion.contents].forEach((animation) => animation.reverse());
      existingMotion.shell.finished.then(() => finalizeWindowRemoval(windowElement, token)).catch(() => {});
      return;
    }

    cancelWindowMotion(windowElement);
    windowElement.classList.add("is-closing");
    windowElement.motionToken = token;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const windowRect = windowElement.getBoundingClientRect();
    const sourceRect = usableRect(sourceElementForWindow(windowElement));
    const destination = sourceTransform(windowRect, reducedMotion ? null : sourceRect);
    const windowStyle = getComputedStyle(windowElement);
    const shell = windowElement.animate(reducedMotion ? [
      { opacity: 1 },
      { opacity: 0 }
    ] : [
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        opacity: 1,
        borderRadius: windowStyle.borderRadius,
        boxShadow: windowStyle.boxShadow
      },
      { opacity: 0.58, offset: 0.66 },
      {
        transform: destination.transform,
        opacity: 0.1,
        borderRadius: destination.radius,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
      }
    ], {
      duration: reducedMotion ? 120 : 285,
      easing: "cubic-bezier(0.4, 0, 0.7, 0.2)",
      fill: "both"
    });
    const contents = windowMotionContents(windowElement).map((content) => content.animate([
      { opacity: 1, filter: "blur(0)" },
      { opacity: 0, filter: reducedMotion ? "none" : "blur(1.2px)" }
    ], {
      duration: reducedMotion ? 95 : 170,
      easing: "ease-in",
      fill: "both"
    }));
    windowElement.windowMotion = { phase: "closing", shell, contents, token };
    shell.finished.then(() => finalizeWindowRemoval(windowElement, token)).catch(() => {});
  }

  function animateWindowGeometry(windowElement, previousRect) {
    if (windowElement.windowGeometryAnimation) {
      windowElement.windowGeometryAnimation.cancel();
    }

    const nextRect = windowElement.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;
    const scaleX = previousRect.width / nextRect.width;
    const scaleY = previousRect.height / nextRect.height;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animation = windowElement.animate(reducedMotion ? [
      { opacity: 0.94 },
      { opacity: 1 }
    ] : [
      {
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
        borderRadius: getComputedStyle(windowElement).borderRadius
      },
      {
        transform: "translate3d(0, 0, 0) scale(1, 1)",
        borderRadius: getComputedStyle(windowElement).borderRadius
      }
    ], {
      duration: reducedMotion ? 1 : 320,
      easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      fill: "both"
    });

    windowElement.windowGeometryAnimation = animation;
    animation.finished.then(() => {
      if (windowElement.windowGeometryAnimation !== animation) return;
      animation.cancel();
      windowElement.windowGeometryAnimation = null;
    }).catch(() => {});
  }

  function toggleWindowExpanded(windowElement) {
    if (!windowElement || windowElement.classList.contains("is-closing")) return;
    if (windowElement.windowMotion?.phase === "opening") {
      completeWindowOpen(windowElement, windowElement.windowMotion.token);
    }

    focusWindow(windowElement);
    const previousRect = windowElement.getBoundingClientRect();
    const zoomButton = windowElement.querySelector(".traffic-light--zoom");
    const isExpanded = windowElement.classList.contains("is-expanded");

    if (isExpanded) {
      const geometry = windowElement.restoreGeometry || {};
      ["left", "top", "right", "bottom", "width", "height"].forEach((property) => {
        windowElement.style[property] = geometry[property] || "";
      });
      windowElement.classList.remove("is-expanded");
      windowElement.restoreGeometry = null;
      zoomButton?.setAttribute("aria-label", "Expand window");
      zoomButton?.setAttribute("aria-pressed", "false");
    } else {
      windowElement.restoreGeometry = {};
      ["left", "top", "right", "bottom", "width", "height"].forEach((property) => {
        windowElement.restoreGeometry[property] = windowElement.style[property];
      });
      windowElement.classList.add("is-expanded");
      zoomButton?.setAttribute("aria-label", "Restore window");
      zoomButton?.setAttribute("aria-pressed", "true");
    }

    animateWindowGeometry(windowElement, previousRect);
  }

  function makeDraggable(windowElement) {
    const titlebar = windowElement.querySelector(".titlebar");
    let dragState = null;

    titlebar.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".traffic-light")) return;
      if (windowElement.classList.contains("is-expanded")) return;
      if (windowElement.windowMotion?.phase === "opening") {
        completeWindowOpen(windowElement, windowElement.windowMotion.token);
      }
      focusWindow(windowElement);
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = windowElement.getBoundingClientRect();
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: windowRect.left - desktopRect.left,
        startTop: windowRect.top - desktopRect.top
      };
      titlebar.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    titlebar.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = windowElement.getBoundingClientRect();
      const maxLeft = Math.max(0, desktopRect.width - windowRect.width);
      const maxTop = Math.max(0, desktopRect.height - titlebar.getBoundingClientRect().height - 8);
      const nextLeft = Math.min(maxLeft, Math.max(0, dragState.startLeft + event.clientX - dragState.startX));
      const nextTop = Math.min(maxTop, Math.max(0, dragState.startTop + event.clientY - dragState.startY));
      windowElement.style.left = `${nextLeft}px`;
      windowElement.style.top = `${nextTop}px`;
    });

    function stopDragging(event) {
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      dragState = null;
      if (titlebar.hasPointerCapture(event.pointerId)) titlebar.releasePointerCapture(event.pointerId);
    }

    titlebar.addEventListener("pointerup", stopDragging);
    titlebar.addEventListener("pointercancel", stopDragging);
    titlebar.addEventListener("dblclick", (event) => {
      if (event.target.closest(".traffic-light")) return;
      toggleWindowExpanded(windowElement);
    });
  }

  function registerWindow(windowElement, key, sourceElement) {
    const sourceRect = usableRect(sourceElement);
    windowElement.dataset.windowKey = key;
    windowElement.sourceElement = sourceElement || null;
    windowRegistry.set(key, windowElement);
    windowLayer.appendChild(windowElement);
    if (typeof windowElement.initializeWindow === "function") {
      windowElement.initializeWindow();
      windowElement.initializeWindow = null;
    }

    windowElement.addEventListener("pointerdown", () => focusWindow(windowElement));
    windowElement.querySelector(".traffic-light--close").addEventListener("click", (event) => {
      event.stopPropagation();
      closeWindow(windowElement);
    });
    windowElement.querySelector(".traffic-light--zoom").addEventListener("click", (event) => {
      event.stopPropagation();
      toggleWindowExpanded(windowElement);
    });

    makeDraggable(windowElement);
    focusWindow(windowElement);
    animateWindowOpen(windowElement, sourceRect);
    return windowElement;
  }

  function openWindow(key, createWindow, sourceElement) {
    dismissInteractionHint();
    hideProjectHoverInfo(activeHoverProject, true);
    ambientTunnel?.setState("OPENING_WINDOW");
    const existing = windowRegistry.get(key);
    if (existing) {
      if (reverseWindowClose(existing, sourceElement)) return existing;
      existing.sourceElement = sourceElement || existing.sourceElement;
      focusWindow(existing);
      ambientTunnel?.setActiveProject(existing.dataset.project || null);
      ambientTunnel?.setState("WINDOW_OPEN");
      return existing;
    }
    return registerWindow(createWindow(), key, sourceElement);
  }

  function createProjectWindow(projectKey) {
    const project = projectData[projectKey];
    const windowElement = document.createElement("article");
    windowElement.className = "window window--project is-opening";
    windowElement.dataset.project = projectKey;
    windowElement.style.setProperty("--project-accent", project.accent || "#1778ff");
    windowElement.setAttribute("role", "dialog");
    windowElement.setAttribute("aria-label", `${project.title} project`);

    const metadata = project.meta.map(([label, value]) => `
      <div class="meta-item">
        <span class="meta-label">${escapeHTML(label)}</span>
        <span class="meta-value">${escapeHTML(value)}</span>
      </div>`).join("");

    const liveLink = project.liveUrl ? `
      <a class="project-live-link" href="${escapeHTML(project.liveUrl)}" target="_blank" rel="noopener noreferrer">
        Open live project <span aria-hidden="true">↗</span>
      </a>` : "";

    const sourceLink = project.repoUrl ? `
      <a class="project-source-link" href="${escapeHTML(project.repoUrl)}" target="_blank" rel="noopener noreferrer">
        View source <span aria-hidden="true">↗</span>
      </a>` : "";

    const highlights = project.highlights ? `
      <ul class="project-highlights" aria-label="Key capabilities">
        ${project.highlights.map((highlight) => `<li>${escapeHTML(highlight)}</li>`).join("")}
      </ul>` : "";

    windowElement.innerHTML = `
      ${makeTitlebar(project.title, project.icon)}
      <div class="window-body">
        <div class="project-content">
          <div class="project-heading-row">
            <h2>${escapeHTML(project.title)}</h2>
            <div class="project-actions">${sourceLink}${liveLink}</div>
          </div>
          <p class="project-description">${escapeHTML(project.description)}</p>
          ${highlights}
          <div class="project-meta">${metadata}</div>
          <div class="project-gallery project-gallery--carousel"></div>
        </div>
      </div>`;

    const gallery = windowElement.querySelector(".project-gallery");
    if (project.images?.length) {
      const carousel = createProjectCarousel(project);
      gallery.appendChild(carousel.element);
      windowElement.cleanupWindow = carousel.destroy;
    } else {
      gallery.classList.remove("project-gallery--carousel");
      gallery.innerHTML = `
        <div class="project-preview-unavailable">
          ${project.previewIcon ? `<img src="${escapeHTML(project.previewIcon)}" alt="">` : ""}
          <div>
            <span class="project-preview-eyebrow">Repository-only project</span>
            <h3>Frontend preview unavailable</h3>
            <p>${escapeHTML(project.previewNote || "No project imagery is currently available.")}</p>
          </div>
        </div>`;
    }
    return windowElement;
  }

  function openProjectWindow(projectKey, options = {}) {
    const sourceElement = options.sourceElement || document.querySelector(`.shortcut[data-project="${projectKey}"] .shortcut-thumbnail`);
    const windowElement = openWindow(`project:${projectKey}`, () => createProjectWindow(projectKey), sourceElement);
    if (options.updateHash !== false) setProjectHash(projectKey);
    return windowElement;
  }

  function greatCircleCoordinates(from, to, segments = 96) {
    const radians = Math.PI / 180;
    const degrees = 180 / Math.PI;
    const toVector = ([longitude, latitude]) => {
      const lng = longitude * radians;
      const lat = latitude * radians;
      const cosLat = Math.cos(lat);
      return [cosLat * Math.cos(lng), cosLat * Math.sin(lng), Math.sin(lat)];
    };
    const start = toVector(from);
    const end = toVector(to);
    const dot = Math.min(1, Math.max(-1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2]));
    const omega = Math.acos(dot);
    const sinOmega = Math.sin(omega);
    const coordinates = [];
    let previousLongitude = null;

    for (let index = 0; index <= segments; index += 1) {
      const progress = index / segments;
      const startWeight = sinOmega < 0.000001 ? 1 - progress : Math.sin((1 - progress) * omega) / sinOmega;
      const endWeight = sinOmega < 0.000001 ? progress : Math.sin(progress * omega) / sinOmega;
      const x = startWeight * start[0] + endWeight * end[0];
      const y = startWeight * start[1] + endWeight * end[1];
      const z = startWeight * start[2] + endWeight * end[2];
      let longitude = Math.atan2(y, x) * degrees;
      const latitude = Math.atan2(z, Math.sqrt(x * x + y * y)) * degrees;

      if (previousLongitude !== null) {
        while (longitude - previousLongitude > 180) longitude -= 360;
        while (longitude - previousLongitude < -180) longitude += 360;
      }
      previousLongitude = longitude;
      coordinates.push([longitude, latitude]);
    }

    return coordinates;
  }

  function locationArcData(locations = []) {
    return {
      type: "FeatureCollection",
      features: locations.map((destination) => ({
        type: "Feature",
        properties: { id: destination.name },
        geometry: {
          type: "LineString",
          coordinates: greatCircleCoordinates(
            [destination.lng, destination.lat],
            [LOCATION_HUB.lng, LOCATION_HUB.lat]
          )
        }
      }))
    };
  }

  function angularDistance(from, to) {
    const radians = Math.PI / 180;
    const fromLat = from.lat * radians;
    const toLat = to.lat * radians;
    const latitudeDelta = (to.lat - from.lat) * radians;
    const longitudeDelta = (to.lng - from.lng) * radians;
    const a = Math.sin(latitudeDelta / 2) ** 2
      + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(longitudeDelta / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))) / radians;
  }

  function locationNetworkLevel(zoom) {
    return LOCATION_NETWORK_LEVELS.find((level) => zoom < level.maxZoom)
      || LOCATION_NETWORK_LEVELS[LOCATION_NETWORK_LEVELS.length - 1];
  }

  function networkLocationId(levelId, location) {
    return `${levelId}:${location.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  }

  function createLocationMarker(city, isHub) {
    const marker = document.createElement("div");
    marker.className = `location-marker ${isHub ? "location-marker--hub" : "location-marker--destination"}`;
    marker.setAttribute("role", "img");
    marker.setAttribute("aria-label", `${city.name}${isHub ? ", central hub" : ", connected to Lagos"}`);
    marker.innerHTML = `
      <span class="location-marker-content">
        <span class="location-marker-label">${escapeHTML(city.name)}</span>
        <span class="location-marker-stem" aria-hidden="true"></span>
        <span class="location-marker-core" aria-hidden="true"></span>
      </span>`;
    return marker;
  }

  function initializeLocationGlobe(mapCard) {
    const mapContainer = mapCard.querySelector(".location-map");
    const status = mapCard.querySelector(".location-map-status");
    if (!mapContainer || !window.maplibregl) {
      if (status) status.textContent = "Interactive map unavailable. Connect to the internet and reopen About me.";
      mapCard.classList.add("has-map-error");
      return () => {};
    }

    let destroyed = false;
    let loaded = false;
    let animationFrame = 0;
    let previousFrameTime = 0;
    let lastNetworkRefresh = 0;
    let activeNetworkSignature = "";
    let lastInteractionTime = performance.now() - MAP_IDLE_RESUME_DELAY;
    let userInteracting = false;
    let rotationAllowed = true;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const markerInstances = [];
    const networkMarkers = new Map();

    let map;
    try {
      map = new window.maplibregl.Map({
        container: mapContainer,
        style: LOCATION_MAP_STYLE,
        center: [LOCATION_HUB.lng, LOCATION_HUB.lat],
        zoom: MAP_INITIAL_ZOOM,
        minZoom: 0.55,
        maxZoom: 18.5,
        pitch: 0,
        maxPitch: 0,
        bearing: 0,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        attributionControl: false,
        fadeDuration: 120
      });
    } catch (error) {
      if (status) status.textContent = "Interactive globe unavailable in this browser.";
      mapCard.classList.add("has-map-error");
      return () => {};
    }

    map.addControl(new window.maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.scrollZoom.setWheelZoomRate(1 / 520);
    map.scrollZoom.setZoomRate(1 / 95);

    function noteInteraction(active = userInteracting) {
      userInteracting = active;
      lastInteractionTime = performance.now();
    }

    function updateZoomState() {
      const zoom = map.getZoom();
      if (zoom >= STOP_ROTATION_ZOOM) rotationAllowed = false;
      else if (zoom <= RESUME_ROTATION_ZOOM) rotationAllowed = true;
      mapCard.classList.toggle("is-map-close", zoom >= 8.2);
    }

    function addMarker(city, isHub, locationId = "lagos-hub") {
      const element = createLocationMarker(city, isHub);
      element.dataset.locationId = locationId;
      const marker = new window.maplibregl.Marker({
        element,
        anchor: "bottom",
        opacityWhenCovered: "0",
        subpixelPositioning: true
      }).setLngLat([city.lng, city.lat]).addTo(map);
      markerInstances.push(marker);
      if (!isHub) networkMarkers.set(locationId, { element, city });
    }

    function refineMapContrast() {
      const paint = (layerId, property, value) => {
        if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, value);
      };
      paint("background", "background-color", "#0d1110");
      paint("water", "fill-color", "#2b353b");
      paint("waterway", "line-color", "#2b353b");
      paint("boundary_state", "line-color", "rgba(110, 124, 119, 0.54)");
      paint("boundary_country_z0-4", "line-color", "rgba(151, 164, 158, 0.68)");
      paint("boundary_country_z5-", "line-color", "rgba(151, 164, 158, 0.62)");
      ["place_country_other", "place_country_minor", "place_country_major"].forEach((layerId) => {
        paint(layerId, "text-color", "#879690");
        paint(layerId, "text-halo-color", "rgba(5, 8, 7, 0.9)");
      });
      ["place_city", "place_city_large", "place_state"].forEach((layerId) => {
        paint(layerId, "text-color", "#6f7c77");
        paint(layerId, "text-halo-color", "rgba(5, 8, 7, 0.88)");
      });
      if (typeof map.setSky === "function") {
        map.setSky({
          "sky-color": "#010202",
          "sky-horizon-blend": 0.04,
          "horizon-color": "#020403",
          "horizon-fog-blend": 0.035,
          "fog-color": "#020403",
          "fog-ground-blend": 0.08,
          "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.08, 5, 0]
        });
      }
    }

    function refreshLocationNetwork(timestamp = performance.now(), force = false) {
      if (!map.getSource("lagos-connections")) return;
      if (!force && timestamp - lastNetworkRefresh < 280) return;
      lastNetworkRefresh = timestamp;

      const zoom = map.getZoom();
      const level = locationNetworkLevel(zoom);
      const center = map.getCenter();
      const ranked = level.locations
        .map((city) => ({
          ...city,
          locationId: networkLocationId(level.id, city),
          distance: angularDistance(center, city)
        }))
        .sort((a, b) => a.distance - b.distance);
      const frontFacing = ranked.filter((city) => city.distance <= 102);
      const minimumCount = Math.min(4, ranked.length);
      const selected = (frontFacing.length >= minimumCount ? frontFacing : ranked).slice(0, level.limit);
      const selectedIds = new Set(selected.map((city) => city.locationId));
      const signature = `${level.id}:${Array.from(selectedIds).sort().join("|")}`;
      if (!force && signature === activeNetworkSignature) return;
      activeNetworkSignature = signature;
      mapCard.dataset.networkLevel = level.id;

      networkMarkers.forEach(({ element }, locationId) => {
        const visible = selectedIds.has(locationId);
        element.classList.toggle("is-network-visible", visible);
        element.setAttribute("aria-hidden", String(!visible));
      });
      map.getSource("lagos-connections").setData(locationArcData(selected));
    }

    function configureMap() {
      if (destroyed) return;
      map.setProjection({ type: "globe" });
      refineMapContrast();
      map.addSource("lagos-connections", {
        type: "geojson",
        data: locationArcData([])
      });
      map.addSource("continent-labels", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: LOCATION_CONTINENTS.map((continent) => ({
            type: "Feature",
            properties: { name: continent.name },
            geometry: { type: "Point", coordinates: [continent.lng, continent.lat] }
          }))
        }
      });
      map.addLayer({
        id: "continent-labels",
        type: "symbol",
        source: "continent-labels",
        minzoom: 0,
        maxzoom: 3.7,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 0, 11, 2.4, 17],
          "text-letter-spacing": 0.14,
          "text-transform": "uppercase",
          "text-allow-overlap": false
        },
        paint: {
          "text-color": "#8b9da5",
          "text-halo-color": "rgba(4, 7, 7, 0.88)",
          "text-halo-width": 1.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.72, 2.6, 0.52, 3.7, 0]
        }
      });
      map.addLayer({
        id: "lagos-connections-glow",
        type: "line",
        source: "lagos-connections",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": MAP_ACCENT,
          "line-width": ["interpolate", ["linear"], ["zoom"], 0, 3.2, 3, 2.4, 8, 1],
          "line-blur": 2.5,
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.24, 2.2, 0.2, 5, 0.12, 9, 0.08, 14, 0.04]
        }
      });
      map.addLayer({
        id: "lagos-connections",
        type: "line",
        source: "lagos-connections",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": MAP_ACCENT,
          "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1.35, 3, 1.2, 8, 0.8],
          "line-dasharray": [2, 2],
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.82, 2.2, 0.72, 5, 0.48, 9, 0.34, 14, 0.18]
        }
      });

      addMarker(LOCATION_HUB, true);
      LOCATION_NETWORK_LEVELS.forEach((level) => {
        level.locations.forEach((destination) => {
          addMarker(destination, false, networkLocationId(level.id, destination));
        });
      });
      updateZoomState();
      refreshLocationNetwork(performance.now(), true);
    }

    function animateGlobe(timestamp) {
      if (destroyed) return;
      const deltaTime = previousFrameTime ? Math.min(0.05, (timestamp - previousFrameTime) / 1000) : 0;
      previousFrameTime = timestamp;
      updateZoomState();
      refreshLocationNetwork(timestamp);

      if (
        loaded &&
        deltaTime > 0 &&
        !reducedMotionQuery.matches &&
        rotationAllowed &&
        !userInteracting &&
        timestamp - lastInteractionTime >= MAP_IDLE_RESUME_DELAY
      ) {
        const center = map.getCenter();
        map.jumpTo({ center: [center.lng - MAP_ROTATION_SPEED * deltaTime, center.lat] });
      }
      animationFrame = requestAnimationFrame(animateGlobe);
    }

    const beginInteraction = () => noteInteraction(true);
    const endInteraction = () => noteInteraction(false);
    const wheelInteraction = () => noteInteraction(false);
    const canvas = map.getCanvasContainer();
    canvas.addEventListener("pointerdown", beginInteraction, { passive: true });
    canvas.addEventListener("wheel", wheelInteraction, { passive: true });
    canvas.addEventListener("dblclick", wheelInteraction, { passive: true });
    window.addEventListener("pointerup", endInteraction, true);
    window.addEventListener("pointercancel", endInteraction, true);
    map.on("dragstart", beginInteraction);
    map.on("dragend", endInteraction);
    map.on("zoomstart", wheelInteraction);
    map.on("zoomend", wheelInteraction);
    map.on("zoom", updateZoomState);

    const resizeObserver = new ResizeObserver(() => {
      if (!destroyed) map.resize();
    });
    resizeObserver.observe(mapCard);

    const loadTimeout = window.setTimeout(() => {
      if (destroyed || loaded || !status) return;
      status.textContent = "Map data is taking longer than expected to load.";
    }, 9000);

    const reportMapError = () => {
      if (destroyed || loaded || !status) return;
      status.textContent = "Geographic data could not be loaded. Check your connection and reopen About me.";
      mapCard.classList.add("has-map-error");
    };

    map.once("style.load", configureMap);
    map.on("error", reportMapError);
    map.once("load", () => {
      if (destroyed) return;
      loaded = true;
      window.clearTimeout(loadTimeout);
      mapCard.classList.add("is-map-ready");
      if (status) status.hidden = true;
      map.resize();
    });
    animationFrame = requestAnimationFrame(animateGlobe);

    return () => {
      destroyed = true;
      window.clearTimeout(loadTimeout);
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", beginInteraction);
      canvas.removeEventListener("wheel", wheelInteraction);
      canvas.removeEventListener("dblclick", wheelInteraction);
      window.removeEventListener("pointerup", endInteraction, true);
      window.removeEventListener("pointercancel", endInteraction, true);
      map.off("dragstart", beginInteraction);
      map.off("dragend", endInteraction);
      map.off("zoomstart", wheelInteraction);
      map.off("zoomend", wheelInteraction);
      map.off("zoom", updateZoomState);
      map.off("error", reportMapError);
      markerInstances.forEach((marker) => marker.remove());
      map.remove();
    };
  }

  function createAboutWindow() {
    const windowElement = document.createElement("article");
    windowElement.className = "window window--about is-opening";
    windowElement.setAttribute("role", "dialog");
    windowElement.setAttribute("aria-label", "About me");
    windowElement.innerHTML = `
      ${makeTitlebar("")}
      <div class="window-body">
        <div class="about-content">
          <h2>About me</h2>
          <section class="identity" aria-label="Profile details">
            <div class="identity-avatar" role="img" aria-label="Favour avatar"><span aria-hidden="true">👨🏾‍💻</span></div>
            <dl class="identity-data">
              <div><dt>NAME</dt><dd>Marcus Williams</dd></div>
              <div><dt>POSITION</dt><dd>Photographer</dd></div>
              <div><dt>MAIL</dt><dd><a href="mailto:hello@marcuswilliams.design">hello@marcuswilliams.design</a></dd></div>
            </dl>
          </section>
          <section class="bio-card">
            <p>I'm Marcus Williams, a Creative Director and Brand Designer based in Brooklyn.</p>
            <p>For the past 8 years, I've been crafting visual identities and brand systems for companies across fashion, tech, and culture. Currently leading creative at Wolff Olins, previously at Pentagram and IDEO.</p>
          </section>
          <section class="location-block">
            <h3>Location</h3>
            <div class="map-card" style="--map-accent:${MAP_ACCENT}; --map-accent-glow:${MAP_ACCENT_GLOW}; --map-accent-muted:${MAP_ACCENT_MUTED};">
              <div class="location-map" role="application" aria-label="Interactive globe centered on Lagos, Nigeria. Drag to rotate and scroll to zoom."></div>
              <p class="location-map-status" role="status">Loading geographic data…</p>
              <p class="location-map-instructions" aria-hidden="true">Drag to explore · Scroll to zoom</p>
            </div>
          </section>
        </div>
      </div>`;
    windowElement.initializeWindow = () => {
      windowElement.cleanupWindow = initializeLocationGlobe(windowElement.querySelector(".map-card"));
    };
    return windowElement;
  }

  function renderNote(windowElement, noteKey) {
    const note = notesData[noteKey];
    windowElement.querySelectorAll(".note-list-button").forEach((button) => {
      const selected = button.dataset.note === noteKey;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    const reader = windowElement.querySelector(".note-reader");
    reader.innerHTML = `
      <p class="note-date">${escapeHTML(note.date)}</p>
      <h2>${escapeHTML(note.title)}</h2>
      <div class="note-copy">${note.html}</div>`;
    reader.scrollTop = 0;
  }

  function createNotesWindow() {
    const windowElement = document.createElement("article");
    windowElement.className = "window window--notes is-opening";
    windowElement.setAttribute("role", "dialog");
    windowElement.setAttribute("aria-label", "Notes");
    windowElement.innerHTML = `
      ${makeTitlebar("Notes")}
      <div class="window-body">
        <div class="notes-shell">
          <aside class="notes-list" role="tablist" aria-label="Notes">
            <button class="note-list-button" type="button" role="tab" data-note="experience">
              <span class="note-list-title">Experience</span>
              <span class="note-list-preview"><time>22/01/2026</time> Creative...</span>
            </button>
            <button class="note-list-button is-selected" type="button" role="tab" data-note="about">
              <span class="note-list-title">About</span>
              <span class="note-list-preview"><time>22/01/2026</time> I'm Marcu...</span>
            </button>
          </aside>
          <section class="note-reader" aria-live="polite"></section>
        </div>
      </div>`;

    windowElement.querySelectorAll(".note-list-button").forEach((button) => {
      button.addEventListener("click", () => renderNote(windowElement, button.dataset.note));
    });
    renderNote(windowElement, "about");
    return windowElement;
  }

  ambientTunnel = createAmbientProjectTunnel(ambientTunnelRoot, ambientProjectImages);
  initializeDesktopEntry();
  initializeDesktopPointerResponse();
  initializeDockMagnification();
  restoreShortcutLayout();
  resetShortcutLayoutButton.addEventListener("click", resetShortcutLayout);
  showInteractionHintOnce();

  shortcuts.forEach((shortcut) => {
    makeShortcutDraggable(shortcut);
    shortcut.setAttribute("aria-grabbed", "false");
    shortcut.addEventListener("focus", () => showProjectHoverInfo(shortcut.dataset.project));
    shortcut.addEventListener("blur", () => hideProjectHoverInfo(shortcut.dataset.project));
    shortcut.addEventListener("click", (event) => {
      if (suppressShortcutClick.has(shortcut)) {
        event.preventDefault();
        suppressShortcutClick.delete(shortcut);
        return;
      }
      const projectKey = shortcut.dataset.project;
      const sourceElement = shortcut.querySelector(".shortcut-thumbnail");
      launchShortcut(shortcut, () => openProjectWindow(projectKey, { sourceElement }));
    });

    shortcut.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        shortcut.click();
        return;
      }

      const currentIndex = shortcuts.indexOf(shortcut);
      let nextIndex = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % shortcuts.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + shortcuts.length) % shortcuts.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = shortcuts.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      shortcuts[nextIndex].focus();
    });
  });

  document.querySelectorAll("[data-app]").forEach((button) => {
    button.addEventListener("click", () => {
      const sourceElement = button.querySelector(".dock-visual");
      if (button.dataset.app === "about") {
        dismissAboutUpdateBadge();
        openWindow("app:about", createAboutWindow, sourceElement);
      }
      if (button.dataset.app === "notes") openWindow("app:notes", createNotesWindow, sourceElement);
    });
  });

  document.querySelectorAll("[data-social]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeWindow) {
      event.preventDefault();
      closeWindow(activeWindow);
    }
  });

  window.addEventListener("hashchange", () => {
    const projectKey = projectKeyFromHash();
    if (projectKey) openProjectWindow(projectKey, { updateHash: false });
  });

  const initialProjectKey = projectKeyFromHash();
  if (initialProjectKey) {
    requestAnimationFrame(() => openProjectWindow(initialProjectKey, { updateHash: false }));
  }
})();
