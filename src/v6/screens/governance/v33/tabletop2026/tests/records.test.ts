// Acceptance: public vs executive-session separation; a material decision
// requires workflow(authority) + motion + owner + deadline + effectiveness +
// return + forms; a disconnected evidence service => no official completion;
// a local draft/resume is never treated as official.

import { describe, it, expect, beforeEach } from 'vitest';
import { ANNUAL_2026_CASE } from '../data/annualCase';
import type { DecisionNode } from '../engine/caseTypes';
import {
  clearDraft,
  commitEvidence,
  getOfficialEvidence,
  hasLocalDraft,
  readDraft,
  writeDraft,
} from '../../compliance/complianceStore';
import {
  getDisconnectedNotice,
  isEvidenceServiceConnected,
} from '../../compliance/complianceEvidenceAdapter';
import { commitTabletopEvidence } from '../engine/evidenceSnapshot';
import { Q1_CASE_PACK } from '../data/q1Case';
import { emptyAttemptSelections } from '../engine/caseTypes';

describe('records — public vs executive-session confidentiality separation', () => {
  it('the annual case authors both public and executive_session exhibits, and never mixes them', () => {
    const confidentialities = new Set(ANNUAL_2026_CASE.exhibits.map((e) => e.confidentiality));
    expect(confidentialities.has('public')).toBe(true);
    expect(confidentialities.has('executive_session')).toBe(true);
  });

  it('every executive_session exhibit is tied to the restricted-personnel workflow (GV-WF-09), never presented as ordinary public business', () => {
    const execExhibits = ANNUAL_2026_CASE.exhibits.filter((e) => e.confidentiality === 'executive_session');
    expect(execExhibits.length).toBeGreaterThan(0);
    execExhibits.forEach((e) => expect(e.workflowIds).toContain('GV-WF-09'));
  });

  it('the case authors distinct confidential_minutes and public_minutes decision kinds for the same executive-session matter — the record is split, not merged', () => {
    const confidential = ANNUAL_2026_CASE.decisionNodes.find((n) => n.kind === 'confidential_minutes');
    const publicMin = ANNUAL_2026_CASE.decisionNodes.find((n) => n.kind === 'public_minutes');
    expect(confidential).toBeDefined();
    expect(publicMin).toBeDefined();
    // Both minutes deliverables trace back to the same underlying matter.
    expect(confidential!.matterId).toBe(publicMin!.matterId);
    // The public minutes node's own correct answer must never name the specific clinician
    // identifiers used elsewhere for the restricted personnel matter (e.g. DN-21's board_vs_management
    // node, which is confined to executive session) — the public record states the fact and
    // authorized outcome only, never the individual detail.
    const publicCorrectOption = publicMin!.options?.find((o) => o.correct);
    expect(publicCorrectOption?.text ?? '').not.toMatch(/MOCK-CLIN/);
  });

  it('the session_classification node itself governs which parts of a matter must move to executive session', () => {
    const sessionClass = ANNUAL_2026_CASE.decisionNodes.find((n) => n.kind === 'session_classification');
    expect(sessionClass).toBeDefined();
    expect(sessionClass!.workflowIds).toContain('GV-WF-09');
  });
});

describe('records — a material decision requires workflow authority + motion + owner + deadline + effectiveness + return + forms', () => {
  const requiredKinds: Array<DecisionNode['kind']> = ['motion_builder', 'owner_assign', 'due_date', 'effectiveness', 'return_date'];

  requiredKinds.forEach((kind) => {
    it(`every authored "${kind}" node carries workflow authority, required forms, and a deadline explanation`, () => {
      const nodes = ANNUAL_2026_CASE.decisionNodes.filter((n) => n.kind === kind);
      expect(nodes.length).toBeGreaterThan(0);
      nodes.forEach((n) => {
        expect(n.workflowIds.length).toBeGreaterThan(0);
        expect(n.formsRequired.length).toBeGreaterThan(0);
        expect(n.deadlineExplanation.trim().length).toBeGreaterThan(0);
      });
    });
  });
});

describe('records — a disconnected compliance evidence service can never produce official completion', () => {
  it('the default (development) evidence service reports itself disconnected, with a "Preview only" notice', () => {
    expect(isEvidenceServiceConnected()).toBe(false);
    expect(getDisconnectedNotice()).toMatch(/Preview only/i);
    expect(getDisconnectedNotice()).toMatch(/not connected/i);
  });

  it('commitEvidence fails closed — no evidence record is ever added to the official snapshot', async () => {
    const before = getOfficialEvidence().length;
    const result = await commitEvidence('gb:tabletop:test-assignment', {
      assignmentId: 'gb:tabletop:test-assignment', learnerId: 'learner-1', role: 'GB',
      sourceId: Q1_CASE_PACK.id, sourceType: 'tabletop', sourceVersion: Q1_CASE_PACK.sourceCutoff,
      effectiveDate: Q1_CASE_PACK.sourceCutoff, readCompletedAt: null, attestedAt: null,
      answersSnapshot: {}, score: 1000, criticalErrors: [], attemptNumber: 1,
      remediationPath: 'none', activeTimeSeconds: 120, completedAt: '2026-01-01T00:00:00Z',
    } as never);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('not_connected');
    }
    expect(getOfficialEvidence().length).toBe(before);
  });

  it('commitTabletopEvidence (the tabletop-specific evidence assembler) also fails closed for a real CasePack', async () => {
    const result = await commitTabletopEvidence({
      learnerId: 'learner-1', assignmentId: 'gb:tabletop:test-assignment', role: 'GB', casePack: Q1_CASE_PACK,
      attemptNumber: 1, selections: emptyAttemptSelections(),
      score: { total: 1000, byDimension: { evidence_integrity: 150, meeting_legality: 150, qapi_judgment: 200, workflow_authority: 150, decision_proportionality: 150, records_forms: 100, surveyor_transfer: 100 }, criticalErrors: [], passed: true },
      activeTimeSeconds: 60, attestedAt: null, remediationPath: 'none',
    });
    expect(result.ok).toBe(false);
  });
});

describe('records — a local draft/resume state is never treated as official completion', () => {
  const assignmentId = 'gb:tabletop:draft-test-assignment';

  beforeEach(() => {
    clearDraft(assignmentId);
  });

  it('a written draft is readable for resume, but never appears in the official evidence snapshot', () => {
    expect(readDraft(assignmentId)).toBeNull();

    writeDraft({
      assignmentId, resume: { stage: 3 }, attemptNumber: 1, progressPercent: 60,
      submittedLocally: true, updatedAt: '2026-01-01T00:00:00Z',
    });

    expect(hasLocalDraft(assignmentId)).toBe(true);
    expect(readDraft(assignmentId)?.progressPercent).toBe(60);

    // Even a "submittedLocally: true" draft is not an official record.
    const official = getOfficialEvidence();
    expect(official.some((r) => r.assignmentId === assignmentId)).toBe(false);
  });

  it('clearing a draft removes resume state without ever having created an official record', () => {
    writeDraft({
      assignmentId, resume: {}, attemptNumber: 1, progressPercent: 100,
      submittedLocally: true, updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(hasLocalDraft(assignmentId)).toBe(true);
    clearDraft(assignmentId);
    expect(hasLocalDraft(assignmentId)).toBe(false);
    expect(getOfficialEvidence().some((r) => r.assignmentId === assignmentId)).toBe(false);
  });
});
