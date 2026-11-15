import { MOBILE_SHORTCUT_LAYOUT, MOBILE_SHORTCUT_SLOTS, nearestMobileSlot } from "../data/mobileLayout";
import type { Point, ProjectKey } from "../types/portfolio";

export type Layout = Partial<Record<ProjectKey, Point>>;
export type LayoutScope = "desktop" | "mobile";
export const projectKeys = Object.keys(MOBILE_SHORTCUT_LAYOUT) as ProjectKey[];
export const layoutStorageKey = (scope: LayoutScope) => scope === "mobile" ? "favour.shortcut-layout.mobile.v2" : "favour.shortcut-layout.v3";
export const legacyLayoutKey = (scope: LayoutScope) => scope === "mobile" ? "favour.shortcut-layout.mobile.v1" : "favour.shortcut-layout.v2";
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isPoint = (value: unknown): value is Point => isRecord(value) && typeof value.x === "number" && Number.isFinite(value.x) && typeof value.y === "number" && Number.isFinite(value.y);
export const isLayoutContainer = (value: unknown): value is Record<string, unknown> => isRecord(value);
export function migrateLayout(value: unknown, scope: LayoutScope): Layout {
  if (!isRecord(value) || !Object.keys(value).length) return {};
  if (scope === "desktop") {
    const valid = sanitizeLayout(value, scope);
    if (!Object.keys(valid).length) return {};
    const available = [...MOBILE_SHORTCUT_SLOTS];
    const next: Layout = {};
    // Preserve the spatial intent, but resolve new-region collisions during the
    // one-time migration. Subsequent desktop arrangement remains freely movable.
    const ordered = [...projectKeys.filter(key => valid[key]), ...projectKeys.filter(key => !valid[key])];
    for (const key of ordered) {
      const old = valid[key];
      const point = old ? { x: Math.max(0, Math.min(200 / 3, old.x / 88 * (200 / 3))), y: Math.max(0, Math.min(50, old.y / 86.5 * 50)) } : MOBILE_SHORTCUT_LAYOUT[key];
      available.sort((a, b) => Math.hypot(a.x - point.x, a.y - point.y) - Math.hypot(b.x - point.x, b.y - point.y));
      next[key] = available.shift()!;
    }
    return next;
  }
  const oldDefaults: Record<ProjectKey, Point> = { champ: { x: 4, y: 27 }, silences: { x: 36, y: 27 }, revolte: { x: 68, y: 27 }, lisiere: { x: 4, y: 54 }, eau: { x: 36, y: 54 }, elan: { x: 68, y: 54 } };
  const oldSlots = Object.values(oldDefaults);
  const nextSlots = MOBILE_SHORTCUT_SLOTS;
  const next: Layout = {};
  for (const key of projectKeys) {
    const point = value[key] ?? oldDefaults[key];
    if (!isPoint(point)) return {};
    const slot = oldSlots.findIndex(candidate => candidate.x === point.x && candidate.y === point.y);
    if (slot < 0) return {};
    next[key] = nextSlots[slot];
  }
  return sanitizeLayout(next, scope);
}
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
