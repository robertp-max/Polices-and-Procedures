import { describe, expect, it } from 'vitest';

import { analyzeEditImpact, editImpactDimensionKeys } from './impactAnalysis';

describe('analyzeEditImpact', () => {
  it('flags KPI-source edits as material with recompute and approval staleness', () => {
    const analysis = analyzeEditImpact({
      packetInstanceId: 'packet-1',
      editId: 'edit-kpi-1',
      baseVersionId: 'version-1',
      packetVersion: 1,
      changeType: 'data',
      targetPath: 'sources.oasis.fallRateNumerator',
      before: { numerator: 2, denominator: 100, rate: 0.02 },
      after: { numerator: 5, denominator: 100, rate: 0.05 },
      reason: 'Corrected source numerator from the validated KPI extract.',
      sourceIds: ['source-oasis-june'],
      affectedKpiIds: ['falls-rate'],
      affectedFindingIds: ['finding-falls'],
      affectedWorkflowIds: ['wf-qapi-review'],
      affectedFormIds: ['form-qapi-minutes'],
      affectedDimensions: [
        'kpiCalculations',
        'trends',
        'findings',
        'riskRatings',
        'pipCapRcaDecisions',
        'workflowTriggersAndInstances',
        'requiredForms',
        'actions',
        'gbRecommendations',
      ],
      analyzedAt: new Date('2026-07-12T10:00:00.000Z'),
      analyzedBy: 'qa-user',
    });

    expect(analysis.materiality).toBe('material');
    expect(analysis.stalePriorApproval).toBe(true);
    expect(analysis.envelopeSignal.cancelOrVoidRequired).toBe(true);
    expect(analysis.envelopeSignal.affectedDimensions).toEqual(expect.arrayContaining(['approvals', 'hashes']));
    expect(analysis.dimensions.kpiCalculations.affected).toBe(true);
    expect(analysis.dimensions.trends.affected).toBe(true);
    expect(analysis.recomputeSignals).toEqual(
      expect.arrayContaining(['kpi-calculations', 'trend-series', 'finding-model', 'risk-rating']),
    );
    expect(analysis.humanReadableSummary).toContain('KPI calcs');
    expect(Object.keys(analysis.dimensions)).toEqual([...editImpactDimensionKeys]);
    expect(analysis.summary).toEqual({
      editId: 'edit-kpi-1',
      packetInstanceId: 'packet-1',
      packetVersion: 1,
      classification: 'material',
      humanReadableSummary: analysis.humanReadableSummary,
      dimensions: {
        kpiCalculations: true,
        trends: true,
        findings: true,
        riskRatings: true,
        pipCapRcaDecisions: true,
        workflowTriggersAndInstances: true,
        requiredForms: true,
        actions: true,
        governingBodyRecommendations: true,
        approvals: true,
        signers: false,
        attachments: false,
        confidentiality: false,
        hashes: true,
        pagination: false,
        ecignEnvelopeValidity: true,
        lockEligibility: true,
      },
      affectedKpiIds: ['falls-rate'],
      affectedFindingIds: ['finding-falls'],
      affectedWorkflowIds: ['wf-qapi-review'],
      affectedFormIds: ['form-qapi-minutes'],
      requiresReapproval: true,
      requiresResignature: true,
      invalidatesEnvelope: true,
      invalidatesLockEligibility: true,
      analyzedAt: '2026-07-12T10:00:00.000Z',
      analyzedBy: 'qa-user',
    });
  });

  it('keeps narrative-only edits non-material without recompute or approval staleness', () => {
    const analysis = analyzeEditImpact({
      packetInstanceId: 'packet-1',
      baseVersionId: 'version-2',
      changeType: 'narrative',
      targetPath: 'sections.executiveSummary.body',
      before: 'The QAPI committee reviewed June outcomes.',
      after: 'The QAPI committee reviewed the June outcomes.',
      reason: 'Copy edit for clarity only.',
      narrativeOnly: true,
    });

    expect(analysis.materiality).toBe('non-material');
    expect(analysis.stalePriorApproval).toBe(false);
    expect(analysis.envelopeSignal.cancelOrVoidRequired).toBe(false);
    expect(analysis.dimensions.approvals.affected).toBe(false);
    expect(analysis.dimensions.eCignEnvelopeValidity.affected).toBe(false);
    expect(analysis.dimensions.kpiCalculations.affected).toBe(false);
    expect(analysis.recomputeSignals).toEqual([]);
    expect(analysis.summary.requiresReapproval).toBe(false);
    expect(analysis.summary.invalidatesEnvelope).toBe(false);
  });
});
