// Acceptance: quarter cutoffs prevent later-quarter leakage.
//
// Pure-engine tests against engine/sourceCutoff.ts, plus integration checks
// against the authored quarterly CasePacks: Q1 has no post-Q1 exhibits at
// all, and Q2's authored decoy exhibit `q2-ex-decoy-q3-leak` (quarter Q3,
// dated after the Q2 meeting) is exactly the "later-quarter leakage" trap
// this module must catch.

import { describe, it, expect } from 'vitest';
import { citationViolatesCutoff, enforceCutoff, isWithinCutoff } from '../engine/sourceCutoff';
import type { Exhibit, Quarter } from '../engine/caseTypes';
import { Q1_CASE_PACK } from '../data/q1Case';
import { Q2_2026_CASE } from '../data/q2Case';
import { Q4_CASE_PACK } from '../data/q4Case';

function exhibit(overrides: Partial<Exhibit>): Exhibit {
  return {
    id: 'EX-X', sourceId: 'SRC-X', quarter: 'Q1', asOfDate: '2026-01-01',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: [], formIds: [], relevance: 'decision_relevant', section: 's', title: 't', summary: 's',
    details: [],
    ...overrides,
  };
}

describe('sourceCutoff — isWithinCutoff ordering', () => {
  it('a quarter is within its own cutoff', () => {
    (['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).forEach((q) => expect(isWithinCutoff(q, q)).toBe(true));
  });

  it('an earlier quarter is within a later cutoff', () => {
    expect(isWithinCutoff('Q1', 'Q2')).toBe(true);
    expect(isWithinCutoff('Q1', 'Q4')).toBe(true);
    expect(isWithinCutoff('Q2', 'Q3')).toBe(true);
  });

  it('a later quarter is NOT within an earlier cutoff — this is the leakage guard', () => {
    expect(isWithinCutoff('Q2', 'Q1')).toBe(false);
    expect(isWithinCutoff('Q3', 'Q1')).toBe(false);
    expect(isWithinCutoff('Q4', 'Q3')).toBe(false);
  });

  it('the FY2026 annual capstone cutoff permits every quarter (it reviews the whole year)', () => {
    (['Q1', 'Q2', 'Q3', 'Q4', 'FY2026'] as Quarter[]).forEach((q) => expect(isWithinCutoff(q, 'FY2026')).toBe(true));
  });
});

describe('sourceCutoff — enforceCutoff partitions permitted vs violating exhibits', () => {
  it('partitions a mixed-quarter exhibit set against a Q2 cutoff', () => {
    const exhibits = [
      exhibit({ id: 'EX-Q1', quarter: 'Q1' }),
      exhibit({ id: 'EX-Q2', quarter: 'Q2' }),
      exhibit({ id: 'EX-Q3', quarter: 'Q3' }),
      exhibit({ id: 'EX-Q4', quarter: 'Q4' }),
    ];
    const { permitted, violations } = enforceCutoff(exhibits, 'Q2');
    expect(permitted.map((e) => e.id)).toEqual(['EX-Q1', 'EX-Q2']);
    expect(violations.map((e) => e.id)).toEqual(['EX-Q3', 'EX-Q4']);
  });

  it('citationViolatesCutoff flags a specific cited exhibit id dated after the cutoff', () => {
    const exhibits = [exhibit({ id: 'EX-Q1', quarter: 'Q1' }), exhibit({ id: 'EX-Q3', quarter: 'Q3' })];
    expect(citationViolatesCutoff('EX-Q3', exhibits, 'Q1')).toBe(true);
    expect(citationViolatesCutoff('EX-Q1', exhibits, 'Q1')).toBe(false);
  });

  it('citationViolatesCutoff is false (not a cutoff concern) for an unknown exhibit id', () => {
    expect(citationViolatesCutoff('NOT-A-REAL-ID', [], 'Q1')).toBe(false);
  });
});

describe('sourceCutoff — authored quarterly CasePacks never leak later-quarter evidence as usable', () => {
  it('Q1_CASE_PACK has zero exhibits dated later than Q1 (nothing to leak)', () => {
    const { violations } = enforceCutoff(Q1_CASE_PACK.exhibits, 'Q1');
    expect(violations).toEqual([]);
  });

  it("Q2's authored Q3-dated decoy exhibit is caught as a cutoff violation, not usable for a Q2 decision", () => {
    const leakExhibit = Q2_2026_CASE.exhibits.find((e) => e.id === 'q2-ex-decoy-q3-leak');
    expect(leakExhibit).toBeDefined();
    expect(leakExhibit?.quarter).toBe('Q3');

    const { violations, permitted } = enforceCutoff(Q2_2026_CASE.exhibits, 'Q2');
    expect(violations.some((e) => e.id === 'q2-ex-decoy-q3-leak')).toBe(true);
    expect(permitted.some((e) => e.id === 'q2-ex-decoy-q3-leak')).toBe(false);
    expect(citationViolatesCutoff('q2-ex-decoy-q3-leak', Q2_2026_CASE.exhibits, 'Q2')).toBe(true);

    // And the trap is explicitly marked decoy/unresolved — never masqueraded as recovered.
    expect(leakExhibit?.relevance).toBe('decoy');
    expect(leakExhibit?.posture).toBe('unresolved');
  });

  it("Q2's own Q1-quarter and Q2-quarter exhibits remain permitted under the Q2 cutoff", () => {
    const { permitted } = enforceCutoff(Q2_2026_CASE.exhibits, 'Q2');
    const permittedQuarters = new Set(permitted.map((e) => e.quarter));
    expect(permittedQuarters.has('Q3')).toBe(false);
    expect(permittedQuarters.has('Q4')).toBe(false);
  });

  it('Q4 (the last quarter) permits earlier-quarter exhibits it legitimately carries forward (e.g. Q1/Q2/Q3 evidence chains)', () => {
    const { violations } = enforceCutoff(Q4_CASE_PACK.exhibits, 'Q4');
    // Q4 is the final quarter — nothing in the source can postdate it, so there should be no violations.
    expect(violations).toEqual([]);
  });
});
