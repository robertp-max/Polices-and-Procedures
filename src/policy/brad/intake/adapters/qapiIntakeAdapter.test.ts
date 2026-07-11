import { describe, it, expect } from 'vitest';
import { parseSourceFile } from '../../../evidence/intake/fileParsing';
import { deriveQapiBundle, reconstructClinicalDump } from './qapiIntakeAdapter';
import type { ClinicalDump } from '../../../qapi/qapiTypes';

const CLEAN_DUMP: ClinicalDump = {
  meta: { quarter: '2026-Q2', reporting_period: { start: '2026-04-01', end: '2026-06-30' } },
  patients: [
    { client_id: 'P1', admission_status: 'active', acuity: 'high', high_risk_flags: ['fall_risk'], hospitalized_q2: true },
    { client_id: 'P2', admission_status: 'discharged', high_risk_flags: [] },
    { client_id: 'P3', admission_status: 'recert_due', high_risk_flags: ['fall_risk', 'unreported_fall'] },
  ],
  clinicians: [
    { clinician_id: 'C1', pip_status: 'active', assigned_high_risk_patients: 10 },
    { clinician_id: 'C2' },
  ],
  incidents: [{ incident_id: 'I1', category: 'fall', date_of_incident: '2026-05-01', rca_completed: true, reported: true }],
  infections: [{ infection_id: 'INF1', healthcare_associated: true, date_onset: '2026-05-10', reported_to_state: false }],
  labs: [{ lab_id: 'L1', critical: true, reported_to_physician_within_policy: false }],
};

// Mirrors the real-world "shell packet" bug: prose header + an embedded JSON
// blob with trailing prose that breaks strict JSON.parse, camelCase fields.
const MESSY_UPLOAD_TEXT = `🔥 Care Indeed Home Health — Q1/Q2 2026 Mock Dataset
${JSON.stringify({
  clinicians: [
    { clinicianId: 'MOCK-C1', performanceFlags: ['no_call_no_show_3_instances', 'oasis_accuracy_rate_51pct'], caseloadCount: 28, maxRecommendedCaseload: 12 },
    { clinicianId: 'MOCK-C2', performanceFlags: ['no_call_no_show_3_instances'], disciplinaryActions: [{ date: '2026-01-20', type: 'written_warning' }] },
  ],
  pipHistory: [{ pipId: 'PIP-1', status: 'failed_Q4_2025', issue: 'Documentation timeliness' }],
})}
📊 trailing summary text that is not valid JSON and breaks JSON.parse`;

describe('reconstructClinicalDump', () => {
  it('reconstructs a whole-document ClinicalDump-shaped upload', () => {
    const text = JSON.stringify(CLEAN_DUMP);
    const parsed = parseSourceFile({ fileName: 'clean.json', mimeType: 'application/json', text, byteLength: text.length });
    const dump = reconstructClinicalDump(parsed);
    expect(dump).not.toBeNull();
    expect(dump?.patients.length).toBe(3);
    expect(dump?.clinicians.length).toBe(2);
  });

  it('returns null for a messy upload that does not match the ClinicalDump shape', () => {
    const parsed = parseSourceFile({ fileName: 'messy.json', mimeType: 'application/json', text: MESSY_UPLOAD_TEXT, byteLength: MESSY_UPLOAD_TEXT.length });
    expect(reconstructClinicalDump(parsed)).toBeNull();
  });
});

describe('deriveQapiBundle — ClinicalDump path (real extractQapiRollup math)', () => {
  it('derives real census/high-risk/adverse-event counts, not fabricated ones', () => {
    const text = JSON.stringify(CLEAN_DUMP);
    const parsed = parseSourceFile({ fileName: 'clean.json', mimeType: 'application/json', text, byteLength: text.length });
    const bundle = deriveQapiBundle(parsed, '2026-06-30');
    expect(bundle.sourceMode).toBe('clinical_dump');
    expect(bundle.censusPopulation.activeCensus.confidence).toBe('high');
    expect(bundle.censusPopulation.activeCensus.value).toBe(1); // only P1 is 'active'
    expect(bundle.censusPopulation.dischargedCount.value).toBe(1);
    expect(bundle.censusPopulation.qapiRequiredCount.value).toBe(2); // P1 + P3 have high_risk_flags
    expect(bundle.adverseEvents.hospitalizationsTotal.value).toBe(1);
    expect(bundle.adverseEvents.infectionsTotal.value).toBe(1);
    expect(bundle.infectionControl.healthcareAssociated.value).toBe(1);
  });
});

describe('deriveQapiBundle — heuristic path (the real-world shell-packet bug scenario)', () => {
  it('recovers flat structured QAPI aggregate JSON even when nested PIP arrays are present', () => {
    const source = {
      event_title: 'Live DefenCIble QAPI JSON Smoke',
      meeting_date: '2026-05-07',
      attendees: ['QA Director', 'Administrator', 'Clinical Manager'],
      active_census: 42,
      discharged_count: 7,
      recert_count: 5,
      high_acuity_count: 6,
      hospitalizations: 2,
      falls_total: 1,
      infections_total: 3,
      healthcare_associated: 1,
      pips: [{ id: 'PIP-LIVE-JSON', title: 'Falls reduction', status: 'open' }],
    };
    const text = JSON.stringify(source);
    const parsed = parseSourceFile({ fileName: 'flat-qapi.json', mimeType: 'application/json', text, byteLength: text.length });
    expect(parsed.records.some((r) => r.pointer === '$')).toBe(true);

    const bundle = deriveQapiBundle(parsed, '2026-05-07');
    expect(bundle.sourceMode).toBe('heuristic_records');
    expect(bundle.meetingDetails.attendeeRoster.value).toBe('QA Director, Administrator, Clinical Manager');
    expect(bundle.censusPopulation.activeCensus.value).toBe(42);
    expect(bundle.censusPopulation.dischargedCount.value).toBe(7);
    expect(bundle.censusPopulation.recertificationCount.value).toBe(5);
    expect(bundle.censusPopulation.highAcuityCount.value).toBe(6);
    expect(bundle.adverseEvents.hospitalizationsTotal.value).toBe(2);
    expect(bundle.adverseEvents.fallsTotal.value).toBe(1);
    expect(bundle.adverseEvents.infectionsTotal.value).toBe(3);
    expect(bundle.infectionControl.healthcareAssociated.value).toBe(1);
    expect(bundle.pipCorrectiveAction).toHaveLength(1);
    expect(bundle.pipCorrectiveAction[0].issueSummary).toBe('Falls reduction');
    expect(bundle.censusPopulation.activeCensus.confidence).toBe('low');
    expect(bundle.censusPopulation.activeCensus.needsReview).toBe(true);
  });

  it('never produces a shell — derives real counts with source quotes and needsReview flags from a messy upload', () => {
    const parsed = parseSourceFile({ fileName: '2026-QAPI-Mock.json', mimeType: 'application/json', text: MESSY_UPLOAD_TEXT, byteLength: MESSY_UPLOAD_TEXT.length });
    expect(parsed.parseStatus).toBe('parsed');
    expect(parsed.records.length).toBeGreaterThan(0);

    const bundle = deriveQapiBundle(parsed, '2026-06-30');
    expect(bundle.sourceMode).toBe('heuristic_records');

    // Real signal recovered from the messy upload, not invented.
    expect(bundle.highRiskRollup.topFlags.value).toBeTruthy();
    expect(bundle.highRiskRollup.topFlags.confidence).toBe('low');
    expect(bundle.highRiskRollup.topFlags.needsReview).toBe(true);
    expect(bundle.highRiskRollup.topFlags.sourceQuotes.length).toBeGreaterThan(0);
    // Counts both the clinician record carrying disciplinaryActions AND the
    // nested action object the JSON walker also emits as its own record.
    expect(bundle.highRiskRollup.clinicianDisciplinaryActionCount.value).toBe(2);

    // PIP trigger candidates are derived from the embedded pipHistory, with a
    // source quote attached and qapiReviewRequired always true.
    expect(bundle.pipCorrectiveAction.length).toBe(1);
    expect(bundle.pipCorrectiveAction[0].qapiReviewRequired).toBe(true);
    expect(bundle.pipCorrectiveAction[0].sourceQuotes.length).toBeGreaterThan(0);

    // Concepts genuinely absent from this upload must say so, never invent a value.
    expect(bundle.censusPopulation.activeCensus.value).toBeNull();
    expect(bundle.censusPopulation.activeCensus.confidence).toBe('none');
    expect(bundle.censusPopulation.activeCensus.needsReview).toBe(true);
  });

  it('returns a fully-populated "no evidence" bundle (not an exception) for content with no parseable records', () => {
    const text = '   ';
    const parsed = parseSourceFile({ fileName: 'blank.txt', mimeType: 'text/plain', text, byteLength: text.length });
    const bundle = deriveQapiBundle(parsed, '2026-06-30');
    expect(bundle.sourceMode).toBe('none');
    expect(bundle.censusPopulation.activeCensus.confidence).toBe('none');
  });
});
