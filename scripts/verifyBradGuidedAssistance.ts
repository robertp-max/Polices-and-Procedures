/**
 * verifyBradGuidedAssistance.ts
 * Vertical-slice verification for Brad Guided Assistance (event packet).
 *
 * Run: npx tsx --tsconfig tsconfig.app.json scripts/verifyBradGuidedAssistance.ts
 */
// localStorage shim (the guided tour store persists saved tours).
const __ls = new Map<string, string>();
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => (__ls.has(k) ? __ls.get(k)! : null),
  setItem: (k: string, v: string) => { __ls.set(k, v); },
  removeItem: (k: string) => { __ls.delete(k); },
};

import { classifyGuidedAssistance, applySlotAnswer, followUpQuestion } from '../src/v6/guided/guidedAssistanceClassifier';
import { buildEventPacketTour, eventPacketTourKey } from '../src/v6/guided/eventPacketTour';
import { rehearseGuidedTour, type RehearsalContext } from '../src/v6/guided/rehearsal';
import { getTourBuilder, TOURABLE_DOMAINS } from '../src/v6/guided/tourRegistry';
import type { GuidedStorePredicateId } from '../src/v6/guided/types';

const failures: string[] = [];
let passed = 0;
const check = (cond: unknown, msg: string) => { if (cond) passed++; else failures.push(msg); };

function rObservedComplete(result: { resolvedSteps: Array<{ stepId: string; alreadyComplete: boolean }> }, stepId: string): boolean {
  return result.resolvedSteps.find((x) => x.stepId === stepId)?.alreadyComplete === true;
}

async function main() {
  const { useGuidedTourStore } = await import('../src/v6/guided/guidedTourStore');

  console.log('=== Brad Guided Assistance — vertical slice verification ===\n');

  // 1) Intent detection.
  const guidedPrompts = [
    'show me how to generate event packet',
    'walk me through QAPI packet',
    'guide me to upload evidence',
    'how do i generate a survey packet',
    'teach me how to send a form for signature',
  ];
  for (const p of guidedPrompts) check(classifyGuidedAssistance(p) !== null, `intent should detect: "${p}"`);
  check(classifyGuidedAssistance('what is our qapi schedule') === null, 'non-guided question must NOT trigger guided');
  check(classifyGuidedAssistance('caregiver reported seeing son abusing her patient') === null, 'urgent prompt must NOT trigger guided');

  // Crash-regression: "guide me how to generate monthly qapi" must route to event_packet
  // (so it has slots to collect) and NEVER produce an empty-slot follow-up crash.
  const iMonthly = classifyGuidedAssistance('guide me how to generate monthly qapi')!;
  check(iMonthly?.domain === 'event_packet', 'monthly qapi routes to event_packet (not slotless general_navigation)');
  check(iMonthly?.collectedSlots.packet_type === 'qapi', 'qapi packet type extracted');
  check(iMonthly?.missingSlots[0]?.id === 'event', 'asks for the event next');
  // followUpQuestion must be crash-safe even with no slot.
  check(typeof followUpQuestion(undefined) === 'string', 'followUpQuestion(undefined) never throws');
  // A guided phrase with no actionable slots returns empty missingSlots + no launch
  // (BradWorkspace falls through to a normal answer instead of crashing).
  const iNav = classifyGuidedAssistance('take me to the dashboard');
  check(!iNav || (!iNav.shouldLaunchTour && iNav.missingSlots.length === 0), 'slotless guided intent has nothing to ask/launch (handled, not crashed)');

  // 2) Missing event asks follow-up.
  const i1 = classifyGuidedAssistance('show me how to generate event packet')!;
  check(i1.domain === 'event_packet', 'domain should be event_packet');
  check(i1.shouldAskFollowUp && !i1.shouldLaunchTour, 'missing slots → ask follow-up, do not launch');
  check(i1.missingSlots[0]?.id === 'event', 'first missing slot is the event');

  // 3) Missing packet type asks follow-up (after event provided).
  const i2 = applySlotAnswer(i1, 'evt-qapi-2026-q2');
  check((i2.collectedSlots.event as string) === 'evt-qapi-2026-q2', 'event slot captured from pasted ID');
  check(i2.shouldAskFollowUp && i2.missingSlots[0]?.id === 'packet_type', 'still missing packet_type → ask');

  // 4) All required slots → launch.
  const i3 = applySlotAnswer(i2, 'QAPI');
  check((i3.collectedSlots.packet_type as string) === 'qapi', 'packet_type captured');
  check(i3.shouldLaunchTour && i3.missingSlots.length === 0, 'all slots collected → shouldLaunchTour');

  // Packet type extracted directly from the prompt when present.
  const iQ = classifyGuidedAssistance('walk me through QAPI packet')!;
  check(iQ.collectedSlots.packet_type === 'qapi' && iQ.missingSlots[0]?.id === 'event', 'QAPI extracted, event still asked');

  // 5) Build + launch tour, then STRICT GATING.
  const store = useGuidedTourStore.getState();
  const key = eventPacketTourKey(i3.collectedSlots);
  const built = store.getOrCreateTour(key, () => buildEventPacketTour(i3.collectedSlots, '2026-06-26T00:00:00Z'));
  check(built.reused === false, 'first build is fresh (not reused)');
  check(built.tour.steps.length === 8, 'event-packet tour has 8 steps');
  store.launchTour(built.tour);

  check(useGuidedTourStore.getState().active === true, 'tour is active after launch');
  check(useGuidedTourStore.getState().currentStepIndex === 0, 'starts on step 1');

  // Step 2 cannot appear before Step 1 completes.
  const advancedBeforeValidate = useGuidedTourStore.getState().next();
  check(advancedBeforeValidate === false, 'next() refuses to advance before step 1 is validated');
  check(useGuidedTourStore.getState().currentStepIndex === 0, 'still on step 1 (gated)');

  // 6) Only current target + tour controls are interactive (others locked).
  const lock1 = useGuidedTourStore.getState().lockState();
  check(lock1.allowedSelectors.includes('[data-tour-target="nav.evidence"]'), 'step 1 allows the Evidence Studio target');
  check(lock1.allowedSelectors.includes('[data-tour-control]'), 'tour controls are always allowed');
  check(!lock1.allowedSelectors.includes('[data-tour-target="event.search"]'), 'step 2 target is NOT clickable during step 1');
  check(lock1.allowedSelectors.length === 2, 'exactly the current target + controls are unlocked');

  // Validate step 1 → advance to step 2.
  useGuidedTourStore.getState().markStepValidated();
  const advanced = useGuidedTourStore.getState().next();
  check(advanced === true && useGuidedTourStore.getState().currentStepIndex === 1, 'after validation, advances to step 2');
  const lock2 = useGuidedTourStore.getState().lockState();
  check(lock2.allowedSelectors.includes('[data-tour-target="event.search"]'), 'step 2 now unlocks the event selector');
  check(!lock2.allowedSelectors.includes('[data-tour-target="nav.evidence"]'), 'step 1 target is re-locked on step 2');

  // 7) Tour saved after generation.
  check(useGuidedTourStore.getState().getSavedTour(key) !== null, 'tour is saved for reuse');

  // 8) Same request reuses the saved tour.
  const again = useGuidedTourStore.getState().getOrCreateTour(key, () => buildEventPacketTour(i3.collectedSlots, '2026-06-26T00:00:00Z'));
  check(again.reused === true, 'same request reuses the saved tour');
  check(again.tour.id === built.tour.id, 'reused tour is the same instance');

  // Completion policy + gating invariants.
  check(built.tour.completionPolicy === 'strict_gated', 'completionPolicy is strict_gated');
  check(built.tour.steps.every((s) => s.canSkip === false && s.showNextOnlyAfterComplete === true), 'every step is gated + no-skip');

  // ── CO-PILOT structure: Brad auto-runs the safe steps, humans do the rest. ──
  check(built.tour.mode === 'copilot', 'event-packet tour runs in co-pilot mode');
  check(built.tour.steps[0].actor === 'brad' && built.tour.steps[0].autoAction?.kind === 'navigate', 'step 1 is Brad-auto: navigate to Evidence Studio');
  check(built.tour.steps[1].actor === 'brad' && built.tour.steps[1].autoAction?.kind === 'set_select', 'step 2 is Brad-auto: set the event');
  check(built.tour.steps.slice(2).every((s) => s.actor === 'human'), 'steps 3–8 are human checkpoints');
  check(built.tour.steps.slice(2).every((s) => s.waitFor.type === 'manual_confirm'), 'human checkpoints confirm manually (Brad never auto-uploads/signs/exports)');

  // ── REHEARSAL / PREFLIGHT regression tests ────────────────────────────────
  const tour = built.tour;
  const findOk = { found: true, visible: true, clickable: true, count: 1 };
  const notFound = { found: false, visible: false, clickable: false, count: 0 };
  const hidden = { found: true, visible: false, clickable: false, count: 1 };
  type Preds = Partial<Record<GuidedStorePredicateId, boolean | null>>;
  const makeCtx = (route: string, preds: Preds, probeMap: Record<string, typeof findOk>): RehearsalContext => ({
    currentRoute: route,
    probe: (sel) => probeMap[sel] ?? notFound,
    evalPredicate: (id) => (id in preds ? preds[id]! : null),
    routeReady: (r) => (r ? route.startsWith(r) : true),
  });
  const SEARCH = '[data-tour-target="event.search"]';
  const TEMPLATE = '[data-tour-target="event.packet-template"]';

  // event.search is the event selector (step 2), NOT the template card (step 3).
  const sStep2 = tour.steps.find((s) => s.id === 'step-2')!;
  const sStep3 = tour.steps.find((s) => s.id === 'step-3')!;
  check(sStep2.targetSelector === SEARCH, 'step 2 targets the event selector (event.search)');
  check(sStep3.targetSelector === TEMPLATE, 'step 3 targets the packet template');
  check(sStep2.targetSelector !== sStep3.targetSelector, 'event.search is NOT the template card');

  // Observed deadlock case: on Evidence Studio with the event already selected,
  // steps 1–2 auto-complete and the tour resumes at the first human checkpoint.
  const rObserved = rehearseGuidedTour(tour, makeCtx('/evidence', { event_workspace_visible: true, event_selected: true }, { [SEARCH]: findOk }));
  check(rObservedComplete(rObserved, 'step-1') && rObservedComplete(rObserved, 'step-2'), 'on Evidence Studio with the event set, steps 1–2 auto-complete');
  check(rObserved.startStepId === 'step-3', 'resumes at the first human checkpoint (no deadlock on the event step)');

  // Event not selected → resume at the Brad event step (event.search), anchored correctly.
  const rNoEvent = rehearseGuidedTour(tour, makeCtx('/evidence', { event_workspace_visible: true, event_selected: false }, { [SEARCH]: findOk }));
  check(rNoEvent.okToLaunch === true && rNoEvent.startStepId === 'step-2', 'event not selected → resume at the event step (event.search)');

  // Missing/hidden event target → rehearsal flags it (co-pilot never locks regardless).
  const rMissing = rehearseGuidedTour(tour, makeCtx('/evidence', { event_workspace_visible: true, event_selected: false }, { [SEARCH]: notFound }));
  check(rMissing.okToLaunch === false && rMissing.blockers[0]?.type === 'missing_target', 'missing event target → flagged, never a deadlock');

  const rHidden = rehearseGuidedTour(tour, makeCtx('/evidence', { event_workspace_visible: true, event_selected: false }, { [SEARCH]: hidden }));
  check(rHidden.okToLaunch === false && rHidden.blockers[0]?.type === 'hidden_target', 'hidden event target → flagged');

  // Fresh Brad page → begins at step 1 (Brad navigates to Evidence Studio).
  const rFresh = rehearseGuidedTour(tour, makeCtx('/iadministrator', {}, {}));
  check(rFresh.startStepId === 'step-1' && rFresh.okToLaunch === true, 'fresh start → begins at step 1');

  // Continue can be the highlighted/allowed target at its checkpoint.
  useGuidedTourStore.getState().launchTour(tour, 'step-7');
  const lock7 = useGuidedTourStore.getState().lockState();
  check(lock7.allowedSelectors.includes('[data-tour-target="event.continue"]'), 'Continue is the allowed/highlighted target at its step');
  useGuidedTourStore.getState().cancelTour();

  // 9) Recovery is never a trap: skipStep advances past an unavailable target.
  useGuidedTourStore.getState().launchTour(tour, 'step-3');
  const beforeSkip = useGuidedTourStore.getState().currentStepIndex;
  useGuidedTourStore.getState().skipStep();
  check(useGuidedTourStore.getState().currentStepIndex === beforeSkip + 1, 'skipStep advances past an unavailable target (never traps)');
  // skipStep on the last step ends the tour instead of trapping.
  useGuidedTourStore.getState().launchTour(tour, tour.steps[tour.steps.length - 1].id);
  useGuidedTourStore.getState().skipStep();
  check(useGuidedTourStore.getState().active === false, 'skipStep on the final step ends the tour cleanly');
  useGuidedTourStore.getState().cancelTour();

  // ── HELP CENTER THREAD + COMMUNITY tours (registry-driven, slotless) ──────
  // Registry resolves all three domains.
  check(TOURABLE_DOMAINS.has('event_packet') && TOURABLE_DOMAINS.has('help_thread') && TOURABLE_DOMAINS.has('community'), 'registry knows all three tourable domains');
  check(!!getTourBuilder('help_thread') && !!getTourBuilder('community'), 'help_thread + community have tour builders');
  check(getTourBuilder('general_navigation') === undefined, 'non-tourable domain has no builder');

  // Help Center thread intent → launches immediately (no required slots).
  const iThread = classifyGuidedAssistance('guide me to start a help center thread');
  check(iThread?.domain === 'help_thread', 'detects help_thread domain');
  check(iThread?.shouldLaunchTour === true && iThread?.missingSlots.length === 0, 'help_thread launches immediately (no slots to collect)');
  check(classifyGuidedAssistance('show me how to start a discussion')?.domain === 'help_thread', 'start a discussion → help_thread');

  // Community intent.
  const iComm = classifyGuidedAssistance('walk me through the community');
  check(iComm?.domain === 'community', 'detects community domain');
  check(iComm?.shouldLaunchTour === true, 'community launches immediately');
  check(classifyGuidedAssistance('take me to the community feed')?.domain === 'community', 'community feed → community');

  // Help-thread tour structure.
  const threadTour = getTourBuilder('help_thread')!.build({}, '2026-06-26T00:00:00Z');
  check(threadTour.mode === 'copilot' && threadTour.steps.length === 4, 'help_thread tour: 4 co-pilot steps');
  check(threadTour.steps[0].actor === 'brad' && threadTour.steps[0].autoAction?.kind === 'navigate', 'help_thread step 1: Brad navigates');
  check((threadTour.steps[0].autoAction as { route?: string }).route === '/help/threads', 'help_thread navigates to /help/threads');
  check(threadTour.steps.slice(1).every((s) => s.actor === 'human' && s.waitFor.type === 'manual_confirm'), 'help_thread steps 2–4 are human checkpoints');
  check(threadTour.steps.some((s) => s.targetSelector === '[data-tour-target="thread.start"]') && threadTour.steps.some((s) => s.targetSelector === '[data-tour-target="thread.post"]'), 'help_thread targets the real Start/Post controls');

  // Community tour structure.
  const commTour = getTourBuilder('community')!.build({}, '2026-06-26T00:00:00Z');
  check(commTour.mode === 'copilot' && commTour.steps.length === 4, 'community tour: 4 co-pilot steps');
  check(commTour.steps[0].actor === 'brad' && (commTour.steps[0].autoAction as { route?: string }).route === '/help/threads', 'community step 1: Brad opens the community discussions');
  check(commTour.steps.some((s) => s.targetSelector === '[data-tour-target="nav.profile"]'), 'community includes the profile (me :)) step');

  // Rehearsal for a slotless thread tour: on Brad page → starts at step 1 (Brad navigates).
  const rThread = rehearseGuidedTour(threadTour, makeCtx('/iadministrator', {}, {}));
  check(rThread.startStepId === 'step-1' && rThread.okToLaunch === true, 'help_thread rehearsal → starts at step 1');
  // Already on /help/threads → step 1 auto-completes, resumes at the human checkpoint.
  const rThreadOnPage = rehearseGuidedTour(threadTour, makeCtx('/help/threads', {}, { '[data-tour-target="thread.start"]': findOk }));
  check(rObservedComplete(rThreadOnPage, 'step-1') && rThreadOnPage.startStepId === 'step-2', 'already on /help/threads → resumes at start-a-thread');

  console.log(`\n=== ${passed} checks passed, ${failures.length} failed ===`);
  if (failures.length) { failures.forEach((f) => console.log('  - ' + f)); process.exit(1); }
  console.log('\nALL GUIDED-ASSISTANCE CHECKS PASSED.');
}

main().catch((e) => { console.error(e); process.exit(1); });
