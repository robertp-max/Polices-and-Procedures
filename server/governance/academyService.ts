import { ApiError } from '../errors.js';
import {
  ACADEMY_CONTENT_VERSION,
  ACADEMY_COOLDOWN_HOURS,
  ACADEMY_MAX_ATTEMPTS,
  ACADEMY_MODULES,
  ACADEMY_PASS_PERCENT,
  academyModule,
  publicAcademyModule,
  scoreAcademyAnswers,
} from './academyBank.js';
import { requireGovernanceAction } from './authority.js';
import type {
  AcademyAnswerEvent,
  AcademyAssignment,
  AcademyAttempt,
  AcademyCompletionEvidence,
  AcademyTaskEvent,
  SourceAuthorityMetadata,
} from './contracts.js';
import {
  governanceMutation,
  mutationContext,
  newRecordBase,
  nextRecordBase,
  write,
  type CommandContext,
} from './mutations.js';
import { manifestSha256 } from './adapters.js';
import type { GovernanceRepository } from './repository.js';
import type { GovernanceMeetingService } from './meetingService.js';
import { requireSourceGate } from './sourcePosture.js';

function ensure(condition: unknown, message: string, status = 409): asserts condition {
  if (!condition) throw new ApiError('validation_error', message, status);
}

export class GovernanceAcademyService {
  constructor(
    private readonly repository: GovernanceRepository,
    private readonly meetings: GovernanceMeetingService,
  ) {}

  catalog() {
    return ACADEMY_MODULES.map((module) => ({
      id: module.id,
      sequence: module.sequence,
      title: module.title,
      shortTitle: module.shortTitle,
      domain: module.domain,
      durationMinutes: module.durationMinutes,
      contentVersion: module.contentVersion,
      sceneCount: module.requiredStageIds.length,
      executableTaskCount: module.executableTaskIds.length,
    }));
  }

  module(moduleId: string) {
    const module = publicAcademyModule(moduleId);
    if (!module) throw new ApiError('not_found', 'Academy module not found.', 404);
    return module;
  }

  async assignModule(context: CommandContext, input: { memberId: string; moduleId: string; dueAt: string; sourceMetadataIds: string[] }): Promise<AcademyAssignment> {
    const state = await this.meetings.authorityState(context.organizationId);
    requireGovernanceAction(context.actor, 'decision.record_disposition', {}, state, context.now);
    const member = state.members.find((candidate) => candidate.id === input.memberId && candidate.status === 'active');
    ensure(member, 'Academy assignment requires an active appointed Board member.');
    ensure(input.dueAt > context.now, 'Academy assignment due date must be in the future.');
    const module = academyModule(input.moduleId);
    ensure(module, 'Academy module not found.');
    const sources = await this.loadSources(context.organizationId, input.sourceMetadataIds);
    requireSourceGate(sources, 'certification');
    ensure(module.policyVersionIds.every((policyId) => sources.some((source) => source.sourceRecordId === policyId)), 'Academy source metadata does not cover every controlled policy in the module.');
    const existing = (await this.repository.list<AcademyAssignment>(context.organizationId, 'academy_assignment'))
      .find((assignment) => assignment.memberId === input.memberId
        && assignment.moduleId === input.moduleId
        && ['assigned', 'in_progress', 'remediation', 'complete'].includes(assignment.status)
        && assignment.contentVersion === module.contentVersion);
    ensure(!existing, 'A current assignment already exists for this member and module.');
    const assignment: AcademyAssignment = {
      ...newRecordBase(context),
      memberId: input.memberId,
      moduleId: input.moduleId,
      contentVersion: module.contentVersion,
      policyVersionIds: [...module.policyVersionIds],
      sourceMetadataIds: sources.map((source) => source.id).sort(),
      assignedAt: context.now,
      dueAt: input.dueAt,
      status: 'assigned',
    };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.assign:${input.memberId}:${input.moduleId}:${module.contentVersion}`,
      request: input,
      writes: [write('academy_assignment', assignment, null)],
      response: assignment,
      eventType: 'governance.academy.assigned',
      action: 'decision.record_disposition',
      resourceType: 'academy_assignment',
      resourceId: assignment.id,
      payload: { memberId: input.memberId, moduleId: input.moduleId, contentVersion: module.contentVersion, policyVersionIds: module.policyVersionIds, sourceMetadataIds: assignment.sourceMetadataIds, dueAt: input.dueAt },
    }));
  }

  async startAttempt(context: CommandContext, assignmentId: string): Promise<{ attempt: AcademyAttempt; module: ReturnType<typeof publicAcademyModule> }> {
    const assignment = await this.requireAssignment(context.organizationId, assignmentId);
    const state = await this.meetings.authorityState(context.organizationId);
    const authority = requireGovernanceAction(context.actor, 'academy.attempt', {}, state, context.now);
    ensure(authority.memberId === assignment.memberId, 'Academy assignment is not bound to the current Board member.', 403);
    ensure(['assigned', 'in_progress', 'remediation'].includes(assignment.status), 'Academy assignment is not open.');
    ensure(assignment.dueAt > context.now, 'Academy assignment has expired.');
    ensure(assignment.contentVersion === ACADEMY_CONTENT_VERSION, 'Academy content version changed; reassignment is required.');
    const definition = academyModule(assignment.moduleId);
    ensure(definition, 'Academy module definition is unavailable.');
    ensure(
      assignment.policyVersionIds.length === definition.policyVersionIds.length
      && assignment.policyVersionIds.every((id) => definition.policyVersionIds.includes(id)),
      'Assigned policy versions do not match the current module.',
    );
    const assignmentSources = await this.loadSources(context.organizationId, assignment.sourceMetadataIds);
    requireSourceGate(assignmentSources, 'certification');
    const attempts = (await this.repository.list<AcademyAttempt>(context.organizationId, 'academy_attempt'))
      .filter((attempt) => attempt.assignmentId === assignment.id)
      .sort((a, b) => a.attemptNumber - b.attemptNumber);
    const current = attempts.find((attempt) => attempt.status === 'in_progress');
    if (current) return { attempt: current, module: publicAcademyModule(definition.id) };
    ensure(attempts.length < ACADEMY_MAX_ATTEMPTS, 'Maximum Academy attempts reached; Board Secretary review is required.');
    const latest = attempts.at(-1);
    ensure(!latest?.cooldownUntil || latest.cooldownUntil <= context.now, 'Academy remediation cooldown remains active.');
    const attempt: AcademyAttempt = {
      ...newRecordBase(context),
      assignmentId: assignment.id,
      memberId: assignment.memberId,
      moduleId: assignment.moduleId,
      contentVersion: assignment.contentVersion,
      policyVersionIds: [...assignment.policyVersionIds],
      sourceMetadataIds: [...assignment.sourceMetadataIds],
      attemptNumber: attempts.length + 1,
      status: 'in_progress',
      startedAt: context.now,
      lastHeartbeatAt: context.now,
      activeSeconds: 0,
      completedStageIds: [],
      answerEventIds: [],
      taskEventIds: [],
      score: null,
      criticalError: null,
      passed: null,
      submittedAt: null,
      cooldownUntil: null,
      completionEvidenceArtifactId: null,
    };
    const updatedAssignment: AcademyAssignment = {
      ...assignment,
      ...nextRecordBase(context, assignment),
      status: 'in_progress',
    };
    const response = { attempt, module: publicAcademyModule(definition.id) };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.start:${assignment.id}:${attempt.attemptNumber}`,
      request: { assignmentId },
      writes: [
        write('academy_attempt', attempt, null),
        write('academy_assignment', updatedAssignment, assignment.version),
      ],
      response,
      eventType: 'governance.academy.attempt_started',
      action: 'academy.attempt',
      resourceType: 'academy_attempt',
      resourceId: attempt.id,
      payload: { assignmentId: assignment.id, moduleId: attempt.moduleId, attemptNumber: attempt.attemptNumber, contentVersion: attempt.contentVersion },
    }));
  }

  async recordAnswer(context: CommandContext, input: {
    attemptId: string;
    expectedVersion: number;
    stageId: string;
    questionId: string;
    answerId: string;
    occurredAt: string;
  }): Promise<{ attempt: AcademyAttempt; answerEvent: AcademyAnswerEvent }> {
    const attempt = await this.requireAttempt(context.organizationId, input.attemptId);
    await this.requireAttemptAuthority(context, attempt);
    ensure(attempt.version === input.expectedVersion, 'Academy attempt version conflict.');
    ensure(attempt.status === 'in_progress', 'Academy attempt is not open.');
    const module = academyModule(attempt.moduleId);
    ensure(module && module.contentVersion === attempt.contentVersion, 'Academy content version changed during the attempt.');
    const question = module.questions.find((candidate) => candidate.id === input.questionId);
    ensure(question && question.stageId === input.stageId, 'Question does not belong to the submitted stage.');
    ensure(question.answers.some((answer) => answer.id === input.answerId), 'Answer option is invalid.');
    ensure(input.occurredAt >= attempt.startedAt && input.occurredAt <= new Date(Date.parse(context.now) + 10_000).toISOString(), 'Answer timestamp is outside the attempt window.');
    const answer: AcademyAnswerEvent = {
      ...newRecordBase(context),
      attemptId: attempt.id,
      stageId: input.stageId,
      questionId: input.questionId,
      answerId: input.answerId,
      occurredAt: input.occurredAt,
    };
    const answered = (await this.repository.list<AcademyAnswerEvent>(context.organizationId, 'academy_answer_event'))
      .filter((event) => event.attemptId === attempt.id && event.questionId !== input.questionId);
    const completedStageIds = [...new Set([
      ...attempt.completedStageIds,
      ...[...answered, answer].map((event) => event.stageId),
    ])];
    const updated: AcademyAttempt = {
      ...attempt,
      ...nextRecordBase(context, attempt),
      answerEventIds: [...attempt.answerEventIds, answer.id],
      completedStageIds,
    };
    const response = { attempt: updated, answerEvent: answer };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.answer:${attempt.id}:${input.questionId}`,
      request: input,
      writes: [write('academy_attempt', updated, attempt.version), write('academy_answer_event', answer, null)],
      response,
      eventType: 'governance.academy.answer_recorded',
      action: 'academy.attempt',
      resourceType: 'academy_answer_event',
      resourceId: answer.id,
      payload: { attemptId: attempt.id, moduleId: attempt.moduleId, stageId: answer.stageId, questionId: answer.questionId },
    }));
  }

  async recordTaskEvent(context: CommandContext, input: {
    attemptId: string;
    expectedVersion: number;
    stageId: string;
    taskId: string;
    eventType: string;
    payload: Record<string, string | number | boolean | null>;
    occurredAt: string;
  }): Promise<{ attempt: AcademyAttempt; taskEvent: AcademyTaskEvent }> {
    const attempt = await this.requireAttempt(context.organizationId, input.attemptId);
    await this.requireAttemptAuthority(context, attempt);
    ensure(attempt.version === input.expectedVersion, 'Academy attempt version conflict.');
    ensure(attempt.status === 'in_progress', 'Academy attempt is not open.');
    const module = academyModule(attempt.moduleId);
    ensure(module, 'Academy module is unavailable.');
    ensure(module.requiredStageIds.includes(input.stageId as never), 'Academy stage is invalid.');
    ensure(module.executableTaskIds.includes(input.taskId), 'Academy task is not part of this module.');
    if (attempt.moduleId === 'GB-003') {
      const prior = (await this.repository.list<AcademyTaskEvent>(context.organizationId, 'academy_task_event'))
        .filter((event) => event.attemptId === attempt.id);
      const expectedIndex = Math.min(prior.length, module.executableTaskIds.length - 1);
      ensure(module.executableTaskIds[expectedIndex] === input.taskId, 'GB-003 meeting simulation tasks must be completed in controlled order.');
    }
    const taskEvent: AcademyTaskEvent = {
      ...newRecordBase(context),
      attemptId: attempt.id,
      stageId: input.stageId,
      taskId: input.taskId,
      eventType: input.eventType,
      payload: { ...input.payload },
      occurredAt: input.occurredAt,
    };
    const updated: AcademyAttempt = {
      ...attempt,
      ...nextRecordBase(context, attempt),
      taskEventIds: [...attempt.taskEventIds, taskEvent.id],
    };
    const response = { attempt: updated, taskEvent };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.task:${attempt.id}:${input.taskId}:${attempt.taskEventIds.length}`,
      request: input,
      writes: [write('academy_attempt', updated, attempt.version), write('academy_task_event', taskEvent, null)],
      response,
      eventType: 'governance.academy.task_recorded',
      action: 'academy.attempt',
      resourceType: 'academy_task_event',
      resourceId: taskEvent.id,
      payload: { attemptId: attempt.id, moduleId: attempt.moduleId, stageId: input.stageId, taskId: input.taskId, eventType: input.eventType },
    }));
  }

  async heartbeat(context: CommandContext, input: {
    attemptId: string;
    expectedVersion: number;
    occurredAt: string;
    visible: boolean;
    focused: boolean;
    recentActivity: boolean;
  }): Promise<AcademyAttempt> {
    const attempt = await this.requireAttempt(context.organizationId, input.attemptId);
    await this.requireAttemptAuthority(context, attempt);
    ensure(attempt.version === input.expectedVersion, 'Academy attempt version conflict.');
    ensure(attempt.status === 'in_progress', 'Academy attempt is not open.');
    const occurred = Date.parse(input.occurredAt);
    const serverNow = Date.parse(context.now);
    const previous = Date.parse(attempt.lastHeartbeatAt);
    ensure(Number.isFinite(occurred) && occurred >= previous && occurred <= serverNow + 10_000, 'Heartbeat timestamp is invalid.');
    const rawDelta = Math.floor((occurred - previous) / 1_000);
    const credited = input.visible && input.focused && input.recentActivity && rawDelta > 0 && rawDelta <= 90
      ? Math.min(rawDelta, 30)
      : 0;
    const updated: AcademyAttempt = {
      ...attempt,
      ...nextRecordBase(context, attempt),
      lastHeartbeatAt: input.occurredAt,
      activeSeconds: attempt.activeSeconds + credited,
    };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.heartbeat:${attempt.id}:${attempt.version}`,
      request: input,
      writes: [write('academy_attempt', updated, attempt.version)],
      response: updated,
      eventType: 'governance.academy.heartbeat',
      action: 'academy.attempt',
      resourceType: 'academy_attempt',
      resourceId: attempt.id,
      payload: { creditedSeconds: credited, visible: input.visible, focused: input.focused, recentActivity: input.recentActivity },
    }));
  }

  async submit(context: CommandContext, attemptId: string, expectedVersion: number): Promise<{ attempt: AcademyAttempt; assignment: AcademyAssignment; evidence: AcademyCompletionEvidence | null }> {
    const attempt = await this.requireAttempt(context.organizationId, attemptId);
    await this.requireAttemptAuthority(context, attempt);
    ensure(attempt.version === expectedVersion, 'Academy attempt version conflict.');
    ensure(attempt.status === 'in_progress', 'Academy attempt is not open.');
    const assignment = await this.requireAssignment(context.organizationId, attempt.assignmentId);
    const module = academyModule(attempt.moduleId);
    ensure(module && attempt.contentVersion === ACADEMY_CONTENT_VERSION && assignment.contentVersion === ACADEMY_CONTENT_VERSION, 'Academy content version changed; attempt cannot be certified.');
    const sources = await this.loadSources(context.organizationId, attempt.sourceMetadataIds);
    requireSourceGate(sources, 'certification');
    const answers = (await this.repository.list<AcademyAnswerEvent>(context.organizationId, 'academy_answer_event'))
      .filter((event) => event.attemptId === attempt.id)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    const tasks = (await this.repository.list<AcademyTaskEvent>(context.organizationId, 'academy_task_event'))
      .filter((event) => event.attemptId === attempt.id);
    const scored = scoreAcademyAnswers(attempt.moduleId, answers.map((answer) => ({ questionId: answer.questionId, answerId: answer.answerId })));
    ensure(scored.answered === scored.required, 'Every server-owned assessment question must be answered.');
    ensure(module.requiredStageIds.every((stage) => attempt.completedStageIds.includes(stage)), 'Every required learning stage must be completed.');
    ensure(module.executableTaskIds.every((taskId) => tasks.some((task) => task.taskId === taskId)), 'Every required executable task must be completed.');
    const sufficientTime = attempt.activeSeconds >= module.minimumActiveSeconds;
    const passed = scored.score >= ACADEMY_PASS_PERCENT && !scored.criticalError && sufficientTime;
    const cooldownUntil = passed ? null : new Date(Date.parse(context.now) + ACADEMY_COOLDOWN_HOURS * 60 * 60 * 1_000).toISOString();
    let evidence: AcademyCompletionEvidence | null = null;
    if (passed) {
      const evidenceBase = {
        assignmentId: assignment.id,
        attemptId: attempt.id,
        memberId: attempt.memberId,
        moduleId: attempt.moduleId,
        contentVersion: attempt.contentVersion,
        policyVersionIds: [...attempt.policyVersionIds],
        sourceMetadataIds: [...attempt.sourceMetadataIds],
        score: scored.score,
        criticalError: scored.criticalError,
        activeSeconds: attempt.activeSeconds,
        answerEventIds: answers.map((answer) => answer.id),
        taskEventIds: tasks.map((task) => task.id),
        completedAt: context.now,
      };
      evidence = {
        ...newRecordBase(context),
        ...evidenceBase,
        evidenceSha256: manifestSha256(evidenceBase),
      };
    }
    const updatedAttempt: AcademyAttempt = {
      ...attempt,
      ...nextRecordBase(context, attempt),
      status: passed ? 'passed' : 'remediation',
      score: scored.score,
      criticalError: scored.criticalError,
      passed,
      submittedAt: context.now,
      cooldownUntil,
      completionEvidenceArtifactId: evidence?.id ?? null,
    };
    const updatedAssignment: AcademyAssignment = {
      ...assignment,
      ...nextRecordBase(context, assignment),
      status: passed ? 'complete' : 'remediation',
    };
    const response = { attempt: updatedAttempt, assignment: updatedAssignment, evidence };
    return this.repository.transact(mutationContext(context), governanceMutation({
      context,
      scope: `academy.submit:${attempt.id}`,
      request: { attemptId, expectedVersion },
      writes: [
        write('academy_attempt', updatedAttempt, attempt.version),
        write('academy_assignment', updatedAssignment, assignment.version),
        ...(evidence ? [write('academy_completion_evidence', evidence, null)] : []),
      ],
      response,
      eventType: passed ? 'governance.academy.completed' : 'governance.academy.remediation_required',
      action: 'academy.attempt',
      resourceType: 'academy_attempt',
      resourceId: attempt.id,
      payload: {
        moduleId: attempt.moduleId,
        contentVersion: attempt.contentVersion,
        score: scored.score,
        criticalError: scored.criticalError,
        activeSeconds: attempt.activeSeconds,
        minimumActiveSeconds: module.minimumActiveSeconds,
        passed,
        evidenceSha256: evidence?.evidenceSha256 ?? null,
      },
    }));
  }

  private async requireAttemptAuthority(context: CommandContext, attempt: AcademyAttempt): Promise<void> {
    const state = await this.meetings.authorityState(context.organizationId);
    const authority = requireGovernanceAction(context.actor, 'academy.attempt', {}, state, context.now);
    ensure(authority.memberId === attempt.memberId, 'Academy attempt is not bound to the current Board member.', 403);
  }

  private async requireAssignment(organizationId: string, id: string): Promise<AcademyAssignment> {
    const assignment = await this.repository.get<AcademyAssignment>(organizationId, 'academy_assignment', id);
    if (!assignment) throw new ApiError('not_found', 'Academy assignment not found.', 404);
    return assignment;
  }

  private async requireAttempt(organizationId: string, id: string): Promise<AcademyAttempt> {
    const attempt = await this.repository.get<AcademyAttempt>(organizationId, 'academy_attempt', id);
    if (!attempt) throw new ApiError('not_found', 'Academy attempt not found.', 404);
    return attempt;
  }

  private async loadSources(organizationId: string, sourceMetadataIds: string[]): Promise<SourceAuthorityMetadata[]> {
    const unique = [...new Set(sourceMetadataIds)];
    const sources = await Promise.all(unique.map((id) => this.repository.get<SourceAuthorityMetadata>(organizationId, 'source_metadata', id)));
    ensure(sources.length > 0 && sources.every(Boolean), 'Academy source authority metadata is unavailable.');
    return sources as SourceAuthorityMetadata[];
  }
}
