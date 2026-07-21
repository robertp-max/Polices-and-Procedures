/**
 * RN-004 — Plan of Care Development & CMS-485
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
import img01 from './assets/rn-004/rn-004-lesson-01.png';
import img02 from './assets/rn-004/rn-004-lesson-02.png';
import img03 from './assets/rn-004/rn-004-lesson-03.png';
import img04 from './assets/rn-004/rn-004-lesson-04.png';
import img05 from './assets/rn-004/rn-004-lesson-05.png';
import img06 from './assets/rn-004/rn-004-lesson-06.png';
import img07 from './assets/rn-004/rn-004-lesson-07.png';

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

const MODULE_META = { id: "RN-004", title: "Plan of Care Development & CMS-485", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Translate comprehensive-assessment findings into an individualized plan, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Required plan-of-care elements and CMS-485-equivalent content, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Disciplines, visit frequency, duration, interventions, and measurable goals, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Medication, treatment, safety, education, and emergency instructions, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Provider orders, verbal-order read-back, authentication, and signature tracking, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Review, update, recertification, and interdisciplinary coordination, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Implementation audit, variances, closed-loop follow-through, and competency boundary, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Transla",
    title: "Translate comprehensive-assessment findings into an individualized plan",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for translate comprehensive-assessment findings into an individualized plan within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-002, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Routine 30-Day Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Conduct a formal plan of care review at a minimum of every 30 calendar days during each certification period. The review shall assess: (a) the patient's current clinical status compared to the status at SOC or last review; (b) progress toward each short-term and long-term goal — with specific measurable notation of progress, plateau, or regression; (c) whether the current service type and frequency remain appropriate; (d) whether any new diagnosis, medication change, or functional change has occurred that requires a plan modification; (e) whether the patient is on track for discharge within the anticipated episode timeframe; (f).",
      "Controlled-policy focus — CL-CP-002, Mid-Episode Plan of Care Modification (Significant Change). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Clinician (any discipline) ; Any clinician who identifies a significant change in the patient's condition during a visit shall document the clinical findings in the visit note and notify the assigned RN and/or Director of Nursing on the same day. The notification must include: (a) the nature of the change; (b) the patient's current clinical status; (c) the clinician's clinical assessment of the change; (d) any immediate safety concerns. ; On the same day the change is identified. ; ; 6.2.2 ; Assigned RN ; Upon notification or independent identification of a significant change, contact the physician within 24 hours.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, Multidisciplinary Coordination in Plan of Care Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Ensure that all disciplines providing services to the patient have reviewed the plan of care and that their discipline-specific goals, interventions, and visit frequencies are accurately reflected. No discipline shall provide services that conflict with or exceed what is authorized in the plan of care without a new physician order. ; Within 48 hours of the SOC visit. ; ; 6.4.2 ; Each Clinical Discipline Provider ; Upon receiving a referral for a new patient, review the plan of care within 24 hours of assignment. Confirm that the ordered services are within the discipline's scope of practice.",
      "Controlled-policy focus — CL-CP-002, Recertification Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator / Director of Nursing ; Generate a recertification tracking report no later than the 40th day of each active certification period, identifying all patients whose certification period ends within the next 20 days. Confirm that each patient has a recertification assessment scheduled and an assigned clinician. ; No later than Day 40 of each certification period. ; ; 6.3.2 ; Assigned RN ; Conduct the comprehensive recertification assessment between Day 56 and Day 60 of the current certification period (5-day assessment window), in compliance with CMS OASIS timing requirements and policy CL-CA-004. Complete all required OASIS data elements for.",
      "Apply the controlled requirements to the three visible objects in the scene for translate comprehensive-assessment findings into an individualized plan. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the closed care-plan folder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Care-plan Folder", detail: "Review the closed care-plan folder for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "stethoscope-1-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 23, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the stethoscope as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the closed care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with closed care-plan folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the closed care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with closed care-plan folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the stethoscope as the complete assessment and do not compare the closed care-plan folder, patient report, or current record. This identify option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for translate comprehensive-assessment findings into an individualized plan." },
          { id: "i3", label: "Carry forward the prior visit conclusion for translate comprehensive-assessment findings into an individualized plan without reassessing the patient today. This identify option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the stethoscope alone and seek clarification only after the intervention is complete. This decide option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Defer the concern in the stethoscope to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during translate comprehensive-assessment findings into an individualized plan." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the stethoscope was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Keep the stethoscope decision in personal notes rather than the governed patient record. This document option concerns stethoscope during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for translate comprehensive-assessment findings into an individualized plan." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the closed care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the closed care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with closed care-plan folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "closed-care-plan-folder-1-2", label: "closed care-plan folder", shortLabel: "closed care-plan folder", ariaLabel: "Investigate closed care-plan folder",        x: 30, y: 70, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the closed care-plan folder as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed care-plan folder, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed care-plan folder as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed care-plan folder, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed care-plan folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for translate comprehensive-assessment findings into an individualized plan." },
          { id: "i3", label: "Dismiss the conflict between the closed care-plan folder and pulse oximeter because one source appears more convenient. This identify option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed care-plan folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed care-plan folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed care-plan folder without confirming an applicable order and patient-specific authority. This decide option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed care-plan folder is resolved." },
          { id: "d3", label: "Hand the closed care-plan folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during translate comprehensive-assessment findings into an individualized plan." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For closed care-plan folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For closed care-plan folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed care-plan folder before reassessment confirms the patient response. This document option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed care-plan folder." },
          { id: "doc3", label: "Copy the prior translate comprehensive-assessment findings into an individualized plan narrative even though today’s closed care-plan folder evidence is different. This document option concerns closed care-plan folder during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for translate comprehensive-assessment findings into an individualized plan." },
        ],
        feedback: {
          observed: "Observe the closed care-plan folder as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed care-plan folder as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed care-plan folder, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed care-plan folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For closed care-plan folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "pulse-oximeter-1-3", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the pulse oximeter as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pulse oximeter and omit the related change, symptom, or safety cue. This identify option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for translate comprehensive-assessment findings into an individualized plan." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pulse oximeter stand in for direct RN assessment. This identify option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pulse oximeter issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for translate comprehensive-assessment findings into an individualized plan instead of the current controlled clinical pathway. This decide option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during translate comprehensive-assessment findings into an individualized plan." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pulse oximeter and omit the discrepancy with stethoscope. This document option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Combine the pulse oximeter issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pulse oximeter during translate comprehensive-assessment findings into an individualized plan.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for translate comprehensive-assessment findings into an individualized plan." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for translate comprehensive-assessment findings into an individualized plan. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for translate comprehensive-assessment findings into an individualized plan, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for translate comprehensive-assessment findings into an individualized plan. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Require",
    title: "Required plan-of-care elements and CMS-485-equivalent content",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for required plan-of-care elements and cms-485-equivalent content within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-001, CL-CA-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CP-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Primary regulatory basis for plan of care requirements ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Defines required elements of the plan of care ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the physician-approved plan of care ; ; 42 CFR § 424.22 ; Requirements for home health services — plan of care and certifying physician ; Defines physician certification requirements for Medicare billing ; ; 42 CFR § 409.42 ; Skilled nursing.",
      "Controlled-policy focus — CL-CA-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Comprehensive Assessment ; The full, multidimensional clinical assessment of a home health patient required by 42 CFR § 484.55, incorporating all required OASIS data elements and all clinical domains specified in this policy. Only a registered nurse may complete this assessment. ; ; OASIS (Outcome and Assessment Information Set) ; The standardized data collection instrument mandated by CMS for Medicare-certified home health agencies, used to measure patient outcomes and clinical characteristics and to inform PDGM payment classification. The current version is OASIS-E2. ; ; OASIS Assessment Time Points ; The specific clinical events that trigger a required OASIS assessment: Start of Care (SOC), Resumption of Care (ROC), Recertification (RECERT), Follow-Up.",
      "Apply the controlled requirements to the three visible objects in the scene for required plan-of-care elements and cms-485-equivalent content. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Care Folder", detail: "Review the care folder for the patient-specific finding. Reconcile it with the medication organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Medication Organizer", detail: "Review the medication organizer for the patient-specific finding. Reconcile it with the oxygen tubing coil, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Oxygen Tubing Coil", detail: "Review the oxygen tubing coil for the patient-specific finding. Reconcile it with the care folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "care-folder-2-1", label: "care folder", shortLabel: "care folder", ariaLabel: "Investigate care folder",        x: 14, y: 58, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the care folder as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care folder, compare the visible evidence with medication organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the care folder as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care folder, compare the visible evidence with medication organizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the care folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for required plan-of-care elements and cms-485-equivalent content." },
          { id: "i3", label: "Dismiss the conflict between the care folder and medication organizer because one source appears more convenient. This identify option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about care folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the care folder without confirming an applicable order and patient-specific authority. This decide option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for care folder is resolved." },
          { id: "d3", label: "Hand the care folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during required plan-of-care elements and cms-485-equivalent content." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For care folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For care folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the care folder before reassessment confirms the patient response. This document option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of care folder." },
          { id: "doc3", label: "Copy the prior required plan-of-care elements and cms-485-equivalent content narrative even though today’s care folder evidence is different. This document option concerns care folder during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for required plan-of-care elements and cms-485-equivalent content." },
        ],
        feedback: {
          observed: "Observe the care folder as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the care folder as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care folder, compare the visible evidence with medication organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For care folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "medication-organizer-2-2", label: "medication organizer", shortLabel: "medication organizer", ariaLabel: "Investigate medication organizer",        x: 35, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the medication organizer as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the oxygen tubing coil, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with oxygen tubing coil and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication organizer as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the oxygen tubing coil, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with oxygen tubing coil and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the medication organizer and omit the related change, symptom, or safety cue. This identify option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for required plan-of-care elements and cms-485-equivalent content." },
          { id: "i3", label: "Let a blank, unreadable, or unverified medication organizer stand in for direct RN assessment. This identify option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the medication organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication organizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for required plan-of-care elements and cms-485-equivalent content instead of the current controlled clinical pathway. This decide option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during required plan-of-care elements and cms-485-equivalent content." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For medication organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For medication organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the medication organizer and omit the discrepancy with oxygen tubing coil. This document option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication organizer." },
          { id: "doc3", label: "Combine the medication organizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns medication organizer during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for required plan-of-care elements and cms-485-equivalent content." },
        ],
        feedback: {
          observed: "Observe the medication organizer as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the oxygen tubing coil, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication organizer as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the oxygen tubing coil, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with oxygen tubing coil and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For medication organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "oxygen-tubing-coil-2-3", label: "oxygen tubing coil", shortLabel: "oxygen tubing coil", ariaLabel: "Investigate oxygen tubing coil",        x: 84, y: 65, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the oxygen tubing coil as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the care folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing coil, compare the visible evidence with care folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the oxygen tubing coil as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the care folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing coil, compare the visible evidence with care folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the oxygen tubing coil as the complete assessment and do not compare the care folder, patient report, or current record. This identify option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for required plan-of-care elements and cms-485-equivalent content." },
          { id: "i3", label: "Carry forward the prior visit conclusion for required plan-of-care elements and cms-485-equivalent content without reassessing the patient today. This identify option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about oxygen tubing coil." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing coil; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing coil; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the oxygen tubing coil alone and seek clarification only after the intervention is complete. This decide option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for oxygen tubing coil is resolved." },
          { id: "d3", label: "Defer the concern in the oxygen tubing coil to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during required plan-of-care elements and cms-485-equivalent content." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For oxygen tubing coil, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For oxygen tubing coil, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the oxygen tubing coil was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of oxygen tubing coil." },
          { id: "doc3", label: "Keep the oxygen tubing coil decision in personal notes rather than the governed patient record. This document option concerns oxygen tubing coil during required plan-of-care elements and cms-485-equivalent content.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for required plan-of-care elements and cms-485-equivalent content." },
        ],
        feedback: {
          observed: "Observe the oxygen tubing coil as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the care folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the oxygen tubing coil as patient-specific evidence for required plan-of-care elements and cms-485-equivalent content. Compare it with the care folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for required plan-of-care elements and cms-485-equivalent content, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing coil, compare the visible evidence with care folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing coil; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for required plan-of-care elements and cms-485-equivalent content. For oxygen tubing coil, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Discipl",
    title: "Disciplines, visit frequency, duration, interventions, and measurable goals",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for disciplines, visit frequency, duration, interventions, and measurable goals within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-001, CL-CP-002, CL-CA-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-CP-002, LUPA Risk Monitoring Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing / Clinical Coordinator ; During the 30-day plan of care review, cross-reference each patient's delivered visit count against the PDGM minimum visit threshold for their payment category. Flag any patient at risk of a LUPA (defined as fewer than the required minimum visits with fewer than 10 days remaining in the certification period) for immediate clinical review. ; At each 30-day review; also triggered by daily visit delivery report review. ; ; 6.5.2 ; Director of Nursing ; For patients flagged as LUPA-at-risk, assess whether: (a) the clinical plan supports additional visits within the remaining episode timeframe; (b).",
      "Controlled-policy focus — CL-CA-001, 4\\. Policy Statement. 4.1 A comprehensive patient assessment shall be completed by a qualified registered nurse at the Start of Care visit and at all subsequent applicable OASIS time points. The comprehensive assessment shall begin at the time of the first billable visit — the SOC visit — and shall be completed at the patient's home. 4.2 Only a registered nurse currently licensed by the California Board of Registered Nursing and meeting the assessment competency requirements of this policy may complete a comprehensive assessment for home health patients. Licensed vocational nurses, therapists, and other clinical disciplines shall not complete comprehensive assessments or OASIS assessments independently, regardless of the clinical services they provide. 4.3 The comprehensive assessment shall be completed within 5.",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Apply the controlled requirements to the three visible objects in the scene for disciplines, visit frequency, duration, interventions, and measurable goals. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Resistance Band", detail: "Review the resistance band for the patient-specific finding. Reconcile it with the nursing bag, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Nursing Bag", detail: "Review the nursing bag for the patient-specific finding. Reconcile it with the goal cards, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Goal Cards", detail: "Review the goal cards for the patient-specific finding. Reconcile it with the resistance band, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "resistance-band-3-1", label: "resistance band", shortLabel: "resistance band", ariaLabel: "Investigate resistance band",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the resistance band as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For resistance band, compare the visible evidence with nursing bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the resistance band as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For resistance band, compare the visible evidence with nursing bag and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the resistance band and omit the related change, symptom, or safety cue. This identify option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for disciplines, visit frequency, duration, interventions, and measurable goals." },
          { id: "i3", label: "Let a blank, unreadable, or unverified resistance band stand in for direct RN assessment. This identify option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about resistance band." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to resistance band; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to resistance band; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the resistance band issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for resistance band is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for disciplines, visit frequency, duration, interventions, and measurable goals instead of the current controlled clinical pathway. This decide option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For resistance band, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For resistance band, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the resistance band and omit the discrepancy with nursing bag. This document option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of resistance band." },
          { id: "doc3", label: "Combine the resistance band issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns resistance band during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        feedback: {
          observed: "Observe the resistance band as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the resistance band as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For resistance band, compare the visible evidence with nursing bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to resistance band; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For resistance band, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "nursing-bag-3-2", label: "nursing bag", shortLabel: "nursing bag", ariaLabel: "Investigate nursing bag",        x: 55, y: 70, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the nursing bag as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with goal cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nursing bag as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with goal cards and the controlling source before classifying status." },
          { id: "i2", label: "Treat the nursing bag as the complete assessment and do not compare the goal cards, patient report, or current record. This identify option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for disciplines, visit frequency, duration, interventions, and measurable goals." },
          { id: "i3", label: "Carry forward the prior visit conclusion for disciplines, visit frequency, duration, interventions, and measurable goals without reassessing the patient today. This identify option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nursing bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the nursing bag alone and seek clarification only after the intervention is complete. This decide option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nursing bag is resolved." },
          { id: "d3", label: "Defer the concern in the nursing bag to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For nursing bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For nursing bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the nursing bag was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nursing bag." },
          { id: "doc3", label: "Keep the nursing bag decision in personal notes rather than the governed patient record. This document option concerns nursing bag during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        feedback: {
          observed: "Observe the nursing bag as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nursing bag as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with goal cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For nursing bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "goal-cards-3-3", label: "goal cards", shortLabel: "goal cards", ariaLabel: "Investigate goal cards",        x: 81, y: 40, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the goal cards as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the resistance band, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with resistance band and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the goal cards as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the resistance band, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with resistance band and the controlling source before classifying status." },
          { id: "i2", label: "Assume the goal cards establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for disciplines, visit frequency, duration, interventions, and measurable goals." },
          { id: "i3", label: "Dismiss the conflict between the goal cards and resistance band because one source appears more convenient. This identify option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about goal cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the goal cards without confirming an applicable order and patient-specific authority. This decide option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for goal cards is resolved." },
          { id: "d3", label: "Hand the goal cards concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For goal cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For goal cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the goal cards before reassessment confirms the patient response. This document option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of goal cards." },
          { id: "doc3", label: "Copy the prior disciplines, visit frequency, duration, interventions, and measurable goals narrative even though today’s goal cards evidence is different. This document option concerns goal cards during disciplines, visit frequency, duration, interventions, and measurable goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for disciplines, visit frequency, duration, interventions, and measurable goals." },
        ],
        feedback: {
          observed: "Observe the goal cards as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the resistance band, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the goal cards as patient-specific evidence for disciplines, visit frequency, duration, interventions, and measurable goals. Compare it with the resistance band, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for disciplines, visit frequency, duration, interventions, and measurable goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with resistance band and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for disciplines, visit frequency, duration, interventions, and measurable goals. For goal cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Medicat",
    title: "Medication, treatment, safety, education, and emergency instructions",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for medication, treatment, safety, education, and emergency instructions within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-003, CL-CA-001, CL-CP-004, CL-CP-001, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-003, Emergency Orders. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Clinician at the Patient's Home ; In a clinical emergency where immediate action is required to protect the patient's safety and the treating clinician determines that a service is clinically necessary before a physician order can be obtained, the clinician may take the minimum clinical action necessary to stabilize the patient. ; Immediately as clinically required. ; ; 6.4.2 ; Clinician at the Patient's Home ; Simultaneously with or immediately following the emergency action, contact the physician (or covering physician or on-call physician) to report the situation and obtain a verbal order ratifying the action taken. If no physician is available.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CP-004, Verbal Order Receipt — Read-Back Protocol. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Receiving RN / LVN ; When a physician or allowed practitioner communicates a verbal order, the clinician shall prepare to document the order before acknowledging receipt. If the order is received by telephone, ensure the call environment allows for accurate listening and documentation. Never accept a verbal order in a setting where the order cannot be clearly heard or transcribed. ; Immediately upon receipt of the verbal communication. ; ; 6.1.2 ; Receiving RN / LVN ; Record the order as communicated on paper or directly in the EHR. The transcription shall include at minimum: (a) the date and time of.",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Controlled-policy focus — CL-CP-002, 4\\. Policy Statement. 4.1 The plan of care for every active patient shall be formally reviewed by the responsible registered nurse at a minimum of every 30 calendar days during the certification period, regardless of whether a change is indicated. 4.2 The plan of care shall be comprehensively reviewed and updated at each recertification period — no later than every 60 calendar days — and the updated plan of care shall be transmitted to and signed by the certifying physician within the recertification timeline defined in policy CL-CP-008. 4.3 A plan of care modification shall be initiated within 24 hours whenever any of the following significant change conditions are identified: (a) a new diagnosis or significant worsening of an existing diagnosis.",
      "Apply the controlled requirements to the three visible objects in the scene for medication, treatment, safety, education, and emergency instructions. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the shower chair, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Shower Chair", detail: "Review the shower chair for the patient-specific finding. Reconcile it with the oxygen tubing safely coiled, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Oxygen Tubing Safely Coiled", detail: "Review the oxygen tubing safely coiled for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "pill-organizer-4-1", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 14, y: 38, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the pill organizer as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with shower chair and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with shower chair and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pill organizer as the complete assessment and do not compare the shower chair, patient report, or current record. This identify option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, treatment, safety, education, and emergency instructions." },
          { id: "i3", label: "Carry forward the prior visit conclusion for medication, treatment, safety, education, and emergency instructions without reassessing the patient today. This identify option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pill organizer alone and seek clarification only after the intervention is complete. This decide option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Defer the concern in the pill organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, treatment, safety, education, and emergency instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pill organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Keep the pill organizer decision in personal notes rather than the governed patient record. This document option concerns pill organizer during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, treatment, safety, education, and emergency instructions." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with shower chair and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "shower-chair-4-2", label: "shower chair", shortLabel: "shower chair", ariaLabel: "Investigate shower chair",        x: 34, y: 42, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the shower chair as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the oxygen tubing safely coiled, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with oxygen tubing safely coiled and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the shower chair as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the oxygen tubing safely coiled, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with oxygen tubing safely coiled and the controlling source before classifying status." },
          { id: "i2", label: "Assume the shower chair establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, treatment, safety, education, and emergency instructions." },
          { id: "i3", label: "Dismiss the conflict between the shower chair and oxygen tubing safely coiled because one source appears more convenient. This identify option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about shower chair." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the shower chair without confirming an applicable order and patient-specific authority. This decide option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for shower chair is resolved." },
          { id: "d3", label: "Hand the shower chair concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, treatment, safety, education, and emergency instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For shower chair, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For shower chair, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the shower chair before reassessment confirms the patient response. This document option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of shower chair." },
          { id: "doc3", label: "Copy the prior medication, treatment, safety, education, and emergency instructions narrative even though today’s shower chair evidence is different. This document option concerns shower chair during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, treatment, safety, education, and emergency instructions." },
        ],
        feedback: {
          observed: "Observe the shower chair as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the oxygen tubing safely coiled, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the shower chair as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the oxygen tubing safely coiled, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with oxygen tubing safely coiled and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For shower chair, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "oxygen-tubing-safely-coiled-4-3", label: "oxygen tubing safely coiled", shortLabel: "oxygen tubing safely coiled", ariaLabel: "Investigate oxygen tubing safely coiled",        x: 76, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the oxygen tubing safely coiled as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing safely coiled, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the oxygen tubing safely coiled as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing safely coiled, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the oxygen tubing safely coiled and omit the related change, symptom, or safety cue. This identify option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, treatment, safety, education, and emergency instructions." },
          { id: "i3", label: "Let a blank, unreadable, or unverified oxygen tubing safely coiled stand in for direct RN assessment. This identify option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about oxygen tubing safely coiled." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing safely coiled; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing safely coiled; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the oxygen tubing safely coiled issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for oxygen tubing safely coiled is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for medication, treatment, safety, education, and emergency instructions instead of the current controlled clinical pathway. This decide option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, treatment, safety, education, and emergency instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For oxygen tubing safely coiled, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For oxygen tubing safely coiled, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the oxygen tubing safely coiled and omit the discrepancy with pill organizer. This document option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of oxygen tubing safely coiled." },
          { id: "doc3", label: "Combine the oxygen tubing safely coiled issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns oxygen tubing safely coiled during medication, treatment, safety, education, and emergency instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, treatment, safety, education, and emergency instructions." },
        ],
        feedback: {
          observed: "Observe the oxygen tubing safely coiled as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the oxygen tubing safely coiled as patient-specific evidence for medication, treatment, safety, education, and emergency instructions. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, treatment, safety, education, and emergency instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For oxygen tubing safely coiled, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to oxygen tubing safely coiled; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, treatment, safety, education, and emergency instructions. For oxygen tubing safely coiled, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Provide",
    title: "Provider orders, verbal-order read-back, authentication, and signature tracking",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for provider orders, verbal-order read-back, authentication, and signature tracking within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-004, CL-CP-003, CL-CP-009, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-004, Authentication Tracking and Follow-Up. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator ; Enter every new verbal order into the Verbal Order Authentication Tracking System (per CL-CP-009) at the time of documentation, including: (a) the verbal order date; (b) the patient name and MR#; (c) the ordering physician and contact information; (d) the authentication deadline (7 calendar days from verbal order date); (e) the clinician who received the order; (f) the transmission method and date. ; Within 24 hours of verbal order documentation. ; ; 6.3.2 ; Clinical Coordinator ; On Day 5 from the verbal order date, if authentication has not been received, initiate the first follow-up contact with the.",
      "Controlled-policy focus — CL-CP-003, Obtaining Physician Orders — General Requirements. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN / Clinical Discipline ; Before providing any new service, treatment, medication, or clinical intervention that is not already covered by a current active physician order, contact the ordering physician or allowed practitioner to obtain an order. Verbal orders are acceptable where a written order cannot be obtained in advance, per policy CL-CP-004. ; Before service is rendered. ; ; 6.1.2 ; Assigned RN ; Verify that the individual issuing the order is: (a) a licensed physician, NP, CNS, or PA legally authorized to practice in California; (b) not on the OIG exclusion list (verified at the time of initial.",
      "Controlled-policy focus — CL-CP-004, LVN Limitations on Verbal Orders. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; LVNs at Care Indeed Home Health Care, Inc. may receive and transcribe verbal orders only for: (a) changes to existing medication orders (dose adjustments, discontinuations) that have been directly communicated by the physician; (b) orders for routine treatments within the LVN's scope of practice. LVNs shall not receive verbal orders for new medications, new skilled services, changes in the plan of care, or orders that require clinical judgment beyond the LVN scope. ; Ongoing; enforced through orientation training. ; ; 6.4.2 ; LVN Receiving a Verbal Order ; If an LVN receives a verbal order that appears.",
      "Controlled-policy focus — CL-CP-004, Verbal Order Receipt — Read-Back Protocol. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Receiving RN / LVN ; When a physician or allowed practitioner communicates a verbal order, the clinician shall prepare to document the order before acknowledging receipt. If the order is received by telephone, ensure the call environment allows for accurate listening and documentation. Never accept a verbal order in a setting where the order cannot be clearly heard or transcribed. ; Immediately upon receipt of the verbal communication. ; ; 6.1.2 ; Receiving RN / LVN ; Record the order as communicated on paper or directly in the EHR. The transcription shall include at minimum: (a) the date and time of.",
      "Controlled-policy focus — CL-CP-009, 4\\. Policy Statement. 4.1 The agency shall maintain a centralized Physician Order Signature Tracking System (the \"Tracking System\") that captures every document requiring a physician signature from the date of transmission through the date of receipt and filing. 4.2 Every document requiring a physician signature shall be entered into the Tracking System at the time of transmission to the physician's office, including: (a) the document type (initial POC, recertification POC, verbal order authentication, change order); (b) the patient's name and medical record number; (c) the physician's name, NPI, and contact information; (d) the date of transmission; (e) the method of transmission (fax, secure portal, mail, hand-delivery); (f) the signature deadline (based on document type); (g) the status (pending, follow-up initiated, received.",
      "Apply the controlled requirements to the three visible objects in the scene for provider orders, verbal-order read-back, authentication, and signature tracking. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the order pad, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Order Pad", detail: "Review the order pad for the patient-specific finding. Reconcile it with the pen, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pen", detail: "Review the pen for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "phone-5-1", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 23, y: 46, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the phone as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the order pad, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with order pad and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the order pad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with order pad and the controlling source before classifying status." },
          { id: "i2", label: "Assume the phone establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for provider orders, verbal-order read-back, authentication, and signature tracking." },
          { id: "i3", label: "Dismiss the conflict between the phone and order pad because one source appears more convenient. This identify option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the phone without confirming an applicable order and patient-specific authority. This decide option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Hand the phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the phone before reassessment confirms the patient response. This document option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Copy the prior provider orders, verbal-order read-back, authentication, and signature tracking narrative even though today’s phone evidence is different. This document option concerns phone during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the order pad, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the order pad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with order pad and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "order-pad-5-2", label: "order pad", shortLabel: "order pad", ariaLabel: "Investigate order pad",        x: 50, y: 72, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the order pad as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the pen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order pad, compare the visible evidence with pen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the order pad as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the pen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order pad, compare the visible evidence with pen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the order pad and omit the related change, symptom, or safety cue. This identify option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for provider orders, verbal-order read-back, authentication, and signature tracking." },
          { id: "i3", label: "Let a blank, unreadable, or unverified order pad stand in for direct RN assessment. This identify option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about order pad." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order pad; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order pad; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the order pad issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for order pad is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for provider orders, verbal-order read-back, authentication, and signature tracking instead of the current controlled clinical pathway. This decide option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For order pad, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For order pad, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the order pad and omit the discrepancy with pen. This document option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of order pad." },
          { id: "doc3", label: "Combine the order pad issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns order pad during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        feedback: {
          observed: "Observe the order pad as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the pen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the order pad as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the pen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order pad, compare the visible evidence with pen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order pad; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For order pad, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "pen-5-3", label: "pen", shortLabel: "pen", ariaLabel: "Investigate pen",        x: 82, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the pen as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pen, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pen as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pen, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pen as the complete assessment and do not compare the phone, patient report, or current record. This identify option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for provider orders, verbal-order read-back, authentication, and signature tracking." },
          { id: "i3", label: "Carry forward the prior visit conclusion for provider orders, verbal-order read-back, authentication, and signature tracking without reassessing the patient today. This identify option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pen alone and seek clarification only after the intervention is complete. This decide option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pen is resolved." },
          { id: "d3", label: "Defer the concern in the pen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For pen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For pen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pen." },
          { id: "doc3", label: "Keep the pen decision in personal notes rather than the governed patient record. This document option concerns pen during provider orders, verbal-order read-back, authentication, and signature tracking.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for provider orders, verbal-order read-back, authentication, and signature tracking." },
        ],
        feedback: {
          observed: "Observe the pen as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pen as patient-specific evidence for provider orders, verbal-order read-back, authentication, and signature tracking. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for provider orders, verbal-order read-back, authentication, and signature tracking, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pen, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for provider orders, verbal-order read-back, authentication, and signature tracking. For pen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Review",
    title: "Review, update, recertification, and interdisciplinary coordination",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for review, update, recertification, and interdisciplinary coordination within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-002, CL-CP-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Recertification Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator / Director of Nursing ; Generate a recertification tracking report no later than the 40th day of each active certification period, identifying all patients whose certification period ends within the next 20 days. Confirm that each patient has a recertification assessment scheduled and an assigned clinician. ; No later than Day 40 of each certification period. ; ; 6.3.2 ; Assigned RN ; Conduct the comprehensive recertification assessment between Day 56 and Day 60 of the current certification period (5-day assessment window), in compliance with CMS OASIS timing requirements and policy CL-CA-004. Complete all required OASIS data elements for.",
      "Controlled-policy focus — CL-CP-002, Routine 30-Day Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Conduct a formal plan of care review at a minimum of every 30 calendar days during each certification period. The review shall assess: (a) the patient's current clinical status compared to the status at SOC or last review; (b) progress toward each short-term and long-term goal — with specific measurable notation of progress, plateau, or regression; (c) whether the current service type and frequency remain appropriate; (d) whether any new diagnosis, medication change, or functional change has occurred that requires a plan modification; (e) whether the patient is on track for discharge within the anticipated episode timeframe; (f).",
      "Controlled-policy focus — CL-CP-008, Recertification Assessment and Plan of Care Transmission. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Conduct the recertification assessment between Day 56 and Day 60 of the current certification period per CL-CA-004. Complete all required OASIS data elements for the recertification time point. ; Between Day 56 and Day 60. ; ; 6.2.2 ; Assigned RN ; Based on the recertification assessment, develop the updated plan of care for the subsequent certification period per CL-CP-002, Section 6.3. The recertification plan of care shall include: (a) updated diagnoses; (b) updated functional status; (c) updated goals; (d) updated service types and frequencies; (e) updated medication list; (f) recertification narrative justifying continued skilled services and homebound.",
      "Controlled-policy focus — CL-CP-008, Recertification Tracking and Alerting. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Clinical Coordinator ; Maintain the Recertification Tracking System with the following data for each active patient: (a) certification period start date; (b) certification period end date (Day 60); (c) Day 56 date (recertification assessment window opens); (d) assigned RN; (e) recertification assessment status (not started, scheduled, completed); (f) date recertification plan of care transmitted to physician; (g) physician signature status (pending, received, overdue). ; Updated continuously; reviewed at minimum weekly. ; ; 6.1.2 ; Clinical Coordinator ; Generate a Recertification Due Report no later than Day 40 of each active certification period, listing all patients whose certification period ends within the.",
      "Controlled-policy focus — CL-CP-008, Recertification Documentation and Filing. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Medical Records ; Upon receipt of the physician-signed recertification, verify that: (a) the physician's signature is present and dated; (b) the signature date covers the applicable certification period; (c) the physician name and NPI are legible or accompanied by a printed name; (d) the recertification covers all ordered services. If any element is deficient, return to the physician for correction before filing. ; Within 3 calendar days of receipt. ; ; 6.4.2 ; Medical Records / Clinical Coordinator ; Update the Recertification Tracking System to reflect receipt of the signed recertification, the physician's signature date, and the date filed in the.",
      "Apply the controlled requirements to the three visible objects in the scene for review, update, recertification, and interdisciplinary coordination. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Plan Binder", detail: "Review the plan binder for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the neutral revision tabs without writing, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Neutral Revision Tabs Without Writing", detail: "Review the neutral revision tabs without writing for the patient-specific finding. Reconcile it with the plan binder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "plan-binder-6-1", label: "plan binder", shortLabel: "plan binder", ariaLabel: "Investigate plan binder",        x: 14, y: 63, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the plan binder as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the plan binder as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the plan binder and omit the related change, symptom, or safety cue. This identify option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for review, update, recertification, and interdisciplinary coordination." },
          { id: "i3", label: "Let a blank, unreadable, or unverified plan binder stand in for direct RN assessment. This identify option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about plan binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the plan binder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for plan binder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for review, update, recertification, and interdisciplinary coordination instead of the current controlled clinical pathway. This decide option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during review, update, recertification, and interdisciplinary coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For plan binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For plan binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the plan binder and omit the discrepancy with stethoscope. This document option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of plan binder." },
          { id: "doc3", label: "Combine the plan binder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns plan binder during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and interdisciplinary coordination." },
        ],
        feedback: {
          observed: "Observe the plan binder as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the plan binder as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For plan binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "stethoscope-6-2", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 38, y: 40, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the stethoscope as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the neutral revision tabs without writing, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with neutral revision tabs without writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the neutral revision tabs without writing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with neutral revision tabs without writing and the controlling source before classifying status." },
          { id: "i2", label: "Treat the stethoscope as the complete assessment and do not compare the neutral revision tabs without writing, patient report, or current record. This identify option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for review, update, recertification, and interdisciplinary coordination." },
          { id: "i3", label: "Carry forward the prior visit conclusion for review, update, recertification, and interdisciplinary coordination without reassessing the patient today. This identify option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the stethoscope alone and seek clarification only after the intervention is complete. This decide option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Defer the concern in the stethoscope to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during review, update, recertification, and interdisciplinary coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the stethoscope was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Keep the stethoscope decision in personal notes rather than the governed patient record. This document option concerns stethoscope during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and interdisciplinary coordination." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the neutral revision tabs without writing, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the neutral revision tabs without writing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with neutral revision tabs without writing and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "neutral-revision-tabs-without-writing-6-3", label: "neutral revision tabs without writing", shortLabel: "neutral revision tabs without", ariaLabel: "Investigate neutral revision tabs without writing",        x: 78, y: 56, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the neutral revision tabs without writing as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral revision tabs without writing, compare the visible evidence with plan binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the neutral revision tabs without writing as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral revision tabs without writing, compare the visible evidence with plan binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the neutral revision tabs without writing establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for review, update, recertification, and interdisciplinary coordination." },
          { id: "i3", label: "Dismiss the conflict between the neutral revision tabs without writing and plan binder because one source appears more convenient. This identify option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about neutral revision tabs without writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral revision tabs without writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral revision tabs without writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the neutral revision tabs without writing without confirming an applicable order and patient-specific authority. This decide option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for neutral revision tabs without writing is resolved." },
          { id: "d3", label: "Hand the neutral revision tabs without writing concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during review, update, recertification, and interdisciplinary coordination." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For neutral revision tabs without writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For neutral revision tabs without writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the neutral revision tabs without writing before reassessment confirms the patient response. This document option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of neutral revision tabs without writing." },
          { id: "doc3", label: "Copy the prior review, update, recertification, and interdisciplinary coordination narrative even though today’s neutral revision tabs without writing evidence is different. This document option concerns neutral revision tabs without writing during review, update, recertification, and interdisciplinary coordination.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and interdisciplinary coordination." },
        ],
        feedback: {
          observed: "Observe the neutral revision tabs without writing as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the neutral revision tabs without writing as patient-specific evidence for review, update, recertification, and interdisciplinary coordination. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for review, update, recertification, and interdisciplinary coordination, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral revision tabs without writing, compare the visible evidence with plan binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral revision tabs without writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for review, update, recertification, and interdisciplinary coordination. For neutral revision tabs without writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Impleme",
    title: "Implementation audit, variances, closed-loop follow-through, and competency boundary",
    subtitle: "Plan of Care Development & CMS-485",
    narration: [
      "This lesson develops registered-nurse reasoning for implementation audit, variances, closed-loop follow-through, and competency boundary within Plan of Care Development & CMS-485. Use the current controlled requirements in CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-001. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-002, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-002. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-003, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-003. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-004, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-004. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-008, What Surveyors and Auditors Will Look For. CMS surveyors will request clinical records and verify that a physician-signed recertification exists for every certification period in the survey look-back period. They will cross-reference certification period dates with recertification signature dates and identify any gaps. ADR auditors from the MAC will specifically deny claims where the recertification is missing, unsigned, undated, or dated outside the applicable certification period. The recertification is one of the most frequently audited Medicare home health documentation elements..",
      "Apply the controlled requirements to the three visible objects in the scene for implementation audit, variances, closed-loop follow-through, and competency boundary. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Care Binder", detail: "Review the care binder for the patient-specific finding. Reconcile it with the neutral checklist tabs, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Neutral Checklist Tabs", detail: "Review the neutral checklist tabs for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the care binder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "care-binder-7-1", label: "care binder", shortLabel: "care binder", ariaLabel: "Investigate care binder",        x: 20, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the care binder as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the neutral checklist tabs, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with neutral checklist tabs and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the care binder as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the neutral checklist tabs, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with neutral checklist tabs and the controlling source before classifying status." },
          { id: "i2", label: "Treat the care binder as the complete assessment and do not compare the neutral checklist tabs, patient report, or current record. This identify option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for implementation audit, variances, closed-loop follow-through, and competency boundary." },
          { id: "i3", label: "Carry forward the prior visit conclusion for implementation audit, variances, closed-loop follow-through, and competency boundary without reassessing the patient today. This identify option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about care binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the care binder alone and seek clarification only after the intervention is complete. This decide option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for care binder is resolved." },
          { id: "d3", label: "Defer the concern in the care binder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For care binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For care binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the care binder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of care binder." },
          { id: "doc3", label: "Keep the care binder decision in personal notes rather than the governed patient record. This document option concerns care binder during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the care binder as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the neutral checklist tabs, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the care binder as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the neutral checklist tabs, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with neutral checklist tabs and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For care binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "neutral-checklist-tabs-7-2", label: "neutral checklist tabs", shortLabel: "neutral checklist tabs", ariaLabel: "Investigate neutral checklist tabs",        x: 53, y: 70, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the neutral checklist tabs as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral checklist tabs, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the neutral checklist tabs as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral checklist tabs, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the neutral checklist tabs establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for implementation audit, variances, closed-loop follow-through, and competency boundary." },
          { id: "i3", label: "Dismiss the conflict between the neutral checklist tabs and phone because one source appears more convenient. This identify option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about neutral checklist tabs." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral checklist tabs; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral checklist tabs; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the neutral checklist tabs without confirming an applicable order and patient-specific authority. This decide option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for neutral checklist tabs is resolved." },
          { id: "d3", label: "Hand the neutral checklist tabs concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For neutral checklist tabs, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For neutral checklist tabs, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the neutral checklist tabs before reassessment confirms the patient response. This document option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of neutral checklist tabs." },
          { id: "doc3", label: "Copy the prior implementation audit, variances, closed-loop follow-through, and competency boundary narrative even though today’s neutral checklist tabs evidence is different. This document option concerns neutral checklist tabs during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the neutral checklist tabs as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the neutral checklist tabs as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral checklist tabs, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral checklist tabs; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For neutral checklist tabs, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "phone-7-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 82, y: 46, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the phone as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with care binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with care binder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for implementation audit, variances, closed-loop follow-through, and competency boundary." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for implementation audit, variances, closed-loop follow-through, and competency boundary instead of the current controlled clinical pathway. This decide option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with care binder. This document option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during implementation audit, variances, closed-loop follow-through, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation audit, variances, closed-loop follow-through, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for implementation audit, variances, closed-loop follow-through, and competency boundary. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for implementation audit, variances, closed-loop follow-through, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with care binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for implementation audit, variances, closed-loop follow-through, and competency boundary. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","CL-CA-001","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During translate comprehensive-assessment findings into an individualized plan, the pulse oximeter conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the pulse oximeter alone and seek clarification only after the intervention is complete. This option concerns translate comprehensive-assessment findings into an individualized plan.",
      "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during translate comprehensive-assessment findings into an individualized plan.",
      "Defer the concern in the pulse oximeter to the next routine visit even though its current clinical significance has not been assessed. This option concerns translate comprehensive-assessment findings into an individualized plan.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for translate comprehensive-assessment findings into an individualized plan within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 2,
    stem: "During required plan-of-care elements and cms-485-equivalent content, the oxygen tubing coil conflicts with the care folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the oxygen tubing coil without confirming an applicable order and patient-specific authority. This option concerns required plan-of-care elements and cms-485-equivalent content.",
      "Assume the care folder is unchanged from the prior encounter and omit patient-specific reassessment during required plan-of-care elements and cms-485-equivalent content.",
      "Hand the oxygen tubing coil concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns required plan-of-care elements and cms-485-equivalent content.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for required plan-of-care elements and cms-485-equivalent content within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 3,
    stem: "During disciplines, visit frequency, duration, interventions, and measurable goals, the goal cards conflicts with the resistance band and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the goal cards issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns disciplines, visit frequency, duration, interventions, and measurable goals.",
      "Use a familiar local shortcut for disciplines, visit frequency, duration, interventions, and measurable goals instead of the current controlled clinical pathway. This option concerns disciplines, visit frequency, duration, interventions, and measurable goals.",
      "Assume the resistance band is unchanged from the prior encounter and omit patient-specific reassessment during disciplines, visit frequency, duration, interventions, and measurable goals.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for disciplines, visit frequency, duration, interventions, and measurable goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 4,
    stem: "During medication, treatment, safety, education, and emergency instructions, the oxygen tubing safely coiled conflicts with the pill organizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the oxygen tubing safely coiled to the next routine visit even though its current clinical significance has not been assessed. This option concerns medication, treatment, safety, education, and emergency instructions.",
      "Assume the pill organizer is unchanged from the prior encounter and omit patient-specific reassessment during medication, treatment, safety, education, and emergency instructions.",
      "Proceed using the oxygen tubing safely coiled alone and seek clarification only after the intervention is complete. This option concerns medication, treatment, safety, education, and emergency instructions.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for medication, treatment, safety, education, and emergency instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 5,
    stem: "During provider orders, verbal-order read-back, authentication, and signature tracking, the pen conflicts with the phone and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the pen concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns provider orders, verbal-order read-back, authentication, and signature tracking.",
      "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the pen without confirming an applicable order and patient-specific authority. This option concerns provider orders, verbal-order read-back, authentication, and signature tracking.",
      "Assume the phone is unchanged from the prior encounter and omit patient-specific reassessment during provider orders, verbal-order read-back, authentication, and signature tracking.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for provider orders, verbal-order read-back, authentication, and signature tracking within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 6,
    stem: "During review, update, recertification, and interdisciplinary coordination, the neutral revision tabs without writing conflicts with the plan binder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the plan binder is unchanged from the prior encounter and omit patient-specific reassessment during review, update, recertification, and interdisciplinary coordination.",
      "Close the neutral revision tabs without writing issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns review, update, recertification, and interdisciplinary coordination.",
      "Use a familiar local shortcut for review, update, recertification, and interdisciplinary coordination instead of the current controlled clinical pathway. This option concerns review, update, recertification, and interdisciplinary coordination.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for review, update, recertification, and interdisciplinary coordination within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 7,
    stem: "During implementation audit, variances, closed-loop follow-through, and competency boundary, the phone conflicts with the care binder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the phone alone and seek clarification only after the intervention is complete. This option concerns implementation audit, variances, closed-loop follow-through, and competency boundary.",
      "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This option concerns implementation audit, variances, closed-loop follow-through, and competency boundary.",
      "Assume the care binder is unchanged from the prior encounter and omit patient-specific reassessment during implementation audit, variances, closed-loop follow-through, and competency boundary.",
      "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for implementation audit, variances, closed-loop follow-through, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-001, CL-CP-002, CL-CP-003, CL-CP-004, CL-CP-008, CL-CP-009, CL-CA-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Plan of Care Development & CMS-485?",
    options: [
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
    ],
    correct: 2,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the care folder and neutral revision tabs without writing into defensible RN practice for Plan of Care Development & CMS-485?",
    options: [
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A familiar device display accepted without technique or context validation.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A verbal assumption that another discipline will address every unresolved issue.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Plan of Care Development & CMS-485 establish?",
    options: [
      "Automatic authority to perform every activity discussed in Plan of Care Development & CMS-485 without supervision.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in Plan of Care Development & CMS-485, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
    ],
    correct: 3,
    rationale: "This module evaluates knowledge; it does not make a credentialing, competency, or authorization decision.",
  },
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
@keyframes lvn002-node-orbit{to{transform:rotate(360deg)}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;font-size:24px;z-index:40}
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
.lvn002-hotspot .tag{background:#fff;padding:5px 9px;border-radius:8px;font-size:11px;font-weight:800;color:#0F5B54;border:1px solid #EEF4F3;box-shadow:0 3px 10px rgba(0,0,0,.08);white-space:normal;letter-spacing:.02em;max-width:160px;line-height:1.15;text-align:center;overflow-wrap:anywhere}
.lvn002-hotspot:not(.done).guided{/* only next incomplete gets guided class */}
.lvn002-hotspot:focus-visible .orb{outline:3px solid #fff;outline-offset:3px;box-shadow:0 0 0 7px rgba(15,91,84,.4)}
.lvn002-drawer-bg{position:absolute;inset:0;z-index:30;background:rgba(15,91,84,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:14px;animation:lvn002-pop .3s cubic-bezier(.16,1,.3,1)}
.lvn002-drawer{width:min(460px,100%);max-height:min(88%,620px);overflow:auto;background:#fff;border-radius:16px;border:2px solid #EEF4F3;box-shadow:0 24px 60px rgba(0,0,0,.22)}
.lvn002-bot{height:80px;background:#fff;border-top:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;gap:12px}
.lvn002-bot button.nav{border:0;background:transparent;color:#64748B;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:4px;min-height:44px;padding:0 8px}
.lvn002-bot button.nav:disabled{opacity:.35;cursor:not-allowed}
.lvn002-bot button.next{background:#B94718;color:#fff;border:0;border-radius:10px;padding:12px 20px;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 14px rgba(242,109,51,.28);min-height:44px;max-width:240px;white-space:normal;text-align:center;justify-content:center;line-height:1.15}
.lvn002-quiz-page{flex:1;min-height:0;overflow:auto;padding:20px;display:flex;justify-content:center}
.lvn002-quiz-card{width:min(760px,100%);animation:lvn002-slide .35s cubic-bezier(.16,1,.3,1)}
@media (max-width:620px){
  .lvn002-work{flex-direction:column;overflow:auto;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;max-width:none;border-radius:12px;border:1px solid #E2E8F0}
  .lvn002-right{min-height:360px}
  .lvn002-left{max-height:42vh}
  .lvn002-top{padding:0 10px;gap:8px}
  .lvn002-tab{padding:8px 10px;font-size:12px}
  .lvn002-bot{padding:0 12px;height:72px}
  .lvn002-hotspot .tag{font-size:10px;max-width:140px;white-space:normal}
}
@media (max-width:420px){
  .lvn002-brand span.brand-text{display:none}
  .lvn002-exit{padding:8px 10px;font-size:11px}
  .lvn002-stage{border-radius:10px}
}

@media (max-width:780px) and (min-width:621px){
  .lvn002-top{height:56px;padding:0 6px;gap:4px}
  .lvn002-brand span.brand-text{display:none}.lvn002-brand{gap:0}
  .lvn002-tabs{gap:2px;overflow:visible}
  .lvn002-tab{flex:1 1 0;min-width:0;padding:4px 3px;font-size:9px;letter-spacing:0;overflow:hidden;text-overflow:clip}
  .lvn002-tab.quiz-tab{font-size:0}.lvn002-tab.quiz-tab:after{content:'Quiz';font-size:9px}
  .lvn002-exit{padding:5px 7px;font-size:9px;min-height:38px}
  .lvn002-work{padding:8px}.lvn002-left{width:40%;min-width:255px;padding:14px}.lvn002-right{padding:6px}
  .lvn002-bot{height:66px;padding:0 8px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;padding:5px}
}

@media (max-width:780px) and (min-width:621px){.rn-key-action-grid{grid-template-columns:1fr!important}}
@media (max-width:420px){.rn-key-action-grid{grid-template-columns:1fr!important}}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-hotspot .orb::before,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
  .lvn002-quiz-card{animation:none!important}
  .lvn002-rm-transition,.lvn002-complete-overlay{transition:none!important;animation:none!important}
}
.lvn002-path-overlay{position:absolute;left:8px;bottom:52px;z-index:9;display:flex;flex-direction:column;gap:6px;width:min(200px,42%);pointer-events:none}
.lvn002-path-card{padding:8px 10px;border-radius:10px;background:#fff;border:1px solid #E2E8F0;box-shadow:0 4px 14px rgba(0,0,0,.1);font-size:11px;line-height:1.35}
.lvn002-path-card strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px}
.lvn002-process-rail{position:absolute;left:8px;top:52px;z-index:7;display:flex;flex-direction:column;gap:6px;width:min(148px,36%);pointer-events:none}
.lvn002-zone-legend{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);z-index:9;display:flex;gap:6px;justify-content:center;pointer-events:none;flex-wrap:wrap;max-width:94%}
.lvn002-zone-legend{position:absolute;left:10px;right:10px;bottom:48px;z-index:9;display:flex;gap:8px;justify-content:center;pointer-events:none;flex-wrap:wrap}
.lvn002-zone-chip{padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #E2E8F0;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:6px}

.lvn002-process-node{position:absolute;z-index:7;transform:translate(-50%,-50%);pointer-events:none;max-width:150px;padding:7px 9px;border-radius:10px;background:#fff;border:1px solid #E2E8F0;box-shadow:0 4px 12px rgba(0,0,0,.1);font-size:12px;line-height:1.35;color:#2D3748;text-align:left}
.lvn002-process-node strong{display:block;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px;color:#0F5B54}
.lvn002-process-node ul{margin:0;padding-left:14px}
.lvn002-process-node li{margin:0}
.lvn002-gate-node{position:absolute;z-index:7;left:50%;bottom:8px;transform:translateX(-50%);pointer-events:none;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:92%}
.lvn002-gate-chip{padding:6px 10px;border-radius:999px;background:#fff;border:1px solid #C8DFDC;font-size:11px;font-weight:800;color:#0F5B54;box-shadow:0 3px 10px rgba(0,0,0,.08)}
.lvn002-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lvn002-live{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:24px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(1120px,100%);max-height:min(92dvh,900px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:20px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
.lvn002-modal-card h2,.lvn002-modal-card h3{font-size:34px!important}
.lvn002-modal-card p,.lvn002-modal-card button{font-size:31px!important;line-height:1.5!important}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:132px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:9px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:10px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;gap:2px}.lvn002-tab{min-height:30px;padding:3px 2px;font-size:9px;white-space:normal;line-height:1.05;overflow:hidden}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:8px;max-width:96px;white-space:normal;overflow:visible;text-overflow:clip;padding:3px 5px;line-height:1.05;overflow-wrap:anywhere}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:9px!important}.lvn002-scene-title>div:last-child{font-size:10px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:9px;letter-spacing:.03em;padding:6px;white-space:normal;line-height:1.1}.lvn002-bot button.next{max-width:140px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:8px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
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
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this evidence mean for patient-specific RN practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the RN do next within current orders and scope?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the RN should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
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
      <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 12 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 12px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>

      <section aria-label="Lesson focus" style={{ padding: 13, borderRadius: 12, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: CI.teal, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}><Sparkles size={15} aria-hidden="true" />Lesson Focus</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: CI.ink }}>{focus}</p>
      </section>

      <section aria-labelledby={actionsId} style={{ marginBottom: 14 }}>
        <h2 id={actionsId} style={{ margin: '0 0 9px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted }}>Key RN Actions</h2>
        <div className="rn-key-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {page.keyPoints.map((kp, index) => (
            <article id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} style={{ background: '#fff', border: `1px solid ${CI.border}`, borderRadius: 12, padding: 11, display: 'flex', gap: 9, minWidth: 0, overflow: 'hidden', boxShadow: '0 3px 10px rgba(15,91,84,.06)', gridColumn: page.keyPoints.length % 2 === 1 && index === page.keyPoints.length - 1 ? '1 / -1' : undefined }}>
              <span style={{ fontSize: 18, lineHeight: 1.2 }} aria-hidden>{kp.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#1F1C1B', marginBottom: 3, overflowWrap: 'anywhere' }}>{kp.title}</div>
                <div style={{ fontSize: 13, color: CI.muted, lineHeight: 1.4, overflowWrap: 'anywhere' }}>{kp.detail}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Clinical tip" style={{ padding: 13, borderRadius: 12, background: '#FFF8F3', border: `1px solid #F3D5C7`, borderLeft: `4px solid ${CI.orangeDark}`, marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: CI.orangeDark, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}><AlertCircle size={15} aria-hidden="true" />Clinical Tip</div>
        <div style={{ fontSize: 14, color: '#524C4B', lineHeight: 1.5 }}>{page.clinicalTip}</div>
      </section>

      <section aria-labelledby={sourcesId} style={{ marginBottom: 13 }}>
        <h2 id={sourcesId} style={{ margin: '0 0 7px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted }}>Sources &amp; Standards</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {page.sourceLabels.map((s) => (
            <span key={s.kind + s.text} style={{ fontSize: 10.5, padding: '5px 8px', borderRadius: 999, background: '#FAFBF8', border: `1px solid ${CI.border}`, color: CI.teal, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.035em', overflowWrap: 'anywhere' }}>{s.kind}: {s.text}</span>
          ))}
        </div>
      </section>

      <details className="rn-lesson-details" style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 4 }}>
        <summary style={{ padding: '12px 14px', fontWeight: 800, fontSize: 13, color: CI.teal, cursor: 'pointer' }}>Read Full Lesson Details</summary>
        <div style={{ padding: 14, borderTop: `1px solid ${CI.border}`, background: '#fff' }}>
          {page.narration.map((paragraph, index) => <p key={index} style={{ margin: index === page.narration.length - 1 ? 0 : '0 0 11px', fontSize: 15, lineHeight: 1.65, color: '#524C4B' }}>{paragraph}</p>)}
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
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.orange }}>{page.shortName}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: CI.teal }}>{page.title.split(':')[0]}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#fff', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
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
          style={{ position: 'absolute', right: 10, bottom: 10, zIndex: 12, minHeight: 44, padding: '0 12px', borderRadius: 999, border: `1px solid ${CI.border}`, background: '#fff', color: CI.teal, fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
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
              { label: 'Conditional', color: CI.orange, tip: 'Current order, scope, and competency review required' },
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


const STORAGE_KEY = 'rn-004-progress-v6000';

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

export default function RN004() {
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
          <img src="/assets/navigation/logo-careindeed-orange.png" alt="Care Indeed" width={32} height={32} />
          <span className="brand-text">RN-004 — Plan of Care</span>
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
