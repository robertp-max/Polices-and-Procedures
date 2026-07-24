// True/False forensic remediation items keyed to the tabletop's competencies.
// Mirrors the standard set by ../../assessments/forensicBank.ts (binary
// statement + explanation + linked workflow/forms), scoped to the Governing
// Body boardroom-simulation competencies named in the case-design brief.
//
// Competency ids are the vocabulary every DecisionNode.competencyIds in
// authored CasePacks should draw from (case authors: reuse these ids so
// buildTargetedRemediation can find a match).

import type { GvWorkflowId } from '../engine/caseTypes';

export type TabletopCompetencyId =
  | 'evidence-integrity'
  | 'quorum-recusal'
  | 'pip-closure-sustainability'
  | 'aggregate-vs-subgroup'
  | 'board-vs-management'
  | 'executive-session'
  | 'scope-license'
  | 'vendor-baa'
  | 'budget-cap-resources'
  | 'chow'
  | 'record-integrity';

export interface RemediationTrueFalseItem {
  id: string;
  competencyId: TabletopCompetencyId;
  statement: string;
  answer: boolean; // true = the statement is entirely true
  explanation: string;
  workflowId: GvWorkflowId;
  formIds: string[];
  whyItMatters: string;
}

export const REMEDIATION_BANK: RemediationTrueFalseItem[] = [
  // evidence-integrity ------------------------------------------------------
  {
    id: 'RTF-EI-01',
    competencyId: 'evidence-integrity',
    statement: 'Citing a supplemental synthetic UAT record as if it were recovered source evidence does not change the strength of the Board\'s decision.',
    answer: false,
    explanation: 'Supplemental records exist to complete workflow coverage, not to substitute for recovered evidence; blending them silently misrepresents the evidentiary basis for a decision.',
    workflowId: 'GV-WF-05',
    formIds: ['GB-FORM-PACKET-READINESS'],
    whyItMatters: 'A decision built on misrepresented evidence cannot withstand survey or legal review.',
  },
  {
    id: 'RTF-EI-02',
    competencyId: 'evidence-integrity',
    statement: 'A decoy exhibit that is topically related to the matter but does not support the required decision may still be cited as if it were controlling.',
    answer: false,
    explanation: 'Relevance is not the same as controlling weight — decoys are included precisely to test whether the Board can tell the difference.',
    workflowId: 'GV-WF-05',
    formIds: ['GB-FORM-PACKET-READINESS'],
    whyItMatters: 'Citing the wrong record as controlling evidence produces a decision the record cannot actually support.',
  },
  // quorum-recusal -----------------------------------------------------------
  {
    id: 'RTF-QR-01',
    competencyId: 'quorum-recusal',
    statement: 'A member with a declared conflict of interest on a matter should be excluded from both the vote and the eligible-voter denominator used to judge quorum for that matter.',
    answer: true,
    explanation: 'Counting a conflicted member toward quorum while barring their vote would let an interested party\'s mere presence manufacture a quorum they are not entitled to help form.',
    workflowId: 'GV-WF-02',
    formIds: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
    whyItMatters: 'A vote taken without a properly computed quorum is not a valid governance action.',
  },
  {
    id: 'RTF-QR-02',
    competencyId: 'quorum-recusal',
    statement: 'A recused member may remain in the room during deliberation on the matter as long as their recusal from the vote itself is recorded.',
    answer: false,
    explanation: 'Recusal sufficiency depends on the agency\'s own conflict-of-interest policy; where that policy requires the member to step out of deliberation, recording the vote-recusal alone is not sufficient.',
    workflowId: 'GV-WF-02',
    formIds: ['GB-FORM-RECUSAL-LOG'],
    whyItMatters: 'A recusal that is not actually enforced does not protect the integrity of the decision.',
  },
  // pip-closure-sustainability -------------------------------------------------
  {
    id: 'RTF-PIP-01',
    competencyId: 'pip-closure-sustainability',
    statement: 'A performance-improvement project may be closed once the approved sustainability criterion is demonstrated in the current quarter\'s evidence for every named stratum.',
    answer: true,
    explanation: 'Closure requires the approved criterion to hold for every named stratum, not merely for the population overall.',
    workflowId: 'GV-WF-06',
    formIds: ['GB-FORM-PIP-CLOSURE'],
    whyItMatters: 'Closing a PIP early lets a real, unresolved risk drop off the Board\'s radar.',
  },
  {
    id: 'RTF-PIP-02',
    competencyId: 'pip-closure-sustainability',
    statement: 'If current-quarter evidence for a PIP is silent on one named stratum, the Board may still authorize closure provided the other strata meet the criterion.',
    answer: false,
    explanation: 'Silence on a named stratum is a missing-evidence problem, not a passing result; closure requires affirmative evidence for every named stratum.',
    workflowId: 'GV-WF-06',
    formIds: ['GB-FORM-PIP-CLOSURE'],
    whyItMatters: 'Authorizing closure on incomplete evidence is itself a governance failure, independent of the underlying clinical outcome.',
  },
  // aggregate-vs-subgroup ------------------------------------------------------
  {
    id: 'RTF-AS-01',
    competencyId: 'aggregate-vs-subgroup',
    statement: 'A favorable aggregate metric can mask a worsening named subgroup or linked adverse event, and the Board must look past the aggregate to see it.',
    answer: true,
    explanation: 'Aggregate-masks-subgroup is precisely the pattern QAPI oversight exists to catch; the Board\'s duty runs to the subgroup, not just the topline number.',
    workflowId: 'GV-WF-06',
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    whyItMatters: 'A hidden, worsening subgroup is where the next adverse event is most likely to occur.',
  },
  {
    id: 'RTF-AS-02',
    competencyId: 'aggregate-vs-subgroup',
    statement: 'When an aggregate metric is within target but flagged as masking a subgroup, the correct board posture is to accept closure and move on.',
    answer: false,
    explanation: 'A masked subgroup requires holding closure and directing further review, not accepting an aggregate that hides the real signal.',
    workflowId: 'GV-WF-06',
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    whyItMatters: 'Accepting a masked aggregate as sufficient defeats the purpose of subgroup-level surveillance.',
  },
  // board-vs-management --------------------------------------------------------
  {
    id: 'RTF-BM-01',
    competencyId: 'board-vs-management',
    statement: 'The Governing Body may direct that a specific employee be disciplined for a clinical error as a direct exercise of its governance authority.',
    answer: false,
    explanation: 'The Board directs systemic accountability and holds management to it; directing an individual personnel outcome is management\'s function, not the Board\'s.',
    workflowId: 'GV-WF-09',
    formIds: ['GB-FORM-RESTRICTED-MATTER'],
    whyItMatters: 'A Board that directs individual personnel action is acting outside its authority and outside the record it can defend.',
  },
  {
    id: 'RTF-BM-02',
    competencyId: 'board-vs-management',
    statement: 'Delegating day-to-day operations to the Administrator transfers the Board\'s ultimate accountability for those operations.',
    answer: false,
    explanation: 'Delegation of execution never transfers the Board\'s retained accountability for outcomes.',
    workflowId: 'GV-WF-03',
    formIds: ['GB-FORM-ADMINISTRATOR-CHANGE'],
    whyItMatters: 'Misunderstanding delegation as a transfer of accountability is how oversight gaps form.',
  },
  // executive-session -----------------------------------------------------------
  {
    id: 'RTF-ES-01',
    competencyId: 'executive-session',
    statement: 'A restricted personnel matter discussed in executive session must still be reflected in the public minutes as the fact that an executive session occurred and what public action, if any, resulted.',
    answer: true,
    explanation: 'Confidentiality protects the substance of the deliberation, not the fact that governance occurred; the public record must show that an executive session took place and its authorized public outcome.',
    workflowId: 'GV-WF-09',
    formIds: ['GB-FORM-PUBLIC-MINUTES', 'GB-FORM-EXEC-SESSION-MINUTES'],
    whyItMatters: 'Omitting the fact of governance action entirely breaks the public accountability record.',
  },
  {
    id: 'RTF-ES-02',
    competencyId: 'executive-session',
    statement: 'Executive-session confidentiality permits omitting any authorized public-session action from the public minutes entirely.',
    answer: false,
    explanation: 'Confidentiality covers the restricted deliberation content, not the authorized public action that resulted from it.',
    workflowId: 'GV-WF-09',
    formIds: ['GB-FORM-PUBLIC-MINUTES'],
    whyItMatters: 'A public record with silent gaps where governance decisions should appear is itself a record-integrity defect.',
  },
  // scope-license ------------------------------------------------------------
  {
    id: 'RTF-SL-01',
    competencyId: 'scope-license',
    statement: 'A change to the agency\'s scope of services may be implemented operationally before the Governing Body has approved it, as long as the Board is informed afterward.',
    answer: false,
    explanation: 'Scope-of-services changes require prior Board approval, not after-the-fact notification; notification is not a substitute for approval.',
    workflowId: 'GV-WF-10',
    formIds: ['GB-FORM-SCOPE-CHANGE'],
    whyItMatters: 'Operating outside an approved and licensed scope of services is a direct survey and licensure risk.',
  },
  {
    id: 'RTF-SL-02',
    competencyId: 'scope-license',
    statement: 'A licensure or accreditation renewal that is past its due date but "in process" no longer requires Board-level escalation.',
    answer: false,
    explanation: 'A lapsed or past-due renewal is a standing operational risk regardless of in-process status and requires Board visibility until resolved.',
    workflowId: 'GV-WF-11',
    formIds: ['GB-FORM-LICENSURE-RENEWAL'],
    whyItMatters: 'Operating on an expired license or accreditation exposes the agency to closure or exclusion risk.',
  },
  // vendor-baa -----------------------------------------------------------------
  {
    id: 'RTF-VB-01',
    competencyId: 'vendor-baa',
    statement: 'A PHI-handling vendor may be approved before the required Business Associate Agreement audit-access and exit-rights terms are in place, if service levels are otherwise acceptable.',
    answer: false,
    explanation: 'A compliant BAA with audit-access and exit-rights terms is a precondition to approval, not a follow-up item.',
    workflowId: 'GV-WF-13',
    formIds: ['GB-FORM-VENDOR-BAA'],
    whyItMatters: 'Approving a vendor without a compliant BAA creates uncontrolled PHI exposure.',
  },
  // budget-cap-resources ---------------------------------------------------------
  {
    id: 'RTF-BC-01',
    competencyId: 'budget-cap-resources',
    statement: 'A corrective action plan may be marked effective without the resources (staffing, budget, or systems) the plan itself identified as required to sustain the fix.',
    answer: false,
    explanation: 'Effectiveness requires the CAP\'s own stated resource commitments to actually be in place, not just the corrective activity to have occurred once.',
    workflowId: 'GV-WF-07',
    formIds: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    whyItMatters: 'A CAP that is not resourced will not sustain, and the underlying risk will recur.',
  },
  // chow ------------------------------------------------------------------------
  {
    id: 'RTF-CHOW-01',
    competencyId: 'chow',
    statement: 'A change of ownership can be finalized operationally first, with the Governing Body\'s formal review and required notifications completed afterward.',
    answer: false,
    explanation: 'A change of ownership requires Board review and the associated regulatory notifications as part of, not after, the transaction process.',
    workflowId: 'GV-WF-12',
    formIds: ['GB-FORM-CHOW-NOTIFICATION'],
    whyItMatters: 'Late or missing CHOW notifications can jeopardize licensure, accreditation, and payer enrollment.',
  },
  // record-integrity --------------------------------------------------------------
  {
    id: 'RTF-RI-01',
    competencyId: 'record-integrity',
    statement: 'When a governance record is found to be missing, it is acceptable to create a replacement dated to the original meeting so the record appears complete.',
    answer: false,
    explanation: 'Backdating a record to disguise a gap is a falsification of the governance record, not a correction of it.',
    workflowId: 'GV-WF-05',
    formIds: ['GB-FORM-RECORD-CORRECTION'],
    whyItMatters: 'A falsified record destroys the defensibility of every decision built on it.',
  },
  {
    id: 'RTF-RI-02',
    competencyId: 'record-integrity',
    statement: 'The absence of a minute recording an oversight review is, by itself, conclusive proof that the review did not occur.',
    answer: false,
    explanation: 'A missing record is a documentation defect to be corrected going forward; it is evidence of a gap in the record, not proof the underlying activity never happened.',
    workflowId: 'GV-WF-05',
    formIds: ['GB-FORM-RECORD-CORRECTION'],
    whyItMatters: 'Conflating "no record" with "no review occurred" leads to the wrong remediation (re-litigating history instead of fixing the record process).',
  },
];

const FALLBACK_ITEM_IDS = ['RTF-EI-01', 'RTF-QR-01', 'RTF-RI-01'];

export interface TargetedRemediation {
  microLessonId: string | null;
  trueFalseItemIds: string[];
  items: RemediationTrueFalseItem[];
}

/** Selects remediation items whose competencyId matches any of the missed competencies. */
export function buildTargetedRemediation(missedCompetencyIds: readonly string[]): TargetedRemediation {
  const matched = REMEDIATION_BANK.filter((item) => missedCompetencyIds.includes(item.competencyId));
  const items = matched.length > 0 ? matched : REMEDIATION_BANK.filter((item) => FALLBACK_ITEM_IDS.includes(item.id));
  return {
    microLessonId: items.length > 0 ? items[0].competencyId : null,
    trueFalseItemIds: items.map((i) => i.id),
    items,
  };
}
