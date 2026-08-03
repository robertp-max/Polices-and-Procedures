import { isSessionExpired, loadSession } from './session';

export function apiRoot(): string {
  const authBase = (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
  if (!authBase) return '/api';
  return authBase.replace(/\/auth$/, '');
}

export function bearerAuthHeader(): Record<string, string> {
  try {
    const envelope = loadSession();
    if (!envelope || isSessionExpired(envelope)) return {};
    return { Authorization: `Bearer ${envelope.accessToken}` };
  } catch {
    return {};
  }
}
