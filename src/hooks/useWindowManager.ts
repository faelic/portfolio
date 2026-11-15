import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { play } from "cuelume";
import { hashToProject, projectToHash } from "../data/projects";
import { initialWindowState, topWindow, windowReducer } from "../state/windows";
import type { AppKey, Point, ProjectKey, WindowKey } from "../types/portfolio";

export function useWindowManager(ready = true, arranging = false) {
  const [, requestFocus] = useReducer((value: number) => value + 1, 0);
  const [state, dispatch] = useReducer(windowReducer, initialWindowState);
  const openers = useRef(new Map<WindowKey, HTMLElement>());
  const nodes = useRef(new Map<WindowKey, HTMLElement>());
  const animations = useRef(new Map<WindowKey, Animation>());
  const closing = useRef(new Map<WindowKey, Animation>());
  const skipEntrance = useRef(new Set<WindowKey>());
  const stateRef = useRef(state);
  stateRef.current = state;
  const journeyWindow = useRef<WindowKey | null>(null);
  const pendingFocus = useRef<WindowKey | "desktop" | null>(null);
  const activeWindow = topWindow(state.windows);
  const cancelMotion = (key: WindowKey) => {
    const wasClosing = closing.current.delete(key);
    if (wasClosing) { const node = nodes.current.get(key); if (node) node.inert = false; }
    animations.current.get(key)?.cancel();
    animations.current.delete(key);
    nodes.current.get(key)?.classList.remove("is-closing");
  };
  const sourceFor = (key: WindowKey) => {
    const opener = openers.current.get(key);
    return opener?.isConnected ? opener : key.startsWith("project:") ? document.querySelector<HTMLElement>(`[data-project="${key.slice(8)}"]`) : undefined;
  };
  const motionFrames = (node: HTMLElement, source?: HTMLElement | null) => {
    const bounds = node.getBoundingClientRect();
    const origin = source?.querySelector<HTMLElement>(".shortcut-thumbnail") ?? source;
    const rect = origin?.getBoundingClientRect();
    const visible = rect && rect.width && rect.height && rect.bottom > 0 && rect.top < window.innerHeight;
    const transform = visible ? `translate(${rect.left + rect.width / 2 - bounds.left - bounds.width / 2}px, ${rect.top + rect.height / 2 - bounds.top - bounds.height / 2}px) scale(${Math.min(.35, Math.max(.12, rect.width / bounds.width))})` : "none";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return [{ opacity: 0, transform: reduced ? "none" : transform }, { opacity: 1, transform: "none" }];
  };
  const register = useCallback((key: WindowKey, node: HTMLElement | null) => {
    if (node) {
      const previous = nodes.current.get(key);
      nodes.current.set(key, node);
      if (previous !== node && !skipEntrance.current.delete(key) && typeof node.animate === "function") {
        animations.current.get(key)?.cancel();
        // Entrance requires a real launch. Direct hash visits use a fade.
        const source = openers.current.get(key);
        const animation = node.animate(motionFrames(node, source), { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 240, easing: "cubic-bezier(.16,1,.3,1)" });
        animations.current.set(key, animation);
      }
      if (pendingFocus.current === key) requestFocus();
    } else {
      // A lazy window replaces its loading frame. Carry focus to the new frame
      // only if the visitor was still focused inside the old one.
      if (nodes.current.get(key)?.contains(document.activeElement)) pendingFocus.current = key;
      nodes.current.delete(key);
    }
  }, []);
  const rememberOpener = (key: WindowKey, opener?: HTMLElement | null) => {
    const element = opener ?? document.activeElement;
    if (element instanceof HTMLElement && element !== document.body && !element.closest(".window")) openers.current.set(key, element);
  };
  const focus = useCallback((key: WindowKey) => { pendingFocus.current = null; dispatch({ type: "focus", key }); }, []);
  const openProject = useCallback((projectKey: ProjectKey, opener?: HTMLElement | null) => {
    const key: WindowKey = `project:${projectKey}`;
    journeyWindow.current = null;
    cancelMotion(key);
    rememberOpener(key, opener);
    pendingFocus.current = key;
    requestFocus();
    dispatch({ type: "open", key, projectKey });
    play("release", { volume: .5 });
    if (hashToProject(location.hash) !== projectKey) history.pushState({ portfolioJourney: false }, "", projectToHash(projectKey));
  }, []);
  const openApp = useCallback((key: AppKey, opener?: HTMLElement) => {
    cancelMotion(key);
    rememberOpener(key, opener);
    pendingFocus.current = key;
    requestFocus();
    dispatch({ type: "open", key });
    play("release", { volume: .5 });
  }, []);
  const close = useCallback((key: WindowKey, returnToDesktop = false) => {
    if (closing.current.has(key)) return;
    const finish = () => {
      pendingFocus.current = key;
      requestFocus();
      dispatch(returnToDesktop ? { type: "desktop" } : { type: "close", key });
      if (journeyWindow.current === key) journeyWindow.current = null;
      if (returnToDesktop || (key.startsWith("project:") && hashToProject(location.hash) === key.slice(8))) history.replaceState(null, "", `${location.pathname}${location.search}`);
    };
    const node = nodes.current.get(key);
    if (!node || typeof node.animate !== "function") { finish(); return; }
    cancelMotion(key);
    node.classList.add("is-closing");
    node.inert = true;
    const animation = node.animate(motionFrames(node, sourceFor(key)).reverse(), { duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 180, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    animations.current.set(key, animation); closing.current.set(key, animation);
    play("tick", { volume: .5 });
    const done = () => { if (closing.current.get(key) !== animation) return; closing.current.delete(key); animations.current.delete(key); finish(); };
    animation.finished.then(done, done);
  }, []);
  const navigateProject = useCallback((from: WindowKey, projectKey: ProjectKey) => {
    const key: WindowKey = `project:${projectKey}`;
    cancelMotion(from); cancelMotion(key);
    skipEntrance.current.add(key);
    openers.current.delete(key);
    const source = document.querySelector<HTMLElement>(`[data-project="${projectKey}"]`);
    if (source) openers.current.set(key, source);
    journeyWindow.current = key;
    pendingFocus.current = key;
    dispatch({ type: "replace-project", key: from, projectKey });
    history.pushState({ portfolioJourney: true }, "", projectToHash(projectKey));
    requestFocus();
  }, []);
  const move = useCallback((key: WindowKey, position: Point) => dispatch({ type: "move", key, position }), []);
  const toggleExpanded = useCallback((key: WindowKey) => dispatch({ type: "expand", key }), []);
  useEffect(() => {
    const navigate = (event?: Event) => {
      const projectKey = hashToProject(location.hash);
      pendingFocus.current = projectKey ? `project:${projectKey}` : event ? "desktop" : null;
      requestFocus();
      const currentJourney = journeyWindow.current;
      if (event && projectKey && currentJourney && stateRef.current.windows.some(item => item.key === currentJourney)) {
        const key: WindowKey = `project:${projectKey}`;
        cancelMotion(currentJourney); cancelMotion(key); skipEntrance.current.add(key);
        openers.current.delete(key);
        const source = document.querySelector<HTMLElement>(`[data-project="${projectKey}"]`);
        if (source) openers.current.set(key, source);
        dispatch({ type: "replace-project", key: currentJourney, projectKey });
        journeyWindow.current = key;
      } else {
        if (!projectKey) journeyWindow.current = null;
        dispatch({ type: "navigate", projectKey });
      }
    };
    navigate();
    window.addEventListener("popstate", navigate);
    window.addEventListener("hashchange", navigate);
    return () => { window.removeEventListener("popstate", navigate); window.removeEventListener("hashchange", navigate); };
  }, []);
  useLayoutEffect(() => {
    if (!ready || !pendingFocus.current) return;
    const requested = pendingFocus.current;
    const target = requested !== "desktop" ? nodes.current.get(requested) : undefined;
    const active = activeWindow && nodes.current.get(activeWindow.key);
    const opener = requested !== "desktop" ? openers.current.get(requested) : undefined;
    const fallback = document.querySelector<HTMLElement>(".desktop .shortcut") ?? document.querySelector<HTMLElement>(".desktop");
    const next = target || active || (opener?.isConnected && !opener.closest("[inert]") ? opener : fallback);
    let frame = 0;
    let attempts = 0;
    const applyFocus = () => {
      if (pendingFocus.current !== requested) return;
      if (next?.isConnected && !next.closest("[inert]") && getComputedStyle(next).visibility === "visible") {
        next.focus({ preventScroll: true });
        pendingFocus.current = null;
      } else if (++attempts < 30) {
        // A just-revealed mobile dock can remain hidden until the next style frame.
        frame = requestAnimationFrame(applyFocus);
      } else {
        document.querySelector<HTMLElement>(".desktop")?.focus({ preventScroll: true });
        pendingFocus.current = null;
      }
    };
    frame = requestAnimationFrame(applyFocus);
    return () => cancelAnimationFrame(frame);
  });
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.repeat || arranging || !activeWindow) return;
      event.preventDefault();
      close(activeWindow.key);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [activeWindow, arranging, close]);
  useEffect(() => {
    const settle = () => { animations.current.forEach(animation => animation.cancel()); };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", settle); media.addEventListener("change", settle);
    const running = animations.current; const leaving = closing.current;
    return () => { window.removeEventListener("resize", settle); media.removeEventListener("change", settle); leaving.clear(); running.forEach(animation => animation.cancel()); running.clear(); };
  }, []);
  return { navigateProject, windows: state.windows, activeWindow, openProject, openApp, close, focus, toggleExpanded, move, register };
}
