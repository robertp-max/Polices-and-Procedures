import { specimenPolicyContent } from '@/policy/data/specimenContent.generated';
import { allPoliciesContentMap } from '@/policy/data/allPoliciesContent.generated';
import type { PolicyContent } from '@/policy/types';

const contentMap = new Map<string, PolicyContent>(allPoliciesContentMap);
contentMap.set(specimenPolicyContent.policyId, specimenPolicyContent);

export function getPolicyBody(policyId: string): string | null {
  const content = contentMap.get(policyId);
  if (!content) return null;
  return content.sections
    .map(section => `## ${section.title}\n\n${section.body}`)
    .join('\n\n');
}

export function getPolicyContent(policyId: string): PolicyContent | null {
  return contentMap.get(policyId) ?? null;
}
