# TEAM 1 — CMS-485 PLAN OF CARE REPO INVENTORY.md

**Team**: 1 (CMS-485 Plan of Care and Compliance Integration)  
**Repo**: C:\AI\Git\training\CI-ION\CI-ION_CMS-485_Plan_of_Care  
**GitHub**: https://github.com/robertp-max/CI-ION_CMS-485_Plan_of_Care.git (local only review)  
**Date reviewed**: 2026-06-30  
**Agent roles exercised**: Repo inventory, Content extraction (partial), UI/UX fit, Data model, Simulation, QA notes.

## File Tree Summary (Evidence from list_dir + reads)

```
C:\AI\Git\training\CI-ION\CI-ION_CMS-485_Plan_of_Care\
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── public/ (logos, favicon, imsmanifest.xml, assets images)
├── dist/ (built SCORM: index.html, assets/*.wav + *.js + *.css, CIION_CMS-485..._SCORM_v1.0.0.zip)
├── src/
│   ├── App.tsx, main.tsx, index.css, vite-env.d.ts
│   ├── assets/ (~160 *.wav narration audio)
│   ├── components/ (20 files)
│   │   ├── AudioPlayer.tsx, Layout*.tsx, ModuleView.tsx, HomeView.tsx, SplashView.tsx
│   │   ├── AuditWorkspace.tsx, ComprehensiveSummaryView.tsx, ExamDashboard.tsx
│   │   ├── FinalResults.tsx, Practice*.tsx, ScenarioSummary.tsx, ModuleSummaryView.tsx
│   │   └── SilkBackground.tsx, TravelightBG.tsx, ErrorBoundary.tsx, HelpDesk.tsx, DebugPanel.tsx
│   ├── data/
│   │   ├── trainingCards.ts          (core lesson cards: sections + challenges)
│   │   ├── additionalContent.generated.ts
│   │   ├── practiceData.ts           (PatientData, FormPart, options)
│   │   ├── terminology.ts
│   │   └── helpArticles.ts
│   ├── features/
│   │   └── final-exam/               (SIMULATOR CORE - domain specific)
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── data/
│   │       │   ├── case1-henderson.ts, case2-alvarez.ts, case3-okafor.ts, index.ts
│   │       ├── components/
│   │       │   ├── FinalExamShell.tsx, CMS485Form.tsx, EvidencePanel.tsx
│   │       │   ├── FieldModal.tsx, ExamResults.tsx, ReviewMode.tsx, CaseSelector.tsx, RationaleReviewModal.tsx
│   │       └── engine/
│   │           ├── scoring.ts (PASSING_THRESHOLD=80, domains, analytics)
│   │           └── analytics.ts
│   ├── hooks/
│   └── utils/
├── scripts/
│   ├── build-scorm.mjs
│   └── add-consequences.mjs
├── builder (add to gitignore)/
│   └── FinalExam/
│       ├── CMS-485 FINAL SIMULATION EXAM — Complete Production Deliverable (1).md
│       └── FinalExamDesign.html
├── COMPREHENSIVE_UPDATE_REPORT.md
├── QA_REPORT.md
├── QA_REPORT_PASS2.md
├── UAT_REPORT.md
└── (node_modules, dist)
```

**Key source files (content)**:
- `src/data/trainingCards.ts` — SECTIONS = ['Foundation', 'Regulatory Authority', ...], TrainingCard[] with title, objective, bullets, auditFocus, challenge {scenario, question, options, correctLogic}
- `src/features/final-exam/data/*` — 3 Clinical cases (Henderson, Alvarez, Okafor) matching host cms485Cases
- `src/features/final-exam/engine/scoring.ts` — scoring logic, domains (principal-diagnosis, visit-frequency, goals, interventions, disciplines etc.)
- `builder/.../CMS-485 FINAL...md` — architecture doc for FinalExamShell + rationale gating

**Asset folders**: src/assets/ (narration .wav), public/ (branding)

**Gemini-started files (detected)**: COMPREHENSIVE_UPDATE_REPORT.md, QA/UAT reports, additionalContent.generated.ts, builder/ final exam deliverable md, many generated/patch patterns in similar sibling repos, final-exam components and flow changes described as "restructuring".

## Framework / Package / Build Scripts

- npm + Vite 7 + React 18.3 + TS 5.7 + Tailwind 4 + framer-motion + react-router-dom + lucide-react
- Scripts (package.json):
  - `npm run dev` (vite --host 127.0.0.1 --port 5190)
  - `npm run build` (tsc -b && vite build)
  - `npm run build:scorm`
  - `npm run preview`
- Output: Standalone React app + SCORM zip. **Not designed as library** — content + simulator must be ported/extracted.

## Relevant Narration / Quiz / Scenario / Simulator Files

- Narration: src/assets/*.wav + references in components + trainingCards challenges
- Lessons/Cards: trainingCards.ts (sections map to lessons), additionalContent
- Quizzes/Practice: practiceData.ts, ExamDashboard/Practice*
- Final simulator cases (3): features/final-exam/data/ + engine/scoring + FinalExamShell (mandatory rationale review post-submit)
- Pass threshold (repo): 80 (scoring.ts); host adapter currently forces 100 for cases
- Remediation: ReviewMode.tsx (mandatory), results with rationales

## Gemini Changes / Generic UI Evidence

- Generic patterns: HomeView, ModuleView, Layout, Splash + shared AudioPlayer/Backgrounds across lessons.
- Final exam is more specialized (CMS485Form + EvidencePanel + form field clicks) — this is the desired "plan of care cockpit" direction.
- Reports document iterative restructuring of exam flow (intro → active cases → summary → submit → mandatory rationale review → congrats → performance).
- Host has already extracted some narration + cases into journey data but uses generic player/quiz page (Cms485AssessmentQuizPage + ModulePlayerScreen special casing).

## Risks and Blockers (TEAM 1)

- Standalone app vs host Journey contract (store, ModuleDef, cards, completion, evidence).
- Audio: 160+ wavs bundled in repo; host uses cms485AudioLocations.ts + public assets.
- Different final pass threshold (repo 80 vs host 100 for cases).
- React 18 + framer vs host (add only if needed; prefer native Journey UI).
- Must preserve exact narration text from cards/transcripts when mapping.
- 3 final cases must map to "simulator final cases" gate.
- No direct import — extract pure data + case defs.

## Cross-Check vs Host Journey

- Host already has `cms485PlanOfCareModule` (id: "cms-485") + lessons + cards with narration + `cms485Cases`.
- See: `src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts`, `cms485PlanOfCareCases.data.ts`, `contentV2Adapter.ts`, `Cms485AssessmentQuizPage.tsx`
- Journey store (zustand + persist) + gating + types preserved.
- Evidence output must feed JourneyEvidence + signatures (per ADV gate).

**Status for TEAM 1**: Inventory complete. Ready for CONTENT_MAP.md + UI_FINDINGS (use form cockpit + rationale review from features/final-exam as model for uiVariant: 'plan_of_care').

Next agents in team: extract full card/narration from trainingCards + cases; map compliance (42 CFR §484.60, POC orders, F2F, goals/interventions/ disciplines/signature); define Journey module record + workflow/event.
