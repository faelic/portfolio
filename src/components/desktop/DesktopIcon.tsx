import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { play } from "cuelume";
import type { Point, Project } from "../../types/portfolio";

interface Props {
  project: Project;
  position?: Point;
  onMove: (position: Point) => void;
  onMoveEnd?: (position: Point, origin: Point) => void;
  onOpen: () => void;
  onHover: (hovered: boolean) => void;
  lampOn: boolean;
  mobile?: boolean;
  arranging?: boolean;
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

export function DesktopIcon({ project, position, onMove, onMoveEnd, onOpen, onHover, lampOn, mobile = false, arranging = false, onArrangeStart }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragState | null>(null);
  const holdTimer = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [launching, setLaunching] = useState(false);

  const clearHoldTimer = () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  useEffect(() => clearHoldTimer, []);

  const updateLampInfluence = useCallback(() => {
    const icon = ref.current;
    const desktop = icon?.closest<HTMLElement>(".desktop");
    const source = desktop?.querySelector<HTMLElement>(".pendant-lamp__source-anchor");
    const thumbnail = icon?.querySelector<HTMLElement>(".shortcut-thumbnail");
    if (!icon || !desktop || !source || !thumbnail) return;

    const desktopRect = desktop.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const iconRect = thumbnail.getBoundingClientRect();
    const dx = iconRect.left + iconRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const dy = iconRect.top + iconRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
    const horizontal = dx / Math.max(desktopRect.width * 0.23, 1);
    const vertical = dy / Math.max(desktopRect.height * 0.42, 1);
    const influence = Math.min(1, Math.exp(-(horizontal * horizontal + vertical * vertical)) * 1.08);
    const activeInfluence = lampOn ? influence : 0;

    icon.style.setProperty("--lamp-influence", activeInfluence.toFixed(4));
    icon.style.setProperty("--lamp-brightness", (1 + activeInfluence * 0.12).toFixed(4));
    icon.style.setProperty("--lamp-contrast", (1 + activeInfluence * 0.025).toFixed(4));
    icon.style.setProperty("--lamp-reflection", (activeInfluence * 0.28).toFixed(4));
    icon.style.setProperty("--lamp-edge", (activeInfluence * 0.14).toFixed(4));
  }, [lampOn]);

  useEffect(() => {
    const desktop = ref.current?.closest<HTMLElement>(".desktop");
    if (!desktop) return;
    const observer = new ResizeObserver(updateLampInfluence);
    observer.observe(desktop);
    return () => observer.disconnect();
  }, [updateLampInfluence]);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(updateLampInfluence);
    return () => cancelAnimationFrame(frame);
  }, [position?.x, position?.y, mobile, updateLampInfluence]);

  const launch = () => {
    setLaunching(true);
    play("pulse", { volume: 0.72 });
    window.setTimeout(() => {
      onOpen();
      setLaunching(false);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 82);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !ref.current) return;
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
    if (!moved && !state.longPressed && !state.cancelled && !(mobile && arranging)) {
      launch();
    }
  };

  const pointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag.current) drag.current.cancelled = true;
    pointerEnd(event);
  };

  const keyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
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
      data-cuelume-hover="tick"
      aria-label={`Open ${project.title}`}
      style={position ? { left: `${position.x}%`, top: `${position.y}%` } : undefined}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={pointerEnd}
      onPointerCancel={pointerCancel}
      onKeyDown={keyDown}
      onPointerEnter={() => !mobile && !dragging && onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => !mobile && onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="shortcut-visual" aria-hidden="true">
        <img className="shortcut-thumbnail" src={project.icon} alt="" draggable={false} />
        <span className="shortcut-label">{project.desktopLabel}</span>
      </span>
    </button>
  );
}
