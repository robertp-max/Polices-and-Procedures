# TEAM 1 — CMS-485 PATCH_PLAN.md

## Ordered Patch Steps (Minimal, Non-Destructive)

1. **Audit current** (already done)
   - Confirm no .js emitted in src.
   - Run `npm run build` baseline (record result).

2. **Data fidelity**
   - Read full trainingCards.ts + case files from repo; diff vs host data.
   - Patch host cms485PlanOfCare.data.ts ONLY for missing lessons/cards or exact text alignment (preserve narrations).
   - Update cms485PlanOfCareCases.data.ts passThreshold comment + add rationaleRequired flag (no breaking change).

3. **Catalog / adapter (small)**
   - In contentV2Adapter.ts: ensure cms-485 returns correct assessment with simulator flag.
   - Add uiVariant and code 'GAO-01' to the injected module metadata (non-breaking for existing callers).

4. **LMS landing (ADV track)**
   - In CareIndeedOnboardingLMS.tsx: update cms485OnboardingModule with code, duration, questionCount (3 cases), simulator: true, policyRefs, evidenceOutput.
   - Update completionGate if generalized.
   - Add visual metadata chips scaffolding (non-visual first).

5. **Shared player shell (new)**
   - Add `src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx` (shell: header, rail, center, right, bottom). Initially pass-through for cms-485.
   - Wire in ModulePlayerScreen or LMS for moduleId === 'cms-485' || 'qapi' etc to use it (feature flag or direct).

6. **Domain panel for plan_of_care**
   - Add POC specific panel (adapted from repo FinalExamShell + CMS485Form + EvidencePanel logic — pure TSX, reuse types).
   - Implement field selection + mandatory rationale before final score.
   - Connect to Journey attempt finalize + evidence.

7. **Landing card variant**
   - In LMS ADV section or dedicated AdvancedTrainingHome: render differentiated card for GAO-01 (trace line visual, chips).
   - Keep existing % / Questions / Best Score.

8. **Audio / media**
   - Ensure cms485 audio locations map or embed narration playback using existing Journey audio if any, or static assets.

9. **Gates / evidence**
   - Verify finalize produces JourneyEvidence for ADV.
   - Confirm supervisor gate still applies.

10. **Tests + validate**
    - Add minimal test for case scoring alignment.
    - `npm run lint && npm run build`
    - Manual: launch ADV cms-485 card, complete flow, check stats + gate.

## Minimal Diffs Expected

- Small extensions in existing .ts data files (add fields).
- 1-2 new small component files under journey/components/advanced/ (import only when ADV).
- No changes to journeyStore.ts, core types unless additive optional.
- No route changes.

## Expected TypeScript Types

- Reuse ModuleDef, ModuleLesson, ClinicalCase (extend CaseField with rationaleReviewed?).
- New: type PlayerVariant = 'plan_of_care' | ...

## Import Paths

- `@/policy/journey/data/advancedTraining/...`
- `@/policy/journey/components/advanced/...`
- Keep `@/policy/journey/stores/journeyStore`

## Acceptance Commands (no destructive)

```bash
npm run build
npm run lint
npm run test -- --grep "journey|cms485|advanced" || echo "no specific test match"
npx tsc -b --noEmit   # or per AGENTS.md
```

Run after each logical step. Verify no PHI, no emitted .js.

## Rollback

- Git revert of the patch commit(s).
- Or conditional on ADV feature flag (if introduced).

**Note**: Do not delete any Gemini files (advancedTraining/* or Cms485AssessmentQuizPage) until new player verified and archived.

**Status**: Patch plan minimal and reversible. Ready for execution after all teams' plans reviewed.
