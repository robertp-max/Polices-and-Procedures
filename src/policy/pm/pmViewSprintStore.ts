/**
 * Global PM sprint selection for task-heavy views (Kanban, Gantt, Sprint board,
 * CES board, My Tasks). Defaults to the sprint covering the app demo "today".
 */
import { create } from 'zustand';
import { TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import { currentSprint, type SprintWindow } from './sprintWindows';

interface PmViewSprintState {
  window: SprintWindow;
  setWindow: (window: SprintWindow) => void;
  resetToCurrent: () => void;
}

export const usePmViewSprintStore = create<PmViewSprintState>((set) => ({
  window: currentSprint(TODAY_ANCHOR),
  setWindow: (window) => set({ window }),
  resetToCurrent: () => set({ window: currentSprint(TODAY_ANCHOR) }),
}));
