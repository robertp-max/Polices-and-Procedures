import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { describe, expect, it } from 'vitest';
import { ApiError } from '../errors.js';
import { identityMiddleware } from '../identity/middleware.js';
import { mountTestAuthBoundary, testAuthHeaders } from '../auth/testAuthHarness.js';
import type {
  DriveArtifactPointer,
  PacketAuditEvent,
  PacketEnvelope,
  PacketModel,
  PacketSignerTask,
} from '@/policy/packets/contracts';
import { FileLocalPacketStore, type PacketStoreDocument } from './store.js';
import {
  buildCanonicalSignedPackage,
  listSignedPackageRecordReferences,
  sha256Digest,
  verifySignedPackageHashes,
  type CanonicalSignedPackage,
} from './signedPackage.js';
import { createPacketSignedPackageRouter } from './routes/signedPackage.js';

const FIXED_HTML = '<!doctype html><html><body><h1>Final signed packet</h1></body></html>';
const FIXED_ASSEMBLED_AT = '2026-07-12T12:00:00.000Z';

const ERROR_HANDLER: ErrorRequestHandler = (err, _req, res, _next) => {
  void _next;
  const apiErr = err instanceof ApiError
    ? err
    : new ApiError('internal_error', err instanceof Error ? err.message : 'Internal error', 500);
  res.status(apiErr.status).json({
    error: {
      code: apiErr.code,
      message: apiErr.message,
      details: apiErr.details,
    },
  });
};

describe('canonical signed package builder', () => {
  it('assembles every related record under one stable signed-package ID', async () => {
    const packet = packetFixture();
    const envelope = envelopeFixture({ packetInstanceId: packet.packetInstanceId });
    const first = await buildForTest(packet, envelope);
    const second = await buildForTest(packet, envelope);

    expect(first.signedPackageId).toBe(second.signedPackageId);
    expect(first.signedPackageHash).toBe(second.signedPackageHash);

    const references = listSignedPackageRecordReferences(first);
    expect(references.map((reference) => reference.path)).toEqual(
      expect.arrayContaining([
        'finalSignedPacket',
        'finalSignedPacket.renderedArtifact',
        'attachments.0',
        'signatureCertificate',
        'signatureCertificate.signers.0',
        'signerAuditTrail',
        'signerAuditTrail.signerTasks.0',
        'attachmentManifest',
        'attachmentManifest.attachments.0',
        'evidenceManifest',
        'evidenceManifest.entries.0',
        'approvalRecord',
        'certificationRecord',
        'confidentialAddendumReferences.0',
        'amendmentSupersessionReferences.0',
      ]),
    );
    expect(references).not.toHaveLength(0);
    expect(references.every((reference) => reference.signedPackageId === first.signedPackageId))
      .toBe(true);
  });

  it('verifies packet content hash and signed-package hash, and detects tampering', async () => {
    const signedPackage = await buildForTest(packetFixture(), envelopeFixture());

    expect(signedPackage.packetContentHash).toBe(sha256Digest(FIXED_HTML));
    expect(signedPackage.finalSignedPacket.renderedArtifact.format).toBe('html-fallback');
    expect(verifySignedPackageHashes(signedPackage, FIXED_HTML)).toMatchObject({
      packetContentHashMatches: true,
      signedPackageHashMatches: true,
    });

    const tamperedPackage: CanonicalSignedPackage = {
      ...signedPackage,
      approvalRecord: {
        ...signedPackage.approvalRecord,
        approvalIds: ['approval-tampered'],
      },
    };
    expect(verifySignedPackageHashes(tamperedPackage, FIXED_HTML).signedPackageHashMatches)
      .toBe(false);
    expect(verifySignedPackageHashes(signedPackage, `${FIXED_HTML} changed`).packetContentHashMatches)
      .toBe(false);
  });

  it('requires all packet content hash fields to verify against rendered content', async () => {
    const signedPackage = await buildForTest(packetFixture(), envelopeFixture());
    const inconsistentPackage: CanonicalSignedPackage = {
      ...signedPackage,
      finalSignedPacket: {
        ...signedPackage.finalSignedPacket,
        packetContentHash: 'sha256:wrong-final-packet-hash',
        renderedArtifact: {
          ...signedPackage.finalSignedPacket.renderedArtifact,
          contentHash: 'sha256:wrong-rendered-artifact-hash',
        },
      },
    };

    expect(verifySignedPackageHashes(inconsistentPackage, FIXED_HTML).packetContentHashMatches)
      .toBe(false);
  });

  it('rejects envelopes and signer tasks not bound to the target packet version', async () => {
    const packet = packetFixture();

    await expect(buildForTest(packet, envelopeFixture({ packetInstanceId: 'packet-instance-other' })))
      .rejects.toMatchObject({
        code: 'signed_package.envelope_packet_mismatch',
        path: 'envelope.packetInstanceId',
      });
    await expect(buildForTest(packet, envelopeFixture({ frozenPacketVersion: packet.packetVersion + 1 })))
      .rejects.toMatchObject({
        code: 'signed_package.envelope_version_mismatch',
        path: 'envelope.frozenPacketVersion',
      });
    await expect(buildForTest(packet, envelopeFixture({
      signerTasks: [signerTaskFixture({ envelopeId: 'env-other' })],
    })))
      .rejects.toMatchObject({
        code: 'signed_package.signer_task_envelope_mismatch',
        path: 'envelope.signerTasks',
      });
  });

  it('requires the frozen envelope content hash used for package identity', async () => {
    await expect(buildForTest(packetFixture(), envelopeFixture({ contentHash: '  ' })))
      .rejects.toMatchObject({
        code: 'signed_package.envelope_content_hash_missing',
        path: 'envelope.contentHash',
      });
  });

  it('POST /signed-package returns server hashes and ignores client-supplied hashes', async () => {
    const cacheRoot = makeTempDir('signed-package-route-');
    const auditRoot = makeTempDir('signed-package-route-audit-');
    const store = new FileLocalPacketStore(cacheRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    try {
      const created = await store.createPacketInstance({
        agencyId: 'agency-sp',
        eventFamilyId: 'qapi_meeting',
        eventInstanceId: 'evt-sp-route',
        archetypeId: 'analytical-report',
        archetypeVersion: '1.0.0',
        packetTemplateId: 'qapi-quarterly',
        workflowId: 'QA-WF-03',
        workflowInstanceId: 'wf-sp-route',
        createdBy: 'route-user',
        status: 'FULLY_SIGNED',
        attachmentInstances: packetFixture().attachmentInstances,
        approvalIds: ['approval-route'],
      });
      const app = buildApp(store);
      const response = await requestJson(
        app,
        'POST',
        `/api/packets/${created.instance.packetInstanceId}/signed-package`,
        {
          clientHash: 'sha256:client-controlled',
          packetContentHash: 'sha256:client-controlled',
          confidentialAddendumReferences: [
            {
              referenceId: 'conf-route',
              referenceType: 'confidential-addendum',
              targetKind: 'restricted-addendum',
              targetId: 'hr-route',
              reason: null,
            },
          ],
        },
      );

      expect(response.status).toBe(201);
      const body = jsonObject(response.body);
      expect(body.clientHashTrusted).toBe(false);
      expect(body.ignoredClientFields).toEqual(['clientHash', 'packetContentHash']);
      const signedPackage = body.signedPackage as CanonicalSignedPackage;
      expect(signedPackage.packetInstanceId).toBe(created.instance.packetInstanceId);
      expect(signedPackage.packetContentHash).toBe(sha256Digest(FIXED_HTML));
      expect(signedPackage.packetContentHash).not.toBe('sha256:client-controlled');
      expect(verifySignedPackageHashes(signedPackage, FIXED_HTML)).toMatchObject({
        packetContentHashMatches: true,
        signedPackageHashMatches: true,
      });
    } finally {
      fs.rmSync(cacheRoot, { recursive: true, force: true });
      fs.rmSync(auditRoot, { recursive: true, force: true });
    }
  });
});

async function buildForTest(
  packet: PacketStoreDocument,
  envelope: PacketEnvelope,
): Promise<CanonicalSignedPackage> {
  return buildCanonicalSignedPackage(
    {
      packet,
      packetModel: packetModelFixture(packet),
      envelope,
      signerAuditEvents: [signerAuditEventFixture(packet.packetInstanceId)],
      evidencePointers: [evidencePointerFixture(packet.packetInstanceId)],
      confidentialAddendumReferences: [
        {
          referenceId: 'conf-addendum-1',
          referenceType: 'confidential-addendum',
          targetKind: 'restricted-addendum',
          targetId: 'hr-addendum-1',
          reason: 'Personnel-review details remain outside the general packet.',
        },
      ],
      amendmentSupersessionReferences: [
        {
          referenceId: 'amendment-1',
          referenceType: 'amendment',
          targetKind: 'packet',
          targetId: 'packet-amendment-1',
          reason: 'Formal amendment reference.',
        },
      ],
      assembledAt: FIXED_ASSEMBLED_AT,
      assembledBy: 'route-user',
    },
    {
      renderPacketHtml: () => FIXED_HTML,
      renderPdf: async () => null,
    },
  );
}

function packetFixture(overrides: Partial<PacketStoreDocument> = {}): PacketStoreDocument {
  const base: PacketStoreDocument = {
    packetInstanceId: 'packet-instance-sp-1',
    packetId: 'packet-sp',
    packetVersion: 3,
    agencyId: 'agency-sp',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-sp-1',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    subtype: null,
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-sp-1',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    dataThroughDate: '2026-03-31',
    status: 'FULLY_SIGNED',
    moduleInstances: [],
    attachmentInstances: [
      {
        attachmentInstanceId: 'att-sp-1',
        attachmentTypeId: 'qapi-source-export',
        formInstanceId: 'form-sp-1',
        evidenceId: 'ev-sp-1',
        title: 'Q1 source export',
        mimeType: 'application/pdf',
        pageStart: 12,
        pageEnd: 18,
        confidentialityLevel: 'internal',
        driveUrl: 'https://drive.example/source-export',
        contentHash: 'sha256:attachment',
        status: 'validated',
        createdAt: '2026-07-10T10:00:00.000Z',
        updatedAt: '2026-07-10T10:00:00.000Z',
      },
    ],
    blockerIds: [],
    warningIds: [],
    approvalIds: ['approval-qapi-chair'],
    signatureIds: ['sig-task-1'],
    evidenceManifestId: 'evidence-manifest-sp-1',
    auditChronologyId: 'audit-sp-1',
    driveFolderUrl: null,
    finalArtifactUrl: null,
    createdAt: '2026-07-10T09:00:00.000Z',
    createdBy: 'route-user',
    updatedAt: '2026-07-12T12:00:00.000Z',
    certifiedAt: null,
    lockedAt: null,
    contentHash: null,
    supersedesPacketInstanceId: null,
    supersededByPacketInstanceId: null,
    sourceClassification: 'production',
    revision: 7,
    identityKey: 'agency-sp|evt-sp-1|wf-sp-1|qapi-quarterly',
  };
  return { ...base, ...overrides };
}

function packetModelFixture(packet: PacketStoreDocument): PacketModel {
  return {
    identity: {
      packetInstanceId: packet.packetInstanceId,
      packetId: packet.packetId,
      packetVersion: packet.packetVersion,
      contentHash: packet.contentHash,
      agencyId: packet.agencyId,
      eventFamilyId: packet.eventFamilyId,
      eventInstanceId: packet.eventInstanceId,
      workflowId: packet.workflowId,
      workflowInstanceId: packet.workflowInstanceId,
      packetTemplateId: packet.packetTemplateId,
      archetypeId: packet.archetypeId,
      subtype: packet.subtype,
      reportingPeriodStart: packet.reportingPeriodStart,
      reportingPeriodEnd: packet.reportingPeriodEnd,
      dataThroughDate: packet.dataThroughDate,
      status: packet.status,
    },
    renderingProfileId: 'care-indeed-letter',
    classification: 'internal',
    handlingNotice: null,
    modules: [],
    pagePlan: null,
  };
}

function envelopeFixture(overrides: Partial<PacketEnvelope> = {}): PacketEnvelope {
  const base: PacketEnvelope = {
    envelopeId: 'env-sp-1',
    packetInstanceId: 'packet-instance-sp-1',
    frozenPacketVersion: 3,
    contentHash: 'sha256:frozen-approved-version',
    memberFormInstanceIds: ['form-sp-1'],
    signerTasks: [signerTaskFixture()],
    status: 'COMPLETED',
    preSignaturePdfUrl: null,
    attachmentManifestId: 'attachment-manifest-sp-1',
    evidenceManifestId: 'evidence-manifest-sp-1',
    signaturePlacementMapId: 'signature-placement-sp-1',
    createdAt: '2026-07-11T10:00:00.000Z',
    createdBy: 'signature-coordinator',
    sentAt: '2026-07-11T11:00:00.000Z',
    completedAt: '2026-07-12T12:00:00.000Z',
    voidedAt: null,
    voidReason: null,
    expiresAt: null,
    idempotencyKey: 'env-idempotency-1',
  };
  return { ...base, ...overrides };
}

function signerTaskFixture(overrides: Partial<PacketSignerTask> = {}): PacketSignerTask {
  const base: PacketSignerTask = {
    signerTaskId: 'sig-task-1',
    envelopeId: 'env-sp-1',
    requiredCapacity: 'QAPI Committee Chair',
    signerUserId: 'chair-1',
    signerName: 'QAPI Chair',
    signerEmail: 'chair@example.test',
    signerRole: 'qapi_chair',
    authorityVerified: true,
    order: 1,
    required: true,
    dualCapacityRuleId: null,
    dualCapacities: null,
    status: 'COMPLETED',
    dueDate: null,
    expiresAt: null,
    signedAt: '2026-07-12T12:00:00.000Z',
    declinedAt: null,
    declineReason: null,
    reminderCount: 0,
    attachmentAccessGranted: true,
    confidentialityAcknowledged: true,
  };
  return { ...base, ...overrides };
}

function signerAuditEventFixture(packetInstanceId: string): PacketAuditEvent {
  return {
    eventId: 'audit-signer-1',
    sequence: 12,
    eventType: 'packet.signer_action',
    actor: {
      kind: 'user',
      actorId: 'chair-1',
      actorRole: 'qapi_chair',
      onBehalfOf: null,
    },
    resource: {
      resourceType: 'signature',
      resourceId: 'sig-task-1',
      parentResourceId: 'env-sp-1',
      packetInstanceId,
      packetVersion: 3,
    },
    timestamp: '2026-07-12T12:00:00.000Z',
    summary: 'Signer completed required capacity.',
    before: null,
    after: { status: 'COMPLETED' },
    reason: null,
    correlationId: null,
    idempotencyKey: null,
    previousHash: 'sha256:previous',
    currentHash: 'sha256:current',
  };
}

function evidencePointerFixture(packetInstanceId: string): DriveArtifactPointer {
  return {
    evidenceId: 'ev-sp-1',
    packetInstanceId,
    artifactType: 'pdf',
    driveFileId: 'drive-file-1',
    driveFileUrl: 'https://drive.example/source-export',
    driveFolderId: 'drive-folder-1',
    driveFolderUrl: 'https://drive.example/folder',
    sha256: 'sha256:attachment',
    mimeType: 'application/pdf',
    sizeBytes: 1234,
    classification: 'internal',
    retentionRule: 'packet-retention',
    publishedAt: '2026-07-12T12:00:00.000Z',
    publishedBy: 'route-user',
  };
}

function buildApp(store: FileLocalPacketStore): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', identityMiddleware);
  mountTestAuthBoundary(app); // same requireApiAuth boundary as production
  app.use('/api/packets', createPacketSignedPackageRouter({
    store,
    renderPacketHtml: () => FIXED_HTML,
    renderPdf: async () => null,
    resolveEnvelope: async (packet) => envelopeFixture({ packetInstanceId: packet.packetInstanceId }),
    resolvePacketModel: async (packet) => packetModelFixture(packet),
    resolveSignerAuditEvents: async (packet) => [signerAuditEventFixture(packet.packetInstanceId)],
    resolveEvidencePointers: async (packet) => [evidencePointerFixture(packet.packetInstanceId)],
  }));
  app.use(ERROR_HANDLER);
  return app;
}

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return testAuthHeaders({ 'Idempotency-Key': 'signed-package-route-1', ...extra });
}

function jsonObject(value: unknown): Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);
  return value as Record<string, unknown>;
}

async function listen(app: Express): Promise<Server> {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => resolve(server));
  });
}

async function close(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function requestJson(
  app: Express,
  method: 'POST',
  urlPath: string,
  body: unknown,
): Promise<{ status: number; body: unknown }> {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${urlPath}`, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) as unknown : null,
    };
  } finally {
    await close(server);
  }
}
