/**
 * taskProjection — React-bound layer over taskProjectionCore.
 *
 * - Re-exports the pure projector + dev-mode duplicate guard.
 * - Adds React hooks that read CES + PM overlay state.
 *
 * Pure logic lives in taskProjectionCore.ts (no React, no store imports)
 * so it remains testable from tsx scripts.
 */
// @ts-nocheck -- policy preserved headless (designless baseline skips full checking)

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
  const rawStepStates = useRegulatoryExecutionStore(s => s.stepStates);
  const signerTasksByFormInstanceId = useRegulatoryExecutionStore(s => s.signerTasksByFormInstanceId);
  const overlays = usePmOverlayStore(s => s.overlays);
  const personal = usePmPersonalStore(s => s.tasks);
  const generatedEvents = useAutogenStore(s => s.generatedEvents);
  const triggeredEvents = useAutogenStore(s => s.triggeredEvents);
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const { id: sprintId, startDate, endDate } = sprintWindow;
  const stepStates = useMemo(
    () => Object.fromEntries(Object.entries(rawStepStates).map(([k, v]) => [k, v.status])),
    [rawStepStates],
  );
  const allEvents = useMemo(
    () => [...REGULATORY_EVENTS, ...generatedEvents, ...triggeredEvents].filter(e => !e.isContext),
    [generatedEvents, triggeredEvents],
  );

  const scopedCesEvents = useMemo(
    () =>
      scope === 'full'
        ? allEvents
        : allEvents.filter(e => regulatoryEventOverlapsSprint(e, sprintWindow)),
    [allEvents, scope, sprintId, startDate, endDate],
  );

  return useMemo(() => {
    const enrichedEvents = scopedCesEvents.map((event) => ({
      ...event,
      workflowTitle: event.workflowId ? WORKFLOWS[event.workflowId]?.title ?? event.workflowId : undefined,
    }));
    const cesTasks = projectTasks({
      events: enrichedEvents as unknown as ProjectorEvent[],
      formStates,
      stepStates,
      overlays,
    });

    // Inject pending signer tasks from the multi-signer store as NonFormCesTask entries
    const signerPmTasks: Task[] = [];
    for (const [, tasks] of Object.entries(signerTasksByFormInstanceId)) {
      for (const stRaw of tasks) {
        const st: any = stRaw;
        if (st.status !== 'pending') continue;
        const existingIds = new Set(cesTasks.map(t => t.task_id));
        if (existingIds.has(st.taskId)) continue;

        const pmStatus: import('./types').PmTaskStatus = st.status === 'pending' ? 'todo' : 'done';
        const event = allEvents.find(e => e.id === st.eventId);
        signerPmTasks.push({
          task_id: st.taskId,
          source: 'CES' as const,
          task_type: 'form_completion' as const,
          event_id: st.eventId,
          event_title: event?.title || st.eventId,
          workflow_id: event?.workflowId || '',
          workflow_title: '',
          policy_refs: st.linkedPolicyIds,
          form_refs: [st.formId],
          generated_form_instance_ids: [st.formInstanceId],
          source_form_id: st.formId,
          priority: 'high' as const,
          risk: 'high' as const,
          blockers: [],
          step_id: st.slotFieldId,
          title: `eCIgn Signature Required — Signer ${st.signerIndex} of ${st.totalSigners} (${st.assignedToRole || st.assignedTo})`,
          description: `Signature request for ${st.formId} instance ${st.formInstanceId}`,
          status: pmStatus,
          start_date: (st.createdAt || '').slice(0, 10),
          assigned_user_id: st.assignedTo,
          assignee: st.assignedToName || st.assignedTo,
          owner: st.assignedToName || st.assignedTo,
          due_date: st.dueDate || (st.createdAt || '').slice(0, 10),
          sprint_id: '',
          depends_on: [],
          dependencies: [],
        } satisfies import('./types').NonFormCesTask);
      }
    }

    const personalTasks =
      scope === 'full'
        ? Object.values(personal)
        : Object.values(personal).filter(t => {
            const due = t.due_date?.slice(0, 10);
            if (!due) return false;
            return isoDateInSprint(due, sprintWindow);
          });
    const merged = [...cesTasks, ...signerPmTasks, ...personalTasks];
    if (import.meta.env?.DEV) {
      assertNoDuplicateTaskIds(merged);
    }
    return merged;
  }, [scopedCesEvents, formStates, stepStates, overlays, personal, scope, sprintWindow, signerTasksByFormInstanceId, allEvents]);
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
  const rawStepStates = useRegulatoryExecutionStore(s => s.stepStates);
  const stepStates = useMemo(
    () => Object.fromEntries(Object.entries(rawStepStates).map(([k, v]) => [k, v.status])),
    [rawStepStates],
  );
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
      stepStates,
      overlays,
    });
    return projected.find(t => t.task_id === task_id);
  }, [task_id, tasks, personal, allEvents, formStates, stepStates, overlays]);
}
