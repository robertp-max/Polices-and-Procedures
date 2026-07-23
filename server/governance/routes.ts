import { randomUUID } from 'node:crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import type { CommandContext } from './mutations.js';
import { GovernanceRepositoryError } from './repository.js';
import { getGovernanceService } from './runtime.js';
import type { GovernanceService } from './service.js';
import {
  academyAnswerSchema,
  academyAssignSchema,
  academyHeartbeatSchema,
  academyStartSchema,
  academySubmitSchema,
  academyTaskEventSchema,
  actionUpdateSchema,
  attendanceEventSchema,
  boardBookQuestionResponseSchema,
  boardBookQuestionSchema,
  boardBookReceiptSchema,
  breakGlassRequestSchema,
  callMeetingSchema,
  castVoteSchema,
  certifyBoardBookSectionSchema,
  conflictDisclosureSchema,
  conflictRestrictionSchema,
  createActionItemSchema,
  createBoardBookSchema,
  createDecisionSchema,
  transitionDecisionSchema,
  createMeetingSchema,
  createMotionSchema,
  createWrittenConsentSchema,
  distributeBoardBookSchema,
  lockBoardBookSchema,
  meetingSessionEventSchema,
  minutesTransitionSchema,
  minutesCorrectionSchema,
  publishAgendaSchema,
  publishNoticeSchema,
  recordDeliverySchema,
  searchQuerySchema,
  secondMotionSchema,
  signWrittenConsentSchema,
  supersedeBoardBookSchema,
} from './schemas.js';
import type {
  AttendanceEvent,
  ConflictDisclosure,
  ConflictManagementRestriction,
  GovernanceMotion,
  GovernanceRecord,
  GovernanceVote,
  MeetingSessionEvent,
} from './contracts.js';

export const GOVERNANCE_ENTRY_ROLES = [
  'grp-super-admin',
  'grp-leadership-governing-body',
  'grp-governance-board-chair',
  'grp-governance-board-secretary',
  'grp-governance-committee-member',
  'grp-governance-legal-counsel',
  'grp-governance-cfo',
  'grp-governance-risk-manager',
  'grp-governance-privacy-security-officer',
] as const;

const rateWindows = new Map<string, { count: number; resetsAt: number }>();

function rateLimit(limit: number, windowMs = 60_000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const actorId = req.actor?.user_id ?? req.actor?.service_id ?? 'anonymous';
    const key = `${actorId}:${req.method}:${req.route?.path ?? req.path}`;
    const now = Date.now();
    const current = rateWindows.get(key);
    const window = !current || current.resetsAt <= now
      ? { count: 0, resetsAt: now + windowMs }
      : current;
    window.count += 1;
    rateWindows.set(key, window);
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, limit - window.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(window.resetsAt / 1_000)));
    if (window.count > limit) return next(new ApiError('rate_limited', 'Too many governance requests.', 429));
    next();
  };
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch((error: unknown) => {
      if (error instanceof ApiError) return next(error);
      if (error instanceof GovernanceRepositoryError) {
        const status = error.code === 'version_conflict' || error.code === 'idempotency_conflict' || error.code === 'transaction_conflict' ? 409
          : error.code === 'item_too_large' ? 413
          : 503;
        return next(new ApiError(
          status === 409 ? 'duplicate' : status === 413 ? 'validation_error' : 'internal_error',
          status === 409
            ? 'The governance record changed before this operation completed.'
            : status === 413
              ? 'The governance record exceeds the supported size boundary.'
              : 'The governance persistence operation could not be completed.',
          status,
        ));
      }
      return next(new ApiError('internal_error', 'The governance operation could not be completed.', 500));
    });
  };
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError('validation_error', 'Request did not match the governance API schema.', 400, {
        issues: error.issues.map((issue) => ({ path: issue.path.join('.'), code: issue.code })),
      });
    }
    throw error;
  }
}

function requireActor(req: Request): Actor {
  const actor = req.actor;
  if (!req.session?.authenticated || !actor || actor.type !== 'user' || !actor.user_id) {
    throw new ApiError('auth_error', 'Authentication required.', 401);
  }
  return actor;
}

function organizationId(actor: Actor): string {
  const canonical = actor.attributes.branches[0]
    ?? process.env.CARE_INDEED_ORGANIZATION_ID?.trim()
    ?? process.env.CARE_INDEED_AGENCY_ID?.trim();
  if (!canonical) throw new ApiError('internal_error', 'Canonical organization binding is not configured.', 503);
  return canonical;
}

function correlationId(req: Request): string {
  return req.session?.correlation_id ?? req.header('x-correlation-id')?.slice(0, 160) ?? randomUUID();
}

function readContext(req: Request): Omit<CommandContext, 'idempotencyKey'> {
  const actor = requireActor(req);
  return {
    organizationId: organizationId(actor),
    actor,
    correlationId: correlationId(req),
    now: new Date().toISOString(),
  };
}

function commandContext(req: Request, read = false): CommandContext {
  const base = readContext(req);
  const idempotencyKey = read
    ? `read:${req.session?.request_id ?? randomUUID()}`
    : req.header('idempotency-key')?.trim();
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 160) {
    throw new ApiError('validation_error', 'A valid Idempotency-Key header is required.', 400);
  }
  return { ...base, idempotencyKey };
}

function send(res: Response, correlation: string, data: unknown, status = 200): void {
  res.status(status).json({ schemaVersion: 2, correlationId: correlation, data });
}

function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] ?? '' : value;
}

const service = () => getGovernanceService();
export const governanceRouter: Router = Router();

governanceRouter.use(rateLimit(180));

governanceRouter.get('/health', asyncRoute(async (req, res) => {
  const context = readContext(req);
  send(res, context.correlationId, {
    ok: true,
    persistence: service().repository.provider,
    productionPersistence: service().repository.provider === 'dynamodb',
  });
}));

governanceRouter.get('/office', asyncRoute(async (req, res) => {
  const context = readContext(req);
  send(res, context.correlationId, await service().officeProjection(context));
}));

governanceRouter.get('/search', rateLimit(60), asyncRoute(async (req, res) => {
  const context = readContext(req);
  const parsed = parse(searchQuerySchema, {
    q: req.query.q,
    types: typeof req.query.types === 'string' ? req.query.types.split(',').filter(Boolean) : undefined,
    limit: req.query.limit,
  });
  send(res, context.correlationId, await service().search(context, parsed));
}));

governanceRouter.post('/meetings', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createMeetingSchema, req.body);
  send(res, context.correlationId, await service().meetings.createMeeting(context, input), 201);
}));

governanceRouter.post('/meetings/notice', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(publishNoticeSchema, req.body);
  send(res, context.correlationId, await service().meetings.publishNotice(context, input));
}));

governanceRouter.post('/meetings/agenda', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(publishAgendaSchema, req.body);
  send(res, context.correlationId, await service().meetings.publishAgenda(context, {
    ...input,
    items: input.items.map((item) => ({ ...item, decisionId: item.decisionId ?? null })),
  }));
}));

governanceRouter.post('/meetings/attendance', rateLimit(90), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(attendanceEventSchema, req.body);
  const eventInput: Omit<AttendanceEvent, 'id' | 'organizationId' | 'version' | 'schemaVersion' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> = input;
  send(res, context.correlationId, await service().meetings.recordAttendance(context, eventInput), 201);
}));

governanceRouter.post('/meetings/conflicts', rateLimit(60), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(conflictDisclosureSchema, req.body);
  const disclosure: Omit<ConflictDisclosure, 'id' | 'organizationId' | 'version' | 'schemaVersion' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> = input;
  send(res, context.correlationId, await service().meetings.recordConflict(context, disclosure), 201);
}));

governanceRouter.post('/meetings/conflict-restrictions', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(conflictRestrictionSchema, req.body);
  send(res, context.correlationId, await service().meetings.createConflictRestriction(context, input), 201);
}));

governanceRouter.post('/meetings/session-events', rateLimit(40), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(meetingSessionEventSchema, req.body);
  send(res, context.correlationId, await service().meetings.recordSessionTransition(context, {
    ...input,
    agendaItemId: input.agendaItemId ?? null,
  }), 201);
}));

governanceRouter.post('/meetings/ready', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(callMeetingSchema, req.body);
  send(res, context.correlationId, await service().meetings.markMeetingReady(context, input.meetingId, input.expectedVersion));
}));

governanceRouter.post('/meetings/call-to-order', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(callMeetingSchema, req.body);
  send(res, context.correlationId, await service().meetings.callToOrder(context, input.meetingId, input.expectedVersion));
}));

governanceRouter.post('/meetings/adjourn', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(callMeetingSchema, req.body);
  send(res, context.correlationId, await service().meetings.adjourn(context, input.meetingId, input.expectedVersion));
}));

governanceRouter.get('/meetings/:meetingId/:surface', asyncRoute(async (req, res) => {
  const allowed = new Set(['notice', 'agenda', 'board-book', 'attendance', 'conflicts', 'session', 'minutes']);
  const surface = routeParam(req, 'surface');
  const meetingId = routeParam(req, 'meetingId');
  if (!allowed.has(surface)) throw new ApiError('not_found', 'Meeting workflow not found.', 404);
  const context = commandContext(req, true);
  const delivered = await service().deliverRecord(context, {
    recordType: 'meeting',
    recordId: meetingId,
    delivery: 'view',
  });
  const meeting = delivered.record as GovernanceRecord & { noticePublicationId?: string | null; agendaId?: string | null; boardBookId?: string | null; minutesId?: string | null };
  let related: GovernanceRecord | null = null;
  const deliverRelated = async (recordType: Parameters<GovernanceService['deliverRecord']>[1]['recordType'], recordId: string) =>
    (await service().deliverRecord(context, { recordType, recordId, delivery: 'view' })).record;
  if (surface === 'notice' && meeting.noticePublicationId) related = await deliverRelated('notice_publication', meeting.noticePublicationId);
  if (surface === 'agenda' && meeting.agendaId) related = await deliverRelated('agenda', meeting.agendaId);
  if (surface === 'board-book' && meeting.boardBookId) related = await deliverRelated('board_book', meeting.boardBookId);
  if (surface === 'minutes' && meeting.minutesId) related = await deliverRelated('minutes', meeting.minutesId);
  if (surface === 'attendance') {
    const records = (await service().repository.list<AttendanceEvent>(context.organizationId, 'attendance_event')).filter((event) => event.meetingId === meeting.id);
    related = { items: await Promise.all(records.map((event) => deliverRelated('attendance_event', event.id))) } as unknown as GovernanceRecord;
  }
  if (surface === 'conflicts') {
    const disclosures = (await service().repository.list<ConflictDisclosure>(context.organizationId, 'conflict_disclosure')).filter((event) => event.meetingId === meeting.id);
    const restrictionIds = [...new Set(disclosures.flatMap((event) => event.restrictionIds))];
    const restrictions = (await service().repository.list<ConflictManagementRestriction>(context.organizationId, 'conflict_restriction')).filter((record) => restrictionIds.includes(record.id));
    related = { items: await Promise.all([
      ...disclosures.map((event) => deliverRelated('conflict_disclosure', event.id)),
      ...restrictions.map((record) => deliverRelated('conflict_restriction', record.id)),
    ]) } as unknown as GovernanceRecord;
  }
  if (surface === 'session') {
    const events = (await service().repository.list<MeetingSessionEvent>(context.organizationId, 'session_event')).filter((event) => event.meetingId === meeting.id);
    const motions = (await service().repository.list<GovernanceMotion>(context.organizationId, 'motion')).filter((motion) => motion.meetingId === meeting.id);
    const motionIds = new Set(motions.map((motion) => motion.id));
    const votes = (await service().repository.list<GovernanceVote>(context.organizationId, 'vote')).filter((vote) => vote.meetingId === meeting.id && motionIds.has(vote.motionId));
    related = { items: await Promise.all([
      ...events.map((event) => deliverRelated('session_event', event.id)),
      ...motions.map((motion) => deliverRelated('motion', motion.id)),
      ...votes.map((vote) => deliverRelated('vote', vote.id)),
    ]) } as unknown as GovernanceRecord;
  }
  send(res, context.correlationId, { surface, meeting, related, deliveredContentSha256: delivered.deliveredContentSha256 });
}));

governanceRouter.post('/board-books', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createBoardBookSchema, req.body);
  send(res, context.correlationId, await service().meetings.createBoardBook(context, input.meetingId, input.accessClass), 201);
}));

governanceRouter.post('/board-books/sections', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(certifyBoardBookSectionSchema, req.body);
  send(res, context.correlationId, await service().meetings.certifyBoardBookSection(context, input), 201);
}));

governanceRouter.post('/board-books/lock', rateLimit(20), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(lockBoardBookSchema, req.body);
  send(res, context.correlationId, await service().meetings.lockBoardBook(context, input.boardBookId, input.expectedVersion));
}));

governanceRouter.post('/board-books/distribute', rateLimit(20), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(distributeBoardBookSchema, req.body);
  send(res, context.correlationId, await service().meetings.distributeBoardBook(context, input));
}));

governanceRouter.post('/board-books/supersede', rateLimit(10), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(supersedeBoardBookSchema, req.body);
  send(res, context.correlationId, await service().meetings.supersedeBoardBook(context, input), 201);
}));

governanceRouter.post('/board-books/read-receipts', rateLimit(60), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(boardBookReceiptSchema, req.body);
  send(res, context.correlationId, await service().meetings.recordBoardBookReceipt(context, input));
}));

governanceRouter.post('/board-books/questions', rateLimit(60), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(boardBookQuestionSchema, req.body);
  send(res, context.correlationId, await service().meetings.submitBoardBookQuestion(context, input));
}));

governanceRouter.post('/board-books/questions/respond', rateLimit(40), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(boardBookQuestionResponseSchema, req.body);
  send(res, context.correlationId, await service().meetings.respondToBoardBookQuestion(context, input));
}));

governanceRouter.post('/decisions', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createDecisionSchema, req.body);
  send(res, context.correlationId, await service().meetings.createDecision(context, input), 201);
}));

governanceRouter.post('/decisions/transition', rateLimit(40), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(transitionDecisionSchema, req.body);
  send(res, context.correlationId, await service().meetings.transitionDecision(context, input));
}));

governanceRouter.post('/motions', rateLimit(40), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createMotionSchema, req.body);
  send(res, context.correlationId, await service().meetings.createMotion(context, input), 201);
}));

governanceRouter.post('/motions/second', rateLimit(40), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(secondMotionSchema, req.body);
  send(res, context.correlationId, await service().meetings.secondMotion(context, input.motionId, input.expectedVersion));
}));

governanceRouter.post('/votes', rateLimit(60), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(castVoteSchema, req.body);
  send(res, context.correlationId, await service().meetings.castVote(context, input), 201);
}));

governanceRouter.post('/written-consents', rateLimit(20), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createWrittenConsentSchema, req.body);
  send(res, context.correlationId, await service().meetings.createWrittenConsent(context, input), 201);
}));

governanceRouter.post('/written-consents/sign', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(signWrittenConsentSchema, req.body);
  send(res, context.correlationId, await service().meetings.signWrittenConsent(context, input));
}));

for (const command of ['reconcile', 'chair_review', 'board_approve', 'route_signature', 'close'] as const) {
  governanceRouter.post(`/minutes/${command.replace('_', '-')}`, rateLimit(20), asyncRoute(async (req, res) => {
    const context = commandContext(req);
    const input = parse(minutesTransitionSchema, req.body);
    send(res, context.correlationId, await service().meetings.transitionMinutes(context, { ...input, command }));
  }));
}

governanceRouter.post('/minutes/correct', rateLimit(10), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(minutesCorrectionSchema, req.body);
  send(res, context.correlationId, await service().meetings.correctSignedMinutes(context, input), 201);
}));

governanceRouter.post('/actions', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(createActionItemSchema, req.body);
  send(res, context.correlationId, await service().meetings.createActionItem(context, input), 201);
}));

governanceRouter.post('/actions/command', rateLimit(60), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(actionUpdateSchema, req.body);
  send(res, context.correlationId, await service().meetings.updateActionItem(context, input));
}));

governanceRouter.get('/academy/catalog', asyncRoute(async (req, res) => {
  const context = readContext(req);
  send(res, context.correlationId, service().academy.catalog());
}));

governanceRouter.get('/academy/modules/:moduleId', asyncRoute(async (req, res) => {
  const context = readContext(req);
  send(res, context.correlationId, service().academy.module(routeParam(req, 'moduleId')));
}));

governanceRouter.post('/academy/assignments', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academyAssignSchema, req.body);
  send(res, context.correlationId, await service().academy.assignModule(context, input), 201);
}));

governanceRouter.post('/academy/attempts', rateLimit(30), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academyStartSchema, req.body);
  send(res, context.correlationId, await service().academy.startAttempt(context, input.assignmentId), 201);
}));

governanceRouter.post('/academy/answers', rateLimit(120), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academyAnswerSchema, req.body);
  send(res, context.correlationId, await service().academy.recordAnswer(context, input), 201);
}));

governanceRouter.post('/academy/tasks', rateLimit(120), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academyTaskEventSchema, req.body);
  send(res, context.correlationId, await service().academy.recordTaskEvent(context, input), 201);
}));

governanceRouter.post('/academy/heartbeat', rateLimit(180), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academyHeartbeatSchema, req.body);
  send(res, context.correlationId, await service().academy.heartbeat(context, input));
}));

governanceRouter.post('/academy/submit', rateLimit(20), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(academySubmitSchema, req.body);
  send(res, context.correlationId, await service().academy.submit(context, input.attemptId, input.expectedVersion));
}));

governanceRouter.post('/records/deliver', rateLimit(120), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(recordDeliverySchema, req.body);
  send(res, context.correlationId, await service().deliverRecord(context, input));
}));

governanceRouter.post('/break-glass/approve', rateLimit(10), asyncRoute(async (req, res) => {
  const context = commandContext(req);
  const input = parse(breakGlassRequestSchema, req.body);
  send(res, context.correlationId, await service().approveBreakGlass(context, input), 201);
}));
