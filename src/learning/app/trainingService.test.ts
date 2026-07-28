import { describe, it, expect, beforeEach } from 'vitest';
import { makeMemoryEnv, type MemoryEnv } from '../adapters/memory';
import { TrainingService } from './trainingService';
import type { GateDefinition, GateStateVector } from '../domain/gates';
import type { CompletionEvidence, RequirementDefinition, RoleAssignment, SignoffRecord, GateDecision } from '../domain/types';

const now = new Date('2026-07-27T12:00:00.000Z');

function seedRN(env: MemoryEnv) {
  const role: RoleAssignment = {
    id: 'ra-rn', subjectId: 's1', roleCode: 'RN', isPrimary: true, dutyFlags: [],
    effectiveFrom: '2026-01-01T00:00:00.000Z', sourceSystem: 'registry', sourceRecordId: 'r1',
  };
  env.records.roles.set('s1', [role]);
  const req: RequirementDefinition = {
    id: 'RN-001', version: 1, code: 'RN-001', name: 'RN Orientation', kind: 'TRAINING',
    applicableRoleCodes: ['RN'], policyVersionRefs: [], evidenceSpecRefs: [], prerequisiteRequirementRefs: [],
    certificateScopes: ['role onboarding'], effectiveFrom: '2026-01-01T00:00:00.000Z', status: 'PUBLISHED',
    contentRef: { id: 'RN-001', version: '1', sha256: 'abc' },
  };
  env.records.requirements.push(req);
  env.content.put({ id: 'RN-001', version: '1', sha256: 'abc', adapterType: 'JOURNEY', publicationStatus: 'PUBLISHED', available: true });
}

const key10 = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i}`, 'a']));
const allCorrect = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i}`, 'a']));
const allWrong = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i}`, 'z']));

let env: MemoryEnv;
let svc: TrainingService;

beforeEach(() => {
  env = makeMemoryEnv(now);
  svc = new TrainingService(env);
  seedRN(env);
});

describe('provisioning → assignment is server-derived + version-pinned', () => {
  it('creates a READY assignment with a pinned content ref and emits an event', async () => {
    await svc.provisionAssignments('s1');
    const list = await env.records.listAssignments('s1');
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('READY');
    expect(list[0].pinnedContentRef).toEqual({ id: 'RN-001', version: '1', sha256: 'abc' });
    expect(env.events.events.some((e) => e.eventType === 'assignment.created')).toBe(true);
  });
});

describe('attempt lifecycle: server scoring + grade', () => {
  it('passes a full-correct attempt and records a PASSED grade (no client score trusted)', async () => {
    await svc.provisionAssignments('s1');
    const a = (await env.records.listAssignments('s1'))[0];
    const { attempt } = await svc.startAttempt('s1', a.id);
    const res = await svc.submitAttempt({ subjectId: 's1', assignmentId: a.id, attempt: attempt!, responses: allCorrect, answerKey: key10 });
    expect(res.passed).toBe(true);
    expect(res.grade.outcome).toBe('PASSED');
    expect(env.records.grades.get(a.id)?.outcome).toBe('PASSED');
  });

  it('enforces the 3-attempt ladder → hold, then blocks a 4th without reauthorization', async () => {
    await svc.provisionAssignments('s1');
    const a = (await env.records.listAssignments('s1'))[0];
    let lastLadder;
    for (let i = 0; i < 3; i++) {
      const { attempt } = await svc.startAttempt('s1', a.id);
      const r = await svc.submitAttempt({ subjectId: 's1', assignmentId: a.id, attempt: attempt!, responses: allWrong, answerKey: key10 });
      lastLadder = r.ladder;
    }
    expect(lastLadder?.action).toBe('TRAINING_HOLD');
    const fourth = await svc.startAttempt('s1', a.id);
    expect(fourth.refused).toBe('ATTEMPT_LIMIT_REACHED');
    const withReauth = await svc.startAttempt('s1', a.id, { activeReattemptAuthorization: true });
    expect(withReauth.attempt).toBeTruthy();
    expect(withReauth.attempt!.attemptNumber).toBe(4); // numbering never resets
  });
});

describe('evidence + distinct-human signoff', () => {
  const evidence = (): CompletionEvidence => ({
    id: 'e1', subjectId: 's1', assignmentId: 'as1', evidenceType: 'COMPETENCY_FORM',
    policyVersionRefs: [], workflowRefs: [], status: 'PENDING', createdAt: now.toISOString(),
    createdBy: 'u1', retentionClass: 'standard', legalHold: false,
  });
  const sign = (over: Partial<SignoffRecord>): SignoffRecord => ({
    id: 's-1', subjectId: 's1', assignmentId: 'as1', signerSubjectId: 'u2', actingRoleAssignmentId: 'ra2',
    signerSlot: 'supervisor', distinctHumanGroup: 'clinical', attestationTextVersion: 'v1', decision: 'APPROVE',
    signedAt: now.toISOString(), evidenceId: 'e1', signatureServiceRef: 'ecign:x', ...over,
  });

  it('validates artifact-backed evidence and rejects a same-human second slot', async () => {
    const v = await svc.validateEvidence(evidence(), 'reviewer', true);
    expect(v.status).toBe('VALID');
    expect((await svc.recordSignoff('as1', sign({ id: 'a', signerSubjectId: 'u2', signerSlot: 'supervisor' }))).accepted).toBe(true);
    const dup = await svc.recordSignoff('as1', sign({ id: 'b', signerSubjectId: 'u2', signerSlot: 'don' }));
    expect(dup).toEqual({ accepted: false, reason: 'DISTINCT_HUMAN_VIOLATION' });
    expect((await svc.recordSignoff('as1', sign({ id: 'c', signerSubjectId: 'u3', signerSlot: 'don' }))).accepted).toBe(true);
  });
});

describe('gate + certificate end to end', () => {
  const gateDef: GateDefinition = {
    id: 'GATE-ROLE', version: 1, gateType: 'CERTIFICATE_ELIGIBILITY', status: 'PUBLISHED',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    allOf: [{ kind: 'GRADE_OUTCOME', assignmentSelector: 'RN-001', allowed: ['PASSED'] }],
  };
  const passState = (): GateStateVector => ({
    assignmentStatuses: {}, gradeOutcomes: { 'RN-001': 'PASSED' }, validEvidenceSpecIds: new Set(),
    presentSignoffSlots: new Set(), ledgerTotals: {}, openRemediationScopes: new Set(),
    currentCredentials: new Set(), activeHolds: new Set(),
  });
  const failState = (): GateStateVector => ({ ...passState(), gradeOutcomes: { 'RN-001': 'FAILED' } });

  async function issueArgs(gate: GateDecision) {
    return {
      subjectId: 's1', gate, certificateDefinitionId: 'CD-ROLE', certificateDefinitionVersion: 1,
      eligibilitySnapshotSha256: 'snap', templateId: 'T', templateVersion: '1', approvedLogoSha256: 'logo',
      rendererVersion: 'r1', assignmentIds: ['as1'], gradeIds: ['gr1'], evidenceIds: [], signoffIds: [],
    };
  }

  it('signs a PASS gate, issues a certificate idempotently, and refuses issuance from a FAIL gate', async () => {
    const passGate = await svc.evaluateAndSignGate(gateDef, 's1', passState());
    expect(passGate.outcome).toBe('PASS');
    expect(passGate.assertionSignature).toBeTruthy();
    expect(await env.signer.verify(passGate.stateVectorSha256, passGate.assertionSignature)).toBe(true);

    const first = await svc.issueCertificate(await issueArgs(passGate));
    expect(first.certificate).toBeTruthy();
    const again = await svc.issueCertificate(await issueArgs(passGate));
    expect(again.reused).toBe(true);
    expect(again.certificate!.id).toBe(first.certificate!.id); // idempotent, no duplicate
    expect(env.jobs.jobs.filter((j) => j.queue === 'certificate-render')).toHaveLength(1);

    const failGate = await svc.evaluateAndSignGate(gateDef, 's1', failState());
    expect(failGate.outcome).toBe('FAIL');
    expect(failGate.assertionSignature).toBe('');
    const refused = await svc.issueCertificate(await issueArgs(failGate));
    expect(refused.refused).toBe('GATE_NOT_PASS');
  });

  it('public verification exposes only safe fields', async () => {
    const passGate = await svc.evaluateAndSignGate(gateDef, 's1', passState());
    const { certificate } = await svc.issueCertificate(await issueArgs(passGate));
    const v = (await svc.publicVerify(certificate!.publicId, 'RN Onboarding', 'Care Indeed', 'Taylor D.'))!;
    expect(v.status).toBe('ACTIVE');
    expect(JSON.stringify(v)).not.toMatch(/employeeId|snap|s1|score/i);
  });
});
