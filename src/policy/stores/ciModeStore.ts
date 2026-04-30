import { create } from 'zustand';

/**
 * Care Indeed UI Mode store — Light vs Dark.
 *
 * IMPORTANT — separation of concerns:
 *   • Brand toggle (CI-ION ↔ Care Indeed) lives in `useShellStore.theme`
 *     and is owned by the logo click in CommandCenterLayout. DO NOT move
 *     that here, and DO NOT touch it from this store.
 *   • This store ONLY controls the Care Indeed Light/Dark mode and is
 *     ignored when brand = CI-ION (the CSS rule keys off both attributes).
 *
 * Persistence: localStorage key `ci-care-indeed-mode`, default `light`.
 * Applied to <html data-ci-mode="...">.
 */

export type CiMode = 'light' | 'dark';

const STORAGE_KEY = 'ci-care-indeed-mode';

function readInitial(): CiMode {
  if (typeof window === 'undefined') return 'light';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'dark' ? 'dark' : 'light';
}

interface CiModeState {
  mode: CiMode;
  setMode: (m: CiMode) => void;
  toggleMode: () => void;
}

export const useCiModeStore = create<CiModeState>(set => ({
  mode: readInitial(),
  setMode: (m: CiMode) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, m);
    }
    set({ mode: m });
  },
  toggleMode: () =>
    set(s => {
      const next: CiMode = s.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      return { mode: next };
    }),
}));
