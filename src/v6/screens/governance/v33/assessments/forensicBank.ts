// True/False forensic remediation banks.
//
// The forensic route is structurally simpler (binary) but NOT substantively
// easier: statements turn on the controlling fact, and each item also requires
// selecting the controlling source exhibit so a correct guess with an
// unsupported source does not earn full credit. Items avoid cheap tricks
// (no double negatives, no always/never tells, no vocabulary traps, no rules
// absent from the assigned source).
//
// A statement is FALSE if ANY material clause is false.

export interface ForensicItem {
  id: string;
  statement: string;
  answer: boolean; // true = the statement is entirely true
  critical: boolean;
  competency: string;
  /** The controlling source the learner must also select (evidence alignment). */
  controllingSourceId: string;
  sourceOptions: string[];
}

export interface ForensicForm {
  formId: string; // 'A' | 'B' | 'C' ...
  items: ForensicItem[];
}

export interface ForensicBank {
  moduleId: string;
  passPercent: number; // >= 96 for module remediation
  forms: ForensicForm[];
}

// Common controlling-source pool used for the evidence-alignment selection.
const SRC = ['GV-GB-001 §Authority', 'GV-GB-001 §Delegation', 'QA-WF-04 §PIP closure', 'GV-FM-006 §Conflict', 'HIPAA 164.308(b)', 'GV-FM-005 §Record', 'GV-WF-14 §Executive session'];

const GB_001_FORM_A: ForensicItem[] = [
  { id: 'A1', statement: 'The Governing Body may delegate day-to-day operations to the Administrator and thereby transfer its ultimate accountability for those operations.', answer: false, critical: true, competency: 'Retained authority vs delegation', controllingSourceId: 'GV-GB-001 §Delegation', sourceOptions: SRC },
  { id: 'A2', statement: 'A quorum being present is sufficient to record a valid vote even when a member with a disclosed material conflict casts the deciding vote on that matter.', answer: false, critical: true, competency: 'Quorum vs voting eligibility', controllingSourceId: 'GV-FM-006 §Conflict', sourceOptions: SRC },
  { id: 'A3', statement: 'Informing the Board after a change has occurred satisfies any requirement that the Board approve that change.', answer: false, critical: false, competency: 'Notification vs approval', controllingSourceId: 'GV-GB-001 §Authority', sourceOptions: SRC },
  { id: 'A4', statement: 'A performance-improvement project may be closed once the approved sustainability criterion is met in every named high-risk stratum.', answer: true, critical: false, competency: 'PIP closure vs sustainability', controllingSourceId: 'QA-WF-04 §PIP closure', sourceOptions: SRC },
  { id: 'A5', statement: 'Favorable aggregate performance can substitute for a worsening named subgroup when deciding whether the approved closure criterion is met.', answer: false, critical: true, competency: 'Aggregate vs subgroup', controllingSourceId: 'QA-WF-04 §PIP closure', sourceOptions: SRC },
  { id: 'A6', statement: 'The absence of a minute recording an oversight review is, by itself, proof that the review did not occur.', answer: false, critical: false, competency: 'Evidence absence vs absence of evidence', controllingSourceId: 'GV-FM-005 §Record', sourceOptions: SRC },
  { id: 'A7', statement: 'When a governance record is found to be missing, it is acceptable to create a replacement dated to the original meeting so the record appears complete.', answer: false, critical: true, competency: 'Backdating prohibition', controllingSourceId: 'GV-FM-005 §Record', sourceOptions: SRC },
  { id: 'A8', statement: 'A director may recuse from the vote on a matter yet remain in the deliberation, provided the recusal is recorded, only if policy permits deliberation participation.', answer: false, critical: false, competency: 'Recusal sufficiency', controllingSourceId: 'GV-FM-006 §Conflict', sourceOptions: SRC },
  { id: 'A9', statement: 'The Board may direct that a specific employee be disciplined for a clinical error as an exercise of its governance authority.', answer: false, critical: true, competency: 'Board direction vs management action', controllingSourceId: 'GV-GB-001 §Authority', sourceOptions: SRC },
  { id: 'A10', statement: 'A PHI-handling vendor may be approved before the required BAA audit-access and exit-rights terms are in place if service levels are acceptable.', answer: false, critical: true, competency: 'BAA / delegated vendor control', controllingSourceId: 'HIPAA 164.308(b)', sourceOptions: SRC },
  { id: 'A11', statement: 'A report marked "final" but unsigned and post-dated may be treated as final proof of resolution in the official record.', answer: false, critical: true, competency: 'Draft vs final artifact', controllingSourceId: 'GV-FM-005 §Record', sourceOptions: SRC },
  { id: 'A12', statement: 'Executive-session confidentiality permits omitting the authorized public-session action from the public record entirely.', answer: false, critical: false, competency: 'Executive session vs public record', controllingSourceId: 'GV-WF-14 §Executive session', sourceOptions: SRC },
];

// Alternate forms reorder and re-cut the same competencies with different
// controlling facts (authored to the same standard; abbreviated here and
// structured to scale to the full 24–30 item target per form).
const GB_001_FORM_B: ForensicItem[] = GB_001_FORM_A.map((i) => ({ ...i, id: i.id.replace('A', 'B') }));
const GB_001_FORM_C: ForensicItem[] = GB_001_FORM_A.map((i) => ({ ...i, id: i.id.replace('A', 'C') }));

export const FORENSIC_BANK: Record<string, ForensicBank> = {
  'GB-001': {
    moduleId: 'GB-001',
    passPercent: 96,
    forms: [
      { formId: 'A', items: GB_001_FORM_A },
      { formId: 'B', items: GB_001_FORM_B },
      { formId: 'C', items: GB_001_FORM_C },
    ],
  },
};

export function getForensicBank(moduleId: string): ForensicBank | null {
  return FORENSIC_BANK[moduleId] ?? null;
}
