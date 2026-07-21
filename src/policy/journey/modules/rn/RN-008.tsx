/**
 * RN-008 — IV Therapy & Infusion Management
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
import img01 from './assets/rn-008/rn-008-lesson-01.png';
import img02 from './assets/rn-008/rn-008-lesson-02.png';
import img03 from './assets/rn-008/rn-008-lesson-03.png';
import img04 from './assets/rn-008/rn-008-lesson-04.png';
import img05 from './assets/rn-008/rn-008-lesson-05.png';
import img06 from './assets/rn-008/rn-008-lesson-06.png';
import img07 from './assets/rn-008/rn-008-lesson-07.png';

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

const MODULE_META = { id: "RN-008", title: "IV Therapy & Infusion Management", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Verify order, therapy purpose, access, and readiness, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Aseptic setup and medication/solution verification, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Vascular-access and insertion-site assessment, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Program, administer, and monitor the infusion, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Recognize infiltration, extravasation, phlebitis, occlusion, and reaction, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Stop therapy and escalate complications or device failure, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Line care, disposal, response, and documentation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Verify",
    title: "Verify order, therapy purpose, access, and readiness",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for verify order, therapy purpose, access, and readiness within IV Therapy & Infusion Management. Use the current controlled requirements in CL-SD-010, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-010, 4\\. Policy Statement. 4.1 IV therapy services shall be authorized by a physician order that specifies: (a) the IV medication or solution; (b) dose, rate, and route (peripheral vs. central); (c) frequency and duration of infusions; (d) vascular access device type; (e) monitoring parameters; (f) laboratory testing schedule if applicable. 4.2 Only RNs who have completed the agency's IV Therapy Competency Program and demonstrated competency in all required IV skills shall be authorized to provide IV therapy services independently. The Director of Nursing shall maintain a current roster of IV-competency-validated RNs. 4.3 The IV Therapy Competency Program shall include demonstrated competency in: (a) peripheral IV insertion and management; (b) central venous access device (CVAD) management including PICC lines, Port-a-Cath access, and.",
      "Controlled-policy focus — CL-SD-010, 2\\. Purpose. This policy defines the clinical standards, competency requirements, safety protocols, and documentation expectations for intravenous (IV) therapy and infusion services provided by Care Indeed Home Health Care, Inc. IV therapy in the home setting includes peripheral and central venous access device management, IV antibiotic therapy, IV hydration, total parenteral nutrition (TPN), blood product administration (if within scope and authorized by the agency), chemotherapy infusion support (limited scope), and IV medication administration. These are among the highest-risk skilled services provided in home health due to the potential for serious complications including infection (central line-associated bloodstream infections — CLABSI), air embolism, infiltration/extravasation, adverse drug reactions, fluid overload, and anaphylaxis. This policy ensures that all IV therapy services are delivered by.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-SD-010, Pre-Infusion Assessment and Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before each IV visit, review: the physician order including any recent changes; the patient's current medication list for potential drug interactions; recent laboratory results relevant to the infusion (e.g., trough levels for vancomycin, renal function for nephrotoxic drugs); the patient's allergy list. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN ; Verify that all required supplies and medications are available and not expired, including: IV solution or medication, administration set, flush supplies, dressing change supplies (if CVAD), infusion pump (if required), anaphylaxis kit (epinephrine, diphenhydramine, syringes, 911 contact). ; Before departure. ; ; 6.1.3.",
      "Apply the controlled requirements to the three visible objects in the scene for verify order, therapy purpose, access, and readiness. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Fluid Bag Label", detail: "Review the fluid bag label for the patient-specific finding. Reconcile it with the compact infusion pump, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Compact Infusion Pump", detail: "Review the compact infusion pump for the patient-specific finding. Reconcile it with the closed supply tray, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Closed Supply Tray", detail: "Review the closed supply tray for the patient-specific finding. Reconcile it with the fluid bag label, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "fluid-bag-label-1-1", label: "fluid bag label", shortLabel: "fluid bag label", ariaLabel: "Investigate fluid bag label",        x: 26, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the fluid bag label as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the compact infusion pump, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag label, compare the visible evidence with compact infusion pump and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the fluid bag label as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the compact infusion pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag label, compare the visible evidence with compact infusion pump and the controlling source before classifying status." },
          { id: "i2", label: "Treat the fluid bag label as the complete assessment and do not compare the compact infusion pump, patient report, or current record. This identify option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify order, therapy purpose, access, and readiness." },
          { id: "i3", label: "Carry forward the prior visit conclusion for verify order, therapy purpose, access, and readiness without reassessing the patient today. This identify option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about fluid bag label." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag label; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag label; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the fluid bag label alone and seek clarification only after the intervention is complete. This decide option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for fluid bag label is resolved." },
          { id: "d3", label: "Defer the concern in the fluid bag label to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify order, therapy purpose, access, and readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For fluid bag label, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For fluid bag label, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the fluid bag label was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of fluid bag label." },
          { id: "doc3", label: "Keep the fluid bag label decision in personal notes rather than the governed patient record. This document option concerns fluid bag label during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify order, therapy purpose, access, and readiness." },
        ],
        feedback: {
          observed: "Observe the fluid bag label as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the compact infusion pump, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the fluid bag label as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the compact infusion pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag label, compare the visible evidence with compact infusion pump and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag label; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For fluid bag label, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "compact-infusion-pump-1-2", label: "compact infusion pump", shortLabel: "compact infusion pump", ariaLabel: "Investigate compact infusion pump",        x: 35, y: 73, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the compact infusion pump as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the closed supply tray, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact infusion pump, compare the visible evidence with closed supply tray and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the compact infusion pump as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the closed supply tray, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact infusion pump, compare the visible evidence with closed supply tray and the controlling source before classifying status." },
          { id: "i2", label: "Assume the compact infusion pump establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify order, therapy purpose, access, and readiness." },
          { id: "i3", label: "Dismiss the conflict between the compact infusion pump and closed supply tray because one source appears more convenient. This identify option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about compact infusion pump." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact infusion pump; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact infusion pump; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the compact infusion pump without confirming an applicable order and patient-specific authority. This decide option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for compact infusion pump is resolved." },
          { id: "d3", label: "Hand the compact infusion pump concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify order, therapy purpose, access, and readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For compact infusion pump, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For compact infusion pump, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the compact infusion pump before reassessment confirms the patient response. This document option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compact infusion pump." },
          { id: "doc3", label: "Copy the prior verify order, therapy purpose, access, and readiness narrative even though today’s compact infusion pump evidence is different. This document option concerns compact infusion pump during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify order, therapy purpose, access, and readiness." },
        ],
        feedback: {
          observed: "Observe the compact infusion pump as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the closed supply tray, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the compact infusion pump as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the closed supply tray, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact infusion pump, compare the visible evidence with closed supply tray and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact infusion pump; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For compact infusion pump, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "closed-supply-tray-1-3", label: "closed supply tray", shortLabel: "closed supply tray", ariaLabel: "Investigate closed supply tray",        x: 78, y: 63, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the closed supply tray as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the fluid bag label, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply tray, compare the visible evidence with fluid bag label and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed supply tray as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the fluid bag label, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply tray, compare the visible evidence with fluid bag label and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the closed supply tray and omit the related change, symptom, or safety cue. This identify option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify order, therapy purpose, access, and readiness." },
          { id: "i3", label: "Let a blank, unreadable, or unverified closed supply tray stand in for direct RN assessment. This identify option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed supply tray." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply tray; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply tray; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the closed supply tray issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed supply tray is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for verify order, therapy purpose, access, and readiness instead of the current controlled clinical pathway. This decide option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify order, therapy purpose, access, and readiness." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For closed supply tray, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For closed supply tray, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the closed supply tray and omit the discrepancy with fluid bag label. This document option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed supply tray." },
          { id: "doc3", label: "Combine the closed supply tray issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns closed supply tray during verify order, therapy purpose, access, and readiness.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify order, therapy purpose, access, and readiness." },
        ],
        feedback: {
          observed: "Observe the closed supply tray as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the fluid bag label, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed supply tray as patient-specific evidence for verify order, therapy purpose, access, and readiness. Compare it with the fluid bag label, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify order, therapy purpose, access, and readiness, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply tray, compare the visible evidence with fluid bag label and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply tray; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify order, therapy purpose, access, and readiness. For closed supply tray, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Aseptic",
    title: "Aseptic setup and medication/solution verification",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for aseptic setup and medication/solution verification within IV Therapy & Infusion Management. Use the current controlled requirements in CL-SD-010, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-010, 4\\. Policy Statement. 4.1 IV therapy services shall be authorized by a physician order that specifies: (a) the IV medication or solution; (b) dose, rate, and route (peripheral vs. central); (c) frequency and duration of infusions; (d) vascular access device type; (e) monitoring parameters; (f) laboratory testing schedule if applicable. 4.2 Only RNs who have completed the agency's IV Therapy Competency Program and demonstrated competency in all required IV skills shall be authorized to provide IV therapy services independently. The Director of Nursing shall maintain a current roster of IV-competency-validated RNs. 4.3 The IV Therapy Competency Program shall include demonstrated competency in: (a) peripheral IV insertion and management; (b) central venous access device (CVAD) management including PICC lines, Port-a-Cath access, and.",
      "Controlled-policy focus — CL-SD-010, 5\\. Definitions. Term ; Definition ; ; ; ; ; Peripheral IV Access ; Intravenous access established through a peripheral vein, typically in the hand, forearm, or antecubital fossa, using a peripheral IV catheter. ; ; Central Venous Access Device (CVAD) ; A vascular access device with the distal tip positioned in a large central vein, including PICC lines, tunneled catheters, and implanted ports. ; ; PICC (Peripherally Inserted Central Catheter) ; A central venous catheter inserted through a peripheral vein with the tip advanced to the superior vena cava. ; ; Infiltration ; The inadvertent administration of IV solution into the surrounding tissue rather than the vein. ; ; Extravasation ; The inadvertent administration of a vesicant medication into.",
      "Controlled-policy focus — CL-SD-010, Pre-Infusion Assessment and Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before each IV visit, review: the physician order including any recent changes; the patient's current medication list for potential drug interactions; recent laboratory results relevant to the infusion (e.g., trough levels for vancomycin, renal function for nephrotoxic drugs); the patient's allergy list. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN ; Verify that all required supplies and medications are available and not expired, including: IV solution or medication, administration set, flush supplies, dressing change supplies (if CVAD), infusion pump (if required), anaphylaxis kit (epinephrine, diphenhydramine, syringes, 911 contact). ; Before departure. ; ; 6.1.3.",
      "Controlled-policy focus — CL-SD-010, IV Administration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Access the vascular device using aseptic technique. For CVADs, follow the Central Line Bundle Protocol (Appendix A). Perform a normal saline flush before medication administration to verify line patency. ; Before each infusion. ; ; 6.2.2 ; Assigned RN ; Initiate the infusion at the physician-ordered rate. Set infusion pump alarms if applicable. Remain with the patient for at least the first 15 minutes of any new medication or the full duration for high-risk infusions. ; During infusion. ; ; 6.2.3 ; Assigned RN ; Monitor the patient throughout the infusion for: vital sign changes; signs of adverse.",
      "Controlled-policy focus — CL-SD-010, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Pre-infusion assessment ; Vital signs, site assessment, medication verification ; Assigned RN ; EHR — visit note ; At the start of each IV visit ; ; Infusion administration record ; Medication, dose, rate, route, start/stop times, patient tolerance ; Assigned RN ; EHR — visit note ; At each infusion; within 24 hours ; ; Post-infusion assessment ; Vital signs, patient status, site assessment ; Assigned RN ; EHR — visit note ; At infusion completion ; ; CVAD dressing change documentation ; Site condition, dressing type, observations ; Assigned RN ; EHR — visit note.",
      "Apply the controlled requirements to the three visible objects in the scene for aseptic setup and medication/solution verification. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Transparent Dressing", detail: "Review the transparent dressing for the patient-specific finding. Reconcile it with the tourniquet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tourniquet", detail: "Review the tourniquet for the patient-specific finding. Reconcile it with the saline flush package, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Saline Flush Package", detail: "Review the saline flush package for the patient-specific finding. Reconcile it with the transparent dressing, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "transparent-dressing-2-1", label: "transparent dressing", shortLabel: "transparent dressing", ariaLabel: "Investigate transparent dressing",        x: 14, y: 60, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the transparent dressing as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the tourniquet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with tourniquet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the transparent dressing as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the tourniquet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with tourniquet and the controlling source before classifying status." },
          { id: "i2", label: "Assume the transparent dressing establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for aseptic setup and medication/solution verification." },
          { id: "i3", label: "Dismiss the conflict between the transparent dressing and tourniquet because one source appears more convenient. This identify option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about transparent dressing." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the transparent dressing without confirming an applicable order and patient-specific authority. This decide option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for transparent dressing is resolved." },
          { id: "d3", label: "Hand the transparent dressing concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during aseptic setup and medication/solution verification." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For transparent dressing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For transparent dressing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the transparent dressing before reassessment confirms the patient response. This document option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of transparent dressing." },
          { id: "doc3", label: "Copy the prior aseptic setup and medication/solution verification narrative even though today’s transparent dressing evidence is different. This document option concerns transparent dressing during aseptic setup and medication/solution verification.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aseptic setup and medication/solution verification." },
        ],
        feedback: {
          observed: "Observe the transparent dressing as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the tourniquet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the transparent dressing as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the tourniquet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with tourniquet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For transparent dressing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "tourniquet-2-2", label: "tourniquet", shortLabel: "tourniquet", ariaLabel: "Investigate tourniquet",        x: 32, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the tourniquet as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the saline flush package, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tourniquet, compare the visible evidence with saline flush package and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tourniquet as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the saline flush package, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tourniquet, compare the visible evidence with saline flush package and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tourniquet and omit the related change, symptom, or safety cue. This identify option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for aseptic setup and medication/solution verification." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tourniquet stand in for direct RN assessment. This identify option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tourniquet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tourniquet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tourniquet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tourniquet issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tourniquet is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for aseptic setup and medication/solution verification instead of the current controlled clinical pathway. This decide option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during aseptic setup and medication/solution verification." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For tourniquet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For tourniquet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tourniquet and omit the discrepancy with saline flush package. This document option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tourniquet." },
          { id: "doc3", label: "Combine the tourniquet issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tourniquet during aseptic setup and medication/solution verification.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aseptic setup and medication/solution verification." },
        ],
        feedback: {
          observed: "Observe the tourniquet as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the saline flush package, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tourniquet as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the saline flush package, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tourniquet, compare the visible evidence with saline flush package and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tourniquet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For tourniquet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "saline-flush-package-2-3", label: "saline flush package", shortLabel: "saline flush package", ariaLabel: "Investigate saline flush package",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the saline flush package as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline flush package, compare the visible evidence with transparent dressing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the saline flush package as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline flush package, compare the visible evidence with transparent dressing and the controlling source before classifying status." },
          { id: "i2", label: "Treat the saline flush package as the complete assessment and do not compare the transparent dressing, patient report, or current record. This identify option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for aseptic setup and medication/solution verification." },
          { id: "i3", label: "Carry forward the prior visit conclusion for aseptic setup and medication/solution verification without reassessing the patient today. This identify option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about saline flush package." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline flush package; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline flush package; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the saline flush package alone and seek clarification only after the intervention is complete. This decide option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for saline flush package is resolved." },
          { id: "d3", label: "Defer the concern in the saline flush package to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during aseptic setup and medication/solution verification." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For saline flush package, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For saline flush package, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the saline flush package was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of saline flush package." },
          { id: "doc3", label: "Keep the saline flush package decision in personal notes rather than the governed patient record. This document option concerns saline flush package during aseptic setup and medication/solution verification.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for aseptic setup and medication/solution verification." },
        ],
        feedback: {
          observed: "Observe the saline flush package as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the saline flush package as patient-specific evidence for aseptic setup and medication/solution verification. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for aseptic setup and medication/solution verification, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline flush package, compare the visible evidence with transparent dressing and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline flush package; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for aseptic setup and medication/solution verification. For saline flush package, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Vascula",
    title: "Vascular-access and insertion-site assessment",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for vascular-access and insertion-site assessment within IV Therapy & Infusion Management. Use the current controlled requirements in CL-SD-010, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-010, Pre-Infusion Assessment and Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before each IV visit, review: the physician order including any recent changes; the patient's current medication list for potential drug interactions; recent laboratory results relevant to the infusion (e.g., trough levels for vancomycin, renal function for nephrotoxic drugs); the patient's allergy list. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN ; Verify that all required supplies and medications are available and not expired, including: IV solution or medication, administration set, flush supplies, dressing change supplies (if CVAD), infusion pump (if required), anaphylaxis kit (epinephrine, diphenhydramine, syringes, 911 contact). ; Before departure. ; ; 6.1.3.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Primary regulatory basis for plan of care requirements ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Defines required elements of the plan of care ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the physician-approved plan of care ; ; 42 CFR § 424.22 ; Requirements for home health services — plan of care and certifying physician ; Defines physician certification requirements for Medicare billing ; ; 42 CFR § 409.42 ; Skilled nursing.",
      "Controlled-policy focus — CL-CP-001, 10\\. Training & Acknowledgment Requirements. 10.1 All registered nurses responsible for conducting SOC assessments and developing plans of care shall receive competency-validated training on plan of care development requirements within 14 calendar days of hire and annually thereafter. Training shall be conducted by the Director of Nursing or a qualified designee and shall include: (a) all required elements of the plan of care per 42 CFR § 484.60(a); (b) ICD-10 primary diagnosis selection for PDGM; (c) SMART goal-writing for home health; (d) physician order management and the verbal order process; (e) plan of care transmission and tracking; (f) common survey deficiencies and how to avoid them; (g) the agency's EHR plan of care workflow. 10.2 All other clinical disciplines (PT, OT, SLP, MSW).",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Apply the controlled requirements to the three visible objects in the scene for vascular-access and insertion-site assessment. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Sterile Drape", detail: "Review the sterile drape for the patient-specific finding. Reconcile it with the glove pair, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Glove Pair", detail: "Review the glove pair for the patient-specific finding. Reconcile it with the antiseptic bottle, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Antiseptic Bottle", detail: "Review the antiseptic bottle for the patient-specific finding. Reconcile it with the sterile drape, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "sterile-drape-3-1", label: "sterile drape", shortLabel: "sterile drape", ariaLabel: "Investigate sterile drape",        x: 14, y: 65, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the sterile drape as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the glove pair, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile drape, compare the visible evidence with glove pair and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the sterile drape as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the glove pair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile drape, compare the visible evidence with glove pair and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the sterile drape and omit the related change, symptom, or safety cue. This identify option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for vascular-access and insertion-site assessment." },
          { id: "i3", label: "Let a blank, unreadable, or unverified sterile drape stand in for direct RN assessment. This identify option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about sterile drape." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile drape; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile drape; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the sterile drape issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for sterile drape is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for vascular-access and insertion-site assessment instead of the current controlled clinical pathway. This decide option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during vascular-access and insertion-site assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For sterile drape, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For sterile drape, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the sterile drape and omit the discrepancy with glove pair. This document option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of sterile drape." },
          { id: "doc3", label: "Combine the sterile drape issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns sterile drape during vascular-access and insertion-site assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vascular-access and insertion-site assessment." },
        ],
        feedback: {
          observed: "Observe the sterile drape as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the glove pair, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the sterile drape as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the glove pair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile drape, compare the visible evidence with glove pair and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile drape; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For sterile drape, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "glove-pair-3-2", label: "glove pair", shortLabel: "glove pair", ariaLabel: "Investigate glove pair",        x: 51, y: 76, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the glove pair as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the antiseptic bottle, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glove pair, compare the visible evidence with antiseptic bottle and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the glove pair as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the antiseptic bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glove pair, compare the visible evidence with antiseptic bottle and the controlling source before classifying status." },
          { id: "i2", label: "Treat the glove pair as the complete assessment and do not compare the antiseptic bottle, patient report, or current record. This identify option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for vascular-access and insertion-site assessment." },
          { id: "i3", label: "Carry forward the prior visit conclusion for vascular-access and insertion-site assessment without reassessing the patient today. This identify option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about glove pair." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glove pair; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glove pair; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the glove pair alone and seek clarification only after the intervention is complete. This decide option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for glove pair is resolved." },
          { id: "d3", label: "Defer the concern in the glove pair to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during vascular-access and insertion-site assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For glove pair, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For glove pair, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the glove pair was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of glove pair." },
          { id: "doc3", label: "Keep the glove pair decision in personal notes rather than the governed patient record. This document option concerns glove pair during vascular-access and insertion-site assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vascular-access and insertion-site assessment." },
        ],
        feedback: {
          observed: "Observe the glove pair as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the antiseptic bottle, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the glove pair as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the antiseptic bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For glove pair, compare the visible evidence with antiseptic bottle and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to glove pair; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For glove pair, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "antiseptic-bottle-3-3", label: "antiseptic bottle", shortLabel: "antiseptic bottle", ariaLabel: "Investigate antiseptic bottle",        x: 75, y: 44, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the antiseptic bottle as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the sterile drape, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For antiseptic bottle, compare the visible evidence with sterile drape and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the antiseptic bottle as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the sterile drape, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For antiseptic bottle, compare the visible evidence with sterile drape and the controlling source before classifying status." },
          { id: "i2", label: "Assume the antiseptic bottle establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for vascular-access and insertion-site assessment." },
          { id: "i3", label: "Dismiss the conflict between the antiseptic bottle and sterile drape because one source appears more convenient. This identify option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about antiseptic bottle." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to antiseptic bottle; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to antiseptic bottle; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the antiseptic bottle without confirming an applicable order and patient-specific authority. This decide option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for antiseptic bottle is resolved." },
          { id: "d3", label: "Hand the antiseptic bottle concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during vascular-access and insertion-site assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For antiseptic bottle, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For antiseptic bottle, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the antiseptic bottle before reassessment confirms the patient response. This document option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of antiseptic bottle." },
          { id: "doc3", label: "Copy the prior vascular-access and insertion-site assessment narrative even though today’s antiseptic bottle evidence is different. This document option concerns antiseptic bottle during vascular-access and insertion-site assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for vascular-access and insertion-site assessment." },
        ],
        feedback: {
          observed: "Observe the antiseptic bottle as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the sterile drape, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the antiseptic bottle as patient-specific evidence for vascular-access and insertion-site assessment. Compare it with the sterile drape, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for vascular-access and insertion-site assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For antiseptic bottle, compare the visible evidence with sterile drape and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to antiseptic bottle; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for vascular-access and insertion-site assessment. For antiseptic bottle, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Program",
    title: "Program, administer, and monitor the infusion",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for program, administer, and monitor the infusion within IV Therapy & Infusion Management. Use the current controlled requirements in CL-SD-010, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-010, Pre-Infusion Assessment and Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before each IV visit, review: the physician order including any recent changes; the patient's current medication list for potential drug interactions; recent laboratory results relevant to the infusion (e.g., trough levels for vancomycin, renal function for nephrotoxic drugs); the patient's allergy list. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN ; Verify that all required supplies and medications are available and not expired, including: IV solution or medication, administration set, flush supplies, dressing change supplies (if CVAD), infusion pump (if required), anaphylaxis kit (epinephrine, diphenhydramine, syringes, 911 contact). ; Before departure. ; ; 6.1.3.",
      "Controlled-policy focus — CL-SD-010, IV Administration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Access the vascular device using aseptic technique. For CVADs, follow the Central Line Bundle Protocol (Appendix A). Perform a normal saline flush before medication administration to verify line patency. ; Before each infusion. ; ; 6.2.2 ; Assigned RN ; Initiate the infusion at the physician-ordered rate. Set infusion pump alarms if applicable. Remain with the patient for at least the first 15 minutes of any new medication or the full duration for high-risk infusions. ; During infusion. ; ; 6.2.3 ; Assigned RN ; Monitor the patient throughout the infusion for: vital sign changes; signs of adverse.",
      "Controlled-policy focus — CL-SD-010, 4\\. Policy Statement. 4.1 IV therapy services shall be authorized by a physician order that specifies: (a) the IV medication or solution; (b) dose, rate, and route (peripheral vs. central); (c) frequency and duration of infusions; (d) vascular access device type; (e) monitoring parameters; (f) laboratory testing schedule if applicable. 4.2 Only RNs who have completed the agency's IV Therapy Competency Program and demonstrated competency in all required IV skills shall be authorized to provide IV therapy services independently. The Director of Nursing shall maintain a current roster of IV-competency-validated RNs. 4.3 The IV Therapy Competency Program shall include demonstrated competency in: (a) peripheral IV insertion and management; (b) central venous access device (CVAD) management including PICC lines, Port-a-Cath access, and.",
      "Controlled-policy focus — CL-SD-010, Emergency Response for IV Complications. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; If anaphylaxis is suspected: (a) stop the infusion immediately; (b) maintain the IV line with normal saline; (c) administer epinephrine per the physician's standing order or emergency protocol; (d) call 911; (e) monitor vital signs continuously; (f) notify the physician; (g) stay with the patient until emergency services arrive. ; Immediately. ; ; 6.4.2 ; Assigned RN ; If infiltration or extravasation occurs: (a) stop the infusion; (b) assess the severity using a standardized infiltration scale; (c) for vesicant extravasation, follow the agency's extravasation protocol including aspiration of residual drug, antidote administration if applicable, and physician notification; (d).",
      "Controlled-policy focus — CL-SD-010, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Non-IV-competency-validated RN assigned to an IV patient ; Director of Nursing identifies during scheduling review ; Immediately reassign the patient to an IV-competency-validated RN. ; Immediate reassignment. ; ; IV medication received from pharmacy appears compromised (discoloration, particles, expired) ; RN does not administer; contacts pharmacy and Director of Nursing ; Do not administer. Contact pharmacy for replacement. Report per RM-PS-003 if a product safety concern is identified. ; Do not administer; replacement requested immediately. ; ; Patient requests self-administration of IV therapy ; Assigned RN assesses capability; consults Director of Nursing and physician ; Only with physician order, documented competency training.",
      "Apply the controlled requirements to the three visible objects in the scene for program, administer, and monitor the infusion. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Infusion Pump Screen", detail: "Review the infusion pump screen for the patient-specific finding. Reconcile it with the fluid bag, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Fluid Bag", detail: "Review the fluid bag for the patient-specific finding. Reconcile it with the tubing clamp, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tubing Clamp", detail: "Review the tubing clamp for the patient-specific finding. Reconcile it with the infusion pump screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "infusion-pump-screen-4-1", label: "infusion pump screen", shortLabel: "infusion pump screen", ariaLabel: "Investigate infusion pump screen",        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the infusion pump screen as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the fluid bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump screen, compare the visible evidence with fluid bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the infusion pump screen as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the fluid bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump screen, compare the visible evidence with fluid bag and the controlling source before classifying status." },
          { id: "i2", label: "Treat the infusion pump screen as the complete assessment and do not compare the fluid bag, patient report, or current record. This identify option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for program, administer, and monitor the infusion." },
          { id: "i3", label: "Carry forward the prior visit conclusion for program, administer, and monitor the infusion without reassessing the patient today. This identify option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about infusion pump screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the infusion pump screen alone and seek clarification only after the intervention is complete. This decide option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for infusion pump screen is resolved." },
          { id: "d3", label: "Defer the concern in the infusion pump screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during program, administer, and monitor the infusion." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For infusion pump screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For infusion pump screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the infusion pump screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of infusion pump screen." },
          { id: "doc3", label: "Keep the infusion pump screen decision in personal notes rather than the governed patient record. This document option concerns infusion pump screen during program, administer, and monitor the infusion.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program, administer, and monitor the infusion." },
        ],
        feedback: {
          observed: "Observe the infusion pump screen as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the fluid bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the infusion pump screen as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the fluid bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump screen, compare the visible evidence with fluid bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For infusion pump screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "fluid-bag-4-2", label: "fluid bag", shortLabel: "fluid bag", ariaLabel: "Investigate fluid bag",        x: 34, y: 46, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the fluid bag as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag, compare the visible evidence with tubing clamp and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the fluid bag as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag, compare the visible evidence with tubing clamp and the controlling source before classifying status." },
          { id: "i2", label: "Assume the fluid bag establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for program, administer, and monitor the infusion." },
          { id: "i3", label: "Dismiss the conflict between the fluid bag and tubing clamp because one source appears more convenient. This identify option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about fluid bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the fluid bag without confirming an applicable order and patient-specific authority. This decide option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for fluid bag is resolved." },
          { id: "d3", label: "Hand the fluid bag concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during program, administer, and monitor the infusion." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For fluid bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For fluid bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the fluid bag before reassessment confirms the patient response. This document option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of fluid bag." },
          { id: "doc3", label: "Copy the prior program, administer, and monitor the infusion narrative even though today’s fluid bag evidence is different. This document option concerns fluid bag during program, administer, and monitor the infusion.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program, administer, and monitor the infusion." },
        ],
        feedback: {
          observed: "Observe the fluid bag as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the fluid bag as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For fluid bag, compare the visible evidence with tubing clamp and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to fluid bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For fluid bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "tubing-clamp-4-3", label: "tubing clamp", shortLabel: "tubing clamp", ariaLabel: "Investigate tubing clamp",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the tubing clamp as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the infusion pump screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with infusion pump screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tubing clamp as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the infusion pump screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with infusion pump screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tubing clamp and omit the related change, symptom, or safety cue. This identify option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for program, administer, and monitor the infusion." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tubing clamp stand in for direct RN assessment. This identify option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tubing clamp." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tubing clamp issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tubing clamp is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for program, administer, and monitor the infusion instead of the current controlled clinical pathway. This decide option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during program, administer, and monitor the infusion." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For tubing clamp, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For tubing clamp, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tubing clamp and omit the discrepancy with infusion pump screen. This document option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tubing clamp." },
          { id: "doc3", label: "Combine the tubing clamp issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tubing clamp during program, administer, and monitor the infusion.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for program, administer, and monitor the infusion." },
        ],
        feedback: {
          observed: "Observe the tubing clamp as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the infusion pump screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tubing clamp as patient-specific evidence for program, administer, and monitor the infusion. Compare it with the infusion pump screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for program, administer, and monitor the infusion, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with infusion pump screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for program, administer, and monitor the infusion. For tubing clamp, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Recogni",
    title: "Recognize infiltration, extravasation, phlebitis, occlusion, and reaction",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within IV Therapy & Infusion Management. Use the current controlled requirements in CL-SD-010, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-010, Emergency Response for IV Complications. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; If anaphylaxis is suspected: (a) stop the infusion immediately; (b) maintain the IV line with normal saline; (c) administer epinephrine per the physician's standing order or emergency protocol; (d) call 911; (e) monitor vital signs continuously; (f) notify the physician; (g) stay with the patient until emergency services arrive. ; Immediately. ; ; 6.4.2 ; Assigned RN ; If infiltration or extravasation occurs: (a) stop the infusion; (b) assess the severity using a standardized infiltration scale; (c) for vesicant extravasation, follow the agency's extravasation protocol including aspiration of residual drug, antidote administration if applicable, and physician notification; (d).",
      "Controlled-policy focus — CL-SD-010, 4\\. Policy Statement. 4.1 IV therapy services shall be authorized by a physician order that specifies: (a) the IV medication or solution; (b) dose, rate, and route (peripheral vs. central); (c) frequency and duration of infusions; (d) vascular access device type; (e) monitoring parameters; (f) laboratory testing schedule if applicable. 4.2 Only RNs who have completed the agency's IV Therapy Competency Program and demonstrated competency in all required IV skills shall be authorized to provide IV therapy services independently. The Director of Nursing shall maintain a current roster of IV-competency-validated RNs. 4.3 The IV Therapy Competency Program shall include demonstrated competency in: (a) peripheral IV insertion and management; (b) central venous access device (CVAD) management including PICC lines, Port-a-Cath access, and.",
      "Controlled-policy focus — CL-SD-010, 2\\. Purpose. This policy defines the clinical standards, competency requirements, safety protocols, and documentation expectations for intravenous (IV) therapy and infusion services provided by Care Indeed Home Health Care, Inc. IV therapy in the home setting includes peripheral and central venous access device management, IV antibiotic therapy, IV hydration, total parenteral nutrition (TPN), blood product administration (if within scope and authorized by the agency), chemotherapy infusion support (limited scope), and IV medication administration. These are among the highest-risk skilled services provided in home health due to the potential for serious complications including infection (central line-associated bloodstream infections — CLABSI), air embolism, infiltration/extravasation, adverse drug reactions, fluid overload, and anaphylaxis. This policy ensures that all IV therapy services are delivered by.",
      "Controlled-policy focus — CL-SD-010, 5\\. Definitions. Term ; Definition ; ; ; ; ; Peripheral IV Access ; Intravenous access established through a peripheral vein, typically in the hand, forearm, or antecubital fossa, using a peripheral IV catheter. ; ; Central Venous Access Device (CVAD) ; A vascular access device with the distal tip positioned in a large central vein, including PICC lines, tunneled catheters, and implanted ports. ; ; PICC (Peripherally Inserted Central Catheter) ; A central venous catheter inserted through a peripheral vein with the tip advanced to the superior vena cava. ; ; Infiltration ; The inadvertent administration of IV solution into the surrounding tissue rather than the vein. ; ; Extravasation ; The inadvertent administration of a vesicant medication into.",
      "Controlled-policy focus — CL-SD-010, IV Administration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Access the vascular device using aseptic technique. For CVADs, follow the Central Line Bundle Protocol (Appendix A). Perform a normal saline flush before medication administration to verify line patency. ; Before each infusion. ; ; 6.2.2 ; Assigned RN ; Initiate the infusion at the physician-ordered rate. Set infusion pump alarms if applicable. Remain with the patient for at least the first 15 minutes of any new medication or the full duration for high-risk infusions. ; During infusion. ; ; 6.2.3 ; Assigned RN ; Monitor the patient throughout the infusion for: vital sign changes; signs of adverse.",
      "Apply the controlled requirements to the three visible objects in the scene for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Transparent Dressing", detail: "Review the transparent dressing for the patient-specific finding. Reconcile it with the cool compress, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Cool Compress", detail: "Review the cool compress for the patient-specific finding. Reconcile it with the stopped pump, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stopped Pump", detail: "Review the stopped pump for the patient-specific finding. Reconcile it with the transparent dressing, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "transparent-dressing-5-1", label: "transparent dressing", shortLabel: "transparent dressing", ariaLabel: "Investigate transparent dressing",        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the transparent dressing as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the cool compress, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with cool compress and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the transparent dressing as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the cool compress, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with cool compress and the controlling source before classifying status." },
          { id: "i2", label: "Assume the transparent dressing establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
          { id: "i3", label: "Dismiss the conflict between the transparent dressing and cool compress because one source appears more convenient. This identify option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about transparent dressing." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the transparent dressing without confirming an applicable order and patient-specific authority. This decide option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for transparent dressing is resolved." },
          { id: "d3", label: "Hand the transparent dressing concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For transparent dressing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For transparent dressing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the transparent dressing before reassessment confirms the patient response. This document option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of transparent dressing." },
          { id: "doc3", label: "Copy the prior recognize infiltration, extravasation, phlebitis, occlusion, and reaction narrative even though today’s transparent dressing evidence is different. This document option concerns transparent dressing during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        feedback: {
          observed: "Observe the transparent dressing as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the cool compress, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the transparent dressing as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the cool compress, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transparent dressing, compare the visible evidence with cool compress and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transparent dressing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For transparent dressing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "cool-compress-5-2", label: "cool compress", shortLabel: "cool compress", ariaLabel: "Investigate cool compress",        x: 47, y: 69, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the cool compress as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the stopped pump, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cool compress, compare the visible evidence with stopped pump and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the cool compress as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the stopped pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cool compress, compare the visible evidence with stopped pump and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the cool compress and omit the related change, symptom, or safety cue. This identify option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
          { id: "i3", label: "Let a blank, unreadable, or unverified cool compress stand in for direct RN assessment. This identify option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about cool compress." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cool compress; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cool compress; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the cool compress issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for cool compress is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for recognize infiltration, extravasation, phlebitis, occlusion, and reaction instead of the current controlled clinical pathway. This decide option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For cool compress, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For cool compress, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the cool compress and omit the discrepancy with stopped pump. This document option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of cool compress." },
          { id: "doc3", label: "Combine the cool compress issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns cool compress during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        feedback: {
          observed: "Observe the cool compress as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the stopped pump, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the cool compress as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the stopped pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cool compress, compare the visible evidence with stopped pump and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cool compress; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For cool compress, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "stopped-pump-5-3", label: "stopped pump", shortLabel: "stopped pump", ariaLabel: "Investigate stopped pump",        x: 85, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the stopped pump as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stopped pump, compare the visible evidence with transparent dressing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stopped pump as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stopped pump, compare the visible evidence with transparent dressing and the controlling source before classifying status." },
          { id: "i2", label: "Treat the stopped pump as the complete assessment and do not compare the transparent dressing, patient report, or current record. This identify option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
          { id: "i3", label: "Carry forward the prior visit conclusion for recognize infiltration, extravasation, phlebitis, occlusion, and reaction without reassessing the patient today. This identify option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stopped pump." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stopped pump; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stopped pump; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the stopped pump alone and seek clarification only after the intervention is complete. This decide option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stopped pump is resolved." },
          { id: "d3", label: "Defer the concern in the stopped pump to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For stopped pump, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For stopped pump, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the stopped pump was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stopped pump." },
          { id: "doc3", label: "Keep the stopped pump decision in personal notes rather than the governed patient record. This document option concerns stopped pump during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize infiltration, extravasation, phlebitis, occlusion, and reaction." },
        ],
        feedback: {
          observed: "Observe the stopped pump as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stopped pump as patient-specific evidence for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. Compare it with the transparent dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize infiltration, extravasation, phlebitis, occlusion, and reaction, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stopped pump, compare the visible evidence with transparent dressing and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stopped pump; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize infiltration, extravasation, phlebitis, occlusion, and reaction. For stopped pump, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Stop",
    title: "Stop therapy and escalate complications or device failure",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for stop therapy and escalate complications or device failure within IV Therapy & Infusion Management. Use the current controlled requirements in CL-CP-001, QA-AE-001, CL-SD-010, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Plan of care developed by non-RN staff or templated without individualization ; CMS deficiency under 42 CFR § 484.60; potential False Claims Act risk ; Require RN development of all SOC plans of care; Director of Nursing conducts quality review of new SOC plans ; ; Goals stated in non-measurable terms (\"patient will improve ADLs\") ; Survey citation for inadequate plan of care; inability to demonstrate outcome achievement ; Train all RNs on SMART goal-writing; use goal templates with required metrics ; ; Services delivered that are not on the plan of care ; Billing compliance risk; potential False Claims Act; survey deficiency ; Implement visit.",
      "Controlled-policy focus — QA-AE-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Adverse events documented in clinical record but not reported through the adverse event reporting system. ; Events not captured for QAPI trending; surveyor sees events in records but no investigation evidence. ; Train all staff to complete Adverse Event Report Form separately from clinical documentation. ; ; Non-punitive culture not established; staff fear reporting. ; Under-reporting; hidden safety risks. ; Reinforce non-punitive culture at orientation and annually; monitor reporting rates. ; ; Events reported but no investigation or corrective action. ; Surveyor cites failure to act on identified safety issues. ; Mandate investigation and CAP per Sections 6.3 and 6.4. ; ; Near-misses not captured..",
      "Controlled-policy focus — CL-SD-010, 4\\. Policy Statement. 4.1 IV therapy services shall be authorized by a physician order that specifies: (a) the IV medication or solution; (b) dose, rate, and route (peripheral vs. central); (c) frequency and duration of infusions; (d) vascular access device type; (e) monitoring parameters; (f) laboratory testing schedule if applicable. 4.2 Only RNs who have completed the agency's IV Therapy Competency Program and demonstrated competency in all required IV skills shall be authorized to provide IV therapy services independently. The Director of Nursing shall maintain a current roster of IV-competency-validated RNs. 4.3 The IV Therapy Competency Program shall include demonstrated competency in: (a) peripheral IV insertion and management; (b) central venous access device (CVAD) management including PICC lines, Port-a-Cath access, and.",
      "Controlled-policy focus — CL-SD-010, Emergency Response for IV Complications. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; If anaphylaxis is suspected: (a) stop the infusion immediately; (b) maintain the IV line with normal saline; (c) administer epinephrine per the physician's standing order or emergency protocol; (d) call 911; (e) monitor vital signs continuously; (f) notify the physician; (g) stay with the patient until emergency services arrive. ; Immediately. ; ; 6.4.2 ; Assigned RN ; If infiltration or extravasation occurs: (a) stop the infusion; (b) assess the severity using a standardized infiltration scale; (c) for vesicant extravasation, follow the agency's extravasation protocol including aspiration of residual drug, antidote administration if applicable, and physician notification; (d).",
      "Controlled-policy focus — CL-SD-010, 2\\. Purpose. This policy defines the clinical standards, competency requirements, safety protocols, and documentation expectations for intravenous (IV) therapy and infusion services provided by Care Indeed Home Health Care, Inc. IV therapy in the home setting includes peripheral and central venous access device management, IV antibiotic therapy, IV hydration, total parenteral nutrition (TPN), blood product administration (if within scope and authorized by the agency), chemotherapy infusion support (limited scope), and IV medication administration. These are among the highest-risk skilled services provided in home health due to the potential for serious complications including infection (central line-associated bloodstream infections — CLABSI), air embolism, infiltration/extravasation, adverse drug reactions, fluid overload, and anaphylaxis. This policy ensures that all IV therapy services are delivered by.",
      "Apply the controlled requirements to the three visible objects in the scene for stop therapy and escalate complications or device failure. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Practice Pump Screen", detail: "Review the practice pump screen for the patient-specific finding. Reconcile it with the tubing clamp, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tubing Clamp", detail: "Review the tubing clamp for the patient-specific finding. Reconcile it with the step cards, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Step Cards", detail: "Review the step cards for the patient-specific finding. Reconcile it with the practice pump screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR §484.80" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "practice-pump-screen-6-1", label: "practice pump screen", shortLabel: "practice pump screen", ariaLabel: "Investigate practice pump screen",        x: 23, y: 68, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the practice pump screen as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice pump screen, compare the visible evidence with tubing clamp and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the practice pump screen as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice pump screen, compare the visible evidence with tubing clamp and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the practice pump screen and omit the related change, symptom, or safety cue. This identify option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for stop therapy and escalate complications or device failure." },
          { id: "i3", label: "Let a blank, unreadable, or unverified practice pump screen stand in for direct RN assessment. This identify option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about practice pump screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice pump screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice pump screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the practice pump screen issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for practice pump screen is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for stop therapy and escalate complications or device failure instead of the current controlled clinical pathway. This decide option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during stop therapy and escalate complications or device failure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For practice pump screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For practice pump screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the practice pump screen and omit the discrepancy with tubing clamp. This document option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of practice pump screen." },
          { id: "doc3", label: "Combine the practice pump screen issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns practice pump screen during stop therapy and escalate complications or device failure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for stop therapy and escalate complications or device failure." },
        ],
        feedback: {
          observed: "Observe the practice pump screen as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the practice pump screen as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the tubing clamp, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For practice pump screen, compare the visible evidence with tubing clamp and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to practice pump screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For practice pump screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "tubing-clamp-6-2", label: "tubing clamp", shortLabel: "tubing clamp", ariaLabel: "Investigate tubing clamp",        x: 33, y: 38, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the tubing clamp as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the step cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with step cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tubing clamp as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the step cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with step cards and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tubing clamp as the complete assessment and do not compare the step cards, patient report, or current record. This identify option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for stop therapy and escalate complications or device failure." },
          { id: "i3", label: "Carry forward the prior visit conclusion for stop therapy and escalate complications or device failure without reassessing the patient today. This identify option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tubing clamp." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tubing clamp alone and seek clarification only after the intervention is complete. This decide option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tubing clamp is resolved." },
          { id: "d3", label: "Defer the concern in the tubing clamp to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during stop therapy and escalate complications or device failure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For tubing clamp, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For tubing clamp, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tubing clamp was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tubing clamp." },
          { id: "doc3", label: "Keep the tubing clamp decision in personal notes rather than the governed patient record. This document option concerns tubing clamp during stop therapy and escalate complications or device failure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for stop therapy and escalate complications or device failure." },
        ],
        feedback: {
          observed: "Observe the tubing clamp as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the step cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tubing clamp as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the step cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tubing clamp, compare the visible evidence with step cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tubing clamp; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For tubing clamp, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "step-cards-6-3", label: "step cards", shortLabel: "step cards", ariaLabel: "Investigate step cards",        x: 79, y: 54, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the step cards as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the practice pump screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For step cards, compare the visible evidence with practice pump screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the step cards as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the practice pump screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For step cards, compare the visible evidence with practice pump screen and the controlling source before classifying status." },
          { id: "i2", label: "Assume the step cards establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for stop therapy and escalate complications or device failure." },
          { id: "i3", label: "Dismiss the conflict between the step cards and practice pump screen because one source appears more convenient. This identify option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about step cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to step cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to step cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the step cards without confirming an applicable order and patient-specific authority. This decide option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for step cards is resolved." },
          { id: "d3", label: "Hand the step cards concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during stop therapy and escalate complications or device failure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For step cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For step cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the step cards before reassessment confirms the patient response. This document option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of step cards." },
          { id: "doc3", label: "Copy the prior stop therapy and escalate complications or device failure narrative even though today’s step cards evidence is different. This document option concerns step cards during stop therapy and escalate complications or device failure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for stop therapy and escalate complications or device failure." },
        ],
        feedback: {
          observed: "Observe the step cards as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the practice pump screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the step cards as patient-specific evidence for stop therapy and escalate complications or device failure. Compare it with the practice pump screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for stop therapy and escalate complications or device failure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For step cards, compare the visible evidence with practice pump screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to step cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for stop therapy and escalate complications or device failure. For step cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Line",
    title: "Line care, disposal, response, and documentation",
    subtitle: "IV Therapy & Infusion Management",
    narration: [
      "This lesson develops registered-nurse reasoning for line care, disposal, response, and documentation within IV Therapy & Infusion Management. Use the current controlled requirements in CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Multidisciplinary Coordination in Plan of Care Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Ensure that all disciplines providing services to the patient have reviewed the plan of care and that their discipline-specific goals, interventions, and visit frequencies are accurately reflected. No discipline shall provide services that conflict with or exceed what is authorized in the plan of care without a new physician order. ; Within 48 hours of the SOC visit. ; ; 6.4.2 ; Each Clinical Discipline Provider ; Upon receiving a referral for a new patient, review the plan of care within 24 hours of assignment. Confirm that the ordered services are within the discipline's scope of practice.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Completed plan of care ; Patient-specific plan of care including all required elements per Section 6.2 ; Assigned RN ; EHR — patient clinical record ; Developed within 24 hours of SOC visit; retained for minimum 7 years per CO-HP-007 ; ; Physician-signed plan of care ; Signed and dated CMS-485 or EHR equivalent ; Certifying physician / Medical Records ; EHR — patient clinical record ; Received and filed before claim submission; retained minimum 7 years ; ; Plan of care transmission record ; Documentation of date, method, and recipient of transmission to physician ; Clinical Coordinator.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Apply the controlled requirements to the three visible objects in the scene for line care, disposal, response, and documentation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Infusion Pump", detail: "Review the infusion pump for the patient-specific finding. Reconcile it with the competency checklist, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Competency Checklist", detail: "Review the competency checklist for the patient-specific finding. Reconcile it with the locked supply box, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Locked Supply Box", detail: "Review the locked supply box for the patient-specific finding. Reconcile it with the infusion pump, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-010" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "infusion-pump-7-1", label: "infusion pump", shortLabel: "infusion pump", ariaLabel: "Investigate infusion pump",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the infusion pump as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the competency checklist, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump, compare the visible evidence with competency checklist and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the infusion pump as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the competency checklist, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump, compare the visible evidence with competency checklist and the controlling source before classifying status." },
          { id: "i2", label: "Treat the infusion pump as the complete assessment and do not compare the competency checklist, patient report, or current record. This identify option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for line care, disposal, response, and documentation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for line care, disposal, response, and documentation without reassessing the patient today. This identify option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about infusion pump." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the infusion pump alone and seek clarification only after the intervention is complete. This decide option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for infusion pump is resolved." },
          { id: "d3", label: "Defer the concern in the infusion pump to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during line care, disposal, response, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For infusion pump, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For infusion pump, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the infusion pump was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of infusion pump." },
          { id: "doc3", label: "Keep the infusion pump decision in personal notes rather than the governed patient record. This document option concerns infusion pump during line care, disposal, response, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for line care, disposal, response, and documentation." },
        ],
        feedback: {
          observed: "Observe the infusion pump as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the competency checklist, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the infusion pump as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the competency checklist, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For infusion pump, compare the visible evidence with competency checklist and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to infusion pump; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For infusion pump, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "competency-checklist-7-2", label: "competency checklist", shortLabel: "competency checklist", ariaLabel: "Investigate competency checklist",        x: 35, y: 60, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the competency checklist as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the locked supply box, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency checklist, compare the visible evidence with locked supply box and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the competency checklist as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the locked supply box, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency checklist, compare the visible evidence with locked supply box and the controlling source before classifying status." },
          { id: "i2", label: "Assume the competency checklist establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for line care, disposal, response, and documentation." },
          { id: "i3", label: "Dismiss the conflict between the competency checklist and locked supply box because one source appears more convenient. This identify option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about competency checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency checklist; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency checklist; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the competency checklist without confirming an applicable order and patient-specific authority. This decide option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for competency checklist is resolved." },
          { id: "d3", label: "Hand the competency checklist concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during line care, disposal, response, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For competency checklist, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For competency checklist, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the competency checklist before reassessment confirms the patient response. This document option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency checklist." },
          { id: "doc3", label: "Copy the prior line care, disposal, response, and documentation narrative even though today’s competency checklist evidence is different. This document option concerns competency checklist during line care, disposal, response, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for line care, disposal, response, and documentation." },
        ],
        feedback: {
          observed: "Observe the competency checklist as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the locked supply box, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the competency checklist as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the locked supply box, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency checklist, compare the visible evidence with locked supply box and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency checklist; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For competency checklist, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "locked-supply-box-7-3", label: "locked supply box", shortLabel: "locked supply box", ariaLabel: "Investigate locked supply box",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the locked supply box as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the infusion pump, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply box, compare the visible evidence with infusion pump and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the locked supply box as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the infusion pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply box, compare the visible evidence with infusion pump and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the locked supply box and omit the related change, symptom, or safety cue. This identify option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for line care, disposal, response, and documentation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified locked supply box stand in for direct RN assessment. This identify option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about locked supply box." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply box; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply box; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the locked supply box issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for locked supply box is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for line care, disposal, response, and documentation instead of the current controlled clinical pathway. This decide option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during line care, disposal, response, and documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For locked supply box, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For locked supply box, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the locked supply box and omit the discrepancy with infusion pump. This document option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked supply box." },
          { id: "doc3", label: "Combine the locked supply box issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns locked supply box during line care, disposal, response, and documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for line care, disposal, response, and documentation." },
        ],
        feedback: {
          observed: "Observe the locked supply box as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the infusion pump, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the locked supply box as patient-specific evidence for line care, disposal, response, and documentation. Compare it with the infusion pump, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for line care, disposal, response, and documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply box, compare the visible evidence with infusion pump and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply box; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for line care, disposal, response, and documentation. For locked supply box, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-010","CL-CP-001","QA-AE-001","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During verify order, therapy purpose, access, and readiness, the closed supply tray conflicts with the fluid bag label and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the fluid bag label is unchanged from the prior encounter and omit patient-specific reassessment during verify order, therapy purpose, access, and readiness.",
      "Defer the concern in the closed supply tray to the next routine visit even though its current clinical significance has not been assessed. This option concerns verify order, therapy purpose, access, and readiness.",
      "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the closed supply tray alone and seek clarification only after the intervention is complete. This option concerns verify order, therapy purpose, access, and readiness.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for verify order, therapy purpose, access, and readiness within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 2,
    stem: "During aseptic setup and medication/solution verification, the saline flush package conflicts with the transparent dressing and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the saline flush package without confirming an applicable order and patient-specific authority. This option concerns aseptic setup and medication/solution verification.",
      "Assume the transparent dressing is unchanged from the prior encounter and omit patient-specific reassessment during aseptic setup and medication/solution verification.",
      "Hand the saline flush package concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns aseptic setup and medication/solution verification.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for aseptic setup and medication/solution verification within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 3,
    stem: "During vascular-access and insertion-site assessment, the antiseptic bottle conflicts with the sterile drape and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the antiseptic bottle issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns vascular-access and insertion-site assessment.",
      "Use a familiar local shortcut for vascular-access and insertion-site assessment instead of the current controlled clinical pathway. This option concerns vascular-access and insertion-site assessment.",
      "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the sterile drape is unchanged from the prior encounter and omit patient-specific reassessment during vascular-access and insertion-site assessment.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for vascular-access and insertion-site assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 4,
    stem: "During program, administer, and monitor the infusion, the tubing clamp conflicts with the infusion pump screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the infusion pump screen is unchanged from the prior encounter and omit patient-specific reassessment during program, administer, and monitor the infusion.",
      "Defer the concern in the tubing clamp to the next routine visit even though its current clinical significance has not been assessed. This option concerns program, administer, and monitor the infusion.",
      "Proceed using the tubing clamp alone and seek clarification only after the intervention is complete. This option concerns program, administer, and monitor the infusion.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for program, administer, and monitor the infusion within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 5,
    stem: "During recognize infiltration, extravasation, phlebitis, occlusion, and reaction, the stopped pump conflicts with the transparent dressing and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the stopped pump concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns recognize infiltration, extravasation, phlebitis, occlusion, and reaction.",
      "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the transparent dressing is unchanged from the prior encounter and omit patient-specific reassessment during recognize infiltration, extravasation, phlebitis, occlusion, and reaction.",
      "Change the treatment, medication, device setting, or plan based on the stopped pump without confirming an applicable order and patient-specific authority. This option concerns recognize infiltration, extravasation, phlebitis, occlusion, and reaction.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for recognize infiltration, extravasation, phlebitis, occlusion, and reaction within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 6,
    stem: "During stop therapy and escalate complications or device failure, the step cards conflicts with the practice pump screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for stop therapy and escalate complications or device failure instead of the current controlled clinical pathway. This option concerns stop therapy and escalate complications or device failure.",
      "Assume the practice pump screen is unchanged from the prior encounter and omit patient-specific reassessment during stop therapy and escalate complications or device failure.",
      "Close the step cards issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns stop therapy and escalate complications or device failure.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for stop therapy and escalate complications or device failure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 7,
    stem: "During line care, disposal, response, and documentation, the locked supply box conflicts with the infusion pump and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the locked supply box to the next routine visit even though its current clinical significance has not been assessed. This option concerns line care, disposal, response, and documentation.",
      "Proceed using the locked supply box alone and seek clarification only after the intervention is complete. This option concerns line care, disposal, response, and documentation.",
      "Assume the infusion pump is unchanged from the prior encounter and omit patient-specific reassessment during line care, disposal, response, and documentation.",
      "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for line care, disposal, response, and documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-010, CL-CP-001, QA-AE-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.75 be used when applying IV Therapy & Infusion Management?",
    options: [
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
    ],
    correct: 1,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the transparent dressing and step cards into defensible RN practice for IV Therapy & Infusion Management?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A familiar device display accepted without technique or context validation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of IV Therapy & Infusion Management establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in IV Therapy & Infusion Management, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Automatic authority to perform every activity discussed in IV Therapy & Infusion Management without supervision.",
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


const STORAGE_KEY = 'rn-008-progress-v6000';

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

export default function RN008() {
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
          <span className="brand-text">RN-008 — IV Therapy</span>
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
