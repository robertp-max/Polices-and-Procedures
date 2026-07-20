/**
 * Rendering-profile registry — FR-017 visual requirements.
 * Design tokens from Patient Admission Packet (READ ONLY source of truth):
 *   --ci-teal: #007c7a
 *   --ci-orange: #e87722
 * Legacy QAPI palette (#00797d / #c74601) is retired.
 * Pure data + pure functions only. Zero runtime side effects.
 */

import type { PacketRenderingProfile } from '@/policy/packets/contracts';

/** Care Indeed admission design tokens — single source of truth for packet chrome. */
export const CARE_INDEED_TEAL = '#007c7a' as const;
export const CARE_INDEED_ORANGE = '#e87722' as const;

/**
 * Default Care Indeed Letter rendering profile.
 * Letter size; teal/orange header accent rail; logo slot; footer with packet id /
 * version / page N of M; watermark slot; classification-notice slot.
 */
export const CARE_INDEED_LETTER_PROFILE: PacketRenderingProfile = {
  profileId: 'care-indeed-letter',
  version: '1.0.0',
  pageSize: 'letter',
  chrome: {
    accentRail: {
      enabled: true,
      colors: [CARE_INDEED_TEAL, CARE_INDEED_ORANGE],
      heightPx: 4,
    },
    logo: {
      enabled: true,
      assetId: 'care-indeed-logo',
      placement: 'header-left',
      altText: 'Care Indeed',
    },
    footer: {
      enabled: true,
      showPacketId: true,
      showPeriod: true,
      showStatus: true,
      showClassification: true,
      showPageNumbers: true,
      customText: 'Packet ID · Version · Page N of M',
    },
    watermark: {
      enabled: true,
      text: null,
      whenClassification: [
        'confidential',
        'restricted-personnel',
        'legal-privileged',
        'synthetic-uat',
      ],
      opacity: 0.12,
    },
    classificationNotice: {
      enabled: true,
      text: 'Classification and handling notice applies per packet confidentiality rules.',
      placement: 'header',
    },
  },
  formsBeginOnNewPages: true,
  repeatTableHeaders: true,
  outlineFollowsHierarchy: true,
};

/**
 * QAPI analytical rendering profile — inherits care-indeed-letter chrome/tokens.
 * Bound by analytical-report archetype; uses admission tokens (not legacy QAPI colors).
 */
export const QAPI_ANALYTICAL_PROFILE: PacketRenderingProfile = {
  ...CARE_INDEED_LETTER_PROFILE,
  profileId: 'qapi-analytical',
  version: '1.0.0',
  chrome: {
    ...CARE_INDEED_LETTER_PROFILE.chrome,
    accentRail: {
      ...CARE_INDEED_LETTER_PROFILE.chrome.accentRail,
      colors: [CARE_INDEED_TEAL, CARE_INDEED_ORANGE],
    },
    classificationNotice: {
      ...CARE_INDEED_LETTER_PROFILE.chrome.classificationNotice,
      text: 'QAPI analytical packet — classification and handling notice applies per packet confidentiality rules.',
    },
  },
};

/** All registered rendering profiles. */
export const ALL_RENDERING_PROFILES: readonly PacketRenderingProfile[] = [
  CARE_INDEED_LETTER_PROFILE,
  QAPI_ANALYTICAL_PROFILE,
] as const;

const PROFILE_BY_ID: ReadonlyMap<string, PacketRenderingProfile> = new Map(
  ALL_RENDERING_PROFILES.map((p) => [p.profileId, p]),
);

/** Lookup a rendering profile by id. Throws when unknown (never invents data). */
export function getRenderingProfile(profileId: string): PacketRenderingProfile {
  const found = PROFILE_BY_ID.get(profileId);
  if (!found) {
    throw new Error(`Unknown rendering profile id: ${profileId}`);
  }
  return found;
}

/** True when the profile id is registered. */
export function hasRenderingProfile(profileId: string): boolean {
  return PROFILE_BY_ID.has(profileId);
}
