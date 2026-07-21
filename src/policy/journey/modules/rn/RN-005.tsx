/**
 * RN-005 — Skilled Nursing Documentation Standards
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
import img01 from './assets/rn-005/rn-005-lesson-01.png';
import img02 from './assets/rn-005/rn-005-lesson-02.png';
import img03 from './assets/rn-005/rn-005-lesson-03.png';
import img04 from './assets/rn-005/rn-005-lesson-04.png';
import img05 from './assets/rn-005/rn-005-lesson-05.png';
import img06 from './assets/rn-005/rn-005-lesson-06.png';
import img07 from './assets/rn-005/rn-005-lesson-07.png';

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

const MODULE_META = { id: "RN-005", title: "Skilled Nursing Documentation Standards", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Clinical record as evidence and communication, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Objective patient-specific assessment, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Link findings to skilled judgment and intervention, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Timely completion and required elements, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Corrections, late entries, addenda, authentication, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Orders, notifications, and closed-loop follow-through, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Final note audit and competency boundary, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Clinica",
    title: "Clinical record as evidence and communication",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for clinical record as evidence and communication within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-DC-101, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, General Clinical Documentation Requirements — All Disciplines. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; All Clinicians ; Every visit note and clinical record entry shall be individualized to the specific patient and the specific visit. Before beginning a visit note, do not copy forward any prior note. Start from the current clinical encounter and document what was observed, assessed, and done at this visit, for this patient, today. ; At each visit. ; ; 6.1.2 ; All Clinicians ; Every visit note shall be written in specific, clinical, observation-based language. Avoid vague terms that do not communicate meaningful clinical information: \"patient doing well,\" \"no changes noted,\" \"patient tolerates,\" \"stable,\" \"routine visit,\" \"nursing visit.\" These phrases.",
      "Controlled-policy focus — CL-CD-001, 4\\. Policy Statement. 4.1 Every entry in a patient's clinical record shall be: accurate — reflecting what was actually observed, assessed, performed, and communicated; complete — containing all required elements for the type of entry; timely — created within the timeframe specified for the entry type; legible — clearly readable in the format used (electronic or written); authenticated — identified with the author's name, credential, date, and time; and consistent — aligned with all related entries in the clinical record. 4.2 Every clinical record entry shall be individualized to the specific patient, the specific visit, and the specific clinical situation. Template-driven documentation that does not reflect the actual clinical encounter is prohibited. Copy-forward of prior entries without independent verification and documentation.",
      "Controlled-policy focus — CL-CD-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Clinical Record ; The complete, permanent collection of all clinical documentation for a patient — encompassing assessments, visit notes, care coordination records, physician orders, OASIS data, plan of care documents, and all other records created in connection with the patient's home health episode. ; ; Visit Note ; The clinical documentation entry created by a clinician for each patient visit, documenting the patient's status, the clinical services provided, the patient's response, education delivered, and the plan for follow-up. ; ; Authentication ; The process by which an entry in the clinical record is identified as the work of a specific clinician, accomplished by the clinician's signature (electronic or physical) including.",
      "Controlled-policy focus — CL-DC-101, Evidence & Traceability (per EN-WF-101). Every clinical note creation, edit, attestation, copy-forward action, AI-assist event, late entry, and amendment persists to the Evidence Repository with policy_id = CL-DC-101, workflow_id, event_id, patient_id, episode_id, visit_id, user_id, clinician_role, timestamp, device/ip, ai_assist_flag, ai_model_id (where applicable), copy_forward_source_ids, attestation_hash. Evidence is immutable and surveyor-retrievable..",
      "Apply the controlled requirements to the three visible objects in the scene for clinical record as evidence and communication. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet With Completely", detail: "Review the tablet with completely for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the paper notepad, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Paper Notepad", detail: "Review the paper notepad for the patient-specific finding. Reconcile it with the tablet with completely, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.110" },
      { kind: "External Authority", text: "42 CFR § 484.110(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "tablet-with-completely-1-1", label: "tablet with completely", shortLabel: "tablet with completely", ariaLabel: "Investigate tablet with completely",        x: 23, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the tablet with completely as patient-specific evidence for clinical record as evidence and communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with completely, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet with completely as patient-specific evidence for clinical record as evidence and communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with completely, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet with completely as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for clinical record as evidence and communication." },
          { id: "i3", label: "Carry forward the prior visit conclusion for clinical record as evidence and communication without reassessing the patient today. This identify option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet with completely." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with completely; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with completely; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet with completely alone and seek clarification only after the intervention is complete. This decide option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet with completely is resolved." },
          { id: "d3", label: "Defer the concern in the tablet with completely to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during clinical record as evidence and communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For tablet with completely, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For tablet with completely, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet with completely was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet with completely." },
          { id: "doc3", label: "Keep the tablet with completely decision in personal notes rather than the governed patient record. This document option concerns tablet with completely during clinical record as evidence and communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical record as evidence and communication." },
        ],
        feedback: {
          observed: "Observe the tablet with completely as patient-specific evidence for clinical record as evidence and communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet with completely as patient-specific evidence for clinical record as evidence and communication. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet with completely, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet with completely; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For tablet with completely, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "stethoscope-1-2", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 39, y: 68, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the stethoscope as patient-specific evidence for clinical record as evidence and communication. Compare it with the paper notepad, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with paper notepad and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for clinical record as evidence and communication. Compare it with the paper notepad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with paper notepad and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for clinical record as evidence and communication." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and paper notepad because one source appears more convenient. This identify option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during clinical record as evidence and communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior clinical record as evidence and communication narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during clinical record as evidence and communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical record as evidence and communication." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for clinical record as evidence and communication. Compare it with the paper notepad, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for clinical record as evidence and communication. Compare it with the paper notepad, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with paper notepad and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "paper-notepad-1-3", label: "paper notepad", shortLabel: "paper notepad", ariaLabel: "Investigate paper notepad",        x: 76, y: 46, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the paper notepad as patient-specific evidence for clinical record as evidence and communication. Compare it with the tablet with completely, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper notepad, compare the visible evidence with tablet with completely and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the paper notepad as patient-specific evidence for clinical record as evidence and communication. Compare it with the tablet with completely, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper notepad, compare the visible evidence with tablet with completely and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the paper notepad and omit the related change, symptom, or safety cue. This identify option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for clinical record as evidence and communication." },
          { id: "i3", label: "Let a blank, unreadable, or unverified paper notepad stand in for direct RN assessment. This identify option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about paper notepad." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper notepad; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper notepad; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the paper notepad issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for paper notepad is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for clinical record as evidence and communication instead of the current controlled clinical pathway. This decide option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during clinical record as evidence and communication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For paper notepad, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For paper notepad, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the paper notepad and omit the discrepancy with tablet with completely. This document option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of paper notepad." },
          { id: "doc3", label: "Combine the paper notepad issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns paper notepad during clinical record as evidence and communication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical record as evidence and communication." },
        ],
        feedback: {
          observed: "Observe the paper notepad as patient-specific evidence for clinical record as evidence and communication. Compare it with the tablet with completely, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the paper notepad as patient-specific evidence for clinical record as evidence and communication. Compare it with the tablet with completely, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for clinical record as evidence and communication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For paper notepad, compare the visible evidence with tablet with completely and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to paper notepad; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for clinical record as evidence and communication. For paper notepad, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Objecti",
    title: "Objective patient-specific assessment",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for objective patient-specific assessment within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-OA-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-OA-017, Standards for Assessment-Day and Next-Day Documentation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assessing RN ; Begin documenting clinical findings during the assessment visit using mobile EHR access wherever feasible. At minimum, record vital signs, standardized tool component scores, and key physical examination findings at the time of the visit — before leaving the patient's home. These real-time entries constitute the most contemporaneous documentation available. ; During the assessment visit. ; ; 6.1.2 ; Assessing RN ; Complete the full assessment narrative — including all required clinical descriptions per CL-OA-007 substantiation standards — within 24 hours of the assessment visit. Complete the narrative before selecting OASIS item responses. The narrative drives the OASIS selection.",
      "Controlled-policy focus — CL-OA-017, Audit Trail Review for Documentation Sequence Integrity. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing ; During the monthly OASIS accuracy audit per CL-OA-002, review the EHR audit trail for a sample of assessed records to verify documentation sequence integrity: (a) the assessment narrative entries precede the OASIS item selection entries in chronological order; (b) all narrative entries have timestamps within 24 hours of the visit date; (c) standardized tool scores are documented at or near the visit timestamp. ; Monthly audit. ; ; 6.3.2 ; Director of Nursing ; When the audit trail reveals a pattern of OASIS item selections preceding narrative documentation, treat this as a Priority 1 documentation integrity concern..",
      "Controlled-policy focus — CL-OA-017, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Assessment narrative entries ; All clinical findings per CL-OA-007 standards ; Assessing RN ; EHR — Assessment narrative ; Within 24 hours of assessment; before OASIS item selection ; ; Standardized tool component scores ; Individual scores at time of tool administration ; Assessing RN ; EHR — Assessment narrative ; At tool administration or within 2 hours of visit ; ; Late entry attestations ; Attestation language per CO-DC-003 for any entry >24 hours post-visit ; Assessing RN ; EHR — Assessment narrative ; Concurrent with late entry creation ; ; EHR audit trail — documentation timestamps.",
      "Controlled-policy focus — CL-OA-017, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; A single assessment's narrative is created more than 24 hours after the visit without a late entry attestation ; Director of Nursing ; Director of Nursing directs the assessor to immediately add a late entry attestation per CO-DC-003. Provides corrective guidance on the 24-hour documentation standard. ; Attestation within 24 hours of identification; counseling within 5 business days. ; ; EHR audit trail shows OASIS item selections created before supporting narrative entries for multiple assessments by the same assessor ; Director of Nursing and Compliance Officer ; Compliance Officer and Director of Nursing jointly investigate. Assess all affected assessments for documentation integrity..",
      "Apply the controlled requirements to the three visible objects in the scene for objective patient-specific assessment. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "BP Cuff", detail: "Review the BP cuff for the patient-specific finding. Reconcile it with the pulse oximeter display, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter Display", detail: "Review the pulse oximeter display for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the BP cuff, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.110(a)" },
      { kind: "External Authority", text: "42 CFR § 484.110(b)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "bp-cuff-2-1", label: "BP cuff", shortLabel: "BP cuff", ariaLabel: "Investigate BP cuff",        x: 17, y: 68, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the BP cuff as patient-specific evidence for objective patient-specific assessment. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the BP cuff as patient-specific evidence for objective patient-specific assessment. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with pulse oximeter display and the controlling source before classifying status." },
          { id: "i2", label: "Assume the BP cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for objective patient-specific assessment." },
          { id: "i3", label: "Dismiss the conflict between the BP cuff and pulse oximeter display because one source appears more convenient. This identify option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about BP cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the BP cuff without confirming an applicable order and patient-specific authority. This decide option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for BP cuff is resolved." },
          { id: "d3", label: "Hand the BP cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during objective patient-specific assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For BP cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For BP cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the BP cuff before reassessment confirms the patient response. This document option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of BP cuff." },
          { id: "doc3", label: "Copy the prior objective patient-specific assessment narrative even though today’s BP cuff evidence is different. This document option concerns BP cuff during objective patient-specific assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for objective patient-specific assessment." },
        ],
        feedback: {
          observed: "Observe the BP cuff as patient-specific evidence for objective patient-specific assessment. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the BP cuff as patient-specific evidence for objective patient-specific assessment. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For BP cuff, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to BP cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For BP cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "pulse-oximeter-display-2-2", label: "pulse oximeter display", shortLabel: "pulse oximeter display", ariaLabel: "Investigate pulse oximeter display",        x: 34, y: 39, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the pulse oximeter display as patient-specific evidence for objective patient-specific assessment. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter display as patient-specific evidence for objective patient-specific assessment. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pulse oximeter display and omit the related change, symptom, or safety cue. This identify option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for objective patient-specific assessment." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pulse oximeter display stand in for direct RN assessment. This identify option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter display." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pulse oximeter display issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter display is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for objective patient-specific assessment instead of the current controlled clinical pathway. This decide option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during objective patient-specific assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pulse oximeter display and omit the discrepancy with tablet. This document option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter display." },
          { id: "doc3", label: "Combine the pulse oximeter display issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pulse oximeter display during objective patient-specific assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for objective patient-specific assessment." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter display as patient-specific evidence for objective patient-specific assessment. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter display as patient-specific evidence for objective patient-specific assessment. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "tablet-2-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the tablet as patient-specific evidence for objective patient-specific assessment. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with BP cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for objective patient-specific assessment. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with BP cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the BP cuff, patient report, or current record. This identify option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for objective patient-specific assessment." },
          { id: "i3", label: "Carry forward the prior visit conclusion for objective patient-specific assessment without reassessing the patient today. This identify option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during objective patient-specific assessment." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during objective patient-specific assessment.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for objective patient-specific assessment." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for objective patient-specific assessment. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for objective patient-specific assessment. Compare it with the BP cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for objective patient-specific assessment, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with BP cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for objective patient-specific assessment. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Link",
    title: "Link findings to skilled judgment and intervention",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for link findings to skilled judgment and intervention within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, Demonstrating Skilled Care in Documentation. This section provides the agency's standards for documentation that demonstrates the skilled nature of clinical services. These standards supplement the discipline-specific documentation requirements in CL-SD-001 through CL-SD-025. ; Documentation Element ; Standard for Skilled Documentation ; Example of Skilled Documentation ; Example of Non-Skilled Documentation ; ; ; ; ; ; ; Assessment findings ; Document specific clinical findings with quantitative measurements or standardized scale scores ; \"BP 168/94 sitting; HR 88 irregular; SpO2 88% on 2L NC; bilateral LE edema 3+ to mid-calf; lung auscultation — bibasilar crackles; weight 184.6 lbs, up 3.2 lbs from 3 days prior\" ; \"VS stable; lungs clear; patient OK\" ; ; Clinical reasoning ; Document the clinician's professional interpretation of findings.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, 4\\. Policy Statement. 4.1 Every entry in a patient's clinical record shall be: accurate — reflecting what was actually observed, assessed, performed, and communicated; complete — containing all required elements for the type of entry; timely — created within the timeframe specified for the entry type; legible — clearly readable in the format used (electronic or written); authenticated — identified with the author's name, credential, date, and time; and consistent — aligned with all related entries in the clinical record. 4.2 Every clinical record entry shall be individualized to the specific patient, the specific visit, and the specific clinical situation. Template-driven documentation that does not reflect the actual clinical encounter is prohibited. Copy-forward of prior entries without independent verification and documentation.",
      "Controlled-policy focus — CL-CD-001, What Surveyors and Auditors Will Look For. CMS surveyors under Tag G328 (42 CFR § 484.110) will examine the clinical record for: completeness and accuracy; authentication of all entries; timeliness of completion; evidence of individualization; internal consistency; and the presence of clinical reasoning demonstrating that services were skilled. ADR auditors will specifically examine whether visit notes demonstrate medical necessity and skilled care. A visit note that reads as a maintenance visit — without clinical assessment, clinical reasoning, or skilled intervention documentation — is a denial waiting to happen..",
      "Controlled-policy focus — CL-CD-001, Director of Nursing Documentation Quality Oversight. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing ; Conduct a monthly clinical documentation audit per CO-DC-002 covering a random sample of ≥5% of all visit notes from the prior month. The audit shall assess: (a) presence of all required universal elements per Section 6.1.3; (b) individualization — no copy-forward or template language; (c) skilled documentation — clear demonstration of skilled care and medical necessity; (d) goal progress documentation — specific and measurable; (e) authentication completeness; (f) consistency with related clinical record entries; (g) timeliness per CL-CD-004 standards. ; Monthly. ; ; 6.5.2 ; Director of Nursing ; Document audit findings in the Documentation Quality Dashboard.",
      "Apply the controlled requirements to the three visible objects in the scene for link findings to skilled judgment and intervention. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Wound-care Kit Closed", detail: "Review the wound-care kit closed for the patient-specific finding. Reconcile it with the measuring tape unmarked side up, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Measuring Tape Unmarked Side Up", detail: "Review the measuring tape unmarked side up for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the wound-care kit closed, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.110(b)" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "wound-care-kit-closed-3-1", label: "wound-care kit closed", shortLabel: "wound-care kit closed", ariaLabel: "Investigate wound-care kit closed",        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the wound-care kit closed as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the measuring tape unmarked side up, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound-care kit closed, compare the visible evidence with measuring tape unmarked side up and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the wound-care kit closed as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the measuring tape unmarked side up, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound-care kit closed, compare the visible evidence with measuring tape unmarked side up and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the wound-care kit closed and omit the related change, symptom, or safety cue. This identify option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for link findings to skilled judgment and intervention." },
          { id: "i3", label: "Let a blank, unreadable, or unverified wound-care kit closed stand in for direct RN assessment. This identify option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about wound-care kit closed." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound-care kit closed; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound-care kit closed; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the wound-care kit closed issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for wound-care kit closed is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for link findings to skilled judgment and intervention instead of the current controlled clinical pathway. This decide option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during link findings to skilled judgment and intervention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For wound-care kit closed, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For wound-care kit closed, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the wound-care kit closed and omit the discrepancy with measuring tape unmarked side up. This document option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of wound-care kit closed." },
          { id: "doc3", label: "Combine the wound-care kit closed issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns wound-care kit closed during link findings to skilled judgment and intervention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for link findings to skilled judgment and intervention." },
        ],
        feedback: {
          observed: "Observe the wound-care kit closed as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the measuring tape unmarked side up, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the wound-care kit closed as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the measuring tape unmarked side up, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For wound-care kit closed, compare the visible evidence with measuring tape unmarked side up and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to wound-care kit closed; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For wound-care kit closed, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "measuring-tape-unmarked-side-up-3-2", label: "measuring tape unmarked side up", shortLabel: "measuring tape unmarked side", ariaLabel: "Investigate measuring tape unmarked side up",        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the measuring tape unmarked side up as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring tape unmarked side up, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the measuring tape unmarked side up as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring tape unmarked side up, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Treat the measuring tape unmarked side up as the complete assessment and do not compare the tablet, patient report, or current record. This identify option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for link findings to skilled judgment and intervention." },
          { id: "i3", label: "Carry forward the prior visit conclusion for link findings to skilled judgment and intervention without reassessing the patient today. This identify option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about measuring tape unmarked side up." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring tape unmarked side up; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring tape unmarked side up; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the measuring tape unmarked side up alone and seek clarification only after the intervention is complete. This decide option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for measuring tape unmarked side up is resolved." },
          { id: "d3", label: "Defer the concern in the measuring tape unmarked side up to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during link findings to skilled judgment and intervention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For measuring tape unmarked side up, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For measuring tape unmarked side up, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the measuring tape unmarked side up was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of measuring tape unmarked side up." },
          { id: "doc3", label: "Keep the measuring tape unmarked side up decision in personal notes rather than the governed patient record. This document option concerns measuring tape unmarked side up during link findings to skilled judgment and intervention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for link findings to skilled judgment and intervention." },
        ],
        feedback: {
          observed: "Observe the measuring tape unmarked side up as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the measuring tape unmarked side up as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For measuring tape unmarked side up, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to measuring tape unmarked side up; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For measuring tape unmarked side up, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "tablet-3-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 76, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the tablet as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the wound-care kit closed, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with wound-care kit closed and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the wound-care kit closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with wound-care kit closed and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for link findings to skilled judgment and intervention." },
          { id: "i3", label: "Dismiss the conflict between the tablet and wound-care kit closed because one source appears more convenient. This identify option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This decide option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during link findings to skilled judgment and intervention." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet before reassessment confirms the patient response. This document option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Copy the prior link findings to skilled judgment and intervention narrative even though today’s tablet evidence is different. This document option concerns tablet during link findings to skilled judgment and intervention.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for link findings to skilled judgment and intervention." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the wound-care kit closed, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for link findings to skilled judgment and intervention. Compare it with the wound-care kit closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for link findings to skilled judgment and intervention, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with wound-care kit closed and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for link findings to skilled judgment and intervention. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Timely",
    title: "Timely completion and required elements",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for timely completion and required elements within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-CD-004, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Visit notes contain all universal required elements per Section 6.1.3 ; Monthly documentation audit ; ≥95% of audited notes contain all required elements ; ; Visit notes demonstrate skilled care per Section 6.2 standards ; Monthly documentation audit ; ≥90% of audited notes contain skilled documentation language ; ; Goal progress documented with measurable specificity ; Monthly documentation audit ; ≥90% of audited notes contain measurable goal progress ; ; All entries authenticated ; Authentication log audit ; ≥98% of entries authenticated within the required timeframe ; ; No copy-forward identified ; Monthly documentation audit ; Zero tolerance for unapproved copy-forward on audited records.",
      "Controlled-policy focus — CL-CD-004, 2\\. Purpose. This policy establishes mandatory timeframes for completion and locking of clinical documentation at Care Indeed Home Health Care, Inc. Timely documentation ensures continuity of care between providers, supports accurate and timely claims submission, facilitates agency quality assurance, and demonstrates compliance with 42 CFR § 484.110(c) and CMS operational standards. Late or unlocked documentation creates both clinical risk (gaps in care coordination) and billing risk (rejected claims). ACHC Survey-Defensible Operational Controls - HH5-1A.01: Clinical leads and assigned clinicians execute and monitor admission/intake privacy and workflow control integrity. Work steps are tracked with defined owner accountability, required completion timing, and exception escalation; survey evidence is retained in clinical documentation artifacts, workflow timestamps, supervisory review evidence, and audit outcomes..",
      "Controlled-policy focus — CL-CD-001, Director of Nursing Documentation Quality Oversight. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing ; Conduct a monthly clinical documentation audit per CO-DC-002 covering a random sample of ≥5% of all visit notes from the prior month. The audit shall assess: (a) presence of all required universal elements per Section 6.1.3; (b) individualization — no copy-forward or template language; (c) skilled documentation — clear demonstration of skilled care and medical necessity; (d) goal progress documentation — specific and measurable; (e) authentication completeness; (f) consistency with related clinical record entries; (g) timeliness per CL-CD-004 standards. ; Monthly. ; ; 6.5.2 ; Director of Nursing ; Document audit findings in the Documentation Quality Dashboard.",
      "Controlled-policy focus — CL-CD-001, 4\\. Policy Statement. 4.1 Every entry in a patient's clinical record shall be: accurate — reflecting what was actually observed, assessed, performed, and communicated; complete — containing all required elements for the type of entry; timely — created within the timeframe specified for the entry type; legible — clearly readable in the format used (electronic or written); authenticated — identified with the author's name, credential, date, and time; and consistent — aligned with all related entries in the clinical record. 4.2 Every clinical record entry shall be individualized to the specific patient, the specific visit, and the specific clinical situation. Template-driven documentation that does not reflect the actual clinical encounter is prohibited. Copy-forward of prior entries without independent verification and documentation.",
      "Apply the controlled requirements to the three visible objects in the scene for timely completion and required elements. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the tipped walker, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tipped Walker", detail: "Review the tipped walker for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "tablet-screen-4-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 46, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the tablet screen as patient-specific evidence for timely completion and required elements. Compare it with the tipped walker, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with tipped walker and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for timely completion and required elements. Compare it with the tipped walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with tipped walker and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the tipped walker, patient report, or current record. This identify option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for timely completion and required elements." },
          { id: "i3", label: "Carry forward the prior visit conclusion for timely completion and required elements without reassessing the patient today. This identify option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during timely completion and required elements." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during timely completion and required elements.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for timely completion and required elements." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for timely completion and required elements. Compare it with the tipped walker, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for timely completion and required elements. Compare it with the tipped walker, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with tipped walker and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "tipped-walker-4-2", label: "tipped walker", shortLabel: "tipped walker", ariaLabel: "Investigate tipped walker",        x: 46, y: 69, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the tipped walker as patient-specific evidence for timely completion and required elements. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tipped walker, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tipped walker as patient-specific evidence for timely completion and required elements. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tipped walker, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tipped walker establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for timely completion and required elements." },
          { id: "i3", label: "Dismiss the conflict between the tipped walker and pulse oximeter because one source appears more convenient. This identify option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tipped walker." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tipped walker; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tipped walker; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tipped walker without confirming an applicable order and patient-specific authority. This decide option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tipped walker is resolved." },
          { id: "d3", label: "Hand the tipped walker concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during timely completion and required elements." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tipped walker, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tipped walker, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tipped walker before reassessment confirms the patient response. This document option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tipped walker." },
          { id: "doc3", label: "Copy the prior timely completion and required elements narrative even though today’s tipped walker evidence is different. This document option concerns tipped walker during timely completion and required elements.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for timely completion and required elements." },
        ],
        feedback: {
          observed: "Observe the tipped walker as patient-specific evidence for timely completion and required elements. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tipped walker as patient-specific evidence for timely completion and required elements. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tipped walker, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tipped walker; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For tipped walker, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "pulse-oximeter-4-3", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 85, y: 50, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the pulse oximeter as patient-specific evidence for timely completion and required elements. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for timely completion and required elements. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pulse oximeter and omit the related change, symptom, or safety cue. This identify option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for timely completion and required elements." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pulse oximeter stand in for direct RN assessment. This identify option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pulse oximeter issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for timely completion and required elements instead of the current controlled clinical pathway. This decide option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during timely completion and required elements." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pulse oximeter and omit the discrepancy with tablet screen. This document option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Combine the pulse oximeter issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pulse oximeter during timely completion and required elements.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for timely completion and required elements." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for timely completion and required elements. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for timely completion and required elements. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for timely completion and required elements, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for timely completion and required elements. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Correct",
    title: "Corrections, late entries, addenda, authentication",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for corrections, late entries, addenda, authentication within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-OA-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-OA-017, Late Entry Compliance. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assessing RN ; When clinical documentation cannot be completed within 24 hours of the assessment visit due to a documented external circumstance: (a) create the late entry as soon as the circumstance is resolved; (b) include the late entry attestation per CO-DC-003: \"LATE ENTRY — Clinical visit date: [date]. Documentation delayed due to [specific reason]. Documented on: [current date/time]. Author: [name/credential].\"; (c) document the clinical circumstances of the external circumstance in the attestation or in the EHR administrative notes contemporaneously with the external circumstance. ; At the earliest opportunity after the external circumstance is resolved. ; ; 6.2.2 ; Assessing RN.",
      "Controlled-policy focus — CL-CD-001, Visit Note Authentication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; All Clinicians ; Authenticate every visit note and clinical record entry by applying the electronic signature in the EHR. Authentication includes: (a) the clinician's full legal name; (b) professional credential (RN, LVN, PT, OT, SLP, MSW, HHA); (c) the date and time of authentication. ; Before or at the time of entry submission in the EHR. ; ; 6.4.2 ; All Clinicians ; Review the complete visit note for accuracy, completeness, and internal consistency before authenticating. Once authenticated, the note is a permanent part of the clinical record. Authentication without review is an attestation that an unreviewed note is accurate —.",
      "Controlled-policy focus — CL-CD-001, 4\\. Policy Statement. 4.1 Every entry in a patient's clinical record shall be: accurate — reflecting what was actually observed, assessed, performed, and communicated; complete — containing all required elements for the type of entry; timely — created within the timeframe specified for the entry type; legible — clearly readable in the format used (electronic or written); authenticated — identified with the author's name, credential, date, and time; and consistent — aligned with all related entries in the clinical record. 4.2 Every clinical record entry shall be individualized to the specific patient, the specific visit, and the specific clinical situation. Template-driven documentation that does not reflect the actual clinical encounter is prohibited. Copy-forward of prior entries without independent verification and documentation.",
      "Controlled-policy focus — CL-OA-017, 4\\. Policy Statement. 4.1 All clinical findings, physical examination results, patient and caregiver interview responses, standardized tool component scores and totals, and clinical reasoning entries that support OASIS item responses shall be documented in the EHR within 24 hours of the clinical encounter at which they were obtained. The 24-hour standard is the absolute maximum — same-day documentation is the agency's expected standard. 4.2 Clinical documentation supporting OASIS items shall be created in a sequence that reflects the actual clinical process: observations are made, data is collected, documentation is written, and OASIS responses are selected based on the documented evidence. The reverse sequence — selecting OASIS responses first and then writing documentation to support them — constitutes reverse-engineered documentation and is.",
      "Apply the controlled requirements to the three visible objects in the scene for corrections, late entries, addenda, authentication. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the original note sheet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Original Note Sheet", detail: "Review the original note sheet for the patient-specific finding. Reconcile it with the correction pen, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Correction Pen", detail: "Review the correction pen for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.20" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "tablet-screen-5-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the tablet screen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the original note sheet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with original note sheet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the original note sheet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with original note sheet and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet screen establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for corrections, late entries, addenda, authentication." },
          { id: "i3", label: "Dismiss the conflict between the tablet screen and original note sheet because one source appears more convenient. This identify option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet screen without confirming an applicable order and patient-specific authority. This decide option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Hand the tablet screen concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during corrections, late entries, addenda, authentication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet screen before reassessment confirms the patient response. This document option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Copy the prior corrections, late entries, addenda, authentication narrative even though today’s tablet screen evidence is different. This document option concerns tablet screen during corrections, late entries, addenda, authentication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrections, late entries, addenda, authentication." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the original note sheet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the original note sheet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with original note sheet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "original-note-sheet-5-2", label: "original note sheet", shortLabel: "original note sheet", ariaLabel: "Investigate original note sheet",        x: 32, y: 49, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the original note sheet as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the correction pen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For original note sheet, compare the visible evidence with correction pen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the original note sheet as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the correction pen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For original note sheet, compare the visible evidence with correction pen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the original note sheet and omit the related change, symptom, or safety cue. This identify option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for corrections, late entries, addenda, authentication." },
          { id: "i3", label: "Let a blank, unreadable, or unverified original note sheet stand in for direct RN assessment. This identify option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about original note sheet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to original note sheet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to original note sheet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the original note sheet issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for original note sheet is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for corrections, late entries, addenda, authentication instead of the current controlled clinical pathway. This decide option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during corrections, late entries, addenda, authentication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For original note sheet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For original note sheet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the original note sheet and omit the discrepancy with correction pen. This document option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of original note sheet." },
          { id: "doc3", label: "Combine the original note sheet issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns original note sheet during corrections, late entries, addenda, authentication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrections, late entries, addenda, authentication." },
        ],
        feedback: {
          observed: "Observe the original note sheet as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the correction pen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the original note sheet as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the correction pen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For original note sheet, compare the visible evidence with correction pen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to original note sheet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For original note sheet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "correction-pen-5-3", label: "correction pen", shortLabel: "correction pen", ariaLabel: "Investigate correction pen",        x: 80, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the correction pen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For correction pen, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the correction pen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For correction pen, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat the correction pen as the complete assessment and do not compare the tablet screen, patient report, or current record. This identify option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for corrections, late entries, addenda, authentication." },
          { id: "i3", label: "Carry forward the prior visit conclusion for corrections, late entries, addenda, authentication without reassessing the patient today. This identify option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about correction pen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to correction pen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to correction pen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the correction pen alone and seek clarification only after the intervention is complete. This decide option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for correction pen is resolved." },
          { id: "d3", label: "Defer the concern in the correction pen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during corrections, late entries, addenda, authentication." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For correction pen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For correction pen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the correction pen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of correction pen." },
          { id: "doc3", label: "Keep the correction pen decision in personal notes rather than the governed patient record. This document option concerns correction pen during corrections, late entries, addenda, authentication.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for corrections, late entries, addenda, authentication." },
        ],
        feedback: {
          observed: "Observe the correction pen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the correction pen as patient-specific evidence for corrections, late entries, addenda, authentication. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for corrections, late entries, addenda, authentication, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For correction pen, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to correction pen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for corrections, late entries, addenda, authentication. For correction pen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Orders",
    title: "Orders, notifications, and closed-loop follow-through",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for orders, notifications, and closed-loop follow-through within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-CD-002, CL-CD-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-002, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall maintain a complete clinical record for every patient receiving home health services. The record shall be initiated at the time of referral and remain active throughout the episode of care and for the retention period defined in CO-HP-007. 4.2 Every patient clinical record shall contain at minimum the following required content elements: (a) Referral source documentation and intake assessment; (b) Physician orders — initial, verbal, written, and change orders — authenticated per CL-CD-003; (c) Completed and certified OASIS assessment(s) per CL-OA-001; (d) Current, physician-approved Plan of Care (CMS-485 or equivalent) per CL-CP-001; (e) Individualized care plan with measurable goals, disciplines, frequencies, and functional objectives per CL-CP-001; (f) All visit notes.",
      "Controlled-policy focus — CL-CD-003, 4\\. Policy Statements. 4.1 Every entry in a patient clinical record — including visit notes, assessments, care plan updates, physician orders, verbal order transcriptions, education notes, and supervisory notes — shall be authenticated (signed and dated) by the author at the time the entry is completed. 4.2 Authentication shall include: (a) the author's full name; (b) professional credentials/licensure (e.g., RN, LVN, PT, OT, SLP, MSW, HHA); (c) date and time of the entry; (d) handwritten signature (for paper records) or electronic signature with audit trail (for EHR). 4.3 Electronic signatures shall be unique to each individual user, not shared, and shall be protected by secure password per IT-AS-001. Electronic signatures carry the same legal weight as handwritten signatures. 4.4 Home Health.",
      "Controlled-policy focus — CL-CD-003, 6\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1 ; All Clinicians ; Sign and date all entries at time of completion ; Immediately upon entry ; ; 6.2 ; HHA ; Complete HHA activity notes for every visit ; Within 24 hours ; ; 6.3 ; Supervising RN ; Countersign HHA visit notes ; Within 14 days of visit ; ; 6.4 ; Transcribing Clinician ; Document and sign verbal orders per protocol ; At time of order receipt ; ; 6.5 ; Physician Liaison ; Route verbal orders to physician for co-signature ; Within 5 business days ; ; 6.6 ; DON / Medical Records ; Audit authentication compliance.",
      "Controlled-policy focus — CL-CD-001, 2\\. Purpose. This policy establishes the minimum standards for clinical documentation content, timeliness, accuracy, and authentication for all clinical records at Care Indeed Home Health Care, Inc. Clinical documentation is not administrative paperwork — it is the legal, clinical, and financial record of every professional act performed for every patient on every visit. It is simultaneously: the clinical record that governs the next clinician's decisions; the legal record that defines the agency's liability in litigation; the regulatory record that determines whether a CMS surveyor finds compliance or a deficiency; the billing record that justifies every Medicare payment; and the quality record that drives every QAPI improvement decision. Documentation failures in home health are the single most consequential category of compliance.",
      "Apply the controlled requirements to the three visible objects in the scene for orders, notifications, and closed-loop follow-through. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the closed plan binder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Plan Binder", detail: "Review the closed plan binder for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.20" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "tablet-screen-6-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the tablet screen as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the closed plan binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed plan binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the closed plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed plan binder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tablet screen and omit the related change, symptom, or safety cue. This identify option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, notifications, and closed-loop follow-through." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tablet screen stand in for direct RN assessment. This identify option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tablet screen issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for orders, notifications, and closed-loop follow-through instead of the current controlled clinical pathway. This decide option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, notifications, and closed-loop follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tablet screen and omit the discrepancy with closed plan binder. This document option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Combine the tablet screen issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tablet screen during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, notifications, and closed-loop follow-through." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the closed plan binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the closed plan binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed plan binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "closed-plan-binder-6-2", label: "closed plan binder", shortLabel: "closed plan binder", ariaLabel: "Investigate closed plan binder",        x: 32, y: 57, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the closed plan binder as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed plan binder as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the closed plan binder as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, notifications, and closed-loop follow-through." },
          { id: "i3", label: "Carry forward the prior visit conclusion for orders, notifications, and closed-loop follow-through without reassessing the patient today. This identify option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed plan binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed plan binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed plan binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the closed plan binder alone and seek clarification only after the intervention is complete. This decide option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed plan binder is resolved." },
          { id: "d3", label: "Defer the concern in the closed plan binder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, notifications, and closed-loop follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For closed plan binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For closed plan binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the closed plan binder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed plan binder." },
          { id: "doc3", label: "Keep the closed plan binder decision in personal notes rather than the governed patient record. This document option concerns closed plan binder during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, notifications, and closed-loop follow-through." },
        ],
        feedback: {
          observed: "Observe the closed plan binder as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed plan binder as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed plan binder, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed plan binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For closed plan binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "stethoscope-6-3", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the stethoscope as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, notifications, and closed-loop follow-through." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and tablet screen because one source appears more convenient. This identify option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, notifications, and closed-loop follow-through." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior orders, notifications, and closed-loop follow-through narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during orders, notifications, and closed-loop follow-through.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, notifications, and closed-loop follow-through." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for orders, notifications, and closed-loop follow-through. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, notifications, and closed-loop follow-through, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, notifications, and closed-loop follow-through. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Final",
    title: "Final note audit and competency boundary",
    subtitle: "Skilled Nursing Documentation Standards",
    narration: [
      "This lesson develops registered-nurse reasoning for final note audit and competency boundary within Skilled Nursing Documentation Standards. Use the current controlled requirements in CL-CD-001, CL-OA-017, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CD-001, APPENDICES. Appendix A — Approved Clinical Abbreviation List Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CD-001 ; Version: 1.0 The following abbreviations are approved for use in clinical record entries at Care Indeed Home Health Care, Inc. Any abbreviation not on this list shall be written out in full. This list shall be reviewed annually by the Director of Nursing and updated as needed. ; Abbreviation ; Full Term ; ; ; ; ; ADL ; Activities of Daily Living ; ; AM / PM ; Morning / Afternoon ; ; amb ; Ambulation / Ambulate ; ; bid ; Twice daily ; ; BP ; Blood Pressure ; ; BGL ; Blood Glucose Level.",
      "Controlled-policy focus — CL-CD-001, Visit Note Authentication. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; All Clinicians ; Authenticate every visit note and clinical record entry by applying the electronic signature in the EHR. Authentication includes: (a) the clinician's full legal name; (b) professional credential (RN, LVN, PT, OT, SLP, MSW, HHA); (c) the date and time of authentication. ; Before or at the time of entry submission in the EHR. ; ; 6.4.2 ; All Clinicians ; Review the complete visit note for accuracy, completeness, and internal consistency before authenticating. Once authenticated, the note is a permanent part of the clinical record. Authentication without review is an attestation that an unreviewed note is accurate —.",
      "Controlled-policy focus — CL-OA-017, Audit Trail Review for Documentation Sequence Integrity. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing ; During the monthly OASIS accuracy audit per CL-OA-002, review the EHR audit trail for a sample of assessed records to verify documentation sequence integrity: (a) the assessment narrative entries precede the OASIS item selection entries in chronological order; (b) all narrative entries have timestamps within 24 hours of the visit date; (c) standardized tool scores are documented at or near the visit timestamp. ; Monthly audit. ; ; 6.3.2 ; Director of Nursing ; When the audit trail reveals a pattern of OASIS item selections preceding narrative documentation, treat this as a Priority 1 documentation integrity concern..",
      "Controlled-policy focus — CL-CD-001, How Compliance Is Measured. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Visit notes contain all universal required elements per Section 6.1.3 ; Monthly documentation audit ; ≥95% of audited notes contain all required elements ; ; Visit notes demonstrate skilled care per Section 6.2 standards ; Monthly documentation audit ; ≥90% of audited notes contain skilled documentation language ; ; Goal progress documented with measurable specificity ; Monthly documentation audit ; ≥90% of audited notes contain measurable goal progress ; ; All entries authenticated ; Authentication log audit ; ≥98% of entries authenticated within the required timeframe ; ; No copy-forward identified ; Monthly documentation audit ; Zero tolerance for unapproved copy-forward on audited records.",
      "Controlled-policy focus — CL-CD-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; A visit note is identified as documenting care that the clinician could not have provided (e.g., visit note completed when the patient reports no visit occurred; visit note completed from the office without the visit having occurred) ; Director of Nursing and Compliance Officer ; Compliance Officer initiates a compliance investigation per CO-CP-007. Do not alter or delete the documentation pending investigation. Document all facts as discovered. If billing has occurred for the falsified visit, assess for overpayment and potential self-disclosure. ; Investigation initiated within 24 hours. ; ; Copy-forward documentation identified — visit notes for multiple consecutive visits are identical.",
      "Apply the controlled requirements to the three visible objects in the scene for final note audit and competency boundary. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the closed audit binder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Audit Binder", detail: "Review the closed audit binder for the patient-specific finding. Reconcile it with the timestamp clock without numbers, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Timestamp Clock Without Numbers", detail: "Review the timestamp clock without numbers for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CD-001" },
      { kind: "Controlled Policy", text: "CL-CD-002" },
      { kind: "Controlled Policy", text: "CL-CD-003" },
      { kind: "Controlled Policy", text: "CL-CD-004" },
      { kind: "Controlled Policy", text: "CL-DC-101" },
      { kind: "Controlled Policy", text: "CL-OA-017" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
      { kind: "External Authority", text: "45 CFR § 164.312" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "tablet-screen-7-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 74, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the tablet screen as patient-specific evidence for final note audit and competency boundary. Compare it with the closed audit binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed audit binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for final note audit and competency boundary. Compare it with the closed audit binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed audit binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the closed audit binder, patient report, or current record. This identify option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for final note audit and competency boundary." },
          { id: "i3", label: "Carry forward the prior visit conclusion for final note audit and competency boundary without reassessing the patient today. This identify option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during final note audit and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during final note audit and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for final note audit and competency boundary." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for final note audit and competency boundary. Compare it with the closed audit binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for final note audit and competency boundary. Compare it with the closed audit binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with closed audit binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "closed-audit-binder-7-2", label: "closed audit binder", shortLabel: "closed audit binder", ariaLabel: "Investigate closed audit binder",        x: 51, y: 72, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the closed audit binder as patient-specific evidence for final note audit and competency boundary. Compare it with the timestamp clock without numbers, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed audit binder, compare the visible evidence with timestamp clock without numbers and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed audit binder as patient-specific evidence for final note audit and competency boundary. Compare it with the timestamp clock without numbers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed audit binder, compare the visible evidence with timestamp clock without numbers and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed audit binder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for final note audit and competency boundary." },
          { id: "i3", label: "Dismiss the conflict between the closed audit binder and timestamp clock without numbers because one source appears more convenient. This identify option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed audit binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed audit binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed audit binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed audit binder without confirming an applicable order and patient-specific authority. This decide option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed audit binder is resolved." },
          { id: "d3", label: "Hand the closed audit binder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during final note audit and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For closed audit binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For closed audit binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed audit binder before reassessment confirms the patient response. This document option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed audit binder." },
          { id: "doc3", label: "Copy the prior final note audit and competency boundary narrative even though today’s closed audit binder evidence is different. This document option concerns closed audit binder during final note audit and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for final note audit and competency boundary." },
        ],
        feedback: {
          observed: "Observe the closed audit binder as patient-specific evidence for final note audit and competency boundary. Compare it with the timestamp clock without numbers, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed audit binder as patient-specific evidence for final note audit and competency boundary. Compare it with the timestamp clock without numbers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed audit binder, compare the visible evidence with timestamp clock without numbers and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed audit binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For closed audit binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
      {
        id: "timestamp-clock-without-numbers-7-3", label: "timestamp clock without numbers", shortLabel: "timestamp clock without", ariaLabel: "Investigate timestamp clock without numbers",        x: 79, y: 41, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the timestamp clock without numbers as patient-specific evidence for final note audit and competency boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For timestamp clock without numbers, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the timestamp clock without numbers as patient-specific evidence for final note audit and competency boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For timestamp clock without numbers, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the timestamp clock without numbers and omit the related change, symptom, or safety cue. This identify option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for final note audit and competency boundary." },
          { id: "i3", label: "Let a blank, unreadable, or unverified timestamp clock without numbers stand in for direct RN assessment. This identify option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about timestamp clock without numbers." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to timestamp clock without numbers; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to timestamp clock without numbers; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the timestamp clock without numbers issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for timestamp clock without numbers is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for final note audit and competency boundary instead of the current controlled clinical pathway. This decide option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during final note audit and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For timestamp clock without numbers, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For timestamp clock without numbers, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the timestamp clock without numbers and omit the discrepancy with tablet screen. This document option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of timestamp clock without numbers." },
          { id: "doc3", label: "Combine the timestamp clock without numbers issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns timestamp clock without numbers during final note audit and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for final note audit and competency boundary." },
        ],
        feedback: {
          observed: "Observe the timestamp clock without numbers as patient-specific evidence for final note audit and competency boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the timestamp clock without numbers as patient-specific evidence for final note audit and competency boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for final note audit and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For timestamp clock without numbers, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to timestamp clock without numbers; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for final note audit and competency boundary. For timestamp clock without numbers, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CD-001","CL-CD-002","CL-CD-003","CL-CD-004","CL-DC-101","CL-OA-017","42 CFR § 484.110","42 CFR § 484.110(a)","42 CFR § 484.110(b)","42 CFR § 484.60(b)","42 CFR §484.110","42 CFR § 484.20","42 CFR § 484.80","45 CFR § 164.312"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During clinical record as evidence and communication, the paper notepad conflicts with the tablet with completely and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the tablet with completely is unchanged from the prior encounter and omit patient-specific reassessment during clinical record as evidence and communication.",
      "Proceed using the paper notepad alone and seek clarification only after the intervention is complete. This option concerns clinical record as evidence and communication.",
      "Defer the concern in the paper notepad to the next routine visit even though its current clinical significance has not been assessed. This option concerns clinical record as evidence and communication.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for clinical record as evidence and communication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 2,
    stem: "During objective patient-specific assessment, the tablet conflicts with the BP cuff and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns objective patient-specific assessment.",
      "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This option concerns objective patient-specific assessment.",
      "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the BP cuff is unchanged from the prior encounter and omit patient-specific reassessment during objective patient-specific assessment.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for objective patient-specific assessment within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 3,
    stem: "During link findings to skilled judgment and intervention, the tablet conflicts with the wound-care kit closed and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the tablet issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns link findings to skilled judgment and intervention.",
      "Assume the wound-care kit closed is unchanged from the prior encounter and omit patient-specific reassessment during link findings to skilled judgment and intervention.",
      "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for link findings to skilled judgment and intervention instead of the current controlled clinical pathway. This option concerns link findings to skilled judgment and intervention.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for link findings to skilled judgment and intervention within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 4,
    stem: "During timely completion and required elements, the pulse oximeter conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the pulse oximeter to the next routine visit even though its current clinical significance has not been assessed. This option concerns timely completion and required elements.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during timely completion and required elements.",
      "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the pulse oximeter alone and seek clarification only after the intervention is complete. This option concerns timely completion and required elements.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for timely completion and required elements within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 5,
    stem: "During corrections, late entries, addenda, authentication, the correction pen conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Change the treatment, medication, device setting, or plan based on the correction pen without confirming an applicable order and patient-specific authority. This option concerns corrections, late entries, addenda, authentication.",
      "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the correction pen concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns corrections, late entries, addenda, authentication.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during corrections, late entries, addenda, authentication.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for corrections, late entries, addenda, authentication within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 6,
    stem: "During orders, notifications, and closed-loop follow-through, the stethoscope conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during orders, notifications, and closed-loop follow-through.",
      "Use a familiar local shortcut for orders, notifications, and closed-loop follow-through instead of the current controlled clinical pathway. This option concerns orders, notifications, and closed-loop follow-through.",
      "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns orders, notifications, and closed-loop follow-through.",
      "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for orders, notifications, and closed-loop follow-through within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 7,
    stem: "During final note audit and competency boundary, the timestamp clock without numbers conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the timestamp clock without numbers alone and seek clarification only after the intervention is complete. This option concerns final note audit and competency boundary.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during final note audit and competency boundary.",
      "Defer the concern in the timestamp clock without numbers to the next routine visit even though its current clinical significance has not been assessed. This option concerns final note audit and competency boundary.",
      "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for final note audit and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CD-001, CL-CD-002, CL-CD-003, CL-CD-004, CL-DC-101, CL-OA-017.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.110 be used when applying Skilled Nursing Documentation Standards?",
    options: [
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
    ],
    correct: 2,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the BP cuff and stethoscope into defensible RN practice for Skilled Nursing Documentation Standards?",
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
    stem: "What does successful completion of Skilled Nursing Documentation Standards establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in Skilled Nursing Documentation Standards, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Automatic authority to perform every activity discussed in Skilled Nursing Documentation Standards without supervision.",
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


const STORAGE_KEY = 'rn-005-progress-v6000';

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

export default function RN005() {
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
          <span className="brand-text">RN-005 — Documentation</span>
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
