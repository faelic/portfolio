import { withDeadline } from "../../utils/withDeadline";
import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface BoundaryProps { children: ReactNode; fallback: ReactNode }
class GlobeBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function GlobeSection({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // A fresh lazy instance releases React's cached rejected promise on explicit retry.
  const Globe = useMemo(() => {
    void attempt;
    return lazy(() => withDeadline(import("./LocationGlobe")).then(module => ({ default: module.LocationGlobe })));
  }, [attempt]);
  useEffect(() => {
    const target = host.current;
    if (!target) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNear(true); observer.disconnect(); }
    }, { root: target.closest(".project-scroll-panel"), rootMargin: "200px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const unavailable = <div className="map-card globe-failure"><p role="status">Interactive map unavailable.</p><p>You can still read my background and get in touch above.</p><button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>Retry map</button></div>;
  return <div ref={host}>
    {!near ? <div className="map-card map-card--loading"><p className="location-map-status">The globe loads as you reach this section.</p></div>
      : failed ? unavailable
      : <GlobeBoundary key={attempt} fallback={unavailable}><Suspense fallback={<div className="map-card map-card--loading"><p className="location-map-status" role="status">Preparing interactive globe…</p></div>}><Globe active={active} onFailure={() => setFailed(true)} /></Suspense></GlobeBoundary>}
  </div>;
}
