/**
 * P1-D Phase 6 — separate-process multi-instance simulation (emulator-backed).
 *
 * Spawns 4 independent Node processes (via tsx), each with its own
 * firebase-admin client, all appending to ONE shared audit stream in the
 * Firestore emulator: 100 unique appends (25/process) + 20 duplicate
 * idempotency requests distributed across processes. Verifies exactly 100
 * unique committed events, contiguous sequences 1..100, a verified chain, and
 * that duplicates collapsed. Emulator-backed only — NOT deployed Cloud Run.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initAdminFirestore, _resetAdminFirestore } from './firebaseAdmin.js';
import { FirestoreAuditEventStore } from './firestoreStore.js';

const GATE = process.env.AUDIT_EMULATOR_GATE === '1';
const HAVE_EMU = !!process.env.FIRESTORE_EMULATOR_HOST;
const runSuite = (GATE || HAVE_EMU) ? describe : describe.skip;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER = path.resolve(__dirname, '../../../scripts/auditEmulatorWorker.ts');
const REPO = path.resolve(__dirname, '../../..');

function runWorker(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn('npx', ['tsx', WORKER, ...args], {
      cwd: REPO, env: { ...process.env }, stdio: 'inherit', shell: process.platform === 'win32',
    });
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

runSuite('Firestore emulator — cross-process concurrency', () => {
  beforeAll(() => {
    if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('cross-process gate requires FIRESTORE_EMULATOR_HOST');
  });
  afterAll(() => { _resetAdminFirestore(); });

  it('4 processes x 25 unique + 20 distributed duplicates → exactly 100 committed, chain intact', async () => {
    const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    // 100 unique keys evt-000..evt-099, 25 per process. Each process also re-issues
    // 5 keys owned by the NEXT process (20 duplicate requests total).
    const dupFor = (proc: number) => {
      const nextOwnerStart = ((proc + 1) % 4) * 25;
      return Array.from({ length: 5 }, (_, i) => `evt-${String(nextOwnerStart + i).padStart(3, '0')}`);
    };
    const codes = await Promise.all(
      [0, 1, 2, 3].map(p => runWorker([runId, String(p), String(p * 25), '25', dupFor(p).join(',')])),
    );
    expect(codes).toEqual([0, 0, 0, 0]);

    const store = new FirestoreAuditEventStore(initAdminFirestore());
    const stream = `xproc-${runId}`;
    const rep = await store.verifyChainsDetailed(stream);
    expect(rep.results).toHaveLength(100);                 // exactly 100 unique committed
    expect(rep.ok).toBe(true);                             // all v2 hashes + prior links verify
    const seqs = rep.results.map(r => r.sequence).sort((a, b) => a - b);
    expect(seqs).toEqual(Array.from({ length: 100 }, (_, i) => i + 1)); // 1..100, no gap/dup

    // Each of the 100 idempotency keys resolves to exactly one event.
    const events = await store.readAll();
    const forStream = events.filter(e => e.stream === stream);
    const keys = new Set(forStream.map(e => e.idempotency_key));
    expect(keys.size).toBe(100);
  }, 180_000);
});
