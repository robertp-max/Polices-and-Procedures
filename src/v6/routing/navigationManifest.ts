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
    hashIds: ['ces-calendar', 'ces-board', 'events-board', 'workflows', 'master-controls', 'ces-reports', 'my-tasks'],
    matchPaths: ['/ces/calendar', '/ces/board', '/ces/events', '/events/:eventId/swimlane', '/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane', '/compliance/master-controls', '/evidence', '/audit', '/my-tasks', '/ces/reports', '/calendar/event/:eventId/task/:taskId'],
    children: [
      { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
      { id: 'ces-board', label: 'Sprint Board', to: '/ces/board', hashIds: ['ces-board'] },
      { id: 'events-board', label: 'Events Board', to: '/ces/events', hashIds: ['events-board'], matchPaths: ['/ces/events', '/events/:eventId/swimlane'] },
      { id: 'workflows', label: 'Workflows', to: '/workflows', hashIds: ['workflows'], matchPaths: ['/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane'] },
      { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
      { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
      { id: 'evidence-center', label: 'Evidence Center', to: '/evidence', hashIds: ['evidence-center'] },
      { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
      { id: 'my-tasks', label: 'My Tasks', to: '/my-tasks', hashIds: ['my-tasks'] },
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
  {
    id: 'onboarding-v2',
    label: 'Onboarding v2',
    to: '/onboarding-v2/dashboard',
    hashIds: ['onboarding-v2-dashboard', 'onboarding-v2-activate', 'onboarding-v2-batches', 'onboarding-v2-audit', 'onboarding-v2-governance'],
    children: [
      { id: 'onboarding-v2-dashboard', label: 'Dashboard', to: '/onboarding-v2/dashboard', hashIds: ['onboarding-v2-dashboard'] },
      { id: 'onboarding-v2-activate', label: 'Activate', to: '/onboarding-v2/activate', hashIds: ['onboarding-v2-activate'] },
      { id: 'onboarding-v2-batches', label: 'Batches', to: '/onboarding-v2/batches', hashIds: ['onboarding-v2-batches'], matchPaths: ['/onboarding-v2/batches', '/onboarding-v2/batches/:batchId'] },
      { id: 'onboarding-v2-audit', label: 'Audit', to: '/onboarding-v2/audit', hashIds: ['onboarding-v2-audit'] },
      { id: 'onboarding-v2-governance', label: 'Governance', to: '/onboarding-v2/governance', hashIds: ['onboarding-v2-governance'] },
    ],
  },
  { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'], matchPaths: ['/policy-lifecycle', '/policy-lifecycle/:policyId'] },
  { id: 'evidence', label: 'Evidence', to: '/evidence', hashIds: ['evidence-center'] },
  { id: 'hubstaff', label: 'Hubstaff', to: '/hubstaff', hashIds: ['hubstaff'] },
  {
    id: 'system-docs',
    label: 'System Documentation',
    to: '/system-documentation',
    hashIds: ['system-docs'],
    matchPaths: ['/system-documentation', '/system-documentation/:sectionId'],
    children: [
      { id: 'system-docs', label: 'Documentation', to: '/system-documentation', hashIds: ['system-docs'], matchPaths: ['/system-documentation', '/system-documentation/:sectionId'] },
    ],
  },
  { id: 'help-center', label: 'Help Center', to: '/help', hashIds: ['help-center'] },
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
    { id: 'ces-calendar', label: 'CES Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    { id: 'ces-board', label: 'Kanban Board', to: '/ces/board', hashIds: ['ces-board'] },
    { id: 'events-board', label: 'Events Board', to: '/ces/events', hashIds: ['events-board'] },
    { id: 'workflows', label: 'Workflows Library', to: '/workflows', hashIds: ['workflows'] },
    { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    { id: 'evidence-center', label: 'Evidence Center', to: '/evidence', hashIds: ['evidence-center'] },
    { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
    { id: 'my-tasks', label: 'My Tasks', to: '/my-tasks', hashIds: ['my-tasks'] },
    { id: 'ces-reports', label: 'CES Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
  ],
  taxonomy: [
    { id: 'framework', label: 'Framework', to: '/framework', hashIds: ['framework'] },
    { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'] },
    { id: 'achc-survey', label: 'ACHC Survey', to: '/framework/achc-survey', hashIds: ['achc-survey'] },
    { id: 'achc-crosswalk', label: 'ACHC Crosswalk', to: '/framework/achc-survey/crosswalk', hashIds: ['achc-crosswalk'] },
    { id: 'workflows', label: 'Workflows Library', to: '/workflows', hashIds: ['workflows'] },
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
