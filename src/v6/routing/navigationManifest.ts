export interface NavItem {
  id: string;
  label: string;
  to: string;
  hashIds: string[];
  children?: NavItem[];
  icon?: React.ComponentType<any>;
  matchPaths?: string[];
}

export const primaryNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', hashIds: ['dashboard'] },
  { id: 'clinicians', label: 'Clinician Profiles', to: '/clinicians', hashIds: ['clinicians'] },
  { id: 'patients', label: 'Patient Profiles', to: '/patients', hashIds: ['patients'] },
  { id: 'calendar', label: 'Calendar', to: '/staffing-calendar', hashIds: ['master-calendar', 'staffing-calendar'] },
  { id: 'brad', label: 'Brad', to: '/iadministrator', hashIds: ['brad'] },
  { id: 'ces', label: 'Compliance Execution (CES)', to: '/ces/calendar', hashIds: ['ces-calendar', 'ces-board', 'workflows', 'master-controls', 'audit-mode', 'evidence-center', 'ces-reports'] },
  { id: 'taxonomy', label: 'Taxonomy', to: '/framework', hashIds: ['taxonomy', 'framework', 'achc-survey', 'achc-crosswalk'] },
  { id: 'onboarding', label: 'Onboarding & Training', to: '/journey', hashIds: ['journey-overview', 'journey-new-hire', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide'] },
  { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'], matchPaths: ['/policy-lifecycle', '/policy-lifecycle/:policyId'] },
  { id: 'evidence', label: 'Evidence', to: '/evidence', hashIds: ['evidence-center'] },
  { id: 'hubstaff', label: 'Hubstaff', to: '/hubstaff', hashIds: ['hubstaff'] },
  { id: 'system-docs', label: 'System Documentation', to: '/system-documentation', hashIds: ['system-docs'] },
  { id: 'help-center', label: 'Help Center', to: '/help', hashIds: ['help-center'] },
  { id: 'demo', label: 'Demo', to: '/demo', hashIds: ['demo'] },
  { id: 'admin', label: 'Admin', to: '/admin/user-groups', hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users'] },
];

// Workspace subnavs shown inside the workspace content area (top of page), not in main sidebar
export const workspaceSubnavItems: Record<string, NavItem[]> = {
  ces: [
    { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    { id: 'ces-board', label: 'Sprint Board', to: '/ces/board', hashIds: ['ces-board'] },
    { id: 'events-board', label: 'Events Board', to: '/ces/events', hashIds: ['events-board'] },
    { id: 'workflows', label: 'Workflows', to: '/workflows', hashIds: ['workflows'], matchPaths: ['/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane'] },
    { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
    { id: 'evidence-center', label: 'Evidence Center', to: '/evidence', hashIds: ['evidence-center'] },
    { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
  ],
  taxonomy: [
    { id: 'framework', label: 'Framework', to: '/framework', hashIds: ['framework'] },
    { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'], matchPaths: ['/library', '/library/:policyId', '/library/:policyId/print', '/print/:policyId'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'], matchPaths: ['/forms', '/forms/:formId', '/forms/:formId/print', '/forms/:formId/esign'] },
    { id: 'achc-survey', label: 'ACHC Survey', to: '/framework/achc-survey', hashIds: ['achc-survey'] },
    { id: 'achc-crosswalk', label: 'ACHC Crosswalk', to: '/framework/achc-survey/crosswalk', hashIds: ['achc-crosswalk'] },
  ],
  onboarding: [
    { id: 'journey-overview', label: 'Journey', to: '/journey', hashIds: ['journey-overview'] },
    { id: 'journey-new-hire', label: 'New Hire', to: '/journey/new-hire', hashIds: ['journey-new-hire'] },
    { id: 'appendix-f', label: 'Appendix F', to: '/journey/appendix-f', hashIds: ['appendix-f'] },
    { id: 'supervisor', label: 'Supervisor View', to: '/journey/supervisor', hashIds: ['supervisor'] },
    { id: 'journey-admin', label: 'Admin', to: '/journey/admin', hashIds: ['journey-admin'] },
    { id: 'user-guide', label: 'User Guide', to: '/journey/guide', hashIds: ['user-guide'] },
  ],
  'system-docs': [
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
  admin: [
    { id: 'admin-groups', label: 'User Groups', to: '/admin/user-groups', hashIds: ['admin-groups'] },
    { id: 'admin-roles', label: 'Roles', to: '/admin/roles', hashIds: ['admin-roles'] },
    { id: 'admin-permissions', label: 'Permissions', to: '/admin/permissions', hashIds: ['admin-permissions'] },
    { id: 'admin-users', label: 'Users', to: '/admin/users', hashIds: ['admin-users'] },
  ],
};

// Legacy for compatibility - primary now in primaryNavItems
export const SIDEBAR_NAV: NavItem[] = primaryNavItems;

export const WORKSPACE_SUBNAV: Record<string, NavItem[]> = {
  ces: [
    { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    { id: 'ces-board', label: 'Sprint Board', to: '/ces/board', hashIds: ['ces-board'] },
    { id: 'events-board', label: 'Events Board', to: '/ces/events', hashIds: ['events-board'] },
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
