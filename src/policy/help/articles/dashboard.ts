import type { HelpArticle } from './index';

export const DASHBOARD_ARTICLES: HelpArticle[] = [
  {
    slug: 'dashboard-overview',
    title: 'Command Center Dashboard — Overview',
    category: 'dashboard',
    purpose:
      'The Command Center Dashboard (/dashboard) is the primary hub showing all active compliance events, SLA status, risk scores, overdue tasks, and blocked workflows.',
    whenToUse:
      'Every session start. Use it to assess the current compliance posture before navigating to individual events or workflows.',
    systemBehavior:
      'Dashboard reads from calendarStore (event list), regulatoryExecutionStore (step/evidence state), enforcementStore (audit log / blocked state), and autogenStore (auto-generated events). All data is Zustand in-memory from localStorage. No live API call is made on dashboard load — the store is hydrated from localStorage on mount.',
    complianceImpact:
      'Provides real-time view of open compliance obligations. Late-action on dashboard signals constitutes delayed response to compliance requirements (42 CFR § 484.65, QAPI tracking obligations).',
    evidence:
      'Dashboard view is not itself logged. Individual actions taken from dashboard (opening events, certifying) produce audit entries.',
    related: {
      components: ['CommandCenterLayout', 'MasterControlInventory'],
      workflows: ['GV-GB-001-WF', 'QA-QI-001-WF'],
    },
    complianceRequirement:
      'The dashboard surfaces all compliance obligations required by CMS CoP § 484.65 (QAPI), § 484.80 (Supervisory Visits), and the agency\'s Governing Body Meeting schedule (GV-GB-001). It is the primary monitoring surface for coordinators, managers, and compliance officers.',
    enforcementRules: [
      'Overdue events (past due date, not certified) display in red and are escalated to the enforcementStore escalation queue.',
      'SLA_WARNING_DAYS = 7: events within 7 days of due date show orange warning.',
      'SLA_URGENT_DAYS = 3: events within 3 days show critical orange badge.',
      'SLA_GRACE_DAYS = 3: events can be certified up to 3 days after due date before being locked overdue.',
      'Blocked events display a "BLOCKED" badge and cannot be worked until the blocker is resolved.',
      'certified_locked events are immutable — no further state changes are possible.',
    ],
    requiredActions: [
      'Review all overdue events and take corrective action within the grace period.',
      'Review SLA warning events and assign completion tasks.',
      'Investigate blocked events and resolve dependencies.',
      'Confirm any escalation queue items are addressed by an admin or compliance officer.',
    ],
    auditLogging:
      'user_id, role, timestamp are logged on LOGIN (CRITICAL). Dashboard navigation itself is not separately logged. All event interactions (opening, completing steps, certifying) from the dashboard produce individual audit entries in enforcementStore with the relevant event_id, workflow_id, policy_id.',
    failureImpact:
      'Ignoring overdue events shown on the dashboard results in: (1) audit state transition to overdue, (2) escalation queue entry, (3) risk score increase (overdue weight = 30%), (4) potential CMS survey findings for untimely compliance record maintenance.',
    traceability: {
      policy_id:   'per event (e.g., GV-GB-001)',
      workflow_id: 'per event (e.g., GV-GB-001-WF)',
      event_id:    'per event (e.g., governing_body_meeting-20260514-01)',
      evidence_id: 'generated when evidence is uploaded for an event',
      audit_id:    'generated on each logged action',
    },
  },
  {
    slug: 'dashboard-risk-score',
    title: 'Understanding the Risk Score',
    category: 'dashboard',
    purpose:
      'The risk score (0–100) summarizes overall compliance posture. It is computed by riskScoring.ts from five weighted risk drivers.',
    whenToUse:
      'When a compliance officer or administrator needs a quick quantitative assessment of agency compliance health.',
    systemBehavior:
      'computeRiskScore(drivers: RiskDriver[]) → score 0–100. Weights: overdue=30%, evidence_gaps=25%, sla_warnings=20%, blocked=15%, uncertified=10%. Each driver is a normalized ratio of affected events to total events. Score is computed on every render from current store state.',
    complianceImpact:
      'Score > 40 triggers elevated-risk protocol. Score > 60 requires immediate compliance officer review. Score feeds the GET /api/audit/v2/projection endpoint which is checked by external auditors.',
    evidence:
      'Risk score calculation itself is not logged. The underlying state changes (overdue transitions, evidence submissions) that feed the score are each individually logged.',
    related: {
      components: ['AuditModePage'],
      endpoints: ['GET /api/audit/v2/projection'],
    },
    enforcementRules: [
      '0–20: Low risk — routine monitoring.',
      '21–40: Moderate — review SLA warnings.',
      '41–60: Elevated — escalate overdue events.',
      '61–100: Critical — immediate compliance officer review required.',
    ],
    auditLogging:
      'Risk score is not directly logged. Overdue event state transitions, evidence gap creation, and SLA breaches that contribute to score are logged with event_id, workflow_id, and actor.',
    failureImpact:
      'A persistently high risk score (>40 for 7+ days) indicates systemic compliance failure. During a CMS survey, a high risk score trajectory in the audit log is direct evidence of insufficient QAPI program performance.',
  },
  {
    slug: 'dashboard-howto',
    title: 'Using the Dashboard Day-to-Day',
    category: 'dashboard',
    purpose:
      'Step-by-step guide to triage and action items from the Command Center Dashboard each session.',
    whenToUse: 'Every working day before beginning compliance activities.',
    steps: [
      'Log in — the dashboard is your landing page at /dashboard.',
      'Check the risk score banner at the top. If > 40, prioritize addressing the listed drivers.',
      'Review OVERDUE events first (red cards). Open each and complete all outstanding steps.',
      'Review SLA WARNING events (orange). Assign completion tasks to the responsible staff.',
      'Review BLOCKED events. Identify the dependency blocking each event and resolve it.',
      'Check the Escalation Queue for any items requiring admin or compliance officer action.',
      'Review pending approvals — submit for approval any events where all steps are complete.',
    ],
    systemBehavior:
      'Color coding: Red = overdue. Orange = sla_warning or sla_urgent. Blue = in_progress. Green = certified_locked. Gray = scheduled. Clicking any event card navigates to the event\'s Event Workspace.',
    complianceImpact:
      'Daily dashboard review is the primary control for maintaining compliance posture within SLA windows.',
    evidence:
      'No artifact is generated by viewing the dashboard. Evidence is generated by the actions taken on individual events.',
    related: {
      components: ['CommandCenterLayout', 'EventWorkspace'],
    },
  },
];
