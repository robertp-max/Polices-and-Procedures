// 2026 QAPI Tabletop — "The Year the Aggregate Lied" (§5).
//
// Built ON the normalized 2026 QAPI fixture (qapi/data/qapi2026.normalized.ts)
// via the same selectors the Board packet workspace uses. Real figures are
// read from QAPI_2026 at module-load time so this case can never silently
// drift from the packet the Board actually sees.
//
// Any fact ALTERED or ADDED for the exercise (i.e. not literally present in
// the normalized fixture) is marked isInject: true and carries an injectNote
// explaining what was added/changed and why. Source-recovered facts are never
// silently blended with inject facts — every exhibit's sourceKind says which
// it is.
//
// This is a NEW, separate case module. It does not replace or alter the
// existing single-scenario FINAL_TABLETOP (tabletopCase.ts) — that remains
// the "Final Governing Body Tabletop" capstone; this is the dedicated 2026
// QAPI year-arc exercise (§5), addressable in Solo or Facilitated-group mode.
//
// SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION.

import { QAPI_2026 } from '../qapi/data/qapi2026.normalized';
import { buildMaterialSignals, buildPacketReadiness } from '../qapi/selectors/qapi2026Selectors';
import type { QapiQuarter, QualityMetricSeries } from '../qapi/model/qapi2026.types';

// ---- Round / rubric contracts ---------------------------------------------

export type Q26Round = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YEAR_END';

export type Q26RubricDimension =
  | 'evidence_sufficiency'
  | 'authority_quorum_conflict'
  | 'patient_safety_qapi'
  | 'decision_proportionality'
  | 'record_quality'
  | 'surveyor_transfer';

export const Q26_RUBRIC: Record<Q26RubricDimension, { label: string; points: number }> = {
  evidence_sufficiency: { label: 'Evidence sufficiency & exclusion of decoys', points: 20 },
  authority_quorum_conflict: { label: 'Authority, quorum & conflict analysis', points: 15 },
  patient_safety_qapi: { label: 'Patient-safety & QAPI judgment', points: 20 },
  decision_proportionality: { label: 'Decision proportionality', points: 15 },
  record_quality: { label: 'Official record quality & source integrity', points: 15 },
  surveyor_transfer: { label: 'Surveyor defense & transfer', points: 15 },
};

export type Q26SourceKind =
  | 'source_recovered'
  | 'derived_from_source'
  | 'synthetic_supplement'
  | 'unresolved'
  | 'scenario_inject';

export interface Q26Exhibit {
  id: string;
  code: string;
  title: string;
  summary: string;
  quarter: Q26Round | 'ANNUAL';
  /** Relevant-looking but immaterial — selecting it as decisive is an error. */
  decoy: boolean;
  /** Must be opened before decisions for its quarter can be locked. */
  critical: boolean;
  /** True when this exhibit's content was authored/altered for the exercise. */
  isInject: boolean;
  sourceKind: Q26SourceKind;
  /** Provenance pointer into the normalized fixture, or the inject rationale. */
  source: string;
  /** Required whenever isInject is true — what was added/changed and why. */
  injectNote?: string;
}

export interface Q26Option {
  id: string;
  text: string;
  points: number;
  /** Choosing this triggers an AUTOMATIC critical failure regardless of score. */
  criticalFailure?: boolean;
}

export interface Q26Decision {
  id: string;
  round: Q26Round;
  dimension: Q26RubricDimension;
  prompt: string;
  options: Q26Option[];
}

export interface Q26SurveyorQuestion {
  id: string;
  prompt: string;
  options: Q26Option[];
}

export interface Q26TransferQuestion {
  id: string;
  changedFacts: string;
  prompt: string;
  options: Q26Option[];
}

export interface Q26Contradiction {
  id: string;
  title: string;
  detail: string;
  sourceRefs: string[];
}

export interface Q26RoundInfo {
  round: Q26Round;
  title: string;
  body: string;
}

export interface Q26TabletopCase {
  id: string;
  title: string;
  minutes: number;
  passScore: number;
  context: string;
  rounds: Q26RoundInfo[];
  exhibits: Q26Exhibit[];
  contradictions: Q26Contradiction[];
  decisions: Q26Decision[];
  surveyor: Q26SurveyorQuestion[];
  transfer: Q26TransferQuestion[];
  automaticCriticalFailures: string[];
}

// ---- Pull real figures straight from the normalized fixture ---------------

const Q1 = QAPI_2026.quarters.Q1;
const Q2 = QAPI_2026.quarters.Q2;
const Q3 = QAPI_2026.quarters.Q3;
const Q4 = QAPI_2026.quarters.Q4;

function metric(q: QapiQuarter, id: string): QualityMetricSeries | undefined {
  return q.metrics.find((m) => m.metricId === id);
}
function lastRate(m: QualityMetricSeries | undefined): number | null {
  return m && m.points.length ? m.points[m.points.length - 1].rate : null;
}
function fmtRate(m: QualityMetricSeries | undefined): string {
  const r = lastRate(m);
  return r === null ? 'n/a' : `${r}%`;
}

const q1MedRec = metric(Q1, 'MED_RECONCILIATION');
const q1Hosp = metric(Q1, 'HOSPITALIZATION_RATE');
const q2Hosp = metric(Q2, 'HOSPITALIZATION_RATE');
const q2MedRec = metric(Q2, 'MED_RECONCILIATION');
const q2Oasis = metric(Q2, 'OASIS_ACCURACY');
const q2Poc = metric(Q2, 'POC_DOC_COMPLETENESS');
const q2Missed = metric(Q2, 'MISSED_VISIT_RATE');
const q2Sat = metric(Q2, 'PATIENT_SATISFACTION');

const q2MaterialSignals = buildMaterialSignals(Q2);
const q2HospSignal = q2MaterialSignals.find((s) => s.metricId === 'HOSPITALIZATION_RATE');
const q3Readiness = buildPacketReadiness(Q3);
const q1DqIdentity = QAPI_2026.validationFindings.find((f) => f.findingId === 'DQ-2026-001')!;
const q1DqCensus = QAPI_2026.validationFindings.find((f) => f.findingId === 'DQ-2026-002')!;
const q1DqMotion = QAPI_2026.validationFindings.find((f) => f.findingId === 'DQ-2026-003')!;
const pip004 = Q1.pips.find((p) => p.pipId === 'PIP-Q1-004')!;
const pip004Q2 = Q2.pips.find((p) => p.pipId === 'PIP-Q1-004')!;
const pip006 = Q1.pips.find((p) => p.pipId === 'PIP-Q1-006')!;

// ---- Exhibits (28 total: 22 source-grounded/real, 6 clearly marked injects) -

export const Q26_EXHIBITS: Q26Exhibit[] = [
  // -- Q1 baseline (real) --
  { id: 'E01', code: 'QA-WF-03', title: 'Q1 meeting control record', summary: `Meeting ${Q1.meeting?.meetingDate}; required sign-offs: ${Q1.meeting?.requiredSignoffs.join(', ')} — ${Q1.sourceSignoffs.filter((s) => s.status === 'Signed').length}/${Q1.sourceSignoffs.length} signed.`, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §meeting/§12 sign-offs' },
  { id: 'E02', code: 'QA-POP-Q1', title: 'Q1 population summary', summary: `Active ${Q1.population?.activeAtStart}→${Q1.population?.activeAtClose}; ${Q1.population?.note}`, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §population' },
  { id: 'E03', code: 'QM-Q1-BUNDLE', title: 'Q1 quality metric bundle', summary: `Med reconciliation ${fmtRate(q1MedRec)} vs ≥95% (critical, PIP-triggering); missed visit and complaint-resolution timeliness also critical; hospitalization ${fmtRate(q1Hosp)} within target.`, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §4 quality metric observations' },
  { id: 'E04', code: 'AUD-Q1-CL-008', title: 'Feeder audit — clinical quality', summary: Q1.feederAudits.find((a) => a.auditId === 'AUD-Q1-CL-008')?.keyFinding ?? '', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §5 feeder audits' },
  { id: 'E05', code: 'AUD-Q1-CO-005', title: 'Feeder audit — compliance/billing', summary: Q1.feederAudits.find((a) => a.auditId === 'AUD-Q1-CO-005')?.keyFinding ?? '', quarter: 'Q1', decoy: true, critical: false, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §5 feeder audits' },
  { id: 'E06', code: 'AE-Q1-001', title: 'Adverse event — CHF exacerbation', summary: 'Hospitalization; RCA complete; CAP assigned; personnel matter kept separate from the RCA.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §6 adverse events' },
  { id: 'E07', code: 'AE-Q1-004', title: 'Adverse event — sepsis escalation', summary: 'Critical severity; infection signs present on a prior visit note but not escalated for 36 hours; RCA in progress; CAP-Q1-003 not yet effectiveness-demonstrated.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §6 adverse events' },
  { id: 'E08', code: 'COMP-Q1-005', title: 'Complaint — interpreter not arranged', summary: 'Closed at 12 days (target ≤5); escalated to Governing Body.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §8 complaints' },
  { id: 'E09', code: 'COMP-Q1-006', title: 'Complaint — HHA scheduling lateness', summary: 'Open, CAP initiated; not escalated to the Board.', quarter: 'Q1', decoy: true, critical: false, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §8 complaints' },
  { id: 'E10', code: 'PIP-TRIG-Q1-BUNDLE', title: 'Q1 PIP triggers (med rec, wound infection, complaints)', summary: 'Three critical PIP triggers opened: medication reconciliation gap, wound-infection surveillance spike, complaint/communication trend.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §9 PIP triggers' },
  { id: 'E11', code: 'PIP-Q1-004', title: 'PIP charter — medication reconciliation', summary: `Baseline ${pip004.baseline}. Sustainability criterion: ${pip004.sustainabilityCriterion}.`, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §9/§11 PIP lifecycle' },
  { id: 'E12', code: 'PIP-Q1-006', title: 'PIP charter — wound infection control', summary: `Baseline ${pip006.baseline}. Sustainability criterion: ${pip006.sustainabilityCriterion}.`, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §9/§11 PIP lifecycle' },
  { id: 'E13', code: 'CAP-Q1-BUNDLE', title: 'Q1 corrective action plans', summary: 'CAP-Q1-002 (med rec, owner MOCK-CLIN-0027, due 2026-04-30) and CAP-Q1-003 (wound infection, owner MOCK-CLIN-0017, due 2026-04-23); neither has effectiveness demonstrated yet.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §11 corrective actions' },
  { id: 'E14', code: 'DISC-Q1-BUNDLE', title: 'Q1 restricted personnel matters (executive session)', summary: 'DISC-TRIG-Q1-004 unauthorized documentation change 11 days after entry; DISC-TRIG-Q1-005 sepsis-escalation-chain failure. Both Critical, both under investigation at quarter close.', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §10 restricted personnel' },
  { id: 'E15', code: 'GB-Q1-001', title: 'QAPI escalation to Governing Body', summary: Q1.gbEscalations[0]?.summary ?? '', quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q1 §12 GB escalations' },
  { id: 'E17', code: 'DQ-2026-001', title: 'Data-quality finding — clinician ID identity collision', summary: q1DqIdentity.detail, quarter: 'Q1', decoy: false, critical: true, isInject: false, sourceKind: 'unresolved', source: 'validationFindings.DQ-2026-001' },
  {
    id: 'E18', code: 'INJ-ESC-MEMO', title: 'Escalation resolution memo (exercise inject)', summary: 'A memo attached to GB-Q1-001 states the sepsis escalation matter is "FINAL — resolved," but the signature block is blank and the memo is dated 2026-04-22 — after the 2026-04-09 meeting it purports to resolve.', quarter: 'Q1', decoy: false, critical: true, isInject: true, sourceKind: 'scenario_inject', source: 'Authored to exercise the DQ-2026-003 gap (source has no GB motion/vote/directive record for GB-Q1-001)', injectNote: 'The source fixture records the GB-Q1-001 escalation but NO board decision or resolution memo of any kind (see DQ-2026-003). This memo is authored for the exercise so the record-quality decision can be practiced; it must never be read as a real signed-off record.',
  },
  {
    id: 'E19', code: 'INJ-CONFLICT', title: 'Conflict-of-interest disclosure (exercise inject)', summary: 'A director discloses a spouse\'s ownership stake in the coaching/analyst staffing firm that supplies CAP-Q1-002\'s med-reconciliation coach — the same CAP the Board is about to evaluate.', quarter: 'Q1', decoy: false, critical: true, isInject: true, sourceKind: 'scenario_inject', source: 'Authored to give the case an authority/quorum/conflict decision — no director-conflict record exists in the normalized 2026 fixture.', injectNote: 'Added for the exercise. Ties a conflict directly to CAP-Q1-002 ownership so the recusal/quorum decision has real stakes; keep separate from any source-recovered fact.',
  },

  // -- Q2 (real, includes the "aggregate lies" contradiction) --
  { id: 'E20', code: 'QA-POP-Q2', title: 'Q2 population summary', summary: Q2.population?.note ?? '', quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §population' },
  { id: 'E21', code: 'QM-Q2-HOSP', title: 'Q2 hospitalization rate — favorable aggregate', summary: `Aggregate hospitalization ${fmtRate(q2Hosp)} (within target) — but ${q2Hosp?.provenance.derivation ?? ''} Board posture: ${q2HospSignal?.boardPosture ?? 'n/a'}.`, quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §3 quality metrics' },
  { id: 'E22', code: 'QM-Q2-BUNDLE', title: 'Q2 worsening-subgroup metric bundle', summary: `Med reconciliation ${fmtRate(q2MedRec)} (critical, 3rd consecutive quarter below target); OASIS accuracy ${fmtRate(q2Oasis)}; POC documentation ${fmtRate(q2Poc)}; missed-visit rate ${fmtRate(q2Missed)}; patient satisfaction ${fmtRate(q2Sat)} and falling (not PIP-tracked, cited informally by management as reassurance) — all below target while the aggregate headline improved.`, quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §3 quality metrics' },
  { id: 'E24', code: 'PIP-Q1-004-Q2', title: 'PIP-Q1-004 carry-forward evidence', summary: pip004Q2.currentQuarterEvidence ?? '', quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §4.3 PIP lifecycle' },
  { id: 'E25', code: 'GAP-Q2-TRIGGERS', title: 'Q2 PIP-trigger gap', summary: 'Five Q2 metrics closed below/critical status (OASIS, med rec, POC doc, missed visit, satisfaction) yet zero new PIP-trigger records were opened this quarter — a process gap in the trigger workflow itself.', quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §3/§9 — derived comparison (pipTriggers array is empty)' },
  { id: 'E26', code: 'GAP-Q2-SILENT-PIPS', title: 'Two Q1 PIPs missing from the Q2 record', summary: 'PIP-Q1-006 (wound infection) and the complaint/communication PIP trigger (PIP-TRIG-Q1-007) do not appear anywhere in the Q2 pips array — no closure decision, no sustainability evidence, no carry-forward note.', quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §pips — derived comparison against Q1 §9/§11' },
  { id: 'E27', code: 'GAP-Q2-DISCIPLINARY', title: 'Q1 restricted matters have no Q2 resolution', summary: 'DISC-TRIG-Q1-004 and DISC-TRIG-Q1-005 were open/under-investigation at Q1 close; Q2\'s disciplinaryMatters array is empty — no documented resolution, and no note explaining the gap.', quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §disciplinaryMatters — derived comparison against Q1 §10' },
  { id: 'E28', code: 'DQ-2026-002', title: 'Data-quality finding — census discontinuity', summary: q1DqCensus.detail, quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'unresolved', source: 'validationFindings.DQ-2026-002' },
  { id: 'E29', code: 'DQ-2026-003', title: 'Data-quality finding — missing GB decision record', summary: q1DqMotion.detail, quarter: 'Q2', decoy: false, critical: true, isInject: false, sourceKind: 'unresolved', source: 'validationFindings.DQ-2026-003' },
  { id: 'E30', code: 'MOCK-CMP-004/007', title: 'Q2 complaints — not escalated', summary: 'Two open Q2 complaints (missed HHA visits; med-change communication at SOC), neither flagged escalatedToGb, despite the Q1 complaint/communication trend already being a Critical PIP trigger.', quarter: 'Q2', decoy: true, critical: false, isInject: false, sourceKind: 'source_recovered', source: 'Q2 §1.4 complaints' },

  // -- Q3 (real quarter is pending in source; injects clearly marked) --
  { id: 'E31', code: 'Q3-PENDING', title: 'Q3 normalization status', summary: 'Q3 remains in "pending" normalization status in the source fixture — no meeting control, metrics, feeder audits, or sign-offs have been recovered for this quarter.', quarter: 'Q3', decoy: false, critical: true, isInject: false, sourceKind: 'unresolved', source: 'QAPI_2026.quarters.Q3.normalizationStatus' },
  {
    id: 'E32', code: 'INJ-Q3-GROWTH', title: 'Continued census growth with a subgroup hospitalization uptick (exercise inject)', summary: 'Scenario continuation: census keeps growing through Q3, and a heart-failure subgroup shows a hospitalization uptick even as the agency-wide rate stays flat — mirroring the Q2 aggregate-masks-subgroup pattern into a new quarter.', quarter: 'Q3', decoy: false, critical: true, isInject: true, sourceKind: 'scenario_inject', source: 'Authored because Q3 has no real normalized data yet (pending); patterned on the real Q2 aggregateMasksSubgroup finding.', injectNote: 'Q3 is unresolved/pending in the normalized fixture. This exhibit is entirely a scenario continuation for the exercise and must never be cited as real Q3 source data.',
  },
  {
    id: 'E33', code: 'INJ-Q3-VENDOR', title: 'Proposed PHI-handling telehealth vendor (exercise inject)', summary: 'Management proposes a new remote-monitoring vendor with access to patient records; the draft agreement is missing audit-access and exit-rights clauses — no BAA has been finalized.', quarter: 'Q3', decoy: false, critical: true, isInject: true, sourceKind: 'scenario_inject', source: 'Authored to exercise the "PHI vendor without BAA" critical-failure gate against the Q3 readiness state.', injectNote: 'Added for the exercise; combine with the real Q3 packet-readiness gate failures below rather than treating it as a source-recovered fact.',
  },
  { id: 'E34', code: 'Q3-READINESS', title: 'Q3 packet readiness gates', summary: `Ready to convene: ${q3Readiness.readyToConvene ? 'yes' : 'no'}. Failing gates: ${q3Readiness.gates.filter((g) => !g.ok).map((g) => g.label).join('; ') || 'none'}.`, quarter: 'Q3', decoy: false, critical: true, isInject: false, sourceKind: 'derived_from_source', source: 'qapi2026Selectors.buildPacketReadiness(Q3)' },

  // -- Q4 / year-end (Q4 also pending; annual arc explicitly flags the risk) --
  { id: 'E35', code: 'Q4-PENDING', title: 'Q4 normalization status', summary: `Q4 normalization status: "${Q4.normalizationStatus}" — same unresolved state as Q3, with no meeting control, metrics, feeder audits, or sign-offs recovered.`, quarter: 'Q4', decoy: false, critical: true, isInject: false, sourceKind: 'unresolved', source: 'QAPI_2026.quarters.Q4.normalizationStatus' },
  { id: 'E36', code: 'ANNUAL-ARC', title: 'Annual arc summary', summary: `${QAPI_2026.annual.censusArc} ${QAPI_2026.annual.note}`, quarter: 'ANNUAL', decoy: false, critical: true, isInject: false, sourceKind: 'source_recovered', source: 'QAPI_2026.annual' },
  {
    id: 'E37', code: 'INJ-BUDGET', title: 'Proposed FY budget cutting CAP-sustaining hours (exercise inject)', summary: 'The proposed annual operating budget removes the analyst/coaching hours that fund CAP-Q1-002 and CAP-Q1-003, the very corrective actions still awaiting effectiveness demonstration.', quarter: 'YEAR_END', decoy: false, critical: true, isInject: true, sourceKind: 'scenario_inject', source: 'Authored to give the year-end round a resourcing/directive-quality decision with real stakes tied to CAP-Q1-002/003.', injectNote: 'Added for the exercise; no FY budget record exists in the normalized fixture.',
  },
];

// ---- Contradictions (10) ----------------------------------------------------

export const Q26_CONTRADICTIONS: Q26Contradiction[] = [
  { id: 'C1', title: 'Census does not reconcile across the Q1→Q2 boundary', detail: `Q1 closes at ${Q1.population?.activeAtClose} active; Q2 opens at ${Q2.population?.activeAtStart} — a 20-patient gap the recorded Q2 discharges/transfers do not explain.`, sourceRefs: ['E02', 'E20', 'E28'] },
  { id: 'C2', title: 'Clinician IDs are reused for different people across quarters', detail: q1DqIdentity.detail, sourceRefs: ['E17'] },
  { id: 'C3', title: 'A favorable aggregate hospitalization rate masks worsening subgroups', detail: 'Q2 hospitalization improved to the aggregate target while medication reconciliation, OASIS accuracy, POC documentation, and missed-visit rate all worsened in the same quarter.', sourceRefs: ['E21', 'E22'] },
  { id: 'C4', title: 'An escalation record is marked final while unsigned and post-dated', detail: 'The (exercise-inject) resolution memo for GB-Q1-001 claims finality with no signature and a date after the meeting it purports to resolve.', sourceRefs: ['E18', 'E29'] },
  { id: 'C5', title: 'A PIP is proposed for closure without meeting its own sustainability criterion', detail: `PIP-Q1-004 requires ${pip004.sustainabilityCriterion}; Q2 evidence is a 3rd consecutive quarter below target.`, sourceRefs: ['E11', 'E24'] },
  { id: 'C6', title: 'Q2 shows zero new PIP triggers despite five metrics breaching threshold', detail: 'A structural process gap: metrics that should trip the PIP-trigger workflow did not.', sourceRefs: ['E25'] },
  { id: 'C7', title: 'Two Q1 PIPs vanish from the Q2 record without a closure decision', detail: 'PIP-Q1-006 and the complaint/communication PIP trigger are simply absent from Q2 — not closed, not carried forward, not explained.', sourceRefs: ['E26'] },
  { id: 'C8', title: 'Restricted personnel matters have no documented Q2 resolution', detail: 'Two Critical Q1 disciplinary matters disappear from the record with no closure, transfer, or explanation in Q2.', sourceRefs: ['E27'] },
  { id: 'C9', title: 'Q3/Q4 remain unnormalized while the Board is asked to look ahead to annual closure', detail: 'Neither quarter has a meeting record, metrics, or sign-offs, yet growth and vendor decisions are being asked of the Board in the same cycle.', sourceRefs: ['E31', 'E34', 'E35'] },
  { id: 'C10', title: 'A conflicted director\'s disclosed interest intersects the very CAP under review', detail: 'The (exercise-inject) conflict ties a director to the staffing firm supplying CAP-Q1-002\'s coaching hours.', sourceRefs: ['E19', 'E13'] },
];

// ---- Round narration --------------------------------------------------------

export const Q26_ROUNDS: Q26RoundInfo[] = [
  { round: 'Q1', title: 'Q1 — Baseline', body: 'Reconstruct the baseline quarter: composition, authority, quorum, conflicts, and which PIP triggers are decisive versus decoys.' },
  { round: 'Q2', title: 'Q2 — Worsening injects', body: 'A favorable aggregate arrives alongside worsening subgroups, an unreconciled census, and PIPs that quietly vanished from the record.' },
  { round: 'Q3', title: 'Q3 — Growth & hospitalization injects', body: 'Growth continues into an unnormalized quarter; a subgroup hospitalization uptick and an unvetted PHI vendor both need a defensible answer.' },
  { round: 'Q4', title: 'Q4 — Closure claims', body: 'Management asks the Board to treat silence as closure. Decide what the record actually supports.' },
  { round: 'YEAR_END', title: 'Year-end close', body: 'Draft the official directive, defend it under surveyor questioning, and reapply the governing rule to changed facts.' },
];

// ---- Required Board decisions (10) ------------------------------------------

const d = (id: string, round: Q26Round, dimension: Q26RubricDimension, prompt: string, options: Q26Option[]): Q26Decision => ({ id, round, dimension, prompt, options });

export const Q26_DECISIONS: Q26Decision[] = [
  d('QD1', 'Q1', 'authority_quorum_conflict',
    'A director discloses a spouse\'s ownership stake in the staffing firm supplying CAP-Q1-002\'s med-reconciliation coach (E19). The Board is about to evaluate that CAP. How do you seat this?',
    [
      { id: 'QD1a', text: 'Allow the director to deliberate and vote; the disclosure is on file and that is sufficient.', points: 0, criticalFailure: true },
      { id: 'QD1b', text: 'Require recusal from deliberation and vote on CAP-Q1-002 specifically; record the recusal and recompute quorum/voting eligibility for that item only.', points: 15 },
      { id: 'QD1c', text: 'Ask the director to abstain from the final vote only, but allow participation in discussion.', points: 4 },
    ]),
  d('QD2', 'Q1', 'evidence_sufficiency',
    'Which exhibits are decisive to deciding whether the three Q1 PIP triggers are well-founded?',
    [
      { id: 'QD2a', text: 'The billing-overpayment audit and the scheduling-lateness complaint (E05, E09).', points: 0 },
      { id: 'QD2b', text: 'The Q1 quality-metric bundle, the clinical-quality feeder audit, and the PIP-trigger bundle itself (E03, E04, E10).', points: 20 },
      { id: 'QD2c', text: 'Only the sepsis adverse event, since it is the most severe (E07).', points: 6 },
    ]),
  d('QD3', 'Q1', 'decision_proportionality',
    'Two Critical restricted personnel matters are open at Q1 close (E14), one linked to the sepsis escalation. What does the Board direct?',
    [
      { id: 'QD3a', text: 'Direct the specific disciplinary outcome for each named clinician.', points: 0, criticalFailure: true },
      { id: 'QD3b', text: 'Direct a systemic escalation-chain and documentation-integrity review with named owner, due date, and effectiveness measure; refer the individual personnel matters to management/HR.', points: 15 },
      { id: 'QD3c', text: 'Take no Board action; this is entirely a management matter.', points: 3 },
    ]),
  d('QD4', 'Q2', 'patient_safety_qapi',
    'Management asks the Board to close PIP-Q1-004 (medication reconciliation), citing the improved aggregate hospitalization rate (E21). You decide:',
    [
      { id: 'QD4a', text: 'Approve closure — an aggregate quality metric improved, and that is the headline the packet leads with.', points: 0, criticalFailure: true },
      { id: 'QD4b', text: 'Reject closure — hospitalization is a different metric from medication reconciliation, and reconciliation is now a 3rd consecutive quarter below its own sustainability threshold (E22, E24).', points: 20 },
      { id: 'QD4c', text: 'Close the PIP but add informal monitoring next quarter.', points: 0, criticalFailure: true },
    ]),
  d('QD5', 'Q2', 'evidence_sufficiency',
    'Q1 closed at 120 active patients; Q2 opens at 100 (E02, E20, E28). How does this affect the packet you are reviewing?',
    [
      { id: 'QD5a', text: 'It does not matter — use whichever number makes the current rate look most favorable.', points: 0, criticalFailure: true },
      { id: 'QD5b', text: 'Flag the discontinuity as unreconciled, preserve both recorded values, and treat any rate comparison across the boundary as unreliable until reconciled.', points: 15 },
      { id: 'QD5c', text: 'Silently average the two figures to smooth the denominator for trend charts.', points: 0, criticalFailure: true },
    ]),
  d('QD6', 'Q2', 'record_quality',
    'The same MOCK-CLIN identifiers denote different people in Q1 versus Q2 (E17). A trend chart wants to plot "MOCK-CLIN-0027\'s" performance across both quarters. You:',
    [
      { id: 'QD6a', text: 'Plot it — the ID is the same, so it is the same person for accountability purposes.', points: 0, criticalFailure: true },
      { id: 'QD6b', text: 'Block any cross-quarter person-level trend or accountability claim until a versioned alias/reconciliation table is approved.', points: 15 },
      { id: 'QD6c', text: 'Drop the clinician dimension from the chart entirely and never revisit it.', points: 5 },
    ]),
  d('QD7', 'Q3', 'patient_safety_qapi',
    'Q3 is an inject: overall census growth continues while a heart-failure subgroup shows a hospitalization uptick even though the agency-wide rate stays flat (E32). You direct:',
    [
      { id: 'QD7a', text: 'No action — the agency-wide rate is flat, so nothing is worsening.', points: 0, criticalFailure: true },
      { id: 'QD7b', text: 'Direct a stratified root-cause review of the subgroup and set a named owner, due date, and re-report date, regardless of the flat aggregate.', points: 20 },
      { id: 'QD7c', text: 'Ask management to keep an eye on it informally.', points: 5 },
    ]),
  d('QD8', 'Q3', 'record_quality',
    'The Q3 packet readiness check (E34) shows multiple failing gates, and a new PHI-handling vendor proposal (E33) has no finalized BAA. Management asks the Board to proceed with both this cycle. You:',
    [
      { id: 'QD8a', text: 'Approve the vendor and treat the readiness gaps as a formality to clean up later.', points: 0, criticalFailure: true },
      { id: 'QD8b', text: 'Decline to approve the vendor absent a complete BAA, and hold the Q3 packet open pending resolution of the failing readiness gates.', points: 15 },
      { id: 'QD8c', text: 'Approve the vendor but not the packet.', points: 0, criticalFailure: true },
    ]),
  d('QD9', 'Q4', 'decision_proportionality',
    'Two Q1 PIPs (wound infection, complaint/communication) are simply absent from the Q2 record (E26), and management characterizes this as "resolved." You direct:',
    [
      { id: 'QD9a', text: 'Accept "resolved" — the absence of a PIP entry is itself evidence of closure.', points: 0, criticalFailure: true },
      { id: 'QD9b', text: 'Require a formal closure decision for each, supported by sustainability evidence in every named stratum, before treating either as resolved.', points: 15 },
      { id: 'QD9c', text: 'Reopen both automatically without asking for any evidence either way.', points: 6 },
    ]),
  d('QD10', 'YEAR_END', 'record_quality',
    'Drafting the year-end directive: the proposed budget removes the coaching hours that sustain CAP-Q1-002 and CAP-Q1-003 (E37), and neither CAP has demonstrated effectiveness. Which directive do you adopt?',
    [
      { id: 'QD10a', text: '"Reduce coaching hours as proposed; revisit if metrics decline." (No named owner, no due date, no effectiveness measure, no return date.)', points: 0, criticalFailure: true },
      { id: 'QD10b', text: 'Condition budget approval on preserving the coaching hours until each CAP\'s effectiveness is demonstrated, with a named owner, a due date, an effectiveness measure, and a required return date to the Board.', points: 15 },
      { id: 'QD10c', text: 'Defer the entire annual budget indefinitely with no further direction.', points: 5 },
    ]),
];

// ---- Surveyor defense (5) ----------------------------------------------------

export const Q26_SURVEYOR: Q26SurveyorQuestion[] = [
  { id: 'QS1', prompt: 'Surveyor: "What did the Board know at the time it declined to close the medication-reconciliation PIP?"', options: [
    { id: 'QS1a', text: 'That aggregate hospitalization improved while medication reconciliation missed its own sustainability threshold for a 3rd consecutive quarter.', points: 8 },
    { id: 'QS1b', text: 'That quality overall was trending well.', points: 0 },
    { id: 'QS1c', text: 'That management recommended closure.', points: 2 },
  ]},
  { id: 'QS2', prompt: 'Surveyor: "Q1 closed at 120 patients and Q2 opened at 100. How did the Board handle that?"', options: [
    { id: 'QS2a', text: 'Flagged it as an unreconciled discontinuity, preserved both figures, and declined to rely on cross-boundary rate comparisons until reconciled.', points: 8 },
    { id: 'QS2b', text: 'We didn\'t notice; the reports use different numbers depending on the chart.', points: 0, criticalFailure: true },
  ]},
  { id: 'QS3', prompt: 'Surveyor: "Show me the difference between what the Board DIRECTED and what management must EXECUTE regarding the disciplinary matters."', options: [
    { id: 'QS3a', text: 'The Board directed a systemic escalation-chain review with owner/due date/effectiveness measure; management executes the individual personnel actions.', points: 7 },
    { id: 'QS3b', text: 'The Board directed the specific disciplinary outcome itself.', points: 0, criticalFailure: true },
  ]},
  { id: 'QS4', prompt: 'Surveyor: "Two clinicians share the ID MOCK-CLIN-0027 across quarters. How does the Board treat that in any personnel-linked finding?"', options: [
    { id: 'QS4a', text: 'As two different people scoped per quarter — no cross-quarter accountability or trend claim is made until an approved alias/reconciliation table exists.', points: 7 },
    { id: 'QS4b', text: 'As the same person, since the ID matches.', points: 0, criticalFailure: true },
  ]},
  { id: 'QS5', prompt: 'Surveyor: "Why hasn\'t the Board approved this year\'s annual compliance/QAPI report yet?"', options: [
    { id: 'QS5a', text: 'Q3 and Q4 remain unnormalized, two PIPs and two disciplinary matters carried forward without documented resolution, and zero open PIPs must never be read as zero remaining risk.', points: 8 },
    { id: 'QS5b', text: 'It was an oversight; the report is ready.', points: 0 },
  ]},
];

// ---- Changed-facts transfer (2) ---------------------------------------------

export const Q26_TRANSFER: Q26TransferQuestion[] = [
  {
    id: 'QT1',
    changedFacts: 'Now assume medication reconciliation reaches 96% in BOTH Q3 and Q4, in every named stratum, with no exceptions.',
    prompt: 'Applying the same governing rule, what is the correct closure posture for PIP-Q1-004 at year-end?',
    options: [
      { id: 'QT1a', text: 'Close after the first qualifying quarter to move faster.', points: 0 },
      { id: 'QT1b', text: 'Close — the approved rule requires two consecutive quarters at or above target in every named stratum, and that is now satisfied.', points: 15 },
      { id: 'QT1c', text: 'Never close, regardless of sustained performance.', points: 0 },
    ],
  },
  {
    id: 'QT2',
    changedFacts: 'Now assume the census discontinuity is fully investigated and a signed reconciliation memo confirms the true Q2 opening census was 120, matching Q1\'s close.',
    prompt: 'Applying the same governing rule, how should the record and any cross-boundary comparisons now be handled?',
    options: [
      { id: 'QT2a', text: 'Quietly overwrite the original "100" entry with "120" so the record reads as if it was always reconciled.', points: 0, criticalFailure: true },
      { id: 'QT2b', text: 'Preserve the original recovered values, attach the signed reconciliation memo, and now permit cross-boundary rate comparisons on the reconciled basis.', points: 15 },
      { id: 'QT2c', text: 'Keep treating all cross-boundary comparisons as unreliable forever, even with a signed reconciliation on file.', points: 0 },
    ],
  },
];

// ---- Critical-failure gates (override the numeric score) -------------------

export const Q26_AUTOMATIC_CRITICAL_FAILURES: string[] = [
  'Treating a missing/unsigned/post-dated/unreconciled artifact as final',
  'Backdating or overwriting a historical record instead of preserving it and attaching a correction',
  'Counting an ineligible or recused member\'s vote when the outcome depends on it',
  'Ignoring a material conflict of interest or its recusal effect',
  'Closing a PIP when its approved sustainability criterion is unmet',
  'Letting favorable aggregate data erase a high-risk subgroup',
  'Directing an individual clinical or disciplinary outcome outside Board authority',
  'Approving a PHI-handling vendor without a complete BAA',
  'Approving a packet with an unresolved critical source-integrity defect',
  'Adopting a material directive with no named owner, due date, effectiveness measure, or return date',
];

export const QAPI2026_TABLETOP_ID = 'QAPI-2026-TABLETOP';
/** Not part of the existing compliance catalog — see orchestrator wiring note. */
export const QAPI2026_TABLETOP_ASSIGNMENT_ID = 'gb:tabletop:QAPI-2026-TABLETOP';
export const QAPI2026_PASS_SCORE = 92;

export const QAPI2026_TABLETOP: Q26TabletopCase = {
  id: QAPI2026_TABLETOP_ID,
  title: 'The Year the Aggregate Lied — 2026 QAPI Tabletop',
  minutes: 130,
  passScore: QAPI2026_PASS_SCORE,
  context:
    'You chair the Governing Body across the 2026 QAPI year. The packet is built directly from the normalized quarterly fixture: a favorable aggregate sits beside a worsening subgroup, a census will not reconcile across a quarter boundary, clinician IDs are reused for different people, PIPs vanish from the record without a closure decision, and the year closes with two quarters still unnormalized. Reconcile the exhibits, separate decoys from decisive evidence, and produce defensible, proportionate decisions and an official record across all four quarters and the year-end close.',
  rounds: Q26_ROUNDS,
  exhibits: Q26_EXHIBITS,
  contradictions: Q26_CONTRADICTIONS,
  decisions: Q26_DECISIONS,
  surveyor: Q26_SURVEYOR,
  transfer: Q26_TRANSFER,
  automaticCriticalFailures: Q26_AUTOMATIC_CRITICAL_FAILURES,
};

// ---- Scoring ------------------------------------------------------------

export interface Q26Selections {
  decisions: Record<string, string>;
  surveyor: Record<string, string>;
  transferAnswers: Record<string, string>;
  inspectedExhibitIds: string[];
  attested: boolean;
}

export interface Q26Score {
  earned: number;
  possible: number;
  scorePercent: number;
  criticalFailure: boolean;
  criticalReasons: string[];
  allCriticalExhibitsInspected: boolean;
  allDecisionsMade: boolean;
  transferPassed: boolean;
  passed: boolean;
}

function optionById(options: Q26Option[], id: string | undefined): Q26Option | undefined {
  return options.find((o) => o.id === id);
}
function maxPoints(options: Q26Option[]): number {
  return options.reduce((m, o) => Math.max(m, o.points), 0);
}

export function scoreQ26Tabletop(sel: Q26Selections, tcase: Q26TabletopCase = QAPI2026_TABLETOP): Q26Score {
  let earned = 0;
  let possible = 0;
  const criticalReasons: string[] = [];

  const consider = (options: Q26Option[], chosenId: string | undefined, label: string) => {
    possible += maxPoints(options);
    const chosen = optionById(options, chosenId);
    if (chosen) {
      earned += chosen.points;
      if (chosen.criticalFailure) criticalReasons.push(label);
    }
  };

  for (const dec of tcase.decisions) consider(dec.options, sel.decisions[dec.id], `Decision ${dec.id}`);
  for (const q of tcase.surveyor) consider(q.options, sel.surveyor[q.id], `Surveyor ${q.id}`);
  for (const t of tcase.transfer) consider(t.options, sel.transferAnswers[t.id], `Transfer ${t.id}`);

  const scorePercent = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  const allCriticalExhibitsInspected = tcase.exhibits.filter((e) => e.critical).every((e) => sel.inspectedExhibitIds.includes(e.id));
  const allDecisionsMade =
    tcase.decisions.every((dec) => Boolean(sel.decisions[dec.id])) &&
    tcase.surveyor.every((q) => Boolean(sel.surveyor[q.id])) &&
    tcase.transfer.every((t) => Boolean(sel.transferAnswers[t.id]));

  const transferPassed = tcase.transfer.every((t) => optionById(t.options, sel.transferAnswers[t.id])?.points === maxPoints(t.options));
  const criticalFailure = criticalReasons.length > 0;

  const passed = scorePercent >= tcase.passScore && !criticalFailure && allCriticalExhibitsInspected && allDecisionsMade && transferPassed && sel.attested;

  return { earned, possible, scorePercent, criticalFailure, criticalReasons, allCriticalExhibitsInspected, allDecisionsMade, transferPassed, passed };
}
