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
  bradLanding: boolean;
  bradActivityActive: boolean;
  setFilter: (key: 'search' | 'selectedDomain' | 'selectedSubdomain' | 'selectedTier' | 'selectedStatus' | 'selectedAccessTier', value: string) => void;
  setSortField: (field: SortField) => void;
  setBradLanding: (v: boolean) => void;
  setBradActivityActive: (v: boolean) => void;
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
  bradLanding: true,
  bradActivityActive: false,
};

export const useUiStore = create<UiState>(set => ({
  ...defaultState,
  setFilter: <K extends keyof UiState>(key: K, value: UiState[K]) =>
    set({ [key]: value } as Pick<UiState, K>),
  setSortField: sortField => set({ sortField }),
  setBradLanding: bradLanding => set({ bradLanding }),
  setBradActivityActive: bradActivityActive => set({ bradActivityActive }),
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

/** Apply theme changes directly; view transitions are disabled globally. */
function runThemeSwap(mutate: () => void) {
  mutate();
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

