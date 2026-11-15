import { useEffect, useState } from 'react';
import { storage } from '../utils/storage';
import { loadProjectOrder, orderStorageKey, slotPoint, studioOrder, swapProject } from '../state/studioLayout';
import type { Layout, LayoutScope } from '../state/layout';
import type { Point, ProjectKey } from '../types/portfolio';

export function useDesktopLayout(scope: LayoutScope = 'desktop', columns = 3) {
  const [saved, setSaved] = useState(() => loadProjectOrder(scope));
  const [draft, setDraft] = useState<ProjectKey[] | null>(null);
  const [drag, setDrag] = useState<{ key: ProjectKey; point: Point } | null>(null);
  const [undoOrder, setUndoOrder] = useState<ProjectKey[] | null>(null);
  useEffect(() => { if (!undoOrder) return; const timer = window.setTimeout(() => setUndoOrder(null), 8000); return () => clearTimeout(timer); }, [undoOrder]);
  useEffect(() => {
    const next = loadProjectOrder(scope);
    setSaved(next); setDraft(null); setDrag(null); setUndoOrder(null);
    storage.write(orderStorageKey(scope), next);
  }, [scope]);
  useEffect(() => { setDrag(null); }, [columns]);
  const persist = (order: ProjectKey[]) => { setUndoOrder(null); setSaved(order); storage.write(orderStorageKey(scope), order); };
  const order = draft ?? saved;
  const layout: Layout = Object.fromEntries(order.map((key, i) => [key, slotPoint(i, columns)]));
  if (drag) layout[drag.key] = drag.point;
  const previewPosition = (key: ProjectKey, point: Point) => setDrag({ key, point });
  const commitPosition = (key: ProjectKey, point: Point) => {
    const next = swapProject(order, key, point, columns);
    if (draft) setDraft(next); else persist(next);
    setDrag(null);
  };
  return {
    canUndo: undoOrder !== null, undo: () => { if (undoOrder) persist(undoOrder); },
    order, layout, changed: order.some((key, i) => key !== studioOrder[i]), arranging: draft !== null,
    begin: () => setDraft(current => current ?? [...saved]),
    cancel: () => { setDraft(null); setDrag(null); },
    save: () => { if (draft) persist(draft); setDraft(null); setDrag(null); },
    reset: () => { if (draft) setDraft([...studioOrder]); else { const previous = [...saved]; persist([...studioOrder]); setUndoOrder(previous); } setDrag(null); },
    setPosition: previewPosition, previewPosition, commitPosition,
  };
}
