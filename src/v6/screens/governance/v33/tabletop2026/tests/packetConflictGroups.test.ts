import { describe, expect, it } from 'vitest';

import { ANNUAL_2026_CASE } from '../data/annualCase';
import { Q1_CASE_PACK } from '../data/q1Case';
import { Q2_2026_CASE } from '../data/q2Case';
import { Q3_2026_CASE } from '../data/q3Case';
import { Q4_CASE_PACK } from '../data/q4Case';

const casePacks = [
  Q1_CASE_PACK,
  Q2_2026_CASE,
  Q3_2026_CASE,
  Q4_CASE_PACK,
  ANNUAL_2026_CASE,
];

describe('authored packet conflict groups', () => {
  it('defines the four Q1 evidence problems required by the Round 0 flow', () => {
    expect(Q1_CASE_PACK.packetConflictGroups).toHaveLength(4);
    expect(Q1_CASE_PACK.packetConflictGroups.map((group) => group.id)).toContain(
      'q1-cap-status',
    );
  });

  it.each(casePacks.map((casePack) => [casePack.id, casePack] as const))(
    '%s references only real records and matters',
    (_caseId, casePack) => {
      const exhibitIds = new Set(casePack.exhibits.map((exhibit) => exhibit.id));
      const matterIds = new Set(casePack.decisionNodes.map((node) => node.matterId));
      const groupIds = casePack.packetConflictGroups.map((group) => group.id);

      expect(new Set(groupIds).size).toBe(groupIds.length);
      casePack.packetConflictGroups.forEach((group) => {
        expect(group.exhibitIds.length).toBeGreaterThanOrEqual(2);
        expect(group.exhibitIds.every((id) => exhibitIds.has(id))).toBe(true);
        expect(group.affectedMatterIds.every((id) => matterIds.has(id))).toBe(true);
        expect(group.conflictingFields.length).toBeGreaterThan(0);
        group.conflictingFields.forEach((field) => {
          expect(field.values.length).toBeGreaterThanOrEqual(2);
          expect(
            field.values.every((value) => group.exhibitIds.includes(value.exhibitId)),
          ).toBe(true);
        });
      });
    },
  );
});
