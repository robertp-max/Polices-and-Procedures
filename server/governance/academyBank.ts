export const ACADEMY_CONTENT_VERSION = 'gb-academy-2026.07.corrective.1';
export const ACADEMY_PASS_PERCENT = 92;
export const ACADEMY_MAX_ATTEMPTS = 3;
export const ACADEMY_COOLDOWN_HOURS = 24;

export const ACADEMY_SCENES = [
  'orientation',
  'control-model',
  'failure-patterns',
  'worked-example',
  'field-guide',
] as const;

export type AcademySceneId = (typeof ACADEMY_SCENES)[number];

interface ModuleBlueprint {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  domain: string;
  durationMinutes: number;
  policyVersionIds: string[];
  duty: string;
  failureTrap: string;
  sourceRequirement: string;
  actionRule: string;
  transferRule: string;
}

interface AcademyQuestion {
  id: string;
  stageId: AcademySceneId;
  prompt: string;
  answers: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  criticalAnswerIds: string[];
  rationale: string;
}

export interface AcademyModuleDefinition extends ModuleBlueprint {
  contentVersion: string;
  requiredStageIds: AcademySceneId[];
  minimumActiveSeconds: number;
  questions: AcademyQuestion[];
  executableTaskIds: string[];
}

export interface PublicAcademyModule {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  domain: string;
  durationMinutes: number;
  contentVersion: string;
  policyVersionIds: string[];
  requiredStageIds: AcademySceneId[];
  minimumActiveSeconds: number;
  sceneBriefs: Array<{ id: AcademySceneId; title: string; body: string }>;
  questions: Array<{
    id: string;
    stageId: AcademySceneId;
    prompt: string;
    answers: Array<{ id: string; text: string }>;
  }>;
  executableTaskIds: string[];
}

const BLUEPRINTS: ModuleBlueprint[] = [
  {
    id: 'GB-001', sequence: 1, title: 'Authority, Accountability & Delegation', shortTitle: 'Authority',
    domain: 'Foundational authority', durationMinutes: 45, policyVersionIds: ['GV-GB-001'],
    duty: 'The Governing Body retains accountability even when execution is delegated.',
    failureTrap: 'A polished management agreement is treated as a transfer of statutory accountability.',
    sourceRequirement: 'Approved bylaws, appointment records, delegation instrument, performance evidence, and correction rights must reconcile.',
    actionRule: 'Define reserved powers, measurable oversight, escalation triggers, and corrective authority before approving delegation.',
    transferRule: 'Expertise, price, indemnity, and custom do not answer who retains legal authority.',
  },
  {
    id: 'GB-002', sequence: 2, title: 'Structure, Bylaws, Membership & Orientation', shortTitle: 'Structure',
    domain: 'Board constitution', durationMinutes: 50, policyVersionIds: ['GV-GB-001'],
    duty: 'Every person exercising Board authority must be validly seated, within term, oriented, and consistently recorded.',
    failureTrap: 'A roster and distinguished biography are accepted as proof of appointment and voting eligibility.',
    sourceRequirement: 'Bylaws, authorized seats, appointment instruments, terms, orientation evidence, minutes, and regulatory filings must agree.',
    actionRule: 'Quarantine unsupported participation and reconcile each affected action under the facts and rules that existed at the time.',
    transferRule: 'Later appointment or orientation does not rewrite earlier authority facts.',
  },
  {
    id: 'GB-003', sequence: 3, title: 'Meetings, Minutes, Voting & Records', shortTitle: 'Meetings',
    domain: 'Corporate action', durationMinutes: 55, policyVersionIds: ['GV-GB-003', 'GV-GB-001'],
    duty: 'A valid Board action requires authority, notice, agenda, attendance, conflicts, quorum, motion, eligibility, vote, and an accurate final record.',
    failureTrap: 'A calendar invitation and unsigned narrative minutes are treated as proof that a decision validly occurred.',
    sourceRequirement: 'Approved bylaws, notice artifact, agenda version, attendance events, conflict restrictions, eligibility snapshot, votes, and signed minutes are required.',
    actionRule: 'Calculate opening and item-level quorum from the approved authority profile and preserve the event chain through eCIgn close.',
    transferRule: 'The same vote count can produce a different result when eligibility, recusal, or the applicable threshold changes.',
  },
  {
    id: 'GB-004', sequence: 4, title: 'Appoint, Oversee, Replace', shortTitle: 'Leadership',
    domain: 'Executive continuity', durationMinutes: 48, policyVersionIds: ['GV-GB-004', 'GV-OG-002'],
    duty: 'Leadership appointment, qualifications, delegated authority, oversight, and continuity must each be evidenced.',
    failureTrap: 'An obsolete succession plan is relied on because the named alternate is familiar to the organization.',
    sourceRequirement: 'Appointment resolution, current qualifications, succession verification, organization chart, scope, and reporting duties must reconcile.',
    actionRule: 'Use valid emergency authority to appoint a qualified interim leader, bound the role, and preserve separate clinical oversight.',
    transferRule: 'A qualified candidate cannot act without authority, and an authorized candidate cannot act without required qualifications.',
  },
  {
    id: 'GB-005', sequence: 5, title: 'QAPI Oversight & Effectiveness', shortTitle: 'QAPI',
    domain: 'Quality governance', durationMinutes: 55, policyVersionIds: ['QA-PP-001', 'GV-GB-005'],
    duty: 'The Board must oversee evidence-based QAPI selection, action, return, effectiveness, and sustained improvement.',
    failureTrap: 'A trigger or completed management task is described as a Board-approved PIP or effective corrective action.',
    sourceRequirement: 'Validated denominators, source lineage, findings, trigger determinations, authorized decisions, actions, return evidence, and effectiveness review are required.',
    actionRule: 'Keep trigger, authorized review, PIP/CAP/RCA, task completion, management certification, and Board effectiveness disposition distinct.',
    transferRule: 'A favorable metric after action is not effectiveness proof unless the measurement window and causal evidence are adequate.',
  },
  {
    id: 'GB-006', sequence: 6, title: 'Compliance & Regulatory Duties', shortTitle: 'Compliance',
    domain: 'Regulatory oversight', durationMinutes: 48, policyVersionIds: ['CO-PP-001', 'GV-GB-006'],
    duty: 'The Board must establish and monitor a compliance system that identifies, escalates, investigates, corrects, and documents risk.',
    failureTrap: 'A policy library and annual presentation are treated as proof that compliance controls operate.',
    sourceRequirement: 'Controlled policies, hotline/intake data, investigation authority, corrective records, exclusion checks, training, and effectiveness evidence are required.',
    actionRule: 'Assign accountable owners, protect independence, track material matters, and require verified closure evidence.',
    transferRule: 'Legal review can inform the Board but cannot silently replace its oversight record.',
  },
  {
    id: 'GB-007', sequence: 7, title: 'Fiscal Stewardship & Financial Oversight', shortTitle: 'Finance',
    domain: 'Fiduciary oversight', durationMinutes: 45, policyVersionIds: ['FN-PP-001', 'GV-GB-007'],
    duty: 'The Board must understand liquidity, solvency, reimbursement, fraud risk, reserves, and material commitments.',
    failureTrap: 'A favorable revenue headline obscures cash, denial, concentration, or related-party risk.',
    sourceRequirement: 'Approved budget, variance analysis, cash forecast, aging, denial trends, material contracts, and conflict disclosures are required.',
    actionRule: 'Interrogate assumptions, require reconciled source periods, and bind material variances to owners and return dates.',
    transferRule: 'A metric is not decision-ready when its period, denominator, source, or accounting treatment is unresolved.',
  },
  {
    id: 'GB-008', sequence: 8, title: 'Strategy, Capacity & Acceptance to Service', shortTitle: 'Strategy',
    domain: 'Strategic direction', durationMinutes: 44, policyVersionIds: ['GV-GB-008', 'CL-PP-003'],
    duty: 'Strategy must reconcile mission, licensed scope, clinical capacity, access, quality, workforce, and financial durability.',
    failureTrap: 'Growth is approved from demand forecasts without proving safe operational capacity.',
    sourceRequirement: 'Market assumptions, referral conversion, staffing capacity, acceptance criteria, quality trends, and financial scenarios are required.',
    actionRule: 'Set explicit guardrails and stop conditions before authorizing growth, service expansion, or material contraction.',
    transferRule: 'Demand does not create capacity, and strategic urgency does not suspend acceptance-to-service obligations.',
  },
  {
    id: 'GB-009', sequence: 9, title: 'Enterprise Risk & Resilience', shortTitle: 'Risk',
    domain: 'Enterprise assurance', durationMinutes: 48, policyVersionIds: ['RM-PP-001', 'GV-GB-009'],
    duty: 'The Board must understand material risk, risk appetite, ownership, control performance, and resilience.',
    failureTrap: 'A colorful risk register is accepted without tested controls, dependencies, or recovery evidence.',
    sourceRequirement: 'Risk taxonomy, appetite thresholds, incidents, control tests, insurance, business continuity, cyber, privacy, and recovery exercises are required.',
    actionRule: 'Escalate threshold breaches, require control owners and dates, and test whether mitigation changes residual risk.',
    transferRule: 'Insurance transfers financing exposure, not governance responsibility or operational resilience.',
  },
  {
    id: 'GB-010', sequence: 10, title: 'Contracts & Delegated Services', shortTitle: 'Contracts',
    domain: 'Third-party governance', durationMinutes: 46, policyVersionIds: ['GV-GB-010', 'CO-PP-006'],
    duty: 'Material contracts must preserve Care Indeed authority, standards, monitoring, data rights, correction, and exit capability.',
    failureTrap: 'Vendor reputation, indemnity, and termination language substitute for operational oversight.',
    sourceRequirement: 'Due diligence, conflicts, scope, service levels, data protections, compliance duties, monitoring, escalation, and exit evidence are required.',
    actionRule: 'Tie delegated duties to measurable controls, source access, incident notice, remediation, and termination rights.',
    transferRule: 'Contractual delegation does not eliminate nondelegable duties or the need to monitor performance.',
  },
  {
    id: 'GB-011', sequence: 11, title: 'Survey Readiness & Defensible Evidence', shortTitle: 'Survey',
    domain: 'External assurance', durationMinutes: 52, policyVersionIds: ['GV-GB-011', 'CO-PP-009'],
    duty: 'The Board record must prove what was required, decided, executed, verified, corrected, and sustained.',
    failureTrap: 'A polished binder is accepted even though source lineage, signatures, or implementation evidence is missing.',
    sourceRequirement: 'Controlled policies, approved minutes, signed artifacts, evidence manifests, source hashes, actions, effectiveness returns, and retention controls are required.',
    actionRule: 'Test every claim against the authoritative source and disclose unresolved gaps rather than filling them with narrative.',
    transferRule: 'Presentation quality cannot cure missing authority, source evidence, or execution history.',
  },
  {
    id: 'GB-012', sequence: 12, title: 'Ethics, Conflicts & Duty of Care', shortTitle: 'Ethics',
    domain: 'Director conduct', durationMinutes: 45, policyVersionIds: ['GV-GB-012', 'CO-PP-004'],
    duty: 'Directors must act with care, loyalty, informed judgment, confidentiality, and managed conflicts.',
    failureTrap: 'Disclosure alone is treated as curing a conflict or related-party transaction.',
    sourceRequirement: 'Conflict disclosure, independence analysis, comparability evidence, recusal, eligibility snapshot, deliberation, vote, and minutes are required.',
    actionRule: 'Apply the controlled conflict restriction before access, discussion, quorum, voting, and record distribution.',
    transferRule: 'Transparency is necessary but does not itself establish fairness, independence, or valid approval.',
  },
  {
    id: 'GB-CAPSTONE', sequence: 13, title: 'Governing Under Pressure', shortTitle: 'Capstone',
    domain: 'Integrated judgment', durationMinutes: 65, policyVersionIds: ['GV-GB-001', 'QA-PP-001', 'CO-PP-001', 'RM-PP-001'],
    duty: 'The Board must preserve authority, evidence, disciplined judgment, and an accurate record when facts are incomplete and time is short.',
    failureTrap: 'Urgency collapses source review, conflicts, quorum, decision rights, action ownership, and follow-through into one undocumented conversation.',
    sourceRequirement: 'Current authority, classified evidence, live source posture, decision alternatives, conflicts, eligibility, record controls, action owners, and return evidence are required.',
    actionRule: 'Separate immediate containment from final disposition, document uncertainty, and schedule evidence-based return decisions.',
    transferRule: 'Emergency authority changes timing and process only to the extent the controlling rules permit; it does not erase the record.',
  },
];

const SCENE_TITLES: Record<AcademySceneId, string> = {
  orientation: 'The governing duty',
  'control-model': 'Control model',
  'failure-patterns': 'Failure patterns',
  'worked-example': 'Worked Board decision',
  'field-guide': 'Transfer and field guide',
};

function buildQuestions(module: ModuleBlueprint): AcademyQuestion[] {
  return [
    {
      id: `${module.id}-orientation-q1`, stageId: 'orientation',
      prompt: `Which statement best captures the controlling duty in ${module.shortTitle}?`,
      answers: [
        { id: 'duty', text: module.duty },
        { id: 'trap', text: module.failureTrap },
        { id: 'assurance', text: 'Rely on executive assurance when the matter is operationally complex.' },
      ],
      correctAnswerId: 'duty', criticalAnswerIds: ['trap'], rationale: module.duty,
    },
    {
      id: `${module.id}-control-q1`, stageId: 'control-model',
      prompt: 'What source set is required before the Board can call the matter decision-ready?',
      answers: [
        { id: 'source', text: module.sourceRequirement },
        { id: 'slides', text: 'The final management slide deck and verbal certification.' },
        { id: 'minutes', text: 'Prior minutes confirming that the Board discussed the subject.' },
      ],
      correctAnswerId: 'source', criticalAnswerIds: [], rationale: module.sourceRequirement,
    },
    {
      id: `${module.id}-failure-q1`, stageId: 'failure-patterns',
      prompt: 'Which pattern creates the most material governance defect?',
      answers: [
        { id: 'trap', text: module.failureTrap },
        { id: 'format', text: 'The Board packet uses a different visual template than the prior quarter.' },
        { id: 'length', text: 'The executive summary exceeds one page.' },
      ],
      correctAnswerId: 'trap', criticalAnswerIds: ['format'], rationale: module.failureTrap,
    },
    {
      id: `${module.id}-worked-q1`, stageId: 'worked-example',
      prompt: 'What is the most defensible Board control?',
      answers: [
        { id: 'control', text: module.actionRule },
        { id: 'delegate', text: 'Delegate the matter to management and record only the final outcome.' },
        { id: 'defer', text: 'Defer the record until every uncertainty has disappeared.' },
      ],
      correctAnswerId: 'control', criticalAnswerIds: ['delegate'], rationale: module.actionRule,
    },
    {
      id: `${module.id}-transfer-q1`, stageId: 'field-guide',
      prompt: 'Which transfer rule remains true when the facts change?',
      answers: [
        { id: 'transfer', text: module.transferRule },
        { id: 'custom', text: 'Industry custom is sufficient when formal authority evidence is delayed.' },
        { id: 'outcome', text: 'A favorable outcome cures a process defect when no harm occurred.' },
      ],
      correctAnswerId: 'transfer', criticalAnswerIds: ['outcome'], rationale: module.transferRule,
    },
  ];
}

export const ACADEMY_MODULES: AcademyModuleDefinition[] = BLUEPRINTS.map((module) => ({
  ...module,
  contentVersion: ACADEMY_CONTENT_VERSION,
  requiredStageIds: [...ACADEMY_SCENES],
  minimumActiveSeconds: module.durationMinutes * 60,
  questions: buildQuestions(module),
  executableTaskIds: module.id === 'GB-003'
    ? ['publish_notice', 'publish_agenda', 'record_attendance', 'disclose_conflict', 'evaluate_quorum', 'move', 'second', 'vote', 'minutes_close']
    : [`${module.id.toLowerCase()}-board-record`],
}));

export function academyModule(moduleId: string): AcademyModuleDefinition | null {
  return ACADEMY_MODULES.find((module) => module.id === moduleId) ?? null;
}

export function publicAcademyModule(moduleId: string): PublicAcademyModule | null {
  const module = academyModule(moduleId);
  if (!module) return null;
  return {
    id: module.id,
    sequence: module.sequence,
    title: module.title,
    shortTitle: module.shortTitle,
    domain: module.domain,
    durationMinutes: module.durationMinutes,
    contentVersion: module.contentVersion,
    policyVersionIds: [...module.policyVersionIds],
    requiredStageIds: [...module.requiredStageIds],
    minimumActiveSeconds: module.minimumActiveSeconds,
    sceneBriefs: [
      { id: 'orientation', title: SCENE_TITLES.orientation, body: module.duty },
      { id: 'control-model', title: SCENE_TITLES['control-model'], body: module.sourceRequirement },
      { id: 'failure-patterns', title: SCENE_TITLES['failure-patterns'], body: module.failureTrap },
      { id: 'worked-example', title: SCENE_TITLES['worked-example'], body: module.actionRule },
      { id: 'field-guide', title: SCENE_TITLES['field-guide'], body: module.transferRule },
    ],
    questions: module.questions.map((question) => ({
      id: question.id,
      stageId: question.stageId,
      prompt: question.prompt,
      answers: question.answers.map((answer) => ({ ...answer })),
    })),
    executableTaskIds: [...module.executableTaskIds],
  };
}
export function scoreAcademyAnswers(
  moduleId: string,
  answers: Array<{ questionId: string; answerId: string }>,
): { score: number; criticalError: boolean; answered: number; required: number } {
  const module = academyModule(moduleId);
  if (!module) throw new Error('Academy module not found.');
  const latest = new Map(answers.map((answer) => [answer.questionId, answer.answerId]));
  let correct = 0;
  let criticalError = false;
  for (const question of module.questions) {
    const answer = latest.get(question.id);
    if (answer === question.correctAnswerId) correct += 1;
    if (answer && question.criticalAnswerIds.includes(answer)) criticalError = true;
  }
  return {
    score: Math.round((correct / module.questions.length) * 100),
    criticalError,
    answered: module.questions.filter((question) => latest.has(question.id)).length,
    required: module.questions.length,
  };
}
