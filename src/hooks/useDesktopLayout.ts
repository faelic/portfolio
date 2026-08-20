import { useCallback, useEffect, useMemo, useState } from "react";
import { MOBILE_SHORTCUT_LAYOUT, nearestMobileSlot } from "../data/mobileLayout";
import type { Point, ProjectKey } from "../types/portfolio";
import { storage } from "../utils/storage";

const DESKTOP_KEY = "favour.shortcut-layout.v2";
const MOBILE_KEY = "favour.shortcut-layout.mobile.v1";
type Layout = Partial<Record<ProjectKey, Point>>;
type LayoutScope = "desktop" | "mobile";

export function useDesktopLayout(scope: LayoutScope = "desktop") {
  const key = scope === "mobile" ? MOBILE_KEY : DESKTOP_KEY;
  const [layout, setLayout] = useState<Layout>(() => storage.read<Layout>(key, {}));
  const changed = useMemo(() => Object.keys(layout).length > 0, [layout]);

  useEffect(() => setLayout(storage.read<Layout>(key, {})), [key]);

  const setPosition = useCallback((key: ProjectKey, point: Point) => {
    setLayout((current) => {
      const next = { ...current, [key]: point };
      storage.write(scope === "mobile" ? MOBILE_KEY : DESKTOP_KEY, next);
      return next;
    });
  }, [scope]);

  const previewPosition = useCallback((projectKey: ProjectKey, point: Point) => {
    setLayout((current) => ({ ...current, [projectKey]: point }));
  }, []);

  const commitPosition = useCallback((projectKey: ProjectKey, point: Point, origin: Point) => {
    setLayout((current) => {
      if (scope !== "mobile") {
        const next = { ...current, [projectKey]: point };
        storage.write(DESKTOP_KEY, next);
        return next;
      }

      const target = nearestMobileSlot(point);
      const originSlot = nearestMobileSlot(origin);
      const effectiveLayout = { ...MOBILE_SHORTCUT_LAYOUT, ...current, [projectKey]: originSlot };
      const displaced = (Object.keys(effectiveLayout) as ProjectKey[]).find((key) => {
        if (key === projectKey) return false;
        const position = effectiveLayout[key];
        return Math.abs(position.x - target.x) < 0.1 && Math.abs(position.y - target.y) < 0.1;
      });
      const next = { ...current, [projectKey]: target };
      if (displaced) next[displaced] = originSlot;
      storage.write(MOBILE_KEY, next);
      return next;
    });
  }, [scope]);

  const reset = useCallback(() => {
    storage.remove(key);
    setLayout({});
  }, [key]);

  return { layout, changed, setPosition, previewPosition, commitPosition, reset };
}
