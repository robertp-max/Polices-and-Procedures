/**
 * FirestoreAuditEventStore — transactional, multi-instance-safe audit backend.
 *
 * Each append runs in ONE transaction that: reads the idempotency reservation
 * (returns the existing event on a repeat), reads the stream head, allocates
 * the next sequence, preserves the prior hash, constructs the canonical v2
 * event with RETRY-STABLE input (event_id/timestamp/correlation fixed before
 * the transaction), computes the hash, CREATE-only writes the event doc and the
 * idempotency reservation, and updates the stream head — committed atomically.
 *
 * create() (not set) on the event doc means two concurrent instances that
 * allocate the same sequence collide -> retry, so no duplicate sequence, no
 * overwrite, and append-only immutability is enforced at the database layer.
 *
 * Layout (safe, hashed, path-safe ids — never raw stream/email/PHI):
 *   audit_streams/{sha256(stream)}                       -> stream head
 *   audit_streams/{sha256(stream)}/events/{zeroPad(seq)} -> immutable event
 *   audit_idempotency/{sha256(stream::key)}              -> reservation
 */
import type { AuditEventStore } from './auditEventStore.js';
import type { FirestoreLike, Transaction } from './firestorePort.js';
import {
  assertNoPhi, constructEvent, defaultGenerators, filterEvents, sha256, verifyChainList, verifyChainDetailed,
  GENESIS_HEAD,
  type AuditEvent, type AuditEventInput, type ChainHead, type ChainIntegrityReport, type ChainVerifyResult,
  type EventGenerators, type QueryFilter,
} from './eventModel.js';

export const AUDIT_STREAMS_COLLECTION = 'audit_streams';
export const AUDIT_IDEMPOTENCY_COLLECTION = 'audit_idempotency';
export const EVENTS_SUBCOLLECTION = 'events';
const SEQ_PAD = 12;
const DEFAULT_PAGE_SIZE = 500;

export function streamDocId(stream: string): string { return sha256(stream); }
export function idempotencyDocId(stream: string, key: string): string { return sha256(`${stream}::${key}`); }
export function eventsCollectionPath(stream: string): string {
  return `${AUDIT_STREAMS_COLLECTION}/${streamDocId(stream)}/${EVENTS_SUBCOLLECTION}`;
}
export function zeroPadSequence(seq: number): string { return String(seq).padStart(SEQ_PAD, '0'); }

interface StreamHeadDoc extends ChainHead { stream: string }
interface IdempotencyDoc { stream: string; sequence: number }

export class FirestoreAuditEventStore implements AuditEventStore {
  private readonly fs: FirestoreLike;
  private readonly gen: EventGenerators;
  private readonly pageSize: number;
  /**
   * Per-stream in-process serialization. Appends to one stream are inherently
   * serial (each event's prev_hash chains off the previous), so firing many
   * same-stream appends concurrently from ONE process would only make them
   * collide on the stream-head document and retry — an O(n^2) abort storm that
   * we inflict on ourselves. We serialize same-stream appends locally so each
   * transaction commits first-try. Genuine cross-instance contention (two
   * processes racing the same stream) is NOT coalesced here — it is still
   * resolved by the create-only transaction + contention retry in the adapter,
   * and is exercised by the cross-process emulator test.
   */
  private readonly streamLocks = new Map<string, Promise<unknown>>();

  constructor(firestore: FirestoreLike, opts: { generators?: EventGenerators; pageSize?: number } = {}) {
    this.fs = firestore;
    this.gen = opts.generators ?? defaultGenerators();
    this.pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  }

  /** Run `task` after any in-flight append to the same stream settles. */
  private runSerializedPerStream<T>(stream: string, task: () => Promise<T>): Promise<T> {
    const prev = this.streamLocks.get(stream) ?? Promise.resolve();
    const run = prev.then(task, task); // proceed regardless of the prior result
    const tail = run.then(() => undefined, () => undefined); // next waiter never sees a rejection
    this.streamLocks.set(stream, tail);
    void tail.then(() => { if (this.streamLocks.get(stream) === tail) this.streamLocks.delete(stream); });
    return run;
  }

  async append(input: AuditEventInput): Promise<AuditEvent> {
    assertNoPhi(input);
    // Retry-stable input: fixed once, reused across transaction retries so the
    // event_id/timestamp/correlation do not change between attempts.
    const stableId = this.gen.id();
    const stableNow = this.gen.now();
    const stableCorrelation = input.correlation_id ?? this.gen.id();
    const stableGen: EventGenerators = { id: () => stableId, now: () => stableNow };
    const stableInput: AuditEventInput = { ...input, correlation_id: stableCorrelation };

    return this.runSerializedPerStream(input.stream, () => this.fs.runTransaction(async (txn: Transaction) => {
      // (1) idempotency reservation → return existing event on repeat.
      if (input.idempotency_key) {
        const idemRef = this.fs.doc(AUDIT_IDEMPOTENCY_COLLECTION, idempotencyDocId(input.stream, input.idempotency_key));
        const idemSnap = await txn.get<IdempotencyDoc>(idemRef);
        if (idemSnap.exists && idemSnap.data()) {
          const { sequence } = idemSnap.data()!;
          const evSnap = await txn.get<AuditEvent>(this.fs.doc(eventsCollectionPath(input.stream), zeroPadSequence(sequence)));
          if (evSnap.exists && evSnap.data()) return evSnap.data() as AuditEvent;
        }
      }
      // (2) read head; (3) allocate seq; (3) preserve prior hash.
      const headRef = this.fs.doc(AUDIT_STREAMS_COLLECTION, streamDocId(input.stream));
      const headSnap = await txn.get<StreamHeadDoc>(headRef);
      const head: ChainHead = headSnap.exists && headSnap.data()
        ? { last_hash: headSnap.data()!.last_hash, sequence: headSnap.data()!.sequence }
        : GENESIS_HEAD;
      // (4)+(5) construct canonical v2 event (retry-stable) + hash.
      const event = constructEvent(stableInput, head, stableGen);
      // (6) CREATE-only event doc; (7) CREATE-only idempotency; (8) update head.
      txn.create(this.fs.doc(eventsCollectionPath(input.stream), zeroPadSequence(event.sequence)), event as unknown as Record<string, unknown>);
      if (input.idempotency_key) {
        txn.create(
          this.fs.doc(AUDIT_IDEMPOTENCY_COLLECTION, idempotencyDocId(input.stream, input.idempotency_key)),
          { stream: input.stream, sequence: event.sequence } satisfies IdempotencyDoc,
        );
      }
      txn.set(headRef, { stream: input.stream, last_hash: event.event_hash, sequence: event.sequence } satisfies StreamHeadDoc);
      return event;
    }));
  }

  /** Enumerate stream names from the (bounded) stream-head collection. */
  private async listStreams(): Promise<string[]> {
    const heads = await this.fs.listCollection<StreamHeadDoc>(AUDIT_STREAMS_COLLECTION);
    return heads.map(h => h.stream).filter((s): s is string => typeof s === 'string');
  }

  /** Bounded, ordered-by-sequence read of one stream's events. */
  private async readStreamEvents(stream: string): Promise<AuditEvent[]> {
    const out: AuditEvent[] = [];
    let startAfterId: string | undefined;
    for (;;) {
      const page = await this.fs.listCollectionPaged<AuditEvent>(eventsCollectionPath(stream), { pageSize: this.pageSize, startAfterId });
      out.push(...page.docs);
      if (!page.lastId) break;
      startAfterId = page.lastId;
    }
    return out;
  }

  async readAll(): Promise<AuditEvent[]> {
    const streams = await this.listStreams();
    const all: AuditEvent[] = [];
    for (const s of streams) all.push(...await this.readStreamEvents(s));
    return all;
  }

  async queryEvents(filter: QueryFilter): Promise<AuditEvent[]> {
    if (filter.stream) return filterEvents(await this.readStreamEvents(filter.stream), filter);
    return filterEvents(await this.readAll(), filter);
  }

  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return (await this.readAll()).find(e => e.event_id === eventId) ?? null;
  }

  async verifyChains(stream?: string): Promise<ChainVerifyResult> {
    const events = stream ? await this.readStreamEvents(stream) : await this.readAll();
    return verifyChainList(events, stream);
  }

  async verifyChainsDetailed(stream?: string): Promise<ChainIntegrityReport> {
    const events = stream ? await this.readStreamEvents(stream) : await this.readAll();
    return verifyChainDetailed(events, stream);
  }
}
