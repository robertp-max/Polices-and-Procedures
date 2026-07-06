# TEAM 2 — CMS DOCUMENTATION MATTERS IMPLEMENTATION_PLAN.md

**Files**:
- Edit host advancedTraining (new docMatters.data.ts modeled on cms485)
- Extend contentV2Adapter for "documentation-matters" or "gao-04"
- Update ADV track in CareIndeedOnboardingLMS.tsx
- New: AdvancedTrainingPlayer + DocumentationLabPanel (note comparison, scenario grid with surveyor view)
- Reuse Journey evidence + signature

**Data model**: hybrid assessment, evidenceOutput: note-comparison, cap a, rationale-selections

**No breakage**: same stats, launch, store finalize.

**Tests**: scenario rationale fidelity + completion gate.
