// Final Governing Body Tabletop — "Integrated Governance Under Pressure".
//
// Assessment-grade, source-grounded, adversarial case. This exemplar carries
// the full required ARCHITECTURE (exhibits incl. decoys, contradictions, timed
// rounds, required decisions, surveyor interview, changed-facts transfer, a
// 100-point rubric, and automatic critical-failure gates). Exhibit/decision
// volume is authored to be defensible and is structured to scale to the full
// 25–35 exhibit / 8–12 contradiction target without engine changes.
//
// Synthetic data only. No answer text is exposed to the player before scoring.

export type RubricDimension =
  | 'evidence_sufficiency'
  | 'authority_quorum_conflict'
  | 'patient_safety_qapi'
  | 'decision_proportionality'
  | 'record_quality'
  | 'surveyor_transfer';

export const RUBRIC: Record<RubricDimension, { label: string; points: number }> = {
  evidence_sufficiency: { label: 'Evidence sufficiency & exclusion of decoys', points: 20 },
  authority_quorum_conflict: { label: 'Authority, quorum & conflict analysis', points: 15 },
  patient_safety_qapi: { label: 'Patient-safety & QAPI judgment', points: 15 },
  decision_proportionality: { label: 'Decision proportionality', points: 20 },
  record_quality: { label: 'Official record quality', points: 15 },
  surveyor_transfer: { label: 'Surveyor defense & transfer', points: 15 },
};

export interface TabletopExhibit {
  id: string;
  code: string;
  title: string;
  summary: string;
  /** Relevant-looking but immaterial — selecting it as decisive is an error. */
  decoy: boolean;
  /** Must be opened before decisions can be locked. */
  critical: boolean;
  source: string;
}

export interface TabletopOption {
  id: string;
  text: string;
  /** Rubric points earned for this choice (0..dimension max). */
  points: number;
  /** Choosing this triggers an AUTOMATIC critical failure regardless of score. */
  criticalFailure?: boolean;
}

export interface TabletopDecision {
  id: string;
  round: 1 | 2 | 3;
  dimension: RubricDimension;
  prompt: string;
  options: TabletopOption[];
}

export interface SurveyorQuestion {
  id: string;
  prompt: string;
  options: TabletopOption[];
}

export interface TabletopCase {
  id: string;
  title: string;
  minutes: number;
  context: string;
  exhibits: TabletopExhibit[];
  contradictions: string[];
  decisions: TabletopDecision[];
  surveyor: SurveyorQuestion[];
  transfer: {
    changedFacts: string;
    prompt: string;
    options: TabletopOption[];
  };
  automaticCriticalFailures: string[];
  passScore: number;
}

const d = (id: string, round: 1 | 2 | 3, dimension: RubricDimension, prompt: string, options: TabletopOption[]): TabletopDecision => ({ id, round, dimension, prompt, options });

export const FINAL_TABLETOP: TabletopCase = {
  id: 'GB-FINAL-TABLETOP',
  title: 'Integrated Governance Under Pressure',
  minutes: 100,
  passScore: 95,
  context:
    'You chair a quarterly Governing Body meeting. Aggregate quality improved, but the packet is imperfect: a subgroup is deteriorating, a vendor relationship intersects a director’s interest, an escalation record is unsigned, and a budget proposal removes PIP resources. Reconcile the exhibits, separate decoys from decisive evidence, and produce defensible, proportionate decisions and an official record.',
  exhibits: [
    { id: 'E1', code: 'GV-FM-005', title: 'Draft Q2 minutes', summary: 'Prior-meeting minutes; roster lists 6 directors, one marked "leave of absence".', decoy: false, critical: true, source: 'GV-FM-005' },
    { id: 'E2', code: 'GV-FM-006', title: 'Conflict disclosure log', summary: 'Director T. discloses a family interest in the after-hours triage vendor under review.', decoy: false, critical: true, source: 'GV-FM-006' },
    { id: 'E3', code: 'EN-FM-034', title: 'Aggregate KPI dashboard', summary: 'All-agency hospitalization improved to 15.1% from 18.4%.', decoy: false, critical: true, source: 'EN-FM-034' },
    { id: 'E4', code: 'QA-APX', title: 'Stratified outcome appendix', summary: 'Heart-failure subgroup rose to 27.8% vs approved 20% threshold.', decoy: false, critical: true, source: 'QA-FM-001' },
    { id: 'E5', code: 'QA-PIP', title: 'Approved PIP charter', summary: 'Closure requires two consecutive quarters below threshold in EVERY named stratum.', decoy: false, critical: true, source: 'QA-WF-04' },
    { id: 'E6', code: 'RM-INC', title: 'After-hours incident record', summary: 'Delayed HF escalation; the RCA initiation exists but the report is marked "final" while unsigned and post-dated.', decoy: false, critical: true, source: 'QA-WF-05' },
    { id: 'E7', code: 'FN-FM-001', title: 'Proposed operating budget', summary: 'Removes the analyst/coaching hours that sustain the PIP.', decoy: false, critical: true, source: 'FN-FM-001' },
    { id: 'E8', code: 'CO-BAA', title: 'Vendor BAA exhibit', summary: 'Missing audit-access and exit-rights clauses.', decoy: false, critical: true, source: 'HIPAA 164.308(b)' },
    { id: 'E9', code: 'MKT-01', title: 'Marketing testimonial deck', summary: 'Patient testimonials praising the agency.', decoy: true, critical: false, source: 'n/a' },
    { id: 'E10', code: 'HR-07', title: 'Unrelated PTO accrual report', summary: 'Staff paid-time-off balances for the quarter.', decoy: true, critical: false, source: 'n/a' },
    { id: 'E11', code: 'IT-22', title: 'Server uptime summary', summary: '99.98% uptime; no governance bearing on the matters at hand.', decoy: true, critical: false, source: 'n/a' },
    { id: 'E12', code: 'GV-FM-012', title: 'Executive-session notice', summary: 'Template for privileged discussion of the patient-safety escalation.', decoy: false, critical: false, source: 'GV-WF-14' },
  ],
  contradictions: [
    'Aggregate KPI (E3) improves while the named subgroup (E4) worsens.',
    'The escalation report (E6) is "final" but unsigned and post-dated.',
    'A vendor under review (E8) intersects a disclosed director conflict (E2).',
    'The budget (E7) removes the very resources the approved PIP (E5) depends on.',
    'The roster (E1) shows a member on leave, affecting quorum/voting eligibility.',
  ],
  decisions: [
    d('D1', 1, 'authority_quorum_conflict',
      'Director T. has a disclosed interest in the triage vendor now before the Board (E2, E8). How do you seat the vendor vote?',
      [
        { id: 'D1a', text: 'Allow Director T. to deliberate and vote; the disclosure is on file.', points: 0, criticalFailure: true },
        { id: 'D1b', text: 'Require recusal from deliberation and vote on the vendor matter; record the recusal and recompute quorum/voting eligibility.', points: 15 },
        { id: 'D1c', text: 'Ask Director T. to abstain only from the final vote but participate in discussion.', points: 5 },
      ]),
    d('D2', 1, 'evidence_sufficiency',
      'Which exhibits are decisive to the QAPI closure question?',
      [
        { id: 'D2a', text: 'The aggregate dashboard and the marketing testimonials (E3, E9).', points: 0 },
        { id: 'D2b', text: 'The stratified appendix, the approved PIP charter, and the incident record (E4, E5, E6).', points: 20 },
        { id: 'D2c', text: 'Server uptime and PTO accrual as operational context (E10, E11).', points: 0 },
      ]),
    d('D3', 2, 'patient_safety_qapi',
      'Management proposes closing the hospitalization PIP citing the improved aggregate (E3). You decide:',
      [
        { id: 'D3a', text: 'Approve closure; the aggregate met the target.', points: 0, criticalFailure: true },
        { id: 'D3b', text: 'Reject closure; the approved sustainability criterion (E5) is unmet in a named worsening stratum (E4).', points: 15 },
        { id: 'D3c', text: 'Close but add informal monitoring.', points: 0, criticalFailure: true },
      ]),
    d('D4', 2, 'decision_proportionality',
      'The after-hours escalation (E6) recurs. What does the Board direct?',
      [
        { id: 'D4a', text: 'Direct termination of the specific on-call nurse.', points: 0, criticalFailure: true },
        { id: 'D4b', text: 'Direct a workflow root-cause analysis with named owner, deadline, and effectiveness measure; refer personnel handling to management.', points: 20 },
        { id: 'D4c', text: 'Note it for next quarter without action.', points: 4 },
      ]),
    d('D5', 2, 'decision_proportionality',
      'The proposed budget (E7) removes PIP-sustaining resources. You:',
      [
        { id: 'D5a', text: 'Approve the budget as presented; finance is management’s remit.', points: 0, criticalFailure: true },
        { id: 'D5b', text: 'Condition approval on preserving the analyst/coaching resources until the sustainability criterion is met.', points: 15 },
        { id: 'D5c', text: 'Defer the entire budget indefinitely.', points: 5 },
      ]),
    d('D6', 3, 'record_quality',
      'The escalation report (E6) is marked final but unsigned and post-dated. How is it handled in the record?',
      [
        { id: 'D6a', text: 'Accept it as final proof of resolution.', points: 0, criticalFailure: true },
        { id: 'D6b', text: 'Backdate a corrected signed version to the incident date to fix the gap.', points: 0, criticalFailure: true },
        { id: 'D6c', text: 'Record it as a draft/unreconciled artifact, preserve the original, and require a properly signed report; do not treat it as final.', points: 15 },
      ]),
  ],
  surveyor: [
    {
      id: 'S1',
      prompt: 'Surveyor: "What did the Board KNOW at the time it declined to close the PIP?"',
      options: [
        { id: 'S1a', text: 'That the aggregate improved and the subgroup worsened against the approved threshold — the sustainability criterion was unmet.', points: 8 },
        { id: 'S1b', text: 'That outcomes were generally fine.', points: 0 },
        { id: 'S1c', text: 'That management recommended closure.', points: 2 },
      ],
    },
    {
      id: 'S2',
      prompt: 'Surveyor: "Show me the difference between what the Board DIRECTED and what management must EXECUTE."',
      options: [
        { id: 'S2a', text: 'The Board directed a system RCA with owner/deadline/effectiveness; management executes the personnel and clinical specifics.', points: 7 },
        { id: 'S2b', text: 'The Board directed the specific disciplinary outcome.', points: 0, criticalFailure: true },
      ],
    },
  ],
  transfer: {
    changedFacts: 'Now assume the subgroup FELL to 19.5% for ONE quarter (first quarter below threshold), and the vendor conflict was fully resolved and re-approved with complete BAA terms.',
    prompt: 'Applying the same governing rule, what is the correct closure posture for the PIP?',
    options: [
      { id: 'T1', text: 'Close now — the subgroup is below threshold.', points: 0 },
      { id: 'T2', text: 'Do not close — the approved rule requires TWO consecutive quarters below threshold; one quarter is insufficient. Continue and return.', points: 15 },
      { id: 'T3', text: 'Close because the vendor issue resolved.', points: 0 },
    ],
  },
  automaticCriticalFailures: [
    'Treating a missing/unsigned/post-dated record as final proof',
    'Backdating, overwriting, or replacing the historical record',
    'Counting an ineligible or conflicted member’s vote when outcome depends on it',
    'Ignoring a material conflict or recusal effect',
    'Closing a PIP when the approved sustainability criterion is unmet',
    'Letting favorable aggregate data erase a high-risk subgroup',
    'Directing an individual clinical or disciplinary outcome outside Board authority',
    'Approving a PHI-handling vendor without required control/BAA evidence',
  ],
};
