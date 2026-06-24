export interface NavItem {
  id: string;
  label: string;
  to: string;
  hashIds: string[];
  children?: NavItem[];
  icon?: React.ComponentType<any>;
  matchPaths?: string[];
}

export const SIDEBAR_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', hashIds: ['dashboard'] },
  { id: 'clinicians', label: 'Clinician Profiles', to: '/clinicians', hashIds: ['clinicians'] },
  { id: 'patients', label: 'Patient Profiles', to: '/patients', hashIds: ['patients'] },
  { id: 'calendar', label: 'Calendar', to: '/staffing-calendar', hashIds: ['master-calendar', 'staffing-calendar'] },
  { id: 'brad', label: 'Brad / iAdministrator', to: '/iadministrator', hashIds: ['brad'] },
  {
    id: 'ces',
    label: 'Compliance Execution (CES)',
    to: '/ces/calendar',
    hashIds: ['ces-calendar', 'ces-board', 'workflows', 'master-controls', 'audit-mode', 'evidence-center', 'ces-reports'],
    matchPaths: ['/ces/calendar', '/ces/board', '/ces/events', '/events/:eventId/swimlane', '/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane', '/compliance/master-controls', '/evidence', '/audit', '/ces/reports', '/calendar/event/:eventId/task/:taskId'],
    children: [
      { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
      { id: 'ces-board', label: 'Sprint Board', to: '/ces/board', hashIds: ['ces-board'] },
      { id: 'workflows', label: 'Workflows', to: '/workflows', hashIds: ['workflows'], matchPaths: ['/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane'] },
      { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
      { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
      { id: 'evidence-center', label: 'Evidence Center', to: '/evidence', hashIds: ['evidence-center'] },
      { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
    ],
  },
  {
    id: 'taxonomy',
    label: 'Taxonomy',
    to: '/framework',
    hashIds: ['taxonomy', 'framework', 'achc-survey', 'achc-crosswalk'],
    children: [
      { id: 'framework', label: 'Framework', to: '/framework', hashIds: ['framework'] },
      { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'], matchPaths: ['/library', '/library/:policyId', '/library/:policyId/print', '/print/:policyId'] },
      { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'], matchPaths: ['/forms', '/forms/:formId', '/forms/:formId/print', '/forms/:formId/esign'] },
      { id: 'achc-survey', label: 'ACHC Survey', to: '/framework/achc-survey', hashIds: ['achc-survey'] },
      { id: 'achc-crosswalk', label: 'ACHC Crosswalk', to: '/framework/achc-survey/crosswalk', hashIds: ['achc-crosswalk'] },
    ],
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    to: '/journey',
    hashIds: ['journey-overview', 'journey-v1', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide'],
    children: [
      { id: 'journey-overview', label: 'Overview', to: '/journey', hashIds: ['journey-overview'] },
      { id: 'journey-v1', label: 'Journey v1', to: '/journey/v1-journey', hashIds: ['journey-v1'] },
      { id: 'appendix-f', label: 'Appendix F', to: '/journey/appendix-f', hashIds: ['appendix-f'] },
      { id: 'supervisor', label: 'Supervisor View', to: '/journey/supervisor', hashIds: ['supervisor'] },
      { id: 'journey-admin', label: 'Admin', to: '/journey/admin', hashIds: ['journey-admin'] },
      { id: 'user-guide', label: 'User Guide', to: '/journey/guide', hashIds: ['user-guide'] },
    ],
  },
  // Onboarding v2 routes kept for functionality but filtered from visible primary nav (matches V1 VISIBLE_NAV exclusion)
  { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'], matchPaths: ['/policy-lifecycle', '/policy-lifecycle/:policyId'] },
  { id: 'evidence', label: 'Evidence', to: '/evidence', hashIds: ['evidence-center'] },
  { id: 'hubstaff', label: 'Hubstaff', to: '/hubstaff', hashIds: ['hubstaff'] },
  {
    id: 'system-docs',
    label: 'System Documentation',
    to: '/system-documentation',
    hashIds: ['system-docs'],
    matchPaths: ['/system-documentation', '/system-documentation/executive-overview', '/system-documentation/system-architecture', '/system-documentation/identity-access', '/system-documentation/workflow-enforcement', '/system-documentation/training-system', '/system-documentation/audit-evidence', '/system-documentation/aws-infrastructure', '/system-documentation/hipaa-gap-analysis', '/system-documentation/production-roadmap', '/system-documentation/:sectionId'],
    children: [
      { id: 'exec-overview', label: 'Executive Overview', to: '/system-documentation/executive-overview', hashIds: ['system-docs'] },
      { id: 'sys-arch', label: 'System Architecture', to: '/system-documentation/system-architecture', hashIds: ['system-docs'] },
      { id: 'identity-access', label: 'Identity & Access', to: '/system-documentation/identity-access', hashIds: ['system-docs'] },
      { id: 'workflow-enf', label: 'Workflow & Enforcement', to: '/system-documentation/workflow-enforcement', hashIds: ['system-docs'] },
      { id: 'training-sys', label: 'Training System', to: '/system-documentation/training-system', hashIds: ['system-docs'] },
      { id: 'audit-ev', label: 'Audit & Evidence', to: '/system-documentation/audit-evidence', hashIds: ['system-docs'] },
      { id: 'aws-infra', label: 'AWS Infrastructure', to: '/system-documentation/aws-infrastructure', hashIds: ['system-docs'] },
      { id: 'hipaa-gap', label: 'HIPAA Gap Analysis', to: '/system-documentation/hipaa-gap-analysis', hashIds: ['system-docs'] },
      { id: 'prod-road', label: 'Production Roadmap', to: '/system-documentation/production-roadmap', hashIds: ['system-docs'] },
    ],
  },
  { id: 'help-center', label: 'Help Center', to: '/help', hashIds: ['help-center'] },
  { id: 'demo', label: 'Demo', to: '/demo', hashIds: ['demo'] },
  {
    id: 'admin',
    label: 'Admin',
    to: '/admin/user-groups',
    hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users'],
    children: [
      { id: 'admin-groups', label: 'User Groups', to: '/admin/user-groups', hashIds: ['admin-groups'] },
      { id: 'admin-roles', label: 'Roles', to: '/admin/roles', hashIds: ['admin-roles'] },
      { id: 'admin-permissions', label: 'Permissions', to: '/admin/permissions', hashIds: ['admin-permissions'] },
      { id: 'admin-users', label: 'Users', to: '/admin/users', hashIds: ['admin-users'] },
    ],
  },
];

export const WORKSPACE_SUBNAV: Record<string, NavItem[]> = {
  ces: [
    { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    { id: 'ces-board', label: 'Sprint Board', to: '/ces/board', hashIds: ['ces-board'] },
    { id: 'workflows', label: 'Workflows', to: '/workflows', hashIds: ['workflows'] },
    { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
    { id: 'evidence-center', label: 'Evidence Center', to: '/evidence', hashIds: ['evidence-center'] },
    { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
  ],
  taxonomy: [
    { id: 'framework', label: 'Framework', to: '/framework', hashIds: ['framework'] },
    { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'] },
    { id: 'achc-survey', label: 'ACHC Survey', to: '/framework/achc-survey', hashIds: ['achc-survey'] },
    { id: 'achc-crosswalk', label: 'ACHC Crosswalk', to: '/framework/achc-survey/crosswalk', hashIds: ['achc-crosswalk'] },
    { id: 'workflows', label: 'Workflows', to: '/workflows', hashIds: ['workflows'] },
  ],
  // Add more for other workspaces as needed
};

export function findActiveNavItem(pathname: string, items: NavItem[]): { parent: NavItem; child?: NavItem } | null {
  for (const item of items) {
    if (item.to === pathname || pathname.startsWith(item.to + '/')) {
      return { parent: item };
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.to === pathname || pathname.startsWith(child.to + '/')) {
          return { parent: item, child };
        }
      }
    }
  }
  return null;
}
