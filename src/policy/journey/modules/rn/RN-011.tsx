/**
 * RN-011 — Coordination of Care & Case Conference
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
import img01 from './assets/rn-011/rn-011-lesson-01.png';
import img02 from './assets/rn-011/rn-011-lesson-02.png';
import img03 from './assets/rn-011/rn-011-lesson-03.png';
import img04 from './assets/rn-011/rn-011-lesson-04.png';
import img05 from './assets/rn-011/rn-011-lesson-05.png';
import img06 from './assets/rn-011/rn-011-lesson-06.png';
import img07 from './assets/rn-011/rn-011-lesson-07.png';

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

const MODULE_META = { id: "RN-011", title: "Coordination of Care & Case Conference", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for RN case-management accountability and unified goals, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Map disciplines, orders, tasks, and ownership, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for SBAR and closed-loop interdisciplinary communication, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Case conference preparation and decision capture, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Missed visits, conflicting recommendations, and service gaps, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Change-in-condition coordination and provider follow-through, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Document unresolved tasks, updates, and accountable next steps, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 RN",
    title: "RN case-management accountability and unified goals",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for rn case-management accountability and unified goals within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CP-002, CL-CP-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Recertification Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator / Director of Nursing ; Generate a recertification tracking report no later than the 40th day of each active certification period, identifying all patients whose certification period ends within the next 20 days. Confirm that each patient has a recertification assessment scheduled and an assigned clinician. ; No later than Day 40 of each certification period. ; ; 6.3.2 ; Assigned RN ; Conduct the comprehensive recertification assessment between Day 56 and Day 60 of the current certification period (5-day assessment window), in compliance with CMS OASIS timing requirements and policy CL-CA-004. Complete all required OASIS data elements for.",
      "Controlled-policy focus — CL-CP-005, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall ensure that all services provided to each patient are coordinated among all disciplines involved in the patient's care and with all external providers who contribute to the patient's overall health management. 4.2 The assigned registered nurse shall serve as the primary care coordinator for each patient, responsible for ensuring that all disciplines contributing to the patient's care are aware of the current plan of care, recent clinical changes, and the patient's progress toward goals. 4.3 Care coordination shall be documented in the patient's clinical record and shall include: (a) interdisciplinary communications regarding clinical status, plan changes, and goal progress; (b) communications with the attending physician, including all notifications of significant.",
      "Controlled-policy focus — CL-CP-005, Internal Interdisciplinary Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, review the patient's plan of care with each clinical discipline involved in the patient's care within 48 hours of the SOC visit. The communication shall include: (a) the patient's primary diagnosis and relevant co-morbidities; (b) the current plan of care including all ordered services and frequencies for each discipline; (c) the patient's functional status and goals; (d) any known safety concerns; (e) the patient's caregiver situation and any limitations to care delivery. ; Within 48 hours of the SOC visit. ; ; 6.1.2 ; Assigned RN ; Document the SOC interdisciplinary communication in the clinical record..",
      "Controlled-policy focus — CL-CP-005, Physician Communication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Notify the attending physician within 24 hours of identifying any of the following: (a) significant change in the patient's condition per CL-CP-002; (b) a new clinical diagnosis or finding; (c) a medication concern, adverse reaction, or potential interaction; (d) a patient safety risk identified during the home assessment per RM-PS-001; (e) a patient refusal of ordered services; (f) a missed visit that affects the patient's clinical care continuity. ; Within 24 hours of the identified event. ; ; 6.2.2 ; Assigned RN ; At a minimum of every 30 calendar days, provide the attending physician with a clinical.",
      "Controlled-policy focus — CL-CP-002, 2\\. Purpose. This policy mandates the periodic review and update of every patient's plan of care throughout the episode of home health care, at each recertification period, and whenever a significant change in the patient's condition warrants modification. The plan of care is not a static document. It must be a living clinical instrument that evolves with the patient's condition, reflects the patient's current functional status and goals, and accurately represents the services being delivered at any point during the certification period. A plan of care that does not reflect the patient's current clinical reality fails its primary function as both a clinical guide and a billing authorization document, and constitutes a documentation compliance failure under 42 CFR § 484.60..",
      "Apply the controlled requirements to the three visible objects in the scene for rn case-management accountability and unified goals. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Care Binder", detail: "Review the care binder for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the neutral task tokens without writing, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Neutral Task Tokens Without Writing", detail: "Review the neutral task tokens without writing for the patient-specific finding. Reconcile it with the care binder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60(c)" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "care-binder-1-1", label: "care binder", shortLabel: "care binder", ariaLabel: "Investigate care binder",        x: 14, y: 40, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the care binder as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the care binder as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Treat the care binder as the complete assessment and do not compare the tablet, patient report, or current record. This identify option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn case-management accountability and unified goals." },
          { id: "i3", label: "Carry forward the prior visit conclusion for rn case-management accountability and unified goals without reassessing the patient today. This identify option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about care binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the care binder alone and seek clarification only after the intervention is complete. This decide option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for care binder is resolved." },
          { id: "d3", label: "Defer the concern in the care binder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn case-management accountability and unified goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For care binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For care binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the care binder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of care binder." },
          { id: "doc3", label: "Keep the care binder decision in personal notes rather than the governed patient record. This document option concerns care binder during rn case-management accountability and unified goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn case-management accountability and unified goals." },
        ],
        feedback: {
          observed: "Observe the care binder as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the care binder as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care binder, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For care binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "tablet-1-2", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 33, y: 61, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the tablet as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the neutral task tokens without writing, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with neutral task tokens without writing and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the neutral task tokens without writing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with neutral task tokens without writing and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn case-management accountability and unified goals." },
          { id: "i3", label: "Dismiss the conflict between the tablet and neutral task tokens without writing because one source appears more convenient. This identify option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This decide option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn case-management accountability and unified goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet before reassessment confirms the patient response. This document option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Copy the prior rn case-management accountability and unified goals narrative even though today’s tablet evidence is different. This document option concerns tablet during rn case-management accountability and unified goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn case-management accountability and unified goals." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the neutral task tokens without writing, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the neutral task tokens without writing, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with neutral task tokens without writing and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "neutral-task-tokens-without-writing-1-3", label: "neutral task tokens without writing", shortLabel: "neutral task tokens without", ariaLabel: "Investigate neutral task tokens without writing",        x: 83, y: 49, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the neutral task tokens without writing as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral task tokens without writing, compare the visible evidence with care binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the neutral task tokens without writing as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral task tokens without writing, compare the visible evidence with care binder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the neutral task tokens without writing and omit the related change, symptom, or safety cue. This identify option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn case-management accountability and unified goals." },
          { id: "i3", label: "Let a blank, unreadable, or unverified neutral task tokens without writing stand in for direct RN assessment. This identify option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about neutral task tokens without writing." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral task tokens without writing; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral task tokens without writing; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the neutral task tokens without writing issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for neutral task tokens without writing is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for rn case-management accountability and unified goals instead of the current controlled clinical pathway. This decide option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn case-management accountability and unified goals." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For neutral task tokens without writing, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For neutral task tokens without writing, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the neutral task tokens without writing and omit the discrepancy with care binder. This document option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of neutral task tokens without writing." },
          { id: "doc3", label: "Combine the neutral task tokens without writing issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns neutral task tokens without writing during rn case-management accountability and unified goals.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn case-management accountability and unified goals." },
        ],
        feedback: {
          observed: "Observe the neutral task tokens without writing as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the neutral task tokens without writing as patient-specific evidence for rn case-management accountability and unified goals. Compare it with the care binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn case-management accountability and unified goals, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral task tokens without writing, compare the visible evidence with care binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral task tokens without writing; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn case-management accountability and unified goals. For neutral task tokens without writing, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Map",
    title: "Map disciplines, orders, tasks, and ownership",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for map disciplines, orders, tasks, and ownership within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CP-002, CL-CP-005, OP-SL-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-002, Mid-Episode Plan of Care Modification (Significant Change). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Clinician (any discipline) ; Any clinician who identifies a significant change in the patient's condition during a visit shall document the clinical findings in the visit note and notify the assigned RN and/or Director of Nursing on the same day. The notification must include: (a) the nature of the change; (b) the patient's current clinical status; (c) the clinician's clinical assessment of the change; (d) any immediate safety concerns. ; On the same day the change is identified. ; ; 6.2.2 ; Assigned RN ; Upon notification or independent identification of a significant change, contact the physician within 24 hours.",
      "Controlled-policy focus — CL-CP-002, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; 30-day review completed for all active patients ; Director of Nursing supervisory review log; EHR review date audit ; ≥95% of active patients with documented 30-day review within required timeframe ; ; Significant changes result in physician notification within 24 hours ; Audit of physician contact notes against visit dates in patient records with documented clinical changes ; ≥95% of significant changes have physician notification documented within 24 hours ; ; Recertification assessments completed within the Day 56–60 window ; Recertification tracking report cross-referenced with OASIS assessment dates ; ≥95% of recertification assessments completed within the 5-day window ; ; All plan modifications supported.",
      "Controlled-policy focus — CL-CP-005, 2\\. Purpose. This policy mandates the coordination of services among all disciplines involved in a patient's care at Care Indeed Home Health Care, Inc. and with external providers — including physicians, hospitals, skilled nursing facilities, pharmacies, community agencies, and other healthcare entities — involved in the patient's overall care. Coordination of care is not merely a documentation requirement; it is a clinical and ethical imperative that directly affects patient outcomes, patient safety, and the efficiency of care delivery. Fragmented care — where disciplines operate in silos, where the attending physician is not kept current on the patient's status, or where the home health team is unaware of care provided by other providers — creates clinical risk, medication errors, unnecessary hospitalizations.",
      "Controlled-policy focus — OP-SL-005, 5\\. Compliance Monitoring. Indicator ; Method ; Standard ; ; ; ; ; ; Communication systems HIPAA-compliant ; Annual security assessment ; 100% ; ; EHR system uptime ; Monthly uptime tracking ; ≥ 99.5% ; ; Communication directory current ; Semi-annual review ; Current within 30 days ; ; Backup plan tested annually ; Test documentation ; Annual test completed ; Appendix A — Agency Communication System Directory CARE INDEED HOME HEALTH CARE, INC. Communication System Directory Policy Reference: OP-SL-005 ; Version: 6.0 ; System ; Primary Contact/Number ; Backup ; Access Instructions ; HIPAA Compliant? ; ; ; ; ; ; ; ; Main Office Phone ; ______________________________ ; ______________________________ ; ______________________________ ; ☐ Yes ; ; After-Hours Line.",
      "Controlled-policy focus — CL-CP-002, What Surveyors and Auditors Will Look For. CMS surveyors will specifically examine: Evidence that plans of care are reviewed at least every 60 days (and more frequently as indicated). Surveyors will check clinical records for documented reviews. A plan of care that is unchanged from SOC through a full 60-day episode without any documented review is a strong indicator of passive care management and will be cited. Evidence that significant clinical changes prompt plan modifications. Surveyors will identify patients who had hospitalizations, significant medication changes, or new diagnoses during the episode and verify that the plan of care was updated. An unchanged plan following a clinical change is a common deficiency. Evidence that all plan modifications are physician-ordered. Surveyors will cross-reference changes in service type.",
      "Apply the controlled requirements to the three visible objects in the scene for map disciplines, orders, tasks, and ownership. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "SBAR Card", detail: "Review the SBAR card for the patient-specific finding. Reconcile it with the closed tablet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Tablet", detail: "Review the closed tablet for the patient-specific finding. Reconcile it with the small confirmation token, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Small Confirmation Token", detail: "Review the small confirmation token for the patient-specific finding. Reconcile it with the SBAR card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "sbar-card-2-1", label: "SBAR card", shortLabel: "SBAR card", ariaLabel: "Investigate SBAR card",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the SBAR card as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the closed tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with closed tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the SBAR card as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the closed tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with closed tablet and the controlling source before classifying status." },
          { id: "i2", label: "Assume the SBAR card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for map disciplines, orders, tasks, and ownership." },
          { id: "i3", label: "Dismiss the conflict between the SBAR card and closed tablet because one source appears more convenient. This identify option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about SBAR card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the SBAR card without confirming an applicable order and patient-specific authority. This decide option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for SBAR card is resolved." },
          { id: "d3", label: "Hand the SBAR card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during map disciplines, orders, tasks, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For SBAR card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For SBAR card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the SBAR card before reassessment confirms the patient response. This document option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of SBAR card." },
          { id: "doc3", label: "Copy the prior map disciplines, orders, tasks, and ownership narrative even though today’s SBAR card evidence is different. This document option concerns SBAR card during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for map disciplines, orders, tasks, and ownership." },
        ],
        feedback: {
          observed: "Observe the SBAR card as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the closed tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the SBAR card as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the closed tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with closed tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For SBAR card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "closed-tablet-2-2", label: "closed tablet", shortLabel: "closed tablet", ariaLabel: "Investigate closed tablet",        x: 33, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the closed tablet as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the small confirmation token, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet, compare the visible evidence with small confirmation token and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed tablet as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the small confirmation token, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet, compare the visible evidence with small confirmation token and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the closed tablet and omit the related change, symptom, or safety cue. This identify option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for map disciplines, orders, tasks, and ownership." },
          { id: "i3", label: "Let a blank, unreadable, or unverified closed tablet stand in for direct RN assessment. This identify option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the closed tablet issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed tablet is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for map disciplines, orders, tasks, and ownership instead of the current controlled clinical pathway. This decide option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during map disciplines, orders, tasks, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For closed tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For closed tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the closed tablet and omit the discrepancy with small confirmation token. This document option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed tablet." },
          { id: "doc3", label: "Combine the closed tablet issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns closed tablet during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for map disciplines, orders, tasks, and ownership." },
        ],
        feedback: {
          observed: "Observe the closed tablet as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the small confirmation token, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed tablet as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the small confirmation token, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet, compare the visible evidence with small confirmation token and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For closed tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "small-confirmation-token-2-3", label: "small confirmation token", shortLabel: "small confirmation token", ariaLabel: "Investigate small confirmation token",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the small confirmation token as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small confirmation token, compare the visible evidence with SBAR card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the small confirmation token as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small confirmation token, compare the visible evidence with SBAR card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the small confirmation token as the complete assessment and do not compare the SBAR card, patient report, or current record. This identify option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for map disciplines, orders, tasks, and ownership." },
          { id: "i3", label: "Carry forward the prior visit conclusion for map disciplines, orders, tasks, and ownership without reassessing the patient today. This identify option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about small confirmation token." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small confirmation token; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small confirmation token; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the small confirmation token alone and seek clarification only after the intervention is complete. This decide option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for small confirmation token is resolved." },
          { id: "d3", label: "Defer the concern in the small confirmation token to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during map disciplines, orders, tasks, and ownership." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For small confirmation token, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For small confirmation token, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the small confirmation token was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of small confirmation token." },
          { id: "doc3", label: "Keep the small confirmation token decision in personal notes rather than the governed patient record. This document option concerns small confirmation token during map disciplines, orders, tasks, and ownership.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for map disciplines, orders, tasks, and ownership." },
        ],
        feedback: {
          observed: "Observe the small confirmation token as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the small confirmation token as patient-specific evidence for map disciplines, orders, tasks, and ownership. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for map disciplines, orders, tasks, and ownership, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small confirmation token, compare the visible evidence with SBAR card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small confirmation token; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for map disciplines, orders, tasks, and ownership. For small confirmation token, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 SBAR",
    title: "SBAR and closed-loop interdisciplinary communication",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for sbar and closed-loop interdisciplinary communication within Coordination of Care & Case Conference. Use the current controlled requirements in OP-SL-005, CL-CP-005, CL-CC-101, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — OP-SL-005, Communication Systems Requirements. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 4.1.1 ; Operations Director / IT Director ; Maintain the following communication systems: (a) agency landline telephone system; (b) secure mobile communication (HIPAA-compliant messaging/calling); (c) secure email (encrypted); (d) after-hours answering service or automated routing system; (e) fax (encrypted/HIPAA-compliant); (f) electronic referral portal (if applicable). ; Continuous. ; ; 4.1.2 ; IT Director ; Ensure all communication systems meet HIPAA encryption and security requirements per CO-HP-002 and IT-SC-003. Conduct annual security assessment. ; Annual assessment; continuous monitoring. ; ; 4.1.3 ; Operations Director ; Establish and maintain a Communication System Directory (Appendix A) listing all agency communication systems, contact numbers, access procedures, and.",
      "Controlled-policy focus — CL-CP-005, Physician Communication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; Notify the attending physician within 24 hours of identifying any of the following: (a) significant change in the patient's condition per CL-CP-002; (b) a new clinical diagnosis or finding; (c) a medication concern, adverse reaction, or potential interaction; (d) a patient safety risk identified during the home assessment per RM-PS-001; (e) a patient refusal of ordered services; (f) a missed visit that affects the patient's clinical care continuity. ; Within 24 hours of the identified event. ; ; 6.2.2 ; Assigned RN ; At a minimum of every 30 calendar days, provide the attending physician with a clinical.",
      "Controlled-policy focus — CL-CP-005, Internal Interdisciplinary Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, review the patient's plan of care with each clinical discipline involved in the patient's care within 48 hours of the SOC visit. The communication shall include: (a) the patient's primary diagnosis and relevant co-morbidities; (b) the current plan of care including all ordered services and frequencies for each discipline; (c) the patient's functional status and goals; (d) any known safety concerns; (e) the patient's caregiver situation and any limitations to care delivery. ; Within 48 hours of the SOC visit. ; ; 6.1.2 ; Assigned RN ; Document the SOC interdisciplinary communication in the clinical record..",
      "Controlled-policy focus — OP-SL-005, Backup Communication Plan. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 4.3.1 ; Operations Director / IT Director ; Maintain a communication backup plan including: (a) backup phone numbers for all key staff; (b) alternative messaging platform; (c) paper documentation forms for EHR downtime; (d) manual scheduling board procedure. ; Documented and tested annually. ; ; 4.3.2 ; IT Director ; Test backup communication systems annually. Document test results and any gaps requiring remediation. ; Annually..",
      "Controlled-policy focus — CL-CC-101, Interdisciplinary Communication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Case Manager ; Convene biweekly case conference; record participants, decisions, follow-up (event_id = idg.case.conference). ; Every 2 weeks. ; ; 6.3.2 ; Visit Clinician ; Communicate change-in-condition to physician within 24 hours; document order changes (event_id = clinical.coc). ; Within 24 hours..",
      "Apply the controlled requirements to the three visible objects in the scene for sbar and closed-loop interdisciplinary communication. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Smartphone Screen", detail: "Review the smartphone screen for the patient-specific finding. Reconcile it with the order clipboard, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Order Clipboard", detail: "Review the order clipboard for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the smartphone screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.60(d)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "smartphone-screen-3-1", label: "smartphone screen", shortLabel: "smartphone screen", ariaLabel: "Investigate smartphone screen",        x: 14, y: 44, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the smartphone screen as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the order clipboard, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For smartphone screen, compare the visible evidence with order clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the smartphone screen as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the order clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For smartphone screen, compare the visible evidence with order clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the smartphone screen and omit the related change, symptom, or safety cue. This identify option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for sbar and closed-loop interdisciplinary communication." },
          { id: "i3", label: "Let a blank, unreadable, or unverified smartphone screen stand in for direct RN assessment. This identify option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about smartphone screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to smartphone screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to smartphone screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the smartphone screen issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for smartphone screen is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for sbar and closed-loop interdisciplinary communication instead of the current controlled clinical pathway. This decide option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during sbar and closed-loop interdisciplinary communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For smartphone screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For smartphone screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the smartphone screen and omit the discrepancy with order clipboard. This document option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of smartphone screen." },
          { id: "doc3", label: "Combine the smartphone screen issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns smartphone screen during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for sbar and closed-loop interdisciplinary communication." },
        ],
        feedback: {
          observed: "Observe the smartphone screen as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the order clipboard, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the smartphone screen as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the order clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For smartphone screen, compare the visible evidence with order clipboard and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to smartphone screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For smartphone screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "order-clipboard-3-2", label: "order clipboard", shortLabel: "order clipboard", ariaLabel: "Investigate order clipboard",        x: 35, y: 39, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the order clipboard as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the order clipboard as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the order clipboard as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for sbar and closed-loop interdisciplinary communication." },
          { id: "i3", label: "Carry forward the prior visit conclusion for sbar and closed-loop interdisciplinary communication without reassessing the patient today. This identify option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about order clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the order clipboard alone and seek clarification only after the intervention is complete. This decide option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for order clipboard is resolved." },
          { id: "d3", label: "Defer the concern in the order clipboard to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during sbar and closed-loop interdisciplinary communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For order clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For order clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the order clipboard was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of order clipboard." },
          { id: "doc3", label: "Keep the order clipboard decision in personal notes rather than the governed patient record. This document option concerns order clipboard during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for sbar and closed-loop interdisciplinary communication." },
        ],
        feedback: {
          observed: "Observe the order clipboard as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the order clipboard as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For order clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to order clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For order clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "stethoscope-3-3", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the stethoscope as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the smartphone screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with smartphone screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the smartphone screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with smartphone screen and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for sbar and closed-loop interdisciplinary communication." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and smartphone screen because one source appears more convenient. This identify option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during sbar and closed-loop interdisciplinary communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior sbar and closed-loop interdisciplinary communication narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during sbar and closed-loop interdisciplinary communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for sbar and closed-loop interdisciplinary communication." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the smartphone screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for sbar and closed-loop interdisciplinary communication. Compare it with the smartphone screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for sbar and closed-loop interdisciplinary communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with smartphone screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for sbar and closed-loop interdisciplinary communication. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Case",
    title: "Case conference preparation and decision capture",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for case conference preparation and decision capture within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CC-101, CL-CP-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CC-101, Interdisciplinary Communication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Case Manager ; Convene biweekly case conference; record participants, decisions, follow-up (event_id = idg.case.conference). ; Every 2 weeks. ; ; 6.3.2 ; Visit Clinician ; Communicate change-in-condition to physician within 24 hours; document order changes (event_id = clinical.coc). ; Within 24 hours..",
      "Controlled-policy focus — CL-CP-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Physician is non-responsive to care coordination communications ; Director of Nursing escalates after two unanswered contacts ; Director of Nursing contacts the physician's office administrator or practice manager directly. If patient safety is at risk, Director of Nursing may contact covering physician or on-call physician. Documents all attempts. ; Director of Nursing escalation after second unanswered contact; immediately for patient safety concerns. ; ; Two or more disciplines are providing conflicting care instructions to the patient ; Director of Nursing convenes an urgent care conference ; Director of Nursing facilitates an interdisciplinary care conference within 48 hours, identifies the source of the.",
      "Controlled-policy focus — CL-CP-005, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Interdisciplinary care conference documented within 14 days for patients with 3+ disciplines ; Audit of care coordination notes and conference dates ; ≥95% of qualifying patients with documented care conference within 14 calendar days of SOC ; ; All significant changes result in physician notification within 24 hours ; Audit of physician communication notes against visit notes with documented clinical changes ; ≥95% compliance ; ; All community resource referrals documented ; Audit of referral documentation in clinical records ; ≥95% of referrals documented with required elements ; ; Warm handoffs documented for all transfers and discharges ; Audit of transition documentation ; ≥95%.",
      "Controlled-policy focus — CL-CP-005, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; SOC interdisciplinary communication ; Care Coordination Note in clinical record ; Assigned RN ; EHR — coordination notes ; Within 48 hours of SOC ; ; Care conference documentation ; Structured care conference note including participants and outcomes ; Assigned RN / Director of Nursing ; EHR — coordination notes ; Within 24 hours of conference ; ; Physician communication notes ; Documentation of all physician contacts per Section 6.2.3 ; Assigned RN ; EHR — communication notes ; Within 24 hours of each contact ; ; Transition documentation receipt ; Documentation of receipt of inpatient discharge documents.",
      "Controlled-policy focus — CL-CP-005, Internal Interdisciplinary Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, review the patient's plan of care with each clinical discipline involved in the patient's care within 48 hours of the SOC visit. The communication shall include: (a) the patient's primary diagnosis and relevant co-morbidities; (b) the current plan of care including all ordered services and frequencies for each discipline; (c) the patient's functional status and goals; (d) any known safety concerns; (e) the patient's caregiver situation and any limitations to care delivery. ; Within 48 hours of the SOC visit. ; ; 6.1.2 ; Assigned RN ; Document the SOC interdisciplinary communication in the clinical record..",
      "Apply the controlled requirements to the three visible objects in the scene for case conference preparation and decision capture. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Round Table", detail: "Review the round table for the patient-specific finding. Reconcile it with the care-plan folder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Care-plan Folder", detail: "Review the care-plan folder for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the round table, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60(d)" },
      { kind: "External Authority", text: "42 CFR §484.55(c)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "round-table-4-1", label: "round table", shortLabel: "round table", ariaLabel: "Investigate round table",        x: 19, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the round table as patient-specific evidence for case conference preparation and decision capture. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For round table, compare the visible evidence with care-plan folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the round table as patient-specific evidence for case conference preparation and decision capture. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For round table, compare the visible evidence with care-plan folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the round table as the complete assessment and do not compare the care-plan folder, patient report, or current record. This identify option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for case conference preparation and decision capture." },
          { id: "i3", label: "Carry forward the prior visit conclusion for case conference preparation and decision capture without reassessing the patient today. This identify option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about round table." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to round table; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to round table; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the round table alone and seek clarification only after the intervention is complete. This decide option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for round table is resolved." },
          { id: "d3", label: "Defer the concern in the round table to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during case conference preparation and decision capture." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For round table, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For round table, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the round table was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of round table." },
          { id: "doc3", label: "Keep the round table decision in personal notes rather than the governed patient record. This document option concerns round table during case conference preparation and decision capture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for case conference preparation and decision capture." },
        ],
        feedback: {
          observed: "Observe the round table as patient-specific evidence for case conference preparation and decision capture. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the round table as patient-specific evidence for case conference preparation and decision capture. Compare it with the care-plan folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For round table, compare the visible evidence with care-plan folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to round table; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For round table, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "care-plan-folder-4-2", label: "care-plan folder", shortLabel: "care-plan folder", ariaLabel: "Investigate care-plan folder",        x: 29, y: 77, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the care-plan folder as patient-specific evidence for case conference preparation and decision capture. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the care-plan folder as patient-specific evidence for case conference preparation and decision capture. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Assume the care-plan folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for case conference preparation and decision capture." },
          { id: "i3", label: "Dismiss the conflict between the care-plan folder and tablet because one source appears more convenient. This identify option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the care-plan folder without confirming an applicable order and patient-specific authority. This decide option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for care-plan folder is resolved." },
          { id: "d3", label: "Hand the care-plan folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during case conference preparation and decision capture." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For care-plan folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For care-plan folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the care-plan folder before reassessment confirms the patient response. This document option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of care-plan folder." },
          { id: "doc3", label: "Copy the prior case conference preparation and decision capture narrative even though today’s care-plan folder evidence is different. This document option concerns care-plan folder during case conference preparation and decision capture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for case conference preparation and decision capture." },
        ],
        feedback: {
          observed: "Observe the care-plan folder as patient-specific evidence for case conference preparation and decision capture. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the care-plan folder as patient-specific evidence for case conference preparation and decision capture. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For care-plan folder, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to care-plan folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For care-plan folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "tablet-4-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 82, y: 53, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the tablet as patient-specific evidence for case conference preparation and decision capture. Compare it with the round table, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with round table and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for case conference preparation and decision capture. Compare it with the round table, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with round table and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tablet and omit the related change, symptom, or safety cue. This identify option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for case conference preparation and decision capture." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tablet stand in for direct RN assessment. This identify option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tablet issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for case conference preparation and decision capture instead of the current controlled clinical pathway. This decide option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during case conference preparation and decision capture." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tablet and omit the discrepancy with round table. This document option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Combine the tablet issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tablet during case conference preparation and decision capture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for case conference preparation and decision capture." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for case conference preparation and decision capture. Compare it with the round table, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for case conference preparation and decision capture. Compare it with the round table, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for case conference preparation and decision capture, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with round table and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for case conference preparation and decision capture. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Missed",
    title: "Missed visits, conflicting recommendations, and service gaps",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for missed visits, conflicting recommendations, and service gaps within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CP-005, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-005, External Provider Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; MSW / Assigned RN ; Identify all community resources, services, and external providers relevant to the patient's needs at SOC or as needs emerge during the episode. Community resources may include: senior transportation services, meal delivery programs, adult day health programs, support groups, financial assistance programs, community mental health services, and homemaker services. ; At SOC; ongoing as needs are identified. ; ; 6.4.2 ; MSW / Assigned RN ; Facilitate referrals to appropriate community resources and external providers. Document all referrals in the clinical record including: (a) the resource or provider; (b) the reason for referral; (c) the date the.",
      "Controlled-policy focus — CL-CP-002, 4\\. Policy Statement. 4.1 The plan of care for every active patient shall be formally reviewed by the responsible registered nurse at a minimum of every 30 calendar days during the certification period, regardless of whether a change is indicated. 4.2 The plan of care shall be comprehensively reviewed and updated at each recertification period — no later than every 60 calendar days — and the updated plan of care shall be transmitted to and signed by the certifying physician within the recertification timeline defined in policy CL-CP-008. 4.3 A plan of care modification shall be initiated within 24 hours whenever any of the following significant change conditions are identified: (a) a new diagnosis or significant worsening of an existing diagnosis.",
      "Controlled-policy focus — CL-CP-002, Routine 30-Day Plan of Care Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Conduct a formal plan of care review at a minimum of every 30 calendar days during each certification period. The review shall assess: (a) the patient's current clinical status compared to the status at SOC or last review; (b) progress toward each short-term and long-term goal — with specific measurable notation of progress, plateau, or regression; (c) whether the current service type and frequency remain appropriate; (d) whether any new diagnosis, medication change, or functional change has occurred that requires a plan modification; (e) whether the patient is on track for discharge within the anticipated episode timeframe; (f).",
      "Controlled-policy focus — CL-CP-002, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; 30-day review not completed within required timeframe ; Director of Nursing identifies during supervisory review ; Director of Nursing directs the assigned RN to complete the review immediately. Review completion documented. Persistent non-compliance addressed through HR-ER-002. ; Review completed within 3 calendar days of identification. ; ; Significant change identified but physician not notified within 24 hours ; Director of Nursing reviews and contacts physician directly ; Director of Nursing contacts physician and documents the contact. Evaluates whether the delay caused any clinical harm. If harm is suspected, initiates incident reporting per RM-ER-002. ; Director of Nursing contact within 24 hours of.",
      "Controlled-policy focus — CL-CP-002, Documentation of Discharge Planning Integration. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assigned RN ; At each 30-day review and at recertification, document the patient's current estimated discharge date and discharge criteria. If the estimated discharge date has changed, document the reason for the change (e.g., slower progress, new diagnosis, new goals). ; At each review. ; ; 6.4.2 ; Assigned RN ; If a patient reaches the 90th day of continuous home health services without a documented discharge plan, escalate to the Director of Nursing for a clinical necessity review. The Director of Nursing shall determine whether continued services are medically necessary and shall consult with the physician. ; At or before.",
      "Apply the controlled requirements to the three visible objects in the scene for missed visits, conflicting recommendations, and service gaps. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Two Care Folders", detail: "Review the two care folders for the patient-specific finding. Reconcile it with the neutral priority token, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Neutral Priority Token", detail: "Review the neutral priority token for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the two care folders, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.55(c)" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "two-care-folders-5-1", label: "two care folders", shortLabel: "two care folders", ariaLabel: "Investigate two care folders",        x: 14, y: 67, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the two care folders as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the neutral priority token, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two care folders, compare the visible evidence with neutral priority token and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the two care folders as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the neutral priority token, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two care folders, compare the visible evidence with neutral priority token and the controlling source before classifying status." },
          { id: "i2", label: "Assume the two care folders establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for missed visits, conflicting recommendations, and service gaps." },
          { id: "i3", label: "Dismiss the conflict between the two care folders and neutral priority token because one source appears more convenient. This identify option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about two care folders." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two care folders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two care folders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the two care folders without confirming an applicable order and patient-specific authority. This decide option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for two care folders is resolved." },
          { id: "d3", label: "Hand the two care folders concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during missed visits, conflicting recommendations, and service gaps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For two care folders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For two care folders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the two care folders before reassessment confirms the patient response. This document option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two care folders." },
          { id: "doc3", label: "Copy the prior missed visits, conflicting recommendations, and service gaps narrative even though today’s two care folders evidence is different. This document option concerns two care folders during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for missed visits, conflicting recommendations, and service gaps." },
        ],
        feedback: {
          observed: "Observe the two care folders as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the neutral priority token, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the two care folders as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the neutral priority token, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two care folders, compare the visible evidence with neutral priority token and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two care folders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For two care folders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "neutral-priority-token-5-2", label: "neutral priority token", shortLabel: "neutral priority token", ariaLabel: "Investigate neutral priority token",        x: 36, y: 46, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the neutral priority token as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral priority token, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the neutral priority token as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral priority token, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the neutral priority token and omit the related change, symptom, or safety cue. This identify option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for missed visits, conflicting recommendations, and service gaps." },
          { id: "i3", label: "Let a blank, unreadable, or unverified neutral priority token stand in for direct RN assessment. This identify option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about neutral priority token." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral priority token; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral priority token; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the neutral priority token issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for neutral priority token is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for missed visits, conflicting recommendations, and service gaps instead of the current controlled clinical pathway. This decide option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during missed visits, conflicting recommendations, and service gaps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For neutral priority token, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For neutral priority token, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the neutral priority token and omit the discrepancy with tablet. This document option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of neutral priority token." },
          { id: "doc3", label: "Combine the neutral priority token issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns neutral priority token during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for missed visits, conflicting recommendations, and service gaps." },
        ],
        feedback: {
          observed: "Observe the neutral priority token as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the neutral priority token as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For neutral priority token, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to neutral priority token; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For neutral priority token, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "tablet-5-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 79, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the tablet as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the two care folders, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with two care folders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the two care folders, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with two care folders and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the two care folders, patient report, or current record. This identify option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for missed visits, conflicting recommendations, and service gaps." },
          { id: "i3", label: "Carry forward the prior visit conclusion for missed visits, conflicting recommendations, and service gaps without reassessing the patient today. This identify option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during missed visits, conflicting recommendations, and service gaps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during missed visits, conflicting recommendations, and service gaps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for missed visits, conflicting recommendations, and service gaps." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the two care folders, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for missed visits, conflicting recommendations, and service gaps. Compare it with the two care folders, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for missed visits, conflicting recommendations, and service gaps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with two care folders and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for missed visits, conflicting recommendations, and service gaps. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Change-",
    title: "Change-in-condition coordination and provider follow-through",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for change-in-condition coordination and provider follow-through within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CP-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-005, External Provider Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; MSW / Assigned RN ; Identify all community resources, services, and external providers relevant to the patient's needs at SOC or as needs emerge during the episode. Community resources may include: senior transportation services, meal delivery programs, adult day health programs, support groups, financial assistance programs, community mental health services, and homemaker services. ; At SOC; ongoing as needs are identified. ; ; 6.4.2 ; MSW / Assigned RN ; Facilitate referrals to appropriate community resources and external providers. Document all referrals in the clinical record including: (a) the resource or provider; (b) the reason for referral; (c) the date the.",
      "Controlled-policy focus — CL-CP-005, Internal Interdisciplinary Coordination. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At SOC, review the patient's plan of care with each clinical discipline involved in the patient's care within 48 hours of the SOC visit. The communication shall include: (a) the patient's primary diagnosis and relevant co-morbidities; (b) the current plan of care including all ordered services and frequencies for each discipline; (c) the patient's functional status and goals; (d) any known safety concerns; (e) the patient's caregiver situation and any limitations to care delivery. ; Within 48 hours of the SOC visit. ; ; 6.1.2 ; Assigned RN ; Document the SOC interdisciplinary communication in the clinical record..",
      "Controlled-policy focus — CL-CP-005, 9\\. References. Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60(c) ; Standard: Coordination of care ; Primary regulatory basis ; ; 42 CFR § 484.60(d) ; Standard: Written information provided to the patient ; Coordination includes patient education about the care plan ; 9.4 Cross-Referenced Agency Policies ; Policy ID ; Policy Title ; Relationship ; ; ; ; ; ; CL-CP-001 ; Plan of Care Development & Approval ; Plan of care is the foundation of care coordination ; ; CL-CP-002 ; Plan of Care Review & Update ; Review triggers coordination communications ; ; CL-CP-003 ; Physician Orders & Order Management ; All coordination-driven changes require orders ; ; CL-CP-006.",
      "Controlled-policy focus — CL-CP-005, 5\\. Definitions. Term ; Definition ; ; ; ; ; Coordination of Care ; The deliberate organization of patient care activities between two or more participants (including the patient) involved in a patient's care to facilitate the appropriate delivery of health care services, sharing information among participants concerning patient needs, and using that information to maximize the quality and effectiveness of delivered care. ; ; Interdisciplinary Communication ; Clinical communication among two or more members of the patient's care team that occurs with the explicit purpose of coordinating the patient's plan of care, sharing clinical findings, or addressing care concerns. ; ; Care Conference ; A structured, documented communication event involving two or more clinical disciplines and/or the patient and.",
      "Controlled-policy focus — CL-CP-005, 2\\. Purpose. This policy mandates the coordination of services among all disciplines involved in a patient's care at Care Indeed Home Health Care, Inc. and with external providers — including physicians, hospitals, skilled nursing facilities, pharmacies, community agencies, and other healthcare entities — involved in the patient's overall care. Coordination of care is not merely a documentation requirement; it is a clinical and ethical imperative that directly affects patient outcomes, patient safety, and the efficiency of care delivery. Fragmented care — where disciplines operate in silos, where the attending physician is not kept current on the patient's status, or where the home health team is unaware of care provided by other providers — creates clinical risk, medication errors, unnecessary hospitalizations.",
      "Apply the controlled requirements to the three visible objects in the scene for change-in-condition coordination and provider follow-through. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Plan Binder", detail: "Review the plan binder for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the three discipline tokens, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Three Discipline Tokens", detail: "Review the three discipline tokens for the patient-specific finding. Reconcile it with the plan binder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.60(a)" },
      { kind: "External Authority", text: "42 CFR §484.60(b)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "plan-binder-6-1", label: "plan binder", shortLabel: "plan binder", ariaLabel: "Investigate plan binder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the plan binder as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the plan binder as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the plan binder and omit the related change, symptom, or safety cue. This identify option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition coordination and provider follow-through." },
          { id: "i3", label: "Let a blank, unreadable, or unverified plan binder stand in for direct RN assessment. This identify option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about plan binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the plan binder issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for plan binder is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for change-in-condition coordination and provider follow-through instead of the current controlled clinical pathway. This decide option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition coordination and provider follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For plan binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For plan binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the plan binder and omit the discrepancy with phone. This document option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of plan binder." },
          { id: "doc3", label: "Combine the plan binder issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns plan binder during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition coordination and provider follow-through." },
        ],
        feedback: {
          observed: "Observe the plan binder as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the plan binder as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For plan binder, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to plan binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For plan binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "phone-6-2", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 31, y: 58, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the phone as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the three discipline tokens, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with three discipline tokens and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the three discipline tokens, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with three discipline tokens and the controlling source before classifying status." },
          { id: "i2", label: "Treat the phone as the complete assessment and do not compare the three discipline tokens, patient report, or current record. This identify option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition coordination and provider follow-through." },
          { id: "i3", label: "Carry forward the prior visit conclusion for change-in-condition coordination and provider follow-through without reassessing the patient today. This identify option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the phone alone and seek clarification only after the intervention is complete. This decide option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition coordination and provider follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the phone was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Keep the phone decision in personal notes rather than the governed patient record. This document option concerns phone during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition coordination and provider follow-through." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the three discipline tokens, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the three discipline tokens, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with three discipline tokens and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "three-discipline-tokens-6-3", label: "three discipline tokens", shortLabel: "three discipline tokens", ariaLabel: "Investigate three discipline tokens",        x: 77, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the three discipline tokens as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three discipline tokens, compare the visible evidence with plan binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the three discipline tokens as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three discipline tokens, compare the visible evidence with plan binder and the controlling source before classifying status." },
          { id: "i2", label: "Assume the three discipline tokens establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition coordination and provider follow-through." },
          { id: "i3", label: "Dismiss the conflict between the three discipline tokens and plan binder because one source appears more convenient. This identify option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about three discipline tokens." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three discipline tokens; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three discipline tokens; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the three discipline tokens without confirming an applicable order and patient-specific authority. This decide option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for three discipline tokens is resolved." },
          { id: "d3", label: "Hand the three discipline tokens concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition coordination and provider follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For three discipline tokens, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For three discipline tokens, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the three discipline tokens before reassessment confirms the patient response. This document option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of three discipline tokens." },
          { id: "doc3", label: "Copy the prior change-in-condition coordination and provider follow-through narrative even though today’s three discipline tokens evidence is different. This document option concerns three discipline tokens during change-in-condition coordination and provider follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition coordination and provider follow-through." },
        ],
        feedback: {
          observed: "Observe the three discipline tokens as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the three discipline tokens as patient-specific evidence for change-in-condition coordination and provider follow-through. Compare it with the plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition coordination and provider follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three discipline tokens, compare the visible evidence with plan binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three discipline tokens; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition coordination and provider follow-through. For three discipline tokens, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Documen",
    title: "Document unresolved tasks, updates, and accountable next steps",
    subtitle: "Coordination of Care & Case Conference",
    narration: [
      "This lesson develops registered-nurse reasoning for document unresolved tasks, updates, and accountable next steps within Coordination of Care & Case Conference. Use the current controlled requirements in CL-CP-005, CL-CP-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-005, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-005. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-002, 8\\. Compliance & Audit Considerations. Compliance is monitored under annual governance with targeted audits for CL-CP-002. ; Control ; Method ; Minimum Standard ; ; ; ; ; ; CoP and Title 22 adherence ; Chart/document review mapped to 42 CFR §484.110 and 22 CCR §74731 ; 95%+ conformance with corrective action for any variance ; ; Documentation completeness ; Monthly sample review and exception tracking ; 100% required artifacts present ; ; Procedure execution reliability ; Workflow timing and task completion audit ; 100% critical steps completed within required timeframe.",
      "Controlled-policy focus — CL-CP-005, 3\\. Scope. This policy applies to: All registered nurses managing patient care All clinical disciplines (PT, OT, SLP, MSW) providing patient services The Director of Nursing / Clinical Manager The Medical Social Worker (primary community resource coordination role) Operations staff managing scheduling and visit logistics The attending physician and referring providers Intake and discharge planning staff.",
      "Controlled-policy focus — CL-CP-005, 6\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 1 ; Director of Nursing ; Review policy requirements and confirm role-based responsibilities for CL-CP-005. ; Prior to implementation and at annual review. ; ; 2 ; Assigned Staff ; Execute coordination of care activities using approved tools, forms, and documentation standards. ; At point of care/operation and as events occur. ; ; 3 ; Compliance Officer / Designee ; Audit completion, remediate variances, and document corrective actions in the compliance log. ; Monthly and within 5 business days of identified variance..",
      "Controlled-policy focus — CL-CP-005, Transition from Inpatient Setting. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN ; For all patients transitioning from a hospital or SNF to home health, obtain from the sending facility: (a) the discharge summary (or, if not yet available, a transfer summary or face sheet); (b) the current medication reconciliation list; (c) any pending laboratory or diagnostic test results; (d) follow-up physician appointments scheduled; (e) any pending specialist referrals; (f) a list of all care providers seen during the inpatient stay. If documentation is not available at the time of the SOC visit, contact the facility directly and document the request. ; Obtained before or at the SOC visit; if unavailable.",
      "Apply the controlled requirements to the three visible objects in the scene for document unresolved tasks, updates, and accountable next steps. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Action Board", detail: "Review the action board for the patient-specific finding. Reconcile it with the confirmation tokens, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Confirmation Tokens", detail: "Review the confirmation tokens for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the action board, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-005" },
      { kind: "Controlled Policy", text: "CL-CC-101" },
      { kind: "Controlled Policy", text: "OP-SL-005" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "External Authority", text: "42 CFR §484.60(b)" },
      { kind: "External Authority", text: "42 CFR §484.60(c)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "action-board-7-1", label: "action board", shortLabel: "action board", ariaLabel: "Investigate action board",        x: 16, y: 72, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the action board as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the confirmation tokens, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For action board, compare the visible evidence with confirmation tokens and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the action board as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the confirmation tokens, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For action board, compare the visible evidence with confirmation tokens and the controlling source before classifying status." },
          { id: "i2", label: "Treat the action board as the complete assessment and do not compare the confirmation tokens, patient report, or current record. This identify option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document unresolved tasks, updates, and accountable next steps." },
          { id: "i3", label: "Carry forward the prior visit conclusion for document unresolved tasks, updates, and accountable next steps without reassessing the patient today. This identify option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about action board." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to action board; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to action board; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the action board alone and seek clarification only after the intervention is complete. This decide option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for action board is resolved." },
          { id: "d3", label: "Defer the concern in the action board to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document unresolved tasks, updates, and accountable next steps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For action board, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For action board, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the action board was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of action board." },
          { id: "doc3", label: "Keep the action board decision in personal notes rather than the governed patient record. This document option concerns action board during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document unresolved tasks, updates, and accountable next steps." },
        ],
        feedback: {
          observed: "Observe the action board as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the confirmation tokens, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the action board as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the confirmation tokens, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For action board, compare the visible evidence with confirmation tokens and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to action board; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For action board, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "confirmation-tokens-7-2", label: "confirmation tokens", shortLabel: "confirmation tokens", ariaLabel: "Investigate confirmation tokens",        x: 57, y: 70, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the confirmation tokens as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For confirmation tokens, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the confirmation tokens as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For confirmation tokens, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the confirmation tokens establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document unresolved tasks, updates, and accountable next steps." },
          { id: "i3", label: "Dismiss the conflict between the confirmation tokens and phone because one source appears more convenient. This identify option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about confirmation tokens." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to confirmation tokens; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to confirmation tokens; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the confirmation tokens without confirming an applicable order and patient-specific authority. This decide option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for confirmation tokens is resolved." },
          { id: "d3", label: "Hand the confirmation tokens concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document unresolved tasks, updates, and accountable next steps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For confirmation tokens, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For confirmation tokens, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the confirmation tokens before reassessment confirms the patient response. This document option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of confirmation tokens." },
          { id: "doc3", label: "Copy the prior document unresolved tasks, updates, and accountable next steps narrative even though today’s confirmation tokens evidence is different. This document option concerns confirmation tokens during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document unresolved tasks, updates, and accountable next steps." },
        ],
        feedback: {
          observed: "Observe the confirmation tokens as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the confirmation tokens as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For confirmation tokens, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to confirmation tokens; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For confirmation tokens, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
      {
        id: "phone-7-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 80, y: 38, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the phone as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the action board, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with action board and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the action board, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with action board and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document unresolved tasks, updates, and accountable next steps." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for document unresolved tasks, updates, and accountable next steps instead of the current controlled clinical pathway. This decide option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document unresolved tasks, updates, and accountable next steps." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with action board. This document option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during document unresolved tasks, updates, and accountable next steps.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document unresolved tasks, updates, and accountable next steps." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the action board, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for document unresolved tasks, updates, and accountable next steps. Compare it with the action board, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document unresolved tasks, updates, and accountable next steps, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with action board and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document unresolved tasks, updates, and accountable next steps. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CP-005","CL-CC-101","OP-SL-005","CL-CP-002","42 CFR § 484.60(c)","42 CFR § 484.60","42 CFR §484.110","42 CFR § 484.60(d)","42 CFR §484.55(c)","42 CFR §484.60(a)","42 CFR §484.60(b)","42 CFR §484.60(c)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During rn case-management accountability and unified goals, the neutral task tokens without writing conflicts with the care binder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the neutral task tokens without writing to the next routine visit even though its current clinical significance has not been assessed. This option concerns rn case-management accountability and unified goals.",
      "Assume the care binder is unchanged from the prior encounter and omit patient-specific reassessment during rn case-management accountability and unified goals.",
      "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the neutral task tokens without writing alone and seek clarification only after the intervention is complete. This option concerns rn case-management accountability and unified goals.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for rn case-management accountability and unified goals within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 2,
    stem: "During map disciplines, orders, tasks, and ownership, the small confirmation token conflicts with the SBAR card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the small confirmation token without confirming an applicable order and patient-specific authority. This option concerns map disciplines, orders, tasks, and ownership.",
      "Hand the small confirmation token concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns map disciplines, orders, tasks, and ownership.",
      "Assume the SBAR card is unchanged from the prior encounter and omit patient-specific reassessment during map disciplines, orders, tasks, and ownership.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for map disciplines, orders, tasks, and ownership within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 3,
    stem: "During sbar and closed-loop interdisciplinary communication, the stethoscope conflicts with the smartphone screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns sbar and closed-loop interdisciplinary communication.",
      "Use a familiar local shortcut for sbar and closed-loop interdisciplinary communication instead of the current controlled clinical pathway. This option concerns sbar and closed-loop interdisciplinary communication.",
      "Assume the smartphone screen is unchanged from the prior encounter and omit patient-specific reassessment during sbar and closed-loop interdisciplinary communication.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for sbar and closed-loop interdisciplinary communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 4,
    stem: "During case conference preparation and decision capture, the tablet conflicts with the round table and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the round table is unchanged from the prior encounter and omit patient-specific reassessment during case conference preparation and decision capture.",
      "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This option concerns case conference preparation and decision capture.",
      "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the tablet alone and seek clarification only after the intervention is complete. This option concerns case conference preparation and decision capture.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for case conference preparation and decision capture within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 5,
    stem: "During missed visits, conflicting recommendations, and service gaps, the tablet conflicts with the two care folders and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the two care folders is unchanged from the prior encounter and omit patient-specific reassessment during missed visits, conflicting recommendations, and service gaps.",
      "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns missed visits, conflicting recommendations, and service gaps.",
      "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This option concerns missed visits, conflicting recommendations, and service gaps.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for missed visits, conflicting recommendations, and service gaps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 6,
    stem: "During change-in-condition coordination and provider follow-through, the three discipline tokens conflicts with the plan binder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the plan binder is unchanged from the prior encounter and omit patient-specific reassessment during change-in-condition coordination and provider follow-through.",
      "Use a familiar local shortcut for change-in-condition coordination and provider follow-through instead of the current controlled clinical pathway. This option concerns change-in-condition coordination and provider follow-through.",
      "Close the three discipline tokens issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns change-in-condition coordination and provider follow-through.",
      "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for change-in-condition coordination and provider follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 7,
    stem: "During document unresolved tasks, updates, and accountable next steps, the phone conflicts with the action board and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the action board is unchanged from the prior encounter and omit patient-specific reassessment during document unresolved tasks, updates, and accountable next steps.",
      "Proceed using the phone alone and seek clarification only after the intervention is complete. This option concerns document unresolved tasks, updates, and accountable next steps.",
      "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This option concerns document unresolved tasks, updates, and accountable next steps.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for document unresolved tasks, updates, and accountable next steps within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CP-005, CL-CC-101, OP-SL-005, CL-CP-002.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60(c) be used when applying Coordination of Care & Case Conference?",
    options: [
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
    ],
    correct: 0,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the SBAR card and three discipline tokens into defensible RN practice for Coordination of Care & Case Conference?",
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
    stem: "What does successful completion of Coordination of Care & Case Conference establish?",
    options: [
      "Automatic authority to perform every activity discussed in Coordination of Care & Case Conference without supervision.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in Coordination of Care & Case Conference, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
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


const STORAGE_KEY = 'rn-011-progress-v6000';

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

export default function RN011() {
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
          <span className="brand-text">RN-011 — Coordination</span>
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
