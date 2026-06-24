/**
 * Page View Access — canonical page + component registry.
 *
 * Single source of truth for which app pages can be controlled via
 * the Page View Access matrix. Inferred from `src/App.tsx` routes and
 * `CommandCenterLayout.tsx` navigation entries. Adding a new public
 * route should also be reflected here so admins can manage its view
 * access from the matrix UI.
 *
 * Note: `routePattern` mirrors the React-Router path declared in
 * App.tsx. Route guards use a *pageId* string to identify the page,
 * not the path, so internal route refactors do not break the access
 * matrix.
 */

import type { ComponentGroupEntry, ComponentId, PageId, PageRegistryEntry } from './pageAccessTypes';

export const COMPONENT_GROUPS: ComponentGroupEntry[] = [
  {
    componentId: 'cmp-dashboard',
    label: 'Dashboard / Command Center',
    defaultAccess: 'read',
    description: 'Operator landing surfaces.',
    order: 10,
  },
  {
    componentId: 'cmp-policy-library',
    label: 'Policy Library',
    defaultAccess: 'read',
    description: 'Policy browsing, lifecycle, framework / taxonomy.',
    order: 20,
  },
  {
    componentId: 'cmp-forms',
    label: 'Forms',
    defaultAccess: 'read',
    description: 'Forms library and signing surfaces.',
    order: 30,
  },
  {
    componentId: 'cmp-ces',
    label: 'CES / Compliance Execution',
    defaultAccess: 'read',
    description: 'Sprint board, calendar, workloads, reports, PM layer.',
    order: 40,
  },
  {
    componentId: 'cmp-calendar',
    label: 'Calendar',
    defaultAccess: 'read',
    description: 'Master CES calendar + mobile incident execution.',
    order: 50,
  },
  {
    componentId: 'cmp-evidence',
    label: 'Evidence Center',
    defaultAccess: 'read',
    description: 'Evidence collection and inspection workspace.',
    order: 60,
  },
  {
    componentId: 'cmp-audit',
    label: 'Audit Mode',
    defaultAccess: 'read',
    description: 'Read-only audit and export surfaces.',
    order: 70,
  },
  {
    componentId: 'cmp-journey',
    label: 'Journey / Training',
    defaultAccess: 'read',
    description: 'Onboarding journey, modules, Onboarding v2 activation.',
    order: 80,
  },
  {
    componentId: 'cmp-staffing',
    label: 'Staffing / Clinical',
    defaultAccess: 'read',
    description: 'Clinician + patient profiles, staffing calendar.',
    order: 90,
  },
  {
    componentId: 'cmp-iadministrator',
    label: 'iAdministrator',
    defaultAccess: 'read',
    description: 'Brad decision-support surfaces.',
    order: 100,
  },
  {
    componentId: 'cmp-user-management',
    label: 'User Management / Identity Admin',
    defaultAccess: 'none',
    description: 'User assignments, roles, permissions, groups, page access.',
    order: 110,
  },
  {
    componentId: 'cmp-system',
    label: 'System / Settings',
    defaultAccess: 'read',
    description: 'Help Center, system documentation, demo, operational tooling.',
    order: 120,
  },
];

export const COMPONENT_GROUP_BY_ID: Record<ComponentId, ComponentGroupEntry> =
  Object.fromEntries(COMPONENT_GROUPS.map(c => [c.componentId, c]));

export const PAGE_REGISTRY: PageRegistryEntry[] = [
  // ─── Dashboard ─────────────────────────────────────────────
  {
    pageId: 'page.dashboard',
    label: 'Dashboard',
    routePattern: '/dashboard',
    componentGroup: 'cmp-dashboard',
    defaultAccess: 'read',
    description: 'Primary operator home screen.',
  },

  // ─── Policy Library ────────────────────────────────────────
  {
    pageId: 'page.library',
    label: 'Policy Library',
    routePattern: '/library',
    componentGroup: 'cmp-policy-library',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.policy-detail',
    label: 'Policy Detail',
    routePattern: '/library/:policyId',
    componentGroup: 'cmp-policy-library',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.policy-lifecycle',
    label: 'Policy Lifecycle',
    routePattern: '/policy-lifecycle',
    componentGroup: 'cmp-policy-library',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.framework',
    label: 'Framework',
    routePattern: '/framework',
    componentGroup: 'cmp-policy-library',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.achc-survey',
    label: 'ACHC Survey Alignment',
    routePattern: '/framework/achc-survey',
    componentGroup: 'cmp-policy-library',
    defaultAccess: 'read',
  },

  // ─── Forms ─────────────────────────────────────────────────
  {
    pageId: 'page.forms',
    label: 'Forms Library',
    routePattern: '/forms',
    componentGroup: 'cmp-forms',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.form-viewer',
    label: 'Form Viewer / Sign',
    routePattern: '/forms/:formId',
    componentGroup: 'cmp-forms',
    defaultAccess: 'read',
  },

  // ─── CES ───────────────────────────────────────────────────
  {
    pageId: 'page.ces-calendar',
    label: 'CES Calendar',
    routePattern: '/ces/calendar',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.ces-board',
    label: 'CES Sprint Board',
    routePattern: '/ces/board',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.ces-reports',
    label: 'CES Reports',
    routePattern: '/ces/reports',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.my-tasks',
    label: 'My Tasks',
    routePattern: '/my-tasks',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.workflows',
    label: 'Workflows Library',
    routePattern: '/workflows',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.master-controls',
    label: 'Master Control Inventory',
    routePattern: '/compliance/master-controls',
    componentGroup: 'cmp-ces',
    defaultAccess: 'read',
  },

  // ─── Calendar ──────────────────────────────────────────────
  {
    pageId: 'page.calendar',
    label: 'Master Calendar',
    routePattern: '/calendar',
    componentGroup: 'cmp-calendar',
    defaultAccess: 'read',
  },

  // ─── Evidence ──────────────────────────────────────────────
  {
    pageId: 'page.evidence',
    label: 'Evidence Center',
    routePattern: '/evidence',
    componentGroup: 'cmp-evidence',
    defaultAccess: 'read',
  },

  // ─── Audit ─────────────────────────────────────────────────
  {
    pageId: 'page.audit',
    label: 'Audit Mode',
    routePattern: '/audit',
    componentGroup: 'cmp-audit',
    defaultAccess: 'read',
  },

  // ─── Journey / Training ────────────────────────────────────
  {
    pageId: 'page.journey-home',
    label: 'Journey Home',
    routePattern: '/journey',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-v1',
    label: 'Journey v1',
    routePattern: '/journey/v1-journey',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-appendix-f',
    label: 'Journey — Appendix F',
    routePattern: '/journey/appendix-f',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-module',
    label: 'Journey Module Player',
    routePattern: '/journey/module/:moduleId',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-supervisor',
    label: 'Journey Supervisor View',
    routePattern: '/journey/supervisor',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-admin',
    label: 'Journey Admin',
    routePattern: '/journey/admin',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.journey-guide',
    label: 'Journey User Guide',
    routePattern: '/journey/guide',
    componentGroup: 'cmp-journey',
    defaultAccess: 'read',
  },

  // ─── Staffing / Clinical ───────────────────────────────────
  {
    pageId: 'page.clinicians',
    label: 'Clinician Profiles',
    routePattern: '/clinicians',
    componentGroup: 'cmp-staffing',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.clinician-detail',
    label: 'Clinician Detail',
    routePattern: '/clinicians/:clinicianId',
    componentGroup: 'cmp-staffing',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.patients',
    label: 'Patient Profiles',
    routePattern: '/patients',
    componentGroup: 'cmp-staffing',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.patient-detail',
    label: 'Patient Detail',
    routePattern: '/patients/:patientId',
    componentGroup: 'cmp-staffing',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.staffing-calendar',
    label: 'Staffing Calendar',
    routePattern: '/staffing-calendar',
    componentGroup: 'cmp-staffing',
    defaultAccess: 'read',
  },

  // ─── iAdministrator ────────────────────────────────────────
  {
    pageId: 'page.iadministrator',
    label: 'iAdministrator (Brad)',
    routePattern: '/iadministrator',
    componentGroup: 'cmp-iadministrator',
    defaultAccess: 'read',
  },

  // ─── User Management ───────────────────────────────────────
  // Default access for User Management is `none` — admins must
  // explicitly grant access to non-Robert/non-Marites users.
  {
    pageId: 'page.user-assignments',
    label: 'User Assignments',
    routePattern: '/admin/users',
    componentGroup: 'cmp-user-management',
    defaultAccess: 'none',
  },
  {
    pageId: 'page.user-groups',
    label: 'User Groups',
    routePattern: '/admin/user-groups',
    componentGroup: 'cmp-user-management',
    defaultAccess: 'none',
  },
  {
    pageId: 'page.admin-roles',
    label: 'Roles',
    routePattern: '/admin/roles',
    componentGroup: 'cmp-user-management',
    defaultAccess: 'none',
  },
  {
    pageId: 'page.admin-permissions',
    label: 'Permissions',
    routePattern: '/admin/permissions',
    componentGroup: 'cmp-user-management',
    defaultAccess: 'none',
  },
  {
    pageId: 'page.page-access',
    label: 'Page View Access',
    routePattern: '/admin/users#page-access',
    componentGroup: 'cmp-user-management',
    defaultAccess: 'none',
    description: 'Page-access matrix — controls who can view/write each app page.',
  },

  // ─── System / Settings ─────────────────────────────────────
  {
    pageId: 'page.help-center',
    label: 'Help Center',
    routePattern: '/help',
    componentGroup: 'cmp-system',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.system-documentation',
    label: 'System Documentation',
    routePattern: '/system-documentation',
    componentGroup: 'cmp-system',
    defaultAccess: 'read',
  },
  {
    pageId: 'page.hubstaff',
    label: 'Hubstaff Staging',
    routePattern: '/hubstaff',
    componentGroup: 'cmp-system',
    defaultAccess: 'read',
  },
];

export const PAGE_BY_ID: Record<PageId, PageRegistryEntry> = Object.fromEntries(
  PAGE_REGISTRY.map(p => [p.pageId, p]),
);

/** Get all pages belonging to one component group. */
export function getPagesForComponent(componentId: ComponentId): PageRegistryEntry[] {
  return PAGE_REGISTRY.filter(p => p.componentGroup === componentId);
}

/** Sort component groups by their declared display order. */
export function getOrderedComponentGroups(): ComponentGroupEntry[] {
  return [...COMPONENT_GROUPS].sort((a, b) => a.order - b.order);
}
