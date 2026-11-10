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
  const pendingFocus = useRef<WindowKey | "desktop" | null>(null);
  const activeWindow = topWindow(state.windows);
  const register = useCallback((key: WindowKey, node: HTMLElement | null) => {
    if (node) nodes.current.set(key, node); else nodes.current.delete(key);
  }, []);
  const rememberOpener = (key: WindowKey, opener?: HTMLElement | null) => {
    const element = opener ?? document.activeElement;
    if (element instanceof HTMLElement && element !== document.body && !element.closest(".window")) openers.current.set(key, element);
  };
  const focus = useCallback((key: WindowKey) => { pendingFocus.current = null; dispatch({ type: "focus", key }); }, []);
  const openProject = useCallback((projectKey: ProjectKey, opener?: HTMLElement | null) => {
    const key: WindowKey = `project:${projectKey}`;
    rememberOpener(key, opener);
    pendingFocus.current = key;
    requestFocus();
    dispatch({ type: "open", key, projectKey });
    if (hashToProject(location.hash) !== projectKey) history.pushState(null, "", projectToHash(projectKey));
  }, []);
  const openApp = useCallback((key: AppKey, opener?: HTMLElement) => {
    rememberOpener(key, opener);
    pendingFocus.current = key;
    requestFocus();
    dispatch({ type: "open", key });
  }, []);
  const close = useCallback((key: WindowKey) => {
    pendingFocus.current = key;
    requestFocus();
    dispatch({ type: "close", key });
    if (key.startsWith("project:") && hashToProject(location.hash) === key.slice(8)) history.replaceState(null, "", `${location.pathname}${location.search}`);
  }, []);
  const move = useCallback((key: WindowKey, position: Point) => dispatch({ type: "move", key, position }), []);
  const toggleExpanded = useCallback((key: WindowKey) => dispatch({ type: "expand", key }), []);
  useEffect(() => {
    const navigate = (event?: Event) => {
      const projectKey = hashToProject(location.hash);
      pendingFocus.current = projectKey ? `project:${projectKey}` : event ? "desktop" : null;
      requestFocus();
      dispatch({ type: "navigate", projectKey });
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
      play("tick", { volume: 1 });
      close(activeWindow.key);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [activeWindow, arranging, close]);
  return { windows: state.windows, activeWindow, openProject, openApp, close, focus, toggleExpanded, move, register };
}
