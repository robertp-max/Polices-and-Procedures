import { getPolicyContent } from '@/policy/data/policyContentMap';
import { achcSurveyRows } from '@/policy/data/achcSurveyProjection.generated';
import { achcPrintCrosswalk } from '@/policy/data/achcPrintCrosswalk.generated';

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

/** Crosswalk-backed resolver for ACHC standard to policy mapping (fixes unresolved). */
export function resolveAchcCrosswalkTarget(policyId: string): { standards: string[]; mappingType?: string; corridor?: string } | null {
  const survey = achcSurveyRows.find(r => r.policyId === policyId);
  if (survey) {
    return {
      standards: survey.achcStandards,
      mappingType: survey.mappingType,
      corridor: survey.corridorPolicyNo || survey.corridorPolicyTitle,
    };
  }
  const cross = achcPrintCrosswalk.find(r => r.ibmPolicyId === policyId);
  if (cross && cross.ibmPolicyId !== 'UNMAPPED') {
    return {
      standards: cross.achcStandards,
      mappingType: cross.mappingConfidence === 'HIGH' ? 'DIRECT' : 'PARTIAL',
      corridor: cross.corridorPolicyNo,
    };
  }
  return null;
}

export function canResolveAchcStandardTarget(policyId: string, standard: string, surveyNotes?: string): boolean {
  const content = getPolicyContent(policyId);
  const token = lower(standard);

  if (content?.sections?.some((section) => `${section.title}\n${section.body}`.toLowerCase().includes(token))) {
    return true;
  }

  // Fix: also resolve via crosswalk/survey data (real mappings)
  const xw = resolveAchcCrosswalkTarget(policyId);
  if (xw && xw.standards.some(s => lower(s).includes(token) || lower(standard).includes(lower(s)))) {
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

