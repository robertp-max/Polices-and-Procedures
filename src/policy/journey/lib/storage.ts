// Tiny, dependency-free localStorage wrapper for MVP persistence.
// No backend. Safe no-ops if storage is unavailable (private mode, SSR, etc.).

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    // Shallow-merge so newly added fields always have defaults.
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && typeof fallback === "object") {
      return { ...(fallback as object), ...(parsed as object) } as T;
    }
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / unavailable storage */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
