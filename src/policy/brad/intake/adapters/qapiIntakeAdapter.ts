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

  const pipRecords = records.filter((r) => pickField(r.fields, ['pipId', 'pip_id']) !== undefined);
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

  const pipTriggers: QapiPipTriggerCandidate[] = failedOrOpenPips.map((r) => ({
    trigger: `PIP flagged ${String(pickField(r.fields, ['status']) ?? 'open/failed')}`,
    issueSummary: String(pickField(r.fields, ['issue']) ?? quote(r)),
    severity: 'high',
    ownerRoleSuggested: 'QAPI Coordinator',
    correctiveActionRequired: true,
    remeasurementMetric: String(pickField(r.fields, ['actual_outcome']) ?? 'Re-measure at next quarterly review'),
    qapiReviewRequired: true,
    sourceQuotes: [quote(r)],
  }));

  return {
    sourceMode: 'heuristic_records',
    overallNote: `Upload did not match the known ClinicalDump schema (${parsed.note || 'unstructured/mixed content'}). Derived ${records.length} record(s) via alias/keyword matching — every metric below is low-confidence and requires reviewer confirmation.`,
    meetingDetails: {
      attendeeRoster: NO_EVIDENCE(),
      quorumStatus: NO_EVIDENCE(),
    },
    censusPopulation: {
      activeCensus: NO_EVIDENCE('No patient census records recognized in this upload.'),
      dischargedCount: NO_EVIDENCE('No patient census records recognized in this upload.'),
      recertificationCount: NO_EVIDENCE('No patient census records recognized in this upload.'),
      qapiRequiredCount: topFlags.length ? lowConfidence(clinicianRecords.filter((r) => asArray(pickField(r.fields, ['performanceFlags', 'high_risk_flags'])).length > 0).length, topFlagQuotes) : NO_EVIDENCE(),
      highAcuityCount: NO_EVIDENCE('No patient acuity field recognized in this upload.'),
    },
    highRiskRollup: {
      topFlags: topFlags.length ? lowConfidence(topFlags.map(([flag, v]) => `${flag} (${v.count})`), topFlagQuotes) : NO_EVIDENCE('No performanceFlags/high_risk_flags arrays found.'),
      immediateActionCases: metricFromCount(abuseNeglectRecords, 'abuse/neglect'),
      clinicianPipOrLicenseFlagCount: clinicianRecords.length ? lowConfidence(pipRecords.length, pipRecords.slice(0, 3).map((r) => quote(r))) : NO_EVIDENCE(),
      clinicianDisciplinaryActionCount: disciplinaryRecords.length
        ? lowConfidence(disciplinaryRecords.length, disciplinaryRecords.slice(0, 3).map((r) => quote(r)))
        : NO_EVIDENCE('No disciplinaryActions field or "disciplinary" keyword matched in this upload.'),
      overloadedClinicianAssignmentCount: clinicianRecords.length
        ? lowConfidence(
            clinicianRecords.filter((r) => {
              const caseload = Number(pickField(r.fields, ['caseloadCount', 'caseload_count']));
              const max = Number(pickField(r.fields, ['maxRecommendedCaseload', 'max_recommended_caseload']));
              return Number.isFinite(caseload) && Number.isFinite(max) && caseload > max;
            }).length,
            clinicianRecords.slice(0, 3).map((r) => quote(r)),
          )
        : NO_EVIDENCE(),
    },
    adverseEvents: {
      hospitalizationsTotal: metricFromCount(hospitalizationRecords, 'hospitalization'),
      fallsTotal: metricFromCount(fallRecords, 'fall'),
      infectionsTotal: metricFromCount(infectionRecords, 'infection'),
      unreportedInfections: infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['reported', 'reported_to_state']) === false).length, infectionRecords.slice(0, 3).map((r) => quote(r)))
        : NO_EVIDENCE(),
      criticalLabEventsUnreported: NO_EVIDENCE('No lab records recognized in this upload.'),
    },
    pipCorrectiveAction: pipTriggers,
    chartAuditDocumentationIntegrity: {
      oasisLateSoc: NO_EVIDENCE('No OASIS timeliness field recognized in this upload.'),
      pocMissingF2F: NO_EVIDENCE('No plan-of-care fields recognized in this upload.'),
      pocUnsignedOrMissingSignature: NO_EVIDENCE('No plan-of-care fields recognized in this upload.'),
      medReconciliationMismatch: metricFromCount(medicationRecords, 'medication reconciliation'),
    },
    infectionControl: {
      healthcareAssociated: infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['healthcare_associated']) === true).length, infectionRecords.slice(0, 2).map((r) => quote(r)))
        : NO_EVIDENCE(),
      communityAcquired: infectionRecords.length
        ? lowConfidence(infectionRecords.filter((r) => pickField(r.fields, ['community_acquired']) === true).length, infectionRecords.slice(0, 2).map((r) => quote(r)))
        : NO_EVIDENCE(),
      unreportedToState: NO_EVIDENCE('No infection reporting-status field recognized in this upload.'),
    },
    medicationSafety: {
      medicationEventLineList: metricFromCount(medicationRecords, 'medication event'),
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
export function deriveQapiBundle(parsed: ParsedFile, eventDateISO: string): QapiDerivedBundle {
  if (parsed.records.length === 0) {
    const empty = deriveQapiBundleFromRecords(parsed);
    return { ...empty, sourceMode: 'none', overallNote: 'No parseable content in the uploaded source.' };
  }
  const dump = reconstructClinicalDump(parsed);
  if (dump) return deriveQapiBundleFromClinicalDump(dump, eventDateISO);
  return deriveQapiBundleFromRecords(parsed);
}
