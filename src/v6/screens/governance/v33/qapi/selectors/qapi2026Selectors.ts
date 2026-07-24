// Board-facing projections over the normalized 2026 QAPI fixture. Pure, typed,
// and the only place packet/annual/docket/readiness views are computed.

import { QAPI_2026 } from '../data/qapi2026.normalized';
import type {
  QapiQuarter,
  QapiYear2026,
  QuarterKey,
  QualityMetricSeries,
} from '../model/qapi2026.types';

export interface GbMaterialSignal {
  metricId: string;
  indicator: string;
  rate: number;
  target: string;
  status: QualityMetricSeries['status'];
  aggregateMasksSubgroup: boolean;
  boardPosture: 'monitor' | 'direct_action' | 'hold_closure' | 'accept_closure';
}

export interface GbDecisionMatter {
  matterId: string;
  title: string;
  kind: 'pip_closure' | 'escalation' | 'restricted_personnel' | 'evidence_hold';
  quarter: QuarterKey;
  whyItMatters: string;
  decisionRequested: string;
  missingEvidence: string[];
}

export interface PacketReadiness {
  quarter: QuarterKey;
  normalized: boolean;
  gates: { id: string; label: string; ok: boolean; detail: string }[];
  readyToConvene: boolean;
}

export interface GbQuarterPacket {
  quarter: QapiQuarter;
  materialSignals: GbMaterialSignal[];
  openPips: QapiQuarter['pips'];
  decisionsRequested: GbDecisionMatter[];
  restrictedMatterCount: number;
  readiness: PacketReadiness;
}

function lastRate(m: QualityMetricSeries): number {
  return m.points.length ? m.points[m.points.length - 1].rate : 0;
}

function boardPosture(m: QualityMetricSeries): GbMaterialSignal['boardPosture'] {
  if (m.status === 'critical') return 'direct_action';
  if (m.aggregateMasksSubgroup) return 'hold_closure';
  if (m.status === 'below' || m.status === 'watch') return 'monitor';
  return 'accept_closure';
}

export function buildMaterialSignals(quarter: QapiQuarter): GbMaterialSignal[] {
  return quarter.metrics
    .filter((m) => m.status !== 'within' || m.aggregateMasksSubgroup)
    .map((m) => ({
      metricId: m.metricId, indicator: m.indicator, rate: lastRate(m), target: m.target,
      status: m.status, aggregateMasksSubgroup: Boolean(m.aggregateMasksSubgroup), boardPosture: boardPosture(m),
    }));
}

export function buildPacketReadiness(quarter: QapiQuarter, year: QapiYear2026 = QAPI_2026): PacketReadiness {
  const criticalDq = year.validationFindings.filter((f) => f.severity === 'critical' && f.affectedQuarters.includes(quarter.key));
  const gates = [
    { id: 'source', label: 'Source integrity checked', ok: quarter.normalizationStatus === 'normalized', detail: quarter.normalizationStatus === 'normalized' ? 'Quarter normalized from source' : 'Quarter not yet normalized' },
    { id: 'meeting', label: 'Meeting control assembled', ok: Boolean(quarter.meeting), detail: quarter.meeting ? `Meeting ${quarter.meeting.meetingDate}` : 'No meeting control record' },
    { id: 'feeder', label: 'Feeder audits present', ok: quarter.feederAudits.length > 0 || quarter.normalizationStatus === 'pending', detail: `${quarter.feederAudits.length} audits recovered` },
    { id: 'signoff', label: 'Required sign-offs complete', ok: quarter.sourceSignoffs.length > 0 ? quarter.sourceSignoffs.every((s) => s.status === 'Signed') : false, detail: `${quarter.sourceSignoffs.filter((s) => s.status === 'Signed').length}/${quarter.sourceSignoffs.length || 3} signed` },
    { id: 'dq', label: 'No unresolved critical data-quality defect', ok: criticalDq.length === 0, detail: criticalDq.length ? `${criticalDq.length} critical data-quality finding(s)` : 'No critical data-quality defect' },
  ];
  return { quarter: quarter.key, normalized: quarter.normalizationStatus === 'normalized', gates, readyToConvene: gates.every((g) => g.ok) };
}

export function buildGbDecisionDocket(quarter: QapiQuarter): GbDecisionMatter[] {
  const matters: GbDecisionMatter[] = [];
  for (const pip of quarter.pips.filter((p) => !p.closureEligible)) {
    matters.push({
      matterId: pip.pipId, title: pip.title, kind: 'pip_closure', quarter: quarter.key,
      whyItMatters: `Sustainability criterion: ${pip.sustainabilityCriterion ?? 'not stated'} — ${pip.currentQuarterEvidence ?? 'no current evidence'}`,
      decisionRequested: 'Do not authorize closure unless the approved sustainability criterion is met in every named stratum.',
      missingEvidence: pip.gbDecision ? [] : ['Board motion/vote/directive record'],
    });
  }
  for (const esc of quarter.gbEscalations) {
    matters.push({ matterId: esc.escalationId, title: 'QAPI escalation to Governing Body', kind: 'escalation', quarter: quarter.key, whyItMatters: esc.summary, decisionRequested: 'Review, direct system-level action, and record the decision.', missingEvidence: ['Board decision record'] });
  }
  for (const d of quarter.disciplinaryMatters.filter((m) => m.severity === 'Critical')) {
    matters.push({ matterId: d.triggerId, title: 'Restricted personnel matter (executive session)', kind: 'restricted_personnel', quarter: quarter.key, whyItMatters: 'Patient-safety-linked personnel matter; Board directs systems, management executes individual action.', decisionRequested: 'Direct system-level accountability in executive session; do not direct the individual outcome.', missingEvidence: [] });
  }
  return matters;
}

export function buildGbQuarterPacket(key: QuarterKey, year: QapiYear2026 = QAPI_2026): GbQuarterPacket {
  const quarter = year.quarters[key];
  return {
    quarter,
    materialSignals: buildMaterialSignals(quarter),
    openPips: quarter.pips.filter((p) => !p.closureEligible),
    decisionsRequested: buildGbDecisionDocket(quarter),
    restrictedMatterCount: quarter.disciplinaryMatters.length,
    readiness: buildPacketReadiness(quarter, year),
  };
}

export interface AnnualArc {
  normalizedQuarters: QuarterKey[];
  pendingQuarters: QuarterKey[];
  censusArc: string | null;
  carryForwardRisk: string[];
  annualReportApproved: boolean | null;
}

export function buildGbAnnualArc(year: QapiYear2026 = QAPI_2026): AnnualArc {
  const keys = Object.keys(year.quarters) as QuarterKey[];
  const carry: string[] = [];
  for (const k of keys) {
    const q = year.quarters[k];
    q.caps.filter((c) => c.status !== 'Closed' || !c.effectivenessDemonstrated).forEach((c) => carry.push(`${k} open CAP ${c.capId}`));
    q.complaints.filter((c) => /open/i.test(c.status)).forEach((c) => carry.push(`${k} open complaint ${c.complaintId}`));
    q.disciplinaryMatters.filter((m) => !/closed/i.test(m.status)).forEach((m) => carry.push(`${k} restricted matter ${m.triggerId}`));
  }
  return {
    normalizedQuarters: keys.filter((k) => year.quarters[k].normalizationStatus === 'normalized'),
    pendingQuarters: keys.filter((k) => year.quarters[k].normalizationStatus === 'pending'),
    censusArc: year.annual.censusArc,
    carryForwardRisk: carry,
    annualReportApproved: year.annual.annualReportApproved,
  };
}
