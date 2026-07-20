/**
 * RN-003 — OASIS-E2 Data Collection & Coding
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
import img01 from './assets/rn-003/rn-003-lesson-01.png';
import img02 from './assets/rn-003/rn-003-lesson-02.png';
import img03 from './assets/rn-003/rn-003-lesson-03.png';
import img04 from './assets/rn-003/rn-003-lesson-04.png';
import img05 from './assets/rn-003/rn-003-lesson-05.png';
import img06 from './assets/rn-003/rn-003-lesson-06.png';
import img07 from './assets/rn-003/rn-003-lesson-07.png';

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

const MODULE_META = { id: "RN-003", title: "OASIS-E2 Data Collection & Coding", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for OASIS purpose, authorized assessors, time points, and accountability, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Patient interview, direct observation, source hierarchy, and response selection, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Item-specific conventions, look-back periods, and point-in-time coding, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Functional, cognitive, mood, and standardized-tool accuracy, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Wound, medication, and clinical-domain coding substantiation, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Cross-document validation, correction, transmission, and exception handling, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Audit trail, competency validation, data integrity, and final quality review, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 OASIS",
    title: "OASIS purpose, authorized assessors, time points, and accountability",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for oasis purpose, authorized assessors, time points, and accountability within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-003, CL-OA-001, CL-CA-002, CL-CA-003, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-003, OASIS Competency Program — Initial Authorization. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Director of Nursing ; Upon hire of any new RN who will be assigned OASIS assessments, enroll the RN in the OASIS Competency Program. No OASIS assessments shall be assigned to the RN until enrollment is confirmed. If the new hire has prior OASIS experience from another agency, grant provisional authorization per Section 4.6 while the program is being completed. ; Within 5 business days of hire. ; ; 6.1.2 ; Director of Nursing / Designated OASIS Trainer ; Deliver the OASIS Competency Program in the following sequence: (Module 1) Regulatory and Financial Framework: 42 CFR § 484.55; OASIS purpose; PDGM.",
      "Controlled-policy focus — CL-OA-001, OASIS Assessment Time Point Deadlines. The following table defines the assessment window, operational target, and regulatory deadline for each OASIS time point. All deadlines are measured in calendar days unless otherwise noted. ; Time Point ; Trigger Event ; Assessment Window ; Operational Target ; Regulatory Deadline ; OASIS Data Reflects ; ; ; ; ; ; ; ; ; SOC (Start of Care) ; First billable visit for a new episode ; Assessment must be initiated at the SOC visit ; Completed and locked within 3 calendar days of the SOC visit ; 5 calendar days from the SOC date ; Patient's status at the time of the SOC visit ; ; ROC (Resumption of Care) ; First billable visit after an.",
      "Controlled-policy focus — CL-CA-002, Domain-Specific OASIS Accuracy Standards. The following domain-specific accuracy standards shall govern response selection for the highest-risk OASIS item categories. These standards supplement the CMS OASIS-E2 Guidance Manual and do not supersede it. 6.2.1 Functional Status — GG Items (GG0130, GG0170) ; Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1.1 ; Assigned RN ; The GG functional items assess the patient's performance of specific activities — not their capacity. Observe the patient perform each activity during the visit whenever possible. Do not select a response based solely on the patient's or caregiver's report of what the patient can or cannot do. ; During the assessment visit. ; ; 6.2.1.2 ; Assigned RN ; Use the.",
      "Controlled-policy focus — CL-CA-003, OASIS Correction Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing / OASIS Quality Reviewer ; When an error in a submitted OASIS record is identified through any means (internal audit per CL-CA-002, CMS response file warning, ADR audit finding, OASIS validation finding, self-identification by the assessing RN), document the identified error in the Correction Assessment Form (Appendix B) including: the specific item(s) in error, the submitted response, the correct response supported by clinical evidence, the reason the original response was inaccurate, and the clinical documentation that supports the correction. ; Within 5 business days of error identification. ; ; 6.4.2 ; Director of Nursing ; Review and approve.",
      "Controlled-policy focus — CL-CA-002, OASIS Data Collection — General Requirements. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Before conducting any OASIS assessment, verify that the current CMS OASIS-E2 Guidance Manual is available (electronic access or printed current edition). Never rely on memory, informal summaries, or prior-version guidance for item-specific coding decisions. ; Before each assessment. ; ; 6.1.2 ; Assigned RN ; Identify all OASIS items applicable to the specific assessment time point being conducted. The items collected vary by time point — not all items are collected at all time points. Use the time-point applicability table in the CMS OASIS-E2 Guidance Manual to confirm item applicability. ; Before each assessment. ; ; 6.1.3.",
      "Apply the controlled requirements to the three visible objects in the scene for oasis purpose, authorized assessors, time points, and accountability. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Credential Badge", detail: "Review the credential badge for the patient-specific finding. Reconcile it with the closed tablet with, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Tablet With", detail: "Review the closed tablet with for the patient-specific finding. Reconcile it with the compact assessment bag, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Compact Assessment Bag", detail: "Review the compact assessment bag for the patient-specific finding. Reconcile it with the credential badge, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
      { kind: "External Authority", text: "42 CFR § 484.55(b)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "credential-badge-1-1", label: "credential badge", shortLabel: "credential badge", ariaLabel: "Investigate credential badge",        x: 23, y: 38, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the credential badge as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the closed tablet with, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed tablet with and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the credential badge as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the closed tablet with, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed tablet with and the controlling source before classifying status." },
          { id: "i2", label: "Treat the credential badge as the complete assessment and do not compare the closed tablet with, patient report, or current record. This identify option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for oasis purpose, authorized assessors, time points, and accountability." },
          { id: "i3", label: "Carry forward the prior visit conclusion for oasis purpose, authorized assessors, time points, and accountability without reassessing the patient today. This identify option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about credential badge." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the credential badge alone and seek clarification only after the intervention is complete. This decide option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for credential badge is resolved." },
          { id: "d3", label: "Defer the concern in the credential badge to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during oasis purpose, authorized assessors, time points, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For credential badge, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For credential badge, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the credential badge was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of credential badge." },
          { id: "doc3", label: "Keep the credential badge decision in personal notes rather than the governed patient record. This document option concerns credential badge during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for oasis purpose, authorized assessors, time points, and accountability." },
        ],
        feedback: {
          observed: "Observe the credential badge as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the closed tablet with, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the credential badge as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the closed tablet with, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For credential badge, compare the visible evidence with closed tablet with and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to credential badge; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For credential badge, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "closed-tablet-with-1-2", label: "closed tablet with", shortLabel: "closed tablet with", ariaLabel: "Investigate closed tablet with",        x: 39, y: 66, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the closed tablet with as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the compact assessment bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet with, compare the visible evidence with compact assessment bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed tablet with as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the compact assessment bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet with, compare the visible evidence with compact assessment bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the closed tablet with establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for oasis purpose, authorized assessors, time points, and accountability." },
          { id: "i3", label: "Dismiss the conflict between the closed tablet with and compact assessment bag because one source appears more convenient. This identify option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed tablet with." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet with; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet with; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the closed tablet with without confirming an applicable order and patient-specific authority. This decide option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed tablet with is resolved." },
          { id: "d3", label: "Hand the closed tablet with concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during oasis purpose, authorized assessors, time points, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For closed tablet with, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For closed tablet with, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the closed tablet with before reassessment confirms the patient response. This document option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed tablet with." },
          { id: "doc3", label: "Copy the prior oasis purpose, authorized assessors, time points, and accountability narrative even though today’s closed tablet with evidence is different. This document option concerns closed tablet with during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for oasis purpose, authorized assessors, time points, and accountability." },
        ],
        feedback: {
          observed: "Observe the closed tablet with as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the compact assessment bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed tablet with as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the compact assessment bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed tablet with, compare the visible evidence with compact assessment bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed tablet with; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For closed tablet with, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "compact-assessment-bag-1-3", label: "compact assessment bag", shortLabel: "compact assessment bag", ariaLabel: "Investigate compact assessment bag",        x: 81, y: 44, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the compact assessment bag as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact assessment bag, compare the visible evidence with credential badge and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the compact assessment bag as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact assessment bag, compare the visible evidence with credential badge and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the compact assessment bag and omit the related change, symptom, or safety cue. This identify option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for oasis purpose, authorized assessors, time points, and accountability." },
          { id: "i3", label: "Let a blank, unreadable, or unverified compact assessment bag stand in for direct RN assessment. This identify option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about compact assessment bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact assessment bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact assessment bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the compact assessment bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for compact assessment bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for oasis purpose, authorized assessors, time points, and accountability instead of the current controlled clinical pathway. This decide option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during oasis purpose, authorized assessors, time points, and accountability." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For compact assessment bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For compact assessment bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the compact assessment bag and omit the discrepancy with credential badge. This document option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compact assessment bag." },
          { id: "doc3", label: "Combine the compact assessment bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns compact assessment bag during oasis purpose, authorized assessors, time points, and accountability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for oasis purpose, authorized assessors, time points, and accountability." },
        ],
        feedback: {
          observed: "Observe the compact assessment bag as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the compact assessment bag as patient-specific evidence for oasis purpose, authorized assessors, time points, and accountability. Compare it with the credential badge, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for oasis purpose, authorized assessors, time points, and accountability, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For compact assessment bag, compare the visible evidence with credential badge and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to compact assessment bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for oasis purpose, authorized assessors, time points, and accountability. For compact assessment bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Patient",
    title: "Patient interview, direct observation, source hierarchy, and response selection",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for patient interview, direct observation, source hierarchy, and response selection within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-009, CL-CA-002, CL-OA-019, CL-OA-002, CL-OA-007, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-009, Assessment Execution — Direct Current-Status Evaluation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assessing RN ; For every GG functional item applicable to the SOC OASIS, ask the patient to perform the activity during the assessment visit. Observe the performance. Code from the observation. If the patient's performance demonstrates greater independence than the discharge documentation suggested, code the greater independence. If the patient's performance demonstrates greater dependence than the discharge documentation suggested, code the greater dependence. The direct observation governs in both directions. ; During the assessment visit. ; ; 6.2.2 ; Assessing RN ; For clinical severity and symptom items — respiratory status, cardiac status, pain, nutritional status, bladder and bowel function —.",
      "Controlled-policy focus — CL-CA-002, Domain-Specific OASIS Accuracy Standards. The following domain-specific accuracy standards shall govern response selection for the highest-risk OASIS item categories. These standards supplement the CMS OASIS-E2 Guidance Manual and do not supersede it. 6.2.1 Functional Status — GG Items (GG0130, GG0170) ; Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1.1 ; Assigned RN ; The GG functional items assess the patient's performance of specific activities — not their capacity. Observe the patient perform each activity during the visit whenever possible. Do not select a response based solely on the patient's or caregiver's report of what the patient can or cannot do. ; During the assessment visit. ; ; 6.2.1.2 ; Assigned RN ; Use the.",
      "Controlled-policy focus — CL-OA-019, 6\\. Pre-Submission Quality Review — Required Review Sections. The Pre-Submission Quality Review Checklist (Appendix A) consists of the following five review sections, each addressing a distinct quality dimension: Section 1 — Completeness Check Purpose: Verify that all applicable OASIS items for the current time point have been addressed with a clinician-selected response. Required Actions: Open the CMS OASIS-E2 item applicability table for the applicable time point (SOC, ROC, RECERT, FU, TRN, or DC). For each applicable item, verify that a response has been selected and that the response is not a default value that was not reviewed. For any item left blank, not applicable, or at a default value, verify that the clinical record contains a documented basis for that status (the patient's condition makes the.",
      "Controlled-policy focus — CL-OA-002, Level 3 Review — Director of Nursing Monthly Audit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing ; Conduct a monthly OASIS accuracy audit of a random sample of ≥5% of all locked assessments from the prior month, per CL-CA-002. The audit shall include all time points proportionally — not exclusively SOC assessments. ; Monthly. ; ; 6.3.2 ; Director of Nursing ; Calculate monthly OASIS accuracy rates by item category and by individual assessor per CL-CA-002 (Appendix C of CL-CA-002 — OASIS Accuracy Dashboard). ; Within 5 business days of audit completion. ; ; 6.3.3 ; Director of Nursing ; Provide individual written feedback to each audited assessor within 14 calendar days, including: specific.",
      "Controlled-policy focus — CL-OA-007, GG Functional Assessment Items (GG0130 Self-Care; GG0170 Mobility). The GG items are the highest-risk OASIS category for substantiation deficiencies. They directly drive PDGM functional level classification, which affects Medicare payment across all episode types. ADR auditors examine GG item substantiation in virtually every home health claim audit. Minimum Adequate Substantiation Standard for Each GG Item: The narrative documentation shall contain ALL of the following elements for each GG item that is being coded: The activity or action being assessed — stated explicitly (not implied) What the patient actually did during the assessment — described in observable terms (not \"can perform\" or \"is able to\") The level of physical assistance provided — described in the same terms as the OASIS response option (no helper needed; setup or.",
      "Apply the controlled requirements to the three visible objects in the scene for patient interview, direct observation, source hierarchy, and response selection. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the unlabeled pill organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Unlabeled Pill Organizer", detail: "Review the unlabeled pill organizer for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR § 484.55(b)" },
      { kind: "External Authority", text: "42 CFR § 484.20" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "tablet-2-1", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the tablet as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the unlabeled pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with unlabeled pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the unlabeled pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with unlabeled pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for patient interview, direct observation, source hierarchy, and response selection." },
          { id: "i3", label: "Dismiss the conflict between the tablet and unlabeled pill organizer because one source appears more convenient. This identify option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This decide option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during patient interview, direct observation, source hierarchy, and response selection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet before reassessment confirms the patient response. This document option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Copy the prior patient interview, direct observation, source hierarchy, and response selection narrative even though today’s tablet evidence is different. This document option concerns tablet during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient interview, direct observation, source hierarchy, and response selection." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the unlabeled pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the unlabeled pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with unlabeled pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "unlabeled-pill-organizer-2-2", label: "unlabeled pill organizer", shortLabel: "unlabeled pill organizer", ariaLabel: "Investigate unlabeled pill organizer",        x: 34, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the unlabeled pill organizer as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled pill organizer, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the unlabeled pill organizer as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled pill organizer, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the unlabeled pill organizer and omit the related change, symptom, or safety cue. This identify option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for patient interview, direct observation, source hierarchy, and response selection." },
          { id: "i3", label: "Let a blank, unreadable, or unverified unlabeled pill organizer stand in for direct RN assessment. This identify option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about unlabeled pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the unlabeled pill organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for unlabeled pill organizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for patient interview, direct observation, source hierarchy, and response selection instead of the current controlled clinical pathway. This decide option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during patient interview, direct observation, source hierarchy, and response selection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For unlabeled pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For unlabeled pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the unlabeled pill organizer and omit the discrepancy with stethoscope. This document option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of unlabeled pill organizer." },
          { id: "doc3", label: "Combine the unlabeled pill organizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns unlabeled pill organizer during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient interview, direct observation, source hierarchy, and response selection." },
        ],
        feedback: {
          observed: "Observe the unlabeled pill organizer as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the unlabeled pill organizer as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For unlabeled pill organizer, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to unlabeled pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For unlabeled pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "stethoscope-2-3", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the stethoscope as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Treat the stethoscope as the complete assessment and do not compare the tablet, patient report, or current record. This identify option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for patient interview, direct observation, source hierarchy, and response selection." },
          { id: "i3", label: "Carry forward the prior visit conclusion for patient interview, direct observation, source hierarchy, and response selection without reassessing the patient today. This identify option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the stethoscope alone and seek clarification only after the intervention is complete. This decide option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Defer the concern in the stethoscope to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during patient interview, direct observation, source hierarchy, and response selection." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the stethoscope was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Keep the stethoscope decision in personal notes rather than the governed patient record. This document option concerns stethoscope during patient interview, direct observation, source hierarchy, and response selection.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for patient interview, direct observation, source hierarchy, and response selection." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for patient interview, direct observation, source hierarchy, and response selection. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for patient interview, direct observation, source hierarchy, and response selection, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for patient interview, direct observation, source hierarchy, and response selection. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Item-sp",
    title: "Item-specific conventions, look-back periods, and point-in-time coding",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for item-specific conventions, look-back periods, and point-in-time coding within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-010, CL-OA-009, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-010, Look-Back Period Calculation and Application. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assessing RN ; Before beginning OASIS coding at each assessment time point, identify the assessment date and calculate the applicable look-back windows: (a) Assessment date minus 7 calendar days = beginning of the 7-day look-back window; (b) Assessment date minus 14 calendar days = beginning of the 14-day look-back window. Record these dates in the assessment narrative to document that the correct window was applied. ; Before OASIS coding at each assessment. ; ; 6.1.2 ; Assessing RN ; For each item with a look-back period, gather evidence from within the defined window: (a) Directly observe the patient's current status during.",
      "Controlled-policy focus — CL-OA-010, Common Look-Back Period Application Scenarios. Scenario 1 — SOC Assessment 3 Days After Hospital Discharge: SOC assessment date: July 10. Hospital discharge date: July 7. For items with a 7-day look-back, the window is July 3–July 10. Four of those seven days (July 3–7) occurred during the hospital stay. Incontinence episodes, behavioral symptoms, and ADL assistance levels that occurred during the hospital stay between July 3 and July 7 are within scope for the look-back items. The assessor shall ask the patient and caregiver about those hospital days, and may contact the discharging facility for information if necessary. Document: \"7-day look-back for M1700 covers July 3–10. Patient hospitalized July 3–7. Patient and caregiver interviewed regarding cognitive function during both the hospital stay (July.",
      "Controlled-policy focus — CL-OA-009, Look-Back Period Application — Measured from SOC/ROC Date. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Assessing RN ; For all OASIS items with defined look-back periods, the look-back is measured backward from the SOC or ROC assessment date — not from the hospital discharge date. If the SOC assessment is conducted on July 5 and the hospital discharge was on July 3, the 7-day look-back for applicable items covers June 28 through July 5 — including the two inpatient days immediately before discharge. If the SOC assessment is conducted on July 10, the 7-day look-back covers July 3 through July 10. See CL-OA-010 for item-specific look-back requirements. ; During OASIS coding; before locking. ; ; 6.4.2.",
      "Controlled-policy focus — CL-OA-010, 5\\. CMS Look-Back Period Reference Table. The following table summarizes look-back periods for key OASIS-E2 items. This table is based on the current CMS OASIS-E2 Guidance Manual. When CMS updates the Guidance Manual, this table shall be updated within 30 calendar days per CL-OA-004. In all cases, the current CMS OASIS-E2 Guidance Manual governs over this table. ; Look-Back Period ; Applicable OASIS Items (Representative) ; Data Collection Notes ; ; ; ; ; ; Point-in-Time (Assessment Day) ; GG0130 (Self-Care — SOC/ROC), GG0170 (Mobility — SOC/ROC), M1830 (Bathing — SOC/ROC/DC), M1840–M1860 (Toileting, Transferring — SOC/ROC/DC), M1870 (Eating — SOC/ROC/DC) ; Reflects the patient's performance or status at the time of the assessment encounter. Activities should be directly observed during the visit when feasible..",
      "Controlled-policy focus — CL-OA-010, 7\\. Look-Back Period Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Look-back window dates documented in assessment narrative ; Explicit look-back window dates for each applicable item category ; Assessing RN ; EHR — Assessment narrative ; Before OASIS coding; retained minimum 7 years ; ; Time-anchored patient/caregiver interview documentation ; Interview questions and responses with look-back period specified ; Assessing RN ; EHR — Assessment narrative ; During assessment; documented within 24 hours ; ; Look-back window overlap with prior care setting documentation ; Specific notation when look-back includes inpatient or prior care setting days ; Assessing RN ; EHR — Assessment narrative ; In the assessment narrative.",
      "Apply the controlled requirements to the three visible objects in the scene for item-specific conventions, look-back periods, and point-in-time coding. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Analog Clock Without Numerals", detail: "Review the analog clock without numerals for the patient-specific finding. Reconcile it with the closed visit diary, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Closed Visit Diary", detail: "Review the closed visit diary for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the analog clock without numerals, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR § 484.20" },
      { kind: "External Authority", text: "42 CFR § 484.55(c)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "analog-clock-without-numerals-3-1", label: "analog clock without numerals", shortLabel: "analog clock without numerals", ariaLabel: "Investigate analog clock without numerals",        x: 14, y: 50, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the analog clock without numerals as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the closed visit diary, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog clock without numerals, compare the visible evidence with closed visit diary and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the analog clock without numerals as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the closed visit diary, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog clock without numerals, compare the visible evidence with closed visit diary and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the analog clock without numerals and omit the related change, symptom, or safety cue. This identify option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for item-specific conventions, look-back periods, and point-in-time coding." },
          { id: "i3", label: "Let a blank, unreadable, or unverified analog clock without numerals stand in for direct RN assessment. This identify option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about analog clock without numerals." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog clock without numerals; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog clock without numerals; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the analog clock without numerals issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for analog clock without numerals is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for item-specific conventions, look-back periods, and point-in-time coding instead of the current controlled clinical pathway. This decide option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For analog clock without numerals, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For analog clock without numerals, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the analog clock without numerals and omit the discrepancy with closed visit diary. This document option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of analog clock without numerals." },
          { id: "doc3", label: "Combine the analog clock without numerals issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns analog clock without numerals during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        feedback: {
          observed: "Observe the analog clock without numerals as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the closed visit diary, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the analog clock without numerals as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the closed visit diary, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog clock without numerals, compare the visible evidence with closed visit diary and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog clock without numerals; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For analog clock without numerals, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "closed-visit-diary-3-2", label: "closed visit diary", shortLabel: "closed visit diary", ariaLabel: "Investigate closed visit diary",        x: 35, y: 38, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the closed visit diary as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed visit diary, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed visit diary as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed visit diary, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Treat the closed visit diary as the complete assessment and do not compare the tablet, patient report, or current record. This identify option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for item-specific conventions, look-back periods, and point-in-time coding." },
          { id: "i3", label: "Carry forward the prior visit conclusion for item-specific conventions, look-back periods, and point-in-time coding without reassessing the patient today. This identify option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed visit diary." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed visit diary; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed visit diary; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the closed visit diary alone and seek clarification only after the intervention is complete. This decide option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed visit diary is resolved." },
          { id: "d3", label: "Defer the concern in the closed visit diary to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For closed visit diary, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For closed visit diary, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the closed visit diary was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed visit diary." },
          { id: "doc3", label: "Keep the closed visit diary decision in personal notes rather than the governed patient record. This document option concerns closed visit diary during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        feedback: {
          observed: "Observe the closed visit diary as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed visit diary as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed visit diary, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed visit diary; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For closed visit diary, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "tablet-3-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 78, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the tablet as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the analog clock without numerals, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with analog clock without numerals and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the analog clock without numerals, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with analog clock without numerals and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for item-specific conventions, look-back periods, and point-in-time coding." },
          { id: "i3", label: "Dismiss the conflict between the tablet and analog clock without numerals because one source appears more convenient. This identify option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This decide option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet before reassessment confirms the patient response. This document option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Copy the prior item-specific conventions, look-back periods, and point-in-time coding narrative even though today’s tablet evidence is different. This document option concerns tablet during item-specific conventions, look-back periods, and point-in-time coding.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for item-specific conventions, look-back periods, and point-in-time coding." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the analog clock without numerals, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for item-specific conventions, look-back periods, and point-in-time coding. Compare it with the analog clock without numerals, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for item-specific conventions, look-back periods, and point-in-time coding, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with analog clock without numerals and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for item-specific conventions, look-back periods, and point-in-time coding. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Functio",
    title: "Functional, cognitive, mood, and standardized-tool accuracy",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for functional, cognitive, mood, and standardized-tool accuracy within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-CA-002, CL-OA-007, CL-OA-013, CL-OA-009, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CA-002, Monthly OASIS Accuracy Audit. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing ; Conduct or commission a monthly OASIS accuracy audit covering ≥5% of all submitted assessments from the prior month, using the OASIS Quality Review Tool (Appendix A). The audit shall include all time points in the sample, not only SOC assessments. ; Monthly. ; ; 6.5.2 ; Director of Nursing ; Calculate the data accuracy rate for the audited sample by item category: GG functional items, wound items, behavioral health items, medication items, and overall. Document the accuracy rate in the OASIS Accuracy Dashboard (Appendix C). ; Within 5 business days of audit completion. ; ; 6.5.3.",
      "Controlled-policy focus — CL-OA-007, Behavioral Health Items — M1700 (Cognitive Function) / BIMS. Minimum Adequate Substantiation Standard: For M1700 and all BIMS-derived items, the narrative shall document: BIMS administration confirmation — explicit statement that the BIMS was administered during the current assessment encounter Word repetition component score — the three words used and the number repeated correctly Temporal orientation component scores — the patient's responses to year, month, and day of week questions; each scored individually Word recall component score — the number of words recalled from the initial repetition Total BIMS score — calculated from the components Cognitive domain interpretation — \"Cognitively Intact (13–15)\" / \"Moderately Impaired (8–12)\" / \"Severely Impaired (0–7)\" When BIMS Cannot Be Administered: If the patient is unable to complete the BIMS (comatose, severe aphasia, refuses).",
      "Controlled-policy focus — CL-CA-002, Domain-Specific OASIS Accuracy Standards. The following domain-specific accuracy standards shall govern response selection for the highest-risk OASIS item categories. These standards supplement the CMS OASIS-E2 Guidance Manual and do not supersede it. 6.2.1 Functional Status — GG Items (GG0130, GG0170) ; Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1.1 ; Assigned RN ; The GG functional items assess the patient's performance of specific activities — not their capacity. Observe the patient perform each activity during the visit whenever possible. Do not select a response based solely on the patient's or caregiver's report of what the patient can or cannot do. ; During the assessment visit. ; ; 6.2.1.2 ; Assigned RN ; Use the.",
      "Controlled-policy focus — CL-OA-013, Core Verification Comparisons. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assessing RN ; Functional Status Verification: Compare all GG functional item responses (GG0130, GG0170) against: (a) the referral's discharge functional summary; (b) any PT or OT evaluation reports available; (c) the physician's functional status notation in the discharge summary or office notes; (d) visit notes from the look-back period that describe the patient's functional performance. Identify any response where the OASIS reflects a significantly different functional level than any of these documents without a documented clinical reason for the difference. Document any inconsistency identified and its resolution in the checklist. ; During verification. ; ; 6.2.2 ; Assessing RN ; Diagnosis.",
      "Controlled-policy focus — CL-OA-009, 4\\. Policy Statement. 4.1 Every SOC and ROC OASIS assessment at Care Indeed Home Health Care, Inc. shall reflect the patient's clinical and functional status at the time of the SOC or ROC assessment visit — the actual date the assessing RN conducted the comprehensive assessment in the patient's home. For items with defined look-back periods, the look-back is measured backward from the SOC/ROC assessment date, not from the patient's discharge date. 4.2 The patient's functional status, symptom status, clinical severity, and behavioral health status as documented in the hospital or SNF discharge summary represents the patient's status at the time of hospital or SNF discharge — not at the time of the home health SOC assessment. These are different points.",
      "Apply the controlled requirements to the three visible objects in the scene for functional, cognitive, mood, and standardized-tool accuracy. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Cognitive Cards", detail: "Review the cognitive cards for the patient-specific finding. Reconcile it with the analog timer without numbers, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Analog Timer Without Numbers", detail: "Review the analog timer without numbers for the patient-specific finding. Reconcile it with the pencil, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Pencil", detail: "Review the pencil for the patient-specific finding. Reconcile it with the cognitive cards, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR § 484.55(c)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "cognitive-cards-4-1", label: "cognitive cards", shortLabel: "cognitive cards", ariaLabel: "Investigate cognitive cards",        x: 21, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the cognitive cards as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the analog timer without numbers, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cognitive cards, compare the visible evidence with analog timer without numbers and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the cognitive cards as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the analog timer without numbers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cognitive cards, compare the visible evidence with analog timer without numbers and the controlling source before classifying status." },
          { id: "i2", label: "Treat the cognitive cards as the complete assessment and do not compare the analog timer without numbers, patient report, or current record. This identify option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, mood, and standardized-tool accuracy." },
          { id: "i3", label: "Carry forward the prior visit conclusion for functional, cognitive, mood, and standardized-tool accuracy without reassessing the patient today. This identify option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about cognitive cards." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cognitive cards; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cognitive cards; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the cognitive cards alone and seek clarification only after the intervention is complete. This decide option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for cognitive cards is resolved." },
          { id: "d3", label: "Defer the concern in the cognitive cards to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For cognitive cards, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For cognitive cards, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the cognitive cards was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of cognitive cards." },
          { id: "doc3", label: "Keep the cognitive cards decision in personal notes rather than the governed patient record. This document option concerns cognitive cards during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        feedback: {
          observed: "Observe the cognitive cards as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the analog timer without numbers, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the cognitive cards as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the analog timer without numbers, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cognitive cards, compare the visible evidence with analog timer without numbers and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cognitive cards; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For cognitive cards, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "analog-timer-without-numbers-4-2", label: "analog timer without numbers", shortLabel: "analog timer without numbers", ariaLabel: "Investigate analog timer without numbers",        x: 32, y: 71, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the analog timer without numbers as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the pencil, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog timer without numbers, compare the visible evidence with pencil and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the analog timer without numbers as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the pencil, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog timer without numbers, compare the visible evidence with pencil and the controlling source before classifying status." },
          { id: "i2", label: "Assume the analog timer without numbers establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, mood, and standardized-tool accuracy." },
          { id: "i3", label: "Dismiss the conflict between the analog timer without numbers and pencil because one source appears more convenient. This identify option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about analog timer without numbers." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog timer without numbers; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog timer without numbers; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the analog timer without numbers without confirming an applicable order and patient-specific authority. This decide option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for analog timer without numbers is resolved." },
          { id: "d3", label: "Hand the analog timer without numbers concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For analog timer without numbers, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For analog timer without numbers, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the analog timer without numbers before reassessment confirms the patient response. This document option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of analog timer without numbers." },
          { id: "doc3", label: "Copy the prior functional, cognitive, mood, and standardized-tool accuracy narrative even though today’s analog timer without numbers evidence is different. This document option concerns analog timer without numbers during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        feedback: {
          observed: "Observe the analog timer without numbers as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the pencil, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the analog timer without numbers as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the pencil, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For analog timer without numbers, compare the visible evidence with pencil and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to analog timer without numbers; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For analog timer without numbers, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "pencil-4-3", label: "pencil", shortLabel: "pencil", ariaLabel: "Investigate pencil",        x: 85, y: 50, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the pencil as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the cognitive cards, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pencil, compare the visible evidence with cognitive cards and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pencil as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the cognitive cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pencil, compare the visible evidence with cognitive cards and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pencil and omit the related change, symptom, or safety cue. This identify option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for functional, cognitive, mood, and standardized-tool accuracy." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pencil stand in for direct RN assessment. This identify option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pencil." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pencil; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pencil; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pencil issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pencil is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for functional, cognitive, mood, and standardized-tool accuracy instead of the current controlled clinical pathway. This decide option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For pencil, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For pencil, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pencil and omit the discrepancy with cognitive cards. This document option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pencil." },
          { id: "doc3", label: "Combine the pencil issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pencil during functional, cognitive, mood, and standardized-tool accuracy.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for functional, cognitive, mood, and standardized-tool accuracy." },
        ],
        feedback: {
          observed: "Observe the pencil as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the cognitive cards, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pencil as patient-specific evidence for functional, cognitive, mood, and standardized-tool accuracy. Compare it with the cognitive cards, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for functional, cognitive, mood, and standardized-tool accuracy, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pencil, compare the visible evidence with cognitive cards and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pencil; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for functional, cognitive, mood, and standardized-tool accuracy. For pencil, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Wound",
    title: "Wound, medication, and clinical-domain coding substantiation",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for wound, medication, and clinical-domain coding substantiation within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-007, CL-CA-002, CL-OA-004, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-007, Wound Assessment Items (M1311–M1350). Minimum Adequate Substantiation Standard: For each wound for which an OASIS wound item is coded, the narrative shall document: Wound location — specific anatomical site Wound etiology — the clinical basis for the wound type classification Wound stage or classification — per NPIAP (for pressure injuries) or applicable system; with the specific observable features that determine the stage Wound measurements — L x W x D in centimeters, measured with a disposable tool at the current assessment Wound bed description — percentage of each tissue type (granulation, epithelialization, slough, eschar, necrotic) Drainage — type and amount Periwound skin — specific description of the surrounding tissue Signs of infection — specific indicators assessed and present or absent Whether a.",
      "Controlled-policy focus — CL-OA-007, Medication Management Items (M2001, M2003, M2010). Minimum Adequate Substantiation Standard: For M2001 (Drug Regimen Review), the narrative shall document: Confirmation that a drug regimen review was conducted — explicit statement with the methodology (physical inventory of medication bottles, comparison against prescription list, patient interview) The specific potential clinically significant issues identified — or explicit statement that no issues were identified, with the specific checks performed (interactions, allergies, duplications, dose errors, contraindications) The medications reviewed — the complete medication list reviewed, or reference to the medication reconciliation worksheet per CL-SD-013 For M2003 (Medication Follow-Up), the narrative shall document whether the physician was contacted within one calendar day of the drug regimen review for any identified potential clinically significant medication issues — with the date and.",
      "Controlled-policy focus — CL-CA-002, Domain-Specific OASIS Accuracy Standards. The following domain-specific accuracy standards shall govern response selection for the highest-risk OASIS item categories. These standards supplement the CMS OASIS-E2 Guidance Manual and do not supersede it. 6.2.1 Functional Status — GG Items (GG0130, GG0170) ; Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1.1 ; Assigned RN ; The GG functional items assess the patient's performance of specific activities — not their capacity. Observe the patient perform each activity during the visit whenever possible. Do not select a response based solely on the patient's or caregiver's report of what the patient can or cannot do. ; During the assessment visit. ; ; 6.2.1.2 ; Assigned RN ; Use the.",
      "Controlled-policy focus — CL-OA-007, OASIS Quality Reviewer Substantiation Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 7.2.1 ; OASIS Quality Reviewer ; For every SOC assessment reviewed, specifically evaluate substantiation adequacy using the Substantiation Assessment Matrix (Appendix A). For each item reviewed, rate the substantiation as: Adequate; Inadequate — specific deficiency noted; Insufficient documentation — narrative does not contain enough detail to evaluate. ; Within the timeline specified in CL-OA-002. ; ; 7.2.2 ; OASIS Quality Reviewer ; When an item is rated Inadequate or Insufficient, document: the specific item; the specific documentation gap or inadequacy; the coded response; and the corrective action recommendation (additional documentation needed; field assessment needed; correction of coded response needed). ; At the time.",
      "Controlled-policy focus — CL-OA-004, Audit of Coding Materials for Guidance Compliance. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Director of Nursing ; Conduct an annual audit of all OASIS coding materials in the agency's possession — including printed reference guides, digital reference cards, training slides, coding worksheets, and any third-party training materials — to verify that each material is: (a) consistent with the current version of the CMS OASIS-E2 Guidance Manual; (b) clearly labeled as a supplement to — not replacement of — the Guidance Manual; (c) dated and identified as applicable to the current OASIS version. ; Annually; concurrent with the annual OASIS re-competency cycle. ; ; 6.3.2 ; Director of Nursing ; Remove or destroy any coding.",
      "Apply the controlled requirements to the three visible objects in the scene for wound, medication, and clinical-domain coding substantiation. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Modest Silicone Wound Model", detail: "Review the modest silicone wound model for the patient-specific finding. Reconcile it with the pill organizer, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pill Organizer", detail: "Review the pill organizer for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the modest silicone wound model, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55(a)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "modest-silicone-wound-model-5-1", label: "modest silicone wound model", shortLabel: "modest silicone wound model", ariaLabel: "Investigate modest silicone wound model",        x: 14, y: 66, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the modest silicone wound model as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest silicone wound model, compare the visible evidence with pill organizer and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the modest silicone wound model as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest silicone wound model, compare the visible evidence with pill organizer and the controlling source before classifying status." },
          { id: "i2", label: "Assume the modest silicone wound model establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for wound, medication, and clinical-domain coding substantiation." },
          { id: "i3", label: "Dismiss the conflict between the modest silicone wound model and pill organizer because one source appears more convenient. This identify option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about modest silicone wound model." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest silicone wound model; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest silicone wound model; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the modest silicone wound model without confirming an applicable order and patient-specific authority. This decide option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for modest silicone wound model is resolved." },
          { id: "d3", label: "Hand the modest silicone wound model concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during wound, medication, and clinical-domain coding substantiation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For modest silicone wound model, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For modest silicone wound model, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the modest silicone wound model before reassessment confirms the patient response. This document option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of modest silicone wound model." },
          { id: "doc3", label: "Copy the prior wound, medication, and clinical-domain coding substantiation narrative even though today’s modest silicone wound model evidence is different. This document option concerns modest silicone wound model during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for wound, medication, and clinical-domain coding substantiation." },
        ],
        feedback: {
          observed: "Observe the modest silicone wound model as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the modest silicone wound model as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the pill organizer, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For modest silicone wound model, compare the visible evidence with pill organizer and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to modest silicone wound model; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For modest silicone wound model, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "pill-organizer-5-2", label: "pill organizer", shortLabel: "pill organizer", ariaLabel: "Investigate pill organizer",        x: 34, y: 52, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the pill organizer as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pill organizer as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pill organizer and omit the related change, symptom, or safety cue. This identify option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for wound, medication, and clinical-domain coding substantiation." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pill organizer stand in for direct RN assessment. This identify option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pill organizer." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pill organizer issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pill organizer is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for wound, medication, and clinical-domain coding substantiation instead of the current controlled clinical pathway. This decide option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during wound, medication, and clinical-domain coding substantiation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For pill organizer, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For pill organizer, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pill organizer and omit the discrepancy with tablet. This document option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pill organizer." },
          { id: "doc3", label: "Combine the pill organizer issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pill organizer during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for wound, medication, and clinical-domain coding substantiation." },
        ],
        feedback: {
          observed: "Observe the pill organizer as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pill organizer as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pill organizer, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pill organizer; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For pill organizer, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "tablet-5-3", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 80, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the tablet as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the modest silicone wound model, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with modest silicone wound model and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the modest silicone wound model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with modest silicone wound model and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the modest silicone wound model, patient report, or current record. This identify option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for wound, medication, and clinical-domain coding substantiation." },
          { id: "i3", label: "Carry forward the prior visit conclusion for wound, medication, and clinical-domain coding substantiation without reassessing the patient today. This identify option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during wound, medication, and clinical-domain coding substantiation." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during wound, medication, and clinical-domain coding substantiation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for wound, medication, and clinical-domain coding substantiation." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the modest silicone wound model, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for wound, medication, and clinical-domain coding substantiation. Compare it with the modest silicone wound model, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for wound, medication, and clinical-domain coding substantiation, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with modest silicone wound model and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for wound, medication, and clinical-domain coding substantiation. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Cross-d",
    title: "Cross-document validation, correction, transmission, and exception handling",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for cross-document validation, correction, transmission, and exception handling within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-002, CL-CA-003, CL-OA-018, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-002, Error Correction Process — Pre-Submission and Post-Submission. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing / OASIS Quality Reviewer ; When an error is identified in any OASIS assessment — whether before or after submission — complete the Correction Assessment Form (Appendix A of this policy) before initiating any correction. The form shall document: the specific item in error; the submitted response; the correct response; the clinical evidence in the medical record supporting the correct response; the reason the original response was inaccurate; and whether the correction results in a PDGM payment group change. ; Before initiating any correction. ; ; 6.4.2 ; Director of Nursing ; Review and approve the Correction Assessment.",
      "Controlled-policy focus — CL-CA-003, OASIS Correction Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing / OASIS Quality Reviewer ; When an error in a submitted OASIS record is identified through any means (internal audit per CL-CA-002, CMS response file warning, ADR audit finding, OASIS validation finding, self-identification by the assessing RN), document the identified error in the Correction Assessment Form (Appendix B) including: the specific item(s) in error, the submitted response, the correct response supported by clinical evidence, the reason the original response was inaccurate, and the clinical documentation that supports the correction. ; Within 5 business days of error identification. ; ; 6.4.2 ; Director of Nursing ; Review and approve.",
      "Controlled-policy focus — CL-OA-018, Annual Re-Validation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Director of Nursing ; Alert each assessor 60 days before their authorization anniversary date that annual re-validation is required. Schedule the re-validation to be completed before the anniversary date. ; 60 days before anniversary date per CL-OA-003. ; ; 6.2.2 ; Director of Nursing / Evaluator ; Administer the Annual Re-Validation Written Assessment covering: (a) any changes to the CMS OASIS-E2 Guidance Manual since the prior re-validation; (b) items where the assessor had documented accuracy deficiencies in the prior year's monthly audit results; (c) high-risk coding areas (GG functional items, wound staging, BIMS scoring). 25-item assessment; minimum 85% passing score..",
      "Controlled-policy focus — CL-CA-003, OASIS Transmission Deadlines and Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; OASIS Transmission Coordinator ; Transmit all OASIS assessments to the CMS repository within the following CMS-specified deadlines: (a) SOC assessments — transmitted within 30 calendar days of the SOC date; (b) ROC assessments — transmitted within 30 calendar days of the ROC date; (c) RECERT assessments — transmitted within 30 calendar days of the recertification date; (d) FU (SCIC) assessments — transmitted within 30 calendar days of the assessment date; (e) TRN assessments — transmitted within 30 calendar days of the transfer date; (f) DC assessments — transmitted within 30 calendar days of the discharge date. Note: The 30-day CMS deadline.",
      "Controlled-policy focus — CL-CA-003, OASIS Data Preparation for Transmission. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; OASIS Transmission Coordinator ; Generate a daily report from the agency's EHR listing all OASIS assessments that have been locked and approved for transmission but have not yet been transmitted to CMS. Review the report against the OASIS Submission Log to identify any records approaching their transmission deadline. ; Daily by 8:00 AM. ; ; 6.1.2 ; OASIS Transmission Coordinator ; For each assessment pending transmission, confirm: (a) the assessment has been locked by the assessing RN; (b) the OASIS Quality Reviewer review has been completed per CL-CA-002 and no outstanding corrections are pending; (c) all required data elements for the.",
      "Apply the controlled requirements to the three visible objects in the scene for cross-document validation, correction, transmission, and exception handling. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Three Closed Folders", detail: "Review the three closed folders for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the magnifier, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Magnifier", detail: "Review the magnifier for the patient-specific finding. Reconcile it with the three closed folders, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR §484.55(a)" },
      { kind: "External Authority", text: "42 CFR §484.55(b)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "three-closed-folders-6-1", label: "three closed folders", shortLabel: "three closed folders", ariaLabel: "Investigate three closed folders",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the three closed folders as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three closed folders, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the three closed folders as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three closed folders, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the three closed folders and omit the related change, symptom, or safety cue. This identify option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cross-document validation, correction, transmission, and exception handling." },
          { id: "i3", label: "Let a blank, unreadable, or unverified three closed folders stand in for direct RN assessment. This identify option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about three closed folders." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three closed folders; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three closed folders; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the three closed folders issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for three closed folders is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for cross-document validation, correction, transmission, and exception handling instead of the current controlled clinical pathway. This decide option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cross-document validation, correction, transmission, and exception handling." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For three closed folders, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For three closed folders, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the three closed folders and omit the discrepancy with tablet. This document option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of three closed folders." },
          { id: "doc3", label: "Combine the three closed folders issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns three closed folders during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cross-document validation, correction, transmission, and exception handling." },
        ],
        feedback: {
          observed: "Observe the three closed folders as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the three closed folders as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For three closed folders, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to three closed folders; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For three closed folders, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "tablet-6-2", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 43, y: 53, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the tablet as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with magnifier and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with magnifier and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the magnifier, patient report, or current record. This identify option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cross-document validation, correction, transmission, and exception handling." },
          { id: "i3", label: "Carry forward the prior visit conclusion for cross-document validation, correction, transmission, and exception handling without reassessing the patient today. This identify option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cross-document validation, correction, transmission, and exception handling." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cross-document validation, correction, transmission, and exception handling." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with magnifier and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "magnifier-6-3", label: "magnifier", shortLabel: "magnifier", ariaLabel: "Investigate magnifier",        x: 82, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the magnifier as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the three closed folders, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with three closed folders and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the magnifier as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the three closed folders, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with three closed folders and the controlling source before classifying status." },
          { id: "i2", label: "Assume the magnifier establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for cross-document validation, correction, transmission, and exception handling." },
          { id: "i3", label: "Dismiss the conflict between the magnifier and three closed folders because one source appears more convenient. This identify option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about magnifier." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the magnifier without confirming an applicable order and patient-specific authority. This decide option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for magnifier is resolved." },
          { id: "d3", label: "Hand the magnifier concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during cross-document validation, correction, transmission, and exception handling." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For magnifier, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For magnifier, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the magnifier before reassessment confirms the patient response. This document option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of magnifier." },
          { id: "doc3", label: "Copy the prior cross-document validation, correction, transmission, and exception handling narrative even though today’s magnifier evidence is different. This document option concerns magnifier during cross-document validation, correction, transmission, and exception handling.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for cross-document validation, correction, transmission, and exception handling." },
        ],
        feedback: {
          observed: "Observe the magnifier as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the three closed folders, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the magnifier as patient-specific evidence for cross-document validation, correction, transmission, and exception handling. Compare it with the three closed folders, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for cross-document validation, correction, transmission, and exception handling, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with three closed folders and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for cross-document validation, correction, transmission, and exception handling. For magnifier, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Audit",
    title: "Audit trail, competency validation, data integrity, and final quality review",
    subtitle: "OASIS-E2 Data Collection & Coding",
    narration: [
      "This lesson develops registered-nurse reasoning for audit trail, competency validation, data integrity, and final quality review within OASIS-E2 Data Collection & Coding. Use the current controlled requirements in CL-OA-002, CL-CA-002, CL-OA-019, CL-OA-003, CL-OA-007, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-OA-002, Level 2 Review — OASIS Quality Reviewer Independent Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; OASIS Quality Reviewer ; Review all SOC assessments within 5 business days of locking, using the OASIS Quality Review Tool per CL-CA-002 (Appendix A of CL-CA-002). The review shall assess each high-risk item category independently: GG functional items; wound items (M1311–M1350); behavioral health items (M1700–M1750); medication management items (M2001–M2010); clinical severity items; and homebound/skilled need documentation. ; Within 5 business days of SOC assessment locking. ; ; 6.2.2 ; OASIS Quality Reviewer ; Conduct quarterly random sample reviews of ROC, RECERT, FU, TRN, and DC assessments, reviewing a minimum of 10% of each time point from the prior quarter, using the.",
      "Controlled-policy focus — CL-CA-002, OASIS Quality Reviewer Review — Post-Lock, Pre-Submission. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; OASIS Quality Reviewer ; Review all SOC assessments within 5 business days of locking, using the OASIS Quality Review Tool (Appendix A). The review shall assess: accuracy of GG functional items; accuracy of wound items (M1311–M1350); accuracy of behavioral health items (M1700–M1750); accuracy of medication management items (M2001–M2010); narrative-OASIS consistency for all reviewed items; homebound documentation adequacy; skilled need documentation adequacy. ; Within 5 business days of locking. ; ; 6.4.2 ; OASIS Quality Reviewer ; Document the review findings in the OASIS Quality Review Log (Appendix B), including: the assessment date, the assessing RN, each item reviewed, the reviewer's determination.",
      "Controlled-policy focus — CL-OA-019, OASIS Quality Reviewer Checklist Validation. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 7.3.1 ; OASIS Quality Reviewer ; During every Level 2 review per CL-OA-002: (a) verify that the Pre-Submission Quality Review Checklist is present in the EHR for the reviewed assessment; (b) review the checklist for completeness — all five sections completed; (c) assess whether any issues identified in the checklist were appropriately resolved; (d) independently verify Section 2 (internal consistency) and Section 3 (evidence substantiation) using the Quality Reviewer's own assessment. ; Within the Level 2 review timeline. ; ; 7.3.2 ; OASIS Quality Reviewer ; If the Level 2 review identifies issues not flagged in the pre-submission checklist, document the finding in.",
      "Controlled-policy focus — CL-OA-003, OASIS Quality Reviewer — Advanced Authorization. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Director of Nursing ; Designate a specific authorized assessor for the OASIS Quality Reviewer role. The designee must demonstrate advanced OASIS expertise through one of the following: (a) external OASIS certification from a recognized national organization; (b) completion of an accredited advanced OASIS training program of minimum 20 hours in addition to the standard Competency Program; (c) documented prior experience as an OASIS quality reviewer with demonstrated competency at a prior agency, assessed through a Director of Nursing competency interview and case review exercise. ; At the time of initial designation; maintained and re-evaluated annually. ; ; 6.5.2 ; Director of.",
      "Controlled-policy focus — CL-OA-007, OASIS Quality Reviewer Substantiation Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 7.2.1 ; OASIS Quality Reviewer ; For every SOC assessment reviewed, specifically evaluate substantiation adequacy using the Substantiation Assessment Matrix (Appendix A). For each item reviewed, rate the substantiation as: Adequate; Inadequate — specific deficiency noted; Insufficient documentation — narrative does not contain enough detail to evaluate. ; Within the timeline specified in CL-OA-002. ; ; 7.2.2 ; OASIS Quality Reviewer ; When an item is rated Inadequate or Insufficient, document: the specific item; the specific documentation gap or inadequacy; the coded response; and the corrective action recommendation (additional documentation needed; field assessment needed; correction of coded response needed). ; At the time.",
      "Apply the controlled requirements to the three visible objects in the scene for audit trail, competency validation, data integrity, and final quality review. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the locked folder box, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Locked Folder Box", detail: "Review the locked folder box for the patient-specific finding. Reconcile it with the magnifier, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Magnifier", detail: "Review the magnifier for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CA-002" },
      { kind: "Controlled Policy", text: "CL-CA-003" },
      { kind: "Controlled Policy", text: "CL-OA-001" },
      { kind: "Controlled Policy", text: "CL-OA-002" },
      { kind: "Controlled Policy", text: "CL-OA-003" },
      { kind: "Controlled Policy", text: "CL-OA-004" },
      { kind: "Controlled Policy", text: "CL-OA-007" },
      { kind: "Controlled Policy", text: "CL-OA-009" },
      { kind: "Controlled Policy", text: "CL-OA-010" },
      { kind: "Controlled Policy", text: "CL-OA-013" },
      { kind: "Controlled Policy", text: "CL-OA-018" },
      { kind: "Controlled Policy", text: "CL-OA-019" },
      { kind: "Controlled Policy", text: "CL-OA-101" },
      { kind: "External Authority", text: "42 CFR §484.55(b)" },
      { kind: "External Authority", text: "42 CFR § 484.55(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "tablet-7-1", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 17, y: 73, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the tablet as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the locked folder box, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with locked folder box and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the locked folder box, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with locked folder box and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the locked folder box, patient report, or current record. This identify option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for audit trail, competency validation, data integrity, and final quality review." },
          { id: "i3", label: "Carry forward the prior visit conclusion for audit trail, competency validation, data integrity, and final quality review without reassessing the patient today. This identify option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during audit trail, competency validation, data integrity, and final quality review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit trail, competency validation, data integrity, and final quality review." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the locked folder box, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the locked folder box, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with locked folder box and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "locked-folder-box-7-2", label: "locked folder box", shortLabel: "locked folder box", ariaLabel: "Investigate locked folder box",        x: 55, y: 71, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the locked folder box as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked folder box, compare the visible evidence with magnifier and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the locked folder box as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked folder box, compare the visible evidence with magnifier and the controlling source before classifying status." },
          { id: "i2", label: "Assume the locked folder box establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for audit trail, competency validation, data integrity, and final quality review." },
          { id: "i3", label: "Dismiss the conflict between the locked folder box and magnifier because one source appears more convenient. This identify option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about locked folder box." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked folder box; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked folder box; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the locked folder box without confirming an applicable order and patient-specific authority. This decide option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for locked folder box is resolved." },
          { id: "d3", label: "Hand the locked folder box concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during audit trail, competency validation, data integrity, and final quality review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For locked folder box, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For locked folder box, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the locked folder box before reassessment confirms the patient response. This document option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of locked folder box." },
          { id: "doc3", label: "Copy the prior audit trail, competency validation, data integrity, and final quality review narrative even though today’s locked folder box evidence is different. This document option concerns locked folder box during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit trail, competency validation, data integrity, and final quality review." },
        ],
        feedback: {
          observed: "Observe the locked folder box as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the locked folder box as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the magnifier, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For locked folder box, compare the visible evidence with magnifier and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to locked folder box; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For locked folder box, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
      {
        id: "magnifier-7-3", label: "magnifier", shortLabel: "magnifier", ariaLabel: "Investigate magnifier",        x: 78, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the magnifier as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the magnifier as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the magnifier and omit the related change, symptom, or safety cue. This identify option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for audit trail, competency validation, data integrity, and final quality review." },
          { id: "i3", label: "Let a blank, unreadable, or unverified magnifier stand in for direct RN assessment. This identify option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about magnifier." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the magnifier issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for magnifier is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for audit trail, competency validation, data integrity, and final quality review instead of the current controlled clinical pathway. This decide option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during audit trail, competency validation, data integrity, and final quality review." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For magnifier, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For magnifier, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the magnifier and omit the discrepancy with tablet. This document option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of magnifier." },
          { id: "doc3", label: "Combine the magnifier issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns magnifier during audit trail, competency validation, data integrity, and final quality review.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for audit trail, competency validation, data integrity, and final quality review." },
        ],
        feedback: {
          observed: "Observe the magnifier as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the magnifier as patient-specific evidence for audit trail, competency validation, data integrity, and final quality review. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for audit trail, competency validation, data integrity, and final quality review, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For magnifier, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to magnifier; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for audit trail, competency validation, data integrity, and final quality review. For magnifier, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-CA-002","CL-CA-003","CL-OA-001","CL-OA-002","CL-OA-003","CL-OA-004","CL-OA-007","CL-OA-009","CL-OA-010","CL-OA-013","CL-OA-018","CL-OA-019","CL-OA-101","42 CFR § 484.55","42 CFR § 484.55(b)","42 CFR § 484.20","42 CFR § 484.55(c)","42 CFR §484.110","42 CFR §484.55(a)","42 CFR §484.55(b)","42 CFR § 484.55(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During oasis purpose, authorized assessors, time points, and accountability, the compact assessment bag conflicts with the credential badge and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the compact assessment bag alone and seek clarification only after the intervention is complete. This option concerns oasis purpose, authorized assessors, time points, and accountability.",
      "Defer the concern in the compact assessment bag to the next routine visit even though its current clinical significance has not been assessed. This option concerns oasis purpose, authorized assessors, time points, and accountability.",
      "Assume the credential badge is unchanged from the prior encounter and omit patient-specific reassessment during oasis purpose, authorized assessors, time points, and accountability.",
      "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for oasis purpose, authorized assessors, time points, and accountability within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 2,
    stem: "During patient interview, direct observation, source hierarchy, and response selection, the stethoscope conflicts with the tablet and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns patient interview, direct observation, source hierarchy, and response selection.",
      "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This option concerns patient interview, direct observation, source hierarchy, and response selection.",
      "Assume the tablet is unchanged from the prior encounter and omit patient-specific reassessment during patient interview, direct observation, source hierarchy, and response selection.",
      "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for patient interview, direct observation, source hierarchy, and response selection within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 3,
    stem: "During item-specific conventions, look-back periods, and point-in-time coding, the tablet conflicts with the analog clock without numerals and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for item-specific conventions, look-back periods, and point-in-time coding instead of the current controlled clinical pathway. This option concerns item-specific conventions, look-back periods, and point-in-time coding.",
      "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the analog clock without numerals is unchanged from the prior encounter and omit patient-specific reassessment during item-specific conventions, look-back periods, and point-in-time coding.",
      "Close the tablet issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns item-specific conventions, look-back periods, and point-in-time coding.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for item-specific conventions, look-back periods, and point-in-time coding within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 4,
    stem: "During functional, cognitive, mood, and standardized-tool accuracy, the pencil conflicts with the cognitive cards and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the pencil alone and seek clarification only after the intervention is complete. This option concerns functional, cognitive, mood, and standardized-tool accuracy.",
      "Assume the cognitive cards is unchanged from the prior encounter and omit patient-specific reassessment during functional, cognitive, mood, and standardized-tool accuracy.",
      "Defer the concern in the pencil to the next routine visit even though its current clinical significance has not been assessed. This option concerns functional, cognitive, mood, and standardized-tool accuracy.",
      "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for functional, cognitive, mood, and standardized-tool accuracy within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 5,
    stem: "During wound, medication, and clinical-domain coding substantiation, the tablet conflicts with the modest silicone wound model and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the modest silicone wound model is unchanged from the prior encounter and omit patient-specific reassessment during wound, medication, and clinical-domain coding substantiation.",
      "Change the treatment, medication, device setting, or plan based on the tablet without confirming an applicable order and patient-specific authority. This option concerns wound, medication, and clinical-domain coding substantiation.",
      "Hand the tablet concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns wound, medication, and clinical-domain coding substantiation.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for wound, medication, and clinical-domain coding substantiation within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 6,
    stem: "During cross-document validation, correction, transmission, and exception handling, the magnifier conflicts with the three closed folders and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Close the magnifier issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns cross-document validation, correction, transmission, and exception handling.",
      "Assume the three closed folders is unchanged from the prior encounter and omit patient-specific reassessment during cross-document validation, correction, transmission, and exception handling.",
      "Use a familiar local shortcut for cross-document validation, correction, transmission, and exception handling instead of the current controlled clinical pathway. This option concerns cross-document validation, correction, transmission, and exception handling.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for cross-document validation, correction, transmission, and exception handling within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 7,
    stem: "During audit trail, competency validation, data integrity, and final quality review, the magnifier conflicts with the tablet and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the magnifier alone and seek clarification only after the intervention is complete. This option concerns audit trail, competency validation, data integrity, and final quality review.",
      "Defer the concern in the magnifier to the next routine visit even though its current clinical significance has not been assessed. This option concerns audit trail, competency validation, data integrity, and final quality review.",
      "Assume the tablet is unchanged from the prior encounter and omit patient-specific reassessment during audit trail, competency validation, data integrity, and final quality review.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for audit trail, competency validation, data integrity, and final quality review within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-CA-002, CL-CA-003, CL-OA-001, CL-OA-002, CL-OA-003, CL-OA-004, CL-OA-007, CL-OA-009, CL-OA-010, CL-OA-013, CL-OA-018, CL-OA-019, CL-OA-101.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.55 be used when applying OASIS-E2 Data Collection & Coding?",
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
    stem: "What connects the tablet and magnifier into defensible RN practice for OASIS-E2 Data Collection & Coding?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of OASIS-E2 Data Collection & Coding establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in OASIS-E2 Data Collection & Coding, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Automatic authority to perform every activity discussed in OASIS-E2 Data Collection & Coding without supervision.",
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


const STORAGE_KEY = 'rn-003-progress-v6000';

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

export default function RN003() {
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
          <span className="brand-text">RN-003 — OASIS-E2</span>
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
