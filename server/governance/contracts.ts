/**
 * Governing Body Office domain contracts.
 *
 * These contracts intentionally model authority, records, and evidence as
 * separate versioned records. The office is a projection over these records;
 * it is never persisted as a single browser or DynamoDB snapshot.
 */

export const GOVERNANCE_SCHEMA_VERSION = 2 as const;

export const GOVERNANCE_ACTIONS = [
  'meeting.create',
  'meeting.publish_notice',
  'meeting.publish_agenda',
  'meeting.mark_ready',
  'meeting.call_to_order',
  'meeting.adjourn',
  'conflict.manage',
  'board_book.create',
  'board_book.certify_section',
  'board_book.lock',
  'decision.create',
  'decision.triage',
  'decision.place_in_packet',
  'decision.record_disposition',
  'motion.move',
  'motion.second',
  'vote.cast',
  'minutes.draft',
  'minutes.reconcile',
  'minutes.approve',
  'minutes.sign',
  'record.close',
  'action.accept',
  'action.update',
  'action.submit_evidence',
  'action.certify',
  'action.effectiveness_disposition',
  'record.view',
  'record.download',
  'record.print',
  'record.share',
  'academy.attempt',
  'break_glass.request',
] as const;

export type GovernanceAction = (typeof GOVERNANCE_ACTIONS)[number];

export type AccessClass =
  | 'board_general'
  | 'committee_restricted'
  | 'executive_session'
  | 'personnel_confidential'
  | 'patient_safety_restricted'
  | 'compliance_investigation'
  | 'attorney_client_privileged'
  | 'attorney_work_product'
  | 'financial_confidential'
  | 'public_published';

export interface VersionedRecord {
  id: string;
  organizationId: string;
  version: number;
  schemaVersion: typeof GOVERNANCE_SCHEMA_VERSION;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface GoverningBodyMember extends VersionedRecord {
  personId: string;
  displayName: string;
  status: 'nominated' | 'appointed' | 'active' | 'suspended' | 'resigned' | 'removed' | 'term_expired';
  appointmentArtifactId: string | null;
  appointedAt: string | null;
  votingSeatId: string | null;
  orientationStatus: 'not_assigned' | 'assigned' | 'in_progress' | 'complete' | 'expired';
  accessClasses: AccessClass[];
}

export interface BylawCharterVersion extends VersionedRecord {
  documentType: 'bylaws' | 'committee_charter';
  artifactId: string;
  documentVersion: string;
  approvalArtifactId: string;
  contentSha256: string;
  approvalStatus: 'draft' | 'approved' | 'superseded' | 'held';
  approvedAt: string | null;
  effectiveAt: string;
  supersededAt: string | null;
  accessClass: AccessClass;
}

export interface BoardRoleTerm extends VersionedRecord {
  memberId: string;
  role: 'chair' | 'vice_chair' | 'secretary' | 'treasurer' | 'director' | 'committee_chair';
  startsAt: string;
  endsAt: string | null;
  appointmentArtifactId: string;
  active: boolean;
}

export interface Committee extends VersionedRecord {
  name: string;
  charterVersionId: string;
  authority: GovernanceAction[];
  status: 'active' | 'inactive';
}

export interface CommitteeMembership extends VersionedRecord {
  committeeId: string;
  memberId: string;
  role: 'chair' | 'member' | 'advisor';
  voting: boolean;
  startsAt: string;
  endsAt: string | null;
}

export interface VotingEligibility extends VersionedRecord {
  memberId: string;
  meetingId: string | null;
  agendaItemId: string | null;
  eligible: boolean;
  reason: string;
  evaluatedAgainstAuthorityVersionId: string;
  evaluatedAt: string;
}

export interface AuthorityDelegation extends VersionedRecord {
  grantorMemberId: string;
  granteeMemberId: string;
  actions: GovernanceAction[];
  startsAt: string;
  endsAt: string;
  purpose: string;
  artifactId: string;
  revokedAt: string | null;
}

export interface ConflictManagementRestriction extends VersionedRecord {
  memberId: string;
  matterId: string;
  restriction: 'disclose' | 'recuse_discussion' | 'recuse_vote' | 'exclude_session' | 'no_record_access';
  basis: string;
  startsAt: string;
  endsAt: string | null;
  status: 'active' | 'released';
}

export interface BreakGlassGrant extends VersionedRecord {
  requesterActorId: string;
  approvedByMemberId: string;
  legalNotificationRecipientIds: string[];
  purpose: string;
  matterId: string;
  accessClasses: AccessClass[];
  startsAt: string;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  approvalArtifactId: string;
}

export type ThresholdRule =
  | { kind: 'majority_present' }
  | { kind: 'majority_authorized' }
  | { kind: 'two_thirds_present' }
  | { kind: 'two_thirds_authorized' }
  | { kind: 'unanimous_authorized' }
  | { kind: 'fixed'; approvalsRequired: number };

export interface GovernanceAuthorityProfile extends VersionedRecord {
  sourceBylawVersionRecordId: string;
  sourceBylawArtifactId: string;
  sourceBylawVersion: string;
  sourceCharterArtifactIds: string[];
  sourceCharterVersionRecordIds: string[];
  approvalStatus: 'draft' | 'approved' | 'superseded' | 'held';
  effectiveAt: string;
  supersededAt: string | null;
  authorizedSeatIds: string[];
  openingQuorum: ThresholdRule;
  itemQuorum: ThresholdRule;
  voteThresholds: Record<string, ThresholdRule>;
  remoteAttendanceAllowed: boolean;
  remoteAttendanceRequirements: string[];
  writtenConsentAllowed: boolean;
  writtenConsentThreshold: ThresholdRule;
  specialMeetingRules: string[];
  emergencyMeetingRules: string[];
  committeeAuthority: Record<string, GovernanceAction[]>;
}

export type SourcePosture =
  | 'live_verified'
  | 'review_required'
  | 'draft'
  | 'synthetic_uat'
  | 'held'
  | 'conflicted'
  | 'superseded'
  | 'unavailable';

export type SourceImpact =
  | 'informational'
  | 'review_required'
  | 'approval_blocked'
  | 'execution_blocked'
  | 'certification_blocked';

export interface SourceAuthorityMetadata extends VersionedRecord {
  sourceSystem: string;
  sourceRecordId: string;
  sourceVersion: string | null;
  effectiveAt: string | null;
  approvalStatus: 'approved' | 'pending' | 'rejected' | 'unknown';
  ownerId: string | null;
  asOf: string | null;
  dataThrough: string | null;
  freshnessEvaluatedAt: string;
  freshness: 'current' | 'aging' | 'stale' | 'unknown';
  posture: SourcePosture;
  holdReason: string | null;
  conflictRecordIds: string[];
  supersedesId: string | null;
  supersededById: string | null;
  impact: SourceImpact;
  contentSha256: string | null;
  accessClass: AccessClass;
  retentionClass: 'standard' | 'claims' | 'phi-access' | 'legal-hold';
  legalHold: boolean;
}

export interface GovernanceMeeting extends VersionedRecord {
  meetingType: 'regular' | 'special' | 'emergency' | 'committee';
  title: string;
  committeeId: string | null;
  authorityProfileVersionId: string;
  scheduledStart: string;
  timezone: string;
  status: 'draft' | 'notice_published' | 'agenda_published' | 'ready' | 'in_session' | 'adjourned' | 'minutes_pending' | 'closed' | 'superseded';
  noticeArtifactId: string | null;
  noticeSourceMetadataId: string | null;
  noticeContentSha256: string | null;
  noticeVersion: number;
  noticePublishedAt: string | null;
  noticeRecipientMemberIds: string[];
  noticePublicationId: string | null;
  agendaId: string | null;
  boardBookId: string | null;
  calledToOrderAt: string | null;
  adjournedAt: string | null;
  minutesId: string | null;
  supersedesMeetingId: string | null;
}

export interface MeetingNoticePublication extends VersionedRecord {
  meetingId: string;
  noticeVersion: number;
  artifactId: string;
  sourceMetadataId: string;
  contentSha256: string;
  publishedAt: string;
  recipientMemberIds: string[];
  supersedesNoticePublicationId: string | null;
}

export interface MeetingSessionEvent extends VersionedRecord {
  meetingId: string;
  agendaItemId: string | null;
  event: 'entered_executive_session' | 'returned_to_open_session';
  basis: string;
  accessClass: 'executive_session';
  occurredAt: string;
}

export interface GovernanceAgenda extends VersionedRecord {
  meetingId: string;
  agendaVersion: number;
  status: 'draft' | 'published' | 'amended' | 'superseded';
  publishedAt: string | null;
  amendmentReason: string | null;
  items: AgendaItem[];
}

export interface AgendaItem {
  id: string;
  sequence: number;
  title: string;
  purpose: 'information' | 'discussion' | 'decision' | 'executive_session';
  decisionId: string | null;
  sourceMetadataIds: string[];
  accessClass: AccessClass;
  authorityKey: string;
  estimatedMinutes: number;
}

export interface AttendanceEvent extends VersionedRecord {
  meetingId: string;
  memberId: string;
  event: 'arrived' | 'departed' | 'remote_connected' | 'remote_disconnected';
  occurredAt: string;
  mode: 'in_person' | 'remote';
  communicationVerified: boolean;
}

export interface ConflictDisclosure extends VersionedRecord {
  meetingId: string;
  agendaItemId: string;
  memberId: string;
  disclosure: string;
  restrictionIds: string[];
  disclosedAt: string;
}

export interface EligibilitySnapshot {
  authorityProfileVersionId: string;
  evaluatedAt: string;
  meetingId: string;
  agendaItemId: string;
  eligibleMemberIds: string[];
  recusedMemberIds: string[];
  absentMemberIds: string[];
  quorumMet: boolean;
  quorumRule: ThresholdRule;
  contentSha256: string;
}

export interface GovernanceMotion extends VersionedRecord {
  meetingId: string;
  agendaItemId: string;
  decisionId: string;
  text: string;
  conditions: string[];
  movedByMemberId: string;
  secondedByMemberId: string | null;
  parentMotionId: string | null;
  amendmentSequence: number;
  status: 'moved' | 'seconded' | 'withdrawn' | 'voting' | 'disposed';
  eligibilitySnapshot: EligibilitySnapshot | null;
}

export interface GovernanceVote extends VersionedRecord {
  meetingId: string;
  motionId: string;
  memberId: string;
  value: 'approve' | 'deny' | 'abstain';
  dissentStatement: string | null;
  castAt: string;
  eligibilitySnapshotSha256: string;
}

export interface WrittenConsent extends VersionedRecord {
  decisionId: string;
  authorityProfileVersionId: string;
  text: string;
  eligibilitySnapshot: EligibilitySnapshot;
  threshold: ThresholdRule;
  signatureArtifactIds: string[];
  signerMemberIds: string[];
  recordArtifactId: string | null;
  status: 'collecting' | 'approved' | 'failed' | 'expired';
  expiresAt: string;
}

export interface BoardBook extends VersionedRecord {
  meetingId: string;
  status: 'assembling' | 'verification_failed' | 'ready' | 'locked' | 'superseded';
  accessClass: AccessClass;
  sectionIds: string[];
  manifestId: string | null;
  sourceOwnerCertificationIds: string[];
  distributionId: string | null;
  lockedAt: string | null;
  supersedesBoardBookId: string | null;
}

export interface BoardBookSection extends VersionedRecord {
  boardBookId: string;
  sequence: number;
  title: string;
  required: boolean;
  artifactId: string;
  artifactVersion: string;
  contentSha256: string;
  sourceMetadataId: string;
  sourceOwnerCertificationId: string | null;
  verifiedAt: string;
  verifiedByAdapter: string;
  accessClass: AccessClass;
}

export interface FrozenBoardBookManifest extends VersionedRecord {
  boardBookId: string;
  meetingId: string;
  sections: Array<{
    sectionId: string;
    sequence: number;
    artifactId: string;
    artifactVersion: string;
    contentSha256: string;
    sourceMetadataId: string;
    sourceOwnerCertificationId: string;
    accessClass: AccessClass;
  }>;
  manifestSha256: string;
  frozenAt: string;
}

export interface BoardBookDistribution extends VersionedRecord {
  boardBookId: string;
  manifestSha256: string;
  recipientMemberIds: string[];
  distributedAt: string;
  readReceipts: Array<{ memberId: string; readAt: string; manifestSha256: string }>;
  managementQuestions: Array<{
    id: string;
    memberId: string;
    question: string;
    createdAt: string;
    responseArtifactId: string | null;
    responseArtifactVersion: string | null;
    responseContentSha256: string | null;
    responseSourceMetadataId: string | null;
    responseVerifiedAt: string | null;
  }>;
}

export interface GovernanceDecision extends VersionedRecord {
  title: string;
  question: string;
  origin: 'meeting' | 'written_consent' | 'committee' | 'emergency';
  status: 'intake' | 'triaged' | 'packet_pending' | 'placed_in_packet' | 'deliberation' | 'approved' | 'denied' | 'tabled' | 'withdrawn' | 'superseded';
  authorityProfileVersionId: string;
  authorityKey: string;
  sourceMetadataIds: string[];
  meetingId: string | null;
  agendaItemId: string | null;
  motionId: string | null;
  writtenConsentId: string | null;
  dispositionBasis: 'vote' | 'written_consent' | null;
  dispositionArtifactId: string | null;
  dispositionAt: string | null;
  conditions: string[];
}

export interface GovernanceMinutes extends VersionedRecord {
  meetingId: string;
  status: 'event_draft' | 'secretary_reconciled' | 'chair_reviewed' | 'board_approved' | 'signature_routing' | 'signed_locked' | 'superseded';
  canonicalFormId: string;
  eventStreamThrough: string;
  sourceLinkedRedlineArtifactId: string | null;
  approvedVersion: number | null;
  approvedContentSha256: string | null;
  requiredSignerMemberIds: string[];
  ecignInstanceId: string | null;
  finalSignedArtifactId: string | null;
  finalContentSha256: string | null;
  lockedAt: string | null;
  retentionUntil: string | null;
  legalHold: boolean;
  supersedesMinutesId: string | null;
}

export interface GovernanceActionItem extends VersionedRecord {
  decisionId: string;
  title: string;
  ownerId: string;
  status: 'assigned' | 'accepted' | 'in_progress' | 'overdue' | 'escalated' | 'management_complete' | 'returned_to_board' | 'effectiveness_accepted' | 'continued' | 'modified' | 'reopened' | 'closed';
  dueAt: string;
  acceptedAt: string | null;
  managementCertificationArtifactId: string | null;
  evidenceArtifactIds: string[];
  evidenceArtifacts: VerifiedActionArtifact[];
  managementCertificationArtifact: VerifiedActionArtifact | null;
  boardReturnAt: string | null;
  effectivenessDisposition: 'effective' | 'partially_effective' | 'ineffective' | 'continue_monitoring' | null;
  effectivenessBasisArtifactIds: string[];
  effectivenessBasisArtifacts: VerifiedActionArtifact[];
  closedAt: string | null;
}

export interface VerifiedActionArtifact {
  artifactId: string;
  artifactVersion: string;
  contentSha256: string;
  sourceMetadataId: string;
  verifiedAt: string;
  verifiedByAdapter: string;
}

export interface AcademyAssignment extends VersionedRecord {
  memberId: string;
  moduleId: string;
  contentVersion: string;
  policyVersionIds: string[];
  sourceMetadataIds: string[];
  assignedAt: string;
  dueAt: string;
  status: 'assigned' | 'in_progress' | 'remediation' | 'complete' | 'expired';
}

export interface AcademyAttempt extends VersionedRecord {
  assignmentId: string;
  memberId: string;
  moduleId: string;
  contentVersion: string;
  policyVersionIds: string[];
  sourceMetadataIds: string[];
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'remediation' | 'passed' | 'expired';
  startedAt: string;
  lastHeartbeatAt: string;
  activeSeconds: number;
  completedStageIds: string[];
  answerEventIds: string[];
  taskEventIds: string[];
  score: number | null;
  criticalError: boolean | null;
  passed: boolean | null;
  submittedAt: string | null;
  cooldownUntil: string | null;
  completionEvidenceArtifactId: string | null;
}

export interface AcademyAnswerEvent extends VersionedRecord {
  attemptId: string;
  stageId: string;
  questionId: string;
  answerId: string;
  occurredAt: string;
}

export interface AcademyTaskEvent extends VersionedRecord {
  attemptId: string;
  stageId: string;
  taskId: string;
  eventType: string;
  payload: Record<string, string | number | boolean | null>;
  occurredAt: string;
}

export interface AcademyCompletionEvidence extends VersionedRecord {
  assignmentId: string;
  attemptId: string;
  memberId: string;
  moduleId: string;
  contentVersion: string;
  policyVersionIds: string[];
  sourceMetadataIds: string[];
  score: number;
  criticalError: boolean;
  activeSeconds: number;
  answerEventIds: string[];
  taskEventIds: string[];
  completedAt: string;
  evidenceSha256: string;
}

export interface AuditOutboxRecord extends VersionedRecord {
  mutationId: string;
  eventType: string;
  action: string;
  actorId: string;
  resourceType: GovernanceRecordType;
  resourceId: string;
  correlationId: string;
  payload: Record<string, unknown>;
  dispatchedAt: string | null;
}

export interface GovernanceRecordAccessEvent extends VersionedRecord {
  recordType: GovernanceRecordType;
  recordId: string;
  actorId: string;
  delivery: 'view' | 'download' | 'print' | 'share';
  recipientIds: string[];
  deliveredAt: string;
  deliveredContentSha256: string;
}

export interface IdempotencyRecord extends VersionedRecord {
  key: string;
  scope: string;
  requestSha256: string;
  response: unknown;
  mutationRecordIds: string[];
  expiresAt: string;
}

export type GovernanceRecord =
  | GoverningBodyMember
  | BylawCharterVersion
  | BoardRoleTerm
  | Committee
  | CommitteeMembership
  | VotingEligibility
  | AuthorityDelegation
  | ConflictManagementRestriction
  | BreakGlassGrant
  | GovernanceAuthorityProfile
  | SourceAuthorityMetadata
  | GovernanceMeeting
  | MeetingNoticePublication
  | GovernanceAgenda
  | AttendanceEvent
  | ConflictDisclosure
  | MeetingSessionEvent
  | GovernanceMotion
  | GovernanceVote
  | WrittenConsent
  | BoardBook
  | BoardBookSection
  | FrozenBoardBookManifest
  | BoardBookDistribution
  | GovernanceDecision
  | GovernanceMinutes
  | GovernanceActionItem
  | AcademyAssignment
  | AcademyAttempt
  | AcademyAnswerEvent
  | AcademyTaskEvent
  | AcademyCompletionEvidence
  | AuditOutboxRecord
  | GovernanceRecordAccessEvent
  | IdempotencyRecord;

export const GOVERNANCE_RECORD_TYPES = [
  'member', 'bylaw_charter_version', 'role_term', 'committee', 'committee_membership', 'voting_eligibility',
  'authority_delegation', 'conflict_restriction', 'break_glass', 'authority_profile', 'source_metadata',
  'meeting', 'notice_publication', 'agenda', 'attendance_event', 'conflict_disclosure', 'session_event', 'motion', 'vote',
  'written_consent', 'board_book', 'board_book_section', 'board_book_manifest',
  'board_book_distribution', 'decision', 'minutes', 'action_item', 'academy_assignment',
  'academy_attempt', 'academy_answer_event', 'academy_task_event', 'academy_completion_evidence', 'record_access_event', 'audit_outbox', 'idempotency',
] as const;

export type GovernanceRecordType = (typeof GOVERNANCE_RECORD_TYPES)[number];

export interface MutationContext {
  organizationId: string;
  actorId: string;
  correlationId: string;
  idempotencyKey: string;
  now: string;
}

export interface MutationWrite {
  type: GovernanceRecordType;
  record: GovernanceRecord;
  expectedVersion: number | null;
}

export interface GovernanceMutation<T = unknown> {
  scope: string;
  requestSha256: string;
  writes: MutationWrite[];
  response: T;
  outbox: Omit<AuditOutboxRecord, keyof VersionedRecord> & { id: string };
  idempotencyExpiresAt: string;
}

export interface GovernanceProjection {
  generatedAt: string;
  organizationId: string;
  sourcePosture: 'live' | 'partial' | 'unavailable';
  authorityProfile: GovernanceAuthorityProfile | null;
  readinessBlockers: string[];
  assignments: Array<{ type: string; id: string; title: string; dueAt: string | null; status: string }>;
  meetings: GovernanceMeeting[];
  boardBooks: BoardBook[];
  decisions: GovernanceDecision[];
  actions: GovernanceActionItem[];
  academyAssignments: AcademyAssignment[];
}
