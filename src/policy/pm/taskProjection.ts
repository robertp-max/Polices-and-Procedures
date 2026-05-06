/**
 * taskProjection — React-bound layer over taskProjectionCore.
 *
 * - Re-exports the pure projector + dev-mode duplicate guard.
 * - Adds React hooks that read CES + PM overlay state.
 *
 * Pure logic lives in taskProjectionCore.ts (no React, no store imports)
 * so it remains testable from tsx scripts.
 */

import { useMemo } from 'react';
import { REGULATORY_EVENTS } from '../data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '../stores/regulatoryExecutionStore';
import { useAutogenStore } from '../stores/autogenStore';
import { WORKFLOWS } from '../data/workflows.generated';
import { usePmOverlayStore } from './pmOverlayStore';
import { usePmPersonalStore } from './personalStore';
import { regulatoryEventOverlapsSprint, isoDateInSprint } from './sprintWindows';
import { usePmViewSprintStore } from './pmViewSprintStore';
import { projectTasks, assertNoDuplicateTaskIds, type ProjectorEvent } from './taskProjectionCore';
import type { Task } from './types';

export {
  projectTasks,
  assertNoDuplicateTaskIds,
  type ProjectorInput,
  type ProjectorEvent,
  type ProjectorEventForm,
  type ProjectorEventStep,
  type ProjectorFormState,
} from './taskProjectionCore';

/**
 * useProjectedTasks — single source of Task[] for PM surfaces.
 *
 * - **`sprint` (default):** only regulatory events overlapping the selected PM sprint
 *   (from `pmViewSprintStore`) + personal tasks with due date in that sprint — for Kanban,
 *   Gantt, Sprint board, My Tasks.
 * - **`full`:** all events (dashboards, sprint plan/review, approvals queue, etc.).
 */
export function useProjectedTasks(scope: 'full' | 'sprint' = 'sprint'): Task[] {
  const formStates = useRegulatoryExecutionStore(s => s.formStates);
  const overlays = usePmOverlayStore(s => s.overlays);
  const personal = usePmPersonalStore(s => s.tasks);
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  const scopedCesEvents = useMemo(
    () =>
      scope === 'full'
        ? allEvents
        : allEvents.filter(e => regulatoryEventOverlapsSprint(e, sprintWindow)),
    [allEvents, scope, sprintWindow.endDate, sprintWindow.id, sprintWindow.startDate],
  );

  return useMemo(() => {
    const enrichedEvents = scopedCesEvents.map((event) => ({
      ...event,
      workflowTitle: event.workflowId ? WORKFLOWS[event.workflowId]?.title ?? event.workflowId : undefined,
    }));
    const cesTasks = projectTasks({
      events: enrichedEvents as unknown as ProjectorEvent[],
      formStates,
      overlays,
    });
    const personalTasks =
      scope === 'full'
        ? Object.values(personal)
        : Object.values(personal).filter(t => {
            const due = t.due_date?.slice(0, 10);
            if (!due) return false;
            return isoDateInSprint(due, sprintWindow);
          });
    const merged = [...cesTasks, ...personalTasks];
    // Anti-duplication enforcement across CES + Personal partitions.
    if (import.meta.env?.DEV) {
      assertNoDuplicateTaskIds(merged);
    }
    return merged;
  }, [scopedCesEvents, formStates, overlays, personal, scope, sprintWindow]);
}

function findOwningEventIdForTask(taskId: string, events: { id: string }[]): string | null {
  let best: string | null = null;
  for (const e of events) {
    if (taskId.startsWith(`${e.id}-`) && (!best || e.id.length > best.length)) {
      best = e.id;
    }
  }
  return best;
}

/** Lookup helper: return a single task by id, or undefined. */
export function useProjectedTaskById(task_id: string): Task | undefined {
  const formStates = useRegulatoryExecutionStore(s => s.formStates);
  const overlays = usePmOverlayStore(s => s.overlays);
  const personal = usePmPersonalStore(s => s.tasks);
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const tasks = useProjectedTasks('sprint');

  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  return useMemo(() => {
    const hit = tasks.find(t => t.task_id === task_id);
    if (hit) return hit;
    const personalHit = Object.values(personal).find(t => t.task_id === task_id);
    if (personalHit) return personalHit;
    const evId = findOwningEventIdForTask(task_id, allEvents);
    if (!evId) return undefined;
    const event = allEvents.find(e => e.id === evId);
    if (!event) return undefined;
    const enriched = {
      ...event,
      workflowTitle: event.workflowId ? WORKFLOWS[event.workflowId]?.title ?? event.workflowId : undefined,
    };
    const projected = projectTasks({
      events: [enriched as unknown as ProjectorEvent],
      formStates,
      overlays,
    });
    return projected.find(t => t.task_id === task_id);
  }, [task_id, tasks, personal, allEvents, formStates, overlays]);
}
