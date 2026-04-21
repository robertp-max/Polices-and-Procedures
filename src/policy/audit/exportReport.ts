import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EnforcementReport, AuditEntry } from '@/policy/enforcement/types';
import type { RiskScore, AgencyRiskSummary } from './riskScoring';

/* ═══════════════════════════════════════════════════════════════
   Audit Export
   ----------------------------------------------------------------
   Produces two surveyor-ready artifacts:
     - a JSON bundle (full event + report + audit log per event)
     - a plaintext / markdown "Audit Packet" suitable for print
   The JSON bundle can be saved and later re-imported for evidence.
   ═══════════════════════════════════════════════════════════════ */

export interface AuditBundle {
  generatedAt: string;
  summary: AgencyRiskSummary;
  events: Array<{
    event: RegulatoryEvent;
    report: EnforcementReport;
    risk: RiskScore;
    auditLog: AuditEntry[];
  }>;
}

export function buildAuditBundle(args: {
  summary: AgencyRiskSummary;
  events: RegulatoryEvent[];
  reports: Record<string, EnforcementReport>;
  risks:   Record<string, RiskScore>;
  logsByEvent: Record<string, AuditEntry[]>;
}): AuditBundle {
  return {
    generatedAt: new Date().toISOString(),
    summary: args.summary,
    events: args.events.map(ev => ({
      event: ev,
      report: args.reports[ev.id],
      risk: args.risks[ev.id],
      auditLog: args.logsByEvent[ev.id] ?? [],
    })),
  };
}

export function bundleToMarkdown(bundle: AuditBundle): string {
  const header = [
    `# Regulatory Audit Packet`,
    `Generated: ${new Date(bundle.generatedAt).toLocaleString()}`,
    ``,
    `## Agency Summary`,
    `- Overall Risk: **${bundle.summary.overall.toUpperCase()}**`,
    `- Weighted Risk Score: **${bundle.summary.score}/100**`,
    `- Immediate Jeopardy: ${bundle.summary.counts['immediate-jeopardy']}`,
    `- High-Risk Events: ${bundle.summary.counts.high}`,
    `- Medium-Risk Events: ${bundle.summary.counts.medium}`,
    `- Low-Risk Events: ${bundle.summary.counts.low}`,
    ``,
    `### Top Risk Drivers`,
    ...bundle.summary.topDrivers.map(d => `- ${d.label} (${d.count})`),
    ``,
  ];

  const bodies = bundle.events.map(({ event, report, risk, auditLog }) => {
    const blockers = report.blockers.length
      ? report.blockers.map(b => `  - [${b.severity.toUpperCase()}] ${b.label} — ${b.remediation}`).join('\n')
      : '  - (none)';
    const approvals = report.approvalGaps.length
      ? report.approvalGaps.map(g => `  - ${g.targetLabel} · ${g.approverRole}${g.escalateToRole ? ` → ${g.escalateToRole}` : ''} · ${g.status}`).join('\n')
      : '  - (complete)';
    const trail = auditLog.slice(0, 25)
      .map(a => `  - ${new Date(a.ts).toISOString()} · ${a.actor} (${a.actorRole ?? '—'}) · ${a.action}${a.targetKind ? ` · ${a.targetKind}${a.targetId ? `:${a.targetId}` : ''}` : ''}${a.reason ? ` · ${a.reason}` : ''}`)
      .join('\n') || '  - (no activity)';

    return [
      `---`,
      `## ${event.title}`,
      `- Event ID: \`${event.id}\``,
      `- Domain: ${event.domain}${event.category ? ` · ${event.category}` : ''}`,
      `- Date: ${event.date}${event.time ? ` ${event.time}` : ''}`,
      `- Owner: ${event.owner} (${event.ownerRole})`,
      `- Regulatory Driver: ${event.regulatoryDriver ?? '—'}`,
      `- Citation: ${event.complianceFlags?.citation ?? '—'}`,
      `- Locked: ${report.isLocked ? 'yes' : 'no'}`,
      ``,
      `### Risk`,
      `- Score: **${risk.score}/100**`,
      `- Band: **${risk.band.toUpperCase()}**`,
      `- Rationale: ${risk.rationale}`,
      ``,
      `### Progress`,
      `- Workflow: ${report.progress.stepsComplete}/${report.progress.stepsTotal}`,
      `- Forms: ${report.progress.formsComplete}/${report.progress.formsTotal}`,
      `- Evidence docs: ${report.progress.evidenceCount}`,
      `- Minutes: ${report.progress.minutesRequired ? (report.progress.minutesFinalized ? 'finalized' : 'pending') : 'not required'}`,
      ``,
      `### Blockers`,
      blockers,
      ``,
      `### Approval Gaps`,
      approvals,
      ``,
      `### Audit Trail (most recent 25)`,
      trail,
      ``,
    ].join('\n');
  });

  return header.concat(bodies).join('\n');
}

export function downloadBlob(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
