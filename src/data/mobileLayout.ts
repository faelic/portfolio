import type { Point, ProjectKey } from "../types/portfolio";

export const MOBILE_SHORTCUT_LAYOUT: Record<ProjectKey, Point> = {
  champ: { x: 4, y: 27 },
  silences: { x: 36, y: 27 },
  revolte: { x: 68, y: 27 },
  lisiere: { x: 4, y: 54 },
  eau: { x: 36, y: 54 },
  elan: { x: 68, y: 54 },
};

export const MOBILE_SHORTCUT_SLOTS = Object.values(MOBILE_SHORTCUT_LAYOUT);

export function nearestMobileSlot(point: Point) {
  return MOBILE_SHORTCUT_SLOTS.reduce((nearest, candidate) => {
    const candidateDistance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    const nearestDistance = Math.hypot(nearest.x - point.x, nearest.y - point.y);
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}
