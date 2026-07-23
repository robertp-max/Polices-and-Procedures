// Source-linked, reviewed course assessment banks. These are authored,
// scenario-based questions that test synthesis across a course's policies —
// NOT runtime sentence extraction. They live OUTSIDE generated policy bodies.
//
// Every question is traceable to the controlled policy version assigned to the
// learner via sourceIds/sourceSectionIds. Courses without an authored bank yet
// resolve to an honest "assessment bank pending" state in the player (never a
// fabricated quiz).

export interface ComplianceQuestion {
  id: string;
  courseId: string;
  sourceIds: string[];
  sourceSectionIds: string[];
  competency: string;
  difficulty: 'advanced' | 'expert' | 'forensic';
  critical: boolean;
  prompt: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  remediation: string;
  alternateForm: string;
}

// Exemplar bank — GB-01 Governing Body Authority & Responsibilities.
const GB_01: ComplianceQuestion[] = [
  {
    id: 'GB-01-Q1',
    courseId: 'GB-01',
    sourceIds: ['GV-GB-001'],
    sourceSectionIds: ['authority.retained', 'delegation.limits'],
    competency: 'Retained authority vs delegated operations',
    difficulty: 'expert',
    critical: true,
    prompt:
      'The Board delegates day-to-day operations to the Administrator. During a quarter with no meeting, the Administrator approves a new high-risk service line and signs a management contract. Which statement reflects the Board’s retained accountability?',
    options: [
      'Delegation transferred the decision, so the Board has no further accountability for the new service line.',
      'The Board retains ultimate accountability; approving a new service line and a management contract are non-delegable Board matters that must return for ratification and record.',
      'Because operations are delegated, ratification is optional so long as outcomes are acceptable.',
      'The Administrator’s signature alone satisfies governance because the Board delegated authority.',
    ],
    correctIndex: 1,
    rationale:
      'Delegation of operations never transfers ultimate Governing Body accountability. Service-scope changes and management contracts are Board-reserved and must be brought back for approval and entered in the record.',
    remediation: 'Re-read GV-GB-001: retained vs delegated authority; matters reserved to the Governing Body.',
    alternateForm: 'A',
  },
  {
    id: 'GB-01-Q2',
    courseId: 'GB-01',
    sourceIds: ['GV-GB-001'],
    sourceSectionIds: ['accountability.nondelegable'],
    competency: 'Notification vs approval',
    difficulty: 'advanced',
    critical: false,
    prompt:
      'Management informs the Board, after the fact, that it changed the after-hours triage vendor. No vote was taken. What is the correct governance characterization?',
    options: [
      'Notification of a completed change is equivalent to Board approval.',
      'Notification is not approval; if the change required Board authorization, the record must show the item returning for a decision, not merely an informational note.',
      'Any operational vendor change is purely management’s and never needs Board authorization.',
      'The Board should retroactively backdate an approval to the change date to keep the record clean.',
    ],
    correctIndex: 1,
    rationale:
      'Being told is not the same as approving. If authorization was required, the record must reflect an actual decision — and the record must never be backdated.',
    remediation: 'Re-read GV-GB-001 on approval authority and the prohibition on record backdating.',
    alternateForm: 'A',
  },
  {
    id: 'GB-01-Q3',
    courseId: 'GB-01',
    sourceIds: ['GV-GB-001'],
    sourceSectionIds: ['evidence.record'],
    competency: 'Evidence absence vs evidence of absence',
    difficulty: 'expert',
    critical: true,
    prompt:
      'A surveyor cannot find minutes showing the Board reviewed the annual QAPI evaluation. Leadership says "we definitely discussed it." Which response is defensible?',
    options: [
      'Assert that the discussion happened; the absence of minutes proves nothing.',
      'Treat the missing record as proof the duty was met because staff recall it.',
      'Acknowledge that without a contemporaneous record the oversight cannot be evidenced, and correct the process going forward — without fabricating or backdating a record.',
      'Create minutes now dated to the original meeting to close the gap.',
    ],
    correctIndex: 2,
    rationale:
      'Missing evidence is not proof of compliance, and it is not proof of non-performance either — but the Board can only defend what the contemporaneous record shows. Reconstructing/backdating a record is prohibited.',
    remediation: 'Re-read GV-GB-001: the governing record and prohibition on backdating/replacement.',
    alternateForm: 'A',
  },
];

// Exemplar bank — GB-10 QAPI Governance & Performance Improvement.
const GB_10: ComplianceQuestion[] = [
  {
    id: 'GB-10-Q1',
    courseId: 'GB-10',
    sourceIds: ['QA-GB-010', 'QA-WF-04'],
    sourceSectionIds: ['pip.closure', 'sustainability.criteria'],
    competency: 'PIP closure vs sustainability',
    difficulty: 'expert',
    critical: true,
    prompt:
      'Aggregate hospitalization improved to 15.1%, but a named heart-failure subgroup rose to 27.8% against an approved 20% threshold. The approved PIP requires two consecutive quarters below threshold in every named stratum. Management proposes closing the PIP. The Board should:',
    options: [
      'Approve closure — the aggregate improved and that is the primary measure.',
      'Approve closure but note the subgroup for "future monitoring".',
      'Reject closure; the approved sustainability criterion is unmet in a named high-risk stratum, and favorable aggregate data cannot erase a worsening subgroup.',
      'Defer to management since QAPI is an operational function.',
    ],
    correctIndex: 2,
    rationale:
      'Closing a PIP when the approved sustainability criterion is unmet is a critical governance failure. Aggregate improvement never overrides a deteriorating named subgroup against the approved rule.',
    remediation: 'Re-read QA-GB-010 and QA-WF-04: PIP closure criteria and stratified sustainability.',
    alternateForm: 'A',
  },
  {
    id: 'GB-10-Q2',
    courseId: 'GB-10',
    sourceIds: ['QA-GB-010'],
    sourceSectionIds: ['board.direction', 'management.action'],
    competency: 'Board direction vs management action',
    difficulty: 'advanced',
    critical: false,
    prompt:
      'The Board wants the heart-failure escalation problem fixed. Which is the correct exercise of Board authority?',
    options: [
      'Direct that a specific nurse be disciplined for the missed escalation.',
      'Direct that the after-hours escalation workflow be analyzed and corrected with an owner, deadline, and effectiveness measure — leaving individual personnel action to management.',
      'Personally redesign the clinical protocol in the meeting.',
      'Take no action and revisit next year.',
    ],
    correctIndex: 1,
    rationale:
      'The Board directs systems, owners, deadlines, and effectiveness tests. Directing an individual clinical or disciplinary outcome is outside Board authority.',
    remediation: 'Re-read QA-GB-010: Board direction vs management execution.',
    alternateForm: 'A',
  },
];

export const COURSE_ASSESSMENT_BANK: Record<string, ComplianceQuestion[]> = {
  'GB-01': GB_01,
  'GB-10': GB_10,
};

export function getCourseQuestions(courseId: string): ComplianceQuestion[] {
  return COURSE_ASSESSMENT_BANK[courseId] ?? [];
}

export function hasAuthoredBank(courseId: string): boolean {
  return (COURSE_ASSESSMENT_BANK[courseId]?.length ?? 0) > 0;
}
