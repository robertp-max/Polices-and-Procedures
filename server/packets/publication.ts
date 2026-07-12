import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { COMPLIANCE_PACKETS_DRIVE_TEMPLATE } from '@/policy/packets/registries/driveDestinations';
import {
  FR032_VERIFICATION_CHECKLIST,
  FR032_POST_LOCK_EFFECTS,
  type Fr032ChecklistItemLabel,
  type Fr032PostLockEffect,
} from '@/policy/packets/registries/lockPolicies';
import { toKpisSidecarPayload } from '@/policy/packets/analysis/trends/snapshotSerializer';
import type {
  AnalysisSidecarPayload,
  AuditSidecarPayload,
  DriveDestinationRequest,
  DriveArtifactPointer,
  KpisSidecarPayload,
  ManifestSidecarPayload,
  PacketAuditActor,
  PacketDriveConnector,
  PacketEnvelope,
  PacketLifecycleStatus,
  PacketSidecarPayload,
  PublishArtifactsRequest,
  PublishArtifactsResult,
  QapiActionSnapshot,
  QapiFindingSnapshot,
  QapiMetricSnapshot,
  QapiPipSnapshot,
  QapiTrendSnapshot,
  QapiWorkflowSnapshot,
  SidecarArtifactKind,
  WorkflowsSidecarPayload,
} from '@/policy/packets/contracts';
import { createPacketDriveConnector } from './drive/connector.js';
import {
  beginAmendment as beginStoreAmendment,
  createSupersedingInstance as createStoreSupersedingInstance,
  transitionPacket,
  type CreateSupersedingInstanceInput,
} from './lifecycle.js';
import {
  FileLocalPacketStore,
  LockedPacketError,
  PacketNotFoundError,
  StaleWriteError,
  type PacketInstancePatch,
  type PacketMetadataStore,
  type PacketStoreDocument,
} from './store.js';

export type PublicationBlockerCode =
  | 'artifact_classification_required'
  | 'attachment_confidentiality_missing'
  | 'attachment_hash_missing'
  | 'attachment_not_validated'
  | 'authority_not_verified'
  | 'certification_status_invalid'
  | 'drive_publication_missing'
  | 'drive_sidecar_missing'
  | 'evidence_blocker_unresolved'
  | 'hash_mismatch'
  | 'packet_identity_missing'
  | 'packet_revision_stale'
  | 'packet_status_invalid'
  | 'reporting_period_missing'
  | 'required_attachment_missing'
  | 'retention_rule_required'
  | 'signature_confidentiality_missing'
  | 'signature_record_missing'
  | 'signed_package_missing'
  | 'source_classification_missing'
  | 'workflow_identity_missing';

export interface PublicationBlocker {
  code: PublicationBlockerCode;
  path: string;
  message: string;
  remediation: string;
}

export class PacketPublicationError extends Error {
  readonly code = 'packet_publication_blocked' as const;
  readonly blockers: readonly PublicationBlocker[];
  readonly status: number;

  constructor(message: string, blockers: readonly PublicationBlocker[], status = 409) {
    super(message);
    this.name = 'PacketPublicationError';
    this.blockers = blockers;
    this.status = status;
  }
}

export interface PublicationDependencies {
  store?: PacketMetadataStore;
  driveConnector?: PacketDriveConnector;
  now?: () => Date;
}

export interface PublicationEvidenceValidationInput {
  requiredAttachmentTypeIds?: readonly string[];
}

export interface PublicationSignatureValidationInput {
  envelope?: PacketEnvelope;
  authorityVerified?: boolean;
  confidentialityVerified?: boolean;
}

export interface PublishPacketInput extends PublicationEvidenceValidationInput, PublicationSignatureValidationInput {
  packetInstanceId: string;
  expectedRevision?: number;
  actor: PacketAuditActor;
  idempotencyKey: string;
  signedPackageId: string;
  canonicalPdfBase64?: string;
  canonicalPdfBytes?: Uint8Array;
  canonicalPdfSha256?: string;
  contentHash?: string;
  signatureCertificateBase64?: string;
  signatureCertificateSha256?: string;
  sourceClassification?: 'production' | 'synthetic';
  artifactClassification: string;
  retentionRule: string;
  cadence: KpisSidecarPayload['cadence'];
  kpiDefinitionVersion: string;
  metricSchemaVersion: string;
  metrics?: readonly QapiMetricSnapshot[];
  findings?: readonly QapiFindingSnapshot[];
  workflows?: readonly QapiWorkflowSnapshot[];
  pips?: readonly QapiPipSnapshot[];
  actionItems?: readonly QapiActionSnapshot[];
}

export interface CertificationInput extends PublicationEvidenceValidationInput, PublicationSignatureValidationInput {
  packetInstanceId: string;
  expectedRevision: number;
  actor: PacketAuditActor;
  reason?: string;
  contentHash?: string;
}

export interface LockPacketInput extends PublicationEvidenceValidationInput, PublicationSignatureValidationInput {
  packetInstanceId: string;
  expectedRevision: number;
  actor: PacketAuditActor;
  reason?: string;
  contentHash?: string;
}

export interface BeginAmendmentInput {
  packetInstanceId: string;
  expectedRevision: number;
  actor: PacketAuditActor;
  reason?: string;
}

export interface CreateSupersedingPacketInput {
  packetInstanceId: string;
  expectedRevision: number;
  actor: PacketAuditActor;
  createdBy: string;
  reason?: string;
  eventInstanceId?: string;
  workflowInstanceId?: string;
  packetTemplateId?: string;
  packetId?: string;
  status?: PacketLifecycleStatus;
}

export type VerificationState = 'verified' | 'pending' | 'blocked';

export interface CertificationChecklistResult {
  itemId: string;
  label: Fr032ChecklistItemLabel;
  state: VerificationState;
  blockerCode: PublicationBlockerCode | null;
}

export interface PublishPacketResult {
  packet: PacketStoreDocument;
  publication: PublishArtifactsResult;
  destination: PublishArtifactsRequest['destination'];
  pointers: DriveArtifactPointer[];
  kpisSidecar: KpisSidecarPayload;
}

export interface CertificationResult {
  packet: PacketStoreDocument;
  checklist: readonly CertificationChecklistResult[];
}

export interface LockPacketResult {
  packet: PacketStoreDocument;
  checklist: readonly CertificationChecklistResult[];
  postLockEffects: readonly Fr032PostLockEffect[];
}

export interface AmendmentResult {
  packet: PacketStoreDocument;
  priorSignedArtifactUrl: string | null;
}

export interface SupersedingPacketResult {
  prior: PacketStoreDocument;
  next: PacketStoreDocument;
  priorSignedArtifactUrl: string | null;
}

type PublicationSidecarHints = {
  packet_status: 'certified-and-published' | 'locked';
  canonical_workflow_family: string;
  reporting_period: string;
  supersededByPacketInstanceId: string | null;
  publishedBy: string;
};

type PublicationSidecarPayload = PacketSidecarPayload & PublicationSidecarHints;

type PublicationArtifact = PublishArtifactsRequest['artifacts'][number];

const defaultStore = new FileLocalPacketStore();
const REQUIRED_SIDECAR_KINDS: readonly SidecarArtifactKind[] = [
  'analysis',
  'kpis',
  'workflows',
  'manifest',
  'audit',
];

function dependencies(input: PublicationDependencies): {
  store: PacketMetadataStore;
  driveConnector: PacketDriveConnector;
  now: () => Date;
} {
  return {
    store: input.store ?? defaultStore,
    driveConnector: input.driveConnector ?? createPacketDriveConnector(),
    now: input.now ?? (() => new Date()),
  };
}

export async function publishPacket(
  dependencyInput: PublicationDependencies,
  input: PublishPacketInput,
): Promise<PublishPacketResult> {
  const { store, driveConnector, now } = dependencies(dependencyInput);
  const packet = await requirePacket(store, input.packetInstanceId);
  assertRevisionIfProvided(packet, input.expectedRevision);
  assertPublishableStatus(packet);
  assertSignedPackageInput(packet, input);
  assertEvidenceReady(packet, input);
  assertSignatureRecord(packet, input);
  assertPublicationMetadata(input);

  const pdfBytes = readCanonicalPdfBytes(input);
  const pdfSha256 = sha256Hex(pdfBytes);
  assertOptionalHash('canonicalPdfSha256', input.canonicalPdfSha256, pdfSha256);

  let working = packet;
  if (working.status === 'CERTIFICATION_REVIEW') {
    const certified = await certifyPacket(
      { store, driveConnector, now },
      {
        packetInstanceId: working.packetInstanceId,
        expectedRevision: working.revision,
        actor: input.actor,
        contentHash: input.contentHash ?? working.contentHash ?? pdfSha256,
        requiredAttachmentTypeIds: input.requiredAttachmentTypeIds,
        authorityVerified: input.authorityVerified,
        confidentialityVerified: input.confidentialityVerified,
        reason: 'FR-032 Certification before Google Drive Publication',
      },
    );
    working = certified.packet;
  }
  if (working.status === 'CERTIFIED') {
    working = await transitionPacket(
      store,
      working.packetInstanceId,
      working.revision,
      'DRIVE_PUBLISHING',
      input.actor,
      'FR-031 Google Drive Publication',
    );
  }

  const contentHash = effectiveContentHash(working, input, pdfSha256);
  const generatedAt = await publishedGeneratedAt(driveConnector, working.packetInstanceId, now);
  const sourceClassification = input.sourceClassification ?? working.sourceClassification;
  if (sourceClassification === null || sourceClassification === undefined) {
    throw publicationError('Source classification is required before publication.', [
      blocker(
        'source_classification_missing',
        'sourceClassification',
        'Publication requires a production or synthetic source classification.',
        'Classify packet sources before publishing.',
      ),
    ]);
  }

  const destinationRequest = {
    agencyId: working.agencyId,
    archetypeId: working.archetypeId,
    packetTemplateId: working.packetTemplateId,
    eventInstanceId: working.eventInstanceId,
    workflowInstanceId: working.workflowInstanceId,
    reportingPeriodStart: working.reportingPeriodStart,
    reportingPeriodEnd: working.reportingPeriodEnd,
    destinationTemplate: COMPLIANCE_PACKETS_DRIVE_TEMPLATE,
    domain: domainForPacket(working),
    eventFamilyId: working.eventFamilyId,
    packetInstanceId: working.packetInstanceId,
    packetVersion: working.packetVersion,
  } as DriveDestinationRequest & Record<string, string | number | null>;
  const destination = await driveConnector.resolveDestination(destinationRequest);

  const sidecars = buildSidecars({
    packet: working,
    input,
    contentHash,
    generatedAt,
    sourceClassification,
    reportingPeriod: reportingPeriodLabel(working, input.cadence),
    publishedBy: input.actor.actorId,
  });
  const artifacts = buildArtifacts({
    packet: working,
    input,
    pdfBytes,
    pdfSha256,
    sidecars,
  });
  const publication = await driveConnector.publishArtifacts({
    packetInstanceId: working.packetInstanceId,
    packetVersion: working.packetVersion,
    contentHash,
    idempotencyKey: input.idempotencyKey,
    destination,
    artifacts,
  });
  assertPublicationPointers(publication.pointers, artifacts);
  await verifyPublishedHashes(driveConnector, publication.pointers);

  const pdfPointer = requirePointer(publication.pointers, 'pdf');
  const patch = metadataPatch(working, pdfPointer, contentHash, sourceClassification);
  if (Object.keys(patch).length > 0) {
    working = await store.update(working.packetInstanceId, working.revision, patch, {
      actor: input.actor,
      reason: 'FR-031 Store file and folder URLs after Google Drive Publication',
      auditEventType: 'packet.edited',
    });
  }

  if (working.status === 'DRIVE_PUBLISHING') {
    working = await transitionPacket(
      store,
      working.packetInstanceId,
      working.revision,
      'PUBLISHED',
      input.actor,
      'FR-031 Google Drive Publication complete',
    );
  }

  return {
    packet: working,
    publication,
    destination,
    pointers: publication.pointers,
    kpisSidecar: sidecars.kpis,
  };
}

export async function certifyPacket(
  dependencyInput: PublicationDependencies,
  input: CertificationInput,
): Promise<CertificationResult> {
  const { store } = dependencies(dependencyInput);
  const packet = await requirePacket(store, input.packetInstanceId);
  assertRevision(packet, input.expectedRevision);
  assertCertificationStatus(packet);

  const checklist = buildCertificationChecklist(packet, input, false);
  const blocking = checklistBlockers(checklist);
  if (blocking.length > 0) {
    throw publicationError('Packet certification is blocked.', blocking);
  }

  if (packet.status === 'CERTIFIED' || packet.status === 'PUBLISHED' || packet.status === 'LOCKED') {
    return { packet, checklist };
  }

  const certified = await transitionPacket(
    store,
    packet.packetInstanceId,
    input.expectedRevision,
    'CERTIFIED',
    input.actor,
    input.reason ?? 'FR-032 Certification and Lock',
  );
  return { packet: certified, checklist };
}

export async function lockPacket(
  dependencyInput: PublicationDependencies,
  input: LockPacketInput,
): Promise<LockPacketResult> {
  const { store, driveConnector } = dependencies(dependencyInput);
  const packet = await requirePacket(store, input.packetInstanceId);
  assertRevision(packet, input.expectedRevision);

  const checklist = buildCertificationChecklist(packet, input, true);
  const blocking = checklistBlockers(checklist);
  if (blocking.length > 0) {
    throw publicationError('Packet lock is blocked.', blocking);
  }

  const contentHash = certificationContentHash(packet, input);
  await assertPublishedSidecars(packet, driveConnector, contentHash);
  if (packet.status === 'LOCKED') {
    return { packet, checklist, postLockEffects: FR032_POST_LOCK_EFFECTS };
  }
  if (packet.status !== 'PUBLISHED') {
    throw publicationError('Only a published packet can be locked.', [
      blocker(
        'packet_status_invalid',
        'status',
        `Packet status ${packet.status} cannot be locked.`,
        'Publish the packet before locking it.',
      ),
    ]);
  }

  const locked = await transitionPacket(
    store,
    packet.packetInstanceId,
    input.expectedRevision,
    'LOCKED',
    input.actor,
    input.reason ?? 'FR-032 Certification and Lock',
  );
  return { packet: locked, checklist, postLockEffects: FR032_POST_LOCK_EFFECTS };
}

export async function beginAmendment(
  dependencyInput: PublicationDependencies,
  input: BeginAmendmentInput,
): Promise<AmendmentResult> {
  const { store } = dependencies(dependencyInput);
  const current = await requirePacket(store, input.packetInstanceId);
  const priorSignedArtifactUrl = current.finalArtifactUrl;
  const packet = await beginStoreAmendment(
    store,
    current.packetInstanceId,
    input.expectedRevision,
    input.actor,
    input.reason ?? 'FR-032 Permit only amendment or supersession.',
  );
  return { packet, priorSignedArtifactUrl };
}

export async function createSupersedingPacket(
  dependencyInput: PublicationDependencies,
  input: CreateSupersedingPacketInput,
): Promise<SupersedingPacketResult> {
  const { store } = dependencies(dependencyInput);
  const prior = await requirePacket(store, input.packetInstanceId);
  const priorSignedArtifactUrl = prior.finalArtifactUrl;
  const createInput: CreateSupersedingInstanceInput = {
    createdBy: input.createdBy,
    actor: input.actor,
    reason: input.reason ?? 'FR-005 locked packet supersession',
    eventInstanceId: input.eventInstanceId,
    workflowInstanceId: input.workflowInstanceId,
    packetTemplateId: input.packetTemplateId,
    packetId: input.packetId,
    status: input.status,
  };
  const result = await createStoreSupersedingInstance(
    store,
    prior.packetInstanceId,
    input.expectedRevision,
    createInput,
  );
  return { ...result, priorSignedArtifactUrl };
}

function requirePacket(store: PacketMetadataStore, packetInstanceId: string): Promise<PacketStoreDocument> {
  return store.getById(packetInstanceId).then((packet) => {
    if (!packet) throw new PacketNotFoundError(packetInstanceId);
    return packet;
  });
}

function blocker(
  code: PublicationBlockerCode,
  path: string,
  message: string,
  remediation: string,
): PublicationBlocker {
  return { code, path, message, remediation };
}

function publicationError(
  message: string,
  blockers: readonly PublicationBlocker[],
  status = 409,
): PacketPublicationError {
  return new PacketPublicationError(message, blockers, status);
}

function assertRevision(packet: PacketStoreDocument, expectedRevision: number): void {
  if (packet.revision !== expectedRevision) {
    throw new StaleWriteError(packet.packetInstanceId, expectedRevision, packet.revision);
  }
}

function assertRevisionIfProvided(packet: PacketStoreDocument, expectedRevision: number | undefined): void {
  if (expectedRevision !== undefined) {
    assertRevision(packet, expectedRevision);
  }
}

function assertPublishableStatus(packet: PacketStoreDocument): void {
  if (
    packet.status === 'CERTIFICATION_REVIEW' ||
    packet.status === 'CERTIFIED' ||
    packet.status === 'DRIVE_PUBLISHING' ||
    packet.status === 'PUBLISHED'
  ) {
    return;
  }
  throw publicationError('Packet is not ready for Google Drive publication.', [
    blocker(
      'packet_status_invalid',
      'status',
      `Packet status ${packet.status} cannot be published.`,
      'Complete certification review before publication.',
    ),
  ]);
}

function assertCertificationStatus(packet: PacketStoreDocument): void {
  if (
    packet.status === 'CERTIFICATION_REVIEW' ||
    packet.status === 'CERTIFIED' ||
    packet.status === 'PUBLISHED' ||
    packet.status === 'LOCKED'
  ) {
    return;
  }
  throw publicationError('Packet is not in certification review.', [
    blocker(
      'certification_status_invalid',
      'status',
      `Packet status ${packet.status} cannot be certified.`,
      'Move the fully signed package to certification review before certification.',
    ),
  ]);
}

function assertSignedPackageInput(
  packet: PacketStoreDocument,
  input: PublishPacketInput,
): void {
  const blockers: PublicationBlocker[] = [];
  if (!input.signedPackageId.trim()) {
    blockers.push(blocker(
      'signed_package_missing',
      'signedPackageId',
      'Publication requires one stable signed-package ID.',
      'Create the canonical signed package and retry publication with its stable ID.',
    ));
  }
  if (!input.canonicalPdfBase64 && !input.canonicalPdfBytes) {
    blockers.push(blocker(
      'signed_package_missing',
      'canonicalPdfBase64',
      'Publication requires canonical signed-package PDF bytes.',
      'Provide the canonical signed PDF bytes produced after signature completion.',
    ));
  }
  if (packet.signatureIds.length === 0 && input.envelope === undefined) {
    blockers.push(blocker(
      'signature_record_missing',
      'signatureIds',
      'The packet has no signature record to verify.',
      'Bind the signed package to a packet signature record before publication.',
    ));
  }
  if (blockers.length > 0) {
    throw publicationError('Signed package verification failed.', blockers);
  }
}

function assertPublicationMetadata(input: Pick<PublishPacketInput, 'artifactClassification' | 'retentionRule'>): void {
  const blockers: PublicationBlocker[] = [];
  if (input.artifactClassification.trim().length === 0) {
    blockers.push(blocker(
      'artifact_classification_required',
      'artifactClassification',
      'Publication requires an artifact classification.',
      'Provide the approved artifact classification before Drive publication.',
    ));
  }
  if (input.retentionRule.trim().length === 0) {
    blockers.push(blocker(
      'retention_rule_required',
      'retentionRule',
      'Publication requires a concrete retention rule.',
      'Provide the approved retention rule; do not substitute an unknown retention period.',
    ));
  }
  if (blockers.length > 0) {
    throw publicationError('Publication metadata is incomplete.', blockers);
  }
}

function assertEvidenceReady(packet: PacketStoreDocument, input: PublicationEvidenceValidationInput): void {
  const blockers = evidenceBlockers(packet, input);
  if (blockers.length > 0) {
    throw publicationError('Packet evidence validation failed.', blockers);
  }
}

function evidenceBlockers(
  packet: PacketStoreDocument,
  input: PublicationEvidenceValidationInput,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  packet.blockerIds.forEach((blockerId, index) => {
    blockers.push(blocker(
      'evidence_blocker_unresolved',
      `blockerIds.${index}`,
      `Packet blocker remains unresolved: ${blockerId}.`,
      'Resolve the blocker before publication, certification, or lock.',
    ));
  });
  for (const [index, attachment] of packet.attachmentInstances.entries()) {
    if (attachment.status !== 'validated') {
      blockers.push(blocker(
        'attachment_not_validated',
        `attachmentInstances.${index}.status`,
        `Attachment ${attachment.attachmentInstanceId} is ${attachment.status}, not validated.`,
        'Validate required packet evidence before publication or lock.',
      ));
    }
    if (attachment.contentHash === null) {
      blockers.push(blocker(
        'attachment_hash_missing',
        `attachmentInstances.${index}.contentHash`,
        `Attachment ${attachment.attachmentInstanceId} is missing a content hash.`,
        'Hash evidence attachments before publication or lock.',
      ));
    }
    if (attachment.confidentialityLevel.trim().length === 0) {
      blockers.push(blocker(
        'attachment_confidentiality_missing',
        `attachmentInstances.${index}.confidentialityLevel`,
        `Attachment ${attachment.attachmentInstanceId} is missing confidentiality classification.`,
        'Classify evidence confidentiality before publication or lock.',
      ));
    }
  }
  for (const requiredType of input.requiredAttachmentTypeIds ?? []) {
    const match = packet.attachmentInstances.find(
      (attachment) => attachment.attachmentTypeId === requiredType && attachment.status === 'validated',
    );
    if (!match) {
      blockers.push(blocker(
        'required_attachment_missing',
        'requiredAttachmentTypeIds',
        `Required attachment ${requiredType} is missing or not validated.`,
        'Attach and validate all required evidence before publication or lock.',
      ));
    }
  }
  return blockers;
}

function assertSignatureRecord(packet: PacketStoreDocument, input: PublicationSignatureValidationInput): void {
  const blockers = signatureBlockers(packet, input);
  if (blockers.length > 0) {
    throw publicationError('Packet signature verification failed.', blockers);
  }
}

function signatureBlockers(
  packet: PacketStoreDocument,
  input: PublicationSignatureValidationInput,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  if (packet.signatureIds.length === 0 && input.envelope === undefined) {
    blockers.push(blocker(
      'signature_record_missing',
      'signatureIds',
      'The packet has no signature record.',
      'Complete signer execution and bind the signature record before certification or lock.',
    ));
  }
  if (input.authorityVerified !== true) {
    blockers.push(blocker(
      'authority_not_verified',
      'authorityVerified',
      'Signer authority has not been explicitly verified.',
      'Verify signer authority before certification or lock.',
    ));
  }
  if (input.confidentialityVerified !== true) {
    blockers.push(blocker(
      'signature_confidentiality_missing',
      'confidentialityVerified',
      'Confidentiality acknowledgment has not been explicitly verified.',
      'Verify confidentiality access and acknowledgments before certification or lock.',
    ));
  }
  if (input.envelope !== undefined) {
    blockers.push(...envelopeBlockers(packet, input.envelope));
  }
  return blockers;
}

function envelopeBlockers(packet: PacketStoreDocument, envelope: PacketEnvelope): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  if (envelope.packetInstanceId !== packet.packetInstanceId) {
    blockers.push(blocker(
      'signature_record_missing',
      'envelope.packetInstanceId',
      'Envelope packet identity does not match the packet being published.',
      'Publish only the envelope bound to this packet instance.',
    ));
  }
  if (envelope.frozenPacketVersion !== packet.packetVersion) {
    blockers.push(blocker(
      'hash_mismatch',
      'envelope.frozenPacketVersion',
      'Envelope frozen packet version does not match the packet version.',
      'Use the envelope bound to the frozen packet version.',
    ));
  }
  if (envelope.status !== 'COMPLETED') {
    blockers.push(blocker(
      'signature_record_missing',
      'envelope.status',
      `Envelope status ${envelope.status} is not COMPLETED.`,
      'Complete all required signatures before publication or certification.',
    ));
  }
  envelope.signerTasks.forEach((task, index) => {
    if (task.required && task.status !== 'COMPLETED') {
      blockers.push(blocker(
        'signature_record_missing',
        `envelope.signerTasks.${index}.status`,
        `Required signer task ${task.signerTaskId} is not COMPLETED.`,
        'Complete all required signer tasks before publication or certification.',
      ));
    }
    if (task.required && !task.authorityVerified) {
      blockers.push(blocker(
        'authority_not_verified',
        `envelope.signerTasks.${index}.authorityVerified`,
        `Required signer task ${task.signerTaskId} lacks authority verification.`,
        'Verify signer authority before certification or lock.',
      ));
    }
    if (task.required && !task.confidentialityAcknowledged) {
      blockers.push(blocker(
        'signature_confidentiality_missing',
        `envelope.signerTasks.${index}.confidentialityAcknowledged`,
        `Required signer task ${task.signerTaskId} lacks confidentiality acknowledgment.`,
        'Verify confidentiality acknowledgment before certification or lock.',
      ));
    }
  });
  return blockers;
}

function readCanonicalPdfBytes(input: PublishPacketInput): Buffer {
  if (input.canonicalPdfBytes !== undefined) {
    return Buffer.from(input.canonicalPdfBytes);
  }
  if (input.canonicalPdfBase64 !== undefined) {
    return Buffer.from(input.canonicalPdfBase64, 'base64');
  }
  throw publicationError('Canonical PDF bytes are required.', [
    blocker(
      'signed_package_missing',
      'canonicalPdfBase64',
      'Publication requires canonical signed-package PDF bytes.',
      'Provide the canonical signed PDF bytes.',
    ),
  ]);
}

function assertOptionalHash(field: string, expected: string | undefined, actual: string): void {
  if (expected !== undefined && expected !== actual) {
    throw publicationError('Published artifact hash verification failed.', [
      blocker(
        'hash_mismatch',
        field,
        `Expected SHA-256 ${expected}, actual ${actual}.`,
        'Regenerate the artifact from the signed package and retry.',
      ),
    ]);
  }
}

function effectiveContentHash(
  packet: PacketStoreDocument,
  input: Pick<PublishPacketInput, 'contentHash'>,
  pdfSha256: string,
): string {
  if (packet.contentHash !== null && input.contentHash !== undefined && packet.contentHash !== input.contentHash) {
    throw publicationError('Packet content hash does not match the publication request.', [
      blocker(
        'hash_mismatch',
        'contentHash',
        'Publication request contentHash differs from the packet contentHash.',
        'Publish the signed package that is bound to the frozen packet content hash.',
      ),
    ]);
  }
  return input.contentHash ?? packet.contentHash ?? pdfSha256;
}

function domainForPacket(packet: PacketStoreDocument): string {
  return /\bqapi\b/i.test(packet.packetTemplateId) ? 'QAPI' : packet.archetypeId;
}

function reportingPeriodLabel(packet: PacketStoreDocument, cadence: KpisSidecarPayload['cadence']): string {
  if (!packet.reportingPeriodStart || !packet.reportingPeriodEnd) {
    throw publicationError('Reporting period is required before publication.', [
      blocker(
        'reporting_period_missing',
        'reportingPeriod',
        'Publication requires reportingPeriodStart and reportingPeriodEnd.',
        'Bind the packet to its reporting period before publication.',
      ),
    ]);
  }
  const year = packet.reportingPeriodStart.slice(0, 4);
  if (cadence === 'annual') return year;
  if (cadence === 'monthly') return packet.reportingPeriodStart.slice(0, 7);
  const month = Number(packet.reportingPeriodStart.slice(5, 7));
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

function buildSidecars(input: {
  packet: PacketStoreDocument;
  input: PublishPacketInput;
  contentHash: string;
  generatedAt: string;
  sourceClassification: 'production' | 'synthetic';
  reportingPeriod: string;
  publishedBy: string;
}): {
  analysis: AnalysisSidecarPayload & PublicationSidecarHints;
  kpis: KpisSidecarPayload & PublicationSidecarHints;
  workflows: WorkflowsSidecarPayload & PublicationSidecarHints;
  manifest: ManifestSidecarPayload & PublicationSidecarHints;
  audit: AuditSidecarPayload & PublicationSidecarHints;
} {
  const hints = sidecarHints(input.packet, input.reportingPeriod, input.publishedBy, 'certified-and-published');
  const snapshot = buildTrendSnapshot(input);
  const kpis = {
    ...toKpisSidecarPayload(snapshot),
    ...hints,
  };
  const analysis: AnalysisSidecarPayload & PublicationSidecarHints = {
    ...baseHeader(input),
    ...hints,
    kind: 'analysis',
    executiveAnalysis: null,
    findings: [...(input.input.findings ?? [])],
    riskSummary: null,
    comparabilityNotes: null,
  };
  const workflows: WorkflowsSidecarPayload & PublicationSidecarHints = {
    ...baseHeader(input),
    ...hints,
    kind: 'workflows',
    workflows: [...(input.input.workflows ?? defaultWorkflowSnapshots(input.packet))],
    pips: [...(input.input.pips ?? [])],
    actionItems: [...(input.input.actionItems ?? [])],
  };
  const manifest: ManifestSidecarPayload & PublicationSidecarHints = {
    ...baseHeader(input),
    ...hints,
    kind: 'manifest',
    driveFolderId: null,
    driveFolderUrl: null,
    artifacts: [],
  };
  const audit: AuditSidecarPayload & PublicationSidecarHints = {
    ...baseHeader(input),
    ...hints,
    kind: 'audit',
    chronologyId: input.packet.auditChronologyId,
    events: [
      {
        eventType: 'packet.published',
        timestamp: input.generatedAt,
        actorId: input.publishedBy,
        actorRole: null,
        summary: 'Google Drive Publication prepared for deterministic Drive destination.',
        resourceRef: input.packet.packetInstanceId,
        previousHash: null,
        currentHash: input.contentHash,
      },
    ],
  };
  return { analysis, kpis, workflows, manifest, audit };
}

function baseHeader(input: {
  packet: PacketStoreDocument;
  contentHash: string;
  generatedAt: string;
  sourceClassification: 'production' | 'synthetic';
}): AnalysisSidecarPayload {
  return {
    packetInstanceId: input.packet.packetInstanceId,
    packetVersion: input.packet.packetVersion,
    packetHash: input.contentHash,
    agencyId: input.packet.agencyId,
    generatedAt: input.generatedAt,
    sourceClassification: input.sourceClassification,
    kind: 'analysis',
    executiveAnalysis: null,
    findings: [],
    riskSummary: null,
    comparabilityNotes: null,
  };
}

function sidecarHints(
  packet: PacketStoreDocument,
  reportingPeriod: string,
  publishedBy: string,
  packetStatus: PublicationSidecarHints['packet_status'],
): PublicationSidecarHints {
  return {
    packet_status: packetStatus,
    canonical_workflow_family: packet.workflowId,
    reporting_period: reportingPeriod,
    supersededByPacketInstanceId: packet.supersededByPacketInstanceId,
    publishedBy,
  };
}

function buildTrendSnapshot(input: {
  packet: PacketStoreDocument;
  input: PublishPacketInput;
  contentHash: string;
  generatedAt: string;
  sourceClassification: 'production' | 'synthetic';
}): QapiTrendSnapshot {
  if (!input.packet.reportingPeriodStart || !input.packet.reportingPeriodEnd || !input.packet.dataThroughDate) {
    throw publicationError('QAPI trend snapshot requires packet period dates.', [
      blocker(
        'reporting_period_missing',
        'reportingPeriod',
        'Structured KPI sidecar requires reportingPeriodStart, reportingPeriodEnd, and dataThroughDate.',
        'Bind packet period dates before publishing the KPI sidecar.',
      ),
    ]);
  }
  return {
    packetInstanceId: input.packet.packetInstanceId,
    packetVersion: input.packet.packetVersion,
    packetHash: input.contentHash,
    agencyId: input.packet.agencyId,
    eventFamilyId: input.packet.eventFamilyId,
    eventInstanceId: input.packet.eventInstanceId,
    workflowId: input.packet.workflowId,
    workflowInstanceId: input.packet.workflowInstanceId,
    cadence: input.input.cadence,
    reportingPeriodStart: input.packet.reportingPeriodStart,
    reportingPeriodEnd: input.packet.reportingPeriodEnd,
    dataThroughDate: input.packet.dataThroughDate,
    packetStatus: 'published',
    sourceClassification: input.sourceClassification,
    kpiDefinitionVersion: input.input.kpiDefinitionVersion,
    metricSchemaVersion: input.input.metricSchemaVersion,
    metrics: [...(input.input.metrics ?? [])],
    findings: [...(input.input.findings ?? [])],
    workflows: [...(input.input.workflows ?? defaultWorkflowSnapshots(input.packet))],
    pips: [...(input.input.pips ?? [])],
    actionItems: [...(input.input.actionItems ?? [])],
    publishedArtifactUrl: `signed-package:${input.input.signedPackageId}`,
    publishedFolderUrl: `packet:${input.packet.packetInstanceId}:drive-destination-pending`,
    generatedAt: input.generatedAt,
  };
}

function defaultWorkflowSnapshots(packet: PacketStoreDocument): QapiWorkflowSnapshot[] {
  return [
    {
      workflowId: packet.workflowId,
      workflowInstanceId: packet.workflowInstanceId,
      title: null,
      decisionState: 'ACTIVATED',
      status: null,
      carryForward: null,
      dueDate: null,
      ownerRole: null,
    },
  ];
}

function buildArtifacts(input: {
  packet: PacketStoreDocument;
  input: PublishPacketInput;
  pdfBytes: Buffer;
  pdfSha256: string;
  sidecars: Record<SidecarArtifactKind, PublicationSidecarPayload>;
}): PublicationArtifact[] {
  const artifacts: PublicationArtifact[] = [
    {
      artifactType: 'pdf',
      fileName: `${input.packet.packetInstanceId}.pdf`,
      mimeType: 'application/pdf',
      bytesBase64: input.pdfBytes.toString('base64'),
      sha256: input.pdfSha256,
      classification: input.input.artifactClassification,
      retentionRule: input.input.retentionRule,
    },
  ];
  for (const kind of REQUIRED_SIDECAR_KINDS) {
    artifacts.push(jsonArtifact(
      kind,
      `${input.packet.packetInstanceId}.${kind}.json`,
      input.sidecars[kind],
      input.input,
    ));
  }
  if (input.input.signatureCertificateBase64 !== undefined) {
    const bytes = Buffer.from(input.input.signatureCertificateBase64, 'base64');
    const actualSha256 = sha256Hex(bytes);
    assertOptionalHash('signatureCertificateSha256', input.input.signatureCertificateSha256, actualSha256);
    artifacts.push({
      artifactType: 'signature-certificate',
      fileName: `${input.packet.packetInstanceId}.signature-certificate.json`,
      mimeType: 'application/json',
      bytesBase64: bytes.toString('base64'),
      sha256: actualSha256,
      classification: input.input.artifactClassification,
      retentionRule: input.input.retentionRule,
    });
  }
  return artifacts;
}

function jsonArtifact(
  artifactType: SidecarArtifactKind,
  fileName: string,
  payload: PacketSidecarPayload,
  input: Pick<PublishPacketInput, 'artifactClassification' | 'retentionRule'>,
): PublicationArtifact {
  const bytes = Buffer.from(`${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return {
    artifactType,
    fileName,
    mimeType: 'application/json',
    bytesBase64: bytes.toString('base64'),
    sha256: sha256Hex(bytes),
    classification: input.artifactClassification,
    retentionRule: input.retentionRule,
  };
}

async function verifyPublishedHashes(
  driveConnector: PacketDriveConnector,
  pointers: readonly DriveArtifactPointer[],
): Promise<void> {
  for (const pointer of pointers) {
    const result = await driveConnector.verifyArtifactHash({
      driveFileId: pointer.driveFileId,
      expectedSha256: pointer.sha256,
    });
    if (!result.match) {
      throw publicationError('Published artifact hash verification failed.', [
        blocker(
          'hash_mismatch',
          `artifacts.${pointer.artifactType}.sha256`,
          `Drive artifact ${pointer.artifactType} hash status is ${result.status}.`,
          'Do not certify or lock until Drive artifact bytes match their SHA-256 pointers.',
        ),
      ]);
    }
  }
}

async function publishedGeneratedAt(
  driveConnector: PacketDriveConnector,
  packetInstanceId: string,
  now: () => Date,
): Promise<string> {
  const existing = await driveConnector.readSidecar({
    packetInstanceId,
    sidecarKind: 'kpis',
    driveFileId: null,
  });
  return existing?.generatedAt ?? now().toISOString();
}

function requirePointer(
  pointers: readonly DriveArtifactPointer[],
  artifactType: DriveArtifactPointer['artifactType'],
): DriveArtifactPointer {
  const pointer = pointers.find((candidate) => candidate.artifactType === artifactType);
  if (pointer === undefined) {
    throw publicationError('Published artifact pointer is missing.', [
      blocker(
        'drive_publication_missing',
        `pointers.${artifactType}`,
        `Drive publication did not return a ${artifactType} pointer.`,
        'Retry publication and verify the Drive connector result.',
      ),
    ]);
  }
  return pointer;
}

function metadataPatch(
  packet: PacketStoreDocument,
  pointer: DriveArtifactPointer,
  contentHash: string,
  sourceClassification: 'production' | 'synthetic',
): PacketInstancePatch {
  const patch: PacketInstancePatch = {};
  if (packet.driveFolderUrl !== pointer.driveFolderUrl) {
    patch.driveFolderUrl = pointer.driveFolderUrl;
  }
  if (packet.finalArtifactUrl !== pointer.driveFileUrl) {
    patch.finalArtifactUrl = pointer.driveFileUrl;
  }
  if (packet.contentHash !== contentHash) {
    patch.contentHash = contentHash;
  }
  if (packet.sourceClassification !== sourceClassification) {
    patch.sourceClassification = sourceClassification;
  }
  return patch;
}

function buildCertificationChecklist(
  packet: PacketStoreDocument,
  input: CertificationInput | LockPacketInput,
  requireDrivePublication: boolean,
): readonly CertificationChecklistResult[] {
  const blocked = new Map<Fr032ChecklistItemLabel, PublicationBlockerCode>();
  if (!packet.packetInstanceId || !packet.agencyId || !packet.eventInstanceId) {
    blocked.set('packet identity', 'packet_identity_missing');
  }
  if (!packet.reportingPeriodStart || !packet.reportingPeriodEnd) {
    blocked.set('reporting period', 'reporting_period_missing');
  }
  if (!packet.workflowId || !packet.workflowInstanceId) {
    blocked.set('workflow', 'workflow_identity_missing');
  }
  if (packet.packetVersion < 1) {
    blocked.set('version', 'packet_identity_missing');
  }
  if (packet.moduleInstances.some((moduleInstance) => moduleInstance.status === 'blocked')) {
    blocked.set('forms', 'attachment_not_validated');
  }
  for (const evidenceBlocker of evidenceBlockers(packet, input)) {
    blocked.set('evidence', evidenceBlocker.code);
    if (evidenceBlocker.code === 'evidence_blocker_unresolved') {
      blocked.set('zero unresolved blockers', evidenceBlocker.code);
    }
  }
  if (packet.approvalIds.length === 0) {
    blocked.set('approvals', 'certification_status_invalid');
  }
  for (const signatureBlocker of signatureBlockers(packet, input)) {
    if (signatureBlocker.code === 'authority_not_verified') {
      blocked.set('authority', signatureBlocker.code);
    } else if (signatureBlocker.code === 'signature_confidentiality_missing') {
      blocked.set('confidentiality', signatureBlocker.code);
    } else {
      blocked.set('signatures', signatureBlocker.code);
    }
  }
  for (const hashBlocker of certificationHashBlockers(packet, input)) {
    blocked.set('hashes', hashBlocker.code);
  }
  if (requireDrivePublication && (!packet.driveFolderUrl || !packet.finalArtifactUrl)) {
    blocked.set('Drive publication', 'drive_publication_missing');
  }
  if (!requireDrivePublication) {
    blocked.delete('Drive publication');
  }

  return FR032_VERIFICATION_CHECKLIST.map((item) => {
    const blockerCode = blocked.get(item.label) ?? null;
    const state: VerificationState =
      blockerCode !== null ? 'blocked' : item.label === 'Drive publication' && !requireDrivePublication ? 'pending' : 'verified';
    return {
      itemId: item.itemId,
      label: item.label,
      state,
      blockerCode,
    };
  });
}

function checklistBlockers(checklist: readonly CertificationChecklistResult[]): PublicationBlocker[] {
  return checklist
    .filter((item) => item.state === 'blocked' && item.blockerCode !== null)
    .map((item) =>
      blocker(
        item.blockerCode ?? 'packet_status_invalid',
        item.label,
        `FR-032 checklist item "${item.label}" is blocked.`,
        'Resolve the blocked FR-032 certification and lock checklist item before retrying.',
      ),
    );
}

function certificationContentHash(
  packet: PacketStoreDocument,
  input: CertificationInput | LockPacketInput,
): string {
  const blockers = certificationHashBlockers(packet, input);
  if (blockers.length > 0) {
    throw publicationError('Packet hash verification failed.', blockers);
  }
  const requested = input.contentHash?.trim();
  return packet.contentHash ?? requested ?? '';
}

function certificationHashBlockers(
  packet: PacketStoreDocument,
  input: CertificationInput | LockPacketInput,
): PublicationBlocker[] {
  const requested = input.contentHash?.trim();
  const blockers: PublicationBlocker[] = [];
  if (input.contentHash !== undefined && requested === '') {
    blockers.push(blocker(
      'hash_mismatch',
      'contentHash',
      'The supplied contentHash is blank.',
      'Provide the frozen packet content hash before certification or lock.',
    ));
  }
  if (packet.contentHash === null && requested === undefined) {
    blockers.push(blocker(
      'hash_mismatch',
      'contentHash',
      'Packet content hash is missing.',
      'Freeze and hash the packet content before certification or lock.',
    ));
  }
  if (packet.contentHash !== null && requested !== undefined && packet.contentHash !== requested) {
    blockers.push(blocker(
      'hash_mismatch',
      'contentHash',
      'Supplied contentHash does not match the packet contentHash.',
      'Use the content hash bound to the frozen packet version.',
    ));
  }
  return blockers;
}

async function assertPublishedSidecars(
  packet: PacketStoreDocument,
  driveConnector: PacketDriveConnector,
  expectedContentHash: string,
): Promise<void> {
  if (!packet.driveFolderUrl || !packet.finalArtifactUrl) {
    throw publicationError('Packet has not been published to Drive.', [
      blocker(
        'drive_publication_missing',
        'driveFolderUrl',
        'Lock requires stored Drive folder and file URLs.',
        'Publish the canonical PDF and structured sidecars before lock.',
      ),
    ]);
  }
  for (const sidecarKind of REQUIRED_SIDECAR_KINDS) {
    let sidecar: PacketSidecarPayload | null;
    try {
      sidecar = await driveConnector.readSidecar({
        packetInstanceId: packet.packetInstanceId,
        sidecarKind,
        driveFileId: null,
      });
    } catch (error) {
      throw publicationError('Published sidecar hash verification failed.', [
        blocker(
          'hash_mismatch',
          `sidecars.${sidecarKind}`,
          error instanceof Error
            ? `Published ${sidecarKind} sidecar failed hash verification: ${error.message}`
            : `Published ${sidecarKind} sidecar failed hash verification.`,
          'Republish the packet sidecars and verify their SHA-256 pointers before lock.',
        ),
      ]);
    }
    if (sidecar === null) {
      throw publicationError('Published sidecar validation failed.', [
        blocker(
          'drive_sidecar_missing',
          `sidecars.${sidecarKind}`,
          `Published ${sidecarKind} sidecar was not found or failed hash verification.`,
          'Republish the packet sidecars before lock.',
        ),
      ]);
    }
    const blockers = sidecarHeaderBlockers(packet, sidecarKind, sidecar, expectedContentHash);
    if (blockers.length > 0) {
      throw publicationError('Published sidecar validation failed.', blockers);
    }
  }
}

function assertPublicationPointers(
  pointers: readonly DriveArtifactPointer[],
  artifacts: readonly PublicationArtifact[],
): void {
  for (const artifact of artifacts) {
    requirePointer(pointers, artifact.artifactType);
  }
}

function sidecarHeaderBlockers(
  packet: PacketStoreDocument,
  sidecarKind: SidecarArtifactKind,
  sidecar: PacketSidecarPayload,
  expectedContentHash: string,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];
  if (sidecar.kind !== sidecarKind) {
    blockers.push(blocker(
      'drive_sidecar_missing',
      `sidecars.${sidecarKind}.kind`,
      `Published sidecar kind ${sidecar.kind} does not match ${sidecarKind}.`,
      'Republish the packet sidecars before lock.',
    ));
  }
  if (sidecar.packetInstanceId !== packet.packetInstanceId) {
    blockers.push(blocker(
      'drive_sidecar_missing',
      `sidecars.${sidecarKind}.packetInstanceId`,
      `Published ${sidecarKind} sidecar is bound to ${sidecar.packetInstanceId}, not ${packet.packetInstanceId}.`,
      'Republish the sidecar set bound to this packet instance.',
    ));
  }
  if (sidecar.packetVersion !== packet.packetVersion) {
    blockers.push(blocker(
      'packet_revision_stale',
      `sidecars.${sidecarKind}.packetVersion`,
      `Published ${sidecarKind} sidecar version ${sidecar.packetVersion} does not match packet version ${packet.packetVersion}.`,
      'Republish the sidecar set for the current frozen packet version.',
    ));
  }
  if (sidecar.packetHash !== expectedContentHash) {
    blockers.push(blocker(
      'hash_mismatch',
      `sidecars.${sidecarKind}.packetHash`,
      `Published ${sidecarKind} sidecar hash does not match the packet content hash.`,
      'Republish the sidecar set from the frozen packet content hash.',
    ));
  }
  if (sidecar.agencyId !== packet.agencyId) {
    blockers.push(blocker(
      'drive_sidecar_missing',
      `sidecars.${sidecarKind}.agencyId`,
      `Published ${sidecarKind} sidecar agency ${sidecar.agencyId} does not match packet agency ${packet.agencyId}.`,
      'Republish the sidecar set bound to this packet agency.',
    ));
  }
  if (
    packet.sourceClassification !== null &&
    sidecar.sourceClassification !== packet.sourceClassification
  ) {
    blockers.push(blocker(
      'source_classification_missing',
      `sidecars.${sidecarKind}.sourceClassification`,
      `Published ${sidecarKind} sidecar source classification does not match the packet.`,
      'Republish the sidecar set with the approved source classification.',
    ));
  }
  return blockers;
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function isLockedMutationError(error: unknown): boolean {
  return error instanceof LockedPacketError;
}

export const publish = publishPacket;
export const certify = certifyPacket;
export const lock = lockPacket;
export const createSuperseding = createSupersedingPacket;
