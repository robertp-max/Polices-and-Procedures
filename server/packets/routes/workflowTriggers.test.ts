import fs from 'node:fs';
import http, { type Server } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import express, { type ErrorRequestHandler, type Express } from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../../errors.js';
import { identityMiddleware } from '../../identity/middleware.js';
import type { AuditEvent } from '../../audit/writer.js';
import { packetAuditStreamKey } from '../auditEvents.js';
import {
  FileLocalPacketStore,
  type CreatePacketInstanceInput,
  type PacketStoreDocument,
} from '../store.js';
import {
  createWorkflowTriggersRouter,
  type WorkflowTriggerRegisterPayload,
} from './workflowTriggers.js';
import type { WorkflowTriggerEvaluation } from '@/policy/packets/contracts';

interface HttpJsonResponse {
  status: number;
  body: unknown;
}

const REGISTER_MODULE_ID = 'qapi-triggered-workflow-and-dependency-register';

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

function baseInput(
  suffix: string,
  overrides: Partial<CreatePacketInstanceInput> = {},
): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-trigger-routes',
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: `evt-trigger-${suffix}`,
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    workflowId: 'QA-WF-03',
    workflowInstanceId: `wf-trigger-${suffix}`,
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
  app.use('/api/packets', createWorkflowTriggersRouter({ store }));
  app.use(ERROR_HANDLER);
  return app;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'content-type': 'application/json',
    'x-user-id': 'route-user',
    'x-user-roles': 'qapi_chair',
    'x-user-access-classes': 'agency:agency-trigger-routes,packets:*',
    ...extra,
  };
}

function jsonObject(value: unknown): Record<string, unknown> {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBe(false);
  return value as Record<string, unknown>;
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
  urlPath: string,
  body: unknown,
  headers: Record<string, string> = {},
): Promise<HttpJsonResponse> {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}${urlPath}`, {
      method: 'POST',
      headers: authHeaders(headers),
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

function confirmedEvaluation(
  packet: PacketStoreDocument,
  overrides: Partial<WorkflowTriggerEvaluation> = {},
): WorkflowTriggerEvaluation {
  return {
    evaluationId: 'eval-pip-trigger-1',
    packetId: packet.packetId,
    parentEventId: packet.eventInstanceId,
    reportingPeriod: '2026-Q1',
    findingId: 'finding-recurring-infection-control',
    sourceRecordIds: ['qapi-minutes-q1'],
    sourceFormIds: ['qapi-review-form'],
    sourceWorkflowIds: [packet.workflowInstanceId],
    triggerRuleId: 'tr-pip-recurring-quality-issue',
    triggerType: 'conditional',
    observedValue: 3,
    numerator: 3,
    denominator: 12,
    threshold: 2,
    thresholdOperator: '>=',
    recurrenceWindow: 'quarter',
    canonicalWorkflowId: 'QA-WF-04',
    canonicalWorkflowTitle: 'Performance Improvement Project',
    workflowVersion: 'policy/workflows/QA-WF-04',
    decisionState: 'CONFIRMED — NOT YET ACTIVATED',
    decisionRationale: 'QAPI Committee confirmed the recurring quality issue for PIP activation.',
    validationStatus: 'validated',
    ownerRole: 'qapi_chair',
    assignedUserId: null,
    approverRoles: ['qapi_chair'],
    dueDate: '2026-04-30',
    requiredFormIds: ['pip-charter'],
    dependencyWorkflowIds: [],
    blockerIds: [],
    existingWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
    reviewedBy: 'qapi-chair-user',
    reviewedAt: '2026-04-15T12:00:00.000Z',
    overrideReason: null,
    lifecycleStatus: 'VALIDATED',
    determination: 'New PIP',
    pipEvaluationFactors: null,
    ...overrides,
  };
}

function triggerPayload(packet: PacketStoreDocument): WorkflowTriggerRegisterPayload {
  const module = packet.moduleInstances.find((item) => item.moduleId === REGISTER_MODULE_ID);
  expect(module).toBeTruthy();
  return module?.payload as WorkflowTriggerRegisterPayload;
}

async function workflowAuditEvents(
  store: FileLocalPacketStore,
  packetInstanceId: string,
): Promise<AuditEvent[]> {
  const stream = packetAuditStreamKey(packetInstanceId);
  return store.queryAuditEvents({ stream, limit: 100 });
}

describe('/api/packets workflow-trigger routes', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let store: FileLocalPacketStore;
  let app: Express;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-workflow-triggers-');
    auditRoot = makeTempDir('packet-workflow-triggers-audit-');
    store = new FileLocalPacketStore(cacheRoot, {
      ledgerPath: path.join(auditRoot, 'audit_events.jsonl'),
    });
    app = buildApp(store);
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('double-activate with the same FR-014 key records one activation', async () => {
    const created = await store.createPacketInstance(baseInput('double-activate'));
    const evaluation = confirmedEvaluation(created.instance);
    const body = {
      expectedRevision: created.instance.revision,
      evaluation,
      rationale: 'QAPI Committee authorized a new PIP activation.',
    };

    const first = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/activate`,
      body,
    );
    expect(first.status).toBe(200);
    expect(jsonObject(first.body).activated).toBe(true);

    const second = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/activate`,
      body,
    );
    expect(second.status).toBe(200);
    expect(jsonObject(second.body).activated).toBe(false);
    expect(jsonObject(second.body).idempotent).toBe(true);

    const reloaded = await store.getById(created.instance.packetInstanceId);
    expect(reloaded).toBeTruthy();
    const payload = triggerPayload(reloaded as PacketStoreDocument);
    const activationDecisions = payload.decisions.filter((decision) => decision.action === 'activate');
    expect(activationDecisions).toHaveLength(1);
    expect(activationDecisions[0]?.decisionState).toBe('ACTIVATED');
    expect(payload.evaluations.find((item) => item.evaluationId === evaluation.evaluationId)?.newWorkflowInstanceId)
      .toBe(activationDecisions[0]?.activationKey);
    expect(payload.cesLinks).toHaveLength(1);
    expect(payload.cesLinks[0]?.cesMutation).toBe('not_performed');

    const events = await workflowAuditEvents(store, created.instance.packetInstanceId);
    expect(events.filter((event) => event.event_type === 'packet.workflow_activated')).toHaveLength(1);
  });

  it('rejects activation when the user lacks trigger authority', async () => {
    const created = await store.createPacketInstance(baseInput('unauthorized'));
    const evaluation = confirmedEvaluation(created.instance);

    const response = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/activate`,
      {
        expectedRevision: created.instance.revision,
        evaluation,
        rationale: 'Attempted activation by an unauthorized viewer.',
      },
      { 'x-user-roles': 'viewer' },
    );

    expect(response.status).toBe(403);
    const reloaded = await store.getById(created.instance.packetInstanceId);
    expect(reloaded?.moduleInstances.find((item) => item.moduleId === REGISTER_MODULE_ID)).toBeUndefined();
  });

  it('deduplicates repeated link-existing requests', async () => {
    const created = await store.createPacketInstance(baseInput('link-existing'));
    const evaluation = confirmedEvaluation(created.instance, {
      evaluationId: 'eval-existing-pip',
      findingId: 'finding-existing-pip-coverage',
    });
    const body = {
      expectedRevision: created.instance.revision,
      evaluation,
      existingWorkflowInstanceId: 'ces-pip-active-1',
      rationale: 'Existing active PIP covers the same root issue.',
    };

    const first = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/link-existing`,
      body,
    );
    expect(first.status).toBe(200);
    expect(jsonObject(first.body).linked).toBe(true);

    const second = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/link-existing`,
      body,
    );
    expect(second.status).toBe(200);
    expect(jsonObject(second.body).linked).toBe(false);
    expect(jsonObject(second.body).idempotent).toBe(true);

    const reloaded = await store.getById(created.instance.packetInstanceId);
    expect(reloaded).toBeTruthy();
    const payload = triggerPayload(reloaded as PacketStoreDocument);
    expect(payload.cesLinks.filter((link) => link.existingWorkflowInstanceId === 'ces-pip-active-1'))
      .toHaveLength(1);
    expect(payload.decisions.filter((decision) => decision.action === 'link-existing')).toHaveLength(1);
    expect(payload.evaluations.find((item) => item.evaluationId === evaluation.evaluationId)?.decisionState)
      .toBe('LINKED TO EXISTING ACTIVE WORKFLOW');
  });

  it('does not auto-activate a keyword-only workflow candidate', async () => {
    const created = await store.createPacketInstance(baseInput('keyword-candidate'));
    const evaluation = confirmedEvaluation(created.instance, {
      evaluationId: 'eval-keyword-candidate',
      canonicalWorkflowId: null,
      canonicalWorkflowTitle: null,
      workflowVersion: null,
      decisionState: 'CANDIDATE — NEEDS VALIDATION',
      decisionRationale: 'Keyword similarity may suggest a candidate but must not activate it.',
      validationStatus: 'provisional',
      lifecycleStatus: 'CANDIDATE',
      reviewedBy: null,
      reviewedAt: null,
    });

    const response = await requestJson(
      app,
      `/api/packets/${created.instance.packetInstanceId}/workflow-triggers/${evaluation.evaluationId}/activate`,
      {
        expectedRevision: created.instance.revision,
        evaluation,
        rationale: 'Attempted activation from keyword candidate.',
      },
    );

    expect(response.status).toBe(409);
    const blockers = errorBlockers(response.body);
    expect(blockers.some((blocker) => blocker.code === 'canonical_workflow_unresolved')).toBe(true);
    const reloaded = await store.getById(created.instance.packetInstanceId);
    expect(reloaded?.moduleInstances.find((item) => item.moduleId === REGISTER_MODULE_ID)).toBeUndefined();
  });
});
