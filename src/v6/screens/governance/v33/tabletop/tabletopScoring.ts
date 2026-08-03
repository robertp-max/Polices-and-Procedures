// Pure scoring for the final tabletop. The critical-error gate OVERRIDES the
// numeric score, and pass additionally requires all critical exhibits opened,
// all decisions made, and the transfer gate passed.

import { FINAL_TABLETOP, type TabletopCase, type TabletopOption } from './tabletopCase';

export interface TabletopSelections {
  decisions: Record<string, string>; // decisionId -> optionId
  surveyor: Record<string, string>;
  transferOptionId: string | null;
  inspectedExhibitIds: string[];
  attested: boolean;
}

export interface TabletopScore {
  earned: number;
  possible: number;
  scorePercent: number;
  criticalFailure: boolean;
  criticalReasons: string[];
  allCriticalExhibitsInspected: boolean;
  allDecisionsMade: boolean;
  transferPassed: boolean;
  passed: boolean;
}

function optionById(options: TabletopOption[], id: string | undefined): TabletopOption | undefined {
  return options.find((o) => o.id === id);
}

function maxPoints(options: TabletopOption[]): number {
  return options.reduce((m, o) => Math.max(m, o.points), 0);
}

export function scoreTabletop(sel: TabletopSelections, tcase: TabletopCase = FINAL_TABLETOP): TabletopScore {
  let earned = 0;
  let possible = 0;
  const criticalReasons: string[] = [];

  const consider = (options: TabletopOption[], chosenId: string | undefined, label: string) => {
    possible += maxPoints(options);
    const chosen = optionById(options, chosenId);
    if (chosen) {
      earned += chosen.points;
      if (chosen.criticalFailure) criticalReasons.push(label);
    }
  };

  for (const dec of tcase.decisions) consider(dec.options, sel.decisions[dec.id], `Decision ${dec.id}`);
  for (const q of tcase.surveyor) consider(q.options, sel.surveyor[q.id], `Surveyor ${q.id}`);
  consider(tcase.transfer.options, sel.transferOptionId ?? undefined, 'Transfer');

  const scorePercent = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  const allCriticalExhibitsInspected = tcase.exhibits
    .filter((e) => e.critical)
    .every((e) => sel.inspectedExhibitIds.includes(e.id));

  const allDecisionsMade =
    tcase.decisions.every((dec) => Boolean(sel.decisions[dec.id])) &&
    tcase.surveyor.every((q) => Boolean(sel.surveyor[q.id])) &&
    Boolean(sel.transferOptionId);

  const transferBest = maxPoints(tcase.transfer.options);
  const transferPassed = optionById(tcase.transfer.options, sel.transferOptionId ?? undefined)?.points === transferBest;

  const criticalFailure = criticalReasons.length > 0;

  const passed =
    scorePercent >= tcase.passScore &&
    !criticalFailure &&
    allCriticalExhibitsInspected &&
    allDecisionsMade &&
    transferPassed &&
    sel.attested;

  return {
    earned,
    possible,
    scorePercent,
    criticalFailure,
    criticalReasons,
    allCriticalExhibitsInspected,
    allDecisionsMade,
    transferPassed,
    passed,
  };
}
