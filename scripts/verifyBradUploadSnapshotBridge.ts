/**
 * verifyBradUploadSnapshotBridge.ts
 *
 * Validates the fix for server/routes/brad.ts's report/event-packet/qapi-
 * minutes endpoints always calling getDemoSnapshot() even when a real
 * document had been uploaded for that event (the "shell packet" bug for the
 * server/ia/brad/* pipeline — see [[brad-mandated-event-intake]] memory).
 *
 * 1. With no upload for an event, resolveBradSnapshot() must equal the
 *    unmodified demo snapshot (no behavior change for the untouched path).
 * 2. With a real (messy, prose+JSON) upload for an event, resolveBradSnapshot()
 *    must return metrics/pips/incidents DERIVED from that upload, not the
 *    hardcoded demo fixture values, and must record real provenance.
 * 3. An uploaded PDF (no approved server-side text extractor here) must
 *    degrade honestly (falls back to the demo snapshot fields, not invented
 *    values) rather than crash or silently fabricate content.
 *
 * Usage: npx tsx scripts/verifyBradUploadSnapshotBridge.ts   (exit 0 pass, 1 fail)
 */
import { getDemoSnapshot } from '../server/ia/brad/demoSnapshot.js';
import { getUploadStore } from '../server/ia/brad/uploads.js';
import { resolveBradSnapshot } from '../server/ia/brad/uploadSnapshotBridge.js';

let failures = 0;
function check(label: string, cond: boolean) {
  console.log(`${cond ? '[PASS]' : '[FAIL]'} ${label}`);
  if (!cond) failures++;
}

const EVENT_A = `verify-brad-bridge-${Date.now()}-a`;
const EVENT_B = `verify-brad-bridge-${Date.now()}-b`;
const EVENT_C = `verify-brad-bridge-${Date.now()}-c`;

// 1. No upload for this event -> unchanged demo snapshot.
{
  const base = getDemoSnapshot(EVENT_A);
  const resolved = resolveBradSnapshot(EVENT_A);
  check('no upload -> resolveBradSnapshot returns the unmodified demo snapshot', JSON.stringify(base) === JSON.stringify(resolved));
}

// 2. Real messy upload (prose + embedded JSON, mirrors the actual reported bug file).
{
  const messyText = `🔥 Care Indeed mock QAPI export
${JSON.stringify({
  kpis: [{ name: 'Acute care hospitalization', value: '18%', target: '<15%' }],
  pips: [{ id: 'PIP-9', title: 'Reduce falls', status: 'active' }],
  incidents: [{ id: 'INC-1', type: 'fall', severity: 'high', summary: 'Unwitnessed fall, minor injury' }],
})}
📊 trailing prose that breaks strict JSON.parse`;
  const store = getUploadStore();
  store.save({ filename: 'mock-qapi.json', mime: 'application/json', contentBase64: Buffer.from(messyText, 'utf8').toString('base64'), uploadedByUserId: 'verify-script', eventId: EVENT_B });

  const base = getDemoSnapshot(EVENT_B);
  const resolved = resolveBradSnapshot(EVENT_B);
  check('messy upload -> metrics come from the upload, not the demo fixture', resolved.metrics?.[0]?.name === 'Acute care hospitalization' && resolved.metrics?.[0]?.value === '18%');
  // 'active' (source text) has no direct SnapshotPip.status equivalent — it correctly
  // maps to 'open' (not closed/monitoring), per mergeUploadIntoSnapshot's mapping.
  check('messy upload -> pips come from the upload, not the demo fixture', resolved.pips?.[0]?.id === 'PIP-9' && resolved.pips?.[0]?.status === 'open');
  check('messy upload -> incidents come from the upload, not the demo fixture', resolved.incidents?.[0]?.type === 'fall' && resolved.incidents?.[0]?.severity === 'high');
  check('messy upload -> base event identity (eventId/workflowId) is preserved, not overwritten', resolved.eventId === base.eventId && resolved.workflowId === base.workflowId);
  check('messy upload -> provenance is recorded in followUps (auditable back to the real source)', resolved.followUps.some((f) => f.includes('mock-qapi.json') && f.includes('Derived')));
}

// 3. Binary upload with no approved extractor -> honest degrade, not a crash/invention.
{
  const store = getUploadStore();
  store.save({ filename: 'scan.pdf', mime: 'application/pdf', contentBase64: Buffer.from('%PDF-1.4 fake bytes').toString('base64'), uploadedByUserId: 'verify-script', eventId: EVENT_C });
  const base = getDemoSnapshot(EVENT_C);
  let resolved;
  let threw = false;
  try {
    resolved = resolveBradSnapshot(EVENT_C);
  } catch {
    threw = true;
  }
  check('PDF upload with no server-side extractor does not throw', !threw);
  check('PDF upload -> metrics/pips/incidents fall back to the base snapshot (not invented)', JSON.stringify(resolved?.metrics) === JSON.stringify(base.metrics) && JSON.stringify(resolved?.pips) === JSON.stringify(base.pips));
  check('PDF upload -> provenance note explains no extractable text, not silently ignored', !!resolved?.followUps.some((f) => f.includes('scan.pdf') && f.includes('No extractable text')));
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll checks passed.');
}
