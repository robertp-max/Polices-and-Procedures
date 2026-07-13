// @vitest-environment node
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';

import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import type { PacketForLock } from '@/policy/qapi/validateQapiPacketForLock';
import type { QapiPacketOptions, QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';
import { FORMS_CATALOG } from '@/policy/data/formsCatalog';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import {
  buildQapiPacketModel,
} from '@/policy/packets/qapi/buildQapiPacketModel';
import type {
  QapiPacketModelPayload,
} from '@/policy/packets/qapi/buildQapiPacketModel';
import {
  injectCanonicalForms,
} from '@/policy/packets/qapi/formInjection';
import type {
  CanonicalFormDefinition,
  CanonicalFormRequirement,
  FormCompletionEvidence,
  FormInjectionResult,
  PacketFormAttachmentReference,
  PacketFormInstance,
} from '@/policy/packets/qapi/formInjection';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';
import {
  serializeKpisSidecarPayload,
  toKpisSidecarPayload,
} from '@/policy/packets/analysis/trends/snapshotSerializer';
import { resolveDriveDestination } from '@/policy/packets/registries/driveDestinations';
import { PACKET_TEMPLATES } from '@/policy/packets/registries/templateRegistry';
import { createSourceFormUtilizationReport } from '@/policy/packets/sources/sourceUtilization';
import type { SourceFormUtilizationReport } from '@/policy/packets/sources/sourceUtilization';
import { validatePacket } from '@/policy/packets/validation/validatePacket';
import type { ValidatePacketInput, ValidatePacketOptions } from '@/policy/packets/validation/validatePacket';
import {
  assertPacketTransition,
  PACKET_LIFECYCLE_TO_APPENDIX_D,
} from '@/policy/packets/contracts';
import type {
  DriveArtifactPointer,
  DriveDestination,
  DriveDestinationRequest,
  PacketDriveConnector,
  PacketEnvelope,
  PacketInstance,
  PacketLifecycleStatus,
  PacketModel,
  PacketSidecarPayload,
  PacketSignerTask,
  PacketValidationResult,
  PublishArtifactsRequest,
  PublishArtifactsResult,
  ReadSidecarRequest,
  VerifyArtifactHashRequest,
  VerifyArtifactHashResult,
} from '@/policy/packets/contracts';

import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS,
  QAPI_FIXTURE_PATHS,
} from './loadQapiFixture';

const GENERATED_AT = '2026-04-09T12:00:00.000Z';
const SIGNED_AT = '2026-04-09T13:15:00.000Z';
const PUBLISHED_AT = '2026-04-09T13:30:00.000Z';
const CERTIFIED_AT = '2026-04-09T13:45:00.000Z';
const LOCKED_AT = '2026-04-09T14:00:00.000Z';
const LOCAL_PUBLISHED_BY = 'local-drive-adapter';
const ADMIN_SIGNER = {
  userId: 'MOCK-CLIN-0029',
  name: 'Riley Chen',
  email: 'riley.chen@example.test',
  role: 'Administrator',
} as const;
const CLINICAL_MANAGER_SIGNER = {
  userId: 'MOCK-CLIN-0026',
  name: 'Jordan Blake',
  email: 'jordan.blake@example.test',
  role: 'Clinical Manager',
} as const;
const QAPI_CHAIR_SIGNER = {
  userId: 'MOCK-CLIN-0030',
  name: 'Avery Quinn',
  email: 'avery.quinn@example.test',
  role: 'QAPI Chair',
} as const;
const Q1_GOVERNANCE_SIGNERS = [ADMIN_SIGNER, CLINICAL_MANAGER_SIGNER, QAPI_CHAIR_SIGNER] as const;
const Q1_REQUIRED_SIGNER_CAPACITIES = Q1_GOVERNANCE_SIGNERS.map((signer) => signer.role);
type Q1GovernanceSigner = (typeof Q1_GOVERNANCE_SIGNERS)[number];
const ANNUAL_QAPI_FORM_ID = 'QA-FM-010';
const LOCAL_DESTINATION_TEMPLATE =
  'local-drive/{agencyId}/{packetTemplateId}/{eventInstanceId}/{workflowInstanceId}/{reportingPeriodStart}/{reportingPeriodEnd}';

export const Q1_E2E_TIMESTAMPS = {
  generatedAt: GENERATED_AT,
  signedAt: SIGNED_AT,
  publishedAt: PUBLISHED_AT,
  certifiedAt: CERTIFIED_AT,
  lockedAt: LOCKED_AT,
} as const;

export interface SignedPackageFallback {
  readonly packetInstanceId: string;
  readonly packetVersion: number;
  readonly contentHash: string;
  readonly html: string;
  readonly pdfBytesBase64: string;
  readonly pdfSha256: string;
  readonly pdfFallbackUsed: true;
  readonly envelope: PacketEnvelope;
}

export interface LocalPacketDriveAdapter extends PacketDriveConnector {
  readonly listPointers: () => readonly DriveArtifactPointer[];
  readonly publishRequestCount: () => number;
}

export interface PacketLifecycleStore {
  readonly createOrGetDraft: (
    instance: PacketInstance,
    idempotencyKey: string,
  ) => { readonly instance: PacketInstance; readonly idempotentReplay: boolean };
  readonly transitionTo: (packetInstanceId: string, nextStatus: PacketLifecycleStatus) => PacketInstance;
  readonly applyPublication: (
    packetInstanceId: string,
    publishResult: PublishArtifactsResult,
  ) => PacketInstance;
  readonly certify: (
    packetInstanceId: string,
    validation: PacketValidationResult,
  ) => PacketInstance;
  readonly lock: (
    packetInstanceId: string,
    validation: PacketValidationResult,
  ) => PacketInstance;
  readonly attemptPostLockEdit: (
    packetInstanceId: string,
    description: string,
  ) => PacketInstance;
  readonly createAmendment: (
    packetInstanceId: string,
    reason: string,
  ) => PacketInstance;
  readonly listInstances: () => readonly PacketInstance[];
}

export interface Q1PipelineResult {
  readonly sourceText: string;
  readonly parsedFileName: string;
  readonly model: PacketModel;
  readonly payload: QapiPacketModelPayload;
  readonly renderPayload: QapiPacketRenderPayload;
  readonly formInjection: FormInjectionResult;
  readonly sourceUtilization: SourceFormUtilizationReport;
  readonly preEnvelopeValidation: PacketValidationResult;
  readonly initialValidation: PacketValidationResult;
  readonly lockValidation: PacketValidationResult;
  readonly envelope: PacketEnvelope;
  readonly signedModel: PacketModel;
  readonly signedHtml: string;
  readonly signedPackage: SignedPackageFallback;
  readonly drive: LocalPacketDriveAdapter;
  readonly destination: DriveDestination;
  readonly firstPublish: PublishArtifactsResult;
  readonly replayPublish: PublishArtifactsResult;
  readonly store: PacketLifecycleStore;
  readonly createdDraft: PacketInstance;
  readonly idempotentDraftReplay: PacketInstance;
  readonly certifiedInstance: PacketInstance;
  readonly lockedInstance: PacketInstance;
  readonly amendmentInstance: PacketInstance;
  readonly regeneratedFormInjection: FormInjectionResult;
  readonly regeneratedModel: PacketModel;
}

export interface ContaminationGuardResult {
  readonly sourceText: string;
  readonly model: PacketModel;
  readonly payload: QapiPacketModelPayload;
  readonly selectedText: string;
}

export async function runQ1EndToEndLifecycle(): Promise<Q1PipelineResult> {
  const sourceText = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
  const parsedFileName = 'QAPI-Q1-DS-001.txt';
  const model = buildQ1ModelFromText(sourceText, parsedFileName);
  const payload = qapiPayload(model);
  const formInjection = injectQ1Forms(model);
  const sealedModel = sealModel(model, formInjection);
  const draftInstance = packetInstanceFromModel(sealedModel, formInjection.formInstances);
  const sourceUtilization = sourceUtilizationWithLocalPointers(
    payload.sourceUtilization,
    sealedModel.identity.packetInstanceId,
    sealedModel.identity.contentHash ?? 'unsealed-draft',
  );
  const requiredFormIds = formInjection.formInstances.map((form) => form.canonicalFormId);
  const requiredEvidence = requiredEvidenceForQ1(payload);
  const preEnvelopeValidation = validateQ1Packet(sealedModel, draftInstance, payload, sourceUtilization, {
    requiredEvidence,
    requiredFormIds,
  });
  const envelope = completeEnvelopeFor(sealedModel, formInjection.formInstances);
  const initialValidation = validateQ1Packet(sealedModel, draftInstance, payload, sourceUtilization, {
    envelopes: [envelope],
    requiredEvidence,
    requiredFormIds,
    requiredSignerCapacities: Q1_REQUIRED_SIGNER_CAPACITIES,
  });
  const lockValidation = validateQ1Packet(sealedModel, draftInstance, payload, sourceUtilization, {
    acknowledgedWarningIds: initialValidation.findings
      .filter((finding) => finding.severity === 'warning')
      .map((finding) => finding.findingId),
    envelopes: [envelope],
    requiredEvidence,
    requiredFormIds,
    requiredSignerCapacities: Q1_REQUIRED_SIGNER_CAPACITIES,
  });
  const signedModel = sealModel(withValidationBanner(sealedModel, lockValidation), formInjection);
  const signedHtml = renderPacketModel(signedModel);
  const signedPackage = buildSignedPackageFallback(signedModel, signedHtml, envelope);
  const drive = createLocalPacketDriveAdapter();
  const destination = await drive.resolveDestination(destinationRequestFor(signedModel));
  const firstPublish = await publishSignedPackage(drive, destination, signedModel, payload, signedPackage);
  const replayPublish = await publishSignedPackage(drive, destination, signedModel, payload, signedPackage);
  const store = createPacketLifecycleStore();
  const createdDraft = store.createOrGetDraft(
    packetInstanceFromModel(signedModel, formInjection.formInstances),
    signedModel.identity.contentHash ?? 'missing-content-hash',
  ).instance;
  const idempotentDraftReplay = store.createOrGetDraft(
    packetInstanceFromModel(signedModel, formInjection.formInstances),
    signedModel.identity.contentHash ?? 'missing-content-hash',
  ).instance;
  drivePublishedPath(store, createdDraft.packetInstanceId, firstPublish, lockValidation);
  const certifiedInstance = store.certify(createdDraft.packetInstanceId, lockValidation);
  const lockedInstance = store.lock(certifiedInstance.packetInstanceId, lockValidation);
  const amendmentInstance = store.createAmendment(lockedInstance.packetInstanceId, 'Post-lock minutes correction');
  const regeneratedModel = buildQ1ModelFromText(sourceText, parsedFileName);
  const regeneratedFormInjection = injectQ1Forms(regeneratedModel);

  return {
    sourceText,
    parsedFileName,
    model: signedModel,
    payload: qapiPayload(signedModel),
    renderPayload: qapiRenderPayload(signedModel),
    formInjection,
    sourceUtilization,
    preEnvelopeValidation,
    initialValidation,
    lockValidation,
    envelope,
    signedModel,
    signedHtml,
    signedPackage,
    drive,
    destination,
    firstPublish,
    replayPublish,
    store,
    createdDraft,
    idempotentDraftReplay,
    certifiedInstance,
    lockedInstance,
    amendmentInstance,
    regeneratedFormInjection,
    regeneratedModel,
  };
}

export function buildQ1ContaminationGuard(): ContaminationGuardResult {
  const sourceText = loadQapiFixture(QAPI_FIXTURE_PATHS.contaminated);
  const model = buildQ1ModelFromText(sourceText, 'QAPI-Q1Q2-CONTAMINATED.txt');
  const payload = qapiPayload(model);
  const selectedText = payload.segmentation.selectedSegment?.text ?? '';
  return { sourceText, model, payload, selectedText };
}

export function qapiPayload(model: PacketModel): QapiPacketModelPayload {
  const renderPayload = qapiRenderPayload(model);
  const value = renderPayload.qapiModel;
  if (!isRecord(value)) {
    throw new Error('QAPI packet model payload was not attached to the module payload.');
  }
  return value as unknown as QapiPacketModelPayload;
}

export function qapiRenderPayload(model: PacketModel): QapiPacketRenderPayload {
  const payload = model.modules[0]?.payload;
  if (!isRecord(payload) || !isRecord(payload.roll) || !isRecord(payload.lock)) {
    throw new Error('QAPI render payload was not attached to the packet model.');
  }
  return payload as QapiPacketRenderPayload;
}

export function collectQ2LeakMarkers(text: string): string[] {
  const q2Markers = [
    'Dataset ID: QAPI-Q2-DS-001',
    'Q2 BAIT SEGMENT',
    'SECTION 1 — PATIENT CENSUS (Q2)',
    'QM-APR-001',
    'AE-Q2-001',
    'INF-Q2-001',
    'CMP-Q2-001',
    'PIP-T-Q2-001',
    'CAP-Q2-001',
    'DT-Q2-001',
    '8/8 standing members',
    'Q2 Only Admin',
  ] as const;
  return q2Markers.filter((marker) => text.includes(marker));
}

export function malformedPercentageDisplays(payload: QapiPacketModelPayload): string[] {
  const displays = payload.kpiDashboard.cards.map((card) => card.currentValue.display);
  return displays.filter((display) => /(?:NaN|Infinity|undefined|null)%|%%/.test(display));
}

export function autoCreatedWorkflowInstanceIds(payload: QapiPacketModelPayload): string[] {
  return payload.workflowEvaluations
    .map((evaluation) => evaluation.newWorkflowInstanceId)
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
}

export function formInstanceIds(result: FormInjectionResult): string[] {
  return result.formInstances.map((form) => form.formInstanceId);
}

export function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function buildQ1ModelFromText(text: string, fileName: string): PacketModel {
  const options: QapiPacketOptions = {
    eventId: 'qapi-meeting-2026-04-09',
    workflowId: Q1_FIXTURE_EXPECTATIONS.workflowId,
    preparedBy: 'QA Coordinator',
    reviewer: 'Compliance Officer',
    chair: QAPI_CHAIR_SIGNER.name,
    recorder: 'QAPI Recorder',
    approvers: [
      ...Q1_GOVERNANCE_SIGNERS.map((signer) => ({
        role: signer.role,
        name: signer.name,
        authorityConfirmed: true,
      })),
    ],
    attendanceNote: '9/9 present — quorum met',
  };
  return buildQapiPacketModel({
    parsed: parseSourceFile({
      fileName,
      mimeType: 'text/plain',
      byteLength: Buffer.byteLength(text, 'utf8'),
      text,
    }),
    eventDateISO: Q1_FIXTURE_EXPECTATIONS.meetingDate,
    targetDatasetId: Q1_FIXTURE_EXPECTATIONS.datasetId,
    targetAgency: Q1_FIXTURE_EXPECTATIONS.agency,
    targetPeriod: Q1_FIXTURE_EXPECTATIONS.quarter,
    sourceId: fileName,
    generatedAt: GENERATED_AT,
    packetVersion: 1,
    options,
  });
}

function injectQ1Forms(model: PacketModel): FormInjectionResult {
  const quarterlyTemplate = PACKET_TEMPLATES.find(
    (template) => template.packet_template_id === 'qapi-quarterly',
  );
  if (quarterlyTemplate === undefined) {
    throw new Error('qapi-quarterly packet template was not registered.');
  }
  const quarterlyFormIds = uniqueSorted([...quarterlyTemplate.required_forms, 'QA-FM-005']);
  const requirements = [
    ...quarterlyFormIds.map((formId): CanonicalFormRequirement => ({
      canonicalFormId: formId,
      sourceClassification: formId === 'QA-FM-005' ? 'generated' : 'source',
      cadence: 'quarterly',
    })),
    {
      canonicalFormId: ANNUAL_QAPI_FORM_ID,
      sourceClassification: 'generated',
      cadence: 'annual',
    } satisfies CanonicalFormRequirement,
  ];
  const formDefinitions = requirements.map((requirement) => canonicalFormDefinition(requirement));
  return injectCanonicalForms({
    packetId: model.identity.packetId,
    packetType: model.identity.packetTemplateId,
    packetCadence: 'quarterly',
    eventId: model.identity.eventInstanceId,
    eventType: model.identity.eventFamilyId,
    workflowId: model.identity.workflowId,
    workflowInstanceId: model.identity.workflowInstanceId,
    generatedAt: GENERATED_AT,
    requiredForms: requirements,
    registrySources: {
      formsCatalog: { canonicalForms: formDefinitions },
    },
    completionEvidence: completionEvidenceFor(formDefinitions),
  });
}

function canonicalFormDefinition(requirement: CanonicalFormRequirement): CanonicalFormDefinition {
  const record = FORMS_DATASET.find((candidate) => candidate.id === requirement.canonicalFormId);
  const catalog = FORMS_CATALOG[requirement.canonicalFormId];
  const title = record?.name ?? catalog?.title ?? `${requirement.canonicalFormId} packet form`;
  return {
    canonicalFormId: requirement.canonicalFormId,
    title,
    version: '2026-Q1-UAT',
    sourceClassification: requirement.sourceClassification ?? 'source',
    ...(requirement.cadence === undefined ? {} : { cadence: requirement.cadence }),
    requiredFields: [{
      fieldId: 'source-record',
      label: `${title} source record`,
      required: true,
    }],
    signerRoles: requirement.cadence === 'annual' ? [] : ['QAPI Chair'],
  };
}

function completionEvidenceFor(
  definitions: readonly CanonicalFormDefinition[],
): FormCompletionEvidence[] {
  return definitions
    .filter((definition) => definition.cadence !== 'annual')
    .map((definition) => {
      const contentHash = hashText(`${definition.canonicalFormId}|${Q1_FIXTURE_EXPECTATIONS.datasetId}|${GENERATED_AT}`);
      const attachmentRef: PacketFormAttachmentReference = {
        attachmentId: `att-${slug(definition.canonicalFormId)}`,
        manifestEntryId: `manifest-${slug(definition.canonicalFormId)}`,
        contentHash,
      };
      return {
        canonicalFormId: definition.canonicalFormId,
        status: 'complete',
        requiredFields: definition.requiredFields.map((field) => ({
          fieldId: field.fieldId,
          valuePresent: true,
          evidenceRefIds: [`evidence-${slug(definition.canonicalFormId)}-${slug(field.fieldId)}`],
        })),
        signers: definition.signerRoles.map((role) => ({
          role,
          signerId: QAPI_CHAIR_SIGNER.userId,
          signedAt: SIGNED_AT,
          evidenceRefId: `signature-${slug(definition.canonicalFormId)}-${slug(role)}`,
        })),
        evidenceRefIds: [`evidence-${slug(definition.canonicalFormId)}`],
        contentHash,
        attachmentRef,
        completedAt: GENERATED_AT,
        updatedAt: GENERATED_AT,
      } satisfies FormCompletionEvidence;
    });
}

function sealModel(model: PacketModel, formInjection: FormInjectionResult): PacketModel {
  const contentHash = hashText(stableStringify({
    identity: { ...model.identity, contentHash: null },
    modules: model.modules.map((module) => ({
      moduleId: module.moduleId,
      order: module.order,
      payload: module.payload,
    })),
    forms: formInjection.formInstances.map((form) => ({
      canonicalFormId: form.canonicalFormId,
      formInstanceId: form.formInstanceId,
      contentHash: form.contentHash ?? null,
    })),
  }));
  return {
    ...model,
    identity: {
      ...model.identity,
      contentHash,
    },
    modules: model.modules.map((module) => ({
      ...module,
      contentHash: module.contentHash ?? hashText(`${contentHash}|${module.moduleId}`),
    })),
  };
}

function sourceUtilizationWithLocalPointers(
  report: SourceFormUtilizationReport,
  packetInstanceId: string,
  contentHash: string,
): SourceFormUtilizationReport {
  return createSourceFormUtilizationReport({
    sourcesAndFormsUsed: report.sourcesAndFormsUsed.map((sourceForm) => ({
      ...sourceForm,
      attachment: drivePointer({
        evidenceId: `source-${slug(sourceForm.formId)}`,
        packetInstanceId,
        artifactType: 'analysis',
        fileName: `${sourceForm.formId}.source.json`,
        mimeType: 'application/json',
        sha256: hashText(`${contentHash}|${sourceForm.formId}`),
        sizeBytes: 128,
        classification: 'synthetic-uat',
      }),
    })),
    expectedButMissing: [],
    suppliedButUnused: report.suppliedButUnused,
    generatedByTrigger: report.generatedByTrigger,
    carriedForward: report.carriedForward,
    conflicts: report.conflicts,
    excludedWithReason: report.excludedWithReason,
  });
}

function validateQ1Packet(
  model: PacketModel,
  instance: PacketInstance | null,
  payload: QapiPacketModelPayload,
  sourceUtilization: SourceFormUtilizationReport,
  options: ValidatePacketOptions,
): PacketValidationResult {
  const input: ValidatePacketInput = {
    model,
    instance,
    expectedAgencyId: Q1_FIXTURE_EXPECTATIONS.agency,
    expectedReportingPeriod: {
      start: Q1_FIXTURE_EXPECTATIONS.periodStart,
      end: Q1_FIXTURE_EXPECTATIONS.periodEnd,
      label: Q1_FIXTURE_EXPECTATIONS.quarterLabel,
    },
    expectedWorkflowId: Q1_FIXTURE_EXPECTATIONS.workflowId,
    segmentation: payload.segmentation,
    sourceUtilization,
    kpiDashboard: payload.kpiDashboard,
    workflowEvaluations: payload.workflowEvaluations,
    qapiLockPacket: qapiLockPacketFor(model, payload),
    validatedAt: GENERATED_AT,
    ...options,
  };
  return validatePacket(input);
}

function requiredEvidenceForQ1(payload: QapiPacketModelPayload): NonNullable<ValidatePacketOptions['requiredEvidence']> {
  return payload.workflowEvaluations.map((evaluation) => ({
    workflowId: evaluation.canonicalWorkflowId ?? Q1_FIXTURE_EXPECTATIONS.workflowId,
    evidenceLabel: `${evaluation.findingId} threshold-review source evidence`,
    evidenceId: evaluation.sourceRecordIds[0] ?? `evidence-${slug(evaluation.evaluationId)}`,
    formId: evaluation.requiredFormIds[0] ?? null,
  }));
}

function qapiLockPacketFor(model: PacketModel, payload: QapiPacketModelPayload): PacketForLock {
  const renderPayload = qapiRenderPayload(model);
  return {
    packetId: model.identity.packetId,
    packetType: 'final',
    html: 'Q1 QAPI packet validated through packet-platform end-to-end harness.',
    governanceRoles: Q1_GOVERNANCE_SIGNERS.map((signer) => ({
      role: signer.role,
      name: signer.name,
      authorityConfirmed: true,
    })),
    rollups: {
      activeCensus: payload.sourceCounts.activeCensus.value,
      recertCounts: renderPayload.roll.census.recertDue,
      highRiskRollupPresent: true,
      priorPeriodComparisonPresent: false,
      claimsTrend: false,
    },
    dateWindowViolations: [],
    addendum: {
      required: renderPayload.addendumRequired,
      generatedId: renderPayload.addendumRequired ? renderPayload.ref.addendumId : null,
    },
    signatures: Q1_GOVERNANCE_SIGNERS.map((signer) => qapiSignatureLine(signer)),
    sourceExceptions: [],
  };
}

function qapiSignatureLine(signer: Q1GovernanceSigner): NonNullable<PacketForLock['signatures']>[number] {
  return {
    role: signer.role,
    rendered: true,
    signerRecord: {
      signerId: signer.userId,
      signerName: signer.name,
      signerRole: signer.role,
      authorityBasis: `${signer.role} sign-off in ${Q1_FIXTURE_EXPECTATIONS.datasetId}`,
      timestamp: SIGNED_AT,
      evidenceId: `signature-${slug(signer.role)}`,
      artifactHash: hashText(`${Q1_FIXTURE_EXPECTATIONS.datasetId}|${signer.userId}|${SIGNED_AT}`),
    },
  };
}

function completeEnvelopeFor(
  model: PacketModel,
  formInstances: readonly PacketFormInstance[],
): PacketEnvelope {
  const envelopeId = `env-${slug(model.identity.packetInstanceId)}`;
  return {
    envelopeId,
    packetInstanceId: model.identity.packetInstanceId,
    frozenPacketVersion: model.identity.packetVersion,
    contentHash: model.identity.contentHash ?? 'missing-content-hash',
    memberFormInstanceIds: formInstances.map((form) => form.formInstanceId),
    signerTasks: Q1_GOVERNANCE_SIGNERS.map((signer, index) =>
      signerTask(envelopeId, `task-${slug(signer.role)}`, signer, index + 1),
    ),
    status: 'COMPLETED',
    preSignaturePdfUrl: null,
    attachmentManifestId: `manifest-${slug(model.identity.packetInstanceId)}`,
    evidenceManifestId: `evidence-${slug(model.identity.packetInstanceId)}`,
    signaturePlacementMapId: `sigmap-${slug(model.identity.packetInstanceId)}`,
    createdAt: GENERATED_AT,
    createdBy: LOCAL_PUBLISHED_BY,
    sentAt: GENERATED_AT,
    completedAt: SIGNED_AT,
    voidedAt: null,
    voidReason: null,
    expiresAt: null,
    idempotencyKey: `prepare-envelope:${model.identity.packetInstanceId}:${model.identity.contentHash ?? 'missing-content-hash'}`,
  };
}

function signerTask(
  envelopeId: string,
  signerTaskId: string,
  signer: Q1GovernanceSigner,
  order: number,
): PacketSignerTask {
  return {
    signerTaskId,
    envelopeId,
    requiredCapacity: signer.role,
    signerUserId: signer.userId,
    signerName: signer.name,
    signerEmail: signer.email,
    signerRole: signer.role,
    authorityVerified: true,
    order,
    required: true,
    dualCapacityRuleId: null,
    dualCapacities: null,
    status: 'COMPLETED',
    dueDate: null,
    expiresAt: null,
    signedAt: SIGNED_AT,
    declinedAt: null,
    declineReason: null,
    reminderCount: 0,
    attachmentAccessGranted: true,
    confidentialityAcknowledged: true,
  };
}

function packetInstanceFromModel(
  model: PacketModel,
  formInstances: readonly PacketFormInstance[],
): PacketInstance {
  return {
    packetInstanceId: model.identity.packetInstanceId,
    packetId: model.identity.packetId,
    packetVersion: model.identity.packetVersion,
    agencyId: model.identity.agencyId,
    eventFamilyId: model.identity.eventFamilyId,
    eventInstanceId: model.identity.eventInstanceId,
    archetypeId: model.identity.archetypeId,
    archetypeVersion: '1.0.0',
    packetTemplateId: model.identity.packetTemplateId,
    subtype: model.identity.subtype,
    workflowId: model.identity.workflowId,
    workflowInstanceId: model.identity.workflowInstanceId,
    reportingPeriodStart: model.identity.reportingPeriodStart,
    reportingPeriodEnd: model.identity.reportingPeriodEnd,
    dataThroughDate: model.identity.dataThroughDate,
    status: model.identity.status,
    moduleInstances: model.modules.map((module) => ({
      moduleInstanceId: module.moduleInstanceId,
      moduleId: module.moduleId,
      status: module.status,
      payload: module.payload,
      contentHash: module.contentHash,
      order: module.order,
      updatedAt: GENERATED_AT,
      updatedBy: LOCAL_PUBLISHED_BY,
    })),
    attachmentInstances: formInstances.map((form, index) => ({
      attachmentInstanceId: form.attachmentRef?.attachmentId ?? `att-${index + 1}`,
      attachmentTypeId: form.canonicalFormId,
      formInstanceId: form.formInstanceId,
      evidenceId: form.evidenceRefIds[0] ?? null,
      title: form.canonicalTitle,
      mimeType: 'application/pdf',
      pageStart: null,
      pageEnd: null,
      confidentialityLevel: 'synthetic-uat',
      driveUrl: null,
      contentHash: form.contentHash ?? null,
      status: 'validated',
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    })),
    blockerIds: [],
    warningIds: [],
    approvalIds: Q1_REQUIRED_SIGNER_CAPACITIES.map((capacity) => `approval-${slug(capacity)}`),
    signatureIds: Q1_REQUIRED_SIGNER_CAPACITIES.map((capacity) => `signature-${slug(capacity)}`),
    evidenceManifestId: `evidence-${slug(model.identity.packetInstanceId)}`,
    auditChronologyId: `audit-${slug(model.identity.packetInstanceId)}`,
    driveFolderUrl: null,
    finalArtifactUrl: null,
    createdAt: GENERATED_AT,
    createdBy: LOCAL_PUBLISHED_BY,
    updatedAt: GENERATED_AT,
    certifiedAt: null,
    lockedAt: null,
    contentHash: model.identity.contentHash,
    supersedesPacketInstanceId: null,
    supersededByPacketInstanceId: null,
    sourceClassification: model.classification === 'synthetic-uat' ? 'synthetic' : 'production',
  };
}

function withValidationBanner(model: PacketModel, validation: PacketValidationResult): PacketModel {
  const payload = qapiRenderPayload(model);
  const updatedPayload: QapiPacketRenderPayload = {
    ...payload,
    lock: {
      pass: validation.lockEligible,
      statusText: validation.lockEligible
        ? 'VALIDATION PASSED — eligible for lock pending signatures'
        : `NOT LOCKABLE — ${validation.counts.blocker} blocking item(s)`,
      findings: [],
    },
  };
  return {
    ...model,
    modules: model.modules.map((module) => ({
      ...module,
      payload: updatedPayload,
    })),
  };
}

function buildSignedPackageFallback(
  model: PacketModel,
  html: string,
  envelope: PacketEnvelope,
): SignedPackageFallback {
  const pdfBytes = Buffer.from([
    '%PDF-1.4',
    '% local deterministic packet-platform PDF fallback',
    `packet=${model.identity.packetInstanceId}`,
    `contentHash=${model.identity.contentHash ?? 'missing-content-hash'}`,
    `htmlSha256=${hashText(html)}`,
    '%%EOF',
    '',
  ].join('\n'), 'utf8');
  return {
    packetInstanceId: model.identity.packetInstanceId,
    packetVersion: model.identity.packetVersion,
    contentHash: model.identity.contentHash ?? 'missing-content-hash',
    html,
    pdfBytesBase64: pdfBytes.toString('base64'),
    pdfSha256: hashBytes(pdfBytes),
    pdfFallbackUsed: true,
    envelope,
  };
}

function createLocalPacketDriveAdapter(): LocalPacketDriveAdapter {
  const byIdempotencyKey = new Map<string, PublishArtifactsResult>();
  const pointersByFileId = new Map<string, DriveArtifactPointer>();
  const sidecarsByPacketAndKind = new Map<string, PacketSidecarPayload>();
  let requestCount = 0;
  return {
    async resolveDestination(request: DriveDestinationRequest): Promise<DriveDestination> {
      const resolved = resolveDriveDestination(request.destinationTemplate, {
        agencyId: request.agencyId,
        archetypeId: request.archetypeId,
        packetTemplateId: request.packetTemplateId,
        eventInstanceId: request.eventInstanceId,
        workflowInstanceId: request.workflowInstanceId,
        reportingPeriodStart: request.reportingPeriodStart,
        reportingPeriodEnd: request.reportingPeriodEnd,
      });
      const driveFolderId = `folder-${slug(hashText(resolved)).slice(0, 18)}`;
      return {
        driveFolderId,
        driveFolderUrl: `https://local.drive.test/folders/${driveFolderId}`,
        pathSegments: resolved.split('/'),
      };
    },
    async publishArtifacts(request: PublishArtifactsRequest): Promise<PublishArtifactsResult> {
      requestCount += 1;
      const existing = byIdempotencyKey.get(request.idempotencyKey);
      if (existing !== undefined) {
        return { ...existing, idempotentReplay: true };
      }
      const pointers = request.artifacts.map((artifact) => {
        const driveFileId = `file-${slug(hashText(`${request.idempotencyKey}|${artifact.artifactType}|${artifact.sha256}`)).slice(0, 20)}`;
        const pointer: DriveArtifactPointer = {
          evidenceId: `${request.packetInstanceId}:${artifact.artifactType}`,
          packetInstanceId: request.packetInstanceId,
          artifactType: artifact.artifactType,
          driveFileId,
          driveFileUrl: `https://local.drive.test/files/${driveFileId}/${encodeURIComponent(artifact.fileName)}`,
          driveFolderId: request.destination.driveFolderId,
          driveFolderUrl: request.destination.driveFolderUrl,
          sha256: artifact.sha256,
          mimeType: artifact.mimeType,
          sizeBytes: artifact.bytesBase64 === null
            ? 0
            : Buffer.byteLength(artifact.bytesBase64, 'base64'),
          classification: artifact.classification,
          retentionRule: artifact.retentionRule,
          publishedAt: PUBLISHED_AT,
          publishedBy: LOCAL_PUBLISHED_BY,
        };
        pointersByFileId.set(driveFileId, pointer);
        if (artifact.bytesBase64 !== null) {
          storeSidecarIfPresent(sidecarsByPacketAndKind, request.packetInstanceId, artifact.bytesBase64);
        }
        return pointer;
      });
      const result: PublishArtifactsResult = {
        idempotentReplay: false,
        pointers,
        publishedAt: PUBLISHED_AT,
      };
      byIdempotencyKey.set(request.idempotencyKey, result);
      return result;
    },
    async findPriorPacket() {
      return {
        found: false,
        packetInstanceId: null,
        driveFolderUrl: null,
        drivePdfUrl: null,
        contentHash: null,
        packetVersion: null,
        exclusions: [],
        notFoundBanner: 'PRIOR-PERIOD PACKET NOT FOUND — Trend comparison unavailable.',
      };
    },
    async readSidecar(request: ReadSidecarRequest): Promise<PacketSidecarPayload | null> {
      return sidecarsByPacketAndKind.get(sidecarKey(request.packetInstanceId, request.sidecarKind)) ?? null;
    },
    async verifyArtifactHash(request: VerifyArtifactHashRequest): Promise<VerifyArtifactHashResult> {
      const pointer = pointersByFileId.get(request.driveFileId);
      const actualSha256 = pointer?.sha256 ?? null;
      const match = actualSha256 === request.expectedSha256;
      return {
        driveFileId: request.driveFileId,
        expectedSha256: request.expectedSha256,
        actualSha256,
        match,
        status: actualSha256 === null ? 'unknown-not-recovered' : match ? 'matched' : 'mismatched',
      };
    },
    listPointers: () => [...pointersByFileId.values()],
    publishRequestCount: () => requestCount,
  };
}

function storeSidecarIfPresent(
  store: Map<string, PacketSidecarPayload>,
  packetInstanceId: string,
  bytesBase64: string,
): void {
  const decoded = Buffer.from(bytesBase64, 'base64').toString('utf8');
  if (!decoded.trim().startsWith('{')) return;
  const parsed: unknown = JSON.parse(decoded);
  if (!isRecord(parsed) || typeof parsed.kind !== 'string') return;
  store.set(sidecarKey(packetInstanceId, parsed.kind), parsed as unknown as PacketSidecarPayload);
}

function sidecarKey(packetInstanceId: string, kind: string): string {
  return `${packetInstanceId}:${kind}`;
}

function destinationRequestFor(model: PacketModel): DriveDestinationRequest {
  return {
    agencyId: model.identity.agencyId,
    archetypeId: model.identity.archetypeId,
    packetTemplateId: model.identity.packetTemplateId,
    eventInstanceId: model.identity.eventInstanceId,
    workflowInstanceId: model.identity.workflowInstanceId,
    reportingPeriodStart: model.identity.reportingPeriodStart,
    reportingPeriodEnd: model.identity.reportingPeriodEnd,
    destinationTemplate: LOCAL_DESTINATION_TEMPLATE,
  };
}

async function publishSignedPackage(
  drive: PacketDriveConnector,
  destination: DriveDestination,
  model: PacketModel,
  payload: QapiPacketModelPayload,
  signedPackage: SignedPackageFallback,
): Promise<PublishArtifactsResult> {
  const kpisSidecar = serializeKpisSidecarPayload(toKpisSidecarPayload(payload.trendSnapshot));
  const manifest = stableStringify({
    kind: 'manifest',
    packetInstanceId: model.identity.packetInstanceId,
    packetVersion: model.identity.packetVersion,
    artifacts: ['pdf', 'kpis', 'manifest', 'audit', 'signature-certificate'],
  });
  const audit = stableStringify({
    kind: 'audit',
    packetInstanceId: model.identity.packetInstanceId,
    generatedAt: GENERATED_AT,
    lifecycle: PACKET_LIFECYCLE_TO_APPENDIX_D,
  });
  const signatureCertificate = stableStringify({
    kind: 'signature-certificate',
    envelopeId: signedPackage.envelope.envelopeId,
    completedAt: signedPackage.envelope.completedAt,
    signerTasks: signedPackage.envelope.signerTasks.map((task) => ({
      signerTaskId: task.signerTaskId,
      requiredCapacity: task.requiredCapacity,
      signerUserId: task.signerUserId,
      signedAt: task.signedAt,
      status: task.status,
    })),
  });
  return drive.publishArtifacts({
    packetInstanceId: model.identity.packetInstanceId,
    packetVersion: model.identity.packetVersion,
    contentHash: signedPackage.contentHash,
    idempotencyKey: `publish:${model.identity.packetInstanceId}:${model.identity.packetVersion}:${signedPackage.contentHash}`,
    destination,
    artifacts: [
      {
        artifactType: 'pdf',
        fileName: `${model.identity.packetInstanceId}.pdf`,
        mimeType: 'application/pdf',
        bytesBase64: signedPackage.pdfBytesBase64,
        sha256: signedPackage.pdfSha256,
        classification: model.classification,
        retentionRule: 'QAPI packet retention — governed compliance packet',
      },
      textArtifact('kpis', `${model.identity.packetInstanceId}.kpis.json`, kpisSidecar, model.classification),
      textArtifact('manifest', `${model.identity.packetInstanceId}.manifest.json`, manifest, model.classification),
      textArtifact('audit', `${model.identity.packetInstanceId}.audit.json`, audit, model.classification),
      textArtifact(
        'signature-certificate',
        `${model.identity.packetInstanceId}.signature-certificate.json`,
        signatureCertificate,
        model.classification,
      ),
    ],
  });
}

function textArtifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  text: string,
  classification: string,
): PublishArtifactsRequest['artifacts'][number] {
  const bytes = Buffer.from(text, 'utf8');
  return {
    artifactType,
    fileName,
    mimeType: 'application/json',
    bytesBase64: bytes.toString('base64'),
    sha256: hashBytes(bytes),
    classification,
    retentionRule: 'QAPI packet retention — governed compliance packet',
  };
}

function createPacketLifecycleStore(): PacketLifecycleStore {
  const instances = new Map<string, PacketInstance>();
  const idempotency = new Map<string, string>();
  return {
    createOrGetDraft(instance: PacketInstance, idempotencyKey: string) {
      const existingId = idempotency.get(idempotencyKey);
      if (existingId !== undefined) {
        const existing = instances.get(existingId);
        if (existing === undefined) throw new Error('Idempotent packet instance was not recoverable.');
        return { instance: existing, idempotentReplay: true };
      }
      instances.set(instance.packetInstanceId, { ...instance });
      idempotency.set(idempotencyKey, instance.packetInstanceId);
      return { instance, idempotentReplay: false };
    },
    transitionTo(packetInstanceId: string, nextStatus: PacketLifecycleStatus) {
      const current = requireInstance(instances, packetInstanceId);
      assertPacketTransition(current.status, nextStatus);
      const updated = {
        ...current,
        status: nextStatus,
        updatedAt: timestampForStatus(nextStatus),
      };
      instances.set(packetInstanceId, updated);
      return updated;
    },
    applyPublication(packetInstanceId: string, publishResult: PublishArtifactsResult) {
      const current = requireInstance(instances, packetInstanceId);
      const pdf = publishResult.pointers.find((pointer) => pointer.artifactType === 'pdf');
      const updated = {
        ...current,
        driveFolderUrl: publishResult.pointers[0]?.driveFolderUrl ?? current.driveFolderUrl,
        finalArtifactUrl: pdf?.driveFileUrl ?? current.finalArtifactUrl,
        updatedAt: PUBLISHED_AT,
      };
      instances.set(packetInstanceId, updated);
      return updated;
    },
    certify(packetInstanceId: string, validation: PacketValidationResult) {
      if (!validation.lockEligible) {
        throw new Error('Cannot certify a packet that is not lock eligible.');
      }
      const current = requireInstance(instances, packetInstanceId);
      if (current.status !== 'PUBLISHED') {
        throw new Error(`Cannot certify from status ${current.status}; publish first.`);
      }
      const updated = {
        ...current,
        status: 'CERTIFIED' as const,
        certifiedAt: CERTIFIED_AT,
        updatedAt: CERTIFIED_AT,
      };
      instances.set(packetInstanceId, updated);
      return updated;
    },
    lock(packetInstanceId: string, validation: PacketValidationResult) {
      if (!validation.lockEligible) {
        throw new Error('Cannot lock a packet that is not lock eligible.');
      }
      const current = requireInstance(instances, packetInstanceId);
      if (current.status !== 'CERTIFIED') {
        throw new Error(`Cannot lock from status ${current.status}; certify first.`);
      }
      const updated = {
        ...current,
        status: 'LOCKED' as const,
        lockedAt: LOCKED_AT,
        updatedAt: LOCKED_AT,
      };
      instances.set(packetInstanceId, updated);
      return updated;
    },
    attemptPostLockEdit(packetInstanceId: string, description: string) {
      const current = requireInstance(instances, packetInstanceId);
      if (current.status === 'LOCKED') {
        throw new Error(`Locked packet ${packetInstanceId} cannot be overwritten: ${description}`);
      }
      const updated = { ...current, updatedAt: GENERATED_AT };
      instances.set(packetInstanceId, updated);
      return updated;
    },
    createAmendment(packetInstanceId: string, reason: string) {
      const current = requireInstance(instances, packetInstanceId);
      if (current.status !== 'LOCKED') {
        throw new Error(`Amendment requires a locked packet; current status is ${current.status}.`);
      }
      const amendmentId = `${current.packetId}:amendment-v${current.packetVersion + 1}`;
      const amendment: PacketInstance = {
        ...current,
        packetInstanceId: amendmentId,
        packetId: amendmentId,
        packetVersion: current.packetVersion + 1,
        status: 'EDITING',
        createdAt: LOCKED_AT,
        updatedAt: LOCKED_AT,
        certifiedAt: null,
        lockedAt: null,
        driveFolderUrl: null,
        finalArtifactUrl: null,
        contentHash: hashText(`${current.contentHash ?? 'missing-content-hash'}|amendment|${reason}`),
        supersedesPacketInstanceId: current.packetInstanceId,
        supersededByPacketInstanceId: null,
      };
      instances.set(amendmentId, amendment);
      return amendment;
    },
    listInstances: () => [...instances.values()],
  };
}

function drivePublishedPath(
  store: PacketLifecycleStore,
  packetInstanceId: string,
  publishResult: PublishArtifactsResult,
  validation: PacketValidationResult,
): void {
  store.transitionTo(packetInstanceId, 'UNDER_ANALYSIS');
  store.transitionTo(packetInstanceId, 'READY_FOR_REVIEW');
  store.transitionTo(packetInstanceId, 'UNDER_REVIEW');
  store.transitionTo(packetInstanceId, 'EDITING');
  store.transitionTo(packetInstanceId, 'VALIDATION_REQUIRED');
  if (!validation.approvalEligible) {
    const detail = validationFailureDetails(validation);
    console.error(`Packet failed approval readiness validation blockers:\n${detail}`);
    throw new Error(`Packet failed approval readiness validation.\n${detail}`);
  }
  store.transitionTo(packetInstanceId, 'READY_FOR_APPROVAL');
  store.transitionTo(packetInstanceId, 'APPROVED_FOR_SIGNATURE');
  store.transitionTo(packetInstanceId, 'SIGNER_CONFIRMATION');
  store.transitionTo(packetInstanceId, 'ECIGN_PREPARING');
  store.transitionTo(packetInstanceId, 'SENT_FOR_SIGNATURE');
  store.transitionTo(packetInstanceId, 'PARTIALLY_SIGNED');
  store.transitionTo(packetInstanceId, 'FULLY_SIGNED');
  store.transitionTo(packetInstanceId, 'SIGNED_PACKAGE_BUILDING');
  store.transitionTo(packetInstanceId, 'CERTIFICATION_REVIEW');
  store.transitionTo(packetInstanceId, 'CERTIFIED');
  store.transitionTo(packetInstanceId, 'DRIVE_PUBLISHING');
  store.transitionTo(packetInstanceId, 'PUBLISHED');
  store.applyPublication(packetInstanceId, publishResult);
}

function validationFailureDetails(validation: PacketValidationResult): string {
  const blockerIds = new Set(validation.unresolvedBlockerIds);
  const blockers = validation.findings.filter((finding) => finding.severity === 'blocker' || blockerIds.has(finding.findingId));
  if (blockers.length === 0) {
    return 'No blocker findings were reported even though approvalEligible=false.';
  }
  return blockers
    .map((finding) => [
      `- ${finding.findingId}`,
      `code=${finding.code}`,
      `path=${finding.path}`,
      `message=${finding.message}`,
      `remediation=${finding.remediation}`,
    ].join(' | '))
    .join('\n');
}

function requireInstance(
  instances: ReadonlyMap<string, PacketInstance>,
  packetInstanceId: string,
): PacketInstance {
  const instance = instances.get(packetInstanceId);
  if (instance === undefined) {
    throw new Error(`Packet instance ${packetInstanceId} was not found.`);
  }
  return instance;
}

function timestampForStatus(status: PacketLifecycleStatus): string {
  if (status === 'CERTIFIED') return CERTIFIED_AT;
  if (status === 'PUBLISHED') return PUBLISHED_AT;
  if (status === 'LOCKED') return LOCKED_AT;
  return GENERATED_AT;
}

function drivePointer(input: {
  evidenceId: string;
  packetInstanceId: string;
  artifactType: DriveArtifactPointer['artifactType'];
  fileName: string;
  mimeType: string;
  sha256: string;
  sizeBytes: number;
  classification: string;
}): DriveArtifactPointer {
  const driveFileId = `file-${slug(hashText(`${input.packetInstanceId}|${input.evidenceId}|${input.sha256}`)).slice(0, 20)}`;
  return {
    evidenceId: input.evidenceId,
    packetInstanceId: input.packetInstanceId,
    artifactType: input.artifactType,
    driveFileId,
    driveFileUrl: `https://local.drive.test/files/${driveFileId}/${encodeURIComponent(input.fileName)}`,
    driveFolderId: `folder-${slug(input.packetInstanceId)}`,
    driveFolderUrl: `https://local.drive.test/folders/folder-${slug(input.packetInstanceId)}`,
    sha256: input.sha256,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    classification: input.classification,
    retentionRule: 'QAPI packet retention — governed compliance packet',
    publishedAt: PUBLISHED_AT,
    publishedBy: LOCAL_PUBLISHED_BY,
  };
}

function hashBytes(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => sortJson(item));
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => [key, sortJson(entryValue)]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'packet';
}
