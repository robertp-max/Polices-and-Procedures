/**
 * Care Indeed LMS — Wave 7: recurrence cycles, credit/hour ledger, HHA rolling
 * 12-hour in-service, and transcript projection.
 *
 * Pure logic (architecture §13, §14, §19). "Annual" is not one boolean; hours are
 * accumulated from validated credit evidence; current readiness never erases
 * historical completion.
 */
import type { CreditLedgerEntry, VersionRef } from './types';

/* ------------------------------------------------------------------ *
 * Recurrence cycle keys (§14.1) — deterministic, prevents duplicate cycles.
 * ------------------------------------------------------------------ */

export type RecurrenceAnchor =
  | { kind: 'CALENDAR_YEAR' }
  | { kind: 'HIRE_ANNIVERSARY'; hireDate: string }
  | { kind: 'ROLLING_12_MONTHS' }
  | { kind: 'QUARTER' }
  | { kind: 'CREDENTIAL_EXPIRY'; expiry: string }
  | { kind: 'POLICY_PUBLICATION'; publishedAt: string; policyVersion: string };

/** The cycle segment key for a given anchor + reference date (UTC). */
export function computeCycleKey(anchor: RecurrenceAnchor, at: Date): string {
  const y = at.getUTCFullYear();
  switch (anchor.kind) {
    case 'CALENDAR_YEAR':
      return `CY-${y}`;
    case 'HIRE_ANNIVERSARY': {
      const hire = new Date(anchor.hireDate);
      // The anniversary-year window the date falls into.
      const anniversaryThisYear = new Date(Date.UTC(y, hire.getUTCMonth(), hire.getUTCDate()));
      const windowYear = at.getTime() >= anniversaryThisYear.getTime() ? y : y - 1;
      return `HIRE-${windowYear}`;
    }
    case 'ROLLING_12_MONTHS':
      return `ROLL-${y}-${String(at.getUTCMonth() + 1).padStart(2, '0')}`;
    case 'QUARTER':
      return `Q${Math.floor(at.getUTCMonth() / 3) + 1}-${y}`;
    case 'CREDENTIAL_EXPIRY':
      return `CRED-${anchor.expiry.slice(0, 10)}`;
    case 'POLICY_PUBLICATION':
      return `POL-${anchor.policyVersion}-${anchor.publishedAt.slice(0, 10)}`;
    default:
      return `UNKNOWN-${y}`;
  }
}

export function cycleUniqueKey(subjectId: string, requirementRef: VersionRef, ruleRef: VersionRef, cycleKey: string): string {
  return `${subjectId}#REQ:${requirementRef.id}v${requirementRef.version}#RULE:${ruleRef.id}v${ruleRef.version}#${cycleKey}`;
}

export type CycleStatus = 'SCHEDULED' | 'OPEN' | 'DUE' | 'OVERDUE' | 'SATISFIED' | 'CLOSED';

export function deriveCycleStatus(input: {
  availableAt: string;
  dueAt: string;
  windowEnd: string;
  satisfied: boolean;
  now: Date;
}): CycleStatus {
  if (input.satisfied) return 'SATISFIED';
  const t = input.now.getTime();
  if (t < new Date(input.availableAt).getTime()) return 'SCHEDULED';
  if (t > new Date(input.windowEnd).getTime()) return 'OVERDUE';
  if (t > new Date(input.dueAt).getTime()) return 'DUE';
  return 'OPEN';
}

/* ------------------------------------------------------------------ *
 * Credit / hours ledger (§13) — accepted entries only; not one boolean.
 * ------------------------------------------------------------------ */

export function subtractMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));
}

/** Sum of ACCEPTED credit of a type whose occurredAt falls within [start, end]. */
export function sumAcceptedCredit(
  entries: CreditLedgerEntry[],
  creditType: CreditLedgerEntry['creditType'],
  start: Date,
  end: Date,
): number {
  return entries
    .filter((e) => e.status === 'ACCEPTED' && e.creditType === creditType)
    .filter((e) => {
      const t = new Date(e.occurredAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    })
    .reduce((sum, e) => sum + e.value, 0);
}

/** HHA rolling 12-hour in-service: accepted HHA_INSERVICE_HOUR within the last 12 months. */
export function hhaInserviceHours(entries: CreditLedgerEntry[], now: Date): { total: number; meets12: boolean } {
  const total = sumAcceptedCredit(entries, 'HHA_INSERVICE_HOUR', subtractMonths(now, 12), now);
  return { total, meets12: total >= 12 };
}

/* ------------------------------------------------------------------ *
 * Current readiness vs historical completion (§14.3).
 * ------------------------------------------------------------------ */

/** A current annual lapse changes readiness/clearance/scheduling — never history. */
export function lapseImpact(): { affects: string[]; preserves: string[] } {
  return {
    affects: ['ANNUAL_READINESS', 'FIELD_CLEARANCE', 'SCHEDULING_ELIGIBILITY'],
    preserves: ['HISTORICAL_ONBOARDING_COMPLETION', 'HISTORICAL_CERTIFICATE', 'PAST_ATTEMPT', 'PAST_EVIDENCE'],
  };
}

/* ------------------------------------------------------------------ *
 * Transcript projection (§19.1) — read model.
 * ------------------------------------------------------------------ */

export interface TranscriptRow {
  assignmentId: string;
  requirementCode: string;
  status: string;
  completedAt?: string;
  certificatePublicId?: string;
}

export interface TranscriptInput {
  completed: TranscriptRow[];
  current: TranscriptRow[];
  hoursLedger: { creditType: string; total: number }[];
}

export function buildTranscript(input: TranscriptInput) {
  return {
    completedCount: input.completed.length,
    currentCount: input.current.length,
    completed: input.completed,
    current: input.current,
    hours: input.hoursLedger,
  };
}
