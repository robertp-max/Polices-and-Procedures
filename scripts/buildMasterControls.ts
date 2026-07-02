import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  EXTRA_MASTER_CONTROL_SOURCE_RECORDS,
  MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS,
  buildDefaultDocumentRefs,
  buildDefaultEvidenceRequirements,
  buildDefaultSignoffRequirements,
  buildVerificationLogTemplates,
  buildVerification,
  getDocumentationRecordForRef,
  getDossierOverride,
  normalizeSourceStatus,
} from '../src/policy/data/masterControlDocumentation.generated';
import type { MasterControlSourcePayload, MasterControlSourceRecord } from '../src/policy/types/masterControlInventory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const jsonPath = path.join(projectRoot, 'public', 'data', 'MASTER_CONTROL_INVENTORY_DATA_MODEL.json');
const outDir = path.join(projectRoot, 'Builder', 'Documentations');
const generatedMdPath = path.join(outDir, 'MASTER_CONTROL_INVENTORY_GENERATED.md');
const missingMdPath = path.join(outDir, 'MASTER_CONTROL_MISSING_DOCUMENTATION_REPORT.md');

const riskMap = { H: 'HIGH', M: 'MATERIAL', L: 'LOW' } as const;

function unique(values: string[], label: string, errors: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) errors.push(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function getDocs(control: MasterControlSourceRecord) {
  return getDossierOverride(control.id)?.documentRefs ?? buildDefaultDocumentRefs(control);
}

function getDocRecords(control: MasterControlSourceRecord) {
  return getDocs(control).map((doc) => getDocumentationRecordForRef(control, doc));
}

function getEvidence(control: MasterControlSourceRecord) {
  return getDossierOverride(control.id)?.evidenceRequirements ?? buildDefaultEvidenceRequirements(control, riskMap[control.risk_level]);
}

function getSignoffs(control: MasterControlSourceRecord) {
  return getDossierOverride(control.id)?.signoffRequirements ?? buildDefaultSignoffRequirements(control, riskMap[control.risk_level]);
}

async function main() {
  const payload = JSON.parse(await readFile(jsonPath, 'utf8')) as MasterControlSourcePayload;
  const controls = [...payload.controls, ...EXTRA_MASTER_CONTROL_SOURCE_RECORDS];
  const errors: string[] = [];

  unique(controls.map((control) => control.id), 'control ID', errors);
  unique(controls.flatMap((control) => getDocs(control).map((doc) => doc.documentId)), 'documentId', errors);
  unique(controls.flatMap((control) => getDocRecords(control).map((doc) => doc.documentId)), 'documentation record documentId', errors);
  unique(controls.flatMap((control) => getEvidence(control).map((evidence) => evidence.evidenceId)), 'evidenceId', errors);
  unique(controls.flatMap((control) => getSignoffs(control).map((signoff) => signoff.signoffId)), 'signoffId', errors);
  unique(controls.flatMap((control) => buildVerificationLogTemplates(control).map((log) => log.logId)), 'verification log ID', errors);

  for (const control of controls) {
    const docs = getDocs(control);
    const docRecords = getDocRecords(control);
    const evidence = getEvidence(control);
    const signoffs = getSignoffs(control);
    const logs = buildVerificationLogTemplates(control);
    const verification = buildVerification(control, riskMap[control.risk_level]);

    if (docs.length === 0) errors.push(`${control.id} has no documentRefs`);
    for (const doc of docs) {
      const record = docRecords.find((entry) => entry.documentId === doc.documentId);
      if (!record) errors.push(`${control.id} ${doc.documentId} has metadata but no documentation record`);
      if (record && record.body.length === 0) errors.push(`${control.id} ${doc.documentId} has empty documentation body`);
    }
    for (const record of docRecords) {
      for (const section of record.body) {
        if (!section.heading.trim() && !section.body.trim()) {
          errors.push(`${record.documentId} has a documentation body section with empty heading and body`);
        }
      }
    }
    if (evidence.length === 0) errors.push(`${control.id} has no evidenceRequirements`);
    if (control.risk_level === 'H' && !signoffs.some((signoff) => signoff.requiredForReadiness)) {
      errors.push(`${control.id} is HIGH risk with no required signoff`);
    }
    if (!control.required_owner) errors.push(`${control.id} has no owner`);
    if (!verification.frequency) errors.push(`${control.id} has no frequency`);
    if (!control.trigger_condition) errors.push(`${control.id} has no trigger condition`);
    if (!control.escalation_owner) errors.push(`${control.id} has no escalation owner`);
    for (const log of logs) {
      if (!log.performedByName || !log.performedByRole || !log.performedAt || !log.evidenceReviewed.length || !log.nextDueDate || !log.auditTrailId) {
        errors.push(`${control.id} ${log.logId} is missing required verification log fields`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Master Controls validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }

  await mkdir(outDir, { recursive: true });
  const generated = [
    '# Master Control Inventory - Generated',
    '',
    `Generated from runtime JSON plus dossier registry. Control count: ${controls.length}.`,
    '',
    '| Control ID | Name | Risk | Source Status | Owner | Documents | Evidence | Signoffs |',
    '|---|---|---:|---|---|---:|---:|---:|',
    ...controls.map((control) => {
      const docs = getDocs(control);
      const evidence = getEvidence(control);
      const signoffs = getSignoffs(control);
      return `| ${control.id} | ${control.control_name.replace(/\|/g, '/')} | ${riskMap[control.risk_level]} | ${normalizeSourceStatus(control.status)} | ${control.required_owner.replace(/\|/g, '/')} | ${docs.length} | ${evidence.length} | ${signoffs.length} |`;
    }),
    '',
  ].join('\n');

  await writeFile(generatedMdPath, generated, 'utf8');
  const missing = [
    '# Master Control Missing Documentation Report',
    '',
    'This report identifies full document copy still needing drafting. Created records remain listed for traceability.',
    '',
    '| Control ID | Control Name | Status / Missing | Recommended Document ID | Recommended Title | Source Candidate | Priority | Owner Role | Needs Claude Draft |',
    '|---|---|---|---|---|---|---|---|---|',
    ...MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS.map((row) =>
      `| ${row.controlId} | ${row.controlName} | ${row.requiredDocumentationMissing} | ${row.recommendedDocumentId} | ${row.recommendedTitle} | ${row.sourceCandidate} | ${row.draftingPriority} | ${row.ownerRole} | ${row.needsClaudeDraft ? 'YES' : 'NO'} |`,
    ),
    '',
  ].join('\n');
  await writeFile(missingMdPath, missing, 'utf8');
  console.log(`[build-master-controls] Validated ${controls.length} controls.`);
  console.log(`[build-master-controls] Wrote ${path.relative(projectRoot, generatedMdPath)}`);
  console.log(`[build-master-controls] Wrote ${path.relative(projectRoot, missingMdPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
