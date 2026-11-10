import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { isBoolean, session, storage } from "../../src/utils/storage";
import { useDesktopLayout } from "../../src/hooks/useDesktopLayout";
import { layoutStorageKey } from "../../src/state/layout";

describe("optional browser persistence", () => {
  it("falls back for malformed JSON and wrong-shaped flags", () => {
    localStorage.setItem("flag", "{");
    expect(storage.read("flag", false, isBoolean)).toBe(false);
    localStorage.setItem("flag", '"true"');
    expect(storage.read("flag", false, isBoolean)).toBe(false);
    sessionStorage.setItem("lamp", "bad");
    expect(session.flag("lamp", true)).toBe(true);
    session.writeFlag("lamp", false);
    expect(sessionStorage.getItem("lamp")).toBe("false");
  });
  it("contains denied reads, writes and removals, including obtaining a store", () => {
    const getter = vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new DOMException("Denied"); });
    expect(storage.read("flag", false, isBoolean)).toBe(false);
    expect(() => storage.write("flag", true)).not.toThrow();
    expect(() => storage.remove("flag")).not.toThrow();
    getter.mockRestore();
    const sessionGetter = vi.spyOn(window, "sessionStorage", "get").mockImplementation(() => { throw new DOMException("Denied"); });
    expect(session.flag("flag")).toBe(false);
    expect(() => session.writeFlag("flag", true)).not.toThrow();
    sessionGetter.mockRestore();
  });
  it("keeps arrangement previews unpersisted, supports cancel/save/reset, and isolates scopes", () => {
    const { result, rerender } = renderHook(({ scope }) => useDesktopLayout(scope), { initialProps: { scope: "desktop" as "desktop" | "mobile" } });
    act(() => result.current.begin());
    act(() => result.current.setPosition("champ", { x: 10, y: 20 }));
    expect(localStorage.getItem(layoutStorageKey("desktop"))).toBeNull();
    act(() => result.current.cancel());
    expect(result.current.layout).toEqual({});
    act(() => result.current.begin());
    act(() => result.current.setPosition("champ", { x: 10, y: 20 }));
    act(() => result.current.save());
    expect(JSON.parse(localStorage.getItem(layoutStorageKey("desktop"))!)).toEqual({ champ: { x: 10, y: 20 } });
    act(() => result.current.begin());
    rerender({ scope: "mobile" });
    expect(result.current.arranging).toBe(false);
    expect(result.current.layout).toEqual({});
    act(() => result.current.reset());
    expect(localStorage.getItem(layoutStorageKey("desktop"))).not.toBeNull();
  });
});
