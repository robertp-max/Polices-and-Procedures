/* ═══════════════════════════════════════════════════════════════════
   CES no-localStorage audit (Part 11).

   Verifies the CES storage architecture removes browser localStorage as a
   persistence path for CES/evidence/form/eCIgn/artifact/event-execution state:

     1. The new CES storage layer files exist.
     2. There is NO `localStorage` member in the CES storage provider type.
     3. The new CES storage layer source contains ZERO localStorage usage.
     4. The CES metadata backend rejects file bytes (no blobs in metadata).
     5. The frontend client exposes an explicit "unavailable" state — no
        silent localStorage fallback.
     6. The legacy regulatory execution store's localStorage footprint
        (incl. `reg-execution-v2`) is reported. Migrating it OFF localStorage
        is a checkpoint-gated step; this audit reports the remaining count
        honestly rather than faking completion.
     7. No localStorage fallback remains in the CES client transport.
     8. QA-WF-03 custom page diff remains empty.

   Run with: tsx Builder/_system/audit-ces-no-localstorage.ts
   ═══════════════════════════════════════════════════════════════════ */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertNoFileBytes } from '../../server/cesMetadataStore.js';

const failures: string[] = [];
const warnings: string[] = [];
const notes: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}
const root = process.cwd();
const readSrc = (rel: string) => readFileSync(resolve(root, rel), 'utf8');

/**
 * Detect ACTUAL localStorage/sessionStorage usage (method access or store
 * wiring) — not mere mentions in comments/strings (the architecture docs
 * legitimately describe what is prohibited).
 */
const LS_USAGE =
  /(window\.)?(localStorage|sessionStorage)\s*\.\s*(getItem|setItem|removeItem|clear|key)\b|=>\s*(window\.)?(localStorage|sessionStorage)\b|createJSONStorage/;

/* ── 1. New CES storage layer files exist ────────────────────────── */
const cesLayerFiles = [
  'src/policy/evidence/storageProviders/types.ts',
  'server/cesMetadataStore.ts',
  'server/routes/ces.ts',
  'src/policy/services/evidenceApi.ts',
];
cesLayerFiles.forEach(f => assert(existsSync(resolve(root, f)), `(1) Missing CES storage layer file: ${f}`));

const typesSrc = readSrc('src/policy/evidence/storageProviders/types.ts');
const storeSrc = readSrc('server/cesMetadataStore.ts');
const cesRouteSrc = readSrc('server/routes/ces.ts');
const apiSrc = readSrc('src/policy/services/evidenceApi.ts');

/* ── 2. No localStorage provider in the provider union ───────────── */
assert(/CesStorageProvider\s*=/.test(typesSrc), '(2) CesStorageProvider type must be defined.');
assert(!/['"]localstorage['"]/i.test(typesSrc), '(2) CES storage provider union must NOT include a localStorage member.');
assert(/google_drive_calendar/.test(typesSrc) && /dynamodb_metadata/.test(typesSrc), '(2) Provider union must include google_drive_calendar + dynamodb_metadata.');

/* ── 3. New CES layer contains zero localStorage usage ───────────── */
for (const [rel, src] of [
  ['types.ts', typesSrc],
  ['cesMetadataStore.ts', storeSrc],
  ['routes/ces.ts', cesRouteSrc],
  ['evidenceApi.ts', apiSrc],
] as const) {
  assert(!LS_USAGE.test(src), `(3) ${rel} must not USE localStorage/sessionStorage (mentions in docs are fine).`);
}

/* ── 4. CES metadata backend rejects file bytes ──────────────────── */
let threwOnBytes = false;
try { assertNoFileBytes({ a: { localDataUrl: 'data:...' } }, 'test'); } catch { threwOnBytes = true; }
assert(threwOnBytes, '(4) assertNoFileBytes must reject a forbidden file-byte field (localDataUrl).');
let threwOnNested = false;
try { assertNoFileBytes({ rows: [{ ok: 1 }, { pdfBlob: 'JVBER...' }] }, 'test'); } catch { threwOnNested = true; }
assert(threwOnNested, '(4) assertNoFileBytes must reject nested forbidden fields (pdfBlob).');
let threwOnClean = false;
try { assertNoFileBytes({ id: 'x', driveFileId: 'f', status: 'attached' }, 'test'); } catch { threwOnClean = true; }
assert(!threwOnClean, '(4) assertNoFileBytes must allow clean pointer-only metadata.');

/* ── 5. Frontend client has an explicit "unavailable" state ──────── */
assert(/status:\s*['"]unavailable['"]/.test(apiSrc), '(5) CES client must surface an explicit "unavailable" load state.');
assert(/CES_BACKEND_UNAVAILABLE_MESSAGE/.test(typesSrc), '(5) An honest CES-unavailable message must be defined.');

/* ── 6. Legacy store localStorage footprint (checkpoint-gated) ───── */
const legacyStorePath = 'src/policy/stores/regulatoryExecutionStore.ts';
if (existsSync(resolve(root, legacyStorePath))) {
  const legacy = readSrc(legacyStorePath);
  const lsCount = (legacy.match(/localStorage/g) ?? []).length;
  const hasV2Key = /reg-execution-v2/.test(legacy);
  if (lsCount > 0 || hasV2Key) {
    warnings.push(
      `(6) Legacy regulatoryExecutionStore still has ${lsCount} localStorage reference(s)` +
      `${hasV2Key ? " and the 'reg-execution-v2' key" : ''}. ` +
      'Migrating this store OFF localStorage is the checkpoint-gated step ' +
      '(high-risk; requires the CES backend to be deployed to staging first).',
    );
  } else {
    notes.push('(6) Legacy regulatoryExecutionStore contains no localStorage references.');
  }
} else {
  warnings.push(`(6) Could not locate ${legacyStorePath}.`);
}

/* ── 7. No localStorage fallback in the CES client transport ─────── */
assert(!LS_USAGE.test(apiSrc), '(7) CES client must not contain a localStorage fallback path.');

/* ── 8. QA-WF-03 custom file diff remains empty ──────────────────── */
let qaDiff = '';
try {
  qaDiff = execSync('git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', { encoding: 'utf8' }).trim();
} catch (error) {
  failures.push(`(8) Unable to inspect QA-WF-03 diff: ${String(error)}`);
}
assert(qaDiff === '', '(8) QA-WF-03 custom page has a non-empty diff.');

notes.push(`Validated ${cesLayerFiles.length} CES storage layer files + no-file-bytes guard + honest unavailable state.`);

/* ── Report ──────────────────────────────────────────────────────── */
console.log('CES No-localStorage Audit');
notes.forEach(n => console.log(`- ${n}`));
if (warnings.length > 0) {
  console.warn('\nWarnings (checkpoint-gated, not failures):');
  warnings.forEach(w => console.warn(`- ${w}`));
}
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('\nAll CES no-localStorage architecture validations passed.');
