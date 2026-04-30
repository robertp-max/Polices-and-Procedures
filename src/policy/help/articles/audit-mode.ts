import type { HelpArticle } from './index';

export const AUDIT_MODE_ARTICLES: HelpArticle[] = [
  {
    slug: 'audit-mode-overview',
    title: 'Audit Mode — Overview',
    category: 'audit-mode',
    purpose:
      'Audit Mode (/audit) provides admins, super_admins, and auditors with a real-time compliance posture view: risk scoring, audit state machine, event chain verification, escalation queue, and direct access to the append-only audit log.',
    whenToUse:
      'Before a CMS survey. When investigating a compliance incident. For regular compliance officer reviews. When verifying audit chain integrity.',
    systemBehavior:
      'Audit Mode reads from: enforcementStore (audit log, escalations, lock state), regulatoryExecutionStore (event completion states), and the server GET /api/audit/events + GET /api/audit/v2/projection endpoints. The 9-state audit FSM (auditState.ts) governs each event\'s audit lifecycle. Risk scoring (riskScoring.ts) computes the 0–100 aggregate score.',
    complianceImpact:
      'Audit Mode is the primary compliance officer review surface. The risk score and FSM states it displays are what an external auditor would review during a CMS survey. Unaddressed escalations in Audit Mode are direct evidence of inadequate compliance program oversight.',
    evidence:
      'CHAIN_VERIFIED audit entry logged on every chain verification run. Escalation resolution logged as ESCALATION_RESOLVED with resolver identity and outcome.',
    related: {
      components: ['MasterControlInventory'],
      endpoints: ['GET /api/audit/events', 'POST /api/audit/verify-chain', 'GET /api/audit/v2/projection'],
    },
    complianceRequirement:
      'Audit Mode satisfies the monitoring requirements of HIPAA § 164.312(b) (Audit Controls) and CMS CoP § 484.65 (QAPI monitoring). Compliance officers are required to review audit posture regularly and address escalated items. The hash chain must be verified to confirm record integrity.',
    enforcementRules: [
      'Only admin, super_admin, and auditor roles can access Audit Mode.',
      'Audit log entries are append-only — no modification or deletion is possible.',
      'Chain verification failures indicate data tampering — must be escalated immediately.',
      'Escalation queue items must be actioned within the SLA window defined by agency policy.',
      'Force-unlock of certified_locked events requires super_admin + written justification.',
    ],
    requiredActions: [
      'Run chain verification weekly (or before any survey).',
      'Review and resolve all escalation queue items.',
      'Review risk score weekly and address any driver contributing to score > 20.',
      'Export audit event log for external review as needed.',
    ],
    auditLogging:
      'user_id, role, timestamp logged on: ACCESS_AUDIT_MODE, CHAIN_VERIFY, ESCALATION_RESOLVE, FORCE_UNLOCK. All actions in Audit Mode are themselves logged to the audit chain.',
    failureImpact:
      'If Audit Mode shows a broken chain: (1) compliance records may be inadmissible, (2) CMS survey packet integrity is compromised, (3) HIPAA breach investigation may be required. If escalations are unresolved: (1) SLA violations compound, (2) risk score increases, (3) agency liability increases.',
    traceability: {
      policy_id:   'per event under review',
      workflow_id: 'per event under review',
      event_id:    'per event under review',
      evidence_id: 'per evidence document reviewed',
      audit_id:    'generated on each audit mode action',
    },
  },
  {
    slug: 'audit-fsm-states',
    title: 'Audit State Machine — 9 States Explained',
    category: 'audit-mode',
    purpose:
      'Every compliance event progresses through a 9-state FSM defined in auditState.ts. Understanding these states is essential for compliance officers and auditors.',
    whenToUse:
      'When reviewing event status in Audit Mode or diagnosing why an event cannot be certified or worked.',
    systemBehavior:
      'States: scheduled → in_progress → sla_warning (7d) → sla_urgent (3d) → overdue. Parallel: blocked (dependency unmet). Terminal: certified_locked. Special: grace_period (3d post-overdue certification window), audit_ready (ready for auditor review). Transitions are driven by due-date proximity, dependency checks, and manual actions (certification, overrides).',
    complianceImpact:
      'FSM states directly map to compliance risk levels. The overdue state indicates a missed regulatory obligation. certified_locked is the only terminal state — it means the record is final and defensible.',
    evidence:
      'State transitions are logged in enforcementStore with from_state, to_state, event_id, actor, timestamp.',
    related: {
      components: ['AuditModePage'],
      workflows: ['GV-GB-001-WF', 'QA-QI-001-WF'],
    },
    enforcementRules: [
      'scheduled: event exists but work has not started.',
      'in_progress: at least one step has been completed.',
      'sla_warning: event due in ≤7 days (SLA_WARNING_DAYS=7).',
      'sla_urgent: event due in ≤3 days (SLA_URGENT_DAYS=3).',
      'overdue: event is past its due date and not certified.',
      'blocked: a prerequisite event has not been certified.',
      'certified_locked: event is complete, certified, and immutable.',
      'grace_period: overdue event is within 3 days of deadline (SLA_GRACE_DAYS=3).',
      'audit_ready: all steps and evidence complete, pending auditor review.',
    ],
  },
];
