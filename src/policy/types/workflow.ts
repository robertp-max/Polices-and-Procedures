/* ══════════════════════════════════════════════════════════════════════
   Workflow Library — canonical data model.

   This file is the authoritative TypeScript contract for every compiled
   workflow. The markdown compiler (scripts/compileWorkflows.ts) emits data
   that satisfies these types; Brad and the Workflow Library UI consume them.

   Invariants enforced by the compiler:
   - 13 sections present for every workflow (missing sections → hard error)
   - every formId listed in §7 resolves to formsCatalog.ts
   - every policyRef in §1 resolves to policyStore.ts
   - every regulatory anchor is preserved verbatim
   - authored step order is never reordered

   Do not edit generated data files by hand. Re-run the compiler instead.
   ══════════════════════════════════════════════════════════════════════ */

export type DomainCode =
  | 'GV' // Governance & Administration
  | 'CL' // Clinical Operations
  | 'QA' // QAPI
  | 'HR' // Human Resources
  | 'CO' // Compliance & Regulatory
  | 'FN' // Finance & Revenue Cycle
  | 'OP' // Operations & Facilities
  | 'EN' // Enterprise / Strategic
  | 'IT' // Information Technology
  | 'RM'; // Risk Management

export type CadenceKind =
  | 'time_based'   // fires on a schedule (annual, quarterly, etc.)
  | 'event_based'  // fires from a trigger (SOC, incident, change)
  | 'conditional'  // fires when a rule evaluates true
  | 'continuous';  // always-on operational workflow

export type CadenceInterval =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'biennial'
  | 'episodic'
  | 'per_event'
  | 'on_demand';

export type RiskBand = 'low' | 'moderate' | 'high' | 'immediate_jeopardy';

export type ApprovalBody =
  | 'governing_body'
  | 'administrator'
  | 'clinical_manager'
  | 'compliance_officer'
  | 'qapi_committee'
  | 'medical_director'
  | 'department_head'
  | 'supervisor'
  | 'self_attest';

/** One row from §6 STEP-BY-STEP EXECUTION. Authored order is preserved. */
export interface WorkflowStep {
  /** 1-indexed step number as authored. */
  order: number;
  /** Human-readable action. Preserved verbatim from source. */
  action: string;
  /** Authored role string (e.g. "Admitting RN; Clinical Mgr"). */
  role: string;
  /** Authored form string. Resolved formIds also captured separately. */
  formRaw: string;
  /** Form IDs extracted from `formRaw` and cross-validated at compile time. */
  formIds: string[];
  /** Authored deadline string (e.g. "At SOC", "Within 48 h", "Quarterly"). */
  deadline: string;
}

export interface WorkflowTrigger {
  kind: CadenceKind;
  /** Raw authored trigger line (preserved verbatim). */
  description: string;
}

export interface WorkflowRoles {
  /** Roles listed under "Primary" / "Primary owner". */
  primary: string[];
  /** Roles listed under "Supporting". */
  supporting: string[];
  /** Roles listed under "Approval" / "Approval authority". */
  approval: string[];
}

export interface WorkflowApproval {
  /** Named approver body (if identifiable). */
  body?: ApprovalBody;
  /** Raw authored line preserved verbatim. */
  description: string;
  /** True if Governing Body sign-off is required. */
  requiresGoverningBody: boolean;
}

export interface WorkflowCadence {
  kind: CadenceKind;
  interval: CadenceInterval;
  /** Optional specific day-of-year / anchor (e.g. "Q1 GB meeting"). */
  anchor?: string;
}

export interface WorkflowDependency {
  /** The workflow ID that must complete before this one. */
  upstreamId: string;
  /** Why (explains the dependency in plain English). */
  reason: string;
}

export interface WorkflowMetrics {
  /** Total step count (derived). */
  stepCount: number;
  /** Unique forms referenced across all steps + §7. */
  formCount: number;
  /** Unique policies referenced. */
  policyCount: number;
  /** Declared risk band (from §12 + heuristic). */
  declaredRisk: RiskBand;
  /** True if a Governing Body approval is listed in §8. */
  requiresGoverningBody: boolean;
}

/** A single fully-compiled workflow. */
export interface Workflow {
  /** Primary key e.g. "CL-WF-02". */
  id: string;
  domain: DomainCode;
  /** Authored title (post-em-dash). */
  title: string;
  /** Full source markdown body (for Brad retrieval and 1:1 playback). */
  sourceMarkdown: string;
  /** Relative source path for traceability. */
  sourcePath: string;

  /* ── The 13 authored sections ──────────────────────────────── */
  /** §1 POLICY REFERENCES — raw list lines. */
  policyReferences: string[];
  /** §1 resolved policy IDs (compile-time cross-checked). */
  policyRefs: string[];
  /** §1 regulatory anchors preserved verbatim. */
  regulatoryAnchors: string[];

  /** §2 PROCESS OVERVIEW (paragraph). */
  processOverview: string;

  /** §3 TRIGGER(S) structured + raw lines. */
  triggers: WorkflowTrigger[];

  /** §4 RESPONSIBLE ROLES. */
  roles: WorkflowRoles;

  /** §5 INPUTS — raw list lines. */
  inputs: string[];

  /** §6 STEP-BY-STEP EXECUTION in authored order. */
  steps: WorkflowStep[];

  /** §7 REQUIRED FORMS & DOCUMENTS — resolved unique form IDs. */
  requiredForms: string[];
  /** §7 raw source (preserved). */
  requiredFormsRaw: string;

  /** §8 APPROVALS. */
  approvals: WorkflowApproval[];
  /** §8 raw source (preserved). */
  approvalsRaw: string;

  /** §9 OUTPUTS. */
  outputs: string;

  /** §10 SLA / DEADLINES. */
  sla: string;

  /** §11 ESCALATION LOGIC. */
  escalationLogic: string;

  /** §12 FAILURE CONDITIONS. */
  failureConditions: string;

  /** §13 AUDIT REQUIREMENTS. */
  auditRequirements: string;

  /* ── Computed / indexed ─────────────────────────────────────── */
  cadence: WorkflowCadence;
  dependencies: WorkflowDependency[];
  metrics: WorkflowMetrics;

  /**
   * Execution classification — the operating layer this workflow
   * occupies inside CES. Determines whether it feeds QAPI, generates
   * evidence, or only reacts to failures. When omitted, callers should
   * treat it as `'operational'` (the safest default), but the
   * `verifyAlignment` script flags any workflow lacking an explicit
   * value so the gap is filled in source.
   *
   *   • audit       — evaluates compliance, produces findings, feeds QAPI.
   *   • operational — performs the work; produces evidence used by audits.
   *   • enforcement — reacts to failure (CAP, escalation, discipline).
   *   • intake      — captures incoming reports/requests (incident, FWA).
   *   • aggregate   — consumes audit outputs (QAPI, governing body review).
   */
  workflowType?: 'audit' | 'operational' | 'enforcement' | 'intake' | 'aggregate';
}

/** Compact card-shape used by the library grid. */
export interface WorkflowCardProjection {
  id: string;
  domain: DomainCode;
  title: string;
  processOverview: string;
  cadence: WorkflowCadence;
  triggerSummary: string;
  primaryRole: string;
  formCount: number;
  policyCount: number;
  declaredRisk: RiskBand;
  requiresGoverningBody: boolean;
}

/** Dense graph of cross-references for O(1) traversal at runtime. */
export interface WorkflowGraph {
  /** All workflow IDs. */
  workflowIds: string[];
  /** formId → workflow IDs that reference it. */
  byForm: Record<string, string[]>;
  /** policyId → workflow IDs. */
  byPolicy: Record<string, string[]>;
  /** regulatory anchor → workflow IDs. */
  byRegulation: Record<string, string[]>;
  /** role string → workflow IDs. */
  byRole: Record<string, string[]>;
  /** domain code → workflow IDs. */
  byDomain: Record<DomainCode, string[]>;
  /** upstreamId → downstream workflow IDs (adjacency list). */
  downstream: Record<string, string[]>;
  /** KPI aggregates computed at build time. */
  kpis: {
    total: number;
    byDomain: Record<DomainCode, number>;
    byCadence: Record<CadenceKind, number>;
    requiresGoverningBody: number;
    highRisk: number;
  };
}

/** Projection that feeds the autogen `templateRegistry.ts`. */
export interface WorkflowTemplate {
  workflowId: string;
  templateKey: string;
  cadence: WorkflowCadence;
  /** Which approvals must be attached to the generated RegulatoryEvent. */
  approvals: WorkflowApproval[];
  /** Form IDs projected as `requiredForms` on the RegulatoryEvent. */
  requiredForms: string[];
  /** Step count (for progress indicator baselines). */
  stepCount: number;
  /** Declared risk — seeds the risk scorer `declared` dimension. */
  declaredRisk: RiskBand;
  /** Regulatory anchors — copied to the RegulatoryEvent for surveyor view. */
  regulatoryAnchors: string[];
}

/** Runtime identifier for one materialized workflow execution. */
export interface WorkflowInstanceRef {
  workflowId: string;
  /** Stable ID of the materialized instance (RegulatoryEvent.id). */
  instanceId: string;
  /** Current step order (1-indexed). 0 = not started. */
  currentStep: number;
}
