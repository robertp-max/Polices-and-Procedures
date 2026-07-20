/**
 * RN-009 — Chronic Disease Management
 * Canonical RN Pass 5 remediation from controlled architecture and policies.
 * Gold interaction shell: LVN-001 Pass 5 corrected.
 * Knowledge completion is separate from appointment, delegation, observed competency, legal sign-off, and independent-practice authorization.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/rn-009/rn-009-lesson-01.png';
import img02 from './assets/rn-009/rn-009-lesson-02.png';
import img03 from './assets/rn-009/rn-009-lesson-03.png';
import img04 from './assets/rn-009/rn-009-lesson-04.png';
import img05 from './assets/rn-009/rn-009-lesson-05.png';
import img06 from './assets/rn-009/rn-009-lesson-06.png';
import img07 from './assets/rn-009/rn-009-lesson-07.png';

const CI = {
  teal: '#0F5B54', tealSoft: '#EEF4F3', tealMuted: '#C8DFDC',
  orange: '#B94718', orangeDark: '#A94018', ink: '#2D3748',
  muted: '#64748B', slate: '#64748B', border: '#E2E8F0', red: '#B91C1C',
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

const MODULE_META = { id: "RN-009", title: "Chronic Disease Management", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Establish condition-specific baseline and goals, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Cardiac assessment and heart-failure zones, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Diabetes monitoring and hypo/hyperglycemia safety, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Respiratory assessment, oxygen, and symptom zones, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Medication, nutrition, activity, and adherence barriers, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Change-in-condition escalation and avoidable hospitalization prevention, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Trend documentation and interdisciplinary plan updates, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Establi",
    title: "Establish condition-specific baseline and goals",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for establish condition-specific baseline and goals within Chronic Disease Management. Use the current controlled requirements in CL-SD-019, CL-SD-020, CL-SD-018, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-019, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary cardiac diagnosis shall receive a comprehensive cardiac assessment at SOC including: (a) cardiac history — prior MI, CHF classification (NYHA Class I–IV), surgeries, catheterizations, device implants (pacemaker, ICD, LVAD); (b) current symptoms — dyspnea (at rest and with exertion), orthopnea, paroxysmal nocturnal dyspnea, edema, fatigue, chest pain, palpitations, dizziness, syncope; (c) baseline vital signs including orthostatic blood pressure; (d) baseline weight (obtained on the same scale, at the same time of day, in the same clothing — establish the \"dry weight\" with physician input); (e) cardiac auscultation — heart sounds, presence of murmurs, gallops (S3, S4); (f) lung auscultation — presence of crackles, wheezing, diminished breath sounds; (g) peripheral.",
      "Controlled-policy focus — CL-SD-020, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary respiratory diagnosis shall receive a comprehensive respiratory assessment at SOC, as defined in Section 6.1, incorporating all elements necessary to establish a clinical baseline, develop an individualized respiratory management plan, and accurately complete all applicable OASIS data elements. 4.2 A respiratory management plan shall be developed as part of the physician-approved plan of care for every patient with a respiratory diagnosis, specifying: physician-ordered oxygen therapy parameters (flow rate, delivery device, hours per day); medication regimen (bronchodilators, corticosteroids, antibiotics, mucolytics); breathing exercise program; activity tolerance and energy conservation plan; patient and caregiver education goals; exacerbation recognition and response protocols; and defined parameters for physician notification and emergency response. 4.3 At.",
      "Controlled-policy focus — CL-SD-020, Ongoing Respiratory Assessment and Monitoring at Each Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; At each respiratory patient visit, assess and document all of the following with clinical analysis — not merely data recording: (a) dyspnea rating using the mMRC scale — compare to baseline and prior visit; (b) current respiratory rate — compare to baseline; (c) SpO2 — obtain on room air if the patient is not continuously oxygen-dependent, or on oxygen at the prescribed flow rate; document the measurement conditions (which liter flow, which device, at rest vs. after exertion); (d) lung auscultation — all fields, document location and character of any abnormality; (e) accessory muscle use assessment.",
      "Controlled-policy focus — CL-SD-020, Respiratory Exacerbation Management. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN / LVN ; At each visit, assess whether the patient is experiencing an acute respiratory exacerbation by evaluating: increased dyspnea beyond baseline; change in sputum color from clear/white to yellow, green, or brown; increased sputum volume; increased cough frequency; new fever; decreased activity tolerance compared to recent baseline; SpO2 below the patient's physician-defined threshold. ; At each visit. ; ; 6.4.2 ; Assigned RN / LVN ; Classify the exacerbation severity using the GOLD/COPD exacerbation classification or equivalent: (a) Mild — manages with increased use of short-acting bronchodilators only, no change in baseline therapy required; (b) Moderate — requires.",
      "Controlled-policy focus — CL-SD-018, 4\\. Policy Statement. 4.1 All patients with a diagnosis of diabetes mellitus shall receive a comprehensive diabetic assessment at SOC, including: (a) diabetes type (Type 1, Type 2, gestational, other); (b) current diabetic medication regimen (insulin, oral agents, injectables) with verification of actual adherence per CL-SD-012; (c) blood glucose monitoring frequency and recent values; (d) HbA1c level (most recent; physician order for new HbA1c if not available within past 3 months); (e) hypoglycemia and hyperglycemia history; (f) diabetic complications screening — retinopathy, nephropathy, neuropathy, peripheral vascular disease, foot ulcers; (g) dietary assessment — current dietary habits, carbohydrate management, nutritional status; (h) foot assessment — skin integrity, sensation (monofilament testing if available), pulses, deformity, ulceration, callus, toenail condition; (i) patient's and caregiver's.",
      "Apply the controlled requirements to the three visible objects in the scene for establish condition-specific baseline and goals. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Bathroom Scale With Display", detail: "Review the bathroom scale with display for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the symptom notebook closed and, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Symptom Notebook Closed And", detail: "Review the symptom notebook closed and for the patient-specific finding. Reconcile it with the bathroom scale with display, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "bathroom-scale-with-display-1-1", label: "bathroom scale with display", shortLabel: "bathroom scale with display", ariaLabel: "Investigate bathroom scale with display",        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the bathroom scale with display as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale with display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the bathroom scale with display as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale with display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the bathroom scale with display as the complete assessment and do not compare the blood-pressure cuff, patient report, or current record. This identify option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for establish condition-specific baseline and goals." },
          { id: "i3", label: "Carry forward the prior visit conclusion for establish condition-specific baseline and goals without reassessing the patient today. This identify option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about bathroom scale with display." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale with display; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale with display; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the bathroom scale with display alone and seek clarification only after the intervention is complete. This decide option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for bathroom scale with display is resolved." },
          { id: "d3", label: "Defer the concern in the bathroom scale with display to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during establish condition-specific baseline and goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For bathroom scale with display, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For bathroom scale with display, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the bathroom scale with display was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bathroom scale with display." },
          { id: "doc3", label: "Keep the bathroom scale with display decision in personal notes rather than the governed patient record. This document option concerns bathroom scale with display during establish condition-specific baseline and goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for establish condition-specific baseline and goals." },
        ],
        feedback: {
          observed: "Observe the bathroom scale with display as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the bathroom scale with display as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale with display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale with display; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For bathroom scale with display, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "blood-pressure-cuff-1-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 34, y: 60, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the symptom notebook closed and, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with symptom notebook closed and and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the symptom notebook closed and, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with symptom notebook closed and and the controlling source before classifying status." },
          { id: "i2", label: "Assume the blood-pressure cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for establish condition-specific baseline and goals." },
          { id: "i3", label: "Dismiss the conflict between the blood-pressure cuff and symptom notebook closed and because one source appears more convenient. This identify option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the blood-pressure cuff without confirming an applicable order and patient-specific authority. This decide option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Hand the blood-pressure cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during establish condition-specific baseline and goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the blood-pressure cuff before reassessment confirms the patient response. This document option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Copy the prior establish condition-specific baseline and goals narrative even though today’s blood-pressure cuff evidence is different. This document option concerns blood-pressure cuff during establish condition-specific baseline and goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for establish condition-specific baseline and goals." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the symptom notebook closed and, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the symptom notebook closed and, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with symptom notebook closed and and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "symptom-notebook-closed-and-1-3", label: "symptom notebook closed and", shortLabel: "symptom notebook closed and", ariaLabel: "Investigate symptom notebook closed and",        x: 78, y: 48, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the symptom notebook closed and as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the bathroom scale with display, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook closed and, compare the visible evidence with bathroom scale with display and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the symptom notebook closed and as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the bathroom scale with display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook closed and, compare the visible evidence with bathroom scale with display and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the symptom notebook closed and and omit the related change, symptom, or safety cue. This identify option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for establish condition-specific baseline and goals." },
          { id: "i3", label: "Let a blank, unreadable, or unverified symptom notebook closed and stand in for direct RN assessment. This identify option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about symptom notebook closed and." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook closed and; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook closed and; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the symptom notebook closed and issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for symptom notebook closed and is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for establish condition-specific baseline and goals instead of the current controlled clinical pathway. This decide option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during establish condition-specific baseline and goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For symptom notebook closed and, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For symptom notebook closed and, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the symptom notebook closed and and omit the discrepancy with bathroom scale with display. This document option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of symptom notebook closed and." },
          { id: "doc3", label: "Combine the symptom notebook closed and issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns symptom notebook closed and during establish condition-specific baseline and goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for establish condition-specific baseline and goals." },
        ],
        feedback: {
          observed: "Observe the symptom notebook closed and as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the bathroom scale with display, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the symptom notebook closed and as patient-specific evidence for establish condition-specific baseline and goals. Compare it with the bathroom scale with display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for establish condition-specific baseline and goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook closed and, compare the visible evidence with bathroom scale with display and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook closed and; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for establish condition-specific baseline and goals. For symptom notebook closed and, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Cardiac",
    title: "Cardiac assessment and heart-failure zones",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for cardiac assessment and heart-failure zones within Chronic Disease Management. Use the current controlled requirements in CL-SD-019, CL-SD-015, CL-SD-020, CL-SD-014, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-019, Cardiac Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, complete a comprehensive cardiac assessment per Section 4.1. Document all findings using the Cardiac Assessment Template (Appendix A). ; At the SOC visit. ; ; 6.1.2 ; Assigned RN ; Establish the patient's baseline (\"dry\") weight in collaboration with the physician. If the patient does not have a reliable scale, coordinate provision of a scale through the agency's equipment process per OP-SL-004. ; At the SOC visit; scale provision within 48 hours if needed. ; ; 6.1.3 ; Assigned RN ; Review the patient's complete cardiac medication regimen with the patient and caregiver. Identify.",
      "Controlled-policy focus — CL-SD-015, Comprehensive Fall Risk Assessment. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; At SOC and at each OASIS time point, conduct a comprehensive fall risk assessment including: (a) history of falls in the past 12 months (number, circumstances, injuries); (b) current medications — review for fall-risk-increasing drugs (FRIDs): sedatives/hypnotics, opioids, antihypertensives, diuretics, antidepressants, anticonvulsants, antipsychotics, polypharmacy ≥5 medications; (c) gait and balance assessment using a validated tool (Timed Up and Go ≥12 seconds = increased risk; or Morse Fall Scale); (d) lower extremity strength assessment; (e) vision assessment — last eye exam, current visual acuity, corrective lens use; (f) cognitive status — impaired judgment, wandering risk per RM-PS-004; (g) orthostatic.",
      "Controlled-policy focus — CL-SD-020, Comprehensive Respiratory Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Review all available referral documentation before the SOC visit including: hospital discharge summary (if applicable), pulmonologist or PCP notes, most recent pulmonary function test results, home oxygen prescription, current respiratory medication list, and any recent emergency department visits for respiratory complaints. ; Before the SOC visit. ; ; 6.1.2 ; Assigned RN ; At the SOC visit, conduct a comprehensive respiratory assessment documenting all of the following: (a) respiratory diagnosis history — COPD (GOLD classification if known), asthma (severity classification), diagnosis dates, prior hospitalizations and ICU admissions for respiratory causes in the past 12 months; (b) current symptoms.",
      "Controlled-policy focus — CL-SD-014, Comprehensive Pain Assessment at SOC and OASIS Time Points. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; At SOC and at each OASIS assessment time point, conduct a comprehensive pain assessment per Section 4.2. Document all elements in the clinical record using the Pain Assessment Documentation Template (Appendix A). ; At SOC and each OASIS time point. ; ; 6.2.2 ; Assigned RN ; Develop a pain management plan as part of the plan of care, including: (a) the patient's stated pain management goal (e.g., \"pain at 4/10 or below with activity\"); (b) scheduled and PRN pharmacologic interventions ordered by the physician; (c) non-pharmacologic interventions appropriate to the patient's condition; (d) patient education on pain.",
      "Controlled-policy focus — CL-SD-019, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary cardiac diagnosis shall receive a comprehensive cardiac assessment at SOC including: (a) cardiac history — prior MI, CHF classification (NYHA Class I–IV), surgeries, catheterizations, device implants (pacemaker, ICD, LVAD); (b) current symptoms — dyspnea (at rest and with exertion), orthopnea, paroxysmal nocturnal dyspnea, edema, fatigue, chest pain, palpitations, dizziness, syncope; (c) baseline vital signs including orthostatic blood pressure; (d) baseline weight (obtained on the same scale, at the same time of day, in the same clothing — establish the \"dry weight\" with physician input); (e) cardiac auscultation — heart sounds, presence of murmurs, gallops (S3, S4); (f) lung auscultation — presence of crackles, wheezing, diminished breath sounds; (g) peripheral.",
      "Apply the controlled requirements to the three visible objects in the scene for cardiac assessment and heart-failure zones. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Glucometer", detail: "Review the glucometer for the patient-specific finding. Reconcile it with the trend notebook, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Trend Notebook", detail: "Review the trend notebook for the patient-specific finding. Reconcile it with the medication organizer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Medication Organizer", detail: "Review the medication organizer for the patient-specific finding. Reconcile it with the glucometer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "glucometer-2-1", label: "glucometer", shortLabel: "glucometer", ariaLabel: "Investigate glucometer",        x: 20, y: 72, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the glucometer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the trend notebook, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glucometer, compare the visible evidence with trend notebook and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the glucometer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the trend notebook, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glucometer, compare the visible evidence with trend notebook and the controlling source before classifying status." },
          { id: "i2", label: "Assume the glucometer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cardiac assessment and heart-failure zones." },
          { id: "i3", label: "Dismiss the conflict between the glucometer and trend notebook because one source appears more convenient. This identify option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about glucometer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glucometer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glucometer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the glucometer without confirming an applicable order and patient-specific authority. This decide option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for glucometer is resolved." },
          { id: "d3", label: "Hand the glucometer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cardiac assessment and heart-failure zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For glucometer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For glucometer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the glucometer before reassessment confirms the patient response. This document option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of glucometer." },
          { id: "doc3", label: "Copy the prior cardiac assessment and heart-failure zones narrative even though today’s glucometer evidence is different. This document option concerns glucometer during cardiac assessment and heart-failure zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cardiac assessment and heart-failure zones." },
        ],
        feedback: {
          observed: "Observe the glucometer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the trend notebook, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the glucometer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the trend notebook, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glucometer, compare the visible evidence with trend notebook and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glucometer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For glucometer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "trend-notebook-2-2", label: "trend notebook", shortLabel: "trend notebook", ariaLabel: "Investigate trend notebook",        x: 35, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the trend notebook as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend notebook, compare the visible evidence with medication organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the trend notebook as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend notebook, compare the visible evidence with medication organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the trend notebook and omit the related change, symptom, or safety cue. This identify option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cardiac assessment and heart-failure zones." },
          { id: "i3", label: "Let a blank, unreadable, or unverified trend notebook stand in for direct RN assessment. This identify option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about trend notebook." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend notebook; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend notebook; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the trend notebook issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for trend notebook is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for cardiac assessment and heart-failure zones instead of the current controlled clinical pathway. This decide option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cardiac assessment and heart-failure zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For trend notebook, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For trend notebook, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the trend notebook and omit the discrepancy with medication organizer. This document option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of trend notebook." },
          { id: "doc3", label: "Combine the trend notebook issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns trend notebook during cardiac assessment and heart-failure zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cardiac assessment and heart-failure zones." },
        ],
        feedback: {
          observed: "Observe the trend notebook as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the trend notebook as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend notebook, compare the visible evidence with medication organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend notebook; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For trend notebook, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "medication-organizer-2-3", label: "medication organizer", shortLabel: "medication organizer", ariaLabel: "Investigate medication organizer",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the medication organizer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the glucometer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with glucometer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication organizer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the glucometer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with glucometer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the medication organizer as the complete assessment and do not compare the glucometer, patient report, or current record. This identify option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cardiac assessment and heart-failure zones." },
          { id: "i3", label: "Carry forward the prior visit conclusion for cardiac assessment and heart-failure zones without reassessing the patient today. This identify option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the medication organizer alone and seek clarification only after the intervention is complete. This decide option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication organizer is resolved." },
          { id: "d3", label: "Defer the concern in the medication organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cardiac assessment and heart-failure zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For medication organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For medication organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the medication organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication organizer." },
          { id: "doc3", label: "Keep the medication organizer decision in personal notes rather than the governed patient record. This document option concerns medication organizer during cardiac assessment and heart-failure zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cardiac assessment and heart-failure zones." },
        ],
        feedback: {
          observed: "Observe the medication organizer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the glucometer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication organizer as patient-specific evidence for cardiac assessment and heart-failure zones. Compare it with the glucometer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cardiac assessment and heart-failure zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with glucometer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cardiac assessment and heart-failure zones. For medication organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Diabete",
    title: "Diabetes monitoring and hypo/hyperglycemia safety",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for diabetes monitoring and hypo/hyperglycemia safety within Chronic Disease Management. Use the current controlled requirements in CL-SD-018, CL-SD-019, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-018, Ongoing Diabetic Monitoring at Each Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Assess blood glucose per the physician-ordered monitoring schedule. Document the value, the time of assessment, and the relationship to the patient's last meal (fasting, pre-meal, post-meal). ; At each visit per orders. ; ; 6.2.2 ; Assigned RN / LVN ; Review the patient's blood glucose log (home monitoring values since the last visit). Identify patterns: (a) consistent hyperglycemia suggesting medication adjustment needed; (b) hypoglycemic episodes suggesting over-medication or dietary issues; (c) wide glucose variability suggesting monitoring or medication management concerns. Document the review and any patterns identified. ; At each visit. ; ; 6.2.3.",
      "Controlled-policy focus — CL-SD-018, 4\\. Policy Statement. 4.1 All patients with a diagnosis of diabetes mellitus shall receive a comprehensive diabetic assessment at SOC, including: (a) diabetes type (Type 1, Type 2, gestational, other); (b) current diabetic medication regimen (insulin, oral agents, injectables) with verification of actual adherence per CL-SD-012; (c) blood glucose monitoring frequency and recent values; (d) HbA1c level (most recent; physician order for new HbA1c if not available within past 3 months); (e) hypoglycemia and hyperglycemia history; (f) diabetic complications screening — retinopathy, nephropathy, neuropathy, peripheral vascular disease, foot ulcers; (g) dietary assessment — current dietary habits, carbohydrate management, nutritional status; (h) foot assessment — skin integrity, sensation (monofilament testing if available), pulses, deformity, ulceration, callus, toenail condition; (i) patient's and caregiver's.",
      "Controlled-policy focus — CL-SD-018, 2\\. Purpose. This policy establishes the assessment, education, monitoring, and documentation standards for the management of patients with diabetes mellitus at Care Indeed Home Health Care, Inc. Diabetes is one of the most prevalent diagnoses in the home health population, affecting approximately 30% of all Medicare home health beneficiaries. Effective diabetic management in the home requires coordinated monitoring of blood glucose, medication management (including insulin administration and oral hypoglycemic agents), dietary education, foot care, complication screening, and self-management training — all of which are skilled services that directly impact patient outcomes, hospitalization rates, and quality measure performance. Poor glycemic management in home health is associated with increased emergency department visits, hospital readmissions, diabetic wound complications, and patient morbidity. This policy.",
      "Controlled-policy focus — CL-SD-018, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Diabetic management as part of the plan of care ; ; 42 CFR § 484.75 ; Condition of Participation: Skilled Professional Services ; Diabetic management as a skilled nursing service ; 9.2 Clinical Practice Standards ; Document ; Relevance ; ; ; ; ; American Diabetes Association (ADA) — Standards of Care in Diabetes (current year) ; Evidence-based diabetes management guidelines ; ; ADA — Diabetes Self-Management Education and Support (DSMES) Standards ; Patient education standards for diabetes ; ; CMS Home Health Benefit Manual, Chapter 7.",
      "Controlled-policy focus — CL-SD-019, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary cardiac diagnosis shall receive a comprehensive cardiac assessment at SOC including: (a) cardiac history — prior MI, CHF classification (NYHA Class I–IV), surgeries, catheterizations, device implants (pacemaker, ICD, LVAD); (b) current symptoms — dyspnea (at rest and with exertion), orthopnea, paroxysmal nocturnal dyspnea, edema, fatigue, chest pain, palpitations, dizziness, syncope; (c) baseline vital signs including orthostatic blood pressure; (d) baseline weight (obtained on the same scale, at the same time of day, in the same clothing — establish the \"dry weight\" with physician input); (e) cardiac auscultation — heart sounds, presence of murmurs, gallops (S3, S4); (f) lung auscultation — presence of crackles, wheezing, diminished breath sounds; (g) peripheral.",
      "Apply the controlled requirements to the three visible objects in the scene for diabetes monitoring and hypo/hyperglycemia safety. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Bathroom Scale Display", detail: "Review the bathroom scale display for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the compression socks folded, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Compression Socks Folded", detail: "Review the compression socks folded for the patient-specific finding. Reconcile it with the bathroom scale display, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "bathroom-scale-display-3-1", label: "bathroom scale display", shortLabel: "bathroom scale display", ariaLabel: "Investigate bathroom scale display",        x: 14, y: 43, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the bathroom scale display as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the bathroom scale display as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the bathroom scale display and omit the related change, symptom, or safety cue. This identify option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for diabetes monitoring and hypo/hyperglycemia safety." },
          { id: "i3", label: "Let a blank, unreadable, or unverified bathroom scale display stand in for direct RN assessment. This identify option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about bathroom scale display." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale display; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale display; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the bathroom scale display issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for bathroom scale display is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for diabetes monitoring and hypo/hyperglycemia safety instead of the current controlled clinical pathway. This decide option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For bathroom scale display, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For bathroom scale display, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the bathroom scale display and omit the discrepancy with blood-pressure cuff. This document option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of bathroom scale display." },
          { id: "doc3", label: "Combine the bathroom scale display issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns bathroom scale display during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        feedback: {
          observed: "Observe the bathroom scale display as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the bathroom scale display as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For bathroom scale display, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to bathroom scale display; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For bathroom scale display, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "blood-pressure-cuff-3-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 41, y: 38, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the compression socks folded, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with compression socks folded and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the compression socks folded, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with compression socks folded and the controlling source before classifying status." },
          { id: "i2", label: "Treat the blood-pressure cuff as the complete assessment and do not compare the compression socks folded, patient report, or current record. This identify option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for diabetes monitoring and hypo/hyperglycemia safety." },
          { id: "i3", label: "Carry forward the prior visit conclusion for diabetes monitoring and hypo/hyperglycemia safety without reassessing the patient today. This identify option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the blood-pressure cuff alone and seek clarification only after the intervention is complete. This decide option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Defer the concern in the blood-pressure cuff to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the blood-pressure cuff was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Keep the blood-pressure cuff decision in personal notes rather than the governed patient record. This document option concerns blood-pressure cuff during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the compression socks folded, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the compression socks folded, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with compression socks folded and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "compression-socks-folded-3-3", label: "compression socks folded", shortLabel: "compression socks folded", ariaLabel: "Investigate compression socks folded",        x: 77, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the compression socks folded as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the bathroom scale display, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compression socks folded, compare the visible evidence with bathroom scale display and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the compression socks folded as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the bathroom scale display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compression socks folded, compare the visible evidence with bathroom scale display and the controlling source before classifying status." },
          { id: "i2", label: "Assume the compression socks folded establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for diabetes monitoring and hypo/hyperglycemia safety." },
          { id: "i3", label: "Dismiss the conflict between the compression socks folded and bathroom scale display because one source appears more convenient. This identify option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about compression socks folded." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compression socks folded; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compression socks folded; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the compression socks folded without confirming an applicable order and patient-specific authority. This decide option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for compression socks folded is resolved." },
          { id: "d3", label: "Hand the compression socks folded concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For compression socks folded, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For compression socks folded, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the compression socks folded before reassessment confirms the patient response. This document option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compression socks folded." },
          { id: "doc3", label: "Copy the prior diabetes monitoring and hypo/hyperglycemia safety narrative even though today’s compression socks folded evidence is different. This document option concerns compression socks folded during diabetes monitoring and hypo/hyperglycemia safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for diabetes monitoring and hypo/hyperglycemia safety." },
        ],
        feedback: {
          observed: "Observe the compression socks folded as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the bathroom scale display, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the compression socks folded as patient-specific evidence for diabetes monitoring and hypo/hyperglycemia safety. Compare it with the bathroom scale display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for diabetes monitoring and hypo/hyperglycemia safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compression socks folded, compare the visible evidence with bathroom scale display and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compression socks folded; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for diabetes monitoring and hypo/hyperglycemia safety. For compression socks folded, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Respira",
    title: "Respiratory assessment, oxygen, and symptom zones",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for respiratory assessment, oxygen, and symptom zones within Chronic Disease Management. Use the current controlled requirements in CL-SD-020, CL-SD-015, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-020, Comprehensive Respiratory Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Review all available referral documentation before the SOC visit including: hospital discharge summary (if applicable), pulmonologist or PCP notes, most recent pulmonary function test results, home oxygen prescription, current respiratory medication list, and any recent emergency department visits for respiratory complaints. ; Before the SOC visit. ; ; 6.1.2 ; Assigned RN ; At the SOC visit, conduct a comprehensive respiratory assessment documenting all of the following: (a) respiratory diagnosis history — COPD (GOLD classification if known), asthma (severity classification), diagnosis dates, prior hospitalizations and ICU admissions for respiratory causes in the past 12 months; (b) current symptoms.",
      "Controlled-policy focus — CL-SD-020, Oxygen Therapy Management. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; Verify that a valid physician order exists for all oxygen therapy before the first visit involving oxygen management. The order must specify: flow rate (L/min), delivery device, and hours of use per day. Contact the physician if any element is missing. ; Before the first oxygen-related visit. ; ; 6.3.2 ; Assigned RN ; Assess and document SpO2 on room air AND on supplemental oxygen at the physician-ordered flow rate at each applicable visit. Document both values when clinically feasible. If the patient's SpO2 does not meet the physician's threshold on the prescribed flow rate, contact the physician.",
      "Controlled-policy focus — CL-SD-020, Ongoing Respiratory Assessment and Monitoring at Each Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; At each respiratory patient visit, assess and document all of the following with clinical analysis — not merely data recording: (a) dyspnea rating using the mMRC scale — compare to baseline and prior visit; (b) current respiratory rate — compare to baseline; (c) SpO2 — obtain on room air if the patient is not continuously oxygen-dependent, or on oxygen at the prescribed flow rate; document the measurement conditions (which liter flow, which device, at rest vs. after exertion); (d) lung auscultation — all fields, document location and character of any abnormality; (e) accessory muscle use assessment.",
      "Controlled-policy focus — CL-SD-015, Comprehensive Fall Risk Assessment. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; At SOC and at each OASIS time point, conduct a comprehensive fall risk assessment including: (a) history of falls in the past 12 months (number, circumstances, injuries); (b) current medications — review for fall-risk-increasing drugs (FRIDs): sedatives/hypnotics, opioids, antihypertensives, diuretics, antidepressants, anticonvulsants, antipsychotics, polypharmacy ≥5 medications; (c) gait and balance assessment using a validated tool (Timed Up and Go ≥12 seconds = increased risk; or Morse Fall Scale); (d) lower extremity strength assessment; (e) vision assessment — last eye exam, current visual acuity, corrective lens use; (f) cognitive status — impaired judgment, wandering risk per RM-PS-004; (g) orthostatic.",
      "Controlled-policy focus — CL-SD-020, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary respiratory diagnosis shall receive a comprehensive respiratory assessment at SOC, as defined in Section 6.1, incorporating all elements necessary to establish a clinical baseline, develop an individualized respiratory management plan, and accurately complete all applicable OASIS data elements. 4.2 A respiratory management plan shall be developed as part of the physician-approved plan of care for every patient with a respiratory diagnosis, specifying: physician-ordered oxygen therapy parameters (flow rate, delivery device, hours per day); medication regimen (bronchodilators, corticosteroids, antibiotics, mucolytics); breathing exercise program; activity tolerance and energy conservation plan; patient and caregiver education goals; exacerbation recognition and response protocols; and defined parameters for physician notification and emergency response. 4.3 At.",
      "Apply the controlled requirements to the three visible objects in the scene for respiratory assessment, oxygen, and symptom zones. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Nebulizer", detail: "Review the nebulizer for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the inhaler spacer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Inhaler Spacer", detail: "Review the inhaler spacer for the patient-specific finding. Reconcile it with the nebulizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "nebulizer-4-1", label: "nebulizer", shortLabel: "nebulizer", ariaLabel: "Investigate nebulizer",        x: 14, y: 47, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the nebulizer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nebulizer, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nebulizer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nebulizer, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Treat the nebulizer as the complete assessment and do not compare the pulse oximeter, patient report, or current record. This identify option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respiratory assessment, oxygen, and symptom zones." },
          { id: "i3", label: "Carry forward the prior visit conclusion for respiratory assessment, oxygen, and symptom zones without reassessing the patient today. This identify option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nebulizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nebulizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nebulizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the nebulizer alone and seek clarification only after the intervention is complete. This decide option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nebulizer is resolved." },
          { id: "d3", label: "Defer the concern in the nebulizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respiratory assessment, oxygen, and symptom zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For nebulizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For nebulizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the nebulizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nebulizer." },
          { id: "doc3", label: "Keep the nebulizer decision in personal notes rather than the governed patient record. This document option concerns nebulizer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respiratory assessment, oxygen, and symptom zones." },
        ],
        feedback: {
          observed: "Observe the nebulizer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nebulizer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nebulizer, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nebulizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For nebulizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "pulse-oximeter-4-2", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 33, y: 71, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the pulse oximeter as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with inhaler spacer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with inhaler spacer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the pulse oximeter establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respiratory assessment, oxygen, and symptom zones." },
          { id: "i3", label: "Dismiss the conflict between the pulse oximeter and inhaler spacer because one source appears more convenient. This identify option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the pulse oximeter without confirming an applicable order and patient-specific authority. This decide option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Hand the pulse oximeter concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respiratory assessment, oxygen, and symptom zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the pulse oximeter before reassessment confirms the patient response. This document option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Copy the prior respiratory assessment, oxygen, and symptom zones narrative even though today’s pulse oximeter evidence is different. This document option concerns pulse oximeter during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respiratory assessment, oxygen, and symptom zones." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with inhaler spacer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "inhaler-spacer-4-3", label: "inhaler spacer", shortLabel: "inhaler spacer", ariaLabel: "Investigate inhaler spacer",        x: 81, y: 49, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the inhaler spacer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the nebulizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with nebulizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the inhaler spacer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the nebulizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with nebulizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the inhaler spacer and omit the related change, symptom, or safety cue. This identify option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respiratory assessment, oxygen, and symptom zones." },
          { id: "i3", label: "Let a blank, unreadable, or unverified inhaler spacer stand in for direct RN assessment. This identify option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about inhaler spacer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the inhaler spacer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for inhaler spacer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for respiratory assessment, oxygen, and symptom zones instead of the current controlled clinical pathway. This decide option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respiratory assessment, oxygen, and symptom zones." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For inhaler spacer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the inhaler spacer and omit the discrepancy with nebulizer. This document option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of inhaler spacer." },
          { id: "doc3", label: "Combine the inhaler spacer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns inhaler spacer during respiratory assessment, oxygen, and symptom zones.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respiratory assessment, oxygen, and symptom zones." },
        ],
        feedback: {
          observed: "Observe the inhaler spacer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the nebulizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the inhaler spacer as patient-specific evidence for respiratory assessment, oxygen, and symptom zones. Compare it with the nebulizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respiratory assessment, oxygen, and symptom zones, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with nebulizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respiratory assessment, oxygen, and symptom zones. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Medicat",
    title: "Medication, nutrition, activity, and adherence barriers",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for medication, nutrition, activity, and adherence barriers within Chronic Disease Management. Use the current controlled requirements in CL-SD-019, CL-SD-020, CL-SD-018, CL-SD-014, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-019, 4\\. Policy Statement. 4.1 All patients admitted with a primary or secondary cardiac diagnosis shall receive a comprehensive cardiac assessment at SOC including: (a) cardiac history — prior MI, CHF classification (NYHA Class I–IV), surgeries, catheterizations, device implants (pacemaker, ICD, LVAD); (b) current symptoms — dyspnea (at rest and with exertion), orthopnea, paroxysmal nocturnal dyspnea, edema, fatigue, chest pain, palpitations, dizziness, syncope; (c) baseline vital signs including orthostatic blood pressure; (d) baseline weight (obtained on the same scale, at the same time of day, in the same clothing — establish the \"dry weight\" with physician input); (e) cardiac auscultation — heart sounds, presence of murmurs, gallops (S3, S4); (f) lung auscultation — presence of crackles, wheezing, diminished breath sounds; (g) peripheral.",
      "Controlled-policy focus — CL-SD-020, 5\\. Definitions. Term ; Definition ; ; ; ; ; Chronic Obstructive Pulmonary Disease (COPD) ; A chronic inflammatory lung disease that causes obstructed airflow from the lungs, encompassing emphysema and chronic bronchitis. ; ; Oxygen Saturation (SpO2) ; The percentage of hemoglobin binding sites in the bloodstream occupied by oxygen, measured non-invasively by pulse oximetry. Normal range is 95–100%; patients with chronic hypoxemia may have physician-defined lower acceptable thresholds. ; ; Supplemental Oxygen Therapy ; The administration of oxygen at concentrations above room air (21%) to treat or prevent hypoxemia. Must be physician-ordered with specific flow rate, delivery device, and hours of use. ; ; Exacerbation ; An acute worsening of respiratory symptoms beyond normal day-to-day variation, sufficient to.",
      "Controlled-policy focus — CL-SD-018, 4\\. Policy Statement. 4.1 All patients with a diagnosis of diabetes mellitus shall receive a comprehensive diabetic assessment at SOC, including: (a) diabetes type (Type 1, Type 2, gestational, other); (b) current diabetic medication regimen (insulin, oral agents, injectables) with verification of actual adherence per CL-SD-012; (c) blood glucose monitoring frequency and recent values; (d) HbA1c level (most recent; physician order for new HbA1c if not available within past 3 months); (e) hypoglycemia and hyperglycemia history; (f) diabetic complications screening — retinopathy, nephropathy, neuropathy, peripheral vascular disease, foot ulcers; (g) dietary assessment — current dietary habits, carbohydrate management, nutritional status; (h) foot assessment — skin integrity, sensation (monofilament testing if available), pulses, deformity, ulceration, callus, toenail condition; (i) patient's and caregiver's.",
      "Controlled-policy focus — CL-SD-014, Pain Reassessment and Intervention Monitoring. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN / LVN ; At each skilled visit, reassess pain and document: (a) current pain intensity using the same tool as prior assessments; (b) comparison to prior visit; (c) effectiveness of current pain management; (d) patient's adherence to the pain management plan; (e) any new pain or change in existing pain. ; At each visit. ; ; 6.3.2 ; Assigned RN / LVN ; If a pain medication is administered during the visit, reassess and document the patient's pain intensity within 1 hour of administration (or within the expected onset time of the medication) to evaluate effectiveness. ; Within 1.",
      "Controlled-policy focus — CL-SD-020, PT Respiratory Services Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Physical Therapist ; When PT is ordered for a respiratory patient, the PT evaluation shall include: baseline 6-minute walk test (or modified version) with SpO2 monitoring throughout; Borg perceived exertion scale assessment; inspiratory muscle strength assessment; breathing pattern assessment; functional activity assessment with SpO2 monitoring during activities. ; At the initial PT evaluation. ; ; 6.5.2 ; Physical Therapist ; Develop a respiratory-specific exercise program that includes: breathing retraining (pursed-lip breathing, diaphragmatic breathing); inspiratory muscle training if indicated; aerobic conditioning at a physician-approved intensity with SpO2 monitoring; functional activity progression; energy conservation strategies. All exercise parameters shall be coordinated with the.",
      "Apply the controlled requirements to the three visible objects in the scene for medication, nutrition, activity, and adherence barriers. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Cane", detail: "Review the cane for the patient-specific finding. Reconcile it with the pain dial, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pain Dial", detail: "Review the pain dial for the patient-specific finding. Reconcile it with the nonslip mat, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Nonslip Mat", detail: "Review the nonslip mat for the patient-specific finding. Reconcile it with the cane, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "cane-5-1", label: "cane", shortLabel: "cane", ariaLabel: "Investigate cane",        x: 14, y: 67, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the cane as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the pain dial, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cane, compare the visible evidence with pain dial and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the cane as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the pain dial, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cane, compare the visible evidence with pain dial and the controlling source before classifying status." },
          { id: "i2", label: "Assume the cane establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, nutrition, activity, and adherence barriers." },
          { id: "i3", label: "Dismiss the conflict between the cane and pain dial because one source appears more convenient. This identify option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about cane." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cane; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cane; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the cane without confirming an applicable order and patient-specific authority. This decide option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for cane is resolved." },
          { id: "d3", label: "Hand the cane concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, nutrition, activity, and adherence barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For cane, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For cane, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the cane before reassessment confirms the patient response. This document option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of cane." },
          { id: "doc3", label: "Copy the prior medication, nutrition, activity, and adherence barriers narrative even though today’s cane evidence is different. This document option concerns cane during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, nutrition, activity, and adherence barriers." },
        ],
        feedback: {
          observed: "Observe the cane as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the pain dial, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the cane as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the pain dial, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cane, compare the visible evidence with pain dial and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cane; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For cane, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "pain-dial-5-2", label: "pain dial", shortLabel: "pain dial", ariaLabel: "Investigate pain dial",        x: 36, y: 44, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the pain dial as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the nonslip mat, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pain dial, compare the visible evidence with nonslip mat and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pain dial as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the nonslip mat, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pain dial, compare the visible evidence with nonslip mat and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pain dial and omit the related change, symptom, or safety cue. This identify option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, nutrition, activity, and adherence barriers." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pain dial stand in for direct RN assessment. This identify option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pain dial." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pain dial; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pain dial; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pain dial issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pain dial is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for medication, nutrition, activity, and adherence barriers instead of the current controlled clinical pathway. This decide option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, nutrition, activity, and adherence barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For pain dial, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For pain dial, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pain dial and omit the discrepancy with nonslip mat. This document option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pain dial." },
          { id: "doc3", label: "Combine the pain dial issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pain dial during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, nutrition, activity, and adherence barriers." },
        ],
        feedback: {
          observed: "Observe the pain dial as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the nonslip mat, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pain dial as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the nonslip mat, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pain dial, compare the visible evidence with nonslip mat and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pain dial; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For pain dial, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "nonslip-mat-5-3", label: "nonslip mat", shortLabel: "nonslip mat", ariaLabel: "Investigate nonslip mat",        x: 78, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the nonslip mat as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the cane, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip mat, compare the visible evidence with cane and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nonslip mat as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the cane, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip mat, compare the visible evidence with cane and the controlling source before classifying status." },
          { id: "i2", label: "Treat the nonslip mat as the complete assessment and do not compare the cane, patient report, or current record. This identify option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, nutrition, activity, and adherence barriers." },
          { id: "i3", label: "Carry forward the prior visit conclusion for medication, nutrition, activity, and adherence barriers without reassessing the patient today. This identify option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nonslip mat." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip mat; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip mat; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the nonslip mat alone and seek clarification only after the intervention is complete. This decide option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nonslip mat is resolved." },
          { id: "d3", label: "Defer the concern in the nonslip mat to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, nutrition, activity, and adherence barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For nonslip mat, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For nonslip mat, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the nonslip mat was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nonslip mat." },
          { id: "doc3", label: "Keep the nonslip mat decision in personal notes rather than the governed patient record. This document option concerns nonslip mat during medication, nutrition, activity, and adherence barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, nutrition, activity, and adherence barriers." },
        ],
        feedback: {
          observed: "Observe the nonslip mat as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the cane, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nonslip mat as patient-specific evidence for medication, nutrition, activity, and adherence barriers. Compare it with the cane, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, nutrition, activity, and adherence barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip mat, compare the visible evidence with cane and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip mat; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, nutrition, activity, and adherence barriers. For nonslip mat, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Change-",
    title: "Change-in-condition escalation and avoidable hospitalization prevention",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for change-in-condition escalation and avoidable hospitalization prevention within Chronic Disease Management. Use the current controlled requirements in CL-SD-015, CL-SD-014, CL-SD-019, CL-SD-018, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-015, Fall Prevention Plan Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; For every patient identified as Moderate or High fall risk, develop an individualized Fall Prevention Plan as part of the plan of care, addressing each modifiable risk factor identified. Interventions shall include, as applicable: (a) medication review with physician — request review of FRIDs; (b) PT/OT referral for balance and strength training; (c) home safety modifications (remove loose rugs, improve lighting, install grab bars, clear walkways); (d) assistive device assessment, training, and proper use education; (e) orthostatic hypotension management; (f) vision referral if indicated; (g) continence management; (h) safe footwear education; (i) fall alert system recommendation; (j) patient.",
      "Controlled-policy focus — CL-SD-014, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Uncontrolled pain despite current regimen (pain ≥7/10 for 2 consecutive visits) ; Assigned RN notifies physician and Director of Nursing ; Physician adjusts medication regimen. Director of Nursing reviews pain management plan and considers specialist referral (pain management, palliative care). Document all actions. ; Physician notification within 24 hours; Director of Nursing review within 48 hours. ; ; Patient requests opioid dose escalation beyond physician parameters ; Assigned RN notifies physician ; Physician evaluates the request. RN documents the patient's request, the physician's response, and the clinical rationale. ; Physician notification within 24 hours. ; ; Suspected opioid misuse or diversion.",
      "Controlled-policy focus — CL-SD-015, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Patient falls twice or more during the episode ; Director of Nursing is automatically notified ; Director of Nursing conducts a case-level fall prevention review, including plan of care adequacy, medication review, home environment review, and PT/OT involvement. Recommends intensified interventions. ; Director of Nursing review within 48 hours of second fall. ; ; Patient refuses fall prevention interventions (refuses assistive device, refuses to remove rugs) ; Assigned RN documents refusal; educates on risks ; Notify physician. Document patient's informed refusal. Continue to educate at each visit. ; Physician notification within 24 hours. ; ; Fall results in hospitalization ; Director of.",
      "Controlled-policy focus — CL-SD-019, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Patient's weight increases >5 lbs in 1 week despite interventions ; Assigned RN notifies physician and Director of Nursing ; Physician assesses for medication adjustment, additional diagnostics, or possible hospitalization. Director of Nursing reviews the case for adequacy of monitoring. ; Physician notification within 4 hours; Director of Nursing review within 24 hours. ; ; Patient repeatedly non-compliant with sodium restriction or daily weights ; Assigned RN documents; notifies Director of Nursing ; Director of Nursing reviews the education plan. Consider MSW referral for psychosocial barriers. Increase visit frequency if physician orders. Document non-adherence and interventions. ; Director of Nursing review within.",
      "Controlled-policy focus — CL-SD-018, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Severe hypoglycemia (<54 mg/dL) with altered consciousness ; Call 911; administer oral glucose or glucagon if available and patient can swallow safely ; Emergency medical services; physician notification; incident report per RM-ER-002 ; Immediately. ; ; Severe hyperglycemia (>400 mg/dL) or symptoms of DKA/HHS ; Assigned RN notifies physician immediately; consider 911 ; Physician orders; possible emergency transport; incident report ; Immediately; physician notification within 1 hour. ; ; Blood glucose consistently outside target range for 3+ visits ; Assigned RN notifies physician for medication review ; Physician adjusts diabetic medication regimen. RN intensifies monitoring and education. ; Physician notification within 24.",
      "Apply the controlled requirements to the three visible objects in the scene for change-in-condition escalation and avoidable hospitalization prevention. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "BP Cuff", detail: "Review the BP cuff for the patient-specific finding. Reconcile it with the inhaler spacer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Inhaler Spacer", detail: "Review the inhaler spacer for the patient-specific finding. Reconcile it with the symptom notebook, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Symptom Notebook", detail: "Review the symptom notebook for the patient-specific finding. Reconcile it with the BP cuff, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "bp-cuff-6-1", label: "BP cuff", shortLabel: "BP cuff", ariaLabel: "Investigate BP cuff",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the BP cuff as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the BP cuff as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the BP cuff and omit the related change, symptom, or safety cue. This identify option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation and avoidable hospitalization prevention." },
          { id: "i3", label: "Let a blank, unreadable, or unverified BP cuff stand in for direct RN assessment. This identify option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about BP cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the BP cuff issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for BP cuff is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for change-in-condition escalation and avoidable hospitalization prevention instead of the current controlled clinical pathway. This decide option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For BP cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For BP cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the BP cuff and omit the discrepancy with inhaler spacer. This document option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of BP cuff." },
          { id: "doc3", label: "Combine the BP cuff issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns BP cuff during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        feedback: {
          observed: "Observe the BP cuff as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the BP cuff as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For BP cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "inhaler-spacer-6-2", label: "inhaler spacer", shortLabel: "inhaler spacer", ariaLabel: "Investigate inhaler spacer",        x: 43, y: 55, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the inhaler spacer as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the symptom notebook, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with symptom notebook and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the inhaler spacer as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the symptom notebook, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with symptom notebook and the controlling source before classifying status." },
          { id: "i2", label: "Treat the inhaler spacer as the complete assessment and do not compare the symptom notebook, patient report, or current record. This identify option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation and avoidable hospitalization prevention." },
          { id: "i3", label: "Carry forward the prior visit conclusion for change-in-condition escalation and avoidable hospitalization prevention without reassessing the patient today. This identify option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about inhaler spacer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the inhaler spacer alone and seek clarification only after the intervention is complete. This decide option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for inhaler spacer is resolved." },
          { id: "d3", label: "Defer the concern in the inhaler spacer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For inhaler spacer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the inhaler spacer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of inhaler spacer." },
          { id: "doc3", label: "Keep the inhaler spacer decision in personal notes rather than the governed patient record. This document option concerns inhaler spacer during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        feedback: {
          observed: "Observe the inhaler spacer as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the symptom notebook, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the inhaler spacer as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the symptom notebook, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with symptom notebook and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "symptom-notebook-6-3", label: "symptom notebook", shortLabel: "symptom notebook", ariaLabel: "Investigate symptom notebook",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the symptom notebook as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook, compare the visible evidence with BP cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the symptom notebook as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook, compare the visible evidence with BP cuff and the controlling source before classifying status." },
          { id: "i2", label: "Assume the symptom notebook establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation and avoidable hospitalization prevention." },
          { id: "i3", label: "Dismiss the conflict between the symptom notebook and BP cuff because one source appears more convenient. This identify option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about symptom notebook." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the symptom notebook without confirming an applicable order and patient-specific authority. This decide option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for symptom notebook is resolved." },
          { id: "d3", label: "Hand the symptom notebook concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For symptom notebook, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For symptom notebook, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the symptom notebook before reassessment confirms the patient response. This document option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of symptom notebook." },
          { id: "doc3", label: "Copy the prior change-in-condition escalation and avoidable hospitalization prevention narrative even though today’s symptom notebook evidence is different. This document option concerns symptom notebook during change-in-condition escalation and avoidable hospitalization prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation and avoidable hospitalization prevention." },
        ],
        feedback: {
          observed: "Observe the symptom notebook as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the symptom notebook as patient-specific evidence for change-in-condition escalation and avoidable hospitalization prevention. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation and avoidable hospitalization prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom notebook, compare the visible evidence with BP cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom notebook; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation and avoidable hospitalization prevention. For symptom notebook, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Trend",
    title: "Trend documentation and interdisciplinary plan updates",
    subtitle: "Chronic Disease Management",
    narration: [
      "This lesson develops registered-nurse reasoning for trend documentation and interdisciplinary plan updates within Chronic Disease Management. Use the current controlled requirements in CL-CP-002, CL-SD-019, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Mid-Episode Plan of Care Modification (Significant Change). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Clinician (any discipline) ; Any clinician who identifies a significant change in the patient's condition during a visit shall document the clinical findings in the visit note and notify the assigned RN and/or Director of Nursing on the same day. The notification must include: (a) the nature of the change; (b) the patient's current clinical status; (c) the clinician's clinical assessment of the change; (d) any immediate safety concerns. ; On the same day the change is identified. ; ; 6.2.2 ; Assigned RN ; Upon notification or independent identification of a significant change, contact the physician within 24 hours.",
      "Controlled-policy focus — CL-CP-002, Routine 30-Day Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Conduct a formal plan of care review at a minimum of every 30 calendar days during each certification period. The review shall assess: (a) the patient's current clinical status compared to the status at SOC or last review; (b) progress toward each short-term and long-term goal — with specific measurable notation of progress, plateau, or regression; (c) whether the current service type and frequency remain appropriate; (d) whether any new diagnosis, medication change, or functional change has occurred that requires a plan modification; (e) whether the patient is on track for discharge within the anticipated episode timeframe; (f).",
      "Controlled-policy focus — CL-CP-002, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; 30-day plan of care review note ; Structured Plan of Care Review Note documenting current status, goal progress, and plan disposition ; Assigned RN ; EHR — clinical notes ; Within 24 hours of review; retained minimum 7 years ; ; Mid-episode modification ; Updated plan of care in EHR with supporting physician order ; Assigned RN ; EHR — plan of care and orders ; Within 24 hours of receiving physician order ; ; Physician notification for significant change ; Documentation of contact, information communicated, and physician response ; Assigned RN ; EHR — communication notes.",
      "Controlled-policy focus — CL-CP-002, Recertification Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator / Director of Nursing ; Generate a recertification tracking report no later than the 40th day of each active certification period, identifying all patients whose certification period ends within the next 20 days. Confirm that each patient has a recertification assessment scheduled and an assigned clinician. ; No later than Day 40 of each certification period. ; ; 6.3.2 ; Assigned RN ; Conduct the comprehensive recertification assessment between Day 56 and Day 60 of the current certification period (5-day assessment window), in compliance with CMS OASIS timing requirements and policy CL-CA-004. Complete all required OASIS data elements for.",
      "Controlled-policy focus — CL-SD-019, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Comprehensive cardiac assessment ; Cardiac Assessment Template (Appendix A) ; Assigned RN ; EHR — assessment module ; At SOC and OASIS time points ; ; Visit cardiac monitoring ; Vital signs, weight, symptom assessment, medication review, dietary assessment, education — with clinical analysis ; Assigned RN / LVN ; EHR — visit note ; At each visit; within 24 hours ; ; Daily weight log review ; Documentation of review of patient's home weight log with trend analysis ; Assigned RN / LVN ; EHR — visit note ; At each visit ; ; Physician notification for.",
      "Apply the controlled requirements to the three visible objects in the scene for trend documentation and interdisciplinary plan updates. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Trend Folder", detail: "Review the trend folder for the patient-specific finding. Reconcile it with the BP cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "BP Cuff", detail: "Review the BP cuff for the patient-specific finding. Reconcile it with the inhaler spacer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Inhaler Spacer", detail: "Review the inhaler spacer for the patient-specific finding. Reconcile it with the trend folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-018" },
      { kind: "Controlled Policy", text: "CL-SD-019" },
      { kind: "Controlled Policy", text: "CL-SD-020" },
      { kind: "Controlled Policy", text: "CL-SD-014" },
      { kind: "Controlled Policy", text: "CL-SD-015" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.80" },
      { kind: "External Authority", text: "42 CFR § 484.75(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "trend-folder-7-1", label: "trend folder", shortLabel: "trend folder", ariaLabel: "Investigate trend folder",        x: 14, y: 73, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the trend folder as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend folder, compare the visible evidence with BP cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the trend folder as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend folder, compare the visible evidence with BP cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the trend folder as the complete assessment and do not compare the BP cuff, patient report, or current record. This identify option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for trend documentation and interdisciplinary plan updates." },
          { id: "i3", label: "Carry forward the prior visit conclusion for trend documentation and interdisciplinary plan updates without reassessing the patient today. This identify option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about trend folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the trend folder alone and seek clarification only after the intervention is complete. This decide option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for trend folder is resolved." },
          { id: "d3", label: "Defer the concern in the trend folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during trend documentation and interdisciplinary plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For trend folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For trend folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the trend folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of trend folder." },
          { id: "doc3", label: "Keep the trend folder decision in personal notes rather than the governed patient record. This document option concerns trend folder during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for trend documentation and interdisciplinary plan updates." },
        ],
        feedback: {
          observed: "Observe the trend folder as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the trend folder as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For trend folder, compare the visible evidence with BP cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to trend folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For trend folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "bp-cuff-7-2", label: "BP cuff", shortLabel: "BP cuff", ariaLabel: "Investigate BP cuff",        x: 58, y: 71, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the BP cuff as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the BP cuff as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the BP cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for trend documentation and interdisciplinary plan updates." },
          { id: "i3", label: "Dismiss the conflict between the BP cuff and inhaler spacer because one source appears more convenient. This identify option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about BP cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the BP cuff without confirming an applicable order and patient-specific authority. This decide option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for BP cuff is resolved." },
          { id: "d3", label: "Hand the BP cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during trend documentation and interdisciplinary plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For BP cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For BP cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the BP cuff before reassessment confirms the patient response. This document option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of BP cuff." },
          { id: "doc3", label: "Copy the prior trend documentation and interdisciplinary plan updates narrative even though today’s BP cuff evidence is different. This document option concerns BP cuff during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for trend documentation and interdisciplinary plan updates." },
        ],
        feedback: {
          observed: "Observe the BP cuff as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the BP cuff as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with inhaler spacer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For BP cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
      {
        id: "inhaler-spacer-7-3", label: "inhaler spacer", shortLabel: "inhaler spacer", ariaLabel: "Investigate inhaler spacer",        x: 80, y: 39, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the inhaler spacer as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the trend folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with trend folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the inhaler spacer as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the trend folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with trend folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the inhaler spacer and omit the related change, symptom, or safety cue. This identify option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for trend documentation and interdisciplinary plan updates." },
          { id: "i3", label: "Let a blank, unreadable, or unverified inhaler spacer stand in for direct RN assessment. This identify option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about inhaler spacer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the inhaler spacer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for inhaler spacer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for trend documentation and interdisciplinary plan updates instead of the current controlled clinical pathway. This decide option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during trend documentation and interdisciplinary plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For inhaler spacer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the inhaler spacer and omit the discrepancy with trend folder. This document option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of inhaler spacer." },
          { id: "doc3", label: "Combine the inhaler spacer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns inhaler spacer during trend documentation and interdisciplinary plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for trend documentation and interdisciplinary plan updates." },
        ],
        feedback: {
          observed: "Observe the inhaler spacer as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the trend folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the inhaler spacer as patient-specific evidence for trend documentation and interdisciplinary plan updates. Compare it with the trend folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for trend documentation and interdisciplinary plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with trend folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for trend documentation and interdisciplinary plan updates. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-018","CL-SD-019","CL-SD-020","CL-SD-014","CL-SD-015","CL-CP-002","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.75(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During establish condition-specific baseline and goals, the symptom notebook closed and conflicts with the bathroom scale with display and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the symptom notebook closed and to the next routine visit even though its current clinical significance has not been assessed. This option concerns establish condition-specific baseline and goals.",
      "Proceed using the symptom notebook closed and alone and seek clarification only after the intervention is complete. This option concerns establish condition-specific baseline and goals.",
      "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the bathroom scale with display is unchanged from the prior encounter and omit patient-specific reassessment during establish condition-specific baseline and goals.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for establish condition-specific baseline and goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 2,
    stem: "During cardiac assessment and heart-failure zones, the medication organizer conflicts with the glucometer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Change the treatment, medication, device setting, or plan based on the medication organizer without confirming an applicable order and patient-specific authority. This option concerns cardiac assessment and heart-failure zones.",
      "Hand the medication organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns cardiac assessment and heart-failure zones.",
      "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the glucometer is unchanged from the prior encounter and omit patient-specific reassessment during cardiac assessment and heart-failure zones.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for cardiac assessment and heart-failure zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 3,
    stem: "During diabetes monitoring and hypo/hyperglycemia safety, the compression socks folded conflicts with the bathroom scale display and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for diabetes monitoring and hypo/hyperglycemia safety instead of the current controlled clinical pathway. This option concerns diabetes monitoring and hypo/hyperglycemia safety.",
      "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the bathroom scale display is unchanged from the prior encounter and omit patient-specific reassessment during diabetes monitoring and hypo/hyperglycemia safety.",
      "Close the compression socks folded issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns diabetes monitoring and hypo/hyperglycemia safety.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for diabetes monitoring and hypo/hyperglycemia safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 4,
    stem: "During respiratory assessment, oxygen, and symptom zones, the inhaler spacer conflicts with the nebulizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the inhaler spacer alone and seek clarification only after the intervention is complete. This option concerns respiratory assessment, oxygen, and symptom zones.",
      "Defer the concern in the inhaler spacer to the next routine visit even though its current clinical significance has not been assessed. This option concerns respiratory assessment, oxygen, and symptom zones.",
      "Assume the nebulizer is unchanged from the prior encounter and omit patient-specific reassessment during respiratory assessment, oxygen, and symptom zones.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for respiratory assessment, oxygen, and symptom zones within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 5,
    stem: "During medication, nutrition, activity, and adherence barriers, the nonslip mat conflicts with the cane and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the nonslip mat concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns medication, nutrition, activity, and adherence barriers.",
      "Change the treatment, medication, device setting, or plan based on the nonslip mat without confirming an applicable order and patient-specific authority. This option concerns medication, nutrition, activity, and adherence barriers.",
      "Assume the cane is unchanged from the prior encounter and omit patient-specific reassessment during medication, nutrition, activity, and adherence barriers.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for medication, nutrition, activity, and adherence barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 6,
    stem: "During change-in-condition escalation and avoidable hospitalization prevention, the symptom notebook conflicts with the BP cuff and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for change-in-condition escalation and avoidable hospitalization prevention instead of the current controlled clinical pathway. This option concerns change-in-condition escalation and avoidable hospitalization prevention.",
      "Close the symptom notebook issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns change-in-condition escalation and avoidable hospitalization prevention.",
      "Assume the BP cuff is unchanged from the prior encounter and omit patient-specific reassessment during change-in-condition escalation and avoidable hospitalization prevention.",
      "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for change-in-condition escalation and avoidable hospitalization prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 7,
    stem: "During trend documentation and interdisciplinary plan updates, the inhaler spacer conflicts with the trend folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the inhaler spacer to the next routine visit even though its current clinical significance has not been assessed. This option concerns trend documentation and interdisciplinary plan updates.",
      "Assume the trend folder is unchanged from the prior encounter and omit patient-specific reassessment during trend documentation and interdisciplinary plan updates.",
      "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the inhaler spacer alone and seek clarification only after the intervention is complete. This option concerns trend documentation and interdisciplinary plan updates.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for trend documentation and interdisciplinary plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-018, CL-SD-019, CL-SD-020, CL-SD-014, CL-SD-015, CL-CP-002.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Chronic Disease Management?",
    options: [
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
    ],
    correct: 0,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the glucometer and symptom notebook into defensible RN practice for Chronic Disease Management?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A familiar device display accepted without technique or context validation.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Chronic Disease Management establish?",
    options: [
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Knowledge of the controlled RN concepts in Chronic Disease Management, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Automatic authority to perform every activity discussed in Chronic Disease Management without supervision.",
    ],
    correct: 1,
    rationale: "This module evaluates knowledge; it does not make a credentialing, competency, or authorization decision.",
  },
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-node-orbit{to{transform:rotate(360deg)}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:18px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:19.5px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:18px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
 .lvn002-hotspot .orb{position:relative;isolation:isolate;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800}
.lvn002-hotspot .orb::before{content:"";position:absolute;inset:-9px;z-index:-1;border-radius:50%;background:radial-gradient(circle at 50% 2px,#F26D33 0 3px,rgba(242,109,51,.7) 3px,transparent 5px),conic-gradient(from 0deg,transparent 0 78%,rgba(242,109,51,.04) 78%,rgba(242,109,51,.1) 86%,rgba(242,109,51,.24) 94%,rgba(242,109,51,.48) 100%);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));filter:drop-shadow(0 0 3px rgba(242,109,51,.36));animation:lvn002-node-orbit 2.8s linear infinite;pointer-events:none}
.lvn002-hotspot .ping{position:absolute;inset:0;border-radius:50%;background:#B94718;animation:lvn002-ping 1.2s cubic-bezier(0,0,.2,1) 2;opacity:.5;pointer-events:none}
.lvn002-hotspot .tag{background:#fff;padding:5px 9px;border-radius:8px;font-size:16.5px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:normal;letter-spacing:.02em;max-width:160px;line-height:1.15;text-align:center;overflow-wrap:anywhere}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:18px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:18px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px;max-width:240px;white-space:normal;text-align:center;justify-content:center;line-height:1.15}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:620px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:18px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:15px;max-width:140px;white-space:normal}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:16.5px}
  .lvn002-stage{border-radius:10px}
}

@media (max-width:780px) and (min-width:621px){
  .lvn002-top{height:56px;padding:0 6px;gap:4px}
  .lvn002-brand span.brand-text{display:none}.lvn002-brand{gap:0}
  .lvn002-tabs{gap:2px;overflow:visible}
  .lvn002-tab{flex:1 1 0;min-width:0;padding:4px 3px;font-size:13.5px;letter-spacing:0;overflow:hidden;text-overflow:clip}
  .lvn002-tab.quiz-tab{font-size:0}.lvn002-tab.quiz-tab:after{content:'Quiz';font-size:13.5px}
  .lvn002-exit{padding:5px 7px;font-size:13.5px;min-height:38px}
  .lvn002-work{padding:8px}.lvn002-left{width:40%;min-width:255px;padding:14px}.lvn002-right{padding:6px}
  .lvn002-bot{height:66px;padding:0 8px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:13.5px;padding:5px}
}

@media (max-width:780px) and (min-width:621px){.rn-key-action-grid{grid-template-columns:1fr!important}}
@media (max-width:420px){.rn-key-action-grid{grid-template-columns:1fr!important}}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-hotspot .orb::before,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:#fff;border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:16.5px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:16.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #E2E8F0;font-size:16.5px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:#fff;border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:18px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:16.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #C8DFDC;font-size:16.5px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(1120px,96vw);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:132px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:13.5px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:15px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;gap:2px}.lvn002-tab{min-height:30px;padding:3px 2px;font-size:13.5px;white-space:normal;line-height:1.05;overflow:hidden}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:12px;max-width:96px;white-space:normal;overflow:visible;text-overflow:clip;padding:3px 5px;line-height:1.05;overflow-wrap:anywhere}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:13.5px!important}.lvn002-scene-title>div:last-child{font-size:15px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:13.5px;letter-spacing:.03em;padding:6px;white-space:normal;line-height:1.1}.lvn002-bot button.next{max-width:140px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:12px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:0;align-items:flex-end}.lvn002-modal-card{border-radius:16px 16px 0 0;max-height:90dvh}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 23.25, lineHeight: 1.6, color: CI.ink }}>{body}</div>
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
              style={{ textAlign: 'left', minHeight: 48, padding: '10px 12px', borderRadius: 10, cursor: locked && !selected ? 'default' : 'pointer', border: `1.5px solid ${right ? CI.teal : wrong ? CI.red : selected ? CI.orange : CI.border}`, background: right ? CI.tealSoft : wrong ? '#FFF1F0' : '#fff', fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: CI.ink, opacity: locked && !selected ? 0.55 : 1 }}>
              {choice.label}
            </button>
          );
        })}
        {rationale && <div role="status" aria-live="polite" style={{ fontSize: 28, lineHeight: 1.5, color: CI.muted, padding: '8px 10px', borderRadius: 8, background: CI.bg }}>{rationale}</div>}
      </div>
    );
  };

  const feedback = hotspot.feedback;
  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="lvn-scenario-title" ref={dialogRef} className="lvn002-modal"
      onClick={(event) => { if (event.target === event.currentTarget) closeAndRestore(); }}>
      <div className="lvn002-modal-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${CI.border}`, borderTop: `3px solid ${zoneColor}` }}>
          <div><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: zoneColor }}>{stage === 'observe' ? '1 · Observe' : stage === 'identify' ? '2 · Identify' : stage === 'decide' ? '3 · Decide' : stage === 'document' ? '4 · Document' : '5 · Feedback'}</div>
            <h2 id="lvn-scenario-title" style={{ margin: 0, fontSize: 34, fontWeight: 800, color: CI.ink }}>{hotspot.label}</h2></div>
          <button ref={closeRef} type="button" aria-label="Close scenario" onClick={closeAndRestore} style={{ width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: '50%', border: `1px solid ${CI.border}`, background: CI.bg, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          {stage === 'observe' && <><p style={{ margin: 0, fontSize: 31, lineHeight: 1.6, color: CI.ink }}>{hotspot.observe}</p><button type="button" onClick={() => setStage('identify')} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.teal, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Continue to Identify</button></>}
          {stage === 'identify' && <><div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>What does this evidence mean for patient-specific RN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>What should the RN do next within current orders and scope?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 26, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 36, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the RN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 22, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
        </div>
      </div>
    </div>, document.body,
  );
}

function lessonFocus(narration: string[]) {
  const text = (narration[0] ?? '').trim();
  const stop = text.search(/[.!?](?:[”"']?)(?:\s|$)/);
  return stop >= 0 ? text.slice(0, stop + 1) : text;
}

function LeftPanel({ page, pageIndex, total }: { page: PageData; pageIndex: number; total: number }) {
  const focus = lessonFocus(page.narration);
  const actionsId = `rn-actions-${page.id}`;
  const sourcesId = `rn-sources-${page.id}`;
  return (
    <div className="rn-left-panel-system" data-left-panel="segmented">
      <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 12 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 36, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 12px', color: CI.orange, fontSize: 22.5, fontWeight: 600 }}>{page.subtitle}</p>

      <section aria-label="Lesson focus" style={{ padding: 13, borderRadius: 12, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 16.5, fontWeight: 800, color: CI.teal, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}><Sparkles size={15} aria-hidden="true" />Lesson Focus</div>
        <p style={{ margin: 0, fontSize: 22.5, lineHeight: 1.55, color: CI.ink }}>{focus}</p>
      </section>

      <section aria-labelledby={actionsId} style={{ marginBottom: 14 }}>
        <h2 id={actionsId} style={{ margin: '0 0 9px', fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted }}>Key RN Actions</h2>
        <div className="rn-key-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {page.keyPoints.map((kp, index) => (
            <article id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 11, display: 'flex', gap: 9, minWidth: 0, overflow: 'hidden', boxShadow: '0 3px 10px rgba(15,91,84,.06)', gridColumn: page.keyPoints.length % 2 === 1 && index === page.keyPoints.length - 1 ? '1 / -1' : undefined }}>
              <span style={{ fontSize: 27, lineHeight: 1.2 }} aria-hidden>{kp.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 19.5, color: '#1F1C1B', marginBottom: 3, overflowWrap: 'anywhere' }}>{kp.title}</div>
                <div style={{ fontSize: 19.5, color: CI.muted, lineHeight: 1.4, overflowWrap: 'anywhere' }}>{kp.detail}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Clinical tip" style={{ padding: 13, borderRadius: 12, background: '#FFF8F3', border: `1px solid #F3D5C7`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 16.5, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}><AlertCircle size={15} aria-hidden="true" />Clinical Tip</div>
        <div style={{ fontSize: 21, color: '#524C4B', lineHeight: 1.5 }}>{page.clinicalTip}</div>
      </section>

      <section aria-labelledby={sourcesId} style={{ marginBottom: 13 }}>
        <h2 id={sourcesId} style={{ margin: '0 0 7px', fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted }}>Sources &amp; Standards</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {page.sourceLabels.map((s) => (
            <span key={s.kind + s.text} style={{ fontSize: 15.75, padding: '5px 8px', borderRadius: 999, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.teal, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.035em', overflowWrap: 'anywhere' }}>{s.kind}: {s.text}</span>
          ))}
        </div>
      </section>

      <details className="rn-lesson-details" style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 4 }}>
        <summary style={{ padding: '12px 14px', fontWeight: 800, fontSize: 19.5, color: CI.teal, cursor: 'pointer' }}>Read Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {page.narration.map((paragraph, index) => <p key={index} style={{ margin: index === page.narration.length - 1 ? 0 : '0 0 11px', fontSize: 22.5, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
        </div>
      </details>
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
        <div className="lvn002-scene-title" style={{ position: 'absolute', top: 10, left: 10, zIndex: 8, maxWidth: 'min(50%, 320px)', padding: '8px 10px', borderRadius: 12, background: '#fff', border: `1px solid ${CI.border}`, pointerEvents: 'none' }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 19.5, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#fff', border: `1px solid ${CI.border}`, fontSize: 16.5, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
          <Eye size={14} /> {completed.length} / {page.hotspots.length} observed
        </div>
        {page.hotspots.map((hs, _hi) => {
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
                {isDone ? <Check size={16} strokeWidth={3} aria-hidden /> : <span style={{ fontSize: 22.5 }} aria-hidden>?</span>}
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
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontSize: 16.5, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <RotateCcw size={13} /> Reset
        </button>
        {done && !activeId && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 25, background: 'rgba(15,91,84,.78)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', padding: 20, animation: 'lvn002-pop .3s cubic-bezier(.16,1,.3,1)' }} className="lvn002-rm-transition">
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 380, width: '100%', textAlign: 'center', border: `4px solid ${CI.tealSoft}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: CI.tealSoft, display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}><ShieldCheck size={32} color={CI.teal} /></div>
              <div style={{ fontSize: 27, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>Scene Complete</div>
              <div style={{ fontSize: 19.5, color: CI.muted, lineHeight: 1.5, marginBottom: 14 }}>Scenario Practice Complete. Knowledge practice only — Practical Competency Remains Separate.</div>
              {onGoQuiz && page.id === PAGES.length - 1 && (
                <button type="button" onClick={onGoQuiz} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Go to Knowledge Check</button>
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
          <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: CI.teal, marginBottom: 8 }}>Knowledge Check Complete</div>
          <div style={{ position: 'relative', width: 140, height: 140, margin: '12px auto 18px' }}>
            <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }} aria-hidden>
              <circle cx="60" cy="60" r="45" fill="none" stroke={CI.tealSoft} strokeWidth="10" />
              <circle cx="60" cy="60" r="45" fill="none" stroke={passed ? CI.teal : CI.orange} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} className="lvn002-rm-transition" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <div>
                <div style={{ fontSize: 42, fontWeight: 800, color: passed ? CI.teal : CI.orange }}>{pct}%</div>
                <div style={{ fontSize: 16.5, fontWeight: 700, color: CI.muted }}>{score}/{QUIZ.length}</div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 33, fontWeight: 800, color: CI.teal, marginBottom: 6 }}>{passed ? 'Knowledge Check Complete' : 'Keep sharpening judgment'}</div>
          <div style={{ fontSize: 21, color: CI.muted, lineHeight: 1.55, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
            Scenario Practice Complete. Practical Competency Remains Separate.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 22 }}>
            {[
              { label: 'Authorized', color: CI.teal, tip: 'Order + competency + expected' },
              { label: 'Conditional', color: CI.orange, tip: 'Current order, scope, and competency review required' },
              { label: 'Prohibited', color: CI.red, tip: 'Hard stop · escalate' },
            ].map((z) => (
              <div key={z.label} style={{ padding: 14, borderRadius: 14, background: CI.bg, border: `1px solid ${CI.border}` }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: z.color, margin: '0 auto 8px' }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: CI.ink }}>{z.label}</div>
                <div style={{ fontSize: 16.5, color: CI.muted, marginTop: 4 }}>{z.tip}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontWeight: 800, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Back to Practice</button>
            <button type="button" onClick={() => {
              setIdx(0); setSelected(null); setSubmitted(false);
              setAnswers(Array(QUIZ.length).fill(null)); setFinished(false);
            }} style={{ minHeight: 44, padding: '0 20px', borderRadius: 12, border: 0, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>Retake Check</button>
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
              <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase' }}>Field Judgment Check</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, opacity: .9 }}>{idx + 1} / {QUIZ.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,.18)', overflow: 'hidden' }}>
            <div className="lvn002-rm-transition" style={{ height: '100%', width: `${Math.max(progress, 6)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${CI.orange}, #FFB088)`, transition: 'width .35s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 16.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .85 }}>
            <span>Observe</span><span>Classify</span><span>Decide</span><span>Defend</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: CI.tealSoft, color: CI.teal, fontSize: 16.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            <Sparkles size={13} /> Scenario {idx + 1}
          </div>
          <h2 style={{ margin: '0 0 18px', fontSize: 30, fontWeight: 800, color: CI.ink, lineHeight: 1.45 }}>{q.stem}</h2>

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
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: letterBg, color: letterColor, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{letters[i]}</span>
                  <span style={{ fontWeight: 600, color: CI.ink, fontSize: 24, lineHeight: 1.5, paddingTop: 3 }}>{opt}</span>
                  {submitted && i === q.correct && <CheckCircle2 size={18} color={CI.teal} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  {submitted && on && !isCorrect && <XCircle size={18} color={CI.red} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 14, background: isCorrect ? CI.tealSoft : '#FFF3EC', border: `1px solid ${isCorrect ? CI.tealMuted : '#F6C7A8'}` }}>
              <div style={{ fontSize: 16.5, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: isCorrect ? CI.teal : CI.orangeDark, marginBottom: 6 }}>
                {isCorrect ? 'Correct judgment' : 'Recalibrate'}
              </div>
              <div style={{ fontSize: 23.25, lineHeight: 1.6, color: CI.ink }}>{q.rationale}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${CI.border}`, background: '#fff', color: CI.muted, fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>Exit</button>
            <button type="button" onClick={submit} disabled={selected === null}
              style={{ flex: 1, minHeight: 48, border: 0, borderRadius: 12, background: CI.orange, color: '#fff', fontWeight: 800, fontSize: 19.5, letterSpacing: '.1em', textTransform: 'uppercase', cursor: selected === null ? 'not-allowed' : 'pointer', opacity: selected === null ? 0.5 : 1 }}>
              {submitted ? (idx >= QUIZ.length - 1 ? 'See scope results' : 'Next scenario') : 'Lock in answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


const STORAGE_KEY = 'rn-009-progress-v6000';

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
  return <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, flexShrink: 0, objectFit: 'contain' }} />;
}

export default function RN009() {
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
          <span className="brand-text">RN-009 — Chronic Disease</span>
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
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 8, padding: '8px 12px' }}>
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
