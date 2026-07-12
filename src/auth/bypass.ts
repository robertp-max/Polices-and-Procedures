function getHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hostname;
}

export function isVercelHosted(): boolean {
  const host = getHostname();
  return host !== null && host.endsWith('.vercel.app');
}

/** Test seam: overrides for the two build-time signals the policy depends on. */
export interface DemoBypassSignals {
  /** `import.meta.env.DEV` — true only under a local `vite dev` server. */
  devBuild?: boolean;
  /** `import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true'` — explicit opt-in. */
  explicitFlag?: boolean;
}

/**
 * Demo auth bypass policy.
 *
 * Two independent guarantees, in order:
 *
 *  1. PRODUCTION VETO — deployed hosts (CloudFront, Cloud Run `*.run.app`,
 *     careindeed.com) can NEVER activate demo auth, regardless of any build
 *     flag. This is an absolute denylist veto.
 *
 *  2. DEV-BUILD GATE — a production build (`import.meta.env.DEV === false`)
 *     can NEVER activate demo auth. The explicit `VITE_LOCAL_DEMO_AUTH_BYPASS`
 *     opt-in does NOT override this: it only takes effect inside a dev build.
 *     So a production `vite build`, on any host (localhost, vercel preview,
 *     a vanity domain, `*.web.app`, `*.pages.dev`, a bare IP), never falls
 *     into demo mode — flag or no flag.
 *
 *  3. DEVELOPMENT HOST/OPT-IN — inside a dev build, the standard local/preview
 *     hosts (localhost, 127.0.0.1, *.vercel.app) get the bypass, and the
 *     explicit flag additionally authorizes it on any other non-vetoed host.
 *
 * `signals` exists only so tests can exercise the production-build path; in the
 * app the real `import.meta.env` values are always used.
 */
export function isDemoAuthBypassEnabled(hostOverride?: string, signals?: DemoBypassSignals): boolean {
  const host = hostOverride ?? getHostname();
  if (host === null) return false;

  // (1) Production safety veto: never bypass on deployed hosts, no matter what.
  if (
    host.endsWith('.cloudfront.net') ||
    host.endsWith('.run.app') ||
    host === 'careindeed.com' ||
    host.endsWith('.careindeed.com')
  ) {
    return false;
  }

  // (2) Dev-build gate — ABSOLUTE. A production build never activates demo,
  // and the explicit flag cannot override a production build.
  const devBuild = signals?.devBuild ?? (import.meta.env.DEV === true);
  if (!devBuild) return false;

  // (3) Inside a dev build: standard local/preview hosts, or an explicit opt-in
  // on any other non-vetoed host.
  const explicitFlag =
    signals?.explicitFlag ?? (import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true');
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const isVercelPreview = host.endsWith('.vercel.app');

  return isLocalhost || isVercelPreview || explicitFlag;
}
