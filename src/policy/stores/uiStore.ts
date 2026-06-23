import { create } from 'zustand';

export type SortField =
  | 'id'
  | 'title'
  | 'ownerSteward'
  | 'reviewCycle'
  | 'lifecycleStatus';

interface UiState {
  search: string;
  selectedDomain: string;
  selectedSubdomain: string;
  selectedTier: string;
  selectedStatus: string;
  selectedAccessTier: string;
  sortField: SortField;
  setFilter: (key: 'search' | 'selectedDomain' | 'selectedSubdomain' | 'selectedTier' | 'selectedStatus' | 'selectedAccessTier', value: string) => void;
  setSortField: (field: SortField) => void;
  resetFilters: () => void;
}

const defaultState = {
  search: '',
  selectedDomain: 'ALL',
  selectedSubdomain: 'ALL',
  selectedTier: 'ALL',
  selectedStatus: 'ALL',
  selectedAccessTier: 'ALL',
  sortField: 'id' as SortField,
};

export const useUiStore = create<UiState>(set => ({
  ...defaultState,
  setFilter: (key, value) => set({ [key]: value } as Partial<UiState>),
  setSortField: sortField => set({ sortField }),
  resetFilters: () => set({ ...defaultState }),
}));

/* ═══════════════════════════════════════════════════════════════
   Shell / Chrome state — controls when the shell header is hidden
   so that detail views (opened policies / forms) can take up the
   entire glass canvas.

   Theme axis (app-shell only):
     • 'v3-veil'           → dark V3 (DEFAULT)
     • 'care-indeed-light' → Day / Normal soft-teal mode

   The legacy 'ci-ion-dark' value is kept in the union for back-compat
   but is folded into 'v3-veil' (both are dark). Auth pages are NOT
   themed by this store — they render outside CommandCenterLayout and
   are forced to the dark shell theme in App.tsx (see PublicAuthRoute).

   Persistence: localStorage key `ci-shell-theme`. Applied to
   <html data-theme="..."> by CommandCenterLayout. Default 'v3-veil'.
   ═══════════════════════════════════════════════════════════════ */
export type ShellTheme = 'v3-veil' | 'ci-ion-dark' | 'care-indeed-light';

const SHELL_THEME_KEY = 'ci-shell-theme';

/** Collapse any stored/legacy value onto the two supported shell themes. */
function normalizeShellTheme(value: string | null | undefined): ShellTheme {
  return value === 'care-indeed-light' ? 'care-indeed-light' : 'v3-veil';
}

function readInitialShellTheme(): ShellTheme {
  if (typeof window === 'undefined') return 'v3-veil';
  return normalizeShellTheme(window.localStorage.getItem(SHELL_THEME_KEY));
}

function persistShellTheme(theme: ShellTheme) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SHELL_THEME_KEY, theme);
  }
}

interface ShellState {
  detailMode: boolean;
  theme: ShellTheme;
  setDetailMode: (v: boolean) => void;
  setTheme: (t: ShellTheme) => void;
  toggleTheme: () => void;
}

/** Runs the theme mutator inside a View Transition (or with a
 *  class-based transition fallback) so the swap is smooth and applies
 *  immediately without a page refresh. */
function runThemeSwap(mutate: () => void) {
  if (typeof document === 'undefined') {
    mutate();
    return;
  }
  const root = document.documentElement;
  const withClassFallback = () => {
    root.classList.add('ci-theme-transitioning');
    mutate();
    window.setTimeout(() => root.classList.remove('ci-theme-transitioning'), 550);
  };
  // View Transitions API (Chromium 111+, Safari TP, Firefox behind flag)
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(mutate);
  } else {
    withClassFallback();
  }
}

export const useShellStore = create<ShellState>((set, get) => ({
  detailMode: false,
  theme: readInitialShellTheme(),
  setDetailMode: v => set({ detailMode: v }),
  setTheme: t =>
    runThemeSwap(() => {
      const next = normalizeShellTheme(t);
      persistShellTheme(next);
      set({ theme: next });
    }),
  toggleTheme: () =>
    runThemeSwap(() => {
      const next: ShellTheme = get().theme === 'care-indeed-light' ? 'v3-veil' : 'care-indeed-light';
      persistShellTheme(next);
      set({ theme: next });
    }),
}));

/** Standardized selector hook for light (care-indeed-light) vs dark (v3-veil) mode.
 *  Use this (or direct `useShellStore(s => s.theme === 'care-indeed-light')`) everywhere
 *  to avoid drift between `isLight` / `isLightMode` naming across calendar + swimlane. */
export const useIsLight = () => useShellStore(s => s.theme === 'care-indeed-light');
export const useIsLightMode = useIsLight; // alias for legacy / MasterCalendar consistency

