/**
 * Sprint Allocator — capacity-aware auto-assignment of tasks to a sprint.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Sprint-Board-Design.md §4
 *       Builder/Compliance-Execution-Sprints/PM-Implementation-Plan.md (Phase 3)
 *
 * Design notes:
 *  - Pure function. No store reads, no mutation. Caller decides what to commit.
 *  - Greedy by priority then due date, respecting per-assignee capacity in points.
 *  - Honors hard pins (already in `existingPinned`) — those tasks are NOT moved
 *    and their points subtract from assignee capacity before allocation.
 *  - Skips tasks already `done`. Skips CES tasks without an assignee unless
 *    `assumeOwner` is supplied (defaults to leaving them unallocated).
 *  - Returns proposal entries; caller can then PUT overlay with new sprint_id.
 */

import type { Task, PmTaskStatus } from '../types';
import { isPersonalTask } from '../types';
import type { SprintWindow } from '../sprintWindows';
import { sprintForDate } from '../sprintWindows';

export interface AllocatorAssignee {
  user_id: string;
  /** Capacity in story points for the sprint. */
  capacity_points: number;
}

export interface AllocatorInput {
  sprint: SprintWindow;
  assignees: AllocatorAssignee[];
  /** Candidate tasks to consider (already filtered to relevant pool by caller). */
  candidates: Task[];
  /** Tasks already pinned to this sprint (will not be re-allocated; counts toward capacity). */
  existingPinned: Task[];
  /** Default points for tasks with no story_points set (used to compute load). */
  defaultPoints?: number;
}

export interface AllocationProposal {
  task_id: string;
  user_id: string;
  reason: string;
  points: number;
}

export interface AllocatorResult {
  proposals: AllocationProposal[];
  /** Per-assignee load summary after applying proposals + existing pinned. */
  loads: Record<string, { used: number; capacity: number; remaining: number }>;
  /** Tasks that could NOT be placed (capacity exhausted, no candidate assignee). */
  unplaced: Array<{ task_id: string; reason: string }>;
}

const STATUS_RANK: Record<PmTaskStatus, number> = {
  blocked: 5,
  in_progress: 1,
  in_review: 2,
  todo: 3,
  done: 9,
};

function effectivePoints(t: Task, fallback: number): number {
  return typeof t.story_points === 'number' && t.story_points > 0 ? t.story_points : fallback;
}

function dueRank(t: Task): number {
  if (!t.due_date) return Number.MAX_SAFE_INTEGER;
  return new Date(t.due_date).getTime();
}

function ownerOf(t: Task): string | undefined {
  if (isPersonalTask(t)) return t.owner_user_id;
  return (t as { assigned_user_id?: string }).assigned_user_id;
}

export function allocateSprint(input: AllocatorInput): AllocatorResult {
  const fallback = input.defaultPoints ?? 1;
  const loads: Record<string, { used: number; capacity: number; remaining: number }> = {};
  for (const a of input.assignees) {
    loads[a.user_id] = { used: 0, capacity: a.capacity_points, remaining: a.capacity_points };
  }

  // Subtract already-pinned tasks from capacity.
  for (const t of input.existingPinned) {
    const owner = ownerOf(t);
    if (!owner || !loads[owner]) continue;
    if (t.status === 'done') continue;
    const pts = effectivePoints(t, fallback);
    loads[owner].used += pts;
    loads[owner].remaining = Math.max(0, loads[owner].capacity - loads[owner].used);
  }

  // Sort candidates: status priority asc, then due asc, then points desc.
  const pool = [...input.candidates].filter(t => t.status !== 'done');
  pool.sort((a, b) => {
    const sr = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (sr !== 0) return sr;
    const dr = dueRank(a) - dueRank(b);
    if (dr !== 0) return dr;
    return effectivePoints(b, fallback) - effectivePoints(a, fallback);
  });

  const proposals: AllocationProposal[] = [];
  const unplaced: AllocatorResult['unplaced'] = [];

  for (const t of pool) {
    // Personal tasks not pinned to this sprint stay where they are unless their owner has capacity.
    const owner = ownerOf(t);
    if (!owner) {
      unplaced.push({ task_id: t.task_id, reason: 'no_owner' });
      continue;
    }
    const load = loads[owner];
    if (!load) {
      unplaced.push({ task_id: t.task_id, reason: `owner_not_in_sprint:${owner}` });
      continue;
    }
    const pts = effectivePoints(t, fallback);
    if (load.remaining < pts) {
      unplaced.push({ task_id: t.task_id, reason: `over_capacity:${owner}:remaining=${load.remaining}<need=${pts}` });
      continue;
    }
    // Skip tasks already in this sprint (existing pinned handled above).
    if (t.sprint_id === input.sprint.id) continue;
    // Tasks whose due date falls in the sprint window get a "due_in_window" reason; else "promoted".
    const due = t.due_date ? sprintForDate(t.due_date) : null;
    const reason = due?.id === input.sprint.id ? 'due_in_window' : 'promoted_for_capacity';
    proposals.push({ task_id: t.task_id, user_id: owner, reason, points: pts });
    load.used += pts;
    load.remaining = Math.max(0, load.capacity - load.used);
  }

  return { proposals, loads, unplaced };
}

/**
 * Roll-over: compute which tasks from a sprint should move to the next sprint
 * (i.e., not yet `done` and still needed). Caller commits via overlay PUT.
 */
export function rolloverSprint(args: {
  fromSprint: SprintWindow;
  toSprint: SprintWindow;
  tasks: Task[];
}): Array<{ task_id: string; from_sprint: string; to_sprint: string; reason: string }> {
  const out: Array<{ task_id: string; from_sprint: string; to_sprint: string; reason: string }> = [];
  for (const t of args.tasks) {
    if (t.sprint_id !== args.fromSprint.id) continue;
    if (t.status === 'done') continue;
    out.push({
      task_id: t.task_id,
      from_sprint: args.fromSprint.id,
      to_sprint: args.toSprint.id,
      reason: t.status === 'blocked' ? 'rolled_over_blocked' : 'rolled_over_incomplete',
    });
  }
  return out;
}
