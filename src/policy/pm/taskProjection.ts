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
 * useProjectedTasks — single source of Task[] for ALL PM views.
 * Memoized by snapshot identities of CES form-state map + overlay map.
 *
 * Returns a merged list of:
 *   - CES-projected tasks (deterministic from regulatoryEvents + formStates)
 *   - PM personal tasks (owned by users, written via personalStore)
 */
export function useProjectedTasks(): Task[] {
  const formStates = useRegulatoryExecutionStore(s => s.formStates);
  const overlays = usePmOverlayStore(s => s.overlays);
  const personal = usePmPersonalStore(s => s.tasks);
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  return useMemo(() => {
    const enrichedEvents = allEvents.map((event) => ({
      ...event,
      workflowTitle: event.workflowId ? WORKFLOWS[event.workflowId]?.title ?? event.workflowId : undefined,
    }));
    const cesTasks = projectTasks({
      events: enrichedEvents as unknown as ProjectorEvent[],
      formStates,
      overlays,
    });
    const personalTasks = Object.values(personal);
    const merged = [...cesTasks, ...personalTasks];
    // Anti-duplication enforcement across CES + Personal partitions.
    if (import.meta.env?.DEV) {
      assertNoDuplicateTaskIds(merged);
    }
    return merged;
  }, [allEvents, formStates, overlays, personal]);
}

/** Lookup helper: return a single task by id, or undefined. */
export function useProjectedTaskById(task_id: string): Task | undefined {
  const tasks = useProjectedTasks();
  return useMemo(() => tasks.find(t => t.task_id === task_id), [tasks, task_id]);
}
