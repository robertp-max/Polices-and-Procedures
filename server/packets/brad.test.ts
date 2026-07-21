import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../errors.js';
import { identityMiddleware } from '../identity/middleware.js';
import { mountTestAuthBoundary, testAuthHeaders, AUTHORIZED_USER_ID } from '../auth/testAuthHarness.js';
import { DRAFT_BANNER, generateQapiMinutesDraft } from '../ia/brad/eventPackets.js';
import { GeneratedObjectStore } from '../ia/brad/generatedObjects.js';
import {
  BRAD_PACKET_PROPOSED_PATCH_FIELDS,
  missingBradPacketProposedPatchFields,
  type BradPacketProposedPatch,
} from '../ia/brad/packetPatches.js';
import type { AuditEvent } from '../audit/writer.js';
import { packetAuditStreamKey } from './auditEvents.js';
import {
  FileLocalPacketStore,
  type CreatePacketInstanceInput,
  type PacketStoreDocument,
} from './store.js';
import { createPacketBradRouter } from './routes/brad.js';

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
    agencyId: 'agency-brad',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'evt-brad-1',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    workflowId: 'QA-WF-03',
    workflowInstanceId: 'wf-brad-1',
    createdBy: 'brad-route-user',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    ...overrides,
  };
}

function buildApp(store: FileLocalPacketStore, objectStore: GeneratedObjectStore): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', identityMiddleware);
  mountTestAuthBoundary(app); // same requireApiAuth boundary as production
  app.use('/api/packets', createPacketBradRouter({ store, generatedObjectStore: objectStore }));
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
  const rows = await auditRows(store, packetInstanceId);
  return rows.map((event) => event.event_type);
}

async function auditRows(
  store: FileLocalPacketStore,
  packetInstanceId: string,
): Promise<AuditEvent[]> {
  const stream = packetAuditStreamKey(packetInstanceId);
  const rows = await store.queryAuditEvents({ stream, limit: 100 });
  return rows
    .sort((a: AuditEvent, b: AuditEvent) => a.sequence - b.sequence);
}

async function proposeBradPatch(
  app: Express,
  packet: PacketStoreDocument,
  overrides: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  const response = await requestJson(
    app,
    'POST',
    `/api/packets/${packet.packetInstanceId}/brad/propose`,
    {
      requestedChange: 'Add reviewer context to the QAPI warning list.',
      existingContent: { warningIds: packet.warningIds },
      proposedContent: { warningIds: ['qapi-context-added'] },
      reason: 'Reviewer asked Brad to draft a traceable packet edit.',
      sources: [
        {
          sourceId: 'ev-qapi-minutes',
          title: 'QAPI meeting minutes',
          page: 2,
          policyId: 'POL-QAPI-001',
          formId: 'FRM-QAPI-MINUTES',
          evidenceId: 'ev-qapi-minutes',
        },
      ],
      pagesAffected: ['executive-summary'],
      editPatch: { warningIds: ['qapi-context-added'] },
      ...overrides,
    },
  );
  expect(response.status).toBe(201);
  return jsonObject(response.body);
}

describe('/api/packets Brad-assisted editing routes', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let store: FileLocalPacketStore;
  let objectStore: GeneratedObjectStore;
  let app: Express;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-brad-');
    auditRoot = makeTempDir('packet-brad-audit-');
    store = new FileLocalPacketStore(cacheRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    objectStore = new GeneratedObjectStore(null);
    app = buildApp(store, objectStore);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('returns a complete 13-field proposed patch without mutating the packet', async () => {
    const { instance } = await store.createPacketInstance(baseInput());

    const body = await proposeBradPatch(app, instance);

    expect(body.packetMutationApplied).toBe(false);
    const proposedPatch = jsonObject(body.proposedPatch) as Partial<BradPacketProposedPatch>;
    expect(missingBradPacketProposedPatchFields(proposedPatch)).toEqual([]);
    expect(Object.keys(proposedPatch).sort()).toEqual([...BRAD_PACKET_PROPOSED_PATCH_FIELDS].sort());
    expect(proposedPatch.requestedChange).toBe('Add reviewer context to the QAPI warning list.');
    expect(proposedPatch.kpisAffected).toEqual(['Unknown — not recovered']);
    expect(proposedPatch.workflowsAffected).toEqual(['Unknown — not recovered']);

    const object = jsonObject(body.object);
    const metadata = jsonObject(object.metadata);
    expect(metadata.write_status).toBe('proposed');

    const reloaded = await store.getById(instance.packetInstanceId);
    expect(reloaded?.revision).toBe(instance.revision);
    expect(reloaded?.warningIds).toEqual([]);
    expect(await eventTypes(store, instance.packetInstanceId)).toEqual([
      'packet.template_selected',
    ]);
  });

  it('applies an accepted Brad proposal with human and Brad attribution', async () => {
    const { instance } = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-brad-accept',
      workflowInstanceId: 'wf-brad-accept',
    }));
    const proposal = await proposeBradPatch(app, instance);
    const proposalId = String(proposal.proposalId);

    const accepted = await requestJson(
      app,
      'POST',
      `/api/packets/${instance.packetInstanceId}/brad/proposals/${proposalId}/accept`,
      {
        expectedRevision: instance.revision,
        action: 'accept',
        reason: 'Human reviewer accepted the Brad proposal.',
      },
    );
    expect(accepted.status).toBe(200);
    const acceptedBody = jsonObject(accepted.body);
    expect(acceptedBody.packetMutationApplied).toBe(true);
    expect(acceptedBody.packetEffectApplied).toBe(true);
    expect(acceptedBody.applyEndpoint).toBe(`/api/packets/${instance.packetInstanceId}/edits`);
    const packet = packetFrom(accepted.body);
    expect(packet.revision).toBe(instance.revision + 1);
    expect(packet.warningIds).toEqual(['qapi-context-added']);
    expect(objectStore.get(proposalId)?.metadata.write_status).toBe('applied');
    const rows = await auditRows(store, instance.packetInstanceId);
    expect(rows.map((event) => event.event_type)).toEqual([
      'packet.template_selected',
      'packet.edited',
    ]);
    const editEvent = rows[1];
    expect(editEvent?.actor.user_id).toBe(AUTHORIZED_USER_ID);
    expect(editEvent?.actor.on_behalf_of).toBe(`brad:${proposalId}`);
    expect(String(editEvent?.payload.reason)).toContain('brad_involved=true');
  });

  it('rejects a Brad proposal without changing the packet or allowing later edit application', async () => {
    const { instance } = await store.createPacketInstance(baseInput({
      eventInstanceId: 'evt-brad-reject',
      workflowInstanceId: 'wf-brad-reject',
    }));
    const proposal = await proposeBradPatch(app, instance);
    const proposalId = String(proposal.proposalId);

    const rejected = await requestJson(
      app,
      'POST',
      `/api/packets/${instance.packetInstanceId}/brad/proposals/${proposalId}/reject`,
      {},
    );
    expect(rejected.status).toBe(200);
    expect(jsonObject(rejected.body).packetMutationApplied).toBe(false);
    expect(objectStore.get(proposalId)?.metadata.write_status).toBe('denied');

    const deniedEdit = await requestJson(
      app,
      'POST',
      `/api/packets/${instance.packetInstanceId}/edits`,
      {
        expectedRevision: instance.revision,
        bradProposalId: proposalId,
      },
    );
    expect(deniedEdit.status).toBe(409);
    const error = jsonObject(jsonObject(deniedEdit.body).error);
    expect(error.code).toBe('validation_error');
    const details = jsonObject(error.details);
    const blockers = details.blockers as Array<Record<string, unknown>>;
    expect(blockers[0]?.code).toBe('brad_proposal_not_accepted');

    const reloaded = await store.getById(instance.packetInstanceId);
    expect(reloaded?.revision).toBe(instance.revision);
    expect(reloaded?.warningIds).toEqual([]);
    expect(await eventTypes(store, instance.packetInstanceId)).toEqual([
      'packet.template_selected',
    ]);
  });

  it('preserves existing Brad QAPI minutes draft behavior', () => {
    const minutes = generateQapiMinutesDraft({
      eventId: 'evt-qapi-minutes-existing',
      eventTitle: 'QAPI Committee Meeting',
      eventType: 'qapi',
      workflowId: 'QA-WF-03',
      meetingDateTime: '2026-04-09T17:00:00.000Z',
      attendees: ['Administrator', 'Director of Nursing'],
      requiredRoles: ['Administrator', 'Director of Nursing'],
      agenda: ['Review Q1 metrics'],
      requiredFormIds: ['QA-FM-020'],
      policyIds: ['QA-PI-001'],
      tasks: [{ id: 'task-1', title: 'Review data', status: 'open' }],
      evidenceItemIds: ['ev-q1'],
      signatures: [{ role: 'Administrator', signed: false }],
      followUps: ['Prepare governing body summary'],
      metrics: [{ name: 'Hospitalizations', value: 5, target: 4 }],
      pips: [{ id: 'pip-1', title: 'Hospitalization reduction', status: 'monitoring' }],
      incidents: [{ id: 'inc-1', type: 'Fall', severity: 'moderate', summary: 'Trend review' }],
      capturedAt: '2026-04-09T18:00:00.000Z',
    });

    expect(minutes.draftBanner).toBe(DRAFT_BANNER);
    expect(minutes.finalized).toBe(false);
    expect(minutes.requiredApprovals).toEqual(['Administrator']);
  });
});
