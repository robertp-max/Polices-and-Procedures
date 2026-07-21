/**
 * LVN-008 — Fall Risk
 * v5.5.0-PASS5 | Observe→Identify→Decide→Document→Feedback→Complete
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/lvn-008/lesson-01-why-falls.png';
import img02 from './assets/lvn-008/lesson-02-risk-tools.png';
import img03 from './assets/lvn-008/lesson-03-risk-factors.png';
import img04 from './assets/lvn-008/lesson-04-interventions.png';
import img05 from './assets/lvn-008/lesson-05-post-fall.png';
import img06 from './assets/lvn-008/lesson-06-documentation.png';
import img07 from './assets/lvn-008/lesson-07-practice.png';


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

const MODULE_META = { id: 'LVN-008', title: 'Fall Risk', pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  'Home living room with curled rug, cord across the walking path, poor hallway lighting, and an LVN screening hazards.',
  'Fall-risk screening with agency tool, gait and cane observation, medication containers, vision cues, and risk indicators.',
  'Seated patient with cords crossing the route, loose backless footwear, and an assistive device out of reach.',
  'LVN teaching ordered prevention with a walker, closed-heel footwear, lighting, secured cords, and a removed rug.',
  'Post-fall scene with the patient kept still, an overturned walker, and a clinician performing an initial assessment.',
  'Three-position orthostatic assessment showing supine, seated, and standing blood-pressure measurements.',
  'Supervised home fall-safety practice with walker use, a marked clear route, doorway threshold, lighting, and teach-back board.',
] as const;

const PAGES: PageData[] = [
{ id: 0, shortName: 'Why Falls', title: 'Falls Are the Leading Adverse Event in Home Health', subtitle: 'Why This Matters', narration: ['Welcome to Module LVN-008: Fall Risk Assessment and Prevention. Falls are among the most common adverse events in home health care and a leading cause of injury-related death in adults over age sixty-five. At Care Indeed Home Health Care, fall prevention is a core clinical responsibility governed by Policy CL-SD-015 (Fall Risk Assessment & Prevention) and monitored under the Quality Assurance and Performance Improvement (QAPI) program per 42 CFR § 484.65.','Public health data (e.g., CDC) consistently show that about one in four adults aged sixty-five and older falls each year, and falls are a major driver of traumatic brain injury and fractures in older adults. Home health agencies track falls as quality and adverse-event signals that can affect survey readiness and publicly reported outcomes. Do not invent or rely on local “agency success percentages” in documentation or teaching—use validated tools, observation, and the Plan of Care (POC).','As an LVN, you are often the clinician with the most frequent skilled-nursing contact between RN supervisory and comprehensive assessment visits. A new medication, dizziness, gait change, near-fall, or home environment change can shift risk quickly. Your role is to screen at every visit, observe mobility and environment, document findings objectively, implement ordered fall-prevention interventions under the POC, and escalate changes to the assigned RN promptly—so the comprehensive assessment and Fall Prevention Plan can be updated by the authorized clinician.'], keyPoints: [{ icon: '📋', title: 'Every-visit screen', detail: 'Ask about falls, near-falls, dizziness, and unsteadiness; observe mobility and the home route.' },{ icon: '👀', title: 'Frontline observation', detail: 'Identify gait change, medication effects, equipment problems, and environmental hazards.' },{ icon: '📞', title: 'Escalate change', detail: 'Notify the assigned or supervising RN promptly for new or worsening risk and any fall.' },{ icon: '🧭', title: 'Scope boundary', detail: 'The RN owns comprehensive assessment and plan updates; the LVN implements ordered prevention.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' }], sceneImage: img01, hotspots: [{ id: 'loose-rug', label: 'Curled loose rug', shortLabel: 'Curled loose rug', ariaLabel: 'Investigate Curled loose rug', x: 46, y: 73, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-0', observe: 'The rug edge is curled into the primary walking route.', identifyChoices: [{ id: 'loose-rug-identify', label: 'A curled or unsecured rug is an immediate extrinsic trip hazard.', correct: true, rationale: 'Correct. A curled or unsecured rug is an immediate extrinsic trip hazard.' },{ id: 'loose-rug-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'loose-rug-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'loose-rug-decide', label: 'Hold use of the affected route. Proceed only after the rug is removed or securely corrected within the ordered plan and patient agreement; do not improvise an unsafe fix.', correct: true, rationale: 'Correct. Hold use of the affected route. Proceed only after the rug is removed or securely corrected within the ordered plan and patient agreement; do not improvise an unsafe fix.' },{ id: 'loose-rug-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'loose-rug-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'loose-rug-document', label: 'Record rug location and condition, route affected, correction or alternate route, teaching and response, RN name and time, instructions, and final status.', correct: true, rationale: 'Correct. Record rug location and condition, route affected, correction or alternate route, teaching and response, RN name and time, instructions, and final status.' },{ id: 'loose-rug-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The rug edge is curled into the primary walking route.', meaning: 'A curled or unsecured rug is an immediate extrinsic trip hazard.', action: 'Hold use of the affected route. Proceed only after the rug is removed or securely corrected within the ordered plan and patient agreement; do not improvise an unsafe fix.', notify: 'Notify the assigned or supervising RN the same visit if the rug cannot be corrected, the patient refuses, or no safe alternate route exists.', document: 'Record rug location and condition, route affected, correction or alternate route, teaching and response, RN name and time, instructions, and final status.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'floor-cord', label: 'Cord across route', shortLabel: 'Cord across route', ariaLabel: 'Investigate Cord across route', x: 55, y: 57, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-1', observe: 'An electrical cord crosses the route between the chair and hallway.', identifyChoices: [{ id: 'floor-cord-identify', label: 'A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.', correct: true, rationale: 'Correct. A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.' },{ id: 'floor-cord-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'floor-cord-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'floor-cord-decide', label: 'Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.', correct: true, rationale: 'Correct. Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.' },{ id: 'floor-cord-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'floor-cord-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'floor-cord-document', label: 'Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.', correct: true, rationale: 'Correct. Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.' },{ id: 'floor-cord-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'An electrical cord crosses the route between the chair and hallway.', meaning: 'A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.', action: 'Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.', notify: 'Notify the RN the same visit if the cord cannot be safely relocated, the patient refuses, or no safe route remains; report any near-fall promptly.', document: 'Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'dark-hallway', label: 'Poor hallway lighting', shortLabel: 'Poor hallway lighting', ariaLabel: 'Investigate Poor hallway lighting', x: 63, y: 35, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-0-2', observe: 'The hallway and doorway are dim compared with the living area.', identifyChoices: [{ id: 'dark-hallway-identify', label: 'Poor contrast and visibility increase fall risk, especially during nighttime bathroom travel.', correct: true, rationale: 'Correct. Poor contrast and visibility increase fall risk, especially during nighttime bathroom travel.' },{ id: 'dark-hallway-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'dark-hallway-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'dark-hallway-decide', label: 'Hold unassisted travel through the dim route; use available safe lighting and ordered assistance. Proceed only when visibility is adequate.', correct: true, rationale: 'Correct. Hold unassisted travel through the dim route; use available safe lighting and ordered assistance. Proceed only when visibility is adequate.' },{ id: 'dark-hallway-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'dark-hallway-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'dark-hallway-document', label: 'Record route and time, lighting observed, assistance or lighting used, teaching and response, near-fall, RN name and time, instructions, and outcome.', correct: true, rationale: 'Correct. Record route and time, lighting observed, assistance or lighting used, teaching and response, near-fall, RN name and time, instructions, and outcome.' },{ id: 'dark-hallway-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The hallway and doorway are dim compared with the living area.', meaning: 'Poor contrast and visibility increase fall risk, especially during nighttime bathroom travel.', action: 'Hold unassisted travel through the dim route; use available safe lighting and ordered assistance. Proceed only when visibility is adequate.', notify: 'Notify the RN the same day if lighting cannot be corrected or no safe assisted route exists; report a near-fall promptly.', document: 'Record route and time, lighting observed, assistance or lighting used, teaching and response, near-fall, RN name and time, instructions, and outcome.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] },
{ id: 1, shortName: 'Risk Tools', title: 'Standardized Fall Risk Tools — Morse & Agency Process', subtitle: 'Assessment Tools', narration: ['Per CL-SD-015, a comprehensive fall risk assessment is completed by the assigned RN at start of care (SOC), at each OASIS time point, after any fall, and when a significant change affects fall risk. The assessment uses a validated tool—examples include the Morse Fall Scale, Timed Up and Go (TUG), or an equivalent agency-approved instrument—and clinical judgment across history, medications, gait/balance, vision, cognition, orthostatic screening, environment, continence, footwear, and assistive devices.','The Morse Fall Scale (commonly taught and often used as an agency tool) scores six factors: History of Falling (0 or 25 — fall within past three months typically scores 25); Secondary Diagnosis (0 or 15); Ambulatory Aid (0 / 15 / 30 — none / cane-crutches-walker / furniture walking); IV/Heparin Lock or equivalent access factor as defined by the tool version in use (0 or 20); Gait (0 / 10 / 20 — normal / weak / impaired); and Mental Status (0 or 15 — oriented to own ability vs. overestimates ability or forgets limitations). Totals are commonly interpreted as low (0–24), moderate (25–44), and high (≥45). Always follow the exact scoring sheet and cutoffs in the current agency form (current agency fall-risk form).','LVN application: You screen at every visit and may complete agency-authorized screening or re-scoring when trained and directed—never as a substitute for the RN’s comprehensive assessment or OASIS coding. When your screen shows rising risk (new fall, near-fall, gait decline, new dizziness, med changes with sedating effects), notify the assigned RN so comprehensive reassessment and POC/Fall Prevention Plan updates can occur.'], keyPoints: [{ icon: '🧮', title: 'Use the current agency tool', detail: 'Follow the exact scoring sheet and cutoffs; do not substitute memory for the current form.' },{ icon: '🩺', title: 'RN comprehensive assessment', detail: 'The RN reassesses after a fall or significant change and at required time points.' },{ icon: '🚶', title: 'Pair score with function', detail: 'Report score change with gait, transfer, device, cognition, and symptom findings.' },{ icon: '⛔', title: 'No independent OASIS or plan change', detail: 'An authorized LVN screen does not permit independent OASIS coding or POC revision.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' }], sceneImage: img02, hotspots: [{ id: 'agency-risk-tool', label: 'Current fall-risk tool', shortLabel: 'Current fall-risk tool', ariaLabel: 'Investigate Current fall-risk tool', x: 48, y: 72, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-1-0', observe: 'The current agency fall-risk screen is open while the clinician observes the patient.', identifyChoices: [{ id: 'agency-risk-tool-identify', label: 'An authorized LVN screen supports but does not replace the RN comprehensive assessment or OASIS.', correct: true, rationale: 'Correct. An authorized LVN screen supports but does not replace the RN comprehensive assessment or OASIS.' },{ id: 'agency-risk-tool-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'agency-risk-tool-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'agency-risk-tool-decide', label: 'Proceed with the current agency tool exactly as trained. Hold scoring when required data are missing; stop before independently coding OASIS or changing the POC.', correct: true, rationale: 'Correct. Proceed with the current agency tool exactly as trained. Hold scoring when required data are missing; stop before independently coding OASIS or changing the POC.' },{ id: 'agency-risk-tool-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'agency-risk-tool-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'agency-risk-tool-document', label: 'Record tool and version, item responses, score and band per current form, supporting observations, RN name and time, and direction.', correct: true, rationale: 'Correct. Record tool and version, item responses, score and band per current form, supporting observations, RN name and time, and direction.' },{ id: 'agency-risk-tool-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The current agency fall-risk screen is open while the clinician observes the patient.', meaning: 'An authorized LVN screen supports but does not replace the RN comprehensive assessment or OASIS.', action: 'Proceed with the current agency tool exactly as trained. Hold scoring when required data are missing; stop before independently coding OASIS or changing the POC.', notify: 'Notify the RN promptly for a new fall or near-fall, higher score, high-risk result, or meaningful functional change.', document: 'Record tool and version, item responses, score and band per current form, supporting observations, RN name and time, and direction.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'cane-gait', label: 'Cane and gait', shortLabel: 'Cane and gait', ariaLabel: 'Investigate Cane and gait', x: 31, y: 35, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-1', observe: 'The patient walks with a cane while the clinician observes stride, balance, and assistance needs.', identifyChoices: [{ id: 'cane-gait-identify', label: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', correct: true, rationale: 'Correct. Device placement, condition, fit, technique, gait, and assistance level must be assessed together.' },{ id: 'cane-gait-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'cane-gait-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'cane-gait-decide', label: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', correct: true, rationale: 'Correct. Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.' },{ id: 'cane-gait-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'cane-gait-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'cane-gait-document', label: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.' },{ id: 'cane-gait-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The patient walks with a cane while the clinician observes stride, balance, and assistance needs.', meaning: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', action: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', notify: 'Notify the RN promptly the same visit for damage, poor fit, unsafe technique, increased assistance, gait decline, or near-fall.', document: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'medication-vision', label: 'Medication and vision cues', shortLabel: 'Medication and vision cues', ariaLabel: 'Investigate Medication and vision cues', x: 76, y: 28, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-1-2', observe: 'Medication containers and vision aids are included in the risk screen.', identifyChoices: [{ id: 'medication-vision-identify', label: 'Medication effects, vision, gait, and insight can combine to raise fall risk; the LVN does not change medication orders.', correct: true, rationale: 'Correct. Medication effects, vision, gait, and insight can combine to raise fall risk; the LVN does not change medication orders.' },{ id: 'medication-vision-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'medication-vision-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'medication-vision-decide', label: 'Proceed with ordered screening. Stop before holding, discontinuing, or changing medication without an order; hold unsafe mobility for new dizziness, sedation, or vision change.', correct: true, rationale: 'Correct. Proceed with ordered screening. Stop before holding, discontinuing, or changing medication without an order; hold unsafe mobility for new dizziness, sedation, or vision change.' },{ id: 'medication-vision-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'medication-vision-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'medication-vision-document', label: 'Record medication or aid involved, dose and time if relevant, exact symptom and onset, objective findings, safety action, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record medication or aid involved, dose and time if relevant, exact symptom and onset, objective findings, safety action, RN name and time, and instructions.' },{ id: 'medication-vision-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'Medication containers and vision aids are included in the risk screen.', meaning: 'Medication effects, vision, gait, and insight can combine to raise fall risk; the LVN does not change medication orders.', action: 'Proceed with ordered screening. Stop before holding, discontinuing, or changing medication without an order; hold unsafe mobility for new dizziness, sedation, or vision change.', notify: 'Notify the RN the same day for new dizziness, sedation, hypotension, vision change, adherence concern, or suspected medication contribution; use emergency escalation for severe acute symptoms.', document: 'Record medication or aid involved, dose and time if relevant, exact symptom and onset, objective findings, safety action, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] },
{ id: 2, shortName: 'Factors', title: 'Risk Factor Identification — Intrinsic vs. Extrinsic', subtitle: 'Risk Factors', narration: ['Fall risk factors are intrinsic (patient-related) and extrinsic (environment/equipment). Effective prevention addresses both. A patient with good balance can still trip on a rug; a clear home cannot fully protect someone with severe orthostatic hypotension. Your every-visit screen should capture both dimensions and feed the interdisciplinary team.','Intrinsic examples: age-related frailty, prior falls, gait/balance impairment, visual deficit, cognitive impairment or poor insight, polypharmacy and fall-risk-increasing drugs (FRIDs), orthostatic hypotension, urinary urgency/nocturia, neuropathy, and lower-extremity weakness. Extrinsic examples: loose rugs, poor lighting (especially night path to bathroom), clutter and cords, wet floors, missing grab bars/handrails, improper bed/toilet height, unsafe footwear, unstable furniture used for support, and pets underfoot.','Medication-related risk deserves deliberate attention. Classes frequently associated with higher fall risk include benzodiazepines and other sedative-hypnotics, opioids, antihypertensives (especially agents that can cause hypotension), anticholinergics, antidepressants, antipsychotics, and anticonvulsants. Polypharmacy (≥5 medications) is a red flag for RN/pharmacist/physician review. LVNs do not change medication orders; you assess side effects (dizziness, sedation, orthostasis), timing, and adherence, then escalate concerns.'], keyPoints: [{ icon: '🏠', title: 'Intrinsic plus extrinsic', detail: 'Combine symptoms, function, medication effects, and history with the actual home route.' },{ icon: '💊', title: 'FRIDs: review, do not alter', detail: 'Observe dizziness or sedation and report; do not independently change medication orders.' },{ icon: '🩸', title: 'Orthostatic threshold', detail: 'A drop of at least 20 systolic or 10 diastolic is a common positive threshold; follow agency procedure.' },{ icon: '⚠️', title: 'Near-falls are changes', detail: 'Document circumstances and notify the RN promptly rather than waiting for injury.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' }], sceneImage: img03, hotspots: [{ id: 'crossing-cords', label: 'Crossing electrical cords', shortLabel: 'Crossing electrical cords', ariaLabel: 'Investigate Crossing electrical cords', x: 42, y: 57, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-0', observe: 'Two cords cross the patient’s required walking route.', identifyChoices: [{ id: 'crossing-cords-identify', label: 'A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.', correct: true, rationale: 'Correct. A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.' },{ id: 'crossing-cords-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'crossing-cords-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'crossing-cords-decide', label: 'Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.', correct: true, rationale: 'Correct. Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.' },{ id: 'crossing-cords-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'crossing-cords-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'crossing-cords-document', label: 'Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.', correct: true, rationale: 'Correct. Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.' },{ id: 'crossing-cords-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'Two cords cross the patient’s required walking route.', meaning: 'A cord crossing a required walking route is a catch and trip hazard; electrical alteration is not an LVN intervention.', action: 'Hold use of the route. Proceed only after the cord is safely rerouted or secured without electrical alteration, or a clear alternate route is established.', notify: 'Notify the RN the same visit if the cord cannot be safely relocated, the patient refuses, or no safe route remains; report any near-fall promptly.', document: 'Record cord source and location, route affected, correction or alternate route, teaching and response, near-fall if any, RN name and time, instructions, and outcome.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'loose-footwear', label: 'Loose backless footwear', shortLabel: 'Loose backless footwear', ariaLabel: 'Investigate Loose backless footwear', x: 73, y: 84, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-1', observe: 'A backless slipper lies in the walking path and similar footwear is in use.', identifyChoices: [{ id: 'loose-footwear-identify', label: 'Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.', correct: true, rationale: 'Correct. Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.' },{ id: 'loose-footwear-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'loose-footwear-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'loose-footwear-decide', label: 'Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.', correct: true, rationale: 'Correct. Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.' },{ id: 'loose-footwear-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'loose-footwear-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'loose-footwear-document', label: 'Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.', correct: true, rationale: 'Correct. Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.' },{ id: 'loose-footwear-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'A backless slipper lies in the walking path and similar footwear is in use.', meaning: 'Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.', action: 'Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.', notify: 'Notify the RN the same visit for unsafe fit, skin injury, pain, edema, refusal, or no safe alternative; report a near-fall promptly.', document: 'Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'cane-out-of-reach', label: 'Assistive device out of reach', shortLabel: 'Assistive device out of reach', ariaLabel: 'Investigate Assistive device out of reach', x: 78, y: 57, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-2-2', observe: 'The cane is leaning away from the seated patient across the corded route.', identifyChoices: [{ id: 'cane-out-of-reach-identify', label: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', correct: true, rationale: 'Correct. Device placement, condition, fit, technique, gait, and assistance level must be assessed together.' },{ id: 'cane-out-of-reach-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'cane-out-of-reach-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'cane-out-of-reach-decide', label: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', correct: true, rationale: 'Correct. Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.' },{ id: 'cane-out-of-reach-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'cane-out-of-reach-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'cane-out-of-reach-document', label: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.' },{ id: 'cane-out-of-reach-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The cane is leaning away from the seated patient across the corded route.', meaning: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', action: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', notify: 'Notify the RN promptly the same visit for damage, poor fit, unsafe technique, increased assistance, gait decline, or near-fall.', document: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] },
{ id: 3, shortName: 'Interventions', title: 'Fall Prevention Interventions — The Four Pillars', subtitle: 'Interventions Under POC', narration: ['Fall prevention interventions organize into four pillars: Environmental Modification, Mobility Enhancement, Medication Safety, and Patient/Caregiver Education. The individualized Fall Prevention Plan is developed by the assigned RN as part of the plan of care for moderate/high-risk patients (CL-SD-015). Your LVN role is to implement ordered interventions within scope, reinforce education every visit, document effectiveness, and notify the RN when interventions fail or new risk appears.','Environment (often immediately actionable): secure or remove throw rugs; improve lighting and nightlights on the bedroom–bathroom path; clear clutter and cords; recommend grab bars (do not improvise unsafe installations—coordinate DME/OT/agency process); assess bed height for safe sit-to-stand; verify stair handrails. Document hazards identified, teaching given, and patient/caregiver response—including refusals (refusal is documented and escalated; the RN notifies the physician per policy).','Mobility: ensure prescribed assistive devices are present, intact, and used correctly; reinforce transfer technique; support PT/OT exercise programs as ordered (you do not independently redesign therapy plans); verify safe footwear; reassess gait each visit. New instability → specific observation + RN notify for reassessment (CL-SD-015 every-visit screen).'], keyPoints: [{ icon: '🏠', title: 'Clear the route', detail: 'Address rugs, cords, clutter, and lighting within the ordered plan and patient agreement.' },{ icon: '🦯', title: 'Use the prescribed device', detail: 'Confirm the device is present, intact, correctly fitted, and used for transfers and walking.' },{ icon: '👟', title: 'Safe footwear', detail: 'Reinforce closed-heel nonskid footwear; document refusal or inability and notify the RN.' },{ icon: '📞', title: 'Escalate failed prevention', detail: 'Report unresolved hazards, refusal, device failure, or new instability for RN reassessment.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' }], sceneImage: img04, hotspots: [{ id: 'walker-technique', label: 'Prescribed walker use', shortLabel: 'Prescribed walker use', ariaLabel: 'Investigate Prescribed walker use', x: 40, y: 57, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-0', observe: 'The patient is preparing to stand with a walker while the LVN coaches from the ordered plan.', identifyChoices: [{ id: 'walker-technique-identify', label: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', correct: true, rationale: 'Correct. Device placement, condition, fit, technique, gait, and assistance level must be assessed together.' },{ id: 'walker-technique-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'walker-technique-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'walker-technique-decide', label: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', correct: true, rationale: 'Correct. Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.' },{ id: 'walker-technique-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'walker-technique-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'walker-technique-document', label: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.' },{ id: 'walker-technique-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The patient is preparing to stand with a walker while the LVN coaches from the ordered plan.', meaning: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', action: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', notify: 'Notify the RN promptly the same visit for damage, poor fit, unsafe technique, increased assistance, gait decline, or near-fall.', document: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'closed-heel-footwear', label: 'Closed-heel nonskid footwear', shortLabel: 'Closed-heel nonskid footwear', ariaLabel: 'Investigate Closed-heel nonskid footwear', x: 18, y: 88, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-1', observe: 'Closed-heel nonskid footwear is available beside the chair.', identifyChoices: [{ id: 'closed-heel-footwear-identify', label: 'Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.', correct: true, rationale: 'Correct. Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.' },{ id: 'closed-heel-footwear-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'closed-heel-footwear-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'closed-heel-footwear-decide', label: 'Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.', correct: true, rationale: 'Correct. Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.' },{ id: 'closed-heel-footwear-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'closed-heel-footwear-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'closed-heel-footwear-document', label: 'Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.', correct: true, rationale: 'Correct. Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.' },{ id: 'closed-heel-footwear-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'Closed-heel nonskid footwear is available beside the chair.', meaning: 'Loose, backless, poorly fitted, or low-traction footwear can slip off and become a separate trip hazard.', action: 'Hold standing or walking until the path is clear and safe, correctly fitted nonskid footwear is used. Stop if no safe footwear is available or a new foot problem is present.', notify: 'Notify the RN the same visit for unsafe fit, skin injury, pain, edema, refusal, or no safe alternative; report a near-fall promptly.', document: 'Record footwear type, fit and sole, foot or skin finding when indicated, correction, teaching and teach-back, refusal or barrier, RN name and time, instructions, and response.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'lit-clear-route', label: 'Lighted cleared route', shortLabel: 'Lighted cleared route', ariaLabel: 'Investigate Lighted cleared route', x: 74, y: 39, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-3-2', observe: 'The room is well lit and cords are secured, but a rolled rug remains near the route.', identifyChoices: [{ id: 'lit-clear-route-identify', label: 'A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.', correct: true, rationale: 'Correct. A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.' },{ id: 'lit-clear-route-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'lit-clear-route-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'lit-clear-route-decide', label: 'Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.', correct: true, rationale: 'Correct. Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.' },{ id: 'lit-clear-route-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'lit-clear-route-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'lit-clear-route-document', label: 'Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.', correct: true, rationale: 'Correct. Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.' },{ id: 'lit-clear-route-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The room is well lit and cords are secured, but a rolled rug remains near the route.', meaning: 'A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.', action: 'Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.', notify: 'Notify the RN the same visit if the route cannot be made safe, correction is refused, or the patient needs more assistance; report a near-fall promptly.', document: 'Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] },
{ id: 4, shortName: 'Post-Fall', title: 'Post-Fall Assessment & Reporting Protocol', subtitle: 'After a Fall', narration: ['When a fall is witnessed or reported, treat it as serious until a systematic assessment says otherwise. CL-SD-015 defines a fall as an unplanned descent to the floor (or extension of the floor) with or without injury. Near-falls also matter clinically and should be documented and communicated.','If you find the patient on the floor or witness a fall: do not move the patient until initial assessment allows. (1) ABCs—airway, breathing, circulation. (2) Level of consciousness and focused neuro check if head injury is possible. (3) Vital signs and systematic injury scan (pain, deformity, bleeding, inability to bear weight). (4) If alert and spinal injury is not suspected, assist to a safe position using proper body mechanics and available help. If potential serious injury (suspected fracture, head injury, loss of consciousness, significant bleeding): call 911 immediately and notify the Director of Nursing within 2 hours per CL-SD-015.','Notification and reporting (label clearly): Any clinician completes immediate clinical assessment. Notify the supervising/assigned RN promptly the same visit (do not wait until end of day if the patient is unstable—follow agency emergency escalation). Per CL-SD-015, the assigned RN notifies the physician within 24 hours of any fall regardless of apparent injury severity; completes incident/adverse-event reporting under the applicable agency incident policy within 24 hours; performs post-fall circumstance analysis; and updates the Fall Prevention Plan (typically within 48 hours). LVNs support by accurate first-hand documentation, timely RN notification, and participation in monitoring.'], keyPoints: [{ icon: '🚑', title: 'Emergency first', detail: 'Call 911 immediately for potential serious injury, loss of consciousness, breathing compromise, deformity, or major bleeding.' },{ icon: '🛑', title: 'Do not move prematurely', detail: 'Assess ABCs, consciousness, pain, bleeding, deformity, neuro status, and ability to bear weight first.' },{ icon: '📞', title: 'Exact notification', detail: 'Notify the RN promptly the same visit; notify the DON within 2 hours for potential serious injury per CL-SD-015.' },{ icon: '📝', title: 'Complete event record', detail: 'Record circumstances, assessment, actions, response, notifications/times, and applicable incident process.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' },{ kind: 'Applicable Agency Policy', text: 'Incident reporting (current policy controls)' }], sceneImage: img05, hotspots: [{ id: 'patient-on-floor', label: 'Patient on floor', shortLabel: 'Patient on floor', ariaLabel: 'Investigate Patient on floor', x: 52, y: 72, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-4-0', observe: 'The patient is on the floor after a fall and has not been moved.', identifyChoices: [{ id: 'patient-on-floor-identify', label: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', correct: true, rationale: 'Correct. A fall is serious until ABCs and a systematic injury screen establish the next safe step.' },{ id: 'patient-on-floor-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'patient-on-floor-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'patient-on-floor-decide', label: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', correct: true, rationale: 'Correct. Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.' },{ id: 'patient-on-floor-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'patient-on-floor-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'patient-on-floor-document', label: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', correct: true, rationale: 'Correct. Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.' },{ id: 'patient-on-floor-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The patient is on the floor after a fall and has not been moved.', meaning: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', action: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', notify: 'Emergency: call 911 immediately for breathing or circulation compromise, loss of consciousness, suspected head or spinal injury or fracture, major bleeding, severe pain, or other potential serious injury. Notify the RN promptly the same visit and DON within 2 hours for potential serious injury per CL-SD-015.', document: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', policyRefs: ['CL-SD-015','RM-PS-001','applicable agency incident policy'] } },{ id: 'overturned-walker', label: 'Overturned walker', shortLabel: 'Overturned walker', ariaLabel: 'Investigate Overturned walker', x: 17, y: 43, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-4-1', observe: 'An overturned walker is visible near the patient and may be part of the fall circumstances.', identifyChoices: [{ id: 'overturned-walker-identify', label: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', correct: true, rationale: 'Correct. A fall is serious until ABCs and a systematic injury screen establish the next safe step.' },{ id: 'overturned-walker-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'overturned-walker-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'overturned-walker-decide', label: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', correct: true, rationale: 'Correct. Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.' },{ id: 'overturned-walker-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'overturned-walker-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'overturned-walker-document', label: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', correct: true, rationale: 'Correct. Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.' },{ id: 'overturned-walker-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'An overturned walker is visible near the patient and may be part of the fall circumstances.', meaning: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', action: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', notify: 'Emergency: call 911 immediately for breathing or circulation compromise, loss of consciousness, suspected head or spinal injury or fracture, major bleeding, severe pain, or other potential serious injury. Notify the RN promptly the same visit and DON within 2 hours for potential serious injury per CL-SD-015.', document: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', policyRefs: ['CL-SD-015','RM-PS-001','applicable agency incident policy'] } },{ id: 'initial-assessment', label: 'Initial post-fall assessment', shortLabel: 'Initial post-fall assessment', ariaLabel: 'Investigate Initial post-fall assessment', x: 75, y: 62, zone: 'prohibited' as ZoneKind, leftAnchorId: 'kp-4-2', observe: 'The clinician remains at floor level to assess rather than immediately lifting the patient.', identifyChoices: [{ id: 'initial-assessment-identify', label: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', correct: true, rationale: 'Correct. A fall is serious until ABCs and a systematic injury screen establish the next safe step.' },{ id: 'initial-assessment-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'initial-assessment-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'initial-assessment-decide', label: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', correct: true, rationale: 'Correct. Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.' },{ id: 'initial-assessment-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'initial-assessment-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'initial-assessment-document', label: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', correct: true, rationale: 'Correct. Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.' },{ id: 'initial-assessment-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The clinician remains at floor level to assess rather than immediately lifting the patient.', meaning: 'A fall is serious until ABCs and a systematic injury screen establish the next safe step.', action: 'Stop routine care and do not lift the patient. Assess ABCs, consciousness, pain, bleeding, deformity, neuro status when head impact is possible, vital signs when safe, and ability to bear weight.', notify: 'Emergency: call 911 immediately for breathing or circulation compromise, loss of consciousness, suspected head or spinal injury or fracture, major bleeding, severe pain, or other potential serious injury. Notify the RN promptly the same visit and DON within 2 hours for potential serious injury per CL-SD-015.', document: 'Record fall date, time, location, witnessed or reported status, activity and mechanism, position found, ABCs, consciousness and neuro findings, pain and injury scan, vitals, movement decision, 911 time, RN and DON names, times, methods and instructions, transport and response, and applicable agency incident report.', policyRefs: ['CL-SD-015','RM-PS-001','applicable agency incident policy'] } }] },
{ id: 5, shortName: 'Documentation', title: 'Fall Prevention Documentation Standards', subtitle: 'Documentation', narration: ['Documentation supports clinical continuity, survey readiness, and legal defensibility. Surveyors look for fall risk assessment with a validated approach, a Fall Prevention Plan for at-risk patients, education, and complete fall reporting. Gaps between “patient fell” in a note and a missing incident report are a classic failure point (CL-SD-015).','Every skilled visit (no fall event): document screening answers (falls/near-falls; unsteadiness), mobility observations, environmental hazards identified and actions taken, Fall Prevention Plan interventions reinforced, education with teach-back/response, and any medication-related fall-risk observations. If risk is unchanged, say so with supporting findings—not a bare “WNL.”','After a fall event, documentation should include: date/time/location; witnessed vs. reported; activity and mechanism if known; injuries or “no apparent injury” with body areas assessed; vitals and neuro findings; notifications (who, time, response); 911 if used; devices in use or not; environmental factors; incident report completion; and plan for ongoing monitoring. The RN completes comprehensive post-fall analysis and POC updates—your note must give them accurate raw clinical data.'], keyPoints: [{ icon: '📝', title: 'Every visit', detail: 'Record falls/near-falls, gait, transfers, device use, hazards, teaching, and response.' },{ icon: '📊', title: 'Orthostatic series', detail: 'Record position, time, BP/pulse for each reading, symptoms, assistance, and tolerance.' },{ icon: '☎️', title: 'Notification trace', detail: 'Name recipient, date/time, method, report, instructions received, and action taken.' },{ icon: '🔁', title: 'Recurrence escalation', detail: 'Two or more falls in the episode require prompt RN/DON review under CL-SD-015.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' },{ kind: 'Applicable Agency Policy', text: 'Incident reporting (current policy controls)' }], sceneImage: img06, hotspots: [{ id: 'supine-reading', label: 'Supine baseline reading', shortLabel: 'Supine baseline reading', ariaLabel: 'Investigate Supine baseline reading', x: 17, y: 50, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-5-0', observe: 'The first BP and pulse reading is obtained after the patient rests supine per agency procedure.', identifyChoices: [{ id: 'supine-reading-identify', label: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', correct: true, rationale: 'Correct. Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.' },{ id: 'supine-reading-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'supine-reading-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'supine-reading-decide', label: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', correct: true, rationale: 'Correct. Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.' },{ id: 'supine-reading-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'supine-reading-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'supine-reading-document', label: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', correct: true, rationale: 'Correct. Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.' },{ id: 'supine-reading-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The first BP and pulse reading is obtained after the patient rests supine per agency procedure.', meaning: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', action: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', notify: 'Notify the RN promptly the same visit with every reading and symptom. Emergency escalation applies to syncope, injury, chest pain, severe dyspnea, focal neurologic signs, or persistent instability.', document: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'seated-reading', label: 'Seated transition reading', shortLabel: 'Seated transition reading', ariaLabel: 'Investigate Seated transition reading', x: 50, y: 50, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-1', observe: 'The second BP and pulse reading follows a supported move to sitting.', identifyChoices: [{ id: 'seated-reading-identify', label: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', correct: true, rationale: 'Correct. Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.' },{ id: 'seated-reading-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'seated-reading-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'seated-reading-decide', label: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', correct: true, rationale: 'Correct. Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.' },{ id: 'seated-reading-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'seated-reading-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'seated-reading-document', label: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', correct: true, rationale: 'Correct. Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.' },{ id: 'seated-reading-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The second BP and pulse reading follows a supported move to sitting.', meaning: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', action: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', notify: 'Notify the RN promptly the same visit with every reading and symptom. Emergency escalation applies to syncope, injury, chest pain, severe dyspnea, focal neurologic signs, or persistent instability.', document: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'standing-reading', label: 'Standing orthostatic reading', shortLabel: 'Standing orthostatic reading', ariaLabel: 'Investigate Standing orthostatic reading', x: 83, y: 50, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-5-2', observe: 'The final BP and pulse reading is taken while the patient stands with close guarding.', identifyChoices: [{ id: 'standing-reading-identify', label: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', correct: true, rationale: 'Correct. Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.' },{ id: 'standing-reading-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'standing-reading-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'standing-reading-decide', label: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', correct: true, rationale: 'Correct. Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.' },{ id: 'standing-reading-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'standing-reading-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'standing-reading-document', label: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', correct: true, rationale: 'Correct. Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.' },{ id: 'standing-reading-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The final BP and pulse reading is taken while the patient stands with close guarding.', meaning: 'Position-specific BP and pulse values and symptoms determine whether transition or ambulation is safe; a drop of at least 20 mmHg systolic or 10 mmHg diastolic is a common positive threshold.', action: 'Proceed through the agency position and timing procedure only while stable. Hold the next position or ambulation for symptoms or a positive or out-of-parameter result; return safely to sitting or supine and do not independently change medication or the POC.', notify: 'Notify the RN promptly the same visit with every reading and symptom. Emergency escalation applies to syncope, injury, chest pain, severe dyspnea, focal neurologic signs, or persistent instability.', document: 'Record each position and time, rest interval, BP and pulse, arm and cuff, calculated change, symptoms and onset, assistance, recovery, fall or near-fall, RN or emergency name, time, method and instructions, and response.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] },
{ id: 6, shortName: 'Practice', title: 'Module Completion — Fall Prevention Mastery', subtitle: 'Summary', narration: ['You have completed the instructional content for LVN-008: Fall Risk Assessment and Prevention. You should now be able to explain why every-visit screening matters, how validated tools like Morse fit under RN comprehensive assessment, how to separate intrinsic vs. extrinsic factors, how to implement four-pillar interventions under the POC, how to respond after a fall, and how to document for clinical and compliance needs.','Remember the scope boundary: LVNs observe, screen, educate, implement ordered interventions, and escalate. RNs complete comprehensive assessments and Fall Prevention Plans; physicians adjust orders; PT/OT own specialized balance and home-modification evaluation when involved; pharmacists support complex medication review when consulted. Crossing scope (changing the POC, coding OASIS, diagnosing) is not “being thorough”—it is out of role.','Knowledge check next: score 80% or higher (8/10) to pass the quiz. Passing validates knowledge only. Practical competency—if required for your onboarding track—depends on case study, skills demonstration, observed practice, and authorized sign-off under current agency policy. It is separate from this quiz.'], keyPoints: [{ icon: '👀', title: 'Observe the whole route', detail: 'Check lighting, cords, rugs, thresholds, footwear, and device placement before practice.' },{ icon: '🟢', title: 'Proceed only when safe', detail: 'Use the prescribed device and ordered assistance after hazards are controlled.' },{ icon: '🟠', title: 'Hold or stop when unsafe', detail: 'Hold for correctable hazards; stop and notify for instability, symptoms, or equipment failure.' },{ icon: '🎓', title: 'Knowledge is not sign-off', detail: 'An 80% quiz pass verifies knowledge only; observed competency and sign-off remain separate.' }], clinicalTip: 'Notify the supervising RN when findings are unexpected.', sourceLabels: [{ kind: 'Agency Policy', text: 'CL-SD-015' },{ kind: 'Agency Policy', text: 'RM-PS-001' }], sceneImage: img07, hotspots: [{ id: 'clear-practice-path', label: 'Clear marked route', shortLabel: 'Clear marked route', ariaLabel: 'Investigate Clear marked route', x: 27, y: 68, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-0', observe: 'The planned walking route is marked and inspected before supervised practice.', identifyChoices: [{ id: 'clear-practice-path-identify', label: 'A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.', correct: true, rationale: 'Correct. A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.' },{ id: 'clear-practice-path-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'clear-practice-path-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'clear-practice-path-decide', label: 'Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.', correct: true, rationale: 'Correct. Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.' },{ id: 'clear-practice-path-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'clear-practice-path-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'clear-practice-path-document', label: 'Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.', correct: true, rationale: 'Correct. Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.' },{ id: 'clear-practice-path-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The planned walking route is marked and inspected before supervised practice.', meaning: 'A safe route requires adequate lighting and control of every cord, rug, clutter item, threshold, and resting point.', action: 'Proceed only after the full route is verified clear and ordered assistance is available. Hold practice for any unresolved hazard; stop for instability or near-fall.', notify: 'Notify the RN the same visit if the route cannot be made safe, correction is refused, or the patient needs more assistance; report a near-fall promptly.', document: 'Record route and hazards checked, corrections, lighting, assistance, education and teach-back, response, near-fall, RN name and time, and direction.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'walker-practice', label: 'Supervised walker practice', shortLabel: 'Supervised walker practice', ariaLabel: 'Investigate Supervised walker practice', x: 48, y: 63, zone: 'authorized' as ZoneKind, leftAnchorId: 'kp-6-1', observe: 'The patient practices with the walker while the LVN guards at the ordered assistance level.', identifyChoices: [{ id: 'walker-practice-identify', label: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', correct: true, rationale: 'Correct. Device placement, condition, fit, technique, gait, and assistance level must be assessed together.' },{ id: 'walker-practice-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'walker-practice-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'walker-practice-decide', label: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', correct: true, rationale: 'Correct. Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.' },{ id: 'walker-practice-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'walker-practice-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'walker-practice-document', label: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.' },{ id: 'walker-practice-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'The patient practices with the walker while the LVN guards at the ordered assistance level.', meaning: 'Device placement, condition, fit, technique, gait, and assistance level must be assessed together.', action: 'Proceed only with the prescribed intact device and ordered assistance. Hold for repositioning or technique correction; stop for damage, new instability, or inability to use it safely.', notify: 'Notify the RN promptly the same visit for damage, poor fit, unsafe technique, increased assistance, gait decline, or near-fall.', document: 'Record device type, condition, fit and placement, surface and distance, gait or transfer findings, assistance and cues, response, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } },{ id: 'door-threshold', label: 'Doorway threshold', shortLabel: 'Doorway threshold', ariaLabel: 'Investigate Doorway threshold', x: 82, y: 75, zone: 'conditional' as ZoneKind, leftAnchorId: 'kp-6-2', observe: 'A flooring transition and threshold lie across the marked practice route.', identifyChoices: [{ id: 'door-threshold-identify', label: 'A doorway threshold requires adequate clearance, lighting, device technique, and balance even when the rest of the route is clear.', correct: true, rationale: 'Correct. A doorway threshold requires adequate clearance, lighting, device technique, and balance even when the rest of the route is clear.' },{ id: 'door-threshold-dismiss', label: 'This visible object or finding does not affect fall risk.', correct: false, rationale: 'Incorrect. The patient-specific object or finding requires evaluation.' },{ id: 'door-threshold-diagnose', label: 'The LVN should independently diagnose the cause and rewrite the plan.', correct: false, rationale: 'Incorrect. The LVN observes, implements ordered care, and escalates; the RN manages reassessment and plan updates.' }], decideChoices: [{ id: 'door-threshold-decide', label: 'Hold at the threshold until technique and ordered assistance are confirmed. Proceed only if cleared safely; stop after toe catch, loss of balance, or near-fall.', correct: true, rationale: 'Correct. Hold at the threshold until technique and ordered assistance are confirmed. Proceed only if cleared safely; stop after toe catch, loss of balance, or near-fall.' },{ id: 'door-threshold-wait', label: 'Wait for a fall before acting.', correct: false, rationale: 'Incorrect. Prevention requires action before an event.' },{ id: 'door-threshold-independent', label: 'Change medication, equipment orders, or the POC independently.', correct: false, rationale: 'Incorrect. Independent order or POC changes exceed LVN scope.' }], documentChoices: [{ id: 'door-threshold-document', label: 'Record threshold location and height if measured, lighting, device technique, assistance and cues, attempt and response, near-fall, alternate route, RN name and time, and instructions.', correct: true, rationale: 'Correct. Record threshold location and height if measured, lighting, device technique, assistance and cues, attempt and response, near-fall, alternate route, RN name and time, and instructions.' },{ id: 'door-threshold-generic', label: 'Chart only “fall precautions reinforced” or “no injury.”', correct: false, rationale: 'Incorrect. Generic wording omits the object, assessment, action, response, and notification trace.' }], feedback: { observed: 'A flooring transition and threshold lie across the marked practice route.', meaning: 'A doorway threshold requires adequate clearance, lighting, device technique, and balance even when the rest of the route is clear.', action: 'Hold at the threshold until technique and ordered assistance are confirmed. Proceed only if cleared safely; stop after toe catch, loss of balance, or near-fall.', notify: 'Notify the RN promptly for inability to negotiate the required threshold, near-fall, or need for greater assistance; route therapy and equipment needs through the POC.', document: 'Record threshold location and height if measured, lighting, device technique, assistance and cues, attempt and response, near-fall, alternate route, RN name and time, and instructions.', policyRefs: ['CL-SD-015','RM-PS-001'] } }] }
];

const QUIZ: QuizQuestion[] = [
{ id: 17, stem: 'Which statement best describes the LVN’s primary role in fall prevention under CL-SD-015?', options: ['Screen every visit, observe mobility/environment, implement POC interventions, and escalate changes to the RN','Independently complete OASIS fall items and rewrite the Fall Prevention Plan','Diagnose the cause of each fall and prescribe medication changes','Only document falls if the patient is injured'], correct: 0, rationale: 'CL-SD-015 assigns every-visit screening and observation to all disciplines. Comprehensive assessment and Fall Prevention Plan updates are RN responsibilities; LVNs implement under the POC and escalate.' },
{ id: 94, stem: 'Using common Morse Fall Scale bands (confirm on the agency form), a total score of 50 is classified as:', options: ['Low risk (0–24)','High risk (≥45)','Moderate risk (25–44)','No risk — score invalid'], correct: 1, rationale: 'Common Morse interpretation: 0–24 low, 25–44 moderate, ≥45 high. Score 50 is high risk and should drive intensified interventions under the POC.' },
{ id: 67, stem: 'On the Morse Fall Scale, the Mental Status item primarily assesses:', options: ['Whether the patient overestimates ability or forgets mobility limitations','Orientation to person, place, and time only','Mini-Mental State Examination total score','Reading literacy and health literacy grade level'], correct: 0, rationale: 'Mental Status on Morse is insight into one’s own limitations—not orientation ×4 or a full cognitive battery.' },
{ id: 69, stem: 'When orthostatic blood pressure is screened per protocol, which finding is commonly treated as a positive orthostatic screen?', options: ['Any dizziness without blood pressure change','Systolic rise of 10 mmHg on standing','Systolic drop of ≥20 mmHg (or diastolic drop ≥10 mmHg) from lying to standing','Heart rate under 60 beats per minute only'], correct: 2, rationale: 'A common clinical threshold is ≥20 mmHg systolic or ≥10 mmHg diastolic drop from lying to standing, plus symptoms—follow agency measurement procedure.' },
{ id: 3, stem: 'Which medication is least likely to be considered a high fall-risk (FRID) class agent in routine fall review?', options: ['Lorazepam (benzodiazepine)','Acetaminophen','Oxycodone (opioid)','Amlodipine (antihypertensive)'], correct: 1, rationale: 'Acetaminophen is not a classic FRID. Benzodiazepines, opioids, and antihypertensives are commonly reviewed for fall risk contribution.' },
{ id: 74, stem: 'You witness a patient fall in the home. What is your FIRST action?', options: ['Assess ABCs without moving the patient until the initial assessment allows','Immediately help the patient stand to avoid embarrassment','Leave the room to call the office before any assessment','Complete the incident report before touching the patient'], correct: 0, rationale: 'Safety first: airway/breathing/circulation and injury screen before moving. Calling for help and reporting follow after immediate clinical assessment—or in parallel if another person can call.' },
{ id: 20, stem: 'Per CL-SD-015, after any patient fall the assigned RN must notify the physician within:', options: ['7 days','24 hours','Only if there is a fracture','30 days for QAPI only'], correct: 1, rationale: 'CL-SD-015 requires physician notification within 24 hours of any fall, regardless of apparent injury severity. LVNs notify the RN promptly so that pathway can run.' },
{ id: 86, stem: 'A patient on rivaroxaban (Xarelto) hits their head during a fall but says they “feel fine.” Best LVN action?', options: ['Document “no injury” and continue the routine visit only','Advise the patient to take aspirin and rest','Minimize concern because anticoagulants reduce clot risk only','Treat as high concern: urgent clinical escalation (RN/physician/911 as indicated)—do not minimize head impact on anticoagulation'], correct: 3, rationale: 'Head impact on anticoagulation can produce delayed intracranial bleeding. Escalate urgently per clinical severity and agency emergency procedures; do not minimize because the patient currently “feels fine.”' },
{ id: 34, stem: 'Per CL-SD-015, two or more falls during the home health episode should trigger:', options: ['Automatic discharge from home health','No action if injuries were minor','Director of Nursing case-level fall prevention review (with RN/QAPI pathway)','LVN independent rewrite of all physician orders'], correct: 2, rationale: 'CL-SD-015 escalates two or more falls during the episode to DON review of plan adequacy, medications, environment, and therapy involvement.' },
{ id: 80, stem: 'Which education point best targets orthostatic-related falls?', options: ['Wear socks only on hardwood floors for better “grip”','Move as quickly as possible to avoid fatigue','Keep all lights off at night so the patient sleeps longer','Sit on the edge of the bed for about 30 seconds before standing, then stand briefly before walking'], correct: 3, rationale: 'Paced position changes reduce orthostatic symptoms and are a high-yield, teachable prevention behavior at every visit.' }
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


const STORAGE_KEY = 'lvn-008-progress-v5500';

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

export default function LVN008() {
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
          <span className="brand-text">LVN-008 — Fall Risk</span>
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
