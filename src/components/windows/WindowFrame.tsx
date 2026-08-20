import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { Point, PortfolioWindow } from "../../types/portfolio";

interface Props {
  window: PortfolioWindow;
  title: string;
  icon?: string;
  kind: "project" | "about" | "notes";
  active: boolean;
  accent?: string;
  mobile?: boolean;
  children: ReactNode;
  onClose: () => void;
  onFocus: () => void;
  onMove: (position: Point) => void;
  onToggleExpanded: () => void;
}

export function WindowFrame({ window: model, title, icon, kind, active, accent, mobile = false, children, onClose, onFocus, onMove, onToggleExpanded }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; left: number; top: number } | undefined>(undefined);
  const [closing, setClosing] = useState(false);
  const style = {
    zIndex: model.zIndex,
    ...(model.position && !model.expanded ? { left: model.position.x, top: model.position.y } : {}),
    ...(accent ? { "--project-accent": accent } : {}),
  } as React.CSSProperties;

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mobile || model.expanded || (event.target as HTMLElement).closest(".traffic-lights") || !rootRef.current) return;
    onFocus();
    const rect = rootRef.current.getBoundingClientRect();
    const desktop = rootRef.current.closest<HTMLElement>(".desktop")?.getBoundingClientRect();
    if (!desktop) return;
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left - desktop.left, top: rect.top - desktop.top };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const drag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.id !== event.pointerId || !rootRef.current) return;
    const desktop = rootRef.current.closest<HTMLElement>(".desktop")?.getBoundingClientRect();
    if (!desktop) return;
    const minimumVisible = 120;
    const left = Math.min(desktop.width - minimumVisible, Math.max(-(rootRef.current.offsetWidth - minimumVisible), dragRef.current.left + event.clientX - dragRef.current.x));
    const top = Math.min(desktop.height - 60, Math.max(0, dragRef.current.top + event.clientY - dragRef.current.y));
    onMove({ x: left, y: top });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.id !== event.pointerId) return;
    dragRef.current = undefined;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const closeWithMotion = () => {
    setClosing(true);
    window.setTimeout(onClose, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
  };

  return (
    <article
      ref={rootRef}
      className={`window window--${kind} react-window-enter${active ? " is-active" : ""}${model.expanded ? " is-expanded" : ""}${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-label={title || "About me"}
      style={style}
      onPointerDown={onFocus}
    >
      <div className="titlebar" onPointerDown={beginDrag} onPointerMove={drag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <div className="traffic-lights" aria-label="Window controls">
          <button className="traffic-light traffic-light--close" type="button" aria-label="Close window" data-cuelume-hover="tick" data-cuelume-release="droplet" onPointerDown={(event) => event.stopPropagation()} onClick={closeWithMotion} />
          <span className="traffic-light traffic-light--minimize" aria-hidden="true" />
          <button className="traffic-light traffic-light--zoom" type="button" aria-label={model.expanded ? "Restore window" : "Expand window"} aria-pressed={model.expanded} data-cuelume-hover="tick" data-cuelume-toggle="toggle" onPointerDown={(event) => event.stopPropagation()} onClick={onToggleExpanded} />
        </div>
        <span className="window-title">
          {icon && <img className="window-title-icon" src={icon} alt="" />}
          <span>{title}</span>
        </span>
      </div>
      {children}
    </article>
  );
}
