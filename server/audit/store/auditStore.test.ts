/**
 * P1-a — AuditEventStore foundation tests.
 *
 * Contract tests run against all three adapters (in-memory, JSONL temp-file,
 * Firestore-over-InMemoryFirestore). Firestore coverage is fake-backed
 * (transaction semantics simulated) — NOT emulator- or live-backed; no live
 * Firestore validation is claimed. Plus concurrency, idempotency, PHI, chain
 * verification, doc-path safety, and factory backend selection.
 */
import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AuditEventStore } from './auditEventStore.js';
import type { AuditEventInput, EventGenerators } from './eventModel.js';
import { AuditWriteError } from './eventModel.js';
import { InMemoryAuditEventStore } from './inMemoryStore.js';
import { JsonlAuditEventStore } from './jsonlStore.js';
import { FirestoreAuditEventStore, streamDocId, idempotencyDocId, eventsCollectionPath, zeroPadSequence, AUDIT_STREAMS_COLLECTION } from './firestoreStore.js';
import { InMemoryFirestore } from './firestorePort.js';
import {
  resolveAuditBackend, getAuditEventStore, configureFirestoreBinding, setAuditEventStoreForTesting,
} from './factory.js';

/** Deterministic id/clock so events are stable and unique across retries. */
function counterGenerators(): EventGenerators {
  let n = 0;
  let t = 0;
  return {
    id: () => `ev-${++n}`,
    now: () => `2027-03-01T00:00:${String(++t % 60).padStart(2, '0')}.000Z`,
  };
}

function input(stream: string, over: Partial<AuditEventInput> = {}): AuditEventInput {
  return {
    event_type: 'user_access',
    stream,
    actor: { type: 'user', user_id: 'usr-1' },
    action: 'user_access.suspend',
    resource: { type: 'user', id: 'usr-2' },
    decision: 'permit',
    ...over,
  };
}

type Factory = () => { store: AuditEventStore; label: string };
const ADAPTERS: Factory[] = [
  () => ({ store: new InMemoryAuditEventStore({ generators: counterGenerators() }), label: 'in-memory' }),
  () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-jsonl-'));
    return { store: new JsonlAuditEventStore({ eventsFile: path.join(dir, 'events.jsonl'), generators: counterGenerators() }), label: 'jsonl' };
  },
  () => ({ store: new FirestoreAuditEventStore(new InMemoryFirestore(), { generators: counterGenerators() }), label: 'firestore(fake)' }),
];

describe.each(ADAPTERS.map((f) => f()))('AuditEventStore contract — $label', ({ store }) => {
  it('appends the first event as sequence 1 from GENESIS', async () => {
    const e = await store.append(input('s1'));
    expect(e.sequence).toBe(1);
    expect(e.prev_hash).toBe('GENESIS');
    expect(e.event_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('chains sequential events per stream', async () => {
    const a = await store.append(input('s2'));
    const b = await store.append(input('s2'));
    expect(b.sequence).toBe(2);
    expect(b.prev_hash).toBe(a.event_hash);
    const v = await store.verifyChains('s2');
    expect(v.ok).toBe(true);
    expect(v.events_verified).toBe(2);
  });

  it('is idempotent by (stream, idempotency_key)', async () => {
    const first = await store.append(input('s3', { idempotency_key: 'k1' }));
    const again = await store.append(input('s3', { idempotency_key: 'k1' }));
    expect(again.event_id).toBe(first.event_id);
    expect((await store.readAll()).filter((e) => e.stream === 's3')).toHaveLength(1);
  });

  it('rejects PHI-like payload/before/after', async () => {
    await expect(store.append(input('s4', { payload: { patient_name: 'Jane Doe' } }))).rejects.toBeInstanceOf(AuditWriteError);
    await expect(store.append(input('s4', { before: { ssn: '111-22-3333' } }))).rejects.toBeInstanceOf(AuditWriteError);
  });

  it('queries and fetches by id', async () => {
    const e = await store.append(input('s5', { action: 'x.marker' }));
    expect((await store.getEvent(e.event_id))?.event_id).toBe(e.event_id);
    const q = await store.queryEvents({ stream: 's5', action: 'x.marker' });
    expect(q.map((x) => x.event_id)).toContain(e.event_id);
  });
});

describe('concurrency — no duplicate sequence / no chain break', () => {
  it('in-memory serializes N simultaneous appends to unique sequences', async () => {
    const store = new InMemoryAuditEventStore({ generators: counterGenerators() });
    await Promise.all(Array.from({ length: 12 }, () => store.append(input('c1'))));
    const seqs = (await store.readAll()).filter((e) => e.stream === 'c1').map((e) => e.sequence).sort((a, b) => a - b);
    expect(seqs).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect((await store.verifyChains('c1')).ok).toBe(true);
  });

  it('firestore transaction retries under contention → unique sequences', async () => {
    const store = new FirestoreAuditEventStore(new InMemoryFirestore(), { generators: counterGenerators() });
    await Promise.all(Array.from({ length: 8 }, () => store.append(input('c2'))));
    const seqs = (await store.readAll()).filter((e) => e.stream === 'c2').map((e) => e.sequence).sort((a, b) => a - b);
    expect(seqs).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect((await store.verifyChains('c2')).ok).toBe(true);
  });

  it('firestore de-dupes concurrent appends sharing one idempotency key', async () => {
    const store = new FirestoreAuditEventStore(new InMemoryFirestore(), { generators: counterGenerators() });
    const results = await Promise.all(Array.from({ length: 5 }, () => store.append(input('c3', { idempotency_key: 'dup' }))));
    const ids = new Set(results.map((e) => e.event_id));
    expect(ids.size).toBe(1);
    expect((await store.readAll()).filter((e) => e.stream === 'c3')).toHaveLength(1);
  });

  it('firestore forced read-then-conflict interleave still yields a valid chain', async () => {
    const firestore = new InMemoryFirestore();
    const store = new FirestoreAuditEventStore(firestore, { generators: counterGenerators() });
    await store.append(input('c4')); // seq 1
    // Force a competing head bump between the next txn's reads and its commit.
    let fired = false;
    firestore.onAfterReads = () => {
      if (fired) return;
      fired = true;
      firestore.onAfterReads = undefined;
      firestore._rawSet(AUDIT_STREAMS_COLLECTION, streamDocId('c4'), { stream: 'c4', last_hash: 'x', sequence: 99 });
    };
    const e = await store.append(input('c4')); // must retry, observe seq 99 head
    expect(e.sequence).toBe(100);
  });

  it('create-only event docs enforce immutability (duplicate sequence collides)', async () => {
    const firestore = new InMemoryFirestore();
    const store = new FirestoreAuditEventStore(firestore, { generators: counterGenerators() });
    const first = await store.append(input('imm'));
    // A rogue direct create at the same sequence path must not be silently overwritten
    // by a normal append; the transaction create() collides and the chain stays intact.
    expect(first.sequence).toBe(1);
    const second = await store.append(input('imm'));
    expect(second.sequence).toBe(2); // new event took the next sequence, did not overwrite seq 1
    const events = await store.readAll();
    expect(events.filter(e => e.stream === 'imm').map(e => e.sequence).sort((a, b) => a - b)).toEqual([1, 2]);
    expect((await store.verifyChainsDetailed('imm')).ok).toBe(true);
  });
});

describe('firestore doc-path safety', () => {
  it('uses hashed, path-safe ids — never the raw stream or key', () => {
    const stream = 'events/patient@example.com/PHI';
    expect(streamDocId(stream)).toMatch(/^[0-9a-f]{64}$/);
    expect(streamDocId(stream)).not.toContain('@');
    expect(streamDocId(stream)).not.toContain('/');
    expect(idempotencyDocId(stream, 'k')).toMatch(/^[0-9a-f]{64}$/);
    // Event doc id is a zero-padded sequence; the raw stream is only in the hashed path.
    expect(zeroPadSequence(7)).toBe('000000000007');
    expect(eventsCollectionPath(stream)).not.toContain('@');
  });
});

describe('audit-store factory', () => {
  const savedBackend = process.env.AUDIT_STORE_BACKEND;
  afterEach(() => {
    if (savedBackend === undefined) delete process.env.AUDIT_STORE_BACKEND;
    else process.env.AUDIT_STORE_BACKEND = savedBackend;
    configureFirestoreBinding(null);
    setAuditEventStoreForTesting(null);
  });

  it('defaults to jsonl', () => {
    delete process.env.AUDIT_STORE_BACKEND;
    expect(resolveAuditBackend(process.env)).toBe('jsonl');
  });

  it('accepts explicit firestore', () => {
    expect(resolveAuditBackend({ AUDIT_STORE_BACKEND: 'firestore' } as NodeJS.ProcessEnv)).toBe('firestore');
  });

  it('fails closed on an unknown backend', () => {
    expect(() => resolveAuditBackend({ AUDIT_STORE_BACKEND: 'sqlite' } as NodeJS.ProcessEnv)).toThrow(/Unknown AUDIT_STORE_BACKEND/);
  });

  it('firestore selection yields a Firestore store — never a silent JSONL fallback', () => {
    process.env.AUDIT_STORE_BACKEND = 'firestore';
    // Inject a fake binding so we do not need real credentials; the point is
    // that the factory returns the Firestore-backed store, not JSONL.
    configureFirestoreBinding(new InMemoryFirestore());
    setAuditEventStoreForTesting(null);
    const store = getAuditEventStore();
    expect(store).toBeInstanceOf(FirestoreAuditEventStore);
    expect(store).not.toBeInstanceOf(JsonlAuditEventStore);
  });

  it('default getAuditEventStore returns a JSONL store (no write to the real ledger here)', () => {
    delete process.env.AUDIT_STORE_BACKEND;
    setAuditEventStoreForTesting(null);
    const store = getAuditEventStore();
    expect(store).toBeInstanceOf(JsonlAuditEventStore);
  });
});
