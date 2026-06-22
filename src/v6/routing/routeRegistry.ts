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
  | 'profiles'
  | 'reference-viewer'
  | 'reports';

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
  { path: '/ces/calendar', hashId: 'ces-calendar', template: 'calendar', group: 'CES', title: 'CES Calendar', description: 'Compliance Execution calendar for event milestones and packet readiness.' },
  { path: '/ces/board', hashId: 'ces-board', template: 'board', group: 'CES', title: 'CES Board', description: 'Compliance Execution kanban board for workflow stages.' },
  { path: '/ces/events', hashId: 'events-board', template: 'board', group: 'CES', title: 'Events Board', description: 'Clinical event board for critical, at-risk, evidence-ready, and lock-ready work.' },
  { path: '/workflows', hashId: 'workflows', template: 'matrix', group: 'CES', title: 'Workflows', description: 'Workflow library linking domains, policies, evidence, forms, and history.' },
  { path: '/workflows/:workflowId/swimlane', hashId: 'workflow-swimlane', template: 'board', group: 'CES', title: 'Workflow Swimlane', description: 'Workflow swimlane for intake, evidence, review, signature, and lock steps.' },
  { path: '/events/:eventId/swimlane', hashId: 'workflow-swimlane', template: 'board', group: 'CES', title: 'Workflow Swimlane', description: 'Event workflow swimlane for the selected event occurrence and workflow.' },
  { path: '/compliance/master-controls', hashId: 'master-controls', template: 'matrix', group: 'CES', title: 'Master Controls', description: 'Regulatory control matrix mapped to risk, evidence, and readiness.' },
  { path: '/audit', hashId: 'audit-mode', template: 'evidence', group: 'CES', title: 'Audit Mode', description: 'Read-only audit review surface for missing evidence and packet checks.' },
  { path: '/evidence', hashId: 'evidence-center', template: 'evidence', group: 'CES', title: 'Evidence Center', description: 'Evidence repository for files, hashes, signatures, and audit metadata.' },
  { path: '/ces/reports', hashId: 'ces-reports', template: 'reports', group: 'CES', title: 'CES Reports', description: 'Compliance Execution reports for posture, packets, approvals, and throughput.' },
  { path: '/calendar/event/:eventId/task/:taskId', hashId: 'mobile-incident', template: 'detail', group: 'CES', title: 'Mobile Incident', description: 'Mobile task execution surface for evidence capture and field completion.' },
  { path: '/my-tasks', hashId: 'my-tasks', template: 'board', group: 'CES', title: 'My Tasks', description: 'Personal task board for assigned compliance and operations work.' },
  { path: '/framework', hashId: 'framework', template: 'framework', group: 'Taxonomy', title: 'Framework', description: 'Regulatory framework map for domains, policies, forms, workflows, and authorities.' },
  { path: '/framework/achc-survey', hashId: 'achc-survey', template: 'achc-survey', group: 'Taxonomy', title: 'ACHC Survey', description: 'ACHC survey alignment surface for policy support and open evidence gaps.' },
  { path: '/framework/achc-survey/crosswalk', hashId: 'achc-crosswalk', template: 'achc-crosswalk', group: 'Taxonomy', title: 'ACHC Crosswalk', description: 'ACHC, CMS, Title 22, policy, form, and evidence crosswalk.' },
  { path: '/library', hashId: 'policy-library', template: 'matrix', group: 'Taxonomy', title: 'Policy Library', description: 'Policy library matrix for active agency policies and survey-ready context.' },
  { path: '/library/:policyId', hashId: 'policy-detail', template: 'detail', group: 'Taxonomy', title: 'Policy Detail', description: 'Policy detail with version metadata, required codes, section tabs, and appendices.' },
  { path: '/forms', hashId: 'forms-library', template: 'matrix', group: 'Taxonomy', title: 'Forms Library', description: 'Forms library for agency templates, attestation forms, and digital candidates.' },
  { path: '/forms/:formId', hashId: 'form-viewer', template: 'form-viewer', group: 'Taxonomy', title: 'Form Workspace', description: 'Read and fill form workspace with sections, fields, and signer context.' },
  { path: '/forms/:formId/esign', hashId: 'ecign-workspace', template: 'ecign', group: 'Taxonomy', title: 'eCIgn Signing Workspace', description: 'Signer sequence, document preview, and certificate state for eCIgn signing.' },
  { path: '/artifacts/:artifactId', hashId: 'artifact-viewer', template: 'reference-viewer', group: 'Taxonomy', title: 'Artifact Viewer', description: 'Artifact viewer with preview toolbar and compliance metadata.' },
  { path: '/viewer/:referenceId', hashId: 'generic-reference', template: 'reference-viewer', group: 'Taxonomy', title: 'Reference Viewer', description: 'Reference viewer for citations, source details, and compliance mandates.' },
  { path: '/journey', hashId: 'journey-overview', template: 'journey', group: 'Onboarding', title: 'Journey Overview', description: 'Onboarding journey overview for learner progress and clearance state.' },
  { path: '/journey/v1-journey', hashId: 'journey-v1', template: 'journey', group: 'Onboarding', title: 'Journey v1', description: 'Journey v1 legacy curriculum tracker.' },
  { path: '/journey/module/:moduleId', hashId: 'module-player', template: 'module-player', group: 'Onboarding', title: 'Module Player', description: 'Module player for training content, assessment state, and retry handling.' },
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
  { path: '/policy-lifecycle', hashId: 'policy-lifecycle', template: 'lifecycle', group: 'System', title: 'Policy Lifecycle', description: 'Policy lifecycle workspace for draft, review, approval, publication, and archive states.' },
  { path: '/hubstaff', hashId: 'hubstaff', template: 'reports', group: 'System', title: 'Hubstaff', description: 'Hubstaff reporting surface for time-tracking and documentation timelines.' },
  { path: '/system-documentation/:sectionId', hashId: 'system-docs', template: 'docs', group: 'System', title: 'System Documentation', description: 'System documentation for architecture, workflow engines, and operating references.' },
  { path: '/help/*', hashId: 'help-center', template: 'docs', group: 'System', title: 'Help Center', description: 'Help center for operator guides and compliance articles.' },
  { path: '/governance', hashId: 'governance', template: 'reports', group: 'System', title: 'Governance', description: 'Governance center for committee decisions, council packets, and policy posture.' },
  { path: '/admin/user-groups', hashId: 'admin-groups', template: 'matrix', group: 'Admin', title: 'User Groups', description: 'User group membership and scope management matrix.' },
  { path: '/admin/roles', hashId: 'admin-roles', template: 'matrix', group: 'Admin', title: 'Roles', description: 'RBAC role catalog with permission inheritance and readiness.' },
  { path: '/admin/permissions', hashId: 'admin-permissions', template: 'matrix', group: 'Admin', title: 'Permissions', description: 'Permission matrix for capabilities, roles, risk, readiness, and governance evidence.' },
  { path: '/admin/users', hashId: 'admin-users', template: 'matrix', group: 'Admin', title: 'Users', description: 'User directory and administration surface with role and override controls.' },
  { path: '/surveyor/policy/:policyId', hashId: 'surveyor-viewer', template: 'detail', group: 'Admin', title: 'Surveyor Viewer', description: 'Read-only surveyor policy viewer for external audit access.' },
  { path: '/policy-lifecycle/:policyId', hashId: 'policy-lifecycle-detail', template: 'lifecycle', group: 'System', title: 'Policy Lifecycle Detail', description: 'Policy lifecycle deep link for a specific policy record.' },
  { path: '/login', hashId: 'login-page', template: 'login', group: 'Auth', title: 'Sign In', description: 'Authentication entry screen outside the V6 shell.' },
] as const satisfies readonly V6RouteDefinition[];

export type V6RouteHashId = (typeof V6_ROUTES)[number]['hashId'];

export const V6_REAL_ROUTE_COUNT = V6_ROUTES.length;

export const V6_OVERLAY_REGISTRY = [
  { hashId: 'modal-system', title: 'Modal System' },
  { hashId: 'drawer-system', title: 'Drawer System' },
  { hashId: 'popover-system', title: 'Popover System' },
  { hashId: 'personal-ops', title: 'Personal Ops Drawer State' },
] as const;

export const EVENT_WORKSPACE_FUTURE_REQUIREMENTS = [
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

  return path.replace(/:([A-Za-z0-9_]+)/g, (_, key: string) => previewValues[key] ?? `${key}-sample`);
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
