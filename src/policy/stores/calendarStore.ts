import { create } from 'zustand';
import { loadFrameworkSeed } from '@/policy/adapters/frameworkSeedAdapter';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { guardCannotModifyInAuditorMode } from '@/policy/utils/lifecycleGuards';
import type { AuditTrailEvent, CalendarTask } from '@/policy/types';

const seed = loadFrameworkSeed();

interface CalendarState {
  tasks: CalendarTask[];
  auditEvents: AuditTrailEvent[];
  overrideTaskSchedule: (taskId: string, reason: string, actor: string, nextDate: string) => { ok: boolean; message: string };
}

export const useCalendarStore = create<CalendarState>(set => ({
  tasks: seed.calendarTasks,
  auditEvents: [],
  overrideTaskSchedule: (taskId, reason, actor, nextDate) => {
    const guard = guardCannotModifyInAuditorMode(useAuditorModeStore.getState().enabled);
    if (!guard.ok) {
      return { ok: false, message: guard.message };
    }

    set(state => ({
      tasks: state.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              nextDate,
              overrideHistory: [
                `${new Date().toISOString()} | ${actor} | ${reason} | ${nextDate}`,
                ...task.overrideHistory,
              ],
            }
          : task,
      ),
      auditEvents: [
        {
          id: `CAL-AUD-${state.auditEvents.length + 1}`,
          entityType: 'CalendarTask',
          entityId: taskId,
          action: 'ScheduleOverride',
          actor,
          timestamp: new Date().toISOString(),
          reason,
          payload: { nextDate },
        },
        ...state.auditEvents,
      ],
    }));
    return { ok: true, message: 'Schedule override applied.' };
  },
}));
