// Oversight projection — derives the Governing Body Oversight quarter
// summaries and KPIs FROM the normalized 2026 QAPI fixture (qapi2026.normalized)
// instead of hand-authoring KPI stories.
//
// Every displayed value carries a provenance label from the fixed union below.
// Where a value genuinely cannot be derived (Q3/Q4 normalization pending per
// the annual case), it is represented explicitly as 'Not recovered' — never
// invented.

import { QAPI_2026 } from './qapi/data/qapi2026.normalized';
import type {
  QapiQuarter,
  QualityMetricSeries,
  SourceKind,
} from './qapi/model/qapi2026.types';

export type OversightProvenance =
  | 'Source recovered'
  | 'Calculated from recovered source'
  | 'Supplemental synthetic UAT'
  | 'Management-reported and unresolved'
  | 'Not recovered';

export interface OversightValue {
  text: string;
  provenance: OversightProvenance;
}

export interface OversightKpi {
  name: string;
  value: string;
  threshold: string;
  numerator: string;
  denominator: string;
  trend: string;
  priorQuarter: string;
  priorQuarterProvenance: OversightProvenance;
  subgroup: string;
  sourceDate: string;
  provenance: OversightProvenance;
}

export interface OversightLifecycleItem {
  type: 'PIP' | 'CAP' | 'RCA';
  title: string;
  owner: string;
  due: string;
  evidence: string;
  boardReturn: string;
  provenance: OversightProvenance;
}

export interface OversightDataIssue {
  text: string;
  provenance: OversightProvenance;
}

export interface OversightQuarter {
  id: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  label: string;
  source: string;
  normalization: 'normalized' | 'pending';
  changed: OversightValue;
  improved: OversightValue;
  worsened: OversightValue;
  boardDecision: OversightValue;
  kpis: OversightKpi[];
  lifecycle: OversightLifecycleItem[];
  dataIssues: OversightDataIssue[];
}

export const OVERSIGHT_PROVENANCE_LEGEND: Array<{ label: OversightProvenance; description: string }> = [
  { label: 'Source recovered', description: 'Value appears directly in the recovered 2026 synthetic QAPI source record.' },
  { label: 'Calculated from recovered source', description: 'Value is computed or summarized from recovered source records; the derivation is deterministic.' },
  { label: 'Supplemental synthetic UAT', description: 'Value was authored only to complete a UAT workflow; never production evidence.' },
  { label: 'Management-reported and unresolved', description: 'Value was reported into the record but conflicts with other recovered records and is not reconciled.' },
  { label: 'Not recovered', description: 'No value could be recovered from the source; nothing is invented in its place.' },
];

function provenanceFromSourceKind(kind: SourceKind): OversightProvenance {
  switch (kind) {
    case 'source_recovered': return 'Source recovered';
    case 'derived_from_source': return 'Calculated from recovered source';
    case 'synthetic_supplement': return 'Supplemental synthetic UAT';
    case 'unresolved': return 'Not recovered';
  }
}

const NOT_RECOVERED = 'Not recovered — value absent from normalized source';

function closingPoint(metric: QualityMetricSeries) {
  return metric.points[metric.points.length - 1];
}

function metricValueText(metric: QualityMetricSeries): string {
  const point = closingPoint(metric);
  if (!point) return NOT_RECOVERED;
  return `${point.rate}% (${point.month} close)`;
}

function metricCountText(metric: QualityMetricSeries, key: 'numerator' | 'denominator'): string {
  const point = closingPoint(metric);
  const raw = point?.[key];
  return raw === null || raw === undefined ? NOT_RECOVERED : String(raw);
}

function trendText(metric: QualityMetricSeries): string {
  const first = metric.points[0];
  const last = closingPoint(metric);
  if (!first || !last) return NOT_RECOVERED;
  const delta = last.rate - first.rate;
  const direction = delta === 0 ? 'flat across the quarter'
    : delta > 0 ? `up ${delta.toFixed(1)} pts across the quarter`
      : `down ${Math.abs(delta).toFixed(1)} pts across the quarter`;
  return `Status ${metric.status}${metric.pipTrigger ? ' · PIP trigger' : ''} · ${direction}`;
}

/**
 * Prior-quarter comparison, computed only when the same metricId exists in a
 * prior NORMALIZED quarter. Otherwise explicitly not recovered.
 */
function priorQuarter(
  metric: QualityMetricSeries,
  prior: QapiQuarter | null,
): { text: string; provenance: OversightProvenance } {
  if (!prior || prior.normalizationStatus !== 'normalized') {
    return { text: 'No prior normalized quarter in the 2026 record', provenance: 'Not recovered' };
  }
  const match = prior.metrics.find((candidate) => candidate.metricId === metric.metricId);
  if (!match) {
    return { text: `Metric not recovered in ${prior.key}`, provenance: 'Not recovered' };
  }
  const priorClose = closingPoint(match);
  const currentClose = closingPoint(metric);
  if (!priorClose || !currentClose) {
    return { text: NOT_RECOVERED, provenance: 'Not recovered' };
  }
  const delta = currentClose.rate - priorClose.rate;
  return {
    text: `${prior.key} close ${priorClose.rate}% (${delta >= 0 ? '+' : ''}${delta.toFixed(1)} pts)`,
    provenance: 'Calculated from recovered source',
  };
}

function kpisFor(quarter: QapiQuarter, prior: QapiQuarter | null): OversightKpi[] {
  return quarter.metrics.map((metric) => {
    const priorInfo = priorQuarter(metric, prior);
    return {
      name: metric.indicator,
      value: metricValueText(metric),
      threshold: `Target ${metric.target}`,
      numerator: metricCountText(metric, 'numerator'),
      denominator: metricCountText(metric, 'denominator'),
      trend: trendText(metric),
      priorQuarter: priorInfo.text,
      priorQuarterProvenance: priorInfo.provenance,
      subgroup: metric.aggregateMasksSubgroup
        ? 'Favorable aggregate masks a worsening subgroup (flagged in source)'
        : 'No subgroup mask flagged in source',
      sourceDate: `${quarter.key} 2026 (${quarter.period.start} → ${quarter.period.end})`,
      provenance: provenanceFromSourceKind(metric.provenance.sourceKind),
    };
  });
}

function lifecycleFor(quarter: QapiQuarter): OversightLifecycleItem[] {
  const pips: OversightLifecycleItem[] = quarter.pips.map((pip) => ({
    type: 'PIP',
    title: pip.title,
    owner: 'Owner not recorded in source',
    due: pip.returnDate ?? NOT_RECOVERED,
    evidence: pip.currentQuarterEvidence ?? NOT_RECOVERED,
    boardReturn: pip.returnDate ? `Return to Board ${pip.returnDate}` : NOT_RECOVERED,
    provenance: provenanceFromSourceKind(pip.provenance.sourceKind),
  }));
  const caps: OversightLifecycleItem[] = quarter.caps.map((cap) => ({
    type: 'CAP',
    title: cap.description,
    owner: cap.ownerClinId,
    due: cap.dueDate,
    evidence: cap.effectivenessDemonstrated ? 'Effectiveness demonstrated' : 'Effectiveness not yet demonstrated',
    boardReturn: cap.status,
    provenance: provenanceFromSourceKind(cap.provenance.sourceKind),
  }));
  const rcas: OversightLifecycleItem[] = quarter.adverseEvents
    .filter((event) => event.rcaRequired)
    .map((event) => ({
      type: 'RCA',
      title: `${event.rcaId ?? 'RCA id not recovered'} — ${event.caseLabel}`,
      owner: 'Owner not recorded in source',
      due: event.eventDate,
      evidence: event.rcaFindings ?? NOT_RECOVERED,
      boardReturn: event.status,
      provenance: provenanceFromSourceKind(event.provenance.sourceKind),
    }));
  return [...pips, ...caps, ...rcas];
}

function dataIssuesFor(quarterKey: 'Q1' | 'Q2' | 'Q3' | 'Q4'): OversightDataIssue[] {
  return QAPI_2026.validationFindings
    .filter((finding) => finding.affectedQuarters.includes(quarterKey))
    .map((finding) => ({
      text: `${finding.findingId} (${finding.severity}): ${finding.title}`,
      provenance: finding.kind === 'synthetic_supplement' ? 'Supplemental synthetic UAT' : 'Calculated from recovered source',
    }));
}

function countsSummary(quarter: QapiQuarter) {
  const below = quarter.metrics.filter((metric) => metric.status === 'below' || metric.status === 'critical');
  const critical = quarter.metrics.filter((metric) => metric.status === 'critical');
  const triggers = quarter.pipTriggers.length;
  return { total: quarter.metrics.length, below: below.length, critical: critical.length, triggers };
}

function buildNormalizedQuarter(quarter: QapiQuarter, prior: QapiQuarter | null, label: string): OversightQuarter {
  const counts = countsSummary(quarter);
  const withinMetrics = quarter.metrics.filter((metric) => metric.status === 'within');
  const worsenedMetrics = quarter.metrics.filter((metric) => metric.status === 'critical' || metric.status === 'below');
  const escalations = quarter.gbEscalations.length;
  return {
    id: quarter.key,
    label,
    source: 'qapi/data/qapi2026.normalized.ts ← qapi/source/MOCK_2026_QAPI.txt',
    normalization: 'normalized',
    changed: {
      text: `${counts.total} metric series recovered; ${counts.below} at/below threshold (${counts.critical} critical); ${counts.triggers} PIP trigger(s); ${escalations} GB escalation record(s).`,
      provenance: 'Calculated from recovered source',
    },
    improved: {
      text: withinMetrics.length
        ? `Within target: ${withinMetrics.map((metric) => metric.indicator).join('; ')}.`
        : 'No recovered metric closed within target this quarter.',
      provenance: 'Calculated from recovered source',
    },
    worsened: {
      text: worsenedMetrics.length
        ? `Below/critical: ${worsenedMetrics.map((metric) => metric.indicator).join('; ')}.`
        : 'No recovered metric closed below threshold this quarter.',
      provenance: 'Calculated from recovered source',
    },
    boardDecision: {
      text: quarter.gbEscalations.length
        ? quarter.gbEscalations.map((escalation) => escalation.summary).join(' ')
        : 'No GB escalation record recovered for this quarter.',
      provenance: quarter.gbEscalations.length
        ? provenanceFromSourceKind(quarter.gbEscalations[0].provenance.sourceKind)
        : 'Not recovered',
    },
    kpis: kpisFor(quarter, prior),
    lifecycle: lifecycleFor(quarter),
    dataIssues: dataIssuesFor(quarter.key),
  };
}

function buildPendingQuarter(quarter: QapiQuarter, label: string): OversightQuarter {
  const pendingValue: OversightValue = {
    text: `${quarter.key} normalization is pending per the annual case — values not recovered.`,
    provenance: 'Not recovered',
  };
  return {
    id: quarter.key,
    label,
    source: 'qapi/data/qapi2026.normalized.ts (normalization pending)',
    normalization: 'pending',
    changed: pendingValue,
    improved: pendingValue,
    worsened: pendingValue,
    boardDecision: pendingValue,
    kpis: [],
    lifecycle: [],
    dataIssues: [{
      text: `${quarter.key} 2026 is present in the source fixture but not normalized; no KPI, lifecycle, or escalation value is recovered.`,
      provenance: 'Not recovered',
    }],
  };
}

function buildAnnual(): OversightQuarter {
  const annual = QAPI_2026.annual;
  const supplements = QAPI_2026.syntheticSupplements;
  return {
    id: 'Annual',
    label: 'Annual 2026',
    source: 'qapi/data/qapi2026.normalized.ts (annual summary — pending Q3/Q4)',
    normalization: annual.normalizationStatus,
    changed: {
      text: annual.censusArc ?? NOT_RECOVERED,
      // Census arc mixes recovered Q1 values with an unreconciled Q2 opening
      // census (DQ-2026-002): flag it as unresolved, not clean derivation.
      provenance: 'Management-reported and unresolved',
    },
    improved: {
      text: 'Annual improvement arc cannot be computed until Q3/Q4 are normalized.',
      provenance: 'Not recovered',
    },
    worsened: {
      text: 'Annual deterioration arc cannot be computed until Q3/Q4 are normalized.',
      provenance: 'Not recovered',
    },
    boardDecision: {
      text: annual.annualReportApproved === null
        ? 'Annual report approval: not recovered from source.'
        : `Annual report approved: ${annual.annualReportApproved ? 'yes' : 'no'}.`,
      provenance: annual.annualReportApproved === null ? 'Not recovered' : 'Source recovered',
    },
    kpis: [
      {
        name: 'Open CAPs carry-forward',
        value: annual.openCapsCarryForward === null ? NOT_RECOVERED : String(annual.openCapsCarryForward),
        threshold: 'No threshold recovered',
        numerator: NOT_RECOVERED,
        denominator: NOT_RECOVERED,
        trend: annual.note,
        priorQuarter: 'Annual only',
        priorQuarterProvenance: 'Not recovered',
        subgroup: 'Annual carry-forward',
        sourceDate: 'FY2026',
        provenance: annual.openCapsCarryForward === null ? 'Not recovered' : 'Calculated from recovered source',
      },
      {
        name: 'Open complaints carry-forward',
        value: annual.openComplaintsCarryForward === null ? NOT_RECOVERED : String(annual.openComplaintsCarryForward),
        threshold: 'No threshold recovered',
        numerator: NOT_RECOVERED,
        denominator: NOT_RECOVERED,
        trend: 'Pending Q3/Q4 normalization',
        priorQuarter: 'Annual only',
        priorQuarterProvenance: 'Not recovered',
        subgroup: 'Annual carry-forward',
        sourceDate: 'FY2026',
        provenance: annual.openComplaintsCarryForward === null ? 'Not recovered' : 'Calculated from recovered source',
      },
    ],
    lifecycle: supplements.map((supplement) => ({
      type: 'CAP' as const,
      title: `Synthetic supplement: ${supplement.supplementReason}`,
      owner: 'Authored for UAT workflow completeness',
      due: 'Review required before any production reliance',
      evidence: `Linked source records: ${supplement.sourceRecordIds.join(', ')}`,
      boardReturn: 'Not approved for production',
      provenance: 'Supplemental synthetic UAT' as const,
    })),
    dataIssues: QAPI_2026.validationFindings.map((finding) => ({
      text: `${finding.findingId} (${finding.severity}): ${finding.title}`,
      provenance: finding.kind === 'synthetic_supplement'
        ? 'Supplemental synthetic UAT' as const
        : 'Calculated from recovered source' as const,
    })),
  };
}

const q1 = QAPI_2026.quarters.Q1;
const q2 = QAPI_2026.quarters.Q2;
const q3 = QAPI_2026.quarters.Q3;
const q4 = QAPI_2026.quarters.Q4;

export const OVERSIGHT_QUARTERS: OversightQuarter[] = [
  buildNormalizedQuarter(q1, null, 'Q1 2026'),
  buildNormalizedQuarter(q2, q1, 'Q2 2026'),
  buildPendingQuarter(q3, 'Q3 2026'),
  buildPendingQuarter(q4, 'Q4 2026'),
  buildAnnual(),
];
