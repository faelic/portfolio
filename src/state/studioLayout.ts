import type { Point, ProjectKey } from '../types/portfolio';
import { migrateLayout, sanitizeLayout, type LayoutScope } from './layout';
import { MOBILE_SHORTCUT_LAYOUT } from '../data/mobileLayout';
import { storage } from '../utils/storage';

export const studioOrder: ProjectKey[] = ['champ', 'eau', 'silences', 'revolte', 'lisiere', 'elan'];
export const orderStorageKey = (scope: LayoutScope) => scope === 'desktop' ? 'favour.shortcut-layout.v4' : 'favour.shortcut-layout.mobile.v3';
export const isProjectOrder = (value: unknown): value is ProjectKey[] => Array.isArray(value) && value.length === 6 && new Set(value).size === 6 && value.every(key => studioOrder.includes(key));
export function loadProjectOrder(scope: LayoutScope): ProjectKey[] {
  try {
    const raw = window.localStorage.getItem(orderStorageKey(scope));
    if (raw !== null) { const current: unknown = JSON.parse(raw); return isProjectOrder(current) ? current : [...studioOrder]; }
  } catch { return [...studioOrder]; }
  const previousKey = scope === 'desktop' ? 'favour.shortcut-layout.v3' : 'favour.shortcut-layout.mobile.v2';
  const previous = storage.read<unknown>(previousKey, null, (value: unknown): value is unknown => value !== undefined);
  const legacy = storage.read<unknown>(scope === 'desktop' ? 'favour.shortcut-layout.v2' : 'favour.shortcut-layout.mobile.v1', {}, (value: unknown): value is unknown => value !== undefined);
  const positions = previous !== null ? sanitizeLayout(previous, scope) : migrateLayout(legacy, scope);
  const effective = { ...MOBILE_SHORTCUT_LAYOUT, ...positions };
  return [...studioOrder].sort((a, b) => effective[a].y - effective[b].y || effective[a].x - effective[b].x || studioOrder.indexOf(a) - studioOrder.indexOf(b));
}
export function slotPoint(index: number, columns: number): Point {
  return { x: index % columns * 100 / columns, y: Math.floor(index / columns) * 100 / (6 / columns) };
}
export function swapProject(order: ProjectKey[], key: ProjectKey, point: Point, columns: number) {
  const col = Math.max(0, Math.min(columns - 1, Math.round(point.x / (100 / columns))));
  const row = Math.max(0, Math.min(6 / columns - 1, Math.round(point.y / (100 / (6 / columns)))));
  const target = row * columns + col;
  const next = [...order]; const origin = next.indexOf(key);
  [next[origin], next[target]] = [next[target], next[origin]];
  return next;
}
