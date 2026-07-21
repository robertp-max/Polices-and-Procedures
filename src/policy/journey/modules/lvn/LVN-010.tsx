/**
 * LVN-010 — Infection Prevention
 * v5.4.0-RECOVERY | Observe→Identify→Decide→Document→Feedback→Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-010/lesson-01-ipc-basics.png';
import img02 from './assets/lvn-010/lesson-02-hand-hygiene.png';
import img03 from './assets/lvn-010/lesson-03-precautions.png';
import img04 from './assets/lvn-010/lesson-04-bag-technique.png';
import img05 from './assets/lvn-010/lesson-05-sharps.png';
import img06 from './assets/lvn-010/lesson-06-exposure.png';
import img07 from './assets/lvn-010/lesson-07-practice.png';


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

const MODULE_META = { id: 'LVN-010', title: 'Infection Prevention', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'LVN pauses care after a body-fluid exposure, contains the source, performs first aid, and prepares immediate agency notification.',
  'LVN performs hand hygiene beside sealed procedure supplies before touching a de-identified home-health patient.',
  'LVN selects gloves, gown, face protection, and respirator according to anticipated exposure during a home visit.',
  'Side-by-side sterile and clean fields show the asepsis decision for an ordered home procedure.',
  'LVN places a safety-engineered syringe directly into a puncture-resistant sharps container at the point of use.',
  'Nursing bag rests on a disposable barrier with clean supplies separated from contaminated items and disposal.',
  'LVN uses a de-identified tablet and phone to document objective infection findings and report through the agency pathway.',
] as const;

const PAGES: PageData[] = [
{ id: 0, shortName: 'Exposure', title: 'Occupational Exposure — First Aid and Immediate Reporting', subtitle: 'First aid first; time-sensitive evaluation and agency reporting follow', narration: ['A needlestick, cut from a used sharp, or blood or body-fluid contact with eyes, mouth, other mucous membrane, or non-intact skin is an occupational exposure. Stop the task safely and contain the source so no one else is exposed.','For a needlestick or cut, wash immediately with soap and water; do not squeeze, scrub, or use bleach or caustic agents. For eyes or mucous membranes, immediately irrigate with clean water or saline and follow agency and medical direction. Remove contaminated clothing and wash exposed skin.','After first aid, immediately notify the agency supervisor or on-call manager and the infection-prevention or employee-health pathway in CL-SD-016. Notify the supervising RN immediately when patient care was interrupted or the patient may also have been exposed. Obtain immediate post-exposure medical evaluation because prophylaxis decisions are time-sensitive; call 911 for a life-threatening condition. Complete the agency exposure report with route/site/time, PPE, timed first aid, recipients and exact times, directions, evaluation disposition, patient impact, and follow-up.'], keyPoints: [{ icon: '🧼', title: 'First aid now', detail: 'Wash a needlestick/cut with soap and water; irrigate eye or mucosa immediately. Never squeeze, scrub, or bleach.' },{ icon: '📞', title: 'Report immediately', detail: 'After first aid, contact the agency supervisor/on-call manager and infection-prevention or employee health; notify the RN for care impact.' },{ icon: '⏱️', title: 'Evaluation is time-sensitive', detail: 'Obtain immediate medical evaluation for risk assessment, baseline testing, and possible post-exposure prophylaxis.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img01, hotspots: [{ id: 'wash', label: 'Needlestick / cut', shortLabel: 'Wash now', ariaLabel: 'Investigate needlestick or cut first aid', x: 50, y: 18, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-0', observe: 'A used sharp punctures or cuts the LVN’s skin. Stop safely and wash immediately with soap and water; do not squeeze, scrub, or apply bleach.', identifyChoices: [
          { id: 'i1', label: 'A needlestick or used-sharp cut is a percutaneous occupational exposure requiring immediate first aid and reporting', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'A used sharp punctures or cuts the LVN’s skin. Stop safely and wash immediately with soap and water; do not squeeze, scrub, or apply bleach.', meaning: 'Percutaneous occupational exposure under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'flush', label: 'Eye / mucosa', shortLabel: 'Irrigate now', ariaLabel: 'Investigate eye or mucous membrane exposure first aid', x: 78, y: 32, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-1', observe: 'Blood or body fluid contacts an eye, mouth, or other mucous membrane. Stop safely and immediately irrigate with clean water or saline.', identifyChoices: [
          { id: 'i1', label: 'Blood or body fluid in an eye, mouth, or mucous membrane is an occupational exposure requiring immediate irrigation and reporting', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Blood or body fluid contacts an eye, mouth, or other mucous membrane. Stop safely and immediately irrigate with clean water or saline.', meaning: 'Mucous-membrane occupational exposure under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'report', label: 'Immediate report', shortLabel: 'Report now', ariaLabel: 'Investigate immediate exposure reporting', x: 78, y: 62, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-0-2', observe: 'After first aid, immediately contact the agency supervisor/on-call manager and infection-prevention or employee health; notify the RN if patient care or the patient was affected.', identifyChoices: [
          { id: 'i1', label: 'An occupational exposure requires immediate first aid, immediate agency reporting, and time-sensitive medical evaluation', correct: true, rationale: 'Correct — first aid begins immediately and post-exposure evaluation is time-sensitive.' },
          { id: 'i2', label: 'No exposure occurred because gloves or other PPE were worn', correct: false, rationale: 'PPE reduces risk but does not cancel an occupational exposure or its reporting pathway.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'After first aid, immediately report to the agency supervisor/on-call manager and infection-prevention or employee health, notify the RN for care impact, and obtain immediate medical evaluation', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Finish the visit and report the exposure at the end of the shift', correct: false, rationale: 'Delaying reporting can delay time-sensitive evaluation and possible prophylaxis.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document route/site/date and exact time, source circumstances, PPE, first-aid method and time, recipient names/roles and exact times, directions/read-back, evaluation disposition, patient impact, and follow-up', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document only that an exposure occurred, with no route, times, recipients, first aid, or outcome', correct: false, rationale: 'Exposure documentation must establish the route, timing, first aid, reporting, evaluation, care impact, and follow-up.' }
        ], feedback: { observed: 'After first aid, immediately contact the agency supervisor/on-call manager and infection-prevention or employee health; notify the RN if patient care or the patient was affected.', meaning: 'Immediate occupational-exposure reporting under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'evaluation', label: 'Medical evaluation', shortLabel: 'Evaluation', ariaLabel: 'Investigate post-exposure medical evaluation', x: 50, y: 78, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-2', observe: 'Proceed for immediate confidential post-exposure medical evaluation as directed; prophylaxis decisions are time-sensitive and follow-up testing must not be missed.', identifyChoices: [
          { id: 'i1', label: 'An occupational exposure requires immediate first aid, immediate agency reporting, and time-sensitive medical evaluation', correct: true, rationale: 'Correct — first aid begins immediately and post-exposure evaluation is time-sensitive.' },
          { id: 'i2', label: 'No exposure occurred because gloves or other PPE were worn', correct: false, rationale: 'PPE reduces risk but does not cancel an occupational exposure or its reporting pathway.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'After first aid, immediately report to the agency supervisor/on-call manager and infection-prevention or employee health, notify the RN for care impact, and obtain immediate medical evaluation', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Finish the visit and report the exposure at the end of the shift', correct: false, rationale: 'Delaying reporting can delay time-sensitive evaluation and possible prophylaxis.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document route/site/date and exact time, source circumstances, PPE, first-aid method and time, recipient names/roles and exact times, directions/read-back, evaluation disposition, patient impact, and follow-up', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document only that an exposure occurred, with no route, times, recipients, first aid, or outcome', correct: false, rationale: 'Exposure documentation must establish the route, timing, first aid, reporting, evaluation, care impact, and follow-up.' }
        ], feedback: { observed: 'Proceed for immediate confidential post-exposure medical evaluation as directed; prophylaxis decisions are time-sensitive and follow-up testing must not be missed.', meaning: 'Time-sensitive post-exposure evaluation under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 1, shortName: 'Hand Hygiene', title: 'Hand Hygiene — The Five Moments', subtitle: 'WHO framework applied to every home visit', narration: ['The Five Moments for Hand Hygiene apply during every home visit: before touching the patient; before a clean or aseptic procedure; after body-fluid exposure risk; after touching the patient; and after touching patient surroundings. Gloves never replace hand hygiene.','Use alcohol-based hand rub when hands are not visibly soiled, rubbing all surfaces until dry. Use soap and water when hands are visibly soiled and after care involving suspected or confirmed C. difficile or norovirus, following CL-SD-016 and current agency instructions.','If hand hygiene cannot be completed or clean supplies become contaminated, stop before the task. Correct the setup; notify the supervising RN immediately when the ordered procedure cannot be performed safely or when delay could harm the patient.','Document a technique break, corrective action, patient impact, and the name, role, time, instructions, and read-back for any notification. Routine compliant hand hygiene may be captured by the agency workflow; never chart an action that was not performed.'], keyPoints: [{ icon: '1️⃣', title: 'Before patient', detail: 'After setup, before any physical contact—protects the patient.' },{ icon: '2️⃣', title: 'Before aseptic task', detail: 'Immediately before wound care, catheter care, injections, device care.' },{ icon: '3️⃣', title: 'After exposure / contact', detail: 'After body fluids, after patient contact, and after surroundings—protect you and the next surface.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img02, hotspots: [{ id: 'm1', label: 'Moment 1', shortLabel: 'Moment 1', ariaLabel: 'Investigate Moment 1', x: 18, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0', observe: 'Before touching the patient: after supply setup, before vitals or assessment contact.', identifyChoices: [
          { id: 'i1', label: 'Moment 1: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Before touching the patient: after supply setup, before vitals or assessment contact.', meaning: 'Moment 1 under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'm2', label: 'Moment 2', shortLabel: 'Moment 2', ariaLabel: 'Investigate Moment 2', x: 50, y: 18, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-1', observe: 'Before clean/aseptic procedure: immediately before wound care or device procedures—even if you just washed.', identifyChoices: [
          { id: 'i1', label: 'Moment 2: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Before clean/aseptic procedure: immediately before wound care or device procedures—even if you just washed.', meaning: 'Moment 2 under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'm3', label: 'Moment 3', shortLabel: 'Moment 3', ariaLabel: 'Investigate Moment 3', x: 82, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'After body-fluid exposure risk: after blood, drainage, secretions, non-intact skin, or dressings.', identifyChoices: [
          { id: 'i1', label: 'Moment 3: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'After body-fluid exposure risk: after blood, drainage, secretions, non-intact skin, or dressings.', meaning: 'Moment 3 under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'm4', label: 'Moment 4', shortLabel: 'Moment 4', ariaLabel: 'Investigate Moment 4', x: 68, y: 68, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'After touching the patient: before handling bag, phone, or environment outside the care sequence.', identifyChoices: [
          { id: 'i1', label: 'Hand hygiene moment required before/after patient contact or aseptic task', correct: true, rationale: 'Correct WHO moment recognition.' },
          { id: 'i2', label: 'Optional when gloves are used', correct: false, rationale: 'Gloves do not replace hand hygiene.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform hand hygiene with correct technique and duration before the indicated moment; do not proceed with the task until complete', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Skip hand hygiene because gloves will be worn', correct: false, rationale: 'Gloves are not a substitute.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document infection-prevention actions relevant to the visit and any exposure events', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Never document hygiene practices', correct: false, rationale: 'Relevant IPC actions and exposures are documented.' }
        ], feedback: { observed: 'After touching the patient: before handling bag, phone, or environment outside the care sequence.', meaning: 'Moment 4 under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 2, shortName: 'PPE', title: 'PPE — Standard and Transmission-Based Precautions', subtitle: 'PPE selection by procedure and risk—not by diagnosis alone', narration: ['Standard precautions apply to every patient encounter regardless of diagnosis or presumed infection status. They rest on the principle that all blood, body fluids, secretions, excretions (except sweat), non-intact skin, and mucous membranes may contain transmissible infectious agents. Standard precautions include hand hygiene, PPE based on anticipated exposure, respiratory hygiene/cough etiquette, safe injection practices, and safe handling of potentially contaminated equipment and surfaces.','PPE selection under standard precautions follows a risk assessment. For routine assessments with no anticipated body-fluid contact, gloves may not be required. For wound care, catheter care, or any procedure with potential body-fluid contact, gloves are required at minimum. Add a gown when clothing may contact blood or body fluids. Add face protection (mask and eye protection or face shield) when splashes or sprays are anticipated. Select PPE based on the procedure and exposure risk—not the diagnosis alone.','Transmission-based precautions are added to standard precautions for known or suspected infections needing extra measures. Contact precautions (e.g., MRSA, VRE, C. difficile, scabies) require gloves and gown for interactions with the patient or environment. Droplet precautions (e.g., influenza, pertussis, many respiratory viruses) require a surgical mask within about six feet of the patient. Airborne precautions (e.g., tuberculosis, measles, varicella) require an N95 respirator or equivalent (fit-tested per agency policy).'], keyPoints: [{ icon: '🟦', title: 'Standard', detail: 'Every patient. PPE by exposure risk; hand hygiene; safe injections; equipment hygiene.' },{ icon: '🟨', title: 'Contact + Droplet', detail: 'Contact: gloves + gown. Droplet: surgical mask within ~6 feet (plus standard).' },{ icon: '🟥', title: 'Airborne', detail: 'N95 or equivalent; fit testing and agency respiratory protection program apply.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img03, hotspots: [{ id: 'std', label: 'Standard', shortLabel: 'Standard', ariaLabel: 'Investigate Standard', x: 18, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-0', observe: 'All patients. Hand hygiene always. Gloves/gown/face protection based on anticipated exposure.', identifyChoices: [
          { id: 'i1', label: 'Hand hygiene moment required before/after patient contact or aseptic task', correct: true, rationale: 'Correct WHO moment recognition.' },
          { id: 'i2', label: 'Optional when gloves are used', correct: false, rationale: 'Gloves do not replace hand hygiene.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform hand hygiene with correct technique and duration before the indicated moment; do not proceed with the task until complete', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Skip hand hygiene because gloves will be worn', correct: false, rationale: 'Gloves are not a substitute.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document infection-prevention actions relevant to the visit and any exposure events', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Never document hygiene practices', correct: false, rationale: 'Relevant IPC actions and exposures are documented.' }
        ], feedback: { observed: 'All patients. Hand hygiene always. Gloves/gown/face protection based on anticipated exposure.', meaning: 'Standard under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'contact', label: 'Contact', shortLabel: 'Contact', ariaLabel: 'Investigate Contact', x: 40, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-1', observe: 'MRSA, VRE, C. diff, scabies, etc. Gloves + gown for patient and environment contact. Soap/water after C. diff care.', identifyChoices: [
          { id: 'i1', label: 'Contact: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'MRSA, VRE, C. diff, scabies, etc. Gloves + gown for patient and environment contact. Soap/water after C. diff care.', meaning: 'Contact under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'droplet', label: 'Droplet', shortLabel: 'Droplet', ariaLabel: 'Investigate Droplet', x: 60, y: 40, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'Influenza, pertussis, many respiratory viruses. Surgical mask within ~6 feet + standard precautions.', identifyChoices: [
          { id: 'i1', label: 'Droplet: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Influenza, pertussis, many respiratory viruses. Surgical mask within ~6 feet + standard precautions.', meaning: 'Droplet under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'airborne', label: 'Airborne', shortLabel: 'Airborne', ariaLabel: 'Investigate Airborne', x: 82, y: 40, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'TB, measles, varicella. N95/equivalent; fit-tested. Ventilate home; educate household; follow agency RIPP.', identifyChoices: [
          { id: 'i1', label: 'Airborne: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'TB, measles, varicella. N95/equivalent; fit-tested. Ventilate home; educate household; follow agency RIPP.', meaning: 'Airborne under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 3, shortName: 'Asepsis', title: 'Clean vs. Sterile Field', subtitle: 'Clinical decision-making for home procedures', narration: ['Understanding sterile technique versus clean technique—and when each is required—is a core clinical competency. Sterile technique aims to eliminate microorganisms from the critical field and maintain sterility throughout the procedure. Clean technique (medical asepsis) reduces organism load and prevents transfer but does not eliminate all organisms.','Sterile technique is required for procedures that access sterile body cavities or introduce devices into sterile systems. Examples include central-line dressing changes, urinary catheter insertion, tracheostomy care in the early post-placement period as ordered/policy directs, and procedures involving open surgical wounds. Use sterile gloves, create and maintain a sterile field, use only sterile supplies, and apply no-touch technique for critical surfaces.','Clean technique is appropriate for many procedures on non-sterile surfaces or chronic wounds healing by secondary intention—including much chronic wound care, urinary catheter care (not insertion), blood glucose monitoring, and routine medication administration. Use clean gloves, clean supplies, rigorous hand hygiene, and prevent cross-contamination.'], keyPoints: [{ icon: '✦', title: 'Sterile', detail: 'Central line dressings, catheter insertion, open surgical wounds—sterile field and supplies.' },{ icon: '○', title: 'Clean', detail: 'Many chronic wounds, catheter care (not insert), glucose checks—reduce and prevent transfer.' },{ icon: '⚖️', title: 'When unsure', detail: 'Use the higher asepsis level; clarify with RN/orders/agency policy rather than guessing down.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img04, hotspots: [{ id: 'sterile', label: 'Sterile', shortLabel: 'Sterile', ariaLabel: 'Investigate Sterile', x: 28, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0', observe: 'Eliminate microbes from critical field. Central lines, catheter insertion, early surgical wounds as ordered.', identifyChoices: [
          { id: 'i1', label: 'Sterile: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Eliminate microbes from critical field. Central lines, catheter insertion, early surgical wounds as ordered.', meaning: 'Sterile under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'clean', label: 'Clean', shortLabel: 'Clean', ariaLabel: 'Investigate Clean', x: 72, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1', observe: 'Reduce microbes and prevent transfer. Chronic wound care, catheter care, routine meds when appropriate.', identifyChoices: [
          { id: 'i1', label: 'Clean: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Reduce microbes and prevent transfer. Chronic wound care, catheter care, routine meds when appropriate.', meaning: 'Clean under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'decide', label: 'Decision', shortLabel: 'Decision', ariaLabel: 'Investigate Decision', x: 50, y: 72, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-3-2', observe: 'Procedure + orders + CL-SD-016 + immune status. When unsure → higher asepsis; notify RN if orders conflict.', identifyChoices: [
          { id: 'i1', label: 'Decision: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Procedure + orders + CL-SD-016 + immune status. When unsure → higher asepsis; notify RN if orders conflict.', meaning: 'Decision under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 4, shortName: 'Sharps', title: 'Sharps Safety at the Point of Use', subtitle: 'Activate safety features, dispose immediately, and never recap by hand', narration: ['Prepare an approved puncture-resistant sharps container within reach before the procedure. Keep it upright, stable, below eye level, and close enough for immediate disposal without walking with an exposed sharp.','Use safety-engineered devices as trained. Activate the safety feature immediately after use and place the entire device directly into the container. Never bend, break, remove, pass hand-to-hand, set down, or recap a used needle by hand.','Do not force a sharp into an overfilled or damaged container. Close and replace the container at its fill line and follow the agency-approved transport and disposal pathway. For a needlestick or cut, wash immediately with soap and water, report immediately to the agency supervisor/on-call manager and infection-prevention or employee-health pathway, notify the RN if care is affected, and obtain immediate medical evaluation.'], keyPoints: [{ icon: '🛡️', title: 'Safety device', detail: 'Use as trained and activate immediately after use.' },{ icon: '🗑️', title: 'Point-of-use disposal', detail: 'Place directly into a stable puncture-resistant container; never recap, bend, break, or carry loose.' },{ icon: '🚨', title: 'Sharps injury', detail: 'Wash immediately, report immediately, and obtain time-sensitive medical evaluation.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img05, hotspots: [{ id: 'device', label: 'Safety device', shortLabel: 'Safety device', ariaLabel: 'Investigate safety-engineered device', x: 22, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-0', observe: 'A safety-engineered sharp has just been used. Activate the safety feature exactly as trained and keep the sharp controlled until immediate disposal.', identifyChoices: [
          { id: 'i1', label: 'Local signs: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'A safety-engineered sharp has just been used. Activate the safety feature exactly as trained and keep the sharp controlled until immediate disposal.', meaning: 'Local signs under CL-SD-016.', action: 'Prepare the container first, activate safety features, dispose directly without recapping or manipulation, and for an injury stop, wash immediately, report immediately, and obtain immediate medical evaluation.', notify: 'For any sharps injury, after immediate washing notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; notify the supervising RN immediately when patient care is affected; call 911 for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'dispose', label: 'Dispose now', shortLabel: 'Dispose now', ariaLabel: 'Investigate point-of-use sharps disposal', x: 50, y: 22, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-1', observe: 'Place the used device directly into the stable approved puncture-resistant container at the point of use without carrying or setting it down.', identifyChoices: [
          { id: 'i1', label: 'Systemic: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Place the used device directly into the stable approved puncture-resistant container at the point of use without carrying or setting it down.', meaning: 'Systemic under CL-SD-016.', action: 'Prepare the container first, activate safety features, dispose directly without recapping or manipulation, and for an injury stop, wash immediately, report immediately, and obtain immediate medical evaluation.', notify: 'For any sharps injury, after immediate washing notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; notify the supervising RN immediately when patient care is affected; call 911 for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'noRecap', label: 'Never recap', shortLabel: 'Never recap', ariaLabel: 'Investigate prohibition on recapping and manipulating used sharps', x: 78, y: 30, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-4-2', observe: 'Never recap, bend, break, remove, or pass a used needle; activate the safety feature and dispose of it immediately.', identifyChoices: [
          { id: 'i1', label: 'Atypical: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Never recap, bend, break, remove, or pass a used needle; activate the safety feature and dispose of it immediately.', meaning: 'Atypical under CL-SD-016.', action: 'Prepare the container first, activate safety features, dispose directly without recapping or manipulation, and for an injury stop, wash immediately, report immediately, and obtain immediate medical evaluation.', notify: 'For any sharps injury, after immediate washing notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; notify the supervising RN immediately when patient care is affected; call 911 for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'injury', label: 'Sharps injury', shortLabel: 'Sharps injury', ariaLabel: 'Investigate immediate sharps injury response', x: 50, y: 72, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-2', observe: 'For a puncture or cut, stop safely, wash immediately with soap and water without squeezing, scrubbing, or bleach, report immediately, and obtain immediate medical evaluation.', identifyChoices: [
          { id: 'i1', label: 'Notify RN: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'For a puncture or cut, stop safely, wash immediately with soap and water without squeezing, scrubbing, or bleach, report immediately, and obtain immediate medical evaluation.', meaning: 'Notify RN under CL-SD-016.', action: 'Prepare the container first, activate safety features, dispose directly without recapping or manipulation, and for an injury stop, wash immediately, report immediately, and obtain immediate medical evaluation.', notify: 'For any sharps injury, after immediate washing notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; notify the supervising RN immediately when patient care is affected; call 911 for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 5, shortName: 'Bag Barrier', title: 'Nursing-Bag Barrier and Environmental Management', subtitle: 'Preventing cross-contamination between homes', narration: ['Bag technique is the systematic method of organizing and using your nursing bag to prevent cross-contamination between patients and between the home environment and your equipment. It is a core home-health competency without a direct hospital parallel.','Place the nursing bag on a clean barrier—never directly on the floor, furniture, or patient surfaces. Before entering, identify a clean, dry surface; place a disposable barrier (plastic bag or clean paper), then set the bag. If no suitable surface exists, keep the bag on a clean barrier in the vehicle and carry only visit-needed supplies inside.','Organize clean supplies separately from contaminated items. Remove only what the current procedure needs. Never return used supplies to the clean compartment. After the visit, dispose of contaminated items properly, wipe the bag exterior with a disinfectant wipe, and restock for the next visit.'], keyPoints: [{ icon: '🧳', title: 'Barrier always', detail: 'Bag on disposable barrier on clean dry surface—or leave bag in vehicle and carry only needed items.' },{ icon: '🔀', title: 'Clean vs dirty', detail: 'Separate compartments; never return used supplies to clean side; wipe exterior after visits.' },{ icon: '💉', title: 'Sharps', detail: 'Puncture-resistant containers; proper disposal pathways; never loose sharps in bag/vehicle.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img06, hotspots: [{ id: 'barrier', label: 'Barrier', shortLabel: 'Barrier', ariaLabel: 'Investigate Barrier', x: 28, y: 55, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-0', observe: 'Disposable barrier under bag on clean dry surface—never floor or patient bed as default placement.', identifyChoices: [
          { id: 'i1', label: 'Nursing bag must be placed on a clean barrier on a clean, dry surface', correct: true, rationale: 'Correct bag technique.' },
          { id: 'i2', label: 'Bag may be placed on the floor or patient bed without a barrier', correct: false, rationale: 'That violates bag technique.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Place bag on clean barrier on clean dry surface; keep clean and dirty workflows separated', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Place bag on the floor near the chair for convenience', correct: false, rationale: 'Incorrect placement.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document any break in technique and corrective actions if contamination occurs', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document bag location every visit in detail', correct: false, rationale: 'Routine compliant placement need not be verbose; breaks must be recorded.' }
        ], feedback: { observed: 'Disposable barrier under bag on clean dry surface—never floor or patient bed as default placement.', meaning: 'Barrier under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'cleanSide', label: 'Clean zone', shortLabel: 'Clean zone', ariaLabel: 'Investigate Clean zone', x: 50, y: 28, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-1', observe: 'Clean compartment: unused supplies only. Hand hygiene before accessing.', identifyChoices: [
          { id: 'i1', label: 'Hand hygiene moment required before/after patient contact or aseptic task', correct: true, rationale: 'Correct WHO moment recognition.' },
          { id: 'i2', label: 'Optional when gloves are used', correct: false, rationale: 'Gloves do not replace hand hygiene.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform hand hygiene with correct technique and duration before the indicated moment; do not proceed with the task until complete', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Skip hand hygiene because gloves will be worn', correct: false, rationale: 'Gloves are not a substitute.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document infection-prevention actions relevant to the visit and any exposure events', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Never document hygiene practices', correct: false, rationale: 'Relevant IPC actions and exposures are documented.' }
        ], feedback: { observed: 'Clean compartment: unused supplies only. Hand hygiene before accessing.', meaning: 'Clean zone under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'dirtySide', label: 'Dirty zone', shortLabel: 'Dirty zone', ariaLabel: 'Investigate Dirty zone', x: 72, y: 55, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-2', observe: 'Contaminated items stay separate; dispose properly; never return to clean side.', identifyChoices: [
          { id: 'i1', label: 'Dirty zone: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Contaminated items stay separate; dispose properly; never return to clean side.', meaning: 'Dirty zone under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'sharps', label: 'Sharps', shortLabel: 'Sharps', ariaLabel: 'Investigate Sharps', x: 50, y: 78, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-2', observe: 'Puncture-resistant container; educate patient; full-container disposal per local rules and agency policy.', identifyChoices: [
          { id: 'i1', label: 'Sharps: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Puncture-resistant container; educate patient; full-container disposal per local rules and agency policy.', meaning: 'Sharps under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening patient findings or care impact, notify the supervising RN promptly during the same visit. For occupational exposure, after immediate first aid notify the agency supervisor/on-call manager and infection-prevention or employee-health pathway immediately; call 911 first for life-threatening instability.', document: 'Record the trigger and objective data; precaution/PPE/technique; first aid or correction and exact time; patient impact/response; every recipient’s name/role and exact notification time; information reported; directions or orders, read-back, implementation, reassessment, and final disposition.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] },
{ id: 6, shortName: 'Reporting', title: 'Infection Findings — Reporting and Documentation', subtitle: 'What surveyors and QAPI expect to see', narration: ['Infection-prevention documentation must be thorough, timely, and specific. CMS surveyors review infection-prevention documentation during surveys. Clinical notes should show that you assessed, implemented, and evaluated infection-prevention measures for each encounter—within LVN documentation standards and under the Plan of Care.','For every visit, documentation commonly includes: precaution type in effect (standard or transmission-based), PPE used, hand hygiene (often EHR attestation plus narrative when relevant), patient/caregiver education on infection prevention, wound findings with objective measurements when applicable, and any infection signs with your clinical response.','When you identify a potential infection, document: specific signs and symptoms with objective data (e.g., temperature 101.2°F, wound erythema 3 cm beyond wound edge, purulent drainage), clinical significance in plain terms, RN case manager notification with date, time, and name of person notified, any orders received and implemented, and patient response. Do not invent compliance rates or agency outcome percentages in notes.'], keyPoints: [{ icon: '📝', title: 'Every visit', detail: 'Precautions, PPE, hand hygiene, education, objective wound/infection findings as applicable.' },{ icon: '🚨', title: 'If infection suspected', detail: 'Objective data + RN notification (who/when) + orders implemented + patient response.' },{ icon: '✅', title: 'Knowledge vs competency', detail: 'Quiz = knowledge check. Return demo and authorized sign-off determine practical competency.' }], clinicalTip: 'Stop unsafe care, protect the patient, and promptly notify the supervising RN; use 911 first for life-threatening instability and document the recipient, exact time, directions, action, and response.', sourceLabels: [{ kind: 'Agency', text: 'CL-SD-016' }, { kind: 'Federal', text: '42 CFR § 484.70' }], sceneImage: img07, hotspots: [{ id: 'visitDoc', label: 'Visit note', shortLabel: 'Visit note', ariaLabel: 'Investigate Visit note', x: 25, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-0', observe: 'Precaution type, PPE, hand hygiene, education, objective assessments each visit.', identifyChoices: [
          { id: 'i1', label: 'Hand hygiene moment required before/after patient contact or aseptic task', correct: true, rationale: 'Correct WHO moment recognition.' },
          { id: 'i2', label: 'Optional when gloves are used', correct: false, rationale: 'Gloves do not replace hand hygiene.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Perform hand hygiene with correct technique and duration before the indicated moment; do not proceed with the task until complete', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Skip hand hygiene because gloves will be worn', correct: false, rationale: 'Gloves are not a substitute.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document infection-prevention actions relevant to the visit and any exposure events', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Never document hygiene practices', correct: false, rationale: 'Relevant IPC actions and exposures are documented.' }
        ], feedback: { observed: 'Precaution type, PPE, hand hygiene, education, objective assessments each visit.', meaning: 'Visit note under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening infection findings, notify the supervising RN or RN case manager promptly during the same visit. Call 911 first for life-threatening instability, then notify the RN and agency supervisor/on-call manager. Route required infection-event or surveillance reports to the infection preventionist/program; only an authorized agency role makes external public-health reports.', document: 'Record objective findings and baseline comparison; precautions/PPE/technique; recipient name/role and exact time; what was reported; directions or orders and read-back; implementation time; education; reassessment, patient response, final disposition, and required event-report submission.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'event', label: 'Infection event', shortLabel: 'Infection ev…', ariaLabel: 'Investigate Infection event', x: 50, y: 55, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-1', observe: 'Objective signs, RN notified (name/time), orders, response; complete agency infection report.', identifyChoices: [
          { id: 'i1', label: 'Infection event: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Objective signs, RN notified (name/time), orders, response; complete agency infection report.', meaning: 'Infection event under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening infection findings, notify the supervising RN or RN case manager promptly during the same visit. Call 911 first for life-threatening instability, then notify the RN and agency supervisor/on-call manager. Route required infection-event or surveillance reports to the infection preventionist/program; only an authorized agency role makes external public-health reports.', document: 'Record objective findings and baseline comparison; precautions/PPE/technique; recipient name/role and exact time; what was reported; directions or orders and read-back; implementation time; education; reassessment, patient response, final disposition, and required event-report submission.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'qapi', label: 'Surveillance', shortLabel: 'Surveillance', ariaLabel: 'Investigate Surveillance', x: 75, y: 35, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-2', observe: 'Infection Preventionist / CL-SD-016 program uses reports for QAPI and required public-health reporting.', identifyChoices: [
          { id: 'i1', label: 'Surveillance: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Infection Preventionist / CL-SD-016 program uses reports for QAPI and required public-health reporting.', meaning: 'Surveillance under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening infection findings, notify the supervising RN or RN case manager promptly during the same visit. Call 911 first for life-threatening instability, then notify the RN and agency supervisor/on-call manager. Route required infection-event or surveillance reports to the infection preventionist/program; only an authorized agency role makes external public-health reports.', document: 'Record objective findings and baseline comparison; precautions/PPE/technique; recipient name/role and exact time; what was reported; directions or orders and read-back; implementation time; education; reassessment, patient response, final disposition, and required event-report submission.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } },{ id: 'mastery', label: 'Mastery path', shortLabel: 'Mastery path', ariaLabel: 'Investigate Mastery path', x: 50, y: 80, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-2', observe: 'Quiz proves knowledge only. Observed practice and authorized sign-off complete competency.', identifyChoices: [
          { id: 'i1', label: 'Mastery path: infection-prevention control point under CL-SD-016 / 42 CFR § 484.70', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'i2', label: 'Administrative only with no clinical action', correct: false, rationale: 'IPC controls are clinical actions.' }
        ],
        decideChoices: [
          { id: 'd1', label: 'Stop before unsafe care; apply the required infection-control technique and correct any break. If exposure occurred, give immediate first aid and activate the agency exposure pathway', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'd2', label: 'Continue the task without the required hygiene, PPE, asepsis, or safe disposal control', correct: false, rationale: 'PPE and technique are not optional.' }
        ],
        documentChoices: [
          { id: 'doc1', label: 'Document objective findings, precautions/PPE/technique, any break or exposure and timed first aid, corrective action, patient response, recipient name/role and exact time, directions/read-back, implementation, and disposition', correct: true, rationale: 'Correct — this identifies the trigger, immediate control, escalation, and documentation needed under CL-SD-016.' },
          { id: 'doc2', label: 'Document “precautions followed” only', correct: false, rationale: 'Vague wording omits the trigger, exact times, recipient, directions, correction, and outcome.' }
        ], feedback: { observed: 'Quiz proves knowledge only. Observed practice and authorized sign-off complete competency.', meaning: 'Mastery path under CL-SD-016.', action: 'Stop before unsafe care, apply the required hygiene, PPE, asepsis, containment, or disposal control, and correct any technique break before resuming.', notify: 'For new or worsening infection findings, notify the supervising RN or RN case manager promptly during the same visit. Call 911 first for life-threatening instability, then notify the RN and agency supervisor/on-call manager. Route required infection-event or surveillance reports to the infection preventionist/program; only an authorized agency role makes external public-health reports.', document: 'Record objective findings and baseline comparison; precautions/PPE/technique; recipient name/role and exact time; what was reported; directions or orders and read-back; implementation time; education; reassessment, patient response, final disposition, and required event-report submission.', policyRefs: ['CL-SD-016', '42 CFR § 484.70'] } }] }
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: 'How many links are in the chain of infection that the LVN targets during home care?',
    options: [
      '4',
      '5',
      '6',
      '8'
    ],
    correct: 2,
    rationale: 'The chain has six links: pathogen, reservoir, portal of exit, mode of transmission, portal of entry, and susceptible host. Breaking any link interrupts transmission.',
  },
  {
    id: 2,
    stem: 'Which WHO hand hygiene moment occurs IMMEDIATELY before wound care?',
    options: [
      'Before touching the patient',
      'Before a clean/aseptic procedure',
      'After body-fluid exposure risk',
      'After touching patient surroundings'
    ],
    correct: 1,
    rationale: 'Moment 2—before a clean/aseptic procedure—is required immediately before wound care, even if hand hygiene was performed before general patient contact.',
  },
  {
    id: 3,
    stem: 'Contact precautions require which additional PPE beyond standard precautions for patient/environment contact?',
    options: [
      'Surgical mask only',
      'N95 respirator',
      'Gloves and gown',
      'Face shield only'
    ],
    correct: 2,
    rationale: 'Contact precautions add gloves and gown for interactions with the patient or the patient’s environment (e.g., MRSA, VRE, C. difficile, scabies), always layered on standard precautions.',
  },
  {
    id: 4,
    stem: 'Airborne precautions require what type of respiratory protection?',
    options: [
      'N95 respirator (or equivalent)',
      'Surgical mask only',
      'Face shield alone',
      'No respiratory protection'
    ],
    correct: 0,
    rationale: 'Airborne pathogens (e.g., TB, measles, varicella) require an N95 or equivalent respirator used within a fit-tested respiratory protection program—not a surgical mask alone.',
  },
  {
    id: 5,
    stem: 'When is sterile technique generally required rather than clean technique?',
    options: [
      'All wound care without exception',
      'Central-line dressing changes',
      'Blood glucose monitoring',
      'Oral medication administration'
    ],
    correct: 1,
    rationale: 'Central-line dressing changes access a sterile intravascular system and require sterile technique. Clean technique is often appropriate for glucose checks and oral meds; not all wound care is sterile—follow orders and policy.',
  },
  {
    id: 6,
    stem: 'In many older adults, the PRIMARY early sign of UTI may be:',
    options: [
      'High spiking fever only',
      'New-onset confusion',
      'Gross hematuria only',
      'Severe flank pain only'
    ],
    correct: 1,
    rationale: 'Older adults often present atypically. New confusion, falls, or functional decline may be the first clue to UTI rather than classic high fever or flank pain.',
  },
  {
    id: 7,
    stem: 'Where should the nursing bag be placed in the patient\'s home?',
    options: [
      'Directly on the floor near the chair',
      'On the patient\'s bed without a barrier',
      'On a clean barrier on a clean, dry surface',
      'In the patient\'s bathroom sink area'
    ],
    correct: 2,
    rationale: 'Bag technique requires a clean barrier on a clean, dry surface. Never place the bag directly on the floor or on the patient’s bed without appropriate barrier practice; if no surface exists, leave the bag in the vehicle.',
  },
  {
    id: 8,
    stem: 'Periwound erythema extending beyond approximately what distance from the wound edge is a concerning infection clue discussed in this module?',
    options: [
      '0.5 cm',
      '1 cm',
      '5 cm only (never less)',
      '2 cm'
    ],
    correct: 3,
    rationale: 'Periwound erythema extending beyond about 2 cm from the wound edge is a red-flag finding to document and escalate, along with other local/systemic signs.',
  },
  {
    id: 9,
    stem: 'What is the primary federal regulatory basis for the home health agency\'s infection prevention and control program?',
    options: [
      '42 CFR § 484.55',
      '42 CFR § 484.60',
      '42 CFR § 484.80',
      '42 CFR § 484.70'
    ],
    correct: 3,
    rationale: '42 CFR § 484.70 is the Condition of Participation for Infection Prevention and Control. Agency policy CL-SD-016 operationalizes clinical standards; it does not replace the federal CoP.',
  },
  {
    id: 10,
    stem: 'When you identify signs of infection during a skilled visit, your FIRST appropriate action is to:',
    options: [
      'Document objective findings and notify the RN case manager',
      'Independently start antibiotics from residual supply',
      'Discharge the patient from home health',
      'Always call 911 before any assessment documentation'
    ],
    correct: 0,
    rationale: 'LVNs document objective findings and notify the RN case manager (and follow emergency escalation if the patient is unstable). LVNs do not independently prescribe antibiotics, discharge patients, or skip assessment—911 is for true emergencies per clinical judgment and agency policy.',
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
  .lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}
  .lvn002-tabs{scrollbar-width:thin}.lvn002-tabs::-webkit-scrollbar{display:block;height:4px}
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
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:9px;max-width:76px;overflow:hidden;text-overflow:ellipsis;padding:3px 5px}
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


const STORAGE_KEY = 'lvn-010-progress-v5414';

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

export default function LVN010() {
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
          <span className="brand-text">LVN-010 — Infection</span>
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
