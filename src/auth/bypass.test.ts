/**
 * Demo-bypass host policy.
 *
 * Two guarantees under test:
 *  1. Deployed hosts can NEVER activate demo auth, regardless of build flags.
 *  2. Demo requires a development-only condition — hostname inference alone
 *     (localhost / *.vercel.app) can never enable demo in a production build.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { isDemoAuthBypassEnabled } from './bypass';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isDemoAuthBypassEnabled', () => {
  it.each([
    'care-indeed-hh-v2-dev-rti5nksmma-uc.a.run.app', // Cloud Run
    'anything.run.app',
    'dxxxx.cloudfront.net',
    'careindeed.com',
    'app.careindeed.com',
  ])('never bypasses on deployed host %s — even with the build flag set', (host) => {
    vi.stubEnv('VITE_LOCAL_DEMO_AUTH_BYPASS', 'true');
    // Even if a production build somehow set the flag, the veto wins.
    expect(isDemoAuthBypassEnabled(host, { devBuild: false, explicitFlag: true })).toBe(false);
    expect(isDemoAuthBypassEnabled(host)).toBe(false);
  });

  it.each(['localhost', '127.0.0.1', 'preview-abc.vercel.app'])(
    'allows the local development bypass on %s under a dev build',
    (host) => {
      expect(isDemoAuthBypassEnabled(host, { devBuild: true, explicitFlag: false })).toBe(true);
    },
  );

  describe('production build (import.meta.env.DEV === false)', () => {
    it.each(['localhost', '127.0.0.1', 'preview-abc.vercel.app', 'some-random-host.example', 'app.web.app', 'x.pages.dev'])(
      'hostname alone does NOT enable demo on %s without an explicit opt-in',
      (host) => {
        expect(isDemoAuthBypassEnabled(host, { devBuild: false, explicitFlag: false })).toBe(false);
      },
    );

    it('vercel-preview behavior cannot leak into a production build', () => {
      // A prod build served on a vercel host is never demo.
      expect(isDemoAuthBypassEnabled('preview-abc.vercel.app', { devBuild: false, explicitFlag: false })).toBe(false);
    });

    it('the explicit opt-in does NOT re-enable demo in a production build', () => {
      // Corrected contract: explicitFlag only takes effect inside a dev build;
      // in a production build (devBuild=false) it can never re-enable demo.
      expect(isDemoAuthBypassEnabled('some-random-host.example', { devBuild: false, explicitFlag: true })).toBe(false);
    });

    it('still vetoes deployed hosts even with the explicit opt-in', () => {
      expect(isDemoAuthBypassEnabled('anything.run.app', { devBuild: false, explicitFlag: true })).toBe(false);
    });

    it('an arbitrary non-vetoed host with the explicit flag still returns false in a production build', () => {
      // Gap-1 regression: explicitFlag=true must NOT override devBuild=false.
      expect(isDemoAuthBypassEnabled('some-vanity-domain.example', { devBuild: false, explicitFlag: true })).toBe(false);
      expect(isDemoAuthBypassEnabled('localhost', { devBuild: false, explicitFlag: true })).toBe(false);
      expect(isDemoAuthBypassEnabled('preview-abc.vercel.app', { devBuild: false, explicitFlag: true })).toBe(false);
    });
  });

  it('unknown hosts get no bypass without the explicit flag (dev build)', () => {
    expect(isDemoAuthBypassEnabled('some-random-host.example', { devBuild: true, explicitFlag: false })).toBe(false);
    expect(isDemoAuthBypassEnabled('some-random-host.example', { devBuild: true, explicitFlag: true })).toBe(true);
  });
});
