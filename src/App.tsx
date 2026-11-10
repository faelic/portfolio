import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { BootPreloader } from "./components/effects/BootPreloader";
import { PendantLamp } from "./components/effects/PendantLamp";
import { DesktopIcon } from "./components/desktop/DesktopIcon";
import { Dock } from "./components/dock/Dock";
import { AboutWindow } from "./components/windows/AboutWindow";
import { NotesWindow } from "./components/windows/NotesWindow";
import { ProjectWindow } from "./components/windows/ProjectWindow";
import { WindowFrame } from "./components/windows/WindowFrame";
import { projectList, projects } from "./data/projects";
import { MOBILE_SHORTCUT_LAYOUT } from "./data/mobileLayout";
import { clampIcon } from "./state/layout";
import { useDesktopLayout } from "./hooks/useDesktopLayout";
import { useInterfaceSounds } from "./hooks/useInterfaceSounds";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useWindowManager } from "./hooks/useWindowManager";
import { session } from "./utils/storage";
import type { Point, ProjectKey } from "./types/portfolio";

const LAMP_STORAGE_KEY = "favour.pendant-lamp-on.v1";
export function App() {
  useInterfaceSounds();
  const mobile = useMediaQuery("(max-width: 767px)");
  const desktopLayout = useDesktopLayout(mobile ? "mobile" : "desktop");
  const [booting, setBooting] = useState(true);
  const manager = useWindowManager(!booting, desktopLayout.arranging);
  const [lampOn, setLampOn] = useState(() => session.flag(LAMP_STORAGE_KEY, true));
  const [entered, setEntered] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<ProjectKey>();
  const [hintVisible, setHintVisible] = useState(false);
  const [selected, setSelected] = useState<ProjectKey>("champ");
  const [announcement, setAnnouncement] = useState("");
  const arrangeButton = useRef<HTMLButtonElement>(null);
  const projectFocused = manager.activeWindow?.key.startsWith("project:") ?? false;
  const hasOpenWindow = manager.windows.length > 0;
  const backgroundInert = mobile && hasOpenWindow;
  const preloadAssets = useMemo(() => [
    "/assets/effects/pendant-lamp-fixture.png", "/assets/effects/pendant-lamp-fixture-off.png",
    ...projectList.flatMap(project => {
      const image = project.images[project.featuredImageIndex ?? 0]?.src;
      return image ? [project.icon, image] : [project.icon];
    }),
  ], []);
  useEffect(() => {
    if (booting || session.flag("favour.interaction-hint-seen.v2")) return;
    const show = window.setTimeout(() => { setHintVisible(true); session.writeFlag("favour.interaction-hint-seen.v2", true); }, 1500);
    const hide = window.setTimeout(() => setHintVisible(false), 6900);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [booting]);
  const revealDesktop = useCallback(() => { requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true))); }, []);
  const completeBoot = useCallback(() => setBooting(false), []);
  const hoverProject = hoveredProject ? projects[hoveredProject] : undefined;
  const toggleLamp = () => setLampOn(current => { session.writeFlag(LAMP_STORAGE_KEY, !current); return !current; });
  const beginArrangement = (key: ProjectKey = selected, focusIcon = false) => {
    setSelected(key);
    setHintVisible(false);
    desktopLayout.begin();
    setAnnouncement(`${projects[key].title} selected. Use arrow keys or direction buttons. Done saves; Cancel discards changes.`);
    if (focusIcon) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-project="${key}"]`)?.focus());
  };
  const finishArrangement = (save: boolean) => {
    if (save) desktopLayout.save(); else desktopLayout.cancel();
    setAnnouncement(save ? "Icon arrangement saved." : "Arrangement cancelled. Original positions restored.");
    requestAnimationFrame(() => arrangeButton.current?.focus());
  };
  const iconPosition = (key: ProjectKey): Point => {
    const icon = document.querySelector<HTMLElement>(`[data-project="${key}"]`)!;
    const desktop = icon.closest<HTMLElement>(".desktop")!;
    const rect = icon.getBoundingClientRect(); const bounds = desktop.getBoundingClientRect();
    return { x: (rect.left - bounds.left) / bounds.width * 100, y: (rect.top - bounds.top) / bounds.height * 100 };
  };
  const moveSelected = (dx: number, dy: number) => {
    const origin = mobile ? desktopLayout.layout[selected] ?? MOBILE_SHORTCUT_LAYOUT[selected] : iconPosition(selected);
    let next: Point;
    if (mobile) {
      const col = Math.round((origin.x - 4) / 32); const row = Math.round((origin.y - 27) / 27);
      const nextCol = Math.max(0, Math.min(2, col + dx)); const nextRow = Math.max(0, Math.min(1, row + dy));
      next = { x: 4 + nextCol * 32, y: 27 + nextRow * 27 };
    } else {
      const icon = document.querySelector<HTMLElement>(`[data-project="${selected}"]`)!;
      const desktop = icon.closest<HTMLElement>(".desktop")!;
      next = clampIcon({ x: origin.x + dx * 10 / desktop.clientWidth * 100, y: origin.y + dy * 10 / desktop.clientHeight * 100 }, desktop.clientWidth, desktop.clientHeight, icon.offsetWidth, icon.offsetHeight);
    }
    desktopLayout.commitPosition(selected, next, origin);
    setAnnouncement(`${projects[selected].title} moved ${dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down"}.`);
  };
  const arrangementKey = (event: KeyboardEvent) => {
    if (!desktopLayout.arranging || event.defaultPrevented) return;
    const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    // Toolbar buttons retain normal Enter behavior; icon Enter commits the draft.
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finishArrangement(false); }
    else if (directions[event.key]) { event.preventDefault(); moveSelected(...directions[event.key]); }
    else if (event.key === "Enter" && (event.target as HTMLElement).closest(".shortcut")) { event.preventDefault(); finishArrangement(true); }
  };
  return <>
    {booting && <BootPreloader assets={preloadAssets} onReveal={revealDesktop} onComplete={completeBoot} />}
    <main tabIndex={-1} className={`desktop${entered ? " is-entry-ready" : " is-entry-pending"}${booting ? " is-booting" : ""}${lampOn ? " lamp-is-on" : " lamp-is-off"}${projectFocused ? " has-focused-project" : ""}${hasOpenWindow ? " has-open-window" : ""}${hoverProject ? " has-project-hover" : ""}${desktopLayout.arranging ? " is-arranging" : ""}`} aria-label="Favour interactive portfolio desktop" aria-hidden={booting} inert={booting} onKeyDown={arrangementKey}>
      <h1 className="sr-only">Favour interactive portfolio</h1>
      <div className="favour-background" aria-hidden="true"><div className="favour-brand">FAVOUR</div></div>
      <div inert={backgroundInert}>
        <PendantLamp lightOn={lampOn} subdued={hasOpenWindow} onToggle={toggleLamp} />
        <p className="availability-status" role="status"><span className="availability-dot" aria-hidden="true"/><span>Available</span></p>
        <div className="desktop-utilities">
          <button ref={arrangeButton} type="button" className="arrange-apps" onClick={() => beginArrangement(selected, true)} disabled={desktopLayout.arranging}>Arrange apps</button>
          <button className="reset-shortcut-layout" type="button" disabled={!desktopLayout.changed} onClick={desktopLayout.reset}>Reset icon arrangement</button>
        </div>
        <p className={`interaction-hint${hintVisible ? " is-visible" : ""}`} role="status">{mobile ? "Hold an app to rearrange · Tap to open" : "Drag apps to rearrange · Click to open"}</p>
        <div className="desktop-shortcuts" aria-label="Projects">
          {projectList.map(project => <DesktopIcon key={project.key} project={project} position={desktopLayout.layout[project.key]} lampOn={lampOn} mobile={mobile} arranging={desktopLayout.arranging} selected={desktopLayout.arranging && selected === project.key} onSelect={() => { setSelected(project.key); setAnnouncement(`${project.title} selected.`); }} onArrangeStart={() => beginArrangement(project.key)} onMove={position => mobile ? desktopLayout.previewPosition(project.key, position) : desktopLayout.setPosition(project.key, position)} onMoveEnd={(position, origin) => desktopLayout.commitPosition(project.key, position, origin)} onOpen={opener => { setHintVisible(false); setHoveredProject(undefined); manager.openProject(project.key, opener); }} onHover={hovered => setHoveredProject(hovered && !hasOpenWindow && !desktopLayout.arranging ? project.key : undefined)} />)}
        </div>
        {desktopLayout.arranging && <div className="arrangement-toolbar" role="toolbar" aria-label="Arrange project apps">
          <p id="arrangement-instructions"><strong>{projects[selected].desktopLabel}</strong><span>Select an app, then move it. Done saves your changes.</span></p>
          <div className="arrangement-directions">{([['left', -1, 0], ['up', 0, -1], ['down', 0, 1], ['right', 1, 0]] as const).map(([direction, dx, dy]) => <button key={direction} type="button" aria-label={`Move selected app ${direction}`} onClick={() => moveSelected(dx, dy)}><svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${direction === "left" ? 180 : direction === "up" ? -90 : direction === "down" ? 90 : 0}deg)` }}><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>)}</div>
          <div className="arrangement-actions"><button type="button" disabled={!desktopLayout.changed} onClick={desktopLayout.reset}>Reset</button><button type="button" onClick={() => finishArrangement(false)}>Cancel</button><button type="button" onClick={() => finishArrangement(true)}>Done</button></div>
        </div>}
        <aside className={`project-hover-info${hoverProject && !hasOpenWindow ? " is-visible" : ""}`} aria-live="polite" aria-hidden={!hoverProject}><div className="project-hover-copy"><p className="project-hover-name">{hoverProject?.title}</p><p className="project-hover-description">{hoverProject?.desktopSummary}</p><p className="project-hover-stack">{hoverProject?.desktopStack}</p></div></aside>
        <Dock projectFocused={projectFocused} onOpenApp={manager.openApp} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      <section className="window-layer" aria-label="Open windows">
        {manager.windows.map(model => {
          const project = model.projectKey ? projects[model.projectKey] : undefined;
          const kind = project ? "project" : model.key === "about" ? "about" : "notes";
          const active = manager.activeWindow?.key === model.key;
          return <WindowFrame key={model.key} register={manager.register} window={model} title={project?.title ?? (model.key === "about" ? "About me" : "Notes")} icon={project?.icon} kind={kind} active={active} accent={project?.accent} mobile={mobile} onClose={() => manager.close(model.key)} onFocus={() => manager.focus(model.key)} onMove={position => manager.move(model.key, position)} onToggleExpanded={() => manager.toggleExpanded(model.key)} githubAccent={project?.githubAccent}>
            {project ? <ProjectWindow project={project} /> : model.key === "about" ? <AboutWindow active={active} /> : <NotesWindow />}
          </WindowFrame>;
        })}
      </section>
    </main>
  </>;
}
