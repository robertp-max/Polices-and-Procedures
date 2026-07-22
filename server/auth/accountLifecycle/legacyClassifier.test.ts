/**
 * Phase 2A (hardened) — read-only legacy-state assessment + safe projection.
 * No mutation; every issue is returned; consistency is never overclaimed;
 * unknown values fail closed; plus-tags are preserved.
 */
import { describe, expect, it } from 'vitest';
import { assessLegacyLifecycleState, buildAccountLifecycleProjection } from './legacyClassifier.js';
import { normalizeIdentityEmail } from './identityEmail.js';
import type { LegacyStateInput, ProviderAccountState } from './types.js';

const bound = (over: Partial<LegacyStateInput> = {}): LegacyStateInput => ({ hasProviderBinding: true, ...over });

describe('assessLegacyLifecycleState — never overclaims consistency', () => {
  it('active+active + provider ENABLED → consistent, safe to auto-initialize', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'active', providerAccountState: 'enabled' }));
    expect(a.primary).toBe('consistent');
    expect(a.issues).toEqual([]);
    expect(a.safeToAutoInitialize).toBe(true);
  });
  it('active+active + provider UNKNOWN → provider_state_unknown, NOT consistent', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'active' }));
    expect(a.primary).toBe('provider_state_unknown');
    expect(a.safeToAutoInitialize).toBe(false);
  });
  it('active+active + provider DISABLED → provider_disabled_but_app_active', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'active', providerAccountState: 'disabled' }));
    expect(a.primary).toBe('provider_disabled_but_app_active');
  });
  it('disabled+suspended + provider DISABLED → consistent_deny', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'disabled', canonicalStatus: 'suspended', providerAccountState: 'disabled' }));
    expect(a.primary).toBe('consistent_deny');
    expect(a.safeToAutoInitialize).toBe(false);
  });
  it('disabled+suspended + provider ENABLED → provider_enabled_but_app_denied', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'disabled', canonicalStatus: 'suspended', providerAccountState: 'enabled' }));
    expect(a.primary).toBe('provider_enabled_but_app_denied');
  });
  it('registration active + canonical suspended → conflict (the known defect)', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'suspended', providerAccountState: 'disabled' }));
    expect(a.issues).toContain('conflict_active_vs_suspended');
    expect(a.primary).toBe('conflict_active_vs_suspended');
  });
  it('binding exists but provider user not_found → missing_provider_account', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'active', providerAccountState: 'not_found' }));
    expect(a.issues).toContain('missing_provider_account');
    expect(a.primary).toBe('missing_provider_account');
  });
  it('no provider binding → missing_provider_binding (distinct from not_found)', () => {
    const a = assessLegacyLifecycleState({ hasProviderBinding: false, registrationStatus: 'active', canonicalStatus: 'active' });
    expect(a.primary).toBe('missing_provider_binding');
  });
  it('unknown registration value → unknown_registration_status (never setup_complete)', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'weird_value', canonicalStatus: 'active' }));
    expect(a.issues).toContain('unknown_registration_status');
  });
  it('unknown canonical value → unknown_canonical_status (never active)', () => {
    const a = assessLegacyLifecycleState(bound({ registrationStatus: 'active', canonicalStatus: 'weird_value' }));
    expect(a.issues).toContain('unknown_canonical_status');
  });
  it('returns MULTIPLE simultaneous issues, not just the first', () => {
    const a = assessLegacyLifecycleState({ hasProviderBinding: false, duplicateEmailCandidates: 3, registrationStatus: 'zzz', canonicalStatus: null });
    expect(a.issues).toEqual(expect.arrayContaining(['duplicate_email_candidates', 'missing_provider_binding', 'unknown_registration_status', 'missing_canonical']));
    expect(a.safeToAutoInitialize).toBe(false);
  });
});

describe('assessLegacyLifecycleState — matrix (no unknown combo is consistent / safe)', () => {
  const regs = ['pending_setup', 'pending_admin_approval', 'active', 'disabled', null, 'garbage'];
  const canons = ['pending', 'active', 'suspended', 'disabled', null, 'garbage'];
  const providers: ProviderAccountState[] = ['enabled', 'disabled', 'not_found', 'unknown'];
  for (const r of regs) for (const c of canons) for (const p of providers) {
    it(`reg=${r} canon=${c} provider=${p} is deterministic & safe only when fully verified-active`, () => {
      const input = bound({ registrationStatus: r, canonicalStatus: c, providerAccountState: p });
      const a1 = assessLegacyLifecycleState(input);
      const a2 = assessLegacyLifecycleState(input); // determinism
      expect(a2).toEqual(a1);
      const fullyVerifiedActive = r === 'active' && c === 'active' && p === 'enabled';
      expect(a1.safeToAutoInitialize).toBe(fullyVerifiedActive);
      if (!fullyVerifiedActive) expect(a1.primary).not.toBe('consistent');
      if (p === 'unknown' && !(r === 'garbage' || c === 'garbage' || r === null || c === null)) {
        // an unread provider is never proof of full active consistency
        expect(a1.primary).not.toBe('consistent');
      }
    });
  }
  it('binding absent for every combo never yields consistent', () => {
    for (const r of regs) for (const c of canons) {
      const a = assessLegacyLifecycleState({ hasProviderBinding: false, registrationStatus: r, canonicalStatus: c, providerAccountState: 'enabled' });
      expect(a.primary).not.toBe('consistent');
    }
  });
});

describe('normalizeIdentityEmail — plus-tags preserved', () => {
  it('performs only trim + lowercase, keeping the plus suffix', () => {
    expect(normalizeIdentityEmail(' RobertP+Phase7UAT@CareIndeed.com ')).toBe('robertp+phase7uat@careindeed.com');
  });
  it('a plus-tagged identity stays DISTINCT from the base address', () => {
    expect(normalizeIdentityEmail('robertp+phase7uat@careindeed.com'))
      .not.toBe(normalizeIdentityEmail('robertp@careindeed.com'));
  });
});

describe('buildAccountLifecycleProjection — safe read + legacy visibility', () => {
  it('surfaces the legacy registration plane and marks the derivation source', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-1', displayEmail: 'a@careindeed.com',
      registrationStatus: 'active', canonicalStatus: 'suspended', providerAccountState: 'disabled',
    });
    expect(p.registrationStatus).toBe('active');            // legacy plane visible
    expect(p.lifecycleStatus).toBe('suspended');
    expect(p.lifecycleStatusSource).toBe('legacy_canonical_derivation');
    expect(p.reconciliationClassification).toBe('conflict_active_vs_suspended');
    expect(p.reconciliationIssues).toContain('conflict_active_vs_suspended');
  });
  it('unknown registration value → provisioning unknown + sanitized registrationStatus unknown', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-2', displayEmail: 'b@careindeed.com',
      registrationStatus: 'weird', canonicalStatus: 'active', providerAccountState: 'enabled',
    });
    expect(p.provisioningStatus).toBe('unknown');
    expect(p.registrationStatus).toBe('unknown');
  });
  it('exposes only the approved safe fields; no raw subject/token/credential', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-3', displayEmail: 'c@careindeed.com',
      registrationStatus: 'active', canonicalStatus: 'active', providerAccountState: 'enabled',
    });
    expect(Object.keys(p).sort()).toEqual([
      'canonicalStatus', 'canonicalUserId', 'currentOperationStatus', 'displayEmail',
      'lifecycleStatus', 'lifecycleStatusSource', 'providerState', 'provisioningStatus',
      'reconciliationClassification', 'reconciliationIssues', 'registrationStatus',
    ]);
    expect(JSON.stringify(p)).not.toMatch(/\bsub\b|token|secret|authorization|cookie/i);
  });
});
