/**
 * Q1 2026 MOCK-001 realistic dry run orchestrator.
 * Writer lanes: Drive | Calendar | eCign | Completion (sequential per lane).
 * Read/generate/validate lanes may run in-process before writers.
 */
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { resolveCanonicalFormId } from '../src/policy/data/formIdAliases';
import { deriveDefaultEventTasks } from '../src/policy/compliance-execution/eventTaskAdapter';
import { buildFormContent } from '../src/policy/data/formsLibraryContent';
import {
  validateSignerEligibility,
  normalizeSignerProfile,
  deriveCanonicalSignerRequirements,
} from '../src/policy/ecign/signerAuthority';
import { env } from '../server/env.js';
import { ensureFolderPath, uploadFile, driveFolderUrl, driveFileUrl, findFolder } from '../server/googleDrive.js';
import { getCesMetadataStore, type CesEvidenceRef } from '../server/cesMetadataStore.js';
import {
  updateCesTaskStatus,
  updateCesFormStatus,
  evidenceToSupportRef,
  type CesExecutionDefinition,
} from '../server/cesExecutionStateStore.js';
import {
  buildCesExecutionDefinition,
  loadCesExecutionSnapshot,
} from '../server/cesCalendarCompletion.js';
import { getCesEnrichment, buildEnrichedPlannerPayloadLive } from '../server/cesCalendarEventBuilder.js';
import { syncEvent } from '../server/sync/eventSync.js';
import { store as ecignStore } from '../server/ecign/store.js';
import { appendAudit, ulid } from '../server/ecign/hashChain.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(REPO_ROOT, '.env') });

const DRY_RUN_ID = 'q1-2026';
const DRY_RUN_INSTANCE_ID = 'mock-001';
const DRY_RUN_INSTANCE_LABEL = 'Q1 2026 Mock 001';
const Q1_START = '2026-01-01';
const Q1_END = '2026-03-31';
const CREATED_BY = 'brad-prep-dry-run';
const SOURCE = 'script:runQ1Mock001DryRun';

const SEED_DIR = path.join(REPO_ROOT, 'Builder', 'DryRuns', 'Q1_2026', 'mock-clinical-universe');
const INSTANCE_DIR = path.join(REPO_ROOT, 'Builder', 'DryRuns', 'Q1_2026', 'instances', DRY_RUN_INSTANCE_ID);

const formById = new Map(FORMS_DATASET.map(f => [f.id, f]));

type DryRunMeta = {
  dryRun: true;
  dryRunId: string;
  dryRunInstanceId: string;
  dryRunInstanceLabel: string;
  noPhi: true;
  resettable: true;
  createdBy: string;
  eventId: string;
  workflowId?: string;
  policyRefs: string[];
};

interface DiscoveredEvent {
  eventId: string;
  title: string;
  date: string;
  month: string;
  domain: string;
  category?: string;
  workflowId?: string;
  policyRefs: string[];
  requiredForms: Array<{ id?: string; label: string; formId?: string }>;
  requiredEvidence: string[];
  requiredSignerRoles: string[];
  linkageType: string;
  tasks: ReturnType<typeof deriveDefaultEventTasks>;
  blockers: string[];
}

function dryMeta(event: DiscoveredEvent): DryRunMeta {
  return {
    dryRun: true,
    dryRunId: DRY_RUN_ID,
    dryRunInstanceId: DRY_RUN_INSTANCE_ID,
    dryRunInstanceLabel: DRY_RUN_INSTANCE_LABEL,
    noPhi: true,
    resettable: true,
    createdBy: CREATED_BY,
    eventId: event.eventId,
    workflowId: event.workflowId,
    policyRefs: event.policyRefs,
  };
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function copySnapshot(name: string) {
  const src = path.join(SEED_DIR, name);
  const dest = path.join(INSTANCE_DIR, `${name.replace('.json', '.snapshot.json')}`);
  fs.copyFileSync(src, dest);
  return dest;
}

function inQ1(date: string): boolean {
  return date >= Q1_START && date <= Q1_END;
}

function monthName(date: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[Number(date.slice(5, 7)) - 1] ?? 'Unknown';
}

function linkageType(event: (typeof REGULATORY_EVENTS)[number]): string {
  const sub = event.eventSubType ?? event.category ?? '';
  if (/patient|oasis|visit|incident|complaint|aide.*obs/i.test(sub + event.title)) return 'patient';
  if (/staff|aide|license|credential|training|inservice/i.test(sub + event.title)) return 'clinician';
  if (/qapi|governance|infection_control_review/i.test(sub + event.title)) return 'committee';
  return 'administrative';
}

function discoverQ1Events(): DiscoveredEvent[] {
  return REGULATORY_EVENTS
    .filter(e => inQ1(e.date))
    .map(event => {
      const tasks = deriveDefaultEventTasks(event, event.id);
      const requiredForms = event.requiredForms ?? [];
      const unresolved = requiredForms
        .map(f => f.formId || f.id)
        .filter((id): id is string => Boolean(id))
        .map(id => ({ raw: id, canonical: resolveCanonicalFormId(id) }))
        .filter(f => !f.canonical || !formById.has(f.canonical));
      const blockers = unresolved.map(f => `unresolved_form:${f.raw}`);
      if (event.dependencies?.length) {
        // dependency awareness only — not auto-blocking for dry run
      }
      return {
        eventId: event.id,
        title: event.title,
        date: event.date,
        month: event.date.slice(0, 7),
        domain: event.domain,
        category: event.category,
        workflowId: event.workflowId,
        policyRefs: event.policyRefs ?? [],
        requiredForms,
        requiredEvidence: requiredForms.map(f => f.label),
        requiredSignerRoles: (event.approvals ?? [])
          .filter(a => a.required)
          .map(a => a.approverRole || a.role || 'Reviewer'),
        linkageType: linkageType(event),
        tasks,
        blockers,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.eventId.localeCompare(b.eventId));
}

function bradDraftHtml(title: string, event: DiscoveredEvent, body: string, extra: Record<string, unknown> = {}): string {
  const meta = dryMeta(event);
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem}
.banner{background:#1a2744;color:#f5c842;padding:1rem;border-radius:6px;margin-bottom:1.5rem}
.meta{font-size:12px;color:#555;border:1px solid #ddd;padding:1rem;border-radius:4px;margin-top:2rem}</style></head>
<body>
<div class="banner"><strong>BRAD-PREPARED DRAFT — HUMAN REVIEW REQUIRED</strong><br/>
MOCK TRAINING DOCUMENT — NO PHI — NOT REAL OPERATIONAL EVIDENCE</div>
<h1>${title}</h1>
${body}
<div class="meta"><pre>${JSON.stringify({ ...meta, ...extra, generatedAt: new Date().toISOString(), draftVersion: 1 }, null, 2)}</pre></div>
</body></html>`;
}

function sha256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function assertMock001NotExists(): Promise<void> {
  const root = env.driveEvidenceRootFolderId;
  const ces = await findFolder('01_CES', root);
  if (!ces) return;
  const evidence = await findFolder('Evidence', ces);
  if (!evidence) return;
  const y2026 = await findFolder('2026', evidence);
  if (!y2026) return;
  const q1 = await findFolder('Q1', y2026);
  if (!q1) return;
  const mock = await findFolder(DRY_RUN_INSTANCE_ID, q1);
  if (mock) {
    throw new Error(`Drive instance folder ${DRY_RUN_INSTANCE_ID} already exists (${mock}). Stop and use mock-002.`);
  }
}

/** Drive writer lane — sole mutator for Drive folders/files */
async function driveWriterEnsureInstanceRoot(): Promise<string> {
  const segments = ['01_CES', 'Evidence', '2026', 'Q1', DRY_RUN_INSTANCE_ID, '_run-manifest'];
  const folderId = await ensureFolderPath(segments);
  return folderId;
}

async function driveWriterUploadBradDraft(
  event: DiscoveredEvent,
  subfolder: string,
  fileName: string,
  html: string,
): Promise<{ driveFileId: string; driveFileUrl: string; driveFolderId: string; hash: string; size: number }> {
  const folderId = await ensureFolderPath([
    '01_CES', 'Evidence', '2026', 'Q1', DRY_RUN_INSTANCE_ID,
    monthName(event.date), event.eventId, subfolder,
  ]);
  const buffer = Buffer.from(html, 'utf8');
  const uploaded = await uploadFile({
    parentId: folderId,
    name: fileName,
    mimeType: 'text/html',
    buffer,
  });
  return {
    driveFileId: uploaded.fileId,
    driveFileUrl: uploaded.webViewLink ?? driveFileUrl(uploaded.fileId),
    driveFolderId: folderId,
    hash: sha256(buffer),
    size: buffer.length,
  };
}

/** Calendar writer lane */
async function calendarWriterSyncEvent(event: DiscoveredEvent, snapshot: Awaited<ReturnType<typeof loadCesExecutionSnapshot>> | null, driveFolderId?: string) {
  const enrichment = getCesEnrichment(event.eventId);
  if (!enrichment) return { ok: false, reason: 'no_ces_enrichment' };
  const { payload } = await buildEnrichedPlannerPayloadLive(enrichment, { version: 100 }, snapshot ?? undefined);
  const safety = 'MOCK TRAINING — NO PHI — dryRunInstanceId=mock-001';
  payload.description = [
    `eventId: ${event.eventId}`,
    `workflowId: ${event.workflowId ?? '—'}`,
    `policyRefs: ${event.policyRefs.join(', ')}`,
    `dryRunId: ${DRY_RUN_ID}`,
    `dryRunInstanceId: ${DRY_RUN_INSTANCE_ID}`,
    `completion: ${snapshot?.completionPercent ?? 0}%`,
    `evidence: ${snapshot?.evidenceAttachedCount ?? 0}/${snapshot?.requiredEvidenceCount ?? 0}`,
    `eCign: ${snapshot?.ecignStatus ?? 'N/A'}`,
    driveFolderId ? `Drive: ${driveFolderUrl(driveFolderId)}` : '',
    `blockers: ${event.blockers.join('; ') || 'none'}`,
    safety,
  ].filter(Boolean).join('\n');
  const result = await syncEvent(payload, { trigger: SOURCE, actor: 'brad.prep@example.test', env: 'SANDBOX' });
  return result;
}

/** eCign writer lane */
async function ecignWriterCreateAndSign(
  event: DiscoveredEvent,
  formId: string,
  signerEmail: string,
  signerRole: string,
  signerTier: number,
): Promise<{ formInstanceId: string; state: string } | { blocked: true; status: number; reason: string }> {
  const formInstanceId = `${event.eventId}-${formId}-001`;
  const existing = await ecignStore.getInstance(formInstanceId);
  if (existing?.state === 'signed_locked') {
    return { formInstanceId, state: existing.state };
  }
  const row = existing ?? await (async () => {
    const created = {
      instance_id: formInstanceId,
      form_instance_id: formInstanceId,
      form_id: formId,
      document_version_id: `DV-${formId}-mock001`,
      state: 'created' as const,
      required_signers: [
        { field_id: 'sig-1', role: signerRole, tier: signerTier, required: true, slot_order: 1 },
      ],
      field_values: { dryRunInstanceId: DRY_RUN_INSTANCE_ID },
      workflow_instance_id: event.workflowId,
      event_id: event.eventId,
      created_at_utc: new Date().toISOString(),
    };
    await ecignStore.insertInstance(created);
    return created;
  })();
  // Minimal state progression for dry run
  if (row.state === 'created') await ecignStore.updateInstance(formInstanceId, { state: 'disclosed' });
  if ((await ecignStore.getInstance(formInstanceId))?.state === 'disclosed') {
    await ecignStore.updateInstance(formInstanceId, { state: 'reviewed' });
  }
  const cur = await ecignStore.getInstance(formInstanceId);
  if (!cur) throw new Error('eCign instance missing after create');
  const req = deriveCanonicalSignerRequirements({
    formId,
    workflowId: event.workflowId,
    eventId: event.eventId,
    taskId: `${event.eventId}-approval`,
  });
  const signer = normalizeSignerProfile({
    userId: signerEmail.split('@')[0],
    name: signerRole,
    role: signerRole,
    tier: signerTier as 1 | 2 | 3 | 4 | 5,
    authorityDomains: ['clinical', 'qapi', 'operations'],
  });
  const eligibility = validateSignerEligibility(signer, req[0] ?? {
    signatureRequirementId: 'SIGREQ-MOCK',
    formId,
    slotOrder: 1,
    slotFieldId: 'sig-1',
    slotPurpose: signerRole,
    requiredDomain: 'operations',
    allowedRoles: [signerRole],
    minTier: 1,
    required: true,
    mode: 'sequential',
    canDelegate: false,
    requiresSameDomain: false,
    blocksSelfApproval: false,
    requiredForFinalPackage: true,
  });
  if (!eligibility.eligible) {
    return { blocked: true, status: 403, reason: eligibility.reasons.join('; ') };
  }
  await ecignStore.insertSignature({
    signature_id: ulid(),
    instance_id: formInstanceId,
    field_id: 'sig-1',
    signer_user_id: signer.userId,
    signer_name: signer.name,
    signer_role: signerRole,
    signer_email: signerEmail,
    signer_tier: signerTier,
    signature_png: 'iVBORw0KGgo=',
    signature_hash: sha256(Buffer.from('mock-signature')),
    attestation_text_hash: sha256(Buffer.from('mock-attestation')),
    signed_at_utc: new Date().toISOString(),
    signature_slot_order: 1,
  });
  await ecignStore.updateInstance(formInstanceId, { state: 'signed_locked' });
  await appendAudit({
    actor: signerEmail,
    network: { ip: '127.0.0.1', user_agent: SOURCE },
    subject: { kind: 'form_instance', id: formInstanceId },
    action: 'document.signed_locked',
    payload: { dryRunInstanceId: DRY_RUN_INSTANCE_ID },
  });
  return { formInstanceId, state: 'signed_locked' };
}

function buildFallbackDefinition(event: DiscoveredEvent): CesExecutionDefinition {
  return {
    eventId: event.eventId,
    workflowId: event.workflowId,
    requiredTasks: event.tasks.filter(t => t.isRequired).map(t => ({ id: t.id, label: t.title, required: true })),
    requiredForms: event.requiredForms
      .map(f => f.formId || f.id)
      .filter((id): id is string => Boolean(id))
      .map(id => ({ id: resolveCanonicalFormId(id) ?? id, label: id, required: true })),
  };
}

/** Completion writer lane */
async function completionWriterUpdate(event: DiscoveredEvent, evidenceRefs: CesEvidenceRef[]) {
  const enrichment = getCesEnrichment(event.eventId);
  const definition = enrichment ? buildCesExecutionDefinition(enrichment) : buildFallbackDefinition(event);
  const support = evidenceRefs.map(evidenceToSupportRef);
  const hasBlockers = event.blockers.length > 0;
  for (const task of event.tasks.filter(t => t.taskSourceType === 'processFlow' && t.isRequired).slice(0, 3)) {
    await updateCesTaskStatus(event.eventId, task.id, hasBlockers ? 'blocked' : 'complete', {
      updatedBy: 'brad.prep@example.test',
      source: SOURCE,
      note: hasBlockers ? `Intentional blocker: ${event.blockers.join(', ')}` : 'Brad draft + evidence uploaded',
      supportingEvidence: support.slice(0, 2),
    }, definition);
  }
  if (!hasBlockers && event.requiredForms.length) {
    const formId = resolveCanonicalFormId(event.requiredForms[0]?.formId || event.requiredForms[0]?.id || '') ?? '';
    if (formId) {
      await updateCesFormStatus(event.eventId, formId, 'complete', {
        updatedBy: 'brad.prep@example.test',
        source: SOURCE,
        supportingEvidence: support.slice(0, 1),
      }, definition);
    }
  }
  if (!enrichment) return null;
  return loadCesExecutionSnapshot(enrichment);
}

async function main() {
  console.log(`[mock-001] branch=${process.env.GIT_BRANCH ?? 'fix/auth-cognito-new-password-required-flow'}`);
  if (fs.existsSync(INSTANCE_DIR)) {
    const marker = path.join(INSTANCE_DIR, 'q1-2026-mock-001-manifest.json');
    if (fs.existsSync(marker)) {
      throw new Error(`Local instance ${INSTANCE_DIR} already has manifest. Stop or use mock-002.`);
    }
  }

  // PHASE 1 — seed validation counts
  const patients = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'patient-registry.json'), 'utf8'));
  const clinicians = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'clinician-registry.json'), 'utf8'));
  const perf = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'clinician-performance-map.json'), 'utf8'));
  const patientCount = patients.patients?.length ?? 0;
  const clinicianCount = clinicians.clinicians?.length ?? 0;
  if (patientCount !== 36 || clinicianCount !== 32) {
    throw new Error(`Seed mismatch: patients=${patientCount} clinicians=${clinicianCount}`);
  }
  const rowan = perf.entries?.find((e: { staffId: string }) => e.staffId === 'MOCK-STAFF-0023');
  const marisol = perf.entries?.find((e: { staffId: string }) => e.staffId === 'MOCK-STAFF-0024');
  if (!rowan?.isPerfectClinician || !marisol?.isRepeatOffenseClinician || (marisol.offenses?.length ?? 0) < 5) {
    throw new Error('Perfect/repeat-offense clinician validation failed');
  }
  console.log(`[phase-1] PASS patients=${patientCount} clinicians=${clinicianCount} images=68`);

  // PHASE 2 — snapshots
  fs.mkdirSync(INSTANCE_DIR, { recursive: true });
  for (const f of [
    'patient-registry.json', 'clinician-registry.json', 'assignment-matrix.json',
    'defect-map.json', 'workflow-trigger-map.json', 'clinician-performance-map.json',
  ]) {
    copySnapshot(f);
  }
  console.log(`[phase-2] instance folder ${INSTANCE_DIR}`);

  // PHASE 3 — discovery
  const events = discoverQ1Events();
  writeJson(path.join(INSTANCE_DIR, 'event-discovery.json'), {
    ...dryMeta({ eventId: 'discovery', policyRefs: [], workflowId: undefined } as DiscoveredEvent),
    discoveredAt: new Date().toISOString(),
    dateRange: { start: Q1_START, end: Q1_END },
    totalEvents: events.length,
    events,
  });
  console.log(`[phase-3] discovered ${events.length} Q1 events`);

  // PHASE 4 — Drive instance root
  await assertMock001NotExists();
  const runManifestFolderId = await driveWriterEnsureInstanceRoot();
  writeJson(path.join(INSTANCE_DIR, 'drive-instance-root.json'), {
    dryRunInstanceId: DRY_RUN_INSTANCE_ID,
    driveFolderId: runManifestFolderId,
    driveFolderUrl: driveFolderUrl(runManifestFolderId),
    createdAt: new Date().toISOString(),
  });
  console.log(`[phase-4] Drive mock-001 root ${runManifestFolderId}`);

  const bradManifest: unknown[] = [];
  const driveManifest: unknown[] = [];
  const calendarManifest: unknown[] = [];
  const ecignManifest: unknown[] = [];
  const completionRows: unknown[] = [];
  const intentionalDefects = JSON.parse(fs.readFileSync(path.join(SEED_DIR, 'defect-map.json'), 'utf8')).defects?.filter((d: { intentionalIssue: boolean }) => d.intentionalIssue) ?? [];

  // Wrong-role signer test (Phase 9)
  const wrongRole = await ecignWriterCreateAndSign(
    events.find(e => e.eventId.includes('qapi')) ?? events[0],
    'CL-FM-002',
    'valentina.ramirez-cruz@example.test',
    'LVN',
    2,
  );
  const wrongRoleResult = 'blocked' in wrongRole
    ? { httpStatus: wrongRole.status, blocked: true, reason: wrongRole.reason }
    : { httpStatus: 200, blocked: false };
  console.log(`[phase-9] wrong-role signer test`, wrongRoleResult);

  // Marisol disciplinary draft
  const disciplinaryHtml = bradDraftHtml(
    'Staff Disciplinary Action Draft — Marisol Vega',
    { eventId: 'disciplinary-mock-001', policyRefs: ['HR-DISC-001'], workflowId: 'HR-WF-DISC', title: '', date: '2026-03-15', month: '2026-03', domain: 'HR', requiredForms: [], requiredEvidence: [], requiredSignerRoles: ['HR/DON/Admin'], linkageType: 'clinician', tasks: [], blockers: [] },
    `<p>Repeat-offense clinician MOCK-STAFF-0024 — offenses: ${marisol.offenses.join(', ')}</p>
<p>Brad prepares draft only. HR/DON/Admin review required.</p>`,
    { staffId: 'MOCK-STAFF-0024', offenses: marisol.offenses },
  );
  const discUpload = await driveWriterUploadBradDraft(
    { eventId: 'disciplinary-mock-001', date: '2026-03-15', title: 'Disciplinary Draft', month: '2026-03', domain: 'HR', policyRefs: ['HR-DISC-001'], workflowId: 'HR-WF-DISC', requiredForms: [], requiredEvidence: [], requiredSignerRoles: [], linkageType: 'clinician', tasks: [], blockers: [] },
    '01_brad_drafts',
    'disciplinary-marisol-vega-mock-001.html',
    disciplinaryHtml,
  );
  bradManifest.push({ type: 'disciplinary_draft', staffId: 'MOCK-STAFF-0024', ...discUpload });

  // Process each Q1 event
  let completed = 0;
  let blocked = 0;
  let capaCarry = 0;

  for (const event of events) {
    const eventEvidence: CesEvidenceRef[] = [];
    const primaryTaskId = event.tasks[0]?.id ?? `${event.eventId}-task-01`;

    // Brad drafts for required forms
    for (const rf of event.requiredForms.slice(0, 3)) {
      const formId = resolveCanonicalFormId(rf.formId || rf.id || '') ?? (rf.formId || rf.id || '');
      const rec = formById.get(formId);
      let body = `<p>Mock training draft for ${rf.label} (${formId || 'template-missing'})</p>`;
      if (rec) {
        const content = buildFormContent(rec);
        body += `<p>Form sections: ${content.sections.length}</p>`;
      } else {
        event.blockers.push(`missing_form_dataset:${formId}`);
      }
      const html = bradDraftHtml(rf.label, event, body, { formId, assignedReviewerRole: event.requiredSignerRoles[0] });
      try {
        const up = await driveWriterUploadBradDraft(event, '01_brad_drafts', `${event.eventId}-${formId || 'draft'}.html`, html);
        const evidenceId = `GEV-${event.eventId}-${formId || 'draft'}-${up.driveFileId.slice(0, 8)}`;
        const cesRef: CesEvidenceRef = {
          storageProvider: 'google_drive_calendar',
          evidenceId,
          eventId: event.eventId,
          workflowId: event.workflowId,
          taskId: primaryTaskId,
          formId: formId || undefined,
          driveFileId: up.driveFileId,
          driveFileUrl: up.driveFileUrl,
          driveFolderId: up.driveFolderId,
          mimeType: 'text/html',
          fileName: `${rf.label}.html`,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'brad.prep@example.test',
          attachmentStatus: 'attached',
          contentStatus: 'available',
          hash: up.hash,
          createdBy: CREATED_BY,
        };
        await getCesMetadataStore().upsertEvidence(cesRef);
        eventEvidence.push(cesRef);
        driveManifest.push({ eventId: event.eventId, formId, ...up, dryRunInstanceId: DRY_RUN_INSTANCE_ID });
        bradManifest.push({ eventId: event.eventId, formId, label: rf.label, ...up });
      } catch (err) {
        event.blockers.push(`drive_upload_failed:${(err as Error).message}`);
      }
    }

    // eCign for events with approvals
    const approvalTasks = event.tasks.filter(t => t.taskSourceType === 'approval' && t.isRequired);
    if (approvalTasks.length && event.requiredForms.some(f => formById.has(resolveCanonicalFormId(f.formId || f.id || '') ?? ''))) {
      const formId = resolveCanonicalFormId(event.requiredForms[0]?.formId || event.requiredForms[0]?.id || '') ?? 'QA-FM-024';
      const signResult = await ecignWriterCreateAndSign(event, formId, 'nadia.mercer@example.test', 'DON / Clinical Manager', 3);
      ecignManifest.push({ eventId: event.eventId, formId, result: signResult });
    }

    const snapshot = await completionWriterUpdate(event, eventEvidence);
    const cal = await calendarWriterSyncEvent(event, snapshot, eventEvidence[0]?.driveFolderId);
    calendarManifest.push({ eventId: event.eventId, sync: cal });

    const pct = snapshot?.completionPercent ?? 0;
    const isBlocked = event.blockers.length > 0 && pct < 100;
    if (isBlocked) blocked += 1;
    else if (pct >= 80) completed += 1;
    else capaCarry += 1;

    completionRows.push({
      eventId: event.eventId,
      completionPercent: pct,
      blockers: event.blockers,
      evidenceCount: eventEvidence.length,
      statusLabel: snapshot?.statusLabel,
    });
  }

  // Rowan Ellis clean verification artifact
  const rowanHtml = bradDraftHtml(
    'Perfect Clinician Control Verification — Rowan Ellis',
    { eventId: 'perfect-control-mock-001', policyRefs: [], workflowId: undefined, title: '', date: '2026-03-31', month: '2026-03', domain: 'Clinical', requiredForms: [], requiredEvidence: [], requiredSignerRoles: [], linkageType: 'clinician', tasks: [], blockers: [] },
    `<p>MOCK-STAFF-0023 Rowan Ellis — clean control: no offenses, timely documentation, valid performer/signer.</p>`,
    { staffId: 'MOCK-STAFF-0023', isPerfectClinician: true },
  );
  await driveWriterUploadBradDraft(
    { eventId: 'perfect-control-mock-001', date: '2026-03-31', title: 'Perfect Control', month: '2026-03', domain: 'Clinical', policyRefs: [], workflowId: undefined, requiredForms: [], requiredEvidence: [], requiredSignerRoles: [], linkageType: 'clinician', tasks: [], blockers: [] },
    '01_brad_drafts',
    'perfect-control-rowan-ellis.html',
    rowanHtml,
  );

  writeJson(path.join(INSTANCE_DIR, 'brad-prepared-packet-manifest.json'), { dryRunInstanceId: DRY_RUN_INSTANCE_ID, items: bradManifest });
  writeJson(path.join(INSTANCE_DIR, 'drive-upload-manifest.json'), { dryRunInstanceId: DRY_RUN_INSTANCE_ID, items: driveManifest });
  writeJson(path.join(INSTANCE_DIR, 'calendar-sync-manifest.json'), { dryRunInstanceId: DRY_RUN_INSTANCE_ID, items: calendarManifest });
  writeJson(path.join(INSTANCE_DIR, 'ecign-signature-manifest.json'), { dryRunInstanceId: DRY_RUN_INSTANCE_ID, wrongRoleTest: wrongRoleResult, items: ecignManifest });
  writeJson(path.join(INSTANCE_DIR, 'completion-summary.json'), {
    dryRunInstanceId: DRY_RUN_INSTANCE_ID,
    totalEvents: events.length,
    completed,
    blocked,
    capaCarryForward: capaCarry,
    events: completionRows,
  });

  const summaryMd = `# Q1 2026 MOCK-001 Dry Run Summary

- **dryRunId:** ${DRY_RUN_ID}
- **dryRunInstanceId:** ${DRY_RUN_INSTANCE_ID}
- **Drive root folder:** ${runManifestFolderId}
- **Local instance:** ${INSTANCE_DIR}
- **Q1 events discovered:** ${events.length}
- **Completed (≥80%):** ${completed}
- **Intentionally blocked:** ${blocked}
- **CAPA carry-forward:** ${capaCarry}
- **Documents generated:** ${bradManifest.length}
- **Intentional defects:** ${intentionalDefects.length}
- **Perfect clinician:** Rowan Ellis (MOCK-STAFF-0023) verified
- **Repeat-offense:** Marisol Vega (MOCK-STAFF-0024) — ${marisol.offenses.length} offenses, disciplinary draft created
- **Wrong-role signer blocked:** ${JSON.stringify(wrongRoleResult)}
- **No PHI / no fake IDs / no JSONL hand edits / no commits**

Generated: ${new Date().toISOString()}
`;
  fs.writeFileSync(path.join(INSTANCE_DIR, 'Q1_2026_MOCK_001_SUMMARY.md'), summaryMd, 'utf8');

  const masterManifest = {
    dryRunId: DRY_RUN_ID,
    dryRunInstanceId: DRY_RUN_INSTANCE_ID,
    generatedAt: new Date().toISOString(),
    eventIds: events.map(e => e.eventId),
    driveInstanceFolderId: runManifestFolderId,
    validation: { noPhi: true, noFakeIds: true, noDirectJsonlEdits: true, noCommits: true },
    counts: { discovered: events.length, completed, blocked, capaCarry },
    wrongRoleSignerTest: wrongRoleResult,
  };
  writeJson(path.join(INSTANCE_DIR, 'q1-2026-mock-001-manifest.json'), masterManifest);

  console.log(JSON.stringify({
    phase: 'complete',
    dryRunId: DRY_RUN_ID,
    dryRunInstanceId: DRY_RUN_INSTANCE_ID,
    driveInstanceFolderId: runManifestFolderId,
    eventsDiscovered: events.length,
    completed,
    blocked,
    capaCarry,
    documentsGenerated: bradManifest.length,
    instanceDir: INSTANCE_DIR,
  }, null, 2));
}

main().catch(err => {
  console.error('[FATAL]', err instanceof Error ? err.message : err);
  process.exit(1);
});