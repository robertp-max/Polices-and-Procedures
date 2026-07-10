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

/* ─── Path 3: narrative / raw-text aggregate extraction ──────────────────
   Plain-text uploads (TXT, prose exports, copy-pasted reports) parse to a
   SINGLE full-text record, so Path 2's record-counting can only ever answer
   "0 or 1" for every metric — a raw quarterly dataset derived almost nothing
   (the "1-page empty draft" case). This path scans the narrative text itself
   for labeled aggregates ("Missed visits: 106", "7 patients hospitalized",
   "Quorum: 8/8") and record-ID families (AE-001…, INF-001…, PIP-T-001…),
   producing the same low-confidence + verbatim-quote metrics. It never
   overrides structured-record derivation — it only applies when the upload
   has no structured fields, and it fills gaps rather than inventing data. */

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
function idFamilyCount(text: string, family: string): TextHit | null {
  const re = new RegExp(`(?<![A-Z0-9])(${family})-(\\d{2,5})(?!\\d)`, 'g');
  const ids = new Set<string>();
  let firstIndex = -1;
  let firstLen = 0;
  for (const m of text.matchAll(re)) {
    ids.add(`${m[1]}-${m[2]}`);
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
    activeCensus: firstNumber(text, /(\d+)\s+active at (?:the )?start/i),
    episodesTotal: firstNumber(text, /=\s*(\d+)\s+episodes/i) ?? firstNumber(text, /total[^.\n]{0,40}episodes:?\s*(\d+)/i),
    dischargedCount: firstNumber(text, /discharge\w*\s*\((\d+)\)/i),
    recertificationCount: firstNumber(text, /recert\w*\s*\((\d+)\)/i),
    hospitalizations: firstNumber(text, /(\d+)\s+patients?\s+hospitali[sz]ed/i) ?? firstNumber(text, /hospitali[sz]ation events?:?\s*(\d+)/i),
    missedVisits: firstNumber(text, /missed visits?:?\s*(\d+)/i),
    complaintsCount: firstNumber(text, /(\d+)\s+complaints?\s+q\d/i) ?? idFamilyCount(text, 'CMP'),
    infectionLineListCount: idFamilyCount(text, 'INF'),
    confirmedHais: firstNumber(text, /(\d+)\s+confirmed HAIs?/i),
    adverseEventsCount: idFamilyCount(text, 'AE'),
    pipTriggerCount: firstNumber(text, /(\d+)\s+PIP triggers?/i) ?? idFamilyCount(text, 'PIP-T'),
    pipNames,
    capCount: idFamilyCount(text, 'CAP'),
    disciplinaryCount: firstNumber(text, /(\d+)\s+disciplinary review triggers?/i) ?? idFamilyCount(text, 'DT'),
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
  AE: /(Unplanned Hospitalization|Medication Error|Near-Miss[^A-Z]{0,24}|Adverse Drug Reaction|Fall)/i,
  INF: /(Wound \/ Surgical Site|Wound — Repeat|Surgical Site|Wound|UTI|Respiratory \(ILI\)|Respiratory|ILI)/i,
  CMP: /(Communication|Scheduling|Care Quality|Billing|Rights)/i,
};

/** ISO dates, tolerant of digits glued directly before them ("Level 32026-04-08"). */
function isoDatesIn(run: string): string[] {
  const out: string[] = [];
  for (const m of run.matchAll(/20\d{2}-(\d{2})-(\d{2})/g)) {
    const mo = Number(m[1]);
    const day = Number(m[2]);
    if (mo >= 1 && mo <= 12 && day >= 1 && day <= 31) out.push(m[0]);
  }
  return Array.from(new Set(out));
}
const uniq = <T,>(arr: T[]): T[] => Array.from(new Set(arr));

const SEGMENT_SEVERITY = /(Level\s*[1-4]|\bCritical\b|\bHigh\b|\bModerate\b|\bLow\b)/;
const SEGMENT_STATUS = /(RCA Complete[^A-Z]{0,28}|RCA initiated|Investigation complete[^A-Z]{0,22}|Resolved[^A-Z]{0,30}|Closed[^A-Z]{0,18}|Open(?: — under review)?|Pending HR review|Pending|Complete[d]?)/;

export function extractRecordSegments(text: string, family: 'AE' | 'INF' | 'CMP' | 'CAP' | 'DT'): RecordSegment[] {
  const re = new RegExp(`(?<![A-Z0-9])(${family})-(\\d{2,5})(?!\\d)`, 'g');
  const matches: Array<{ id: string; index: number }> = [];
  for (const m of text.matchAll(re)) matches.push({ id: `${m[1]}-${m[2]}`, index: m.index ?? 0 });
  if (!matches.length) return [];

  interface Scored { seg: RecordSegment; score: number; index: number }
  const best = new Map<string, Scored>();
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = Math.min(i + 1 < matches.length ? matches[i + 1].index : text.length, start + 420);
    const run = text.slice(start, end).replace(/\s+/g, ' ').trim();
    const dates = isoDatesIn(run).slice(0, 4);
    const severity = SEGMENT_SEVERITY.exec(run)?.[1] ?? null;
    const status = SEGMENT_STATUS.exec(run)?.[1]?.trim() ?? null;
    const category = SEGMENT_CATEGORY[family]?.exec(run)?.[1] ?? null;
    const score = (dates.length ? 2 : 0) + (status ? 1 : 0) + (severity ? 1 : 0) + (category ? 1 : 0);
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
  // Tolerate run-together cells ("statusQM-APR-001Acute Care…") — only an
  // UPPERCASE letter or digit immediately before disqualifies a candidate.
  const idRe = /(?<![A-Z0-9])QM-([A-Z]{3})-(\d{3})(?!\d)/g;
  const matches: Array<{ id: string; index: number; len: number }> = [];
  for (const m of text.matchAll(idRe)) matches.push({ id: m[0], index: m.index ?? 0, len: m[0].length });

  interface Scored { row: DashboardRow; score: number }
  const best = new Map<string, Scored>();
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = Math.min(i + 1 < matches.length ? matches[i + 1].index : text.length, start + 300);
    const run = text.slice(start + matches[i].len, end);
    const monthMatch = MONTH_RE.exec(run);
    const indicator = (monthMatch ? run.slice(0, monthMatch.index) : run.slice(0, 60))
      .replace(/\s+/g, ' ').replace(/^[\s,;·|—-]+/, '').trim();
    const threshold = /([≤≥]\s*\d+(?:\.\d+)?%)/.exec(run)?.[1] ?? null;
    const statusMatch = /(✅[^✅⚠🔴]{0,40}|⚠️?[^✅⚠🔴]{0,40}|🔴[^✅⚠🔴]{0,60})/u.exec(run);
    const status = statusMatch ? statusMatch[1].replace(/\s+/g, ' ').trim() : null;
    // Look for the result value AFTER the month label so the glued year
    // digits ("April 2026|78|92|84.8%") don't leak into the raw value.
    const valueRegion = monthMatch ? run.slice(monthMatch.index + monthMatch[0].length) : run;
    const valueMatch = /(\d+(?:\.\d+)?)%\s*[≤≥]/.exec(valueRegion) ?? /(?:–|—|-){2,}\s*(\d+(?:\.\d+)?)%/.exec(valueRegion);
    let rate: number | null = null;
    let rawValue: string | null = valueMatch ? `${valueMatch[1]}%` : null;
    if (valueMatch) {
      const v = Number(valueMatch[1]);
      // Only trust it as a rate when it cannot be glued numerator/denominator
      // digits: ≤100 and at most 2 integer digits.
      if (Number.isFinite(v) && v <= 100 && /^\d{1,2}(\.\d+)?$/.test(valueMatch[1])) { rate = v; rawValue = null; }
    }
    if (!indicator) continue;
    const row: DashboardRow = { metricId: matches[i].id, indicator, month: monthMatch ? monthMatch[0] : null, rate, rawValue, threshold, status };
    // The definition row (month + threshold + status) beats passing references
    // (e.g. PIP source lists citing "QM-APR-002, QM-MAY-002, …").
    const score = (monthMatch ? 2 : 0) + (threshold ? 1 : 0) + (status ? 1 : 0) + (rate != null || rawValue ? 1 : 0);
    const cur = best.get(row.metricId);
    if (!cur || score > cur.score) best.set(row.metricId, { row, score });
  }
  return [...best.values()]
    .filter((s) => s.score >= 2) // drop pure references that never matched a real row
    .map((s) => s.row)
    .sort((a, b) => a.metricId.localeCompare(b.metricId, undefined, { numeric: true }));
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
 * aggregates take precedence over Path 2's single-text-record keyword counts
 * (which can only ever say "1 record matched" for a plain-text upload).
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
export function deriveQapiBundle(parsed: ParsedFile, eventDateISO: string): QapiDerivedBundle {
  if (parsed.records.length === 0) {
    const empty = deriveQapiBundleFromRecords(parsed);
    return { ...empty, sourceMode: 'none', overallNote: 'No parseable content in the uploaded source.' };
  }
  const dump = reconstructClinicalDump(parsed);
  if (dump) return deriveQapiBundleFromClinicalDump(dump, eventDateISO);
  // Narrative/plain-text uploads: enrich the record-level heuristics with
  // labeled aggregates scanned from the text itself (Path 3).
  return applyTextAggregates(deriveQapiBundleFromRecords(parsed), parsed);
}
