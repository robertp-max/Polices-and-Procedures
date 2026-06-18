/// <reference types="node" />

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { rolesMatchForLock, toCanonicalRoleKey } from './roleKey';

describe('toCanonicalRoleKey', () => {
  it('folds admin-family labels and keys to a single canonical key', () => {
    assert.equal(toCanonicalRoleKey('super_admin'), 'super_admin');
    assert.equal(toCanonicalRoleKey('Administrator'), 'super_admin');
    assert.equal(toCanonicalRoleKey('Admin'), 'super_admin');
    assert.equal(toCanonicalRoleKey('System Administrator'), 'super_admin');
  });

  it('keeps distinct roles distinct via their own slug', () => {
    assert.equal(toCanonicalRoleKey('Compliance Officer'), 'compliance_officer');
    assert.equal(toCanonicalRoleKey('clinician'), 'clinician');
    assert.notEqual(toCanonicalRoleKey('clinician'), toCanonicalRoleKey('super_admin'));
  });

  it('returns empty for unresolvable input', () => {
    assert.equal(toCanonicalRoleKey(''), '');
    assert.equal(toCanonicalRoleKey(null), '');
    assert.equal(toCanonicalRoleKey(undefined), '');
  });
});

describe('rolesMatchForLock', () => {
  it('treats super_admin key and Administrator label as the same authority', () => {
    // Regression: this exact pair caused the false ECIGN-003 lock block.
    assert.equal(rolesMatchForLock('super_admin', 'Administrator'), true);
    assert.equal(rolesMatchForLock('Administrator', 'super_admin'), true);
  });

  it('blocks a genuine change between two known, different authorities', () => {
    assert.equal(rolesMatchForLock('super_admin', 'clinician'), false);
    assert.equal(rolesMatchForLock('Compliance Officer', 'RN'), false);
  });

  it('does not block when either side is unresolvable', () => {
    assert.equal(rolesMatchForLock('', 'super_admin'), true);
    assert.equal(rolesMatchForLock('super_admin', undefined), true);
    assert.equal(rolesMatchForLock(null, null), true);
  });
});
