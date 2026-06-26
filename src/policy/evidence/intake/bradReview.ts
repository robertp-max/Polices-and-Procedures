/**
 * Brad full-population review engine (Sections 12 + 13).
 *
 * DEFAULT mode is full_population — every readable record is reviewed (no 20%
 * sample unless the user explicitly chooses one). Coverage counts prove
 * completeness; any parse/review failure yields status 'partial', never
 * "full review complete".
 *
 * Findings are DRAFTS. Brad classifies, summarizes, and identifies findings but
 * never certifies clinical facts. Conclusions requiring professional judgment
 * carry requiresLicensedClinicianReview = true. The engine is deterministic and
 * rule-based (honest, testable); its version is recorded on the run.
 */

import type { EvidenceClassification, EvidenceSourceRecord } from './intakeModel';

export const BRAD_REVIEW_ENGINE_VERSION = 'brad-review-rules-2026.06.25.1';

export type ReviewMode = 'full_population' | 'user_requested_sample';

export type ReviewType =
  | 'oasis_assessment'
  | 'plan_of_care'
  | 'complaints_grievances'
  | 'incident_adverse_event'
  | 'infection_control'
  | 'hr_training'
  | 'general';

export type ReviewRunStatus = 'queued' | 'running' | 'partial' | 'draft_ready' | 'approved' | 'failed';

export type FindingSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface BradReviewFinding {
  findingId: string;
  /** source evidence / record key. */
  sourceEvidenceId: string;
  /** row / sheet / page / JSON path. */
  sourcePointer: string;
  findingType: string;
  factualBasis: string;
  /** rule / policy / form reference when available. */
  reference?: string;
  severity: FindingSeverity;
  confidence: number;
  recommendedAction: string;
  /** Always true — Brad output is a draft until human approval. */
  draftOnly: true;
  /** True when a licensed clinician must verify (Brad will not assert). */
  requiresLicensedClinicianReview: boolean;
}

export interface BradReviewRun {
  reviewRunId: string;
  batchId: string;
  eventId?: string;
  reviewType: ReviewType;
  mode: ReviewMode;
  status: ReviewRunStatus;

  totalRecords: number;
  parsedRecords: number;
  reviewedRecords: number;
  failedRecords: number;
  skippedRecords: number;

  startedAt: string;
  completedAt?: string;
  generatedBy: 'brad';
  modelOrEngineVersion: string;

  findings: BradReviewFinding[];
  /** Human-readable coverage statement (never claims complete when partial). */
  coverageStatement: string;
}

/* ─── Per-record rule checks ────────────────────────────────────── */

function fieldVal(fields: Record<string, unknown> | undefined, names: string[]): string | null {
  if (!fields) return null;
  for (const key of Object.keys(fields)) {
    const norm = key.trim().toLowerCase().replace(/\s+/g, '');
    if (names.includes(norm)) {
      const v = fields[key];
      if (v !== null && v !== undefined && String(v).trim()) return String(v).trim();
    }
  }
  return null;
}

function baseFinding(rec: EvidenceSourceRecord, idx: number, partial: Partial<BradReviewFinding> & Pick<BradReviewFinding, 'findingType' | 'factualBasis' | 'severity' | 'recommendedAction'>): BradReviewFinding {
  return {
    findingId: `FND-${rec.sourceRecordKey}-${idx}`,
    sourceEvidenceId: rec.canonicalEvidenceId ?? rec.sourceRecordKey,
    sourcePointer: rec.sourcePointer,
    confidence: partial.confidence ?? 0.7,
    reference: partial.reference,
    draftOnly: true,
    requiresLicensedClinicianReview: partial.requiresLicensedClinicianReview ?? false,
    findingType: partial.findingType,
    factualBasis: partial.factualBasis,
    severity: partial.severity,
    recommendedAction: partial.recommendedAction,
  };
}

/** rec.* carries resolved/occurrence dates; raw fields are passed alongside. */
function reviewRecord(rec: EvidenceSourceRecord, fields: Record<string, unknown> | undefined, reviewType: ReviewType): BradReviewFinding[] {
  const out: BradReviewFinding[] = [];
  let i = 0;

  // Universal: date-resolution and classification gaps are non-clinical findings.
  if (rec.status === 'needs_date_review' || rec.createdDateConfidence === 'unresolved') {
    out.push(baseFinding(rec, i++, {
      findingType: 'unresolved_created_date',
      factualBasis: 'The source-system created date could not be resolved or is ambiguous; filing period is unset.',
      severity: 'medium',
      recommendedAction: 'Resolve the created date before this record is filed or included in a packet.',
      confidence: 0.95,
    }));
  }
  if (rec.status === 'needs_classification_review') {
    out.push(baseFinding(rec, i++, {
      findingType: 'low_confidence_classification',
      factualBasis: `Classification "${rec.classification}" resolved with confidence ${rec.classificationConfidence}.`,
      severity: 'low',
      recommendedAction: 'Confirm or override the evidence classification before packet lock.',
      confidence: 0.9,
    }));
  }

  const effectiveType = reviewType === 'general' ? classificationToReviewType(rec.classification) : reviewType;

  switch (effectiveType) {
    case 'complaints_grievances': {
      if (!rec.occurrenceAt) out.push(baseFinding(rec, i++, { findingType: 'missing_occurrence_date', factualBasis: 'No occurrence date present on the complaint record.', severity: 'low', recommendedAction: 'Capture the occurrence date as metadata (does not change filing month).', reference: 'PR-GR-001', confidence: 0.85 }));
      const investigation = fieldVal(fields, ['investigationstatus', 'status', 'resolution', 'resolutionstatus']);
      if (!investigation) out.push(baseFinding(rec, i++, { findingType: 'investigation_status_missing', factualBasis: 'No investigation/resolution status found on the complaint record.', severity: 'medium', recommendedAction: 'Record investigation status and response timeliness; confirm QAPI inclusion.', reference: 'PR-GR-001', confidence: 0.8 }));
      break;
    }
    case 'incident_adverse_event': {
      const rca = fieldVal(fields, ['rca', 'rootcause', 'rootcauseanalysis']);
      const severity = fieldVal(fields, ['severity', 'harmlevel']);
      if (!rca) out.push(baseFinding(rec, i++, { findingType: 'rca_missing', factualBasis: 'No root-cause analysis field found on the incident record.', severity: 'high', recommendedAction: 'Determine whether RCA is required; document corrective action and follow-up.', reference: 'RM-ER-002', confidence: 0.8, requiresLicensedClinicianReview: true }));
      if (severity && /high|severe|sentinel|death|jeopardy/i.test(severity)) out.push(baseFinding(rec, i++, { findingType: 'governing_body_escalation_candidate', factualBasis: `Incident severity "${severity}" may require Governing Body escalation.`, severity: 'critical', recommendedAction: 'Escalate for Governing Body awareness and QAPI inclusion.', reference: 'RM-ER-002', confidence: 0.7, requiresLicensedClinicianReview: true }));
      break;
    }
    case 'infection_control': {
      const trend = fieldVal(fields, ['trend', 'rate', 'threshold', 'count']);
      if (!trend) out.push(baseFinding(rec, i++, { findingType: 'surveillance_data_incomplete', factualBasis: 'No rate/threshold/trend value found on the infection record.', severity: 'medium', recommendedAction: 'Confirm line-list completeness and threshold comparison.', reference: 'IC-PR-001', confidence: 0.75 }));
      break;
    }
    case 'oasis_assessment': {
      const assessmentType = fieldVal(fields, ['assessmenttype', 'rfa', 'reasonforassessment']);
      if (!assessmentType) out.push(baseFinding(rec, i++, { findingType: 'oasis_assessment_type_missing', factualBasis: 'No SOC/ROC/Recert/Transfer/Discharge assessment type field found.', severity: 'medium', recommendedAction: 'Confirm assessment type and timing consistency.', reference: 'CL-OA-001', confidence: 0.7, requiresLicensedClinicianReview: true }));
      break;
    }
    case 'plan_of_care': {
      const orders = fieldVal(fields, ['physicianorder', 'orderstatus', 'signed', 'physiciansignature']);
      if (!orders) out.push(baseFinding(rec, i++, { findingType: 'poc_order_status_unclear', factualBasis: 'No physician order/signature status found on the plan-of-care record.', severity: 'high', recommendedAction: 'Verify physician order status, frequency/duration, and skilled-need support.', reference: 'CL-CP-009', confidence: 0.7, requiresLicensedClinicianReview: true }));
      break;
    }
    case 'hr_training': {
      const completion = fieldVal(fields, ['completed', 'completiondate', 'status', 'attestation']);
      if (!completion) out.push(baseFinding(rec, i++, { findingType: 'training_completion_unverified', factualBasis: 'No completion/attestation field found on the HR/training record.', severity: 'medium', recommendedAction: 'Confirm training completion / competency evidence and license/credential status.', reference: 'HR-TD-001', confidence: 0.8 }));
      break;
    }
    default:
      break;
  }
  return out;
}

export function classificationToReviewType(classification: EvidenceClassification): ReviewType {
  switch (classification) {
    case 'complaints_grievances': return 'complaints_grievances';
    case 'incident_adverse_event':
    case 'abuse_neglect_exploitation': return 'incident_adverse_event';
    case 'infection_control':
    case 'infection_surveillance': return 'infection_control';
    case 'oasis_accuracy': return 'oasis_assessment';
    case 'poc_audit': return 'plan_of_care';
    case 'personnel_file':
    case 'competency_validation':
    case 'training_attestation':
    case 'hipaa_training':
    case 'tb_screening':
    case 'employee_health': return 'hr_training';
    default: return 'general';
  }
}

export interface ReviewInput {
  batchId: string;
  reviewRunId: string;
  reviewType?: ReviewType;
  mode?: ReviewMode;
  startedAt: string;
  completedAt: string;
  eventId?: string;
  /** All extracted records (the full population). */
  records: EvidenceSourceRecord[];
  /** Raw fields per record key, when available (for deeper rule checks). */
  rawFieldsByRecordKey?: Record<string, Record<string, unknown>>;
  /** Count of source files / records that failed to parse (Section 12). */
  failedRecords?: number;
  /** Optional explicit sampling (only when user requests it). */
  sampleSize?: number;
}

/** Run a full-population (default) Brad review and return a draft run. */
export function runBradReview(input: ReviewInput): BradReviewRun {
  const mode: ReviewMode = input.mode ?? 'full_population';
  const reviewType: ReviewType = input.reviewType ?? 'general';
  const total = input.records.length;
  const failedRecords = input.failedRecords ?? 0;

  // Full population by default; sampling only if explicitly requested.
  let toReview = input.records;
  let skipped = 0;
  if (mode === 'user_requested_sample' && input.sampleSize && input.sampleSize < total) {
    toReview = input.records.slice(0, input.sampleSize);
    skipped = total - input.sampleSize;
  }

  const findings: BradReviewFinding[] = [];
  let reviewed = 0;
  for (const rec of toReview) {
    if (rec.status === 'failed') continue; // counted as failed, not reviewed
    const raw = input.rawFieldsByRecordKey?.[rec.sourceRecordKey];
    findings.push(...reviewRecord(rec, raw, reviewType));
    reviewed += 1;
  }

  const failed = failedRecords + toReview.filter((r) => r.status === 'failed').length;
  const isPartial = failed > 0 || skipped > 0 || reviewed < total;
  const status: ReviewRunStatus = isPartial ? 'partial' : 'draft_ready';

  const coverageStatement = isPartial
    ? `Partial review: ${reviewed} of ${total} records reviewed (${failed} failed/unreadable, ${skipped} skipped). Review is NOT complete.`
    : `Full-population review complete: all ${reviewed} of ${total} readable records reviewed.`;

  return {
    reviewRunId: input.reviewRunId,
    batchId: input.batchId,
    eventId: input.eventId,
    reviewType,
    mode,
    status,
    totalRecords: total,
    parsedRecords: total - toReview.filter((r) => r.status === 'failed').length,
    reviewedRecords: reviewed,
    failedRecords: failed,
    skippedRecords: skipped,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    generatedBy: 'brad',
    modelOrEngineVersion: BRAD_REVIEW_ENGINE_VERSION,
    findings,
    coverageStatement,
  };
}
