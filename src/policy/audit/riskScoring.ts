import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EnforcementReport, EnforcementRiskLevel } from '@/policy/enforcement/types';

/* ═══════════════════════════════════════════════════════════════
   Risk Scoring Model
   ----------------------------------------------------------------
   Produces a 0–100 risk score for a single event and a banded
   categorical risk (low / medium / high / immediate-jeopardy).

   Weights reflect surveyor priorities:
     - Declared audit-risk on the event (ceiling)
     - Current overdue status (+severity based on days past due)
     - Missing approvals on critical artifacts
     - Missing evidence on critical domains
     - Blocked minutes on CoP-cited meeting events
     - Dependency gap (upstream not closed)

   Scoring is deterministic and fully explainable via `drivers[]`.
   ═══════════════════════════════════════════════════════════════ */

export interface RiskDriver {
  id: string;
  label: string;
  weight: number;   // 0-100
  detail?: string;
}

export interface RiskScore {
  eventId: string;
  score: number;              // 0-100
  band: EnforcementRiskLevel;
  drivers: RiskDriver[];
  /** Surveyor-facing one-line rationale. */
  rationale: string;
}

const CRITICAL_DOMAINS = new Set(['Governance', 'QAPI', 'Compliance']);

export function computeRiskScore(event: RegulatoryEvent, report: EnforcementReport): RiskScore {
  const drivers: RiskDriver[] = [];
  let score = 0;

  /* ── 1. Declared risk ceiling ── */
  const declared = event.complianceFlags?.auditRisk ?? 'low';
  if (declared === 'critical') { score += 25; drivers.push({ id: 'declared-critical', label: 'Declared audit risk: critical', weight: 25 }); }
  else if (declared === 'high') { score += 15; drivers.push({ id: 'declared-high', label: 'Declared audit risk: high', weight: 15 }); }
  else if (declared === 'medium') { score += 5; drivers.push({ id: 'declared-medium', label: 'Declared audit risk: medium', weight: 5 }); }

  /* ── 2. Overdue ── */
  const overdue = report.timelineIssues.find(t => t.kind === 'overdue');
  if (overdue) {
    const w = Math.min(25, 5 + overdue.daysPastOrUntil * 2);
    score += w;
    drivers.push({ id: 'overdue', label: `Overdue by ${overdue.daysPastOrUntil} day(s)`, weight: w });
  }

  /* ── 3. Missing critical approvals ── */
  const criticalApprovalGaps = report.approvalGaps.filter(g => g.status === 'missing' || g.status === 'escalated');
  if (criticalApprovalGaps.length > 0) {
    const w = Math.min(25, criticalApprovalGaps.length * 12);
    score += w;
    drivers.push({
      id: 'approval-gap',
      label: `${criticalApprovalGaps.length} required approval${criticalApprovalGaps.length === 1 ? '' : 's'} missing`,
      weight: w,
      detail: criticalApprovalGaps.map(g => `${g.targetLabel} (${g.approverRole})`).join('; '),
    });
  }

  /* ── 4. Missing forms / evidence on critical domains ── */
  const missingForms = report.blockers.filter(b => b.kind === 'form' || b.kind === 'evidence');
  if (missingForms.length > 0) {
    const base = CRITICAL_DOMAINS.has(event.domain) ? 18 : 8;
    const w = Math.min(25, base + missingForms.length * 2);
    score += w;
    drivers.push({
      id: 'missing-evidence',
      label: `${missingForms.length} required form${missingForms.length === 1 ? '' : 's'} missing`,
      weight: w,
    });
  }

  /* ── 5. Minutes deficiency on meeting events ── */
  if (report.progress.minutesRequired && !report.progress.minutesFinalized) {
    const pastDue = report.timelineIssues.find(t => t.kind === 'minutes-past-due');
    const w = pastDue ? 15 : 8;
    score += w;
    drivers.push({ id: 'minutes', label: 'Meeting minutes not finalized', weight: w, detail: pastDue?.label });
  }

  /* ── 6. Dependency gap ── */
  const depBlockers = report.blockers.filter(b => b.kind === 'dependency');
  if (depBlockers.length > 0) {
    const w = Math.min(20, depBlockers.length * 12);
    score += w;
    drivers.push({ id: 'dependency', label: `${depBlockers.length} upstream event${depBlockers.length === 1 ? '' : 's'} open`, weight: w });
  }

  /* ── 7. Lock gives a slight negative signal — locked events are closed and stable. ── */
  if (report.isLocked) {
    score = Math.max(0, score - 15);
    drivers.push({ id: 'locked', label: 'Event is locked (post-approval immutability)', weight: -15 });
  }

  // Clamp
  score = Math.max(0, Math.min(100, Math.round(score)));

  /* ── 8. Band selection ── */
  let band: EnforcementRiskLevel = 'low';
  if (declared === 'critical' && (overdue || criticalApprovalGaps.length > 0 || missingForms.length > 0)) {
    band = 'immediate-jeopardy';
  } else if (score >= 55) band = 'high';
  else if (score >= 25) band = 'medium';

  const rationale =
    band === 'immediate-jeopardy'
      ? `Immediate jeopardy: ${declared}-risk event with ${overdue ? 'overdue status + ' : ''}${missingForms.length + criticalApprovalGaps.length} outstanding critical item(s).`
      : band === 'high'
        ? `High risk — top drivers: ${drivers.slice(0, 2).map(d => d.label).join(', ')}.`
        : band === 'medium'
          ? `Medium risk — ${drivers.length} driver(s) contributing.`
          : `Low risk — event is in good standing.`;

  return { eventId: event.id, score, band, drivers, rationale };
}

/** Batch roll-up. */
export interface AgencyRiskSummary {
  overall: EnforcementRiskLevel;
  score: number;
  counts: Record<EnforcementRiskLevel, number>;
  topDrivers: Array<{ label: string; count: number }>;
}

export function summarizeAgencyRisk(scores: RiskScore[]): AgencyRiskSummary {
  const counts: Record<EnforcementRiskLevel, number> = {
    'immediate-jeopardy': 0, 'high': 0, 'medium': 0, 'low': 0,
  };
  for (const s of scores) counts[s.band]++;

  const overall: EnforcementRiskLevel =
    counts['immediate-jeopardy'] > 0 ? 'immediate-jeopardy'
    : counts['high'] >= 3 ? 'high'
    : counts['high'] > 0 ? 'medium'
    : counts['medium'] > 5 ? 'medium'
    : 'low';

  const avg = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0;

  const driverCounts = new Map<string, number>();
  for (const s of scores) for (const d of s.drivers) {
    if (d.weight <= 0) continue;
    driverCounts.set(d.label, (driverCounts.get(d.label) ?? 0) + 1);
  }
  const topDrivers = Array.from(driverCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  return { overall, score: avg, counts, topDrivers };
}
