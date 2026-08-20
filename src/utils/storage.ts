export const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const value = window.localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable in private browsing; the interface still works in-memory.
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Intentionally non-fatal.
    }
  },
};
