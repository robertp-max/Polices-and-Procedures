import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import {
  buildEligibilitySnapshot,
  evaluateOpeningQuorum,
  requireGovernanceAction,
  thresholdSatisfied,
  type GovernanceAuthorityState,
} from './authority.js';
import type { ArtifactResolver, EcignAdapter } from './adapters.js';
import { manifestSha256 } from './adapters.js';
import type {
  AgendaItem,
  AttendanceEvent,
  BoardBook,
  BoardBookDistribution,
  BoardBookSection,
  ConflictDisclosure,
  ConflictManagementRestriction,
  FrozenBoardBookManifest,
  GovernanceActionItem,
  GovernanceAgenda,
  GovernanceAuthorityProfile,
  GovernanceDecision,
  GovernanceMeeting,
  GovernanceMinutes,
  GovernanceMotion,
  GovernanceVote,
  MeetingNoticePublication,
  MeetingSessionEvent,
  SourceAuthorityMetadata,
  VerifiedActionArtifact,
  WrittenConsent,
} from './contracts.js';
import {
  actorId,
  governanceMutation,
  mutationContext,
  newRecordBase,
  nextRecordBase,
  write,
  type CommandContext,
} from './mutations.js';
import type { GovernanceRepository } from './repository.js';
import { evaluateSourceGate, requireSourceGate } from './sourcePosture.js';

export interface GovernanceMeetingServiceDependencies {
  repository: GovernanceRepository;
  artifacts: ArtifactResolver;
  ecign: EcignAdapter;
}

function ensure(condition: unknown, message: string, status = 409): asserts condition {
  if (!condition) throw new ApiError('validation_error', message, status);
}

function recordAccessClass(record: GovernanceDecision | GovernanceMeeting): 'board_general' {
  void record;
  return 'board_general';
}

export class GovernanceMeetingService {
  constructor(private readonly deps: GovernanceMeetingServiceDependencies) {}

  async authorityState(organizationId: string): Promise<GovernanceAuthorityState> {
    const profiles = await this.deps.repository.list<GovernanceAuthorityProfile>(organizationId, 'authority_profile');
    const approvedProfiles = profiles
      .filter((profile) => profile.approvalStatus === 'approved' && !profile.supersededAt)
      .sort((a, b) => b.effectiveAt.localeCompare(a.effectiveAt));
    return {
      profile: approvedProfiles[0] ?? null,
      bylawCharterVersions: await this.deps.repository.list(organizationId, 'bylaw_charter_version'),
      members: await this.deps.repository.list(organizationId, 'member'),
      roleTerms: await this.deps.repository.list(organizationId, 'role_term'),
      committees: await this.deps.repository.list(organizationId, 'committee'),
      committeeMemberships: await this.deps.repository.list(organizationId, 'committee_membership'),
      delegations: await this.deps.repository.list(organizationId, 'authority_delegation'),
      restrictions: await this.deps.repository.list(organizationId, 'conflict_restriction'),
      breakGlassGrants: await this.deps.repository.list(organizationId, 'break_glass'),
    };
  }

  private async authorize(
    context: CommandContext,
    action: Parameters<typeof requireGovernanceAction>[1],
    resource: Parameters<typeof requireGovernanceAction>[2] = {},
  ) {
    const state = await this.authorityState(context.organizationId);
    const decision = requireGovernanceAction(context.actor, action, resource, state, context.now);
    return { state, decision };
  }

  async createMeeting(context: CommandContext, input: {
    meetingType: GovernanceMeeting['meetingType'];
    title: string;
    committeeId?: string | null;
    authorityProfileVersionId: string;
    scheduledStart: string;
    timezone: string;
  }): Promise<GovernanceMeeting> {
    const { state } = await this.authorize(context, 'meeting.create', { committeeId: input.committeeId });
    ensure(state.profile?.id === input.authorityProfileVersionId, 'The requested authority profile is not the current approved profile.');
    if (input.meetingType === 'committee') ensure(Boolean(input.committeeId), 'Committee meeting requires a committee.');
    if (input.meetingType !== 'committee') ensure(!input.committeeId, 'Only committee meetings may specify a committee.');
    const meeting: GovernanceMeeting = {
      ...newRecordBase(context),
      meetingType: input.meetingType,
      title: input.title,
      committeeId: input.committeeId ?? null,
      authorityProfileVersionId: input.authorityProfileVersionId,
      scheduledStart: input.scheduledStart,
      timezone: input.timezone,
      status: 'draft',
      noticeArtifactId: null,
      noticeSourceMetadataId: null,
      noticeContentSha256: null,
      noticeVersion: 0,
      noticePublishedAt: null,
      noticeRecipientMemberIds: [],
      noticePublicationId: null,
      agendaId: null,
      boardBookId: null,
      calledToOrderAt: null,
      adjournedAt: null,
      minutesId: null,
      supersedesMeetingId: null,
    };
    const mutation = governanceMutation({
      context,
      scope: 'meeting.create',
      request: input,
      writes: [write('meeting', meeting, null)],
      response: meeting,
      eventType: 'governance.meeting.created',
      action: 'meeting.create',
      resourceType: 'meeting',
      resourceId: meeting.id,
      payload: { meetingType: meeting.meetingType, authorityProfileVersionId: meeting.authorityProfileVersionId },
    });
    return this.deps.repository.transact(mutationContext(context), mutation);
  }

  async publishNotice(context: CommandContext, input: {
    meetingId: string;
    expectedVersion: number;
    noticeArtifactId: string;
    sourceMetadataId: string;
    noticeVersion: number;
    recipientMemberIds?: string[];
  }): Promise<GovernanceMeeting> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    await this.authorize(context, 'meeting.publish_notice', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
    });
    ensure(meeting.version === input.expectedVersion, 'Meeting version conflict.');
    ensure(['draft', 'notice_published'].includes(meeting.status), 'Notice cannot be published in the current meeting state.');
    ensure(input.noticeVersion > meeting.noticeVersion, 'Notice version must increase.');
    const metadata = await this.requireSource(context.organizationId, input.sourceMetadataId);
    requireSourceGate([metadata], 'execution');
    const verified = await this.deps.artifacts.verify({
      artifactId: input.noticeArtifactId,
      organizationId: context.organizationId,
      meetingId: meeting.id,
      actorId: actorId(context),
      requiredAccessClass: 'board_general',
      sourceMetadata: metadata,
    });
    const state = await this.authorityState(context.organizationId);
    const recipients = [...new Set(input.recipientMemberIds
      ?? state.members.filter((member) => member.status === 'active').map((member) => member.id))].sort();
    ensure(recipients.length > 0, 'Meeting notice requires at least one active recipient.');
    ensure(recipients.every((id) => state.members.some((member) => member.id === id && member.status === 'active')), 'Meeting notice recipient is not an active Board member.');
    const publication: MeetingNoticePublication = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      noticeVersion: input.noticeVersion,
      artifactId: verified.artifactId,
      sourceMetadataId: metadata.id,
      contentSha256: verified.contentSha256,
      publishedAt: context.now,
      recipientMemberIds: recipients,
      supersedesNoticePublicationId: meeting.noticePublicationId,
    };
    const updated: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'notice_published',
      noticeArtifactId: verified.artifactId,
      noticeSourceMetadataId: metadata.id,
      noticeContentSha256: verified.contentSha256,
      noticeVersion: input.noticeVersion,
      noticePublishedAt: context.now,
      noticeRecipientMemberIds: recipients,
      noticePublicationId: publication.id,
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.publish_notice:${meeting.id}`,
      request: input,
      writes: [write('meeting', updated, meeting.version), write('notice_publication', publication, null)],
      response: updated,
      eventType: 'governance.meeting.notice_published',
      action: 'meeting.publish_notice',
      resourceType: 'notice_publication',
      resourceId: publication.id,
      payload: { meetingId: meeting.id, noticeVersion: updated.noticeVersion, artifactId: updated.noticeArtifactId, contentSha256: updated.noticeContentSha256, recipientMemberIds: recipients, supersedesNoticePublicationId: publication.supersedesNoticePublicationId },
    }));
  }

  async publishAgenda(context: CommandContext, input: {
    meetingId: string;
    meetingExpectedVersion: number;
    agendaExpectedVersion: number | null;
    agendaVersion: number;
    amendmentReason?: string | null;
    items: AgendaItem[];
  }): Promise<{ meeting: GovernanceMeeting; agenda: GovernanceAgenda }> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    await this.authorize(context, 'meeting.publish_agenda', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
    });
    ensure(meeting.version === input.meetingExpectedVersion, 'Meeting version conflict.');
    ensure(meeting.noticeArtifactId, 'A verified notice must be published before the agenda.');
    const existing = meeting.agendaId
      ? await this.deps.repository.get<GovernanceAgenda>(context.organizationId, 'agenda', meeting.agendaId)
      : null;
    ensure((existing?.version ?? null) === input.agendaExpectedVersion, 'Agenda version conflict.');
    ensure(input.agendaVersion > (existing?.agendaVersion ?? 0), 'Agenda version must increase.');
    ensure(new Set(input.items.map((item) => item.id)).size === input.items.length, 'Agenda item IDs must be unique.');
    ensure(new Set(input.items.map((item) => item.sequence)).size === input.items.length, 'Agenda sequences must be unique.');
    const sources = await this.loadSources(context.organizationId, input.items.flatMap((item) => item.sourceMetadataIds));
    const gate = evaluateSourceGate(sources, 'review');
    ensure(!gate.blocked, `Agenda source posture blocks review: ${gate.reasons.join('; ')}`);
    if (existing) ensure(input.amendmentReason, 'Agenda amendments require a recorded reason.');
    const agenda: GovernanceAgenda = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      agendaVersion: input.agendaVersion,
      status: existing ? 'amended' : 'published',
      publishedAt: context.now,
      amendmentReason: input.amendmentReason ?? null,
      items: [...input.items].sort((a, b) => a.sequence - b.sequence),
    };
    const supersededAgenda: GovernanceAgenda | null = existing ? {
      ...existing,
      ...nextRecordBase(context, existing),
      status: 'superseded',
    } : null;
    const updatedMeeting: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'agenda_published',
      agendaId: agenda.id,
    };
    const response = { meeting: updatedMeeting, agenda };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.publish_agenda:${meeting.id}`,
      request: input,
      writes: [
        ...(supersededAgenda ? [write('agenda', supersededAgenda, existing?.version ?? null)] : []),
        write('agenda', agenda, null),
        write('meeting', updatedMeeting, meeting.version),
      ],
      response,
      eventType: existing ? 'governance.agenda.amended' : 'governance.agenda.published',
      action: 'meeting.publish_agenda',
      resourceType: 'agenda',
      resourceId: agenda.id,
      payload: { agendaVersion: agenda.agendaVersion, itemCount: agenda.items.length, sourceImpact: gate.impact },
    }));
  }

  async recordAttendance(context: CommandContext, input: Omit<AttendanceEvent, keyof ReturnType<typeof newRecordBase>>): Promise<AttendanceEvent> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    const { state } = await this.authorize(context, 'minutes.draft', { meetingId: meeting.id, committeeId: meeting.committeeId });
    ensure(state.members.some((member) => member.id === input.memberId && member.status === 'active'), 'Attendance member is not an active Board member.');
    if (input.mode === 'remote') ensure(state.profile?.remoteAttendanceAllowed, 'Remote attendance is not authorized by the current profile.');
    const event: AttendanceEvent = { ...newRecordBase(context), ...input };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.attendance:${meeting.id}:${event.memberId}:${event.event}`,
      request: input,
      writes: [write('attendance_event', event, null)],
      response: event,
      eventType: 'governance.meeting.attendance_recorded',
      action: 'minutes.draft',
      resourceType: 'attendance_event',
      resourceId: event.id,
      payload: { meetingId: meeting.id, memberId: event.memberId, event: event.event, mode: event.mode },
    }));
  }

  async recordConflict(context: CommandContext, input: Omit<ConflictDisclosure, keyof ReturnType<typeof newRecordBase>>): Promise<ConflictDisclosure> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    const state = await this.authorityState(context.organizationId);
    const actorMember = state.members.find((member) => member.personId === context.actor.user_id && member.status === 'active');
    if (actorMember?.id !== input.memberId) {
      requireGovernanceAction(context.actor, 'minutes.draft', { meetingId: meeting.id, agendaItemId: input.agendaItemId }, state, context.now);
    }
    const agenda = await this.requireAgenda(context.organizationId, meeting);
    ensure(agenda.items.some((item) => item.id === input.agendaItemId), 'Agenda item does not belong to the meeting.');
    ensure(state.members.some((member) => member.id === input.memberId), 'Conflict member not found.');
    const restrictions = state.restrictions.filter((restriction) => input.restrictionIds.includes(restriction.id));
    ensure(restrictions.length === input.restrictionIds.length, 'Conflict restriction is unavailable.');
    ensure(restrictions.every((restriction) => restriction.memberId === input.memberId
      && restriction.matterId === input.agendaItemId
      && restriction.status === 'active'), 'Conflict restriction does not apply to this member and agenda item.');
    const disclosure: ConflictDisclosure = { ...newRecordBase(context), ...input };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.conflict:${meeting.id}:${input.agendaItemId}:${input.memberId}`,
      request: input,
      writes: [write('conflict_disclosure', disclosure, null)],
      response: disclosure,
      eventType: 'governance.meeting.conflict_disclosed',
      action: 'minutes.draft',
      resourceType: 'conflict_disclosure',
      resourceId: disclosure.id,
      payload: { meetingId: meeting.id, agendaItemId: input.agendaItemId, memberId: input.memberId, restrictionIds: input.restrictionIds },
    }));
  }

  async createConflictRestriction(context: CommandContext, input: {
    meetingId: string;
    agendaItemId: string;
    memberId: string;
    restriction: ConflictManagementRestriction['restriction'];
    basis: string;
    startsAt: string;
    endsAt?: string | null;
  }): Promise<ConflictManagementRestriction> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    const agenda = await this.requireAgenda(context.organizationId, meeting);
    await this.authorize(context, 'conflict.manage', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      agendaItemId: input.agendaItemId,
      matterId: input.agendaItemId,
    });
    ensure(agenda.items.some((item) => item.id === input.agendaItemId), 'Conflict restriction agenda item is unavailable.');
    const state = await this.authorityState(context.organizationId);
    ensure(state.members.some((member) => member.id === input.memberId && member.status === 'active'), 'Conflict restriction member is not active.');
    ensure(!input.endsAt || input.endsAt > input.startsAt, 'Conflict restriction end must follow its start.');
    const duplicate = state.restrictions.some((restriction) =>
      restriction.memberId === input.memberId
      && restriction.matterId === input.agendaItemId
      && restriction.restriction === input.restriction
      && restriction.status === 'active'
      && (!restriction.endsAt || restriction.endsAt > context.now),
    );
    ensure(!duplicate, 'An active matching conflict restriction already exists.');
    const restriction: ConflictManagementRestriction = {
      ...newRecordBase(context),
      memberId: input.memberId,
      matterId: input.agendaItemId,
      restriction: input.restriction,
      basis: input.basis,
      startsAt: input.startsAt,
      endsAt: input.endsAt ?? null,
      status: 'active',
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `conflict.restriction:${meeting.id}:${input.agendaItemId}:${input.memberId}:${input.restriction}`,
      request: input,
      writes: [write('conflict_restriction', restriction, null)],
      response: restriction,
      eventType: 'governance.conflict.restriction_created',
      action: 'conflict.manage',
      resourceType: 'conflict_restriction',
      resourceId: restriction.id,
      payload: { meetingId: meeting.id, agendaItemId: input.agendaItemId, memberId: input.memberId, restriction: input.restriction },
    }));
  }

  async recordSessionTransition(context: CommandContext, input: {
    meetingId: string;
    agendaItemId: string | null;
    event: MeetingSessionEvent['event'];
    basis: string;
    occurredAt: string;
  }): Promise<MeetingSessionEvent> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    ensure(meeting.status === 'in_session', 'Executive-session transitions require an in-session meeting.');
    const agenda = await this.requireAgenda(context.organizationId, meeting);
    await this.authorize(context, 'meeting.call_to_order', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      agendaItemId: input.agendaItemId,
      matterId: input.agendaItemId,
      accessClass: 'executive_session',
    });
    const prior = (await this.deps.repository.list<MeetingSessionEvent>(context.organizationId, 'session_event'))
      .filter((event) => event.meetingId === meeting.id)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    const latest = prior.at(-1);
    const currentlyExecutive = latest?.event === 'entered_executive_session';
    if (input.event === 'entered_executive_session') {
      ensure(!currentlyExecutive, 'Meeting is already in executive session.');
      ensure(input.agendaItemId, 'Executive session requires an agenda item.');
      const item = agenda.items.find((candidate) => candidate.id === input.agendaItemId);
      ensure(item?.purpose === 'executive_session' && item.accessClass === 'executive_session', 'Agenda item is not approved for executive session.');
    } else {
      ensure(currentlyExecutive, 'Meeting is not in executive session.');
      ensure(!input.agendaItemId || input.agendaItemId === latest?.agendaItemId, 'Open-session return does not match the active executive item.');
    }
    ensure(input.occurredAt >= (latest?.occurredAt ?? meeting.calledToOrderAt ?? meeting.scheduledStart), 'Session event time is out of order.');
    const event: MeetingSessionEvent = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      agendaItemId: input.agendaItemId ?? latest?.agendaItemId ?? null,
      event: input.event,
      basis: input.basis,
      accessClass: 'executive_session',
      occurredAt: input.occurredAt,
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.session:${meeting.id}:${event.event}:${prior.length}`,
      request: input,
      writes: [write('session_event', event, null)],
      response: event,
      eventType: `governance.meeting.${event.event}`,
      action: 'meeting.call_to_order',
      resourceType: 'session_event',
      resourceId: event.id,
      payload: { meetingId: meeting.id, agendaItemId: event.agendaItemId, accessClass: event.accessClass },
    }));
  }

  async markMeetingReady(context: CommandContext, meetingId: string, expectedVersion: number): Promise<GovernanceMeeting> {
    const meeting = await this.requireMeeting(context.organizationId, meetingId);
    const { state } = await this.authorize(context, 'meeting.mark_ready', { meetingId, committeeId: meeting.committeeId });
    ensure(meeting.version === expectedVersion, 'Meeting version conflict.');
    ensure(meeting.noticeArtifactId
      && meeting.noticeSourceMetadataId
      && meeting.noticeContentSha256
      && meeting.noticePublishedAt
      && meeting.noticeRecipientMemberIds.length > 0, 'Verified notice publication and recipients are missing.');
    const noticeSource = await this.requireSource(context.organizationId, meeting.noticeSourceMetadataId);
    requireSourceGate([noticeSource], 'execution');
    const agenda = await this.requireAgenda(context.organizationId, meeting);
    ensure(['published', 'amended'].includes(agenda.status), 'Published agenda is missing.');
    const sources = await this.loadSources(context.organizationId, agenda.items.flatMap((item) => item.sourceMetadataIds));
    requireSourceGate(sources, 'execution');
    ensure(meeting.boardBookId, 'Board book is missing.');
    const book = await this.requireBoardBook(context.organizationId, meeting.boardBookId);
    ensure(book.status === 'locked' && book.manifestId, 'Board book manifest is not locked.');
    ensure(state.profile?.id === meeting.authorityProfileVersionId, 'Meeting authority profile is no longer current.');
    const updated: GovernanceMeeting = { ...meeting, ...nextRecordBase(context, meeting), status: 'ready' };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.mark_ready:${meeting.id}`,
      request: { meetingId, expectedVersion },
      writes: [write('meeting', updated, meeting.version)],
      response: updated,
      eventType: 'governance.meeting.ready',
      action: 'meeting.mark_ready',
      resourceType: 'meeting',
      resourceId: meeting.id,
      payload: { authorityProfileVersionId: meeting.authorityProfileVersionId, boardBookManifestId: book.manifestId },
    }));
  }

  async callToOrder(context: CommandContext, meetingId: string, expectedVersion: number): Promise<{ meeting: GovernanceMeeting; openingQuorum: ReturnType<typeof evaluateOpeningQuorum> }> {
    const meeting = await this.requireMeeting(context.organizationId, meetingId);
    const { state } = await this.authorize(context, 'meeting.call_to_order', { meetingId, committeeId: meeting.committeeId });
    ensure(meeting.version === expectedVersion, 'Meeting version conflict.');
    ensure(meeting.status === 'ready', 'Meeting must be marked ready before call to order.');
    const attendance = await this.deps.repository.list<AttendanceEvent>(context.organizationId, 'attendance_event');
    const openingQuorum = evaluateOpeningQuorum({ meeting, attendance, state, now: context.now });
    ensure(openingQuorum.quorumMet, 'Opening quorum is not present under the approved authority profile.');
    const updated: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'in_session',
      calledToOrderAt: context.now,
    };
    const response = { meeting: updated, openingQuorum };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.call_to_order:${meeting.id}`,
      request: { meetingId, expectedVersion },
      writes: [write('meeting', updated, meeting.version)],
      response,
      eventType: 'governance.meeting.called_to_order',
      action: 'meeting.call_to_order',
      resourceType: 'meeting',
      resourceId: meeting.id,
      payload: openingQuorum,
    }));
  }

  async adjourn(context: CommandContext, meetingId: string, expectedVersion: number): Promise<{ meeting: GovernanceMeeting; minutes: GovernanceMinutes }> {
    const meeting = await this.requireMeeting(context.organizationId, meetingId);
    const { state } = await this.authorize(context, 'meeting.adjourn', { meetingId, committeeId: meeting.committeeId });
    ensure(meeting.version === expectedVersion, 'Meeting version conflict.');
    ensure(meeting.status === 'in_session', 'Only an in-session meeting may be adjourned.');
    const sessionEvents = (await this.deps.repository.list<MeetingSessionEvent>(context.organizationId, 'session_event'))
      .filter((event) => event.meetingId === meeting.id)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    ensure(sessionEvents.at(-1)?.event !== 'entered_executive_session', 'Meeting must return to open session before adjournment.');
    const secretaryTerms = state.roleTerms.filter((term) => term.role === 'secretary' && term.active && term.startsAt <= context.now && (!term.endsAt || term.endsAt > context.now));
    ensure(secretaryTerms.length > 0, 'No current Board Secretary is available for the minutes record.');
    const minutes: GovernanceMinutes = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      status: 'event_draft',
      canonicalFormId: 'GV-FM-005',
      eventStreamThrough: context.now,
      sourceLinkedRedlineArtifactId: null,
      approvedVersion: null,
      approvedContentSha256: null,
      requiredSignerMemberIds: [
        state.members.find((member) => member.id === secretaryTerms[0].memberId)?.personId
          ?? secretaryTerms[0].memberId,
      ],
      ecignInstanceId: null,
      finalSignedArtifactId: null,
      finalContentSha256: null,
      lockedAt: null,
      retentionUntil: null,
      legalHold: false,
      supersedesMinutesId: null,
    };
    const updated: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'minutes_pending',
      adjournedAt: context.now,
      minutesId: minutes.id,
    };
    const response = { meeting: updated, minutes };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `meeting.adjourn:${meeting.id}`,
      request: { meetingId, expectedVersion },
      writes: [write('meeting', updated, meeting.version), write('minutes', minutes, null)],
      response,
      eventType: 'governance.meeting.adjourned',
      action: 'meeting.adjourn',
      resourceType: 'meeting',
      resourceId: meeting.id,
      payload: { adjournedAt: context.now, minutesId: minutes.id, canonicalFormId: minutes.canonicalFormId },
    }));
  }

  async createBoardBook(context: CommandContext, meetingId: string, accessClass: BoardBook['accessClass']): Promise<{ meeting: GovernanceMeeting; boardBook: BoardBook }> {
    const meeting = await this.requireMeeting(context.organizationId, meetingId);
    await this.authorize(context, 'board_book.create', { meetingId, committeeId: meeting.committeeId, accessClass });
    ensure(!meeting.boardBookId, 'Meeting already has a Board book.');
    const book: BoardBook = {
      ...newRecordBase(context),
      meetingId,
      status: 'assembling',
      accessClass,
      sectionIds: [],
      manifestId: null,
      sourceOwnerCertificationIds: [],
      distributionId: null,
      lockedAt: null,
      supersedesBoardBookId: null,
    };
    const updatedMeeting: GovernanceMeeting = { ...meeting, ...nextRecordBase(context, meeting), boardBookId: book.id };
    const response = { meeting: updatedMeeting, boardBook: book };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.create:${meeting.id}`,
      request: { meetingId, accessClass },
      writes: [write('meeting', updatedMeeting, meeting.version), write('board_book', book, null)],
      response,
      eventType: 'governance.board_book.created',
      action: 'board_book.create',
      resourceType: 'board_book',
      resourceId: book.id,
      payload: { meetingId, accessClass },
    }));
  }

  async certifyBoardBookSection(context: CommandContext, input: {
    boardBookId: string;
    boardBookExpectedVersion: number;
    sequence: number;
    title: string;
    required: boolean;
    artifactId: string;
    sourceMetadataId: string;
    sourceOwnerCertificationArtifactId: string;
  }): Promise<{ boardBook: BoardBook; section: BoardBookSection }> {
    const book = await this.requireBoardBook(context.organizationId, input.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    await this.authorize(context, 'board_book.certify_section', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      accessClass: book.accessClass,
    });
    ensure(book.version === input.boardBookExpectedVersion, 'Board book version conflict.');
    ensure(book.status === 'assembling' || book.status === 'verification_failed', 'Locked or superseded Board books cannot be changed.');
    const existingSections = await this.sectionsForBook(context.organizationId, book.id);
    ensure(!existingSections.some((section) => section.sequence === input.sequence), 'Board-book section sequence already exists.');
    const metadata = await this.requireSource(context.organizationId, input.sourceMetadataId);
    requireSourceGate([metadata], 'certification');
    const artifact = await this.deps.artifacts.verify({
      artifactId: input.artifactId,
      organizationId: context.organizationId,
      meetingId: meeting.id,
      actorId: actorId(context),
      requiredAccessClass: book.accessClass,
      sourceMetadata: metadata,
    });
    ensure(artifact.sourceCertified, 'Source owner has not certified the artifact source.');
    ensure(metadata.ownerId, 'Source owner identity is unavailable.');
    const ownerCertification = await this.deps.ecign.verifySignatureArtifact(
      input.sourceOwnerCertificationArtifactId,
      metadata.ownerId,
    );
    ensure(ownerCertification, 'Canonical eCIgn did not confirm the source-owner certification artifact.');
    const section: BoardBookSection = {
      ...newRecordBase(context),
      boardBookId: book.id,
      sequence: input.sequence,
      title: input.title,
      required: input.required,
      artifactId: artifact.artifactId,
      artifactVersion: artifact.artifactVersion,
      contentSha256: artifact.contentSha256,
      sourceMetadataId: metadata.id,
      sourceOwnerCertificationId: input.sourceOwnerCertificationArtifactId,
      verifiedAt: context.now,
      verifiedByAdapter: artifact.adapter,
      accessClass: artifact.accessClass,
    };
    const updatedBook: BoardBook = {
      ...book,
      ...nextRecordBase(context, book),
      status: 'assembling',
      sectionIds: [...book.sectionIds, section.id],
      sourceOwnerCertificationIds: [...book.sourceOwnerCertificationIds, input.sourceOwnerCertificationArtifactId],
    };
    const response = { boardBook: updatedBook, section };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.certify_section:${book.id}:${input.sequence}`,
      request: input,
      writes: [write('board_book', updatedBook, book.version), write('board_book_section', section, null)],
      response,
      eventType: 'governance.board_book.section_certified',
      action: 'board_book.certify_section',
      resourceType: 'board_book_section',
      resourceId: section.id,
      payload: {
        boardBookId: book.id,
        artifactId: section.artifactId,
        artifactVersion: section.artifactVersion,
        contentSha256: section.contentSha256,
        sourceOwnerCertificationArtifactId: input.sourceOwnerCertificationArtifactId,
        sourceOwnerCertificationSha256: ownerCertification.contentSha256,
      },
    }));
  }

  async lockBoardBook(context: CommandContext, boardBookId: string, expectedVersion: number): Promise<{ boardBook: BoardBook; manifest: FrozenBoardBookManifest }> {
    const book = await this.requireBoardBook(context.organizationId, boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    await this.authorize(context, 'board_book.lock', { meetingId: meeting.id, committeeId: meeting.committeeId, accessClass: book.accessClass });
    ensure(book.version === expectedVersion, 'Board book version conflict.');
    ensure(book.status === 'assembling', 'Only an assembling Board book may be locked.');
    const sections = await this.sectionsForBook(context.organizationId, book.id);
    ensure(sections.length > 0, 'Board book has no verified sections.');
    ensure(sections.length === book.sectionIds.length, 'Board book section manifest is incomplete.');
    ensure(sections.every((section) => section.sourceOwnerCertificationId), 'Every Board-book section requires source-owner certification.');
    const sources = await this.loadSources(context.organizationId, sections.map((section) => section.sourceMetadataId));
    requireSourceGate(sources, 'certification');
    const frozenSections = sections.sort((a, b) => a.sequence - b.sequence).map((section) => ({
      sectionId: section.id,
      sequence: section.sequence,
      artifactId: section.artifactId,
      artifactVersion: section.artifactVersion,
      contentSha256: section.contentSha256,
      sourceMetadataId: section.sourceMetadataId,
      sourceOwnerCertificationId: section.sourceOwnerCertificationId as string,
      accessClass: section.accessClass,
    }));
    const manifest: FrozenBoardBookManifest = {
      ...newRecordBase(context),
      boardBookId: book.id,
      meetingId: meeting.id,
      sections: frozenSections,
      manifestSha256: manifestSha256({ boardBookId: book.id, meetingId: meeting.id, sections: frozenSections }),
      frozenAt: context.now,
    };
    const updatedBook: BoardBook = {
      ...book,
      ...nextRecordBase(context, book),
      status: 'locked',
      manifestId: manifest.id,
      lockedAt: context.now,
    };
    const response = { boardBook: updatedBook, manifest };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.lock:${book.id}`,
      request: { boardBookId, expectedVersion },
      writes: [write('board_book', updatedBook, book.version), write('board_book_manifest', manifest, null)],
      response,
      eventType: 'governance.board_book.locked',
      action: 'board_book.lock',
      resourceType: 'board_book_manifest',
      resourceId: manifest.id,
      payload: { boardBookId: book.id, sectionCount: manifest.sections.length, manifestSha256: manifest.manifestSha256 },
    }));
  }

  async distributeBoardBook(context: CommandContext, input: {
    boardBookId: string;
    expectedVersion: number;
    recipientMemberIds: string[];
  }): Promise<{ boardBook: BoardBook; distribution: BoardBookDistribution }> {
    const book = await this.requireBoardBook(context.organizationId, input.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    await this.authorize(context, 'record.share', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      matterId: book.id,
      accessClass: book.accessClass,
    });
    ensure(book.version === input.expectedVersion, 'Board book version conflict.');
    ensure(book.status === 'locked' && book.manifestId && book.lockedAt, 'Only a locked Board book may be distributed.');
    ensure(!book.distributionId, 'Board book distribution already exists.');
    const manifest = await this.deps.repository.get<FrozenBoardBookManifest>(context.organizationId, 'board_book_manifest', book.manifestId);
    ensure(manifest && manifest.boardBookId === book.id, 'Frozen Board-book manifest is unavailable.');
    const recipients = [...new Set(input.recipientMemberIds)].sort();
    const state = await this.authorityState(context.organizationId);
    ensure(recipients.length === input.recipientMemberIds.length, 'Duplicate Board-book recipients are not allowed.');
    for (const memberId of recipients) {
      const member = state.members.find((candidate) => candidate.id === memberId && candidate.status === 'active');
      ensure(member?.accessClasses.includes(book.accessClass) || book.accessClass === 'public_published', `Recipient ${memberId} lacks the Board-book access class.`);
    }
    const distribution: BoardBookDistribution = {
      ...newRecordBase(context),
      boardBookId: book.id,
      manifestSha256: manifest.manifestSha256,
      recipientMemberIds: recipients,
      distributedAt: context.now,
      readReceipts: [],
      managementQuestions: [],
    };
    const updatedBook: BoardBook = {
      ...book,
      ...nextRecordBase(context, book),
      distributionId: distribution.id,
    };
    const response = { boardBook: updatedBook, distribution };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.distribute:${book.id}`,
      request: input,
      writes: [
        write('board_book', updatedBook, book.version),
        write('board_book_distribution', distribution, null),
      ],
      response,
      eventType: 'governance.board_book.distributed',
      action: 'record.share',
      resourceType: 'board_book_distribution',
      resourceId: distribution.id,
      payload: { boardBookId: book.id, manifestSha256: distribution.manifestSha256, recipientMemberIds: recipients },
    }));
  }

  async supersedeBoardBook(context: CommandContext, input: {
    boardBookId: string;
    expectedVersion: number;
    reason: string;
  }): Promise<{ supersededBoardBook: BoardBook; replacementBoardBook: BoardBook; meeting: GovernanceMeeting }> {
    const book = await this.requireBoardBook(context.organizationId, input.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    await this.authorize(context, 'board_book.create', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      matterId: book.id,
      accessClass: book.accessClass,
    });
    ensure(book.version === input.expectedVersion, 'Board book version conflict.');
    ensure(book.status === 'locked', 'Only a locked Board book may be superseded.');
    ensure(!['in_session', 'minutes_pending', 'closed', 'superseded'].includes(meeting.status), 'Board book cannot be superseded after the meeting enters session.');
    const supersededBoardBook: BoardBook = {
      ...book,
      ...nextRecordBase(context, book),
      status: 'superseded',
    };
    const replacementBoardBook: BoardBook = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      status: 'assembling',
      accessClass: book.accessClass,
      sectionIds: [],
      manifestId: null,
      sourceOwnerCertificationIds: [],
      distributionId: null,
      lockedAt: null,
      supersedesBoardBookId: book.id,
    };
    const updatedMeeting: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'agenda_published',
      boardBookId: replacementBoardBook.id,
    };
    const response = { supersededBoardBook, replacementBoardBook, meeting: updatedMeeting };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.supersede:${book.id}`,
      request: input,
      writes: [
        write('board_book', supersededBoardBook, book.version),
        write('board_book', replacementBoardBook, null),
        write('meeting', updatedMeeting, meeting.version),
      ],
      response,
      eventType: 'governance.board_book.superseded',
      action: 'board_book.create',
      resourceType: 'board_book',
      resourceId: replacementBoardBook.id,
      payload: { meetingId: meeting.id, supersededBoardBookId: book.id, reason: input.reason },
    }));
  }

  async recordBoardBookReceipt(context: CommandContext, input: {
    distributionId: string;
    expectedVersion: number;
    manifestSha256: string;
  }): Promise<BoardBookDistribution> {
    const distribution = await this.requireBoardBookDistribution(context.organizationId, input.distributionId);
    const book = await this.requireBoardBook(context.organizationId, distribution.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    const { decision } = await this.authorize(context, 'record.view', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      matterId: book.id,
      accessClass: book.accessClass,
    });
    ensure(distribution.version === input.expectedVersion, 'Board-book distribution version conflict.');
    ensure(input.manifestSha256 === distribution.manifestSha256, 'Read receipt does not match the distributed manifest.');
    ensure(decision.memberId && distribution.recipientMemberIds.includes(decision.memberId), 'Member is not a recipient of this Board book.');
    ensure(!distribution.readReceipts.some((receipt) => receipt.memberId === decision.memberId), 'Read receipt already exists for this member and manifest.');
    const updated: BoardBookDistribution = {
      ...distribution,
      ...nextRecordBase(context, distribution),
      readReceipts: [...distribution.readReceipts, { memberId: decision.memberId, readAt: context.now, manifestSha256: input.manifestSha256 }],
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.read_receipt:${distribution.id}:${decision.memberId}`,
      request: input,
      writes: [write('board_book_distribution', updated, distribution.version)],
      response: updated,
      eventType: 'governance.board_book.read_receipt',
      action: 'record.view',
      resourceType: 'board_book_distribution',
      resourceId: distribution.id,
      payload: { boardBookId: book.id, memberId: decision.memberId, manifestSha256: input.manifestSha256 },
    }));
  }

  async submitBoardBookQuestion(context: CommandContext, input: {
    distributionId: string;
    expectedVersion: number;
    question: string;
  }): Promise<BoardBookDistribution> {
    const distribution = await this.requireBoardBookDistribution(context.organizationId, input.distributionId);
    const book = await this.requireBoardBook(context.organizationId, distribution.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    const { decision } = await this.authorize(context, 'record.view', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      matterId: book.id,
      accessClass: book.accessClass,
    });
    ensure(distribution.version === input.expectedVersion, 'Board-book distribution version conflict.');
    ensure(decision.memberId && distribution.recipientMemberIds.includes(decision.memberId), 'Member is not a recipient of this Board book.');
    const questionId = newRecordBase(context).id;
    const updated: BoardBookDistribution = {
      ...distribution,
      ...nextRecordBase(context, distribution),
      managementQuestions: [...distribution.managementQuestions, {
        id: questionId,
        memberId: decision.memberId,
        question: input.question,
        createdAt: context.now,
        responseArtifactId: null,
        responseArtifactVersion: null,
        responseContentSha256: null,
        responseSourceMetadataId: null,
        responseVerifiedAt: null,
      }],
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.question:${distribution.id}:${questionId}`,
      request: input,
      writes: [write('board_book_distribution', updated, distribution.version)],
      response: updated,
      eventType: 'governance.board_book.question_submitted',
      action: 'record.view',
      resourceType: 'board_book_distribution',
      resourceId: distribution.id,
      payload: { boardBookId: book.id, questionId, memberId: decision.memberId },
    }));
  }

  async respondToBoardBookQuestion(context: CommandContext, input: {
    distributionId: string;
    expectedVersion: number;
    questionId: string;
    responseArtifactId: string;
    sourceMetadataId: string;
  }): Promise<BoardBookDistribution> {
    const distribution = await this.requireBoardBookDistribution(context.organizationId, input.distributionId);
    const book = await this.requireBoardBook(context.organizationId, distribution.boardBookId);
    const meeting = await this.requireMeeting(context.organizationId, book.meetingId);
    await this.authorize(context, 'record.share', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      matterId: book.id,
      accessClass: book.accessClass,
    });
    ensure(distribution.version === input.expectedVersion, 'Board-book distribution version conflict.');
    const question = distribution.managementQuestions.find((candidate) => candidate.id === input.questionId);
    ensure(question, 'Management question not found.');
    ensure(!question.responseArtifactId, 'Management question already has a response artifact.');
    ensure(book.manifestId, 'Board-book manifest is unavailable.');
    const manifest = await this.deps.repository.get<FrozenBoardBookManifest>(context.organizationId, 'board_book_manifest', book.manifestId);
    ensure(manifest && manifest.boardBookId === book.id, 'Frozen Board-book manifest is unavailable.');
    ensure(manifest.sections.some((section) => section.sourceMetadataId === input.sourceMetadataId), 'Management response source is not represented in the frozen Board-book manifest.');
    const metadata = await this.requireSource(context.organizationId, input.sourceMetadataId);
    requireSourceGate([metadata], 'certification');
    const responseArtifact = await this.deps.artifacts.verify({
      artifactId: input.responseArtifactId,
      organizationId: context.organizationId,
      meetingId: meeting.id,
      actorId: actorId(context),
      requiredAccessClass: book.accessClass,
      sourceMetadata: metadata,
    });
    ensure(responseArtifact.sourceCertified, 'Management response source is not certified.');
    const updated: BoardBookDistribution = {
      ...distribution,
      ...nextRecordBase(context, distribution),
      managementQuestions: distribution.managementQuestions.map((candidate) => candidate.id === input.questionId
        ? {
          ...candidate,
          responseArtifactId: responseArtifact.artifactId,
          responseArtifactVersion: responseArtifact.artifactVersion,
          responseContentSha256: responseArtifact.contentSha256,
          responseSourceMetadataId: metadata.id,
          responseVerifiedAt: context.now,
        }
        : candidate),
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `board_book.question_response:${distribution.id}:${question.id}`,
      request: input,
      writes: [write('board_book_distribution', updated, distribution.version)],
      response: updated,
      eventType: 'governance.board_book.question_responded',
      action: 'record.share',
      resourceType: 'board_book_distribution',
      resourceId: distribution.id,
      payload: {
        boardBookId: book.id,
        questionId: question.id,
        responseArtifactId: responseArtifact.artifactId,
        responseArtifactVersion: responseArtifact.artifactVersion,
        responseContentSha256: responseArtifact.contentSha256,
        sourceMetadataId: metadata.id,
      },
    }));
  }

  async createDecision(context: CommandContext, input: {
    title: string;
    question: string;
    origin: GovernanceDecision['origin'];
    authorityProfileVersionId: string;
    authorityKey: string;
    sourceMetadataIds: string[];
    meetingId?: string | null;
  }): Promise<GovernanceDecision> {
    const meeting = input.meetingId ? await this.requireMeeting(context.organizationId, input.meetingId) : null;
    const { state } = await this.authorize(context, 'decision.create', {
      meetingId: meeting?.id,
      committeeId: meeting?.committeeId,
    });
    ensure(state.profile?.id === input.authorityProfileVersionId, 'Decision authority profile is not current.');
    const sources = await this.loadSources(context.organizationId, input.sourceMetadataIds);
    const gate = evaluateSourceGate(sources, 'review');
    ensure(!gate.blocked, `Decision source posture blocks review: ${gate.reasons.join('; ')}`);
    const decision: GovernanceDecision = {
      ...newRecordBase(context),
      title: input.title,
      question: input.question,
      origin: input.origin,
      status: 'intake',
      authorityProfileVersionId: input.authorityProfileVersionId,
      authorityKey: input.authorityKey,
      sourceMetadataIds: [...input.sourceMetadataIds],
      meetingId: input.meetingId ?? null,
      agendaItemId: null,
      motionId: null,
      writtenConsentId: null,
      dispositionBasis: null,
      dispositionArtifactId: null,
      dispositionAt: null,
      conditions: [],
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: 'decision.create',
      request: input,
      writes: [write('decision', decision, null)],
      response: decision,
      eventType: 'governance.decision.created',
      action: 'decision.create',
      resourceType: 'decision',
      resourceId: decision.id,
      payload: { origin: decision.origin, authorityProfileVersionId: decision.authorityProfileVersionId, sourceMetadataIds: decision.sourceMetadataIds },
    }));
  }

  async transitionDecision(context: CommandContext, input: {
    decisionId: string;
    expectedVersion: number;
    command: 'triage' | 'place_in_packet';
    meetingId?: string | null;
    agendaItemId?: string | null;
  }): Promise<GovernanceDecision> {
    const decision = await this.requireDecision(context.organizationId, input.decisionId);
    ensure(decision.version === input.expectedVersion, 'Decision version conflict.');
    const action = input.command === 'triage' ? 'decision.triage' : 'decision.place_in_packet';
    let meeting: GovernanceMeeting | null = null;
    let agendaItem: AgendaItem | null = null;
    if (input.command === 'place_in_packet') {
      ensure(input.meetingId && input.agendaItemId, 'Packet placement requires a meeting and agenda item.');
      meeting = await this.requireMeeting(context.organizationId, input.meetingId);
      const agenda = await this.requireAgenda(context.organizationId, meeting);
      agendaItem = agenda.items.find((candidate) => candidate.id === input.agendaItemId) ?? null;
      ensure(agendaItem?.decisionId === decision.id, 'Published agenda item is not linked to this decision.');
      ensure(agendaItem.purpose === 'decision', 'Only a decision agenda item may place a decision in the packet.');
      ensure(decision.status === 'triaged', 'Only a triaged decision may be placed in the packet.');
    } else {
      ensure(decision.status === 'intake', 'Only an intake decision may be triaged.');
    }
    await this.authorize(context, action, {
      meetingId: meeting?.id ?? decision.meetingId ?? undefined,
      committeeId: meeting?.committeeId,
      agendaItemId: agendaItem?.id,
      matterId: decision.id,
      accessClass: agendaItem?.accessClass ?? recordAccessClass(decision),
    });
    const sources = await this.loadSources(context.organizationId, decision.sourceMetadataIds);
    requireSourceGate(sources, input.command === 'place_in_packet' ? 'execution' : 'review');
    const updated: GovernanceDecision = {
      ...decision,
      ...nextRecordBase(context, decision),
      status: input.command === 'triage' ? 'triaged' : 'placed_in_packet',
      meetingId: meeting?.id ?? decision.meetingId,
      agendaItemId: agendaItem?.id ?? decision.agendaItemId,
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `decision.${input.command}:${decision.id}`,
      request: input,
      writes: [write('decision', updated, decision.version)],
      response: updated,
      eventType: `governance.decision.${input.command}`,
      action,
      resourceType: 'decision',
      resourceId: decision.id,
      payload: { meetingId: updated.meetingId, agendaItemId: updated.agendaItemId, status: updated.status },
    }));
  }

  async createMotion(context: CommandContext, input: {
    meetingId: string;
    agendaItemId: string;
    decisionId: string;
    text: string;
    conditions?: string[];
    parentMotionId?: string | null;
  }): Promise<{ motion: GovernanceMotion; decision: GovernanceDecision }> {
    const meeting = await this.requireMeeting(context.organizationId, input.meetingId);
    const agenda = await this.requireAgenda(context.organizationId, meeting);
    const item = agenda.items.find((candidate) => candidate.id === input.agendaItemId);
    ensure(item?.decisionId === input.decisionId, 'Agenda item is not linked to the decision.');
    ensure(meeting.status === 'in_session', 'Motions require an in-session meeting.');
    const { state, decision: authority } = await this.authorize(context, 'motion.move', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      agendaItemId: item.id,
      matterId: input.decisionId,
      accessClass: item.accessClass,
    });
    const decision = await this.requireDecision(context.organizationId, input.decisionId);
    ensure(decision.status === 'placed_in_packet' || decision.status === 'deliberation', 'Decision must be triaged and placed on the published agenda before a motion.');
    ensure(decision.meetingId === meeting.id && decision.agendaItemId === item.id, 'Decision packet placement does not match this meeting and agenda item.');
    const sources = await this.loadSources(context.organizationId, decision.sourceMetadataIds);
    requireSourceGate(sources, 'execution');
    const attendance = await this.deps.repository.list<AttendanceEvent>(context.organizationId, 'attendance_event');
    const eligibility = buildEligibilitySnapshot({ meeting, agenda, agendaItemId: item.id, attendance, state, now: context.now });
    ensure(eligibility.quorumMet, 'Item-level quorum is not present.');
    ensure(authority.memberId && eligibility.eligibleMemberIds.includes(authority.memberId), 'Mover is not eligible on this agenda item.');
    let parent: GovernanceMotion | null = null;
    if (input.parentMotionId) {
      parent = await this.requireMotion(context.organizationId, input.parentMotionId);
      ensure(parent.meetingId === meeting.id && parent.agendaItemId === item.id, 'Parent motion does not belong to this agenda item.');
    }
    const motion: GovernanceMotion = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      agendaItemId: item.id,
      decisionId: decision.id,
      text: input.text,
      conditions: [...(input.conditions ?? [])],
      movedByMemberId: authority.memberId,
      secondedByMemberId: null,
      parentMotionId: parent?.id ?? null,
      amendmentSequence: parent ? parent.amendmentSequence + 1 : 0,
      status: 'moved',
      eligibilitySnapshot: eligibility,
    };
    const updatedDecision: GovernanceDecision = {
      ...decision,
      ...nextRecordBase(context, decision),
      status: 'deliberation',
      meetingId: meeting.id,
      agendaItemId: item.id,
      motionId: motion.id,
    };
    const response = { motion, decision: updatedDecision };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `motion.move:${decision.id}`,
      request: input,
      writes: [write('motion', motion, null), write('decision', updatedDecision, decision.version)],
      response,
      eventType: 'governance.motion.moved',
      action: 'motion.move',
      resourceType: 'motion',
      resourceId: motion.id,
      payload: { meetingId: meeting.id, decisionId: decision.id, eligibilitySnapshotSha256: eligibility.contentSha256 },
    }));
  }

  async secondMotion(context: CommandContext, motionId: string, expectedVersion: number): Promise<GovernanceMotion> {
    const motion = await this.requireMotion(context.organizationId, motionId);
    const meeting = await this.requireMeeting(context.organizationId, motion.meetingId);
    const { decision } = await this.authorize(context, 'motion.second', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      agendaItemId: motion.agendaItemId,
      matterId: motion.decisionId,
    });
    ensure(motion.version === expectedVersion, 'Motion version conflict.');
    ensure(motion.status === 'moved' && !motion.secondedByMemberId, 'Motion cannot be seconded in its current state.');
    ensure(decision.memberId && decision.memberId !== motion.movedByMemberId, 'Mover cannot second the same motion.');
    ensure(motion.eligibilitySnapshot?.eligibleMemberIds.includes(decision.memberId), 'Seconder is not eligible on the motion snapshot.');
    const updated: GovernanceMotion = {
      ...motion,
      ...nextRecordBase(context, motion),
      secondedByMemberId: decision.memberId,
      status: 'seconded',
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `motion.second:${motion.id}`,
      request: { motionId, expectedVersion },
      writes: [write('motion', updated, motion.version)],
      response: updated,
      eventType: 'governance.motion.seconded',
      action: 'motion.second',
      resourceType: 'motion',
      resourceId: motion.id,
      payload: { movedByMemberId: motion.movedByMemberId, secondedByMemberId: updated.secondedByMemberId },
    }));
  }

  async castVote(context: CommandContext, input: {
    motionId: string;
    expectedMotionVersion: number;
    value: GovernanceVote['value'];
    dissentStatement?: string | null;
  }): Promise<{ vote: GovernanceVote; motion: GovernanceMotion; decision: GovernanceDecision; result: { approvals: number; denials: number; abstentions: number; eligible: number; final: boolean; disposition: 'approved' | 'denied' | null } }> {
    const motion = await this.requireMotion(context.organizationId, input.motionId);
    const meeting = await this.requireMeeting(context.organizationId, motion.meetingId);
    const { state, decision: authority } = await this.authorize(context, 'vote.cast', {
      meetingId: meeting.id,
      committeeId: meeting.committeeId,
      agendaItemId: motion.agendaItemId,
      matterId: motion.decisionId,
    });
    ensure(motion.version === input.expectedMotionVersion, 'Motion version conflict.');
    ensure(motion.status === 'seconded' || motion.status === 'voting', 'Motion is not open for voting.');
    ensure(motion.eligibilitySnapshot?.quorumMet, 'Motion has no valid item-level quorum snapshot.');
    ensure(authority.memberId && motion.eligibilitySnapshot.eligibleMemberIds.includes(authority.memberId), 'Actor is not vote-eligible on this motion.');
    const existingVotes = (await this.deps.repository.list<GovernanceVote>(context.organizationId, 'vote'))
      .filter((vote) => vote.motionId === motion.id);
    ensure(!existingVotes.some((vote) => vote.memberId === authority.memberId), 'Member already voted on this motion.');
    const vote: GovernanceVote = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      motionId: motion.id,
      memberId: authority.memberId,
      value: input.value,
      dissentStatement: input.value === 'deny' ? input.dissentStatement ?? null : null,
      castAt: context.now,
      eligibilitySnapshotSha256: motion.eligibilitySnapshot.contentSha256,
    };
    const votes = [...existingVotes, vote];
    const approvals = votes.filter((candidate) => candidate.value === 'approve').length;
    const denials = votes.filter((candidate) => candidate.value === 'deny').length;
    const abstentions = votes.filter((candidate) => candidate.value === 'abstain').length;
    const eligible = motion.eligibilitySnapshot.eligibleMemberIds.length;
    const decision = await this.requireDecision(context.organizationId, motion.decisionId);
    ensure(state.profile?.id === decision.authorityProfileVersionId, 'Decision authority profile is no longer current.');
    const threshold = state.profile.voteThresholds[decision.authorityKey] ?? { kind: 'majority_present' as const };
    const approved = thresholdSatisfied(threshold, approvals, eligible, eligible);
    const allCast = votes.length === eligible;
    const final = approved || allCast;
    const disposition: 'approved' | 'denied' | null = approved ? 'approved' : allCast ? 'denied' : null;
    const parent = motion.parentMotionId ? await this.requireMotion(context.organizationId, motion.parentMotionId) : null;
    const updatedMotion: GovernanceMotion = {
      ...motion,
      ...nextRecordBase(context, motion),
      status: final ? 'disposed' : 'voting',
    };
    const updatedDecision: GovernanceDecision = {
      ...decision,
      ...nextRecordBase(context, decision),
      status: parent ? 'deliberation' : disposition ?? 'deliberation',
      motionId: parent && final ? parent.id : decision.motionId,
      dispositionBasis: parent ? null : disposition ? 'vote' : null,
      dispositionAt: parent ? null : disposition ? context.now : null,
      dispositionArtifactId: parent ? null : disposition ? motion.id : null,
      conditions: !parent && disposition === 'approved' ? [...motion.conditions] : decision.conditions,
    };
    const amendedParent = parent && final && disposition === 'approved' ? {
      ...parent,
      ...nextRecordBase(context, parent),
      text: motion.text,
      conditions: [...motion.conditions],
    } : null;
    const result = { approvals, denials, abstentions, eligible, final, disposition };
    const response = { vote, motion: updatedMotion, decision: updatedDecision, result };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `vote.cast:${motion.id}:${authority.memberId}`,
      request: input,
      writes: [
        write('vote', vote, null),
        write('motion', updatedMotion, motion.version),
        ...(amendedParent ? [write('motion', amendedParent, parent?.version ?? null)] : []),
        write('decision', updatedDecision, decision.version),
      ],
      response,
      eventType: parent && final ? 'governance.vote.amendment_disposed'
        : disposition ? 'governance.vote.disposition_recorded' : 'governance.vote.cast',
      action: 'vote.cast',
      resourceType: 'vote',
      resourceId: vote.id,
      payload: { motionId: motion.id, parentMotionId: motion.parentMotionId, eligibilitySnapshotSha256: vote.eligibilitySnapshotSha256, value: vote.value, result },
    }));
  }

  async createWrittenConsent(context: CommandContext, input: { decisionId: string; text: string; expiresAt: string }): Promise<{ consent: WrittenConsent; decision: GovernanceDecision }> {
    const decision = await this.requireDecision(context.organizationId, input.decisionId);
    ensure(decision.status === 'triaged', 'Written consent requires a triaged decision intake.');
    ensure(decision.origin === 'written_consent' || decision.origin === 'emergency', 'Decision origin does not authorize written consent.');
    const { state } = await this.authorize(context, 'decision.place_in_packet', { matterId: decision.id, accessClass: recordAccessClass(decision) });
    const profile = state.profile;
    ensure(profile?.writtenConsentAllowed, 'Approved bylaws do not authorize written consent.');
    ensure(input.expiresAt > context.now, 'Written consent expiration must be in the future.');
    const sources = await this.loadSources(context.organizationId, decision.sourceMetadataIds);
    requireSourceGate(sources, 'approval');
    const eligible = state.members.filter((member) =>
      member.status === 'active'
      && Boolean(member.appointmentArtifactId)
      && Boolean(member.votingSeatId)
      && profile.authorizedSeatIds.includes(member.votingSeatId as string),
    ).map((member) => member.id).sort();
    const snapshotBase = {
      authorityProfileVersionId: profile.id,
      evaluatedAt: context.now,
      meetingId: `written-consent:${decision.id}`,
      agendaItemId: decision.id,
      eligibleMemberIds: eligible,
      recusedMemberIds: [],
      absentMemberIds: [],
      quorumMet: true,
      quorumRule: profile.writtenConsentThreshold,
    };
    const consent: WrittenConsent = {
      ...newRecordBase(context),
      decisionId: decision.id,
      authorityProfileVersionId: profile.id,
      text: input.text,
      eligibilitySnapshot: {
        ...snapshotBase,
        contentSha256: manifestSha256(snapshotBase),
      },
      threshold: profile.writtenConsentThreshold,
      signatureArtifactIds: [],
      signerMemberIds: [],
      recordArtifactId: null,
      status: 'collecting',
      expiresAt: input.expiresAt,
    };
    const updatedDecision: GovernanceDecision = {
      ...decision,
      ...nextRecordBase(context, decision),
      writtenConsentId: consent.id,
      status: 'deliberation',
    };
    const response = { consent, decision: updatedDecision };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `written_consent.create:${decision.id}`,
      request: input,
      writes: [write('written_consent', consent, null), write('decision', updatedDecision, decision.version)],
      response,
      eventType: 'governance.written_consent.created',
      action: 'decision.place_in_packet',
      resourceType: 'written_consent',
      resourceId: consent.id,
      payload: { decisionId: decision.id, eligibilitySnapshotSha256: consent.eligibilitySnapshot.contentSha256, threshold: consent.threshold },
    }));
  }

  async signWrittenConsent(context: CommandContext, input: { writtenConsentId: string; expectedVersion: number; signatureArtifactId: string }): Promise<{ consent: WrittenConsent; decision: GovernanceDecision }> {
    const consent = await this.requireWrittenConsent(context.organizationId, input.writtenConsentId);
    const decision = await this.requireDecision(context.organizationId, consent.decisionId);
    const { state, decision: authority } = await this.authorize(context, 'vote.cast', { matterId: decision.id });
    ensure(consent.version === input.expectedVersion, 'Written consent version conflict.');
    ensure(consent.status === 'collecting' && consent.expiresAt > context.now, 'Written consent is not open.');
    ensure(authority.memberId && consent.eligibilitySnapshot.eligibleMemberIds.includes(authority.memberId), 'Member is not eligible to sign this written consent.');
    ensure(!consent.signerMemberIds.includes(authority.memberId), 'Member already signed this written consent.');
    const signerPersonId = state.members.find((member) => member.id === authority.memberId)?.personId;
    ensure(signerPersonId, 'Canonical member identity is unavailable.');
    const signature = await this.deps.ecign.verifySignatureArtifact(input.signatureArtifactId, signerPersonId);
    ensure(signature, 'Canonical eCIgn did not confirm this signer on a locked signature artifact.');
    const signerMemberIds = [...consent.signerMemberIds, authority.memberId].sort();
    const approved = thresholdSatisfied(consent.threshold, signerMemberIds.length, consent.eligibilitySnapshot.eligibleMemberIds.length, consent.eligibilitySnapshot.eligibleMemberIds.length);
    const updatedConsent: WrittenConsent = {
      ...consent,
      ...nextRecordBase(context, consent),
      signerMemberIds,
      signatureArtifactIds: [...consent.signatureArtifactIds, input.signatureArtifactId],
      recordArtifactId: approved ? input.signatureArtifactId : null,
      status: approved ? 'approved' : 'collecting',
    };
    ensure(state.profile?.id === consent.authorityProfileVersionId, 'Written-consent authority profile is no longer current.');
    const updatedDecision: GovernanceDecision = {
      ...decision,
      ...nextRecordBase(context, decision),
      status: approved ? 'approved' : 'deliberation',
      dispositionBasis: approved ? 'written_consent' : null,
      dispositionAt: approved ? context.now : null,
      dispositionArtifactId: approved ? input.signatureArtifactId : null,
    };
    const response = { consent: updatedConsent, decision: updatedDecision };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `written_consent.sign:${consent.id}:${authority.memberId}`,
      request: input,
      writes: [
        write('written_consent', updatedConsent, consent.version),
        write('decision', updatedDecision, decision.version),
      ],
      response,
      eventType: approved ? 'governance.written_consent.approved' : 'governance.written_consent.signed',
      action: 'vote.cast',
      resourceType: 'written_consent',
      resourceId: consent.id,
      payload: { signerMemberId: authority.memberId, signatureArtifactId: input.signatureArtifactId, signatureContentSha256: signature.contentSha256, approved },
    }));
  }

  async transitionMinutes(context: CommandContext, input: {
    minutesId: string;
    expectedVersion: number;
    command: 'reconcile' | 'chair_review' | 'board_approve' | 'route_signature' | 'close';
    sourceLinkedRedlineArtifactId?: string | null;
    approvedContentSha256?: string | null;
    ecignInstanceId?: string | null;
  }): Promise<{ minutes: GovernanceMinutes; meeting: GovernanceMeeting }> {
    const minutes = await this.requireMinutes(context.organizationId, input.minutesId);
    const meeting = await this.requireMeeting(context.organizationId, minutes.meetingId);
    ensure(minutes.version === input.expectedVersion, 'Minutes version conflict.');
    const action = input.command === 'reconcile' ? 'minutes.reconcile'
      : input.command === 'chair_review' || input.command === 'board_approve' ? 'minutes.approve'
      : input.command === 'route_signature' ? 'minutes.sign'
      : 'record.close';
    await this.authorize(context, action, { meetingId: meeting.id, committeeId: meeting.committeeId, accessClass: recordAccessClass(meeting) });
    const nextStatus: Record<typeof input.command, GovernanceMinutes['status']> = {
      reconcile: 'secretary_reconciled',
      chair_review: 'chair_reviewed',
      board_approve: 'board_approved',
      route_signature: 'signature_routing',
      close: 'signed_locked',
    };
    const allowed: Record<typeof input.command, GovernanceMinutes['status'][]> = {
      reconcile: ['event_draft'],
      chair_review: ['secretary_reconciled'],
      board_approve: ['chair_reviewed'],
      route_signature: ['board_approved'],
      close: ['signature_routing'],
    };
    ensure(allowed[input.command].includes(minutes.status), `Minutes cannot ${input.command} from ${minutes.status}.`);
    let updated: GovernanceMinutes = {
      ...minutes,
      ...nextRecordBase(context, minutes),
      status: nextStatus[input.command],
    };
    if (input.command === 'reconcile') {
      ensure(input.sourceLinkedRedlineArtifactId, 'Secretary reconciliation requires a source-linked redline artifact.');
      updated.sourceLinkedRedlineArtifactId = input.sourceLinkedRedlineArtifactId;
    }
    if (input.command === 'board_approve') {
      ensure(input.approvedContentSha256 && /^[a-f0-9]{64}$/i.test(input.approvedContentSha256), 'Board approval requires the exact content SHA-256.');
      updated.approvedVersion = (minutes.approvedVersion ?? 0) + 1;
      updated.approvedContentSha256 = input.approvedContentSha256;
    }
    if (input.command === 'route_signature') {
      ensure(input.ecignInstanceId, 'Signature routing requires a canonical eCIgn instance.');
      updated.ecignInstanceId = input.ecignInstanceId;
    }
    let updatedMeeting = meeting;
    if (input.command === 'close') {
      const verification = await this.deps.ecign.verifyFinalMinutes(minutes);
      ensure(verification, 'Canonical eCIgn has not confirmed the exact approved final artifact and signer roster.');
      updated = {
        ...updated,
        finalSignedArtifactId: verification.instanceId,
        finalContentSha256: verification.finalContentSha256,
        lockedAt: verification.signedAt,
        retentionUntil: verification.retentionUntil,
      };
      updatedMeeting = { ...meeting, ...nextRecordBase(context, meeting), status: 'closed' };
    }
    const response = { minutes: updated, meeting: updatedMeeting };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `minutes.${input.command}:${minutes.id}`,
      request: input,
      writes: [
        write('minutes', updated, minutes.version),
        ...(input.command === 'close' ? [write('meeting', updatedMeeting, meeting.version)] : []),
      ],
      response,
      eventType: `governance.minutes.${input.command}`,
      action,
      resourceType: 'minutes',
      resourceId: minutes.id,
      payload: { meetingId: meeting.id, stateBefore: minutes.status, stateAfter: updated.status, finalContentSha256: updated.finalContentSha256 },
    }));
  }

  async correctSignedMinutes(context: CommandContext, input: {
    minutesId: string;
    expectedVersion: number;
    correctionArtifactId: string;
    correctionReason: string;
  }): Promise<{ supersededMinutes: GovernanceMinutes; correctionMinutes: GovernanceMinutes; meeting: GovernanceMeeting }> {
    const minutes = await this.requireMinutes(context.organizationId, input.minutesId);
    const meeting = await this.requireMeeting(context.organizationId, minutes.meetingId);
    await this.authorize(context, 'minutes.approve', { meetingId: meeting.id, committeeId: meeting.committeeId, matterId: minutes.id });
    ensure(minutes.version === input.expectedVersion, 'Minutes version conflict.');
    ensure(minutes.status === 'signed_locked' && minutes.finalContentSha256 && minutes.finalSignedArtifactId, 'Only signed and locked minutes may enter the correction workflow.');
    const supersededMinutes: GovernanceMinutes = {
      ...minutes,
      ...nextRecordBase(context, minutes),
      status: 'superseded',
    };
    const correctionMinutes: GovernanceMinutes = {
      ...newRecordBase(context),
      meetingId: meeting.id,
      status: 'chair_reviewed',
      canonicalFormId: minutes.canonicalFormId,
      eventStreamThrough: context.now,
      sourceLinkedRedlineArtifactId: input.correctionArtifactId,
      approvedVersion: null,
      approvedContentSha256: null,
      requiredSignerMemberIds: [...minutes.requiredSignerMemberIds],
      ecignInstanceId: null,
      finalSignedArtifactId: null,
      finalContentSha256: null,
      lockedAt: null,
      retentionUntil: minutes.retentionUntil,
      legalHold: minutes.legalHold,
      supersedesMinutesId: minutes.id,
    };
    const updatedMeeting: GovernanceMeeting = {
      ...meeting,
      ...nextRecordBase(context, meeting),
      status: 'minutes_pending',
      minutesId: correctionMinutes.id,
    };
    const response = { supersededMinutes, correctionMinutes, meeting: updatedMeeting };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `minutes.correct:${minutes.id}`,
      request: input,
      writes: [
        write('minutes', supersededMinutes, minutes.version),
        write('minutes', correctionMinutes, null),
        write('meeting', updatedMeeting, meeting.version),
      ],
      response,
      eventType: 'governance.minutes.correction_opened',
      action: 'minutes.approve',
      resourceType: 'minutes',
      resourceId: correctionMinutes.id,
      payload: {
        meetingId: meeting.id,
        supersededMinutesId: minutes.id,
        supersededContentSha256: minutes.finalContentSha256,
        correctionArtifactId: input.correctionArtifactId,
        correctionReason: input.correctionReason,
      },
    }));
  }

  async createActionItem(context: CommandContext, input: { decisionId: string; title: string; ownerId: string; dueAt: string }): Promise<GovernanceActionItem> {
    const decision = await this.requireDecision(context.organizationId, input.decisionId);
    await this.authorize(context, 'decision.record_disposition', { meetingId: decision.meetingId, matterId: decision.id });
    ensure(decision.status === 'approved', 'Action items require an approved decision.');
    ensure(input.dueAt > context.now, 'Action due date must be in the future.');
    const action: GovernanceActionItem = {
      ...newRecordBase(context),
      decisionId: decision.id,
      title: input.title,
      ownerId: input.ownerId,
      status: 'assigned',
      dueAt: input.dueAt,
      acceptedAt: null,
      managementCertificationArtifactId: null,
      evidenceArtifactIds: [],
      evidenceArtifacts: [],
      managementCertificationArtifact: null,
      boardReturnAt: null,
      effectivenessDisposition: null,
      effectivenessBasisArtifactIds: [],
      effectivenessBasisArtifacts: [],
      closedAt: null,
    };
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `action.create:${decision.id}`,
      request: input,
      writes: [write('action_item', action, null)],
      response: action,
      eventType: 'governance.action.assigned',
      action: 'decision.record_disposition',
      resourceType: 'action_item',
      resourceId: action.id,
      payload: { decisionId: decision.id, ownerId: action.ownerId, dueAt: action.dueAt },
    }));
  }

  async updateActionItem(context: CommandContext, input: {
    actionItemId: string;
    expectedVersion: number;
    command: 'accept' | 'start' | 'submit_evidence' | 'management_certify' | 'return_to_board' | 'effectiveness_effective' | 'effectiveness_partial' | 'effectiveness_ineffective' | 'continue_monitoring' | 'modify' | 'reopen' | 'mark_overdue' | 'escalate';
    artifacts?: Array<{ artifactId: string; sourceMetadataId: string }>;
  }): Promise<GovernanceActionItem> {
    const action = await this.requireAction(context.organizationId, input.actionItemId);
    ensure(action.version === input.expectedVersion, 'Action version conflict.');
    const actor = actorId(context);
    const ownerCommand = ['accept', 'start', 'submit_evidence', 'management_certify', 'return_to_board'].includes(input.command);
    if (ownerCommand) {
      ensure(action.ownerId === actor, 'Only the assigned owner may perform this action command.', 403);
    } else {
      await this.authorize(context, 'action.effectiveness_disposition', { matterId: action.decisionId });
    }
    const requiresArtifactVerification = ['submit_evidence', 'management_certify', 'effectiveness_effective', 'effectiveness_partial', 'effectiveness_ineffective'].includes(input.command);
    const verifiedArtifacts: VerifiedActionArtifact[] = [];
    if (requiresArtifactVerification) {
      ensure((input.artifacts?.length ?? 0) > 0, 'Verified evidence artifacts are required for this action command.');
      const decision = await this.requireDecision(context.organizationId, action.decisionId);
      for (const reference of input.artifacts ?? []) {
        ensure(decision.sourceMetadataIds.includes(reference.sourceMetadataId), 'Action evidence source is not linked to the authorizing decision.');
        const metadata = await this.requireSource(context.organizationId, reference.sourceMetadataId);
        requireSourceGate([metadata], 'certification');
        const artifact = await this.deps.artifacts.verify({
          artifactId: reference.artifactId,
          organizationId: context.organizationId,
          meetingId: decision.meetingId ?? decision.id,
          actorId: actor,
          requiredAccessClass: metadata.accessClass,
          sourceMetadata: metadata,
        });
        verifiedArtifacts.push({
          artifactId: artifact.artifactId,
          artifactVersion: artifact.artifactVersion,
          contentSha256: artifact.contentSha256,
          sourceMetadataId: metadata.id,
          verifiedAt: context.now,
          verifiedByAdapter: artifact.adapter,
        });
      }
    }
    const updated: GovernanceActionItem = { ...action, ...nextRecordBase(context, action) };
    switch (input.command) {
      case 'accept':
        ensure(action.status === 'assigned', 'Only an assigned action may be accepted.');
        updated.status = 'accepted'; updated.acceptedAt = context.now; break;
      case 'start':
        ensure(['accepted', 'continued', 'modified', 'reopened', 'overdue', 'escalated'].includes(action.status), 'Action cannot start from current state.');
        updated.status = 'in_progress'; break;
      case 'submit_evidence':
        ensure(action.status === 'in_progress', 'Evidence may be submitted only while in progress.');
        updated.evidenceArtifacts = [...action.evidenceArtifacts, ...verifiedArtifacts];
        updated.evidenceArtifactIds = [...new Set(updated.evidenceArtifacts.map((artifact) => artifact.artifactId))]; break;
      case 'management_certify':
        ensure(action.status === 'in_progress' && action.evidenceArtifactIds.length > 0, 'Management certification requires submitted evidence.');
        ensure(verifiedArtifacts.length === 1, 'One management certification artifact is required.');
        updated.status = 'management_complete';
        updated.managementCertificationArtifact = verifiedArtifacts[0];
        updated.managementCertificationArtifactId = verifiedArtifacts[0].artifactId;
        break;
      case 'return_to_board':
        ensure(action.status === 'management_complete' && action.managementCertificationArtifactId, 'Board return requires management certification.');
        updated.status = 'returned_to_board'; updated.boardReturnAt = context.now; break;
      case 'effectiveness_effective':
      case 'effectiveness_partial':
      case 'effectiveness_ineffective': {
        ensure(action.status === 'returned_to_board' && action.managementCertificationArtifactId && action.evidenceArtifactIds.length > 0, 'Effectiveness disposition requires verified return evidence and management certification.');
        updated.effectivenessBasisArtifacts = verifiedArtifacts;
        updated.effectivenessBasisArtifactIds = verifiedArtifacts.map((artifact) => artifact.artifactId);
        updated.effectivenessDisposition = input.command === 'effectiveness_effective' ? 'effective'
          : input.command === 'effectiveness_partial' ? 'partially_effective' : 'ineffective';
        updated.status = input.command === 'effectiveness_effective' ? 'effectiveness_accepted' : 'reopened';
        updated.closedAt = input.command === 'effectiveness_effective' ? context.now : null;
        break;
      }
      case 'continue_monitoring':
        ensure(action.status === 'returned_to_board', 'Only a returned action may continue monitoring.');
        updated.status = 'continued'; updated.effectivenessDisposition = 'continue_monitoring'; break;
      case 'modify':
        ensure(['returned_to_board', 'reopened'].includes(action.status), 'Action cannot be modified from current state.');
        updated.status = 'modified'; break;
      case 'reopen':
        ensure(['effectiveness_accepted', 'closed'].includes(action.status), 'Only a closed/effective action may be reopened.');
        updated.status = 'reopened'; updated.closedAt = null; break;
      case 'mark_overdue':
        ensure(action.dueAt < context.now && !['effectiveness_accepted', 'closed'].includes(action.status), 'Action is not eligible for an overdue disposition.');
        updated.status = 'overdue'; break;
      case 'escalate':
        ensure(action.status === 'overdue', 'Only an overdue action may be escalated.');
        updated.status = 'escalated'; break;
    }
    return this.deps.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `action.${input.command}:${action.id}`,
      request: input,
      writes: [write('action_item', updated, action.version)],
      response: updated,
      eventType: `governance.action.${input.command}`,
      action: ownerCommand ? 'action.update' : 'action.effectiveness_disposition',
      resourceType: 'action_item',
      resourceId: action.id,
      payload: {
        stateBefore: action.status,
        stateAfter: updated.status,
        evidenceCount: updated.evidenceArtifactIds.length,
        evidenceContentSha256: verifiedArtifacts.map((artifact) => artifact.contentSha256),
        effectivenessDisposition: updated.effectivenessDisposition,
      },
    }));
  }

  private async requireMeeting(organizationId: string, id: string): Promise<GovernanceMeeting> {
    const meeting = await this.deps.repository.get<GovernanceMeeting>(organizationId, 'meeting', id);
    if (!meeting) throw new ApiError('not_found', 'Meeting not found.', 404);
    return meeting;
  }

  private async requireAgenda(organizationId: string, meeting: GovernanceMeeting): Promise<GovernanceAgenda> {
    if (!meeting.agendaId) throw new ApiError('validation_error', 'Meeting has no agenda.', 409);
    const agenda = await this.deps.repository.get<GovernanceAgenda>(organizationId, 'agenda', meeting.agendaId);
    if (!agenda || agenda.meetingId !== meeting.id) throw new ApiError('validation_error', 'Meeting agenda is unavailable.', 409);
    return agenda;
  }

  private async requireBoardBook(organizationId: string, id: string): Promise<BoardBook> {
    const book = await this.deps.repository.get<BoardBook>(organizationId, 'board_book', id);
    if (!book) throw new ApiError('not_found', 'Board book not found.', 404);
    return book;
  }

  private async requireBoardBookDistribution(organizationId: string, id: string): Promise<BoardBookDistribution> {
    const distribution = await this.deps.repository.get<BoardBookDistribution>(organizationId, 'board_book_distribution', id);
    if (!distribution) throw new ApiError('not_found', 'Board-book distribution not found.', 404);
    return distribution;
  }

  private async sectionsForBook(organizationId: string, id: string): Promise<BoardBookSection[]> {
    return (await this.deps.repository.list<BoardBookSection>(organizationId, 'board_book_section'))
      .filter((section) => section.boardBookId === id);
  }

  private async requireDecision(organizationId: string, id: string): Promise<GovernanceDecision> {
    const decision = await this.deps.repository.get<GovernanceDecision>(organizationId, 'decision', id);
    if (!decision) throw new ApiError('not_found', 'Decision not found.', 404);
    return decision;
  }

  private async requireMotion(organizationId: string, id: string): Promise<GovernanceMotion> {
    const motion = await this.deps.repository.get<GovernanceMotion>(organizationId, 'motion', id);
    if (!motion) throw new ApiError('not_found', 'Motion not found.', 404);
    return motion;
  }

  private async requireWrittenConsent(organizationId: string, id: string): Promise<WrittenConsent> {
    const consent = await this.deps.repository.get<WrittenConsent>(organizationId, 'written_consent', id);
    if (!consent) throw new ApiError('not_found', 'Written consent not found.', 404);
    return consent;
  }

  private async requireMinutes(organizationId: string, id: string): Promise<GovernanceMinutes> {
    const minutes = await this.deps.repository.get<GovernanceMinutes>(organizationId, 'minutes', id);
    if (!minutes) throw new ApiError('not_found', 'Minutes not found.', 404);
    return minutes;
  }

  private async requireAction(organizationId: string, id: string): Promise<GovernanceActionItem> {
    const action = await this.deps.repository.get<GovernanceActionItem>(organizationId, 'action_item', id);
    if (!action) throw new ApiError('not_found', 'Action item not found.', 404);
    return action;
  }

  private async requireSource(organizationId: string, id: string): Promise<SourceAuthorityMetadata> {
    const source = await this.deps.repository.get<SourceAuthorityMetadata>(organizationId, 'source_metadata', id);
    if (!source) throw new ApiError('not_found', 'Source authority metadata not found.', 404);
    return source;
  }

  private async loadSources(organizationId: string, ids: string[]): Promise<SourceAuthorityMetadata[]> {
    const unique = [...new Set(ids)];
    const records = await Promise.all(unique.map((id) => this.deps.repository.get<SourceAuthorityMetadata>(organizationId, 'source_metadata', id)));
    if (records.some((record) => !record)) throw new ApiError('validation_error', 'One or more source authority records are unavailable.', 409);
    return records as SourceAuthorityMetadata[];
  }
}

export function governanceActor(userId: string, roles: string[] = []): Actor {
  return {
    type: 'user',
    user_id: userId,
    roles,
    attributes: { branches: [], service_lines: [], access_classes: [] },
    mfa_enrolled: true,
    identity_assurance: 2,
  };
}
