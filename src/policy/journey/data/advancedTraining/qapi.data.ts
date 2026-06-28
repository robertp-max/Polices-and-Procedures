import type { ModuleDef } from "../lessonModel";

export const qapiModule: ModuleDef = {
  "id": "qapi",
  "code": "QAPI",
  "title": "Quality Assessment and Performance Improvement (QAPI) Training",
  "shortTitle": "QAPI Training",
  "time": "3.0 hr",
  "summary": "Comprehensive training on federal QAPI regulations, performance improvement projects, California Title 22, and survey readiness.",
  "kind": "lesson",
  "status": "ready",
  "countsTowardTheory": true,
  "policyRefs": ["QA-PG-001"],
  "learningObjectives": [
    "Define QAPI as a CMS-mandated quality framework and connect it to patient safety, compliance, and reimbursement outcomes.",
    "Identify the five CMS QAPI standards and their operational requirements for home health agencies.",
    "Explain the CMS requirements for Performance Improvement Projects and governing body oversight.",
    "Connect OASIS quality measures and the Home Health Value-Based Purchasing model to QAPI program design.",
    "Integrate California-specific regulatory requirements into the QAPI framework for Bay Area home health operations.",
    "Recognize the most frequently cited QAPI deficiencies to prevent them proactively.",
    "Delineate QAPI roles across governing body, administrators, QA specialists, and field clinicians.",
    "Identify the critical quality indicators every home health agency must track under QAPI."
  ],
  "lessons": [
    {
      "id": "l1",
      "index": 1,
      "title": "What QAPI Is and Why It Matters",
      "estMinutes": 5,
      "learningGoal": "Define QAPI as a CMS-mandated quality framework and connect it to patient safety, compliance, and reimbursement outcomes.",
      "scenario": "During a CMS survey, the inspector asks the administrator to describe the agency QAPI program. The administrator points to a binder on the shelf and says, \"It is all in there.\" The surveyor opens the binder and finds only a written policy with no data reports, no meeting minutes, and no evidence of performance improvement activities.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>QAPI stands for Quality Assessment and Performance Improvement — a mandatory, agency-wide, data-driven program under 42 CFR §484.65.</li><li>Every Medicare-certified HHA must develop, implement, evaluate, and maintain an effective QAPI program proportional to the complexity of its services.</li><li>A weak QAPI program is the most common root cause of survey deficiencies, ADR failures, and preventable payment denials.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that qapi stands for quality assessment and performance improvement — a mandatory, agency-wide, data-driven program under 42 cfr §484.65. Then verify that every medicare-certified hha must develop, implement, evaluate, and maintain an effective qapi program proportional to the complexity of its services. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "42 CFR §484.65",
          "definition": "The federal Condition of Participation requiring every Medicare-certified HHA to maintain an effective QAPI program with five standards: scope, data, activities, PIPs, and executive responsibility."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L01",
          "card_id": "qapi_l1_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l1.s1.overview"
          },
          "display_title": "What QAPI Is and Why It Matters",
          "learner_facing_content": "QAPI stands for Quality Assessment and Performance Improvement — a mandatory, agency-wide, data-driven program under 42 CFR §484.65.\nEvery Medicare-certified HHA must develop, implement, evaluate, and maintain an effective QAPI program proportional to the complexity of its services.\nA weak QAPI program is the most common root cause of survey deficiencies, ADR failures, and preventable payment denials.",
          "learning_goal": "Define QAPI as a CMS-mandated quality framework and connect it to patient safety, compliance, and reimbursement outcomes.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l1.s1.overview",
            "scene_title": "Visual showing: What QAPI Is and Why It Matters"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L01",
          "card_id": "qapi_l1_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l1.s1.delivery"
          },
          "display_title": "What QAPI Is and Why It Matters",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that qapi stands for quality assessment and performance improvement — a mandatory, agency-wide, data-driven program under 42 cfr §484.65. Then verify that every medicare-certified hha must develop, implement, evaluate, and maintain an effective qapi program proportional to the complexity of its services. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l1.s1.delivery",
            "scene_title": "Visual demonstrating: What QAPI Is and Why It Matters"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L01",
          "card_id": "qapi_l1_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l1.s1.challenge"
          },
          "display_title": "What QAPI Is and Why It Matters Challenge",
          "learner_facing_content": "During a CMS survey, the inspector asks the administrator to describe the agency QAPI program. The administrator points to a binder on the shelf and says, \"It is all in there.\" The surveyor opens the binder and finds only a written policy with no data reports, no meeting minutes, and no evidence of performance improvement activities.",
          "transcript_text": "What is the fundamental problem with this QAPI program?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l1.s1.challenge",
            "scene_title": "Interactive Scenario: What QAPI Is and Why It Matters"
          },
          "internal_challenge": {
            "id": "qapi_l1_challenge_id",
            "prompt": "What is the fundamental problem with this QAPI program?",
            "choices": [
              {
                "id": "A",
                "label": "QAPI must be an active, data-driven operational program — not just a written policy. CMS requires evidence of ongoing implementation including data collection, analysis, and measurable improvement activities."
              },
              {
                "id": "B",
                "label": "The binder is sufficient because CMS only requires a written QAPI policy document."
              },
              {
                "id": "C",
                "label": "QAPI programs are optional for agencies with fewer than 50 patients on census."
              },
              {
                "id": "D",
                "label": "The administrator should have memorized the binder content instead of referencing it."
              },
              {
                "id": "E",
                "label": "QAPI documentation is only required during accreditation surveys, not CMS surveys."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Under 42 CFR §484.65, QAPI must be an effective, ongoing, HHA-wide, data-driven program. A written policy alone without evidence of active implementation — data collection, trend analysis, improvement activities, and measurable outcomes — cannot satisfy CMS requirements and will result in a deficiency citation."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L01",
          "card_id": "qapi_l1_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l1.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Under 42 CFR §484.65, QAPI must be an effective, ongoing, HHA-wide, data-driven program. A written policy alone without evidence of active implementation — data collection, trend analysis, improvement activities, and measurable outcomes — cannot satisfy CMS requirements and will result in a deficiency citation.",
          "transcript_text": "Under 42 CFR §484.65, QAPI must be an effective, ongoing, HHA-wide, data-driven program. A written policy alone without evidence of active implementation — data collection, trend analysis, improvement activities, and measurable outcomes — cannot satisfy CMS requirements and will result in a deficiency citation.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l1.s1.debrief",
            "scene_title": "Debriefing: What QAPI Is and Why It Matters"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L01",
          "card_id": "qapi_l1_sX_detailed_scenario",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l1.sX.detailed_scenario"
          },
          "display_title": "QA-PG-001 Scenario: Written Policy vs Active QAPI Program",
          "learner_facing_content": "Detailed Scenario (QA-PG-001): During annual survey prep, the QAPI Coordinator presents the binder containing only the QA-PG-001 policy document and three unsigned meeting logs from last year. No trending data, no active PIPs with baseline/outcomes, no evidence of governing body review per QA-PG-001 (QAPI Program Establishment & Governance). Surveyor asks for indicator data tied to OASIS rehospitalization and falls, and the last PIP status report. Per QA-PG-001, what must be produced to demonstrate an effective program beyond the written policy? The agency must show data collection, analysis, measurable improvement activities, and executive oversight — not just the policy text.",
          "transcript_text": "QA-PG-001 requires the QAPI program to be operational and data-driven with evidence of implementation, not merely documented in policy.",
          "estimated_narration_seconds": 50,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l1.sX.detailed_scenario",
            "scene_title": "Detailed Scenario Card: QA-PG-001 Active Program"
          },
          "internal_challenge": {
            "id": "qapi_qapg001_scenario",
            "prompt": "What does QA-PG-001 require to demonstrate an effective QAPI program?",
            "choices": [
              { "id": "A", "label": "Evidence of ongoing data collection, analysis, measurable PIPs with outcomes, and governing body oversight — beyond the written policy document." },
              { "id": "B", "label": "Only a current written QA-PG-001 policy document on file." },
              { "id": "C", "label": "Meeting logs from the past year are sufficient regardless of content." },
              { "id": "D", "label": "QAPI is satisfied if the binder exists and is shown to surveyors." },
              { "id": "E", "label": "Annual policy review alone meets all QA-PG-001 requirements." }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "QA-PG-001 establishes that the QAPI program must be actively implemented with data-driven activities, documented improvement cycles, and executive accountability. The policy document alone without operational evidence violates the standard."
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What is the fundamental problem with this QAPI program?",
        "choices": [
          {
            "id": "A",
            "label": "QAPI must be an active, data-driven operational program — not just a written policy. CMS requires evidence of ongoing implementation including data collection, analysis, and measurable improvement activities."
          },
          {
            "id": "B",
            "label": "The binder is sufficient because CMS only requires a written QAPI policy document."
          },
          {
            "id": "C",
            "label": "QAPI programs are optional for agencies with fewer than 50 patients on census."
          },
          {
            "id": "D",
            "label": "The administrator should have memorized the binder content instead of referencing it."
          },
          {
            "id": "E",
            "label": "QAPI documentation is only required during accreditation surveys, not CMS surveys."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Under 42 CFR §484.65, QAPI must be an effective, ongoing, HHA-wide, data-driven program. A written policy alone without evidence of active implementation — data collection, trend analysis, improvement activities, and measurable outcomes — cannot satisfy CMS requirements and will result in a deficiency citation.",
        "feedbackIncorrect": "Incorrect. Under 42 CFR §484.65, QAPI must be an effective, ongoing, HHA-wide, data-driven program. A written policy alone without evidence of active implementation — data collection, trend analysis, improvement activities, and measurable outcomes — cannot satisfy CMS requirements and will result in a deficiency citation."
      }
    },
    {
      "id": "l2",
      "index": 2,
      "title": "CMS Conditions of Participation: 42 CFR §484.65",
      "estMinutes": 5,
      "learningGoal": "Identify the five CMS QAPI standards and their operational requirements for home health agencies.",
      "scenario": "A surveyor asks the QAPI coordinator which specific quality indicators the agency tracks under Standard (a). The coordinator responds, \"We track everything — patient satisfaction, staff retention, and building maintenance.\" The surveyor asks for documented evidence of health outcome measures.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Standard (a) Program Scope: define measurable indicators tied to health outcomes, patient safety, and quality of care.</li><li>Standard (b) Program Data: use quality indicator data — especially OASIS-derived measures — to monitor performance and identify improvement opportunities.</li><li>Standard (c) Program Activities: focus on high-risk, high-volume, or problem-prone areas and immediately correct identified patient safety threats.</li></ul>",
      "whyItMatters": [
        "Surveyors trace each standard from written policy → operational evidence → measurable outcomes."
      ],
      "practiceExample": "during documentation review, confirm that standard (a) program scope: define measurable indicators tied to health outcomes, patient safety, and quality of care. Then verify that standard (b) program data: use quality indicator data — especially oasis-derived measures — to monitor performance and identify improvement opportunities. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "42 CFR §484.65",
          "definition": "The federal Condition of Participation requiring every Medicare-certified HHA to maintain an effective QAPI program with five standards: scope, data, activities, PIPs, and executive responsibility."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L02",
          "card_id": "qapi_l2_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l2.s1.overview"
          },
          "display_title": "CMS Conditions of Participation: 42 CFR §484.65",
          "learner_facing_content": "Standard (a) Program Scope: define measurable indicators tied to health outcomes, patient safety, and quality of care.\nStandard (b) Program Data: use quality indicator data — especially OASIS-derived measures — to monitor performance and identify improvement opportunities.\nStandard (c) Program Activities: focus on high-risk, high-volume, or problem-prone areas and immediately correct identified patient safety threats.",
          "learning_goal": "Identify the five CMS QAPI standards and their operational requirements for home health agencies.",
          "why_it_matters": [
            "Surveyors trace each standard from written policy → operational evidence → measurable outcomes."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l2.s1.overview",
            "scene_title": "Visual showing: CMS Conditions of Participation: 42 CFR §484.65"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L02",
          "card_id": "qapi_l2_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l2.s1.delivery"
          },
          "display_title": "CMS Conditions of Participation: 42 CFR §484.65",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that standard (a) program scope: define measurable indicators tied to health outcomes, patient safety, and quality of care. Then verify that standard (b) program data: use quality indicator data — especially oasis-derived measures — to monitor performance and identify improvement opportunities. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l2.s1.delivery",
            "scene_title": "Visual demonstrating: CMS Conditions of Participation: 42 CFR §484.65"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L02",
          "card_id": "qapi_l2_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l2.s1.challenge"
          },
          "display_title": "CMS Conditions of Participation: 42 CFR §484.65 Challenge",
          "learner_facing_content": "A surveyor asks the QAPI coordinator which specific quality indicators the agency tracks under Standard (a). The coordinator responds, \"We track everything — patient satisfaction, staff retention, and building maintenance.\" The surveyor asks for documented evidence of health outcome measures.",
          "transcript_text": "Which CMS standard requires measurable indicators tied specifically to health outcomes and patient safety?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l2.s1.challenge",
            "scene_title": "Interactive Scenario: CMS Conditions of Participation: 42 CFR §484.65"
          },
          "internal_challenge": {
            "id": "qapi_l2_challenge_id",
            "prompt": "Which CMS standard requires measurable indicators tied specifically to health outcomes and patient safety?",
            "choices": [
              {
                "id": "A",
                "label": "Standard (a) — Program Scope requires measurable improvement in indicators reflecting health outcomes, patient safety, and quality of care, not generic operational metrics."
              },
              {
                "id": "B",
                "label": "Standard (e) — Executive Responsibility covers all indicator selection decisions."
              },
              {
                "id": "C",
                "label": "Standard (d) — PIPs automatically generate the required quality indicators."
              },
              {
                "id": "D",
                "label": "There is no specific standard for indicator selection; agencies can track any metrics."
              },
              {
                "id": "E",
                "label": "Standard (b) — Program Data determines which indicators are important based on billing volume."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Standard (a) of 42 CFR §484.65 requires the QAPI program to measure improvement in indicators that reflect health outcomes, patient safety, and quality of care. Indicators must be clinically relevant and measurable — not general operational metrics unrelated to patient care."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L02",
          "card_id": "qapi_l2_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l2.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Standard (a) of 42 CFR §484.65 requires the QAPI program to measure improvement in indicators that reflect health outcomes, patient safety, and quality of care. Indicators must be clinically relevant and measurable — not general operational metrics unrelated to patient care.",
          "transcript_text": "Standard (a) of 42 CFR §484.65 requires the QAPI program to measure improvement in indicators that reflect health outcomes, patient safety, and quality of care. Indicators must be clinically relevant and measurable — not general operational metrics unrelated to patient care.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l2.s1.debrief",
            "scene_title": "Debriefing: CMS Conditions of Participation: 42 CFR §484.65"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Which CMS standard requires measurable indicators tied specifically to health outcomes and patient safety?",
        "choices": [
          {
            "id": "A",
            "label": "Standard (a) — Program Scope requires measurable improvement in indicators reflecting health outcomes, patient safety, and quality of care, not generic operational metrics."
          },
          {
            "id": "B",
            "label": "Standard (e) — Executive Responsibility covers all indicator selection decisions."
          },
          {
            "id": "C",
            "label": "Standard (d) — PIPs automatically generate the required quality indicators."
          },
          {
            "id": "D",
            "label": "There is no specific standard for indicator selection; agencies can track any metrics."
          },
          {
            "id": "E",
            "label": "Standard (b) — Program Data determines which indicators are important based on billing volume."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Standard (a) of 42 CFR §484.65 requires the QAPI program to measure improvement in indicators that reflect health outcomes, patient safety, and quality of care. Indicators must be clinically relevant and measurable — not general operational metrics unrelated to patient care.",
        "feedbackIncorrect": "Incorrect. Standard (a) of 42 CFR §484.65 requires the QAPI program to measure improvement in indicators that reflect health outcomes, patient safety, and quality of care. Indicators must be clinically relevant and measurable — not general operational metrics unrelated to patient care."
      }
    },
    {
      "id": "l3",
      "index": 3,
      "title": "PIPs and Executive Responsibility Standards",
      "estMinutes": 5,
      "learningGoal": "Explain the CMS requirements for Performance Improvement Projects and governing body oversight.",
      "scenario": "Care Indeed completed its annual PIP on reducing hospital readmissions. The PIP report shows the topic was selected but contains no baseline data, no measurable target, and no outcome documentation. The governing body has not reviewed the PIP.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Standard (d) requires at least one data-driven PIP annually, proportional to agency size and complexity, with documented rationale, measurable goals, and demonstrated progress.</li><li>Standard (e) assigns ultimate accountability to the governing body: they must ensure the QAPI program is defined, resourced, monitored, and evaluated for effectiveness.</li><li>The governing body must ensure patient safety priorities are addressed and any findings of fraud or waste are appropriately managed.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that standard (d) requires at least one data-driven pip annually, proportional to agency size and complexity, with documented rationale, measurable goals, and demonstrated progress. Then verify that standard (e) assigns ultimate accountability to the governing body: they must ensure the qapi program is defined, resourced, monitored, and evaluated for effectiveness. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "Governing Body",
          "definition": "The executive authority (board or owner) with ultimate accountability for ensuring the QAPI program is defined, resourced, monitored, and evaluated."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L03",
          "card_id": "qapi_l3_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l3.s1.overview"
          },
          "display_title": "PIPs and Executive Responsibility Standards",
          "learner_facing_content": "Standard (d) requires at least one data-driven PIP annually, proportional to agency size and complexity, with documented rationale, measurable goals, and demonstrated progress.\nStandard (e) assigns ultimate accountability to the governing body: they must ensure the QAPI program is defined, resourced, monitored, and evaluated for effectiveness.\nThe governing body must ensure patient safety priorities are addressed and any findings of fraud or waste are appropriately managed.",
          "learning_goal": "Explain the CMS requirements for Performance Improvement Projects and governing body oversight.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l3.s1.overview",
            "scene_title": "Visual showing: PIPs and Executive Responsibility Standards"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L03",
          "card_id": "qapi_l3_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l3.s1.delivery"
          },
          "display_title": "PIPs and Executive Responsibility Standards",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that standard (d) requires at least one data-driven pip annually, proportional to agency size and complexity, with documented rationale, measurable goals, and demonstrated progress. Then verify that standard (e) assigns ultimate accountability to the governing body: they must ensure the qapi program is defined, resourced, monitored, and evaluated for effectiveness. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l3.s1.delivery",
            "scene_title": "Visual demonstrating: PIPs and Executive Responsibility Standards"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L03",
          "card_id": "qapi_l3_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l3.s1.challenge"
          },
          "display_title": "PIPs and Executive Responsibility Standards Challenge",
          "learner_facing_content": "Care Indeed completed its annual PIP on reducing hospital readmissions. The PIP report shows the topic was selected but contains no baseline data, no measurable target, and no outcome documentation. The governing body has not reviewed the PIP.",
          "transcript_text": "Which two QAPI standards are violated by this approach?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l3.s1.challenge",
            "scene_title": "Interactive Scenario: PIPs and Executive Responsibility Standards"
          },
          "internal_challenge": {
            "id": "qapi_l3_challenge_id",
            "prompt": "Which two QAPI standards are violated by this approach?",
            "choices": [
              {
                "id": "A",
                "label": "Standard (d) requires PIPs with documented rationale, measurable goals, and progress; Standard (e) requires the governing body to oversee and evaluate all improvement actions."
              },
              {
                "id": "B",
                "label": "Only Standard (a) is violated because the PIP topic was not properly selected."
              },
              {
                "id": "C",
                "label": "No standards are violated because completing one PIP per year satisfies the requirement regardless of content."
              },
              {
                "id": "D",
                "label": "Standard (b) is violated because data was not collected from OASIS."
              },
              {
                "id": "E",
                "label": "Standard (c) is violated because readmissions are not a high-risk area."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Standard (d) requires PIPs that include documented rationale, measurable goals, baseline data, interventions, and demonstrated progress. Standard (e) requires the governing body to ensure the program is monitored and all improvement actions are evaluated for effectiveness. Both standards are violated when a PIP lacks measurable elements and executive oversight is absent."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L03",
          "card_id": "qapi_l3_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l3.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Standard (d) requires PIPs that include documented rationale, measurable goals, baseline data, interventions, and demonstrated progress. Standard (e) requires the governing body to ensure the program is monitored and all improvement actions are evaluated for effectiveness. Both standards are violated when a PIP lacks measurable elements and executive oversight is absent.",
          "transcript_text": "Standard (d) requires PIPs that include documented rationale, measurable goals, baseline data, interventions, and demonstrated progress. Standard (e) requires the governing body to ensure the program is monitored and all improvement actions are evaluated for effectiveness. Both standards are violated when a PIP lacks measurable elements and executive oversight is absent.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l3.s1.debrief",
            "scene_title": "Debriefing: PIPs and Executive Responsibility Standards"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Which two QAPI standards are violated by this approach?",
        "choices": [
          {
            "id": "A",
            "label": "Standard (d) requires PIPs with documented rationale, measurable goals, and progress; Standard (e) requires the governing body to oversee and evaluate all improvement actions."
          },
          {
            "id": "B",
            "label": "Only Standard (a) is violated because the PIP topic was not properly selected."
          },
          {
            "id": "C",
            "label": "No standards are violated because completing one PIP per year satisfies the requirement regardless of content."
          },
          {
            "id": "D",
            "label": "Standard (b) is violated because data was not collected from OASIS."
          },
          {
            "id": "E",
            "label": "Standard (c) is violated because readmissions are not a high-risk area."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Standard (d) requires PIPs that include documented rationale, measurable goals, baseline data, interventions, and demonstrated progress. Standard (e) requires the governing body to ensure the program is monitored and all improvement actions are evaluated for effectiveness. Both standards are violated when a PIP lacks measurable elements and executive oversight is absent.",
        "feedbackIncorrect": "Incorrect. Standard (d) requires PIPs that include documented rationale, measurable goals, baseline data, interventions, and demonstrated progress. Standard (e) requires the governing body to ensure the program is monitored and all improvement actions are evaluated for effectiveness. Both standards are violated when a PIP lacks measurable elements and executive oversight is absent."
      }
    },
    {
      "id": "l4",
      "index": 4,
      "title": "OASIS Data and HHVBP Quality Impact",
      "estMinutes": 5,
      "learningGoal": "Connect OASIS quality measures and the Home Health Value-Based Purchasing model to QAPI program design.",
      "scenario": "Care Indeed notices that its Star Rating dropped from 4.0 to 3.0 over two quarters. A root-cause review reveals that OASIS assessments at SOC and ROC are inconsistently coded across clinicians, resulting in inflated functional scores that do not reflect actual patient improvement.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>OASIS-derived quality measures — including rehospitalization, functional improvement, and timely care initiation — directly affect Star Ratings and HHVBP payment adjustments.</li><li>Under HHVBP, agencies with poor quality scores face Medicare payment reductions; high performers earn incentive payments.</li><li>QAPI programs must incorporate OASIS accuracy monitoring because inaccurate assessments distort quality measures and threaten reimbursement.</li></ul>",
      "whyItMatters": [
        "CMS expects OASIS data to be integral to QAPI indicator selection and PIP topic identification."
      ],
      "practiceExample": "during documentation review, confirm that oasis-derived quality measures — including rehospitalization, functional improvement, and timely care initiation — directly affect star ratings and hhvbp payment adjustments. Then verify that under hhvbp, agencies with poor quality scores face medicare payment reductions; high performers earn incentive payments. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "HHVBP",
          "definition": "Home Health Value-Based Purchasing — a CMS model that adjusts Medicare payments based on agency quality performance scores."
        },
        {
          "term": "Star Rating",
          "definition": "A 1-to-5 quality rating calculated from OASIS-derived measures, HHCAHPS data, and claims data displayed on Care Compare."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L04",
          "card_id": "qapi_l4_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l4.s1.overview"
          },
          "display_title": "OASIS Data and HHVBP Quality Impact",
          "learner_facing_content": "OASIS-derived quality measures — including rehospitalization, functional improvement, and timely care initiation — directly affect Star Ratings and HHVBP payment adjustments.\nUnder HHVBP, agencies with poor quality scores face Medicare payment reductions; high performers earn incentive payments.\nQAPI programs must incorporate OASIS accuracy monitoring because inaccurate assessments distort quality measures and threaten reimbursement.",
          "learning_goal": "Connect OASIS quality measures and the Home Health Value-Based Purchasing model to QAPI program design.",
          "why_it_matters": [
            "CMS expects OASIS data to be integral to QAPI indicator selection and PIP topic identification."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l4.s1.overview",
            "scene_title": "Visual showing: OASIS Data and HHVBP Quality Impact"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L04",
          "card_id": "qapi_l4_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l4.s1.delivery"
          },
          "display_title": "OASIS Data and HHVBP Quality Impact",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that oasis-derived quality measures — including rehospitalization, functional improvement, and timely care initiation — directly affect star ratings and hhvbp payment adjustments. Then verify that under hhvbp, agencies with poor quality scores face medicare payment reductions; high performers earn incentive payments. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l4.s1.delivery",
            "scene_title": "Visual demonstrating: OASIS Data and HHVBP Quality Impact"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L04",
          "card_id": "qapi_l4_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l4.s1.challenge"
          },
          "display_title": "OASIS Data and HHVBP Quality Impact Challenge",
          "learner_facing_content": "Care Indeed notices that its Star Rating dropped from 4.0 to 3.0 over two quarters. A root-cause review reveals that OASIS assessments at SOC and ROC are inconsistently coded across clinicians, resulting in inflated functional scores that do not reflect actual patient improvement.",
          "transcript_text": "How does OASIS inaccuracy directly affect the agency under HHVBP?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l4.s1.challenge",
            "scene_title": "Interactive Scenario: OASIS Data and HHVBP Quality Impact"
          },
          "internal_challenge": {
            "id": "qapi_l4_challenge_id",
            "prompt": "How does OASIS inaccuracy directly affect the agency under HHVBP?",
            "choices": [
              {
                "id": "A",
                "label": "Inaccurate OASIS distorts quality measures that determine Star Ratings and HHVBP payment adjustments — poor scores can reduce Medicare reimbursement."
              },
              {
                "id": "B",
                "label": "OASIS accuracy does not affect HHVBP because payment adjustments are based only on visit volume."
              },
              {
                "id": "C",
                "label": "Star Ratings are updated only once every five years and are not sensitive to OASIS coding changes."
              },
              {
                "id": "D",
                "label": "HHVBP only applies to hospitals, not home health agencies."
              },
              {
                "id": "E",
                "label": "OASIS scores are advisory only and do not affect reimbursement under any payment model."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "OASIS-derived quality measures directly drive Star Ratings and HHVBP payment adjustments. Inaccurate assessments distort these measures, potentially reducing the agency Star Rating and triggering Medicare payment reductions under the value-based purchasing model. QAPI must include OASIS validation to protect both quality scores and reimbursement."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L04",
          "card_id": "qapi_l4_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l4.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "OASIS-derived quality measures directly drive Star Ratings and HHVBP payment adjustments. Inaccurate assessments distort these measures, potentially reducing the agency Star Rating and triggering Medicare payment reductions under the value-based purchasing model. QAPI must include OASIS validation to protect both quality scores and reimbursement.",
          "transcript_text": "OASIS-derived quality measures directly drive Star Ratings and HHVBP payment adjustments. Inaccurate assessments distort these measures, potentially reducing the agency Star Rating and triggering Medicare payment reductions under the value-based purchasing model. QAPI must include OASIS validation to protect both quality scores and reimbursement.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l4.s1.debrief",
            "scene_title": "Debriefing: OASIS Data and HHVBP Quality Impact"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "How does OASIS inaccuracy directly affect the agency under HHVBP?",
        "choices": [
          {
            "id": "A",
            "label": "Inaccurate OASIS distorts quality measures that determine Star Ratings and HHVBP payment adjustments — poor scores can reduce Medicare reimbursement."
          },
          {
            "id": "B",
            "label": "OASIS accuracy does not affect HHVBP because payment adjustments are based only on visit volume."
          },
          {
            "id": "C",
            "label": "Star Ratings are updated only once every five years and are not sensitive to OASIS coding changes."
          },
          {
            "id": "D",
            "label": "HHVBP only applies to hospitals, not home health agencies."
          },
          {
            "id": "E",
            "label": "OASIS scores are advisory only and do not affect reimbursement under any payment model."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. OASIS-derived quality measures directly drive Star Ratings and HHVBP payment adjustments. Inaccurate assessments distort these measures, potentially reducing the agency Star Rating and triggering Medicare payment reductions under the value-based purchasing model. QAPI must include OASIS validation to protect both quality scores and reimbursement.",
        "feedbackIncorrect": "Incorrect. OASIS-derived quality measures directly drive Star Ratings and HHVBP payment adjustments. Inaccurate assessments distort these measures, potentially reducing the agency Star Rating and triggering Medicare payment reductions under the value-based purchasing model. QAPI must include OASIS validation to protect both quality scores and reimbursement."
      }
    },
    {
      "id": "l5",
      "index": 5,
      "title": "California Title 22 and State Mandates",
      "estMinutes": 5,
      "learningGoal": "Integrate California-specific regulatory requirements into the QAPI framework for Bay Area home health operations.",
      "scenario": "A Care Indeed patient in the San Jose service area develops a stage 3 pressure ulcer acquired after admission. The clinical team documents the event in the patient chart but does not report it to CDPH. Two weeks later, a state surveyor requests adverse event reporting logs.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Title 22, Division 5, Chapter 6 provides California-specific HHA requirements for licensing, administration, and patient rights that layer on top of federal CoPs.</li><li>Adverse event reporting under Health and Safety Code §1279.1/§1279.3 requires urgent events reported within 24 hours and other reportable events within 5 calendar days.</li><li>Patient rights mandates require written notice of rights before furnishing care, including participation in care planning and confidentiality of medical records.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that title 22, division 5, chapter 6 provides california-specific hha requirements for licensing, administration, and patient rights that layer on top of federal cops. Then verify that adverse event reporting under health and safety code §1279.1/§1279.3 requires urgent events reported within 24 hours and other reportable events within 5 calendar days. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "Title 22",
          "definition": "California Code of Regulations, Title 22, Division 5, Chapter 6 — state-specific HHA requirements that layer on top of federal CoPs."
        },
        {
          "term": "CDPH",
          "definition": "California Department of Public Health — the state licensing and survey authority for home health agencies."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L05",
          "card_id": "qapi_l5_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l5.s1.overview"
          },
          "display_title": "California Title 22 and State Mandates",
          "learner_facing_content": "Title 22, Division 5, Chapter 6 provides California-specific HHA requirements for licensing, administration, and patient rights that layer on top of federal CoPs.\nAdverse event reporting under Health and Safety Code §1279.1/§1279.3 requires urgent events reported within 24 hours and other reportable events within 5 calendar days.\nPatient rights mandates require written notice of rights before furnishing care, including participation in care planning and confidentiality of medical records.",
          "learning_goal": "Integrate California-specific regulatory requirements into the QAPI framework for Bay Area home health operations.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l5.s1.overview",
            "scene_title": "Visual showing: California Title 22 and State Mandates"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L05",
          "card_id": "qapi_l5_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l5.s1.delivery"
          },
          "display_title": "California Title 22 and State Mandates",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that title 22, division 5, chapter 6 provides california-specific hha requirements for licensing, administration, and patient rights that layer on top of federal cops. Then verify that adverse event reporting under health and safety code §1279.1/§1279.3 requires urgent events reported within 24 hours and other reportable events within 5 calendar days. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l5.s1.delivery",
            "scene_title": "Visual demonstrating: California Title 22 and State Mandates"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L05",
          "card_id": "qapi_l5_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l5.s1.challenge"
          },
          "display_title": "California Title 22 and State Mandates Challenge",
          "learner_facing_content": "A Care Indeed patient in the San Jose service area develops a stage 3 pressure ulcer acquired after admission. The clinical team documents the event in the patient chart but does not report it to CDPH. Two weeks later, a state surveyor requests adverse event reporting logs.",
          "transcript_text": "What California regulatory requirement was violated?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l5.s1.challenge",
            "scene_title": "Interactive Scenario: California Title 22 and State Mandates"
          },
          "internal_challenge": {
            "id": "qapi_l5_challenge_id",
            "prompt": "What California regulatory requirement was violated?",
            "choices": [
              {
                "id": "A",
                "label": "Title 22 and Health and Safety Code §1279.1/§1279.3 require reportable adverse events like hospital-acquired stage 3/4 pressure ulcers to be reported to CDPH within 5 calendar days of detection."
              },
              {
                "id": "B",
                "label": "California does not require adverse event reporting for home health agencies."
              },
              {
                "id": "C",
                "label": "Adverse events only need to be reported if the patient is hospitalized as a result."
              },
              {
                "id": "D",
                "label": "The event should be reported at the next QAPI committee meeting, not to CDPH directly."
              },
              {
                "id": "E",
                "label": "Reporting requirements only apply to skilled nursing facilities, not home health agencies."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "California Health and Safety Code sections 1279.1 and 1279.3 mandate that reportable adverse events — including stage 3/4 pressure ulcers acquired after admission — must be reported to CDPH within 5 calendar days of detection. Failure to report exposes the agency to state licensing citations independent of federal compliance."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L05",
          "card_id": "qapi_l5_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l5.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "California Health and Safety Code sections 1279.1 and 1279.3 mandate that reportable adverse events — including stage 3/4 pressure ulcers acquired after admission — must be reported to CDPH within 5 calendar days of detection. Failure to report exposes the agency to state licensing citations independent of federal compliance.",
          "transcript_text": "California Health and Safety Code sections 1279.1 and 1279.3 mandate that reportable adverse events — including stage 3/4 pressure ulcers acquired after admission — must be reported to CDPH within 5 calendar days of detection. Failure to report exposes the agency to state licensing citations independent of federal compliance.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l5.s1.debrief",
            "scene_title": "Debriefing: California Title 22 and State Mandates"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What California regulatory requirement was violated?",
        "choices": [
          {
            "id": "A",
            "label": "Title 22 and Health and Safety Code §1279.1/§1279.3 require reportable adverse events like hospital-acquired stage 3/4 pressure ulcers to be reported to CDPH within 5 calendar days of detection."
          },
          {
            "id": "B",
            "label": "California does not require adverse event reporting for home health agencies."
          },
          {
            "id": "C",
            "label": "Adverse events only need to be reported if the patient is hospitalized as a result."
          },
          {
            "id": "D",
            "label": "The event should be reported at the next QAPI committee meeting, not to CDPH directly."
          },
          {
            "id": "E",
            "label": "Reporting requirements only apply to skilled nursing facilities, not home health agencies."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. California Health and Safety Code sections 1279.1 and 1279.3 mandate that reportable adverse events — including stage 3/4 pressure ulcers acquired after admission — must be reported to CDPH within 5 calendar days of detection. Failure to report exposes the agency to state licensing citations independent of federal compliance.",
        "feedbackIncorrect": "Incorrect. California Health and Safety Code sections 1279.1 and 1279.3 mandate that reportable adverse events — including stage 3/4 pressure ulcers acquired after admission — must be reported to CDPH within 5 calendar days of detection. Failure to report exposes the agency to state licensing citations independent of federal compliance."
      }
    },
    {
      "id": "l6",
      "index": 6,
      "title": "Common QAPI Deficiencies and Citation Patterns",
      "estMinutes": 5,
      "learningGoal": "Recognize the most frequently cited QAPI deficiencies to prevent them proactively.",
      "scenario": "During survey, the inspector reviews Care Indeed QAPI meeting minutes. The minutes reference a \"fall prevention initiative\" discussed six months ago, but there is no documented follow-up: no data tracking, no intervention results, and no re-measurement of fall rates.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Top deficiency: QAPI plan exists but no evidence of data trending or measurable improvement activities.</li><li>PIPs with undefined goals, no baseline data, or missing outcome documentation are consistently cited.</li><li>Lack of governing body participation, missing annual program evaluation, and failure to act on quality trends complete the most common citation pattern.</li></ul>",
      "whyItMatters": [
        "Surveyors look for the closed-loop cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring."
      ],
      "practiceExample": "during documentation review, confirm that top deficiency: qapi plan exists but no evidence of data trending or measurable improvement activities. Then verify that pips with undefined goals, no baseline data, or missing outcome documentation are consistently cited. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "Governing Body",
          "definition": "The executive authority (board or owner) with ultimate accountability for ensuring the QAPI program is defined, resourced, monitored, and evaluated."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L06",
          "card_id": "qapi_l6_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l6.s1.overview"
          },
          "display_title": "Common QAPI Deficiencies and Citation Patterns",
          "learner_facing_content": "Top deficiency: QAPI plan exists but no evidence of data trending or measurable improvement activities.\nPIPs with undefined goals, no baseline data, or missing outcome documentation are consistently cited.\nLack of governing body participation, missing annual program evaluation, and failure to act on quality trends complete the most common citation pattern.",
          "learning_goal": "Recognize the most frequently cited QAPI deficiencies to prevent them proactively.",
          "why_it_matters": [
            "Surveyors look for the closed-loop cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l6.s1.overview",
            "scene_title": "Visual showing: Common QAPI Deficiencies and Citation Patterns"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L06",
          "card_id": "qapi_l6_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l6.s1.delivery"
          },
          "display_title": "Common QAPI Deficiencies and Citation Patterns",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that top deficiency: qapi plan exists but no evidence of data trending or measurable improvement activities. Then verify that pips with undefined goals, no baseline data, or missing outcome documentation are consistently cited. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l6.s1.delivery",
            "scene_title": "Visual demonstrating: Common QAPI Deficiencies and Citation Patterns"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L06",
          "card_id": "qapi_l6_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l6.s1.challenge"
          },
          "display_title": "Common QAPI Deficiencies and Citation Patterns Challenge",
          "learner_facing_content": "During survey, the inspector reviews Care Indeed QAPI meeting minutes. The minutes reference a \"fall prevention initiative\" discussed six months ago, but there is no documented follow-up: no data tracking, no intervention results, and no re-measurement of fall rates.",
          "transcript_text": "What closed-loop QAPI failure does this represent?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l6.s1.challenge",
            "scene_title": "Interactive Scenario: Common QAPI Deficiencies and Citation Patterns"
          },
          "internal_challenge": {
            "id": "qapi_l6_challenge_id",
            "prompt": "What closed-loop QAPI failure does this represent?",
            "choices": [
              {
                "id": "A",
                "label": "The agency identified a problem but did not implement corrective action, measure outcomes, or sustain monitoring — the improvement cycle is incomplete."
              },
              {
                "id": "B",
                "label": "Discussing the issue in a meeting is sufficient documentation of QAPI activity."
              },
              {
                "id": "C",
                "label": "Fall prevention is not a high-risk area that requires formal QAPI tracking."
              },
              {
                "id": "D",
                "label": "The six-month gap is acceptable because QAPI reviews are only required annually."
              },
              {
                "id": "E",
                "label": "Meeting minutes alone satisfy the documentation requirement for QAPI activities."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "CMS requires a complete closed-loop improvement cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring. Identifying a problem in meeting minutes without follow-through on corrective action, outcome measurement, and re-evaluation constitutes an incomplete QAPI cycle and is a common survey citation."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L06",
          "card_id": "qapi_l6_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l6.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "CMS requires a complete closed-loop improvement cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring. Identifying a problem in meeting minutes without follow-through on corrective action, outcome measurement, and re-evaluation constitutes an incomplete QAPI cycle and is a common survey citation.",
          "transcript_text": "CMS requires a complete closed-loop improvement cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring. Identifying a problem in meeting minutes without follow-through on corrective action, outcome measurement, and re-evaluation constitutes an incomplete QAPI cycle and is a common survey citation.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l6.s1.debrief",
            "scene_title": "Debriefing: Common QAPI Deficiencies and Citation Patterns"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What closed-loop QAPI failure does this represent?",
        "choices": [
          {
            "id": "A",
            "label": "The agency identified a problem but did not implement corrective action, measure outcomes, or sustain monitoring — the improvement cycle is incomplete."
          },
          {
            "id": "B",
            "label": "Discussing the issue in a meeting is sufficient documentation of QAPI activity."
          },
          {
            "id": "C",
            "label": "Fall prevention is not a high-risk area that requires formal QAPI tracking."
          },
          {
            "id": "D",
            "label": "The six-month gap is acceptable because QAPI reviews are only required annually."
          },
          {
            "id": "E",
            "label": "Meeting minutes alone satisfy the documentation requirement for QAPI activities."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. CMS requires a complete closed-loop improvement cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring. Identifying a problem in meeting minutes without follow-through on corrective action, outcome measurement, and re-evaluation constitutes an incomplete QAPI cycle and is a common survey citation.",
        "feedbackIncorrect": "Incorrect. CMS requires a complete closed-loop improvement cycle: problem identified → intervention implemented → measurable improvement → sustained monitoring. Identifying a problem in meeting minutes without follow-through on corrective action, outcome measurement, and re-evaluation constitutes an incomplete QAPI cycle and is a common survey citation."
      }
    },
    {
      "id": "l7",
      "index": 7,
      "title": "Interdisciplinary QAPI Roles and Responsibilities",
      "estMinutes": 5,
      "learningGoal": "Delineate QAPI roles across governing body, administrators, QA specialists, and field clinicians.",
      "scenario": "Care Indeed QA specialist identifies a pattern of missed wound measurements in nursing documentation. She presents findings at the QAPI meeting, but the administrator responds, \"That is a nursing problem, not a QAPI issue.\" No corrective action is assigned.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Governing body: sets strategic priorities, ensures adequate QAPI resourcing, and maintains executive oversight documented in board minutes.</li><li>Administrator and QA specialist: manage day-to-day QAPI operations including data collection, chart audits, incident tracking, and PIP coordination.</li><li>Field clinicians (RN, PT, OT, SLP): serve as frontline data gatherers whose documentation fuels the entire quality program.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that governing body: sets strategic priorities, ensures adequate qapi resourcing, and maintains executive oversight documented in board minutes. Then verify that administrator and qa specialist: manage day-to-day qapi operations including data collection, chart audits, incident tracking, and pip coordination. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI",
          "definition": "Quality Assessment and Performance Improvement — a CMS-mandated, agency-wide, data-driven quality program required under 42 CFR §484.65."
        },
        {
          "term": "Governing Body",
          "definition": "The executive authority (board or owner) with ultimate accountability for ensuring the QAPI program is defined, resourced, monitored, and evaluated."
        }
      ],
      "transcript": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "summary": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L07",
          "card_id": "qapi_l7_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l7.s1.overview"
          },
          "display_title": "Interdisciplinary QAPI Roles and Responsibilities",
          "learner_facing_content": "Governing body: sets strategic priorities, ensures adequate QAPI resourcing, and maintains executive oversight documented in board minutes.\nAdministrator and QA specialist: manage day-to-day QAPI operations including data collection, chart audits, incident tracking, and PIP coordination.\nField clinicians (RN, PT, OT, SLP): serve as frontline data gatherers whose documentation fuels the entire quality program.",
          "learning_goal": "Delineate QAPI roles across governing body, administrators, QA specialists, and field clinicians.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l7.s1.overview",
            "scene_title": "Visual showing: Interdisciplinary QAPI Roles and Responsibilities"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L07",
          "card_id": "qapi_l7_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l7.s1.delivery"
          },
          "display_title": "Interdisciplinary QAPI Roles and Responsibilities",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e).</p><p style=\"margin-bottom:8px;\">Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes.</p><p style=\"margin-bottom:8px;\">Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body.</p><p style=\"margin-bottom:8px;\">Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.</p>",
          "cna_practice_example": "during documentation review, confirm that governing body: sets strategic priorities, ensures adequate qapi resourcing, and maintains executive oversight documented in board minutes. Then verify that administrator and qa specialist: manage day-to-day qapi operations including data collection, chart audits, incident tracking, and pip coordination. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "transcript_text": "CMS requires every Medicare-certified HHA to maintain a data-driven, agency-wide QAPI program under 42 CFR §484.65 standards (a)–(e). Surveyors assess not just the existence of the program but whether it operates continuously with measurable outcomes. Common deficiencies include absence of data-driven decisions, inactive PIPs, and failure to involve the governing body. Agencies that treat QAPI as a compliance exercise rather than an operational system consistently receive condition-level citations.",
          "estimated_narration_seconds": 29,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l7.s1.delivery",
            "scene_title": "Visual demonstrating: Interdisciplinary QAPI Roles and Responsibilities"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L07",
          "card_id": "qapi_l7_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l7.s1.challenge"
          },
          "display_title": "Interdisciplinary QAPI Roles and Responsibilities Challenge",
          "learner_facing_content": "Care Indeed QA specialist identifies a pattern of missed wound measurements in nursing documentation. She presents findings at the QAPI meeting, but the administrator responds, \"That is a nursing problem, not a QAPI issue.\" No corrective action is assigned.",
          "transcript_text": "What organizational QAPI failure does this response illustrate?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l7.s1.challenge",
            "scene_title": "Interactive Scenario: Interdisciplinary QAPI Roles and Responsibilities"
          },
          "internal_challenge": {
            "id": "qapi_l7_challenge_id",
            "prompt": "What organizational QAPI failure does this response illustrate?",
            "choices": [
              {
                "id": "A",
                "label": "Documentation patterns that affect patient outcomes are inherently QAPI issues — the administrator must treat systematic clinical documentation failures as quality improvement opportunities, not isolated discipline problems."
              },
              {
                "id": "B",
                "label": "The administrator is correct that wound measurement is solely a nursing responsibility outside QAPI scope."
              },
              {
                "id": "C",
                "label": "QA specialists should not present clinical findings at QAPI meetings."
              },
              {
                "id": "D",
                "label": "QAPI only addresses billing and reimbursement issues, not clinical documentation patterns."
              },
              {
                "id": "E",
                "label": "Individual nursing errors do not rise to the level of QAPI concern unless a patient is harmed."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "QAPI requires a system-level approach to quality. Documentation patterns affecting patient outcomes and care quality are within QAPI scope under Standard (c), which directs focus on high-risk and problem-prone areas. Dismissing systematic clinical issues as isolated discipline problems undermines the agency-wide improvement mandate of 42 CFR §484.65."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L07",
          "card_id": "qapi_l7_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l7.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "QAPI requires a system-level approach to quality. Documentation patterns affecting patient outcomes and care quality are within QAPI scope under Standard (c), which directs focus on high-risk and problem-prone areas. Dismissing systematic clinical issues as isolated discipline problems undermines the agency-wide improvement mandate of 42 CFR §484.65.",
          "transcript_text": "QAPI requires a system-level approach to quality. Documentation patterns affecting patient outcomes and care quality are within QAPI scope under Standard (c), which directs focus on high-risk and problem-prone areas. Dismissing systematic clinical issues as isolated discipline problems undermines the agency-wide improvement mandate of 42 CFR §484.65.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l7.s1.debrief",
            "scene_title": "Debriefing: Interdisciplinary QAPI Roles and Responsibilities"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What organizational QAPI failure does this response illustrate?",
        "choices": [
          {
            "id": "A",
            "label": "Documentation patterns that affect patient outcomes are inherently QAPI issues — the administrator must treat systematic clinical documentation failures as quality improvement opportunities, not isolated discipline problems."
          },
          {
            "id": "B",
            "label": "The administrator is correct that wound measurement is solely a nursing responsibility outside QAPI scope."
          },
          {
            "id": "C",
            "label": "QA specialists should not present clinical findings at QAPI meetings."
          },
          {
            "id": "D",
            "label": "QAPI only addresses billing and reimbursement issues, not clinical documentation patterns."
          },
          {
            "id": "E",
            "label": "Individual nursing errors do not rise to the level of QAPI concern unless a patient is harmed."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. QAPI requires a system-level approach to quality. Documentation patterns affecting patient outcomes and care quality are within QAPI scope under Standard (c), which directs focus on high-risk and problem-prone areas. Dismissing systematic clinical issues as isolated discipline problems undermines the agency-wide improvement mandate of 42 CFR §484.65.",
        "feedbackIncorrect": "Incorrect. QAPI requires a system-level approach to quality. Documentation patterns affecting patient outcomes and care quality are within QAPI scope under Standard (c), which directs focus on high-risk and problem-prone areas. Dismissing systematic clinical issues as isolated discipline problems undermines the agency-wide improvement mandate of 42 CFR §484.65."
      }
    },
    {
      "id": "l8",
      "index": 8,
      "title": "Key HHA Quality Indicators",
      "estMinutes": 5,
      "learningGoal": "Identify the critical quality indicators every home health agency must track under QAPI.",
      "scenario": "Care Indeed QAPI committee selects \"staff parking availability\" and \"office supply costs\" as quality indicators. The surveyor asks for indicators reflecting patient health outcomes, safety, and quality of care.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Core indicators include 30-day rehospitalization rate, OASIS accuracy score, HHCAHPS patient satisfaction, infection rates, and timely initiation of care.</li><li>Under PDGM, documentation-driven metrics like visit frequency compliance and PDGM continuity-of-care rate are essential for reimbursement integrity.</li><li>Each indicator must have a defined threshold, data source, collection frequency, and responsible owner.</li></ul>",
      "whyItMatters": [
        "Surveyors verify that selected indicators are tied to health outcomes — not generic operational metrics."
      ],
      "practiceExample": "during documentation review, confirm that core indicators include 30-day rehospitalization rate, oasis accuracy score, hhcahps patient satisfaction, infection rates, and timely initiation of care. Then verify that under pdgm, documentation-driven metrics like visit frequency compliance and pdgm continuity-of-care rate are essential for reimbursement integrity. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "Quality Indicator",
          "definition": "A measurable metric reflecting health outcomes, patient safety, or quality of care that is tracked over time to identify trends and improvement opportunities."
        },
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        },
        {
          "term": "HHCAHPS",
          "definition": "Home Health Consumer Assessment of Healthcare Providers and Systems — a patient satisfaction survey measuring care experience and communication."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L08",
          "card_id": "qapi_l8_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l8.s1.overview"
          },
          "display_title": "Key HHA Quality Indicators",
          "learner_facing_content": "Core indicators include 30-day rehospitalization rate, OASIS accuracy score, HHCAHPS patient satisfaction, infection rates, and timely initiation of care.\nUnder PDGM, documentation-driven metrics like visit frequency compliance and PDGM continuity-of-care rate are essential for reimbursement integrity.\nEach indicator must have a defined threshold, data source, collection frequency, and responsible owner.",
          "learning_goal": "Identify the critical quality indicators every home health agency must track under QAPI.",
          "why_it_matters": [
            "Surveyors verify that selected indicators are tied to health outcomes — not generic operational metrics."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l8.s1.overview",
            "scene_title": "Visual showing: Key HHA Quality Indicators"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L08",
          "card_id": "qapi_l8_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l8.s1.delivery"
          },
          "display_title": "Key HHA Quality Indicators",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that core indicators include 30-day rehospitalization rate, oasis accuracy score, hhcahps patient satisfaction, infection rates, and timely initiation of care. Then verify that under pdgm, documentation-driven metrics like visit frequency compliance and pdgm continuity-of-care rate are essential for reimbursement integrity. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l8.s1.delivery",
            "scene_title": "Visual demonstrating: Key HHA Quality Indicators"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L08",
          "card_id": "qapi_l8_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l8.s1.challenge"
          },
          "display_title": "Key HHA Quality Indicators Challenge",
          "learner_facing_content": "Care Indeed QAPI committee selects \"staff parking availability\" and \"office supply costs\" as quality indicators. The surveyor asks for indicators reflecting patient health outcomes, safety, and quality of care.",
          "transcript_text": "Why do these selected indicators fail CMS requirements?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l8.s1.challenge",
            "scene_title": "Interactive Scenario: Key HHA Quality Indicators"
          },
          "internal_challenge": {
            "id": "qapi_l8_challenge_id",
            "prompt": "Why do these selected indicators fail CMS requirements?",
            "choices": [
              {
                "id": "A",
                "label": "Standard (a) requires indicators that reflect health outcomes, patient safety, and quality of care — operational metrics like parking and supplies do not meet this standard."
              },
              {
                "id": "B",
                "label": "Any metrics the agency selects are acceptable as long as they are measured consistently."
              },
              {
                "id": "C",
                "label": "CMS does not specify what types of indicators agencies must track."
              },
              {
                "id": "D",
                "label": "Staff convenience metrics are acceptable proxies for patient care quality."
              },
              {
                "id": "E",
                "label": "The surveyor is overstepping because indicator selection is entirely at agency discretion."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "42 CFR §484.65(a) requires the QAPI program scope to include measurable indicators tied to health outcomes, patient safety, and quality of care. Operational metrics unrelated to clinical performance — such as parking and office supplies — do not satisfy this standard and will be cited as non-compliant."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L08",
          "card_id": "qapi_l8_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l8.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "42 CFR §484.65(a) requires the QAPI program scope to include measurable indicators tied to health outcomes, patient safety, and quality of care. Operational metrics unrelated to clinical performance — such as parking and office supplies — do not satisfy this standard and will be cited as non-compliant.",
          "transcript_text": "42 CFR §484.65(a) requires the QAPI program scope to include measurable indicators tied to health outcomes, patient safety, and quality of care. Operational metrics unrelated to clinical performance — such as parking and office supplies — do not satisfy this standard and will be cited as non-compliant.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l8.s1.debrief",
            "scene_title": "Debriefing: Key HHA Quality Indicators"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Why do these selected indicators fail CMS requirements?",
        "choices": [
          {
            "id": "A",
            "label": "Standard (a) requires indicators that reflect health outcomes, patient safety, and quality of care — operational metrics like parking and supplies do not meet this standard."
          },
          {
            "id": "B",
            "label": "Any metrics the agency selects are acceptable as long as they are measured consistently."
          },
          {
            "id": "C",
            "label": "CMS does not specify what types of indicators agencies must track."
          },
          {
            "id": "D",
            "label": "Staff convenience metrics are acceptable proxies for patient care quality."
          },
          {
            "id": "E",
            "label": "The surveyor is overstepping because indicator selection is entirely at agency discretion."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. 42 CFR §484.65(a) requires the QAPI program scope to include measurable indicators tied to health outcomes, patient safety, and quality of care. Operational metrics unrelated to clinical performance — such as parking and office supplies — do not satisfy this standard and will be cited as non-compliant.",
        "feedbackIncorrect": "Incorrect. 42 CFR §484.65(a) requires the QAPI program scope to include measurable indicators tied to health outcomes, patient safety, and quality of care. Operational metrics unrelated to clinical performance — such as parking and office supplies — do not satisfy this standard and will be cited as non-compliant."
      }
    },
    {
      "id": "l9",
      "index": 9,
      "title": "OASIS Data as the Quality Foundation",
      "estMinutes": 5,
      "learningGoal": "Explain how OASIS data drives quality measurement, Star Ratings, and QAPI program design.",
      "scenario": "Care Indeed has been submitting OASIS assessments only for Medicare patients. Starting July 2025, CMS requires all-payer OASIS submission. The agency has not updated its workflow for Medicaid and private-pay patients.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>OASIS assessments at SOC, ROC, and Discharge provide standardized outcome measures used by CMS for quality reporting and payment adjustments.</li><li>All-payer OASIS submission (effective July 2025) requires full assessments for patients with any pay source, not just traditional Medicare.</li><li>Agencies that fail to submit matching assessments for 90% or more of episodes risk a 2% reduction in Medicare reimbursement under the Quality Reporting Program.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that oasis assessments at soc, roc, and discharge provide standardized outcome measures used by cms for quality reporting and payment adjustments. Then verify that all-payer oasis submission (effective july 2025) requires full assessments for patients with any pay source, not just traditional medicare. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L09",
          "card_id": "qapi_l9_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l9.s1.overview"
          },
          "display_title": "OASIS Data as the Quality Foundation",
          "learner_facing_content": "OASIS assessments at SOC, ROC, and Discharge provide standardized outcome measures used by CMS for quality reporting and payment adjustments.\nAll-payer OASIS submission (effective July 2025) requires full assessments for patients with any pay source, not just traditional Medicare.\nAgencies that fail to submit matching assessments for 90% or more of episodes risk a 2% reduction in Medicare reimbursement under the Quality Reporting Program.",
          "learning_goal": "Explain how OASIS data drives quality measurement, Star Ratings, and QAPI program design.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l9.s1.overview",
            "scene_title": "Visual showing: OASIS Data as the Quality Foundation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L09",
          "card_id": "qapi_l9_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l9.s1.delivery"
          },
          "display_title": "OASIS Data as the Quality Foundation",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that oasis assessments at soc, roc, and discharge provide standardized outcome measures used by cms for quality reporting and payment adjustments. Then verify that all-payer oasis submission (effective july 2025) requires full assessments for patients with any pay source, not just traditional medicare. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l9.s1.delivery",
            "scene_title": "Visual demonstrating: OASIS Data as the Quality Foundation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L09",
          "card_id": "qapi_l9_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l9.s1.challenge"
          },
          "display_title": "OASIS Data as the Quality Foundation Challenge",
          "learner_facing_content": "Care Indeed has been submitting OASIS assessments only for Medicare patients. Starting July 2025, CMS requires all-payer OASIS submission. The agency has not updated its workflow for Medicaid and private-pay patients.",
          "transcript_text": "What compliance and financial risk does this create?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l9.s1.challenge",
            "scene_title": "Interactive Scenario: OASIS Data as the Quality Foundation"
          },
          "internal_challenge": {
            "id": "qapi_l9_challenge_id",
            "prompt": "What compliance and financial risk does this create?",
            "choices": [
              {
                "id": "A",
                "label": "Failure to submit all-payer OASIS matching assessments for at least 90% of episodes can result in a 2% Medicare reimbursement reduction under the Quality Reporting Program."
              },
              {
                "id": "B",
                "label": "All-payer OASIS is optional and only affects agencies that voluntarily participate."
              },
              {
                "id": "C",
                "label": "OASIS submission for non-Medicare patients has no effect on reimbursement."
              },
              {
                "id": "D",
                "label": "The 2% reduction only applies to the specific non-Medicare claims with missing assessments."
              },
              {
                "id": "E",
                "label": "CMS extended the all-payer OASIS deadline to 2027."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "The all-payer OASIS mandate effective July 2025 requires agencies to submit matching SOC and EOC assessments for patients with any pay source. Agencies falling below 90% matching assessment compliance risk a 2% Medicare reimbursement reduction under the Quality Reporting Program, affecting all Medicare payments — not just non-compliant claims."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L09",
          "card_id": "qapi_l9_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l9.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "The all-payer OASIS mandate effective July 2025 requires agencies to submit matching SOC and EOC assessments for patients with any pay source. Agencies falling below 90% matching assessment compliance risk a 2% Medicare reimbursement reduction under the Quality Reporting Program, affecting all Medicare payments — not just non-compliant claims.",
          "transcript_text": "The all-payer OASIS mandate effective July 2025 requires agencies to submit matching SOC and EOC assessments for patients with any pay source. Agencies falling below 90% matching assessment compliance risk a 2% Medicare reimbursement reduction under the Quality Reporting Program, affecting all Medicare payments — not just non-compliant claims.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l9.s1.debrief",
            "scene_title": "Debriefing: OASIS Data as the Quality Foundation"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What compliance and financial risk does this create?",
        "choices": [
          {
            "id": "A",
            "label": "Failure to submit all-payer OASIS matching assessments for at least 90% of episodes can result in a 2% Medicare reimbursement reduction under the Quality Reporting Program."
          },
          {
            "id": "B",
            "label": "All-payer OASIS is optional and only affects agencies that voluntarily participate."
          },
          {
            "id": "C",
            "label": "OASIS submission for non-Medicare patients has no effect on reimbursement."
          },
          {
            "id": "D",
            "label": "The 2% reduction only applies to the specific non-Medicare claims with missing assessments."
          },
          {
            "id": "E",
            "label": "CMS extended the all-payer OASIS deadline to 2027."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. The all-payer OASIS mandate effective July 2025 requires agencies to submit matching SOC and EOC assessments for patients with any pay source. Agencies falling below 90% matching assessment compliance risk a 2% Medicare reimbursement reduction under the Quality Reporting Program, affecting all Medicare payments — not just non-compliant claims.",
        "feedbackIncorrect": "Incorrect. The all-payer OASIS mandate effective July 2025 requires agencies to submit matching SOC and EOC assessments for patients with any pay source. Agencies falling below 90% matching assessment compliance risk a 2% Medicare reimbursement reduction under the Quality Reporting Program, affecting all Medicare payments — not just non-compliant claims."
      }
    },
    {
      "id": "l10",
      "index": 10,
      "title": "Building a Quality Dashboard",
      "estMinutes": 5,
      "learningGoal": "Design an operational QAPI dashboard that tracks actionable metrics for leadership review.",
      "scenario": "Care Indeed QA coordinator presents a quarterly dashboard showing that the 30-day rehospitalization rate increased from 14% to 22% over three months in the Menlo Park service area. Leadership says, \"We will watch it another quarter before acting.\"",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>A QAPI dashboard should display KPIs including: 30-day readmission rate, ADR incidence per 100 claims, documentation audit pass rate, OASIS error rate, and QAPI meeting completion rate.</li><li>Dashboard data should be updated at minimum quarterly and presented at every QAPI committee meeting for trend analysis.</li><li>Visual displays (trend charts, heat maps) enable leadership to spot outliers and prioritize corrective interventions quickly.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that a qapi dashboard should display kpis including: 30-day readmission rate, adr incidence per 100 claims, documentation audit pass rate, oasis error rate, and qapi meeting completion rate. Then verify that dashboard data should be updated at minimum quarterly and presented at every qapi committee meeting for trend analysis. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        },
        {
          "term": "Trend Analysis",
          "definition": "The process of examining quality data across multiple periods to identify meaningful patterns versus random variation."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L10",
          "card_id": "qapi_l10_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l10.s1.overview"
          },
          "display_title": "Building a Quality Dashboard",
          "learner_facing_content": "A QAPI dashboard should display KPIs including: 30-day readmission rate, ADR incidence per 100 claims, documentation audit pass rate, OASIS error rate, and QAPI meeting completion rate.\nDashboard data should be updated at minimum quarterly and presented at every QAPI committee meeting for trend analysis.\nVisual displays (trend charts, heat maps) enable leadership to spot outliers and prioritize corrective interventions quickly.",
          "learning_goal": "Design an operational QAPI dashboard that tracks actionable metrics for leadership review.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l10.s1.overview",
            "scene_title": "Visual showing: Building a Quality Dashboard"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L10",
          "card_id": "qapi_l10_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l10.s1.delivery"
          },
          "display_title": "Building a Quality Dashboard",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that a qapi dashboard should display kpis including: 30-day readmission rate, adr incidence per 100 claims, documentation audit pass rate, oasis error rate, and qapi meeting completion rate. Then verify that dashboard data should be updated at minimum quarterly and presented at every qapi committee meeting for trend analysis. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l10.s1.delivery",
            "scene_title": "Visual demonstrating: Building a Quality Dashboard"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L10",
          "card_id": "qapi_l10_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l10.s1.challenge"
          },
          "display_title": "Building a Quality Dashboard Challenge",
          "learner_facing_content": "Care Indeed QA coordinator presents a quarterly dashboard showing that the 30-day rehospitalization rate increased from 14% to 22% over three months in the Menlo Park service area. Leadership says, \"We will watch it another quarter before acting.\"",
          "transcript_text": "What QAPI principle does this delayed response violate?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l10.s1.challenge",
            "scene_title": "Interactive Scenario: Building a Quality Dashboard"
          },
          "internal_challenge": {
            "id": "qapi_l10_challenge_id",
            "prompt": "What QAPI principle does this delayed response violate?",
            "choices": [
              {
                "id": "A",
                "label": "Standard (c) requires the agency to focus on high-risk areas and take immediate corrective action when data reveals patient safety concerns — a 57% increase in readmissions demands immediate investigation."
              },
              {
                "id": "B",
                "label": "Waiting one additional quarter is acceptable because trends must be observed over at least six months."
              },
              {
                "id": "C",
                "label": "Readmission rate increases are expected seasonally and do not require QAPI action."
              },
              {
                "id": "D",
                "label": "The QA coordinator should handle this independently without involving leadership."
              },
              {
                "id": "E",
                "label": "Dashboard data is informational only and does not trigger mandatory QAPI activities."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Under Standard (c), the QAPI program must focus on high-risk, high-volume areas and take immediate corrective action for identified patient safety threats. A 57% increase in readmissions over three months is a significant adverse trend requiring immediate root-cause analysis, not passive monitoring for another quarter."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L10",
          "card_id": "qapi_l10_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l10.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Under Standard (c), the QAPI program must focus on high-risk, high-volume areas and take immediate corrective action for identified patient safety threats. A 57% increase in readmissions over three months is a significant adverse trend requiring immediate root-cause analysis, not passive monitoring for another quarter.",
          "transcript_text": "Under Standard (c), the QAPI program must focus on high-risk, high-volume areas and take immediate corrective action for identified patient safety threats. A 57% increase in readmissions over three months is a significant adverse trend requiring immediate root-cause analysis, not passive monitoring for another quarter.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l10.s1.debrief",
            "scene_title": "Debriefing: Building a Quality Dashboard"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What QAPI principle does this delayed response violate?",
        "choices": [
          {
            "id": "A",
            "label": "Standard (c) requires the agency to focus on high-risk areas and take immediate corrective action when data reveals patient safety concerns — a 57% increase in readmissions demands immediate investigation."
          },
          {
            "id": "B",
            "label": "Waiting one additional quarter is acceptable because trends must be observed over at least six months."
          },
          {
            "id": "C",
            "label": "Readmission rate increases are expected seasonally and do not require QAPI action."
          },
          {
            "id": "D",
            "label": "The QA coordinator should handle this independently without involving leadership."
          },
          {
            "id": "E",
            "label": "Dashboard data is informational only and does not trigger mandatory QAPI activities."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Under Standard (c), the QAPI program must focus on high-risk, high-volume areas and take immediate corrective action for identified patient safety threats. A 57% increase in readmissions over three months is a significant adverse trend requiring immediate root-cause analysis, not passive monitoring for another quarter.",
        "feedbackIncorrect": "Incorrect. Under Standard (c), the QAPI program must focus on high-risk, high-volume areas and take immediate corrective action for identified patient safety threats. A 57% increase in readmissions over three months is a significant adverse trend requiring immediate root-cause analysis, not passive monitoring for another quarter."
      }
    },
    {
      "id": "l11",
      "index": 11,
      "title": "Incident Tracking and Adverse Event Analysis",
      "estMinutes": 5,
      "learningGoal": "Implement systematic incident tracking that feeds actionable data into the QAPI program.",
      "scenario": "Over three months, Care Indeed logs four patient falls in the San Jose region. Each incident is documented individually in the patient chart, but no aggregate analysis is performed. The QAPI committee has not been informed of the pattern.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>All adverse events — falls, infections, medication errors, missed visits, emergency department utilization — must be logged, tracked, and analyzed for patterns.</li><li>Root Cause Analysis (RCA) or the \"Five Whys\" technique should be applied to all serious events and to recurring patterns identified through tracking.</li><li>Incident data must be aggregated and reported at QAPI committee meetings so corrective actions can be assigned, implemented, and monitored.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that all adverse events — falls, infections, medication errors, missed visits, emergency department utilization — must be logged, tracked, and analyzed for patterns. Then verify that root cause analysis (rca) or the \"five whys\" technique should be applied to all serious events and to recurring patterns identified through tracking. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "Root Cause Analysis (RCA)",
          "definition": "A systematic investigation technique that identifies the fundamental systemic cause of a quality problem, not just its symptoms."
        },
        {
          "term": "Five Whys",
          "definition": "An iterative questioning technique that drills through surface symptoms by asking \"why\" five times to reach the root cause."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L11",
          "card_id": "qapi_l11_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l11.s1.overview"
          },
          "display_title": "Incident Tracking and Adverse Event Analysis",
          "learner_facing_content": "All adverse events — falls, infections, medication errors, missed visits, emergency department utilization — must be logged, tracked, and analyzed for patterns.\nRoot Cause Analysis (RCA) or the \"Five Whys\" technique should be applied to all serious events and to recurring patterns identified through tracking.\nIncident data must be aggregated and reported at QAPI committee meetings so corrective actions can be assigned, implemented, and monitored.",
          "learning_goal": "Implement systematic incident tracking that feeds actionable data into the QAPI program.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l11.s1.overview",
            "scene_title": "Visual showing: Incident Tracking and Adverse Event Analysis"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L11",
          "card_id": "qapi_l11_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l11.s1.delivery"
          },
          "display_title": "Incident Tracking and Adverse Event Analysis",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that all adverse events — falls, infections, medication errors, missed visits, emergency department utilization — must be logged, tracked, and analyzed for patterns. Then verify that root cause analysis (rca) or the \"five whys\" technique should be applied to all serious events and to recurring patterns identified through tracking. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l11.s1.delivery",
            "scene_title": "Visual demonstrating: Incident Tracking and Adverse Event Analysis"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L11",
          "card_id": "qapi_l11_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l11.s1.challenge"
          },
          "display_title": "Incident Tracking and Adverse Event Analysis Challenge",
          "learner_facing_content": "Over three months, Care Indeed logs four patient falls in the San Jose region. Each incident is documented individually in the patient chart, but no aggregate analysis is performed. The QAPI committee has not been informed of the pattern.",
          "transcript_text": "What QAPI data-monitoring failure occurred?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l11.s1.challenge",
            "scene_title": "Interactive Scenario: Incident Tracking and Adverse Event Analysis"
          },
          "internal_challenge": {
            "id": "qapi_l11_challenge_id",
            "prompt": "What QAPI data-monitoring failure occurred?",
            "choices": [
              {
                "id": "A",
                "label": "Individual incident documentation without aggregate analysis and QAPI committee reporting prevents pattern identification and systemic corrective action — the data loop is broken."
              },
              {
                "id": "B",
                "label": "Documenting each fall in the patient chart satisfies all QAPI data requirements."
              },
              {
                "id": "C",
                "label": "Four falls over three months is below the threshold that triggers QAPI review."
              },
              {
                "id": "D",
                "label": "Fall tracking is a risk management function separate from QAPI."
              },
              {
                "id": "E",
                "label": "QAPI only requires tracking events that result in hospitalization."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "QAPI requires systematic data collection and analysis. Individual incident documentation without aggregation and committee reporting breaks the data loop that enables pattern recognition and systemic improvement. The agency must track, aggregate, trend, and report adverse events to the QAPI committee for corrective action assignment."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L11",
          "card_id": "qapi_l11_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l11.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "QAPI requires systematic data collection and analysis. Individual incident documentation without aggregation and committee reporting breaks the data loop that enables pattern recognition and systemic improvement. The agency must track, aggregate, trend, and report adverse events to the QAPI committee for corrective action assignment.",
          "transcript_text": "QAPI requires systematic data collection and analysis. Individual incident documentation without aggregation and committee reporting breaks the data loop that enables pattern recognition and systemic improvement. The agency must track, aggregate, trend, and report adverse events to the QAPI committee for corrective action assignment.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l11.s1.debrief",
            "scene_title": "Debriefing: Incident Tracking and Adverse Event Analysis"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What QAPI data-monitoring failure occurred?",
        "choices": [
          {
            "id": "A",
            "label": "Individual incident documentation without aggregate analysis and QAPI committee reporting prevents pattern identification and systemic corrective action — the data loop is broken."
          },
          {
            "id": "B",
            "label": "Documenting each fall in the patient chart satisfies all QAPI data requirements."
          },
          {
            "id": "C",
            "label": "Four falls over three months is below the threshold that triggers QAPI review."
          },
          {
            "id": "D",
            "label": "Fall tracking is a risk management function separate from QAPI."
          },
          {
            "id": "E",
            "label": "QAPI only requires tracking events that result in hospitalization."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. QAPI requires systematic data collection and analysis. Individual incident documentation without aggregation and committee reporting breaks the data loop that enables pattern recognition and systemic improvement. The agency must track, aggregate, trend, and report adverse events to the QAPI committee for corrective action assignment.",
        "feedbackIncorrect": "Incorrect. QAPI requires systematic data collection and analysis. Individual incident documentation without aggregation and committee reporting breaks the data loop that enables pattern recognition and systemic improvement. The agency must track, aggregate, trend, and report adverse events to the QAPI committee for corrective action assignment."
      }
    },
    {
      "id": "l12",
      "index": 12,
      "title": "Chart Audit Workflows",
      "estMinutes": 5,
      "learningGoal": "Establish recurring chart audit processes that generate quality data for QAPI.",
      "scenario": "Care Indeed clinical manager performs chart audits quarterly, but results are stored on her personal drive and never shared with the QAPI committee. Common errors — missing physician signatures on 15% of audited charts — persist for three consecutive quarters.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Monthly chart audits on a 5% sample of active and discharged patients should verify: visit note completeness, POC accuracy, timely recertifications, signature verifications, and homebound documentation.</li><li>Random OASIS audits each quarter — especially on current patients — should validate clinical logic and coding accuracy against visit documentation.</li><li>Audit findings must be entered into a log, with common error patterns reported at the next QAPI meeting and corrective actions assigned.</li></ul>",
      "whyItMatters": [
        "Documentation audits are the agency first line of defense against ADR exposure and survey citations."
      ],
      "practiceExample": "during documentation review, confirm that monthly chart audits on a 5% sample of active and discharged patients should verify: visit note completeness, poc accuracy, timely recertifications, signature verifications, and homebound documentation. Then verify that random oasis audits each quarter — especially on current patients — should validate clinical logic and coding accuracy against visit documentation. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L12",
          "card_id": "qapi_l12_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l12.s1.overview"
          },
          "display_title": "Chart Audit Workflows",
          "learner_facing_content": "Monthly chart audits on a 5% sample of active and discharged patients should verify: visit note completeness, POC accuracy, timely recertifications, signature verifications, and homebound documentation.\nRandom OASIS audits each quarter — especially on current patients — should validate clinical logic and coding accuracy against visit documentation.\nAudit findings must be entered into a log, with common error patterns reported at the next QAPI meeting and corrective actions assigned.",
          "learning_goal": "Establish recurring chart audit processes that generate quality data for QAPI.",
          "why_it_matters": [
            "Documentation audits are the agency first line of defense against ADR exposure and survey citations."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l12.s1.overview",
            "scene_title": "Visual showing: Chart Audit Workflows"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L12",
          "card_id": "qapi_l12_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l12.s1.delivery"
          },
          "display_title": "Chart Audit Workflows",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that monthly chart audits on a 5% sample of active and discharged patients should verify: visit note completeness, poc accuracy, timely recertifications, signature verifications, and homebound documentation. Then verify that random oasis audits each quarter — especially on current patients — should validate clinical logic and coding accuracy against visit documentation. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l12.s1.delivery",
            "scene_title": "Visual demonstrating: Chart Audit Workflows"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L12",
          "card_id": "qapi_l12_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l12.s1.challenge"
          },
          "display_title": "Chart Audit Workflows Challenge",
          "learner_facing_content": "Care Indeed clinical manager performs chart audits quarterly, but results are stored on her personal drive and never shared with the QAPI committee. Common errors — missing physician signatures on 15% of audited charts — persist for three consecutive quarters.",
          "transcript_text": "What QAPI process failure does this represent?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l12.s1.challenge",
            "scene_title": "Interactive Scenario: Chart Audit Workflows"
          },
          "internal_challenge": {
            "id": "qapi_l12_challenge_id",
            "prompt": "What QAPI process failure does this represent?",
            "choices": [
              {
                "id": "A",
                "label": "Audit findings must be reported at QAPI meetings with corrective actions assigned — storing results without sharing them breaks the improvement feedback loop and allows deficiencies to persist."
              },
              {
                "id": "B",
                "label": "Quarterly audits are sufficient without QAPI committee reporting as long as someone reviews them."
              },
              {
                "id": "C",
                "label": "A 15% signature error rate is within acceptable tolerance and does not require corrective action."
              },
              {
                "id": "D",
                "label": "Chart audits are voluntary best practices, not QAPI requirements."
              },
              {
                "id": "E",
                "label": "The clinical manager should fix errors herself rather than reporting them to the committee."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Chart audit data must flow into the QAPI program through committee reporting and corrective action assignment. Isolated auditing without reporting breaks the feedback loop — persistent 15% signature error rates represent a systemic problem requiring QAPI intervention, not individual manager correction."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L12",
          "card_id": "qapi_l12_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l12.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Chart audit data must flow into the QAPI program through committee reporting and corrective action assignment. Isolated auditing without reporting breaks the feedback loop — persistent 15% signature error rates represent a systemic problem requiring QAPI intervention, not individual manager correction.",
          "transcript_text": "Chart audit data must flow into the QAPI program through committee reporting and corrective action assignment. Isolated auditing without reporting breaks the feedback loop — persistent 15% signature error rates represent a systemic problem requiring QAPI intervention, not individual manager correction.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l12.s1.debrief",
            "scene_title": "Debriefing: Chart Audit Workflows"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What QAPI process failure does this represent?",
        "choices": [
          {
            "id": "A",
            "label": "Audit findings must be reported at QAPI meetings with corrective actions assigned — storing results without sharing them breaks the improvement feedback loop and allows deficiencies to persist."
          },
          {
            "id": "B",
            "label": "Quarterly audits are sufficient without QAPI committee reporting as long as someone reviews them."
          },
          {
            "id": "C",
            "label": "A 15% signature error rate is within acceptable tolerance and does not require corrective action."
          },
          {
            "id": "D",
            "label": "Chart audits are voluntary best practices, not QAPI requirements."
          },
          {
            "id": "E",
            "label": "The clinical manager should fix errors herself rather than reporting them to the committee."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Chart audit data must flow into the QAPI program through committee reporting and corrective action assignment. Isolated auditing without reporting breaks the feedback loop — persistent 15% signature error rates represent a systemic problem requiring QAPI intervention, not individual manager correction.",
        "feedbackIncorrect": "Incorrect. Chart audit data must flow into the QAPI program through committee reporting and corrective action assignment. Isolated auditing without reporting breaks the feedback loop — persistent 15% signature error rates represent a systemic problem requiring QAPI intervention, not individual manager correction."
      }
    },
    {
      "id": "l13",
      "index": 13,
      "title": "Data Sources and Collection Methods",
      "estMinutes": 5,
      "learningGoal": "Identify the primary data sources that feed a comprehensive QAPI monitoring program.",
      "scenario": "Care Indeed QAPI committee reviews only OASIS data when evaluating program performance. Patient complaints about poor communication and a rising infection rate are not captured in any QAPI data source.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>OASIS data provides standardized clinical, functional, and service outcome measures across all patients.</li><li>HHCAHPS surveys capture the patient perspective on care quality, communication effectiveness, and overall care experience.</li><li>Internal data sources include incident reports, chart audit findings, ADR response outcomes, infection logs, medication error reports, and complaint/grievance records.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that oasis data provides standardized clinical, functional, and service outcome measures across all patients. Then verify that hhcahps surveys capture the patient perspective on care quality, communication effectiveness, and overall care experience. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        },
        {
          "term": "HHCAHPS",
          "definition": "Home Health Consumer Assessment of Healthcare Providers and Systems — a patient satisfaction survey measuring care experience and communication."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L13",
          "card_id": "qapi_l13_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l13.s1.overview"
          },
          "display_title": "Data Sources and Collection Methods",
          "learner_facing_content": "OASIS data provides standardized clinical, functional, and service outcome measures across all patients.\nHHCAHPS surveys capture the patient perspective on care quality, communication effectiveness, and overall care experience.\nInternal data sources include incident reports, chart audit findings, ADR response outcomes, infection logs, medication error reports, and complaint/grievance records.",
          "learning_goal": "Identify the primary data sources that feed a comprehensive QAPI monitoring program.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l13.s1.overview",
            "scene_title": "Visual showing: Data Sources and Collection Methods"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L13",
          "card_id": "qapi_l13_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l13.s1.delivery"
          },
          "display_title": "Data Sources and Collection Methods",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that oasis data provides standardized clinical, functional, and service outcome measures across all patients. Then verify that hhcahps surveys capture the patient perspective on care quality, communication effectiveness, and overall care experience. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l13.s1.delivery",
            "scene_title": "Visual demonstrating: Data Sources and Collection Methods"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L13",
          "card_id": "qapi_l13_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l13.s1.challenge"
          },
          "display_title": "Data Sources and Collection Methods Challenge",
          "learner_facing_content": "Care Indeed QAPI committee reviews only OASIS data when evaluating program performance. Patient complaints about poor communication and a rising infection rate are not captured in any QAPI data source.",
          "transcript_text": "What data collection gap exists in this QAPI program?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l13.s1.challenge",
            "scene_title": "Interactive Scenario: Data Sources and Collection Methods"
          },
          "internal_challenge": {
            "id": "qapi_l13_challenge_id",
            "prompt": "What data collection gap exists in this QAPI program?",
            "choices": [
              {
                "id": "A",
                "label": "A comprehensive QAPI program must integrate multiple data sources — OASIS alone is insufficient. HHCAHPS, incident reports, infection logs, and complaint records must be collected and analyzed alongside clinical outcome data."
              },
              {
                "id": "B",
                "label": "OASIS data is the only required data source under 42 CFR §484.65."
              },
              {
                "id": "C",
                "label": "Patient complaints are handled by customer service and are outside QAPI scope."
              },
              {
                "id": "D",
                "label": "Infection tracking is only required for skilled nursing facilities."
              },
              {
                "id": "E",
                "label": "HHCAHPS surveys are optional for agencies with fewer than 60 patients."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Standard (b) requires the QAPI program to use quality indicator data to identify opportunities for improvement. A single data source cannot capture the full picture. OASIS, HHCAHPS, incident reports, infection logs, ADR outcomes, and patient complaints must all be integrated into the QAPI data monitoring framework."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L13",
          "card_id": "qapi_l13_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l13.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Standard (b) requires the QAPI program to use quality indicator data to identify opportunities for improvement. A single data source cannot capture the full picture. OASIS, HHCAHPS, incident reports, infection logs, ADR outcomes, and patient complaints must all be integrated into the QAPI data monitoring framework.",
          "transcript_text": "Standard (b) requires the QAPI program to use quality indicator data to identify opportunities for improvement. A single data source cannot capture the full picture. OASIS, HHCAHPS, incident reports, infection logs, ADR outcomes, and patient complaints must all be integrated into the QAPI data monitoring framework.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l13.s1.debrief",
            "scene_title": "Debriefing: Data Sources and Collection Methods"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What data collection gap exists in this QAPI program?",
        "choices": [
          {
            "id": "A",
            "label": "A comprehensive QAPI program must integrate multiple data sources — OASIS alone is insufficient. HHCAHPS, incident reports, infection logs, and complaint records must be collected and analyzed alongside clinical outcome data."
          },
          {
            "id": "B",
            "label": "OASIS data is the only required data source under 42 CFR §484.65."
          },
          {
            "id": "C",
            "label": "Patient complaints are handled by customer service and are outside QAPI scope."
          },
          {
            "id": "D",
            "label": "Infection tracking is only required for skilled nursing facilities."
          },
          {
            "id": "E",
            "label": "HHCAHPS surveys are optional for agencies with fewer than 60 patients."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Standard (b) requires the QAPI program to use quality indicator data to identify opportunities for improvement. A single data source cannot capture the full picture. OASIS, HHCAHPS, incident reports, infection logs, ADR outcomes, and patient complaints must all be integrated into the QAPI data monitoring framework.",
        "feedbackIncorrect": "Incorrect. Standard (b) requires the QAPI program to use quality indicator data to identify opportunities for improvement. A single data source cannot capture the full picture. OASIS, HHCAHPS, incident reports, infection logs, ADR outcomes, and patient complaints must all be integrated into the QAPI data monitoring framework."
      }
    },
    {
      "id": "l14",
      "index": 14,
      "title": "Trend Analysis and Data-Driven Decision Making",
      "estMinutes": 5,
      "learningGoal": "Apply trend analysis techniques to transform raw QAPI data into actionable improvement decisions.",
      "scenario": "Care Indeed QAPI data shows the OASIS error rate fluctuated between 8% and 12% for four quarters and then jumped to 25% in Q1. The QA coordinator dismisses it as \"a bad quarter\" and does not investigate.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Track each indicator over at least four quarters to establish baselines and detect meaningful trends versus random variation.</li><li>Use run charts or control charts to visually distinguish normal variation from statistically significant shifts requiring intervention.</li><li>When data reveals a sustained negative trend, immediately initiate root-cause analysis and assign a corrective action with a responsible owner and deadline.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that track each indicator over at least four quarters to establish baselines and detect meaningful trends versus random variation. Then verify that use run charts or control charts to visually distinguish normal variation from statistically significant shifts requiring intervention. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "OASIS",
          "definition": "Outcome and Assessment Information Set — a standardized assessment tool required for all home health patients, producing data used for quality measurement and payment."
        },
        {
          "term": "Run Chart",
          "definition": "A simple graph displaying data over time to detect trends, shifts, or patterns that indicate process performance changes."
        },
        {
          "term": "Trend Analysis",
          "definition": "The process of examining quality data across multiple periods to identify meaningful patterns versus random variation."
        },
        {
          "term": "Baseline",
          "definition": "The initial measurement of a quality indicator before an intervention, used as the reference point for measuring improvement."
        }
      ],
      "transcript": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "summary": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L14",
          "card_id": "qapi_l14_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l14.s1.overview"
          },
          "display_title": "Trend Analysis and Data-Driven Decision Making",
          "learner_facing_content": "Track each indicator over at least four quarters to establish baselines and detect meaningful trends versus random variation.\nUse run charts or control charts to visually distinguish normal variation from statistically significant shifts requiring intervention.\nWhen data reveals a sustained negative trend, immediately initiate root-cause analysis and assign a corrective action with a responsible owner and deadline.",
          "learning_goal": "Apply trend analysis techniques to transform raw QAPI data into actionable improvement decisions.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l14.s1.overview",
            "scene_title": "Visual showing: Trend Analysis and Data-Driven Decision Making"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L14",
          "card_id": "qapi_l14_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l14.s1.delivery"
          },
          "display_title": "Trend Analysis and Data-Driven Decision Making",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">quality indicator selection must be data-driven and proportional to services rendered.</p><p style=\"margin-bottom:8px;\">CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle.</p><p style=\"margin-bottom:8px;\">Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b).</p><p style=\"margin-bottom:8px;\">Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.</p>",
          "cna_practice_example": "during documentation review, confirm that track each indicator over at least four quarters to establish baselines and detect meaningful trends versus random variation. Then verify that use run charts or control charts to visually distinguish normal variation from statistically significant shifts requiring intervention. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "transcript_text": "quality indicator selection must be data-driven and proportional to services rendered. CMS surveyors verify that agencies collect, analyze, and act on quality data through a closed-loop improvement cycle. Agencies that rely on anecdotal reporting or incomplete incident tracking fail to demonstrate the monitoring rigor required under §484.65(b). Effective dashboards link OASIS outcomes, incident rates, patient satisfaction scores, and chart-audit findings into one traceable data stream.",
          "estimated_narration_seconds": 28,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l14.s1.delivery",
            "scene_title": "Visual demonstrating: Trend Analysis and Data-Driven Decision Making"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L14",
          "card_id": "qapi_l14_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l14.s1.challenge"
          },
          "display_title": "Trend Analysis and Data-Driven Decision Making Challenge",
          "learner_facing_content": "Care Indeed QAPI data shows the OASIS error rate fluctuated between 8% and 12% for four quarters and then jumped to 25% in Q1. The QA coordinator dismisses it as \"a bad quarter\" and does not investigate.",
          "transcript_text": "What data-driven QAPI response should have occurred?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l14.s1.challenge",
            "scene_title": "Interactive Scenario: Trend Analysis and Data-Driven Decision Making"
          },
          "internal_challenge": {
            "id": "qapi_l14_challenge_id",
            "prompt": "What data-driven QAPI response should have occurred?",
            "choices": [
              {
                "id": "A",
                "label": "A jump from a baseline range of 8-12% to 25% represents a statistically significant shift requiring immediate root-cause analysis, not dismissal — the QAPI program must initiate investigation and corrective action."
              },
              {
                "id": "B",
                "label": "Quarter-to-quarter fluctuations are normal and do not require QAPI investigation."
              },
              {
                "id": "C",
                "label": "OASIS error rates are only concerning if they exceed 50%."
              },
              {
                "id": "D",
                "label": "The QA coordinator should wait two more quarters to confirm the trend before acting."
              },
              {
                "id": "E",
                "label": "Error rate increases are expected during staffing transitions and should not trigger QAPI review."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Effective trend analysis requires distinguishing normal variation from significant shifts. A jump from a 8-12% baseline range to 25% is a clear signal requiring immediate investigation. The QAPI program must respond to significant data shifts with root-cause analysis and corrective action — not dismissal or passive monitoring."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L14",
          "card_id": "qapi_l14_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l14.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Effective trend analysis requires distinguishing normal variation from significant shifts. A jump from a 8-12% baseline range to 25% is a clear signal requiring immediate investigation. The QAPI program must respond to significant data shifts with root-cause analysis and corrective action — not dismissal or passive monitoring.",
          "transcript_text": "Effective trend analysis requires distinguishing normal variation from significant shifts. A jump from a 8-12% baseline range to 25% is a clear signal requiring immediate investigation. The QAPI program must respond to significant data shifts with root-cause analysis and corrective action — not dismissal or passive monitoring.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l14.s1.debrief",
            "scene_title": "Debriefing: Trend Analysis and Data-Driven Decision Making"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What data-driven QAPI response should have occurred?",
        "choices": [
          {
            "id": "A",
            "label": "A jump from a baseline range of 8-12% to 25% represents a statistically significant shift requiring immediate root-cause analysis, not dismissal — the QAPI program must initiate investigation and corrective action."
          },
          {
            "id": "B",
            "label": "Quarter-to-quarter fluctuations are normal and do not require QAPI investigation."
          },
          {
            "id": "C",
            "label": "OASIS error rates are only concerning if they exceed 50%."
          },
          {
            "id": "D",
            "label": "The QA coordinator should wait two more quarters to confirm the trend before acting."
          },
          {
            "id": "E",
            "label": "Error rate increases are expected during staffing transitions and should not trigger QAPI review."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Effective trend analysis requires distinguishing normal variation from significant shifts. A jump from a 8-12% baseline range to 25% is a clear signal requiring immediate investigation. The QAPI program must respond to significant data shifts with root-cause analysis and corrective action — not dismissal or passive monitoring.",
        "feedbackIncorrect": "Incorrect. Effective trend analysis requires distinguishing normal variation from significant shifts. A jump from a 8-12% baseline range to 25% is a clear signal requiring immediate investigation. The QAPI program must respond to significant data shifts with root-cause analysis and corrective action — not dismissal or passive monitoring."
      }
    },
    {
      "id": "l15",
      "index": 15,
      "title": "What Is a PIP and Why It Matters",
      "estMinutes": 5,
      "learningGoal": "Define Performance Improvement Projects and their required elements under CMS standards.",
      "scenario": "Care Indeed submits its annual PIP report. The project title is \"Improve Documentation Quality.\" The report contains one sentence: \"Staff were reminded to document better.\" There are no baseline measurements, no specific goals, no interventions detailed, and no outcome data.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>A PIP is a concentrated, team-based effort to address a systemic quality problem identified through QAPI data analysis.</li><li>CMS requires at least one data-driven PIP annually, proportional to agency size and complexity, with documented rationale and measurable goals.</li><li>Required PIP elements include: problem statement, aim/goal (SMART), baseline data, interventions, measurable outcomes, timeline, and evidence of sustained improvement.</li></ul>",
      "whyItMatters": [
        "Surveyors will request PIP documentation including problem identified, baseline data, interventions, outcomes, and sustainability evidence."
      ],
      "practiceExample": "during documentation review, confirm that a pip is a concentrated, team-based effort to address a systemic quality problem identified through qapi data analysis. Then verify that cms requires at least one data-driven pip annually, proportional to agency size and complexity, with documented rationale and measurable goals. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L15",
          "card_id": "qapi_l15_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l15.s1.overview"
          },
          "display_title": "What Is a PIP and Why It Matters",
          "learner_facing_content": "A PIP is a concentrated, team-based effort to address a systemic quality problem identified through QAPI data analysis.\nCMS requires at least one data-driven PIP annually, proportional to agency size and complexity, with documented rationale and measurable goals.\nRequired PIP elements include: problem statement, aim/goal (SMART), baseline data, interventions, measurable outcomes, timeline, and evidence of sustained improvement.",
          "learning_goal": "Define Performance Improvement Projects and their required elements under CMS standards.",
          "why_it_matters": [
            "Surveyors will request PIP documentation including problem identified, baseline data, interventions, outcomes, and sustainability evidence."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l15.s1.overview",
            "scene_title": "Visual showing: What Is a PIP and Why It Matters"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L15",
          "card_id": "qapi_l15_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l15.s1.delivery"
          },
          "display_title": "What Is a PIP and Why It Matters",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that a pip is a concentrated, team-based effort to address a systemic quality problem identified through qapi data analysis. Then verify that cms requires at least one data-driven pip annually, proportional to agency size and complexity, with documented rationale and measurable goals. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l15.s1.delivery",
            "scene_title": "Visual demonstrating: What Is a PIP and Why It Matters"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L15",
          "card_id": "qapi_l15_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l15.s1.challenge"
          },
          "display_title": "What Is a PIP and Why It Matters Challenge",
          "learner_facing_content": "Care Indeed submits its annual PIP report. The project title is \"Improve Documentation Quality.\" The report contains one sentence: \"Staff were reminded to document better.\" There are no baseline measurements, no specific goals, no interventions detailed, and no outcome data.",
          "transcript_text": "Which required PIP elements are missing?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l15.s1.challenge",
            "scene_title": "Interactive Scenario: What Is a PIP and Why It Matters"
          },
          "internal_challenge": {
            "id": "qapi_l15_challenge_id",
            "prompt": "Which required PIP elements are missing?",
            "choices": [
              {
                "id": "A",
                "label": "All critical elements are missing: problem statement with data justification, SMART goals with measurable targets, baseline data, specific interventions, outcome measurements, timeline, and evidence of sustained improvement."
              },
              {
                "id": "B",
                "label": "The PIP is acceptable because it identifies a relevant topic and describes an action taken."
              },
              {
                "id": "C",
                "label": "PIPs only require a topic and a brief description of the planned action."
              },
              {
                "id": "D",
                "label": "Baseline data is optional if the agency can verbally explain the problem."
              },
              {
                "id": "E",
                "label": "Outcome measurements are only required after the PIP has been active for two years."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Under Standard (d), PIPs must include documented rationale for topic selection, measurable goals, baseline data, specific interventions, outcome measurements, and evidence of sustained progress. A single-sentence reminder without any of these elements fails every requirement and will be cited as a QAPI deficiency."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L15",
          "card_id": "qapi_l15_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l15.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Under Standard (d), PIPs must include documented rationale for topic selection, measurable goals, baseline data, specific interventions, outcome measurements, and evidence of sustained progress. A single-sentence reminder without any of these elements fails every requirement and will be cited as a QAPI deficiency.",
          "transcript_text": "Under Standard (d), PIPs must include documented rationale for topic selection, measurable goals, baseline data, specific interventions, outcome measurements, and evidence of sustained progress. A single-sentence reminder without any of these elements fails every requirement and will be cited as a QAPI deficiency.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l15.s1.debrief",
            "scene_title": "Debriefing: What Is a PIP and Why It Matters"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Which required PIP elements are missing?",
        "choices": [
          {
            "id": "A",
            "label": "All critical elements are missing: problem statement with data justification, SMART goals with measurable targets, baseline data, specific interventions, outcome measurements, timeline, and evidence of sustained improvement."
          },
          {
            "id": "B",
            "label": "The PIP is acceptable because it identifies a relevant topic and describes an action taken."
          },
          {
            "id": "C",
            "label": "PIPs only require a topic and a brief description of the planned action."
          },
          {
            "id": "D",
            "label": "Baseline data is optional if the agency can verbally explain the problem."
          },
          {
            "id": "E",
            "label": "Outcome measurements are only required after the PIP has been active for two years."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Under Standard (d), PIPs must include documented rationale for topic selection, measurable goals, baseline data, specific interventions, outcome measurements, and evidence of sustained progress. A single-sentence reminder without any of these elements fails every requirement and will be cited as a QAPI deficiency.",
        "feedbackIncorrect": "Incorrect. Under Standard (d), PIPs must include documented rationale for topic selection, measurable goals, baseline data, specific interventions, outcome measurements, and evidence of sustained progress. A single-sentence reminder without any of these elements fails every requirement and will be cited as a QAPI deficiency."
      }
    },
    {
      "id": "l16",
      "index": 16,
      "title": "Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone",
      "estMinutes": 5,
      "learningGoal": "Apply evidence-based criteria to select PIP topics that address the agency most critical quality gaps.",
      "scenario": "Care Indeed QAPI committee must select its annual PIP topic. Data shows: (1) 30-day readmission rate increased 40% over two quarters, (2) OASIS error rate is stable at 6%, (3) patient satisfaction scores improved. The committee selects \"Improve office workflow efficiency\" as the PIP.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>High-risk areas include patient falls, infections, medication errors, new admission delays, and potentially preventable hospitalizations.</li><li>High-volume areas include frequent therapy visits, high 30-day readmission volume, large Medicare population segments, and commonly served diagnoses.</li><li>Problem-prone areas are identified by declining HHVBP metrics, rising ADR requests, survey citations, and persistent error trends in chart audits.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that high-risk areas include patient falls, infections, medication errors, new admission delays, and potentially preventable hospitalizations. Then verify that high-volume areas include frequent therapy visits, high 30-day readmission volume, large medicare population segments, and commonly served diagnoses. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        },
        {
          "term": "High-Risk Area",
          "definition": "A clinical or operational area where failure poses significant risk to patient safety — falls, infections, medication errors, and readmissions are common examples."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L16",
          "card_id": "qapi_l16_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l16.s1.overview"
          },
          "display_title": "Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone",
          "learner_facing_content": "High-risk areas include patient falls, infections, medication errors, new admission delays, and potentially preventable hospitalizations.\nHigh-volume areas include frequent therapy visits, high 30-day readmission volume, large Medicare population segments, and commonly served diagnoses.\nProblem-prone areas are identified by declining HHVBP metrics, rising ADR requests, survey citations, and persistent error trends in chart audits.",
          "learning_goal": "Apply evidence-based criteria to select PIP topics that address the agency most critical quality gaps.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l16.s1.overview",
            "scene_title": "Visual showing: Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L16",
          "card_id": "qapi_l16_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l16.s1.delivery"
          },
          "display_title": "Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that high-risk areas include patient falls, infections, medication errors, new admission delays, and potentially preventable hospitalizations. Then verify that high-volume areas include frequent therapy visits, high 30-day readmission volume, large medicare population segments, and commonly served diagnoses. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l16.s1.delivery",
            "scene_title": "Visual demonstrating: Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L16",
          "card_id": "qapi_l16_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l16.s1.challenge"
          },
          "display_title": "Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone Challenge",
          "learner_facing_content": "Care Indeed QAPI committee must select its annual PIP topic. Data shows: (1) 30-day readmission rate increased 40% over two quarters, (2) OASIS error rate is stable at 6%, (3) patient satisfaction scores improved. The committee selects \"Improve office workflow efficiency\" as the PIP.",
          "transcript_text": "Why is this PIP topic selection inappropriate?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l16.s1.challenge",
            "scene_title": "Interactive Scenario: Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone"
          },
          "internal_challenge": {
            "id": "qapi_l16_challenge_id",
            "prompt": "Why is this PIP topic selection inappropriate?",
            "choices": [
              {
                "id": "A",
                "label": "A 40% increase in readmissions is a high-risk, data-driven priority that directly affects patient safety and HHVBP scores — PIP topics must be selected based on clinical data, not operational convenience."
              },
              {
                "id": "B",
                "label": "Office workflow efficiency is an equally valid PIP topic because all improvement counts."
              },
              {
                "id": "C",
                "label": "Readmission increases are expected and do not meet the threshold for PIP selection."
              },
              {
                "id": "D",
                "label": "The committee should select the easiest topic to ensure successful completion."
              },
              {
                "id": "E",
                "label": "PIP topics must be rotated alphabetically through agency departments."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "PIP topic selection must be data-driven and focused on high-risk, high-volume, or problem-prone areas per Standard (c) and (d). A 40% increase in readmissions is a clear clinical priority with patient safety and reimbursement implications — selecting an unrelated operational topic ignores the most critical quality gap."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L16",
          "card_id": "qapi_l16_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l16.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "PIP topic selection must be data-driven and focused on high-risk, high-volume, or problem-prone areas per Standard (c) and (d). A 40% increase in readmissions is a clear clinical priority with patient safety and reimbursement implications — selecting an unrelated operational topic ignores the most critical quality gap.",
          "transcript_text": "PIP topic selection must be data-driven and focused on high-risk, high-volume, or problem-prone areas per Standard (c) and (d). A 40% increase in readmissions is a clear clinical priority with patient safety and reimbursement implications — selecting an unrelated operational topic ignores the most critical quality gap.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l16.s1.debrief",
            "scene_title": "Debriefing: Selecting PIP Topics: High-Risk, High-Volume, Problem-Prone"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Why is this PIP topic selection inappropriate?",
        "choices": [
          {
            "id": "A",
            "label": "A 40% increase in readmissions is a high-risk, data-driven priority that directly affects patient safety and HHVBP scores — PIP topics must be selected based on clinical data, not operational convenience."
          },
          {
            "id": "B",
            "label": "Office workflow efficiency is an equally valid PIP topic because all improvement counts."
          },
          {
            "id": "C",
            "label": "Readmission increases are expected and do not meet the threshold for PIP selection."
          },
          {
            "id": "D",
            "label": "The committee should select the easiest topic to ensure successful completion."
          },
          {
            "id": "E",
            "label": "PIP topics must be rotated alphabetically through agency departments."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. PIP topic selection must be data-driven and focused on high-risk, high-volume, or problem-prone areas per Standard (c) and (d). A 40% increase in readmissions is a clear clinical priority with patient safety and reimbursement implications — selecting an unrelated operational topic ignores the most critical quality gap.",
        "feedbackIncorrect": "Incorrect. PIP topic selection must be data-driven and focused on high-risk, high-volume, or problem-prone areas per Standard (c) and (d). A 40% increase in readmissions is a clear clinical priority with patient safety and reimbursement implications — selecting an unrelated operational topic ignores the most critical quality gap."
      }
    },
    {
      "id": "l17",
      "index": 17,
      "title": "The PDSA Cycle: Plan-Do-Study-Act",
      "estMinutes": 5,
      "learningGoal": "Apply the PDSA improvement methodology to design and execute effective PIPs.",
      "scenario": "Care Indeed pilots a fall prevention protocol in the Menlo Park location for 60 days. Fall rates dropped from 12% to 8%, but clinicians report the TUG test is difficult to perform in small apartments. The QAPI committee must decide next steps.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Plan: identify the problem using data, conduct root-cause analysis (Fishbone Diagram, Five Whys), set SMART goals, and design specific interventions.</li><li>Do: pilot the intervention in a defined setting for a defined period — for example, one service area for 60 days.</li><li>Study: analyze pilot data against baseline to determine effectiveness; Act: adopt, adapt, or abandon the intervention and scale successful changes agency-wide.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that plan: identify the problem using data, conduct root-cause analysis (fishbone diagram, five whys), set smart goals, and design specific interventions. Then verify that do: pilot the intervention in a defined setting for a defined period — for example, one service area for 60 days. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        },
        {
          "term": "PDSA Cycle",
          "definition": "Plan-Do-Study-Act — an iterative improvement methodology for designing, piloting, evaluating, and scaling interventions."
        },
        {
          "term": "SMART Goal",
          "definition": "A goal that is Specific, Measurable, Achievable, Relevant, and Time-bound — required for all PIP objectives."
        },
        {
          "term": "Fishbone Diagram",
          "definition": "An Ishikawa diagram organizing potential root causes into categories (People, Process, Policy, Environment, Equipment, Communication) to systematically analyze a quality problem."
        },
        {
          "term": "Pilot",
          "definition": "A small-scale test of an intervention in a defined setting for a defined period before agency-wide implementation."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L17",
          "card_id": "qapi_l17_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l17.s1.overview"
          },
          "display_title": "The PDSA Cycle: Plan-Do-Study-Act",
          "learner_facing_content": "Plan: identify the problem using data, conduct root-cause analysis (Fishbone Diagram, Five Whys), set SMART goals, and design specific interventions.\nDo: pilot the intervention in a defined setting for a defined period — for example, one service area for 60 days.\nStudy: analyze pilot data against baseline to determine effectiveness; Act: adopt, adapt, or abandon the intervention and scale successful changes agency-wide.",
          "learning_goal": "Apply the PDSA improvement methodology to design and execute effective PIPs.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l17.s1.overview",
            "scene_title": "Visual showing: The PDSA Cycle: Plan-Do-Study-Act"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L17",
          "card_id": "qapi_l17_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l17.s1.delivery"
          },
          "display_title": "The PDSA Cycle: Plan-Do-Study-Act",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that plan: identify the problem using data, conduct root-cause analysis (fishbone diagram, five whys), set smart goals, and design specific interventions. Then verify that do: pilot the intervention in a defined setting for a defined period — for example, one service area for 60 days. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l17.s1.delivery",
            "scene_title": "Visual demonstrating: The PDSA Cycle: Plan-Do-Study-Act"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L17",
          "card_id": "qapi_l17_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l17.s1.challenge"
          },
          "display_title": "The PDSA Cycle: Plan-Do-Study-Act Challenge",
          "learner_facing_content": "Care Indeed pilots a fall prevention protocol in the Menlo Park location for 60 days. Fall rates dropped from 12% to 8%, but clinicians report the TUG test is difficult to perform in small apartments. The QAPI committee must decide next steps.",
          "transcript_text": "What does the \"Act\" phase of PDSA require in this situation?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l17.s1.challenge",
            "scene_title": "Interactive Scenario: The PDSA Cycle: Plan-Do-Study-Act"
          },
          "internal_challenge": {
            "id": "qapi_l17_challenge_id",
            "prompt": "What does the \"Act\" phase of PDSA require in this situation?",
            "choices": [
              {
                "id": "A",
                "label": "Evaluate pilot results, adapt the protocol to address clinician feedback (allow alternative validated assessments for space constraints), and then scale the modified protocol to all locations."
              },
              {
                "id": "B",
                "label": "Abandon the protocol because clinicians reported difficulties."
              },
              {
                "id": "C",
                "label": "Continue the pilot for another year before making any changes."
              },
              {
                "id": "D",
                "label": "Implement the original protocol agency-wide without modification."
              },
              {
                "id": "E",
                "label": "Close the PIP because the fall rate improved during the pilot."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "The Act phase of PDSA requires the team to evaluate results and decide: adopt, adapt, or abandon. With positive results but practical barriers, the correct action is to adapt the protocol (allow alternative assessment tools for space constraints) and scale the modified version agency-wide — this demonstrates the iterative improvement that CMS expects."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L17",
          "card_id": "qapi_l17_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l17.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "The Act phase of PDSA requires the team to evaluate results and decide: adopt, adapt, or abandon. With positive results but practical barriers, the correct action is to adapt the protocol (allow alternative assessment tools for space constraints) and scale the modified version agency-wide — this demonstrates the iterative improvement that CMS expects.",
          "transcript_text": "The Act phase of PDSA requires the team to evaluate results and decide: adopt, adapt, or abandon. With positive results but practical barriers, the correct action is to adapt the protocol (allow alternative assessment tools for space constraints) and scale the modified version agency-wide — this demonstrates the iterative improvement that CMS expects.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l17.s1.debrief",
            "scene_title": "Debriefing: The PDSA Cycle: Plan-Do-Study-Act"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What does the \"Act\" phase of PDSA require in this situation?",
        "choices": [
          {
            "id": "A",
            "label": "Evaluate pilot results, adapt the protocol to address clinician feedback (allow alternative validated assessments for space constraints), and then scale the modified protocol to all locations."
          },
          {
            "id": "B",
            "label": "Abandon the protocol because clinicians reported difficulties."
          },
          {
            "id": "C",
            "label": "Continue the pilot for another year before making any changes."
          },
          {
            "id": "D",
            "label": "Implement the original protocol agency-wide without modification."
          },
          {
            "id": "E",
            "label": "Close the PIP because the fall rate improved during the pilot."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. The Act phase of PDSA requires the team to evaluate results and decide: adopt, adapt, or abandon. With positive results but practical barriers, the correct action is to adapt the protocol (allow alternative assessment tools for space constraints) and scale the modified version agency-wide — this demonstrates the iterative improvement that CMS expects.",
        "feedbackIncorrect": "Incorrect. The Act phase of PDSA requires the team to evaluate results and decide: adopt, adapt, or abandon. With positive results but practical barriers, the correct action is to adapt the protocol (allow alternative assessment tools for space constraints) and scale the modified version agency-wide — this demonstrates the iterative improvement that CMS expects."
      }
    },
    {
      "id": "l18",
      "index": 18,
      "title": "Documenting PIPs for Survey Defensibility",
      "estMinutes": 5,
      "learningGoal": "Create PIP documentation that satisfies surveyor expectations and demonstrates sustained improvement.",
      "scenario": "A surveyor asks to review Care Indeed completed PIP on medication reconciliation. The file shows baseline error rate (18%), the intervention (new reconciliation protocol), and a post-intervention rate (9%). The surveyor then asks: \"How do you know this improvement was sustained?\"",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>PIP files must include: data-driven rationale for topic selection, SMART goal statement, baseline data with source, detailed intervention description, outcome data with trend analysis, and timeline.</li><li>Sustained improvement must be demonstrated through post-intervention monitoring — surveyors expect to see that gains are maintained, not just achieved.</li><li>Document the PDSA cycle explicitly: show what was planned, what was done, what the data showed, and what action was taken based on results.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that pip files must include: data-driven rationale for topic selection, smart goal statement, baseline data with source, detailed intervention description, outcome data with trend analysis, and timeline. Then verify that sustained improvement must be demonstrated through post-intervention monitoring — surveyors expect to see that gains are maintained, not just achieved. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        },
        {
          "term": "PDSA Cycle",
          "definition": "Plan-Do-Study-Act — an iterative improvement methodology for designing, piloting, evaluating, and scaling interventions."
        },
        {
          "term": "SMART Goal",
          "definition": "A goal that is Specific, Measurable, Achievable, Relevant, and Time-bound — required for all PIP objectives."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L18",
          "card_id": "qapi_l18_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l18.s1.overview"
          },
          "display_title": "Documenting PIPs for Survey Defensibility",
          "learner_facing_content": "PIP files must include: data-driven rationale for topic selection, SMART goal statement, baseline data with source, detailed intervention description, outcome data with trend analysis, and timeline.\nSustained improvement must be demonstrated through post-intervention monitoring — surveyors expect to see that gains are maintained, not just achieved.\nDocument the PDSA cycle explicitly: show what was planned, what was done, what the data showed, and what action was taken based on results.",
          "learning_goal": "Create PIP documentation that satisfies surveyor expectations and demonstrates sustained improvement.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l18.s1.overview",
            "scene_title": "Visual showing: Documenting PIPs for Survey Defensibility"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L18",
          "card_id": "qapi_l18_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l18.s1.delivery"
          },
          "display_title": "Documenting PIPs for Survey Defensibility",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that pip files must include: data-driven rationale for topic selection, smart goal statement, baseline data with source, detailed intervention description, outcome data with trend analysis, and timeline. Then verify that sustained improvement must be demonstrated through post-intervention monitoring — surveyors expect to see that gains are maintained, not just achieved. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l18.s1.delivery",
            "scene_title": "Visual demonstrating: Documenting PIPs for Survey Defensibility"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L18",
          "card_id": "qapi_l18_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l18.s1.challenge"
          },
          "display_title": "Documenting PIPs for Survey Defensibility Challenge",
          "learner_facing_content": "A surveyor asks to review Care Indeed completed PIP on medication reconciliation. The file shows baseline error rate (18%), the intervention (new reconciliation protocol), and a post-intervention rate (9%). The surveyor then asks: \"How do you know this improvement was sustained?\"",
          "transcript_text": "What additional documentation does the surveyor expect to see?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l18.s1.challenge",
            "scene_title": "Interactive Scenario: Documenting PIPs for Survey Defensibility"
          },
          "internal_challenge": {
            "id": "qapi_l18_challenge_id",
            "prompt": "What additional documentation does the surveyor expect to see?",
            "choices": [
              {
                "id": "A",
                "label": "Post-intervention monitoring data showing the improved rate was maintained over subsequent quarters — sustainability evidence such as ongoing audit results, trend charts, and continued oversight."
              },
              {
                "id": "B",
                "label": "The post-intervention rate is sufficient evidence of sustained improvement."
              },
              {
                "id": "C",
                "label": "A letter from the administrator stating the improvement will be sustained."
              },
              {
                "id": "D",
                "label": "Re-running the same PIP a second time to prove the results are repeatable."
              },
              {
                "id": "E",
                "label": "Evidence of sustained improvement is only required for condition-level deficiency responses."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Surveyors expect PIPs to demonstrate sustained improvement — not just initial success. Documentation must include post-intervention monitoring over subsequent quarters showing gains were maintained. Trend charts, ongoing audit results, and continued oversight evidence complete the sustainability narrative."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L18",
          "card_id": "qapi_l18_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l18.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Surveyors expect PIPs to demonstrate sustained improvement — not just initial success. Documentation must include post-intervention monitoring over subsequent quarters showing gains were maintained. Trend charts, ongoing audit results, and continued oversight evidence complete the sustainability narrative.",
          "transcript_text": "Surveyors expect PIPs to demonstrate sustained improvement — not just initial success. Documentation must include post-intervention monitoring over subsequent quarters showing gains were maintained. Trend charts, ongoing audit results, and continued oversight evidence complete the sustainability narrative.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l18.s1.debrief",
            "scene_title": "Debriefing: Documenting PIPs for Survey Defensibility"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What additional documentation does the surveyor expect to see?",
        "choices": [
          {
            "id": "A",
            "label": "Post-intervention monitoring data showing the improved rate was maintained over subsequent quarters — sustainability evidence such as ongoing audit results, trend charts, and continued oversight."
          },
          {
            "id": "B",
            "label": "The post-intervention rate is sufficient evidence of sustained improvement."
          },
          {
            "id": "C",
            "label": "A letter from the administrator stating the improvement will be sustained."
          },
          {
            "id": "D",
            "label": "Re-running the same PIP a second time to prove the results are repeatable."
          },
          {
            "id": "E",
            "label": "Evidence of sustained improvement is only required for condition-level deficiency responses."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Surveyors expect PIPs to demonstrate sustained improvement — not just initial success. Documentation must include post-intervention monitoring over subsequent quarters showing gains were maintained. Trend charts, ongoing audit results, and continued oversight evidence complete the sustainability narrative.",
        "feedbackIncorrect": "Incorrect. Surveyors expect PIPs to demonstrate sustained improvement — not just initial success. Documentation must include post-intervention monitoring over subsequent quarters showing gains were maintained. Trend charts, ongoing audit results, and continued oversight evidence complete the sustainability narrative."
      }
    },
    {
      "id": "l19",
      "index": 19,
      "title": "Root Cause Analysis Tools for PIPs",
      "estMinutes": 5,
      "learningGoal": "Apply systematic analysis tools to identify the true causes of quality gaps before designing interventions.",
      "scenario": "A medication error occurs when a nurse administers the wrong dose. The administrator response is: \"Retrain that nurse.\" No further analysis is conducted. Two months later, a different nurse makes the same type of error.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Root Cause Analysis (RCA) moves beyond individual errors to identify systemic factors: process failures, communication gaps, training deficits, and technology limitations.</li><li>The Fishbone (Ishikawa) Diagram organizes causes into categories: People, Process, Policy, Environment, Equipment, and Communication.</li><li>The Five Whys technique drills through surface-level symptoms to uncover the fundamental system failure that must be corrected.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that root cause analysis (rca) moves beyond individual errors to identify systemic factors: process failures, communication gaps, training deficits, and technology limitations. Then verify that the fishbone (ishikawa) diagram organizes causes into categories: people, process, policy, environment, equipment, and communication. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L19",
          "card_id": "qapi_l19_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l19.s1.overview"
          },
          "display_title": "Root Cause Analysis Tools for PIPs",
          "learner_facing_content": "Root Cause Analysis (RCA) moves beyond individual errors to identify systemic factors: process failures, communication gaps, training deficits, and technology limitations.\nThe Fishbone (Ishikawa) Diagram organizes causes into categories: People, Process, Policy, Environment, Equipment, and Communication.\nThe Five Whys technique drills through surface-level symptoms to uncover the fundamental system failure that must be corrected.",
          "learning_goal": "Apply systematic analysis tools to identify the true causes of quality gaps before designing interventions.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l19.s1.overview",
            "scene_title": "Visual showing: Root Cause Analysis Tools for PIPs"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L19",
          "card_id": "qapi_l19_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l19.s1.delivery"
          },
          "display_title": "Root Cause Analysis Tools for PIPs",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that root cause analysis (rca) moves beyond individual errors to identify systemic factors: process failures, communication gaps, training deficits, and technology limitations. Then verify that the fishbone (ishikawa) diagram organizes causes into categories: people, process, policy, environment, equipment, and communication. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l19.s1.delivery",
            "scene_title": "Visual demonstrating: Root Cause Analysis Tools for PIPs"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L19",
          "card_id": "qapi_l19_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l19.s1.challenge"
          },
          "display_title": "Root Cause Analysis Tools for PIPs Challenge",
          "learner_facing_content": "A medication error occurs when a nurse administers the wrong dose. The administrator response is: \"Retrain that nurse.\" No further analysis is conducted. Two months later, a different nurse makes the same type of error.",
          "transcript_text": "What systemic analysis failure does this illustrate?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l19.s1.challenge",
            "scene_title": "Interactive Scenario: Root Cause Analysis Tools for PIPs"
          },
          "internal_challenge": {
            "id": "qapi_l19_challenge_id",
            "prompt": "What systemic analysis failure does this illustrate?",
            "choices": [
              {
                "id": "A",
                "label": "Retraining one nurse addresses individual performance but not the systemic cause — RCA tools like the Five Whys or Fishbone Diagram should identify underlying process, communication, or technology failures that enabled the error."
              },
              {
                "id": "B",
                "label": "Retraining the nurse is the correct and complete response to a medication error."
              },
              {
                "id": "C",
                "label": "Root cause analysis is only required when a patient is hospitalized due to the error."
              },
              {
                "id": "D",
                "label": "Systemic analysis tools are too complex for home health agencies to implement."
              },
              {
                "id": "E",
                "label": "Recurring errors from different staff members are coincidental and do not indicate system problems."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Individual retraining without systemic analysis fails the \"systemic action\" element of QAPI. RCA tools reveal the underlying factors — confusing EHR interfaces, unclear medication protocols, inadequate double-check systems — that enabled the error. Without systemic correction, the same error type will recur with different staff members."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L19",
          "card_id": "qapi_l19_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l19.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Individual retraining without systemic analysis fails the \"systemic action\" element of QAPI. RCA tools reveal the underlying factors — confusing EHR interfaces, unclear medication protocols, inadequate double-check systems — that enabled the error. Without systemic correction, the same error type will recur with different staff members.",
          "transcript_text": "Individual retraining without systemic analysis fails the \"systemic action\" element of QAPI. RCA tools reveal the underlying factors — confusing EHR interfaces, unclear medication protocols, inadequate double-check systems — that enabled the error. Without systemic correction, the same error type will recur with different staff members.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l19.s1.debrief",
            "scene_title": "Debriefing: Root Cause Analysis Tools for PIPs"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What systemic analysis failure does this illustrate?",
        "choices": [
          {
            "id": "A",
            "label": "Retraining one nurse addresses individual performance but not the systemic cause — RCA tools like the Five Whys or Fishbone Diagram should identify underlying process, communication, or technology failures that enabled the error."
          },
          {
            "id": "B",
            "label": "Retraining the nurse is the correct and complete response to a medication error."
          },
          {
            "id": "C",
            "label": "Root cause analysis is only required when a patient is hospitalized due to the error."
          },
          {
            "id": "D",
            "label": "Systemic analysis tools are too complex for home health agencies to implement."
          },
          {
            "id": "E",
            "label": "Recurring errors from different staff members are coincidental and do not indicate system problems."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Individual retraining without systemic analysis fails the \"systemic action\" element of QAPI. RCA tools reveal the underlying factors — confusing EHR interfaces, unclear medication protocols, inadequate double-check systems — that enabled the error. Without systemic correction, the same error type will recur with different staff members.",
        "feedbackIncorrect": "Incorrect. Individual retraining without systemic analysis fails the \"systemic action\" element of QAPI. RCA tools reveal the underlying factors — confusing EHR interfaces, unclear medication protocols, inadequate double-check systems — that enabled the error. Without systemic correction, the same error type will recur with different staff members."
      }
    },
    {
      "id": "l20",
      "index": 20,
      "title": "PIP Examples for Home Health",
      "estMinutes": 5,
      "learningGoal": "Review real-world PIP examples relevant to Care Indeed Bay Area operations.",
      "scenario": "Care Indeed data shows that 25% of readmissions in the Walnut Creek area are related to CHF patients with uncontrolled fluid retention. The QAPI committee wants to design a PIP.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Reducing 30-day rehospitalization: standardize admission medication reconciliation, implement CHF daily weight monitoring protocols, and improve patient/caregiver education at SOC.</li><li>Improving OASIS accuracy: mandatory OASIS training for admitting clinicians, 100% QA review of SOC/ROC assessments, and monthly coding accuracy audits.</li><li>Reducing fall-related injuries: standardized fall risk assessment (TUG test) at SOC/ROC for patients over 65, aide transfer training, and home safety evaluation protocols.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that reducing 30-day rehospitalization: standardize admission medication reconciliation, implement chf daily weight monitoring protocols, and improve patient/caregiver education at soc. Then verify that improving oasis accuracy: mandatory oasis training for admitting clinicians, 100% qa review of soc/roc assessments, and monthly coding accuracy audits. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L20",
          "card_id": "qapi_l20_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l20.s1.overview"
          },
          "display_title": "PIP Examples for Home Health",
          "learner_facing_content": "Reducing 30-day rehospitalization: standardize admission medication reconciliation, implement CHF daily weight monitoring protocols, and improve patient/caregiver education at SOC.\nImproving OASIS accuracy: mandatory OASIS training for admitting clinicians, 100% QA review of SOC/ROC assessments, and monthly coding accuracy audits.\nReducing fall-related injuries: standardized fall risk assessment (TUG test) at SOC/ROC for patients over 65, aide transfer training, and home safety evaluation protocols.",
          "learning_goal": "Review real-world PIP examples relevant to Care Indeed Bay Area operations.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l20.s1.overview",
            "scene_title": "Visual showing: PIP Examples for Home Health"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L20",
          "card_id": "qapi_l20_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l20.s1.delivery"
          },
          "display_title": "PIP Examples for Home Health",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that reducing 30-day rehospitalization: standardize admission medication reconciliation, implement chf daily weight monitoring protocols, and improve patient/caregiver education at soc. Then verify that improving oasis accuracy: mandatory oasis training for admitting clinicians, 100% qa review of soc/roc assessments, and monthly coding accuracy audits. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l20.s1.delivery",
            "scene_title": "Visual demonstrating: PIP Examples for Home Health"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L20",
          "card_id": "qapi_l20_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l20.s1.challenge"
          },
          "display_title": "PIP Examples for Home Health Challenge",
          "learner_facing_content": "Care Indeed data shows that 25% of readmissions in the Walnut Creek area are related to CHF patients with uncontrolled fluid retention. The QAPI committee wants to design a PIP.",
          "transcript_text": "Which intervention set would create a clinically defensible PIP for this problem?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l20.s1.challenge",
            "scene_title": "Interactive Scenario: PIP Examples for Home Health"
          },
          "internal_challenge": {
            "id": "qapi_l20_challenge_id",
            "prompt": "Which intervention set would create a clinically defensible PIP for this problem?",
            "choices": [
              {
                "id": "A",
                "label": "Standardize daily weight monitoring for all CHF patients, implement medication adherence checks including Lasix compliance, provide sodium restriction education, and set a measurable goal to reduce CHF readmissions by 30% over two quarters."
              },
              {
                "id": "B",
                "label": "Send a reminder email to nursing staff about CHF management."
              },
              {
                "id": "C",
                "label": "Increase visit frequency for all patients regardless of diagnosis."
              },
              {
                "id": "D",
                "label": "Transfer all CHF patients to a hospital-based home health agency."
              },
              {
                "id": "E",
                "label": "Discontinue services for high-risk CHF patients to improve readmission statistics."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "An effective CHF readmission PIP combines targeted clinical interventions (daily weights, medication adherence checks, dietary education) with a SMART goal (30% reduction over two quarters). Each intervention addresses a known driver of CHF readmissions, creating a defensible cause-and-effect framework that surveyors can evaluate."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L20",
          "card_id": "qapi_l20_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l20.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "An effective CHF readmission PIP combines targeted clinical interventions (daily weights, medication adherence checks, dietary education) with a SMART goal (30% reduction over two quarters). Each intervention addresses a known driver of CHF readmissions, creating a defensible cause-and-effect framework that surveyors can evaluate.",
          "transcript_text": "An effective CHF readmission PIP combines targeted clinical interventions (daily weights, medication adherence checks, dietary education) with a SMART goal (30% reduction over two quarters). Each intervention addresses a known driver of CHF readmissions, creating a defensible cause-and-effect framework that surveyors can evaluate.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l20.s1.debrief",
            "scene_title": "Debriefing: PIP Examples for Home Health"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Which intervention set would create a clinically defensible PIP for this problem?",
        "choices": [
          {
            "id": "A",
            "label": "Standardize daily weight monitoring for all CHF patients, implement medication adherence checks including Lasix compliance, provide sodium restriction education, and set a measurable goal to reduce CHF readmissions by 30% over two quarters."
          },
          {
            "id": "B",
            "label": "Send a reminder email to nursing staff about CHF management."
          },
          {
            "id": "C",
            "label": "Increase visit frequency for all patients regardless of diagnosis."
          },
          {
            "id": "D",
            "label": "Transfer all CHF patients to a hospital-based home health agency."
          },
          {
            "id": "E",
            "label": "Discontinue services for high-risk CHF patients to improve readmission statistics."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. An effective CHF readmission PIP combines targeted clinical interventions (daily weights, medication adherence checks, dietary education) with a SMART goal (30% reduction over two quarters). Each intervention addresses a known driver of CHF readmissions, creating a defensible cause-and-effect framework that surveyors can evaluate.",
        "feedbackIncorrect": "Incorrect. An effective CHF readmission PIP combines targeted clinical interventions (daily weights, medication adherence checks, dietary education) with a SMART goal (30% reduction over two quarters). Each intervention addresses a known driver of CHF readmissions, creating a defensible cause-and-effect framework that surveyors can evaluate."
      }
    },
    {
      "id": "l21",
      "index": 21,
      "title": "Sustaining Improvement and Avoiding PIP Pitfalls",
      "estMinutes": 5,
      "learningGoal": "Prevent common PIP failures and embed sustained improvement into agency operations.",
      "scenario": "Care Indeed completed a PIP that successfully reduced medication errors by 40%. The QAPI coordinator closes the PIP file and removes medication reconciliation audits from the monthly review cycle. Six months later, medication error rates return to pre-PIP levels.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Common PIP pitfalls: selecting too many projects simultaneously, choosing easy topics instead of data-driven priorities, and declaring success after initial improvement without sustained monitoring.</li><li>Sustainability requires embedding successful interventions into standard operating procedures, updating training curricula, and assigning ongoing monitoring responsibility.</li><li>The governing body must review PIP results and ensure that successful improvements become permanent operational standards — not one-time projects.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that common pip pitfalls: selecting too many projects simultaneously, choosing easy topics instead of data-driven priorities, and declaring success after initial improvement without sustained monitoring. Then verify that sustainability requires embedding successful interventions into standard operating procedures, updating training curricula, and assigning ongoing monitoring responsibility. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "PIP",
          "definition": "Performance Improvement Project — a concentrated, team-based effort to address a systemic quality problem, required at least annually under Standard (d)."
        },
        {
          "term": "Sustainability",
          "definition": "Embedding successful improvements into standard operating procedures, training, and ongoing monitoring to prevent regression after a PIP concludes."
        }
      ],
      "transcript": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "summary": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L21",
          "card_id": "qapi_l21_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l21.s1.overview"
          },
          "display_title": "Sustaining Improvement and Avoiding PIP Pitfalls",
          "learner_facing_content": "Common PIP pitfalls: selecting too many projects simultaneously, choosing easy topics instead of data-driven priorities, and declaring success after initial improvement without sustained monitoring.\nSustainability requires embedding successful interventions into standard operating procedures, updating training curricula, and assigning ongoing monitoring responsibility.\nThe governing body must review PIP results and ensure that successful improvements become permanent operational standards — not one-time projects.",
          "learning_goal": "Prevent common PIP failures and embed sustained improvement into agency operations.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l21.s1.overview",
            "scene_title": "Visual showing: Sustaining Improvement and Avoiding PIP Pitfalls"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L21",
          "card_id": "qapi_l21_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l21.s1.delivery"
          },
          "display_title": "Sustaining Improvement and Avoiding PIP Pitfalls",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">PIPs are the action arm of the QAPI program.</p><p style=\"margin-bottom:8px;\">CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis.</p><p style=\"margin-bottom:8px;\">Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability.</p><p style=\"margin-bottom:8px;\">PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.</p>",
          "cna_practice_example": "during documentation review, confirm that common pip pitfalls: selecting too many projects simultaneously, choosing easy topics instead of data-driven priorities, and declaring success after initial improvement without sustained monitoring. Then verify that sustainability requires embedding successful interventions into standard operating procedures, updating training curricula, and assigning ongoing monitoring responsibility. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "transcript_text": "PIPs are the action arm of the QAPI program. CMS expects at least one active PIP at all times, selected from high-risk, high-volume, or problem-prone areas identified through data analysis. Surveyors evaluate PIP files for evidence of the full PDSA cycle, including baseline measurement, interventions, outcome tracking, and sustainability. PIPs without measurable goals or documented follow-through are the most frequently cited §484.65(d) deficiency.",
          "estimated_narration_seconds": 27,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l21.s1.delivery",
            "scene_title": "Visual demonstrating: Sustaining Improvement and Avoiding PIP Pitfalls"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L21",
          "card_id": "qapi_l21_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l21.s1.challenge"
          },
          "display_title": "Sustaining Improvement and Avoiding PIP Pitfalls Challenge",
          "learner_facing_content": "Care Indeed completed a PIP that successfully reduced medication errors by 40%. The QAPI coordinator closes the PIP file and removes medication reconciliation audits from the monthly review cycle. Six months later, medication error rates return to pre-PIP levels.",
          "transcript_text": "What sustainability failure caused the regression?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l21.s1.challenge",
            "scene_title": "Interactive Scenario: Sustaining Improvement and Avoiding PIP Pitfalls"
          },
          "internal_challenge": {
            "id": "qapi_l21_challenge_id",
            "prompt": "What sustainability failure caused the regression?",
            "choices": [
              {
                "id": "A",
                "label": "Removing monitoring after PIP completion allowed the improvement to decay — successful interventions must be embedded into SOPs, included in ongoing training, and maintained in the audit cycle to sustain gains."
              },
              {
                "id": "B",
                "label": "Medication error rates naturally fluctuate and the regression is unrelated to the PIP closure."
              },
              {
                "id": "C",
                "label": "PIPs are designed to be temporary and there is no requirement to sustain improvements."
              },
              {
                "id": "D",
                "label": "The regression indicates the original PIP was not effective, not that monitoring was removed too early."
              },
              {
                "id": "E",
                "label": "Governing body review of PIP sustainability is optional."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Sustained improvement requires that successful PIP interventions be embedded into standard operating procedures, ongoing training, and the audit cycle. Removing monitoring after PIP closure allows regression. The governing body must ensure improvements become permanent operational standards as part of their executive QAPI responsibility."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L21",
          "card_id": "qapi_l21_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l21.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Sustained improvement requires that successful PIP interventions be embedded into standard operating procedures, ongoing training, and the audit cycle. Removing monitoring after PIP closure allows regression. The governing body must ensure improvements become permanent operational standards as part of their executive QAPI responsibility.",
          "transcript_text": "Sustained improvement requires that successful PIP interventions be embedded into standard operating procedures, ongoing training, and the audit cycle. Removing monitoring after PIP closure allows regression. The governing body must ensure improvements become permanent operational standards as part of their executive QAPI responsibility.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l21.s1.debrief",
            "scene_title": "Debriefing: Sustaining Improvement and Avoiding PIP Pitfalls"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What sustainability failure caused the regression?",
        "choices": [
          {
            "id": "A",
            "label": "Removing monitoring after PIP completion allowed the improvement to decay — successful interventions must be embedded into SOPs, included in ongoing training, and maintained in the audit cycle to sustain gains."
          },
          {
            "id": "B",
            "label": "Medication error rates naturally fluctuate and the regression is unrelated to the PIP closure."
          },
          {
            "id": "C",
            "label": "PIPs are designed to be temporary and there is no requirement to sustain improvements."
          },
          {
            "id": "D",
            "label": "The regression indicates the original PIP was not effective, not that monitoring was removed too early."
          },
          {
            "id": "E",
            "label": "Governing body review of PIP sustainability is optional."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Sustained improvement requires that successful PIP interventions be embedded into standard operating procedures, ongoing training, and the audit cycle. Removing monitoring after PIP closure allows regression. The governing body must ensure improvements become permanent operational standards as part of their executive QAPI responsibility.",
        "feedbackIncorrect": "Incorrect. Sustained improvement requires that successful PIP interventions be embedded into standard operating procedures, ongoing training, and the audit cycle. Removing monitoring after PIP closure allows regression. The governing body must ensure improvements become permanent operational standards as part of their executive QAPI responsibility."
      }
    },
    {
      "id": "l22",
      "index": 22,
      "title": "ADR Triggers and Documentation Risk",
      "estMinutes": 5,
      "learningGoal": "Identify how weak QAPI programs create the documentation gaps that trigger Additional Documentation Requests and payment denials.",
      "scenario": "Care Indeed receives an ADR requesting documentation for five billed nursing visits. Upon review, the chart reveals: one visit note is missing entirely, two notes lack skilled rationale, and the physician signature on the POC is dated 20 days after the certification period ended.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Most ADR denials are rooted in documentation failure, not fraud: missing notes, incomplete plans of care, undocumented services, and unsigned physician orders.</li><li>When QAPI does not include routine chart audits and clinician feedback, common documentation errors go undetected until an ADR exposes them.</li><li>Key ADR triggers include: unclear homebound status, insufficient skilled rationale, missing face-to-face encounter documentation, and OASIS-to-POC misalignment.</li></ul>",
      "whyItMatters": [
        "Medicare pays based on what is documented — not what is intended or what actually happened."
      ],
      "practiceExample": "during documentation review, confirm that most adr denials are rooted in documentation failure, not fraud: missing notes, incomplete plans of care, undocumented services, and unsigned physician orders. Then verify that when qapi does not include routine chart audits and clinician feedback, common documentation errors go undetected until an adr exposes them. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "ADR",
          "definition": "Additional Documentation Request — a Medicare contractor request for medical records to validate billed services, often triggered by documentation gaps."
        },
        {
          "term": "Homebound Status",
          "definition": "Meeting the two-criterion rule: (1) needs support to leave home, AND (2) normal inability to leave plus leaving requires taxing effort."
        },
        {
          "term": "Face-to-Face Encounter",
          "definition": "A physician or allowed NPP encounter certifying the patient need for home health services, required within specific timeframes."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L22",
          "card_id": "qapi_l22_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l22.s1.overview"
          },
          "display_title": "ADR Triggers and Documentation Risk",
          "learner_facing_content": "Most ADR denials are rooted in documentation failure, not fraud: missing notes, incomplete plans of care, undocumented services, and unsigned physician orders.\nWhen QAPI does not include routine chart audits and clinician feedback, common documentation errors go undetected until an ADR exposes them.\nKey ADR triggers include: unclear homebound status, insufficient skilled rationale, missing face-to-face encounter documentation, and OASIS-to-POC misalignment.",
          "learning_goal": "Identify how weak QAPI programs create the documentation gaps that trigger Additional Documentation Requests and payment denials.",
          "why_it_matters": [
            "Medicare pays based on what is documented — not what is intended or what actually happened."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l22.s1.overview",
            "scene_title": "Visual showing: ADR Triggers and Documentation Risk"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L22",
          "card_id": "qapi_l22_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l22.s1.delivery"
          },
          "display_title": "ADR Triggers and Documentation Risk",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that most adr denials are rooted in documentation failure, not fraud: missing notes, incomplete plans of care, undocumented services, and unsigned physician orders. Then verify that when qapi does not include routine chart audits and clinician feedback, common documentation errors go undetected until an adr exposes them. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l22.s1.delivery",
            "scene_title": "Visual demonstrating: ADR Triggers and Documentation Risk"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L22",
          "card_id": "qapi_l22_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l22.s1.challenge"
          },
          "display_title": "ADR Triggers and Documentation Risk Challenge",
          "learner_facing_content": "Care Indeed receives an ADR requesting documentation for five billed nursing visits. Upon review, the chart reveals: one visit note is missing entirely, two notes lack skilled rationale, and the physician signature on the POC is dated 20 days after the certification period ended.",
          "transcript_text": "What QAPI process failure allowed these ADR triggers to reach billing?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l22.s1.challenge",
            "scene_title": "Interactive Scenario: ADR Triggers and Documentation Risk"
          },
          "internal_challenge": {
            "id": "qapi_l22_challenge_id",
            "prompt": "What QAPI process failure allowed these ADR triggers to reach billing?",
            "choices": [
              {
                "id": "A",
                "label": "The agency lacked pre-bill chart audit controls — QAPI should include routine documentation review that catches missing notes, weak skilled rationale, and late signatures before claims are submitted."
              },
              {
                "id": "B",
                "label": "ADR triggers are random and cannot be prevented by any QAPI process."
              },
              {
                "id": "C",
                "label": "Missing visit notes do not affect ADR outcomes as long as the patient was seen."
              },
              {
                "id": "D",
                "label": "Physician signature timing is flexible and does not affect claim validity."
              },
              {
                "id": "E",
                "label": "QAPI is focused on quality, not billing compliance, so ADR prevention is outside its scope."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "A robust QAPI program includes pre-bill chart audits that detect missing notes, incomplete skilled rationale, and signature timing defects before claim submission. Without these controls, documentation failures reach the billing system undetected and trigger ADR denials — directly connecting QAPI gaps to financial exposure."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L22",
          "card_id": "qapi_l22_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l22.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "A robust QAPI program includes pre-bill chart audits that detect missing notes, incomplete skilled rationale, and signature timing defects before claim submission. Without these controls, documentation failures reach the billing system undetected and trigger ADR denials — directly connecting QAPI gaps to financial exposure.",
          "transcript_text": "A robust QAPI program includes pre-bill chart audits that detect missing notes, incomplete skilled rationale, and signature timing defects before claim submission. Without these controls, documentation failures reach the billing system undetected and trigger ADR denials — directly connecting QAPI gaps to financial exposure.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l22.s1.debrief",
            "scene_title": "Debriefing: ADR Triggers and Documentation Risk"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What QAPI process failure allowed these ADR triggers to reach billing?",
        "choices": [
          {
            "id": "A",
            "label": "The agency lacked pre-bill chart audit controls — QAPI should include routine documentation review that catches missing notes, weak skilled rationale, and late signatures before claims are submitted."
          },
          {
            "id": "B",
            "label": "ADR triggers are random and cannot be prevented by any QAPI process."
          },
          {
            "id": "C",
            "label": "Missing visit notes do not affect ADR outcomes as long as the patient was seen."
          },
          {
            "id": "D",
            "label": "Physician signature timing is flexible and does not affect claim validity."
          },
          {
            "id": "E",
            "label": "QAPI is focused on quality, not billing compliance, so ADR prevention is outside its scope."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. A robust QAPI program includes pre-bill chart audits that detect missing notes, incomplete skilled rationale, and signature timing defects before claim submission. Without these controls, documentation failures reach the billing system undetected and trigger ADR denials — directly connecting QAPI gaps to financial exposure.",
        "feedbackIncorrect": "Incorrect. A robust QAPI program includes pre-bill chart audits that detect missing notes, incomplete skilled rationale, and signature timing defects before claim submission. Without these controls, documentation failures reach the billing system undetected and trigger ADR denials — directly connecting QAPI gaps to financial exposure."
      }
    },
    {
      "id": "l23",
      "index": 23,
      "title": "Homebound Status and Skilled Need Documentation",
      "estMinutes": 5,
      "learningGoal": "Document homebound status and skilled need using language that withstands ADR scrutiny.",
      "scenario": "An ADR reviewer examines a nursing visit note that reads: \"Patient is homebound. Wound care performed. Will continue plan.\" The reviewer denies the claim citing insufficient homebound documentation and no evidence of skilled need.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Homebound status must meet the two-criterion rule: Criterion One (needs support to leave — assistive device, person, or medical contraindication) AND Criterion Two (normal inability to leave plus leaving requires taxing effort).</li><li>Skilled need documentation must show clinical judgment, not task completion: describe the assessment, intervention logic, patient response, and why a skilled professional was required.</li><li>Avoid vague terms like \"weakness\" or \"gait abnormality\" — use specific clinical findings.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that homebound status must meet the two-criterion rule: criterion one (needs support to leave — assistive device, person, or medical contraindication) and criterion two (normal inability to leave plus leaving requires taxing effort). Then verify that skilled need documentation must show clinical judgment, not task completion: describe the assessment, intervention logic, patient response, and why a skilled professional was required. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "ADR",
          "definition": "Additional Documentation Request — a Medicare contractor request for medical records to validate billed services, often triggered by documentation gaps."
        },
        {
          "term": "Homebound Status",
          "definition": "Meeting the two-criterion rule: (1) needs support to leave home, AND (2) normal inability to leave plus leaving requires taxing effort."
        },
        {
          "term": "Skilled Need",
          "definition": "Documentation that clinical judgment — not just task completion — was required, showing assessment, intervention logic, and patient response."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L23",
          "card_id": "qapi_l23_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l23.s1.overview"
          },
          "display_title": "Homebound Status and Skilled Need Documentation",
          "learner_facing_content": "Homebound status must meet the two-criterion rule: Criterion One (needs support to leave — assistive device, person, or medical contraindication) AND Criterion Two (normal inability to leave plus leaving requires taxing effort).\nSkilled need documentation must show clinical judgment, not task completion: describe the assessment, intervention logic, patient response, and why a skilled professional was required.\nAvoid vague terms like \"weakness\" or \"gait abnormality\" — use specific clinical findings.",
          "learning_goal": "Document homebound status and skilled need using language that withstands ADR scrutiny.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l23.s1.overview",
            "scene_title": "Visual showing: Homebound Status and Skilled Need Documentation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L23",
          "card_id": "qapi_l23_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l23.s1.delivery"
          },
          "display_title": "Homebound Status and Skilled Need Documentation",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that homebound status must meet the two-criterion rule: criterion one (needs support to leave — assistive device, person, or medical contraindication) and criterion two (normal inability to leave plus leaving requires taxing effort). Then verify that skilled need documentation must show clinical judgment, not task completion: describe the assessment, intervention logic, patient response, and why a skilled professional was required. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l23.s1.delivery",
            "scene_title": "Visual demonstrating: Homebound Status and Skilled Need Documentation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L23",
          "card_id": "qapi_l23_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l23.s1.challenge"
          },
          "display_title": "Homebound Status and Skilled Need Documentation Challenge",
          "learner_facing_content": "An ADR reviewer examines a nursing visit note that reads: \"Patient is homebound. Wound care performed. Will continue plan.\" The reviewer denies the claim citing insufficient homebound documentation and no evidence of skilled need.",
          "transcript_text": "What specific documentation elements are missing?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l23.s1.challenge",
            "scene_title": "Interactive Scenario: Homebound Status and Skilled Need Documentation"
          },
          "internal_challenge": {
            "id": "qapi_l23_challenge_id",
            "prompt": "What specific documentation elements are missing?",
            "choices": [
              {
                "id": "A",
                "label": "Homebound status lacks the two-criterion details (support needed, normal inability to leave, taxing effort); skilled need lacks clinical assessment, intervention rationale, and patient response — only task completion is documented."
              },
              {
                "id": "B",
                "label": "The documentation is sufficient because it confirms homebound status and describes the service provided."
              },
              {
                "id": "C",
                "label": "Homebound documentation is only required at start of care, not on individual visit notes."
              },
              {
                "id": "D",
                "label": "Wound care is inherently skilled and does not require additional justification."
              },
              {
                "id": "E",
                "label": "ADR reviewers cannot deny claims based on visit note content alone."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Defensible documentation requires specific homebound criteria (what support is needed, why leaving is abnormal, what makes it taxing) and skilled need evidence (clinical assessment, skilled judgment applied, patient response). Task-only language without clinical reasoning fails both homebound and skilled need standards."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L23",
          "card_id": "qapi_l23_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l23.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Defensible documentation requires specific homebound criteria (what support is needed, why leaving is abnormal, what makes it taxing) and skilled need evidence (clinical assessment, skilled judgment applied, patient response). Task-only language without clinical reasoning fails both homebound and skilled need standards.",
          "transcript_text": "Defensible documentation requires specific homebound criteria (what support is needed, why leaving is abnormal, what makes it taxing) and skilled need evidence (clinical assessment, skilled judgment applied, patient response). Task-only language without clinical reasoning fails both homebound and skilled need standards.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l23.s1.debrief",
            "scene_title": "Debriefing: Homebound Status and Skilled Need Documentation"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What specific documentation elements are missing?",
        "choices": [
          {
            "id": "A",
            "label": "Homebound status lacks the two-criterion details (support needed, normal inability to leave, taxing effort); skilled need lacks clinical assessment, intervention rationale, and patient response — only task completion is documented."
          },
          {
            "id": "B",
            "label": "The documentation is sufficient because it confirms homebound status and describes the service provided."
          },
          {
            "id": "C",
            "label": "Homebound documentation is only required at start of care, not on individual visit notes."
          },
          {
            "id": "D",
            "label": "Wound care is inherently skilled and does not require additional justification."
          },
          {
            "id": "E",
            "label": "ADR reviewers cannot deny claims based on visit note content alone."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Defensible documentation requires specific homebound criteria (what support is needed, why leaving is abnormal, what makes it taxing) and skilled need evidence (clinical assessment, skilled judgment applied, patient response). Task-only language without clinical reasoning fails both homebound and skilled need standards.",
        "feedbackIncorrect": "Incorrect. Defensible documentation requires specific homebound criteria (what support is needed, why leaving is abnormal, what makes it taxing) and skilled need evidence (clinical assessment, skilled judgment applied, patient response). Task-only language without clinical reasoning fails both homebound and skilled need standards."
      }
    },
    {
      "id": "l24",
      "index": 24,
      "title": "Assembling an ADR Response",
      "estMinutes": 5,
      "learningGoal": "Prepare and submit a complete ADR documentation packet that prevents claim denial.",
      "scenario": "Care Indeed receives an ADR requesting documentation for a 60-day episode with 12 visits. The response coordinator submits visit notes but omits the signed POC and face-to-face encounter. The claim is denied.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>An ADR response must include: signed physician Plan of Care, face-to-face encounter documentation, all visit notes for requested dates, OASIS assessments, and relevant physician orders.</li><li>Organize documents in chronological order with a cover sheet listing each item — reviewers process hundreds of responses and incomplete or disorganized packets increase denial probability.</li><li>Track ADR reasons in the QAPI program: if the same documentation gap triggers multiple ADRs, it becomes a systemic issue requiring a PIP.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that an adr response must include: signed physician plan of care, face-to-face encounter documentation, all visit notes for requested dates, oasis assessments, and relevant physician orders. Then verify that organize documents in chronological order with a cover sheet listing each item — reviewers process hundreds of responses and incomplete or disorganized packets increase denial probability. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "ADR",
          "definition": "Additional Documentation Request — a Medicare contractor request for medical records to validate billed services, often triggered by documentation gaps."
        },
        {
          "term": "Face-to-Face Encounter",
          "definition": "A physician or allowed NPP encounter certifying the patient need for home health services, required within specific timeframes."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L24",
          "card_id": "qapi_l24_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l24.s1.overview"
          },
          "display_title": "Assembling an ADR Response",
          "learner_facing_content": "An ADR response must include: signed physician Plan of Care, face-to-face encounter documentation, all visit notes for requested dates, OASIS assessments, and relevant physician orders.\nOrganize documents in chronological order with a cover sheet listing each item — reviewers process hundreds of responses and incomplete or disorganized packets increase denial probability.\nTrack ADR reasons in the QAPI program: if the same documentation gap triggers multiple ADRs, it becomes a systemic issue requiring a PIP.",
          "learning_goal": "Prepare and submit a complete ADR documentation packet that prevents claim denial.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l24.s1.overview",
            "scene_title": "Visual showing: Assembling an ADR Response"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L24",
          "card_id": "qapi_l24_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l24.s1.delivery"
          },
          "display_title": "Assembling an ADR Response",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that an adr response must include: signed physician plan of care, face-to-face encounter documentation, all visit notes for requested dates, oasis assessments, and relevant physician orders. Then verify that organize documents in chronological order with a cover sheet listing each item — reviewers process hundreds of responses and incomplete or disorganized packets increase denial probability. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l24.s1.delivery",
            "scene_title": "Visual demonstrating: Assembling an ADR Response"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L24",
          "card_id": "qapi_l24_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l24.s1.challenge"
          },
          "display_title": "Assembling an ADR Response Challenge",
          "learner_facing_content": "Care Indeed receives an ADR requesting documentation for a 60-day episode with 12 visits. The response coordinator submits visit notes but omits the signed POC and face-to-face encounter. The claim is denied.",
          "transcript_text": "What must the ADR response have included to prevent denial?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l24.s1.challenge",
            "scene_title": "Interactive Scenario: Assembling an ADR Response"
          },
          "internal_challenge": {
            "id": "qapi_l24_challenge_id",
            "prompt": "What must the ADR response have included to prevent denial?",
            "choices": [
              {
                "id": "A",
                "label": "A complete packet including: signed physician Plan of Care, face-to-face encounter documentation, all visit notes, OASIS assessments, and relevant orders — organized chronologically with a cover sheet."
              },
              {
                "id": "B",
                "label": "Visit notes alone are sufficient because they prove the services were provided."
              },
              {
                "id": "C",
                "label": "The face-to-face encounter is optional for ADR responses."
              },
              {
                "id": "D",
                "label": "ADR responses only require a letter from the administrator confirming services were delivered."
              },
              {
                "id": "E",
                "label": "The agency should appeal the denial rather than submit additional documentation."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "A complete ADR response requires the signed POC, face-to-face encounter, all visit notes for requested dates, OASIS assessments, and physician orders. Missing any core element — especially the POC or F2F — virtually guarantees denial. ADR reasons should be tracked in QAPI to identify systemic documentation gaps."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L24",
          "card_id": "qapi_l24_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l24.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "A complete ADR response requires the signed POC, face-to-face encounter, all visit notes for requested dates, OASIS assessments, and physician orders. Missing any core element — especially the POC or F2F — virtually guarantees denial. ADR reasons should be tracked in QAPI to identify systemic documentation gaps.",
          "transcript_text": "A complete ADR response requires the signed POC, face-to-face encounter, all visit notes for requested dates, OASIS assessments, and physician orders. Missing any core element — especially the POC or F2F — virtually guarantees denial. ADR reasons should be tracked in QAPI to identify systemic documentation gaps.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l24.s1.debrief",
            "scene_title": "Debriefing: Assembling an ADR Response"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What must the ADR response have included to prevent denial?",
        "choices": [
          {
            "id": "A",
            "label": "A complete packet including: signed physician Plan of Care, face-to-face encounter documentation, all visit notes, OASIS assessments, and relevant orders — organized chronologically with a cover sheet."
          },
          {
            "id": "B",
            "label": "Visit notes alone are sufficient because they prove the services were provided."
          },
          {
            "id": "C",
            "label": "The face-to-face encounter is optional for ADR responses."
          },
          {
            "id": "D",
            "label": "ADR responses only require a letter from the administrator confirming services were delivered."
          },
          {
            "id": "E",
            "label": "The agency should appeal the denial rather than submit additional documentation."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. A complete ADR response requires the signed POC, face-to-face encounter, all visit notes for requested dates, OASIS assessments, and physician orders. Missing any core element — especially the POC or F2F — virtually guarantees denial. ADR reasons should be tracked in QAPI to identify systemic documentation gaps.",
        "feedbackIncorrect": "Incorrect. A complete ADR response requires the signed POC, face-to-face encounter, all visit notes for requested dates, OASIS assessments, and physician orders. Missing any core element — especially the POC or F2F — virtually guarantees denial. ADR reasons should be tracked in QAPI to identify systemic documentation gaps."
      }
    },
    {
      "id": "l25",
      "index": 25,
      "title": "Survey Readiness: What Surveyors Actually Review",
      "estMinutes": 5,
      "learningGoal": "Prepare for CMS survey QAPI validation by understanding the specific documentation and evidence surveyors inspect.",
      "scenario": "During a CMS survey, the inspector asks to see evidence of QAPI data analysis. The administrator presents meeting minutes that list agenda items but contain no data charts, no trend analysis, and no documented decisions based on quality data.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Surveyors review the QAPI binder: written QAPI plan, committee charter, selected quality indicators, data trend reports, meeting agendas and minutes, PIP files, adverse event logs, and governing body oversight evidence.</li><li>Surveyor validation steps include: tracing indicator data, asking how PIP topics were selected, examining PIP documentation, and reviewing governing body minutes for QAPI oversight.</li><li>Surveyors may simulate scenarios: \"What would you do if you noticed a rise in infections?\" — testing whether QAPI processes are operational, not just documented.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that surveyors review the qapi binder: written qapi plan, committee charter, selected quality indicators, data trend reports, meeting agendas and minutes, pip files, adverse event logs, and governing body oversight evidence. Then verify that surveyor validation steps include: tracing indicator data, asking how pip topics were selected, examining pip documentation (baseline to targets to actions to outcomes), and reviewing governing body minutes for qapi oversight. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "ADR",
          "definition": "Additional Documentation Request — a Medicare contractor request for medical records to validate billed services, often triggered by documentation gaps."
        },
        {
          "term": "Homebound Status",
          "definition": "Meeting the two-criterion rule: (1) needs support to leave home, AND (2) normal inability to leave plus leaving requires taxing effort."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L25",
          "card_id": "qapi_l25_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l25.s1.overview"
          },
          "display_title": "Survey Readiness: What Surveyors Actually Review",
          "learner_facing_content": "Surveyors review the QAPI binder: written QAPI plan, committee charter, selected quality indicators, data trend reports, meeting agendas and minutes, PIP files, adverse event logs, and governing body oversight evidence.\nSurveyor validation steps include: tracing indicator data, asking how PIP topics were selected, examining PIP documentation, and reviewing governing body minutes for QAPI oversight.\nSurveyors may simulate scenarios: \"What would you do if you noticed a rise in infections?\" — testing whether QAPI processes are operational, not just documented.",
          "learning_goal": "Prepare for CMS survey QAPI validation by understanding the specific documentation and evidence surveyors inspect.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l25.s1.overview",
            "scene_title": "Visual showing: Survey Readiness: What Surveyors Actually Review"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L25",
          "card_id": "qapi_l25_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l25.s1.delivery"
          },
          "display_title": "Survey Readiness: What Surveyors Actually Review",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that surveyors review the qapi binder: written qapi plan, committee charter, selected quality indicators, data trend reports, meeting agendas and minutes, pip files, adverse event logs, and governing body oversight evidence. Then verify that surveyor validation steps include: tracing indicator data, asking how pip topics were selected, examining pip documentation (baseline to targets to actions to outcomes), and reviewing governing body minutes for qapi oversight. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l25.s1.delivery",
            "scene_title": "Visual demonstrating: Survey Readiness: What Surveyors Actually Review"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L25",
          "card_id": "qapi_l25_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l25.s1.challenge"
          },
          "display_title": "Survey Readiness: What Surveyors Actually Review Challenge",
          "learner_facing_content": "During a CMS survey, the inspector asks to see evidence of QAPI data analysis. The administrator presents meeting minutes that list agenda items but contain no data charts, no trend analysis, and no documented decisions based on quality data.",
          "transcript_text": "What survey expectation does this documentation fail?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l25.s1.challenge",
            "scene_title": "Interactive Scenario: Survey Readiness: What Surveyors Actually Review"
          },
          "internal_challenge": {
            "id": "qapi_l25_challenge_id",
            "prompt": "What survey expectation does this documentation fail?",
            "choices": [
              {
                "id": "A",
                "label": "Surveyors expect meeting minutes to show data-driven discussion with charts, trend analysis, and documented decisions — agenda lists without analytical evidence demonstrate no active quality monitoring."
              },
              {
                "id": "B",
                "label": "Meeting minutes with agenda items satisfy all survey requirements for QAPI data evidence."
              },
              {
                "id": "C",
                "label": "Surveyors only review QAPI documentation during accreditation surveys, not CMS surveys."
              },
              {
                "id": "D",
                "label": "Data charts are optional as long as the agency can verbally describe trends."
              },
              {
                "id": "E",
                "label": "QAPI data analysis is only reviewed when the agency has received a prior citation."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Surveyors trace the chain: problem identified → intervention implemented → measurable improvement → sustained monitoring. Meeting minutes must show data-driven discussions with actual quality data, trend analysis, and documented decisions — not just attendance and agenda items."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L25",
          "card_id": "qapi_l25_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l25.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Surveyors trace the chain: problem identified → intervention implemented → measurable improvement → sustained monitoring. Meeting minutes must show data-driven discussions with actual quality data, trend analysis, and documented decisions — not just attendance and agenda items.",
          "transcript_text": "Surveyors trace the chain: problem identified → intervention implemented → measurable improvement → sustained monitoring. Meeting minutes must show data-driven discussions with actual quality data, trend analysis, and documented decisions — not just attendance and agenda items.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l25.s1.debrief",
            "scene_title": "Debriefing: Survey Readiness: What Surveyors Actually Review"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What survey expectation does this documentation fail?",
        "choices": [
          {
            "id": "A",
            "label": "Surveyors expect meeting minutes to show data-driven discussion with charts, trend analysis, and documented decisions — agenda lists without analytical evidence demonstrate no active quality monitoring."
          },
          {
            "id": "B",
            "label": "Meeting minutes with agenda items satisfy all survey requirements for QAPI data evidence."
          },
          {
            "id": "C",
            "label": "Surveyors only review QAPI documentation during accreditation surveys, not CMS surveys."
          },
          {
            "id": "D",
            "label": "Data charts are optional as long as the agency can verbally describe trends."
          },
          {
            "id": "E",
            "label": "QAPI data analysis is only reviewed when the agency has received a prior citation."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Surveyors trace the chain: problem identified → intervention implemented → measurable improvement → sustained monitoring. Meeting minutes must show data-driven discussions with actual quality data, trend analysis, and documented decisions — not just attendance and agenda items.",
        "feedbackIncorrect": "Incorrect. Surveyors trace the chain: problem identified → intervention implemented → measurable improvement → sustained monitoring. Meeting minutes must show data-driven discussions with actual quality data, trend analysis, and documented decisions — not just attendance and agenda items."
      }
    },
    {
      "id": "l26",
      "index": 26,
      "title": "Top Survey Citation Risks: G-Tag Analysis",
      "estMinutes": 5,
      "learningGoal": "Identify the most common G-tag citations in home health and their QAPI mitigation strategies.",
      "scenario": "A surveyor cites Care Indeed under G710 (Supervision of Aide) because six home health aide supervisory visits were not completed within the required 14-day window. The aide coordinator says scheduling conflicts prevented timely visits.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>G682 (Infection Prevention): failure to follow standard precautions — mitigate with unannounced field supervision ride-alongs.</li><li>G572 (Plan of Care Compliance): interventions without physician-signed orders — mitigate with EHR hard-stops preventing scheduling without active orders.</li><li>G536 (Assessment Accuracy): OASIS data not reflecting actual patient status — mitigate with mandatory OASIS training and 100% QA review.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that g682 (infection prevention): failure to follow standard precautions during visits — mitigate with unannounced field supervision ride-alongs. Then verify that g572 (plan of care compliance): interventions performed without physician-signed orders — mitigate with ehr hard-stops preventing scheduling without active orders. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "G-Tag",
          "definition": "A regulatory tag within the CMS State Operations Manual identifying specific survey requirements (e.g., G682 Infection Prevention, G710 Aide Supervision)."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L26",
          "card_id": "qapi_l26_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l26.s1.overview"
          },
          "display_title": "Top Survey Citation Risks: G-Tag Analysis",
          "learner_facing_content": "G682 (Infection Prevention): failure to follow standard precautions — mitigate with unannounced field supervision ride-alongs.\nG572 (Plan of Care Compliance): interventions without physician-signed orders — mitigate with EHR hard-stops preventing scheduling without active orders.\nG536 (Assessment Accuracy): OASIS data not reflecting actual patient status — mitigate with mandatory OASIS training and 100% QA review.",
          "learning_goal": "Identify the most common G-tag citations in home health and their QAPI mitigation strategies.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l26.s1.overview",
            "scene_title": "Visual showing: Top Survey Citation Risks: G-Tag Analysis"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L26",
          "card_id": "qapi_l26_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l26.s1.delivery"
          },
          "display_title": "Top Survey Citation Risks: G-Tag Analysis",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that g682 (infection prevention): failure to follow standard precautions during visits — mitigate with unannounced field supervision ride-alongs. Then verify that g572 (plan of care compliance): interventions performed without physician-signed orders — mitigate with ehr hard-stops preventing scheduling without active orders. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l26.s1.delivery",
            "scene_title": "Visual demonstrating: Top Survey Citation Risks: G-Tag Analysis"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L26",
          "card_id": "qapi_l26_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l26.s1.challenge"
          },
          "display_title": "Top Survey Citation Risks: G-Tag Analysis Challenge",
          "learner_facing_content": "A surveyor cites Care Indeed under G710 (Supervision of Aide) because six home health aide supervisory visits were not completed within the required 14-day window. The aide coordinator says scheduling conflicts prevented timely visits.",
          "transcript_text": "What QAPI-driven control would prevent this citation?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l26.s1.challenge",
            "scene_title": "Interactive Scenario: Top Survey Citation Risks: G-Tag Analysis"
          },
          "internal_challenge": {
            "id": "qapi_l26_challenge_id",
            "prompt": "What QAPI-driven control would prevent this citation?",
            "choices": [
              {
                "id": "A",
                "label": "Automate supervisory visit alerts in the clinical scheduling system and monitor compliance rates at QAPI meetings — system-level controls prevent scheduling conflicts from becoming compliance failures."
              },
              {
                "id": "B",
                "label": "Scheduling conflicts are an acceptable reason for late supervisory visits."
              },
              {
                "id": "C",
                "label": "Aide supervision requirements only apply to agencies with more than 20 aides."
              },
              {
                "id": "D",
                "label": "The 14-day supervision window is a guideline, not a regulatory requirement."
              },
              {
                "id": "E",
                "label": "QAPI cannot address scheduling problems because they are operational, not quality-related."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "G710 citations for missed aide supervision are preventable through system-level controls: automated scheduling alerts, compliance tracking dashboards, and QAPI committee monitoring of supervision completion rates."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L26",
          "card_id": "qapi_l26_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l26.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "G710 citations for missed aide supervision are preventable through system-level controls: automated scheduling alerts, compliance tracking dashboards, and QAPI committee monitoring of supervision completion rates.",
          "transcript_text": "G710 citations for missed aide supervision are preventable through system-level controls: automated scheduling alerts, compliance tracking dashboards, and QAPI committee monitoring of supervision completion rates.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l26.s1.debrief",
            "scene_title": "Debriefing: Top Survey Citation Risks: G-Tag Analysis"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What QAPI-driven control would prevent this citation?",
        "choices": [
          {
            "id": "A",
            "label": "Automate supervisory visit alerts in the clinical scheduling system and monitor compliance rates at QAPI meetings — system-level controls prevent scheduling conflicts from becoming compliance failures."
          },
          {
            "id": "B",
            "label": "Scheduling conflicts are an acceptable reason for late supervisory visits."
          },
          {
            "id": "C",
            "label": "Aide supervision requirements only apply to agencies with more than 20 aides."
          },
          {
            "id": "D",
            "label": "The 14-day supervision window is a guideline, not a regulatory requirement."
          },
          {
            "id": "E",
            "label": "QAPI cannot address scheduling problems because they are operational, not quality-related."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. G710 citations for missed aide supervision are preventable through system-level controls: automated scheduling alerts, compliance tracking dashboards, and QAPI committee monitoring of supervision completion rates.",
        "feedbackIncorrect": "Incorrect. G710 citations for missed aide supervision are preventable through system-level controls: automated scheduling alerts, compliance tracking dashboards, and QAPI committee monitoring of supervision completion rates."
      }
    },
    {
      "id": "l27",
      "index": 27,
      "title": "Plan of Correction: Writing Effective Responses",
      "estMinutes": 5,
      "learningGoal": "Write Plans of Correction (PoC) that satisfy the five required elements and demonstrate systemic improvement.",
      "scenario": "Care Indeed receives a survey citation for incomplete Plans of Care. The Plan of Correction states: \"Staff will be reminded to complete all POC fields.\" No responsible party, timeline, monitoring plan, or system change is included.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>A compliant PoC must answer five questions: (1) What corrective action was taken? (2) How will recurrence be prevented? (3) Who is responsible? (4) When will it be completed? (5) How will it be monitored?</li><li>Common PoC pitfalls: vague actions without specifics, no defined timeline, no accountability, and addressing individual blame instead of system changes.</li><li>Effective PoCs include measurable goals, specific policy changes, assigned responsible parties, completion deadlines, and QAPI-integrated monitoring plans.</li></ul>",
      "whyItMatters": [
        "Surveyors expect follow-up data showing corrective actions were implemented and sustained — not just a statement of intent."
      ],
      "practiceExample": "during documentation review, confirm that a compliant poc must answer five questions: (1) what corrective action was taken? (2) how will recurrence be prevented? (3) who is responsible? (4) when will it be completed? (5) how will it be monitored? Then verify that common poc pitfalls: vague actions (\"will re-train staff\" without specifics), no defined timeline, no accountability assignment, and addressing individual blame instead of system changes. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "ADR",
          "definition": "Additional Documentation Request — a Medicare contractor request for medical records to validate billed services, often triggered by documentation gaps."
        },
        {
          "term": "Homebound Status",
          "definition": "Meeting the two-criterion rule: (1) needs support to leave home, AND (2) normal inability to leave plus leaving requires taxing effort."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L27",
          "card_id": "qapi_l27_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l27.s1.overview"
          },
          "display_title": "Plan of Correction: Writing Effective Responses",
          "learner_facing_content": "A compliant PoC must answer five questions: (1) What corrective action was taken? (2) How will recurrence be prevented? (3) Who is responsible? (4) When will it be completed? (5) How will it be monitored?\nCommon PoC pitfalls: vague actions without specifics, no defined timeline, no accountability, and addressing individual blame instead of system changes.\nEffective PoCs include measurable goals, specific policy changes, assigned responsible parties, completion deadlines, and QAPI-integrated monitoring plans.",
          "learning_goal": "Write Plans of Correction (PoC) that satisfy the five required elements and demonstrate systemic improvement.",
          "why_it_matters": [
            "Surveyors expect follow-up data showing corrective actions were implemented and sustained — not just a statement of intent."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l27.s1.overview",
            "scene_title": "Visual showing: Plan of Correction: Writing Effective Responses"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L27",
          "card_id": "qapi_l27_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l27.s1.delivery"
          },
          "display_title": "Plan of Correction: Writing Effective Responses",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that a compliant poc must answer five questions: (1) what corrective action was taken? (2) how will recurrence be prevented? (3) who is responsible? (4) when will it be completed? (5) how will it be monitored? Then verify that common poc pitfalls: vague actions (\"will re-train staff\" without specifics), no defined timeline, no accountability assignment, and addressing individual blame instead of system changes. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l27.s1.delivery",
            "scene_title": "Visual demonstrating: Plan of Correction: Writing Effective Responses"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L27",
          "card_id": "qapi_l27_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l27.s1.challenge"
          },
          "display_title": "Plan of Correction: Writing Effective Responses Challenge",
          "learner_facing_content": "Care Indeed receives a survey citation for incomplete Plans of Care. The Plan of Correction states: \"Staff will be reminded to complete all POC fields.\" No responsible party, timeline, monitoring plan, or system change is included.",
          "transcript_text": "Which of the five required PoC elements are missing?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l27.s1.challenge",
            "scene_title": "Interactive Scenario: Plan of Correction: Writing Effective Responses"
          },
          "internal_challenge": {
            "id": "qapi_l27_challenge_id",
            "prompt": "Which of the five required PoC elements are missing?",
            "choices": [
              {
                "id": "A",
                "label": "Recurrence prevention strategy, responsible party, completion timeline, and monitoring plan are all missing — only a vague corrective action is stated without systemic change."
              },
              {
                "id": "B",
                "label": "The PoC is adequate because it identifies the corrective action of reminding staff."
              },
              {
                "id": "C",
                "label": "Only the timeline is missing; the other elements are implied."
              },
              {
                "id": "D",
                "label": "Plans of Correction do not require assigned responsible parties."
              },
              {
                "id": "E",
                "label": "Monitoring plans are only needed for condition-level deficiencies."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "A compliant PoC must address all five elements. \"Staff will be reminded\" lacks: a specific recurrence prevention strategy, an assigned responsible party, a completion deadline, and a monitoring plan. Surveyors will reject PoCs that offer vague intent without demonstrating systemic corrective action."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L27",
          "card_id": "qapi_l27_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l27.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "A compliant PoC must address all five elements. \"Staff will be reminded\" lacks: a specific recurrence prevention strategy, an assigned responsible party, a completion deadline, and a monitoring plan. Surveyors will reject PoCs that offer vague intent without demonstrating systemic corrective action.",
          "transcript_text": "A compliant PoC must address all five elements. \"Staff will be reminded\" lacks: a specific recurrence prevention strategy, an assigned responsible party, a completion deadline, and a monitoring plan. Surveyors will reject PoCs that offer vague intent without demonstrating systemic corrective action.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l27.s1.debrief",
            "scene_title": "Debriefing: Plan of Correction: Writing Effective Responses"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Which of the five required PoC elements are missing?",
        "choices": [
          {
            "id": "A",
            "label": "Recurrence prevention strategy, responsible party, completion timeline, and monitoring plan are all missing — only a vague corrective action is stated without systemic change."
          },
          {
            "id": "B",
            "label": "The PoC is adequate because it identifies the corrective action of reminding staff."
          },
          {
            "id": "C",
            "label": "Only the timeline is missing; the other elements are implied."
          },
          {
            "id": "D",
            "label": "Plans of Correction do not require assigned responsible parties."
          },
          {
            "id": "E",
            "label": "Monitoring plans are only needed for condition-level deficiencies."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. A compliant PoC must address all five elements. \"Staff will be reminded\" lacks: a specific recurrence prevention strategy, an assigned responsible party, a completion deadline, and a monitoring plan. Surveyors will reject PoCs that offer vague intent without demonstrating systemic corrective action.",
        "feedbackIncorrect": "Incorrect. A compliant PoC must address all five elements. \"Staff will be reminded\" lacks: a specific recurrence prevention strategy, an assigned responsible party, a completion deadline, and a monitoring plan. Surveyors will reject PoCs that offer vague intent without demonstrating systemic corrective action."
      }
    },
    {
      "id": "l28",
      "index": 28,
      "title": "QAPI as Survey Defense: Proactive Readiness",
      "estMinutes": 5,
      "learningGoal": "Use the QAPI program proactively to prevent survey deficiencies rather than react to them.",
      "scenario": "Care Indeed has not conducted a mock survey in 18 months. During a surprise CMS survey, the team struggles to locate the QAPI binder, cannot identify active PIPs, and the administrator is unable to describe the agency quality indicators when asked.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Conduct mock surveys quarterly: assign staff to role-play surveyors, trace patient records, verify QAPI binder completeness, and interview clinicians about QAPI processes.</li><li>Maintain a survey-readiness checklist verified monthly: QAPI binder currency, PIP status, data report availability, credential files, and aide supervision compliance.</li><li>A mature QAPI program transforms compliance from reactive defense to proactive quality management.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that conduct mock surveys quarterly: assign staff to role-play surveyors, trace patient records, verify qapi binder completeness, and interview clinicians about qapi processes. Then verify that maintain a survey-readiness checklist that is verified monthly: qapi binder currency, pip status, data report availability, credential files, and aide supervision compliance. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "Mock Survey",
          "definition": "A practice survey conducted internally to test staff readiness, binder completeness, and QAPI process knowledge before an actual CMS survey."
        }
      ],
      "transcript": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "summary": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L28",
          "card_id": "qapi_l28_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l28.s1.overview"
          },
          "display_title": "QAPI as Survey Defense: Proactive Readiness",
          "learner_facing_content": "Conduct mock surveys quarterly: assign staff to role-play surveyors, trace patient records, verify QAPI binder completeness, and interview clinicians about QAPI processes.\nMaintain a survey-readiness checklist verified monthly: QAPI binder currency, PIP status, data report availability, credential files, and aide supervision compliance.\nA mature QAPI program transforms compliance from reactive defense to proactive quality management.",
          "learning_goal": "Use the QAPI program proactively to prevent survey deficiencies rather than react to them.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l28.s1.overview",
            "scene_title": "Visual showing: QAPI as Survey Defense: Proactive Readiness"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L28",
          "card_id": "qapi_l28_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l28.s1.delivery"
          },
          "display_title": "QAPI as Survey Defense: Proactive Readiness",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">most ADR denials stem from documentation failures, not fraud.</p><p style=\"margin-bottom:8px;\">Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment.</p><p style=\"margin-bottom:8px;\">Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions.</p><p style=\"margin-bottom:8px;\">G-tag citations are preventable through system-level QAPI controls.</p>",
          "cna_practice_example": "during documentation review, confirm that conduct mock surveys quarterly: assign staff to role-play surveyors, trace patient records, verify qapi binder completeness, and interview clinicians about qapi processes. Then verify that maintain a survey-readiness checklist that is verified monthly: qapi binder currency, pip status, data report availability, credential files, and aide supervision compliance. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "transcript_text": "most ADR denials stem from documentation failures, not fraud. Common triggers include missing homebound documentation, insufficient skilled rationale, unsigned orders, and OASIS-to-POC misalignment. Surveyors validate QAPI by tracing indicator data, reviewing PIP documentation, and testing operational knowledge through scenario questions. G-tag citations are preventable through system-level QAPI controls.",
          "estimated_narration_seconds": 21,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l28.s1.delivery",
            "scene_title": "Visual demonstrating: QAPI as Survey Defense: Proactive Readiness"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L28",
          "card_id": "qapi_l28_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l28.s1.challenge"
          },
          "display_title": "QAPI as Survey Defense: Proactive Readiness Challenge",
          "learner_facing_content": "Care Indeed has not conducted a mock survey in 18 months. During a surprise CMS survey, the team struggles to locate the QAPI binder, cannot identify active PIPs, and the administrator is unable to describe the agency quality indicators when asked.",
          "transcript_text": "What proactive QAPI practice would have prevented this situation?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l28.s1.challenge",
            "scene_title": "Interactive Scenario: QAPI as Survey Defense: Proactive Readiness"
          },
          "internal_challenge": {
            "id": "qapi_l28_challenge_id",
            "prompt": "What proactive QAPI practice would have prevented this situation?",
            "choices": [
              {
                "id": "A",
                "label": "Quarterly mock surveys practicing binder review, PIP reporting, and QAPI interview responses — combined with monthly survey-readiness checklist verification — ensure the agency is always prepared."
              },
              {
                "id": "B",
                "label": "CMS provides advance notice of surveys, so readiness preparation can be done the week before."
              },
              {
                "id": "C",
                "label": "Survey preparation is the administrator sole responsibility and does not involve QAPI activities."
              },
              {
                "id": "D",
                "label": "QAPI binders are only needed for accreditation surveys, not CMS surveys."
              },
              {
                "id": "E",
                "label": "Mock surveys are impractical for home health agencies and not recommended by CMS."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Proactive survey readiness requires quarterly mock surveys and monthly readiness checklist verification. Practicing binder review, PIP reporting, and QAPI interview responses ensures the team can respond confidently during unannounced surveys."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L28",
          "card_id": "qapi_l28_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l28.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Proactive survey readiness requires quarterly mock surveys and monthly readiness checklist verification. Practicing binder review, PIP reporting, and QAPI interview responses ensures the team can respond confidently during unannounced surveys.",
          "transcript_text": "Proactive survey readiness requires quarterly mock surveys and monthly readiness checklist verification. Practicing binder review, PIP reporting, and QAPI interview responses ensures the team can respond confidently during unannounced surveys.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l28.s1.debrief",
            "scene_title": "Debriefing: QAPI as Survey Defense: Proactive Readiness"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What proactive QAPI practice would have prevented this situation?",
        "choices": [
          {
            "id": "A",
            "label": "Quarterly mock surveys practicing binder review, PIP reporting, and QAPI interview responses — combined with monthly survey-readiness checklist verification — ensure the agency is always prepared."
          },
          {
            "id": "B",
            "label": "CMS provides advance notice of surveys, so readiness preparation can be done the week before."
          },
          {
            "id": "C",
            "label": "Survey preparation is the administrator sole responsibility and does not involve QAPI activities."
          },
          {
            "id": "D",
            "label": "QAPI binders are only needed for accreditation surveys, not CMS surveys."
          },
          {
            "id": "E",
            "label": "Mock surveys are impractical for home health agencies and not recommended by CMS."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Proactive survey readiness requires quarterly mock surveys and monthly readiness checklist verification. Practicing binder review, PIP reporting, and QAPI interview responses ensures the team can respond confidently during unannounced surveys.",
        "feedbackIncorrect": "Incorrect. Proactive survey readiness requires quarterly mock surveys and monthly readiness checklist verification. Practicing binder review, PIP reporting, and QAPI interview responses ensures the team can respond confidently during unannounced surveys."
      }
    },
    {
      "id": "l29",
      "index": 29,
      "title": "QAPI Binder: Required Components",
      "estMinutes": 5,
      "learningGoal": "List all components that must be included in a survey-ready QAPI binder.",
      "scenario": "During a survey, the inspector asks for the QAPI binder. Care Indeed presents a binder containing only the QAPI policy document and three undated, unsigned meeting logs. No data reports, no PIP files, no adverse event logs, and no governing body oversight evidence are included.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Core binder sections: written QAPI plan and committee charter, quality indicator definitions and thresholds, data reports with trend charts, meeting agendas and minutes, PIP project files, adverse event and RCA logs.</li><li>Governance evidence: governing body meeting minutes showing QAPI oversight, executive dashboard reviews, and annual QAPI program evaluation.</li><li>Supporting documents: corrective action logs, audit results, staff training records related to QAPI improvements, and PoC response files.</li></ul>",
      "whyItMatters": [
        "No documentary evidence of QAPI program operation is a condition-level deficiency that can threaten agency certification."
      ],
      "practiceExample": "during documentation review, confirm that core binder sections: written qapi plan and committee charter, quality indicator definitions and thresholds, data reports with trend charts, meeting agendas and minutes, pip project files, adverse event and rca logs. Then verify that governance evidence: governing body meeting minutes showing qapi oversight, executive dashboard reviews, and annual qapi program evaluation. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Committee Charter",
          "definition": "A formal document defining the QAPI committee purpose, membership, meeting frequency, and decision-making authority."
        },
        {
          "term": "Corrective Action Log",
          "definition": "A tracking document recording all identified problems, assigned corrective actions, responsible parties, deadlines, and resolution status."
        },
        {
          "term": "Executive Dashboard",
          "definition": "A summarized data display presented to the governing body showing key quality indicators, PIP status, and adverse event trends."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L29",
          "card_id": "qapi_l29_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l29.s1.overview"
          },
          "display_title": "QAPI Binder: Required Components",
          "learner_facing_content": "Core binder sections: written QAPI plan and committee charter, quality indicator definitions and thresholds, data reports with trend charts, meeting agendas and minutes, PIP project files, adverse event and RCA logs.\nGovernance evidence: governing body meeting minutes showing QAPI oversight, executive dashboard reviews, and annual QAPI program evaluation.\nSupporting documents: corrective action logs, audit results, staff training records related to QAPI improvements, and PoC response files.",
          "learning_goal": "List all components that must be included in a survey-ready QAPI binder.",
          "why_it_matters": [
            "No documentary evidence of QAPI program operation is a condition-level deficiency that can threaten agency certification."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l29.s1.overview",
            "scene_title": "Visual showing: QAPI Binder: Required Components"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L29",
          "card_id": "qapi_l29_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l29.s1.delivery"
          },
          "display_title": "QAPI Binder: Required Components",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that core binder sections: written qapi plan and committee charter, quality indicator definitions and thresholds, data reports with trend charts, meeting agendas and minutes, pip project files, adverse event and rca logs. Then verify that governance evidence: governing body meeting minutes showing qapi oversight, executive dashboard reviews, and annual qapi program evaluation. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l29.s1.delivery",
            "scene_title": "Visual demonstrating: QAPI Binder: Required Components"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L29",
          "card_id": "qapi_l29_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l29.s1.challenge"
          },
          "display_title": "QAPI Binder: Required Components Challenge",
          "learner_facing_content": "During a survey, the inspector asks for the QAPI binder. Care Indeed presents a binder containing only the QAPI policy document and three undated, unsigned meeting logs. No data reports, no PIP files, no adverse event logs, and no governing body oversight evidence are included.",
          "transcript_text": "What deficiency will the surveyor cite?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l29.s1.challenge",
            "scene_title": "Interactive Scenario: QAPI Binder: Required Components"
          },
          "internal_challenge": {
            "id": "qapi_l29_challenge_id",
            "prompt": "What deficiency will the surveyor cite?",
            "choices": [
              {
                "id": "A",
                "label": "No documentary evidence of QAPI program operation — the surveyor will cite 42 CFR §484.65 for lacking data reports, PIP documentation, adverse event tracking, and governing body oversight, potentially issuing a condition-level deficiency."
              },
              {
                "id": "B",
                "label": "The policy document and meeting logs are sufficient evidence of a functioning QAPI program."
              },
              {
                "id": "C",
                "label": "Surveyors can only request the QAPI plan document, not supporting evidence."
              },
              {
                "id": "D",
                "label": "QAPI binder requirements only apply to agencies with Joint Commission accreditation."
              },
              {
                "id": "E",
                "label": "Undated meeting logs are acceptable because the content matters more than dates."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Surveyors expect a QAPI binder with comprehensive documentary evidence: data reports, PIP files, adverse event logs, and governing body minutes. Missing evidence of program operation can result in a condition-level deficiency under 42 CFR §484.65, threatening agency certification."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L29",
          "card_id": "qapi_l29_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l29.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Surveyors expect a QAPI binder with comprehensive documentary evidence: data reports, PIP files, adverse event logs, and governing body minutes. Missing evidence of program operation can result in a condition-level deficiency under 42 CFR §484.65, threatening agency certification.",
          "transcript_text": "Surveyors expect a QAPI binder with comprehensive documentary evidence: data reports, PIP files, adverse event logs, and governing body minutes. Missing evidence of program operation can result in a condition-level deficiency under 42 CFR §484.65, threatening agency certification.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l29.s1.debrief",
            "scene_title": "Debriefing: QAPI Binder: Required Components"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What deficiency will the surveyor cite?",
        "choices": [
          {
            "id": "A",
            "label": "No documentary evidence of QAPI program operation — the surveyor will cite 42 CFR §484.65 for lacking data reports, PIP documentation, adverse event tracking, and governing body oversight, potentially issuing a condition-level deficiency."
          },
          {
            "id": "B",
            "label": "The policy document and meeting logs are sufficient evidence of a functioning QAPI program."
          },
          {
            "id": "C",
            "label": "Surveyors can only request the QAPI plan document, not supporting evidence."
          },
          {
            "id": "D",
            "label": "QAPI binder requirements only apply to agencies with Joint Commission accreditation."
          },
          {
            "id": "E",
            "label": "Undated meeting logs are acceptable because the content matters more than dates."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Surveyors expect a QAPI binder with comprehensive documentary evidence: data reports, PIP files, adverse event logs, and governing body minutes. Missing evidence of program operation can result in a condition-level deficiency under 42 CFR §484.65, threatening agency certification.",
        "feedbackIncorrect": "Incorrect. Surveyors expect a QAPI binder with comprehensive documentary evidence: data reports, PIP files, adverse event logs, and governing body minutes. Missing evidence of program operation can result in a condition-level deficiency under 42 CFR §484.65, threatening agency certification."
      }
    },
    {
      "id": "l30",
      "index": 30,
      "title": "Organizing the QAPI Binder for Survey Access",
      "estMinutes": 5,
      "learningGoal": "Structure the QAPI binder with clear sections, indexing, and version control for rapid surveyor access.",
      "scenario": "A surveyor requests evidence of the agency most recent PIP. The QAPI coordinator searches through a single unorganized folder for 15 minutes, finding documents mixed together without labeling or dates. The surveyor notes the delay.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Use tabbed sections aligned to CMS QAPI standards: Program Plan, Quality Indicators, Data Reports, Meeting Minutes, PIPs, Adverse Events, Governance, and Corrective Actions.</li><li>Include a table of contents with dates and version numbers — surveyors should be able to locate any document within 30 seconds.</li><li>Apply document version control: date and initial all updates, archive superseded documents, and maintain a change log for policy revisions.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that use tabbed sections aligned to cms qapi standards: program plan, quality indicators, data reports, meeting minutes, pips, adverse events, governance, and corrective actions. Then verify that include a table of contents with dates and version numbers — surveyors should be able to locate any document within 30 seconds. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Version Control",
          "definition": "The practice of dating, initialing, and archiving all document updates to maintain an auditable history of QAPI documentation changes."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L30",
          "card_id": "qapi_l30_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l30.s1.overview"
          },
          "display_title": "Organizing the QAPI Binder for Survey Access",
          "learner_facing_content": "Use tabbed sections aligned to CMS QAPI standards: Program Plan, Quality Indicators, Data Reports, Meeting Minutes, PIPs, Adverse Events, Governance, and Corrective Actions.\nInclude a table of contents with dates and version numbers — surveyors should be able to locate any document within 30 seconds.\nApply document version control: date and initial all updates, archive superseded documents, and maintain a change log for policy revisions.",
          "learning_goal": "Structure the QAPI binder with clear sections, indexing, and version control for rapid surveyor access.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l30.s1.overview",
            "scene_title": "Visual showing: Organizing the QAPI Binder for Survey Access"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L30",
          "card_id": "qapi_l30_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l30.s1.delivery"
          },
          "display_title": "Organizing the QAPI Binder for Survey Access",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that use tabbed sections aligned to cms qapi standards: program plan, quality indicators, data reports, meeting minutes, pips, adverse events, governance, and corrective actions. Then verify that include a table of contents with dates and version numbers — surveyors should be able to locate any document within 30 seconds. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l30.s1.delivery",
            "scene_title": "Visual demonstrating: Organizing the QAPI Binder for Survey Access"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L30",
          "card_id": "qapi_l30_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l30.s1.challenge"
          },
          "display_title": "Organizing the QAPI Binder for Survey Access Challenge",
          "learner_facing_content": "A surveyor requests evidence of the agency most recent PIP. The QAPI coordinator searches through a single unorganized folder for 15 minutes, finding documents mixed together without labeling or dates. The surveyor notes the delay.",
          "transcript_text": "What organizational practice would have prevented this situation?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l30.s1.challenge",
            "scene_title": "Interactive Scenario: Organizing the QAPI Binder for Survey Access"
          },
          "internal_challenge": {
            "id": "qapi_l30_challenge_id",
            "prompt": "What organizational practice would have prevented this situation?",
            "choices": [
              {
                "id": "A",
                "label": "Tabbed sections with a table of contents, clear dating, and document indexing — allowing any document to be located within 30 seconds during survey."
              },
              {
                "id": "B",
                "label": "Storing all QAPI documents in a single file is acceptable as long as they exist."
              },
              {
                "id": "C",
                "label": "Surveyors are required to wait as long as needed while the agency locates documents."
              },
              {
                "id": "D",
                "label": "Electronic-only storage eliminates the need for organization because search functions exist."
              },
              {
                "id": "E",
                "label": "QAPI documents should be stored offsite for security and retrieved only when needed."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "An organized QAPI binder with tabbed sections, a table of contents, clear dating, and version-controlled documents enables rapid access during surveys. Disorganized storage delays document retrieval and may result in survey findings."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L30",
          "card_id": "qapi_l30_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l30.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "An organized QAPI binder with tabbed sections, a table of contents, clear dating, and version-controlled documents enables rapid access during surveys. Disorganized storage delays document retrieval and may result in survey findings.",
          "transcript_text": "An organized QAPI binder with tabbed sections, a table of contents, clear dating, and version-controlled documents enables rapid access during surveys. Disorganized storage delays document retrieval and may result in survey findings.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l30.s1.debrief",
            "scene_title": "Debriefing: Organizing the QAPI Binder for Survey Access"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What organizational practice would have prevented this situation?",
        "choices": [
          {
            "id": "A",
            "label": "Tabbed sections with a table of contents, clear dating, and document indexing — allowing any document to be located within 30 seconds during survey."
          },
          {
            "id": "B",
            "label": "Storing all QAPI documents in a single file is acceptable as long as they exist."
          },
          {
            "id": "C",
            "label": "Surveyors are required to wait as long as needed while the agency locates documents."
          },
          {
            "id": "D",
            "label": "Electronic-only storage eliminates the need for organization because search functions exist."
          },
          {
            "id": "E",
            "label": "QAPI documents should be stored offsite for security and retrieved only when needed."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. An organized QAPI binder with tabbed sections, a table of contents, clear dating, and version-controlled documents enables rapid access during surveys. Disorganized storage delays document retrieval and may result in survey findings.",
        "feedbackIncorrect": "Incorrect. An organized QAPI binder with tabbed sections, a table of contents, clear dating, and version-controlled documents enables rapid access during surveys. Disorganized storage delays document retrieval and may result in survey findings."
      }
    },
    {
      "id": "l31",
      "index": 31,
      "title": "Data Reports and Trend Documentation",
      "estMinutes": 5,
      "learningGoal": "Prepare and maintain data reports that demonstrate ongoing quality monitoring for surveyors.",
      "scenario": "Care Indeed QAPI binder contains a single table showing quality metrics from January — twelve months ago. No subsequent data reports exist. The surveyor asks, \"When was QAPI data last reviewed?\"",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Include quarterly trend charts for each quality indicator: readmission rates, infection rates, OASIS accuracy, patient satisfaction, and ADR outcomes.</li><li>Each chart should show: metric definition, data source, reporting period, trend direction, threshold, and any corrective actions triggered by the data.</li><li>Data reports must be summarized and linked to meeting minutes where the data was reviewed and discussed.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that include quarterly trend charts for each quality indicator: readmission rates, infection rates, oasis accuracy, patient satisfaction, and adr outcomes. Then verify that each chart should show: metric definition, data source, reporting period, trend direction, threshold, and any corrective actions triggered by the data. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L31",
          "card_id": "qapi_l31_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l31.s1.overview"
          },
          "display_title": "Data Reports and Trend Documentation",
          "learner_facing_content": "Include quarterly trend charts for each quality indicator: readmission rates, infection rates, OASIS accuracy, patient satisfaction, and ADR outcomes.\nEach chart should show: metric definition, data source, reporting period, trend direction, threshold, and any corrective actions triggered by the data.\nData reports must be summarized and linked to meeting minutes where the data was reviewed and discussed.",
          "learning_goal": "Prepare and maintain data reports that demonstrate ongoing quality monitoring for surveyors.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l31.s1.overview",
            "scene_title": "Visual showing: Data Reports and Trend Documentation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L31",
          "card_id": "qapi_l31_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l31.s1.delivery"
          },
          "display_title": "Data Reports and Trend Documentation",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that include quarterly trend charts for each quality indicator: readmission rates, infection rates, oasis accuracy, patient satisfaction, and adr outcomes. Then verify that each chart should show: metric definition, data source, reporting period, trend direction, threshold, and any corrective actions triggered by the data. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l31.s1.delivery",
            "scene_title": "Visual demonstrating: Data Reports and Trend Documentation"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L31",
          "card_id": "qapi_l31_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l31.s1.challenge"
          },
          "display_title": "Data Reports and Trend Documentation Challenge",
          "learner_facing_content": "Care Indeed QAPI binder contains a single table showing quality metrics from January — twelve months ago. No subsequent data reports exist. The surveyor asks, \"When was QAPI data last reviewed?\"",
          "transcript_text": "What data documentation standard was violated?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l31.s1.challenge",
            "scene_title": "Interactive Scenario: Data Reports and Trend Documentation"
          },
          "internal_challenge": {
            "id": "qapi_l31_challenge_id",
            "prompt": "What data documentation standard was violated?",
            "choices": [
              {
                "id": "A",
                "label": "QAPI data monitoring must be ongoing with regular (at minimum quarterly) trend reports — a single data point from twelve months ago demonstrates no active monitoring or trend analysis."
              },
              {
                "id": "B",
                "label": "Annual data reporting satisfies CMS requirements for ongoing monitoring."
              },
              {
                "id": "C",
                "label": "Data reports are optional as long as the committee discusses quality verbally."
              },
              {
                "id": "D",
                "label": "A single comprehensive report is more valuable than quarterly updates."
              },
              {
                "id": "E",
                "label": "Data reporting frequency is at the agency discretion with no CMS minimum."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Ongoing monitoring requires regular data collection and trend reporting. A single twelve-month-old data point demonstrates no active quality monitoring. Surveyors expect trend analyses across multiple periods."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L31",
          "card_id": "qapi_l31_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l31.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Ongoing monitoring requires regular data collection and trend reporting. A single twelve-month-old data point demonstrates no active quality monitoring. Surveyors expect trend analyses across multiple periods.",
          "transcript_text": "Ongoing monitoring requires regular data collection and trend reporting. A single twelve-month-old data point demonstrates no active quality monitoring. Surveyors expect trend analyses across multiple periods.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l31.s1.debrief",
            "scene_title": "Debriefing: Data Reports and Trend Documentation"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What data documentation standard was violated?",
        "choices": [
          {
            "id": "A",
            "label": "QAPI data monitoring must be ongoing with regular (at minimum quarterly) trend reports — a single data point from twelve months ago demonstrates no active monitoring or trend analysis."
          },
          {
            "id": "B",
            "label": "Annual data reporting satisfies CMS requirements for ongoing monitoring."
          },
          {
            "id": "C",
            "label": "Data reports are optional as long as the committee discusses quality verbally."
          },
          {
            "id": "D",
            "label": "A single comprehensive report is more valuable than quarterly updates."
          },
          {
            "id": "E",
            "label": "Data reporting frequency is at the agency discretion with no CMS minimum."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Ongoing monitoring requires regular data collection and trend reporting. A single twelve-month-old data point demonstrates no active quality monitoring. Surveyors expect trend analyses across multiple periods.",
        "feedbackIncorrect": "Incorrect. Ongoing monitoring requires regular data collection and trend reporting. A single twelve-month-old data point demonstrates no active quality monitoring. Surveyors expect trend analyses across multiple periods."
      }
    },
    {
      "id": "l32",
      "index": 32,
      "title": "Meeting Minutes That Demonstrate QAPI Action",
      "estMinutes": 5,
      "learningGoal": "Document QAPI committee meetings with content that proves data-driven decision-making and corrective action.",
      "scenario": "Care Indeed QAPI committee meeting minutes read: \"Quality was discussed. No concerns. Meeting adjourned.\" The same three-sentence format appears for 12 months.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Minutes must include: attendees (with roles), data presented, decisions made, corrective actions assigned (with responsible party and deadline), and follow-up from prior actions.</li><li>Avoid \"rubber stamp\" minutes that list agenda topics without analysis or decisions.</li><li>Meeting minutes should reference specific quality data, PIP status updates, incident analyses, and governing body directives.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that minutes must include: attendees (with roles), data presented and discussed, decisions made, corrective actions assigned (with responsible party and deadline), and follow-up from prior actions. Then verify that avoid \"rubber stamp\" minutes that list agenda topics without analysis or decisions — surveyors distinguish between meetings that generate action and meetings that simply occurred. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Committee Charter",
          "definition": "A formal document defining the QAPI committee purpose, membership, meeting frequency, and decision-making authority."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L32",
          "card_id": "qapi_l32_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l32.s1.overview"
          },
          "display_title": "Meeting Minutes That Demonstrate QAPI Action",
          "learner_facing_content": "Minutes must include: attendees (with roles), data presented, decisions made, corrective actions assigned (with responsible party and deadline), and follow-up from prior actions.\nAvoid \"rubber stamp\" minutes that list agenda topics without analysis or decisions.\nMeeting minutes should reference specific quality data, PIP status updates, incident analyses, and governing body directives.",
          "learning_goal": "Document QAPI committee meetings with content that proves data-driven decision-making and corrective action.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l32.s1.overview",
            "scene_title": "Visual showing: Meeting Minutes That Demonstrate QAPI Action"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L32",
          "card_id": "qapi_l32_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l32.s1.delivery"
          },
          "display_title": "Meeting Minutes That Demonstrate QAPI Action",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that minutes must include: attendees (with roles), data presented and discussed, decisions made, corrective actions assigned (with responsible party and deadline), and follow-up from prior actions. Then verify that avoid \"rubber stamp\" minutes that list agenda topics without analysis or decisions — surveyors distinguish between meetings that generate action and meetings that simply occurred. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l32.s1.delivery",
            "scene_title": "Visual demonstrating: Meeting Minutes That Demonstrate QAPI Action"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L32",
          "card_id": "qapi_l32_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l32.s1.challenge"
          },
          "display_title": "Meeting Minutes That Demonstrate QAPI Action Challenge",
          "learner_facing_content": "Care Indeed QAPI committee meeting minutes read: \"Quality was discussed. No concerns. Meeting adjourned.\" The same three-sentence format appears for 12 months.",
          "transcript_text": "Why would a surveyor view these minutes as evidence of a non-functioning QAPI program?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l32.s1.challenge",
            "scene_title": "Interactive Scenario: Meeting Minutes That Demonstrate QAPI Action"
          },
          "internal_challenge": {
            "id": "qapi_l32_challenge_id",
            "prompt": "Why would a surveyor view these minutes as evidence of a non-functioning QAPI program?",
            "choices": [
              {
                "id": "A",
                "label": "Identical boilerplate minutes with no data references, decisions, or action items demonstrate no active quality monitoring — surveyors expect evidence of data analysis, decisions, and assigned corrective actions."
              },
              {
                "id": "B",
                "label": "Brief minutes are acceptable because they confirm meetings occurred regularly."
              },
              {
                "id": "C",
                "label": "Meeting minutes content is at the agency discretion and has no CMS format requirements."
              },
              {
                "id": "D",
                "label": "Surveyors only review meeting attendance, not minute content."
              },
              {
                "id": "E",
                "label": "The minutes are sufficient because they confirm no quality concerns exist."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Surveyors distinguish between QAPI meetings that generate action and meetings that simply occurred. Identical boilerplate minutes with no data references, decisions, or corrective actions demonstrate a non-functioning program."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L32",
          "card_id": "qapi_l32_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l32.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Surveyors distinguish between QAPI meetings that generate action and meetings that simply occurred. Identical boilerplate minutes with no data references, decisions, or corrective actions demonstrate a non-functioning program.",
          "transcript_text": "Surveyors distinguish between QAPI meetings that generate action and meetings that simply occurred. Identical boilerplate minutes with no data references, decisions, or corrective actions demonstrate a non-functioning program.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l32.s1.debrief",
            "scene_title": "Debriefing: Meeting Minutes That Demonstrate QAPI Action"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "Why would a surveyor view these minutes as evidence of a non-functioning QAPI program?",
        "choices": [
          {
            "id": "A",
            "label": "Identical boilerplate minutes with no data references, decisions, or action items demonstrate no active quality monitoring — surveyors expect evidence of data analysis, decisions, and assigned corrective actions."
          },
          {
            "id": "B",
            "label": "Brief minutes are acceptable because they confirm meetings occurred regularly."
          },
          {
            "id": "C",
            "label": "Meeting minutes content is at the agency discretion and has no CMS format requirements."
          },
          {
            "id": "D",
            "label": "Surveyors only review meeting attendance, not minute content."
          },
          {
            "id": "E",
            "label": "The minutes are sufficient because they confirm no quality concerns exist."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Surveyors distinguish between QAPI meetings that generate action and meetings that simply occurred. Identical boilerplate minutes with no data references, decisions, or corrective actions demonstrate a non-functioning program.",
        "feedbackIncorrect": "Incorrect. Surveyors distinguish between QAPI meetings that generate action and meetings that simply occurred. Identical boilerplate minutes with no data references, decisions, or corrective actions demonstrate a non-functioning program."
      }
    },
    {
      "id": "l33",
      "index": 33,
      "title": "PIP Files: Survey-Ready Format",
      "estMinutes": 5,
      "learningGoal": "Structure PIP documentation files that satisfy every surveyor validation checkpoint.",
      "scenario": "A surveyor asks to see all PIPs from the past three years. Care Indeed locates the current year PIP but cannot find documentation for the previous two years projects.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Each PIP file should contain: problem statement with data justification, SMART goal, baseline measurement, intervention description, implementation timeline, outcome data with trend chart, and sustainability plan.</li><li>Archived PIPs remain in the binder to demonstrate the agency pattern of continuous improvement.</li><li>Active PIPs should have current status updates showing where the project is in the PDSA cycle.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that each pip file should contain: problem statement with data justification, smart goal, baseline measurement, intervention description, implementation timeline, outcome data with trend chart, and sustainability plan. Then verify that archived pips remain in the binder to demonstrate the agency pattern of continuous improvement across multiple cycles. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Committee Charter",
          "definition": "A formal document defining the QAPI committee purpose, membership, meeting frequency, and decision-making authority."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L33",
          "card_id": "qapi_l33_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l33.s1.overview"
          },
          "display_title": "PIP Files: Survey-Ready Format",
          "learner_facing_content": "Each PIP file should contain: problem statement with data justification, SMART goal, baseline measurement, intervention description, implementation timeline, outcome data with trend chart, and sustainability plan.\nArchived PIPs remain in the binder to demonstrate the agency pattern of continuous improvement.\nActive PIPs should have current status updates showing where the project is in the PDSA cycle.",
          "learning_goal": "Structure PIP documentation files that satisfy every surveyor validation checkpoint.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l33.s1.overview",
            "scene_title": "Visual showing: PIP Files: Survey-Ready Format"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L33",
          "card_id": "qapi_l33_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l33.s1.delivery"
          },
          "display_title": "PIP Files: Survey-Ready Format",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that each pip file should contain: problem statement with data justification, smart goal, baseline measurement, intervention description, implementation timeline, outcome data with trend chart, and sustainability plan. Then verify that archived pips remain in the binder to demonstrate the agency pattern of continuous improvement across multiple cycles. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l33.s1.delivery",
            "scene_title": "Visual demonstrating: PIP Files: Survey-Ready Format"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L33",
          "card_id": "qapi_l33_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l33.s1.challenge"
          },
          "display_title": "PIP Files: Survey-Ready Format Challenge",
          "learner_facing_content": "A surveyor asks to see all PIPs from the past three years. Care Indeed locates the current year PIP but cannot find documentation for the previous two years projects.",
          "transcript_text": "What binder management practice was missed?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l33.s1.challenge",
            "scene_title": "Interactive Scenario: PIP Files: Survey-Ready Format"
          },
          "internal_challenge": {
            "id": "qapi_l33_challenge_id",
            "prompt": "What binder management practice was missed?",
            "choices": [
              {
                "id": "A",
                "label": "Completed PIPs should be archived in the binder to demonstrate a pattern of continuous improvement — losing historical PIP files prevents the agency from showing its quality improvement trajectory."
              },
              {
                "id": "B",
                "label": "Only the current year PIP must be maintained; prior years are not required."
              },
              {
                "id": "C",
                "label": "Historical PIP files are only needed during accreditation surveys."
              },
              {
                "id": "D",
                "label": "Surveyors cannot request PIP documentation older than the current certification period."
              },
              {
                "id": "E",
                "label": "The agency can recreate historical PIP summaries from memory during the survey."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Archived PIPs document the agency continuous improvement trajectory. Surveyors expect to trace the pattern of quality improvement over time — not just review a single current project."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L33",
          "card_id": "qapi_l33_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l33.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Archived PIPs document the agency continuous improvement trajectory. Surveyors expect to trace the pattern of quality improvement over time — not just review a single current project.",
          "transcript_text": "Archived PIPs document the agency continuous improvement trajectory. Surveyors expect to trace the pattern of quality improvement over time — not just review a single current project.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l33.s1.debrief",
            "scene_title": "Debriefing: PIP Files: Survey-Ready Format"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What binder management practice was missed?",
        "choices": [
          {
            "id": "A",
            "label": "Completed PIPs should be archived in the binder to demonstrate a pattern of continuous improvement — losing historical PIP files prevents the agency from showing its quality improvement trajectory."
          },
          {
            "id": "B",
            "label": "Only the current year PIP must be maintained; prior years are not required."
          },
          {
            "id": "C",
            "label": "Historical PIP files are only needed during accreditation surveys."
          },
          {
            "id": "D",
            "label": "Surveyors cannot request PIP documentation older than the current certification period."
          },
          {
            "id": "E",
            "label": "The agency can recreate historical PIP summaries from memory during the survey."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Archived PIPs document the agency continuous improvement trajectory. Surveyors expect to trace the pattern of quality improvement over time — not just review a single current project.",
        "feedbackIncorrect": "Incorrect. Archived PIPs document the agency continuous improvement trajectory. Surveyors expect to trace the pattern of quality improvement over time — not just review a single current project."
      }
    },
    {
      "id": "l34",
      "index": 34,
      "title": "Governing Body Oversight Evidence",
      "estMinutes": 5,
      "learningGoal": "Document executive oversight of the QAPI program to satisfy Standard (e) requirements.",
      "scenario": "A surveyor reviews governing body meeting minutes for the past year. The minutes cover financial reports, staffing, and strategy but contain no mention of QAPI.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Governing body meeting minutes must explicitly reference QAPI oversight: review of quality indicators, PIP progress, adverse event trends, and resource allocation decisions.</li><li>An annual QAPI program evaluation signed by the governing body demonstrates executive accountability.</li><li>An executive QAPI dashboard should be presented at each board meeting.</li></ul>",
      "whyItMatters": [
        "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
      ],
      "practiceExample": "during documentation review, confirm that governing body meeting minutes must explicitly reference qapi oversight: review of quality indicators, pip progress, adverse event trends, and resource allocation decisions. Then verify that an annual qapi program evaluation signed by the governing body demonstrates executive accountability and program effectiveness assessment. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Committee Charter",
          "definition": "A formal document defining the QAPI committee purpose, membership, meeting frequency, and decision-making authority."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L34",
          "card_id": "qapi_l34_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l34.s1.overview"
          },
          "display_title": "Governing Body Oversight Evidence",
          "learner_facing_content": "Governing body meeting minutes must explicitly reference QAPI oversight: review of quality indicators, PIP progress, adverse event trends, and resource allocation decisions.\nAn annual QAPI program evaluation signed by the governing body demonstrates executive accountability.\nAn executive QAPI dashboard should be presented at each board meeting.",
          "learning_goal": "Document executive oversight of the QAPI program to satisfy Standard (e) requirements.",
          "why_it_matters": [
            "Surveyor expectation: QAPI is operational practice, not a binder on a shelf."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l34.s1.overview",
            "scene_title": "Visual showing: Governing Body Oversight Evidence"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L34",
          "card_id": "qapi_l34_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l34.s1.delivery"
          },
          "display_title": "Governing Body Oversight Evidence",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that governing body meeting minutes must explicitly reference qapi oversight: review of quality indicators, pip progress, adverse event trends, and resource allocation decisions. Then verify that an annual qapi program evaluation signed by the governing body demonstrates executive accountability and program effectiveness assessment. State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l34.s1.delivery",
            "scene_title": "Visual demonstrating: Governing Body Oversight Evidence"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L34",
          "card_id": "qapi_l34_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l34.s1.challenge"
          },
          "display_title": "Governing Body Oversight Evidence Challenge",
          "learner_facing_content": "A surveyor reviews governing body meeting minutes for the past year. The minutes cover financial reports, staffing, and strategy but contain no mention of QAPI.",
          "transcript_text": "What Standard (e) requirement is missing from these board minutes?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l34.s1.challenge",
            "scene_title": "Interactive Scenario: Governing Body Oversight Evidence"
          },
          "internal_challenge": {
            "id": "qapi_l34_challenge_id",
            "prompt": "What Standard (e) requirement is missing from these board minutes?",
            "choices": [
              {
                "id": "A",
                "label": "Standard (e) requires the governing body to ensure the QAPI program is defined, resourced, monitored, and evaluated — board minutes must show executive engagement with quality data."
              },
              {
                "id": "B",
                "label": "The governing body is only required to approve the initial QAPI plan."
              },
              {
                "id": "C",
                "label": "QAPI oversight is delegated to the clinical team and does not require board documentation."
              },
              {
                "id": "D",
                "label": "Financial oversight is more important than quality oversight."
              },
              {
                "id": "E",
                "label": "Standard (e) only applies to agencies owned by hospital systems."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Standard (e) assigns ultimate QAPI accountability to the governing body. Board minutes must document quality oversight activities. Absence of QAPI references is direct evidence of executive disengagement."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L34",
          "card_id": "qapi_l34_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l34.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Standard (e) assigns ultimate QAPI accountability to the governing body. Board minutes must document quality oversight activities. Absence of QAPI references is direct evidence of executive disengagement.",
          "transcript_text": "Standard (e) assigns ultimate QAPI accountability to the governing body. Board minutes must document quality oversight activities. Absence of QAPI references is direct evidence of executive disengagement.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l34.s1.debrief",
            "scene_title": "Debriefing: Governing Body Oversight Evidence"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What Standard (e) requirement is missing from these board minutes?",
        "choices": [
          {
            "id": "A",
            "label": "Standard (e) requires the governing body to ensure the QAPI program is defined, resourced, monitored, and evaluated — board minutes must show executive engagement with quality data."
          },
          {
            "id": "B",
            "label": "The governing body is only required to approve the initial QAPI plan."
          },
          {
            "id": "C",
            "label": "QAPI oversight is delegated to the clinical team and does not require board documentation."
          },
          {
            "id": "D",
            "label": "Financial oversight is more important than quality oversight."
          },
          {
            "id": "E",
            "label": "Standard (e) only applies to agencies owned by hospital systems."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Standard (e) assigns ultimate QAPI accountability to the governing body. Board minutes must document quality oversight activities. Absence of QAPI references is direct evidence of executive disengagement.",
        "feedbackIncorrect": "Incorrect. Standard (e) assigns ultimate QAPI accountability to the governing body. Board minutes must document quality oversight activities. Absence of QAPI references is direct evidence of executive disengagement."
      }
    },
    {
      "id": "l35",
      "index": 35,
      "title": "QAPI Binder Maintenance and Survey-Readiness Checklist",
      "estMinutes": 5,
      "learningGoal": "Implement an ongoing binder maintenance process that keeps documentation perpetually survey-ready.",
      "scenario": "Care Indeed learns a CMS survey is occurring next week. The administrator spends the weekend assembling a QAPI binder, backdating meeting minutes, and creating PIP documents that do not reflect actual activities.",
      "keyConcept": "<ul style=\"list-style-type:disc; padding-left:20px;\"><li>Update the binder monthly: add meeting minutes, data reports, incident logs, and PIP status updates immediately after each event.</li><li>Use a survey-readiness checklist verified monthly: QAPI plan current? Indicators defined? Data reports updated? Minutes complete? PIPs documented? Governance evidence current?</li><li>Assign a specific staff member as binder owner with documented responsibility for currency, accuracy, and accessibility.</li></ul>",
      "whyItMatters": [
        "A perpetually maintained binder eliminates the scramble when surveys are scheduled."
      ],
      "practiceExample": "during documentation review, confirm that update the binder monthly: add new meeting minutes, data reports, incident logs, and pip status updates immediately after each event or meeting. Then verify that use a survey-readiness checklist verified monthly: qapi plan current? indicators defined? data reports updated? minutes complete? pips documented? governance evidence current? adverse event log maintained? State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
      "commonMistake": "document this standard in a way that supports clinician handoff, survey traceability, and billing integrity.",
      "keyTerms": [
        {
          "term": "QAPI Binder",
          "definition": "A comprehensive, organized collection of all QAPI program documentation maintained for survey readiness and operational reference."
        },
        {
          "term": "Survey-Readiness Checklist",
          "definition": "A monthly-verified list confirming all QAPI binder components are current, complete, and accessible for survey inspection."
        }
      ],
      "transcript": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "summary": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
      "cards": [
        {
          "module_id": "qapi",
          "lesson_id": "L35",
          "card_id": "qapi_l35_s1_overview",
          "card_type": "overview",
          "app": {
            "location": "qapi.lesson.l35.s1.overview"
          },
          "display_title": "QAPI Binder Maintenance and Survey-Readiness Checklist",
          "learner_facing_content": "Update the binder monthly: add meeting minutes, data reports, incident logs, and PIP status updates immediately after each event.\nUse a survey-readiness checklist verified monthly: QAPI plan current? Indicators defined? Data reports updated? Minutes complete? PIPs documented? Governance evidence current?\nAssign a specific staff member as binder owner with documented responsibility for currency, accuracy, and accessibility.",
          "learning_goal": "Implement an ongoing binder maintenance process that keeps documentation perpetually survey-ready.",
          "why_it_matters": [
            "A perpetually maintained binder eliminates the scramble when surveys are scheduled."
          ],
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l35.s1.overview",
            "scene_title": "Visual showing: QAPI Binder Maintenance and Survey-Readiness Checklist"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L35",
          "card_id": "qapi_l35_s1_delivery",
          "card_type": "delivery",
          "app": {
            "location": "qapi.lesson.l35.s1.delivery"
          },
          "display_title": "QAPI Binder Maintenance and Survey-Readiness Checklist",
          "learner_facing_content": "<p style=\"margin-bottom:8px;\">surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence.</p><p style=\"margin-bottom:8px;\">Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.</p>",
          "cna_practice_example": "during documentation review, confirm that update the binder monthly: add new meeting minutes, data reports, incident logs, and pip status updates immediately after each event or meeting. Then verify that use a survey-readiness checklist verified monthly: qapi plan current? indicators defined? data reports updated? minutes complete? pips documented? governance evidence current? adverse event log maintained? State the patient-specific risk, the skilled action, and the measurable response in language that another reviewer can follow without assumptions.",
          "key_terms": [],
          "completion_condition": "Learner views this card and continues.",
          "narration_script": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "transcript_text": "surveyors expect a comprehensive QAPI binder containing the written plan, quality indicator definitions, trend data reports, meeting minutes with data-driven decisions, PIP project files, adverse event logs, and governing body oversight evidence. Missing documentary evidence of QAPI operation can trigger condition-level deficiencies threatening agency certification.",
          "estimated_narration_seconds": 19,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l35.s1.delivery",
            "scene_title": "Visual demonstrating: QAPI Binder Maintenance and Survey-Readiness Checklist"
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L35",
          "card_id": "qapi_l35_s1_challenge",
          "card_type": "challenge",
          "app": {
            "location": "qapi.lesson.l35.s1.challenge"
          },
          "display_title": "QAPI Binder Maintenance and Survey-Readiness Checklist Challenge",
          "learner_facing_content": "Care Indeed learns a CMS survey is occurring next week. The administrator spends the weekend assembling a QAPI binder, backdating meeting minutes, and creating PIP documents that do not reflect actual activities.",
          "transcript_text": "What are the compliance and ethical risks of this approach?",
          "estimated_narration_seconds": 30,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l35.s1.challenge",
            "scene_title": "Interactive Scenario: QAPI Binder Maintenance and Survey-Readiness Checklist"
          },
          "internal_challenge": {
            "id": "qapi_l35_challenge_id",
            "prompt": "What are the compliance and ethical risks of this approach?",
            "choices": [
              {
                "id": "A",
                "label": "Fabricating or backdating QAPI documentation is fraudulent, easily detectable by experienced surveyors, and creates greater liability than an incomplete but honest binder — perpetual maintenance eliminates the need for last-minute assembly."
              },
              {
                "id": "B",
                "label": "It is acceptable to assemble the binder before a survey as long as all documents are eventually created."
              },
              {
                "id": "C",
                "label": "Surveyors cannot distinguish backdated documents from contemporaneous records."
              },
              {
                "id": "D",
                "label": "Creating retrospective documentation is a standard industry practice."
              },
              {
                "id": "E",
                "label": "Last-minute binder assembly is expected because agencies are busy with patient care."
              }
            ],
            "correct_id_internal": "A",
            "rationale_internal": "Fabricated or backdated QAPI documentation is fraudulent and detectable. Experienced surveyors identify inconsistencies in dating, formatting, and content evolution. Perpetual binder maintenance through monthly updates eliminates the need for last-minute assembly and protects against fraud allegations."
          }
        },
        {
          "module_id": "qapi",
          "lesson_id": "L35",
          "card_id": "qapi_l35_s1_debrief",
          "card_type": "debrief",
          "app": {
            "location": "qapi.lesson.l35.s1.debrief"
          },
          "display_title": "Challenge Debrief",
          "learner_facing_content": "Fabricated or backdated QAPI documentation is fraudulent and detectable. Experienced surveyors identify inconsistencies in dating, formatting, and content evolution. Perpetual binder maintenance through monthly updates eliminates the need for last-minute assembly and protects against fraud allegations.",
          "transcript_text": "Fabricated or backdated QAPI documentation is fraudulent and detectable. Experienced surveyors identify inconsistencies in dating, formatting, and content evolution. Perpetual binder maintenance through monthly updates eliminates the need for last-minute assembly and protects against fraud allegations.",
          "estimated_narration_seconds": 40,
          "media_prompt_placeholder": {
            "app_location": "qapi.lesson.l35.s1.debrief",
            "scene_title": "Debriefing: QAPI Binder Maintenance and Survey-Readiness Checklist"
          }
        }
      ],
      "knowledgeCheck": {
        "prompt": "What are the compliance and ethical risks of this approach?",
        "choices": [
          {
            "id": "A",
            "label": "Fabricating or backdating QAPI documentation is fraudulent, easily detectable by experienced surveyors, and creates greater liability than an incomplete but honest binder — perpetual maintenance eliminates the need for last-minute assembly."
          },
          {
            "id": "B",
            "label": "It is acceptable to assemble the binder before a survey as long as all documents are eventually created."
          },
          {
            "id": "C",
            "label": "Surveyors cannot distinguish backdated documents from contemporaneous records."
          },
          {
            "id": "D",
            "label": "Creating retrospective documentation is a standard industry practice."
          },
          {
            "id": "E",
            "label": "Last-minute binder assembly is expected because agencies are busy with patient care."
          }
        ],
        "correctId": "A",
        "feedbackCorrect": "Correct. Fabricated or backdated QAPI documentation is fraudulent and detectable. Experienced surveyors identify inconsistencies in dating, formatting, and content evolution. Perpetual binder maintenance through monthly updates eliminates the need for last-minute assembly and protects against fraud allegations.",
        "feedbackIncorrect": "Incorrect. Fabricated or backdated QAPI documentation is fraudulent and detectable. Experienced surveyors identify inconsistencies in dating, formatting, and content evolution. Perpetual binder maintenance through monthly updates eliminates the need for last-minute assembly and protects against fraud allegations."
      }
    }
  ]
};

export const qapiQuizzes = [
  {
    "id": "q1",
    "module": "QAPI Regulatory Overview",
    "scenario": "During a state survey, the surveyor asks to see evidence that your agency has a documented QAPI program. Your administrator looks surprised and says \"We do quality improvement — isn't that enough?\"",
    "question": "What is the primary regulatory citation requiring a formal QAPI program for home health agencies?",
    "options": [
      {
        "id": "q1a",
        "label": "42 CFR §484.65 — Quality Assessment & Performance Improvement",
        "isCorrect": true,
        "rationale": "42 CFR §484.65 specifically mandates that home health agencies maintain an effective, ongoing, agency-wide, data-driven QAPI program."
      },
      {
        "id": "q1b",
        "label": "42 CFR §484.55 — Comprehensive Assessment of Patients",
        "isCorrect": false,
        "rationale": "This regulation covers patient assessments (OASIS), not the QAPI program requirement."
      },
      {
        "id": "q1c",
        "label": "42 CFR §484.80 — Home Health Aide Services",
        "isCorrect": false,
        "rationale": "This regulation governs aide training and supervision, not QAPI."
      },
      {
        "id": "q1d",
        "label": "42 CFR §484.50 — Patient Rights",
        "isCorrect": false,
        "rationale": "Patient rights are important but are a separate CoP from QAPI requirements."
      }
    ],
    "correctAnswerId": "q1a"
  },
  {
    "id": "q2",
    "module": "QAPI Regulatory Overview",
    "scenario": "Your QAPI committee meets quarterly. A new board member asks why the program must involve the governing body and not just the clinical staff.",
    "question": "Which statement best describes governing body responsibility under QAPI regulations?",
    "options": [
      {
        "id": "q2a",
        "label": "The governing body must review and approve the QAPI plan annually",
        "isCorrect": false,
        "rationale": "While annual review is good practice, the CoP requires ongoing involvement, not just annual approval."
      },
      {
        "id": "q2b",
        "label": "The governing body must be responsible for the QAPI program and ensure it reflects the complexity of the agency",
        "isCorrect": true,
        "rationale": "The CoPs explicitly require governing body accountability for the QAPI program, ensuring it addresses the scope and complexity of services."
      },
      {
        "id": "q2c",
        "label": "The governing body only needs to be informed of QAPI results",
        "isCorrect": false,
        "rationale": "Passive receipt of information does not meet the requirement for active responsibility."
      },
      {
        "id": "q2d",
        "label": "QAPI is delegated entirely to the quality department",
        "isCorrect": false,
        "rationale": "Delegation without oversight violates the CoP requirement for governing body responsibility."
      }
    ],
    "correctAnswerId": "q2b"
  },
  {
    "id": "q3",
    "module": "QAPI Regulatory Overview",
    "scenario": "During an Informal Dispute Resolution (IDR), your agency must demonstrate that identified problems led to measurable corrective actions.",
    "question": "Which element is REQUIRED in a compliant QAPI program structure?",
    "options": [
      {
        "id": "q3a",
        "label": "An annual staff satisfaction survey",
        "isCorrect": false,
        "rationale": "Staff satisfaction surveys are valuable but not a regulatory requirement of QAPI."
      },
      {
        "id": "q3b",
        "label": "Performance improvement projects based on data analysis",
        "isCorrect": true,
        "rationale": "The regulation requires agency-wide data analysis leading to performance improvement projects (PIPs) that address identified concerns."
      },
      {
        "id": "q3c",
        "label": "Monthly patient focus groups",
        "isCorrect": false,
        "rationale": "Patient engagement is helpful but not specifically required as a QAPI structural element."
      },
      {
        "id": "q3d",
        "label": "Third-party quality audits",
        "isCorrect": false,
        "rationale": "External audits are not mandated; the agency must conduct its own internal quality program."
      }
    ],
    "correctAnswerId": "q3b"
  },
  {
    "id": "q4",
    "module": "Data-Driven Quality Monitoring",
    "scenario": "Your agency's HHCAHPS scores show a decline in the \"Communication\" domain over the last two quarters. The DON suggests ignoring it because \"patients don't understand our processes.\"",
    "question": "What is the most appropriate QAPI response to declining HHCAHPS communication scores?",
    "options": [
      {
        "id": "q4a",
        "label": "Wait for the next quarter to see if it self-corrects",
        "isCorrect": false,
        "rationale": "Passive monitoring without action does not meet QAPI requirements for data-driven improvement."
      },
      {
        "id": "q4b",
        "label": "Initiate a PIP targeting communication practices with root cause analysis",
        "isCorrect": true,
        "rationale": "QAPI requires agencies to use data trends to identify opportunities and launch targeted performance improvement projects."
      },
      {
        "id": "q4c",
        "label": "Retrain all staff on documentation only",
        "isCorrect": false,
        "rationale": "Documentation training alone does not address the root cause of patient communication concerns."
      },
      {
        "id": "q4d",
        "label": "Dismiss the data as unreliable because of low patient response rates",
        "isCorrect": false,
        "rationale": "HHCAHPS is a CMS-validated tool. Dismissing results without analysis is a QAPI compliance failure."
      }
    ],
    "correctAnswerId": "q4b"
  },
  {
    "id": "q5",
    "module": "Data-Driven Quality Monitoring",
    "scenario": "Your agency receives its CASPER/iQIES report showing that your hospitalization rate is above the national average. You need to prepare a QAPI analysis.",
    "question": "Which quality measure is most directly relevant to monitoring unnecessary acute care utilization?",
    "options": [
      {
        "id": "q5a",
        "label": "Timely Initiation of Care",
        "isCorrect": false,
        "rationale": "Timely initiation monitors SOC visit timing, not hospitalization patterns."
      },
      {
        "id": "q5b",
        "label": "Acute Care Hospitalization Rate (risk-adjusted)",
        "isCorrect": true,
        "rationale": "The risk-adjusted ACH rate directly measures unplanned hospital admissions and is a key quality indicator for home health."
      },
      {
        "id": "q5c",
        "label": "Drug Education on All Medications",
        "isCorrect": false,
        "rationale": "Medication education is a process measure, not a direct indicator of acute care utilization."
      },
      {
        "id": "q5d",
        "label": "Improvement in Pain Interfering with Activity",
        "isCorrect": false,
        "rationale": "Pain management is an important outcome but does not directly measure hospitalization rates."
      }
    ],
    "correctAnswerId": "q5b"
  },
  {
    "id": "q6",
    "module": "Data-Driven Quality Monitoring",
    "scenario": "You are building a QAPI dashboard for the monthly committee meeting. The administrator asks you to include only the metrics where the agency is performing well.",
    "question": "What is the correct approach to data presentation in QAPI?",
    "options": [
      {
        "id": "q6a",
        "label": "Present only areas of strength to maintain staff morale",
        "isCorrect": false,
        "rationale": "Cherry-picking favorable data undermines the data-driven foundation of QAPI and can hide compliance risks."
      },
      {
        "id": "q6b",
        "label": "Present all tracked metrics including areas of concern with trend analysis",
        "isCorrect": true,
        "rationale": "QAPI requires honest, comprehensive data review. Both strengths and opportunities must be presented to drive meaningful improvement."
      },
      {
        "id": "q6c",
        "label": "Only present data when there is a documented problem",
        "isCorrect": false,
        "rationale": "Reactive-only monitoring fails the proactive requirement of an ongoing QAPI program."
      },
      {
        "id": "q6d",
        "label": "Let each department present their own metrics independently",
        "isCorrect": false,
        "rationale": "Fragmented reporting prevents the agency-wide perspective required by QAPI regulations."
      }
    ],
    "correctAnswerId": "q6b"
  },
  {
    "id": "q7",
    "module": "Performance Improvement Projects",
    "scenario": "Your agency identified a high fall rate among patients over 75. The QAPI committee decides to launch a PIP. The first step proposed is to \"tell all clinicians to be more careful.\"",
    "question": "What is the correct FIRST step in designing an effective Performance Improvement Project?",
    "options": [
      {
        "id": "q7a",
        "label": "Implement new policies immediately",
        "isCorrect": false,
        "rationale": "Implementing solutions before understanding the root cause often leads to ineffective interventions."
      },
      {
        "id": "q7b",
        "label": "Conduct a root cause analysis using objective data",
        "isCorrect": true,
        "rationale": "Effective PIPs begin with root cause analysis (RCA) to identify systemic contributors before designing targeted interventions."
      },
      {
        "id": "q7c",
        "label": "Send a memo to all staff about the problem",
        "isCorrect": false,
        "rationale": "Communication alone without structured analysis and intervention does not constitute a PIP."
      },
      {
        "id": "q7d",
        "label": "Report the issue to the state surveyor",
        "isCorrect": false,
        "rationale": "Internal quality improvement should precede external reporting unless the issue involves immediate jeopardy."
      }
    ],
    "correctAnswerId": "q7b"
  },
  {
    "id": "q8",
    "module": "Performance Improvement Projects",
    "scenario": "Your PIP to reduce medication errors has been running for 6 months. The committee asks how to determine if the project was successful.",
    "question": "What is the BEST way to evaluate PIP effectiveness?",
    "options": [
      {
        "id": "q8a",
        "label": "Ask staff if they think things have improved",
        "isCorrect": false,
        "rationale": "Subjective perceptions are not reliable evidence of measurable improvement."
      },
      {
        "id": "q8b",
        "label": "Compare pre-intervention and post-intervention data against the measurable goal",
        "isCorrect": true,
        "rationale": "PIPs require measurable goals with objective data comparison to demonstrate sustained improvement."
      },
      {
        "id": "q8c",
        "label": "Declare success once the PIP activities are completed",
        "isCorrect": false,
        "rationale": "Completing activities does not prove outcomes improved. Data must confirm results."
      },
      {
        "id": "q8d",
        "label": "End the PIP after 90 days regardless of results",
        "isCorrect": false,
        "rationale": "PIPs should continue until sustained improvement is documented, not based on arbitrary timelines."
      }
    ],
    "correctAnswerId": "q8b"
  },
  {
    "id": "q9",
    "module": "Performance Improvement Projects",
    "scenario": "A surveyor reviews your agency's QAPI binder and notes that your PIP has a goal stated as \"improve patient satisfaction.\" They cite a deficiency.",
    "question": "Why would a PIP goal of \"improve patient satisfaction\" be cited as deficient?",
    "options": [
      {
        "id": "q9a",
        "label": "Patient satisfaction is not a valid QAPI metric",
        "isCorrect": false,
        "rationale": "Patient satisfaction is a valid concern; the issue is how the goal is stated, not the topic."
      },
      {
        "id": "q9b",
        "label": "The goal is not specific, measurable, or time-bound",
        "isCorrect": true,
        "rationale": "QAPI goals must be SMART — Specific, Measurable, Achievable, Relevant, and Time-bound. Vague goals cannot be objectively evaluated."
      },
      {
        "id": "q9c",
        "label": "Only clinical outcomes can be PIP goals",
        "isCorrect": false,
        "rationale": "QAPI can address any area of agency operations, not just clinical outcomes."
      },
      {
        "id": "q9d",
        "label": "The surveyor made an error",
        "isCorrect": false,
        "rationale": "Vague, unmeasurable goals are a common and legitimate survey finding."
      }
    ],
    "correctAnswerId": "q9b"
  },
  {
    "id": "q10",
    "module": "ADR & Survey Readiness",
    "scenario": "Your agency receives an ADR (Additional Documentation Request) from Palmetto GBA for 5 patient records. The billing department wants to respond quickly with just the OASIS documents.",
    "question": "What should be included in a complete ADR response package?",
    "options": [
      {
        "id": "q10a",
        "label": "Only the OASIS assessment for each patient",
        "isCorrect": false,
        "rationale": "OASIS alone does not demonstrate medical necessity or support the plan of care."
      },
      {
        "id": "q10b",
        "label": "The complete medical record including orders, assessments, visit notes, and plan of care",
        "isCorrect": true,
        "rationale": "ADR responses must include all clinical documentation that supports the claim, demonstrating medical necessity and homebound status."
      },
      {
        "id": "q10c",
        "label": "A letter explaining why the patient qualifies for services",
        "isCorrect": false,
        "rationale": "A narrative letter without supporting documentation is insufficient for ADR compliance."
      },
      {
        "id": "q10d",
        "label": "Only the physician's orders",
        "isCorrect": false,
        "rationale": "Physician orders alone do not demonstrate that services were provided as ordered or that the patient met eligibility criteria."
      }
    ],
    "correctAnswerId": "q10b"
  },
  {
    "id": "q11",
    "module": "ADR & Survey Readiness",
    "scenario": "A state surveyor arrives unannounced and asks to review your agency's QAPI minutes from the last 12 months. Your quality coordinator says the minutes are \"somewhere on the shared drive.\"",
    "question": "What is the survey-readiness standard for QAPI documentation?",
    "options": [
      {
        "id": "q11a",
        "label": "QAPI documents only need to exist; organization does not matter",
        "isCorrect": false,
        "rationale": "Inability to produce organized documentation during a survey can result in deficiency citations."
      },
      {
        "id": "q11b",
        "label": "QAPI documentation should be maintained in an organized, readily accessible binder or system",
        "isCorrect": true,
        "rationale": "Survey readiness requires that QAPI documentation be organized, current, and immediately accessible for review upon surveyor request."
      },
      {
        "id": "q11c",
        "label": "QAPI minutes only need to be kept for 6 months",
        "isCorrect": false,
        "rationale": "Documentation should cover the full certification period and be available for review at any time."
      },
      {
        "id": "q11d",
        "label": "Surveyors cannot request QAPI minutes during an unannounced visit",
        "isCorrect": false,
        "rationale": "Surveyors can request any compliance documentation at any time during a survey visit."
      }
    ],
    "correctAnswerId": "q11b"
  },
  {
    "id": "q12",
    "module": "ADR & Survey Readiness",
    "scenario": "Your agency had 3 ADR denials last quarter. The billing manager says it's \"just the MAC being difficult.\" The QAPI committee needs to respond.",
    "question": "How should the QAPI committee address repeated ADR denials?",
    "options": [
      {
        "id": "q12a",
        "label": "Accept the denials and adjust the budget",
        "isCorrect": false,
        "rationale": "Accepting denials without analysis fails to address the underlying documentation or clinical issues."
      },
      {
        "id": "q12b",
        "label": "Track denial patterns, conduct root cause analysis, and implement a corrective PIP",
        "isCorrect": true,
        "rationale": "Repeated denials represent a data trend that QAPI must analyze. A targeted PIP addressing root causes (e.g., documentation gaps) is required."
      },
      {
        "id": "q12c",
        "label": "Appeal every denial automatically",
        "isCorrect": false,
        "rationale": "Blanket appeals without addressing root causes perpetuate the underlying problems."
      },
      {
        "id": "q12d",
        "label": "Blame individual clinicians and issue warnings",
        "isCorrect": false,
        "rationale": "QAPI focuses on systemic improvement, not individual blame. Punitive approaches do not address root causes."
      }
    ],
    "correctAnswerId": "q12b"
  },
  {
    "id": "q13",
    "module": "Defensible QAPI Binder",
    "scenario": "You are assembling your agency's QAPI binder for the first time. An experienced colleague says \"Just put in the meeting minutes and you're fine.\"",
    "question": "Which of the following is an essential component of a defensible QAPI binder?",
    "options": [
      {
        "id": "q13a",
        "label": "Only QAPI meeting minutes and attendance sheets",
        "isCorrect": false,
        "rationale": "Minutes alone do not demonstrate the full scope of QAPI activities required by the CoPs."
      },
      {
        "id": "q13b",
        "label": "QAPI plan, committee charter, meeting minutes, PIP documentation, data dashboards, and corrective action tracking",
        "isCorrect": true,
        "rationale": "A defensible QAPI binder must include the QAPI plan, governing body involvement, data analysis, PIP documentation with outcomes, and corrective action evidence."
      },
      {
        "id": "q13c",
        "label": "Staff resumes and training certificates",
        "isCorrect": false,
        "rationale": "Personnel files are maintained separately and are not core QAPI binder components."
      },
      {
        "id": "q13d",
        "label": "Patient satisfaction letters",
        "isCorrect": false,
        "rationale": "Patient feedback may inform QAPI activities but does not constitute the required documentation."
      }
    ],
    "correctAnswerId": "q13b"
  },
  {
    "id": "q14",
    "module": "Defensible QAPI Binder",
    "scenario": "During a mock survey, the reviewer notes that your QAPI binder has PIP documentation but no evidence of follow-through or outcome measurement.",
    "question": "What makes PIP documentation \"defensible\" in a survey context?",
    "options": [
      {
        "id": "q14a",
        "label": "Simply identifying a problem and creating a plan",
        "isCorrect": false,
        "rationale": "Identification and planning without execution and measurement is incomplete and citable."
      },
      {
        "id": "q14b",
        "label": "The full PDSA cycle: Plan, Do, Study, Act — with documented outcomes and sustained improvement evidence",
        "isCorrect": true,
        "rationale": "Defensible PIPs demonstrate the complete improvement cycle with pre/post data, analysis, and evidence of sustained improvement."
      },
      {
        "id": "q14c",
        "label": "Having a large volume of documentation",
        "isCorrect": false,
        "rationale": "Volume without substance does not demonstrate effective quality improvement."
      },
      {
        "id": "q14d",
        "label": "Getting staff signatures on the PIP plan",
        "isCorrect": false,
        "rationale": "Signatures show awareness but do not prove that the PIP achieved measurable outcomes."
      }
    ],
    "correctAnswerId": "q14b"
  },
  {
    "id": "q15",
    "module": "Defensible QAPI Binder",
    "scenario": "Your QAPI committee realizes that the binder has not been updated in 4 months. A survey is possible at any time.",
    "question": "What is the recommended frequency for updating QAPI binder documentation?",
    "options": [
      {
        "id": "q15a",
        "label": "Annually, before the expected survey window",
        "isCorrect": false,
        "rationale": "Surveys are unannounced. Annual updates leave gaps that can result in deficiency findings."
      },
      {
        "id": "q15b",
        "label": "After each QAPI committee meeting and whenever PIPs are updated or data is analyzed",
        "isCorrect": true,
        "rationale": "Continuous documentation ensures the binder reflects current, ongoing QAPI activity and is always survey-ready."
      },
      {
        "id": "q15c",
        "label": "Only when a deficiency has been identified",
        "isCorrect": false,
        "rationale": "Reactive documentation fails to demonstrate the proactive, ongoing nature of QAPI."
      },
      {
        "id": "q15d",
        "label": "Every 6 months",
        "isCorrect": false,
        "rationale": "Semi-annual updates may miss critical activities and leave documentation gaps that surveyors will identify."
      }
    ],
    "correctAnswerId": "q15b"
  }
];
