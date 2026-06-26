/**
 * Evidence Intake service — the orchestrator that binds the pure intake domain
 * to the regulatory execution store (persistence + audit) and to the real
 * server-side Google Drive integration.
 *
 * Truthful-Drive invariant (Section 9D): a Drive upload is "uploaded" ONLY when
 * the real Drive service returns a real file id. This service never marks
 * evidence uploaded/locked on a local simulation. Drive I/O goes through an
 * injected DriveIntakeClient so the orchestration is testable without network;
 * the production client (CalendarApi) talks to the server which holds the
 * service-account key.
 */

import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import type { EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { decideDedup, type DedupDecision, type KnownEvidenceEntry } from './dedup';
import {
  buildPacketTaskPlan,
  resolvePacketSignatureRequirement,
  type PacketSigner,
  type PacketTaskSpec,
} from './signing';
import {
  intakeId,
  type CanonicalEvidence,
  type DriveUploadStatus,
  type EvidenceSourceRecord,
  type IntakeAuditEvent,
} from './intakeModel';

type Store = ReturnType<typeof useRegulatoryExecutionStore.getState>;

/** Result envelope from a real Drive upload (mirrors server UploadEvidenceResponse). */
export interface DriveUploadOutcome {
  ok: boolean;
  driveFileId?: string;
  driveFolderId?: string;
  driveFolderPath?: string;
  driveWebViewLink?: string;
  errorCode?: string;
  errorMessage?: string;
}

/** Abstract Drive client — production = CalendarApi; tests inject a fake. */
export interface DriveIntakeClient {
  uploadCanonical(input: {
    eventId: string;
    canonicalEvidenceId: string;
    classification: string;
    filingPeriodKey: string;
    fileName: string;
    title: string;
  }): Promise<DriveUploadOutcome>;
}

export interface IntakeServiceOptions {
  store?: Store;
  actor?: string;
}

function getStore(opts?: IntakeServiceOptions): Store {
  return opts?.store ?? useRegulatoryExecutionStore.getState();
}

/** Map intake source records the store already knows about into dedup entries. */
export function knownEvidenceFromStore(store: Store, eventKey: string): KnownEvidenceEntry[] {
  const docs: EvidenceDoc[] = (store.evidence?.[eventKey] ?? []) as EvidenceDoc[];
  return docs
    .filter((d) => d.artifactVersion === 'evidence-intake-v1')
    .map((d) => {
      const meta = safeParse(d.note);
      return {
        evidenceId: d.id,
        identityScope: String(meta?.identityScope ?? d.checksum ?? d.id),
        idempotencyKey: String(meta?.idempotencyKey ?? d.checksum ?? d.id),
        contentHash: String(meta?.contentHash ?? d.checksum ?? ''),
      } satisfies KnownEvidenceEntry;
    });
}

function safeParse(s?: string): Record<string, unknown> | null {
  if (!s) return null;
  try { return JSON.parse(s) as Record<string, unknown>; } catch { return null; }
}

export interface PersistResult {
  decision: DedupDecision;
  canonical: CanonicalEvidence | null;
  evidenceId: string | null;
  /** True when no new canonical record was created (duplicate reuse). */
  reused: boolean;
}

/**
 * Persist a source record as canonical evidence (idempotent). Drive status is
 * 'pending' until a real Drive upload completes via applyDriveOutcome().
 */
export function persistCanonicalEvidence(
  record: EvidenceSourceRecord,
  ctx: {
    eventKey: string;
    eventId?: string;
    workflowId?: string;
    /** Policy refs from the bound CES event (required by the store's evidence guard). */
    policyIds?: string[];
    swimlaneId?: string;
    packetId?: string;
    identityScope: string;
    idempotencyKey: string;
  },
  opts?: IntakeServiceOptions,
): PersistResult {
  const store = getStore(opts);
  const actor = opts?.actor ?? 'Brad';

  if (record.status === 'needs_date_review' || !record.filingPeriodKey || !record.filingQuarterKey) {
    // Never file a record whose created date is unresolved.
    audit(store, ctx.eventKey, 'CREATED_DATE_REVIEW_REQUIRED', 'evidence', record.sourceRecordKey, {
      reason: 'Created date unresolved; not filed.',
    });
    return { decision: { kind: 'new', identityScope: ctx.identityScope, idempotencyKey: ctx.idempotencyKey }, canonical: null, evidenceId: null, reused: false };
  }

  const known = knownEvidenceFromStore(store, ctx.eventKey);
  const decision = decideDedup(
    {
      sourceSystem: record.sourceSystem,
      sourceRecordId: record.sourceRecordId,
      sourceSystemCreatedAt: record.sourceSystemCreatedAt,
      contentHash: record.contentHash,
      sourcePointer: record.sourcePointer,
    },
    known,
  );

  if (decision.kind === 'duplicate') {
    audit(store, ctx.eventKey, 'DUPLICATE_DETECTED', 'evidence', decision.existingEvidenceId, {
      reason: `Idempotent re-upload of ${record.sourcePointer}.`,
    });
    return { decision, canonical: null, evidenceId: decision.existingEvidenceId, reused: true };
  }

  const evidenceId = intakeId('EV-INTAKE', record.contentHash.slice(0, 8));
  const canonical: CanonicalEvidence = {
    evidenceId,
    batchId: record.batchId,
    sourceFileName: record.sourceFileName,
    sourceFileId: record.sourceFileId,
    sourcePointer: record.sourcePointer,
    sourceSystem: record.sourceSystem,
    sourceRecordId: record.sourceRecordId,
    sourceSystemCreatedAt: record.sourceSystemCreatedAt,
    occurrenceAt: record.occurrenceAt,
    reportedAt: record.reportedAt,
    filingPeriodKey: record.filingPeriodKey,
    filingQuarterKey: record.filingQuarterKey,
    classification: record.classification,
    contentHash: record.contentHash,
    recordVersion: decision.kind === 'new_version' ? 2 : 1,
    supersedesEvidenceId: decision.kind === 'new_version' ? decision.supersedesEvidenceId : undefined,
    driveFileId: null,
    driveFolderId: null,
    driveFolderPath: null,
    driveWebViewLink: null,
    driveUploadStatus: 'pending',
    linkedEventIds: ctx.eventId ? [ctx.eventId] : [],
    linkedWorkflowIds: ctx.workflowId ? [ctx.workflowId] : [],
    linkedSwimlaneIds: ctx.swimlaneId ? [ctx.swimlaneId] : [],
    linkedPacketIds: ctx.packetId ? [ctx.packetId] : [],
    createdAt: record.uploadedAt,
    createdBy: actor,
  };

  // Persist through the canonical store path (metadata only; bytes go to Drive).
  const storedId = store.uploadEvidence(ctx.eventKey, {
    taskId: 'evidence-intake',
    policyIds: ctx.policyIds ?? [],
    workflowId: ctx.workflowId,
    formIds: [],
    name: `${record.classification} • ${record.sourcePointer} (${record.filingPeriodKey})`,
    kind: 'attachment',
    sizeLabel: '1 record',
    artifactType: 'evidence',
    artifactVersion: 'evidence-intake-v1',
    artifactId: evidenceId,
    driveUploadStatus: 'pending',
    supersedesEvidenceId: canonical.supersedesEvidenceId,
    note: JSON.stringify({
      evidenceId,
      identityScope: ctx.identityScope,
      idempotencyKey: ctx.idempotencyKey,
      contentHash: record.contentHash,
      classification: record.classification,
      filingPeriodKey: record.filingPeriodKey,
      filingQuarterKey: record.filingQuarterKey,
      occurrenceAt: record.occurrenceAt,
      reportedAt: record.reportedAt,
      sourceSystemCreatedAt: record.sourceSystemCreatedAt,
      sourcePointer: record.sourcePointer,
      recordVersion: canonical.recordVersion,
      supersedesEvidenceId: canonical.supersedesEvidenceId,
      linkedEventIds: canonical.linkedEventIds,
      linkedPacketIds: canonical.linkedPacketIds,
      driveUploadStatus: 'pending',
    }),
  }, actor);

  // Honesty: the store's evidence guard rejects orphan/invalid evidence
  // (no real event / policy / workflow). If it returned '', the record was NOT
  // persisted — do NOT fabricate a success with our local id.
  if (!storedId) {
    audit(store, ctx.eventKey, 'CREATED_DATE_REVIEW_REQUIRED', 'evidence', record.sourceRecordKey, {
      reason: 'Canonical evidence not persisted: bind intake to a real CES event with policy + workflow before filing.',
    });
    return { decision, canonical: null, evidenceId: null, reused: false };
  }
  // Reconcile our id with the store's assigned id.
  const finalId = storedId;
  canonical.evidenceId = finalId;

  audit(store, ctx.eventKey, decision.kind === 'new_version' ? 'EVIDENCE_VERSION_CREATED' : 'SOURCE_RECORD_EXTRACTED', 'evidence', finalId, {
    after: { filingPeriodKey: record.filingPeriodKey, classification: record.classification },
  });
  audit(store, ctx.eventKey, 'CREATED_DATE_RESOLVED', 'evidence', finalId, {
    after: { resolvedCreatedAt: record.resolvedCreatedAt, source: record.createdDateSource, confidence: record.createdDateConfidence },
  });
  audit(store, ctx.eventKey, 'EVIDENCE_CLASSIFIED', 'evidence', finalId, {
    after: { classification: record.classification, confidence: record.classificationConfidence },
  });

  return { decision, canonical, evidenceId: finalId, reused: false };
}

/**
 * Apply the result of a REAL Drive upload to a canonical evidence record.
 * Honest: only 'uploaded' on a real driveFileId; otherwise 'failed' with error.
 */
export function applyDriveOutcome(
  eventKey: string,
  evidenceId: string,
  outcome: DriveUploadOutcome,
  opts?: IntakeServiceOptions,
): { driveUploadStatus: DriveUploadStatus } {
  const store = getStore(opts);
  if (outcome.ok && outcome.driveFileId) {
    store.attachDriveMetadata(eventKey, evidenceId, {
      driveFileId: outcome.driveFileId,
      driveFolderId: outcome.driveFolderId,
      webViewLink: outcome.driveWebViewLink,
      driveUploadedAt: new Date().toISOString(),
      driveUploadStatus: 'uploaded',
    });
    audit(store, eventKey, 'DRIVE_UPLOAD_COMPLETED', 'evidence', evidenceId, {
      after: { driveFileId: outcome.driveFileId, driveFolderPath: outcome.driveFolderPath },
    });
    return { driveUploadStatus: 'uploaded' };
  }
  // Failure: keep the record, mark failed, retain the error, allow retry.
  store.attachDriveMetadata(eventKey, evidenceId, { driveUploadStatus: 'failed' });
  audit(store, eventKey, 'DRIVE_UPLOAD_FAILED', 'evidence', evidenceId, {
    reason: outcome.errorMessage ?? outcome.errorCode ?? 'Drive upload failed; evidence not marked uploaded or locked.',
  });
  return { driveUploadStatus: 'failed' };
}

/** Create a draft form instance from a REAL form id (never invents an id). */
export function createDraftFormInstance(
  eventId: string,
  formId: string,
  policyIds: string[],
  workflowId: string | undefined,
  opts?: IntakeServiceOptions,
): string | null {
  const store = getStore(opts);
  const instance = store.generateFormInstance(eventId, formId, policyIds, workflowId);
  if (!instance) return null;
  audit(store, eventId, 'DRAFT_FORM_CREATED', 'formInstance', instance.id, { after: { formId, generatedBy: 'brad' } });
  return instance.id;
}

/** Build + persist the deterministic packet task plan (idempotent). */
export function createPacketTasks(
  input: {
    eventId: string;
    packetId: string;
    workflowId?: string;
    swimlaneId?: string;
    requiredSignerRoles: string[];
    signer?: PacketSigner;
    hasAgenda?: boolean;
    hasDraftForms?: boolean;
    hasUnresolvedDates?: boolean;
  },
  opts?: IntakeServiceOptions,
): PacketTaskSpec[] {
  const store = getStore(opts);
  const specs = buildPacketTaskPlan(input);
  for (const spec of specs) {
    store.createTask(input.eventId, {
      id: spec.taskId,
      title: spec.title,
      workflowId: spec.workflowId,
      taskSourceType: 'generated',
      source: 'generated',
      assignedRole: spec.assignedRole,
    }, { adminOverride: true, reason: 'Evidence Intake packet task plan (deterministic).' });
    const auditEvent: IntakeAuditEvent = spec.kind === 'sign_packet_attestation' ? 'SIGNATURE_TASK_CREATED' : 'REVIEW_TASK_CREATED';
    audit(store, input.eventId, auditEvent, 'task', spec.taskId, { after: { kind: spec.kind } });
  }
  return specs;
}

export { resolvePacketSignatureRequirement };

function audit(
  store: Store,
  eventId: string,
  action: IntakeAuditEvent,
  entityType: 'eventInstance' | 'task' | 'formInstance' | 'evidence' | 'approval',
  entityId: string,
  opts?: { before?: unknown; after?: unknown; reason?: string },
): void {
  try {
    store.appendTaskAuditEvent(eventId, entityType, entityId, action, opts);
  } catch {
    /* audit must never break the pipeline; failure is itself non-fatal here */
  }
}
