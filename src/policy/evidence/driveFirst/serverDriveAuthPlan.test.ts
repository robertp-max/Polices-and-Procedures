/**
 * Drive keyless-impersonation auth plan — pure, deterministic tests.
 * No live Google calls; planDriveAuth performs no I/O by design.
 */
import { describe, it, expect } from 'vitest';
import {
  planDriveAuth,
  describeDriveAuthPlan,
  DriveAuthConfigError,
  DRIVE_SCOPES,
  type DriveAuthConfig,
} from '../../../../server/googleDriveAuth';

const APPROVED = 'careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com';

function cfg(overrides: Partial<DriveAuthConfig> = {}): DriveAuthConfig {
  return {
    authMode: '',
    impersonateServiceAccount: '',
    credentialsPath: '',
    credentialsPresent: false,
    approvedServiceAccountEmail: APPROVED,
    ...overrides,
  };
}

describe('planDriveAuth — impersonation (production, keyless)', () => {
  it('uses keyless impersonation of the configured target (no key file in the plan)', () => {
    const plan = planDriveAuth(cfg({ authMode: 'impersonation', impersonateServiceAccount: APPROVED }));
    expect(plan.mode).toBe('impersonation');
    expect(plan.targetPrincipal).toBe(APPROVED);
    expect(plan.keyFilePath).toBeUndefined();
    expect(plan.developmentOnly).toBe(false);
    expect(plan.scopes).toEqual(DRIVE_SCOPES);
  });

  it('fails closed when the impersonation target is missing', () => {
    expect(() => planDriveAuth(cfg({ authMode: 'impersonation' })))
      .toThrow(DriveAuthConfigError);
  });

  it('rejects any target other than the approved Drive service account', () => {
    expect(() => planDriveAuth(cfg({
      authMode: 'impersonation',
      impersonateServiceAccount: 'attacker@evil-project.iam.gserviceaccount.com',
    }))).toThrow(/not the approved Drive service account/);
  });

  it('ignores a configured raw JSON key path and warns (keyless is mandatory)', () => {
    const plan = planDriveAuth(cfg({
      authMode: 'impersonation',
      impersonateServiceAccount: APPROVED,
      credentialsPath: 'C:/somewhere/outside/key.json',
      credentialsPresent: true,
    }));
    expect(plan.keyFilePath).toBeUndefined();
    expect(plan.warnings.join(' ')).toMatch(/IGNORED.*keyless/);
  });

  it('fails closed on an unknown auth mode', () => {
    expect(() => planDriveAuth(cfg({ authMode: 'workload_identity_federation' })))
      .toThrow(DriveAuthConfigError);
  });
});

describe('planDriveAuth — key_file (local development fallback)', () => {
  it('default (unset mode) preserves the existing external key-file behavior', () => {
    const plan = planDriveAuth(cfg({
      credentialsPath: 'C:/Users/dev/keys/external-key.json',
      credentialsPresent: true,
    }));
    expect(plan.mode).toBe('key_file');
    expect(plan.keyFilePath).toBe('C:/Users/dev/keys/external-key.json');
    expect(plan.targetPrincipal).toBeUndefined();
  });

  it('is explicitly labeled development-only', () => {
    const plan = planDriveAuth(cfg({ authMode: 'key_file', credentialsPath: 'x.json', credentialsPresent: true }));
    expect(plan.developmentOnly).toBe(true);
    expect(plan.warnings.join(' ')).toMatch(/DEVELOPMENT-ONLY/);
  });

  it('warns when an impersonation target is set but the mode is key_file', () => {
    const plan = planDriveAuth(cfg({ authMode: 'key_file', impersonateServiceAccount: APPROVED }));
    expect(plan.warnings.join(' ')).toMatch(/ignored in key_file mode/);
  });
});

describe('plan safety — no key material anywhere', () => {
  it('the plan and its log form never contain private-key content', () => {
    const impersonation = planDriveAuth(cfg({ authMode: 'impersonation', impersonateServiceAccount: APPROVED }));
    const keyFile = planDriveAuth(cfg({ credentialsPath: 'k.json', credentialsPresent: true }));
    for (const plan of [impersonation, keyFile]) {
      const serialized = JSON.stringify(plan) + JSON.stringify(describeDriveAuthPlan(plan));
      expect(serialized).not.toMatch(/private_key/i);
      expect(serialized).not.toMatch(/BEGIN PRIVATE KEY/);
    }
  });
});
