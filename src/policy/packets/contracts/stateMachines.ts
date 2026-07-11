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
 * Allowed packet lifecycle transitions.
 * Main path is linear; alternate states fan in/out where the PRD implies
 * recovery, return-for-correction, signature failure, cancel, supersede,
 * and amendment. Terminal: LOCKED, CANCELLED, SUPERSEDED.
 */
export const PACKET_LIFECYCLE_TRANSITIONS: Readonly<
  Record<PacketLifecycleStatus, readonly PacketLifecycleStatus[]>
> = {
  SOURCE_COLLECTION: ['DRAFT_GENERATED', 'BLOCKED', 'CANCELLED'],
  DRAFT_GENERATED: ['UNDER_ANALYSIS', 'EDITING', 'BLOCKED', 'CANCELLED'],
  UNDER_ANALYSIS: [
    'READY_FOR_REVIEW',
    'VALIDATION_REQUIRED',
    'EDITING',
    'BLOCKED',
    'CANCELLED',
  ],
  READY_FOR_REVIEW: ['UNDER_REVIEW', 'EDITING', 'BLOCKED', 'CANCELLED'],
  UNDER_REVIEW: [
    'EDITING',
    'VALIDATION_REQUIRED',
    'READY_FOR_APPROVAL',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  EDITING: [
    'VALIDATION_REQUIRED',
    'UNDER_ANALYSIS',
    'UNDER_REVIEW',
    'READY_FOR_REVIEW',
    'BLOCKED',
    'CANCELLED',
  ],
  VALIDATION_REQUIRED: [
    'READY_FOR_APPROVAL',
    'EDITING',
    'READY_FOR_REVIEW',
    'BLOCKED',
    'RETURNED_FOR_CORRECTION',
    'CANCELLED',
  ],
  READY_FOR_APPROVAL: [
    'APPROVED_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION',
    'EDITING',
    'BLOCKED',
    'CANCELLED',
  ],
  APPROVED_FOR_SIGNATURE: [
    'SIGNER_CONFIRMATION',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  SIGNER_CONFIRMATION: [
    'ECIGN_PREPARING',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  ECIGN_PREPARING: [
    'SENT_FOR_SIGNATURE',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  SENT_FOR_SIGNATURE: [
    'PARTIALLY_SIGNED',
    'FULLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  PARTIALLY_SIGNED: [
    'FULLY_SIGNED',
    'SIGNATURE_DECLINED',
    'SIGNATURE_EXPIRED',
    'RETURNED_FOR_CORRECTION',
    'BLOCKED',
    'CANCELLED',
  ],
  FULLY_SIGNED: ['SIGNED_PACKAGE_BUILDING', 'BLOCKED', 'AMENDMENT_REQUIRED'],
  SIGNED_PACKAGE_BUILDING: ['CERTIFICATION_REVIEW', 'BLOCKED'],
  CERTIFICATION_REVIEW: [
    'CERTIFIED',
    'RETURNED_FOR_CORRECTION',
    'AMENDMENT_REQUIRED',
    'BLOCKED',
  ],
  CERTIFIED: ['DRIVE_PUBLISHING', 'PUBLISHED', 'BLOCKED', 'AMENDMENT_REQUIRED'],
  DRIVE_PUBLISHING: ['PUBLISHED', 'BLOCKED'],
  PUBLISHED: ['LOCKED', 'AMENDMENT_REQUIRED', 'SUPERSEDED'],
  LOCKED: [], // terminal
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
    'SIGNED_PACKAGE_BUILDING',
    'CERTIFICATION_REVIEW',
    'DRIVE_PUBLISHING',
    'CANCELLED',
  ],
  RETURNED_FOR_CORRECTION: [
    'EDITING',
    'VALIDATION_REQUIRED',
    'READY_FOR_REVIEW',
    'UNDER_REVIEW',
    'CANCELLED',
  ],
  SIGNATURE_DECLINED: [
    'RETURNED_FOR_CORRECTION',
    'EDITING',
    'SIGNER_CONFIRMATION',
    'CANCELLED',
  ],
  SIGNATURE_EXPIRED: [
    'RETURNED_FOR_CORRECTION',
    'EDITING',
    'SIGNER_CONFIRMATION',
    'ECIGN_PREPARING',
    'CANCELLED',
  ],
  CANCELLED: [], // terminal
  SUPERSEDED: [], // terminal
  AMENDMENT_REQUIRED: ['EDITING', 'SOURCE_COLLECTION', 'SUPERSEDED', 'CANCELLED'],
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
