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

  it('parses a free-form consolidated document dump instead of requiring a source template', () => {
    const sourceDump = `
QAPI Q2 2026 — Full Consolidated Record
Synthetic UAT Data — No Real PHI — Not For Production
Quarter: Q2 2026
AgencyCare Indeed Home Health Care, Inc.
Meeting Date2026-05-07ChairDirector of Nursing (DON)RecorderCompliance OfficerQuorum6 of 6 present — quorum metAttendees Expected8Attendees Present8Attendance Rate100.0% — MET
Patients/Episodes in Scope (Reviewed)112Includes active + recently discharged within windowActive Census100Active patients at data-through dateHigh-Acuity Patients12New SOC Admissions (Q2)42Recertifications (Q2)18Resumptions of Care (Q2)6Discharges (Q2)35Transfers to Inpatient7OASIS/CMS-485 Records (Chart Audit Denominator)154
Summary: 7 hospitalizations | 3 ED without hospitalization | Total adverse events = 7 | Open RCAs = 5 (RCA-Q2-001, 002, 004, 005, 007) | Completed RCAs = 2 (RCA-Q2-003, 006) | Unreported = 0
Summary: Total infections = 7 | Healthcare-associated = 5 | Community-acquired = 2 | Unreported to state = 0 | CLUSTER-001 = 3 MRSA HAIs
Audit Summary (140 records audited = 100 active + 40 from feeder audits): OASIS SOC not completed ≤5 days = 2 | POC missing F2F = 4 | POC unsigned/pending physician signature = 1 | Med-reconciliation mismatch = 5 | Total deficiencies = 12 | Total compliant = 128 | Defect rate = 8.6%
Medication-reconciliation compliance89.3%125 compliant140 audited≥95.0%
Q2 Totals: Scheduled = 150 | Completed = 126 | Missed = 24 | Overall compliance = 84.0%
Summary: Total complaints = 7 | Rate = 7.0 per 100 | Resolved = 4 | Open = 3
Active PIPs (8)
PIP-T-001 OASIS accuracy threshold breach
PIP-T-002 Clinician documentation pattern
PIP-T-003 Infection cluster
PIP-T-004 Adverse event rate above threshold
PIP-T-005 Complaint rate above threshold
PIP-T-006 Medication reconciliation below threshold
PIP-T-007 Missed visit worsening trend
PIP-T-008 Discharge documentation below threshold
Open CAPs / RCAs (5)
Action completion rate: 2 of 4 resolved = 50% | Average action closure time = 18 days
Disciplinary flags: 5 total — sealed in QAPI-HR-ADDENDUM-2026-Q2
    `;
    const model = buildQapiPacketModel({
      parsed: parseTxt(sourceDump, 'mockq2synth.md'),
      eventDateISO: '2026-05-07',
      targetAgency: 'Care Indeed Home Health Care, Inc.',
      targetPeriod: '2026-Q2',
      sourceId: 'mockq2synth.md',
      generatedAt: '2026-07-13T00:00:00.000Z',
    });
    const payload = qapiPayload(model);
    const dashboardCard = (title: RegExp) =>
      payload.kpiDashboard.cards.find((card) => title.test(card.title));

    expect(payload.sourceCounts.episodesTotal.value).toBe(112);
    expect(payload.sourceCounts.activeCensus.value).toBe(100);
    expect(payload.sourceCounts.hospitalizations.value).toBe(7);
    expect(payload.sourceCounts.edVisitsWithoutHospitalization.value).toBe(3);
    expect(payload.sourceCounts.pipTriggerScenarios.value).toBe(8);
    expect(payload.sourceCounts.personnelReviewTriggers.value).toBe(5);
    expect(dashboardCard(/patients|episodes/i)?.currentValue.display).toBe('112');
    expect(dashboardCard(/active census/i)?.currentValue.display).toBe('100');
    expect(dashboardCard(/hospitalization/i)?.currentValue.display).toBe('7.0%');
    expect(dashboardCard(/ED use/i)?.currentValue.display).toBe('3.0 per 100');
    expect(dashboardCard(/adverse event/i)?.currentValue.display).toBe('7.0 per 100');
    expect(dashboardCard(/infection event/i)?.currentValue.display).toBe('5.0%');
    expect(dashboardCard(/documentation-audit/i)?.currentValue.display).toBe('91.4%');
    expect(dashboardCard(/documentation defect/i)?.currentValue.display).toBe('8.6%');
    expect(dashboardCard(/medication-reconciliation/i)?.currentValue.display).toBe('89.3%');
    expect(dashboardCard(/missed-visit/i)?.currentValue.display).toBe('84.0%');
    expect(dashboardCard(/complaint/i)?.currentValue.display).toBe('7.0 per 100');
    expect(dashboardCard(/active PIPs/i)?.currentValue.display).toBe('8');
    expect(dashboardCard(/open CAPs/i)?.currentValue.display).toBe('5');
    expect(dashboardCard(/attendance/i)?.currentValue.display).toBe('100.0%');
    expect(dashboardCard(/action completion/i)?.currentValue.display).toBe('50.0%');
    expect(dashboardCard(/PIP trigger/i)?.currentValue.display).toBe('8');
    expect(dashboardCard(/closure time/i)?.currentValue.display).toBe('18.0 days');
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
