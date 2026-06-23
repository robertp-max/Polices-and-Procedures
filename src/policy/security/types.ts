// Security / Execution / Audit — shared types
// Source: Builder/Security-Execution-Audit/00-09

export type ISODateTime = string;
export type UserId = string;
export type GroupId = string;
export type AssignmentId = string;
export type CeuId = string;
export type EventId = string;
export type SessionId = string;
export type CorrelationId = string;
export type RequestId = string;

// ---------- Identity & Access ----------

export interface User {
  id: UserId;
  externalId: string;
  displayName: string;
  email: string;
  attributes: {
    licenseNumbers?: string[];
    employmentStatus: 'active' | 'suspended' | 'terminated';
    branchIds?: string[];
    hireDate?: ISODateTime;
  };
  status: 'active' | 'suspended';
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type DomainKind = 'clinical' | 'admin' | 'audit' | 'governance' | 'system';

export interface UserGroup {
  id: GroupId;
  name: string;
  domain: DomainKind;
  permissions: PermissionId[];
  description: string;
  /** Optional count for aggregate KPI display (falls back in UI) */
  users?: number;
}

export interface Scope {
  organizationId: string;
  branchId?: string;
  patientId?: string;
  programId?: string;
}

export interface RoleAssignment {
  id: AssignmentId;
  userId: UserId;
  groupId: GroupId;
  scope: Scope;
  effectiveFrom: ISODateTime;
  effectiveTo?: ISODateTime;
  grantedBy: UserId | 'system';
  reason?: string;
  revokedAt?: ISODateTime;
  revokedBy?: UserId | 'system';
}

export type ResourceKind =
  | 'policy' | 'form' | 'ceu' | 'user' | 'group' | 'audit'
  | 'phi' | 'signature' | 'evidence' | 'session' | 'override' | 'system';

export type ActionKind =
  | 'view' | 'create' | 'update' | 'delete'
  | 'approve' | 'sign' | 'audit' | 'override'
  | 'assign' | 'execute' | 'complete' | 'export'
  | 'provision' | 'suspend' | 'replay' | 'read' | 'write' | 'draft' | 'publish';

export type PermissionId = `${ResourceKind}.${ActionKind}` | string;

export interface Permission {
  id: PermissionId;
  resource: ResourceKind;
  action: ActionKind;
  phi: boolean;
}

export interface ResourceRef {
  kind: ResourceKind;
  id: string;
  ownerUserId?: UserId;
  policyVersionId?: string;
  formInstanceId?: string;
  phi?: boolean;
  // Optional richer payload for SoD inspection
  meta?: Record<string, unknown>;
}

export type ObligationCode =
  | 'log_phi_access'
  | 'require_dual_signature'
  | 'require_reauth'
  | 'record_reason'
  | 'notify_compliance';

export interface Obligation {
  code: ObligationCode;
  detail?: Record<string, unknown>;
}

export interface Decision {
  allow: boolean;
  reasonCode: string;
  obligations: Obligation[];
}

export interface ActorContext {
  kind: 'user' | 'system' | 'integration';
  userId?: UserId;
  integrationId?: string;
  onBehalfOf?: UserId;
  sessionId?: SessionId;
  ipAddress?: string;
  userAgent?: string;
  requestId: RequestId;
  correlationId: CorrelationId;
  reauthAt?: ISODateTime;
}

// ---------- Execution Units (CEU) ----------

export type CeuState =
  | 'NotStarted'
  | 'InProgress'
  | 'AwaitingEvidence'
  | 'AwaitingSignature'
  | 'Blocked'
  | 'AtRisk'
  | 'Completed'
  | 'Failed';

export type CeuSourceSystem =
  | 'onboarding' | 'policy_lifecycle' | 'audit'
  | 'calendar' | 'ecign' | 'ces' | 'manual';

export interface PolicyVersionRef {
  policyId: string;
  policyCode: string;
  versionId: string;
  versionNumber: string;
  effectiveDate: ISODateTime;
  contentHash: string;
}

export interface FormRef { formId: string; instanceId: string; }
export interface PatientRef { patientId: string; phi: true; }

export interface EvidenceRequirement {
  id: string;
  kind: 'document' | 'attestation' | 'screenshot' | 'system_check' | 'training_record';
  description: string;
  acceptedMimeTypes?: string[];
  validatorId?: string;
  optional?: boolean;
}

export interface EvidenceArtifact {
  requirementId: string;
  artifactRef: string;
  contentHash: string;
  submittedByUserId: UserId;
  submittedAt: ISODateTime;
  validatedAt?: ISODateTime;
  validatorResult?: 'pass' | 'fail' | 'manual_review';
}

export interface SignatureRequirement {
  id: string;
  role: GroupId | 'self' | 'witness';
  ecignTemplateId: string;
  order?: number;
  optional?: boolean;
}

export interface SignatureRecord {
  requirementId: string;
  ecignSignatureId: string;
  // eCIgn enforcement fields. Both MUST be set for a signature to count
  // toward CEU completion (see stateMachine.applyEvent → UNIT_COMPLETED).
  ecignId: string;
  verified: boolean;
  signedByUserId: UserId;
  signedAt: ISODateTime;
  ipAddress?: string;
  userAgent?: string;
  documentHash: string;
}

export interface CeuStateTransition {
  from: CeuState;
  to: CeuState;
  at: ISODateTime;
  actorUserId: UserId | 'system';
  reasonCode: string;
  correlationId: CorrelationId;
  evidenceRefs?: string[];
  signatureRefs?: string[];
  auditEventId: EventId;
}

export interface ExecutionUnit {
  id: CeuId;
  shortCode: string;
  title: string;
  description: string;

  source: {
    system: CeuSourceSystem;
    sourceId: string;
    correlationId: CorrelationId;
  };

  policyRef?: PolicyVersionRef;
  formRef?: FormRef;
  patientRef?: PatientRef;

  classification: {
    domain: 'clinical' | 'admin' | 'compliance' | 'governance' | 'survey' | 'phi';
    riskTier: 'low' | 'standard' | 'high' | 'critical';
    phi: boolean;
  };

  ownership: {
    assigneeUserId?: UserId;
    assigneeGroupId?: GroupId;
    requiredRoles: GroupId[];
    reviewerUserId?: UserId;
    requiresReviewer: boolean;
  };

  evidence: {
    required: EvidenceRequirement[];
    submitted: EvidenceArtifact[];
  };

  signatures: {
    required: SignatureRequirement[];
    collected: SignatureRecord[];
  };

  dependencies: {
    blockedBy: CeuId[];
    relatedTo: CeuId[];
    parentId?: CeuId;
    childIds: CeuId[];
    bundleId?: string;
  };

  schedule: {
    createdAt: ISODateTime;
    dueAt?: ISODateTime;
    slaHours?: number;
    startedAt?: ISODateTime;
    completedAt?: ISODateTime;
  };

  state: CeuState;
  stateHistory: CeuStateTransition[];

  blockReasons?: BlockReason[];
  escalation?: 'L1' | 'L2' | 'L3' | 'SECURITY';
  overrideId?: string;

  metadata: Record<string, unknown>;
  version: number;
}

export interface BlockReason {
  code: string;
  message: string;
  since: ISODateTime;
  clearableBy: GroupId[];
  blockingCeuId?: CeuId;
}

// ---------- Audit Event ----------

export type EventCategory =
  | 'access' | 'ceu' | 'policy' | 'form'
  | 'signature' | 'phi' | 'admin' | 'security' | 'system';

export type ActionCode = string; // see Doc 04 §3 catalog

export interface AuditEventActor {
  kind: 'user' | 'system' | 'integration';
  userId?: UserId;
  integrationId?: string;
  onBehalfOf?: UserId;
}

export interface AuditEventTarget {
  kind: ResourceKind;
  id: string;
  parentId?: string;
}

export interface AuditEventContext {
  sessionId?: SessionId;
  requestId: RequestId;
  correlationId: CorrelationId;
  causationId?: EventId;
  ipAddress?: string;
  userAgent?: string;
  geo?: { country?: string; region?: string };
  phi: boolean;
  reasonCode?: string;
  reasonText?: string;
  riskFlags?: string[];
}

export interface AuditEventIntegrity {
  payloadHash: string;
  previousHash: string;
  chainHash: string;
  signature?: string;
}

export interface AuditEvent {
  id: EventId;
  sequence: number;
  timestamp: ISODateTime;
  actor: AuditEventActor;
  action: ActionCode;
  category: EventCategory;
  target: AuditEventTarget;
  before?: unknown;
  after?: unknown;
  diff?: unknown;
  context: AuditEventContext;
  integrity: AuditEventIntegrity;
}

// Pre-integrity event (what callers submit)
export type AuditEventInput = Omit<AuditEvent, 'id' | 'sequence' | 'timestamp' | 'integrity'>;

// ---------- Override ----------

export interface OverrideRequest {
  id: string;
  targetCeuId: CeuId;
  requestedByUserId: UserId;
  requestedAt: ISODateTime;
  reasonCode: string;
  reasonText: string;
  requiredApproverGroups: [GroupId, GroupId];
  approvals: OverrideApproval[];
  expiresAt: ISODateTime;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  appliedTo?: 'Completed' | 'Failed';
}

export interface OverrideApproval {
  approverUserId: UserId;
  approverGroupId: GroupId;
  ecignSignatureId: string;
  approvedAt: ISODateTime;
}
