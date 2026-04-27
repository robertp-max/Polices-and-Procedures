/* ═══════════════════════════════════════════════════════════════
   Onboarding V2 — Compliance Activation Engine
   Type definitions (per Builder/Onboarding/V2/08-Data-Model.md)
   ═══════════════════════════════════════════════════════════════ */

export type DomainCode = 'EN' | 'CL' | 'OP' | 'FN' | 'RM' | 'CO' | 'IT' | 'QA' | 'HR';

export type RoleId =
  | 'ADMIN' | 'CLINICAL_MANAGER' | 'RN' | 'LVN' | 'HHA' | 'THERAPIST'
  | 'QAPI_MEMBER' | 'COMPLIANCE_OFFICER' | 'PRIVACY_OFFICER' | 'SECURITY_OFFICER'
  | 'OFFICE_STAFF' | 'INTAKE' | 'BILLING' | 'GOVERNING_BODY' | 'MEDICAL_DIRECTOR'
  | 'VENDOR' | 'VOLUNTEER';

export type TriggerType =
  | 'NEW_HIRE' | 'ROLE_CHANGE' | 'REACTIVATION' | 'ANNUAL_REVALIDATION'
  | 'CREDENTIAL_EXPIRY_WINDOW' | 'POLICY_VERSION_CHANGE' | 'SCOPE_EXPANSION'
  | 'VENDOR_ONBOARD' | 'GOVERNANCE_APPOINTMENT';

export type SubjectType = 'Workforce' | 'Vendor';

export type GateId =
  | 'FieldClearance' | 'BillingClearance' | 'SystemAccessClearance'
  | 'VendorEngagement' | 'GovernanceActive';

export type EvidenceObjectType =
  | 'TrainingRecord' | 'FormSubmission' | 'FileUpload' | 'ExternalSystemRecord'
  | 'ScreeningResult' | 'PSVResult' | 'CompetencyArtifact' | 'SignedPolicy';

export type SignerRole =
  | 'Subject' | 'Supervisor' | 'ClinicalManager' | 'ComplianceOfficer'
  | 'Administrator' | 'Vendor' | 'PrivacyOfficer' | 'GoverningBodyChair' | 'Custom';

export type UnitStatus =
  | 'NotStarted' | 'InProgress' | 'Blocked' | 'AtRisk'
  | 'AwaitingSignature' | 'AwaitingEvidence' | 'Completed' | 'Failed' | 'Suppressed';

export type BatchStatus =
  | 'PendingActivation' | 'InProgress' | 'AtRisk' | 'Blocked'
  | 'AwaitingSignature' | 'AwaitingEvidence' | 'Completed' | 'Withdrawn'
  | 'RevalidationDue';

export type EvidenceStatus = 'Pending' | 'Valid' | 'Rejected' | 'Superseded';
export type SignatureStatus = 'Requested' | 'Sent' | 'Viewed' | 'Signed' | 'Declined' | 'Expired' | 'Voided';
export type GateOutcome = 'Pass' | 'Fail' | 'Conditional' | 'Pending';
export type Phase =
  | 'PreHire' | 'Orientation' | 'Training' | 'Competency' | 'Acknowledgments' | 'Clearance' | 'PostActivation';

export const PHASE_ORDER: readonly Phase[] = [
  'PreHire', 'Orientation', 'Training', 'Competency', 'Acknowledgments', 'Clearance', 'PostActivation',
] as const;

export const PHASE_LABEL: Record<Phase, string> = {
  PreHire: 'Pre-Hire',
  Orientation: 'Orientation',
  Training: 'Training',
  Competency: 'Competency',
  Acknowledgments: 'Acknowledgments',
  Clearance: 'Clearance',
  PostActivation: 'Post-Activation',
};

/* ── Subject objects ──────────────────────────────────────────── */

export interface Role {
  id: RoleId;
  name: string;
  domain: DomainCode;
  description: string;
}

export interface WorkforceMember {
  id: string;
  legalName: string;
  preferredName?: string;
  email: string;
  hireDate: string;        // ISO date
  status: 'Prospect' | 'Active' | 'OnLeave' | 'Terminated' | 'Withdrawn';
  primaryRoleId: RoleId;
  roleIds: RoleId[];
  branchId: string;
  supervisorId?: string;
}

export interface Vendor {
  id: string;
  legalName: string;
  vendorType: 'BA' | 'NonBA' | 'Contractor';
  status: 'Pending' | 'Active' | 'Suspended' | 'Terminated';
  primaryContactName: string;
  primaryContactEmail: string;
}

/* ── Catalog objects ──────────────────────────────────────────── */

export interface PolicyVersionRef {
  policyId: string;
  policyVersion: string;
  contentHash: string;     // sha256 of canonical render
}

export interface SignatureSpec {
  signerRole: SignerRole;
  count: number;
  order: 'Sequential' | 'Parallel';
  bindsTo: 'PolicyVersion' | 'EvidenceObject' | 'Appointment';
  ecignTemplateId?: string;
}

export interface Cadence {
  initial: boolean;
  recurrence?: { kind: 'Annual' | 'Monthly' | 'Biennial' | 'Rolling12mo' | 'PerCardExpiry' };
  preExpiryWindowDays?: number;
}

export interface Gate {
  gateId: GateId;
  weight: 'Required' | 'Conditional';
}

export interface EvidenceRequirement {
  objectType: EvidenceObjectType;
  requiredFields: string[];
  validationRules?: Record<string, unknown>;
}

export interface RoleRequirement {
  id: string;                              // e.g., REQ-RN-LICENSE-PSV
  roleIds: RoleId[];
  name: string;
  description: string;
  policyRefs: PolicyVersionRef[];
  workflowId: string;                      // WF-*
  formIds: string[];                       // FRM-*
  evidenceSchema: EvidenceRequirement[];
  signatureSpecs: SignatureSpec[];
  trainingRefs?: string[];
  competencyRef?: string;                  // COMP-*
  cadence: Cadence;
  preConditions?: string[];                // requirement IDs
  gateContributions: Gate[];
  phase: Phase;
  slaDays: number;
  version: number;
}

export interface OnboardingTemplate {
  id: string;                              // TPL-*
  version: number;
  effectiveFrom: string;                   // ISO
  effectiveTo?: string;
  roleId: RoleId;
  triggerType: TriggerType;
  requirementIds: string[];
  policyVersionRefs: PolicyVersionRef[];
  immutable: true;
}

/* ── Profile / Batch / Unit ───────────────────────────────────── */

export interface OnboardingProfile {
  id: string;
  subjectId: string;
  subjectType: SubjectType;
  roleIds: RoleId[];
  domains: DomainCode[];
  serviceLines: string[];
  patientPopulations: string[];
  supervisorId?: string;
  branchId: string;
  effectiveDate: string;
  priorProfileId?: string;
  createdAt: string;
}

export interface OnboardingExecutionUnit {
  id: string;
  batchId: string;
  requirementId: string;
  workflowId: string;
  workflowVersion: number;
  assigneeId: string;
  assigneeName: string;
  dueAt: string;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  dependencies: string[];
  evidenceRequired: EvidenceRequirement[];
  signatureRequired: SignatureSpec[];
  status: UnitStatus;
  attempts: { index: number; outcome: 'Pass' | 'Fail' | 'Withdrawn'; reason?: string; at: string }[];
  evidenceObjectIds: string[];
  signatureRecordIds: string[];
  startedAt?: string;
  completedAt?: string;
  phase: Phase;
  policyRefs: PolicyVersionRef[];
}

export interface OnboardingExecutionBatch {
  id: string;
  subjectId: string;
  subjectType: SubjectType;
  profileId: string;
  templateId: string;
  templateVersion: number;
  triggerType: TriggerType;
  triggerPayload: Record<string, unknown>;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  dueAt: string;
  status: BatchStatus;
  readinessContribution: number;          // 0..1
  cesSprintIds: string[];
  sealedAt?: string;
}

/* ── Evidence / Signature ─────────────────────────────────────── */

export interface EvidenceObject {
  id: string;
  unitId: string;
  batchId: string;
  subjectId: string;
  objectType: EvidenceObjectType;
  source: 'UserUpload' | 'FormSubmission' | 'ExternalAPI' | 'SystemAttestation';
  sourceRef?: string;
  policyVersionRef?: PolicyVersionRef;
  storageUri: string;
  contentHash: string;
  schemaValidation: { ok: boolean; errors?: string[] };
  contentValidation: { ok: boolean; errors?: string[] };
  createdBy: string;
  createdAt: string;
  status: EvidenceStatus;
  rejectionReason?: string;
  filename: string;
}

export interface SignatureRecord {
  id: string;
  unitId: string;
  batchId: string;
  subjectId: string;
  signerRole: SignerRole;
  signerName: string;
  bindsToType: 'PolicyVersion' | 'EvidenceObject' | 'Appointment';
  bindsToRef: string;
  envelopeId: string;
  status: SignatureStatus;
  signedArtifactUri?: string;
  signedArtifactHash?: string;
  authMethod?: string;
  ip?: string;
  timestamp?: string;
}

/* ── Audit + Gates ────────────────────────────────────────────── */

export type AuditEventType =
  | 'TRIGGER_RECEIVED' | 'PROFILE_RESOLVED' | 'TEMPLATE_SELECTED'
  | 'REQUIREMENT_RECONCILED' | 'REQUIREMENT_EMITTED'
  | 'UNIT_STATE_CHANGED' | 'EVIDENCE_CAPTURED' | 'EVIDENCE_REJECTED'
  | 'SIGNATURE_REQUESTED' | 'SIGNATURE_COMPLETED' | 'SIGNATURE_DECLINED'
  | 'GATE_EVALUATED' | 'OVERRIDE_GRANTED' | 'OVERRIDE_EXPIRED'
  | 'BATCH_CREATED' | 'BATCH_COMPLETED' | 'BATCH_WITHDRAWN';

export interface OnboardingAuditEvent {
  id: string;
  sequence: number;        // monotonic per stream (subject)
  prevHash: string;
  eventHash: string;
  eventType: AuditEventType;
  batchId?: string;
  unitId?: string;
  subjectId?: string;
  actorId?: string;
  actorName?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface GateEvaluation {
  id: string;
  gateId: GateId;
  subjectId: string;
  evaluatedAt: string;
  outcome: GateOutcome;
  reasons: string[];
  caller: string;
  inputs: { unitIds: string[]; evidenceIds: string[] };
}

export interface OverrideRecord {
  id: string;
  gateOrRuleId: string;
  subjectId: string;
  reason: string;
  signerIds: string[];     // dual sig
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

/* ── Triggers (typed payloads) ────────────────────────────────── */

export type TriggerPayload =
  | { type: 'NEW_HIRE'; subjectId: string; roleIds: RoleId[]; branchId: string; effectiveDate: string }
  | { type: 'ROLE_CHANGE'; subjectId: string; priorRoleIds: RoleId[]; newRoleIds: RoleId[]; effectiveDate: string }
  | { type: 'REACTIVATION'; subjectId: string; reason: string; effectiveDate: string }
  | { type: 'ANNUAL_REVALIDATION'; subjectId: string; requirementIds: string[]; period: string }
  | { type: 'CREDENTIAL_EXPIRY_WINDOW'; subjectId: string; requirementId: string; expiryDate: string; windowDays: number }
  | { type: 'POLICY_VERSION_CHANGE'; policyId: string; newVersion: string; affectedRoles: RoleId[] }
  | { type: 'SCOPE_EXPANSION'; subjectId: string; newServiceLines: string[]; newPopulations: string[] }
  | { type: 'VENDOR_ONBOARD'; subjectId: string; vendorType: 'BA' | 'NonBA' | 'Contractor'; effectiveDate: string }
  | { type: 'GOVERNANCE_APPOINTMENT'; subjectId: string; roleId: RoleId; effectiveDate: string };

/* ── Aggregates / Snapshots ───────────────────────────────────── */

export interface OnboardingSnapshot {
  workforce: WorkforceMember[];
  vendors: Vendor[];
  roles: Role[];
  requirements: RoleRequirement[];
  templates: OnboardingTemplate[];
  profiles: OnboardingProfile[];
  batches: OnboardingExecutionBatch[];
  units: OnboardingExecutionUnit[];
  evidence: EvidenceObject[];
  signatures: SignatureRecord[];
  audit: OnboardingAuditEvent[];
  gateEvaluations: GateEvaluation[];
  overrides: OverrideRecord[];
}

export const STATUS_TONE: Record<UnitStatus | BatchStatus, 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  NotStarted: 'muted',
  InProgress: 'info',
  Blocked: 'danger',
  AtRisk: 'warning',
  AwaitingSignature: 'info',
  AwaitingEvidence: 'info',
  Completed: 'success',
  Failed: 'danger',
  Suppressed: 'muted',
  PendingActivation: 'muted',
  Withdrawn: 'muted',
  RevalidationDue: 'warning',
};
