import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { AppKey } from "../../types/portfolio";
import { storage } from "../../utils/storage";

interface Props {
  projectFocused: boolean;
  onOpenApp: (app: AppKey) => void;
}

const ABOUT_BADGE_KEY = "favour.about-update-seen.v2";

interface DockMotionItem {
  hit: HTMLElement;
  visual: HTMLElement;
  currentScale: number;
  targetScale: number;
  currentX: number;
  targetX: number;
}

function InstagramIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><defs><radialGradient id="instagram-glow" cx="30%" cy="96%" r="92%"><stop offset="0" stopColor="#ffd600"/><stop offset=".48" stopColor="#ff165d"/><stop offset="1" stopColor="#9a13e8"/></radialGradient></defs><rect width="64" height="64" rx="14" fill="url(#instagram-glow)"/><rect x="15" y="15" width="34" height="34" rx="11" fill="none" stroke="#fff" strokeWidth="4.5"/><circle cx="32" cy="32" r="8.5" fill="none" stroke="#fff" strokeWidth="4.5"/><circle cx="44" cy="20" r="3" fill="#fff"/></svg>;
}

function XIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="#050505"/><path d="M14 13h10.4l9.5 12.8L44.7 13H50L36.4 29.8 51 51H40.6L30 36.8 18.5 51H13l14.4-18.2L14 13Zm8.2 4.2 20.6 29.6h3L25.2 17.2h-3Z" fill="#fff"/></svg>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 64 64" focusable="false"><rect width="64" height="64" rx="14" fill="#0a66c2"/><circle cx="18" cy="19" r="4.5" fill="#fff"/><path d="M14 27h8v24h-8V27Zm14 0h7.7v3.3h.1c2.1-3.1 5.2-4.4 8.9-4.4 8.2 0 10.3 5.3 10.3 13V51h-8V40c0-4.6-.7-7.8-5.2-7.8-5 0-5.8 3.8-5.8 7.5V51h-8V27Z" fill="#fff"/></svg>;
}

export function Dock({ projectFocused, onOpenApp }: Props) {
  const dockRef = useRef<HTMLElement>(null);
  const motionItems = useRef<DockMotionItem[]>([]);
  const animationFrame = useRef<number | null>(null);
  const previousFrameTime = useRef(0);
  const reducedMotion = useRef(false);
  const [tooltip, setTooltip] = useState<string>();
  const [badge, setBadge] = useState(() => !storage.read(ABOUT_BADGE_KEY, false));

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
    const maximumScale = reducedMotion.current ? 1.12 : 1.84;
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

  const openAbout = () => {
    setBadge(false);
    storage.write(ABOUT_BADGE_KEY, true);
    onOpenApp("about");
  };

  const activateTooltip = (label: string) => setTooltip(label);
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
      <button className={`dock-hit dock-hit--avatar${tooltip === "About me" ? " is-tooltip-active" : ""}`} type="button" aria-label="About me" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release" onClick={openAbout} onPointerEnter={() => activateTooltip("About me")} onFocus={() => activateTooltip("About me")} onBlur={() => setTooltip(undefined)}>
        <span className="dock-visual"><span className="dock-artwork"><span className="dock-icon dock-icon--avatar" aria-hidden="true">🧔🏾</span></span>{badge && <span className="dock-badge" aria-hidden="true">1</span>}</span><span className="dock-tooltip">About me</span>
      </button>
      <button className={`dock-hit dock-hit--notes${tooltip === "Notes" ? " is-tooltip-active" : ""}`} type="button" aria-label="Notes" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release" onClick={() => onOpenApp("notes")} onPointerEnter={() => activateTooltip("Notes")} onFocus={() => activateTooltip("Notes")} onBlur={() => setTooltip(undefined)}>
        <span className="dock-visual"><span className="dock-artwork"><span className="dock-icon dock-icon--notes" aria-hidden="true" /></span></span><span className="dock-tooltip">Notes</span>
      </button>
      <span className="dock-divider" aria-hidden="true" />
      <a className={`dock-hit dock-hit--instagram${tooltip === "Instagram" ? " is-tooltip-active" : ""}`} aria-label="Instagram" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release" {...socialProps("Instagram", "#")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><InstagramIcon /></span></span></span><span className="dock-tooltip">Instagram</span></a>
      <a className={`dock-hit dock-hit--x${tooltip === "X" ? " is-tooltip-active" : ""}`} aria-label="X" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release" {...socialProps("X", "#")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><XIcon /></span></span></span><span className="dock-tooltip">X</span></a>
      <a className={`dock-hit dock-hit--linkedin${tooltip === "LinkedIn" ? " is-tooltip-active" : ""}`} aria-label="LinkedIn" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release" {...socialProps("LinkedIn", "#")}><span className="dock-visual"><span className="dock-artwork"><span className="dock-icon" aria-hidden="true"><LinkedInIcon /></span></span></span><span className="dock-tooltip">LinkedIn</span></a>
    </nav>
  );
}
