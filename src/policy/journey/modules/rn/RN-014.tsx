/**
 * RN-014 — Clinical Emergency Response
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
import img01 from './assets/rn-014/rn-014-lesson-01.png';
import img02 from './assets/rn-014/rn-014-lesson-02.png';
import img03 from './assets/rn-014/rn-014-lesson-03.png';
import img04 from './assets/rn-014/rn-014-lesson-04.png';
import img05 from './assets/rn-014/rn-014-lesson-05.png';
import img06 from './assets/rn-014/rn-014-lesson-06.png';
import img07 from './assets/rn-014/rn-014-lesson-07.png';

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

const MODULE_META = { id: "RN-014", title: "Clinical Emergency Response", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Scene safety and rapid primary survey, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Recognize immediate 911 emergencies, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Activate EMS and stabilize within scope, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Urgent non-911 escalation using objective SBAR, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Emergency plan, triage category, and communication continuity, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Post-event notifications, incident reporting, and care-plan updates, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Exact event timeline documentation and debrief, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Scene",
    title: "Scene safety and rapid primary survey",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for scene safety and rapid primary survey within Clinical Emergency Response. Use the current controlled requirements in CL-PR-005, QA-AE-001, RM-ER-002, OP-FM-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-PR-005, What Surveyors and Auditors Will Look For. CMS surveyors conducting an emergency preparedness survey under the Emergency Preparedness Rule (42 CFR § 484.102) will specifically verify: Evidence of a risk-based Emergency Operations Plan. The plan must be based on an all-hazards risk assessment for the agency's geographic area. Surveyors will request the EOP and verify it is current, approved by the Governing Body, and tested annually. Evidence of patient-level emergency planning. Surveyors will select a sample of active patient clinical records and verify that emergency risk categories are documented and that Category 1 and 2 patients have completed EPCPs. The absence of patient-level emergency planning is a frequently cited deficiency. Evidence that technology-dependent patients have device-specific contingency plans. Surveyors will select patients with powered medical.",
      "Controlled-policy focus — QA-AE-001, Surveyor Expectations. Surveyors will: (1) request the agency's adverse event policy and reporting forms; (2) review the Adverse Event Tracking Log for evidence of ongoing event capture; (3) verify events are investigated with documented findings; (4) verify events are integrated into the QAPI program; (5) look for trending and pattern analysis; (6) assess whether the agency responds to patterns with corrective action; (7) verify sentinel events are reported to the Governing Body..",
      "Controlled-policy focus — RM-ER-002, 5\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 1 ; Risk Manager ; Review policy requirements and confirm role-based responsibilities for RM-ER-002. ; Prior to implementation and at annual review. ; ; 2 ; Assigned Staff ; Execute incident reporting & investigation activities using approved tools, forms, and documentation standards. ; At point of care/operation and as events occur. ; ; 3 ; Compliance Officer / Designee ; Audit completion, remediate variances, and document corrective actions in the compliance log. ; Monthly and within 5 business days of identified variance. ; ACHC Survey-Defensible Operational Controls - HH2-4A: Risk Manager and safety program owners execute and monitor documented operational controls, accountable ownership.",
      "Controlled-policy focus — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis (HVA) Worksheet CARE INDEED HOME HEALTH CARE, INC. Hazard Vulnerability Analysis Worksheet Policy.",
      "Controlled-policy focus — QA-AE-001, Common Failure Points. Failure Point ; Risk ; Mitigation ; ; ; ; ; ; Adverse events documented in clinical record but not reported through the adverse event reporting system. ; Events not captured for QAPI trending; surveyor sees events in records but no investigation evidence. ; Train all staff to complete Adverse Event Report Form separately from clinical documentation. ; ; Non-punitive culture not established; staff fear reporting. ; Under-reporting; hidden safety risks. ; Reinforce non-punitive culture at orientation and annually; monitor reporting rates. ; ; Events reported but no investigation or corrective action. ; Surveyor cites failure to act on identified safety issues. ; Mandate investigation and CAP per Sections 6.3 and 6.4. ; ; Near-misses not captured..",
      "Apply the controlled requirements to the three visible objects in the scene for scene safety and rapid primary survey. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Overturned Side Table", detail: "Review the overturned side table for the patient-specific finding. Reconcile it with the clear escape path, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Clear Escape Path", detail: "Review the clear escape path for the patient-specific finding. Reconcile it with the emergency bag, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Emergency Bag", detail: "Review the emergency bag for the patient-specific finding. Reconcile it with the overturned side table, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR § 484.102" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "overturned-side-table-1-1", label: "overturned side table", shortLabel: "overturned side table", ariaLabel: "Investigate overturned side table",        x: 31, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the overturned side table as patient-specific evidence for scene safety and rapid primary survey. Compare it with the clear escape path, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For overturned side table, compare the visible evidence with clear escape path and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the overturned side table as patient-specific evidence for scene safety and rapid primary survey. Compare it with the clear escape path, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For overturned side table, compare the visible evidence with clear escape path and the controlling source before classifying status." },
          { id: "i2", label: "Treat the overturned side table as the complete assessment and do not compare the clear escape path, patient report, or current record. This identify option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for scene safety and rapid primary survey." },
          { id: "i3", label: "Carry forward the prior visit conclusion for scene safety and rapid primary survey without reassessing the patient today. This identify option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about overturned side table." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to overturned side table; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to overturned side table; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the overturned side table alone and seek clarification only after the intervention is complete. This decide option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for overturned side table is resolved." },
          { id: "d3", label: "Defer the concern in the overturned side table to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during scene safety and rapid primary survey." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For overturned side table, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For overturned side table, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the overturned side table was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of overturned side table." },
          { id: "doc3", label: "Keep the overturned side table decision in personal notes rather than the governed patient record. This document option concerns overturned side table during scene safety and rapid primary survey.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for scene safety and rapid primary survey." },
        ],
        feedback: {
          observed: "Observe the overturned side table as patient-specific evidence for scene safety and rapid primary survey. Compare it with the clear escape path, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the overturned side table as patient-specific evidence for scene safety and rapid primary survey. Compare it with the clear escape path, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For overturned side table, compare the visible evidence with clear escape path and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to overturned side table; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For overturned side table, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "clear-escape-path-1-2", label: "clear escape path", shortLabel: "clear escape path", ariaLabel: "Investigate clear escape path",        x: 31, y: 72, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the clear escape path as patient-specific evidence for scene safety and rapid primary survey. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear escape path, compare the visible evidence with emergency bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the clear escape path as patient-specific evidence for scene safety and rapid primary survey. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear escape path, compare the visible evidence with emergency bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the clear escape path establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for scene safety and rapid primary survey." },
          { id: "i3", label: "Dismiss the conflict between the clear escape path and emergency bag because one source appears more convenient. This identify option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about clear escape path." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear escape path; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear escape path; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the clear escape path without confirming an applicable order and patient-specific authority. This decide option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for clear escape path is resolved." },
          { id: "d3", label: "Hand the clear escape path concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during scene safety and rapid primary survey." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For clear escape path, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For clear escape path, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the clear escape path before reassessment confirms the patient response. This document option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clear escape path." },
          { id: "doc3", label: "Copy the prior scene safety and rapid primary survey narrative even though today’s clear escape path evidence is different. This document option concerns clear escape path during scene safety and rapid primary survey.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for scene safety and rapid primary survey." },
        ],
        feedback: {
          observed: "Observe the clear escape path as patient-specific evidence for scene safety and rapid primary survey. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the clear escape path as patient-specific evidence for scene safety and rapid primary survey. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear escape path, compare the visible evidence with emergency bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear escape path; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For clear escape path, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "emergency-bag-1-3", label: "emergency bag", shortLabel: "emergency bag", ariaLabel: "Investigate emergency bag",        x: 79, y: 62, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the emergency bag as patient-specific evidence for scene safety and rapid primary survey. Compare it with the overturned side table, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with overturned side table and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency bag as patient-specific evidence for scene safety and rapid primary survey. Compare it with the overturned side table, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with overturned side table and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the emergency bag and omit the related change, symptom, or safety cue. This identify option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for scene safety and rapid primary survey." },
          { id: "i3", label: "Let a blank, unreadable, or unverified emergency bag stand in for direct RN assessment. This identify option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the emergency bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for scene safety and rapid primary survey instead of the current controlled clinical pathway. This decide option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during scene safety and rapid primary survey." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For emergency bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For emergency bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the emergency bag and omit the discrepancy with overturned side table. This document option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency bag." },
          { id: "doc3", label: "Combine the emergency bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns emergency bag during scene safety and rapid primary survey.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for scene safety and rapid primary survey." },
        ],
        feedback: {
          observed: "Observe the emergency bag as patient-specific evidence for scene safety and rapid primary survey. Compare it with the overturned side table, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency bag as patient-specific evidence for scene safety and rapid primary survey. Compare it with the overturned side table, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for scene safety and rapid primary survey, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with overturned side table and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for scene safety and rapid primary survey. For emergency bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Recogni",
    title: "Recognize immediate 911 emergencies",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for recognize immediate 911 emergencies within Clinical Emergency Response. Use the current controlled requirements in RM-ER-002, CL-PR-005, QA-AE-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — RM-ER-002, Immediate Response. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.1.1 ; Reporting Staff Member ; Ensure immediate safety of all persons involved. Provide first aid or emergency medical care as needed. Call 911 if life-threatening emergency exists. ; Immediately upon incident occurrence. ; ; 5.1.2 ; Reporting Staff Member ; Notify the immediate supervisor verbally of the incident. ; Within 1 hour of incident occurrence. ; ; 5.1.3 ; Supervisor ; For sentinel events or serious adverse events: Notify the Risk Manager, Director of Nursing, and Administrator immediately by phone. ; Within 1 hour of notification. ; ; 5.1.4 ; Director of Nursing ; For patient-related incidents: Assess the patient's current condition.",
      "Controlled-policy focus — CL-PR-005, Clinical Emergency Response Protocol — Activation and Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Administrator / Director of Nursing ; When an emergency event occurs that disrupts or threatens the agency's ability to deliver normal scheduled services — whether or not a formal government declaration has been issued — the Administrator or Director of Nursing shall activate the Clinical Emergency Response Protocol immediately. Activation shall be documented in the Emergency Operations Log (Appendix B) with the date, time, nature of the event, and the name of the activating authority. ; Immediately upon identification of an event requiring activation. ; ; 6.4.2 ; Director of Nursing ; Within 1 hour of activation, generate the current Patient.",
      "Controlled-policy focus — QA-AE-001, 12\\. Appendices. Appendix A: Adverse Event Report Form Care Indeed Home Health Care, Inc. CONFIDENTIAL — Adverse Event Report Form Policy Reference: QA-AE-001 ; Version: 6.0 DO NOT FILE IN THE PATIENT'S CLINICAL RECORD. Submit to Director of Nursing within 24 hours of event. SECTION 1 — EVENT IDENTIFICATION ; Field ; Response ; ; ; ; ; Patient Name: ; ; ; Patient ID / MR#: ; ; ; Date of Event: ; ; ; Time of Event: ; ; ; Location of Event: ; ☐ Patient Home ☐ Community ☐ Other: _____________ ; ; Date Discovered (if different from event date): ; ; ; Reporting Staff Member Name: ; ; ; Reporting Staff Member Title.",
      "Controlled-policy focus — CL-PR-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; A Category 1 patient cannot be reached within 12 hours and all emergency contacts are exhausted ; Director of Nursing immediately; 911 if immediate danger suspected ; Dispatch an in-person welfare check or contact local fire/police for a welfare check. Document all contact attempts. Physician notification. Incident report per RM-ER-002. ; Immediately upon identification. ; ; A technology-dependent patient's powered equipment has failed during the emergency ; Assigned RN contacts DME vendor emergency line and physician simultaneously ; DME vendor dispatches emergency repair or replacement equipment. If patient is in immediate clinical distress, call 911. Document all actions. ; Immediately..",
      "Controlled-policy focus — QA-AE-001, Reporting Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Staff Member ; Immediately ensure patient safety — provide or arrange for any necessary emergency care. ; Immediately upon discovery. ; ; 6.2.2 ; Discovering Staff Member ; Notify the patient's physician of any adverse event that has the potential to affect the patient's plan of care or clinical status. Document the notification in the clinical record. ; Within 1 hour of discovery for Level 3–5 events; within 4 hours for Level 1–2 events or by end of the visit. ; ; 6.2.3 ; Discovering Staff Member ; Notify the clinical supervisor / Director of Nursing verbally. ; Within 1.",
      "Apply the controlled requirements to the three visible objects in the scene for recognize immediate 911 emergencies. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Cordless Phone", detail: "Review the cordless phone for the patient-specific finding. Reconcile it with the emergency bag, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Emergency Bag", detail: "Review the emergency bag for the patient-specific finding. Reconcile it with the clear address card turned -side outward, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Clear Address Card Turned -side Outward", detail: "Review the clear address card turned -side outward for the patient-specific finding. Reconcile it with the cordless phone, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.102(a)" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "cordless-phone-2-1", label: "cordless phone", shortLabel: "cordless phone", ariaLabel: "Investigate cordless phone",        x: 14, y: 55, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the cordless phone as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cordless phone, compare the visible evidence with emergency bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the cordless phone as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cordless phone, compare the visible evidence with emergency bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the cordless phone establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize immediate 911 emergencies." },
          { id: "i3", label: "Dismiss the conflict between the cordless phone and emergency bag because one source appears more convenient. This identify option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about cordless phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cordless phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cordless phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the cordless phone without confirming an applicable order and patient-specific authority. This decide option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for cordless phone is resolved." },
          { id: "d3", label: "Hand the cordless phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize immediate 911 emergencies." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For cordless phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For cordless phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the cordless phone before reassessment confirms the patient response. This document option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of cordless phone." },
          { id: "doc3", label: "Copy the prior recognize immediate 911 emergencies narrative even though today’s cordless phone evidence is different. This document option concerns cordless phone during recognize immediate 911 emergencies.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize immediate 911 emergencies." },
        ],
        feedback: {
          observed: "Observe the cordless phone as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the cordless phone as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For cordless phone, compare the visible evidence with emergency bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to cordless phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For cordless phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "emergency-bag-2-2", label: "emergency bag", shortLabel: "emergency bag", ariaLabel: "Investigate emergency bag",        x: 36, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the emergency bag as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the clear address card turned -side outward, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear address card turned -side outward and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency bag as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the clear address card turned -side outward, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear address card turned -side outward and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the emergency bag and omit the related change, symptom, or safety cue. This identify option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize immediate 911 emergencies." },
          { id: "i3", label: "Let a blank, unreadable, or unverified emergency bag stand in for direct RN assessment. This identify option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the emergency bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for recognize immediate 911 emergencies instead of the current controlled clinical pathway. This decide option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize immediate 911 emergencies." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For emergency bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For emergency bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the emergency bag and omit the discrepancy with clear address card turned -side outward. This document option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency bag." },
          { id: "doc3", label: "Combine the emergency bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns emergency bag during recognize immediate 911 emergencies.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize immediate 911 emergencies." },
        ],
        feedback: {
          observed: "Observe the emergency bag as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the clear address card turned -side outward, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency bag as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the clear address card turned -side outward, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear address card turned -side outward and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For emergency bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "clear-address-card-turned-side-outward-2-3", label: "clear address card turned -side outward", shortLabel: "clear address card turned", ariaLabel: "Investigate clear address card turned -side outward",        x: 86, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the clear address card turned -side outward as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the cordless phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear address card turned -side outward, compare the visible evidence with cordless phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the clear address card turned -side outward as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the cordless phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear address card turned -side outward, compare the visible evidence with cordless phone and the controlling source before classifying status." },
          { id: "i2", label: "Treat the clear address card turned -side outward as the complete assessment and do not compare the cordless phone, patient report, or current record. This identify option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for recognize immediate 911 emergencies." },
          { id: "i3", label: "Carry forward the prior visit conclusion for recognize immediate 911 emergencies without reassessing the patient today. This identify option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about clear address card turned -side outward." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear address card turned -side outward; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear address card turned -side outward; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the clear address card turned -side outward alone and seek clarification only after the intervention is complete. This decide option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for clear address card turned -side outward is resolved." },
          { id: "d3", label: "Defer the concern in the clear address card turned -side outward to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during recognize immediate 911 emergencies." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For clear address card turned -side outward, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For clear address card turned -side outward, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the clear address card turned -side outward was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clear address card turned -side outward." },
          { id: "doc3", label: "Keep the clear address card turned -side outward decision in personal notes rather than the governed patient record. This document option concerns clear address card turned -side outward during recognize immediate 911 emergencies.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for recognize immediate 911 emergencies." },
        ],
        feedback: {
          observed: "Observe the clear address card turned -side outward as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the cordless phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the clear address card turned -side outward as patient-specific evidence for recognize immediate 911 emergencies. Compare it with the cordless phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for recognize immediate 911 emergencies, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear address card turned -side outward, compare the visible evidence with cordless phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear address card turned -side outward; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for recognize immediate 911 emergencies. For clear address card turned -side outward, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Activat",
    title: "Activate EMS and stabilize within scope",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for activate ems and stabilize within scope within Clinical Emergency Response. Use the current controlled requirements in OP-FM-005, CL-PR-005, QA-AE-001, RM-ER-002, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — OP-FM-005, Emergency Activation and Response. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.3.1 ; Any Staff Member / Incident Commander ; Activate the Emergency Preparedness Plan when any of the following occurs: (a) a federal, state, or local emergency is declared affecting the agency's service area; (b) an event occurs that threatens the immediate safety of patients or staff; (c) the agency's ability to deliver essential services is disrupted; (d) the agency office becomes inaccessible or uninhabitable; (e) the IT/EHR system is down for more than 4 hours; (f) a public health emergency is declared (also activates OP-SL-006). ; Immediately upon triggering event. ; ; 5.3.2 ; Incident Commander ; Upon activation: (a) assess the.",
      "Controlled-policy focus — CL-PR-005, Clinical Emergency Response Protocol — Activation and Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Administrator / Director of Nursing ; When an emergency event occurs that disrupts or threatens the agency's ability to deliver normal scheduled services — whether or not a formal government declaration has been issued — the Administrator or Director of Nursing shall activate the Clinical Emergency Response Protocol immediately. Activation shall be documented in the Emergency Operations Log (Appendix B) with the date, time, nature of the event, and the name of the activating authority. ; Immediately upon identification of an event requiring activation. ; ; 6.4.2 ; Director of Nursing ; Within 1 hour of activation, generate the current Patient.",
      "Controlled-policy focus — CL-PR-005, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Patient Emergency Risk Category ; Risk category, rationale, and date of assessment ; Assigned RN ; EHR — assessment module ; At SOC and each RECERT; updated as category changes; retained 7 years ; ; Patient Emergency Risk Registry ; Master list of all active patients with risk categories and EPCP status ; Director of Nursing ; EHR — secure administrative module; accessible offline backup ; Updated weekly; retained 7 years ; ; Emergency Preparedness Care Plan ; Individualized EPCP per Appendix A ; Assigned RN ; EHR — plan of care (Folder 06) ; Category 1: within.",
      "Controlled-policy focus — QA-AE-001, 12\\. Appendices. Appendix A: Adverse Event Report Form Care Indeed Home Health Care, Inc. CONFIDENTIAL — Adverse Event Report Form Policy Reference: QA-AE-001 ; Version: 6.0 DO NOT FILE IN THE PATIENT'S CLINICAL RECORD. Submit to Director of Nursing within 24 hours of event. SECTION 1 — EVENT IDENTIFICATION ; Field ; Response ; ; ; ; ; Patient Name: ; ; ; Patient ID / MR#: ; ; ; Date of Event: ; ; ; Time of Event: ; ; ; Location of Event: ; ☐ Patient Home ☐ Community ☐ Other: _____________ ; ; Date Discovered (if different from event date): ; ; ; Reporting Staff Member Name: ; ; ; Reporting Staff Member Title.",
      "Controlled-policy focus — RM-ER-002, Investigation Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.4.1 ; Risk Manager ; For Level 3–5 incidents, initiate a formal investigation. Preserve all relevant evidence including: (a) clinical records; (b) staff schedules; (c) equipment involved; (d) photographs (if applicable); (e) witness statements; (f) electronic system logs. ; Investigation initiated within 24 hours for Level 4–5; within 72 hours for Level 3. ; ; 5.4.2 ; Risk Manager ; Interview all involved parties and witnesses. Document interviews using the Witness Statement Form (Appendix D). Interviews shall be conducted individually in a private setting. ; Within 7 calendar days of incident for Level 3; within 48 hours for Level 4–5. ; ; 5.4.3.",
      "Apply the controlled requirements to the three visible objects in the scene for activate ems and stabilize within scope. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the pulse oximeter, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter", detail: "Review the pulse oximeter for the patient-specific finding. Reconcile it with the emergency phone, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Emergency Phone", detail: "Review the emergency phone for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR § 484.102(a)" },
      { kind: "External Authority", text: "42 CFR § 484.102(b)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "stethoscope-3-1", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the stethoscope as patient-specific evidence for activate ems and stabilize within scope. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for activate ems and stabilize within scope. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the stethoscope and omit the related change, symptom, or safety cue. This identify option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for activate ems and stabilize within scope." },
          { id: "i3", label: "Let a blank, unreadable, or unverified stethoscope stand in for direct RN assessment. This identify option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for activate ems and stabilize within scope instead of the current controlled clinical pathway. This decide option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during activate ems and stabilize within scope." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the stethoscope and omit the discrepancy with pulse oximeter. This document option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Combine the stethoscope issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns stethoscope during activate ems and stabilize within scope.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for activate ems and stabilize within scope." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for activate ems and stabilize within scope. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for activate ems and stabilize within scope. Compare it with the pulse oximeter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with pulse oximeter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "pulse-oximeter-3-2", label: "pulse oximeter", shortLabel: "pulse oximeter", ariaLabel: "Investigate pulse oximeter",        x: 59, y: 77, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the pulse oximeter as patient-specific evidence for activate ems and stabilize within scope. Compare it with the emergency phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with emergency phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter as patient-specific evidence for activate ems and stabilize within scope. Compare it with the emergency phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with emergency phone and the controlling source before classifying status." },
          { id: "i2", label: "Treat the pulse oximeter as the complete assessment and do not compare the emergency phone, patient report, or current record. This identify option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for activate ems and stabilize within scope." },
          { id: "i3", label: "Carry forward the prior visit conclusion for activate ems and stabilize within scope without reassessing the patient today. This identify option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the pulse oximeter alone and seek clarification only after the intervention is complete. This decide option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter is resolved." },
          { id: "d3", label: "Defer the concern in the pulse oximeter to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during activate ems and stabilize within scope." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For pulse oximeter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the pulse oximeter was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter." },
          { id: "doc3", label: "Keep the pulse oximeter decision in personal notes rather than the governed patient record. This document option concerns pulse oximeter during activate ems and stabilize within scope.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for activate ems and stabilize within scope." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter as patient-specific evidence for activate ems and stabilize within scope. Compare it with the emergency phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter as patient-specific evidence for activate ems and stabilize within scope. Compare it with the emergency phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter, compare the visible evidence with emergency phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For pulse oximeter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "emergency-phone-3-3", label: "emergency phone", shortLabel: "emergency phone", ariaLabel: "Investigate emergency phone",        x: 81, y: 38, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the emergency phone as patient-specific evidence for activate ems and stabilize within scope. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency phone, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency phone as patient-specific evidence for activate ems and stabilize within scope. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency phone, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Assume the emergency phone establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for activate ems and stabilize within scope." },
          { id: "i3", label: "Dismiss the conflict between the emergency phone and stethoscope because one source appears more convenient. This identify option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the emergency phone without confirming an applicable order and patient-specific authority. This decide option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency phone is resolved." },
          { id: "d3", label: "Hand the emergency phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during activate ems and stabilize within scope." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For emergency phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For emergency phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the emergency phone before reassessment confirms the patient response. This document option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency phone." },
          { id: "doc3", label: "Copy the prior activate ems and stabilize within scope narrative even though today’s emergency phone evidence is different. This document option concerns emergency phone during activate ems and stabilize within scope.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for activate ems and stabilize within scope." },
        ],
        feedback: {
          observed: "Observe the emergency phone as patient-specific evidence for activate ems and stabilize within scope. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency phone as patient-specific evidence for activate ems and stabilize within scope. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for activate ems and stabilize within scope, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency phone, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for activate ems and stabilize within scope. For emergency phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Urgent",
    title: "Urgent non-911 escalation using objective SBAR",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for urgent non-911 escalation using objective sbar within Clinical Emergency Response. Use the current controlled requirements in QA-AE-001, CL-PR-005, OP-FM-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — QA-AE-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Sentinel event occurs. ; DON notifies Administrator, QAPI Coordinator, and Risk Manager immediately. ; RCA per QA-AE-002; Governing Body notified within 72 hours; external reporting per Section 6.5. ; Immediate. ; ; Staff member fails to report a known adverse event. ; Supervisor notifies DON and QAPI Coordinator. ; DON investigates and determines whether failure was intentional or due to knowledge gap. If intentional, disciplinary action per HR-ER-002. If knowledge gap, targeted training within 7 calendar days. ; Within 14 calendar days of discovery. ; ; Adverse event reporting rate drops significantly (>30% decline from prior quarter). ; QAPI Coordinator flags at.",
      "Controlled-policy focus — CL-PR-005, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; A Category 1 patient cannot be reached within 12 hours and all emergency contacts are exhausted ; Director of Nursing immediately; 911 if immediate danger suspected ; Dispatch an in-person welfare check or contact local fire/police for a welfare check. Document all contact attempts. Physician notification. Incident report per RM-ER-002. ; Immediately upon identification. ; ; A technology-dependent patient's powered equipment has failed during the emergency ; Assigned RN contacts DME vendor emergency line and physician simultaneously ; DME vendor dispatches emergency repair or replacement equipment. If patient is in immediate clinical distress, call 911. Document all actions. ; Immediately..",
      "Controlled-policy focus — OP-FM-005, Business Continuity. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.4.1 ; Incident Commander / EMT ; During LEVEL 2 and 3 emergencies, implement the Business Continuity Plan. Essential functions and their Recovery Time Objectives: ; Immediately upon activation. ; Essential Functions and Recovery Time Objectives: ; Essential Function ; RTO ; Continuity Strategy ; Responsible Party ; ; ; ; ; ; ; Patient care for Priority 1 patients ; 0 hours (no interruption) ; Pre-identified backup clinicians; geographic reassignment; partner agency agreements ; Clinical Operations Lead ; ; Patient care for Priority 2 patients ; 24 hours ; Prioritized scheduling; telehealth if available ; Clinical Operations Lead ; ; On-call /.",
      "Controlled-policy focus — OP-FM-005, Training and Testing. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.6.1 ; Operations Director / HR Director ; Provide emergency preparedness training to all new staff within 14 calendar days of hire and to all staff annually per HR-TD-005. Training shall cover: (a) the agency's EPP and activation procedures; (b) individual roles and responsibilities; (c) communication procedures; (d) patient triage and prioritization; (e) evacuation/shelter procedures (if applicable); (f) EHR downtime procedures; (g) location of emergency supplies and reference materials. ; At hire; annually. ; ; 5.6.2 ; Operations Director ; Conduct at least 2 emergency preparedness exercises per year per RM-EP-002: (a) Exercise 1: Community-based (if available in the area) or facility-based tabletop.",
      "Controlled-policy focus — QA-AE-001, Adverse Event Classification and Reportable Events. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; QAPI Coordinator ; Maintain a written Adverse Event Classification Guide that defines the agency's adverse event categories, severity levels, and reporting requirements. The guide must be accessible to all staff and included in orientation training. ; At policy effective date; reviewed annually. ; ; 6.1.2 ; All Staff ; Report the following categories of events using the Adverse Event Report Form (Appendix A): (a) Patient falls (with or without injury); (b) Medication errors (wrong drug, wrong dose, wrong route, wrong time, omission); (c) Adverse drug reactions; (d) Hospital admissions/emergency department visits during an active episode; (e) Infections acquired during the episode.",
      "Apply the controlled requirements to the three visible objects in the scene for urgent non-911 escalation using objective sbar. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Walker On Side", detail: "Review the walker on side for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the folded blanket, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Folded Blanket", detail: "Review the folded blanket for the patient-specific finding. Reconcile it with the walker on side, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR § 484.102(b)" },
      { kind: "External Authority", text: "42 CFR § 484.102(c)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "walker-on-side-4-1", label: "walker on side", shortLabel: "walker on side", ariaLabel: "Investigate walker on side",        x: 14, y: 39, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the walker on side as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker on side, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the walker on side as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker on side, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Treat the walker on side as the complete assessment and do not compare the phone, patient report, or current record. This identify option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for urgent non-911 escalation using objective sbar." },
          { id: "i3", label: "Carry forward the prior visit conclusion for urgent non-911 escalation using objective sbar without reassessing the patient today. This identify option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about walker on side." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker on side; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker on side; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the walker on side alone and seek clarification only after the intervention is complete. This decide option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for walker on side is resolved." },
          { id: "d3", label: "Defer the concern in the walker on side to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during urgent non-911 escalation using objective sbar." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For walker on side, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For walker on side, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the walker on side was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of walker on side." },
          { id: "doc3", label: "Keep the walker on side decision in personal notes rather than the governed patient record. This document option concerns walker on side during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for urgent non-911 escalation using objective sbar." },
        ],
        feedback: {
          observed: "Observe the walker on side as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the walker on side as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For walker on side, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to walker on side; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For walker on side, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "phone-4-2", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 34, y: 45, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the phone as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the folded blanket, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with folded blanket and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the folded blanket, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with folded blanket and the controlling source before classifying status." },
          { id: "i2", label: "Assume the phone establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for urgent non-911 escalation using objective sbar." },
          { id: "i3", label: "Dismiss the conflict between the phone and folded blanket because one source appears more convenient. This identify option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the phone without confirming an applicable order and patient-specific authority. This decide option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Hand the phone concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during urgent non-911 escalation using objective sbar." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the phone before reassessment confirms the patient response. This document option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Copy the prior urgent non-911 escalation using objective sbar narrative even though today’s phone evidence is different. This document option concerns phone during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for urgent non-911 escalation using objective sbar." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the folded blanket, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the folded blanket, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with folded blanket and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "folded-blanket-4-3", label: "folded blanket", shortLabel: "folded blanket", ariaLabel: "Investigate folded blanket",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the folded blanket as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the walker on side, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded blanket, compare the visible evidence with walker on side and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the folded blanket as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the walker on side, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded blanket, compare the visible evidence with walker on side and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the folded blanket and omit the related change, symptom, or safety cue. This identify option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for urgent non-911 escalation using objective sbar." },
          { id: "i3", label: "Let a blank, unreadable, or unverified folded blanket stand in for direct RN assessment. This identify option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about folded blanket." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded blanket; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded blanket; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the folded blanket issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for folded blanket is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for urgent non-911 escalation using objective sbar instead of the current controlled clinical pathway. This decide option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during urgent non-911 escalation using objective sbar." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For folded blanket, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For folded blanket, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the folded blanket and omit the discrepancy with walker on side. This document option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of folded blanket." },
          { id: "doc3", label: "Combine the folded blanket issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns folded blanket during urgent non-911 escalation using objective sbar.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for urgent non-911 escalation using objective sbar." },
        ],
        feedback: {
          observed: "Observe the folded blanket as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the walker on side, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the folded blanket as patient-specific evidence for urgent non-911 escalation using objective sbar. Compare it with the walker on side, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for urgent non-911 escalation using objective sbar, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded blanket, compare the visible evidence with walker on side and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded blanket; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for urgent non-911 escalation using objective sbar. For folded blanket, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Emergen",
    title: "Emergency plan, triage category, and communication continuity",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for emergency plan, triage category, and communication continuity within Clinical Emergency Response. Use the current controlled requirements in CL-PR-005, OP-FM-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-PR-005, Clinical Emergency Response Protocol — Activation and Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Administrator / Director of Nursing ; When an emergency event occurs that disrupts or threatens the agency's ability to deliver normal scheduled services — whether or not a formal government declaration has been issued — the Administrator or Director of Nursing shall activate the Clinical Emergency Response Protocol immediately. Activation shall be documented in the Emergency Operations Log (Appendix B) with the date, time, nature of the event, and the name of the activating authority. ; Immediately upon identification of an event requiring activation. ; ; 6.4.2 ; Director of Nursing ; Within 1 hour of activation, generate the current Patient.",
      "Controlled-policy focus — CL-PR-005, Technology-Dependent Patient Emergency Planning. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned RN ; For every technology-dependent patient, develop a Technology Failure Contingency Plan as part of the EPCP within 24 hours of the SOC. The plan shall address each powered device the patient uses and shall specify: (a) the clinical consequence of loss of the device; (b) the maximum safe duration the patient can tolerate device failure before clinical deterioration; (c) the backup equipment available in the home (battery backup units, manual alternatives); (d) the emergency actions the patient and caregiver should take if the device fails; (e) the sequence of emergency contacts — agency on-call, equipment vendor emergency line, physician.",
      "Controlled-policy focus — OP-FM-005, 11\\. Version Control. 11.1 This policy is maintained under the agency's enterprise policy lifecycle management system per EN-LC-001. 11.2 Only the most current approved version is valid. Superseded versions must be archived and marked \"SUPERSEDED — NOT FOR USE.\" 11.3 Substantive revisions require: (a) Emergency Management Team review; (b) Administrator recommendation; (c) Governing Body approval documented in meeting minutes; (d) re-acknowledgment by all personnel within scope within 14 calendar days; (e) update to the enterprise policy index per EN-TG-001. 11.4 Non-substantive revisions may be approved by the Operations Director with notification to the Administrator and documentation at the next Governing Body meeting. Appendix A — Hazard Vulnerability Analysis (HVA) Worksheet CARE INDEED HOME HEALTH CARE, INC. Hazard Vulnerability Analysis Worksheet Policy.",
      "Controlled-policy focus — CL-PR-005, Patient Emergency Risk Stratification — Ongoing Maintenance. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; At every SOC assessment, assess the patient's emergency risk level by evaluating all factors in Section 5 — technology dependence, social isolation, medication criticality (refrigeration requirements, infusion medications, injectable medications), mobility and evacuation capability, cognitive impairment affecting self-care decisions, proximity to high-hazard geographic zones (flood plain, wildfire zone, hurricane zone), and caregiver emergency capacity. Assign the patient to Category 1, 2, 3, or 4 and document the assignment and its rationale in the clinical record. ; At the SOC assessment; documented within 24 hours. ; ; 6.1.2 ; Assigned RN ; At each recertification assessment, reassess and update.",
      "Controlled-policy focus — OP-FM-005, Emergency Communication Plan. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.5.1 ; Operations Director ; Maintain the following emergency contact lists, updated at least quarterly: (a) All staff — home phone, cell phone, email, home address; (b) All active patients — phone, emergency contact, address, priority level; (c) EMT members — all contact methods; (d) Key external contacts — local emergency management, fire department, police, hospital emergency departments, CMS Regional Office, California HCAI, MAC, utility companies, vendor emergency contacts. ; Updated quarterly; after any personnel/patient change. ; ; 5.5.2 ; Communications Lead ; During activation, communicate with patients per RM-EP-003 using the following priority: (1) Priority 1 patients — direct phone call within.",
      "Apply the controlled requirements to the three visible objects in the scene for emergency plan, triage category, and communication continuity. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Emergency Bag", detail: "Review the emergency bag for the patient-specific finding. Reconcile it with the clear doorway, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Clear Doorway", detail: "Review the clear doorway for the patient-specific finding. Reconcile it with the folded medication pouch, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Folded Medication Pouch", detail: "Review the folded medication pouch for the patient-specific finding. Reconcile it with the emergency bag, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR § 484.102(c)" },
      { kind: "External Authority", text: "42 CFR § 484.102(d)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "emergency-bag-5-1", label: "emergency bag", shortLabel: "emergency bag", ariaLabel: "Investigate emergency bag",        x: 21, y: 44, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the emergency bag as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the clear doorway, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear doorway and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency bag as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the clear doorway, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear doorway and the controlling source before classifying status." },
          { id: "i2", label: "Assume the emergency bag establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for emergency plan, triage category, and communication continuity." },
          { id: "i3", label: "Dismiss the conflict between the emergency bag and clear doorway because one source appears more convenient. This identify option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the emergency bag without confirming an applicable order and patient-specific authority. This decide option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency bag is resolved." },
          { id: "d3", label: "Hand the emergency bag concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during emergency plan, triage category, and communication continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For emergency bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For emergency bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the emergency bag before reassessment confirms the patient response. This document option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency bag." },
          { id: "doc3", label: "Copy the prior emergency plan, triage category, and communication continuity narrative even though today’s emergency bag evidence is different. This document option concerns emergency bag during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for emergency plan, triage category, and communication continuity." },
        ],
        feedback: {
          observed: "Observe the emergency bag as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the clear doorway, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency bag as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the clear doorway, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with clear doorway and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For emergency bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "clear-doorway-5-2", label: "clear doorway", shortLabel: "clear doorway", ariaLabel: "Investigate clear doorway",        x: 45, y: 70, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the clear doorway as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the folded medication pouch, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear doorway, compare the visible evidence with folded medication pouch and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the clear doorway as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the folded medication pouch, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear doorway, compare the visible evidence with folded medication pouch and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the clear doorway and omit the related change, symptom, or safety cue. This identify option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for emergency plan, triage category, and communication continuity." },
          { id: "i3", label: "Let a blank, unreadable, or unverified clear doorway stand in for direct RN assessment. This identify option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about clear doorway." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear doorway; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear doorway; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the clear doorway issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for clear doorway is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for emergency plan, triage category, and communication continuity instead of the current controlled clinical pathway. This decide option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during emergency plan, triage category, and communication continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For clear doorway, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For clear doorway, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the clear doorway and omit the discrepancy with folded medication pouch. This document option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clear doorway." },
          { id: "doc3", label: "Combine the clear doorway issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns clear doorway during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for emergency plan, triage category, and communication continuity." },
        ],
        feedback: {
          observed: "Observe the clear doorway as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the folded medication pouch, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the clear doorway as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the folded medication pouch, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For clear doorway, compare the visible evidence with folded medication pouch and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to clear doorway; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For clear doorway, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "folded-medication-pouch-5-3", label: "folded medication pouch", shortLabel: "folded medication pouch", ariaLabel: "Investigate folded medication pouch",        x: 81, y: 38, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the folded medication pouch as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded medication pouch, compare the visible evidence with emergency bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the folded medication pouch as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded medication pouch, compare the visible evidence with emergency bag and the controlling source before classifying status." },
          { id: "i2", label: "Treat the folded medication pouch as the complete assessment and do not compare the emergency bag, patient report, or current record. This identify option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for emergency plan, triage category, and communication continuity." },
          { id: "i3", label: "Carry forward the prior visit conclusion for emergency plan, triage category, and communication continuity without reassessing the patient today. This identify option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about folded medication pouch." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded medication pouch; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded medication pouch; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the folded medication pouch alone and seek clarification only after the intervention is complete. This decide option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for folded medication pouch is resolved." },
          { id: "d3", label: "Defer the concern in the folded medication pouch to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during emergency plan, triage category, and communication continuity." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For folded medication pouch, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For folded medication pouch, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the folded medication pouch was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of folded medication pouch." },
          { id: "doc3", label: "Keep the folded medication pouch decision in personal notes rather than the governed patient record. This document option concerns folded medication pouch during emergency plan, triage category, and communication continuity.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for emergency plan, triage category, and communication continuity." },
        ],
        feedback: {
          observed: "Observe the folded medication pouch as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the folded medication pouch as patient-specific evidence for emergency plan, triage category, and communication continuity. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for emergency plan, triage category, and communication continuity, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For folded medication pouch, compare the visible evidence with emergency bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to folded medication pouch; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for emergency plan, triage category, and communication continuity. For folded medication pouch, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Post-ev",
    title: "Post-event notifications, incident reporting, and care-plan updates",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for post-event notifications, incident reporting, and care-plan updates within Clinical Emergency Response. Use the current controlled requirements in RM-ER-002, QA-AE-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — RM-ER-002, Incident Report Completion. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 5.2.1 ; Reporting Staff Member ; Complete the Incident Report Form (Appendix A) documenting: (a) date, time, and location of incident; (b) persons involved (patient, staff, visitor); (c) factual description of what occurred (objective, non-judgmental language); (d) witnesses; (e) immediate actions taken; (f) injuries or harm observed; (g) equipment involved (if applicable); (h) environmental conditions. ; Within 24 hours of incident occurrence. ; ; 5.2.2 ; Reporting Staff Member ; Submit the completed Incident Report to the immediate supervisor for review. ; Concurrent with completion (within 24 hours). ; ; 5.2.3 ; Supervisor ; Review the Incident Report for completeness and accuracy. Obtain.",
      "Controlled-policy focus — RM-ER-002, 10\\. Version Control. Per RM-ER-001 §10. Only the most current approved version is valid. Appendix A — Incident Report Form Care Indeed Home Health Care, Inc. Policy Reference: RM-ER-002 ; Version: 6.0 ; Date: 2025-07-10 ⚠ CONFIDENTIAL RISK MANAGEMENT DOCUMENT — DO NOT FILE IN PATIENT CLINICAL RECORD SECTION 1 — INCIDENT INFORMATION ; Field ; Entry ; ; ; ; ; Incident ID (assigned by Risk Manager) ; IR-________-_______ ; ; Date of Incident ; //________ ; ; Time of Incident ; : ☐ AM ☐ PM ; ; Location ; ☐ Patient Home ☐ Agency Office ☐ In Transit ☐ Other: ____________ ; ; Address/Location Detail ; ________________________________________________________________ ; SECTION 2 — PERSONS INVOLVED Patient (if applicable): ; Field.",
      "Controlled-policy focus — QA-AE-001, External Reporting. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Administrator / Compliance Officer ; Comply with all applicable California state mandatory reporting requirements. Determine whether the event requires reporting to: (a) California Department of Public Health (CDPH); (b) Adult Protective Services / Child Protective Services (for suspected abuse/neglect per CL-PR-006); (c) CMS (if the event triggers a reporting obligation under CoP); (d) law enforcement (if criminal activity suspected); (e) the patient's physician (per Section 6.2.2). Document all external reports made. ; Per applicable regulatory timeframes; typically within 24–72 hours depending on reporting requirement. ; ; 6.5.2 ; Compliance Officer ; Maintain a log of all external adverse event reports submitted.",
      "Controlled-policy focus — RM-ER-002, 7\\. Compliance Monitoring and Measurement. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Incident reports completed within 24 hours ; Audit of report timestamps vs. incident time ; ≥95% compliance. ; ; All incidents logged in tracking system within 72 hours ; Audit of Incident Tracking Log dates ; 100% compliance. ; ; All Level 4–5 incidents investigated with RCA ; Review of investigation reports ; 100% completion within 30 days. ; ; Mandatory external reports filed within required timeframes ; Audit of filing dates vs. regulatory deadlines ; 100% compliance. ; ; Corrective actions implemented per plan ; Review of implementation evidence ; ≥90% on-time completion. ; ; Quarterly trending reports completed ; Review of report.",
      "Controlled-policy focus — QA-AE-001, Non-Punitive Reporting Culture. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.6.1 ; Administrator / QAPI Coordinator ; Communicate to all staff — during orientation, annual training, and in policy acknowledgment — that adverse event reporting is non-punitive. Staff who report in good faith shall not be subject to retaliation or discipline for the act of reporting, per CO-CP-005. ; Ongoing; reinforced annually. ; ; 6.6.2 ; Administrator ; Ensure that disciplinary action related to an adverse event is directed at the underlying conduct (e.g., willful deviation from protocol, impairment, falsification), not at the act of reporting. Document this distinction in any disciplinary action. ; Ongoing..",
      "Apply the controlled requirements to the three visible objects in the scene for post-event notifications, incident reporting, and care-plan updates. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Emergency Bag", detail: "Review the emergency bag for the patient-specific finding. Reconcile it with the medication pouch, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Medication Pouch", detail: "Review the medication pouch for the patient-specific finding. Reconcile it with the stethoscope, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Stethoscope", detail: "Review the stethoscope for the patient-specific finding. Reconcile it with the emergency bag, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "42 CFR § 484.102(d)" },
      { kind: "External Authority", text: "45 CFR § 164.510(b)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "emergency-bag-6-1", label: "emergency bag", shortLabel: "emergency bag", ariaLabel: "Investigate emergency bag",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the emergency bag as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the medication pouch, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with medication pouch and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency bag as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the medication pouch, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with medication pouch and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the emergency bag and omit the related change, symptom, or safety cue. This identify option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for post-event notifications, incident reporting, and care-plan updates." },
          { id: "i3", label: "Let a blank, unreadable, or unverified emergency bag stand in for direct RN assessment. This identify option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the emergency bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for post-event notifications, incident reporting, and care-plan updates instead of the current controlled clinical pathway. This decide option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during post-event notifications, incident reporting, and care-plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For emergency bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For emergency bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the emergency bag and omit the discrepancy with medication pouch. This document option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency bag." },
          { id: "doc3", label: "Combine the emergency bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns emergency bag during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-event notifications, incident reporting, and care-plan updates." },
        ],
        feedback: {
          observed: "Observe the emergency bag as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the medication pouch, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency bag as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the medication pouch, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with medication pouch and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For emergency bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "medication-pouch-6-2", label: "medication pouch", shortLabel: "medication pouch", ariaLabel: "Investigate medication pouch",        x: 40, y: 42, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the medication pouch as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication pouch, compare the visible evidence with stethoscope and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the medication pouch as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication pouch, compare the visible evidence with stethoscope and the controlling source before classifying status." },
          { id: "i2", label: "Treat the medication pouch as the complete assessment and do not compare the stethoscope, patient report, or current record. This identify option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for post-event notifications, incident reporting, and care-plan updates." },
          { id: "i3", label: "Carry forward the prior visit conclusion for post-event notifications, incident reporting, and care-plan updates without reassessing the patient today. This identify option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about medication pouch." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication pouch; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication pouch; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the medication pouch alone and seek clarification only after the intervention is complete. This decide option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for medication pouch is resolved." },
          { id: "d3", label: "Defer the concern in the medication pouch to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during post-event notifications, incident reporting, and care-plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For medication pouch, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For medication pouch, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the medication pouch was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of medication pouch." },
          { id: "doc3", label: "Keep the medication pouch decision in personal notes rather than the governed patient record. This document option concerns medication pouch during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-event notifications, incident reporting, and care-plan updates." },
        ],
        feedback: {
          observed: "Observe the medication pouch as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the medication pouch as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the stethoscope, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For medication pouch, compare the visible evidence with stethoscope and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to medication pouch; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For medication pouch, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "stethoscope-6-3", label: "stethoscope", shortLabel: "stethoscope", ariaLabel: "Investigate stethoscope",        x: 83, y: 56, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the stethoscope as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with emergency bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the stethoscope as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with emergency bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the stethoscope establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for post-event notifications, incident reporting, and care-plan updates." },
          { id: "i3", label: "Dismiss the conflict between the stethoscope and emergency bag because one source appears more convenient. This identify option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about stethoscope." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the stethoscope without confirming an applicable order and patient-specific authority. This decide option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for stethoscope is resolved." },
          { id: "d3", label: "Hand the stethoscope concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during post-event notifications, incident reporting, and care-plan updates." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For stethoscope, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For stethoscope, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the stethoscope before reassessment confirms the patient response. This document option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of stethoscope." },
          { id: "doc3", label: "Copy the prior post-event notifications, incident reporting, and care-plan updates narrative even though today’s stethoscope evidence is different. This document option concerns stethoscope during post-event notifications, incident reporting, and care-plan updates.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-event notifications, incident reporting, and care-plan updates." },
        ],
        feedback: {
          observed: "Observe the stethoscope as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the stethoscope as patient-specific evidence for post-event notifications, incident reporting, and care-plan updates. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for post-event notifications, incident reporting, and care-plan updates, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For stethoscope, compare the visible evidence with emergency bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to stethoscope; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for post-event notifications, incident reporting, and care-plan updates. For stethoscope, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Exact",
    title: "Exact event timeline documentation and debrief",
    subtitle: "Clinical Emergency Response",
    narration: [
      "This lesson develops registered-nurse reasoning for exact event timeline documentation and debrief within Clinical Emergency Response. Use the current controlled requirements in QA-AE-001, OP-FM-005, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — QA-AE-001, 12\\. Appendices. Appendix A: Adverse Event Report Form Care Indeed Home Health Care, Inc. CONFIDENTIAL — Adverse Event Report Form Policy Reference: QA-AE-001 ; Version: 6.0 DO NOT FILE IN THE PATIENT'S CLINICAL RECORD. Submit to Director of Nursing within 24 hours of event. SECTION 1 — EVENT IDENTIFICATION ; Field ; Response ; ; ; ; ; Patient Name: ; ; ; Patient ID / MR#: ; ; ; Date of Event: ; ; ; Time of Event: ; ; ; Location of Event: ; ☐ Patient Home ☐ Community ☐ Other: _____________ ; ; Date Discovered (if different from event date): ; ; ; Reporting Staff Member Name: ; ; ; Reporting Staff Member Title.",
      "Controlled-policy focus — QA-AE-001, Adverse Event Classification and Reportable Events. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; QAPI Coordinator ; Maintain a written Adverse Event Classification Guide that defines the agency's adverse event categories, severity levels, and reporting requirements. The guide must be accessible to all staff and included in orientation training. ; At policy effective date; reviewed annually. ; ; 6.1.2 ; All Staff ; Report the following categories of events using the Adverse Event Report Form (Appendix A): (a) Patient falls (with or without injury); (b) Medication errors (wrong drug, wrong dose, wrong route, wrong time, omission); (c) Adverse drug reactions; (d) Hospital admissions/emergency department visits during an active episode; (e) Infections acquired during the episode.",
      "Controlled-policy focus — QA-AE-001, Reporting Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Discovering Staff Member ; Immediately ensure patient safety — provide or arrange for any necessary emergency care. ; Immediately upon discovery. ; ; 6.2.2 ; Discovering Staff Member ; Notify the patient's physician of any adverse event that has the potential to affect the patient's plan of care or clinical status. Document the notification in the clinical record. ; Within 1 hour of discovery for Level 3–5 events; within 4 hours for Level 1–2 events or by end of the visit. ; ; 6.2.3 ; Discovering Staff Member ; Notify the clinical supervisor / Director of Nursing verbally. ; Within 1.",
      "Controlled-policy focus — OP-FM-005, 6\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Emergency Preparedness Plan (EPP) ; Written EPP per CMS requirements ; Operations Director ; Operations file; accessible to all staff ; Maintained continuously ; ; Hazard Vulnerability Analysis ; HVA Worksheet (Appendix A) ; Operations Director ; Operations file; EPP file ; Annually ; ; Emergency Management Team roster ; EMT roster with contact information ; Administrator ; EPP file; distributed to EMT ; Updated within 14 days of change ; ; Emergency Contact Card ; Appendix B ; Operations Director ; Distributed to all EMT; in on-call kits ; Updated within 7 days of change.",
      "Controlled-policy focus — QA-AE-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Adverse Event ; An undesirable event that occurs during or as a result of care provided by the agency that results in harm to the patient. Includes events that were preventable and those that were not. ; ; Near-Miss ; An event that had the potential to cause harm but did not reach the patient or did not result in harm due to timely intervention or chance. ; ; Sentinel Event ; An adverse event that results in: (a) patient death; (b) permanent loss of function not related to the natural course of the patient's illness; (c) serious physical or psychological injury; or (d) any event the agency defines as.",
      "Apply the controlled requirements to the three visible objects in the scene for exact event timeline documentation and debrief. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Closed Incident Folder", detail: "Review the closed incident folder for the patient-specific finding. Reconcile it with the two mugs, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Two Mugs", detail: "Review the two mugs for the patient-specific finding. Reconcile it with the emergency bag, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Emergency Bag", detail: "Review the emergency bag for the patient-specific finding. Reconcile it with the closed incident folder, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-PR-005" },
      { kind: "Controlled Policy", text: "OP-FM-005" },
      { kind: "Controlled Policy", text: "QA-AE-001" },
      { kind: "Controlled Policy", text: "RM-ER-002" },
      { kind: "External Authority", text: "45 CFR § 164.510(b)" },
      { kind: "External Authority", text: "42 CFR §484.50(a)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "closed-incident-folder-7-1", label: "closed incident folder", shortLabel: "closed incident folder", ariaLabel: "Investigate closed incident folder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the closed incident folder as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the two mugs, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed incident folder, compare the visible evidence with two mugs and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the closed incident folder as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the two mugs, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed incident folder, compare the visible evidence with two mugs and the controlling source before classifying status." },
          { id: "i2", label: "Treat the closed incident folder as the complete assessment and do not compare the two mugs, patient report, or current record. This identify option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for exact event timeline documentation and debrief." },
          { id: "i3", label: "Carry forward the prior visit conclusion for exact event timeline documentation and debrief without reassessing the patient today. This identify option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about closed incident folder." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed incident folder; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed incident folder; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the closed incident folder alone and seek clarification only after the intervention is complete. This decide option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for closed incident folder is resolved." },
          { id: "d3", label: "Defer the concern in the closed incident folder to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during exact event timeline documentation and debrief." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For closed incident folder, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For closed incident folder, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the closed incident folder was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of closed incident folder." },
          { id: "doc3", label: "Keep the closed incident folder decision in personal notes rather than the governed patient record. This document option concerns closed incident folder during exact event timeline documentation and debrief.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for exact event timeline documentation and debrief." },
        ],
        feedback: {
          observed: "Observe the closed incident folder as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the two mugs, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the closed incident folder as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the two mugs, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For closed incident folder, compare the visible evidence with two mugs and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to closed incident folder; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For closed incident folder, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "two-mugs-7-2", label: "two mugs", shortLabel: "two mugs", ariaLabel: "Investigate two mugs",        x: 33, y: 58, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the two mugs as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two mugs, compare the visible evidence with emergency bag and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the two mugs as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two mugs, compare the visible evidence with emergency bag and the controlling source before classifying status." },
          { id: "i2", label: "Assume the two mugs establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for exact event timeline documentation and debrief." },
          { id: "i3", label: "Dismiss the conflict between the two mugs and emergency bag because one source appears more convenient. This identify option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about two mugs." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two mugs; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two mugs; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the two mugs without confirming an applicable order and patient-specific authority. This decide option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for two mugs is resolved." },
          { id: "d3", label: "Hand the two mugs concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during exact event timeline documentation and debrief." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For two mugs, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For two mugs, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the two mugs before reassessment confirms the patient response. This document option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of two mugs." },
          { id: "doc3", label: "Copy the prior exact event timeline documentation and debrief narrative even though today’s two mugs evidence is different. This document option concerns two mugs during exact event timeline documentation and debrief.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for exact event timeline documentation and debrief." },
        ],
        feedback: {
          observed: "Observe the two mugs as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the two mugs as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the emergency bag, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For two mugs, compare the visible evidence with emergency bag and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to two mugs; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For two mugs, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
      {
        id: "emergency-bag-7-3", label: "emergency bag", shortLabel: "emergency bag", ariaLabel: "Investigate emergency bag",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the emergency bag as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the closed incident folder, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with closed incident folder and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the emergency bag as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the closed incident folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with closed incident folder and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the emergency bag and omit the related change, symptom, or safety cue. This identify option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for exact event timeline documentation and debrief." },
          { id: "i3", label: "Let a blank, unreadable, or unverified emergency bag stand in for direct RN assessment. This identify option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about emergency bag." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the emergency bag issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for emergency bag is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for exact event timeline documentation and debrief instead of the current controlled clinical pathway. This decide option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during exact event timeline documentation and debrief." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For emergency bag, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For emergency bag, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the emergency bag and omit the discrepancy with closed incident folder. This document option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of emergency bag." },
          { id: "doc3", label: "Combine the emergency bag issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns emergency bag during exact event timeline documentation and debrief.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for exact event timeline documentation and debrief." },
        ],
        feedback: {
          observed: "Observe the emergency bag as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the closed incident folder, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the emergency bag as patient-specific evidence for exact event timeline documentation and debrief. Compare it with the closed incident folder, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for exact event timeline documentation and debrief, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For emergency bag, compare the visible evidence with closed incident folder and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to emergency bag; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for exact event timeline documentation and debrief. For emergency bag, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-PR-005","OP-FM-005","QA-AE-001","RM-ER-002","42 CFR § 484.102","42 CFR §484.110","42 CFR § 484.102(a)","42 CFR § 484.102(b)","42 CFR § 484.102(c)","42 CFR § 484.102(d)","45 CFR § 164.510(b)","42 CFR §484.50(a)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During scene safety and rapid primary survey, the emergency bag conflicts with the overturned side table and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the emergency bag alone and seek clarification only after the intervention is complete. This option concerns scene safety and rapid primary survey.",
      "Assume the overturned side table is unchanged from the prior encounter and omit patient-specific reassessment during scene safety and rapid primary survey.",
      "Defer the concern in the emergency bag to the next routine visit even though its current clinical significance has not been assessed. This option concerns scene safety and rapid primary survey.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for scene safety and rapid primary survey within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 2,
    stem: "During recognize immediate 911 emergencies, the clear address card turned -side outward conflicts with the cordless phone and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the cordless phone is unchanged from the prior encounter and omit patient-specific reassessment during recognize immediate 911 emergencies.",
      "Change the treatment, medication, device setting, or plan based on the clear address card turned -side outward without confirming an applicable order and patient-specific authority. This option concerns recognize immediate 911 emergencies.",
      "Hand the clear address card turned -side outward concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns recognize immediate 911 emergencies.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for recognize immediate 911 emergencies within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 3,
    stem: "During activate ems and stabilize within scope, the emergency phone conflicts with the stethoscope and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Close the emergency phone issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns activate ems and stabilize within scope.",
      "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for activate ems and stabilize within scope instead of the current controlled clinical pathway. This option concerns activate ems and stabilize within scope.",
      "Assume the stethoscope is unchanged from the prior encounter and omit patient-specific reassessment during activate ems and stabilize within scope.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for activate ems and stabilize within scope within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 4,
    stem: "During urgent non-911 escalation using objective sbar, the folded blanket conflicts with the walker on side and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the folded blanket to the next routine visit even though its current clinical significance has not been assessed. This option concerns urgent non-911 escalation using objective sbar.",
      "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the folded blanket alone and seek clarification only after the intervention is complete. This option concerns urgent non-911 escalation using objective sbar.",
      "Assume the walker on side is unchanged from the prior encounter and omit patient-specific reassessment during urgent non-911 escalation using objective sbar.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for urgent non-911 escalation using objective sbar within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 5,
    stem: "During emergency plan, triage category, and communication continuity, the folded medication pouch conflicts with the emergency bag and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Assume the emergency bag is unchanged from the prior encounter and omit patient-specific reassessment during emergency plan, triage category, and communication continuity.",
      "Hand the folded medication pouch concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns emergency plan, triage category, and communication continuity.",
      "Change the treatment, medication, device setting, or plan based on the folded medication pouch without confirming an applicable order and patient-specific authority. This option concerns emergency plan, triage category, and communication continuity.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for emergency plan, triage category, and communication continuity within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 6,
    stem: "During post-event notifications, incident reporting, and care-plan updates, the stethoscope conflicts with the emergency bag and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the emergency bag is unchanged from the prior encounter and omit patient-specific reassessment during post-event notifications, incident reporting, and care-plan updates.",
      "Use a familiar local shortcut for post-event notifications, incident reporting, and care-plan updates instead of the current controlled clinical pathway. This option concerns post-event notifications, incident reporting, and care-plan updates.",
      "Close the stethoscope issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns post-event notifications, incident reporting, and care-plan updates.",
      "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for post-event notifications, incident reporting, and care-plan updates within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 7,
    stem: "During exact event timeline documentation and debrief, the emergency bag conflicts with the closed incident folder and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Proceed using the emergency bag alone and seek clarification only after the intervention is complete. This option concerns exact event timeline documentation and debrief.",
      "Assume the closed incident folder is unchanged from the prior encounter and omit patient-specific reassessment during exact event timeline documentation and debrief.",
      "Defer the concern in the emergency bag to the next routine visit even though its current clinical significance has not been assessed. This option concerns exact event timeline documentation and debrief.",
      "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for exact event timeline documentation and debrief within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-PR-005, OP-FM-005, QA-AE-001, RM-ER-002.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.102 be used when applying Clinical Emergency Response?",
    options: [
      "Apply the citation to roles, patients, or circumstances outside its verified subject and scope.",
      "Replace current agency policy and patient-specific orders with a remembered summary of the regulation.",
      "Use the verified external requirement with the current controlled agency policy, patient-specific assessment, and documented conflict resolution.",
      "Treat the citation label as proof that every clinical workflow and numeric detail is current.",
    ],
    correct: 2,
    rationale: "Visible federal traceability supports practice only when scope and current controlled implementation are verified.",
  },
  {
    id: 9,
    stem: "What connects the cordless phone and stethoscope into defensible RN practice for Clinical Emergency Response?",
    options: [
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A familiar device display accepted without technique or context validation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
      "A verbal assumption that another discipline will address every unresolved issue.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Clinical Emergency Response establish?",
    options: [
      "Permission to replace current controlled policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled RN concepts in Clinical Emergency Response, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
      "Automatic authority to perform every activity discussed in Clinical Emergency Response without supervision.",
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


const STORAGE_KEY = 'rn-014-progress-v6000';

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

export default function RN014() {
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
          <span className="brand-text">RN-014 — Emergency</span>
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
