// Authored guided True/False remediation bank (§6).
//
// This bank is deliberately LOW-friction, not adversarial: plain language, no
// double negatives, no trick wording, one clean claim per statement. It exists
// to help a learner who missed a concept on their first attempt understand it
// — not to catch them again. Contrast with assessments/forensicBank.ts, which
// is the adversarial forensic-remediation capstone path.
//
// Each authored item names a `controllingSourceRef` — a real policy id from
// the corpus — so the guided player can link straight back to the section
// that resolves the statement. Each item also names a `transferPromptRef`,
// pointing at a "changed facts" variant in TRANSFER_PROMPTS: after a learner
// has corrected every missed item, ONE transfer prompt (drawn from the
// assigned set) is the final check that understanding actually transferred,
// rather than the learner having memorized the original wording.

export type RemediationConceptId =
  | 'retained_authority'
  | 'quorum_vs_eligibility'
  | 'conflict_recusal'
  | 'aggregate_vs_subgroup'
  | 'pip_closure_vs_sustainability'
  | 'notification_vs_approval'
  | 'backdating'
  | 'board_direction_vs_management_action'
  | 'baa_vendor_control';

export interface GuidedTrueFalseItem {
  id: string;
  conceptId: RemediationConceptId;
  statement: string;
  answer: boolean;
  plainExplanation: string;
  /** Real policy corpus id the statement is resolved by, e.g. "GV-GB-001". */
  controllingSourceRef: string;
  /** Id into TRANSFER_PROMPTS for this item's changed-facts follow-up. */
  transferPromptRef: string;
}

export interface TransferPrompt {
  id: string;
  conceptId: RemediationConceptId;
  /** The same idea with a material fact changed, testing transfer not recall. */
  statement: string;
  answer: boolean;
  plainExplanation: string;
  controllingSourceRef: string;
}

export const CONCEPT_LABELS: Record<RemediationConceptId, string> = {
  retained_authority: 'Retained authority vs. delegated operations',
  quorum_vs_eligibility: 'Quorum vs. voting eligibility',
  conflict_recusal: 'Conflict of interest & recusal',
  aggregate_vs_subgroup: 'Aggregate results vs. subgroup detail',
  pip_closure_vs_sustainability: 'PIP closure vs. sustained performance',
  notification_vs_approval: 'Notification vs. approval',
  backdating: 'Record dating & backdating',
  board_direction_vs_management_action: 'Board direction vs. management action',
  baa_vendor_control: 'BAA & vendor control',
};

export const GUIDED_ITEMS: GuidedTrueFalseItem[] = [
  // retained_authority — GV-GB-001
  {
    id: 'RTA-01',
    conceptId: 'retained_authority',
    statement:
      'Once the Board delegates day-to-day operations to the Administrator, the Board is no longer accountable for decisions made under that delegation.',
    answer: false,
    plainExplanation:
      'Delegating operations moves the day-to-day work, not the Board’s accountability. The Board remains ultimately accountable, and certain matters are reserved to the Board no matter how much is delegated.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'RTA-T1',
  },
  {
    id: 'RTA-02',
    conceptId: 'retained_authority',
    statement:
      'A brand-new, high-risk service line can be permanently approved by the Administrator alone, without ever returning to the Board.',
    answer: false,
    plainExplanation:
      'Adding a new service line changes the organization’s risk profile, which makes it a Board-reserved decision. It has to come back for Board approval and be entered in the record.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'RTA-T1',
  },
  // quorum_vs_eligibility — GV-GB-002
  {
    id: 'QVE-01',
    conceptId: 'quorum_vs_eligibility',
    statement:
      'A meeting can take official action once the head-count meets quorum, even if none of the required voting categories (for example, a physician member) is present.',
    answer: false,
    plainExplanation:
      'Quorum is a numeric threshold AND a category requirement together. Hitting the head-count without the required voting category present means the meeting cannot validly act.',
    controllingSourceRef: 'GV-GB-002',
    transferPromptRef: 'QVE-T1',
  },
  {
    id: 'QVE-02',
    conceptId: 'quorum_vs_eligibility',
    statement:
      'Being counted toward quorum and being eligible to vote are the same thing — anyone who counts toward quorum may also cast a vote.',
    answer: false,
    plainExplanation:
      'Quorum measures who is present; eligibility measures who may vote. A non-voting attendee can help make the room "present" without being able to cast a vote.',
    controllingSourceRef: 'GV-GB-002',
    transferPromptRef: 'QVE-T1',
  },
  // conflict_recusal — GV-GB-003
  {
    id: 'CFR-01',
    conceptId: 'conflict_recusal',
    statement:
      'A Board member with a financial interest in a vendor contract under discussion may vote on it as long as they disclose the interest at the start of the meeting.',
    answer: false,
    plainExplanation:
      'Disclosure is the first step, not the whole requirement. A member with a conflict must also recuse from the discussion and the vote, not merely announce the conflict and then participate anyway.',
    controllingSourceRef: 'GV-GB-003',
    transferPromptRef: 'CFR-T1',
  },
  {
    id: 'CFR-02',
    conceptId: 'conflict_recusal',
    statement:
      'Recusal only means stepping out of the vote itself — the conflicted member may still take part in the discussion beforehand.',
    answer: false,
    plainExplanation:
      'Recusal covers the discussion as well as the vote. A conflicted member should not be shaping the conversation that leads to the vote either.',
    controllingSourceRef: 'GV-GB-003',
    transferPromptRef: 'CFR-T1',
  },
  // aggregate_vs_subgroup — QA-GB-010
  {
    id: 'AVS-01',
    conceptId: 'aggregate_vs_subgroup',
    statement:
      'A strong aggregate compliance percentage across all disciplines means every individual discipline is doing well, so subgroup detail does not need separate review.',
    answer: false,
    plainExplanation:
      'An aggregate can hide a struggling subgroup behind strong performers. QAPI review has to look at subgroup detail, not just the combined number.',
    controllingSourceRef: 'QA-GB-010',
    transferPromptRef: 'AVS-T1',
  },
  {
    id: 'AVS-02',
    conceptId: 'aggregate_vs_subgroup',
    statement:
      'If the aggregate metric meets target, QAPI can close that review without checking whether any single discipline or site is an outlier.',
    answer: false,
    plainExplanation:
      'Meeting the aggregate target is not the same as confirming no outlier exists underneath it. Outlier subgroups have to be checked before a review is closed.',
    controllingSourceRef: 'QA-GB-010',
    transferPromptRef: 'AVS-T1',
  },
  // pip_closure_vs_sustainability — QA-GB-010
  {
    id: 'PCS-01',
    conceptId: 'pip_closure_vs_sustainability',
    statement:
      'A Performance Improvement Plan (PIP) can be closed as soon as the target metric is met one time.',
    answer: false,
    plainExplanation:
      'One good data point is a result, not a sustained result. Closure requires demonstrating the gain holds over a defined monitoring period.',
    controllingSourceRef: 'QA-GB-010',
    transferPromptRef: 'PCS-T1',
  },
  {
    id: 'PCS-02',
    conceptId: 'pip_closure_vs_sustainability',
    statement:
      'Once a PIP is closed, no further monitoring of that metric is required.',
    answer: false,
    plainExplanation:
      'Closure is not the finish line for monitoring. The metric is still tracked afterward to confirm the improvement is holding, not slipping back.',
    controllingSourceRef: 'QA-GB-010',
    transferPromptRef: 'PCS-T1',
  },
  // notification_vs_approval — GV-GB-001
  {
    id: 'NVA-01',
    conceptId: 'notification_vs_approval',
    statement:
      'Being told about a completed operational change after the fact counts the same as the Board having approved it in advance.',
    answer: false,
    plainExplanation:
      'Notification tells the Board something already happened. Approval is the Board deciding before it happens. They are not interchangeable when approval was actually required.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'NVA-T1',
  },
  {
    id: 'NVA-02',
    conceptId: 'notification_vs_approval',
    statement:
      'If a matter required Board authorization, noting it in the minutes after the fact satisfies that requirement as long as no one objects.',
    answer: false,
    plainExplanation:
      'Silence is not a vote. When authorization was required, the record has to show an actual decision was made, not just an unopposed mention.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'NVA-T1',
  },
  // backdating — GV-GB-002
  {
    id: 'BKD-01',
    conceptId: 'backdating',
    statement:
      'If the Board discovers a required approval was missed, the right fix is to date a new approval to the earlier date it should have happened.',
    answer: false,
    plainExplanation:
      'Backdating a record to make it look like a decision happened earlier than it did is never acceptable. The right fix is to ratify the action now, dated today, with the gap disclosed.',
    controllingSourceRef: 'GV-GB-002',
    transferPromptRef: 'BKD-T1',
  },
  {
    id: 'BKD-02',
    conceptId: 'backdating',
    statement:
      'The Board may ratify a past action today, as long as the ratification record is dated the day the ratification actually happens, not the earlier date.',
    answer: true,
    plainExplanation:
      'This is the correct practice: ratify now, dated now. What is never acceptable is dating that ratification to look like it happened back when the original action occurred.',
    controllingSourceRef: 'GV-GB-002',
    transferPromptRef: 'BKD-T1',
  },
  // board_direction_vs_management_action — GV-GB-001
  {
    id: 'BDM-01',
    conceptId: 'board_direction_vs_management_action',
    statement:
      'When the Board sets a strategic direction, such as reducing hospitalization readmissions, the Board is also responsible for personally carrying out the day-to-day tasks needed to achieve it.',
    answer: false,
    plainExplanation:
      'Setting direction and overseeing progress is the Board’s job; carrying out the operational tasks is management’s job. Mixing the two blurs governance and operations.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'BDM-T1',
  },
  {
    id: 'BDM-02',
    conceptId: 'board_direction_vs_management_action',
    statement:
      'Management may quietly substitute its own priorities for a clear Board directive without bringing the conflict back to the Board.',
    answer: false,
    plainExplanation:
      'Management implements the Board’s direction. If management believes a different priority is needed, that conflict has to go back to the Board for a decision, not be resolved unilaterally.',
    controllingSourceRef: 'GV-GB-001',
    transferPromptRef: 'BDM-T1',
  },
  // baa_vendor_control — CO-HP-005
  {
    id: 'BVC-01',
    conceptId: 'baa_vendor_control',
    statement:
      'Any vendor that only ever handles truly de-identified, aggregate data needs a Business Associate Agreement (BAA), the same as a vendor with full patient-identifiable access.',
    answer: false,
    plainExplanation:
      'A BAA is required for vendors handling protected health information on the organization’s behalf. A vendor that only ever touches genuinely de-identified, aggregate data is not in that category.',
    controllingSourceRef: 'CO-HP-005',
    transferPromptRef: 'BVC-T1',
  },
  {
    id: 'BVC-02',
    conceptId: 'baa_vendor_control',
    statement:
      'Once a BAA is signed, the organization has no further obligation to check whether the vendor is actually meeting its safeguard commitments.',
    answer: false,
    plainExplanation:
      'A signed BAA is a starting point, not a closing one. Ongoing oversight of whether the vendor is actually meeting its safeguard commitments is still required.',
    controllingSourceRef: 'CO-HP-005',
    transferPromptRef: 'BVC-T1',
  },
];

export const TRANSFER_PROMPTS: TransferPrompt[] = [
  {
    id: 'RTA-T1',
    conceptId: 'retained_authority',
    statement:
      'If the Administrator instead approves a routine, low-risk scheduling change that is already within existing policy, that decision must still return to the Board for a vote before it takes effect.',
    answer: false,
    plainExplanation:
      'Ordinary operational decisions within existing policy are exactly what delegation is for. The rule that changes are reserved to the Board applies to non-delegable matters like new service lines — not to routine operations already covered by policy.',
    controllingSourceRef: 'GV-GB-001',
  },
  {
    id: 'QVE-T1',
    conceptId: 'quorum_vs_eligibility',
    statement:
      'If quorum is met numerically but the required physician member steps out of the room just before a vote that needs that category present, the Board may still validly complete the vote.',
    answer: false,
    plainExplanation:
      'The required voting category has to be present through the vote itself, not just at the start of the meeting. Losing that category partway through invalidates the vote until it is restored.',
    controllingSourceRef: 'GV-GB-002',
  },
  {
    id: 'CFR-T1',
    conceptId: 'conflict_recusal',
    statement:
      'If the same Board member’s conflict is over a policy position they personally favor, rather than a financial contract, the same disclosure-and-recusal expectation still applies.',
    answer: true,
    plainExplanation:
      'Conflicts of commitment or position are still conflicts. The disclose-and-recuse expectation is not limited to financial interests.',
    controllingSourceRef: 'GV-GB-003',
  },
  {
    id: 'AVS-T1',
    conceptId: 'aggregate_vs_subgroup',
    statement:
      'If every individual subgroup meets target but the aggregate number looks weak because of a reporting error, the Board should trust the subgroup detail and investigate the aggregate calculation rather than assume performance actually declined.',
    answer: true,
    plainExplanation:
      'The direction of the risk flips here, but the principle is the same: subgroup detail is the reliable check, and an unexplained mismatch should be investigated rather than accepted at face value in either direction.',
    controllingSourceRef: 'QA-GB-010',
  },
  {
    id: 'PCS-T1',
    conceptId: 'pip_closure_vs_sustainability',
    statement:
      'If a metric dips slightly below target for one month after a PIP is closed, but the overall trend is still stable, the Board should immediately reopen a full new PIP rather than simply continuing to monitor.',
    answer: false,
    plainExplanation:
      'A single dip within an otherwise stable trend is a monitoring signal, not automatic proof the gain was lost. The correct response is continued monitoring and judgment, not reflexively restarting a full PIP.',
    controllingSourceRef: 'QA-GB-010',
  },
  {
    id: 'NVA-T1',
    conceptId: 'notification_vs_approval',
    statement:
      'If the same after-the-fact notification concerns a routine matter that never required Board approval in the first place, documenting it as an informational note in the minutes is appropriate.',
    answer: true,
    plainExplanation:
      'The problem was never notification itself — it was treating notification as a substitute for a required approval. For matters that never needed Board approval, an informational note is exactly right.',
    controllingSourceRef: 'GV-GB-001',
  },
  {
    id: 'BKD-T1',
    conceptId: 'backdating',
    statement:
      'If the gap instead involves a minor clerical typo in an already-approved document, correcting the typo and initialing the correction with today’s date is acceptable and is not the same as backdating an approval.',
    answer: true,
    plainExplanation:
      'Correcting an obvious clerical error, dated today, is routine document hygiene. Backdating specifically means making it look like a decision or approval happened earlier than it actually did — a different, and prohibited, act.',
    controllingSourceRef: 'GV-GB-002',
  },
  {
    id: 'BDM-T1',
    conceptId: 'board_direction_vs_management_action',
    statement:
      'If the Board’s directive is broad, such as "improve patient satisfaction," rather than specific, management still has discretion to choose the operational methods without bringing each method back for Board approval.',
    answer: true,
    plainExplanation:
      'A broad directive is exactly where management discretion over methods belongs. The line that matters is whether management is implementing the Board’s direction or substituting a conflicting priority — not how specific the directive was worded.',
    controllingSourceRef: 'GV-GB-001',
  },
  {
    id: 'BVC-T1',
    conceptId: 'baa_vendor_control',
    statement:
      'If that same vendor’s contract changes so it now receives identifiable patient information instead of only aggregate data, a new or updated BAA is required before that data can flow.',
    answer: true,
    plainExplanation:
      'The BAA requirement follows the data. As soon as a vendor moves from de-identified, aggregate data to identifiable protected health information, the BAA obligation attaches.',
    controllingSourceRef: 'CO-HP-005',
  },
];

export function getGuidedItemsByConcept(conceptId: RemediationConceptId): GuidedTrueFalseItem[] {
  return GUIDED_ITEMS.filter((item) => item.conceptId === conceptId);
}

export function getTransferPrompt(id: string): TransferPrompt | undefined {
  return TRANSFER_PROMPTS.find((prompt) => prompt.id === id);
}
