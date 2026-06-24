import { FORMS_DATASET } from './formsLibraryDataset';
import { FORM_TITLES } from './formTitles.generated';
import { getFormMeta } from './formsCatalog';

export interface FormIdAlias {
  canonicalId: string;
  reason: string;
}

export const FORM_ID_ALIASES: Record<string, FormIdAlias> = {
  // existing legacy
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

  // FRM-* legacy template refs mapped to real FORMS_DATASET canonicals (real seed only)
  'FRM-GV-001': { canonicalId: 'GV-FM-004', reason: 'Legacy template FRM -> real Governing Body Meeting Agenda Template' },
  'FRM-GV-002': { canonicalId: 'GV-FM-005', reason: 'Legacy template FRM -> real Governing Body Meeting Minutes Template' },
  'FRM-GV-003': { canonicalId: 'GV-FM-006', reason: 'Legacy template FRM -> real Conflict of Interest Disclosure Form' },
  'FRM-GV-004': { canonicalId: 'GV-FM-005', reason: 'Legacy template FRM -> real Governing Body minutes template' },
  'FRM-GV-005': { canonicalId: 'GV-FM-011', reason: 'Legacy template FRM -> real Governing Body Roster' },
  'FRM-QA-001': { canonicalId: 'QA-FM-001', reason: 'Legacy template FRM -> real QAPI Committee Meeting Minutes Template' },
  'FRM-QA-002': { canonicalId: 'QA-FM-003', reason: 'Legacy template FRM -> real Quality Indicator Monthly Dashboard' },
  'FRM-QA-003': { canonicalId: 'QA-FM-021', reason: 'Legacy template FRM -> real PIP Remeasurement template' },
  'FRM-QA-004': { canonicalId: 'QA-FM-001', reason: 'Legacy template FRM -> real QAPI minutes' },
  'FRM-CL-010': { canonicalId: 'CL-FM-034', reason: 'Legacy template FRM -> real Clinical Record Completion Audit Checklist' },
  'FRM-CL-011': { canonicalId: 'CL-FM-034', reason: 'Legacy template FRM -> real Clinical audit' },
  'FRM-CL-020': { canonicalId: 'CL-FM-008', reason: 'Legacy template FRM -> real Physician Order Signature Tracking Log' },
  'FRM-CO-001': { canonicalId: 'CO-FM-004', reason: 'Legacy template FRM -> real Survey / Inspection Readiness Self-Assessment' },
  'FRM-CO-010': { canonicalId: 'CO-FM-001', reason: 'Legacy template FRM -> real Annual Compliance Program Attestation' },
  'FRM-CO-011': { canonicalId: 'CO-FM-020', reason: 'Legacy template FRM -> real Records Retention & Destruction Schedule' },
  'FRM-IS-010': { canonicalId: 'IS-F-001', reason: 'Legacy template FRM -> real CES IS worksheet' },
  'FRM-IS-011': { canonicalId: 'IS-F-002', reason: 'Legacy template FRM -> real CES remediation' },
  'FRM-OP-020': { canonicalId: 'OP-F-001', reason: 'Legacy template FRM -> real CES OP EP exercise' },
  'FRM-OP-021': { canonicalId: 'RM-FM-005', reason: 'Legacy template FRM -> real AAR form' },
  'FRM-OP-022': { canonicalId: 'RM-F-020', reason: 'Legacy template FRM -> real EP mitigation plan' },
  'FRM-FN-010': { canonicalId: 'FN-FM-001', reason: 'Legacy template FRM -> real Daily Claims Submission Log' },
  'FRM-RM-010': { canonicalId: 'RM-F-010', reason: 'Legacy template FRM -> real CES Quarterly Risk Report' },
  'FRM-RM-011': { canonicalId: 'RM-F-011', reason: 'Legacy template FRM -> real CES Risk Mitigation Plan' },
  'FRM-HR-040': { canonicalId: 'HR-FM-017', reason: 'Legacy template FRM -> real Training Attendance & Completion Roster' },
  'FRM-HR-041': { canonicalId: 'HR-FM-017', reason: 'Legacy template FRM -> real training roster' },
  'FRM-HR-050': { canonicalId: 'HR-FM-021', reason: 'Legacy template FRM -> real Annual Immunization Log' },
  'FRM-HR-051': { canonicalId: 'HR-FM-013', reason: 'Legacy template FRM -> real Hep B / TB forms' },
  'FRM-HR-030': { canonicalId: 'HR-FM-005', reason: 'Legacy template FRM -> real OIG/SAM Monthly Exclusion Verification Log' },
  'FRM-HR-060': { canonicalId: 'HR-FM-016', reason: 'Legacy template FRM -> real Clinical Staff Competency Validation Checklist' },
  'FRM-RM-020': { canonicalId: 'RM-F-020', reason: 'Legacy template FRM -> real EP plan' },
  'FRM-RM-021': { canonicalId: 'RM-FM-005', reason: 'Legacy template FRM -> real After-Action Review' },

  // non-seed high FM-* refs from regulatoryEvents -> real existing canonicals (no fake seed entries)
  'OP-FM-040': { canonicalId: 'OP-FM-020', reason: 'Regulatory ref to non-present OP-FM-040 -> real After-Hours log' },
  'OP-FM-041': { canonicalId: 'OP-FM-013', reason: 'Regulatory ref non-present -> real Standard Fax Cover' },
  'OP-FM-042': { canonicalId: 'HR-FM-006', reason: 'Regulatory ref non-present -> real License & Cert verification' },
  'OP-FM-050': { canonicalId: 'OP-F-001', reason: 'Regulatory ref non-present -> real EP Exercise Record' },
  'OP-FM-051': { canonicalId: 'OP-FM-020', reason: 'Regulatory ref non-present -> real On-Call Log' },
  'OP-FM-052': { canonicalId: 'RM-FM-005', reason: 'Regulatory ref non-present -> real AAR' },
  'OP-FM-053': { canonicalId: 'RM-FM-005', reason: 'Regulatory ref non-present -> real AAR' },
  'OP-FM-054': { canonicalId: 'RM-FM-005', reason: 'Regulatory ref non-present -> real AAR' },
  'CL-FM-060': { canonicalId: 'CL-FM-016', reason: 'Regulatory ref non-present CL aide obs -> real HHA Competency Checklist' },
  'CL-FM-061': { canonicalId: 'CL-FM-042', reason: 'Regulatory ref non-present -> real Supervisory Visit (RN)' },
  'CL-FM-062': { canonicalId: 'CL-FM-042', reason: 'Regulatory ref non-present -> real Supervisory Visit (RN)' },
};

export function getFormIdAlias(formId: string | undefined | null): FormIdAlias | undefined {
  if (!formId) return undefined;
  return FORM_ID_ALIASES[formId];
}

/**
 * Resolve any (possibly legacy/alias) formId to its canonical ID present in FORMS_DATASET.
 * Falls back to input if no alias.
 */
export function resolveCanonicalFormId(formId: string | undefined | null): string | undefined {
  if (!formId) return undefined;
  return FORM_ID_ALIASES[formId]?.canonicalId ?? formId;
}

/** Robust title resolver using real seeds only: FORMS_DATASET (name), then generated titles, then catalog, then id. */
export function resolveFormTitle(formId: string | undefined | null): string {
  if (!formId) return 'Unknown form';
  const canon = resolveCanonicalFormId(formId) ?? formId;
  const ds = FORMS_DATASET.find((f) => f.id === canon);
  if (ds?.name) return ds.name;
  if (FORM_TITLES[canon]) return FORM_TITLES[canon];
  const meta = getFormMeta(canon);
  if (meta?.title) return meta.title;
  return canon;
}

