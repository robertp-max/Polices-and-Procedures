/**
 * Care Indeed LMS — provider-neutral domain types (Wave 1).
 *
 * Faithful to CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md §6. No cloud SDK imports:
 * persistence/signing/queueing are expressed as ports (see ./ports.ts). Physical
 * Phase-1 adapters target Google Cloud per ADR-LEARNING-001.
 *
 * Every "official" value here is server-derived and append-only; there is no
 * standalone `completed: true`.
 */

export type Iso = string; // ISO-8601 timestamp
export type Uuid = string;

export interface VersionRef {
  id: string;
  version: string | number;
  sha256?: string;
}
export interface ContentRevisionRef {
  id: string;
  version: string;
  sha256: string;
}
export interface PolicyVersionRef {
  policyId: string;
  version: string;
  sha256: string;
}

export type RoleCode =
  | 'GENERAL'
  | 'ADM'
  | 'DON'
  | 'RN'
  | 'LVN'
  | 'HHA'
  | 'PT'
  | 'PTA'
  | 'OT'
  | 'COTA'
  | 'SLP'
  | 'MSW';

export interface LearningSubject {
  id: Uuid;
  tenantId: string;
  identityProviderSubject: string;
  employeeId?: string;
  status: 'PENDING' | 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'TERMINATED';
  branchId?: string;
  createdAt: Iso;
}

export interface RoleAssignment {
  id: Uuid;
  subjectId: Uuid;
  roleCode: RoleCode;
  isPrimary: boolean;
  department?: string;
  dutyFlags: string[];
  supervisorSubjectId?: Uuid;
  effectiveFrom: Iso;
  effectiveTo?: Iso;
  sourceSystem: string;
  sourceRecordId: string;
}

export type AdapterType =
  | 'JOURNEY'
  | 'STANDALONE'
  | 'SCORM_1_2'
  | 'POLICY'
  | 'FORM'
  | 'EXTERNAL'
  | 'LIVE'
  | 'COMPETENCY';

export interface ContentRevision {
  id: string;
  version: string;
  sha256: string;
  adapterType: AdapterType;
  launchRef?: string;
  publicationStatus: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED' | 'RETIRED';
  available: boolean;
}

export type RequirementKind =
  | 'TRAINING'
  | 'POLICY_READING'
  | 'KNOWLEDGE_ASSESSMENT'
  | 'SCENARIO_ASSESSMENT'
  | 'COMPETENCY'
  | 'SUPERVISED_PRACTICE'
  | 'ATTESTATION'
  | 'LIVE_SESSION'
  | 'DRILL'
  | 'EXTERNAL_CERTIFICATE'
  | 'CREDENTIAL'
  | 'ACCUMULATED_HOURS'
  | 'CLEARANCE';

export interface RequirementDefinition {
  id: string;
  version: number;
  code: string;
  name: string;
  kind: RequirementKind;
  applicableRoleCodes: RoleCode[];
  dutyFlags?: string[];
  contentRef?: ContentRevisionRef;
  policyVersionRefs: PolicyVersionRef[];
  attemptPolicyRef?: VersionRef;
  gradePolicyRef?: VersionRef;
  evidenceSpecRefs: VersionRef[];
  recurrenceRuleRef?: VersionRef;
  prerequisiteRequirementRefs: VersionRef[];
  certificateScopes: string[];
  effectiveFrom: Iso;
  effectiveTo?: Iso;
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
}

export type AssignmentStatus =
  | 'PENDING_CONTENT'
  | 'READY'
  | 'LOCKED_PREREQUISITE'
  | 'IN_PROGRESS'
  | 'PENDING_EVIDENCE'
  | 'PENDING_REVIEW'
  | 'PENDING_SIGNOFF'
  | 'REMEDIATION'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'BLOCKED_CONTENT'
  | 'WAIVED'
  | 'SUPERSEDED'
  | 'REVOKED';

export interface LearningAssignment {
  id: Uuid;
  subjectId: Uuid;
  roleAssignmentIds: Uuid[];
  requirementRef: VersionRef;
  pinnedContentRef?: ContentRevisionRef;
  assignedAt: Iso;
  availableAt: Iso;
  dueAt?: Iso;
  cycleId?: Uuid;
  status: AssignmentStatus;
  statusReasonCodes: string[];
  completionDecisionId?: Uuid;
  version: number;
}

export type AttemptStatus =
  | 'STARTED'
  | 'SUBMITTED'
  | 'SCORED'
  | 'PASSED'
  | 'FAILED'
  | 'LOCKED'
  | 'VOIDED'
  | 'TECHNICAL_ERROR';

export interface AssessmentAttempt {
  id: Uuid;
  assignmentId: Uuid;
  assessmentDefinitionRef: VersionRef;
  questionBankRef?: VersionRef;
  attemptNumber: number;
  startedAt: Iso;
  submittedAt?: Iso;
  status: AttemptStatus;
  questionSetSha256?: string;
  responseSetSha256?: string;
  /** Set when this attempt is opened by an identity-bound reattempt authorization. */
  reattemptAuthorizationId?: Uuid;
}

export interface ScoreResult {
  id: Uuid;
  attemptId: Uuid;
  rawEarned: number;
  rawPossible: number;
  percentage?: number;
  scaledScore?: number;
  criticalFailureCodes: string[];
  scoredAt: Iso;
  scoringEngineVersion: string;
  resultSha256: string;
}

export type GradeOutcomeKind =
  | 'NOT_GRADED'
  | 'PASSED'
  | 'FAILED'
  | 'NEEDS_REMEDIATION'
  | 'PENDING_EVALUATOR';

export type AttemptSelectionPolicy =
  | 'FIRST_PASS'
  | 'HIGHEST_SCORE'
  | 'LATEST_ATTEMPT'
  | 'LATEST_PASS'
  | 'EVALUATOR_DECISION'
  | 'ALL_COMPONENTS_REQUIRED';

export interface GradeResult {
  id: Uuid;
  assignmentId: Uuid;
  gradePolicyRef: VersionRef;
  selectedAttemptId?: Uuid;
  outcome: GradeOutcomeKind;
  displayedScore?: number;
  reasonCodes: string[];
  decidedAt: Iso;
  decisionSha256: string;
}

export interface ReattemptAuthorization {
  id: Uuid;
  subjectId: Uuid;
  assignmentId: Uuid;
  remediationCaseId: Uuid;
  issuedAt: Iso;
  expiresAt: Iso;
  consumedByAttemptId?: Uuid;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'REVOKED';
}

export type EvidenceStatus = 'PENDING' | 'VALID' | 'REJECTED' | 'SUPERSEDED' | 'REVOKED';

export interface CompletionEvidence {
  id: Uuid;
  subjectId: Uuid;
  assignmentId?: Uuid;
  evidenceType:
    | 'TRAINING_RECORD'
    | 'POLICY_ATTESTATION'
    | 'ASSESSMENT_RESULT'
    | 'COMPETENCY_FORM'
    | 'SUPERVISED_VISIT'
    | 'LIVE_ATTENDANCE'
    | 'DRILL_RECORD'
    | 'EXTERNAL_CERTIFICATE'
    | 'SYSTEM_ASSERTION';
  artifactRef?: { provider: 'GCS' | 'DRIVE'; locator: string; versionId?: string; sha256: string };
  policyVersionRefs: PolicyVersionRef[];
  workflowRefs: VersionRef[];
  status: EvidenceStatus;
  createdAt: Iso;
  createdBy: string;
  validatedAt?: Iso;
  validatedBy?: string;
  retentionClass: string;
  legalHold: boolean;
}

export interface SignoffRecord {
  id: Uuid;
  subjectId: Uuid;
  assignmentId: Uuid;
  signerSubjectId: Uuid;
  actingRoleAssignmentId: Uuid;
  signerSlot: string;
  distinctHumanGroup?: string;
  attestationTextVersion: string;
  decision: 'APPROVE' | 'REJECT' | 'NEEDS_CORRECTION';
  signedAt: Iso;
  evidenceId: Uuid;
  signatureServiceRef?: string;
}

export type GateType =
  | 'ASSIGNMENT_COMPLETION'
  | 'CERTIFICATE_ELIGIBILITY'
  | 'FIELD_CLEARANCE'
  | 'SYSTEM_ACCESS_CLEARANCE'
  | 'ANNUAL_READINESS';

export type GateOutcome = 'PASS' | 'FAIL' | 'CONDITIONAL';

export interface GateDecision {
  id: Uuid;
  gateDefinitionRef: VersionRef;
  gateType: GateType;
  subjectId: Uuid;
  roleAssignmentId?: Uuid;
  evaluatedAt: Iso;
  inputAssignmentIds: Uuid[];
  inputEvidenceIds: Uuid[];
  inputSignoffIds: Uuid[];
  inputGradeIds: Uuid[];
  stateVectorSha256: string;
  outcome: GateOutcome;
  reasonCodes: string[];
  activeOverrideId?: Uuid;
  assertionSignature: string; // Cloud KMS-backed signature
  evaluatorVersion: string;
  expiresAt?: Iso;
}

export interface ActivitySession {
  id: Uuid;
  subjectId: Uuid;
  assignmentId: Uuid;
  contentRef: ContentRevisionRef;
  startedAt: Iso;
  endedAt?: Iso;
  state: 'OPEN' | 'CLOSED' | 'ABANDONED' | 'INVALIDATED';
  acceptedActiveSeconds: number;
  lastAcceptedSequence: number;
}

export interface LearningActivityEvent {
  id: Uuid;
  tenantId: string;
  subjectId: Uuid;
  actorSubjectId: Uuid;
  assignmentId: Uuid;
  sessionId?: Uuid;
  eventType: string;
  eventVersion: number;
  sequence?: number;
  occurredAt: Iso;
  receivedAt: Iso;
  idempotencyKey: string;
  correlationId: string;
  causationId?: string;
  contentRef?: ContentRevisionRef;
  payload: Record<string, unknown>;
  payloadSha256: string;
}

export interface CreditLedgerEntry {
  id: Uuid;
  subjectId: Uuid;
  assignmentId?: Uuid;
  evidenceId: Uuid;
  creditType: 'TRAINING_HOUR' | 'HHA_INSERVICE_HOUR' | 'CEU';
  value: number;
  occurredAt: Iso;
  acceptedAt: Iso;
  acceptedBy: string;
  cycleIds: Uuid[];
  status: 'ACCEPTED' | 'REJECTED' | 'REVERSED';
}

export type CertificateKind =
  | 'MODULE_COMPLETION'
  | 'POLICY_READING'
  | 'GAO_TRACK'
  | 'ROLE_ONBOARDING'
  | 'ACHC_ANNUAL_BUNDLE'
  | 'ANNUAL_CYCLE'
  | 'ADVANCED_MODULE'
  | 'HHA_INSERVICE_12H'
  | 'COMPETENCY_VALIDATION';

export interface CertificateRecord {
  id: Uuid;
  publicId: string;
  certificateDefinitionRef: VersionRef;
  subjectId: Uuid;
  roleAssignmentIds: Uuid[];
  gateDecisionId: Uuid;
  eligibilitySnapshotSha256: string;
  assignmentIds: Uuid[];
  policyVersions: PolicyVersionRef[];
  gradeIds: Uuid[];
  evidenceIds: Uuid[];
  signoffIds: Uuid[];
  issuedAt: Iso;
  issuedBy: 'SYSTEM' | string;
  artifactEvidenceId: Uuid;
  manifestArtifactEvidenceId: Uuid;
  templateId: string;
  templateVersion: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
  supersedesCertificateId?: Uuid;
  revocationReason?: string;
}
