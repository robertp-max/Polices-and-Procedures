/**
 * AuditEventStore — the storage-agnostic audit repository contract.
 *
 * Every backend (JSONL, in-memory, Firestore) implements this. The event
 * model, hashing, PHI guard, and chain verification are shared via
 * ./eventModel so all backends behave identically; only persistence and
 * transaction semantics differ.
 */
import type {
  AuditEvent, AuditEventInput, ChainIntegrityReport, ChainVerifyResult, QueryFilter,
} from './eventModel.js';

export interface AuditEventStore {
  /** Append an event (idempotent by (stream, idempotency_key) when supplied). */
  append(input: AuditEventInput): Promise<AuditEvent>;
  /** All events (small-scale; adapters may paginate internally). */
  readAll(): Promise<AuditEvent[]>;
  queryEvents(filter: QueryFilter): Promise<AuditEvent[]>;
  getEvent(eventId: string): Promise<AuditEvent | null>;
  /** Backward-compatible chain verification (ok/first_break shape). */
  verifyChains(stream?: string): Promise<ChainVerifyResult>;
  /** Version-aware, per-event integrity report with explicit states. */
  verifyChainsDetailed(stream?: string): Promise<ChainIntegrityReport>;
}
