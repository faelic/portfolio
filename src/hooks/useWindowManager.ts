import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hashToProject, projectToHash } from "../data/projects";
import type { AppKey, Point, PortfolioWindow, ProjectKey, WindowKey } from "../types/portfolio";

const initialWindow = (key: WindowKey, zIndex: number, projectKey?: ProjectKey): PortfolioWindow => ({
  key,
  projectKey,
  zIndex,
  expanded: false,
});

export function useWindowManager() {
  const [windows, setWindows] = useState<PortfolioWindow[]>([]);
  const zCounter = useRef(110);
  const activeWindow = useMemo(() => windows.reduce<PortfolioWindow | undefined>((top, item) => !top || item.zIndex > top.zIndex ? item : top, undefined), [windows]);

  const focus = useCallback((key: WindowKey) => {
    zCounter.current += 1;
    setWindows((current) => current.map((item) => item.key === key ? { ...item, zIndex: zCounter.current } : item));
  }, []);

  const openProject = useCallback((projectKey: ProjectKey, updateHash = true) => {
    const key: WindowKey = `project:${projectKey}`;
    zCounter.current += 1;
    setWindows((current) => {
      const existing = current.find((item) => item.key === key);
      return existing
        ? current.map((item) => item.key === key ? { ...item, zIndex: zCounter.current } : item)
        : [...current, initialWindow(key, zCounter.current, projectKey)];
    });
    if (updateHash && window.location.hash !== projectToHash(projectKey)) history.pushState({ projectKey }, "", projectToHash(projectKey));
  }, []);

  const openApp = useCallback((appKey: AppKey) => {
    zCounter.current += 1;
    setWindows((current) => {
      const existing = current.find((item) => item.key === appKey);
      return existing
        ? current.map((item) => item.key === appKey ? { ...item, zIndex: zCounter.current } : item)
        : [...current, initialWindow(appKey, zCounter.current)];
    });
  }, []);

  const close = useCallback((key: WindowKey) => {
    setWindows((current) => current.filter((item) => item.key !== key));
    if (key.startsWith("project:")) {
      const projectKey = key.slice(8) as ProjectKey;
      if (window.location.hash === projectToHash(projectKey)) history.replaceState(null, "", `${location.pathname}${location.search}`);
    }
  }, []);

  const toggleExpanded = useCallback((key: WindowKey) => {
    setWindows((current) => current.map((item) => item.key === key ? { ...item, expanded: !item.expanded } : item));
    focus(key);
  }, [focus]);

  const move = useCallback((key: WindowKey, position: Point) => {
    setWindows((current) => current.map((item) => item.key === key ? { ...item, position } : item));
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      const projectKey = hashToProject(location.hash);
      if (projectKey) openProject(projectKey, false);
    };
    openFromHash();
    window.addEventListener("popstate", openFromHash);
    return () => window.removeEventListener("popstate", openFromHash);
  }, [openProject]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && activeWindow) close(activeWindow.key);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [activeWindow, close]);

  return { windows, activeWindow, openProject, openApp, close, focus, toggleExpanded, move };
}
