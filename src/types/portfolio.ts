export type ProjectKey = "champ" | "silences" | "revolte" | "lisiere" | "elan" | "eau";
export type AppKey = "about" | "notes" | "assistant";
export type WindowKey = `project:${ProjectKey}` | AppKey;

export interface ProjectImage {
  src: string;
  alt: string;
  treatment: "interface" | "interface-policy";
  action: string;
  caption: string;
}

export type CapabilityVisualKey =
  | "ledger"
  | "sessions"
  | "operations"
  | "split"
  | "chain-sync"
  | "guardrails"
  | "chain-data"
  | "navigation"
  | "learning"
  | "approval-scan"
  | "risk-review"
  | "revoke"
  | "roles"
  | "lifecycle"
  | "wallet-sync"
  | "frontend-system"
  | "information"
  | "collaboration";

export interface ProjectCapability {
  id: string;
  title: string;
  description: string;
  proof: string;
  visual: CapabilityVisualKey;
}

export interface Project {
  key: ProjectKey;
  title: string;
  slug: string;
  desktopLabel: string;
  icon: string;
  accent: string;
  githubAccent?: string;
  desktopSummary: string;
  desktopStack: string;
  techStack: string[];
  featuredImageIndex?: number;
  description: string;
  windowStory: {
    learnedTitle?: string;
    learned: string;
    howItWorks: string;
  };
  thesis: {
    number: string;
    title: string;
    body: string;
    rotation: number;
  };
  primaryActionLabel?: string;
  sourceActionLabel?: string;
  liveUrl?: string;
  repoUrl?: string;
  previewNote?: string;
  capabilities: ProjectCapability[];
  artifact?: {
    eyebrow: string;
    title: string;
    body: string;
    steps: string[];
  };
  meta: Array<[string, string]>;
  images: ProjectImage[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Bounds extends Point {
  width: number;
  height: number;
}

export interface PortfolioWindow {
  instanceKey?: WindowKey;
  key: WindowKey;
  projectKey?: ProjectKey;
  zIndex: number;
  position?: Point;
  expanded: boolean;
}
