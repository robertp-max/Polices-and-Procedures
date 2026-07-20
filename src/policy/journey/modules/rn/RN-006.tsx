/**
 * RN-006 — Medication Management & Reconciliation
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
import img01 from './assets/rn-006/rn-006-lesson-01.png';
import img02 from './assets/rn-006/rn-006-lesson-02.png';
import img03 from './assets/rn-006/rn-006-lesson-03.png';
import img04 from './assets/rn-006/rn-006-lesson-04.png';
import img05 from './assets/rn-006/rn-006-lesson-05.png';
import img06 from './assets/rn-006/rn-006-lesson-06.png';
import img07 from './assets/rn-006/rn-006-lesson-07.png';

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

const MODULE_META = { id: "RN-006", title: "Medication Management & Reconciliation", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for RN medication responsibility and source hierarchy, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Best possible medication list in the home, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Seven Rights and high-alert safeguards, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Classify discrepancies and assess patient exposure, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Hard stop, prescriber/pharmacy/DON escalation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Update orders, profile, MAR, supply, and education, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Complete reconciliation documentation and practice, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 RN",
    title: "RN medication responsibility and source hierarchy",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for rn medication responsibility and source hierarchy within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-013, CL-SD-012, CL-OA-014, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-013, Medication Reconciliation at Start of Care (SOC). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before the SOC visit, obtain and review the referring physician's medication list and, if the patient is transitioning from an inpatient stay, the facility's discharge medication list. Contact the patient's pharmacy to obtain the current medication profile if available. ; Before the SOC visit. ; ; 6.1.2 ; Assigned RN ; At the SOC visit, conduct a thorough medication inventory by: (a) asking the patient/caregiver to gather all medications (prescription bottles, OTC products, vitamins, supplements, herbal products, inhalers, patches, eye drops, creams, injections); (b) visually inspecting all medication bottles and packages for drug name, dose, prescriber, fill date.",
      "Controlled-policy focus — CL-SD-012, Medication Review at Each Skilled Nursing Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN / LVN ; At each skilled nursing visit, conduct a medication review by requesting the patient or caregiver present all medications — including prescription bottles, over-the-counter products, vitamins, supplements, and herbal products. Compare the medications on hand against the agency's current medication list and the physician-ordered medication regimen. ; At each skilled nursing visit. ; ; 6.1.2 ; Assigned RN / LVN ; Assess the patient's actual medication-taking behavior: (a) ask the patient/caregiver which medications they are taking and how they are taking them (dose, frequency, timing); (b) count pill quantities or check fill dates if non-adherence is suspected.",
      "Controlled-policy focus — CL-SD-012, Medication Education. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; At SOC, provide comprehensive medication education to the patient and caregiver covering: the purpose of each medication; the correct dose, frequency, and timing; the correct route and technique (especially for inhalers, injectable medications, eye drops, and topical medications); common side effects and how to manage them; signs of adverse reactions that require physician contact or emergency services; medication interactions to avoid (including food interactions); proper storage; the importance of adherence and the risks of non-adherence; the importance of not sharing medications; and how to dispose of expired or discontinued medications safely. ; At the SOC visit..",
      "Controlled-policy focus — CL-OA-014, Oral and Injectable Medication Management Assessment (M2020, M2030). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assessing RN ; Assess M2020 (Oral Medication Management) based on the patient's actual performance of oral medication management tasks during the look-back period — not on what the patient could theoretically do. Ask: \"Do you take your own medications by yourself, or does someone help you?\" \"Do you set up your own medications, or does someone else prepare them for you?\" Observe the patient attempt to access and take a medication during the visit if clinically feasible. ; During the assessment visit. ; ; 6.3.2 ; Assessing RN ; Apply the CMS OASIS-E2 Guidance Manual response option definitions exactly as written.",
      "Controlled-policy focus — CL-SD-012, Medication Administration During Visits. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Before administering any medication, perform the Seven Rights verification: (a) right patient — verify identity using two identifiers per OP-PA-002; (b) right medication — compare the medication label to the physician order; (c) right dose — verify the dose matches the order; (d) right route — verify the ordered route; (e) right time — verify the administration time is consistent with the order; (f) right documentation — ensure the order is current and documented; (g) right reason — verify the indication is consistent with the patient's diagnosis. ; Before each medication administration. ; ; 6.2.2.",
      "Apply the controlled requirements to the three visible objects in the scene for rn medication responsibility and source hierarchy. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Amber Containers", detail: "Review the amber containers for the patient-specific finding. Reconcile it with the empty weekly organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Empty Weekly Organizer", detail: "Review the empty weekly organizer for the patient-specific finding. Reconcile it with the transition folder, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Transition Folder", detail: "Review the transition folder for the patient-specific finding. Reconcile it with the amber containers, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "amber-containers-1-1", label: "amber containers", shortLabel: "amber containers", ariaLabel: "Investigate amber containers",        x: 24, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the amber containers as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the empty weekly organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber containers, compare the visible evidence with empty weekly organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the amber containers as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the empty weekly organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber containers, compare the visible evidence with empty weekly organizer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the amber containers as the complete assessment and do not compare the empty weekly organizer, patient report, or current record. This identify option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn medication responsibility and source hierarchy." },
          { id: "i3", label: "Carry forward the prior visit conclusion for rn medication responsibility and source hierarchy without reassessing the patient today. This identify option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about amber containers." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber containers; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber containers; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the amber containers alone and seek clarification only after the intervention is complete. This decide option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for amber containers is resolved." },
          { id: "d3", label: "Defer the concern in the amber containers to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn medication responsibility and source hierarchy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For amber containers, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For amber containers, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the amber containers was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of amber containers." },
          { id: "doc3", label: "Keep the amber containers decision in personal notes rather than the governed patient record. This document option concerns amber containers during rn medication responsibility and source hierarchy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn medication responsibility and source hierarchy." },
        ],
        feedback: {
          observed: "Observe the amber containers as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the empty weekly organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the amber containers as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the empty weekly organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber containers, compare the visible evidence with empty weekly organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber containers; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For amber containers, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "empty-weekly-organizer-1-2", label: "empty weekly organizer", shortLabel: "empty weekly organizer", ariaLabel: "Investigate empty weekly organizer",        x: 32, y: 70, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the empty weekly organizer as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty weekly organizer, compare the visible evidence with transition folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the empty weekly organizer as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty weekly organizer, compare the visible evidence with transition folder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the empty weekly organizer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn medication responsibility and source hierarchy." },
          { id: "i3", label: "Dismiss the conflict between the empty weekly organizer and transition folder because one source appears more convenient. This identify option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about empty weekly organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty weekly organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty weekly organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the empty weekly organizer without confirming an applicable order and patient-specific authority. This decide option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for empty weekly organizer is resolved." },
          { id: "d3", label: "Hand the empty weekly organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn medication responsibility and source hierarchy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For empty weekly organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For empty weekly organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the empty weekly organizer before reassessment confirms the patient response. This document option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of empty weekly organizer." },
          { id: "doc3", label: "Copy the prior rn medication responsibility and source hierarchy narrative even though today’s empty weekly organizer evidence is different. This document option concerns empty weekly organizer during rn medication responsibility and source hierarchy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn medication responsibility and source hierarchy." },
        ],
        feedback: {
          observed: "Observe the empty weekly organizer as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the empty weekly organizer as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the transition folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty weekly organizer, compare the visible evidence with transition folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty weekly organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For empty weekly organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "transition-folder-1-3", label: "transition folder", shortLabel: "transition folder", ariaLabel: "Investigate transition folder",        x: 85, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the transition folder as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the amber containers, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with amber containers and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the transition folder as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the amber containers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with amber containers and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the transition folder and omit the related change, symptom, or safety cue. This identify option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn medication responsibility and source hierarchy." },
          { id: "i3", label: "Let a blank, unreadable, or unverified transition folder stand in for direct RN assessment. This identify option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about transition folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the transition folder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for transition folder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for rn medication responsibility and source hierarchy instead of the current controlled clinical pathway. This decide option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn medication responsibility and source hierarchy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For transition folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For transition folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the transition folder and omit the discrepancy with amber containers. This document option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of transition folder." },
          { id: "doc3", label: "Combine the transition folder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns transition folder during rn medication responsibility and source hierarchy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn medication responsibility and source hierarchy." },
        ],
        feedback: {
          observed: "Observe the transition folder as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the amber containers, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the transition folder as patient-specific evidence for rn medication responsibility and source hierarchy. Compare it with the amber containers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn medication responsibility and source hierarchy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For transition folder, compare the visible evidence with amber containers and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to transition folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn medication responsibility and source hierarchy. For transition folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Best",
    title: "Best possible medication list in the home",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for best possible medication list in the home within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-013, CL-SD-012, CL-OA-014, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-013, Medication Reconciliation at Start of Care (SOC). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before the SOC visit, obtain and review the referring physician's medication list and, if the patient is transitioning from an inpatient stay, the facility's discharge medication list. Contact the patient's pharmacy to obtain the current medication profile if available. ; Before the SOC visit. ; ; 6.1.2 ; Assigned RN ; At the SOC visit, conduct a thorough medication inventory by: (a) asking the patient/caregiver to gather all medications (prescription bottles, OTC products, vitamins, supplements, herbal products, inhalers, patches, eye drops, creams, injections); (b) visually inspecting all medication bottles and packages for drug name, dose, prescriber, fill date.",
      "Controlled-policy focus — CL-SD-012, Medication Review at Each Skilled Nursing Visit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN / LVN ; At each skilled nursing visit, conduct a medication review by requesting the patient or caregiver present all medications — including prescription bottles, over-the-counter products, vitamins, supplements, and herbal products. Compare the medications on hand against the agency's current medication list and the physician-ordered medication regimen. ; At each skilled nursing visit. ; ; 6.1.2 ; Assigned RN / LVN ; Assess the patient's actual medication-taking behavior: (a) ask the patient/caregiver which medications they are taking and how they are taking them (dose, frequency, timing); (b) count pill quantities or check fill dates if non-adherence is suspected.",
      "Controlled-policy focus — CL-OA-014, Oral and Injectable Medication Management Assessment (M2020, M2030). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assessing RN ; Assess M2020 (Oral Medication Management) based on the patient's actual performance of oral medication management tasks during the look-back period — not on what the patient could theoretically do. Ask: \"Do you take your own medications by yourself, or does someone help you?\" \"Do you set up your own medications, or does someone else prepare them for you?\" Observe the patient attempt to access and take a medication during the visit if clinically feasible. ; During the assessment visit. ; ; 6.3.2 ; Assessing RN ; Apply the CMS OASIS-E2 Guidance Manual response option definitions exactly as written.",
      "Controlled-policy focus — CL-SD-012, Medication Education. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; At SOC, provide comprehensive medication education to the patient and caregiver covering: the purpose of each medication; the correct dose, frequency, and timing; the correct route and technique (especially for inhalers, injectable medications, eye drops, and topical medications); common side effects and how to manage them; signs of adverse reactions that require physician contact or emergency services; medication interactions to avoid (including food interactions); proper storage; the importance of adherence and the risks of non-adherence; the importance of not sharing medications; and how to dispose of expired or discontinued medications safely. ; At the SOC visit..",
      "Controlled-policy focus — CL-SD-012, Medication Administration During Visits. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Before administering any medication, perform the Seven Rights verification: (a) right patient — verify identity using two identifiers per OP-PA-002; (b) right medication — compare the medication label to the physician order; (c) right dose — verify the dose matches the order; (d) right route — verify the ordered route; (e) right time — verify the administration time is consistent with the order; (f) right documentation — ensure the order is current and documented; (g) right reason — verify the indication is consistent with the patient's diagnosis. ; Before each medication administration. ; ; 6.2.2.",
      "Apply the controlled requirements to the three visible objects in the scene for best possible medication list in the home. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Weekly Organizer", detail: "Review the weekly organizer for the patient-specific finding. Reconcile it with the amber bottles with sides, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Amber Bottles With Sides", detail: "Review the amber bottles with sides for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the weekly organizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "weekly-organizer-2-1", label: "weekly organizer", shortLabel: "weekly organizer", ariaLabel: "Investigate weekly organizer",        x: 14, y: 59, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the weekly organizer as patient-specific evidence for best possible medication list in the home. Compare it with the amber bottles with sides, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weekly organizer, compare the visible evidence with amber bottles with sides and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the weekly organizer as patient-specific evidence for best possible medication list in the home. Compare it with the amber bottles with sides, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weekly organizer, compare the visible evidence with amber bottles with sides and the controlling source before classifying status." },
          { id: "i2", label: "Assume the weekly organizer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for best possible medication list in the home." },
          { id: "i3", label: "Dismiss the conflict between the weekly organizer and amber bottles with sides because one source appears more convenient. This identify option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about weekly organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weekly organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weekly organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the weekly organizer without confirming an applicable order and patient-specific authority. This decide option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for weekly organizer is resolved." },
          { id: "d3", label: "Hand the weekly organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during best possible medication list in the home." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For weekly organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For weekly organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the weekly organizer before reassessment confirms the patient response. This document option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of weekly organizer." },
          { id: "doc3", label: "Copy the prior best possible medication list in the home narrative even though today’s weekly organizer evidence is different. This document option concerns weekly organizer during best possible medication list in the home.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for best possible medication list in the home." },
        ],
        feedback: {
          observed: "Observe the weekly organizer as patient-specific evidence for best possible medication list in the home. Compare it with the amber bottles with sides, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the weekly organizer as patient-specific evidence for best possible medication list in the home. Compare it with the amber bottles with sides, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weekly organizer, compare the visible evidence with amber bottles with sides and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weekly organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For weekly organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "amber-bottles-with-sides-2-2", label: "amber bottles with sides", shortLabel: "amber bottles with sides", ariaLabel: "Investigate amber bottles with sides",        x: 33, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the amber bottles with sides as patient-specific evidence for best possible medication list in the home. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber bottles with sides, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the amber bottles with sides as patient-specific evidence for best possible medication list in the home. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber bottles with sides, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the amber bottles with sides and omit the related change, symptom, or safety cue. This identify option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for best possible medication list in the home." },
          { id: "i3", label: "Let a blank, unreadable, or unverified amber bottles with sides stand in for direct RN assessment. This identify option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about amber bottles with sides." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber bottles with sides; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber bottles with sides; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the amber bottles with sides issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for amber bottles with sides is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for best possible medication list in the home instead of the current controlled clinical pathway. This decide option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during best possible medication list in the home." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For amber bottles with sides, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For amber bottles with sides, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the amber bottles with sides and omit the discrepancy with tablet. This document option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of amber bottles with sides." },
          { id: "doc3", label: "Combine the amber bottles with sides issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns amber bottles with sides during best possible medication list in the home.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for best possible medication list in the home." },
        ],
        feedback: {
          observed: "Observe the amber bottles with sides as patient-specific evidence for best possible medication list in the home. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the amber bottles with sides as patient-specific evidence for best possible medication list in the home. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For amber bottles with sides, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to amber bottles with sides; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For amber bottles with sides, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "tablet-2-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 85, y: 63, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the tablet as patient-specific evidence for best possible medication list in the home. Compare it with the weekly organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with weekly organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for best possible medication list in the home. Compare it with the weekly organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with weekly organizer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the weekly organizer, patient report, or current record. This identify option concerns tablet during best possible medication list in the home.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for best possible medication list in the home." },
          { id: "i3", label: "Carry forward the prior visit conclusion for best possible medication list in the home without reassessing the patient today. This identify option concerns tablet during best possible medication list in the home.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during best possible medication list in the home.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during best possible medication list in the home.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during best possible medication list in the home." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during best possible medication list in the home.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during best possible medication list in the home.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for best possible medication list in the home." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for best possible medication list in the home. Compare it with the weekly organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for best possible medication list in the home. Compare it with the weekly organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for best possible medication list in the home, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with weekly organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for best possible medication list in the home. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Seven",
    title: "Seven Rights and high-alert safeguards",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for seven rights and high-alert safeguards within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-012, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-012, 4\\. Policy Statement. 4.1 All medication administration by agency staff shall be authorized by a current, valid physician order specifying: drug name, dose, route, frequency, and indication. No medication shall be administered without a physician order per CL-CP-003. 4.2 All medication administration shall follow the \"Five Rights\" verification protocol: right patient, right medication, right dose, right route, and right time. Additionally, the clinician shall verify the right documentation and right reason (the \"Seven Rights\" standard adopted by the agency). 4.3 At each skilled nursing visit, the assigned RN or LVN shall perform a comprehensive medication review including: (a) verification of the patient's actual medication-taking behavior against the prescribed regimen; (b) assessment of medication storage conditions; (c) identification of new, changed, or.",
      "Controlled-policy focus — CL-SD-012, 10\\. Training & Acknowledgment Requirements. 10.1 All RNs and LVNs shall receive competency-validated training on medication management and administration requirements within 14 calendar days of hire and annually thereafter, including: (a) the Seven Rights protocol; (b) medication review documentation standards; (c) ADR identification and reporting; (d) high-alert medication protocols per RM-PS-005; (e) medication non-adherence assessment and intervention; (f) controlled substance documentation requirements; (g) medication education documentation standards. 10.2 All RNs and LVNs shall demonstrate competency in medication administration — including injection technique, medication verification, and ADR recognition — through skills evaluation at hire and annually. 10.3 All personnel within scope of this policy shall sign the Policy Acknowledgment Form (Appendix A) within 14 calendar days of the policy effective date, any revision, or.",
      "Controlled-policy focus — CL-SD-012, 5\\. Definitions. Term ; Definition ; ; ; ; ; Medication Administration ; The act of giving a medication to a patient by a licensed clinician — including oral, topical, injectable, inhalation, rectal, ophthalmic, otic, and transdermal routes. ; ; Medication Management ; The comprehensive clinical process of assessing, monitoring, educating, and coordinating the patient's medication regimen to ensure safety, efficacy, and adherence. ; ; Medication Reconciliation ; The process of comparing the patient's medication orders against all medications the patient is actually taking to identify and resolve discrepancies. Detailed in CL-SD-013. ; ; Adverse Drug Reaction (ADR) ; An undesirable response to a medication that occurs at normal doses used for prophylaxis, diagnosis, or treatment. ; ; Polypharmacy.",
      "Controlled-policy focus — CL-SD-012, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Medication review documented at every skilled nursing visit ; Monthly chart audit of random sample ; ≥95% of audited visit notes contain medication review documentation ; ; Seven Rights verification documented for all medications administered ; Chart audit ; ≥98% ; ; Medication discrepancies result in physician notification within 24 hours ; Audit of physician communication notes ; ≥95% ; ; All adverse drug reactions reported through incident reporting system ; Cross-reference visit notes documenting ADRs with incident reports ; 100% — zero unreported ADRs ; ; Patient/caregiver medication education documented at SOC ; SOC visit note audit ; ≥95%.",
      "Controlled-policy focus — CL-SD-012, Medication Administration During Visits. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Before administering any medication, perform the Seven Rights verification: (a) right patient — verify identity using two identifiers per OP-PA-002; (b) right medication — compare the medication label to the physician order; (c) right dose — verify the dose matches the order; (d) right route — verify the ordered route; (e) right time — verify the administration time is consistent with the order; (f) right documentation — ensure the order is current and documented; (g) right reason — verify the indication is consistent with the patient's diagnosis. ; Before each medication administration. ; ; 6.2.2.",
      "Current agency workflow boundary — CL-SD-012 section 6.2.4 directs the enhanced safety protocols defined in RM-PS-005 for high-alert medications identified there, including independent double-check verification, dose-calculation verification, and specific monitoring parameters. Apply that safeguard only within the current policy and workflow scope; do not convert it into a universal independent-double-check rule for every medication or every step.",
      "Apply the controlled requirements to the three visible objects in the scene for seven rights and high-alert safeguards. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Two Look-alike Amber Bottles", detail: "Review the two look-alike amber bottles for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the magnifier, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Magnifier", detail: "Review the magnifier for the patient-specific finding. Reconcile it with the two look-alike amber bottles, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
      { kind: "External Authority", text: "42 CFR § 484.75(a)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "two-look-alike-amber-bottles-3-1", label: "two look-alike amber bottles", shortLabel: "two look-alike amber bottles", ariaLabel: "Investigate two look-alike amber bottles",        x: 14, y: 60, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the two look-alike amber bottles as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two look-alike amber bottles, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the two look-alike amber bottles as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two look-alike amber bottles, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the two look-alike amber bottles and omit the related change, symptom, or safety cue. This identify option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for seven rights and high-alert safeguards." },
          { id: "i3", label: "Let a blank, unreadable, or unverified two look-alike amber bottles stand in for direct RN assessment. This identify option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about two look-alike amber bottles." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two look-alike amber bottles; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two look-alike amber bottles; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the two look-alike amber bottles issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for two look-alike amber bottles is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for seven rights and high-alert safeguards instead of the current controlled clinical pathway. This decide option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during seven rights and high-alert safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For two look-alike amber bottles, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For two look-alike amber bottles, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the two look-alike amber bottles and omit the discrepancy with pill organizer. This document option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two look-alike amber bottles." },
          { id: "doc3", label: "Combine the two look-alike amber bottles issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns two look-alike amber bottles during seven rights and high-alert safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for seven rights and high-alert safeguards." },
        ],
        feedback: {
          observed: "Observe the two look-alike amber bottles as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the two look-alike amber bottles as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two look-alike amber bottles, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two look-alike amber bottles; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For two look-alike amber bottles, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "pill-organizer-3-2", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 54, y: 75, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the pill organizer as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with magnifier and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with magnifier and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pill organizer as the complete assessment and do not compare the magnifier, patient report, or current record. This identify option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for seven rights and high-alert safeguards." },
          { id: "i3", label: "Carry forward the prior visit conclusion for seven rights and high-alert safeguards without reassessing the patient today. This identify option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pill organizer alone and seek clarification only after the intervention is complete. This decide option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Defer the concern in the pill organizer to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during seven rights and high-alert safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pill organizer was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Keep the pill organizer decision in personal notes rather than the governed patient record. This document option concerns pill organizer during seven rights and high-alert safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for seven rights and high-alert safeguards." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with magnifier and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "magnifier-3-3", label: "magnifier", shortLabel: "magnifier", ariaLabel: "Investigate magnifier",        x: 82, y: 46, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the magnifier as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the two look-alike amber bottles, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with two look-alike amber bottles and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the magnifier as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the two look-alike amber bottles, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with two look-alike amber bottles and the controlling source before classifying status." },
          { id: "i2", label: "Assume the magnifier establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for seven rights and high-alert safeguards." },
          { id: "i3", label: "Dismiss the conflict between the magnifier and two look-alike amber bottles because one source appears more convenient. This identify option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about magnifier." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the magnifier without confirming an applicable order and patient-specific authority. This decide option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for magnifier is resolved." },
          { id: "d3", label: "Hand the magnifier concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during seven rights and high-alert safeguards." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For magnifier, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For magnifier, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the magnifier before reassessment confirms the patient response. This document option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of magnifier." },
          { id: "doc3", label: "Copy the prior seven rights and high-alert safeguards narrative even though today’s magnifier evidence is different. This document option concerns magnifier during seven rights and high-alert safeguards.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for seven rights and high-alert safeguards." },
        ],
        feedback: {
          observed: "Observe the magnifier as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the two look-alike amber bottles, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the magnifier as patient-specific evidence for seven rights and high-alert safeguards. Compare it with the two look-alike amber bottles, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for seven rights and high-alert safeguards, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with two look-alike amber bottles and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for seven rights and high-alert safeguards. For magnifier, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Classif",
    title: "Classify discrepancies and assess patient exposure",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for classify discrepancies and assess patient exposure within Medication Management & Reconciliation. Use the current controlled requirements in CL-OA-014, CL-SD-013, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-014, Drug Regimen Review at Each Assessment Time Point (M2001). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assessing RN ; Before beginning the drug regimen review, compile the complete prescribed medication list from: (a) the physician's current medication orders; (b) the medication reconciliation worksheet per CL-SD-013; (c) the referring facility's discharge medication list (for SOC/ROC). This constitutes the \"prescribed regimen\" baseline against which actual behavior will be compared. ; Before the drug regimen review during the assessment visit. ; ; 6.1.2 ; Assessing RN ; Conduct the physical medication inventory: ask the patient/caregiver to bring ALL medications to the assessment area — prescription bottles, over-the-counter medications, vitamins, supplements, herbal products, patches, inhalers, injectable medications, and eye/ear drops. Visually.",
      "Controlled-policy focus — CL-OA-014, Oral and Injectable Medication Management Assessment (M2020, M2030). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assessing RN ; Assess M2020 (Oral Medication Management) based on the patient's actual performance of oral medication management tasks during the look-back period — not on what the patient could theoretically do. Ask: \"Do you take your own medications by yourself, or does someone help you?\" \"Do you set up your own medications, or does someone else prepare them for you?\" Observe the patient attempt to access and take a medication during the visit if clinically feasible. ; During the assessment visit. ; ; 6.3.2 ; Assessing RN ; Apply the CMS OASIS-E2 Guidance Manual response option definitions exactly as written.",
      "Controlled-policy focus — CL-OA-014, 5\\. Definitions. Term ; Definition ; ; ; ; ; Prescribed Regimen ; The complete set of medications ordered by a physician or allowed practitioner for a patient — including drug name, dose, route, frequency, and indication — as reflected in the physician's current medication orders and the medication reconciliation record. ; ; Actual Patient Behavior ; The patient's real-world medication-taking practices as assessed during the assessment encounter — including which medications the patient actually takes, at what doses, at what frequencies, and with what level of assistance. Actual patient behavior is assessed through direct interview, physical inventory, and caregiver report, not inferred from the prescribed regimen. ; ; Drug Regimen Review ; The systematic comparison of all physician-ordered medications.",
      "Controlled-policy focus — CL-OA-014, 4\\. Policy Statement. 4.1 All medication management OASIS items shall be coded based on the patient's actual medication-taking behavior during the applicable look-back period — not based on the prescribed medication regimen, the physician's medication order, or the patient's stated intent to take medications as prescribed. 4.2 The assessment of actual medication-taking behavior shall be conducted through: (a) direct interview of the patient using standardized, open-ended questions about their medication use; (b) physical inventory and inspection of all medication bottles, containers, organizers, patches, and injectable supplies in the patient's home; (c) caregiver report of observed medication administration during the look-back period; (d) review of pharmacy refill history when accessible. 4.3 A drug regimen review per M2001 shall be conducted at every.",
      "Controlled-policy focus — CL-SD-013, Medication Reconciliation at Transfer to Inpatient Facility. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; When a patient is transferred to an inpatient facility, prepare and transmit to the receiving facility: (a) the patient's current, reconciled medication list from the home health clinical record; (b) any known medication allergies and adverse reactions; (c) any medication adherence concerns per CL-CP-007. ; At the time of transfer or as soon as practicable. ; ; 6.3.2 ; Assigned RN ; Document the medications communicated to the receiving facility, the date, and the method of communication. ; Within 24 hours of transfer..",
      "Apply the controlled requirements to the three visible objects in the scene for classify discrepancies and assess patient exposure. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Medication Cup", detail: "Review the medication cup for the patient-specific finding. Reconcile it with the water glass, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Water Glass", detail: "Review the water glass for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the medication cup, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR § 484.75(a)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "medication-cup-4-1", label: "medication cup", shortLabel: "medication cup", ariaLabel: "Investigate medication cup",        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the medication cup as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the water glass, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication cup, compare the visible evidence with water glass and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication cup as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the water glass, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication cup, compare the visible evidence with water glass and the controlling source before classifying status." },
          { id: "i2", label: "Treat the medication cup as the complete assessment and do not compare the water glass, patient report, or current record. This identify option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for classify discrepancies and assess patient exposure." },
          { id: "i3", label: "Carry forward the prior visit conclusion for classify discrepancies and assess patient exposure without reassessing the patient today. This identify option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication cup." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication cup; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication cup; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the medication cup alone and seek clarification only after the intervention is complete. This decide option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication cup is resolved." },
          { id: "d3", label: "Defer the concern in the medication cup to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during classify discrepancies and assess patient exposure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For medication cup, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For medication cup, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the medication cup was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication cup." },
          { id: "doc3", label: "Keep the medication cup decision in personal notes rather than the governed patient record. This document option concerns medication cup during classify discrepancies and assess patient exposure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for classify discrepancies and assess patient exposure." },
        ],
        feedback: {
          observed: "Observe the medication cup as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the water glass, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication cup as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the water glass, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication cup, compare the visible evidence with water glass and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication cup; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For medication cup, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "water-glass-4-2", label: "water glass", shortLabel: "water glass", ariaLabel: "Investigate water glass",        x: 35, y: 47, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the water glass as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For water glass, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the water glass as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For water glass, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the water glass establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for classify discrepancies and assess patient exposure." },
          { id: "i3", label: "Dismiss the conflict between the water glass and pill organizer because one source appears more convenient. This identify option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about water glass." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to water glass; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to water glass; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the water glass without confirming an applicable order and patient-specific authority. This decide option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for water glass is resolved." },
          { id: "d3", label: "Hand the water glass concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during classify discrepancies and assess patient exposure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For water glass, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For water glass, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the water glass before reassessment confirms the patient response. This document option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of water glass." },
          { id: "doc3", label: "Copy the prior classify discrepancies and assess patient exposure narrative even though today’s water glass evidence is different. This document option concerns water glass during classify discrepancies and assess patient exposure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for classify discrepancies and assess patient exposure." },
        ],
        feedback: {
          observed: "Observe the water glass as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the water glass as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For water glass, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to water glass; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For water glass, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "pill-organizer-4-3", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the pill organizer as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the medication cup, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with medication cup and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the medication cup, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with medication cup and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pill organizer and omit the related change, symptom, or safety cue. This identify option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for classify discrepancies and assess patient exposure." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pill organizer stand in for direct RN assessment. This identify option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pill organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for classify discrepancies and assess patient exposure instead of the current controlled clinical pathway. This decide option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during classify discrepancies and assess patient exposure." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pill organizer and omit the discrepancy with medication cup. This document option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Combine the pill organizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pill organizer during classify discrepancies and assess patient exposure.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for classify discrepancies and assess patient exposure." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the medication cup, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for classify discrepancies and assess patient exposure. Compare it with the medication cup, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for classify discrepancies and assess patient exposure, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with medication cup and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for classify discrepancies and assess patient exposure. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Hard",
    title: "Hard stop, prescriber/pharmacy/DON escalation",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for hard stop, prescriber/pharmacy/don escalation within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-013, CL-OA-014, CL-SD-012, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-013, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Discharge medication list not available from the inpatient facility at ROC ; Assigned RN contacts the facility directly ; RN obtains the medication list by telephone, fax, or portal. If unavailable within 24 hours of the ROC visit, escalate to Director of Nursing. Perform reconciliation using available sources (patient report, pharmacy profile, prior agency records) and flag the record for physician follow-up. ; Facility contact within 24 hours; Director of Nursing escalation if unresolved. ; ; Physician does not respond to reconciliation discrepancy notification ; Clinical Coordinator escalates per CL-CP-003 ; Follow the physician follow-up escalation timelines in CL-CP-003. Director of Nursing.",
      "Controlled-policy focus — CL-OA-014, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Patient is unable to produce any medications for review (no medications accessible in the home) ; Assessing RN documents and notifies Director of Nursing ; Document the specific reason no medications are accessible. Contact caregiver and pharmacy to establish the current medication list. Code M2001 per CMS guidance for the circumstance where medications are not available for review. Director of Nursing assesses whether the patient's medication management situation constitutes a patient safety concern requiring physician notification. ; Documentation immediately; Director of Nursing notification within 2 hours. ; ; Patient refuses drug regimen review ; Assessing RN documents refusal ; Document patient's refusal.",
      "Controlled-policy focus — CL-SD-012, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Suspected adverse drug reaction — non-emergent ; RN notifies physician ; Physician provides guidance; RN implements orders; documents in clinical record and incident report per RM-ER-002. ; Physician notification within 24 hours; incident report within 24 hours. ; ; Suspected adverse drug reaction — emergent (anaphylaxis, severe hypotension, respiratory distress) ; RN calls 911; notifies physician and Director of Nursing ; RN provides emergency care within scope; remains with patient until EMS arrival; documents all actions. ; Immediately. ; ; Medication error discovered ; RN assesses patient; notifies physician immediately; notifies Director of Nursing within 4 hours ; Patient assessment and intervention.",
      "Controlled-policy focus — CL-SD-012, Medication Non-Adherence Management. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; When medication non-adherence is identified, assess the root cause: (a) knowledge deficit (patient does not understand the regimen); (b) physical barrier (patient cannot open bottles, read labels, or self-administer); (c) financial barrier (patient cannot afford medications); (d) intentional non-adherence (patient chooses not to take medications); (e) cognitive impairment affecting medication management capability; (f) complex regimen (polypharmacy, multiple daily doses). ; At the visit where non-adherence is identified. ; ; 6.4.2 ; Assigned RN ; Based on the root cause assessment, implement targeted interventions: education for knowledge deficits; adaptive equipment or caregiver training for physical barriers; pharmacy assistance program.",
      "Controlled-policy focus — CL-SD-013, 5\\. Definitions. Term ; Definition ; ; ; ; ; Medication Reconciliation ; The formal clinical process of comparing all medication sources to create a single, accurate, physician-verified medication list for the patient. ; ; Transition of Care ; A point at which the patient moves between care settings or levels of care — including hospital to home, SNF to home, home health to hospital, and home health to discharge. ; ; Medication Source ; A document or verbal report containing information about the patient's medications. Common sources include: patient/caregiver verbal report, medication bottles at the bedside, hospital discharge medication list, pharmacy profile, physician medication list, and prior home health agency medication list. ; ; Intentional Discrepancy ; A difference.",
      "Apply the controlled requirements to the three visible objects in the scene for hard stop, prescriber/pharmacy/don escalation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Empty Pill Organizer", detail: "Review the empty pill organizer for the patient-specific finding. Reconcile it with the coin purse closed, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Coin Purse Closed", detail: "Review the coin purse closed for the patient-specific finding. Reconcile it with the delivery bag, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Delivery Bag", detail: "Review the delivery bag for the patient-specific finding. Reconcile it with the empty pill organizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "empty-pill-organizer-5-1", label: "empty pill organizer", shortLabel: "empty pill organizer", ariaLabel: "Investigate empty pill organizer",        x: 14, y: 47, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the empty pill organizer as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty pill organizer, compare the visible evidence with coin purse closed and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the empty pill organizer as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty pill organizer, compare the visible evidence with coin purse closed and the controlling source before classifying status." },
          { id: "i2", label: "Assume the empty pill organizer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for hard stop, prescriber/pharmacy/don escalation." },
          { id: "i3", label: "Dismiss the conflict between the empty pill organizer and coin purse closed because one source appears more convenient. This identify option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about empty pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the empty pill organizer without confirming an applicable order and patient-specific authority. This decide option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for empty pill organizer is resolved." },
          { id: "d3", label: "Hand the empty pill organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during hard stop, prescriber/pharmacy/don escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For empty pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For empty pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the empty pill organizer before reassessment confirms the patient response. This document option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of empty pill organizer." },
          { id: "doc3", label: "Copy the prior hard stop, prescriber/pharmacy/don escalation narrative even though today’s empty pill organizer evidence is different. This document option concerns empty pill organizer during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for hard stop, prescriber/pharmacy/don escalation." },
        ],
        feedback: {
          observed: "Observe the empty pill organizer as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the empty pill organizer as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the coin purse closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For empty pill organizer, compare the visible evidence with coin purse closed and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to empty pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For empty pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "coin-purse-closed-5-2", label: "coin purse closed", shortLabel: "coin purse closed", ariaLabel: "Investigate coin purse closed",        x: 50, y: 72, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the coin purse closed as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the delivery bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with delivery bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the coin purse closed as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the delivery bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with delivery bag and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the coin purse closed and omit the related change, symptom, or safety cue. This identify option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for hard stop, prescriber/pharmacy/don escalation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified coin purse closed stand in for direct RN assessment. This identify option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about coin purse closed." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the coin purse closed issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for coin purse closed is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for hard stop, prescriber/pharmacy/don escalation instead of the current controlled clinical pathway. This decide option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during hard stop, prescriber/pharmacy/don escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For coin purse closed, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For coin purse closed, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the coin purse closed and omit the discrepancy with delivery bag. This document option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of coin purse closed." },
          { id: "doc3", label: "Combine the coin purse closed issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns coin purse closed during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for hard stop, prescriber/pharmacy/don escalation." },
        ],
        feedback: {
          observed: "Observe the coin purse closed as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the delivery bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the coin purse closed as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the delivery bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For coin purse closed, compare the visible evidence with delivery bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to coin purse closed; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For coin purse closed, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "delivery-bag-5-3", label: "delivery bag", shortLabel: "delivery bag", ariaLabel: "Investigate delivery bag",        x: 80, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the delivery bag as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the empty pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For delivery bag, compare the visible evidence with empty pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the delivery bag as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the empty pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For delivery bag, compare the visible evidence with empty pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the delivery bag as the complete assessment and do not compare the empty pill organizer, patient report, or current record. This identify option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for hard stop, prescriber/pharmacy/don escalation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for hard stop, prescriber/pharmacy/don escalation without reassessing the patient today. This identify option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about delivery bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to delivery bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to delivery bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the delivery bag alone and seek clarification only after the intervention is complete. This decide option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for delivery bag is resolved." },
          { id: "d3", label: "Defer the concern in the delivery bag to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during hard stop, prescriber/pharmacy/don escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For delivery bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For delivery bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the delivery bag was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of delivery bag." },
          { id: "doc3", label: "Keep the delivery bag decision in personal notes rather than the governed patient record. This document option concerns delivery bag during hard stop, prescriber/pharmacy/don escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for hard stop, prescriber/pharmacy/don escalation." },
        ],
        feedback: {
          observed: "Observe the delivery bag as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the empty pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the delivery bag as patient-specific evidence for hard stop, prescriber/pharmacy/don escalation. Compare it with the empty pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for hard stop, prescriber/pharmacy/don escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For delivery bag, compare the visible evidence with empty pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to delivery bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for hard stop, prescriber/pharmacy/don escalation. For delivery bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Update",
    title: "Update orders, profile, MAR, supply, and education",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for update orders, profile, mar, supply, and education within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-012, CL-OA-014, CL-SD-013, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-012, Medication Education. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; At SOC, provide comprehensive medication education to the patient and caregiver covering: the purpose of each medication; the correct dose, frequency, and timing; the correct route and technique (especially for inhalers, injectable medications, eye drops, and topical medications); common side effects and how to manage them; signs of adverse reactions that require physician contact or emergency services; medication interactions to avoid (including food interactions); proper storage; the importance of adherence and the risks of non-adherence; the importance of not sharing medications; and how to dispose of expired or discontinued medications safely. ; At the SOC visit..",
      "Controlled-policy focus — CL-OA-014, Documentation Requirements for Medication OASIS Items. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assessing RN ; Document the drug regimen review in the assessment narrative with the following elements: (a) the review methodology (physical inventory conducted, interview conducted, pharmacy profile accessed); (b) the number of medications reviewed; (c) any medications present in the home but not on the prescribed list; (d) any prescribed medications not present in the home; (e) any adherence concerns identified; (f) any potential clinically significant issues identified with specific description; (g) physician notification status (date, time, method, outcome) if issues were found. ; In the assessment narrative; before locking. ; ; 6.4.2 ; Assessing RN ; For M2020 and M2030.",
      "Controlled-policy focus — CL-SD-012, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Medication review documented as \"meds reviewed, no changes\" without detail ; Survey deficiency; inability to demonstrate skilled service ; Require structured medication review section in visit note template; Director of Nursing audits monthly ; ; Medication list not updated when changes occur ; Documentation integrity failure; patient safety risk ; EHR medication list update required before visit note can be locked ; ; Medication education documented as \"pt educated on meds\" without specifics ; Survey deficiency; unable to demonstrate individualized education ; Require documentation of specific topics, teaching method, and teach-back response ; ; ADRs identified in visit notes but no physician notification documented ; Patient.",
      "Controlled-policy focus — CL-SD-013, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Reconciliation treated as copying the discharge medication list into the plan of care without comparison ; Discrepancies not identified; patient safety risk ; Train all clinicians on three-source comparison methodology; Director of Nursing audits monthly ; ; Pharmacy profile not obtained as a verification source ; Incomplete reconciliation; missed discrepancies ; Require pharmacy profile request at SOC and ROC as standard workflow ; ; Discrepancies identified but not communicated to physician ; Unresolved medication issues; patient harm potential ; Mandatory physician communication documentation field in reconciliation worksheet ; ; Reconciliation completed at SOC but not at ROC ; Post-hospitalization medication changes missed ; Automated EHR alert.",
      "Controlled-policy focus — CL-SD-013, APPENDICES. Appendix A — Medication Reconciliation Worksheet Care Indeed Home Health Care, Inc. ; Policy Reference: CL-SD-013 ; Version: 1.0 Patient Name: _________________ MR#: _________ Date: _________ Transition Type: ☐ SOC ☐ ROC ☐ Transfer ☐ Discharge Sources Used: ☐ Patient/Caregiver Report ☐ Hospital/SNF Discharge List ☐ Pharmacy Profile ☐ Physician Medication List ☐ Medication Bottles at Bedside ☐ Other: _____________ ; # ; Medication Name ; Dose ; Route ; Freq ; Patient Report ; Physician Order ; Discharge List ; Pharmacy Profile ; Discrepancy? ; Classification ; Resolution ; ; ; ; ; ; ; ; ; ; ; ; ; ; ; 1 ; ; ; ; ; ☐ Match ☐ Disc. ; ☐ Match ☐.",
      "Apply the controlled requirements to the three visible objects in the scene for update orders, profile, mar, supply, and education. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the picture-only card with shapes, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Picture-only Card With Shapes", detail: "Review the picture-only card with shapes for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "pill-organizer-6-1", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 16, y: 68, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the pill organizer as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the picture-only card with shapes, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with picture-only card with shapes and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the picture-only card with shapes, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with picture-only card with shapes and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pill organizer and omit the related change, symptom, or safety cue. This identify option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for update orders, profile, mar, supply, and education." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pill organizer stand in for direct RN assessment. This identify option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pill organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for update orders, profile, mar, supply, and education instead of the current controlled clinical pathway. This decide option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during update orders, profile, mar, supply, and education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pill organizer and omit the discrepancy with picture-only card with shapes. This document option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Combine the pill organizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pill organizer during update orders, profile, mar, supply, and education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for update orders, profile, mar, supply, and education." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the picture-only card with shapes, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the picture-only card with shapes, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with picture-only card with shapes and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "picture-only-card-with-shapes-6-2", label: "picture-only card with shapes", shortLabel: "picture-only card with shapes", ariaLabel: "Investigate picture-only card with shapes",        x: 34, y: 42, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the picture-only card with shapes as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only card with shapes, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the picture-only card with shapes as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only card with shapes, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Treat the picture-only card with shapes as the complete assessment and do not compare the phone, patient report, or current record. This identify option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for update orders, profile, mar, supply, and education." },
          { id: "i3", label: "Carry forward the prior visit conclusion for update orders, profile, mar, supply, and education without reassessing the patient today. This identify option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about picture-only card with shapes." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only card with shapes; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only card with shapes; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the picture-only card with shapes alone and seek clarification only after the intervention is complete. This decide option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for picture-only card with shapes is resolved." },
          { id: "d3", label: "Defer the concern in the picture-only card with shapes to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during update orders, profile, mar, supply, and education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For picture-only card with shapes, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For picture-only card with shapes, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the picture-only card with shapes was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of picture-only card with shapes." },
          { id: "doc3", label: "Keep the picture-only card with shapes decision in personal notes rather than the governed patient record. This document option concerns picture-only card with shapes during update orders, profile, mar, supply, and education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for update orders, profile, mar, supply, and education." },
        ],
        feedback: {
          observed: "Observe the picture-only card with shapes as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the picture-only card with shapes as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For picture-only card with shapes, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to picture-only card with shapes; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For picture-only card with shapes, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "phone-6-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 80, y: 61, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the phone as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the phone establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for update orders, profile, mar, supply, and education." },
          { id: "i3", label: "Dismiss the conflict between the phone and pill organizer because one source appears more convenient. This identify option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the phone without confirming an applicable order and patient-specific authority. This decide option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Hand the phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during update orders, profile, mar, supply, and education." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the phone before reassessment confirms the patient response. This document option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Copy the prior update orders, profile, mar, supply, and education narrative even though today’s phone evidence is different. This document option concerns phone during update orders, profile, mar, supply, and education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for update orders, profile, mar, supply, and education." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for update orders, profile, mar, supply, and education. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for update orders, profile, mar, supply, and education, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for update orders, profile, mar, supply, and education. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Complet",
    title: "Complete reconciliation documentation and practice",
    subtitle: "Medication Management & Reconciliation",
    narration: [
      "This lesson develops registered-nurse reasoning for complete reconciliation documentation and practice within Medication Management & Reconciliation. Use the current controlled requirements in CL-SD-012, CL-SD-013, CL-OA-014, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-012, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Medication review at each visit ; Visit note documenting medication review findings per Section 6.1.6 ; Assigned RN / LVN ; EHR — visit note ; Within 24 hours of each visit; retained minimum 7 years ; ; Medication administration record ; Documentation of each medication administered per Section 6.2 ; Assigned RN / LVN ; EHR — visit note ; At each administration; within 24 hours ; ; Medication education documentation ; Education content, method, and patient understanding ; Assigned RN / LVN ; EHR — visit note ; Within 24 hours per CL-SD-017 ; ; Medication.",
      "Controlled-policy focus — CL-SD-013, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Medication Reconciliation Worksheet ; Completed worksheet (Appendix A) documenting all sources compared, discrepancies, classifications, and resolutions ; Assigned RN ; EHR — medication reconciliation module ; At each transition (SOC, ROC, transfer, discharge); within 24 hours ; ; Physician communication for discrepancies ; Documentation of physician contact, information communicated, and orders received ; Assigned RN ; EHR — communication notes ; Within 24 hours of discrepancy identification ; ; Updated plan of care medication list ; Reconciled, physician-verified medication list in the plan of care ; Assigned RN ; EHR — plan of care ; Within 24 hours.",
      "Controlled-policy focus — CL-SD-013, Medication Reconciliation at Resumption of Care (ROC). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; When a patient returns from an inpatient facility stay, obtain the facility's discharge summary and discharge medication list before or at the ROC visit. If the discharge summary is not yet available, contact the facility directly to obtain the discharge medication list. ; Before or at the ROC visit. ; ; 6.2.2 ; Assigned RN ; At the ROC visit, perform a complete medication reconciliation using the same three-source comparison methodology as the SOC reconciliation (Section 6.1.2 through 6.1.7). Pay particular attention to: (a) new medications added during the inpatient stay; (b) medications discontinued during the inpatient stay.",
      "Controlled-policy focus — CL-SD-013, Medication Reconciliation at Start of Care (SOC). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before the SOC visit, obtain and review the referring physician's medication list and, if the patient is transitioning from an inpatient stay, the facility's discharge medication list. Contact the patient's pharmacy to obtain the current medication profile if available. ; Before the SOC visit. ; ; 6.1.2 ; Assigned RN ; At the SOC visit, conduct a thorough medication inventory by: (a) asking the patient/caregiver to gather all medications (prescription bottles, OTC products, vitamins, supplements, herbal products, inhalers, patches, eye drops, creams, injections); (b) visually inspecting all medication bottles and packages for drug name, dose, prescriber, fill date.",
      "Controlled-policy focus — CL-OA-014, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Drug regimen review narrative ; Complete documentation per Section 6.4.1 ; Assessing RN ; EHR — Assessment narrative ; Before locking; retained minimum 7 years ; ; Physician contact for M2003 ; Date, time, method, information communicated, physician response ; Assessing RN ; EHR — Communication notes; Assessment narrative ; Within 24 hours of contact; before locking medication OASIS items ; ; M2020/M2030 behavioral evidence ; Specific patient/caregiver interview responses and observations per Section 6.4.2 ; Assessing RN ; EHR — Assessment narrative ; Before locking; retained minimum 7 years ; ; M2010 high-risk drug education ; Specific.",
      "Apply the controlled requirements to the three visible objects in the scene for complete reconciliation documentation and practice. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Final Medication List", detail: "Review the final medication list for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the final medication list, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-012" },
      { kind: "Controlled Policy", text: "CL-SD-013" },
      { kind: "Controlled Policy", text: "CL-OA-014" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "final-medication-list-7-1", label: "final medication list", shortLabel: "final medication list", ariaLabel: "Investigate final medication list",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the final medication list as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For final medication list, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the final medication list as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For final medication list, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Treat the final medication list as the complete assessment and do not compare the pill organizer, patient report, or current record. This identify option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for complete reconciliation documentation and practice." },
          { id: "i3", label: "Carry forward the prior visit conclusion for complete reconciliation documentation and practice without reassessing the patient today. This identify option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about final medication list." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to final medication list; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to final medication list; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the final medication list alone and seek clarification only after the intervention is complete. This decide option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for final medication list is resolved." },
          { id: "d3", label: "Defer the concern in the final medication list to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during complete reconciliation documentation and practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For final medication list, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For final medication list, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the final medication list was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of final medication list." },
          { id: "doc3", label: "Keep the final medication list decision in personal notes rather than the governed patient record. This document option concerns final medication list during complete reconciliation documentation and practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complete reconciliation documentation and practice." },
        ],
        feedback: {
          observed: "Observe the final medication list as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the final medication list as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For final medication list, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to final medication list; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For final medication list, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "pill-organizer-7-2", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 33, y: 59, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the pill organizer as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the pill organizer establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for complete reconciliation documentation and practice." },
          { id: "i3", label: "Dismiss the conflict between the pill organizer and phone because one source appears more convenient. This identify option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the pill organizer without confirming an applicable order and patient-specific authority. This decide option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Hand the pill organizer concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during complete reconciliation documentation and practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the pill organizer before reassessment confirms the patient response. This document option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Copy the prior complete reconciliation documentation and practice narrative even though today’s pill organizer evidence is different. This document option concerns pill organizer during complete reconciliation documentation and practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complete reconciliation documentation and practice." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "phone-7-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the phone as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the final medication list, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with final medication list and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the final medication list, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with final medication list and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for complete reconciliation documentation and practice." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for complete reconciliation documentation and practice instead of the current controlled clinical pathway. This decide option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during complete reconciliation documentation and practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with final medication list. This document option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during complete reconciliation documentation and practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for complete reconciliation documentation and practice." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the final medication list, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for complete reconciliation documentation and practice. Compare it with the final medication list, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for complete reconciliation documentation and practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with final medication list and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for complete reconciliation documentation and practice. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-012","CL-SD-013","CL-OA-014","42 CFR § 484.60","42 CFR § 484.75","42 CFR § 484.60(a)","42 CFR § 484.75(a)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During rn medication responsibility and source hierarchy, the transition folder conflicts with the amber containers and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the transition folder to the next routine visit even though its current clinical significance has not been assessed. This option concerns rn medication responsibility and source hierarchy.",
      "Proceed using the transition folder alone and seek clarification only after the intervention is complete. This option concerns rn medication responsibility and source hierarchy.",
      "Assume the amber containers is unchanged from the prior encounter and omit patient-specific reassessment during rn medication responsibility and source hierarchy.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for rn medication responsibility and source hierarchy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 2,
    stem: "During best possible medication list in the home, the tablet conflicts with the weekly organizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns best possible medication list in the home.",
      "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the weekly organizer is unchanged from the prior encounter and omit patient-specific reassessment during best possible medication list in the home.",
      "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This option concerns best possible medication list in the home.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for best possible medication list in the home within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 3,
    stem: "During seven rights and high-alert safeguards, the magnifier conflicts with the two look-alike amber bottles and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the magnifier issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns seven rights and high-alert safeguards.",
      "Use a familiar local shortcut for seven rights and high-alert safeguards instead of the current controlled clinical pathway. This option concerns seven rights and high-alert safeguards.",
      "Assume the two look-alike amber bottles is unchanged from the prior encounter and omit patient-specific reassessment during seven rights and high-alert safeguards.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for seven rights and high-alert safeguards within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 4,
    stem: "During classify discrepancies and assess patient exposure, the pill organizer conflicts with the medication cup and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the pill organizer alone and seek clarification only after the intervention is complete. This option concerns classify discrepancies and assess patient exposure.",
      "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the pill organizer to the next routine visit even though its current clinical significance has not been assessed. This option concerns classify discrepancies and assess patient exposure.",
      "Assume the medication cup is unchanged from the prior encounter and omit patient-specific reassessment during classify discrepancies and assess patient exposure.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for classify discrepancies and assess patient exposure within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 5,
    stem: "During hard stop, prescriber/pharmacy/don escalation, the delivery bag conflicts with the empty pill organizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the delivery bag without confirming an applicable order and patient-specific authority. This option concerns hard stop, prescriber/pharmacy/don escalation.",
      "Assume the empty pill organizer is unchanged from the prior encounter and omit patient-specific reassessment during hard stop, prescriber/pharmacy/don escalation.",
      "Hand the delivery bag concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns hard stop, prescriber/pharmacy/don escalation.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for hard stop, prescriber/pharmacy/don escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 6,
    stem: "During update orders, profile, mar, supply, and education, the phone conflicts with the pill organizer and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns update orders, profile, mar, supply, and education.",
      "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for update orders, profile, mar, supply, and education instead of the current controlled clinical pathway. This option concerns update orders, profile, mar, supply, and education.",
      "Assume the pill organizer is unchanged from the prior encounter and omit patient-specific reassessment during update orders, profile, mar, supply, and education.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for update orders, profile, mar, supply, and education within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 7,
    stem: "During complete reconciliation documentation and practice, the phone conflicts with the final medication list and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the phone alone and seek clarification only after the intervention is complete. This option concerns complete reconciliation documentation and practice.",
      "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This option concerns complete reconciliation documentation and practice.",
      "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the final medication list is unchanged from the prior encounter and omit patient-specific reassessment during complete reconciliation documentation and practice.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for complete reconciliation documentation and practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-012, CL-SD-013, CL-OA-014.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Medication Management & Reconciliation?",
    options: [
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
    ],
    correct: 1,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the weekly organizer and phone into defensible RN practice for Medication Management & Reconciliation?",
    options: [
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Medication Management & Reconciliation establish?",
    options: [
      "Automatic authority to perform every activity discussed in Medication Management & Reconciliation without supervision.",
      "Knowledge of the controlled RN concepts in Medication Management & Reconciliation, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
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


const STORAGE_KEY = 'rn-006-progress-v6000';

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

export default function RN006() {
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
          <span className="brand-text">RN-006 — Medication</span>
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
