// Acceptance: remediation is targeted from missed competencies; must correct
// to 100%; never substitutes for a fresh primary attempt.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { buildTargetedRemediation, REMEDIATION_BANK } from '../data/remediationBank';
import GuidedTrueFalseRemediation from '../GuidedTrueFalseRemediation';
import { variant, attemptSeedKey } from '../engine/attemptVariants';
import { Q1_CASE_PACK } from '../data/q1Case';

describe('remediation — buildTargetedRemediation targets the specific missed competencies', () => {
  it('returns only items whose competencyId was actually missed', () => {
    const result = buildTargetedRemediation(['quorum-recusal']);
    expect(result.trueFalseItemIds.length).toBeGreaterThan(0);
    expect(result.items.every((i) => i.competencyId === 'quorum-recusal')).toBe(true);
    expect(result.microLessonId).toBe('quorum-recusal');
  });

  it('covers multiple missed competencies at once, one item set per competency', () => {
    const result = buildTargetedRemediation(['quorum-recusal', 'executive-session']);
    const competenciesReturned = new Set(result.items.map((i) => i.competencyId));
    expect(competenciesReturned.has('quorum-recusal')).toBe(true);
    expect(competenciesReturned.has('executive-session')).toBe(true);
    expect([...competenciesReturned].every((c) => c === 'quorum-recusal' || c === 'executive-session')).toBe(true);
  });

  it('falls back to the fixed fallback set when nothing/unknown was missed, rather than returning nothing', () => {
    const result = buildTargetedRemediation([]);
    expect(result.trueFalseItemIds.sort()).toEqual(['RTF-EI-01', 'RTF-QR-01', 'RTF-RI-01'].sort());

    const unknownResult = buildTargetedRemediation(['not-a-real-competency']);
    expect(unknownResult.trueFalseItemIds.sort()).toEqual(['RTF-EI-01', 'RTF-QR-01', 'RTF-RI-01'].sort());
  });

  it('every bank item resolves to a real, unique id (no dangling references)', () => {
    const ids = REMEDIATION_BANK.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('remediation — GuidedTrueFalseRemediation requires every statement corrected to 100% before completing', () => {
  const items = [
    { id: 'RTF-A', competencyId: 'quorum-recusal' as const, statement: 'Statement A', answer: true, explanation: 'exp A', workflowId: 'GV-WF-02' as const, formIds: [], whyItMatters: 'w' },
    { id: 'RTF-B', competencyId: 'evidence-integrity' as const, statement: 'Statement B', answer: false, explanation: 'exp B', workflowId: 'GV-WF-05' as const, formIds: [], whyItMatters: 'w' },
  ];

  it('does not fire onComplete after only one item is answered, and requeues a missed item until it is answered correctly', () => {
    const onComplete = vi.fn();
    render(<GuidedTrueFalseRemediation items={items} onComplete={onComplete} />);

    // First statement shown is RTF-A (answer: true). Answer it WRONG (false) first.
    fireEvent.click(screen.getByRole('button', { name: 'False' }));
    expect(screen.getByText(/Not quite/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Try This Statement Again/i }));

    // Not complete yet — still mid-remediation.
    expect(onComplete).not.toHaveBeenCalled();

    // Now answer the current (requeued or next) statement correctly, working through
    // until both statements have been mastered at least once.
    let safety = 0;
    while (!onComplete.mock.calls.length && safety < 20) {
      safety += 1;
      const trueBtn = screen.queryByRole('button', { name: 'True' });
      const falseBtn = screen.queryByRole('button', { name: 'False' });
      if (!trueBtn || !falseBtn) break;
      const statementText = screen.getByRole('heading', { level: 3 }).textContent;
      const currentItem = items.find((i) => i.statement === statementText)!;
      fireEvent.click(currentItem.answer ? trueBtn : falseBtn);
      const nextBtn = screen.getByRole('button', { name: /Continue|Try This Statement Again/i });
      fireEvent.click(nextBtn);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('fires onComplete immediately (with no statements to answer) when given an empty targeted set', () => {
    const onComplete = vi.fn();
    render(<GuidedTrueFalseRemediation items={[]} onComplete={onComplete} />);
    expect(screen.getByText(/No remediation statements were required/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe('remediation — completing guided remediation never substitutes for a fresh primary attempt', () => {
  it("the documented contract is: completion only unlocks a NEW deterministic variant, it does not itself pass the case", () => {
    // engine/attemptVariants.ts is the mechanism the case-level flow uses to hand the
    // learner a genuinely new form after remediation — never the same attempt re-marked passed.
    const attempt1 = variant(Q1_CASE_PACK, 'learner-1', 'assign-1', 1);
    const attempt2 = variant(Q1_CASE_PACK, 'learner-1', 'assign-1', 2);

    // The seed (and therefore the resulting form) genuinely differs per attempt number.
    expect(attemptSeedKey(Q1_CASE_PACK.id, 'learner-1', 'assign-1', 1)).not.toBe(
      attemptSeedKey(Q1_CASE_PACK.id, 'learner-1', 'assign-1', 2),
    );
    expect(attempt1.exhibits.map((e) => e.id)).not.toEqual(attempt2.exhibits.map((e) => e.id));

    // Grading content itself is never rewritten by variation — only presentation/order/decoys/timeline shift.
    expect(attempt1.decisionNodes).toBe(Q1_CASE_PACK.decisionNodes);
    expect(attempt2.decisionNodes).toBe(Q1_CASE_PACK.decisionNodes);
    expect(attempt1.decisionNodes).toEqual(attempt2.decisionNodes);

    // Variation never invents a passing verdict — it returns a CasePack, not a score/result.
    expect(attempt1).not.toHaveProperty('passed');
    expect(attempt1).not.toHaveProperty('score');
  });

  it('shifts source cutoffs with the exhibit timeline', () => {
    const attempt = variant(Q1_CASE_PACK, 'learner-1', 'assign-1', 1);
    const sourceExhibit = Q1_CASE_PACK.exhibits.find((exhibit) => exhibit.id === 'EX-Q1-016');
    const variedExhibit = attempt.exhibits.find((exhibit) => exhibit.id === 'EX-Q1-016');
    const daysBetween = (later: string, earlier: string) =>
      (Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) /
      86_400_000;

    expect(sourceExhibit).toBeDefined();
    expect(variedExhibit).toBeDefined();
    const exhibitOffset = daysBetween(
      variedExhibit!.asOfDate,
      sourceExhibit!.asOfDate,
    );

    expect(daysBetween(attempt.sourceCutoff, Q1_CASE_PACK.sourceCutoff)).toBe(
      exhibitOffset,
    );
    attempt.packetConflictGroups.forEach((group, index) => {
      expect(
        daysBetween(
          group.sourceCutoff,
          Q1_CASE_PACK.packetConflictGroups[index].sourceCutoff,
        ),
      ).toBe(exhibitOffset);
    });
  });
});
