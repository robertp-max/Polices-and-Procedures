import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type {
  PacketAttachmentInstance,
  PacketAuditActor,
  PriorPacketQuery,
  PublishArtifactsRequest,
  PublishArtifactsResult,
} from '@/policy/packets/contracts';
import { LocalDriveAdapter } from './drive/localDriveAdapter.js';
import {
  PacketPublicationError,
  beginAmendment,
  lockPacket,
  publishPacket,
} from './publication.js';
import {
  FileLocalPacketStore,
  LockedPacketError,
  type CreatePacketInstanceInput,
  type PacketStoreDocument,
} from './store.js';

const ACTOR: PacketAuditActor = {
  kind: 'user',
  actorId: 'qapi-certifier',
  actorRole: 'compliance_officer',
  onBehalfOf: null,
};

describe('packet publication, lock, amendment, and supersession gates', () => {
  let packetRoot: string;
  let driveRoot: string;
  let auditRoot: string;
  let store: FileLocalPacketStore;
  let driveConnector: LocalDriveAdapter;

  beforeEach(() => {
    packetRoot = makeTempDir('packet-publication-store-');
    driveRoot = makeTempDir('packet-publication-drive-');
    auditRoot = makeTempDir('packet-publication-audit-');
    store = new FileLocalPacketStore(packetRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    driveConnector = new LocalDriveAdapter(driveRoot);
  });

  afterEach(() => {
    fs.rmSync(packetRoot, { recursive: true, force: true });
    fs.rmSync(driveRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('publication retry is idempotent and creates zero duplicate Drive artifacts', async () => {
    const packet = await createCertifiedPacket('pub-retry');
    const first = await publishValidPacket(packet);
    const filesAfterFirst = artifactFiles(driveRoot);

    const replay = await publishPacket(
      { store, driveConnector },
      {
        ...validPublishInput(first.packet),
        expectedRevision: undefined,
      },
    );
    const filesAfterReplay = artifactFiles(driveRoot);

    expect(first.publication.idempotentReplay).toBe(false);
    expect(replay.publication.idempotentReplay).toBe(true);
    expect(filesAfterReplay).toEqual(filesAfterFirst);
    expect(filesAfterReplay).toHaveLength(6);
    expect(replay.pointers.map((pointer) => pointer.driveFileId).sort()).toEqual(
      first.pointers.map((pointer) => pointer.driveFileId).sort(),
    );

    const prior = await driveConnector.findPriorPacket(priorLookupQuery('2026-Q1'));
    expect(prior.found).toBe(true);
    expect(prior.packetInstanceId).toBe(packet.packetInstanceId);
    const kpis = await driveConnector.readSidecar({
      packetInstanceId: packet.packetInstanceId,
      sidecarKind: 'kpis',
      driveFileId: null,
    });
    expect(kpis?.kind).toBe('kpis');
    if (kpis?.kind === 'kpis') {
      expect(kpis.cadence).toBe('quarterly');
      expect(kpis.reportingPeriodStart).toBe('2026-01-01');
      expect(kpis.reportingPeriodEnd).toBe('2026-03-31');
    }
  });

  it('publication fails when Drive omits a structured sidecar pointer', async () => {
    const packet = await createCertifiedPacket('missing-sidecar-pointer');
    const incompleteDrive = new MissingSidecarPointerDriveAdapter(driveRoot);

    await expect(
      publishPacket(
        { store, driveConnector: incompleteDrive },
        validPublishInput(packet),
      ),
    ).rejects.toMatchObject({
      blockers: expect.arrayContaining([
        expect.objectContaining({ code: 'drive_publication_missing' }),
      ]),
    });

    const reloaded = await store.getById(packet.packetInstanceId);
    expect(reloaded?.status).not.toBe('PUBLISHED');
  });

  it('locked packet mutation fails through the public store update path', async () => {
    const locked = await publishAndLock('locked-mutation');

    await expect(
      store.update(
        locked.packetInstanceId,
        locked.revision,
        { warningIds: ['silent-post-lock-change'] },
        { actor: ACTOR, auditEventType: 'packet.edited' },
      ),
    ).rejects.toBeInstanceOf(LockedPacketError);

    const reloaded = await store.getById(locked.packetInstanceId);
    expect(reloaded?.status).toBe('LOCKED');
    expect(reloaded?.warningIds).toEqual([]);
  });

  it('amendment preserves the prior signed artifact pointer', async () => {
    const locked = await publishAndLock('amendment-preserves-artifact');
    const priorArtifactUrl = locked.finalArtifactUrl;
    expect(priorArtifactUrl).toMatch(/^local-drive:\/\/file\//);

    const amended = await beginAmendment(
      { store, driveConnector },
      {
        packetInstanceId: locked.packetInstanceId,
        expectedRevision: locked.revision,
        actor: ACTOR,
        reason: 'Correct post-lock finding through formal amendment.',
      },
    );

    expect(amended.priorSignedArtifactUrl).toBe(priorArtifactUrl);
    expect(amended.packet.status).toBe('AMENDMENT_REQUIRED');
    expect(amended.packet.finalArtifactUrl).toBe(priorArtifactUrl);
  });

  it('lock fails when publication or evidence validation fails', async () => {
    const unpublished = await createCertifiedPacket('lock-unpublished');
    await expect(
      lockPacket(
        { store, driveConnector },
        {
          packetInstanceId: unpublished.packetInstanceId,
          expectedRevision: unpublished.revision,
          actor: ACTOR,
          authorityVerified: true,
          confidentialityVerified: true,
        },
      ),
    ).rejects.toMatchObject({
      blockers: expect.arrayContaining([
        expect.objectContaining({ code: 'drive_publication_missing' }),
      ]),
    });

    const blocked = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-evidence-blocked',
      workflowInstanceId: 'wf-evidence-blocked',
      status: 'PUBLISHED',
      blockerIds: ['missing-governing-body-approval'],
    }));
    await store.update(
      blocked.instance.packetInstanceId,
      blocked.instance.revision,
      {
        driveFolderUrl: 'local-drive://folder/manually-set',
        finalArtifactUrl: 'local-drive://file/manually-set',
      },
      { actor: ACTOR, auditEventType: 'packet.edited' },
    );
    const publishedWithEvidenceBlocker = await store.getById(blocked.instance.packetInstanceId);
    expect(publishedWithEvidenceBlocker).not.toBeNull();
    if (publishedWithEvidenceBlocker === null) throw new Error('test setup failed');

    await expect(
      lockPacket(
        { store, driveConnector },
        {
          packetInstanceId: publishedWithEvidenceBlocker.packetInstanceId,
          expectedRevision: publishedWithEvidenceBlocker.revision,
          actor: ACTOR,
          authorityVerified: true,
          confidentialityVerified: true,
        },
      ),
    ).rejects.toBeInstanceOf(PacketPublicationError);
    await expect(
      lockPacket(
        { store, driveConnector },
        {
          packetInstanceId: publishedWithEvidenceBlocker.packetInstanceId,
          expectedRevision: publishedWithEvidenceBlocker.revision,
          actor: ACTOR,
          authorityVerified: true,
          confidentialityVerified: true,
        },
      ),
    ).rejects.toMatchObject({
      blockers: expect.arrayContaining([
        expect.objectContaining({ code: 'evidence_blocker_unresolved' }),
      ]),
    });
  });

  it('lock fails when supplied content hash does not match the frozen packet hash', async () => {
    const packet = await createCertifiedPacket('lock-hash-mismatch');
    const published = await publishValidPacket(packet);

    await expect(
      lockPacket(
        { store, driveConnector },
        {
          packetInstanceId: published.packet.packetInstanceId,
          expectedRevision: published.packet.revision,
          actor: ACTOR,
          contentHash: hashText('different frozen content'),
          authorityVerified: true,
          confidentialityVerified: true,
        },
      ),
    ).rejects.toMatchObject({
      blockers: expect.arrayContaining([
        expect.objectContaining({ code: 'hash_mismatch' }),
      ]),
    });

    const reloaded = await store.getById(published.packet.packetInstanceId);
    expect(reloaded?.status).toBe('PUBLISHED');
  });

  async function createCertifiedPacket(id: string): Promise<PacketStoreDocument> {
    const created = await store.createPacketInstance(baseInput({
      eventInstanceId: `evt-${id}`,
      workflowInstanceId: `wf-${id}`,
      status: 'CERTIFIED',
    }));
    return created.instance;
  }

  async function publishValidPacket(packet: PacketStoreDocument) {
    return publishPacket(
      { store, driveConnector },
      validPublishInput(packet),
    );
  }

  async function publishAndLock(id: string): Promise<PacketStoreDocument> {
    const packet = await createCertifiedPacket(id);
    const published = await publishValidPacket(packet);
    const locked = await lockPacket(
      { store, driveConnector },
      {
        packetInstanceId: published.packet.packetInstanceId,
        expectedRevision: published.packet.revision,
        actor: ACTOR,
        authorityVerified: true,
        confidentialityVerified: true,
      },
    );
    return locked.packet;
  }
});

class MissingSidecarPointerDriveAdapter extends LocalDriveAdapter {
  async publishArtifacts(request: PublishArtifactsRequest): Promise<PublishArtifactsResult> {
    const result = await super.publishArtifacts(request);
    return {
      ...result,
      pointers: result.pointers.filter((pointer) => pointer.artifactType === 'pdf'),
    };
  }
}

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function baseInput(overrides: Partial<CreatePacketInstanceInput> = {}): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-publication',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-publication',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'QAPI',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-publication',
    createdBy: ACTOR.actorId,
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    dataThroughDate: '2026-03-31',
    sourceClassification: 'production',
    approvalIds: ['approval-qapi-chair'],
    signatureIds: ['signature-qapi-chair'],
    attachmentInstances: [validatedAttachment()],
    contentHash: hashText('frozen packet content'),
    ...overrides,
  };
}

function validPublishInput(packet: PacketStoreDocument) {
  const pdfBytes = Buffer.from(`%PDF-1.7\nsigned package for ${packet.packetInstanceId}\n`, 'utf8');
  return {
    packetInstanceId: packet.packetInstanceId,
    expectedRevision: packet.revision,
    actor: ACTOR,
    idempotencyKey: `publish-${packet.packetInstanceId}-v${packet.packetVersion}`,
    signedPackageId: `signed-${packet.packetInstanceId}-v${packet.packetVersion}`,
    canonicalPdfBytes: pdfBytes,
    canonicalPdfSha256: sha256Hex(pdfBytes),
    contentHash: packet.contentHash ?? undefined,
    sourceClassification: 'production' as const,
    artifactClassification: 'internal',
    retentionRule: 'packet-retention-10-years',
    cadence: 'quarterly' as const,
    kpiDefinitionVersion: 'kpi-v1',
    metricSchemaVersion: 'metric-v1',
    authorityVerified: true,
    confidentialityVerified: true,
  };
}

function validatedAttachment(): PacketAttachmentInstance {
  return {
    attachmentInstanceId: 'att-qapi-minutes',
    attachmentTypeId: 'qapi-minutes',
    formInstanceId: null,
    evidenceId: 'ev-qapi-minutes',
    title: 'QAPI minutes evidence',
    mimeType: 'application/pdf',
    pageStart: null,
    pageEnd: null,
    confidentialityLevel: 'internal',
    driveUrl: 'local-drive://source/qapi-minutes',
    contentHash: hashText('qapi minutes evidence'),
    status: 'validated',
    createdAt: '2026-04-09T12:00:00.000Z',
    updatedAt: '2026-04-09T12:00:00.000Z',
  };
}

function priorLookupQuery(reportingPeriod: string): PriorPacketQuery {
  return {
    agency_id: 'agency-publication',
    packet_archetype_id: 'analytical-report',
    packet_template_family: 'QAPI',
    cadence: 'quarterly',
    canonical_workflow_family: 'QA-WF-03',
    prior_reporting_period: reportingPeriod,
    packet_status: 'certified-and-published',
    not_superseded: true,
  };
}

function artifactFiles(root: string): string[] {
  const files: string[] = [];
  walk(root, files);
  return files
    .map((file) => path.relative(root, file).replace(/\\/g, '/'))
    .filter((file) => file !== '.packet-drive-local.lock.json' && file !== 'folder-manifest.json')
    .sort();
}

function walk(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
}

function hashText(text: string): string {
  return sha256Hex(Buffer.from(text, 'utf8'));
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}
