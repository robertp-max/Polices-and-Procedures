/**
 * LVN-009 — Pain
 * v5.4.0-RECOVERY | Observe→Identify→Decide→Document→Feedback→Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-009/lesson-01-fifth-vital.png';
import img02 from './assets/lvn-009/lesson-02-opqrstuv.png';
import img03 from './assets/lvn-009/lesson-03-classify.png';
import img04 from './assets/lvn-009/lesson-04-intervene.png';
import img05 from './assets/lvn-009/lesson-05-reassess.png';
import img06 from './assets/lvn-009/lesson-06-escalate.png';
import img07 from './assets/lvn-009/lesson-07-practice.png';


const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#B94718', orangeDark: '#A94018', ink: '#2D3748',
  muted: '#64748B', slate: '#64748B', border: '#E2E8F0', red: '#EF4444',
  white: '#FFFFFF', bg: '#F8FAFC', gold: '#C9A227',
} as const;

type ZoneKind = 'authorized' | 'conditional' | 'prohibited' | 'neutral';
type ScenarioStage = 'observe' | 'identify' | 'decide' | 'document' | 'feedback' | 'complete';

interface ScenarioChoice {
  id: string;
  label: string;
  correct: boolean;
  rationale: string;
}

interface ClinicalFeedbackData {
  observed: string;
  meaning: string;
  action: string;
  notify: string;
  document: string;
  policyRefs: string[];
}

interface Hotspot {
  id: string;
  label: string;
  shortLabel: string;
  ariaLabel?: string;
  x: number;
  y: number;
  zone: ZoneKind;
  leftAnchorId?: string;
  observe: string;
  identifyChoices: ScenarioChoice[];
  decideChoices: ScenarioChoice[];
  documentChoices: ScenarioChoice[];
  feedback: ClinicalFeedbackData;
  /** @deprecated legacy fields retained for transition */
  info?: string;
  meaning?: string;
  action?: string;
  notify?: string;
  document?: string;
  policyRefs?: string[];
}
interface KeyPoint { icon: string; title: string; detail: string; }
interface PageData {
  id: number; shortName: string; title: string; subtitle: string;
  narration: string[]; keyPoints: KeyPoint[]; clinicalTip: string;
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  authorized: { label: 'Authorized', color: CI.teal, soft: CI.tealSoft },
  conditional: { label: 'Conditional', color: CI.orange, soft: '#FFF3EC' },
  prohibited: { label: 'Prohibited', color: CI.red, soft: '#FEF2F2' },
  neutral: { label: 'Guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'LVN-009', title: 'Pain', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'De-identified patient showing discomfort beside a blank body map while an LVN performs a focused pain assessment.',
  'De-identified LVN using icon-only OPQRSTUV prompts while a patient identifies the location and pattern of pain.',
  'De-identified patient selecting a validated pain scale beside cues for tissue-related and nerve-related descriptors.',
  'De-identified ordered care-plan screen beside a cloth-wrapped cold pack, supportive positioning, and paced breathing.',
  'De-identified before-and-after reassessment showing paired scale checks, intervention timing, and functional response.',
  'De-identified LVN calling the supervising RN about uncontrolled or changing pain while the patient indicates a new location.',
  'De-identified LVN reviewing a complete pain note with scale, context, intervention, reassessment, function, and notification evidence.',
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "Fifth Vital",
    title: "Pain as the Fifth Vital Sign",
    subtitle: "Notice discomfort · locate it · use a validated scale",
    narration: [
      "Care Indeed policy CL-SD-014 treats pain as the fifth vital sign. Ask about pain and document the result at every visit, even when the patient does not volunteer a complaint. Patient self-report is the primary source when the patient can report reliably.",
      "Begin with a validated scale appropriate to the patient. Use the 0–10 Numeric Rating Scale when the patient can quantify pain, or an agency-approved FACES scale when numeric self-report is not appropriate. Use the same scale for the before-and-after comparison whenever possible.",
      "Observe nonverbal discomfort, ask the patient to point to the exact location, and use a body map when useful. The LVN records findings, follows ordered care, and reports changes; the LVN does not diagnose or independently change medication orders or the plan of care."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Assess Every Encounter",
        detail: "Agency policy (CL-SD-014): pain is treated as the 5th vital sign—assess and document at every visit"
      },
      {
        icon: "📋",
        title: "Plan-of-Care Boundary",
        detail: "Implement only current ordered interventions; report needed plan changes through the supervising RN"
      },
      {
        icon: "📋",
        title: "Validated Pain Scale",
        detail: "NRS (0–10) primary; Wong-Baker FACES when numeric scale is not appropriate"
      },
      {
        icon: "📋",
        title: "Patient Self-Report",
        detail: "Patient self-report is the gold standard—never dismiss reported pain"
      }
    ],
    clinicalTip: "Use the same validated scale before and after intervention so the response is comparable.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "h00",
        label: "Discomfort Cue",
        shortLabel: "Discomfort",
        ariaLabel: "Investigate Discomfort Cue",
        x: 27,
        y: 42,
        zone: "authorized",
        leftAnchorId: "kp-0-0",
        observe: "The patient guards the right lower back and grimaces while changing position.",
        identifyChoices: [
          {
            id: "h00-identify-correct",
            label: "Guarding is a cue to ask about pain now, but behavior does not establish intensity or a diagnosis.",
            correct: true,
            rationale: "Guarding is a cue to ask about pain now, but behavior does not establish intensity or a diagnosis."
          },
          {
            id: "h00-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Guarding is a cue to ask about pain now, but behavior does not establish intensity or a diagnosis."
          }
        ],
        decideChoices: [
          {
            id: "h00-decide-correct",
            label: "Ask the patient to self-report pain with an appropriate validated scale and assess for urgent associated symptoms.",
            correct: true,
            rationale: "Ask the patient to self-report pain with an appropriate validated scale and assess for urgent associated symptoms."
          },
          {
            id: "h00-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Ask the patient to self-report pain with an appropriate validated scale and assess for urgent associated symptoms."
          }
        ],
        documentChoices: [
          {
            id: "h00-document-correct",
            label: "Record the patient’s words, observed guarding, scale used, score, time, and associated findings.",
            correct: true,
            rationale: "Record the patient’s words, observed guarding, scale used, score, time, and associated findings."
          },
          {
            id: "h00-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record the patient’s words, observed guarding, scale used, score, time, and associated findings."
          }
        ],
        feedback: {
          observed: "The patient guards the right lower back and grimaces while changing position.",
          meaning: "Guarding is a cue to ask about pain now, but behavior does not establish intensity or a diagnosis.",
          action: "Ask the patient to self-report pain with an appropriate validated scale and assess for urgent associated symptoms.",
          notify: "Notify the supervising RN promptly for new severe pain, acute distress, or concerning associated symptoms; activate emergency services when indicated.",
          document: "Record the patient’s words, observed guarding, scale used, score, time, and associated findings.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Guarding is a cue to ask about pain now, but behavior does not establish intensity or a diagnosis.",
        action: "Ask the patient to self-report pain with an appropriate validated scale and assess for urgent associated symptoms.",
        notify: "Notify the supervising RN promptly for new severe pain, acute distress, or concerning associated symptoms; activate emergency services when indicated.",
        document: "Record the patient’s words, observed guarding, scale used, score, time, and associated findings."
      },
      {
        id: "h01",
        label: "Body Map",
        shortLabel: "Body Map",
        ariaLabel: "Investigate Body Map",
        x: 54,
        y: 59,
        zone: "authorized",
        leftAnchorId: "kp-0-1",
        observe: "A blank body map is available to mark the patient-indicated right lower-back location without adding a diagnostic label.",
        identifyChoices: [
          {
            id: "h01-identify-correct",
            label: "An anatomically specific location supports trend comparison and RN communication better than a general statement of pain.",
            correct: true,
            rationale: "An anatomically specific location supports trend comparison and RN communication better than a general statement of pain."
          },
          {
            id: "h01-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. An anatomically specific location supports trend comparison and RN communication better than a general statement of pain."
          }
        ],
        decideChoices: [
          {
            id: "h01-decide-correct",
            label: "Ask the patient to point to the painful area and whether it stays there or travels; mark only what the patient reports.",
            correct: true,
            rationale: "Ask the patient to point to the painful area and whether it stays there or travels; mark only what the patient reports."
          },
          {
            id: "h01-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Ask the patient to point to the painful area and whether it stays there or travels; mark only what the patient reports."
          }
        ],
        documentChoices: [
          {
            id: "h01-document-correct",
            label: "Record side, body region, radiation or absence of radiation, patient description, and change from baseline.",
            correct: true,
            rationale: "Record side, body region, radiation or absence of radiation, patient description, and change from baseline."
          },
          {
            id: "h01-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record side, body region, radiation or absence of radiation, patient description, and change from baseline."
          }
        ],
        feedback: {
          observed: "A blank body map is available to mark the patient-indicated right lower-back location without adding a diagnostic label.",
          meaning: "An anatomically specific location supports trend comparison and RN communication better than a general statement of pain.",
          action: "Ask the patient to point to the painful area and whether it stays there or travels; mark only what the patient reports.",
          notify: "Report a new location, radiation, or meaningful change from the prior visit to the supervising RN according to urgency.",
          document: "Record side, body region, radiation or absence of radiation, patient description, and change from baseline.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "An anatomically specific location supports trend comparison and RN communication better than a general statement of pain.",
        action: "Ask the patient to point to the painful area and whether it stays there or travels; mark only what the patient reports.",
        notify: "Report a new location, radiation, or meaningful change from the prior visit to the supervising RN according to urgency.",
        document: "Record side, body region, radiation or absence of radiation, patient description, and change from baseline."
      },
      {
        id: "h02",
        label: "Validated Scale",
        shortLabel: "Pain Scale",
        ariaLabel: "Investigate Validated Scale",
        x: 77,
        y: 48,
        zone: "authorized",
        leftAnchorId: "kp-0-2",
        observe: "The LVN offers a 0–10 Numeric Rating Scale and an agency-approved FACES option suited to the patient’s communication needs.",
        identifyChoices: [
          {
            id: "h02-identify-correct",
            label: "A named validated scale creates a reproducible baseline; a nurse estimate cannot replace the capable patient’s score.",
            correct: true,
            rationale: "A named validated scale creates a reproducible baseline; a nurse estimate cannot replace the capable patient’s score."
          },
          {
            id: "h02-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. A named validated scale creates a reproducible baseline; a nurse estimate cannot replace the capable patient’s score."
          }
        ],
        decideChoices: [
          {
            id: "h02-decide-correct",
            label: "Choose the scale the patient can use reliably, explain its endpoints, and obtain a baseline at rest and with relevant activity.",
            correct: true,
            rationale: "Choose the scale the patient can use reliably, explain its endpoints, and obtain a baseline at rest and with relevant activity."
          },
          {
            id: "h02-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Choose the scale the patient can use reliably, explain its endpoints, and obtain a baseline at rest and with relevant activity."
          }
        ],
        documentChoices: [
          {
            id: "h02-document-correct",
            label: "Name the scale and record the score, rest/activity context, time, patient goal, and any communication accommodation.",
            correct: true,
            rationale: "Name the scale and record the score, rest/activity context, time, patient goal, and any communication accommodation."
          },
          {
            id: "h02-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Name the scale and record the score, rest/activity context, time, patient goal, and any communication accommodation."
          }
        ],
        feedback: {
          observed: "The LVN offers a 0–10 Numeric Rating Scale and an agency-approved FACES option suited to the patient’s communication needs.",
          meaning: "A named validated scale creates a reproducible baseline; a nurse estimate cannot replace the capable patient’s score.",
          action: "Choose the scale the patient can use reliably, explain its endpoints, and obtain a baseline at rest and with relevant activity.",
          notify: "Notify the RN when the score is above ordered parameters or the patient’s goal, or reliable self-report cannot be obtained and pain is suspected.",
          document: "Name the scale and record the score, rest/activity context, time, patient goal, and any communication accommodation.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "A named validated scale creates a reproducible baseline; a nurse estimate cannot replace the capable patient’s score.",
        action: "Choose the scale the patient can use reliably, explain its endpoints, and obtain a baseline at rest and with relevant activity.",
        notify: "Notify the RN when the score is above ordered parameters or the patient’s goal, or reliable self-report cannot be obtained and pain is suspected.",
        document: "Name the scale and record the score, rest/activity context, time, patient goal, and any communication accommodation."
      }
    ]
  },
  {
    id: 1,
    shortName: "OPQRSTUV",
    title: "Comprehensive Pain Assessment — OPQRSTUV",
    subtitle: "Severity alone is not enough",
    narration: [
      "A pain score alone is insufficient for clinical decision-making. The number describes severity but not character, pattern, or impact. Care Indeed expects a comprehensive pain assessment using the OPQRSTUV framework at initial assessment and whenever pain characteristics change (agency policy CL-SD-014). Report significant changes to the supervising RN so the plan of care can be reviewed.",
      "O — Onset: When did the pain begin? Sudden or gradual? What were you doing when it started? New sudden pain may be a reportable clinical change requiring RN/physician notification per agency escalation pathways.",
      "P — Provocation/Palliation: What makes it worse or better? Activities, positions, medications, and time-of-day patterns guide intervention planning within the ordered POC."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Complete OPQRSTUV",
        detail: "OPQRSTUV: Onset, Provocation, Quality, Region, Severity, Timing, Understanding, Values"
      },
      {
        icon: "📋",
        title: "Baseline and Change Assessment",
        detail: "Full framework at baseline and when pain character changes (agency policy)"
      },
      {
        icon: "📋",
        title: "Rest and Activity Context",
        detail: "Document severity at REST and during ACTIVITY/PROCEDURES separately"
      },
      {
        icon: "📋",
        title: "Patient Goal and Function",
        detail: "Patient pain goal (V) is the effectiveness benchmark—and the escalation trigger"
      }
    ],
    clinicalTip: "A score becomes useful when paired with location, quality, timing, function, and goal.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "h10",
        label: "OPQRSTUV Prompts",
        shortLabel: "OPQRSTUV",
        ariaLabel: "Investigate OPQRSTUV Prompts",
        x: 39,
        y: 73,
        zone: "authorized",
        leftAnchorId: "kp-1-0",
        observe: "Icon-only prompts cue Onset, Provocation/Palliation, Quality, Region/Radiation, Severity, Timing, Understanding, and Values/goals.",
        identifyChoices: [
          {
            id: "h10-identify-correct",
            label: "The structured sequence prevents a severity-only assessment and supports consistent change reporting.",
            correct: true,
            rationale: "The structured sequence prevents a severity-only assessment and supports consistent change reporting."
          },
          {
            id: "h10-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. The structured sequence prevents a severity-only assessment and supports consistent change reporting."
          }
        ],
        decideChoices: [
          {
            id: "h10-decide-correct",
            label: "Ask each relevant OPQRSTUV element and pause for the patient’s own description rather than suggesting an answer.",
            correct: true,
            rationale: "Ask each relevant OPQRSTUV element and pause for the patient’s own description rather than suggesting an answer."
          },
          {
            id: "h10-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Ask each relevant OPQRSTUV element and pause for the patient’s own description rather than suggesting an answer."
          }
        ],
        documentChoices: [
          {
            id: "h10-document-correct",
            label: "Record each OPQRSTUV element obtained, including the patient’s exact descriptors and stated goal.",
            correct: true,
            rationale: "Record each OPQRSTUV element obtained, including the patient’s exact descriptors and stated goal."
          },
          {
            id: "h10-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record each OPQRSTUV element obtained, including the patient’s exact descriptors and stated goal."
          }
        ],
        feedback: {
          observed: "Icon-only prompts cue Onset, Provocation/Palliation, Quality, Region/Radiation, Severity, Timing, Understanding, and Values/goals.",
          meaning: "The structured sequence prevents a severity-only assessment and supports consistent change reporting.",
          action: "Ask each relevant OPQRSTUV element and pause for the patient’s own description rather than suggesting an answer.",
          notify: "Escalate sudden onset, a major pattern change, or concerning associated symptoms to the RN at the urgency the condition requires.",
          document: "Record each OPQRSTUV element obtained, including the patient’s exact descriptors and stated goal.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "The structured sequence prevents a severity-only assessment and supports consistent change reporting.",
        action: "Ask each relevant OPQRSTUV element and pause for the patient’s own description rather than suggesting an answer.",
        notify: "Escalate sudden onset, a major pattern change, or concerning associated symptoms to the RN at the urgency the condition requires.",
        document: "Record each OPQRSTUV element obtained, including the patient’s exact descriptors and stated goal."
      },
      {
        id: "h11",
        label: "Location and Radiation",
        shortLabel: "Location",
        ariaLabel: "Investigate Location and Radiation",
        x: 32,
        y: 45,
        zone: "authorized",
        leftAnchorId: "kp-1-1",
        observe: "The patient points to the right hip and traces discomfort down the lateral thigh.",
        identifyChoices: [
          {
            id: "h11-identify-correct",
            label: "Region and radiation are patient-reported characteristics that help the RN recognize change; they do not authorize an LVN diagnosis.",
            correct: true,
            rationale: "Region and radiation are patient-reported characteristics that help the RN recognize change; they do not authorize an LVN diagnosis."
          },
          {
            id: "h11-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Region and radiation are patient-reported characteristics that help the RN recognize change; they do not authorize an LVN diagnosis."
          }
        ],
        decideChoices: [
          {
            id: "h11-decide-correct",
            label: "Clarify the start point, direction, endpoint, and whether the pattern is new or different from baseline.",
            correct: true,
            rationale: "Clarify the start point, direction, endpoint, and whether the pattern is new or different from baseline."
          },
          {
            id: "h11-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Clarify the start point, direction, endpoint, and whether the pattern is new or different from baseline."
          }
        ],
        documentChoices: [
          {
            id: "h11-document-correct",
            label: "Record the precise region, side, radiation path, onset, associated findings, and comparison with the prior pattern.",
            correct: true,
            rationale: "Record the precise region, side, radiation path, onset, associated findings, and comparison with the prior pattern."
          },
          {
            id: "h11-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record the precise region, side, radiation path, onset, associated findings, and comparison with the prior pattern."
          }
        ],
        feedback: {
          observed: "The patient points to the right hip and traces discomfort down the lateral thigh.",
          meaning: "Region and radiation are patient-reported characteristics that help the RN recognize change; they do not authorize an LVN diagnosis.",
          action: "Clarify the start point, direction, endpoint, and whether the pattern is new or different from baseline.",
          notify: "Notify the RN of new radiation, a new site, or a pattern accompanied by weakness, numbness, chest pain, or other urgent findings.",
          document: "Record the precise region, side, radiation path, onset, associated findings, and comparison with the prior pattern.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Region and radiation are patient-reported characteristics that help the RN recognize change; they do not authorize an LVN diagnosis.",
        action: "Clarify the start point, direction, endpoint, and whether the pattern is new or different from baseline.",
        notify: "Notify the RN of new radiation, a new site, or a pattern accompanied by weakness, numbness, chest pain, or other urgent findings.",
        document: "Record the precise region, side, radiation path, onset, associated findings, and comparison with the prior pattern."
      },
      {
        id: "h12",
        label: "Patient Goal and Function",
        shortLabel: "Goal & Function",
        ariaLabel: "Investigate Patient Goal and Function",
        x: 60,
        y: 53,
        zone: "authorized",
        leftAnchorId: "kp-1-2",
        observe: "The patient states an acceptable goal of 3/10 and a wish to walk safely to the bathroom.",
        identifyChoices: [
          {
            id: "h12-identify-correct",
            label: "Values and functional impact define effectiveness beyond a numeric change alone.",
            correct: true,
            rationale: "Values and functional impact define effectiveness beyond a numeric change alone."
          },
          {
            id: "h12-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Values and functional impact define effectiveness beyond a numeric change alone."
          }
        ],
        decideChoices: [
          {
            id: "h12-decide-correct",
            label: "Ask what level is acceptable and what activity the patient needs to perform, then compare current ability with baseline.",
            correct: true,
            rationale: "Ask what level is acceptable and what activity the patient needs to perform, then compare current ability with baseline."
          },
          {
            id: "h12-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Ask what level is acceptable and what activity the patient needs to perform, then compare current ability with baseline."
          }
        ],
        documentChoices: [
          {
            id: "h12-document-correct",
            label: "Record the goal, affected activity, current assistance or tolerance, score during that activity, and patient priorities.",
            correct: true,
            rationale: "Record the goal, affected activity, current assistance or tolerance, score during that activity, and patient priorities."
          },
          {
            id: "h12-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record the goal, affected activity, current assistance or tolerance, score during that activity, and patient priorities."
          }
        ],
        feedback: {
          observed: "The patient states an acceptable goal of 3/10 and a wish to walk safely to the bathroom.",
          meaning: "Values and functional impact define effectiveness beyond a numeric change alone.",
          action: "Ask what level is acceptable and what activity the patient needs to perform, then compare current ability with baseline.",
          notify: "Report pain above the stated goal that limits ordered mobility or care despite implemented measures.",
          document: "Record the goal, affected activity, current assistance or tolerance, score during that activity, and patient priorities.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Values and functional impact define effectiveness beyond a numeric change alone.",
        action: "Ask what level is acceptable and what activity the patient needs to perform, then compare current ability with baseline.",
        notify: "Report pain above the stated goal that limits ordered mobility or care despite implemented measures.",
        document: "Record the goal, affected activity, current assistance or tolerance, score during that activity, and patient priorities."
      }
    ]
  },
  {
    id: 2,
    shortName: "Classify",
    title: "Validated Scale and Pain Descriptors",
    subtitle: "Report characteristics without diagnosing",
    narration: [
      "Understanding pain type improves assessment documentation and communication with the supervising RN and physician about treatment effectiveness. Classification is a clinical description based on patient report and context—not an independent medical diagnosis by the LVN.",
      "Nociceptive pain relates to actual or potential tissue damage. Somatic nociceptive pain (skin, bone, muscle, joints) is typically well-localized—sharp, aching, or throbbing—and often worsens with movement or palpation (e.g., surgical incision, arthritis, fracture-related pain). Visceral nociceptive pain (internal organs) is poorly localized—deep, cramping, or pressure—and may be referred (e.g., abdominal organ pain).",
      "Neuropathic pain relates to nervous system damage or dysfunction. Descriptors often include burning, shooting, electric, tingling, or numbness, often along a nerve distribution. Allodynia (pain from light touch) may be present. Examples include diabetic neuropathy and post-herpetic neuralgia. Neuropathic pain often responds poorly to standard analgesics alone and may require adjuvant medications ordered by the physician (e.g., gabapentinoids)—the LVN does not start these agents without orders."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Describe Tissue-Related Features",
        detail: "Nociceptive: tissue-related — somatic (localized/sharp/aching) or visceral (deep/cramping/referred)"
      },
      {
        icon: "📋",
        title: "Describe Nerve-Related Features",
        detail: "Neuropathic: nerve-related — burning/shooting/tingling; may need adjuvant meds (ordered only)"
      },
      {
        icon: "📋",
        title: "Document Mixed Descriptors",
        detail: "Mixed pain is common—document both components when present"
      },
      {
        icon: "📋",
        title: "Report Without Diagnosing",
        detail: "Quality descriptors are your classification and reporting tool—not a license to diagnose"
      }
    ],
    clinicalTip: "Document descriptors and report changes; do not convert them into an independent diagnosis.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "h20",
        label: "Patient Scale Selection",
        shortLabel: "Self-Report",
        ariaLabel: "Investigate Patient Scale Selection",
        x: 75,
        y: 68,
        zone: "authorized",
        leftAnchorId: "kp-2-0",
        observe: "The patient independently selects 6 on the Numeric Rating Scale while appearing calm at rest.",
        identifyChoices: [
          {
            id: "h20-identify-correct",
            label: "A capable patient’s self-report determines intensity; calm behavior may be recorded but does not invalidate the 6/10 rating.",
            correct: true,
            rationale: "A capable patient’s self-report determines intensity; calm behavior may be recorded but does not invalidate the 6/10 rating."
          },
          {
            id: "h20-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. A capable patient’s self-report determines intensity; calm behavior may be recorded but does not invalidate the 6/10 rating."
          }
        ],
        decideChoices: [
          {
            id: "h20-decide-correct",
            label: "Accept the reported score, clarify rest/activity context, and continue the ordered pain assessment.",
            correct: true,
            rationale: "Accept the reported score, clarify rest/activity context, and continue the ordered pain assessment."
          },
          {
            id: "h20-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Accept the reported score, clarify rest/activity context, and continue the ordered pain assessment."
          }
        ],
        documentChoices: [
          {
            id: "h20-document-correct",
            label: "Record “NRS 6/10,” context, patient quote, observed behavior separately, goal, and time.",
            correct: true,
            rationale: "Record “NRS 6/10,” context, patient quote, observed behavior separately, goal, and time."
          },
          {
            id: "h20-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record “NRS 6/10,” context, patient quote, observed behavior separately, goal, and time."
          }
        ],
        feedback: {
          observed: "The patient independently selects 6 on the Numeric Rating Scale while appearing calm at rest.",
          meaning: "A capable patient’s self-report determines intensity; calm behavior may be recorded but does not invalidate the 6/10 rating.",
          action: "Accept the reported score, clarify rest/activity context, and continue the ordered pain assessment.",
          notify: "Notify the RN when 6/10 exceeds the patient goal or ordered reporting parameter, or represents a significant change.",
          document: "Record “NRS 6/10,” context, patient quote, observed behavior separately, goal, and time.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "A capable patient’s self-report determines intensity; calm behavior may be recorded but does not invalidate the 6/10 rating.",
        action: "Accept the reported score, clarify rest/activity context, and continue the ordered pain assessment.",
        notify: "Notify the RN when 6/10 exceeds the patient goal or ordered reporting parameter, or represents a significant change.",
        document: "Record “NRS 6/10,” context, patient quote, observed behavior separately, goal, and time."
      },
      {
        id: "h21",
        label: "FACES Scale",
        shortLabel: "FACES",
        ariaLabel: "Investigate FACES Scale",
        x: 45,
        y: 71,
        zone: "authorized",
        leftAnchorId: "kp-2-1",
        observe: "An agency-approved FACES card offers a visual self-report option without requiring the patient to calculate a number unaided.",
        identifyChoices: [
          {
            id: "h21-identify-correct",
            label: "An approved alternative supports reliable self-report when the patient understands the faces better than numeric endpoints.",
            correct: true,
            rationale: "An approved alternative supports reliable self-report when the patient understands the faces better than numeric endpoints."
          },
          {
            id: "h21-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. An approved alternative supports reliable self-report when the patient understands the faces better than numeric endpoints."
          }
        ],
        decideChoices: [
          {
            id: "h21-decide-correct",
            label: "Explain the scale, confirm it represents the patient’s own pain, and use the same scale for reassessment.",
            correct: true,
            rationale: "Explain the scale, confirm it represents the patient’s own pain, and use the same scale for reassessment."
          },
          {
            id: "h21-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Explain the scale, confirm it represents the patient’s own pain, and use the same scale for reassessment."
          }
        ],
        documentChoices: [
          {
            id: "h21-document-correct",
            label: "Name the FACES scale, selected rating, reason for its use, context, and communication support provided.",
            correct: true,
            rationale: "Name the FACES scale, selected rating, reason for its use, context, and communication support provided."
          },
          {
            id: "h21-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Name the FACES scale, selected rating, reason for its use, context, and communication support provided."
          }
        ],
        feedback: {
          observed: "An agency-approved FACES card offers a visual self-report option without requiring the patient to calculate a number unaided.",
          meaning: "An approved alternative supports reliable self-report when the patient understands the faces better than numeric endpoints.",
          action: "Explain the scale, confirm it represents the patient’s own pain, and use the same scale for reassessment.",
          notify: "Consult the RN when no available scale yields reliable self-report and behavioral pain cues persist.",
          document: "Name the FACES scale, selected rating, reason for its use, context, and communication support provided.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "An approved alternative supports reliable self-report when the patient understands the faces better than numeric endpoints.",
        action: "Explain the scale, confirm it represents the patient’s own pain, and use the same scale for reassessment.",
        notify: "Consult the RN when no available scale yields reliable self-report and behavioral pain cues persist.",
        document: "Name the FACES scale, selected rating, reason for its use, context, and communication support provided."
      },
      {
        id: "h22",
        label: "Quality Descriptors",
        shortLabel: "Descriptors",
        ariaLabel: "Investigate Quality Descriptors",
        x: 26,
        y: 50,
        zone: "authorized",
        leftAnchorId: "kp-2-2",
        observe: "The patient selects “burning” and “electric” while also reporting tingling in both feet.",
        identifyChoices: [
          {
            id: "h22-identify-correct",
            label: "These are nerve-related descriptors to document and report, not an independent LVN diagnosis or medication indication.",
            correct: true,
            rationale: "These are nerve-related descriptors to document and report, not an independent LVN diagnosis or medication indication."
          },
          {
            id: "h22-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. These are nerve-related descriptors to document and report, not an independent LVN diagnosis or medication indication."
          }
        ],
        decideChoices: [
          {
            id: "h22-decide-correct",
            label: "Clarify distribution, timing, sensory change, function, and prior pattern; continue only ordered interventions.",
            correct: true,
            rationale: "Clarify distribution, timing, sensory change, function, and prior pattern; continue only ordered interventions."
          },
          {
            id: "h22-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Clarify distribution, timing, sensory change, function, and prior pattern; continue only ordered interventions."
          }
        ],
        documentChoices: [
          {
            id: "h22-document-correct",
            label: "Quote the descriptors and record distribution, timing, sensory findings, functional effect, score, and RN communication.",
            correct: true,
            rationale: "Quote the descriptors and record distribution, timing, sensory findings, functional effect, score, and RN communication."
          },
          {
            id: "h22-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Quote the descriptors and record distribution, timing, sensory findings, functional effect, score, and RN communication."
          }
        ],
        feedback: {
          observed: "The patient selects “burning” and “electric” while also reporting tingling in both feet.",
          meaning: "These are nerve-related descriptors to document and report, not an independent LVN diagnosis or medication indication.",
          action: "Clarify distribution, timing, sensory change, function, and prior pattern; continue only ordered interventions.",
          notify: "Report new burning or electric pain, numbness, weakness, or worsening function to the supervising RN.",
          document: "Quote the descriptors and record distribution, timing, sensory findings, functional effect, score, and RN communication.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "These are nerve-related descriptors to document and report, not an independent LVN diagnosis or medication indication.",
        action: "Clarify distribution, timing, sensory change, function, and prior pattern; continue only ordered interventions.",
        notify: "Report new burning or electric pain, numbness, weakness, or worsening function to the supervising RN.",
        document: "Quote the descriptors and record distribution, timing, sensory findings, functional effect, score, and RN communication."
      }
    ]
  },
  {
    id: 3,
    shortName: "Intervene",
    title: "Ordered and Nonpharmacologic Interventions",
    subtitle: "Follow the plan · protect the patient · reassess",
    narration: [
      "Implement medication interventions only when they are currently ordered and within the plan of care. Verify the active order and required medication-safety checks; do not independently start, stop, hold, increase, decrease, or substitute an analgesic.",
      "Nonpharmacologic measures such as ordered positioning, relaxation, distraction, or cold/heat may complement medication when consistent with CL-SD-014, the plan of care, patient preference, skin and sensory status, and contraindications. They do not replace needed escalation.",
      "For thermal measures, follow the current order, agency policy, and manufacturer instructions. Use a protective barrier, monitor the site and response, and stop for intolerance or adverse findings. Every intervention requires a timed reassessment."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Document Nonpharmacologic Care",
        detail: "Non-pharm interventions are expected documentation when pain is present (agency policy)"
      },
      {
        icon: "📋",
        title: "Use Cold Safely",
        detail: "Use a barrier and the authorized interval; check skin, sensation, circulation concerns, and tolerance"
      },
      {
        icon: "📋",
        title: "Use Heat Safely",
        detail: "Use only when ordered or policy-consistent and safe for the site, sensation, skin, and current condition"
      },
      {
        icon: "📋",
        title: "Position, Breathe, and Distract",
        detail: "Breathing (e.g., 4-4-4), positioning, and distraction are high-value, low-cost tools"
      }
    ],
    clinicalTip: "Verify the current order or policy-consistent measure and patient-specific safety before intervening.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "h30",
        label: "Current Care Plan",
        shortLabel: "Ordered Plan",
        ariaLabel: "Investigate Current Care Plan",
        x: 51,
        y: 41,
        zone: "authorized",
        leftAnchorId: "kp-3-0",
        observe: "A de-identified tablet shows the current authorized pain plan before any medication or treatment is provided.",
        identifyChoices: [
          {
            id: "h30-identify-correct",
            label: "The plan defines what the LVN may implement; a patient request alone is not a medication order.",
            correct: true,
            rationale: "The plan defines what the LVN may implement; a patient request alone is not a medication order."
          },
          {
            id: "h30-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. The plan defines what the LVN may implement; a patient request alone is not a medication order."
          }
        ],
        decideChoices: [
          {
            id: "h30-decide-correct",
            label: "Verify the active order, patient, intervention, parameters, allergies, and relevant safety checks before proceeding.",
            correct: true,
            rationale: "Verify the active order, patient, intervention, parameters, allergies, and relevant safety checks before proceeding."
          },
          {
            id: "h30-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Verify the active order, patient, intervention, parameters, allergies, and relevant safety checks before proceeding."
          }
        ],
        documentChoices: [
          {
            id: "h30-document-correct",
            label: "Record the verified order, assessment prompting use, intervention details, time, safety checks, and any clarification obtained.",
            correct: true,
            rationale: "Record the verified order, assessment prompting use, intervention details, time, safety checks, and any clarification obtained."
          },
          {
            id: "h30-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record the verified order, assessment prompting use, intervention details, time, safety checks, and any clarification obtained."
          }
        ],
        feedback: {
          observed: "A de-identified tablet shows the current authorized pain plan before any medication or treatment is provided.",
          meaning: "The plan defines what the LVN may implement; a patient request alone is not a medication order.",
          action: "Verify the active order, patient, intervention, parameters, allergies, and relevant safety checks before proceeding.",
          notify: "Contact the RN when the order is missing, unclear, expired, inconsistent with the medication record, or ineffective.",
          document: "Record the verified order, assessment prompting use, intervention details, time, safety checks, and any clarification obtained.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "The plan defines what the LVN may implement; a patient request alone is not a medication order.",
        action: "Verify the active order, patient, intervention, parameters, allergies, and relevant safety checks before proceeding.",
        notify: "Contact the RN when the order is missing, unclear, expired, inconsistent with the medication record, or ineffective.",
        document: "Record the verified order, assessment prompting use, intervention details, time, safety checks, and any clarification obtained."
      },
      {
        id: "h31",
        label: "Protected Cold Pack",
        shortLabel: "Cold Pack",
        ariaLabel: "Investigate Protected Cold Pack",
        x: 73,
        y: 55,
        zone: "authorized",
        leftAnchorId: "kp-3-1",
        observe: "A cold pack is wrapped in cloth after the LVN checks skin integrity, sensation, tolerance, and plan consistency.",
        identifyChoices: [
          {
            id: "h31-identify-correct",
            label: "Protected cold may be used only when appropriate for this patient and consistent with the ordered or policy-approved plan.",
            correct: true,
            rationale: "Protected cold may be used only when appropriate for this patient and consistent with the ordered or policy-approved plan."
          },
          {
            id: "h31-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Protected cold may be used only when appropriate for this patient and consistent with the ordered or policy-approved plan."
          }
        ],
        decideChoices: [
          {
            id: "h31-decide-correct",
            label: "Apply with the barrier for the authorized interval, monitor skin and comfort, and stop for numbness, discoloration, or intolerance.",
            correct: true,
            rationale: "Apply with the barrier for the authorized interval, monitor skin and comfort, and stop for numbness, discoloration, or intolerance."
          },
          {
            id: "h31-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Apply with the barrier for the authorized interval, monitor skin and comfort, and stop for numbness, discoloration, or intolerance."
          }
        ],
        documentChoices: [
          {
            id: "h31-document-correct",
            label: "Record site, barrier, start and stop times, pre/post skin findings, patient tolerance, and pain response.",
            correct: true,
            rationale: "Record site, barrier, start and stop times, pre/post skin findings, patient tolerance, and pain response."
          },
          {
            id: "h31-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record site, barrier, start and stop times, pre/post skin findings, patient tolerance, and pain response."
          }
        ],
        feedback: {
          observed: "A cold pack is wrapped in cloth after the LVN checks skin integrity, sensation, tolerance, and plan consistency.",
          meaning: "Protected cold may be used only when appropriate for this patient and consistent with the ordered or policy-approved plan.",
          action: "Apply with the barrier for the authorized interval, monitor skin and comfort, and stop for numbness, discoloration, or intolerance.",
          notify: "Notify the RN of contraindications, impaired sensation, vascular concerns, adverse skin response, or worsening pain.",
          document: "Record site, barrier, start and stop times, pre/post skin findings, patient tolerance, and pain response.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Protected cold may be used only when appropriate for this patient and consistent with the ordered or policy-approved plan.",
        action: "Apply with the barrier for the authorized interval, monitor skin and comfort, and stop for numbness, discoloration, or intolerance.",
        notify: "Notify the RN of contraindications, impaired sensation, vascular concerns, adverse skin response, or worsening pain.",
        document: "Record site, barrier, start and stop times, pre/post skin findings, patient tolerance, and pain response."
      },
      {
        id: "h32",
        label: "Positioning and Breathing",
        shortLabel: "Position & Breathe",
        ariaLabel: "Investigate Positioning and Breathing",
        x: 59,
        y: 73,
        zone: "authorized",
        leftAnchorId: "kp-3-2",
        observe: "The patient uses supportive pillows and paced breathing before a painful movement.",
        identifyChoices: [
          {
            id: "h32-identify-correct",
            label: "Positioning and relaxation can complement ordered treatment and support function without changing medication.",
            correct: true,
            rationale: "Positioning and relaxation can complement ordered treatment and support function without changing medication."
          },
          {
            id: "h32-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Positioning and relaxation can complement ordered treatment and support function without changing medication."
          }
        ],
        decideChoices: [
          {
            id: "h32-decide-correct",
            label: "Offer an acceptable safe position and coach paced breathing, then evaluate whether movement tolerance and pain improve.",
            correct: true,
            rationale: "Offer an acceptable safe position and coach paced breathing, then evaluate whether movement tolerance and pain improve."
          },
          {
            id: "h32-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Offer an acceptable safe position and coach paced breathing, then evaluate whether movement tolerance and pain improve."
          }
        ],
        documentChoices: [
          {
            id: "h32-document-correct",
            label: "Record the technique, duration, patient participation, before/after score, activity tolerance, and teaching response.",
            correct: true,
            rationale: "Record the technique, duration, patient participation, before/after score, activity tolerance, and teaching response."
          },
          {
            id: "h32-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record the technique, duration, patient participation, before/after score, activity tolerance, and teaching response."
          }
        ],
        feedback: {
          observed: "The patient uses supportive pillows and paced breathing before a painful movement.",
          meaning: "Positioning and relaxation can complement ordered treatment and support function without changing medication.",
          action: "Offer an acceptable safe position and coach paced breathing, then evaluate whether movement tolerance and pain improve.",
          notify: "Report inability to tolerate necessary care or persistent pain above goal despite these measures.",
          document: "Record the technique, duration, patient participation, before/after score, activity tolerance, and teaching response.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Positioning and relaxation can complement ordered treatment and support function without changing medication.",
        action: "Offer an acceptable safe position and coach paced breathing, then evaluate whether movement tolerance and pain improve.",
        notify: "Report inability to tolerate necessary care or persistent pain above goal despite these measures.",
        document: "Record the technique, duration, patient participation, before/after score, activity tolerance, and teaching response."
      }
    ]
  },
  {
    id: 4,
    shortName: "Reassess",
    title: "Timed Reassessment and Functional Response",
    subtitle: "Before score · intervention/time · after score · function",
    narration: [
      "Reassessment closes the pain-management cycle. Record the baseline score and context, intervention and time, reassessment time, post-intervention score using the same validated scale when possible, and whether the patient’s goal and functional target were met.",
      "Follow the current ordered or agency-policy interval appropriate to the intervention and route. Do not use a memorized interval in place of the current order or policy, and reassess sooner when condition or risk warrants it.",
      "A lower number alone is incomplete. Ask whether the patient can sleep, transfer, walk, breathe deeply, or participate in treatment more effectively. Persistent, worsening, or function-limiting pain requires RN escalation rather than an independent medication change."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Complete the Pain Cycle",
        detail: "Six-step cycle: Assess → Document → Intervene → Reassess → Document → Escalate?"
      },
      {
        icon: "📋",
        title: "Capture Paired Scores",
        detail: "Pre- AND post-intervention scores must both appear when interventions are given"
      },
      {
        icon: "📋",
        title: "Reassess at the Authorized Time",
        detail: "Record both exact times and follow the current order or CL-SD-014 interval for the intervention and route"
      },
      {
        icon: "📋",
        title: "Escalate a Missed Goal",
        detail: "Escalate to RN when pain consistently exceeds the patient’s stated goal—LVN does not rewrite orders"
      }
    ],
    clinicalTip: "A defensible reassessment pairs two scores with two times and a functional comparison.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "h40",
        label: "Before Score and Function",
        shortLabel: "Before",
        ariaLabel: "Investigate Before Score and Function",
        x: 29,
        y: 38,
        zone: "authorized",
        leftAnchorId: "kp-4-0",
        observe: "Before intervention, the patient reports NRS 7/10 at 09:10 and stops after three steps because of right-knee pain.",
        identifyChoices: [
          {
            id: "h40-identify-correct",
            label: "The baseline combines a validated score, exact time, location, activity context, and measurable functional limitation.",
            correct: true,
            rationale: "The baseline combines a validated score, exact time, location, activity context, and measurable functional limitation."
          },
          {
            id: "h40-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. The baseline combines a validated score, exact time, location, activity context, and measurable functional limitation."
          }
        ],
        decideChoices: [
          {
            id: "h40-decide-correct",
            label: "Confirm the goal and relevant OPQRSTUV changes, then implement only the current ordered or appropriate nonpharmacologic measure.",
            correct: true,
            rationale: "Confirm the goal and relevant OPQRSTUV changes, then implement only the current ordered or appropriate nonpharmacologic measure."
          },
          {
            id: "h40-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Confirm the goal and relevant OPQRSTUV changes, then implement only the current ordered or appropriate nonpharmacologic measure."
          }
        ],
        documentChoices: [
          {
            id: "h40-document-correct",
            label: "Record NRS 7/10, 09:10, right knee, walking context, three-step tolerance, patient goal, and associated findings.",
            correct: true,
            rationale: "Record NRS 7/10, 09:10, right knee, walking context, three-step tolerance, patient goal, and associated findings."
          },
          {
            id: "h40-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record NRS 7/10, 09:10, right knee, walking context, three-step tolerance, patient goal, and associated findings."
          }
        ],
        feedback: {
          observed: "Before intervention, the patient reports NRS 7/10 at 09:10 and stops after three steps because of right-knee pain.",
          meaning: "The baseline combines a validated score, exact time, location, activity context, and measurable functional limitation.",
          action: "Confirm the goal and relevant OPQRSTUV changes, then implement only the current ordered or appropriate nonpharmacologic measure.",
          notify: "Notify the RN before or during intervention when baseline findings meet urgent or ordered reporting parameters.",
          document: "Record NRS 7/10, 09:10, right knee, walking context, three-step tolerance, patient goal, and associated findings.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "The baseline combines a validated score, exact time, location, activity context, and measurable functional limitation.",
        action: "Confirm the goal and relevant OPQRSTUV changes, then implement only the current ordered or appropriate nonpharmacologic measure.",
        notify: "Notify the RN before or during intervention when baseline findings meet urgent or ordered reporting parameters.",
        document: "Record NRS 7/10, 09:10, right knee, walking context, three-step tolerance, patient goal, and associated findings."
      },
      {
        id: "h41",
        label: "Intervention and Recheck Time",
        shortLabel: "Timed Action",
        ariaLabel: "Investigate Intervention and Recheck Time",
        x: 54,
        y: 51,
        zone: "authorized",
        leftAnchorId: "kp-4-1",
        observe: "The paired display shows an ordered intervention at 09:15 and a reassessment at the interval specified by the order and policy.",
        identifyChoices: [
          {
            id: "h41-identify-correct",
            label: "Exact intervention and reassessment times demonstrate that response was evaluated at an appropriate interval.",
            correct: true,
            rationale: "Exact intervention and reassessment times demonstrate that response was evaluated at an appropriate interval."
          },
          {
            id: "h41-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Exact intervention and reassessment times demonstrate that response was evaluated at an appropriate interval."
          }
        ],
        decideChoices: [
          {
            id: "h41-decide-correct",
            label: "Deliver the verified intervention, monitor safety, and set the recheck for the current ordered or policy-defined interval.",
            correct: true,
            rationale: "Deliver the verified intervention, monitor safety, and set the recheck for the current ordered or policy-defined interval."
          },
          {
            id: "h41-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Deliver the verified intervention, monitor safety, and set the recheck for the current ordered or policy-defined interval."
          }
        ],
        documentChoices: [
          {
            id: "h41-document-correct",
            label: "Record medication name/dose/route only as ordered or the exact nonpharmacologic measure, start time, and planned recheck time.",
            correct: true,
            rationale: "Record medication name/dose/route only as ordered or the exact nonpharmacologic measure, start time, and planned recheck time."
          },
          {
            id: "h41-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record medication name/dose/route only as ordered or the exact nonpharmacologic measure, start time, and planned recheck time."
          }
        ],
        feedback: {
          observed: "The paired display shows an ordered intervention at 09:15 and a reassessment at the interval specified by the order and policy.",
          meaning: "Exact intervention and reassessment times demonstrate that response was evaluated at an appropriate interval.",
          action: "Deliver the verified intervention, monitor safety, and set the recheck for the current ordered or policy-defined interval.",
          notify: "Contact the RN if the patient worsens before recheck, has an adverse response, or the timing instruction is unclear.",
          document: "Record medication name/dose/route only as ordered or the exact nonpharmacologic measure, start time, and planned recheck time.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Exact intervention and reassessment times demonstrate that response was evaluated at an appropriate interval.",
        action: "Deliver the verified intervention, monitor safety, and set the recheck for the current ordered or policy-defined interval.",
        notify: "Contact the RN if the patient worsens before recheck, has an adverse response, or the timing instruction is unclear.",
        document: "Record medication name/dose/route only as ordered or the exact nonpharmacologic measure, start time, and planned recheck time."
      },
      {
        id: "h42",
        label: "After Score and Function",
        shortLabel: "After",
        ariaLabel: "Investigate After Score and Function",
        x: 79,
        y: 45,
        zone: "authorized",
        leftAnchorId: "kp-4-2",
        observe: "At 09:55 the patient reports NRS 4/10 and walks ten steps with the ordered device, but the stated goal remains 3/10.",
        identifyChoices: [
          {
            id: "h42-identify-correct",
            label: "Pain and function improved, yet the patient goal was not met; both the improvement and residual need matter.",
            correct: true,
            rationale: "Pain and function improved, yet the patient goal was not met; both the improvement and residual need matter."
          },
          {
            id: "h42-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Pain and function improved, yet the patient goal was not met; both the improvement and residual need matter."
          }
        ],
        decideChoices: [
          {
            id: "h42-decide-correct",
            label: "Compare with baseline, assess adverse effects and remaining limitations, continue only authorized measures, and follow escalation parameters.",
            correct: true,
            rationale: "Compare with baseline, assess adverse effects and remaining limitations, continue only authorized measures, and follow escalation parameters."
          },
          {
            id: "h42-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Compare with baseline, assess adverse effects and remaining limitations, continue only authorized measures, and follow escalation parameters."
          }
        ],
        documentChoices: [
          {
            id: "h42-document-correct",
            label: "Record 09:55, NRS 4/10, ten-step tolerance, device/assistance, goal not met, adverse-effect check, and RN notification.",
            correct: true,
            rationale: "Record 09:55, NRS 4/10, ten-step tolerance, device/assistance, goal not met, adverse-effect check, and RN notification."
          },
          {
            id: "h42-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record 09:55, NRS 4/10, ten-step tolerance, device/assistance, goal not met, adverse-effect check, and RN notification."
          }
        ],
        feedback: {
          observed: "At 09:55 the patient reports NRS 4/10 and walks ten steps with the ordered device, but the stated goal remains 3/10.",
          meaning: "Pain and function improved, yet the patient goal was not met; both the improvement and residual need matter.",
          action: "Compare with baseline, assess adverse effects and remaining limitations, continue only authorized measures, and follow escalation parameters.",
          notify: "Notify the RN when residual pain remains above the goal or ordered threshold, especially if repeated or function-limiting.",
          document: "Record 09:55, NRS 4/10, ten-step tolerance, device/assistance, goal not met, adverse-effect check, and RN notification.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Pain and function improved, yet the patient goal was not met; both the improvement and residual need matter.",
        action: "Compare with baseline, assess adverse effects and remaining limitations, continue only authorized measures, and follow escalation parameters.",
        notify: "Notify the RN when residual pain remains above the goal or ordered threshold, especially if repeated or function-limiting.",
        document: "Record 09:55, NRS 4/10, ten-step tolerance, device/assistance, goal not met, adverse-effect check, and RN notification."
      }
    ]
  },
  {
    id: 5,
    shortName: "Escalate",
    title: "Escalate Uncontrolled, New, or Changing Pain",
    subtitle: "Recognize urgency · notify the RN · follow directions",
    narration: [
      "Escalate pain that is new, severe, changing in location or character, above ordered parameters or the patient’s goal, associated with concerning symptoms, or not responding to ordered interventions. Use emergency services for an emergency; do not delay urgent care while waiting for a routine callback.",
      "Give the supervising RN a concise report: scale and score, location and OPQRSTUV change, onset and time, associated findings, functional effect, interventions and times, response, and the specific concern. Read back and follow authorized instructions.",
      "The LVN does not diagnose the cause or independently start, stop, hold, increase, decrease, or substitute medication. Document notification attempts, actual contact, time, instructions, read-back, patient response, and any emergency action."
    ],
    keyPoints: [
      {
        icon: "🚨",
        title: "Recognize Urgent Patterns",
        detail: "Sudden severe pain or concerning associated symptoms may require emergency action"
      },
      {
        icon: "📞",
        title: "Give a Complete RN Report",
        detail: "Include scale, score, OPQRSTUV change, function, interventions, times, and response"
      },
      {
        icon: "🎯",
        title: "Escalate a Missed Goal",
        detail: "Report uncontrolled pain or repeated scores above the patient goal or ordered parameter"
      },
      {
        icon: "🛑",
        title: "Do Not Change Medication Independently",
        detail: "Follow authorized orders and RN direction within LVN scope"
      }
    ],
    clinicalTip: "State urgency first, then score, change, function, interventions, response, and exact times.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "h50",
        label: "RN Escalation Call",
        shortLabel: "Call RN",
        ariaLabel: "Investigate RN Escalation Call",
        x: 47,
        y: 69,
        zone: "authorized",
        leftAnchorId: "kp-5-0",
        observe: "The LVN calls the supervising RN with a blank note tablet ready to capture time, report, and direction.",
        identifyChoices: [
          {
            id: "h50-identify-correct",
            label: "Timely two-way communication allows the RN to evaluate change and coordinate any authorized order or higher level of care.",
            correct: true,
            rationale: "Timely two-way communication allows the RN to evaluate change and coordinate any authorized order or higher level of care."
          },
          {
            id: "h50-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Timely two-way communication allows the RN to evaluate change and coordinate any authorized order or higher level of care."
          }
        ],
        decideChoices: [
          {
            id: "h50-decide-correct",
            label: "Lead with urgency, then report scale/score, OPQRSTUV change, function, interventions, response, and times; read back directions.",
            correct: true,
            rationale: "Lead with urgency, then report scale/score, OPQRSTUV change, function, interventions, response, and times; read back directions."
          },
          {
            id: "h50-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Lead with urgency, then report scale/score, OPQRSTUV change, function, interventions, response, and times; read back directions."
          }
        ],
        documentChoices: [
          {
            id: "h50-document-correct",
            label: "Record call time, RN name, exact report, instructions, read-back, actions taken, and patient response.",
            correct: true,
            rationale: "Record call time, RN name, exact report, instructions, read-back, actions taken, and patient response."
          },
          {
            id: "h50-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record call time, RN name, exact report, instructions, read-back, actions taken, and patient response."
          }
        ],
        feedback: {
          observed: "The LVN calls the supervising RN with a blank note tablet ready to capture time, report, and direction.",
          meaning: "Timely two-way communication allows the RN to evaluate change and coordinate any authorized order or higher level of care.",
          action: "Lead with urgency, then report scale/score, OPQRSTUV change, function, interventions, response, and times; read back directions.",
          notify: "Notify the supervising RN at once for urgent change and activate emergency services for emergency symptoms according to policy.",
          document: "Record call time, RN name, exact report, instructions, read-back, actions taken, and patient response.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Timely two-way communication allows the RN to evaluate change and coordinate any authorized order or higher level of care.",
        action: "Lead with urgency, then report scale/score, OPQRSTUV change, function, interventions, response, and times; read back directions.",
        notify: "Notify the supervising RN at once for urgent change and activate emergency services for emergency symptoms according to policy.",
        document: "Record call time, RN name, exact report, instructions, read-back, actions taken, and patient response."
      },
      {
        id: "h51",
        label: "Escalation Reason",
        shortLabel: "Reason & Goal",
        ariaLabel: "Investigate Escalation Reason",
        x: 35,
        y: 48,
        zone: "authorized",
        leftAnchorId: "kp-5-1",
        observe: "The body map and goal cue show pain moved from the right knee to the hip and remains 7/10 against a goal of 3/10.",
        identifyChoices: [
          {
            id: "h51-identify-correct",
            label: "A new location plus persistent pain above goal is a clinically meaningful change even without a new diagnosis.",
            correct: true,
            rationale: "A new location plus persistent pain above goal is a clinically meaningful change even without a new diagnosis."
          },
          {
            id: "h51-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. A new location plus persistent pain above goal is a clinically meaningful change even without a new diagnosis."
          }
        ],
        decideChoices: [
          {
            id: "h51-decide-correct",
            label: "Reassess the changed location, associated findings, function, and response, then report the change to the supervising RN.",
            correct: true,
            rationale: "Reassess the changed location, associated findings, function, and response, then report the change to the supervising RN."
          },
          {
            id: "h51-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Reassess the changed location, associated findings, function, and response, then report the change to the supervising RN."
          }
        ],
        documentChoices: [
          {
            id: "h51-document-correct",
            label: "Record prior versus current location, NRS 7/10, goal 3/10, onset, function, interventions, response, and notification time.",
            correct: true,
            rationale: "Record prior versus current location, NRS 7/10, goal 3/10, onset, function, interventions, response, and notification time."
          },
          {
            id: "h51-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record prior versus current location, NRS 7/10, goal 3/10, onset, function, interventions, response, and notification time."
          }
        ],
        feedback: {
          observed: "The body map and goal cue show pain moved from the right knee to the hip and remains 7/10 against a goal of 3/10.",
          meaning: "A new location plus persistent pain above goal is a clinically meaningful change even without a new diagnosis.",
          action: "Reassess the changed location, associated findings, function, and response, then report the change to the supervising RN.",
          notify: "Notify the RN during the visit; use urgent or emergency escalation if associated findings indicate immediate risk.",
          document: "Record prior versus current location, NRS 7/10, goal 3/10, onset, function, interventions, response, and notification time.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "A new location plus persistent pain above goal is a clinically meaningful change even without a new diagnosis.",
        action: "Reassess the changed location, associated findings, function, and response, then report the change to the supervising RN.",
        notify: "Notify the RN during the visit; use urgent or emergency escalation if associated findings indicate immediate risk.",
        document: "Record prior versus current location, NRS 7/10, goal 3/10, onset, function, interventions, response, and notification time."
      },
      {
        id: "h52",
        label: "Changed Pain Pattern",
        shortLabel: "Pattern Change",
        ariaLabel: "Investigate Changed Pain Pattern",
        x: 52,
        y: 63,
        zone: "authorized",
        leftAnchorId: "kp-5-2",
        observe: "The patient now holds the upper abdomen and reports sudden pressure unlike the chronic knee pain documented previously.",
        identifyChoices: [
          {
            id: "h52-identify-correct",
            label: "Sudden pain in a new site with a different quality may be urgent and must not be dismissed as the known chronic condition.",
            correct: true,
            rationale: "Sudden pain in a new site with a different quality may be urgent and must not be dismissed as the known chronic condition."
          },
          {
            id: "h52-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Sudden pain in a new site with a different quality may be urgent and must not be dismissed as the known chronic condition."
          }
        ],
        decideChoices: [
          {
            id: "h52-decide-correct",
            label: "Stop routine care, assess immediate safety and associated symptoms, and follow urgent or emergency escalation policy without diagnosing.",
            correct: true,
            rationale: "Stop routine care, assess immediate safety and associated symptoms, and follow urgent or emergency escalation policy without diagnosing."
          },
          {
            id: "h52-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Stop routine care, assess immediate safety and associated symptoms, and follow urgent or emergency escalation policy without diagnosing."
          }
        ],
        documentChoices: [
          {
            id: "h52-document-correct",
            label: "Record exact onset/time, patient quote, site, quality, score/scale, vital and associated findings, contacts, times, and actions.",
            correct: true,
            rationale: "Record exact onset/time, patient quote, site, quality, score/scale, vital and associated findings, contacts, times, and actions."
          },
          {
            id: "h52-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record exact onset/time, patient quote, site, quality, score/scale, vital and associated findings, contacts, times, and actions."
          }
        ],
        feedback: {
          observed: "The patient now holds the upper abdomen and reports sudden pressure unlike the chronic knee pain documented previously.",
          meaning: "Sudden pain in a new site with a different quality may be urgent and must not be dismissed as the known chronic condition.",
          action: "Stop routine care, assess immediate safety and associated symptoms, and follow urgent or emergency escalation policy without diagnosing.",
          notify: "Contact emergency services for emergency features and notify the supervising RN as soon as safely possible; otherwise obtain prompt RN direction.",
          document: "Record exact onset/time, patient quote, site, quality, score/scale, vital and associated findings, contacts, times, and actions.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Sudden pain in a new site with a different quality may be urgent and must not be dismissed as the known chronic condition.",
        action: "Stop routine care, assess immediate safety and associated symptoms, and follow urgent or emergency escalation policy without diagnosing.",
        notify: "Contact emergency services for emergency features and notify the supervising RN as soon as safely possible; otherwise obtain prompt RN direction.",
        document: "Record exact onset/time, patient quote, site, quality, score/scale, vital and associated findings, contacts, times, and actions."
      }
    ]
  },
  {
    id: 6,
    shortName: "Practice",
    title: "Complete Pain Documentation",
    subtitle: "Make the full clinical cycle visible",
    narration: [
      "A complete pain note makes the care cycle traceable: validated scale and before score; rest/activity context; exact location and OPQRSTUV characteristics; pain goal and functional impact; ordered medication details when administered; nonpharmacologic measure; times; after score; functional response; education; and escalation.",
      "Use patient-specific, objective language. Avoid “pain managed,” “tolerated well,” or “RN aware” without the supporting score, function, times, contact details, instructions, and response. Document only care actually performed and directions actually received.",
      "Completion of this knowledge activity does not establish independent clinical competency. The LVN follows CL-SD-014 and current orders; observed demonstration and authorized competency sign-off remain separate requirements."
    ],
    keyPoints: [
      {
        icon: "📋",
        title: "Integrate the Full Assessment",
        detail: "Record the named scale, OPQRSTUV, goal, function, ordered and nonpharmacologic care, and patient response"
      },
      {
        icon: "📋",
        title: "Follow CL-SD-014",
        detail: "Use agency policy CL-SD-014 for assessment, intervention, reassessment, escalation, and documentation"
      },
      {
        icon: "📋",
        title: "Escalate New or Uncontrolled Pain",
        detail: "Escalate uncontrolled/new/changing pain to RN—do not rewrite orders yourself"
      },
      {
        icon: "📋",
        title: "Knowledge Is Not Competency",
        detail: "Quiz pass = knowledge only; observed competency sign-off is separate"
      }
    ],
    clinicalTip: "Before signing, verify that a reviewer can see what changed, what you did, when you rechecked, and what happened next.",
    sourceLabels: [
      {
        kind: "Agency Policy",
        text: "CL-SD-014"
      }
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "h60",
        label: "Complete Note",
        shortLabel: "Complete Note",
        ariaLabel: "Investigate Complete Note",
        x: 70,
        y: 40,
        zone: "authorized",
        leftAnchorId: "kp-6-0",
        observe: "A de-identified note contains fields for assessment, intervention, reassessment, function, education, and notification.",
        identifyChoices: [
          {
            id: "h60-identify-correct",
            label: "Structured fields support completeness only when entries are specific, timed, and consistent with care actually provided.",
            correct: true,
            rationale: "Structured fields support completeness only when entries are specific, timed, and consistent with care actually provided."
          },
          {
            id: "h60-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Structured fields support completeness only when entries are specific, timed, and consistent with care actually provided."
          }
        ],
        decideChoices: [
          {
            id: "h60-decide-correct",
            label: "Reconcile every field with the visit facts and current order before authenticating the note.",
            correct: true,
            rationale: "Reconcile every field with the visit facts and current order before authenticating the note."
          },
          {
            id: "h60-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Reconcile every field with the visit facts and current order before authenticating the note."
          }
        ],
        documentChoices: [
          {
            id: "h60-document-correct",
            label: "Include scale, before/after scores and times, OPQRSTUV, goal, function, intervention details, response, education, and communication.",
            correct: true,
            rationale: "Include scale, before/after scores and times, OPQRSTUV, goal, function, intervention details, response, education, and communication."
          },
          {
            id: "h60-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Include scale, before/after scores and times, OPQRSTUV, goal, function, intervention details, response, education, and communication."
          }
        ],
        feedback: {
          observed: "A de-identified note contains fields for assessment, intervention, reassessment, function, education, and notification.",
          meaning: "Structured fields support completeness only when entries are specific, timed, and consistent with care actually provided.",
          action: "Reconcile every field with the visit facts and current order before authenticating the note.",
          notify: "Resolve a missing order, unresolved escalation, or contradictory entry with the RN before finalizing when safety or accuracy is affected.",
          document: "Include scale, before/after scores and times, OPQRSTUV, goal, function, intervention details, response, education, and communication.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Structured fields support completeness only when entries are specific, timed, and consistent with care actually provided.",
        action: "Reconcile every field with the visit facts and current order before authenticating the note.",
        notify: "Resolve a missing order, unresolved escalation, or contradictory entry with the RN before finalizing when safety or accuracy is affected.",
        document: "Include scale, before/after scores and times, OPQRSTUV, goal, function, intervention details, response, education, and communication."
      },
      {
        id: "h61",
        label: "Evidence Cluster",
        shortLabel: "Required Evidence",
        ariaLabel: "Investigate Evidence Cluster",
        x: 42,
        y: 76,
        zone: "authorized",
        leftAnchorId: "kp-6-1",
        observe: "The evidence cluster links a body map, named scale, protected cold pack, clock, function cue, and RN phone call.",
        identifyChoices: [
          {
            id: "h61-identify-correct",
            label: "Each cue represents evidence needed to reconstruct the patient-specific pain-management cycle.",
            correct: true,
            rationale: "Each cue represents evidence needed to reconstruct the patient-specific pain-management cycle."
          },
          {
            id: "h61-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Each cue represents evidence needed to reconstruct the patient-specific pain-management cycle."
          }
        ],
        decideChoices: [
          {
            id: "h61-decide-correct",
            label: "Check that location, scale/context, intervention, both times, functional response, and communication agree across the note.",
            correct: true,
            rationale: "Check that location, scale/context, intervention, both times, functional response, and communication agree across the note."
          },
          {
            id: "h61-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Check that location, scale/context, intervention, both times, functional response, and communication agree across the note."
          }
        ],
        documentChoices: [
          {
            id: "h61-document-correct",
            label: "Record each element accurately and cross-reference the patient response rather than using conflicting generic text.",
            correct: true,
            rationale: "Record each element accurately and cross-reference the patient response rather than using conflicting generic text."
          },
          {
            id: "h61-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Record each element accurately and cross-reference the patient response rather than using conflicting generic text."
          }
        ],
        feedback: {
          observed: "The evidence cluster links a body map, named scale, protected cold pack, clock, function cue, and RN phone call.",
          meaning: "Each cue represents evidence needed to reconstruct the patient-specific pain-management cycle.",
          action: "Check that location, scale/context, intervention, both times, functional response, and communication agree across the note.",
          notify: "Contact the RN when review reveals an unreported change, missed goal, adverse response, or incomplete direction.",
          document: "Record each element accurately and cross-reference the patient response rather than using conflicting generic text.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Each cue represents evidence needed to reconstruct the patient-specific pain-management cycle.",
        action: "Check that location, scale/context, intervention, both times, functional response, and communication agree across the note.",
        notify: "Contact the RN when review reveals an unreported change, missed goal, adverse response, or incomplete direction.",
        document: "Record each element accurately and cross-reference the patient response rather than using conflicting generic text."
      },
      {
        id: "h62",
        label: "Final Scope Review",
        shortLabel: "Scope Review",
        ariaLabel: "Investigate Final Scope Review",
        x: 29,
        y: 55,
        zone: "authorized",
        leftAnchorId: "kp-6-2",
        observe: "The patient appears more relaxed while the LVN performs a final review of the note and current orders.",
        identifyChoices: [
          {
            id: "h62-identify-correct",
            label: "Final review confirms documentation completeness and scope; appearance alone does not prove the pain goal was met.",
            correct: true,
            rationale: "Final review confirms documentation completeness and scope; appearance alone does not prove the pain goal was met."
          },
          {
            id: "h62-identify-review",
            label: "The visible cue alone authorizes an independent diagnosis or medication change.",
            correct: false,
            rationale: "No. Final review confirms documentation completeness and scope; appearance alone does not prove the pain goal was met."
          }
        ],
        decideChoices: [
          {
            id: "h62-decide-correct",
            label: "Verify paired scores, function, goal status, order consistency, escalation closure, and patient teaching before signing.",
            correct: true,
            rationale: "Verify paired scores, function, goal status, order consistency, escalation closure, and patient teaching before signing."
          },
          {
            id: "h62-decide-review",
            label: "Change medication or the plan of care independently instead of using the RN pathway.",
            correct: false,
            rationale: "That exceeds LVN authority. Verify paired scores, function, goal status, order consistency, escalation closure, and patient teaching before signing."
          }
        ],
        documentChoices: [
          {
            id: "h62-document-correct",
            label: "Authenticate the accurate note with actual times and include unresolved needs, RN direction, patient understanding, and follow-up.",
            correct: true,
            rationale: "Authenticate the accurate note with actual times and include unresolved needs, RN direction, patient understanding, and follow-up."
          },
          {
            id: "h62-document-review",
            label: "Use a generic phrase without the patient-specific finding, action, time, response, or notification.",
            correct: false,
            rationale: "That is incomplete. Authenticate the accurate note with actual times and include unresolved needs, RN direction, patient understanding, and follow-up."
          }
        ],
        feedback: {
          observed: "The patient appears more relaxed while the LVN performs a final review of the note and current orders.",
          meaning: "Final review confirms documentation completeness and scope; appearance alone does not prove the pain goal was met.",
          action: "Verify paired scores, function, goal status, order consistency, escalation closure, and patient teaching before signing.",
          notify: "Notify the RN of unresolved pain, unclear instructions, or a change that still lacks an authorized follow-up plan.",
          document: "Authenticate the accurate note with actual times and include unresolved needs, RN direction, patient understanding, and follow-up.",
          policyRefs: [
            "CL-SD-014"
          ]
        },
        meaning: "Final review confirms documentation completeness and scope; appearance alone does not prove the pain goal was met.",
        action: "Verify paired scores, function, goal status, order consistency, escalation closure, and patient teaching before signing.",
        notify: "Notify the RN of unresolved pain, unclear instructions, or a change that still lacks an authorized follow-up plan.",
        document: "Authenticate the accurate note with actual times and include unresolved needs, RN direction, patient understanding, and follow-up."
      }
    ]
  }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'At Care Indeed, per CL-SD-014, pain is treated as which of the following at every visit?',
    options: [
      'The fifth vital sign—assessed and documented each encounter',
      'An optional field only when the patient complains first',
      'A physician-only assessment the LVN must never document',
      'A one-time start-of-care item that is never repeated'
    ],
    correct: 0,
    rationale: 'Agency policy CL-SD-014 treats pain as the fifth vital sign—assessed and documented at every visit. The LVN documents scores; POC changes still go through RN/physician pathways.',
  },
  {
    id: 2,
    stem: 'During OPQRSTUV assessment, a patient says, “I’d be okay functioning if my pain stayed at 3.” Which element did you just capture?',
    options: [
      'Onset only—when the pain first started',
      'Values/Goals—the patient’s acceptable pain level benchmark',
      'Quality only—the word description of the pain',
      'Region only—the anatomic location of the pain'
    ],
    correct: 1,
    rationale: 'V = Values/Goals. The patient’s stated acceptable level is your effectiveness benchmark and a key trigger for escalating to the RN when not met.',
  },
  {
    id: 3,
    stem: 'A patient with diabetes describes foot pain as “burning and electric, worse at night.” Which classification best fits these descriptors for reporting purposes?',
    options: [
      'Purely somatic nociceptive pain from joint movement only',
      'Visceral nociceptive pain from an abdominal organ only',
      'Neuropathic features suggesting nerve-related pain',
      'Non-pain sensation that should be ignored in the note'
    ],
    correct: 2,
    rationale: 'Burning, shooting, and electric descriptors are characteristic of neuropathic features. Document and report; do not independently start adjuvant medications.',
  },
  {
    id: 4,
    stem: 'You plan cold therapy for acute swelling after checking sensation and vascular status. Which application approach best matches standard clinical guidance used with agency policy?',
    options: [
      'Ice directly on bare skin for 60 continuous minutes',
      'Heat pack first for 45 minutes, then ice with no barrier',
      'Cold for 5 minutes only, regardless of response',
      'Cold pack with cloth barrier for about 15–20 minutes (per guidance/policy)'
    ],
    correct: 3,
    rationale: 'Typical guidance is cold with a cloth barrier for about 15–20 minutes. Avoid direct skin contact and follow agency policy/contraindications (e.g., impaired sensation, PVD).',
  },
  {
    id: 5,
    stem: 'You administer an ordered oral PRN analgesic. What is the best next action regarding effectiveness?',
    options: [
      'Reassess pain within the agency/clinical reassessment window (often ~30–60 minutes for many oral agents) and document the post score',
      'Assume it worked and skip reassessment until the next calendar week',
      'Change the dose yourself if the patient still has pain in 10 minutes',
      'Document only the pre-score; post-scores are optional for surveyors'
    ],
    correct: 0,
    rationale: 'Paired pre/post scores are essential. Reassessment timing follows agency policy and clinical context (commonly ~30–60 minutes for many oral PRNs). LVNs do not independently change doses.',
  },
  {
    id: 6,
    stem: 'A cognitively intact adult rates pain 8/10. Your objective exam shows calm behavior. What is the gold-standard basis for your documented pain intensity?',
    options: [
      'Family opinion overrides the patient',
      'Patient self-report—document the 8/10 and your objective observations separately if needed',
      'Always average the nurse’s guess with the patient’s number',
      'Leave intensity blank because behavior looks comfortable'
    ],
    correct: 1,
    rationale: 'Patient self-report is the gold standard for patients who can report. You may document objective findings, but you do not replace the patient’s report with a judgment that pain is not real.',
  },
  {
    id: 7,
    stem: 'Which visit-note pattern is deficient for pain management documentation?',
    options: [
      'NRS with rest and activity scores plus OPQRSTUV elements',
      'Pre-score, ordered PRN given, non-pharm used, post-score, goal comparison',
      'Pain 7/10 and “PRN given” with no post-intervention reassessment score',
      'Patient goal of 3/10 documented with education on when to call the agency'
    ],
    correct: 2,
    rationale: 'Identifying pain and giving a PRN without documenting reassessment shows no evidence of effectiveness—this is a common documentation deficiency.',
  },
  {
    id: 8,
    stem: 'The physician orders gabapentin for burning neuropathic pain. How should the LVN correctly understand this medication’s role?',
    options: [
      'It is a non-pharmacological intervention the LVN invented',
      'It replaces the need to ever reassess pain again',
      'It is an over-the-counter remedy the LVN may start without orders',
      'It is an adjuvant medication used for neuropathic pain—as ordered only; LVN does not independently add it'
    ],
    correct: 3,
    rationale: 'Gabapentin is an adjuvant often used for neuropathic pain. The LVN administers only as ordered and reports response; the LVN does not independently initiate or change the regimen.',
  },
  {
    id: 9,
    stem: 'Despite ordered meds and non-pharm measures, a patient’s pain remains 7/10 for several visits against a stated goal of 3/10. What should the LVN do?',
    options: [
      'Wait until the score is 10/10 before telling anyone',
      'Escalate/notify the supervising RN for POC review—do not independently change medication orders',
      'Silently double the opioid dose to meet the goal faster',
      'Discharge the patient from service for noncompliance'
    ],
    correct: 1,
    rationale: 'Escalate when pain consistently exceeds the patient’s goal despite POC adherence. Order changes require authorized clinician/physician pathways via RN coordination—not independent LVN changes.',
  },
  {
    id: 10,
    stem: 'You coach a patient through slow breathing before a dressing change. Which count pattern matches the module’s guided technique?',
    options: [
      '2-count inhale, no hold, immediate forced exhale only',
      '10-10-10 breath-holding until dizzy',
      '4-count inhale, 4-count hold, 4-count exhale',
      'Skip breathing if any pain is present'
    ],
    correct: 2,
    rationale: 'The module teaches a 4-4-4 breathing pattern to support parasympathetic activation and reduce perceived procedural pain, used with—not instead of—ordered interventions.',
  }
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:rgba(255,255,255,.96);padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:nowrap;letter-spacing:.02em;max-width:140px;line-height:1.2}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:900px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:10px;max-width:92px;white-space:normal;text-align:center;line-height:1.15}
}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:11px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}
}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.95);border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.96);border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.96);border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(560px,100%);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
@media (max-width:420px){.lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{body}</div>
    </div>
  );
}

function ClinicalFeedbackOverlay({ hotspot, onClose, onComplete, triggerRef }: {
  hotspot: Hotspot; onClose: () => void; onComplete: () => void; triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const feedbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<ScenarioStage>('observe');
  const [selectedIdentifyId, setSelectedIdentifyId] = useState<string | null>(null);
  const [selectedDecideId, setSelectedDecideId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [identifyLocked, setIdentifyLocked] = useState(false);
  const [decideLocked, setDecideLocked] = useState(false);
  const [documentLocked, setDocumentLocked] = useState(false);
  const [rationale, setRationale] = useState<string | null>(null);

  const zoneColor = hotspot.zone === 'authorized' ? CI.teal : hotspot.zone === 'conditional' ? CI.orange : hotspot.zone === 'prohibited' ? CI.red : CI.slate;
  const restoreTriggerFocus = useCallback(() => window.requestAnimationFrame(() => triggerRef.current?.focus()), [triggerRef]);
  const closeAndRestore = useCallback(() => { onClose(); restoreTriggerFocus(); }, [onClose, restoreTriggerFocus]);

  useEffect(() => {
    closeRef.current?.focus();
  }, [hotspot.id]);

  useEffect(() => {
    if (stage === 'identify' || stage === 'decide' || stage === 'document') {
      dialogRef.current?.querySelector<HTMLElement>('[role="radio"]')?.focus();
    } else if (stage === 'feedback') {
      feedbackHeadingRef.current?.focus();
    }
  }, [stage]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.lvn002-shell');
    const scrollNodes = Array.from(document.querySelectorAll<HTMLElement>('.lvn002-work,.lvn002-left,.lvn002-quiz-page'));
    const prior = scrollNodes.map((node) => ({ node, overflow: node.style.overflow, touchAction: node.style.touchAction }));
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    if (shell) { shell.inert = true; shell.setAttribute('aria-hidden', 'true'); }
    for (const { node } of prior) { node.style.overflow = 'hidden'; node.style.touchAction = 'none'; }
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const blockBackgroundScroll = (event: Event) => {
      if (!dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    const blockBackgroundKeys = (event: KeyboardEvent) => {
      if (['PageUp', 'PageDown', 'Home', 'End', ' ', 'ArrowUp', 'ArrowDown'].includes(event.key) && !dialogRef.current?.contains(event.target as Node)) event.preventDefault();
    };
    document.addEventListener('wheel', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('touchmove', blockBackgroundScroll, { passive: false, capture: true });
    document.addEventListener('keydown', blockBackgroundKeys, true);
    return () => {
      if (shell) { shell.inert = false; shell.removeAttribute('aria-hidden'); }
      for (const item of prior) { item.node.style.overflow = item.overflow; item.node.style.touchAction = item.touchAction; }
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      document.removeEventListener('wheel', blockBackgroundScroll, true);
      document.removeEventListener('touchmove', blockBackgroundScroll, true);
      document.removeEventListener('keydown', blockBackgroundKeys, true);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeAndRestore(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [closeAndRestore, stage]);

  const pick = (choice: ScenarioChoice, setSelected: (id: string) => void, setLocked: (value: boolean) => void, locked: boolean, next: ScenarioStage) => {
    if (locked) return;
    setSelected(choice.id); setRationale(choice.rationale);
    if (choice.correct) {
      setLocked(true);
      window.setTimeout(() => { setRationale(null); setStage(next); }, 650);
    }
  };

  const renderChoices = (choices: ScenarioChoice[], selectedId: string | null, locked: boolean, onPick: (choice: ScenarioChoice) => void) => {
    const activeIndex = Math.max(0, choices.findIndex((choice) => choice.id === selectedId));
    const moveFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + choices.length) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else if (event.key === ' ') { event.preventDefault(); onPick(choices[index]); return; }
      else return;
      event.preventDefault();
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
    };
    return (
      <div role="radiogroup" aria-label={`${stage} choices`} style={{ display: 'grid', gap: 8 }}>
        {choices.map((choice, index) => {
          const selected = selectedId === choice.id;
          const wrong = selected && !choice.correct;
          const right = selected && choice.correct;
          return (
            <button key={choice.id} type="button" role="radio" aria-checked={selected} tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onPick(choice)} onKeyDown={(event) => moveFocus(event, index)} disabled={locked && !selected}
              style={{ textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer', border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`, background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1 }}>
              {choice.label}
            </button>
          );
        })}
        {rationale && <div role="status" aria-live="polite" style={{ fontSize: 14, lineHeight: 1.5, color: CI.muted, padding: '8px 10px', borderRadius: 8, background: CI.bg }}>{rationale}</div>}
      </div>
    );
  };

  const feedback = hotspot.feedback;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lvn-scenario-title" ref={dialogRef} className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>{stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}</div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2></div>
          <button ref={closeRef} type="button" aria-label="Close scenario" onClick={closeAndRestore} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          {stage === 'observe' && <><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p><button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.teal, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Continue to Identify</button></>}
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the LVN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
        </div>
      </div>
    </div>, document.body,
  );
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const more = page.narration.length > 1;
  return (
    <div>
      <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 14 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 16px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>
      <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.65, color: '#524C4B' }}>{page.narration[0]}</p>
      {more && (
        <details style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 16 }}>
          <summary style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>View Full Lesson Details</summary>
          <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
            {page.narration.slice(1).map((p, i) => <p key={i} style={{ margin: '0 0 10px', fontSize: 16, lineHeight: 1.65, color: '#524C4B' }}>{p}</p>)}
          </div>
        </details>
      )}
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted, marginBottom: 10 }}>Key Clinical Actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, index) => (
          <div id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18 }} aria-hidden>{kp.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>{kp.title}</div>
              <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.45 }}>{kp.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 14, borderRadius: 12, background: '#FAFBF8', border: `1px solid ${CI.border}`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Clinical Tip</div>
        <div style={{ fontSize: 15, color: '#524C4B', lineHeight: 1.55 }}>{page.clinicalTip}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {page.sourceLabels.map((s) => (
          <span key={s.kind + s.text} style={{ fontSize: 11, padding: '5px 8px', borderRadius: 6, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.kind}: {s.text}</span>
        ))}
      </div>
    </div>
  );
}

function RightPanel({ page, completed, setCompleted, onGoQuiz }: {
  page: PageData; completed: string[]; setCompleted: (ids: string[]) => void; onGoQuiz?: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const active = page.hotspots.find((h) => h.id === activeId) ?? null;
  const done = page.hotspots.length > 0 && completed.length === page.hotspots.length;
  useEffect(() => { setActiveId(null); }, [page.id]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      page.hotspots.forEach((hotspot) => {
        if (!hotspot.leftAnchorId || !document.getElementById(hotspot.leftAnchorId)) {
          throw new Error(`[${MODULE_META.id}] Missing left anchor: ${hotspot.leftAnchorId ?? '(unset)'}`);
        }
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [page]);
  return (
    <div className="lvn002-stage-wrap">
      <div className="lvn002-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={SCENE_ALT[page.id]} draggable={false} />
        <div className="lvn002-scene-title" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hs) => {
          const isDone = completed.includes(hs.id);
          const color = ZONE[hs.zone].color;
          const nextIncomplete = page.hotspots.find((h) => !completed.includes(h.id));
          const isGuided = !isDone && nextIncomplete?.id === hs.id;
          return (
            <button key={hs.id} type="button" className={`lvn002-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={`lvn002-progress-${page.id}`}
              onClick={(e) => { triggerRef.current = e.currentTarget; setActiveId(hs.id); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  triggerRef.current = e.currentTarget;
                  setActiveId(hs.id);
                }
              }}>
              <div className="orb" style={{ background: isDone ? CI.teal : (hs.zone === 'neutral' ? CI.orange : color) }}>
                {isGuided && !isDone && <span className="ping" aria-hidden />}
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 15 }} aria-hidden>?</span>}
              </div>
              <span className="tag">{hs.shortLabel}</span>
              {isDone && <span className="lvn002-sr-only">Completed</span>}
            </button>
          );
        })}
        <div id={`lvn002-progress-${page.id}`} className="lvn002-live" aria-live="polite">
          {completed.length} of {page.hotspots.length} nodes observed
        </div>
        <button type="button" aria-label="Reset lesson progress" onClick={() => setCompleted([])}
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: 'rgba(255,255,255,.94)', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'lvn002-pop .3s cubic-bezier(.16,1,.3,1)' }} className="lvn002-rm-transition">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario Practice Complete. Knowledge practice only — Practical Competency Remains Separate.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
              )}
            </div>
          </div>
        )}
        {active && (
          <ClinicalFeedbackOverlay hotspot={active} onClose={() => setActiveId(null)}
            onComplete={() => { if (!completed.includes(active.id)) setCompleted([...completed, active.id]); setActiveId(null); }}
            triggerRef={triggerRef} />
        )}
      </div>
    </div>
  );
}

/** Dedicated single-panel Knowledge Check — progressive field cards + scope compass result */
function QuizPage({
  onBack,
  initialAnswers,
  initialIdx,
  initialFinished,
  initialSelected,
  initialSubmitted,
  onPersist,
}: {
  onBack: () => void;
  initialAnswers?: (number | null)[];
  initialIdx?: number;
  initialFinished?: boolean;
  initialSelected?: number | null;
  initialSubmitted?: boolean;
  onPersist: (state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => void;
}) {
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const [selected, setSelected] = useState<number | null>(() => {
    if (initialSelected !== undefined) return initialSelected;
    if (initialAnswers && initialAnswers[initialIdx ?? 0] != null) return initialAnswers[initialIdx ?? 0];
    return null;
  });
  const [submitted, setSubmitted] = useState<boolean>(() => {
    if (initialSubmitted !== undefined) return !!initialSubmitted;
    return !!(initialAnswers && initialAnswers[initialIdx ?? 0] != null);
  });
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => initialAnswers ?? Array(QUIZ.length).fill(null),
  );
  const [finished, setFinished] = useState(!!initialFinished);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const q = QUIZ[idx];
  const isCorrect = selected === q.correct;
  const score = useMemo(
    () => answers.reduce<number>((n, a, i) => n + (a === QUIZ[i].correct ? 1 : 0), 0),
    [answers],
  );
  const pct = Math.round((score / QUIZ.length) * 100);
  const passed = pct >= MODULE_META.passing;
  const progress = ((idx + (submitted ? 1 : 0)) / QUIZ.length) * 100;
  const letters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    onPersist({ answers, idx, finished, selected, submitted });
    // intentionally omit onPersist identity to avoid re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, idx, finished, selected, submitted]);

  const focusOption = (i: number) => {
    setSelected(i);
    window.requestAnimationFrame(() => optionRefs.current[i]?.focus());
  };

  const submit = () => {
    if (selected === null) return;
    if (!submitted) {
      const next = [...answers];
      next[idx] = selected;
      setAnswers(next);
      setSubmitted(true);
      return;
    }
    if (idx >= QUIZ.length - 1) {
      setFinished(true);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelected(answers[nextIdx] != null ? answers[nextIdx] : null);
    setSubmitted(answers[nextIdx] != null);
  };

  if (finished) {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (pct / 100) * circumference;
    return (
      <div className="lvn002-quiz-page">
        <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="lvn002-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Knowledge Check Complete' : 'Keep sharpening judgment'}</div>
          <div style={{ fontSize: 14, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            Scenario Practice Complete. Practical Competency Remains Separate.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Authorized', color: CI.teal, tip: 'Order + competency + expected' },
              { label: 'Conditional', color: CI.orange, tip: 'RN oversight required' },
              { label: 'Prohibited', color: CI.red, tip: 'Hard stop · escalate' },
            ].map((z) => (
              <div key={z.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 11, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lvn002-quiz-page">
      <div className="lvn002-quiz-card" style={{ background: '#fff', borderRadius: 24, border: `1px solid ${CI.border}`, boxShadow: '0 24px 60px rgba(15,91,84,.12)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', background: `linear-gradient(135deg, ${CI.teal} 0%, #0a3d39 100%)`, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Compass size={18} />
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="lvn002-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 20, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h2>

          <div role="radiogroup" aria-label="Answer choices" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            onKeyDown={(e) => {
              if (submitted) return;
              const max = q.options.length - 1;
              const cur = selected ?? 0;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusOption(Math.min(max, cur + 1)); }
              else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusOption(Math.max(0, cur - 1)); }
              else if (e.key === 'Home') { e.preventDefault(); focusOption(0); }
              else if (e.key === 'End') { e.preventDefault(); focusOption(max); }
              else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); if (selected !== null) submit(); }
            }}>
            {q.options.map((opt, i) => {
              const on = selected === i;
              let border: string = CI.border;
              let bg: string = '#fff';
              let letterBg: string = CI.bg;
              let letterColor: string = CI.muted;
              if (submitted && i === q.correct) { border = CI.teal; bg = CI.tealSoft; letterBg = CI.teal; letterColor = '#fff'; }
              else if (submitted && on && !isCorrect) { border = CI.red; bg = '#FEF2F2'; letterBg = CI.red; letterColor = '#fff'; }
              else if (on) { border = CI.teal; bg = '#F3FBFA'; letterBg = CI.teal; letterColor = '#fff'; }
              return (
                <button key={i} type="button" role="radio" aria-checked={on}
                  ref={(el) => { optionRefs.current[i] = el; }}
                  tabIndex={on || (selected === null && i === 0) ? 0 : -1}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  style={{ padding: 14, borderRadius: 14, border: `2px solid ${border}`, background: bg, textAlign: 'left', cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'all .15s', minHeight: 48 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{letters[i]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 16, lineHeight: 1.5, paddingTop: 3 }}>{opt}</span>
                  {submitted && i === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && on && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'lvn-009-progress-v5414';

type Persisted = {
  pageIndex: number;
  mode: 'lessons' | 'quiz';
  completedByPage: Record<number, string[]>;
  quizAnswers?: (number | null)[];
  quizIdx?: number;
  quizFinished?: boolean;
  quizSelected?: number | null;
  quizSubmitted?: boolean;
};

function loadProgress(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function saveProgress(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode / quota */
  }
}

/** Static approved Care Indeed mark (non-interactive, non-animated) */
function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/assets/navigation/logo-careindeed-orange.png"
      alt="Care Indeed Home Health Care"
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN009() {
  const initial = loadProgress();
  const [mode, setMode] = useState<'lessons' | 'quiz'>(initial?.mode ?? 'lessons');
  const [pageIndex, setPageIndex] = useState(initial?.pageIndex ?? 0);
  const [completedByPage, setCompletedByPage] = useState<Record<number, string[]>>(initial?.completedByPage ?? {});
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(initial?.quizAnswers ?? Array(QUIZ.length).fill(null));
  const [quizIdx, setQuizIdx] = useState(initial?.quizIdx ?? 0);
  const [quizFinished, setQuizFinished] = useState(!!initial?.quizFinished);
  const [quizSelected, setQuizSelected] = useState<number | null>(initial?.quizSelected ?? null);
  const [quizSubmitted, setQuizSubmitted] = useState(!!initial?.quizSubmitted);
  const page = PAGES[Math.min(pageIndex, PAGES.length - 1)];
  const completed = completedByPage[page.id] ?? [];

  const persistAll = (patch?: Partial<Persisted>) => {
    saveProgress({
      pageIndex,
      mode,
      completedByPage,
      quizAnswers,
      quizIdx,
      quizFinished,
      quizSelected,
      quizSubmitted,
      ...patch,
    });
  };

  useEffect(() => {
    persistAll();
  }, [pageIndex, mode, completedByPage, quizAnswers, quizIdx, quizFinished, quizSelected, quizSubmitted]);

  const handleSaveExit = () => {
    persistAll();
    window.history.back();
  };

  const handleQuizPersist = useCallback((state: { answers: (number | null)[]; idx: number; finished: boolean; selected: number | null; submitted: boolean }) => {
    setQuizAnswers(state.answers);
    setQuizIdx(state.idx);
    setQuizFinished(state.finished);
    setQuizSelected(state.selected);
    setQuizSubmitted(state.submitted);
  }, []);

  return (
    <div className="lvn002 lvn002-shell">
      <style>{STYLES}</style>
      <header className="lvn002-top">
        <div className="lvn002-brand">
          <BrandMark size={32} />
          <span className="brand-text">LVN-009 — Pain</span>
        </div>
        <div className="lvn002-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              className={`lvn002-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              {p.shortName}
            </button>
          ))}
          <button type="button" role="tab" aria-selected={mode === 'quiz'}
            className={`lvn002-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}>
            Knowledge Check
          </button>
        </div>
        <button type="button" className="lvn002-exit" onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      {mode === 'quiz' ? (
        <QuizPage
          onBack={() => setMode('lessons')}
          initialAnswers={quizAnswers}
          initialIdx={quizIdx}
          initialFinished={quizFinished}
          initialSelected={quizSelected}
          initialSubmitted={quizSubmitted}
          onPersist={handleQuizPersist}
        />
      ) : (
        <div className="lvn002-work">
          <aside className="lvn002-left"><LeftPanel page={page} pageIndex={pageIndex} total={PAGES.length} /></aside>
          <section className="lvn002-right">
            <RightPanel page={page} completed={completed}
              setCompleted={(ids) => setCompletedByPage((prev) => ({ ...prev, [page.id]: ids }))}
              onGoQuiz={() => setMode('quiz')} />
          </section>
        </div>
      )}

      <footer className="lvn002-bot">
        <button type="button" className="nav" disabled={mode === 'lessons' && pageIndex === 0}
          onClick={() => {
            if (mode === 'quiz') setMode('lessons');
            else setPageIndex((i) => Math.max(0, i - 1));
          }}>
          <ChevronLeft size={16} /> Prev
        </button>
        <div className="lvn002-footer-status" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
            {mode === 'quiz' ? 'Knowledge Check · 10 items · 80% pass' : `Lesson ${pageIndex + 1} of ${PAGES.length} · ${page.shortName}`}
          </span>
        </div>
        {mode === 'quiz' ? (
          <button type="button" className="next" onClick={() => setMode('lessons')}>Back to Lessons <ChevronRight size={16} /></button>
        ) : pageIndex === PAGES.length - 1 ? (
          <button type="button" className="next" onClick={() => setMode('quiz')}>Knowledge Check <ChevronRight size={16} /></button>
        ) : (
          <button type="button" className="next" onClick={() => setPageIndex((i) => Math.min(PAGES.length - 1, i + 1))}>Next · {PAGES[pageIndex + 1]?.shortName} <ChevronRight size={16} /></button>
        )}
      </footer>
    </div>
  );
}
