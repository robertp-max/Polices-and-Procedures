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
 *  2. DEVELOPMENT-ONLY CONDITION — on every other host, demo bypass requires
 *     an explicit development-only signal: either a local `vite dev` build
 *     (`import.meta.env.DEV`) or a deliberately set `VITE_LOCAL_DEMO_AUTH_BYPASS`
 *     opt-in. Hostname inference alone (localhost / *.vercel.app) is NOT
 *     sufficient — a production `vite build` served on any host that merely
 *     isn't on the denylist (a new vanity domain, `*.web.app`, `*.pages.dev`,
 *     a bare IP, etc.) will NOT silently fall into demo mode.
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

  // (2) Development-only condition — required. Without it, hostname alone
  // (including localhost / vercel preview) can never enable demo mode.
  const devBuild = signals?.devBuild ?? (import.meta.env.DEV === true);
  const explicitFlag =
    signals?.explicitFlag ?? (import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true');
  if (!devBuild && !explicitFlag) return false;

  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const isVercelPreview = host.endsWith('.vercel.app');

  // Inside a dev build, the standard local/preview hosts get the bypass; the
  // explicit flag additionally authorizes it anywhere not vetoed above.
  return isLocalhost || isVercelPreview || explicitFlag;
}
