/**
 * Demo-bypass host policy — deployed hosts can NEVER activate demo auth,
 * regardless of build flags (VITE_LOCAL_DEMO_AUTH_BYPASS included).
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
    expect(isDemoAuthBypassEnabled(host)).toBe(false);
  });

  it.each(['localhost', '127.0.0.1', 'preview-abc.vercel.app'])(
    'allows the local development bypass on %s',
    (host) => {
      expect(isDemoAuthBypassEnabled(host)).toBe(true);
    },
  );

  it('unknown hosts get no bypass unless the explicit local flag is set', () => {
    expect(isDemoAuthBypassEnabled('some-random-host.example')).toBe(false);
    vi.stubEnv('VITE_LOCAL_DEMO_AUTH_BYPASS', 'true');
    expect(isDemoAuthBypassEnabled('some-random-host.example')).toBe(true);
  });
});
