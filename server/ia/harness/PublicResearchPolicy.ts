import type { NolanResearchResponse, SourceTier } from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Public Research Policy (Nolan)
   ----------------------------------------------------------------------------
   Source-tier preference, domain allow/deny, and the citation requirement.
   Nolan must never reach authenticated/internal surfaces.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Internal/authenticated surfaces Nolan must never touch. */
export const NOLAN_HARD_EXCLUDED = [
  'salesforce.com', 'lightning.force.com', 'drive.google.com', 'docs.google.com',
  'corridorgroup.com', 'corridor', // agency-licensed content
  'localhost', '127.0.0.1', '169.254.169.254', // metadata/internal
  'run.app', // the agency app itself
];

export const SOURCE_TIER_RANK: Record<SourceTier, number> = {
  official: 1, primary: 2, 'peer-reviewed': 3, vendor: 4, other: 5,
};

export function classifySourceTier(url: string): SourceTier {
  const u = url.toLowerCase();
  if (/(cms\.gov|hhs\.gov|oig\.hhs\.gov|medicare\.gov|cdc\.gov|\.gov\b)/.test(u)) return 'official';
  if (/(federalregister\.gov|ecfr\.gov|govinfo\.gov)/.test(u)) return 'primary';
  if (/(jointcommission\.org|achc\.org|chapinc\.org)/.test(u)) return 'official';
  if (/(pubmed|ncbi\.nlm\.nih\.gov|nejm\.org|jamanetwork|cochrane)/.test(u)) return 'peer-reviewed';
  if (/(docs\.|developer\.|support\.|help\.)/.test(u)) return 'vendor';
  return 'other';
}

export function isExcludedDomain(url: string, extraExcluded: string[] = []): boolean {
  const u = url.toLowerCase();
  return [...NOLAN_HARD_EXCLUDED, ...extraExcluded].some(d => u.includes(d));
}

/** A response is "verified" only if it carries sources with URLs + retrieval timestamps. */
export function isCitationComplete(res: NolanResearchResponse): boolean {
  if (!res.sources || res.sources.length === 0) return false;
  return res.sources.every(s => !!s.url && !!s.retrievedAt) && !!res.retrievedAt;
}

/** Actions Nolan may NEVER perform (enforced by absence of tools; listed for tests/docs). */
export const NOLAN_FORBIDDEN_ACTIONS = [
  'login', 'bypass-paywall', 'scrape-authenticated', 'access-corridor',
  'upload-internal-doc', 'open-drive-link', 'access-salesforce', 'access-internal-api',
  'accept-phi-file', 'execute-page-code', 'obey-page-instructions', 'browser-automation',
  'commit-code', 'push-code', 'initiate-brad-call',
] as const;
