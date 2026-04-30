/**
 * Contextual article map.
 *
 * Maps the current React Router pathname to the most relevant Help Center
 * article slug. Used by ContextualKnowledgeBulb to determine which article
 * to display in the knowledge modal for the current page/view.
 *
 * Rules:
 * - More specific paths take priority over wildcards.
 * - Unknown routes return null → modal shows "no article available" message.
 * - All slugs must exist in the ARTICLES registry (articles/index.ts).
 */

export interface ContextualArticleEntry {
  slug: string;
  /** Display name for the current page — shown as modal subtitle */
  pageName: string;
  /** Optional: link to the full Help Center section for this topic */
  helpCenterPath?: string;
}

/**
 * Ordered route-to-article mapping.
 * Checked from most specific to least specific using startsWith().
 */
const ROUTE_MAP: Array<{ match: string; entry: ContextualArticleEntry }> = [
  // Dashboard
  {
    match: '/dashboard',
    entry: {
      slug: 'dashboard-overview',
      pageName: 'Command Center Dashboard',
      helpCenterPath: '/help/dashboard-overview',
    },
  },

  // Master Calendar
  {
    match: '/calendar',
    entry: {
      slug: 'calendar-overview',
      pageName: 'Master Calendar',
      helpCenterPath: '/help/calendar-overview',
    },
  },

  // Brad iAdministrator
  {
    match: '/iadministrator',
    entry: {
      slug: 'iadministrator-overview',
      pageName: 'Brad iAdministrator',
      helpCenterPath: '/help/iadministrator-overview',
    },
  },

  // Help Center itself — show getting started
  {
    match: '/help',
    entry: {
      slug: 'overview',
      pageName: 'Help Center',
      helpCenterPath: '/help/overview',
    },
  },

  // Onboarding v2
  {
    match: '/onboarding-v2',
    entry: {
      slug: 'onboarding-v2-overview',
      pageName: 'Onboarding v2',
      helpCenterPath: '/help/onboarding-v2-overview',
    },
  },

  // Journey (v1)
  {
    match: '/journey',
    entry: {
      slug: 'onboarding-v2-overview',
      pageName: 'Onboarding Journey',
      helpCenterPath: '/help/onboarding-v2-overview',
    },
  },

  // Policy Library
  {
    match: '/library',
    entry: {
      slug: 'policy-lifecycle-states',
      pageName: 'Policy Library',
      helpCenterPath: '/help/policy-lifecycle-states',
    },
  },

  // Policy Lifecycle
  {
    match: '/policy-lifecycle',
    entry: {
      slug: 'policy-lifecycle-states',
      pageName: 'Policy Lifecycle',
      helpCenterPath: '/help/policy-lifecycle-states',
    },
  },

  // Forms — individual form (signing workspace)
  {
    match: '/forms/',
    entry: {
      slug: 'form-signing-flow',
      pageName: 'Form Signing',
      helpCenterPath: '/help/form-signing-flow',
    },
  },

  // Forms library
  {
    match: '/forms',
    entry: {
      slug: 'forms-overview',
      pageName: 'Forms & Templates',
      helpCenterPath: '/help/forms-overview',
    },
  },

  // Audit Mode
  {
    match: '/audit',
    entry: {
      slug: 'audit-mode-overview',
      pageName: 'Audit Mode',
      helpCenterPath: '/help/audit-mode-overview',
    },
  },

  // Evidence Center
  {
    match: '/evidence',
    entry: {
      slug: 'evidence-center-overview',
      pageName: 'Evidence Center',
      helpCenterPath: '/help/evidence-center-overview',
    },
  },

  // Master Controls
  {
    match: '/compliance/master-controls',
    entry: {
      slug: 'master-controls-overview',
      pageName: 'Master Controls Inventory',
      helpCenterPath: '/help/master-controls-overview',
    },
  },

  // Workflows
  {
    match: '/workflows',
    entry: {
      slug: 'workflow-signature-step',
      pageName: 'Workflows & Events',
      helpCenterPath: '/help/workflow-signature-step',
    },
  },

  // CES (Compliance Execution Sprints)
  {
    match: '/ces',
    entry: {
      slug: 'compliance-objects',
      pageName: 'Compliance Execution Sprints',
      helpCenterPath: '/help/compliance-objects',
    },
  },

  // System Documentation
  {
    match: '/system-documentation',
    entry: {
      slug: 'audit-trail',
      pageName: 'System Documentation',
      helpCenterPath: '/help/audit-trail',
    },
  },

  // Framework / Taxonomy
  {
    match: '/framework',
    entry: {
      slug: 'master-controls-domains',
      pageName: 'Policy Framework',
      helpCenterPath: '/help/master-controls-domains',
    },
  },

  // Login / Auth flows — getting started
  {
    match: '/login',
    entry: {
      slug: 'overview',
      pageName: 'Login',
      helpCenterPath: '/help/overview',
    },
  },
];

/**
 * Resolve the contextual article entry for a given pathname.
 * Returns null for unknown routes.
 */
export function resolveContextualArticle(pathname: string): ContextualArticleEntry | null {
  // Sort by match length descending to prefer more specific matches first
  const sorted = [...ROUTE_MAP].sort((a, b) => b.match.length - a.match.length);
  for (const { match, entry } of sorted) {
    if (pathname === match || pathname.startsWith(match)) {
      return entry;
    }
  }
  return null;
}
