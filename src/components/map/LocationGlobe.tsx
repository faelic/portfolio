import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type Map as MapLibreMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

export function LocationGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: MapLibreMap;
    const markers: Marker[] = [];
    let animation = 0;
    let interacting = false;
    let lastInteraction = performance.now();
    let currentSignature = "";
    let lastMarkerRefresh = 0;
    let previousAnimationTime = performance.now();
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://tiles.openfreemap.org/styles/dark",
        center: [locationHub.lng, locationHub.lat],
        zoom: 1.45,
        minZoom: 0.55,
        maxZoom: 18.5,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        attributionControl: false,
        transformRequest: (url, resourceType) => resourceType === "Glyphs"
          ? { url: url.replace("https://tiles.openfreemap.org/fonts/", "https://demotiles.maplibre.org/font/") }
          : { url },
      });
    } catch {
      setError(true);
      return;
    }
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    const refresh = (force = false) => {
      const level = locationLevels.find((item) => map.getZoom() < item.maxZoom) ?? locationLevels.at(-1)!;
      const center = map.getCenter();
      const selected = [...level.locations]
        .sort((first, second) => angularDistance(center, first) - angularDistance(center, second))
        .filter((location) => angularDistance(center, location) < 108)
        .slice(0, level.limit);
      const signature = `${level.id}:${selected.map((location) => location.name).join("|")}`;
      if (!force && currentSignature === signature) return;
      currentSignature = signature;
      markers.splice(1).forEach((marker) => marker.remove());
      selected.forEach((location) => markers.push(new maplibregl.Marker({ element: markerElement(location), anchor: "bottom" }).setLngLat([location.lng, location.lat]).addTo(map)));
      (map.getSource("connections") as GeoJSONSource | undefined)?.setData(featureCollection(selected));
    };
    map.once("style.load", () => {
      map.setProjection({ type: "globe" });
      tuneMapPalette(map);
      map.addSource("connections", { type: "geojson", data: featureCollection([]) });
      map.addLayer({ id: "connections-glow", type: "line", source: "connections", paint: { "line-color": accent, "line-width": 3, "line-blur": 3, "line-opacity": 0.2 } });
      map.addLayer({ id: "connections", type: "line", source: "connections", paint: { "line-color": accent, "line-width": 1.25, "line-dasharray": [2, 2], "line-opacity": 0.72 } });
      map.addSource("continents", { type: "geojson", data: { type: "FeatureCollection", features: continentLabels.map((item) => ({ type: "Feature", properties: { name: item.name }, geometry: { type: "Point", coordinates: [item.lng, item.lat] } })) } });
      map.addLayer({ id: "continents", type: "symbol", source: "continents", maxzoom: 3.7, layout: { "text-field": ["get", "name"], "text-size": 14, "text-letter-spacing": 0.14, "text-transform": "uppercase" }, paint: { "text-color": "#8b9da5", "text-halo-color": "#040707", "text-halo-width": 1.2 } });
      markers.push(new maplibregl.Marker({ element: markerElement(locationHub, true), anchor: "bottom" }).setLngLat([locationHub.lng, locationHub.lat]).addTo(map));
      refresh(true);
    });
    map.once("load", () => setReady(true));
    map.on("zoom", () => refresh());
    map.on("moveend", () => refresh());
    map.on("dragstart", () => { interacting = true; lastInteraction = performance.now(); });
    map.on("dragend", () => { interacting = false; lastInteraction = performance.now(); });
    const rotate = (time: number) => {
      if (!interacting && time - lastInteraction > 1500 && map.getZoom() < 2.2 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const elapsed = Math.min(0.05, (time - previousAnimationTime) / 1000);
        const center = map.getCenter();
        map.jumpTo({ center: [center.lng - 7.5 * elapsed, center.lat] });
        if (time - lastMarkerRefresh > 550) {
          refresh();
          lastMarkerRefresh = time;
        }
      }
      previousAnimationTime = time;
      animation = requestAnimationFrame(rotate);
    };
    animation = requestAnimationFrame(rotate);
    return () => { cancelAnimationFrame(animation); markers.forEach((marker) => marker.remove()); map.remove(); };
  }, []);

  return (
    <div className={`map-card${ready ? " is-map-ready" : ""}${error ? " has-map-error" : ""}`} style={{ "--map-accent": accent, "--map-accent-glow": "rgba(10,255,62,.52)", "--map-accent-muted": "#75b98b" } as React.CSSProperties}>
      <div ref={containerRef} className="location-map" role="application" aria-label="Interactive globe centered on Lagos. Drag to rotate and scroll to zoom." />
      {!ready && <p className="location-map-status" role="status">{error ? "Interactive map unavailable." : "Loading geographic data…"}</p>}
      <p className="location-map-instructions" aria-hidden="true">Drag to explore · Scroll to zoom</p>
    </div>
  );
}
