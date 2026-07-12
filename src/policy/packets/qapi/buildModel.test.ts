// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import type { PacketModel } from '@/policy/packets/contracts';
import {
  assertAnalysisBeforeForms,
  QAPI_FULL_MODULE_ORDER,
} from '@/policy/packets/registries/moduleRegistry';
import { UNKNOWN_NOT_RECOVERED_TEXT } from '@/policy/packets/sources/sourceValidation';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS as E,
  QAPI_FIXTURE_PATHS,
} from '@/policy/packets/testing/loadQapiFixture';

import {
  buildQapiPacketModel,
} from './buildQapiPacketModel';
import type { QapiPacketModelPayload } from './buildQapiPacketModel';
import {
  FR010_EXECUTIVE_ANALYSIS_ELEMENTS,
} from './executiveAnalysis';
import { buildMonthlyQapiPacketModel } from './monthlyCadence';

const contaminatedText = loadQapiFixture(QAPI_FIXTURE_PATHS.contaminated);

function parseTxt(text: string, fileName: string) {
  return parseSourceFile({
    fileName,
    mimeType: 'text/plain',
    byteLength: Buffer.byteLength(text, 'utf8'),
    text,
  });
}

function buildContaminatedQ1Model(): PacketModel {
  return buildQapiPacketModel({
    parsed: parseTxt(contaminatedText, 'QAPI-Q1Q2-CONTAMINATED.txt'),
    eventDateISO: E.meetingDate,
    targetAgency: E.agency,
    targetPeriod: E.quarter,
    sourceId: 'contaminated-q1-fixture',
    generatedAt: '2026-04-09T00:00:00.000Z',
  });
}

function qapiPayload(model: PacketModel): QapiPacketModelPayload {
  return model.modules[0]!.payload['qapiModel'] as QapiPacketModelPayload;
}

describe('WP-3.1 QAPI packet-model builder', () => {
  it('recovers the §24 Q1 fixture counts and excludes Q2 clinical values', () => {
    const model = buildContaminatedQ1Model();
    const payload = qapiPayload(model);

    expect(payload.selectedSource.datasetId).toBe(E.datasetId);
    expect(payload.selectedSource.period).toBe(E.quarter);
    expect(payload.sourceCounts.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(payload.sourceCounts.episodesTotal.value).toBe(E.episodesTotal);
    expect(payload.sourceCounts.hospitalizations.value).toBe(E.hospitalizations);
    expect(payload.sourceCounts.edVisitsWithoutHospitalization.value).toBe(
      E.edVisitsWithoutHospitalization,
    );
    expect(payload.sourceCounts.committeeAttendancePresent.value).toBe(
      E.committeeAttendancePresent,
    );
    expect(payload.sourceCounts.committeeAttendanceTotal.value).toBe(
      E.committeeAttendanceTotal,
    );
    expect(payload.sourceCounts.governingBodyEscalationItems.value).toBe(
      E.governingBodyEscalationItems,
    );
    expect(payload.sourceCounts.pipTriggerScenarios.value).toBe(E.pipTriggerScenarios);
    expect(payload.sourceCounts.personnelReviewTriggers.value).toBe(
      E.personnelReviewTriggers,
    );
    expect(payload.sourceCounts.activeCensus.value).not.toBe(100);
    expect(payload.sourceCounts.hospitalizations.value).not.toBe(7);
    expect(payload.selectedSource.agency).not.toContain('Lakeside Contaminant');
  });

  it('orders Part I analysis before Part II forms and follows the module registry', () => {
    const model = buildContaminatedQ1Model();
    const orderedModuleIds = model.modules
      .slice()
      .sort((left, right) => left.order - right.order)
      .map((module) => module.moduleId);

    expect(orderedModuleIds).toEqual(QAPI_FULL_MODULE_ORDER);
    expect(() => assertAnalysisBeforeForms(orderedModuleIds)).not.toThrow();
    expect(orderedModuleIds.indexOf('qapi-rich-kpi-dashboard')).toBeLessThan(
      orderedModuleIds.indexOf('qapi-completed-source-forms'),
    );
  });

  it('builds all FR-010 executive-analysis elements without dropping UNKNOWN disclosures', () => {
    const payload = qapiPayload(buildContaminatedQ1Model());
    const missingExpectedForms = payload.executiveAnalysis.elements.find(
      (element) => element.element === 'Missing expected forms',
    );

    expect(payload.executiveAnalysis.elements.map((element) => element.element)).toEqual(
      FR010_EXECUTIVE_ANALYSIS_ELEMENTS,
    );
    expect(missingExpectedForms).toMatchObject({
      text: UNKNOWN_NOT_RECOVERED_TEXT,
      status: 'unknown',
    });
    expect(payload.executiveAnalysis.unknownElementCount).toBeGreaterThan(0);
    expect(payload.executiveAnalysis.prose).toContain('Sources uploaded');
    expect(payload.executiveAnalysis.prose).toContain(
      `Missing expected forms: ${UNKNOWN_NOT_RECOVERED_TEXT}`,
    );
    expect(payload.executiveAnalysis.prose).toContain(
      'PRIOR-PERIOD PACKET NOT FOUND — Trend comparison unavailable.',
    );
    expect(payload.executiveAnalysis.elements).toHaveLength(15);
  });

  it('carries only aggregate personnel-review data and a restricted addendum reference', () => {
    const payload = qapiPayload(buildContaminatedQ1Model());
    const aggregateJson = JSON.stringify(payload.personnelAggregation);
    const aggregateRowKeys = [
      'count',
      'policy',
      'reason',
      'requiredReviewer',
      'status',
      'triggerCategory',
    ].sort();

    expect(payload.personnelAggregation.summary.thresholdMetCount).toBe(
      E.personnelReviewTriggers,
    );
    expect(payload.personnelAggregation.rows.reduce((sum, row) => sum + row.count, 0)).toBe(
      E.personnelReviewTriggers,
    );
    expect(payload.personnelAggregation.addendumReference).toMatchObject({
      id: `QAPI-HR-ADDENDUM-${E.quarter}`,
      classification: 'restricted-personnel',
    });
    expect(payload.personnelAggregation.rows).toHaveLength(E.personnelReviewTriggers);
    expect(payload.personnelAggregation.rows.every((row) => row.count > 0)).toBe(true);
    expect(payload.personnelAggregation.rows.map((row) => Object.keys(row).sort())).toEqual(
      payload.personnelAggregation.rows.map(() => aggregateRowKeys),
    );
    expect(aggregateJson).not.toMatch(/DT-Q1-00[1-5]/);
    expect(aggregateJson).not.toMatch(/\b(?:MOCK-CLIN|MOCK-PT)-\d+\b/);
    expect(aggregateJson).not.toMatch(
      /\b(allegation|investigation fact|sanction|termination|written warning|suspension|employee investigation)\b/i,
    );
  });

  it('uses the same analytical renderer profile for monthly cadence with monthly KPI definitions', () => {
    const monthly = buildMonthlyQapiPacketModel({
      parsed: parseTxt(loadQapiFixture(QAPI_FIXTURE_PATHS.q1), 'QAPI-Q1-DS-001.txt'),
      eventDateISO: E.meetingDate,
      targetAgency: E.agency,
      targetPeriod: E.quarter,
      sourceId: 'q1-fixture',
      generatedAt: '2026-04-09T00:00:00.000Z',
    });
    const payload = qapiPayload(monthly);

    expect(monthly.renderingProfileId).toBe('qapi-analytical');
    expect(payload.cadence).toBe('monthly');
    expect(payload.kpiDefinitions.length).toBeGreaterThan(0);
    expect(payload.kpiDashboard.metricSnapshots.length).toBeGreaterThan(0);
    expect(payload.kpiDefinitions.map((definition) => definition.definitionId)).toContain(
      'qapi-patients-episodes-in-scope:monthly',
    );
    expect(payload.kpiDefinitions.map((definition) => definition.definitionId)).not.toContain(
      'qapi-patients-episodes-in-scope:quarterly',
    );
    expect(payload.kpiDefinitions.every((definition) =>
      definition.measurementPeriod.cadence === 'monthly',
    )).toBe(true);
  });
});
