import { describe, expect, it } from 'vitest';

import { Q1_CASE_PACK } from '../data/q1Case';
import {
  buildBoardRecordPreview,
  createPacketReadinessState,
  derivePacketMatters,
  getPacketReadinessCompletion,
  getRound0NextAction,
  isAfterSourceCutoff,
  normalizePacketReadinessState,
  type PacketReadinessState,
} from '../packetReadiness';

const completedAt = '2026-04-09T18:00:00.000Z';

function completeConflicts(
  state: PacketReadinessState,
  classification: 'reconciled' | 'limited_unresolved' = 'reconciled',
): PacketReadinessState {
  return {
    ...state,
    conflictDeterminations: Object.fromEntries(
      Q1_CASE_PACK.packetConflictGroups.map((group) => [
        group.id,
        {
          classification,
          reliance: 'record_a',
          note: `Board limitation recorded for ${group.id}.`,
          completedAt,
        },
      ]),
    ),
  };
}

function completeFullState(): PacketReadinessState {
  const matters = derivePacketMatters(Q1_CASE_PACK).map((matter) => matter.id);
  return {
    ...completeConflicts(
      createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups),
    ),
    disposition: 'full',
    mattersProceeding: matters,
    mattersHeld: [],
    boardRationale:
      'The Board limited its use to the paired source records and preserved each saved answer in the Board record.',
  };
}

describe('packet readiness schema v2', () => {
  it('starts with authored conflict-group keys and no selected outcome', () => {
    const state = createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups);

    expect(state.schemaVersion).toBe(2);
    expect(state.disposition).toBeNull();
    expect(state.lockedAt).toBeNull();
    expect(Object.keys(state.conflictDeterminations)).toEqual(
      Q1_CASE_PACK.packetConflictGroups.map((group) => group.id),
    );
    expect(Object.values(state.conflictDeterminations)).toEqual(
      Q1_CASE_PACK.packetConflictGroups.map(() => ({
        classification: null,
        reliance: null,
        note: '',
        completedAt: null,
      })),
    );
  });

  it('migrates v1 exhibit decisions and preserves all learner-authored text', () => {
    const firstGroup = Q1_CASE_PACK.packetConflictGroups[0];
    const legacy = {
      schemaVersion: 1,
      conflictDeterminations: {
        [firstGroup.exhibitIds[0]]: {
          classification: 'limited_unresolved',
          reliedUponExhibitIds: [firstGroup.exhibitIds[0]],
          note: 'The attendance source is limited to the committee.',
          savedAt: completedAt,
        },
        [firstGroup.exhibitIds[1]]: {
          classification: 'context_only',
          reliedUponExhibitIds: [],
          note: 'The Board roster uses a separate threshold.',
          savedAt: completedAt,
        },
        'EX-LEGACY-ONLY': {
          classification: 'material_unresolved',
          reliedUponExhibitIds: [],
          note: 'Preserve this unmatched learner note.',
          savedAt: completedAt,
        },
      },
      disposition: 'partial',
      rationale: {
        verifiedEvidence: 'Signed attendance record.',
        unresolvedEvidence: 'Entity mismatch remains.',
        relianceScope: 'Only named matters may proceed.',
        followUpAction: 'Validate the legal roster.',
        owner: 'Board Secretary',
        dueDate: '2026-04-15',
      },
      lockedAt: null,
    };

    const migrated = normalizePacketReadinessState(
      legacy,
      Q1_CASE_PACK.packetConflictGroups,
      Q1_CASE_PACK,
    );
    const determination = migrated.conflictDeterminations[firstGroup.id];

    expect(migrated.schemaVersion).toBe(2);
    expect(determination.classification).toBe('limited_unresolved');
    expect(determination.reliance).toBe('record_a');
    expect(determination.note).toContain('attendance source is limited');
    expect(determination.note).toContain('Board roster uses a separate threshold');
    expect(migrated.followUp).toEqual({
      action: 'Validate the legal roster.',
      owner: 'Board Secretary',
      dueDate: '2026-04-15',
      returnDate: null,
    });
    expect(migrated.boardRationale).toContain('Signed attendance record.');
    expect(migrated.boardRationale).toContain('Only named matters may proceed.');
    expect(migrated.boardRationale).toContain('Preserve this unmatched learner note.');
  });

  it('normalizes unknown data to a fresh v2 draft', () => {
    const normalized = normalizePacketReadinessState(
      { disposition: 'full', rationale: 'obsolete shape' },
      Q1_CASE_PACK.packetConflictGroups,
      Q1_CASE_PACK,
    );

    expect(normalized).toEqual(
      createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups),
    );
  });
});

describe('Round 0 next action', () => {
  it('progresses from packet check through one clear action at a time', () => {
    const fresh = createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups);
    expect(getRound0NextAction(fresh, Q1_CASE_PACK)).toMatchObject({
      stage: 'check',
      label: 'Review 4 evidence problems',
      remainingCount: 4,
    });

    const firstGroup = Q1_CASE_PACK.packetConflictGroups[0];
    const oneComplete: PacketReadinessState = {
      ...fresh,
      conflictDeterminations: {
        ...fresh.conflictDeterminations,
        [firstGroup.id]: {
          classification: 'context_only',
          reliance: 'both_with_limitation',
          note: 'The records describe different governing bodies.',
          completedAt,
        },
      },
    };
    expect(getRound0NextAction(oneComplete, Q1_CASE_PACK)).toMatchObject({
      stage: 'conflicts',
      label: 'Review 3 evidence problems',
      remainingCount: 3,
    });

    const conflictsComplete = completeConflicts(fresh);
    expect(getRound0NextAction(conflictsComplete, Q1_CASE_PACK)).toMatchObject({
      stage: 'decision',
      label: 'Choose what the Board may do',
    });

    const noScope = { ...conflictsComplete, disposition: 'full' as const };
    expect(getRound0NextAction(noScope, Q1_CASE_PACK).label).toBe(
      'Select which matters may proceed',
    );

    const matters = derivePacketMatters(Q1_CASE_PACK).map((matter) => matter.id);
    const noRationale = { ...noScope, mattersProceeding: matters };
    expect(getRound0NextAction(noRationale, Q1_CASE_PACK).label).toBe(
      'Add the Board rationale',
    );

    expect(getRound0NextAction(completeFullState(), Q1_CASE_PACK)).toMatchObject({
      stage: 'review',
      label: 'Lock Round 0 and continue',
    });
  });
});

describe('packet readiness completion', () => {
  it('allows a complete full-reliance record without follow-up fields', () => {
    const completion = getPacketReadinessCompletion(
      completeFullState(),
      Q1_CASE_PACK,
    );

    expect(completion).toMatchObject({
      packetCheckComplete: true,
      conflictsComplete: true,
      dispositionSelected: true,
      matterScopeComplete: true,
      followUpRequired: false,
      followUpCompleteWhenRequired: true,
      boardRationaleComplete: true,
      canLock: true,
      firstIncomplete: null,
    });
  });

  it('requires action, owner, due date, and return date for partial reliance', () => {
    const matterIds = derivePacketMatters(Q1_CASE_PACK).map((matter) => matter.id);
    const partial: PacketReadinessState = {
      ...completeConflicts(
        createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups),
        'limited_unresolved',
      ),
      disposition: 'partial',
      mattersProceeding: matterIds.slice(0, 1),
      mattersHeld: matterIds.slice(1),
      boardRationale: 'Named matters may proceed while validation remains assigned.',
    };

    expect(getPacketReadinessCompletion(partial, Q1_CASE_PACK)).toMatchObject({
      followUpRequired: true,
      followUpCompleteWhenRequired: false,
      canLock: false,
    });
    expect(getRound0NextAction(partial, Q1_CASE_PACK).label).toBe(
      'Add a follow-up action',
    );

    const withFollowUp: PacketReadinessState = {
      ...partial,
      followUp: {
        action: 'Reconcile the records.',
        owner: 'QAPI Director',
        dueDate: '2026-04-15',
        returnDate: '2026-04-22',
      },
    };
    expect(getPacketReadinessCompletion(withFollowUp, Q1_CASE_PACK).canLock).toBe(
      true,
    );
  });

  it('generates the Board record from structured learner choices', () => {
    const preview = buildBoardRecordPreview(completeFullState(), Q1_CASE_PACK);

    expect(preview.disposition).toBe('Proceed on all matters — Full reliance');
    expect(preview.mattersProceeding.length).toBeGreaterThan(0);
    expect(preview.unresolvedEvidence).toHaveLength(0);
    expect(preview.rationale).toContain('Board record');
  });

  it('preserves traceable details only for unresolved evidence', () => {
    const unresolved = completeConflicts(
      createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups),
      'limited_unresolved',
    );
    const preview = buildBoardRecordPreview(unresolved, Q1_CASE_PACK);

    expect(preview.unresolvedEvidence).toHaveLength(
      Q1_CASE_PACK.packetConflictGroups.length,
    );
    expect(preview.unresolvedEvidence[0]).toMatchObject({
      id: Q1_CASE_PACK.packetConflictGroups[0].id,
      sourceCutoff: Q1_CASE_PACK.packetConflictGroups[0].sourceCutoff,
      classification: 'Unresolved for named matters',
      boardDecision: 'Rely on Record A',
    });
    expect(preview.unresolvedEvidence[0].recordIds).toHaveLength(2);
    expect(preview.unresolvedEvidence[0].affectedMatters.length).toBeGreaterThan(0);
    expect(preview.unresolvedEvidence[0].note).toContain('Board limitation');
  });

  it('compares record dates to the authored source cutoff', () => {
    expect(isAfterSourceCutoff('2026-04-10', '2026-04-09')).toBe(true);
    expect(isAfterSourceCutoff('2026-04-09', '2026-04-09')).toBe(false);
    expect(isAfterSourceCutoff('not-a-date', '2026-04-09')).toBe(false);
  });

  it('does not allow a locked record to be locked again', () => {
    const locked = {
      ...completeFullState(),
      lockedAt: '2026-04-09T18:05:00.000Z',
    };

    const completion = getPacketReadinessCompletion(locked, Q1_CASE_PACK);
    expect(completion.canLock).toBe(false);
    expect(completion.firstIncomplete).toBeNull();
  });
});
