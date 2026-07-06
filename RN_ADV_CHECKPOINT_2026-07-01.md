# RN Advanced Training Runtime Recovery — Checkpoint 2026-07-01

**Session Date:** 2026-07-01  
**Branch:** def2-alpha-admission-pagination  
**HEAD:** 2b65e95f492d3c49a9df85e196e4fb3411a9520e (from tool output)  
**Purpose of this checkpoint:** Pause point. Ready to resume tomorrow with full runtime fix + QA loop.

## Git State at Checkpoint
- Working tree has many modified + untracked files (normal for active recovery).
- Key modified in journey:
  - src/policy/journey/data/contentV2Adapter.ts
  - src/v6/screens/pageviews/ModulePlayerScreen.tsx (hook order fix + dispatch + stub)
  - src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx (RN-ADV naming + module registration)
  - src/v6/screens/pageviews/JourneyOverviewScreen.tsx (LearnerProvider safety wrap)
- New ADV components + data:
  - src/policy/journey/components/advanced/ (5 files)
  - src/policy/journey/data/advancedTraining/ (contract + oasis + doc data)
- Many RN_ADV_* and UAT_* report files created during this session.

**To restore exact state tomorrow:**
```powershell
cd "c:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2"
git status --short
git diff --name-status
git diff --stat
```

## Current Runtime Status (End of Session)
**P0 Issues targeted in this session:**
- Hook order violation in ModulePlayerScreen → **Hoisted useMemo** (partial fix applied)
- Unknown module for "documentation-matters" → **Bypass + journeyMod stub** added for ADV IDs
- useLearner outside LearnerProvider → **Extra LearnerProvider wrapper** in JourneyOverviewScreen
- undefined.length crashes → **Early ADV dispatch** in element memo + ensured pages/exam arrays in module defs
- GAO naming pollution in ADV UI → **Replaced with RN-ADV-0x** in panels + track label updated to "Advanced Training — RN Clinical"

**Evidence artifacts:**
- All 4 panels now emit full contract (policy_id, workflow_id, event_id, module_id, learner_id, timestamp, assessment_score, completion_artifact_type, noPhi: true) + camelCase aliases.

**Known remaining at pause:**
- Full build/lint/test not cleanly captured in last runs due to shell command quirks in the environment.
- Content for RN-ADV-03 and RN-ADV-04 is still lightweight (basic pages + lab UI) — content expansion from source repos is lower priority until runtime is solid.
- No real browser runtime verification done in this chat (only code inspection + command outputs).

## Key Files to Review Tomorrow
### Core Code
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx` — hook ordering, ADV dispatch, unknown module guard
- `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx` — ADV track, moduleIds, MODULE_MAP, card rendering
- `src/v6/screens/pageviews/JourneyOverviewScreen.tsx` — LearnerProvider safety
- `src/policy/journey/components/advanced/` — all 5 panel + player files
- `src/policy/journey/data/advancedTraining/advancedTrainingContract.ts`
- `src/policy/journey/data/contentV2Adapter.ts`

### Reports & Checkpoints (read these first tomorrow)
- `RN_ADV_CHECKPOINT_2026-07-01.md` (this file)
- `RN_ADV_RUNTIME_RECOVERY_REPORT.md`
- `RN_ADV_DEFECT_LEDGER.md`
- `RN_ADV_QA_RUN_LOG.md`
- `RN_ADV_EVIDENCE_INDEX.md`
- `RN_ADV_PASS_01_REPORT.md`
- Per-module: `RN_ADV_01_CMS_485_QA.md` etc.
- Older but relevant: `POST_QA_LOOP_TRIGGER.md`, `UAT_CHECKPOINT_2026-07-01.md`

## Recommended Resume Sequence Tomorrow
1. `git status --short`
2. `git diff --name-status`
3. Re-run the required validation block:
   ```powershell
   git branch --show-current
   git rev-parse HEAD
   git status --short
   git diff --name-status
   git diff --stat
   git diff --check

   npm run build > rnadv-resume-build.log 2>&1; echo "BUILD EXIT: $LASTEXITCODE"; Get-Content rnadv-resume-build.log -Tail 80

   npm run lint > rnadv-resume-lint.log 2>&1; echo "LINT EXIT: $LASTEXITCODE"; Get-Content rnadv-resume-lint.log -Tail 100

   npm test > rnadv-resume-test.log 2>&1; echo "TEST EXIT: $LASTEXITCODE"; Get-Content rnadv-resume-test.log -Tail 100
   ```
4. Start dev server: `npm run dev`
5. Manually verify routes in browser:
   - /journey
   - /journey/module/cms-485
   - /journey/module/qapi
   - /journey/module/oasis-e2-soc
   - /journey/module/documentation-matters
   - /journey/supervisor
   - /journey/admin
   - /journey/guide
6. Run the red-flag searches listed in the recovery prompt.
7. Continue the 32-agent style worker + QA loop until P0=0 and P1=0.

## Quick Mental Map for Tomorrow
- Primary goal remains **runtime stability** first (no crashes, all 4 routes render the correct domain UI, no hook/provider errors).
- Use the existing non-ADV modules as the shape reference.
- Keep route IDs as `cms-485`, `qapi`, `oasis-e2-soc`, `documentation-matters` (do not rename routes unless we also add compatibility).
- Visible labels = RN-ADV-01 etc.
- Track name = "Advanced Training — RN Clinical"

## Next Immediate Priorities (when resuming)
1. Ensure zero hook-order errors in ModulePlayerScreen (hoist or refactor into sub-component if still flaky).
2. Guarantee all four RN-ADV modules resolve in the exact catalog that ModulePlayerScreen + unknown-module guard use.
3. Confirm LearnerProvider is always an ancestor for /journey paths.
4. Make sure artifact objects always contain the full required evidence contract on every completion path.
5. Remove any remaining "GAO-" or old naming from ADV-specific UI strings.
6. Produce clean build + lint + test logs with exit codes.
7. Capture actual runtime evidence (console + titles + "screenshots").

---

**Ready to resume tomorrow.**  
Just say the word and we'll pick up exactly from here with the next pass. Good work today. 

Checkpoint created: `RN_ADV_CHECKPOINT_2026-07-01.md` (this file) + all the RN_ADV_* reports.