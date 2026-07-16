/**
 * FirestoreAuditEventStore — transactional, multi-instance-safe audit backend.
 *
 * Every append runs in one Firestore transaction that atomically: reads the
 * stream head, allocates the next sequence, preserves the prior hash,
 * constructs + hashes the canonical event, writes the event, updates the head,
 * and reserves the idempotency key (returning the existing event on a repeat).
 * Firestore's optimistic concurrency guarantees two concurrent Cloud Run
 * instances cannot assign duplicate sequences, duplicate an idempotency key,
 * break a chain, or overwrite an event.
 *
 * Document paths use SAFE DETERMINISTIC ids only (sha256 of the stream /
 * idempotency key, ulid event ids) — never raw stream names, emails, or PHI.
 */
import type { AuditEventStore } from './auditEventStore.js';
import type { FirestoreLike, Transaction } from './firestorePort.js';
import {
  assertNoPhi, constructEvent, defaultGenerators, filterEvents, sha256, verifyChainList,
  GENESIS_HEAD,
  type AuditEvent, type AuditEventInput, type ChainHead, type ChainVerifyResult,
  type EventGenerators, type QueryFilter,
} from './eventModel.js';

export const AUDIT_EVENTS_COLLECTION = 'audit_events';
export const AUDIT_STREAM_HEADS_COLLECTION = 'audit_stream_heads';
export const AUDIT_IDEMPOTENCY_COLLECTION = 'audit_idempotency';

/** Deterministic, path-safe doc id for a stream head (never the raw stream). */
export function streamHeadDocId(stream: string): string {
  return sha256(stream);
}
/** Deterministic, path-safe doc id for an idempotency reservation. */
export function idempotencyDocId(stream: string, key: string): string {
  return sha256(`${stream}::${key}`);
}

interface IdempotencyDoc { event_id: string }

export class FirestoreAuditEventStore implements AuditEventStore {
  private readonly fs: FirestoreLike;
  private readonly gen: EventGenerators;

  constructor(firestore: FirestoreLike, opts: { generators?: EventGenerators } = {}) {
    this.fs = firestore;
    this.gen = opts.generators ?? defaultGenerators();
  }

  async append(input: AuditEventInput): Promise<AuditEvent> {
    assertNoPhi(input);
    return this.fs.runTransaction(async (txn: Transaction) => {
      // (1) Idempotency: return the existing event for a repeated key.
      if (input.idempotency_key) {
        const idemRef = this.fs.doc(AUDIT_IDEMPOTENCY_COLLECTION, idempotencyDocId(input.stream, input.idempotency_key));
        const idemSnap = await txn.get<IdempotencyDoc>(idemRef);
        if (idemSnap.exists && idemSnap.data()?.event_id) {
          const existing = await txn.get<AuditEvent>(this.fs.doc(AUDIT_EVENTS_COLLECTION, idemSnap.data()!.event_id));
          if (existing.exists && existing.data()) return existing.data() as AuditEvent;
        }
      }
      // (2) Read stream head; (3) allocate seq + (3) preserve prior hash.
      const headRef = this.fs.doc(AUDIT_STREAM_HEADS_COLLECTION, streamHeadDocId(input.stream));
      const headSnap = await txn.get<ChainHead>(headRef);
      const head = headSnap.exists && headSnap.data() ? (headSnap.data() as ChainHead) : GENESIS_HEAD;
      // (4)+(5) construct canonical event + compute hash.
      const event = constructEvent(input, head, this.gen);
      // (6) write event; (7) update head; (8) reserve idempotency — all atomic.
      txn.set(this.fs.doc(AUDIT_EVENTS_COLLECTION, event.event_id), event as unknown as Record<string, unknown>);
      txn.set(headRef, { last_hash: event.event_hash, sequence: event.sequence });
      if (input.idempotency_key) {
        txn.set(
          this.fs.doc(AUDIT_IDEMPOTENCY_COLLECTION, idempotencyDocId(input.stream, input.idempotency_key)),
          { event_id: event.event_id },
        );
      }
      return event;
    });
  }

  async readAll(): Promise<AuditEvent[]> {
    const all = await this.fs.listCollection<AuditEvent>(AUDIT_EVENTS_COLLECTION);
    return all.slice().sort((a, b) => (a.stream === b.stream
      ? a.sequence - b.sequence
      : a.occurred_at_utc < b.occurred_at_utc ? -1 : 1));
  }

  async queryEvents(filter: QueryFilter): Promise<AuditEvent[]> {
    return filterEvents(await this.readAll(), filter);
  }

  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return (await this.readAll()).find(e => e.event_id === eventId) ?? null;
  }

  async verifyChains(stream?: string): Promise<ChainVerifyResult> {
    return verifyChainList(await this.readAll(), stream);
  }
}
