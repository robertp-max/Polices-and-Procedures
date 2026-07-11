/* Raw narrative-text QAPI derivation (Path 3) — regression tests for the
   "1-page empty draft" case: a plain-text quarterly dataset upload parses to
   ONE text record, so record-counting alone derives nothing. The fixture
   mirrors the real synthetic Q2 2026 mock dataset, including its pathological
   run-together table cells ("initiatedMOCK-AE-002", "✅ PresentMOCK-CLIN-…"). */

import { describe, it, expect } from 'vitest';
import { parseSourceFile, mergeParsedFiles } from '../../../evidence/intake/fileParsing';
import {
  deriveQapiBundle,
  extractQapiTextAggregates,
  extractRecordSegments,
  extractDashboardRows,
  extractSignoffRecords,
  segmentQapiSourceByQuarter,
  selectQuarterSegment,
} from './qapiIntakeAdapter';
import { buildQapiFormDrafts } from '../qapiFormFiller';
import { generateQapiPacketPreview, buildDerivedRollup } from '../../../../v6/screens/evidence/alpha/qapiPacketDriver';

const RAW_DATASET = `QAPI Q2 2026 — SYNTHETIC RAW MOCK DATASET
Quarter: Q2 2026 (April 1 – June 30, 2026)
Workflow: QA-WF-03 — Quarterly QAPI Committee Review
Required Sign-offs: Administrator, Clinical Manager, QAPI Committee Chair

SECTION 1 — PATIENT CENSUS
Total Q2 Episodes: 100 active at start of Q2 + 12 new SOC admissions during Q2 = 112 episodes tracked
Episode types: SOC (8), ROC (6), Recert (54), Continuing (34), Discharge (18), Transfer (4)
Hospitalization events: 7 patients hospitalized during Q2 (MOCK-PT-0013, 0027, 0041, 0053, 0067, 0079, 0088)
Missed visits: 106 (3.7% miss rate — above 3% threshold, PIP trigger #5)

complaint_idpatient_iddatecategoryMOCK-CMP-001MOCK-PT-00092026-04-12CommunicationResolvedMOCK-CMP-002MOCK-PT-00312026-04-18SchedulingResolvedMOCK-CMP-003MOCK-PT-00452026-05-03CommunicationMOCK-CMP-004MOCK-PT-00622026-05-14SchedulingOpenMOCK-CMP-005MOCK-PT-00732026-05-22CommunicationMOCK-CMP-006MOCK-PT-00812026-06-04SchedulingMOCK-CMP-007MOCK-PT-00912026-06-17CommunicationOpen
Complaint trend: 7 complaints Q2 vs. 4 Q1 = 75% increase.

SECTION 3 — QUALITY METRIC OBSERVATIONS
metric_idindicatormonthnumeratordenominatorratethresholdstatusQM-APR-001Acute Care Hospitalization RateApril 20263983.1%≤4.0%✅ On TargetQM-APR-002OASIS Accuracy RateApril 2026789284.8%≥90%🔴 Below ThresholdQM-APR-003Visit Documentation Timeliness (<24h)April 202657864290.0%≥95%⚠️ CautionQM-APR-004POC Documentation CompletenessApril 2026829883.7%≥90%🔴 Below ThresholdQM-APR-005Medication Reconciliation at SOC/ROCApril 2026141877.8%≥95%🔴 Below ThresholdQM-APR-006Missed Visit RateApril 2026288763.2%≤3.0%🔴 Below ThresholdQM-APR-007Discharge Documentation CompletenessApril 2026111478.6%≥90%🔴 Below ThresholdQM-APR-008Patient Satisfaction (Overall)April 2026––82%≥85%⚠️ CautionQM-MAY-001Acute Care Hospitalization RateMay 20262992.0%≤4.0%✅ On TargetQM-MAY-002OASIS Accuracy RateMay 2026738982.0%≥90%🔴 Below ThresholdQM-MAY-003Visit Documentation TimelinessMay 202654163485.3%≥95%🔴 Below ThresholdQM-MAY-004POC Documentation CompletenessMay 2026779779.4%≥90%🔴 Below ThresholdQM-MAY-005Medication Reconciliation at SOC/ROCMay 2026111573.3%≥95%🔴 Below ThresholdQM-MAY-006Missed Visit RateMay 2026348923.8%≤3.0%🔴 Below ThresholdQM-MAY-007Discharge Documentation CompletenessMay 2026101662.5%≥90%🔴 Below ThresholdQM-MAY-008Patient Satisfaction (Overall)May 2026––80%≥85%🔴 Below ThresholdQM-JUN-001Acute Care Hospitalization RateJune 202621002.0%≤4.0%✅ On TargetQM-JUN-002OASIS Accuracy RateJune 2026748884.1%≥90%🔴 Below Threshold — 3rd consecutive monthQM-JUN-003Visit Documentation TimelinessJune 202654863786.0%≥95%🔴 Below ThresholdQM-JUN-004POC Documentation CompletenessJune 2026749677.1%≥90%🔴 Below Threshold — deterioratingQM-JUN-005Medication Reconciliation at SOC/ROCJune 2026121770.6%≥95%🔴 Below Threshold — 3rd consecutive monthQM-JUN-006Missed Visit RateJune 2026449794.5%≤3.0%🔴 Below Threshold — worsening trendQM-JUN-007Discharge Documentation CompletenessJune 202681361.5%≥90%🔴 Below Threshold — 3rd consecutive monthQM-JUN-008Patient Satisfaction (Overall)June 2026––79%≥85%🔴 Below Threshold

SECTION 4 — FEEDER AUDITS
CL-WF-29Medication Reconciliation AuditQ2 20262073.5%5 discrepancies at SOC/ROC2026-07-01Complete
CL-WF-32Timeliness AuditQ2 20263586.9%Late SOC 2, Late F2F 32026-07-01Complete
CO-WF-28F2F Encounter Compliance40 episodes90.0%4 late/missing F2F2026-07-02Complete
QA-WF-16PIP Inventory ReviewQ2 20262 active PIPs per plan; 8 PIP triggers identified2026-07-02Complete

SECTION 5 — ADVERSE EVENTS
event_idstatusMOCK-AE-001MOCK-PT-0027MOCK-CLIN-0009Unplanned HospitalizationLevel 32026-04-08Patient admitted — CHF exacerbation.RCA Complete — CAP initiatedMOCK-AE-002MOCK-PT-0041MOCK-CLIN-0017Medication ErrorLevel 22026-04-22Wrong dose documentation.Investigation complete — coaching issuedMOCK-AE-003MOCK-PT-0053MOCK-CLIN-0006Unplanned HospitalizationLevel 32026-05-03Patient admitted — wound infection.RCA Complete — CAP initiatedMOCK-AE-004MOCK-PT-0062MOCK-CLIN-0022Near-Miss — Missed MedLevel 12026-05-15Closed — no harmMOCK-AE-005MOCK-PT-0067MOCK-CLIN-0017Unplanned HospitalizationLevel 22026-05-28Investigation complete — CAP initiatedMOCK-AE-006MOCK-PT-0079MOCK-CLIN-0004Adverse Drug ReactionLevel 22026-06-10Investigation completeMOCK-AE-007MOCK-PT-0088MOCK-CLIN-0010Unplanned HospitalizationLevel 32026-06-18Patient admitted — sepsis.RCA initiated

SECTION 6 — INFECTION SURVEILLANCE
infection_idMOCK-INF-001MOCK-PT-0006MOCK-CLIN-0005Wound / Surgical Site2026-04-142026-05-01YesNoIsolation protocol initiated.MOCK-INF-002MOCK-PT-0012MOCK-CLIN-0009Wound / Surgical Site2026-04-282026-05-12YesYes — Cluster declared.MOCK-INF-003MOCK-PT-0020MOCK-CLIN-0009Wound / Surgical Site2026-05-022026-05-18YesYes — re-education delivered.MOCK-INF-004MOCK-PT-0033MOCK-CLIN-0002UTI2026-05-102026-05-20SuspectedNotracked.MOCK-INF-005MOCK-PT-0053MOCK-CLIN-0006Wound — Repeat2026-05-03Open at Q2 closeYesNoPPE audit ordered.MOCK-INF-006MOCK-PT-0075MOCK-CLIN-0001Respiratory (ILI)2026-06-052026-06-15SuspectedNoMonitored.MOCK-INF-007MOCK-PT-0091MOCK-CLIN-0003UTI2026-06-22SuspectedNoUnder treatment.
Infection trend: 5 confirmed HAIs Q2 vs. 2 Q1 = 150% increase — PIP trigger #6.

SECTION 7 — PIP SOURCE RECORDS
M/GG items inconsistently supportedPIP — OASIS Accuracy ImprovementPIP Charter initiatedMOCK-PIP-T-002PIP
missing goals in 20.8% of recordsPIP — POC Documentation QualityPIP Charter initiatedMOCK-PIP-T-003PIP
late notes over 24 hoursPIP — Documentation TimelinessExisting PIP — remeasurement Q2MOCK-PIP-T-004PIP
linked to adverse eventPIP — Medication ReconciliationPIP Charter initiatedMOCK-PIP-T-005PIP
escalating trend Q2PIP — Missed Visit Protocol CompliancePIP Charter initiatedMOCK-PIP-T-006PIP
cluster declared April/MayPIP — Wound Infection PreventionPIP Charter initiatedMOCK-PIP-T-007PIP
7 complaints Q2 vs. 4 Q1PIP — Patient Communication & SchedulingPIP Charter initiatedMOCK-PIP-T-008PIP
4 cases in Q2PIP — Documentation-to-Claim AccuracyPIP Charter initiated

SECTION 8 — CAP ACTION ITEMS
cap_idstatusCAP-001RCA-001 / PIP-T-001OpenCAP-002RCA-002OpenCAP-003PIP-T-003OpenCAP-004PIP-T-005OpenCAP-005PIP-T-007Open

SECTION 9 — DISCIPLINARY REVIEW TRIGGERS (5 Required)
MOCK-DT-001disciplinary_reviewPending HR reviewMOCK-DT-002disciplinary_reviewPendingMOCK-DT-003disciplinary_reviewPendingMOCK-DT-004disciplinary_reviewPendingMOCK-DT-005disciplinary_reviewPending
GBE-005: 5 disciplinary review triggers — Governing Body notified.

SECTION 10 — MINUTES SOURCE RECORDS
Christine LeeQAPI Committee Chair✅ PresentAngela MoralesClinical Manager✅ PresentEdward NakamuraAdministrator✅ PresentPatricia ReyesRN Rep✅ PresentFatima DialloPT Rep✅ PresentPhillip MbekiOT Rep✅ PresentNina JohanssonHHA Supervisor✅ PresentDonna ReidScheduling Rep✅ Present
Quorum: 8/8 standing members present. Quorum met
Administrator Sign-off: MOCK-CLIN-0029 — Edward Nakamura — 2026-07-10
Clinical Manager Sign-off: MOCK-CLIN-0026 — Angela Morales — 2026-07-10
QAPI Committee Chair Sign-off: MOCK-CLIN-0030 — Christine Lee — 2026-07-10`;

function parseTxt(text: string, fileName = 'QAPI Q2 2026 — SYNTHETIC RAW MOCK D.txt') {
  return parseSourceFile({ fileName, mimeType: 'text/plain', byteLength: text.length, text });
}

describe('extractQapiTextAggregates — raw quarterly dataset', () => {
  const agg = extractQapiTextAggregates(RAW_DATASET);

  it('recovers census / episode aggregates', () => {
    expect(agg.activeCensus?.value).toBe(100);
    expect(agg.episodesTotal?.value).toBe(112);
    expect(agg.dischargedCount?.value).toBe(18);
    expect(agg.recertificationCount?.value).toBe(54);
  });

  it('recovers adverse-event / visit aggregates', () => {
    expect(agg.hospitalizations?.value).toBe(7);
    expect(agg.missedVisits?.value).toBe(106);
    expect(agg.adverseEventsCount?.value).toBe(7); // glued MOCK-AE-001…007
  });

  it('recovers complaint / infection aggregates despite run-together cells', () => {
    expect(agg.complaintsCount?.value).toBe(7);
    expect(agg.infectionLineListCount?.value).toBe(7);
    expect(agg.confirmedHais?.value).toBe(5);
  });

  it('recovers PIP / CAP / disciplinary families with all 8 named PIPs', () => {
    expect(agg.pipTriggerCount?.value).toBe(8);
    expect(agg.pipNames.map((p) => p.name)).toEqual([
      'OASIS Accuracy Improvement',
      'POC Documentation Quality',
      'Documentation Timeliness',
      'Medication Reconciliation',
      'Missed Visit Protocol Compliance',
      'Wound Infection Prevention',
      'Patient Communication & Scheduling',
      'Documentation-to-Claim Accuracy',
    ]);
    expect(agg.capCount?.value).toBe(5);
    expect(agg.disciplinaryCount?.value).toBe(5);
  });

  it('recovers quorum, attendance, and the 3 sign-off roles (not the "Required" header)', () => {
    expect(agg.quorum).toMatchObject({ present: 8, total: 8, met: true });
    expect(agg.attendeePresentCount?.value).toBe(8);
    expect(agg.signoffRoles).toEqual(['Administrator', 'Clinical Manager', 'QAPI Committee Chair']);
  });

  it('recovers documentation-integrity counts', () => {
    expect(agg.oasisLateSoc?.value).toBe(2);
    expect(agg.lateOrMissingF2f?.value).toBe(4);
    expect(agg.medReconDiscrepancies?.value).toBe(5);
  });
});

describe('deriveQapiBundle — narrative text upload', () => {
  const parsed = parseTxt(RAW_DATASET);
  const bundle = deriveQapiBundle(parsed, '2026-07-10');

  it('parses to a single text record (the case Path 2 alone cannot count)', () => {
    expect(parsed.records.length).toBe(1);
  });

  it('populates the bundle with low-confidence, quoted metrics instead of "no evidence"', () => {
    expect(bundle.sourceMode).toBe('heuristic_records');
    expect(bundle.censusPopulation.activeCensus.value).toBe(100);
    expect(bundle.adverseEvents.hospitalizationsTotal.value).toBe(7);
    expect(bundle.adverseEvents.infectionsTotal.value).toBe(7);
    expect(bundle.highRiskRollup.clinicianDisciplinaryActionCount.value).toBe(5);
    expect(bundle.meetingDetails.quorumStatus.value).toBe('8/8 present — quorum met');
    expect(bundle.meetingDetails.attendeeRoster.value).toBe('8 attendees recorded present');
    expect(bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch.value).toBe(5);
    expect(bundle.infectionControl.healthcareAssociated.value).toBe(5);
    // Every derived metric stays flagged for review.
    expect(bundle.censusPopulation.activeCensus.confidence).toBe('low');
    expect(bundle.censusPopulation.activeCensus.needsReview).toBe(true);
    expect(bundle.censusPopulation.activeCensus.sourceQuotes.length).toBeGreaterThan(0);
  });

  it('builds all 8 PIP corrective-action candidates from the named triggers', () => {
    expect(bundle.pipCorrectiveAction).toHaveLength(8);
    expect(bundle.pipCorrectiveAction[0].trigger).toBe('PIP — OASIS Accuracy Improvement');
    expect(bundle.pipCorrectiveAction.every((p) => p.sourceQuotes.length > 0)).toBe(true);
  });

  it('notes how many aggregates were recovered', () => {
    expect(bundle.overallNote).toMatch(/Recovered \d+ aggregate metric group/);
  });
});

describe('deriveQapiBundle — prompt-artifact detection', () => {
  it('warns when the source reads like an AI generation prompt, not data', () => {
    const promptText = `Hi Claude, please generate a complete synthetic RAW Home Health Agency operating dataset for Q2 2026 QAPI packet testing. Important clarification: "HHA" here means the agency. Include patients, clinicians, audits, adverse events, infections, complaints, and meeting minutes source records. ${'Filler sentence to exceed the minimum length threshold. '.repeat(4)}`;
    const bundle = deriveQapiBundle(parseTxt(promptText, 'Mock_Record_Qapi_Generation_Prompt.txt'), '2026-07-10');
    expect(bundle.overallNote).toMatch(/reads like an AI generation prompt/i);
  });

  it('does not warn on the real dataset', () => {
    const bundle = deriveQapiBundle(parseTxt(RAW_DATASET), '2026-07-10');
    expect(bundle.overallNote).not.toMatch(/generation prompt/i);
  });
});

describe('buildDerivedRollup — unstructured dump → canonical rollup', () => {
  const parsed = parseTxt(RAW_DATASET);
  const bundle = deriveQapiBundle(parsed, '2026-07-10');
  const agg = extractQapiTextAggregates(RAW_DATASET);
  const { roll, ref, opts } = buildDerivedRollup(bundle, agg, '2026-07-10');

  it('honors the quarter declared in the source (July meeting reviewing Q2 = FINAL Q2)', () => {
    expect(agg.reviewQuarter).toBe('2026-Q2');
    expect(roll.window.quarterLabel).toBe('Q2 2026');
    expect(roll.window.packetType).toBe('final');
  });

  it('maps derived values into the rollup without invention', () => {
    expect(roll.census.activeCensus).toBe(100);
    expect(roll.census.discharged).toBe(18);
    expect(roll.census.recertDue).toBe(54);
    expect(roll.incidents.total).toBe(7);
    expect(roll.infections.total).toBe(7);
    expect(roll.infections.healthcareAssociated).toBe(5);
    expect(roll.infections.communityAcquired).toBe(2); // inferred, exception recorded
    expect(roll.documentation.medReconMismatch).toBe(5);
    expect(roll.highRisk.systemicThemes).toHaveLength(8); // the 8 PIP triggers
  });

  it('records every unknown as a source-data exception instead of inventing zeros silently', () => {
    expect(roll.exceptions[0].reason).toMatch(/unstructured source dump/i);
    expect(roll.exceptions.some((e) => e.path === 'incidents.openRca')).toBe(true);
    expect(roll.exceptions.some((e) => e.path === 'infections.communityAcquired')).toBe(true);
  });

  it('carries disciplinary triggers into the addendum reference and sign-off roles into approvers', () => {
    expect(ref.personnelActionReviewsOpened).toBe(5);
    expect(opts.approvers?.map((a) => a.role)).toEqual(['Administrator', 'Clinical Manager', 'QAPI Committee Chair']);
    expect(opts.quorumOverride).toBe('8/8 present — quorum met');
  });
});

describe('line-item segment extraction — real rows despite run-together cells', () => {
  it('recovers adverse-event rows with date, type, severity, and status', () => {
    const ae = extractRecordSegments(RAW_DATASET, 'AE');
    expect(ae).toHaveLength(7);
    const ae1 = ae.find((s) => s.id === 'AE-001')!;
    expect(ae1.date).toBe('2026-04-08');
    expect(ae1.category).toBe('Unplanned Hospitalization');
    expect(ae1.severity).toBe('Level 3');
  });

  it('recovers infection and complaint rows with onset dates and categories', () => {
    const inf = extractRecordSegments(RAW_DATASET, 'INF');
    expect(inf).toHaveLength(7);
    expect(inf[0].date).toBe('2026-04-14');
    const cmp = extractRecordSegments(RAW_DATASET, 'CMP');
    expect(cmp).toHaveLength(7);
    expect(cmp.filter((s) => s.category === 'Communication')).toHaveLength(4);
    expect(cmp.filter((s) => s.category === 'Scheduling')).toHaveLength(3);
  });

  it('recovers CAP and disciplinary rows with dates/status', () => {
    expect(extractRecordSegments(RAW_DATASET, 'CAP')).toHaveLength(5);
    const dt = extractRecordSegments(RAW_DATASET, 'DT');
    expect(dt).toHaveLength(5);
    expect(dt.every((s) => /Pending/.test(s.status ?? ''))).toBe(true);
  });

  it('recovers named sign-off records', () => {
    expect(extractSignoffRecords(RAW_DATASET)).toEqual([
      { role: 'Administrator', name: 'Edward Nakamura', date: '2026-07-10' },
      { role: 'Clinical Manager', name: 'Angela Morales', date: '2026-07-10' },
      { role: 'QAPI Committee Chair', name: 'Christine Lee', date: '2026-07-10' },
    ]);
  });
});

describe('multi-document dumps — Brad reads EVERY file', () => {
  it('merges parsed files so records from all documents feed derivation', () => {
    const half1 = RAW_DATASET.slice(0, RAW_DATASET.indexOf('SECTION 5'));
    const half2 = RAW_DATASET.slice(RAW_DATASET.indexOf('SECTION 5'));
    const merged = mergeParsedFiles([
      { fileName: 'census-and-audits.txt', parsed: parseTxt(half1, 'census-and-audits.txt') },
      { fileName: 'events-and-minutes.txt', parsed: parseTxt(half2, 'events-and-minutes.txt') },
    ]);
    expect(merged.records).toHaveLength(2);
    expect(merged.records[0].pointer).toContain('census-and-audits.txt');
    const bundle = deriveQapiBundle(merged, '2026-07-10');
    // Values from file 1 (census) AND file 2 (quorum/minutes) both present.
    expect(bundle.censusPopulation.activeCensus.value).toBe(100);
    expect(bundle.meetingDetails.quorumStatus.value).toBe('8/8 present — quorum met');
  });
});

describe('buildQapiFormDrafts — Brad fills the required forms from the dump', () => {
  const parsed = parseTxt(RAW_DATASET);
  const bundle = deriveQapiBundle(parsed, '2026-07-10');
  const agg = extractQapiTextAggregates(RAW_DATASET);
  const drafts = buildQapiFormDrafts({ bundle, agg, text: RAW_DATASET, eventId: 'qapi_meeting-20260507-08', eventDateISO: '2026-07-10' });
  const byId = new Map(drafts.map((d) => [d.formId, d]));

  it('drafts every required form for the QAPI meeting event', () => {
    for (const formId of ['QA-FM-001', 'QA-FM-002', 'QA-FM-003', 'QA-FM-004', 'QA-FM-005', 'QA-FM-006', 'QA-FM-021', 'CO-FM-024', 'EN-FM-022', 'GV-FM-023']) {
      expect(byId.has(formId), formId).toBe(true);
    }
  });

  it('fills the minutes (QA-FM-001) with quorum, decisions, and the 3 sign-off records', () => {
    const minutes = byId.get('QA-FM-001')!;
    const field = (label: string) => minutes.fields.find((f) => f.label === label)!;
    expect(field('Quorum').value).toBe('8/8 present — quorum met');
    expect(field('Reporting quarter').value).toBe('2026-Q2');
    expect(field('New PIP decisions').value).toContain('OASIS Accuracy Improvement');
    expect(minutes.lineItems?.rows).toHaveLength(3);
    expect(minutes.lineItems?.rows[0]).toEqual(['Administrator', 'Edward Nakamura', '2026-07-10']);
  });

  it('fills the dashboard (QA-FM-003) with all 24 monthly indicator rows', () => {
    const rows = extractDashboardRows(RAW_DATASET);
    expect(rows).toHaveLength(24);
    expect(rows.find((r) => r.metricId === 'QM-APR-002')?.indicator).toBe('OASIS Accuracy Rate');
    expect(byId.get('QA-FM-003')!.lineItems?.rows).toHaveLength(24);
  });

  it('fills RCA / CAP / infection / complaint forms with real line items', () => {
    expect(byId.get('QA-FM-004')!.lineItems?.rows).toHaveLength(7);
    expect(byId.get('QA-FM-005')!.lineItems?.rows).toHaveLength(5);
    expect(byId.get('QA-FM-006')!.lineItems?.rows).toHaveLength(7);
    expect(byId.get('CO-FM-024')!.lineItems?.rows).toHaveLength(7);
    expect(byId.get('QA-FM-002')!.lineItems?.rows).toHaveLength(8);
  });

  it('marks non-derivable fields for manual entry instead of inventing values', () => {
    const scorecard = byId.get('EN-FM-022')!;
    expect(scorecard.note).toMatch(/manual/i);
    for (const d of drafts) {
      for (const f of d.fields) {
        if (f.value == null) expect(f.confidence).toBe('none');
      }
    }
  });
});

describe('generateQapiPacketPreview — FULL packet from an unstructured dump', () => {
  it('renders the full survey packet + Source Derivation appendix (never a thin draft)', async () => {
    const parsed = parseTxt(RAW_DATASET);
    const bundle = deriveQapiBundle(parsed, '2026-07-10');
    const preview = await generateQapiPacketPreview({
      parsed,
      bundle,
      eventId: 'qapi_meeting-20260710-08',
      eventTitle: 'Q2 QAPI Review',
      eventDateISO: '2026-07-10',
    });
    expect(preview.status).toBe('generated');
    // 8 full-packet pages + 3 derivation-appendix pages + 10 filled form drafts.
    expect(preview.pageCount).toBe(21);
    const titles = preview.pages.map((p) => p.title);
    expect(titles.some((t) => /QAPI Committee Packet/.test(t))).toBe(true);
    expect(titles.some((t) => /Agenda & Quorum/.test(t))).toBe(true);
    expect(titles.some((t) => /QAPI Data Dashboard/.test(t))).toBe(true);
    expect(titles.some((t) => /Approval & Signatures/.test(t))).toBe(true);
    expect(titles.filter((t) => /Source Derivation/.test(t))).toHaveLength(3);
    expect(titles.filter((t) => /^Form Draft — /.test(t))).toHaveLength(10);
    const minutesPage = preview.pages.find((p) => /Form Draft — QA-FM-001/.test(p.title))!;
    expect(minutesPage.html).toContain('Edward Nakamura');
    expect(minutesPage.html).toContain('FORM DRAFT — BRAD FILLED FROM SOURCE DUMP');
    // Derived notice + review flags carried through.
    expect(preview.pages[0].html).toContain('BRAD-DERIVED DRAFT — REQUIRES HUMAN REVIEW');
    const agenda = preview.pages.find((p) => /Agenda & Quorum/.test(p.title))!;
    expect(agenda.html).toContain('8/8 present — quorum met');
    const dashboard = preview.pages.find((p) => /QAPI Data Dashboard/.test(p.title))!;
    expect(dashboard.html).toContain('100'); // active census
    const signatures = preview.pages.find((p) => /Approval & Signatures/.test(p.title))!;
    expect(signatures.html).toContain('QAPI Committee Chair');
    const appendix = preview.pages.find((p) => /Source Derivation — Adverse Events/.test(p.title))!;
    expect(appendix.html).toContain('OASIS Accuracy Improvement');
  });
});

/* ─── Multi-quarter contamination guard (the "Q2 data in a Q1 packet" bug) ─── */

// Two quarters back-to-back, each with the real dataset-marker + meeting-date
// header and the Q1-style glued phrasings + quarter-infixed record IDs.
const MULTI_QUARTER = `Dataset ID: QAPI-Q1-DS-001 | Companion Cheat Sheet: QAPI-Q1-CS-001
Agency: Sunrise Valley Home Health Agency (SVHHA) | NPI: 1234567890 (synthetic)
Quarter: Q1 2026 (January 1 – March 31, 2026)
QAPI Meeting Date: 2026-04-09
SECTION 2 — PATIENT CENSUS
metricvalueActive at Jan 1105 patientsDischarged Q114 patientsActive at Mar 31 (Q1 close)120 patientsTotal episodes tracked Q1127 episodesHospitalizations Q15 (MOCK-PT-0009, 0022, 0047, 0071, 0098)
SECTION 6 — ADVERSE EVENTS
AE-Q1-001MOCK-PT-0009Hospitalization2026-01-18HighRCA Complete
AE-Q1-002MOCK-PT-0022Fall2026-02-05MediumRCA Complete
SECTION 10 — DISCIPLINARY ACTION TRIGGERS (5 Required)

Dataset ID: QAPI-Q2-DS-001 | Companion Cheat Sheet: QAPI-Q2-CS-001
Agency: Sunrise Valley Home Health Agency (SVHHA) | NPI: 1234567890 (synthetic)
Quarter: Q2 2026 (April 1 – June 30, 2026)
QAPI Meeting Date: 2026-07-10
SECTION 1 — PATIENT CENSUS
100 active at start of Q2. Discharge (18). Recert (54).
7 patients hospitalized during Q2.
Quorum: 8/8 standing members present. Quorum met.
`;

describe('multi-quarter segmentation (fixes Q1/Q2 cross-contamination)', () => {
  const parsed = parseTxt(MULTI_QUARTER);

  it('splits the dump into per-quarter segments with provenance', () => {
    const segs = segmentQapiSourceByQuarter(MULTI_QUARTER);
    expect(segs.map((s) => s.quarterLabel)).toEqual(['Q1 2026', 'Q2 2026']);
    expect(segs[0].datasetId).toBe('QAPI-Q1-DS-001');
    expect(segs[0].meetingDate).toBe('2026-04-09');
    expect(segs[1].meetingDate).toBe('2026-07-10');
    expect(segs.every((s) => s.synthetic)).toBe(true);
    expect(segs.every((s) => /Sunrise Valley/.test(s.agency ?? ''))).toBe(true);
  });

  it('selects the quarter by the event meeting date (not calendar quarter)', () => {
    const segs = segmentQapiSourceByQuarter(MULTI_QUARTER);
    // Q2 review meeting is in July (calendar Q3) — meeting-date match still picks Q2.
    expect(selectQuarterSegment(segs, { eventDateISO: '2026-07-10' }).segment?.quarterLabel).toBe('Q2 2026');
    expect(selectQuarterSegment(segs, { eventDateISO: '2026-04-09' }).segment?.quarterLabel).toBe('Q1 2026');
  });

  it('a Q1 packet gets ONLY Q1 values — no Q2 bleed', () => {
    const b = deriveQapiBundle(parsed, '2026-04-09');
    expect(b.sourceMode).not.toBe('none');
    expect(b.censusPopulation.activeCensus.value).toBe(120);      // Q1 close, not Q2's 100
    expect(b.adverseEvents.hospitalizationsTotal.value).toBe(5);   // Q1's 5, not Q2's 7
    // Q2-only signals must be absent from a Q1 packet.
    expect(b.meetingDetails.quorumStatus.value).toBeNull();        // quorum line is in the Q2 block
  });

  it('a Q2 packet gets ONLY Q2 values — no Q1 bleed', () => {
    const b = deriveQapiBundle(parsed, '2026-07-10');
    expect(b.censusPopulation.activeCensus.value).toBe(100);
    expect(b.adverseEvents.hospitalizationsTotal.value).toBe(7);
    expect(b.meetingDetails.quorumStatus.value).toContain('8/8'); // quorum only in Q2 block
  });

  it('fails closed when no quarter matches the event (no contaminated packet)', () => {
    const b = deriveQapiBundle(parsed, '2026-02-05'); // the wrong date from the bad packet
    expect(b.sourceMode).toBe('none');
    expect(b.overallNote).toContain('SOURCE CONFLICT');
  });

  it('quarter-infixed record IDs (AE-Q1-001) are recognized', () => {
    const q1Text = segmentQapiSourceByQuarter(MULTI_QUARTER)[0].text;
    const ae = extractRecordSegments(q1Text, 'AE');
    expect(ae.map((s) => s.id)).toEqual(['AE-Q1-001', 'AE-Q1-002']);
  });
});

describe('generateQapiPacketPreview — dump-and-go multi-quarter (auto-generate all)', () => {
  const parsed = parseTxt(MULTI_QUARTER);

  it('with no quarter picked, generates a clean packet for EVERY quarter (concatenated)', async () => {
    const preview = await generateQapiPacketPreview({
      parsed, bundle: deriveQapiBundle(parsed, '2026-02-05'), // conflicting date, no pick
      eventId: 'evt-x', eventTitle: 'QAPI', eventDateISO: '2026-02-05',
    });
    expect(preview.status).toBe('generated');
    const html = preview.pages.map((p) => p.html).join('');
    // Both quarters' packets are present, each on its own cover.
    expect(html).toMatch(/Q1 2026 QAPI Committee Packet/);
    expect(html).toMatch(/Q2 2026 QAPI Committee Packet/);
    // Page numbers are continuous across the concatenated quarters.
    expect(preview.pages[0].pageNumber).toBe(1);
    expect(preview.pages[preview.pages.length - 1].pageNumber).toBe(preview.pages.length);
  });

  it('with a quarter explicitly picked, generates ONLY that quarter', async () => {
    const preview = await generateQapiPacketPreview({
      parsed, bundle: deriveQapiBundle(parsed, '2026-02-05', '2026-Q2'),
      eventId: 'evt-x', eventTitle: 'QAPI', eventDateISO: '2026-02-05', targetQuarter: '2026-Q2',
    });
    const html = preview.pages.map((p) => p.html).join('');
    expect(html).toMatch(/Q2 2026 QAPI Committee Packet/);
    expect(html).not.toMatch(/Q1 2026 QAPI Committee Packet/);
  });
});
