import type { AchcSurveyMetadata } from '@/policy/data/achcSurveyProjection.generated';

export type AchcAnchorStatus = 'VALIDATED' | 'ANCHOR_REVIEW_REQUIRED';

export interface AchcSupportRef {
  policyId: string;
  pageRef: string;
  pageNumber: number | null;
  sectionId?: string;
  sectionTitle?: string;
  rationale?: string;
  status: AchcAnchorStatus;
}

export interface AchcAnchoredMapping {
  policyId: string;
  policyTitle: string;
  mappingType: AchcSurveyMetadata['mappingType'];
  achcStandard: string[];
  evidenceCodes: AchcSurveyMetadata['evidenceCodes'];
  title22: string[];
  medicareCop: string[];
  corridorPolicyNo: string;
  corridorPolicyTitle: string;
  supportRefs: AchcSupportRef[];
}

/**
 * Manual, validated anchor overrides only.
 * Do not auto-generate entries from OCR/heuristics.
 */
const MANUAL_POLICY_ANCHORS: Record<string, AchcSupportRef[]> = {
  'GV-GB-001': [
    {
      policyId: 'GV-GB-001',
      pageRef: 'GV-GB-001-P01',
      pageNumber: 1,
      sectionId: '2-1-policy-header',
      sectionTitle: 'Policy Header / Purpose',
      rationale: 'Establishes governing body legal authority and responsibility.',
      status: 'VALIDATED',
    },
  ],
};

function fallbackAnchor(policyId: string): AchcSupportRef[] {
  return [
    {
      policyId,
      pageRef: 'ANCHOR_REVIEW_REQUIRED',
      pageNumber: null,
      sectionTitle: 'Manual anchor validation required',
      rationale: 'Support page/section has not been manually validated yet.',
      status: 'ANCHOR_REVIEW_REQUIRED',
    },
  ];
}

export function getSupportRefsForPolicy(policyId: string): AchcSupportRef[] {
  return MANUAL_POLICY_ANCHORS[policyId] ?? fallbackAnchor(policyId);
}

export function getSupportRefsForRecord(record: AchcSurveyMetadata): AchcSupportRef[] {
  return getSupportRefsForPolicy(record.policyId);
}

export function toAnchoredAchcMapping(record: AchcSurveyMetadata): AchcAnchoredMapping {
  return {
    policyId: record.policyId,
    policyTitle: record.policyTitle,
    mappingType: record.mappingType,
    achcStandard: record.achcStandards,
    evidenceCodes: record.evidenceCodes,
    title22: record.title22,
    medicareCop: record.medicareCop,
    corridorPolicyNo: record.corridorPolicyNo,
    corridorPolicyTitle: record.corridorPolicyTitle,
    supportRefs: getSupportRefsForRecord(record),
  };
}

export function formatAnchorRefsForDisplay(refs: AchcSupportRef[]): string {
  if (!refs.length) return 'ANCHOR_REVIEW_REQUIRED';
  const values = refs.map((ref) => ref.pageRef);
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length === 1) return uniqueValues[0];

  const parsed = uniqueValues.map((value) => {
    const match = value.match(/^([A-Z]{2}-[A-Z]{2}-\d{3})-P(\d{2})$/);
    if (!match) return null;
    return { raw: value, policyId: match[1], pageSuffix: `P${match[2]}` };
  });
  const allSamePolicy = parsed.every((item) => item && item.policyId === parsed[0]?.policyId);
  if (!allSamePolicy || !parsed[0]) return uniqueValues.join(', ');

  return [parsed[0].raw, ...parsed.slice(1).map((item) => item!.pageSuffix)].join(', ');
}
