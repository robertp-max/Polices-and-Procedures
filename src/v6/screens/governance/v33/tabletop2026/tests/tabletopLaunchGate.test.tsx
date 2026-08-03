// The ONE authoritative tabletop launch gate + the Hub's blocking behavior.

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LAUNCH_ASSESSMENT_STANDARD_PERCENT,
  REQUIRED_TRAINING_COUNT,
  resolveTabletopLaunchGate,
  type TabletopLaunchGate,
} from '../tabletopLaunchGate';
import {
  READINESS_GATE_BODY,
  READINESS_GATE_HEADING,
} from '../TabletopReadinessGateModal';
import { clearPrivilegedTabletopAccessLog, getPrivilegedTabletopAccessLog } from '../../compliance/accessMode';
import { LOCAL_DEMO_LEARNER_ID } from '../../compliance/complianceIdentity';
import { clearDraft, readDraft, getOfficialEvidence, writeDraft } from '../../compliance/complianceStore';
import { USER_FACING_STATUS_LABEL } from '../../compliance/complianceTypes';
import type {
  ComplianceAssignment,
  ComplianceAssignmentView,
  ComplianceEvidenceRecord,
} from '../../compliance/complianceTypes';
import { Q1_CASE_PACK } from '../data/q1Case';
import TabletopHub from '../TabletopHub';

vi.mock('../tabletopPacketArtifacts', () => ({
  fetchTabletopPacketArtifacts: vi.fn(() => new Promise(() => undefined)),
}));
vi.mock('../useTabletopLaunchGate', () => ({
  useTabletopLaunchGate: vi.fn(() => ({
    allowed: false,
    accessMode: 'blocked',
    completedTrainingCount: 0,
    requiredTrainingCount: 13,
    completedPolicyCount: 0,
    requiredPolicyCount: 0,
    perfectAssessmentCount: 0,
    requiredAssessmentCount: 0,
    evidenceVerified: false,
    blockers: [],
  })),
}));

// ---------------------------------------------------------------------------
// Fixtures — a synthetic but structurally faithful GB catalog.
// ---------------------------------------------------------------------------

const LEARNER = 'user-gb-gate';

function assignment(patch: Partial<ComplianceAssignment>): ComplianceAssignment {
  return {
    assignmentId: 'gb:module:GB-001',
    learnerId: LEARNER,
    role: 'GB',
    type: 'training_module',
    sourceId: 'GB-001',
    title: 'GB-001',
    required: true,
    assignedAt: '2026-01-01T00:00:00.000Z',
    dueAt: null,
    recurrence: null,
    status: 'not_started',
    progressPercent: 0,
    passStandard: 92,
    passStandardScale: 'percentage_100',
    attemptCount: 0,
    lastActivityAt: null,
    blockerReason: null,
    ...patch,
  };
}

function view(a: ComplianceAssignment, officiallyComplete: boolean): ComplianceAssignmentView {
  return {
    assignment: a,
    userFacingStatus: officiallyComplete ? 'completed' : 'required_not_started',
    statusLabel: USER_FACING_STATUS_LABEL[officiallyComplete ? 'completed' : 'required_not_started'],
    officiallyComplete,
    hasLocalDraft: false,
  };
}

function record(a: ComplianceAssignment, score: number | null): ComplianceEvidenceRecord {
  return {
    schemaVersion: 2,
    evidenceId: `ev:${a.assignmentId}`,
    assignmentId: a.assignmentId,
    learnerId: LEARNER,
    role: 'GB',
    sourceId: a.sourceId,
    sourceType: a.type === 'training_module' ? 'module' : a.type === 'policy_reading' ? 'policy' : 'course_quiz',
    sourceVersion: 'v1',
    effectiveDate: '2026-01-01',
    readCompletedAt: '2026-02-01T00:00:00.000Z',
    attestedAt: '2026-02-01T00:00:00.000Z',
    answersSnapshot: {},
    score,
    scoreMaximum: score === null ? null : 100,
    passThreshold: score === null ? null : a.passStandard,
    scoreScale: score === null ? null : 'percentage_100',
    outcome: score === null ? 'completed' : 'passed',
    criticalErrors: [],
    attemptNumber: 1,
    remediationPath: 'none',
    activeTimeSeconds: 900,
    completedAt: '2026-02-01T00:00:00.000Z',
    integrityHash: `hash:${a.assignmentId}`,
  };
}

const POLICY_COUNT = 4;
const COURSE_COUNT = 2;

/** A catalog where every prerequisite is complete at 100%. */
function qualifiedCatalog(): { views: ComplianceAssignmentView[]; evidence: ComplianceEvidenceRecord[] } {
  const assignments: ComplianceAssignment[] = [];
  for (let i = 1; i <= REQUIRED_TRAINING_COUNT; i += 1) {
    assignments.push(
      assignment({ assignmentId: `gb:module:GB-0${i}`, sourceId: `GB-0${i}`, title: `Module GB-0${i}` }),
    );
  }
  for (let i = 1; i <= POLICY_COUNT; i += 1) {
    assignments.push(
      assignment({
        assignmentId: `gb:policy:REQ-${i}`,
        type: 'policy_reading',
        sourceId: `POL-${i}`,
        title: `Policy ${i}`,
        passStandard: null,
        passStandardScale: null,
      }),
    );
  }
  for (let i = 1; i <= COURSE_COUNT; i += 1) {
    assignments.push(
      assignment({
        assignmentId: `gb:course-assessment:COURSE-${i}`,
        type: 'course_assessment',
        sourceId: `COURSE-${i}`,
        title: `Course ${i} — course assessment`,
        passStandard: 80,
      }),
    );
  }
  // A tabletop assignment must never be its own prerequisite.
  assignments.push(
    assignment({
      assignmentId: 'gb:tabletop2026:tabletop2026-q1',
      type: 'tabletop',
      sourceId: 'tabletop2026-q1',
      title: 'Q1 tabletop',
      passStandard: 950,
      passStandardScale: 'points_1000',
    }),
  );

  const views = assignments.map((a) => view(a, a.type !== 'tabletop'));
  const evidence = assignments
    .filter((a) => a.type !== 'tabletop')
    .map((a) => record(a, a.passStandard === null ? null : 100));
  return { views, evidence };
}

function gateFor(
  overrides: Partial<Parameters<typeof resolveTabletopLaunchGate>[0]> = {},
): TabletopLaunchGate {
  const { views, evidence } = qualifiedCatalog();
  return resolveTabletopLaunchGate({
    views,
    officialEvidence: evidence,
    learnerId: LEARNER,
    evidenceConnected: true,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Selector
// ---------------------------------------------------------------------------

describe('resolveTabletopLaunchGate', () => {
  it('allows a fully-qualified learner and reports full official progress', () => {
    const gate = gateFor();
    expect(gate.blockers).toEqual([]);
    expect(gate.allowed).toBe(true);
    expect(gate.accessMode).toBe('official');
    expect(gate.evidenceVerified).toBe(true);
    expect(gate.completedTrainingCount).toBe(REQUIRED_TRAINING_COUNT);
    expect(gate.requiredTrainingCount).toBe(13);
    expect(gate.completedPolicyCount).toBe(POLICY_COUNT);
    expect(gate.requiredPolicyCount).toBe(POLICY_COUNT);
    expect(gate.requiredAssessmentCount).toBe(REQUIRED_TRAINING_COUNT + COURSE_COUNT);
    expect(gate.perfectAssessmentCount).toBe(gate.requiredAssessmentCount);
  });

  it('blocks a 92%-passing module because the LAUNCH standard is 100%', () => {
    const { views, evidence } = qualifiedCatalog();
    const target = evidence.find((r) => r.assignmentId === 'gb:module:GB-01')!;
    target.score = 92; // meets MODULE_MASTERY_STANDARD, not the launch standard
    const gate = resolveTabletopLaunchGate({
      views,
      officialEvidence: evidence,
      learnerId: LEARNER,
      evidenceConnected: true,
    });
    expect(LAUNCH_ASSESSMENT_STANDARD_PERCENT).toBe(100);
    expect(gate.allowed).toBe(false);
    expect(gate.accessMode).toBe('blocked');
    const blocker = gate.blockers.find((b) => b.type === 'training_assessment');
    expect(blocker?.currentStatus).toBe('Scored 92%');
    expect(blocker?.requiredStatus).toBe('100%');
    expect(blocker?.destination).toBe('#compliance/training/module/GB-01');
  });

  it('blocks an 80%-passing course assessment and deep-links to it', () => {
    const { views, evidence } = qualifiedCatalog();
    evidence.find((r) => r.assignmentId === 'gb:course-assessment:COURSE-1')!.score = 80;
    const gate = resolveTabletopLaunchGate({ views, officialEvidence: evidence, learnerId: LEARNER, evidenceConnected: true });
    const blocker = gate.blockers.find((b) => b.type === 'policy_assessment');
    expect(gate.allowed).toBe(false);
    expect(blocker?.destination).toBe('#compliance/policies/assessment/COURSE-1');
  });

  it('blocks an unread policy and deep-links to the requirement', () => {
    const { views, evidence } = qualifiedCatalog();
    const target = views.find((v) => v.assignment.assignmentId === 'gb:policy:REQ-2')!;
    target.officiallyComplete = false;
    target.userFacingStatus = 'required_not_started';
    const gate = resolveTabletopLaunchGate({ views, officialEvidence: evidence, learnerId: LEARNER, evidenceConnected: true });
    const blocker = gate.blockers.find((b) => b.type === 'policy');
    expect(gate.allowed).toBe(false);
    expect(blocker?.destination).toBe('#compliance/policies/requirement/REQ-2');
    expect(gate.completedPolicyCount).toBe(POLICY_COUNT - 1);
  });

  it('never counts preview, demo, cross-user, failed, or privileged evidence', () => {
    const { views, evidence } = qualifiedCatalog();

    // Disconnected service.
    expect(
      resolveTabletopLaunchGate({ views, officialEvidence: evidence, learnerId: LEARNER, evidenceConnected: false }).allowed,
    ).toBe(false);

    // Local-demo identity.
    expect(
      resolveTabletopLaunchGate({
        views,
        officialEvidence: evidence,
        learnerId: LOCAL_DEMO_LEARNER_ID,
        evidenceConnected: true,
      }).evidenceVerified,
    ).toBe(false);

    // Cross-user records.
    const foreign = evidence.map((r) => ({ ...r, learnerId: 'someone-else' }));
    expect(
      resolveTabletopLaunchGate({ views, officialEvidence: foreign, learnerId: LEARNER, evidenceConnected: true }).allowed,
    ).toBe(false);

    // Failed attempt.
    const failed = evidence.map((r) =>
      r.assignmentId === 'gb:module:GB-01' ? { ...r, outcome: 'failed' as const } : r,
    );
    expect(
      resolveTabletopLaunchGate({ views, officialEvidence: failed, learnerId: LEARNER, evidenceConnected: true }).allowed,
    ).toBe(false);

    // Privileged preview attempt stamped on the record.
    const privileged = evidence.map((r) =>
      r.assignmentId === 'gb:module:GB-01' ? { ...r, privilegedAccessMode: 'superadmin' as const } : r,
    );
    expect(
      resolveTabletopLaunchGate({ views, officialEvidence: privileged, learnerId: LEARNER, evidenceConnected: true }).allowed,
    ).toBe(false);
  });

  it('lets a privileged tier bypass prerequisites without satisfying them', () => {
    const { views } = qualifiedCatalog();
    for (const mode of ['superadmin', 'uat_reviewer'] as const) {
      const gate = resolveTabletopLaunchGate({
        views: views.map((v) => ({ ...v, officiallyComplete: false, userFacingStatus: 'required_not_started' as const })),
        officialEvidence: [],
        learnerId: LEARNER,
        evidenceConnected: false,
        privilegedMode: mode,
      });
      expect(gate.allowed).toBe(true);
      expect(gate.accessMode).toBe(mode);
      // Bypass is LAUNCH-only: nothing is counted as satisfied.
      expect(gate.completedTrainingCount).toBe(0);
      expect(gate.completedPolicyCount).toBe(0);
      expect(gate.perfectAssessmentCount).toBe(0);
      expect(gate.evidenceVerified).toBe(false);
      expect(gate.blockers.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Hub behavior
// ---------------------------------------------------------------------------

const BLOCKED_GATE: TabletopLaunchGate = {
  allowed: false,
  accessMode: 'blocked',
  completedTrainingCount: 9,
  requiredTrainingCount: 13,
  completedPolicyCount: 30,
  requiredPolicyCount: 42,
  perfectAssessmentCount: 5,
  requiredAssessmentCount: 26,
  evidenceVerified: false,
  blockers: [
    {
      id: 'gb:module:GB-011',
      type: 'training',
      title: 'GB-011 Quality Assessment and Performance Improvement',
      currentStatus: 'Required — not started',
      requiredStatus: 'Completed with official evidence',
      destination: '#compliance/training/module/GB-011',
    },
    {
      id: 'gb:course-assessment:COURSE-3:assessment',
      type: 'policy_assessment',
      title: 'Infection control — course assessment',
      currentStatus: 'Scored 88%',
      requiredStatus: '100%',
      destination: '#compliance/policies/assessment/COURSE-3',
    },
  ],
};

const ALLOWED_GATE: TabletopLaunchGate = { ...BLOCKED_GATE, allowed: true, accessMode: 'official', blockers: [] };

const BLOCKER_TITLES = BLOCKED_GATE.blockers.map((b) => b.title);

const soloButton = (): HTMLElement =>
  screen.getByRole('button', { name: `Start ${Q1_CASE_PACK.title} as a solo attempt` });

afterEach(() => {
  clearPrivilegedTabletopAccessLog();
  clearDraft(LEARNER, `gb:tabletop2026:${Q1_CASE_PACK.id}`);
});

describe('Tabletop Hub launch gating', () => {
  it('keeps every scenario card browsable and never dims or locks them', () => {
    render(
      <TabletopHub onExit={vi.fn()} onLaunch={vi.fn()} learnerId={LEARNER} launchGateOverride={BLOCKED_GATE} />,
    );
    // All five cards present, with descriptions, standards and history.
    expect(screen.getByText(Q1_CASE_PACK.subtitle)).toBeTruthy();
    expect(screen.getByText('Critical Standards')).toBeTruthy();
    expect(screen.getByText('Attempt History')).toBeTruthy();
    expect(screen.getByText('Workflow Coverage')).toBeTruthy();
    // Launch controls stay enabled — the gate fires on the attempt, not the card.
    const solo = soloButton() as HTMLButtonElement;
    expect(solo.disabled).toBe(false);
    expect(solo.getAttribute('aria-disabled')).toBeNull();
  });

  it('blocks the launch with the contractual modal and creates NO attempt, draft, or evidence', () => {
    const onLaunch = vi.fn();
    const onBlockedLaunch = vi.fn();
    const evidenceBefore = getOfficialEvidence().length;
    const assignmentId = `gb:tabletop2026:${Q1_CASE_PACK.id}`;

    render(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={onLaunch}
        learnerId={LEARNER}
        launchGateOverride={BLOCKED_GATE}
        onBlockedLaunch={onBlockedLaunch}
      />,
    );

    fireEvent.click(soloButton());

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: READINESS_GATE_HEADING })).toBeTruthy();
    expect(screen.getByText(READINESS_GATE_BODY)).toBeTruthy();

    // Real official progress, and only actionable blockers.
    expect(screen.getByText('9/13')).toBeTruthy();
    expect(screen.getByText('30/42')).toBeTruthy();
    expect(screen.getByText('5/26')).toBeTruthy();
    expect(screen.getByText(BLOCKER_TITLES[0])).toBeTruthy();
    expect(screen.getByText(BLOCKER_TITLES[1])).toBeTruthy();

    // Nothing was started.
    expect(onLaunch).not.toHaveBeenCalled();
    expect(readDraft(LEARNER, assignmentId)).toBeNull();
    expect(getOfficialEvidence().length).toBe(evidenceBefore);
    expect(getPrivilegedTabletopAccessLog()).toHaveLength(0);
    expect(screen.getByText(/No attempt, timer, draft, score, or evidence record was created/)).toBeTruthy();

    // The parent is told, so it can push overlay=readiness-gate:{caseId}:{mode}.
    expect(onBlockedLaunch).toHaveBeenCalledWith(Q1_CASE_PACK.id, 'solo', BLOCKED_GATE);
  });

  it('offers both modal actions, restores focus, and keeps the scenario selected', () => {
    const onGoToCompliance = vi.fn();
    const { container } = render(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={vi.fn()}
        learnerId={LEARNER}
        launchGateOverride={BLOCKED_GATE}
        onGoToCompliance={onGoToCompliance}
      />,
    );

    fireEvent.click(soloButton());
    // Background is inert while the modal is open.
    const shell = container.querySelector('.bs-hub-shell')!;
    expect(shell.hasAttribute('inert')).toBe(true);
    expect(shell.getAttribute('aria-hidden')).toBe('true');

    expect(screen.getByRole('button', { name: /Go to My Compliance/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Tabletop Hub' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(shell.hasAttribute('inert')).toBe(false);
    // Scenario stays highlighted after returning; no auto-launch.
    expect(container.querySelector('.bs-hub-pack-selected')).toBeTruthy();

    fireEvent.click(soloButton());
    fireEvent.click(screen.getByRole('button', { name: /Go to My Compliance/ }));
    expect(onGoToCompliance).toHaveBeenCalledTimes(1);
  });

  it('does not auto-launch once prerequisites complete — a new explicit start is required', () => {
    const onLaunch = vi.fn();
    const { rerender } = render(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={onLaunch}
        learnerId={LEARNER}
        launchGateOverride={BLOCKED_GATE}
        gateOverlay={{ caseId: Q1_CASE_PACK.id, mode: 'solo' }}
      />,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();

    rerender(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={onLaunch}
        learnerId={LEARNER}
        launchGateOverride={ALLOWED_GATE}
        gateOverlay={{ caseId: Q1_CASE_PACK.id, mode: 'solo' }}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onLaunch).not.toHaveBeenCalled();

    fireEvent.click(soloButton());
    expect(onLaunch).toHaveBeenCalledWith(Q1_CASE_PACK.id, 'solo');
  });

  it('gates a browser-restored active scenario instead of resuming it', () => {
    const onLaunch = vi.fn();
    render(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={onLaunch}
        learnerId={LEARNER}
        launchGateOverride={BLOCKED_GATE}
        gateOverlay={{ caseId: Q1_CASE_PACK.id, mode: 'group' }}
      />,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('data-launch-mode')).toBe('group');
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it('gates Resume and Start over without destroying the saved draft', () => {
    const assignmentId = `gb:tabletop2026:${Q1_CASE_PACK.id}`;
    writeDraft(LEARNER, {
      assignmentId,
      resume: { casePackId: Q1_CASE_PACK.id },
      attemptNumber: 1,
      progressPercent: 40,
      submittedLocally: false,
      updatedAt: '2026-04-09T18:00:00.000Z',
    });
    const onLaunch = vi.fn();
    render(
      <TabletopHub onExit={vi.fn()} onLaunch={onLaunch} learnerId={LEARNER} launchGateOverride={BLOCKED_GATE} />,
    );

    fireEvent.click(screen.getByRole('button', { name: `Resume ${Q1_CASE_PACK.title} solo draft` }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Return to Tabletop Hub' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Start over' })[0]);
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Start over' }).find((b) => b.classList.contains('danger'))!,
    );

    expect(onLaunch).not.toHaveBeenCalled();
    expect(readDraft(LEARNER, assignmentId)).not.toBeNull();
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});

describe('Tabletop Hub privileged access', () => {
  beforeEach(() => {
    clearPrivilegedTabletopAccessLog();
  });

  it.each(['superadmin', 'uat_reviewer'] as const)('labels a %s session and launches without an official record', (mode) => {
    const onLaunch = vi.fn();
    render(
      <TabletopHub
        onExit={vi.fn()}
        onLaunch={onLaunch}
        learnerId={LEARNER}
        launchGateOverride={{ ...BLOCKED_GATE, allowed: true, accessMode: mode }}
      />,
    );

    const banner = screen.getByRole('status');
    expect(banner.getAttribute('data-access-mode')).toBe(mode);
    if (mode === 'uat_reviewer') {
      expect(screen.getByText('UAT Reviewer Access')).toBeTruthy();
      expect(
        screen.getByText(
          'This account may review tabletop exercises before readiness prerequisites are complete. Reviewer attempts do not satisfy official Governing Body readiness or compliance requirements.',
        ),
      ).toBeTruthy();
    } else {
      expect(screen.getByText('Super Admin Full Access')).toBeTruthy();
      expect(screen.getByText(/do not create official completion evidence/)).toBeTruthy();
    }

    const evidenceBefore = getOfficialEvidence().length;
    fireEvent.click(soloButton());

    // Launch happens (bypass) but is logged as a non-official privileged session.
    expect(onLaunch).toHaveBeenCalledWith(Q1_CASE_PACK.id, 'solo');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(getOfficialEvidence().length).toBe(evidenceBefore);
    const log = getPrivilegedTabletopAccessLog();
    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({ accessMode: mode, caseId: Q1_CASE_PACK.id, mode: 'solo', official: false });
  });
});
