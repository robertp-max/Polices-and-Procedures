import { createHash } from 'node:crypto';
import { htmlToPdf } from '../htmlToPdf.js';
import type {
  DriveArtifactPointer,
  PacketAuditEvent,
  PacketAttachmentInstance,
  PacketEnvelope,
  PacketModel,
  PacketSignerTask,
} from '@/policy/packets/contracts';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';
import { isEnvelopeFullySigned } from './envelope/envelopeStatus.js';
import type { PacketStoreDocument } from './store.js';

export type SignedPackageArtifactFormat = 'pdf' | 'html-fallback';

export interface SignedPackageReferenceInput {
  referenceId: string;
  referenceType: string;
  targetKind: string;
  targetId: string;
  reason: string | null;
}

export interface SignedPackageApprovalRecordInput {
  approvalRecordId?: string;
  approvalIds?: readonly string[];
  approvedAt?: string | null;
  approvedBy?: string | null;
}

export interface SignedPackageCertificationRecordInput {
  certificationRecordId?: string;
  certifiedAt?: string | null;
  certifiedBy?: string | null;
  verificationHash?: string | null;
}

export interface BuildCanonicalSignedPackageInput {
  packet: PacketStoreDocument;
  packetModel: PacketModel;
  envelope: PacketEnvelope;
  signerAuditEvents?: readonly PacketAuditEvent[];
  evidencePointers?: readonly DriveArtifactPointer[];
  approvalRecord?: SignedPackageApprovalRecordInput;
  certificationRecord?: SignedPackageCertificationRecordInput;
  confidentialAddendumReferences?: readonly SignedPackageReferenceInput[];
  amendmentSupersessionReferences?: readonly SignedPackageReferenceInput[];
  assembledAt?: string;
  assembledBy: string;
}

export interface SignedPackageBuilderDependencies {
  renderPacketHtml?: (model: PacketModel) => string;
  renderPdf?: (html: string) => Promise<Buffer | null>;
}

export interface SignedPackageRenderedArtifact {
  signedPackageId: string;
  format: SignedPackageArtifactFormat;
  mimeType: 'application/pdf' | 'text/html';
  sizeBytes: number;
  contentHash: string;
}

export interface SignedPackageFinalPacketRecord {
  signedPackageId: string;
  packetInstanceId: string;
  packetId: string;
  packetVersion: number;
  packetContentHash: string;
  frozenEnvelopeContentHash: string;
  renderedArtifact: SignedPackageRenderedArtifact;
}

export interface SignedPackageAttachmentRecord {
  signedPackageId: string;
  attachmentInstanceId: string;
  attachmentTypeId: string;
  formInstanceId: string | null;
  evidenceId: string | null;
  title: string;
  mimeType: string | null;
  pageStart: number | null;
  pageEnd: number | null;
  confidentialityLevel: string;
  driveUrl: string | null;
  contentHash: string | null;
  status: PacketAttachmentInstance['status'];
}

export interface SignedPackageCertificateSigner {
  signedPackageId: string;
  signerTaskId: string;
  requiredCapacity: string;
  signerUserId: string | null;
  signerName: string | null;
  signerEmail: string | null;
  signerRole: string | null;
  order: number;
  signedAt: string | null;
  authorityVerified: boolean;
  confidentialityAcknowledged: boolean;
  dualCapacityRuleId: string | null;
  dualCapacities: readonly [string, string] | null;
}

export interface SignedPackageSignatureCertificate {
  signedPackageId: string;
  certificateId: string;
  envelopeId: string;
  envelopeStatus: string;
  completedAt: string | null;
  signers: readonly SignedPackageCertificateSigner[];
}

export interface SignedPackageSignerAuditTask {
  signedPackageId: string;
  signerTaskId: string;
  envelopeId: string;
  requiredCapacity: string;
  signerUserId: string | null;
  signerName: string | null;
  signerEmail: string | null;
  signerRole: string | null;
  order: number;
  required: boolean;
  status: PacketSignerTask['status'];
  signedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  reminderCount: number;
  attachmentAccessGranted: boolean;
  authorityVerified: boolean;
  confidentialityAcknowledged: boolean;
  dualCapacityRuleId: string | null;
  dualCapacities: readonly [string, string] | null;
}

export interface SignedPackageSignerAuditTrail {
  signedPackageId: string;
  auditTrailId: string;
  envelopeId: string;
  signerTasks: readonly SignedPackageSignerAuditTask[];
  auditEventIds: readonly string[];
}

export interface SignedPackageAttachmentManifest {
  signedPackageId: string;
  manifestId: string;
  attachments: readonly SignedPackageAttachmentRecord[];
}

export interface SignedPackageEvidenceManifestEntry {
  signedPackageId: string;
  evidenceId: string;
  artifactType: DriveArtifactPointer['artifactType'] | 'attachment';
  driveFileId: string | null;
  driveFileUrl: string | null;
  sha256: string | null;
  classification: string | null;
  sourceAttachmentInstanceId: string | null;
}

export interface SignedPackageEvidenceManifest {
  signedPackageId: string;
  manifestId: string;
  entries: readonly SignedPackageEvidenceManifestEntry[];
}

export interface SignedPackageApprovalRecord {
  signedPackageId: string;
  approvalRecordId: string;
  approvalIds: readonly string[];
  approvedAt: string | null;
  approvedBy: string | null;
}

export interface SignedPackageCertificationRecord {
  signedPackageId: string;
  certificationRecordId: string;
  packetStatus: PacketStoreDocument['status'];
  certifiedAt: string | null;
  certifiedBy: string | null;
  verificationHash: string | null;
}

export interface SignedPackageReferenceRecord extends SignedPackageReferenceInput {
  signedPackageId: string;
}

export interface CanonicalSignedPackage {
  signedPackageId: string;
  packetInstanceId: string;
  packetId: string;
  packetVersion: number;
  envelopeId: string;
  assembledAt: string;
  assembledBy: string;
  packetContentHash: string;
  signedPackageHash: string;
  hashAlgorithm: 'sha256';
  canonicalization: 'canonical-json-v1';
  finalSignedPacket: SignedPackageFinalPacketRecord;
  attachments: readonly SignedPackageAttachmentRecord[];
  signatureCertificate: SignedPackageSignatureCertificate;
  signerAuditTrail: SignedPackageSignerAuditTrail;
  attachmentManifest: SignedPackageAttachmentManifest;
  evidenceManifest: SignedPackageEvidenceManifest;
  approvalRecord: SignedPackageApprovalRecord;
  certificationRecord: SignedPackageCertificationRecord;
  confidentialAddendumReferences: readonly SignedPackageReferenceRecord[];
  amendmentSupersessionReferences: readonly SignedPackageReferenceRecord[];
}

export interface SignedPackageHashVerification {
  packetContentHashMatches: boolean;
  signedPackageHashMatches: boolean;
  expectedPacketContentHash: string;
  actualPacketContentHash: string;
  expectedSignedPackageHash: string;
  actualSignedPackageHash: string;
}

export interface SignedPackageRecordReferenceCheck {
  path: string;
  signedPackageId: string | null;
}

export class SignedPackageBuildError extends Error {
  readonly code: string;
  readonly status: number;
  readonly path: string;

  constructor(code: string, message: string, path = 'signedPackage', status = 409) {
    super(message);
    this.name = 'SignedPackageBuildError';
    this.code = code;
    this.status = status;
    this.path = path;
  }
}

export async function buildCanonicalSignedPackage(
  input: BuildCanonicalSignedPackageInput,
  dependencies: SignedPackageBuilderDependencies = {},
): Promise<CanonicalSignedPackage> {
  assertReadyForSignedPackage(input);

  const renderHtml = dependencies.renderPacketHtml ?? renderPacketModel;
  const renderPdf = dependencies.renderPdf ?? htmlToPdf;
  const html = renderHtml(input.packetModel);
  const pdf = await renderPdf(html);
  const artifactFormat: SignedPackageArtifactFormat = pdf ? 'pdf' : 'html-fallback';
  const artifactBytes = pdf ?? Buffer.from(html, 'utf8');
  const packetContentHash = sha256Digest(artifactBytes);
  const envelopeId = readEnvelopeId(input.envelope);
  const frozenEnvelopeContentHash = readEnvelopeContentHash(input.envelope);
  const signedPackageId = buildSignedPackageId(input.packet, envelopeId, frozenEnvelopeContentHash);
  const assembledAt = input.assembledAt ?? deterministicAssembledAt(input.packet, input.envelope);
  const attachments = input.packet.attachmentInstances.map((attachment) =>
    attachmentRecord(signedPackageId, attachment),
  );
  const signerAuditTrail = signerAuditTrailRecord(
    signedPackageId,
    envelopeId,
    input.envelope.signerTasks,
    input.signerAuditEvents ?? [],
  );
  const finalSignedPacket: SignedPackageFinalPacketRecord = {
    signedPackageId,
    packetInstanceId: input.packet.packetInstanceId,
    packetId: input.packet.packetId,
    packetVersion: input.packet.packetVersion,
    packetContentHash,
    frozenEnvelopeContentHash,
    renderedArtifact: {
      signedPackageId,
      format: artifactFormat,
      mimeType: pdf ? 'application/pdf' : 'text/html',
      sizeBytes: artifactBytes.byteLength,
      contentHash: packetContentHash,
    },
  };

  const unsignedPackage: CanonicalSignedPackage = {
    signedPackageId,
    packetInstanceId: input.packet.packetInstanceId,
    packetId: input.packet.packetId,
    packetVersion: input.packet.packetVersion,
    envelopeId,
    assembledAt,
    assembledBy: input.assembledBy,
    packetContentHash,
    signedPackageHash: '',
    hashAlgorithm: 'sha256',
    canonicalization: 'canonical-json-v1',
    finalSignedPacket,
    attachments,
    signatureCertificate: signatureCertificateRecord(
      signedPackageId,
      envelopeId,
      input.envelope,
    ),
    signerAuditTrail,
    attachmentManifest: {
      signedPackageId,
      manifestId: `attachment_manifest_${signedPackageId}`,
      attachments,
    },
    evidenceManifest: evidenceManifestRecord(
      signedPackageId,
      input.packet,
      attachments,
      input.evidencePointers ?? [],
    ),
    approvalRecord: approvalRecord(signedPackageId, input.packet, input.approvalRecord),
    certificationRecord: certificationRecord(
      signedPackageId,
      input.packet,
      input.certificationRecord,
    ),
    confidentialAddendumReferences: referenceRecords(
      signedPackageId,
      input.confidentialAddendumReferences ?? [],
    ),
    amendmentSupersessionReferences: [
      ...supersessionReferenceRecords(signedPackageId, input.packet),
      ...referenceRecords(signedPackageId, input.amendmentSupersessionReferences ?? []),
    ],
  };

  return {
    ...unsignedPackage,
    signedPackageHash: computeSignedPackageHash(unsignedPackage),
  };
}

export function sha256Digest(input: string | Buffer): string {
  return `sha256:${createHash('sha256').update(input).digest('hex')}`;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function computeSignedPackageHash(pkg: CanonicalSignedPackage): string {
  return sha256Digest(canonicalJson(hashMaterial(pkg)));
}

export function verifySignedPackageHashes(
  pkg: CanonicalSignedPackage,
  renderedContent?: string | Buffer,
): SignedPackageHashVerification {
  const expectedPacketContentHash =
    renderedContent === undefined
      ? pkg.finalSignedPacket.renderedArtifact.contentHash
      : sha256Digest(renderedContent);
  const expectedSignedPackageHash = computeSignedPackageHash(pkg);
  const packetContentHashMatches =
    expectedPacketContentHash === pkg.packetContentHash &&
    expectedPacketContentHash === pkg.finalSignedPacket.packetContentHash &&
    expectedPacketContentHash === pkg.finalSignedPacket.renderedArtifact.contentHash;
  return {
    packetContentHashMatches,
    signedPackageHashMatches: expectedSignedPackageHash === pkg.signedPackageHash,
    expectedPacketContentHash,
    actualPacketContentHash: pkg.packetContentHash,
    expectedSignedPackageHash,
    actualSignedPackageHash: pkg.signedPackageHash,
  };
}

export function listSignedPackageRecordReferences(
  pkg: CanonicalSignedPackage,
): SignedPackageRecordReferenceCheck[] {
  const checks: SignedPackageRecordReferenceCheck[] = [
    { path: 'finalSignedPacket', signedPackageId: pkg.finalSignedPacket.signedPackageId },
    {
      path: 'finalSignedPacket.renderedArtifact',
      signedPackageId: pkg.finalSignedPacket.renderedArtifact.signedPackageId,
    },
    { path: 'signatureCertificate', signedPackageId: pkg.signatureCertificate.signedPackageId },
    { path: 'signerAuditTrail', signedPackageId: pkg.signerAuditTrail.signedPackageId },
    { path: 'attachmentManifest', signedPackageId: pkg.attachmentManifest.signedPackageId },
    { path: 'evidenceManifest', signedPackageId: pkg.evidenceManifest.signedPackageId },
    { path: 'approvalRecord', signedPackageId: pkg.approvalRecord.signedPackageId },
    { path: 'certificationRecord', signedPackageId: pkg.certificationRecord.signedPackageId },
  ];

  pkg.attachments.forEach((attachment, index) => {
    checks.push({ path: `attachments.${index}`, signedPackageId: attachment.signedPackageId });
  });
  pkg.attachmentManifest.attachments.forEach((attachment, index) => {
    checks.push({
      path: `attachmentManifest.attachments.${index}`,
      signedPackageId: attachment.signedPackageId,
    });
  });
  pkg.evidenceManifest.entries.forEach((entry, index) => {
    checks.push({
      path: `evidenceManifest.entries.${index}`,
      signedPackageId: entry.signedPackageId,
    });
  });
  pkg.signerAuditTrail.signerTasks.forEach((task, index) => {
    checks.push({
      path: `signerAuditTrail.signerTasks.${index}`,
      signedPackageId: task.signedPackageId,
    });
  });
  pkg.signatureCertificate.signers.forEach((signer, index) => {
    checks.push({
      path: `signatureCertificate.signers.${index}`,
      signedPackageId: signer.signedPackageId,
    });
  });
  pkg.confidentialAddendumReferences.forEach((reference, index) => {
    checks.push({
      path: `confidentialAddendumReferences.${index}`,
      signedPackageId: reference.signedPackageId,
    });
  });
  pkg.amendmentSupersessionReferences.forEach((reference, index) => {
    checks.push({
      path: `amendmentSupersessionReferences.${index}`,
      signedPackageId: reference.signedPackageId,
    });
  });

  return checks;
}

function assertReadyForSignedPackage(input: BuildCanonicalSignedPackageInput): void {
  const envelopeId = readEnvelopeId(input.envelope);
  readEnvelopeContentHash(input.envelope);
  const envelopePacketInstanceId = readEnvelopePacketInstanceId(input.envelope);
  const frozenPacketVersion = readEnvelopeFrozenPacketVersion(input.envelope);
  if (envelopePacketInstanceId !== input.packet.packetInstanceId) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_packet_mismatch',
      `Envelope ${envelopeId} belongs to packet ${envelopePacketInstanceId}, not ${input.packet.packetInstanceId}.`,
      'envelope.packetInstanceId',
    );
  }
  if (frozenPacketVersion !== input.packet.packetVersion) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_version_mismatch',
      `Envelope ${envelopeId} is frozen to packet version ${frozenPacketVersion}, not ${input.packet.packetVersion}.`,
      'envelope.frozenPacketVersion',
    );
  }
  const envelopeStatus = readEnvelopeStatus(input.envelope);
  if (!isEnvelopeFullySigned(envelopeStatus)) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_not_completed',
      `Envelope ${envelopeId} is not fully signed.`,
      'envelope.status',
    );
  }
  if (!Array.isArray(input.envelope.signerTasks) || input.envelope.signerTasks.length === 0) {
    throw new SignedPackageBuildError(
      'signed_package.signer_audit_missing',
      `Envelope ${envelopeId} has no signer task audit trail.`,
      'envelope.signerTasks',
    );
  }
  const requiredTasks = input.envelope.signerTasks.filter((task) => task.required);
  if (requiredTasks.length === 0) {
    throw new SignedPackageBuildError(
      'signed_package.required_signer_missing',
      `Envelope ${envelopeId} has no required signer tasks.`,
      'envelope.signerTasks',
    );
  }
  const incomplete = requiredTasks.find((task) => !signerTaskComplete(task));
  if (incomplete) {
    throw new SignedPackageBuildError(
      'signed_package.signer_task_incomplete',
      `Required signer task ${incomplete.signerTaskId} is not completed.`,
      'envelope.signerTasks',
    );
  }
  const taskFromOtherEnvelope = input.envelope.signerTasks.find((task) => task.envelopeId !== envelopeId);
  if (taskFromOtherEnvelope) {
    throw new SignedPackageBuildError(
      'signed_package.signer_task_envelope_mismatch',
      `Signer task ${taskFromOtherEnvelope.signerTaskId} belongs to envelope ${taskFromOtherEnvelope.envelopeId}, not ${envelopeId}.`,
      'envelope.signerTasks',
    );
  }
  for (const pointer of input.evidencePointers ?? []) {
    if (pointer.packetInstanceId !== input.packet.packetInstanceId) {
      throw new SignedPackageBuildError(
        'signed_package.evidence_pointer_packet_mismatch',
        `Evidence pointer ${pointer.evidenceId} belongs to packet ${pointer.packetInstanceId}, not ${input.packet.packetInstanceId}.`,
        'evidencePointers',
      );
    }
  }
}

function signerTaskComplete(task: PacketSignerTask): boolean {
  return task.status === 'COMPLETED' && task.signedAt !== null;
}

function readEnvelopeId(envelope: PacketEnvelope): string {
  const id = readString(envelope, ['envelopeId', 'id']);
  if (!id) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_id_missing',
      'Envelope is missing envelopeId.',
      'envelope.envelopeId',
      400,
    );
  }
  return id;
}

function readEnvelopeContentHash(envelope: PacketEnvelope): string {
  const contentHash = readString(envelope, ['contentHash']);
  if (!contentHash) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_content_hash_missing',
      'Envelope is missing frozen packet contentHash.',
      'envelope.contentHash',
      400,
    );
  }
  return contentHash;
}

function readEnvelopePacketInstanceId(envelope: PacketEnvelope): string {
  const packetInstanceId = readString(envelope, ['packetInstanceId']);
  if (!packetInstanceId) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_packet_missing',
      'Envelope is missing packetInstanceId.',
      'envelope.packetInstanceId',
      400,
    );
  }
  return packetInstanceId;
}

function readEnvelopeFrozenPacketVersion(envelope: PacketEnvelope): number {
  const value: number = envelope.frozenPacketVersion;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new SignedPackageBuildError(
      'signed_package.envelope_version_missing',
      'Envelope is missing frozenPacketVersion.',
      'envelope.frozenPacketVersion',
      400,
    );
  }
  return value;
}

function readEnvelopeStatus(envelope: PacketEnvelope): string {
  return readString(envelope, ['status', 'state']) ?? '';
}

function readString(record: unknown, keys: readonly string[]): string | null {
  if (!record || typeof record !== 'object') return null;
  const values = record as Record<string, unknown>;
  for (const key of keys) {
    const value = values[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function buildSignedPackageId(
  packet: PacketStoreDocument,
  envelopeId: string,
  frozenEnvelopeContentHash: string,
): string {
  const basis = canonicalJson({
    envelopeId,
    frozenEnvelopeContentHash,
    packetInstanceId: packet.packetInstanceId,
    packetVersion: packet.packetVersion,
  });
  const digest = createHash('sha256').update(basis).digest('hex').slice(0, 24);
  return `sp_${safeId(packet.packetInstanceId)}_${digest}`;
}

function safeId(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]/g, '_');
}

function deterministicAssembledAt(packet: PacketStoreDocument, envelope: PacketEnvelope): string {
  const signedAtValues = envelope.signerTasks
    .map((task) => task.signedAt)
    .filter((value): value is string => value !== null);
  const sortedSignedAtValues = [...signedAtValues].sort();
  const latestSignedAt = sortedSignedAtValues[sortedSignedAtValues.length - 1];
  return envelope.completedAt ?? latestSignedAt ?? packet.updatedAt;
}

function attachmentRecord(
  signedPackageId: string,
  attachment: PacketAttachmentInstance,
): SignedPackageAttachmentRecord {
  return {
    signedPackageId,
    attachmentInstanceId: attachment.attachmentInstanceId,
    attachmentTypeId: attachment.attachmentTypeId,
    formInstanceId: attachment.formInstanceId,
    evidenceId: attachment.evidenceId,
    title: attachment.title,
    mimeType: attachment.mimeType,
    pageStart: attachment.pageStart,
    pageEnd: attachment.pageEnd,
    confidentialityLevel: attachment.confidentialityLevel,
    driveUrl: attachment.driveUrl,
    contentHash: attachment.contentHash,
    status: attachment.status,
  };
}

function certificateSigner(
  signedPackageId: string,
  task: PacketSignerTask,
): SignedPackageCertificateSigner {
  return {
    signedPackageId,
    signerTaskId: task.signerTaskId,
    requiredCapacity: task.requiredCapacity,
    signerUserId: task.signerUserId,
    signerName: task.signerName,
    signerEmail: task.signerEmail,
    signerRole: task.signerRole,
    order: task.order,
    signedAt: task.signedAt,
    authorityVerified: task.authorityVerified,
    confidentialityAcknowledged: task.confidentialityAcknowledged,
    dualCapacityRuleId: task.dualCapacityRuleId,
    dualCapacities: task.dualCapacities,
  };
}

function signatureCertificateRecord(
  signedPackageId: string,
  envelopeId: string,
  envelope: PacketEnvelope,
): SignedPackageSignatureCertificate {
  return {
    signedPackageId,
    certificateId: `signature_certificate_${signedPackageId}`,
    envelopeId,
    envelopeStatus: readEnvelopeStatus(envelope),
    completedAt: envelope.completedAt,
    signers: envelope.signerTasks.map((task) => certificateSigner(signedPackageId, task)),
  };
}

function signerAuditTask(
  signedPackageId: string,
  envelopeId: string,
  task: PacketSignerTask,
): SignedPackageSignerAuditTask {
  return {
    signedPackageId,
    signerTaskId: task.signerTaskId,
    envelopeId,
    requiredCapacity: task.requiredCapacity,
    signerUserId: task.signerUserId,
    signerName: task.signerName,
    signerEmail: task.signerEmail,
    signerRole: task.signerRole,
    order: task.order,
    required: task.required,
    status: task.status,
    signedAt: task.signedAt,
    declinedAt: task.declinedAt,
    declineReason: task.declineReason,
    reminderCount: task.reminderCount,
    attachmentAccessGranted: task.attachmentAccessGranted,
    authorityVerified: task.authorityVerified,
    confidentialityAcknowledged: task.confidentialityAcknowledged,
    dualCapacityRuleId: task.dualCapacityRuleId,
    dualCapacities: task.dualCapacities,
  };
}

function signerAuditTrailRecord(
  signedPackageId: string,
  envelopeId: string,
  signerTasks: readonly PacketSignerTask[],
  auditEvents: readonly PacketAuditEvent[],
): SignedPackageSignerAuditTrail {
  return {
    signedPackageId,
    auditTrailId: `signer_audit_trail_${signedPackageId}`,
    envelopeId,
    signerTasks: signerTasks.map((task) => signerAuditTask(signedPackageId, envelopeId, task)),
    auditEventIds: auditEvents.map((event) => event.eventId),
  };
}

function evidenceManifestRecord(
  signedPackageId: string,
  packet: PacketStoreDocument,
  attachments: readonly SignedPackageAttachmentRecord[],
  pointers: readonly DriveArtifactPointer[],
): SignedPackageEvidenceManifest {
  const entries = new Map<string, SignedPackageEvidenceManifestEntry>();

  for (const pointer of pointers) {
    entries.set(pointer.evidenceId, {
      signedPackageId,
      evidenceId: pointer.evidenceId,
      artifactType: pointer.artifactType,
      driveFileId: pointer.driveFileId,
      driveFileUrl: pointer.driveFileUrl,
      sha256: pointer.sha256,
      classification: pointer.classification,
      sourceAttachmentInstanceId: null,
    });
  }

  for (const attachment of attachments) {
    if (attachment.evidenceId === null || entries.has(attachment.evidenceId)) continue;
    entries.set(attachment.evidenceId, {
      signedPackageId,
      evidenceId: attachment.evidenceId,
      artifactType: 'attachment',
      driveFileId: null,
      driveFileUrl: attachment.driveUrl,
      sha256: attachment.contentHash,
      classification: attachment.confidentialityLevel,
      sourceAttachmentInstanceId: attachment.attachmentInstanceId,
    });
  }

  return {
    signedPackageId,
    manifestId: packet.evidenceManifestId,
    entries: [...entries.values()],
  };
}

function approvalRecord(
  signedPackageId: string,
  packet: PacketStoreDocument,
  input: SignedPackageApprovalRecordInput | undefined,
): SignedPackageApprovalRecord {
  return {
    signedPackageId,
    approvalRecordId: input?.approvalRecordId ?? `approval_record_${signedPackageId}`,
    approvalIds: input?.approvalIds ?? packet.approvalIds,
    approvedAt: input?.approvedAt ?? null,
    approvedBy: input?.approvedBy ?? null,
  };
}

function certificationRecord(
  signedPackageId: string,
  packet: PacketStoreDocument,
  input: SignedPackageCertificationRecordInput | undefined,
): SignedPackageCertificationRecord {
  return {
    signedPackageId,
    certificationRecordId: input?.certificationRecordId ?? `certification_record_${signedPackageId}`,
    packetStatus: packet.status,
    certifiedAt: input?.certifiedAt ?? packet.certifiedAt,
    certifiedBy: input?.certifiedBy ?? null,
    verificationHash: input?.verificationHash ?? null,
  };
}

function referenceRecords(
  signedPackageId: string,
  references: readonly SignedPackageReferenceInput[],
): SignedPackageReferenceRecord[] {
  return references.map((reference) => ({
    ...reference,
    signedPackageId,
  }));
}

function supersessionReferenceRecords(
  signedPackageId: string,
  packet: PacketStoreDocument,
): SignedPackageReferenceRecord[] {
  const records: SignedPackageReferenceRecord[] = [];
  if (packet.supersedesPacketInstanceId !== null) {
    records.push({
      signedPackageId,
      referenceId: `supersedes_${packet.supersedesPacketInstanceId}`,
      referenceType: 'supersedes',
      targetKind: 'packet',
      targetId: packet.supersedesPacketInstanceId,
      reason: null,
    });
  }
  if (packet.supersededByPacketInstanceId !== null) {
    records.push({
      signedPackageId,
      referenceId: `superseded_by_${packet.supersededByPacketInstanceId}`,
      referenceType: 'superseded-by',
      targetKind: 'packet',
      targetId: packet.supersededByPacketInstanceId,
      reason: null,
    });
  }
  return records;
}

function hashMaterial(pkg: CanonicalSignedPackage): Omit<CanonicalSignedPackage, 'signedPackageHash'> & {
  signedPackageHash: null;
} {
  return {
    ...pkg,
    signedPackageHash: null,
  };
}

function canonicalValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value !== 'object') return value;
  if (Buffer.isBuffer(value)) return value.toString('base64');
  if (Array.isArray(value)) return value.map((item) => canonicalValue(item));

  const source = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const key of Object.keys(source).sort()) {
    output[key] = canonicalValue(source[key]);
  }
  return output;
}
