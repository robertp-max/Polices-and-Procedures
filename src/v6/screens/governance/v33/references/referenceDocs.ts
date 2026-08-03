// Governing Body reference documents — DESCRIPTORS ONLY (spec §6 / B6).
//
// History of this file, because the failure mode repeats:
//   1. The documents lived under /public/governance-references/ — world-readable
//      at a stable static URL regardless of login.
//   2. They were then imported into this module with Vite `?raw`. That removed
//      the public path but shipped ~1 MB of controlled counsel-review text
//      INSIDE THE CLIENT BUNDLE, where anyone able to load application JS could
//      recover it. Obscurity is still not access control.
//   3. Now: the files live server-side (server/assets/governance-references) and
//      are delivered only by server/routes/governanceReferences.ts, mounted
//      after requireApiAuth(), with per-access audit logging.
//
// This module therefore carries NO document body — only the descriptor a
// decision references, plus the protected URL used to open it.

export type GbReferenceDocId = 'handbook-2026-counsel-review-draft' | 'patient-admission-packet-letter-form';

export interface GbReferenceDoc {
  id: GbReferenceDocId;
  title: string;
  /** Controlled-document banner shown wherever the reference is surfaced. */
  controlNotice: string;
  /**
   * How the document must be opened:
   *  - 'new-tab'  → protected server URL in a new tab (noopener,noreferrer).
   *  - 'journey-player' → the canonical Journey handbook player, same tab,
   *    in Governing Body review mode, carrying the decision id + return target.
   */
  openMode: 'new-tab' | 'journey-player';
}

/** Authenticated, audited delivery endpoint. Never a public static path. */
export function protectedReferenceUrl(id: GbReferenceDocId): string {
  return `/api/governance/references/${id}`;
}

export const RECOMMENDED_HANDBOOK_VERSION = 'handbook-2026-counsel-review-draft';

export const GB_REFERENCE_DOCS: Record<GbReferenceDocId, GbReferenceDoc> = {
  'handbook-2026-counsel-review-draft': {
    id: 'handbook-2026-counsel-review-draft',
    title: 'Employee & Field Workforce Handbook 2026 — counsel-review draft',
    controlNotice:
      'COUNSEL-REVIEW DRAFT · BOARD APPROVAL REFERENCE — contains documented compliance and legal-risk findings requiring California employment-counsel review. Not effective, not for distribution, no acknowledgments.',
    openMode: 'journey-player',
  },
  'patient-admission-packet-letter-form': {
    id: 'patient-admission-packet-letter-form',
    title: 'Patient Admission Packet — letter form template',
    controlNotice:
      'TEMPLATE SOURCE · BOARD APPROVAL REFERENCE — production use requires the packet controls decision to pass.',
    openMode: 'new-tab',
  },
};

export function getGbReferenceDoc(id: GbReferenceDocId): GbReferenceDoc {
  return GB_REFERENCE_DOCS[id];
}

/**
 * Canonical Journey handbook player (spec §6).
 *
 * The Journey handbook player is NOT part of this application — it lives in the
 * separate employee-journey app. Governance must not bundle, iframe, or
 * re-implement a second handbook renderer, so the destination is resolved from
 * configuration at click time. When it is unconfigured the action must be
 * VISIBLY DISABLED with a precise reason rather than silently doing nothing or
 * pretending a player exists.
 */
export function journeyHandbookPlayerUrl(params: {
  decisionId: string;
  returnTo: string;
}): string | null {
  const base = (import.meta.env?.VITE_JOURNEY_HANDBOOK_URL as string | undefined)?.trim();
  if (!base) return null;
  const url = new URL(base, window.location.origin);
  url.searchParams.set('mode', 'governing-body-review');
  url.searchParams.set('version', RECOMMENDED_HANDBOOK_VERSION);
  url.searchParams.set('decisionId', params.decisionId);
  url.searchParams.set('returnTo', params.returnTo);
  return url.toString();
}

/** Precise, truthful reason shown when the player destination is unconfigured. */
export const JOURNEY_HANDBOOK_UNCONFIGURED_REASON =
  'The Journey handbook player URL is not configured for this environment (VITE_JOURNEY_HANDBOOK_URL). Set it to open the recommended handbook in Governing Body review mode.';
