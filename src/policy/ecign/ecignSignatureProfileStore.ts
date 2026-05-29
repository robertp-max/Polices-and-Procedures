/* ═══════════════════════════════════════════════════════════════════
   eCIgn reusable signature profile store

   Stores the signer's reusable visual signature/initials representation.
   Capturing a profile is NOT signing a document — it only records the
   preferred visual signature. A document is signed only when the user later
   clicks an eCIgn icon/field on a specific assigned form instance.

   Hard rules enforced here:
   - A user may have only ONE active signature profile at a time.
   - Updating the signature creates a NEW signatureProfileId/version and
     supersedes the prior one; it never mutates a historical profile that is
     already referenced by signed records.
   - Signing is blocked unless an active signature profile exists.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand';
import type { ECIgnSignatureMethod, ECIgnSignatureProfile } from './types';
import { ecignContentHash } from './ecignAgreement';

const STORAGE_KEY = 'ci_ecign_signature_profiles_v1';

function nowIso() {
  return new Date().toISOString();
}

function loadProfiles(): ECIgnSignatureProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ECIgnSignatureProfile[]) : [];
  } catch {
    return [];
  }
}

function persist(profiles: ECIgnSignatureProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    /* storage unavailable */
  }
}

function slug(value: string) {
  return String(value).trim().replace(/[^A-Za-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'user';
}

function makeSignatureProfileId(userId: string) {
  return `ECIGN-SIG-${slug(userId)}-${Date.now().toString(36)}`;
}

export interface SaveSignatureProfileInput {
  userId: string;
  signerDisplayName: string;
  signerLegalName?: string;
  signatureImageDataUrl?: string;
  typedSignatureText?: string;
  initialsImageDataUrl?: string;
  typedInitialsText?: string;
  signatureMethod: ECIgnSignatureMethod;
  initialsMethod?: ECIgnSignatureMethod;
  consentProfileId: string;
  consentVersion: string;
}

interface SignatureProfileStoreState {
  profiles: ECIgnSignatureProfile[];
  saveSignatureProfile: (input: SaveSignatureProfileInput) => ECIgnSignatureProfile;
  revokeSignatureProfile: (signatureProfileId: string) => void;
  getActiveProfile: (userId: string) => ECIgnSignatureProfile | null;
  getProfileById: (signatureProfileId: string) => ECIgnSignatureProfile | null;
  hasActiveProfile: (userId: string) => boolean;
}

function selectActiveProfile(profiles: ECIgnSignatureProfile[], userId: string): ECIgnSignatureProfile | null {
  const candidates = profiles
    .filter(p => p.userId === userId && p.status === 'active')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return candidates[0] ?? null;
}

export const useEcignSignatureProfileStore = create<SignatureProfileStoreState>((set, get) => ({
  profiles: loadProfiles(),

  saveSignatureProfile: (input) => {
    const timestamp = nowIso();
    const fingerprintBasis = [
      input.userId,
      input.signatureMethod,
      input.signatureImageDataUrl ?? '',
      input.typedSignatureText ?? '',
      input.initialsImageDataUrl ?? '',
      input.typedInitialsText ?? '',
      input.consentVersion,
    ].join('|');
    // Supersede prior active profile (never mutate historical signed-record refs).
    const superseded = get().profiles.map(p =>
      p.userId === input.userId && p.status === 'active'
        ? { ...p, status: 'superseded' as const, updatedAt: timestamp }
        : p,
    );
    const profile: ECIgnSignatureProfile = {
      signatureProfileId: makeSignatureProfileId(input.userId),
      userId: input.userId,
      signerDisplayName: input.signerDisplayName,
      signerLegalName: input.signerLegalName,
      signatureImageDataUrl: input.signatureImageDataUrl,
      typedSignatureText: input.typedSignatureText,
      initialsImageDataUrl: input.initialsImageDataUrl,
      typedInitialsText: input.typedInitialsText,
      signatureProfileHash: ecignContentHash(fingerprintBasis),
      signatureMethod: input.signatureMethod,
      initialsMethod: input.initialsMethod,
      consentProfileId: input.consentProfileId,
      consentVersion: input.consentVersion,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const next = [...superseded, profile];
    persist(next);
    set({ profiles: next });
    return profile;
  },

  revokeSignatureProfile: (signatureProfileId) => {
    const timestamp = nowIso();
    const next = get().profiles.map(p =>
      p.signatureProfileId === signatureProfileId ? { ...p, status: 'revoked' as const, updatedAt: timestamp } : p,
    );
    persist(next);
    set({ profiles: next });
  },

  getActiveProfile: (userId) => selectActiveProfile(get().profiles, userId),
  getProfileById: (signatureProfileId) => get().profiles.find(p => p.signatureProfileId === signatureProfileId) ?? null,
  hasActiveProfile: (userId) => Boolean(selectActiveProfile(get().profiles, userId)),
}));

export function getActiveSignatureProfile(userId: string): ECIgnSignatureProfile | null {
  return useEcignSignatureProfileStore.getState().getActiveProfile(userId);
}

export function hasActiveSignatureProfile(userId: string): boolean {
  return useEcignSignatureProfileStore.getState().hasActiveProfile(userId);
}
