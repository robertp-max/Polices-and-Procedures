/**
 * P1-D Phase 5 — Firestore EMULATOR-backed validation of the REAL Firebase
 * Admin adapter (firebase-admin → AdminFirestoreAdapter → FirestoreAuditEventStore).
 *
 * Runs against the real Firestore emulator only. NOT the in-memory fake, NOT
 * real dev Firestore, NOT a deployed multi-instance runtime. In the ordinary
 * server test run (no emulator env) the suite SKIPS. Under the dedicated gate
 * (AUDIT_EMULATOR_GATE=1) the preconditions are asserted and the suite runs
 * with zero skips; a misconfigured host/project FAILS rather than contacting
 * real Google Cloud.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initAdminFirestore, _resetAdminFirestore } from './firebaseAdmin.js';
import { FirestoreAuditEventStore } from './firestoreStore.js';
import type { AuditEventInput } from './eventModel.js';

const GATE = process.env.AUDIT_EMULATOR_GATE === '1';
const HAVE_EMU = !!process.env.FIRESTORE_EMULATOR_HOST;
const EMULATOR_PROJECT = 'careindeed-audit-emulator';
const runSuite = (GATE || HAVE_EMU) ? describe : describe.skip;

/** Fail-closed preconditions — never let a typo contact real Google Cloud. */
function assertEmulatorPreconditions(): void {
  const host = process.env.FIRESTORE_EMULATOR_HOST ?? '';
  if (!host) throw new Error('FIRESTORE_EMULATOR_HOST is not set — refusing to run (would contact real Firestore).');
  const hostname = host.split(':')[0];
  const loopback = hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1' || hostname === '[::1]';
  if (!loopback) throw new Error(`FIRESTORE_EMULATOR_HOST host "${hostname}" is not loopback — refusing (unrecognized emulator target).`);
  const project = process.env.GOOGLE_CLOUD_PROJECT ?? '';
  if (project !== EMULATOR_PROJECT) throw new Error(`GOOGLE_CLOUD_PROJECT must be the emulator-only project "${EMULATOR_PROJECT}", got "${project}".`);
  if (process.env.AUDIT_STORE_BACKEND !== 'firestore') throw new Error('AUDIT_STORE_BACKEND must be "firestore" for the emulator gate.');
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error('GOOGLE_APPLICATION_CREDENTIALS must NOT be set for the emulator path (no real ADC).');
}

function input(stream: string, over: Partial<AuditEventInput> = {}): AuditEventInput {
  return { event_type: 'user_access', stream, actor: { type: 'user', user_id: 'u' }, action: 'a', resource: { type: 'user', id: 'r' }, ...over };
}
const S = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

runSuite('Firestore emulator — real Admin adapter', () => {
  let store: FirestoreAuditEventStore;

  beforeAll(() => {
    assertEmulatorPreconditions();
    store = new FirestoreAuditEventStore(initAdminFirestore(), { pageSize: 7 });
  });
  afterAll(() => { _resetAdminFirestore(); });

  it('preconditions satisfied (loopback emulator, isolated project, no ADC)', () => {
    expect(() => assertEmulatorPreconditions()).not.toThrow();
  });

  it('init is singleton — repeated construction reuses one Admin app', () => {
    const a = initAdminFirestore();
    const b = initAdminFirestore();
    expect(a).toBe(b);
  });

  it('first append: sequence 1, GENESIS prev, canon_version 2', async () => {
    const e = await store.append(input(S('first')));
    expect(e.sequence).toBe(1);
    expect(e.prev_hash).toBe('GENESIS');
    expect(e.canon_version).toBe(2);
  });

  it('create-only immutability: second event takes next seq; first is never overwritten', async () => {
    const s = S('imm');
    const a = await store.append(input(s));
    const b = await store.append(input(s));
    expect([a.sequence, b.sequence]).toEqual([1, 2]);
    const rep = await store.verifyChainsDetailed(s);
    expect(rep.ok).toBe(true);
    expect(rep.results.map(r => r.sequence)).toEqual([1, 2]);
  });

  it('idempotency: repeated key returns the same event', async () => {
    const s = S('idem');
    const r = await Promise.all(Array.from({ length: 6 }, () => store.append(input(s, { idempotency_key: 'k' }))));
    expect(new Set(r.map(e => e.event_id)).size).toBe(1);
    expect((await store.verifyChainsDetailed(s)).results).toHaveLength(1);
  });

  it('idempotency conflict: reused key with altered input returns the ORIGINAL event (documented contract)', async () => {
    const s = S('idemconf');
    const first = await store.append(input(s, { idempotency_key: 'k', decision: 'permit' }));
    const second = await store.append(input(s, { idempotency_key: 'k', decision: 'deny', payload: { changed: true } }));
    // Idempotency is keyed by (stream, idempotency_key): the reservation wins and
    // the original event is returned; the conflicting input does NOT create a 2nd event.
    expect(second.event_id).toBe(first.event_id);
    expect(second.decision).toBe('permit');
    expect((await store.verifyChainsDetailed(s)).results).toHaveLength(1);
  });

  it('single-stream concurrency: 100 concurrent appends → sequences 1..100, chain verifies', async () => {
    const s = S('conc100');
    await Promise.all(Array.from({ length: 100 }, () => store.append(input(s))));
    const rep = await store.verifyChainsDetailed(s);
    expect(rep.ok).toBe(true);
    expect(rep.results.map(r => r.sequence)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
    expect(new Set(rep.results.map(r => r.sequence)).size).toBe(100);
  }, 120_000);

  it('cross-stream concurrency: 10 streams x 20 appends stay isolated and ordered', async () => {
    const streams = Array.from({ length: 10 }, (_, i) => S(`xs${i}`));
    await Promise.all(streams.flatMap(s => Array.from({ length: 20 }, () => store.append(input(s)))));
    for (const s of streams) {
      const rep = await store.verifyChainsDetailed(s);
      expect(rep.ok).toBe(true);
      expect(rep.results.map(r => r.sequence)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    }
  }, 120_000);

  it('bounded pagination returns the full ordered chain across pages (pageSize=7)', async () => {
    const s = S('page');
    for (let i = 0; i < 23; i++) await store.append(input(s));
    const rep = await store.verifyChainsDetailed(s);
    expect(rep.results.map(r => r.sequence)).toEqual(Array.from({ length: 23 }, (_, i) => i + 1));
    expect(rep.ok).toBe(true);
  }, 60_000);

  it('chain verification detects stored-event tampering', async () => {
    const s = S('tamper');
    await store.append(input(s));
    await store.append(input(s));
    const all = await store.readAll();
    const target = all.find(e => e.stream === s && e.sequence === 1)!;
    const rep = await store.verifyChainsDetailed(s);
    // Baseline verifies; tampering is a client-side detection over the returned events.
    expect(rep.ok).toBe(true);
    const tamperedList = (await store.readAll()).filter(e => e.stream === s).map(e => e.event_id === target.event_id ? { ...e, event_hash: 'f'.repeat(64) } : e);
    const { verifyChainDetailed } = await import('./eventModel.js');
    expect(verifyChainDetailed(tamperedList, s).ok).toBe(false);
  });

  it('rejects PHI-bearing payloads', async () => {
    await expect(store.append(input(S('phi'), { payload: { patient_name: 'Jane' } }))).rejects.toBeTruthy();
  });

  it('document paths carry no raw stream/email/PHI (hashed ids only)', async () => {
    const stream = 'events/patient@example.com/PHI';
    const e = await store.append(input(stream));
    // The event is retrievable but the stream label never appears verbatim in a doc id.
    const { streamDocId } = await import('./firestoreStore.js');
    expect(streamDocId(stream)).toMatch(/^[0-9a-f]{64}$/);
    expect(streamDocId(stream)).not.toContain('@');
    expect(e.stream).toBe(stream); // stream is a field value, not a path segment
  });
});
