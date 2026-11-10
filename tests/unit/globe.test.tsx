import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mock = vi.hoisted(() => ({ failConstruction: false, maps: [] as Array<{ emit: (name: string) => void; remove: ReturnType<typeof vi.fn>; canvas: HTMLCanvasElement; styled: boolean }> }));
vi.mock("maplibre-gl", () => {
  class FakeMap {
    events = new Map<string, Array<() => void>>();
    canvas = document.createElement("canvas");
    container = document.createElement("div");
    styled = true;
    remove = vi.fn();
    dragPan = { enable: vi.fn(), disable: vi.fn() };
    scrollZoom = this.dragPan; doubleClickZoom = this.dragPan;
    touchZoomRotate = { ...this.dragPan, disableRotation: vi.fn() };
    transform = { width: 500, height: 500, isPointOnMapSurface: () => true };
    constructor() { if (mock.failConstruction) throw new Error("No WebGL"); mock.maps.push(this); }
    on(name: string, callback: () => void) { this.events.set(name, [...this.events.get(name) ?? [], callback]); return this; }
    once(name: string, callback: () => void) { return this.on(name, callback); }
    emit(name: string) { this.events.get(name)?.forEach(callback => callback()); }
    getCanvasContainer() { return this.container; }
    getCanvas() { return this.canvas; }
    getZoom() { return 1.45; }
    getCenter() { return { lng: 3.3792, lat: 6.5244 }; }
    getStyle() { return { layers: [] }; }
    isStyleLoaded() { return this.styled; }
    getSource() { return { setData: vi.fn() }; }
    addControl() {} setProjection() {} addSource() {} addLayer() {} jumpTo() {}
  }
  class Marker { setLngLat() { return this; } addTo() { return this; } remove() {} }
  return { setWorkerUrl: vi.fn(), Map: FakeMap, Marker, AttributionControl: class {}, Point: class {} };
});
import { LocationGlobe } from "../../src/components/map/LocationGlobe";

beforeEach(() => { vi.useFakeTimers(); mock.maps.length = 0; mock.failConstruction = false; });
afterEach(() => vi.useRealTimers());
describe("optional geographic enhancement", () => {
  it("reports construction failure without throwing into About", () => {
    mock.failConstruction = true;
    const failure = vi.fn();
    render(<LocationGlobe onFailure={failure} />);
    expect(failure).toHaveBeenCalledOnce();
  });
  it("settles loading, tolerates recoverable resource errors and cleans up", () => {
    const failure = vi.fn();
    const { unmount } = render(<LocationGlobe onFailure={failure} />);
    const map = mock.maps[0];
    act(() => map.emit("style.load"));
    act(() => map.emit("load"));
    expect(screen.queryByText("Loading geographic data…")).not.toBeInTheDocument();
    act(() => map.emit("error"));
    expect(screen.getByText("Some geographic details could not load.")).toBeVisible();
    act(() => vi.advanceTimersByTime(10_001));
    expect(failure).not.toHaveBeenCalled();
    unmount();
    expect(map.remove).toHaveBeenCalledOnce();
  });
  it("fails after a bounded initialization wait and cancels the watchdog on unmount", () => {
    const failure = vi.fn();
    const { unmount } = render(<LocationGlobe onFailure={failure} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(failure).toHaveBeenCalledOnce();
    unmount();
    expect(mock.maps[0].remove).toHaveBeenCalledOnce();
  });
  it("handles fatal style failure and WebGL context loss", () => {
    const failure = vi.fn();
    const { unmount } = render(<LocationGlobe onFailure={failure} />);
    const map = mock.maps[0];
    map.styled = false;
    act(() => map.emit("error"));
    expect(failure).toHaveBeenCalledOnce();
    failure.mockClear();
    act(() => map.canvas.dispatchEvent(new Event("webglcontextlost")));
    expect(failure).toHaveBeenCalledOnce();
    unmount();
  });
});
