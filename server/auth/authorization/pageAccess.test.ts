/**
 * ADR-0002 Phase 4 — page-visibility projection tests. Uses the real page
 * registry so a registry change that breaks the projection fails here.
 */
import { describe, expect, it } from 'vitest';
import { PAGE_REGISTRY } from '@/policy/security/identity/pageRegistry';
import type { UserPageAccess } from '@/policy/security/identity/pageAccessTypes';
import { computePageAccessProjection, parseOverrideRecord, type PageAccessProjectionInput } from './pageAccess.ts';

const NOW = '2027-01-01T00:00:00.000Z';
const gated = PAGE_REGISTRY.find((p) => p.defaultAccess === 'none')!;   // admin/user-management page
const normal = PAGE_REGISTRY.find((p) => p.defaultAccess !== 'none')!;  // ordinary page

const input = (over: Partial<PageAccessProjectionInput> = {}): PageAccessProjectionInput => ({
  principalUserId: 'usr-1',
  accountActive: true,
  privileged: false,
  nowIso: NOW,
  ...over,
});
const byId = (proj: ReturnType<typeof computePageAccessProjection>, id: string) => proj.pages.find((p) => p.pageId === id)!;

describe('computePageAccessProjection', () => {
  it('non-active account hides every page (fail-closed)', () => {
    const proj = computePageAccessProjection(input({ accountActive: false }));
    expect(proj.pages.every((p) => p.access === 'none' && !p.visible && p.reason === 'ACCOUNT_NOT_ACTIVE')).toBe(true);
  });

  it('active non-privileged: ordinary pages read, gated pages hidden', () => {
    const proj = computePageAccessProjection(input());
    expect(byId(proj, normal.pageId)).toMatchObject({ access: 'read', visible: true, reason: 'REGISTRY_DEFAULT' });
    expect(byId(proj, gated.pageId)).toMatchObject({ access: 'none', visible: false, reason: 'NO_ACCESS' });
  });

  it('privileged principal sees gated pages read-only', () => {
    const proj = computePageAccessProjection(input({ privileged: true }));
    expect(byId(proj, gated.pageId)).toMatchObject({ access: 'read', visible: true, reason: 'PRIVILEGED_DEFAULT' });
  });

  it('override enabled:false hides the component pages (restrict)', () => {
    const override: UserPageAccess = { userId: 'usr-1', components: [{ componentId: normal.componentGroup, enabled: false, defaultAccess: 'none', pages: [] }] };
    const proj = computePageAccessProjection(input({ override }));
    expect(byId(proj, normal.pageId)).toMatchObject({ access: 'none', reason: 'OVERRIDE_DISABLED' });
  });

  it('explicit override grant is honored (but only when account active)', () => {
    const override: UserPageAccess = { userId: 'usr-1', components: [{ componentId: gated.componentGroup, enabled: true, defaultAccess: 'none', pages: [{ pageId: gated.pageId, access: 'write' }] }] };
    const proj = computePageAccessProjection(input({ override }));
    expect(byId(proj, gated.pageId)).toMatchObject({ access: 'write', visible: true, reason: 'OVERRIDE_GRANT' });
  });

  it('account-status deny beats an explicit override grant', () => {
    const override: UserPageAccess = { userId: 'usr-1', components: [{ componentId: gated.componentGroup, enabled: true, defaultAccess: 'write', pages: [{ pageId: gated.pageId, access: 'write' }] }] };
    const proj = computePageAccessProjection(input({ accountActive: false, override }));
    expect(byId(proj, gated.pageId)).toMatchObject({ access: 'none', reason: 'ACCOUNT_NOT_ACTIVE' });
  });

  it('stamps evaluatedAt + policyVersion and covers every registry page', () => {
    const proj = computePageAccessProjection(input());
    expect(proj.evaluatedAt).toBe(NOW);
    expect(proj.policyVersion).toBe('authz.v1');
    expect(proj.pages.length).toBe(PAGE_REGISTRY.length);
  });
});

describe('parseOverrideRecord (fail-closed)', () => {
  it('returns null for malformed input', () => {
    expect(parseOverrideRecord(null, 'usr-1')).toBeNull();
    expect(parseOverrideRecord({ nope: true }, 'usr-1')).toBeNull();
    expect(parseOverrideRecord({ userId: 'x' }, 'usr-1')).toBeNull(); // no components array
  });

  it('parses a valid record and coerces bad access values to none', () => {
    const parsed = parseOverrideRecord({ userId: 'ignored', components: [{ componentId: 'cmp-x', enabled: true, defaultAccess: 'bogus', pages: [{ pageId: 'page.a', access: 'write' }, { pageId: 'page.b', access: 'weird' }] }] }, 'usr-1');
    expect(parsed?.userId).toBe('usr-1'); // keyed by expected id, not the record's
    expect(parsed?.components[0]).toMatchObject({ componentId: 'cmp-x', enabled: true, defaultAccess: 'none' });
    expect(parsed?.components[0].pages).toEqual([{ pageId: 'page.a', access: 'write' }, { pageId: 'page.b', access: 'none' }]);
  });
});
