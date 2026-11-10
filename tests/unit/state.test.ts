import { describe, expect, it } from "vitest";
import { initialWindowState, topWindow, windowReducer } from "../../src/state/windows";
import { clampIcon, sanitizeLayout, swapMobile } from "../../src/state/layout";
import { MOBILE_SHORTCUT_LAYOUT } from "../../src/data/mobileLayout";
import { hashToProject, projectList, projectToHash } from "../../src/data/projects";

describe("window navigation", () => {
  it("preserves stacked instances and expansion while duplicate events are idempotent", () => {
    let state = windowReducer(initialWindowState, { type: "open", key: "project:champ", projectKey: "champ" });
    state = windowReducer(state, { type: "expand", key: "project:champ" });
    state = windowReducer(state, { type: "navigate", projectKey: "silences" });
    state = windowReducer(state, { type: "navigate", projectKey: "champ" });
    expect(state.windows).toHaveLength(2);
    expect(topWindow(state.windows)).toMatchObject({ key: "project:champ", expanded: true });
    expect(windowReducer(state, { type: "navigate", projectKey: "champ" })).toBe(state);
  });
  it("clears project windows on empty/invalid navigation and retains apps", () => {
    let state = windowReducer(initialWindowState, { type: "open", key: "about" });
    state = windowReducer(state, { type: "open", key: "project:champ", projectKey: "champ" });
    state = windowReducer(state, { type: "open", key: "notes" });
    state = windowReducer(state, { type: "navigate" });
    expect(state.windows.map(window => window.key)).toEqual(["about", "notes"]);
    expect(windowReducer(state, { type: "focus", key: "notes" })).toBe(state);
  });
  it("keeps six explicit hashes independent of title changes", () => {
    for (const project of projectList) expect(hashToProject(projectToHash(project.key).toUpperCase())).toBe(project.key);
    expect(projectToHash("eau")).toBe("#policyng");
    expect(hashToProject("#unknown")).toBeUndefined();
  });
});
describe("saved icon layouts", () => {
  it.each([null, [], "wrong", 42])("rejects invalid containers %s", value => expect(sanitizeLayout(value, "desktop")).toEqual({}));
  it("drops unknown/nonfinite points and bounds valid desktop coordinates to geometry", () => {
    expect(sanitizeLayout({ champ: { x: 800, y: -10 }, eau: { x: NaN, y: 2 }, fake: { x: 2, y: 2 } }, "desktop")).toEqual({ champ: { x: 800, y: -10 } });
    expect(clampIcon({ x: 800, y: -10 }, 1000, 500, 120, 100)).toEqual({ x: 88, y: 0 });
  });
  it("accepts a permutation, rejects collisions and non-slot mobile records", () => {
    const swapped = swapMobile({}, "champ", MOBILE_SHORTCUT_LAYOUT.silences, MOBILE_SHORTCUT_LAYOUT.champ);
    expect(sanitizeLayout(swapped, "mobile")).toEqual(swapped);
    expect(swapped.silences).toEqual(MOBILE_SHORTCUT_LAYOUT.champ);
    expect(sanitizeLayout({ champ: MOBILE_SHORTCUT_LAYOUT.silences }, "mobile")).toEqual({});
    expect(sanitizeLayout({ champ: { x: 6, y: 27 } }, "mobile")).toEqual({});
  });
});
