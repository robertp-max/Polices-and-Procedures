import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { COMPLIANCE_PACKETS_DRIVE_TEMPLATE } from '@/policy/packets/registries/driveDestinations';
import {
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  type DriveDestinationRequest,
  type PacketSidecarPayload,
  type PriorPacketQuery,
  type PublishArtifactsRequest,
  type QapiMetricSnapshot,
  type QapiTrendSnapshot,
} from '@/policy/packets/contracts';
import { ApiError } from '../errors.js';
import { LocalDriveAdapter } from './drive/localDriveAdapter.js';
import { createQapiPriorRouter } from './routes/qapiPrior.js';

interface HttpJsonResponse {
  status: number;
  body: unknown;
}

interface PublishFixtureOptions {
  packetInstanceId: string;
  packetVersion: number;
  agencyId?: string;
  workflowFamily?: string;
  cadence?: PriorPacketQuery['cadence'];
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  reportingPeriod: string;
  packetStatus?: 'locked' | 'certified-and-published' | 'draft' | 'rejected' | 'voided' | 'superseded';
  supersededByPacketInstanceId?: string | null;
  sourceClassification?: 'production' | 'synthetic';
  kpiDefinitionVersion?: string;
  metricSchemaVersion?: string;
  metricDefinitionVersion?: string;
  metricRate?: number;
  pdfText?: string;
}

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

const WORKFLOW_FAMILY = 'QA-WF-03';
const GENERATED_AT = '2026-07-01T00:00:00.000Z';

describe('/api/qapi prior-period routes', () => {
  let cacheRoot: string;
  let adapter: LocalDriveAdapter;
  let app: Express;

  beforeEach(() => {
    cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'qapi-prior-route-'));
    adapter = new LocalDriveAdapter(cacheRoot);
    app = buildApp(adapter);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
  });

  it('23.4.1 monthly resolves the prior monthly packet', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'synthetic-monthly-prior',
      packetVersion: 1,
      cadence: 'monthly',
      reportingPeriodStart: '2026-05-01',
      reportingPeriodEnd: '2026-05-31',
      reportingPeriod: '2026-05',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'monthly',
      periodStart: '2026-06-01',
    }));

    expect(response.status).toBe(200);
    const body = jsonObject(response.body);
    expect(jsonObject(body.query).prior_reporting_period).toBe('2026-05');
    const priorPeriod = jsonObject(body.priorPeriod);
    expect(priorPeriod.found).toBe(true);
    expect(priorPeriod.packetInstanceId).toBe('synthetic-monthly-prior');
  });

  it('23.4.2 quarterly resolves the prior quarterly packet and computes COMPARABLE trends', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'synthetic-quarterly-prior',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      metricRate: 10,
    });

    const lookup = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'quarterly',
      periodStart: '2026-04-01',
    }));
    expect(lookup.status).toBe(200);
    expect(jsonObject(jsonObject(lookup.body).priorPeriod).packetInstanceId).toBe(
      'synthetic-quarterly-prior',
    );

    const comparison = await requestJson(app, 'POST', '/api/qapi/compare', {
      currentTrendSnapshot: trendSnapshot({
        packetInstanceId: 'current-q2',
        cadence: 'quarterly',
        reportingPeriodStart: '2026-04-01',
        reportingPeriodEnd: '2026-06-30',
        metricRate: 12,
      }),
      priorPeriod: {
        agencyId: 'agency-qapi',
        cadence: 'quarterly',
        periodStart: '2026-04-01',
        workflowFamily: WORKFLOW_FAMILY,
      },
    });

    expect(comparison.status).toBe(200);
    const output = jsonObject(jsonObject(comparison.body).comparison);
    expect(output.overallComparability).toBe('COMPARABLE');
    const metrics = output.metrics as QapiMetricSnapshot[];
    expect(metrics[0]?.priorValue).toBe(10);
    expect(metrics[0]?.absoluteChange).toBe(2);
    expect(metrics[0]?.direction).toBe('improving');
  });

  it('23.4.3 annual resolves the prior annual packet', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'synthetic-annual-prior',
      packetVersion: 1,
      cadence: 'annual',
      reportingPeriodStart: '2025-01-01',
      reportingPeriodEnd: '2025-12-31',
      reportingPeriod: '2025',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'annual',
      periodStart: '2026-01-01',
    }));

    expect(response.status).toBe(200);
    expect(jsonObject(jsonObject(response.body).query).prior_reporting_period).toBe('2025');
    expect(jsonObject(jsonObject(response.body).priorPeriod).packetInstanceId).toBe(
      'synthetic-annual-prior',
    );
  });

  it('23.4.4 another agency packet is rejected', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'wrong-agency-prior',
      packetVersion: 1,
      agencyId: 'agency-other',
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'quarterly',
      periodStart: '2026-04-01',
    }));

    expect(response.status).toBe(200);
    const priorPeriod = jsonObject(jsonObject(response.body).priorPeriod);
    expect(priorPeriod.found).toBe(false);
    expect(priorPeriod.notFoundBanner).toBe(PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER);
    expect(exclusionReasons(priorPeriod)).toContain('another_agency');
  });

  it('23.4.5 draft, voided, and superseded packets are excluded', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'draft-prior',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      packetStatus: 'draft',
    });
    await publishFixture(adapter, {
      packetInstanceId: 'voided-prior',
      packetVersion: 2,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      packetStatus: 'voided',
    });
    await publishFixture(adapter, {
      packetInstanceId: 'superseded-prior',
      packetVersion: 3,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      packetStatus: 'locked',
      supersededByPacketInstanceId: 'newer-valid-not-in-fixture',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'quarterly',
      periodStart: '2026-04-01',
    }));

    expect(response.status).toBe(200);
    const priorPeriod = jsonObject(jsonObject(response.body).priorPeriod);
    expect(priorPeriod.found).toBe(false);
    const reasons = exclusionReasons(priorPeriod);
    expect(reasons).toContain('draft_rejected_or_voided');
    expect(reasons).toContain('superseded_by_newer_valid');
  });

  it('23.4.6 highest valid locked version is selected', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'highest-prior-v1',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
    });
    await publishFixture(adapter, {
      packetInstanceId: 'highest-prior-v3',
      packetVersion: 3,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'quarterly',
      periodStart: '2026-04-01',
    }));

    expect(response.status).toBe(200);
    const priorPeriod = jsonObject(jsonObject(response.body).priorPeriod);
    expect(priorPeriod.packetInstanceId).toBe('highest-prior-v3');
    expect(priorPeriod.packetVersion).toBe(3);
  });

  it('23.4.7 structured sidecars are preferred over PDF extraction', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'sidecar-preferred-prior',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      metricRate: 7,
      pdfText: 'PDF human artifact says metric rate 999 and must not be parsed for trends.',
    });

    const response = await requestJson(
      app,
      'GET',
      '/api/qapi/trend-snapshot/sidecar-preferred-prior',
    );

    expect(response.status).toBe(200);
    const snapshot = jsonObject(jsonObject(response.body).trendSnapshot);
    const metrics = snapshot.metrics as QapiMetricSnapshot[];
    expect(metrics[0]?.rate).toBe(7);
    expect(metrics[0]?.rate).not.toBe(999);
  });

  it('23.4.8 missing history displays prior-data unavailable without zero fill', async () => {
    const response = await requestJson(app, 'POST', '/api/qapi/compare', {
      currentTrendSnapshot: trendSnapshot({
        packetInstanceId: 'current-without-history',
        cadence: 'quarterly',
        reportingPeriodStart: '2026-04-01',
        reportingPeriodEnd: '2026-06-30',
        metricRate: 12,
      }),
      priorPeriod: {
        agencyId: 'agency-qapi',
        cadence: 'quarterly',
        periodStart: '2026-04-01',
        workflowFamily: WORKFLOW_FAMILY,
      },
    });

    expect(response.status).toBe(200);
    const comparison = jsonObject(jsonObject(response.body).comparison);
    expect(comparison.missingPriorBanner).toBe(PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER);
    expect(comparison.overallComparability).toBe('PRIOR DATA UNAVAILABLE');
    const metrics = comparison.metrics as QapiMetricSnapshot[];
    expect(metrics[0]?.priorValue).toBeNull();
    expect(metrics[0]?.priorValue).not.toBe(0);
    expect(metrics[0]?.absoluteChange).toBeNull();
  });

  it('23.4.9 definition changes block false trend claims', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'definition-changed-prior',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
      reportingPeriod: '2026-Q1',
      kpiDefinitionVersion: 'kpi-v0',
      metricDefinitionVersion: 'metric-definition-v0',
      metricRate: 10,
    });

    const response = await requestJson(app, 'POST', '/api/qapi/compare', {
      currentTrendSnapshot: trendSnapshot({
        packetInstanceId: 'definition-changed-current',
        cadence: 'quarterly',
        reportingPeriodStart: '2026-04-01',
        reportingPeriodEnd: '2026-06-30',
        metricRate: 12,
      }),
      priorPacketInstanceId: 'definition-changed-prior',
    });

    expect(response.status).toBe(200);
    const comparison = jsonObject(jsonObject(response.body).comparison);
    expect(comparison.overallComparability).toBe('NOT COMPARABLE — DEFINITION CHANGED');
    const metrics = comparison.metrics as QapiMetricSnapshot[];
    expect(metrics[0]?.direction).toBe('not-comparable');
    expect(metrics[0]?.priorValue).toBeNull();
  });

  it('23.4.10 new publication becomes the next period valid prior packet', async () => {
    await publishFixture(adapter, {
      packetInstanceId: 'new-q2-publication',
      packetVersion: 1,
      cadence: 'quarterly',
      reportingPeriodStart: '2026-04-01',
      reportingPeriodEnd: '2026-06-30',
      reportingPeriod: '2026-Q2',
    });

    const response = await requestJson(app, 'GET', priorPeriodUrl({
      cadence: 'quarterly',
      periodStart: '2026-07-01',
    }));

    expect(response.status).toBe(200);
    const body = jsonObject(response.body);
    expect(jsonObject(body.query).prior_reporting_period).toBe('2026-Q2');
    expect(jsonObject(body.priorPeriod).packetInstanceId).toBe('new-q2-publication');
  });
});

function buildApp(driveConnector: LocalDriveAdapter): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/qapi', createQapiPriorRouter({ driveConnector }));
  app.use(ERROR_HANDLER);
  return app;
}

function priorPeriodUrl(input: {
  cadence: PriorPacketQuery['cadence'];
  periodStart: string;
  agencyId?: string;
  workflowFamily?: string;
}): string {
  const params = new URLSearchParams({
    agencyId: input.agencyId ?? 'agency-qapi',
    cadence: input.cadence,
    periodStart: input.periodStart,
    workflowFamily: input.workflowFamily ?? WORKFLOW_FAMILY,
  });
  return `/api/qapi/prior-period?${params.toString()}`;
}

async function requestJson(
  app: Express,
  method: 'GET' | 'POST',
  urlPath: string,
  body?: unknown,
): Promise<HttpJsonResponse> {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${urlPath}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
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

function jsonObject(value: unknown): Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);
  return value as Record<string, unknown>;
}

function exclusionReasons(priorPeriod: Record<string, unknown>): string[] {
  expect(Array.isArray(priorPeriod.exclusions)).toBe(true);
  return (priorPeriod.exclusions as Array<{ reason: string }>).map((exclusion) => exclusion.reason);
}

async function publishFixture(
  adapter: LocalDriveAdapter,
  options: PublishFixtureOptions,
): Promise<void> {
  await adapter.publishArtifacts(await buildPublishRequest(adapter, options));
}

async function buildPublishRequest(
  adapter: LocalDriveAdapter,
  options: PublishFixtureOptions,
): Promise<PublishArtifactsRequest> {
  const packetInstanceId = options.packetInstanceId;
  const packetVersion = options.packetVersion;
  const agencyId = options.agencyId ?? 'agency-qapi';
  const workflowFamily = options.workflowFamily ?? WORKFLOW_FAMILY;
  const cadence = options.cadence ?? 'quarterly';
  const contentHash = hashText(`${packetInstanceId}:${packetVersion}:content`);
  const destination = await adapter.resolveDestination({
    agencyId,
    archetypeId: 'analytical-report',
    packetTemplateId: 'QAPI',
    eventInstanceId: `evt-${packetInstanceId}`,
    workflowInstanceId: workflowFamily,
    reportingPeriodStart: options.reportingPeriodStart,
    reportingPeriodEnd: options.reportingPeriodEnd,
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
    sourceClassification: options.sourceClassification ?? 'production',
    packet_status: options.packetStatus ?? 'locked',
    canonical_workflow_family: workflowFamily,
    reporting_period: options.reportingPeriod,
    supersededByPacketInstanceId: options.supersededByPacketInstanceId ?? null,
    publishedBy: 'qapi-prior-test',
  };

  return {
    packetInstanceId,
    packetVersion,
    contentHash,
    idempotencyKey: `idem-${packetInstanceId}-v${packetVersion}`,
    destination,
    artifacts: [
      binaryArtifact(
        'pdf',
        `${packetInstanceId}.pdf`,
        'application/pdf',
        options.pdfText ?? `PDF ${packetInstanceId}`,
      ),
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
        kpiDefinitionVersion: options.kpiDefinitionVersion ?? 'kpi-v1',
        metricSchemaVersion: options.metricSchemaVersion ?? 'metric-v1',
        cadence,
        reportingPeriodStart: options.reportingPeriodStart,
        reportingPeriodEnd: options.reportingPeriodEnd,
        metrics: [
          metricSnapshot({
            metricRate: options.metricRate ?? 10,
            metricDefinitionVersion: options.metricDefinitionVersion ?? 'metric-definition-v1',
          }),
        ],
      }),
      jsonArtifact('workflows', `${packetInstanceId}.workflows.json`, {
        ...context,
        kind: 'workflows',
        workflows: [
          {
            workflowId: workflowFamily,
            workflowInstanceId: `wfi-${packetInstanceId}`,
            title: 'QAPI review',
            decisionState: 'ACTIVATED',
            status: null,
            carryForward: null,
            dueDate: null,
            ownerRole: 'QAPI Coordinator',
          },
        ],
        pips: [],
        actionItems: [],
      }),
      jsonArtifact('manifest', `${packetInstanceId}.manifest.json`, {
        ...context,
        kind: 'manifest',
        driveFolderId: destination.driveFolderId,
        driveFolderUrl: destination.driveFolderUrl,
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
            actorId: 'qapi-prior-test',
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

function trendSnapshot(input: {
  packetInstanceId: string;
  cadence: PriorPacketQuery['cadence'];
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  metricRate: number;
}): QapiTrendSnapshot {
  return {
    packetInstanceId: input.packetInstanceId,
    packetVersion: 1,
    packetHash: hashText(`${input.packetInstanceId}:current`),
    agencyId: 'agency-qapi',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: `evt-${input.packetInstanceId}`,
    workflowId: WORKFLOW_FAMILY,
    workflowInstanceId: `wfi-${input.packetInstanceId}`,
    cadence: input.cadence,
    reportingPeriodStart: input.reportingPeriodStart,
    reportingPeriodEnd: input.reportingPeriodEnd,
    dataThroughDate: input.reportingPeriodEnd,
    packetStatus: 'certified',
    sourceClassification: 'production',
    kpiDefinitionVersion: 'kpi-v1',
    metricSchemaVersion: 'metric-v1',
    metrics: [metricSnapshot({ metricRate: input.metricRate })],
    findings: [],
    workflows: [],
    pips: [],
    actionItems: [],
    publishedArtifactUrl: '',
    publishedFolderUrl: '',
    generatedAt: GENERATED_AT,
  };
}

function metricSnapshot(input: {
  metricRate: number;
  metricDefinitionVersion?: string;
}): QapiMetricSnapshot {
  return {
    metricId: 'hospitalization-rate',
    metricKey: 'hospitalization-rate-definition',
    label: 'Hospitalization rate',
    definitionVersion: input.metricDefinitionVersion ?? 'metric-definition-v1',
    unit: 'percentage',
    numerator: input.metricRate,
    denominator: 100,
    rate: input.metricRate,
    absoluteValue: null,
    target: 8,
    priorValue: null,
    absoluteChange: null,
    percentagePointChange: null,
    direction: 'unknown',
    comparability: 'PRIOR DATA UNAVAILABLE',
    comparabilityLimitation: null,
    targetStatus: null,
    sustainedPerformance: null,
    repeatedDeficiency: null,
    emergingDecline: null,
    improvement: null,
  };
}

function jsonArtifact(
  artifactType: PublishArtifactsRequest['artifacts'][number]['artifactType'],
  fileName: string,
  payload: PacketSidecarPayload & Record<string, unknown>,
): PublishArtifactsRequest['artifacts'][number] {
  return binaryArtifact(
    artifactType,
    fileName,
    'application/json',
    JSON.stringify(payload, null, 2),
  );
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

function hashText(text: string): string {
  return sha256Hex(Buffer.from(text, 'utf8'));
}

function sha256Hex(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}
