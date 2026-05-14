import { getPolicyContent } from '@/policy/data/policyContentMap';

function lower(value: string): string {
  return value.toLowerCase();
}

export function splitAchcStandards(values: string[]): string[] {
  const out = new Set<string>();
  for (const value of values) {
    for (const token of value.split(/[;,]/)) {
      const normalized = token.trim();
      if (normalized) out.add(normalized);
    }
  }
  return [...out];
}

export function canResolveAchcStandardTarget(policyId: string, standard: string, surveyNotes?: string): boolean {
  const content = getPolicyContent(policyId);
  const token = lower(standard);

  if (content?.sections?.some((section) => `${section.title}\n${section.body}`.toLowerCase().includes(token))) {
    return true;
  }

  const notes = lower(surveyNotes ?? '');
  if (!notes) return false;
  if (notes.includes(token)) return true;
  if (/\bsection\s+\d{1,2}\b/i.test(notes)) return true;
  if (notes.includes('policy statement')) return true;
  if (notes.includes('purpose')) return true;
  if (notes.includes('scope')) return true;
  if (notes.includes('compliance') || notes.includes('audit')) return true;
  return false;
}

