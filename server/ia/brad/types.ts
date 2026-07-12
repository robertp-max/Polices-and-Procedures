/* ═══════════════════════════════════════════════════════════════════════════
   Brad guarded-action layer — shared contract (single source of truth).
   ----------------------------------------------------------------------------
   This layer sits INSIDE Brad's existing guarded action system. It is NOT a
   separate Super Admin agent/model/harness — Super Admin is an authorization +
   approval layer over Brad's append-only generated objects.

   Invariants encoded here:
   • Brad may only CREATE append-only `BradGenerated*` objects (never mutate
     canonical/core objects).
   • Every generated object carries full provenance metadata + an
     `immutable_audit_hash` computed over its content + provenance.
   • Protected/cloud-changing actions require an approved Super Admin.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { BradRuntimeMode, BradProvider } from '../harness/types.js';

/* ─── Generated object types (append-only) ──────────────────────────────────*/

export type BradObjectType =
  | 'BradGeneratedReport'
  | 'BradGeneratedEventPacket'
  | 'BradGeneratedMeetingMinutes'
  | 'BradGeneratedQapiMinutes'
  | 'BradGeneratedActionPlan'
  | 'BradGeneratedEvidenceChecklist'
  | 'BradGeneratedCloudChangeSet'
  | 'BradGeneratedAuditNote'
  | 'BradGeneratedTaskRecommendation'
  | 'BradGeneratedChangeSet'
  // ── Builder Beta (Super Admin only) generated objects ────────────────────
  | 'BradGeneratedPermissionDraft'
  | 'BradGeneratedRoleDraft'
  | 'BradGeneratedUserImportDraft'
  | 'BradGeneratedReportTemplate'
  | 'BradGeneratedComponentSpec'
  | 'BradGeneratedOtpRecord';

/** Lifecycle of a Brad-created object. Append-only objects are `committed` at
    creation; packet patch changes start `proposed`, then move through approval
    and application. */
export type WriteStatus =
  | 'committed'          // append-only object persisted; immutable
  | 'proposed'           // proposed change; no effect applied
  | 'pending-approval'   // requires Super Admin approval before any effect
  | 'approved'           // Super Admin approved; effect may be attempted
  | 'denied'             // Super Admin denied; no effect
  | 'applied'            // approved change set was applied + verified
  | 'blocked';           // refused by policy/allowlist; no effect

/** Required provenance metadata on EVERY Brad-created object. */
export interface BradObjectMetadata {
  object_id: string;
  object_type: BradObjectType;
  created_by: 'brad';
  requested_by_user_id: string;
  approved_by_super_admin_id?: string;
  source_event_id?: string;
  source_workflow_id?: string;
  source_policy_ids: string[];
  source_form_ids: string[];
  generated_at: string;            // ISO timestamp
  runtime_mode: BradRuntimeMode;
  model_provider: BradProvider;
  model_id: string;
  harness_version: string;
  prompt_version: string;
  source_snapshot_hash: string;    // hash of the source-of-truth snapshot Brad read
  write_status: WriteStatus;
  immutable_audit_hash: string;    // sha256 over metadata(excl. this) + content
}

/** A persisted Brad object = provenance metadata + opaque content payload. */
export interface BradGeneratedObject<T = unknown> {
  metadata: BradObjectMetadata;
  content: T;
}

/* ─── Super Admin authorization ─────────────────────────────────────────────*/

/** Discrete approvable capabilities. Stored in config so they can be reviewed. */
export type SuperAdminPermission =
  | 'approve.event_packet'
  | 'approve.meeting_packet'
  | 'approve.qapi_minutes'
  | 'approve.qapi_packet'
  | 'approve.brad_object'
  | 'approve.report.non_cloud'
  | 'approve.report.executive'
  | 'approve.evidence_checklist'
  | 'approve.cloud_change.low_risk'
  | 'approve.cloud_change.deploy'
  | 'approve.test_data_cleanup';

export interface SuperAdminConfigEntry {
  /** Stable app auth user id (req.actor.user_id). Authoritative match key. */
  userId: string;
  /** Stable emails (any may match). Secondary match key. */
  emails: string[];
  displayName: string;
  /** True only if this entry was bound to a verified stable id (not a guess). */
  stableIdVerified: boolean;
  permissions: SuperAdminPermission[];
  notes?: string;
}

export interface SuperAdminIdentity {
  isSuperAdmin: boolean;
  userId?: string;
  displayName?: string;
  permissions: SuperAdminPermission[];
  /** Why verification failed (for fail-closed audit), when isSuperAdmin=false. */
  reason?: string;
}

/* ─── Approval workflow ──────────────────────────────────────────────────────*/

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ApprovalRequest {
  approvalId: string;
  objectId: string;
  objectType: BradObjectType;
  requiredPermission: SuperAdminPermission;
  requestedByUserId: string;
  sourceEventId?: string;
  protectedCoreRefs: string[];   // ids of any protected-core objects referenced
  riskLevel: RiskLevel;
  /** Append-only metadata preview OR before/after diff, for the approval UI. */
  preview: ApprovalPreview;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface ApprovalPreview {
  kind: 'append-only-metadata' | 'before-after-diff' | 'create-only';
  /** For append-only metadata updates: the fields + new values being appended. */
  appendedFields?: Record<string, unknown>;
  /** For before/after diffs (change sets). */
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  summary: string;
}

export interface ApprovalDecision {
  approvalId: string;
  objectId: string;
  decision: 'approved' | 'denied';
  decidedByUserId: string;
  decidedByDisplayName: string;
  reason?: string;
  decidedAt: string;
}

/* ─── Event append-only metadata ─────────────────────────────────────────────*/

/** The ONLY event fields Brad may append/update without a Super Admin changeset. */
export const ALLOWED_EVENT_METADATA_FIELDS = [
  'generated_packet_object_id',
  'generated_minutes_object_id',
  'brad_last_action_at',
  'brad_last_action_type',
  'brad_action_report_id',
  'packet_generation_status',
  'minutes_generation_status',
  'pending_review',
  'pending_signature',
  'audit_note',
] as const;

export type AllowedEventMetadataField = (typeof ALLOWED_EVENT_METADATA_FIELDS)[number];

export type EventMetadataPatch = Partial<Record<AllowedEventMetadataField, unknown>>;

export interface EventMetadataUpdateResult {
  ok: boolean;
  eventId: string;
  appliedFields: AllowedEventMetadataField[];
  rejectedFields: string[];     // anything outside the allowlist
  requiresChangeSet: boolean;   // true when a rejected field needs a changeset
  reason?: string;
}

/* ─── Cloud change sets ──────────────────────────────────────────────────────*/

export type CloudChangeType =
  | 'cloudrun.env.update'            // by Secret Manager reference only
  | 'cloudrun.scaling.update'        // min/max instances
  | 'cloudrun.secret.attach'
  | 'cloudrun.service_account.update'
  | 'gcp.api.enable'
  | 'deploy.labels.update'
  | 'secretmanager.brad_entry.upsert'
  | 'artifactregistry.brad_metadata.upsert';

export interface CloudChangeOp {
  type: CloudChangeType;
  resource: string;                 // e.g. service name, secret name
  /** Human-readable description of the proposed change (no secret VALUES). */
  description: string;
  /** Secret Manager references only — never inline secret values. */
  secretRefs?: string[];
  params?: Record<string, string | number>;
}

export interface CloudChangeSetPlan {
  ops: CloudChangeOp[];
  /** Validation outcome from the allowlist check. */
  allowlistValid: boolean;
  disallowedReasons: string[];      // populated when allowlistValid=false
  dryRunSummary: string[];          // per-op dry-run lines; NEVER mutates cloud
  riskLevel: RiskLevel;
}

export interface CloudApplyResult {
  applied: boolean;
  reason: string;
  verified: boolean;
  appliedOps: number;
}
