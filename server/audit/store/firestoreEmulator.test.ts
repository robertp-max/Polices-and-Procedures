/**
 * P1-C — Firestore EMULATOR-backed validation.
 *
 * Runs ONLY when FIRESTORE_EMULATOR_HOST is set (and the emulator is up). It
 * exercises the concrete Firebase Admin adapter against a real Firestore
 * transaction engine — NOT the in-memory fake, NOT real dev Firestore, NOT a
 * deployed multi-instance runtime. When the emulator is absent the whole suite
 * SKIPS (reported UNPROVEN, never falsely PASS).
 *
 * To run locally:
 *   gcloud emulators firestore start --host-port=127.0.0.1:8181   (requires Java)
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8181 GOOGLE_CLOUD_PROJECT=cihh-audit-emu \
 *     npx vitest run --config vitest.server.config.ts server/audit/store/firestoreEmulator.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initAdminFirestore, _resetAdminFirestore } from './firebaseAdmin.js';
import { FirestoreAuditEventStore } from './firestoreStore.js';
import type { AuditEventInput } from './eventModel.js';

const EMULATOR = !!process.env.FIRESTORE_EMULATOR_HOST;
const suite = EMULATOR ? describe : describe.skip;

function input(stream: string, over: Partial<AuditEventInput> = {}): AuditEventInput {
  return { event_type: 'user_access', stream, actor: { type: 'user', user_id: 'u' }, action: 'a', resource: { type: 'user', id: 'r' }, ...over };
}

suite('FirestoreAuditEventStore — emulator-backed', () => {
  let store: FirestoreAuditEventStore;

  beforeAll(() => {
    if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = 'cihh-audit-emu';
    store = new FirestoreAuditEventStore(initAdminFirestore(), { pageSize: 3 });
  });
  afterAll(() => { _resetAdminFirestore(); });

  const S = () => `emu-${Math.random().toString(36).slice(2, 8)}`;

  it('first append is sequence 1 from GENESIS', async () => {
    const e = await store.append(input(S()));
    expect(e.sequence).toBe(1);
    expect(e.prev_hash).toBe('GENESIS');
    expect(e.canon_version).toBe(2);
  });

  it('concurrent appends to one stream get unique sequences (real transaction retries)', async () => {
    const s = S();
    await Promise.all(Array.from({ length: 15 }, () => store.append(input(s))));
    const seqs = (await store.verifyChainsDetailed(s)).results.map(r => r.sequence).sort((a, b) => a - b);
    expect(new Set(seqs).size).toBe(15);
    expect((await store.verifyChainsDetailed(s)).ok).toBe(true);
  });

  it('concurrent appends across streams stay independent', async () => {
    const a = S(); const b = S();
    await Promise.all([...Array(5)].flatMap(() => [store.append(input(a)), store.append(input(b))]));
    expect((await store.verifyChainsDetailed(a)).ok).toBe(true);
    expect((await store.verifyChainsDetailed(b)).ok).toBe(true);
  });

  it('repeated idempotency key returns the same event', async () => {
    const s = S();
    const results = await Promise.all(Array.from({ length: 5 }, () => store.append(input(s, { idempotency_key: 'k' }))));
    expect(new Set(results.map(e => e.event_id)).size).toBe(1);
  });

  it('create-only immutability: sequence docs are never overwritten', async () => {
    const s = S();
    await store.append(input(s));
    await store.append(input(s));
    const rep = await store.verifyChainsDetailed(s);
    expect(rep.results.map(r => r.sequence)).toEqual([1, 2]);
    expect(rep.ok).toBe(true);
  });

  it('bounded pagination returns the full ordered chain (pageSize=3)', async () => {
    const s = S();
    for (let i = 0; i < 7; i++) await store.append(input(s));
    const rep = await store.verifyChainsDetailed(s);
    expect(rep.results.map(r => r.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(rep.ok).toBe(true);
  });

  it('rejects PHI payloads', async () => {
    await expect(store.append(input(S(), { payload: { patient_name: 'Jane' } }))).rejects.toBeTruthy();
  });
});
