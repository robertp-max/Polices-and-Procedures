import type { PacketFinding, WorkflowTriggerEvaluation } from '@/policy/packets/contracts';
import {
  aggregatePersonnelReviewThresholds,
  PERSONNEL_REVIEW_THRESHOLD_MET,
} from '@/policy/packets/analysis/triggers/personnelReview';
import type {
  PersonnelReviewSignal,
  PersonnelReviewSummary,
} from '@/policy/packets/analysis/triggers/personnelReview';
import type { RecordSegment } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';

export interface PersonnelAggregateRow {
  triggerCategory: string;
  count: number;
  policy: string;
  reason: string;
  status: string;
  requiredReviewer: string;
}

export interface PersonnelAddendumReference {
  id: string;
  sha: string;
  classification: 'restricted-personnel';
}

export interface PersonnelAggregationModel {
  statement: typeof PERSONNEL_REVIEW_THRESHOLD_MET | null;
  rows: readonly PersonnelAggregateRow[];
  summary: PersonnelReviewSummary;
  addendumReference: PersonnelAddendumReference;
}

export interface BuildPersonnelAggregationInput {
  period: string;
  findings?: readonly PacketFinding[];
  evaluations?: readonly WorkflowTriggerEvaluation[];
  recordSegments?: readonly RecordSegment[];
}

interface ParsedPersonnelSegment {
  category: string;
  count: number;
  policy: string;
  status: string;
  requiredReviewer: string;
}

const DEFAULT_REASON = 'Personnel-review threshold met; details retained in restricted addendum.';

export function buildPersonnelAggregation(
  input: BuildPersonnelAggregationInput,
): PersonnelAggregationModel {
  const parsedSegments = (input.recordSegments ?? []).map(parsePersonnelSegment);
  const rows = aggregateRows(parsedSegments);
  const signals = parsedSegments.flatMap((segment, index) =>
    signalsForSegment(segment, index),
  );
  const summary = aggregatePersonnelReviewThresholds({
    findings: [...(input.findings ?? [])],
    evaluations: [...(input.evaluations ?? [])],
    signals,
  });
  const rowCount = rows.reduce((sum, row) => sum + row.count, 0);
  const effectiveSummary: PersonnelReviewSummary = {
    ...summary,
    statement: rowCount > 0 ? PERSONNEL_REVIEW_THRESHOLD_MET : summary.statement,
    thresholdMetCount: rowCount > 0 ? rowCount : summary.thresholdMetCount,
    rationale:
      rowCount > 0
        ? `Personnel-review threshold met for ${String(rowCount)} aggregate trigger(s); restricted personnel handling required.`
        : summary.rationale,
  };

  return {
    statement: effectiveSummary.statement,
    rows,
    summary: effectiveSummary,
    addendumReference: {
      id: `QAPI-HR-ADDENDUM-${input.period}`,
      sha: stableSha(rows),
      classification: 'restricted-personnel',
    },
  };
}

function parsePersonnelSegment(segment: RecordSegment): ParsedPersonnelSegment {
  return {
    category: readField(segment.text, 'category') ?? 'Personnel-review trigger',
    count: readCount(segment.text),
    policy: readField(segment.text, 'policy-ref') ?? 'UNKNOWN — NOT RECOVERED',
    status: readField(segment.text, 'status') ?? 'Open — personnel review pending',
    requiredReviewer: readField(segment.text, 'required reviewer') ?? 'HR/Compliance reviewer',
  };
}

function aggregateRows(segments: readonly ParsedPersonnelSegment[]): PersonnelAggregateRow[] {
  const byKey = new Map<string, PersonnelAggregateRow>();

  for (const segment of segments) {
    const key = [
      segment.category,
      segment.policy,
      segment.status,
      segment.requiredReviewer,
    ].join('\u001f');
    const current = byKey.get(key);
    if (current) {
      current.count += segment.count;
    } else {
      byKey.set(key, {
        triggerCategory: segment.category,
        count: segment.count,
        policy: segment.policy,
        reason: DEFAULT_REASON,
        status: segment.status,
        requiredReviewer: segment.requiredReviewer,
      });
    }
  }

  return [...byKey.values()].sort((left, right) =>
    left.triggerCategory.localeCompare(right.triggerCategory),
  );
}

function signalsForSegment(
  segment: ParsedPersonnelSegment,
  index: number,
): PersonnelReviewSignal[] {
  return Array.from({ length: segment.count }, (_, offset) => ({
    signalId: `personnel-aggregate:${index + 1}:${offset + 1}`,
    findingId: `personnel-aggregate:${index + 1}`,
    staffMemberId: null,
    category: segment.category,
    policyReference: segment.policy,
    thresholdMet: true,
    rationale: DEFAULT_REASON,
    restricted: true,
  }));
}

function readField(text: string, field: string): string | null {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`${escaped}:\\s*([^|\\n]+)`, 'i').exec(text);
  const value = match?.[1]?.trim();
  return value && value.length > 0 ? value : null;
}

function readCount(text: string): number {
  const raw = readField(text, 'count');
  if (!raw) return 1;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 1;
}

function stableSha(rows: readonly PersonnelAggregateRow[]): string {
  const material = JSON.stringify(rows);
  let hash = 0x811c9dc5;
  for (let index = 0; index < material.length; index++) {
    hash ^= material.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `sha256:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
