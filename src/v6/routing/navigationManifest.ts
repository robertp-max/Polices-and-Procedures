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
  { id: 'ces', label: 'Compliance', to: '/compliance', hashIds: ['compliance-home', 'defensible-2', 'ces-calendar', 'ces-board', 'master-controls', 'audit-mode', 'evidence-intake', 'evidence-packet-studio', 'ai-compliance-review', 'ces-reports'] },
  { id: 'taxonomy', label: 'Policies', to: '/library', hashIds: ['taxonomy', 'framework', 'achc-survey', 'achc-crosswalk', 'hh-evidence-map', 'policy-home', 'policy-library', 'forms-library', 'workflows', 'workflow-detail', 'workflow-swimlane', 'policy-lifecycle', 'policy-lifecycle-detail', 'policy-approvals', 'pm-approvals'] },
  { id: 'onboarding', label: 'Training', to: '/journey?tab=home', hashIds: ['journey-overview', 'journey-new-hire', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide'] },
  // 'Evidence' and 'Hubstaff' hidden from the sidebar per request. Routes still resolve by URL.
  { id: 'help-center', label: 'Help Center', to: '/help', hashIds: ['help-center'] },
  { id: 'community', label: 'Community', to: '/community', hashIds: ['community', 'community-members'] },
  // System Documentation and Demo are hidden from the nav bar per request.
  // (Their routes still resolve by direct URL; they are just hidden from the sidebar.)
  { id: 'admin', label: 'Admin', to: '/admin/user-groups', hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users', 'admin-community-profiles'] },
];

// Help is a primary left-dock item (label "Help"), not chrome-only.
export const chromeOnlyPrimaryNavItemIds = new Set(['brad', 'community', 'admin']);
export const primaryNavBarItems = primaryNavItems.filter((item) => !chromeOnlyPrimaryNavItemIds.has(item.id));

// Workspace subnavs shown inside the workspace content area (top of page), not in main sidebar
export const workspaceSubnavItems: Record<string, NavItem[]> = {
  ces: [
    { id: 'compliance-home', label: 'Sprint Home', to: '/compliance', hashIds: ['compliance-home'] },
    { id: 'ces-calendar', label: 'CES Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    // Events Board remains contextual/hidden.
    { id: 'master-controls', label: 'Control Register', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    {
      id: 'ces-workspace',
      label: 'Workspace',
      to: '/ces/board',
      hashIds: ['ces-board', 'events-board', 'defensible-2', 'evidence-center', 'admission-packet-preview'],
      matchPaths: ['/ces/board', '/ces/events', '/evidence', '/evidence/defensible-2', '/evidence/admission-packet-preview'],
    },
  ],
  taxonomy: [
    { id: 'policy-home', label: 'Policy Home', to: '/library', hashIds: ['policy-home'], matchPaths: ['/library'] },
    { id: 'policy-library', label: 'Policies', to: '/library/policies', hashIds: ['policy-library'], matchPaths: ['/library/policies', '/library/:policyId', '/library/:policyId/print', '/print/:policyId'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'], matchPaths: ['/forms', '/forms/:formId', '/forms/:formId/print', '/forms/:formId/esign'] },
    { id: 'workflows-library', label: 'Workflows', to: '/workflows', hashIds: ['workflows'], matchPaths: ['/workflows', '/workflows/:workflowId', '/workflows/:workflowId/swimlane'] },
    { id: 'taxonomy', label: 'Taxonomy', to: '/framework', hashIds: ['taxonomy', 'framework'], matchPaths: ['/taxonomy', '/framework'] },
    { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'], matchPaths: ['/policy-lifecycle', '/policy-lifecycle/:policyId'] },
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
    { id: 'compliance-home', label: 'Sprint Home', to: '/compliance', hashIds: ['compliance-home'] },
    { id: 'ces-calendar', label: 'CES Calendar', to: '/ces/calendar', hashIds: ['ces-calendar'] },
    // Events Board remains contextual/hidden.
    { id: 'master-controls', label: 'Control Register', to: '/compliance/master-controls', hashIds: ['master-controls'] },
    {
      id: 'ces-workspace',
      label: 'Workspace',
      to: '/ces/board',
      hashIds: ['ces-board', 'events-board', 'defensible-2', 'evidence-center', 'admission-packet-preview'],
    },
  ],
  taxonomy: [
    { id: 'policy-home', label: 'Policy Home', to: '/library', hashIds: ['policy-home'] },
    { id: 'policy-library', label: 'Policies', to: '/library/policies', hashIds: ['policy-library'] },
    { id: 'forms-library', label: 'Forms', to: '/forms', hashIds: ['forms-library'] },
    { id: 'workflows-library', label: 'Workflows', to: '/workflows', hashIds: ['workflows'] },
    { id: 'taxonomy', label: 'Taxonomy', to: '/framework', hashIds: ['taxonomy', 'framework'] },
    { id: 'policy-lifecycle', label: 'Policy Lifecycle', to: '/policy-lifecycle', hashIds: ['policy-lifecycle'] },
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
