import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { deriveGbCatalog, DEFAULT_LEARNER_ID, MODULE_MASTERY_STANDARD } from './complianceCatalog';
import {
  setComplianceEvidenceService,
  type ComplianceEvidenceService,
} from './complianceEvidenceAdapter';
import { refreshOfficialEvidence, writeDraft, clearDraft } from './complianceStore';
import {
  courseProgress,
  isOfficiallyComplete,
  nextRequirement,
  resolveAssignmentView,
  resolveViews,
  summarize,
} from './complianceSelectors';
import type { ComplianceEvidenceRecord } from './complianceTypes';
import { scoreTabletop } from '../tabletop/tabletopScoring';
import { FINAL_TABLETOP } from '../tabletop/tabletopCase';

const here = path.dirname(fileURLToPath(import.meta.url));

function record(partial: Partial<ComplianceEvidenceRecord> & { assignmentId: string }): ComplianceEvidenceRecord {
  return {
    evidenceId: `ev-${partial.assignmentId}`,
    learnerId: DEFAULT_LEARNER_ID,
    role: 'GB',
    sourceId: 'x',
    sourceType: 'module',
    sourceVersion: 'v6.0',
    effectiveDate: null,
    readCompletedAt: '2026-01-01T00:00:00.000Z',
    attestedAt: '2026-01-01T00:00:00.000Z',
    answersSnapshot: {},
    score: 100,
    criticalErrors: [],
    attemptNumber: 1,
    remediationPath: 'none',
    activeTimeSeconds: 999,
    completedAt: '2026-01-01T00:00:00.000Z',
    integrityHash: 'abc',
    ...partial,
  };
}

function service(records: ComplianceEvidenceRecord[], connected = true): ComplianceEvidenceService {
  return {
    connected,
    disconnectedNotice: 'Preview only — evidence service not connected.',
    async save() { return { ok: false, reason: 'not_connected', message: 'x' }; },
    async list() { return records; },
  };
}

const catalog = deriveGbCatalog({ learnerId: DEFAULT_LEARNER_ID, now: '2026-01-01T00:00:00.000Z' });

beforeEach(async () => {
  // Reset to the honest DISCONNECTED default before each test.
  setComplianceEvidenceService(service([], false));
  await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
});

describe('assignment catalog (Parts 3–4)', () => {
  it('derives training, policy, course-assessment and tabletop assignments', () => {
    const byType = (t: string) => catalog.assignments.filter((a) => a.type === t).length;
    expect(byType('training_module')).toBe(13);
    expect(byType('policy_reading')).toBe(42);
    expect(byType('course_assessment')).toBe(13);
    expect(byType('tabletop')).toBe(5);
    expect(catalog.courseGroups).toHaveLength(13);
  });
});

describe('gate #13 — official completion impossible when evidence adapter is disconnected', () => {
  it('marks nothing complete and overall incomplete', () => {
    const views = resolveViews(catalog.assignments);
    expect(views.some((v) => v.officiallyComplete)).toBe(false);
    expect(summarize(views).overall).toBe('incomplete');
  });
});

describe('gate #5 / #14 — a submitted local draft never counts as completion', () => {
  it('shows validation pending, not completed, for a locally submitted attempt with no official record', () => {
    const module = catalog.assignments.find((a) => a.type === 'training_module')!;
    writeDraft({ assignmentId: module.assignmentId, resume: {}, attemptNumber: 1, progressPercent: 100, submittedLocally: true, updatedAt: 'x' });
    const view = resolveAssignmentView(module);
    expect(view.officiallyComplete).toBe(false);
    expect(view.userFacingStatus).toBe('additional_validation_pending');
    clearDraft(module.assignmentId);
  });
});

describe('gate #5 / #7 — module completion requires pass + zero critical + attestation', () => {
  const module = catalog.assignments.find((a) => a.type === 'training_module')!;

  it('a passing, attested, zero-critical official record completes', async () => {
    setComplianceEvidenceService(service([record({ assignmentId: module.assignmentId, score: 95 })]));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    expect(isOfficiallyComplete(module)).toBe(true);
  });
  it('a critical error blocks completion regardless of score', async () => {
    setComplianceEvidenceService(service([record({ assignmentId: module.assignmentId, score: 100, criticalErrors: ['x'] })]));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    expect(isOfficiallyComplete(module)).toBe(false);
  });
  it('a below-threshold score blocks completion', async () => {
    setComplianceEvidenceService(service([record({ assignmentId: module.assignmentId, score: MODULE_MASTERY_STANDARD - 1 })]));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    expect(isOfficiallyComplete(module)).toBe(false);
  });
  it('an unattested record blocks completion', async () => {
    setComplianceEvidenceService(service([record({ assignmentId: module.assignmentId, attestedAt: null })]));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    expect(isOfficiallyComplete(module)).toBe(false);
  });
});

describe('gate #6 / #8 — course assessment unlocks only after all policies complete', () => {
  it('locks the assessment until every policy in the course is officially complete', async () => {
    const group = catalog.courseGroups.find((g) => g.policyAssignmentIds.length >= 2)!;
    // Complete only the first policy.
    setComplianceEvidenceService(service([record({ assignmentId: group.policyAssignmentIds[0], sourceType: 'policy' })]));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    let views = resolveViews(catalog.assignments);
    let byId = new Map(views.map((v) => [v.assignment.assignmentId, v]));
    expect(courseProgress(group, byId).assessmentUnlocked).toBe(false);

    // Complete all policies.
    setComplianceEvidenceService(service(group.policyAssignmentIds.map((id) => record({ assignmentId: id, sourceType: 'policy' }))));
    await refreshOfficialEvidence(DEFAULT_LEARNER_ID);
    views = resolveViews(catalog.assignments);
    byId = new Map(views.map((v) => [v.assignment.assignmentId, v]));
    expect(courseProgress(group, byId).assessmentUnlocked).toBe(true);
  });
});

describe('next requirement ordering (Part 2)', () => {
  it('returns an actionable requirement, skipping blocked items', () => {
    const views = resolveViews(catalog.assignments);
    const next = nextRequirement(views);
    expect(next).not.toBeNull();
    expect(next!.userFacingStatus).not.toBe('blocked');
    expect(next!.userFacingStatus).not.toBe('completed');
  });
});

// ---- Tabletop scoring gates ----------------------------------------------

function allExhibits() { return FINAL_TABLETOP.exhibits.map((e) => e.id); }
function bestSelections() {
  const decisions: Record<string, string> = {};
  for (const d of FINAL_TABLETOP.decisions) decisions[d.id] = d.options.reduce((a, b) => (b.points > a.points ? b : a)).id;
  const surveyor: Record<string, string> = {};
  for (const q of FINAL_TABLETOP.surveyor) surveyor[q.id] = q.options.reduce((a, b) => (b.points > a.points ? b : a)).id;
  const transferOptionId = FINAL_TABLETOP.transfer.options.reduce((a, b) => (b.points > a.points ? b : a)).id;
  return { decisions, surveyor, transferOptionId, inspectedExhibitIds: allExhibits(), attested: true };
}

describe('gate #11 — tabletop critical-error gate overrides numeric score', () => {
  it('fails a high-scoring attempt that chose an automatic-critical-failure option', () => {
    const sel = bestSelections();
    const critical = FINAL_TABLETOP.decisions.find((d) => d.options.some((o) => o.criticalFailure))!;
    sel.decisions[critical.id] = critical.options.find((o) => o.criticalFailure)!.id;
    const s = scoreTabletop(sel);
    expect(s.criticalFailure).toBe(true);
    expect(s.passed).toBe(false);
  });
});

describe('gate #12 — tabletop requires all critical exhibits and all decisions', () => {
  it('does not pass with unopened critical exhibits', () => {
    const sel = { ...bestSelections(), inspectedExhibitIds: [] };
    const s = scoreTabletop(sel);
    expect(s.allCriticalExhibitsInspected).toBe(false);
    expect(s.passed).toBe(false);
  });
  it('does not pass with a missing decision', () => {
    const sel = bestSelections();
    delete sel.decisions[FINAL_TABLETOP.decisions[0].id];
    const s = scoreTabletop(sel);
    expect(s.allDecisionsMade).toBe(false);
    expect(s.passed).toBe(false);
  });
});

describe('tabletop transfer gate + full pass path', () => {
  it('fails when the transfer answer is wrong', () => {
    const sel = bestSelections();
    sel.transferOptionId = FINAL_TABLETOP.transfer.options.find((o) => o.points === 0)!.id;
    expect(scoreTabletop(sel).transferPassed).toBe(false);
  });
  it('passes on a perfect, attested attempt with all exhibits and correct transfer', () => {
    const s = scoreTabletop(bestSelections());
    expect(s.criticalFailure).toBe(false);
    expect(s.transferPassed).toBe(true);
    expect(s.scorePercent).toBeGreaterThanOrEqual(FINAL_TABLETOP.passScore);
    expect(s.passed).toBe(true);
  });
});

// ---- Source-scan structural gates ----------------------------------------

describe('gate #2 — seven primary executive-readiness destinations', () => {
  it('MyJourneyApp defines exactly seven NAV_ITEMS', () => {
    const src = readFileSync(path.join(here, '..', 'MyJourneyApp.tsx'), 'utf8');
    const block = src.slice(src.indexOf('const NAV_ITEMS'), src.indexOf('const DECISIONS'));
    const ids = block.match(/id:\s*'(home|compliance|meetings|decisions|workflows|oversight|evidence)'/g) ?? [];
    expect(ids.length).toBe(7);
  });
});

describe('gate — production-path "practice" language is removed from the compliance UI', () => {
  it('the academy home and module players no longer call required work practice / certification locked', () => {
    for (const file of ['Academy.tsx', 'ExecutiveModule.tsx', 'MeetingModule.tsx']) {
      const src = readFileSync(path.join(here, '..', 'gb-academy', file), 'utf8');
      expect(src, file).not.toMatch(/private practice record/i);
      expect(src, file).not.toMatch(/certification lock/i);
      expect(src, file).not.toMatch(/local practice results/i);
    }
  });
});
