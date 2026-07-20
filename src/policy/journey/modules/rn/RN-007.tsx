/**
 * RN-007 — Wound Care & Skin Integrity
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
import img01 from './assets/rn-007/rn-007-lesson-01.png';
import img02 from './assets/rn-007/rn-007-lesson-02.png';
import img03 from './assets/rn-007/rn-007-lesson-03.png';
import img04 from './assets/rn-007/rn-007-lesson-04.png';
import img05 from './assets/rn-007/rn-007-lesson-05.png';
import img06 from './assets/rn-007/rn-007-lesson-06.png';
import img07 from './assets/rn-007/rn-007-lesson-07.png';

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

const MODULE_META = { id: "RN-007", title: "Wound Care & Skin Integrity", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Head-to-toe skin integrity and wound etiology, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for T.I.M.E. wound-bed assessment, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Consistent measurements, tracts, pain, and photographs, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Pressure-injury classification and skin protection, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Order-specific care, supplies, and infection prevention, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Deterioration, infection, and order escalation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Healing trajectory and complete wound documentation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Head-to",
    title: "Head-to-toe skin integrity and wound etiology",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for head-to-toe skin integrity and wound etiology within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, Initial Wound Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, perform a complete skin assessment to identify all wounds — do not rely solely on the referral documentation for wound identification. Undress all dressings. Assess each wound using all elements in Section 4.3. ; At the SOC visit. ; ; 6.1.2 ; Assigned RN ; Classify and stage each wound. For pressure injuries, use the NPIAP staging system exclusively. Do not reverse-stage healing pressure injuries. For non-pressure wounds, classify by etiology (surgical, diabetic, venous, arterial, traumatic). ; At the SOC visit. ; ; 6.1.3 ; Assigned RN ; Measure each wound (L x W.",
      "Controlled-policy focus — CL-SD-011, Ongoing Wound Assessment and Treatment. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; At each wound care visit, assess the wound using all elements in Section 4.3. Compare findings to the previous visit assessment. Document all findings. ; At each wound care visit. ; ; 6.2.2 ; Assigned RN / LVN ; Perform wound care treatment per the physician order. Document the treatment performed including: wound cleansing method, debridement (if any), dressing applied, and the patient's tolerance. ; At each wound care visit. ; ; 6.2.3 ; Assigned RN ; Perform formal wound measurements (L x W x D) at minimum every 2 weeks and at each OASIS assessment.",
      "Controlled-policy focus — CL-SD-011, 4\\. Policy Statement. 4.1 All wound care services shall be authorized by a physician order specifying: the wound location, wound care procedure, dressing type and frequency, and any wound-related medications (e.g., topical antibiotics, enzymatic debriding agents). 4.2 At SOC and at each OASIS assessment time point, all wounds shall be assessed, classified, staged (for pressure injuries), measured, and documented using the standardized Wound Assessment Documentation Template (Appendix A) that includes all elements necessary for accurate OASIS item completion (M1311 through M1350). 4.3 Wound assessment shall include at minimum: (a) wound location (anatomical site); (b) wound etiology (pressure injury, surgical, diabetic, venous, arterial, traumatic, other); (c) wound stage/classification — using the National Pressure Injury Advisory Panel (NPIAP) staging system for pressure injuries.",
      "Controlled-policy focus — CL-SD-011, OASIS Wound Item Coding Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; When completing OASIS wound items (M1311–M1350), ensure that every response is supported by the narrative wound assessment documentation in the clinical record per CL-OA-007. ; At each OASIS time point. ; ; 6.3.2 ; Assigned RN ; Follow the CMS OASIS Guidance Manual for all wound item coding, including the specific look-back periods and response definitions per CL-OA-010. ; At each OASIS time point. ; ; 6.3.3 ; Director of Nursing ; Include wound documentation accuracy as a component of the monthly documentation audit. Cross-reference OASIS wound item responses against wound assessment narratives for a random sample of.",
      "Controlled-policy focus — CL-SD-011, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Initial wound assessment ; Wound Assessment Documentation Template (Appendix A) for each wound ; Assigned RN ; EHR — visit note and wound assessment module ; At SOC; within 24 hours ; ; Ongoing wound assessment and treatment ; Visit note documenting assessment findings, treatment, and patient response ; Assigned RN / LVN ; EHR — visit note ; At each wound care visit; within 24 hours ; ; Wound measurements ; L x W x D documented in centimeters with comparison to baseline ; Assigned RN ; EHR — wound assessment module ; Every 2 weeks and.",
      "Apply the controlled requirements to the three visible objects in the scene for head-to-toe skin integrity and wound etiology. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Soft Positioning Wedge", detail: "Review the soft positioning wedge for the patient-specific finding. Reconcile it with the gauze package, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Gauze Package", detail: "Review the gauze package for the patient-specific finding. Reconcile it with the skin-safe measuring ruler without markings visible, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Skin-safe Measuring Ruler Without Markings Visible", detail: "Review the skin-safe measuring ruler without markings visible for the patient-specific finding. Reconcile it with the soft positioning wedge, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "soft-positioning-wedge-1-1", label: "soft positioning wedge", shortLabel: "soft positioning wedge", ariaLabel: "Investigate soft positioning wedge",        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the soft positioning wedge as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the gauze package, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For soft positioning wedge, compare the visible evidence with gauze package and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the soft positioning wedge as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the gauze package, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For soft positioning wedge, compare the visible evidence with gauze package and the controlling source before classifying status." },
          { id: "i2", label: "Treat the soft positioning wedge as the complete assessment and do not compare the gauze package, patient report, or current record. This identify option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe skin integrity and wound etiology." },
          { id: "i3", label: "Carry forward the prior visit conclusion for head-to-toe skin integrity and wound etiology without reassessing the patient today. This identify option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about soft positioning wedge." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to soft positioning wedge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to soft positioning wedge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the soft positioning wedge alone and seek clarification only after the intervention is complete. This decide option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for soft positioning wedge is resolved." },
          { id: "d3", label: "Defer the concern in the soft positioning wedge to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe skin integrity and wound etiology." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For soft positioning wedge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For soft positioning wedge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the soft positioning wedge was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of soft positioning wedge." },
          { id: "doc3", label: "Keep the soft positioning wedge decision in personal notes rather than the governed patient record. This document option concerns soft positioning wedge during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe skin integrity and wound etiology." },
        ],
        feedback: {
          observed: "Observe the soft positioning wedge as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the gauze package, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the soft positioning wedge as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the gauze package, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For soft positioning wedge, compare the visible evidence with gauze package and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to soft positioning wedge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For soft positioning wedge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "gauze-package-1-2", label: "gauze package", shortLabel: "gauze package", ariaLabel: "Investigate gauze package",        x: 36, y: 62, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the gauze package as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the skin-safe measuring ruler without markings visible, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gauze package, compare the visible evidence with skin-safe measuring ruler without markings visible and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the gauze package as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the skin-safe measuring ruler without markings visible, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gauze package, compare the visible evidence with skin-safe measuring ruler without markings visible and the controlling source before classifying status." },
          { id: "i2", label: "Assume the gauze package establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe skin integrity and wound etiology." },
          { id: "i3", label: "Dismiss the conflict between the gauze package and skin-safe measuring ruler without markings visible because one source appears more convenient. This identify option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about gauze package." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gauze package; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gauze package; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the gauze package without confirming an applicable order and patient-specific authority. This decide option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for gauze package is resolved." },
          { id: "d3", label: "Hand the gauze package concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe skin integrity and wound etiology." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For gauze package, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For gauze package, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the gauze package before reassessment confirms the patient response. This document option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of gauze package." },
          { id: "doc3", label: "Copy the prior head-to-toe skin integrity and wound etiology narrative even though today’s gauze package evidence is different. This document option concerns gauze package during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe skin integrity and wound etiology." },
        ],
        feedback: {
          observed: "Observe the gauze package as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the skin-safe measuring ruler without markings visible, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the gauze package as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the skin-safe measuring ruler without markings visible, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gauze package, compare the visible evidence with skin-safe measuring ruler without markings visible and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gauze package; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For gauze package, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "skin-safe-measuring-ruler-without-markings-vis-1-3", label: "skin-safe measuring ruler without markings visible", shortLabel: "skin-safe measuring ruler", ariaLabel: "Investigate skin-safe measuring ruler without markings visible",        x: 82, y: 42, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the skin-safe measuring ruler without markings visible as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the soft positioning wedge, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For skin-safe measuring ruler without markings visible, compare the visible evidence with soft positioning wedge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the skin-safe measuring ruler without markings visible as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the soft positioning wedge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For skin-safe measuring ruler without markings visible, compare the visible evidence with soft positioning wedge and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the skin-safe measuring ruler without markings visible and omit the related change, symptom, or safety cue. This identify option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for head-to-toe skin integrity and wound etiology." },
          { id: "i3", label: "Let a blank, unreadable, or unverified skin-safe measuring ruler without markings visible stand in for direct RN assessment. This identify option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about skin-safe measuring ruler without markings visible." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to skin-safe measuring ruler without markings visible; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to skin-safe measuring ruler without markings visible; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the skin-safe measuring ruler without markings visible issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for skin-safe measuring ruler without markings visible is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for head-to-toe skin integrity and wound etiology instead of the current controlled clinical pathway. This decide option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during head-to-toe skin integrity and wound etiology." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For skin-safe measuring ruler without markings visible, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For skin-safe measuring ruler without markings visible, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the skin-safe measuring ruler without markings visible and omit the discrepancy with soft positioning wedge. This document option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of skin-safe measuring ruler without markings visible." },
          { id: "doc3", label: "Combine the skin-safe measuring ruler without markings visible issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns skin-safe measuring ruler without markings visible during head-to-toe skin integrity and wound etiology.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for head-to-toe skin integrity and wound etiology." },
        ],
        feedback: {
          observed: "Observe the skin-safe measuring ruler without markings visible as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the soft positioning wedge, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the skin-safe measuring ruler without markings visible as patient-specific evidence for head-to-toe skin integrity and wound etiology. Compare it with the soft positioning wedge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for head-to-toe skin integrity and wound etiology, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For skin-safe measuring ruler without markings visible, compare the visible evidence with soft positioning wedge and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to skin-safe measuring ruler without markings visible; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for head-to-toe skin integrity and wound etiology. For skin-safe measuring ruler without markings visible, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 T",
    title: "T.I.M.E. wound-bed assessment",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for t.i.m.e. wound-bed assessment within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, Initial Wound Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, perform a complete skin assessment to identify all wounds — do not rely solely on the referral documentation for wound identification. Undress all dressings. Assess each wound using all elements in Section 4.3. ; At the SOC visit. ; ; 6.1.2 ; Assigned RN ; Classify and stage each wound. For pressure injuries, use the NPIAP staging system exclusively. Do not reverse-stage healing pressure injuries. For non-pressure wounds, classify by etiology (surgical, diabetic, venous, arterial, traumatic). ; At the SOC visit. ; ; 6.1.3 ; Assigned RN ; Measure each wound (L x W.",
      "Controlled-policy focus — CL-SD-011, Ongoing Wound Assessment and Treatment. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; At each wound care visit, assess the wound using all elements in Section 4.3. Compare findings to the previous visit assessment. Document all findings. ; At each wound care visit. ; ; 6.2.2 ; Assigned RN / LVN ; Perform wound care treatment per the physician order. Document the treatment performed including: wound cleansing method, debridement (if any), dressing applied, and the patient's tolerance. ; At each wound care visit. ; ; 6.2.3 ; Assigned RN ; Perform formal wound measurements (L x W x D) at minimum every 2 weeks and at each OASIS assessment.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-SD-011, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Initial wound assessment ; Wound Assessment Documentation Template (Appendix A) for each wound ; Assigned RN ; EHR — visit note and wound assessment module ; At SOC; within 24 hours ; ; Ongoing wound assessment and treatment ; Visit note documenting assessment findings, treatment, and patient response ; Assigned RN / LVN ; EHR — visit note ; At each wound care visit; within 24 hours ; ; Wound measurements ; L x W x D documented in centimeters with comparison to baseline ; Assigned RN ; EHR — wound assessment module ; Every 2 weeks and.",
      "Controlled-policy focus — CL-SD-011, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; All wounds assessed with complete documentation at SOC ; Chart audit using Wound Assessment Template ; ≥95% of audited records with complete wound assessments at SOC ; ; Wound measurements documented every 2 weeks ; Chart audit ; ≥95% ; ; OASIS wound items consistent with wound assessment narrative ; OASIS-to-narrative cross-reference audit ; ≥95% — zero material inconsistencies ; ; Wounds not progressing result in documented reassessment within 2–4 weeks ; Chart review of non-healing wounds ; 100% of non-progressing wounds with documented reassessment ; ; Wound photographs obtained at required time points ; Chart audit ; ≥90%.",
      "Apply the controlled requirements to the three visible objects in the scene for t.i.m.e. wound-bed assessment. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Modest Skin Simulation Pad", detail: "Review the modest skin simulation pad for the patient-specific finding. Reconcile it with the magnifier, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Magnifier", detail: "Review the magnifier for the patient-specific finding. Reconcile it with the clean measuring guide, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Clean Measuring Guide", detail: "Review the clean measuring guide for the patient-specific finding. Reconcile it with the modest skin simulation pad, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for t.i.m.e.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "modest-skin-simulation-pad-2-1", label: "modest skin simulation pad", shortLabel: "modest skin simulation pad", ariaLabel: "Investigate modest skin simulation pad",        x: 14, y: 72, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the modest skin simulation pad as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest skin simulation pad, compare the visible evidence with magnifier and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the modest skin simulation pad as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest skin simulation pad, compare the visible evidence with magnifier and the controlling source before classifying status." },
          { id: "i2", label: "Assume the modest skin simulation pad establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for t.i.m.e. wound-bed assessment." },
          { id: "i3", label: "Dismiss the conflict between the modest skin simulation pad and magnifier because one source appears more convenient. This identify option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about modest skin simulation pad." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest skin simulation pad; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest skin simulation pad; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the modest skin simulation pad without confirming an applicable order and patient-specific authority. This decide option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for modest skin simulation pad is resolved." },
          { id: "d3", label: "Hand the modest skin simulation pad concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during t.i.m.e. wound-bed assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For modest skin simulation pad, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For modest skin simulation pad, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the modest skin simulation pad before reassessment confirms the patient response. This document option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of modest skin simulation pad." },
          { id: "doc3", label: "Copy the prior t.i.m.e. wound-bed assessment narrative even though today’s modest skin simulation pad evidence is different. This document option concerns modest skin simulation pad during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for t.i.m.e. wound-bed assessment." },
        ],
        feedback: {
          observed: "Observe the modest skin simulation pad as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the modest skin simulation pad as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest skin simulation pad, compare the visible evidence with magnifier and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest skin simulation pad; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For modest skin simulation pad, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "magnifier-2-2", label: "magnifier", shortLabel: "magnifier", ariaLabel: "Investigate magnifier",        x: 38, y: 38, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the magnifier as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the clean measuring guide, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with clean measuring guide and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the magnifier as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the clean measuring guide, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with clean measuring guide and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the magnifier and omit the related change, symptom, or safety cue. This identify option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for t.i.m.e. wound-bed assessment." },
          { id: "i3", label: "Let a blank, unreadable, or unverified magnifier stand in for direct RN assessment. This identify option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about magnifier." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the magnifier issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for magnifier is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for t.i.m.e. wound-bed assessment instead of the current controlled clinical pathway. This decide option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during t.i.m.e. wound-bed assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For magnifier, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For magnifier, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the magnifier and omit the discrepancy with clean measuring guide. This document option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of magnifier." },
          { id: "doc3", label: "Combine the magnifier issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns magnifier during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for t.i.m.e. wound-bed assessment." },
        ],
        feedback: {
          observed: "Observe the magnifier as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the clean measuring guide, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the magnifier as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the clean measuring guide, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with clean measuring guide and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For magnifier, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "clean-measuring-guide-2-3", label: "clean measuring guide", shortLabel: "clean measuring guide", ariaLabel: "Investigate clean measuring guide",        x: 77, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the clean measuring guide as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the modest skin simulation pad, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clean measuring guide, compare the visible evidence with modest skin simulation pad and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the clean measuring guide as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the modest skin simulation pad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clean measuring guide, compare the visible evidence with modest skin simulation pad and the controlling source before classifying status." },
          { id: "i2", label: "Treat the clean measuring guide as the complete assessment and do not compare the modest skin simulation pad, patient report, or current record. This identify option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for t.i.m.e. wound-bed assessment." },
          { id: "i3", label: "Carry forward the prior visit conclusion for t.i.m.e. wound-bed assessment without reassessing the patient today. This identify option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about clean measuring guide." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clean measuring guide; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clean measuring guide; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the clean measuring guide alone and seek clarification only after the intervention is complete. This decide option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for clean measuring guide is resolved." },
          { id: "d3", label: "Defer the concern in the clean measuring guide to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during t.i.m.e. wound-bed assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For clean measuring guide, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For clean measuring guide, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the clean measuring guide was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clean measuring guide." },
          { id: "doc3", label: "Keep the clean measuring guide decision in personal notes rather than the governed patient record. This document option concerns clean measuring guide during t.i.m.e. wound-bed assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for t.i.m.e. wound-bed assessment." },
        ],
        feedback: {
          observed: "Observe the clean measuring guide as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the modest skin simulation pad, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the clean measuring guide as patient-specific evidence for t.i.m.e. wound-bed assessment. Compare it with the modest skin simulation pad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for t.i.m.e. wound-bed assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clean measuring guide, compare the visible evidence with modest skin simulation pad and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clean measuring guide; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for t.i.m.e. wound-bed assessment. For clean measuring guide, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Consist",
    title: "Consistent measurements, tracts, pain, and photographs",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for consistent measurements, tracts, pain, and photographs within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, 4\\. Policy Statement. 4.1 All wound care services shall be authorized by a physician order specifying: the wound location, wound care procedure, dressing type and frequency, and any wound-related medications (e.g., topical antibiotics, enzymatic debriding agents). 4.2 At SOC and at each OASIS assessment time point, all wounds shall be assessed, classified, staged (for pressure injuries), measured, and documented using the standardized Wound Assessment Documentation Template (Appendix A) that includes all elements necessary for accurate OASIS item completion (M1311 through M1350). 4.3 Wound assessment shall include at minimum: (a) wound location (anatomical site); (b) wound etiology (pressure injury, surgical, diabetic, venous, arterial, traumatic, other); (c) wound stage/classification — using the National Pressure Injury Advisory Panel (NPIAP) staging system for pressure injuries.",
      "Controlled-policy focus — CL-SD-011, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Reverse-staging pressure injuries ; OASIS accuracy deficiency; survey citation; payment error ; Train all clinicians that pressure injuries never reverse-stage; include in annual wound care competency ; ; Wound measurements inconsistent across visits (different clinicians measuring differently) ; Quality data unreliable; OASIS accuracy issues ; Standardize measurement technique (head-to-toe for length, side-to-side for width, perpendicular to surface for depth); train all clinicians ; ; OASIS wound items coded without supporting narrative documentation ; OASIS validation deficiency; documentation integrity failure ; Monthly audit cross-referencing OASIS wound items with narrative assessments ; ; Wound not progressing but treatment plan unchanged ; Patient harm; survey citation for inadequate care.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Controlled-policy focus — CL-SD-011, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Initial wound assessment ; Wound Assessment Documentation Template (Appendix A) for each wound ; Assigned RN ; EHR — visit note and wound assessment module ; At SOC; within 24 hours ; ; Ongoing wound assessment and treatment ; Visit note documenting assessment findings, treatment, and patient response ; Assigned RN / LVN ; EHR — visit note ; At each wound care visit; within 24 hours ; ; Wound measurements ; L x W x D documented in centimeters with comparison to baseline ; Assigned RN ; EHR — wound assessment module ; Every 2 weeks and.",
      "Controlled-policy focus — CL-SD-011, 2\\. Purpose. This policy defines the assessment, classification, treatment, documentation, and outcome monitoring standards for wound care services at Care Indeed Home Health Care, Inc. Wound care is among the most frequently provided skilled nursing services in home health, encompassing a wide range of wound types including pressure injuries (pressure ulcers), surgical wounds, diabetic foot ulcers, venous stasis ulcers, arterial ulcers, traumatic wounds, skin tears, and ostomy site management. Wound care documentation is heavily scrutinized during CMS surveys, ADR audits, and OASIS validation reviews because wound status directly affects OASIS scoring (particularly M1311–M1350), PDGM clinical grouping and payment, and quality measure reporting. Inaccurate wound assessment, inconsistent wound staging, or incomplete documentation can result in: PDGM payment errors, OASIS accuracy deficiencies.",
      "Apply the controlled requirements to the three visible objects in the scene for consistent measurements, tracts, pain, and photographs. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Paper Ruler Markings Turned Away", detail: "Review the paper ruler markings turned away for the patient-specific finding. Reconcile it with the sterile cotton swab, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Sterile Cotton Swab", detail: "Review the sterile cotton swab for the patient-specific finding. Reconcile it with the saline bottle, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Saline Bottle", detail: "Review the saline bottle for the patient-specific finding. Reconcile it with the paper ruler markings turned away, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "paper-ruler-markings-turned-away-3-1", label: "paper ruler markings turned away", shortLabel: "paper ruler markings turned", ariaLabel: "Investigate paper ruler markings turned away",        x: 14, y: 50, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the paper ruler markings turned away as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the sterile cotton swab, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper ruler markings turned away, compare the visible evidence with sterile cotton swab and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the paper ruler markings turned away as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the sterile cotton swab, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper ruler markings turned away, compare the visible evidence with sterile cotton swab and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the paper ruler markings turned away and omit the related change, symptom, or safety cue. This identify option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for consistent measurements, tracts, pain, and photographs." },
          { id: "i3", label: "Let a blank, unreadable, or unverified paper ruler markings turned away stand in for direct RN assessment. This identify option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about paper ruler markings turned away." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper ruler markings turned away; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper ruler markings turned away; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the paper ruler markings turned away issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for paper ruler markings turned away is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for consistent measurements, tracts, pain, and photographs instead of the current controlled clinical pathway. This decide option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during consistent measurements, tracts, pain, and photographs." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For paper ruler markings turned away, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For paper ruler markings turned away, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the paper ruler markings turned away and omit the discrepancy with sterile cotton swab. This document option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of paper ruler markings turned away." },
          { id: "doc3", label: "Combine the paper ruler markings turned away issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns paper ruler markings turned away during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent measurements, tracts, pain, and photographs." },
        ],
        feedback: {
          observed: "Observe the paper ruler markings turned away as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the sterile cotton swab, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the paper ruler markings turned away as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the sterile cotton swab, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper ruler markings turned away, compare the visible evidence with sterile cotton swab and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper ruler markings turned away; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For paper ruler markings turned away, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "sterile-cotton-swab-3-2", label: "sterile cotton swab", shortLabel: "sterile cotton swab", ariaLabel: "Investigate sterile cotton swab",        x: 39, y: 42, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the sterile cotton swab as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile cotton swab, compare the visible evidence with saline bottle and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the sterile cotton swab as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile cotton swab, compare the visible evidence with saline bottle and the controlling source before classifying status." },
          { id: "i2", label: "Treat the sterile cotton swab as the complete assessment and do not compare the saline bottle, patient report, or current record. This identify option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for consistent measurements, tracts, pain, and photographs." },
          { id: "i3", label: "Carry forward the prior visit conclusion for consistent measurements, tracts, pain, and photographs without reassessing the patient today. This identify option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about sterile cotton swab." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile cotton swab; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile cotton swab; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the sterile cotton swab alone and seek clarification only after the intervention is complete. This decide option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for sterile cotton swab is resolved." },
          { id: "d3", label: "Defer the concern in the sterile cotton swab to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during consistent measurements, tracts, pain, and photographs." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For sterile cotton swab, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For sterile cotton swab, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the sterile cotton swab was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of sterile cotton swab." },
          { id: "doc3", label: "Keep the sterile cotton swab decision in personal notes rather than the governed patient record. This document option concerns sterile cotton swab during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent measurements, tracts, pain, and photographs." },
        ],
        feedback: {
          observed: "Observe the sterile cotton swab as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the sterile cotton swab as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For sterile cotton swab, compare the visible evidence with saline bottle and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to sterile cotton swab; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For sterile cotton swab, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "saline-bottle-3-3", label: "saline bottle", shortLabel: "saline bottle", ariaLabel: "Investigate saline bottle",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the saline bottle as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the paper ruler markings turned away, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with paper ruler markings turned away and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the saline bottle as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the paper ruler markings turned away, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with paper ruler markings turned away and the controlling source before classifying status." },
          { id: "i2", label: "Assume the saline bottle establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for consistent measurements, tracts, pain, and photographs." },
          { id: "i3", label: "Dismiss the conflict between the saline bottle and paper ruler markings turned away because one source appears more convenient. This identify option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about saline bottle." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the saline bottle without confirming an applicable order and patient-specific authority. This decide option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for saline bottle is resolved." },
          { id: "d3", label: "Hand the saline bottle concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during consistent measurements, tracts, pain, and photographs." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For saline bottle, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For saline bottle, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the saline bottle before reassessment confirms the patient response. This document option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of saline bottle." },
          { id: "doc3", label: "Copy the prior consistent measurements, tracts, pain, and photographs narrative even though today’s saline bottle evidence is different. This document option concerns saline bottle during consistent measurements, tracts, pain, and photographs.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for consistent measurements, tracts, pain, and photographs." },
        ],
        feedback: {
          observed: "Observe the saline bottle as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the paper ruler markings turned away, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the saline bottle as patient-specific evidence for consistent measurements, tracts, pain, and photographs. Compare it with the paper ruler markings turned away, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for consistent measurements, tracts, pain, and photographs, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with paper ruler markings turned away and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for consistent measurements, tracts, pain, and photographs. For saline bottle, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Pressur",
    title: "Pressure-injury classification and skin protection",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for pressure-injury classification and skin protection within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, 5\\. Definitions. Term ; Definition ; ; ; ; ; Pressure Injury ; Localized damage to the skin and/or underlying tissue, usually over a bony prominence or related to a medical device, resulting from sustained pressure or pressure in combination with shear. Staged per NPIAP system (Stage 1, Stage 2, Stage 3, Stage 4, Unstageable, Deep Tissue Pressure Injury). ; ; NPIAP Staging ; The National Pressure Injury Advisory Panel classification system for pressure injuries — the only staging system accepted by CMS for OASIS purposes. ; ; Reverse Staging ; The clinically incorrect practice of assigning a lower stage number to a healing pressure injury. Once a pressure injury is staged at Stage 3 or 4, it retains that.",
      "Controlled-policy focus — CL-SD-011, APPENDICES. Appendix A — Wound Assessment Documentation Template (Fields: Patient Name/MR#, Assessment Date, Wound Location, Wound Etiology, Stage/Classification, Length (cm), Width (cm), Depth (cm), Undermining (location/depth), Tunneling (location/depth), Wound Bed — % Granulation / % Epithelialization / % Slough / % Eschar, Wound Edges, Periwound Skin, Drainage Type and Amount, Odor (Y/N), Signs of Infection (Y/N — specify), Pain (0–10), Current Treatment, Photograph Obtained (Y/N), OASIS Items Supported, Clinician Name/Credential/Date) Appendix B — Policy Acknowledgment Form ; Field ; Response ; ; ; ; ; Full Name (Printed) ; ; ; Title / Role ; ; ; Signature ; ; ; Date Signed ; ; Subdomain: SD — Service Delivery (Continued) Version 6.0 ; Effective Date: 2025-07-10.",
      "Controlled-policy focus — CL-SD-011, 4\\. Policy Statement. 4.1 All wound care services shall be authorized by a physician order specifying: the wound location, wound care procedure, dressing type and frequency, and any wound-related medications (e.g., topical antibiotics, enzymatic debriding agents). 4.2 At SOC and at each OASIS assessment time point, all wounds shall be assessed, classified, staged (for pressure injuries), measured, and documented using the standardized Wound Assessment Documentation Template (Appendix A) that includes all elements necessary for accurate OASIS item completion (M1311 through M1350). 4.3 Wound assessment shall include at minimum: (a) wound location (anatomical site); (b) wound etiology (pressure injury, surgical, diabetic, venous, arterial, traumatic, other); (c) wound stage/classification — using the National Pressure Injury Advisory Panel (NPIAP) staging system for pressure injuries.",
      "Controlled-policy focus — CL-SD-011, What Surveyors and Auditors Will Look For. CMS surveyors will select patients with active wounds and compare: (a) the wound assessment documentation with the OASIS wound item coding — inconsistencies are cited; (b) wound care orders with treatment provided — any deviation from the ordered treatment is a deficiency; (c) wound measurement trends to evaluate whether the wound is progressing and whether the treatment plan is responsive; (d) wound staging accuracy — reverse-staging is always cited. OASIS validation auditors will specifically target wound items because wound status directly impacts PDGM payment classification..",
      "Controlled-policy focus — CL-CP-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Plan of care developed by non-RN staff or templated without individualization ; CMS deficiency under 42 CFR § 484.60; potential False Claims Act risk ; Require RN development of all SOC plans of care; Director of Nursing conducts quality review of new SOC plans ; ; Goals stated in non-measurable terms (\"patient will improve ADLs\") ; Survey citation for inadequate plan of care; inability to demonstrate outcome achievement ; Train all RNs on SMART goal-writing; use goal templates with required metrics ; ; Services delivered that are not on the plan of care ; Billing compliance risk; potential False Claims Act; survey deficiency ; Implement visit.",
      "Apply the controlled requirements to the three visible objects in the scene for pressure-injury classification and skin protection. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Dressing", detail: "Review the dressing for the patient-specific finding. Reconcile it with the saline bottle, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Saline Bottle", detail: "Review the saline bottle for the patient-specific finding. Reconcile it with the offloading heel boot, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Offloading Heel Boot", detail: "Review the offloading heel boot for the patient-specific finding. Reconcile it with the dressing, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "dressing-4-1", label: "dressing", shortLabel: "dressing", ariaLabel: "Investigate dressing",        x: 18, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the dressing as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing, compare the visible evidence with saline bottle and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the dressing as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing, compare the visible evidence with saline bottle and the controlling source before classifying status." },
          { id: "i2", label: "Treat the dressing as the complete assessment and do not compare the saline bottle, patient report, or current record. This identify option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for pressure-injury classification and skin protection." },
          { id: "i3", label: "Carry forward the prior visit conclusion for pressure-injury classification and skin protection without reassessing the patient today. This identify option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about dressing." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the dressing alone and seek clarification only after the intervention is complete. This decide option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for dressing is resolved." },
          { id: "d3", label: "Defer the concern in the dressing to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during pressure-injury classification and skin protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For dressing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For dressing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the dressing was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of dressing." },
          { id: "doc3", label: "Keep the dressing decision in personal notes rather than the governed patient record. This document option concerns dressing during pressure-injury classification and skin protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pressure-injury classification and skin protection." },
        ],
        feedback: {
          observed: "Observe the dressing as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the dressing as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the saline bottle, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing, compare the visible evidence with saline bottle and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For dressing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "saline-bottle-4-2", label: "saline bottle", shortLabel: "saline bottle", ariaLabel: "Investigate saline bottle",        x: 51, y: 76, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the saline bottle as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the offloading heel boot, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with offloading heel boot and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the saline bottle as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the offloading heel boot, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with offloading heel boot and the controlling source before classifying status." },
          { id: "i2", label: "Assume the saline bottle establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for pressure-injury classification and skin protection." },
          { id: "i3", label: "Dismiss the conflict between the saline bottle and offloading heel boot because one source appears more convenient. This identify option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about saline bottle." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the saline bottle without confirming an applicable order and patient-specific authority. This decide option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for saline bottle is resolved." },
          { id: "d3", label: "Hand the saline bottle concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during pressure-injury classification and skin protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For saline bottle, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For saline bottle, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the saline bottle before reassessment confirms the patient response. This document option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of saline bottle." },
          { id: "doc3", label: "Copy the prior pressure-injury classification and skin protection narrative even though today’s saline bottle evidence is different. This document option concerns saline bottle during pressure-injury classification and skin protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pressure-injury classification and skin protection." },
        ],
        feedback: {
          observed: "Observe the saline bottle as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the offloading heel boot, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the saline bottle as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the offloading heel boot, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For saline bottle, compare the visible evidence with offloading heel boot and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to saline bottle; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For saline bottle, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "offloading-heel-boot-4-3", label: "offloading heel boot", shortLabel: "offloading heel boot", ariaLabel: "Investigate offloading heel boot",        x: 85, y: 50, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the offloading heel boot as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the dressing, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading heel boot, compare the visible evidence with dressing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the offloading heel boot as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading heel boot, compare the visible evidence with dressing and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the offloading heel boot and omit the related change, symptom, or safety cue. This identify option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for pressure-injury classification and skin protection." },
          { id: "i3", label: "Let a blank, unreadable, or unverified offloading heel boot stand in for direct RN assessment. This identify option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about offloading heel boot." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading heel boot; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading heel boot; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the offloading heel boot issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for offloading heel boot is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for pressure-injury classification and skin protection instead of the current controlled clinical pathway. This decide option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during pressure-injury classification and skin protection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For offloading heel boot, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For offloading heel boot, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the offloading heel boot and omit the discrepancy with dressing. This document option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of offloading heel boot." },
          { id: "doc3", label: "Combine the offloading heel boot issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns offloading heel boot during pressure-injury classification and skin protection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for pressure-injury classification and skin protection." },
        ],
        feedback: {
          observed: "Observe the offloading heel boot as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the dressing, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the offloading heel boot as patient-specific evidence for pressure-injury classification and skin protection. Compare it with the dressing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for pressure-injury classification and skin protection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading heel boot, compare the visible evidence with dressing and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading heel boot; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for pressure-injury classification and skin protection. For offloading heel boot, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Order-s",
    title: "Order-specific care, supplies, and infection prevention",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for order-specific care, supplies, and infection prevention within Wound Care & Skin Integrity. Use the current controlled requirements in CL-CP-001, CL-SD-011, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Multidisciplinary Coordination in Plan of Care Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Ensure that all disciplines providing services to the patient have reviewed the plan of care and that their discipline-specific goals, interventions, and visit frequencies are accurately reflected. No discipline shall provide services that conflict with or exceed what is authorized in the plan of care without a new physician order. ; Within 48 hours of the SOC visit. ; ; 6.4.2 ; Each Clinical Discipline Provider ; Upon receiving a referral for a new patient, review the plan of care within 24 hours of assignment. Confirm that the ordered services are within the discipline's scope of practice.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-SD-011, Patient and Caregiver Education. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; Provide wound care education to the patient and caregiver including: signs and symptoms of infection to report; proper dressing change technique (if the caregiver will perform between visits); pressure redistribution techniques for pressure injury patients; nutrition optimization for wound healing; and when to contact the agency or call 911. ; Beginning at the SOC visit; reinforced at each wound care visit. ; ; 6.4.2 ; Assigned RN ; Document all wound care education provided, the teaching method, and the patient's/caregiver's understanding per CL-SD-017. ; At each visit where education is provided..",
      "Controlled-policy focus — CL-CP-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Primary regulatory basis for plan of care requirements ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Defines required elements of the plan of care ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the physician-approved plan of care ; ; 42 CFR § 424.22 ; Requirements for home health services — plan of care and certifying physician ; Defines physician certification requirements for Medicare billing ; ; 42 CFR § 409.42 ; Skilled nursing.",
      "Apply the controlled requirements to the three visible objects in the scene for order-specific care, supplies, and infection prevention. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Photo Tablet Screen", detail: "Review the photo tablet screen for the patient-specific finding. Reconcile it with the measuring guide turned away, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Measuring Guide Turned Away", detail: "Review the measuring guide turned away for the patient-specific finding. Reconcile it with the offloading cushion, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Offloading Cushion", detail: "Review the offloading cushion for the patient-specific finding. Reconcile it with the photo tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "photo-tablet-screen-5-1", label: "photo tablet screen", shortLabel: "photo tablet screen", ariaLabel: "Investigate photo tablet screen",        x: 25, y: 73, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the photo tablet screen as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the measuring guide turned away, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For photo tablet screen, compare the visible evidence with measuring guide turned away and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the photo tablet screen as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the measuring guide turned away, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For photo tablet screen, compare the visible evidence with measuring guide turned away and the controlling source before classifying status." },
          { id: "i2", label: "Assume the photo tablet screen establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for order-specific care, supplies, and infection prevention." },
          { id: "i3", label: "Dismiss the conflict between the photo tablet screen and measuring guide turned away because one source appears more convenient. This identify option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about photo tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to photo tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to photo tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the photo tablet screen without confirming an applicable order and patient-specific authority. This decide option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for photo tablet screen is resolved." },
          { id: "d3", label: "Hand the photo tablet screen concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during order-specific care, supplies, and infection prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For photo tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For photo tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the photo tablet screen before reassessment confirms the patient response. This document option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of photo tablet screen." },
          { id: "doc3", label: "Copy the prior order-specific care, supplies, and infection prevention narrative even though today’s photo tablet screen evidence is different. This document option concerns photo tablet screen during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order-specific care, supplies, and infection prevention." },
        ],
        feedback: {
          observed: "Observe the photo tablet screen as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the measuring guide turned away, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the photo tablet screen as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the measuring guide turned away, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For photo tablet screen, compare the visible evidence with measuring guide turned away and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to photo tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For photo tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "measuring-guide-turned-away-5-2", label: "measuring guide turned away", shortLabel: "measuring guide turned away", ariaLabel: "Investigate measuring guide turned away",        x: 37, y: 47, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the measuring guide turned away as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring guide turned away, compare the visible evidence with offloading cushion and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the measuring guide turned away as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring guide turned away, compare the visible evidence with offloading cushion and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the measuring guide turned away and omit the related change, symptom, or safety cue. This identify option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for order-specific care, supplies, and infection prevention." },
          { id: "i3", label: "Let a blank, unreadable, or unverified measuring guide turned away stand in for direct RN assessment. This identify option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about measuring guide turned away." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring guide turned away; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring guide turned away; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the measuring guide turned away issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for measuring guide turned away is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for order-specific care, supplies, and infection prevention instead of the current controlled clinical pathway. This decide option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during order-specific care, supplies, and infection prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For measuring guide turned away, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For measuring guide turned away, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the measuring guide turned away and omit the discrepancy with offloading cushion. This document option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of measuring guide turned away." },
          { id: "doc3", label: "Combine the measuring guide turned away issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns measuring guide turned away during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order-specific care, supplies, and infection prevention." },
        ],
        feedback: {
          observed: "Observe the measuring guide turned away as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the measuring guide turned away as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring guide turned away, compare the visible evidence with offloading cushion and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring guide turned away; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For measuring guide turned away, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "offloading-cushion-5-3", label: "offloading cushion", shortLabel: "offloading cushion", ariaLabel: "Investigate offloading cushion",        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the offloading cushion as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the photo tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with photo tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the offloading cushion as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the photo tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with photo tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat the offloading cushion as the complete assessment and do not compare the photo tablet screen, patient report, or current record. This identify option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for order-specific care, supplies, and infection prevention." },
          { id: "i3", label: "Carry forward the prior visit conclusion for order-specific care, supplies, and infection prevention without reassessing the patient today. This identify option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about offloading cushion." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the offloading cushion alone and seek clarification only after the intervention is complete. This decide option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for offloading cushion is resolved." },
          { id: "d3", label: "Defer the concern in the offloading cushion to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during order-specific care, supplies, and infection prevention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For offloading cushion, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For offloading cushion, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the offloading cushion was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of offloading cushion." },
          { id: "doc3", label: "Keep the offloading cushion decision in personal notes rather than the governed patient record. This document option concerns offloading cushion during order-specific care, supplies, and infection prevention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order-specific care, supplies, and infection prevention." },
        ],
        feedback: {
          observed: "Observe the offloading cushion as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the photo tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the offloading cushion as patient-specific evidence for order-specific care, supplies, and infection prevention. Compare it with the photo tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for order-specific care, supplies, and infection prevention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with photo tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for order-specific care, supplies, and infection prevention. For offloading cushion, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Deterio",
    title: "Deterioration, infection, and order escalation",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for deterioration, infection, and order escalation within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Wound shows signs of clinical infection (spreading erythema, purulent drainage, fever, elevated WBC) ; RN notifies physician immediately ; Obtain physician orders for wound culture (if not already ordered), systemic antibiotics, and modified wound care. Increase visit frequency if ordered. ; Physician notification same day; modified treatment per physician orders. ; ; New pressure injury develops during the episode ; Assigned RN and Director of Nursing ; Conduct a root cause analysis: assess pressure redistribution, turning schedule, nutrition, and caregiver compliance. Report as an adverse event per QA-AE-001. Update the plan of care. ; Root cause analysis within 48 hours; adverse event.",
      "Controlled-policy focus — CL-CP-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Plan of care is incomplete or missing required elements at the time of the first billable visit ; Assigned RN escalates to Director of Nursing ; Director of Nursing reviews and requires completion before any claim is submitted. Services may continue if the verbal order is properly documented per CL-CP-004. ; Completion required before claim submission. ; ; Physician refuses to sign the plan of care as written ; Assigned RN and Director of Nursing contact the physician ; Director of Nursing engages the physician to resolve clinical disagreements. Modify the plan of care per the physician's direction if clinically appropriate. If.",
      "Controlled-policy focus — CL-CP-001, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall establish a written, individualized plan of care for every patient admitted to home health services prior to or at the initiation of services, as required by 42 CFR § 484.60(a). 4.2 The plan of care shall be developed by the registered nurse responsible for the patient's care in collaboration with the patient, the patient's caregiver(s), the patient's attending physician or allowed practitioner, and all clinical disciplines involved in the patient's care. 4.3 No skilled home health services shall be provided to a patient without a physician-approved plan of care. Verbal orders for services may be initiated prior to written physician signature, provided the verbal order is received, documented, and authenticated.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Completed plan of care ; Patient-specific plan of care including all required elements per Section 6.2 ; Assigned RN ; EHR — patient clinical record ; Developed within 24 hours of SOC visit; retained for minimum 7 years per CO-HP-007 ; ; Physician-signed plan of care ; Signed and dated CMS-485 or EHR equivalent ; Certifying physician / Medical Records ; EHR — patient clinical record ; Received and filed before claim submission; retained minimum 7 years ; ; Plan of care transmission record ; Documentation of date, method, and recipient of transmission to physician ; Clinical Coordinator.",
      "Apply the controlled requirements to the three visible objects in the scene for deterioration, infection, and order escalation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Silicone Wound Training Model", detail: "Review the silicone wound training model for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the wound folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Wound Folder", detail: "Review the wound folder for the patient-specific finding. Reconcile it with the silicone wound training model, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "silicone-wound-training-model-6-1", label: "silicone wound training model", shortLabel: "silicone wound training model", ariaLabel: "Investigate silicone wound training model",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the silicone wound training model as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone wound training model, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the silicone wound training model as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone wound training model, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the silicone wound training model and omit the related change, symptom, or safety cue. This identify option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for deterioration, infection, and order escalation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified silicone wound training model stand in for direct RN assessment. This identify option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about silicone wound training model." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone wound training model; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone wound training model; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the silicone wound training model issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for silicone wound training model is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for deterioration, infection, and order escalation instead of the current controlled clinical pathway. This decide option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during deterioration, infection, and order escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For silicone wound training model, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For silicone wound training model, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the silicone wound training model and omit the discrepancy with phone. This document option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of silicone wound training model." },
          { id: "doc3", label: "Combine the silicone wound training model issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns silicone wound training model during deterioration, infection, and order escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deterioration, infection, and order escalation." },
        ],
        feedback: {
          observed: "Observe the silicone wound training model as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the silicone wound training model as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone wound training model, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone wound training model; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For silicone wound training model, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "phone-6-2", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 31, y: 57, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the phone as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the wound folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with wound folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the wound folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with wound folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the phone as the complete assessment and do not compare the wound folder, patient report, or current record. This identify option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for deterioration, infection, and order escalation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for deterioration, infection, and order escalation without reassessing the patient today. This identify option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the phone alone and seek clarification only after the intervention is complete. This decide option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during deterioration, infection, and order escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the phone was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Keep the phone decision in personal notes rather than the governed patient record. This document option concerns phone during deterioration, infection, and order escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deterioration, infection, and order escalation." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the wound folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the wound folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with wound folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "wound-folder-6-3", label: "wound folder", shortLabel: "wound folder", ariaLabel: "Investigate wound folder",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the wound folder as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the silicone wound training model, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound folder, compare the visible evidence with silicone wound training model and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the wound folder as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the silicone wound training model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound folder, compare the visible evidence with silicone wound training model and the controlling source before classifying status." },
          { id: "i2", label: "Assume the wound folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for deterioration, infection, and order escalation." },
          { id: "i3", label: "Dismiss the conflict between the wound folder and silicone wound training model because one source appears more convenient. This identify option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about wound folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the wound folder without confirming an applicable order and patient-specific authority. This decide option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for wound folder is resolved." },
          { id: "d3", label: "Hand the wound folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during deterioration, infection, and order escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For wound folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For wound folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the wound folder before reassessment confirms the patient response. This document option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of wound folder." },
          { id: "doc3", label: "Copy the prior deterioration, infection, and order escalation narrative even though today’s wound folder evidence is different. This document option concerns wound folder during deterioration, infection, and order escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deterioration, infection, and order escalation." },
        ],
        feedback: {
          observed: "Observe the wound folder as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the silicone wound training model, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the wound folder as patient-specific evidence for deterioration, infection, and order escalation. Compare it with the silicone wound training model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for deterioration, infection, and order escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound folder, compare the visible evidence with silicone wound training model and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for deterioration, infection, and order escalation. For wound folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Healing",
    title: "Healing trajectory and complete wound documentation",
    subtitle: "Wound Care & Skin Integrity",
    narration: [
      "This lesson develops registered-nurse reasoning for healing trajectory and complete wound documentation within Wound Care & Skin Integrity. Use the current controlled requirements in CL-SD-011, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-011, Initial Wound Assessment at SOC. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At the SOC visit, perform a complete skin assessment to identify all wounds — do not rely solely on the referral documentation for wound identification. Undress all dressings. Assess each wound using all elements in Section 4.3. ; At the SOC visit. ; ; 6.1.2 ; Assigned RN ; Classify and stage each wound. For pressure injuries, use the NPIAP staging system exclusively. Do not reverse-stage healing pressure injuries. For non-pressure wounds, classify by etiology (surgical, diabetic, venous, arterial, traumatic). ; At the SOC visit. ; ; 6.1.3 ; Assigned RN ; Measure each wound (L x W.",
      "Controlled-policy focus — CL-SD-011, Ongoing Wound Assessment and Treatment. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; At each wound care visit, assess the wound using all elements in Section 4.3. Compare findings to the previous visit assessment. Document all findings. ; At each wound care visit. ; ; 6.2.2 ; Assigned RN / LVN ; Perform wound care treatment per the physician order. Document the treatment performed including: wound cleansing method, debridement (if any), dressing applied, and the patient's tolerance. ; At each wound care visit. ; ; 6.2.3 ; Assigned RN ; Perform formal wound measurements (L x W x D) at minimum every 2 weeks and at each OASIS assessment.",
      "Controlled-policy focus — CL-SD-011, OASIS Wound Item Coding Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; When completing OASIS wound items (M1311–M1350), ensure that every response is supported by the narrative wound assessment documentation in the clinical record per CL-OA-007. ; At each OASIS time point. ; ; 6.3.2 ; Assigned RN ; Follow the CMS OASIS Guidance Manual for all wound item coding, including the specific look-back periods and response definitions per CL-OA-010. ; At each OASIS time point. ; ; 6.3.3 ; Director of Nursing ; Include wound documentation accuracy as a component of the monthly documentation audit. Cross-reference OASIS wound item responses against wound assessment narratives for a random sample of.",
      "Controlled-policy focus — CL-SD-011, 4\\. Policy Statement. 4.1 All wound care services shall be authorized by a physician order specifying: the wound location, wound care procedure, dressing type and frequency, and any wound-related medications (e.g., topical antibiotics, enzymatic debriding agents). 4.2 At SOC and at each OASIS assessment time point, all wounds shall be assessed, classified, staged (for pressure injuries), measured, and documented using the standardized Wound Assessment Documentation Template (Appendix A) that includes all elements necessary for accurate OASIS item completion (M1311 through M1350). 4.3 Wound assessment shall include at minimum: (a) wound location (anatomical site); (b) wound etiology (pressure injury, surgical, diabetic, venous, arterial, traumatic, other); (c) wound stage/classification — using the National Pressure Injury Advisory Panel (NPIAP) staging system for pressure injuries.",
      "Controlled-policy focus — CL-SD-011, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Initial wound assessment ; Wound Assessment Documentation Template (Appendix A) for each wound ; Assigned RN ; EHR — visit note and wound assessment module ; At SOC; within 24 hours ; ; Ongoing wound assessment and treatment ; Visit note documenting assessment findings, treatment, and patient response ; Assigned RN / LVN ; EHR — visit note ; At each wound care visit; within 24 hours ; ; Wound measurements ; L x W x D documented in centimeters with comparison to baseline ; Assigned RN ; EHR — wound assessment module ; Every 2 weeks and.",
      "Apply the controlled requirements to the three visible objects in the scene for healing trajectory and complete wound documentation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the silicone skin model, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Silicone Skin Model", detail: "Review the silicone skin model for the patient-specific finding. Reconcile it with the offloading cushion, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Offloading Cushion", detail: "Review the offloading cushion for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-011" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "External Authority", text: "42 CFR §484.80" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "tablet-screen-7-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 69, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the tablet screen as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the silicone skin model, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with silicone skin model and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the silicone skin model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with silicone skin model and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the silicone skin model, patient report, or current record. This identify option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for healing trajectory and complete wound documentation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for healing trajectory and complete wound documentation without reassessing the patient today. This identify option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during healing trajectory and complete wound documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during healing trajectory and complete wound documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for healing trajectory and complete wound documentation." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the silicone skin model, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the silicone skin model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with silicone skin model and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "silicone-skin-model-7-2", label: "silicone skin model", shortLabel: "silicone skin model", ariaLabel: "Investigate silicone skin model",        x: 58, y: 72, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the silicone skin model as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone skin model, compare the visible evidence with offloading cushion and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the silicone skin model as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone skin model, compare the visible evidence with offloading cushion and the controlling source before classifying status." },
          { id: "i2", label: "Assume the silicone skin model establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for healing trajectory and complete wound documentation." },
          { id: "i3", label: "Dismiss the conflict between the silicone skin model and offloading cushion because one source appears more convenient. This identify option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about silicone skin model." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone skin model; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone skin model; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the silicone skin model without confirming an applicable order and patient-specific authority. This decide option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for silicone skin model is resolved." },
          { id: "d3", label: "Hand the silicone skin model concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during healing trajectory and complete wound documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For silicone skin model, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For silicone skin model, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the silicone skin model before reassessment confirms the patient response. This document option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of silicone skin model." },
          { id: "doc3", label: "Copy the prior healing trajectory and complete wound documentation narrative even though today’s silicone skin model evidence is different. This document option concerns silicone skin model during healing trajectory and complete wound documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for healing trajectory and complete wound documentation." },
        ],
        feedback: {
          observed: "Observe the silicone skin model as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the silicone skin model as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the offloading cushion, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For silicone skin model, compare the visible evidence with offloading cushion and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to silicone skin model; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For silicone skin model, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
      {
        id: "offloading-cushion-7-3", label: "offloading cushion", shortLabel: "offloading cushion", ariaLabel: "Investigate offloading cushion",        x: 75, y: 41, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the offloading cushion as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the offloading cushion as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the offloading cushion and omit the related change, symptom, or safety cue. This identify option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for healing trajectory and complete wound documentation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified offloading cushion stand in for direct RN assessment. This identify option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about offloading cushion." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the offloading cushion issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for offloading cushion is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for healing trajectory and complete wound documentation instead of the current controlled clinical pathway. This decide option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during healing trajectory and complete wound documentation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For offloading cushion, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For offloading cushion, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the offloading cushion and omit the discrepancy with tablet screen. This document option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of offloading cushion." },
          { id: "doc3", label: "Combine the offloading cushion issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns offloading cushion during healing trajectory and complete wound documentation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for healing trajectory and complete wound documentation." },
        ],
        feedback: {
          observed: "Observe the offloading cushion as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the offloading cushion as patient-specific evidence for healing trajectory and complete wound documentation. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for healing trajectory and complete wound documentation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For offloading cushion, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to offloading cushion; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for healing trajectory and complete wound documentation. For offloading cushion, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-011","CL-CP-001","42 CFR § 484.60","42 CFR § 484.75","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During head-to-toe skin integrity and wound etiology, the skin-safe measuring ruler without markings visible conflicts with the soft positioning wedge and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the skin-safe measuring ruler without markings visible alone and seek clarification only after the intervention is complete. This option concerns head-to-toe skin integrity and wound etiology.",
      "Defer the concern in the skin-safe measuring ruler without markings visible to the next routine visit even though its current clinical significance has not been assessed. This option concerns head-to-toe skin integrity and wound etiology.",
      "Assume the soft positioning wedge is unchanged from the prior encounter and omit patient-specific reassessment during head-to-toe skin integrity and wound etiology.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for head-to-toe skin integrity and wound etiology within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 2,
    stem: "During t.i.m.e. wound-bed assessment, the clean measuring guide conflicts with the modest skin simulation pad and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the clean measuring guide concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns t.i.m.e. wound-bed assessment.",
      "Assume the modest skin simulation pad is unchanged from the prior encounter and omit patient-specific reassessment during t.i.m.e. wound-bed assessment.",
      "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the clean measuring guide without confirming an applicable order and patient-specific authority. This option concerns t.i.m.e. wound-bed assessment.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for t.i.m.e. wound-bed assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 3,
    stem: "During consistent measurements, tracts, pain, and photographs, the saline bottle conflicts with the paper ruler markings turned away and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for consistent measurements, tracts, pain, and photographs instead of the current controlled clinical pathway. This option concerns consistent measurements, tracts, pain, and photographs.",
      "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the paper ruler markings turned away is unchanged from the prior encounter and omit patient-specific reassessment during consistent measurements, tracts, pain, and photographs.",
      "Close the saline bottle issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns consistent measurements, tracts, pain, and photographs.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for consistent measurements, tracts, pain, and photographs within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 4,
    stem: "During pressure-injury classification and skin protection, the offloading heel boot conflicts with the dressing and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the offloading heel boot alone and seek clarification only after the intervention is complete. This option concerns pressure-injury classification and skin protection.",
      "Assume the dressing is unchanged from the prior encounter and omit patient-specific reassessment during pressure-injury classification and skin protection.",
      "Defer the concern in the offloading heel boot to the next routine visit even though its current clinical significance has not been assessed. This option concerns pressure-injury classification and skin protection.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for pressure-injury classification and skin protection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 5,
    stem: "During order-specific care, supplies, and infection prevention, the offloading cushion conflicts with the photo tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the offloading cushion without confirming an applicable order and patient-specific authority. This option concerns order-specific care, supplies, and infection prevention.",
      "Hand the offloading cushion concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns order-specific care, supplies, and infection prevention.",
      "Assume the photo tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during order-specific care, supplies, and infection prevention.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for order-specific care, supplies, and infection prevention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 6,
    stem: "During deterioration, infection, and order escalation, the wound folder conflicts with the silicone wound training model and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the silicone wound training model is unchanged from the prior encounter and omit patient-specific reassessment during deterioration, infection, and order escalation.",
      "Use a familiar local shortcut for deterioration, infection, and order escalation instead of the current controlled clinical pathway. This option concerns deterioration, infection, and order escalation.",
      "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the wound folder issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns deterioration, infection, and order escalation.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for deterioration, infection, and order escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 7,
    stem: "During healing trajectory and complete wound documentation, the offloading cushion conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during healing trajectory and complete wound documentation.",
      "Proceed using the offloading cushion alone and seek clarification only after the intervention is complete. This option concerns healing trajectory and complete wound documentation.",
      "Defer the concern in the offloading cushion to the next routine visit even though its current clinical significance has not been assessed. This option concerns healing trajectory and complete wound documentation.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for healing trajectory and complete wound documentation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-011, CL-CP-001.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Wound Care & Skin Integrity?",
    options: [
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
    ],
    correct: 1,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the modest skin simulation pad and wound folder into defensible RN practice for Wound Care & Skin Integrity?",
    options: [
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A familiar device display accepted without technique or context validation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Wound Care & Skin Integrity establish?",
    options: [
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Automatic authority to perform every activity discussed in Wound Care & Skin Integrity without supervision.",
      "Knowledge of the controlled RN concepts in Wound Care & Skin Integrity, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
    ],
    correct: 2,
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


const STORAGE_KEY = 'rn-007-progress-v6000';

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

export default function RN007() {
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
          <span className="brand-text">RN-007 — Wound Care</span>
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
