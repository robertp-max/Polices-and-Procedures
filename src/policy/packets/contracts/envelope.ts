/**
 * eCIgn envelope + signer task + signature lifecycle contracts —
 * FR-026, FR-027, FR-028, §17.4. Pure types only.
 */

/**
 * §17.4 Signature lifecycle — main path + alternate states.
 */
export type SignatureLifecycleStatus =
  /* Main path */
  | 'PREPARED'
  | 'SENT'
  | 'DELIVERED'
  | 'VIEWED'
  | 'PARTIALLY_SIGNED'
  | 'COMPLETED'
  /* Alternates */
  | 'DECLINED'
  | 'EXPIRED'
  | 'VOIDED'
  | 'FAILED';

/**
 * FR-026 signer task — capacity, order, dual-capacity.
 * One signer may satisfy two capacities only when an explicit dual-capacity
 * rule permits it and the record shows both capacities.
 */
export interface PacketSignerTask {
  signerTaskId: string;
  envelopeId: string;
  /** Required signing capacity (role/capacity label). */
  requiredCapacity: string;
  /** Assigned signer identity (null until confirmed). */
  signerUserId: string | null;
  signerName: string | null;
  signerEmail: string | null;
  signerRole: string | null;
  authorityVerified: boolean;
  /** 1-based signing order. */
  order: number;
  required: boolean;
  /** Dual-capacity rule id when one person covers two capacities. */
  dualCapacityRuleId: string | null;
  /** Both capacities when dual-capacity applies; otherwise null. */
  dualCapacities: readonly [string, string] | null;
  status: SignatureLifecycleStatus;
  dueDate: string | null;
  expiresAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  reminderCount: number;
  attachmentAccessGranted: boolean;
  confidentialityAcknowledged: boolean;
}

/**
 * Packet eCIgn envelope (FR-027).
 * Bound to a frozen packet version and content hash.
 */
export interface PacketEnvelope {
  envelopeId: string;
  packetInstanceId: string;
  /** Frozen approved packet version at prepare time. */
  frozenPacketVersion: number;
  /** Content hash of the frozen packet. */
  contentHash: string;
  /** Form instances included in the envelope. */
  memberFormInstanceIds: string[];
  signerTasks: PacketSignerTask[];
  status: SignatureLifecycleStatus;
  /** Pre-signature PDF pointer (if generated). */
  preSignaturePdfUrl: string | null;
  attachmentManifestId: string | null;
  evidenceManifestId: string | null;
  signaturePlacementMapId: string | null;
  createdAt: string;
  createdBy: string;
  sentAt: string | null;
  completedAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
  expiresAt: string | null;
  /** Idempotency key used for prepare/send (§18.9). */
  idempotencyKey: string | null;
}
