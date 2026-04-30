/**
 * Weekend scheduling rule.
 *
 * Compliance/event tasks must NOT be scheduled on Sat/Sun unless a manual
 * override (with reason) is provided. Personal tasks may use weekends only
 * when explicitly opted in by the owner.
 *
 * See: Builder/eCIgn-Centered-Submission/13-eCIgn-Failure-Modes-and-Controls.md (C-7)
 *      Builder/Compliance-Execution-Sprints/PM-Sprint-Board-Design.md §2.1
 */

import type { TaskSource } from './types';

export class WeekendNotAllowedError extends Error {
  readonly date: string;
  readonly source: TaskSource;
  constructor(date: string, source: TaskSource) {
    super(
      `Compliance tasks cannot be scheduled on weekends without an explicit override + reason (date=${date}, source=${source}).`,
    );
    this.name = 'WeekendNotAllowedError';
    this.date = date;
    this.source = source;
  }
}

/** True if the given ISO date (YYYY-MM-DD or full ISO) lands on Sat or Sun in UTC. */
export function isWeekend(isoDate: string): boolean {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const dow = d.getUTCDay(); // 0 = Sunday, 6 = Saturday
  return dow === 0 || dow === 6;
}

export interface SchedulableOptions {
  source: TaskSource;
  /** Required for compliance tasks scheduled on a weekend. */
  weekendOverride?: boolean;
  /** Required for personal tasks scheduled on a weekend. */
  isWeekendOk?: boolean;
}

/**
 * Throws WeekendNotAllowedError when:
 *   - source = 'CES'/'ces' and date is a weekend and weekendOverride !== true
 *   - source = 'personal' and date is a weekend and isWeekendOk !== true
 *
 * No-op for weekday dates and undefined dates.
 */
export function assertSchedulable(isoDate: string | undefined, opts: SchedulableOptions): void {
  if (!isoDate) return;
  if (!isWeekend(isoDate)) return;
  if (opts.source === 'ces' || opts.source === 'CES') {
    if (opts.weekendOverride === true) return;
    throw new WeekendNotAllowedError(isoDate, 'CES');
  }
  // personal
  if (opts.isWeekendOk === true) return;
  throw new WeekendNotAllowedError(isoDate, 'personal');
}

/**
 * True when the current date+source combination requires the user to provide
 * an override + reason before the schedule can be saved.
 */
export function requiresOverrideReason(isoDate: string | undefined, source: TaskSource): boolean {
  if (!isoDate) return false;
  if (!isWeekend(isoDate)) return false;
  return source === 'ces' || source === 'CES';
}
