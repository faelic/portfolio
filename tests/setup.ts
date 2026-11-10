import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => { cleanup(); localStorage.clear(); sessionStorage.clear(); history.replaceState(null, "", "/"); });
Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn().mockImplementation(query => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
class Observer { observe() {} unobserve() {} disconnect() {} }
vi.stubGlobal("ResizeObserver", Observer);
vi.stubGlobal("IntersectionObserver", Observer);
vi.mock("cuelume", () => ({ play: vi.fn(), bind: vi.fn(), setVolume: vi.fn() }));
