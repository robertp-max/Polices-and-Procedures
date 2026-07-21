/**
 * LVN-004 — Clinical Documentation Standards
 * Version: 5.4.0-RECOVERY
 * Interaction: Observe → Identify → Decide → Document → Feedback → Complete
 * Practical competency remains separate.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-004/lesson-01-why-doc.png';
import img02 from './assets/lvn-004/lesson-02-soap.png';
import img03 from './assets/lvn-004/lesson-03-skilled-need.png';
import img04 from './assets/lvn-004/lesson-04-timeliness.png';
import img05 from './assets/lvn-004/lesson-05-doc-errors.png';
import img06 from './assets/lvn-004/lesson-06-rn-review.png';
import img07 from './assets/lvn-004/lesson-07-practice.png';

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

const MODULE_META = { id: 'LVN-004', title: 'Documentation', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'LVN documents objective patient findings with de-identified vital-sign tools in a home setting.',
  'Unbranded tablet scene uses four blank zones and clinical props to show SOAP classification.',
  'LVN performs de-identified ordered wound care with blank order and note cues for skilled-need support.',
  'LVN records a de-identified patient teach-back response promptly after a home-health intervention.',
  'Tabletop scene contrasts a weak copied note with organized patient-specific documentation cues.',
  'Two clinicians review a de-identified LVN note with blank coordination and addendum cues.',
  'LVN reviews a completed de-identified patient-specific note with objective care cues before submission.',
] as const;

const PAGES: PageData[] = [
  {
    id: 0, shortName: 'Why Doc', title: 'Why Documentation Defines Your Practice', subtitle: 'Your visit note is the legal, clinical, and billing record of home care',
    narration: [      'As a Licensed Vocational Nurse in home health, your clinical documentation is the single most important product of every patient visit. In the home health model, your documentation is often the only tangible evidence that a visit occurred, that skilled services were provided, that the patient condition was observed and reported, that interventions were delivered as ordered, and that the Plan of Care (POC) was followed within your LVN scope. Unlike a hospital where multiple clinicians co-observe care delivery, in home health you are frequently the sole witness to the clinical encounter. Your documentation must stand alone as a complete, accurate, defensible record.',
      'Documentation serves five critical functions simultaneously. First, it is a clinical communication tool: the RN case manager, physician, and other interdisciplinary team members rely on your visit notes to understand the patient\'s current status. Second, it is the legal record—the practical standard is that if it was not documented, it cannot be defended as done. Third, it supports Medicare coverage and billing integrity: notes that fail skilled-service justification may be non-billable and, if billed without support, create compliance risk under false-claims frameworks. Fourth, it feeds quality measurement and the agency QAPI program. Fifth, it supports survey readiness for accreditation and state surveyors who sample visit notes for specificity, timeliness, and POC alignment.',
      ' Agency policies CL-CD-001, CL-CD-003, and CL-CD-004 govern the visit record, factual accuracy and corrections, and coordination or review workflow. Document only within ordered LVN scope under RN direction.',
      'Passing the knowledge check in this module validates documentation knowledge only. Observed clinical performance, RN co-signature review, competency check-offs, and authorized sign-off remain separate requirements for practical competency.'], keyPoints: [
      { icon: '🔎', title: 'Objective findings', detail: 'Record measured values, direct observations, and attributed statements.' },
      { icon: '🛡️', title: 'Defensible record', detail: 'Show what happened, when, by whom, and how the patient responded.' },
      { icon: '🩺', title: 'Skilled need', detail: 'Connect the ordered intervention to the patient-specific clinical need.' },
      { icon: '📋', title: 'Standalone review', detail: 'Make today’s note understandable without opening a prior visit.' },
      { icon: '☎️', title: 'Scope and coordination', detail: 'Report unexpected findings and preserve the RN response.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img01,
    hotspots: [      {
        id: 'p1-clinical', label: 'Clinical communication', shortLabel: 'Clinical com…', ariaLabel: 'Investigate Clinical communication',
        x: 18, y: 28, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-0',
        observe: 'RN case managers, physicians, and IDT members rely on your note for current status, teaching, and change-in-condition cues.',
                "identifyChoices": [
                {
                        "id": "p1-clinical-identify-correct",
                        "label": "Current objective findings are the handoff: the next clinician needs measured status, change from baseline, skilled care, and response.",
                        "correct": true,
                        "rationale": "Correct. Current objective findings are the handoff: the next clinician needs measured status, change from baseline, skilled care, and response."
                },
                {
                        "id": "p1-clinical-identify-revise",
                        "label": "A routine visit needs only a task list because the RN already knows the patient.",
                        "correct": false,
                        "rationale": "Not defensible. Current objective findings are the handoff: the next clinician needs measured status, change from baseline, skilled care, and response."
                }
        ],
        "decideChoices": [
                {
                        "id": "p1-clinical-decide-correct",
                        "label": "Compare today’s measured findings with ordered parameters and baseline; address safety first and coordinate any change before leaving.",
                        "correct": true,
                        "rationale": "Correct. Compare today’s measured findings with ordered parameters and baseline; address safety first and coordinate any change before leaving."
                },
                {
                        "id": "p1-clinical-decide-revise",
                        "label": "Submit “visit completed” and wait for the next clinician to identify any change.",
                        "correct": false,
                        "rationale": "This misses the required response. Compare today’s measured findings with ordered parameters and baseline; address safety first and coordinate any change before leaving."
                }
        ],
        "documentChoices": [
                {
                        "id": "p1-clinical-document-correct",
                        "label": "Record exact findings with time and context, baseline comparison, skilled intervention, reassessment, patient response, and any RN contact and direction.",
                        "correct": true,
                        "rationale": "Correct. Record exact findings with time and context, baseline comparison, skilled intervention, reassessment, patient response, and any RN contact and direction."
                },
                {
                        "id": "p1-clinical-document-revise",
                        "label": "Record “assessment done; patient stable” without values, comparison, or response.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record exact findings with time and context, baseline comparison, skilled intervention, reassessment, patient response, and any RN contact and direction."
                }
        ],
        "feedback": {
                "observed": "Current objective findings are the handoff: the next clinician needs measured status, change from baseline, skilled care, and response.",
                "meaning": "Current objective findings are the handoff: the next clinician needs measured status, change from baseline, skilled care, and response.",
                "action": "Compare today’s measured findings with ordered parameters and baseline; address safety first and coordinate any change before leaving.",
                "notify": "Notify the supervising RN during the visit for a new, worsening, or out-of-parameter finding; use urgent or emergency escalation immediately for instability, severe symptoms, or acute neurologic change.",
                "document": "Record exact findings with time and context, baseline comparison, skilled intervention, reassessment, patient response, and any RN contact and direction.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p1-legal', label: 'Legal record', shortLabel: 'Legal record', ariaLabel: 'Investigate Legal record',
        x: 50, y: 22, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-1',
        observe: 'If it is not documented, it cannot be defended as performed. Notes are discoverable and survey-sampled.',
                "identifyChoices": [
                {
                        "id": "p1-legal-identify-correct",
                        "label": "A defensible record distinguishes what was observed, reported, performed, and reassessed, with actual times and author attribution.",
                        "correct": true,
                        "rationale": "Correct. A defensible record distinguishes what was observed, reported, performed, and reassessed, with actual times and author attribution."
                },
                {
                        "id": "p1-legal-identify-revise",
                        "label": "RN co-signature can make an incomplete or inaccurate original entry defensible.",
                        "correct": false,
                        "rationale": "Not defensible. A defensible record distinguishes what was observed, reported, performed, and reassessed, with actual times and author attribution."
                }
        ],
        "decideChoices": [
                {
                        "id": "p1-legal-decide-correct",
                        "label": "Verify the entry against today’s encounter and correct omissions before authentication; use the formal correction path after authentication.",
                        "correct": true,
                        "rationale": "Correct. Verify the entry against today’s encounter and correct omissions before authentication; use the formal correction path after authentication."
                },
                {
                        "id": "p1-legal-decide-revise",
                        "label": "Add unverified details from memory after the note locks and overwrite the original.",
                        "correct": false,
                        "rationale": "This misses the required response. Verify the entry against today’s encounter and correct omissions before authentication; use the formal correction path after authentication."
                }
        ],
        "documentChoices": [
                {
                        "id": "p1-legal-document-correct",
                        "label": "Record actual visit times, objective findings, ordered care, response, coordination, and authentication; a correction adds discovery time, corrected fact, reason, and author.",
                        "correct": true,
                        "rationale": "Correct. Record actual visit times, objective findings, ordered care, response, coordination, and authentication; a correction adds discovery time, corrected fact, reason, and author."
                },
                {
                        "id": "p1-legal-document-revise",
                        "label": "Record “all care performed as ordered” with no patient-specific evidence.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record actual visit times, objective findings, ordered care, response, coordination, and authentication; a correction adds discovery time, corrected fact, reason, and author."
                }
        ],
        "feedback": {
                "observed": "A defensible record distinguishes what was observed, reported, performed, and reassessed, with actual times and author attribution.",
                "meaning": "A defensible record distinguishes what was observed, reported, performed, and reassessed, with actual times and author attribution.",
                "action": "Verify the entry against today’s encounter and correct omissions before authentication; use the formal correction path after authentication.",
                "notify": "No separate notice is needed for a complete routine entry; notify the RN the same day for a material omission, wrong-patient entry, or inaccurate authenticated fact, and immediately if care may be affected.",
                "document": "Record actual visit times, objective findings, ordered care, response, coordination, and authentication; a correction adds discovery time, corrected fact, reason, and author.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003"
                ]
        }
      },      {
        id: 'p1-billing', label: 'Coverage & billing', shortLabel: 'Coverage & b…', ariaLabel: 'Investigate Coverage & billing',
        x: 82, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-2',
        observe: 'Skilled justification and POC-ordered care support Medicare coverage integrity. Weak notes create compliance risk.',
                "identifyChoices": [
                {
                        "id": "p1-billing-identify-correct",
                        "label": "Skilled-need support must show the licensed assessment or technique, its patient-specific clinical purpose, the current order, and the response.",
                        "correct": true,
                        "rationale": "Correct. Skilled-need support must show the licensed assessment or technique, its patient-specific clinical purpose, the current order, and the response."
                },
                {
                        "id": "p1-billing-identify-revise",
                        "label": "The visit code and the phrase “dressing change” establish skilled need without clinical detail.",
                        "correct": false,
                        "rationale": "Not defensible. Skilled-need support must show the licensed assessment or technique, its patient-specific clinical purpose, the current order, and the response."
                }
        ],
        "decideChoices": [
                {
                        "id": "p1-billing-decide-correct",
                        "label": "Link the ordered intervention to today’s condition, risks, skilled monitoring, and measured outcome without adding an independent diagnosis.",
                        "correct": true,
                        "rationale": "Correct. Link the ordered intervention to today’s condition, risks, skilled monitoring, and measured outcome without adding an independent diagnosis."
                },
                {
                        "id": "p1-billing-decide-revise",
                        "label": "List supplies used but omit why licensed observation or technique was required.",
                        "correct": false,
                        "rationale": "This misses the required response. Link the ordered intervention to today’s condition, risks, skilled monitoring, and measured outcome without adding an independent diagnosis."
                }
        ],
        "documentChoices": [
                {
                        "id": "p1-billing-document-correct",
                        "label": "Record current wound findings, ordered products and technique, clinical reason for skilled monitoring, tolerance, teaching, teach-back, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Record current wound findings, ordered products and technique, clinical reason for skilled monitoring, tolerance, teaching, teach-back, and follow-up."
                },
                {
                        "id": "p1-billing-document-revise",
                        "label": "Record “routine wound care per plan” without findings, skill, necessity, or response.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record current wound findings, ordered products and technique, clinical reason for skilled monitoring, tolerance, teaching, teach-back, and follow-up."
                }
        ],
        "feedback": {
                "observed": "Skilled-need support must show the licensed assessment or technique, its patient-specific clinical purpose, the current order, and the response.",
                "meaning": "Skilled-need support must show the licensed assessment or technique, its patient-specific clinical purpose, the current order, and the response.",
                "action": "Link the ordered intervention to today’s condition, risks, skilled monitoring, and measured outcome without adding an independent diagnosis.",
                "notify": "Notify the RN during the visit for purulent drainage, spreading erythema, fever, uncontrolled pain, deterioration, or an order mismatch; use urgent escalation for systemic or unstable findings.",
                "document": "Record current wound findings, ordered products and technique, clinical reason for skilled monitoring, tolerance, teaching, teach-back, and follow-up.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p1-survey', label: 'Survey readiness', shortLabel: 'Survey readi…', ariaLabel: 'Investigate Survey readiness',
        x: 35, y: 70, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-3',
        observe: 'Surveyors sample notes for specificity, homebound support, skilled content, and alignment with the POC.',
                "identifyChoices": [
                {
                        "id": "p1-survey-identify-correct",
                        "label": "Each sampled note must stand alone with today’s condition, skilled need, ordered care, response, homebound support, and coordination.",
                        "correct": true,
                        "rationale": "Correct. Each sampled note must stand alone with today’s condition, skilled need, ordered care, response, homebound support, and coordination."
                },
                {
                        "id": "p1-survey-identify-revise",
                        "label": "Prior notes may supply missing vital signs, homebound support, or response for today’s visit.",
                        "correct": false,
                        "rationale": "Not defensible. Each sampled note must stand alone with today’s condition, skilled need, ordered care, response, homebound support, and coordination."
                }
        ],
        "decideChoices": [
                {
                        "id": "p1-survey-decide-correct",
                        "label": "Complete the patient-specific pre-submit check and explain any required item that could not be obtained, including the response and notification.",
                        "correct": true,
                        "rationale": "Correct. Complete the patient-specific pre-submit check and explain any required item that could not be obtained, including the response and notification."
                },
                {
                        "id": "p1-survey-decide-revise",
                        "label": "Submit blanks or “same as last visit” and rely on the reviewer to open earlier notes.",
                        "correct": false,
                        "rationale": "This misses the required response. Complete the patient-specific pre-submit check and explain any required item that could not be obtained, including the response and notification."
                }
        ],
        "documentChoices": [
                {
                        "id": "p1-survey-document-correct",
                        "label": "Record identity, actual times, complete findings, skilled service and need, response, homebound qualifier, teaching, and exact notification details.",
                        "correct": true,
                        "rationale": "Correct. Record identity, actual times, complete findings, skilled service and need, response, homebound qualifier, teaching, and exact notification details."
                },
                {
                        "id": "p1-survey-document-revise",
                        "label": "Record cross-references to earlier notes instead of today’s clinical evidence.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record identity, actual times, complete findings, skilled service and need, response, homebound qualifier, teaching, and exact notification details."
                }
        ],
        "feedback": {
                "observed": "Each sampled note must stand alone with today’s condition, skilled need, ordered care, response, homebound support, and coordination.",
                "meaning": "Each sampled note must stand alone with today’s condition, skilled need, ordered care, response, homebound support, and coordination.",
                "action": "Complete the patient-specific pre-submit check and explain any required item that could not be obtained, including the response and notification.",
                "notify": "Notify the RN before submission when an essential assessment cannot be completed, the patient refuses required data, or ordered care cannot be documented; urgency follows the patient’s current condition.",
                "document": "Record identity, actual times, complete findings, skilled service and need, response, homebound qualifier, teaching, and exact notification details.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p1-scope', label: 'LVN scope boundary', shortLabel: 'LVN scope bo…', ariaLabel: 'Investigate LVN scope boundary',
        x: 72, y: 72, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-4',
        observe: 'Document within LVN scope under RN direction. Escalate POC changes, diagnoses, prescriptions, and OASIS to authorized clinicians.',
                "identifyChoices": [
                {
                        "id": "p1-scope-identify-correct",
                        "label": "The LVN records objective change and escalates it; diagnosis, independent treatment change, and unverified orders are not documentation shortcuts.",
                        "correct": true,
                        "rationale": "Correct. The LVN records objective change and escalates it; diagnosis, independent treatment change, and unverified orders are not documentation shortcuts."
                },
                {
                        "id": "p1-scope-identify-revise",
                        "label": "The LVN should enter a new diagnosis and revise the plan whenever findings change.",
                        "correct": false,
                        "rationale": "Not defensible. The LVN records objective change and escalates it; diagnosis, independent treatment change, and unverified orders are not documentation shortcuts."
                }
        ],
        "decideChoices": [
                {
                        "id": "p1-scope-decide-correct",
                        "label": "Measure and describe the change, continue only authorized care, hold any unapproved change, and obtain RN direction during the visit.",
                        "correct": true,
                        "rationale": "Correct. Measure and describe the change, continue only authorized care, hold any unapproved change, and obtain RN direction during the visit."
                },
                {
                        "id": "p1-scope-decide-revise",
                        "label": "Choose a treatment from prior experience and document it as a verbal order afterward.",
                        "correct": false,
                        "rationale": "This misses the required response. Measure and describe the change, continue only authorized care, hold any unapproved change, and obtain RN direction during the visit."
                }
        ],
        "documentChoices": [
                {
                        "id": "p1-scope-document-correct",
                        "label": "Record location and measurements, symptoms and vitals, ordered care performed or held, RN name/time/mode, exact report, read-back direction, action, and response.",
                        "correct": true,
                        "rationale": "Correct. Record location and measurements, symptoms and vitals, ordered care performed or held, RN name/time/mode, exact report, read-back direction, action, and response."
                },
                {
                        "id": "p1-scope-document-revise",
                        "label": "Record “possible infection; treatment changed” without objective findings or verified direction.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record location and measurements, symptoms and vitals, ordered care performed or held, RN name/time/mode, exact report, read-back direction, action, and response."
                }
        ],
        "feedback": {
                "observed": "The LVN records objective change and escalates it; diagnosis, independent treatment change, and unverified orders are not documentation shortcuts.",
                "meaning": "The LVN records objective change and escalates it; diagnosis, independent treatment change, and unverified orders are not documentation shortcuts.",
                "action": "Measure and describe the change, continue only authorized care, hold any unapproved change, and obtain RN direction during the visit.",
                "notify": "Notify the RN during the visit for a new finding or needed plan change; use urgent escalation for rapid deterioration, systemic symptoms, severe pain, hemodynamic change, or other instability.",
                "document": "Record location and measurements, symptoms and vitals, ordered care performed or held, RN name/time/mode, exact report, read-back direction, action, and response.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 1, shortName: 'SOAP', title: 'The SOAP Framework: Structure That Protects You', subtitle: 'Subjective · Objective · Assessment · Plan — agency standard visit-note structure',
    narration: [      'Every LVN visit note at Care Indeed follows the SOAP format: Subjective, Objective, Assessment, and Plan. This is the agency documentation standard and the structure auditors, surveyors, and attorneys commonly expect in clinical visit notes. Using the template consistently reduces accidental omission of required elements; it does not replace clinical accuracy or critical thinking.',
      'The Subjective section captures information reported by the patient, caregiver, or family member—pain level using a validated scale when applicable, sleep quality, appetite, mood, functional complaints, and medication adherence self-report. Key rules: use quotation marks for direct patient statements, attribute information to the reporter, and never place your clinical interpretations in this section.',
      'The Objective section contains findings you directly observe, measure, and perform. Include vital signs per agency policy, physical assessment findings within LVN scope, functional observations, medication reconciliation results as assigned, and the specific skilled interventions you delivered. Write measurable language: not “wound looks better,” but dimensions, wound-bed description, drainage type/amount, and surrounding skin. Wound staging is reserved for the RN or other authorized clinician when that is the agency/clinical role boundary—document what you measure and observe, and report staging questions to the RN rather than independently assigning a stage if staging is outside your authorized role.',
      'The Assessment section is where you synthesize Subjective and Objective data into a clinical picture within LVN scope. You also address homebound status support here—a Medicare eligibility concept that must be documented at every visit with a specific clinical qualifier. The Plan section documents what happens next: next scheduled visit, instructions given, and any changes or concerns communicated to the RN case manager or physician. You do not independently develop or modify the Plan of Care; you report findings and obtain/relay orders through authorized channels.'], keyPoints: [
      { icon: '💬', title: 'Subjective', detail: 'Attribute direct reports and preserve meaningful symptom detail.' },
      { icon: '📏', title: 'Objective', detail: 'Record measured values, observable findings, and skilled actions.' },
      { icon: '🧠', title: 'Assessment', detail: 'Connect S and O within LVN scope without creating a diagnosis.' },
      { icon: '🗓️', title: 'Plan', detail: 'State authorized next steps, teaching, notifications, and follow-up.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img02,
    hotspots: [      {
        id: 'p2-s', label: 'Subjective', shortLabel: 'Subjective', ariaLabel: 'Investigate Subjective',
        x: 22, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0',
        observe: 'Patient/caregiver report only—quotes, attributes, pain scores as reported. No LVN interpretation here.',
                "identifyChoices": [
                {
                        "id": "p2-s-identify-correct",
                        "label": "SOAP Subjective preserves an attributed patient or caregiver report, including exact words and symptom timing, severity, and triggers.",
                        "correct": true,
                        "rationale": "Correct. SOAP Subjective preserves an attributed patient or caregiver report, including exact words and symptom timing, severity, and triggers."
                },
                {
                        "id": "p2-s-identify-revise",
                        "label": "A patient statement belongs in Objective after the LVN rewrites it as a clinical conclusion.",
                        "correct": false,
                        "rationale": "Not defensible. SOAP Subjective preserves an attributed patient or caregiver report, including exact words and symptom timing, severity, and triggers."
                }
        ],
        "decideChoices": [
                {
                        "id": "p2-s-decide-correct",
                        "label": "Capture the direct report and then obtain the ordered objective assessment needed to evaluate it.",
                        "correct": true,
                        "rationale": "Correct. Capture the direct report and then obtain the ordered objective assessment needed to evaluate it."
                },
                {
                        "id": "p2-s-decide-revise",
                        "label": "Shorten the report to “complains of problem” and omit onset, severity, and context.",
                        "correct": false,
                        "rationale": "This misses the required response. Capture the direct report and then obtain the ordered objective assessment needed to evaluate it."
                }
        ],
        "documentChoices": [
                {
                        "id": "p2-s-document-correct",
                        "label": "Record the reporter and quote, onset, duration, severity, associated symptoms, aggravating or relieving factors, and report time.",
                        "correct": true,
                        "rationale": "Correct. Record the reporter and quote, onset, duration, severity, associated symptoms, aggravating or relieving factors, and report time."
                },
                {
                        "id": "p2-s-document-revise",
                        "label": "Record “pain noted” or “SOB” without attribution or symptom details.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record the reporter and quote, onset, duration, severity, associated symptoms, aggravating or relieving factors, and report time."
                }
        ],
        "feedback": {
                "observed": "SOAP Subjective preserves an attributed patient or caregiver report, including exact words and symptom timing, severity, and triggers.",
                "meaning": "SOAP Subjective preserves an attributed patient or caregiver report, including exact words and symptom timing, severity, and triggers.",
                "action": "Capture the direct report and then obtain the ordered objective assessment needed to evaluate it.",
                "notify": "Notify the RN during the visit for a new or worsening symptom; activate emergency response immediately for severe distress, chest pain, cyanosis, altered responsiveness, or other emergency signs.",
                "document": "Record the reporter and quote, onset, duration, severity, associated symptoms, aggravating or relieving factors, and report time.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p2-o', label: 'Objective', shortLabel: 'Objective', ariaLabel: 'Investigate Objective',
        x: 50, y: 28, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-1-1',
        observe: 'Measurable findings and interventions you performed. Dimensions, vitals, drainage—not vague improvement language.',
                "identifyChoices": [
                {
                        "id": "p2-o-identify-correct",
                        "label": "SOAP Objective contains measured and directly observed facts with position, device, time, and comparison when clinically relevant.",
                        "correct": true,
                        "rationale": "Correct. SOAP Objective contains measured and directly observed facts with position, device, time, and comparison when clinically relevant."
                },
                {
                        "id": "p2-o-identify-revise",
                        "label": "“Looks worse” is equivalent to measured respiratory, wound, or vital-sign evidence.",
                        "correct": false,
                        "rationale": "Not defensible. SOAP Objective contains measured and directly observed facts with position, device, time, and comparison when clinically relevant."
                }
        ],
        "decideChoices": [
                {
                        "id": "p2-o-decide-correct",
                        "label": "Obtain complete ordered measurements, address immediate safety, repeat abnormal values as directed, and escalate based on severity.",
                        "correct": true,
                        "rationale": "Correct. Obtain complete ordered measurements, address immediate safety, repeat abnormal values as directed, and escalate based on severity."
                },
                {
                        "id": "p2-o-decide-revise",
                        "label": "Wait until end of day to report a severe value because the patient can still speak.",
                        "correct": false,
                        "rationale": "This misses the required response. Obtain complete ordered measurements, address immediate safety, repeat abnormal values as directed, and escalate based on severity."
                }
        ],
        "documentChoices": [
                {
                        "id": "p2-o-document-correct",
                        "label": "Record exact values, time, position, device or oxygen context, observed signs, baseline comparison, repeat findings, actions, notifications, and response.",
                        "correct": true,
                        "rationale": "Correct. Record exact values, time, position, device or oxygen context, observed signs, baseline comparison, repeat findings, actions, notifications, and response."
                },
                {
                        "id": "p2-o-document-revise",
                        "label": "Record “vitals abnormal; RN notified” without values, context, or outcome.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record exact values, time, position, device or oxygen context, observed signs, baseline comparison, repeat findings, actions, notifications, and response."
                }
        ],
        "feedback": {
                "observed": "SOAP Objective contains measured and directly observed facts with position, device, time, and comparison when clinically relevant.",
                "meaning": "SOAP Objective contains measured and directly observed facts with position, device, time, and comparison when clinically relevant.",
                "action": "Obtain complete ordered measurements, address immediate safety, repeat abnormal values as directed, and escalate based on severity.",
                "notify": "Notify the RN during the visit for values outside ordered parameters; notify urgently for severe findings and activate emergency response immediately for instability or emergency symptoms.",
                "document": "Record exact values, time, position, device or oxygen context, observed signs, baseline comparison, repeat findings, actions, notifications, and response.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p2-a', label: 'Assessment', shortLabel: 'Assessment', ariaLabel: 'Investigate Assessment',
        x: 78, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-2',
        observe: 'In-scope synthesis plus homebound clinical qualifier. Not a medical diagnosis.',
                "identifyChoices": [
                {
                        "id": "p2-a-identify-correct",
                        "label": "SOAP Assessment connects Subjective and Objective findings and trends within LVN scope without creating a diagnosis or independent order.",
                        "correct": true,
                        "rationale": "Correct. SOAP Assessment connects Subjective and Objective findings and trends within LVN scope without creating a diagnosis or independent order."
                },
                {
                        "id": "p2-a-identify-revise",
                        "label": "Assessment should convert a concerning trend into a new medical diagnosis and treatment order.",
                        "correct": false,
                        "rationale": "Not defensible. SOAP Assessment connects Subjective and Objective findings and trends within LVN scope without creating a diagnosis or independent order."
                }
        ],
        "decideChoices": [
                {
                        "id": "p2-a-decide-correct",
                        "label": "State the in-scope trend, compare it with baseline, and coordinate the change rather than diagnosing or rewriting the plan.",
                        "correct": true,
                        "rationale": "Correct. State the in-scope trend, compare it with baseline, and coordinate the change rather than diagnosing or rewriting the plan."
                },
                {
                        "id": "p2-a-decide-revise",
                        "label": "Copy “status stable” when the current report and measurements show decline.",
                        "correct": false,
                        "rationale": "This misses the required response. State the in-scope trend, compare it with baseline, and coordinate the change rather than diagnosing or rewriting the plan."
                }
        ],
        "documentChoices": [
                {
                        "id": "p2-a-document-correct",
                        "label": "Record the S-to-O connection, exact trend from baseline, clinical concern within scope, RN notification and direction, reassessment, and disposition.",
                        "correct": true,
                        "rationale": "Correct. Record the S-to-O connection, exact trend from baseline, clinical concern within scope, RN notification and direction, reassessment, and disposition."
                },
                {
                        "id": "p2-a-document-revise",
                        "label": "Record an unsupported diagnosis or a vague “continue to monitor.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record the S-to-O connection, exact trend from baseline, clinical concern within scope, RN notification and direction, reassessment, and disposition."
                }
        ],
        "feedback": {
                "observed": "SOAP Assessment connects Subjective and Objective findings and trends within LVN scope without creating a diagnosis or independent order.",
                "meaning": "SOAP Assessment connects Subjective and Objective findings and trends within LVN scope without creating a diagnosis or independent order.",
                "action": "State the in-scope trend, compare it with baseline, and coordinate the change rather than diagnosing or rewriting the plan.",
                "notify": "Notify the RN the same visit for a worsening trend or out-of-parameter finding; use urgent or emergency escalation for severe or rapidly worsening findings.",
                "document": "Record the S-to-O connection, exact trend from baseline, clinical concern within scope, RN notification and direction, reassessment, and disposition.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p2-p', label: 'Plan', shortLabel: 'Plan', ariaLabel: 'Investigate Plan',
        x: 50, y: 68, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-3',
        observe: 'Next visit, teaching, and what you reported to RN/physician. POC changes require authorized orders.',
                "identifyChoices": [
                {
                        "id": "p2-p-identify-correct",
                        "label": "SOAP Plan records verified authorized next steps, teaching, response, contingency triggers, coordination, and follow-up under the current plan.",
                        "correct": true,
                        "rationale": "Correct. SOAP Plan records verified authorized next steps, teaching, response, contingency triggers, coordination, and follow-up under the current plan."
                },
                {
                        "id": "p2-p-identify-revise",
                        "label": "The LVN may omit who gave direction and enter an independent change as the new plan.",
                        "correct": false,
                        "rationale": "Not defensible. SOAP Plan records verified authorized next steps, teaching, response, contingency triggers, coordination, and follow-up under the current plan."
                }
        ],
        "decideChoices": [
                {
                        "id": "p2-p-decide-correct",
                        "label": "Read back the direction, carry out authorized steps, teach the patient or caregiver, reassess, and state the next follow-up.",
                        "correct": true,
                        "rationale": "Correct. Read back the direction, carry out authorized steps, teach the patient or caregiver, reassess, and state the next follow-up."
                },
                {
                        "id": "p2-p-decide-revise",
                        "label": "Record “continue plan” without the direction, contingency, patient response, or follow-up.",
                        "correct": false,
                        "rationale": "This misses the required response. Read back the direction, carry out authorized steps, teach the patient or caregiver, reassess, and state the next follow-up."
                }
        ],
        "documentChoices": [
                {
                        "id": "p2-p-document-correct",
                        "label": "Record recipient, contact and read-back times, reason, exact direction, actions completed, teaching and teach-back, reassessment, contingency, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Record recipient, contact and read-back times, reason, exact direction, actions completed, teaching and teach-back, reassessment, contingency, and follow-up."
                },
                {
                        "id": "p2-p-document-revise",
                        "label": "Record “RN aware; monitor” without verified direction or closed-loop response.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record recipient, contact and read-back times, reason, exact direction, actions completed, teaching and teach-back, reassessment, contingency, and follow-up."
                }
        ],
        "feedback": {
                "observed": "SOAP Plan records verified authorized next steps, teaching, response, contingency triggers, coordination, and follow-up under the current plan.",
                "meaning": "SOAP Plan records verified authorized next steps, teaching, response, contingency triggers, coordination, and follow-up under the current plan.",
                "action": "Read back the direction, carry out authorized steps, teach the patient or caregiver, reassess, and state the next follow-up.",
                "notify": "Notify the RN at the urgency dictated by the finding; activate emergency response immediately when emergency criteria or the stated contingency trigger is met.",
                "document": "Record recipient, contact and read-back times, reason, exact direction, actions completed, teaching and teach-back, reassessment, contingency, and follow-up.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 2, shortName: 'Skilled Need', title: 'Skilled Service Justification: The Three-Part Test', subtitle: 'Every visit note must stand alone as skilled under the ordered Plan of Care',
    narration: [      'Every LVN visit in home health must be supportable as a skilled nursing service. This is a Medicare coverage and billing integrity concept with legal implications. Auditors often evaluate notes individually. A strong Start of Care (SOC) note written by an authorized clinician does not rescue a weak follow-up LVN note. Your documentation must be self-contained: any single visit note, read in isolation, should make skilled need clear.',
      'Part One: The service requires the skills of a licensed nurse. The intervention could not have been safely and effectively performed by an unlicensed person. Documentation must show the skill. Example: “Administered insulin 12 units subcutaneous per physician order; verified dose against MAR, used aseptic technique, monitored for signs of hypoglycemia per protocol” is stronger than “Gave insulin.”',
      'Part Two: The service is reasonable and necessary for treatment of the patient\'s illness or injury. Link the intervention to a condition on the ordered Plan of Care. Example: “Wound care per physician order for sacral pressure injury to promote healing, monitor for infection, and prevent rehospitalization” clearly ties skill to medical necessity.',
      'Part Three: The service is provided under a physician-ordered Plan of Care. Every skilled intervention you perform must be traceable to a current order (for example, CMS-485 / plan orders or a subsequent verbal/written order that has been properly received and documented per agency process). Common failures include “assessed patient” without specifying what was assessed and why skill was required, and “taught patient about medications” without documenting content, method, and comprehension verification (teach-back).'], keyPoints: [
      { icon: '🧤', title: 'Licensed skill', detail: 'Name the assessment, verification, technique, and monitoring used.' },
      { icon: '🎯', title: 'Clinical necessity', detail: 'Link the skill to today’s condition, risk, or treatment goal.' },
      { icon: '📑', title: 'Current order', detail: 'Trace every performed intervention to the active ordered plan.' },
      { icon: '📝', title: 'Self-contained note', detail: 'Include today’s findings, intervention, response, and coordination.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img03,
    hotspots: [      {
        id: 'p3-skill', label: 'Part 1 — Skill', shortLabel: 'Part 1 — Skill', ariaLabel: 'Investigate Part 1 — Skill',
        x: 20, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-0',
        observe: 'Document nursing skill: verification, sterile/aseptic technique, monitoring, and why unlicensed care is insufficient.',
                "identifyChoices": [
                {
                        "id": "p3-skill-identify-correct",
                        "label": "Licensed skill is demonstrated by assessment, verification, technique, surveillance, teaching, and response monitoring—not the task name.",
                        "correct": true,
                        "rationale": "Correct. Licensed skill is demonstrated by assessment, verification, technique, surveillance, teaching, and response monitoring—not the task name."
                },
                {
                        "id": "p3-skill-identify-revise",
                        "label": "“Dressing changed” fully demonstrates the nursing skill used during wound care.",
                        "correct": false,
                        "rationale": "Not defensible. Licensed skill is demonstrated by assessment, verification, technique, surveillance, teaching, and response monitoring—not the task name."
                }
        ],
        "decideChoices": [
                {
                        "id": "p3-skill-decide-correct",
                        "label": "Measure and assess the wound, perform the ordered technique, monitor tolerance, and reassess after care.",
                        "correct": true,
                        "rationale": "Correct. Measure and assess the wound, perform the ordered technique, monitor tolerance, and reassess after care."
                },
                {
                        "id": "p3-skill-decide-revise",
                        "label": "Reuse prior measurements because the dressing order is unchanged.",
                        "correct": false,
                        "rationale": "This misses the required response. Measure and assess the wound, perform the ordered technique, monitor tolerance, and reassess after care."
                }
        ],
        "documentChoices": [
                {
                        "id": "p3-skill-document-correct",
                        "label": "Record location, dimensions, tissue, drainage, odor, surrounding skin, pain, ordered products and technique, tolerance, post-care status, and teaching.",
                        "correct": true,
                        "rationale": "Correct. Record location, dimensions, tissue, drainage, odor, surrounding skin, pain, ordered products and technique, tolerance, post-care status, and teaching."
                },
                {
                        "id": "p3-skill-document-revise",
                        "label": "Record “wound care done per order” without assessment, technique, or response.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record location, dimensions, tissue, drainage, odor, surrounding skin, pain, ordered products and technique, tolerance, post-care status, and teaching."
                }
        ],
        "feedback": {
                "observed": "Licensed skill is demonstrated by assessment, verification, technique, surveillance, teaching, and response monitoring—not the task name.",
                "meaning": "Licensed skill is demonstrated by assessment, verification, technique, surveillance, teaching, and response monitoring—not the task name.",
                "action": "Measure and assess the wound, perform the ordered technique, monitor tolerance, and reassess after care.",
                "notify": "Notify the RN during the visit for infection indicators, deterioration, uncontrolled pain, bleeding, or inability to carry out the order; use urgent escalation for systemic symptoms or instability.",
                "document": "Record location, dimensions, tissue, drainage, odor, surrounding skin, pain, ordered products and technique, tolerance, post-care status, and teaching.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p3-rnm', label: 'Part 2 — Necessary', shortLabel: 'Part 2 — Nec…', ariaLabel: 'Investigate Part 2 — Necessary',
        x: 50, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-1',
        observe: 'Link intervention to illness/injury on the POC (healing, infection surveillance, exacerbation prevention).',
                "identifyChoices": [
                {
                        "id": "p3-rnm-identify-correct",
                        "label": "Clinical necessity links today’s licensed service to the patient-specific condition, risk, and treatment goal.",
                        "correct": true,
                        "rationale": "Correct. Clinical necessity links today’s licensed service to the patient-specific condition, risk, and treatment goal."
                },
                {
                        "id": "p3-rnm-identify-revise",
                        "label": "A diagnosis in the problem list proves necessity without connecting it to today’s service.",
                        "correct": false,
                        "rationale": "Not defensible. Clinical necessity links today’s licensed service to the patient-specific condition, risk, and treatment goal."
                }
        ],
        "decideChoices": [
                {
                        "id": "p3-rnm-decide-correct",
                        "label": "State why today’s assessment, technique, or teaching required nursing skill for this patient and condition.",
                        "correct": true,
                        "rationale": "Correct. State why today’s assessment, technique, or teaching required nursing skill for this patient and condition."
                },
                {
                        "id": "p3-rnm-decide-revise",
                        "label": "Use “routine visit” because no new complication was found.",
                        "correct": false,
                        "rationale": "This misses the required response. State why today’s assessment, technique, or teaching required nursing skill for this patient and condition."
                }
        ],
        "documentChoices": [
                {
                        "id": "p3-rnm-document-correct",
                        "label": "Record the relevant condition and risk, current findings and trend, skilled surveillance, intervention, goal, response, and coordination.",
                        "correct": true,
                        "rationale": "Correct. Record the relevant condition and risk, current findings and trend, skilled surveillance, intervention, goal, response, and coordination."
                },
                {
                        "id": "p3-rnm-document-revise",
                        "label": "Record “medically necessary care” without patient-specific supporting facts.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record the relevant condition and risk, current findings and trend, skilled surveillance, intervention, goal, response, and coordination."
                }
        ],
        "feedback": {
                "observed": "Clinical necessity links today’s licensed service to the patient-specific condition, risk, and treatment goal.",
                "meaning": "Clinical necessity links today’s licensed service to the patient-specific condition, risk, and treatment goal.",
                "action": "State why today’s assessment, technique, or teaching required nursing skill for this patient and condition.",
                "notify": "Notify the RN the same day for stalled progress or increased risk, during the visit for meaningful deterioration, and urgently for systemic or unstable findings.",
                "document": "Record the relevant condition and risk, current findings and trend, skilled surveillance, intervention, goal, response, and coordination.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p3-poc', label: 'Part 3 — Ordered POC', shortLabel: 'Part 3 — Ord…', ariaLabel: 'Investigate Part 3 — Ordered POC',
        x: 80, y: 40, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-2',
        observe: 'Every skilled act must map to a current physician order. Escalate needed order changes to RN/physician.',
                "identifyChoices": [
                {
                        "id": "p3-poc-identify-correct",
                        "label": "Every performed intervention must trace to a current verified order; a supply or treatment mismatch is a coordination trigger.",
                        "correct": true,
                        "rationale": "Correct. Every performed intervention must trace to a current verified order; a supply or treatment mismatch is a coordination trigger."
                },
                {
                        "id": "p3-poc-identify-revise",
                        "label": "A clinically similar product may be substituted and charted as ordered without verification.",
                        "correct": false,
                        "rationale": "Not defensible. Every performed intervention must trace to a current verified order; a supply or treatment mismatch is a coordination trigger."
                }
        ],
        "decideChoices": [
                {
                        "id": "p3-poc-decide-correct",
                        "label": "Hold the unverified substitution, protect the patient, and obtain RN direction during the visit before proceeding.",
                        "correct": true,
                        "rationale": "Correct. Hold the unverified substitution, protect the patient, and obtain RN direction during the visit before proceeding."
                },
                {
                        "id": "p3-poc-decide-revise",
                        "label": "Use the available product and request approval after submission.",
                        "correct": false,
                        "rationale": "This misses the required response. Hold the unverified substitution, protect the patient, and obtain RN direction during the visit before proceeding."
                }
        ],
        "documentChoices": [
                {
                        "id": "p3-poc-document-correct",
                        "label": "Record the order reviewed, exact mismatch, care held, protective action, RN name/time/mode, verified direction and read-back, intervention, and response.",
                        "correct": true,
                        "rationale": "Correct. Record the order reviewed, exact mismatch, care held, protective action, RN name/time/mode, verified direction and read-back, intervention, and response."
                },
                {
                        "id": "p3-poc-document-revise",
                        "label": "Record the available product as though it appeared in the current order.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record the order reviewed, exact mismatch, care held, protective action, RN name/time/mode, verified direction and read-back, intervention, and response."
                }
        ],
        "feedback": {
                "observed": "Every performed intervention must trace to a current verified order; a supply or treatment mismatch is a coordination trigger.",
                "meaning": "Every performed intervention must trace to a current verified order; a supply or treatment mismatch is a coordination trigger.",
                "action": "Hold the unverified substitution, protect the patient, and obtain RN direction during the visit before proceeding.",
                "notify": "Notify the RN during the visit for any order mismatch; escalate urgently if delay exposes the patient to immediate harm or the condition is unstable.",
                "document": "Record the order reviewed, exact mismatch, care held, protective action, RN name/time/mode, verified direction and read-back, intervention, and response.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p3-alone', label: 'Self-contained note', shortLabel: 'Self-contain…', ariaLabel: 'Investigate Self-contained note',
        x: 50, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-3',
        observe: 'Each visit note is audited alone. Do not assume prior notes “cover” missing skilled content today.',
                "identifyChoices": [
                {
                        "id": "p3-alone-identify-correct",
                        "label": "A self-contained note independently supports today’s findings, skilled service, necessity, order, response, and coordination.",
                        "correct": true,
                        "rationale": "Correct. A self-contained note independently supports today’s findings, skilled service, necessity, order, response, and coordination."
                },
                {
                        "id": "p3-alone-identify-revise",
                        "label": "A complete prior note may stand in for unchanged current findings and response.",
                        "correct": false,
                        "rationale": "Not defensible. A self-contained note independently supports today’s findings, skilled service, necessity, order, response, and coordination."
                }
        ],
        "decideChoices": [
                {
                        "id": "p3-alone-decide-correct",
                        "label": "Reassess and complete today’s patient-specific record before submission.",
                        "correct": true,
                        "rationale": "Correct. Reassess and complete today’s patient-specific record before submission."
                },
                {
                        "id": "p3-alone-decide-revise",
                        "label": "Submit “see previous note” and wait for the RN to request details.",
                        "correct": false,
                        "rationale": "This misses the required response. Reassess and complete today’s patient-specific record before submission."
                }
        ],
        "documentChoices": [
                {
                        "id": "p3-alone-document-correct",
                        "label": "Record today’s measurements and trend, skilled assessment and ordered technique, clinical need, response, teaching, homebound support, and notifications.",
                        "correct": true,
                        "rationale": "Correct. Record today’s measurements and trend, skilled assessment and ordered technique, clinical need, response, teaching, homebound support, and notifications."
                },
                {
                        "id": "p3-alone-document-revise",
                        "label": "Record “same care and findings as last visit.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record today’s measurements and trend, skilled assessment and ordered technique, clinical need, response, teaching, homebound support, and notifications."
                }
        ],
        "feedback": {
                "observed": "A self-contained note independently supports today’s findings, skilled service, necessity, order, response, and coordination.",
                "meaning": "A self-contained note independently supports today’s findings, skilled service, necessity, order, response, and coordination.",
                "action": "Reassess and complete today’s patient-specific record before submission.",
                "notify": "Notify the RN before submission if required current findings cannot be obtained or the ordered service was incomplete; urgency follows the patient’s condition.",
                "document": "Record today’s measurements and trend, skilled assessment and ordered technique, clinical need, response, teaching, homebound support, and notifications.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 3, shortName: 'Timeliness', title: 'Homebound Status, Timeliness & Submission Standards', subtitle: 'Federal eligibility concept + agency documentation timelines',
    narration: [      'Homebound status documentation is one of the most frequently cited deficiency themes in home health surveys and audits. For home-health documentation, the clinical record supports homebound status when leaving home requires considerable and taxing effort due to illness or injury, and absences are infrequent or of relatively short duration for purposes such as medical care (and other limited exceptions defined in regulation/guidance). You must document homebound support at every visit with a specific clinical qualifier—not a bare label.',
      'Acceptable example: “Patient remains homebound due to severe COPD with dyspnea on minimal exertion, continuous O2 at 3 L/min, unable to ambulate more than ~15 feet without rest.” Unacceptable: “Patient is homebound” with no clinical basis. If homebound status appears to change, report to the RN case manager immediately and document your observations and notification. Continuing to chart homebound support for a patient who no longer meets criteria creates compliance risk; eligibility determinations and POC adjustments are coordinated by the authorized clinicians—not independently by the LVN.',
      'Timeliness is primarily an agency operational standard. Care Indeed agency policy requires visit documentation completed and submitted in the EHR within 24 hours of the visit. Clinically, the RN and physician need timely information. From a billing and coordination perspective, late notes delay care handoffs and claims workflows. From a regulatory perspective, organized, timely clinical records support survey readiness under clinical-record expectations.',
      'Agency performance coaching may use on-time documentation targets (for example, coaching conversations when personal completion rates fall below agency thresholds). Those percentage targets and progressive-discipline pathways are agency policy, not universal federal deadlines. Practical habits: complete the SOAP note as soon as safely possible after the visit (often before driving away), use approved EHR tools (including voice-to-text if enabled), and pre-stage templates without cloning stale clinical content.'], keyPoints: [
      { icon: '🏠', title: 'Homebound support', detail: 'Describe why leaving home is difficult and taxing today.' },
      { icon: '⏱️', title: 'Submission clock', detail: 'Capture facts promptly and address barriers before the agency deadline.' },
      { icon: '☎️', title: 'Change coordination', detail: 'Match a meaningful change to recipient, urgency, and direction.' },
      { icon: '🔁', title: 'Patient response', detail: 'Reassess and record tolerance, outcome, or teach-back.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img04,
    hotspots: [      {
        id: 'p4-hb', label: 'Homebound qualifier', shortLabel: 'Homebound qu…', ariaLabel: 'Investigate Homebound qualifier',
        x: 22, y: 32, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0',
        observe: 'Every visit needs a specific clinical reason leaving home is taxing—not the bare word “homebound.”',
                "identifyChoices": [
                {
                        "id": "p4-hb-identify-correct",
                        "label": "Homebound support requires current clinical and functional facts showing why leaving home is difficult and taxing.",
                        "correct": true,
                        "rationale": "Correct. Homebound support requires current clinical and functional facts showing why leaving home is difficult and taxing."
                },
                {
                        "id": "p4-hb-identify-revise",
                        "label": "The bare phrase “patient is homebound” supplies the required clinical qualifier.",
                        "correct": false,
                        "rationale": "Not defensible. Homebound support requires current clinical and functional facts showing why leaving home is difficult and taxing."
                }
        ],
        "decideChoices": [
                {
                        "id": "p4-hb-decide-correct",
                        "label": "Document the device, assistance, tolerated distance or activity, limiting symptom, and recovery observed or attributed today.",
                        "correct": true,
                        "rationale": "Correct. Document the device, assistance, tolerated distance or activity, limiting symptom, and recovery observed or attributed today."
                },
                {
                        "id": "p4-hb-decide-revise",
                        "label": "Copy the start-of-care qualifier without checking current function.",
                        "correct": false,
                        "rationale": "This misses the required response. Document the device, assistance, tolerated distance or activity, limiting symptom, and recovery observed or attributed today."
                }
        ],
        "documentChoices": [
                {
                        "id": "p4-hb-document-correct",
                        "label": "Record assistive device, assistance level, distance or activity, symptom, rest or recovery, source, baseline comparison, and RN contact for change.",
                        "correct": true,
                        "rationale": "Correct. Record assistive device, assistance level, distance or activity, symptom, rest or recovery, source, baseline comparison, and RN contact for change."
                },
                {
                        "id": "p4-hb-document-revise",
                        "label": "Record “homebound due to weakness” without functional evidence.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record assistive device, assistance level, distance or activity, symptom, rest or recovery, source, baseline comparison, and RN contact for change."
                }
        ],
        "feedback": {
                "observed": "Homebound support requires current clinical and functional facts showing why leaving home is difficult and taxing.",
                "meaning": "Homebound support requires current clinical and functional facts showing why leaving home is difficult and taxing.",
                "action": "Document the device, assistance, tolerated distance or activity, limiting symptom, and recovery observed or attributed today.",
                "notify": "No separate notice is needed when status remains consistent; notify the RN the same day for material improvement or decline and urgently for acute symptoms or instability.",
                "document": "Record assistive device, assistance level, distance or activity, symptom, rest or recovery, source, baseline comparison, and RN contact for change.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p4-clock', label: '24-hour agency clock', shortLabel: '24-hour agen…', ariaLabel: 'Investigate 24-hour agency clock',
        x: 70, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1',
        observe: 'Agency policy: complete and submit documentation within 24 hours of the visit.',
                "identifyChoices": [
                {
                        "id": "p4-clock-identify-correct",
                        "label": "The agency submission clock requires prompt, accurate capture; downtime must use the approved secure workflow and actual timestamps.",
                        "correct": true,
                        "rationale": "Correct. The agency submission clock requires prompt, accurate capture; downtime must use the approved secure workflow and actual timestamps."
                },
                {
                        "id": "p4-clock-identify-revise",
                        "label": "An outage permits silent delay, personal-device notes, or backdating when access returns.",
                        "correct": false,
                        "rationale": "Not defensible. The agency submission clock requires prompt, accurate capture; downtime must use the approved secure workflow and actual timestamps."
                }
        ],
        "decideChoices": [
                {
                        "id": "p4-clock-decide-correct",
                        "label": "Use the approved secure downtime method, promptly contact required support and RN channels, and enter the note when access is restored.",
                        "correct": true,
                        "rationale": "Correct. Use the approved secure downtime method, promptly contact required support and RN channels, and enter the note when access is restored."
                },
                {
                        "id": "p4-clock-decide-revise",
                        "label": "Wait for the EHR to return and reconstruct the encounter from memory.",
                        "correct": false,
                        "rationale": "This misses the required response. Use the approved secure downtime method, promptly contact required support and RN channels, and enter the note when access is restored."
                }
        ],
        "documentChoices": [
                {
                        "id": "p4-clock-document-correct",
                        "label": "Record actual visit times, downtime onset, approved temporary method, contacts and times, resolution, actual EHR entry time, submission time, and delay reason.",
                        "correct": true,
                        "rationale": "Correct. Record actual visit times, downtime onset, approved temporary method, contacts and times, resolution, actual EHR entry time, submission time, and delay reason."
                },
                {
                        "id": "p4-clock-document-revise",
                        "label": "Backdate the EHR entry to make it appear submitted at visit end.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record actual visit times, downtime onset, approved temporary method, contacts and times, resolution, actual EHR entry time, submission time, and delay reason."
                }
        ],
        "feedback": {
                "observed": "The agency submission clock requires prompt, accurate capture; downtime must use the approved secure workflow and actual timestamps.",
                "meaning": "The agency submission clock requires prompt, accurate capture; downtime must use the approved secure workflow and actual timestamps.",
                "action": "Use the approved secure downtime method, promptly contact required support and RN channels, and enter the note when access is restored.",
                "notify": "Notify EHR support and the RN promptly when downtime threatens timely submission; escalate the same day if the barrier remains unresolved near the agency deadline.",
                "document": "Record actual visit times, downtime onset, approved temporary method, contacts and times, resolution, actual EHR entry time, submission time, and delay reason.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p4-rn', label: 'Report change to RN', shortLabel: 'Report chang…', ariaLabel: 'Investigate Report change to RN',
        x: 30, y: 70, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-3-2',
        observe: 'If homebound status appears changed, notify the RN case manager and document observation + notification.',
                "identifyChoices": [
                {
                        "id": "p4-rn-identify-correct",
                        "label": "A meaningful change in homebound function, transfer ability, symptoms, or safety requires objective evidence and RN coordination.",
                        "correct": true,
                        "rationale": "Correct. A meaningful change in homebound function, transfer ability, symptoms, or safety requires objective evidence and RN coordination."
                },
                {
                        "id": "p4-rn-identify-revise",
                        "label": "Functional decline can wait until the next visit when no injury has occurred.",
                        "correct": false,
                        "rationale": "Not defensible. A meaningful change in homebound function, transfer ability, symptoms, or safety requires objective evidence and RN coordination."
                }
        ],
        "decideChoices": [
                {
                        "id": "p4-rn-decide-correct",
                        "label": "Protect the patient, assess ordered parameters, compare baseline with current function, and notify the RN during the visit.",
                        "correct": true,
                        "rationale": "Correct. Protect the patient, assess ordered parameters, compare baseline with current function, and notify the RN during the visit."
                },
                {
                        "id": "p4-rn-decide-revise",
                        "label": "Record “weak today” and submit without calling the RN.",
                        "correct": false,
                        "rationale": "This misses the required response. Protect the patient, assess ordered parameters, compare baseline with current function, and notify the RN during the visit."
                }
        ],
        "documentChoices": [
                {
                        "id": "p4-rn-document-correct",
                        "label": "Record prior and current assistance, patient or caregiver report with timing, gait or transfer findings, vitals, precautions, RN contact, direction, and disposition.",
                        "correct": true,
                        "rationale": "Correct. Record prior and current assistance, patient or caregiver report with timing, gait or transfer findings, vitals, precautions, RN contact, direction, and disposition."
                },
                {
                        "id": "p4-rn-document-revise",
                        "label": "Record “RN informed of change” without the facts, time, or response.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record prior and current assistance, patient or caregiver report with timing, gait or transfer findings, vitals, precautions, RN contact, direction, and disposition."
                }
        ],
        "feedback": {
                "observed": "A meaningful change in homebound function, transfer ability, symptoms, or safety requires objective evidence and RN coordination.",
                "meaning": "A meaningful change in homebound function, transfer ability, symptoms, or safety requires objective evidence and RN coordination.",
                "action": "Protect the patient, assess ordered parameters, compare baseline with current function, and notify the RN during the visit.",
                "notify": "Notify the RN during the visit for new decline or near-falls; activate urgent or emergency escalation for injury, acute neurologic change, syncope, inability to bear weight, or instability.",
                "document": "Record prior and current assistance, patient or caregiver report with timing, gait or transfer findings, vitals, precautions, RN contact, direction, and disposition.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p4-habit', label: 'Same-day habit', shortLabel: 'Same-day habit', ariaLabel: 'Investigate Same-day habit',
        x: 78, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-3',
        observe: 'Document as soon as safely possible after the visit. Templates help; cloning stale findings harms accuracy.',
                "identifyChoices": [
                {
                        "id": "p4-habit-identify-correct",
                        "label": "Patient response shows whether the intervention worked through reassessment, tolerance, symptom change, demonstration, or teach-back.",
                        "correct": true,
                        "rationale": "Correct. Patient response shows whether the intervention worked through reassessment, tolerance, symptom change, demonstration, or teach-back."
                },
                {
                        "id": "p4-habit-identify-revise",
                        "label": "Attendance during teaching or treatment proves understanding and tolerance.",
                        "correct": false,
                        "rationale": "Not defensible. Patient response shows whether the intervention worked through reassessment, tolerance, symptom change, demonstration, or teach-back."
                }
        ],
        "decideChoices": [
                {
                        "id": "p4-habit-decide-correct",
                        "label": "Reassess after care, verify teach-back, address any gap, and coordinate unresolved safety concerns.",
                        "correct": true,
                        "rationale": "Correct. Reassess after care, verify teach-back, address any gap, and coordinate unresolved safety concerns."
                },
                {
                        "id": "p4-habit-decide-revise",
                        "label": "Mark the goal met after presenting information without checking response.",
                        "correct": false,
                        "rationale": "This misses the required response. Reassess after care, verify teach-back, address any gap, and coordinate unresolved safety concerns."
                }
        ],
        "documentChoices": [
                {
                        "id": "p4-habit-document-correct",
                        "label": "Record intervention or teaching content, method, pre/post findings, exact response or teach-back, missed elements, reteaching, repeat result, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Record intervention or teaching content, method, pre/post findings, exact response or teach-back, missed elements, reteaching, repeat result, and follow-up."
                },
                {
                        "id": "p4-habit-document-revise",
                        "label": "Record “tolerated well” or “verbalized understanding” without evidence.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record intervention or teaching content, method, pre/post findings, exact response or teach-back, missed elements, reteaching, repeat result, and follow-up."
                }
        ],
        "feedback": {
                "observed": "Patient response shows whether the intervention worked through reassessment, tolerance, symptom change, demonstration, or teach-back.",
                "meaning": "Patient response shows whether the intervention worked through reassessment, tolerance, symptom change, demonstration, or teach-back.",
                "action": "Reassess after care, verify teach-back, address any gap, and coordinate unresolved safety concerns.",
                "notify": "Notify the RN the same day if the expected response is not achieved or safety-critical teaching remains unsuccessful; notify during the visit for immediate risk or clinical deterioration.",
                "document": "Record intervention or teaching content, method, pre/post findings, exact response or teach-back, missed elements, reteaching, repeat result, and follow-up.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 4, shortName: 'Doc Errors', title: 'The Five Most Common LVN Documentation Errors', subtitle: 'Clone risk, homebound gaps, vague skill, incomplete vitals, weak teaching notes',
    narration: [      'Agency documentation audits commonly surface five recurring LVN errors. Learning them as failure modes helps you build a pre-submit checklist.',
      'Error One — Cloning: copying a previous visit note and submitting it with minimal changes. Cloned notes frequently contain inaccurate vital signs, outdated wound measurements, and goals already met. Auditors detect cloning by sequential comparison. Cloning can also create false or misleading records. Solution: start every note from today’s encounter; templates are scaffolding, not copy-paste clinical truth.',
      'Error Two — Missing homebound status: homebound support with a clinical qualifier is required at every visit. A single missing statement in a long episode can still create a deficiency finding.',
      'Error Three — Vague skilled justification: “Assessed patient” is not skilled justification. “Performed teaching” without content, method, and teach-back fails Medicare-style education documentation expectations. Use the three-part test as a mental checklist.'], keyPoints: [
      { icon: '🧬', title: 'Clone risk', detail: 'Replace copied clinical content with today’s observations and values.' },
      { icon: '🏠', title: 'Missing qualifier', detail: 'Add current functional facts supporting homebound status.' },
      { icon: '🩺', title: 'Vague skill', detail: 'Show assessment, technique, necessity, and response.' },
      { icon: '💓', title: 'Incomplete vitals', detail: 'Enter the ordered set or explain why a value was unobtainable.' },
      { icon: '🎓', title: 'Weak education', detail: 'Record content, method, and exact teach-back result.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img05,
    hotspots: [      {
        id: 'p5-clone', label: 'Cloning', shortLabel: 'Cloning', ariaLabel: 'Investigate Cloning',
        x: 18, y: 30, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-4-0',
        observe: 'Copy-forward notes often retain wrong vitals and old wound data. Start fresh from today’s visit.',
                "identifyChoices": [
                {
                        "id": "p5-clone-identify-correct",
                        "label": "Copied prior clinical facts create an inaccurate record even when a template structure is reused.",
                        "correct": true,
                        "rationale": "Correct. Copied prior clinical facts create an inaccurate record even when a template structure is reused."
                },
                {
                        "id": "p5-clone-identify-revise",
                        "label": "Copy-forward is safe when the diagnosis and ordered service are unchanged.",
                        "correct": false,
                        "rationale": "Not defensible. Copied prior clinical facts create an inaccurate record even when a template structure is reused."
                }
        ],
        "decideChoices": [
                {
                        "id": "p5-clone-decide-correct",
                        "label": "Stop submission, replace every stale fact with today’s verified findings, and use the correction workflow if inaccurate content was authenticated.",
                        "correct": true,
                        "rationale": "Correct. Stop submission, replace every stale fact with today’s verified findings, and use the correction workflow if inaccurate content was authenticated."
                },
                {
                        "id": "p5-clone-decide-revise",
                        "label": "Change only the date and leave the prior values and response in place.",
                        "correct": false,
                        "rationale": "This misses the required response. Stop submission, replace every stale fact with today’s verified findings, and use the correction workflow if inaccurate content was authenticated."
                }
        ],
        "documentChoices": [
                {
                        "id": "p5-clone-document-correct",
                        "label": "Record today’s facts; for a correction, identify the original error, corrected fact, discovery and entry times, reason, author, RN contact, impact review, and resolution.",
                        "correct": true,
                        "rationale": "Correct. Record today’s facts; for a correction, identify the original error, corrected fact, discovery and entry times, reason, author, RN contact, impact review, and resolution."
                },
                {
                        "id": "p5-clone-document-revise",
                        "label": "Overwrite an authenticated original so the stale content disappears from view.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record today’s facts; for a correction, identify the original error, corrected fact, discovery and entry times, reason, author, RN contact, impact review, and resolution."
                }
        ],
        "feedback": {
                "observed": "Copied prior clinical facts create an inaccurate record even when a template structure is reused.",
                "meaning": "Copied prior clinical facts create an inaccurate record even when a template structure is reused.",
                "action": "Stop submission, replace every stale fact with today’s verified findings, and use the correction workflow if inaccurate content was authenticated.",
                "notify": "Notify the RN the same day if copied content was submitted or authenticated and immediately if the inaccuracy could affect current care.",
                "document": "Record today’s facts; for a correction, identify the original error, corrected fact, discovery and entry times, reason, author, RN contact, impact review, and resolution.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p5-hb', label: 'Missing homebound', shortLabel: 'Missing home…', ariaLabel: 'Investigate Missing homebound',
        x: 50, y: 24, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-1',
        observe: 'Every visit needs homebound support with a clinical qualifier.',
                "identifyChoices": [
                {
                        "id": "p5-hb-identify-correct",
                        "label": "A bare homebound label is weak; a defensible note contains today’s functional limitation and taxing-effort evidence.",
                        "correct": true,
                        "rationale": "Correct. A bare homebound label is weak; a defensible note contains today’s functional limitation and taxing-effort evidence."
                },
                {
                        "id": "p5-hb-identify-revise",
                        "label": "The diagnosis automatically supplies the missing homebound qualifier.",
                        "correct": false,
                        "rationale": "Not defensible. A bare homebound label is weak; a defensible note contains today’s functional limitation and taxing-effort evidence."
                }
        ],
        "decideChoices": [
                {
                        "id": "p5-hb-decide-correct",
                        "label": "Add current observed or attributed device, assistance, activity tolerance, symptom, and recovery facts before submission.",
                        "correct": true,
                        "rationale": "Correct. Add current observed or attributed device, assistance, activity tolerance, symptom, and recovery facts before submission."
                },
                {
                        "id": "p5-hb-decide-revise",
                        "label": "Copy a qualifier from an earlier assessment without verifying it today.",
                        "correct": false,
                        "rationale": "This misses the required response. Add current observed or attributed device, assistance, activity tolerance, symptom, and recovery facts before submission."
                }
        ],
        "documentChoices": [
                {
                        "id": "p5-hb-document-correct",
                        "label": "Record device, assistance, distance or activity, limiting symptom, taxing effort, recovery, source, baseline comparison, and RN contact for change.",
                        "correct": true,
                        "rationale": "Correct. Record device, assistance, distance or activity, limiting symptom, taxing effort, recovery, source, baseline comparison, and RN contact for change."
                },
                {
                        "id": "p5-hb-document-revise",
                        "label": "Record only “patient remains homebound.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record device, assistance, distance or activity, limiting symptom, taxing effort, recovery, source, baseline comparison, and RN contact for change."
                }
        ],
        "feedback": {
                "observed": "A bare homebound label is weak; a defensible note contains today’s functional limitation and taxing-effort evidence.",
                "meaning": "A bare homebound label is weak; a defensible note contains today’s functional limitation and taxing-effort evidence.",
                "action": "Add current observed or attributed device, assistance, activity tolerance, symptom, and recovery facts before submission.",
                "notify": "Notify the RN the same day when current facts materially differ from the prior homebound picture; use urgent escalation for acute symptoms or instability.",
                "document": "Record device, assistance, distance or activity, limiting symptom, taxing effort, recovery, source, baseline comparison, and RN contact for change.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p5-vague', label: 'Vague skill', shortLabel: 'Vague skill', ariaLabel: 'Investigate Vague skill',
        x: 82, y: 30, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-4-2',
        observe: '“Assessed/taught” without detail fails the skilled test and education triad.',
                "identifyChoices": [
                {
                        "id": "p5-vague-identify-correct",
                        "label": "“Assessed” or “taught” names a task but does not show objective findings, licensed skill, necessity, or response.",
                        "correct": true,
                        "rationale": "Correct. “Assessed” or “taught” names a task but does not show objective findings, licensed skill, necessity, or response."
                },
                {
                        "id": "p5-vague-identify-revise",
                        "label": "Adding the word “skilled” to a task label makes the narrative defensible.",
                        "correct": false,
                        "rationale": "Not defensible. “Assessed” or “taught” names a task but does not show objective findings, licensed skill, necessity, or response."
                }
        ],
        "decideChoices": [
                {
                        "id": "p5-vague-decide-correct",
                        "label": "Replace vague verbs with the exact assessment, technique, patient-specific reason, outcome, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Replace vague verbs with the exact assessment, technique, patient-specific reason, outcome, and follow-up."
                },
                {
                        "id": "p5-vague-decide-revise",
                        "label": "Rely on the visit code to supply missing clinical detail.",
                        "correct": false,
                        "rationale": "This misses the required response. Replace vague verbs with the exact assessment, technique, patient-specific reason, outcome, and follow-up."
                }
        ],
        "documentChoices": [
                {
                        "id": "p5-vague-document-correct",
                        "label": "Record exact findings, ordered steps and technique, clinical purpose, pre/post status, tolerance, teaching and teach-back, coordination, and next focus.",
                        "correct": true,
                        "rationale": "Correct. Record exact findings, ordered steps and technique, clinical purpose, pre/post status, tolerance, teaching and teach-back, coordination, and next focus."
                },
                {
                        "id": "p5-vague-document-revise",
                        "label": "Record “skilled assessment and care completed; tolerated well.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record exact findings, ordered steps and technique, clinical purpose, pre/post status, tolerance, teaching and teach-back, coordination, and next focus."
                }
        ],
        "feedback": {
                "observed": "“Assessed” or “taught” names a task but does not show objective findings, licensed skill, necessity, or response.",
                "meaning": "“Assessed” or “taught” names a task but does not show objective findings, licensed skill, necessity, or response.",
                "action": "Replace vague verbs with the exact assessment, technique, patient-specific reason, outcome, and follow-up.",
                "notify": "Notify the RN during the visit for deterioration or an order issue; before submission, notify the RN if required skilled facts cannot be verified accurately.",
                "document": "Record exact findings, ordered steps and technique, clinical purpose, pre/post status, tolerance, teaching and teach-back, coordination, and next focus.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p5-vitals', label: 'Incomplete vitals', shortLabel: 'Incomplete v…', ariaLabel: 'Investigate Incomplete vitals',
        x: 32, y: 70, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-3',
        observe: 'Agency policy: BP, HR, RR, temp, SpO2 each visit (or document refusal/response). Weight when required.',
                "identifyChoices": [
                {
                        "id": "p5-vitals-identify-correct",
                        "label": "A missing required vital sign needs a documented reason, safety response, and coordination—not a silent blank or prior value.",
                        "correct": true,
                        "rationale": "Correct. A missing required vital sign needs a documented reason, safety response, and coordination—not a silent blank or prior value."
                },
                {
                        "id": "p5-vitals-identify-revise",
                        "label": "A blank field fully explains that a device failed or the patient refused.",
                        "correct": false,
                        "rationale": "Not defensible. A missing required vital sign needs a documented reason, safety response, and coordination—not a silent blank or prior value."
                }
        ],
        "decideChoices": [
                {
                        "id": "p5-vitals-decide-correct",
                        "label": "Troubleshoot or use an approved functioning device, assess the patient, and contact the RN if the value remains unobtainable or symptoms are present.",
                        "correct": true,
                        "rationale": "Correct. Troubleshoot or use an approved functioning device, assess the patient, and contact the RN if the value remains unobtainable or symptoms are present."
                },
                {
                        "id": "p5-vitals-decide-revise",
                        "label": "Enter the prior visit’s value to complete the required field.",
                        "correct": false,
                        "rationale": "This misses the required response. Troubleshoot or use an approved functioning device, assess the patient, and contact the RN if the value remains unobtainable or symptoms are present."
                }
        ],
        "documentChoices": [
                {
                        "id": "p5-vitals-document-correct",
                        "label": "Record each attempt and time, device or refusal reason, troubleshooting, symptoms, available vitals, RN contact and direction, repeat attempt, and disposition.",
                        "correct": true,
                        "rationale": "Correct. Record each attempt and time, device or refusal reason, troubleshooting, symptoms, available vitals, RN contact and direction, repeat attempt, and disposition."
                },
                {
                        "id": "p5-vitals-document-revise",
                        "label": "Record “unable to obtain” without attempts, clinical context, or outcome.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record each attempt and time, device or refusal reason, troubleshooting, symptoms, available vitals, RN contact and direction, repeat attempt, and disposition."
                }
        ],
        "feedback": {
                "observed": "A missing required vital sign needs a documented reason, safety response, and coordination—not a silent blank or prior value.",
                "meaning": "A missing required vital sign needs a documented reason, safety response, and coordination—not a silent blank or prior value.",
                "action": "Troubleshoot or use an approved functioning device, assess the patient, and contact the RN if the value remains unobtainable or symptoms are present.",
                "notify": "Notify the RN during the visit when a required value remains unobtainable, symptoms are present, or parameters cannot be assessed; use urgent escalation for distress or instability.",
                "document": "Record each attempt and time, device or refusal reason, troubleshooting, symptoms, available vitals, RN contact and direction, repeat attempt, and disposition.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p5-edu', label: 'Weak education', shortLabel: 'Weak education', ariaLabel: 'Investigate Weak education',
        x: 72, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-4',
        observe: 'Document topic, method, and teach-back result—not a one-line “educated patient.”',
                "identifyChoices": [
                {
                        "id": "p5-edu-identify-correct",
                        "label": "Defensible education documents the learner, exact content, method, and measured teach-back result.",
                        "correct": true,
                        "rationale": "Correct. Defensible education documents the learner, exact content, method, and measured teach-back result."
                },
                {
                        "id": "p5-edu-identify-revise",
                        "label": "A visit signature proves the patient understood all teaching.",
                        "correct": false,
                        "rationale": "Not defensible. Defensible education documents the learner, exact content, method, and measured teach-back result."
                }
        ],
        "decideChoices": [
                {
                        "id": "p5-edu-decide-correct",
                        "label": "Teach specific signs and actions, verify with teach-back or demonstration, reteach missed elements, and repeat the check.",
                        "correct": true,
                        "rationale": "Correct. Teach specific signs and actions, verify with teach-back or demonstration, reteach missed elements, and repeat the check."
                },
                {
                        "id": "p5-edu-decide-revise",
                        "label": "Mark education complete after presenting the information once.",
                        "correct": false,
                        "rationale": "This misses the required response. Teach specific signs and actions, verify with teach-back or demonstration, reteach missed elements, and repeat the check."
                }
        ],
        "documentChoices": [
                {
                        "id": "p5-edu-document-correct",
                        "label": "Record learner, exact topics, method or material, specific teach-back answers, missed elements, reteaching, repeat result, escalation instructions, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Record learner, exact topics, method or material, specific teach-back answers, missed elements, reteaching, repeat result, escalation instructions, and follow-up."
                },
                {
                        "id": "p5-edu-document-revise",
                        "label": "Record “patient educated and verbalized understanding.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record learner, exact topics, method or material, specific teach-back answers, missed elements, reteaching, repeat result, escalation instructions, and follow-up."
                }
        ],
        "feedback": {
                "observed": "Defensible education documents the learner, exact content, method, and measured teach-back result.",
                "meaning": "Defensible education documents the learner, exact content, method, and measured teach-back result.",
                "action": "Teach specific signs and actions, verify with teach-back or demonstration, reteach missed elements, and repeat the check.",
                "notify": "Notify the RN the same day if safety-critical teaching remains unsuccessful and during the visit when the knowledge gap creates immediate risk.",
                "document": "Record learner, exact topics, method or material, specific teach-back answers, missed elements, reteaching, repeat result, escalation instructions, and follow-up.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 5, shortName: 'RN Review', title: 'RN Co-Signature Requirements & the Review Process', subtitle: 'Supervision documentation under CA LVN scope + agency co-sign timelines',
    narration: [      'LVN documentation is completed within ordered scope under RN or physician direction. Care Indeed agency policy requires RN co-signature of LVN clinical visit documentation within seven calendar days of the visit. Treat the seven-day window and resubmission clocks as agency policy operationalizing supervision and record completeness—not as a substitute for understanding your ongoing duty to document accurately the first time.',
      'The co-signing RN reviews for clinical accuracy, scope-of-practice compliance, completeness (including homebound support, skilled justification, vital signs per policy, and plan), Plan of Care alignment, and communication needs (concerns requiring RN follow-up or physician notification). If the RN returns the note with comments, address the comments, revise, and resubmit within the agency-required window (commonly 48 hours per agency policy). Revision history remains in the EHR audit trail.',
      'Use co-signature feedback as a learning loop—especially in your first months. Patterns in returned notes (for example, weak skilled language) show where to improve. From a legal and professional perspective, co-signature means the RN has reviewed the documentation against clinical and regulatory expectations; shared accountability does not erase your responsibility for the original content you authored.',
      'If you discover an error after co-signature, do not alter the original entry in a way that conceals history. Enter a dated and timed addendum at the point of discovery stating the correction and reason. Never delete, overwrite, or backdate documentation to hide a mistake.'], keyPoints: [
      { icon: '📤', title: 'Accurate submission', detail: 'Verify identity, times, SOAP, skilled need, response, and coordination.' },
      { icon: '🔍', title: 'RN clinical review', detail: 'Support review with source-consistent evidence and order alignment.' },
      { icon: '↩️', title: 'Return and revise', detail: 'Resolve comments using verified facts and preserve history.' },
      { icon: '🧾', title: 'Formal addendum', detail: 'Correct a locked record with date, time, reason, and author.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img06,
    hotspots: [      {
        id: 'p6-submit', label: 'LVN submits', shortLabel: 'LVN submits', ariaLabel: 'Investigate LVN submits',
        x: 18, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-0',
        observe: 'You complete an accurate SOAP note and submit per the 24-hour agency submission standard.',
                "identifyChoices": [
                {
                        "id": "p6-submit-identify-correct",
                        "label": "The LVN remains responsible for the accuracy and completeness of the original note before it enters RN review.",
                        "correct": true,
                        "rationale": "Correct. The LVN remains responsible for the accuracy and completeness of the original note before it enters RN review."
                },
                {
                        "id": "p6-submit-identify-revise",
                        "label": "RN review transfers responsibility for blanks or unsupported LVN findings.",
                        "correct": false,
                        "rationale": "Not defensible. The LVN remains responsible for the accuracy and completeness of the original note before it enters RN review."
                }
        ],
        "decideChoices": [
                {
                        "id": "p6-submit-decide-correct",
                        "label": "Verify identity, actual times, SOAP, skilled need, ordered care, response, homebound support, coordination, and authentication before submission.",
                        "correct": true,
                        "rationale": "Correct. Verify identity, actual times, SOAP, skilled need, ordered care, response, homebound support, coordination, and authentication before submission."
                },
                {
                        "id": "p6-submit-decide-revise",
                        "label": "Submit a draft with blanks so the RN can complete it during co-signature review.",
                        "correct": false,
                        "rationale": "This misses the required response. Verify identity, actual times, SOAP, skilled need, ordered care, response, homebound support, coordination, and authentication before submission."
                }
        ],
        "documentChoices": [
                {
                        "id": "p6-submit-document-correct",
                        "label": "Record every required encounter element plus any barrier, action, RN name/time/mode, direction, resolution, authentication, and actual submission time.",
                        "correct": true,
                        "rationale": "Correct. Record every required encounter element plus any barrier, action, RN name/time/mode, direction, resolution, authentication, and actual submission time."
                },
                {
                        "id": "p6-submit-document-revise",
                        "label": "Enter “complete” in required fields that lack patient-specific content.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record every required encounter element plus any barrier, action, RN name/time/mode, direction, resolution, authentication, and actual submission time."
                }
        ],
        "feedback": {
                "observed": "The LVN remains responsible for the accuracy and completeness of the original note before it enters RN review.",
                "meaning": "The LVN remains responsible for the accuracy and completeness of the original note before it enters RN review.",
                "action": "Verify identity, actual times, SOAP, skilled need, ordered care, response, homebound support, coordination, and authentication before submission.",
                "notify": "Notify the RN before submission if a material element cannot be completed or an order or clinical issue remains unresolved; urgency follows the clinical trigger.",
                "document": "Record every required encounter element plus any barrier, action, RN name/time/mode, direction, resolution, authentication, and actual submission time.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p6-review', label: 'RN review', shortLabel: 'RN review', ariaLabel: 'Investigate RN review',
        x: 50, y: 28, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-1',
        observe: 'RN checks accuracy, scope, completeness, POC alignment, and escalation needs within the co-sign window.',
                "identifyChoices": [
                {
                        "id": "p6-review-identify-correct",
                        "label": "RN review checks source consistency, clinical completeness, scope, order alignment, response, and needed follow-up; neither reviewer nor author should guess.",
                        "correct": true,
                        "rationale": "Correct. RN review checks source consistency, clinical completeness, scope, order alignment, response, and needed follow-up; neither reviewer nor author should guess."
                },
                {
                        "id": "p6-review-identify-revise",
                        "label": "The RN may select whichever conflicting measurement appears most likely.",
                        "correct": false,
                        "rationale": "Not defensible. RN review checks source consistency, clinical completeness, scope, order alignment, response, and needed follow-up; neither reviewer nor author should guess."
                }
        ],
        "decideChoices": [
                {
                        "id": "p6-review-decide-correct",
                        "label": "Verify the contemporaneous source, discuss the discrepancy, correct transparently, and assess whether current care is affected.",
                        "correct": true,
                        "rationale": "Correct. Verify the contemporaneous source, discuss the discrepancy, correct transparently, and assess whether current care is affected."
                },
                {
                        "id": "p6-review-decide-revise",
                        "label": "Change the value to match the narrative without documenting why.",
                        "correct": false,
                        "rationale": "This misses the required response. Verify the contemporaneous source, discuss the discrepancy, correct transparently, and assess whether current care is affected."
                }
        ],
        "documentChoices": [
                {
                        "id": "p6-review-document-correct",
                        "label": "Record conflicting entries, verified source and value, reviewer contact, correction date/time/reason/author, clinical impact review, follow-up, and resolution.",
                        "correct": true,
                        "rationale": "Correct. Record conflicting entries, verified source and value, reviewer contact, correction date/time/reason/author, clinical impact review, follow-up, and resolution."
                },
                {
                        "id": "p6-review-document-revise",
                        "label": "Replace the value silently and resubmit.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record conflicting entries, verified source and value, reviewer contact, correction date/time/reason/author, clinical impact review, follow-up, and resolution."
                }
        ],
        "feedback": {
                "observed": "RN review checks source consistency, clinical completeness, scope, order alignment, response, and needed follow-up; neither reviewer nor author should guess.",
                "meaning": "RN review checks source consistency, clinical completeness, scope, order alignment, response, and needed follow-up; neither reviewer nor author should guess.",
                "action": "Verify the contemporaneous source, discuss the discrepancy, correct transparently, and assess whether current care is affected.",
                "notify": "Respond promptly within the review workflow; notify the RN immediately when a discrepancy could alter current treatment or requires patient reassessment.",
                "document": "Record conflicting entries, verified source and value, reviewer contact, correction date/time/reason/author, clinical impact review, follow-up, and resolution.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p6-return', label: 'Return & revise', shortLabel: 'Return & rev…', ariaLabel: 'Investigate Return & revise',
        x: 82, y: 40, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-2',
        observe: 'If returned, revise per comments and resubmit within the agency revision window; audit trail preserves history.',
                "identifyChoices": [
                {
                        "id": "p6-return-identify-correct",
                        "label": "A returned note must be revised from verified encounter facts; review comments do not authorize invented tolerance or teaching response.",
                        "correct": true,
                        "rationale": "Correct. A returned note must be revised from verified encounter facts; review comments do not authorize invented tolerance or teaching response."
                },
                {
                        "id": "p6-return-identify-revise",
                        "label": "Adding “tolerated well and understood” is acceptable when those responses were not recorded or verified.",
                        "correct": false,
                        "rationale": "Not defensible. A returned note must be revised from verified encounter facts; review comments do not authorize invented tolerance or teaching response."
                }
        ],
        "decideChoices": [
                {
                        "id": "p6-return-decide-correct",
                        "label": "Address each comment with contemporaneous facts and disclose any requested element that was not assessed or cannot be verified.",
                        "correct": true,
                        "rationale": "Correct. Address each comment with contemporaneous facts and disclose any requested element that was not assessed or cannot be verified."
                },
                {
                        "id": "p6-return-decide-revise",
                        "label": "Copy a favorable response from another visit to clear the review flag.",
                        "correct": false,
                        "rationale": "This misses the required response. Address each comment with contemporaneous facts and disclose any requested element that was not assessed or cannot be verified."
                }
        ],
        "documentChoices": [
                {
                        "id": "p6-return-document-correct",
                        "label": "Record the comment addressed, verified source facts, actual response and teach-back, limitation, revision date/time/reason/author, RN direction, and resubmission time.",
                        "correct": true,
                        "rationale": "Correct. Record the comment addressed, verified source facts, actual response and teach-back, limitation, revision date/time/reason/author, RN direction, and resubmission time."
                },
                {
                        "id": "p6-return-document-revise",
                        "label": "Add an unsupported favorable response and close the comment.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record the comment addressed, verified source facts, actual response and teach-back, limitation, revision date/time/reason/author, RN direction, and resubmission time."
                }
        ],
        "feedback": {
                "observed": "A returned note must be revised from verified encounter facts; review comments do not authorize invented tolerance or teaching response.",
                "meaning": "A returned note must be revised from verified encounter facts; review comments do not authorize invented tolerance or teaching response.",
                "action": "Address each comment with contemporaneous facts and disclose any requested element that was not assessed or cannot be verified.",
                "notify": "Notify the RN promptly when a requested fact cannot be verified and the same day when the missing information affects current safety or care decisions.",
                "document": "Record the comment addressed, verified source facts, actual response and teach-back, limitation, revision date/time/reason/author, RN direction, and resubmission time.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p6-addendum', label: 'Addendum path', shortLabel: 'Addendum path', ariaLabel: 'Investigate Addendum path',
        x: 50, y: 72, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-5-3',
        observe: 'Post co-sign errors → dated/timed addendum. Never delete, overwrite, or backdate.',
                "identifyChoices": [
                {
                        "id": "p6-addendum-identify-correct",
                        "label": "A post-lock error requires an additive, attributed correction that preserves the original and prompts clinical impact review when material.",
                        "correct": true,
                        "rationale": "Correct. A post-lock error requires an additive, attributed correction that preserves the original and prompts clinical impact review when material."
                },
                {
                        "id": "p6-addendum-identify-revise",
                        "label": "The original should be overwritten so only the corrected fact remains visible.",
                        "correct": false,
                        "rationale": "Not defensible. A post-lock error requires an additive, attributed correction that preserves the original and prompts clinical impact review when material."
                }
        ],
        "decideChoices": [
                {
                        "id": "p6-addendum-decide-correct",
                        "label": "Verify the correct fact, notify the RN at the required urgency, assess clinical impact, and enter the formal addendum.",
                        "correct": true,
                        "rationale": "Correct. Verify the correct fact, notify the RN at the required urgency, assess clinical impact, and enter the formal addendum."
                },
                {
                        "id": "p6-addendum-decide-revise",
                        "label": "Delete the original entry and backdate the replacement.",
                        "correct": false,
                        "rationale": "This misses the required response. Verify the correct fact, notify the RN at the required urgency, assess clinical impact, and enter the formal addendum."
                }
        ],
        "documentChoices": [
                {
                        "id": "p6-addendum-document-correct",
                        "label": "Record discovery time, original incorrect fact, correct fact and source, reason, addendum time and author, RN contact and direction, impact review, and follow-up.",
                        "correct": true,
                        "rationale": "Correct. Record discovery time, original incorrect fact, correct fact and source, reason, addendum time and author, RN contact and direction, impact review, and follow-up."
                },
                {
                        "id": "p6-addendum-document-revise",
                        "label": "Edit the locked field without an addendum or audit trail.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record discovery time, original incorrect fact, correct fact and source, reason, addendum time and author, RN contact and direction, impact review, and follow-up."
                }
        ],
        "feedback": {
                "observed": "A post-lock error requires an additive, attributed correction that preserves the original and prompts clinical impact review when material.",
                "meaning": "A post-lock error requires an additive, attributed correction that preserves the original and prompts clinical impact review when material.",
                "action": "Verify the correct fact, notify the RN at the required urgency, assess clinical impact, and enter the formal addendum.",
                "notify": "Notify the RN immediately for a medication, treatment, identity, or other error that could affect care; follow urgent escalation when administration or harm is uncertain.",
                "document": "Record discovery time, original incorrect fact, correct fact and source, reason, addendum time and author, RN contact and direction, impact review, and follow-up.",
                "policyRefs": [
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      }]
  },
  {
    id: 6, shortName: 'Practice', title: 'Building Your Documentation Practice: Competent to Expert', subtitle: 'Habits, auditor mindset, escalation, and knowledge vs competency',
    narration: [      'Strategy One: use agency documentation templates consistently. They are compliance scaffolds that reduce accidental omission of required elements—not a license to clone stale clinical content.',
      'Strategy Two: document in near real time whenever safely possible. Accuracy declines when notes are delayed many hours after the encounter; agency policy still requires submission within 24 hours.',
      'Strategy Three: read your note from an auditor’s perspective. Before submit, re-read as if you know nothing about the patient except this single note. Does it establish homebound support? Demonstrate skilled service under an ordered POC? Stay inside LVN scope?',
      'Strategy Four: learn from exemplar notes. Ask your supervising RN or Clinical Manager for de-identified examples of excellent documentation.'], keyPoints: [
      { icon: '🧩', title: 'Template scaffold', detail: 'Use the structure while entering only current patient-specific facts.' },
      { icon: '🔎', title: 'Auditor lens', detail: 'Confirm the note stands alone and supports skilled need.' },
      { icon: '☎️', title: 'Coordination check', detail: 'Match each trigger to urgency, direction, and response.' },
      { icon: '✅', title: 'Final-note check', detail: 'Verify SOAP, order alignment, response, corrections, and authentication.' },
    ], clinicalTip: 'Document objectively the same day; incomplete notes delay RN supervision.',
    sourceLabels: [{ kind: 'Agency Policy', text: 'CL-CD-001' }, { kind: 'Agency Policy', text: 'CL-CD-003' }, { kind: 'Agency Policy', text: 'CL-CD-004' }],
    sceneImage: img07,
    hotspots: [      {
        id: 'p7-template', label: 'Templates', shortLabel: 'Templates', ariaLabel: 'Investigate Templates',
        x: 20, y: 30, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-6-0',
        observe: 'Use agency templates to avoid missing required fields—never as a copy-paste of yesterday’s clinic.',
                "identifyChoices": [
                {
                        "id": "p7-template-identify-correct",
                        "label": "A template is a completeness scaffold; every clinical field must contain current encounter facts rather than copied prior content.",
                        "correct": true,
                        "rationale": "Correct. A template is a completeness scaffold; every clinical field must contain current encounter facts rather than copied prior content."
                },
                {
                        "id": "p7-template-identify-revise",
                        "label": "Prior normal findings may remain when the diagnosis is unchanged.",
                        "correct": false,
                        "rationale": "Not defensible. A template is a completeness scaffold; every clinical field must contain current encounter facts rather than copied prior content."
                }
        ],
        "decideChoices": [
                {
                        "id": "p7-template-decide-correct",
                        "label": "Populate each SOAP field from today’s assessment, ordered care, response, homebound support, teaching, and coordination.",
                        "correct": true,
                        "rationale": "Correct. Populate each SOAP field from today’s assessment, ordered care, response, homebound support, teaching, and coordination."
                },
                {
                        "id": "p7-template-decide-revise",
                        "label": "Use “unchanged” for findings that were not reassessed today.",
                        "correct": false,
                        "rationale": "This misses the required response. Populate each SOAP field from today’s assessment, ordered care, response, homebound support, teaching, and coordination."
                }
        ],
        "documentChoices": [
                {
                        "id": "p7-template-document-correct",
                        "label": "Record today’s complete SOAP content, report sources, measurements and times, skilled need, ordered care, response, qualifier, communication, and any unobtainable item.",
                        "correct": true,
                        "rationale": "Correct. Record today’s complete SOAP content, report sources, measurements and times, skilled need, ordered care, response, qualifier, communication, and any unobtainable item."
                },
                {
                        "id": "p7-template-document-revise",
                        "label": "Leave stale clinical text in place because the template preserved it.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record today’s complete SOAP content, report sources, measurements and times, skilled need, ordered care, response, qualifier, communication, and any unobtainable item."
                }
        ],
        "feedback": {
                "observed": "A template is a completeness scaffold; every clinical field must contain current encounter facts rather than copied prior content.",
                "meaning": "A template is a completeness scaffold; every clinical field must contain current encounter facts rather than copied prior content.",
                "action": "Populate each SOAP field from today’s assessment, ordered care, response, homebound support, teaching, and coordination.",
                "notify": "Notify the RN before submission if a required current element could not be assessed or an order issue remains unresolved; urgency follows the clinical finding.",
                "document": "Record today’s complete SOAP content, report sources, measurements and times, skilled need, ordered care, response, qualifier, communication, and any unobtainable item.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p7-audit', label: 'Auditor lens', shortLabel: 'Auditor lens', ariaLabel: 'Investigate Auditor lens',
        x: 50, y: 24, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-1',
        observe: 'Re-read each note as a single-visit sample an auditor might pull.',
                "identifyChoices": [
                {
                        "id": "p7-audit-identify-correct",
                        "label": "The auditor lens checks whether the final note independently shows today’s condition, skilled need, ordered service, response, and coordination.",
                        "correct": true,
                        "rationale": "Correct. The auditor lens checks whether the final note independently shows today’s condition, skilled need, ordered service, response, and coordination."
                },
                {
                        "id": "p7-audit-identify-revise",
                        "label": "A procedure code lets the reviewer infer missing clinical need and response.",
                        "correct": false,
                        "rationale": "Not defensible. The auditor lens checks whether the final note independently shows today’s condition, skilled need, ordered service, response, and coordination."
                }
        ],
        "decideChoices": [
                {
                        "id": "p7-audit-decide-correct",
                        "label": "Repair missing clinical links with verified encounter facts before submission.",
                        "correct": true,
                        "rationale": "Correct. Repair missing clinical links with verified encounter facts before submission."
                },
                {
                        "id": "p7-audit-decide-revise",
                        "label": "Submit measurements alone and assume they prove the purpose and outcome of care.",
                        "correct": false,
                        "rationale": "This misses the required response. Repair missing clinical links with verified encounter facts before submission."
                }
        ],
        "documentChoices": [
                {
                        "id": "p7-audit-document-correct",
                        "label": "Record condition and risk, exact skilled assessment and technique, ordered-service link, pre/post findings, tolerance, teaching response, coordination, and next step.",
                        "correct": true,
                        "rationale": "Correct. Record condition and risk, exact skilled assessment and technique, ordered-service link, pre/post findings, tolerance, teaching response, coordination, and next step."
                },
                {
                        "id": "p7-audit-document-revise",
                        "label": "Add “good response” without objective or attributed supporting evidence.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record condition and risk, exact skilled assessment and technique, ordered-service link, pre/post findings, tolerance, teaching response, coordination, and next step."
                }
        ],
        "feedback": {
                "observed": "The auditor lens checks whether the final note independently shows today’s condition, skilled need, ordered service, response, and coordination.",
                "meaning": "The auditor lens checks whether the final note independently shows today’s condition, skilled need, ordered service, response, and coordination.",
                "action": "Repair missing clinical links with verified encounter facts before submission.",
                "notify": "No separate notice is needed when an omission is corrected before submission; notify the RN promptly when response was not assessed or cannot be verified and urgently when safety is uncertain.",
                "document": "Record condition and risk, exact skilled assessment and technique, ordered-service link, pre/post findings, tolerance, teaching response, coordination, and next step.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p7-escalate', label: 'Escalate early', shortLabel: 'Escalate early', ariaLabel: 'Investigate Escalate early',
        x: 80, y: 32, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-2',
        observe: 'Facts + RN notification beat out-of-scope speculation every time.',
                "identifyChoices": [
                {
                        "id": "p7-escalate-identify-correct",
                        "label": "A complete coordination trail connects the trigger to recipient, urgency, contact attempts, verified direction, action, and patient outcome.",
                        "correct": true,
                        "rationale": "Correct. A complete coordination trail connects the trigger to recipient, urgency, contact attempts, verified direction, action, and patient outcome."
                },
                {
                        "id": "p7-escalate-identify-revise",
                        "label": "An abnormal value plus “will monitor” shows closed-loop coordination.",
                        "correct": false,
                        "rationale": "Not defensible. A complete coordination trail connects the trigger to recipient, urgency, contact attempts, verified direction, action, and patient outcome."
                }
        ],
        "decideChoices": [
                {
                        "id": "p7-escalate-decide-correct",
                        "label": "Verify current safety, notify the RN at the required urgency, read back direction, complete authorized actions, and reassess.",
                        "correct": true,
                        "rationale": "Correct. Verify current safety, notify the RN at the required urgency, read back direction, complete authorized actions, and reassess."
                },
                {
                        "id": "p7-escalate-decide-revise",
                        "label": "Add “RN aware” without confirming contact, time, direction, or response.",
                        "correct": false,
                        "rationale": "This misses the required response. Verify current safety, notify the RN at the required urgency, read back direction, complete authorized actions, and reassess."
                }
        ],
        "documentChoices": [
                {
                        "id": "p7-escalate-document-correct",
                        "label": "Record original and repeat values with context, symptoms, safety actions, recipient and contact attempts, exact report, read-back direction, completed action, response, and disposition.",
                        "correct": true,
                        "rationale": "Correct. Record original and repeat values with context, symptoms, safety actions, recipient and contact attempts, exact report, read-back direction, completed action, response, and disposition."
                },
                {
                        "id": "p7-escalate-document-revise",
                        "label": "Record only the abnormal value and “continue plan.”",
                        "correct": false,
                        "rationale": "This omits required record elements. Record original and repeat values with context, symptoms, safety actions, recipient and contact attempts, exact report, read-back direction, completed action, response, and disposition."
                }
        ],
        "feedback": {
                "observed": "A complete coordination trail connects the trigger to recipient, urgency, contact attempts, verified direction, action, and patient outcome.",
                "meaning": "A complete coordination trail connects the trigger to recipient, urgency, contact attempts, verified direction, action, and patient outcome.",
                "action": "Verify current safety, notify the RN at the required urgency, read back direction, complete authorized actions, and reassess.",
                "notify": "Notify the RN during the visit for an out-of-parameter or meaningful new finding; use urgent or emergency escalation for severe symptoms, acute neurologic change, syncope, or instability.",
                "document": "Record original and repeat values with context, symptoms, safety actions, recipient and contact attempts, exact report, read-back direction, completed action, response, and disposition.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-004"
                ]
        }
      },      {
        id: 'p7-knowledge', label: 'Quiz = knowledge', shortLabel: 'Quiz = knowl…', ariaLabel: 'Investigate Quiz = knowledge',
        x: 50, y: 70, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-3',
        observe: 'Passing validates documentation knowledge only—not standalone practical competency clearance.',
                "identifyChoices": [
                {
                        "id": "p7-knowledge-identify-correct",
                        "label": "The final verification confirms a coherent patient-specific note; knowledge-check completion does not replace observed practical competency or authorized sign-off.",
                        "correct": true,
                        "rationale": "Correct. The final verification confirms a coherent patient-specific note; knowledge-check completion does not replace observed practical competency or authorized sign-off."
                },
                {
                        "id": "p7-knowledge-identify-revise",
                        "label": "Passing the quiz authorizes independent documentation practice and substitutes for RN review.",
                        "correct": false,
                        "rationale": "Not defensible. The final verification confirms a coherent patient-specific note; knowledge-check completion does not replace observed practical competency or authorized sign-off."
                }
        ],
        "decideChoices": [
                {
                        "id": "p7-knowledge-decide-correct",
                        "label": "Authenticate and submit the verified encounter note, then continue separate supervision and practical sign-off requirements.",
                        "correct": true,
                        "rationale": "Correct. Authenticate and submit the verified encounter note, then continue separate supervision and practical sign-off requirements."
                },
                {
                        "id": "p7-knowledge-decide-revise",
                        "label": "Use the quiz score as evidence that the clinical record is complete.",
                        "correct": false,
                        "rationale": "This misses the required response. Authenticate and submit the verified encounter note, then continue separate supervision and practical sign-off requirements."
                }
        ],
        "documentChoices": [
                {
                        "id": "p7-knowledge-document-correct",
                        "label": "Record complete SOAP evidence, skilled need, order alignment, homebound support, intervention, response, teaching, coordination, corrections, and author/date/time authentication.",
                        "correct": true,
                        "rationale": "Correct. Record complete SOAP evidence, skilled need, order alignment, homebound support, intervention, response, teaching, coordination, corrections, and author/date/time authentication."
                },
                {
                        "id": "p7-knowledge-document-revise",
                        "label": "Add the quiz result to the clinical note as proof of practical competency.",
                        "correct": false,
                        "rationale": "This omits required record elements. Record complete SOAP evidence, skilled need, order alignment, homebound support, intervention, response, teaching, coordination, corrections, and author/date/time authentication."
                }
        ],
        "feedback": {
                "observed": "The final verification confirms a coherent patient-specific note; knowledge-check completion does not replace observed practical competency or authorized sign-off.",
                "meaning": "The final verification confirms a coherent patient-specific note; knowledge-check completion does not replace observed practical competency or authorized sign-off.",
                "action": "Authenticate and submit the verified encounter note, then continue separate supervision and practical sign-off requirements.",
                "notify": "No separate notice is needed for a complete routine final note; notify the RN before submission for unresolved clinical or documentation issues, with urgency based on the trigger.",
                "document": "Record complete SOAP evidence, skilled need, order alignment, homebound support, intervention, response, teaching, coordination, corrections, and author/date/time authentication.",
                "policyRefs": [
                        "CL-CD-001",
                        "CL-CD-003",
                        "CL-CD-004"
                ]
        }
      }]
  }
];

const QUIZ: QuizQuestion[] = [
  { id: 1, stem: 'You are writing today’s visit note. Which option correctly names the four SOAP sections required by agency standard?', options: [      'Subjective, Objective, Assessment, Plan',
      'Summary, Observation, Action, Prognosis',
      'Symptoms, Outcomes, Analysis, Prescription',
      'Status, Orders, Activities, Progress'], correct: 0, rationale: 'SOAP = Subjective, Objective, Assessment, Plan—the Care Indeed agency standard structure for LVN visit notes.' },
  { id: 2, stem: 'A patient says, “The pain shoots down my left leg when I stand.” Where should that direct quote be documented?', options: [      'Objective only, because pain is clinical',
      'Subjective, attributed to the patient (use quotation marks for the direct statement)',
      'Plan, because it drives next steps only',
      'Nowhere—quotes are discouraged in the legal record'], correct: 1, rationale: 'Subjective captures patient/caregiver-reported information. Direct quotes belong there with attribution—not as LVN interpretation in Objective.' },
  { id: 3, stem: 'Which statement correctly classifies Care Indeed’s visit documentation completion expectation?', options: [      'Federal law requires every home health note within exactly 6 hours nationwide',
      'Notes may be completed any time before the next recertification',
      'Agency policy requires completion and EHR submission within 24 hours of the visit',
      'Only SOC notes have a deadline; follow-up LVN notes have none'], correct: 2, rationale: 'The 24-hour completion/submission window is Care Indeed agency policy. Label it as agency standard—not a universal free-standing federal “24-hour CFR rule.”' },
  { id: 4, stem: 'An auditor reads only today’s LVN note. Which documentation best satisfies the three-part skilled-service test?', options: [      '“Patient seen; routine visit completed.”',
      '“Performed sterile wound care per physician order for sacral pressure injury (skill + necessity); care provided under current ordered POC; monitored for infection signs.”',
      '“Social support provided; patient enjoyed conversation.”',
      '“Will consider changing the Plan of Care independently based on my diagnosis.”'], correct: 1, rationale: 'Skilled notes show (1) licensed nursing skill, (2) reasonable/necessary link to illness, and (3) care under a physician-ordered POC. LVNs do not independently diagnose or rewrite the POC.' },
  { id: 5, stem: 'How often must homebound status support be documented on LVN visit notes?', options: [      'Only at the SOC visit completed by the RN',
      'Once per month if the patient seems stable',
      'At every visit, with a specific clinical qualifier',
      'Only when the physician requests a letter'], correct: 2, rationale: 'Homebound support with a clinical qualifier is a per-visit documentation expectation tied to Medicare home health eligibility concepts. Bare “patient is homebound” is insufficient.' },
  { id: 6, stem: 'You notice a colleague copy-forwarded last week’s wound measurements into today’s note without re-measuring. What is the correct characterization?', options: [      'Encouraged efficiency—templates require cloning',
      'Cloning: prohibited practice that risks inaccurate data and compliance/false-record issues; start fresh from today’s findings',
      'Required whenever the wound is unchanged',
      'Acceptable if the RN co-signs within 7 days'], correct: 1, rationale: 'Cloning is copying prior note content with minimal change. It commonly preserves wrong vitals/measurements and is a major compliance failure mode. Co-signature does not legitimize false content.' },
  { id: 7, stem: 'Within what timeframe does Care Indeed agency policy require RN co-signature of an LVN visit note?', options: [      'Before the LVN leaves the patient’s driveway',
      'Within 3 calendar days only if the patient is high-risk',
      'There is no co-signature process for LVN notes',
      'Within 7 calendar days of the visit (agency co-signature standard supporting supervised LVN practice)'], correct: 3, rationale: 'Agency policy requires RN co-signature within 7 calendar days. The seven-day operational deadline is an agency standard; the current signed policy controls.' },
  { id: 8, stem: 'Which homebound statement is acceptable documentation?', options: [      '“Patient is homebound due to severe COPD with dyspnea on minimal exertion, continuous O2 at 3 L/min, unable to ambulate more than ~15 feet without rest.”',
      '“Patient is homebound.”',
      '“Patient does not leave home.”',
      '“Family says patient likes staying home.”'], correct: 0, rationale: 'Acceptable homebound documentation includes a specific clinical qualifier linking condition and functional limitation to taxing effort to leave home.' },
  { id: 9, stem: 'You discover a medication dose error description in a note that was already RN co-signed. What is the correct action?', options: [      'Delete the original note and rewrite history',
      'Quietly edit the original fields to match what you meant',
      'Enter a dated and timed addendum stating the correction and reason; never backdate or erase the original',
      'Ignore it if the patient was unharmed'], correct: 2, rationale: 'Record integrity requires addenda for corrections after entry/co-signature. Deleting, overwriting, or backdating to conceal errors is improper.' },
  { id: 10, stem: 'Which patient-education documentation best meets expected standards discussed in this module?', options: [      '“Taught patient about medications.”',
      '“Patient education provided regarding wound care.”',
      '“Discussed care plan with patient.”',
      '“Instructed patient on 3 signs of wound infection using demonstration; patient verbalized all 3 correctly via teach-back.”'], correct: 3, rationale: 'Strong education documentation includes what was taught, how it was taught, and how comprehension was verified (teach-back). One-line “educated patient” statements are insufficient.' }
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
.lvn002-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.38);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(520px,100%);max-height:min(92dvh,680px);overflow:auto;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.18);-webkit-overflow-scrolling:touch}
@media (max-width:420px){.lvn002-modal{padding:0}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:92dvh}.lvn002-modal-card button[role="radio"]{font-size:14px!important;line-height:1.4!important}}
@media (max-width:390px){.lvn002-work{padding:8px}.lvn002-left{padding:16px;max-height:44vh}.lvn002-right{padding:8px;min-height:330px}.lvn002-bot{padding:0 8px;gap:6px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:10px;letter-spacing:.04em;padding:8px}.lvn002-hotspot .orb{width:44px;height:44px;min-width:44px;min-height:44px}.lvn002-hotspot{min-width:44px;min-height:44px}.lvn002-hotspot .tag{max-width:94px;font-size:10px}}
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
    const scrollNodes = Array.from(document.querySelectorAll<HTMLElement>('.lvn002-work,.lvn002-left,.lvn002-right,.lvn002-quiz-page'));
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
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [closeAndRestore, stage]);

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
    onPick: (choice: ScenarioChoice) => void,
  ) => {
    const activeIndex = Math.max(0, choices.findIndex((choice) => choice.id === selectedId));
    const moveFocus = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      let next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + choices.length) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else if (event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); onPick(choices[index]); return; }
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
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => onPick(choice)}
              onKeyDown={(event) => moveFocus(event, index)}
              disabled={locked && !selected}
              style={{
                textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer',
                border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`,
                background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff',
                fontWeight: 600, fontSize: 15, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1,
              }}
            >
              {choice.label}
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
  };

  const fb = hotspot.feedback;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lvn-scenario-title"
      ref={dialogRef}
      className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}
    >
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>
              {stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}
            </div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 17, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2>
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
                onClick={() => { onComplete(); restoreTriggerFocus(); }}
                style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}
              >
                Complete hotspot
              </button>
            </>
          )}
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


const STORAGE_KEY = 'lvn-004-progress-v5414';

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
      alt="Care Indeed"
      width={size}
      height={size}
      style={{ width: size, height: size, flexShrink: 0, objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }}
    />
  );
}

export default function LVN004() {
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
          <span className="brand-text">LVN-004 — Documentation</span>
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
