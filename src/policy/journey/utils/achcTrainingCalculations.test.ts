/// <reference types="node" />

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ACHC_ART } from '@/policy/journey/data/modules';
import type { JourneyEmployee, JourneyEvidence, JourneyModule, ModuleAttempt } from '@/policy/journey/types/journey';
import {
  ACHC_BUNDLE_ID,
  ACHC_REQUIRED_MODULE_IDS,
  CARE_INDEED_PASSING_STANDARD_PERCENT,
  calculateAchcBundleSummary,
  calculateAchcEmployeeStatus,
  calculateAchcModuleStatus,
  createAchcCompletionEvidence,
  getAchcTest,
  gradeAchcQuiz,
} from './achcTrainingCalculations';

const employee: JourneyEmployee = {
  id: 'EMP-TST-001',
  name: 'Test Nurse, RN',
  role: 'RN',
  email: 'test@example.invalid',
  hireDate: '2026-01-01T00:00:00.000Z',
  startDate: '2026-01-01',
  supervisorId: 'SUP-1',
  appendixFCleared: true,
  clearedForIndependentWork: true,
};

const modules = ACHC_ART.filter(module => ACHC_REQUIRED_MODULE_IDS.includes(module.id as typeof ACHC_REQUIRED_MODULE_IDS[number]));
const m01 = modules[0];

function attempt(module: JourneyModule, score: number, attemptNumber = 1, completedAt = '2026-02-01T00:00:00.000Z'): ModuleAttempt {
  return {
    id: `ATT-${module.id}-${attemptNumber}`,
    employeeId: employee.id,
    moduleId: module.id,
    attemptNumber,
    startedAt: completedAt,
    completedAt,
    lessonStatus: score >= CARE_INDEED_PASSING_STANDARD_PERCENT ? 'passed' : 'failed',
    scoreRaw: score,
    scoreMin: 0,
    scoreMax: 100,
    timeSpentSec: 600,
    suspendData: '',
    lessonLocation: '',
    exit: 'normal',
    status: score >= CARE_INDEED_PASSING_STANDARD_PERCENT ? 'completed' : 'failed',
  };
}

function evidenceFor(module: JourneyModule, moduleAttempt: ModuleAttempt, completedAt = moduleAttempt.completedAt ?? '2026-02-01T00:00:00.000Z'): JourneyEvidence {
  const evidence = createAchcCompletionEvidence(employee, module, moduleAttempt, completedAt);
  return {
    ...evidence,
    id: `EV-${module.id}-${moduleAttempt.attemptNumber}`,
    createdAt: completedAt,
    updatedAt: completedAt,
  };
}

describe('ACHC annual field worker training calculations', () => {
  it('grades submitted quiz answers against correct answers and 80% standard', () => {
    const test = getAchcTest(m01.id);
    assert.ok(test);
    const answers = Object.fromEntries(test.questions.map((question, index) => [question.question_id, index < 8 ? question.correct_answer : -1]));
    const grade = gradeAchcQuiz(test, answers, 1, '2026-02-01T00:00:00.000Z');

    assert.equal(grade.total_gradable_questions, 10);
    assert.equal(grade.correct_answers, 8);
    assert.equal(grade.incorrect_answers, 2);
    assert.equal(grade.score_percent, 80);
    assert.equal(grade.passed, true);
  });

  it('reports assigned M01-M12 with no activity as 0% and not_started', () => {
    const status = calculateAchcEmployeeStatus({ employee, attempts: [], evidence: [] });

    assert.equal(status.assigned_modules_count, 12);
    assert.equal(status.started_modules_count, 0);
    assert.equal(status.overall_percent_complete, 0);
    assert.equal(status.bundle_status, 'not_started');
  });

  it('keeps lessons-viewed-only activity in progress and not complete', () => {
    const partialEvidence = evidenceFor(m01, attempt(m01, 0));
    partialEvidence.data.certificate_id = '';
    partialEvidence.data.post_test_artifact_id = '';
    const status = calculateAchcModuleStatus({
      employee,
      module: m01,
      attempts: [{ ...attempt(m01, 0), status: 'in-progress', lessonStatus: 'incomplete', scoreRaw: null, completedAt: null }],
      evidence: [partialEvidence],
    });

    assert.equal(status.lesson_progress_percent, 100);
    assert.equal(status.pass_fail_status, 'in_progress');
    assert.equal(status.compliant, false);
  });

  it('does not complete a module when score is below threshold', () => {
    const failed = attempt(m01, 70);
    const status = calculateAchcModuleStatus({ employee, module: m01, attempts: [failed], evidence: [evidenceFor(m01, failed)] });

    assert.equal(status.pass_fail_status, 'failed');
    assert.equal(status.compliant, false);
    assert.equal(status.completed_at, null);
  });

  it('preserves failed attempts and allows a later passing attempt to satisfy the module', () => {
    const failed = attempt(m01, 70, 1);
    const passed = attempt(m01, 90, 2);
    const status = calculateAchcModuleStatus({ employee, module: m01, attempts: [failed, passed], evidence: [evidenceFor(m01, passed)] });

    assert.equal(status.attempt_count, 2);
    assert.equal(status.latest_attempt_score, 90);
    assert.equal(status.best_attempt_score, 90);
    assert.equal(status.pass_fail_status, 'passed');
    assert.equal(status.compliant, true);
  });

  it('does not mark the bundle compliant when certificate evidence is missing', () => {
    const attempts = modules.map(module => attempt(module, 100));
    const evidence = modules.map((module, index) => evidenceFor(module, attempts[index]));
    evidence[0].data.certificate_id = '';
    const status = calculateAchcEmployeeStatus({ employee, attempts, evidence });
    const bundle = calculateAchcBundleSummary(status);

    assert.equal(bundle.bundle_passed, false);
    assert.equal(bundle.personnel_file_evidence_status, 'missing_certificate');
  });

  it('does not mark the bundle compliant when post-test artifact is missing', () => {
    const attempts = modules.map(module => attempt(module, 100));
    const evidence = modules.map((module, index) => evidenceFor(module, attempts[index]));
    evidence[0].data.post_test_artifact_id = '';
    const status = calculateAchcEmployeeStatus({ employee, attempts, evidence });
    const bundle = calculateAchcBundleSummary(status);

    assert.equal(bundle.bundle_passed, false);
    assert.equal(bundle.personnel_file_evidence_status, 'missing_post_test');
  });

  it('marks the bundle compliant only when all M01-M12 pass with certificate and post-test evidence', () => {
    const attempts = modules.map(module => attempt(module, 100));
    const evidence = modules.map((module, index) => evidenceFor(module, attempts[index]));
    const status = calculateAchcEmployeeStatus({ employee, attempts, evidence });
    const bundle = calculateAchcBundleSummary(status);

    assert.equal(status.completed_modules_count, 12);
    assert.equal(status.passed_modules_count, 12);
    assert.equal(bundle.bundle_id, ACHC_BUNDLE_ID);
    assert.equal(bundle.bundle_passed, true);
  });

  it('calculates annual due date from completed_at and flags overdue records', () => {
    const oldCompletedAt = '2024-01-01T00:00:00.000Z';
    const oldAttempt = attempt(m01, 100, 1, oldCompletedAt);
    const status = calculateAchcModuleStatus({
      employee,
      module: m01,
      attempts: [oldAttempt],
      evidence: [evidenceFor(m01, oldAttempt, oldCompletedAt)],
      now: new Date('2026-01-10T00:00:00.000Z'),
    });

    assert.equal(status.next_due_at, '2024-12-31T00:00:00.000Z');
    assert.equal(status.overdue, true);
  });

  it('dashboard-style totals match raw employee/module records exactly', () => {
    const attempts = modules.map((module, index) => attempt(module, index < 6 ? 100 : 0));
    const evidence = modules.slice(0, 6).map((module, index) => evidenceFor(module, attempts[index]));
    const status = calculateAchcEmployeeStatus({ employee, attempts, evidence });

    assert.equal(status.assigned_modules_count, modules.length);
    assert.equal(status.started_modules_count, attempts.length);
    assert.equal(status.completed_modules_count, evidence.length);
    assert.equal(status.overall_percent_complete, 50);
  });
});
