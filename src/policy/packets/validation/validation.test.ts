// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type {
  PacketEnvelope,
  PacketInstance,
  PacketModel,
  WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';
import type { CalculatedKpi } from '@/policy/packets/analysis/kpi/calculateKpis';
import { segmentSourceFile } from '@/policy/packets/sources/segmentSources';
import type { SourceFormUtilizationReport } from '@/policy/packets/sources/sourceUtilization';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS as E,
  QAPI_FIXTURE_PATHS,
} from '@/policy/packets/testing/loadQapiFixture';
import type { PacketForLock } from '@/policy/qapi/validateQapiPacketForLock';

import { validatePacket } from './validatePacket';
import type { ExpectedReportingPeriod, ValidatePacketOptions } from './validatePacket';

const EXPECTED_PERIOD: ExpectedReportingPeriod = {
  start: E.periodStart,
  end: E.periodEnd,
  label: E.quarter,
};

describe('validatePacket FR-024 validation engine', () => {
  it('identity/period rules block the WP-1.5 contaminated Q1 fixture', () => {
    const text = loadQapiFixture(QAPI_FIXTURE_PATHS.contaminated);
    const segmentation = segmentSourceFile({
      fileName: 'QAPI-Q1Q2-CONTAMINATED.txt',
      mimeType: 'text/plain',
      byteLength: text.length,
      text,
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'contaminated-fixture',
    });

    expect(segmentation.excludedSegments.length).toBeGreaterThan(0);

    const result = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      segmentation,
      expectedAgencyId: E.agency,
      expectedReportingPeriod: EXPECTED_PERIOD,
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.lockEligible).toBe(false);
    expect(codes(result)).toContain('period-contamination');
    expect(codes(result)).toContain('agency-mismatch');
    expect(result.counts.blocker).toBeGreaterThanOrEqual(2);
  });

  it('kpi rules block malformed calculated KPIs', () => {
    const result = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      kpis: [malformedCalculatedKpi()],
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.lockEligible).toBe(false);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'blocker',
          code: 'malformed-kpi',
          path: 'kpis.0.valueState',
        }),
      ]),
    );
  });

  it('workflow rules block missing primary workflow, feeder workflow, duplicate instance, and PIP evidence', () => {
    const duplicateA = workflowEvaluation({
      evaluationId: 'eval-duplicate-a',
      decisionState: 'ACTIVATED',
      newWorkflowInstanceId: 'wf-instance-duplicate',
      sourceRecordIds: ['record-1'],
    });
    const duplicateB = workflowEvaluation({
      evaluationId: 'eval-duplicate-b',
      decisionState: 'ACTIVATED',
      newWorkflowInstanceId: 'wf-instance-duplicate',
      sourceRecordIds: ['record-2'],
    });
    const missingPipEvidence = workflowEvaluation({
      evaluationId: 'eval-pip-missing',
      decisionState: 'CONFIRMED — NOT YET ACTIVATED',
      determination: 'New PIP',
      sourceRecordIds: [],
      pipEvaluationFactors: null,
    });
    const unresolved = workflowEvaluation({
      evaluationId: 'eval-unresolved',
      decisionState: 'WORKFLOW UNRESOLVED',
      canonicalWorkflowId: null,
      decisionRationale: 'WORKFLOW UNRESOLVED — HUMAN CONFIGURATION REQUIRED',
    });

    const result = validatePacket({
      model: modelFixture({ workflowId: '', workflowInstanceId: '' }),
      ...cleanOptions(),
      workflowEvaluations: [duplicateA, duplicateB, missingPipEvidence, unresolved],
      requiredWorkflowIds: ['QA-WF-99'],
      requiredEvidence: [{
        workflowId: 'QA-WF-04',
        evidenceLabel: 'PIP charter',
        evidenceId: null,
      }],
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(codes(result)).toEqual(expect.arrayContaining([
      'missing-primary-workflow',
      'missing-required-feeder-workflow',
      'duplicate-workflow-instance',
      'missing-required-pip-cap-rca-evidence',
    ]));
    expect(result.unresolvedBlockerIds.length).toBeGreaterThanOrEqual(4);
  });

  it('forms rules block missing required source forms and material source conflicts', () => {
    const result = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      sourceUtilization: sourceReportWithMissingFormAndConflict(),
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.lockEligible).toBe(false);
    expect(result.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'missing-required-source-form', relatedFormId: 'QAPI-FM-001' }),
      expect.objectContaining({ code: 'material-source-conflict', relatedFormId: 'QAPI-FM-002' }),
    ]));
  });

  it('signer rules block missing signer identity and authority', () => {
    const result = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      envelopes: [missingSignerEnvelope()],
      requiredSignerCapacities: ['Administrator'],
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.lockEligible).toBe(false);
    expect(result.findings.filter((finding) => finding.code === 'missing-signer-or-authority')).toHaveLength(2);
    expect(result.findings.map((finding) => finding.path)).toEqual(expect.arrayContaining([
      'envelopes.signerTasks.0',
      'envelopes.signerTasks.0.authorityVerified',
    ]));
  });

  it('confidentiality rules block confidential personnel data in a general packet', () => {
    const result = validatePacket({
      model: modelFixture({
        pagePlan: [{
          pageNumber: 1,
          pageId: 'personnel-leak',
          title: 'General packet page',
          moduleId: 'validation-and-lock-readiness',
          contentBlocks: [{ kind: 'paragraph', text: 'Employee name: Jane Example' }],
          footerLabel: 'QAPI Q1',
          classification: 'internal',
          isConfidential: false,
          watermarkText: null,
        }],
      }),
      ...cleanOptions(),
      personnelGeneralPacketFieldNames: ['employee name'],
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.lockEligible).toBe(false);
    expect(result.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: 'blocker',
        code: 'confidential-personnel-data-in-general-packet',
      }),
    ]));
  });

  it('warning findings require acknowledgment before lock while advisory findings do not block lock', () => {
    const qapiLockPacket = qapiLockPacketWithSourceExceptions([
      qapiSourceException({
        severity: 'medium',
        path: 'sourceExceptions.unrecoveredKpi',
        reason: 'A non-critical KPI source was not recovered.',
        remediation: 'Acknowledge the source limitation or recover the source.',
      }),
      qapiSourceException({
        severity: 'low',
        path: 'sourceExceptions.normalizedLabel',
        reason: 'A source label was normalized for display.',
        remediation: 'Review the normalized label during final QA.',
      }),
    ]);

    const result = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      qapiLockPacket,
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.counts).toEqual({ blocker: 0, warning: 1, advisory: 1 });
    expect(result.approvalEligible).toBe(true);
    expect(result.lockEligible).toBe(false);
    expect(result.unacknowledgedWarningIds).toEqual([
      'qapi-source-exception-sourceexceptions-unrecoveredkpi-1',
    ]);
    expect(result.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        severity: 'warning',
        path: 'sourceExceptions.unrecoveredKpi',
        requiresAcknowledgment: true,
      }),
      expect.objectContaining({
        severity: 'advisory',
        path: 'sourceExceptions.normalizedLabel',
        requiresAcknowledgment: false,
      }),
    ]));

    const acknowledged = validatePacket({
      model: modelFixture(),
      ...cleanOptions(),
      qapiLockPacket,
      acknowledgedWarningIds: result.unacknowledgedWarningIds,
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(acknowledged.counts).toEqual({ blocker: 0, warning: 1, advisory: 1 });
    expect(acknowledged.unacknowledgedWarningIds).toEqual([]);
    expect(acknowledged.lockEligible).toBe(true);
  });

  it('clean Q1 packet is lock-eligible', () => {
    const text = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
    const segmentation = segmentSourceFile({
      fileName: 'QAPI-Q1-DS-001.txt',
      mimeType: 'text/plain',
      byteLength: text.length,
      text,
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'q1-fixture',
    });

    expect(segmentation.status).toBe('selected');

    const result = validatePacket({
      model: modelFixture(),
      instance: instanceFixture(),
      ...cleanOptions(),
      segmentation,
      expectedAgencyId: E.agency,
      expectedReportingPeriod: EXPECTED_PERIOD,
      expectedWorkflowId: E.workflowId,
      validatedAt: '2026-04-09T12:00:00.000Z',
    });

    expect(result.findings).toEqual([]);
    expect(result.counts).toEqual({ blocker: 0, warning: 0, advisory: 0 });
    expect(result.approvalEligible).toBe(true);
    expect(result.lockEligible).toBe(true);
  });
});

function codes(result: ReturnType<typeof validatePacket>): string[] {
  return result.findings.map((finding) => finding.code);
}

function cleanOptions(): ValidatePacketOptions {
  return {
    sourceUtilization: emptySourceReport(),
    qapiLockPacket: cleanQapiLockPacket(),
    envelopes: [completeEnvelope()],
    requiredSignerCapacities: ['Administrator', 'QAPI Chair'],
  };
}

function modelFixture(overrides: {
  agencyId?: string;
  workflowId?: string;
  workflowInstanceId?: string;
  pagePlan?: PacketModel['pagePlan'];
} = {}): PacketModel {
  return {
    identity: {
      packetInstanceId: 'QAPI-PKT-Q1-2026',
      packetId: 'QAPI-PKT-Q1-2026',
      packetVersion: 1,
      contentHash: 'hash-packet-q1',
      agencyId: overrides.agencyId ?? E.agency,
      eventFamilyId: 'qapi_meeting',
      eventInstanceId: 'qapi-meeting-2026-04-09',
      workflowId: overrides.workflowId ?? E.workflowId,
      workflowInstanceId: overrides.workflowInstanceId ?? 'QA-WF-03-Q1-2026',
      packetTemplateId: 'qapi-quarterly',
      archetypeId: 'analytical-report',
      subtype: 'final',
      reportingPeriodStart: E.periodStart,
      reportingPeriodEnd: E.periodEnd,
      dataThroughDate: E.meetingDate,
      status: 'DRAFT_GENERATED',
    },
    renderingProfileId: 'qapi-analytical',
    classification: 'internal',
    handlingNotice: null,
    modules: [{
      moduleInstanceId: 'QAPI-PKT-Q1-2026:validation',
      moduleId: 'validation-and-lock-readiness',
      title: 'Validation and lock readiness',
      order: 1,
      status: 'complete',
      payload: {},
      contentHash: 'hash-validation-module',
    }],
    pagePlan: overrides.pagePlan ?? null,
  };
}

function instanceFixture(): PacketInstance {
  return {
    packetInstanceId: 'QAPI-PKT-Q1-2026',
    packetId: 'QAPI-PKT-Q1-2026',
    packetVersion: 1,
    agencyId: E.agency,
    eventFamilyId: 'qapi_meeting',
    eventInstanceId: 'qapi-meeting-2026-04-09',
    archetypeId: 'analytical-report',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'qapi-quarterly',
    subtype: 'final',
    workflowId: E.workflowId,
    workflowInstanceId: 'QA-WF-03-Q1-2026',
    reportingPeriodStart: E.periodStart,
    reportingPeriodEnd: E.periodEnd,
    dataThroughDate: E.meetingDate,
    status: 'DRAFT_GENERATED',
    moduleInstances: [{
      moduleInstanceId: 'QAPI-PKT-Q1-2026:validation',
      moduleId: 'validation-and-lock-readiness',
      status: 'complete',
      payload: {},
      contentHash: 'hash-validation-module',
      order: 1,
      updatedAt: '2026-04-09T12:00:00.000Z',
      updatedBy: 'validator',
    }],
    attachmentInstances: [],
    blockerIds: [],
    warningIds: [],
    approvalIds: ['approval-q1'],
    signatureIds: ['signature-admin', 'signature-qapi-chair'],
    evidenceManifestId: 'evidence-manifest-q1',
    auditChronologyId: 'audit-chronology-q1',
    driveFolderUrl: 'https://drive.example/q1',
    finalArtifactUrl: null,
    createdAt: '2026-04-09T12:00:00.000Z',
    createdBy: 'validator',
    updatedAt: '2026-04-09T12:00:00.000Z',
    certifiedAt: null,
    lockedAt: null,
    contentHash: 'hash-packet-q1',
    supersedesPacketInstanceId: null,
    supersededByPacketInstanceId: null,
    sourceClassification: 'synthetic',
  };
}

function cleanQapiLockPacket(): PacketForLock {
  return {
    packetId: 'QAPI-PKT-Q1-2026',
    packetType: 'final',
    html: 'QAPI Q1 packet with source-derived content.',
    governanceRoles: [
      { role: 'Administrator', name: 'Ada Administrator', authorityConfirmed: true },
      { role: 'QAPI Chair', name: 'Quinn Chair', authorityConfirmed: true },
    ],
    rollups: {
      activeCensus: E.activePatientsAtPeriodEnd,
      recertCounts: 12,
      highRiskRollupPresent: true,
      priorPeriodComparisonPresent: false,
      claimsTrend: false,
    },
    signatures: [],
    dateWindowViolations: [],
    addendum: { required: false, generatedId: null },
    sourceExceptions: [],
  };
}

function qapiLockPacketWithSourceExceptions(
  sourceExceptions: NonNullable<PacketForLock['sourceExceptions']>,
): PacketForLock {
  return {
    ...cleanQapiLockPacket(),
    sourceExceptions,
  };
}

function qapiSourceException(
  overrides: Omit<NonNullable<PacketForLock['sourceExceptions']>[number], 'pass'>,
): NonNullable<PacketForLock['sourceExceptions']>[number] {
  return {
    pass: false,
    ...overrides,
  };
}

function emptySourceReport(): SourceFormUtilizationReport {
  return {
    sourcesAndFormsUsed: [],
    expectedButMissing: [],
    suppliedButUnused: [],
    generatedByTrigger: [],
    carriedForward: [],
    conflicts: [],
    excludedWithReason: [],
  };
}

function sourceReportWithMissingFormAndConflict(): SourceFormUtilizationReport {
  return {
    sourcesAndFormsUsed: [],
    expectedButMissing: [{
      bucket: 'expected-but-missing',
      requirementId: 'req-qapi-form',
      formId: 'QAPI-FM-001',
      sourceId: 'source-qapi-form',
      purpose: 'Quarterly QAPI source form',
      expectedAgency: E.agency,
      expectedPeriod: E.quarter,
      recordsExpected: null,
      validationStatus: 'UNKNOWN — NOT RECOVERED',
    }],
    suppliedButUnused: [],
    generatedByTrigger: [],
    carriedForward: [],
    conflicts: [{
      bucket: 'conflict',
      conflictId: 'conflict-census',
      sourceIds: ['source-a', 'source-b'],
      formIds: ['QAPI-FM-002'],
      reason: 'Census totals disagree across source forms.',
      validationStatus: 'Conflicted — reconciliation required',
    }],
    excludedWithReason: [],
  };
}

function malformedCalculatedKpi(): CalculatedKpi {
  return {
    definitionId: 'qapi-hospitalization-rate',
    indicatorId: 'hospitalization-rate',
    title: 'Hospitalization rate',
    valueState: 'CONFLICTED',
    currentValue: null,
    displayValue: 'Conflicted — reconciliation required',
    numerator: 5,
    denominator: null,
    status: 'UNKNOWN',
    validationStatus: 'Conflicted — reconciliation required',
  } as unknown as CalculatedKpi;
}

function workflowEvaluation(overrides: {
  evaluationId: string;
  decisionState: WorkflowTriggerEvaluation['decisionState'];
  canonicalWorkflowId?: string | null;
  decisionRationale?: string;
  dependencyWorkflowIds?: string[];
  blockerIds?: string[];
  sourceRecordIds?: string[];
  sourceWorkflowIds?: string[];
  requiredFormIds?: string[];
  sourceFormIds?: string[];
  newWorkflowInstanceId?: string | null;
  existingWorkflowInstanceId?: string | null;
  determination?: WorkflowTriggerEvaluation['determination'];
  pipEvaluationFactors?: WorkflowTriggerEvaluation['pipEvaluationFactors'];
}): WorkflowTriggerEvaluation {
  return {
    evaluationId: overrides.evaluationId,
    decisionState: overrides.decisionState,
    decisionRationale: overrides.decisionRationale ?? 'Workflow evaluation rationale.',
    canonicalWorkflowId: overrides.canonicalWorkflowId ?? 'QA-WF-04',
    dependencyWorkflowIds: overrides.dependencyWorkflowIds ?? [],
    blockerIds: overrides.blockerIds ?? [],
    sourceRecordIds: overrides.sourceRecordIds ?? ['source-record'],
    sourceWorkflowIds: overrides.sourceWorkflowIds ?? [],
    requiredFormIds: overrides.requiredFormIds ?? [],
    sourceFormIds: overrides.sourceFormIds ?? [],
    newWorkflowInstanceId: overrides.newWorkflowInstanceId ?? null,
    existingWorkflowInstanceId: overrides.existingWorkflowInstanceId ?? null,
    determination: overrides.determination ?? null,
    pipEvaluationFactors: overrides.pipEvaluationFactors ?? null,
  } as unknown as WorkflowTriggerEvaluation;
}

function completeEnvelope(): PacketEnvelope {
  return {
    envelopeId: 'env-q1',
    packetInstanceId: 'QAPI-PKT-Q1-2026',
    signerTasks: [{
      signerTaskId: 'task-admin',
      requiredCapacity: 'Administrator',
      signerUserId: 'user-admin',
      signerName: 'Ada Administrator',
      signerEmail: 'ada@example.test',
      signerRole: 'Administrator',
      authorityVerified: true,
      required: true,
      status: 'COMPLETED',
    }, {
      signerTaskId: 'task-qapi-chair',
      requiredCapacity: 'QAPI Chair',
      signerUserId: 'user-chair',
      signerName: 'Quinn Chair',
      signerEmail: 'quinn@example.test',
      signerRole: 'QAPI Chair',
      authorityVerified: true,
      required: true,
      status: 'COMPLETED',
    }],
    status: 'COMPLETED',
  } as unknown as PacketEnvelope;
}

function missingSignerEnvelope(): PacketEnvelope {
  return {
    envelopeId: 'env-missing',
    packetInstanceId: 'QAPI-PKT-Q1-2026',
    signerTasks: [{
      signerTaskId: 'task-admin-missing',
      requiredCapacity: 'Administrator',
      signerUserId: null,
      signerName: null,
      signerEmail: null,
      signerRole: null,
      authorityVerified: false,
      required: true,
      status: 'PREPARED',
    }],
    status: 'PREPARED',
  } as unknown as PacketEnvelope;
}
