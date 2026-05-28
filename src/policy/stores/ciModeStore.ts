import { create } from 'zustand';

/**
 * V3-only UI mode store.
 *
 * IMPORTANT — separation of concerns:
 * The historical store remains so existing selectors keep working, but the
 * production design no longer has a light/dark branch. V4 can add a normal
 * mode on top of the V3 token contract later.
 *
 * Persistence: localStorage key `ci-care-indeed-mode`, default `v3`.
 * Applied to <html data-ci-mode="...">.
 */

export type CiMode = 'v3' | 'light' | 'dark';

const STORAGE_KEY = 'ci-care-indeed-mode';

function readInitial(): CiMode {
  if (typeof window === 'undefined') return 'v3';
  window.localStorage.setItem(STORAGE_KEY, 'v3');
  return 'v3';
}

interface CiModeState {
  mode: CiMode;
  setMode: (m: CiMode) => void;
  toggleMode: () => void;
}

export const useCiModeStore = create<CiModeState>(set => ({
  mode: readInitial(),
  setMode: (_m: CiMode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'v3');
    }
    set({ mode: 'v3' });
  },
  toggleMode: () =>
    set(() => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, 'v3');
      }
      return { mode: 'v3' };
    }),
}));
