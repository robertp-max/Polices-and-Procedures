/**
 * Next Due Date Engine
 * Computes the next occurrence of a recurring compliance event based on its
 * cadence (annual, semiannual, biennial, quarterly, monthly, etc.).
 *
 * Source of truth: ChatGPTmandatedEvents.md blueprint.
 * - Annual    → +1 year
 * - Semiannual → +6 months
 * - Biennial  → +2 years
 * - Quarterly → +3 months  (policy-driven cadence)
 * - Monthly   → +1 month
 * - Ad-hoc / Trigger-based / Holiday → null (no automatic recurrence)
 */

import type { RegulatoryEvent, EventCadence } from '@/policy/data/regulatoryEvents';

/* ─── Types ──────────────────────────────────────────────────── */

export interface NextDueDateResult {
  /** YYYY-MM-DD of the next occurrence */
  dateISO: string;
  /** Human-readable formatted date, e.g. "Jan 8, 2027" */
  label: string;
  /** Human-readable cadence label */
  cadenceLabel: string;
}

export interface DependencyBlockStatus {
  /** True if this event is blocked by an incomplete upstream dependency */
  isBlocked: boolean;
  /** IDs of upstream events that are not yet complete */
  blockedByIds: string[];
  /** Titles of blocking events (for display) */
  blockedByTitles: string[];
}

/* ─── Cadence → offset map ───────────────────────────────────── */

type Offset = { years?: number; months?: number; days?: number } | null;

const CADENCE_OFFSET: Record<EventCadence, Offset> = {
  Monthly:         { months: 1 },
  Quarterly:       { months: 3 },
  Annual:          { years: 1 },
  Semiannual:      { months: 6 },
  Biennial:        { years: 2 },
  Weekly:          { days: 7 },
  Biweekly:        { days: 14 },
  'Ad-hoc':        null,
  'Trigger-based': null,
  Holiday:         null,
};

/* ─── Core computation ───────────────────────────────────────── */

/**
 * Compute the next due date after `fromDate` (defaults to the event's own date).
 * Returns null for non-recurring cadences (Ad-hoc, Trigger-based, Holiday).
 */
export function computeNextDueDate(
  event: RegulatoryEvent,
  fromDate?: Date,
): NextDueDateResult | null {
  const offset = CADENCE_OFFSET[event.cadence];
  if (!offset) return null;

  const base = fromDate ?? new Date(event.date + 'T00:00:00');
  const d = new Date(base);

  if (offset.years)  d.setFullYear(d.getFullYear() + offset.years);
  if (offset.months) d.setMonth(d.getMonth() + offset.months);
  if (offset.days)   d.setDate(d.getDate() + offset.days);

  const dateISO = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return { dateISO, label, cadenceLabel: event.cadence };
}

/**
 * Compute next due date from a completion date (i.e. the cycle after the event
 * was successfully closed). Falls back to event date if no completion date.
 */
export function computeNextDueDateFromCompletion(
  event: RegulatoryEvent,
  completedAt?: string | null,
): NextDueDateResult | null {
  const base = completedAt
    ? new Date(completedAt)
    : new Date(event.date + 'T00:00:00');
  return computeNextDueDate(event, base);
}

/* ─── Dependency detection ───────────────────────────────────── */

/**
 * Determine whether an event is blocked by incomplete upstream dependencies.
 * An event is blocked if it has `dependencies.dependsOn` entries that
 * do NOT yet have urgency === 'complete'.
 */
export function computeDependencyBlockStatus(
  event: RegulatoryEvent,
  allEvents: RegulatoryEvent[],
): DependencyBlockStatus {
  const deps = event.dependencies?.dependsOn ?? [];
  if (!deps.length) return { isBlocked: false, blockedByIds: [], blockedByTitles: [] };

  const blockers = deps
    .map(depId => allEvents.find(e => e.id === depId))
    .filter((dep): dep is RegulatoryEvent => !!dep && dep.urgency !== 'complete');

  return {
    isBlocked: blockers.length > 0,
    blockedByIds: blockers.map(b => b.id),
    blockedByTitles: blockers.map(b => b.title),
  };
}

/* ─── Utility: format "next due" for display ─────────────────── */

export function formatNextDue(result: NextDueDateResult | null): string {
  if (!result) return '—';
  return result.label;
}
