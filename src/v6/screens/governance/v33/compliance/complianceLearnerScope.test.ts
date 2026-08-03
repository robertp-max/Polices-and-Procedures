// §12 — learner-scoped local draft state + unit-correct pass-standard labels.

import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearDraft,
  draftKey,
  hasLocalDraft,
  purgeLegacyUnscopedDrafts,
  readDraft,
  writeDraft,
  type ComplianceDraft,
} from './complianceStore';
import {
  formatPassStandard,
  formatPassStandardLabel,
  TRAINING_POLICY_PASS_STANDARD_DISPLAY,
} from './passStandardFormat';
import { deriveGbCatalog } from './complianceCatalog';

const LEARNER_A = 'learner-a@careindeed.com';
const LEARNER_B = 'learner-b@careindeed.com';
const ASSIGNMENT = 'gb:tabletop2026:tabletop2026-q1';

function draft(partial: Partial<ComplianceDraft> = {}): ComplianceDraft {
  return {
    assignmentId: ASSIGNMENT,
    resume: { stage: 3 },
    attemptNumber: 1,
    progressPercent: 42,
    submittedLocally: false,
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('draft storage is learner-scoped', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('uses care-indeed:gb:compliance:draft:{learnerId}:{assignmentId}', () => {
    expect(draftKey(LEARNER_A, ASSIGNMENT)).toBe(
      `care-indeed:gb:compliance:draft:${LEARNER_A}:${ASSIGNMENT}`,
    );
    writeDraft(LEARNER_A, draft());
    expect(window.localStorage.getItem(draftKey(LEARNER_A, ASSIGNMENT))).toContain('"progressPercent":42');
  });

  it("learner A's draft is invisible to learner B, and vice versa", () => {
    writeDraft(LEARNER_A, draft({ progressPercent: 42 }));
    expect(readDraft(LEARNER_A, ASSIGNMENT)?.progressPercent).toBe(42);
    expect(readDraft(LEARNER_B, ASSIGNMENT)).toBeNull();
    expect(hasLocalDraft(LEARNER_B, ASSIGNMENT)).toBe(false);

    writeDraft(LEARNER_B, draft({ progressPercent: 7 }));
    expect(readDraft(LEARNER_B, ASSIGNMENT)?.progressPercent).toBe(7);
    // B's write did not overwrite A.
    expect(readDraft(LEARNER_A, ASSIGNMENT)?.progressPercent).toBe(42);

    // Clearing B leaves A intact.
    clearDraft(LEARNER_B, ASSIGNMENT);
    expect(hasLocalDraft(LEARNER_B, ASSIGNMENT)).toBe(false);
    expect(hasLocalDraft(LEARNER_A, ASSIGNMENT)).toBe(true);
  });

  it('never adopts a legacy unscoped draft as any learner’s draft', () => {
    window.localStorage.setItem(
      `care-indeed:gb:compliance:draft:${ASSIGNMENT}`,
      JSON.stringify(draft({ progressPercent: 99 })),
    );
    expect(readDraft(LEARNER_A, ASSIGNMENT)).toBeNull();
    expect(readDraft(LEARNER_B, ASSIGNMENT)).toBeNull();

    purgeLegacyUnscopedDrafts([ASSIGNMENT]);
    expect(window.localStorage.getItem(`care-indeed:gb:compliance:draft:${ASSIGNMENT}`)).toBeNull();
  });

  it('resolves views against the assignment’s own learner, not a shared namespace', async () => {
    const catalogA = deriveGbCatalog({ learnerId: LEARNER_A, now: '2026-01-01T00:00:00Z' });
    const catalogB = deriveGbCatalog({ learnerId: LEARNER_B, now: '2026-01-01T00:00:00Z' });
    const a = catalogA.assignments.find((x) => x.type === 'training_module')!;
    const b = catalogB.assignments.find((x) => x.assignmentId === a.assignmentId)!;

    writeDraft(LEARNER_A, draft({ assignmentId: a.assignmentId, progressPercent: 55 }));

    const { resolveAssignmentView } = await import('./complianceSelectors');
    expect(resolveAssignmentView(a).hasLocalDraft).toBe(true);
    expect(resolveAssignmentView(b).hasLocalDraft).toBe(false);
  });
});

describe('formatPassStandard — units never mix', () => {
  it('renders percentage standards with a percent sign', () => {
    expect(formatPassStandard(100, 'percentage_100')).toBe('100%');
    expect(formatPassStandardLabel(TRAINING_POLICY_PASS_STANDARD_DISPLAY, 'percentage_100')).toBe(
      'Pass standard 100%',
    );
  });

  it('renders 1000-point standards as points with a derived percent', () => {
    expect(formatPassStandard(950, 'points_1000')).toBe('950 / 1000 (95%)');
    expect(formatPassStandard(970, 'points_1000')).toBe('970 / 1000 (97%)');
    expect(formatPassStandardLabel(950, 'points_1000')).toBe('Pass standard 950 / 1000 (95%)');
    expect(formatPassStandardLabel(970, 'points_1000')).toBe('Pass standard 970 / 1000 (97%)');
  });

  it('can never emit 950% or 970%', () => {
    for (const value of [950, 970]) {
      const rendered = formatPassStandardLabel(value, 'points_1000');
      expect(rendered).not.toContain(`${value}%`);
      expect(rendered).toContain('/ 1000');
    }
  });

  it('every catalog assignment with a pass standard carries its scale', () => {
    const catalog = deriveGbCatalog({ learnerId: LEARNER_A, now: '2026-01-01T00:00:00Z' });
    for (const a of catalog.assignments) {
      if (a.passStandard === null) continue;
      expect(a.passStandardScale).not.toBeNull();
      const label = formatPassStandardLabel(a.passStandard, a.passStandardScale!);
      if (a.type === 'tabletop') {
        expect(a.passStandardScale).toBe('points_1000');
        expect(label).toMatch(/\/ 1000 \(\d+(\.\d+)?%\)$/);
      } else {
        expect(a.passStandardScale).toBe('percentage_100');
        expect(a.passStandard).toBeLessThanOrEqual(100);
      }
    }
  });
});
