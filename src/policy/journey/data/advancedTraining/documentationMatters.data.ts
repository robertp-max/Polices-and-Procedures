import type { ModuleDef } from "../lessonModel";

export const documentationMattersModule: ModuleDef = {
  id: "documentation-matters",
  code: "GAO-04",
  title: "CMS Documentation Matters / Documentation Defensibility",
  shortTitle: "Documentation Defensibility",
  time: "2.0 hr",
  summary: "Build audit-ready, defensible visit notes with skilled need, measurable outcomes, and surveyor lens review.",
  kind: "lesson",
  status: "ready",
  countsTowardTheory: true,
  policyRefs: ["CL-CD-001", "CL-CP-001"],
  learningObjectives: [
    "Distinguish weak vs defensible documentation",
    "Apply auditorConclusion logic in every note",
    "Document late entries, corrections, and amendments correctly",
    "Support skilled need and POC linkage in every entry"
  ],
  lessons: [
    {
      id: "l1",
      index: 1,
      title: "Why Documentation Matters",
      estMinutes: 10,
      learningGoal: "Understand documentation as clinical, financial, and legal record.",
      scenario: "ADR received. Notes lack specificity.",
      keyConcept: "Good documentation tells a complete, defensible story.",
      whyItMatters: ["Denials and condition-level findings often trace to vague notes."],
      practiceExample: "Link assessment findings directly to interventions and measurable patient response.",
      commonMistake: "Copy-forward language and 'continue POC' without specifics.",
      keyTerms: [{ term: "Defensibility", definition: "Able to withstand surveyor or auditor scrutiny." }],
      transcript: "Documentation is not busywork. It is the legal record of the skilled care you delivered and the patient's response. Weak notes create risk for the patient, the agency, and the clinician.",
      summary: "Every note must stand alone.",
      cards: [
        {
          module_id: "documentation-matters",
          lesson_id: "l1",
          card_id: "doc_overview",
          display_title: "The Documentation Imperative",
          learner_facing_content: "Documentation must substantiate skilled need and show measurable response.",
          narration_script: "Documentation is not busywork. It is the legal record of the skilled care you delivered and the patient's response. Weak notes create risk for the patient, the agency, and the clinician.",
          transcript_text: "Documentation is not busywork. It is the legal record of the skilled care you delivered and the patient's response. Weak notes create risk for the patient, the agency, and the clinician.",
          estimated_narration_seconds: 38,
          completion_condition: "Viewed and continued."
        }
      ]
    }
  ]
};
