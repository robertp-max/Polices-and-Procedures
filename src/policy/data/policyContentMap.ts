import { specimenPolicyContent } from '@/policy/data/specimenContent.generated';
import { allPoliciesContent } from '@/policy/data/allPoliciesContent.generated';
import { ACHC_GAP_ANCHOR_SECTIONS } from '@/policy/data/achcGapAnchorSections';
import type { PolicyContent } from '@/policy/types';

const contentMap = new Map<string, PolicyContent>(
  allPoliciesContent.map((policy) => [policy.policyId, policy] as const),
);
contentMap.set(specimenPolicyContent.policyId, specimenPolicyContent);

/**
 * Merge durable ACHC 8-gap anchors so regeneration/wipe of
 * allPoliciesContent.generated.ts cannot drop crosswalk anchors.
 * If the section already exists on generated content, do not duplicate.
 * Exported for regression tests / verifyAchcFinalAlignment wipe simulation.
 */
export function applyAchcGapAnchorOverlay(content: PolicyContent): PolicyContent {
  const overlays = ACHC_GAP_ANCHOR_SECTIONS.filter((o) => o.policyId === content.policyId);
  if (!overlays.length) return content;
  const existingIds = new Set(content.sections.map((s) => s.id));
  const toAdd = overlays.map((o) => o.section).filter((s) => !existingIds.has(s.id));
  if (!toAdd.length) return content;
  return {
    ...content,
    sections: [...content.sections, ...toAdd],
  };
}

function withAchcGapAnchors(content: PolicyContent): PolicyContent {
  return applyAchcGapAnchorOverlay(content);
}

export function getPolicyBody(policyId: string): string | null {
  const content = getPolicyContent(policyId);
  if (!content) return null;
  return content.sections
    .map((section) => `## ${section.title}\n\n${section.body}`)
    .join('\n\n');
}

export function getPolicyContent(policyId: string): PolicyContent | null {
  const base = contentMap.get(policyId) ?? null;
  if (!base) return null;
  return withAchcGapAnchors(base);
}
