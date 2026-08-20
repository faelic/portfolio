export type ProjectKey = "champ" | "silences" | "revolte" | "lisiere" | "elan" | "eau";
export type AppKey = "about" | "notes";
export type WindowKey = `project:${ProjectKey}` | AppKey;

export interface ProjectImage {
  src: string;
  alt: string;
  treatment: "interface" | "interface-policy";
  action: string;
}

export interface Project {
  key: ProjectKey;
  title: string;
  desktopLabel: string;
  icon: string;
  accent: string;
  desktopSummary: string;
  desktopStack: string;
  description: string;
  liveUrl?: string;
  repoUrl?: string;
  previewNote?: string;
  highlights: string[];
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
  key: WindowKey;
  projectKey?: ProjectKey;
  zIndex: number;
  position?: Point;
  expanded: boolean;
}
