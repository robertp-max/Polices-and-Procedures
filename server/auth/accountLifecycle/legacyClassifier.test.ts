/**
 * Phase 2A — read-only legacy-state classifier + safe projection.
 * Classification never mutates; ambiguity fails safe to manual_review_required;
 * the projection exposes no raw Cognito subject / token / credential.
 */
import { describe, expect, it } from 'vitest';
import { classifyLegacyLifecycleState, buildAccountLifecycleProjection } from './legacyClassifier.js';
import type { LegacyStateInput } from './types.js';

const base: LegacyStateInput = { hasProviderBinding: true };

describe('classifyLegacyLifecycleState', () => {
  it('registration active + canonical active (provider enabled/unknown) → consistent', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: 'active' })).toBe('consistent');
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: 'active', providerState: 'enabled' })).toBe('consistent');
  });

  it('registration active + canonical suspended → conflict_active_vs_suspended (the known defect)', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: 'suspended' })).toBe('conflict_active_vs_suspended');
  });

  it('registration disabled + canonical active → conflict_active_vs_suspended', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'disabled', canonicalStatus: 'active' })).toBe('conflict_active_vs_suspended');
  });

  it('registration disabled + canonical suspended → consistent (aligned deny)', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'disabled', canonicalStatus: 'suspended' })).toBe('consistent');
  });

  it('active app + provider disabled → provider_disabled_but_app_active', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: 'active', providerState: 'disabled' })).toBe('provider_disabled_but_app_active');
  });

  it('pending on either plane → legacy_pending', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'pending_setup', canonicalStatus: 'active' })).toBe('legacy_pending');
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: 'pending' })).toBe('legacy_pending');
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'pending_admin_approval', canonicalStatus: 'pending' })).toBe('legacy_pending');
  });

  it('missing planes', () => {
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: null, canonicalStatus: 'active' })).toBe('missing_registration');
    expect(classifyLegacyLifecycleState({ ...base, registrationStatus: 'active', canonicalStatus: null })).toBe('missing_canonical');
  });

  it('missing provider binding → missing_provider_binding', () => {
    expect(classifyLegacyLifecycleState({ hasProviderBinding: false, registrationStatus: 'active', canonicalStatus: 'active' })).toBe('missing_provider_binding');
  });

  it('provider binding conflict / duplicate emails → manual_review_required (never auto-resolved)', () => {
    expect(classifyLegacyLifecycleState({ ...base, providerBindingConflict: true, registrationStatus: 'active', canonicalStatus: 'active' })).toBe('manual_review_required');
    expect(classifyLegacyLifecycleState({ ...base, duplicateEmailCandidates: 2, registrationStatus: 'active', canonicalStatus: 'active' })).toBe('manual_review_required');
  });

  it('a plus-tagged identity is classified normally (kept distinct, not merged)', () => {
    // plus-tagging is an identity property, not a conflict; single candidate → normal.
    expect(classifyLegacyLifecycleState({ ...base, duplicateEmailCandidates: 1, registrationStatus: 'active', canonicalStatus: 'active' })).toBe('consistent');
  });
});

describe('buildAccountLifecycleProjection — safe read', () => {
  it('maps provisioning + lifecycle and carries the classification', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-1', displayEmail: 'a@careindeed.com',
      registrationStatus: 'active', canonicalStatus: 'suspended', providerState: 'enabled',
    });
    expect(p.provisioningStatus).toBe('setup_complete');
    expect(p.lifecycleStatus).toBe('suspended');
    expect(p.canonicalStatus).toBe('suspended');
    expect(p.reconciliationClassification).toBe('conflict_active_vs_suspended');
    expect(p.currentOperationStatus).toBe('none');
  });

  it('pending registration → provisioning pending_setup', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-2', displayEmail: 'b@careindeed.com',
      registrationStatus: 'pending_setup', canonicalStatus: 'pending',
    });
    expect(p.provisioningStatus).toBe('pending_setup');
    expect(p.lifecycleStatus).toBe('pending');
  });

  it('never exposes a raw provider subject / token (only whitelisted fields)', () => {
    const p = buildAccountLifecycleProjection({
      hasProviderBinding: true, canonicalUserId: 'usr-3', displayEmail: 'c@careindeed.com',
      registrationStatus: 'active', canonicalStatus: 'active',
    });
    const keys = Object.keys(p).sort();
    expect(keys).toEqual([
      'canonicalStatus', 'canonicalUserId', 'currentOperationStatus', 'displayEmail',
      'lifecycleStatus', 'providerState', 'provisioningStatus', 'reconciliationClassification',
    ]);
    expect(JSON.stringify(p)).not.toMatch(/sub|token|secret|authorization/i);
  });
});
