import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCesExecutionDefinition, loadCesExecutionSnapshot } from '../server/cesCalendarCompletion.js';
import { getCesEnrichment } from '../server/cesCalendarEventBuilder.js';
import { getCesMetadataStore, type CesEvidenceRef } from '../server/cesMetadataStore.js';
import {
  evidenceToSupportRef,
  getCesExecutionState,
  updateCesApprovalStatus,
  updateCesAuditCloseoutStatus,
  updateCesFormStatus,
  updateCesTaskStatus,
  type CesExecutionSupportRef,
} from '../server/cesExecutionStateStore.js';
import { store as ecignStore } from '../server/ecign/store.js';
import { syncEvent } from '../server/sync/eventSync.js';
import { buildEnrichedPlannerPayloadLive } from '../server/cesCalendarEventBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(repoRoot, '.env') });

const EVENT_ID = 'qapi_meeting-20260609-10';
const ACTOR = 'dummy.cm@example.test';
const SOURCE = 'script:reconcileQapiCesCompletionState';
const CANONICAL_FORM_INSTANCE_ID = 'qapi_meeting-20260609-10-QA-FM-001-001';

function isAttachedDriveEvidence(ref: CesEvidenceRef): boolean {
  return ref.attachmentStatus === 'attached'
    && !!ref.driveFileId
    && !!ref.driveFileUrl
    && ref.contentStatus !== 'missing';
}

function isCredentialProbe(ref: CesEvidenceRef): boolean {
  const value = [ref.evidenceId, ref.fileName, ref.taskId, ref.artifactId].filter(Boolean).join(' ').toLowerCase();
  return value.includes('credential alignment probe') || value.includes('_credential_alignment_probe');
}

function byName(items: CesEvidenceRef[], name: string): CesEvidenceRef {
  const needle = name.toLowerCase();
  const found = items.find(item => item.fileName.toLowerCase().includes(needle));
  if (!found) throw new Error(`Missing required Drive-backed evidence: ${name}`);
  return found;
}

function support(...refs: CesEvidenceRef[]): CesExecutionSupportRef[] {
  return refs.map(evidenceToSupportRef);
}

async function assertSignedPackage(evidenceItems: CesEvidenceRef[]): Promise<CesEvidenceRef> {
  const instance = await ecignStore.getInstance(CANONICAL_FORM_INSTANCE_ID);
  if (!instance) throw new Error(`Missing canonical eCign form instance: ${CANONICAL_FORM_INSTANCE_ID}`);
  if (instance.state !== 'signed_locked') {
    throw new Error(`Canonical eCign form instance is not signed_locked: ${instance.state}`);
  }
  const signatures = await ecignStore.listSignatures(CANONICAL_FORM_INSTANCE_ID);
  const requiredFields = instance.required_signers
    .filter(signer => signer.required !== false && signer.required_for_final_package !== false)
    .map(signer => signer.field_id);
  const signedFields = new Set(signatures.map(signature => signature.field_id));
  const missing = requiredFields.filter(fieldId => !signedFields.has(fieldId));
  if (missing.length) {
    throw new Error(`Canonical eCign form instance is missing required signatures: ${missing.join(', ')}`);
  }
  const signedPackage = evidenceItems.find(item =>
    item.artifactId === 'ART-qapi_meeting-20260609-10-QA-FM-001-001'
    || item.formInstanceId === CANONICAL_FORM_INSTANCE_ID
    || item.fileName.toLowerCase().includes('signed package')
  );
  if (!signedPackage) throw new Error('Missing Drive-backed signed package evidence.');
  return signedPackage;
}

async function main() {
  const enrichment = getCesEnrichment(EVENT_ID);
  if (!enrichment) throw new Error(`No CES enrichment found for ${EVENT_ID}`);
  const definition = buildCesExecutionDefinition(enrichment);

  const beforeSnapshot = await loadCesExecutionSnapshot(enrichment);
  const beforeState = await getCesExecutionState(EVENT_ID);

  const evidenceItems = (await getCesMetadataStore().listEvidence(EVENT_ID))
    .filter(isAttachedDriveEvidence);
  const requiredEvidenceItems = evidenceItems.filter(item => !isCredentialProbe(item));

  const agenda = byName(requiredEvidenceItems, 'QAPI Agenda');
  const metrics = byName(requiredEvidenceItems, 'QAPI Metrics Report');
  const pip = byName(requiredEvidenceItems, 'Active PIP Status');
  const minutes = byName(requiredEvidenceItems, 'QAPI Meeting Minutes');
  const gbSummary = byName(requiredEvidenceItems, 'Governing Body Summary Package');
  const signedPackage = await assertSignedPackage(requiredEvidenceItems);

  await updateCesTaskStatus(EVENT_ID, 'qapi-data', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'Metrics and PIP evidence are Drive-backed and attached.',
    supportingEvidence: support(metrics, pip),
  }, definition);
  await updateCesTaskStatus(EVENT_ID, 'qapi-packet', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'QAPI packet source evidence is Drive-backed and attached.',
    supportingEvidence: support(agenda, metrics, pip),
  }, definition);
  await updateCesTaskStatus(EVENT_ID, 'qapi-meeting', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'Meeting minutes evidence and signed package are Drive-backed.',
    supportingEvidence: support(minutes, signedPackage),
  }, definition);
  await updateCesTaskStatus(EVENT_ID, 'qapi-minutes', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'QAPI meeting minutes signed package is locked and Drive-backed.',
    supportingEvidence: support(signedPackage),
  }, definition);
  await updateCesTaskStatus(EVENT_ID, 'qapi-feed', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'Governing Body summary package evidence is Drive-backed and attached.',
    supportingEvidence: support(gbSummary),
  }, definition);

  await updateCesFormStatus(EVENT_ID, 'FRM-QA-001', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'QAPI Agenda evidence is Drive-backed and attached.',
    supportingEvidence: support(agenda),
  }, definition);
  await updateCesFormStatus(EVENT_ID, 'FRM-QA-002', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'QAPI Metrics Report evidence is Drive-backed and attached.',
    supportingEvidence: support(metrics),
  }, definition);
  await updateCesFormStatus(EVENT_ID, 'FRM-QA-003', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'Active PIP Status evidence is Drive-backed and attached.',
    supportingEvidence: support(pip),
  }, definition);
  await updateCesFormStatus(EVENT_ID, 'QA-FM-001', 'complete', {
    updatedBy: ACTOR,
    source: SOURCE,
    note: 'QAPI Meeting Minutes canonical eCign package is signed_locked and Drive-backed.',
    supportingEvidence: support(signedPackage),
  }, definition);

  await updateCesApprovalStatus(EVENT_ID, 'qapi-rule-minutes', 'approved', {
    updatedBy: ACTOR,
    source: SOURCE,
    targetKind: 'minutes',
    targetLabel: 'QAPI Minutes',
    approverRole: 'QAPI Committee Chair',
    note: 'Minutes approval supported by locked eCign signed package.',
    supportingEvidence: support(signedPackage),
  }, definition);
  await updateCesApprovalStatus(EVENT_ID, 'qapi-rule-event', 'approved', {
    updatedBy: ACTOR,
    source: SOURCE,
    targetKind: 'event',
    targetLabel: 'Close QAPI meeting',
    approverRole: 'QAPI Committee Chair',
    note: 'Event closeout supported by required evidence and locked eCign package.',
    supportingEvidence: support(agenda, metrics, pip, minutes, gbSummary, signedPackage),
  }, definition);
  await updateCesAuditCloseoutStatus(EVENT_ID, 'certified', {
    updatedBy: ACTOR,
    source: SOURCE,
    certifiedBy: ACTOR,
    certifiedRole: 'QAPI Committee Chair',
    note: 'All required QAPI evidence, forms, approvals, and eCign package are complete.',
    supportingEvidence: support(agenda, metrics, pip, minutes, gbSummary, signedPackage),
  }, definition);

  const afterState = await getCesExecutionState(EVENT_ID);
  const afterSnapshot = await loadCesExecutionSnapshot(enrichment);

  const { payload } = await buildEnrichedPlannerPayloadLive(enrichment, { version: 100 });
  const syncResult = await syncEvent(payload, {
    trigger: SOURCE,
    actor: ACTOR,
    env: enrichment.env ?? 'SANDBOX',
  });

  console.log(JSON.stringify({
    eventId: EVENT_ID,
    before: {
      completionPercent: beforeSnapshot.completionPercent,
      breakdown: beforeSnapshot.breakdown,
      statePresent: !!beforeState,
    },
    after: {
      completionPercent: afterSnapshot.completionPercent,
      breakdown: afterSnapshot.breakdown,
      statusLabel: afterSnapshot.statusLabel,
      blockers: afterSnapshot.blockers,
      tasksComplete: `${afterSnapshot.tasksCompleteCount}/${afterSnapshot.tasksTotalCount}`,
      formsComplete: `${afterSnapshot.formsCompleteCount}/${afterSnapshot.requiredFormsCount}`,
      auditReadyPercent: afterSnapshot.auditReadyPercent,
    },
    evidence: {
      driveBackedAttached: evidenceItems.length,
      requiredNonProbe: requiredEvidenceItems.length,
      credentialProbeExcluded: evidenceItems.length - requiredEvidenceItems.length,
    },
    ecign: {
      formInstanceId: CANONICAL_FORM_INSTANCE_ID,
      signedPackageDriveFileId: signedPackage.driveFileId,
      signedPackageArtifactId: signedPackage.artifactId,
    },
    calendarSync: {
      action: syncResult.action,
      ok: syncResult.ok,
      googleEventId: syncResult.google_event_id,
    },
    stateUpdatedAt: afterState?.updatedAt,
  }, null, 2));
}

main().catch(err => {
  console.error('Fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
