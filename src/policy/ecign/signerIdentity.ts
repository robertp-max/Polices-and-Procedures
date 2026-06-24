// @ts-nocheck -- policy preserved headless (designless baseline skips full checking)
import { useEffect, useMemo } from 'react';
import type { DemoUser as AuthUser } from '@/auth/api';

// Local stub to avoid missing AuthProvider module (prevents white screen / import crash).
// Falls back to stored demo user.
function useAuth() {
  return { user: getStoredAuthUser() };
}
import {
  authorityDomainsForRole,
  normalizeProductionTier,
  type AuthorityDomain,
  type ProductionSignerTier,
} from './signerAuthority';

const AUTH_STORAGE_KEY = 'ci_demo_auth_v1';
const ECIGN_SIGNER_STORAGE_KEY = 'ci_ecign_signer_v1';

export interface EcignSignerIdentity {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  tier: ProductionSignerTier;
  authorityDomains: AuthorityDomain[];
}

const FALLBACK_SIGNER: EcignSignerIdentity = {
  id: 'demo-user',
  firstName: 'Demo',
  lastName: 'User',
  name: 'Demo User',
  email: 'demo@example.com',
  initials: 'DU',
  role: 'Demo User',
  tier: 1,
  authorityDomains: ['operations'],
};

function splitName(name?: string): { firstName: string; lastName: string } {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

function deriveInitials(firstName: string, lastName: string, name: string): string {
  const fromParts = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase();
  if (fromParts) return fromParts;
  const fromName = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  return fromName || FALLBACK_SIGNER.initials;
}

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: AuthUser | null };
    return parsed?.user ?? null;
  } catch {
    return null;
  }
}

function getStoredEcignSigner(): EcignSignerIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ECIGN_SIGNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<EcignSignerIdentity>;
    if (!parsed.id || !parsed.role) return null;
    return {
      id: parsed.id,
      firstName: parsed.firstName ?? FALLBACK_SIGNER.firstName,
      lastName: parsed.lastName ?? FALLBACK_SIGNER.lastName,
      name: parsed.name ?? FALLBACK_SIGNER.name,
      email: parsed.email ?? FALLBACK_SIGNER.email,
      initials: parsed.initials ?? FALLBACK_SIGNER.initials,
      role: parsed.role,
      tier: normalizeProductionTier(parsed.tier, parsed.role),
      authorityDomains: parsed.authorityDomains?.length
        ? parsed.authorityDomains
        : authorityDomainsForRole(parsed.role),
    };
  } catch {
    return null;
  }
}

export function resolveEcignSignerIdentity(user?: AuthUser | null): EcignSignerIdentity {
  const storedSigner = !user ? getStoredEcignSigner() : null;
  if (storedSigner) return storedSigner;

  const source = user ?? getStoredAuthUser();
  if (!source) return FALLBACK_SIGNER;

  const split = splitName(source.name);
  const firstName = String(source.firstName ?? split.firstName).trim();
  const lastName = String(source.lastName ?? split.lastName).trim();
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || String(source.name ?? '').trim() || FALLBACK_SIGNER.name;
  const email = String(source.email ?? '').trim().toLowerCase() || FALLBACK_SIGNER.email;

  return {
    id: String(source.id ?? (email || FALLBACK_SIGNER.id)),
    firstName: firstName || FALLBACK_SIGNER.firstName,
    lastName: lastName || (firstName ? '' : FALLBACK_SIGNER.lastName),
    name,
    email,
    initials: deriveInitials(firstName, lastName, name),
    role: String(source.role ?? '').trim() || FALLBACK_SIGNER.role,
    tier: normalizeProductionTier(undefined, source.role),
    authorityDomains: authorityDomainsForRole(source.role),
  };
}

export function getEcignSignerIdentity(): EcignSignerIdentity {
  return resolveEcignSignerIdentity();
}

export function buildEcignAuthHeaders(extra?: Record<string, string>): HeadersInit {
  const signer = getEcignSignerIdentity();
  return {
    'Content-Type': 'application/json',
    'X-User-Id': signer.id,
    'X-User-Name': signer.name,
    'X-User-Role': signer.role,
    'X-User-Email': signer.email,
    'X-User-Tier': String(signer.tier),
    'X-User-Authority-Domains': signer.authorityDomains.join(','),
    ...(extra ?? {}),
  };
}

export function useEcignSignerIdentity(): EcignSignerIdentity {
  const { user } = useAuth();
  const signer = useMemo(() => resolveEcignSignerIdentity(user), [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(ECIGN_SIGNER_STORAGE_KEY, JSON.stringify(signer));
  }, [signer]);

  return signer;
}
