/**
 * Global ExecutionUnit (CEU) types
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the canonical CEU envelope from
 * `Builder/Enterprise/02-Global-Execution-Unit-Model.md` §3.
 *
 * The existing onboarding `OnboardingExecutionUnit` is treated as a CEU with
 * `domain="onboarding"` via the registry adapters; nothing in onboarding code
 * needs to change.
 */

export type CeuDomain =
  | 'onboarding'
  | 'qapi'
  | 'policy'
  | 'incident'
  | 'training'
  | 'vendor'
  | 'governance'
  | 'it_security'
  | 'clinical'
  | 'audit'
  | 'compliance';

export type CeuLifecycleState =
  | 'pending'
  | 'in_progress'
  | 'awaiting_evidence'
  | 'awaiting_review'
  | 'awaiting_approval'
  | 'completed'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export interface CeuPersona {
  user_id: string;
  role: string;
  display_name?: string;
}

export interface CeuRequirement {
  kind: 'evidence' | 'signature' | 'attestation' | 'training' | 'review';
  id: string;
  satisfied: boolean;
  satisfied_by?: string;
  satisfied_at_utc?: string;
}

export interface CeuPolicyAnchor {
  policy_id: string;
  policy_version: number;
  citation?: string;
}

export interface ExecutionUnit {
  ceu_id: string;
  ceu_type: string; // e.g., 'orientation_completion', 'incident_root_cause_analysis'
  domain: CeuDomain;
  state: CeuLifecycleState;

  batch_id?: string;
  template_id?: string;

  subject_user_id?: string;
  responsible_persona?: CeuPersona;
  delegated_personas?: CeuPersona[];

  requirements: CeuRequirement[];
  blocking_ceu_ids: string[];

  policy_anchors: CeuPolicyAnchor[];

  created_at_utc: string;
  updated_at_utc: string;
  due_at_utc?: string;
  completed_at_utc?: string;

  /** Domain-specific fields. Must be JSON-serializable; no PHI. */
  domain_extension: Record<string, unknown>;
}

export interface ExecutionBatch {
  batch_id: string;
  template_id?: string;
  domain: CeuDomain;
  state: CeuLifecycleState;
  ceu_ids: string[];
  subject_user_id?: string;
  created_at_utc: string;
  updated_at_utc: string;
  policy_anchors: CeuPolicyAnchor[];
  domain_extension: Record<string, unknown>;
}

/* ───────────────────────────────────────────────────────────────
   Canonical aliases — server-side. The unified system model is
   `Obligation`; legacy `ExecutionUnit` / `CEU` names retained for
   backward compatibility while migration completes.
   TODO: remove `ExecutionUnit` alias after full migration.
   ─────────────────────────────────────────────────────────────── */

/** Canonical server-side Obligation (was `ExecutionUnit` / CEU). */
export type Obligation = ExecutionUnit;

/** @deprecated Use `Obligation`. */
export type CEU = Obligation;

export interface ExecutionTemplate {
  template_id: string;
  domain: CeuDomain;
  version: number;
  ceu_definitions: Array<{
    ceu_type: string;
    requires: Array<{ kind: CeuRequirement['kind']; id: string }>;
    blocking_on?: string[]; // CEU types in same template that must complete first
  }>;
  policy_anchors: CeuPolicyAnchor[];
}
