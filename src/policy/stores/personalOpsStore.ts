import { create } from 'zustand';

export type PersonalOpsTab = 'controls' | 'queue' | 'calendar' | 'actions';

interface PersonalOpsState {
  isPersonalOpsOpen: boolean;
  activePersonalOpsTab: PersonalOpsTab;
  selectedPersonalOpsItemId: string | null;
  openPersonalOps: () => void;
  closePersonalOps: () => void;
  togglePersonalOps: () => void;
  setActivePersonalOpsTab: (tab: PersonalOpsTab) => void;
  selectPersonalOpsItem: (itemId: string | null) => void;
}

export const usePersonalOpsStore = create<PersonalOpsState>((set) => ({
  isPersonalOpsOpen: false,
  activePersonalOpsTab: 'controls',
  selectedPersonalOpsItemId: null,
  openPersonalOps: () => set({ isPersonalOpsOpen: true }),
  closePersonalOps: () => set({ isPersonalOpsOpen: false, selectedPersonalOpsItemId: null }),
  togglePersonalOps: () => set(state => ({
    isPersonalOpsOpen: !state.isPersonalOpsOpen,
    selectedPersonalOpsItemId: state.isPersonalOpsOpen ? null : state.selectedPersonalOpsItemId,
  })),
  setActivePersonalOpsTab: activePersonalOpsTab => set({ activePersonalOpsTab }),
  selectPersonalOpsItem: selectedPersonalOpsItemId => set({ selectedPersonalOpsItemId }),
}));
