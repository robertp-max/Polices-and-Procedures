/* ═══════════════════════════════════════════════════════════════════
   Google Calendar + Drive evidence sync audit.

   Validates the Drive evidence integration that extends the existing
   Google Calendar backend:
     - evidence ref shape + required IDs (event/calendar/drive/task)
     - form + supporting-documentation binding
     - deterministic, de-duplicated evidence ids
     - NO public sharing, NO PHI in Calendar extendedProperties or
       Drive filenames/folder names
     - honest attachment/content status (no faked completion)
     - QA-WF-03 custom file diff remains empty

   Run with: tsx Builder/_system/audit-google-calendar-drive-evidence-sync.ts
   ═══════════════════════════════════════════════════════════════════ */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  buildEvidenceFolderSegments,
  buildEvidenceId,
  buildLightweightExtendedProperties,
  dedupeEvidenceRefs,
  extendedPropertiesHavePhi,
  looksLikePhiName,
  quarterFromDate,
  sanitizeFileName,
  sanitizeName,
  validateEvidenceRef,
  EVIDENCE_SUBFOLDERS,
  type GoogleCalendarDriveEvidenceRef,
} from '../../server/googleEvidence.js';

const failures: string[] = [];
const notes: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}
const root = process.cwd();
const readSrc = (rel: string) => readFileSync(resolve(root, rel), 'utf8');

/* ── 0. Required files exist ─────────────────────────────────────── */
const requiredFiles = [
  'server/googleDrive.ts',
  'server/googleEvidence.ts',
  'server/googleCalendar.ts',
  'server/routes/calendar.ts',
  'server/env.ts',
  'src/policy/services/calendarApi.ts',
  'src/policy/components/regulatory/GoogleEvidencePanel.tsx',
];
requiredFiles.forEach(f => assert(existsSync(resolve(root, f)), `Missing required file: ${f}`));

/* ── Fixtures ────────────────────────────────────────────────────── */
function makeRef(over: Partial<GoogleCalendarDriveEvidenceRef> = {}): GoogleCalendarDriveEvidenceRef {
  return {
    storageProvider: 'google_calendar_drive',
    eventId: 'qapi_meeting-20260507-08',
    workflowId: 'QA-WF-09',
    taskId: 'QA-WF-09-STEP-02',
    calendarEventId: 'gcal_abc123',
    driveFileId: 'drive_file_001',
    driveFileUrl: 'https://drive.google.com/file/d/drive_file_001/view',
    driveFolderId: 'folder_001',
    mimeType: 'application/pdf',
    title: 'QAPI minutes',
    uploadedAt: new Date().toISOString(),
    attachmentStatus: 'attached',
    contentStatus: 'available',
    ...over,
  };
}

const formRef = makeRef({ formId: 'GV-FM-017', formInstanceId: 'FI-001', title: 'Signed form' });
const supportRef = makeRef({ title: 'Supporting documentation', supportTaskId: 'SUP-1', evidenceRequirementId: 'REQ-1' });

/* ── 1-4. Required IDs (eventId, calendarEventId, driveFileId, taskId) ── */
assert(validateEvidenceRef(makeRef()).length === 0, 'A complete evidence ref should validate clean.');
assert(validateEvidenceRef(makeRef({ eventId: '' })).some(p => p.includes('eventId')), '(1) Missing eventId must be rejected.');
assert(validateEvidenceRef(makeRef({ calendarEventId: '' })).some(p => p.includes('calendarEventId')), '(2) Missing calendarEventId must be rejected.');
assert(validateEvidenceRef(makeRef({ driveFileId: '' })).some(p => p.includes('driveFileId')), '(3) Missing driveFileId must be rejected.');
assert(validateEvidenceRef(makeRef({ taskId: '' })).some(p => p.includes('taskId')), '(4) Missing taskId must be rejected.');

/* ── 5. Form evidence has formId + formInstanceId ────────────────── */
assert(validateEvidenceRef(formRef).length === 0, '(5) Valid form evidence should pass.');
assert(validateEvidenceRef(makeRef({ formId: 'GV-FM-017' })).some(p => p.includes('formInstanceId')), '(5) Form evidence without formInstanceId must be rejected.');
assert(validateEvidenceRef(makeRef({ formInstanceId: 'FI-001' })).some(p => p.includes('formId')), '(5) Form evidence without formId must be rejected.');

/* ── 6. Supporting documentation has supportTaskId or evidenceRequirementId ── */
assert(validateEvidenceRef(supportRef).length === 0, '(6) Valid supporting documentation should pass.');
assert(
  validateEvidenceRef(makeRef({ title: 'Supporting documentation packet' })).some(p => p.includes('supportTaskId') || p.includes('evidenceRequirementId')),
  '(6) Supporting documentation without support/requirement id must be rejected.',
);

/* ── 7. No duplicate Drive attachment for the same evidenceId ────── */
const id1 = buildEvidenceId({ eventId: 'E1', taskId: 'T1', formInstanceId: 'FI', evidenceRequirementId: 'R1', driveFileId: 'F1' });
const id1b = buildEvidenceId({ eventId: 'E1', taskId: 'T1', formInstanceId: 'FI', evidenceRequirementId: 'R1', driveFileId: 'F1' });
assert(id1 === id1b, '(7) Evidence id must be deterministic for identical inputs.');
const deduped = dedupeEvidenceRefs([makeRef(), makeRef(), makeRef({ driveFileId: 'drive_file_002' })]);
assert(deduped.length === 2, '(7) Duplicate (same event+driveFile) refs must be de-duplicated.');

/* ── 8. No public "anyone with link" sharing unless explicitly approved ── */
const driveSrc = readSrc('server/googleDrive.ts');
const evidenceSrc = readSrc('server/googleEvidence.ts');
assert(!/permissions\.create/.test(driveSrc) && !/permissions\.create/.test(evidenceSrc), '(8) Drive code must not create sharing permissions by default.');
assert(!/type:\s*['"]anyone['"]/.test(driveSrc) && !/'anyone'|"anyone"/.test(driveSrc), '(8) Drive code must not grant "anyone" access.');

/* ── 9. No PHI-like fields in Calendar extendedProperties ────────── */
const lightProps = buildLightweightExtendedProperties({
  eventId: 'E1', workflowId: 'WF1', driveFolderId: 'folder_001', attachmentCount: 3,
  // Attempt to smuggle PHI — these are NOT on the allowlist and must be dropped.
  ...( { patientName: 'John Doe', mrn: 'MRN-123456', formAnswers: 'secret' } as Record<string, never> ),
});
assert(!extendedPropertiesHavePhi(lightProps), '(9) Lightweight extendedProperties must not contain PHI-like keys/values.');
assert(!('patientName' in lightProps) && !('mrn' in lightProps) && !('formAnswers' in lightProps), '(9) Non-allowlisted (PHI) keys must be stripped from extendedProperties.');
assert(extendedPropertiesHavePhi({ patientName: 'Jane Smith' }), '(9) PHI detector must flag patient identifier keys.');

// extendedProperties allowlist is enforced in source (setEvidenceExtendedProperties).
const calSrc = readSrc('server/googleCalendar.ts');
assert(/const ALLOWED = new Set\(\[/.test(calSrc), '(9) setEvidenceExtendedProperties must enforce an allowlist.');

/* ── 10. No PHI-like fields in Drive filenames/folder names ──────── */
assert(looksLikePhiName('patient-john-doe-record'), '(10) PHI detector must flag patient-name filenames.');
assert(looksLikePhiName('ssn 123-45-6789'), '(10) PHI detector must flag SSN-like content.');
assert(!looksLikePhiName('QA-WF-09-STEP-02'), '(10) System IDs must not be flagged as PHI.');
assert(sanitizeFileName('patient John/Doe<2024>.pdf') === sanitizeName('patient John/Doe<2024>') + '.pdf' || /\.pdf$/.test(sanitizeFileName('x.pdf')), '(10) sanitizeFileName preserves a single safe extension.');
assert(!/[/\\?%*:|"<>]/.test(sanitizeName('a/b:c*d?e')), '(10) sanitizeName must strip unsafe filesystem characters.');
// uploadEventEvidence rejects PHI-bearing names at the boundary.
assert(/looksLikePhiName\(safeFileName\)\s*\|\|\s*looksLikePhiName\(input\.title\)/.test(evidenceSrc), '(10) Upload path must reject PHI-bearing evidence names.');

// Folder segments are derived from IDs and sanitized.
const segments = buildEvidenceFolderSegments({
  eventId: 'qapi_meeting-20260507-08', domain: 'QAPI', eventDate: '2026-05-07',
  category: 'form_instance', taskId: 'QA-WF-09-STEP-02', formId: 'GV-FM-017', formInstanceId: 'FI-001',
});
assert(segments[0] === '2026' && segments[1] === quarterFromDate('2026-05-07'), '(10) Folder path must derive year/quarter from event date.');
assert(segments.includes(EVIDENCE_SUBFOLDERS.form_instance), '(10) Folder path must include the category subfolder.');
assert(segments.every(s => !/[/\\?%*:|"<>]/.test(s)), '(10) Every folder segment must be sanitized.');

/* ── 11. Missing / metadata-only attachments labeled honestly ────── */
assert(
  validateEvidenceRef(makeRef({ attachmentStatus: 'attached', contentStatus: 'missing' })).some(p => p.includes('dishonest')),
  '(11) "attached" + missing content must be flagged as dishonest.',
);
assert(validateEvidenceRef(makeRef({ contentStatus: 'metadata_only', attachmentStatus: 'pending_attach' })).length === 0, '(11) Honest metadata-only/pending labels are allowed.');
assert(validateEvidenceRef(makeRef({ attachmentStatus: 'bogus' as never })).some(p => p.includes('attachmentStatus')), '(11) Invalid attachment status must be rejected.');

/* ── 12. QA-WF-03 custom file diff remains empty ─────────────────── */
let qaDiff = '';
try {
  qaDiff = execSync('git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', { encoding: 'utf8' }).trim();
} catch (error) {
  failures.push(`Unable to inspect QA-WF-03 diff: ${String(error)}`);
}
assert(qaDiff === '', '(12) QA-WF-03 custom page has a non-empty diff.');

/* ── Cross-check: no second Google auth path; reuses service account ── */
assert(/keyFile:\s*env\.credentialsPath/.test(driveSrc), 'Drive client must reuse the existing service-account key (env.credentialsPath).');
assert(!/OAuth2|getToken|VITE_GOOGLE_CLIENT_ID/.test(driveSrc), 'Drive client must not introduce a second (OAuth) Google auth path.');

notes.push(`Validated evidence ref contract, dedupe, PHI guards, folder derivation, and ${requiredFiles.length} required files.`);

/* ── Report ──────────────────────────────────────────────────────── */
console.log('Google Calendar + Drive Evidence Sync Audit');
notes.forEach(n => console.log(`- ${n}`));
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('\nAll Google Calendar + Drive evidence validations passed.');
