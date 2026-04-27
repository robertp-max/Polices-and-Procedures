/**
 * PM canonical types — eCIgn-centered submission model.
 *
 * This file is the single home for the PM-layer Task type and supporting
 * eCIgn shapes used by views (Event, My Tasks, Kanban, Gantt, Sprint).
 *
 * It is ADDITIVE to the existing CES + eCIgn engines; it never duplicates
 * compliance state. See:
 *   - Builder/eCIgn-Centered-Submission/05-eCIgn-Form-Status-Model.md
 *   - Builder/eCIgn-Centered-Submission/12-eCIgn-Integration-with-PM-Tasks.md
 *   - Builder/Compliance-Execution-Sprints/PM-Panel-Synchronization.md
 */

export type TaskSource = 'ces' | 'personal';

/** eCIgn internal state machine values (mirrors server/ecign/stateMachine.ts). */
export type EcignInternal =
  | 'none'
  | 'created'
  | 'disclosed'
  | 'verified'
  | 'reviewed'
  | 'attested'
  | 'signed_locked'
  | 'voided'
  | 'expired';

/** UX-friendly packet status surfaced in the Right Panel. */
export type EcignPacketStatus =
  | 'not_started'
  | 'draft'
  | 'submitted'
  | 'awaiting_signature'
  | 'awaiting_approval'
  | 'returned_for_correction'
  | 'rejected'
  | 'completed'
  | 'archived';

/** Per-signer status. */
export type SignerStatus =
  | 'not_invited'
  | 'invited'
  | 'pending'
  | 'signed'
  | 'countersigned'
  | 'declined'
  | 'revoked';

/** PM task status used by all PM views. */
export type PmTaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done';

export interface EcignPacketSigner {
  signer_id: string;
  display_name: string;
  role: string;
  status: SignerStatus;
  invited_at?: string;
  signed_at?: string;
  decline_reason?: string;
  mfa_verified: boolean;
}

export interface EcignPacketApproval {
  approval_id: string;
  approver_id: string;
  decision?: 'approved' | 'returned' | 'rejected';
  decision_at?: string;
  reason?: string;
}

export interface EcignEvidence {
  evidence_id: string;
  s3_bucket?: string;
  s3_key?: string;
  sha256?: string;
  status: 'pending' | 'generated' | 'stored' | 'linked' | 'validated' | 'archived';
  created_at: string;
}

export interface EcignAuditEntry {
  audit_id: string;
  ts: string;
  actor_user_id: string;
  action: string;
  subject_id: string;
}

export interface PmAuditEntry {
  id: string;
  actor_user_id: string;
  task_id: string;
  action: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ts: string;
}

export interface EcignPacket {
  packet_id: string;
  form_id: string;
  internal: EcignInternal;
  packet_status: EcignPacketStatus;
  signers: EcignPacketSigner[];
  approvals: EcignPacketApproval[];
  evidence?: EcignEvidence;
  recent_audit_refs: string[];
}

/**
 * Snapshot used by the status mapper to derive packet/CES/PM statuses.
 * All inputs are derived from CES + eCIgn — never from PM overlay.
 */
export interface PacketSnapshot {
  internal: EcignInternal;
  requiredSignersCount: number;
  signedCount: number;
  approvalRequired: boolean;
  approvalDecision?: 'approved' | 'returned' | 'rejected';
  hasValidatedEvidence: boolean;
}

/** A canonical task projected by the PM projector. */
export interface EcignSubmissionTask {
  task_id: string;             // "{event.id}-{NN}" — STABLE
  source: 'ces';
  event_id: string;
  workflow_id: string;
  policy_id?: string;
  /** Originating processFlow step.id (e.g. "s2", "qapi-gov-minutes") when
   *  this task projects from an execution step. Absent only for orphan
   *  form tasks (a requiredForm not consumed by any step). */
  step_id?: string;
  /** Primary form id (first attached). Kept for backward compat. */
  form_id: string;
  /** All form ids attached to this execution step. */
  form_ids?: string[];
  ecign_packet_id?: string;
  /** Primary packet (matches `form_id`). */
  packet?: EcignPacket;
  /** All packets for `form_ids` in declaration order. */
  packets?: EcignPacket[];
  title: string;
  description?: string;
  status: PmTaskStatus;
  packet_status: EcignPacketStatus;
  assigned_user_id?: string;
  required_signers: EcignPacketSigner[];
  approvers: { user_id: string; display_name: string }[];
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  dependencies: string[];
  evidence_id?: string;
  audit_log_refs: string[];
  blocker_reason?:
    | 'returned'
    | 'rejected'
    | 'dependency'
    | 'missing_signer'
    | 'expired';
  weekend_override?: boolean;
}

export interface NonFormCesTask {
  task_id: string;             // "{event.id}-{NN}"
  source: 'ces';
  event_id: string;
  workflow_id: string;
  policy_id?: string;
  step_id: string;             // step-only task, no form
  title: string;
  description?: string;
  status: PmTaskStatus;
  assigned_user_id?: string;
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  dependencies: string[];
  weekend_override?: boolean;
}

export interface PersonalTask {
  task_id: string;             // "personal:{uuid}"
  source: 'personal';
  owner_user_id: string;
  title: string;
  description?: string;
  status: PmTaskStatus;
  due_date?: string;
  sprint_id?: string;
  story_points?: number;
  dependencies: string[];
  is_weekend_ok?: boolean;
  linked_event_id?: string;
}

export type Task = EcignSubmissionTask | NonFormCesTask | PersonalTask;

export const isEcignSubmissionTask = (t: Task): t is EcignSubmissionTask =>
  t.source === 'ces' && 'form_id' in t && Boolean((t as EcignSubmissionTask).form_id);

export const isPersonalTask = (t: Task): t is PersonalTask => t.source === 'personal';

export const isCesTask = (t: Task): t is EcignSubmissionTask | NonFormCesTask =>
  t.source === 'ces';
