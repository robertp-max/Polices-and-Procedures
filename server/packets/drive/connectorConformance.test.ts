import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COMPLIANCE_PACKETS_DRIVE_TEMPLATE } from '@/policy/packets/registries/driveDestinations';
import {
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  type DriveDestinationRequest,
  type PacketDriveConnector,
  type PriorPacketQuery,
  type PublishArtifactsRequest,
  type PublishArtifactsResult,
} from '@/policy/packets/contracts';
import { LocalDriveAdapter } from './localDriveAdapter.js';

type ConnectorFactory = (cacheRoot: string) => PacketDriveConnector;

interface PublishFixtureOptions {
  packetInstanceId: string;
  packetVersion: number;
  agencyId?: string;
  workflowFamily?: string;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  cadence?: PriorPacketQuery['cadence'];
  packetStatus?: 'locked' | 'certified-and-published' | 'draft' | 'rejected' | 'voided' | 'superseded';
  supersededByPacketInstanceId?: string | null;
}

interface PublishedFixture {
  request: PublishArtifactsRequest;
  result: PublishArtifactsResult;
}

const WORKFLOW_FAMILY = 'QA-WF-03';
const REPORTING_PERIOD = '2026-Q1';
const GENERATED_AT = '2026-04-01T00:00:00.000Z';

export function definePacketDriveConnectorConformanceSuite(
  suiteName: string,
  createConnector: ConnectorFactory,
): void {
  describe(suiteName, () => {
    let cacheRoot: string;
    let connector: PacketDriveConnector;

    beforeEach(() => {
      cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'packet-drive-conformance-'));
      connector = createConnector(cacheRoot);
    });

    afterEach(() => {
      fs.rmSync(cacheRoot, { recursive: true, force: true });
    });

    it('publish -> republish is idempotent and returns the same artifact identities', async () => {
      const first = await publishFixture(connector, {
        packetInstanceId: 'idem-prior-v1',
        packetVersion: 1,
      });
      const replay = await connector.publishArtifacts(first.request);

      expect(first.result.idempotentReplay).toBe(false);
      expect(replay.idempotentReplay).toBe(true);
      expect(replay.pointers).toHaveLength(6);
      expect(replay.pointers.map((pointer) => pointer.driveFileId)).toEqual(
        first.result.pointers.map((pointer) => pointer.driveFileId),
      );
      expect(new Set(replay.pointers.map((pointer) => pointer.driveFileId)).size).toBe(6);
    });

    it('rejects a prior packet from the wrong agency', async () => {
      await publishFixture(connector, {
        packetInstanceId: 'wrong-agency-prior',
        packetVersion: 1,
        agencyId: 'agency-b',
      });

      const result = await connector.findPriorPacket(basePriorQuery({ agency_id: 'agency-a' }));

      expect(result.found).toBe(false);
      expect(result.packetInstanceId).toBeNull();
      expect(result.notFoundBanner).toBe(PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER);
      expect(result.exclusions).toContainEqual(
        expect.objectContaining({
          reason: 'another_agency',
          excludedPacketInstanceId: 'wrong-agency-prior',
        }),
      );
    });

    it('excludes superseded packets and selects the valid successor', async () => {
      const query = basePriorQuery({ agency_id: 'agency-b' });
      await publishFixture(connector, {
        packetInstanceId: 'superseded-prior-v1',
        packetVersion: 1,
        agencyId: query.agency_id,
        supersededByPacketInstanceId: 'superseded-prior-v2',
      });
      await publishFixture(connector, {
        packetInstanceId: 'superseded-prior-v2',
        packetVersion: 2,
        agencyId: query.agency_id,
      });

      const result = await connector.findPriorPacket(query);

      expect(result.found).toBe(true);
      expect(result.packetInstanceId).toBe('superseded-prior-v2');
      expect(result.packetVersion).toBe(2);
      expect(result.exclusions).toContainEqual(
        expect.objectContaining({
          reason: 'superseded_by_newer_valid',
          excludedPacketInstanceId: 'superseded-prior-v1',
        }),
      );
    });

    it('selects the highest valid locked version for the prior period', async () => {
      await publishFixture(connector, {
        packetInstanceId: 'highest-prior-v1',
        packetVersion: 1,
      });
      await publishFixture(connector, {
        packetInstanceId: 'highest-prior-v3',
        packetVersion: 3,
      });

      const result = await connector.findPriorPacket(basePriorQuery());

      expect(result.found).toBe(true);
      expect(result.packetInstanceId).toBe('highest-prior-v3');
      expect(result.packetVersion).toBe(3);
      expect(result.contentHash).toBe(hashText('highest-prior-v3:3:content'));
    });

    it('reports an honest not-found result when no prior packet exists', async () => {
      const result = await connector.findPriorPacket(basePriorQuery());

      expect(result).toEqual({
        found: false,
        packetInstanceId: null,
        driveFolderUrl: null,
        drivePdfUrl: null,
        contentHash: null,
        packetVersion: null,
        exclusions: [],
        notFoundBanner: PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
      });
    });
  });
}

definePacketDriveConnectorConformanceSuite('LocalDriveAdapter connector conformance', (cacheRoot) =>
  new LocalDriveAdapter(cacheRoot),
);

async function publishFixture(
  connector: PacketDriveConnector,
  options: PublishFixtureOptions,
): Promise<PublishedFixture> {
  const request = await buildPublishRequest(connector, options);
  return {
    request,
    result: await connector.publishArtifacts(request),
  };
}

async function buildPublishRequest(
  connector: PacketDriveConnector,
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
  const destination = await connector.resolveDestination({
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
    packet_status: options.packetStatus ?? 'locked',
    canonical_workflow_family: workflowFamily,
    reporting_period: REPORTING_PERIOD,
    supersededByPacketInstanceId: options.supersededByPacketInstanceId ?? null,
    publishedBy: 'conformance-test',
  };

  return {
    packetInstanceId,
    packetVersion,
    contentHash,
    idempotencyKey: `idem-${packetInstanceId}-v${packetVersion}`,
    destination,
    artifacts: [
      binaryArtifact('pdf', `${packetInstanceId}.pdf`, 'application/pdf', `PDF ${packetInstanceId}`),
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
            eventType: `packet.${options.packetStatus ?? 'locked'}`,
            timestamp: GENERATED_AT,
            actorId: 'conformance-test',
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

function basePriorQuery(overrides: Partial<PriorPacketQuery> = {}): PriorPacketQuery {
  return {
    agency_id: 'agency-a',
    packet_archetype_id: 'analytical-report',
    packet_template_family: 'QAPI',
    cadence: 'quarterly',
    canonical_workflow_family: WORKFLOW_FAMILY,
    prior_reporting_period: REPORTING_PERIOD,
    packet_status: 'locked',
    not_superseded: true,
    ...overrides,
  };
}

function binaryArtifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  mimeType: string,
  text: string,
): PublishArtifactsRequest['artifacts'][number] {
  const bytes = Buffer.from(text, 'utf8');
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

function jsonArtifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  payload: Record<string, unknown>,
): PublishArtifactsRequest['artifacts'][number] {
  const bytes = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
  return {
    artifactType,
    fileName,
    mimeType: 'application/json',
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
