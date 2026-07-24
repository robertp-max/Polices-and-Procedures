// Deterministic alternate forms for the 2026 QAPI tabletop (§5).
//
// A "form" never changes WHAT is correct — option ids and points are untouched
// — it only reorders (a) the displayed option order per decision/surveyor
// question and (b) the reveal/inspection order of exhibits within each
// quarter's exhibit group, so a retry is not simply memorizable by position,
// while remaining fully reproducible and auditable per learner+attempt.

import { deterministicShuffle, pickForm } from '../assessments/assessmentUtils';
import {
  QAPI2026_TABLETOP,
  QAPI2026_TABLETOP_ID,
  type Q26Decision,
  type Q26Exhibit,
  type Q26Round,
  type Q26SurveyorQuestion,
} from './qapi2026TabletopCase';

/** Number of alternate forms available. Must stay >= 2 per §5. */
export const QAPI2026_FORM_COUNT = 3;

export interface Q26Form {
  formIndex: number;
  /** Decisions with their options array reordered for display (ids/points unchanged). */
  decisions: Q26Decision[];
  /** Surveyor questions with their options array reordered for display. */
  surveyor: Q26SurveyorQuestion[];
  /** Exhibit ids in the reveal/inspection order to render, grouped by quarter. */
  exhibitOrder: string[];
}

/** Deterministically pick a form index for a given learner + attempt number. */
export function selectQ26FormIndex(learnerId: string, attemptNumber: number): number {
  return pickForm(QAPI2026_FORM_COUNT, `${QAPI2026_TABLETOP_ID}:${learnerId}:attempt-${attemptNumber}`);
}

function shuffleWithinQuarterGroups(exhibits: readonly Q26Exhibit[], seedKey: string): string[] {
  const groups = new Map<string, Q26Exhibit[]>();
  for (const e of exhibits) {
    const g = groups.get(e.quarter) ?? [];
    g.push(e);
    groups.set(e.quarter, g);
  }
  // Preserve the case's natural quarter progression; shuffle only WITHIN a quarter.
  const quarterProgression: (Q26Round | 'ANNUAL')[] = ['Q1', 'Q2', 'Q3', 'Q4', 'YEAR_END', 'ANNUAL'];
  const out: string[] = [];
  for (const q of quarterProgression) {
    const group = groups.get(q);
    if (!group) continue;
    const shuffled = deterministicShuffle(group, `${seedKey}:${q}`);
    out.push(...shuffled.map((e) => e.id));
  }
  return out;
}

/** Build the deterministic alternate form for a given form index (0-based). */
export function buildQ26Form(formIndex: number, tcase = QAPI2026_TABLETOP): Q26Form {
  const idx = ((formIndex % QAPI2026_FORM_COUNT) + QAPI2026_FORM_COUNT) % QAPI2026_FORM_COUNT;
  const seedBase = `${QAPI2026_TABLETOP_ID}:form:${idx}`;

  const decisions = tcase.decisions.map((dec) => ({
    ...dec,
    options: deterministicShuffle(dec.options, `${seedBase}:decision:${dec.id}`),
  }));
  const surveyor = tcase.surveyor.map((q) => ({
    ...q,
    options: deterministicShuffle(q.options, `${seedBase}:surveyor:${q.id}`),
  }));
  const exhibitOrder = shuffleWithinQuarterGroups(tcase.exhibits, `${seedBase}:exhibits`);

  return { formIndex: idx, decisions, surveyor, exhibitOrder };
}
