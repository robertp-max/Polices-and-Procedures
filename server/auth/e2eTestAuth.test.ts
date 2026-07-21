import { describe, it, expect } from 'vitest';
import {
  isE2eTestAuthAllowed,
  resolveE2eMeUser,
  e2eActorForToken,
  E2E_ACTIVE_TOKEN,
  E2E_SUSPENDED_TOKEN,
  type E2eRequestView,
} from './e2eTestAuth';

const loopback: E2eRequestView = { hostname: 'localhost', hostHeader: 'localhost:5182', remoteAddress: '127.0.0.1' };
const env = (over: Record<string, string | undefined>): NodeJS.ProcessEnv =>
  ({ E2E_TEST_AUTH: 'true', NODE_ENV: 'test', ...over } as NodeJS.ProcessEnv);

describe('e2e test-auth gate — production-inert by construction', () => {
  it('activates only with the exact opt-in flag on loopback in test/development', () => {
    expect(isE2eTestAuthAllowed(loopback, env({}))).toBe(true);
    expect(isE2eTestAuthAllowed(loopback, env({ NODE_ENV: 'development' }))).toBe(true);
  });

  it('DENIES when NODE_ENV is production', () => {
    expect(isE2eTestAuthAllowed(loopback, env({ NODE_ENV: 'production' }))).toBe(false);
  });

  it('DENIES when NODE_ENV is staging or unset', () => {
    expect(isE2eTestAuthAllowed(loopback, env({ NODE_ENV: 'staging' }))).toBe(false);
    expect(isE2eTestAuthAllowed(loopback, env({ NODE_ENV: undefined }))).toBe(false);
  });

  it('DENIES without the exact flag (missing / "false" / "TRUE")', () => {
    expect(isE2eTestAuthAllowed(loopback, env({ E2E_TEST_AUTH: undefined }))).toBe(false);
    expect(isE2eTestAuthAllowed(loopback, env({ E2E_TEST_AUTH: 'false' }))).toBe(false);
    expect(isE2eTestAuthAllowed(loopback, env({ E2E_TEST_AUTH: 'TRUE' }))).toBe(false);
  });

  it('DENIES on non-loopback network peer even with a localhost Host header', () => {
    expect(isE2eTestAuthAllowed({ hostname: 'localhost', hostHeader: 'localhost', remoteAddress: '203.0.113.9' }, env({}))).toBe(false);
  });

  it('DENIES on deployed hosts (*.run.app, *.cloudfront.net, careindeed.com)', () => {
    for (const host of ['care-indeed-hh-v2-dev.a.run.app', 'd123.cloudfront.net', 'careindeed.com', 'app.careindeed.com']) {
      expect(isE2eTestAuthAllowed({ hostname: host, hostHeader: host, remoteAddress: '127.0.0.1' }, env({})), host).toBe(false);
    }
  });

  it('DENIES on a non-loopback hostname', () => {
    expect(isE2eTestAuthAllowed({ hostname: '10.0.0.5', hostHeader: '10.0.0.5', remoteAddress: '10.0.0.5' }, env({}))).toBe(false);
  });
});

describe('e2e synthetic learners — active reaches, suspended denied', () => {
  it('resolves the ACTIVE learner to a usable /me user', () => {
    const r = resolveE2eMeUser(E2E_ACTIVE_TOKEN);
    expect(r.status).toBe('active');
    if (r.status === 'active') {
      expect(r.user.email).toBe('e2e.active.learner@example.test');
      expect(r.user.emailVerified).toBe(true);
      expect(r.user.role).toBeTruthy();
    }
  });

  it('marks the SUSPENDED learner as suspended (mirrors fail-closed /me denial)', () => {
    expect(resolveE2eMeUser(E2E_SUSPENDED_TOKEN)).toEqual({ status: 'suspended' });
  });

  it('treats any other token as none (falls through to real Cognito)', () => {
    expect(resolveE2eMeUser('some-real-cognito-token').status).toBe('none');
  });

  it('grants a boundary actor ONLY for the active token; suspended/unknown → null', () => {
    const actor = e2eActorForToken(E2E_ACTIVE_TOKEN);
    expect(actor).not.toBeNull();
    expect(actor?.roles).toEqual(['grp-user']); // standard learner — not an admin group
    expect(e2eActorForToken(E2E_SUSPENDED_TOKEN)).toBeNull();
    expect(e2eActorForToken('cognito-token')).toBeNull();
    expect(e2eActorForToken(undefined)).toBeNull();
  });
});
