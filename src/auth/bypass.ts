export function isVercelHosted(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.vercel.app');
}

export function isDemoAuthBypassEnabled(): boolean {
  return import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true' || isVercelHosted();
}
