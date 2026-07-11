/**
 * Packet audit chronology event vocabulary — FR-033.
 * Compatible in spirit with the existing hash-chained ledger (actor, resource
 * ref, ISO timestamps). Pure types only. Zero side effects.
 */

/**
 * FR-033 packet.* audit event type vocabulary.
 * Covers every bullet: template selection through supersession.
 */
export const PACKET_AUDIT_EVENT_TYPES = [
  'packet.template_selected',
  'packet.event_selected',
  'packet.prior_packet_lookup',
  'packet.source_uploaded',
  'packet.validated',
  'packet.calculated',
  'packet.trigger_evaluated',
  'packet.workflow_activated',
  'packet.form_generated',
  'packet.edited',
  'packet.brad_proposal',
  'packet.brad_user_decision',
  'packet.approved',
  'packet.envelope_action',
  'packet.signer_action',
  'packet.published',
  'packet.certified',
  'packet.locked',
  'packet.amended',
  'packet.superseded',
] as const;

export type PacketAuditEventType = (typeof PACKET_AUDIT_EVENT_TYPES)[number];

/** Actor on a packet audit event (hash-chain compatible). */
export interface PacketAuditActor {
  kind: 'user' | 'system' | 'integration';
  actorId: string;
  actorRole: string | null;
  onBehalfOf: string | null;
}

/** Resource reference for the audit event. */
export interface PacketAuditResourceRef {
  resourceType:
    | 'packet'
    | 'envelope'
    | 'form_instance'
    | 'workflow_trigger'
    | 'source'
    | 'attachment'
    | 'sidecar'
    | 'signature'
    | 'template'
    | 'event';
  resourceId: string;
  parentResourceId: string | null;
  packetInstanceId: string | null;
  packetVersion: number | null;
}

/**
 * Packet audit event envelope — hash-chain compatible in spirit with the
 * existing ledger (sequence, previous/current hash, ISO timestamps).
 */
export interface PacketAuditEvent {
  /** Stable event id. */
  eventId: string;
  /** Monotonic sequence within the packet chronology chain. */
  sequence: number;
  /** FR-033 event type. */
  eventType: PacketAuditEventType;
  /** Actor who performed the action. */
  actor: PacketAuditActor;
  /** Resource acted upon. */
  resource: PacketAuditResourceRef;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Optional human-readable summary (no PHI). */
  summary: string | null;
  /** Structured before snapshot (optional). */
  before: unknown | null;
  /** Structured after snapshot (optional). */
  after: unknown | null;
  /** Reason / rationale code or short text. */
  reason: string | null;
  /** Correlation id for multi-step operations. */
  correlationId: string | null;
  /** Idempotency key when the mutation was idempotent. */
  idempotencyKey: string | null;
  /** Previous event hash in the chain; null for genesis. */
  previousHash: string | null;
  /** Current event hash. */
  currentHash: string;
}
