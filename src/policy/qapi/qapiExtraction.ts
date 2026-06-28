/* ════════════════════════════════════════════════════════════════
   PHASE 3 — Source-data reconciliation.

   Derive QAPI counts/rollups from the clinical source dump (OASIS/POC
   shaped in production; the mock dump mirrors that shape). Everything is
   capped to the date window — post-through events are EXCLUDED, never
   silently counted. Where the source is incomplete/contradictory we emit
   "source data insufficient / data-quality" exceptions instead of
   fabricating precision. Deterministic: same input → same output.
   ════════════════════════════════════════════════════════════════ */
import type { ClinicalDump, SourcePatient, ValidationFinding } from './qapiTypes';
import { buildQapiDateWindow, isWithinWindow, parseLooseDate, type QapiDateWindow } from './qapiDateWindow';

export interface QapiRollup {
  window: QapiDateWindow;
  census: {
    patientsInScope: number;
    activeCensus: number;
    discharged: number;
    recertDue: number;
    highAcuity: number;
    uniquePatients: number;       // after de-duping client_id
    duplicateClientIds: string[];
  };
  highRisk: {
    immediateActionCases: number;        // sentinel / critical flags
    qapiRequiredCases: number;           // any high-risk flag
    topFlags: Array<{ flag: string; count: number }>;
    systemicThemes: string[];
  };
  incidents: { total: number; byCategory: Record<string, number>; openRca: number; unreported: number; excludedFutureDated: number };
  infections: { total: number; healthcareAssociated: number; communityAcquired: number; unreportedToState: number; excludedFutureDated: number };
  labs: { criticalTotal: number; criticalUnreported: number };
  // OASIS / POC document-level findings (what Brad actually checks)
  documentation: {
    oasisLateSoc: number;
    pocMissingF2F: number;
    pocUnsignedOrMissingSignature: number;
    homeboundNotJustified: number;
    medReconMismatch: number;
    pressureInjuryNoWoundOrders: number;
    therapyNeedNoOrder: number;
  };
  exceptions: ValidationFinding[];   // source-data-insufficient / data-quality issues
}

const arr = <T>(v: T[] | undefined): T[] => (Array.isArray(v) ? v : []);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number.NaN);

export function extractQapiRollup(dump: ClinicalDump, eventDateInput: string, opts: { reviewQuarter?: string; latestClosedSourceDate?: string } = {}): QapiRollup {
  // Default the review quarter from the dump's declared quarter so a post-quarter
  // meeting (e.g. July reviewing Q2) is correctly marked FINAL.
  const reviewQuarter = opts.reviewQuarter ?? dump.meta?.quarter;
  const window = buildQapiDateWindow(eventDateInput, { reviewQuarter, latestClosedSourceDate: opts.latestClosedSourceDate });
  const exceptions: ValidationFinding[] = [];
  const patients = arr(dump.patients);

  // ── de-dupe + census ──
  const seen = new Map<string, number>();
  const dupes = new Set<string>();
  let blankIds = 0;
  for (const p of patients) {
    const id = String(p.client_id ?? '').trim();
    if (!id) { blankIds++; continue; }
    const key = id.toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if ((seen.get(key) ?? 0) > 1) dupes.add(id);
  }
  const uniquePatients = seen.size;
  if (blankIds) exceptions.push(dq('census', `${blankIds} patient record(s) have a blank client_id`, 'high', 'Assign/repair client identifiers before census can be certified.'));
  if (dupes.size) exceptions.push(dq('census', `Duplicate client_id(s): ${[...dupes].join(', ')}`, 'high', 'Resolve duplicate records — census denominator is unreliable.'));

  const active = patients.filter((p) => p.admission_status === 'active');
  const discharged = patients.filter((p) => p.admission_status === 'discharged');
  const recertDue = patients.filter((p) => p.admission_status === 'recert_due');

  // contradictions: discharged but active visits this period
  for (const p of discharged) {
    if (num(p.active_visits_this_period) > 0) {
      exceptions.push(dq(`patient.${p.client_id || '?'}.admission_status`, 'Discharged patient has active visits this period (status/visit contradiction).', 'high', 'Reconcile EMR status vs visit log before counting census.', p.mrn || p.client_id));
    }
    void 0;
  }
  // impossible ages / invalid demographics
  for (const p of patients) {
    const a = num(p.age);
    if (Number.isFinite(a) && (a <= 0 || a > 120)) exceptions.push(dq(`patient.${p.client_id || '?'}.age`, `Impossible age (${p.age}).`, 'medium', 'Correct demographic data.', p.mrn || p.client_id));
  }

  // ── high-risk rollup ──
  const flagCounts: Record<string, number> = {};
  let immediate = 0, qapiReq = 0;
  for (const p of patients) {
    const flags = arr(p.high_risk_flags);
    if (flags.length) qapiReq++;
    for (const f of flags) { flagCounts[f] = (flagCounts[f] ?? 0) + 1; if (/sentinel|fall_with_injury|medication_error|unreported_fall|pressure_injury|wound_deterioration/.test(f)) immediate++; }
  }
  const topFlags = Object.entries(flagCounts).map(([flag, count]) => ({ flag, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  const systemicThemes = topFlags.filter((f) => f.count >= 5).map((f) => f.flag.replace(/_/g, ' '));

  // ── incidents (window-capped) ──
  const inc = arr(dump.incidents);
  const incByCat: Record<string, number> = {};
  let openRca = 0, unreportedInc = 0, futInc = 0, incCounted = 0;
  for (const e of inc) {
    if (parseLooseDate(e.date_of_incident) && !isWithinWindow(window, e.date_of_incident)) { futInc++; continue; }
    incCounted++;
    const c = e.category || 'unspecified'; incByCat[c] = (incByCat[c] ?? 0) + 1;
    if (!e.rca_completed) openRca++;
    if (!e.reported) unreportedInc++;
  }

  // ── infections (window-capped) ──
  const infs = arr(dump.infections);
  let hca = 0, ca = 0, unreportedState = 0, futInf = 0, infCounted = 0;
  for (const e of infs) {
    if (parseLooseDate(e.date_onset) && !isWithinWindow(window, e.date_onset)) { futInf++; continue; }
    infCounted++;
    if (e.healthcare_associated) hca++;
    if (e.community_acquired) ca++;
    if (!e.reported_to_state) unreportedState++;
  }

  // ── labs ──
  const labs = arr(dump.labs);
  const crit = labs.filter((l) => l.critical);
  const critUnreported = crit.filter((l) => !l.reported_to_physician_within_policy).length;
  if (critUnreported) exceptions.push(dq('labs', `${critUnreported} critical lab value(s) not reported to physician within policy.`, 'blocker', 'Physician-notification audit + reporting retraining; see personnel addendum.'));

  // ── OASIS / POC documentation findings ──
  const doc = { oasisLateSoc: 0, pocMissingF2F: 0, pocUnsignedOrMissingSignature: 0, homeboundNotJustified: 0, medReconMismatch: 0, pressureInjuryNoWoundOrders: 0, therapyNeedNoOrder: 0 };
  for (const p of patients) {
    const dqi = arr(p.data_quality_issues);
    if (p.oasis?.M0090_timeliness === 'late' || dqi.includes('oasis_soc_not_completed_within_5_days')) doc.oasisLateSoc++;
    if (dqi.includes('missing_face_to_face_encounter') || p.poc?.f2f_documented === false) doc.pocMissingF2F++;
    if (p.poc?.physician_signature_status && p.poc.physician_signature_status !== 'signed') doc.pocUnsignedOrMissingSignature++;
    if (dqi.includes('homebound_status_not_justified') || !(p.poc?.homebound_justification)) doc.homeboundNotJustified++;
    if (dqi.includes('medication_reconciliation_count_mismatch')) doc.medReconMismatch++;
    if (dqi.includes('pressure_injury_present_no_wound_orders')) doc.pressureInjuryNoWoundOrders++;
    if (dqi.includes('oasis_high_mobility_need_but_no_therapy_ordered')) doc.therapyNeedNoOrder++;
  }
  if (doc.pocMissingF2F) exceptions.push(dq('poc.f2f', `${doc.pocMissingF2F} POC(s) missing a documented face-to-face encounter.`, 'high', 'Obtain/scan F2F; Medicare coverage risk until resolved.'));
  if (doc.pocUnsignedOrMissingSignature) exceptions.push(dq('poc.signature', `${doc.pocUnsignedOrMissingSignature} POC(s) unsigned/pending physician signature.`, 'high', 'Pursue signed orders; verbal orders must be signed timely.'));
  if (doc.homeboundNotJustified) exceptions.push(dq('poc.homebound', `${doc.homeboundNotJustified} patient(s) lack documented homebound justification.`, 'medium', 'Document homebound status per Medicare criteria.'));

  return {
    window,
    census: {
      patientsInScope: patients.length,
      activeCensus: active.length,
      discharged: discharged.length,
      recertDue: recertDue.length,
      highAcuity: patients.filter((p) => p.acuity === 'high').length,
      uniquePatients,
      duplicateClientIds: [...dupes],
    },
    highRisk: { immediateActionCases: immediate, qapiRequiredCases: qapiReq, topFlags, systemicThemes },
    incidents: { total: incCounted, byCategory: incByCat, openRca, unreported: unreportedInc, excludedFutureDated: futInc },
    infections: { total: infCounted, healthcareAssociated: hca, communityAcquired: ca, unreportedToState: unreportedState, excludedFutureDated: futInf },
    labs: { criticalTotal: crit.length, criticalUnreported: critUnreported },
    documentation: doc,
    exceptions,
  };
}

function dq(path: string, reason: string, severity: ValidationFinding['severity'], remediation: string, sourceArtifactId?: string): ValidationFinding {
  return { pass: false, severity, path, reason, remediation, sourceArtifactId };
}

/** Convenience: list patients with the most data-quality issues (for triage). */
export function worstDataQualityPatients(dump: ClinicalDump, limit = 10): Array<{ id: string; issues: string[] }> {
  return arr(dump.patients)
    .map((p: SourcePatient) => ({ id: String(p.client_id || p.mrn || p.name || '?'), issues: arr(p.data_quality_issues) }))
    .filter((x) => x.issues.length)
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, limit);
}
