import type { ModuleDef } from "../lessonModel";

export const oasisE2SocModule: ModuleDef = {
  id: "oasis-e2-soc",
  code: "GAO-03",
  title: "OASIS-E2 Start of Care Assessment",
  shortTitle: "OASIS-E2 SOC",
  time: "2.5 hr",
  summary: "OASIS-E2 item-level coding at SOC with clinical evidence, rationale, and error-risk mitigation.",
  kind: "lesson",
  status: "ready",
  countsTowardTheory: true,
  policyRefs: ["CL-CP-001", "OASIS-E2-CMS-Guidance"],
  learningObjectives: [
    "Correctly code GG functional items using observation + interview evidence",
    "Apply wound (M0300) and behavioral health (B/C/D) items per current guidance",
    "Link responses to homebound and skilled need for POC defensibility",
    "Avoid upcoding/undercoding with rationale documentation"
  ],
  lessons: [
    {
      id: "l1",
      index: 1,
      title: "SOC Timepoint & Evidence Anchors",
      estMinutes: 15,
      learningGoal: "Use multiple data sources at SOC.",
      scenario: "RN arrives for SOC. Multiple artifacts available.",
      keyConcept: "SOC requires highest accuracy for payment and quality.",
      whyItMatters: ["PDGM and HHVBP depend on accurate OASIS at SOC."],
      practiceExample: "Review hospital discharge, caregiver interview, and direct observation before coding.",
      commonMistake: "Coding from memory or prior episode without fresh observation.",
      keyTerms: [{ term: "SOC", definition: "Start of Care comprehensive assessment." }],
      transcript: "At Start of Care the OASIS-E2 must reflect the patient's current status based on observation, interview, and available clinical records. This sets the baseline for the entire episode.",
      summary: "Always start fresh at SOC.",
      cards: [
        {
          module_id: "oasis-e2-soc",
          lesson_id: "l1",
          card_id: "oasis_soc_overview",
          card_type: "overview",
          display_title: "SOC Coding Principles",
          learner_facing_content: "Use observation, interview, and chart review. Record rationale for every response.",
          narration_script: "At Start of Care the OASIS-E2 must reflect the patient's current status based on observation, interview, and available clinical records. This sets the baseline for the entire episode.",
          transcript_text: "At Start of Care the OASIS-E2 must reflect the patient's current status based on observation, interview, and available clinical records. This sets the baseline for the entire episode.",
          estimated_narration_seconds: 42,
          completion_condition: "Learner reviews evidence anchors and continues."
        }
      ]
    }
  ]
};
