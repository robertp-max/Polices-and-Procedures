import { create } from 'zustand';

interface AuditorModeState {
  enabled: boolean;
  toggle: () => void;
}

export const useAuditorModeStore = create<AuditorModeState>(set => ({
  enabled: false,
  toggle: () => set(state => ({ enabled: !state.enabled })),
}));
