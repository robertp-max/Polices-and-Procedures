/* ══════════════════════════════════════════════════════════════════════
   QAPI intake adapter.

   Turns an uploaded QAPI source (a mock clinical dump, a messy narrative
   export, a spreadsheet-as-JSON, whatever actually gets uploaded) into the
   derived QAPI packet sections — WITHOUT requiring the upload to already
   match a fixed TypeScript interface. Two derivation paths:

     1. deriveQapiBundleFromClinicalDump — the upload parses as (or close
        enough to) the well-formed `ClinicalDump` shape (src/policy/qapi/
        qapiTypes.ts). Delegates to the existing, already-tested
        extractQapiRollup() for real census/high-risk/incident/infection/
        documentation math — nothing here re-derives that logic.
     2. deriveQapiBundleFromRecords — the upload is messy/narrative (the
        real-world case that produced the "shell packet" bug: prose mixed
        with an embedded JSON blob, camelCase field names, no fixed shape).
        Walks the ParsedRecordCell[] from fileParsing.ts's JSON-fallback
        recovery, alias-matching common field names, and produces the same
        section shape with every metric flagged low-confidence + carrying
        verbatim source quotes for reviewer confirmation.

   Every metric is a QapiDerivedMetric — value + confidence + source quotes
   + needsReview — so "we found nothing" is always visible in the review UI
   as "No source evidence — verify manually," never a silently blank field.
   ══════════════════════════════════════════════════════════════════════ */

import type { ClinicalDump } from '../../../qapi/qapiTypes';
import { extractQapiRollup, type QapiRollup } from '../../../qapi/qapiExtraction';
import type { ParsedFile, ParsedRecordCell } from '../../../evidence/intake/fileParsing';

/* ─── Quarter segmentation (fixes Q1/Q2/Q3/Q4 cross-contamination) ───────
   A single dump often contains multiple quarters back-to-back (each opening
   with "Dataset ID: QAPI-Q{n}-DS-…" + "Quarter: Q{n} 20YY (…)" + "QAPI
   Meeting Date: …"). Treating the whole file as one record makes alias/
   keyword recovery pull values ACROSS quarter boundaries — the packet then
   mislabels Q2 data as Q1, etc. So we hard-segment first and extract from
   exactly one quarter, selected by the event's meeting date (robust: a
   quarter's REVIEW meeting falls in the next calendar quarter, so meeting-
   date matching beats calendar-quarter math). Fail closed when the target
   can't be resolved. */

export interface QapiSourceSegment {
  /** e.g. "QAPI-Q2-DS-001" */
  datasetId: string | null;
  /** e.g. "2026-Q2" */
  quarter: string | null;
  /** e.g. "Q2 2026" */
  quarterLabel: string | null;
  /** Source agency name (NOT necessarily Care Indeed — provenance). */
  agency: string | null;
  /** e.g. "2026-07-10" */
  meetingDate: string | null;
  /** True when the source declares itself synthetic/mock/non-PHI. */
  synthetic: boolean;
  /** The verbatim text of just this quarter's block. */
  text: string;
}

const DATASET_MARKER_RE = /Dataset ID:\s*(QAPI-Q([1-4])-DS-[A-Za-z0-9-]+)/g;

/** Split a multi-quarter dump into per-quarter segments. Returns [] when the
    source has 0–1 dataset markers (i.e. not a multi-quarter file). */
export function segmentQapiSourceByQuarter(fullText: string): QapiSourceSegment[] {
  const marks = [...fullText.matchAll(DATASET_MARKER_RE)];
  if (marks.length <= 1) return [];
  const docAgency = /Agency:\s*([^\n|]+)/.exec(fullText)?.[1]?.trim() ?? null;
  const segs: QapiSourceSegment[] = [];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index ?? 0;
    const end = i + 1 < marks.length ? (marks[i + 1].index ?? fullText.length) : fullText.length;
    const text = fullText.slice(start, end);
    const qMatch = /Quarter:\s*Q([1-4])\s*(20\d{2})/.exec(text);
    segs.push({
      datasetId: marks[i][1],
      quarter: qMatch ? `${qMatch[2]}-Q${qMatch[1]}` : null,
      quarterLabel: qMatch ? `Q${qMatch[1]} ${qMatch[2]}` : `Q${marks[i][2]}`,
      agency: /Agency:\s*([^\n|]+)/.exec(text)?.[1]?.trim() ?? docAgency,
      meetingDate: /QAPI Meeting Date:\s*(20\d{2}-\d{2}-\d{2})/.exec(text)?.[1] ?? null,
      synthetic: /\bsynthetic\b|\bmock\b|not for production|no real phi/i.test(text),
      text,
    });
  }
  return segs;
}

export interface QuarterSelection {
  segment: QapiSourceSegment | null;
  segments: QapiSourceSegment[];
  conflict: boolean;
  reason: string;
}

/** Pick the ONE segment to use, by (1) explicit target quarter, else (2) the
    segment whose QAPI Meeting Date equals the event date. Fail closed (no
    segment, conflict=true) when it can't be resolved unambiguously. */
export function selectQuarterSegment(
  segments: QapiSourceSegment[],
  opts: { eventDateISO?: string; targetQuarter?: string },
): QuarterSelection {
  if (segments.length === 0) return { segment: null, segments, conflict: false, reason: 'single-quarter source' };

  if (opts.targetQuarter) {
    const s = segments.find((x) => x.quarter === opts.targetQuarter);
    if (s) return { segment: s, segments, conflict: false, reason: `matched requested quarter ${opts.targetQuarter}` };
    return { segment: null, segments, conflict: true, reason: `requested quarter ${opts.targetQuarter} not present (found ${segments.map((x) => x.quarter ?? '?').join(', ')})` };
  }

  if (opts.eventDateISO) {
    const byMeeting = segments.filter((x) => x.meetingDate === opts.eventDateISO);
    if (byMeeting.length === 1) return { segment: byMeeting[0], segments, conflict: false, reason: `matched meeting date ${opts.eventDateISO} → ${byMeeting[0].quarterLabel}` };
    if (byMeeting.length > 1) return { segment: null, segments, conflict: true, reason: `${byMeeting.length} quarters share meeting date ${opts.eventDateISO}` };
  }

  return {
    segment: null,
    segments,
    conflict: true,
    reason: `source contains ${segments.length} quarters (${segments.map((x) => x.quarterLabel ?? '?').join(', ')}) but none matches the event${opts.eventDateISO ? ` meeting date ${opts.eventDateISO}` : ''} — specify the quarter to generate.`,
  };
}

export interface ResolvedQapiSource extends QuarterSelection {
  /** Parsed file narrowed to the selected quarter (or the original when single-quarter). */
  parsed: ParsedFile;
}

/** Resolve a (possibly multi-quarter) parsed dump to a single quarter's
    records + provenance. Shared by deriveQapiBundle and the packet driver so
    both agree on which quarter — and whether to fail closed. */
export function resolveQapiSource(parsed: ParsedFile, eventDateISO: string, targetQuarter?: string): ResolvedQapiSource {
  const fullText = parsed.records.map((r) => r.text ?? '').join('\n');
  const segments = segmentQapiSourceByQuarter(fullText);
  if (segments.length === 0) {
    return { segment: null, segments, conflict: false, reason: 'single-quarter source', parsed };
  }
  const sel = selectQuarterSegment(segments, { eventDateISO, targetQuarter });
  if (!sel.segment) return { ...sel, parsed };
  // Narrow the parsed file to just the selected quarter's text.
  const narrowed: ParsedFile = {
    ...parsed,
    records: [{ pointer: `quarter:${sel.segment.quarter ?? sel.segment.quarterLabel ?? '?'}`, fields: { text: sel.segment.text.slice(0, 8000) }, text: sel.segment.text }],
    note: `Segmented to ${sel.segment.quarterLabel} (${sel.segment.datasetId}) from a ${segments.length}-quarter dump. ${parsed.note ?? ''}`.trim(),
  };
  return { ...sel, parsed: narrowed };
}

export interface QapiDerivedMetric {
  value: number | string | string[] | null;
  confidence: 'high' | 'low' | 'none';
  sourceQuotes: string[];
  needsReview: boolean;
  note?: string;
}

export interface QapiPipTriggerCandidate {
  trigger: string;
  issueSummary: string;
  severity: 'blocker' | 'high' | 'medium' | 'low';
  ownerRoleSuggested: string;
  correctiveActionRequired: boolean;
  remeasurementMetric: string;
  qapiReviewRequired: true;
  sourceQuotes: string[];
}

export interface QapiDerivedBundle {
  sourceMode: 'clinical_dump' | 'heuristic_records' | 'none';
  overallNote: string;
  meetingDetails: {
    attendeeRoster: QapiDerivedMetric;
    quorumStatus: QapiDerivedMetric;
  };
  censusPopulation: {
    activeCensus: QapiDerivedMetric;
    dischargedCount: QapiDerivedMetric;
    recertificationCount: QapiDerivedMetric;
    qapiRequiredCount: QapiDerivedMetric;
    highAcuityCount: QapiDerivedMetric;
  };
  highRiskRollup: {
    topFlags: QapiDerivedMetric;
    immediateActionCases: QapiDerivedMetric;
    clinicianPipOrLicenseFlagCount: QapiDerivedMetric;
    clinicianDisciplinaryActionCount: QapiDerivedMetric;
    overloadedClinicianAssignmentCount: QapiDerivedMetric;
  };
  adverseEvents: {
    hospitalizationsTotal: QapiDerivedMetric;
    fallsTotal: QapiDerivedMetric;
    infectionsTotal: QapiDerivedMetric;
    unreportedInfections: QapiDerivedMetric;
    criticalLabEventsUnreported: QapiDerivedMetric;
  };
  pipCorrectiveAction: QapiPipTriggerCandidate[];
  chartAuditDocumentationIntegrity: {
    oasisLateSoc: QapiDerivedMetric;
    pocMissingF2F: QapiDerivedMetric;
    pocUnsignedOrMissingSignature: QapiDerivedMetric;
    medReconciliationMismatch: QapiDerivedMetric;
  };
  infectionControl: {
    healthcareAssociated: QapiDerivedMetric;
    communityAcquired: QapiDerivedMetric;
    unreportedToState: QapiDerivedMetric;
  };
  medicationSafety: {
    medicationEventLineList: QapiDerivedMetric;
  };
}

const NO_EVIDENCE = (note = 'No source evidence — verify manually.'): QapiDerivedMetric => ({
  value: null,
  confidence: 'none',
  sourceQuotes: [],
  needsReview: true,
  note,
});

const highConfidence = (value: QapiDerivedMetric['value'], sourceQuotes: string[] = []): QapiDerivedMetric => ({
  value,
  confidence: 'high',
  sourceQuotes,
  needsReview: false,
});

const lowConfidence = (value: QapiDerivedMetric['value'], sourceQuotes: string[], note?: string): QapiDerivedMetric => ({
  value,
  confidence: 'low',
  sourceQuotes,
  needsReview: true,
  note: note ?? 'Derived heuristically from an unstructured upload — confirm against the source before use.',
});

/* ─── Path 1: well-formed ClinicalDump ──────────────────────────────── */

export function deriveQapiBundleFromClinicalDump(dump: ClinicalDump, eventDateISO: string): QapiDerivedBundle {
  const rollup: QapiRollup = extractQapiRollup(dump, eventDateISO);
  const pipTriggers = buildPipTriggersFromRollup(rollup);

  return {
    sourceMode: 'clinical_dump',
    overallNote: `Derived from a well-formed clinical dump (${dump.patients?.length ?? 0} patients, ${dump.clinicians?.length ?? 0} clinicians) via extractQapiRollup().`,
    meetingDetails: {
      attendeeRoster: NO_EVIDENCE('Clinical dumps do not carry meeting attendance — enter manually.'),
      quorumStatus: NO_EVIDENCE('Clinical dumps do not carry meeting attendance — enter manually.'),
    },
    censusPopulation: {
      activeCensus: highConfidence(rollup.census.activeCensus),
      dischargedCount: highConfidence(rollup.census.discharged),
      recertificationCount: highConfidence(rollup.census.recertDue),
      qapiRequiredCount: highConfidence(rollup.highRisk.qapiRequiredCases),
      highAcuityCount: highConfidence(rollup.census.highAcuity),
    },
    highRiskRollup: {
      topFlags: highConfidence(rollup.highRisk.topFlags.map((f) => `${f.flag} (${f.count})`)),
      immediateActionCases: highConfidence(rollup.highRisk.immediateActionCases),
      clinicianPipOrLicenseFlagCount: highConfidence(dump.clinicians?.filter((c) => !!c.pip_status || !!c.license_expiration).length ?? 0),
      clinicianDisciplinaryActionCount: NO_EVIDENCE('ClinicalDump.SourceClinician has no disciplinary-action field — only pip_status/triggers.'),
      overloadedClinicianAssignmentCount: highConfidence(dump.clinicians?.filter((c) => (c.assigned_high_risk_patients ?? 0) > 8).length ?? 0),
    },
    adverseEvents: {
      hospitalizationsTotal: highConfidence(dump.patients?.filter((p) => p.hospitalized_q2).length ?? 0),
      fallsTotal: highConfidence(rollup.highRisk.topFlags.find((f) => /fall/i.test(f.flag))?.count ?? 0),
      infectionsTotal: highConfidence(rollup.infections.total),
      unreportedInfections: highConfidence(rollup.infections.unreportedToState),
      criticalLabEventsUnreported: highConfidence(rollup.labs.criticalUnreported),
    },
    pipCorrectiveAction: pipTriggers,
    chartAuditDocumentationIntegrity: {
      oasisLateSoc: highConfidence(rollup.documentation.oasisLateSoc),
      pocMissingF2F: highConfidence(rollup.documentation.pocMissingF2F),
      pocUnsignedOrMissingSignature: highConfidence(rollup.documentation.pocUnsignedOrMissingSignature),
      medReconciliationMismatch: highConfidence(rollup.documentation.medReconMismatch),
    },
    infectionControl: {
      healthcareAssociated: highConfidence(rollup.infections.healthcareAssociated),
      communityAcquired: highConfidence(rollup.infections.communityAcquired),
      unreportedToState: highConfidence(rollup.infections.unreportedToState),
    },
    medicationSafety: {
      // Neither ClinicalDump nor QapiRollup model a discrete medication-event
      // line list (only aggregate med-reconciliation mismatch counts) — do
      // not invent one; surface what IS real (medReconciliationMismatch above)
      // and flag this specific line item as unavailable from this source shape.
      medicationEventLineList: NO_EVIDENCE('This source shape has no discrete medication-event list — only aggregate med-reconciliation mismatch counts (see Chart Audit).'),
    },
  };
}

function buildPipTriggersFromRollup(rollup: QapiRollup): QapiPipTriggerCandidate[] {
  const triggers: QapiPipTriggerCandidate[] = [];
  for (const theme of rollup.highRisk.systemicThemes) {
    triggers.push({
      trigger: `Systemic high-risk theme: ${theme}`,
      issueSummary: `${theme} appeared across 5+ patients this period — pattern-level QAPI review indicated.`,
      severity: 'high',
      ownerRoleSuggested: 'QAPI Coordinator',
      correctiveActionRequired: true,
      remeasurementMetric: `Recurrence count of "${theme}" next quarter`,
      qapiReviewRequired: true,
      sourceQuotes: [],
    });
  }
  for (const exception of rollup.exceptions.filter((e) => e.severity === 'blocker' || e.severity === 'high')) {
    triggers.push({
      trigger: `Data-quality/compliance exception: ${exception.path}`,
      issueSummary: exception.reason,
      severity: exception.severity,
      ownerRoleSuggested: 'Clinical Manager',
      correctiveActionRequired: true,
      remeasurementMetric: exception.remediation,
      qapiReviewRequired: true,
      sourceQuotes: exception.sourceArtifactId ? [exception.sourceArtifactId] : [],
    });
  }
  return triggers;
}

/* ─── Path 2: messy / unstructured records (the real-world upload case) ─── */

/** Case-insensitive alias lookup across a record's flat field map. */
function pickField(fields: Record<string, unknown>, aliases: string[]): unknown {
  const lower = new Map(Object.entries(fields).map(([k, v]) => [k.toLowerCase(), v]));
  for (const alias of aliases) {
    const hit = lower.get(alias.toLowerCase());
    if (hit !== undefined) return hit;
  }
  return undefined;
}

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : v != null ? [v] : []);
const quote = (r: ParsedRecordCell, max = 160): string => (r.text || JSON.stringify(r.fields)).slice(0, max);
const asFiniteNumber = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export function deriveQapiBundleFromRecords(parsed: ParsedFile): QapiDerivedBundle {
  const records = parsed.records;

  const clinicianRecords = records.filter((r) => pickField(r.fields, ['clinicianId', 'clinician_id']) !== undefined);
  const flagCounts = new Map<string, { count: number; quotes: string[] }>();
  for (const r of clinicianRecords) {
    const flags = asArray(pickField(r.fields, ['performanceFlags', 'performance_flags', 'high_risk_flags']));
    for (const f of flags) {
      const key = String(f);
      const cur = flagCounts.get(key) || { count: 0, quotes: [] };
      cur.count++;
      if (cur.quotes.length < 3) cur.quotes.push(quote(r));
      flagCounts.set(key, cur);
    }
  }
  const topFlags = [...flagCounts.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
  const topFlagQuotes = topFlags.flatMap(([, v]) => v.quotes).slice(0, 6);

  const pipRecords = records.filter((r) => pickField(r.fields, ['pipId', 'pip_id']) !== undefined || /^(\$|file:[^:]+):?\.?pips?\[/.test(r.pointer));
  const failedOrOpenPips = pipRecords.filter((r) => {
    const status = String(pickField(r.fields, ['status']) ?? '').toLowerCase();
    return status.includes('fail') || status.includes('open') || status.includes('active');
  });

  const disciplinaryRecords = records.filter((r) => pickField(r.fields, ['disciplinaryActions', 'disciplinary_actions']) !== undefined
    || /disciplinary/i.test(r.pointer));

  const findByKeyword = (keyword: RegExp): ParsedRecordCell[] =>
    records.filter((r) => keyword.test(r.pointer) || keyword.test(JSON.stringify(r.fields)) || (r.text ? keyword.test(r.text) : false));

  const fallRecords = findByKeyword(/\bfall(s|_risk)?\b/i);
  const infectionRecords = findByKeyword(/infection/i);
  const hospitalizationRecords = findByKeyword(/hospitali[sz]ation|hospitali[sz]ed/i);
  const medicationRecords = findByKeyword(/medication[_ ]error|medication[_ ]event/i);
  const abuseNeglectRecords = findByKeyword(/\babuse\b|\bneglect\b/i);

  const metricFromCount = (list: ParsedRecordCell[], label: string): QapiDerivedMetric =>
    list.length
      ? lowConfidence(list.length, list.slice(0, 3).map((r) => quote(r)), `Counted ${list.length} record(s) matching "${label}" by keyword/alias match — not a validated field, confirm manually.`)
      : NO_EVIDENCE(`No records matched "${label}" in this upload.`);
  const metricFromField = (aliases: string[], label: string): QapiDerivedMetric | null => {
    for (const r of records) {
      const n = asFiniteNumber(pickField(r.fields, aliases));
      if (n != null) return lowConfidence(n, [quote(r)], `Read "${label}" from an aggregate source field — confirm against the uploaded source.`);
    }
    return null;
  };
  const metricFromFieldOrCount = (aliases: string[], list: ParsedRecordCell[], label: string): QapiDerivedMetric =>
    metricFromField(aliases, label) ?? metricFromCount(list, label);
  const textFromField = (aliases: string[], label: string): QapiDerivedMetric | null => {
    for (const r of records) {
      const v = pickField(r.fields, aliases);
      if (v == null || v === '') continue;
      const value = Array.isArray(v) ? v.map(String).join(', ') : String(v);
      return lowConfidence(value, [quote(r)], `Read "${label}" from an aggregate source field — confirm against the uploaded source.`);
    }
    return null;
  };

  const pipTriggers: QapiPipTriggerCandidate[] = failedOrOpenPips.map((r) => ({
    trigger: `PIP flagged ${String(pickField(r.fields, ['status']) ?? 'open/failed')}`,
    issueSummary: String(pickField(r.fields, ['issue', 'title', 'name', 'summary']) ?? quote(r)),
    severity: 'high',
    ownerRoleSuggested: 'QAPI Coordinator',
    correctiveActionRequired: true,
    remeasurementMetric: String(pickField(r.fields, ['actual_outcome', 'remeasurementMetric', 'remeasurement_metric']) ?? 'Re-measure at next quarterly review'),
    qapiReviewRequired: true,
    sourceQuotes: [quote(r)],
  }));

  return {
    sourceMode: 'heuristic_records',
    overallNote: `Upload did not match the known ClinicalDump schema (${parsed.note || 'unstructured/mixed content'}). Derived ${records.length} record(s) via alias/keyword matching — every metric below is low-confidence and requires reviewer confirmation.`,
    meetingDetails: {
      attendeeRoster: textFromField(['attendees', 'attendeesPresent', 'attendees_present', 'attendeeRoster', 'attendee_roster', 'roster'], 'attendee roster') ?? NO_EVIDENCE(),
      quorumStatus: textFromField(['quorumStatus', 'quorum_status', 'quorum'], 'quorum status') ?? NO_EVIDENCE(),
    },
    censusPopulation: {
      activeCensus: metricFromField(['activeCensus', 'active_census', 'active census', 'active_count'], 'active census') ?? NO_EVIDENCE('No patient census records recognized in this upload.'),
      dischargedCount: metricFromField(['dischargedCount', 'discharged_count', 'discharge_count', 'discharges', 'discharged'], 'discharged count') ?? NO_EVIDENCE('No patient census records recognized in this upload.'),
      recertificationCount: metricFromField(['recertificationCount', 'recertification_count', 'recert_count', 'recertifications', 'recerts'], 'recertification count') ?? NO_EVIDENCE('No patient census records recognized in this upload.'),
      qapiRequiredCount: metricFromField(['qapiRequiredCount', 'qapi_required_count', 'qapi_required', 'qapi_cases'], 'QAPI-required count') ?? (topFlags.length ? lowConfidence(clinicianRecords.filter((r) => asArray(pickField(r.fields, ['performanceFlags', 'high_risk_flags'])).length > 0).length, topFlagQuotes) : NO_EVIDENCE()),
      highAcuityCount: metricFromField(['highAcuityCount', 'high_acuity_count', 'high_acuity', 'high_acuity_cases'], 'high-acuity count') ?? NO_EVIDENCE('No patient acuity field recognized in this upload.'),
    },
    highRiskRollup: {
      topFlags: topFlags.length ? lowConfidence(topFlags.map(([flag, v]) => `${flag} (${v.count})`), topFlagQuotes) : NO_EVIDENCE('No performanceFlags/high_risk_flags arrays found.'),
      immediateActionCases: metricFromFieldOrCount(['immediateActionCases', 'immediate_action_cases'], abuseNeglectRecords, 'abuse/neglect'),
      clinicianPipOrLicenseFlagCount: metricFromField(['clinicianPipOrLicenseFlagCount', 'clinician_pip_or_license_flag_count', 'clinician_pip_or_license_flags'], 'clinician PIP/license flags') ?? (clinicianRecords.length ? lowConfidence(pipRecords.length, pipRecords.slice(0, 3).map((r) => quote(r))) : NO_EVIDENCE()),
      clinicianDisciplinaryActionCount: metricFromField(['clinicianDisciplinaryActionCount', 'clinician_disciplinary_action_count', 'disciplinary_count', 'disciplinary_actions'], 'clinician disciplinary actions') ?? (disciplinaryRecords.length
        ? lowConfidence(disciplinaryRecords.length, disciplinaryRecords.slice(0, 3).map((r) => quote(r)))
        : NO_EVIDENCE('No disciplinaryActions field or "disciplinary" keyword matched in this upload.')),
      overloadedClinicianAssignmentCount: metricFromField(['overloadedClinicianAssignmentCount', 'overloaded_clinician_assignment_count', 'overloaded_clinician_count'], 'overloaded clinician assignments') ?? (clinicianRecords.length
        ? lowConfidence(
            clinicianRecords.filter((r) => {
              const caseload = Number(pickField(r.fields, ['caseloadCount', 'caseload_count']));
              const max = Number(pickField(r.fields, ['maxRecommendedCaseload', 'max_recommended_caseload']));
              return Number.isFinite(caseload) && Number.isFinite(max) && caseload > max;
            }).length,
            clinicianRecords.slice(0, 3).map((r) => quote(r)),
          )
        : NO_EVIDENCE()),
    },
    adverseEvents: {
      hospitalizationsTotal: metricFromFieldOrCount(['hospitalizationsTotal', 'hospitalizations_total', 'hospitalizations', 'hospitalization_count'], hospitalizationRecords, 'hospitalization'),
      fallsTotal: metricFromFieldOrCount(['fallsTotal', 'falls_total', 'falls', 'fall_count'], fallRecords, 'fall'),
      infectionsTotal: metricFromFieldOrCount(['infectionsTotal', 'infections_total', 'infections', 'infection_count'], infectionRecords, 'infection'),
      unreportedInfections: metricFromField(['unreportedInfections', 'unreported_infections', 'infection_unreported_count'], 'unreported infections') ?? (infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['reported', 'reported_to_state']) === false).length, infectionRecords.slice(0, 3).map((r) => quote(r)))
        : NO_EVIDENCE()),
      criticalLabEventsUnreported: metricFromField(['criticalLabEventsUnreported', 'critical_lab_events_unreported', 'critical_labs_unreported'], 'critical lab events unreported') ?? NO_EVIDENCE('No lab records recognized in this upload.'),
    },
    pipCorrectiveAction: pipTriggers,
    chartAuditDocumentationIntegrity: {
      oasisLateSoc: metricFromField(['oasisLateSoc', 'oasis_late_soc', 'late_soc'], 'late OASIS SOC') ?? NO_EVIDENCE('No OASIS timeliness field recognized in this upload.'),
      pocMissingF2F: metricFromField(['pocMissingF2F', 'poc_missing_f2f', 'late_or_missing_f2f'], 'POC missing F2F') ?? NO_EVIDENCE('No plan-of-care fields recognized in this upload.'),
      pocUnsignedOrMissingSignature: metricFromField(['pocUnsignedOrMissingSignature', 'poc_unsigned_or_missing_signature', 'unsigned_orders'], 'POC unsigned/missing signature') ?? NO_EVIDENCE('No plan-of-care fields recognized in this upload.'),
      medReconciliationMismatch: metricFromFieldOrCount(['medReconciliationMismatch', 'med_reconciliation_mismatch', 'med_recon_discrepancies'], medicationRecords, 'medication reconciliation'),
    },
    infectionControl: {
      healthcareAssociated: metricFromField(['healthcareAssociated', 'healthcare_associated', 'healthcare_associated_infections', 'confirmed_hais', 'hais'], 'healthcare-associated infections') ?? (infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['healthcare_associated']) === true).length, infectionRecords.slice(0, 2).map((r) => quote(r)))
        : NO_EVIDENCE()),
      communityAcquired: metricFromField(['communityAcquired', 'community_acquired', 'community_acquired_infections'], 'community-acquired infections') ?? (infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['community_acquired']) === true).length, infectionRecords.slice(0, 2).map((r) => quote(r)))
        : NO_EVIDENCE()),
      unreportedToState: metricFromField(['unreportedToState', 'unreported_to_state', 'infection_unreported_to_state'], 'infection reporting status') ?? NO_EVIDENCE('No infection reporting-status field recognized in this upload.'),
    },
    medicationSafety: {
      medicationEventLineList: metricFromCount(medicationRecords, 'medication event'),
    },
  };
}

/* ─── Path 3: narrative / raw-text aggregate extraction ──────────────────
   Plain-text uploads (TXT, prose exports, copy-pasted reports) parse to a
   SINGLE full-text record, so Path 2's record-counting can only ever answer
   "0 or 1" for every metric. This path scans the narrative text itself for
   labeled aggregates ("Missed visits: 106", "7 patients hospitalized",
   "Quorum: 8/8") and record-ID families (AE-001…, INF-001…, PIP-T-001…),
   producing the same low-confidence + verbatim-quote metrics. It never
   overrides structured-record derivation — only applies to text-only
   parses, and fills gaps rather than inventing data. */

const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr));

interface TextHit {
  value: number;
  quote: string;
}

function contextQuote(text: string, index: number, matchLen: number, radius = 70): string {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + matchLen + radius);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

function firstNumber(text: string, re: RegExp): TextHit | null {
  const m = re.exec(text);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  return { value, quote: contextQuote(text, m.index, m[0].length) };
}

/** Count unique record IDs of one family (e.g. AE-001, MOCK-AE-001 → AE-001).
    Table exports often arrive with cells run together ("initiatedMOCK-AE-002"),
    so IDs may be glued to lowercase words — only an UPPERCASE letter or digit
    immediately before/after disqualifies a candidate (partial-token guard). */
/** Record-ID family regex tolerant of an optional quarter infix, so both
    schemes match: "AE-001" (Q2 file) and "AE-Q1-001" (Q1/Q3/Q4 files). The
    captured id includes the infix so counts stay per-quarter-unique. */
function familyIdRegex(family: string): RegExp {
  return new RegExp(`(?<![A-Z0-9])(${family})(-Q[1-4])?-(\\d{2,5})(?!\\d)`, 'g');
}

function idFamilyCount(text: string, family: string): TextHit | null {
  const ids = new Set<string>();
  let firstIndex = -1;
  let firstLen = 0;
  for (const m of text.matchAll(familyIdRegex(family))) {
    ids.add(`${m[1]}${m[2] ?? ''}-${m[3]}`);
    if (firstIndex < 0) { firstIndex = m.index ?? 0; firstLen = m[0].length; }
  }
  if (ids.size === 0) return null;
  return { value: ids.size, quote: contextQuote(text, firstIndex, firstLen) };
}

export interface QapiTextAggregates {
  /** True when the source reads like an AI generation prompt, not data. */
  promptArtifact: boolean;
  promptQuote?: string;
  /** Reporting quarter declared in the source (e.g. "2026-Q2"), if stated. */
  reviewQuarter: string | null;
  activeCensus: TextHit | null;
  episodesTotal: TextHit | null;
  dischargedCount: TextHit | null;
  recertificationCount: TextHit | null;
  hospitalizations: TextHit | null;
  missedVisits: TextHit | null;
  complaintsCount: TextHit | null;
  infectionLineListCount: TextHit | null;
  confirmedHais: TextHit | null;
  adverseEventsCount: TextHit | null;
  pipTriggerCount: TextHit | null;
  /** Named PIP recommendations found in the text (e.g. "PIP — OASIS Accuracy Improvement"). */
  pipNames: Array<{ name: string; quote: string }>;
  capCount: TextHit | null;
  disciplinaryCount: TextHit | null;
  quorum: { present: number; total: number; met: boolean; quote: string } | null;
  attendeePresentCount: TextHit | null;
  signoffRoles: string[];
  oasisLateSoc: TextHit | null;
  lateOrMissingF2f: TextHit | null;
  medReconDiscrepancies: TextHit | null;
  /** How many aggregate metrics were found (drives the overall note). */
  foundCount: number;
}

const PROMPT_ARTIFACT_RE = /\b(?:hi|hello|hey)[,\s]+(?:claude|chatgpt|gpt|gemini|copilot)\b|please generate\b[\s\S]{0,120}?\b(?:synthetic|mock|dataset|test)/i;

export function extractQapiTextAggregates(text: string): QapiTextAggregates {
  const promptMatch = PROMPT_ARTIFACT_RE.exec(text);

  // Named PIP recommendations ("PIP — OASIS Accuracy Improvement"), tolerant
  // of run-together table cells on either side of the name.
  const pipNames: Array<{ name: string; quote: string }> = [];
  const seenPipNames = new Set<string>();
  for (const m of text.matchAll(/(?<![A-Z])PIP\s+—\s+([A-Z][A-Za-z0-9 /&-]{2,60}?)(?=PIP|Existing|[\n·|]|$)/g)) {
    const name = m[1].trim().replace(/\s+/g, ' ');
    const key = name.toLowerCase();
    if (name.length < 3 || seenPipNames.has(key)) continue;
    seenPipNames.add(key);
    pipNames.push({ name, quote: contextQuote(text, m.index ?? 0, m[0].length) });
  }

  // "Administrator Sign-off:" lines (singular + colon → actual sign-off
  // records; skips headers like "Required Sign-offs:").
  const signoffRoles: string[] = [];
  for (const m of text.matchAll(/\b([A-Z][A-Za-z /&]{2,40}?)\s+Sign-off:/g)) {
    const role = m[1].trim();
    if (!/^required$/i.test(role) && !signoffRoles.includes(role)) signoffRoles.push(role);
  }

  const quorumMatch = /Quorum:\s*(\d+)\s*\/\s*(\d+)/i.exec(text);
  const quorum = quorumMatch
    ? {
        present: Number(quorumMatch[1]),
        total: Number(quorumMatch[2]),
        met: /quorum met/i.test(text),
        quote: contextQuote(text, quorumMatch.index, quorumMatch[0].length),
      }
    : null;

  const presentMarks = [...text.matchAll(/✅\s*Present/g)];
  const attendeePresentCount: TextHit | null = presentMarks.length
    ? { value: presentMarks.length, quote: contextQuote(text, presentMarks[0].index ?? 0, presentMarks[0][0].length) }
    : null;

  const quarterMatch = /\bQ([1-4])[\s-]*(20\d{2})\b/.exec(text) ?? /\b(20\d{2})[\s-]*Q([1-4])\b/.exec(text);
  const reviewQuarter = quarterMatch
    ? (/^Q/.test(quarterMatch[0]) ? `${quarterMatch[2]}-Q${quarterMatch[1]}` : `${quarterMatch[1]}-Q${quarterMatch[2]}`)
    : null;

  const agg: QapiTextAggregates = {
    promptArtifact: Boolean(promptMatch),
    promptQuote: promptMatch ? contextQuote(text, promptMatch.index, promptMatch[0].length) : undefined,
    reviewQuarter,
    // Each metric tries the Q2-file phrasing first, then Q1/Q3/Q4 glued-table
    // phrasings ("Active at Mar 31 (Q1 close)120 patients", "Hospitalizations
    // Q15 (MOCK-…", "episodes tracked Q1127 episodes"), then ID-family counts.
    activeCensus: firstNumber(text, /(\d+)\s+active at (?:the )?start/i) ?? firstNumber(text, /close\)\s*(\d+)\s*patients/i) ?? firstNumber(text, /active at [A-Za-z]{3} \d{1,2}[^\d]{0,20}(\d+)\s*patients/i),
    episodesTotal: firstNumber(text, /=\s*(\d+)\s+episodes/i) ?? firstNumber(text, /episodes tracked[^\d]{0,12}(\d+)\s*episodes/i) ?? firstNumber(text, /total[^.\n]{0,40}episodes:?\s*(\d+)/i),
    dischargedCount: firstNumber(text, /discharge\w*\s*\((\d+)\)/i) ?? firstNumber(text, /discharged\s+Q[1-4]?(\d+)\s*patients/i),
    recertificationCount: firstNumber(text, /recert\w*\s*\((\d+)\)/i),
    hospitalizations: firstNumber(text, /(\d+)\s+patients?\s+hospitali[sz]ed/i) ?? firstNumber(text, /hospitali[sz]ation events?:?\s*(\d+)/i) ?? firstNumber(text, /hospitali[sz]ations?\s*Q[1-4]?(\d+)\s*\(/i),
    missedVisits: firstNumber(text, /missed visits?:?\s*(\d+)/i),
    complaintsCount: firstNumber(text, /(\d+)\s+complaints?\s+q\d/i) ?? idFamilyCount(text, 'CMP'),
    infectionLineListCount: idFamilyCount(text, 'INF'),
    confirmedHais: firstNumber(text, /(\d+)\s+confirmed HAIs?/i),
    adverseEventsCount: idFamilyCount(text, 'AE'),
    pipTriggerCount: firstNumber(text, /(\d+)\s+PIP triggers?/i) ?? idFamilyCount(text, 'PIP-T') ?? firstNumber(text, /PIP TRIGGERS?\s*\((\d+)\s*Required\)/i),
    pipNames,
    capCount: idFamilyCount(text, 'CAP'),
    disciplinaryCount: firstNumber(text, /(\d+)\s+disciplinary review triggers?/i) ?? idFamilyCount(text, 'DT') ?? idFamilyCount(text, 'DISC-TRIG') ?? firstNumber(text, /DISCIPLINARY ACTION TRIGGERS?\s*\((\d+)\s*Required\)/i),
    quorum,
    attendeePresentCount,
    signoffRoles,
    oasisLateSoc: firstNumber(text, /late soc:?\s*(\d+)/i),
    lateOrMissingF2f: firstNumber(text, /(\d+)\s+late\/missing f2f/i),
    medReconDiscrepancies: firstNumber(text, /(\d+)\s+discrepanc\w+ at soc\/roc/i),
    foundCount: 0,
  };

  agg.foundCount = [
    agg.activeCensus, agg.episodesTotal, agg.dischargedCount, agg.recertificationCount,
    agg.hospitalizations, agg.missedVisits, agg.complaintsCount, agg.infectionLineListCount,
    agg.confirmedHais, agg.adverseEventsCount, agg.pipTriggerCount, agg.capCount,
    agg.disciplinaryCount, agg.quorum, agg.attendeePresentCount,
    agg.oasisLateSoc, agg.lateOrMissingF2f, agg.medReconDiscrepancies,
  ].filter(Boolean).length + (agg.pipNames.length ? 1 : 0) + (agg.signoffRoles.length ? 1 : 0);

  return agg;
}

/* ─── Per-record line-item segments (feed form filling) ──────────────────
   Beyond aggregate counts, forms need actual rows. Each record-ID family
   (AE-001…, INF-001…, CMP-001…, CAP-001…, DT-001…) is segmented: the text
   run from one ID to the next same-family ID, scored so the DEFINITION row
   (the one carrying dates/severity/status) wins over passing references. */

export interface RecordSegment {
  id: string;
  /** Verbatim source run for this record (capped). */
  text: string;
  /** First ISO date in the segment (e.g. event/onset date). */
  date: string | null;
  /** All ISO dates found (deduped, ≤4) — CAP rows carry due dates etc. */
  dates: string[];
  severity: string | null;
  status: string | null;
  category: string | null;
}

const SEGMENT_CATEGORY: Record<string, RegExp> = {
  AE: /(Unplanned Hospitalization|Medication Error|Near-Miss[^A-Z]{0,24}|Adverse Drug Reaction|Fall)/,
  INF: /(Wound \/ Surgical Site|Wound — Repeat|Surgical Site|Wound|UTI|Respiratory \(ILI\)|Respiratory|ILI)/,
  CMP: /(Communication|Scheduling|Care Quality|Billing|Rights)/,
};
const SEGMENT_SEVERITY = /(Level\s*[1-4]|\bCritical\b|\bHigh\b|\bModerate\b|\bLow\b)/;
const SEGMENT_STATUS = /(RCA Complete[^A-Z]{0,28}|RCA initiated|Investigation complete[^A-Z]{0,22}|Resolved[^A-Z]{0,30}|Closed[^A-Z]{0,18}|Open(?: — under review)?|Pending HR review|Pending|Complete[d]?)/;

export function extractRecordSegments(text: string, family: 'AE' | 'INF' | 'CMP' | 'CAP' | 'DT'): RecordSegment[] {
  const matches: Array<{ id: string; index: number }> = [];
  for (const m of text.matchAll(familyIdRegex(family))) matches.push({ id: `${m[1]}${m[2] ?? ''}-${m[3]}`, index: m.index ?? 0 });
  if (!matches.length) return [];

  interface Scored { seg: RecordSegment; score: number; index: number }
  const best = new Map<string, Scored>();
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = Math.min(i + 1 < matches.length ? matches[i + 1].index : text.length, start + 420);
    const run = text.slice(start, end).replace(/\s+/g, ' ').trim();
    // No \b anchors: dump cells glue the date to adjacent digits/letters
    // ("Level 32026-04-08", "Site2026-04-14"); the "20" year prefix anchors it.
    const dates = uniq([...run.matchAll(/20\d{2}-\d{2}-\d{2}/g)].map((m) => m[0])).slice(0, 4);
    const severity = SEGMENT_SEVERITY.exec(run)?.[1] ?? null;
    const status = SEGMENT_STATUS.exec(run)?.[1]?.trim() ?? null;
    const category = SEGMENT_CATEGORY[family]?.exec(run)?.[1] ?? null;
    const score = dates.length * 2 + (status ? 1 : 0) + (severity ? 1 : 0) + (category ? 1 : 0);
    const seg: RecordSegment = { id: matches[i].id, text: run, date: dates[0] ?? null, dates, severity, status, category };
    const cur = best.get(seg.id);
    // Highest-signal occurrence wins (definition row beats a passing mention);
    // earliest occurrence wins ties for determinism.
    if (!cur || score > cur.score) best.set(seg.id, { seg, score, index: start });
  }
  return [...best.values()].sort((a, b) => a.seg.id.localeCompare(b.seg.id, undefined, { numeric: true })).map((s) => s.seg);
}

/** One monthly quality-indicator dashboard row (QM-APR-001 style). */
export interface DashboardRow {
  metricId: string;
  indicator: string;
  month: string | null;
  /** Numeric rate only when unambiguous (glued numerator/denominator digits make many rows ambiguous — those report rawValue instead). */
  rate: number | null;
  rawValue: string | null;
  threshold: string | null;
  status: string | null;
}

const MONTH_RE = /(January|February|March|April|May|June|July|August|September|October|November|December)\s*20\d{2}/;

export function extractDashboardRows(text: string): DashboardRow[] {
  // Table cells run together in dumps ("QM-APR-001Acute Care…"), so a trailing
  // \b never fires — guard with lookarounds instead.
  const idRe = /(?<![A-Z0-9])QM-([A-Z]{3})-(\d{3})(?!\d)/g;
  const matches: Array<{ id: string; index: number; len: number }> = [];
  for (const m of text.matchAll(idRe)) matches.push({ id: m[0], index: m.index ?? 0, len: m[0].length });
  const rows: DashboardRow[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = Math.min(i + 1 < matches.length ? matches[i + 1].index : text.length, start + 300);
    const run = text.slice(start + matches[i].len, end);
    const monthMatch = MONTH_RE.exec(run);
    const indicator = (monthMatch ? run.slice(0, monthMatch.index) : run.slice(0, 60)).replace(/\s+/g, ' ').trim();
    const threshold = /([≤≥]\s*\d+(?:\.\d+)?%)/.exec(run)?.[1] ?? null;
    const statusMatch = /(✅[^✅⚠🔴]{0,40}|⚠️?[^✅⚠🔴]{0,40}|🔴[^✅⚠🔴]{0,60})/u.exec(run);
    const status = statusMatch ? statusMatch[1].replace(/\s+/g, ' ').trim() : null;
    const valueMatch = /(\d+(?:\.\d+)?)%\s*[≤≥]/.exec(run) ?? /(?:–|—|-){2,}\s*(\d+(?:\.\d+)?)%/.exec(run);
    let rate: number | null = null;
    let rawValue: string | null = valueMatch ? `${valueMatch[1]}%` : null;
    if (valueMatch) {
      const v = Number(valueMatch[1]);
      // Only trust it as a rate when it cannot be glued numerator/denominator
      // digits: ≤100 and at most 2 integer digits.
      if (Number.isFinite(v) && v <= 100 && /^\d{1,2}(\.\d+)?$/.test(valueMatch[1])) { rate = v; rawValue = null; }
    }
    if (indicator) rows.push({ metricId: matches[i].id, indicator, month: monthMatch ? monthMatch[0] : null, rate, rawValue, threshold, status });
  }
  return rows;
}

/** Governing-Body escalation items (GBE-001: …). */
export function extractEscalationItems(text: string): Array<{ id: string; text: string }> {
  const out: Array<{ id: string; text: string }> = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(/\bGBE-(\d{2,4}):?\s*([^\n]{5,220})/g)) {
    const id = `GBE-${m[1]}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, text: m[2].replace(/\s+/g, ' ').trim() });
  }
  return out;
}

/** Named sign-off records ("Administrator Sign-off: … — Name — YYYY-MM-DD"). */
export function extractSignoffRecords(text: string): Array<{ role: string; name: string; date: string }> {
  const out: Array<{ role: string; name: string; date: string }> = [];
  for (const m of text.matchAll(/\b([A-Z][A-Za-z /&]{2,40}?)\s+Sign-off:\s*(?:[A-Z0-9-]+\s*—\s*)?([A-Za-z .'’-]+?)\s*—\s*(20\d{2}-\d{2}-\d{2})/g)) {
    const role = m[1].trim();
    if (/^required$/i.test(role)) continue;
    out.push({ role, name: m[2].trim(), date: m[3] });
  }
  return out;
}

/** Prior-period action follow-up lines ("Q1 Action #1 …"). */
export function extractPriorActionFollowUps(text: string): string[] {
  return uniq([...text.matchAll(/\bQ\d Action #\d[^\n]{0,220}/g)].map((m) => m[0].replace(/\s+/g, ' ').trim()));
}

const TEXT_AGG_NOTE = 'Parsed from a narrative-text aggregate — confirm against the source before use.';

const textMetric = (hit: TextHit | null, fallback: QapiDerivedMetric): QapiDerivedMetric =>
  hit ? lowConfidence(hit.value, [hit.quote], TEXT_AGG_NOTE) : fallback;

/** True when the parse produced no structured fields — only raw text records. */
function isTextOnlyParse(parsed: ParsedFile): boolean {
  return parsed.records.every((r) => Object.keys(r.fields).filter((k) => k !== 'text').length === 0);
}

/**
 * Enrich a Path-2 bundle with narrative-text aggregates. Only applied to
 * text-only parses (no structured records to trust instead), and labeled
 * aggregates take precedence over Path 2's single-text-record keyword counts.
 */
function applyTextAggregates(bundle: QapiDerivedBundle, parsed: ParsedFile): QapiDerivedBundle {
  if (!isTextOnlyParse(parsed)) return bundle;
  const fullText = parsed.records.map((r) => r.text ?? '').join('\n');
  if (fullText.trim().length < 200) return bundle;

  const agg = extractQapiTextAggregates(fullText);
  const notes: string[] = [bundle.overallNote];
  if (agg.promptArtifact) {
    notes.unshift(`⚠ This source reads like an AI generation prompt/instruction file, not operating data (found: “${agg.promptQuote ?? ''}”). Double-check that the intended dataset file is selected as the source.`);
  }
  if (agg.foundCount > 0) {
    notes.push(`Recovered ${agg.foundCount} aggregate metric group(s) directly from the narrative text (labeled totals and record-ID families) — all low-confidence, each carries its verbatim source quote.`);
  }

  const pipCandidates: QapiPipTriggerCandidate[] = bundle.pipCorrectiveAction.length
    ? bundle.pipCorrectiveAction
    : agg.pipNames.map((p) => ({
        trigger: `PIP — ${p.name}`,
        issueSummary: p.quote,
        severity: 'high',
        ownerRoleSuggested: 'QAPI Coordinator',
        correctiveActionRequired: true,
        remeasurementMetric: `Remeasure "${p.name}" at next quarterly review`,
        qapiReviewRequired: true,
        sourceQuotes: [p.quote],
      }));

  return {
    ...bundle,
    overallNote: notes.join(' '),
    meetingDetails: {
      attendeeRoster: agg.attendeePresentCount
        ? lowConfidence(`${agg.attendeePresentCount.value} attendees recorded present`, [agg.attendeePresentCount.quote], TEXT_AGG_NOTE)
        : bundle.meetingDetails.attendeeRoster,
      quorumStatus: agg.quorum
        ? lowConfidence(`${agg.quorum.present}/${agg.quorum.total} present — quorum ${agg.quorum.met ? 'met' : 'NOT met'}`, [agg.quorum.quote], TEXT_AGG_NOTE)
        : bundle.meetingDetails.quorumStatus,
    },
    censusPopulation: {
      ...bundle.censusPopulation,
      activeCensus: textMetric(agg.activeCensus ?? agg.episodesTotal, bundle.censusPopulation.activeCensus),
      dischargedCount: textMetric(agg.dischargedCount, bundle.censusPopulation.dischargedCount),
      recertificationCount: textMetric(agg.recertificationCount, bundle.censusPopulation.recertificationCount),
    },
    highRiskRollup: {
      ...bundle.highRiskRollup,
      clinicianDisciplinaryActionCount: textMetric(agg.disciplinaryCount, bundle.highRiskRollup.clinicianDisciplinaryActionCount),
      clinicianPipOrLicenseFlagCount: textMetric(agg.pipTriggerCount, bundle.highRiskRollup.clinicianPipOrLicenseFlagCount),
    },
    adverseEvents: {
      ...bundle.adverseEvents,
      hospitalizationsTotal: textMetric(agg.hospitalizations, bundle.adverseEvents.hospitalizationsTotal),
      infectionsTotal: textMetric(agg.infectionLineListCount ?? agg.confirmedHais, bundle.adverseEvents.infectionsTotal),
    },
    pipCorrectiveAction: pipCandidates,
    chartAuditDocumentationIntegrity: {
      ...bundle.chartAuditDocumentationIntegrity,
      oasisLateSoc: textMetric(agg.oasisLateSoc, bundle.chartAuditDocumentationIntegrity.oasisLateSoc),
      pocMissingF2F: textMetric(agg.lateOrMissingF2f, bundle.chartAuditDocumentationIntegrity.pocMissingF2F),
      medReconciliationMismatch: textMetric(agg.medReconDiscrepancies, bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch),
    },
    infectionControl: {
      ...bundle.infectionControl,
      healthcareAssociated: textMetric(agg.confirmedHais, bundle.infectionControl.healthcareAssociated),
    },
  };
}

/* ─── Dispatcher ─────────────────────────────────────────────────────── */

function looksLikeClinicalDump(value: unknown): value is ClinicalDump {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.patients) && Array.isArray(v.clinicians);
}

/**
 * Reconstruct a ClinicalDump from parsed source records, if the upload is
 * (or contains) one. Shared by deriveQapiBundle and the QAPI packet renderer
 * so both agree on when the high-fidelity extractQapiRollup()/
 * renderQapiPacketHtml() path applies vs. the heuristic fallback.
 */
export function reconstructClinicalDump(parsed: ParsedFile): ClinicalDump | null {
  if (parsed.records.length === 0) return null;

  // A single record at $ whose fields already match ClinicalDump.
  const wholeDocRecord = parsed.records.find((r) => r.pointer === '$');
  if (looksLikeClinicalDump(wholeDocRecord?.fields)) return wholeDocRecord!.fields as unknown as ClinicalDump;

  // Reconstruct from $.patients[]/$.clinicians[]/... pointer-grouped records.
  const byRoot = new Map<string, Record<string, unknown>[]>();
  for (const r of parsed.records) {
    const m = /^\$\.(\w+)\[/.exec(r.pointer);
    if (m) (byRoot.get(m[1]) || byRoot.set(m[1], []).get(m[1])!).push(r.fields);
  }
  if (!byRoot.has('patients') || !byRoot.has('clinicians')) return null;
  return {
    patients: byRoot.get('patients') as unknown as ClinicalDump['patients'],
    clinicians: byRoot.get('clinicians') as unknown as ClinicalDump['clinicians'],
    incidents: byRoot.get('incidents') as unknown as ClinicalDump['incidents'],
    infections: byRoot.get('infections') as unknown as ClinicalDump['infections'],
    labs: byRoot.get('labs') as unknown as ClinicalDump['labs'],
  };
}

/**
 * Main entry point: given the parsed source (from parseSourceFile, already
 * resilient to malformed JSON via its text-fallback/loose-recovery path) and
 * the event date, pick the right derivation path. Never throws — an upload
 * that matches neither shape still returns a fully-populated "no evidence,
 * verify manually" bundle rather than failing packet generation outright.
 */
export function deriveQapiBundle(parsed: ParsedFile, eventDateISO: string, targetQuarter?: string): QapiDerivedBundle {
  if (parsed.records.length === 0) {
    const empty = deriveQapiBundleFromRecords(parsed);
    return { ...empty, sourceMode: 'none', overallNote: 'No parseable content in the uploaded source.' };
  }
  const dump = reconstructClinicalDump(parsed);
  if (dump) return deriveQapiBundleFromClinicalDump(dump, eventDateISO);

  // Multi-quarter dumps: narrow to exactly one quarter BEFORE any extraction,
  // so aggregates/records never cross quarter boundaries. Fail closed when the
  // target quarter can't be resolved rather than mixing data.
  const resolved = resolveQapiSource(parsed, eventDateISO, targetQuarter);
  if (resolved.conflict) {
    const empty = deriveQapiBundleFromRecords({ ...parsed, records: [] });
    return {
      ...empty,
      sourceMode: 'none',
      overallNote: `SOURCE CONFLICT — packet not generated. ${resolved.reason}`,
    };
  }
  // Narrative/plain-text uploads: enrich the record-level heuristics with
  // labeled aggregates scanned from the (quarter-narrowed) text itself (Path 3).
  return applyTextAggregates(deriveQapiBundleFromRecords(resolved.parsed), resolved.parsed);
}
