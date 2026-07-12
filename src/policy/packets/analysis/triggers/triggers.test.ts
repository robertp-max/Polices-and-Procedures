import { describe, expect, it } from 'vitest';
import type {
  PacketFinding,
  PipEvaluationFactors,
} from '@/policy/packets/contracts';
import {
  createPacketFinding,
  validatePacketFinding,
} from './findingModel';
import {
  evaluateWorkflowTrigger,
  resolveCanonicalWorkflow,
  type TriggerActivationPreconditions,
  type WorkflowTriggerInput,
} from './evaluateTriggers';
import {
  buildTriggerRegisterRows,
  type MaterialNonTriggerDecision,
} from './triggerRegister';
import {
  PIP_CANONICAL_WORKFLOW_ID,
  evaluatePipDecision,
  evaluatePipDecisionBatch,
  type ExistingWorkflowRecord,
  type PipActivationPreconditions,
  type PipDecisionInput,
} from './pipDecisionLogic';
import {
  PERSONNEL_REVIEW_THRESHOLD_MET,
  aggregatePersonnelReviewThresholds,
  containsDisciplineImposedLanguage,
} from './personnelReview';

type TriggerInputOverrides = Omit<Partial<WorkflowTriggerInput>, 'preconditions'> & {
  preconditions?: Partial<TriggerActivationPreconditions>;
};

const basePipFactors: PipEvaluationFactors = {
  materiality: 'Material QAPI indicator variance',
  recurrence: 'Two consecutive quarters',
  trendDuration: 'Q1 through Q2',
  controlLimitBehavior: 'Outside control limit',
  patientSafetyImpact: 'Potential patient-safety impact',
  regulatoryImpact: '42 CFR § 484.65 QAPI impact',
  financialImpact: null,
  crossPatientStaffLocationScope: 'Cross-patient pattern',
  priorCorrectiveActions: 'Local corrections did not sustain',
  existingPipCoverage: null,
  rootCauseEvidence: 'RCA worksheet supports common root issue',
  measurementFeasibility: 'Monthly dashboard can remeasure',
  qapiCommitteeAuthorization: null,
};

function baseFinding(overrides: Partial<PacketFinding> = {}): PacketFinding {
  return {
    findingId: 'finding-1',
    category: 'QAPI trigger',
    description: 'Hospitalization rate exceeded the approved threshold.',
    evidence: ['QAPI dashboard row Q1-001'],
    sourceRecordIds: ['rec-1'],
    sourceFormIds: ['QA-FM-003'],
    materiality: 'Material',
    severity: 'High',
    scope: 'Cross-patient',
    recurrence: 'Recurring',
    currentState: 'Open',
    priorPeriodRelationship: null,
    riskType: 'QAPI',
    recommendedDecision: 'Initiate RCA',
    requiredHumanReviewer: 'QAPI Lead',
    relatedWorkflowTriggerEvaluationIds: [],
    attachmentReferences: ['att-1'],
    ...overrides,
  };
}

function baseTriggerPreconditions(
  overrides: Partial<TriggerActivationPreconditions> = {},
): TriggerActivationPreconditions {
  return {
    agencyValidated: true,
    periodValidated: true,
    evidenceSupportsFinding: true,
    requiredValuesAvailable: true,
    recurrenceConditionsAvailable: true,
    recurrenceSatisfied: true,
    sourceConflictsInvalidateTrigger: false,
    requiredHumanConfirmationExists: true,
    activatingUserHasAuthority: true,
    ...overrides,
  };
}

function triggerInput(overrides: TriggerInputOverrides = {}): WorkflowTriggerInput {
  const preconditions = baseTriggerPreconditions(overrides.preconditions);
  return {
    evaluationId: 'eval-1',
    packetId: 'packet-1',
    parentEventId: 'event-1',
    reportingPeriod: '2026-Q1',
    findingId: 'finding-1',
    sourceRecordIds: ['rec-1'],
    sourceFormIds: ['QA-FM-003'],
    sourceWorkflowIds: ['QA-WF-03'],
    triggerRuleId: 'tr-qapi-1',
    triggerType: 'conditional',
    observedValue: 11,
    numerator: 11,
    denominator: 100,
    threshold: 10,
    thresholdOperator: '>=',
    recurrenceWindow: '2 quarters',
    canonicalWorkflowId: PIP_CANONICAL_WORKFLOW_ID,
    candidateWorkflowId: null,
    candidateConfidence: 'none',
    triggerMet: null,
    ownerRole: null,
    assignedUserId: null,
    approverRoles: [],
    dueDate: null,
    requiredFormIds: [],
    dependencyWorkflowIds: [],
    blockerIds: [],
    existingWorkflowInstanceId: null,
    carryForwardWorkflowInstanceId: null,
    newWorkflowInstanceId: null,
    reviewedBy: 'reviewer-1',
    reviewedAt: '2026-04-09T12:00:00.000Z',
    overrideReason: null,
    determination: null,
    pipEvaluationFactors: null,
    ...overrides,
    preconditions,
  };
}

function pipPreconditions(
  overrides: Partial<PipActivationPreconditions> = {},
): PipActivationPreconditions {
  return {
    agencyValidated: true,
    periodValidated: true,
    evidenceSupportsFinding: true,
    canonicalTriggerResolved: true,
    requiredValuesAndRecurrenceAvailable: true,
    sourceConflictsInvalidateTrigger: false,
    requiredHumanConfirmationExists: true,
    activatingUserHasAuthority: true,
    ...overrides,
  };
}

function pipInput(overrides: Partial<PipDecisionInput> = {}): PipDecisionInput {
  return {
    agencyId: 'agency-1',
    reportingPeriod: '2026-Q1',
    finding: baseFinding(),
    triggerRuleId: 'tr-pip-1',
    canonicalWorkflowId: PIP_CANONICAL_WORKFLOW_ID,
    rootIssueKey: 'hospitalization-rate',
    factors: basePipFactors,
    existingWorkflows: [],
    preconditions: pipPreconditions(),
    requestedDetermination: 'New PIP',
    ...overrides,
  };
}

describe('FR-011 finding model', () => {
  it('requires evidence and source references without inventing defaults', () => {
    const valid = createPacketFinding(baseFinding({ findingId: '  finding-trimmed  ' }));
    expect(valid.findingId).toBe('finding-trimmed');

    const validation = validatePacketFinding(
      baseFinding({ evidence: [], sourceRecordIds: [], sourceFormIds: [] }),
    );
    expect(validation.valid).toBe(false);
    expect(validation.issues.map((issue) => issue.field)).toEqual([
      'evidence',
      'sourceRecordIds',
    ]);
  });
});

describe('FR-012 canonical workflow trigger evaluation', () => {
  it('resolves canonical workflows and fails closed when unresolved', () => {
    const resolved = resolveCanonicalWorkflow(PIP_CANONICAL_WORKFLOW_ID);
    expect(resolved.resolved).toBe(true);
    expect(resolved.workflowTitle).toBe(
      'ANNUAL PERFORMANCE IMPROVEMENT PROJECT (PIP) LIFECYCLE',
    );

    const unresolved = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: 'NO-WF-404',
        candidateWorkflowId: PIP_CANONICAL_WORKFLOW_ID,
        candidateConfidence: 'low',
        newWorkflowInstanceId: 'must-not-activate',
      }),
    );
    expect(unresolved.decisionState).toBe('WORKFLOW UNRESOLVED');
    expect(unresolved.canonicalWorkflowId).toBeNull();
    expect(unresolved.newWorkflowInstanceId).toBeNull();
    expect(unresolved.decisionRationale).toContain(
      'WORKFLOW UNRESOLVED — HUMAN CONFIGURATION REQUIRED',
    );
  });

  it('distinguishes trigger met from trigger not met', () => {
    const met = evaluateWorkflowTrigger(triggerInput());
    expect(met.decisionState).toBe('CONFIRMED — NOT YET ACTIVATED');
    expect(met.validationStatus).toBe('validated');

    const notMet = evaluateWorkflowTrigger(triggerInput({ observedValue: 4 }));
    expect(notMet.decisionState).toBe('NOT TRIGGERED');
    expect(notMet.decisionRationale).toMatch(/below threshold/);
  });

  it('requires recurrence when the trigger rule requires recurrence', () => {
    const recurrenceMissing = evaluateWorkflowTrigger(
      triggerInput({
        observedValue: 12,
        preconditions: { recurrenceSatisfied: false },
      }),
    );
    expect(recurrenceMissing.decisionState).toBe('NOT TRIGGERED');
    expect(recurrenceMissing.decisionRationale).toMatch(/recurrence condition/);
  });

  it('never activates a low-confidence keyword candidate', () => {
    const candidate = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: null,
        candidateWorkflowId: PIP_CANONICAL_WORKFLOW_ID,
        candidateConfidence: 'low',
        triggerMet: true,
        newWorkflowInstanceId: 'wf-new-1',
      }),
    );
    expect(candidate.decisionState).not.toBe('ACTIVATED');
    expect(candidate.decisionState).toBe('WORKFLOW UNRESOLVED');
    expect(candidate.newWorkflowInstanceId).toBeNull();
  });

  it('deduplicates against an existing active workflow', () => {
    const linked = evaluateWorkflowTrigger(
      triggerInput({ existingWorkflowInstanceId: 'wf-existing-1' }),
    );
    expect(linked.decisionState).toBe('LINKED TO EXISTING ACTIVE WORKFLOW');
    expect(linked.existingWorkflowInstanceId).toBe('wf-existing-1');
    expect(linked.newWorkflowInstanceId).toBeNull();
  });

  it('places data-validation gaps on hold instead of activating', () => {
    const hold = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: 'QA-WF-16',
        blockerIds: ['QA-WF-16'],
        preconditions: { requiredValuesAvailable: false },
        newWorkflowInstanceId: 'wf-data-validation',
      }),
    );
    expect(hold.canonicalWorkflowTitle).toBe('QAPI DATA VALIDATION');
    expect(hold.decisionState).toBe('BLOCKED');
    expect(hold.blockerIds).toContain('QA-WF-16');
    expect(hold.newWorkflowInstanceId).toBeNull();
  });

  it('routes Governing Body escalation through the canonical workflow', () => {
    const escalation = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: 'GV-WF-01',
        determination: 'Escalate to Governing Body',
      }),
    );
    expect(escalation.canonicalWorkflowTitle).toBe(
      'GOVERNING BODY QUARTERLY MEETING & MINUTES',
    );
    expect(escalation.decisionState).toBe('ESCALATED');
  });

  it('resolves policy revision and IT change-request workflows canonically', () => {
    const policyRevision = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: 'EN-WF-01',
        triggerRuleId: 'tr-policy-revision',
      }),
    );
    expect(policyRevision.canonicalWorkflowTitle).toBe('POLICY LIFECYCLE');
    expect(policyRevision.requiredFormIds).toContain('EN-FM-008');

    const changeRequest = evaluateWorkflowTrigger(
      triggerInput({
        canonicalWorkflowId: 'IT-WF-14',
        triggerRuleId: 'tr-it-change',
      }),
    );
    expect(changeRequest.canonicalWorkflowTitle).toBe('CHANGE MANAGEMENT');
    expect(changeRequest.requiredFormIds).toContain('IT-FM-037');
  });
});

describe('FR-013 trigger register', () => {
  it('records material non-trigger decisions with rationale', () => {
    const finding = baseFinding({ findingId: 'finding-material-not-met' });
    const nonTrigger: MaterialNonTriggerDecision = {
      findingId: finding.findingId,
      triggerRuleId: 'tr-pip-materiality',
      rationale: 'Materiality reviewed; threshold not met this period.',
      attachmentReferences: ['att-material'],
    };
    const rows = buildTriggerRegisterRows([finding], [], [nonTrigger]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.decisionState).toBe('NOT TRIGGERED');
    expect(rows[0]?.rationale).toBe(nonTrigger.rationale);
    expect(rows[0]?.attachment).toEqual(['att-material']);
  });
});

describe('FR-014 and FR-015 PIP decision logic', () => {
  it('continues an existing PIP for the same root issue instead of creating a new PIP', () => {
    const existing: ExistingWorkflowRecord = {
      instanceId: 'pip-existing-1',
      agencyId: 'agency-1',
      reportingPeriod: '2025-Q4',
      findingId: 'finding-prior',
      triggerRuleId: 'tr-pip-1',
      canonicalWorkflowId: PIP_CANONICAL_WORKFLOW_ID,
      rootIssueKey: 'hospitalization-rate',
      status: 'active',
    };
    const decision = evaluatePipDecision(
      pipInput({
        existingWorkflows: [existing],
        reportingPeriod: '2026-Q1',
      }),
    );
    expect(decision.determination).toBe('Continue existing PIP');
    expect(decision.existingWorkflowInstanceId).toBe('pip-existing-1');
    expect(decision.activationKey).toBeNull();
    expect(decision.newWorkflowRequired).toBe(false);
  });

  it('creates an idempotency key only when PIP is authorized and not deduplicated', () => {
    const decision = evaluatePipDecision(
      pipInput({
        factors: {
          ...basePipFactors,
          qapiCommitteeAuthorization: 'QAPI Committee approved new PIP charter.',
        },
      }),
    );
    expect(decision.determination).toBe('New PIP');
    expect(decision.activationKey?.split('\u001f')).toEqual([
      'agency-1',
      '2026-Q1',
      'finding-1',
      'tr-pip-1',
      PIP_CANONICAL_WORKFLOW_ID,
    ]);
  });

  it('does not turn 8 PIP trigger scenarios into 8 automatic PIPs', () => {
    const inputs = Array.from({ length: 8 }, (_unused, index) =>
      pipInput({
        finding: baseFinding({ findingId: `finding-pip-${String(index + 1)}` }),
        rootIssueKey: `root-${String(index + 1)}`,
        factors: { ...basePipFactors, qapiCommitteeAuthorization: null },
      }),
    );
    const decisions = evaluatePipDecisionBatch(inputs);
    expect(decisions).toHaveLength(8);
    expect(decisions.filter((decision) => decision.determination === 'New PIP')).toHaveLength(0);
    expect(decisions.every((decision) => decision.activationKey === null)).toBe(true);
  });
});

describe('FR-015 personnel-review aggregation', () => {
  it('marks restricted personnel-review threshold without asserting discipline', () => {
    const finding = baseFinding({
      findingId: 'finding-personnel-1',
      category: 'Personnel review',
      requiredHumanReviewer: 'HR',
    });
    const summary = aggregatePersonnelReviewThresholds({
      findings: [finding],
      evaluations: [],
      signals: [
        {
          signalId: 'dt-1',
          findingId: finding.findingId,
          staffMemberId: 'staff-1',
          category: 'Documentation timeliness',
          policyReference: 'HR policy',
          thresholdMet: true,
          rationale: 'Repeat threshold met; HR review required.',
          restricted: true,
        },
      ],
    });

    expect(summary.statement).toBe(PERSONNEL_REVIEW_THRESHOLD_MET);
    expect(summary.confidentiality).toBe('restricted-personnel');
    expect(containsDisciplineImposedLanguage(summary.rationale)).toBe(false);
    expect(containsDisciplineImposedLanguage(JSON.stringify(summary))).toBe(false);
  });
});
