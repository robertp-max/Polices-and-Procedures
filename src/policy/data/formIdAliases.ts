export interface FormIdAlias {
  canonicalId: string;
  reason: string;
}

export const FORM_ID_ALIASES: Record<string, FormIdAlias> = {
  'FRM-QAPI-019': {
    canonicalId: 'QA-FM-020',
    reason: 'Legacy V3 CES seed ID for the QAPI data aggregate summary.',
  },
  'OP-FM-030': {
    canonicalId: 'RM-FM-001',
    reason: 'Legacy Q1 EP HVA reference; canonical Enterprise Forms Library HVA worksheet.',
  },
  'OP-FM-031': {
    canonicalId: 'RM-F-020',
    reason: 'Legacy Q1 EP plan reference; canonical emergency mitigation / EP plan template.',
  },
  'OP-FM-032': {
    canonicalId: 'CL-FM-043',
    reason: 'Legacy Q1 EP policies and procedures reference; canonical EP clinical protocol reference.',
  },
  'OP-FM-033': {
    canonicalId: 'RM-FM-002',
    reason: 'Legacy Q1 EP communication plan reference; canonical emergency contact card.',
  },
  'OP-FM-034': {
    canonicalId: 'EN-FM-008',
    reason: 'Legacy Q1 EP approval signature page reference; canonical approval routing form.',
  },
  'oig-f1': {
    canonicalId: 'CO-F-010',
    reason: 'Legacy OIG work plan event artifact ID; canonical OIG/SAM screening log.',
  },
  'oig-f2': {
    canonicalId: 'CO-FM-030',
    reason: 'Legacy OIG exposure matrix artifact ID; canonical OIG self-disclosure checklist.',
  },
  'spe-f2': {
    canonicalId: 'GV-FM-023',
    reason: 'Legacy strategic assessment report artifact ID; canonical annual compliance report.',
  },
  'spe-f3': {
    canonicalId: 'GV-FM-009',
    reason: 'Legacy board priorities artifact ID; canonical strategic planning worksheet.',
  },
  'spe-f4': {
    canonicalId: 'EN-FM-022',
    reason: 'Legacy cascaded operating plans artifact ID; canonical enterprise policy compliance scorecard.',
  },
};

export function resolveCanonicalFormId(formId: string | undefined | null): string | undefined {
  if (!formId) return undefined;
  return FORM_ID_ALIASES[formId]?.canonicalId ?? formId;
}

export function getFormIdAlias(formId: string | undefined | null): FormIdAlias | undefined {
  if (!formId) return undefined;
  return FORM_ID_ALIASES[formId];
}

