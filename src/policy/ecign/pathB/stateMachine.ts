/**
 * eCIgn Path B — Phase 1 contract: multi-signer state machine (states, failure
 * reason codes, allowed transitions). DATA + PURE PREDICATES ONLY — no runtime
 * orchestration. Mirrors the approved plan's §8 state machine.
 */

export type ArtifactState =
  | 'draft'
  | 'prepared_for_signature'
  | 'signed_by_tier_1'
  | 'signed_by_tier_2'
  | 'signed_by_tier_3'
  | 'signed_by_tier_4'
  | 'final_validated_by_tier_5'
  | 'locked'
  | 'failed_drive_publish'
  | 'failed_metadata_attach'
  | 'recovery_required';

/** Structured failure/denial reason codes (no free text, no PHI). */
export type StateFailureReason =
  | 'drive_publish_failed'
  | 'metadata_attach_failed'
  | 'hash_mismatch'
  | 'role_mismatch'
  | 'duplicate_signer'
  | 'stale_instance'
  | 'stale_chain_tip'
  | 'tier_skipped'
  | 'self_approval_forbidden'
  | 'missing_canonical_bytes'
  | 'drive_permission_denied'
  | 'evidence_link_missing'
  | 'parity_mismatch';

/**
 * Allowed forward transitions. `locked` is TERMINAL (no forward transitions) —
 * disposition is a separate append-only record, not a state transition.
 * Required-tier skipping is enforced separately by tier-progression validation
 * against the hierarchy snapshot (this map only encodes structural adjacency).
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<ArtifactState, readonly ArtifactState[]>> = {
  draft: ['prepared_for_signature'],
  prepared_for_signature: ['signed_by_tier_1', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  signed_by_tier_1: ['signed_by_tier_2', 'final_validated_by_tier_5', 'locked', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  signed_by_tier_2: ['signed_by_tier_3', 'final_validated_by_tier_5', 'locked', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  signed_by_tier_3: ['signed_by_tier_4', 'final_validated_by_tier_5', 'locked', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  signed_by_tier_4: ['final_validated_by_tier_5', 'locked', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  final_validated_by_tier_5: ['locked', 'failed_drive_publish', 'failed_metadata_attach', 'recovery_required'],
  locked: [], // terminal
  failed_drive_publish: ['recovery_required', 'signed_by_tier_1', 'signed_by_tier_2', 'signed_by_tier_3', 'signed_by_tier_4', 'final_validated_by_tier_5'],
  failed_metadata_attach: ['recovery_required', 'signed_by_tier_1', 'signed_by_tier_2', 'signed_by_tier_3', 'signed_by_tier_4', 'final_validated_by_tier_5'],
  recovery_required: ['signed_by_tier_1', 'signed_by_tier_2', 'signed_by_tier_3', 'signed_by_tier_4', 'final_validated_by_tier_5', 'prepared_for_signature'],
};

export function isAllowedTransition(from: ArtifactState, to: ArtifactState): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** `locked` is terminal: no forward state transition is permitted from it. */
export function isTerminalState(state: ArtifactState): boolean {
  return state === 'locked' && ALLOWED_TRANSITIONS.locked.length === 0;
}
