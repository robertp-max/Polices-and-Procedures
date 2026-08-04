/**
 * RN-002 — Comprehensive Patient Assessment
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
import img01 from './assets/rn-002/rn-002-lesson-01.png';
import img02 from './assets/rn-002/rn-002-lesson-02.png';
import img03 from './assets/rn-002/rn-002-lesson-03.png';
import img04 from './assets/rn-002/rn-002-lesson-04.png';
import img05 from './assets/rn-002/rn-002-lesson-05.png';
import img06 from './assets/rn-002/rn-002-lesson-06.png';
import img07 from './assets/rn-002/rn-002-lesson-07.png';

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

const MODULE_META = { id: "RN-002", title: "Comprehensive Patient Assessment", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Referral, orders, eligibility, and pre-assessment preparation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Identity, history, medication, and source reconciliation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Head-to-toe examination, vital signs, pain, and symptom burden, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Functional, cognitive, behavioral, and standardized assessment, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Home environment, caregiver capacity, social needs, and safety, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Homebound status, skilled need, patient goals, and discharge potential, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Assessment synthesis, OASIS linkage, plan of care, and documentation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Referra",
    title: "Referral, orders, eligibility, and pre-assessment preparation",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for referral, orders, eligibility, and pre-assessment preparation within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-001, CL-CP-001, CL-SD-001, CL-CA-006, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-001, Pre-Assessment Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Verify that the assigned RN has completed the agency's Comprehensive Assessment Competency Program (Appendix A) and is listed on the OASIS Authorized Assessor Roster before independently conducting assessments. A newly hired RN who has not completed the competency program shall conduct their first SOC assessment under direct supervision of the Director of Nursing or a preceptor RN. ; Before the first independent assessment assignment. ; ; 6.1.2 ; Assigned RN ; Before the SOC visit, review all available referral documentation: hospital discharge summary (including hospital course, surgical reports, discharge diagnoses, discharge medications, follow-up instructions); physician referral and.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-SD-001, Pre-Visit Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN / LVN ; Before each visit, review the patient's current plan of care, active physician orders, medication list, recent visit notes from all disciplines, and any outstanding clinical alerts or coordination notes in the EHR. Identify the clinical purpose of the visit and the specific assessments and interventions to be completed. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN / LVN ; Verify that all supplies, equipment, and educational materials needed for the visit are available and in working condition. If the visit requires specialized supplies (wound care supplies, IV supplies, injection supplies), confirm availability.",
      "Controlled-policy focus — CL-CA-006, F2F Identification at Intake. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake / Clinical Coordinator ; At the time of referral receipt, identify the patient's most recent encounter with a qualifying practitioner and whether that encounter falls within the F2F window relative to the anticipated SOC date. Document the encounter date, the practitioner's name and credentials, and the encounter setting (office, hospital, SNF, telehealth) in the intake record. ; At referral receipt. ; ; 6.1.2 ; Intake / Clinical Coordinator ; If no encounter within the F2F window is identified at intake, immediately notify the Director of Nursing and the referring physician. Assess whether a qualifying encounter can occur before or promptly.",
      "Controlled-policy focus — CL-CP-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Completed plan of care ; Patient-specific plan of care including all required elements per Section 6.2 ; Assigned RN ; EHR — patient clinical record ; Developed within 24 hours of SOC visit; retained for minimum 7 years per CO-HP-007 ; ; Physician-signed plan of care ; Signed and dated CMS-485 or EHR equivalent ; Certifying physician / Medical Records ; EHR — patient clinical record ; Received and filed before claim submission; retained minimum 7 years ; ; Plan of care transmission record ; Documentation of date, method, and recipient of transmission to physician ; Clinical Coordinator.",
      "Apply the controlled requirements to the three visible objects in the scene for referral, orders, eligibility, and pre-assessment preparation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Referral Folder Cover", detail: "Review the referral folder cover for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the hand sanitizer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Hand Sanitizer", detail: "Review the hand sanitizer for the patient-specific finding. Reconcile it with the referral folder cover, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
      { kind: "External Authority", text: "42 CFR § 484.55(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "referral-folder-cover-1-1", label: "referral folder cover", shortLabel: "referral folder cover", ariaLabel: "Investigate referral folder cover",        x: 24, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the referral folder cover as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For referral folder cover, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the referral folder cover as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For referral folder cover, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the referral folder cover as the complete assessment and do not compare the blood-pressure cuff, patient report, or current record. This identify option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for referral, orders, eligibility, and pre-assessment preparation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for referral, orders, eligibility, and pre-assessment preparation without reassessing the patient today. This identify option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about referral folder cover." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to referral folder cover; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to referral folder cover; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the referral folder cover alone and seek clarification only after the intervention is complete. This decide option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for referral folder cover is resolved." },
          { id: "d3", label: "Defer the concern in the referral folder cover to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during referral, orders, eligibility, and pre-assessment preparation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For referral folder cover, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For referral folder cover, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the referral folder cover was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of referral folder cover." },
          { id: "doc3", label: "Keep the referral folder cover decision in personal notes rather than the governed patient record. This document option concerns referral folder cover during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral, orders, eligibility, and pre-assessment preparation." },
        ],
        feedback: {
          observed: "Observe the referral folder cover as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the referral folder cover as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For referral folder cover, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to referral folder cover; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For referral folder cover, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "blood-pressure-cuff-1-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 34, y: 69, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the hand sanitizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with hand sanitizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the hand sanitizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with hand sanitizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the blood-pressure cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for referral, orders, eligibility, and pre-assessment preparation." },
          { id: "i3", label: "Dismiss the conflict between the blood-pressure cuff and hand sanitizer because one source appears more convenient. This identify option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the blood-pressure cuff without confirming an applicable order and patient-specific authority. This decide option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Hand the blood-pressure cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during referral, orders, eligibility, and pre-assessment preparation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the blood-pressure cuff before reassessment confirms the patient response. This document option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Copy the prior referral, orders, eligibility, and pre-assessment preparation narrative even though today’s blood-pressure cuff evidence is different. This document option concerns blood-pressure cuff during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral, orders, eligibility, and pre-assessment preparation." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the hand sanitizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the hand sanitizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with hand sanitizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "hand-sanitizer-1-3", label: "hand sanitizer", shortLabel: "hand sanitizer", ariaLabel: "Investigate hand sanitizer",        x: 85, y: 60, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the hand sanitizer as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the referral folder cover, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For hand sanitizer, compare the visible evidence with referral folder cover and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the hand sanitizer as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the referral folder cover, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For hand sanitizer, compare the visible evidence with referral folder cover and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the hand sanitizer and omit the related change, symptom, or safety cue. This identify option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for referral, orders, eligibility, and pre-assessment preparation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified hand sanitizer stand in for direct RN assessment. This identify option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about hand sanitizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to hand sanitizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to hand sanitizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the hand sanitizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for hand sanitizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for referral, orders, eligibility, and pre-assessment preparation instead of the current controlled clinical pathway. This decide option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during referral, orders, eligibility, and pre-assessment preparation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For hand sanitizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For hand sanitizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the hand sanitizer and omit the discrepancy with referral folder cover. This document option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of hand sanitizer." },
          { id: "doc3", label: "Combine the hand sanitizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns hand sanitizer during referral, orders, eligibility, and pre-assessment preparation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for referral, orders, eligibility, and pre-assessment preparation." },
        ],
        feedback: {
          observed: "Observe the hand sanitizer as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the referral folder cover, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the hand sanitizer as patient-specific evidence for referral, orders, eligibility, and pre-assessment preparation. Compare it with the referral folder cover, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for referral, orders, eligibility, and pre-assessment preparation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For hand sanitizer, compare the visible evidence with referral folder cover and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to hand sanitizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for referral, orders, eligibility, and pre-assessment preparation. For hand sanitizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Identit",
    title: "Identity, history, medication, and source reconciliation",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for identity, history, medication, and source reconciliation within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-001, CL-SD-001, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-SD-001, Skilled Nursing Visit Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Upon arrival, verify patient identity using two patient identifiers per OP-PA-002. Perform hand hygiene per CL-SD-016. ; At the start of each visit. ; ; 6.2.2 ; Assigned RN / LVN ; Conduct a focused clinical assessment appropriate to the patient's diagnoses and current status, including at minimum: (a) vital signs — blood pressure, pulse, temperature, respiratory rate, oxygen saturation (as indicated); (b) pain assessment per CL-SD-014; (c) cardiopulmonary assessment for patients with cardiac or respiratory diagnoses; (d) wound assessment for patients with active wounds per CL-SD-011; (e) neurological assessment for patients with neurological conditions; (f).",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Controlled-policy focus — CL-SD-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Skilled Nursing Service ; A service that requires the skills of a registered nurse or licensed vocational nurse and is reasonable and necessary for the treatment of the patient's illness or injury, as defined in the CMS Home Health Benefit Manual, Chapter 7, § 40. ; ; Clinical Purpose ; The specific, documented clinical reason for a skilled nursing visit, directly tied to a physician order and the plan of care. ; ; Focused Assessment ; A clinical assessment targeted to the patient's active diagnoses, current symptoms, and plan of care goals, as distinguished from a comprehensive assessment (which is governed by CL-CA-001). ; ; Skilled Intervention ; A clinical.",
      "Controlled-policy focus — CL-SD-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Visit notes that read as routine vital-sign checks without skilled assessment or intervention ; Medicare coverage denial; ADR denial; False Claims Act risk ; Train all nurses on skilled documentation standards; Director of Nursing audits monthly ; ; LVN performing OASIS assessments or comprehensive assessments ; Scope of practice violation; CMS deficiency; OASIS data invalidation ; Restrict OASIS and comprehensive assessment access in EHR to RN credentials only ; ; Visit conducted without reviewing current plan of care ; Services may not align with physician orders ; EHR workflow requires plan of care acknowledgment before visit note entry ; ; Medication review not documented at each.",
      "Apply the controlled requirements to the three visible objects in the scene for identity, history, medication, and source reconciliation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "ID Card", detail: "Review the ID card for the patient-specific finding. Reconcile it with the unlabeled medication bottles, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Unlabeled Medication Bottles", detail: "Review the unlabeled medication bottles for the patient-specific finding. Reconcile it with the closed hospital folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Closed Hospital Folder", detail: "Review the closed hospital folder for the patient-specific finding. Reconcile it with the ID card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.55(a)" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "id-card-2-1", label: "ID card", shortLabel: "ID card", ariaLabel: "Investigate ID card",        x: 14, y: 57, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the ID card as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the unlabeled medication bottles, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For ID card, compare the visible evidence with unlabeled medication bottles and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the ID card as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the unlabeled medication bottles, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For ID card, compare the visible evidence with unlabeled medication bottles and the controlling source before classifying status." },
          { id: "i2", label: "Assume the ID card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for identity, history, medication, and source reconciliation." },
          { id: "i3", label: "Dismiss the conflict between the ID card and unlabeled medication bottles because one source appears more convenient. This identify option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about ID card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to ID card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to ID card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the ID card without confirming an applicable order and patient-specific authority. This decide option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for ID card is resolved." },
          { id: "d3", label: "Hand the ID card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during identity, history, medication, and source reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For ID card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For ID card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the ID card before reassessment confirms the patient response. This document option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of ID card." },
          { id: "doc3", label: "Copy the prior identity, history, medication, and source reconciliation narrative even though today’s ID card evidence is different. This document option concerns ID card during identity, history, medication, and source reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for identity, history, medication, and source reconciliation." },
        ],
        feedback: {
          observed: "Observe the ID card as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the unlabeled medication bottles, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the ID card as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the unlabeled medication bottles, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For ID card, compare the visible evidence with unlabeled medication bottles and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to ID card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For ID card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "unlabeled-medication-bottles-2-2", label: "unlabeled medication bottles", shortLabel: "unlabeled medication bottles", ariaLabel: "Investigate unlabeled medication bottles",        x: 32, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the unlabeled medication bottles as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the closed hospital folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled medication bottles, compare the visible evidence with closed hospital folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the unlabeled medication bottles as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the closed hospital folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled medication bottles, compare the visible evidence with closed hospital folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the unlabeled medication bottles and omit the related change, symptom, or safety cue. This identify option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for identity, history, medication, and source reconciliation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified unlabeled medication bottles stand in for direct RN assessment. This identify option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about unlabeled medication bottles." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled medication bottles; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled medication bottles; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the unlabeled medication bottles issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for unlabeled medication bottles is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for identity, history, medication, and source reconciliation instead of the current controlled clinical pathway. This decide option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during identity, history, medication, and source reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For unlabeled medication bottles, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For unlabeled medication bottles, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the unlabeled medication bottles and omit the discrepancy with closed hospital folder. This document option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of unlabeled medication bottles." },
          { id: "doc3", label: "Combine the unlabeled medication bottles issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns unlabeled medication bottles during identity, history, medication, and source reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for identity, history, medication, and source reconciliation." },
        ],
        feedback: {
          observed: "Observe the unlabeled medication bottles as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the closed hospital folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the unlabeled medication bottles as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the closed hospital folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled medication bottles, compare the visible evidence with closed hospital folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled medication bottles; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For unlabeled medication bottles, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "closed-hospital-folder-2-3", label: "closed hospital folder", shortLabel: "closed hospital folder", ariaLabel: "Investigate closed hospital folder",        x: 82, y: 65, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the closed hospital folder as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the ID card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed hospital folder, compare the visible evidence with ID card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed hospital folder as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the ID card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed hospital folder, compare the visible evidence with ID card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the closed hospital folder as the complete assessment and do not compare the ID card, patient report, or current record. This identify option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for identity, history, medication, and source reconciliation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for identity, history, medication, and source reconciliation without reassessing the patient today. This identify option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed hospital folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed hospital folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed hospital folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the closed hospital folder alone and seek clarification only after the intervention is complete. This decide option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed hospital folder is resolved." },
          { id: "d3", label: "Defer the concern in the closed hospital folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during identity, history, medication, and source reconciliation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For closed hospital folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For closed hospital folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the closed hospital folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed hospital folder." },
          { id: "doc3", label: "Keep the closed hospital folder decision in personal notes rather than the governed patient record. This document option concerns closed hospital folder during identity, history, medication, and source reconciliation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for identity, history, medication, and source reconciliation." },
        ],
        feedback: {
          observed: "Observe the closed hospital folder as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the ID card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed hospital folder as patient-specific evidence for identity, history, medication, and source reconciliation. Compare it with the ID card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for identity, history, medication, and source reconciliation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed hospital folder, compare the visible evidence with ID card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed hospital folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for identity, history, medication, and source reconciliation. For closed hospital folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Head-to",
    title: "Head-to-toe examination, vital signs, pain, and symptom burden",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for head-to-toe examination, vital signs, pain, and symptom burden within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-001, CL-CA-005, CL-SD-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CA-005, 5\\. Definitions. Term ; Definition ; ; ; ; ; Homebound Status ; The CMS-defined patient characteristic required for Medicare home health eligibility: the patient has a condition due to illness or injury that restricts their ability to leave home, and leaving home requires considerable and taxing effort, as defined in 42 CFR § 409.42(a). ; ; Normal Inability to Leave Home ; The condition of a patient whose medical condition would normally keep them confined to the home — i.e., most patients with the same diagnosis and functional status would be unable to leave home freely. ; ; Considerable and Taxing Effort ; The degree of effort required for a homebound patient to leave the home — it must.",
      "Controlled-policy focus — CL-CA-005, Homebound Status Monitoring During the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; At every skilled visit, document objective clinical indicators relevant to homebound status as part of the visit note: vital signs before and after any observed exertion; ambulation distance and quality; transfer assistance required; dyspnea assessment before and after activity. These routine visit note entries constitute the clinical evidentiary record that supports continued homebound status between OASIS assessments. ; At each skilled visit. ; ; 6.4.2 ; Assigned RN ; If the patient reports or demonstrates a significant improvement in functional status suggesting they may no longer be homebound — such as returning to driving, ambulating independently in the.",
      "Controlled-policy focus — CL-SD-001, Visit Documentation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN / LVN ; Document the visit note in the EHR within 24 hours of the visit per CL-CD-004. The visit note shall include, at minimum: (a) date and time of the visit; (b) the clinical purpose of the visit; (c) subjective data — patient and caregiver reports; (d) objective data — all assessment findings including vital signs, physical findings, and clinical observations; (e) assessment — the nurse's clinical assessment and professional judgment regarding the patient's current status and response to care; (f) plan — actions taken, interventions provided, education given, physician notifications made, referrals initiated, and the plan for.",
      "Controlled-policy focus — CL-CA-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Comprehensive Assessment ; The full, multidimensional clinical assessment of a home health patient required by 42 CFR § 484.55, incorporating all required OASIS data elements and all clinical domains specified in this policy. Only a registered nurse may complete this assessment. ; ; OASIS (Outcome and Assessment Information Set) ; The standardized data collection instrument mandated by CMS for Medicare-certified home health agencies, used to measure patient outcomes and clinical characteristics and to inform PDGM payment classification. The current version is OASIS-E2. ; ; OASIS Assessment Time Points ; The specific clinical events that trigger a required OASIS assessment: Start of Care (SOC), Resumption of Care (ROC), Recertification (RECERT), Follow-Up.",
      "Apply the controlled requirements to the three visible objects in the scene for head-to-toe examination, vital signs, pain, and symptom burden. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the thermometer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Thermometer", detail: "Review the thermometer for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
      { kind: "External Authority", text: "42 CFR § 484.55(b)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "stethoscope-3-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the stethoscope as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the thermometer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with thermometer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the thermometer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with thermometer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stethoscope and omit the related change, symptom, or safety cue. This identify option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe examination, vital signs, pain, and symptom burden." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stethoscope stand in for direct RN assessment. This identify option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for head-to-toe examination, vital signs, pain, and symptom burden instead of the current controlled clinical pathway. This decide option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stethoscope and omit the discrepancy with thermometer. This document option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Combine the stethoscope issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stethoscope during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the thermometer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the thermometer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with thermometer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "thermometer-3-2", label: "thermometer", shortLabel: "thermometer", ariaLabel: "Investigate thermometer",        x: 54, y: 71, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the thermometer as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For thermometer, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the thermometer as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For thermometer, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Treat the thermometer as the complete assessment and do not compare the pulse oximeter, patient report, or current record. This identify option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe examination, vital signs, pain, and symptom burden." },
          { id: "i3", label: "Carry forward the prior visit conclusion for head-to-toe examination, vital signs, pain, and symptom burden without reassessing the patient today. This identify option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about thermometer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to thermometer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to thermometer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the thermometer alone and seek clarification only after the intervention is complete. This decide option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for thermometer is resolved." },
          { id: "d3", label: "Defer the concern in the thermometer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For thermometer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For thermometer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the thermometer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of thermometer." },
          { id: "doc3", label: "Keep the thermometer decision in personal notes rather than the governed patient record. This document option concerns thermometer during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        feedback: {
          observed: "Observe the thermometer as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the thermometer as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For thermometer, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to thermometer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For thermometer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "pulse-oximeter-3-3", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 79, y: 42, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the pulse oximeter as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Assume the pulse oximeter establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe examination, vital signs, pain, and symptom burden." },
          { id: "i3", label: "Dismiss the conflict between the pulse oximeter and stethoscope because one source appears more convenient. This identify option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the pulse oximeter without confirming an applicable order and patient-specific authority. This decide option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Hand the pulse oximeter concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the pulse oximeter before reassessment confirms the patient response. This document option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Copy the prior head-to-toe examination, vital signs, pain, and symptom burden narrative even though today’s pulse oximeter evidence is different. This document option concerns pulse oximeter during head-to-toe examination, vital signs, pain, and symptom burden.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe examination, vital signs, pain, and symptom burden." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for head-to-toe examination, vital signs, pain, and symptom burden. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe examination, vital signs, pain, and symptom burden, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe examination, vital signs, pain, and symptom burden. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Functio",
    title: "Functional, cognitive, behavioral, and standardized assessment",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for functional, cognitive, behavioral, and standardized assessment within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CA-001, Pre-Assessment Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Verify that the assigned RN has completed the agency's Comprehensive Assessment Competency Program (Appendix A) and is listed on the OASIS Authorized Assessor Roster before independently conducting assessments. A newly hired RN who has not completed the competency program shall conduct their first SOC assessment under direct supervision of the Director of Nursing or a preceptor RN. ; Before the first independent assessment assignment. ; ; 6.1.2 ; Assigned RN ; Before the SOC visit, review all available referral documentation: hospital discharge summary (including hospital course, surgical reports, discharge diagnoses, discharge medications, follow-up instructions); physician referral and.",
      "Controlled-policy focus — CL-CA-001, Recertification and Subsequent Assessments. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; Conduct each subsequent OASIS assessment (ROC, RECERT, FU, TRN, DC) as a complete, contemporaneous assessment of the patient's current status — not an update of the prior assessment. Each assessment independently reflects what the patient's status is at the moment of that specific assessment. ; At each applicable OASIS time point. ; ; 6.5.2 ; Assigned RN ; At RECERT, evaluate all assessment domains per Section 6.2, identifying changes from the SOC baseline. Document the patient's progress, any new or worsened conditions, and the clinical basis for continued eligibility (continued homebound status, continued need for skilled services)..",
      "Controlled-policy focus — CL-CA-001, 4\\. Policy Statement. 4.1 A comprehensive patient assessment shall be completed by a qualified registered nurse at the Start of Care visit and at all subsequent applicable OASIS time points. The comprehensive assessment shall begin at the time of the first billable visit — the SOC visit — and shall be completed at the patient's home. 4.2 Only a registered nurse currently licensed by the California Board of Registered Nursing and meeting the assessment competency requirements of this policy may complete a comprehensive assessment for home health patients. Licensed vocational nurses, therapists, and other clinical disciplines shall not complete comprehensive assessments or OASIS assessments independently, regardless of the clinical services they provide. 4.3 The comprehensive assessment shall be completed within 5.",
      "Controlled-policy focus — CL-CA-001, Assessment-to-Plan of Care Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; Following completion of the comprehensive assessment, develop the plan of care per CL-CP-001, ensuring direct traceability from every plan of care element to a specific finding in the comprehensive assessment. Every diagnosis in the plan of care shall correspond to a documented clinical finding. Every service and discipline ordered shall be justified by an assessed need. Every goal shall address a specific functional deficit or clinical problem identified in the assessment. ; Within 24 hours of the SOC assessment. ; ; 6.4.2 ; Assigned RN ; Obtain discipline-specific evaluations from PT, OT, SLP, and MSW within the timeframes.",
      "Apply the controlled requirements to the three visible objects in the scene for functional, cognitive, behavioral, and standardized assessment. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Rolling Walker", detail: "Review the rolling walker for the patient-specific finding. Reconcile it with the shower chair, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Shower Chair", detail: "Review the shower chair for the patient-specific finding. Reconcile it with the three memory objects, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Three Memory Objects", detail: "Review the three memory objects for the patient-specific finding. Reconcile it with the rolling walker, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.55(b)" },
      { kind: "External Authority", text: "42 CFR § 484.55(c)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "rolling-walker-4-1", label: "rolling walker", shortLabel: "rolling walker", ariaLabel: "Investigate rolling walker",        x: 16, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the rolling walker as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with shower chair and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the rolling walker as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with shower chair and the controlling source before classifying status." },
          { id: "i2", label: "Treat the rolling walker as the complete assessment and do not compare the shower chair, patient report, or current record. This identify option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, behavioral, and standardized assessment." },
          { id: "i3", label: "Carry forward the prior visit conclusion for functional, cognitive, behavioral, and standardized assessment without reassessing the patient today. This identify option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about rolling walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the rolling walker alone and seek clarification only after the intervention is complete. This decide option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for rolling walker is resolved." },
          { id: "d3", label: "Defer the concern in the rolling walker to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, behavioral, and standardized assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For rolling walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For rolling walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the rolling walker was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of rolling walker." },
          { id: "doc3", label: "Keep the rolling walker decision in personal notes rather than the governed patient record. This document option concerns rolling walker during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, behavioral, and standardized assessment." },
        ],
        feedback: {
          observed: "Observe the rolling walker as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the rolling walker as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For rolling walker, compare the visible evidence with shower chair and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to rolling walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For rolling walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "shower-chair-4-2", label: "shower chair", shortLabel: "shower chair", ariaLabel: "Investigate shower chair",        x: 38, y: 42, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the shower chair as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the three memory objects, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with three memory objects and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the shower chair as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the three memory objects, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with three memory objects and the controlling source before classifying status." },
          { id: "i2", label: "Assume the shower chair establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, behavioral, and standardized assessment." },
          { id: "i3", label: "Dismiss the conflict between the shower chair and three memory objects because one source appears more convenient. This identify option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about shower chair." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the shower chair without confirming an applicable order and patient-specific authority. This decide option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for shower chair is resolved." },
          { id: "d3", label: "Hand the shower chair concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, behavioral, and standardized assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For shower chair, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For shower chair, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the shower chair before reassessment confirms the patient response. This document option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of shower chair." },
          { id: "doc3", label: "Copy the prior functional, cognitive, behavioral, and standardized assessment narrative even though today’s shower chair evidence is different. This document option concerns shower chair during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, behavioral, and standardized assessment." },
        ],
        feedback: {
          observed: "Observe the shower chair as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the three memory objects, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the shower chair as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the three memory objects, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with three memory objects and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For shower chair, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "three-memory-objects-4-3", label: "three memory objects", shortLabel: "three memory objects", ariaLabel: "Investigate three memory objects",        x: 77, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the three memory objects as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three memory objects, compare the visible evidence with rolling walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the three memory objects as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three memory objects, compare the visible evidence with rolling walker and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the three memory objects and omit the related change, symptom, or safety cue. This identify option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, behavioral, and standardized assessment." },
          { id: "i3", label: "Let a blank, unreadable, or unverified three memory objects stand in for direct RN assessment. This identify option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about three memory objects." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three memory objects; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three memory objects; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the three memory objects issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for three memory objects is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for functional, cognitive, behavioral, and standardized assessment instead of the current controlled clinical pathway. This decide option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, behavioral, and standardized assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For three memory objects, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For three memory objects, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the three memory objects and omit the discrepancy with rolling walker. This document option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of three memory objects." },
          { id: "doc3", label: "Combine the three memory objects issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns three memory objects during functional, cognitive, behavioral, and standardized assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, behavioral, and standardized assessment." },
        ],
        feedback: {
          observed: "Observe the three memory objects as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the three memory objects as patient-specific evidence for functional, cognitive, behavioral, and standardized assessment. Compare it with the rolling walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, behavioral, and standardized assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three memory objects, compare the visible evidence with rolling walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three memory objects; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, behavioral, and standardized assessment. For three memory objects, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Home",
    title: "Home environment, caregiver capacity, social needs, and safety",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for home environment, caregiver capacity, social needs, and safety within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-005, Homebound Documentation Standards. All homebound documentation shall include the following elements, written with patient-specific clinical content: ; Documentation Element ; Required Content ; Example of Adequate Documentation ; Example of Inadequate Documentation ; ; ; ; ; ; ; Medical condition causing inability to leave home ; The specific medical diagnosis or condition that restricts the patient from leaving home — not merely the diagnosis code ; \"Patient has severe biventricular heart failure (NYHA Class III) with persistent lower extremity edema 3+ bilateral and dyspnea at rest on 2L nasal cannula\" ; \"Patient has CHF\" or \"Patient has cardiac condition\" ; ; Specific functional limitations ; The precise functional impairments that result from the medical condition and make leaving home require.",
      "Controlled-policy focus — CL-CA-005, Homebound Assessment at Subsequent Time Points. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; At each RECERT assessment, independently reassess the patient's homebound status. A patient who met homebound criteria at SOC may or may not continue to meet criteria at RECERT — functional improvement may make leaving home less taxing, or functional decline may strengthen the homebound determination. Each RECERT homebound narrative shall be freshly written based on the patient's current status. ; During each RECERT visit. ; ; 6.2.2 ; Assigned RN ; At each OASIS time point, verify that homebound status has been re-assessed and that the homebound documentation reflects the patient's current functional limitations — not prior documentation..",
      "Controlled-policy focus — CL-CA-005, Homebound Determination at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, conduct a specific, focused homebound assessment that addresses both CMS criteria independently. Do not assume homebound status based on the patient's diagnosis or prior documentation from another setting. The homebound determination is made by the assessing RN based on direct clinical assessment at the time of the visit. ; During the SOC visit. ; ; 6.1.2 ; Assigned RN ; To assess Criterion 1 (condition-based normal inability to leave home), evaluate: what medical condition is restricting the patient's ability to leave the home? Is the restriction due to the illness or injury, or due.",
      "Controlled-policy focus — CL-CA-005, 4\\. Policy Statement. 4.1 A patient is homebound for purposes of Medicare home health eligibility if and only if both of the following criteria are met simultaneously: (a) Criterion 1 — Condition-Based Normal Inability to Leave Home: Due to illness or injury, the patient has a condition that restricts their ability to leave the home. This means the patient has a medical condition that would normally cause an individual to be confined to the home. A person who is not confined, or is confined only for non-medical reasons (e.g., lack of transportation, personal preference, caregiver unavailability), does not meet the homebound criteria. (b) Criterion 2 — Considerable and Taxing Effort: Leaving the home requires a considerable and taxing effort by the.",
      "Controlled-policy focus — CL-CA-005, Homebound Status Monitoring During the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; At every skilled visit, document objective clinical indicators relevant to homebound status as part of the visit note: vital signs before and after any observed exertion; ambulation distance and quality; transfer assistance required; dyspnea assessment before and after activity. These routine visit note entries constitute the clinical evidentiary record that supports continued homebound status between OASIS assessments. ; At each skilled visit. ; ; 6.4.2 ; Assigned RN ; If the patient reports or demonstrates a significant improvement in functional status suggesting they may no longer be homebound — such as returning to driving, ambulating independently in the.",
      "Apply the controlled requirements to the three visible objects in the scene for home environment, caregiver capacity, social needs, and safety. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Walker", detail: "Review the walker for the patient-specific finding. Reconcile it with the loose rug edge, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Loose Rug Edge", detail: "Review the loose rug edge for the patient-specific finding. Reconcile it with the caregiver support chair, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Caregiver Support Chair", detail: "Review the caregiver support chair for the patient-specific finding. Reconcile it with the walker, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.55(c)" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "walker-5-1", label: "walker", shortLabel: "walker", ariaLabel: "Investigate walker",        x: 27, y: 41, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the walker as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the loose rug edge, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with loose rug edge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the walker as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the loose rug edge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with loose rug edge and the controlling source before classifying status." },
          { id: "i2", label: "Assume the walker establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for home environment, caregiver capacity, social needs, and safety." },
          { id: "i3", label: "Dismiss the conflict between the walker and loose rug edge because one source appears more convenient. This identify option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the walker without confirming an applicable order and patient-specific authority. This decide option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for walker is resolved." },
          { id: "d3", label: "Hand the walker concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during home environment, caregiver capacity, social needs, and safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the walker before reassessment confirms the patient response. This document option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of walker." },
          { id: "doc3", label: "Copy the prior home environment, caregiver capacity, social needs, and safety narrative even though today’s walker evidence is different. This document option concerns walker during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for home environment, caregiver capacity, social needs, and safety." },
        ],
        feedback: {
          observed: "Observe the walker as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the loose rug edge, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the walker as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the loose rug edge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with loose rug edge and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "loose-rug-edge-5-2", label: "loose rug edge", shortLabel: "loose rug edge", ariaLabel: "Investigate loose rug edge",        x: 49, y: 72, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the loose rug edge as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the caregiver support chair, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For loose rug edge, compare the visible evidence with caregiver support chair and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the loose rug edge as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the caregiver support chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For loose rug edge, compare the visible evidence with caregiver support chair and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the loose rug edge and omit the related change, symptom, or safety cue. This identify option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for home environment, caregiver capacity, social needs, and safety." },
          { id: "i3", label: "Let a blank, unreadable, or unverified loose rug edge stand in for direct RN assessment. This identify option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about loose rug edge." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to loose rug edge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to loose rug edge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the loose rug edge issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for loose rug edge is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for home environment, caregiver capacity, social needs, and safety instead of the current controlled clinical pathway. This decide option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during home environment, caregiver capacity, social needs, and safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For loose rug edge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For loose rug edge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the loose rug edge and omit the discrepancy with caregiver support chair. This document option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of loose rug edge." },
          { id: "doc3", label: "Combine the loose rug edge issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns loose rug edge during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for home environment, caregiver capacity, social needs, and safety." },
        ],
        feedback: {
          observed: "Observe the loose rug edge as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the caregiver support chair, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the loose rug edge as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the caregiver support chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For loose rug edge, compare the visible evidence with caregiver support chair and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to loose rug edge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For loose rug edge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "caregiver-support-chair-5-3", label: "caregiver support chair", shortLabel: "caregiver support chair", ariaLabel: "Investigate caregiver support chair",        x: 81, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the caregiver support chair as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For caregiver support chair, compare the visible evidence with walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the caregiver support chair as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For caregiver support chair, compare the visible evidence with walker and the controlling source before classifying status." },
          { id: "i2", label: "Treat the caregiver support chair as the complete assessment and do not compare the walker, patient report, or current record. This identify option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for home environment, caregiver capacity, social needs, and safety." },
          { id: "i3", label: "Carry forward the prior visit conclusion for home environment, caregiver capacity, social needs, and safety without reassessing the patient today. This identify option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about caregiver support chair." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to caregiver support chair; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to caregiver support chair; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the caregiver support chair alone and seek clarification only after the intervention is complete. This decide option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for caregiver support chair is resolved." },
          { id: "d3", label: "Defer the concern in the caregiver support chair to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during home environment, caregiver capacity, social needs, and safety." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For caregiver support chair, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For caregiver support chair, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the caregiver support chair was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of caregiver support chair." },
          { id: "doc3", label: "Keep the caregiver support chair decision in personal notes rather than the governed patient record. This document option concerns caregiver support chair during home environment, caregiver capacity, social needs, and safety.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for home environment, caregiver capacity, social needs, and safety." },
        ],
        feedback: {
          observed: "Observe the caregiver support chair as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the caregiver support chair as patient-specific evidence for home environment, caregiver capacity, social needs, and safety. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for home environment, caregiver capacity, social needs, and safety, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For caregiver support chair, compare the visible evidence with walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to caregiver support chair; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for home environment, caregiver capacity, social needs, and safety. For caregiver support chair, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Homebou",
    title: "Homebound status, skilled need, patient goals, and discharge potential",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for homebound status, skilled need, patient goals, and discharge potential within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-005, CL-CA-001, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-005, Homebound Assessment at Subsequent Time Points. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; At each RECERT assessment, independently reassess the patient's homebound status. A patient who met homebound criteria at SOC may or may not continue to meet criteria at RECERT — functional improvement may make leaving home less taxing, or functional decline may strengthen the homebound determination. Each RECERT homebound narrative shall be freshly written based on the patient's current status. ; During each RECERT visit. ; ; 6.2.2 ; Assigned RN ; At each OASIS time point, verify that homebound status has been re-assessed and that the homebound documentation reflects the patient's current functional limitations — not prior documentation..",
      "Controlled-policy focus — CL-CA-005, Homebound Status Monitoring During the Episode. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; At every skilled visit, document objective clinical indicators relevant to homebound status as part of the visit note: vital signs before and after any observed exertion; ambulation distance and quality; transfer assistance required; dyspnea assessment before and after activity. These routine visit note entries constitute the clinical evidentiary record that supports continued homebound status between OASIS assessments. ; At each skilled visit. ; ; 6.4.2 ; Assigned RN ; If the patient reports or demonstrates a significant improvement in functional status suggesting they may no longer be homebound — such as returning to driving, ambulating independently in the.",
      "Controlled-policy focus — CL-CA-005, Homebound Determination at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, conduct a specific, focused homebound assessment that addresses both CMS criteria independently. Do not assume homebound status based on the patient's diagnosis or prior documentation from another setting. The homebound determination is made by the assessing RN based on direct clinical assessment at the time of the visit. ; During the SOC visit. ; ; 6.1.2 ; Assigned RN ; To assess Criterion 1 (condition-based normal inability to leave home), evaluate: what medical condition is restricting the patient's ability to leave the home? Is the restriction due to the illness or injury, or due.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Apply the controlled requirements to the three visible objects in the scene for homebound status, skilled need, patient goals, and discharge potential. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Walker", detail: "Review the walker for the patient-specific finding. Reconcile it with the home threshold step visible, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Home Threshold Step Visible", detail: "Review the home threshold step visible for the patient-specific finding. Reconcile it with the goal cards, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Goal Cards", detail: "Review the goal cards for the patient-specific finding. Reconcile it with the walker, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "walker-6-1", label: "walker", shortLabel: "walker", ariaLabel: "Investigate walker",        x: 17, y: 67, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the walker as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the home threshold step visible, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with home threshold step visible and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the walker as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the home threshold step visible, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with home threshold step visible and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the walker and omit the related change, symptom, or safety cue. This identify option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for homebound status, skilled need, patient goals, and discharge potential." },
          { id: "i3", label: "Let a blank, unreadable, or unverified walker stand in for direct RN assessment. This identify option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the walker issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for walker is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for homebound status, skilled need, patient goals, and discharge potential instead of the current controlled clinical pathway. This decide option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during homebound status, skilled need, patient goals, and discharge potential." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the walker and omit the discrepancy with home threshold step visible. This document option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of walker." },
          { id: "doc3", label: "Combine the walker issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns walker during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for homebound status, skilled need, patient goals, and discharge potential." },
        ],
        feedback: {
          observed: "Observe the walker as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the home threshold step visible, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the walker as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the home threshold step visible, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker, compare the visible evidence with home threshold step visible and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "home-threshold-step-visible-6-2", label: "home threshold step visible", shortLabel: "home threshold step visible", ariaLabel: "Investigate home threshold step visible",        x: 37, y: 39, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the home threshold step visible as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For home threshold step visible, compare the visible evidence with goal cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the home threshold step visible as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For home threshold step visible, compare the visible evidence with goal cards and the controlling source before classifying status." },
          { id: "i2", label: "Treat the home threshold step visible as the complete assessment and do not compare the goal cards, patient report, or current record. This identify option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for homebound status, skilled need, patient goals, and discharge potential." },
          { id: "i3", label: "Carry forward the prior visit conclusion for homebound status, skilled need, patient goals, and discharge potential without reassessing the patient today. This identify option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about home threshold step visible." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to home threshold step visible; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to home threshold step visible; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the home threshold step visible alone and seek clarification only after the intervention is complete. This decide option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for home threshold step visible is resolved." },
          { id: "d3", label: "Defer the concern in the home threshold step visible to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during homebound status, skilled need, patient goals, and discharge potential." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For home threshold step visible, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For home threshold step visible, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the home threshold step visible was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of home threshold step visible." },
          { id: "doc3", label: "Keep the home threshold step visible decision in personal notes rather than the governed patient record. This document option concerns home threshold step visible during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for homebound status, skilled need, patient goals, and discharge potential." },
        ],
        feedback: {
          observed: "Observe the home threshold step visible as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the home threshold step visible as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the goal cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For home threshold step visible, compare the visible evidence with goal cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to home threshold step visible; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For home threshold step visible, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "goal-cards-6-3", label: "goal cards", shortLabel: "goal cards", ariaLabel: "Investigate goal cards",        x: 75, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the goal cards as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the goal cards as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with walker and the controlling source before classifying status." },
          { id: "i2", label: "Assume the goal cards establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for homebound status, skilled need, patient goals, and discharge potential." },
          { id: "i3", label: "Dismiss the conflict between the goal cards and walker because one source appears more convenient. This identify option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about goal cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the goal cards without confirming an applicable order and patient-specific authority. This decide option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for goal cards is resolved." },
          { id: "d3", label: "Hand the goal cards concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during homebound status, skilled need, patient goals, and discharge potential." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For goal cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For goal cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the goal cards before reassessment confirms the patient response. This document option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of goal cards." },
          { id: "doc3", label: "Copy the prior homebound status, skilled need, patient goals, and discharge potential narrative even though today’s goal cards evidence is different. This document option concerns goal cards during homebound status, skilled need, patient goals, and discharge potential.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for homebound status, skilled need, patient goals, and discharge potential." },
        ],
        feedback: {
          observed: "Observe the goal cards as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the goal cards as patient-specific evidence for homebound status, skilled need, patient goals, and discharge potential. Compare it with the walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for homebound status, skilled need, patient goals, and discharge potential, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For goal cards, compare the visible evidence with walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to goal cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for homebound status, skilled need, patient goals, and discharge potential. For goal cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Assessm",
    title: "Assessment synthesis, OASIS linkage, plan of care, and documentation",
    subtitle: "Comprehensive Patient Assessment",
    narration: [
      "This lesson develops registered-nurse reasoning for assessment synthesis, oasis linkage, plan of care, and documentation within Comprehensive Patient Assessment. Use the current controlled requirements in CL-CA-001, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-001, Comprehensive Assessment — Required Domains and Content. Domain ; Required Assessment Elements ; ; ; ; ; 1. Sociodemographic ; Living situation; household members; primary language; education level; health literacy; cultural background relevant to care; social support system. ; ; 2. Medical History ; Primary diagnosis (chief reason for home health); all secondary diagnoses relevant to the episode; surgical history; relevant hospitalization history (past 12 months); current physician(s) and specialists; allergies (drug, food, environmental); advance directive status per CL-PR-002 and CL-SD-023; immunization status (influenza, pneumococcal, COVID-19, other). ; ; 3. Vital Signs and Physical Examination ; Blood pressure; heart rate (rate, rhythm, regularity); respiratory rate; temperature; oxygen saturation (room air and on supplemental oxygen if applicable); weight; height (BMI calculated); complete head-to-toe physical examination appropriate.",
      "Controlled-policy focus — CL-CP-001, Multidisciplinary Coordination in Plan of Care Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Ensure that all disciplines providing services to the patient have reviewed the plan of care and that their discipline-specific goals, interventions, and visit frequencies are accurately reflected. No discipline shall provide services that conflict with or exceed what is authorized in the plan of care without a new physician order. ; Within 48 hours of the SOC visit. ; ; 6.4.2 ; Each Clinical Discipline Provider ; Upon receiving a referral for a new patient, review the plan of care within 24 hours of assignment. Confirm that the ordered services are within the discipline's scope of practice.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CA-001, Assessment-to-Plan of Care Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; Following completion of the comprehensive assessment, develop the plan of care per CL-CP-001, ensuring direct traceability from every plan of care element to a specific finding in the comprehensive assessment. Every diagnosis in the plan of care shall correspond to a documented clinical finding. Every service and discipline ordered shall be justified by an assessed need. Every goal shall address a specific functional deficit or clinical problem identified in the assessment. ; Within 24 hours of the SOC assessment. ; ; 6.4.2 ; Assigned RN ; Obtain discipline-specific evaluations from PT, OT, SLP, and MSW within the timeframes.",
      "Controlled-policy focus — CL-CP-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Primary regulatory basis for plan of care requirements ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Defines required elements of the plan of care ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the physician-approved plan of care ; ; 42 CFR § 424.22 ; Requirements for home health services — plan of care and certifying physician ; Defines physician certification requirements for Medicare billing ; ; 42 CFR § 409.42 ; Skilled nursing.",
      "Apply the controlled requirements to the three visible objects in the scene for assessment synthesis, oasis linkage, plan of care, and documentation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Closed Assessment Folder", detail: "Review the closed assessment folder for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the care-plan folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Care-plan Folder", detail: "Review the care-plan folder for the patient-specific finding. Reconcile it with the closed assessment folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-001" },
      { kind: "Controlled Policy", text: "CL-CA-005" },
      { kind: "Controlled Policy", text: "CL-CA-006" },
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "closed-assessment-folder-7-1", label: "closed assessment folder", shortLabel: "closed assessment folder", ariaLabel: "Investigate closed assessment folder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the closed assessment folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed assessment folder, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed assessment folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed assessment folder, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the closed assessment folder as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assessment synthesis, oasis linkage, plan of care, and documentation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for assessment synthesis, oasis linkage, plan of care, and documentation without reassessing the patient today. This identify option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed assessment folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed assessment folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed assessment folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the closed assessment folder alone and seek clarification only after the intervention is complete. This decide option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed assessment folder is resolved." },
          { id: "d3", label: "Defer the concern in the closed assessment folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For closed assessment folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For closed assessment folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the closed assessment folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed assessment folder." },
          { id: "doc3", label: "Keep the closed assessment folder decision in personal notes rather than the governed patient record. This document option concerns closed assessment folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        feedback: {
          observed: "Observe the closed assessment folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed assessment folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed assessment folder, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed assessment folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For closed assessment folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "stethoscope-7-2", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 31, y: 57, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the stethoscope as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with care-plan folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with care-plan folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assessment synthesis, oasis linkage, plan of care, and documentation." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and care-plan folder because one source appears more convenient. This identify option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior assessment synthesis, oasis linkage, plan of care, and documentation narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with care-plan folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
      {
        id: "care-plan-folder-7-3", label: "care-plan folder", shortLabel: "care-plan folder", ariaLabel: "Investigate care-plan folder",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the care-plan folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the closed assessment folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with closed assessment folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the care-plan folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the closed assessment folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with closed assessment folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the care-plan folder and omit the related change, symptom, or safety cue. This identify option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assessment synthesis, oasis linkage, plan of care, and documentation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified care-plan folder stand in for direct RN assessment. This identify option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the care-plan folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for care-plan folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for assessment synthesis, oasis linkage, plan of care, and documentation instead of the current controlled clinical pathway. This decide option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For care-plan folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For care-plan folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the care-plan folder and omit the discrepancy with closed assessment folder. This document option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of care-plan folder." },
          { id: "doc3", label: "Combine the care-plan folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns care-plan folder during assessment synthesis, oasis linkage, plan of care, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assessment synthesis, oasis linkage, plan of care, and documentation." },
        ],
        feedback: {
          observed: "Observe the care-plan folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the closed assessment folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the care-plan folder as patient-specific evidence for assessment synthesis, oasis linkage, plan of care, and documentation. Compare it with the closed assessment folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assessment synthesis, oasis linkage, plan of care, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with closed assessment folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assessment synthesis, oasis linkage, plan of care, and documentation. For care-plan folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-001","CL-CA-005","CL-CA-006","CL-SD-001","CL-CP-001","42 CFR § 484.55","42 CFR § 484.55(a)","42 CFR § 409.42(a)","42 CFR § 484.55(b)","42 CFR § 484.55(c)","42 CFR § 409.42","42 CFR § 484.60","42 CFR §484.110"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During referral, orders, eligibility, and pre-assessment preparation, the hand sanitizer conflicts with the referral folder cover and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the hand sanitizer alone and seek clarification only after the intervention is complete. This option concerns referral, orders, eligibility, and pre-assessment preparation.",
      "Defer the concern in the hand sanitizer to the next routine visit even though its current clinical significance has not been assessed. This option concerns referral, orders, eligibility, and pre-assessment preparation.",
      "Assume the referral folder cover is unchanged from the prior encounter and omit patient-specific reassessment during referral, orders, eligibility, and pre-assessment preparation.",
      "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for referral, orders, eligibility, and pre-assessment preparation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 2,
    stem: "During identity, history, medication, and source reconciliation, the closed hospital folder conflicts with the ID card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the ID card is unchanged from the prior encounter and omit patient-specific reassessment during identity, history, medication, and source reconciliation.",
      "Change the treatment, medication, device setting, or plan based on the closed hospital folder without confirming an applicable order and patient-specific authority. This option concerns identity, history, medication, and source reconciliation.",
      "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the closed hospital folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns identity, history, medication, and source reconciliation.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for identity, history, medication, and source reconciliation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 3,
    stem: "During head-to-toe examination, vital signs, pain, and symptom burden, the pulse oximeter conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the pulse oximeter issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns head-to-toe examination, vital signs, pain, and symptom burden.",
      "Use a familiar local shortcut for head-to-toe examination, vital signs, pain, and symptom burden instead of the current controlled clinical pathway. This option concerns head-to-toe examination, vital signs, pain, and symptom burden.",
      "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during head-to-toe examination, vital signs, pain, and symptom burden.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for head-to-toe examination, vital signs, pain, and symptom burden within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 4,
    stem: "During functional, cognitive, behavioral, and standardized assessment, the three memory objects conflicts with the rolling walker and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the rolling walker is unchanged from the prior encounter and omit patient-specific reassessment during functional, cognitive, behavioral, and standardized assessment.",
      "Defer the concern in the three memory objects to the next routine visit even though its current clinical significance has not been assessed. This option concerns functional, cognitive, behavioral, and standardized assessment.",
      "Proceed using the three memory objects alone and seek clarification only after the intervention is complete. This option concerns functional, cognitive, behavioral, and standardized assessment.",
      "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for functional, cognitive, behavioral, and standardized assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 5,
    stem: "During home environment, caregiver capacity, social needs, and safety, the caregiver support chair conflicts with the walker and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Change the treatment, medication, device setting, or plan based on the caregiver support chair without confirming an applicable order and patient-specific authority. This option concerns home environment, caregiver capacity, social needs, and safety.",
      "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the caregiver support chair concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns home environment, caregiver capacity, social needs, and safety.",
      "Assume the walker is unchanged from the prior encounter and omit patient-specific reassessment during home environment, caregiver capacity, social needs, and safety.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for home environment, caregiver capacity, social needs, and safety within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 6,
    stem: "During homebound status, skilled need, patient goals, and discharge potential, the goal cards conflicts with the walker and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for homebound status, skilled need, patient goals, and discharge potential instead of the current controlled clinical pathway. This option concerns homebound status, skilled need, patient goals, and discharge potential.",
      "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the goal cards issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns homebound status, skilled need, patient goals, and discharge potential.",
      "Assume the walker is unchanged from the prior encounter and omit patient-specific reassessment during homebound status, skilled need, patient goals, and discharge potential.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for homebound status, skilled need, patient goals, and discharge potential within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 7,
    stem: "During assessment synthesis, oasis linkage, plan of care, and documentation, the care-plan folder conflicts with the closed assessment folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the closed assessment folder is unchanged from the prior encounter and omit patient-specific reassessment during assessment synthesis, oasis linkage, plan of care, and documentation.",
      "Proceed using the care-plan folder alone and seek clarification only after the intervention is complete. This option concerns assessment synthesis, oasis linkage, plan of care, and documentation.",
      "Defer the concern in the care-plan folder to the next routine visit even though its current clinical significance has not been assessed. This option concerns assessment synthesis, oasis linkage, plan of care, and documentation.",
      "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for assessment synthesis, oasis linkage, plan of care, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-001, CL-CA-005, CL-CA-006, CL-SD-001, CL-CP-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.55 be used when applying Comprehensive Patient Assessment?",
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
    stem: "What connects the ID card and goal cards into defensible RN practice for Comprehensive Patient Assessment?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Comprehensive Patient Assessment establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in Comprehensive Patient Assessment, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Automatic authority to perform every activity discussed in Comprehensive Patient Assessment without supervision.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
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

/* RN-002 premium Journey visual system */
.lvn002,.lvn002 *{font-family:var(--font-family,'Roboto',system-ui,-apple-system,'Segoe UI',sans-serif);letter-spacing:0!important}
.lvn002-shell{background:#F2F5F4;color:#243331;font-size:15px}
.lvn002-top{height:72px;padding:0 24px;gap:20px;background:#FFFFFF;border-bottom:1px solid #DCE5E2;box-shadow:0 2px 12px rgba(28,57,53,.05)}
.lvn002-brand{min-width:304px;gap:11px;color:#174F49;font-size:15px;font-weight:800;text-transform:none}
.lvn002-brand img{width:34px;height:34px;object-fit:contain}
.lvn002-tabs{gap:3px;padding:4px;align-items:center;background:#F3F6F5;border:1px solid #E2E9E7;border-radius:8px}
.lvn002-tab{min-height:40px;padding:8px 11px;border-radius:6px;color:#52645F;font-size:13px;font-weight:700}
.lvn002-tab{display:inline-flex;align-items:center;justify-content:center;gap:6px}
.lvn002-tab-index{font-size:12px;font-weight:800}
.lvn002-tab-label{white-space:nowrap}
.lvn002-tab:hover{background:#E7EFED;color:#174F49}
.lvn002-tab.active{background:#0F5B54;color:#FFFFFF;box-shadow:0 3px 10px rgba(15,91,84,.18)}
.lvn002-tab.quiz-tab{border:0;border-left:1px solid #D8E1DE;border-radius:0 6px 6px 0;color:#9B3F19}
.lvn002-tab.quiz-tab.active{border-color:transparent;background:#A94018;color:#FFFFFF}
.lvn002-exit{min-height:40px;padding:8px 14px;border:1px solid #D8A28A;border-radius:6px;background:#FFF9F6;color:#9B3F19;font-size:13px;font-weight:800;text-transform:none}
.lvn002-exit:hover{background:#FFF1EA;border-color:#B94718}
.lvn002-work{width:100%;max-width:1600px;margin:0 auto;padding:20px 24px;gap:18px}
.lvn002-left{width:39%;min-width:380px;max-width:570px;padding:28px;overflow:auto;border:1px solid #DCE5E2;border-radius:8px;background:#FFFFFF;box-shadow:0 12px 32px rgba(31,59,54,.07)}
.lvn002-right{min-width:0;padding:8px;border:1px solid #D4DEDB;border-radius:8px;background:#E4EAE8;box-shadow:0 12px 32px rgba(31,59,54,.08)}
.lvn002-stage-wrap{display:flex;align-items:center;justify-content:center}
.lvn002-stage{width:100%;max-width:100%;aspect-ratio:16/13;border:0;border-radius:6px;background:#DCE5E2;box-shadow:none}
.lvn002-stage img.scene{filter:saturate(.94) contrast(1.02)}
.rn-left-panel-system{display:flex;min-height:100%;flex-direction:column}
.rn-lesson-kicker{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid #E5EBE9;color:#52645F;font-size:12px;font-weight:800;text-transform:uppercase}
.rn-lesson-kicker span:first-child{color:#A94018}
.rn-lesson-title{max-width:470px;margin:0 0 7px;color:#1F2C2A;font-size:29px;font-weight:800;line-height:1.16}
.rn-lesson-subtitle{margin:0 0 21px;color:#A94018;font-size:15px;font-weight:700;line-height:1.4}
.rn-focus-panel{margin-bottom:24px;padding:16px 17px;border:0;border-left:3px solid #0F5B54;border-radius:6px;background:#EDF4F2}
.rn-section-label,.rn-clinical-tip-label{display:flex;align-items:center;gap:7px;margin-bottom:7px;color:#0F5B54;font-size:12px;font-weight:800;text-transform:uppercase}
.rn-focus-panel p{margin:0;color:#334744;font-size:15px;line-height:1.6}
.rn-actions-section{margin-bottom:24px}
.rn-section-heading{margin:0 0 11px;color:#52645F;font-size:12px;font-weight:800;text-transform:uppercase}
.rn-key-action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.rn-action-card{display:flex;min-width:0;gap:11px;padding:14px;border:1px solid #E0E7E5;border-radius:6px;background:#FFFFFF;overflow:hidden;transition:border-color .18s ease,box-shadow .18s ease}
.rn-action-card:hover{border-color:#B7CECA;box-shadow:0 7px 18px rgba(31,59,54,.07)}
.rn-action-index{display:grid;width:28px;height:28px;min-width:28px;place-items:center;border-radius:50%;background:#EAF2F0;color:#0F5B54;font-size:11px;font-weight:800}
.rn-action-copy{min-width:0}
.rn-action-title{margin-bottom:4px;color:#22312E;font-size:14px;font-weight:800;line-height:1.3;overflow-wrap:anywhere}
.rn-action-detail{color:#596B67;font-size:13px;line-height:1.52;overflow-wrap:anywhere}
.rn-clinical-tip{margin-bottom:24px;padding:16px 17px;border:0;border-left:3px solid #B94718;border-radius:6px;background:#FBF3EF}
.rn-clinical-tip-label{color:#9B3F19}
.rn-clinical-tip-copy{color:#4E5553;font-size:14px;line-height:1.6}
.rn-sources-section{margin-bottom:18px}
.rn-source-list{display:flex;flex-wrap:wrap;gap:7px}
.rn-source-chip{display:inline-flex;gap:5px;padding:6px 8px;border:1px solid #DDE6E3;border-radius:4px;background:#F8FAF9;color:#425954;font-size:11px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}
.rn-source-chip strong{color:#0F5B54;font-weight:800}
.rn-lesson-details{margin:0;border:1px solid #DDE6E3;border-radius:6px;background:#F8FAF9}
.rn-lesson-details summary{padding:13px 14px;color:#174F49;font-size:13px;font-weight:800;cursor:pointer}
.rn-lesson-details-copy{padding:15px;border-top:1px solid #DDE6E3;background:#FFFFFF;color:#4E5E5A;font-size:14px;line-height:1.65}
.lvn002-scene-title{top:18px!important;left:18px!important;max-width:min(56%,390px)!important;padding:12px 14px!important;border:1px solid rgba(255,255,255,.78)!important;border-radius:6px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 8px 24px rgba(20,42,38,.16)!important;backdrop-filter:blur(10px)}
.lvn002-scene-title>div:first-child{margin-bottom:3px;color:#A94018!important;font-size:11px!important}
.lvn002-scene-title>div:last-child{color:#174F49!important;font-size:14px!important;line-height:1.35}
.lvn002-scene-progress{top:18px!important;right:18px!important;padding:8px 11px!important;border:1px solid rgba(255,255,255,.78)!important;border-radius:6px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 8px 22px rgba(20,42,38,.14)!important;backdrop-filter:blur(10px);font-size:12px!important}
.lvn002-hotspot{gap:6px}
.lvn002-hotspot .orb{width:46px;height:46px;min-width:46px;min-height:46px;border:2px solid #FFFFFF;box-shadow:0 7px 20px rgba(0,0,0,.24)}
.lvn002-hotspot .tag{max-width:170px;padding:6px 9px;border:0;border-radius:4px;background:rgba(255,255,255,.96);box-shadow:0 5px 15px rgba(0,0,0,.16);color:#174F49;font-size:11px}
.lvn002-bot{height:72px;padding:0 24px;border-top:1px solid #DCE5E2;background:#FFFFFF;box-shadow:0 -4px 16px rgba(31,59,54,.04)}
.lvn002-bot button.nav{padding:0 8px;color:#52645F;font-size:13px;text-transform:none}
.lvn002-bot button.next{min-height:42px;max-width:280px;padding:11px 17px;border-radius:6px;background:#A94018;font-size:13px;text-transform:none;box-shadow:0 5px 14px rgba(169,64,24,.2)}
.lvn002-footer-status span{padding:0!important;border:0!important;background:transparent!important;color:#52645F!important;font-size:12px!important;text-transform:none!important}
.lvn002-modal-card{border-radius:8px}
.lvn002-modal-card h2,.lvn002-modal-card h3{font-size:20px!important}
.lvn002-modal-card p,.lvn002-modal-card button{font-size:15px!important;line-height:1.55!important}
@media (max-width:1180px){
  .lvn002-top{padding:0 14px;gap:10px}
  .lvn002-brand{min-width:auto}
  .lvn002-brand .brand-text{display:none}
  .lvn002-tabs{flex:0 1 auto;justify-content:center}
  .lvn002-tab{width:40px;min-width:40px;padding:0;font-size:12px}
  .lvn002-tab-label{display:none}
  .lvn002-tab.quiz-tab{width:42px;border-left:0;border-radius:6px}
  .lvn002-work{padding:14px;gap:12px}
  .lvn002-left{width:41%;min-width:330px;padding:22px}
  .rn-lesson-title{font-size:26px}
}
@media (max-width:780px){
  .lvn002-top{height:auto;min-height:118px;padding:8px 10px;align-content:center;flex-wrap:wrap;gap:6px 10px}
  .lvn002-brand{font-size:13px}
  .lvn002-brand .brand-text{display:inline}
  .lvn002-exit{margin-left:auto}
  .lvn002-tabs{order:3;display:flex;width:100%;min-width:100%;flex:0 0 100%;overflow-x:auto}
  .lvn002-tab{flex:0 0 38px;width:38px;min-width:38px;min-height:36px;padding:0;font-size:11px}
  .lvn002-tab.quiz-tab{font-size:11px}
  .lvn002-tab.quiz-tab:after{content:none}
  .lvn002-work{flex-direction:column;overflow-y:auto;overflow-x:hidden;padding:10px;gap:10px}
  .lvn002-left,.lvn002-right{width:100%;min-width:0;max-width:none;border-radius:8px}
  .lvn002-left{max-height:none;padding:20px;overflow:visible}
  .lvn002-right{order:-1;flex:none;min-height:0;padding:6px;aspect-ratio:16/13}
  .lvn002-stage{width:100%;height:auto;border-radius:5px}
  .lvn002-bot{height:66px;padding:0 10px}
}
@media (max-width:520px){
  .lvn002-top{min-height:124px}
  .lvn002-tab{flex-basis:32px;width:32px;min-width:32px}
  .lvn002-tab.quiz-tab{width:32px;min-width:32px}
  .lvn002-brand .brand-text{display:none}
  .lvn002-work{padding:8px}
  .lvn002-left{padding:17px}
  .rn-lesson-title{font-size:24px}
  .rn-key-action-grid{grid-template-columns:1fr}
  .rn-action-card{grid-column:auto!important}
  .lvn002-right{min-height:0}
  .lvn002-scene-title{top:8px!important;left:8px!important;padding:8px 9px!important}
  .lvn002-scene-progress{top:8px!important;right:8px!important;padding:6px 8px!important}
  .lvn002-scene-progress svg{display:none}
  .lvn002-hotspot .tag{max-width:105px;font-size:9px}
  .lvn002-bot button.next{max-width:150px;padding:8px 10px;font-size:11px}
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
      <div className="rn-lesson-kicker">
        <span>{page.shortName}</span>
        <span>{String(pageIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
      <h1 className="rn-lesson-title">{page.title}</h1>
      <p className="rn-lesson-subtitle">{page.subtitle}</p>

      <section aria-label="Lesson focus" className="rn-focus-panel">
        <div className="rn-section-label"><Sparkles size={15} aria-hidden="true" />Lesson focus</div>
        <p>{focus}</p>
      </section>

      <section aria-labelledby={actionsId} className="rn-actions-section">
        <h2 id={actionsId} className="rn-section-heading">Key RN actions</h2>
        <div className="rn-key-action-grid">
          {page.keyPoints.map((kp, index) => (
            <article id={`kp-${page.id}-${index}`} key={`kp-${page.id}-${index}`} className="rn-action-card" style={{ gridColumn: page.keyPoints.length % 2 === 1 && index === page.keyPoints.length - 1 ? '1 / -1' : undefined }}>
              <span className="rn-action-index" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
              <div className="rn-action-copy">
                <div className="rn-action-title">{kp.title}</div>
                <div className="rn-action-detail">{kp.detail}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Clinical tip" className="rn-clinical-tip">
        <div className="rn-clinical-tip-label"><AlertCircle size={15} aria-hidden="true" />Clinical tip</div>
        <div className="rn-clinical-tip-copy">{page.clinicalTip}</div>
      </section>

      <section aria-labelledby={sourcesId} className="rn-sources-section">
        <h2 id={sourcesId} className="rn-section-heading">Sources &amp; standards</h2>
        <div className="rn-source-list">
          {page.sourceLabels.map((s) => (
            <span key={s.kind + s.text} className="rn-source-chip"><strong>{s.kind}</strong>{s.text}</span>
          ))}
        </div>
      </section>

      <details className="rn-lesson-details">
        <summary>Read full lesson details</summary>
        <div className="rn-lesson-details-copy">
          {page.narration.map((paragraph, index) => <p key={index} style={{ margin: index === page.narration.length - 1 ? 0 : '0 0 11px' }}>{paragraph}</p>)}
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
        <div className="lvn002-scene-progress" style={{ position: 'absolute', top: 10, right: 10, zIndex: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: '#fff', border: `1px solid ${CI.border}`, fontSize: 11, fontWeight: 800, color: CI.teal, pointerEvents: 'none' }} aria-hidden="true">
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


const STORAGE_KEY = 'rn-002-progress-v6000';

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

export default function RN002() {
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
          <span className="brand-text">RN-002 — Comprehensive Assessment</span>
        </div>
        <div className="lvn002-tabs" role="tablist" aria-label="Lessons">
          {PAGES.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={mode === 'lessons' && i === pageIndex}
              aria-label={`Lesson ${i + 1}: ${p.title}`} title={p.title}
              className={`lvn002-tab ${mode === 'lessons' && i === pageIndex ? 'active' : ''}`}
              onClick={() => { setMode('lessons'); setPageIndex(i); }}>
              <span className="lvn002-tab-index" aria-hidden="true">{i + 1}</span>
              <span className="lvn002-tab-label" aria-hidden="true">{p.shortName.replace(/^\d+\s*/, '')}</span>
            </button>
          ))}
          <button type="button" role="tab" aria-selected={mode === 'quiz'} aria-label="Knowledge Check" title="Knowledge Check"
            className={`lvn002-tab quiz-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span className="lvn002-tab-label" aria-hidden="true">Knowledge Check</span>
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
