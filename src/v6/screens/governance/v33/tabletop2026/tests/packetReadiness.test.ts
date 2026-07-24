import { describe, expect, it } from 'vitest';

import {
  createPacketReadinessState,
  getPacketReadinessCompletion,
  normalizePacketReadinessState,
  type PacketReadinessState,
} from '../packetReadiness';

const caseData = {
  checks: [{ id: 'cutoff' }, { id: 'validation' }],
  requiredConflictIds: ['EX-1', 'EX-2'],
};

function completeState(): PacketReadinessState {
  const state = createPacketReadinessState(caseData.requiredConflictIds);
  return {
    ...state,
    reviewedCriterionIds: ['cutoff', 'validation'],
    conflictDeterminations: {
      'EX-1': {
        classification: 'reconciled',
        reliedUponExhibitIds: ['EX-1'],
        note: 'The source date and recovered total reconcile.',
        savedAt: '2026-03-31T12:00:00.000Z',
      },
      'EX-2': {
        classification: 'context_only',
        reliedUponExhibitIds: [],
        note: 'This record supplies context and is not relied upon.',
        savedAt: '2026-03-31T12:01:00.000Z',
      },
    },
    disposition: 'full',
    rationale: {
      verifiedEvidence: 'Signed dashboard and rollforward.',
      unresolvedEvidence: 'None',
      relianceScope: 'All matters in the packet.',
      followUpAction: '',
      owner: '',
      dueDate: null,
    },
  };
}

describe('packet readiness initial state', () => {
  it('starts with no disposition or conflict classification', () => {
    const state = createPacketReadinessState(caseData.requiredConflictIds);

    expect(state.disposition).toBeNull();
    expect(state.lockedAt).toBeNull();
    expect(Object.values(state.conflictDeterminations)).toEqual([
      {
        classification: null,
        reliedUponExhibitIds: [],
        note: '',
        savedAt: null,
      },
      {
        classification: null,
        reliedUponExhibitIds: [],
        note: '',
        savedAt: null,
      },
    ]);
  });

  it('rejects a legacy draft instead of restoring a stale disposition', () => {
    const legacy = {
      disposition: 'full',
      rationale: 'Old single-field rationale',
    };

    expect(normalizePacketReadinessState(legacy, caseData.requiredConflictIds).disposition).toBeNull();
  });
});

describe('getPacketReadinessCompletion', () => {
  it('returns visible blockers for every incomplete requirement', () => {
    const completion = getPacketReadinessCompletion(
      createPacketReadinessState(caseData.requiredConflictIds),
      caseData,
    );

    expect(completion.canLock).toBe(false);
    expect(completion.blockers).toEqual([
      'Review every packet-readiness criterion.',
      'Classify every material conflict and save a determination note.',
      'Select a Board disposition.',
      'Identify the evidence that was verified.',
      'State what remains unresolved, or enter "None".',
      'Document which matters may or may not be relied upon.',
    ]);
  });

  it('allows a complete full-reliance record without follow-up fields', () => {
    const completion = getPacketReadinessCompletion(completeState(), caseData);

    expect(completion).toMatchObject({
      allCriteriaReviewed: true,
      allMaterialConflictsClassified: true,
      dispositionSelected: true,
      rationaleComplete: true,
      followUpCompleteWhenRequired: true,
      canLock: true,
      blockers: [],
    });
  });

  it('requires follow-up action, owner, and due date for partial reliance', () => {
    const state = { ...completeState(), disposition: 'partial' as const };
    const incomplete = getPacketReadinessCompletion(state, caseData);

    expect(incomplete.followUpCompleteWhenRequired).toBe(false);
    expect(incomplete.canLock).toBe(false);
    expect(incomplete.blockers).toContain(
      'Assign the required follow-up action, owner, and due date.',
    );

    const complete = getPacketReadinessCompletion(
      {
        ...state,
        rationale: {
          ...state.rationale,
          followUpAction: 'Reconcile the census variance.',
          owner: 'QAPI Director',
          dueDate: '2026-04-15',
        },
      },
      caseData,
    );

    expect(complete.followUpCompleteWhenRequired).toBe(true);
    expect(complete.canLock).toBe(true);
  });

  it('makes a locked record ineligible for another lock', () => {
    const completion = getPacketReadinessCompletion(
      {
        ...completeState(),
        lockedAt: '2026-03-31T12:05:00.000Z',
      },
      caseData,
    );

    expect(completion.canLock).toBe(false);
    expect(completion.blockers).toEqual([]);
  });
});
