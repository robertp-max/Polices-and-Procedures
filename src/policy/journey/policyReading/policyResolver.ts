/* ═══════════════════════════════════════════════════════════════
   POLICY ID RESOLVER — Phase 2 for Onboarding P&P JourneyActivity v2.3
   Source: docs/onboarding/ONBOARDING_ARCHITECTURE_v2.3.md
   Controls resolution of policy IDs for reading activities, quizzes, attestation.
   Uses allPoliciesContent.generated.ts as the single source of truth.
   ═══════════════════════════════════════════════════════════════ */

import { allPoliciesContent } from '@/policy/data/allPoliciesContent.generated';
import type { PolicyContent, PolicyContentSection } from '@/policy/types';

export type PolicyRefStatus = 'verified' | 'needs_review' | 'invalid';

export interface PolicyResolution {
  requestedPolicyId: string;
  resolvedPolicyId: string | null;
  policyTitle: string | null;
  policyRefStatus: PolicyRefStatus;
  fullTextAvailable: boolean;
  sectionCount: number;
  sectionsAvailableForQuiz: boolean;
  policyVersionDate: string | null;
  policyVersionHash?: string | null;
  source: 'allPoliciesContent.generated.ts';
  confidence: 'high' | 'medium' | 'low' | 'none';
  notes: string[];
  candidateMatches?: Array<{
    policyId: string;
    policyTitle: string;
    reason: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
}

export interface PolicyTextForReading {
  policyId: string;
  policyTitle: string | null;
  content: string | null;
  sections: Array<{
    sectionId: string;
    title: string;
    text: string;
  }>;
  policyRefStatus: PolicyRefStatus;
}

/**
 * Extracts a human readable title from the policy content.
 * Prefers the "Policy Title" row in the header table.
 */
function extractPolicyTitle(policy: PolicyContent): string | null {
  for (const section of policy.sections) {
    // Look for markdown table row with Policy Title
    const titleMatch = section.body.match(/\|\s*Policy Title\s*\|\s*([^|\n]+?)\s*\|/i);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
  }
  // Fallback: first non-header section title
  const firstContentSection = policy.sections.find(s => s.level >= 2 && !/header|policy header/i.test(s.title));
  if (firstContentSection) return firstContentSection.title;
  if (policy.sections.length > 0) return policy.sections[0].title;
  return null;
}

/**
 * Extracts effective date / version info.
 */
function extractVersionDate(policy: PolicyContent): string | null {
  for (const section of policy.sections) {
    const dateMatch = section.body.match(/\|\s*Effective Date\s*\|\s*([0-9-]+)/i);
    if (dateMatch) return dateMatch[1];
    const versionMatch = section.body.match(/\|\s*Version\s*\|\s*([^|]+)/i);
    if (versionMatch) {
      const v = versionMatch[1].trim();
      // try to find date nearby
      const dateNearby = section.body.match(/([0-9]{4}-[0-9]{2}-[0-9]{2})/);
      return dateNearby ? dateNearby[1] : v;
    }
  }
  return null;
}

/**
 * Determines if the policy has sufficient content for quiz generation.
 */
function hasQuizReadyContent(policy: PolicyContent): boolean {
  if (policy.sections.length < 3) return false;
  const totalBodyLength = policy.sections.reduce((sum, s) => sum + (s.body?.length || 0), 0);
  return totalBodyLength > 800; // heuristic for meaningful content
}

/**
 * Finds candidate similar policies when exact match fails.
 */
function findCandidateMatches(requestedId: string, limit = 3): PolicyResolution['candidateMatches'] {
  const normalized = requestedId.toUpperCase().trim();
  const prefix = normalized.split('-')[0];

  const candidates = allPoliciesContent
    .filter(p => {
      const id = p.policyId.toUpperCase();
      return (
        id.startsWith(prefix) ||
        id.includes(normalized.substring(0, 6)) ||
        (normalized.length > 3 && id.includes(normalized.substring(0, 4)))
      );
    })
    .slice(0, limit)
    .map(p => ({
      policyId: p.policyId,
      policyTitle: extractPolicyTitle(p) || p.policyId,
      reason: `Similar prefix or partial match to ${requestedId}`,
      confidence: (p.policyId.startsWith(prefix) ? 'medium' : 'low') as 'high' | 'medium' | 'low',
    }));

  return candidates.length > 0 ? candidates : undefined;
}

/**
 * Core resolver for a single policy ID.
 * This is the heart of Phase 2.
 */
export function resolvePolicyId(policyId: string): PolicyResolution {
  const requested = (policyId || '').trim();

  if (!requested || requested.length < 3) {
    return {
      requestedPolicyId: policyId,
      resolvedPolicyId: null,
      policyTitle: null,
      policyRefStatus: 'invalid',
      fullTextAvailable: false,
      sectionCount: 0,
      sectionsAvailableForQuiz: false,
      policyVersionDate: null,
      source: 'allPoliciesContent.generated.ts',
      confidence: 'none',
      notes: ['Invalid or empty policy ID provided'],
    };
  }

  const exact = allPoliciesContent.find(p => p.policyId === requested);

  if (exact) {
    const title = extractPolicyTitle(exact);
    const fullTextAvailable = exact.sections.some(s => (s.body || '').trim().length > 100);
    const sectionCount = exact.sections.length;
    const sectionsAvailableForQuiz = hasQuizReadyContent(exact);
    const versionDate = extractVersionDate(exact);

    const status: PolicyRefStatus =
      exact.policyId === requested &&
      !!title &&
      fullTextAvailable &&
      sectionsAvailableForQuiz
        ? 'verified'
        : 'needs_review';

    const confidence = status === 'verified' ? 'high' : 'medium';

    return {
      requestedPolicyId: policyId,
      resolvedPolicyId: exact.policyId,
      policyTitle: title,
      policyRefStatus: status,
      fullTextAvailable,
      sectionCount,
      sectionsAvailableForQuiz,
      policyVersionDate: versionDate,
      source: 'allPoliciesContent.generated.ts',
      confidence,
      notes: status === 'needs_review'
        ? ['Exact ID found but content may be insufficient for full quiz/reading requirements']
        : [],
    };
  }

  // No exact match — look for candidates
  const candidates = findCandidateMatches(requested);

  return {
    requestedPolicyId: policyId,
    resolvedPolicyId: null,
    policyTitle: null,
    policyRefStatus: candidates && candidates.length > 0 ? 'needs_review' : 'invalid',
    fullTextAvailable: false,
    sectionCount: 0,
    sectionsAvailableForQuiz: false,
    policyVersionDate: null,
    source: 'allPoliciesContent.generated.ts',
    confidence: candidates ? 'low' : 'none',
    notes: candidates
      ? [`No exact match for "${requested}". Review suggested candidates.`]
      : [`No match found for "${requested}". ID may be invalid or not yet in the policy corpus.`],
    candidateMatches: candidates,
  };
}

/**
 * Batch resolver.
 */
export function resolvePolicyIds(policyIds: string[]): PolicyResolution[] {
  return policyIds.map(id => resolvePolicyId(id));
}

/**
 * Returns full readable text and sections for a policy reading activity.
 * Used by the (future) reader + quiz components.
 */
export function getPolicyTextForReading(policyId: string): PolicyTextForReading {
  const resolution = resolvePolicyId(policyId);
  const content = allPoliciesContent.find(p => p.policyId === resolution.resolvedPolicyId);

  if (!content) {
    return {
      policyId,
      policyTitle: null,
      content: null,
      sections: [],
      policyRefStatus: resolution.policyRefStatus,
    };
  }

  const title = resolution.policyTitle || extractPolicyTitle(content);
  const fullContent = content.sections
    .map((s: PolicyContentSection) => `## ${s.title}\n\n${s.body}`)
    .join('\n\n');

  const sections = content.sections.map((s: PolicyContentSection) => ({
    sectionId: s.id,
    title: s.title,
    text: s.body,
  }));

  return {
    policyId: content.policyId,
    policyTitle: title,
    content: fullContent,
    sections,
    policyRefStatus: resolution.policyRefStatus,
  };
}

/* ═══════════════════════════════════════════════════════════════
   BASIC VALIDATION FIXTURE (for Phase 2 verification)
   Run manually or extend into a test later.
   These IDs come from the task spec.
   ═══════════════════════════════════════════════════════════════ */

export const KNOWN_GOOD_IDS = [
  'CO-HP-101',
  'CO-CP-004',
  'CO-FW-101',
  'HR-TR-101',
  'CL-CA-001',
  'CL-CP-001',
  'CL-OA-001',
  'CL-SD-025',
  'HR-TD-003',
  'QA-PG-001',
];

export const KNOWN_BAD_IDS = [
  'CO-HP-102',
  'CL-IC-001',
  'CL-IC-002',
  'HR-CE-001',
  'CL-SV-001',
  'CL-SV-002',
  'CL-QA-001',
  'HR-EE-001',
];

/**
 * Helper to quickly validate the resolver against the spec's known lists.
 * Returns summary for reporting.
 */
export function runResolverValidation() {
  const goodResults = KNOWN_GOOD_IDS.map(id => ({ id, result: resolvePolicyId(id) }));
  const badResults = KNOWN_BAD_IDS.map(id => ({ id, result: resolvePolicyId(id) }));

  const verifiedCount = goodResults.filter(r => r.result.policyRefStatus === 'verified').length;
  const needsReviewGood = goodResults.filter(r => r.result.policyRefStatus === 'needs_review').length;
  const invalidGood = goodResults.filter(r => r.result.policyRefStatus === 'invalid').length;

  const verifiedBad = badResults.filter(r => r.result.policyRefStatus === 'verified').length; // must be 0
  const needsReviewBad = badResults.filter(r => r.result.policyRefStatus === 'needs_review').length;
  const invalidBad = badResults.filter(r => r.result.policyRefStatus === 'invalid').length;

  return {
    good: { verifiedCount, needsReviewGood, invalidGood, details: goodResults },
    bad: { verifiedBad, needsReviewBad, invalidBad, details: badResults },
    allVerifiedAreGood: verifiedBad === 0,
  };
}
