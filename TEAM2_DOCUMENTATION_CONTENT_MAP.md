# TEAM 2 — CMS DOCUMENTATION MATTERS CONTENT_MAP.md

**Proposed**: GAO-04 CMS Documentation Matters / Documentation Defensibility  
**assessmentType**: hybrid (scenarios + quiz + practice lab)  
**uiVariant**: documentation_lab

## Structure (from courseContent + narration-scripts.csv)

Modules (8 primary + Practice + Final):

1. Why Documentation Matters (NAR-MOD1-INTRO + lessons)
2. Regulatory and Compliance Foundations
3. What Good Clinical Documentation Looks Like (skilled need, complete visit note, signature)
4. Common Documentation Failures (copyforward, vague, missing response, linkage, inconsistencies)
5. Documentation and Audit Readiness (self-auditing, exclusion screening)
6. Self-Auditing and Corrective Action Plans (CAPA, 5-step)
7. Domain specifics: Wound, Med management, Functional/ADL, Change in condition
8. Stable notes, EVV, homebound

**LessonCard** (courseContent.ts): id, title, context, keyRule, whyItMatters, example, keyTakeaway, auditRisk, clinicalRisk, roleCallout

**TopicScenario** (for challenges/lab): stem, options, correctOptionId, rationale {whyCorrect, whatDocumentationShouldShow, auditorConclusion, clinicalRisk, complianceRisk}

**Practice Lab**: 15 scenarios (PracticeLab_Scenario1..15 + audio)

**Final Assessment**: 13+ questions (FinalAssessment_Question* + Rationale .wav)

**Source paths**:
- `src/content/courseContent.ts`
- `src/content/narration-scripts.csv`
- `src/content/quizContent.ts`, `topicScenarios.ts`
- Audio: `src/content/narration/audio/Documentation_Matters/`
- Simulator views: `src/components/simulator/*` + `SimulatorShell.tsx`

**Pass threshold**: TBD (repo uses practice + final; recommend 80)

**Narration map**: verbatim from csv (Category + ID + full text). Preserve.

**Evidence**: practice lab defensibility scores, final quiz, note comparison artifacts.

**Status**: Content rich for "documentation review lab". Exact mapping ready once full csv parsed in patch.
