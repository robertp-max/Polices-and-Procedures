import { describe, it, expect, beforeEach } from 'vitest';
import { makeMemoryEnv, type MemoryEnv } from '../adapters/memory';
import { TrainingService } from '../app/trainingService';
import { createRouter, type ApiRequest, type AuthContext } from './router';
import type { Capability } from './authz';
import type { RequirementDefinition, RoleAssignment } from '../domain/types';

const now = new Date('2026-07-27T12:00:00.000Z');

let env: MemoryEnv;
let svc: TrainingService;
let handle: (req: ApiRequest) => Promise<{ status: number; body: unknown }>;

function seed(subjectId: string) {
  const role: RoleAssignment = { id: `ra-${subjectId}`, subjectId, roleCode: 'RN', isPrimary: true, dutyFlags: [], effectiveFrom: '2026-01-01T00:00:00.000Z', sourceSystem: 'reg', sourceRecordId: 'r' };
  env.records.roles.set(subjectId, [role]);
}

beforeEach(() => {
  env = makeMemoryEnv(now);
  svc = new TrainingService(env);
  handle = createRouter(svc);
  const req: RequirementDefinition = { id: 'RN-001', version: 1, code: 'RN-001', name: 'RN', kind: 'TRAINING', applicableRoleCodes: ['RN'], policyVersionRefs: [], evidenceSpecRefs: [], prerequisiteRequirementRefs: [], certificateScopes: [], effectiveFrom: '2026-01-01T00:00:00.000Z', status: 'PUBLISHED' };
  env.records.requirements.push(req);
  seed('s1');
  seed('s2');
});

const learner = (subjectId: string, caps: Capability[]): AuthContext => ({ subjectId, capabilities: new Set(caps) });

describe('cross-cutting: auth, idempotency, error model', () => {
  it('401 when unauthenticated on a protected route', async () => {
    expect((await handle({ method: 'GET', path: '/api/training/me/assignments' })).status).toBe(401);
  });
  it('400 when a POST lacks an Idempotency-Key', async () => {
    const res = await handle({ method: 'POST', path: '/api/training/admin/plans/resolve', auth: learner('admin', ['training.hr.assign']), body: { subjectId: 's1' } });
    expect(res.status).toBe(400);
    expect((res.body as any).error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });
  it('403 when the capability is missing', async () => {
    const res = await handle({ method: 'GET', path: '/api/training/me/assignments', auth: learner('s1', []) });
    expect(res.status).toBe(403);
    expect((res.body as any).error.code).toBe('MISSING_CAPABILITY');
  });
  it('403 when the account is suspended', async () => {
    const res = await handle({ method: 'GET', path: '/api/training/me/assignments', auth: { ...learner('s1', ['training.self.read']), suspended: true } });
    expect(res.status).toBe(403);
    expect((res.body as any).error.code).toBe('USER_SUSPENDED');
  });
});

describe('happy path: admin resolve → learner reads → learner starts own attempt', () => {
  it('runs the full flow with correct authz', async () => {
    const admin = await handle({ method: 'POST', path: '/api/training/admin/plans/resolve', auth: learner('admin', ['training.hr.assign']), idempotencyKey: 'k1', body: { subjectId: 's1' } });
    expect(admin.status).toBe(200);

    const list = await handle({ method: 'GET', path: '/api/training/me/assignments', auth: learner('s1', ['training.self.read']) });
    expect(list.status).toBe(200);
    const assignments = (list.body as any).assignments;
    expect(assignments.length).toBe(1);

    const start = await handle({ method: 'POST', path: `/api/training/me/assignments/${assignments[0].id}/start`, auth: learner('s1', ['training.self.attempt.submit']), idempotencyKey: 'k2' });
    expect(start.status).toBe(201);
    expect((start.body as any).attempt.attemptNumber).toBe(1);
  });

  it('denies object scope when a learner targets another subject’s assignment', async () => {
    await handle({ method: 'POST', path: '/api/training/admin/plans/resolve', auth: learner('admin', ['training.hr.assign']), idempotencyKey: 'k1', body: { subjectId: 's2' } });
    const s2Assignment = (await svc.listAssignments('s2'))[0];
    const res = await handle({ method: 'POST', path: `/api/training/me/assignments/${s2Assignment.id}/start`, auth: learner('s1', ['training.self.attempt.submit']), idempotencyKey: 'k3' });
    expect(res.status).toBe(403);
    expect((res.body as any).error.code).toBe('OBJECT_SCOPE_DENIED');
  });
});

describe('public certificate verification (no auth, minimized)', () => {
  it('404 for an unknown public id and no auth required', async () => {
    const res = await handle({ method: 'GET', path: '/api/public/certificates/UNKNOWN' });
    expect(res.status).toBe(404);
    expect((res.body as any).error.code).toBe('CERTIFICATE_NOT_FOUND');
  });
});
