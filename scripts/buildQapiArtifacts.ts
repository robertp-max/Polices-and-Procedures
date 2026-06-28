// Demonstrate the QAPI engine end-to-end over the mock dump.
// Run: npx tsx scripts/buildQapiArtifacts.ts
import { readFileSync, writeFileSync } from 'node:fs';
import {
  extractQapiRollup, buildPersonnelAddendum, buildAddendumReference, renderPersonnelAddendumHtml,
  needsPersonnelAddendum, buildQapiDateWindow, validateDateWindow, validateQapiPacketForLock,
  renderQapiPacketHtml,
  type ClinicalDump,
} from '../src/policy/qapi/index';

const dump = JSON.parse(readFileSync('output/clients.q1q2-2026.mock.json', 'utf8')) as ClinicalDump;

const rollMay = extractQapiRollup(dump, '2026-05-07');                       // interim
const rollJul = extractQapiRollup(dump, '2026-07-10', { reviewQuarter: '2026-Q2' }); // final
const addendum = buildPersonnelAddendum(dump);
const ref = buildAddendumReference(addendum);

writeFileSync('output/QAPI-HR-ADDENDUM-2026-Q2.html', renderPersonnelAddendumHtml(addendum), 'utf8');

// Main packet — interim (May 7) and final (Jul 10) variants.
const packetOpts = {
  eventId: 'qapi_meeting-20260507-08', workflowId: 'QA-WF-03', reviewQuarter: '2026-Q2',
  preparedBy: 'Riley RN, Clinical Manager', reviewer: 'Dakota Director, DON', chair: 'Dakota Director, DON', recorder: 'Avery Admin',
  policyIds: ['QA-PP-001', 'QA-PP-004'],
  approvers: [
    { role: 'Director of Nursing (DON)', name: 'Dakota Director', authorityConfirmed: true },
    { role: 'Administrator', name: 'Avery Admin', authorityConfirmed: true },
    { role: 'Compliance Officer', name: 'Cameron Compliance', authorityConfirmed: true },
    { role: 'Governing Body Chair', name: 'Morgan Board', authorityConfirmed: true },
  ],
};
writeFileSync('output/QAPI-Q2-PACKET-interim-may7.html', renderQapiPacketHtml(dump, '2026-05-07', packetOpts), 'utf8');
writeFileSync('output/QAPI-Q2-PACKET-final-jul10.html', renderQapiPacketHtml(dump, '2026-07-10', packetOpts), 'utf8');
writeFileSync('output/qapi-q2-rollup.json', JSON.stringify({
  interim_may7: { window: rollMay.window, census: rollMay.census, highRisk: rollMay.highRisk, incidents: rollMay.incidents, infections: rollMay.infections, labs: rollMay.labs, documentation: rollMay.documentation, exceptionCount: rollMay.exceptions.length },
  final_jul10: { window: rollJul.window, census: rollJul.census, incidents: rollJul.incidents, infections: rollJul.infections, exceptionCount: rollJul.exceptions.length },
  addendumReference: ref,
}, null, 2), 'utf8');

// Show the lock gate refusing a deliberately-bad May-7 "final" attempt with June data + placeholder.
const badEvents = (dump.incidents ?? []).map((i) => ({ id: i.incident_id, date: i.date_of_incident, kind: 'incident' }));
const winFinalAttempt = buildQapiDateWindow('2026-05-07', { reviewQuarter: '2026-Q2' }); // forced interim → June events violate
const dwv = validateDateWindow({ ...winFinalAttempt, dataThroughDate: '2026-05-07' }, badEvents);
const lock = validateQapiPacketForLock({
  packetId: 'QAPI-Q2-BAD',
  html: 'Active census: Please use Evidence Studio to enter the rollup. Approver: TBD.',
  governanceRoles: [{ role: 'DON', name: 'TBD', authorityConfirmed: false }],
  rollups: { activeCensus: null, recertCounts: null, highRiskRollupPresent: false, priorPeriodComparisonPresent: false, claimsTrend: true },
  signatures: [{ role: 'DON', rendered: true, signerRecord: null }],
  dateWindowViolations: dwv,
  addendum: { required: needsPersonnelAddendum(dump), generatedId: null },
  sourceExceptions: rollJul.exceptions,
});

console.log('── QAPI artifacts ──');
console.log('addendum actions:', addendum.actions.length, '| categories:', Object.keys(addendum.countByCategory).join(', '));
console.log('addendum ref (packet-safe):', JSON.stringify(ref));
console.log('interim May-7 window:', rollMay.window.packetType, rollMay.window.dataThroughDate, '| excluded future incidents:', rollMay.incidents.excludedFutureDated, 'infections:', rollMay.infections.excludedFutureDated);
console.log('final Jul-10 window:', rollJul.window.packetType, rollJul.window.dataThroughDate);
console.log('census (final):', JSON.stringify(rollJul.census));
console.log('date-window violations on forced May-7 final:', dwv.length);
console.log('LOCK GATE pass?', lock.pass, '— blocking findings:', lock.findings.filter((f) => f.severity === 'blocker' || f.severity === 'high').length);
console.log('  sample findings:', lock.findings.slice(0, 6).map((f) => `[${f.severity}] ${f.path}: ${f.reason}`));
console.log('wrote output/QAPI-HR-ADDENDUM-2026-Q2.html + output/qapi-q2-rollup.json');
