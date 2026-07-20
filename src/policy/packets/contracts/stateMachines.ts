/**
 * Packet platform state machines — §17.1–§17.4.
 * DATA + PURE PREDICATES ONLY. Mirrors ecign/pathB/stateMachine.ts style.
 */

import type { PacketLifecycleStatus } from './packetInstance';
import type { TriggerLifecycleStatus } from './triggers';
import type { SupplementalLifecycleStatus } from './supplemental';
import type { SignatureLifecycleStatus } from './envelope';

/* ══════════════════════════════════════════════════════════════════════
   §17.1 Packet lifecycle
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Allowed packet lifecycle transitions — re-derived from PRD §17.1.
 *
 * Main path is a strict linear chain (no shortcuts that skip intermediates):
 * SOURCE_COLLECTION → DRAFT_GENERATED → UNDER_ANALYSIS → READY_FOR_REVIEW →
 * UNDER_REVIEW → EDITING → VALIDATION_REQUIRED → READY_FOR_APPROVAL →
 * APPROVED_FOR_SIGNATURE → SIGNER_CONFIRMATION → ECIGN_PREPARING →
 * SENT_FOR_SIGNATURE → PARTIALLY_SIGNED → FULLY_SIGNED →
 * SIGNED_PACKAGE_BUILDING → CERTIFICATION_REVIEW → CERTIFIED →
 * DRIVE_PUBLISHING → PUBLISHED → LOCKED
 *
 * Justified non-linear edges (each cited on the transition entry):
 * - EDITING ↔ VALIDATION_REQUIRED (edit/revalidate cycles; FR-020 / FR-022)
 * - RETURNED_FOR_CORRECTION entry/exit (FR-025 / FR-028 / FR-029)
 * - SENT → PARTIALLY_SIGNED → FULLY_SIGNED (signature progress; no skip)
 * - SIGNATURE_DECLINED / SIGNATURE_EXPIRED recovery
 * - BLOCKED entry from work states + resume exit
 * - CANCELLED / SUPERSEDED / AMENDMENT_REQUIRED alternates
 *
 * Terminal: LOCKED, CANCELLED, SUPERSEDED.
 */
export const PACKET_LIFECYCLE_TRANSITIONS: Readonly<
  Record<PacketLifecycleStatus, readonly PacketLifecycleStatus[]>
> = {
  /* ── Main path (§17.1 linear chain) ─────────────────────────────── */
  SOURCE_COLLECTION: ['DRAFT_GENERATED', 'BLOCKED', 'CANCELLED'],
  DRAFT_GENERATED: ['UNDER_ANALYSIS', 'BLOCKED', 'CANCELLED'],
  UNDER_ANALYSIS: ['READY_FOR_REVIEW', 'BLOCKED', 'CANCELLED'],
  READY_FOR_REVIEW: ['UNDER_REVIEW', 'BLOCKED', 'CANCELLED'],
  UNDER_REVIEW: ['EDITING', 'BLOCKED', 'CANCELLED'],
  /**
   * EDITING → VALIDATION_REQUIRED is the main-path step.
   * VALIDATION_REQUIRED → EDITING is the justified revalidate loop
   * (FR-020 Direct Editing / FR-022 Edit Impact Analysis — material edits
   * require impact analysis and revalidation before approval).
   */
  EDITING: ['VALIDATION_REQUIRED', 'BLOCKED', 'CANCELLED'],
  VALIDATION_REQUIRED: [
    'READY_FOR_APPROVAL',
    'EDITING', // FR-020 / FR-022: failed or incomplete validation returns to editing
    'BLOCKED',
    'CANCELLED',
  ],
  /**
   * FR-025 Approval Readiness Review actions include
   * "Return for correction" and "Reject" (→ RETURNED_FOR_CORRECTION).
   */
  READY_FOR_APPROVAL: [
    'APPROVED_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION', // FR-025: "Return for correction"
    'BLOCKED',
    'CANCELLED',
  ],
  APPROVED_FOR_SIGNATURE: [
    'SIGNER_CONFIRMATION',
    'RETURNED_FOR_CORRECTION', // FR-025: "Reject" / return before signer confirmation
    'BLOCKED',
    'CANCELLED',
  ],
  SIGNER_CONFIRMATION: [
    'ECIGN_PREPARING',
    'RETURNED_FOR_CORRECTION', // FR-025 / FR-028: return for correction
    'BLOCKED',
    'CANCELLED',
  ],
  /**
   * FR-029 Editing After eCIgn — Prepared but not sent:
   * "Cancel prepared envelope, preserve audit, reopen packet, reapprove…"
   */
  ECIGN_PREPARING: [
    'SENT_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION', // FR-029: cancel prepared envelope and reopen
    'BLOCKED',
    'CANCELLED',
  ],
  /**
   * Signature progress is SENT → PARTIALLY_SIGNED → FULLY_SIGNED (§17.1).
   * Decline/expiry are alternate exits (void/decline/expiry).
   * FR-028 supports "Void" / "Return for correction"; FR-029 sent-but-not-fully-signed:
   * "Void envelope… create a new packet version, revalidate, reapprove…"
   */
  SENT_FOR_SIGNATURE: [
    'PARTIALLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION', // FR-028 / FR-029: void & correct
    'BLOCKED',
    'CANCELLED',
  ],
  PARTIALLY_SIGNED: [
    'FULLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION', // FR-028 / FR-029: void & correct
    'BLOCKED',
    'CANCELLED',
  ],
  /**
   * FR-029 Fully signed: "The packet is immutable. Corrections require
   * amendment, addendum, replacement, or superseding packet."
   */
  FULLY_SIGNED: [
    'SIGNED_PACKAGE_BUILDING',
    'BLOCKED',
    'AMENDMENT_REQUIRED', // FR-029: post-signature corrections via amendment
  ],
  SIGNED_PACKAGE_BUILDING: ['CERTIFICATION_REVIEW', 'BLOCKED'],
  CERTIFICATION_REVIEW: [
    'CERTIFIED',
    'RETURNED_FOR_CORRECTION',
    'AMENDMENT_REQUIRED',
    'BLOCKED',
  ],
  CERTIFIED: [
    'DRIVE_PUBLISHING',
    'BLOCKED',
    'AMENDMENT_REQUIRED',
  ],
  DRIVE_PUBLISHING: ['PUBLISHED', 'BLOCKED'],
  PUBLISHED: [
    'LOCKED',
    'AMENDMENT_REQUIRED', // FR-029 / FR-032: amendment after publish
    'SUPERSEDED',
  ],
  LOCKED: [], // terminal

  /* ── Alternate states ───────────────────────────────────────────── */
  /**
   * BLOCKED may be entered from any non-terminal work state (via that
   * state's outbound list) and may resume into any non-terminal main-path
   * or cancel.
   */
  BLOCKED: [
    'SOURCE_COLLECTION',
    'DRAFT_GENERATED',
    'UNDER_ANALYSIS',
    'READY_FOR_REVIEW',
    'UNDER_REVIEW',
    'EDITING',
    'VALIDATION_REQUIRED',
    'READY_FOR_APPROVAL',
    'APPROVED_FOR_SIGNATURE',
    'SIGNER_CONFIRMATION',
    'ECIGN_PREPARING',
    'SENT_FOR_SIGNATURE',
    'PARTIALLY_SIGNED',
    'FULLY_SIGNED',
    'SIGNED_PACKAGE_BUILDING',
    'CERTIFICATION_REVIEW',
    'CERTIFIED',
    'DRIVE_PUBLISHING',
    'PUBLISHED',
    'CANCELLED',
  ],
  /**
   * FR-025 / FR-029 re-entry: correction work restarts at EDITING, then
   * re-traverses VALIDATION_REQUIRED → READY_FOR_APPROVAL → …
   */
  RETURNED_FOR_CORRECTION: ['EDITING', 'CANCELLED'],
  /**
   * Decline recovery: reopen for correction (FR-029) or re-confirm signers
   * without content change (FR-026 / FR-028 replace signer).
   */
  SIGNATURE_DECLINED: [
    'RETURNED_FOR_CORRECTION',
    'SIGNER_CONFIRMATION',
    'CANCELLED',
  ],
  /**
   * Expiry recovery: reopen, re-confirm signers, or re-prepare envelope
   * (FR-028 "Extend expiration" / reissue).
   */
  SIGNATURE_EXPIRED: [
    'RETURNED_FOR_CORRECTION',
    'SIGNER_CONFIRMATION',
    'ECIGN_PREPARING',
    'CANCELLED',
  ],
  CANCELLED: [], // terminal
  SUPERSEDED: [], // terminal
  /**
   * FR-029 / FR-032: amendment path re-enters EDITING on a new version;
   * replacement uses SUPERSEDED; abandoned amendments may CANCELLED.
   */
  AMENDMENT_REQUIRED: ['EDITING', 'SUPERSEDED', 'CANCELLED'],
};

export function isAllowedPacketTransition(
  from: PacketLifecycleStatus,
  to: PacketLifecycleStatus,
): boolean {
  return PACKET_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertPacketTransition(
  from: PacketLifecycleStatus,
  to: PacketLifecycleStatus,
): void {
  if (!isAllowedPacketTransition(from, to)) {
    throw new Error(`Illegal packet lifecycle transition: ${from} → ${to}`);
  }
}

export function isTerminalPacketStatus(status: PacketLifecycleStatus): boolean {
  return PACKET_LIFECYCLE_TRANSITIONS[status]?.length === 0;
}

/* ══════════════════════════════════════════════════════════════════════
   §17.2 Workflow trigger lifecycle
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Allowed trigger lifecycle transitions.
 * SUSTAINMENT or ESCALATION are parallel post-remeasurement branches.
 * CLOSED is terminal.
 */
export const TRIGGER_LIFECYCLE_TRANSITIONS: Readonly<
  Record<TriggerLifecycleStatus, readonly TriggerLifecycleStatus[]>
> = {
  CANDIDATE: ['VALIDATED', 'CLOSED'],
  VALIDATED: ['AUTHORIZED', 'CLOSED'],
  AUTHORIZED: ['ACTIVATED', 'CLOSED'],
  ACTIVATED: ['IN_PROGRESS', 'CLOSED'],
  IN_PROGRESS: ['REMEASUREMENT', 'SUSTAINMENT', 'ESCALATION', 'CLOSED'],
  REMEASUREMENT: ['SUSTAINMENT', 'ESCALATION', 'IN_PROGRESS', 'CLOSED'],
  SUSTAINMENT: ['CLOSED', 'ESCALATION', 'REMEASUREMENT'],
  ESCALATION: ['CLOSED', 'IN_PROGRESS', 'SUSTAINMENT'],
  CLOSED: [], // terminal
};

export function isAllowedTriggerTransition(
  from: TriggerLifecycleStatus,
  to: TriggerLifecycleStatus,
): boolean {
  return TRIGGER_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTriggerTransition(
  from: TriggerLifecycleStatus,
  to: TriggerLifecycleStatus,
): void {
  if (!isAllowedTriggerTransition(from, to)) {
    throw new Error(`Illegal trigger lifecycle transition: ${from} → ${to}`);
  }
}

export function isTerminalTriggerStatus(status: TriggerLifecycleStatus): boolean {
  return TRIGGER_LIFECYCLE_TRANSITIONS[status]?.length === 0;
}

/* ══════════════════════════════════════════════════════════════════════
   §17.3 Supplemental-information lifecycle
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Allowed supplemental lifecycle transitions.
 * RECEIVED → CLASSIFIED → MAPPED → VALIDATED → ACCEPTED|REJECTED → APPLIED
 * REJECTED and APPLIED are terminal.
 */
export const SUPPLEMENTAL_LIFECYCLE_TRANSITIONS: Readonly<
  Record<SupplementalLifecycleStatus, readonly SupplementalLifecycleStatus[]>
> = {
  RECEIVED: ['CLASSIFIED'],
  CLASSIFIED: ['MAPPED'],
  MAPPED: ['VALIDATED'],
  VALIDATED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['APPLIED'],
  REJECTED: [], // terminal
  APPLIED: [], // terminal
};

export function isAllowedSupplementalTransition(
  from: SupplementalLifecycleStatus,
  to: SupplementalLifecycleStatus,
): boolean {
  return SUPPLEMENTAL_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertSupplementalTransition(
  from: SupplementalLifecycleStatus,
  to: SupplementalLifecycleStatus,
): void {
  if (!isAllowedSupplementalTransition(from, to)) {
    throw new Error(`Illegal supplemental lifecycle transition: ${from} → ${to}`);
  }
}

export function isTerminalSupplementalStatus(
  status: SupplementalLifecycleStatus,
): boolean {
  return SUPPLEMENTAL_LIFECYCLE_TRANSITIONS[status]?.length === 0;
}

/* ══════════════════════════════════════════════════════════════════════
   §17.4 Signature lifecycle
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Allowed signature lifecycle transitions.
 * Main path: PREPARED → SENT → DELIVERED → VIEWED → PARTIALLY_SIGNED → COMPLETED
 * Alternates: DECLINED, EXPIRED, VOIDED, FAILED (terminal).
 * COMPLETED is terminal.
 */
export const SIGNATURE_LIFECYCLE_TRANSITIONS: Readonly<
  Record<SignatureLifecycleStatus, readonly SignatureLifecycleStatus[]>
> = {
  PREPARED: ['SENT', 'VOIDED', 'FAILED', 'EXPIRED'],
  SENT: ['DELIVERED', 'VIEWED', 'DECLINED', 'EXPIRED', 'VOIDED', 'FAILED'],
  DELIVERED: ['VIEWED', 'PARTIALLY_SIGNED', 'DECLINED', 'EXPIRED', 'VOIDED', 'FAILED'],
  VIEWED: [
    'PARTIALLY_SIGNED',
    'COMPLETED',
    'DECLINED',
    'EXPIRED',
    'VOIDED',
    'FAILED',
  ],
  PARTIALLY_SIGNED: ['COMPLETED', 'DECLINED', 'EXPIRED', 'VOIDED', 'FAILED'],
  COMPLETED: [], // terminal
  DECLINED: [], // terminal
  EXPIRED: [], // terminal
  VOIDED: [], // terminal
  FAILED: [], // terminal
};

export function isAllowedSignatureTransition(
  from: SignatureLifecycleStatus,
  to: SignatureLifecycleStatus,
): boolean {
  return SIGNATURE_LIFECYCLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertSignatureTransition(
  from: SignatureLifecycleStatus,
  to: SignatureLifecycleStatus,
): void {
  if (!isAllowedSignatureTransition(from, to)) {
    throw new Error(`Illegal signature lifecycle transition: ${from} → ${to}`);
  }
}

export function isTerminalSignatureStatus(status: SignatureLifecycleStatus): boolean {
  return SIGNATURE_LIFECYCLE_TRANSITIONS[status]?.length === 0;
}

/* ══════════════════════════════════════════════════════════════════════
   Generic guards (name-compatible with deliverable surface)
   ══════════════════════════════════════════════════════════════════════ */

export type PacketPlatformMachine =
  | 'packet'
  | 'trigger'
  | 'supplemental'
  | 'signature';

/**
 * Generic allowed-transition check across all four machines.
 * Prefer the typed helpers above at call sites.
 */
export function isAllowedTransition(
  machine: PacketPlatformMachine,
  from: string,
  to: string,
): boolean {
  switch (machine) {
    case 'packet':
      return isAllowedPacketTransition(
        from as PacketLifecycleStatus,
        to as PacketLifecycleStatus,
      );
    case 'trigger':
      return isAllowedTriggerTransition(
        from as TriggerLifecycleStatus,
        to as TriggerLifecycleStatus,
      );
    case 'supplemental':
      return isAllowedSupplementalTransition(
        from as SupplementalLifecycleStatus,
        to as SupplementalLifecycleStatus,
      );
    case 'signature':
      return isAllowedSignatureTransition(
        from as SignatureLifecycleStatus,
        to as SignatureLifecycleStatus,
      );
    default: {
      const _exhaustive: never = machine;
      return _exhaustive;
    }
  }
}

/**
 * Generic assert-transition guard across all four machines.
 * Throws on illegal transitions.
 */
export function assertTransition(
  machine: PacketPlatformMachine,
  from: string,
  to: string,
): void {
  if (!isAllowedTransition(machine, from, to)) {
    throw new Error(`Illegal ${machine} lifecycle transition: ${from} → ${to}`);
  }
}

/** Aggregate ALLOWED_TRANSITIONS map for discovery / tests. */
export const ALLOWED_TRANSITIONS = {
  packet: PACKET_LIFECYCLE_TRANSITIONS,
  trigger: TRIGGER_LIFECYCLE_TRANSITIONS,
  supplemental: SUPPLEMENTAL_LIFECYCLE_TRANSITIONS,
  signature: SIGNATURE_LIFECYCLE_TRANSITIONS,
} as const;
