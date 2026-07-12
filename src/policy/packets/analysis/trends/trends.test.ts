import type {
  ComparabilityState,
  QapiMetricSnapshot,
  QapiTrendSnapshot,
} from '@/policy/packets/contracts';
import { describe, expect, it } from 'vitest';
import { determineComparability } from './comparability';
import { computeTrends } from './computeTrends';
import {
  deserializeQapiTrendSnapshot,
  serializeQapiTrendSnapshot,
} from './snapshotSerializer';

const priorPeriodPacketNotFoundBanner =
  'PRIOR-PERIOD PACKET NOT FOUND — Trend comparison unavailable.';

describe('trend comparability engine', () => {
  it('blocks trend claims when a metric definition changed', () => {
    const currentMetric = metric({
      definitionVersion: 'definition-v2',
      rate: 0.92,
      target: 0.9,
    });
    const priorMetric = metric({
      definitionVersion: 'definition-v1',
      rate: 0.88,
      target: 0.9,
    });

    const output = computeTrends(
      snapshot({ metrics: [currentMetric] }),
      priorSnapshot({ metrics: [priorMetric] }),
    );

    expect(output.overallComparability).toBe(
      'NOT COMPARABLE — DEFINITION CHANGED',
    );
    expect(output.metrics[0]?.comparability).toBe(
      'NOT COMPARABLE — DEFINITION CHANGED',
    );
    expect(output.metrics[0]?.priorValue).toBeNull();
    expect(output.metrics[0]?.absoluteChange).toBeNull();
    expect(output.metrics[0]?.percentagePointChange).toBeNull();
    expect(output.metrics[0]?.direction).toBe('not-comparable');
  });

  it('does not substitute zero when the prior packet is missing', () => {
    const output = computeTrends(snapshot(), null);

    expect(output.overallComparability).toBe('PRIOR DATA UNAVAILABLE');
    expect(output.missingPriorBanner).toBe(priorPeriodPacketNotFoundBanner);
    expect(output.metrics[0]?.priorValue).toBeNull();
    expect(output.metrics[0]?.priorValue).not.toBe(0);
    expect(output.metrics[0]?.absoluteChange).toBeNull();
    expect(output.metrics[0]?.percentagePointChange).toBeNull();
    expect(output.metrics[0]?.direction).toBe('unknown');
  });

  it('round-trips stable QapiTrendSnapshot JSON and rejects partial snapshots', () => {
    const original = snapshot({
      findings: [
        {
          findingId: 'finding-1',
          category: 'Clinical',
          description: 'Hospitalization rate exceeded threshold.',
          severity: 'high',
          materiality: null,
          currentState: 'open',
          priorPeriodRelationship: 'continued',
          recurrence: 'recurring',
          riskType: 'patient-safety',
          relatedWorkflowIds: ['workflow-1'],
          relatedMetricIds: ['metric-1'],
          reopened: true,
        },
      ],
    });

    const serialized = serializeQapiTrendSnapshot(original);
    const parsed = deserializeQapiTrendSnapshot(serialized);

    expect(parsed).toEqual(original);
    expect(serializeQapiTrendSnapshot(parsed)).toBe(serialized);

    const partial = { ...original } as Record<string, unknown>;
    delete partial.metrics;
    expect(() =>
      deserializeQapiTrendSnapshot(JSON.stringify(partial)),
    ).toThrow(/metrics/);
  });

  it('can reach every exact PRD comparability state', () => {
    const current = snapshot();
    const prior = priorSnapshot();
    const currentMetric = current.metrics[0] as QapiMetricSnapshot;
    const stateCases: ComparabilityState[] = [
      determineComparability(current, prior).state,
      determineComparability(current, priorSnapshot({ cadence: 'quarterly' }))
        .state,
      determineComparability(
        snapshot({ kpiDefinitionVersion: 'kpi-definition-v2' }),
        prior,
      ).state,
      determineComparability(current, priorSnapshot({ agencyId: 'agency-2' }))
        .state,
      determineComparability(
        snapshot({ metrics: [metric({ unit: 'percent' })] }),
        priorSnapshot({ metrics: [metric({ unit: 'days' })] }),
        metric({ unit: 'percent' }),
      ).state,
      determineComparability(current, null).state,
      determineComparability(
        current,
        priorSnapshot({
          metrics: [
            metric({ absoluteValue: 1 }),
            metric({ absoluteValue: 2 }),
          ],
        }),
        currentMetric,
      ).state,
    ];

    expect(new Set(stateCases)).toEqual(
      new Set<ComparabilityState>([
        'COMPARABLE',
        'COMPARABLE WITH LIMITATION',
        'NOT COMPARABLE — DEFINITION CHANGED',
        'NOT COMPARABLE — COHORT CHANGED',
        'NOT COMPARABLE — UNIT CHANGED',
        'PRIOR DATA UNAVAILABLE',
        'PRIOR DATA CONFLICTED',
      ]),
    );
  });
});

function metric(
  overrides: Partial<QapiMetricSnapshot> = {},
): QapiMetricSnapshot {
  return {
    metricId: 'metric-1',
    metricKey: 'hospitalization-rate',
    label: 'Hospitalization rate',
    definitionVersion: 'definition-v1',
    unit: 'percent',
    numerator: 9,
    denominator: 100,
    rate: 0.09,
    absoluteValue: null,
    target: 0.1,
    priorValue: null,
    absoluteChange: null,
    percentagePointChange: null,
    direction: 'unknown',
    comparability: 'PRIOR DATA UNAVAILABLE',
    comparabilityLimitation: null,
    targetStatus: null,
    sustainedPerformance: null,
    repeatedDeficiency: null,
    emergingDecline: null,
    improvement: null,
    ...overrides,
  };
}

function snapshot(
  overrides: Partial<QapiTrendSnapshot> = {},
): QapiTrendSnapshot {
  return {
    packetInstanceId: 'packet-current',
    packetVersion: 1,
    packetHash: 'hash-current',
    agencyId: 'agency-1',
    eventFamilyId: 'event-family-1',
    eventInstanceId: 'event-current',
    workflowId: 'workflow-1',
    workflowInstanceId: 'workflow-instance-current',
    cadence: 'monthly',
    reportingPeriodStart: '2026-06-01',
    reportingPeriodEnd: '2026-06-30',
    dataThroughDate: '2026-06-30',
    packetStatus: 'published',
    sourceClassification: 'production',
    kpiDefinitionVersion: 'kpi-definition-v1',
    metricSchemaVersion: 'metric-schema-v1',
    metrics: [metric()],
    findings: [],
    workflows: [],
    pips: [],
    actionItems: [],
    publishedArtifactUrl: 'https://example.test/current.pdf',
    publishedFolderUrl: 'https://example.test/current',
    generatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

function priorSnapshot(
  overrides: Partial<QapiTrendSnapshot> = {},
): QapiTrendSnapshot {
  return snapshot({
    packetInstanceId: 'packet-prior',
    packetHash: 'hash-prior',
    eventInstanceId: 'event-prior',
    workflowInstanceId: 'workflow-instance-prior',
    reportingPeriodStart: '2026-05-01',
    reportingPeriodEnd: '2026-05-31',
    dataThroughDate: '2026-05-31',
    publishedArtifactUrl: 'https://example.test/prior.pdf',
    publishedFolderUrl: 'https://example.test/prior',
    generatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  });
}
