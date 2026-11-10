import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BootPreloader } from "../../src/components/effects/BootPreloader";
const originalImage = globalThis.Image;
const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
afterEach(() => {
  vi.stubGlobal("Image", originalImage);
  if (originalFonts) Object.defineProperty(document, "fonts", originalFonts);
  else Reflect.deleteProperty(document, "fonts");
  vi.useRealTimers();
});
it("reveals usable content even when images and fonts never finish", async () => {
  vi.useFakeTimers();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal("Image", class { complete = false; set src(_value: string) {} });
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: new Promise(() => {}) } });
  const reveal = vi.fn(); const complete = vi.fn();
  render(<BootPreloader assets={["/stalled.png"]} onReveal={reveal} onComplete={complete} />);
  await act(() => vi.advanceTimersByTimeAsync(3500));
  expect(reveal).toHaveBeenCalledOnce();
  expect(complete).toHaveBeenCalledOnce();
  expect(sessionStorage.getItem("favour.boot-seen.v1")).toBe("true");
});
it("uses the return-session path when failed assets settle immediately", async () => {
  vi.useFakeTimers();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  sessionStorage.setItem("favour.boot-seen.v1", "true");
  vi.stubGlobal("Image", class {
    complete = false;
    onerror?: () => void;
    set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
  });
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  const reveal = vi.fn();
  render(<BootPreloader assets={["/failed.png"]} onReveal={reveal} onComplete={() => {}} />);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(reveal).toHaveBeenCalledOnce();
});
