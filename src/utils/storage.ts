type Validator<T> = (value: unknown) => value is T;
export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

// Even obtaining a browser store can throw; keep access inside the guard.
export const storage = {
  read<T>(key: string, fallback: T, validate: Validator<T>): T {
    try {
      const raw = window.localStorage.getItem(key);
      const value: unknown = raw === null ? undefined : JSON.parse(raw);
      return validate(value) ? value : fallback;
    } catch { return fallback; }
  },
  write<T>(key: string, value: T) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; /* In-memory state remains usable. */ }
  },
  remove(key: string) {
    try { window.localStorage.removeItem(key); } catch { /* Optional persistence. */ }
  },
};
export const session = {
  flag(key: string, fallback = false): boolean {
    try {
      const value = window.sessionStorage.getItem(key);
      return value === "true" ? true : value === "false" ? false : fallback;
    } catch { return fallback; }
  },
  writeFlag(key: string, value: boolean) {
    try { window.sessionStorage.setItem(key, String(value)); } catch { /* Optional persistence. */ }
  },
};
