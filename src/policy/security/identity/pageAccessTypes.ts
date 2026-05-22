/**
 * Page View Access — type definitions.
 *
 * A Salesforce-style page access matrix layered ON TOP of the existing
 * Phase A role/permission system. Page access is an INDEPENDENT axis
 * from role permissions. The final permission for a write action
 * requires BOTH:
 *   - The user's role grants the underlying capability
 *     (e.g. `user.provision`, `user.suspend`, ...).
 *   - The user has explicit `write` page access on the relevant page.
 *
 * Read access has a softer rule: if a user has no explicit page-access
 * record, view-time fallback returns to the existing feature/role
 * evaluation (to avoid silently locking existing demo users out of
 * pages they used to see). This fallback is documented in
 * `pageAccess.ts` and is intentional.
 */

/** Lowest-to-highest access level for a single page. */
export type PageAccessLevel = 'none' | 'read' | 'write';

/** Stable id for a single page in the registry. */
export type PageId = string;

/** Stable id for a component group (a collection of pages). */
export type ComponentId = string;

/** Explicit grant for one page. `write` implies `read`. */
export interface PageAccessGrant {
  pageId: PageId;
  access: PageAccessLevel;
}

/**
 * A user's explicit access settings for one component group.
 *
 * Semantics:
 *  - `enabled === false` → ALL child pages are treated as `none`,
 *    overriding both the per-page grants AND the role-based fallback.
 *  - `enabled === true`  → per-page grants apply. Missing per-page
 *    entries fall back to `defaultAccess`.
 *  - A user with no entry at all for a component falls back to the
 *    existing role/feature evaluation for read, and `none` for write.
 */
export interface ComponentAccessGrant {
  componentId: ComponentId;
  enabled: boolean;
  defaultAccess: PageAccessLevel;
  pages: PageAccessGrant[];
}

/** Per-user collection of explicit component access grants. */
export interface UserPageAccess {
  userId: string;
  components: ComponentAccessGrant[];
}

/** Registry entry describing one viewable page. */
export interface PageRegistryEntry {
  pageId: PageId;
  label: string;
  /** React-Router path pattern this page is reachable at (informational). */
  routePattern: string;
  /** The component group this page belongs to. */
  componentGroup: ComponentId;
  /** Default access level when a user has no explicit grant. */
  defaultAccess: PageAccessLevel;
  /** Optional admin-facing description. */
  description?: string;
}

/** Registry entry describing one component group (a collection of pages). */
export interface ComponentGroupEntry {
  componentId: ComponentId;
  label: string;
  /** Default access for the group when no explicit grant exists. */
  defaultAccess: PageAccessLevel;
  /** Short admin-facing description shown in the access matrix UI. */
  description?: string;
  /** Display order (lower comes first). */
  order: number;
}

/** Audit entry for a page-access mutation. */
export interface PageAccessAuditEntry {
  timestamp: string;
  actorEmail: string;
  targetEmail: string;
  componentId?: ComponentId;
  pageId?: PageId;
  oldAccess?: PageAccessLevel | 'component:enabled' | 'component:disabled';
  newAccess?: PageAccessLevel | 'component:enabled' | 'component:disabled';
  action: 'page_access_updated';
  /** Optional human-readable note (e.g. "bulk set to read"). */
  note?: string;
}
