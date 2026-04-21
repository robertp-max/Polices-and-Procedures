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
   ═══════════════════════════════════════════════════════════════ */
export type ShellTheme = 'ci-ion-dark' | 'care-indeed-light';

interface ShellState {
  detailMode: boolean;
  theme: ShellTheme;
  setDetailMode: (v: boolean) => void;
  setTheme: (t: ShellTheme) => void;
  toggleTheme: () => void;
}

/** Runs the theme mutator inside a View Transition (or with a
 *  500ms class-based transition fallback) so the swap between
 *  CI-ION dark and Care Indeed light crossfades smoothly. */
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

export const useShellStore = create<ShellState>(set => ({
  detailMode: false,
  theme:
    (typeof window !== 'undefined'
      ? (window.localStorage.getItem('ci-shell-theme') as ShellTheme | null)
      : null) || 'ci-ion-dark',
  setDetailMode: v => set({ detailMode: v }),
  setTheme: t =>
    runThemeSwap(() => {
      if (typeof window !== 'undefined') window.localStorage.setItem('ci-shell-theme', t);
      set({ theme: t });
    }),
  toggleTheme: () =>
    runThemeSwap(() => {
      const current = (typeof window !== 'undefined'
        ? (window.localStorage.getItem('ci-shell-theme') as ShellTheme | null)
        : null) || 'ci-ion-dark';
      const next: ShellTheme = current === 'ci-ion-dark' ? 'care-indeed-light' : 'ci-ion-dark';
      if (typeof window !== 'undefined') window.localStorage.setItem('ci-shell-theme', next);
      set({ theme: next });
    }),
}));

