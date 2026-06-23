/* ═══════════════════════════════════════════════════════════════
   CES — Compliance Execution Sprint System
   Type definitions
   ═══════════════════════════════════════════════════════════════ */

export type WorkflowPhase =
  | 'preparation'
  | 'documentation'
  | 'review'
  | 'signature'
  | 'audit';

// Design cross-ref (Agent 20 / Agent 22 background + Agent 09 read-only hygiene/validate gap vs design subagent): CES types/contracts align to V6_DESIGN.html ~1308 (CES views, states like ComplianceState, EvidenceStatus ~113, Obligation ~173, etc.; pure contracts, evidence validate/accept/lock, no PHI in read-only).
// Agent 09 gap analysis: validation/hygiene strong in projection but gaps in view-level invariants vs design emphasis on purity and data validation lifecycles across CES surfaces. Proposals (from prior + this): expand contracts as noted by Agent 22. See cesMasterControlAudit, V6_DESIGN_RECONCILIATION.

export const WORKFLOW_PHASE_ORDER: readonly WorkflowPhase[] = [
  'preparation',
  'documentation',
  'review',
  'signature',
  'audit',
] as const;

export const WORKFLOW_PHASE_LABEL: Record<WorkflowPhase, string> = {
  preparation:   'Preparation',
  documentation: 'Documentation',
  review:        'Review',
  signature:     'Signature',
  audit:         'Audit',
};

export type ComplianceState =
  | 'upcoming'
  | 'ready'
  | 'in_progress'
  | 'awaiting_signature'
  | 'blocked'
  | 'completed';

export const COMPLIANCE_STATE_ORDER: readonly ComplianceState[] = [
  'upcoming',
  'ready',
  'in_progress',
  'awaiting_signature',
  'blocked',
  'completed',
] as const;

export const COMPLIANCE_STATE_LABEL: Record<ComplianceState, string> = {
  upcoming:           'Upcoming',
  ready:              'Ready',
  in_progress:        'In Progress',
  awaiting_signature: 'Awaiting Signature',
  blocked:            'Blocked',
  completed:          'Completed',
};

export type AuditReadiness = 'not_ready' | 'partial' | 'ready';

export const AUDIT_READINESS_LABEL: Record<AuditReadiness, string> = {
  not_ready: 'Not Ready',
  partial:   'Partial',
  ready:     'Ready',
};

export type ComplianceDomain = 'clinical' | 'compliance' | 'hr' | 'governance';

export const COMPLIANCE_DOMAIN_LABEL: Record<ComplianceDomain, string> = {
  clinical:   'Clinical',
  compliance: 'Compliance',
  hr:         'HR',
  governance: 'Governance',
};

export type DomainRiskLevel = 'green' | 'yellow' | 'red';

export interface DomainRisk {
  domain: ComplianceDomain;
  level:  DomainRiskLevel;
  /** Open execution units in this domain. */
  openUnits: number;
  /** Blocked count contributing to risk. */
  blockedCount: number;
  /** Short narrative reason. */
  reason: string;
}

export type SignerStatus = 'signed' | 'pending' | 'overdue';

export interface RequiredSigner {
  userId:        string;
  name:          string;
  initials:      string;
  role:          string;
  status:        SignerStatus;
  /** ISO timestamp of signature, when status === 'signed'. */
  signedAt?:     string;
  /** Hours remaining until escalation; negative when overdue. */
  hoursToEscalation?: number;
}

export type BlockedReasonKind =
  | 'missing_signature'
  | 'missing_form'
  | 'dependency_incomplete'
  | 'awaiting_external_input';

export interface BlockedReason {
  kind:    BlockedReasonKind;
  /** Short, surveyor-grade label. */
  label:   string;
  /** Optional resource id (formId, userId, eventId). */
  resourceId?: string;
}

export interface EvidenceStatus {
  requiredFormsTotal:    number;
  requiredFormsComplete: number;
  /** Form IDs still missing. */
  missingFormIds:        string[];
  signaturesRequired:    number;
  signaturesComplete:    number;
  /** True when audit index entry has been generated. */
  auditIndexCreated:     boolean;
}

export interface Owner {
  userId:   string;
  name:     string;
  initials: string;
  role:     string;
}

export type EventCategory =
  | 'mandated'
  | 'multi_year_governance'
  | 'triennial_governance'
  | 'recurring'
  | 'trigger_based'
  | 'retrospective';

export interface ComplianceEvent {
  id:          string;
  title:       string;
  category:    EventCategory;
  /** Domain this event primarily belongs to. */
  domain:      ComplianceDomain;
  /** ISO date the event anchors to. */
  anchorDate:  string;
}

export interface Workflow {
  id:        string;
  eventId:   string;
  title:     string;
  /** Forms required to satisfy this workflow. */
  requiredFormIds: string[];
  /**
   * Execution classification (mirror of
   * `src/policy/types/workflow.ts#Workflow.workflowType`). Optional
   * because legacy CES projections may not carry it; the alignment
   * verifier flags missing values.
   */
  workflowType?: 'audit' | 'operational' | 'enforcement' | 'intake' | 'aggregate';
}

/* ─── Obligation discriminator (canonical CES model) ─────────
   The system has TWO logical layers built on a single store:
     • SPRINT_TASK — mandated/recurring compliance event (calendar
                     + sprint board container).
     • TASK        — execution step that completes a SPRINT_TASK
                     (right panel + My Tasks).
   Legacy code referenced these as `ExecutionUnit` / `CEU`; both
   names are now type-aliased to `Obligation`. See bottom of file. */

export type ObligationKind = 'SPRINT_TASK' | 'TASK';

export const OBLIGATION_KIND_LABEL: Record<ObligationKind, string> = {
  SPRINT_TASK: 'Sprint Task',
  TASK:        'Task',
};

/** CEU/obligation provenance — extends earlier `CeuSourceSystem`. */
export type ObligationSourceType =
  | 'ONBOARDING'
  | 'REGULATORY_EVENT'
  | 'WORKFLOW'
  | 'POLICY_LIFECYCLE'
  | 'COMMITTEE'
  | 'SECURITY'
  | 'AUDIT'
  | 'ECIGN';

/** Extended ownership metadata for role/committee/group filtering.
    All fields optional for backward compatibility with legacy units. */
export interface ObligationOwnership {
  primaryOwnerUserId?:    string;
  secondaryOwnerUserId?:  string;
  assignedUserIds?:       readonly string[];
  assignedRoleIds?:       readonly string[];
  assignedGroupIds?:      readonly string[];
  committeeOwnerId?:      string;
  subgroupOwnerId?:       string;
  escalationPath?:        readonly string[];
  visibilityScope?:       'self' | 'role' | 'committee' | 'department' | 'org' | 'governing_body';
  needsReview?:           boolean;
}

export interface ExecutionUnit {
  id:               string;
  title:            string;
  parentEventId:    string;
  workflowId:       string;
  workflowPhase:    WorkflowPhase;
  complianceState:  ComplianceState;
  auditReadiness:   AuditReadiness;
  owner:            Owner;
  approver:         Owner;
  signatureOwner:   Owner;
  requiredSigners:  RequiredSigner[];
  blockedReason?:   BlockedReason;
  /** ISO date due. */
  dueDate:          string;
  /** Hours to escalation; negative when overdue. */
  escalationTimer?: number;
  evidenceStatus:   EvidenceStatus;
  domain:           ComplianceDomain;

  /* ─── Obligation extensions (optional for back-compat) ─── */
  /** Discriminator. Missing = treat as 'SPRINT_TASK' for legacy data.
      Named `obligationKind` (not `kind`) to avoid collision with the
      onboarding engine's pre-existing `kind: OnboardingUnitKind`. */
  obligationKind?:        ObligationKind;
  /** When obligationKind === 'TASK', the parent SPRINT_TASK obligation id.
      Falls back to `parentEventId` when absent. */
  parentObligationId?:    string;
  /** Source classification (REGULATORY_EVENT, ONBOARDING, …). */
  sourceType?:            ObligationSourceType;
  /** Source artifact references for audit trail. */
  sourcePolicyIds?:       readonly string[];
  sourceWorkflowIds?:     readonly string[];
  sourceFormIds?:         readonly string[];
  /** Extended ownership for role/committee filtering. */
  ownership?:             ObligationOwnership;
  /** Sprint window membership (when assigned). */
  sprintId?:              string;

  /* ─── CES Canonical Role Assignment ──────────────────────
     All CES tasks must have these fields populated.
     assignedRole defaults to 'DON' for any ambiguous task.   */
  /** Authorized CES role responsible for executing this obligation. */
  assignedRole?:      string;
  /** Ultimately accountable CES role. */
  accountableRole?:   string;
  /** Role responsible for reviewing quality/completeness. */
  reviewerRole?:      string;
  /** Role authorized to approve / certify completion. */
  approverRole?:      string;
  /** Roles that may mark this obligation complete. */
  canCompleteRoles?:  readonly string[];
  /** Roles that may review this obligation. */
  canReviewRoles?:    readonly string[];
  /** Roles that may approve / certify this obligation. */
  canApproveRoles?:   readonly string[];
  /** Role that receives escalation when this obligation is overdue. */
  escalationRole?:    string;

  /* ─── Signer task fields ──────────────────────────────────
     Populated on signer task obligations (isSignerTask = true). */
  isSignerTask?:       boolean;
  signerRole?:         string;
  parentFormTaskId?:   string;
  blocksOnSignerTasks?: boolean;
}

export interface Sprint {
  id:        string;
  number:    number;
  /** ISO date of sprint start. */
  startDate: string;
  /** ISO date of sprint end (inclusive). */
  endDate:   string;
  label:     string;
}

export interface OwnerAssignment {
  owner:                Owner;
  allocatedUnitCount:   number;
  overdueUnitCount:     number;
  pendingSignatureCount: number;
  capacityRisk:         DomainRiskLevel;
}

export interface SprintMetrics {
  completionRatePct:        number;
  auditReadinessScore:      number;   // 0–100
  activeBlockerCount:       number;
  signatureSlasMissed:      number;
  upcomingDeadlines48hCount: number;
}

export interface SprintTrendPoint {
  sprintNumber:           number;
  completionRatePct:      number;
  onTimeRatePct:          number;
  blockedResolutionHours: number;
  auditReadinessScore:    number;
  signatureSlaPct:        number;
  carryOverCount:         number;
}

/* ═══════════════════════════════════════════════════════════════
   Canonical aliases — `Obligation` is the unified CES model.
   `ExecutionUnit` and `CEU` remain as deprecated aliases so legacy
   imports continue to compile during migration.
   TODO: remove `ExecutionUnit` / `CEU` aliases after full migration.
   ═══════════════════════════════════════════════════════════════ */

/** Canonical unified compliance/execution obligation. */
export type Obligation = ExecutionUnit;

/** @deprecated Use `Obligation`. Retained for backward compatibility. */
export type CEU = Obligation;
