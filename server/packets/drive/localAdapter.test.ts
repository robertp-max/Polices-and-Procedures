import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COMPLIANCE_PACKETS_DRIVE_TEMPLATE } from '@/policy/packets/registries/driveDestinations';
import type {
  DriveDestinationRequest,
  PacketSidecarPayload,
  PriorPacketQuery,
  PublishArtifactsRequest,
} from '@/policy/packets/contracts';
import { LocalDriveAdapter } from './localDriveAdapter.js';

const WORKFLOW_FAMILY = 'QA-WF-03';
const REPORTING_PERIOD = '2026-Q1';
const GENERATED_AT = '2026-04-01T00:00:00.000Z';

describe('LocalDriveAdapter', () => {
  let cacheRoot: string;
  let adapter: LocalDriveAdapter;

  beforeEach(() => {
    cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'packet-drive-local-'));
    adapter = new LocalDriveAdapter(cacheRoot);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it('materializes the §19.4 hierarchy under the temp cache root', async () => {
    const request = await buildPublishRequest(adapter, {
      packetInstanceId: 'hierarchy-packet',
      packetVersion: 2,
    });
    const result = await adapter.publishArtifacts(request);

    expect(request.destination.pathSegments).toEqual([
      'Care-Indeed-Home-Health',
      'Compliance-Packets',
      '2026',
      'QAPI',
      WORKFLOW_FAMILY,
      REPORTING_PERIOD,
      'evt-hierarchy-packet',
      'hierarchy-packet',
      'v2',
    ]);
    expect(result.pointers).toHaveLength(6);
    for (const fileName of [
      'hierarchy-packet.pdf',
      'hierarchy-packet.analysis.json',
      'hierarchy-packet.kpis.json',
      'hierarchy-packet.workflows.json',
      'hierarchy-packet.manifest.json',
      'hierarchy-packet.audit.json',
    ]) {
      expect(fs.existsSync(path.join(cacheRoot, ...request.destination.pathSegments, fileName))).toBe(
        true,
      );
    }
  });

  it('round-trips sidecars through readSidecar by Drive file id', async () => {
    const request = await buildPublishRequest(adapter, {
      packetInstanceId: 'sidecar-packet',
      packetVersion: 1,
    });
    const result = await adapter.publishArtifacts(request);
    const kpisPointer = result.pointers.find((pointer) => pointer.artifactType === 'kpis');
    expect(kpisPointer).toBeDefined();

    const sidecar = await adapter.readSidecar({
      packetInstanceId: 'sidecar-packet',
      sidecarKind: 'kpis',
      driveFileId: kpisPointer!.driveFileId,
    });

    expect(sidecar).not.toBeNull();
    expect((sidecar as PacketSidecarPayload).kind).toBe('kpis');
    if (sidecar?.kind === 'kpis') {
      expect(sidecar.packetInstanceId).toBe('sidecar-packet');
      expect(sidecar.cadence).toBe('quarterly');
      expect(sidecar.reportingPeriodStart).toBe('2026-01-01');
      expect(sidecar.reportingPeriodEnd).toBe('2026-03-31');
    }
  });

  it('rejects declared SHA-256 mismatches before writing artifacts', async () => {
    const request = await buildPublishRequest(adapter, {
      packetInstanceId: 'hash-packet',
      packetVersion: 1,
    });
    const tampered: PublishArtifactsRequest = {
      ...request,
      artifacts: request.artifacts.map((artifact) =>
        artifact.artifactType === 'pdf'
          ? { ...artifact, sha256: '0'.repeat(64) }
          : artifact,
      ),
    };

    await expect(adapter.publishArtifacts(tampered)).rejects.toThrow(/Hash mismatch/);
    expect(
      fs.existsSync(path.join(cacheRoot, ...request.destination.pathSegments, 'hash-packet.pdf')),
    ).toBe(false);
  });
});

interface PublishFixtureOptions {
  packetInstanceId: string;
  packetVersion: number;
  agencyId?: string;
  workflowFamily?: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  cadence?: PriorPacketQuery['cadence'];
}

async function buildPublishRequest(
  adapter: LocalDriveAdapter,
  options: PublishFixtureOptions,
): Promise<PublishArtifactsRequest> {
  const packetInstanceId = options.packetInstanceId;
  const packetVersion = options.packetVersion;
  const agencyId = options.agencyId ?? 'agency-a';
  const workflowFamily = options.workflowFamily ?? WORKFLOW_FAMILY;
  const cadence = options.cadence ?? 'quarterly';
  const reportingPeriodStart = options.reportingPeriodStart ?? '2026-01-01';
  const reportingPeriodEnd = options.reportingPeriodEnd ?? '2026-03-31';
  const contentHash = hashText(`${packetInstanceId}:${packetVersion}:content`);
  const destination = await adapter.resolveDestination({
    agencyId,
    archetypeId: 'analytical-report',
    packetTemplateId: 'QAPI',
    eventInstanceId: `evt-${packetInstanceId}`,
    workflowInstanceId: workflowFamily,
    reportingPeriodStart,
    reportingPeriodEnd,
    destinationTemplate: COMPLIANCE_PACKETS_DRIVE_TEMPLATE,
    domain: 'QAPI',
    eventFamilyId: workflowFamily,
    packetInstanceId,
    packetVersion,
  } as unknown as DriveDestinationRequest);
  const context = {
    packetInstanceId,
    packetVersion,
    packetHash: contentHash,
    agencyId,
    generatedAt: GENERATED_AT,
    sourceClassification: 'production',
    packet_status: 'locked',
    canonical_workflow_family: workflowFamily,
    reporting_period: REPORTING_PERIOD,
    supersededByPacketInstanceId: null,
    publishedBy: 'local-adapter-test',
  };

  return {
    packetInstanceId,
    packetVersion,
    contentHash,
    idempotencyKey: `idem-${packetInstanceId}-v${packetVersion}`,
    destination,
    artifacts: [
      artifact('pdf', `${packetInstanceId}.pdf`, 'application/pdf', Buffer.from(`PDF ${packetInstanceId}`)),
      jsonArtifact('analysis', `${packetInstanceId}.analysis.json`, {
        ...context,
        kind: 'analysis',
        executiveAnalysis: null,
        findings: [],
        riskSummary: null,
        comparabilityNotes: null,
      }),
      jsonArtifact('kpis', `${packetInstanceId}.kpis.json`, {
        ...context,
        kind: 'kpis',
        kpiDefinitionVersion: 'kpi-v1',
        metricSchemaVersion: 'metric-v1',
        cadence,
        reportingPeriodStart,
        reportingPeriodEnd,
        metrics: [],
      }),
      jsonArtifact('workflows', `${packetInstanceId}.workflows.json`, {
        ...context,
        kind: 'workflows',
        workflows: [
          {
            workflowId: workflowFamily,
            workflowInstanceId: `wfi-${packetInstanceId}`,
            title: null,
            decisionState: 'ACTIVATED',
            status: null,
            carryForward: null,
            dueDate: null,
            ownerRole: null,
          },
        ],
        pips: [],
        actionItems: [],
      }),
      jsonArtifact('manifest', `${packetInstanceId}.manifest.json`, {
        ...context,
        kind: 'manifest',
        driveFolderId: null,
        driveFolderUrl: null,
        artifacts: [],
      }),
      jsonArtifact('audit', `${packetInstanceId}.audit.json`, {
        ...context,
        kind: 'audit',
        chronologyId: `chron-${packetInstanceId}`,
        events: [
          {
            eventType: 'packet.locked',
            timestamp: GENERATED_AT,
            actorId: 'local-adapter-test',
            actorRole: 'QA',
            summary: 'Published fixture packet.',
            resourceRef: packetInstanceId,
            previousHash: null,
            currentHash: contentHash,
          },
        ],
      }),
    ],
  };
}

function jsonArtifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  payload: Record<string, unknown>,
): PublishArtifactsRequest['artifacts'][number] {
  return artifact(
    artifactType,
    fileName,
    'application/json',
    Buffer.from(JSON.stringify(payload, null, 2), 'utf8'),
  );
}

function artifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  mimeType: string,
  bytes: Buffer,
): PublishArtifactsRequest['artifacts'][number] {
  return {
    artifactType,
    fileName,
    mimeType,
    bytesBase64: bytes.toString('base64'),
    sha256: sha256Hex(bytes),
    classification: 'internal',
    retentionRule: 'packet-retention-10-years',
  };
}

function hashText(text: string): string {
  return sha256Hex(Buffer.from(text, 'utf8'));
}

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}
