import { ResilientImage } from "../shared/ResilientImage";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { Point, Project } from "../../types/portfolio";

interface Props {
  project: Project;
  dragEnabled?: boolean;
  position?: Point;
  onMove: (position: Point) => void;
  onMoveEnd?: (position: Point, origin: Point) => void;
  onOpen: (opener: HTMLButtonElement | null) => void;
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

export function DesktopIcon({ project, position, onMove, onMoveEnd, onOpen, dragEnabled = true, mobile = false, arranging = false, selected = false, onSelect, onArrangeStart }: Props) {
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

  const launch = () => {
    setLaunching(true);
    window.setTimeout(() => {
      onOpen(ref.current);
      setLaunching(false);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 82);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || !ref.current) return;
    if (arranging) onSelect();
    const desktop = ref.current.closest<HTMLElement>(".desktop-shortcuts");
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
      enabled: dragEnabled && (!mobile || arranging),
      longPressed: false,
      cancelled: false,
    };
    ref.current.setPointerCapture(event.pointerId);
    if (mobile && !arranging) {
      holdTimer.current = window.setTimeout(() => {
        if (!drag.current || drag.current.cancelled) return;
        drag.current.enabled = dragEnabled;
        drag.current.longPressed = true;
        setDragging(dragEnabled);
        onArrangeStart?.();
      }, 380);
    }
  };

  const pointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId || !ref.current) return;
    const desktop = ref.current.closest<HTMLElement>(".desktop-shortcuts");
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
    if (moved || state.cancelled) onMoveEnd?.(state.cancelled ? state.origin : state.latest, state.origin);
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
      onClick={event => {
        // Native assistive-technology activation emits click without pointer/key events.
        // Pointer and keyboard paths above already handle their own launch.
        if (event.detail === 0 && !launching && !dragging) {
          if (arranging) onSelect(); else launch();
        }
      }}
      onFocus={() => { if (arranging) onSelect(); }}
    >
      <span className="shortcut-visual" aria-hidden="true">
        <ResilientImage className="shortcut-thumbnail" src={project.icon} alt="" icon fallbackLabel={`${project.title} icon`} draggable={false} />
        <span className="shortcut-label">{project.desktopLabel}</span>
      </span>
    </button>
  );
}
