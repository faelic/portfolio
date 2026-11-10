import { ResilientImage } from "../shared/ResilientImage";
import { clampIcon } from "../../state/layout";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { play } from "cuelume";
import type { Point, Project } from "../../types/portfolio";

interface Props {
  project: Project;
  position?: Point;
  onMove: (position: Point) => void;
  onMoveEnd?: (position: Point, origin: Point) => void;
  onOpen: (opener: HTMLButtonElement | null) => void;
  onHover: (hovered: boolean) => void;
  lampOn: boolean;
  mobile?: boolean;
  arranging?: boolean;
  selected?: boolean;
  onSelect: () => void;
  onArrangeStart?: () => void;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  left: number;
  top: number;
  origin: Point;
  latest: Point;
  moved: boolean;
  enabled: boolean;
  longPressed: boolean;
  cancelled: boolean;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function DesktopIcon({ project, position, onMove, onMoveEnd, onOpen, onHover, lampOn, mobile = false, arranging = false, selected = false, onSelect, onArrangeStart }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragState | null>(null);
  const holdTimer = useRef<number | null>(null);
  const lightingFrame = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [launching, setLaunching] = useState(false);

  const clearHoldTimer = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  useEffect(() => clearHoldTimer, []);

  const resetLampInfluence = useCallback(() => {
    const icon = ref.current;
    if (!icon) return;
    icon.style.setProperty("--lamp-influence", "0");
    icon.style.setProperty("--lamp-direct", "0");
    icon.style.setProperty("--lamp-ambient", "0");
    icon.style.setProperty("--lamp-brightness", "1");
    icon.style.setProperty("--lamp-contrast", "1");
    icon.style.setProperty("--lamp-reflection", "0");
    icon.style.setProperty("--lamp-highlight-opacity", "0");
    icon.style.setProperty("--lamp-edge", "0");
    icon.style.setProperty("--lamp-shadow-x", "0px");
    icon.style.setProperty("--lamp-shadow-y", "0px");
    icon.style.setProperty("--lamp-shadow-blur", "0px");
    icon.style.setProperty("--lamp-shadow-alpha", "0");
    icon.style.setProperty("--lamp-highlight-x", "50%");
    icon.style.setProperty("--lamp-highlight-y", "18%");
  }, []);

  const updateLampInfluence = useCallback(() => {
    const icon = ref.current;
    const desktop = icon?.closest<HTMLElement>(".desktop");
    const source = desktop?.querySelector<HTMLElement>(".pendant-lamp__source-anchor");
    const thumbnail = icon?.querySelector<HTMLElement>(".shortcut-thumbnail");
    if (!icon || !desktop || !source || !thumbnail) return;
    if (!lampOn) {
      resetLampInfluence();
      return;
    }

    const desktopRect = desktop.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const iconRect = thumbnail.getBoundingClientRect();
    const iconCenterX = iconRect.left + iconRect.width / 2;
    const iconCenterY = iconRect.top + iconRect.height / 2;
    const lightX = sourceRect.left + sourceRect.width / 2;
    const lightY = sourceRect.bottom;
    const dx = iconCenterX - lightX;
    const dy = iconCenterY - lightY;

    if (dy <= 0) {
      resetLampInfluence();
      return;
    }

    const verticalDistance = dy / Math.max(desktopRect.height, 1);
    const beamRadius = desktopRect.width * 0.035 + iconRect.width * 0.55 + dy * 0.42;
    const directAlignment = smoothstep(1 - Math.abs(dx) / Math.max(beamRadius, 1));
    const directFalloff = 1 / (1 + verticalDistance * 1.45);
    const direct = clamp(directAlignment * directFalloff * 1.16);

    const ambientRadius = desktopRect.width * 0.35 + dy * 0.4;
    const ambientAlignment = Math.exp(-Math.pow(dx / Math.max(ambientRadius, 1), 2));
    const ambientFalloff = 1 / (1 + Math.pow(verticalDistance, 1.35) * 4.4);
    const ambient = clamp(ambientAlignment * ambientFalloff * 0.55);
    const influence = clamp(direct * 0.9 + ambient * 0.75);

    const highlightX = clamp(50 - (dx / Math.max(iconRect.width, 1)) * 18, 18, 82);
    const highlightY = clamp(15 + verticalDistance * 16, 10, 32);
    const shadowDirectionX = clamp(dx / Math.max(desktopRect.width * 0.32, 1), -1, 1);
    const shadowX = shadowDirectionX * (2.6 + direct * 4.4 + ambient * 1.5);
    const shadowY = 2 + direct * 5.6 + ambient * 3;
    const shadowBlur = 5 + direct * 16 + ambient * 14;
    const shadowAlpha = direct * 0.18 + ambient * 0.09;

    icon.style.setProperty("--lamp-influence", influence.toFixed(4));
    icon.style.setProperty("--lamp-direct", direct.toFixed(4));
    icon.style.setProperty("--lamp-ambient", ambient.toFixed(4));
    icon.style.setProperty("--lamp-brightness", (1 + influence * 0.1).toFixed(4));
    icon.style.setProperty("--lamp-contrast", (1 + influence * 0.02).toFixed(4));
    icon.style.setProperty("--lamp-reflection", (direct * 0.22 + ambient * 0.16).toFixed(4));
    icon.style.setProperty("--lamp-highlight-opacity", (direct * 0.3 + ambient * 0.08).toFixed(4));
    icon.style.setProperty("--lamp-edge", (direct * 0.14 + ambient * 0.04).toFixed(4));
    icon.style.setProperty("--lamp-shadow-x", `${shadowX.toFixed(2)}px`);
    icon.style.setProperty("--lamp-shadow-y", `${shadowY.toFixed(2)}px`);
    icon.style.setProperty("--lamp-shadow-blur", `${shadowBlur.toFixed(2)}px`);
    icon.style.setProperty("--lamp-shadow-alpha", shadowAlpha.toFixed(4));
    icon.style.setProperty("--lamp-highlight-x", `${highlightX.toFixed(2)}%`);
    icon.style.setProperty("--lamp-highlight-y", `${highlightY.toFixed(2)}%`);
  }, [lampOn, resetLampInfluence]);

  const scheduleLampInfluence = useCallback(() => {
    if (lightingFrame.current !== null) return;
    lightingFrame.current = requestAnimationFrame(() => {
      lightingFrame.current = null;
      updateLampInfluence();
    });
  }, [updateLampInfluence]);

  useEffect(() => {
    const desktop = ref.current?.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const source = desktop.querySelector<HTMLElement>(".pendant-lamp__source-anchor");
    const observer = new ResizeObserver(scheduleLampInfluence);
    observer.observe(desktop);
    if (source) observer.observe(source);
    return () => observer.disconnect();
  }, [scheduleLampInfluence]);

  useEffect(() => {
    return () => {
      if (lightingFrame.current !== null) cancelAnimationFrame(lightingFrame.current);
    };
  }, []);

  useLayoutEffect(() => {
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(updateLampInfluence);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [position?.x, position?.y, mobile, updateLampInfluence]);

  useLayoutEffect(() => {
    const icon = ref.current;
    const desktop = icon?.closest<HTMLElement>(".desktop");
    if (!icon || !desktop || mobile || !position) return;
    const clampPosition = () => {
      const next = clampIcon(position, desktop.clientWidth, desktop.clientHeight, icon.offsetWidth, icon.offsetHeight);
      if (Math.abs(next.x - position.x) > 0.01 || Math.abs(next.y - position.y) > 0.01) onMove(next);
    };
    clampPosition();
    const observer = new ResizeObserver(clampPosition);
    observer.observe(desktop);
    return () => observer.disconnect();
  }, [position, mobile, onMove]);

  const launch = () => {
    setLaunching(true);
    play("release", { volume: 1 });
    window.setTimeout(() => {
      onOpen(ref.current);
      setLaunching(false);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 82);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !ref.current) return;
    if (arranging) onSelect();
    const desktop = ref.current.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const desktopRect = desktop.getBoundingClientRect();
    const iconRect = ref.current.getBoundingClientRect();
    const origin = {
      x: (iconRect.left - desktopRect.left) / desktopRect.width * 100,
      y: (iconRect.top - desktopRect.top) / desktopRect.height * 100,
    };
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: iconRect.left - desktopRect.left,
      top: iconRect.top - desktopRect.top,
      origin,
      latest: origin,
      moved: false,
      enabled: !mobile || arranging,
      longPressed: false,
      cancelled: false,
    };
    ref.current.setPointerCapture(event.pointerId);
    if (mobile && !arranging) {
      holdTimer.current = window.setTimeout(() => {
        if (!drag.current || drag.current.cancelled) return;
        drag.current.enabled = true;
        drag.current.longPressed = true;
        setDragging(true);
        onHover(false);
        onArrangeStart?.();
      }, 380);
    }
  };

  const pointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId || !ref.current) return;
    const desktop = ref.current.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const dx = event.clientX - drag.current.startX;
    const dy = event.clientY - drag.current.startY;
    if (!drag.current.enabled) {
      if (Math.hypot(dx, dy) > 10) {
        drag.current.cancelled = true;
        clearHoldTimer();
      }
      return;
    }
    if (!drag.current.moved && Math.hypot(dx, dy) < 6) return;
    drag.current.moved = true;
    setDragging(true);
    onHover(false);
    const desktopRect = desktop.getBoundingClientRect();
    const left = Math.min(desktopRect.width - ref.current.offsetWidth, Math.max(0, drag.current.left + dx));
    const top = Math.min(desktopRect.height - ref.current.offsetHeight, Math.max(0, drag.current.top + dy));
    const next = { x: left / desktopRect.width * 100, y: top / desktopRect.height * 100 };
    drag.current.latest = next;
    onMove(next);
    scheduleLampInfluence();
  };

  const pointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    clearHoldTimer();
    const state = drag.current;
    const moved = state.moved;
    drag.current = null;
    setDragging(false);
    if (ref.current?.hasPointerCapture(event.pointerId)) ref.current.releasePointerCapture(event.pointerId);
    if (moved) onMoveEnd?.(state.latest, state.origin);
    if (!moved && !state.longPressed && !state.cancelled) {
      if (arranging) onSelect(); else launch();
    }
  };

  const pointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag.current) drag.current.cancelled = true;
    pointerEnd(event);
  };

  const keyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (arranging) return;
    if ((event.key !== "Enter" && event.key !== " ") || event.repeat || dragging || (mobile && arranging)) return;
    event.preventDefault();
    launch();
  };

  return (
    <button
      ref={ref}
      className={`shortcut shortcut--${project.key}${dragging ? " is-dragging" : ""}${launching ? " is-launching" : ""}`}
      type="button"
      data-project={project.key}
      aria-label={`${arranging ? "Select" : "Open"} ${project.title}`}
      aria-pressed={arranging ? selected : undefined}
      aria-describedby={arranging ? "arrangement-instructions" : undefined}
      style={position ? { left: `${position.x}%`, top: `${position.y}%` } : undefined}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerCancel}
      onKeyDown={keyDown}
      onPointerEnter={() => !mobile && !dragging && onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => { if (arranging) onSelect(); else if (!mobile) onHover(true); }}
      onBlur={() => onHover(false)}
    >
      <span className="shortcut-visual" data-cuelume-hover="tick" aria-hidden="true">
        <ResilientImage className="shortcut-thumbnail" src={project.icon} alt="" icon fallbackLabel={`${project.title} icon`} draggable={false} />
        <span className="shortcut-label">{project.desktopLabel}</span>
      </span>
    </button>
  );
}
