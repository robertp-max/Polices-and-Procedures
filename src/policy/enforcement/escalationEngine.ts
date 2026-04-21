import { TODAY_ANCHOR, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { ApprovalRequest } from '@/policy/stores/regulatoryExecutionStore';
import type { Escalation, EnforcementReport } from './types';
import { resolveEscalationTarget } from './roleHierarchy';

/* ═══════════════════════════════════════════════════════════════
   Escalation Engine
   ----------------------------------------------------------------
   Deterministic escalation computation. Given events + enforcement
   reports + approval requests + a "now" timestamp, returns the set
   of escalations that SHOULD be open. The store materializes these
   by comparing to its current escalation list and raising/closing.
   ═══════════════════════════════════════════════════════════════ */

const DAY_MS = 86_400_000;

export interface EscalationInput {
  event: RegulatoryEvent;
  report: EnforcementReport;
  approvals: ApprovalRequest[];
  now?: Date;
}

export function computeEscalations(input: EscalationInput): Omit<Escalation, 'id'>[] {
  const { event, report, approvals } = input;
  const now = input.now ?? TODAY_ANCHOR;
  const nowIso = now.toISOString();
  const out: Omit<Escalation, 'id'>[] = [];

  /* ── A. Approval-rule escalations ── */
  const rules = event.approvals ?? [];
  for (const rule of rules) {
    if (!rule.required) continue;
    const matched = approvals.find(a =>
      a.targetKind === rule.targetKind &&
      a.targetLabel === rule.targetLabel &&
      a.status === 'approved',
    );
    if (matched) continue;

    const req = approvals.find(a =>
      a.targetKind === rule.targetKind &&
      a.targetLabel === rule.targetLabel &&
      a.status === 'pending',
    );
    const escalationWindow = rule.escalationDays ?? 5;
    const referenceMs = req
      ? new Date(req.requestedAt).getTime()
      : new Date(event.date + 'T00:00:00').getTime();
    const ageDays = Math.round((now.getTime() - referenceMs) / DAY_MS);
    if (ageDays > escalationWindow) {
      const toRole = resolveEscalationTarget(rule.approverRole, rule.escalateToRole);
      out.push({
        eventId: event.id,
        kind: 'approval',
        raisedAt: nowIso,
        fromRole: rule.approverRole,
        toRole,
        reason: `Approval for ${rule.targetLabel} has been pending ${ageDays} day(s); rule escalation window is ${escalationWindow} day(s).`,
        targetId: rule.id,
        status: 'open',
      });
    }
  }

  /* ── B. Overdue-event escalations ── */
  const overdue = report.timelineIssues.find(t => t.kind === 'overdue');
  if (overdue) {
    // Escalate to the owner's role first; after 7 days past cutoff, escalate upward.
    const fromRole = event.ownerRole;
    const toRole = overdue.daysPastOrUntil >= 7
      ? resolveEscalationTarget(fromRole)
      : fromRole;
    out.push({
      eventId: event.id,
      kind: 'overdue-event',
      raisedAt: nowIso,
      fromRole,
      toRole,
      reason: `Event is ${overdue.daysPastOrUntil} day(s) overdue.`,
      status: 'open',
    });
  }

  /* ── C. Follow-up window missed ── */
  if (event.followUps?.length) {
    const evMs = new Date(event.date + 'T00:00:00').getTime();
    for (const fu of event.followUps) {
      const windowDays = fu.escalationDays ?? 7;
      const dueMs = evMs + fu.dueOffsetDays * DAY_MS;
      const ageDays = Math.round((now.getTime() - dueMs) / DAY_MS);
      if (ageDays > windowDays) {
        out.push({
          eventId: event.id,
          kind: 'follow-up',
          raisedAt: nowIso,
          fromRole: fu.ownerRole,
          toRole: resolveEscalationTarget(fu.ownerRole, fu.escalateToRole),
          reason: `Follow-up "${fu.label}" is ${ageDays} day(s) past due. Closure criteria: ${fu.closureCriteria}`,
          targetId: fu.id,
          status: 'open',
        });
      }
    }
  }

  /* ── D. Missing-evidence on high-risk events ── */
  const missingEvidenceBlockers = report.blockers.filter(b => b.kind === 'form' || b.kind === 'evidence');
  if (missingEvidenceBlockers.length > 0 && (event.complianceFlags?.auditRisk === 'critical' || event.complianceFlags?.auditRisk === 'high')) {
    out.push({
      eventId: event.id,
      kind: 'missing-evidence',
      raisedAt: nowIso,
      fromRole: event.ownerRole,
      toRole: resolveEscalationTarget(event.ownerRole),
      reason: `${missingEvidenceBlockers.length} required artifact(s) missing on a ${event.complianceFlags?.auditRisk}-risk event.`,
      status: 'open',
    });
  }

  return out;
}
