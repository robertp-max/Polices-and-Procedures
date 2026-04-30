import type { HelpArticle } from './index';

export const CALENDAR_ARTICLES: HelpArticle[] = [
  {
    slug: 'calendar-overview',
    title: 'Master Calendar — Overview',
    category: 'calendar',
    purpose:
      'The Master Calendar (/calendar) displays all compliance events for the current year, organized by type, domain, and SLA status.',
    whenToUse:
      'To view the full schedule of upcoming compliance obligations, navigate to individual events, and monitor SLA windows across all domains.',
    systemBehavior:
      'Calendar events are sourced from calendarStore (manually created), autogenStore (auto-generated annual and triggered events), and regulatoryExecutionStore (execution state). The view can be toggled between month-grid and list-view. Events are color-coded by audit state. Clicking an event opens its Event Workspace.',
    complianceImpact:
      'The calendar is the authoritative schedule surface for 42 CFR § 484 compliance obligations. Events not visible on the calendar may indicate an auto-generation failure — a compliance gap.',
    evidence:
      'Creating a calendar event logs CREATE_EVENT in the enforcementStore audit chain with event_id, workflow_id, policy_id, and actor. Completing events produces STEP_COMPLETE and EVENT_CERTIFIED entries.',
    related: {
      components: ['EventWorkspace', 'CommandCenterLayout'],
      workflows: ['GV-GB-001-WF', 'QA-QI-001-WF', 'CO-HIPAA-WF'],
    },
    complianceRequirement:
      'All events on the calendar correspond to regulatory obligations under CMS CoP 42 CFR Part 484. Annual events (Governing Body Meeting, QAPI, HIPAA Training, OSHA Review) are required by regulation. Supervisory visit events are required per-episode for each supervised discipline. Skipping or failing to schedule required events creates a compliance gap subject to CMS citation.',
    enforcementRules: [
      'Each event has a due date. After the due date with no certification, the audit state transitions to overdue.',
      'Events within 7 days of due date automatically enter sla_warning state.',
      'Events within 3 days of due date automatically enter sla_urgent state.',
      'Events that complete the grace period (3 days post-overdue) without certification are permanently marked overdue in the audit log.',
      'Events with unmet dependencies (prior quarter not certified) enter blocked state and cannot be started.',
    ],
    requiredActions: [
      'All scheduled events must be opened, completed, and certified by their due date.',
      'Evidence must be uploaded and accepted before certification is allowed.',
      'Approvals must be obtained from the required role before certification.',
    ],
    auditLogging:
      'user_id, role, timestamp, event_id, workflow_id, policy_id logged on: CREATE_EVENT, STEP_COMPLETE, EVIDENCE_UPLOAD, EVENT_APPROVED, EVENT_CERTIFIED, OVERRIDE_BLOCK.',
    failureImpact:
      'Uncompleted calendar events result in: overdue audit state, escalation queue entry, risk score increase (overdue=30%), CMS survey finding if discovered during inspection. Annual events not completed by year-end create a direct regulatory compliance gap for that obligation.',
    traceability: {
      policy_id:   'e.g., GV-GB-001',
      workflow_id: 'e.g., GV-GB-001-WF',
      event_id:    'e.g., governing_body_meeting-20260514-01',
      form_id:     'if a form is required (e.g., EN-FM-002)',
      evidence_id: 'generated when evidence is uploaded',
      audit_id:    'generated on each logged action',
    },
  },
  {
    slug: 'calendar-event-execution',
    title: 'Executing a Calendar Event',
    category: 'calendar',
    purpose:
      'Step-by-step: how to open, complete, and certify a compliance event from the calendar.',
    whenToUse:
      'When a scheduled compliance event is ready to be worked.',
    steps: [
      'Navigate to /calendar.',
      'Click the event card to open the Event Workspace.',
      'Review all steps in the workflow step list.',
      'Complete each step in order — some steps require form submissions, evidence uploads, or signatures.',
      'Upload required evidence in the Evidence Panel tab.',
      'Submit the event for approval once all steps are marked complete.',
      'After approval is granted, click Certify to lock the event record.',
    ],
    systemBehavior:
      'Steps must be completed in order (dependent steps are locked until predecessors complete). Evidence is validated for kind and file type before upload. Approval state transitions are enforced by role (only manager+ can approve). Certification is only possible when: all steps complete + all required evidence accepted + approval granted.',
    complianceImpact:
      'Certification locks the event as an immutable compliance record. Once certified_locked, the event cannot be edited — it is the final audit-defensible record.',
    evidence:
      'EVENT_CERTIFIED audit entry with actor, role, timestamp, event_id, workflow_id, policy_id.',
    related: {
      components: ['EventWorkspace', 'EvidencePanel', 'ApprovalFlow'],
    },
  },
  {
    slug: 'calendar-auto-generation',
    title: 'Auto-Generated Events',
    category: 'calendar',
    purpose:
      'Many required compliance events are auto-generated by the autogenStore scheduler, not manually created.',
    whenToUse:
      'When checking why a required annual event is or is not on the calendar.',
    systemBehavior:
      'autogenStore generates events from two schedulers: (1) Annual scheduler — creates events each January for the current compliance year (HIPAA training, OSHA review, QAPI meetings, Governing Body meetings). (2) Trigger scheduler — creates events in response to patient episode starts (Supervisory Visits, POC reviews). Generated events use the format: {event_type}-{YYYYMMDD}-{seq}.',
    complianceImpact:
      'If auto-generation fails (e.g., store not initialized, localStorage cleared), required annual events will not appear on the calendar. This is a compliance gap — the agency must detect and manually create missing events.',
    evidence:
      'AUTO_GEN_EVENT entries in autogenStore with event_id and trigger source.',
    related: {
      workflows: ['CO-HIPAA-WF', 'GV-GB-001-WF', 'QA-QI-001-WF'],
    },
  },
];
