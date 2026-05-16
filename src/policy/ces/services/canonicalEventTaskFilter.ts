/**
 * MVP-P1-CALENDAR-001 — Canonical event-scoped task filtering helpers.
 *
 * This module is the FIRST step in unifying scattered task-selection logic
 * across PM views (Kanban, Gantt, Sprint board). It lifts the
 * `isExecutionTask` + `bySelectedEvent` pair currently inlined in
 * `PmViews.tsx` into a single, importable, testable surface.
 *
 * SCOPE BOUNDARY:
 *   This module operates on the PM-side `Task` type (the projection-layer
 *   shape used by Kanban/Gantt/Sprint board). It does NOT operate on the
 *   execution-layer `EventTask` type (owned by `useEventExecutionDataflow`)
 *   or on `MergedExecutionUnit` (owned by `obligationSelectors`). Cross-
 *   layer unification requires owner-led changes to the frozen execution
 *   files and is OUT OF SCOPE for Wave 4.
 *
 * Per MVP plan §C7 / Lead 16 §14: the PM projection core and execution
 * dataflow remain owner-led. This module is the safe, additive seam.
 */

import type { Task } from '@/policy/pm/types';

/**
 * Regex matching CES task titles/events/workflows that represent ONBOARDING
 * work and should NOT appear on the PM execution rails (Kanban/Gantt/etc).
 *
 * EXTRACTED VERBATIM from `PmViews.tsx`. If you change this regex you MUST
 * also audit the original site to confirm no behavior divergence.
 */
export const EXECUTION_EXCLUDE_RE = /(onboarding|orientation|training)/i;

/**
 * True when a PM `Task` represents execution work (vs onboarding / personal
 * follow-ups). Mirrors the predicate currently in PmViews.tsx.
 */
export function isExecutionTask(task: Task): boolean {
  if (task.source === 'personal') return false;
  const text = `${task.title} ${task.event_title ?? ''} ${task.workflow_title ?? ''}`;
  return !EXECUTION_EXCLUDE_RE.test(text);
}

/**
 * Filter a PM `Task[]` to those that:
 *   - Pass `isExecutionTask`
 *   - Match `selectedEventId` (when provided)
 *
 * When `selectedEventId` is null/undefined, returns all execution tasks
 * (no event scoping).
 */
export function selectExecutionTasksForEvent(
  tasks: readonly Task[],
  selectedEventId?: string | null,
): Task[] {
  const executionTasks = tasks.filter(isExecutionTask);
  if (!selectedEventId) return executionTasks;
  return executionTasks.filter(t => t.event_id === selectedEventId);
}

/**
 * Convenience: select execution tasks for one event by exact event_id
 * match (assumes selectedEventId is provided). Throws if selectedEventId
 * is empty/undefined — use the optional variant above for nullable inputs.
 *
 * This is the "canonical successor" to scattered `.filter(t => t.event_id === eventId && ...)`
 * patterns across PM call sites.
 */
export function selectCanonicalTasksForEvent(
  tasks: readonly Task[],
  selectedEventId: string,
): Task[] {
  if (!selectedEventId) {
    throw new Error('selectedEventId must be a non-empty string');
  }
  return tasks.filter(isExecutionTask).filter(t => t.event_id === selectedEventId);
}
