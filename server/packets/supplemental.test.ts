import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  SUPPLEMENTAL_CLASSIFICATION_OPTIONS,
  SUPPLEMENTAL_DESTINATION_OPTIONS,
} from '@/policy/packets/contracts';
import { ApiError } from '../errors.js';
import { identityMiddleware } from '../identity/middleware.js';
import {
  FileLocalPacketStore,
  type CreatePacketInstanceInput,
} from './store.js';
import {
  FileLocalSupplementalInformationStore,
  IllegalSupplementalTransitionError,
} from './supplementalStore.js';
import { createPacketSupplementalRouter } from './routes/supplemental.js';

interface HttpJsonResponse {
  status: number;
  body: unknown;
}

const ERROR_HANDLER: ErrorRequestHandler = (err, _req, res, next) => {
  void next;
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

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function baseInput(overrides: Partial<CreatePacketInstanceInput> = {}): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-supp',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-supp-1',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-supp-1',
    createdBy: 'supp-user',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    ...overrides,
  };
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'content-type': 'application/json',
    'x-user-id': 'supp-user',
    'x-user-roles': 'compliance_officer',
    'x-user-access-classes': 'agency:agency-supp,packets:*',
    ...extra,
  };
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
  method: 'GET' | 'POST' | 'PATCH',
  urlPath: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<HttpJsonResponse> {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${urlPath}`, {
      method,
      headers: authHeaders(headers),
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

function buildApp(
  packetStore: FileLocalPacketStore,
  supplementalStore: FileLocalSupplementalInformationStore,
): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', identityMiddleware);
  app.use('/api/packets', createPacketSupplementalRouter({ packetStore, supplementalStore }));
  app.use(ERROR_HANDLER);
  return app;
}

describe('FR-019 supplemental information', () => {
  let packetRoot: string;
  let supplementalRoot: string;
  let auditRoot: string;
  let packetStore: FileLocalPacketStore;
  let supplementalStore: FileLocalSupplementalInformationStore;
  let app: Express;

  beforeEach(() => {
    packetRoot = makeTempDir('packet-supp-');
    supplementalRoot = makeTempDir('packet-supp-info-');
    auditRoot = makeTempDir('packet-supp-audit-');
    packetStore = new FileLocalPacketStore(packetRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    supplementalStore = new FileLocalSupplementalInformationStore(supplementalRoot);
    app = buildApp(packetStore, supplementalStore);
  });

  afterEach(() => {
    fs.rmSync(packetRoot, { recursive: true, force: true });
    fs.rmSync(supplementalRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('keeps the governed FR-019 option lists non-vacuous and exact-sized', () => {
    expect(SUPPLEMENTAL_CLASSIFICATION_OPTIONS).toHaveLength(15);
    expect(SUPPLEMENTAL_CLASSIFICATION_OPTIONS).toContain('Legal/privileged information');
    expect(SUPPLEMENTAL_DESTINATION_OPTIONS).toHaveLength(12);
    expect(SUPPLEMENTAL_DESTINATION_OPTIONS).toContain('Exclude from final packet');
  });

  it('enforces lifecycle order and prevents rejected information from applying', async () => {
    const item = await supplementalStore.create({
      packetInstanceId: 'pkt-supp-store',
      originalContent: 'Correct KPI numerator to 17.',
      submittedBy: 'supp-user',
      classification: 'Corrected source data',
      destination: 'KPI',
    });

    await expect(
      supplementalStore.transition({
        packetInstanceId: item.packetInstanceId,
        intakeId: item.intakeId,
        expectedRevision: item.revision,
        toStatus: 'MAPPED',
      }),
    ).rejects.toBeInstanceOf(IllegalSupplementalTransitionError);

    const classified = await supplementalStore.transition({
      packetInstanceId: item.packetInstanceId,
      intakeId: item.intakeId,
      expectedRevision: item.revision,
      toStatus: 'CLASSIFIED',
    });
    const mapped = await supplementalStore.transition({
      packetInstanceId: item.packetInstanceId,
      intakeId: item.intakeId,
      expectedRevision: classified.revision,
      toStatus: 'MAPPED',
    });
    const validated = await supplementalStore.transition({
      packetInstanceId: item.packetInstanceId,
      intakeId: item.intakeId,
      expectedRevision: mapped.revision,
      toStatus: 'VALIDATED',
      validationStatus: 'validated',
    });
    const rejected = await supplementalStore.transition({
      packetInstanceId: item.packetInstanceId,
      intakeId: item.intakeId,
      expectedRevision: validated.revision,
      toStatus: 'REJECTED',
      reviewerId: 'reviewer-1',
    });

    expect(rejected.lifecycleStatus).toBe('rejected');
    await expect(
      supplementalStore.transition({
        packetInstanceId: item.packetInstanceId,
        intakeId: item.intakeId,
        expectedRevision: rejected.revision,
        toStatus: 'APPLIED',
        appliedChangeIds: ['change-1'],
      }),
    ).rejects.toBeInstanceOf(IllegalSupplementalTransitionError);
  });

  it('keeps supplemental intake staged until accepted and returns destination preview', async () => {
    const { instance: packet } = await packetStore.createPacketInstance(baseInput());

    const created = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/supplemental-information`,
      {
        originalContent: 'Add management response to finding F-17.',
        classification: 'Finding response',
        destination: 'Specific finding',
        relatedFindingIds: ['F-17'],
      },
    );
    expect(created.status).toBe(201);
    const createdBody = jsonObject(created.body);
    const createdItem = jsonObject(createdBody.item);
    expect(createdItem.lifecycleStatus).toBe('received');
    expect(jsonObject(createdBody.destinationPreview).destination).toBe('Specific finding');
    expect(jsonObject(createdBody.destinationPreview).stagedUntilAccepted).toBe(true);

    const skip = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: createdItem.revision,
        lifecycleStatus: 'VALIDATED',
        validationStatus: 'validated',
      },
    );
    expect(skip.status).toBe(409);

    const classified = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: createdItem.revision,
        lifecycleStatus: 'CLASSIFIED',
        classification: 'Finding response',
      },
    );
    expect(classified.status).toBe(200);
    const classifiedItem = jsonObject(jsonObject(classified.body).item);

    const mapped = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: classifiedItem.revision,
        lifecycleStatus: 'MAPPED',
        destination: 'Specific finding',
        relatedFindingIds: ['F-17'],
      },
    );
    expect(mapped.status).toBe(200);
    expect(jsonObject(jsonObject(mapped.body).destinationPreview).targetArea).toBe('Finding register');
    const mappedItem = jsonObject(jsonObject(mapped.body).item);

    const packetBeforeAccept = await packetStore.getById(packet.packetInstanceId);
    expect(packetBeforeAccept?.revision).toBe(packet.revision);
    expect(packetBeforeAccept?.attachmentInstances).toEqual([]);

    const validated = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: mappedItem.revision,
        lifecycleStatus: 'VALIDATED',
        validationStatus: 'validated',
      },
    );
    expect(validated.status).toBe(200);
    const validatedItem = jsonObject(jsonObject(validated.body).item);

    const accepted = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: validatedItem.revision,
        lifecycleStatus: 'ACCEPTED',
      },
    );
    expect(accepted.status).toBe(200);
    const acceptedItem = jsonObject(jsonObject(accepted.body).item);
    expect(acceptedItem.lifecycleStatus).toBe('accepted');
    expect(jsonObject(jsonObject(accepted.body).destinationPreview).canApply).toBe(true);

    const applied = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}/supplemental-information/${createdItem.intakeId as string}`,
      {
        expectedRevision: acceptedItem.revision,
        lifecycleStatus: 'APPLIED',
        appliedChangeIds: ['finding:F-17:management-response'],
      },
    );
    expect(applied.status).toBe(200);
    expect(jsonObject(jsonObject(applied.body).item).lifecycleStatus).toBe('applied');
  });
});

