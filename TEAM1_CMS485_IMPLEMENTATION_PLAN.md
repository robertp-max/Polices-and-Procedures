# TEAM 1 — CMS-485 IMPLEMENTATION_PLAN.md

## Exact Host App Files to Edit / Add

**Edit (minimal, typed)**:
- `src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts` — extend lessons/cards if needed from repo trainingCards; ensure narration exact.
- `src/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data.ts` — align pass threshold / add rationale flags if needed.
- `src/policy/journey/data/contentV2Adapter.ts` — keep special case for "cms-485"; extend assessment if hybrid.
- `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx` — expand ADV track moduleIds to include new when ready; update gate text if multi; update TrainingModule def for cms-485 (add code: 'GAO-01', uiVariant, duration etc per data contract).
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx` — route "cms-485" to new domain player or pass variant.
- `src/policy/journey/data/modules.ts` (or adapter) — consider exposing GAO-01 alias for catalog if required.
- `src/policy/journey/types/journey.ts` — optional: extend JourneyModule with optional `uiVariant?: 'plan_of_care' | ...` or use separate AdvancedTrainingModule.
- Journey components / lib if new shared shell needed.

**New files (small, scoped)**:
- `src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx` (shared shell for all 4 ADV)
- `src/policy/journey/components/advanced/PlanOfCareSimulatorPanel.tsx` (or inside player with variant switch)
- `src/policy/journey/data/advancedTraining/cms485NarrationMap.ts` (if audio needs better manifest)
- Possibly update `src/policy/journey/lib/` or stores for simulator state (prefer reuse learnerState / moduleProgress).

**Do NOT edit**:
- Core journeyStore.ts contract (add only via existing startAttempt/finalize etc).
- gating.ts, escalation.ts (unless minimal justified extension).
- Non-ADV GAO modules or other phases.
- Existing routes / ModuleCard / StatusChip.

## Data Model Additions

Extend or add:

```ts
// In journey types or new advancedTraining/types.ts
export type AdvancedTrainingModule = {
  id: string;
  code: 'GAO-01' | 'GAO-02' | 'GAO-03' | 'GAO-04';
  // ... (per user query spec)
  uiVariant: 'plan_of_care' | ...;
  assessmentType: 'simulator';
  passThreshold: 80;
  evidenceOutput: string[];
  narrationMapStatus: 'verified';
};
```

Update cms485 moduleDef with simulatorCases: ['case-1-henderson', ...], pocTraceFields.

Use existing ModuleLesson + cards for lessons; special simulator for final.

## Journey Module Catalog Patch

- Keep id "cms-485" for compat.
- Add/alias "GAO-01".
- Inject in adapter under ADV.
- Update ADV track in LMS.tsx : moduleIds push if expanding.

## Component Plan

1. Shared AdvancedTrainingPlayer (replaces generic for ADV ids).
2. Variant switch: if uiVariant==='plan_of_care' render POC specific center/right panels using repo FinalExamShell logic (adapted, no framer if possible).
3. Reuse: StatusChip, GateBanner, EvidenceCapture, SignaturePad from Journey.
4. New miniature visuals only on landing cards (CSS or small SVG/ lucide).

## Routing Impact

- None to existing Journey routes. ADV still launched from LMS or JourneyHome via existing module launch.
- Player receives moduleId and variant.

## Tests

- Unit: scoring alignment (repo engine vs host adapter).
- Integration: launch cms-485 → view cards → complete simulator → score + evidence recorded → gate satisfied.
- Regression: other modules unaffected (use existing verify scripts).
- Narration: snapshot test on first card transcript.
- Build: `npm run build`

## Rollback Plan

- Keep old cms485 data + quiz page behind flag or git revert of ADV-specific edits.
- Revert adapter special case to previous.
- No data loss (progress in store keyed by moduleId).

## Dependencies / Validation

- lucide-react already in host.
- TypeScript strict (existing).
- No new deps preferred.

**Acceptance commands**: npm run build && npm run lint && npm run test (or relevant journey tests).
