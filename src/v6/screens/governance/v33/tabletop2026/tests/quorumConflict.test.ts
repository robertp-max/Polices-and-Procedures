// Acceptance: recompute after absence/ineligibility/recusal; conflicted
// blocked; excluded from denominator.

import { describe, it, expect } from 'vitest';
import {
  createGroupSessionState,
  groupSessionReducer,
  recomputeQuorum,
  type Participant,
  type ParticipantRole,
} from '../engine/groupState';

function participant(id: string, overrides: Partial<Participant> = {}, role: ParticipantRole = 'member'): Participant {
  return { id, name: id, role, present: true, recused: false, conflict: false, ...overrides };
}

function nineSeatRoster(): Participant[] {
  return Array.from({ length: 9 }, (_, i) => participant(`P${i + 1}`));
}

describe('quorumConflict — majority_of_voting_members recomputation', () => {
  it('a full, unconflicted 9-seat board has quorum with the standard majority threshold', () => {
    const state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: nineSeatRoster(),
    });
    const q = recomputeQuorum(state);
    expect(q.totalMembers).toBe(9);
    expect(q.eligibleVoters).toBe(9);
    expect(q.requiredVotes).toBe(5); // floor(9/2)+1
    expect(q.quorumMet).toBe(true);
  });

  it('a conflicted member is excluded from the eligible-voter denominator even though still counted in totalMembers', () => {
    let state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: nineSeatRoster(),
    });
    state = groupSessionReducer(state, { type: 'set_conflict', participantId: 'P1', conflict: true });
    const q = recomputeQuorum(state);
    expect(q.totalMembers).toBe(9);
    expect(q.eligibleVoters).toBe(8);
    expect(q.requiredVotes).toBe(5);
    expect(q.quorumMet).toBe(true);
  });

  it('recomputes after a cascading sequence of absence, conflict, and recusal — quorum can flip to not-met', () => {
    let state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: nineSeatRoster(),
    });

    state = groupSessionReducer(state, { type: 'set_conflict', participantId: 'P1', conflict: true });
    expect(recomputeQuorum(state).eligibleVoters).toBe(8);
    expect(recomputeQuorum(state).quorumMet).toBe(true);

    state = groupSessionReducer(state, { type: 'set_present', participantId: 'P2', present: false });
    state = groupSessionReducer(state, { type: 'set_present', participantId: 'P3', present: false });
    expect(recomputeQuorum(state).eligibleVoters).toBe(6);
    expect(recomputeQuorum(state).quorumMet).toBe(true);

    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'P4', recused: true });
    expect(recomputeQuorum(state).eligibleVoters).toBe(5);
    expect(recomputeQuorum(state).quorumMet).toBe(true); // exactly at threshold

    // One more ineligibility (absence) tips quorum below the required majority.
    state = groupSessionReducer(state, { type: 'set_present', participantId: 'P5', present: false });
    const finalQuorum = recomputeQuorum(state);
    expect(finalQuorum.eligibleVoters).toBe(4);
    expect(finalQuorum.requiredVotes).toBe(5);
    expect(finalQuorum.quorumMet).toBe(false);
  });

  it('a member who is both recused and conflicted is still only excluded once (no double-count) from the denominator', () => {
    let state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: nineSeatRoster(),
    });
    state = groupSessionReducer(state, { type: 'set_conflict', participantId: 'P1', conflict: true });
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'P1', recused: true });
    expect(recomputeQuorum(state).eligibleVoters).toBe(8);
  });

  it('non-voting attendees are excluded from the seated-member denominator and eligible-voter count', () => {
    const state = createGroupSessionState({
      sessionId: 's1',
      casePackId: 'cp',
      joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' },
      participants: [
        ...nineSeatRoster(),
        participant('FACILITATOR', {}, 'facilitator'),
        participant('OBSERVER', {}, 'observer'),
      ],
    });
    expect(recomputeQuorum(state)).toEqual({
      totalMembers: 9,
      eligibleVoters: 9,
      requiredVotes: 5,
      quorumMet: true,
    });
  });
});

describe('quorumConflict — fixed_count and fraction quorum rules', () => {
  it('fixed_count uses the literal configured count regardless of roster size', () => {
    const state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'fixed_count', count: 3 }, participants: nineSeatRoster(),
    });
    expect(recomputeQuorum(state).requiredVotes).toBe(3);
  });

  it('fraction rounds up to the nearest whole member', () => {
    const state = createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'fraction', numerator: 2, denominator: 3 }, participants: nineSeatRoster(),
    });
    // 9 * 2/3 = 6 exactly.
    expect(recomputeQuorum(state).requiredVotes).toBe(6);

    const eightSeat = createGroupSessionState({
      sessionId: 's2', casePackId: 'cp', joinCode: 'JOIN2',
      quorumRule: { kind: 'fraction', numerator: 2, denominator: 3 }, participants: nineSeatRoster().slice(0, 8),
    });
    // 8 * 2/3 = 5.33 -> ceil to 6.
    expect(recomputeQuorum(eightSeat).requiredVotes).toBe(6);
  });
});

describe('quorumConflict — vote matrix forces conflicted/recused/absent votes and excludes them from a substantive vote', () => {
  function baseState() {
    return createGroupSessionState({
      sessionId: 's1', casePackId: 'cp', joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' }, participants: nineSeatRoster(),
    });
  }

  it('an eligible present participant casts the vote they actually chose', () => {
    const state = groupSessionReducer(baseState(), {
      type: 'cast_vote', participantId: 'P1', matterId: 'M-1', vote: 'aye', timestampIso: '2026-01-01T00:00:00Z',
    });
    expect(state.voteMatrix).toEqual([{ participantId: 'P1', matterId: 'M-1', vote: 'aye' }]);
  });

  it('a conflicted participant\'s vote is forced to "recused" even if they attempt "aye"', () => {
    let state = baseState();
    state = groupSessionReducer(state, { type: 'set_conflict', participantId: 'P1', conflict: true });
    state = groupSessionReducer(state, {
      type: 'cast_vote', participantId: 'P1', matterId: 'M-1', vote: 'aye', timestampIso: '2026-01-01T00:00:00Z',
    });
    expect(state.voteMatrix).toEqual([{ participantId: 'P1', matterId: 'M-1', vote: 'recused' }]);
  });

  it('a recused participant\'s vote is forced to "recused"', () => {
    let state = baseState();
    state = groupSessionReducer(state, { type: 'set_recused', participantId: 'P2', recused: true });
    state = groupSessionReducer(state, {
      type: 'cast_vote', participantId: 'P2', matterId: 'M-1', vote: 'nay', timestampIso: '2026-01-01T00:00:00Z',
    });
    expect(state.voteMatrix).toEqual([{ participantId: 'P2', matterId: 'M-1', vote: 'recused' }]);
  });

  it('an absent participant\'s vote is forced to "not_present"', () => {
    let state = baseState();
    state = groupSessionReducer(state, { type: 'set_present', participantId: 'P3', present: false });
    state = groupSessionReducer(state, {
      type: 'cast_vote', participantId: 'P3', matterId: 'M-1', vote: 'aye', timestampIso: '2026-01-01T00:00:00Z',
    });
    expect(state.voteMatrix).toEqual([{ participantId: 'P3', matterId: 'M-1', vote: 'not_present' }]);
  });

  it('re-casting a vote for the same participant+matter replaces the prior entry rather than duplicating it', () => {
    let state = baseState();
    state = groupSessionReducer(state, {
      type: 'cast_vote', participantId: 'P1', matterId: 'M-1', vote: 'aye', timestampIso: '2026-01-01T00:00:00Z',
    });
    state = groupSessionReducer(state, {
      type: 'cast_vote', participantId: 'P1', matterId: 'M-1', vote: 'nay', timestampIso: '2026-01-01T00:01:00Z',
    });
    expect(state.voteMatrix).toEqual([{ participantId: 'P1', matterId: 'M-1', vote: 'nay' }]);
  });

  it('ignores an attempted substantive vote from a facilitator or observer', () => {
    const roster = [
      ...nineSeatRoster(),
      participant('FACILITATOR', {}, 'facilitator'),
      participant('OBSERVER', {}, 'observer'),
    ];
    let state = createGroupSessionState({
      sessionId: 's1',
      casePackId: 'cp',
      joinCode: 'JOIN1',
      quorumRule: { kind: 'majority_of_voting_members' },
      participants: roster,
    });
    state = groupSessionReducer(state, {
      type: 'cast_vote',
      participantId: 'FACILITATOR',
      matterId: 'M-1',
      vote: 'aye',
      timestampIso: '2026-01-01T00:00:00Z',
    });
    state = groupSessionReducer(state, {
      type: 'cast_vote',
      participantId: 'OBSERVER',
      matterId: 'M-1',
      vote: 'nay',
      timestampIso: '2026-01-01T00:00:00Z',
    });
    expect(state.voteMatrix).toEqual([]);
    expect(state.meetingRecord).toEqual([]);
  });
});
