import { describe, it, expect } from 'vitest';
import {
  BRAD_DEFAULT_ROUTE,
  isGovernanceOnly,
  resolvePostLoginDestination,
  safeReturnTo,
} from './safeRedirect';

describe('safeReturnTo', () => {
  it('accepts a safe internal path', () => {
    expect(safeReturnTo('/governance/meetings')).toBe('/governance/meetings');
  });
  it('rejects external, protocol-relative, and login-loop targets', () => {
    expect(safeReturnTo('https://evil.example')).toBe(BRAD_DEFAULT_ROUTE);
    expect(safeReturnTo('//evil.example')).toBe(BRAD_DEFAULT_ROUTE);
    expect(safeReturnTo('/login?returnTo=/x')).toBe(BRAD_DEFAULT_ROUTE);
    expect(safeReturnTo(null)).toBe(BRAD_DEFAULT_ROUTE);
  });
});

describe('isGovernanceOnly', () => {
  it('is true when the user holds portal access and only governance groups', () => {
    expect(
      isGovernanceOnly({
        permissions: ['governance.portal.access', 'policy.view'],
        groupIds: ['grp-governance-board-chair'],
      }),
    ).toBe(true);
  });

  it('is false when the user also holds a non-governance workspace group (mixed role)', () => {
    expect(
      isGovernanceOnly({
        permissions: ['governance.portal.access', 'policy.view'],
        groupIds: ['grp-governance-board-chair', 'grp-compliance'],
      }),
    ).toBe(false);
  });

  it('is false for a technical Super Admin (has admin group, not governance-only)', () => {
    expect(
      isGovernanceOnly({
        permissions: ['governance.portal.access', 'user.provision'],
        groupIds: ['grp-super-admin'],
      }),
    ).toBe(false);
  });

  it('is false without the portal permission', () => {
    expect(isGovernanceOnly({ permissions: ['policy.view'], groupIds: ['grp-rn'] })).toBe(false);
  });

  it('is false with empty access', () => {
    expect(isGovernanceOnly({ permissions: [], groupIds: [] })).toBe(false);
    expect(isGovernanceOnly(null)).toBe(false);
  });
});

describe('resolvePostLoginDestination', () => {
  const govOnly = { permissions: ['governance.portal.access'], groupIds: ['grp-governance-cfo'] };
  const mixed = { permissions: ['governance.portal.access', 'audit.read'], groupIds: ['grp-governance-cfo', 'grp-compliance'] };

  it('honors a valid authorized deep link first (governance-only user, explicit returnTo)', () => {
    expect(resolvePostLoginDestination(govOnly, '/governance/decisions')).toBe('/governance/decisions');
  });

  it('sends a governance-only user with no returnTo to /governance', () => {
    expect(resolvePostLoginDestination(govOnly, null)).toBe('/governance');
  });

  it('sends a mixed-role user to the normal default', () => {
    expect(resolvePostLoginDestination(mixed, null)).toBe(BRAD_DEFAULT_ROUTE);
  });

  it('ignores an unsafe returnTo and falls back appropriately', () => {
    expect(resolvePostLoginDestination(govOnly, 'https://evil.example')).toBe('/governance');
    expect(resolvePostLoginDestination(mixed, '//evil.example')).toBe(BRAD_DEFAULT_ROUTE);
  });

  it('sends a non-governance user to the normal default', () => {
    expect(resolvePostLoginDestination({ permissions: ['policy.view'], groupIds: ['grp-rn'] }, null)).toBe(
      BRAD_DEFAULT_ROUTE,
    );
  });
});
