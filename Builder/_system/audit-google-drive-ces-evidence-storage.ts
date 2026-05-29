/* ═══════════════════════════════════════════════════════════════════
   Google Drive CES evidence storage audit (Part 12).

   Verifies the locked CES storage architecture:
   files/artifacts → Google Drive, indexed by Google Calendar; non-PHI
   metadata/pointers → CES backend (DynamoDB/file-local). Checks:

     1.  Required CES + Drive evidence files exist.
     2.  Evidence pointers carry the google_drive_calendar provider.
     3.  Every evidence record has the required IDs (event/task/drive file).
     4.  Form evidence binds formId + formInstanceId.
     5.  Supporting documentation binds supportTaskId or requirementId.
     6.  Evidence ids are deterministic + de-duplicated (no duplicate attach).
     7.  No PHI in Drive filenames/folder names.
     8.  No PHI in Calendar extendedProperties (allowlist enforced).
     9.  No public ("anyone with link") Drive sharing by default.
     10. Attachment/content status is honest (no faked completion).
     11. NO file bytes in CES metadata (DynamoDB) — pointer-only.
     12. S3 is NOT used for CES artifact files; localStorage is NOT a CES
         provider; only completed signed artifacts are published to Drive.

   Run with: tsx Builder/_system/audit-google-drive-ces-evidence-storage.ts
   ═══════════════════════════════════════════════════════════════════ */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildEvidenceId,
  dedupeEvidenceRefs,
  buildLightweightExtendedProperties,
  extendedPropertiesHavePhi,
  looksLikePhiName,
  sanitizeName,
  validateEvidenceRef,
  type GoogleCalendarDriveEvidenceRef,
} from '../../server/googleEvidence.js';
import { assertNoFileBytes } from '../../server/cesMetadataStore.js';

const failures: string[] = [];
const notes: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}
const root = process.cwd();
const readSrc = (rel: string) => readFileSync(resolve(root, rel), 'utf8');

/* ── 1. Required files exist ─────────────────────────────────────── */
const requiredFiles = [
  'server/googleDrive.ts',
  'server/googleEvidence.ts',
  'server/googleCalendar.ts',
  'server/cesMetadataStore.ts',
  'server/routes/ces.ts',
  'server/routes/calendar.ts',
  'src/policy/evidence/storageProviders/types.ts',
  'src/policy/services/evidenceApi.ts',
];
requiredFiles.forEach(f => assert(existsSync(resolve(root, f)), `(1) Missing required file: ${f}`));

const typesSrc = readSrc('src/policy/evidence/storageProviders/types.ts');
const storeSrc = readSrc('server/cesMetadataStore.ts');
const calRouteSrc = readSrc('server/routes/calendar.ts');
const driveSrc = readSrc('server/googleDrive.ts');
const evidenceSrc = readSrc('server/googleEvidence.ts');
const calSrc = readSrc('server/googleCalendar.ts');

/* ── 2. Pointers carry the google_drive_calendar provider ────────── */
assert(/storageProvider:\s*'google_drive_calendar'/.test(typesSrc), '(2) GoogleDriveEvidenceRef must declare provider google_drive_calendar.');
assert(/storageProvider:\s*'google_drive_calendar'/.test(storeSrc), '(2) CES evidence pointer must persist provider google_drive_calendar.');

/* ── Fixtures ────────────────────────────────────────────────────── */
function makeRef(over: Partial<GoogleCalendarDriveEvidenceRef> = {}): GoogleCalendarDriveEvidenceRef {
  return {
    storageProvider: 'google_calendar_drive',
    eventId: 'evt-1', workflowId: 'WF-1', taskId: 'WF-1-STEP-2',
    calendarEventId: 'gcal_1', driveFileId: 'drive_1',
    driveFileUrl: 'https://drive.google.com/file/d/drive_1/view',
    driveFolderId: 'folder_1', mimeType: 'application/pdf', title: 'evidence',
    uploadedAt: new Date().toISOString(), attachmentStatus: 'attached', contentStatus: 'available',
    ...over,
  };
}

/* ── 3. Required IDs ─────────────────────────────────────────────── */
assert(validateEvidenceRef(makeRef()).length === 0, '(3) Complete evidence ref must validate clean.');
assert(validateEvidenceRef(makeRef({ eventId: '' })).some(p => p.includes('eventId')), '(3) Missing eventId rejected.');
assert(validateEvidenceRef(makeRef({ driveFileId: '' })).some(p => p.includes('driveFileId')), '(3) Missing driveFileId rejected.');
assert(validateEvidenceRef(makeRef({ taskId: '' })).some(p => p.includes('taskId')), '(3) Missing taskId rejected.');

/* ── 4. Form evidence binds formId + formInstanceId ──────────────── */
assert(validateEvidenceRef(makeRef({ formId: 'F1', formInstanceId: 'FI1' })).length === 0, '(4) Valid form evidence passes.');
assert(validateEvidenceRef(makeRef({ formId: 'F1' })).some(p => p.includes('formInstanceId')), '(4) Form evidence without formInstanceId rejected.');

/* ── 5. Supporting documentation binding ─────────────────────────── */
assert(validateEvidenceRef(makeRef({ title: 'Supporting documentation', supportTaskId: 'SUP1' })).length === 0, '(5) Valid supporting documentation passes.');
assert(validateEvidenceRef(makeRef({ title: 'Supporting documentation' })).some(p => p.includes('supportTaskId') || p.includes('evidenceRequirementId')), '(5) Supporting doc without id rejected.');

/* ── 6. Deterministic + de-duplicated evidence ids ───────────────── */
const a = buildEvidenceId({ eventId: 'E', taskId: 'T', driveFileId: 'F' });
const b = buildEvidenceId({ eventId: 'E', taskId: 'T', driveFileId: 'F' });
assert(a === b, '(6) Evidence id must be deterministic.');
assert(dedupeEvidenceRefs([makeRef(), makeRef(), makeRef({ driveFileId: 'drive_2' })]).length === 2, '(6) Duplicate refs de-duplicated.');
// Backend store dedupes by driveFileId / evidenceId.
assert(/r\.driveFileId !== ref\.driveFileId/.test(storeSrc), '(6) CES store must dedupe evidence by driveFileId.');

/* ── 7. No PHI in Drive filenames/folder names ───────────────────── */
assert(looksLikePhiName('patient-jane-doe.pdf'), '(7) PHI detector flags patient-name filenames.');
assert(!looksLikePhiName('WF-1-STEP-2'), '(7) System IDs not flagged as PHI.');
assert(!/[/\\?%*:|"<>]/.test(sanitizeName('a/b:c*d')), '(7) sanitizeName strips unsafe characters.');
assert(/looksLikePhiName\(safeFileName\)\s*\|\|\s*looksLikePhiName\(input\.title\)/.test(evidenceSrc), '(7) Upload path rejects PHI-bearing names.');

/* ── 8. No PHI in Calendar extendedProperties ────────────────────── */
const props = buildLightweightExtendedProperties({
  eventId: 'E', workflowId: 'WF', driveFolderId: 'folder_1', attachmentCount: 2,
  ...({ patientName: 'John Doe', mrn: 'MRN-1' } as Record<string, never>),
});
assert(!extendedPropertiesHavePhi(props), '(8) extendedProperties must not contain PHI.');
assert(!('patientName' in props) && !('mrn' in props), '(8) Non-allowlisted PHI keys stripped.');
assert(/const ALLOWED = new Set\(\[/.test(calSrc), '(8) extendedProperties allowlist enforced in source.');

/* ── 9. No public Drive sharing by default ───────────────────────── */
assert(!/permissions\.create/.test(driveSrc) && !/permissions\.create/.test(evidenceSrc), '(9) No Drive sharing permissions created by default.');
assert(!/type:\s*['"]anyone['"]/.test(driveSrc), '(9) No "anyone with link" Drive access.');

/* ── 10. Honest attachment/content status ────────────────────────── */
assert(validateEvidenceRef(makeRef({ attachmentStatus: 'attached', contentStatus: 'missing' })).some(p => p.includes('dishonest')), '(10) attached + missing flagged dishonest.');
assert(validateEvidenceRef(makeRef({ attachmentStatus: 'pending_attach', contentStatus: 'metadata_only' })).length === 0, '(10) Honest pending/metadata-only allowed.');

/* ── 11. No file bytes in CES metadata (pointer-only) ────────────── */
let rejectedBytes = false;
try { assertNoFileBytes({ ref: { driveFileId: 'f', localDataUrl: 'data:...' } }, 'test'); } catch { rejectedBytes = true; }
assert(rejectedBytes, '(11) CES metadata must reject file bytes (localDataUrl/blobs).');
assert(/FORBIDDEN_METADATA_FIELDS/.test(storeSrc), '(11) CES store must declare a forbidden-file-byte field list.');
assert(/assertNoFileBytes/.test(storeSrc), '(11) CES store must guard every write with assertNoFileBytes.');

/* ── 12. No S3 for CES artifact files; localStorage not a provider;
        only completed signed artifacts published to Drive ───────── */
assert(!/['"]local[_-]?storage['"]/i.test(typesSrc), '(12) localStorage must not be a CES storage provider (no provider literal).');
assert(!/S3|PutObject|aws-sdk\/client-s3/.test(storeSrc), '(12) CES metadata store must not write artifact files to S3.');
assert(/completed\s*!==\s*true/.test(calRouteSrc), '(12) signed-artifact/publish must require completed:true (no drafts to Drive).');
assert(/signed-artifact\/publish/.test(calRouteSrc), '(12) signed-artifact/publish endpoint must exist.');

notes.push(`Validated ${requiredFiles.length} files, provider contract, PHI guards, pointer-only metadata, and S3/localStorage prohibitions.`);

/* ── Report ──────────────────────────────────────────────────────── */
console.log('Google Drive CES Evidence Storage Audit');
notes.forEach(n => console.log(`- ${n}`));
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('\nAll Google Drive CES evidence storage validations passed.');
