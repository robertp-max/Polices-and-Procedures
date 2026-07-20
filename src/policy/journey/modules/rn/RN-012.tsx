/**
 * RN-012 — Discharge Planning & Recertification
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
import img01 from './assets/rn-012/rn-012-lesson-01.png';
import img02 from './assets/rn-012/rn-012-lesson-02.png';
import img03 from './assets/rn-012/rn-012-lesson-03.png';
import img04 from './assets/rn-012/rn-012-lesson-04.png';
import img05 from './assets/rn-012/rn-012-lesson-05.png';
import img06 from './assets/rn-012/rn-012-lesson-06.png';
import img07 from './assets/rn-012/rn-012-lesson-07.png';

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

const MODULE_META = { id: "RN-012", title: "Discharge Planning & Recertification", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Begin individualized discharge planning at admission, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Measure goal progress, readiness, caregiver capacity, and barriers, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Recertification eligibility, continued skilled need, and updated orders, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Medication, equipment, service, and follow-up reconciliation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Teach-back of warning signs and transition instructions, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Discharge, transfer, appeal, and provider communication, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Summary, OASIS/record completion, and closed-loop handoff, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Begin",
    title: "Begin individualized discharge planning at admission",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for begin individualized discharge planning at admission within Discharge Planning & Recertification. Use the current controlled requirements in CL-CD-001, CL-CP-006, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CP-006, Discharge Planning Throughout the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, identify and document in the plan of care: (a) the patient's anticipated discharge date (a realistic target based on clinical trajectory, visit frequency, and functional goals); (b) the specific discharge criteria — what the patient must achieve or demonstrate to be safely discharged; (c) the patient's and caregiver's discharge goals and preferences; (d) any anticipated barriers to discharge (caregiver limitations, community resource gaps, chronic conditions requiring ongoing management). ; During the SOC visit; documented in the plan of care within 24 hours. ; ; 6.1.2 ; Assigned RN ; At every 30-day plan of care review.",
      "Controlled-policy focus — CL-CP-006, Discharge Criteria Assessment and Physician Notification. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; When the patient is assessed as meeting discharge criteria, document a Discharge Readiness Assessment in the clinical record, including: (a) specific evidence that each discharge criterion has been met; (b) the patient's final functional status; (c) the patient's and caregiver's readiness and confidence to manage independently; (d) community resources and follow-up appointments confirmed; (e) the clinical rationale supporting discharge. ; Within 24 hours of the determination that discharge criteria are met. ; ; 6.2.2 ; Assigned RN ; Contact the attending physician within 24 hours of the Discharge Readiness Assessment to report the patient's discharge status and obtain.",
      "Controlled-policy focus — CL-CP-006, Patient-Initiated Discharge and Discharge Against Medical Advice. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Any Clinician ; When a patient or legal representative requests discharge, regardless of whether the patient has met clinical discharge criteria, acknowledge the request and contact the Director of Nursing within 4 hours. ; Within 4 hours of the patient's request. ; ; 6.3.2 ; Director of Nursing / Assigned RN ; Within 24 hours of the discharge request, the Director of Nursing or assigned RN shall: (a) assess the patient's understanding of the risks of discharge if criteria have not been met; (b) educate the patient on the clinical implications of early discharge; (c) offer alternatives such as a reduced.",
      "Controlled-policy focus — CL-CP-002, Documentation of Discharge Planning Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; At each 30-day review and at recertification, document the patient's current estimated discharge date and discharge criteria. If the estimated discharge date has changed, document the reason for the change (e.g., slower progress, new diagnosis, new goals). ; At each review. ; ; 6.4.2 ; Assigned RN ; If a patient reaches the 90th day of continuous home health services without a documented discharge plan, escalate to the Director of Nursing for a clinical necessity review. The Director of Nursing shall determine whether continued services are medically necessary and shall consult with the physician. ; At or before.",
      "Apply the controlled requirements to the three visible objects in the scene for begin individualized discharge planning at admission. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Rolling Walker", detail: "Review the rolling walker for the patient-specific finding. Reconcile it with the packed overnight bag, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Packed Overnight Bag", detail: "Review the packed overnight bag for the patient-specific finding. Reconcile it with the discharge folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Discharge Folder", detail: "Review the discharge folder for the patient-specific finding. Reconcile it with the rolling walker, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "rolling-walker-1-1", label: "rolling walker", shortLabel: "rolling walker", ariaLabel: "Investigate rolling walker",        x: 31, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the rolling walker as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the packed overnight bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with packed overnight bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the rolling walker as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the packed overnight bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with packed overnight bag and the controlling source before classifying status." },
          { id: "i2", label: "Treat the rolling walker as the complete assessment and do not compare the packed overnight bag, patient report, or current record. This identify option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for begin individualized discharge planning at admission." },
          { id: "i3", label: "Carry forward the prior visit conclusion for begin individualized discharge planning at admission without reassessing the patient today. This identify option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about rolling walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the rolling walker alone and seek clarification only after the intervention is complete. This decide option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for rolling walker is resolved." },
          { id: "d3", label: "Defer the concern in the rolling walker to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during begin individualized discharge planning at admission." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For rolling walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For rolling walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the rolling walker was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of rolling walker." },
          { id: "doc3", label: "Keep the rolling walker decision in personal notes rather than the governed patient record. This document option concerns rolling walker during begin individualized discharge planning at admission.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for begin individualized discharge planning at admission." },
        ],
        feedback: {
          observed: "Observe the rolling walker as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the packed overnight bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the rolling walker as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the packed overnight bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with packed overnight bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For rolling walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "packed-overnight-bag-1-2", label: "packed overnight bag", shortLabel: "packed overnight bag", ariaLabel: "Investigate packed overnight bag",        x: 45, y: 69, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the packed overnight bag as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the discharge folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed overnight bag, compare the visible evidence with discharge folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the packed overnight bag as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the discharge folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed overnight bag, compare the visible evidence with discharge folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the packed overnight bag establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for begin individualized discharge planning at admission." },
          { id: "i3", label: "Dismiss the conflict between the packed overnight bag and discharge folder because one source appears more convenient. This identify option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about packed overnight bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed overnight bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed overnight bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the packed overnight bag without confirming an applicable order and patient-specific authority. This decide option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for packed overnight bag is resolved." },
          { id: "d3", label: "Hand the packed overnight bag concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during begin individualized discharge planning at admission." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For packed overnight bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For packed overnight bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the packed overnight bag before reassessment confirms the patient response. This document option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of packed overnight bag." },
          { id: "doc3", label: "Copy the prior begin individualized discharge planning at admission narrative even though today’s packed overnight bag evidence is different. This document option concerns packed overnight bag during begin individualized discharge planning at admission.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for begin individualized discharge planning at admission." },
        ],
        feedback: {
          observed: "Observe the packed overnight bag as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the discharge folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the packed overnight bag as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the discharge folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed overnight bag, compare the visible evidence with discharge folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed overnight bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For packed overnight bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "discharge-folder-1-3", label: "discharge folder", shortLabel: "discharge folder", ariaLabel: "Investigate discharge folder",        x: 84, y: 65, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the discharge folder as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For discharge folder, compare the visible evidence with rolling walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the discharge folder as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For discharge folder, compare the visible evidence with rolling walker and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the discharge folder and omit the related change, symptom, or safety cue. This identify option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for begin individualized discharge planning at admission." },
          { id: "i3", label: "Let a blank, unreadable, or unverified discharge folder stand in for direct RN assessment. This identify option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about discharge folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to discharge folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to discharge folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the discharge folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for discharge folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for begin individualized discharge planning at admission instead of the current controlled clinical pathway. This decide option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during begin individualized discharge planning at admission." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For discharge folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For discharge folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the discharge folder and omit the discrepancy with rolling walker. This document option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of discharge folder." },
          { id: "doc3", label: "Combine the discharge folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns discharge folder during begin individualized discharge planning at admission.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for begin individualized discharge planning at admission." },
        ],
        feedback: {
          observed: "Observe the discharge folder as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the discharge folder as patient-specific evidence for begin individualized discharge planning at admission. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for begin individualized discharge planning at admission, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For discharge folder, compare the visible evidence with rolling walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to discharge folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for begin individualized discharge planning at admission. For discharge folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Measure",
    title: "Measure goal progress, readiness, caregiver capacity, and barriers",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for measure goal progress, readiness, caregiver capacity, and barriers within Discharge Planning & Recertification. Use the current controlled requirements in CL-CD-001, CL-CP-002, CL-CP-006, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, General Clinical Documentation Requirements — All Disciplines. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; All Clinicians ; Every visit note and clinical record entry shall be individualized to the specific patient and the specific visit. Before beginning a visit note, do not copy forward any prior note. Start from the current clinical encounter and document what was observed, assessed, and done at this visit, for this patient, today. ; At each visit. ; ; 6.1.2 ; All Clinicians ; Every visit note shall be written in specific, clinical, observation-based language. Avoid vague terms that do not communicate meaningful clinical information: \"patient doing well,\" \"no changes noted,\" \"patient tolerates,\" \"stable,\" \"routine visit,\" \"nursing visit.\" These phrases.",
      "Controlled-policy focus — CL-CD-001, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Visit notes contain all universal required elements per Section 6.1.3 ; Monthly documentation audit ; ≥95% of audited notes contain all required elements ; ; Visit notes demonstrate skilled care per Section 6.2 standards ; Monthly documentation audit ; ≥90% of audited notes contain skilled documentation language ; ; Goal progress documented with measurable specificity ; Monthly documentation audit ; ≥90% of audited notes contain measurable goal progress ; ; All entries authenticated ; Authentication log audit ; ≥98% of entries authenticated within the required timeframe ; ; No copy-forward identified ; Monthly documentation audit ; Zero tolerance for unapproved copy-forward on audited records.",
      "Controlled-policy focus — CL-CP-002, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; 30-day review completed for all active patients ; Director of Nursing supervisory review log; EHR review date audit ; ≥95% of active patients with documented 30-day review within required timeframe ; ; Significant changes result in physician notification within 24 hours ; Audit of physician contact notes against visit dates in patient records with documented clinical changes ; ≥95% of significant changes have physician notification documented within 24 hours ; ; Recertification assessments completed within the Day 56–60 window ; Recertification tracking report cross-referenced with OASIS assessment dates ; ≥95% of recertification assessments completed within the 5-day window ; ; All plan modifications supported.",
      "Controlled-policy focus — CL-CP-006, Discharge Planning Throughout the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, identify and document in the plan of care: (a) the patient's anticipated discharge date (a realistic target based on clinical trajectory, visit frequency, and functional goals); (b) the specific discharge criteria — what the patient must achieve or demonstrate to be safely discharged; (c) the patient's and caregiver's discharge goals and preferences; (d) any anticipated barriers to discharge (caregiver limitations, community resource gaps, chronic conditions requiring ongoing management). ; During the SOC visit; documented in the plan of care within 24 hours. ; ; 6.1.2 ; Assigned RN ; At every 30-day plan of care review.",
      "Apply the controlled requirements to the three visible objects in the scene for measure goal progress, readiness, caregiver capacity, and barriers. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the plan folder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Plan Folder", detail: "Review the plan folder for the patient-specific finding. Reconcile it with the functional resistance band, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Functional Resistance Band", detail: "Review the functional resistance band for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55(c)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "stethoscope-2-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 14, y: 56, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the stethoscope as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the plan folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with plan folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with plan folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for measure goal progress, readiness, caregiver capacity, and barriers." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and plan folder because one source appears more convenient. This identify option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior measure goal progress, readiness, caregiver capacity, and barriers narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the plan folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with plan folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "plan-folder-2-2", label: "plan folder", shortLabel: "plan folder", ariaLabel: "Investigate plan folder",        x: 31, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the plan folder as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the functional resistance band, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan folder, compare the visible evidence with functional resistance band and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the plan folder as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the functional resistance band, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan folder, compare the visible evidence with functional resistance band and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the plan folder and omit the related change, symptom, or safety cue. This identify option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for measure goal progress, readiness, caregiver capacity, and barriers." },
          { id: "i3", label: "Let a blank, unreadable, or unverified plan folder stand in for direct RN assessment. This identify option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the plan folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for plan folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for measure goal progress, readiness, caregiver capacity, and barriers instead of the current controlled clinical pathway. This decide option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For plan folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For plan folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the plan folder and omit the discrepancy with functional resistance band. This document option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of plan folder." },
          { id: "doc3", label: "Combine the plan folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns plan folder during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        feedback: {
          observed: "Observe the plan folder as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the functional resistance band, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the plan folder as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the functional resistance band, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan folder, compare the visible evidence with functional resistance band and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For plan folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "functional-resistance-band-2-3", label: "functional resistance band", shortLabel: "functional resistance band", ariaLabel: "Investigate functional resistance band",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the functional resistance band as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For functional resistance band, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the functional resistance band as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For functional resistance band, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the functional resistance band as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for measure goal progress, readiness, caregiver capacity, and barriers." },
          { id: "i3", label: "Carry forward the prior visit conclusion for measure goal progress, readiness, caregiver capacity, and barriers without reassessing the patient today. This identify option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about functional resistance band." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to functional resistance band; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to functional resistance band; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the functional resistance band alone and seek clarification only after the intervention is complete. This decide option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for functional resistance band is resolved." },
          { id: "d3", label: "Defer the concern in the functional resistance band to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For functional resistance band, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For functional resistance band, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the functional resistance band was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of functional resistance band." },
          { id: "doc3", label: "Keep the functional resistance band decision in personal notes rather than the governed patient record. This document option concerns functional resistance band during measure goal progress, readiness, caregiver capacity, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for measure goal progress, readiness, caregiver capacity, and barriers." },
        ],
        feedback: {
          observed: "Observe the functional resistance band as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the functional resistance band as patient-specific evidence for measure goal progress, readiness, caregiver capacity, and barriers. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for measure goal progress, readiness, caregiver capacity, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For functional resistance band, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to functional resistance band; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for measure goal progress, readiness, caregiver capacity, and barriers. For functional resistance band, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Recerti",
    title: "Recertification eligibility, continued skilled need, and updated orders",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for recertification eligibility, continued skilled need, and updated orders within Discharge Planning & Recertification. Use the current controlled requirements in CL-CP-002, CL-CD-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Recertification Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator / Director of Nursing ; Generate a recertification tracking report no later than the 40th day of each active certification period, identifying all patients whose certification period ends within the next 20 days. Confirm that each patient has a recertification assessment scheduled and an assigned clinician. ; No later than Day 40 of each certification period. ; ; 6.3.2 ; Assigned RN ; Conduct the comprehensive recertification assessment between Day 56 and Day 60 of the current certification period (5-day assessment window), in compliance with CMS OASIS timing requirements and policy CL-CA-004. Complete all required OASIS data elements for.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, Demonstrating Skilled Care in Documentation. This section provides the agency's standards for documentation that demonstrates the skilled nature of clinical services. These standards supplement the discipline-specific documentation requirements in CL-SD-001 through CL-SD-025. ; Documentation Element ; Standard for Skilled Documentation ; Example of Skilled Documentation ; Example of Non-Skilled Documentation ; ; ; ; ; ; ; Assessment findings ; Document specific clinical findings with quantitative measurements or standardized scale scores ; \"BP 168/94 sitting; HR 88 irregular; SpO2 88% on 2L NC; bilateral LE edema 3+ to mid-calf; lung auscultation — bibasilar crackles; weight 184.6 lbs, up 3.2 lbs from 3 days prior\" ; \"VS stable; lungs clear; patient OK\" ; ; Clinical reasoning ; Document the clinician's professional interpretation of findings.",
      "Controlled-policy focus — CL-CP-002, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the current, physician-approved plan of care ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Plan of care must be reviewed by the physician as frequently as the severity of the patient's condition requires ; ; 42 CFR § 424.22(b) ; Recertification ; Defines recertification requirements for Medicare home health ; ; 42 CFR § 484.55 ; Comprehensive assessment ; Assessment findings must be reflected in the plan of care ; 9.2 CMS Guidance ; Document ; Relevance ; ; ; ; ; CMS.",
      "Controlled-policy focus — CL-CP-002, 4\\. Policy Statement. 4.1 The plan of care for every active patient shall be formally reviewed by the responsible registered nurse at a minimum of every 30 calendar days during the certification period, regardless of whether a change is indicated. 4.2 The plan of care shall be comprehensively reviewed and updated at each recertification period — no later than every 60 calendar days — and the updated plan of care shall be transmitted to and signed by the certifying physician within the recertification timeline defined in policy CL-CP-008. 4.3 A plan of care modification shall be initiated within 24 hours whenever any of the following significant change conditions are identified: (a) a new diagnosis or significant worsening of an existing diagnosis.",
      "Apply the controlled requirements to the three visible objects in the scene for recertification eligibility, continued skilled need, and updated orders. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Packed Travel Bag", detail: "Review the packed travel bag for the patient-specific finding. Reconcile it with the medication organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Medication Organizer", detail: "Review the medication organizer for the patient-specific finding. Reconcile it with the closed handoff folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Closed Handoff Folder", detail: "Review the closed handoff folder for the patient-specific finding. Reconcile it with the packed travel bag, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR §484.55(c)" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "packed-travel-bag-3-1", label: "packed travel bag", shortLabel: "packed travel bag", ariaLabel: "Investigate packed travel bag",        x: 14, y: 61, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the packed travel bag as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed travel bag, compare the visible evidence with medication organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the packed travel bag as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed travel bag, compare the visible evidence with medication organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the packed travel bag and omit the related change, symptom, or safety cue. This identify option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recertification eligibility, continued skilled need, and updated orders." },
          { id: "i3", label: "Let a blank, unreadable, or unverified packed travel bag stand in for direct RN assessment. This identify option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about packed travel bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed travel bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed travel bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the packed travel bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for packed travel bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for recertification eligibility, continued skilled need, and updated orders instead of the current controlled clinical pathway. This decide option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recertification eligibility, continued skilled need, and updated orders." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For packed travel bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For packed travel bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the packed travel bag and omit the discrepancy with medication organizer. This document option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of packed travel bag." },
          { id: "doc3", label: "Combine the packed travel bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns packed travel bag during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recertification eligibility, continued skilled need, and updated orders." },
        ],
        feedback: {
          observed: "Observe the packed travel bag as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the packed travel bag as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For packed travel bag, compare the visible evidence with medication organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to packed travel bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For packed travel bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "medication-organizer-3-2", label: "medication organizer", shortLabel: "medication organizer", ariaLabel: "Investigate medication organizer",        x: 57, y: 73, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the medication organizer as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the closed handoff folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with closed handoff folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication organizer as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the closed handoff folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with closed handoff folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the medication organizer as the complete assessment and do not compare the closed handoff folder, patient report, or current record. This identify option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recertification eligibility, continued skilled need, and updated orders." },
          { id: "i3", label: "Carry forward the prior visit conclusion for recertification eligibility, continued skilled need, and updated orders without reassessing the patient today. This identify option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the medication organizer alone and seek clarification only after the intervention is complete. This decide option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication organizer is resolved." },
          { id: "d3", label: "Defer the concern in the medication organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recertification eligibility, continued skilled need, and updated orders." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For medication organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For medication organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the medication organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication organizer." },
          { id: "doc3", label: "Keep the medication organizer decision in personal notes rather than the governed patient record. This document option concerns medication organizer during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recertification eligibility, continued skilled need, and updated orders." },
        ],
        feedback: {
          observed: "Observe the medication organizer as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the closed handoff folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication organizer as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the closed handoff folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with closed handoff folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For medication organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "closed-handoff-folder-3-3", label: "closed handoff folder", shortLabel: "closed handoff folder", ariaLabel: "Investigate closed handoff folder",        x: 76, y: 45, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the closed handoff folder as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the packed travel bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed handoff folder, compare the visible evidence with packed travel bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed handoff folder as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the packed travel bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed handoff folder, compare the visible evidence with packed travel bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed handoff folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recertification eligibility, continued skilled need, and updated orders." },
          { id: "i3", label: "Dismiss the conflict between the closed handoff folder and packed travel bag because one source appears more convenient. This identify option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed handoff folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed handoff folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed handoff folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed handoff folder without confirming an applicable order and patient-specific authority. This decide option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed handoff folder is resolved." },
          { id: "d3", label: "Hand the closed handoff folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recertification eligibility, continued skilled need, and updated orders." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For closed handoff folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For closed handoff folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed handoff folder before reassessment confirms the patient response. This document option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed handoff folder." },
          { id: "doc3", label: "Copy the prior recertification eligibility, continued skilled need, and updated orders narrative even though today’s closed handoff folder evidence is different. This document option concerns closed handoff folder during recertification eligibility, continued skilled need, and updated orders.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recertification eligibility, continued skilled need, and updated orders." },
        ],
        feedback: {
          observed: "Observe the closed handoff folder as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the packed travel bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed handoff folder as patient-specific evidence for recertification eligibility, continued skilled need, and updated orders. Compare it with the packed travel bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recertification eligibility, continued skilled need, and updated orders, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed handoff folder, compare the visible evidence with packed travel bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed handoff folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recertification eligibility, continued skilled need, and updated orders. For closed handoff folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Medicat",
    title: "Medication, equipment, service, and follow-up reconciliation",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for medication, equipment, service, and follow-up reconciliation within Discharge Planning & Recertification. Use the current controlled requirements in CL-CD-001, CL-CP-006, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, 4\\. Policy Statement. 4.1 Every entry in a patient's clinical record shall be: accurate — reflecting what was actually observed, assessed, performed, and communicated; complete — containing all required elements for the type of entry; timely — created within the timeframe specified for the entry type; legible — clearly readable in the format used (electronic or written); authenticated — identified with the author's name, credential, date, and time; and consistent — aligned with all related entries in the clinical record. 4.2 Every clinical record entry shall be individualized to the specific patient, the specific visit, and the specific clinical situation. Template-driven documentation that does not reflect the actual clinical encounter is prohibited. Copy-forward of prior entries without independent verification and documentation.",
      "Controlled-policy focus — CL-CP-006, 5\\. Definitions. Term ; Definition ; ; ; ; ; Discharge ; The formal termination of a patient's enrollment in home health services at Care Indeed Home Health Care, Inc. ; ; Discharge Criteria ; The specific clinical, functional, and support-system conditions that must be met before a patient is determined to be appropriate for discharge from home health services. ; ; Goal-Achieved Discharge ; A discharge that occurs because the patient has met the clinical and functional goals established in the plan of care and no longer requires skilled home health services. ; ; Physician-Ordered Discharge ; A discharge that occurs at the direction of the attending physician, who has determined that home health services are no longer indicated..",
      "Controlled-policy focus — CL-CP-002, 4\\. Policy Statement. 4.1 The plan of care for every active patient shall be formally reviewed by the responsible registered nurse at a minimum of every 30 calendar days during the certification period, regardless of whether a change is indicated. 4.2 The plan of care shall be comprehensively reviewed and updated at each recertification period — no later than every 60 calendar days — and the updated plan of care shall be transmitted to and signed by the certifying physician within the recertification timeline defined in policy CL-CP-008. 4.3 A plan of care modification shall be initiated within 24 hours whenever any of the following significant change conditions are identified: (a) a new diagnosis or significant worsening of an existing diagnosis.",
      "Controlled-policy focus — CL-CD-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Clinical Record ; The complete, permanent collection of all clinical documentation for a patient — encompassing assessments, visit notes, care coordination records, physician orders, OASIS data, plan of care documents, and all other records created in connection with the patient's home health episode. ; ; Visit Note ; The clinical documentation entry created by a clinician for each patient visit, documenting the patient's status, the clinical services provided, the patient's response, education delivered, and the plan for follow-up. ; ; Authentication ; The process by which an entry in the clinical record is identified as the work of a specific clinician, accomplished by the clinician's signature (electronic or physical) including.",
      "Apply the controlled requirements to the three visible objects in the scene for medication, equipment, service, and follow-up reconciliation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the reading glasses, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Reading Glasses", detail: "Review the reading glasses for the patient-specific finding. Reconcile it with the closed teaching folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Closed Teaching Folder", detail: "Review the closed teaching folder for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
      { kind: "External Authority", text: "42 CFR §484.60(b)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "pill-organizer-4-1", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the pill organizer as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with reading glasses and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with reading glasses and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pill organizer as the complete assessment and do not compare the reading glasses, patient report, or current record. This identify option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, equipment, service, and follow-up reconciliation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for medication, equipment, service, and follow-up reconciliation without reassessing the patient today. This identify option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pill organizer alone and seek clarification only after the intervention is complete. This decide option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Defer the concern in the pill organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, equipment, service, and follow-up reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pill organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Keep the pill organizer decision in personal notes rather than the governed patient record. This document option concerns pill organizer during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, equipment, service, and follow-up reconciliation." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with reading glasses and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "reading-glasses-4-2", label: "reading glasses", shortLabel: "reading glasses", ariaLabel: "Investigate reading glasses",        x: 40, y: 50, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the reading glasses as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the closed teaching folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with closed teaching folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the reading glasses as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the closed teaching folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with closed teaching folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the reading glasses establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, equipment, service, and follow-up reconciliation." },
          { id: "i3", label: "Dismiss the conflict between the reading glasses and closed teaching folder because one source appears more convenient. This identify option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about reading glasses." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the reading glasses without confirming an applicable order and patient-specific authority. This decide option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for reading glasses is resolved." },
          { id: "d3", label: "Hand the reading glasses concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, equipment, service, and follow-up reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For reading glasses, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For reading glasses, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the reading glasses before reassessment confirms the patient response. This document option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reading glasses." },
          { id: "doc3", label: "Copy the prior medication, equipment, service, and follow-up reconciliation narrative even though today’s reading glasses evidence is different. This document option concerns reading glasses during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, equipment, service, and follow-up reconciliation." },
        ],
        feedback: {
          observed: "Observe the reading glasses as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the closed teaching folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the reading glasses as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the closed teaching folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with closed teaching folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For reading glasses, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "closed-teaching-folder-4-3", label: "closed teaching folder", shortLabel: "closed teaching folder", ariaLabel: "Investigate closed teaching folder",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the closed teaching folder as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed teaching folder, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed teaching folder as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed teaching folder, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the closed teaching folder and omit the related change, symptom, or safety cue. This identify option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, equipment, service, and follow-up reconciliation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified closed teaching folder stand in for direct RN assessment. This identify option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed teaching folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed teaching folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed teaching folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the closed teaching folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed teaching folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for medication, equipment, service, and follow-up reconciliation instead of the current controlled clinical pathway. This decide option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, equipment, service, and follow-up reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For closed teaching folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For closed teaching folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the closed teaching folder and omit the discrepancy with pill organizer. This document option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed teaching folder." },
          { id: "doc3", label: "Combine the closed teaching folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns closed teaching folder during medication, equipment, service, and follow-up reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, equipment, service, and follow-up reconciliation." },
        ],
        feedback: {
          observed: "Observe the closed teaching folder as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed teaching folder as patient-specific evidence for medication, equipment, service, and follow-up reconciliation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, equipment, service, and follow-up reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed teaching folder, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed teaching folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, equipment, service, and follow-up reconciliation. For closed teaching folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Teach-b",
    title: "Teach-back of warning signs and transition instructions",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for teach-back of warning signs and transition instructions within Discharge Planning & Recertification. Use the current controlled requirements in CL-CD-001, CL-CP-006, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, Demonstrating Skilled Care in Documentation. This section provides the agency's standards for documentation that demonstrates the skilled nature of clinical services. These standards supplement the discipline-specific documentation requirements in CL-SD-001 through CL-SD-025. ; Documentation Element ; Standard for Skilled Documentation ; Example of Skilled Documentation ; Example of Non-Skilled Documentation ; ; ; ; ; ; ; Assessment findings ; Document specific clinical findings with quantitative measurements or standardized scale scores ; \"BP 168/94 sitting; HR 88 irregular; SpO2 88% on 2L NC; bilateral LE edema 3+ to mid-calf; lung auscultation — bibasilar crackles; weight 184.6 lbs, up 3.2 lbs from 3 days prior\" ; \"VS stable; lungs clear; patient OK\" ; ; Clinical reasoning ; Document the clinician's professional interpretation of findings.",
      "Controlled-policy focus — CL-CP-006, 2\\. Purpose. This policy establishes the criteria, processes, and documentation requirements for discharging patients from home health services at Care Indeed Home Health Care, Inc. Discharge planning is a clinical process, not an administrative event — it begins at the time of admission and evolves throughout the episode as the patient progresses toward or away from identified goals. A well-executed discharge process ensures that patients leave home health care with the knowledge, support, and community resources necessary to maintain their health independently, that the clinical record reflects a complete and justified basis for discharge, and that the transition to the next setting or self-management is coordinated with the patient, the attending physician, and all relevant external providers. This policy governs.",
      "Controlled-policy focus — CL-CP-002, 5\\. Definitions. Term ; Definition ; ; ; ; ; Plan of Care Review ; A formal, documented clinical assessment of the patient's current status, the appropriateness of the current plan of care, progress toward goals, and any needed modifications. ; ; Significant Change in Condition (SCC) ; A major decline or improvement in the patient's health status that is not expected to resolve without further intervention and that affects the type, frequency, or intensity of care needed. ; ; Mid-Episode Modification ; A change to the plan of care that occurs during a certification period, prior to the recertification assessment. ; ; Recertification ; The process by which a physician re-certifies that a patient continues to meet the criteria.",
      "Controlled-policy focus — CL-CP-006, 3\\. Scope. This policy applies to: All registered nurses managing active patient caseloads All clinical disciplines providing services at discharge The Director of Nursing / Clinical Manager Medical Social Workers coordinating community resources at discharge Clinical Coordinators managing discharge scheduling and documentation Medical Records and Revenue Cycle staff managing discharge OASIS and final billing The attending physician who must be notified of and, where required, authorize discharge.",
      "Apply the controlled requirements to the three visible objects in the scene for teach-back of warning signs and transition instructions. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Walker", detail: "Review the walker for the patient-specific finding. Reconcile it with the community-resource folder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Community-resource Folder", detail: "Review the community-resource folder for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the walker, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR §484.60(b)" },
      { kind: "External Authority", text: "42 CFR §484.60(c)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "walker-5-1", label: "walker", shortLabel: "walker", ariaLabel: "Investigate walker",        x: 14, y: 48, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the walker as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the community-resource folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with community-resource folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the walker as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the community-resource folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with community-resource folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the walker establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for teach-back of warning signs and transition instructions." },
          { id: "i3", label: "Dismiss the conflict between the walker and community-resource folder because one source appears more convenient. This identify option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the walker without confirming an applicable order and patient-specific authority. This decide option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for walker is resolved." },
          { id: "d3", label: "Hand the walker concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during teach-back of warning signs and transition instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the walker before reassessment confirms the patient response. This document option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of walker." },
          { id: "doc3", label: "Copy the prior teach-back of warning signs and transition instructions narrative even though today’s walker evidence is different. This document option concerns walker during teach-back of warning signs and transition instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for teach-back of warning signs and transition instructions." },
        ],
        feedback: {
          observed: "Observe the walker as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the community-resource folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the walker as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the community-resource folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with community-resource folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "community-resource-folder-5-2", label: "community-resource folder", shortLabel: "community-resource folder", ariaLabel: "Investigate community-resource folder",        x: 34, y: 67, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the community-resource folder as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For community-resource folder, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the community-resource folder as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For community-resource folder, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the community-resource folder and omit the related change, symptom, or safety cue. This identify option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for teach-back of warning signs and transition instructions." },
          { id: "i3", label: "Let a blank, unreadable, or unverified community-resource folder stand in for direct RN assessment. This identify option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about community-resource folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to community-resource folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to community-resource folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the community-resource folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for community-resource folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for teach-back of warning signs and transition instructions instead of the current controlled clinical pathway. This decide option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during teach-back of warning signs and transition instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For community-resource folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For community-resource folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the community-resource folder and omit the discrepancy with phone. This document option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of community-resource folder." },
          { id: "doc3", label: "Combine the community-resource folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns community-resource folder during teach-back of warning signs and transition instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for teach-back of warning signs and transition instructions." },
        ],
        feedback: {
          observed: "Observe the community-resource folder as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the community-resource folder as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For community-resource folder, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to community-resource folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For community-resource folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "phone-5-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 83, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the phone as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with walker and the controlling source before classifying status." },
          { id: "i2", label: "Treat the phone as the complete assessment and do not compare the walker, patient report, or current record. This identify option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for teach-back of warning signs and transition instructions." },
          { id: "i3", label: "Carry forward the prior visit conclusion for teach-back of warning signs and transition instructions without reassessing the patient today. This identify option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the phone alone and seek clarification only after the intervention is complete. This decide option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during teach-back of warning signs and transition instructions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the phone was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Keep the phone decision in personal notes rather than the governed patient record. This document option concerns phone during teach-back of warning signs and transition instructions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for teach-back of warning signs and transition instructions." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for teach-back of warning signs and transition instructions. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for teach-back of warning signs and transition instructions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for teach-back of warning signs and transition instructions. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Dischar",
    title: "Discharge, transfer, appeal, and provider communication",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for discharge, transfer, appeal, and provider communication within Discharge Planning & Recertification. Use the current controlled requirements in CL-CP-006, CL-CD-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-006, Discharge Planning Throughout the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, identify and document in the plan of care: (a) the patient's anticipated discharge date (a realistic target based on clinical trajectory, visit frequency, and functional goals); (b) the specific discharge criteria — what the patient must achieve or demonstrate to be safely discharged; (c) the patient's and caregiver's discharge goals and preferences; (d) any anticipated barriers to discharge (caregiver limitations, community resource gaps, chronic conditions requiring ongoing management). ; During the SOC visit; documented in the plan of care within 24 hours. ; ; 6.1.2 ; Assigned RN ; At every 30-day plan of care review.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CP-006, Discharge Criteria Assessment and Physician Notification. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; When the patient is assessed as meeting discharge criteria, document a Discharge Readiness Assessment in the clinical record, including: (a) specific evidence that each discharge criterion has been met; (b) the patient's final functional status; (c) the patient's and caregiver's readiness and confidence to manage independently; (d) community resources and follow-up appointments confirmed; (e) the clinical rationale supporting discharge. ; Within 24 hours of the determination that discharge criteria are met. ; ; 6.2.2 ; Assigned RN ; Contact the attending physician within 24 hours of the Discharge Readiness Assessment to report the patient's discharge status and obtain.",
      "Controlled-policy focus — CL-CP-006, Patient-Initiated Discharge and Discharge Against Medical Advice. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Any Clinician ; When a patient or legal representative requests discharge, regardless of whether the patient has met clinical discharge criteria, acknowledge the request and contact the Director of Nursing within 4 hours. ; Within 4 hours of the patient's request. ; ; 6.3.2 ; Director of Nursing / Assigned RN ; Within 24 hours of the discharge request, the Director of Nursing or assigned RN shall: (a) assess the patient's understanding of the risks of discharge if criteria have not been met; (b) educate the patient on the clinical implications of early discharge; (c) offer alternatives such as a reduced.",
      "Controlled-policy focus — CL-CP-006, 5\\. Definitions. Term ; Definition ; ; ; ; ; Discharge ; The formal termination of a patient's enrollment in home health services at Care Indeed Home Health Care, Inc. ; ; Discharge Criteria ; The specific clinical, functional, and support-system conditions that must be met before a patient is determined to be appropriate for discharge from home health services. ; ; Goal-Achieved Discharge ; A discharge that occurs because the patient has met the clinical and functional goals established in the plan of care and no longer requires skilled home health services. ; ; Physician-Ordered Discharge ; A discharge that occurs at the direction of the attending physician, who has determined that home health services are no longer indicated..",
      "Apply the controlled requirements to the three visible objects in the scene for discharge, transfer, appeal, and provider communication. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Summary Folder", detail: "Review the summary folder for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the medication organizer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Medication Organizer", detail: "Review the medication organizer for the patient-specific finding. Reconcile it with the summary folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR §484.60(c)" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "summary-folder-6-1", label: "summary folder", shortLabel: "summary folder", ariaLabel: "Investigate summary folder",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the summary folder as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For summary folder, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the summary folder as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For summary folder, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the summary folder and omit the related change, symptom, or safety cue. This identify option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for discharge, transfer, appeal, and provider communication." },
          { id: "i3", label: "Let a blank, unreadable, or unverified summary folder stand in for direct RN assessment. This identify option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about summary folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to summary folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to summary folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the summary folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for summary folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for discharge, transfer, appeal, and provider communication instead of the current controlled clinical pathway. This decide option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during discharge, transfer, appeal, and provider communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For summary folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For summary folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the summary folder and omit the discrepancy with phone. This document option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of summary folder." },
          { id: "doc3", label: "Combine the summary folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns summary folder during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discharge, transfer, appeal, and provider communication." },
        ],
        feedback: {
          observed: "Observe the summary folder as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the summary folder as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For summary folder, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to summary folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For summary folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "phone-6-2", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 33, y: 39, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the phone as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with medication organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with medication organizer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the phone as the complete assessment and do not compare the medication organizer, patient report, or current record. This identify option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for discharge, transfer, appeal, and provider communication." },
          { id: "i3", label: "Carry forward the prior visit conclusion for discharge, transfer, appeal, and provider communication without reassessing the patient today. This identify option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the phone alone and seek clarification only after the intervention is complete. This decide option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during discharge, transfer, appeal, and provider communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the phone was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Keep the phone decision in personal notes rather than the governed patient record. This document option concerns phone during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discharge, transfer, appeal, and provider communication." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the medication organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with medication organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "medication-organizer-6-3", label: "medication organizer", shortLabel: "medication organizer", ariaLabel: "Investigate medication organizer",        x: 82, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the medication organizer as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the summary folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with summary folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication organizer as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the summary folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with summary folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the medication organizer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for discharge, transfer, appeal, and provider communication." },
          { id: "i3", label: "Dismiss the conflict between the medication organizer and summary folder because one source appears more convenient. This identify option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the medication organizer without confirming an applicable order and patient-specific authority. This decide option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication organizer is resolved." },
          { id: "d3", label: "Hand the medication organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during discharge, transfer, appeal, and provider communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For medication organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For medication organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the medication organizer before reassessment confirms the patient response. This document option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication organizer." },
          { id: "doc3", label: "Copy the prior discharge, transfer, appeal, and provider communication narrative even though today’s medication organizer evidence is different. This document option concerns medication organizer during discharge, transfer, appeal, and provider communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for discharge, transfer, appeal, and provider communication." },
        ],
        feedback: {
          observed: "Observe the medication organizer as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the summary folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication organizer as patient-specific evidence for discharge, transfer, appeal, and provider communication. Compare it with the summary folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for discharge, transfer, appeal, and provider communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication organizer, compare the visible evidence with summary folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for discharge, transfer, appeal, and provider communication. For medication organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Summary",
    title: "Summary, OASIS/record completion, and closed-loop handoff",
    subtitle: "Discharge Planning & Recertification",
    narration: [
      "This lesson develops registered-nurse reasoning for summary, oasis/record completion, and closed-loop handoff within Discharge Planning & Recertification. Use the current controlled requirements in CL-CD-001, CL-CP-006, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CP-006, 4\\. Policy Statement. 4.1 Discharge planning shall begin at the time of the Start of Care assessment and shall be an ongoing, documented component of every patient's plan of care throughout the episode. 4.2 Discharge criteria — the specific clinical, functional, and support-system milestones that must be achieved before a patient is safely discharged from home health — shall be identified and documented in the plan of care at SOC, reviewed at every 30-day review, and updated as the patient's condition evolves. 4.3 Discharge shall occur when one or more of the following criteria are met: (a) the patient has achieved the goals established in the plan of care; (b) the patient no longer meets the Medicare homebound status criteria; (c).",
      "Controlled-policy focus — CL-CP-002, Mid-Episode Plan of Care Modification (Significant Change). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Clinician (any discipline) ; Any clinician who identifies a significant change in the patient's condition during a visit shall document the clinical findings in the visit note and notify the assigned RN and/or Director of Nursing on the same day. The notification must include: (a) the nature of the change; (b) the patient's current clinical status; (c) the clinician's clinical assessment of the change; (d) any immediate safety concerns. ; On the same day the change is identified. ; ; 6.2.2 ; Assigned RN ; Upon notification or independent identification of a significant change, contact the physician within 24 hours.",
      "Controlled-policy focus — CL-CD-001, Director of Nursing Documentation Quality Oversight. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing ; Conduct a monthly clinical documentation audit per CO-DC-002 covering a random sample of ≥5% of all visit notes from the prior month. The audit shall assess: (a) presence of all required universal elements per Section 6.1.3; (b) individualization — no copy-forward or template language; (c) skilled documentation — clear demonstration of skilled care and medical necessity; (d) goal progress documentation — specific and measurable; (e) authentication completeness; (f) consistency with related clinical record entries; (g) timeliness per CL-CD-004 standards. ; Monthly. ; ; 6.5.2 ; Director of Nursing ; Document audit findings in the Documentation Quality Dashboard.",
      "Controlled-policy focus — CL-CD-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.110 ; Condition of Participation: Clinical Records ; Primary regulatory basis for clinical record standards ; ; 42 CFR § 484.110(a) ; Standard: Clinical records ; Requires complete, accurate, and promptly completed records ; ; 42 CFR § 484.110(b) ; Standard: Protection of records ; Record security and retention ; ; 42 CFR § 484.60(b) ; Conformance with physician orders ; Visit documentation must reflect the ordered plan of care ; 9.2 CMS Guidance ; Document ; Relevance ; ; ; ; ; CMS State Operations Manual, Appendix B, Tag G328 ; Survey guidance for clinical record requirements.",
      "Apply the controlled requirements to the three visible objects in the scene for summary, oasis/record completion, and closed-loop handoff. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Transition Folder", detail: "Review the transition folder for the patient-specific finding. Reconcile it with the risk card, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Risk Card", detail: "Review the risk card for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the transition folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-006" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "transition-folder-7-1", label: "transition folder", shortLabel: "transition folder", ariaLabel: "Investigate transition folder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the transition folder as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the risk card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with risk card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the transition folder as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the risk card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with risk card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the transition folder as the complete assessment and do not compare the risk card, patient report, or current record. This identify option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for summary, oasis/record completion, and closed-loop handoff." },
          { id: "i3", label: "Carry forward the prior visit conclusion for summary, oasis/record completion, and closed-loop handoff without reassessing the patient today. This identify option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about transition folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the transition folder alone and seek clarification only after the intervention is complete. This decide option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for transition folder is resolved." },
          { id: "d3", label: "Defer the concern in the transition folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during summary, oasis/record completion, and closed-loop handoff." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For transition folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For transition folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the transition folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of transition folder." },
          { id: "doc3", label: "Keep the transition folder decision in personal notes rather than the governed patient record. This document option concerns transition folder during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for summary, oasis/record completion, and closed-loop handoff." },
        ],
        feedback: {
          observed: "Observe the transition folder as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the risk card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the transition folder as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the risk card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with risk card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For transition folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "risk-card-7-2", label: "risk card", shortLabel: "risk card", ariaLabel: "Investigate risk card",        x: 30, y: 56, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the risk card as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For risk card, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the risk card as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For risk card, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the risk card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for summary, oasis/record completion, and closed-loop handoff." },
          { id: "i3", label: "Dismiss the conflict between the risk card and phone because one source appears more convenient. This identify option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about risk card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to risk card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to risk card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the risk card without confirming an applicable order and patient-specific authority. This decide option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for risk card is resolved." },
          { id: "d3", label: "Hand the risk card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during summary, oasis/record completion, and closed-loop handoff." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For risk card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For risk card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the risk card before reassessment confirms the patient response. This document option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of risk card." },
          { id: "doc3", label: "Copy the prior summary, oasis/record completion, and closed-loop handoff narrative even though today’s risk card evidence is different. This document option concerns risk card during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for summary, oasis/record completion, and closed-loop handoff." },
        ],
        feedback: {
          observed: "Observe the risk card as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the risk card as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For risk card, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to risk card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For risk card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "phone-7-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the phone as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with transition folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with transition folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for summary, oasis/record completion, and closed-loop handoff." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for summary, oasis/record completion, and closed-loop handoff instead of the current controlled clinical pathway. This decide option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during summary, oasis/record completion, and closed-loop handoff." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with transition folder. This document option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during summary, oasis/record completion, and closed-loop handoff.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for summary, oasis/record completion, and closed-loop handoff." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for summary, oasis/record completion, and closed-loop handoff. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for summary, oasis/record completion, and closed-loop handoff, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with transition folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for summary, oasis/record completion, and closed-loop handoff. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-006","CL-CP-002","CL-CD-001","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)","42 CFR § 484.60(b)","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During begin individualized discharge planning at admission, the discharge folder conflicts with the rolling walker and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the discharge folder to the next routine visit even though its current clinical significance has not been assessed. This option concerns begin individualized discharge planning at admission.",
      "Proceed using the discharge folder alone and seek clarification only after the intervention is complete. This option concerns begin individualized discharge planning at admission.",
      "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the rolling walker is unchanged from the prior encounter and omit patient-specific reassessment during begin individualized discharge planning at admission.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for begin individualized discharge planning at admission within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 2,
    stem: "During measure goal progress, readiness, caregiver capacity, and barriers, the functional resistance band conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during measure goal progress, readiness, caregiver capacity, and barriers.",
      "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the functional resistance band without confirming an applicable order and patient-specific authority. This option concerns measure goal progress, readiness, caregiver capacity, and barriers.",
      "Hand the functional resistance band concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns measure goal progress, readiness, caregiver capacity, and barriers.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for measure goal progress, readiness, caregiver capacity, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 3,
    stem: "During recertification eligibility, continued skilled need, and updated orders, the closed handoff folder conflicts with the packed travel bag and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the closed handoff folder issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns recertification eligibility, continued skilled need, and updated orders.",
      "Use a familiar local shortcut for recertification eligibility, continued skilled need, and updated orders instead of the current controlled clinical pathway. This option concerns recertification eligibility, continued skilled need, and updated orders.",
      "Assume the packed travel bag is unchanged from the prior encounter and omit patient-specific reassessment during recertification eligibility, continued skilled need, and updated orders.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for recertification eligibility, continued skilled need, and updated orders within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 4,
    stem: "During medication, equipment, service, and follow-up reconciliation, the closed teaching folder conflicts with the pill organizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the pill organizer is unchanged from the prior encounter and omit patient-specific reassessment during medication, equipment, service, and follow-up reconciliation.",
      "Defer the concern in the closed teaching folder to the next routine visit even though its current clinical significance has not been assessed. This option concerns medication, equipment, service, and follow-up reconciliation.",
      "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the closed teaching folder alone and seek clarification only after the intervention is complete. This option concerns medication, equipment, service, and follow-up reconciliation.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for medication, equipment, service, and follow-up reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 5,
    stem: "During teach-back of warning signs and transition instructions, the phone conflicts with the walker and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the walker is unchanged from the prior encounter and omit patient-specific reassessment during teach-back of warning signs and transition instructions.",
      "Hand the phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns teach-back of warning signs and transition instructions.",
      "Change the treatment, medication, device setting, or plan based on the phone without confirming an applicable order and patient-specific authority. This option concerns teach-back of warning signs and transition instructions.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for teach-back of warning signs and transition instructions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 6,
    stem: "During discharge, transfer, appeal, and provider communication, the medication organizer conflicts with the summary folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the medication organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns discharge, transfer, appeal, and provider communication.",
      "Assume the summary folder is unchanged from the prior encounter and omit patient-specific reassessment during discharge, transfer, appeal, and provider communication.",
      "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for discharge, transfer, appeal, and provider communication instead of the current controlled clinical pathway. This option concerns discharge, transfer, appeal, and provider communication.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for discharge, transfer, appeal, and provider communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 7,
    stem: "During summary, oasis/record completion, and closed-loop handoff, the phone conflicts with the transition folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the phone alone and seek clarification only after the intervention is complete. This option concerns summary, oasis/record completion, and closed-loop handoff.",
      "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the transition folder is unchanged from the prior encounter and omit patient-specific reassessment during summary, oasis/record completion, and closed-loop handoff.",
      "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This option concerns summary, oasis/record completion, and closed-loop handoff.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for summary, oasis/record completion, and closed-loop handoff within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-006, CL-CP-002, CL-CD-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Discharge Planning & Recertification?",
    options: [
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
    ],
    correct: 2,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the stethoscope and medication organizer into defensible RN practice for Discharge Planning & Recertification?",
    options: [
      "A familiar device display accepted without technique or context validation.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Discharge Planning & Recertification establish?",
    options: [
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Knowledge of the controlled RN concepts in Discharge Planning & Recertification, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Automatic authority to perform every activity discussed in Discharge Planning & Recertification without supervision.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
    ],
    correct: 1,
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
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55);padding:24px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(1120px,100%);max-height:min(90dvh,960px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:24px;border:1px solid #E2E8F0;box-shadow:0 24px 72px rgba(0,0,0,.28)}
@media (max-width:420px){
  .lvn002-top{height:auto;min-height:132px;align-content:center;flex-wrap:wrap;padding:6px 8px;gap:4px 8px}
  .lvn002-brand{font-size:13.5px;letter-spacing:.05em;max-width:240px}.lvn002-brand span.brand-text{display:inline}
  .lvn002-exit{margin-left:auto;padding:6px 8px;font-size:15px;min-height:36px}
  .lvn002-tabs{order:3;flex:0 0 100%;width:100%;padding-bottom:2px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));overflow:visible;gap:2px}.lvn002-tab{min-height:30px;padding:3px 2px;font-size:13.5px;white-space:normal;line-height:1.05;overflow:hidden}
  .lvn002-work{padding:6px;gap:6px;overflow-y:auto;overflow-x:hidden}.lvn002-left{max-height:none;padding:14px}.lvn002-left>div>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}
  .lvn002-right{min-height:314px;padding:4px}.lvn002-stage{border-radius:8px}.lvn002-hotspot .orb{width:40px;height:40px;min-width:40px;min-height:40px}.lvn002-hotspot .tag{font-size:12px;max-width:96px;white-space:normal;overflow:visible;text-overflow:clip;padding:3px 5px;line-height:1.05;overflow-wrap:anywhere}
  .lvn002-scene-title{max-width:62%!important;padding:5px 7px!important}.lvn002-scene-title>div:first-child{font-size:13.5px!important}.lvn002-scene-title>div:last-child{font-size:15px!important}
  .lvn002-bot{height:62px;padding:0 6px;gap:3px}.lvn002-bot button.nav,.lvn002-bot button.next{font-size:13.5px;letter-spacing:.03em;padding:6px;white-space:normal;line-height:1.1}.lvn002-bot button.next{max-width:140px}.lvn002-footer-status{min-width:0}.lvn002-footer-status span{font-size:12px!important;padding:5px!important;letter-spacing:.02em!important;text-align:center}
  .lvn002-modal{padding:12px;align-items:center}.lvn002-modal-card{border-radius:20px;max-height:calc(100dvh - 24px)}
}
`;

function FeedbackBlock({ label, body, accent, icon }: { label: string; body: string; accent?: boolean; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: 12, borderRadius: 12, border: `1px solid ${accent ? CI.tealMuted : CI.border}`, background: accent ? CI.tealSoft : CI.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: accent ? CI.teal : CI.muted, marginBottom: 6 }}>{icon}{label}</div>
      <div style={{ fontSize: 31, lineHeight: 1.6, color: CI.ink }}>{body}</div>
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


const STORAGE_KEY = 'rn-012-progress-v6000';

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

export default function RN012() {
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
            alt="Care Indeed Home Health Care"
            width={32}
            height={32}
            style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0, pointerEvents: 'none', userSelect: 'none' }}
          />
          <span className="brand-text">RN-012 — Discharge</span>
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
