// Deterministic generator for the Q2-2026 messy clinical/clinician mock dump.
// Run: node scripts/generateMockClinicalDump.mjs
// Output: output/clients.q1q2-2026.mock.json
//
// GOALS (per QAPI hardening mission):
//  - 70+ HIGH-ACUITY patients with LOTS of intentional inaccuracies / data-quality
//    defects (so the QAPI process must SURFACE them, not hide them).
//  - 30 clinicians "who keep messing up" — each carries one or more disciplinary
//    triggers: expired_license, beyond_scope, falsified_visits, failed_pip /
//    pending_termination + high-risk assignment, unreported_critical_labs,
//    unreported_falls, hha_no_supervision, expired_cpr, missing_competency,
//    repeated late_documentation.
//  - Deterministic (seeded PRNG) → reproducible packets.
//
// The messiness is the point: contradictory statuses, duplicate/blank MRNs, mixed
// date formats, impossible vitals/ages, discharged patients with active visits,
// future-dated June events (to exercise the interim/final date-window rule), etc.

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// ── seeded PRNG (mulberry32) — no Math.random, so output is reproducible ──
let _seed = 0x9e3779b9;
function rng() { _seed |= 0; _seed = (_seed + 0x6d2b79f5) | 0; let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const chance = (p) => rng() < p;
const int = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
const pad = (n, w = 4) => String(n).padStart(w, '0');

const FIRST = ['Margaret','Robert','Dolores','William','Yuki','James','Eleanor','Antonio','Patricia','Raj','Maria','Theodore','Dorothy','Samuel','Catherine','Ernesto','Miriam','Huong','Charles','Amara','George','Linda','Ricardo','Helen','Darnell','Ingrid','Marco','Priscilla','Benjamin','Aisha','Hector','Nadia','Walter','Rosa','Gerald','Fatima','Leon','Beatriz','Owen','Tamsin'];
const LAST = ['Chen','Sullivan','Gutierrez','Petersen','Tanaka','Washington','Whitfield','Ferreira','Kelly','Patel','Rosario','Park','Jenkins','Yamamoto','Montgomery','Diaz','Goldstein','Nguyen','Foster','Nwosu','Henderson','Cheng','Sandoval','Kowalski','Jackson','Bergstrom','Bianchi','Hawkins','Asante','Khan','Morales','Rahman','Brooks','Vargas','OBrien','Haddad','Petrov','Costa','Reilly','Webb'];
const HIGH_ACUITY_DX = [
  'Sepsis, severe, post-discharge', 'CHF exacerbation NYHA IV', 'Stage 4 sacral pressure injury',
  'Ventilator-dependent respiratory failure', 'Acute on chronic kidney disease on HD',
  'Necrotizing fasciitis s/p debridement', 'Metastatic cancer with bone mets, pathologic fracture',
  'CVA with dysphagia and aspiration risk', 'Diabetic foot osteomyelitis s/p ray amputation',
  'COPD with home O2 + cor pulmonale', 'Infective endocarditis on 6wk IV abx',
  'Hip fracture s/p ORIF, high fall risk', 'Tracheostomy + home ventilator', 'GI bleed on anticoagulation',
  'Liver transplant, immunosuppressed', 'New T1DM with DKA history', 'Seizure disorder, new meningioma',
];
const PAYERS = ['Original Medicare Fee-for-Service', 'Medicare Advantage (Kaiser)', 'Medi-Cal', 'Private pay', 'Long-term care insurance (Genworth)', "Workers' Compensation (State Comp Fund)", 'VA community care', 'Pending verification', '', 'UNKNOWN'];
const RISK_FLAGS = ['fall_risk_high', 'infection_high', 'anticoagulant', 'pressure_injury', 'medication_error', 'unreported_fall', 'hospitalization_30d', 'wound_deterioration', 'polypharmacy_15plus'];
const CLINICIAN_ROLES = ['RN', 'LVN', 'PT', 'PTA', 'OT', 'COTA', 'HHA', 'MSW'];

// ── 30 clinicians who keep messing up ──
const TRIGGER_LIBRARY = [
  { category: 'expired_license', risk: 'critical', detail: 'Provided skilled care under a license that expired during the visit period.' },
  { category: 'beyond_scope', risk: 'critical', detail: 'LVN performed start-of-care comprehensive assessment (RN-only task).' },
  { category: 'beyond_scope', risk: 'high', detail: 'PTA performed the PT evaluation/initial assessment (PT-only task).' },
  { category: 'falsified_visits', risk: 'critical', detail: 'GPS/EVV time does not match documented visit time; visits documented for a hospitalized patient.' },
  { category: 'failed_pip_pending_termination', risk: 'high', detail: 'Clinician on failed PIP / pending termination still assigned to high-risk patients.' },
  { category: 'unreported_critical_labs', risk: 'critical', detail: 'Critical INR/potassium value not reported to physician within policy window.' },
  { category: 'unreported_falls', risk: 'high', detail: 'Patient fall not reported / no incident report filed within 24h.' },
  { category: 'hha_no_supervision', risk: 'high', detail: 'HHA delivered care without the required 14-day RN supervisory visit.' },
  { category: 'unauthorized_tasks', risk: 'high', detail: 'Aide performed tasks outside the authorized aide care plan.' },
  { category: 'expired_cpr', risk: 'medium', detail: 'CPR certification expired; continued patient care.' },
  { category: 'missing_competency', risk: 'medium', detail: 'No documented competency for a skill performed (e.g., wound vac, trach care).' },
  { category: 'late_documentation', risk: 'low', detail: 'Repeated late visit-note documentation beyond the 24/48h policy.' },
];

function makeClinicians() {
  const out = [];
  for (let i = 1; i <= 30; i++) {
    const role = pick(CLINICIAN_ROLES);
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    // each "keeps messing up": 1-3 triggers, weighted to their role where it makes sense
    const triggerCount = int(1, 3);
    const triggers = [];
    const used = new Set();
    for (let t = 0; t < triggerCount; t++) {
      let trg = pick(TRIGGER_LIBRARY);
      // make beyond_scope role-consistent
      if (trg.category === 'beyond_scope') {
        if (/LVN/.test(trg.detail) && role !== 'LVN') trg = TRIGGER_LIBRARY.find(x => x.category === 'beyond_scope' && /PTA/.test(x.detail)) || trg;
      }
      const key = trg.category + trg.detail;
      if (used.has(key)) continue; used.add(key);
      triggers.push({
        category: trg.category,
        risk_level: trg.risk,
        detail: trg.detail,
        client_id: chance(0.85) ? `MOCK-PT-Q2-${pad(int(1, 103))}` : '', // some triggers w/o a linked client (messy)
        occurred_on: messyDate(),
        reported: chance(0.4), // most NOT reported → that's the problem
      });
    }
    const licenseExpired = triggers.some(t => t.category === 'expired_license') || chance(0.25);
    const cprExpired = triggers.some(t => t.category === 'expired_cpr') || chance(0.3);
    out.push({
      clinician_id: `CLN-${pad(i, 3)}`,
      name: chance(0.1) ? '' : name, // some blank names (messy → must use ID)
      role,
      license_number: chance(0.1) ? '' : `${role}-CA-${int(100000, 999999)}`,
      license_expiration: licenseExpired ? messyDate(true) : '2027-' + pad(int(1, 12), 2) + '-15',
      cpr_expiration: cprExpired ? '2026-0' + int(1, 4) + '-10' : '2027-08-01',
      competencies_on_file: chance(0.3) ? ['skilled_nursing'] : ['skilled_nursing', 'wound_care', 'medication_management'],
      pip_status: triggers.some(t => /failed_pip/.test(t.category)) ? 'failed_pending_termination' : pick(['none', 'active', 'none', 'none']),
      supervision_status: triggers.some(t => t.category === 'hha_no_supervision') ? 'overdue' : 'current',
      late_documentation_count_q2: triggers.some(t => t.category === 'late_documentation') ? int(6, 22) : int(0, 3),
      assigned_high_risk_patients: int(0, 9),
      triggers,
    });
  }
  return out;
}

// mixed/zero-padded/invalid date formats to simulate messy source data
function messyDate(expiredOnly = false) {
  const fmts = expiredOnly
    ? ['2025-11-30', '2026-01-15', '03/2026', '2026-04-01', 'EXPIRED', '2026-02-29' /* invalid */]
    : ['2026-04-03', '2026-05-22', '04/18/2026', '2026-6-7' /* June, future vs May meeting */, '2026/05/30', '', '2026-13-02' /* invalid month */];
  return pick(fmts);
}

function makePatients() {
  const out = [];
  const total = 73; // 70+ high-acuity
  for (let i = 1; i <= total; i++) {
    // intentional MRN/client_id messiness: occasional duplicates + blanks + malformed
    let clientId = `MOCK-PT-Q2-${pad(i)}`;
    if (i === 21) clientId = 'MOCK-PT-Q2-0012'; // DUPLICATE of #12 (messy)
    if (i === 44) clientId = ''; // blank id (messy)
    if (i === 58) clientId = 'mock_pt_q2_58'; // malformed casing/format (messy)

    const age = chance(0.06) ? pick([0, 250, -3, 199]) /* impossible ages */ : int(58, 99);
    const gender = chance(0.08) ? pick(['', 'U', 'X']) : pick(['Female', 'Male']);
    const status = pick(['active', 'active', 'active', 'discharged', 'recert_due', 'recert_due']);
    const hasContradiction = chance(0.18);
    const flags = [];
    const flagN = int(1, 4);
    for (let f = 0; f < flagN; f++) { const fl = pick(RISK_FLAGS); if (!flags.includes(fl)) flags.push(fl); }

    out.push({
      client_id: clientId,
      mrn: chance(0.12) ? '' : `CI-MR-2026-${pad(i)}`,
      name: chance(0.09) ? pick(['', 'Unknown', 'TEST PATIENT']) : `${pick(FIRST)} ${pick(LAST)}`,
      age,
      gender,
      dob: pick(['1948-03-14', '03/14/1948', '1948-3-14', '', '02/30/1950' /* invalid */]),
      primary_dx: pick(HIGH_ACUITY_DX),
      acuity: 'high',
      admission_status: status,
      // contradiction: discharged but still has active visits this period
      active_visits_this_period: status === 'discharged' && hasContradiction ? int(2, 6) : (status === 'active' ? int(3, 14) : 0),
      soc_date: pick(['2026-04-01', '2026-05-07', '2026-06-12' /* future vs May7 meeting */, '', '04/2026']),
      cert_period_end: pick(['2026-06-30', '2026-07-15', '']),
      payer: pick(PAYERS),
      high_risk_flags: flags,
      assigned_clinician_id: `CLN-${pad(int(1, 30), 3)}`,
      // some metrics deliberately missing / impossible
      last_bp: chance(0.07) ? pick(['', '999/600', '0/0']) : `${int(98, 168)}/${int(54, 96)}`,
      hospitalized_q2: chance(0.22),
      ed_visit_q2: chance(0.18),
      // PRODUCTION-SHAPED documents Brad actually checks (not summaries):
      oasis: makeOasis(),
      poc: makePoc(),
      data_quality_issues: buildDQ(i, clientId, status, hasContradiction, age, gender),
    });
  }
  // Inject cross-document inconsistencies (OASIS vs POC vs assignment) AFTER build
  // so the validator/Brad must reconcile real documents, not trust a summary.
  out.forEach((p) => {
    const dq = p.data_quality_issues;
    // OASIS says max-assist ambulation (M1860 >= 4) but POC ordered no therapy
    if (Number(p.oasis.M1860_ambulation) >= 4 && !p.poc.orders.some((o) => /PT|OT|therapy/i.test(o))) dq.push('oasis_high_mobility_need_but_no_therapy_ordered');
    // POC orders PT but the assigned clinician is a PTA (scope problem link)
    if (p.poc.orders.some((o) => /PT /i.test(o)) && chance(0.3)) dq.push('therapy_ordered_assigned_to_assistant_check_scope');
    // F2F missing or homebound not justified — Medicare coverage risk
    if (!p.poc.f2f_documented) dq.push('missing_face_to_face_encounter');
    if (!p.poc.homebound_justification) dq.push('homebound_status_not_justified');
    // POC physician signature missing/pending past timeliness
    if (p.poc.physician_signature_status !== 'signed') dq.push('poc_physician_signature_' + p.poc.physician_signature_status);
    // Med reconciliation mismatch: OASIS M2001 says reconciled but med counts differ
    if (p.oasis.M2001_med_reconciliation === '1_yes' && p.poc.medication_count !== p.oasis.med_count_reviewed) dq.push('medication_reconciliation_count_mismatch');
    // OASIS pressure ulcer present (M1311) but no wound care orders
    if (Number(p.oasis.M1311_stage2plus_pu) > 0 && !p.poc.orders.some((o) => /wound|dressing/i.test(o))) dq.push('pressure_injury_present_no_wound_orders');
    // SOC OASIS not completed within 5 days of SOC (M0090 timeliness)
    if (p.oasis.M0090_timeliness === 'late') dq.push('oasis_soc_not_completed_within_5_days');
  });
  return out;
}

// ── OASIS-E (production item shape, with intentional gaps/inconsistencies) ──
function makeOasis() {
  const blankish = () => pick(['', '-', 'UK']);
  return {
    assessment_type: pick(['SOC', 'ROC', 'Recertification', 'Recertification', 'Discharge']),
    M0090_info_completed_date: pick(['2026-04-03', '2026-05-09', '2026-6-2', '', '04/30/2026']),
    M0090_timeliness: pick(['on_time', 'on_time', 'late']),
    M1021_primary_dx: pick(HIGH_ACUITY_DX),
    M1311_stage2plus_pu: chance(0.35) ? int(1, 3) : 0,
    M1830_bathing: chance(0.08) ? blankish() : int(2, 6),
    M1840_toileting: chance(0.08) ? blankish() : int(0, 4),
    M1860_ambulation: chance(0.08) ? blankish() : int(1, 6),
    GG0130_selfcare_admit: chance(0.1) ? blankish() : int(1, 6),
    GG0170_mobility_admit: chance(0.1) ? blankish() : int(1, 6),
    M1033_hosp_risk_factors: int(0, 5),
    M2020_oral_meds: chance(0.1) ? blankish() : int(0, 3),
    M2030_injectable_meds: chance(0.1) ? blankish() : pick([0, 1, 2, 3, 'NA']),
    M2001_med_reconciliation: pick(['1_yes', '0_no', '1_yes', '']),
    med_count_reviewed: int(6, 19),
    M1242_pain_freq: int(0, 4),
    M1400_dyspnea: int(0, 4),
    M2200_therapy_need_visits: chance(0.12) ? blankish() : int(0, 30),
    signed_by_clinician: chance(0.85),
    locked_in_emr: chance(0.7),
  };
}

// ── CMS-485 Plan of Care (production shape, with intentional gaps) ──
function makePoc() {
  const disciplines = [];
  if (chance(0.95)) disciplines.push(`SN ${int(1, 3)}w${int(4, 9)}`);
  if (chance(0.6)) disciplines.push(`PT ${int(1, 3)}w${int(2, 6)}`);
  if (chance(0.35)) disciplines.push(`OT ${int(1, 2)}w${int(2, 4)}`);
  if (chance(0.4)) disciplines.push(`HHA ${int(2, 5)}w${int(2, 8)}`);
  if (chance(0.5)) disciplines.push(`Wound care / dressing change ${int(1, 3)}x/day`);
  if (chance(0.3)) disciplines.push(`MSW ${int(1, 2)} visit(s)`);
  const sigStatus = pick(['signed', 'signed', 'pending', 'missing']);
  return {
    form: 'CMS-485',
    physician: chance(0.1) ? '' : `Dr. ${pick(FIRST)} ${pick(LAST)}, MD`,
    physician_npi: chance(0.15) ? '' : String(int(1000000000, 1999999999)),
    cert_period: pick(['2026-04-01 to 2026-05-30', '2026-05-07 to 2026-07-05', '']),
    orders: disciplines,
    goals: pick([['Wound closure', 'Independent ambulation 50ft'], ['Med management independence'], ['Caregiver competent in care'], []]),
    homebound_justification: chance(0.78) ? 'Taxing effort to leave home; requires assistive device + max assist.' : '',
    f2f_encounter_date: chance(0.8) ? pick(['2026-03-29', '2026-04-26', '2026-05-02']) : '',
    f2f_documented: chance(0.8),
    physician_signature_status: sigStatus,
    physician_signature_date: sigStatus === 'signed' ? pick(['2026-04-10', '2026-05-15', '2026-06-20']) : '',
    medication_count: int(5, 20),
    verbal_orders_unsigned: chance(0.3) ? int(1, 4) : 0,
  };
}

function buildDQ(i, clientId, status, contradiction, age, gender) {
  const issues = [];
  if (!clientId) issues.push('missing_client_id');
  if (clientId === 'MOCK-PT-Q2-0012' && i === 21) issues.push('duplicate_client_id');
  if (/[a-z_]/.test(clientId)) issues.push('malformed_client_id');
  if (status === 'discharged' && contradiction) issues.push('discharged_but_active_visits');
  if (age <= 0 || age > 120) issues.push('impossible_age');
  if (!gender || gender === 'U' || gender === 'X') issues.push('missing_or_invalid_gender');
  return issues;
}

function makeIncidents(patients) {
  const out = [];
  const cats = ['fall', 'fall_with_injury', 'medication_error', 'pressure_injury', 'elopement', 'near_miss', 'unreported_fall'];
  for (let n = 1; n <= 28; n++) {
    const pt = pick(patients);
    out.push({
      incident_id: `INC-2026-Q2-${pad(n, 3)}`,
      client_id: pt.client_id || `MOCK-PT-Q2-${pad(int(1, 73))}`,
      category: pick(cats),
      severity: pick(['minor', 'moderate', 'major', 'sentinel']),
      date_of_incident: pick(['2026-04-09', '2026-05-03', '2026-06-19' /* future vs May7 */, '2026-05-30', '']),
      reported: chance(0.55),
      rca_completed: chance(0.4),
      reported_to_physician: chance(0.5),
      assigned_clinician_id: pt.assigned_clinician_id,
    });
  }
  return out;
}

function makeInfections(patients) {
  const out = [];
  for (let n = 1; n <= 9; n++) {
    const pt = pick(patients);
    out.push({
      infection_id: `INF-2026-Q2-${pad(n, 3)}`,
      client_id: pt.client_id || `MOCK-PT-Q2-${pad(int(1, 73))}`,
      infection_type: pick(['UTI', 'wound', 'respiratory', 'bloodstream', 'cellulitis']),
      healthcare_associated: chance(0.5),
      community_acquired: chance(0.5),
      date_onset: pick(['2026-04-12', '2026-05-21', '2026-06-08' /* future */, '']),
      reported_to_state: chance(0.3),
    });
  }
  return out;
}

function makeLabs(patients) {
  const out = [];
  for (let n = 1; n <= 12; n++) {
    const pt = pick(patients);
    out.push({
      lab_id: `LAB-2026-Q2-${pad(n, 3)}`,
      client_id: pt.client_id || `MOCK-PT-Q2-${pad(int(1, 73))}`,
      test: pick(['INR', 'Potassium', 'Hgb', 'Creatinine', 'Glucose']),
      critical: chance(0.6),
      value: pick(['INR 6.8', 'K 6.2', 'Hgb 6.1', 'Cr 4.9', 'Glu 38']),
      reported_to_physician_within_policy: chance(0.45), // many NOT → unreported_critical_labs trigger
      drawn_on: pick(['2026-05-02', '2026-05-28', '2026-06-15']),
    });
  }
  return out;
}

const clinicians = makeClinicians();
const patients = makePatients();
const incidents = makeIncidents(patients);
const infections = makeInfections(patients);
const labs = makeLabs(patients);

// roll up personnel triggers for convenience (the addendum generator can also derive)
const personnelTriggerCount = clinicians.reduce((a, c) => a + c.triggers.length, 0);
const byCategory = {};
clinicians.forEach((c) => c.triggers.forEach((t) => { byCategory[t.category] = (byCategory[t.category] || 0) + 1; }));

const dump = {
  meta: {
    source: 'Client Clinicians Mock File Dump (expanded, intentionally messy)',
    generated_for: 'Q2-2026 QAPI hardening / HR-Compliance addendum',
    quarter: 'Q2-2026',
    reporting_period: { start: '2026-04-01', end: '2026-06-30' },
    note: 'Synthetic data. Contains DELIBERATE inaccuracies, contradictions, duplicates, mixed/invalid date formats, impossible values, and post-meeting (June) events to exercise QAPI date-window + data-quality validation. NOT real PHI.',
    counts: {
      patients: patients.length,
      clinicians: clinicians.length,
      incidents: incidents.length,
      infections: infections.length,
      labs: labs.length,
      personnel_triggers: personnelTriggerCount,
      personnel_triggers_by_category: byCategory,
    },
  },
  patients,
  clinicians,
  incidents,
  infections,
  labs,
};

const outPath = 'output/clients.q1q2-2026.mock.json';
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(dump, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
console.log(`patients=${patients.length} clinicians=${clinicians.length} incidents=${incidents.length} infections=${infections.length} labs=${labs.length} personnel_triggers=${personnelTriggerCount}`);
console.log('triggers by category:', byCategory);
