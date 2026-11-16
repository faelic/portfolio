import { Component, lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DesktopSettings, type ArrangementMethod } from "./components/desktop/DesktopSettings";
import { storage } from "./utils/storage";
import { UtilityIcon } from "./components/desktop/UtilityIcon";
import { DesktopIntro } from "./components/desktop/DesktopIntro";
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
import type { AppKey, ProjectKey } from "./types/portfolio";
import type { AssistantFrameProps } from "./components/assistant/AssistantFeature";
import { withDeadline } from "./utils/withDeadline";
import { IconMotion } from "./components/icons/AnimatedIcon";

let assistantModule: ReturnType<typeof loadAssistant> | undefined;
function loadAssistant() { return withDeadline(import("./components/assistant/AssistantFeature")); }
const prepareAssistant = () => { assistantModule ??= loadAssistant(); return assistantModule; };
const AssistantFeature = lazy(prepareAssistant);
class AssistantBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function App() {
  const sound = useInterfaceSounds();
  const mobile = useMediaQuery("(max-width: 767px)");
  const wide = useMediaQuery("(min-width: 1200px)");
  const columns = wide ? 6 : 3;
  const desktopLayout = useDesktopLayout(mobile ? "mobile" : "desktop", columns);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [method, setMethod] = useState<ArrangementMethod>(() => storage.read('favour.arrangement-method.v1', 'drag' as ArrangementMethod, (v): v is ArrangementMethod => v === 'drag' || v === 'arrows'));
  useEffect(() => { storage.write('favour.arrangement-method.v1', method); }, [method]);
  const manager = useWindowManager(true, desktopLayout.arranging || settingsOpen);
  const closeSettings = () => { setSettingsOpen(false); requestAnimationFrame(() => arrangeButton.current?.focus()); };
  const [assistantMount, setAssistantMount] = useState<HTMLDivElement | null>(null);
  const [assistantRequested, setAssistantRequested] = useState(false);
  const assistantModel = manager.windows.find(model => model.key === "assistant");
  const assistantFrame: AssistantFrameProps | undefined = assistantModel ? {
    window: assistantModel, title: "Assistant", kind: "assistant", mobile,
    active: manager.activeWindow?.key === "assistant", register: manager.register,
    onClose: () => manager.close("assistant"), onFocus: () => manager.focus("assistant"),
    onMove: position => manager.move("assistant", position),
    onToggleExpanded: () => manager.toggleExpanded("assistant"),
  } : undefined;
  const [selected, setSelected] = useState<ProjectKey>("champ");
  const [announcement, setAnnouncement] = useState("");
  const arrangeButton = useRef<HTMLButtonElement>(null);
  const projectFocused = manager.activeWindow?.key.startsWith("project:") ?? false;
  const hasOpenWindow = manager.windows.length > 0;
  const backgroundInert = mobile && hasOpenWindow;
  const openApp = (key: AppKey, opener?: HTMLElement) => {
    if (key === "assistant") { setAssistantRequested(true); }
    manager.openApp(key, opener);
  };
  const beginArrangement = (key: ProjectKey = selected, focusIcon = false) => {
    setSelected(key);
    desktopLayout.begin();
    setAnnouncement(`${projects[key].title} selected. Use arrow keys or direction buttons. Done saves; Cancel discards changes.`);
    if (focusIcon) requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-project="${key}"]`)?.focus());
  };
  const finishArrangement = (save: boolean) => {
    if (save) desktopLayout.save(); else desktopLayout.cancel();
    setAnnouncement(save ? "Icon arrangement saved." : "Arrangement cancelled. Original positions restored.");
    requestAnimationFrame(() => arrangeButton.current?.focus());
  };
  const moveSelected = (dx: number, dy: number) => {
    const index = desktopLayout.order.indexOf(selected);
    const col = Math.max(0, Math.min(columns - 1, index % columns + dx));
    const row = Math.max(0, Math.min(6 / columns - 1, Math.floor(index / columns) + dy));
    desktopLayout.commitPosition(selected, { x: col * 100 / columns, y: row * 100 / (6 / columns) });
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
  return <IconMotion>
    <main tabIndex={-1} className={`desktop is-entry-ready${projectFocused ? " has-focused-project" : ""}${hasOpenWindow ? " has-open-window" : ""}${desktopLayout.arranging ? " is-arranging" : ""}`} aria-label="Favour interactive portfolio desktop" onKeyDown={arrangementKey}>
      <div className="desktop-home" inert={backgroundInert}>
        <header className="studio-header">
          <div className="favour-brand">FAVOUR</div>
          <p className="availability-status" role="status"><span className="availability-dot" aria-hidden="true"/><span>Available</span></p>
        </header>
        <DesktopIntro onOpen={manager.openProject} />
        <div className="desktop-shortcuts" aria-label="Projects">
          {projectList.map(project => <DesktopIcon key={project.key} project={project} dragEnabled={method === "drag"} position={desktopLayout.layout[project.key]} mobile={mobile} arranging={desktopLayout.arranging} selected={desktopLayout.arranging && selected === project.key} onSelect={() => { setSelected(project.key); setAnnouncement(`${project.title} selected.`); }} onArrangeStart={() => beginArrangement(project.key)} onMove={position => desktopLayout.previewPosition(project.key, position)} onMoveEnd={position => desktopLayout.commitPosition(project.key, position)} onOpen={opener => manager.openProject(project.key, opener)} />)}
        </div>
        {desktopLayout.arranging && <div className="arrangement-toolbar" role="toolbar" aria-label="Arrange project apps">
          <p id="arrangement-instructions"><strong>{projects[selected].desktopLabel}</strong><span>{method === "drag" ? "Drag apps to rearrange. Keyboard arrows also work." : "Select an app, then use the arrows."} Done saves your changes.</span></p>
          {method === "arrows" && <div className="arrangement-directions">{([['left', -1, 0], ['up', 0, -1], ['down', 0, 1], ['right', 1, 0]] as const).map(([direction, dx, dy]) => <button key={direction} type="button" aria-label={`Move selected app ${direction}`} onClick={() => moveSelected(dx, dy)}><svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: `rotate(${direction === "left" ? 180 : direction === "up" ? -90 : direction === "down" ? 90 : 0}deg)` }}><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>)}</div>}
          <div className="arrangement-actions"><button type="button" disabled={!desktopLayout.changed} onClick={desktopLayout.reset}>Reset</button><button type="button" onClick={() => finishArrangement(false)}>Cancel</button><button type="button" onClick={() => finishArrangement(true)}>Done</button></div>
        </div>}
        <footer className="studio-footer">
        <div className="desktop-utilities" role="group" aria-label="Studio controls">
          <button ref={arrangeButton} type="button" className="arrange-apps utility-button" aria-label="Desktop settings" data-tooltip="Desktop settings" onClick={() => setSettingsOpen(true)} disabled={desktopLayout.arranging}><UtilityIcon kind="settings" /></button>
          <button type="button" className="sound-toggle utility-button" aria-label={`Sound ${sound.audible ? "on" : "off"}`} data-tooltip={`Sound ${sound.audible ? "on" : "off"}`} aria-pressed={sound.audible} onClick={sound.toggle}><UtilityIcon kind={sound.audible ? "sound-on" : "sound-off"} /></button>
        </div>
        <Dock projectFocused={projectFocused} onOpenApp={openApp} onPrepareAssistant={() => { void prepareAssistant().catch(() => { assistantModule = undefined; }); }} openApps={manager.windows.filter(model => !model.projectKey).map(model => model.key as AppKey)} />
        </footer>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      <section className="window-layer" aria-label="Open windows">
        {manager.windows.filter(model => model.key !== "assistant").map(model => {
          const project = model.projectKey ? projects[model.projectKey] : undefined;
          const kind = project ? "project" : model.key === "about" ? "about" : "notes";
          const active = manager.activeWindow?.key === model.key;
          return <WindowFrame key={model.instanceKey ?? model.key} register={manager.register} window={model} title={project?.title ?? (model.key === "about" ? "About me" : "Notes")} icon={project?.icon} kind={kind} active={active} accent={project?.accent} mobile={mobile} onClose={() => manager.close(model.key)} onFocus={() => manager.focus(model.key)} onMove={position => manager.move(model.key, position)} onToggleExpanded={() => manager.toggleExpanded(model.key)} githubAccent={project?.githubAccent}>
            {project ? <ProjectWindow key={project.key} project={project} onNavigate={key => manager.navigateProject(model.key, key)} /> : model.key === "about" ? <AboutWindow active={active} /> : <NotesWindow />}
          </WindowFrame>;
        })}
        {assistantFrame && <WindowFrame {...assistantFrame}><div className="assistant-mount" ref={setAssistantMount} /></WindowFrame>}
        {assistantRequested && <AssistantBoundary fallback={assistantMount ? createPortal(<div className="assistant-loading"><p role="alert">The assistant couldn’t load. Your portfolio is still available.</p><button type="button" onClick={() => location.reload()}>Reload to try again</button></div>, assistantMount) : null}>
          <Suspense fallback={assistantMount ? createPortal(<p className="assistant-loading" role="status">Opening assistant…</p>, assistantMount) : null}>
            <AssistantFeature frame={assistantFrame} mount={assistantMount} />
          </Suspense>
        </AssistantBoundary>}
      </section>
      {settingsOpen && <DesktopSettings method={method} onMethod={setMethod} sound={sound} changed={desktopLayout.changed} canUndo={desktopLayout.canUndo} onReset={desktopLayout.reset} onUndo={desktopLayout.undo} onClose={closeSettings} onArrange={() => { setSettingsOpen(false); beginArrangement(selected, true); }} />}
    </main>
  </IconMotion>;
}
