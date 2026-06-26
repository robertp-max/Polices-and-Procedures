/**
 * Deterministic evidence classification (Section 8).
 *
 * Classification uses deterministic signals (source object/table name, filename,
 * sheet name, JSON path, column headers, known form/policy/workflow IDs,
 * extracted text) BEFORE any Brad inference. Brad rationale can be appended, but
 * the deterministic signal set always drives the confidence score so a human can
 * review low-confidence rows before packet lock.
 */

import type { EvidenceClassification } from './intakeModel';

export interface ClassificationSignals {
  fileName?: string;
  sheetName?: string;
  sourcePointer?: string;
  jsonPath?: string;
  sourceObject?: string;
  columnHeaders?: string[];
  formIds?: string[];
  policyIds?: string[];
  workflowIds?: string[];
  eventIds?: string[];
  text?: string;
}

export interface ClassificationResult {
  classification: EvidenceClassification;
  confidence: number; // 0..1
  signalsUsed: string[];
  rationale: string[];
}

interface Rule {
  classification: EvidenceClassification;
  /** Keyword/regex tokens; matched against the joined signal haystack. */
  tokens: RegExp[];
  /** Weight per matched token (capped at 0.95 deterministic). */
  weight?: number;
}

/** Ordered rules — earlier, more specific rules win ties. */
const RULES: Rule[] = [
  { classification: 'abuse_neglect_exploitation', tokens: [/\babuse\b/i, /\bneglect\b/i, /exploitation/i, /\baps\b/i, /mandated report/i], weight: 0.32 },
  { classification: 'complaints_grievances', tokens: [/complaint/i, /grievance/i] },
  { classification: 'incident_adverse_event', tokens: [/incident/i, /adverse[\s_-]?event/i, /sentinel/i, /\brca\b/i, /occurrence report/i] },
  { classification: 'infection_surveillance', tokens: [/infection.*surveillance/i, /surveillance.*infection/i, /line[\s_-]?list/i, /outbreak/i] },
  { classification: 'infection_control', tokens: [/infection[\s_-]?control/i, /\bhai\b/i, /infection log/i] },
  { classification: 'qapi_minutes', tokens: [/qapi.*minutes/i, /minutes.*qapi/i, /committee minutes/i] },
  { classification: 'qapi_agenda', tokens: [/qapi.*agenda/i, /agenda.*qapi/i, /meeting agenda/i] },
  { classification: 'qapi_action_items', tokens: [/action[\s_-]?item/i, /capa/i, /corrective action/i] },
  { classification: 'qapi_metrics', tokens: [/qapi.*dashboard/i, /qapi.*metric/i, /\bkpi\b/i, /performance indicator/i, /qa-f-014/i] },
  { classification: 'active_pip', tokens: [/\bpip\b/i, /performance improvement project/i] },
  { classification: 'poc_audit', tokens: [/plan[\s_-]?of[\s_-]?care/i, /\bpoc\b/i, /485/i, /cms[\s_-]?485/i] },
  { classification: 'oasis_accuracy', tokens: [/oasis/i, /\bsoc\b/i, /\broc\b/i, /recert/i, /m00\d\d/i] },
  { classification: 'medication_reconciliation', tokens: [/medication[\s_-]?reconciliation/i, /med[\s_-]?rec/i, /drug regimen review/i] },
  { classification: 'physician_orders', tokens: [/physician[\s_-]?order/i, /verbal order/i, /signed order/i, /order tracking/i] },
  { classification: 'chart_audit', tokens: [/chart[\s_-]?audit/i, /clinical record review/i, /record review/i] },
  { classification: 'hipaa_training', tokens: [/hipaa/i, /privacy training/i] },
  { classification: 'tb_screening', tokens: [/\btb\b/i, /tuberculosis/i, /ppd/i, /quantiferon/i] },
  { classification: 'employee_health', tokens: [/employee[\s_-]?health/i, /health screening/i, /immuniz/i] },
  { classification: 'training_attestation', tokens: [/in[\s_-]?service/i, /training/i, /attestation/i, /competency.*post[\s_-]?test/i] },
  { classification: 'competency_validation', tokens: [/competency/i, /skills validation/i, /skills checklist/i] },
  { classification: 'personnel_file', tokens: [/personnel[\s_-]?file/i, /credential/i, /license verification/i, /\bhr file\b/i] },
  { classification: 'oig_sam_exclusion', tokens: [/\boig\b/i, /\bsam\b/i, /leie/i, /exclusion/i] },
  { classification: 'emergency_preparedness', tokens: [/emergency[\s_-]?preparedness/i, /\bdrill\b/i, /after[\s_-]?action/i] },
  { classification: 'governing_body', tokens: [/governing[\s_-]?body/i, /\bboard\b/i, /board meeting/i] },
  { classification: 'policy_review', tokens: [/policy[\s_-]?review/i, /annual policy/i, /policy approval/i] },
  { classification: 'billing_claims', tokens: [/billing/i, /\bclaim/i, /pre[\s_-]?bill/i, /\bra(p|ps)\b/i] },
  { classification: 'vulnerability_scan', tokens: [/vulnerability/i, /\bscan\b/i, /security/i, /penetration/i] },
  { classification: 'audit_export', tokens: [/survey/i, /audit export/i, /audit bundle/i, /hash manifest/i] },
];

/** Known classification hints by Salesforce/WellSky object name. */
const OBJECT_HINTS: Record<string, EvidenceClassification> = {
  complaint__c: 'complaints_grievances',
  grievance__c: 'complaints_grievances',
  incident__c: 'incident_adverse_event',
  adverseevent__c: 'incident_adverse_event',
  abusereport__c: 'abuse_neglect_exploitation',
  infectionevent__c: 'infection_control',
  oasis: 'oasis_accuracy',
  planofcare: 'poc_audit',
  personnel__c: 'personnel_file',
};

export function classifyEvidence(signals: ClassificationSignals): ClassificationResult {
  const haystackParts = [
    signals.fileName,
    signals.sheetName,
    signals.sourcePointer,
    signals.jsonPath,
    signals.sourceObject,
    ...(signals.columnHeaders ?? []),
    ...(signals.formIds ?? []),
    ...(signals.policyIds ?? []),
    ...(signals.workflowIds ?? []),
    ...(signals.eventIds ?? []),
    signals.text,
  ].filter(Boolean);
  const haystack = haystackParts.join(' • ').toLowerCase();
  const rationale: string[] = [];
  const signalsUsed: string[] = [];

  // Strong deterministic signal: known source object name.
  const objKey = (signals.sourceObject ?? '').toLowerCase().replace(/\s+/g, '');
  if (objKey && OBJECT_HINTS[objKey]) {
    rationale.push(`Source object "${signals.sourceObject}" maps to ${OBJECT_HINTS[objKey]}.`);
    signalsUsed.push(`sourceObject:${signals.sourceObject}`);
    return { classification: OBJECT_HINTS[objKey], confidence: 0.92, signalsUsed, rationale };
  }

  let best: { rule: Rule; score: number; hits: string[] } | null = null;
  for (const rule of RULES) {
    const hits: string[] = [];
    for (const token of rule.tokens) {
      if (token.test(haystack)) hits.push(token.source);
    }
    if (hits.length === 0) continue;
    const weight = rule.weight ?? 0.28;
    const score = Math.min(0.95, 0.45 + hits.length * weight);
    if (!best || score > best.score) best = { rule, score, hits };
  }

  if (!best) {
    rationale.push('No deterministic classification signal matched; routed to manual review.');
    return { classification: 'unknown_needs_review', confidence: 0, signalsUsed, rationale };
  }

  rationale.push(`Matched ${best.hits.length} deterministic signal(s) for ${best.rule.classification}.`);
  best.hits.forEach((h) => signalsUsed.push(`token:${h}`));
  return {
    classification: best.rule.classification,
    confidence: Number(best.score.toFixed(2)),
    signalsUsed,
    rationale,
  };
}

/** A classification below this confidence must be reviewable before packet lock. */
export const CLASSIFICATION_REVIEW_THRESHOLD = 0.6;

export function classificationNeedsReview(result: ClassificationResult): boolean {
  return result.classification === 'unknown_needs_review' || result.confidence < CLASSIFICATION_REVIEW_THRESHOLD;
}
