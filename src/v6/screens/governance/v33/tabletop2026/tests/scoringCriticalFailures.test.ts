// Acceptance: critical-error gate overrides numeric score; overreach scored;
// quarterly >= 950 / annual >= 970.

import { describe, it, expect } from 'vitest';
import { scoreAttempt, dimensionForKind } from '../engine/scoring';
import { buildDiagnostics } from '../engine/diagnostics';
import {
  ANNUAL_PASS_SCORE,
  QUARTERLY_PASS_SCORE,
  SCORE_DIMENSION_WEIGHTS,
  emptyAttemptSelections,
  passScoreForQuarter,
  type AttemptSelections,
  type CasePack,
  type DecisionNode,
  type ScoreDimensionKey,
  type TabletopDiagnostic,
} from '../engine/caseTypes';
import { ANNUAL_2026_CASE } from '../data/annualCase';

// ---------------------------------------------------------------------------
// Threshold constants themselves
// ---------------------------------------------------------------------------

describe('scoring — quarterly vs annual pass thresholds', () => {
  it('every quarter requires >=950; the FY2026 capstone requires >=970', () => {
    expect(QUARTERLY_PASS_SCORE).toBe(950);
    expect(ANNUAL_PASS_SCORE).toBe(970);
    (['Q1', 'Q2', 'Q3', 'Q4'] as const).forEach((q) => expect(passScoreForQuarter(q)).toBe(950));
    expect(passScoreForQuarter('FY2026')).toBe(970);
  });
});

// ---------------------------------------------------------------------------
// Synthetic fixture: one node per scoring dimension, full weight achievable.
// ---------------------------------------------------------------------------

function node(overrides: Partial<DecisionNode>): DecisionNode {
  return {
    id: 'DN-X', matterId: 'M-X', round: 1, title: 't', prompt: 'p', kind: 'disposition',
    competencyIds: [], workflowIds: [], pointsAvailable: 10, requiredEvidenceIds: [], modelAction: null,
    rationale: 'r', alternativesWhyFail: [], formsRequired: [], deadlineExplanation: 'd',
    consequences: { patientSafety: '', regulatory: '', financial: '', privacy: '', recordIntegrity: '' },
    ...overrides,
  };
}

const DIMENSION_NODES: DecisionNode[] = [
  node({ id: 'DN-EI', kind: 'classify_evidence', pointsAvailable: SCORE_DIMENSION_WEIGHTS.evidence_integrity }),
  node({ id: 'DN-ML', kind: 'quorum_calc', pointsAvailable: SCORE_DIMENSION_WEIGHTS.meeting_legality }),
  node({ id: 'DN-QJ', kind: 'proceed_decision', pointsAvailable: SCORE_DIMENSION_WEIGHTS.qapi_judgment }),
  node({ id: 'DN-WA', kind: 'workflow_select', pointsAvailable: SCORE_DIMENSION_WEIGHTS.workflow_authority }),
  node({ id: 'DN-DP', kind: 'motion_builder', pointsAvailable: SCORE_DIMENSION_WEIGHTS.decision_proportionality }),
  node({ id: 'DN-RF', kind: 'public_minutes', pointsAvailable: SCORE_DIMENSION_WEIGHTS.records_forms }),
];

function makePack(quarter: CasePack['quarter']): CasePack {
  return {
    id: 'synthetic-scoring', quarter, title: 't', subtitle: 's', estMinutes: 1, sourceCutoff: '2026-01-01',
    exhibits: [], decisionNodes: DIMENSION_NODES,
    injects: [],
    surveyor: [{ id: 'SQ-1', prompt: 'p', options: [{ id: 'A', text: 'a' }], correctId: 'A', requiresEvidenceIds: [] }],
    transfers: [],
    requiredWorkflows: [], passScore: passScoreForQuarter(quarter),
    passStandardNote: '',
  };
}

function fullCreditDiagnostic(nodeId: string, _dimensionKind: DecisionNode['kind'], points: number): TabletopDiagnostic {
  return {
    nodeId, period: 'Q1', competencyIds: [], workflowIds: [], userAction: null, modelAction: null,
    result: 'correct', pointsAvailable: points, pointsEarned: points,
    evidenceUsed: [], evidenceRequired: [], evidenceMissed: [], evidenceMisused: [],
    authorityExplanation: '', workflowExplanation: '', formsRequired: [], deadlineExplanation: '',
    whyUserActionSucceededOrFailed: '', whyAlternativesFail: [],
    consequences: { patientSafety: '', regulatory: '', financial: '', privacy: '', recordIntegrity: '' },
    remediation: { immediate: '', microLessonId: null, trueFalseItemIds: [], changedFactsPrompt: null },
  };
}

describe('scoring — a fully-correct attempt reaches the full 1000 points and passes both standards', () => {
  it('reaches 1000/1000 across all 7 dimensions (6 diagnostics + surveyor) with no critical errors', () => {
    const pack = makePack('FY2026');
    const diagnostics = DIMENSION_NODES.map((n) => fullCreditDiagnostic(n.id, n.kind, n.pointsAvailable));
    const selections: AttemptSelections = {
      ...emptyAttemptSelections(),
      surveyorSelections: { 'SQ-1': 'A' },
    };
    const score = scoreAttempt(pack, selections, diagnostics);
    expect(score.total).toBe(1000);
    expect(score.criticalErrors).toEqual([]);
    expect(score.passed).toBe(true);
  });
});

describe('scoring — the 950/970 boundary between quarterly and annual passing', () => {
  it('a 965 total passes the quarterly (950) standard but fails the annual (970) standard', () => {
    const diagnostics = DIMENSION_NODES.map((n) => fullCreditDiagnostic(n.id, n.kind, n.pointsAvailable));
    // Shave 35 points off qapi_judgment (200 -> 165) so total = 965.
    const shaved = diagnostics.map((d) => (d.nodeId === 'DN-QJ' ? { ...d, pointsEarned: d.pointsEarned - 35 } : d));
    const selections: AttemptSelections = { ...emptyAttemptSelections(), surveyorSelections: { 'SQ-1': 'A' } };

    const quarterlyScore = scoreAttempt(makePack('Q1'), selections, shaved);
    expect(quarterlyScore.total).toBe(965);
    expect(quarterlyScore.passed).toBe(true);

    const annualScore = scoreAttempt(makePack('FY2026'), selections, shaved);
    expect(annualScore.total).toBe(965);
    expect(annualScore.passed).toBe(false);
  });
});

describe('scoring — a single critical failure overrides an otherwise-passing numeric score', () => {
  it('fails the attempt even when the score still totals 1000 (another node fills the same dimension to its cap)', () => {
    // Two nodes both mapping to evidence_integrity: one critical-failure (0 pts),
    // one full-credit at the full dimension weight — the dimension is still capped
    // at its full weight, so the numeric total is unaffected by the critical node.
    const critNode = node({ id: 'DN-EI-CRIT', kind: 'classify_evidence', pointsAvailable: SCORE_DIMENSION_WEIGHTS.evidence_integrity });
    const nodes = [critNode, ...DIMENSION_NODES];
    const pack: CasePack = { ...makePack('FY2026'), decisionNodes: nodes };

    const diagnostics: TabletopDiagnostic[] = [
      { ...fullCreditDiagnostic('DN-EI-CRIT', 'classify_evidence', SCORE_DIMENSION_WEIGHTS.evidence_integrity), result: 'critical_failure', pointsEarned: 0 },
      ...DIMENSION_NODES.map((n) => fullCreditDiagnostic(n.id, n.kind, n.pointsAvailable)),
    ];
    const selections: AttemptSelections = { ...emptyAttemptSelections(), surveyorSelections: { 'SQ-1': 'A' } };

    const score = scoreAttempt(pack, selections, diagnostics);
    expect(score.total).toBe(1000); // numerically would clear even the 970 annual bar
    expect(score.criticalErrors.length).toBeGreaterThan(0);
    expect(score.passed).toBe(false); // ...but the critical-failure gate still fails it
  });
});

describe('scoring — overreach is scored at a fixed 25% of the node\'s available points, never full credit', () => {
  it('via engine/diagnostics.ts buildDiagnostics on an authored overreach option (ANNUAL_2026_CASE DN-07)', () => {
    const dn07 = ANNUAL_2026_CASE.decisionNodes.find((n) => n.id === 'DN-07');
    expect(dn07).toBeDefined();
    const overreachOption = dn07!.options?.find((o) => o.overreach);
    expect(overreachOption).toBeDefined();

    const selections: AttemptSelections = {
      ...emptyAttemptSelections(),
      nodeSelections: {
        'DN-07': { nodeId: 'DN-07', selectedOptionIds: [overreachOption!.id], evidenceCited: [...dn07!.requiredEvidenceIds] },
      },
    };
    const diagnostics = buildDiagnostics(ANNUAL_2026_CASE, selections);
    const diag = diagnostics.find((d) => d.nodeId === 'DN-07')!;
    expect(diag.result).toBe('partial');
    expect(diag.pointsEarned).toBe(Math.round(dn07!.pointsAvailable * 0.25));
    expect(diag.pointsEarned).toBeLessThan(dn07!.pointsAvailable);
  });

  it('a synthetic overreach option is capped at 25% regardless of authored point value', () => {
    const overreachNode = node({
      id: 'DN-OVER', kind: 'owner_assign', pointsAvailable: 40,
      options: [{ id: 'A', text: 'overreach', overreach: true }, { id: 'B', text: 'correct', correct: true }],
    });
    const pack: CasePack = { ...makePack('Q1'), decisionNodes: [overreachNode] };
    const selections: AttemptSelections = {
      ...emptyAttemptSelections(),
      nodeSelections: { 'DN-OVER': { nodeId: 'DN-OVER', selectedOptionIds: ['A'], evidenceCited: [] } },
    };
    const diagnostics = buildDiagnostics(pack, selections);
    expect(diagnostics[0].result).toBe('partial');
    expect(diagnostics[0].pointsEarned).toBe(10); // round(40 * 0.25)
  });
});

describe('scoring — dimensionForKind is exhaustive and stable for the dimensions this suite depends on', () => {
  it('maps each kind used above to its documented dimension', () => {
    const expected: Array<[DecisionNode['kind'], ScoreDimensionKey]> = [
      ['classify_evidence', 'evidence_integrity'],
      ['quorum_calc', 'meeting_legality'],
      ['proceed_decision', 'qapi_judgment'],
      ['workflow_select', 'workflow_authority'],
      ['motion_builder', 'decision_proportionality'],
      ['public_minutes', 'records_forms'],
      ['surveyor', 'surveyor_transfer'],
    ];
    expected.forEach(([kind, dim]) => expect(dimensionForKind(kind)).toBe(dim));
  });
});
