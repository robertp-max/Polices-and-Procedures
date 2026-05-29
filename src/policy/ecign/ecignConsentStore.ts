/* ═══════════════════════════════════════════════════════════════════
   eCIgn consent profile store

   Persists one-time enrollment consent profiles per user. A signer must hold
   an ACTIVE consent profile at the CURRENT agreement version before any
   document signature is permitted.

   Hard rules enforced here:
   - Never auto-consent: a profile is only created by an explicit
     `recordConsent(...)` call originating from the manual enrollment flow.
   - Updating the agreement version supersedes prior consent (re-acceptance
     required) but never deletes the historical record.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand';
import type { ECIgnConsentProfile, ECIgnPermissionRole } from './types';
import { ECIGN_AGREEMENT_VERSION, getCurrentConsentTextHash } from './ecignAgreement';

const STORAGE_KEY = 'ci_ecign_consent_profiles_v1';

function nowIso() {
  return new Date().toISOString();
}

function loadProfiles(): ECIgnConsentProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ECIgnConsentProfile[]) : [];
  } catch {
    return [];
  }
}

function persist(profiles: ECIgnConsentProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

function makeConsentProfileId(userId: string) {
  return `ECIGN-CONSENT-${slug(userId)}-${Date.now().toString(36)}`;
}

function slug(value: string) {
  return String(value).trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'user';
}

export interface RecordConsentInput {
  userId: string;
  signerDisplayName: string;
  signerLegalName?: string;
  requiredPermissionRoles: ECIgnPermissionRole[];
  consentAcceptedIp?: string;
  consentAcceptedUserAgent?: string;
  consentAcceptedDeviceId?: string;
}

interface ConsentStoreState {
  profiles: ECIgnConsentProfile[];
  recordConsent: (input: RecordConsentInput) => ECIgnConsentProfile;
  revokeConsent: (consentProfileId: string) => void;
  getActiveConsent: (userId: string) => ECIgnConsentProfile | null;
  hasCurrentActiveConsent: (userId: string) => boolean;
}

/**
 * Returns the user's active consent profile only when it is `active` AND at the
 * current agreement version. Out-of-date or revoked consent returns null so the
 * UI re-prompts enrollment.
 */
function selectActiveConsent(profiles: ECIgnConsentProfile[], userId: string): ECIgnConsentProfile | null {
  const candidates = profiles
    .filter(p => p.userId === userId && p.consentStatus === 'active')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return candidates[0] ?? null;
}

export const useEcignConsentStore = create<ConsentStoreState>((set, get) => ({
  profiles: loadProfiles(),

  recordConsent: (input) => {
    const timestamp = nowIso();
    // Supersede any prior active consent for this user (never delete history).
    const superseded = get().profiles.map(p =>
      p.userId === input.userId && p.consentStatus === 'active'
        ? { ...p, consentStatus: 'superseded' as const, updatedAt: timestamp }
        : p,
    );
    const profile: ECIgnConsentProfile = {
      consentProfileId: makeConsentProfileId(input.userId),
      userId: input.userId,
      signerDisplayName: input.signerDisplayName,
      signerLegalName: input.signerLegalName,
      requiredPermissionRoles: input.requiredPermissionRoles,
      consentVersion: ECIGN_AGREEMENT_VERSION,
      consentTextHash: getCurrentConsentTextHash(),
      consentAcceptedAt: timestamp,
      consentAcceptedIp: input.consentAcceptedIp,
      consentAcceptedUserAgent: input.consentAcceptedUserAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      consentAcceptedDeviceId: input.consentAcceptedDeviceId,
      consentStatus: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const next = [...superseded, profile];
    persist(next);
    set({ profiles: next });
    return profile;
  },

  revokeConsent: (consentProfileId) => {
    const timestamp = nowIso();
    const next = get().profiles.map(p =>
      p.consentProfileId === consentProfileId ? { ...p, consentStatus: 'revoked' as const, updatedAt: timestamp } : p,
    );
    persist(next);
    set({ profiles: next });
  },

  getActiveConsent: (userId) => selectActiveConsent(get().profiles, userId),

  hasCurrentActiveConsent: (userId) => {
    const active = selectActiveConsent(get().profiles, userId);
    return Boolean(active && active.consentVersion === ECIGN_AGREEMENT_VERSION);
  },
}));

/** Non-hook accessor for use inside resolvers / validators / Node scripts. */
export function getActiveConsentProfile(userId: string): ECIgnConsentProfile | null {
  return useEcignConsentStore.getState().getActiveConsent(userId);
}

export function hasCurrentActiveConsent(userId: string): boolean {
  return useEcignConsentStore.getState().hasCurrentActiveConsent(userId);
}
