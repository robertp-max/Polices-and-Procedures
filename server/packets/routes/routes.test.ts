import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../../errors.js';
import { identityMiddleware } from '../../identity/middleware.js';
import {
  mountTestAuthBoundary, testAuthHeaders,
  EXPIRED_BEARER, WRONG_ISSUER_BEARER, ID_TOKEN_BEARER, SUSPENDED_BEARER, MALFORMED_BEARER,
} from '../../auth/testAuthHarness.js';
import type { AuditEvent } from '../../audit/writer.js';
import { packetAuditStreamKey } from '../auditEvents.js';
import {
  FileLocalPacketStore,
  type CreatePacketInstanceInput,
  type PacketStoreDocument,
} from '../store.js';
import { createPacketLifecycleRouter } from './lifecycle.js';
import { createPacketSourcesRouter } from './sources.js';
import { createPacketTemplatesRouter } from './templates.js';

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

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function baseInput(overrides: Partial<CreatePacketInstanceInput> = {}): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-routes',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-routes-1',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-routes-1',
    createdBy: 'route-user',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    ...overrides,
  };
}

function buildApp(store: FileLocalPacketStore): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', identityMiddleware);
  mountTestAuthBoundary(app); // same requireApiAuth boundary as production
  app.use('/api/packet-templates', createPacketTemplatesRouter());
  app.use('/api/packets', createPacketLifecycleRouter({ store }));
  app.use('/api/packets', createPacketSourcesRouter({ store }));
  app.use(ERROR_HANDLER);
  return app;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return testAuthHeaders(extra);
}

function jsonObject(value: unknown): Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);
  return value as Record<string, unknown>;
}

function packetFrom(body: unknown): PacketStoreDocument {
  const packet = jsonObject(body).packet;
  expect(packet).toBeTruthy();
  return packet as PacketStoreDocument;
}

function errorBlockers(body: unknown): Array<Record<string, unknown>> {
  const error = jsonObject(jsonObject(body).error);
  const details = jsonObject(error.details);
  const blockers = details.blockers;
  expect(Array.isArray(blockers)).toBe(true);
  return blockers as Array<Record<string, unknown>>;
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

async function eventTypes(
  store: FileLocalPacketStore,
  packetInstanceId: string,
): Promise<string[]> {
  const stream = packetAuditStreamKey(packetInstanceId);
  const rows = await store.queryAuditEvents({ stream, limit: 100 });
  return rows
    .sort((a: AuditEvent, b: AuditEvent) => a.sequence - b.sequence)
    .map((event) => event.event_type);
}

describe('/api/packets route package', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let store: FileLocalPacketStore;
  let app: Express;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-routes-');
    auditRoot = makeTempDir('packet-routes-audit-');
    store = new FileLocalPacketStore(cacheRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    app = buildApp(store);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('returns the existing instance on duplicate POST instead of duplicating', async () => {
    const body = baseInput();

    const first = await requestJson(
      app,
      'POST',
      '/api/packets',
      body,
      { 'Idempotency-Key': 'packet-create-routes-1' },
    );
    expect(first.status).toBe(201);
    const firstBody = jsonObject(first.body);
    expect(firstBody.created).toBe(true);
    const firstPacket = packetFrom(first.body);

    const second = await requestJson(
      app,
      'POST',
      '/api/packets',
      { ...body, packetId: 'client-attempted-duplicate-id' },
      { 'Idempotency-Key': 'packet-create-routes-1' },
    );
    expect(second.status).toBe(200);
    const secondBody = jsonObject(second.body);
    expect(secondBody.created).toBe(false);
    const secondPacket = packetFrom(second.body);
    expect(secondPacket.packetInstanceId).toBe(firstPacket.packetInstanceId);
    expect(secondPacket.packetId).toBe(firstPacket.packetId);

    const listed = await store.list({ agencyId: 'agency-routes' });
    expect(listed).toHaveLength(1);
    expect(await eventTypes(store, firstPacket.packetInstanceId)).toEqual([
      'packet.template_selected',
    ]);
  });

  it('rejects stale PATCH writes with optimistic-concurrency details', async () => {
    const created = await requestJson(
      app,
      'POST',
      '/api/packets',
      baseInput({ eventInstanceId: 'evt-stale', workflowInstanceId: 'wf-stale' }),
      { 'Idempotency-Key': 'packet-stale' },
    );
    const packet = packetFrom(created.body);

    const patch = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}`,
      {
        expectedRevision: packet.revision,
        patch: { warningIds: ['warning-first'] },
      },
    );
    expect(patch.status).toBe(200);
    const patched = packetFrom(patch.body);
    expect(patched.revision).toBe(packet.revision + 1);
    expect(patched.warningIds).toEqual(['warning-first']);

    const stale = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}`,
      {
        expectedRevision: packet.revision,
        patch: { warningIds: ['warning-stale'] },
      },
    );
    expect(stale.status).toBe(409);
    const error = jsonObject(jsonObject(stale.body).error);
    expect(error.code).toBe('validation_error');
    const details = jsonObject(error.details);
    expect(details.code).toBe('stale_write');
    expect(details.expectedRevision).toBe(packet.revision);
    expect(details.actualRevision).toBe(patched.revision);

    const reloaded = await store.getById(packet.packetInstanceId);
    expect(reloaded?.warningIds).toEqual(['warning-first']);
  });

  it('returns structured blockers for malformed mutation bodies', async () => {
    const badCreate = await requestJson(
      app,
      'POST',
      '/api/packets',
      {
        ...baseInput({
          eventInstanceId: 'evt-bad-version',
          workflowInstanceId: 'wf-bad-version',
        }),
        packetVersion: 0,
      },
      { 'Idempotency-Key': 'packet-bad-version' },
    );
    expect(badCreate.status).toBe(400);
    const createBlockers = errorBlockers(badCreate.body);
    expect(createBlockers[0]?.code).toBe('field_value_invalid');
    expect(createBlockers[0]?.path).toBe('packetVersion');

    const created = await requestJson(
      app,
      'POST',
      '/api/packets',
      baseInput({
        eventInstanceId: 'evt-malformed-body',
        workflowInstanceId: 'wf-malformed-body',
      }),
      { 'Idempotency-Key': 'packet-malformed-body' },
    );
    const packet = packetFrom(created.body);

    const badPatch = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}`,
      {
        expectedRevision: packet.revision,
        patch: ['warningIds'],
      },
    );
    expect(badPatch.status).toBe(400);
    const patchBlockers = errorBlockers(badPatch.body);
    expect(patchBlockers[0]?.code).toBe('patch_type_invalid');
    expect(patchBlockers[0]?.path).toBe('patch');
    const afterBadPatch = await store.getById(packet.packetInstanceId);
    expect(afterBadPatch?.revision).toBe(packet.revision);
    expect((afterBadPatch as unknown as { patch?: unknown })?.patch).toBeUndefined();

    const badSource = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/sources`,
      {
        expectedRevision: packet.revision,
        sourceType: 'drive-evidence',
        title: 'Malformed source metadata',
        driveUrl: 123,
      },
    );
    expect(badSource.status).toBe(400);
    const sourceBlockers = errorBlockers(badSource.body);
    expect(sourceBlockers[0]?.code).toBe('field_type_invalid');
    expect(sourceBlockers[0]?.path).toBe('driveUrl');
    const afterBadSource = await store.getById(packet.packetInstanceId);
    expect(afterBadSource?.attachmentInstances).toHaveLength(0);
    expect(await eventTypes(store, packet.packetInstanceId)).toEqual([
      'packet.template_selected',
    ]);
  });

  it('emits an audit event for each successful route mutation', async () => {
    const created = await requestJson(
      app,
      'POST',
      '/api/packets',
      baseInput({ eventInstanceId: 'evt-audit', workflowInstanceId: 'wf-audit' }),
      { 'Idempotency-Key': 'packet-audit-create' },
    );
    const packet = packetFrom(created.body);
    expect(await eventTypes(store, packet.packetInstanceId)).toEqual([
      'packet.template_selected',
    ]);

    const patched = await requestJson(
      app,
      'PATCH',
      `/api/packets/${packet.packetInstanceId}`,
      {
        expectedRevision: packet.revision,
        patch: { approvalIds: ['approval-qapi-chair'] },
      },
    );
    const afterPatch = packetFrom(patched.body);
    expect(await eventTypes(store, packet.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.edited',
    ]);

    const validated = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/validate`,
      { expectedRevision: afterPatch.revision },
    );
    const afterValidate = packetFrom(validated.body);
    expect(await eventTypes(store, packet.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.edited',
      'packet.validated',
    ]);

    const sourced = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/sources`,
      {
        expectedRevision: afterValidate.revision,
        sourceType: 'drive-evidence',
        title: 'Q1 QAPI source export',
        evidenceId: 'ev-qapi-q1',
        driveUrl: 'https://drive.example/q1-source',
        clientHash: 'client-supplied-hash',
      },
    );
    expect(sourced.status).toBe(201);
    expect(await eventTypes(store, packet.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.edited',
      'packet.validated',
      'packet.source_uploaded',
    ]);

    const approvalSeed = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-audit-approve',
      workflowInstanceId: 'wf-audit-approve',
      status: 'READY_FOR_APPROVAL',
    }));
    const approved = await requestJson(
      app,
      'POST',
      `/api/packets/${approvalSeed.instance.packetInstanceId}/approve`,
      { expectedRevision: approvalSeed.instance.revision },
    );
    expect(approved.status).toBe(200);
    expect(await eventTypes(store, approvalSeed.instance.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.approved',
    ]);

    const returnSeed = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-audit-return',
      workflowInstanceId: 'wf-audit-return',
      status: 'READY_FOR_APPROVAL',
    }));
    const returned = await requestJson(
      app,
      'POST',
      `/api/packets/${returnSeed.instance.packetInstanceId}/return-for-correction`,
      { expectedRevision: returnSeed.instance.revision, reason: 'needs correction' },
    );
    expect(returned.status).toBe(200);
    expect(await eventTypes(store, returnSeed.instance.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.edited',
    ]);

    const rejectSeed = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-audit-reject',
      workflowInstanceId: 'wf-audit-reject',
      status: 'APPROVED_FOR_SIGNATURE',
    }));
    const rejected = await requestJson(
      app,
      'POST',
      `/api/packets/${rejectSeed.instance.packetInstanceId}/reject`,
      { expectedRevision: rejectSeed.instance.revision, reason: 'approval rejected' },
    );
    expect(rejected.status).toBe(200);
    expect(await eventTypes(store, rejectSeed.instance.packetInstanceId)).toEqual([
      'packet.template_selected',
      'packet.edited',
    ]);
  });

  it('returns blockers as structured objects from validation and approval gates', async () => {
    const created = await requestJson(
      app,
      'POST',
      '/api/packets',
      baseInput({
        eventInstanceId: 'evt-blocked',
        workflowInstanceId: 'wf-blocked',
        blockerIds: ['missing-governing-body-approval'],
      }),
      { 'Idempotency-Key': 'packet-blocked' },
    );
    const packet = packetFrom(created.body);

    const validation = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/validate`,
      { expectedRevision: packet.revision },
    );
    expect(validation.status).toBe(200);
    const validationBody = jsonObject(validation.body);
    expect(validationBody.status).toBe('blocked');
    const blockers = validationBody.blockers as Array<Record<string, unknown>>;
    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.code).toBe('packet.blocker_unresolved');
    expect(blockers[0]?.path).toBe('blockerIds.0');
    expect(blockers[0]?.remediation).toContain('Resolve');

    const approvalSeed = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-approve-blocked',
      workflowInstanceId: 'wf-approve-blocked',
      status: 'READY_FOR_APPROVAL',
      blockerIds: ['missing-governing-body-approval'],
    }));
    const approval = await requestJson(
      app,
      'POST',
      `/api/packets/${approvalSeed.instance.packetInstanceId}/approve`,
      { expectedRevision: approvalSeed.instance.revision },
    );
    expect(approval.status).toBe(409);
    const details = jsonObject(jsonObject(jsonObject(approval.body).error).details);
    const approvalBlockers = details.blockers as Array<Record<string, unknown>>;
    expect(approvalBlockers[0]?.code).toBe('packet.blocker_unresolved');
    expect(approvalBlockers[0]?.message).toContain('missing-governing-body-approval');
  });

  it('never trusts or persists a client-supplied source hash', async () => {
    const created = await requestJson(
      app,
      'POST',
      '/api/packets',
      baseInput({ eventInstanceId: 'evt-hash', workflowInstanceId: 'wf-hash' }),
      { 'Idempotency-Key': 'packet-hash' },
    );
    const packet = packetFrom(created.body);
    const clientHash = 'sha256:client-controlled';

    const sourceResponse = await requestJson(
      app,
      'POST',
      `/api/packets/${packet.packetInstanceId}/sources`,
      {
        expectedRevision: packet.revision,
        sourceType: 'drive-evidence',
        title: 'Hash validation source',
        evidenceId: 'ev-hash-test',
        driveUrl: 'https://drive.example/hash-source',
        clientHash,
        contentHash: clientHash,
      },
    );
    expect(sourceResponse.status).toBe(201);
    const sourceBody = jsonObject(sourceResponse.body);
    expect(sourceBody.clientHashTrusted).toBe(false);
    expect(sourceBody.ignoredClientFields).toEqual(['clientHash', 'contentHash']);
    const source = sourceBody.source as { contentHash: string };
    expect(source.contentHash).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(source.contentHash).not.toBe(clientHash);

    const getResponse = await requestJson(
      app,
      'GET',
      `/api/packets/${packet.packetInstanceId}`,
    );
    const reloaded = packetFrom(getResponse.body);
    expect(reloaded.attachmentInstances).toHaveLength(1);
    expect(reloaded.attachmentInstances[0]?.contentHash).toBe(source.contentHash);
    expect(reloaded.attachmentInstances[0]?.contentHash).not.toBe(clientHash);
  });

  // ── Negative authentication (verified boundary rejects bad/absent tokens) ──
  // Every request goes through the production requireApiAuth boundary. A create
  // POST that succeeds (201) as the authorized actor must be denied when the
  // bearer is absent, malformed, expired, wrong-issuer, an id token, or bound
  // to a suspended user. Forged x-user-* headers cannot authenticate.
  it('denies packet creation without a bearer token (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: '' });
    expect(res.status).toBe(401);
  });

  it('denies a malformed bearer token (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: MALFORMED_BEARER });
    expect(res.status).toBe(401);
  });

  it('denies an expired bearer token (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: EXPIRED_BEARER });
    expect(res.status).toBe(401);
  });

  it('denies a wrong-issuer bearer token (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: WRONG_ISSUER_BEARER });
    expect(res.status).toBe(401);
  });

  it('denies an id token (wrong token_use) (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: ID_TOKEN_BEARER });
    expect(res.status).toBe(401);
  });

  it('denies a suspended/inactive user even with a valid token (403)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), { authorization: SUSPENDED_BEARER });
    expect(res.status).toBe(403);
  });

  it('ignores forged x-user-* headers (no anonymous fallback) (401)', async () => {
    const res = await requestJson(app, 'POST', '/api/packets', baseInput(), {
      authorization: '',
      'x-user-id': 'forged-admin',
      'x-user-roles': 'super_admin,administrator',
      'x-user-access-classes': 'packets:*',
    });
    expect(res.status).toBe(401);
  });
});
