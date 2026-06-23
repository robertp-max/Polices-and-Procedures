import { ACHC_ART } from '@/policy/journey/data/modules';
import { achcAnnualTests } from '@/policy/journey/data/achcAnnualTests.data';
import { achcLessons_M01_M04 } from '@/policy/journey/data/achcLessons_M01_M04.data';
import { achcLessons_M05_M08 } from '@/policy/journey/data/achcLessons_M05_M08.data';
import { achcLessons_M09_M12 } from '@/policy/journey/data/achcLessons_M09_M12.data';
import type { JourneyEmployee, JourneyEvidence, JourneyModule, JourneyRole, ModuleAttempt } from '@/policy/journey/types/journey';
import type { Lesson, TopicTest } from '@/policy/journey/data/achcContentTypes';

export const ACHC_BUNDLE_ID = 'ACHC_ANNUAL_FIELD_WORKER_TRAINING';
export const ACHC_BUNDLE_NAME = 'ACHC Annual Field Worker Training';
export const ACHC_MINIMUM_PASSING_PERCENT = 75;
export const CARE_INDEED_PASSING_STANDARD_PERCENT = 80;
export const ACHC_RETRAINING_INTERVAL_DAYS = 365;

export const ACHC_FIELD_WORKER_ROLES: readonly JourneyRole[] = ['RN', 'LVN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW'];

export const ACHC_REQUIRED_MODULE_IDS = [
  'ACHC-ART-M01',
  'ACHC-ART-M02',
  'ACHC-ART-M03',
  'ACHC-ART-M04',
  'ACHC-ART-M05',
  'ACHC-ART-M06',
  'ACHC-ART-M07',
  'ACHC-ART-M08',
  'ACHC-ART-M09',
  'ACHC-ART-M10',
  'ACHC-ART-M11',
  'ACHC-ART-M12',
] as const;

export type AchcModuleId = typeof ACHC_REQUIRED_MODULE_IDS[number];
export type AchcBundleStatus = 'not_started' | 'in_progress' | 'passed' | 'failed' | 'overdue';
export type AchcPassFailStatus = 'not_submitted' | 'in_progress' | 'passed' | 'failed';
export type AchcAnnualDueStatus = 'not_due' | 'due' | 'overdue';
export type AchcPersonnelEvidenceStatus = 'complete' | 'missing_certificate' | 'missing_post_test' | 'missing_personnel_file' | 'missing_evidence';

export interface AchcQuizGrade {
  total_gradable_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  score_percent: number;
  passed: boolean;
  submitted_at: string;
  graded_at: string;
  attempt_number: number;
}

export interface AchcModuleCalculation {
  employee_id: string;
  role: JourneyRole;
  module_id: AchcModuleId;
  module_version: string;
  bundle_id: typeof ACHC_BUNDLE_ID;
  content_hash: string;
  lesson_progress_percent: number;
  quiz_score_percent: number | null;
  passing_threshold: number;
  pass_fail_status: AchcPassFailStatus;
  attempt_count: number;
  latest_attempt_score: number | null;
  best_attempt_score: number | null;
  completed_at: string | null;
  certificate_generated: boolean;
  evidence_attached: boolean;
  post_test_artifact_id: string | null;
  certificate_id: string | null;
  evidence_id: string | null;
  personnel_file_reference: string | null;
  next_due_at: string | null;
  overdue: boolean;
  compliant: boolean;
}

export interface AchcEmployeeCalculation {
  employee_id: string;
  role: JourneyRole;
  assigned_modules_count: number;
  started_modules_count: number;
  completed_modules_count: number;
  passed_modules_count: number;
  failed_modules_count: number;
  overdue_modules_count: number;
  overall_percent_complete: number;
  bundle_status: AchcBundleStatus;
  next_due_at: string | null;
  last_completed_at: string | null;
  modules: AchcModuleCalculation[];
}

export interface AchcBundleSummary {
  bundle_id: typeof ACHC_BUNDLE_ID;
  bundle_name: typeof ACHC_BUNDLE_NAME;
  required_modules: AchcModuleId[];
  completed_required_modules: number;
  passed_required_modules: number;
  bundle_score_summary: {
    average_score_percent: number | null;
    best_score_percent: number | null;
    lowest_score_percent: number | null;
  };
  bundle_passed: boolean;
  annual_due_status: AchcAnnualDueStatus;
  personnel_file_evidence_status: AchcPersonnelEvidenceStatus;
}

export interface AchcValidationReport {
  bundle_id: typeof ACHC_BUNDLE_ID;
  bundle_name: typeof ACHC_BUNDLE_NAME;
  required_topic_mapping: { module_id: AchcModuleId; short_id: string; topic: string; packet_topic: string }[];
  duplicate_modules: string[];
  missing_modules: string[];
  direct_care_roles: JourneyRole[];
  pass_threshold: {
    achc_minimum: number;
    care_indeed_standard: number;
    compliant: boolean;
    note: string;
  };
  assignment: {
    assigned_on_hire: boolean;
    assigned_annually: boolean;
    applies_to_all_direct_care_roles: boolean;
  };
  annual_retraining_generated: boolean;
  certificate_post_test_personnel_file_evidence_created: boolean;
  persistence_note: string;
  before_after_examples: { scenario: string; before: string; after: string }[];
  theme_validation_note: string[];
}

const PACKET_TOPICS = [
  'Cultural Awareness',
  'Emergency/Disaster',
  'Complaints/Grievances',
  'HIPAA',
  'Infection Control',
  'Communication Barriers',
  'Workplace/Patient Safety (OSHA)',
  'Patient Rights/Responsibilities',
  'Corporate Compliance',
  'Ethics',
  'TB / Bloodborne Pathogens',
  'Medical Device Act',
] as const;

const ACHC_LESSONS = [
  ...achcLessons_M01_M04,
  ...achcLessons_M05_M08,
  ...achcLessons_M09_M12,
];

const REQUIRED_MODULE_ID_SET = new Set<string>(ACHC_REQUIRED_MODULE_IDS);

export function isAchcModuleId(moduleId: string): moduleId is AchcModuleId {
  return REQUIRED_MODULE_ID_SET.has(moduleId);
}

export function isDirectCareRole(role: JourneyRole): boolean {
  return ACHC_FIELD_WORKER_ROLES.includes(role);
}

export function achcShortId(moduleId: string): string {
  return moduleId.replace('ACHC-ART-', '');
}

export function getAchcLessons(moduleId: string): Lesson[] {
  return ACHC_LESSONS.filter(lesson => lesson.topic_id === moduleId).sort((a, b) => a.order - b.order);
}

export function getAchcRequiredScreenIds(moduleId: string): string[] {
  return getAchcLessons(moduleId)
    .flatMap(lesson => lesson.cards)
    .filter(card => card.completion_required)
    .map(card => card.card_id);
}

export function getAchcTest(moduleId: string): TopicTest | undefined {
  return achcAnnualTests.find(test => test.topic_id === moduleId);
}

export function gradeAchcQuiz(
  test: TopicTest,
  answersByQuestionId: Record<string, number>,
  attemptNumber: number,
  submittedAt: string,
  passingThreshold = CARE_INDEED_PASSING_STANDARD_PERCENT,
): AchcQuizGrade {
  const total = test.questions.length;
  const correct = test.questions.filter(question => answersByQuestionId[question.question_id] === question.correct_answer).length;
  const score = total ? (correct / total) * 100 : 0;
  return {
    total_gradable_questions: total,
    correct_answers: correct,
    incorrect_answers: total - correct,
    score_percent: roundPercent(score),
    passed: score >= passingThreshold,
    submitted_at: submittedAt,
    graded_at: submittedAt,
    attempt_number: attemptNumber,
  };
}

export function getAchcContentHash(moduleId: string): string {
  const module = ACHC_ART.find(item => item.id === moduleId);
  const lessons = getAchcLessons(moduleId);
  const test = getAchcTest(moduleId);
  return stableHash(JSON.stringify({ module, lessons, test }));
}

export function createAchcCompletionEvidence(
  employee: JourneyEmployee,
  module: JourneyModule,
  attempt: ModuleAttempt,
  completedAt: string,
): Omit<JourneyEvidence, 'id' | 'createdAt' | 'updatedAt'> {
  const requiredScreenIds = getAchcRequiredScreenIds(module.id);
  const contentHash = getAchcContentHash(module.id);
  const certificateId = `CERT-${ACHC_BUNDLE_ID}-${employee.id}-${achcShortId(module.id)}-${attempt.attemptNumber}`;
  const postTestArtifactId = `POSTTEST-${ACHC_BUNDLE_ID}-${employee.id}-${achcShortId(module.id)}-${attempt.attemptNumber}`;
  const evidenceId = `EVID-${ACHC_BUNDLE_ID}-${employee.id}-${achcShortId(module.id)}-${attempt.attemptNumber}`;
  const nextDueAt = addDays(completedAt, ACHC_RETRAINING_INTERVAL_DAYS);

  return {
    employeeId: employee.id,
    moduleId: module.id,
    appendix: 'HRTD001_B',
    data: {
      employee_id: employee.id,
      role: employee.role,
      module_id: module.id,
      module_version: moduleVersion(module),
      bundle_id: ACHC_BUNDLE_ID,
      content_hash: contentHash,
      assigned_at: employee.hireDate,
      completed_at: completedAt,
      score: attempt.scoreRaw ?? 0,
      passing_threshold: CARE_INDEED_PASSING_STANDARD_PERCENT,
      attempt_count: attempt.attemptNumber,
      certificate_id: certificateId,
      post_test_artifact_id: postTestArtifactId,
      evidence_id: evidenceId,
      personnel_file_reference: `personnel://${employee.id}/training/${ACHC_BUNDLE_ID}/${module.id}`,
      next_due_at: nextDueAt,
      lesson_screen_ids: requiredScreenIds,
      required_lesson_screen_ids: requiredScreenIds,
      achc_minimum_passing_score: ACHC_MINIMUM_PASSING_PERCENT,
      care_indeed_passing_standard: CARE_INDEED_PASSING_STANDARD_PERCENT,
      standard_note: 'Care Indeed standard, stricter than ACHC packet minimum.',
      production_compliance_status: 'UAT-only until backend personnel/evidence persistence is implemented.',
    },
    signatures: [],
    attachments: [
      { name: `${certificateId}.pdf`, mime: 'application/pdf', dataUrl: `generated:${certificateId}` },
      { name: `${postTestArtifactId}.json`, mime: 'application/json', dataUrl: `generated:${postTestArtifactId}` },
    ],
  };
}

export function calculateAchcModuleStatus(params: {
  employee: JourneyEmployee;
  module: JourneyModule;
  attempts: ModuleAttempt[];
  evidence: JourneyEvidence[];
  now?: Date;
}): AchcModuleCalculation {
  const { employee, module, now = new Date() } = params;
  if (!isAchcModuleId(module.id)) {
    throw new Error(`Not an ACHC field-worker module: ${module.id}`);
  }

  const moduleAttempts = params.attempts
    .filter(attempt => attempt.employeeId === employee.id && attempt.moduleId === module.id)
    .sort((a, b) => a.attemptNumber - b.attemptNumber);
  const latest = moduleAttempts.at(-1);
  const scores = moduleAttempts.map(attempt => normalizedScore(attempt)).filter((score): score is number => score !== null);
  const best = scores.length ? Math.max(...scores) : null;
  const threshold = (module.passThreshold ?? 0.8) * 100;
  const passed = best !== null && best >= threshold;
  const moduleEvidence = findLatestAchcEvidence(params.evidence, employee.id, module.id);
  const requiredScreens = getAchcRequiredScreenIds(module.id);
  const viewedScreens = getEvidenceStringArray(moduleEvidence, 'lesson_screen_ids');
  const viewedRequired = requiredScreens.filter(id => viewedScreens.includes(id)).length;
  const lessonProgress = requiredScreens.length ? (viewedRequired / requiredScreens.length) * 100 : 100;
  const certificateId = getEvidenceString(moduleEvidence, 'certificate_id');
  const postTestArtifactId = getEvidenceString(moduleEvidence, 'post_test_artifact_id');
  const personnelFileReference = getEvidenceString(moduleEvidence, 'personnel_file_reference');
  const evidenceId = getEvidenceString(moduleEvidence, 'evidence_id') ?? moduleEvidence?.id ?? null;
  const completedAt = getEvidenceString(moduleEvidence, 'completed_at');
  const nextDueAt = getEvidenceString(moduleEvidence, 'next_due_at') ?? (completedAt ? addDays(completedAt, ACHC_RETRAINING_INTERVAL_DAYS) : null);
  const evidenceAttached = Boolean(moduleEvidence && certificateId && postTestArtifactId && personnelFileReference && evidenceId);
  const compliant = lessonProgress === 100 && passed && Boolean(certificateId) && Boolean(postTestArtifactId) && evidenceAttached;
  const latestScore = latest ? normalizedScore(latest) : null;
  const overdue = Boolean(nextDueAt && new Date(nextDueAt) < now);

  return {
    employee_id: employee.id,
    role: employee.role,
    module_id: module.id,
    module_version: moduleVersion(module),
    bundle_id: ACHC_BUNDLE_ID,
    content_hash: getAchcContentHash(module.id),
    lesson_progress_percent: roundPercent(lessonProgress),
    quiz_score_percent: latestScore,
    passing_threshold: threshold,
    pass_fail_status: passed ? 'passed' : moduleAttempts.some(attempt => attempt.status === 'failed') ? 'failed' : moduleAttempts.length ? 'in_progress' : 'not_submitted',
    attempt_count: moduleAttempts.length,
    latest_attempt_score: latestScore,
    best_attempt_score: best,
    completed_at: compliant ? completedAt : null,
    certificate_generated: Boolean(certificateId),
    evidence_attached: evidenceAttached,
    post_test_artifact_id: postTestArtifactId,
    certificate_id: certificateId,
    evidence_id: evidenceId,
    personnel_file_reference: personnelFileReference,
    next_due_at: nextDueAt,
    overdue,
    compliant,
  };
}

export function calculateAchcEmployeeStatus(params: {
  employee: JourneyEmployee;
  attempts: ModuleAttempt[];
  evidence: JourneyEvidence[];
  now?: Date;
}): AchcEmployeeCalculation {
  const now = params.now ?? new Date();
  const assignedModules = isDirectCareRole(params.employee.role) ? ACHC_ART.filter(module => isAchcModuleId(module.id)) : [];
  const modules = assignedModules.map(module => calculateAchcModuleStatus({ ...params, module, now }));
  const assigned = modules.length;
  const started = modules.filter(module => module.attempt_count > 0 || module.lesson_progress_percent > 0).length;
  const completed = modules.filter(module => module.compliant).length;
  const passed = modules.filter(module => module.pass_fail_status === 'passed').length;
  const failed = modules.filter(module => module.pass_fail_status === 'failed').length;
  const overdue = modules.filter(module => module.overdue).length;
  const lastCompleted = latestIso(modules.map(module => module.completed_at).filter(Boolean) as string[]);
  const nextDue = earliestIso(modules.map(module => module.next_due_at).filter(Boolean) as string[]);
  const bundleStatus: AchcBundleStatus =
    overdue > 0 ? 'overdue'
    : assigned > 0 && completed === assigned ? 'passed'
    : failed > 0 ? 'failed'
    : started > 0 ? 'in_progress'
    : 'not_started';

  return {
    employee_id: params.employee.id,
    role: params.employee.role,
    assigned_modules_count: assigned,
    started_modules_count: started,
    completed_modules_count: completed,
    passed_modules_count: passed,
    failed_modules_count: failed,
    overdue_modules_count: overdue,
    overall_percent_complete: assigned ? roundPercent((completed / assigned) * 100) : 0,
    bundle_status: bundleStatus,
    next_due_at: nextDue,
    last_completed_at: lastCompleted,
    modules,
  };
}

export function calculateAchcBundleSummary(status: AchcEmployeeCalculation, now = new Date()): AchcBundleSummary {
  const scores = status.modules.map(module => module.best_attempt_score).filter((score): score is number => score !== null);
  const missingCertificate = status.modules.some(module => module.pass_fail_status === 'passed' && !module.certificate_generated);
  const missingPostTest = status.modules.some(module => module.pass_fail_status === 'passed' && !module.post_test_artifact_id);
  const missingPersonnel = status.modules.some(module => module.pass_fail_status === 'passed' && !module.personnel_file_reference);
  const missingEvidence = status.modules.some(module => module.pass_fail_status === 'passed' && !module.evidence_attached);
  const evidenceStatus: AchcPersonnelEvidenceStatus =
    missingCertificate ? 'missing_certificate'
    : missingPostTest ? 'missing_post_test'
    : missingPersonnel ? 'missing_personnel_file'
    : missingEvidence ? 'missing_evidence'
    : 'complete';
  const dueDates = status.modules.map(module => module.next_due_at).filter(Boolean) as string[];
  const annualDueStatus: AchcAnnualDueStatus =
    dueDates.some(due => new Date(due) < now) ? 'overdue'
    : dueDates.some(due => daysUntil(due, now) <= 30) ? 'due'
    : 'not_due';

  return {
    bundle_id: ACHC_BUNDLE_ID,
    bundle_name: ACHC_BUNDLE_NAME,
    required_modules: [...ACHC_REQUIRED_MODULE_IDS],
    completed_required_modules: status.completed_modules_count,
    passed_required_modules: status.passed_modules_count,
    bundle_score_summary: {
      average_score_percent: scores.length ? roundPercent(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      best_score_percent: scores.length ? Math.max(...scores) : null,
      lowest_score_percent: scores.length ? Math.min(...scores) : null,
    },
    bundle_passed: status.completed_modules_count === ACHC_REQUIRED_MODULE_IDS.length && evidenceStatus === 'complete',
    annual_due_status: annualDueStatus,
    personnel_file_evidence_status: evidenceStatus,
  };
}

export function buildAchcValidationReport(sample?: AchcEmployeeCalculation): AchcValidationReport {
  const counts = new Map<string, number>();
  ACHC_ART.forEach(module => counts.set(module.id, (counts.get(module.id) ?? 0) + 1));
  const duplicateModules = Array.from(counts.entries()).filter(([, count]) => count > 1).map(([moduleId]) => moduleId);
  const missingModules = ACHC_REQUIRED_MODULE_IDS.filter(moduleId => !counts.has(moduleId));
  const allDirectCareCovered = ACHC_FIELD_WORKER_ROLES.every(role =>
    ACHC_REQUIRED_MODULE_IDS.every(moduleId => {
      const module = ACHC_ART.find(item => item.id === moduleId);
      return module?.roles === 'ALL' || module?.roles.includes(role);
    }),
  );

  return {
    bundle_id: ACHC_BUNDLE_ID,
    bundle_name: ACHC_BUNDLE_NAME,
    required_topic_mapping: ACHC_REQUIRED_MODULE_IDS.map((moduleId, index) => ({
      module_id: moduleId,
      short_id: achcShortId(moduleId),
      topic: ACHC_ART.find(module => module.id === moduleId)?.title ?? moduleId,
      packet_topic: PACKET_TOPICS[index],
    })),
    duplicate_modules: duplicateModules,
    missing_modules: missingModules,
    direct_care_roles: [...ACHC_FIELD_WORKER_ROLES],
    pass_threshold: {
      achc_minimum: ACHC_MINIMUM_PASSING_PERCENT,
      care_indeed_standard: CARE_INDEED_PASSING_STANDARD_PERCENT,
      compliant: CARE_INDEED_PASSING_STANDARD_PERCENT >= ACHC_MINIMUM_PASSING_PERCENT,
      note: 'Care Indeed standard, stricter than ACHC packet minimum.',
    },
    assignment: {
      assigned_on_hire: true,
      assigned_annually: true,
      applies_to_all_direct_care_roles: allDirectCareCovered,
    },
    annual_retraining_generated: Boolean(sample?.next_due_at),
    certificate_post_test_personnel_file_evidence_created: sample ? sample.modules.every(module => !module.compliant || module.evidence_attached) : true,
    persistence_note: 'Journey training state currently uses the localStorage-backed journey store; ACHC completion is marked UAT-only until backend personnel/evidence persistence is implemented and production compliance certification must remain blocked.',
    before_after_examples: [
      {
        scenario: 'Employee assigned M01-M12 with no activity',
        before: 'Dashboard could infer annual completion from loose attempt/display status.',
        after: '0% complete, bundle_status not_started, no module complete without records.',
      },
      {
        scenario: 'Employee passes a quiz but certificate or post-test evidence is missing',
        before: 'A passing score could show the module as complete.',
        after: 'Module may show passed, but not compliant/complete until certificate, post-test artifact, personnel-file reference, and next due date exist.',
      },
      {
        scenario: 'All twelve modules passed with complete evidence',
        before: 'Summary calculations were split across journey and onboarding-v2 views.',
        after: `Bundle ${ACHC_BUNDLE_ID} is compliant only when all 12 module gates and evidence gates are satisfied.`,
      },
    ],
    theme_validation_note: [
      'Journey ACHC module cards and quiz summaries use existing Care Indeed theme tokens and status colors in dark and light modes.',
      'Onboarding v2 ACHC summary tiles use the existing StatusPill/KpiTile token path and do not add a second theme toggle.',
      'Passed, failed, overdue, in-progress, not-started, certificate-missing, and evidence-missing states remain text-labeled as well as color-coded.',
    ],
  };
}

function normalizedScore(attempt: ModuleAttempt): number | null {
  if (attempt.scoreRaw === null) return null;
  const max = attempt.scoreMax || 100;
  const min = attempt.scoreMin || 0;
  if (max === min) return attempt.scoreRaw;
  return roundPercent(((attempt.scoreRaw - min) / (max - min)) * 100);
}

function findLatestAchcEvidence(evidence: JourneyEvidence[], employeeId: string, moduleId: string): JourneyEvidence | undefined {
  return evidence
    .filter(row => row.employeeId === employeeId && row.moduleId === moduleId && getEvidenceString(row, 'bundle_id') === ACHC_BUNDLE_ID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

function getEvidenceString(evidence: JourneyEvidence | undefined, key: string): string | null {
  const value = evidence?.data[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function getEvidenceStringArray(evidence: JourneyEvidence | undefined, key: string): string[] {
  const value = evidence?.data[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function moduleVersion(module: JourneyModule): string {
  return `${module.id}:v1`;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function daysUntil(iso: string, now: Date): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000);
}

function earliestIso(values: string[]): string | null {
  return values.length ? values.sort((a, b) => a.localeCompare(b))[0] : null;
}

function latestIso(values: string[]): string | null {
  return values.length ? values.sort((a, b) => b.localeCompare(a))[0] : null;
}

function stableHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `sha256-demo-${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}
