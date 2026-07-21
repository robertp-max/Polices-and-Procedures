/**
 * RN-015 — Supervisory Responsibilities — LVN & HHA
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
import img01 from './assets/rn-015/rn-015-lesson-01.png';
import img02 from './assets/rn-015/rn-015-lesson-02.png';
import img03 from './assets/rn-015/rn-015-lesson-03.png';
import img04 from './assets/rn-015/rn-015-lesson-04.png';
import img05 from './assets/rn-015/rn-015-lesson-05.png';
import img06 from './assets/rn-015/rn-015-lesson-06.png';
import img07 from './assets/rn-015/rn-015-lesson-07.png';

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

const MODULE_META = { id: "RN-015", title: "Supervisory Responsibilities — LVN & HHA", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for RN accountability and role-specific scope boundaries, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Assign patient-specific tasks from the current plan of care, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Supervise LVN services and escalation pathways, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Supervise HHA services under current regulatory context, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Observe performance, patient outcomes, and care-plan adherence, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Address deficiencies, retraining, assignment hold, and escalation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Document supervision, follow-up, and competency boundary, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 RN",
    title: "RN accountability and role-specific scope boundaries",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for rn accountability and role-specific scope boundaries within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in HR-TA-005, CL-SD-006, CL-SD-007, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TA-005, Role-Specific / Clinical Orientation (Days 1-30). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing / Supervisor ; Initiate role-specific orientation using the Role-Specific/Clinical Orientation Checklist (Appendix B). For clinical staff, the checklist must include: (a) EHR system training and proficiency demonstration; (b) OASIS training and assessment (per CL-OA-003, CL-OA-018); (c) Clinical documentation standards (CL-CD-001 through CL-CD-004); (d) Care planning and physician order management (CL-CP-001 through CL-CP-009); (e) Discipline-specific clinical protocols; (f) Medication management (CL-SD-012, CL-SD-013); (g) Fall risk assessment (CL-SD-015); (h) Wound care standards (CL-SD-011, if applicable); (i) Pain assessment (CL-SD-014); (j) Infection prevention — clinical application; (k) Patient identification and verification (OP-PA-002); (l) Homebound status determination (CL-CA-005); (m) Supervised patient visits.",
      "Controlled-policy focus — HR-TA-005, 3\\. Scope. This policy applies to: All newly hired employees (full-time, part-time, per diem) regardless of position All contracted/staffing agency clinical personnel prior to their first patient assignment All individuals transitioning to a new role or department within the agency (role-specific orientation component only) The HR Director, Director of Nursing, department supervisors, and all personnel responsible for conducting or coordinating orientation The Administrator This policy does not apply to: Governing Body member orientation, which is addressed in GV-GB-001 § 10. Volunteer orientation is addressed in HR-WM-006..",
      "Controlled-policy focus — CL-SD-006, 3\\. Scope. This policy applies to all home health aides providing direct patient care, all RNs providing HHA supervision, the Director of Nursing / Clinical Manager, Clinical Coordinators managing HHA scheduling, and Operations staff coordinating HHA assignments..",
      "Controlled-policy focus — CL-SD-007, 3\\. Scope. This policy applies to all home health aides (employees and contracted staff), the Director of Nursing / Clinical Manager, all RNs conducting HHA competency evaluations, and HR staff managing competency records in personnel files per HR-WM-007..",
      "Controlled-policy focus — CL-SD-008, 3\\. Scope. This policy applies to the Director of Nursing / Clinical Manager, all clinical supervisors (RNs, PTs, OTs), all supervised staff (LVNs, PTAs, COTAs, HHAs), and all professional staff (RNs, PTs, OTs, SLPs, MSWs) subject to administrative and clinical oversight..",
      "Apply the controlled requirements to the three visible objects in the scene for rn accountability and role-specific scope boundaries. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Nursing Bag", detail: "Review the nursing bag for the patient-specific finding. Reconcile it with the assignment clipboard, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Assignment Clipboard", detail: "Review the assignment clipboard for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the nursing bag, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80" },
      { kind: "External Authority", text: "42 CFR § 484.80(b)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "nursing-bag-1-1", label: "nursing bag", shortLabel: "nursing bag", ariaLabel: "Investigate nursing bag",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the nursing bag as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the assignment clipboard, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with assignment clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nursing bag as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the assignment clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with assignment clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Treat the nursing bag as the complete assessment and do not compare the assignment clipboard, patient report, or current record. This identify option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn accountability and role-specific scope boundaries." },
          { id: "i3", label: "Carry forward the prior visit conclusion for rn accountability and role-specific scope boundaries without reassessing the patient today. This identify option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nursing bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the nursing bag alone and seek clarification only after the intervention is complete. This decide option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nursing bag is resolved." },
          { id: "d3", label: "Defer the concern in the nursing bag to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn accountability and role-specific scope boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For nursing bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For nursing bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the nursing bag was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nursing bag." },
          { id: "doc3", label: "Keep the nursing bag decision in personal notes rather than the governed patient record. This document option concerns nursing bag during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn accountability and role-specific scope boundaries." },
        ],
        feedback: {
          observed: "Observe the nursing bag as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the assignment clipboard, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nursing bag as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the assignment clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with assignment clipboard and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For nursing bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "assignment-clipboard-1-2", label: "assignment clipboard", shortLabel: "assignment clipboard", ariaLabel: "Investigate assignment clipboard",        x: 36, y: 60, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the assignment clipboard as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assignment clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the assignment clipboard as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assignment clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Assume the assignment clipboard establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn accountability and role-specific scope boundaries." },
          { id: "i3", label: "Dismiss the conflict between the assignment clipboard and blood-pressure cuff because one source appears more convenient. This identify option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about assignment clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assignment clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assignment clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the assignment clipboard without confirming an applicable order and patient-specific authority. This decide option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for assignment clipboard is resolved." },
          { id: "d3", label: "Hand the assignment clipboard concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn accountability and role-specific scope boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For assignment clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For assignment clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the assignment clipboard before reassessment confirms the patient response. This document option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of assignment clipboard." },
          { id: "doc3", label: "Copy the prior rn accountability and role-specific scope boundaries narrative even though today’s assignment clipboard evidence is different. This document option concerns assignment clipboard during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn accountability and role-specific scope boundaries." },
        ],
        feedback: {
          observed: "Observe the assignment clipboard as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the assignment clipboard as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assignment clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assignment clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For assignment clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "blood-pressure-cuff-1-3", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 77, y: 47, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with nursing bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with nursing bag and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the blood-pressure cuff and omit the related change, symptom, or safety cue. This identify option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn accountability and role-specific scope boundaries." },
          { id: "i3", label: "Let a blank, unreadable, or unverified blood-pressure cuff stand in for direct RN assessment. This identify option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the blood-pressure cuff issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for rn accountability and role-specific scope boundaries instead of the current controlled clinical pathway. This decide option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn accountability and role-specific scope boundaries." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the blood-pressure cuff and omit the discrepancy with nursing bag. This document option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Combine the blood-pressure cuff issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns blood-pressure cuff during rn accountability and role-specific scope boundaries.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn accountability and role-specific scope boundaries." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for rn accountability and role-specific scope boundaries. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn accountability and role-specific scope boundaries, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with nursing bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn accountability and role-specific scope boundaries. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Assign",
    title: "Assign patient-specific tasks from the current plan of care",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for assign patient-specific tasks from the current plan of care within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in CL-SD-006, HR-TA-005, HR-TD-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-006, HHA Assignment and Care Plan Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; When HHA services are ordered in the plan of care, develop a written, patient-specific HHA care plan specifying all tasks per Section 4.3. The HHA care plan shall be consistent with and derived from the physician-approved plan of care. ; Within 24 hours of HHA service initiation. ; ; 6.1.2 ; Assigned RN ; Provide the assigned HHA with the written HHA care plan before the first HHA visit. Review the care plan verbally with the HHA to ensure understanding. Document the orientation. ; Before the first HHA visit. ; ; 6.1.3 ; Clinical Coordinator ; Schedule HHA.",
      "Controlled-policy focus — CL-SD-006, 4\\. Policy Statement. 4.1 HHA services shall be provided only by individuals who have completed a home health aide training program meeting the requirements of 42 CFR § 484.80(b) and have passed a competency evaluation per 42 CFR § 484.80(c) and agency policy CL-SD-007. 4.2 HHA services shall be authorized by a physician order and reflected in the plan of care, which shall specify: (a) the type of personal care services to be provided; (b) the frequency and duration of HHA visits; (c) any specific clinical parameters the HHA must observe and report (e.g., skin checks, intake/output monitoring, vital signs — if trained and competency-validated). 4.3 Each patient receiving HHA services shall have a written HHA care plan (also called an.",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — HR-TD-003, 12\\. Appendices. Appendix A — Clinical Competency Evaluation Tool Care Indeed Home Health Care, Inc. ; HR-TD-003 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Evaluator ; __________________ ; ; ; ; ; ; ; ; ; Evaluation Type: ☐ Initial (Orientation) ☐ Annual Year: ______ ; Date ; ________ ; ; ; ; ; # ; Competency Area ; Evaluation Method ; Rating (C=Competent / NI=Needs Improvement / NC=Not Competent) ; Evidence / Comments ; ; ; ; ; ; ; ; CORE COMPETENCIES (All Clinical Staff) ; ; ; ; ; ; 1 ; Hand hygiene and infection control ; Return Demo ; ☐C ☐NI ☐NC ; __________________ ; ; 2 ; Standard precautions.",
      "Controlled-policy focus — CL-SD-006, RN Supervisory Visits. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Coordinator ; Track the 14-day supervisory visit schedule for every patient receiving HHA services. Generate alerts when a supervisory visit is due within 3 calendar days. ; Ongoing; alerts generated at Day 11. ; ; 6.3.2 ; Assigned RN ; Conduct the RN supervisory visit at the patient's home while the HHA is providing care, per the 14-day schedule. Complete all supervisory elements per Section 4.5. ; Every 14 calendar days. ; ; 6.3.3 ; Assigned RN ; Document the supervisory visit in the patient's clinical record using the HHA Supervisory Visit Form (Appendix A). The form shall include: date.",
      "Apply the controlled requirements to the three visible objects in the scene for assign patient-specific tasks from the current plan of care. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the observation clipboard, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Observation Clipboard", detail: "Review the observation clipboard for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80(b)" },
      { kind: "External Authority", text: "42 CFR § 484.80(c)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "blood-pressure-cuff-2-1", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 16, y: 69, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Assume the blood-pressure cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assign patient-specific tasks from the current plan of care." },
          { id: "i3", label: "Dismiss the conflict between the blood-pressure cuff and stethoscope because one source appears more convenient. This identify option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the blood-pressure cuff without confirming an applicable order and patient-specific authority. This decide option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Hand the blood-pressure cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assign patient-specific tasks from the current plan of care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the blood-pressure cuff before reassessment confirms the patient response. This document option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Copy the prior assign patient-specific tasks from the current plan of care narrative even though today’s blood-pressure cuff evidence is different. This document option concerns blood-pressure cuff during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assign patient-specific tasks from the current plan of care." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "stethoscope-2-2", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 36, y: 40, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the stethoscope as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the observation clipboard, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with observation clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the observation clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with observation clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stethoscope and omit the related change, symptom, or safety cue. This identify option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assign patient-specific tasks from the current plan of care." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stethoscope stand in for direct RN assessment. This identify option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for assign patient-specific tasks from the current plan of care instead of the current controlled clinical pathway. This decide option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assign patient-specific tasks from the current plan of care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stethoscope and omit the discrepancy with observation clipboard. This document option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Combine the stethoscope issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stethoscope during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assign patient-specific tasks from the current plan of care." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the observation clipboard, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the observation clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with observation clipboard and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "observation-clipboard-2-3", label: "observation clipboard", shortLabel: "observation clipboard", ariaLabel: "Investigate observation clipboard",        x: 85, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the observation clipboard as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the observation clipboard as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the observation clipboard as the complete assessment and do not compare the blood-pressure cuff, patient report, or current record. This identify option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for assign patient-specific tasks from the current plan of care." },
          { id: "i3", label: "Carry forward the prior visit conclusion for assign patient-specific tasks from the current plan of care without reassessing the patient today. This identify option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about observation clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the observation clipboard alone and seek clarification only after the intervention is complete. This decide option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for observation clipboard is resolved." },
          { id: "d3", label: "Defer the concern in the observation clipboard to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during assign patient-specific tasks from the current plan of care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For observation clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For observation clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the observation clipboard was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of observation clipboard." },
          { id: "doc3", label: "Keep the observation clipboard decision in personal notes rather than the governed patient record. This document option concerns observation clipboard during assign patient-specific tasks from the current plan of care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for assign patient-specific tasks from the current plan of care." },
        ],
        feedback: {
          observed: "Observe the observation clipboard as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the observation clipboard as patient-specific evidence for assign patient-specific tasks from the current plan of care. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for assign patient-specific tasks from the current plan of care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation clipboard, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for assign patient-specific tasks from the current plan of care. For observation clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Supervi",
    title: "Supervise LVN services and escalation pathways",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for supervise lvn services and escalation pathways within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in HR-TA-005, CL-SD-006, CL-SD-007, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — HR-TA-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; New clinical employee fails competency assessment after extended orientation period ; DON notifies Administrator and HR Director. ; Employment may be terminated during probationary period per HR-ER-002. DON documents specific competency deficits and remediation efforts attempted. ; Decision within 5 business days of failed extended assessment. ; ; Orientation not completed within required timeframe due to scheduling issues ; HR Director notifies Administrator. ; Orientation completion deadline extended with documented justification. Employee remains under supervision until completed. ; Extension approved within 3 business days; orientation completed within 15 additional days. ; ; Contract staff refuses abbreviated orientation ; HR Director denies assignment.",
      "Controlled-policy focus — CL-SD-006, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; 14-day supervisory visit not completed on schedule ; Clinical Coordinator alerts Director of Nursing at Day 15 ; Director of Nursing directs the assigned RN to complete the supervisory visit immediately. If the lapse is greater than 21 days, document the gap and report to Compliance Officer as a CMS compliance issue. ; Supervisory visit within 24 hours of identification; compliance reporting within 48 hours for lapses >21 days. ; ; HHA performs tasks not on the HHA care plan ; RN identifies during supervisory visit or chart review ; Remove the HHA from the patient if the task was outside their.",
      "Controlled-policy focus — CL-SD-007, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; HHA's annual evaluation is overdue ; Director of Nursing is alerted at due date ; Director of Nursing immediately removes the HHA from patient care until the evaluation is completed. ; HHA removed from care immediately; evaluation within 7 calendar days. ; ; HHA fails the same skill area repeatedly (3+ times) ; Director of Nursing and HR Director ; Termination evaluation per HR-ER-002. HHA is not permitted to deliver patient care in the failed skill area. ; Employment determination within 7 calendar days. ; ; New task is added to a patient's HHA care plan that the HHA has not been.",
      "Controlled-policy focus — CL-SD-008, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Supervisory visit reveals unsafe clinical practice ; Supervisor immediately intervenes ; Remove staff from patient care if safety risk is immediate. Report to Director of Nursing within 4 hours. File incident report per RM-ER-002 if patient harm occurred or was narrowly avoided. Director of Nursing determines next steps including potential suspension pending investigation per HR-ER-002. ; Immediate intervention; Director of Nursing notification within 4 hours. ; ; Staff member refuses supervisory oversight ; Director of Nursing notified ; Director of Nursing counsels the staff member on the supervisory requirement. If refusal persists, initiate disciplinary action per HR-ER-002. ; Counseling within 48 hours.",
      "Apply the controlled requirements to the three visible objects in the scene for supervise lvn services and escalation pathways. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Aide Care Card", detail: "Review the aide care card for the patient-specific finding. Reconcile it with the gait belt, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Gait Belt", detail: "Review the gait belt for the patient-specific finding. Reconcile it with the nonslip socks, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Nonslip Socks", detail: "Review the nonslip socks for the patient-specific finding. Reconcile it with the aide care card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80(c)" },
      { kind: "External Authority", text: "42 CFR § 484.80(h)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "aide-care-card-3-1", label: "aide care card", shortLabel: "aide care card", ariaLabel: "Investigate aide care card",        x: 14, y: 51, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the aide care card as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For aide care card, compare the visible evidence with gait belt and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the aide care card as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For aide care card, compare the visible evidence with gait belt and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the aide care card and omit the related change, symptom, or safety cue. This identify option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise lvn services and escalation pathways." },
          { id: "i3", label: "Let a blank, unreadable, or unverified aide care card stand in for direct RN assessment. This identify option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about aide care card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to aide care card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to aide care card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the aide care card issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for aide care card is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for supervise lvn services and escalation pathways instead of the current controlled clinical pathway. This decide option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise lvn services and escalation pathways." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For aide care card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For aide care card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the aide care card and omit the discrepancy with gait belt. This document option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of aide care card." },
          { id: "doc3", label: "Combine the aide care card issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns aide care card during supervise lvn services and escalation pathways.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise lvn services and escalation pathways." },
        ],
        feedback: {
          observed: "Observe the aide care card as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the aide care card as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For aide care card, compare the visible evidence with gait belt and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to aide care card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For aide care card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "gait-belt-3-2", label: "gait belt", shortLabel: "gait belt", ariaLabel: "Investigate gait belt",        x: 39, y: 39, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the gait belt as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the nonslip socks, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with nonslip socks and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the gait belt as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the nonslip socks, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with nonslip socks and the controlling source before classifying status." },
          { id: "i2", label: "Treat the gait belt as the complete assessment and do not compare the nonslip socks, patient report, or current record. This identify option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise lvn services and escalation pathways." },
          { id: "i3", label: "Carry forward the prior visit conclusion for supervise lvn services and escalation pathways without reassessing the patient today. This identify option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about gait belt." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the gait belt alone and seek clarification only after the intervention is complete. This decide option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for gait belt is resolved." },
          { id: "d3", label: "Defer the concern in the gait belt to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise lvn services and escalation pathways." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For gait belt, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For gait belt, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the gait belt was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of gait belt." },
          { id: "doc3", label: "Keep the gait belt decision in personal notes rather than the governed patient record. This document option concerns gait belt during supervise lvn services and escalation pathways.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise lvn services and escalation pathways." },
        ],
        feedback: {
          observed: "Observe the gait belt as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the nonslip socks, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the gait belt as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the nonslip socks, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with nonslip socks and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For gait belt, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "nonslip-socks-3-3", label: "nonslip socks", shortLabel: "nonslip socks", ariaLabel: "Investigate nonslip socks",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the nonslip socks as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the aide care card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip socks, compare the visible evidence with aide care card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nonslip socks as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the aide care card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip socks, compare the visible evidence with aide care card and the controlling source before classifying status." },
          { id: "i2", label: "Assume the nonslip socks establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise lvn services and escalation pathways." },
          { id: "i3", label: "Dismiss the conflict between the nonslip socks and aide care card because one source appears more convenient. This identify option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nonslip socks." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip socks; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip socks; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the nonslip socks without confirming an applicable order and patient-specific authority. This decide option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nonslip socks is resolved." },
          { id: "d3", label: "Hand the nonslip socks concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise lvn services and escalation pathways." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For nonslip socks, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For nonslip socks, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the nonslip socks before reassessment confirms the patient response. This document option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nonslip socks." },
          { id: "doc3", label: "Copy the prior supervise lvn services and escalation pathways narrative even though today’s nonslip socks evidence is different. This document option concerns nonslip socks during supervise lvn services and escalation pathways.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise lvn services and escalation pathways." },
        ],
        feedback: {
          observed: "Observe the nonslip socks as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the aide care card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nonslip socks as patient-specific evidence for supervise lvn services and escalation pathways. Compare it with the aide care card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise lvn services and escalation pathways, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nonslip socks, compare the visible evidence with aide care card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nonslip socks; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise lvn services and escalation pathways. For nonslip socks, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Supervi",
    title: "Supervise HHA services under current regulatory context",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for supervise hha services under current regulatory context within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in HR-TA-005, CL-SD-008, CL-SD-006, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — CL-SD-008, 4\\. Policy Statement. 4.1 The Director of Nursing / Clinical Manager is responsible for the oversight and supervision of all clinical services provided by the agency, as required by 42 CFR § 484.115(b). The Director of Nursing shall be a registered nurse who is currently licensed in California, meets the CMS qualification requirements, and has the authority and accountability to ensure the clinical quality and regulatory compliance of all services. 4.2 The supervision structure shall operate at three levels: Level 1 — Director of Nursing Oversight: The Director of Nursing provides enterprise-level clinical oversight of all disciplines and clinical functions, including: review of clinical outcomes, quality indicators, documentation compliance, and survey readiness. Level 2 — Discipline-Specific Professional Supervision: Licensed professionals (PTs.",
      "Controlled-policy focus — CL-SD-006, 2\\. Purpose. This policy establishes the service delivery standards, supervision requirements, and documentation expectations for home health aide (HHA) services at Care Indeed Home Health Care, Inc. Home health aide services are a Medicare-covered service available only in conjunction with a qualifying skilled service and only when the patient requires personal care assistance as part of the physician-approved plan of care. The HHA provides hands-on personal care, simple health-related services, and assistance with activities that support the skilled care plan — but does not perform skilled clinical services, medication administration, or clinical assessments. The CMS Conditions of Participation impose the most prescriptive supervision requirements on HHA services of any home health discipline, and non-compliance with HHA supervision requirements is one.",
      "Controlled-policy focus — HR-TA-005, Role-Specific / Clinical Orientation (Days 1-30). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing / Supervisor ; Initiate role-specific orientation using the Role-Specific/Clinical Orientation Checklist (Appendix B). For clinical staff, the checklist must include: (a) EHR system training and proficiency demonstration; (b) OASIS training and assessment (per CL-OA-003, CL-OA-018); (c) Clinical documentation standards (CL-CD-001 through CL-CD-004); (d) Care planning and physician order management (CL-CP-001 through CL-CP-009); (e) Discipline-specific clinical protocols; (f) Medication management (CL-SD-012, CL-SD-013); (g) Fall risk assessment (CL-SD-015); (h) Wound care standards (CL-SD-011, if applicable); (i) Pain assessment (CL-SD-014); (j) Infection prevention — clinical application; (k) Patient identification and verification (OP-PA-002); (l) Homebound status determination (CL-CA-005); (m) Supervised patient visits.",
      "Controlled-policy focus — CL-SD-008, 2\\. Purpose. This policy defines the requirements for clinical supervision of all professional and paraprofessional staff providing patient care at Care Indeed Home Health Care, Inc. Clinical supervision is the systematic process by which the agency ensures that all clinical services are delivered safely, competently, and in accordance with the plan of care, professional standards, and regulatory requirements. This policy establishes the supervision structure, frequency, documentation requirements, and escalation procedures for the oversight of RNs, LVNs, PTs, PTAs, OTs, COTAs, SLPs, MSWs, and HHAs. It implements the requirements of 42 CFR § 484.75 (skilled professional services) and 42 CFR § 484.80 (home health aide services) as they relate to clinical supervision..",
      "Apply the controlled requirements to the three visible objects in the scene for supervise hha services under current regulatory context. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Shower Chair", detail: "Review the shower chair for the patient-specific finding. Reconcile it with the gait belt, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Gait Belt", detail: "Review the gait belt for the patient-specific finding. Reconcile it with the report card, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Report Card", detail: "Review the report card for the patient-specific finding. Reconcile it with the shower chair, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.80(h)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "shower-chair-4-1", label: "shower chair", shortLabel: "shower chair", ariaLabel: "Investigate shower chair",        x: 19, y: 45, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the shower chair as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with gait belt and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the shower chair as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with gait belt and the controlling source before classifying status." },
          { id: "i2", label: "Treat the shower chair as the complete assessment and do not compare the gait belt, patient report, or current record. This identify option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise hha services under current regulatory context." },
          { id: "i3", label: "Carry forward the prior visit conclusion for supervise hha services under current regulatory context without reassessing the patient today. This identify option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about shower chair." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the shower chair alone and seek clarification only after the intervention is complete. This decide option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for shower chair is resolved." },
          { id: "d3", label: "Defer the concern in the shower chair to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise hha services under current regulatory context." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For shower chair, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For shower chair, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the shower chair was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of shower chair." },
          { id: "doc3", label: "Keep the shower chair decision in personal notes rather than the governed patient record. This document option concerns shower chair during supervise hha services under current regulatory context.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise hha services under current regulatory context." },
        ],
        feedback: {
          observed: "Observe the shower chair as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the shower chair as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the gait belt, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For shower chair, compare the visible evidence with gait belt and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to shower chair; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For shower chair, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "gait-belt-4-2", label: "gait belt", shortLabel: "gait belt", ariaLabel: "Investigate gait belt",        x: 34, y: 77, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the gait belt as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the report card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with report card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the gait belt as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the report card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with report card and the controlling source before classifying status." },
          { id: "i2", label: "Assume the gait belt establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise hha services under current regulatory context." },
          { id: "i3", label: "Dismiss the conflict between the gait belt and report card because one source appears more convenient. This identify option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about gait belt." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the gait belt without confirming an applicable order and patient-specific authority. This decide option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for gait belt is resolved." },
          { id: "d3", label: "Hand the gait belt concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise hha services under current regulatory context." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For gait belt, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For gait belt, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the gait belt before reassessment confirms the patient response. This document option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of gait belt." },
          { id: "doc3", label: "Copy the prior supervise hha services under current regulatory context narrative even though today’s gait belt evidence is different. This document option concerns gait belt during supervise hha services under current regulatory context.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise hha services under current regulatory context." },
        ],
        feedback: {
          observed: "Observe the gait belt as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the report card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the gait belt as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the report card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For gait belt, compare the visible evidence with report card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to gait belt; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For gait belt, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "report-card-4-3", label: "report card", shortLabel: "report card", ariaLabel: "Investigate report card",        x: 86, y: 54, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the report card as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For report card, compare the visible evidence with shower chair and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the report card as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For report card, compare the visible evidence with shower chair and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the report card and omit the related change, symptom, or safety cue. This identify option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for supervise hha services under current regulatory context." },
          { id: "i3", label: "Let a blank, unreadable, or unverified report card stand in for direct RN assessment. This identify option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about report card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to report card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to report card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the report card issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for report card is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for supervise hha services under current regulatory context instead of the current controlled clinical pathway. This decide option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during supervise hha services under current regulatory context." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For report card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For report card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the report card and omit the discrepancy with shower chair. This document option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of report card." },
          { id: "doc3", label: "Combine the report card issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns report card during supervise hha services under current regulatory context.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for supervise hha services under current regulatory context." },
        ],
        feedback: {
          observed: "Observe the report card as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the report card as patient-specific evidence for supervise hha services under current regulatory context. Compare it with the shower chair, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for supervise hha services under current regulatory context, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For report card, compare the visible evidence with shower chair and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to report card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for supervise hha services under current regulatory context. For report card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Observe",
    title: "Observe performance, patient outcomes, and care-plan adherence",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for observe performance, patient outcomes, and care-plan adherence within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in CL-SD-006, CL-SD-007, HR-TD-003, HR-TA-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-006, 4\\. Policy Statement. 4.1 HHA services shall be provided only by individuals who have completed a home health aide training program meeting the requirements of 42 CFR § 484.80(b) and have passed a competency evaluation per 42 CFR § 484.80(c) and agency policy CL-SD-007. 4.2 HHA services shall be authorized by a physician order and reflected in the plan of care, which shall specify: (a) the type of personal care services to be provided; (b) the frequency and duration of HHA visits; (c) any specific clinical parameters the HHA must observe and report (e.g., skin checks, intake/output monitoring, vital signs — if trained and competency-validated). 4.3 Each patient receiving HHA services shall have a written HHA care plan (also called an.",
      "Controlled-policy focus — CL-SD-007, 4\\. Policy Statement. 4.1 Every HHA shall complete an initial competency evaluation before being assigned to provide patient care. The initial evaluation shall cover all skill areas required by 42 CFR § 484.80(c)(1) including but not limited to: (a) communication skills; (b) observation, reporting, and documentation of patient status and services delivered; (c) reading and recording temperature, pulse, and respiration; (d) basic infection control procedures; (e) maintenance of a clean, safe, and healthy environment; (f) recognizing emergencies and knowledge of emergency procedures; (g) safe transfer and ambulation techniques; (h) range of motion and positioning; (i) adequate nutrition and fluid intake; (j) personal care services including bathing, skin care, hair care, nail care, oral hygiene, toileting, dressing, and feeding; (k) safe operation.",
      "Controlled-policy focus — HR-TD-003, 12\\. Appendices. Appendix A — Clinical Competency Evaluation Tool Care Indeed Home Health Care, Inc. ; HR-TD-003 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Evaluator ; __________________ ; ; ; ; ; ; ; ; ; Evaluation Type: ☐ Initial (Orientation) ☐ Annual Year: ______ ; Date ; ________ ; ; ; ; ; # ; Competency Area ; Evaluation Method ; Rating (C=Competent / NI=Needs Improvement / NC=Not Competent) ; Evidence / Comments ; ; ; ; ; ; ; ; CORE COMPETENCIES (All Clinical Staff) ; ; ; ; ; ; 1 ; Hand hygiene and infection control ; Return Demo ; ☐C ☐NI ☐NC ; __________________ ; ; 2 ; Standard precautions.",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — CL-SD-006, 5\\. Definitions. Term ; Definition ; ; ; ; ; Home Health Aide (HHA) ; A trained and competency-validated individual who provides personal care and simple health-related services to patients in the home under the supervision of a registered nurse or therapist. ; ; HHA Care Plan ; A written, patient-specific assignment document prepared by the supervising RN that specifies the tasks the HHA is authorized and required to perform at each visit. ; ; Supervisory Visit ; A visit conducted by a registered nurse (or, in certain circumstances, a therapist) to the patient's home to observe and evaluate the HHA's performance while the HHA is delivering care. ; ; Personal Care Services ; Hands-on assistance with activities of daily.",
      "Apply the controlled requirements to the three visible objects in the scene for observe performance, patient outcomes, and care-plan adherence. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Competency Card", detail: "Review the competency card for the patient-specific finding. Reconcile it with the nursing bag, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Nursing Bag", detail: "Review the nursing bag for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the competency card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "competency-card-5-1", label: "competency card", shortLabel: "competency card", ariaLabel: "Investigate competency card",        x: 14, y: 68, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the competency card as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency card, compare the visible evidence with nursing bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the competency card as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency card, compare the visible evidence with nursing bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the competency card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for observe performance, patient outcomes, and care-plan adherence." },
          { id: "i3", label: "Dismiss the conflict between the competency card and nursing bag because one source appears more convenient. This identify option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about competency card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the competency card without confirming an applicable order and patient-specific authority. This decide option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for competency card is resolved." },
          { id: "d3", label: "Hand the competency card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during observe performance, patient outcomes, and care-plan adherence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For competency card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For competency card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the competency card before reassessment confirms the patient response. This document option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency card." },
          { id: "doc3", label: "Copy the prior observe performance, patient outcomes, and care-plan adherence narrative even though today’s competency card evidence is different. This document option concerns competency card during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for observe performance, patient outcomes, and care-plan adherence." },
        ],
        feedback: {
          observed: "Observe the competency card as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the competency card as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the nursing bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency card, compare the visible evidence with nursing bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For competency card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "nursing-bag-5-2", label: "nursing bag", shortLabel: "nursing bag", ariaLabel: "Investigate nursing bag",        x: 35, y: 45, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the nursing bag as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nursing bag as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the nursing bag and omit the related change, symptom, or safety cue. This identify option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for observe performance, patient outcomes, and care-plan adherence." },
          { id: "i3", label: "Let a blank, unreadable, or unverified nursing bag stand in for direct RN assessment. This identify option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nursing bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the nursing bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nursing bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for observe performance, patient outcomes, and care-plan adherence instead of the current controlled clinical pathway. This decide option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during observe performance, patient outcomes, and care-plan adherence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For nursing bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For nursing bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the nursing bag and omit the discrepancy with stethoscope. This document option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nursing bag." },
          { id: "doc3", label: "Combine the nursing bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns nursing bag during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for observe performance, patient outcomes, and care-plan adherence." },
        ],
        feedback: {
          observed: "Observe the nursing bag as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nursing bag as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing bag, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For nursing bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "stethoscope-5-3", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 77, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the stethoscope as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the competency card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with competency card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the competency card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with competency card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the stethoscope as the complete assessment and do not compare the competency card, patient report, or current record. This identify option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for observe performance, patient outcomes, and care-plan adherence." },
          { id: "i3", label: "Carry forward the prior visit conclusion for observe performance, patient outcomes, and care-plan adherence without reassessing the patient today. This identify option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the stethoscope alone and seek clarification only after the intervention is complete. This decide option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Defer the concern in the stethoscope to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during observe performance, patient outcomes, and care-plan adherence." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the stethoscope was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Keep the stethoscope decision in personal notes rather than the governed patient record. This document option concerns stethoscope during observe performance, patient outcomes, and care-plan adherence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for observe performance, patient outcomes, and care-plan adherence." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the competency card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for observe performance, patient outcomes, and care-plan adherence. Compare it with the competency card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for observe performance, patient outcomes, and care-plan adherence, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with competency card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for observe performance, patient outcomes, and care-plan adherence. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Address",
    title: "Address deficiencies, retraining, assignment hold, and escalation",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for address deficiencies, retraining, assignment hold, and escalation within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in CL-SD-006, HR-TA-005, CL-SD-007, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-006, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; 14-day supervisory visit not completed on schedule ; Clinical Coordinator alerts Director of Nursing at Day 15 ; Director of Nursing directs the assigned RN to complete the supervisory visit immediately. If the lapse is greater than 21 days, document the gap and report to Compliance Officer as a CMS compliance issue. ; Supervisory visit within 24 hours of identification; compliance reporting within 48 hours for lapses >21 days. ; ; HHA performs tasks not on the HHA care plan ; RN identifies during supervisory visit or chart review ; Remove the HHA from the patient if the task was outside their.",
      "Controlled-policy focus — HR-TA-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; New clinical employee fails competency assessment after extended orientation period ; DON notifies Administrator and HR Director. ; Employment may be terminated during probationary period per HR-ER-002. DON documents specific competency deficits and remediation efforts attempted. ; Decision within 5 business days of failed extended assessment. ; ; Orientation not completed within required timeframe due to scheduling issues ; HR Director notifies Administrator. ; Orientation completion deadline extended with documented justification. Employee remains under supervision until completed. ; Extension approved within 3 business days; orientation completed within 15 additional days. ; ; Contract staff refuses abbreviated orientation ; HR Director denies assignment.",
      "Controlled-policy focus — CL-SD-006, HHA Assignment and Care Plan Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; When HHA services are ordered in the plan of care, develop a written, patient-specific HHA care plan specifying all tasks per Section 4.3. The HHA care plan shall be consistent with and derived from the physician-approved plan of care. ; Within 24 hours of HHA service initiation. ; ; 6.1.2 ; Assigned RN ; Provide the assigned HHA with the written HHA care plan before the first HHA visit. Review the care plan verbally with the HHA to ensure understanding. Document the orientation. ; Before the first HHA visit. ; ; 6.1.3 ; Clinical Coordinator ; Schedule HHA.",
      "Controlled-policy focus — CL-SD-007, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; HHA's annual evaluation is overdue ; Director of Nursing is alerted at due date ; Director of Nursing immediately removes the HHA from patient care until the evaluation is completed. ; HHA removed from care immediately; evaluation within 7 calendar days. ; ; HHA fails the same skill area repeatedly (3+ times) ; Director of Nursing and HR Director ; Termination evaluation per HR-ER-002. HHA is not permitted to deliver patient care in the failed skill area. ; Employment determination within 7 calendar days. ; ; New task is added to a patient's HHA care plan that the HHA has not been.",
      "Controlled-policy focus — CL-SD-008, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Supervisory visit reveals unsafe clinical practice ; Supervisor immediately intervenes ; Remove staff from patient care if safety risk is immediate. Report to Director of Nursing within 4 hours. File incident report per RM-ER-002 if patient harm occurred or was narrowly avoided. Director of Nursing determines next steps including potential suspension pending investigation per HR-ER-002. ; Immediate intervention; Director of Nursing notification within 4 hours. ; ; Staff member refuses supervisory oversight ; Director of Nursing notified ; Director of Nursing counsels the staff member on the supervisory requirement. If refusal persists, initiate disciplinary action per HR-ER-002. ; Counseling within 48 hours.",
      "Apply the controlled requirements to the three visible objects in the scene for address deficiencies, retraining, assignment hold, and escalation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Variance Card", detail: "Review the variance card for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the training model arm, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Training Model Arm", detail: "Review the training model arm for the patient-specific finding. Reconcile it with the variance card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "variance-card-6-1", label: "variance card", shortLabel: "variance card", ariaLabel: "Investigate variance card",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the variance card as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For variance card, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the variance card as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For variance card, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the variance card and omit the related change, symptom, or safety cue. This identify option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address deficiencies, retraining, assignment hold, and escalation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified variance card stand in for direct RN assessment. This identify option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about variance card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to variance card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to variance card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the variance card issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for variance card is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for address deficiencies, retraining, assignment hold, and escalation instead of the current controlled clinical pathway. This decide option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address deficiencies, retraining, assignment hold, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For variance card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For variance card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the variance card and omit the discrepancy with blood-pressure cuff. This document option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of variance card." },
          { id: "doc3", label: "Combine the variance card issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns variance card during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address deficiencies, retraining, assignment hold, and escalation." },
        ],
        feedback: {
          observed: "Observe the variance card as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the variance card as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For variance card, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to variance card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For variance card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "blood-pressure-cuff-6-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 32, y: 55, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the training model arm, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with training model arm and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the training model arm, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with training model arm and the controlling source before classifying status." },
          { id: "i2", label: "Treat the blood-pressure cuff as the complete assessment and do not compare the training model arm, patient report, or current record. This identify option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address deficiencies, retraining, assignment hold, and escalation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for address deficiencies, retraining, assignment hold, and escalation without reassessing the patient today. This identify option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the blood-pressure cuff alone and seek clarification only after the intervention is complete. This decide option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Defer the concern in the blood-pressure cuff to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address deficiencies, retraining, assignment hold, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the blood-pressure cuff was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Keep the blood-pressure cuff decision in personal notes rather than the governed patient record. This document option concerns blood-pressure cuff during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address deficiencies, retraining, assignment hold, and escalation." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the training model arm, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the training model arm, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with training model arm and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "training-model-arm-6-3", label: "training model arm", shortLabel: "training model arm", ariaLabel: "Investigate training model arm",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the training model arm as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the variance card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For training model arm, compare the visible evidence with variance card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the training model arm as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the variance card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For training model arm, compare the visible evidence with variance card and the controlling source before classifying status." },
          { id: "i2", label: "Assume the training model arm establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for address deficiencies, retraining, assignment hold, and escalation." },
          { id: "i3", label: "Dismiss the conflict between the training model arm and variance card because one source appears more convenient. This identify option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about training model arm." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to training model arm; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to training model arm; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the training model arm without confirming an applicable order and patient-specific authority. This decide option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for training model arm is resolved." },
          { id: "d3", label: "Hand the training model arm concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during address deficiencies, retraining, assignment hold, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For training model arm, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For training model arm, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the training model arm before reassessment confirms the patient response. This document option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of training model arm." },
          { id: "doc3", label: "Copy the prior address deficiencies, retraining, assignment hold, and escalation narrative even though today’s training model arm evidence is different. This document option concerns training model arm during address deficiencies, retraining, assignment hold, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for address deficiencies, retraining, assignment hold, and escalation." },
        ],
        feedback: {
          observed: "Observe the training model arm as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the variance card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the training model arm as patient-specific evidence for address deficiencies, retraining, assignment hold, and escalation. Compare it with the variance card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for address deficiencies, retraining, assignment hold, and escalation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For training model arm, compare the visible evidence with variance card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to training model arm; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for address deficiencies, retraining, assignment hold, and escalation. For training model arm, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Documen",
    title: "Document supervision, follow-up, and competency boundary",
    subtitle: "Supervisory Responsibilities — LVN & HHA",
    narration: [
      "This lesson develops registered-nurse reasoning for document supervision, follow-up, and competency boundary within Supervisory Responsibilities — LVN & HHA. Use the current controlled requirements in HR-TD-003, CL-SD-007, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TD-003, Annual Competency Evaluation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Director of Nursing / HR Director ; By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. ; By January 31 each year. ; ; 6.2.2 ; Clinical Supervisors / DON Designees ; Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific.",
      "Controlled-policy focus — HR-TD-003, Competency Remediation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Supervisor ; When a competency deficit is identified: meet with the employee to discuss the finding. Develop a written Competency Remediation Plan (Appendix C) specifying: (a) the specific competency deficit; (b) targeted education/training interventions; (c) practice opportunities; (d) reassessment method and criteria; (e) timeline for completion (not to exceed 60 calendar days); (f) responsible supervisor. ; Within 7 business days of identifying the deficit. ; ; 6.3.2 ; Employee ; Complete all remediation activities as defined in the plan. ; Per plan timeline. ; ; 6.3.3 ; Clinical Supervisor ; Conduct reassessment using the method specified in the plan. Document.",
      "Controlled-policy focus — HR-TD-003, Initial Competency Evaluation (During Orientation). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Using the Clinical Competency Evaluation Tool (Appendix A), identify the competencies required for the new employee's position based on: (a) job description essential functions; (b) discipline-specific regulatory requirements; (c) agency clinical protocols; (d) current patient population care needs. ; Prior to orientation start. ; ; 6.1.2 ; Preceptor / DON Designee ; Evaluate the new employee on all required competencies during the orientation period per HR-TA-005. Methods: (a) Skills check-off for hands-on competencies (Appendix A checklist); (b) Written assessment for knowledge-based competencies; (c) Supervised visit evaluations per HR-TA-005, Appendix E; (d) EHR proficiency demonstration; (e) OASIS competency.",
      "Controlled-policy focus — HR-TD-003, Home Health Aide Competency (42 CFR § 484.80). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing / RN Supervisor ; Evaluate each HHA on all competency areas required by 42 CFR § 484.80(h) at hire and at least every 12 months: (a) Communication skills; (b) Observation, reporting, documentation; (c) Reading/recording vital signs; (d) Basic infection control; (e) Basic body mechanics/safe transfer; (f) Basic nutrition/meal prep; (g) Maintenance of clean/safe/healthy environment; (h) Understanding of patient/family emotional, spiritual, cultural needs; (i) Subject areas specific to patient assignments. Use the HHA Competency Evaluation Form (Appendix D). ; At hire and annually. ; ; 6.4.2 ; RN Supervisor ; Conduct a supervised HHA visit at least every 14.",
      "Controlled-policy focus — CL-SD-007, Initial Competency Evaluation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; HR Director / Director of Nursing ; Upon hire, verify that the HHA has completed a state-approved HHA training program or equivalent per 42 CFR § 484.80(b). Verify training certificate and document in the personnel file. ; At hire, before patient care assignment. ; ; 6.1.2 ; Director of Nursing / Designated RN Evaluator ; Administer the written (or oral) knowledge assessment covering all skill areas in Section 4.1. Score the assessment. A passing score is ≥80%. ; At hire, before patient care assignment. ; ; 6.1.3 ; Director of Nursing / Designated RN Evaluator ; Conduct the return demonstration skills.",
      "Apply the controlled requirements to the three visible objects in the scene for document supervision, follow-up, and competency boundary. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Observation Checklist", detail: "Review the observation checklist for the patient-specific finding. Reconcile it with the personnel folder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Personnel Folder", detail: "Review the personnel folder for the patient-specific finding. Reconcile it with the stop token without text, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stop Token Without Text", detail: "Review the stop token without text for the patient-specific finding. Reconcile it with the observation checklist, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-006" },
      { kind: "Controlled Policy", text: "CL-SD-007" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "observation-checklist-7-1", label: "observation checklist", shortLabel: "observation checklist", ariaLabel: "Investigate observation checklist",        x: 15, y: 77, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the observation checklist as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the personnel folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation checklist, compare the visible evidence with personnel folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the observation checklist as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the personnel folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation checklist, compare the visible evidence with personnel folder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the observation checklist as the complete assessment and do not compare the personnel folder, patient report, or current record. This identify option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document supervision, follow-up, and competency boundary." },
          { id: "i3", label: "Carry forward the prior visit conclusion for document supervision, follow-up, and competency boundary without reassessing the patient today. This identify option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about observation checklist." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation checklist; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation checklist; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the observation checklist alone and seek clarification only after the intervention is complete. This decide option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for observation checklist is resolved." },
          { id: "d3", label: "Defer the concern in the observation checklist to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document supervision, follow-up, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For observation checklist, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For observation checklist, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the observation checklist was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of observation checklist." },
          { id: "doc3", label: "Keep the observation checklist decision in personal notes rather than the governed patient record. This document option concerns observation checklist during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document supervision, follow-up, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the observation checklist as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the personnel folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the observation checklist as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the personnel folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For observation checklist, compare the visible evidence with personnel folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to observation checklist; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For observation checklist, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "personnel-folder-7-2", label: "personnel folder", shortLabel: "personnel folder", ariaLabel: "Investigate personnel folder",        x: 53, y: 71, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the personnel folder as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the stop token without text, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For personnel folder, compare the visible evidence with stop token without text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the personnel folder as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the stop token without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For personnel folder, compare the visible evidence with stop token without text and the controlling source before classifying status." },
          { id: "i2", label: "Assume the personnel folder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document supervision, follow-up, and competency boundary." },
          { id: "i3", label: "Dismiss the conflict between the personnel folder and stop token without text because one source appears more convenient. This identify option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about personnel folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to personnel folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to personnel folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the personnel folder without confirming an applicable order and patient-specific authority. This decide option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for personnel folder is resolved." },
          { id: "d3", label: "Hand the personnel folder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document supervision, follow-up, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For personnel folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For personnel folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the personnel folder before reassessment confirms the patient response. This document option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of personnel folder." },
          { id: "doc3", label: "Copy the prior document supervision, follow-up, and competency boundary narrative even though today’s personnel folder evidence is different. This document option concerns personnel folder during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document supervision, follow-up, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the personnel folder as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the stop token without text, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the personnel folder as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the stop token without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For personnel folder, compare the visible evidence with stop token without text and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to personnel folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For personnel folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
      {
        id: "stop-token-without-text-7-3", label: "stop token without text", shortLabel: "stop token without text", ariaLabel: "Investigate stop token without text",        x: 75, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the stop token without text as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the observation checklist, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stop token without text, compare the visible evidence with observation checklist and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stop token without text as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the observation checklist, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stop token without text, compare the visible evidence with observation checklist and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stop token without text and omit the related change, symptom, or safety cue. This identify option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document supervision, follow-up, and competency boundary." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stop token without text stand in for direct RN assessment. This identify option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stop token without text." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stop token without text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stop token without text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stop token without text issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stop token without text is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for document supervision, follow-up, and competency boundary instead of the current controlled clinical pathway. This decide option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document supervision, follow-up, and competency boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For stop token without text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For stop token without text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stop token without text and omit the discrepancy with observation checklist. This document option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stop token without text." },
          { id: "doc3", label: "Combine the stop token without text issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stop token without text during document supervision, follow-up, and competency boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document supervision, follow-up, and competency boundary." },
        ],
        feedback: {
          observed: "Observe the stop token without text as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the observation checklist, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stop token without text as patient-specific evidence for document supervision, follow-up, and competency boundary. Compare it with the observation checklist, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document supervision, follow-up, and competency boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stop token without text, compare the visible evidence with observation checklist and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stop token without text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document supervision, follow-up, and competency boundary. For stop token without text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-006","CL-SD-007","CL-SD-008","HR-TD-003","HR-TA-005","42 CFR § 484.80","42 CFR § 484.80(b)","42 CFR § 484.80(c)","42 CFR § 484.80(h)","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During rn accountability and role-specific scope boundaries, the blood-pressure cuff conflicts with the nursing bag and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the blood-pressure cuff alone and seek clarification only after the intervention is complete. This option concerns rn accountability and role-specific scope boundaries.",
      "Assume the nursing bag is unchanged from the prior encounter and omit patient-specific reassessment during rn accountability and role-specific scope boundaries.",
      "Defer the concern in the blood-pressure cuff to the next routine visit even though its current clinical significance has not been assessed. This option concerns rn accountability and role-specific scope boundaries.",
      "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for rn accountability and role-specific scope boundaries within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 2,
    stem: "During assign patient-specific tasks from the current plan of care, the observation clipboard conflicts with the blood-pressure cuff and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the blood-pressure cuff is unchanged from the prior encounter and omit patient-specific reassessment during assign patient-specific tasks from the current plan of care.",
      "Hand the observation clipboard concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns assign patient-specific tasks from the current plan of care.",
      "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the observation clipboard without confirming an applicable order and patient-specific authority. This option concerns assign patient-specific tasks from the current plan of care.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for assign patient-specific tasks from the current plan of care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 3,
    stem: "During supervise lvn services and escalation pathways, the nonslip socks conflicts with the aide care card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the nonslip socks issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns supervise lvn services and escalation pathways.",
      "Use a familiar local shortcut for supervise lvn services and escalation pathways instead of the current controlled clinical pathway. This option concerns supervise lvn services and escalation pathways.",
      "Assume the aide care card is unchanged from the prior encounter and omit patient-specific reassessment during supervise lvn services and escalation pathways.",
      "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for supervise lvn services and escalation pathways within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 4,
    stem: "During supervise hha services under current regulatory context, the report card conflicts with the shower chair and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the shower chair is unchanged from the prior encounter and omit patient-specific reassessment during supervise hha services under current regulatory context.",
      "Defer the concern in the report card to the next routine visit even though its current clinical significance has not been assessed. This option concerns supervise hha services under current regulatory context.",
      "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the report card alone and seek clarification only after the intervention is complete. This option concerns supervise hha services under current regulatory context.",
    ],
    correct: 2,
    rationale: "Choose the safest patient-specific action for supervise hha services under current regulatory context within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 5,
    stem: "During observe performance, patient outcomes, and care-plan adherence, the stethoscope conflicts with the competency card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This option concerns observe performance, patient outcomes, and care-plan adherence.",
      "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the competency card is unchanged from the prior encounter and omit patient-specific reassessment during observe performance, patient outcomes, and care-plan adherence.",
      "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns observe performance, patient outcomes, and care-plan adherence.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for observe performance, patient outcomes, and care-plan adherence within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 6,
    stem: "During address deficiencies, retraining, assignment hold, and escalation, the training model arm conflicts with the variance card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for address deficiencies, retraining, assignment hold, and escalation instead of the current controlled clinical pathway. This option concerns address deficiencies, retraining, assignment hold, and escalation.",
      "Close the training model arm issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns address deficiencies, retraining, assignment hold, and escalation.",
      "Assume the variance card is unchanged from the prior encounter and omit patient-specific reassessment during address deficiencies, retraining, assignment hold, and escalation.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for address deficiencies, retraining, assignment hold, and escalation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 7,
    stem: "During document supervision, follow-up, and competency boundary, the stop token without text conflicts with the observation checklist and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the stop token without text alone and seek clarification only after the intervention is complete. This option concerns document supervision, follow-up, and competency boundary.",
      "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the observation checklist is unchanged from the prior encounter and omit patient-specific reassessment during document supervision, follow-up, and competency boundary.",
      "Defer the concern in the stop token without text to the next routine visit even though its current clinical significance has not been assessed. This option concerns document supervision, follow-up, and competency boundary.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for document supervision, follow-up, and competency boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-006, CL-SD-007, CL-SD-008, HR-TD-003, HR-TA-005.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.80 be used when applying Supervisory Responsibilities — LVN & HHA?",
    options: [
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
    ],
    correct: 1,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the blood-pressure cuff and training model arm into defensible RN practice for Supervisory Responsibilities — LVN & HHA?",
    options: [
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
      "A verbal assumption that another discipline will address every unresolved issue.",
    ],
    correct: 1,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Supervisory Responsibilities — LVN & HHA establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Automatic authority to perform every activity discussed in Supervisory Responsibilities — LVN & HHA without supervision.",
      "Knowledge of the controlled RN concepts in Supervisory Responsibilities — LVN & HHA, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
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


const STORAGE_KEY = 'rn-015-progress-v6000';

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

export default function RN015() {
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
          <span className="brand-text">RN-015 — Supervision</span>
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
