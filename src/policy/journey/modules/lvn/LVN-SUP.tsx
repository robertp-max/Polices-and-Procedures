/**
 * LVN-SUP — Field Capstone
 * Pass 5 | Observe → Identify → Decide → Document → Feedback → Complete
 * Knowledge and simulation completion do not grant practical competency.
 */
import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-sup/lesson-01-field-entry.png';
import img02 from './assets/lvn-sup/lesson-02-preceptor.png';
import img03 from './assets/lvn-sup/lesson-03-visit-structure.png';
import img04 from './assets/lvn-sup/lesson-04-observe.png';
import img05 from './assets/lvn-sup/lesson-05-lead-care.png';
import img06 from './assets/lvn-sup/lesson-06-debrief.png';
import img07 from './assets/lvn-sup/lesson-07-practice.png';


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
  sourceLabels: { kind: string; text: string }[]; sceneImage: string; imageAlt: string; hotspots: Hotspot[];
}
interface QuizQuestion { id: number; stem: string; options: string[]; correct: number; rationale: string; }

const ZONE: Record<ZoneKind, { label: string; color: string; soft: string }> = {
  authorized: { label: 'Authorized', color: CI.teal, soft: CI.tealSoft },
  conditional: { label: 'Conditional', color: CI.orange, soft: '#FFF3EC' },
  prohibited: { label: 'Prohibited', color: CI.red, soft: '#FEF2F2' },
  neutral: { label: 'Guidance', color: CI.muted, soft: '#F1F5F9' },
};

const MODULE_META = { id: 'LVN-SUP', title: 'Field Capstone', pages: 7, quizCount: 10, passing: 80 };

const PAGES: PageData[] = [
  {
    "id": 0,
    "shortName": "Field Entry",
    "title": "Field Capstone Entry",
    "subtitle": "Preceptor demonstration begins the field evidence pathway",
    "narration": [
      "LVN-SUP is the field capstone. The learner applies prior instruction during patient visits while an assigned preceptor remains accountable for supervision, teaching, observation, and patient safety.",
      "The capstone begins with a preceptor demonstration and advances only through documented field evidence. Completion of an online quiz or simulation verifies knowledge or practice; it does not grant competency or permission to practice independently.",
      "HR-TD-003 and applicable clinical supervision policies govern preparation, observation, coached performance, evaluation, remediation, and the final field-sign-off boundary."
    ],
    "keyPoints": [
      {
        "icon": "🛡️",
        "title": "Preceptor Accountability",
        "detail": "The assigned preceptor maintains patient-safety oversight and intervenes whenever risk, uncertainty, or scope requires it."
      },
      {
        "icon": "👀",
        "title": "Demonstration Before Lead",
        "detail": "The learner first sees expected visit flow, safety checks, communication, and documentation modeled in the field."
      },
      {
        "icon": "🧭",
        "title": "Evidence-Based Progression",
        "detail": "Movement from observing to leading depends on directly observed performance, not elapsed time or confidence alone."
      },
      {
        "icon": "🚧",
        "title": "Field Sign-Off Boundary",
        "detail": "Quiz or simulation completion never substitutes for the authorized final field evaluation and disposition."
      }
    ],
    "clinicalTip": "Tell the preceptor immediately when the plan, patient status, home conditions, or your readiness creates uncertainty.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img01,
    "imageAlt": "RN preceptor demonstrating a home-health visit setup while an LVN learner observes with a field bag and blank tablet.",
    "hotspots": [
      {
        "id": "field-accountability",
        "label": "Preceptor accountability",
        "shortLabel": "Accountability",
        "ariaLabel": "Investigate Preceptor accountability",
        "x": 18,
        "y": 22,
        "zone": "authorized",
        "leftAnchorId": "kp-0-0",
        "observe": "The assigned preceptor is present, watches for risk, and remains responsible for the supervised learning encounter.",
        "identifyChoices": [
          {
            "id": "field-accountability-identify-correct",
            "label": "Preceptor accountability continues throughout the capstone; the learner is not self-cleared.",
            "correct": true,
            "rationale": "Correct. Preceptor accountability continues throughout the capstone; the learner is not self-cleared."
          },
          {
            "id": "field-accountability-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor accountability without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "field-accountability-decide-correct",
            "label": "Confirm roles, intervention signals, scope limits, and the supervision plan before patient care begins.",
            "correct": true,
            "rationale": "Correct. Confirm roles, intervention signals, scope limits, and the supervision plan before patient care begins."
          },
          {
            "id": "field-accountability-decide-bypass",
            "label": "Treat preceptor accountability as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "field-accountability-document-correct",
            "label": "Record the assigned preceptor, visit context, observed activities, interventions, and follow-up required.",
            "correct": true,
            "rationale": "Correct. Record the assigned preceptor, visit context, observed activities, interventions, and follow-up required."
          },
          {
            "id": "field-accountability-document-quiz-only",
            "label": "Record preceptor accountability as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The assigned preceptor is present, watches for risk, and remains responsible for the supervised learning encounter.",
          "meaning": "Preceptor accountability continues throughout the capstone; the learner is not self-cleared.",
          "action": "Confirm roles, intervention signals, scope limits, and the supervision plan before patient care begins.",
          "notify": "Notify the assigned preceptor immediately about uncertainty, unexpected findings, or a potential safety issue.",
          "document": "Record the assigned preceptor, visit context, observed activities, interventions, and follow-up required.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "field-demonstration",
        "label": "Preceptor demonstration",
        "shortLabel": "Demonstration",
        "ariaLabel": "Investigate Preceptor demonstration",
        "x": 50,
        "y": 48,
        "zone": "authorized",
        "leftAnchorId": "kp-0-1",
        "observe": "The preceptor models the expected visit sequence, safety practices, patient communication, and documentation approach.",
        "identifyChoices": [
          {
            "id": "field-demonstration-identify-correct",
            "label": "Demonstration establishes the field standard the learner must later reproduce under direct observation.",
            "correct": true,
            "rationale": "Correct. Demonstration establishes the field standard the learner must later reproduce under direct observation."
          },
          {
            "id": "field-demonstration-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor demonstration without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "field-demonstration-decide-correct",
            "label": "Observe the full demonstration, take focused notes, and ask for the reasoning behind critical decisions.",
            "correct": true,
            "rationale": "Correct. Observe the full demonstration, take focused notes, and ask for the reasoning behind critical decisions."
          },
          {
            "id": "field-demonstration-decide-bypass",
            "label": "Treat preceptor demonstration as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "field-demonstration-document-correct",
            "label": "Record the demonstrated activities and the learner questions or practice needs identified.",
            "correct": true,
            "rationale": "Correct. Record the demonstrated activities and the learner questions or practice needs identified."
          },
          {
            "id": "field-demonstration-document-quiz-only",
            "label": "Record preceptor demonstration as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor models the expected visit sequence, safety practices, patient communication, and documentation approach.",
          "meaning": "Demonstration establishes the field standard the learner must later reproduce under direct observation.",
          "action": "Observe the full demonstration, take focused notes, and ask for the reasoning behind critical decisions.",
          "notify": "Ask the preceptor to clarify any step, rationale, or scope boundary before attempting it.",
          "document": "Record the demonstrated activities and the learner questions or practice needs identified.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "field-progression",
        "label": "Field evidence progression",
        "shortLabel": "Progression",
        "ariaLabel": "Investigate Field evidence progression",
        "x": 82,
        "y": 28,
        "zone": "conditional",
        "leftAnchorId": "kp-0-2",
        "observe": "The learning plan shows observation, coached performance, learner-led care under direct observation, and evaluation.",
        "identifyChoices": [
          {
            "id": "field-progression-identify-correct",
            "label": "Progression depends on performance evidence at each field phase rather than attendance alone.",
            "correct": true,
            "rationale": "Correct. Progression depends on performance evidence at each field phase rather than attendance alone."
          },
          {
            "id": "field-progression-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete field evidence progression without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "field-progression-decide-correct",
            "label": "Advance only when the preceptor determines that the next level can be attempted safely under the required supervision.",
            "correct": true,
            "rationale": "Correct. Advance only when the preceptor determines that the next level can be attempted safely under the required supervision."
          },
          {
            "id": "field-progression-decide-bypass",
            "label": "Treat field evidence progression as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "field-progression-document-correct",
            "label": "Record the phase attempted, level of prompting, patient-safety events, and next supervised step.",
            "correct": true,
            "rationale": "Correct. Record the phase attempted, level of prompting, patient-safety events, and next supervised step."
          },
          {
            "id": "field-progression-document-quiz-only",
            "label": "Record field evidence progression as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learning plan shows observation, coached performance, learner-led care under direct observation, and evaluation.",
          "meaning": "Progression depends on performance evidence at each field phase rather than attendance alone.",
          "action": "Advance only when the preceptor determines that the next level can be attempted safely under the required supervision.",
          "notify": "Notify the preceptor and educator or designated clinical leader when progress stalls or the plan needs adjustment.",
          "document": "Record the phase attempted, level of prompting, patient-safety events, and next supervised step.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "field-boundary",
        "label": "Quiz and simulation boundary",
        "shortLabel": "No self-clear",
        "ariaLabel": "Investigate Quiz and simulation boundary",
        "x": 70,
        "y": 72,
        "zone": "prohibited",
        "leftAnchorId": "kp-0-3",
        "observe": "The learner has completed digital practice but has not yet received authorized final field sign-off.",
        "identifyChoices": [
          {
            "id": "field-boundary-identify-correct",
            "label": "Knowledge and simulation results do not establish patient-care competency or independent field authorization.",
            "correct": true,
            "rationale": "Correct. Knowledge and simulation results do not establish patient-care competency or independent field authorization."
          },
          {
            "id": "field-boundary-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete quiz and simulation boundary without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "field-boundary-decide-correct",
            "label": "Continue supervised field practice until directly observed criteria are met and an authorized final disposition is documented.",
            "correct": true,
            "rationale": "Correct. Continue supervised field practice until directly observed criteria are met and an authorized final disposition is documented."
          },
          {
            "id": "field-boundary-decide-bypass",
            "label": "Treat quiz and simulation boundary as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "field-boundary-document-correct",
            "label": "Record digital completion separately from field evaluation; never document it as practical competency.",
            "correct": true,
            "rationale": "Correct. Record digital completion separately from field evaluation; never document it as practical competency."
          },
          {
            "id": "field-boundary-document-quiz-only",
            "label": "Record quiz and simulation boundary as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner has completed digital practice but has not yet received authorized final field sign-off.",
          "meaning": "Knowledge and simulation results do not establish patient-care competency or independent field authorization.",
          "action": "Continue supervised field practice until directly observed criteria are met and an authorized final disposition is documented.",
          "notify": "Notify the preceptor or designated clinical leader if an assignment is offered before field clearance.",
          "document": "Record digital completion separately from field evaluation; never document it as practical competency.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 1,
    "shortName": "Preceptor",
    "title": "Preceptor Accountability",
    "subtitle": "Demonstrate, supervise, coach, evaluate, and protect the patient",
    "narration": [
      "The preceptor sets expectations before the visit, demonstrates safe practice when needed, observes the learner directly, and intervenes without delay when patient safety or scope is at risk.",
      "Accountability includes specific coaching, documentation of observed behavior, separation of prompted from independent performance, and communication of unresolved gaps through the agency pathway.",
      "The learner must arrive prepared, disclose limits, request help early, accept coaching, and avoid representing supervised work as independently validated."
    ],
    "keyPoints": [
      {
        "icon": "📣",
        "title": "Set Expectations",
        "detail": "Before entry, define learner duties, preceptor duties, stop signals, escalation routes, and the target level of participation."
      },
      {
        "icon": "🧑‍⚕️",
        "title": "Model Safe Practice",
        "detail": "The preceptor demonstrates unfamiliar or critical steps and explains the clinical reasoning behind them."
      },
      {
        "icon": "✋",
        "title": "Intervene for Safety",
        "detail": "Direct observation never prevents immediate intervention when the patient, scope, or care plan could be compromised."
      },
      {
        "icon": "📝",
        "title": "Document What Occurred",
        "detail": "Evaluation identifies what was independent, prompted, demonstrated, incomplete, or assigned for remediation."
      }
    ],
    "clinicalTip": "Asking for help is evidence of safe judgment; hiding uncertainty is not.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img02,
    "imageAlt": "RN preceptor and LVN learner reviewing a blank assignment folder, visit supplies, and safety expectations before a home visit.",
    "hotspots": [
      {
        "id": "preceptor-expectations",
        "label": "Preceptor role agreement",
        "shortLabel": "Role agreement",
        "ariaLabel": "Investigate Preceptor role agreement",
        "x": 20,
        "y": 30,
        "zone": "authorized",
        "leftAnchorId": "kp-1-0",
        "observe": "Preceptor and learner review who will lead, what will be observed, and how the preceptor will signal a pause.",
        "identifyChoices": [
          {
            "id": "preceptor-expectations-identify-correct",
            "label": "A clear role agreement makes accountability visible before the patient encounter.",
            "correct": true,
            "rationale": "Correct. A clear role agreement makes accountability visible before the patient encounter."
          },
          {
            "id": "preceptor-expectations-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor role agreement without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "preceptor-expectations-decide-correct",
            "label": "State the planned participation level, limits, safety stop signal, and escalation route before entering the home.",
            "correct": true,
            "rationale": "Correct. State the planned participation level, limits, safety stop signal, and escalation route before entering the home."
          },
          {
            "id": "preceptor-expectations-decide-bypass",
            "label": "Treat preceptor role agreement as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "preceptor-expectations-document-correct",
            "label": "Record the assigned preceptor, planned learner role, target activities, and agreed safety limits.",
            "correct": true,
            "rationale": "Correct. Record the assigned preceptor, planned learner role, target activities, and agreed safety limits."
          },
          {
            "id": "preceptor-expectations-document-quiz-only",
            "label": "Record preceptor role agreement as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "Preceptor and learner review who will lead, what will be observed, and how the preceptor will signal a pause.",
          "meaning": "A clear role agreement makes accountability visible before the patient encounter.",
          "action": "State the planned participation level, limits, safety stop signal, and escalation route before entering the home.",
          "notify": "Notify the designated clinical leader if an assigned preceptor or supervision plan is unavailable.",
          "document": "Record the assigned preceptor, planned learner role, target activities, and agreed safety limits.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "preceptor-model",
        "label": "Preceptor demonstration duty",
        "shortLabel": "Model care",
        "ariaLabel": "Investigate Preceptor demonstration duty",
        "x": 48,
        "y": 55,
        "zone": "authorized",
        "leftAnchorId": "kp-1-1",
        "observe": "The preceptor demonstrates a step when the learner has not yet seen it performed safely in the home setting.",
        "identifyChoices": [
          {
            "id": "preceptor-model-identify-correct",
            "label": "Demonstration is an accountable teaching action, not evidence that the learner performed the skill.",
            "correct": true,
            "rationale": "Correct. Demonstration is an accountable teaching action, not evidence that the learner performed the skill."
          },
          {
            "id": "preceptor-model-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor demonstration duty without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "preceptor-model-decide-correct",
            "label": "Observe the model, ask questions, and repeat the reasoning before attempting coached performance.",
            "correct": true,
            "rationale": "Correct. Observe the model, ask questions, and repeat the reasoning before attempting coached performance."
          },
          {
            "id": "preceptor-model-decide-bypass",
            "label": "Treat preceptor demonstration duty as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "preceptor-model-document-correct",
            "label": "Record who demonstrated, what was shown, and which step remains for learner performance under observation.",
            "correct": true,
            "rationale": "Correct. Record who demonstrated, what was shown, and which step remains for learner performance under observation."
          },
          {
            "id": "preceptor-model-document-quiz-only",
            "label": "Record preceptor demonstration duty as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor demonstrates a step when the learner has not yet seen it performed safely in the home setting.",
          "meaning": "Demonstration is an accountable teaching action, not evidence that the learner performed the skill.",
          "action": "Observe the model, ask questions, and repeat the reasoning before attempting coached performance.",
          "notify": "Tell the preceptor when more demonstration is needed before learner performance.",
          "document": "Record who demonstrated, what was shown, and which step remains for learner performance under observation.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "preceptor-intervene",
        "label": "Safety intervention duty",
        "shortLabel": "Intervene",
        "ariaLabel": "Investigate Safety intervention duty",
        "x": 78,
        "y": 32,
        "zone": "prohibited",
        "leftAnchorId": "kp-1-2",
        "observe": "A deviation creates risk and the preceptor moves from observation to immediate intervention.",
        "identifyChoices": [
          {
            "id": "preceptor-intervene-identify-correct",
            "label": "Patient safety overrides an uninterrupted learner performance attempt.",
            "correct": true,
            "rationale": "Correct. Patient safety overrides an uninterrupted learner performance attempt."
          },
          {
            "id": "preceptor-intervene-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete safety intervention duty without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "preceptor-intervene-decide-correct",
            "label": "Stop the unsafe action, protect the patient, clarify the correct method, and decide whether the attempt can resume.",
            "correct": true,
            "rationale": "Correct. Stop the unsafe action, protect the patient, clarify the correct method, and decide whether the attempt can resume."
          },
          {
            "id": "preceptor-intervene-decide-bypass",
            "label": "Treat safety intervention duty as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "preceptor-intervene-document-correct",
            "label": "Record the objective deviation, intervention, patient response, notifications, and remediation decision.",
            "correct": true,
            "rationale": "Correct. Record the objective deviation, intervention, patient response, notifications, and remediation decision."
          },
          {
            "id": "preceptor-intervene-document-quiz-only",
            "label": "Record safety intervention duty as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "A deviation creates risk and the preceptor moves from observation to immediate intervention.",
          "meaning": "Patient safety overrides an uninterrupted learner performance attempt.",
          "action": "Stop the unsafe action, protect the patient, clarify the correct method, and decide whether the attempt can resume.",
          "notify": "Notify the supervising RN or designated clinical leader according to urgency and agency process.",
          "document": "Record the objective deviation, intervention, patient response, notifications, and remediation decision.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "preceptor-evidence",
        "label": "Accountable evaluation record",
        "shortLabel": "Evaluation",
        "ariaLabel": "Investigate Accountable evaluation record",
        "x": 65,
        "y": 75,
        "zone": "conditional",
        "leftAnchorId": "kp-1-3",
        "observe": "The preceptor separates independent actions from prompts, demonstrations, corrections, and incomplete steps.",
        "identifyChoices": [
          {
            "id": "preceptor-evidence-identify-correct",
            "label": "Accurate field evidence prevents prompted work from being misclassified as independent competency.",
            "correct": true,
            "rationale": "Correct. Accurate field evidence prevents prompted work from being misclassified as independent competency."
          },
          {
            "id": "preceptor-evidence-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete accountable evaluation record without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "preceptor-evidence-decide-correct",
            "label": "Complete an objective evaluation and identify the next supervised goal or remediation step.",
            "correct": true,
            "rationale": "Correct. Complete an objective evaluation and identify the next supervised goal or remediation step."
          },
          {
            "id": "preceptor-evidence-decide-bypass",
            "label": "Treat accountable evaluation record as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "preceptor-evidence-document-correct",
            "label": "Record observable behavior, assistance level, feedback, learner response, and planned follow-up.",
            "correct": true,
            "rationale": "Correct. Record observable behavior, assistance level, feedback, learner response, and planned follow-up."
          },
          {
            "id": "preceptor-evidence-document-quiz-only",
            "label": "Record accountable evaluation record as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor separates independent actions from prompts, demonstrations, corrections, and incomplete steps.",
          "meaning": "Accurate field evidence prevents prompted work from being misclassified as independent competency.",
          "action": "Complete an objective evaluation and identify the next supervised goal or remediation step.",
          "notify": "Share unresolved or repeated gaps with the educator or designated clinical leader through the agency pathway.",
          "document": "Record observable behavior, assistance level, feedback, learner response, and planned follow-up.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 2,
    "shortName": "Preparation",
    "title": "Pre-Visit Preparation",
    "subtitle": "Chart, orders, supplies, logistics, risks, and learner plan",
    "narration": [
      "Preparation occurs before patient contact. The learner reviews current care information and instructions, confirms visit logistics, gathers ordered supplies, and identifies safety or scope questions for the preceptor.",
      "The learner gives a concise pre-visit briefing: planned sequence, expected interventions, patient-specific risks, required equipment, and conditions that would trigger a stop or escalation.",
      "A simulated plan may support practice, but only the preceptor can observe whether the learner consistently prepares for actual assigned visits."
    ],
    "keyPoints": [
      {
        "icon": "📂",
        "title": "Review Current Information",
        "detail": "Use the current plan, orders, recent notes, medications, alerts, and precautions available for the assigned visit."
      },
      {
        "icon": "👜",
        "title": "Match Supplies to Care",
        "detail": "Gather ordered supplies and safety equipment; identify missing, expired, or unsuitable items before departure."
      },
      {
        "icon": "📍",
        "title": "Confirm Visit Logistics",
        "detail": "Verify the assigned patient, address, schedule, access instructions, and communication plan without exposing protected information."
      },
      {
        "icon": "🗣️",
        "title": "Brief the Preceptor",
        "detail": "Explain the visit sequence, likely risks, scope questions, and escalation triggers before entering the home."
      }
    ],
    "clinicalTip": "A good pre-visit briefing states both the plan and the conditions that would make you stop.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img03,
    "imageAlt": "LVN learner preparing for a home visit by reviewing a blank tablet with the RN preceptor beside organized clinical supplies.",
    "hotspots": [
      {
        "id": "prep-chart",
        "label": "Current chart and order review",
        "shortLabel": "Chart review",
        "ariaLabel": "Investigate Current chart and order review",
        "x": 18,
        "y": 40,
        "zone": "authorized",
        "leftAnchorId": "kp-2-0",
        "observe": "The learner reviews the current care plan, orders, recent notes, medications, alerts, and precautions with the preceptor.",
        "identifyChoices": [
          {
            "id": "prep-chart-identify-correct",
            "label": "Accurate preparation starts with current patient-specific information rather than memory or an old routine.",
            "correct": true,
            "rationale": "Correct. Accurate preparation starts with current patient-specific information rather than memory or an old routine."
          },
          {
            "id": "prep-chart-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete current chart and order review without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "prep-chart-decide-correct",
            "label": "Summarize the ordered visit purpose, relevant changes, precautions, and questions before travel.",
            "correct": true,
            "rationale": "Correct. Summarize the ordered visit purpose, relevant changes, precautions, and questions before travel."
          },
          {
            "id": "prep-chart-decide-bypass",
            "label": "Treat current chart and order review as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "prep-chart-document-correct",
            "label": "Record the preparation review and any discrepancy, clarification, or preceptor direction.",
            "correct": true,
            "rationale": "Correct. Record the preparation review and any discrepancy, clarification, or preceptor direction."
          },
          {
            "id": "prep-chart-document-quiz-only",
            "label": "Record current chart and order review as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner reviews the current care plan, orders, recent notes, medications, alerts, and precautions with the preceptor.",
          "meaning": "Accurate preparation starts with current patient-specific information rather than memory or an old routine.",
          "action": "Summarize the ordered visit purpose, relevant changes, precautions, and questions before travel.",
          "notify": "Bring discrepancies, missing information, or scope questions to the preceptor before patient contact.",
          "document": "Record the preparation review and any discrepancy, clarification, or preceptor direction.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "prep-supplies",
        "label": "Ordered supply readiness",
        "shortLabel": "Supply check",
        "ariaLabel": "Investigate Ordered supply readiness",
        "x": 50,
        "y": 28,
        "zone": "conditional",
        "leftAnchorId": "kp-2-1",
        "observe": "The learner matches available supplies and equipment to the planned interventions and safety needs.",
        "identifyChoices": [
          {
            "id": "prep-supplies-identify-correct",
            "label": "Missing or unsuitable supplies can make a planned intervention unsafe or unauthorized to begin.",
            "correct": true,
            "rationale": "Correct. Missing or unsuitable supplies can make a planned intervention unsafe or unauthorized to begin."
          },
          {
            "id": "prep-supplies-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete ordered supply readiness without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "prep-supplies-decide-correct",
            "label": "Verify quantity, integrity, suitability, and transport readiness; resolve gaps before the visit.",
            "correct": true,
            "rationale": "Correct. Verify quantity, integrity, suitability, and transport readiness; resolve gaps before the visit."
          },
          {
            "id": "prep-supplies-decide-bypass",
            "label": "Treat ordered supply readiness as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "prep-supplies-document-correct",
            "label": "Record the supply issue, person notified, direction received, and resulting visit-plan change.",
            "correct": true,
            "rationale": "Correct. Record the supply issue, person notified, direction received, and resulting visit-plan change."
          },
          {
            "id": "prep-supplies-document-quiz-only",
            "label": "Record ordered supply readiness as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner matches available supplies and equipment to the planned interventions and safety needs.",
          "meaning": "Missing or unsuitable supplies can make a planned intervention unsafe or unauthorized to begin.",
          "action": "Verify quantity, integrity, suitability, and transport readiness; resolve gaps before the visit.",
          "notify": "Notify the preceptor immediately when a needed item is missing, damaged, expired, or inconsistent with the plan.",
          "document": "Record the supply issue, person notified, direction received, and resulting visit-plan change.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "prep-logistics",
        "label": "Patient and visit logistics",
        "shortLabel": "Logistics",
        "ariaLabel": "Investigate Patient and visit logistics",
        "x": 82,
        "y": 40,
        "zone": "authorized",
        "leftAnchorId": "kp-2-2",
        "observe": "The learner verifies the correct assignment, address, time, access instructions, and contact route.",
        "identifyChoices": [
          {
            "id": "prep-logistics-identify-correct",
            "label": "Logistics verification supports correct-patient care, timeliness, privacy, and a safe arrival plan.",
            "correct": true,
            "rationale": "Correct. Logistics verification supports correct-patient care, timeliness, privacy, and a safe arrival plan."
          },
          {
            "id": "prep-logistics-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete patient and visit logistics without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "prep-logistics-decide-correct",
            "label": "Confirm assignment details through approved sources and protect patient information during travel.",
            "correct": true,
            "rationale": "Correct. Confirm assignment details through approved sources and protect patient information during travel."
          },
          {
            "id": "prep-logistics-decide-bypass",
            "label": "Treat patient and visit logistics as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "prep-logistics-document-correct",
            "label": "Record the mismatch, verification steps, notifications, and confirmed disposition.",
            "correct": true,
            "rationale": "Correct. Record the mismatch, verification steps, notifications, and confirmed disposition."
          },
          {
            "id": "prep-logistics-document-quiz-only",
            "label": "Record patient and visit logistics as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner verifies the correct assignment, address, time, access instructions, and contact route.",
          "meaning": "Logistics verification supports correct-patient care, timeliness, privacy, and a safe arrival plan.",
          "action": "Confirm assignment details through approved sources and protect patient information during travel.",
          "notify": "Escalate an identity, address, access, or scheduling mismatch before proceeding.",
          "document": "Record the mismatch, verification steps, notifications, and confirmed disposition.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "prep-brief",
        "label": "Pre-visit clinical briefing",
        "shortLabel": "Brief plan",
        "ariaLabel": "Investigate Pre-visit clinical briefing",
        "x": 50,
        "y": 72,
        "zone": "authorized",
        "leftAnchorId": "kp-2-3",
        "observe": "The learner explains the intended sequence, patient-specific risks, scope limits, and escalation triggers to the preceptor.",
        "identifyChoices": [
          {
            "id": "prep-brief-identify-correct",
            "label": "The briefing lets the preceptor evaluate clinical preparation and calibrate the needed level of support.",
            "correct": true,
            "rationale": "Correct. The briefing lets the preceptor evaluate clinical preparation and calibrate the needed level of support."
          },
          {
            "id": "prep-brief-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete pre-visit clinical briefing without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "prep-brief-decide-correct",
            "label": "Present the plan, invite correction, and revise it before entering the home.",
            "correct": true,
            "rationale": "Correct. Present the plan, invite correction, and revise it before entering the home."
          },
          {
            "id": "prep-brief-decide-bypass",
            "label": "Treat pre-visit clinical briefing as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "prep-brief-document-correct",
            "label": "Record the agreed learner role, preparation gaps, corrections, and supervised goals for the visit.",
            "correct": true,
            "rationale": "Correct. Record the agreed learner role, preparation gaps, corrections, and supervised goals for the visit."
          },
          {
            "id": "prep-brief-document-quiz-only",
            "label": "Record pre-visit clinical briefing as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner explains the intended sequence, patient-specific risks, scope limits, and escalation triggers to the preceptor.",
          "meaning": "The briefing lets the preceptor evaluate clinical preparation and calibrate the needed level of support.",
          "action": "Present the plan, invite correction, and revise it before entering the home.",
          "notify": "Ask the preceptor to resolve uncertainty about role, order, procedure, or escalation threshold.",
          "document": "Record the agreed learner role, preparation gaps, corrections, and supervised goals for the visit.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 3,
    "shortName": "Observation",
    "title": "Observation Phase",
    "subtitle": "Watch the preceptor demonstration and identify the reasoning behind it",
    "narration": [
      "During observation, the preceptor leads while the learner watches the complete visit workflow: preparation-to-departure sequence, patient identification, safety controls, communication, clinical reasoning, and documentation.",
      "Observation is active. The learner notes why the preceptor chose an action, when escalation occurred, and how care was adapted to the home without departing from the authorized plan.",
      "The learner then explains the sequence and critical decisions back to the preceptor. Observation alone does not grant competency; it prepares the learner for guided performance."
    ],
    "keyPoints": [
      {
        "icon": "👁️",
        "title": "Observe the Full Workflow",
        "detail": "Watch arrival, identification, assessment, ordered care, education, safety checks, documentation, and departure planning."
      },
      {
        "icon": "🧠",
        "title": "Track Clinical Reasoning",
        "detail": "Identify what finding drove each decision, what limit applied, and when the preceptor escalated."
      },
      {
        "icon": "🏠",
        "title": "Notice Home Adaptation",
        "detail": "Observe how positioning and supplies are adapted while preserving infection control, privacy, and the care plan."
      },
      {
        "icon": "🔁",
        "title": "Teach Back the Sequence",
        "detail": "After the visit, explain the workflow, safety gates, and decisions before moving to coached performance."
      }
    ],
    "clinicalTip": "Do not imitate a step you do not understand; ask the preceptor to explain the decision point.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img04,
    "imageAlt": "LVN learner observing an RN preceptor demonstrate patient assessment and communication in a home-health setting.",
    "hotspots": [
      {
        "id": "observe-flow",
        "label": "Preceptor-led visit flow",
        "shortLabel": "Visit flow",
        "ariaLabel": "Investigate Preceptor-led visit flow",
        "x": 22,
        "y": 30,
        "zone": "authorized",
        "leftAnchorId": "kp-3-0",
        "observe": "The preceptor leads the complete visit while the learner observes the sequence and patient-safety checks.",
        "identifyChoices": [
          {
            "id": "observe-flow-identify-correct",
            "label": "The observation phase establishes a real field model before the learner assumes care tasks.",
            "correct": true,
            "rationale": "Correct. The observation phase establishes a real field model before the learner assumes care tasks."
          },
          {
            "id": "observe-flow-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor-led visit flow without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "observe-flow-decide-correct",
            "label": "Watch without disrupting care, note the sequence, and identify each safety gate.",
            "correct": true,
            "rationale": "Correct. Watch without disrupting care, note the sequence, and identify each safety gate."
          },
          {
            "id": "observe-flow-decide-bypass",
            "label": "Treat preceptor-led visit flow as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "observe-flow-document-correct",
            "label": "Record the workflow observed and the steps requiring further explanation or demonstration.",
            "correct": true,
            "rationale": "Correct. Record the workflow observed and the steps requiring further explanation or demonstration."
          },
          {
            "id": "observe-flow-document-quiz-only",
            "label": "Record preceptor-led visit flow as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor leads the complete visit while the learner observes the sequence and patient-safety checks.",
          "meaning": "The observation phase establishes a real field model before the learner assumes care tasks.",
          "action": "Watch without disrupting care, note the sequence, and identify each safety gate.",
          "notify": "Ask the preceptor after an urgent moment or at the agreed pause point when a step is unclear.",
          "document": "Record the workflow observed and the steps requiring further explanation or demonstration.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "observe-reasoning",
        "label": "Observed clinical reasoning",
        "shortLabel": "Reasoning",
        "ariaLabel": "Investigate Observed clinical reasoning",
        "x": 50,
        "y": 22,
        "zone": "authorized",
        "leftAnchorId": "kp-3-1",
        "observe": "The learner connects patient findings with the preceptor decision to proceed, pause, adapt, or escalate.",
        "identifyChoices": [
          {
            "id": "observe-reasoning-identify-correct",
            "label": "Field observation must capture why a decision was made, not only which task occurred.",
            "correct": true,
            "rationale": "Correct. Field observation must capture why a decision was made, not only which task occurred."
          },
          {
            "id": "observe-reasoning-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete observed clinical reasoning without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "observe-reasoning-decide-correct",
            "label": "State the finding-to-action link during debrief and correct any misunderstood rationale.",
            "correct": true,
            "rationale": "Correct. State the finding-to-action link during debrief and correct any misunderstood rationale."
          },
          {
            "id": "observe-reasoning-decide-bypass",
            "label": "Treat observed clinical reasoning as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "observe-reasoning-document-correct",
            "label": "Record the reasoning discussed, learner interpretation, correction, and next learning goal.",
            "correct": true,
            "rationale": "Correct. Record the reasoning discussed, learner interpretation, correction, and next learning goal."
          },
          {
            "id": "observe-reasoning-document-quiz-only",
            "label": "Record observed clinical reasoning as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner connects patient findings with the preceptor decision to proceed, pause, adapt, or escalate.",
          "meaning": "Field observation must capture why a decision was made, not only which task occurred.",
          "action": "State the finding-to-action link during debrief and correct any misunderstood rationale.",
          "notify": "Ask the preceptor to clarify any decision that appears inconsistent with the current plan or scope.",
          "document": "Record the reasoning discussed, learner interpretation, correction, and next learning goal.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "observe-adaptation",
        "label": "Observed home adaptation",
        "shortLabel": "Adaptation",
        "ariaLabel": "Investigate Observed home adaptation",
        "x": 78,
        "y": 30,
        "zone": "conditional",
        "leftAnchorId": "kp-3-2",
        "observe": "The preceptor adapts setup to the home while maintaining safety, privacy, and ordered care.",
        "identifyChoices": [
          {
            "id": "observe-adaptation-identify-correct",
            "label": "Home constraints require safe adaptation but do not authorize shortcuts or unapproved changes.",
            "correct": true,
            "rationale": "Correct. Home constraints require safe adaptation but do not authorize shortcuts or unapproved changes."
          },
          {
            "id": "observe-adaptation-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete observed home adaptation without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "observe-adaptation-decide-correct",
            "label": "Identify which adaptations preserved the standard and which condition would require a stop.",
            "correct": true,
            "rationale": "Correct. Identify which adaptations preserved the standard and which condition would require a stop."
          },
          {
            "id": "observe-adaptation-decide-bypass",
            "label": "Treat observed home adaptation as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "observe-adaptation-document-correct",
            "label": "Record the environmental issue, adaptation or stop decision, notifications, and patient impact.",
            "correct": true,
            "rationale": "Correct. Record the environmental issue, adaptation or stop decision, notifications, and patient impact."
          },
          {
            "id": "observe-adaptation-document-quiz-only",
            "label": "Record observed home adaptation as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor adapts setup to the home while maintaining safety, privacy, and ordered care.",
          "meaning": "Home constraints require safe adaptation but do not authorize shortcuts or unapproved changes.",
          "action": "Identify which adaptations preserved the standard and which condition would require a stop.",
          "notify": "Notify the preceptor immediately if the environment is unsafe or planned care cannot be performed as authorized.",
          "document": "Record the environmental issue, adaptation or stop decision, notifications, and patient impact.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "observe-teachback",
        "label": "Observation teach-back",
        "shortLabel": "Teach-back",
        "ariaLabel": "Investigate Observation teach-back",
        "x": 35,
        "y": 70,
        "zone": "authorized",
        "leftAnchorId": "kp-3-3",
        "observe": "The learner explains the visit sequence, critical decisions, and escalation points after observing the preceptor.",
        "identifyChoices": [
          {
            "id": "observe-teachback-identify-correct",
            "label": "Teach-back checks understanding before the learner begins guided performance.",
            "correct": true,
            "rationale": "Correct. Teach-back checks understanding before the learner begins guided performance."
          },
          {
            "id": "observe-teachback-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete observation teach-back without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "observe-teachback-decide-correct",
            "label": "Give a concise reconstruction; accept correction and request another demonstration when needed.",
            "correct": true,
            "rationale": "Correct. Give a concise reconstruction; accept correction and request another demonstration when needed."
          },
          {
            "id": "observe-teachback-decide-bypass",
            "label": "Treat observation teach-back as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "observe-teachback-document-correct",
            "label": "Record teach-back strengths, corrected misunderstandings, and the readiness decision for guided practice.",
            "correct": true,
            "rationale": "Correct. Record teach-back strengths, corrected misunderstandings, and the readiness decision for guided practice."
          },
          {
            "id": "observe-teachback-document-quiz-only",
            "label": "Record observation teach-back as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner explains the visit sequence, critical decisions, and escalation points after observing the preceptor.",
          "meaning": "Teach-back checks understanding before the learner begins guided performance.",
          "action": "Give a concise reconstruction; accept correction and request another demonstration when needed.",
          "notify": "Tell the preceptor when you cannot explain a critical step or are not ready to attempt it.",
          "document": "Record teach-back strengths, corrected misunderstandings, and the readiness decision for guided practice.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 4,
    "shortName": "Guided Lead",
    "title": "Guided Performance to Progressive Independence",
    "subtitle": "Coached tasks to learner-led care under direct observation",
    "narration": [
      "Guided performance begins when the learner performs selected tasks with the preceptor close enough to coach and intervene. Prompts, corrections, or repeated demonstration are expected supports and must be reflected in the evaluation.",
      "As performance becomes consistent, the learner assumes more of the visit. The learner eventually leads while the preceptor directly observes and remains ready to intervene.",
      "Leading under direct observation is not independent field authorization. A safety stop, repeated prompting, or unmet critical behavior triggers supervised practice or remediation."
    ],
    "keyPoints": [
      {
        "icon": "🤝",
        "title": "Coached Performance",
        "detail": "Perform selected tasks with real-time preceptor guidance, correction, or demonstration when needed."
      },
      {
        "icon": "📉",
        "title": "Reduce Prompting Deliberately",
        "detail": "Progress appears when safe performance becomes consistent with fewer prompts across actual visits."
      },
      {
        "icon": "🩺",
        "title": "Learner Leads Under Observation",
        "detail": "The learner coordinates the visit while the preceptor remains present, directly observing, and ready to intervene."
      },
      {
        "icon": "🧰",
        "title": "Remediate Before Advancing",
        "detail": "A critical miss or recurring gap leads to a specific practice plan and repeat observation, not self-clearance."
      }
    ],
    "clinicalTip": "Count a prompted step as prompted; honest assistance-level documentation protects patients and the learner.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img05,
    "imageAlt": "LVN learner leading patient care while an RN preceptor directly observes nearby and remains ready to coach or intervene.",
    "hotspots": [
      {
        "id": "guided-coaching",
        "label": "Guided coached performance",
        "shortLabel": "Coached task",
        "ariaLabel": "Investigate Guided coached performance",
        "x": 18,
        "y": 50,
        "zone": "conditional",
        "leftAnchorId": "kp-4-0",
        "observe": "The learner performs a selected task while the preceptor provides a prompt, correction, or brief demonstration.",
        "identifyChoices": [
          {
            "id": "guided-coaching-identify-correct",
            "label": "Coached performance builds skill but is not the same as unprompted field performance.",
            "correct": true,
            "rationale": "Correct. Coached performance builds skill but is not the same as unprompted field performance."
          },
          {
            "id": "guided-coaching-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete guided coached performance without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "guided-coaching-decide-correct",
            "label": "Follow the correction, protect the patient, and repeat the step under observation when appropriate.",
            "correct": true,
            "rationale": "Correct. Follow the correction, protect the patient, and repeat the step under observation when appropriate."
          },
          {
            "id": "guided-coaching-decide-bypass",
            "label": "Treat guided coached performance as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "guided-coaching-document-correct",
            "label": "Record the task, level of prompting, correction, patient response, and next supervised practice need.",
            "correct": true,
            "rationale": "Correct. Record the task, level of prompting, correction, patient response, and next supervised practice need."
          },
          {
            "id": "guided-coaching-document-quiz-only",
            "label": "Record guided coached performance as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner performs a selected task while the preceptor provides a prompt, correction, or brief demonstration.",
          "meaning": "Coached performance builds skill but is not the same as unprompted field performance.",
          "action": "Follow the correction, protect the patient, and repeat the step under observation when appropriate.",
          "notify": "Tell the preceptor immediately when you need help or cannot safely continue the task.",
          "document": "Record the task, level of prompting, correction, patient response, and next supervised practice need.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "guided-fading",
        "label": "Progressive reduction of prompts",
        "shortLabel": "Fewer prompts",
        "ariaLabel": "Investigate Progressive reduction of prompts",
        "x": 50,
        "y": 35,
        "zone": "authorized",
        "leftAnchorId": "kp-4-1",
        "observe": "Across field visits, the learner completes more of the workflow safely with fewer preceptor prompts.",
        "identifyChoices": [
          {
            "id": "guided-fading-identify-correct",
            "label": "Progressive independence is demonstrated by consistent field behavior, not one successful attempt.",
            "correct": true,
            "rationale": "Correct. Progressive independence is demonstrated by consistent field behavior, not one successful attempt."
          },
          {
            "id": "guided-fading-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete progressive reduction of prompts without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "guided-fading-decide-correct",
            "label": "Increase responsibility only at the pace set by observed safety, reasoning, and reliability.",
            "correct": true,
            "rationale": "Correct. Increase responsibility only at the pace set by observed safety, reasoning, and reliability."
          },
          {
            "id": "guided-fading-decide-bypass",
            "label": "Treat progressive reduction of prompts as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "guided-fading-document-correct",
            "label": "Record assistance level, consistency across attempts, remaining gaps, and next participation level.",
            "correct": true,
            "rationale": "Correct. Record assistance level, consistency across attempts, remaining gaps, and next participation level."
          },
          {
            "id": "guided-fading-document-quiz-only",
            "label": "Record progressive reduction of prompts as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "Across field visits, the learner completes more of the workflow safely with fewer preceptor prompts.",
          "meaning": "Progressive independence is demonstrated by consistent field behavior, not one successful attempt.",
          "action": "Increase responsibility only at the pace set by observed safety, reasoning, and reliability.",
          "notify": "Notify the preceptor about new uncertainty or a change requiring closer guidance.",
          "document": "Record assistance level, consistency across attempts, remaining gaps, and next participation level.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "guided-lead",
        "label": "Learner leading under direct observation",
        "shortLabel": "Learner leads",
        "ariaLabel": "Investigate Learner leading under direct observation",
        "x": 82,
        "y": 50,
        "zone": "authorized",
        "leftAnchorId": "kp-4-2",
        "observe": "The learner leads the visit while the preceptor remains physically present and directly observes the encounter.",
        "identifyChoices": [
          {
            "id": "guided-lead-identify-correct",
            "label": "Learner-led care under direct observation is the final practice phase before an authorized field disposition, not clearance itself.",
            "correct": true,
            "rationale": "Correct. Learner-led care under direct observation is the final practice phase before an authorized field disposition, not clearance itself."
          },
          {
            "id": "guided-lead-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete learner leading under direct observation without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "guided-lead-decide-correct",
            "label": "Manage the visit within scope, verbalize escalation decisions, and accept immediate intervention when required.",
            "correct": true,
            "rationale": "Correct. Manage the visit within scope, verbalize escalation decisions, and accept immediate intervention when required."
          },
          {
            "id": "guided-lead-decide-bypass",
            "label": "Treat learner leading under direct observation as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "guided-lead-document-correct",
            "label": "Record independent actions, prompts, interventions, patient response, and evaluation evidence.",
            "correct": true,
            "rationale": "Correct. Record independent actions, prompts, interventions, patient response, and evaluation evidence."
          },
          {
            "id": "guided-lead-document-quiz-only",
            "label": "Record learner leading under direct observation as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner leads the visit while the preceptor remains physically present and directly observes the encounter.",
          "meaning": "Learner-led care under direct observation is the final practice phase before an authorized field disposition, not clearance itself.",
          "action": "Manage the visit within scope, verbalize escalation decisions, and accept immediate intervention when required.",
          "notify": "Notify the preceptor at once about abnormal findings, uncertainty, or departure from the expected plan.",
          "document": "Record independent actions, prompts, interventions, patient response, and evaluation evidence.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "guided-remediation",
        "label": "Performance gap remediation",
        "shortLabel": "Remediation",
        "ariaLabel": "Investigate Performance gap remediation",
        "x": 50,
        "y": 78,
        "zone": "prohibited",
        "leftAnchorId": "kp-4-3",
        "observe": "A critical behavior is missed or repeated prompting shows the learner is not ready to advance.",
        "identifyChoices": [
          {
            "id": "guided-remediation-identify-correct",
            "label": "A demonstrated gap requires targeted remediation and repeat direct observation before progression.",
            "correct": true,
            "rationale": "Correct. A demonstrated gap requires targeted remediation and repeat direct observation before progression."
          },
          {
            "id": "guided-remediation-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete performance gap remediation without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "guided-remediation-decide-correct",
            "label": "Stop advancement, define the gap, practice the behavior, and schedule reassessment under supervision.",
            "correct": true,
            "rationale": "Correct. Stop advancement, define the gap, practice the behavior, and schedule reassessment under supervision."
          },
          {
            "id": "guided-remediation-decide-bypass",
            "label": "Treat performance gap remediation as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "guided-remediation-document-correct",
            "label": "Record the objective gap, immediate safety response, remediation plan, responsible reviewer, and reassessment outcome.",
            "correct": true,
            "rationale": "Correct. Record the objective gap, immediate safety response, remediation plan, responsible reviewer, and reassessment outcome."
          },
          {
            "id": "guided-remediation-document-quiz-only",
            "label": "Record performance gap remediation as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "A critical behavior is missed or repeated prompting shows the learner is not ready to advance.",
          "meaning": "A demonstrated gap requires targeted remediation and repeat direct observation before progression.",
          "action": "Stop advancement, define the gap, practice the behavior, and schedule reassessment under supervision.",
          "notify": "Notify the educator or designated clinical leader through the applicable supervision process.",
          "document": "Record the objective gap, immediate safety response, remediation plan, responsible reviewer, and reassessment outcome.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 5,
    "shortName": "Debrief",
    "title": "Evaluation and Debrief",
    "subtitle": "Turn direct observation into specific feedback and the next field plan",
    "narration": [
      "Debrief occurs after the patient encounter in a private setting. The learner self-assesses; the preceptor then gives behavior-based feedback tied to what was directly observed.",
      "The discussion separates independent performance from prompts, corrections, demonstrations, and interventions. Strengths are reinforced, gaps prioritized, and the next supervised visit receives a specific goal.",
      "Debrief ends with a documented disposition: advance with stated support, repeat a phase, perform targeted remediation, or refer the decision through the applicable clinical supervision process."
    ],
    "keyPoints": [
      {
        "icon": "🪞",
        "title": "Learner Self-Assessment",
        "detail": "Name what went well, what required help, and which decision or skill remains uncertain."
      },
      {
        "icon": "💬",
        "title": "Behavior-Based Feedback",
        "detail": "Describe observable actions and their patient-safety effect rather than vague labels or personality judgments."
      },
      {
        "icon": "🎯",
        "title": "Set the Next Visit Goal",
        "detail": "Choose a specific behavior, expected assistance level, and evidence the preceptor will observe next."
      },
      {
        "icon": "🛠️",
        "title": "Choose Advance or Remediate",
        "detail": "Document whether the learner advances, repeats a supervised phase, or enters targeted remediation."
      }
    ],
    "clinicalTip": "A useful debrief names the behavior, its effect, the expected standard, and the next observed action.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img06,
    "imageAlt": "RN preceptor and LVN learner conducting a private post-visit evaluation and debrief with a blank evaluation tablet.",
    "hotspots": [
      {
        "id": "debrief-self",
        "label": "Learner self-assessment",
        "shortLabel": "Self-assess",
        "ariaLabel": "Investigate Learner self-assessment",
        "x": 20,
        "y": 28,
        "zone": "authorized",
        "leftAnchorId": "kp-5-0",
        "observe": "The learner identifies strengths, moments requiring help, and remaining uncertainty before hearing the preceptor evaluation.",
        "identifyChoices": [
          {
            "id": "debrief-self-identify-correct",
            "label": "Accurate self-assessment shows insight but does not replace direct preceptor observation.",
            "correct": true,
            "rationale": "Correct. Accurate self-assessment shows insight but does not replace direct preceptor observation."
          },
          {
            "id": "debrief-self-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete learner self-assessment without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "debrief-self-decide-correct",
            "label": "Compare your self-assessment with field evidence and name one priority for the next visit.",
            "correct": true,
            "rationale": "Correct. Compare your self-assessment with field evidence and name one priority for the next visit."
          },
          {
            "id": "debrief-self-decide-bypass",
            "label": "Treat learner self-assessment as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "debrief-self-document-correct",
            "label": "Record learner-identified strengths, gaps, and requested support.",
            "correct": true,
            "rationale": "Correct. Record learner-identified strengths, gaps, and requested support."
          },
          {
            "id": "debrief-self-document-quiz-only",
            "label": "Record learner self-assessment as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The learner identifies strengths, moments requiring help, and remaining uncertainty before hearing the preceptor evaluation.",
          "meaning": "Accurate self-assessment shows insight but does not replace direct preceptor observation.",
          "action": "Compare your self-assessment with field evidence and name one priority for the next visit.",
          "notify": "Tell the preceptor about any unreported error, near miss, or uncertainty during the visit.",
          "document": "Record learner-identified strengths, gaps, and requested support.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "debrief-feedback",
        "label": "Preceptor behavior-based feedback",
        "shortLabel": "Specific feedback",
        "ariaLabel": "Investigate Preceptor behavior-based feedback",
        "x": 50,
        "y": 22,
        "zone": "authorized",
        "leftAnchorId": "kp-5-1",
        "observe": "The preceptor describes a directly observed behavior, its effect, and the expected field standard.",
        "identifyChoices": [
          {
            "id": "debrief-feedback-identify-correct",
            "label": "Specific feedback supports safe improvement and makes the evaluation defensible.",
            "correct": true,
            "rationale": "Correct. Specific feedback supports safe improvement and makes the evaluation defensible."
          },
          {
            "id": "debrief-feedback-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete preceptor behavior-based feedback without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "debrief-feedback-decide-correct",
            "label": "Review evidence together, confirm understanding, and rehearse the corrected approach if needed.",
            "correct": true,
            "rationale": "Correct. Review evidence together, confirm understanding, and rehearse the corrected approach if needed."
          },
          {
            "id": "debrief-feedback-decide-bypass",
            "label": "Treat preceptor behavior-based feedback as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "debrief-feedback-document-correct",
            "label": "Record the observed behavior, feedback, learner response, and immediate correction.",
            "correct": true,
            "rationale": "Correct. Record the observed behavior, feedback, learner response, and immediate correction."
          },
          {
            "id": "debrief-feedback-document-quiz-only",
            "label": "Record preceptor behavior-based feedback as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The preceptor describes a directly observed behavior, its effect, and the expected field standard.",
          "meaning": "Specific feedback supports safe improvement and makes the evaluation defensible.",
          "action": "Review evidence together, confirm understanding, and rehearse the corrected approach if needed.",
          "notify": "Escalate a serious or repeated gap through the applicable clinical supervision pathway.",
          "document": "Record the observed behavior, feedback, learner response, and immediate correction.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "debrief-goal",
        "label": "Next supervised visit goal",
        "shortLabel": "Next goal",
        "ariaLabel": "Investigate Next supervised visit goal",
        "x": 80,
        "y": 30,
        "zone": "conditional",
        "leftAnchorId": "kp-5-2",
        "observe": "Preceptor and learner define one measurable behavior and target assistance level for the next visit.",
        "identifyChoices": [
          {
            "id": "debrief-goal-identify-correct",
            "label": "A concrete goal connects debrief feedback to progressive independence.",
            "correct": true,
            "rationale": "Correct. A concrete goal connects debrief feedback to progressive independence."
          },
          {
            "id": "debrief-goal-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete next supervised visit goal without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "debrief-goal-decide-correct",
            "label": "Set the next field task, expected support level, observation evidence, and stop condition.",
            "correct": true,
            "rationale": "Correct. Set the next field task, expected support level, observation evidence, and stop condition."
          },
          {
            "id": "debrief-goal-decide-bypass",
            "label": "Treat next supervised visit goal as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "debrief-goal-document-correct",
            "label": "Record the goal, supervision level, responsible preceptor, and planned review point.",
            "correct": true,
            "rationale": "Correct. Record the goal, supervision level, responsible preceptor, and planned review point."
          },
          {
            "id": "debrief-goal-document-quiz-only",
            "label": "Record next supervised visit goal as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "Preceptor and learner define one measurable behavior and target assistance level for the next visit.",
          "meaning": "A concrete goal connects debrief feedback to progressive independence.",
          "action": "Set the next field task, expected support level, observation evidence, and stop condition.",
          "notify": "Notify the responsible educator or designated clinical leader if added supervision is needed.",
          "document": "Record the goal, supervision level, responsible preceptor, and planned review point.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "debrief-disposition",
        "label": "Advance or remediation disposition",
        "shortLabel": "Disposition",
        "ariaLabel": "Investigate Advance or remediation disposition",
        "x": 35,
        "y": 70,
        "zone": "prohibited",
        "leftAnchorId": "kp-5-3",
        "observe": "The evidence shows whether the learner advances, repeats a phase, or needs targeted remediation.",
        "identifyChoices": [
          {
            "id": "debrief-disposition-identify-correct",
            "label": "The debrief disposition is an evaluation decision; the learner cannot self-advance or self-clear.",
            "correct": true,
            "rationale": "Correct. The debrief disposition is an evaluation decision; the learner cannot self-advance or self-clear."
          },
          {
            "id": "debrief-disposition-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete advance or remediation disposition without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "debrief-disposition-decide-correct",
            "label": "Document the evidence-based disposition and arrange the next supervised action.",
            "correct": true,
            "rationale": "Correct. Document the evidence-based disposition and arrange the next supervised action."
          },
          {
            "id": "debrief-disposition-decide-bypass",
            "label": "Treat advance or remediation disposition as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "debrief-disposition-document-correct",
            "label": "Record the disposition, rationale, remediation, follow-up owner, and reassessment requirement.",
            "correct": true,
            "rationale": "Correct. Record the disposition, rationale, remediation, follow-up owner, and reassessment requirement."
          },
          {
            "id": "debrief-disposition-document-quiz-only",
            "label": "Record advance or remediation disposition as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "The evidence shows whether the learner advances, repeats a phase, or needs targeted remediation.",
          "meaning": "The debrief disposition is an evaluation decision; the learner cannot self-advance or self-clear.",
          "action": "Document the evidence-based disposition and arrange the next supervised action.",
          "notify": "Send unresolved, critical, or recurring concerns to the authorized clinical decision-maker under policy.",
          "document": "Record the disposition, rationale, remediation, follow-up owner, and reassessment requirement.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  },
  {
    "id": 6,
    "shortName": "Sign-Off",
    "title": "Final Field Sign-Off Boundary",
    "subtitle": "Authorized field disposition or documented remediation, never quiz clearance",
    "narration": [
      "Final field sign-off occurs only after required supervised field evidence is reviewed through HR-TD-003 and applicable clinical supervision policies. Current agency policy determines the authorized signer and required records.",
      "The preceptor contributes direct-observation evidence and a recommendation. The authorized final reviewer decides whether requirements are met, more observation is required, or remediation continues. Neither the learner, a quiz score, nor a simulation can grant clearance.",
      "Field sign-off permits work only within the LVN role, assigned plan, and continuing clinical supervision structure. It does not remove RN direction, escalation duties, or ongoing competency expectations."
    ],
    "keyPoints": [
      {
        "icon": "📚",
        "title": "Review the Field Evidence",
        "detail": "Confirm directly observed performance, assistance levels, feedback, and remediation outcomes required by current policy."
      },
      {
        "icon": "✍️",
        "title": "Authorized Signer Decides",
        "detail": "Only the role authorized by current agency policy may document the final field disposition."
      },
      {
        "icon": "🔄",
        "title": "Remediate When Criteria Are Unmet",
        "detail": "Incomplete or unsafe performance returns to targeted practice and repeat observation before reconsideration."
      },
      {
        "icon": "🧱",
        "title": "Supervision Continues After Clearance",
        "detail": "Field clearance does not expand LVN scope or remove RN direction, patient-specific oversight, and escalation duties."
      }
    ],
    "clinicalTip": "Before accepting an independent assignment, verify that the authorized final field disposition is documented, not merely recommended.",
    "sourceLabels": [
      {
        "kind": "Agency Policy",
        "text": "HR-TD-003"
      },
      {
        "kind": "Agency Guidance",
        "text": "Applicable clinical supervision policies"
      }
    ],
    "sceneImage": img07,
    "imageAlt": "Authorized clinical reviewer examining direct-observation evidence with the RN preceptor and LVN learner beside a sign-off or remediation folder.",
    "hotspots": [
      {
        "id": "signoff-evidence",
        "label": "Final field evidence review",
        "shortLabel": "Evidence review",
        "ariaLabel": "Investigate Final field evidence review",
        "x": 18,
        "y": 40,
        "zone": "authorized",
        "leftAnchorId": "kp-6-0",
        "observe": "Required field records show directly observed performance, assistance levels, feedback, and completed remediation.",
        "identifyChoices": [
          {
            "id": "signoff-evidence-identify-correct",
            "label": "Final review must rely on field evidence collected under supervision, not a knowledge score.",
            "correct": true,
            "rationale": "Correct. Final review must rely on field evidence collected under supervision, not a knowledge score."
          },
          {
            "id": "signoff-evidence-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete final field evidence review without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "signoff-evidence-decide-correct",
            "label": "Confirm required records are complete, internally consistent, and routed to the authorized reviewer.",
            "correct": true,
            "rationale": "Correct. Confirm required records are complete, internally consistent, and routed to the authorized reviewer."
          },
          {
            "id": "signoff-evidence-decide-bypass",
            "label": "Treat final field evidence review as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "signoff-evidence-document-correct",
            "label": "Record evidence reviewed, missing items, resolution, and date of final review.",
            "correct": true,
            "rationale": "Correct. Record evidence reviewed, missing items, resolution, and date of final review."
          },
          {
            "id": "signoff-evidence-document-quiz-only",
            "label": "Record final field evidence review as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "Required field records show directly observed performance, assistance levels, feedback, and completed remediation.",
          "meaning": "Final review must rely on field evidence collected under supervision, not a knowledge score.",
          "action": "Confirm required records are complete, internally consistent, and routed to the authorized reviewer.",
          "notify": "Notify the preceptor and authorized reviewer when evidence is missing, contradictory, or incomplete.",
          "document": "Record evidence reviewed, missing items, resolution, and date of final review.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "signoff-authority",
        "label": "Authorized final field disposition",
        "shortLabel": "Authorized sign-off",
        "ariaLabel": "Investigate Authorized final field disposition",
        "x": 40,
        "y": 55,
        "zone": "prohibited",
        "leftAnchorId": "kp-6-1",
        "observe": "An authorized reviewer applies current agency policy to decide clearance, continued supervision, or remediation.",
        "identifyChoices": [
          {
            "id": "signoff-authority-identify-correct",
            "label": "The preceptor recommendation informs the decision, but only policy-authorized final sign-off grants field clearance.",
            "correct": true,
            "rationale": "Correct. The preceptor recommendation informs the decision, but only policy-authorized final sign-off grants field clearance."
          },
          {
            "id": "signoff-authority-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete authorized final field disposition without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "signoff-authority-decide-correct",
            "label": "Wait for the documented authorized disposition before accepting work without the capstone preceptor present.",
            "correct": true,
            "rationale": "Correct. Wait for the documented authorized disposition before accepting work without the capstone preceptor present."
          },
          {
            "id": "signoff-authority-decide-bypass",
            "label": "Treat authorized final field disposition as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "signoff-authority-document-correct",
            "label": "Record authorized signer, disposition, effective date, limits, and follow-up requirement.",
            "correct": true,
            "rationale": "Correct. Record authorized signer, disposition, effective date, limits, and follow-up requirement."
          },
          {
            "id": "signoff-authority-document-quiz-only",
            "label": "Record authorized final field disposition as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "An authorized reviewer applies current agency policy to decide clearance, continued supervision, or remediation.",
          "meaning": "The preceptor recommendation informs the decision, but only policy-authorized final sign-off grants field clearance.",
          "action": "Wait for the documented authorized disposition before accepting work without the capstone preceptor present.",
          "notify": "Notify the designated clinical leader if assignment status conflicts with the documented disposition.",
          "document": "Record authorized signer, disposition, effective date, limits, and follow-up requirement.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "signoff-remediate",
        "label": "Sign-off deferred for remediation",
        "shortLabel": "Defer/remediate",
        "ariaLabel": "Investigate Sign-off deferred for remediation",
        "x": 62,
        "y": 40,
        "zone": "conditional",
        "leftAnchorId": "kp-6-2",
        "observe": "Final review identifies an unmet field criterion or unresolved safety concern.",
        "identifyChoices": [
          {
            "id": "signoff-remediate-identify-correct",
            "label": "A deferred sign-off is a patient-safety boundary and requires more supervised evidence.",
            "correct": true,
            "rationale": "Correct. A deferred sign-off is a patient-safety boundary and requires more supervised evidence."
          },
          {
            "id": "signoff-remediate-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete sign-off deferred for remediation without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "signoff-remediate-decide-correct",
            "label": "Continue targeted remediation and repeat direct observation until the authorized reviewer reevaluates the evidence.",
            "correct": true,
            "rationale": "Correct. Continue targeted remediation and repeat direct observation until the authorized reviewer reevaluates the evidence."
          },
          {
            "id": "signoff-remediate-decide-bypass",
            "label": "Treat sign-off deferred for remediation as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "signoff-remediate-document-correct",
            "label": "Record unmet criterion, remediation plan, supervision level, reassessment evidence, and updated disposition.",
            "correct": true,
            "rationale": "Correct. Record unmet criterion, remediation plan, supervision level, reassessment evidence, and updated disposition."
          },
          {
            "id": "signoff-remediate-document-quiz-only",
            "label": "Record sign-off deferred for remediation as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "Final review identifies an unmet field criterion or unresolved safety concern.",
          "meaning": "A deferred sign-off is a patient-safety boundary and requires more supervised evidence.",
          "action": "Continue targeted remediation and repeat direct observation until the authorized reviewer reevaluates the evidence.",
          "notify": "Notify the learner, preceptor, and designated clinical leader through the applicable supervision process.",
          "document": "Record unmet criterion, remediation plan, supervision level, reassessment evidence, and updated disposition.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      },
      {
        "id": "signoff-continuing",
        "label": "Continuing clinical supervision",
        "shortLabel": "Supervision stays",
        "ariaLabel": "Investigate Continuing clinical supervision",
        "x": 84,
        "y": 55,
        "zone": "authorized",
        "leftAnchorId": "kp-6-3",
        "observe": "After field clearance, the LVN still works within role, assigned care, and continuing clinical supervision requirements.",
        "identifyChoices": [
          {
            "id": "signoff-continuing-identify-correct",
            "label": "Capstone clearance ends the preceptor phase; it does not create autonomous practice or expand scope.",
            "correct": true,
            "rationale": "Correct. Capstone clearance ends the preceptor phase; it does not create autonomous practice or expand scope."
          },
          {
            "id": "signoff-continuing-identify-quiz-only",
            "label": "A quiz or simulation alone proves the learner may complete continuing clinical supervision without field observation.",
            "correct": false,
            "rationale": "A quiz or simulation checks knowledge or practice; it does not grant field competency."
          }
        ],
        "decideChoices": [
          {
            "id": "signoff-continuing-decide-correct",
            "label": "Follow the patient-specific plan, obtain required RN direction, and escalate changes or uncertainty.",
            "correct": true,
            "rationale": "Correct. Follow the patient-specific plan, obtain required RN direction, and escalate changes or uncertainty."
          },
          {
            "id": "signoff-continuing-decide-bypass",
            "label": "Treat continuing clinical supervision as complete without preceptor observation, coaching, or the required field decision.",
            "correct": false,
            "rationale": "The field capstone cannot be bypassed by self-assessment or simulated completion."
          }
        ],
        "documentChoices": [
          {
            "id": "signoff-continuing-document-correct",
            "label": "Record care provided, patient response, communications, directions received, and follow-up under applicable policy.",
            "correct": true,
            "rationale": "Correct. Record care provided, patient response, communications, directions received, and follow-up under applicable policy."
          },
          {
            "id": "signoff-continuing-document-quiz-only",
            "label": "Record continuing clinical supervision as competent based only on quiz or simulation completion.",
            "correct": false,
            "rationale": "Competency documentation must reflect directly observed field performance and the authorized disposition."
          }
        ],
        "feedback": {
          "observed": "After field clearance, the LVN still works within role, assigned care, and continuing clinical supervision requirements.",
          "meaning": "Capstone clearance ends the preceptor phase; it does not create autonomous practice or expand scope.",
          "action": "Follow the patient-specific plan, obtain required RN direction, and escalate changes or uncertainty.",
          "notify": "Notify the supervising RN according to the patient finding, order, and applicable agency process.",
          "document": "Record care provided, patient response, communications, directions received, and follow-up under applicable policy.",
          "policyRefs": [
            "HR-TD-003",
            "Applicable clinical supervision policies"
          ]
        }
      }
    ]
  }
];

const QUIZ: QuizQuestion[] = [
  {
    "id": 1,
    "stem": "What does completion of the LVN-SUP quiz or a simulation establish?",
    "options": [
      "Knowledge or practice completion only; field competency still requires direct observation and authorized sign-off",
      "Immediate authorization to accept an independent field assignment",
      "Permission to skip the observation phase",
      "Automatic approval of every clinical skill"
    ],
    "correct": 0,
    "rationale": "Quiz and simulation results do not grant competency. Field clearance requires directly observed performance and the authorized final disposition."
  },
  {
    "id": 2,
    "stem": "What is the preceptor accountable for during the field capstone?",
    "options": [
      "Only counting visits",
      "Demonstrating standards, directly supervising, coaching, intervening for safety, and documenting observed performance",
      "Leaving the learner alone so the evaluation is realistic",
      "Accepting the learner self-rating as final evidence"
    ],
    "correct": 1,
    "rationale": "The preceptor remains accountable for teaching, direct observation, safety intervention, and accurate field evidence."
  },
  {
    "id": 3,
    "stem": "Which action belongs in pre-visit preparation?",
    "options": [
      "Rely on memory because the patient is familiar",
      "Review current care information, match supplies, confirm logistics, and brief the preceptor on risks and escalation triggers",
      "Wait until inside the home to discover missing supplies",
      "Treat a simulated preparation exercise as field clearance"
    ],
    "correct": 1,
    "rationale": "Preparation is a directly observed field behavior that includes current information, supplies, logistics, risks, and a preceptor briefing."
  },
  {
    "id": 4,
    "stem": "What is the learner role during the observation phase?",
    "options": [
      "Lead without assistance",
      "Actively watch the preceptor-led workflow, track reasoning and safety gates, then teach back the sequence",
      "Document the preceptor demonstration as the learner own performance",
      "Skip questions to avoid interrupting the evaluation"
    ],
    "correct": 1,
    "rationale": "Observation is active learning. It establishes the model for coached performance but does not itself prove competency."
  },
  {
    "id": 5,
    "stem": "How should a prompted step be represented during guided performance?",
    "options": [
      "As independent because the learner completed the final motion",
      "As prompted or coached, including the correction and patient response",
      "Omitted from the evaluation",
      "Converted into a quiz score"
    ],
    "correct": 1,
    "rationale": "Assistance level must be documented accurately; prompted performance is evidence of learning, not unprompted independence."
  },
  {
    "id": 6,
    "stem": "What does progressive independence mean in the capstone?",
    "options": [
      "The learner leads more of the actual visit as safe performance becomes consistent, while the preceptor continues direct observation",
      "The preceptor waits outside the home",
      "The learner self-declares readiness after one successful task",
      "RN direction no longer applies"
    ],
    "correct": 0,
    "rationale": "Responsibility increases based on repeated field evidence, with the preceptor still present and ready to intervene."
  },
  {
    "id": 7,
    "stem": "What should a post-visit debrief produce?",
    "options": [
      "A vague statement that the visit went well",
      "Behavior-based feedback, learner response, a specific next goal, and an advance-or-remediation disposition",
      "Only a time total",
      "Automatic final clearance"
    ],
    "correct": 1,
    "rationale": "Debrief converts direct observation into specific feedback and the next supervised action."
  },
  {
    "id": 8,
    "stem": "What happens when a critical behavior is missed or repeated prompting shows a gap?",
    "options": [
      "The learner advances because the visit was completed",
      "The gap is hidden to protect confidence",
      "Targeted remediation and repeat direct observation occur before progression",
      "The quiz score overrides the field finding"
    ],
    "correct": 2,
    "rationale": "Unmet field criteria require an evidence-based remediation pathway, not self-clearance or quiz substitution."
  },
  {
    "id": 9,
    "stem": "Who can grant the final field disposition?",
    "options": [
      "The learner after self-assessment",
      "The quiz engine",
      "Only the role authorized by current agency policy after required field evidence is reviewed",
      "Any coworker who attended one visit"
    ],
    "correct": 2,
    "rationale": "The authorized final field-sign-off boundary is determined by HR-TD-003 and applicable clinical supervision policies."
  },
  {
    "id": 10,
    "stem": "What remains true after authorized field clearance?",
    "options": [
      "The LVN practices autonomously without RN direction",
      "The LVN may expand scope when confident",
      "The LVN continues within role, assigned care, applicable clinical supervision, and required escalation pathways",
      "Ongoing competency expectations end"
    ],
    "correct": 2,
    "rationale": "Field clearance ends the capstone preceptor phase; it does not expand LVN scope or remove continuing supervision."
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
  .lvn002-left{max-height:none;overflow:visible}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:11px;max-width:110px}
}
@media (max-width:600px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-top{height:56px;padding:0 6px;gap:5px}
  .lvn002-exit{padding:6px 8px;font-size:10px;letter-spacing:.03em}
  .lvn002-left{padding:16px}
  .lvn002-key-grid{grid-template-columns:1fr!important}
  .lvn002-quiz-page{padding:10px}
  .lvn002-scope-grid{grid-template-columns:1fr!important}
  .lvn002-bot{height:64px;padding:4px 6px;gap:4px}
  .lvn002-bot>div{display:none!important}
  .lvn002-bot button.next{padding:10px;font-size:10px;letter-spacing:.04em}
  .lvn002-stage{border-radius:10px}
}
@media (max-height:700px) and (max-width:900px){
  .lvn002-top{height:56px}
  .lvn002-bot{height:64px}
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
  const firstChoiceRef = useRef<HTMLButtonElement>(null);
  const feedbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const dialogTitleId = useId();
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
  const completeAndRestore = useCallback(() => { onComplete(); restoreTriggerFocus(); }, [onComplete, restoreTriggerFocus]);

  useLayoutEffect(() => {
    if (stage === 'identify' || stage === 'decide' || stage === 'document') {
      firstChoiceRef.current?.focus();
    } else if (stage === 'feedback') {
      feedbackHeadingRef.current?.focus();
    } else {
      closeRef.current?.focus();
    }
  }, [stage, hotspot.id]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>('.lvn002-shell');
    const shellWasInert = shell?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (shell) shell.inert = true;
    document.body.style.overflow = 'hidden';
    return () => {
      if (shell && !shellWasInert) shell.inert = false;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAndRestore();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeAndRestore]);

  // Focus trap
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', onTrap);
    return () => root.removeEventListener('keydown', onTrap);
  }, [stage]);

  const pick = (
    choice: ScenarioChoice,
    setSelected: (id: string) => void,
    setLocked: (v: boolean) => void,
    locked: boolean,
    next: ScenarioStage,
  ) => {
    if (locked) return;
    setSelected(choice.id);
    setRationale(choice.rationale);
    if (choice.correct) {
      setLocked(true);
      window.setTimeout(() => { setRationale(null); setStage(next); }, 650);
    }
  };

  const renderChoices = (
    choices: ScenarioChoice[],
    selectedId: string | null,
    locked: boolean,
    onPick: (c: ScenarioChoice) => void,
  ) => (
    <div
      role="radiogroup"
      aria-label={`${hotspot.label} response choices`}
      style={{ display: 'grid', gap: 8 }}
      onKeyDown={(event) => {
        if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        const radios = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)'));
        if (!radios.length) return;
        event.preventDefault();
        const current = Math.max(0, radios.indexOf(document.activeElement as HTMLButtonElement));
        const next = event.key === 'Home' ? 0
          : event.key === 'End' ? radios.length - 1
            : event.key === 'ArrowDown' || event.key === 'ArrowRight' ? (current + 1) % radios.length
              : (current - 1 + radios.length) % radios.length;
        radios[next]?.focus();
      }}
    >
      {choices.map((c, index) => {
        const selected = selectedId === c.id;
        const show = selected;
        const wrong = show && !c.correct;
        const right = show && c.correct;
        return (
          <button
            key={c.id}
            ref={index === 0 ? firstChoiceRef : undefined}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!selectedId && index === 0) ? 0 : -1}
            onClick={() => onPick(c)}
            disabled={locked && !selected}
            style={{
              textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer',
              border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`,
              background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff',
              fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1,
            }}
          >
            {c.label}
          </button>
        );
      })}
      {rationale && (
        <div role="status" aria-live="polite" style={{ fontSize: 14, lineHeight: 1.5, color: CI.muted, padding: '8px 10px', borderRadius: 8, background: CI.bg }}>
          {rationale}
        </div>
      )}
    </div>
  );

  const fb = hotspot.feedback;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      ref={dialogRef}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(15,23,42,.45)', padding: 12 }}
      onClick={(e) => { if (e.target === e.currentTarget) closeAndRestore(); }}
    >
      <div style={{ width: 'min(520px, 100%)', maxHeight: '92%', overflow: 'auto', background: '#fff', borderRadius: 16, border: `1px solid ${CI.border}`, boxShadow: '0 16px 48px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>
              {stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}
            </div>
            <h2 id={dialogTitleId} style={{ margin: 0, fontSize: 17, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close scenario"
            onClick={closeAndRestore}
            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          {stage === 'observe' && (
            <>
              <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p>
              <button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.teal, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                Continue to Identify
              </button>
            </>
          )}

          {stage === 'identify' && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this finding mean for LVN practice?</div>
              {renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (c) =>
                pick(c, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'),
              )}
            </>
          )}

          {stage === 'decide' && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the LVN do next?</div>
              {renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (c) =>
                pick(c, setSelectedDecideId, setDecideLocked, decideLocked, 'document'),
              )}
            </>
          )}

          {stage === 'document' && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>
              {renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (c) =>
                pick(c, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'),
              )}
            </>
          )}

          {stage === 'feedback' && (
            <>
              <h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3>
              <FeedbackBlock label="What you observed" body={fb.observed} icon={<Eye size={14} />} />
              <FeedbackBlock label="What it means" body={fb.meaning} icon={<AlertCircle size={14} />} />
              <FeedbackBlock label="What the LVN should do" body={fb.action} icon={<CheckCircle2 size={14} />} />
              <FeedbackBlock label="Who must be notified" body={fb.notify} icon={<MessageSquare size={14} />} />
              <FeedbackBlock label="What must be documented" body={fb.document} icon={<FileText size={14} />} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {fb.policyRefs.map((r) => (
                  <span key={r} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{r}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={completeAndRestore}
                style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Complete hotspot
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
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
      <div className="lvn002-key-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {page.keyPoints.map((kp, idx) => (
          <div id={`kp-${page.id}-${idx}`} key={`kp-${page.id}-${idx}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 12, display: 'flex', gap: 10 }}>
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
  return (
    <div className="lvn002-stage-wrap">
      <div className="lvn002-stage" role="region" aria-label={`${page.title} interactive scene`}>
        <img className="scene" src={page.sceneImage} alt={page.imageAlt} draggable={false} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: 'rgba(255,255,255,.94)', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
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
          const anchorId = hs.leftAnchorId && typeof document !== 'undefined' && document.getElementById(hs.leftAnchorId)
            ? hs.leftAnchorId
            : undefined;
          return (
            <button key={hs.id} type="button" className={`lvn002-hotspot ${isDone ? 'done' : ''} ${isGuided ? 'guided' : ''}`}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              aria-label={isDone ? `${hs.label} — observed` : `Investigate ${hs.label}`}
              aria-describedby={[`lvn002-progress-${page.id}`, anchorId].filter(Boolean).join(' ')}
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
  const submitButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (finished || submitted) return;
    const target = selected ?? 0;
    const frame = window.requestAnimationFrame(() => optionRefs.current[target]?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [idx, finished, selected, submitted]);

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
      window.requestAnimationFrame(() => submitButtonRef.current?.focus());
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
          <div className="lvn002-scope-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
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
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusOption(cur >= max ? 0 : cur + 1); }
              else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusOption(cur <= 0 ? max : cur - 1); }
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
                <button key={`${q.id}-${i}`} type="button" role="radio" aria-checked={on}
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
            <button ref={submitButtonRef} type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'lvn-sup-progress-v5414';

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
      alt="Care Indeed logo"
      width={size}
      height={size}
      style={{ width: size, height: size, flexShrink: 0, pointerEvents: 'none', userSelect: 'none', objectFit: 'contain' }}
    />
  );
}

export default function LVNSUP() {
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
          <span className="brand-text">LVN-SUP — Field Capstone</span>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
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
