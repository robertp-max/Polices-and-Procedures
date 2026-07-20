/**
 * RN-010 — Patient & Caregiver Education
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
import img01 from './assets/rn-010/rn-010-lesson-01.png';
import img02 from './assets/rn-010/rn-010-lesson-02.png';
import img03 from './assets/rn-010/rn-010-lesson-03.png';
import img04 from './assets/rn-010/rn-010-lesson-04.png';
import img05 from './assets/rn-010/rn-010-lesson-05.png';
import img06 from './assets/rn-010/rn-010-lesson-06.png';
import img07 from './assets/rn-010/rn-010-lesson-07.png';

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

const MODULE_META = { id: "RN-010", title: "Patient & Caregiver Education", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Assess readiness, preferences, language, cognition, and barriers, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Set patient-specific priorities and plain-language goals, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Use qualified interpreters and accessible materials, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Demonstration, chunk-and-check, and teach-back, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Medication, device, and warning-sign education, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Address failed teach-back and unsafe caregiver performance, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Document learner, method, response, barriers, and follow-up, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Assess",
    title: "Assess readiness, preferences, language, cognition, and barriers",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for assess readiness, preferences, language, cognition, and barriers within Patient & Caregiver Education. Use the current controlled requirements in CL-SD-017, OP-PA-004, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-017, Learning Needs Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, conduct a learning needs assessment including: (a) the patient's current knowledge of their diagnosis, medications, and self-management requirements; (b) the patient's preferred learning style; (c) identified barriers to learning (literacy, language, vision, hearing, cognitive status, emotional readiness); (d) the patient's and caregiver's goals for self-management; (e) cultural and spiritual factors affecting learning. ; At the SOC visit. ; ; 6.1.2 ; Assigned RN ; Based on the learning needs assessment, develop the Education Plan as part of the plan of care, identifying priority education topics, methods adapted to the patient's learning style and barriers, and target.",
      "Controlled-policy focus — OP-PA-004, 4\\. Compliance Monitoring. Indicator ; Method ; Standard ; ; ; ; ; ; Cultural assessment documented at SOC ; Chart audit ; ≥ 95% ; ; Cultural competency training completed by all staff ; Training records audit ; 100% ; ; No substantiated complaints of cultural insensitivity ; Complaint tracking ; 0 substantiated ; Appendix A — Cultural Competency Assessment Prompts CARE INDEED HOME HEALTH CARE, INC. Cultural Competency Assessment Prompts Policy Reference: OP-PA-004 ; Version: 6.0 For clinician use during SOC assessment. Document responses in the patient record. ; Assessment Domain ; Prompt Questions ; Patient Response/Notes ; ; ; ; ; ; Language ; What language do you prefer to speak? Do you need an interpreter? ; ______________________________.",
      "Controlled-policy focus — OP-PA-004, 3\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 3.1 ; SOC Clinician ; Assess cultural preferences during the comprehensive assessment including: (a) preferred language; (b) dietary preferences or restrictions; (c) religious/spiritual practices relevant to care; (d) cultural health beliefs or practices; (e) preferences regarding gender of caregiver; (f) family involvement preferences. Document in the patient record. ; At SOC assessment. ; ; 3.2 ; All Clinical Staff ; Incorporate documented cultural preferences into care delivery. If a cultural practice conflicts with a medical recommendation, discuss with the patient and document the discussion and patient's decision. ; At each visit. ; ; 3.3 ; HR Director / Operations Director ; Ensure cultural.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Apply the controlled requirements to the three visible objects in the scene for assess readiness, preferences, language, cognition, and barriers. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Visual-aid Cards", detail: "Review the visual-aid cards for the patient-specific finding. Reconcile it with the reading glasses, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Reading Glasses", detail: "Review the reading glasses for the patient-specific finding. Reconcile it with the simple anatomical heart model, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Simple Anatomical Heart Model", detail: "Review the simple anatomical heart model for the patient-specific finding. Reconcile it with the visual-aid cards, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.60(d)" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "visual-aid-cards-1-1", label: "visual-aid cards", shortLabel: "visual-aid cards", ariaLabel: "Investigate visual-aid cards",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the visual-aid cards as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For visual-aid cards, compare the visible evidence with reading glasses and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the visual-aid cards as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For visual-aid cards, compare the visible evidence with reading glasses and the controlling source before classifying status." },
          { id: "i2", label: "Treat the visual-aid cards as the complete assessment and do not compare the reading glasses, patient report, or current record. This identify option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assess readiness, preferences, language, cognition, and barriers." },
          { id: "i3", label: "Carry forward the prior visit conclusion for assess readiness, preferences, language, cognition, and barriers without reassessing the patient today. This identify option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about visual-aid cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to visual-aid cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to visual-aid cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the visual-aid cards alone and seek clarification only after the intervention is complete. This decide option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for visual-aid cards is resolved." },
          { id: "d3", label: "Defer the concern in the visual-aid cards to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assess readiness, preferences, language, cognition, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For visual-aid cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For visual-aid cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the visual-aid cards was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of visual-aid cards." },
          { id: "doc3", label: "Keep the visual-aid cards decision in personal notes rather than the governed patient record. This document option concerns visual-aid cards during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assess readiness, preferences, language, cognition, and barriers." },
        ],
        feedback: {
          observed: "Observe the visual-aid cards as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the visual-aid cards as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the reading glasses, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For visual-aid cards, compare the visible evidence with reading glasses and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to visual-aid cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For visual-aid cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "reading-glasses-1-2", label: "reading glasses", shortLabel: "reading glasses", ariaLabel: "Investigate reading glasses",        x: 48, y: 66, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the reading glasses as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the simple anatomical heart model, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with simple anatomical heart model and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the reading glasses as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the simple anatomical heart model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with simple anatomical heart model and the controlling source before classifying status." },
          { id: "i2", label: "Assume the reading glasses establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assess readiness, preferences, language, cognition, and barriers." },
          { id: "i3", label: "Dismiss the conflict between the reading glasses and simple anatomical heart model because one source appears more convenient. This identify option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about reading glasses." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the reading glasses without confirming an applicable order and patient-specific authority. This decide option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for reading glasses is resolved." },
          { id: "d3", label: "Hand the reading glasses concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assess readiness, preferences, language, cognition, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For reading glasses, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For reading glasses, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the reading glasses before reassessment confirms the patient response. This document option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reading glasses." },
          { id: "doc3", label: "Copy the prior assess readiness, preferences, language, cognition, and barriers narrative even though today’s reading glasses evidence is different. This document option concerns reading glasses during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assess readiness, preferences, language, cognition, and barriers." },
        ],
        feedback: {
          observed: "Observe the reading glasses as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the simple anatomical heart model, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the reading glasses as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the simple anatomical heart model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For reading glasses, compare the visible evidence with simple anatomical heart model and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to reading glasses; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For reading glasses, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "simple-anatomical-heart-model-1-3", label: "simple anatomical heart model", shortLabel: "simple anatomical heart model", ariaLabel: "Investigate simple anatomical heart model",        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the simple anatomical heart model as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the visual-aid cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple anatomical heart model, compare the visible evidence with visual-aid cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the simple anatomical heart model as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the visual-aid cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple anatomical heart model, compare the visible evidence with visual-aid cards and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the simple anatomical heart model and omit the related change, symptom, or safety cue. This identify option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assess readiness, preferences, language, cognition, and barriers." },
          { id: "i3", label: "Let a blank, unreadable, or unverified simple anatomical heart model stand in for direct RN assessment. This identify option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about simple anatomical heart model." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple anatomical heart model; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple anatomical heart model; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the simple anatomical heart model issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for simple anatomical heart model is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for assess readiness, preferences, language, cognition, and barriers instead of the current controlled clinical pathway. This decide option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assess readiness, preferences, language, cognition, and barriers." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For simple anatomical heart model, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For simple anatomical heart model, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the simple anatomical heart model and omit the discrepancy with visual-aid cards. This document option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of simple anatomical heart model." },
          { id: "doc3", label: "Combine the simple anatomical heart model issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns simple anatomical heart model during assess readiness, preferences, language, cognition, and barriers.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assess readiness, preferences, language, cognition, and barriers." },
        ],
        feedback: {
          observed: "Observe the simple anatomical heart model as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the visual-aid cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the simple anatomical heart model as patient-specific evidence for assess readiness, preferences, language, cognition, and barriers. Compare it with the visual-aid cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assess readiness, preferences, language, cognition, and barriers, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple anatomical heart model, compare the visible evidence with visual-aid cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple anatomical heart model; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assess readiness, preferences, language, cognition, and barriers. For simple anatomical heart model, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Set",
    title: "Set patient-specific priorities and plain-language goals",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for set patient-specific priorities and plain-language goals within Patient & Caregiver Education. Use the current controlled requirements in CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Plan of Care (POC) ; The written document, established by the home health agency and approved by the physician, that specifies the patient's diagnosis, functional limitations, types and frequency of services to be furnished, medications, treatments, safety measures, and patient goals. Referred to in CMS documentation as the CMS-485 or Home Health Certification and Plan of Care. ; ; Physician ; A doctor of medicine (MD) or osteopathy (DO) legally authorized to practice medicine. For home health purposes, the physician responsible for signing the plan of care must not be employed by or have a financial relationship with the agency that would constitute a violation of the Stark Law, per.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Controlled-policy focus — CL-CP-001, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify under Tag G160 (42 CFR § 484.60): Evidence that a plan of care exists for every patient. Surveyors will request clinical records and verify that a written, physician-approved plan of care exists for each active patient and for each certification period of sampled past patients. Missing plans of care or unsigned plans are Condition-level deficiency risks. Evidence that the plan of care contains all required elements. Surveyors will review plans of care for completeness per 42 CFR § 484.60(a). Commonly cited deficiencies include: missing homebound status narrative, vague or unmeasurable goals, incomplete medication lists, and visit frequencies that do not match.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Apply the controlled requirements to the three visible objects in the scene for set patient-specific priorities and plain-language goals. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet With Neutral Screen", detail: "Review the tablet with neutral screen for the patient-specific finding. Reconcile it with the dual headsets, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Dual Headsets", detail: "Review the dual headsets for the patient-specific finding. Reconcile it with the picture cards without text, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Picture Cards Without Text", detail: "Review the picture cards without text for the patient-specific finding. Reconcile it with the tablet with neutral screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "tablet-with-neutral-screen-2-1", label: "tablet with neutral screen", shortLabel: "tablet with neutral screen", ariaLabel: "Investigate tablet with neutral screen",        x: 14, y: 59, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the tablet with neutral screen as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the dual headsets, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with neutral screen, compare the visible evidence with dual headsets and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet with neutral screen as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the dual headsets, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with neutral screen, compare the visible evidence with dual headsets and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet with neutral screen establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for set patient-specific priorities and plain-language goals." },
          { id: "i3", label: "Dismiss the conflict between the tablet with neutral screen and dual headsets because one source appears more convenient. This identify option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet with neutral screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with neutral screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with neutral screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet with neutral screen without confirming an applicable order and patient-specific authority. This decide option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet with neutral screen is resolved." },
          { id: "d3", label: "Hand the tablet with neutral screen concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during set patient-specific priorities and plain-language goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For tablet with neutral screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For tablet with neutral screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet with neutral screen before reassessment confirms the patient response. This document option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet with neutral screen." },
          { id: "doc3", label: "Copy the prior set patient-specific priorities and plain-language goals narrative even though today’s tablet with neutral screen evidence is different. This document option concerns tablet with neutral screen during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for set patient-specific priorities and plain-language goals." },
        ],
        feedback: {
          observed: "Observe the tablet with neutral screen as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the dual headsets, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet with neutral screen as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the dual headsets, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with neutral screen, compare the visible evidence with dual headsets and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with neutral screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For tablet with neutral screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "dual-headsets-2-2", label: "dual headsets", shortLabel: "dual headsets", ariaLabel: "Investigate dual headsets",        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the dual headsets as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the picture cards without text, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dual headsets, compare the visible evidence with picture cards without text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the dual headsets as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the picture cards without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dual headsets, compare the visible evidence with picture cards without text and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the dual headsets and omit the related change, symptom, or safety cue. This identify option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for set patient-specific priorities and plain-language goals." },
          { id: "i3", label: "Let a blank, unreadable, or unverified dual headsets stand in for direct RN assessment. This identify option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about dual headsets." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dual headsets; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dual headsets; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the dual headsets issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for dual headsets is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for set patient-specific priorities and plain-language goals instead of the current controlled clinical pathway. This decide option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during set patient-specific priorities and plain-language goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For dual headsets, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For dual headsets, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the dual headsets and omit the discrepancy with picture cards without text. This document option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of dual headsets." },
          { id: "doc3", label: "Combine the dual headsets issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns dual headsets during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for set patient-specific priorities and plain-language goals." },
        ],
        feedback: {
          observed: "Observe the dual headsets as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the picture cards without text, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the dual headsets as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the picture cards without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dual headsets, compare the visible evidence with picture cards without text and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dual headsets; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For dual headsets, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "picture-cards-without-text-2-3", label: "picture cards without text", shortLabel: "picture cards without text", ariaLabel: "Investigate picture cards without text",        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the picture cards without text as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the tablet with neutral screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture cards without text, compare the visible evidence with tablet with neutral screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the picture cards without text as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the tablet with neutral screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture cards without text, compare the visible evidence with tablet with neutral screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat the picture cards without text as the complete assessment and do not compare the tablet with neutral screen, patient report, or current record. This identify option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for set patient-specific priorities and plain-language goals." },
          { id: "i3", label: "Carry forward the prior visit conclusion for set patient-specific priorities and plain-language goals without reassessing the patient today. This identify option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about picture cards without text." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture cards without text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture cards without text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the picture cards without text alone and seek clarification only after the intervention is complete. This decide option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for picture cards without text is resolved." },
          { id: "d3", label: "Defer the concern in the picture cards without text to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during set patient-specific priorities and plain-language goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For picture cards without text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For picture cards without text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the picture cards without text was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of picture cards without text." },
          { id: "doc3", label: "Keep the picture cards without text decision in personal notes rather than the governed patient record. This document option concerns picture cards without text during set patient-specific priorities and plain-language goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for set patient-specific priorities and plain-language goals." },
        ],
        feedback: {
          observed: "Observe the picture cards without text as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the tablet with neutral screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the picture cards without text as patient-specific evidence for set patient-specific priorities and plain-language goals. Compare it with the tablet with neutral screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for set patient-specific priorities and plain-language goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture cards without text, compare the visible evidence with tablet with neutral screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture cards without text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for set patient-specific priorities and plain-language goals. For picture cards without text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Use",
    title: "Use qualified interpreters and accessible materials",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for use qualified interpreters and accessible materials within Patient & Caregiver Education. Use the current controlled requirements in CL-SD-017, OP-PA-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-017, 4\\. Policy Statement. 4.1 An individualized Education Plan shall be developed as part of the plan of care for every patient at SOC, identifying: (a) learning needs based on the comprehensive assessment; (b) learning goals; (c) education topics; (d) the patient's and caregiver's preferred learning style (visual, verbal, demonstration, written materials); (e) learning barriers (literacy, language, cognition, vision, hearing, cultural factors); (f) strategies to address identified barriers. 4.2 Patient education shall be provided at every skilled visit, integrated into the clinical care — not delivered as a separate, unrelated activity. Education shall be directly relevant to the visit's clinical purpose and the patient's current status and needs. 4.3 All education shall be documented with specificity sufficient to demonstrate the skilled nature.",
      "Controlled-policy focus — CL-SD-017, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Learning needs assessment ; Documented in the SOC assessment ; Assigned RN ; EHR — assessment module ; At SOC ; ; Education Plan ; Documented in the plan of care ; Assigned RN ; EHR — plan of care ; Within 24 hours of SOC ; ; Education at every visit ; Topic, method, content, response, plan documented in visit note per Section 6.3.1 ; All clinical disciplines ; EHR — visit note ; Within 24 hours of each visit ; ; Discharge education ; Discharge instructions and final teach-back ; Assigned RN ; EHR — visit.",
      "Controlled-policy focus — OP-PA-003, 2\\. Policy Statements. 2.1 The agency shall provide meaningful access to services for all patients regardless of their primary language. 2.2 At the time of intake and admission, the patient's preferred language shall be assessed and documented. 2.3 Qualified interpreter services (in-person, telephonic, or video) shall be provided at no cost to the patient during all clinical encounters, care coordination activities, and patient rights notification. 2.4 Family members, friends, and minor children shall NOT be used as interpreters for clinical communication unless the patient specifically requests it after being informed of the availability of free professional interpreter services, and the request is documented. 2.5 Key documents (patient rights, advance directive information, HIPAA notice, consent forms) shall be available in the prevalent.",
      "Controlled-policy focus — OP-PA-003, 3\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 3.1 ; Intake Coordinator ; Assess and document the patient's preferred language during intake. If LEP is identified, document interpreter needs in the patient record and communicate to all assigned clinicians. ; At intake. ; ; 3.2 ; Operations Director ; Maintain a contract with a qualified telephonic or video interpreter service. Ensure service is available 24/7 for emergencies and during all business hours for routine care. ; Continuous. ; ; 3.3 ; All Clinical Staff ; For LEP patients, arrange interpreter services BEFORE the visit. Do not attempt to deliver clinical care, obtain consent, or provide patient education without qualified interpretation..",
      "Controlled-policy focus — CL-SD-017, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Education documented at every skilled visit ; Monthly chart audit ; ≥95% ; ; Education documentation includes topic, method, content, and teach-back response ; Chart audit for specificity ; ≥90% ; ; Learning needs assessment at SOC ; SOC chart audit ; ≥95% ; ; Education materials provided in patient's primary language ; Chart audit; patient interview ; ≥95%.",
      "Apply the controlled requirements to the three visible objects in the scene for use qualified interpreters and accessible materials. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Three Picture Cards", detail: "Review the three picture cards for the patient-specific finding. Reconcile it with the simple pill organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Simple Pill Organizer", detail: "Review the simple pill organizer for the patient-specific finding. Reconcile it with the small hourglass, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Small Hourglass", detail: "Review the small hourglass for the patient-specific finding. Reconcile it with the three picture cards, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "three-picture-cards-3-1", label: "three picture cards", shortLabel: "three picture cards", ariaLabel: "Investigate three picture cards",        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the three picture cards as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the simple pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three picture cards, compare the visible evidence with simple pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the three picture cards as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the simple pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three picture cards, compare the visible evidence with simple pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the three picture cards and omit the related change, symptom, or safety cue. This identify option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for use qualified interpreters and accessible materials." },
          { id: "i3", label: "Let a blank, unreadable, or unverified three picture cards stand in for direct RN assessment. This identify option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about three picture cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three picture cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three picture cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the three picture cards issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for three picture cards is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for use qualified interpreters and accessible materials instead of the current controlled clinical pathway. This decide option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during use qualified interpreters and accessible materials." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For three picture cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For three picture cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the three picture cards and omit the discrepancy with simple pill organizer. This document option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of three picture cards." },
          { id: "doc3", label: "Combine the three picture cards issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns three picture cards during use qualified interpreters and accessible materials.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for use qualified interpreters and accessible materials." },
        ],
        feedback: {
          observed: "Observe the three picture cards as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the simple pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the three picture cards as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the simple pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three picture cards, compare the visible evidence with simple pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three picture cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For three picture cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "simple-pill-organizer-3-2", label: "simple pill organizer", shortLabel: "simple pill organizer", ariaLabel: "Investigate simple pill organizer",        x: 55, y: 76, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the simple pill organizer as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the small hourglass, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple pill organizer, compare the visible evidence with small hourglass and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the simple pill organizer as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the small hourglass, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple pill organizer, compare the visible evidence with small hourglass and the controlling source before classifying status." },
          { id: "i2", label: "Treat the simple pill organizer as the complete assessment and do not compare the small hourglass, patient report, or current record. This identify option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for use qualified interpreters and accessible materials." },
          { id: "i3", label: "Carry forward the prior visit conclusion for use qualified interpreters and accessible materials without reassessing the patient today. This identify option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about simple pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the simple pill organizer alone and seek clarification only after the intervention is complete. This decide option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for simple pill organizer is resolved." },
          { id: "d3", label: "Defer the concern in the simple pill organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during use qualified interpreters and accessible materials." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For simple pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For simple pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the simple pill organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of simple pill organizer." },
          { id: "doc3", label: "Keep the simple pill organizer decision in personal notes rather than the governed patient record. This document option concerns simple pill organizer during use qualified interpreters and accessible materials.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for use qualified interpreters and accessible materials." },
        ],
        feedback: {
          observed: "Observe the simple pill organizer as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the small hourglass, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the simple pill organizer as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the small hourglass, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For simple pill organizer, compare the visible evidence with small hourglass and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to simple pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For simple pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "small-hourglass-3-3", label: "small hourglass", shortLabel: "small hourglass", ariaLabel: "Investigate small hourglass",        x: 77, y: 45, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the small hourglass as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the three picture cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small hourglass, compare the visible evidence with three picture cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the small hourglass as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the three picture cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small hourglass, compare the visible evidence with three picture cards and the controlling source before classifying status." },
          { id: "i2", label: "Assume the small hourglass establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for use qualified interpreters and accessible materials." },
          { id: "i3", label: "Dismiss the conflict between the small hourglass and three picture cards because one source appears more convenient. This identify option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about small hourglass." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small hourglass; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small hourglass; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the small hourglass without confirming an applicable order and patient-specific authority. This decide option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for small hourglass is resolved." },
          { id: "d3", label: "Hand the small hourglass concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during use qualified interpreters and accessible materials." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For small hourglass, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For small hourglass, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the small hourglass before reassessment confirms the patient response. This document option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of small hourglass." },
          { id: "doc3", label: "Copy the prior use qualified interpreters and accessible materials narrative even though today’s small hourglass evidence is different. This document option concerns small hourglass during use qualified interpreters and accessible materials.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for use qualified interpreters and accessible materials." },
        ],
        feedback: {
          observed: "Observe the small hourglass as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the three picture cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the small hourglass as patient-specific evidence for use qualified interpreters and accessible materials. Compare it with the three picture cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for use qualified interpreters and accessible materials, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small hourglass, compare the visible evidence with three picture cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small hourglass; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for use qualified interpreters and accessible materials. For small hourglass, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Demonst",
    title: "Demonstration, chunk-and-check, and teach-back",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for demonstration, chunk-and-check, and teach-back within Patient & Caregiver Education. Use the current controlled requirements in CL-SD-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-017, Education Delivery at Every Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; All Clinical Disciplines ; At every skilled visit, identify at least one education topic relevant to the visit's clinical purpose and the patient's current learning needs. Prioritize education based on patient safety — teach the most critical self-management skills first (when to call 911, medication safety, fall prevention). ; At every visit. ; ; 6.2.2 ; All Clinical Disciplines ; Deliver education using the patient's preferred learning method. For complex topics, use multiple methods (verbal explanation + written handout + demonstration). For patients with low health literacy, use plain language, visual aids, and the teach-back method. ; During the visit..",
      "Controlled-policy focus — CL-SD-017, 4\\. Policy Statement. 4.1 An individualized Education Plan shall be developed as part of the plan of care for every patient at SOC, identifying: (a) learning needs based on the comprehensive assessment; (b) learning goals; (c) education topics; (d) the patient's and caregiver's preferred learning style (visual, verbal, demonstration, written materials); (e) learning barriers (literacy, language, cognition, vision, hearing, cultural factors); (f) strategies to address identified barriers. 4.2 Patient education shall be provided at every skilled visit, integrated into the clinical care — not delivered as a separate, unrelated activity. Education shall be directly relevant to the visit's clinical purpose and the patient's current status and needs. 4.3 All education shall be documented with specificity sufficient to demonstrate the skilled nature.",
      "Controlled-policy focus — CL-SD-017, Education Documentation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; All Clinical Disciplines ; Document all education in the visit note with the following specificity: (a) Topic: The specific subject taught (e.g., \"Insulin injection self-administration technique\"); (b) Method: How the education was delivered (e.g., \"Verbal instruction with return demonstration\"); (c) Content: What was specifically taught (e.g., \"Reviewed injection site rotation: abdomen, thighs, upper arms; demonstrated proper angle and technique; reviewed signs of hypoglycemia\"); (d) Response: Patient's/caregiver's demonstrated understanding via teach-back (e.g., \"Patient correctly demonstrated subcutaneous injection into the abdomen with proper site selection, 90-degree angle, and skin pinch. Patient correctly identified 3 signs of hypoglycemia: shakiness, sweating, confusion.\"); (e) Plan: Areas.",
      "Controlled-policy focus — CL-SD-017, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; \"Patient educated on disease management\" — no specifics ; Survey deficiency; ADR denial for non-skilled documentation ; Structured education documentation template in EHR ; ; Same education topics repeated at every visit without adaptation ; Suggests education is not individualized or responsive ; Require documentation of patient's current knowledge and new topics at each visit ; ; Teach-back not performed or documented ; Unable to demonstrate education effectiveness ; Include teach-back as mandatory visit note field ; ; Education not adapted for low health literacy ; Ineffective education; patient safety risk ; Train all staff on plain language and health literacy-appropriate communication.",
      "Controlled-policy focus — CL-SD-017, 5\\. Definitions. Term ; Definition ; ; ; ; ; Patient Education ; The planned, systematic process of providing instruction and counseling to patients and caregivers to promote health, prevent illness, manage chronic conditions, and support self-care after discharge. ; ; Self-Management ; The patient's ability to independently manage their health condition(s) including medication management, symptom monitoring, dietary management, activity management, and knowing when to seek medical attention. ; ; Teach-Back Method ; An evidence-based technique for assessing patient understanding by asking the patient to explain or demonstrate what they have been taught, in their own words or actions. ; ; Learning Assessment ; The evaluation of a patient's current knowledge, skills, readiness to learn, preferred learning style, and barriers.",
      "Apply the controlled requirements to the three visible objects in the scene for demonstration, chunk-and-check, and teach-back. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Inhaler Spacer", detail: "Review the inhaler spacer for the patient-specific finding. Reconcile it with the picture card, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Picture Card", detail: "Review the picture card for the patient-specific finding. Reconcile it with the mirror, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Mirror", detail: "Review the mirror for the patient-specific finding. Reconcile it with the inhaler spacer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "inhaler-spacer-4-1", label: "inhaler spacer", shortLabel: "inhaler spacer", ariaLabel: "Investigate inhaler spacer",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the inhaler spacer as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the picture card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with picture card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the inhaler spacer as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the picture card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with picture card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the inhaler spacer as the complete assessment and do not compare the picture card, patient report, or current record. This identify option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for demonstration, chunk-and-check, and teach-back." },
          { id: "i3", label: "Carry forward the prior visit conclusion for demonstration, chunk-and-check, and teach-back without reassessing the patient today. This identify option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about inhaler spacer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the inhaler spacer alone and seek clarification only after the intervention is complete. This decide option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for inhaler spacer is resolved." },
          { id: "d3", label: "Defer the concern in the inhaler spacer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during demonstration, chunk-and-check, and teach-back." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For inhaler spacer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the inhaler spacer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of inhaler spacer." },
          { id: "doc3", label: "Keep the inhaler spacer decision in personal notes rather than the governed patient record. This document option concerns inhaler spacer during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for demonstration, chunk-and-check, and teach-back." },
        ],
        feedback: {
          observed: "Observe the inhaler spacer as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the picture card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the inhaler spacer as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the picture card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For inhaler spacer, compare the visible evidence with picture card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to inhaler spacer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For inhaler spacer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "picture-card-4-2", label: "picture card", shortLabel: "picture card", ariaLabel: "Investigate picture card",        x: 39, y: 49, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the picture card as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the mirror, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture card, compare the visible evidence with mirror and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the picture card as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the mirror, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture card, compare the visible evidence with mirror and the controlling source before classifying status." },
          { id: "i2", label: "Assume the picture card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for demonstration, chunk-and-check, and teach-back." },
          { id: "i3", label: "Dismiss the conflict between the picture card and mirror because one source appears more convenient. This identify option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about picture card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the picture card without confirming an applicable order and patient-specific authority. This decide option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for picture card is resolved." },
          { id: "d3", label: "Hand the picture card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during demonstration, chunk-and-check, and teach-back." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For picture card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For picture card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the picture card before reassessment confirms the patient response. This document option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of picture card." },
          { id: "doc3", label: "Copy the prior demonstration, chunk-and-check, and teach-back narrative even though today’s picture card evidence is different. This document option concerns picture card during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for demonstration, chunk-and-check, and teach-back." },
        ],
        feedback: {
          observed: "Observe the picture card as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the mirror, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the picture card as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the mirror, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture card, compare the visible evidence with mirror and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For picture card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "mirror-4-3", label: "mirror", shortLabel: "mirror", ariaLabel: "Investigate mirror",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the mirror as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For mirror, compare the visible evidence with inhaler spacer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the mirror as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For mirror, compare the visible evidence with inhaler spacer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the mirror and omit the related change, symptom, or safety cue. This identify option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for demonstration, chunk-and-check, and teach-back." },
          { id: "i3", label: "Let a blank, unreadable, or unverified mirror stand in for direct RN assessment. This identify option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about mirror." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to mirror; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to mirror; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the mirror issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for mirror is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for demonstration, chunk-and-check, and teach-back instead of the current controlled clinical pathway. This decide option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during demonstration, chunk-and-check, and teach-back." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For mirror, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For mirror, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the mirror and omit the discrepancy with inhaler spacer. This document option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mirror." },
          { id: "doc3", label: "Combine the mirror issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns mirror during demonstration, chunk-and-check, and teach-back.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for demonstration, chunk-and-check, and teach-back." },
        ],
        feedback: {
          observed: "Observe the mirror as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the mirror as patient-specific evidence for demonstration, chunk-and-check, and teach-back. Compare it with the inhaler spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for demonstration, chunk-and-check, and teach-back, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For mirror, compare the visible evidence with inhaler spacer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to mirror; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for demonstration, chunk-and-check, and teach-back. For mirror, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Medicat",
    title: "Medication, device, and warning-sign education",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for medication, device, and warning-sign education within Patient & Caregiver Education. Use the current controlled requirements in CL-SD-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-017, Education Delivery at Every Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; All Clinical Disciplines ; At every skilled visit, identify at least one education topic relevant to the visit's clinical purpose and the patient's current learning needs. Prioritize education based on patient safety — teach the most critical self-management skills first (when to call 911, medication safety, fall prevention). ; At every visit. ; ; 6.2.2 ; All Clinical Disciplines ; Deliver education using the patient's preferred learning method. For complex topics, use multiple methods (verbal explanation + written handout + demonstration). For patients with low health literacy, use plain language, visual aids, and the teach-back method. ; During the visit..",
      "Controlled-policy focus — CL-SD-017, Education Documentation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; All Clinical Disciplines ; Document all education in the visit note with the following specificity: (a) Topic: The specific subject taught (e.g., \"Insulin injection self-administration technique\"); (b) Method: How the education was delivered (e.g., \"Verbal instruction with return demonstration\"); (c) Content: What was specifically taught (e.g., \"Reviewed injection site rotation: abdomen, thighs, upper arms; demonstrated proper angle and technique; reviewed signs of hypoglycemia\"); (d) Response: Patient's/caregiver's demonstrated understanding via teach-back (e.g., \"Patient correctly demonstrated subcutaneous injection into the abdomen with proper site selection, 90-degree angle, and skin pinch. Patient correctly identified 3 signs of hypoglycemia: shakiness, sweating, confusion.\"); (e) Plan: Areas.",
      "Controlled-policy focus — CL-SD-017, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60(d) ; Standard: Written information to the patient ; Patient education and information provision requirements ; ; 42 CFR § 484.75 ; Condition of Participation: Skilled Professional Services ; Education as a skilled service ; 9.2 CMS Guidance ; Document ; Relevance ; ; ; ; ; CMS Home Health Benefit Manual, Chapter 7, § 40.1 ; Education and training as a skilled nursing service ; ; CMS State Operations Manual, Appendix B ; Survey guidance for patient education ; 9.3 Clinical Practice Standards ; Document ; Relevance ; ; ; ; ; Agency for Healthcare Research and Quality (AHRQ).",
      "Controlled-policy focus — CL-SD-017, Discharge Education. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; Beginning at least 7 calendar days before anticipated discharge, provide focused discharge education per CL-CP-006, covering: (a) self-management of the patient's primary condition; (b) medication management; (c) diet and activity guidelines; (d) signs and symptoms requiring physician contact or 911; (e) follow-up appointments; (f) community resources; (g) how to access care after discharge. ; At least 7 calendar days before discharge. ; ; 6.4.2 ; Assigned RN ; At the final visit, conduct a comprehensive teach-back covering all critical self-management topics. Provide written discharge instructions in the patient's primary language. Document the final education assessment. ; At the.",
      "Controlled-policy focus — CL-SD-017, 4\\. Policy Statement. 4.1 An individualized Education Plan shall be developed as part of the plan of care for every patient at SOC, identifying: (a) learning needs based on the comprehensive assessment; (b) learning goals; (c) education topics; (d) the patient's and caregiver's preferred learning style (visual, verbal, demonstration, written materials); (e) learning barriers (literacy, language, cognition, vision, hearing, cultural factors); (f) strategies to address identified barriers. 4.2 Patient education shall be provided at every skilled visit, integrated into the clinical care — not delivered as a separate, unrelated activity. Education shall be directly relevant to the visit's clinical purpose and the patient's current status and needs. 4.3 All education shall be documented with specificity sufficient to demonstrate the skilled nature.",
      "Apply the controlled requirements to the three visible objects in the scene for medication, device, and warning-sign education. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Spacer", detail: "Review the spacer for the patient-specific finding. Reconcile it with the practice inhaler, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Practice Inhaler", detail: "Review the practice inhaler for the patient-specific finding. Reconcile it with the small mirror, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Small Mirror", detail: "Review the small mirror for the patient-specific finding. Reconcile it with the spacer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "spacer-5-1", label: "spacer", shortLabel: "spacer", ariaLabel: "Investigate spacer",        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the spacer as patient-specific evidence for medication, device, and warning-sign education. Compare it with the practice inhaler, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For spacer, compare the visible evidence with practice inhaler and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the spacer as patient-specific evidence for medication, device, and warning-sign education. Compare it with the practice inhaler, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For spacer, compare the visible evidence with practice inhaler and the controlling source before classifying status." },
          { id: "i2", label: "Assume the spacer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, device, and warning-sign education." },
          { id: "i3", label: "Dismiss the conflict between the spacer and practice inhaler because one source appears more convenient. This identify option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about spacer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to spacer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to spacer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the spacer without confirming an applicable order and patient-specific authority. This decide option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for spacer is resolved." },
          { id: "d3", label: "Hand the spacer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, device, and warning-sign education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For spacer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For spacer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the spacer before reassessment confirms the patient response. This document option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of spacer." },
          { id: "doc3", label: "Copy the prior medication, device, and warning-sign education narrative even though today’s spacer evidence is different. This document option concerns spacer during medication, device, and warning-sign education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, device, and warning-sign education." },
        ],
        feedback: {
          observed: "Observe the spacer as patient-specific evidence for medication, device, and warning-sign education. Compare it with the practice inhaler, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the spacer as patient-specific evidence for medication, device, and warning-sign education. Compare it with the practice inhaler, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For spacer, compare the visible evidence with practice inhaler and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to spacer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For spacer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "practice-inhaler-5-2", label: "practice inhaler", shortLabel: "practice inhaler", ariaLabel: "Investigate practice inhaler",        x: 51, y: 70, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the practice inhaler as patient-specific evidence for medication, device, and warning-sign education. Compare it with the small mirror, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice inhaler, compare the visible evidence with small mirror and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the practice inhaler as patient-specific evidence for medication, device, and warning-sign education. Compare it with the small mirror, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice inhaler, compare the visible evidence with small mirror and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the practice inhaler and omit the related change, symptom, or safety cue. This identify option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, device, and warning-sign education." },
          { id: "i3", label: "Let a blank, unreadable, or unverified practice inhaler stand in for direct RN assessment. This identify option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about practice inhaler." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice inhaler; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice inhaler; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the practice inhaler issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for practice inhaler is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for medication, device, and warning-sign education instead of the current controlled clinical pathway. This decide option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, device, and warning-sign education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For practice inhaler, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For practice inhaler, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the practice inhaler and omit the discrepancy with small mirror. This document option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of practice inhaler." },
          { id: "doc3", label: "Combine the practice inhaler issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns practice inhaler during medication, device, and warning-sign education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, device, and warning-sign education." },
        ],
        feedback: {
          observed: "Observe the practice inhaler as patient-specific evidence for medication, device, and warning-sign education. Compare it with the small mirror, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the practice inhaler as patient-specific evidence for medication, device, and warning-sign education. Compare it with the small mirror, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice inhaler, compare the visible evidence with small mirror and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice inhaler; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For practice inhaler, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "small-mirror-5-3", label: "small mirror", shortLabel: "small mirror", ariaLabel: "Investigate small mirror",        x: 84, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the small mirror as patient-specific evidence for medication, device, and warning-sign education. Compare it with the spacer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small mirror, compare the visible evidence with spacer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the small mirror as patient-specific evidence for medication, device, and warning-sign education. Compare it with the spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small mirror, compare the visible evidence with spacer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the small mirror as the complete assessment and do not compare the spacer, patient report, or current record. This identify option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for medication, device, and warning-sign education." },
          { id: "i3", label: "Carry forward the prior visit conclusion for medication, device, and warning-sign education without reassessing the patient today. This identify option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about small mirror." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small mirror; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small mirror; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the small mirror alone and seek clarification only after the intervention is complete. This decide option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for small mirror is resolved." },
          { id: "d3", label: "Defer the concern in the small mirror to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during medication, device, and warning-sign education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For small mirror, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For small mirror, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the small mirror was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of small mirror." },
          { id: "doc3", label: "Keep the small mirror decision in personal notes rather than the governed patient record. This document option concerns small mirror during medication, device, and warning-sign education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for medication, device, and warning-sign education." },
        ],
        feedback: {
          observed: "Observe the small mirror as patient-specific evidence for medication, device, and warning-sign education. Compare it with the spacer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the small mirror as patient-specific evidence for medication, device, and warning-sign education. Compare it with the spacer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for medication, device, and warning-sign education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small mirror, compare the visible evidence with spacer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small mirror; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for medication, device, and warning-sign education. For small mirror, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Address",
    title: "Address failed teach-back and unsafe caregiver performance",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for address failed teach-back and unsafe caregiver performance within Patient & Caregiver Education. Use the current controlled requirements in CL-CP-001, CL-SD-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Controlled-policy focus — CL-SD-017, 4\\. Policy Statement. 4.1 An individualized Education Plan shall be developed as part of the plan of care for every patient at SOC, identifying: (a) learning needs based on the comprehensive assessment; (b) learning goals; (c) education topics; (d) the patient's and caregiver's preferred learning style (visual, verbal, demonstration, written materials); (e) learning barriers (literacy, language, cognition, vision, hearing, cultural factors); (f) strategies to address identified barriers. 4.2 Patient education shall be provided at every skilled visit, integrated into the clinical care — not delivered as a separate, unrelated activity. Education shall be directly relevant to the visit's clinical purpose and the patient's current status and needs. 4.3 All education shall be documented with specificity sufficient to demonstrate the skilled nature.",
      "Controlled-policy focus — CL-SD-017, Education Delivery at Every Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; All Clinical Disciplines ; At every skilled visit, identify at least one education topic relevant to the visit's clinical purpose and the patient's current learning needs. Prioritize education based on patient safety — teach the most critical self-management skills first (when to call 911, medication safety, fall prevention). ; At every visit. ; ; 6.2.2 ; All Clinical Disciplines ; Deliver education using the patient's preferred learning method. For complex topics, use multiple methods (verbal explanation + written handout + demonstration). For patients with low health literacy, use plain language, visual aids, and the teach-back method. ; During the visit..",
      "Controlled-policy focus — CL-SD-017, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Patient unable to learn due to cognitive impairment ; Assigned RN notifies Director of Nursing ; Redirect education to the caregiver. If no caregiver is available, assess the need for increased visit frequency, HHA services, or community support. Notify physician and MSW. ; Within 48 hours. ; ; Patient declines education ; Assigned RN documents refusal ; Document the patient's refusal, the education offered, and the clinical risks of not learning. Continue to offer education at each visit. Notify physician. ; At the visit; physician notification within 24 hours. ; ; Education documentation is vague or non-specific ; Director of Nursing identifies.",
      "Controlled-policy focus — CL-CP-001, Required Elements of the Plan of Care. The plan of care for each patient shall contain, at minimum, all of the following elements as required by 42 CFR § 484.60(a) and CMS billing requirements. Absence of any required element constitutes a documentation deficiency subject to correction per CO-DC-003. ; Required Element ; Content Standard ; Policy Reference ; ; ; ; ; ; Patient identifying information ; Full legal name, date of birth, Medicare/Medicaid number, address, emergency contact ; CL-CA-001 ; ; Attending physician ; Name, NPI, address, telephone ; CL-CP-003 ; ; Certification period ; Start and end dates of the 60-day episode ; CL-CP-008 ; ; Diagnoses ; Primary diagnosis (the condition chiefly responsible for the patient's need for home health) and all.",
      "Apply the controlled requirements to the three visible objects in the scene for address failed teach-back and unsafe caregiver performance. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Large-print Cards", detail: "Review the large-print cards for the patient-specific finding. Reconcile it with the magnifier, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Magnifier", detail: "Review the magnifier for the patient-specific finding. Reconcile it with the coin purse closed, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Coin Purse Closed", detail: "Review the coin purse closed for the patient-specific finding. Reconcile it with the large-print cards, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "large-print-cards-6-1", label: "large-print cards", shortLabel: "large-print cards", ariaLabel: "Investigate large-print cards",        x: 22, y: 70, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the large-print cards as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For large-print cards, compare the visible evidence with magnifier and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the large-print cards as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For large-print cards, compare the visible evidence with magnifier and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the large-print cards and omit the related change, symptom, or safety cue. This identify option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address failed teach-back and unsafe caregiver performance." },
          { id: "i3", label: "Let a blank, unreadable, or unverified large-print cards stand in for direct RN assessment. This identify option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about large-print cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to large-print cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to large-print cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the large-print cards issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for large-print cards is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for address failed teach-back and unsafe caregiver performance instead of the current controlled clinical pathway. This decide option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address failed teach-back and unsafe caregiver performance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For large-print cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For large-print cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the large-print cards and omit the discrepancy with magnifier. This document option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of large-print cards." },
          { id: "doc3", label: "Combine the large-print cards issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns large-print cards during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address failed teach-back and unsafe caregiver performance." },
        ],
        feedback: {
          observed: "Observe the large-print cards as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the large-print cards as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For large-print cards, compare the visible evidence with magnifier and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to large-print cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For large-print cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "magnifier-6-2", label: "magnifier", shortLabel: "magnifier", ariaLabel: "Investigate magnifier",        x: 39, y: 40, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the magnifier as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with coin purse closed and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the magnifier as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with coin purse closed and the controlling source before classifying status." },
          { id: "i2", label: "Treat the magnifier as the complete assessment and do not compare the coin purse closed, patient report, or current record. This identify option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address failed teach-back and unsafe caregiver performance." },
          { id: "i3", label: "Carry forward the prior visit conclusion for address failed teach-back and unsafe caregiver performance without reassessing the patient today. This identify option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about magnifier." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the magnifier alone and seek clarification only after the intervention is complete. This decide option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for magnifier is resolved." },
          { id: "d3", label: "Defer the concern in the magnifier to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address failed teach-back and unsafe caregiver performance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For magnifier, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For magnifier, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the magnifier was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of magnifier." },
          { id: "doc3", label: "Keep the magnifier decision in personal notes rather than the governed patient record. This document option concerns magnifier during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address failed teach-back and unsafe caregiver performance." },
        ],
        feedback: {
          observed: "Observe the magnifier as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the magnifier as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with coin purse closed and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For magnifier, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "coin-purse-closed-6-3", label: "coin purse closed", shortLabel: "coin purse closed", ariaLabel: "Investigate coin purse closed",        x: 77, y: 58, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the coin purse closed as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the large-print cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with large-print cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the coin purse closed as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the large-print cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with large-print cards and the controlling source before classifying status." },
          { id: "i2", label: "Assume the coin purse closed establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address failed teach-back and unsafe caregiver performance." },
          { id: "i3", label: "Dismiss the conflict between the coin purse closed and large-print cards because one source appears more convenient. This identify option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about coin purse closed." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the coin purse closed without confirming an applicable order and patient-specific authority. This decide option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for coin purse closed is resolved." },
          { id: "d3", label: "Hand the coin purse closed concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address failed teach-back and unsafe caregiver performance." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For coin purse closed, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For coin purse closed, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the coin purse closed before reassessment confirms the patient response. This document option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of coin purse closed." },
          { id: "doc3", label: "Copy the prior address failed teach-back and unsafe caregiver performance narrative even though today’s coin purse closed evidence is different. This document option concerns coin purse closed during address failed teach-back and unsafe caregiver performance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address failed teach-back and unsafe caregiver performance." },
        ],
        feedback: {
          observed: "Observe the coin purse closed as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the large-print cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the coin purse closed as patient-specific evidence for address failed teach-back and unsafe caregiver performance. Compare it with the large-print cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address failed teach-back and unsafe caregiver performance, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with large-print cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address failed teach-back and unsafe caregiver performance. For coin purse closed, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Documen",
    title: "Document learner, method, response, barriers, and follow-up",
    subtitle: "Patient & Caregiver Education",
    narration: [
      "This lesson develops registered-nurse reasoning for document learner, method, response, barriers, and follow-up within Patient & Caregiver Education. Use the current controlled requirements in CL-SD-017, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-017, 4\\. Policy Statement. 4.1 An individualized Education Plan shall be developed as part of the plan of care for every patient at SOC, identifying: (a) learning needs based on the comprehensive assessment; (b) learning goals; (c) education topics; (d) the patient's and caregiver's preferred learning style (visual, verbal, demonstration, written materials); (e) learning barriers (literacy, language, cognition, vision, hearing, cultural factors); (f) strategies to address identified barriers. 4.2 Patient education shall be provided at every skilled visit, integrated into the clinical care — not delivered as a separate, unrelated activity. Education shall be directly relevant to the visit's clinical purpose and the patient's current status and needs. 4.3 All education shall be documented with specificity sufficient to demonstrate the skilled nature.",
      "Controlled-policy focus — CL-CP-001, Physician Approval Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN / Clinical Coordinator ; Within 24 hours of finalizing the plan of care in the EHR, transmit the plan of care to the patient's certifying physician for review, approval, and signature. Transmission shall be via fax, secure electronic transmission, or physician portal. Document the date, method, and recipient of transmission in the clinical record. ; Within 24 hours of POC finalization; documented at time of transmission. ; ; 6.3.2 ; Clinical Coordinator / Director of Nursing ; Initiate tracking of the pending physician signature in the agency's physician order tracking system per policy CL-CP-009. Log the date transmitted, the.",
      "Controlled-policy focus — CL-SD-017, Education Delivery at Every Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; All Clinical Disciplines ; At every skilled visit, identify at least one education topic relevant to the visit's clinical purpose and the patient's current learning needs. Prioritize education based on patient safety — teach the most critical self-management skills first (when to call 911, medication safety, fall prevention). ; At every visit. ; ; 6.2.2 ; All Clinical Disciplines ; Deliver education using the patient's preferred learning method. For complex topics, use multiple methods (verbal explanation + written handout + demonstration). For patients with low health literacy, use plain language, visual aids, and the teach-back method. ; During the visit..",
      "Controlled-policy focus — CL-CP-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Completed plan of care ; Patient-specific plan of care including all required elements per Section 6.2 ; Assigned RN ; EHR — patient clinical record ; Developed within 24 hours of SOC visit; retained for minimum 7 years per CO-HP-007 ; ; Physician-signed plan of care ; Signed and dated CMS-485 or EHR equivalent ; Certifying physician / Medical Records ; EHR — patient clinical record ; Received and filed before claim submission; retained minimum 7 years ; ; Plan of care transmission record ; Documentation of date, method, and recipient of transmission to physician ; Clinical Coordinator.",
      "Controlled-policy focus — CL-CP-001, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Plans of care contain all required elements per 42 CFR § 484.60(a) ; Monthly audit of a random sample of SOC plans of care using the Documentation Audit Tool (Appendix C) ; ≥95% of audited plans contain all required elements; 100% target ; ; Plans of care are physician-signed before claim submission ; Cross-reference of billing records with physician signature dates in the EHR ; Zero claims submitted without a signed plan of care on file ; ; Plans of care are developed within 24 hours of SOC visit ; Audit of POC finalization dates against SOC visit dates ; ≥95% of SOC plans.",
      "Apply the controlled requirements to the three visible objects in the scene for document learner, method, response, barriers, and follow-up. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Teaching Folder", detail: "Review the teaching folder for the patient-specific finding. Reconcile it with the picture-only cards, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Picture-only Cards", detail: "Review the picture-only cards for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the teaching folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-017" },
      { kind: "Controlled Policy", text: "OP-PA-003" },
      { kind: "Controlled Policy", text: "OP-PA-004" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.80" },
      { kind: "External Authority", text: "42 CFR § 484.50" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "teaching-folder-7-1", label: "teaching folder", shortLabel: "teaching folder", ariaLabel: "Investigate teaching folder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the teaching folder as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the picture-only cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For teaching folder, compare the visible evidence with picture-only cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the teaching folder as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the picture-only cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For teaching folder, compare the visible evidence with picture-only cards and the controlling source before classifying status." },
          { id: "i2", label: "Treat the teaching folder as the complete assessment and do not compare the picture-only cards, patient report, or current record. This identify option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document learner, method, response, barriers, and follow-up." },
          { id: "i3", label: "Carry forward the prior visit conclusion for document learner, method, response, barriers, and follow-up without reassessing the patient today. This identify option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about teaching folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to teaching folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to teaching folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the teaching folder alone and seek clarification only after the intervention is complete. This decide option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for teaching folder is resolved." },
          { id: "d3", label: "Defer the concern in the teaching folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document learner, method, response, barriers, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For teaching folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For teaching folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the teaching folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of teaching folder." },
          { id: "doc3", label: "Keep the teaching folder decision in personal notes rather than the governed patient record. This document option concerns teaching folder during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document learner, method, response, barriers, and follow-up." },
        ],
        feedback: {
          observed: "Observe the teaching folder as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the picture-only cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the teaching folder as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the picture-only cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For teaching folder, compare the visible evidence with picture-only cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to teaching folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For teaching folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "picture-only-cards-7-2", label: "picture-only cards", shortLabel: "picture-only cards", ariaLabel: "Investigate picture-only cards",        x: 45, y: 59, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the picture-only cards as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only cards, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the picture-only cards as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only cards, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Assume the picture-only cards establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document learner, method, response, barriers, and follow-up." },
          { id: "i3", label: "Dismiss the conflict between the picture-only cards and tablet because one source appears more convenient. This identify option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about picture-only cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the picture-only cards without confirming an applicable order and patient-specific authority. This decide option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for picture-only cards is resolved." },
          { id: "d3", label: "Hand the picture-only cards concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document learner, method, response, barriers, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For picture-only cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For picture-only cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the picture-only cards before reassessment confirms the patient response. This document option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of picture-only cards." },
          { id: "doc3", label: "Copy the prior document learner, method, response, barriers, and follow-up narrative even though today’s picture-only cards evidence is different. This document option concerns picture-only cards during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document learner, method, response, barriers, and follow-up." },
        ],
        feedback: {
          observed: "Observe the picture-only cards as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the picture-only cards as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only cards, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For picture-only cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
      {
        id: "tablet-7-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the tablet as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the teaching folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with teaching folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the teaching folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with teaching folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tablet and omit the related change, symptom, or safety cue. This identify option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document learner, method, response, barriers, and follow-up." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tablet stand in for direct RN assessment. This identify option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tablet issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for document learner, method, response, barriers, and follow-up instead of the current controlled clinical pathway. This decide option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document learner, method, response, barriers, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tablet and omit the discrepancy with teaching folder. This document option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Combine the tablet issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tablet during document learner, method, response, barriers, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document learner, method, response, barriers, and follow-up." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the teaching folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for document learner, method, response, barriers, and follow-up. Compare it with the teaching folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document learner, method, response, barriers, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with teaching folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document learner, method, response, barriers, and follow-up. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-017","OP-PA-003","OP-PA-004","CL-CP-001","42 CFR § 484.60(d)","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.50"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During assess readiness, preferences, language, cognition, and barriers, the simple anatomical heart model conflicts with the visual-aid cards and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the simple anatomical heart model alone and seek clarification only after the intervention is complete. This option concerns assess readiness, preferences, language, cognition, and barriers.",
      "Assume the visual-aid cards is unchanged from the prior encounter and omit patient-specific reassessment during assess readiness, preferences, language, cognition, and barriers.",
      "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the simple anatomical heart model to the next routine visit even though its current clinical significance has not been assessed. This option concerns assess readiness, preferences, language, cognition, and barriers.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for assess readiness, preferences, language, cognition, and barriers within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 2,
    stem: "During set patient-specific priorities and plain-language goals, the picture cards without text conflicts with the tablet with neutral screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the tablet with neutral screen is unchanged from the prior encounter and omit patient-specific reassessment during set patient-specific priorities and plain-language goals.",
      "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the picture cards without text concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns set patient-specific priorities and plain-language goals.",
      "Change the treatment, medication, device setting, or plan based on the picture cards without text without confirming an applicable order and patient-specific authority. This option concerns set patient-specific priorities and plain-language goals.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for set patient-specific priorities and plain-language goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 3,
    stem: "During use qualified interpreters and accessible materials, the small hourglass conflicts with the three picture cards and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for use qualified interpreters and accessible materials instead of the current controlled clinical pathway. This option concerns use qualified interpreters and accessible materials.",
      "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the small hourglass issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns use qualified interpreters and accessible materials.",
      "Assume the three picture cards is unchanged from the prior encounter and omit patient-specific reassessment during use qualified interpreters and accessible materials.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for use qualified interpreters and accessible materials within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 4,
    stem: "During demonstration, chunk-and-check, and teach-back, the mirror conflicts with the inhaler spacer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the mirror to the next routine visit even though its current clinical significance has not been assessed. This option concerns demonstration, chunk-and-check, and teach-back.",
      "Proceed using the mirror alone and seek clarification only after the intervention is complete. This option concerns demonstration, chunk-and-check, and teach-back.",
      "Assume the inhaler spacer is unchanged from the prior encounter and omit patient-specific reassessment during demonstration, chunk-and-check, and teach-back.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for demonstration, chunk-and-check, and teach-back within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 5,
    stem: "During medication, device, and warning-sign education, the small mirror conflicts with the spacer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the spacer is unchanged from the prior encounter and omit patient-specific reassessment during medication, device, and warning-sign education.",
      "Change the treatment, medication, device setting, or plan based on the small mirror without confirming an applicable order and patient-specific authority. This option concerns medication, device, and warning-sign education.",
      "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the small mirror concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns medication, device, and warning-sign education.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for medication, device, and warning-sign education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 6,
    stem: "During address failed teach-back and unsafe caregiver performance, the coin purse closed conflicts with the large-print cards and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for address failed teach-back and unsafe caregiver performance instead of the current controlled clinical pathway. This option concerns address failed teach-back and unsafe caregiver performance.",
      "Close the coin purse closed issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns address failed teach-back and unsafe caregiver performance.",
      "Assume the large-print cards is unchanged from the prior encounter and omit patient-specific reassessment during address failed teach-back and unsafe caregiver performance.",
      "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for address failed teach-back and unsafe caregiver performance within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 7,
    stem: "During document learner, method, response, barriers, and follow-up, the tablet conflicts with the teaching folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This option concerns document learner, method, response, barriers, and follow-up.",
      "Proceed using the tablet alone and seek clarification only after the intervention is complete. This option concerns document learner, method, response, barriers, and follow-up.",
      "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the teaching folder is unchanged from the prior encounter and omit patient-specific reassessment during document learner, method, response, barriers, and follow-up.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for document learner, method, response, barriers, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-017, OP-PA-003, OP-PA-004, CL-CP-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60(d) be used when applying Patient & Caregiver Education?",
    options: [
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
    ],
    correct: 3,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the tablet with neutral screen and coin purse closed into defensible RN practice for Patient & Caregiver Education?",
    options: [
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Patient & Caregiver Education establish?",
    options: [
      "Knowledge of the controlled RN concepts in Patient & Caregiver Education, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Automatic authority to perform every activity discussed in Patient & Caregiver Education without supervision.",
    ],
    correct: 0,
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


const STORAGE_KEY = 'rn-010-progress-v6000';

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

export default function RN010() {
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
          <span className="brand-text">RN-010 — Education</span>
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
