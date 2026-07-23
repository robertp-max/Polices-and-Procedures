import { z } from 'zod';

export const GOVERNANCE_API_SCHEMA_VERSION = 2 as const;

const id = z.string().trim().min(3).max(128).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/);
const artifactId = z.string().trim().min(3).max(160).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/);
const shortText = z.string().trim().min(1).max(240);
const longText = z.string().trim().min(1).max(4_000);
const isoDateTime = z.string().datetime({ offset: true });
const timezone = z.enum(['America/Los_Angeles', 'UTC']);
const expectedVersion = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);

export const mutationHeadersSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(160),
  correlationId: z.string().trim().min(8).max(160),
}).strict();

export const createMeetingSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingType: z.enum(['regular', 'special', 'emergency', 'committee']),
  title: shortText,
  committeeId: id.nullable().optional(),
  authorityProfileVersionId: id,
  scheduledStart: isoDateTime,
  timezone,
}).strict();

export const publishNoticeSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  expectedVersion,
  noticeArtifactId: artifactId,
  sourceMetadataId: id,
  noticeVersion: z.number().int().min(1).max(1_000),
  recipientMemberIds: z.array(id).min(1).max(100).optional(),
}).strict();

export const publishAgendaSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  meetingExpectedVersion: expectedVersion,
  agendaExpectedVersion: expectedVersion.nullable(),
  agendaVersion: z.number().int().min(1).max(1_000),
  amendmentReason: z.string().trim().max(1_000).nullable().optional(),
  items: z.array(z.object({
    id,
    sequence: z.number().int().min(1).max(500),
    title: shortText,
    purpose: z.enum(['information', 'discussion', 'decision', 'executive_session']),
    decisionId: id.nullable().optional(),
    sourceMetadataIds: z.array(id).max(50),
    accessClass: z.enum([
      'board_general', 'committee_restricted', 'executive_session', 'personnel_confidential',
      'patient_safety_restricted', 'compliance_investigation', 'attorney_client_privileged',
      'attorney_work_product', 'financial_confidential', 'public_published',
    ]),
    authorityKey: id,
    estimatedMinutes: z.number().int().min(1).max(480),
  }).strict()).min(1).max(200),
}).strict();

export const attendanceEventSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  memberId: id,
  event: z.enum(['arrived', 'departed', 'remote_connected', 'remote_disconnected']),
  occurredAt: isoDateTime,
  mode: z.enum(['in_person', 'remote']),
  communicationVerified: z.boolean(),
}).strict();

export const conflictDisclosureSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  agendaItemId: id,
  memberId: id,
  disclosure: longText,
  restrictionIds: z.array(id).max(20),
  disclosedAt: isoDateTime,
}).strict();

export const conflictRestrictionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  agendaItemId: id,
  memberId: id,
  restriction: z.enum(['disclose', 'recuse_discussion', 'recuse_vote', 'exclude_session', 'no_record_access']),
  basis: z.string().trim().min(10).max(2_000),
  startsAt: isoDateTime,
  endsAt: isoDateTime.nullable().optional(),
}).strict();

export const meetingSessionEventSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  agendaItemId: id.nullable().optional(),
  event: z.enum(['entered_executive_session', 'returned_to_open_session']),
  basis: z.string().trim().min(10).max(2_000),
  occurredAt: isoDateTime,
}).strict();

export const callMeetingSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  expectedVersion,
}).strict();

export const createMotionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  agendaItemId: id,
  decisionId: id,
  text: longText,
  conditions: z.array(shortText).max(20).optional(),
  parentMotionId: id.nullable().optional(),
}).strict();

export const secondMotionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  motionId: id,
  expectedVersion,
}).strict();

export const castVoteSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  motionId: id,
  expectedMotionVersion: expectedVersion,
  value: z.enum(['approve', 'deny', 'abstain']),
  dissentStatement: z.string().trim().max(2_000).nullable().optional(),
}).strict();

export const createDecisionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  title: shortText,
  question: longText,
  origin: z.enum(['meeting', 'written_consent', 'committee', 'emergency']),
  authorityProfileVersionId: id,
  authorityKey: id,
  sourceMetadataIds: z.array(id).min(1).max(50),
  meetingId: id.nullable().optional(),
}).strict();

export const transitionDecisionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  decisionId: id,
  expectedVersion,
  command: z.enum(['triage', 'place_in_packet']),
  meetingId: id.nullable().optional(),
  agendaItemId: id.nullable().optional(),
}).strict().superRefine((value, context) => {
  if (value.command === 'place_in_packet' && (!value.meetingId || !value.agendaItemId)) {
    context.addIssue({ code: 'custom', message: 'Packet placement requires meetingId and agendaItemId.' });
  }
  if (value.command === 'triage' && (value.meetingId || value.agendaItemId)) {
    context.addIssue({ code: 'custom', message: 'Triage does not accept meeting or agenda placement.' });
  }
});

export const createWrittenConsentSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  decisionId: id,
  text: longText,
  expiresAt: isoDateTime,
}).strict();

export const signWrittenConsentSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  writtenConsentId: id,
  expectedVersion,
  signatureArtifactId: artifactId,
}).strict();

export const createBoardBookSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  meetingId: id,
  accessClass: z.enum([
    'board_general', 'committee_restricted', 'executive_session', 'personnel_confidential',
    'patient_safety_restricted', 'compliance_investigation', 'attorney_client_privileged',
    'attorney_work_product', 'financial_confidential', 'public_published',
  ]),
}).strict();

export const certifyBoardBookSectionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  boardBookId: id,
  boardBookExpectedVersion: expectedVersion,
  sequence: z.number().int().min(1).max(500),
  title: shortText,
  required: z.boolean(),
  artifactId,
  sourceMetadataId: id,
  sourceOwnerCertificationArtifactId: artifactId,
}).strict();

export const lockBoardBookSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  boardBookId: id,
  expectedVersion,
}).strict();

export const distributeBoardBookSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  boardBookId: id,
  expectedVersion,
  recipientMemberIds: z.array(id).min(1).max(100),
}).strict();

export const supersedeBoardBookSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  boardBookId: id,
  expectedVersion,
  reason: z.string().trim().min(10).max(2_000),
}).strict();

export const boardBookReceiptSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  distributionId: id,
  expectedVersion,
  manifestSha256: z.string().regex(/^[a-f0-9]{64}$/i),
}).strict();

export const boardBookQuestionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  distributionId: id,
  expectedVersion,
  question: z.string().trim().min(10).max(2_000),
}).strict();

export const boardBookQuestionResponseSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  distributionId: id,
  expectedVersion,
  questionId: id,
  responseArtifactId: artifactId,
  sourceMetadataId: id,
}).strict();

export const minutesTransitionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  minutesId: id,
  expectedVersion,
  sourceLinkedRedlineArtifactId: artifactId.nullable().optional(),
  approvedContentSha256: z.string().regex(/^[a-f0-9]{64}$/i).nullable().optional(),
  ecignInstanceId: id.nullable().optional(),
}).strict();

export const minutesCorrectionSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  minutesId: id,
  expectedVersion,
  correctionArtifactId: artifactId,
  correctionReason: z.string().trim().min(20).max(2_000),
}).strict();

export const actionUpdateSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  actionItemId: id,
  expectedVersion,
  command: z.enum([
    'accept', 'start', 'submit_evidence', 'management_certify', 'return_to_board',
    'effectiveness_effective', 'effectiveness_partial', 'effectiveness_ineffective',
    'continue_monitoring', 'modify', 'reopen', 'mark_overdue', 'escalate',
  ]),
  artifacts: z.array(z.object({
    artifactId,
    sourceMetadataId: id,
  }).strict()).max(30).optional(),
}).strict();

export const createActionItemSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  decisionId: id,
  title: shortText,
  ownerId: id,
  dueAt: isoDateTime,
}).strict();

export const academyStartSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  assignmentId: id,
}).strict();

export const academyAssignSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  memberId: id,
  moduleId: z.enum([
    'GB-001', 'GB-002', 'GB-003', 'GB-004', 'GB-005', 'GB-006', 'GB-007',
    'GB-008', 'GB-009', 'GB-010', 'GB-011', 'GB-012', 'GB-CAPSTONE',
  ]),
  dueAt: isoDateTime,
  sourceMetadataIds: z.array(id).min(1).max(50),
}).strict();

export const academyAnswerSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  attemptId: id,
  expectedVersion,
  stageId: id,
  questionId: id,
  answerId: id,
  occurredAt: isoDateTime,
}).strict();

export const academyHeartbeatSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  attemptId: id,
  expectedVersion,
  occurredAt: isoDateTime,
  visible: z.boolean(),
  focused: z.boolean(),
  recentActivity: z.boolean(),
}).strict();

export const academyTaskEventSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  attemptId: id,
  expectedVersion,
  stageId: id,
  taskId: id,
  eventType: id,
  payload: z.record(z.string(), z.union([
    z.string().max(500), z.number().finite(), z.boolean(), z.null(),
  ])).refine((value) => Object.keys(value).length <= 30, 'Task payload is too large.'),
  occurredAt: isoDateTime,
}).strict();

export const academySubmitSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  attemptId: id,
  expectedVersion,
}).strict();

export const recordDeliverySchema = z.object({
  recordType: z.enum([
    'meeting', 'notice_publication', 'agenda', 'board_book', 'board_book_manifest', 'decision', 'minutes',
    'action_item', 'source_metadata', 'academy_attempt', 'attendance_event',
    'conflict_disclosure', 'conflict_restriction', 'session_event', 'motion', 'vote',
  ]),
  recordId: id,
  delivery: z.enum(['view', 'download', 'print', 'share']),
  recipientIds: z.array(id).max(50).optional(),
}).strict();

export const breakGlassRequestSchema = z.object({
  schemaVersion: z.literal(GOVERNANCE_API_SCHEMA_VERSION),
  requesterActorId: id,
  matterId: id,
  purpose: z.string().trim().min(20).max(1_000),
  accessClasses: z.array(z.enum(['attorney_client_privileged', 'attorney_work_product'])).min(1).max(2),
  approvedByMemberId: id,
  legalNotificationRecipientIds: z.array(id).min(1).max(10),
  approvalArtifactId: artifactId,
  expiresAt: isoDateTime,
}).strict();

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(160),
  types: z.array(z.enum([
    'meeting', 'agenda', 'board_book', 'decision', 'minutes', 'action_item', 'source_metadata',
  ])).max(7).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type PublishAgendaInput = z.infer<typeof publishAgendaSchema>;
export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
