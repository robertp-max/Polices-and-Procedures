import { describe, expect, it } from 'vitest';
import { ACADEMY_MODULES, academyModule } from './academyBank.js';
import type { AcademyAttempt, SourceAuthorityMetadata } from './contracts.js';
import { governanceMutation, mutationContext, write } from './mutations.js';
import {
  createGovernanceTestFixture,
  academySourceIds,
  TEST_NOW,
  testContext,
} from './testFixtures.js';

function after(seconds: number): string {
  return new Date(Date.parse(TEST_NOW) + seconds * 1_000).toISOString();
}

async function creditMinimumTime(
  fixture: Awaited<ReturnType<typeof createGovernanceTestFixture>>,
  attempt: AcademyAttempt,
): Promise<AcademyAttempt> {
  const definition = academyModule(attempt.moduleId);
  if (!definition) throw new Error('Test module missing.');
  const context = testContext('fixture', `academy-time:${attempt.id}`, after(600));
  const updated: AcademyAttempt = {
    ...attempt,
    version: attempt.version + 1,
    updatedAt: context.now,
    updatedBy: 'fixture',
    activeSeconds: definition.minimumActiveSeconds,
  };
  await fixture.repository.transact(mutationContext(context), governanceMutation({
    context,
    scope: `fixture.academy_time:${attempt.id}`,
    request: { attemptId: attempt.id, minimumActiveSeconds: definition.minimumActiveSeconds },
    writes: [write('academy_attempt', updated, attempt.version)],
    response: updated,
    eventType: 'governance.fixture.academy_time_credited',
    action: 'fixture.test_only',
    resourceType: 'academy_attempt',
    resourceId: attempt.id,
  }));
  return updated;
}

describe('Governance Institute corrective authority', () => {
  it('publishes all 13 modules and exactly 65 required learning scenes', async () => {
    const fixture = await createGovernanceTestFixture();
    const catalog = fixture.academy.catalog();
    expect(catalog).toHaveLength(13);
    expect(catalog.reduce((total, module) => total + module.sceneCount, 0)).toBe(65);
    expect(catalog.every((module) => module.sceneCount === 5)).toBe(true);
    expect(catalog.find((module) => module.id === 'GB-003')?.executableTaskCount).toBe(9);
  });

  it('binds an attempt to the active appointed member and rejects another identity', async () => {
    const fixture = await createGovernanceTestFixture();
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-gb001'),
      { memberId: 'member-chair', moduleId: 'GB-001', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds: academySourceIds('GB-001') },
    );
    await expect(fixture.academy.startAttempt(testContext('person-director', 'wrong-learner'), assignment.id))
      .rejects.toMatchObject({ status: 403 });
    const started = await fixture.academy.startAttempt(testContext('person-chair', 'correct-learner'), assignment.id);
    expect(started.attempt.memberId).toBe('member-chair');
    expect(started.attempt.contentVersion).toBe(started.module?.contentVersion);
  });

  it('credits active time only from bounded, visible, focused, recent server heartbeats', async () => {
    const fixture = await createGovernanceTestFixture();
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-heartbeat'),
      { memberId: 'member-chair', moduleId: 'GB-002', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds: academySourceIds('GB-002') },
    );
    const started = await fixture.academy.startAttempt(testContext('person-chair', 'start-heartbeat'), assignment.id);
    const hidden = await fixture.academy.heartbeat(testContext('person-chair', 'heartbeat-hidden', after(30)), {
      attemptId: started.attempt.id, expectedVersion: started.attempt.version, occurredAt: after(30),
      visible: false, focused: true, recentActivity: true,
    });
    const active = await fixture.academy.heartbeat(testContext('person-chair', 'heartbeat-active', after(60)), {
      attemptId: hidden.id, expectedVersion: hidden.version, occurredAt: after(60),
      visible: true, focused: true, recentActivity: true,
    });
    expect(hidden.activeSeconds).toBe(0);
    expect(active.activeSeconds).toBe(30);
  });

  it('enforces the nine-step GB-003 meeting simulation order on the server', async () => {
    const fixture = await createGovernanceTestFixture();
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-gb003'),
      { memberId: 'member-chair', moduleId: 'GB-003', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds: academySourceIds('GB-003') },
    );
    const { attempt } = await fixture.academy.startAttempt(testContext('person-chair', 'start-gb003'), assignment.id);
    await expect(fixture.academy.recordTaskEvent(testContext('person-chair', 'gb003-out-of-order', after(5)), {
      attemptId: attempt.id, expectedVersion: attempt.version, stageId: 'field-guide', taskId: 'publish_agenda',
      eventType: 'learner_executed', payload: {}, occurredAt: after(5),
    })).rejects.toThrow(/controlled order/i);
    const first = await fixture.academy.recordTaskEvent(testContext('person-chair', 'gb003-first', after(6)), {
      attemptId: attempt.id, expectedVersion: attempt.version, stageId: 'field-guide', taskId: 'publish_notice',
      eventType: 'learner_executed', payload: {}, occurredAt: after(6),
    });
    expect(first.attempt.taskEventIds).toHaveLength(1);
  });

  it('blocks an assigned module when a controlled policy source is later held', async () => {
    const fixture = await createGovernanceTestFixture();
    const sourceMetadataIds = academySourceIds('GB-006');
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-held-source'),
      { memberId: 'member-chair', moduleId: 'GB-006', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds },
    );
    const current = await fixture.repository.get<SourceAuthorityMetadata>(assignment.organizationId, 'source_metadata', sourceMetadataIds[0]);
    if (!current) throw new Error('Policy source missing.');
    const context = testContext('fixture', 'hold-policy-source', after(10));
    const held: SourceAuthorityMetadata = {
      ...current,
      version: current.version + 1,
      updatedAt: context.now,
      updatedBy: 'fixture',
      posture: 'held',
      impact: 'certification_blocked',
      holdReason: 'Controlled policy is under Legal and Compliance review.',
    };
    await fixture.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `fixture.source_hold:${held.id}`,
      request: { posture: held.posture, holdReason: held.holdReason },
      writes: [write('source_metadata', held, current.version)],
      response: held,
      eventType: 'governance.fixture.source_held',
      action: 'fixture.test_only',
      resourceType: 'source_metadata',
      resourceId: held.id,
    }));
    await expect(fixture.academy.startAttempt(testContext('person-chair', 'start-held-source', after(20)), assignment.id))
      .rejects.toThrow(/Source authority blocks certification/i);
  });

  it('scores correct answers on the server and seals completion evidence', async () => {
    const fixture = await createGovernanceTestFixture();
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-passing'),
      { memberId: 'member-chair', moduleId: 'GB-004', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds: academySourceIds('GB-004') },
    );
    let { attempt } = await fixture.academy.startAttempt(testContext('person-chair', 'start-passing'), assignment.id);
    const definition = academyModule('GB-004');
    if (!definition) throw new Error('GB-004 missing.');
    for (const [index, question] of definition.questions.entries()) {
      const result = await fixture.academy.recordAnswer(testContext('person-chair', `answer-pass-${index}`, after(20 + index)), {
        attemptId: attempt.id, expectedVersion: attempt.version, stageId: question.stageId,
        questionId: question.id, answerId: question.correctAnswerId, occurredAt: after(20 + index),
      });
      attempt = result.attempt;
    }
    const task = await fixture.academy.recordTaskEvent(testContext('person-chair', 'task-pass', after(30)), {
      attemptId: attempt.id, expectedVersion: attempt.version, stageId: 'field-guide', taskId: definition.executableTaskIds[0],
      eventType: 'learner_executed', payload: { acknowledged: true }, occurredAt: after(30),
    });
    attempt = await creditMinimumTime(fixture, task.attempt);
    const result = await fixture.academy.submit(testContext('person-chair', 'submit-pass', after(700)), attempt.id, attempt.version);
    expect(result.attempt).toMatchObject({ score: 100, criticalError: false, passed: true, status: 'passed' });
    expect(result.assignment.status).toBe('complete');
    expect(result.evidence?.evidenceSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('requires remediation and cooldown after a critical wrong answer even with all task evidence', async () => {
    const fixture = await createGovernanceTestFixture();
    const assignment = await fixture.academy.assignModule(
      testContext('person-chair', 'assign-remediation'),
      { memberId: 'member-chair', moduleId: 'GB-005', dueAt: '2026-08-31T23:59:59.000Z', sourceMetadataIds: academySourceIds('GB-005') },
    );
    let { attempt } = await fixture.academy.startAttempt(testContext('person-chair', 'start-remediation'), assignment.id);
    const definition = academyModule('GB-005');
    if (!definition) throw new Error('GB-005 missing.');
    for (const [index, question] of definition.questions.entries()) {
      const answerId = index === 0 ? question.criticalAnswerIds[0] : question.correctAnswerId;
      const result = await fixture.academy.recordAnswer(testContext('person-chair', `answer-remediation-${index}`, after(40 + index)), {
        attemptId: attempt.id, expectedVersion: attempt.version, stageId: question.stageId,
        questionId: question.id, answerId, occurredAt: after(40 + index),
      });
      attempt = result.attempt;
    }
    const task = await fixture.academy.recordTaskEvent(testContext('person-chair', 'task-remediation', after(50)), {
      attemptId: attempt.id, expectedVersion: attempt.version, stageId: 'field-guide', taskId: definition.executableTaskIds[0],
      eventType: 'learner_executed', payload: {}, occurredAt: after(50),
    });
    attempt = await creditMinimumTime(fixture, task.attempt);
    const result = await fixture.academy.submit(testContext('person-chair', 'submit-remediation', after(800)), attempt.id, attempt.version);
    expect(result.attempt).toMatchObject({ score: 80, criticalError: true, passed: false, status: 'remediation' });
    expect(result.evidence).toBeNull();
    await expect(fixture.academy.startAttempt(testContext('person-chair', 'restart-during-cooldown', after(900)), assignment.id))
      .rejects.toThrow(/cooldown/i);
  });

  it('keeps every module content version and policy set server-owned', () => {
    expect(new Set(ACADEMY_MODULES.map((module) => module.contentVersion))).toHaveLength(1);
    expect(ACADEMY_MODULES.every((module) => module.policyVersionIds.length > 0)).toBe(true);
  });
});
