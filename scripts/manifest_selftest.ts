/* Unit-validates the manifest upsert logic against the REAL CSV. No network.
   Run: npx tsx scripts/manifest_selftest.ts "<path to CSV>" */
import { readFileSync } from 'node:fs';
import {
  parseManifest, serializeManifest, buildManifestRow, upsertRow, findRowIndex,
} from '../server/manifestCore.js';

const CSV = process.argv[2] || 'C:/Users/razer/Downloads/Manifesto - Drive File Links.csv';
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = '') => {
  if (cond) pass++;
  else fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'} · ${name}${extra ? ' · ' + extra : ''}`);
};

const text = readFileSync(CSV, 'utf8');
const base = parseManifest(text);
console.log(`Loaded manifest: ${base.rows.length} rows, ${base.header.length} columns`);
ok('header matches canonical', base.header[0] === 'Section / Root Folder' && base.header.includes('File ID') && base.header.includes('Notes'));

const NOW = '2026-06-28T12:00:00.000Z';
const pkt = buildManifestRow({
  section: 'Admission', fullFolderPath: 'Defensible Packets', folderId: '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0',
  displayName: 'Patient Admission Packet — Amara Eze-Chakraborty', rawFileName: 'ADM-PT001-2026-06-28.pdf',
  fileType: 'PDF', fileId: 'NEWFILEID_AMARA_001', driveLink: 'https://drive.google.com/file/d/NEWFILEID_AMARA_001/view', note: 'ADM-PT001-2026-06-28',
}, NOW);

// 1) Append new
const r1 = upsertRow(base.rows, pkt);
ok('first upsert APPENDS', r1.action === 'appended' && r1.rows.length === base.rows.length + 1);

// 2) Re-upsert SAME File ID (regeneration) → updates, NO duplicate
const pkt2 = buildManifestRow({ ...{
  section: 'Admission', fullFolderPath: 'Defensible Packets', folderId: '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0',
  displayName: 'Patient Admission Packet — Amara Eze-Chakraborty', rawFileName: 'ADM-PT001-2026-06-28.pdf',
  fileType: 'PDF', fileId: 'NEWFILEID_AMARA_001', driveLink: 'https://drive.google.com/file/d/NEWFILEID_AMARA_001/view', note: 'ADM-PT001-2026-06-28',
} }, '2026-06-28T13:30:00.000Z');
const r2 = upsertRow(r1.rows, pkt2);
ok('regeneration UPDATES (no duplicate)', r2.action === 'updated' && r2.rows.length === r1.rows.length);
ok('updated row reflects new Last Updated', r2.rows[r2.index]['Last Updated'] === '2026-06-28T13:30:00.000Z');
ok('exactly one row for the File ID', r2.rows.filter((x) => x['File ID'] === 'NEWFILEID_AMARA_001').length === 1);

// 3) Match by Full Folder Path + Raw File Name when File ID absent → updates + attaches File ID
const noId = buildManifestRow({
  section: 'Admission', fullFolderPath: 'Defensible Packets', folderId: '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0',
  displayName: 'Patient Admission Packet — Amara Eze-Chakraborty', rawFileName: 'ADM-PT001-2026-06-28.pdf',
  fileType: 'PDF', fileId: '', driveLink: '', note: 'path-match',
}, NOW);
const idxByPath = findRowIndex(r2.rows, noId);
ok('path+filename match finds the existing row', idxByPath === r2.index);

// 4) Round-trip: serialize → parse → counts + a known existing row intact
const round = parseManifest(serializeManifest(r2.rows));
ok('round-trip row count stable', round.rows.length === r2.rows.length);
const known = base.rows.find((x) => x['File Type'] === 'XLSX');
const knownAfter = known ? round.rows.find((x) => x['File ID'] === known['File ID']) : undefined;
ok('unrelated existing row preserved', !!known && !!knownAfter && knownAfter!['Raw File Name'] === known!['Raw File Name']);

// 5) User-entered note preserved across a system upsert
const withUserNote = r2.rows.map((x) => x['File ID'] === 'NEWFILEID_AMARA_001' ? { ...x, Notes: 'Reviewed by DON — keep' } : x);
const r5 = upsertRow(withUserNote, pkt2);
ok('user-entered Notes preserved', r5.rows[r5.index]['Notes'] === 'Reviewed by DON — keep');

// before/after example
console.log('\n── BEFORE/AFTER example (regeneration upsert) ──');
console.log('BEFORE Last Updated:', r1.rows[r1.index]['Last Updated'], '| hash', r2.beforeHash);
console.log('AFTER  Last Updated:', r2.rows[r2.index]['Last Updated'], '| hash', r2.afterHash);
console.log('AFTER  row:', JSON.stringify(r2.rows[r2.index]));

console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
