/**
 * RN-001 — RN Role & Scope of Practice in Home Health
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
import img01 from './assets/rn-001/rn-001-lesson-01.png';
import img02 from './assets/rn-001/rn-001-lesson-02.png';
import img03 from './assets/rn-001/rn-001-lesson-03.png';
import img04 from './assets/rn-001/rn-001-lesson-04.png';
import img05 from './assets/rn-001/rn-001-lesson-05.png';
import img06 from './assets/rn-001/rn-001-lesson-06.png';
import img07 from './assets/rn-001/rn-001-lesson-07.png';

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

const MODULE_META = { id: "RN-001", title: "RN Role & Scope of Practice in Home Health", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for RN qualifications, appointment, and home-health role authority, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Comprehensive assessment and RN-only clinical judgments, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Skilled nursing assessment, intervention, and evaluation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Orders, plan-of-care boundaries, and scope-safe practice, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Delegation, coordination, and accountability across disciplines, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Change-in-condition escalation, emergency response, and chain of command, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Documentation, competency validation, and independent-practice boundary, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 RN",
    title: "RN qualifications, appointment, and home-health role authority",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for rn qualifications, appointment, and home-health role authority within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in HR-TA-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TA-005, Role-Specific / Clinical Orientation (Days 1-30). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing / Supervisor ; Initiate role-specific orientation using the Role-Specific/Clinical Orientation Checklist (Appendix B). For clinical staff, the checklist must include: (a) EHR system training and proficiency demonstration; (b) OASIS training and assessment (per CL-OA-003, CL-OA-018); (c) Clinical documentation standards (CL-CD-001 through CL-CD-004); (d) Care planning and physician order management (CL-CP-001 through CL-CP-009); (e) Discipline-specific clinical protocols; (f) Medication management (CL-SD-012, CL-SD-013); (g) Fall risk assessment (CL-SD-015); (h) Wound care standards (CL-SD-011, if applicable); (i) Pain assessment (CL-SD-014); (j) Infection prevention — clinical application; (k) Patient identification and verification (OP-PA-002); (l) Homebound status determination (CL-CA-005); (m) Supervised patient visits.",
      "Controlled-policy focus — HR-TA-005, Orientation for Internal Transfers / Role Changes. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Receiving Supervisor / DON ; When an employee transfers to a new role or department, conduct role-specific orientation for the new position using Appendix B. General agency re-orientation is not required unless more than 12 months have elapsed since the employee's last general orientation or if significant policy changes have occurred. ; Within 30 calendar days of transfer effective date..",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — HR-TA-005, 4\\. Policy Statements. 4.1 Care Indeed Home Health Care, Inc. shall provide a mandatory, documented orientation program to every new employee before the employee independently performs any job duties, provides any patient care, or accesses protected health information. 4.2 Orientation shall consist of two components: (a) General Agency Orientation (required for all staff); and (b) Role-Specific/Clinical Orientation (required for clinical staff and position-specific for all other roles). 4.3 General Agency Orientation must be completed within the first 5 business days of employment. Role-Specific/Clinical Orientation must be completed within the first 30 calendar days of employment. Clinical staff may not conduct unsupervised patient visits until both components are satisfactorily completed and documented. 4.4 Orientation content shall be reviewed and updated at least.",
      "Controlled-policy focus — HR-TA-005, 5\\. Definitions. Term ; Definition ; ; ; ; ; General Agency Orientation ; The standardized orientation program covering agency-wide topics applicable to all employees regardless of position, including mission, compliance, HIPAA, safety, infection control, emergency preparedness, and workplace standards. ; ; Role-Specific Orientation ; The orientation component tailored to the specific duties, clinical competencies, documentation systems, and supervision requirements of the employee's assigned position. ; ; Clinical Orientation ; The role-specific orientation for clinical staff including EHR/OASIS training, clinical documentation standards, supervised patient visits, and competency validation. ; ; Preceptor ; An experienced, competent employee designated to mentor and supervise a new employee during the role-specific orientation period. ; ; Supervised Visit ; A patient care visit conducted by.",
      "Apply the controlled requirements to the three visible objects in the scene for rn qualifications, appointment, and home-health role authority. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Credential Badge", detail: "Review the credential badge for the patient-specific finding. Reconcile it with the closed agency policy binder, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Agency Policy Binder", detail: "Review the closed agency policy binder for the patient-specific finding. Reconcile it with the nursing visit bag, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Nursing Visit Bag", detail: "Review the nursing visit bag for the patient-specific finding. Reconcile it with the credential badge, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.75" },
      { kind: "External Authority", text: "42 CFR § 484.75(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "credential-badge-1-1", label: "credential badge", shortLabel: "credential badge", ariaLabel: "Investigate credential badge",        x: 23, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the credential badge as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the closed agency policy binder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed agency policy binder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the credential badge as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the closed agency policy binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed agency policy binder and the controlling source before classifying status." },
          { id: "i2", label: "Treat the credential badge as the complete assessment and do not compare the closed agency policy binder, patient report, or current record. This identify option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn qualifications, appointment, and home-health role authority." },
          { id: "i3", label: "Carry forward the prior visit conclusion for rn qualifications, appointment, and home-health role authority without reassessing the patient today. This identify option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about credential badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the credential badge alone and seek clarification only after the intervention is complete. This decide option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for credential badge is resolved." },
          { id: "d3", label: "Defer the concern in the credential badge to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn qualifications, appointment, and home-health role authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For credential badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For credential badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the credential badge was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of credential badge." },
          { id: "doc3", label: "Keep the credential badge decision in personal notes rather than the governed patient record. This document option concerns credential badge during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn qualifications, appointment, and home-health role authority." },
        ],
        feedback: {
          observed: "Observe the credential badge as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the closed agency policy binder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the credential badge as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the closed agency policy binder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed agency policy binder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For credential badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "closed-agency-policy-binder-1-2", label: "closed agency policy binder", shortLabel: "closed agency policy binder", ariaLabel: "Investigate closed agency policy binder",        x: 36, y: 67, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the closed agency policy binder as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the nursing visit bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed agency policy binder, compare the visible evidence with nursing visit bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed agency policy binder as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the nursing visit bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed agency policy binder, compare the visible evidence with nursing visit bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed agency policy binder establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn qualifications, appointment, and home-health role authority." },
          { id: "i3", label: "Dismiss the conflict between the closed agency policy binder and nursing visit bag because one source appears more convenient. This identify option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed agency policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed agency policy binder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed agency policy binder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed agency policy binder without confirming an applicable order and patient-specific authority. This decide option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed agency policy binder is resolved." },
          { id: "d3", label: "Hand the closed agency policy binder concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn qualifications, appointment, and home-health role authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For closed agency policy binder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For closed agency policy binder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed agency policy binder before reassessment confirms the patient response. This document option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed agency policy binder." },
          { id: "doc3", label: "Copy the prior rn qualifications, appointment, and home-health role authority narrative even though today’s closed agency policy binder evidence is different. This document option concerns closed agency policy binder during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn qualifications, appointment, and home-health role authority." },
        ],
        feedback: {
          observed: "Observe the closed agency policy binder as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the nursing visit bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed agency policy binder as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the nursing visit bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed agency policy binder, compare the visible evidence with nursing visit bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed agency policy binder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For closed agency policy binder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "nursing-visit-bag-1-3", label: "nursing visit bag", shortLabel: "nursing visit bag", ariaLabel: "Investigate nursing visit bag",        x: 84, y: 44, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the nursing visit bag as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing visit bag, compare the visible evidence with credential badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the nursing visit bag as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing visit bag, compare the visible evidence with credential badge and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the nursing visit bag and omit the related change, symptom, or safety cue. This identify option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for rn qualifications, appointment, and home-health role authority." },
          { id: "i3", label: "Let a blank, unreadable, or unverified nursing visit bag stand in for direct RN assessment. This identify option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about nursing visit bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing visit bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing visit bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the nursing visit bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for nursing visit bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for rn qualifications, appointment, and home-health role authority instead of the current controlled clinical pathway. This decide option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during rn qualifications, appointment, and home-health role authority." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For nursing visit bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For nursing visit bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the nursing visit bag and omit the discrepancy with credential badge. This document option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of nursing visit bag." },
          { id: "doc3", label: "Combine the nursing visit bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns nursing visit bag during rn qualifications, appointment, and home-health role authority.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for rn qualifications, appointment, and home-health role authority." },
        ],
        feedback: {
          observed: "Observe the nursing visit bag as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the nursing visit bag as patient-specific evidence for rn qualifications, appointment, and home-health role authority. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for rn qualifications, appointment, and home-health role authority, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For nursing visit bag, compare the visible evidence with credential badge and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to nursing visit bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for rn qualifications, appointment, and home-health role authority. For nursing visit bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Compreh",
    title: "Comprehensive assessment and RN-only clinical judgments",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for comprehensive assessment and rn-only clinical judgments within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in HR-TA-005, CL-SD-001, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TA-005, Role-Specific / Clinical Orientation (Days 1-30). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing / Supervisor ; Initiate role-specific orientation using the Role-Specific/Clinical Orientation Checklist (Appendix B). For clinical staff, the checklist must include: (a) EHR system training and proficiency demonstration; (b) OASIS training and assessment (per CL-OA-003, CL-OA-018); (c) Clinical documentation standards (CL-CD-001 through CL-CD-004); (d) Care planning and physician order management (CL-CP-001 through CL-CP-009); (e) Discipline-specific clinical protocols; (f) Medication management (CL-SD-012, CL-SD-013); (g) Fall risk assessment (CL-SD-015); (h) Wound care standards (CL-SD-011, if applicable); (i) Pain assessment (CL-SD-014); (j) Infection prevention — clinical application; (k) Patient identification and verification (OP-PA-002); (l) Homebound status determination (CL-CA-005); (m) Supervised patient visits.",
      "Controlled-policy focus — CL-SD-001, 4\\. Policy Statement. 4.1 All skilled nursing services at Care Indeed Home Health Care, Inc. shall be provided by registered nurses (RNs) or licensed vocational nurses (LVNs) who are currently licensed by the California Board of Registered Nursing or the California Board of Vocational Nursing and Psychiatric Technicians, whose licensure status has been verified per HR-TA-004, and who have demonstrated clinical competency per HR-TD-003. 4.2 Every skilled nursing visit shall have a documented clinical purpose that is directly tied to the physician-approved plan of care. No skilled nursing visit shall be conducted without a current, active physician order authorizing the visit per CL-CP-003. Visits without a clinical purpose tied to the plan of care are not billable under Medicare and expose.",
      "Controlled-policy focus — CL-SD-008, Director of Nursing Monthly Clinical Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Conduct a monthly review of each clinical discipline covering: documentation quality (random chart audit of ≥5% of each discipline's visit notes), plan of care adherence, visit frequency compliance (comparing delivered visits to ordered visits), clinical outcome indicators, patient complaint trending, and competency evaluation status. ; Monthly. ; ; 6.1.2 ; Director of Nursing ; Document findings in a Monthly Clinical Supervision Report. Identify discipline-specific trends, individual performance concerns, and system-level issues. Assign corrective actions with responsible parties and timelines. ; Within 5 business days of the review period end. ; ; 6.1.3 ; Director of Nursing.",
      "Controlled-policy focus — CL-SD-001, Skilled Nursing Visit Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Upon arrival, verify patient identity using two patient identifiers per OP-PA-002. Perform hand hygiene per CL-SD-016. ; At the start of each visit. ; ; 6.2.2 ; Assigned RN / LVN ; Conduct a focused clinical assessment appropriate to the patient's diagnoses and current status, including at minimum: (a) vital signs — blood pressure, pulse, temperature, respiratory rate, oxygen saturation (as indicated); (b) pain assessment per CL-SD-014; (c) cardiopulmonary assessment for patients with cardiac or respiratory diagnoses; (d) wound assessment for patients with active wounds per CL-SD-011; (e) neurological assessment for patients with neurological conditions; (f).",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Apply the controlled requirements to the three visible objects in the scene for comprehensive assessment and rn-only clinical judgments. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the assessment clipboard, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Assessment Clipboard", detail: "Review the assessment clipboard for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.75(a)" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "stethoscope-2-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 21, y: 68, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the stethoscope as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for comprehensive assessment and rn-only clinical judgments." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and blood-pressure cuff because one source appears more convenient. This identify option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during comprehensive assessment and rn-only clinical judgments." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior comprehensive assessment and rn-only clinical judgments narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for comprehensive assessment and rn-only clinical judgments." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "blood-pressure-cuff-2-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 34, y: 39, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the assessment clipboard, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with assessment clipboard and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the assessment clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with assessment clipboard and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the blood-pressure cuff and omit the related change, symptom, or safety cue. This identify option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for comprehensive assessment and rn-only clinical judgments." },
          { id: "i3", label: "Let a blank, unreadable, or unverified blood-pressure cuff stand in for direct RN assessment. This identify option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the blood-pressure cuff issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for comprehensive assessment and rn-only clinical judgments instead of the current controlled clinical pathway. This decide option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during comprehensive assessment and rn-only clinical judgments." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the blood-pressure cuff and omit the discrepancy with assessment clipboard. This document option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Combine the blood-pressure cuff issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns blood-pressure cuff during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for comprehensive assessment and rn-only clinical judgments." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the assessment clipboard, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the assessment clipboard, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with assessment clipboard and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "assessment-clipboard-2-3", label: "assessment clipboard", shortLabel: "assessment clipboard", ariaLabel: "Investigate assessment clipboard",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the assessment clipboard as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assessment clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the assessment clipboard as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assessment clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the assessment clipboard as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for comprehensive assessment and rn-only clinical judgments." },
          { id: "i3", label: "Carry forward the prior visit conclusion for comprehensive assessment and rn-only clinical judgments without reassessing the patient today. This identify option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about assessment clipboard." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assessment clipboard; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assessment clipboard; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the assessment clipboard alone and seek clarification only after the intervention is complete. This decide option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for assessment clipboard is resolved." },
          { id: "d3", label: "Defer the concern in the assessment clipboard to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during comprehensive assessment and rn-only clinical judgments." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For assessment clipboard, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For assessment clipboard, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the assessment clipboard was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of assessment clipboard." },
          { id: "doc3", label: "Keep the assessment clipboard decision in personal notes rather than the governed patient record. This document option concerns assessment clipboard during comprehensive assessment and rn-only clinical judgments.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for comprehensive assessment and rn-only clinical judgments." },
        ],
        feedback: {
          observed: "Observe the assessment clipboard as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the assessment clipboard as patient-specific evidence for comprehensive assessment and rn-only clinical judgments. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for comprehensive assessment and rn-only clinical judgments, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For assessment clipboard, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to assessment clipboard; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for comprehensive assessment and rn-only clinical judgments. For assessment clipboard, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Skilled",
    title: "Skilled nursing assessment, intervention, and evaluation",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for skilled nursing assessment, intervention, and evaluation within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in HR-TD-003, CL-SD-001, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TD-003, Annual Competency Evaluation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Director of Nursing / HR Director ; By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. ; By January 31 each year. ; ; 6.2.2 ; Clinical Supervisors / DON Designees ; Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific.",
      "Controlled-policy focus — CL-SD-001, 4\\. Policy Statement. 4.1 All skilled nursing services at Care Indeed Home Health Care, Inc. shall be provided by registered nurses (RNs) or licensed vocational nurses (LVNs) who are currently licensed by the California Board of Registered Nursing or the California Board of Vocational Nursing and Psychiatric Technicians, whose licensure status has been verified per HR-TA-004, and who have demonstrated clinical competency per HR-TD-003. 4.2 Every skilled nursing visit shall have a documented clinical purpose that is directly tied to the physician-approved plan of care. No skilled nursing visit shall be conducted without a current, active physician order authorizing the visit per CL-CP-003. Visits without a clinical purpose tied to the plan of care are not billable under Medicare and expose.",
      "Controlled-policy focus — CL-SD-001, Skilled Nursing Visit Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN / LVN ; Upon arrival, verify patient identity using two patient identifiers per OP-PA-002. Perform hand hygiene per CL-SD-016. ; At the start of each visit. ; ; 6.2.2 ; Assigned RN / LVN ; Conduct a focused clinical assessment appropriate to the patient's diagnoses and current status, including at minimum: (a) vital signs — blood pressure, pulse, temperature, respiratory rate, oxygen saturation (as indicated); (b) pain assessment per CL-SD-014; (c) cardiopulmonary assessment for patients with cardiac or respiratory diagnoses; (d) wound assessment for patients with active wounds per CL-SD-011; (e) neurological assessment for patients with neurological conditions; (f).",
      "Controlled-policy focus — HR-TD-003, Initial Competency Evaluation (During Orientation). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Using the Clinical Competency Evaluation Tool (Appendix A), identify the competencies required for the new employee's position based on: (a) job description essential functions; (b) discipline-specific regulatory requirements; (c) agency clinical protocols; (d) current patient population care needs. ; Prior to orientation start. ; ; 6.1.2 ; Preceptor / DON Designee ; Evaluate the new employee on all required competencies during the orientation period per HR-TA-005. Methods: (a) Skills check-off for hands-on competencies (Appendix A checklist); (b) Written assessment for knowledge-based competencies; (c) Supervised visit evaluations per HR-TA-005, Appendix E; (d) EHR proficiency demonstration; (e) OASIS competency.",
      "Controlled-policy focus — CL-SD-008, Director of Nursing Monthly Clinical Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Conduct a monthly review of each clinical discipline covering: documentation quality (random chart audit of ≥5% of each discipline's visit notes), plan of care adherence, visit frequency compliance (comparing delivered visits to ordered visits), clinical outcome indicators, patient complaint trending, and competency evaluation status. ; Monthly. ; ; 6.1.2 ; Director of Nursing ; Document findings in a Monthly Clinical Supervision Report. Identify discipline-specific trends, individual performance concerns, and system-level issues. Assign corrective actions with responsible parties and timelines. ; Within 5 business days of the review period end. ; ; 6.1.3 ; Director of Nursing.",
      "Apply the controlled requirements to the three visible objects in the scene for skilled nursing assessment, intervention, and evaluation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the dressing kit, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Dressing Kit", detail: "Review the dressing kit for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "stethoscope-3-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 14, y: 48, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the stethoscope as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stethoscope and omit the related change, symptom, or safety cue. This identify option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for skilled nursing assessment, intervention, and evaluation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stethoscope stand in for direct RN assessment. This identify option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for skilled nursing assessment, intervention, and evaluation instead of the current controlled clinical pathway. This decide option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during skilled nursing assessment, intervention, and evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stethoscope and omit the discrepancy with pulse oximeter. This document option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Combine the stethoscope issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stethoscope during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for skilled nursing assessment, intervention, and evaluation." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "pulse-oximeter-3-2", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 38, y: 44, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the pulse oximeter as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the dressing kit, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with dressing kit and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the dressing kit, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with dressing kit and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pulse oximeter as the complete assessment and do not compare the dressing kit, patient report, or current record. This identify option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for skilled nursing assessment, intervention, and evaluation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for skilled nursing assessment, intervention, and evaluation without reassessing the patient today. This identify option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pulse oximeter alone and seek clarification only after the intervention is complete. This decide option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Defer the concern in the pulse oximeter to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during skilled nursing assessment, intervention, and evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pulse oximeter was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Keep the pulse oximeter decision in personal notes rather than the governed patient record. This document option concerns pulse oximeter during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for skilled nursing assessment, intervention, and evaluation." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the dressing kit, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the dressing kit, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with dressing kit and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "dressing-kit-3-3", label: "dressing kit", shortLabel: "dressing kit", ariaLabel: "Investigate dressing kit",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the dressing kit as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing kit, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the dressing kit as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing kit, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Assume the dressing kit establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for skilled nursing assessment, intervention, and evaluation." },
          { id: "i3", label: "Dismiss the conflict between the dressing kit and stethoscope because one source appears more convenient. This identify option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about dressing kit." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing kit; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing kit; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the dressing kit without confirming an applicable order and patient-specific authority. This decide option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for dressing kit is resolved." },
          { id: "d3", label: "Hand the dressing kit concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during skilled nursing assessment, intervention, and evaluation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For dressing kit, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For dressing kit, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the dressing kit before reassessment confirms the patient response. This document option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of dressing kit." },
          { id: "doc3", label: "Copy the prior skilled nursing assessment, intervention, and evaluation narrative even though today’s dressing kit evidence is different. This document option concerns dressing kit during skilled nursing assessment, intervention, and evaluation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for skilled nursing assessment, intervention, and evaluation." },
        ],
        feedback: {
          observed: "Observe the dressing kit as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the dressing kit as patient-specific evidence for skilled nursing assessment, intervention, and evaluation. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for skilled nursing assessment, intervention, and evaluation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For dressing kit, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to dressing kit; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for skilled nursing assessment, intervention, and evaluation. For dressing kit, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Orders",
    title: "Orders, plan-of-care boundaries, and scope-safe practice",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for orders, plan-of-care boundaries, and scope-safe practice within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in CL-SD-001, HR-TD-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-001, LVN Practice Oversight. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Assign LVN caseloads with a designated supervising RN for each LVN. The supervising RN shall review the LVN's visit notes and clinical findings at minimum every 14 calendar days. ; At caseload assignment; review every 14 calendar days. ; ; 6.4.2 ; Supervising RN ; Review LVN visit notes for clinical accuracy, documentation adequacy, and scope-of-practice compliance. If any LVN visit note reflects activity outside the LVN scope, immediately notify the Director of Nursing. ; Every 14 calendar days. ; ; 6.4.3 ; Director of Nursing ; Conduct a direct supervisory visit (on-site observation of LVN patient.",
      "Controlled-policy focus — HR-TD-003, 12\\. Appendices. Appendix A — Clinical Competency Evaluation Tool Care Indeed Home Health Care, Inc. ; HR-TD-003 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Evaluator ; __________________ ; ; ; ; ; ; ; ; ; Evaluation Type: ☐ Initial (Orientation) ☐ Annual Year: ______ ; Date ; ________ ; ; ; ; ; # ; Competency Area ; Evaluation Method ; Rating (C=Competent / NI=Needs Improvement / NC=Not Competent) ; Evidence / Comments ; ; ; ; ; ; ; ; CORE COMPETENCIES (All Clinical Staff) ; ; ; ; ; ; 1 ; Hand hygiene and infection control ; Return Demo ; ☐C ☐NI ☐NC ; __________________ ; ; 2 ; Standard precautions.",
      "Controlled-policy focus — CL-SD-001, 4\\. Policy Statement. 4.1 All skilled nursing services at Care Indeed Home Health Care, Inc. shall be provided by registered nurses (RNs) or licensed vocational nurses (LVNs) who are currently licensed by the California Board of Registered Nursing or the California Board of Vocational Nursing and Psychiatric Technicians, whose licensure status has been verified per HR-TA-004, and who have demonstrated clinical competency per HR-TD-003. 4.2 Every skilled nursing visit shall have a documented clinical purpose that is directly tied to the physician-approved plan of care. No skilled nursing visit shall be conducted without a current, active physician order authorizing the visit per CL-CP-003. Visits without a clinical purpose tied to the plan of care are not billable under Medicare and expose.",
      "Controlled-policy focus — CL-SD-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Visit documentation does not support the skilled nature of the service ; Director of Nursing identifies during chart review ; Director of Nursing provides individual coaching and documentation remediation training. If the visit is not supported as skilled, assess billing impact with Revenue Cycle and Compliance Officer. ; Coaching within 7 calendar days; billing review within 14 calendar days. ; ; LVN performs services outside their scope ; Supervising RN or Director of Nursing identifies ; Director of Nursing immediately reassigns the patient to an RN. Provides scope-of-practice remediation training to the LVN. Documents corrective action per HR-ER-002. ; RN reassignment within.",
      "Controlled-policy focus — CL-SD-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Visit notes that read as routine vital-sign checks without skilled assessment or intervention ; Medicare coverage denial; ADR denial; False Claims Act risk ; Train all nurses on skilled documentation standards; Director of Nursing audits monthly ; ; LVN performing OASIS assessments or comprehensive assessments ; Scope of practice violation; CMS deficiency; OASIS data invalidation ; Restrict OASIS and comprehensive assessment access in EHR to RN credentials only ; ; Visit conducted without reviewing current plan of care ; Services may not align with physician orders ; EHR workflow requires plan of care acknowledgment before visit note entry ; ; Medication review not documented at each.",
      "Apply the controlled requirements to the three visible objects in the scene for orders, plan-of-care boundaries, and scope-safe practice. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Provider-order Folder", detail: "Review the provider-order folder for the patient-specific finding. Reconcile it with the closed supply case, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Supply Case", detail: "Review the closed supply case for the patient-specific finding. Reconcile it with the red stop token without text, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Red Stop Token Without Text", detail: "Review the red stop token without text for the patient-specific finding. Reconcile it with the provider-order folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "provider-order-folder-4-1", label: "provider-order folder", shortLabel: "provider-order folder", ariaLabel: "Investigate provider-order folder",        x: 21, y: 41, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the provider-order folder as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the closed supply case, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For provider-order folder, compare the visible evidence with closed supply case and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the provider-order folder as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the closed supply case, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For provider-order folder, compare the visible evidence with closed supply case and the controlling source before classifying status." },
          { id: "i2", label: "Treat the provider-order folder as the complete assessment and do not compare the closed supply case, patient report, or current record. This identify option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, plan-of-care boundaries, and scope-safe practice." },
          { id: "i3", label: "Carry forward the prior visit conclusion for orders, plan-of-care boundaries, and scope-safe practice without reassessing the patient today. This identify option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about provider-order folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to provider-order folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to provider-order folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the provider-order folder alone and seek clarification only after the intervention is complete. This decide option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for provider-order folder is resolved." },
          { id: "d3", label: "Defer the concern in the provider-order folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For provider-order folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For provider-order folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the provider-order folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of provider-order folder." },
          { id: "doc3", label: "Keep the provider-order folder decision in personal notes rather than the governed patient record. This document option concerns provider-order folder during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        feedback: {
          observed: "Observe the provider-order folder as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the closed supply case, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the provider-order folder as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the closed supply case, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For provider-order folder, compare the visible evidence with closed supply case and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to provider-order folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For provider-order folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "closed-supply-case-4-2", label: "closed supply case", shortLabel: "closed supply case", ariaLabel: "Investigate closed supply case",        x: 34, y: 74, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the closed supply case as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the red stop token without text, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply case, compare the visible evidence with red stop token without text and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed supply case as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the red stop token without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply case, compare the visible evidence with red stop token without text and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed supply case establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, plan-of-care boundaries, and scope-safe practice." },
          { id: "i3", label: "Dismiss the conflict between the closed supply case and red stop token without text because one source appears more convenient. This identify option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed supply case." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply case; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply case; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed supply case without confirming an applicable order and patient-specific authority. This decide option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed supply case is resolved." },
          { id: "d3", label: "Hand the closed supply case concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For closed supply case, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For closed supply case, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed supply case before reassessment confirms the patient response. This document option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed supply case." },
          { id: "doc3", label: "Copy the prior orders, plan-of-care boundaries, and scope-safe practice narrative even though today’s closed supply case evidence is different. This document option concerns closed supply case during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        feedback: {
          observed: "Observe the closed supply case as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the red stop token without text, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed supply case as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the red stop token without text, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed supply case, compare the visible evidence with red stop token without text and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed supply case; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For closed supply case, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "red-stop-token-without-text-4-3", label: "red stop token without text", shortLabel: "red stop token without text", ariaLabel: "Investigate red stop token without text",        x: 86, y: 55, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the red stop token without text as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the provider-order folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For red stop token without text, compare the visible evidence with provider-order folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the red stop token without text as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the provider-order folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For red stop token without text, compare the visible evidence with provider-order folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the red stop token without text and omit the related change, symptom, or safety cue. This identify option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for orders, plan-of-care boundaries, and scope-safe practice." },
          { id: "i3", label: "Let a blank, unreadable, or unverified red stop token without text stand in for direct RN assessment. This identify option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about red stop token without text." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to red stop token without text; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to red stop token without text; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the red stop token without text issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for red stop token without text is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for orders, plan-of-care boundaries, and scope-safe practice instead of the current controlled clinical pathway. This decide option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For red stop token without text, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For red stop token without text, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the red stop token without text and omit the discrepancy with provider-order folder. This document option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of red stop token without text." },
          { id: "doc3", label: "Combine the red stop token without text issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns red stop token without text during orders, plan-of-care boundaries, and scope-safe practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for orders, plan-of-care boundaries, and scope-safe practice." },
        ],
        feedback: {
          observed: "Observe the red stop token without text as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the provider-order folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the red stop token without text as patient-specific evidence for orders, plan-of-care boundaries, and scope-safe practice. Compare it with the provider-order folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for orders, plan-of-care boundaries, and scope-safe practice, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For red stop token without text, compare the visible evidence with provider-order folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to red stop token without text; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for orders, plan-of-care boundaries, and scope-safe practice. For red stop token without text, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Delegat",
    title: "Delegation, coordination, and accountability across disciplines",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for delegation, coordination, and accountability across disciplines within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in CL-SD-001, CL-SD-008, HR-TA-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-001, 2\\. Purpose. This policy defines the scope, frequency, clinical standards, and documentation requirements for skilled nursing assessment and services delivered by Care Indeed Home Health Care, Inc. Skilled nursing is the cornerstone of the Medicare home health benefit — it is the discipline most frequently ordered, most frequently surveyed, and most frequently the basis for the patient's initial and continued eligibility for home health services. The skilled nurse's clinical judgment, assessment competency, documentation accuracy, and care coordination are the primary determinants of clinical quality, regulatory compliance, and billing integrity across every episode. This policy ensures that every skilled nursing visit is conducted with a clear clinical purpose, is documented with the specificity and timeliness required by CMS, and is aligned.",
      "Controlled-policy focus — CL-SD-001, Pre-Visit Preparation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN / LVN ; Before each visit, review the patient's current plan of care, active physician orders, medication list, recent visit notes from all disciplines, and any outstanding clinical alerts or coordination notes in the EHR. Identify the clinical purpose of the visit and the specific assessments and interventions to be completed. ; Before departure for the visit. ; ; 6.1.2 ; Assigned RN / LVN ; Verify that all supplies, equipment, and educational materials needed for the visit are available and in working condition. If the visit requires specialized supplies (wound care supplies, IV supplies, injection supplies), confirm availability.",
      "Controlled-policy focus — CL-SD-008, 4\\. Policy Statement. 4.1 The Director of Nursing / Clinical Manager is responsible for the oversight and supervision of all clinical services provided by the agency, as required by 42 CFR § 484.115(b). The Director of Nursing shall be a registered nurse who is currently licensed in California, meets the CMS qualification requirements, and has the authority and accountability to ensure the clinical quality and regulatory compliance of all services. 4.2 The supervision structure shall operate at three levels: Level 1 — Director of Nursing Oversight: The Director of Nursing provides enterprise-level clinical oversight of all disciplines and clinical functions, including: review of clinical outcomes, quality indicators, documentation compliance, and survey readiness. Level 2 — Discipline-Specific Professional Supervision: Licensed professionals (PTs.",
      "Controlled-policy focus — CL-SD-008, Ongoing Professional Staff Supervision. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing ; Conduct at minimum one direct on-site supervisory visit with each professional clinician (RN, PT, OT, SLP, MSW) annually. The visit shall include observation of the clinician's assessment technique, patient interaction, clinical judgment, and documentation practices. ; Annually; more frequently for performance concerns. ; ; 6.3.2 ; Director of Nursing ; Document the supervisory visit using the Clinical Supervisory Visit Form (Appendix A), including: strengths identified, areas for improvement, corrective guidance provided, and follow-up actions. ; Within 24 hours of the visit. ; ; 6.3.3 ; Director of Nursing ; For clinicians with identified performance concerns, increase the.",
      "Controlled-policy focus — HR-TA-005, General Agency Orientation (All Staff — Days 1-5). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; HR Director ; Conduct General Agency Orientation covering all topics listed on Appendix A. Orientation may be delivered in-person, via structured e-learning modules, or a combination, but must include opportunity for questions and interaction. ; Completed within first 5 business days. ; ; 6.2.2 ; HR Director ; General Agency Orientation must cover, at minimum, the following topics (documented on Appendix A): (a) Agency mission, vision, and values; (b) Organizational structure and reporting relationships (GV-OG-001); (c) Scope of services (GV-OG-003); (d) Corporate compliance program overview (CO-CP-001, CO-CP-004); (e) HIPAA privacy and security (CO-HP-001, CO-HP-002) — including PHI handling, minimum necessary standard.",
      "Apply the controlled requirements to the three visible objects in the scene for delegation, coordination, and accountability across disciplines. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Task Card", detail: "Review the task card for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the task card, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "task-card-5-1", label: "task card", shortLabel: "task card", ariaLabel: "Investigate task card",        x: 14, y: 71, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the task card as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For task card, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the task card as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For task card, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Assume the task card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for delegation, coordination, and accountability across disciplines." },
          { id: "i3", label: "Dismiss the conflict between the task card and stethoscope because one source appears more convenient. This identify option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about task card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to task card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to task card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the task card without confirming an applicable order and patient-specific authority. This decide option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for task card is resolved." },
          { id: "d3", label: "Hand the task card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during delegation, coordination, and accountability across disciplines." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For task card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For task card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the task card before reassessment confirms the patient response. This document option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of task card." },
          { id: "doc3", label: "Copy the prior delegation, coordination, and accountability across disciplines narrative even though today’s task card evidence is different. This document option concerns task card during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, coordination, and accountability across disciplines." },
        ],
        feedback: {
          observed: "Observe the task card as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the task card as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For task card, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to task card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For task card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "stethoscope-5-2", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 33, y: 52, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the stethoscope as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stethoscope and omit the related change, symptom, or safety cue. This identify option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for delegation, coordination, and accountability across disciplines." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stethoscope stand in for direct RN assessment. This identify option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for delegation, coordination, and accountability across disciplines instead of the current controlled clinical pathway. This decide option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during delegation, coordination, and accountability across disciplines." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stethoscope and omit the discrepancy with phone. This document option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Combine the stethoscope issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stethoscope during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, coordination, and accountability across disciplines." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "phone-5-3", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 74, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the phone as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the task card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with task card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the task card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with task card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the phone as the complete assessment and do not compare the task card, patient report, or current record. This identify option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for delegation, coordination, and accountability across disciplines." },
          { id: "i3", label: "Carry forward the prior visit conclusion for delegation, coordination, and accountability across disciplines without reassessing the patient today. This identify option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the phone alone and seek clarification only after the intervention is complete. This decide option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Defer the concern in the phone to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during delegation, coordination, and accountability across disciplines." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the phone was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Keep the phone decision in personal notes rather than the governed patient record. This document option concerns phone during delegation, coordination, and accountability across disciplines.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, coordination, and accountability across disciplines." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the task card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for delegation, coordination, and accountability across disciplines. Compare it with the task card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for delegation, coordination, and accountability across disciplines, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with task card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for delegation, coordination, and accountability across disciplines. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Change-",
    title: "Change-in-condition escalation, emergency response, and chain of command",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for change-in-condition escalation, emergency response, and chain of command within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in CL-SD-008, HR-TA-005, CL-SD-001, HR-TD-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-008, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Supervisory visit reveals unsafe clinical practice ; Supervisor immediately intervenes ; Remove staff from patient care if safety risk is immediate. Report to Director of Nursing within 4 hours. File incident report per RM-ER-002 if patient harm occurred or was narrowly avoided. Director of Nursing determines next steps including potential suspension pending investigation per HR-ER-002. ; Immediate intervention; Director of Nursing notification within 4 hours. ; ; Staff member refuses supervisory oversight ; Director of Nursing notified ; Director of Nursing counsels the staff member on the supervisory requirement. If refusal persists, initiate disciplinary action per HR-ER-002. ; Counseling within 48 hours.",
      "Controlled-policy focus — HR-TA-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; New clinical employee fails competency assessment after extended orientation period ; DON notifies Administrator and HR Director. ; Employment may be terminated during probationary period per HR-ER-002. DON documents specific competency deficits and remediation efforts attempted. ; Decision within 5 business days of failed extended assessment. ; ; Orientation not completed within required timeframe due to scheduling issues ; HR Director notifies Administrator. ; Orientation completion deadline extended with documented justification. Employee remains under supervision until completed. ; Extension approved within 3 business days; orientation completed within 15 additional days. ; ; Contract staff refuses abbreviated orientation ; HR Director denies assignment.",
      "Controlled-policy focus — CL-SD-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Visit documentation does not support the skilled nature of the service ; Director of Nursing identifies during chart review ; Director of Nursing provides individual coaching and documentation remediation training. If the visit is not supported as skilled, assess billing impact with Revenue Cycle and Compliance Officer. ; Coaching within 7 calendar days; billing review within 14 calendar days. ; ; LVN performs services outside their scope ; Supervising RN or Director of Nursing identifies ; Director of Nursing immediately reassigns the patient to an RN. Provides scope-of-practice remediation training to the LVN. Documents corrective action per HR-ER-002. ; RN reassignment within.",
      "Controlled-policy focus — HR-TA-005, 12\\. Appendices. Appendix A — General Agency Orientation Checklist Care Indeed Home Health Care, Inc. ; HR-TA-005 ; v6.0 ; Employee Name ; __________________ ; Position ; __________________ ; Start Date ; ________ ; ; ; ; ; ; ; ; ; # ; Orientation Topic ; Policy Reference ; Date Completed ; Trainer Initials ; Employee Initials ; ; ; ; ; ; ; ; ; 1 ; Agency mission, vision, and values ; — ; ________ ; ______ ; ______ ; ; 2 ; Organizational structure and reporting ; GV-OG-001 ; ________ ; ______ ; ______ ; ; 3 ; Scope of services ; GV-OG-003 ; ________ ; ______ ; ______ ; ; 4 ; Corporate compliance program.",
      "Controlled-policy focus — HR-TD-003, 4\\. Policy Statements. 4.1 Every clinical employee shall undergo an initial competency evaluation during orientation (HR-TA-005) and an annual competency evaluation thereafter. 4.2 Competency evaluation shall assess both general clinical competencies (applicable to all clinical staff) and discipline-specific competencies (applicable to each profession's scope of practice). 4.3 Competency shall be evaluated using multiple methods: direct observation, skills demonstration (return demonstration), written assessment, case study analysis, clinical record review, and/or simulation. 4.4 Home health aides shall be evaluated per 42 CFR § 484.80 requirements including competency in all required skill areas with supervised performance at least every 12 months. 4.5 Competency deficits shall trigger a documented remediation plan with defined milestones and reassessment timeframe. An employee who fails to achieve competency after.",
      "Apply the controlled requirements to the three visible objects in the scene for change-in-condition escalation, emergency response, and chain of command. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the SBAR card, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "SBAR Card", detail: "Review the SBAR card for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "phone-6-1", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the phone as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation, emergency response, and chain of command." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for change-in-condition escalation, emergency response, and chain of command instead of the current controlled clinical pathway. This decide option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation, emergency response, and chain of command." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with pulse oximeter. This document option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation, emergency response, and chain of command." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "pulse-oximeter-6-2", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 32, y: 54, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the pulse oximeter as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with SBAR card and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with SBAR card and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pulse oximeter as the complete assessment and do not compare the SBAR card, patient report, or current record. This identify option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation, emergency response, and chain of command." },
          { id: "i3", label: "Carry forward the prior visit conclusion for change-in-condition escalation, emergency response, and chain of command without reassessing the patient today. This identify option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pulse oximeter alone and seek clarification only after the intervention is complete. This decide option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Defer the concern in the pulse oximeter to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation, emergency response, and chain of command." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pulse oximeter was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Keep the pulse oximeter decision in personal notes rather than the governed patient record. This document option concerns pulse oximeter during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation, emergency response, and chain of command." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the SBAR card, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with SBAR card and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "sbar-card-6-3", label: "SBAR card", shortLabel: "SBAR card", ariaLabel: "Investigate SBAR card",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the SBAR card as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the SBAR card as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the SBAR card establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for change-in-condition escalation, emergency response, and chain of command." },
          { id: "i3", label: "Dismiss the conflict between the SBAR card and phone because one source appears more convenient. This identify option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about SBAR card." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the SBAR card without confirming an applicable order and patient-specific authority. This decide option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for SBAR card is resolved." },
          { id: "d3", label: "Hand the SBAR card concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during change-in-condition escalation, emergency response, and chain of command." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For SBAR card, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For SBAR card, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the SBAR card before reassessment confirms the patient response. This document option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of SBAR card." },
          { id: "doc3", label: "Copy the prior change-in-condition escalation, emergency response, and chain of command narrative even though today’s SBAR card evidence is different. This document option concerns SBAR card during change-in-condition escalation, emergency response, and chain of command.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for change-in-condition escalation, emergency response, and chain of command." },
        ],
        feedback: {
          observed: "Observe the SBAR card as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the SBAR card as patient-specific evidence for change-in-condition escalation, emergency response, and chain of command. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for change-in-condition escalation, emergency response, and chain of command, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For SBAR card, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to SBAR card; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for change-in-condition escalation, emergency response, and chain of command. For SBAR card, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Documen",
    title: "Documentation, competency validation, and independent-practice boundary",
    subtitle: "RN Role & Scope of Practice in Home Health",
    narration: [
      "This lesson develops registered-nurse reasoning for documentation, competency validation, and independent-practice boundary within RN Role & Scope of Practice in Home Health. Use the current controlled requirements in HR-TD-003, CL-SD-001, CL-SD-008, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — HR-TD-003, Annual Competency Evaluation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Director of Nursing / HR Director ; By January 31, develop the Annual Competency Evaluation Plan (Appendix B) identifying: (a) competencies to be assessed for each discipline; (b) agency-wide focus competencies based on QAPI data, incident trends, survey findings, and regulatory changes; (c) evaluation methods and tools; (d) schedule. ; By January 31 each year. ; ; 6.2.2 ; Clinical Supervisors / DON Designees ; Conduct annual competency evaluations for all clinical staff using the Clinical Competency Evaluation Tool (Appendix A). Evaluate a combination of: (a) core competencies (infection control, medication safety, documentation, patient rights, fall prevention, pain assessment); (b) discipline-specific.",
      "Controlled-policy focus — HR-TD-003, Competency Remediation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Clinical Supervisor ; When a competency deficit is identified: meet with the employee to discuss the finding. Develop a written Competency Remediation Plan (Appendix C) specifying: (a) the specific competency deficit; (b) targeted education/training interventions; (c) practice opportunities; (d) reassessment method and criteria; (e) timeline for completion (not to exceed 60 calendar days); (f) responsible supervisor. ; Within 7 business days of identifying the deficit. ; ; 6.3.2 ; Employee ; Complete all remediation activities as defined in the plan. ; Per plan timeline. ; ; 6.3.3 ; Clinical Supervisor ; Conduct reassessment using the method specified in the plan. Document.",
      "Controlled-policy focus — CL-SD-001, Visit Documentation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN / LVN ; Document the visit note in the EHR within 24 hours of the visit per CL-CD-004. The visit note shall include, at minimum: (a) date and time of the visit; (b) the clinical purpose of the visit; (c) subjective data — patient and caregiver reports; (d) objective data — all assessment findings including vital signs, physical findings, and clinical observations; (e) assessment — the nurse's clinical assessment and professional judgment regarding the patient's current status and response to care; (f) plan — actions taken, interventions provided, education given, physician notifications made, referrals initiated, and the plan for.",
      "Controlled-policy focus — CL-SD-008, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Monthly Clinical Supervision Report ; Director of Nursing monthly review findings ; Director of Nursing ; Director of Nursing supervisory file ; Monthly; retained minimum 7 years ; ; New employee supervisory visit ; On-site supervisory visit documentation ; Director of Nursing / Preceptor ; EHR and personnel file ; Within first 30 days; retained minimum 7 years ; ; 60-day competency review ; Competency determination documentation ; Director of Nursing ; Personnel file ; At Day 60 ; ; Annual professional staff supervisory visit ; Clinical Supervisory Visit Form (Appendix A) ; Director of Nursing ; EHR.",
      "Controlled-policy focus — HR-TD-003, Initial Competency Evaluation (During Orientation). Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Using the Clinical Competency Evaluation Tool (Appendix A), identify the competencies required for the new employee's position based on: (a) job description essential functions; (b) discipline-specific regulatory requirements; (c) agency clinical protocols; (d) current patient population care needs. ; Prior to orientation start. ; ; 6.1.2 ; Preceptor / DON Designee ; Evaluate the new employee on all required competencies during the orientation period per HR-TA-005. Methods: (a) Skills check-off for hands-on competencies (Appendix A checklist); (b) Written assessment for knowledge-based competencies; (c) Supervised visit evaluations per HR-TA-005, Appendix E; (d) EHR proficiency demonstration; (e) OASIS competency.",
      "Apply the controlled requirements to the three visible objects in the scene for documentation, competency validation, and independent-practice boundary. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the competency record, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Competency Record", detail: "Review the competency record for the patient-specific finding. Reconcile it with the locked supply case, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Locked Supply Case", detail: "Review the locked supply case for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-001" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "Controlled Policy", text: "HR-TD-003" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "tablet-screen-7-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 70, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the tablet screen as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the competency record, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with competency record and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the competency record, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with competency record and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the competency record, patient report, or current record. This identify option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for documentation, competency validation, and independent-practice boundary." },
          { id: "i3", label: "Carry forward the prior visit conclusion for documentation, competency validation, and independent-practice boundary without reassessing the patient today. This identify option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during documentation, competency validation, and independent-practice boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for documentation, competency validation, and independent-practice boundary." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the competency record, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the competency record, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with competency record and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "competency-record-7-2", label: "competency record", shortLabel: "competency record", ariaLabel: "Investigate competency record",        x: 52, y: 66, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the competency record as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the locked supply case, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency record, compare the visible evidence with locked supply case and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the competency record as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the locked supply case, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency record, compare the visible evidence with locked supply case and the controlling source before classifying status." },
          { id: "i2", label: "Assume the competency record establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for documentation, competency validation, and independent-practice boundary." },
          { id: "i3", label: "Dismiss the conflict between the competency record and locked supply case because one source appears more convenient. This identify option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about competency record." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency record; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency record; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the competency record without confirming an applicable order and patient-specific authority. This decide option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for competency record is resolved." },
          { id: "d3", label: "Hand the competency record concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during documentation, competency validation, and independent-practice boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For competency record, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For competency record, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the competency record before reassessment confirms the patient response. This document option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency record." },
          { id: "doc3", label: "Copy the prior documentation, competency validation, and independent-practice boundary narrative even though today’s competency record evidence is different. This document option concerns competency record during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for documentation, competency validation, and independent-practice boundary." },
        ],
        feedback: {
          observed: "Observe the competency record as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the locked supply case, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the competency record as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the locked supply case, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For competency record, compare the visible evidence with locked supply case and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to competency record; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For competency record, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
      {
        id: "locked-supply-case-7-3", label: "locked supply case", shortLabel: "locked supply case", ariaLabel: "Investigate locked supply case",        x: 82, y: 38, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the locked supply case as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply case, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the locked supply case as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply case, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the locked supply case and omit the related change, symptom, or safety cue. This identify option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for documentation, competency validation, and independent-practice boundary." },
          { id: "i3", label: "Let a blank, unreadable, or unverified locked supply case stand in for direct RN assessment. This identify option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about locked supply case." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply case; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply case; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the locked supply case issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for locked supply case is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for documentation, competency validation, and independent-practice boundary instead of the current controlled clinical pathway. This decide option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during documentation, competency validation, and independent-practice boundary." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For locked supply case, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For locked supply case, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the locked supply case and omit the discrepancy with tablet screen. This document option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked supply case." },
          { id: "doc3", label: "Combine the locked supply case issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns locked supply case during documentation, competency validation, and independent-practice boundary.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for documentation, competency validation, and independent-practice boundary." },
        ],
        feedback: {
          observed: "Observe the locked supply case as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the locked supply case as patient-specific evidence for documentation, competency validation, and independent-practice boundary. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for documentation, competency validation, and independent-practice boundary, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked supply case, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked supply case; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for documentation, competency validation, and independent-practice boundary. For locked supply case, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-001","CL-SD-008","HR-TA-005","HR-TD-003","42 CFR § 484.75","42 CFR § 484.75(a)","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During rn qualifications, appointment, and home-health role authority, the nursing visit bag conflicts with the credential badge and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the credential badge is unchanged from the prior encounter and omit patient-specific reassessment during rn qualifications, appointment, and home-health role authority.",
      "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the nursing visit bag alone and seek clarification only after the intervention is complete. This option concerns rn qualifications, appointment, and home-health role authority.",
      "Defer the concern in the nursing visit bag to the next routine visit even though its current clinical significance has not been assessed. This option concerns rn qualifications, appointment, and home-health role authority.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for rn qualifications, appointment, and home-health role authority within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 2,
    stem: "During comprehensive assessment and rn-only clinical judgments, the assessment clipboard conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the assessment clipboard concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns comprehensive assessment and rn-only clinical judgments.",
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during comprehensive assessment and rn-only clinical judgments.",
      "Change the treatment, medication, device setting, or plan based on the assessment clipboard without confirming an applicable order and patient-specific authority. This option concerns comprehensive assessment and rn-only clinical judgments.",
      "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for comprehensive assessment and rn-only clinical judgments within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 3,
    stem: "During skilled nursing assessment, intervention, and evaluation, the dressing kit conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for skilled nursing assessment, intervention, and evaluation instead of the current controlled clinical pathway. This option concerns skilled nursing assessment, intervention, and evaluation.",
      "Close the dressing kit issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns skilled nursing assessment, intervention, and evaluation.",
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during skilled nursing assessment, intervention, and evaluation.",
      "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for skilled nursing assessment, intervention, and evaluation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 4,
    stem: "During orders, plan-of-care boundaries, and scope-safe practice, the red stop token without text conflicts with the provider-order folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the red stop token without text alone and seek clarification only after the intervention is complete. This option concerns orders, plan-of-care boundaries, and scope-safe practice.",
      "Assume the provider-order folder is unchanged from the prior encounter and omit patient-specific reassessment during orders, plan-of-care boundaries, and scope-safe practice.",
      "Defer the concern in the red stop token without text to the next routine visit even though its current clinical significance has not been assessed. This option concerns orders, plan-of-care boundaries, and scope-safe practice.",
      "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for orders, plan-of-care boundaries, and scope-safe practice within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 5,
    stem: "During delegation, coordination, and accountability across disciplines, the phone conflicts with the task card and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the task card is unchanged from the prior encounter and omit patient-specific reassessment during delegation, coordination, and accountability across disciplines.",
      "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Hand the phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns delegation, coordination, and accountability across disciplines.",
      "Change the treatment, medication, device setting, or plan based on the phone without confirming an applicable order and patient-specific authority. This option concerns delegation, coordination, and accountability across disciplines.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for delegation, coordination, and accountability across disciplines within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 6,
    stem: "During change-in-condition escalation, emergency response, and chain of command, the SBAR card conflicts with the phone and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the SBAR card issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns change-in-condition escalation, emergency response, and chain of command.",
      "Use a familiar local shortcut for change-in-condition escalation, emergency response, and chain of command instead of the current controlled clinical pathway. This option concerns change-in-condition escalation, emergency response, and chain of command.",
      "Assume the phone is unchanged from the prior encounter and omit patient-specific reassessment during change-in-condition escalation, emergency response, and chain of command.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for change-in-condition escalation, emergency response, and chain of command within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 7,
    stem: "During documentation, competency validation, and independent-practice boundary, the locked supply case conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the locked supply case to the next routine visit even though its current clinical significance has not been assessed. This option concerns documentation, competency validation, and independent-practice boundary.",
      "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the locked supply case alone and seek clarification only after the intervention is complete. This option concerns documentation, competency validation, and independent-practice boundary.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during documentation, competency validation, and independent-practice boundary.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for documentation, competency validation, and independent-practice boundary within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-001, CL-SD-008, HR-TA-005, HR-TD-003.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.75 be used when applying RN Role & Scope of Practice in Home Health?",
    options: [
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
    ],
    correct: 0,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the stethoscope and SBAR card into defensible RN practice for RN Role & Scope of Practice in Home Health?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A familiar device display accepted without technique or context validation.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of RN Role & Scope of Practice in Home Health establish?",
    options: [
      "Knowledge of the controlled RN concepts in RN Role & Scope of Practice in Home Health, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Observed clinical competency even when no authorized evaluator witnessed performance.",
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Automatic authority to perform every activity discussed in RN Role & Scope of Practice in Home Health without supervision.",
    ],
    correct: 0,
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


const STORAGE_KEY = 'rn-001-progress-v6000';

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

export default function RN001() {
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
          <span className="brand-text">RN-001 — Role & Scope</span>
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
