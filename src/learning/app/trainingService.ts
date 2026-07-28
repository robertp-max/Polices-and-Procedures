/**
 * Care Indeed LMS — application service (Wave 2–6 orchestration).
 *
 * Ties the pure domain to the ports: every mutation derives server-side, writes the
 * aggregate, appends an append-only event, and (for async work) enqueues an outbox
 * job. Server-authoritative — no client score/completion is trusted.
 */
import { randomUUID } from 'node:crypto';
import type { LearningEnv } from '../domain/ports';
import { sha256OfJson } from '../domain/hash';
import {
  buildAssignment,
  resolveApplicableRequirements,
} from '../domain/planning';
import { evaluateHeartbeat, type HeartbeatInput } from '../domain/activity';
import {
  APPROVED_PNP_ATTEMPT_POLICY,
  assignAttemptNumber,
  attemptPassed,
  canStartAttemptNow,
  decideGrade,
  ladderAfterFailure,
  scoreResponses,
  type AttemptPolicy,
  type GradePolicy,
} from '../domain/assessment';
import { addSignoff, validateEvidence } from '../domain/evidence';
import { evaluateGate, stateVectorFingerprint, type GateDefinition, type GateStateVector } from '../domain/gates';
import {
  assertCertificateEligible,
  buildCertificateManifest,
  issuanceKey,
  manifestFingerprint,
  publicVerificationView,
  resolveIdempotentIssuance,
} from '../domain/certificates';
import type {
  AssessmentAttempt,
  CertificateRecord,
  CompletionEvidence,
  GateDecision,
  GradeResult,
  LearningActivityEvent,
  ScoreResult,
  SignoffRecord,
} from '../domain/types';

// Collision-safe across instances/restarts (a process-local counter is neither).
const id = (p: string) => `${p}-${randomUUID()}`;

export class TrainingService {
  constructor(private env: LearningEnv) {}

  private async emit(
    subjectId: string,
    assignmentId: string,
    eventType: string,
    payload: Record<string, unknown>,
    idempotencyKey: string,
  ): Promise<void> {
    const nowIso = this.env.clock.now().toISOString();
    const event: LearningActivityEvent = {
      id: id('evt'),
      tenantId: 'careindeed',
      subjectId,
      actorSubjectId: subjectId,
      assignmentId,
      eventType,
      eventVersion: 1,
      occurredAt: nowIso,
      receivedAt: nowIso,
      idempotencyKey,
      correlationId: idempotencyKey,
      payload,
      payloadSha256: sha256OfJson(payload),
    };
    await this.env.events.append(event);
  }

  /** Resolve role/duty requirements → version-pinned assignments (server-derived). */
  async provisionAssignments(subjectId: string): Promise<void> {
    const now = this.env.clock.now();
    const roles = await this.env.records.getRoleAssignments(subjectId);
    const published = await this.env.records.listPublishedRequirements();
    const applicable = resolveApplicableRequirements({ subjectId, roleAssignments: roles }, published, now);
    const satisfied = new Set<string>();
    for (const requirement of applicable) {
      const content = requirement.contentRef
        ? await this.env.content.resolve(requirement.contentRef.id, requirement.contentRef.version)
        : null;
      const assignment = buildAssignment({
        subjectId,
        roleAssignmentIds: roles.map((r) => r.id),
        requirement,
        content,
        satisfiedRequirementIds: satisfied,
        assignedAt: now.toISOString(),
        availableAt: now.toISOString(),
        idFactory: () => id('as'),
      });
      await this.env.records.putAssignment(assignment);
      await this.emit(subjectId, assignment.id, 'assignment.created', { requirement: requirement.id, status: assignment.status }, `prov:${subjectId}:${requirement.id}`);
    }
  }

  /** Validate an active-time heartbeat (server decides the accepted increment). */
  async heartbeat(input: HeartbeatInput) {
    return evaluateHeartbeat(input);
  }

  /** Start an assessment attempt if the start gate allows (limit + cooldown + reauth). */
  async startAttempt(
    subjectId: string,
    assignmentId: string,
    opts: { policy?: AttemptPolicy; cooldownUntil?: string; activeReattemptAuthorization?: boolean } = {},
  ): Promise<{ attempt?: AssessmentAttempt; refused?: string }> {
    const policy = opts.policy ?? APPROVED_PNP_ATTEMPT_POLICY;
    const existing = await this.env.records.listAttempts(assignmentId);
    const ordinary = existing.filter((a) => !a.reattemptAuthorizationId).length;
    const gate = canStartAttemptNow({
      policy,
      usedOrdinaryAttempts: ordinary,
      cooldownUntil: opts.cooldownUntil,
      activeReattemptAuthorization: !!opts.activeReattemptAuthorization,
      now: this.env.clock.now(),
    });
    if (!gate.allowed) return { refused: gate.reason };
    const attempt: AssessmentAttempt = {
      id: id('at'),
      assignmentId,
      assessmentDefinitionRef: { id: 'ASMT', version: 1 },
      attemptNumber: assignAttemptNumber(existing),
      startedAt: this.env.clock.now().toISOString(),
      status: 'STARTED',
      reattemptAuthorizationId: opts.activeReattemptAuthorization ? id('ra') : undefined,
    };
    await this.env.records.appendAttempt(attempt);
    await this.emit(subjectId, assignmentId, 'assessment.started', { attempt: attempt.attemptNumber }, `start:${attempt.id}`);
    return { attempt };
  }

  /** Submit responses → server score → grade (+ ladder on failure). */
  async submitAttempt(input: {
    subjectId: string;
    assignmentId: string;
    attempt: AssessmentAttempt;
    responses: Record<string, string>;
    answerKey: Record<string, string>;
    criticalQuestionIds?: string[];
    policy?: AttemptPolicy;
    gradePolicy?: GradePolicy;
  }): Promise<{ passed: boolean; grade: GradeResult; ladder?: ReturnType<typeof ladderAfterFailure> }> {
    const policy = input.policy ?? APPROVED_PNP_ATTEMPT_POLICY;
    const gradePolicy = input.gradePolicy ?? { id: 'GP', version: 1, selectionPolicy: 'LATEST_PASS' as const };
    const raw = scoreResponses({ responses: input.responses, answerKey: input.answerKey, criticalQuestionIds: input.criticalQuestionIds });
    const passed = attemptPassed(raw, policy.passThresholdPct);

    const score: ScoreResult = {
      id: id('sc'),
      attemptId: input.attempt.id,
      rawEarned: raw.rawEarned,
      rawPossible: raw.rawPossible,
      percentage: raw.percentage,
      criticalFailureCodes: raw.criticalFailureCodes,
      scoredAt: this.env.clock.now().toISOString(),
      scoringEngineVersion: '1',
      resultSha256: sha256OfJson({ attemptId: input.attempt.id, rawEarned: raw.rawEarned, rawPossible: raw.rawPossible, percentage: raw.percentage, criticalFailureCodes: raw.criticalFailureCodes }),
    };
    await this.env.records.putScore(score);

    const allAttempts = await this.env.records.listAttempts(input.assignmentId);
    const scoresByAttempt = new Map<string, ScoreResult>([[input.attempt.id, score]]);
    const gradable = allAttempts.map((a) => {
      const s = a.id === input.attempt.id ? score : scoresByAttempt.get(a.id);
      const pct = s ? s.percentage ?? 0 : 0;
      const p = s ? s.criticalFailureCodes.length === 0 && pct >= policy.passThresholdPct : false;
      return { attemptId: a.id, attemptNumber: a.attemptNumber, passed: p, percentage: pct };
    });
    const decided = decideGrade(gradable, gradePolicy);
    const grade: GradeResult = {
      id: id('gr'),
      assignmentId: input.assignmentId,
      gradePolicyRef: { id: gradePolicy.id, version: gradePolicy.version },
      selectedAttemptId: decided.selectedAttemptId,
      outcome: decided.outcome,
      displayedScore: decided.displayedScore,
      reasonCodes: raw.criticalFailureCodes,
      decidedAt: this.env.clock.now().toISOString(),
      decisionSha256: sha256OfJson({ assignmentId: input.assignmentId, selectedAttemptId: decided.selectedAttemptId, outcome: decided.outcome, displayedScore: decided.displayedScore }),
    };
    await this.env.records.putGrade(grade);
    await this.emit(input.subjectId, input.assignmentId, passed ? 'assessment.passed' : 'assessment.failed', { attempt: input.attempt.attemptNumber, pct: raw.percentage }, `submit:${input.attempt.id}`);

    if (!passed) {
      const ordinary = allAttempts.filter((a) => !a.reattemptAuthorizationId).length;
      const ladder = ladderAfterFailure(ordinary, policy);
      return { passed, grade, ladder };
    }
    return { passed, grade };
  }

  /** Validate uploaded evidence (artifact-backed) and record a signoff (distinct-human). */
  async validateEvidence(evidence: CompletionEvidence, validatedBy: string, hasArtifact: boolean): Promise<CompletionEvidence> {
    const validated = validateEvidence({ evidence, validatedBy, hasArtifact, now: this.env.clock.now() });
    await this.env.records.putEvidence(validated);
    await this.emit(validated.subjectId, validated.assignmentId ?? '', 'evidence.validated', { evidence: validated.id }, `ev:${validated.id}`);
    return validated;
  }

  async recordSignoff(assignmentId: string, candidate: SignoffRecord): Promise<{ accepted: boolean; reason?: string }> {
    const existing = await this.env.records.listSignoffs(assignmentId);
    const res = addSignoff({ existing, candidate });
    if (!res.accepted) return { accepted: false, reason: res.reason };
    await this.env.records.putSignoff(candidate);
    await this.emit(candidate.subjectId, assignmentId, 'signoff.completed', { slot: candidate.signerSlot }, `so:${candidate.id}`);
    return { accepted: true };
  }

  /** Evaluate a gate over a server-assembled state vector and sign the decision. */
  async evaluateAndSignGate(def: GateDefinition, subjectId: string, state: GateStateVector, hasActiveOverride = false): Promise<GateDecision> {
    const evalResult = evaluateGate(def, state, hasActiveOverride);
    const fingerprint = evalResult.stateVectorFingerprint;
    const signature = evalResult.outcome === 'PASS' ? await this.env.signer.sign(fingerprint) : '';
    const decision: GateDecision = {
      id: id('gd'),
      gateDefinitionRef: { id: def.id, version: def.version },
      gateType: def.gateType,
      subjectId,
      evaluatedAt: this.env.clock.now().toISOString(),
      inputAssignmentIds: Object.keys(state.assignmentStatuses),
      inputEvidenceIds: [...state.validEvidenceSpecIds],
      inputSignoffIds: [...state.presentSignoffSlots],
      inputGradeIds: Object.keys(state.gradeOutcomes),
      stateVectorSha256: fingerprint,
      outcome: evalResult.outcome,
      reasonCodes: evalResult.reasonCodes,
      assertionSignature: signature,
      evaluatorVersion: '1',
    };
    await this.env.records.putGateDecision(decision);
    await this.emit(subjectId, '', 'gate.evaluated', { gate: def.id, outcome: decision.outcome }, `gate:${decision.id}`);
    return decision;
  }

  /** Issue a certificate from a signed PASS eligibility gate (idempotent). */
  async issueCertificate(input: {
    subjectId: string;
    gate: GateDecision;
    certificateDefinitionId: string;
    certificateDefinitionVersion: number;
    cycleOrPlanId?: string;
    eligibilitySnapshotSha256: string;
    templateId: string;
    templateVersion: string;
    approvedLogoSha256: string;
    rendererVersion: string;
    assignmentIds: string[];
    gradeIds: string[];
    evidenceIds: string[];
    signoffIds: string[];
  }): Promise<{ certificate?: CertificateRecord; refused?: string; reused?: boolean }> {
    const eligible = assertCertificateEligible(input.gate, this.env.clock.now());
    if (!eligible.ok) return { refused: eligible.reason };
    // Cryptographic check, not just nonempty: the gate's signature must verify against
    // the signer's key over the recorded state-vector fingerprint before it can be consumed.
    const gateSignatureValid = await this.env.signer.verify(input.gate.stateVectorSha256, input.gate.assertionSignature);
    if (!gateSignatureValid) return { refused: 'GATE_SIGNATURE_INVALID' };

    const key = issuanceKey({
      subjectId: input.subjectId,
      certificateDefinitionId: input.certificateDefinitionId,
      certificateDefinitionVersion: input.certificateDefinitionVersion,
      cycleOrPlanId: input.cycleOrPlanId ?? '',
      eligibilitySnapshotSha256: input.eligibilitySnapshotSha256,
    });
    const subjectCerts = await this.env.records.listCertificates(input.subjectId);
    const byKey = new Map(subjectCerts.map((c) => [issuanceKey({
      subjectId: c.subjectId,
      certificateDefinitionId: c.certificateDefinitionRef.id,
      certificateDefinitionVersion: Number(c.certificateDefinitionRef.version),
      cycleOrPlanId: '',
      eligibilitySnapshotSha256: c.eligibilitySnapshotSha256,
    }), c]));
    const resolved = resolveIdempotentIssuance(key, byKey);
    if (resolved.action === 'RETURN_EXISTING') return { certificate: resolved.existing, reused: true };

    const publicId = id('PUB');
    const manifest = buildCertificateManifest({
      publicId,
      certificateDefinitionRef: { id: input.certificateDefinitionId, version: input.certificateDefinitionVersion },
      subjectId: input.subjectId,
      gateDecisionId: input.gate.id,
      eligibilitySnapshotSha256: input.eligibilitySnapshotSha256,
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      approvedLogoSha256: input.approvedLogoSha256,
      rendererVersion: input.rendererVersion,
      assignmentIds: input.assignmentIds,
      gradeIds: input.gradeIds,
      evidenceIds: input.evidenceIds,
      signoffIds: input.signoffIds,
      policyVersions: [],
      issuedAt: this.env.clock.now().toISOString(),
    });
    const fingerprint = manifestFingerprint(manifest);
    const manifestSignature = await this.env.signer.sign(fingerprint);
    const manifestBytes = new TextEncoder().encode(JSON.stringify({ manifest, fingerprint, signature: manifestSignature }));
    const staged = await this.env.artifacts.putStaging(`manifest/${publicId}.json`, manifestBytes, 'application/json');
    const promoted = await this.env.artifacts.promote(staged.locator);

    const certificate: CertificateRecord = {
      id: id('cert'),
      publicId,
      certificateDefinitionRef: { id: input.certificateDefinitionId, version: input.certificateDefinitionVersion },
      subjectId: input.subjectId,
      roleAssignmentIds: [],
      gateDecisionId: input.gate.id,
      eligibilitySnapshotSha256: input.eligibilitySnapshotSha256,
      assignmentIds: input.assignmentIds,
      policyVersions: [],
      gradeIds: input.gradeIds,
      evidenceIds: input.evidenceIds,
      signoffIds: input.signoffIds,
      issuedAt: this.env.clock.now().toISOString(),
      issuedBy: 'SYSTEM',
      artifactEvidenceId: promoted.locator,
      manifestArtifactEvidenceId: `${promoted.locator}#${fingerprint}`,
      manifestSignature,
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      status: 'ACTIVE',
    };
    await this.env.records.putCertificate(certificate);
    await this.env.jobs.enqueue('certificate-render', { publicId, manifestLocator: promoted.locator }, `cert:${publicId}`);
    await this.emit(input.subjectId, '', 'certificate.issued', { publicId }, `cert:${publicId}`);
    return { certificate };
  }

  async listAssignments(subjectId: string) {
    return this.env.records.listAssignments(subjectId);
  }
  async getAssignment(subjectId: string, assignmentId: string) {
    return this.env.records.getAssignment(subjectId, assignmentId);
  }
  listCertificatesFor(subjectId: string) {
    return this.env.records.listCertificates(subjectId);
  }

  async publicVerify(publicId: string, title: string, issuer: string, learnerDisplayName: string) {
    const record = await this.env.records.getCertificateByPublicId(publicId);
    if (!record) return null;
    return publicVerificationView({ record, title, issuer, learnerDisplayName });
  }

  gateStateFingerprint(state: GateStateVector): string {
    return stateVectorFingerprint(state);
  }
}
