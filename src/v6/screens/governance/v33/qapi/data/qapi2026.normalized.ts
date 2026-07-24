// Normalized 2026 QAPI fixture, derived from qapi/source/MOCK_2026_QAPI.txt.
//
// This is a checked-in normalized fixture with a provenance manifest (§3.2
// acceptable pattern). It is the SINGLE normalized source of truth consumed by
// the Governing Body packet workspace and the tabletop. Source contradictions
// are preserved (see validationFindings), never silently repaired. Board-facing
// records are de-identified; patient names never appear here.
//
// SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION.

import type {
  ProvenanceRef,
  QapiQuarter,
  QapiYear2026,
  QualityMetricSeries,
} from '../model/qapi2026.types';

const SRC = 'qapi/source/MOCK_2026_QAPI.txt';

function prov(
  section: string,
  ids: string[],
  kind: ProvenanceRef['sourceKind'] = 'source_recovered',
  extra: Partial<ProvenanceRef> = {},
): ProvenanceRef {
  return {
    sourceKind: kind,
    sourceFile: SRC,
    sourceSection: section,
    sourceRecordIds: ids,
    confidence: 'high',
    reviewRequired: kind !== 'source_recovered',
    ...extra,
  };
}

// ---- Q1 quality metrics (Section 4 — monthly observations) ----------------
const Q1_METRICS: QualityMetricSeries[] = [
  {
    metricId: 'OASIS_ACCURACY', indicator: 'OASIS Accuracy Rate', target: '≥90%', direction: 'higher_is_better',
    points: [{ month: 'Jan', numerator: 74, denominator: 90, rate: 82.2 }, { month: 'Feb', numerator: 77, denominator: 92, rate: 83.7 }, { month: 'Mar', numerator: 80, denominator: 95, rate: 84.2 }],
    status: 'below', pipTrigger: true, provenance: prov('Q1 §4 Quality Metric Observations', ['QM-Q1-001', 'QM-Q1-002', 'QM-Q1-003']),
  },
  {
    metricId: 'VISIT_DOC_TIMELINESS', indicator: 'Visit Documentation Timeliness (<24h)', target: '≥95%', direction: 'higher_is_better',
    points: [{ month: 'Jan', numerator: 101, denominator: 118, rate: 85.6 }, { month: 'Feb', numerator: 104, denominator: 120, rate: 86.7 }, { month: 'Mar', numerator: 106, denominator: 122, rate: 86.9 }],
    status: 'below', pipTrigger: true, provenance: prov('Q1 §4', ['QM-Q1-004', 'QM-Q1-005', 'QM-Q1-006']),
  },
  {
    metricId: 'MED_RECONCILIATION', indicator: 'Medication Reconciliation at SOC/ROC', target: '≥95%', direction: 'higher_is_better',
    points: [{ month: 'Jan', numerator: 16, denominator: 22, rate: 72.7 }, { month: 'Feb', numerator: 18, denominator: 23, rate: 78.3 }, { month: 'Mar', numerator: 19, denominator: 24, rate: 79.2 }],
    status: 'critical', pipTrigger: true, provenance: prov('Q1 §4', ['QM-Q1-007', 'QM-Q1-008', 'QM-Q1-009']),
  },
  {
    metricId: 'POC_GOAL_DOC', indicator: 'POC Goal Documentation Completeness', target: '≥92%', direction: 'higher_is_better',
    points: [{ month: 'Jan', numerator: 88, denominator: 110, rate: 80.0 }, { month: 'Feb', numerator: 90, denominator: 112, rate: 80.4 }, { month: 'Mar', numerator: 92, denominator: 115, rate: 80.0 }],
    status: 'below', pipTrigger: true, provenance: prov('Q1 §4', ['QM-Q1-010', 'QM-Q1-011', 'QM-Q1-012']),
  },
  {
    metricId: 'MISSED_VISIT_RATE', indicator: 'Missed Visit Rate', target: '≤2%', direction: 'lower_is_better',
    points: [{ month: 'Jan', numerator: 7, denominator: 185, rate: 3.8 }, { month: 'Feb', numerator: 8, denominator: 190, rate: 4.2 }, { month: 'Mar', numerator: 9, denominator: 195, rate: 4.6 }],
    status: 'critical', pipTrigger: true, provenance: prov('Q1 §4', ['QM-Q1-013', 'QM-Q1-014', 'QM-Q1-015']),
  },
  {
    metricId: 'HOSPITALIZATION_RATE', indicator: 'Hospitalization Rate', target: '≤3%', direction: 'lower_is_better',
    points: [{ month: 'Jan', numerator: 2, denominator: 105, rate: 1.9 }, { month: 'Feb', numerator: 2, denominator: 112, rate: 1.8 }, { month: 'Mar', numerator: 1, denominator: 118, rate: 0.8 }],
    status: 'within', pipTrigger: false, provenance: prov('Q1 §4', ['QM-Q1-016', 'QM-Q1-017', 'QM-Q1-018']),
  },
  {
    metricId: 'WOUND_INFECTION_RATE', indicator: 'Wound Infection Rate', target: '≤5%', direction: 'lower_is_better',
    points: [{ month: 'Jan', numerator: null, denominator: null, rate: 0.7 }, { month: 'Feb', numerator: null, denominator: null, rate: 3.3 }, { month: 'Mar', numerator: null, denominator: null, rate: 2.9 }],
    status: 'critical', pipTrigger: true,
    provenance: prov('Q1 §4', ['QM-Q1-019', 'QM-Q1-020', 'QM-Q1-021'], 'derived_from_source', { confidence: 'medium', derivation: 'Monthly numerator/denominator ambiguous in concatenated source; quarter status recovered as PIP-trigger spike per QM-Q1-020/021.' }),
  },
  {
    metricId: 'COMPLAINT_RESOLUTION_TIMELINESS', indicator: 'Complaint Resolution Timeliness (≤5 days)', target: '≥90%', direction: 'higher_is_better',
    points: [{ month: 'Jan', numerator: 4, denominator: 6, rate: 66.7 }, { month: 'Feb', numerator: 5, denominator: 7, rate: 71.4 }, { month: 'Mar', numerator: 5, denominator: 8, rate: 62.5 }],
    status: 'critical', pipTrigger: true, provenance: prov('Q1 §4', ['QM-Q1-022', 'QM-Q1-023', 'QM-Q1-024']),
  },
];

// ---- Q2 quality metrics (Section 3 — Apr/May/Jun) -------------------------
const Q2_METRICS: QualityMetricSeries[] = [
  {
    metricId: 'HOSPITALIZATION_RATE', indicator: 'Acute Care Hospitalization Rate', target: '≤4%', direction: 'lower_is_better',
    points: [{ month: 'Apr', numerator: 3, denominator: 98, rate: 3.1 }, { month: 'May', numerator: 2, denominator: 99, rate: 2.0 }, { month: 'Jun', numerator: 2, denominator: 100, rate: 2.0 }],
    status: 'within', pipTrigger: false, aggregateMasksSubgroup: true,
    provenance: prov('Q2 §3', ['QM-APR-001', 'QM-MAY-001', 'QM-JUN-001'], 'source_recovered', { derivation: 'Favorable aggregate hospitalization masks worsening documentation/med-rec/complaint subgroups this quarter.' }),
  },
  {
    metricId: 'OASIS_ACCURACY', indicator: 'OASIS Accuracy Rate', target: '≥90%', direction: 'higher_is_better',
    points: [{ month: 'Apr', numerator: 78, denominator: 92, rate: 84.8 }, { month: 'May', numerator: 73, denominator: 89, rate: 82.0 }, { month: 'Jun', numerator: 74, denominator: 88, rate: 84.1 }],
    status: 'below', pipTrigger: true, provenance: prov('Q2 §3', ['QM-APR-002', 'QM-MAY-002', 'QM-JUN-002']),
  },
  {
    metricId: 'MED_RECONCILIATION', indicator: 'Medication Reconciliation at SOC/ROC', target: '≥95%', direction: 'higher_is_better',
    points: [{ month: 'Apr', numerator: 14, denominator: 18, rate: 77.8 }, { month: 'May', numerator: 11, denominator: 15, rate: 73.3 }, { month: 'Jun', numerator: 12, denominator: 17, rate: 70.6 }],
    status: 'critical', pipTrigger: true, provenance: prov('Q2 §3', ['QM-APR-005', 'QM-MAY-005', 'QM-JUN-005'], 'source_recovered', { derivation: '3rd consecutive quarter below threshold; worsening.' }),
  },
  {
    metricId: 'POC_DOC_COMPLETENESS', indicator: 'POC Documentation Completeness', target: '≥90%', direction: 'higher_is_better',
    points: [{ month: 'Apr', numerator: 82, denominator: 98, rate: 83.7 }, { month: 'May', numerator: 77, denominator: 97, rate: 79.4 }, { month: 'Jun', numerator: 74, denominator: 96, rate: 77.1 }],
    status: 'below', pipTrigger: true, provenance: prov('Q2 §3', ['QM-APR-004', 'QM-MAY-004', 'QM-JUN-004'], 'source_recovered', { derivation: 'Deteriorating trend.' }),
  },
  {
    metricId: 'MISSED_VISIT_RATE', indicator: 'Missed Visit Rate', target: '≤3%', direction: 'lower_is_better',
    points: [{ month: 'Apr', numerator: 28, denominator: 876, rate: 3.2 }, { month: 'May', numerator: 34, denominator: 892, rate: 3.8 }, { month: 'Jun', numerator: 44, denominator: 979, rate: 4.5 }],
    status: 'below', pipTrigger: true, provenance: prov('Q2 §3', ['QM-APR-006', 'QM-MAY-006', 'QM-JUN-006'], 'source_recovered', { derivation: 'Worsening trend.' }),
  },
  {
    metricId: 'PATIENT_SATISFACTION', indicator: 'Patient Satisfaction (Overall)', target: '≥85%', direction: 'higher_is_better',
    points: [{ month: 'Apr', numerator: null, denominator: null, rate: 82 }, { month: 'May', numerator: null, denominator: null, rate: 80 }, { month: 'Jun', numerator: null, denominator: null, rate: 79 }],
    status: 'below', pipTrigger: false, provenance: prov('Q2 §3', ['QM-APR-008', 'QM-MAY-008', 'QM-JUN-008']),
  },
];

const Q1: QapiQuarter = {
  key: 'Q1',
  period: { start: '2026-01-01', end: '2026-03-31' },
  normalizationStatus: 'normalized',
  meeting: {
    workflow: 'QA-WF-03 — Quarterly QAPI Committee Review', meetingDate: '2026-04-09',
    agendaDeadline: '2026-04-06', feederAuditDeadline: '2026-04-02', gbPackageDeadline: '2026-04-02',
    minutesDue: '2026-04-16', minutesOwner: 'Clinical Manager', policyBasis: ['QA-PG-001', 'QA-PG-002', 'GV-GB-001'],
    requiredSignoffs: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
  },
  population: { activeAtStart: 105, activeAtClose: 120, newSoc: 22, discharged: 14, transferred: 3, episodesTracked: 127, hospitalizations: 5, edVisitsNoHospitalization: 3, clinicianCount: 28, note: 'Baseline quarter; census grew 105→120.' },
  metrics: Q1_METRICS,
  feederAudits: [
    { auditId: 'AUD-Q1-CL-008', workflowId: 'CL-WF-33', category: 'Clinical Quality', reviewerClinId: 'MOCK-CLIN-0017', status: 'Complete', signedBy: 'MOCK-CLIN-0027', signedAt: '2026-04-02', keyFinding: 'Wound infection cluster: 4 infections in Feb across 3 clinicians', provenance: prov('Q1 §5', ['AUD-Q1-CL-008']) },
    { auditId: 'AUD-Q1-CO-005', workflowId: 'CO-WF-27', category: 'Compliance/Billing', reviewerClinId: 'MOCK-CLIN-0025', status: 'Complete', signedBy: 'MOCK-CLIN-0025', signedAt: '2026-04-01', keyFinding: 'Overpayment check: $1,200 identified — voluntary refund initiated', provenance: prov('Q1 §5', ['AUD-Q1-CO-005']) },
  ],
  adverseEvents: [
    { eventId: 'AE-Q1-001', caseLabel: 'CHF exacerbation — hospitalization', eventType: 'Hospitalization', eventDate: '2026-01-18', severity: 'High', rcaRequired: true, rcaId: 'RCA-Q1-001', rcaFindings: 'Missed weight-gain documentation; delayed escalation', systemicRootCause: 'Escalation protocol adherence', linkedCapIds: [], personnelMatterSeparated: true, status: 'RCA Complete — CAP assigned', restrictedPatientId: 'MOCK-PT-0009', provenance: prov('Q1 §6', ['AE-Q1-001', 'RCA-Q1-001']) },
    { eventId: 'AE-Q1-004', caseLabel: 'Sepsis — hospitalization (patient-safety escalation)', eventType: 'Hospitalization', eventDate: '2026-03-03', severity: 'Critical', rcaRequired: true, rcaId: 'RCA-Q1-003', rcaFindings: 'Infection signs present on prior visit note but not escalated for 36h', systemicRootCause: 'Escalation/reporting chain failure', linkedCapIds: ['CAP-Q1-003'], personnelMatterSeparated: true, status: 'RCA In Progress', restrictedPatientId: 'MOCK-PT-0071', provenance: prov('Q1 §6', ['AE-Q1-004', 'RCA-Q1-003', 'DISC-TRIG-Q1-005']) },
  ],
  infections: [
    { infxId: 'INF-Q1-005', caseLabel: 'Sepsis secondary to wound', infectionType: 'Sepsis', onsetDate: '2026-03-02', resolutionDate: null, intervention: 'Hospitalized; RCA initiated (AE-Q1-004)', status: 'Under Investigation', linkedEventId: 'AE-Q1-004', provenance: prov('Q1 §7', ['INF-Q1-005']) },
  ],
  complaints: [
    { complaintId: 'COMP-Q1-005', category: 'Communication — interpreter not arranged', complaintDate: '2026-03-07', daysToResolve: 12, within5Days: false, status: 'Closed — escalated to GB', escalatedToGb: true, provenance: prov('Q1 §8', ['COMP-Q1-005']) },
    { complaintId: 'COMP-Q1-006', category: 'Scheduling — consistent late arrivals (HHA)', complaintDate: '2026-03-22', daysToResolve: null, within5Days: false, status: 'Open — CAP initiated', escalatedToGb: false, provenance: prov('Q1 §8', ['COMP-Q1-006']) },
  ],
  pipTriggers: [
    { triggerId: 'PIP-TRIG-Q1-004', triggerType: 'Medication Reconciliation Gap at SOC/ROC', sourceRecordIds: ['QM-Q1-007', 'QM-Q1-008', 'QM-Q1-009'], policyId: 'QA-PG-001', severity: 'Critical', findingSummary: 'Med rec 72–79% vs ≥95%; systemic process gap', recommendedAction: 'PIP', status: 'Active — PIP-Q1-004 initiated', provenance: prov('Q1 §9', ['PIP-TRIG-Q1-004']) },
    { triggerId: 'PIP-TRIG-Q1-006', triggerType: 'Wound Infection Surveillance Spike', sourceRecordIds: ['QM-Q1-019', 'INF-Q1-001..005', 'AUD-Q1-CL-008'], policyId: 'QA-PG-001', severity: 'Critical', findingSummary: 'Wound infection 10–13% vs ≤5%; repeat infections across 3 clinicians; sepsis event', recommendedAction: 'PIP + infection control protocol review', status: 'Active — PIP-Q1-006 initiated', provenance: prov('Q1 §9', ['PIP-TRIG-Q1-006']) },
    { triggerId: 'PIP-TRIG-Q1-007', triggerType: 'Complaint/Grievance Communication Trend', sourceRecordIds: ['QM-Q1-022..024', 'COMP-Q1-001', 'COMP-Q1-003', 'COMP-Q1-005'], policyId: 'QA-PG-002', severity: 'Critical', findingSummary: '3 of 6 complaints communication failures; resolution 62–67% vs ≥90%', recommendedAction: 'PIP', status: 'Active — PIP-Q1-007 initiated', provenance: prov('Q1 §9', ['PIP-TRIG-Q1-007']) },
  ],
  pips: [
    { pipId: 'PIP-Q1-004', title: 'Medication Reconciliation Improvement', triggerId: 'PIP-TRIG-Q1-004', baseline: 'Q1 close 79.2% (target ≥95%)', approvedObjective: '≥95% med rec at SOC/ROC', sustainabilityCriterion: 'Two consecutive quarters ≥95%', currentQuarterEvidence: 'Q1 baseline established; CAP-Q1-002 opened', closureEligible: false, gbDecision: null, returnDate: '2026-07-10', provenance: prov('Q1 §9/§11', ['PIP-TRIG-Q1-004', 'CAP-Q1-002']) },
    { pipId: 'PIP-Q1-006', title: 'Wound Infection Control', triggerId: 'PIP-TRIG-Q1-006', baseline: 'Q1 spike to 10–13% (target ≤5%)', approvedObjective: '≤5% wound infection rate', sustainabilityCriterion: 'Two consecutive quarters ≤5% in all wound strata', currentQuarterEvidence: 'CAP-Q1-003 opened; protocol revision + in-service', closureEligible: false, gbDecision: null, returnDate: '2026-07-10', provenance: prov('Q1 §9/§11', ['PIP-TRIG-Q1-006', 'CAP-Q1-003']) },
  ],
  caps: [
    { capId: 'CAP-Q1-002', sourceTrigger: 'PIP-TRIG-Q1-004', description: 'Med rec protocol re-education + checklist at SOC/ROC', ownerClinId: 'MOCK-CLIN-0027', dueDate: '2026-04-30', status: 'Open', effectivenessDemonstrated: false, provenance: prov('Q1 §11', ['CAP-Q1-002']) },
    { capId: 'CAP-Q1-003', sourceTrigger: 'PIP-TRIG-Q1-006 + AE-Q1-004', description: 'Wound infection control protocol revision; mandatory in-service', ownerClinId: 'MOCK-CLIN-0017', dueDate: '2026-04-23', status: 'Open', effectivenessDemonstrated: false, provenance: prov('Q1 §11', ['CAP-Q1-003']) },
  ],
  disciplinaryMatters: [
    { triggerId: 'DISC-TRIG-Q1-004', clinicianRef: 'MOCK-CLIN-0003', triggerType: 'Unauthorized Documentation Change After Chart Review', severity: 'Critical', findingSummary: 'Visit note amended 11 days after entry without documented reason or countersignature; potential retroactive alteration', recommendedAction: 'Suspension pending investigation', status: 'Under Investigation', provenance: prov('Q1 §10', ['DISC-TRIG-Q1-004']) },
    { triggerId: 'DISC-TRIG-Q1-005', clinicianRef: 'MOCK-CLIN-0004', triggerType: 'Failure to Follow Escalation Chain — Patient Safety', severity: 'Critical', findingSummary: 'Sepsis signs documented 2026-03-02 not escalated for 36h; patient hospitalized', recommendedAction: 'Immediate retraining + supervision', status: 'RCA pending — disciplinary hold', provenance: prov('Q1 §10', ['DISC-TRIG-Q1-005']) },
  ],
  gbEscalations: [
    { escalationId: 'GB-Q1-001', summary: '4 items escalated: sepsis case (AE-Q1-004), interpreter-failure complaint (COMP-Q1-005), OASIS accuracy trend, doc-to-claim mismatch', linkedRecordIds: ['AE-Q1-004', 'COMP-Q1-005', 'PIP-TRIG-Q1-001', 'PIP-TRIG-Q1-008'], provenance: prov('Q1 §12', ['GB-Q1-001']) },
  ],
  sourceSignoffs: [
    { signoffId: 'SGN-Q1-ADM-001', role: 'Administrator', signerClinId: 'MOCK-CLIN-0028', date: '2026-04-09', status: 'Signed', provenance: prov('Q1 §12', ['SGN-Q1-ADM-001']) },
    { signoffId: 'SGN-Q1-CM-001', role: 'Clinical Manager', signerClinId: 'MOCK-CLIN-0027', date: '2026-04-09', status: 'Signed', provenance: prov('Q1 §12', ['SGN-Q1-CM-001']) },
    { signoffId: 'SGN-Q1-CHAIR-001', role: 'QAPI Committee Chair', signerClinId: 'MOCK-CLIN-0026', date: '2026-04-09', status: 'Signed', provenance: prov('Q1 §12', ['SGN-Q1-CHAIR-001']) },
  ],
  provenance: [prov('Q1 full dataset', ['QAPI-Q1-DS-001'])],
};

const Q2: QapiQuarter = {
  key: 'Q2',
  period: { start: '2026-04-01', end: '2026-06-30' },
  normalizationStatus: 'normalized',
  meeting: {
    workflow: 'QA-WF-03 — Quarterly QAPI Committee Review', meetingDate: '2026-07-10',
    agendaDeadline: '2026-07-07', feederAuditDeadline: '2026-07-02', gbPackageDeadline: '2026-07-03',
    minutesDue: '2026-07-17', minutesOwner: 'Clinical Manager', policyBasis: ['QA-PG-001', 'QA-PG-002', 'GV-GB-001'],
    requiredSignoffs: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
  },
  population: { activeAtStart: 100, activeAtClose: null, newSoc: 12, discharged: 18, transferred: 4, episodesTracked: 112, hospitalizations: 7, edVisitsNoHospitalization: 4, clinicianCount: 30, note: 'Q2 opens at 100 active — does NOT reconcile with Q1 close of 120 (see data-quality finding DQ-2026-002).' },
  metrics: Q2_METRICS,
  feederAudits: [],
  adverseEvents: [],
  infections: [],
  complaints: [
    { complaintId: 'MOCK-CMP-004', category: 'Scheduling — 3 consecutive missed HHA visits', complaintDate: '2026-05-14', daysToResolve: null, within5Days: false, status: 'Open — under review', escalatedToGb: false, provenance: prov('Q2 §1.4', ['MOCK-CMP-004']) },
    { complaintId: 'MOCK-CMP-007', category: 'Communication — RN did not explain med change at SOC', complaintDate: '2026-06-17', daysToResolve: null, within5Days: false, status: 'Open — coaching scheduled', escalatedToGb: false, provenance: prov('Q2 §1.4', ['MOCK-CMP-007']) },
  ],
  pipTriggers: [],
  pips: [
    { pipId: 'PIP-Q1-004', title: 'Medication Reconciliation Improvement (carry-forward)', triggerId: 'PIP-TRIG-Q1-004', baseline: 'Q1 close 79.2%', approvedObjective: '≥95%', sustainabilityCriterion: 'Two consecutive quarters ≥95%', currentQuarterEvidence: 'Q2 med rec 70.6% (Jun) — 3rd consecutive quarter below; NOT improving', closureEligible: false, gbDecision: null, returnDate: '2026-10-09', provenance: prov('Q2 §4.3', ['MOCK-AUD-QA-005']) },
  ],
  caps: [],
  disciplinaryMatters: [],
  gbEscalations: [],
  sourceSignoffs: [],
  provenance: [prov('Q2 full dataset', ['QAPI-Q2-DS-001'])],
};

function pendingQuarter(key: 'Q3' | 'Q4', period: { start: string; end: string }): QapiQuarter {
  return {
    key, period, normalizationStatus: 'pending', meeting: null, population: null, metrics: [], feederAudits: [],
    adverseEvents: [], infections: [], complaints: [], pipTriggers: [], pips: [], caps: [], disciplinaryMatters: [],
    gbEscalations: [], sourceSignoffs: [],
    provenance: [prov(`${key} dataset`, [`QAPI-${key}-DS-001`], 'unresolved', { confidence: 'low', derivation: `${key} present in source fixture; normalization into this fixture is pending (§ remaining work).` })],
  };
}

export const QAPI_2026: QapiYear2026 = {
  year: 2026,
  agency: {
    agencyId: 'SVHHA-001', agencyName: 'Sunrise Valley Home Health Agency', agencyType: 'Medicare-certified Skilled Home Health',
    npi: '1234567890 (synthetic)', state: 'California', accreditation: 'ACHC (active, expires 2027-06-30)',
    administratorClinId: 'MOCK-CLIN-0028', clinicalManagerClinId: 'MOCK-CLIN-0027', qapiChairClinId: 'MOCK-CLIN-0026', complianceOfficerClinId: 'MOCK-CLIN-0025',
  },
  quarters: { Q1, Q2, Q3: pendingQuarter('Q3', { start: '2026-07-01', end: '2026-09-30' }), Q4: pendingQuarter('Q4', { start: '2026-10-01', end: '2026-12-31' }) },
  annual: {
    normalizationStatus: 'pending',
    censusArc: 'Q1 105→120; Q2 opens 100 (unreconciled). Full arc pending Q3/Q4 normalization.',
    openCapsCarryForward: null, openComplaintsCarryForward: null, restrictedMattersCarryForward: null, annualReportApproved: null,
    note: 'Annual arc will be computed once Q3/Q4 are normalized. Zero open PIPs must never be read as zero remaining risk while CAPs/complaints/disciplinary matters remain open.',
  },
  validationFindings: [
    {
      findingId: 'DQ-2026-001', kind: 'identity_collision', severity: 'critical',
      title: 'Clinician IDs reused for different people across quarters',
      detail: 'The MOCK-CLIN-* roster is fully reassigned between Q1 and Q2. E.g. Q1 MOCK-CLIN-0027 = James T. Reeves (RN, Clinical Manager); Q2 MOCK-CLIN-0026 = Angela Morales (Clinical Manager/DON). The same raw IDs denote different people.',
      originalValues: ['Q1:MOCK-CLIN-0027=James T. Reeves (Clinical Manager)', 'Q2:MOCK-CLIN-0026=Angela Morales (Clinical Manager/DON)', 'Q1:MOCK-CLIN-0028=Maria L. Santos (Administrator)', 'Q2:MOCK-CLIN-0029=Edward Nakamura (Administrator)'],
      impact: 'Cross-quarter clinician trending, accountability, and disciplinary continuity cannot rely on raw IDs. IDs are scoped per quarter (e.g. Q1:MOCK-CLIN-0027).',
      requiredReviewerDecision: 'Approve a versioned alias/reconciliation table before any cross-quarter person-level analysis; do NOT merge on raw ID.',
      affectedQuarters: ['Q1', 'Q2'],
    },
    {
      findingId: 'DQ-2026-002', kind: 'census_discontinuity', severity: 'warning',
      title: 'Census carry-forward does not reconcile Q1→Q2',
      detail: 'Q1 closes at 120 active patients; Q2 opens at 100 active. The 20-patient difference is not explained by the recorded Q2 discharges/transfers.',
      originalValues: ['Q1 active at close = 120', 'Q2 active at start = 100'],
      impact: 'Denominator continuity and population-based rate comparisons across the boundary are unreliable.',
      requiredReviewerDecision: 'Reviewer must confirm the true Q2 opening census; keep both recovered values until reconciled.',
      affectedQuarters: ['Q1', 'Q2'],
    },
    {
      findingId: 'DQ-2026-003', kind: 'missing_board_decision', severity: 'warning',
      title: 'GB decision/motion records absent from source for escalated matters',
      detail: 'The source records QAPI escalations to the Board (GB-Q1-001) but contains no motion/vote/directive record for the Board’s decision on them. A labeled synthetic supplement provides a motion shell for the decision workflow.',
      originalValues: ['GB-Q1-001 escalation present; no GB motion/vote record'],
      impact: 'The decision workflow cannot be exercised end-to-end without a motion/vote/directive record.',
      requiredReviewerDecision: 'Treat SUPP-GB-MOTION-Q1-001 as a UAT supplement only; a real Board decision record is required for production.',
      affectedQuarters: ['Q1'],
    },
  ],
  syntheticSupplements: [
    {
      sourceKind: 'synthetic_supplement',
      supplementReason: 'Source has no GB motion/vote/directive record for the Q1 escalated matters (GB-Q1-001); one is required to exercise the decision composer workflow.',
      authoredFor: 'UAT workflow completeness',
      approvedForProduction: false,
      reviewRequired: true,
      sourceRecordIds: ['GB-Q1-001'],
    },
  ],
};
