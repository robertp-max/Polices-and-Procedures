/**
 * Page View Access — access helpers.
 *
 * Pure (non-React) helpers used by route guards, nav filtering,
 * UI gates, and the access-matrix admin page. Every helper resolves
 * a `DemoUser` (or null) → page-access decision.
 *
 * Final-permission semantics:
 *   - View: user has page-level read OR write OR (fallback when no
 *           explicit record exists) any role-based feature access.
 *   - Write: user has page-level write AND (the existing role/feature
 *            evaluation grants the underlying action). Roles still
 *            gate destructive operations; page access is an
 *            additional curtain on top.
 *
 * Manager users (Robert + Marites) are short-circuited to always
 * allow read + write everywhere so admin tooling can never lock them
 * out of the access matrix. Their identities are pinned by email
 * AND by user id to survive seed/auth refactors.
 */

import type { DemoUser as AuthDemoUser } from '@/auth/api';
import { resolveUserIdFromAuth } from './demoUsers';
import { PAGE_BY_ID, COMPONENT_GROUP_BY_ID } from './pageRegistry';
import { getLivePageAccessForIdentity } from './pageAccessStore';
import { canViewFeature, isAdminUser } from '../features/featureAccess';
import type { FeatureId } from '../features/types';
import type {
  ComponentAccessGrant,
  PageAccessLevel,
  PageId,
} from './pageAccessTypes';

// ─── Page-access manager identities ──────────────────────────
// These users can ALWAYS open the Page View Access matrix and grant
// access to others. Pinned by both email AND user id so refactors
// to either side don't accidentally lock them out.
const PAGE_ACCESS_MANAGER_EMAILS = new Set([
  'robertp@careindeed.com',
  'maritesa@careindeed.com',
]);
const PAGE_ACCESS_MANAGER_USER_IDS = new Set([
  'demo-user-careindeed', // robertp@careindeed.com
  'usr-marites',          // maritesa@careindeed.com
]);

/**
 * Optional fallback: when a page maps to one of these feature ids and
 * the user has NO explicit page-access record, fall back to the
 * existing feature evaluation. This preserves the demo for users that
 * have not been given an explicit page-access grant yet.
 *
 * The fallback is intentionally LIMITED: write access NEVER falls
 * back — it requires an explicit `write` grant.
 *
 * Pages not listed here have no feature-fallback. If the page is not
 * in the user's explicit grant the helpers will rely on the
 * component default and ultimately on the route guard's deny state.
 */
const PAGE_TO_FEATURE_FALLBACK: Record<PageId, FeatureId> = {
  'page.dashboard':             'dashboard.view',
  'page.library':               'policyLibrary.view',
  'page.policy-detail':         'policyLibrary.view',
  'page.policy-lifecycle':      'policyLifecycle.view',
  'page.framework':             'frameworkTaxonomy.view',
  'page.taxonomy':              'frameworkTaxonomy.view',
  'page.achc-survey':           'surveyor.view',
  'page.forms':                 'forms.view',
  'page.form-viewer':           'ecign.view',
  'page.ces-calendar':          'ces.view',
  'page.ces-board':             'ces.view',
  'page.ces-workloads':         'ces.view',
  'page.ces-reports':           'ces.view',
  'page.my-tasks':              'pmTasks.view',
  'page.workflows':             'workflows.view',
  'page.master-controls':       'masterControlInventory.view',
  'page.pm-tasks':              'pmTasks.view',
  'page.pm-sprint-plan':        'pmTasks.view',
  'page.pm-sprint-review':      'pmTasks.view',
  'page.pm-approvals':          'pmTasks.view',
  'page.pm-dashboard':          'pmTasks.view',
  'page.calendar':              'calendar.view',
  'page.evidence':              'evidence.view',
  'page.audit':                 'audit.view',
  'page.journey-home':          'journey.view',
  'page.journey-v1':            'journey.view',
  'page.journey-appendix-f':    'journey.view',
  'page.journey-module':        'journey.view',
  'page.journey-supervisor':    'journey.view',
  'page.journey-admin':         'journey.view',
  'page.journey-guide':         'journey.view',
  'page.onboarding-v2':         'onboardingV2.view',
  'page.clinicians':            'clinicians.view',
  'page.clinician-detail':      'clinicians.view',
  'page.patients':              'patients.view',
  'page.patient-detail':        'patients.view',
  'page.staffing-calendar':     'staffing.calendar.view',
  'page.iadministrator':        'brad.view',
  'page.user-assignments':      'admin.users.view',
  'page.user-groups':           'admin.userGroups.view',
  'page.admin-roles':           'admin.roles.view',
  'page.admin-permissions':     'admin.permissions.view',
  'page.help-center':           'helpCenter.view',
  'page.system-documentation':  'systemDocumentation.view',
  'page.demo':                  'demo.view',
  'page.hubstaff':              'hubstaff.view',
};

// ─── Identity ────────────────────────────────────────────────

function isPageAccessManager(authUser: AuthDemoUser | null): boolean {
  if (!authUser) return false;
  const email = authUser.email?.toLowerCase();
  if (email && PAGE_ACCESS_MANAGER_EMAILS.has(email)) return true;
  const userId = resolveUserIdFromAuth(authUser);
  return PAGE_ACCESS_MANAGER_USER_IDS.has(userId);
}

/**
 * True if the user is allowed to open the Page View Access matrix
 * AND modify access assignments for other users. Robert + Marites
 * are explicitly permitted regardless of role labels. Super Admin
 * is also permitted to keep the existing demo workflows alive.
 */
export function canManagePageAccess(authUser: AuthDemoUser | null): boolean {
  if (isPageAccessManager(authUser)) return true;
  if (isAdminUser(authUser)) {
    // isAdminUser includes the legacy `super_admin` role bypass and
    // group membership in Super Admin / Admin / System. We keep this
    // for continuity with the existing admin tooling, but the manager
    // identities above take precedence and always pass.
    return true;
  }
  return false;
}

// ─── Grant resolution ────────────────────────────────────────

interface ResolvedComponentGrant {
  grant: ComponentAccessGrant | undefined;
  /** True if the user has any explicit entry for the component. */
  hasExplicitEntry: boolean;
}

function resolveComponentForPage(userId: string, email: string | undefined, pageId: PageId): ResolvedComponentGrant {
  const page = PAGE_BY_ID[pageId];
  if (!page) return { grant: undefined, hasExplicitEntry: false };
  const record = getLivePageAccessForIdentity(userId, email);
  const grant = record.components.find(c => c.componentId === page.componentGroup);
  // `hasExplicitEntry` is true when the user has a stored entry for
  // this component. The reconciled record always returns a grant, so
  // we treat `enabled || any non-default page set` as explicit.
  const hasExplicitEntry = !!grant && (
    grant.enabled
    || grant.pages.some(p => p.access !== 'none')
    || grant.defaultAccess !== COMPONENT_GROUP_BY_ID[page.componentGroup]?.defaultAccess
  );
  return { grant, hasExplicitEntry };
}

function explicitPageLevel(grant: ComponentAccessGrant, pageId: PageId): PageAccessLevel {
  const entry = grant.pages.find(p => p.pageId === pageId);
  if (entry) return entry.access;
  return grant.defaultAccess;
}

// ─── Public helpers ──────────────────────────────────────────

/**
 * Resolve the user's effective access level for a single page.
 *
 * Order of evaluation:
 *   1. Page-access manager → 'write'.
 *   2. Component grant exists & enabled === false → 'none' (overrides
 *      everything, including the fallback).
 *   3. Component grant exists & enabled === true → page's explicit
 *      level (or component default if no per-page entry).
 *   4. No explicit entry → fall back to feature evaluation: if the
 *      user can see the feature, return 'read'; else 'none'. Write
 *      is never granted by fallback.
 */
export function getPageAccessLevel(
  authUser: AuthDemoUser | null,
  pageId: PageId,
): PageAccessLevel {
  if (!authUser) return 'none';

  if (isPageAccessManager(authUser)) return 'write';

  const userId = resolveUserIdFromAuth(authUser);
  const email = authUser.email?.toLowerCase();
  const { grant, hasExplicitEntry } = resolveComponentForPage(userId, email, pageId);

  if (grant && hasExplicitEntry) {
    if (!grant.enabled) return 'none';
    return explicitPageLevel(grant, pageId);
  }

  // Fallback path. Limited to read only — write requires explicit grant.
  const fallbackFeature = PAGE_TO_FEATURE_FALLBACK[pageId];
  if (fallbackFeature) {
    const decision = canViewFeature(authUser, fallbackFeature);
    if (decision.allow) return 'read';
  }

  // Last resort — the registry's own defaultAccess. For User
  // Management this is `none`, so non-admin users without an explicit
  // grant cannot see those pages. For most other pages it's `read`,
  // matching the existing role-based defaults.
  const page = PAGE_BY_ID[pageId];
  if (!page) return 'none';
  return page.defaultAccess === 'write' ? 'read' : page.defaultAccess;
}

/** True if the user can view (open / read) the given page. */
export function canViewPage(authUser: AuthDemoUser | null, pageId: PageId): boolean {
  const level = getPageAccessLevel(authUser, pageId);
  return level === 'read' || level === 'write';
}

/**
 * True if the user can perform a write action on the page.
 *
 * Strict: requires the user to have EXPLICIT page-level `write`. The
 * caller is expected to ALSO check the role-level action permission
 * via `canPerformAction` (in features/featureAccess.ts) for hard
 * gating of destructive operations. Page access is the outer curtain,
 * role permission is the inner door.
 */
export function canWritePage(authUser: AuthDemoUser | null, pageId: PageId): boolean {
  return getPageAccessLevel(authUser, pageId) === 'write';
}

/**
 * Resolve every page that the user can currently view. Used for nav
 * filtering and admin diagnostics.
 */
export function listViewablePageIds(authUser: AuthDemoUser | null): PageId[] {
  const ids: PageId[] = [];
  for (const page of Object.values(PAGE_BY_ID)) {
    if (canViewPage(authUser, page.pageId)) ids.push(page.pageId);
  }
  return ids;
}
