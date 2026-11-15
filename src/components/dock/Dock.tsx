import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { AppKey } from "../../types/portfolio";
import { PortraitAvatar } from "../shared/PortraitAvatar";

interface Props {
  onPrepareAssistant?: () => void;
  projectFocused: boolean;
  onOpenApp: (app: AppKey, opener?: HTMLElement) => void;
  openApps: AppKey[];
}


interface DockMotionItem {
  hit: HTMLElement;
  visual: HTMLElement;
  currentScale: number;
  targetScale: number;
  currentX: number;
  targetX: number;
}

function GitHubIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="#f6f6f4"/><path d="M32 11.5c-11.5 0-20.8 9.3-20.8 20.8 0 9.2 6 17 14.3 19.7 1 .2 1.4-.4 1.4-1v-3.6c-5.8 1.3-7-2.5-7-2.5-.9-2.4-2.3-3-2.3-3-1.9-1.3.1-1.3.1-1.3 2.1.1 3.2 2.2 3.2 2.2 1.9 3.2 4.9 2.3 6.1 1.8.2-1.4.7-2.3 1.3-2.8-4.6-.5-9.5-2.3-9.5-10.3 0-2.3.8-4.1 2.2-5.6-.2-.5-.9-2.7.2-5.5 0 0 1.8-.6 5.8 2.1 1.7-.5 3.4-.7 5.2-.7s3.6.2 5.2.7c4-2.7 5.8-2.1 5.8-2.1 1.1 2.8.4 5 .2 5.5 1.4 1.5 2.2 3.4 2.2 5.6 0 8-4.9 9.8-9.5 10.3.8.7 1.5 2 1.5 4v5.9c0 .6.4 1.2 1.4 1 8.3-2.8 14.3-10.5 14.3-19.7 0-11.5-9.3-20.8-20.8-20.8Z" fill="#171717"/></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="#050505"/><path d="M14 13h10.4l9.5 12.8L44.7 13H50L36.4 29.8 51 51H40.6L30 36.8 18.5 51H13l14.4-18.2L14 13Zm8.2 4.2 20.6 29.6h3L25.2 17.2h-3Z" fill="#fff"/></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="#0a66c2"/><circle cx="18" cy="19" r="4.5" fill="#fff"/><path d="M14 27h8v24h-8V27Zm14 0h7.7v3.3h.1c2.1-3.1 5.2-4.4 8.9-4.4 8.2 0 10.3 5.3 10.3 13V51h-8V40c0-4.6-.7-7.8-5.2-7.8-5 0-5.8 3.8-5.8 7.5V51h-8V27Z" fill="#fff"/></svg>;
}

function AssistantIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="var(--assistant-accent)"/><path d="M18 20h28v21H30l-10 7v-7h-2V20Z" fill="none" stroke="var(--assistant-accent-ink)" strokeWidth="3" strokeLinejoin="round"/><path d="M25 28h14m-14 6h9" fill="none" stroke="var(--assistant-accent-ink)" strokeWidth="3" strokeLinecap="round"/></svg>;
}

export function Dock({ projectFocused, onOpenApp, openApps, onPrepareAssistant }: Props) {
  const dockRef = useRef<HTMLElement>(null);
  const assistantButton = useRef<HTMLButtonElement>(null);
  const motionItems = useRef<DockMotionItem[]>([]);
  const animationFrame = useRef<number | null>(null);
  const previousFrameTime = useRef(0);
  const reducedMotion = useRef(false);
  const [tooltip, setTooltip] = useState<string>();

  const syncMotionItems = useCallback(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const previous = new Map(motionItems.current.map((item) => [item.hit, item]));
    motionItems.current = Array.from(dock.querySelectorAll<HTMLElement>(".dock-hit")).map((hit) => {
      const existing = previous.get(hit);
      return existing ?? {
        hit,
        visual: hit.querySelector<HTMLElement>(".dock-visual")!,
        currentScale: 1,
        targetScale: 1,
        currentX: 0,
        targetX: 0,
      };
    });
  }, []);

  const setMagnificationTargets = useCallback((pointerX: number | null) => {
    const dock = dockRef.current;
    const items = motionItems.current;
    if (!dock || items.length === 0) return;

    const dockRect = dock.getBoundingClientRect();
    const baseSize = items[0]?.hit.offsetWidth || 48;
    const maximumScale = reducedMotion.current ? 1 : 1.2;
    const sigma = baseSize * 1.68;
    const influences = items.map((item) => {
      if (pointerX === null) return 0;
      const center = dockRect.left + item.hit.offsetLeft + item.hit.offsetWidth / 2;
      const normalizedDistance = (pointerX - center) / sigma;
      return Math.exp(-(normalizedDistance * normalizedDistance));
    });
    const expansions = influences.map((influence) => baseSize * influence * (maximumScale - 1));
    const totalExpansion = expansions.reduce((sum, expansion) => sum + expansion, 0);
    let precedingExpansion = 0;

    items.forEach((item, index) => {
      const followingExpansion = totalExpansion - precedingExpansion - expansions[index];
      item.targetScale = 1 + influences[index] * (maximumScale - 1);
      item.targetX = (precedingExpansion - followingExpansion) * (reducedMotion.current ? 0.16 : 0.5);
      precedingExpansion += expansions[index];
    });
  }, []);

  const animateMagnification = useCallback((time: number) => {
    const dt = previousFrameTime.current ? Math.min((time - previousFrameTime.current) / 1000, 0.064) : 1 / 60;
    previousFrameTime.current = time;
    const alpha = 1 - Math.exp(-(reducedMotion.current ? 28 : 18) * dt);
    let unsettled = false;

    motionItems.current.forEach((item) => {
      item.currentScale += (item.targetScale - item.currentScale) * alpha;
      item.currentX += (item.targetX - item.currentX) * alpha;
      if (Math.abs(item.targetScale - item.currentScale) > 0.001 || Math.abs(item.targetX - item.currentX) > 0.05) unsettled = true;
      item.hit.style.transform = `translate3d(${item.currentX.toFixed(2)}px, 0, 0)`;
      item.visual.style.transform = `scale(${item.currentScale.toFixed(4)})`;
      item.hit.style.setProperty("--dock-tooltip-lift", `${Math.max(0, (item.currentScale - 1) * item.hit.offsetHeight).toFixed(1)}px`);
    });

    if (unsettled) {
      animationFrame.current = requestAnimationFrame(animateMagnification);
    } else {
      animationFrame.current = null;
      previousFrameTime.current = 0;
    }
  }, []);

  const startMagnificationAnimation = useCallback(() => {
    if (animationFrame.current === null) animationFrame.current = requestAnimationFrame(animateMagnification);
  }, [animateMagnification]);

  const magnify = (event: ReactPointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest(".assistant-invitation")) return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const dock = dockRef.current;
    if (!dock) return;
    dock.classList.add("is-magnifying");
    if (motionItems.current.length === 0) syncMotionItems();
    setMagnificationTargets(event.clientX);
    startMagnificationAnimation();
  };

  const resetMagnification = () => {
    dockRef.current?.classList.remove("is-magnifying");
    setMagnificationTargets(null);
    startMagnificationAnimation();
    setTooltip(undefined);
  };

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => { reducedMotion.current = media.matches; };
    const observer = new ResizeObserver(() => {
      syncMotionItems();
      setMagnificationTargets(null);
      startMagnificationAnimation();
    });
    updateMotionPreference();
    syncMotionItems();
    observer.observe(dock);
    media.addEventListener("change", updateMotionPreference);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotionPreference);
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
      motionItems.current.forEach((item) => {
        item.hit.style.transform = "";
        item.visual.style.transform = "";
        item.hit.style.removeProperty("--dock-tooltip-lift");
      });
    };
  }, [setMagnificationTargets, startMagnificationAnimation, syncMotionItems]);

  const openAbout = (event: React.MouseEvent<HTMLButtonElement>) => {
    onOpenApp("about", event.currentTarget);
  };

  const activateTooltip = (label: string) => setTooltip(label);
  const openAssistant = () => {
    resetMagnification();
    // The invitation retires on launch; restore focus to the permanent dock icon.
    onOpenApp("assistant", assistantButton.current ?? undefined);
  };
  const socialProps = (label: string, url: string) => ({
    href: url,
    target: url === "#" ? undefined : "_blank",
    rel: url === "#" ? undefined : "noreferrer",
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => { if (url === "#") event.preventDefault(); },
    onPointerEnter: () => activateTooltip(label),
    onFocus: () => activateTooltip(label),
    onBlur: () => setTooltip(undefined),
  });

  return (
    <nav ref={dockRef} className={`dock-hit-area${projectFocused ? " dock--project-focused" : ""}`} aria-label="Applications and social links" onPointerMove={magnify} onPointerLeave={resetMagnification}>
      <button className={`dock-hit dock-hit--avatar${openApps.includes("about") ? " is-running" : ""}${tooltip === "About me" ? " is-tooltip-active" : ""}`} type="button" aria-label="About me" aria-description={openApps.includes("about") ? "Window open" : undefined} onClick={openAbout} onPointerEnter={() => activateTooltip("About me")} onFocus={() => activateTooltip("About me")} onBlur={() => setTooltip(undefined)}>
        <span className="dock-visual"><span className="dock-artwork"><span className="dock-icon dock-icon--avatar" aria-hidden="true"><PortraitAvatar decorative /></span></span></span><span className="dock-tooltip">About me</span>
      </button>
      <button className={`dock-hit dock-hit--notes${openApps.includes("notes") ? " is-running" : ""}${tooltip === "Notes" ? " is-tooltip-active" : ""}`} type="button" aria-label="Notes" aria-description={openApps.includes("notes") ? "Window open" : undefined} onClick={event => onOpenApp("notes", event.currentTarget)} onPointerEnter={() => activateTooltip("Notes")} onFocus={() => activateTooltip("Notes")} onBlur={() => setTooltip(undefined)}>
        <span className="dock-visual"><span className="dock-artwork"><span className="dock-icon dock-icon--notes" aria-hidden="true" /></span></span><span className="dock-tooltip">Notes</span>
      </button>
      <button ref={assistantButton} className={`dock-hit dock-hit--assistant${openApps.includes("assistant") ? " is-running" : ""}${tooltip === "Assistant" ? " is-tooltip-active" : ""}`} type="button" aria-label="Assistant" aria-description={openApps.includes("assistant") ? "Window open" : undefined} onClick={openAssistant} onPointerEnter={() => { activateTooltip("Assistant"); onPrepareAssistant?.(); }} onFocus={() => { activateTooltip("Assistant"); onPrepareAssistant?.(); }} onBlur={() => setTooltip(undefined)}>
        <span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><AssistantIcon /></span></span></span><span className="dock-tooltip">Assistant</span>
      </button>
      <span className="dock-divider" aria-hidden="true" />
      <a className={`dock-hit dock-hit--github${tooltip === "GitHub" ? " is-tooltip-active" : ""}`} aria-label="GitHub" {...socialProps("GitHub", "https://github.com/faelic")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><GitHubIcon /></span></span></span><span className="dock-tooltip">GitHub</span></a>
      <a className={`dock-hit dock-hit--x${tooltip === "X" ? " is-tooltip-active" : ""}`} aria-label="X" {...socialProps("X", "https://x.com/FavDeFi")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><XIcon /></span></span></span><span className="dock-tooltip">X</span></a>
      <a className={`dock-hit dock-hit--linkedin${tooltip === "LinkedIn" ? " is-tooltip-active" : ""}`} aria-label="LinkedIn" {...socialProps("LinkedIn", "https://www.linkedin.com/in/favour-ututu/")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><LinkedInIcon /></span></span></span><span className="dock-tooltip">LinkedIn</span></a>
    </nav>
  );
}
