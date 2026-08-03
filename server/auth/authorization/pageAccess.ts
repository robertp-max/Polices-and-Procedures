/**
 * ADR-0002 Phase 4 — server-authoritative page-visibility PROJECTION.
 *
 * Page access is a NON-AUTHORIZING projection (ADR §B6): it only describes which
 * UI pages make sense for a principal. Hiding a page is never security; showing a
 * page grants nothing; every API authorizes independently via the Phase-3
 * evaluator. Overrides may RESTRICT/hide but must never manufacture access and
 * never bypass account-status deny.
 *
 * Derivation precedence (fail-closed):
 *   account-status deny  → override(enabled:false)  → explicit override grant
 *     → privileged default (admin/none-default pages) → registry default (read)
 *
 * Pure (no I/O); the shared page registry is imported via the @ alias like the
 * permission catalog. Deliberately simpler than the legacy client feature-
 * fallback: derivation is from account status + privilege + explicit overrides,
 * which is the server-authoritative model the ADR prefers.
 */
import { PAGE_REGISTRY, COMPONENT_GROUP_BY_ID } from '@/policy/security/identity/pageRegistry';
import type {
  ComponentAccessGrant, PageAccessLevel, PageId, UserPageAccess,
} from '@/policy/security/identity/pageAccessTypes';
import { POLICY_VERSION } from './catalog.js';

export type PageAccessReason =
  | 'ACCOUNT_NOT_ACTIVE'
  | 'OVERRIDE_DISABLED'
  | 'OVERRIDE_GRANT'
  | 'PRIVILEGED_DEFAULT'
  | 'REGISTRY_DEFAULT'
  | 'NO_ACCESS';

export interface PageVisibility {
  pageId: PageId;
  componentGroup: string;
  label: string;
  access: PageAccessLevel;
  visible: boolean;
  reason: PageAccessReason;
}

export interface PageAccessProjection {
  principalUserId: string;
  accountActive: boolean;
  privileged: boolean;
  pages: PageVisibility[];
  evaluatedAt: string;
  policyVersion: string;
}

export interface PageAccessProjectionInput {
  principalUserId: string;
  accountActive: boolean;
  privileged: boolean;
  /** Explicit per-user overrides, already parsed. */
  override?: UserPageAccess | null;
  nowIso: string;
  policyVersion?: string;
}

/** write implies read; a projection never widens beyond the requested level. */
function clampToRead(level: PageAccessLevel): PageAccessLevel {
  return level === 'write' ? 'read' : level;
}

function overrideForComponent(override: UserPageAccess | null | undefined, componentId: string): ComponentAccessGrant | undefined {
  return override?.components?.find((c) => c.componentId === componentId);
}

export function computePageAccessProjection(input: PageAccessProjectionInput): PageAccessProjection {
  const policyVersion = input.policyVersion ?? POLICY_VERSION;
  const pages: PageVisibility[] = PAGE_REGISTRY.map((entry) => {
    const group = COMPONENT_GROUP_BY_ID[entry.componentGroup];
    const label = entry.label;
    const settle = (access: PageAccessLevel, reason: PageAccessReason): PageVisibility =>
      ({ pageId: entry.pageId, componentGroup: entry.componentGroup, label, access, visible: access !== 'none', reason });

    // 1 — account-status deny (fail-closed): nothing is visible.
    if (!input.accountActive) return settle('none', 'ACCOUNT_NOT_ACTIVE');

    // 2/3 — explicit overrides (may restrict or grant, never bypass step 1).
    const grant = overrideForComponent(input.override, entry.componentGroup);
    if (grant) {
      if (grant.enabled === false) return settle('none', 'OVERRIDE_DISABLED');
      const perPage = grant.pages?.find((p) => p.pageId === entry.pageId);
      const level = perPage?.access ?? grant.defaultAccess ?? 'none';
      if (level !== 'none') return settle(level, 'OVERRIDE_GRANT');
      // explicit none → fall through to defaults (an empty grant is not a deny).
    }

    // 4 — privileged default: admin/gated pages (registry defaultAccess 'none')
    //     are visible read-only to privileged principals, hidden otherwise.
    const registryDefault = group?.defaultAccess ?? entry.defaultAccess ?? 'none';
    if ((entry.defaultAccess === 'none' || registryDefault === 'none')) {
      return input.privileged ? settle('read', 'PRIVILEGED_DEFAULT') : settle('none', 'NO_ACCESS');
    }

    // 5 — registry default (clamped to read; write is never granted by projection).
    return settle(clampToRead(registryDefault), 'REGISTRY_DEFAULT');
  });

  return {
    principalUserId: input.principalUserId,
    accountActive: input.accountActive,
    privileged: input.privileged,
    pages,
    evaluatedAt: input.nowIso,
    policyVersion,
  };
}

/** Fail-closed parse of an opaque persisted override record into UserPageAccess.
 *  Any malformed shape yields null (→ defaults apply), never a thrown error and
 *  never a fabricated grant. */
export function parseOverrideRecord(raw: unknown, expectedUserId: string): UserPageAccess | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { userId?: unknown; components?: unknown };
  if (typeof r.userId !== 'string' || !Array.isArray(r.components)) return null;
  const components: ComponentAccessGrant[] = [];
  for (const c of r.components) {
    if (!c || typeof c !== 'object') continue;
    const cc = c as { componentId?: unknown; enabled?: unknown; defaultAccess?: unknown; pages?: unknown };
    if (typeof cc.componentId !== 'string') continue;
    const pages = Array.isArray(cc.pages)
      ? cc.pages.flatMap((p) => {
          if (!p || typeof p !== 'object') return [];
          const pp = p as { pageId?: unknown; access?: unknown };
          if (typeof pp.pageId !== 'string') return [];
          const access = pp.access === 'read' || pp.access === 'write' || pp.access === 'none' ? pp.access : 'none';
          return [{ pageId: pp.pageId, access } as const];
        })
      : [];
    components.push({
      componentId: cc.componentId,
      enabled: cc.enabled !== false,
      defaultAccess: cc.defaultAccess === 'read' || cc.defaultAccess === 'write' || cc.defaultAccess === 'none' ? cc.defaultAccess : 'none',
      pages,
    });
  }
  return { userId: expectedUserId, components };
}
