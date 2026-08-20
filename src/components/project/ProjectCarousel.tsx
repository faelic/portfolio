import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { play } from "cuelume";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import type { Project } from "../../types/portfolio";

export function ProjectCarousel({ project }: { project: Project }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  if (mobile) return <MobileProjectCarousel project={project} />;
  return <DesktopProjectCarousel project={project} />;
}

function MobileProjectCarousel({ project }: { project: Project }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);
  const swipeHandled = useRef(false);
  const count = project.images.length;

  useEffect(() => setActiveIndex(0), [project.key]);

  const move = (direction: -1 | 1) => {
    play("page", { volume: 0.68 });
    setActiveIndex((current) => (current + direction + count) % count);
  };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeHandled.current = false;
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    swipeHandled.current = true;
    move(dx < 0 ? 1 : -1);
    window.setTimeout(() => { swipeHandled.current = false; }, 0);
  };

  const signedDistance = (index: number) => {
    let distance = index - activeIndex;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    return distance;
  };

  return (
    <div className="project-carousel-mobile" role="region" aria-roledescription="carousel" aria-label={`${project.title} project previews`}>
      <div className="project-carousel-mobile-stage" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
        {project.images.map((item, index) => {
          const distance = signedDistance(index);
          const absoluteDistance = Math.abs(distance);
          const visible = absoluteDistance <= 3;
          const style = {
            "--mobile-card-x": `${distance * 19}%`,
            "--mobile-card-z": `${absoluteDistance * -62}px`,
            "--mobile-card-rotation": `${distance * -4}deg`,
            "--mobile-card-scale": Math.max(0.82, 1 - absoluteDistance * 0.055),
            "--mobile-card-opacity": Math.max(0, 1 - absoluteDistance * 0.24),
            zIndex: 10 - absoluteDistance,
          } as CSSProperties;
          const content = (
            <span className="project-carousel-mobile-media">
              <img className="project-carousel-mobile-backdrop" src={item.src} alt="" aria-hidden="true" draggable={false} />
              <img className="project-carousel-mobile-image" src={item.src} alt={index === activeIndex ? item.alt : ""} draggable={false} />
            </span>
          );
          return project.liveUrl ? (
            <a
              key={item.src}
              className={`project-carousel-mobile-card${index === activeIndex ? " is-active" : ""}`}
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              tabIndex={index === activeIndex ? 0 : -1}
              aria-hidden={index !== activeIndex}
              aria-label={`Open ${project.title} live project from preview ${index + 1}`}
              style={style}
              data-visible={visible ? "true" : "false"}
              onClick={(event) => { if (swipeHandled.current) event.preventDefault(); }}
            >{content}</a>
          ) : (
            <div key={item.src} className={`project-carousel-mobile-card${index === activeIndex ? " is-active" : ""}`} style={style} data-visible={visible ? "true" : "false"}>{content}</div>
          );
        })}
        <button className="project-carousel-mobile-arrow project-carousel-mobile-arrow--previous" type="button" data-cuelume-hover="tick" onClick={() => move(-1)} aria-label="Previous preview">‹</button>
        <button className="project-carousel-mobile-arrow project-carousel-mobile-arrow--next" type="button" data-cuelume-hover="tick" onClick={() => move(1)} aria-label="Next preview">›</button>
      </div>
      <div className="project-carousel-mobile-pagination" aria-label="Choose project preview">
        {project.images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            aria-label={`Show preview ${index + 1} of ${count}`}
            aria-current={index === activeIndex ? "true" : undefined}
            data-cuelume-hover="tick"
            onClick={() => { play("page", { volume: 0.58 }); setActiveIndex(index); }}
          />
        ))}
      </div>
      <p className="project-carousel-mobile-status" aria-live="polite">Preview {activeIndex + 1} of {count}</p>
    </div>
  );
}

function DesktopProjectCarousel({ project }: { project: Project }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const progress = useRef({ current: 0, target: 0, pointerX: null as number | null, frame: 0 });
  const cards = useMemo(() => Array.from({ length: Math.max(12, Math.ceil(12 / project.images.length) * project.images.length) }, (_, index) => project.images[index % project.images.length]), [project.images]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(".project-carousel-card"));
    let width = root.clientWidth;
    const state = progress.current;
    const wrap = (value: number, period: number) => ((value + period / 2) % period + period) % period - period / 2;
    const render = () => {
      const radius = width * 0.35;
      elements.forEach((card, index) => {
        const distance = wrap(index - state.current, cards.length);
        const absolute = Math.abs(distance);
        const direction = Math.sign(distance);
        const x = direction * radius * (1 - Math.exp(-0.76 * absolute));
        const scale = 0.28 + 0.72 * Math.exp(-0.45 * absolute);
        const rotation = direction * 62 * (1 - Math.exp(-1.85 * absolute));
        card.style.zIndex = `${1000 - Math.round(absolute * 100)}`;
        card.style.opacity = `${Math.max(0.12, Math.exp(-0.04 * absolute * absolute))}`;
        card.style.transform = `translate3d(calc(-50% + ${x}px),calc(-50% + ${Math.min(absolute, 5) * width * 0.0025}px),${-width * 0.038 * Math.min(absolute, 5.5)}px) rotateY(${rotation}deg) scale(${scale})`;
      });
    };
    const animate = () => {
      state.current += (state.target - state.current) * 0.16;
      render();
      if (Math.abs(state.target - state.current) > 0.0005) state.frame = requestAnimationFrame(animate);
      else state.frame = 0;
    };
    const request = () => { if (!state.frame) state.frame = requestAnimationFrame(animate); };
    const move = (event: PointerEvent) => {
      if (state.pointerX === null) { state.pointerX = event.clientX; return; }
      state.target += (event.clientX - state.pointerX) / Math.max(180, width * 0.14);
      state.pointerX = event.clientX;
      request();
    };
    const leave = () => { state.pointerX = null; };
    const keys = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      state.target += event.key === "ArrowRight" ? 0.7 : -0.7;
      request();
    };
    const observer = new ResizeObserver(() => {
      width = root.clientWidth;
      const cardWidth = Math.min(560, Math.max(180, width * 0.29));
      root.style.setProperty("--carousel-card-width", `${cardWidth}px`);
      root.style.setProperty("--carousel-height", `${cardWidth / 1.5 + Math.min(72, Math.max(36, width * 0.045))}px`);
      render();
    });
    observer.observe(root);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("keydown", keys);
    render();
    return () => { observer.disconnect(); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave); root.removeEventListener("keydown", keys); cancelAnimationFrame(state.frame); };
  }, [cards.length]);

  return (
    <div ref={rootRef} className="project-carousel" tabIndex={0} role="region" aria-roledescription="carousel" aria-label={`${project.title} project previews`}>
      <div className="project-carousel-stage">
        {cards.map((item, index) => {
          const content = <img className="project-carousel-image" src={item.src} alt={index < project.images.length ? item.alt : ""} draggable={false} />;
          return project.liveUrl ? (
            <a key={index} className="project-carousel-card" href={project.liveUrl} target="_blank" rel="noreferrer" tabIndex={index < project.images.length ? 0 : -1} aria-hidden={index >= project.images.length}>{content}</a>
          ) : <div key={index} className="project-carousel-card" aria-hidden={index >= project.images.length}>{content}</div>;
        })}
      </div>
    </div>
  );
}
