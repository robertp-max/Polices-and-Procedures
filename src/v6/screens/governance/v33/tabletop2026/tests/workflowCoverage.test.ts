// Acceptance: annual activates all 14; each quarter activates GV-WF-01 + >=5;
// unsupported activation is penalized (never counted as "activated").
//
// Strategy: for the "activates all 14 / at least 5" assertions we build a
// full-credit AttemptSelections directly from each authored CasePack (every
// option-based node gets its authored `correct` option(s); every structured
// node gets its authored `modelAction`) and run it through the real
// computeWorkflowActivation engine. For "unsupported activation penalized"
// we use small synthetic CasePack fixtures so the critical-failure / overreach
// / wrong-answer paths are exercised in isolation from the (huge) authored data.

import { describe, it, expect } from 'vitest';
import { computeWorkflowActivation } from '../engine/workflowTriggerEngine';
import type { AttemptSelections, CasePack, DecisionNode, NodeSelection } from '../engine/caseTypes';
import { ALL_GV_WORKFLOW_IDS } from '../engine/caseTypes';
import { assertWorkflowCoverage, requiredForAnnual, requiredForQuarter } from '../data/workflowCoverage';
import { ANNUAL_2026_CASE } from '../data/annualCase';
import { Q1_CASE_PACK } from '../data/q1Case';
import { Q2_2026_CASE } from '../data/q2Case';
import { Q3_2026_CASE } from '../data/q3Case';
import { Q4_CASE_PACK } from '../data/q4Case';

/** Builds a selection that earns full credit on every node, per the node's own authored answer key. */
function buildFullCreditSelections(casePack: CasePack): AttemptSelections {
  const nodeSelections: Record<string, NodeSelection> = {};
  for (const node of casePack.decisionNodes) {
    if (node.options) {
      const correctIds = node.options.filter((o) => o.correct).map((o) => o.id);
      nodeSelections[node.id] = {
        nodeId: node.id,
        selectedOptionIds: correctIds,
        evidenceCited: [...node.requiredEvidenceIds],
      };
    } else {
      nodeSelections[node.id] = {
        nodeId: node.id,
        action: node.modelAction,
        evidenceCited: [...node.requiredEvidenceIds],
      };
    }
  }
  return { nodeSelections, surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [] };
}

describe('workflowCoverage — FY2026 annual capstone activates all 14 workflows', () => {
  it('a fully-correct attempt activates every one of the 14 GV-WF workflows soundly', () => {
    const selections = buildFullCreditSelections(ANNUAL_2026_CASE);
    const result = computeWorkflowActivation(ANNUAL_2026_CASE, selections);

    expect(new Set(result.activated)).toEqual(new Set(ALL_GV_WORKFLOW_IDS));
    expect(result.unsupportedTriggered).toEqual([]);
    expect(result.missingRequired).toEqual([]);

    const assertion = assertWorkflowCoverage(result.activated, requiredForAnnual());
    expect(assertion.covered).toBe(true);
    expect(assertion.missing).toEqual([]);

    for (const w of ALL_GV_WORKFLOW_IDS) {
      expect(result.coverage[w]).toBe(true);
    }
  });
});

describe('workflowCoverage — each quarterly case activates GV-WF-01 plus at least 5 workflows', () => {
  const quarters: Array<{ label: string; pack: CasePack }> = [
    { label: 'Q1', pack: Q1_CASE_PACK },
    { label: 'Q2', pack: Q2_2026_CASE },
    { label: 'Q3', pack: Q3_2026_CASE },
    { label: 'Q4', pack: Q4_CASE_PACK },
  ];

  for (const { label, pack } of quarters) {
    it(`${label}: fully-correct attempt activates GV-WF-01 and >=5 distinct workflows, with the quarterly core covered`, () => {
      const selections = buildFullCreditSelections(pack);
      const result = computeWorkflowActivation(pack, selections);

      expect(result.activated).toContain('GV-WF-01');
      expect(result.activated.length).toBeGreaterThanOrEqual(5);
      expect(result.unsupportedTriggered).toEqual([]);

      const assertion = assertWorkflowCoverage(result.activated, requiredForQuarter(pack.quarter));
      expect(assertion.covered).toBe(true);
    });
  }
});

describe('workflowCoverage — unsupported activation is never counted as activated', () => {
  function node(overrides: Partial<DecisionNode>): DecisionNode {
    return {
      id: 'DN-X', matterId: 'M-X', round: 1, title: 't', prompt: 'p', kind: 'disposition',
      competencyIds: [], workflowIds: ['GV-WF-07'], pointsAvailable: 10,
      requiredEvidenceIds: [], modelAction: null, rationale: 'r', alternativesWhyFail: [],
      formsRequired: [], deadlineExplanation: 'd',
      consequences: { patientSafety: '', regulatory: '', financial: '', privacy: '', recordIntegrity: '' },
      ...overrides,
    };
  }

  function pack(nodes: DecisionNode[], requiredWorkflows: CasePack['requiredWorkflows'] = []): CasePack {
    return {
      id: 'synthetic', quarter: 'Q1', title: 't', subtitle: 's', estMinutes: 1, sourceCutoff: '2026-01-01',
      exhibits: [], decisionNodes: nodes, injects: [], surveyor: [], transfers: [],
      requiredWorkflows, passScore: 950, passStandardNote: '',
    };
  }

  it('a critical-failure selection triggers the workflow as unsupported, not activated', () => {
    const n = node({
      id: 'DN-CRIT',
      options: [
        { id: 'A', text: 'critical', criticalFailure: true },
        { id: 'B', text: 'correct', correct: true },
      ],
    });
    const selections: AttemptSelections = {
      nodeSelections: { 'DN-CRIT': { nodeId: 'DN-CRIT', selectedOptionIds: ['A'], evidenceCited: [] } },
      surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [],
    };
    const result = computeWorkflowActivation(pack([n]), selections);
    expect(result.activated).toEqual([]);
    expect(result.unsupportedTriggered).toEqual(['GV-WF-07']);
  });

  it('an overreach selection triggers the workflow as unsupported, not activated', () => {
    const n = node({
      id: 'DN-OVER',
      options: [
        { id: 'A', text: 'overreach', overreach: true },
        { id: 'B', text: 'correct', correct: true },
      ],
    });
    const selections: AttemptSelections = {
      nodeSelections: { 'DN-OVER': { nodeId: 'DN-OVER', selectedOptionIds: ['A'], evidenceCited: [] } },
      surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [],
    };
    const result = computeWorkflowActivation(pack([n]), selections);
    expect(result.activated).toEqual([]);
    expect(result.unsupportedTriggered).toEqual(['GV-WF-07']);
  });

  it('a plain wrong (non-correct, non-critical, non-overreach) selection is also unsupported, not activated', () => {
    const n = node({
      id: 'DN-WRONG',
      options: [
        { id: 'A', text: 'wrong' },
        { id: 'B', text: 'correct', correct: true },
      ],
    });
    const selections: AttemptSelections = {
      nodeSelections: { 'DN-WRONG': { nodeId: 'DN-WRONG', selectedOptionIds: ['A'], evidenceCited: [] } },
      surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [],
    };
    const result = computeWorkflowActivation(pack([n]), selections);
    expect(result.activated).toEqual([]);
    expect(result.unsupportedTriggered).toEqual(['GV-WF-07']);
  });

  it('missingRequired reports required workflows never soundly activated, even if unsupported-triggered', () => {
    const n = node({
      id: 'DN-CRIT2', workflowIds: ['GV-WF-09'],
      options: [{ id: 'A', text: 'critical', criticalFailure: true }, { id: 'B', text: 'correct', correct: true }],
    });
    const selections: AttemptSelections = {
      nodeSelections: { 'DN-CRIT2': { nodeId: 'DN-CRIT2', selectedOptionIds: ['A'], evidenceCited: [] } },
      surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [],
    };
    const result = computeWorkflowActivation(pack([n], ['GV-WF-09']), selections);
    expect(result.missingRequired).toEqual(['GV-WF-09']);
    expect(assertWorkflowCoverage(result.activated, ['GV-WF-09']).covered).toBe(false);
  });

  it('an unanswered node never activates or unsupported-triggers its workflow', () => {
    const n = node({ id: 'DN-UNANSWERED', options: [{ id: 'A', text: 'correct', correct: true }] });
    const selections: AttemptSelections = { nodeSelections: {}, surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [] };
    const result = computeWorkflowActivation(pack([n]), selections);
    expect(result.activated).toEqual([]);
    expect(result.unsupportedTriggered).toEqual([]);
  });
});
