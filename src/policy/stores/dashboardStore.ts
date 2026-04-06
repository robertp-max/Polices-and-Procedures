import { create } from 'zustand';

interface DashboardState {
  selectedMetric: string | null;
  setSelectedMetric: (metric: string | null) => void;
  splitViewTaskId: string | null;
  openUrgentTaskSplitView: (taskId: string) => void;
}

export const useDashboardStore = create<DashboardState>(set => ({
  selectedMetric: null,
  splitViewTaskId: null,
  setSelectedMetric: selectedMetric => set({ selectedMetric }),
  openUrgentTaskSplitView: splitViewTaskId => set({ splitViewTaskId }),
}));
