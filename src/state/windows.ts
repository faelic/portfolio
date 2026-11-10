import type { Point, PortfolioWindow, ProjectKey, WindowKey } from "../types/portfolio";

export interface WindowState { windows: PortfolioWindow[]; nextZ: number }
export type WindowAction =
  | { type: "open"; key: WindowKey; projectKey?: ProjectKey }
  | { type: "focus" | "close" | "expand"; key: WindowKey }
  | { type: "move"; key: WindowKey; position: Point }
  | { type: "navigate"; projectKey?: ProjectKey };
export const initialWindowState: WindowState = { windows: [], nextZ: 110 };
export const topWindow = (windows: PortfolioWindow[]) => windows.reduce<PortfolioWindow | undefined>((top, item) => !top || item.zIndex > top.zIndex ? item : top, undefined);

export function windowReducer(state: WindowState, action: WindowAction): WindowState {
  if (action.type === "navigate") {
    if (action.projectKey) return windowReducer(state, { type: "open", key: `project:${action.projectKey}`, projectKey: action.projectKey });
    const windows = state.windows.filter(item => !item.projectKey);
    return windows.length === state.windows.length ? state : { ...state, windows };
  }
  const existing = state.windows.find(item => item.key === action.key);
  if (action.type === "close") return existing ? { ...state, windows: state.windows.filter(item => item.key !== action.key) } : state;
  if (action.type === "move") return { ...state, windows: state.windows.map(item => item.key === action.key ? { ...item, position: action.position } : item) };
  if (!existing && action.type !== "open") return state;
  if (action.type !== "expand" && topWindow(state.windows)?.key === action.key) return state;
  const zIndex = state.nextZ + 1;
  const windows = existing
    ? state.windows.map(item => item.key === action.key ? { ...item, zIndex, expanded: action.type === "expand" ? !item.expanded : item.expanded } : item)
    : [...state.windows, { key: action.key, projectKey: action.type === "open" ? action.projectKey : undefined, zIndex, expanded: false }];
  return { windows, nextZ: zIndex };
}
