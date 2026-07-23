/**
 * Canonical module titles for the Governing Body Academy.
 * Single source of truth for module IDs and their display titles.
 * Extracted from academyData.ts MODULES array.
 */

export const CANONICAL_MODULE_TITLES: Record<string, string> = {
  'GB-001': 'The Authority That Cannot Disappear',
  'GB-002': 'Structure, Bylaws, Membership & Orientation',
  'GB-003': 'Meetings That Prove Governance',
  'GB-004': 'Appoint, Oversee, Replace',
  'GB-005': 'QAPI as an Executive Duty',
  'GB-006': 'Compliance Independence & Escalation',
  'GB-007': 'Fiscal Stewardship Under Regulatory Risk',
  'GB-008': 'Strategy, Scope & Policy Authority',
  'GB-009': 'Enterprise Risk, Incidents & Emergency Governance',
  'GB-010': 'Contracts, Referrals & External Arrangements',
  'GB-011': 'Survey, Enforcement & Closure Decisions',
  'GB-012': 'Conflicts, Ethics & Governance Improvement',
  'GB-CAPSTONE': 'The Governance Record Under Pressure',
};

/**
 * Retrieve the canonical title for a module ID.
 * Returns undefined if the module ID is not found.
 */
export function canonicalTitle(id: string): string | undefined {
  return CANONICAL_MODULE_TITLES[id];
}
