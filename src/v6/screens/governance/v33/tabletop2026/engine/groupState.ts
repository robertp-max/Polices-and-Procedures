// Facilitated-group session state: participants, quorum, motions/votes, the
// live meeting record, inject release, and per-participant competency
// capture (so a group score and each attendee's individual attestation are
// tracked separately — a passing group decision does not itself certify an
// individual who was, say, recused throughout).

import type { GvWorkflowId, TabletopDiagnostic } from './caseTypes';

export type ParticipantRole =
  | 'chair'
  | 'member'
  | 'administrator'
  | 'clinical_manager'
  | 'compliance_officer'
  | 'community_member'
  | 'facilitator'
  | 'observer';

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  present: boolean;
  /** Current-matter recusal (conflict-driven or otherwise). Cleared when the matter closes. */
  recused: boolean;
  /** A declared conflict of interest exists, independent of whether recusal has been acted on yet. */
  conflict: boolean;
}

export type QuorumRule =
  | { kind: 'majority_of_voting_members' }
  | { kind: 'fixed_count'; count: number }
  | { kind: 'fraction'; numerator: number; denominator: number };

export interface QuorumStatus {
  totalMembers: number;
  /** Present, not recused, not conflicted for the matter under consideration. */
  eligibleVoters: number;
  requiredVotes: number;
  quorumMet: boolean;
}

export type VoteValue = 'aye' | 'nay' | 'abstain' | 'recused' | 'not_present';

export interface VoteMatrixEntry {
  participantId: string;
  matterId: string;
  vote: VoteValue;
}

export type MeetingEventType =
  | 'motion'
  | 'second'
  | 'amend'
  | 'vote'
  | 'dissent'
  | 'recuse'
  | 'inject_release'
  | 'note'
  | 'action'
  | 'next_up';

export interface MeetingEvent {
  id: string;
  type: MeetingEventType;
  matterId?: string;
  participantId?: string;
  text: string;
  timestampIso: string;
}

export interface CompetencyCapture {
  participantId: string;
  nodeId: string;
  result: TabletopDiagnostic['result'];
}

export interface GroupSessionState {
  sessionId: string;
  casePackId: string;
  joinCode: string;
  quorumRule: QuorumRule;
  participants: Participant[];
  currentMatterId: string | null;
  voteMatrix: VoteMatrixEntry[];
  meetingRecord: MeetingEvent[];
  releasedInjectIds: string[];
  competencyCaptures: CompetencyCapture[];
  /** Workflows the facilitated group has activated so far (mirrors engine/workflowTriggerEngine coverage). */
  activatedWorkflowIds: GvWorkflowId[];
  /** Group's collective decision diagnostics (one score for the session's decisions). */
  groupDiagnostics: TabletopDiagnostic[];
  /** Per-participant attestation that they personally engaged the matter (not a substitute for competency capture). */
  individualAttestations: Record<string, boolean>;
}

export function createGroupSessionState(input: {
  sessionId: string;
  casePackId: string;
  joinCode: string;
  quorumRule: QuorumRule;
  participants?: Participant[];
}): GroupSessionState {
  return {
    sessionId: input.sessionId,
    casePackId: input.casePackId,
    joinCode: input.joinCode,
    quorumRule: input.quorumRule,
    participants: input.participants ?? [],
    currentMatterId: null,
    voteMatrix: [],
    meetingRecord: [],
    releasedInjectIds: [],
    competencyCaptures: [],
    activatedWorkflowIds: [],
    groupDiagnostics: [],
    individualAttestations: {},
  };
}

export function isVotingMember(p: Participant): boolean {
  return p.role !== 'facilitator' && p.role !== 'observer';
}

/** A voting member is barred from the current matter if absent, recused, or conflicted. */
export function isEligibleVoter(p: Participant): boolean {
  return isVotingMember(p) && p.present && !p.recused && !p.conflict;
}

function requiredVotesFor(rule: QuorumRule, totalMembers: number): number {
  switch (rule.kind) {
    case 'majority_of_voting_members':
      return Math.floor(totalMembers / 2) + 1;
    case 'fixed_count':
      return rule.count;
    case 'fraction':
      return Math.ceil(totalMembers * (rule.numerator / rule.denominator));
    default: {
      const neverRule: never = rule;
      throw new Error(`requiredVotesFor: unmapped QuorumRule ${String(neverRule)}`);
    }
  }
}

/**
 * Recomputes quorum for the CURRENT matter after any recusal/absence change.
 * Conflicted+recused participants are excluded from both the numerator
 * (they cannot vote) and, per governance rule, from the eligible-voter
 * denominator used to judge whether quorum for THIS matter is met.
 */
export function recomputeQuorum(state: GroupSessionState): QuorumStatus {
  const totalMembers = state.participants.filter(isVotingMember).length;
  const eligibleVoters = state.participants.filter(isEligibleVoter).length;
  const requiredVotes = requiredVotesFor(state.quorumRule, totalMembers);
  return { totalMembers, eligibleVoters, requiredVotes, quorumMet: eligibleVoters >= requiredVotes };
}

export type GroupAction =
  | { type: 'add_participant'; participant: Participant }
  | { type: 'set_present'; participantId: string; present: boolean }
  | { type: 'set_recused'; participantId: string; recused: boolean }
  | { type: 'set_conflict'; participantId: string; conflict: boolean }
  | { type: 'open_matter'; matterId: string; timestampIso: string }
  | { type: 'motion'; participantId: string; matterId: string; text: string; timestampIso: string }
  | { type: 'second'; participantId: string; matterId: string; text: string; timestampIso: string }
  | { type: 'amend'; participantId: string; matterId: string; text: string; timestampIso: string }
  | { type: 'cast_vote'; participantId: string; matterId: string; vote: VoteValue; timestampIso: string }
  | { type: 'dissent'; participantId: string; matterId: string; text: string; timestampIso: string }
  | { type: 'release_inject'; injectId: string; text: string; timestampIso: string }
  | { type: 'capture_competency'; capture: CompetencyCapture }
  | { type: 'record_group_diagnostic'; diagnostic: TabletopDiagnostic }
  | { type: 'activate_workflow'; workflowId: GvWorkflowId }
  | { type: 'attest'; participantId: string }
  | { type: 'note'; participantId?: string; matterId?: string; text: string; timestampIso: string };

let eventCounter = 0;
function nextEventId(): string {
  eventCounter += 1;
  return `evt-${eventCounter}`;
}

function pushEvent(state: GroupSessionState, event: Omit<MeetingEvent, 'id'>): MeetingEvent[] {
  return [...state.meetingRecord, { ...event, id: nextEventId() }];
}

export function groupSessionReducer(state: GroupSessionState, action: GroupAction): GroupSessionState {
  switch (action.type) {
    case 'add_participant':
      return { ...state, participants: [...state.participants, action.participant] };

    case 'set_present':
      return {
        ...state,
        participants: state.participants.map((p) => (p.id === action.participantId ? { ...p, present: action.present } : p)),
      };

    case 'set_recused':
      return {
        ...state,
        participants: state.participants.map((p) => (p.id === action.participantId ? { ...p, recused: action.recused } : p)),
      };

    case 'set_conflict':
      return {
        ...state,
        participants: state.participants.map((p) => (p.id === action.participantId ? { ...p, conflict: action.conflict } : p)),
      };

    case 'open_matter':
      return {
        ...state,
        currentMatterId: action.matterId,
        meetingRecord: pushEvent(state, { type: 'next_up', matterId: action.matterId, text: `Matter opened: ${action.matterId}`, timestampIso: action.timestampIso }),
      };

    case 'motion':
      return { ...state, meetingRecord: pushEvent(state, { type: 'motion', matterId: action.matterId, participantId: action.participantId, text: action.text, timestampIso: action.timestampIso }) };

    case 'second':
      return { ...state, meetingRecord: pushEvent(state, { type: 'second', matterId: action.matterId, participantId: action.participantId, text: action.text, timestampIso: action.timestampIso }) };

    case 'amend':
      return { ...state, meetingRecord: pushEvent(state, { type: 'amend', matterId: action.matterId, participantId: action.participantId, text: action.text, timestampIso: action.timestampIso }) };

    case 'cast_vote': {
      const participant = state.participants.find((p) => p.id === action.participantId);
      if (participant && !isVotingMember(participant)) return state;
      // A recused/conflicted or absent participant cannot cast a substantive vote — the vote is forced.
      const forcedVote: VoteValue = !participant
        ? action.vote
        : !participant.present
          ? 'not_present'
          : (participant.recused || participant.conflict)
            ? 'recused'
            : action.vote;
      const filtered = state.voteMatrix.filter((v) => !(v.participantId === action.participantId && v.matterId === action.matterId));
      return {
        ...state,
        voteMatrix: [...filtered, { participantId: action.participantId, matterId: action.matterId, vote: forcedVote }],
        meetingRecord: pushEvent(state, { type: 'vote', matterId: action.matterId, participantId: action.participantId, text: `Vote: ${forcedVote}`, timestampIso: action.timestampIso }),
      };
    }

    case 'dissent':
      return { ...state, meetingRecord: pushEvent(state, { type: 'dissent', matterId: action.matterId, participantId: action.participantId, text: action.text, timestampIso: action.timestampIso }) };

    case 'release_inject':
      if (state.releasedInjectIds.includes(action.injectId)) return state;
      return {
        ...state,
        releasedInjectIds: [...state.releasedInjectIds, action.injectId],
        meetingRecord: pushEvent(state, { type: 'inject_release', text: action.text, timestampIso: action.timestampIso }),
      };

    case 'capture_competency':
      return { ...state, competencyCaptures: [...state.competencyCaptures, action.capture] };

    case 'record_group_diagnostic':
      return { ...state, groupDiagnostics: [...state.groupDiagnostics, action.diagnostic] };

    case 'activate_workflow':
      if (state.activatedWorkflowIds.includes(action.workflowId)) return state;
      return { ...state, activatedWorkflowIds: [...state.activatedWorkflowIds, action.workflowId] };

    case 'attest':
      return { ...state, individualAttestations: { ...state.individualAttestations, [action.participantId]: true } };

    case 'note':
      return { ...state, meetingRecord: pushEvent(state, { type: 'note', matterId: action.matterId, participantId: action.participantId, text: action.text, timestampIso: action.timestampIso }) };

    default: {
      const neverAction: never = action;
      throw new Error(`groupSessionReducer: unhandled action ${String((neverAction as { type?: string })?.type)}`);
    }
  }
}
