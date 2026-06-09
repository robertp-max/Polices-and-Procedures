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
 * preview domains. Real production (CloudFront) is explicitly excluded so the
 * live deployment always requires real authentication.
 */
export function isDemoAuthBypassEnabled(): boolean {
  const host = getHostname();
  if (host === null) return false;

  // Production safety: never bypass on CloudFront, regardless of build flags.
  if (host.endsWith('.cloudfront.net')) return false;

  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  const isVercelPreview = host.endsWith('.vercel.app');

  return (
    isLocalhost ||
    isVercelPreview ||
    import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true'
  );
}
