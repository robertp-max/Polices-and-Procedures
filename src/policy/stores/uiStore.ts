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
  setFilter: (key: keyof Omit<UiState, 'setFilter' | 'resetFilters'>, value: string) => void;
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
  setFilter: (key, value) => set({ [key]: value } as unknown as Pick<UiState, keyof UiState>),
  setSortField: sortField => set({ sortField }),
  resetFilters: () => set({ ...defaultState }),
}));
