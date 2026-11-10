import { MOBILE_SHORTCUT_LAYOUT, MOBILE_SHORTCUT_SLOTS, nearestMobileSlot } from "../data/mobileLayout";
import type { Point, ProjectKey } from "../types/portfolio";

export type Layout = Partial<Record<ProjectKey, Point>>;
export type LayoutScope = "desktop" | "mobile";
export const projectKeys = Object.keys(MOBILE_SHORTCUT_LAYOUT) as ProjectKey[];
export const layoutStorageKey = (scope: LayoutScope) => scope === "mobile" ? "favour.shortcut-layout.mobile.v1" : "favour.shortcut-layout.v2";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isPoint = (value: unknown): value is Point => isRecord(value) && typeof value.x === "number" && Number.isFinite(value.x) && typeof value.y === "number" && Number.isFinite(value.y);
export const isLayoutContainer = (value: unknown): value is Record<string, unknown> => isRecord(value);
export function sanitizeLayout(value: unknown, scope: LayoutScope): Layout {
  if (!isRecord(value)) return {};
  const valid: Layout = {};
  for (const key of projectKeys) {
    const point = value[key];
    if (isPoint(point)) valid[key] = { x: point.x, y: point.y };
  }
  if (scope === "desktop") return valid;
  const effective = { ...MOBILE_SHORTCUT_LAYOUT, ...valid };
  const ids = projectKeys.map(key => MOBILE_SHORTCUT_SLOTS.findIndex(slot => slot.x === effective[key].x && slot.y === effective[key].y));
  return ids.includes(-1) || new Set(ids).size !== projectKeys.length ? {} : valid;
}
export function swapMobile(layout: Layout, key: ProjectKey, point: Point, origin: Point): Layout {
  const target = nearestMobileSlot(point);
  const start = nearestMobileSlot(origin);
  const effective = { ...MOBILE_SHORTCUT_LAYOUT, ...layout, [key]: start };
  const displaced = projectKeys.find(other => other !== key && effective[other].x === target.x && effective[other].y === target.y);
  return { ...layout, [key]: target, ...(displaced ? { [displaced]: start } : {}) };
}
export function clampIcon(point: Point, width: number, height: number, iconWidth: number, iconHeight: number): Point {
  return {
    x: Math.min(Math.max(0, point.x), Math.max(0, (width - iconWidth) / width * 100)),
    y: Math.min(Math.max(0, point.y), Math.max(0, (height - iconHeight) / height * 100)),
  };
}
