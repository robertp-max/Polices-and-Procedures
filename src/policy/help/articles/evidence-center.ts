import type { HelpArticle } from './index';

export const EVIDENCE_CENTER_ARTICLES: HelpArticle[] = [
  {
    slug: 'evidence-center-overview',
    title: 'Evidence Center — Overview',
    category: 'evidence-center',
    purpose:
      'The Evidence Center (/evidence) provides a centralized view of all evidence documents across all compliance events — showing submitted, accepted, and rejected evidence with the ability to review and take action.',
    whenToUse:
      'When a manager or admin needs to review pending evidence submissions across multiple events, or when an auditor needs to locate all evidence for a specific compliance period.',
    systemBehavior:
      'Evidence records are sourced from regulatoryExecutionStore. Each record has: doc_id, event_id, kind, status (staged|submitted|accepted|rejected), uploadedBy, uploadedAt, acceptedBy?, acceptedAt?, rejectedReason?. Evidence is displayed in filterable panels by status. Accepted evidence is immutable — no state change is possible after acceptance.',
    complianceImpact:
      'Evidence records are the primary documentary support for compliance certifications. Without accepted evidence, events cannot be certified. CMS surveyors inspect evidence packages during surveys.',
    evidence:
      'EVIDENCE_UPLOAD, EVIDENCE_ACCEPTED, EVIDENCE_REJECTED audit entries logged with doc_id, event_id, actor, role, timestamp.',
    related: {
      components: ['EvidencePanel'],
      endpoints: ['POST /api/ecign/evidence', 'PATCH /api/ecign/evidence/:docId/accept'],
      workflows: ['GV-GB-001-WF', 'QA-QI-001-WF'],
    },
    complianceRequirement:
      'Evidence is required by CMS CoP 42 CFR Part 484 to demonstrate compliance with required activities (Governing Body meetings, QAPI reviews, supervisory visits, training). Evidence must be: (1) uploaded by the responsible party, (2) reviewed and accepted by a qualified reviewer (manager or admin), and (3) linked to the specific compliance event and policy.',
    enforcementRules: [
      'Evidence in "submitted" status cannot be counted as accepted until explicitly reviewed.',
      'Accepted evidence cannot be modified, deleted, or superseded — it is immutable.',
      'Rejected evidence can be replaced by a new upload with a corrected document.',
      'An event cannot be certified if required evidence has not been accepted.',
      'Evidence must match the required kind (e.g., meeting_minutes, attendance_sheet, signed_form) for the event step.',
    ],
    requiredActions: [
      'Managers must review all submitted evidence within 24 hours of submission (per agency policy).',
      'Rejected evidence must include a written rejection reason.',
      'The submitter must be notified of rejection and given opportunity to resubmit.',
      'All required evidence kinds must be accepted before event certification.',
    ],
    auditLogging:
      'Logged fields per evidence action: user_id, role, timestamp, doc_id, event_id, workflow_id, policy_id, kind, action (UPLOAD/ACCEPT/REJECT), reason (on reject).',
    failureImpact:
      'If evidence is not submitted or accepted: (1) event cannot be certified, (2) event transitions to overdue after due date, (3) escalation queue entry is created, (4) risk score increases (evidence_gaps weight = 25%), (5) CMS survey packet is incomplete.',
    traceability: {
      policy_id:   'linked via the compliance event the evidence supports',
      workflow_id: 'linked via the compliance event',
      event_id:    'required field on every evidence record',
      form_id:     'present if the evidence is a signed form (via eCIgn)',
      evidence_id: 'doc_id — generated on upload',
      audit_id:    'generated on each UPLOAD/ACCEPT/REJECT action',
    },
  },
  {
    slug: 'evidence-lifecycle',
    title: 'Evidence Lifecycle: Upload → Validate → Accept → Lock',
    category: 'evidence-center',
    purpose:
      'Understand the full lifecycle of an evidence document from upload to immutable acceptance.',
    whenToUse:
      'When troubleshooting evidence status, understanding why an event cannot be certified, or preparing for audit.',
    steps: [
      'Staff uploads file in Event Workspace → Evidence Panel. Evidence status: submitted.',
      'Manager receives notification: "Evidence pending review."',
      'Manager opens Evidence Center or Event Workspace, reviews the document.',
      'Manager clicks Accept → status changes to accepted. This is IMMUTABLE.',
      'If manager clicks Reject → status changes to rejected. Rejection reason is required.',
      'Staff receives rejection notification, uploads corrected document → new doc_id, status: submitted.',
      'After all required evidence is accepted → event becomes certifiable.',
    ],
    systemBehavior:
      'Accepted evidence: PATCH /api/ecign/evidence/:docId/accept sets status=accepted, records acceptedBy and acceptedAt. No further PATCH operations are accepted for that doc_id. Rejected evidence: PATCH /api/ecign/evidence/:docId/reject sets status=rejected with reason. A new evidence doc with a new doc_id can be submitted as replacement.',
    complianceImpact:
      'The immutability of accepted evidence ensures the compliance record cannot be retroactively altered. This satisfies HIPAA 45 CFR § 164.312(c)(1) integrity controls.',
    evidence:
      'doc_id generated on upload; EVIDENCE_ACCEPTED entry with doc_id, event_id, acceptedBy, timestamp.',
    related: {
      endpoints: ['PATCH /api/ecign/evidence/:docId/accept', 'PATCH /api/ecign/evidence/:docId/reject'],
    },
  },
];
