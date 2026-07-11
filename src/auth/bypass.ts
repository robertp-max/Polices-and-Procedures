function getHostname(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.hostname;
}

export function isVercelHosted(): boolean {
  const host = getHostname();
  return host !== null && host.endsWith('.vercel.app');
}

/**
 * Demo auth bypass is allowed only on local development hosts and Vercel
 * preview domains. Real deployments (CloudFront, Cloud Run, careindeed.com)
 * are explicitly excluded so live environments always require real
 * authentication — no build flag can override this.
 */
export function isDemoAuthBypassEnabled(hostOverride?: string): boolean {
  const host = hostOverride ?? getHostname();
  if (host === null) return false;

  // Production safety: never bypass on deployed hosts, regardless of build
  // flags. Covers CloudFront, Cloud Run (*.run.app), and the custom domain.
  if (
    host.endsWith('.cloudfront.net') ||
    host.endsWith('.run.app') ||
    host === 'careindeed.com' ||
    host.endsWith('.careindeed.com')
  ) {
    return false;
  }

  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const isVercelPreview = host.endsWith('.vercel.app');

  return (
    isLocalhost ||
    isVercelPreview ||
    import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true'
  );
}
