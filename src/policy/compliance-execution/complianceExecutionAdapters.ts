/* ═══════════════════════════════════════════════════════════════
   compliance-execution / ADAPTERS
   --------------------------------------------------------------
   Pure functions that map between Command Center primitives and
   CES primitives. No React, no stores — only inputs → outputs.
   ═══════════════════════════════════════════════════════════════ */

import type {
  RegulatoryEvent, RegulatoryDomain,
} from '@/policy/data/regulatoryEvents';
import type { AuditState, AuditEvaluation } from '@/policy/audit/auditState';
import type {
  ComplianceDomain, ComplianceState, AuditReadiness,
  EventCategory, WorkflowPhase, EvidenceStatus, RequiredSigner,
  Owner,
} from '@/policy/ces/types';
import type { MergedComplianceEvent, MergedExecutionUnit } from './complianceExecutionTypes';

/* ─── Domain mapping ─────────────────────────────────────── */
const DOMAIN_MAP: Record<RegulatoryDomain, ComplianceDomain> = {
  Governance:    'governance',
  QAPI:          'clinical',
  Clinical:      'clinical',
  Finance:       'compliance',
  'IT/Security': 'compliance',
  Operations:    'compliance',
  Risk:          'compliance',
  Compliance:    'compliance',
  Holiday:       'compliance',
};

export function mapDomain(d: RegulatoryDomain): ComplianceDomain {
  return DOMAIN_MAP[d] ?? 'compliance';
}

/* ─── Cadence → CES event category ───────────────────────── */
export function mapCategory(ev: RegulatoryEvent): EventCategory {
  const c = ev.cadence;
  if (c === 'Trigger-based') return 'trigger_based';
  if (c === 'Triennial')     return 'triennial_governance';
  if (c === 'Biennial' || c === 'Semiannual') return 'multi_year_governance';
  if (c === 'Monthly' || c === 'Quarterly' || c === 'Weekly' || c === 'Biweekly') return 'recurring';
  if (c === 'Annual')        return 'mandated';
  return 'mandated';
}

/* ─── AuditState → CES projection ────────────────────────── */
export function auditStateToReadiness(state: AuditState): AuditReadiness {
  switch (state) {
    case 'certified-locked':
    case 'audit-ready':
      return 'ready';
    case 'complete-missing-evidence':
    case 'complete-pending-approval':
    case 'at-risk':
      return 'partial';
    default:
      return 'not_ready';
  }
}

export function auditStateToComplianceState(state: AuditState): ComplianceState {
  switch (state) {
    case 'certified-locked':           return 'completed';
    case 'audit-ready':                return 'awaiting_signature';
    case 'complete-pending-approval':  return 'awaiting_signature';
    case 'complete-missing-evidence':  return 'blocked';
    case 'not-certifiable':            return 'blocked';
    case 'blocked':                    return 'blocked';
    case 'overdue':                    return 'blocked';
    case 'at-risk':                    return 'in_progress';
    case 'in-progress':                return 'in_progress';
    default:                           return 'upcoming';
  }
}

export function auditStateToWorkflowPhase(state: AuditState): WorkflowPhase {
  switch (state) {
    case 'certified-locked':            return 'audit';
    case 'audit-ready':                 return 'signature';
    case 'complete-pending-approval':   return 'review';
    case 'complete-missing-evidence':   return 'documentation';
    case 'in-progress':                 return 'documentation';
    case 'at-risk':                     return 'documentation';
    case 'blocked':                     return 'documentation';
    case 'overdue':                     return 'documentation';
    case 'not-certifiable':             return 'review';
    default:                            return 'preparation';
  }
}

/* ─── Owner synthesis from RegulatoryEvent ───────────────── */
function initialsOf(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '—';
}
export function regulatoryOwner(ev: RegulatoryEvent): Owner {
  return {
    userId:   `owner:${ev.owner.replace(/\s+/g, '_').toLowerCase()}`,
    name:     ev.owner,
    initials: initialsOf(ev.owner),
    role:     ev.ownerRole,
  };
}

/* ─── Evidence projection from store snapshot ────────────── */
export interface ExecutionStoreSnapshot {
  formStates:    Record<string, { status: string }>;
  approvals:     { eventId: string; status: 'pending' | 'approved' | 'rejected' }[];
  certifications:Record<string, unknown>;
  isEventComplete: (id: string) => boolean;
  isCertified:     (id: string) => boolean;
}

export function projectEvidence(ev: RegulatoryEvent, snap: ExecutionStoreSnapshot): EvidenceStatus {
  const required = ev.requiredForms ?? [];
  const total = required.length;
  let complete = 0;
  const missing: string[] = [];
  for (const f of required) {
    const key = `${ev.id}::${f.id}`;
    const seedComplete = f.status === 'complete';
    const overrideStatus = snap.formStates[key]?.status;
    const status = overrideStatus ?? (seedComplete ? 'complete' : f.status);
    if (status === 'complete') complete += 1; else missing.push(f.id);
  }
  const approvalsForEvent = snap.approvals.filter(a => a.eventId === ev.id);
  const sigsRequired = (ev.approvals?.length ?? 0) || approvalsForEvent.length;
  const sigsComplete = approvalsForEvent.filter(a => a.status === 'approved').length;
  return {
    requiredFormsTotal:    total,
    requiredFormsComplete: complete,
    missingFormIds:        missing,
    signaturesRequired:    sigsRequired,
    signaturesComplete:    sigsComplete,
    auditIndexCreated:     snap.isCertified(ev.id),
  };
}

/* ─── Required signers projection ────────────────────────── */
export function projectSigners(ev: RegulatoryEvent, snap: ExecutionStoreSnapshot): RequiredSigner[] {
  const rules = ev.approvals ?? [];
  const certified = snap.isCertified(ev.id);
  const approvalsForEvent = snap.approvals.filter(a => a.eventId === ev.id);
  return rules.map((r, idx) => {
    const decision = approvalsForEvent[idx];
    const signed = certified || decision?.status === 'approved';
    const role = (r as unknown as { approverRole?: string; role?: string }).approverRole
              ?? (r as unknown as { role?: string }).role
              ?? 'Approver';
    return {
      userId:   `role:${role.replace(/\s+/g, '_').toLowerCase()}`,
      name:     role,
      initials: initialsOf(role),
      role,
      status:   signed ? 'signed' : 'pending',
    };
  });
}

/* ─── RegulatoryEvent → ComplianceEvent (projection) ─────── */
export function regulatoryEventToComplianceEvent(ev: RegulatoryEvent): MergedComplianceEvent {
  return {
    id:          ev.id,
    title:       ev.title,
    category:    mapCategory(ev),
    domain:      mapDomain(ev.domain),
    anchorDate:  ev.date,
    source:      'regulatory',
    regulatoryRef: ev,
  };
}

/* ─── RegulatoryEvent + state → ExecutionUnit (rolled-up) ── */
export function deriveExecutionUnit(
  ev:         RegulatoryEvent,
  evaluation: AuditEvaluation,
  snap:       ExecutionStoreSnapshot,
): MergedExecutionUnit {
  const owner = regulatoryOwner(ev);
  const signers = projectSigners(ev, snap);
  const evidence = projectEvidence(ev, snap);
  const complianceState = auditStateToComplianceState(evaluation.primary);
  const workflowPhase   = auditStateToWorkflowPhase(evaluation.primary);
  const auditReadiness  = auditStateToReadiness(evaluation.primary);
  const blockedReason = complianceState === 'blocked'
    ? (evidence.missingFormIds.length > 0
        ? { kind: 'missing_form' as const, label: `Missing Form (${evidence.missingFormIds[0]})`, resourceId: evidence.missingFormIds[0] }
        : evaluation.flags.includes('approval-missing')
          ? { kind: 'missing_signature' as const, label: 'Missing Approval' }
          : evaluation.flags.includes('dependency-risk')
            ? { kind: 'dependency_incomplete' as const, label: 'Dependency Incomplete' }
            : { kind: 'awaiting_external_input' as const, label: 'Awaiting External Input' })
    : undefined;
  return {
    id:               `eu:${ev.id}`,
    title:            ev.title,
    parentEventId:    ev.id,
    workflowId:       `wf:${ev.id}`,
    workflowPhase,
    complianceState,
    auditReadiness,
    owner,
    approver:         owner,
    signatureOwner:   owner,
    requiredSigners:  signers,
    blockedReason,
    dueDate:          ev.date,
    escalationTimer:  -evaluation.slaDaysPastDue * 24 || undefined,
    evidenceStatus:   evidence,
    domain:           mapDomain(ev.domain),
    source:           'regulatory',
    regulatoryRef:    ev,
  };
}
