import { createHash, createHmac } from 'node:crypto';
import { ApiError } from '../errors.js';
import { authorizeGovernanceAction, requireGovernanceAction } from './authority.js';
import type {
  AcademyAssignment,
  AcademyAttempt,
  BoardBook,
  BreakGlassGrant,
  ConflictManagementRestriction,
  GovernanceActionItem,
  GovernanceAgenda,
  GovernanceDecision,
  GovernanceMeeting,
  GovernanceMinutes,
  GovernanceMotion,
  GovernanceVote,
  MeetingNoticePublication,
  MeetingSessionEvent,
  GovernanceProjection,
  GovernanceRecord,
  GovernanceRecordAccessEvent,
  SourceAuthorityMetadata,
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
import type { GovernanceMeetingService } from './meetingService.js';
import type { GovernanceAcademyService } from './academyService.js';

type DeliveryRecordType =
  | 'meeting'
  | 'notice_publication'
  | 'agenda'
  | 'board_book'
  | 'board_book_manifest'
  | 'decision'
  | 'minutes'
  | 'action_item'
  | 'source_metadata'
  | 'academy_attempt'
  | 'attendance_event'
  | 'conflict_disclosure'
  | 'conflict_restriction'
  | 'session_event'
  | 'motion'
  | 'vote';

const SEARCHABLE_TYPES: DeliveryRecordType[] = [
  'meeting', 'agenda', 'board_book', 'decision', 'minutes', 'action_item', 'source_metadata',
];

const ACCESS_RANK = {
  public_published: 0,
  board_general: 1,
  committee_restricted: 2,
  patient_safety_restricted: 3,
  financial_confidential: 3,
  executive_session: 4,
  personnel_confidential: 5,
  compliance_investigation: 5,
  attorney_client_privileged: 6,
  attorney_work_product: 6,
} as const;

export interface GovernanceSearchResult {
  type: DeliveryRecordType;
  id: string;
  title: string;
  status: string;
  route: string;
}

export class GovernanceService {
  constructor(
    readonly repository: GovernanceRepository,
    readonly meetings: GovernanceMeetingService,
    readonly academy: GovernanceAcademyService,
  ) {}

  async officeProjection(context: Omit<CommandContext, 'idempotencyKey'>): Promise<GovernanceProjection> {
    const state = await this.meetings.authorityState(context.organizationId);
    const fullContext: CommandContext = { ...context, idempotencyKey: `projection:${context.correlationId}` };
    const blockers: string[] = [];
    if (!state.profile) blockers.push('No approved Governance Authority Profile is connected.');
    if (this.repository.provider !== 'dynamodb') blockers.push(`Persistence provider is ${this.repository.provider}; production DynamoDB authority is not configured.`);
    if (!state.profile) {
      return {
        generatedAt: context.now,
        organizationId: context.organizationId,
        sourcePosture: 'unavailable',
        authorityProfile: null,
        readinessBlockers: blockers,
        assignments: [],
        meetings: [],
        boardBooks: [],
        decisions: [],
        actions: [],
        academyAssignments: [],
      };
    }
    const authority = requireGovernanceAction(context.actor, 'record.view', { accessClass: 'board_general' }, state, context.now);
    const [meetings, boardBooks, decisions, actions, academyAssignments, sources] = await Promise.all([
      this.repository.list<GovernanceMeeting>(context.organizationId, 'meeting'),
      this.repository.list<BoardBook>(context.organizationId, 'board_book'),
      this.repository.list<GovernanceDecision>(context.organizationId, 'decision'),
      this.repository.list<GovernanceActionItem>(context.organizationId, 'action_item'),
      this.repository.list<AcademyAssignment>(context.organizationId, 'academy_assignment'),
      this.repository.list<SourceAuthorityMetadata>(context.organizationId, 'source_metadata'),
    ]);
    for (const source of sources) {
      if (source.impact !== 'informational') blockers.push(`${source.sourceRecordId}: ${source.impact} (${source.posture}).`);
    }
    const myActorId = actorId(fullContext);
    const myMemberId = authority.memberId;
    const myActions = actions.filter((action) => action.ownerId === myActorId);
    const myAcademy = academyAssignments.filter((assignment) => assignment.memberId === myMemberId);
    const assignments = [
      ...myActions.map((action) => ({
        type: 'action', id: action.id, title: action.title, dueAt: action.dueAt, status: action.status,
      })),
      ...myAcademy.map((assignment) => ({
        type: 'academy', id: assignment.id,
        title: `Governance Institute · ${assignment.moduleId}`,
        dueAt: assignment.dueAt,
        status: assignment.status,
      })),
    ].sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? ''));
    return {
      generatedAt: context.now,
      organizationId: context.organizationId,
      sourcePosture: blockers.length === 0 ? 'live' : 'partial',
      authorityProfile: state.profile,
      readinessBlockers: [...new Set(blockers)],
      assignments,
      meetings: meetings.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)),
      boardBooks,
      decisions,
      actions,
      academyAssignments: myAcademy,
    };
  }

  async search(context: Omit<CommandContext, 'idempotencyKey'>, input: {
    q: string;
    types?: DeliveryRecordType[];
    limit: number;
  }): Promise<{ queryHash: string; algorithm: 'HMAC-SHA-256'; results: GovernanceSearchResult[] }> {
    const key = process.env.GOVERNANCE_SEARCH_HMAC_KEY?.trim();
    if (!key || key.length < 32) throw new ApiError('internal_error', 'Governance search is unavailable until the keyed search hash is configured.', 503);
    const query = input.q.trim().toLocaleLowerCase('en-US');
    const queryHash = createHmac('sha256', key).update(query).digest('hex');
    const types = (input.types?.length ? input.types : SEARCHABLE_TYPES).filter((type) => SEARCHABLE_TYPES.includes(type));
    const candidates: GovernanceSearchResult[] = [];
    for (const type of types) {
      const records = await this.repository.list<GovernanceRecord>(context.organizationId, type);
      for (const record of records) {
        const accessClass = await this.accessClassForRecord(context.organizationId, type, record);
        const state = await this.meetings.authorityState(context.organizationId);
        const decision = authorizeGovernanceAction(context.actor, 'record.view', {
          accessClass,
          matterId: record.id,
        }, state, context.now);
        if (!decision.permitted) continue;
        const title = this.recordTitle(type, record);
        const status = this.recordStatus(record);
        if (!`${title} ${status} ${record.id}`.toLocaleLowerCase('en-US').includes(query)) continue;
        candidates.push({ type, id: record.id, title, status, route: this.recordRoute(type, record.id) });
      }
    }
    return { queryHash, algorithm: 'HMAC-SHA-256', results: candidates.slice(0, input.limit) };
  }

  async deliverRecord(context: CommandContext, input: {
    recordType: DeliveryRecordType;
    recordId: string;
    delivery: 'view' | 'download' | 'print' | 'share';
    recipientIds?: string[];
  }): Promise<{ record: GovernanceRecord; deliveredContentSha256: string }> {
    const record = await this.repository.get<GovernanceRecord>(context.organizationId, input.recordType, input.recordId);
    if (!record) throw new ApiError('not_found', 'Record not found.', 404);
    const state = await this.meetings.authorityState(context.organizationId);
    const action = `record.${input.delivery}` as 'record.view' | 'record.download' | 'record.print' | 'record.share';
    const accessClass = await this.accessClassForRecord(context.organizationId, input.recordType, record);
    const resource: { accessClass: keyof typeof ACCESS_RANK; matterId: string; meetingId?: string; agendaItemId?: string } = {
      accessClass,
      matterId: record.id,
    };
    if (input.recordType === 'conflict_restriction') {
      resource.matterId = (record as ConflictManagementRestriction).matterId;
    }
    if (input.recordType === 'session_event') {
      const event = record as MeetingSessionEvent;
      resource.meetingId = event.meetingId;
      if (event.agendaItemId) resource.agendaItemId = event.agendaItemId;
      resource.matterId = event.agendaItemId ?? event.meetingId;
    }
    if (input.recordType === 'motion') {
      const motion = record as GovernanceMotion;
      resource.meetingId = motion.meetingId;
      resource.agendaItemId = motion.agendaItemId;
      resource.matterId = motion.decisionId;
    }
    const authority = authorizeGovernanceAction(context.actor, action, {
      ...resource,
    }, state, context.now);
    if (!authority.permitted) throw new ApiError('not_found', 'Record not found.', 404);
    if (input.recordType === 'academy_attempt') {
      const attempt = record as AcademyAttempt;
      if (authority.memberId !== attempt.memberId) throw new ApiError('not_found', 'Record not found.', 404);
    }
    const serialized = JSON.stringify(record);
    const deliveredContentSha256 = createHash('sha256').update(serialized).digest('hex');
    const accessEvent: GovernanceRecordAccessEvent = {
      ...newRecordBase(context),
      recordType: input.recordType,
      recordId: record.id,
      actorId: actorId(context),
      delivery: input.delivery,
      recipientIds: input.recipientIds ?? [],
      deliveredAt: context.now,
      deliveredContentSha256,
    };
    const breakGlass = authority.breakGlassGrantId
      ? await this.repository.get<BreakGlassGrant>(context.organizationId, 'break_glass', authority.breakGlassGrantId)
      : null;
    const usedBreakGlass = breakGlass ? {
      ...breakGlass,
      ...nextRecordBase(context, breakGlass),
      usedAt: context.now,
    } : null;
    await this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `record.delivery:${input.recordType}:${record.id}:${input.delivery}`,
      request: input,
      writes: [
        write('record_access_event', accessEvent, null),
        ...(usedBreakGlass ? [write('break_glass', usedBreakGlass, breakGlass?.version ?? null)] : []),
      ],
      response: { accessEventId: accessEvent.id, deliveredContentSha256 },
      eventType: 'governance.record.delivered',
      action,
      resourceType: 'record_access_event',
      resourceId: accessEvent.id,
      payload: {
        deliveredRecordType: input.recordType,
        deliveredRecordId: record.id,
        delivery: input.delivery,
        recipientCount: input.recipientIds?.length ?? 0,
        deliveredContentSha256,
        breakGlassGrantId: authority.breakGlassGrantId,
      },
    }));
    return { record, deliveredContentSha256 };
  }

  async approveBreakGlass(context: CommandContext, input: {
    requesterActorId: string;
    matterId: string;
    purpose: string;
    accessClasses: Array<'attorney_client_privileged' | 'attorney_work_product'>;
    approvedByMemberId: string;
    legalNotificationRecipientIds: string[];
    approvalArtifactId: string;
    expiresAt: string;
  }): Promise<BreakGlassGrant> {
    const state = await this.meetings.authorityState(context.organizationId);
    const authority = requireGovernanceAction(context.actor, 'break_glass.request', {
      matterId: input.matterId,
      accessClass: 'board_general',
    }, state, context.now);
    if (authority.memberId !== input.approvedByMemberId) {
      throw new ApiError('permission_denied', 'Break-glass approver must be the current authorized Board member.', 403);
    }
    const duration = Date.parse(input.expiresAt) - Date.parse(context.now);
    if (duration <= 0 || duration > 4 * 60 * 60 * 1_000) {
      throw new ApiError('validation_error', 'Break-glass grants must expire within four hours.', 409);
    }
    const grant: BreakGlassGrant = {
      ...newRecordBase(context),
      requesterActorId: input.requesterActorId,
      approvedByMemberId: input.approvedByMemberId,
      legalNotificationRecipientIds: [...input.legalNotificationRecipientIds],
      purpose: input.purpose,
      matterId: input.matterId,
      accessClasses: [...input.accessClasses],
      startsAt: context.now,
      expiresAt: input.expiresAt,
      usedAt: null,
      revokedAt: null,
      approvalArtifactId: input.approvalArtifactId,
    };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `break_glass.approve:${input.requesterActorId}:${input.matterId}`,
      request: input,
      writes: [write('break_glass', grant, null)],
      response: grant,
      eventType: 'governance.break_glass.approved_and_legal_notified',
      action: 'break_glass.request',
      resourceType: 'break_glass',
      resourceId: grant.id,
      payload: {
        requesterActorId: input.requesterActorId,
        matterId: input.matterId,
        purpose: input.purpose,
        accessClasses: input.accessClasses,
        expiresAt: input.expiresAt,
        legalNotificationRecipientIds: input.legalNotificationRecipientIds,
        approvalArtifactId: input.approvalArtifactId,
      },
    }));
  }

  private async accessClassForRecord(
    organizationId: string,
    type: DeliveryRecordType,
    record: GovernanceRecord,
  ): Promise<keyof typeof ACCESS_RANK> {
    if (type === 'source_metadata') return (record as SourceAuthorityMetadata).accessClass;
    if (type === 'board_book') return (record as BoardBook).accessClass;
    if (type === 'session_event') return (record as MeetingSessionEvent).accessClass;
    if (type === 'agenda') {
      return (record as GovernanceAgenda).items.reduce<keyof typeof ACCESS_RANK>((current, item) =>
        ACCESS_RANK[item.accessClass] > ACCESS_RANK[current] ? item.accessClass : current,
      'board_general');
    }
    if (type === 'board_book_manifest') {
      const manifest = record as { boardBookId: string };
      const book = await this.repository.get<BoardBook>(organizationId, 'board_book', manifest.boardBookId);
      return book?.accessClass ?? 'board_general';
    }
    if (type === 'decision') {
      const decision = record as GovernanceDecision;
      const sources = await Promise.all(decision.sourceMetadataIds.map((id) =>
        this.repository.get<SourceAuthorityMetadata>(organizationId, 'source_metadata', id),
      ));
      return sources.filter(Boolean).reduce<keyof typeof ACCESS_RANK>((current, source) =>
        ACCESS_RANK[(source as SourceAuthorityMetadata).accessClass] > ACCESS_RANK[current]
          ? (source as SourceAuthorityMetadata).accessClass
          : current,
      'board_general');
    }
    if (type === 'motion') {
      const motion = record as GovernanceMotion;
      const meeting = await this.repository.get<GovernanceMeeting>(organizationId, 'meeting', motion.meetingId);
      const agenda = meeting?.agendaId
        ? await this.repository.get<GovernanceAgenda>(organizationId, 'agenda', meeting.agendaId)
        : null;
      return agenda?.items.find((item) => item.id === motion.agendaItemId)?.accessClass ?? 'board_general';
    }
    if (type === 'vote') {
      const vote = record as GovernanceVote;
      const motion = await this.repository.get<GovernanceMotion>(organizationId, 'motion', vote.motionId);
      return motion ? this.accessClassForRecord(organizationId, 'motion', motion) : 'board_general';
    }
    return 'board_general';
  }

  private recordTitle(type: DeliveryRecordType, record: GovernanceRecord): string {
    if (type === 'meeting') return (record as GovernanceMeeting).title;
    if (type === 'notice_publication') return `Meeting Notice · ${(record as MeetingNoticePublication).meetingId} · v${(record as MeetingNoticePublication).noticeVersion}`;
    if (type === 'agenda') return `Agenda · ${(record as GovernanceAgenda).meetingId}`;
    if (type === 'board_book') return `Board Book · ${(record as BoardBook).meetingId}`;
    if (type === 'decision') return (record as GovernanceDecision).title;
    if (type === 'minutes') return `Minutes · ${(record as GovernanceMinutes).meetingId}`;
    if (type === 'action_item') return (record as GovernanceActionItem).title;
    if (type === 'source_metadata') return (record as SourceAuthorityMetadata).sourceRecordId;
    if (type === 'academy_attempt') return `Governance Institute · ${(record as AcademyAttempt).moduleId}`;
    if (type === 'session_event') return `Executive Session · ${(record as MeetingSessionEvent).meetingId}`;
    if (type === 'motion') return `Motion · ${(record as GovernanceMotion).text}`;
    if (type === 'vote') return `Vote · ${(record as GovernanceVote).motionId}`;
    return `Governance record ${record.id}`;
  }

  private recordStatus(record: GovernanceRecord): string {
    const status = (record as { status?: unknown }).status;
    if (typeof status === 'string') return status;
    if ('posture' in record && typeof record.posture === 'string') return record.posture;
    return 'recorded';
  }

  private recordRoute(type: DeliveryRecordType, id: string): string {
    const base: Record<DeliveryRecordType, string> = {
      meeting: '/governance/meetings',
      notice_publication: '/governance/meetings',
      agenda: '/governance/meetings',
      board_book: '/governance/board-books',
      board_book_manifest: '/governance/board-books',
      decision: '/governance/decisions',
      minutes: '/governance/records',
      action_item: '/governance/my-work',
      source_metadata: '/governance/records',
      academy_attempt: '/governance/academy',
      attendance_event: '/governance/meetings',
      conflict_disclosure: '/governance/meetings',
      conflict_restriction: '/governance/meetings',
      session_event: '/governance/meetings',
      motion: '/governance/decisions',
      vote: '/governance/decisions',
    };
    return `${base[type]}/${encodeURIComponent(id)}`;
  }
}
