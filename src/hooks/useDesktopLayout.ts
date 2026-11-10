import { useCallback, useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { isLayoutContainer, layoutStorageKey, sanitizeLayout, swapMobile, type Layout, type LayoutScope } from "../state/layout";
import type { Point, ProjectKey } from "../types/portfolio";

const load = (scope: LayoutScope) => sanitizeLayout(storage.read<unknown>(layoutStorageKey(scope), {}, isLayoutContainer), scope);
export function useDesktopLayout(scope: LayoutScope = "desktop") {
  const [saved, setSaved] = useState<Layout>(() => load(scope));
  const [draft, setDraft] = useState<Layout | null>(null);
  useEffect(() => { setSaved(load(scope)); setDraft(null); }, [scope]);
  const persist = useCallback((next: Layout) => {
    setSaved(next);
    if (Object.keys(next).length) storage.write(layoutStorageKey(scope), next);
    else storage.remove(layoutStorageKey(scope));
  }, [scope]);
  const setPosition = (key: ProjectKey, point: Point) => {
    if (draft !== null) setDraft(current => ({ ...current, [key]: point }));
    else persist({ ...saved, [key]: point });
  };
  const previewPosition = (key: ProjectKey, point: Point) => setDraft(current => ({ ...(current ?? saved), [key]: point }));
  const commitPosition = (key: ProjectKey, point: Point, origin: Point) => {
    const current = draft ?? saved;
    const next = scope === "mobile" ? swapMobile(current, key, point, origin) : { ...current, [key]: point };
    if (draft !== null) setDraft(next); else persist(next);
  };
  const reset = () => { if (draft !== null) setDraft({}); else persist({}); };
  const begin = () => setDraft(current => current ?? { ...saved });
  const cancel = () => setDraft(null);
  const save = () => { if (draft !== null) persist(draft); setDraft(null); };
  const layout = draft ?? saved;
  return { layout, changed: Object.keys(layout).length > 0, arranging: draft !== null, begin, cancel, save, setPosition, previewPosition, commitPosition, reset };
}
