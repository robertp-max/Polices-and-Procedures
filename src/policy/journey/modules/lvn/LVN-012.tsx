/**
 * LVN-012 — Skills Check-Off
 * v5.5.0-PASS5 | Observe→Identify→Decide→Document→Feedback
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-012/lesson-01-competency.png';
import img02 from './assets/lvn-012/lesson-02-framework.png';
import img03 from './assets/lvn-012/lesson-03-core-skills.png';
import img04 from './assets/lvn-012/lesson-04-process.png';
import img05 from './assets/lvn-012/lesson-05-critical-steps.png';
import img06 from './assets/lvn-012/lesson-06-remediation.png';
import img07 from './assets/lvn-012/lesson-07-sign-off.png';


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

const MODULE_META = { id: 'LVN-012', title: 'Skills Check-Off', pages: 7, quizCount: 10, passing: 80 };

// LVN-012 Pass 5: PAGES is intentionally static for the shared validator; the interrupted mapper was removed.

const SCENE_ALT: Record<number, string> = {
  0: 'De-identified skills station with vital-sign, dressing, medication, and catheter practice equipment.',
  1: 'Authorized evaluator observing a learner perform a return demonstration in a simulation station.',
  2: 'Skill-specific competency checklist beside ordered clinical supplies and policy binders.',
  3: 'Evaluator scoring an observed skill attempt with a critical-step status indicator.',
  4: 'Medication safety station with identification, hand hygiene, sterile supplies, and seven medication-right verification tokens.',
  5: 'Clinical educator and learner reviewing a supportive remediation plan and practice equipment.',
  6: 'Signed de-identified skills checklist beside an electronic competency tracking display.',
};

const PAGES: PageData[] = [
  {
    "id": 0,
    "shortName": "Skills Station",
    "title": "Competency Validation Is Your License Protection",
    "subtitle": "Why skills check-offs exist — patient, license, and agency protection",
    "narration": [
      "Welcome to Module LVN-012: LVN-Specific Skills Check-offs per the California Practice Act. This module explains Care Indeed’s formal competency validation system—the process that confirms every Licensed Vocational Nurse can safely perform assigned clinical tasks before independent practice is authorized.",
      "Skills check-offs are not optional practice drills. They are required competency validations grounded in federal personnel qualification expectations under 42 CFR § 484.115, California Business and Professions Code § 2859 (LVN scope of practice), and Care Indeed agency policy HR-TD-003 (Training & Competency). Always distinguish these layers: federal requirement, California law, and agency policy.",
      "Competency validation serves three essential purposes. First, it protects patients by confirming clinicians can perform skills in the home health setting—with the equipment, supplies, and environmental conditions of the field—not only in school or a lab. Graduation from a vocational nursing program shows educational requirements were met; it does not alone authorize independent performance of every procedure on the caseload."
    ],
    "keyPoints": [
      {
        "icon": "🛡️",
        "title": "Three protections",
        "detail": "Patients, your LVN license, and agency compliance all depend on documented skills validation."
      },
      {
        "icon": "📜",
        "title": "Layered authority",
        "detail": "Federal CoP personnel expectations + CA B&P § 2859 scope + agency HR-TD-003 process."
      },
      {
        "icon": "🧪",
        "title": "Quiz ≠ practical competency",
        "detail": "Knowledge check is Level 1 only. Observed demo and authorized sign-off remain separate."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img01,
    "hotspots": [
      {
        "id": "vs",
        "label": "Vital Signs",
        "shortLabel": "Vital Signs",
        "ariaLabel": "Investigate Vital Signs",
        "x": 27,
        "y": 42,
        "zone": "authorized",
        "leftAnchorId": "kp-0-0",
        "observe": "Vital signs technique must be validated for home conditions—manual BP, pulse quality, SpO₂, and pain scales—not assumed from school alone.",
        "identifyChoices": [
          {
            "id": "vs-identify-correct",
            "label": "Vital-sign technique must be demonstrated accurately in field conditions; school completion or quiz knowledge is not a practical check-off.",
            "correct": true,
            "rationale": "Correct — Vital-sign technique must be demonstrated accurately in field conditions; school completion or quiz knowledge is not a practical check-off."
          },
          {
            "id": "vs-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "vs-decide-correct",
            "label": "Perform the complete vital-sign checklist under an authorized evaluator and remain supervised until signed off.",
            "correct": true,
            "rationale": "Correct — Perform the complete vital-sign checklist under an authorized evaluator and remain supervised until signed off."
          },
          {
            "id": "vs-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "vs-document-correct",
            "label": "Record the Vital Signs checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Vital Signs checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "vs-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Vital signs technique must be validated for home conditions—manual BP, pulse quality, SpO₂, and pain scales—not assumed from school alone.",
          "meaning": "Vital-sign technique must be demonstrated accurately in field conditions; school completion or quiz knowledge is not a practical check-off.",
          "action": "Perform the complete vital-sign checklist under an authorized evaluator and remain supervised until signed off.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Vital Signs checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "wound",
        "label": "Wound Care",
        "shortLabel": "Wound Care",
        "ariaLabel": "Investigate Wound Care",
        "x": 54,
        "y": 59,
        "zone": "authorized",
        "leftAnchorId": "kp-0-1",
        "observe": "Wound care check-off covers assessment observations, clean/sterile technique as ordered, dressing selection per protocol, and documentation. Wound staging (when required as an authorized clinician role) is not independently claimed by the LVN.",
        "identifyChoices": [
          {
            "id": "wound-identify-correct",
            "label": "Wound-care authorization is order-, technique-, and skill-specific and does not authorize independent diagnosis or treatment changes.",
            "correct": true,
            "rationale": "Correct — Wound-care authorization is order-, technique-, and skill-specific and does not authorize independent diagnosis or treatment changes."
          },
          {
            "id": "wound-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "wound-decide-correct",
            "label": "Verify the order and demonstrate the assigned technique from setup through disposal, including correction of any contamination break.",
            "correct": true,
            "rationale": "Correct — Verify the order and demonstrate the assigned technique from setup through disposal, including correction of any contamination break."
          },
          {
            "id": "wound-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "wound-document-correct",
            "label": "Record the Wound Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Wound Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "wound-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Wound care check-off covers assessment observations, clean/sterile technique as ordered, dressing selection per protocol, and documentation. Wound staging (when required as an authorized clinician role) is not independently claimed by the LVN.",
          "meaning": "Wound-care authorization is order-, technique-, and skill-specific and does not authorize independent diagnosis or treatment changes.",
          "action": "Verify the order and demonstrate the assigned technique from setup through disposal, including correction of any contamination break.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Wound Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "med",
        "label": "Med Admin",
        "shortLabel": "Med Admin",
        "ariaLabel": "Investigate Med Admin",
        "x": 77,
        "y": 48,
        "zone": "authorized",
        "leftAnchorId": "kp-0-2",
        "observe": "Medication administration validation is route-specific (oral, SC, IM, topical, inhaled, etc.). Authorization is skill-specific—not universal.",
        "identifyChoices": [
          {
            "id": "med-identify-correct",
            "label": "Medication knowledge does not establish route-specific practical competency.",
            "correct": true,
            "rationale": "Correct — Medication knowledge does not establish route-specific practical competency."
          },
          {
            "id": "med-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "med-decide-correct",
            "label": "Demonstrate the assigned route and verify all Seven Rights: patient, medication, dose, route, time, documentation, and reason.",
            "correct": true,
            "rationale": "Correct — Demonstrate the assigned route and verify all Seven Rights: patient, medication, dose, route, time, documentation, and reason."
          },
          {
            "id": "med-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "med-document-correct",
            "label": "Record the Med Admin checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Med Admin checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "med-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Medication administration validation is route-specific (oral, SC, IM, topical, inhaled, etc.). Authorization is skill-specific—not universal.",
          "meaning": "Medication knowledge does not establish route-specific practical competency.",
          "action": "Demonstrate the assigned route and verify all Seven Rights: patient, medication, dose, route, time, documentation, and reason.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Med Admin checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "cath",
        "label": "Catheter Care",
        "shortLabel": "Catheter Care",
        "ariaLabel": "Investigate Catheter Care",
        "x": 39,
        "y": 73,
        "zone": "authorized",
        "leftAnchorId": "kp-0-0",
        "observe": "Catheter care, irrigation, and change only when within LVN scope, physician orders, and agency protocol—and only after skill-specific check-off.",
        "identifyChoices": [
          {
            "id": "cath-identify-correct",
            "label": "Catheter care, irrigation, and change are distinct skills requiring an order, scope confirmation, and separate observed validation.",
            "correct": true,
            "rationale": "Correct — Catheter care, irrigation, and change are distinct skills requiring an order, scope confirmation, and separate observed validation."
          },
          {
            "id": "cath-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "cath-decide-correct",
            "label": "Demonstrate only the assigned catheter skill; do not treat another signed skill as equivalent authorization.",
            "correct": true,
            "rationale": "Correct — Demonstrate only the assigned catheter skill; do not treat another signed skill as equivalent authorization."
          },
          {
            "id": "cath-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "cath-document-correct",
            "label": "Record the Catheter Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Catheter Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "cath-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Catheter care, irrigation, and change only when within LVN scope, physician orders, and agency protocol—and only after skill-specific check-off.",
          "meaning": "Catheter care, irrigation, and change are distinct skills requiring an order, scope confirmation, and separate observed validation.",
          "action": "Demonstrate only the assigned catheter skill; do not treat another signed skill as equivalent authorization.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Catheter Care checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 1,
    "shortName": "Evaluator",
    "title": "The Competency Validation Framework",
    "subtitle": "Four-level pyramid: knowledge → simulation → return demo → independent practice",
    "narration": [
      "Care Indeed’s competency validation framework follows a four-level pyramid. Each level is completed before advancing. Independent practice is not assumed from knowledge completion alone.",
      "Level 1 — Knowledge assessment: verifies theoretical foundation—indications, contraindications, equipment, step-by-step technique, expected outcomes, complications, and documentation. LMS modules (including this one) support the knowledge level. Passing a knowledge quiz does not authorize independent performance.",
      "Level 2 — Simulation / laboratory practice: controlled, low-risk practice (mannequins, equipment stations, scenarios). Some lower-risk skills may combine Levels 2 and 3 in a single session per agency policy and evaluator judgment."
    ],
    "keyPoints": [
      {
        "icon": "1️⃣",
        "title": "Knowledge",
        "detail": "Written/electronic assessment and LMS modules—foundation only."
      },
      {
        "icon": "2️⃣",
        "title": "Simulation / lab",
        "detail": "Practice before patient care; may be combined with return demo for lower-risk skills."
      },
      {
        "icon": "3️⃣",
        "title": "Return demonstration",
        "detail": "Observed check-off with critical-step scoring—this is practical competency evidence."
      },
      {
        "icon": "4️⃣",
        "title": "Independent practice",
        "detail": "Authorized sign-off, skill-specific, tracked in personnel/competency systems."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img02,
    "hotspots": [
      {
        "id": "L4",
        "label": "Independent Practice",
        "shortLabel": "Independent …",
        "ariaLabel": "Investigate Independent Practice",
        "x": 32,
        "y": 45,
        "zone": "conditional",
        "leftAnchorId": "kp-1-0",
        "observe": "Level 4: Authorized only after successful knowledge, practice as required, observed return demo, and authorized sign-off. Skill-specific.",
        "identifyChoices": [
          {
            "id": "L4-identify-correct",
            "label": "Independent practice begins only after skill-specific authorization; a quiz never substitutes for this record.",
            "correct": true,
            "rationale": "Correct — Independent practice begins only after skill-specific authorization; a quiz never substitutes for this record."
          },
          {
            "id": "L4-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "L4-decide-correct",
            "label": "Confirm the signed authorization is current and matches the assigned skill before independent performance.",
            "correct": true,
            "rationale": "Correct — Confirm the signed authorization is current and matches the assigned skill before independent performance."
          },
          {
            "id": "L4-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "L4-document-correct",
            "label": "Record the Independent Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Independent Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "L4-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Level 4: Authorized only after successful knowledge, practice as required, observed return demo, and authorized sign-off. Skill-specific.",
          "meaning": "Independent practice begins only after skill-specific authorization; a quiz never substitutes for this record.",
          "action": "Confirm the signed authorization is current and matches the assigned skill before independent performance.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Independent Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "L3",
        "label": "Return Demonstration",
        "shortLabel": "Return Demon…",
        "ariaLabel": "Investigate Return Demonstration",
        "x": 60,
        "y": 53,
        "zone": "conditional",
        "leftAnchorId": "kp-1-1",
        "observe": "Level 3: Formal observed check-off. Evaluator does not coach mid-procedure (unless safety risk). Critical steps must all pass.",
        "identifyChoices": [
          {
            "id": "L3-identify-correct",
            "label": "The evaluator measures practical performance against the published checklist and intervenes only for immediate safety.",
            "correct": true,
            "rationale": "Correct — The evaluator measures practical performance against the published checklist and intervenes only for immediate safety."
          },
          {
            "id": "L3-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "L3-decide-correct",
            "label": "Perform from setup through documentation; an evaluator rescue of a critical step makes the attempt non-passing.",
            "correct": true,
            "rationale": "Correct — Perform from setup through documentation; an evaluator rescue of a critical step makes the attempt non-passing."
          },
          {
            "id": "L3-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "L3-document-correct",
            "label": "Record the Return Demonstration checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Return Demonstration checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "L3-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Level 3: Formal observed check-off. Evaluator does not coach mid-procedure (unless safety risk). Critical steps must all pass.",
          "meaning": "The evaluator measures practical performance against the published checklist and intervenes only for immediate safety.",
          "action": "Perform from setup through documentation; an evaluator rescue of a critical step makes the attempt non-passing.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Return Demonstration checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "L2",
        "label": "Simulation / Lab",
        "shortLabel": "Simulation /…",
        "ariaLabel": "Investigate Simulation / Lab",
        "x": 75,
        "y": 68,
        "zone": "authorized",
        "leftAnchorId": "kp-1-2",
        "observe": "Level 2: Controlled practice environment. Builds muscle memory before patient-facing evaluation.",
        "identifyChoices": [
          {
            "id": "L2-identify-correct",
            "label": "Simulation builds technique but is practice, not authorization for independent care.",
            "correct": true,
            "rationale": "Correct — Simulation builds technique but is practice, not authorization for independent care."
          },
          {
            "id": "L2-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "L2-decide-correct",
            "label": "Use coached practice to correct technique, then schedule a separate formal return demonstration.",
            "correct": true,
            "rationale": "Correct — Use coached practice to correct technique, then schedule a separate formal return demonstration."
          },
          {
            "id": "L2-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "L2-document-correct",
            "label": "Record the Simulation / Lab checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Simulation / Lab checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "L2-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Level 2: Controlled practice environment. Builds muscle memory before patient-facing evaluation.",
          "meaning": "Simulation builds technique but is practice, not authorization for independent care.",
          "action": "Use coached practice to correct technique, then schedule a separate formal return demonstration.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Simulation / Lab checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "L1",
        "label": "Knowledge Assessment",
        "shortLabel": "Knowledge As…",
        "ariaLabel": "Investigate Knowledge Assessment",
        "x": 45,
        "y": 71,
        "zone": "authorized",
        "leftAnchorId": "kp-1-3",
        "observe": "Level 1: Theory and decision rules. This module’s quiz supports Level 1 only—not practical sign-off.",
        "identifyChoices": [
          {
            "id": "L1-identify-correct",
            "label": "This knowledge check measures understanding only and never proves practical competency.",
            "correct": true,
            "rationale": "Correct — This knowledge check measures understanding only and never proves practical competency."
          },
          {
            "id": "L1-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "L1-decide-correct",
            "label": "Complete required study, then advance to simulation and observed return demonstration.",
            "correct": true,
            "rationale": "Correct — Complete required study, then advance to simulation and observed return demonstration."
          },
          {
            "id": "L1-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "L1-document-correct",
            "label": "Record the Knowledge Assessment checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Knowledge Assessment checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "L1-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Level 1: Theory and decision rules. This module’s quiz supports Level 1 only—not practical sign-off.",
          "meaning": "This knowledge check measures understanding only and never proves practical competency.",
          "action": "Complete required study, then advance to simulation and observed return demonstration.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Knowledge Assessment checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 2,
    "shortName": "Checklist",
    "title": "Core Skills Check-off List",
    "subtitle": "Minimum LVN skills requiring validation before independent home health practice",
    "narration": [
      "Care Indeed requires competency validation for core LVN skills before independent home health practice. The list below is a minimum set; additional skills may be required based on assigned patient population and caseload complexity (agency policy).",
      "Vital signs: temperature routes as applicable, pulse (radial/apical/pedal as indicated), respirations, blood pressure (manual and automatic), SpO₂, and pain assessment with standardized scales. Home environments require adaptation—noise, positioning, equipment limits—so technique is still formally validated.",
      "Wound care: wound assessment observations and measurement, bed preparation, dressing application for ordered wound types, NPWT management when assigned and trained, compression when ordered, and photography/documentation per protocol. Report changes to the RN/authorized clinician; do not independently diagnose or invent treatment changes. Staging, when an authorized clinician function, is not assumed to be LVN-independent."
    ],
    "keyPoints": [
      {
        "icon": "📋",
        "title": "Minimum core set",
        "detail": "Vitals, wound care technique, med routes, catheter care, glucose/insulin, specimens—plus caseload-specific skills."
      },
      {
        "icon": "⚖️",
        "title": "CA B&P § 2859",
        "detail": "Practice within LVN scope under direction; no independent POC changes, diagnosis, or prescribing."
      },
      {
        "icon": "🔑",
        "title": "Skill-specific keys",
        "detail": "Each skill unlocks separately. New devices/protocols reopen the validation pathway."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img03,
    "hotspots": [
      {
        "id": "in_scope",
        "label": "Within LVN Scope",
        "shortLabel": "Within LVN S…",
        "ariaLabel": "Investigate Within LVN Scope",
        "x": 26,
        "y": 50,
        "zone": "authorized",
        "leftAnchorId": "kp-2-0",
        "observe": "When trained/validated and ordered: vitals, med admin by allowed routes, wound care technique, catheter care per protocol, glucose monitoring, injections, trach care if assigned/validated.",
        "identifyChoices": [
          {
            "id": "in_scope-identify-correct",
            "label": "A skill may be assigned only when it is within LVN scope, ordered or authorized, and validated for this clinician.",
            "correct": true,
            "rationale": "Correct — A skill may be assigned only when it is within LVN scope, ordered or authorized, and validated for this clinician."
          },
          {
            "id": "in_scope-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "in_scope-decide-correct",
            "label": "Match the assignment to the exact signed skill; stop if scope, order, or competency is missing.",
            "correct": true,
            "rationale": "Correct — Match the assignment to the exact signed skill; stop if scope, order, or competency is missing."
          },
          {
            "id": "in_scope-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "in_scope-document-correct",
            "label": "Record the Within LVN Scope checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Within LVN Scope checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "in_scope-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "When trained/validated and ordered: vitals, med admin by allowed routes, wound care technique, catheter care per protocol, glucose monitoring, injections, trach care if assigned/validated.",
          "meaning": "A skill may be assigned only when it is within LVN scope, ordered or authorized, and validated for this clinician.",
          "action": "Match the assignment to the exact signed skill; stop if scope, order, or competency is missing.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Within LVN Scope checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "directed",
        "label": "Directed Practice",
        "shortLabel": "Directed Pra…",
        "ariaLabel": "Investigate Directed Practice",
        "x": 51,
        "y": 41,
        "zone": "authorized",
        "leftAnchorId": "kp-2-1",
        "observe": "LVN practice is directed. Follow physician orders and the Plan of Care. Report changes; do not modify the POC yourself.",
        "identifyChoices": [
          {
            "id": "directed-identify-correct",
            "label": "Competency validation permits technique; it does not permit diagnosis, prescribing, or independent Plan of Care revision.",
            "correct": true,
            "rationale": "Correct — Competency validation permits technique; it does not permit diagnosis, prescribing, or independent Plan of Care revision."
          },
          {
            "id": "directed-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "directed-decide-correct",
            "label": "Follow the current order and report changes instead of independently changing the intervention.",
            "correct": true,
            "rationale": "Correct — Follow the current order and report changes instead of independently changing the intervention."
          },
          {
            "id": "directed-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "directed-document-correct",
            "label": "Record the Directed Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Directed Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "directed-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "LVN practice is directed. Follow physician orders and the Plan of Care. Report changes; do not modify the POC yourself.",
          "meaning": "Competency validation permits technique; it does not permit diagnosis, prescribing, or independent Plan of Care revision.",
          "action": "Follow the current order and report changes instead of independently changing the intervention.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Directed Practice checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "out_scope",
        "label": "Not Independent LVN",
        "shortLabel": "Not Independ…",
        "ariaLabel": "Investigate Not Independent LVN",
        "x": 73,
        "y": 55,
        "zone": "authorized",
        "leftAnchorId": "kp-2-2",
        "observe": "Not independent LVN functions: completing OASIS, developing/modifying the Plan of Care, diagnosing, prescribing, changing medication orders, or making discharge judgments.",
        "identifyChoices": [
          {
            "id": "out_scope-identify-correct",
            "label": "OASIS completion, diagnosis, prescribing, and independent Plan of Care changes do not become LVN functions through check-off.",
            "correct": true,
            "rationale": "Correct — OASIS completion, diagnosis, prescribing, and independent Plan of Care changes do not become LVN functions through check-off."
          },
          {
            "id": "out_scope-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "out_scope-decide-correct",
            "label": "Do not perform the out-of-scope decision; preserve safety and escalate to the authorized clinician.",
            "correct": true,
            "rationale": "Correct — Do not perform the out-of-scope decision; preserve safety and escalate to the authorized clinician."
          },
          {
            "id": "out_scope-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "out_scope-document-correct",
            "label": "Record the Not Independent LVN checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Not Independent LVN checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "out_scope-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Not independent LVN functions: completing OASIS, developing/modifying the Plan of Care, diagnosing, prescribing, changing medication orders, or making discharge judgments.",
          "meaning": "OASIS completion, diagnosis, prescribing, and independent Plan of Care changes do not become LVN functions through check-off.",
          "action": "Do not perform the out-of-scope decision; preserve safety and escalate to the authorized clinician.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Not Independent LVN checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "policy",
        "label": "Agency Policy Layer",
        "shortLabel": "Agency Polic…",
        "ariaLabel": "Investigate Agency Policy Layer",
        "x": 59,
        "y": 73,
        "zone": "authorized",
        "leftAnchorId": "kp-2-1",
        "observe": "HR-TD-003 and skill checklists define attempt limits, evaluator qualifications, documentation, and escalation—agency operational rules on top of law.",
        "identifyChoices": [
          {
            "id": "policy-identify-correct",
            "label": "HR-TD-003 and HR-TR-101 govern training, evaluator authority, validation records, remediation, and authorization.",
            "correct": true,
            "rationale": "Correct — HR-TD-003 and HR-TR-101 govern training, evaluator authority, validation records, remediation, and authorization."
          },
          {
            "id": "policy-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "policy-decide-correct",
            "label": "Use the current approved checklist and an authorized evaluator; do not create an informal substitute.",
            "correct": true,
            "rationale": "Correct — Use the current approved checklist and an authorized evaluator; do not create an informal substitute."
          },
          {
            "id": "policy-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "policy-document-correct",
            "label": "Record the Agency Policy Layer checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Agency Policy Layer checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "policy-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "HR-TD-003 and skill checklists define attempt limits, evaluator qualifications, documentation, and escalation—agency operational rules on top of law.",
          "meaning": "HR-TD-003 and HR-TR-101 govern training, evaluator authority, validation records, remediation, and authorization.",
          "action": "Use the current approved checklist and an authorized evaluator; do not create an informal substitute.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Agency Policy Layer checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 3,
    "shortName": "Non-Pass",
    "title": "The Check-off Process — What to Expect",
    "subtitle": "Preparation, observation rules, scoring, and sign-off",
    "narration": [
      "The formal skills check-off is a structured evaluation with defined roles for you and the evaluator. Understanding the process reduces anxiety and improves preparation.",
      "Before: You receive the skill-specific competency checklist. It lists every step, marks critical (must-pass) vs non-critical items, and states the acceptable performance standard. Review carefully. Practice mentally and, when available, in lab/simulation. Arrive with required supplies.",
      "During: The evaluator observes from setup through completion and documentation. The evaluator does not prompt, assist, or correct mid-procedure unless patient (or simulated patient) safety is at immediate risk. You may clarify checklist items before starting; once you begin, evaluation is in progress."
    ],
    "keyPoints": [
      {
        "icon": "📎",
        "title": "Know the checklist",
        "detail": "Critical vs non-critical steps are listed before evaluation day—use them as your study guide."
      },
      {
        "icon": "👁️",
        "title": "Observe, don’t coach",
        "detail": "Evaluator role is observation without prompting unless safety requires intervention."
      },
      {
        "icon": "✍️",
        "title": "Dual signature",
        "detail": "Passing check-off requires authorized evaluator sign-off plus your acknowledgment."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img04,
    "hotspots": [
      {
        "id": "prep",
        "label": "Prepare",
        "shortLabel": "Prepare",
        "ariaLabel": "Investigate Prepare",
        "x": 29,
        "y": 38,
        "zone": "authorized",
        "leftAnchorId": "kp-3-0",
        "observe": "Obtain checklist, review critical steps, gather supplies, complete knowledge/sim prerequisites.",
        "identifyChoices": [
          {
            "id": "prep-identify-correct",
            "label": "Preparation establishes a fair, standardized attempt but is not itself a pass.",
            "correct": true,
            "rationale": "Correct — Preparation establishes a fair, standardized attempt but is not itself a pass."
          },
          {
            "id": "prep-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "prep-decide-correct",
            "label": "Clarify checklist wording before the attempt and begin only when prerequisites, equipment, and safety conditions are ready.",
            "correct": true,
            "rationale": "Correct — Clarify checklist wording before the attempt and begin only when prerequisites, equipment, and safety conditions are ready."
          },
          {
            "id": "prep-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "prep-document-correct",
            "label": "Record the Prepare checklist evidence, critical-step status, attempt number, result, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Prepare checklist evidence, critical-step status, attempt number, result, and required signatures."
          },
          {
            "id": "prep-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Obtain checklist, review critical steps, gather supplies, complete knowledge/sim prerequisites.",
          "meaning": "Preparation establishes a fair, standardized attempt but is not itself a pass.",
          "action": "Clarify checklist wording before the attempt and begin only when prerequisites, equipment, and safety conditions are ready.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Prepare checklist evidence, critical-step status, attempt number, result, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "demo",
        "label": "Demonstrate",
        "shortLabel": "Demonstrate",
        "ariaLabel": "Investigate Demonstrate",
        "x": 54,
        "y": 51,
        "zone": "authorized",
        "leftAnchorId": "kp-3-1",
        "observe": "Perform full procedure under observation without coaching. Self-correct safety breaks when recognized.",
        "identifyChoices": [
          {
            "id": "demo-identify-correct",
            "label": "Prompting or hands-on rescue means the evaluator did not observe independent performance of that step.",
            "correct": true,
            "rationale": "Correct — Prompting or hands-on rescue means the evaluator did not observe independent performance of that step."
          },
          {
            "id": "demo-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "demo-decide-correct",
            "label": "Perform the full sequence without coaching and stop to correct a safety break when recognized.",
            "correct": true,
            "rationale": "Correct — Perform the full sequence without coaching and stop to correct a safety break when recognized."
          },
          {
            "id": "demo-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "demo-document-correct",
            "label": "Record the Demonstrate checklist evidence, critical-step status, attempt number, result, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Demonstrate checklist evidence, critical-step status, attempt number, result, and required signatures."
          },
          {
            "id": "demo-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Perform full procedure under observation without coaching. Self-correct safety breaks when recognized.",
          "meaning": "Prompting or hands-on rescue means the evaluator did not observe independent performance of that step.",
          "action": "Perform the full sequence without coaching and stop to correct a safety break when recognized.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Demonstrate checklist evidence, critical-step status, attempt number, result, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "score",
        "label": "Score",
        "shortLabel": "Score",
        "ariaLabel": "Investigate Score",
        "x": 79,
        "y": 45,
        "zone": "authorized",
        "leftAnchorId": "kp-3-2",
        "observe": "Critical steps must all be satisfactory. Any critical fail = non-pass for the skill attempt.",
        "identifyChoices": [
          {
            "id": "score-identify-correct",
            "label": "A missed critical step makes the entire attempt non-passing; other satisfactory steps cannot average it away.",
            "correct": true,
            "rationale": "Correct — A missed critical step makes the entire attempt non-passing; other satisfactory steps cannot average it away."
          },
          {
            "id": "score-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "score-decide-correct",
            "label": "Safely stop or conclude the attempt, explain the result, and begin remediation before re-evaluation.",
            "correct": true,
            "rationale": "Correct — Safely stop or conclude the attempt, explain the result, and begin remediation before re-evaluation."
          },
          {
            "id": "score-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "score-document-correct",
            "label": "Record the Score checklist evidence, critical-step status, attempt number, result, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Score checklist evidence, critical-step status, attempt number, result, and required signatures."
          },
          {
            "id": "score-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Critical steps must all be satisfactory. Any critical fail = non-pass for the skill attempt.",
          "meaning": "A missed critical step makes the entire attempt non-passing; other satisfactory steps cannot average it away.",
          "action": "Safely stop or conclude the attempt, explain the result, and begin remediation before re-evaluation.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Score checklist evidence, critical-step status, attempt number, result, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "sign",
        "label": "Sign-off",
        "shortLabel": "Sign-off",
        "ariaLabel": "Investigate Sign-off",
        "x": 47,
        "y": 69,
        "zone": "authorized",
        "leftAnchorId": "kp-3-2",
        "observe": "Pass → authorized signature + your acknowledgment + tracking system update. Still skill-specific.",
        "identifyChoices": [
          {
            "id": "sign-identify-correct",
            "label": "Authorization is valid only for the named skill after an authorized evaluator signs and the employee acknowledges the result.",
            "correct": true,
            "rationale": "Correct — Authorization is valid only for the named skill after an authorized evaluator signs and the employee acknowledges the result."
          },
          {
            "id": "sign-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "sign-decide-correct",
            "label": "Complete both signatures and update the tracking system before independent assignment.",
            "correct": true,
            "rationale": "Correct — Complete both signatures and update the tracking system before independent assignment."
          },
          {
            "id": "sign-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "sign-document-correct",
            "label": "Record the Sign-off checklist evidence, critical-step status, attempt number, result, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Sign-off checklist evidence, critical-step status, attempt number, result, and required signatures."
          },
          {
            "id": "sign-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Pass → authorized signature + your acknowledgment + tracking system update. Still skill-specific.",
          "meaning": "Authorization is valid only for the named skill after an authorized evaluator signs and the employee acknowledges the result.",
          "action": "Complete both signatures and update the tracking system before independent assignment.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Sign-off checklist evidence, critical-step status, attempt number, result, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 4,
    "shortName": "Critical Step",
    "title": "Critical Steps and Zero-Tolerance Items",
    "subtitle": "Must-pass safety steps that make an attempt non-passing if missed",
    "narration": [
      "Certain steps are designated critical because failure creates immediate risk of harm. On competency checklists these are zero-tolerance items: failure on any single critical step yields an automatic non-passing evaluation, regardless of excellence on other steps.",
      "Patient identification: before any clinical intervention, verify identity with at least two identifiers. Missing ID check during check-off = automatic fail.",
      "Hand hygiene: before and after procedures, with correct timing and technique (adequate duration/coverage). Evaluators specifically watch timing relative to the procedure."
    ],
    "keyPoints": [
      {
        "icon": "🚨",
        "title": "One critical fail = non-pass",
        "detail": "No partial pass on critical safety steps—full attempt fails and remediation starts."
      },
      {
        "icon": "🆔",
        "title": "Universal criticals",
        "detail": "Two identifiers + hand hygiene appear on essentially every procedure checklist."
      },
      {
        "icon": "💉",
        "title": "Medication and sharps criticals",
        "detail": "Verify all Seven Rights—patient, medication, dose, route, time, documentation, reason—and follow sharps safety during medication check-offs."
      }
    ],
    "clinicalTip": "A knowledge score never overrides a missed critical step. Record the non-pass and complete remediation before re-evaluation.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img05,
    "hotspots": [
      {
        "id": "id",
        "label": "Patient ID",
        "shortLabel": "Patient ID",
        "ariaLabel": "Investigate Patient ID",
        "x": 35,
        "y": 48,
        "zone": "authorized",
        "leftAnchorId": "kp-4-0",
        "observe": "Two identifiers before every intervention. Universal critical step—automatic fail if omitted.",
        "identifyChoices": [
          {
            "id": "id-identify-correct",
            "label": "Two-identifier patient verification is a universal critical step; omission makes the attempt non-passing.",
            "correct": true,
            "rationale": "Correct — Two-identifier patient verification is a universal critical step; omission makes the attempt non-passing."
          },
          {
            "id": "id-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "id-decide-correct",
            "label": "Intervene for safety, stop the attempt, identify the missed critical step, and begin remediation.",
            "correct": true,
            "rationale": "Correct — Intervene for safety, stop the attempt, identify the missed critical step, and begin remediation."
          },
          {
            "id": "id-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "id-document-correct",
            "label": "Record the Patient ID checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Patient ID checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "id-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Two identifiers before every intervention. Universal critical step—automatic fail if omitted.",
          "meaning": "Two-identifier patient verification is a universal critical step; omission makes the attempt non-passing.",
          "action": "Intervene for safety, stop the attempt, identify the missed critical step, and begin remediation.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Patient ID checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "hh",
        "label": "Hand Hygiene",
        "shortLabel": "Hand Hygiene",
        "ariaLabel": "Investigate Hand Hygiene",
        "x": 52,
        "y": 63,
        "zone": "authorized",
        "leftAnchorId": "kp-4-1",
        "observe": "Correct timing and technique before/after. Duration and coverage are observed.",
        "identifyChoices": [
          {
            "id": "hh-identify-correct",
            "label": "Omitted hand-hygiene timing or technique is a critical infection-prevention failure for the applicable skill.",
            "correct": true,
            "rationale": "Correct — Omitted hand-hygiene timing or technique is a critical infection-prevention failure for the applicable skill."
          },
          {
            "id": "hh-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "hh-decide-correct",
            "label": "Stop if safety requires, record the critical miss, and assign focused practice before re-evaluation.",
            "correct": true,
            "rationale": "Correct — Stop if safety requires, record the critical miss, and assign focused practice before re-evaluation."
          },
          {
            "id": "hh-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "hh-document-correct",
            "label": "Record the Hand Hygiene checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Hand Hygiene checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "hh-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Correct timing and technique before/after. Duration and coverage are observed.",
          "meaning": "Omitted hand-hygiene timing or technique is a critical infection-prevention failure for the applicable skill.",
          "action": "Stop if safety requires, record the critical miss, and assign focused practice before re-evaluation.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Hand Hygiene checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "sterile",
        "label": "Sterile Field",
        "shortLabel": "Sterile Field",
        "ariaLabel": "Investigate Sterile Field",
        "x": 70,
        "y": 40,
        "zone": "authorized",
        "leftAnchorId": "kp-4-2",
        "observe": "When sterility is required, breaks must be recognized and corrected—or the attempt fails.",
        "identifyChoices": [
          {
            "id": "sterile-identify-correct",
            "label": "An unrecognized or uncorrected sterile-field break is a critical failure for a skill requiring sterile technique.",
            "correct": true,
            "rationale": "Correct — An unrecognized or uncorrected sterile-field break is a critical failure for a skill requiring sterile technique."
          },
          {
            "id": "sterile-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "sterile-decide-correct",
            "label": "Stop the contaminated sequence, make the station safe, record a non-pass, and remediate correction technique.",
            "correct": true,
            "rationale": "Correct — Stop the contaminated sequence, make the station safe, record a non-pass, and remediate correction technique."
          },
          {
            "id": "sterile-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "sterile-document-correct",
            "label": "Record the Sterile Field checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Sterile Field checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "sterile-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "When sterility is required, breaks must be recognized and corrected—or the attempt fails.",
          "meaning": "An unrecognized or uncorrected sterile-field break is a critical failure for a skill requiring sterile technique.",
          "action": "Stop the contaminated sequence, make the station safe, record a non-pass, and remediate correction technique.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Sterile Field checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "seven_rights",
        "label": "Seven Rights",
        "shortLabel": "Seven Rights",
        "ariaLabel": "Investigate Seven Rights",
        "x": 42,
        "y": 76,
        "zone": "authorized",
        "leftAnchorId": "kp-4-2",
        "observe": "Verify the Seven Rights: patient, medication, dose, route, time, documentation, and reason.",
        "identifyChoices": [
          {
            "id": "seven_rights-identify-correct",
            "label": "Omitting patient, medication, dose, route, time, documentation, or reason is a critical medication-safety failure.",
            "correct": true,
            "rationale": "Correct — Omitting patient, medication, dose, route, time, documentation, or reason is a critical medication-safety failure."
          },
          {
            "id": "seven_rights-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "seven_rights-decide-correct",
            "label": "Verify every Seven Right; if any cannot be confirmed, hold the simulated administration, clarify, and record the attempt result.",
            "correct": true,
            "rationale": "Correct — Verify every Seven Right; if any cannot be confirmed, hold the simulated administration, clarify, and record the attempt result."
          },
          {
            "id": "seven_rights-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "seven_rights-document-correct",
            "label": "Record the Seven Rights checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
            "correct": true,
            "rationale": "Correct — Record the Seven Rights checklist steps, critical results, evaluator decision, remediation if any, and required signatures."
          },
          {
            "id": "seven_rights-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Verify the Seven Rights: patient, medication, dose, route, time, documentation, and reason.",
          "meaning": "Omitting patient, medication, dose, route, time, documentation, or reason is a critical medication-safety failure.",
          "action": "Verify every Seven Right; if any cannot be confirmed, hold the simulated administration, clarify, and record the attempt result.",
          "notify": "Notify the authorized evaluator and supervising RN or clinical educator of any safety, scope, order, or authorization concern.",
          "document": "Record the Seven Rights checklist steps, critical results, evaluator decision, remediation if any, and required signatures.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 5,
    "shortName": "Remediation",
    "title": "Remediation and Re-evaluation",
    "subtitle": "Supportive pathway after a non-pass — not punishment",
    "narration": [
      "A non-passing skills check-off starts a structured remediation process. Remediation is educational support designed to achieve safe competency—not a punitive ritual.",
      "Plan development: The evaluator, with the clinical educator or DON as needed, documents specific deficiencies, corrective actions, training resources, and re-evaluation timing. You receive a written plan and sign acknowledging understanding and commitment.",
      "Activities: Knowledge gaps may trigger module review, reading, or 1:1 instruction. Technique gaps may trigger guided practice, video review of correct method, or mentored practice with an experienced clinician. Complete all plan elements before re-evaluation."
    ],
    "keyPoints": [
      {
        "icon": "📝",
        "title": "Written plan",
        "detail": "Deficiencies, actions, resources, and timeline—signed acknowledgment required."
      },
      {
        "icon": "🔁",
        "title": "Agency attempt limit",
        "detail": "Per HR-TD-003: up to three attempts, then DON review/escalation (agency policy)."
      },
      {
        "icon": "📂",
        "title": "Record retention",
        "detail": "Pass and non-pass documentation remain part of the competency file."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img06,
    "hotspots": [
      {
        "id": "def",
        "label": "Deficiency Identified",
        "shortLabel": "Deficiency I…",
        "ariaLabel": "Investigate Deficiency Identified",
        "x": 29,
        "y": 55,
        "zone": "authorized",
        "leftAnchorId": "kp-5-0",
        "observe": "Evaluator documents exactly which critical/non-critical steps failed and why.",
        "identifyChoices": [
          {
            "id": "def-identify-correct",
            "label": "Objective deficiency detail is required to target remediation; “needs improvement” alone is insufficient.",
            "correct": true,
            "rationale": "Correct — Objective deficiency detail is required to target remediation; “needs improvement” alone is insufficient."
          },
          {
            "id": "def-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "def-decide-correct",
            "label": "Review the exact missed steps and separate knowledge, technique, and critical-safety gaps.",
            "correct": true,
            "rationale": "Correct — Review the exact missed steps and separate knowledge, technique, and critical-safety gaps."
          },
          {
            "id": "def-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "def-document-correct",
            "label": "Record the Deficiency Identified deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
            "correct": true,
            "rationale": "Correct — Record the Deficiency Identified deficiency or remediation activity, completion criteria, attempt status, and acknowledgments."
          },
          {
            "id": "def-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Evaluator documents exactly which critical/non-critical steps failed and why.",
          "meaning": "Objective deficiency detail is required to target remediation; “needs improvement” alone is insufficient.",
          "action": "Review the exact missed steps and separate knowledge, technique, and critical-safety gaps.",
          "notify": "Notify the clinical educator or DON according to the attempt number and remediation policy.",
          "document": "Record the Deficiency Identified deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "plan",
        "label": "Remediation Plan",
        "shortLabel": "Remediation …",
        "ariaLabel": "Investigate Remediation Plan",
        "x": 59,
        "y": 46,
        "zone": "authorized",
        "leftAnchorId": "kp-5-1",
        "observe": "Written plan with actions, resources, and re-evaluation timing; employee acknowledgment.",
        "identifyChoices": [
          {
            "id": "plan-identify-correct",
            "label": "A remediation plan supports safe learning and does not convert a non-pass into authorization.",
            "correct": true,
            "rationale": "Correct — A remediation plan supports safe learning and does not convert a non-pass into authorization."
          },
          {
            "id": "plan-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "plan-decide-correct",
            "label": "Set measurable practice activities and keep the learner from independent performance of the unsigned skill.",
            "correct": true,
            "rationale": "Correct — Set measurable practice activities and keep the learner from independent performance of the unsigned skill."
          },
          {
            "id": "plan-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "plan-document-correct",
            "label": "Record the Remediation Plan deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
            "correct": true,
            "rationale": "Correct — Record the Remediation Plan deficiency or remediation activity, completion criteria, attempt status, and acknowledgments."
          },
          {
            "id": "plan-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Written plan with actions, resources, and re-evaluation timing; employee acknowledgment.",
          "meaning": "A remediation plan supports safe learning and does not convert a non-pass into authorization.",
          "action": "Set measurable practice activities and keep the learner from independent performance of the unsigned skill.",
          "notify": "Notify the clinical educator or DON according to the attempt number and remediation policy.",
          "document": "Record the Remediation Plan deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "train",
        "label": "Additional Training",
        "shortLabel": "Additional T…",
        "ariaLabel": "Investigate Additional Training",
        "x": 76,
        "y": 60,
        "zone": "authorized",
        "leftAnchorId": "kp-5-2",
        "observe": "Knowledge review, guided practice, mentored sessions—matched to the gap type.",
        "identifyChoices": [
          {
            "id": "train-identify-correct",
            "label": "Focused training must address the identified gap before another formal attempt.",
            "correct": true,
            "rationale": "Correct — Focused training must address the identified gap before another formal attempt."
          },
          {
            "id": "train-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "train-decide-correct",
            "label": "Complete assigned review, guided practice, or equipment training and demonstrate readiness for re-evaluation.",
            "correct": true,
            "rationale": "Correct — Complete assigned review, guided practice, or equipment training and demonstrate readiness for re-evaluation."
          },
          {
            "id": "train-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "train-document-correct",
            "label": "Record the Additional Training deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
            "correct": true,
            "rationale": "Correct — Record the Additional Training deficiency or remediation activity, completion criteria, attempt status, and acknowledgments."
          },
          {
            "id": "train-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Knowledge review, guided practice, mentored sessions—matched to the gap type.",
          "meaning": "Focused training must address the identified gap before another formal attempt.",
          "action": "Complete assigned review, guided practice, or equipment training and demonstrate readiness for re-evaluation.",
          "notify": "Notify the clinical educator or DON according to the attempt number and remediation policy.",
          "document": "Record the Additional Training deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "redemo",
        "label": "Re-demonstration",
        "shortLabel": "Re-demonstra…",
        "ariaLabel": "Investigate Re-demonstration",
        "x": 41,
        "y": 71,
        "zone": "authorized",
        "leftAnchorId": "kp-5-1",
        "observe": "Full observed checklist again. Prior fails get special scrutiny.",
        "identifyChoices": [
          {
            "id": "redemo-identify-correct",
            "label": "Re-evaluation is a complete observed attempt; training completion alone does not establish competency.",
            "correct": true,
            "rationale": "Correct — Re-evaluation is a complete observed attempt; training completion alone does not establish competency."
          },
          {
            "id": "redemo-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "redemo-decide-correct",
            "label": "Use the approved checklist, scrutinize prior deficiencies, and score the new attempt independently.",
            "correct": true,
            "rationale": "Correct — Use the approved checklist, scrutinize prior deficiencies, and score the new attempt independently."
          },
          {
            "id": "redemo-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "redemo-document-correct",
            "label": "Record the Re-demonstration deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
            "correct": true,
            "rationale": "Correct — Record the Re-demonstration deficiency or remediation activity, completion criteria, attempt status, and acknowledgments."
          },
          {
            "id": "redemo-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Full observed checklist again. Prior fails get special scrutiny.",
          "meaning": "Re-evaluation is a complete observed attempt; training completion alone does not establish competency.",
          "action": "Use the approved checklist, scrutinize prior deficiencies, and score the new attempt independently.",
          "notify": "Notify the clinical educator or DON according to the attempt number and remediation policy.",
          "document": "Record the Re-demonstration deficiency or remediation activity, completion criteria, attempt status, and acknowledgments.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  },
  {
    "id": 6,
    "shortName": "Sign-Off",
    "title": "Annual Re-validation and Mastery",
    "subtitle": "Competency is ongoing — annual review, new skills, high-risk low-frequency",
    "narration": [
      "Competency validation is not a one-time event. Care Indeed requires annual re-validation of core clinical competencies, operationalizing federal personnel qualification expectations (42 CFR § 484.115), California LVN practice boundaries (B&P § 2859), and agency policy HR-TD-003. Exact scheduling windows and roster lists follow current agency policy.",
      "Annual re-validation uses the same checklist framework. For consistently competent clinicians, evaluation may focus on critical steps; any concern triggers a full check-off. New skills, products, devices, or protocol changes require initial full pathway validation regardless of annual status.",
      "High-risk, low-frequency skills (emergency response, certain device cares, trach emergencies, etc.) may require more frequent re-validation or just-in-time protocol review per agency policy because skill decay risk is higher."
    ],
    "keyPoints": [
      {
        "icon": "📅",
        "title": "Annual re-validation",
        "detail": "Core skills refresh on an agency-scheduled annual cycle; not “once and forever.”"
      },
      {
        "icon": "🆕",
        "title": "New skill = new pathway",
        "detail": "New devices/protocols reopen Levels 1–4 even if annuals are current."
      },
      {
        "icon": "🏅",
        "title": "Mastery evidence",
        "detail": "Tracking systems + signed checklists are survey-ready proof—not the LMS quiz alone."
      }
    ],
    "clinicalTip": "Confirm the exact skill, current checklist, authorized evaluator, and signed status before independent performance.",
    "sourceLabels": [
      {
        "kind": "Agency policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency policy",
        "text": "HR-TR-101"
      }
    ],
    "sceneImage": img07,
    "hotspots": [
      {
        "id": "annual",
        "label": "Annual Cycle",
        "shortLabel": "Annual Cycle",
        "ariaLabel": "Investigate Annual Cycle",
        "x": 31,
        "y": 42,
        "zone": "authorized",
        "leftAnchorId": "kp-6-0",
        "observe": "Core competencies re-validated on the agency annual schedule; focused or full based on performance.",
        "identifyChoices": [
          {
            "id": "annual-identify-correct",
            "label": "Prior sign-off does not eliminate agency-scheduled ongoing validation requirements.",
            "correct": true,
            "rationale": "Correct — Prior sign-off does not eliminate agency-scheduled ongoing validation requirements."
          },
          {
            "id": "annual-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "annual-decide-correct",
            "label": "Complete the required focused or full observed check-off before the due date or independent assignment.",
            "correct": true,
            "rationale": "Correct — Complete the required focused or full observed check-off before the due date or independent assignment."
          },
          {
            "id": "annual-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "annual-document-correct",
            "label": "Update the Annual Cycle competency record with the skill, method, date, evaluator, result, and authorization status.",
            "correct": true,
            "rationale": "Correct — Update the Annual Cycle competency record with the skill, method, date, evaluator, result, and authorization status."
          },
          {
            "id": "annual-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Core competencies re-validated on the agency annual schedule; focused or full based on performance.",
          "meaning": "Prior sign-off does not eliminate agency-scheduled ongoing validation requirements.",
          "action": "Complete the required focused or full observed check-off before the due date or independent assignment.",
          "notify": "Notify the clinical educator or supervisor about an overdue, missing, or conflicting competency status.",
          "document": "Update the Annual Cycle competency record with the skill, method, date, evaluator, result, and authorization status.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "newskill",
        "label": "New Skill Path",
        "shortLabel": "New Skill Path",
        "ariaLabel": "Investigate New Skill Path",
        "x": 54,
        "y": 56,
        "zone": "authorized",
        "leftAnchorId": "kp-6-1",
        "observe": "New product/device/protocol → full competency pathway before independent use.",
        "identifyChoices": [
          {
            "id": "newskill-identify-correct",
            "label": "An existing record does not automatically authorize a materially different device, product, route, or protocol.",
            "correct": true,
            "rationale": "Correct — An existing record does not automatically authorize a materially different device, product, route, or protocol."
          },
          {
            "id": "newskill-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "newskill-decide-correct",
            "label": "Complete knowledge, practice, return demonstration, and sign-off for the new skill before independent use.",
            "correct": true,
            "rationale": "Correct — Complete knowledge, practice, return demonstration, and sign-off for the new skill before independent use."
          },
          {
            "id": "newskill-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "newskill-document-correct",
            "label": "Update the New Skill Path competency record with the skill, method, date, evaluator, result, and authorization status.",
            "correct": true,
            "rationale": "Correct — Update the New Skill Path competency record with the skill, method, date, evaluator, result, and authorization status."
          },
          {
            "id": "newskill-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "New product/device/protocol → full competency pathway before independent use.",
          "meaning": "An existing record does not automatically authorize a materially different device, product, route, or protocol.",
          "action": "Complete knowledge, practice, return demonstration, and sign-off for the new skill before independent use.",
          "notify": "Notify the clinical educator or supervisor about an overdue, missing, or conflicting competency status.",
          "document": "Update the New Skill Path competency record with the skill, method, date, evaluator, result, and authorization status.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "hrlf",
        "label": "High-Risk Low-Freq",
        "shortLabel": "High-Risk Lo…",
        "ariaLabel": "Investigate High-Risk Low-Freq",
        "x": 77,
        "y": 50,
        "zone": "authorized",
        "leftAnchorId": "kp-6-2",
        "observe": "May need more frequent validation or protocol review—follow current agency policy.",
        "identifyChoices": [
          {
            "id": "hrlf-identify-correct",
            "label": "Skill decay may require just-in-time review or more frequent observed validation under agency policy.",
            "correct": true,
            "rationale": "Correct — Skill decay may require just-in-time review or more frequent observed validation under agency policy."
          },
          {
            "id": "hrlf-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "hrlf-decide-correct",
            "label": "Verify current competency and complete the required refresher or re-demonstration before assignment.",
            "correct": true,
            "rationale": "Correct — Verify current competency and complete the required refresher or re-demonstration before assignment."
          },
          {
            "id": "hrlf-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "hrlf-document-correct",
            "label": "Update the High-Risk Low-Freq competency record with the skill, method, date, evaluator, result, and authorization status.",
            "correct": true,
            "rationale": "Correct — Update the High-Risk Low-Freq competency record with the skill, method, date, evaluator, result, and authorization status."
          },
          {
            "id": "hrlf-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "May need more frequent validation or protocol review—follow current agency policy.",
          "meaning": "Skill decay may require just-in-time review or more frequent observed validation under agency policy.",
          "action": "Verify current competency and complete the required refresher or re-demonstration before assignment.",
          "notify": "Notify the clinical educator or supervisor about an overdue, missing, or conflicting competency status.",
          "document": "Update the High-Risk Low-Freq competency record with the skill, method, date, evaluator, result, and authorization status.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      },
      {
        "id": "record",
        "label": "Competency Record",
        "shortLabel": "Competency R…",
        "ariaLabel": "Investigate Competency Record",
        "x": 47,
        "y": 73,
        "zone": "authorized",
        "leftAnchorId": "kp-6-2",
        "observe": "Personnel file + electronic tracking. Review for accuracy; report discrepancies promptly.",
        "identifyChoices": [
          {
            "id": "record-identify-correct",
            "label": "An incomplete or conflicting record cannot reliably support independent assignment.",
            "correct": true,
            "rationale": "Correct — An incomplete or conflicting record cannot reliably support independent assignment."
          },
          {
            "id": "record-identify-quiz",
            "label": "Passing the knowledge quiz proves this practical skill is competent.",
            "correct": false,
            "rationale": "A quiz measures knowledge only; practical competency requires observed performance and authorized sign-off."
          }
        ],
        "decideChoices": [
          {
            "id": "record-decide-correct",
            "label": "Pause independent assignment for the disputed skill until the signed source and tracking record are reconciled.",
            "correct": true,
            "rationale": "Correct — Pause independent assignment for the disputed skill until the signed source and tracking record are reconciled."
          },
          {
            "id": "record-decide-self",
            "label": "Self-authorize independent performance after reviewing the lesson.",
            "correct": false,
            "rationale": "Lesson review and quiz completion never authorize practical performance."
          }
        ],
        "documentChoices": [
          {
            "id": "record-document-correct",
            "label": "Update the Competency Record competency record with the skill, method, date, evaluator, result, and authorization status.",
            "correct": true,
            "rationale": "Correct — Update the Competency Record competency record with the skill, method, date, evaluator, result, and authorization status."
          },
          {
            "id": "record-document-vague",
            "label": "Document only “competent” or “needs practice” without checklist evidence.",
            "correct": false,
            "rationale": "The record must preserve skill-specific observations, critical-step results, status, and signatures."
          }
        ],
        "feedback": {
          "observed": "Personnel file + electronic tracking. Review for accuracy; report discrepancies promptly.",
          "meaning": "An incomplete or conflicting record cannot reliably support independent assignment.",
          "action": "Pause independent assignment for the disputed skill until the signed source and tracking record are reconciled.",
          "notify": "Notify the clinical educator or supervisor about an overdue, missing, or conflicting competency status.",
          "document": "Update the Competency Record competency record with the skill, method, date, evaluator, result, and authorization status.",
          "policyRefs": [
            "HR-TD-003",
            "HR-TR-101"
          ]
        }
      }
    ]
  }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'You finished this LMS module’s knowledge quiz with a high score. What does that authorize you to do for a new wound-care skill not yet on your competency record?',
    options: [
      'A) Nothing independent yet — knowledge only; observed return demo and authorized sign-off are still required',
      'B) Perform the skill independently on any assigned patient immediately',
      'C) Skip return demonstration because the quiz score was ≥80%',
      'D) Modify the Plan of Care to add the wound treatment you prefer'
    ],
    correct: 0,
    rationale: 'The quiz validates knowledge (pyramid Level 1) only. Practical competency requires observed demonstration, checklist scoring, and authorized sign-off. LVNs also do not independently modify the Plan of Care.',
  },
  {
    id: 2,
    stem: 'Which California code section defines LVN scope of practice boundaries relevant to skills you may be checked off to perform?',
    options: [
      'A) B&P § 2725 (RN scope)',
      'B) B&P § 2859 (LVN scope)',
      'C) B&P § 2570 (occupational therapy)',
      'D) B&P § 2052 (practice of medicine)'
    ],
    correct: 1,
    rationale: 'California Business and Professions Code § 2859 addresses LVN scope. Other cited sections govern different professions and must not be used as LVN practice authority.',
  },
  {
    id: 3,
    stem: 'During a catheter-care check-off you omit two-identifier patient identification but complete every other step perfectly. The expected result is:',
    options: [
      'A) Verbal warning only with a pass',
      'B) Partial credit averaging to a pass',
      'C) Automatic non-passing evaluation because patient ID is a critical/zero-tolerance step',
      'D) Pass, since non-ID steps were excellent'
    ],
    correct: 2,
    rationale: 'Critical steps are zero-tolerance. Failure on any critical step—including patient identification—produces an automatic non-pass regardless of other performance.',
  },
  {
    id: 4,
    stem: 'Per Care Indeed agency policy (HR-TD-003), how many skills check-off attempts are allowed for a given skill before DON escalation/review?',
    options: [
      'A) 2 attempts',
      'B) 3 attempts',
      'C) 5 attempts',
      'D) Unlimited attempts without escalation'
    ],
    correct: 1,
    rationale: 'Agency policy HR-TD-003 allows a maximum of three attempts per skills check-off before DON escalation. This is agency policy, not a universal state statute.',
  },
  {
    id: 5,
    stem: 'Which item is a zero-tolerance critical step expected on essentially every clinical procedure check-off?',
    options: [
      'A) Checking room temperature before starting',
      'B) Counting all supplies aloud twice',
      'C) Documenting exact start time to the second',
      'D) Verifying patient identity with at least two identifiers'
    ],
    correct: 3,
    rationale: 'Two-identifier patient identification is a universal critical safety step. Environmental or administrative preferences are not substitutes for ID verification.',
  },
  {
    id: 6,
    stem: 'During a medication-administration check-off, which complete safety verification must the evaluator observe?',
    options: [
      'A) Patient, medication, dose, route, and time only',
      'B) Patient, medication, dose, route, time, documentation, and reason',
      'C) Medication label and route only because the order was already reviewed',
      'D) A passing medication quiz instead of an observed safety verification'
    ],
    correct: 1,
    rationale: 'The medication critical step requires all Seven Rights: patient, medication, dose, route, time, documentation, and reason. A quiz measures knowledge and never replaces observed practical validation.',
  },
  {
    id: 7,
    stem: 'Midway through a sterile dressing return demonstration you brush a sterile glove against a non-sterile bedrail. What should you do?',
    options: [
      'A) Continue and hope the evaluator did not notice',
      'B) Ask the evaluator to complete the sterile portion for you',
      'C) Stop, re-glove, and replace contaminated supplies before continuing',
      'D) Finish the dressing then mention the break afterward only if asked'
    ],
    correct: 2,
    rationale: 'Recognizing and correcting a sterile technique break (re-glove/replace contaminated supplies) is required. Continuing without correction is unsafe and fails the critical step.',
  },
  {
    id: 8,
    stem: 'You are validated for vital signs and subcutaneous injections. A new patient requires indwelling catheter change and you have no catheter check-off on file. Correct action:',
    options: [
      'A) Proceed because any one clinical validation unlocks all nursing skills',
      'B) Do not perform the catheter skill independently — competency authorization is skill-specific; notify supervisor/educator',
      'C) Perform it once “carefully” then request check-off later',
      'D) Change the order to a skill you already have validated'
    ],
    correct: 1,
    rationale: 'Authorization is skill-specific. Missing competency means stop/escalate—not improvise, not alter orders, not assume universal privileges from other skills.',
  },
  {
    id: 9,
    stem: 'What is the evaluator’s primary role during the formal return-demonstration check-off?',
    options: [
      'A) Help you complete difficult steps so you pass',
      'B) Provide continuous real-time coaching throughout',
      'C) Observe without prompting or assisting unless safety is at immediate risk, scoring against the checklist',
      'D) Grade on a curve based on years of experience'
    ],
    correct: 2,
    rationale: 'Formal check-off is an observation against a standardized checklist. Coaching/assistance mid-procedure is not the evaluator role except for immediate safety intervention.',
  },
  {
    id: 10,
    stem: 'Where is your official competency validation record maintained after a successful skills check-off?',
    options: [
      'A) Only in your personal notebook at home',
      'B) Only on the evaluator’s personal desk clipboard',
      'C) Only at the state Board with no agency copy',
      'D) In your personnel file and the agency electronic competency tracking system'
    ],
    correct: 3,
    rationale: 'Competency records are maintained in the personnel file and electronic tracking system for survey readiness and assignment decisions. Personal or informal copies are not the system of record.',
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
  .lvn002-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:11px}
  .lvn002-stage{border-radius:10px}
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
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:104px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px}.lvn002-tab{min-height:38px;padding:6px 9px;font-size:11px}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:44px;height:44px;min-width:44px;min-height:44px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:nowrap}.lvn002-bot button.next{max-width:118px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}
}
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


const STORAGE_KEY = 'lvn-012-progress-v550-pass5';

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

export default function LVN012() {
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
          <img
            src="/assets/navigation/logo-careindeed-orange.png"
            alt="Care Indeed"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }}
          />
          <span className="brand-text">LVN-012 — Skills Check-Off</span>
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
