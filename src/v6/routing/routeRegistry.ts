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
  phase: 'V6-1A-placeholder';
  template: V6RouteTemplate;
  title: string;
}

export const V6_ROUTES = [
  { path: '/dashboard', hashId: 'dashboard', template: 'dashboard', group: 'Overview', title: 'Dashboard', description: 'Overview command surface.' },
  { path: '/clinicians', hashId: 'clinicians', template: 'profiles', group: 'Overview', title: 'Clinicians', description: 'Clinician roster placeholder.' },
  { path: '/clinicians/:clinicianId', hashId: 'clinician-detail', template: 'detail', group: 'Overview', title: 'Clinician Detail', description: 'Clinician detail placeholder.' },
  { path: '/patients', hashId: 'patients', template: 'profiles', group: 'Overview', title: 'Patients', description: 'Patient roster placeholder.' },
  { path: '/patients/:patientId', hashId: 'patient-detail', template: 'detail', group: 'Overview', title: 'Patient Detail', description: 'Patient detail placeholder.' },
  { path: '/calendar', hashId: 'master-calendar', template: 'calendar', group: 'Overview', title: 'Master Calendar', description: 'Master calendar placeholder.' },
  { path: '/staffing-calendar', hashId: 'staffing-calendar', template: 'calendar', group: 'Overview', title: 'Staffing Calendar', description: 'Staffing calendar placeholder.' },
  { path: '/iadministrator', hashId: 'brad', template: 'chat', group: 'Overview', title: 'iAdministrator', description: 'Assistant workspace placeholder.' },
  { path: '/ces/calendar', hashId: 'ces-calendar', template: 'calendar', group: 'CES', title: 'CES Calendar', description: 'CES calendar placeholder.' },
  { path: '/ces/board', hashId: 'ces-board', template: 'board', group: 'CES', title: 'CES Board', description: 'CES board placeholder.' },
  { path: '/ces/events', hashId: 'events-board', template: 'board', group: 'CES', title: 'Events Board', description: 'Events board placeholder.' },
  { path: '/workflows', hashId: 'workflows', template: 'matrix', group: 'CES', title: 'Workflows', description: 'Workflow matrix placeholder.' },
  { path: '/workflows/:workflowId/swimlane', hashId: 'workflow-swimlane', template: 'board', group: 'CES', title: 'Workflow Swimlane', description: 'Workflow swimlane placeholder.' },
  { path: '/compliance/master-controls', hashId: 'master-controls', template: 'matrix', group: 'CES', title: 'Master Controls', description: 'Master controls placeholder.' },
  { path: '/audit', hashId: 'audit-mode', template: 'evidence', group: 'CES', title: 'Audit Mode', description: 'Audit mode placeholder.' },
  { path: '/evidence', hashId: 'evidence-center', template: 'evidence', group: 'CES', title: 'Evidence Center', description: 'Evidence center placeholder.' },
  { path: '/ces/reports', hashId: 'ces-reports', template: 'reports', group: 'CES', title: 'CES Reports', description: 'CES reports placeholder.' },
  { path: '/calendar/event/:eventId/task/:taskId', hashId: 'mobile-incident', template: 'detail', group: 'CES', title: 'Mobile Incident', description: 'Mobile incident placeholder.' },
  { path: '/my-tasks', hashId: 'my-tasks', template: 'board', group: 'CES', title: 'My Tasks', description: 'My tasks placeholder.' },
  { path: '/framework', hashId: 'framework', template: 'framework', group: 'Taxonomy', title: 'Framework', description: 'Framework placeholder.' },
  { path: '/framework/achc-survey', hashId: 'achc-survey', template: 'achc-survey', group: 'Taxonomy', title: 'ACHC Survey', description: 'ACHC survey placeholder.' },
  { path: '/framework/achc-survey/crosswalk', hashId: 'achc-crosswalk', template: 'achc-crosswalk', group: 'Taxonomy', title: 'ACHC Crosswalk', description: 'ACHC crosswalk placeholder.' },
  { path: '/library', hashId: 'policy-library', template: 'matrix', group: 'Taxonomy', title: 'Policy Library', description: 'Policy library placeholder.' },
  { path: '/library/:policyId', hashId: 'policy-detail', template: 'detail', group: 'Taxonomy', title: 'Policy Detail', description: 'Policy detail placeholder.' },
  { path: '/forms', hashId: 'forms-library', template: 'matrix', group: 'Taxonomy', title: 'Forms Library', description: 'Forms library placeholder.' },
  { path: '/forms/:formId', hashId: 'form-viewer', template: 'form-viewer', group: 'Taxonomy', title: 'Form Workspace', description: 'Read and fill form placeholder.' },
  { path: '/forms/:formId/esign', hashId: 'ecign-workspace', template: 'ecign', group: 'Taxonomy', title: 'eCIgn Workspace', description: 'Signing workspace placeholder.' },
  { path: '/artifacts/:artifactId', hashId: 'artifact-viewer', template: 'reference-viewer', group: 'Taxonomy', title: 'Artifact Viewer', description: 'Artifact viewer placeholder.' },
  { path: '/viewer/:referenceId', hashId: 'generic-reference', template: 'reference-viewer', group: 'Taxonomy', title: 'Reference Viewer', description: 'Reference viewer placeholder.' },
  { path: '/journey', hashId: 'journey-overview', template: 'journey', group: 'Onboarding', title: 'Journey Overview', description: 'Journey overview placeholder.' },
  { path: '/journey/v1-journey', hashId: 'journey-v1', template: 'journey', group: 'Onboarding', title: 'Journey v1', description: 'Journey v1 placeholder.' },
  { path: '/journey/module/:moduleId', hashId: 'module-player', template: 'module-player', group: 'Onboarding', title: 'Module Player', description: 'Module player placeholder.' },
  { path: '/journey/appendix-f', hashId: 'appendix-f', template: 'docs', group: 'Onboarding', title: 'Appendix F', description: 'Appendix F placeholder.' },
  { path: '/journey/supervisor', hashId: 'supervisor', template: 'journey', group: 'Onboarding', title: 'Supervisor', description: 'Supervisor placeholder.' },
  { path: '/journey/admin', hashId: 'journey-admin', template: 'reports', group: 'Onboarding', title: 'Journey Admin', description: 'Journey admin placeholder.' },
  { path: '/journey/guide', hashId: 'user-guide', template: 'docs', group: 'Onboarding', title: 'User Guide', description: 'User guide placeholder.' },
  { path: '/onboarding-v2/dashboard', hashId: 'onboarding-v2-dashboard', template: 'dashboard', group: 'Onboarding v2', title: 'Onboarding v2 Dashboard', description: 'Onboarding dashboard placeholder.' },
  { path: '/onboarding-v2/activate', hashId: 'onboarding-v2-activate', template: 'detail', group: 'Onboarding v2', title: 'Onboarding Activation', description: 'Activation placeholder.' },
  { path: '/onboarding-v2/batches', hashId: 'onboarding-v2-batches', template: 'matrix', group: 'Onboarding v2', title: 'Onboarding Batches', description: 'Batches placeholder.' },
  { path: '/onboarding-v2/batches/:batchId', hashId: 'onboarding-v2-batch', template: 'detail', group: 'Onboarding v2', title: 'Onboarding Batch', description: 'Batch detail placeholder.' },
  { path: '/onboarding-v2/audit', hashId: 'onboarding-v2-audit', template: 'evidence', group: 'Onboarding v2', title: 'Onboarding Audit', description: 'Onboarding audit placeholder.' },
  { path: '/onboarding-v2/governance', hashId: 'onboarding-v2-governance', template: 'reports', group: 'Onboarding v2', title: 'Onboarding Overrides', description: 'Onboarding governance placeholder.' },
  { path: '/policy-lifecycle', hashId: 'policy-lifecycle', template: 'lifecycle', group: 'System', title: 'Policy Lifecycle', description: 'Policy lifecycle placeholder.' },
  { path: '/hubstaff', hashId: 'hubstaff', template: 'reports', group: 'System', title: 'Hubstaff', description: 'Hubstaff placeholder.' },
  { path: '/system-documentation/:sectionId', hashId: 'system-docs', template: 'docs', group: 'System', title: 'System Documentation', description: 'System documentation placeholder.' },
  { path: '/help/*', hashId: 'help-center', template: 'docs', group: 'System', title: 'Help Center', description: 'Help center placeholder.' },
  { path: '/governance', hashId: 'governance', template: 'reports', group: 'System', title: 'Governance', description: 'Governance placeholder.' },
  { path: '/admin/user-groups', hashId: 'admin-groups', template: 'matrix', group: 'Admin', title: 'User Groups', description: 'User groups placeholder.' },
  { path: '/admin/roles', hashId: 'admin-roles', template: 'matrix', group: 'Admin', title: 'Roles', description: 'Roles placeholder.' },
  { path: '/admin/permissions', hashId: 'admin-permissions', template: 'matrix', group: 'Admin', title: 'Permissions', description: 'Permissions placeholder.' },
  { path: '/admin/users', hashId: 'admin-users', template: 'matrix', group: 'Admin', title: 'Users', description: 'Users placeholder.' },
  { path: '/surveyor/policy/:policyId', hashId: 'surveyor-viewer', template: 'detail', group: 'Admin', title: 'Surveyor Viewer', description: 'Surveyor viewer placeholder.' },
  { path: '/policy-lifecycle/:policyId', hashId: 'policy-lifecycle-detail', template: 'lifecycle', group: 'System', title: 'Policy Lifecycle Detail', description: 'Policy lifecycle detail placeholder.' },
  { path: '/login', hashId: 'login-page', template: 'login', group: 'Auth', title: 'Sign In', description: 'Auth placeholder outside the V6 shell.' },
] as const satisfies readonly Omit<V6RouteDefinition, 'phase'>[];

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
