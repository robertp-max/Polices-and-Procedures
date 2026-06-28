import type { GuidedTour, GuidedTourRehearsalResult, GuidedStorePredicateId } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Guided tour rehearsal / preflight.
   ----------------------------------------------------------------------------
   Runs BEFORE a tour is launched or any lock overlay appears. It walks every
   step against the CURRENT screen state and decides:
     • which steps are already complete (auto-advanced before locking),
     • the first incomplete, valid step to start at,
     • whether that start step's target is actually present, visible, and
       clickable (so we never lock the screen pointing at a missing/hidden/
       iframe-internal control).

   Pure + deterministic: all environment access is injected via RehearsalContext,
   so it runs identically in the browser and in headless tests.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface RehearsalContext {
  currentRoute: string;
  /** Resolve a CSS selector in the parent document. */
  probe: (selector: string) => { found: boolean; visible: boolean; clickable: boolean; count: number };
  /** Evaluate a store/DOM predicate. Return null when it cannot be determined. */
  evalPredicate: (id: GuidedStorePredicateId, args?: Record<string, unknown>) => boolean | null;
  /** Whether the given route prefix is the active route. */
  routeReady: (route?: string) => boolean;
}

function isStepAlreadyComplete(
  step: GuidedTour['steps'][number],
  ctx: RehearsalContext,
): boolean {
  const ac = step.autoCompleteWhen;
  if (ac?.route && ctx.routeReady(ac.route)) return true;
  const predicate = ac?.predicate
    ?? (step.waitFor.type === 'store_predicate' ? step.waitFor.predicateId as GuidedStorePredicateId : undefined);
  if (predicate) {
    const v = ctx.evalPredicate(predicate);
    if (v === true) return true;
  }
  return false;
}

/**
 * Rehearse a tour against the current screen. Never mutates anything, never
 * locks the UI. Returns the first incomplete valid start step + blockers.
 */
export function rehearseGuidedTour(tour: GuidedTour, ctx: RehearsalContext): GuidedTourRehearsalResult {
  const resolvedSteps: GuidedTourRehearsalResult['resolvedSteps'] = [];
  const blockers: GuidedTourRehearsalResult['blockers'] = [];

  let startStepId: string | null = null;
  let okToLaunch = false;

  for (const step of tour.steps) {
    const probe = ctx.probe(step.targetSelector);
    const alreadyComplete = isStepAlreadyComplete(step, ctx);
    const routeReady = step.route ? ctx.routeReady(step.route) : true;

    resolvedSteps.push({
      stepId: step.id,
      targetSelector: step.targetSelector,
      resolvedElementFound: probe.found,
      visible: probe.visible,
      clickable: probe.clickable,
      alreadyComplete,
      routeReady,
      reason: probe.count > 1 ? 'ambiguous_selector' : undefined,
    });
  }

  // First incomplete step is where we want to start.
  const firstIncomplete = tour.steps.find((s) => {
    const r = resolvedSteps.find((x) => x.stepId === s.id)!;
    return !r.alreadyComplete;
  });

  if (!firstIncomplete) {
    // Everything is already done — nothing to guide.
    const last = tour.steps[tour.steps.length - 1];
    blockers.push({ stepId: last.id, type: 'already_complete', message: 'Every step is already complete — nothing to guide.' });
    return { okToLaunch: false, startStepId: null, resolvedSteps, blockers };
  }

  startStepId = firstIncomplete.id;
  const r = resolvedSteps.find((x) => x.stepId === firstIncomplete.id)!;

  // Navigation steps: their target appears once the tour activates (e.g. the dock
  // is force-shown). Don't block on it being present right now.
  if (firstIncomplete.navStep) {
    okToLaunch = true;
  } else if (firstIncomplete.frameScoped) {
    // Target lives inside an embedded studio iframe — not anchorable from the
    // parent. Do NOT launch a locked tour; the runner shows a hand-off instead.
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'missing_target', message: 'The next step happens inside the Studio panel, which the tour can’t lock onto. Continue there directly.' });
  } else if (r.reason === 'ambiguous_selector') {
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'ambiguous_selector', message: `The target “${firstIncomplete.targetSelector}” matched more than one element.` });
  } else if (!r.routeReady) {
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'route_not_ready', message: 'The screen for this step isn’t open yet.' });
  } else if (!r.resolvedElementFound) {
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'missing_target', message: `I couldn’t find the target for “${firstIncomplete.title}”.` });
  } else if (!r.visible) {
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'hidden_target', message: `The target for “${firstIncomplete.title}” isn’t visible yet.` });
  } else if (!r.clickable) {
    okToLaunch = false;
    blockers.push({ stepId: firstIncomplete.id, type: 'not_clickable', message: `The target for “${firstIncomplete.title}” isn’t interactable yet.` });
  } else {
    okToLaunch = true;
  }

  return { okToLaunch, startStepId, resolvedSteps, blockers };
}
