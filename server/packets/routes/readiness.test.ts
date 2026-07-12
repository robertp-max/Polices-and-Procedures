import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  type PriorPacketLookupResult,
} from '@/policy/packets/contracts';
import { ApiError } from '../../errors.js';
import { identityMiddleware } from '../../identity/middleware.js';
import {
  FileLocalPacketStore,
  type CreatePacketInstanceInput,
} from '../store.js';
import { createPacketReadinessRouter } from './readiness.js';

interface HttpJsonResponse {
  status: number;
  body: unknown;
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

const EMPTY_PRIOR_LOOKUP: PriorPacketLookupResult = {
  found: false,
  packetInstanceId: null,
  driveFolderUrl: null,
  drivePdfUrl: null,
  contentHash: null,
  packetVersion: null,
  exclusions: [],
  notFoundBanner: PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
};

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function baseInput(overrides: Partial<CreatePacketInstanceInput> = {}): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-readiness',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-readiness-1',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-readiness-1',
    createdBy: 'readiness-user',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    ...overrides,
  };
}

function buildApp(store: FileLocalPacketStore): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', identityMiddleware);
  app.use('/api', createPacketReadinessRouter({
    store,
    driveConnector: {
      async findPriorPacket(): Promise<PriorPacketLookupResult> {
        return EMPTY_PRIOR_LOOKUP;
      },
    },
    calendarEvents: [],
    regulatoryEvents: [],
  }));
  app.use(ERROR_HANDLER);
  return app;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'content-type': 'application/json',
    'x-user-id': 'readiness-user',
    'x-user-roles': 'compliance_officer',
    'x-user-access-classes': 'agency:agency-readiness,packets:*',
    ...extra,
  };
}

function jsonObject(value: unknown): Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);
  return value as Record<string, unknown>;
}

function readinessFrom(body: unknown): Record<string, unknown> {
  const readiness = jsonObject(body).readiness;
  return jsonObject(readiness);
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

async function requestJson(app: Express, urlPath: string): Promise<HttpJsonResponse> {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${urlPath}`, {
      method: 'GET',
      headers: authHeaders(),
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

function readinessUrl(eventInstanceId = 'evt-readiness-1'): string {
  const params = new URLSearchParams({
    agencyId: 'agency-readiness',
    eventFamilyId: 'qapi_meeting',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-readiness-1',
    packetTemplateId: 'qapi-quarterly',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    cadence: 'Quarterly',
  });
  return `/api/events/${encodeURIComponent(eventInstanceId)}/packet-readiness?${params.toString()}`;
}

describe('/api/events/:eventInstanceId/packet-readiness', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let store: FileLocalPacketStore;
  let app: Express;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-readiness-');
    auditRoot = makeTempDir('packet-readiness-audit-');
    store = new FileLocalPacketStore(cacheRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    app = buildApp(store);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('maps an existing draft packet to open-existing and idempotent duplicate handling', async () => {
    const created = await store.createPacketInstance(baseInput({
      status: 'DRAFT_GENERATED',
      blockerIds: ['missing-qapi-minutes'],
    }));

    const response = await requestJson(app, readinessUrl());
    expect(response.status).toBe(200);
    const readiness = readinessFrom(response.body);
    const existingPacket = jsonObject(readiness.existingPacket);

    expect(existingPacket.exists).toBe(true);
    expect(existingPacket.packetInstanceId).toBe(created.instance.packetInstanceId);
    expect(existingPacket.status).toBe('DRAFT_GENERATED');
    expect(existingPacket.statusLabel).toBe('Draft generated');
    expect(existingPacket.recommendedAction).toBe('open-existing');
    expect(existingPacket.duplicateHandling).toBe('duplicate rejected/idempotent');

    const blockers = jsonObject(readiness.openDependenciesBlockers);
    expect(blockers.blockerCount).toBe(1);
    expect(blockers.blockerIds).toEqual(['missing-qapi-minutes']);
  });

  it('maps a locked packet to view/amend', async () => {
    const created = await store.createPacketInstance(baseInput({
      status: 'LOCKED',
    }));

    const response = await requestJson(app, readinessUrl());
    expect(response.status).toBe(200);
    const readiness = readinessFrom(response.body);
    const existingPacket = jsonObject(readiness.existingPacket);

    expect(existingPacket.exists).toBe(true);
    expect(existingPacket.packetInstanceId).toBe(created.instance.packetInstanceId);
    expect(existingPacket.status).toBe('LOCKED');
    expect(existingPacket.statusLabel).toBe('Locked');
    expect(existingPacket.recommendedAction).toBe('view/amend');
    expect(existingPacket.duplicateHandling).toBe('duplicate rejected/idempotent');
  });

  it('keeps the no-duplicate path explicit when no packet exists for the identity key', async () => {
    const response = await requestJson(app, readinessUrl('evt-readiness-empty'));
    expect(response.status).toBe(200);
    const readiness = readinessFrom(response.body);
    const existingPacket = jsonObject(readiness.existingPacket);

    expect(existingPacket.exists).toBe(false);
    expect(existingPacket.packetInstanceId).toBeNull();
    expect(existingPacket.status).toBe('unknown');
    expect(existingPacket.statusLabel).toBe('unknown');
    expect(existingPacket.recommendedAction).toBe('create-new');
    expect(existingPacket.duplicateHandling).toBe('no duplicate');

    const blockers = jsonObject(readiness.openDependenciesBlockers);
    expect(blockers.blockerCount).toBe('unknown');
    expect(blockers.blockerIds).toBe('unknown');
  });
});
