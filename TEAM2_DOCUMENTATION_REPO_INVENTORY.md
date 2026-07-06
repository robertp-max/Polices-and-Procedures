# TEAM 2 — CMS DOCUMENTATION MATTERS TOOLKIT REPO INVENTORY.md

**Team**: 2 (CMS Documentation Matters / Documentation Defensibility)  
**Repo**: C:\AI\Git\training\CI-ION\CI-ION_CMS-Documentation-Matters-Toolkit  
**GitHub**: https://github.com/robertp-max/CI-ION_CMS-Documentation-Matters.git  
**Reviewed**: 2026-06-30

## File Tree Summary (Key Evidence)

```
.../CI-ION_CMS-Documentation-Matters-Toolkit/
├── package.json (oasis-simulator name reused)
├── src/
│   ├── content/
│   │   ├── courseContent.ts (LessonCard, TopicScenario with auditorConclusion etc)
│   │   ├── quizContent.ts
│   │   ├── topicScenarios.ts
│   │   ├── narration-scripts.csv (Category, narrationID, narrationText)
│   │   ├── narration/audio/Documentation_Matters/ (150+ .wav: Module1-8, PracticeLab_Scenario*, FinalAssessment*)
│   │   └── ...
│   ├── data/
│   │   ├── artifacts.ts, artifactManifest.tsx, referenceArtifacts.tsx
│   │   ├── evidenceFocusTargets.ts, itemRationales.json
│   │   └── narrationTextMap.ts
│   ├── components/
│   │   ├── simulator/ (FinalReviewScreen, LeftWorkspacePanel, RightArtifactPanel, SectionRenderer, TopWorkflowStepper)
│   │   ├── layout/SimulatorShell.tsx
│   │   ├── modals/ (ReviewModal, FeedbackModal, SuccessModal...)
│   │   ├── artifacts/ , oasis/ (EvidencePanel, ItemCard — mixed), ui/
│   │   └── GlobalAudioPlayer.tsx
│   ├── config/ (rules.ts, sections.ts, workflow.ts)
│   ├── store/simulatorStore.tsx
│   ├── pages/ (DocumentationToolkitApp.tsx, SimulatorPage.tsx)
│   └── ...
├── reports/ (demo-qa, training-qa, production-readiness, narration-audio audits)
├── scripts/ (many auditNarration, generate, export, patch*.cjs)
├── training-integrity-review.md
├── (dist SCORM, many patch/fix cjs at root, narration csvs)
```

**Gemini files**: extensive patch/fix cjs, reports/*, _legacy/, CaseContent/ OASIS design docs mixed in, generated dumps.

## Framework

Vite + React 19 + TS + Tailwind3 + lucide. Heavy scripting for narration alignment and SCORM.

## Content Highlights (for map)

- 8 Modules + Practice Lab + Final Assessment (narration csv + audio).
- LessonCard + TopicScenario with strong defensibility fields: whyCorrect, whatDocumentationShouldShow, auditorConclusion, clinicalRisk, complianceRisk.
- SimulatorShell + workspace panels for note review / comparison.
- Artifacts and reference content for "evidence hierarchy".

## Risks

Mixed OASIS design docs in data/CaseContent (ignore for this team, focus Documentation).
Generic simulator shell to be replaced.
Narration csv + 150+ wavs to map exactly.

**Inventory complete**. Ready for CONTENT_MAP (modules 1-8 + scenarios + final 15? scenarios).
