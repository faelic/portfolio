import { useEffect, useMemo, useState } from "react";
import { PendantLamp } from "./components/effects/PendantLamp";
import { DesktopIcon } from "./components/desktop/DesktopIcon";
import { Dock } from "./components/dock/Dock";
import { AboutWindow } from "./components/windows/AboutWindow";
import { NotesWindow } from "./components/windows/NotesWindow";
import { ProjectWindow } from "./components/windows/ProjectWindow";
import { WindowFrame } from "./components/windows/WindowFrame";
import { projectList, projects } from "./data/projects";
import { useDesktopLayout } from "./hooks/useDesktopLayout";
import { useInterfaceSounds } from "./hooks/useInterfaceSounds";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { useWindowManager } from "./hooks/useWindowManager";
import type { ProjectKey } from "./types/portfolio";

export function App() {
  useInterfaceSounds();
  const manager = useWindowManager();
  const mobile = useMediaQuery("(max-width: 767px)");
  const desktopLayout = useDesktopLayout(mobile ? "mobile" : "desktop");
  const [lampOn, setLampOn] = useState(true);
  const [entered, setEntered] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<ProjectKey>();
  const [hintVisible, setHintVisible] = useState(false);
  const [mobileArranging, setMobileArranging] = useState(false);
  const projectFocused = manager.activeWindow?.key.startsWith("project:") ?? false;
  const hasOpenWindow = manager.windows.length > 0;

  useEffect(() => {
    if (!mobile) setMobileArranging(false);
  }, [mobile]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    const seen = sessionStorage.getItem("favour.interaction-hint-seen.v2");
    let showTimer = 0;
    let hideTimer = 0;
    if (!seen) {
      showTimer = window.setTimeout(() => { setHintVisible(true); sessionStorage.setItem("favour.interaction-hint-seen.v2", "true"); }, 1500);
      hideTimer = window.setTimeout(() => setHintVisible(false), 6900);
    }
    return () => { cancelAnimationFrame(frame); clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  const hoverProject = useMemo(() => hoveredProject ? projects[hoveredProject] : undefined, [hoveredProject]);

  return (
    <main className={`desktop${entered ? " is-entry-ready" : " is-entry-pending"}${lampOn ? " lamp-is-on" : " lamp-is-off"}${projectFocused ? " has-focused-project" : ""}${hasOpenWindow ? " has-open-window" : ""}${hoverProject ? " has-project-hover" : ""}${mobileArranging ? " is-arranging" : ""}`} aria-label="Favour interactive portfolio desktop">
      <h1 className="sr-only">Favour interactive portfolio</h1>
      <div className="favour-background" aria-hidden="true"><div className="favour-brand">FAVOUR</div></div>
      <PendantLamp lightOn={lampOn} subdued={manager.windows.length > 0} onToggle={() => setLampOn((current) => !current)} />
      <p className="availability-status" role="status"><span className="availability-dot" aria-hidden="true"/><span>Available to work</span></p>
      <button className="reset-shortcut-layout" type="button" disabled={!desktopLayout.changed} data-cuelume-hover="tick" data-cuelume-release="ready" onClick={desktopLayout.reset}>Reset icon arrangement</button>
      <p className={`interaction-hint${hintVisible ? " is-visible" : ""}`} role="status"><span>{mobile ? "Hold an app to rearrange" : "Drag apps to rearrange"}</span><span aria-hidden="true">·</span><span>{mobile ? "Tap to open" : "Click to open"}</span></p>

      <div className="desktop-shortcuts" aria-label="Projects" aria-hidden={mobile && hasOpenWindow}>
        {projectList.map((project) => <DesktopIcon key={project.key} project={project} position={desktopLayout.layout[project.key]} lampOn={lampOn} mobile={mobile} arranging={mobileArranging} onArrangeStart={() => setMobileArranging(true)} onMove={(position) => mobile ? desktopLayout.previewPosition(project.key, position) : desktopLayout.setPosition(project.key, position)} onMoveEnd={(position, origin) => desktopLayout.commitPosition(project.key, position, origin)} onOpen={() => { setHintVisible(false); setMobileArranging(false); setHoveredProject(undefined); manager.openProject(project.key); }} onHover={(hovered) => setHoveredProject(hovered && manager.windows.length === 0 ? project.key : undefined)} />)}
      </div>

      {mobile && mobileArranging && (
        <div className="mobile-arrangement-bar" role="toolbar" aria-label="Arrange project apps">
          <span>Move apps into a new slot</span>
          <button type="button" data-cuelume-press="press" data-cuelume-release="ready" onClick={desktopLayout.reset} disabled={!desktopLayout.changed}>Reset</button>
          <button type="button" data-cuelume-press="press" data-cuelume-release="release" onClick={() => setMobileArranging(false)}>Done</button>
        </div>
      )}

      <aside className={`project-hover-info${hoverProject && manager.windows.length === 0 ? " is-visible" : ""}`} aria-live="polite" aria-hidden={!hoverProject}>
        <div className="project-hover-copy"><p className="project-hover-name">{hoverProject?.title}</p><p className="project-hover-description">{hoverProject?.desktopSummary}</p><p className="project-hover-stack">{hoverProject?.desktopStack}</p></div>
      </aside>

      <section className="window-layer" aria-live="polite">
        {manager.windows.map((model) => {
          const project = model.projectKey ? projects[model.projectKey] : undefined;
          const kind: "project" | "about" | "notes" = project ? "project" : model.key === "about" ? "about" : "notes";
          const title = project?.title ?? (model.key === "notes" ? "Notes" : "");
          return (
            <WindowFrame key={model.key} window={model} title={title} icon={project?.icon} kind={kind} active={manager.activeWindow?.key === model.key} accent={project?.accent} mobile={mobile} onClose={() => manager.close(model.key)} onFocus={() => manager.focus(model.key)} onMove={(position) => manager.move(model.key, position)} onToggleExpanded={() => manager.toggleExpanded(model.key)}>
              {project ? <ProjectWindow project={project} /> : model.key === "about" ? <AboutWindow /> : <NotesWindow />}
            </WindowFrame>
          );
        })}
      </section>

      <Dock projectFocused={projectFocused} onOpenApp={manager.openApp} />
    </main>
  );
}
