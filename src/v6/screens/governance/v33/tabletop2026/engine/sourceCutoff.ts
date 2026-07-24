// A quarterly matter can only be decided on evidence that existed as of that
// quarter's close — a board cannot rely on Q3 data to justify a Q2 decision.
// This module filters/flags exhibits so authored case content (and any
// learner-cited evidence) is checked against that cutoff. Pure.

import type { Exhibit, Quarter } from './caseTypes';

const QUARTER_ORDER: Record<Quarter, number> = { Q1: 1, Q2: 2, Q3: 3, Q4: 4, FY2026: 5 };

/** True when `quarter` is chronologically at or before `cutoffQuarter`. */
export function isWithinCutoff(quarter: Quarter, cutoffQuarter: Quarter): boolean {
  if (cutoffQuarter === 'FY2026') return true; // the annual capstone reviews the whole year
  return QUARTER_ORDER[quarter] <= QUARTER_ORDER[cutoffQuarter];
}

export interface CutoffResult {
  /** Exhibits properly usable for a matter scoped to `cutoffQuarter`. */
  permitted: Exhibit[];
  /** Exhibits dated after the cutoff — citing these is itself a data-integrity failure. */
  violations: Exhibit[];
}

/** Partitions a candidate exhibit set by the quarter cutoff for the case being assessed. */
export function enforceCutoff(exhibits: readonly Exhibit[], quarter: Quarter): CutoffResult {
  const permitted: Exhibit[] = [];
  const violations: Exhibit[] = [];
  for (const exhibit of exhibits) {
    if (isWithinCutoff(exhibit.quarter, quarter)) permitted.push(exhibit);
    else violations.push(exhibit);
  }
  return { permitted, violations };
}

/** Convenience check for a single cited exhibit id against a case's exhibit list + cutoff. */
export function citationViolatesCutoff(exhibitId: string, exhibits: readonly Exhibit[], quarter: Quarter): boolean {
  const exhibit = exhibits.find((e) => e.id === exhibitId);
  if (!exhibit) return false; // unknown id — not a cutoff concern, handled elsewhere as a missing citation
  return !isWithinCutoff(exhibit.quarter, quarter);
}
