// Matter-specific quorum + conflict/recusal computation.
//
// engine/groupState.ts's recomputeQuorum answers "is the general session
// quorate right now." This module answers the narrower, matter-scoped
// question the case content actually tests (see q2-n18): when a director
// discloses a conflict on ONE matter, that director must be excluded from
// both the vote AND the eligible-voter denominator used to judge quorum for
// THAT matter specifically — and if the agency's recusal policy requires
// stepping out of the room, remaining present is itself a violation even
// though attendance/general quorum is untouched. Pure — no React, no store.

import type { Participant, QuorumRule } from './engine/groupState';

/** A conflict declared for one specific matter — independent of a participant's session-wide `conflict` flag. */
export interface MatterConflict {
  participantId: string;
  reason: string;
  /** True when the agency's COI policy requires the conflicted member to leave the room, not merely abstain. */
  requiresStepOut: boolean;
}

export type QuorumViolationKind =
  | 'quorum_not_met_for_matter'
  | 'conflicted_participant_remained_in_room'
  | 'conflicted_participant_counted_in_denominator';

export interface QuorumViolation {
  kind: QuorumViolationKind;
  participantId?: string;
  message: string;
}

export interface MatterQuorumResult {
  matterId: string;
  seatedTotal: number;
  /** Seated directors minus those matter-conflicted — the correct denominator for THIS matter's quorum. */
  seatedEligibleForMatter: number;
  quorumThresholdForMatter: number;
  /** Present, non-conflicted (for this matter), non-recused directors currently countable toward quorum. */
  presentEligible: number;
  quorumMet: boolean;
  excludedForConflict: string[];
  recusedDirectorRemainedInRoom: boolean;
  violations: QuorumViolation[];
}

function requiredVotesForMatter(rule: QuorumRule, eligibleTotal: number): number {
  switch (rule.kind) {
    case 'majority_of_voting_members':
      return Math.floor(eligibleTotal / 2) + 1;
    case 'fixed_count':
      return Math.min(rule.count, eligibleTotal);
    case 'fraction':
      return Math.ceil(eligibleTotal * (rule.numerator / rule.denominator));
    default: {
      const neverRule: never = rule;
      throw new Error(`requiredVotesForMatter: unmapped QuorumRule ${String(neverRule)}`);
    }
  }
}

/**
 * Computes quorum for one matter, excluding matter-conflicted directors from
 * the denominator as well as the vote, and flagging a room-occupancy
 * violation when a step-out-required conflict was not actually enforced.
 *
 * `roomOccupancy` defaults to `participant.present` for anyone not listed —
 * pass explicit entries once a conflicted director is asked to step out so
 * the violation can be detected even though they remain marked "present"
 * for general attendance purposes.
 */
export function computeMatterQuorum(params: {
  matterId: string;
  participants: readonly Participant[];
  quorumRule: QuorumRule;
  conflicts?: readonly MatterConflict[];
  roomOccupancy?: Readonly<Record<string, boolean>>;
}): MatterQuorumResult {
  const { matterId, participants, quorumRule } = params;
  const conflicts = params.conflicts ?? [];
  const conflictByParticipant = new Map<string, MatterConflict>(conflicts.map((c) => [c.participantId, c]));
  const roomOccupancy = params.roomOccupancy ?? {};

  const seatedTotal = participants.length;
  const violations: QuorumViolation[] = [];
  const excludedForConflict: string[] = [];
  let recusedDirectorRemainedInRoom = false;

  let seatedEligibleForMatter = 0;
  let presentEligible = 0;

  for (const p of participants) {
    const conflict = conflictByParticipant.get(p.id);
    const matterConflicted = Boolean(conflict) || p.conflict || p.recused;

    if (matterConflicted) {
      excludedForConflict.push(p.id);
      const stillInRoom = roomOccupancy[p.id] ?? p.present;
      if (conflict?.requiresStepOut && stillInRoom) {
        recusedDirectorRemainedInRoom = true;
        violations.push({
          kind: 'conflicted_participant_remained_in_room',
          participantId: p.id,
          message: `${p.name} disclosed a conflict on this matter and must step out of deliberation, but is still shown in the room.`,
        });
      }
      continue;
    }

    seatedEligibleForMatter += 1;
    if (p.present) presentEligible += 1;
  }

  const quorumThresholdForMatter = requiredVotesForMatter(quorumRule, seatedEligibleForMatter);
  const quorumMet = presentEligible >= quorumThresholdForMatter;

  if (!quorumMet) {
    violations.push({
      kind: 'quorum_not_met_for_matter',
      message: `Only ${presentEligible} of ${seatedEligibleForMatter} eligible directors are present for this matter; ${quorumThresholdForMatter} are required.`,
    });
  }

  return {
    matterId,
    seatedTotal,
    seatedEligibleForMatter,
    quorumThresholdForMatter,
    presentEligible,
    quorumMet,
    excludedForConflict,
    recusedDirectorRemainedInRoom,
    violations,
  };
}

/** Convenience guard for a single participant: may they cast a substantive vote on this matter? */
export function isEligibleForMatter(
  participant: Participant,
  conflicts: readonly MatterConflict[] = [],
): boolean {
  if (!participant.present || participant.recused || participant.conflict) return false;
  return !conflicts.some((c) => c.participantId === participant.id);
}
