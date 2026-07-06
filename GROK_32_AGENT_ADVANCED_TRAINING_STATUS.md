# GROK_32_AGENT_ADVANCED_TRAINING_STATUS.md

**Date:** 2026-06-30  
**Mode:** Local repo review only (per override). No web fetches or external GitHub MCP used for remote inspection.  
**Role:** 32-agent coordinator (4 teams × 8 agents) — inventory, content, compliance, UI/UX, integration, QA.  
**Mission:** Integrate 4 training repos into host Journey Advanced Training (ADV track) while preserving ≥97% existing Journey UX/flow. Replace Gemini generic UI shells with domain-specific clinical training experiences. Add GAO-03 and GAO-04.

## 1. Local Accessibility Summary

| Repo | Local Path | Accessible? | Notes |
|------|------------|-------------|-------|
| Host (Care Indeed CI-ION Journey) | `c:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` | YES | Current workspace. Vite + TS + React app with full `src/policy/journey/*` |
| TEAM 1: CMS-485 Plan of Care | `C:\AI\Git\training\CI-ION\CI-ION_CMS-485_Plan_of_Care` | YES | Full tree, src/, dist/ SCORM, node_modules, package.json |
| TEAM 2: CMS Documentation Matters Toolkit | `C:\AI\Git\training\CI-ION\CI-ION_CMS-Documentation-Matters-Toolkit` | YES | Full tree (large), src/ with simulator, narration.csv + 153+ wav, many patch scripts |
| TEAM 3: OASIS-E2 SOC | `C:\AI\Git\training\CI-ION\CI-ION_OASIS-E2_SOC` | YES | Full tree, massive src/content/ (~1176 wav), data/, simulator |
| TEAM 4: QAPI Training | `C:\AI\Git\training\CI-ION\CI-ION_Qaulity_Assurance_and_Process_Improvement copy` | YES | Full tree (note spelling "Qaulity" + trailing space in dir name), src/, dist/, assets ~258 wav + csv |

All 4 training repos + host are **fully accessible on local FS**. No network dependency required for review.

## 2. Git / Branch / Commit Status

- **Host**: From session git_status snapshot + verification: branch `def2-alpha-admission-pagination`, working tree clean at start. (Shell git -C commands encountered pwsh quoting/parsing issues on long/externals paths with spaces; dot-directories hidden by list_dir.)
- **Training repos**: .git directories hidden (list_dir omits dots). Terminal attempts limited. All present as complete working trees with `package-lock.json`, `dist/`, and build artifacts. No indication of uncommitted destructive state. Assume current HEAD for content review.

**Recommendation**: Manual `git status` / `git log -1` per repo if commit hashes needed for patching.

## 3. Framework / Package Manager / Build

All projects (host + 4):
- **Package manager**: npm (package-lock.json present)
- **Framework**: Vite + TypeScript + React
- **Host specifics**: `ci-policy-app`, rich scripts (`npm run build`, `npm run lint`, `npm run test`, many verify:*, prebuild cleanEmittedJs), server/ side, Tailwind, `lucide-react@^1.7.0` (good — matches training repos).
- **CMS-485 repo**: `ciion-cms485-plan-of-care`, React 18, Vite 7, Tailwind 4, framer-motion, react-router-dom, lucide-react. Scripts: dev (port 5190), build, build:scorm.
- **Documentation Matters repo**: name `oasis-simulator` (reused), React 19, Vite, Tailwind 3, gradflow, lucide. Heavy patch/fix cjs scripts + narration audit.
- **OASIS-E2 repo**: name `oasis-simulator`, React 19, similar to Doc Matters. Enormous audio + data.
- **QAPI repo**: `ciion-qapi-training`, React 18 (matches CMS-485), same deps as CMS-485 repo, dev on 5191.
- **Common in training**: SCORM packaging scripts, dist/ with imsmanifest + index.html + audio bundles, many iterative patch*.js/cjs + QA/UAT reports.

**Host validation commands available**: `npm run build`, `npm run lint`, `npm run test`, typecheck via tsc-b, etc. (per AGENTS.md: use `npm run build` or `npx tsc -b` — never bare tsc that emits .js).

## 4. Gemini Work Detection (Evidence Paths)

**YES — detected in multiple places.**

Host (Gemini-started partial integration):
- `src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts` — ModuleDef + lessons + cards with full narration_script/transcript_text.
- `src/policy/journey/data/advancedTraining/qapi.data.ts` — Similar structure.
- `src/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data.ts` — ClinicalCase simulator model (fields, options, rationales).
- `src/policy/journey/data/contentV2Adapter.ts` — Special handling for "cms-485" / "qapi", custom assessments.
- `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx` — ADV track definition, moduleIds: ["cms-485","qapi"], completionGate text, TrainingModule defs.
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx` — Special "Advanced Training" labels + passed text for cms-485/qapi.
- `src/v6/screens/pageviews/Cms485AssessmentQuizPage.tsx` — Dedicated quiz/case page importing cases.
- `src/policy/journey/data/cms485AudioLocations.ts` — Partial audio map.

Training repos (source of Gemini generic UI + rich content):
- CMS-485: `builder (add to gitignore)/`, `COMPREHENSIVE_UPDATE_REPORT.md`, `QA_REPORT.md`, `UAT_REPORT.md`, `src/components/`, `src/features/`, `src/data/`, SCORM zip.
- Documentation: `_legacy/`, dozens of `patch*.js`, `fix_*.cjs`, `reports/`, `narration.csv`, `src/components/simulator/`, `src/content/narration-scripts.csv`, PracticeLab etc.
- OASIS: `BUILDER/`, many patch/fix cjs, `reports/`, huge `src/content/`, `src/data/`, UAT/QA reports.
- QAPI: `dist/branding/`, scripts/, src/components + features + data.

**Gemini pattern observed**: Identical generic shell/card/player + simulator UI across CMS-485 and QAPI standalone apps (and mirrored in host ADV injection). Not domain-specialized. This is the problem to fix per spec.

## 5. Narration / Mapping / Content Detection

- **All 4 repos contain narration + mapping artifacts**:
  - CMS-485: `src/assets/` (~160 .wav), data files, cards in host already reference mapped narrations.
  - Doc Matters: `src/content/narration-scripts.csv`, `narration-audio/`, `data/narrationTextMap.ts`, 153+ wav under Documentation_Matters/.
  - OASIS-E2: `src/content/` (1176 .wav + txt), data/*.md, reports/rationale csvs, narration manifests in legacy.
  - QAPI: `src/assets/` (258 .wav + 1 .csv), data/.
- Host already has partial mapped cards for cms-485/qapi with `narration_script`, `transcript_text`, `estimated_narration_seconds`, `cards[]`.
- Evidence: cards in cms485PlanOfCare.data.ts and qapi.data.ts preserve exact narration text (must not alter unless documented typo).
- Simulator/final cases present in CMS-485 repo (builder final exam md + host cases.data.ts) and likely mirrored in others.

**Preservation rule**: Exact narration-to-card mapping must be recorded in CONTENT_MAP.md. Preserve text unless defect proven.

## 6. Host Journey Architecture Snapshot (to Preserve)

- Core preserved surfaces (per mission): JourneyHomePage / ModulePlayerPage / ScormPlayer / EvidenceCapture / GateBanner / PhaseRail / ModuleCard / StatusChip / journeyStore / modules catalog / gating.ts / escalation.ts / types.
- Data model (lessonModel.ts): `ModuleDef`, `ModuleLesson` (with `cards?`, transcript, knowledgeCheck), `ModuleDef.lessons[]`.
- Advanced injected via adapter + special LMS track "ADV".
- Current ADV landing (in CareIndeedOnboardingLMS.tsx): track definition with name "Advanced Training", subtitle "Specialized Compliance & Plan of Care • Reports to Clinical Manager / DON", completionGate, 2 modules.
- Stats on cards (inferred): % Complete, Questions, Best Score (from user query description; to be verified in UI render).
- No-PHI footer warning present in context.
- Existing modules use consistent Journey store completion, evidence, signature gates.
- **Risk**: ADV modules currently use generic player treatment + special quiz page. Must keep route/launch/store contracts identical.

**97%+ UX preservation mandate**: Same cards list, launch, progress, scoring, prerequisite/gate semantics, evidence output. Only inner player panels + landing card micro-layouts may specialize.

## 7. Immediate Blockers / Risks

1. Current integration limited to 2 modules (cms-485, qapi). OASIS + Documentation content must be extracted cleanly into same model.
2. Generic identical UI shell in Gemini work for CMS-485 + QAPI — must be superseded with 4 distinct variants:
   - plan_of_care (form traceability cockpit)
   - qapi_board (KPI / PIP / RCA)
   - oasis_lab (item coding + evidence decision)
   - documentation_lab (note comparison / surveyor lens)
3. Large audio volume + different bundling in repos vs host audio manifest strategy.
4. Shell command quoting issues for external paths (use list_dir/read_file/grep for inventory).
5. React 18 vs 19 + extra libs (framer/gradflow) in training repos — **port only content/data**, reuse host Journey components + lucide.
6. Catalog currently uses numeric GAO-00x for orientation; proposed GAO-01..04 for advanced must not collide or require renumbering unless justified.
7. Must define policyRefs, workflowId, eventId, evidenceOutput, passThreshold per module.
8. No PHI — confirmed in all reviewed data (demo names only).
9. Build hygiene (AGENTS.md): never emit .js under src/.

## 8. Next Action Per Team (Do Not Implement Yet)

- **Every team**: Immediately produce the 6 required artifacts using actual file reads as evidence:
  1. REPO_INVENTORY.md (file tree summary, framework, scripts, Gemini files, risks)
  2. CONTENT_MAP.md (exact lessons/cards/narrations/quizzes/cases with source paths + thresholds)
  3. COMPLIANCE_TRACEABILITY.md (policyRefs, workflow/event ids, evidence, supervisor implications)
  4. UI_FINDINGS.md (what Gemini built, generic flaws, proposed domain-specific treatment)
  5. IMPLEMENTATION_PLAN.md (exact host files to edit/add, data model, no breaking changes)
  6. PATCH_PLAN.md (ordered minimal steps, types, acceptance commands)

- **TEAM 1 (CMS-485)**: Start with host advancedTraining/cms* + repo src/data + builder final exam + cases. Map simulator logic.
- **TEAM 2 (Doc Matters)**: Focus on narration.csv + simulator components + defensibility scenarios. UI = documentation review lab.
- **TEAM 3 (OASIS-E2)**: SOC assessment flow, GG/wound/behavior items, item rationales. UI = OASIS decision lab.
- **TEAM 4 (QAPI)**: QAPI data model, PIP/RCA, indicators. UI = command board.

**Cross-team**: All must reference host `src/policy/journey/*`, `src/v6/screens/pageviews/*` (LMS + player), lessonModel, journeyStore, types. Check against existing ADV injection.

**Global next after status**: Produce per-team reports (in parallel where possible via structured review). Only after all 6-per-team complete, synthesize `ADVANCED_TRAINING_INTEGRATION_MASTER_PLAN.md`.

## 9. Host Validation Readiness

- `npm run build` / `npm run lint` / `npm run test` available.
- Existing journey tests and verify scripts (e.g. validateJourneyRefs.ts etc.).
- Acceptance will require: no breakage to non-ADV modules, same stats visible, gates intact, build clean, narration fidelity.

**Status**: Ready for team-by-team deep inventory + mapping. No code changes or new files until reports complete.

---
*Evidence collected via list_dir, read_file (packages, data, lessonModel, cases, LMS excerpts, modules catalog), grep. All findings traceable to listed paths.*
