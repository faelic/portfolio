import type { Point, ProjectKey } from "../types/portfolio";

export const MOBILE_SHORTCUT_LAYOUT: Record<ProjectKey, Point> = {
  champ: { x: 0, y: 0 },
  eau: { x: 100 / 3, y: 0 },
  silences: { x: 200 / 3, y: 0 },
  revolte: { x: 0, y: 50 },
  lisiere: { x: 100 / 3, y: 50 },
  elan: { x: 200 / 3, y: 50 },
};

export const MOBILE_SHORTCUT_SLOTS = Object.values(MOBILE_SHORTCUT_LAYOUT);

export function nearestMobileSlot(point: Point) {
  return MOBILE_SHORTCUT_SLOTS.reduce((nearest, candidate) => {
    const candidateDistance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    const nearestDistance = Math.hypot(nearest.x - point.x, nearest.y - point.y);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}
