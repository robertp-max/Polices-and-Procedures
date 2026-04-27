/**
 * useSelectedTaskStore — single source of "currently focused task" across
 * Event View, Gantt, Kanban, Sprint Board, and My Tasks.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Unified-Task-Model.md §3
 *
 * The PM views are pure projections of the canonical task model; this store
 * holds ONLY the selected task_id and the originating view (for telemetry).
 * It does not duplicate task data — consumers always look the task up via
 * `useProjectedTaskById(id)`.
 */

import { create } from 'zustand';

export type TaskOpenSource =
  | 'calendar'
  | 'gantt'
  | 'kanban'
  | 'sprint'
  | 'my-tasks'
  | 'approvals'
  | 'dashboard'
  | 'event'
  | 'other';

interface SelectedTaskState {
  taskId: string | null;
  openedFrom: TaskOpenSource | null;
  openedAt: string | null;

  openTask: (taskId: string, source?: TaskOpenSource) => void;
  closeTask: () => void;
}

export const useSelectedTaskStore = create<SelectedTaskState>((set) => ({
  taskId: null,
  openedFrom: null,
  openedAt: null,

  openTask: (taskId, source = 'other') =>
    set({ taskId, openedFrom: source, openedAt: new Date().toISOString() }),
  closeTask: () => set({ taskId: null, openedFrom: null, openedAt: null }),
}));

/** Convenience selector hook. */
export function useSelectedTaskId(): string | null {
  return useSelectedTaskStore(s => s.taskId);
}
