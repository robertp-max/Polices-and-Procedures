/* Time-of-day theme for the Brad workspace.
   Noon is the original/default look (unchanged). Morning (AM), Afternoon, and
   Night are additional palettes. The selection is stored on
   document.documentElement[data-tod] and persisted in localStorage; the Brad
   workspace reads the resulting CSS variables (see index.css). Scoped to Brad —
   other pages are unaffected. */

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'night';

export const TOD_ORDER: TimeOfDay[] = ['morning', 'noon', 'afternoon', 'night'];

export const TOD_LABEL: Record<TimeOfDay, string> = {
  morning: 'Morning',
  noon: 'Noon',
  afternoon: 'Afternoon',
  night: 'Night',
};

const LS_KEY = 'ci.brad.tod';

export function getTheme(): TimeOfDay {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('data-tod') as TimeOfDay | null;
    if (attr && TOD_ORDER.includes(attr)) return attr;
  }
  try {
    const v = localStorage.getItem(LS_KEY) as TimeOfDay | null;
    if (v && TOD_ORDER.includes(v)) return v;
  } catch { /* ignore */ }
  return 'noon';
}

export function applyTheme(t: TimeOfDay): void {
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-tod', t);
  try { localStorage.setItem(LS_KEY, t); } catch { /* ignore */ }
}

export function cycleTheme(): TimeOfDay {
  const cur = getTheme();
  const next = TOD_ORDER[(TOD_ORDER.indexOf(cur) + 1) % TOD_ORDER.length];
  applyTheme(next);
  return next;
}

/** Call once at app start to restore the saved theme (default noon). */
export function initTheme(): void {
  applyTheme(getTheme());
}
