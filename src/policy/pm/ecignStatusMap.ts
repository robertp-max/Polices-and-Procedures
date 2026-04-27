/**
 * eCIgn ↔ CES ↔ PM status mapper.
 *
 * SINGLE SOURCE OF TRUTH for status derivation.
 * Do NOT compute statuses anywhere else. See:
 *   Builder/eCIgn-Centered-Submission/05-eCIgn-Form-Status-Model.md
 */

import type {
  EcignInternal,
  EcignPacketStatus,
  PacketSnapshot,
  PmTaskStatus,
} from './types';

export type CesFormStatus = 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';

/** Derive the UX-friendly packet status from a snapshot. */
export function deriveEcignPacketStatus(s: PacketSnapshot): EcignPacketStatus {
  switch (s.internal) {
    case 'none':
      return 'not_started';
    case 'created':
      return 'draft';
    case 'disclosed':
    case 'verified':
    case 'reviewed':
      return 'submitted';
    case 'attested':
      return s.signedCount < s.requiredSignersCount ? 'awaiting_signature' : 'submitted';
    case 'signed_locked': {
      if (!s.approvalRequired) {
        return s.hasValidatedEvidence ? 'completed' : 'awaiting_approval';
      }
      switch (s.approvalDecision) {
        case 'approved':
          return s.hasValidatedEvidence ? 'completed' : 'awaiting_approval';
        case 'returned':
          return 'returned_for_correction';
        case 'rejected':
          return 'rejected';
        default:
          return 'awaiting_approval';
      }
    }
    case 'voided':
      return 'archived';
    case 'expired':
      return 'archived';
    default:
      return 'not_started';
  }
}

/** Derive the CES form status from a snapshot. */
export function deriveCesFormStatus(s: PacketSnapshot): CesFormStatus {
  const ux = deriveEcignPacketStatus(s);
  switch (ux) {
    case 'not_started':
      return 'missing';
    case 'draft':
      return 'pending';
    case 'submitted':
    case 'awaiting_signature':
      return 'in-progress';
    case 'awaiting_approval':
      return 'requires-review';
    case 'returned_for_correction':
    case 'rejected':
      return 'in-progress';
    case 'completed':
      return 'complete';
    case 'archived':
      return s.internal === 'expired' ? 'missing' : 'pending';
    default:
      return 'missing';
  }
}

/**
 * Derive the PM task status from a snapshot.
 * `blockedExternal` = true when an upstream dependency is blocked.
 */
export function derivePmTaskStatus(s: PacketSnapshot, blockedExternal = false): PmTaskStatus {
  if (blockedExternal) return 'blocked';
  const ux = deriveEcignPacketStatus(s);
  switch (ux) {
    case 'not_started':
      return 'todo';
    case 'draft':
      return 'todo';
    case 'submitted':
    case 'awaiting_signature':
      return 'in_progress';
    case 'awaiting_approval':
      return 'in_review';
    case 'returned_for_correction':
    case 'rejected':
      return 'blocked';
    case 'completed':
      return 'done';
    case 'archived':
      return s.internal === 'expired' ? 'blocked' : 'done';
    default:
      return 'todo';
  }
}

/** Convenience: human label for a PM task status (used by UI chips). */
export const PM_TASK_STATUS_LABEL: Record<PmTaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  blocked: 'Blocked',
  done: 'Done',
};

/** Convenience: human label for a packet status (used by UI chips). */
export const ECIGN_PACKET_STATUS_LABEL: Record<EcignPacketStatus, string> = {
  not_started: 'Not started',
  draft: 'Draft',
  submitted: 'Submitted',
  awaiting_signature: 'Awaiting signature',
  awaiting_approval: 'Awaiting approval',
  returned_for_correction: 'Returned for correction',
  rejected: 'Rejected',
  completed: 'Completed',
  archived: 'Archived',
};

/** Map a CES FormStatus + signed_locked? approximation back to a PacketSnapshot.internal. */
export function inferEcignInternalFromCesFormStatus(
  cesStatus: CesFormStatus,
  hasInstance: boolean,
): EcignInternal {
  if (!hasInstance) return 'none';
  switch (cesStatus) {
    case 'missing':
      return 'none';
    case 'pending':
      return 'created';
    case 'in-progress':
      return 'disclosed';
    case 'requires-review':
      return 'signed_locked';
    case 'complete':
      return 'signed_locked';
    default:
      return 'none';
  }
}
