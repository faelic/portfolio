import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { Point, type GeoJSONSource, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
import { continentLabels, locationHub, locationLevels, type LocationPoint } from "../../data/locations";

const accent = "#0aff3e";

function greatCircle(from: LocationPoint, to: LocationPoint, segments = 64) {
  const radians = Math.PI / 180;
  const degrees = 180 / Math.PI;
  const vector = (point: LocationPoint) => {
    const lng = point.lng * radians; const lat = point.lat * radians; const cos = Math.cos(lat);
    return [cos * Math.cos(lng), cos * Math.sin(lng), Math.sin(lat)];
  };
  const a = vector(from); const b = vector(to);
  const omega = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const sin = Math.sin(omega);
  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const aw = sin < 0.000001 ? 1 - t : Math.sin((1 - t) * omega) / sin;
    const bw = sin < 0.000001 ? t : Math.sin(t * omega) / sin;
    const x = aw * a[0] + bw * b[0]; const y = aw * a[1] + bw * b[1]; const z = aw * a[2] + bw * b[2];
    return [Math.atan2(y, x) * degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * degrees];
  });
}

const featureCollection = (locations: readonly LocationPoint[]) => ({
  type: "FeatureCollection" as const,
  features: locations.map((location) => ({ type: "Feature" as const, properties: { name: location.name }, geometry: { type: "LineString" as const, coordinates: greatCircle(location, locationHub) } })),
});

function angularDistance(from: Pick<LocationPoint, "lng" | "lat">, to: Pick<LocationPoint, "lng" | "lat">) {
  const radians = Math.PI / 180;
  const fromLat = from.lat * radians;
  const toLat = to.lat * radians;
  const longitudeDelta = (to.lng - from.lng) * radians;
  const cosine = Math.sin(fromLat) * Math.sin(toLat)
    + Math.cos(fromLat) * Math.cos(toLat) * Math.cos(longitudeDelta);
  return Math.acos(Math.min(1, Math.max(-1, cosine))) / radians;
}

function tuneMapPalette(map: MapLibreMap) {
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id.toLowerCase();
    try {
      if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", "#020404");
      if (layer.type === "fill" && id.includes("water")) map.setPaintProperty(layer.id, "fill-color", "#263238");
      if (layer.type === "fill" && (id.includes("land") || id.includes("earth"))) map.setPaintProperty(layer.id, "fill-color", "#0b1010");
      if (layer.type === "line" && (id.includes("boundary") || id.includes("border"))) {
        map.setPaintProperty(layer.id, "line-color", "rgba(186, 205, 205, .38)");
      }
    } catch {
      // Third-party styles do not guarantee that every paint property is mutable.
    }
  }
}

function markerElement(location: LocationPoint, hub = false) {
  const element = document.createElement("div");
  element.className = `location-marker ${hub ? "location-marker--hub" : "location-marker--destination is-network-visible"}`;
  element.innerHTML = `<span class="location-marker-content"><span class="location-marker-label">${location.name}</span><span class="location-marker-stem"></span><span class="location-marker-core"></span></span>`;
  return element;
}

export function LocationGlobe({ active = true, onFailure }: { active?: boolean; onFailure: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);
  const [warning, setWarning] = useState(false);
  const [surfaceHovered, setSurfaceHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLibreMap;
    let hubMarker: Marker | undefined;
    const destinationMarkers = new Map<string, Marker>();
    let animation = 0;
    let interacting = false;
    let surfaceInteractive = false;
    let lastPointer: { x: number; y: number } | undefined;
    let lastInteraction = performance.now();
    let currentSignature = "";
    let lastMarkerRefresh = 0;
    let previousAnimationTime = performance.now();
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let loaded = false;
    let inView = true;
    const fail = () => { if (!disposed) onFailure(); };
    const watchdog = window.setTimeout(fail, 10_000);
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/dark",
        center: [locationHub.lng, locationHub.lat],
        zoom: 1.45,
        minZoom: 0.55,
        maxZoom: 18.5,
        scrollZoom: false,
        dragPan: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoomRotate: false,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        attributionControl: false,
        transformRequest: (url, resourceType) => resourceType === "Glyphs"
          ? { url: url.replace("https://tiles.openfreemap.org/fonts/", "https://demotiles.maplibre.org/font/") }
          : { url },
      });
    } catch {
      clearTimeout(watchdog);
      fail();
      return;
    }
    const canvasContainer = map.getCanvasContainer();
    const hostElement = containerRef.current;
    map.getCanvas().tabIndex = -1;
    map.touchZoomRotate.disableRotation();

    const globePoint = (clientX: number, clientY: number) => {
      const bounds = map.getCanvas().getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return undefined;
      return new Point(
        (clientX - bounds.left) / bounds.width * map.getCanvas().clientWidth,
        (clientY - bounds.top) / bounds.height * map.getCanvas().clientHeight,
      );
    };

    const pointIsOnGlobe = (clientX: number, clientY: number) => {
      const point = globePoint(clientX, clientY);
      if (!point) return false;
      try {
        // Globe unprojection clamps points outside the sphere to its edge.
        // Round-trip public coordinates instead of relying on private transform internals.
        const projected = map.project(map.unproject(point));
        return Math.hypot(projected.x - point.x, projected.y - point.y) < 2;
      } catch { return false; }
    };

    const setMapInteraction = (active: boolean) => {
      if (surfaceInteractive === active) return;
      surfaceInteractive = active;
      setSurfaceHovered(active);
      if (active) {
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
        map.touchZoomRotate.disableRotation();
      } else {
        map.dragPan.disable();
        map.scrollZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
      }
    };

    const updatePointerSurface = (clientX: number, clientY: number) => {
      lastPointer = { x: clientX, y: clientY };
      if (!interacting) {
        const active = pointIsOnGlobe(clientX, clientY);
        setMapInteraction(active);
      }
    };

    const handleMouseMove = (event: MouseEvent) => updatePointerSurface(event.clientX, event.clientY);
    const handleMouseDown = (event: MouseEvent) => updatePointerSurface(event.clientX, event.clientY);
    const handleWheel = (event: WheelEvent) => updatePointerSurface(event.clientX, event.clientY);
    const handleMouseLeave = () => { if (!interacting) setMapInteraction(false); };
    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) updatePointerSurface(touch.clientX, touch.clientY);
    };

    canvasContainer.addEventListener("mousemove", handleMouseMove, { capture: true });
    canvasContainer.addEventListener("mousedown", handleMouseDown, { capture: true });
    canvasContainer.addEventListener("wheel", handleWheel, { capture: true, passive: true });
    canvasContainer.addEventListener("mouseleave", handleMouseLeave);
    canvasContainer.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    const refresh = (force = false) => {
      const level = locationLevels.find((item) => map.getZoom() < item.maxZoom) ?? locationLevels.at(-1)!;
      const center = map.getCenter();
      const selected = [...level.locations]
        .sort((first, second) => angularDistance(center, first) - angularDistance(center, second))
        .filter((location) => angularDistance(center, location) < 108)
        .slice(0, level.limit);
      const selectedNames = new Set(selected.map((location) => location.name));
      const signature = `${level.id}:${[...selectedNames].sort().join("|")}`;
      if (!force && currentSignature === signature) return;
      currentSignature = signature;
      destinationMarkers.forEach((marker, name) => {
        if (!selectedNames.has(name)) {
          marker.remove();
          destinationMarkers.delete(name);
        }
      });
      selected.forEach((location) => {
        const existing = destinationMarkers.get(location.name);
        if (existing) {
          existing.setLngLat([location.lng, location.lat]);
          return;
        }
        destinationMarkers.set(
          location.name,
          new maplibregl.Marker({
            element: markerElement(location),
            anchor: "bottom",
            opacityWhenCovered: 0,
            subpixelPositioning: true,
          }).setLngLat([location.lng, location.lat]).addTo(map),
        );
      });
      (map.getSource("connections") as GeoJSONSource | undefined)?.setData(featureCollection(selected));
    };
    map.once("style.load", () => {
      try {
      map.setProjection({ type: "globe" });
      tuneMapPalette(map);
      map.addSource("connections", { type: "geojson", data: featureCollection([]) });
      map.addLayer({ id: "connections-glow", type: "line", source: "connections", paint: { "line-color": accent, "line-width": 3, "line-blur": 3, "line-opacity": 0.2 } });
      map.addLayer({ id: "connections", type: "line", source: "connections", paint: { "line-color": accent, "line-width": 1.25, "line-dasharray": [2, 2], "line-opacity": 0.72 } });
      map.addSource("continents", { type: "geojson", data: { type: "FeatureCollection", features: continentLabels.map((item) => ({ type: "Feature", properties: { name: item.name }, geometry: { type: "Point", coordinates: [item.lng, item.lat] } })) } });
      map.addLayer({ id: "continents", type: "symbol", source: "continents", maxzoom: 3.7, layout: { "text-field": ["get", "name"], "text-size": 14, "text-letter-spacing": 0.14, "text-transform": "uppercase" }, paint: { "text-color": "#8b9da5", "text-halo-color": "#040707", "text-halo-width": 1.2 } });
      hubMarker = new maplibregl.Marker({
        element: markerElement(locationHub, true),
        anchor: "bottom",
        opacityWhenCovered: 0,
        subpixelPositioning: true,
      }).setLngLat([locationHub.lng, locationHub.lat]).addTo(map);
      refresh(true);
      } catch { fail(); }
    });
    map.once("load", () => { loaded = true; clearTimeout(watchdog); setReady(true); });
    map.on("error", () => {
      if (!loaded && !map.isStyleLoaded()) fail();
      else setWarning(true);
    });
    const contextLost = () => fail();
    map.getCanvas().addEventListener("webglcontextlost", contextLost);
    const visibility = () => {
      visibleRef.current = !document.hidden && inView;
      setVisible(visibleRef.current);
      previousAnimationTime = performance.now();
    };
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      visibleRef.current = !document.hidden && inView;
      setVisible(visibleRef.current);
    });
    observer.observe(containerRef.current);
    map.on("zoom", () => refresh());
    map.on("dragstart", () => { interacting = true; lastInteraction = performance.now(); });
    map.on("dragend", () => {
      interacting = false;
      lastInteraction = performance.now();
      refresh(true);
      if (lastPointer) setMapInteraction(pointIsOnGlobe(lastPointer.x, lastPointer.y));
    });
    map.on("zoomstart", () => { interacting = true; lastInteraction = performance.now(); });
    map.on("zoomend", () => {
      interacting = false;
      lastInteraction = performance.now();
      refresh(true);
      if (lastPointer) setMapInteraction(pointIsOnGlobe(lastPointer.x, lastPointer.y));
    });
    const rotate = (time: number) => {
      if (activeRef.current && visibleRef.current && !interacting && time - lastInteraction > 1500 && map.getZoom() < 2.2 && !motion.matches) {
        const elapsed = Math.min(0.05, (time - previousAnimationTime) / 1000);
        const center = map.getCenter();
        map.jumpTo({ center: [center.lng - 7.5 * elapsed, center.lat] });
        if (time - lastMarkerRefresh > 550) {
          refresh();
          lastMarkerRefresh = time;
        }
      }
      previousAnimationTime = time;
      if (!disposed && activeRef.current && visibleRef.current && !motion.matches) animation = requestAnimationFrame(rotate);
      else animation = 0;
    };
    const resume = () => {
      if (!animation && activeRef.current && visibleRef.current && !motion.matches) {
        previousAnimationTime = performance.now();
        animation = requestAnimationFrame(rotate);
      }
    };
    // A lightweight event resumes a stopped loop when the containing window is active again.
    containerRef.current.addEventListener("globe:resume", resume);
    motion.addEventListener("change", resume);
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => {
      disposed = true;
      clearTimeout(watchdog);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", resume);
      map.getCanvas().removeEventListener("webglcontextlost", contextLost);
      hostElement.removeEventListener("globe:resume", resume);
      cancelAnimationFrame(animation);
      canvasContainer.removeEventListener("mousemove", handleMouseMove, { capture: true });
      canvasContainer.removeEventListener("mousedown", handleMouseDown, { capture: true });
      canvasContainer.removeEventListener("wheel", handleWheel, { capture: true });
      canvasContainer.removeEventListener("mouseleave", handleMouseLeave);
      canvasContainer.removeEventListener("touchstart", handleTouchStart, { capture: true });
      hubMarker?.remove();
      destinationMarkers.forEach((marker) => marker.remove());
      map.remove();
    };
  // Keep the map instance stable; callbacks/active state are owned by refs/parent lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (active && visible) containerRef.current?.dispatchEvent(new Event("globe:resume")); }, [active, visible]);

  return (
    <div className={`map-card${ready ? " is-map-ready" : ""}${surfaceHovered ? " is-globe-hovered" : ""}`} style={{ "--map-accent": accent, "--map-accent-glow": "rgba(10,255,62,.52)", "--map-accent-muted": "#75b98b" } as React.CSSProperties}>
      <div ref={containerRef} className="location-map" role="img" aria-label="Globe showing illustrative connections from Lagos. Location is also provided in text above." />
      {!ready && <p className="location-map-status" role="status">Loading geographic data…</p>}
      {warning && <p className="map-resource-warning" role="status">Some geographic details could not load.</p>}
      <p className="location-map-instructions" aria-hidden="true">Drag to explore · Scroll to zoom</p>
    </div>
  );
}
