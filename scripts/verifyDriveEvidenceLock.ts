/**
 * verifyDriveEvidenceLock.ts
 * Re-checkable audit of the LOCKED Google Drive evidence identity.
 * Confirms the live config (service account, project, shared drive, provider)
 * matches the canonical lock in server/env.ts. Reads only non-secret identity
 * fields of the credentials JSON — NEVER the private key.
 *
 * Run: npx tsx scripts/verifyDriveEvidenceLock.ts   (exit 0 = locked & matching)
 */
import { assertDriveEvidenceLock, DRIVE_EVIDENCE_LOCK } from '../server/env.js';

const r = assertDriveEvidenceLock({ throwOnMismatch: false });

console.log('=== Google Drive Evidence — Lock Check ===\n');
console.log('Locked canonical identity (server/env.ts → DRIVE_EVIDENCE_LOCK):');
for (const [k, v] of Object.entries(DRIVE_EVIDENCE_LOCK)) console.log(`  ${k.padEnd(20)} ${v}`);
console.log('\nLive config:');
for (const [k, v] of Object.entries(r.info)) console.log(`  ${k.padEnd(20)} ${v}`);
console.log(`\nEnforced at boot (key present + evidence enabled): ${r.enforced ? 'YES (fail-closed on drift)' : 'no (credentials absent or evidence disabled)'}`);

if (r.ok) {
  console.log('\n✅ LOCK OK — the live Drive config matches the locked canonical identity.');
  process.exit(0);
}
console.log('\n❌ CONFIG DRIFT — these differ from the lock:');
r.problems.forEach((p) => console.log('  - ' + p));
process.exit(1);
