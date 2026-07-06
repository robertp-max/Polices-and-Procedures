# TEAM 1 — CMS-485 UI_FINDINGS.md

## What Gemini Built (Evidence)

**In training repo**:
- Generic shell: HomeView, ModuleView, Layout, SplashView, AudioPlayer + shared backgrounds (Silk, Travelight).
- Lesson flow: cards with challenges.
- Specialized final-exam (good seed): FinalExamShell (phases: intro/active/summary/submit → mandatory rationale review → congrats/performance), CMS485Form (interactive 485 boxes), EvidencePanel (tabs), FieldModal (select + rationale), ReviewMode, ExamResults, CaseSelector.
- Report "COMPREHENSIVE_UPDATE_REPORT.md" details flow restructuring for rationale gating.

**In host**:
- Data extracted to ModuleDef + cards (narration mapped).
- Special casing in contentV2Adapter, ModulePlayerScreen ("Advanced Training Clinical Audit Lab"), Cms485AssessmentQuizPage (imports cases, renders quiz-like).
- Stats (% Complete, Questions, Best Score) visible on ADV cards (per original spec).
- Landing in CareIndeedOnboardingLMS.tsx under ADV track.

## What Is Generic or Incompatible

- CMS-485 and QAPI used identical card/player shell pattern (forbidden).
- Host player for cms-485 is generic Journey module player + separate quiz page — not a "form-review cockpit".
- No visual traceability map (Assessment→Orders→Goals→Frequency→Signature) in current ADV cards.
- No domain icon/accent or miniature visual per spec.
- Simulator experience (rationale review, field clicks) buried or not surfaced in main Journey player.

## What to Keep

- Exact narration text + card mapping from host data (already good).
- 3 cases (Henderson/Alvarez/Okafor) + scoring domains + rationale requirement.
- Completion evidence + Journey store semantics.
- Existing ADV header, subtitle, completion gate text, card stats model.
- Journey launch, progress, gating, signature, evidence.

## What to Replace

- Generic player shell for this module → domain-specific inner panels inside shared AdvancedTrainingPlayer.
- Card visuals for GAO-01 → plan-of-care specific (trace line + form box indicators).
- Current quiz page or embed simulator into player center + right evidence panel.

## Proposed Module-Specific UI Treatment (plan_of_care variant)

Per master spec + repo strengths:
- Landing card: white/glass, 20-24px radius, teal title "GAO-01", domain badge "Plan of Care", miniature: care plan trace line (Assessment → Orders → Goals → Visit Freq → Signature), compact chips (Role: RN/DON/PT, Duration 2hr, 5 lessons + 3 cases, Simulator, policy CL-CP-001), "Mapped narration ✓", "Evidence output ✓".
- Shared player shell (new): Header (title + progress + score + policy), Left rail (lessons + cards list), Center (narration + scenario + challenge or simulator view), Right (Evidence/Mapping/References + POC trace checklist), Bottom nav (Prev/Next/Save/Submit).
- Inner for CMS-485:
  - Lesson cards: standard + challenge mode.
  - Final: interactive CMS485Form (clickable boxes) + EvidencePanel side-by-side.
  - Post-submit: mandatory RationaleReview (all options) before score.
  - Visual: form field heat map, coherence score per domain.
- Use existing Journey components + lucide (host has it). No new heavy libs. High contrast, clinical, survey-ready.
- Keyboard + a11y preserved from Journey.

**Screenshots / references**: Repo has FinalExamDesign.html + components; host has no current specialized cockpit screenshot in source (use runtime verification later).

## Compatibility Score (Gemini UI)

- Generic shell: 2/10
- Content/narration fidelity: 8/10
- Simulator core logic: 9/10 (use as model)
- Fit to Journey store/gates: 6/10 (needs adapter work)

**Recommendation**: Supersede generic UI. Mark old Cms485AssessmentQuizPage as legacy for this module. Use shared Advanced player with variant.
