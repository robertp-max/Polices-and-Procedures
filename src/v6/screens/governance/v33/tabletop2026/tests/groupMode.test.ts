// Acceptance: roster/roles/recusal/quorum/vote matrix; group score != individual completion.

import { describe, it, expect } from 'vitest';
import {
  createGroupSessionState,
  groupSessionReducer,
  recomputeQuorum,
  type Participant,
  type ParticipantRole,
} from '../engine/groupState';
import { scoreAttempt } from '../engine/scoring';
import {
  emptyAttemptSelections,
  SCORE_DIMENSION_WEIGHTS,
  type CasePack,
  type DecisionNode,
  type TabletopDiagnostic,
} from '../engine/caseTypes';

function participant(id: string, role: ParticipantRole, overrides: Partial<Participant> = {}): Participant {
  return { id, name: id, role, present: true, recused: false, conflict: false, ...overrides };
}

function fullRoster(): Participant[] {
  return [
    participant('chair-1', 'chair'),
    participant('member-1', 'member'),
    participant('member-2', 'member'),
    participant('admin-1', 'administrator'),
    participant('cm-1', 'clinical_manager'),
    participant('co-1', 'compliance_officer'),
    participant('community-1', 'community_member'),
    participant('facilitator-1', 'facilitator'),
    participant('observer-1', 'observer'),
  ];
}

describe('groupMode — roster, roles, join code', () => {
  it('createGroupSessionState seeds the exact roster, roles, and join code given', () => {
    const state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'gb-tabletop-2026-q1', joinCode: 'FORGE42',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });
    expect(state.joinCode).toBe('FORGE42');
    expect(state.participants).toHaveLength(9);
    expect(state.participants.map((p) => p.role)).toEqual(
      ['chair', 'member', 'member', 'administrator', 'clinical_manager', 'compliance_officer', 'community_member', 'facilitator', 'observer'],
    );
    expect(state.currentMatterId).toBeNull();
    expect(state.activatedWorkflowIds).toEqual([]);
  });

  it('add_participant grows the roster without disturbing existing participants', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster().slice(0, 3),
    });
    state = groupSessionReducer(state, { type: 'add_participant', participant: participant('late-1', 'member') });
    expect(state.participants).toHaveLength(4);
    expect(state.participants[3].id).toBe('late-1');
  });
});

describe('groupMode — recusal toggle per participant', () => {
  it('set_recused flips exactly the targeted participant, leaving others untouched', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'member-1', recused: true });
    const member1 = state.participants.find((p) => p.id === 'member-1')!;
    const member2 = state.participants.find((p) => p.id === 'member-2')!;
    expect(member1.recused).toBe(true);
    expect(member2.recused).toBe(false);

    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'member-1', recused: false });
    expect(state.participants.find((p) => p.id === 'member-1')!.recused).toBe(false);
  });
});

describe('groupMode — quorum recompute integrates roster + recusal (see quorumConflict.test.ts for the exhaustive matrix)', () => {
  it('a 9-member board with one recusal still meets a majority quorum', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'community-1', recused: true });
    const q = recomputeQuorum(state);
    expect(q.totalMembers).toBe(7);
    expect(q.eligibleVoters).toBe(6);
    expect(q.requiredVotes).toBe(4);
    expect(q.quorumMet).toBe(true);
  });
});

describe('groupMode — live vote matrix across the roster', () => {
  it('produces one matrix entry per participant who has voted on the current matter, honoring forced values', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });
    state = groupSessionReducer(state, { type: 'open_matter', matterId: 'M-1', timestampIso: '2026-01-01T00:00:00Z' });
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'community-1', recused: true });
    state = groupSessionReducer(state, { type: 'set_present', participantId: 'observer-1', present: false });

    const castIso = '2026-01-01T00:05:00Z';
    for (const p of state.participants) {
      state = groupSessionReducer(state, { type: 'cast_vote', participantId: p.id, matterId: 'M-1', vote: 'aye', timestampIso: castIso });
    }

    const votesById = new Map(state.voteMatrix.map((v) => [v.participantId, v.vote]));
    expect(votesById.get('community-1')).toBe('recused');
    expect(votesById.get('observer-1')).toBeUndefined();
    expect(votesById.get('facilitator-1')).toBeUndefined();
    expect(votesById.get('chair-1')).toBe('aye');
    expect(votesById.get('member-1')).toBe('aye');
    expect(state.voteMatrix).toHaveLength(7); // voting members only, no duplicates

    // The vote events are also chronologically appended to the meeting record.
    const voteEvents = state.meetingRecord.filter((e) => e.type === 'vote');
    expect(voteEvents).toHaveLength(7);
  });
});

describe('groupMode — a passing group score does not itself certify any individual participant', () => {
  function node(overrides: Partial<DecisionNode>): DecisionNode {
    return {
      id: 'DN-X', matterId: 'M-1', round: 1, title: 't', prompt: 'p', kind: 'disposition',
      competencyIds: [], workflowIds: [], pointsAvailable: 10, requiredEvidenceIds: [], modelAction: null,
      rationale: 'r', alternativesWhyFail: [], formsRequired: [], deadlineExplanation: 'd',
      consequences: { patientSafety: '', regulatory: '', financial: '', privacy: '', recordIntegrity: '' },
      ...overrides,
    };
  }

  // One node per dimension so a fully-correct group attempt can genuinely reach 1000/1000 —
  // real per-dimension weight caps, not a vacuous single-node score.
  const dimensionNodes: DecisionNode[] = [
    node({ id: 'DN-1', kind: 'classify_evidence', pointsAvailable: SCORE_DIMENSION_WEIGHTS.evidence_integrity }),
    node({ id: 'DN-2', kind: 'quorum_calc', pointsAvailable: SCORE_DIMENSION_WEIGHTS.meeting_legality }),
    node({ id: 'DN-3', kind: 'proceed_decision', pointsAvailable: SCORE_DIMENSION_WEIGHTS.qapi_judgment }),
    node({ id: 'DN-4', kind: 'workflow_select', pointsAvailable: SCORE_DIMENSION_WEIGHTS.workflow_authority }),
    node({ id: 'DN-5', kind: 'motion_builder', pointsAvailable: SCORE_DIMENSION_WEIGHTS.decision_proportionality }),
    node({ id: 'DN-6', kind: 'public_minutes', pointsAvailable: SCORE_DIMENSION_WEIGHTS.records_forms }),
  ];

  function groupPack(): CasePack {
    return {
      id: 'group-scoring-fixture', quarter: 'Q1', title: 't', subtitle: 's', estMinutes: 1, sourceCutoff: '2026-01-01',
      exhibits: [], decisionNodes: dimensionNodes,
      packetConflictGroups: [],
      injects: [],
      surveyor: [{ id: 'SQ-1', prompt: 'p', options: [{ id: 'A', text: 'a' }], correctId: 'A', requiresEvidenceIds: [] }],
      transfers: [],
      requiredWorkflows: [], passScore: 950, passStandardNote: '',
    };
  }

  function passingDiagnostic(n: DecisionNode): TabletopDiagnostic {
    return {
      nodeId: n.id, period: 'Q1', competencyIds: [], workflowIds: [], userAction: null, modelAction: null,
      result: 'correct', pointsAvailable: n.pointsAvailable, pointsEarned: n.pointsAvailable,
      evidenceUsed: [], evidenceRequired: [], evidenceMissed: [], evidenceMisused: [],
      authorityExplanation: '', workflowExplanation: '', formsRequired: [], deadlineExplanation: '',
      whyUserActionSucceededOrFailed: '', whyAlternativesFail: [],
      consequences: { patientSafety: '', regulatory: '', financial: '', privacy: '', recordIntegrity: '' },
      remediation: { immediate: '', microLessonId: null, trueFalseItemIds: [], changedFactsPrompt: null },
    };
  }

  it('recording group diagnostics + a passing group score leaves every participant unattested until they explicitly attest', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });

    // A community member recused throughout the matter — present in the room, but never engages it.
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'community-1', recused: true });
    dimensionNodes.forEach((n) => {
      state = groupSessionReducer(state, { type: 'record_group_diagnostic', diagnostic: passingDiagnostic(n) });
    });

    // Only the chair and one member explicitly attest that they personally engaged the matter.
    state = groupSessionReducer(state, { type: 'attest', participantId: 'chair-1' });
    state = groupSessionReducer(state, { type: 'attest', participantId: 'member-1' });

    const selections = { ...emptyAttemptSelections(), surveyorSelections: { 'SQ-1': 'A' } };
    const groupScore = scoreAttempt(groupPack(), selections, state.groupDiagnostics);
    // The group's collective decision was recorded as a genuine, fully-passing score...
    expect(groupScore.total).toBe(1000);
    expect(groupScore.criticalErrors).toEqual([]);
    expect(groupScore.passed).toBe(true);

    // ...but that is a GROUP score, not an individual completion record. Attestation is tracked
    // per participant and is NOT auto-derived from the group's diagnostics/score.
    expect(state.individualAttestations['chair-1']).toBe(true);
    expect(state.individualAttestations['member-1']).toBe(true);
    expect(state.individualAttestations['community-1']).toBeUndefined();
    expect(state.individualAttestations['observer-1']).toBeUndefined();

    // A recused participant is excluded from quorum for the matter regardless of the group's score.
    const q = recomputeQuorum(state);
    expect(q.totalMembers).toBe(7);
    expect(q.eligibleVoters).toBe(6);
  });

  it('activate_workflow dedupes — facilitator marking the same workflow twice does not inflate coverage', () => {
    let state = createGroupSessionState({
      sessionId: 'sess-1', casePackId: 'cp', joinCode: 'J1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: fullRoster(),
    });
    state = groupSessionReducer(state, { type: 'activate_workflow', workflowId: 'GV-WF-05' });
    state = groupSessionReducer(state, { type: 'activate_workflow', workflowId: 'GV-WF-05' });
    state = groupSessionReducer(state, { type: 'activate_workflow', workflowId: 'GV-WF-06' });
    expect(state.activatedWorkflowIds).toEqual(['GV-WF-05', 'GV-WF-06']);
  });
});
