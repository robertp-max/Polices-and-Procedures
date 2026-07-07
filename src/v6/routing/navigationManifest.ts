export interface NavItem {
  id: string;
  label: string;
  to: string;
  hashIds: string[];
  children?: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

export const primaryNavItems: NavItem[] = [
  // Brad is now first icon in dock / primary nav
  { id: 'brad', label: 'Brad', to: '/iadministrator', hashIds: ['brad'] },
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', hashIds: ['dashboard'] },
  // 'Clinician Profiles', 'Patient Profiles' and 'Calendar' hidden from the sidebar per request.
  // Routes still resolve by direct URL; they are just removed from the nav.
  { id: 'ces', label: 'Compliance', to: '/evidence', hashIds: ['defensible-2', 'ces-calendar', 'ces-board', 'master-controls', 'audit-mode', 'evidence-intake', 'evidence-packet-studio', 'ces-reports'] },
  { id: 'taxonomy', label: 'Policies', to: '/framework', hashIds: ['taxonomy', 'framework', 'achc-survey', 'achc-crosswalk', 'hh-evidence-map', 'policy-library', 'forms-library', 'workflows', 'workflow-detail', 'workflow-swimlane', 'policy-lifecycle', 'policy-lifecycle-detail', 'policy-approvals', 'pm-approvals'] },
  { id: 'onboarding', label: 'Training', to: '/journey?tab=home', hashIds: ['journey-overview', 'journey-new-hire', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide'] },
  // 'Evidence' and 'Hubstaff' hidden from the sidebar per request. Routes still resolve by URL.
  { id: 'help-center', label: 'Help', to: '/help', hashIds: ['help-center'] },
  { id: 'community', label: 'Community', to: '/community', hashIds: ['community', 'community-members'] },
  // System Documentation and Demo are hidden from the nav bar per request.
  // (Their routes still resolve by direct URL; they are just hidden from the sidebar.)
  { id: 'admin', label: 'Admin', to: '/admin/user-groups', hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users', 'admin-community-profiles'] },
];

export const chromeOnlyPrimaryNavItemIds = new Set(['brad', 'help-center', 'community', 'admin']);
export const primaryNavBarItems = primaryNavItems.filter((item) => !chromeOnlyPrimaryNavItemIds.has(item.id));

// Workspace subnavs shown inside the workspace content area (top of page), not in main sidebar
export const workspaceSubnavItems: Record<string, NavItem[]> = {
  ces: [
    { id: 'ces-calendar', label: 'Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    // Sprint Board + Events Board hidden from the CES subnav per request (routes still resolve by URL).
    { id: 'master-controls', label: 'Master Controls', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    { id: 'audit-mode', label: 'Audit Mode', to: '/audit', hashIds: ['audit-mode'] },
    {
      id: 'defensible-2',
      label: 'DefenCIble',
      to: '/evidence',
      hashIds: ['defensible-2', 'evidence-center', 'evidence-intake', 'evidence-packet-studio', 'admission-packet-preview'],
      matchPaths: ['/evidence', '/evidence/intake', '/evidence/packet-studio', '/evidence/defensible-2', '/evidence/admission-packet-preview'],
    },
    { id: 'ai-compliance-review', label: 'AI Review', to: '/compliance/review', hashIds: ['ai-compliance-review'] },
    { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
  ],
  taxonomy: [
    { id: 'taxonomy', label: 'Taxonomy', to: '/framework', hashIds: ['taxonomy', 'framework'], matchPaths: ['/taxonomy', '/framework'] },
    { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'], matchPaths: ['/policy-lifecycle', '/policy-lifecycle/:policyId'] },
    { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'], matchPaths: ['/library', '/library/:policyId', '/library/:policyId/print', '/print/:policyId'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'], matchPaths: ['/forms', '/forms/:formId', '/forms/:formId/print', '/forms/:formId/esign'] },
    { id: 'workflows-library', label: 'Workflows', to: '/workflows', hashIds: ['workflows'], matchPaths: ['/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane'] },
    { id: 'policy-approvals', label: 'Policy Approval', to: '/policy-approvals', hashIds: ['policy-approvals', 'pm-approvals'], matchPaths: ['/policy-approvals', '/pm/approvals'] },
  ],
  onboarding: [
    { id: 'journey-overview', label: 'Journey', to: '/journey?tab=home', hashIds: ['journey-overview'] },
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
    { id: 'admin-community-profiles', label: 'Community Profiles', to: '/admin/community-profiles', hashIds: ['admin-community-profiles'] },
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
    {
      id: 'defensible-2',
      label: 'DefenCIble',
      to: '/evidence',
      hashIds: ['defensible-2', 'evidence-center', 'evidence-intake', 'evidence-packet-studio', 'admission-packet-preview'],
    },
    { id: 'ai-compliance-review', label: 'AI Review', to: '/compliance/review', hashIds: ['ai-compliance-review'] },
    { id: 'ces-reports', label: 'Reports', to: '/ces/reports', hashIds: ['ces-reports'] },
  ],
  taxonomy: [
    { id: 'taxonomy', label: 'Taxonomy', to: '/framework', hashIds: ['taxonomy', 'framework'] },
    { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'] },
    { id: 'policy-library', label: 'Policies', to: '/library', hashIds: ['policy-library'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'] },
    { id: 'workflows-library', label: 'Workflows', to: '/workflows', hashIds: ['workflows'] },
    { id: 'policy-approvals', label: 'Policy Approval', to: '/policy-approvals', hashIds: ['policy-approvals', 'pm-approvals'] },
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
