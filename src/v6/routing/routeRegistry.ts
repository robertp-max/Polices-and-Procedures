export type V6RouteGroup =
  | 'Admin'
  | 'Auth'
  | 'CES'
  | 'Onboarding'
  | 'Onboarding v2'
  | 'Overview'
  | 'System'
  | 'Taxonomy';

export type V6RouteTemplate =
  | 'achc-crosswalk'
  | 'achc-survey'
  | 'board'
  | 'calendar'
  | 'chat'
  | 'dashboard'
  | 'detail'
  | 'docs'
  | 'ecign'
  | 'evidence'
  | 'form-viewer'
  | 'framework'
  | 'journey'
  | 'lifecycle'
  | 'login'
  | 'matrix'
  | 'module-player'
  | 'packet-studio'
  | 'profiles'
  | 'reference-viewer'
  | 'reports'
  | 'ai-review';

export interface V6RouteDefinition {
  description: string;
  group: V6RouteGroup;
  hashId: string;
  path: string;
  template: V6RouteTemplate;
  title: string;
}

export const V6_ROUTES = [
  { path: '/dashboard', hashId: 'dashboard', template: 'dashboard', group: 'Overview', title: 'Dashboard', description: 'Overview command surface.' },
  { path: '/clinicians', hashId: 'clinicians', template: 'profiles', group: 'Overview', title: 'Clinicians', description: 'Clinician roster with caseload and credential posture.' },
  { path: '/clinicians/:clinicianId', hashId: 'clinician-detail', template: 'detail', group: 'Overview', title: 'Clinician Detail', description: 'Clinician credential, caseload, training, and documentation detail.' },
  { path: '/patients', hashId: 'patients', template: 'profiles', group: 'Overview', title: 'Patients', description: 'Patient roster with clinical focus and schedule gaps.' },
  { path: '/patients/:patientId', hashId: 'patient-detail', template: 'detail', group: 'Overview', title: 'Patient Detail', description: 'Patient care-plan status, coverage alerts, risk, and evidence detail.' },
  { path: '/calendar', hashId: 'master-calendar', template: 'calendar', group: 'Overview', title: 'Master Calendar', description: 'Agency operations calendar for SOC starts, audits, staffing, and checkpoints.' },
  { path: '/staffing-calendar', hashId: 'staffing-calendar', template: 'calendar', group: 'Overview', title: 'Staffing Calendar', description: 'Staffing calendar for visit conflicts, clinician availability, and coverage.' },
  { path: '/iadministrator', hashId: 'brad', template: 'chat', group: 'Overview', title: 'iAdministrator', description: 'Brad decision-support workspace for policy and operations questions.' },
  { path: '/brad/builder', hashId: 'brad-builder', template: 'chat', group: 'Overview', title: 'Brad Builder', description: 'Super Admin builder tools for users, permissions, reusable reports, OTPs, cloud updates, and component requests.' },
  { path: '/ces/calendar', hashId: 'ces-calendar', template: 'calendar', group: 'CES', title: 'CES Calendar', description: 'Sprint compliance calendar for mandatory events, evidence windows, signature cutoffs, and survey packet milestones.' },
  { path: '/ces/board', hashId: 'ces-board', template: 'board', group: 'CES', title: 'CES Board', description: 'Operational Kanban board for sprint execution, blockers, evidence, signatures, and owner handoffs. Includes dedicated "Awaiting Action / Evidence" column for review events (QAPI, Infection Control, Incident/Adverse, Grievance, Audit).' },
  // Design cross-ref (Agent 15): All CES routes align to V6_DESIGN.html ~1308 (CES views),
  // V6_DESIGN_RECONCILIATION.md (most MATCHED_REFERENCE; see also events-board, evidence-center).
  // Integration proposals (Agent 21): Link ces-board CTAs to evidence-center (per design future notes); ensure reports pull from controls/evidence projections; consistent navigation in CES group.
  // Agent 21 read-only gap vs design analysis: Routes + CES nav group + descriptions are present and match design. However, actual interactive cross-view wiring (BoardLane onCardClick / CTAs in BoardScreen for ces-board → /evidence or /workflow-swimlane) is not implemented in the prototype (BoardScreen renders BoardLane without onCardClick; design notes "Future: link CTAs..."). Calendar has some event→swimlane nav, but full CES-internal integration (board↔evidence↔reports↔calendar) remains partial for one-pass. See RepresentativeScreens BoardScreen and ces-board case.
  { path: '/ces/events', hashId: 'events-board', template: 'board', group: 'CES', title: 'Events Board', description: 'Risk-bucketed Events board matching live 4-col layout (Critical & Overdue 162, At Risk 4). Uses identical item data, owner/domain/due, progress, chips, meta. Sorted by due. New card design applied.' },
  { path: '/workflows', hashId: 'workflows', template: 'matrix', group: 'CES', title: 'Workflows', description: 'Workflow library linking domains, policies, evidence, forms, and history.' },
  { path: '/workflows/:workflowId', hashId: 'workflow-detail', template: 'detail', group: 'CES', title: 'Workflow Detail', description: 'Workflow detail page for reference metadata and navigation to swimlane.' },
  { path: '/workflows/:workflowId/swimlane', hashId: 'workflow-swimlane', template: 'board', group: 'CES', title: 'Workflow Swimlane', description: 'Workflow swimlane for intake, evidence, review, signature, and lock steps (reference or event execution context).' },
  { path: '/events/:eventId/swimlane', hashId: 'workflow-swimlane', template: 'board', group: 'CES', title: 'Workflow Swimlane', description: 'Event workflow swimlane for the selected event occurrence and workflow.' },
  { path: '/compliance/master-controls', hashId: 'master-controls', template: 'matrix', group: 'CES', title: 'Master Controls', description: 'Regulatory control matrix mapped to risk, evidence, and readiness.' },
  { path: '/audit', hashId: 'audit-mode', template: 'evidence', group: 'CES', title: 'Audit Mode', description: 'Read-only audit review surface for missing evidence and packet checks.' },
  { path: '/evidence', hashId: 'defensible-2', template: 'evidence', group: 'CES', title: 'DefenCIble', description: 'DefenCIble evidence packet studio for source selection, packet generation, preview, export, and Drive sync.' },
  { path: '/evidence/intake', hashId: 'evidence-intake', template: 'evidence', group: 'CES', title: 'Brad Evidence Intake', description: 'Brad Evidence Intake inside Evidence Center: upload source exports, resolve created-date filing, classify and dedupe, file to Drive, run full-population review, and prepare draft forms, agendas, tasks, and packets for human approval.' },
  { path: '/evidence/packet-studio', hashId: 'evidence-packet-studio', template: 'evidence', group: 'CES', title: 'Evidence Packet Studio', description: 'Brad-assisted evidence packet generator inside Evidence Center for event packets, source mapping, preview, and export readiness.' },
  { path: '/packet-studio', hashId: 'packet-studio', template: 'packet-studio', group: 'CES', title: 'Packet Studio', description: 'Universal mandated-event packet studio for template selection and compatible CES event selection.' },
  { path: '/evidence/defensible-2', hashId: 'defensible-2', template: 'evidence', group: 'CES', title: 'Defensible 2.0', description: 'Live cloned DefenCIble view for side-by-side iteration.' },
  { path: '/evidence/admission-packet-preview', hashId: 'admission-packet-preview', template: 'evidence', group: 'CES', title: 'Patient Admission Packet Preview', description: 'DefenCIble preview route for the fixed multi-page patient admission packet template.' },
  { path: '/ces/reports', hashId: 'ces-reports', template: 'reports', group: 'CES', title: 'CES Reports', description: 'Compliance Execution reports for posture, packets, approvals, and throughput.' },
  { path: '/compliance/review', hashId: 'ai-compliance-review', template: 'ai-review', group: 'CES', title: 'AI Compliance Review', description: 'Controlled Vertex AI / Gemini harness for secure evidence, admission packet, and compliance review with PHI guardrails and hash-chain audit.' },
  { path: '/calendar/event/:eventId/task/:taskId', hashId: 'mobile-incident', template: 'detail', group: 'CES', title: 'Mobile Incident', description: 'Mobile task execution surface for evidence capture and field completion.' },
  { path: '/my-tasks', hashId: 'my-tasks', template: 'board', group: 'CES', title: 'My Tasks', description: 'Personal task board for assigned compliance and operations work.' },
  { path: '/pm/my-tasks', hashId: 'pm-my-tasks', template: 'board', group: 'CES', title: 'PM My Tasks', description: 'PM personal task board (V1 parity).' },
  { path: '/pm/sprint-plan', hashId: 'pm-sprint-plan', template: 'board', group: 'CES', title: 'PM Sprint Plan', description: 'Capacity-aware sprint planner, allocator, rollover (V1 parity).' },
  { path: '/pm/sprint-review', hashId: 'pm-sprint-review', template: 'reports', group: 'CES', title: 'PM Sprint Review', description: 'Sprint retrospective, per-assignee delivery, carry-over (V1 parity).' },
  { path: '/pm/approvals', hashId: 'pm-approvals', template: 'board', group: 'Taxonomy', title: 'PM Approvals', description: 'Approvals queue for tasks in_review (V1 parity).' },
  { path: '/pm/dashboard', hashId: 'pm-dashboard', template: 'reports', group: 'CES', title: 'PM Dashboard', description: 'PM sprint burndown, throughput, status mix (V1 parity).' },
  { path: '/framework', hashId: 'framework', template: 'framework', group: 'Taxonomy', title: 'Framework', description: 'Regulatory framework map for domains, policies, forms, workflows, and authorities.' },
  { path: '/taxonomy', hashId: 'taxonomy', template: 'framework', group: 'Taxonomy', title: 'Taxonomy', description: 'Regulatory framework taxonomy (V1 alias to Framework for domains, policies, forms, workflows, and authorities).' },
  { path: '/framework/achc-survey', hashId: 'achc-survey', template: 'achc-survey', group: 'Taxonomy', title: 'ACHC Survey', description: 'ACHC survey alignment surface for policy support and open evidence gaps.' },
  { path: '/framework/achc-survey/crosswalk', hashId: 'achc-crosswalk', template: 'achc-crosswalk', group: 'Taxonomy', title: 'ACHC Crosswalk', description: 'ACHC, CMS, Title 22, policy, form, and evidence crosswalk.' },
  { path: '/framework/hh-evidence-map', hashId: 'hh-evidence-map', template: 'matrix', group: 'Taxonomy', title: 'HH Tag Evidence Map', description: 'Spreadsheet-backed HH standard to policy section evidence map with anchors, confidence, duplicates, and review flags.' },
  { path: '/library', hashId: 'policy-home', template: 'dashboard', group: 'Taxonomy', title: 'Policy Home', description: 'Policy command center connecting the library, forms, workflows, taxonomy, ACHC alignment, and readiness actions.' },
  { path: '/library/policies', hashId: 'policy-library', template: 'matrix', group: 'Taxonomy', title: 'Policy Library', description: 'Policy library matrix for active agency policies and survey-ready context.' },
  { path: '/library/:policyId', hashId: 'policy-detail', template: 'detail', group: 'Taxonomy', title: 'Policy Detail', description: 'Policy detail with version metadata, required codes, section tabs, and appendices.' },
  { path: '/policy-approvals', hashId: 'policy-approvals', template: 'board', group: 'Taxonomy', title: 'Policy Approvals', description: 'Policy approval queue for lifecycle review, approval authority, and publication readiness.' },
  // Protected policy print route — reuses policy-detail hashId so existing PolicyDetailScreen
  // (which resolves real policyId via getCorpusPolicy + getPolicyContent from seeds) renders
  // the record. Enables openPolicyPrintRoute + browser print / PDF without view changes.
  { path: '/library/:policyId/print', hashId: 'policy-detail', template: 'detail', group: 'Taxonomy', title: 'Policy Print', description: 'Protected policy print view (resolves real policyId from seeds).' },
  // Legacy V1 /print/:policyId support for direct /print/:id (and openPolicyPrintRoute compatibility).
  // Renders the same PolicyDetailScreen (real corpus + content data). Auto-print on load in print context.
  { path: '/print/:policyId', hashId: 'policy-detail', template: 'detail', group: 'Taxonomy', title: 'Policy Print (V1 legacy)', description: 'Functional V1 /print/:id equivalent using real policy data; triggers native print.' },
  { path: '/forms', hashId: 'forms-library', template: 'matrix', group: 'Taxonomy', title: 'Forms Library', description: 'Forms library for agency templates, attestation forms, and digital candidates.' },
  { path: '/forms/:formId', hashId: 'form-viewer', template: 'form-viewer', group: 'Taxonomy', title: 'Form Workspace', description: 'Read and fill form workspace with sections, fields, and signer context.' },
  // Protected form print route — reuses form-viewer hashId so existing FormWorkspaceScreen
  // (which resolves real formId via FORM_VIEWER_DATASET map from FORMS_DATASET seeds)
  // renders the record for print. Enables printForm util + /forms/:id/print without redesign.
  { path: '/forms/:formId/print', hashId: 'form-viewer', template: 'form-viewer', group: 'Taxonomy', title: 'Form Print', description: 'Protected form print/download view (resolves real formId from seeds).' },
  { path: '/forms/:formId/esign', hashId: 'ecign-workspace', template: 'ecign', group: 'Taxonomy', title: 'eCIgn Signing Workspace', description: 'Signer sequence, document preview, and certificate state for eCIgn signing.' },
  { path: '/artifacts/:artifactId', hashId: 'artifact-viewer', template: 'reference-viewer', group: 'Taxonomy', title: 'Artifact Viewer', description: 'Artifact viewer with preview toolbar and compliance metadata.' },
  { path: '/viewer/:referenceId', hashId: 'generic-reference', template: 'reference-viewer', group: 'Taxonomy', title: 'Reference Viewer', description: 'Reference viewer for citations, source details, and compliance mandates.' },
  { path: '/journey', hashId: 'journey-overview', template: 'journey', group: 'Onboarding', title: 'Journey', description: 'Onboarding journey overview for learner progress and clearance state.' },
  { path: '/journey/new-hire', hashId: 'journey-new-hire', template: 'journey', group: 'Onboarding', title: 'New Hire Portal', description: 'New hire onboarding checklist, portal resources, and support.' },
  { path: '/journey/module/m0', hashId: 'journey-orientation', template: 'module-player', group: 'Onboarding', title: 'Orientation', description: 'Module 0 Orientation and Compliance boundaries.' },
  { path: '/journey/module/:moduleId', hashId: 'module-player', template: 'module-player', group: 'Onboarding', title: 'Module Player', description: 'Module player for training content, assessment state, and retry handling.' },
  { path: '/journey/module/:moduleId/lesson/:lessonId', hashId: 'lesson-player', template: 'module-player', group: 'Onboarding', title: 'Lesson Player', description: 'Lesson player for active-time study slides.' },
  { path: '/journey/module/:moduleId/assessment', hashId: 'module-assessment-splash', template: 'module-player', group: 'Onboarding', title: 'Assessment Splash', description: 'Module quiz prep and instructions.' },
  { path: '/journey/module/:moduleId/assessment/quiz', hashId: 'module-assessment-quiz', template: 'module-player', group: 'Onboarding', title: 'Assessment Quiz', description: 'Module assessment quiz player.' },
  { path: '/journey/final', hashId: 'final-assessment-splash', template: 'module-player', group: 'Onboarding', title: 'Final Assessment', description: 'Final theory exam guidelines.' },
  { path: '/journey/final/quiz', hashId: 'final-assessment-quiz', template: 'module-player', group: 'Onboarding', title: 'Final Assessment Quiz', description: 'Final recertification exam player.' },
  { path: '/journey/final/result', hashId: 'final-result', template: 'module-player', group: 'Onboarding', title: 'Final Exam Results', description: 'Final exam grading and feedback.' },
  { path: '/journey/appendix-f', hashId: 'appendix-f', template: 'docs', group: 'Onboarding', title: 'Appendix F', description: 'Appendix F reference document with table-of-contents state and signature support.' },
  { path: '/journey/supervisor', hashId: 'supervisor', template: 'journey', group: 'Onboarding', title: 'Supervisor', description: 'Supervisor journey view for preceptor visits, learners, and clearance logging.' },
  { path: '/journey/admin', hashId: 'journey-admin', template: 'reports', group: 'Onboarding', title: 'Journey Admin', description: 'Journey admin workspace for syllabus and course path management.' },
  { path: '/journey/guide', hashId: 'user-guide', template: 'docs', group: 'Onboarding', title: 'User Guide', description: 'User guide and operator reference for onboarding workflows.' },
  { path: '/onboarding-v2/dashboard', hashId: 'onboarding-v2-dashboard', template: 'dashboard', group: 'Onboarding v2', title: 'Onboarding v2 Dashboard', description: 'Activation dashboard for batches, gates, audit state, and readiness.' },
  { path: '/onboarding-v2/activate', hashId: 'onboarding-v2-activate', template: 'detail', group: 'Onboarding v2', title: 'Onboarding Activation', description: 'Activation trigger panel for subject readiness and reconciliation.' },
  { path: '/onboarding-v2/batches', hashId: 'onboarding-v2-batches', template: 'matrix', group: 'Onboarding v2', title: 'Onboarding Batches', description: 'Batch roster for generated activation units and completion counts.' },
  { path: '/onboarding-v2/batches/:batchId', hashId: 'onboarding-v2-batch', template: 'detail', group: 'Onboarding v2', title: 'Onboarding Batch', description: 'Batch detail for gates, checklists, evidence, signatures, and timeline hashes.' },
  { path: '/onboarding-v2/audit', hashId: 'onboarding-v2-audit', template: 'evidence', group: 'Onboarding v2', title: 'Onboarding Audit', description: 'Onboarding audit readiness surface for dossiers, hashes, and overrides.' },
  { path: '/onboarding-v2/governance', hashId: 'onboarding-v2-governance', template: 'reports', group: 'Onboarding v2', title: 'Onboarding Overrides', description: 'Onboarding override governance panel for requests, approvers, and audit warnings.' },
  { path: '/policy-lifecycle', hashId: 'policy-lifecycle', template: 'lifecycle', group: 'Taxonomy', title: 'Policy Lifecycle', description: 'Policy lifecycle workspace for draft, review, approval, publication, and archive states.' },
  { path: '/hubstaff', hashId: 'hubstaff', template: 'reports', group: 'System', title: 'Hubstaff', description: 'Hubstaff reporting surface for time-tracking and documentation timelines.' },
  { path: '/system-documentation/:sectionId?', hashId: 'system-docs', template: 'docs', group: 'System', title: 'System Documentation', description: 'System documentation for architecture, workflow engines, and operating references.' },
  { path: '/help/*', hashId: 'help-center', template: 'docs', group: 'System', title: 'Help Center', description: 'Help center for operator guides and compliance articles.' },
  { path: '/governance', hashId: 'governance', template: 'reports', group: 'System', title: 'Governance', description: 'Governance center for committee decisions, council packets, and policy posture.' },
  { path: '/personal/profile', hashId: 'personal-profile', template: 'detail', group: 'System', title: 'Personal Profile', description: 'Personal community profile workspace. Opens as focused standalone view from Personal Operations.' },
  { path: '/personal/profile/:userId', hashId: 'personal-profile', template: 'detail', group: 'System', title: 'User Profile', description: 'Community user profile (future multi-user support via same shell).' },
  { path: '/community/users/me', hashId: 'personal-profile', template: 'detail', group: 'System', title: 'Community Profile', description: 'Current user community profile (alias).' },
  { path: '/community/users/:userId', hashId: 'personal-profile', template: 'detail', group: 'System', title: 'Community User Profile', description: 'Community user profile for threads and activity linking.' },
  { path: '/community', hashId: 'community', template: 'docs', group: 'System', title: 'Community', description: 'Staff community hub for threads, members directory, and no-PHI discussions. Connects Profile + Threads + Journey achievements.' },
  { path: '/community/members', hashId: 'community-members', template: 'matrix', group: 'System', title: 'Community Members', description: 'Member directory using existing profile adapter. Respects visibility.' },
  { path: '/community/threads', hashId: 'community-threads', template: 'docs', group: 'System', title: 'Community Threads', description: 'Thread list and filters for unanswered, flagged, stale.' },
  // Lightweight CES Command Center report placeholders (read-only nav targets). No big tables.
  { path: '/reports/policy-review-aging', hashId: 'report-policy-review-aging', template: 'reports', group: 'Taxonomy', title: 'Policy Review Aging', description: 'Aging report for policies in review.' },
  { path: '/reports/policy-expiration', hashId: 'report-policy-expiration', template: 'reports', group: 'Taxonomy', title: 'Policy Expiration', description: 'Policies expiring in window.' },
  { path: '/reports/policy-attestation', hashId: 'report-policy-attestation', template: 'reports', group: 'Taxonomy', title: 'Policy Attestation', description: 'Attestation gaps report.' },
  { path: '/reports/policy-crosslinks', hashId: 'report-policy-crosslinks', template: 'reports', group: 'Taxonomy', title: 'Policy Cross-Links', description: 'Cross-link gaps report.' },
  { path: '/reports/policy-sla', hashId: 'report-policy-sla', template: 'reports', group: 'Taxonomy', title: 'Policy SLA', description: 'Policy approval SLA report.' },
  { path: '/reports/master-evidence-expiring', hashId: 'report-master-evidence-expiring', template: 'reports', group: 'CES', title: 'Master Evidence Expiring', description: 'Expiring master evidence 90d.' },
  { path: '/reports/ecign-signatures', hashId: 'report-ecign-signatures', template: 'reports', group: 'CES', title: 'eCIgn Signatures', description: 'eCIgn signature status report.' },
  { path: '/reports/ecign-expiring', hashId: 'report-ecign-expiring', template: 'reports', group: 'CES', title: 'eCIgn Expiring', description: 'eCIgn expiring report.' },
  { path: '/reports/training-overdue', hashId: 'report-training-overdue', template: 'reports', group: 'Onboarding', title: 'Training Overdue', description: 'Training overdue report.' },
  { path: '/reports/training-policy-attestation', hashId: 'report-training-policy-attestation', template: 'reports', group: 'Onboarding', title: 'Training Policy Attestation', description: 'Policy ack training gap report.' },
  { path: '/reports/training-drills', hashId: 'report-training-drills', template: 'reports', group: 'Onboarding', title: 'Training Drills', description: 'Drill participation report.' },
  { path: '/reports/training-evidence', hashId: 'report-training-evidence', template: 'reports', group: 'Onboarding', title: 'Training Evidence', description: 'Missing training evidence report.' },
  { path: '/reports/community-thread-sla', hashId: 'report-community-thread-sla', template: 'reports', group: 'System', title: 'Community Thread SLA', description: 'Thread resolution SLA.' },
  { path: '/reports/community-engagement-by-role', hashId: 'report-community-engagement-by-role', template: 'reports', group: 'System', title: 'Community Engagement', description: 'Engagement by role report.' },
  { path: '/reports/help-center-usage', hashId: 'report-help-center-usage', template: 'reports', group: 'System', title: 'Help Center Usage', description: 'KB article usage report.' },
  { path: '/reports/community-to-ces', hashId: 'report-community-to-ces', template: 'reports', group: 'System', title: 'Community to CES', description: 'Thread to CES conversion report.' },
  { path: '/admin/user-groups', hashId: 'admin-groups', template: 'matrix', group: 'Admin', title: 'User Groups', description: 'User group membership and scope management matrix.' },
  { path: '/admin/roles', hashId: 'admin-roles', template: 'matrix', group: 'Admin', title: 'Roles', description: 'RBAC role catalog with permission inheritance and readiness.' },
  { path: '/admin/permissions', hashId: 'admin-permissions', template: 'matrix', group: 'Admin', title: 'Permissions', description: 'Permission matrix for capabilities, roles, risk, readiness, and governance evidence.' },
  { path: '/admin/users', hashId: 'admin-users', template: 'matrix', group: 'Admin', title: 'Users', description: 'User directory and administration surface with role and override controls.' },
  { path: '/admin/community-profiles', hashId: 'admin-community-profiles', template: 'matrix', group: 'Admin', title: 'Community Profiles', description: 'Community profile visibility and user directory for internal clinician profiles.' },
  { path: '/surveyor/policy/:policyId', hashId: 'surveyor-viewer', template: 'detail', group: 'Admin', title: 'Surveyor Viewer', description: 'Read-only surveyor policy viewer for external audit access.' },
  { path: '/policy-lifecycle/:policyId', hashId: 'policy-lifecycle-detail', template: 'lifecycle', group: 'Taxonomy', title: 'Policy Lifecycle Detail', description: 'Policy lifecycle deep link for a specific policy record.' },
  { path: '/login', hashId: 'login-page', template: 'login', group: 'Auth', title: 'Sign In', description: 'Authentication entry screen outside the V6 shell.' },
] as const satisfies readonly V6RouteDefinition[];

export type V6RouteHashId = (typeof V6_ROUTES)[number]['hashId'];

export const V6_REAL_ROUTE_COUNT = V6_ROUTES.length;

export const _V6_OVERLAY_REGISTRY = [
  { hashId: 'modal-system', title: 'Modal System' },
  { hashId: 'drawer-system', title: 'Drawer System' },
  { hashId: 'popover-system', title: 'Popover System' },
  { hashId: 'personal-ops', title: 'Personal Ops Drawer State' },
] as const;

export const _EVENT_WORKSPACE_FUTURE_REQUIREMENTS = [
  'Brad Draft Packet',
  'Evidence Review',
  'Findings Review',
  'Meeting Notes',
  'Decisions / Motions',
  'Corrections / Follow-up Tasks',
  'Approve Packet',
  'eCIgn / Signatures',
  'Finalize & Lock',
] as const;

const previewValues: Record<string, string> = {
  artifactId: 'artifact-sample',
  batchId: 'batch-sample',
  clinicianId: 'clinician-sample',
  eventId: 'event-sample',
  formId: 'form-sample',
  moduleId: 'module-sample',
  patientId: 'patient-sample',
  policyId: 'policy-sample',
  referenceId: 'reference-sample',
  sectionId: 'section-sample',
  taskId: 'task-sample',
};

export function routeToChildPath(path: string): string {
  return path.replace(/^\//, '');
}

export function routeToPreviewPath(path: string): string {
  if (path.endsWith('/*')) return path.replace('/*', '/index');

  let result = path.replace(/:([A-Za-z0-9_]+)\??/g, (_, key: string) => previewValues[key] ?? `${key}-sample`);
  // Clean trailing ? or /? from optional params that had no value substituted
  result = result.replace(/\?$/, '').replace(/\/\?$/, '');
  return result;
}

export function routesByGroup() {
  return V6_ROUTES.filter((route) => route.group !== 'Auth').reduce(
    (groups, route) => {
      const group = groups[route.group] ?? [];
      group.push(route);
      groups[route.group] = group;
      return groups;
    },
    {} as Partial<Record<V6RouteGroup, typeof V6_ROUTES[number][]>>,
  );
}
