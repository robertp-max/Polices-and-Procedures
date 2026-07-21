/**
 * P1-D Phase 6 — cross-process emulator worker.
 *
 * Runs as an INDEPENDENT Node process (via tsx), initializes its own
 * firebase-admin app, connects to the shared Firestore emulator
 * (FIRESTORE_EMULATOR_HOST inherited from the parent), and appends to a shared
 * audit stream. Writes a process-local log OUTSIDE the repository. Exits
 * nonzero on any error so the orchestrator can fail the gate.
 *
 * argv: <runId> <procIndex> <uniqueStart> <uniqueCount> <dupKeysCsv>
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { initAdminFirestore } from '../server/audit/store/firebaseAdmin.js';
import { FirestoreAuditEventStore } from '../server/audit/store/firestoreStore.js';
import type { AuditEventInput } from '../server/audit/store/eventModel.js';

const [runId, procIndexRaw, uniqueStartRaw, uniqueCountRaw, dupKeysCsv = ''] = process.argv.slice(2);
const procIndex = Number(procIndexRaw);
const uniqueStart = Number(uniqueStartRaw);
const uniqueCount = Number(uniqueCountRaw);
const dupKeys = dupKeysCsv ? dupKeysCsv.split(',').filter(Boolean) : [];

const logDir = path.join(os.tmpdir(), 'careindeed-firestore-emulator', 'xproc-logs');
fs.mkdirSync(logDir, { recursive: true });
const logPath = path.join(logDir, `worker-${procIndex}.log`);
const log = (m: string) => fs.appendFileSync(logPath, `${new Date().toISOString()} ${m}\n`, 'utf8');

const stream = `xproc-${runId}`;
const key = (n: number) => `evt-${String(n).padStart(3, '0')}`;
function input(k: string): AuditEventInput {
  return {
    event_type: 'user_access', stream, idempotency_key: k,
    actor: { type: 'user', user_id: `p${procIndex}` }, action: 'x.append',
    resource: { type: 'user', id: 'r' }, payload: { key: k },
  };
}

async function main(): Promise<void> {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error('worker: FIRESTORE_EMULATOR_HOST not set');
  const store = new FirestoreAuditEventStore(initAdminFirestore());
  log(`start proc=${procIndex} unique=[${uniqueStart},${uniqueStart + uniqueCount}) dups=${dupKeys.length}`);
  // Unique appends (each a distinct idempotency key → a distinct committed event).
  for (let i = uniqueStart; i < uniqueStart + uniqueCount; i += 1) {
    const e = await store.append(input(key(i)));
    log(`unique ${key(i)} -> seq ${e.sequence} id ${e.event_id}`);
  }
  // Duplicate idempotency requests (keys owned by other processes) — must
  // resolve to the existing canonical event, creating no new event.
  for (const k of dupKeys) {
    const e = await store.append(input(k));
    log(`dup ${k} -> seq ${e.sequence} id ${e.event_id}`);
  }
  log(`done proc=${procIndex}`);
}

main().then(() => process.exit(0)).catch((e) => { log(`ERROR ${(e as Error).stack ?? e}`); process.exit(1); });
