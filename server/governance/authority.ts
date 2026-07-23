import { createHash } from 'node:crypto';
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import type {
  AccessClass,
  AttendanceEvent,
  AuthorityDelegation,
  BoardRoleTerm,
  BylawCharterVersion,
  BreakGlassGrant,
  Committee,
  CommitteeMembership,
  ConflictManagementRestriction,
  EligibilitySnapshot,
  GovernanceAction,
  GovernanceAgenda,
  GovernanceAuthorityProfile,
  GovernanceMeeting,
  GoverningBodyMember,
  ThresholdRule,
} from './contracts.js';

export interface GovernanceAuthorityState {
  profile: GovernanceAuthorityProfile | null;
  bylawCharterVersions: BylawCharterVersion[];
  members: GoverningBodyMember[];
  roleTerms: BoardRoleTerm[];
  committees: Committee[];
  committeeMemberships: CommitteeMembership[];
  delegations: AuthorityDelegation[];
  restrictions: ConflictManagementRestriction[];
  breakGlassGrants: BreakGlassGrant[];
}

export interface ActionResource {
  meetingId?: string | null;
  committeeId?: string | null;
  agendaItemId?: string | null;
  matterId?: string | null;
  accessClass?: AccessClass;
}

export interface AuthorityDecision {
  permitted: boolean;
  reason: string;
  memberId: string | null;
  authorityProfileVersionId: string | null;
  breakGlassGrantId: string | null;
}

const TECHNICAL_ADMIN_GROUPS = new Set(['grp-super-admin', 'grp-admin', 'grp-system']);

const ROLE_ACTIONS: Record<BoardRoleTerm['role'], ReadonlySet<GovernanceAction>> = {
  chair: new Set([
    'meeting.create', 'meeting.publish_notice', 'meeting.publish_agenda', 'meeting.mark_ready',
    'meeting.call_to_order', 'meeting.adjourn', 'conflict.manage', 'board_book.create', 'board_book.lock',
    'decision.create', 'decision.triage', 'decision.place_in_packet', 'decision.record_disposition', 'motion.move',
    'motion.second', 'vote.cast', 'minutes.approve', 'minutes.sign', 'record.close',
    'action.effectiveness_disposition', 'record.view', 'record.download', 'record.print',
    'record.share', 'academy.attempt', 'break_glass.request',
  ]),
  vice_chair: new Set([
    'meeting.create', 'meeting.publish_notice', 'meeting.publish_agenda', 'meeting.mark_ready',
    'meeting.call_to_order', 'meeting.adjourn', 'conflict.manage', 'board_book.create', 'decision.create',
    'decision.triage', 'decision.place_in_packet', 'decision.record_disposition', 'motion.move', 'motion.second', 'vote.cast',
    'minutes.approve', 'minutes.sign', 'action.effectiveness_disposition', 'record.view',
    'record.download', 'record.print', 'academy.attempt',
  ]),
  secretary: new Set([
    'meeting.create', 'meeting.publish_notice', 'meeting.publish_agenda', 'meeting.mark_ready',
    'conflict.manage', 'board_book.create', 'board_book.certify_section', 'decision.create', 'decision.triage',
    'decision.place_in_packet', 'motion.move', 'motion.second', 'vote.cast', 'minutes.draft',
    'minutes.reconcile', 'minutes.sign', 'record.close', 'record.view', 'record.download',
    'record.print', 'record.share', 'academy.attempt',
  ]),
  treasurer: new Set([
    'decision.create', 'decision.triage', 'motion.move', 'motion.second', 'vote.cast',
    'minutes.approve', 'minutes.sign', 'action.effectiveness_disposition', 'record.view',
    'record.download', 'record.print', 'academy.attempt',
  ]),
  director: new Set([
    'decision.create', 'motion.move', 'motion.second', 'vote.cast', 'minutes.approve',
    'minutes.sign', 'action.effectiveness_disposition', 'record.view', 'record.download',
    'record.print', 'academy.attempt',
  ]),
  committee_chair: new Set([
    'meeting.create', 'meeting.publish_notice', 'meeting.publish_agenda', 'meeting.mark_ready',
    'meeting.call_to_order', 'meeting.adjourn', 'conflict.manage', 'board_book.create', 'decision.create',
    'decision.triage', 'decision.place_in_packet', 'motion.move', 'motion.second', 'vote.cast',
    'minutes.draft', 'minutes.reconcile', 'minutes.approve', 'minutes.sign', 'record.close',
    'action.effectiveness_disposition', 'record.view', 'record.download', 'record.print',
    'academy.attempt',
  ]),
};

const PRIVILEGED_CLASSES = new Set<AccessClass>([
  'attorney_client_privileged',
  'attorney_work_product',
]);

function inWindow(startsAt: string, endsAt: string | null, now: string): boolean {
  return startsAt <= now && (!endsAt || endsAt > now);
}

export function activeMemberForActor(
  actor: Actor,
  state: GovernanceAuthorityState,
  now: string,
): GoverningBodyMember | null {
  if (actor.type !== 'user' || !actor.user_id) return null;
  return state.members.find((member) =>
    member.personId === actor.user_id
    && member.status === 'active'
    && Boolean(member.appointmentArtifactId)
    && Boolean(member.votingSeatId)
    && (!member.appointedAt || member.appointedAt <= now),
  ) ?? null;
}

export function activeRoleTermsForMember(
  memberId: string,
  state: GovernanceAuthorityState,
  now: string,
): BoardRoleTerm[] {
  return state.roleTerms.filter((term) =>
    term.memberId === memberId
    && term.active
    && inWindow(term.startsAt, term.endsAt, now),
  );
}

function activeDelegationsForMember(
  memberId: string,
  action: GovernanceAction,
  state: GovernanceAuthorityState,
  now: string,
): AuthorityDelegation[] {
  return state.delegations.filter((delegation) =>
    delegation.granteeMemberId === memberId
    && !delegation.revokedAt
    && delegation.actions.includes(action)
    && inWindow(delegation.startsAt, delegation.endsAt, now),
  );
}

function hasActiveRestriction(
  memberId: string,
  resource: ActionResource,
  state: GovernanceAuthorityState,
  now: string,
): ConflictManagementRestriction | null {
  const matterIds = new Set([
    resource.matterId,
    resource.agendaItemId,
    resource.meetingId,
  ].filter(Boolean));
  return state.restrictions.find((restriction) =>
    restriction.memberId === memberId
    && restriction.status === 'active'
    && matterIds.has(restriction.matterId)
    && restriction.startsAt <= now
    && (!restriction.endsAt || restriction.endsAt > now),
  ) ?? null;
}

function restrictionBlocks(action: GovernanceAction, restriction: ConflictManagementRestriction): boolean {
  if (restriction.restriction === 'no_record_access' || restriction.restriction === 'exclude_session') return true;
  if (restriction.restriction === 'recuse_discussion') {
    return action.startsWith('motion.') || action.startsWith('decision.') || action === 'meeting.call_to_order';
  }
  if (restriction.restriction === 'recuse_vote') {
    return action === 'vote.cast' || action === 'decision.record_disposition';
  }
  return false;
}

function activeCommitteeMembership(
  memberId: string,
  committeeId: string,
  state: GovernanceAuthorityState,
  now: string,
): CommitteeMembership | null {
  return state.committeeMemberships.find((membership) =>
    membership.memberId === memberId
    && membership.committeeId === committeeId
    && inWindow(membership.startsAt, membership.endsAt, now),
  ) ?? null;
}

function activeBreakGlass(
  actor: Actor,
  accessClass: AccessClass,
  matterId: string | null | undefined,
  state: GovernanceAuthorityState,
  now: string,
): BreakGlassGrant | null {
  if (actor.type !== 'user' || !actor.user_id || !matterId) return null;
  return state.breakGlassGrants.find((grant) =>
    grant.requesterActorId === actor.user_id
    && grant.matterId === matterId
    && grant.accessClasses.includes(accessClass)
    && !grant.revokedAt
    && inWindow(grant.startsAt, grant.expiresAt, now)
    && Boolean(grant.approvalArtifactId)
    && grant.legalNotificationRecipientIds.length > 0,
  ) ?? null;
}

export function authorizeGovernanceAction(
  actor: Actor,
  action: GovernanceAction,
  resource: ActionResource,
  state: GovernanceAuthorityState,
  now: string,
): AuthorityDecision {
  const profile = state.profile;
  if (!profile || profile.approvalStatus !== 'approved' || profile.effectiveAt > now || profile.supersededAt) {
    return {
      permitted: false,
      reason: 'No approved, effective Governance Authority Profile is available.',
      memberId: null,
      authorityProfileVersionId: profile?.id ?? null,
      breakGlassGrantId: null,
    };
  }

  const bylaw = state.bylawCharterVersions.find((version) =>
    version.id === profile.sourceBylawVersionRecordId
    && version.documentType === 'bylaws'
    && version.approvalStatus === 'approved'
    && version.effectiveAt <= now
    && !version.supersededAt
    && version.artifactId === profile.sourceBylawArtifactId
    && version.documentVersion === profile.sourceBylawVersion,
  );
  if (!bylaw) {
    return {
      permitted: false,
      reason: 'The approved Governance Authority Profile is not backed by a current controlled bylaw version.',
      memberId: null,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: null,
    };
  }

  const accessClass = resource.accessClass ?? 'board_general';
  if (PRIVILEGED_CLASSES.has(accessClass) && actor.roles.some((role) => TECHNICAL_ADMIN_GROUPS.has(role))) {
    const grant = activeBreakGlass(actor, accessClass, resource.matterId, state, now);
    if (!grant) {
      return {
        permitted: false,
        reason: 'Technical administration does not confer privilege; an approved, purpose-bound break-glass grant is required.',
        memberId: null,
        authorityProfileVersionId: profile.id,
        breakGlassGrantId: null,
      };
    }
    if (!action.startsWith('record.')) {
      return {
        permitted: false,
        reason: 'Break-glass access permits only the approved record delivery operation, not governance action.',
        memberId: null,
        authorityProfileVersionId: profile.id,
        breakGlassGrantId: grant.id,
      };
    }
    return {
      permitted: true,
      reason: 'Approved purpose-bound break-glass access.',
      memberId: null,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: grant.id,
    };
  }

  const member = activeMemberForActor(actor, state, now);
  if (!member) {
    return {
      permitted: false,
      reason: 'No active, appointed Governing Body membership is bound to this identity.',
      memberId: null,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: null,
    };
  }
  if (!member.accessClasses.includes(accessClass) && accessClass !== 'public_published') {
    return {
      permitted: false,
      reason: 'The current member record does not grant this access class.',
      memberId: member.id,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: null,
    };
  }

  const restriction = hasActiveRestriction(member.id, resource, state, now);
  if (restriction && restrictionBlocks(action, restriction)) {
    return {
      permitted: false,
      reason: `Conflict restriction ${restriction.id} blocks ${action}.`,
      memberId: member.id,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: null,
    };
  }

  if (resource.committeeId) {
    const committee = state.committees.find((candidate) =>
      candidate.id === resource.committeeId && candidate.status === 'active',
    );
    const charter = committee ? state.bylawCharterVersions.find((version) =>
      version.id === committee.charterVersionId
      && version.documentType === 'committee_charter'
      && version.approvalStatus === 'approved'
      && version.effectiveAt <= now
      && !version.supersededAt,
    ) : null;
    const membership = activeCommitteeMembership(member.id, resource.committeeId, state, now);
    const charterActions = profile.committeeAuthority[resource.committeeId] ?? committee?.authority ?? [];
    if (!committee || !charter || !membership || !charterActions.includes(action)) {
      return {
        permitted: false,
        reason: 'The current committee charter or membership does not authorize this action.',
        memberId: member.id,
        authorityProfileVersionId: profile.id,
        breakGlassGrantId: null,
      };
    }
    if (action === 'vote.cast' && !membership.voting) {
      return {
        permitted: false,
        reason: 'The committee membership is advisory and not voting eligible.',
        memberId: member.id,
        authorityProfileVersionId: profile.id,
        breakGlassGrantId: null,
      };
    }
  }

  const terms = activeRoleTermsForMember(member.id, state, now);
  const roleAuthorized = terms.some((term) => ROLE_ACTIONS[term.role].has(action));
  const delegated = activeDelegationsForMember(member.id, action, state, now).length > 0;
  if (!roleAuthorized && !delegated) {
    return {
      permitted: false,
      reason: `No current Board role term, committee charter, or valid delegation authorizes ${action}.`,
      memberId: member.id,
      authorityProfileVersionId: profile.id,
      breakGlassGrantId: null,
    };
  }

  return {
    permitted: true,
    reason: delegated ? 'Authorized by a current, scoped delegation.' : 'Authorized by current Board role term.',
    memberId: member.id,
    authorityProfileVersionId: profile.id,
    breakGlassGrantId: null,
  };
}

export function requireGovernanceAction(
  actor: Actor,
  action: GovernanceAction,
  resource: ActionResource,
  state: GovernanceAuthorityState,
  now: string,
): AuthorityDecision {
  const decision = authorizeGovernanceAction(actor, action, resource, state, now);
  if (!decision.permitted) {
    throw new ApiError('permission_denied', 'You are not authorized to perform this governance action.', 403, {
      action,
      reason: decision.reason,
      authorityProfileVersionId: decision.authorityProfileVersionId,
    });
  }
  return decision;
}

function approvalsRequired(rule: ThresholdRule, eligibleCount: number, presentCount: number): number {
  switch (rule.kind) {
    case 'majority_present': return Math.floor(presentCount / 2) + 1;
    case 'majority_authorized': return Math.floor(eligibleCount / 2) + 1;
    case 'two_thirds_present': return Math.ceil((presentCount * 2) / 3);
    case 'two_thirds_authorized': return Math.ceil((eligibleCount * 2) / 3);
    case 'unanimous_authorized': return eligibleCount;
    case 'fixed': return rule.approvalsRequired;
  }
}

export function thresholdSatisfied(
  rule: ThresholdRule,
  approvals: number,
  eligibleCount: number,
  presentCount: number,
): boolean {
  return approvals >= approvalsRequired(rule, eligibleCount, presentCount);
}

export function quorumSatisfied(
  rule: ThresholdRule,
  eligibleCount: number,
  presentCount: number,
): boolean {
  return thresholdSatisfied(rule, presentCount, eligibleCount, presentCount);
}

function latestAttendance(events: AttendanceEvent[]): Map<string, AttendanceEvent> {
  const latest = new Map<string, AttendanceEvent>();
  [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)).forEach((event) => {
    latest.set(event.memberId, event);
  });
  return latest;
}

export function evaluateOpeningQuorum(input: {
  meeting: GovernanceMeeting;
  attendance: AttendanceEvent[];
  state: GovernanceAuthorityState;
  now: string;
}): { eligibleCount: number; presentMemberIds: string[]; quorumMet: boolean; rule: ThresholdRule } {
  const { meeting, state } = input;
  const profile = state.profile;
  if (!profile || profile.id !== meeting.authorityProfileVersionId || profile.approvalStatus !== 'approved') {
    throw new ApiError('validation_error', 'The meeting authority profile is unavailable or no longer approved.', 409);
  }
  const activeMembers = state.members.filter((member) =>
    member.status === 'active'
    && Boolean(member.appointmentArtifactId)
    && Boolean(member.votingSeatId)
    && profile.authorizedSeatIds.includes(member.votingSeatId as string),
  );
  const attendanceByMember = latestAttendance(input.attendance.filter((event) => event.meetingId === meeting.id));
  const presentMemberIds = activeMembers.filter((member) => {
    const event = attendanceByMember.get(member.id);
    return Boolean(event)
      && (event?.event === 'arrived' || event?.event === 'remote_connected')
      && (event.mode === 'in_person' || (profile.remoteAttendanceAllowed && event.communicationVerified));
  }).map((member) => member.id).sort();
  return {
    eligibleCount: activeMembers.length,
    presentMemberIds,
    quorumMet: quorumSatisfied(profile.openingQuorum, activeMembers.length, presentMemberIds.length),
    rule: profile.openingQuorum,
  };
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(',')}}`;
}

export function buildEligibilitySnapshot(input: {
  meeting: GovernanceMeeting;
  agenda: GovernanceAgenda;
  agendaItemId: string;
  attendance: AttendanceEvent[];
  state: GovernanceAuthorityState;
  now: string;
}): EligibilitySnapshot {
  const { meeting, agenda, agendaItemId, state, now } = input;
  const profile = state.profile;
  if (!profile || profile.id !== meeting.authorityProfileVersionId || profile.approvalStatus !== 'approved') {
    throw new ApiError('validation_error', 'The meeting authority profile is unavailable or no longer approved.', 409);
  }
  const agendaItem = agenda.items.find((item) => item.id === agendaItemId);
  if (!agendaItem) throw new ApiError('not_found', 'Agenda item not found.', 404);

  const activeMembers = state.members.filter((member) =>
    member.status === 'active'
    && Boolean(member.appointmentArtifactId)
    && Boolean(member.votingSeatId)
    && profile.authorizedSeatIds.includes(member.votingSeatId as string),
  );
  const attendanceByMember = latestAttendance(input.attendance.filter((event) => event.meetingId === meeting.id));
  const present = activeMembers.filter((member) => {
    const event = attendanceByMember.get(member.id);
    return Boolean(event)
      && (event?.event === 'arrived' || event?.event === 'remote_connected')
      && (event.mode === 'in_person' || (profile.remoteAttendanceAllowed && event.communicationVerified));
  });
  const recusedMemberIds = activeMembers.filter((member) => {
    const restriction = hasActiveRestriction(member.id, {
      meetingId: meeting.id,
      agendaItemId,
      matterId: agendaItem.decisionId ?? agendaItemId,
    }, state, now);
    return Boolean(restriction && (
      restriction.restriction === 'recuse_vote'
      || restriction.restriction === 'exclude_session'
      || restriction.restriction === 'no_record_access'
    ));
  }).map((member) => member.id);
  const eligibleMemberIds = present.map((member) => member.id).filter((id) => !recusedMemberIds.includes(id));
  const absentMemberIds = activeMembers.map((member) => member.id).filter((id) => !present.some((member) => member.id === id));
  const snapshotBase = {
    authorityProfileVersionId: profile.id,
    evaluatedAt: now,
    meetingId: meeting.id,
    agendaItemId,
    eligibleMemberIds: eligibleMemberIds.sort(),
    recusedMemberIds: recusedMemberIds.sort(),
    absentMemberIds: absentMemberIds.sort(),
    quorumMet: quorumSatisfied(profile.itemQuorum, activeMembers.length - recusedMemberIds.length, eligibleMemberIds.length),
    quorumRule: profile.itemQuorum,
  };
  return {
    ...snapshotBase,
    contentSha256: createHash('sha256').update(stableJson(snapshotBase)).digest('hex'),
  };
}
