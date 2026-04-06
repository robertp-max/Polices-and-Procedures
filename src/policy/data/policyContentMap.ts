import { specimenPolicyContent } from '@/policy/data/specimenContent.generated';
import type { PolicyContent } from '@/policy/types';

const contentMap: Record<string, PolicyContent> = {
  [specimenPolicyContent.policyId]: specimenPolicyContent,
};

export function getPolicyBody(policyId: string): string | null {
  const content = contentMap[policyId];
  if (!content) {
    return null;
  }

  return content.sections
    .map(section => `## ${section.title}\n\n${section.body}`)
    .join('\n\n');
}

export function getPolicyContent(policyId: string): PolicyContent | null {
  return contentMap[policyId] || null;
}
