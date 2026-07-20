/**
 * RN-013 — Telehealth & Remote Patient Monitoring
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
import img01 from './assets/rn-013/rn-013-lesson-01.png';
import img02 from './assets/rn-013/rn-013-lesson-02.png';
import img03 from './assets/rn-013/rn-013-lesson-03.png';
import img04 from './assets/rn-013/rn-013-lesson-04.png';
import img05 from './assets/rn-013/rn-013-lesson-05.png';
import img06 from './assets/rn-013/rn-013-lesson-06.png';
import img07 from './assets/rn-013/rn-013-lesson-07.png';

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

const MODULE_META = { id: "RN-013", title: "Telehealth & Remote Patient Monitoring", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Photorealistic PHI-safe home-health RN training scene for Determine ordered telehealth/RPM suitability and consent, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Verify identity, privacy, device, connectivity, and data source, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Collect and validate remote vital signs and symptom reports, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Interpret trends within plan-of-care parameters, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Respond to threshold alerts and failed transmissions, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Escalate urgent findings and convert to in-person or emergency care, with three visible clinical objects aligned to keyboard-accessible hotspots.",
  "Photorealistic PHI-safe home-health RN training scene for Document encounter, data, actions, limitations, and follow-up, with three visible clinical objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Determi",
    title: "Determine ordered telehealth/RPM suitability and consent",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for determine ordered telehealth/rpm suitability and consent within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in CL-SD-009, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-009, Patient Enrollment in Telehealth / RPM. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Assigned RN ; Assess the patient's appropriateness for telehealth and/or RPM based on: (a) clinical condition and monitoring needs; (b) patient's or caregiver's ability to use the technology; (c) availability of reliable internet or cellular service; (d) patient's willingness to participate. ; At SOC or when telehealth is indicated. ; ; 6.1.2 ; Assigned RN ; Obtain and document the patient's informed consent for telehealth services using the Telehealth Consent Form (Appendix A). ; Before initiating telehealth. ; ; 6.1.3 ; Assigned RN ; Obtain a physician order for telehealth and/or RPM services per CL-CP-003. ; Before initiating telehealth..",
      "Controlled-policy focus — CL-SD-009, Telehealth Visit Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned Clinician ; Conduct telehealth visits per the plan of care schedule using the agency-approved HIPAA-compliant platform. ; Per plan of care. ; ; 6.2.2 ; Assigned Clinician ; Document the telehealth encounter in the patient's EHR within 24 hours including: (a) date, time, and duration of the encounter; (b) platform used; (c) clinical assessment findings (within the limitations of the telehealth modality); (d) patient's reported symptoms and status; (e) interventions provided (education, medication review, care coordination); (f) plan for follow-up. ; Within 24 hours. ; ; 6.2.3 ; Assigned Clinician ; Clearly note in the documentation that the encounter was.",
      "Controlled-policy focus — CL-SD-009, 4\\. Policy Statement. 4.1 Telehealth services at Care Indeed Home Health Care, Inc. include video visits, telephone encounters, and remote patient monitoring (e.g., automated transmission of vital signs, weight, blood glucose, oxygen saturation) used as supplements to the physician-approved plan of care. 4.2 Telehealth encounters shall not be used as a substitute for required in-person skilled visits. The agency shall ensure that all visits counted for Medicare billing purposes are in-person visits conducted in the patient's home. Telehealth encounters may supplement — but not replace — the visit frequencies specified in the plan of care. 4.3 All telehealth services shall be authorized by a physician order, reflected in the plan of care, and documented in the patient's clinical record. The plan.",
      "Controlled-policy focus — CL-SD-009, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Telehealth consent ; Telehealth Consent Form (Appendix A) ; Assigned RN ; EHR — consent forms ; Before initiating telehealth ; ; Telehealth visit note ; Encounter documentation per Section 6.2.2 ; Assigned Clinician ; EHR — clinical notes ; Within 24 hours ; ; RPM daily data review ; Documentation of daily data review and any actions ; Assigned Clinician ; EHR — RPM monitoring notes ; Daily; retained minimum 7 years ; ; RPM alert response documentation ; Documentation of alert, patient contact, and clinical actions ; Assigned Clinician ; EHR — clinical notes ; Same.",
      "Controlled-policy focus — CL-SD-009, 8\\. Compliance & Audit Considerations. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Telehealth consent on file for all telehealth patients ; Chart audit ; 100% ; ; Telehealth encounters not billed as in-person visits ; Billing audit cross-referencing telehealth notes with claims ; Zero telehealth encounters billed as in-person visits ; ; RPM data reviewed daily for monitored patients ; RPM platform review logs ; ≥95% of days with documented review ; ; Alert response within 2 hours ; RPM alert log with response timestamps ; ≥95%.",
      "Apply the controlled requirements to the three visible objects in the scene for determine ordered telehealth/rpm suitability and consent. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the small Wi-Fi router, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Small Wi-Fi Router", detail: "Review the small Wi-Fi router for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "tablet-1-1", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 24, y: 38, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "Observe the tablet as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the blood-pressure cuff, patient report, or current record. This identify option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for determine ordered telehealth/rpm suitability and consent." },
          { id: "i3", label: "Carry forward the prior visit conclusion for determine ordered telehealth/rpm suitability and consent without reassessing the patient today. This identify option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during determine ordered telehealth/rpm suitability and consent." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for determine ordered telehealth/rpm suitability and consent." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "blood-pressure-cuff-1-2", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 31, y: 64, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the small Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with small Wi-Fi router and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the small Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with small Wi-Fi router and the controlling source before classifying status." },
          { id: "i2", label: "Assume the blood-pressure cuff establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for determine ordered telehealth/rpm suitability and consent." },
          { id: "i3", label: "Dismiss the conflict between the blood-pressure cuff and small Wi-Fi router because one source appears more convenient. This identify option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the blood-pressure cuff without confirming an applicable order and patient-specific authority. This decide option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Hand the blood-pressure cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during determine ordered telehealth/rpm suitability and consent." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the blood-pressure cuff before reassessment confirms the patient response. This document option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Copy the prior determine ordered telehealth/rpm suitability and consent narrative even though today’s blood-pressure cuff evidence is different. This document option concerns blood-pressure cuff during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for determine ordered telehealth/rpm suitability and consent." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the small Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the small Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with small Wi-Fi router and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "small-wi-fi-router-1-3", label: "small Wi-Fi router", shortLabel: "small Wi-Fi router", ariaLabel: "Investigate small Wi-Fi router",        x: 76, y: 43, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "Observe the small Wi-Fi router as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small Wi-Fi router, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the small Wi-Fi router as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small Wi-Fi router, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the small Wi-Fi router and omit the related change, symptom, or safety cue. This identify option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for determine ordered telehealth/rpm suitability and consent." },
          { id: "i3", label: "Let a blank, unreadable, or unverified small Wi-Fi router stand in for direct RN assessment. This identify option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about small Wi-Fi router." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small Wi-Fi router; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the small Wi-Fi router issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for small Wi-Fi router is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for determine ordered telehealth/rpm suitability and consent instead of the current controlled clinical pathway. This decide option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during determine ordered telehealth/rpm suitability and consent." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For small Wi-Fi router, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For small Wi-Fi router, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the small Wi-Fi router and omit the discrepancy with tablet. This document option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of small Wi-Fi router." },
          { id: "doc3", label: "Combine the small Wi-Fi router issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns small Wi-Fi router during determine ordered telehealth/rpm suitability and consent.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for determine ordered telehealth/rpm suitability and consent." },
        ],
        feedback: {
          observed: "Observe the small Wi-Fi router as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the small Wi-Fi router as patient-specific evidence for determine ordered telehealth/rpm suitability and consent. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for determine ordered telehealth/rpm suitability and consent, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For small Wi-Fi router, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to small Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for determine ordered telehealth/rpm suitability and consent. For small Wi-Fi router, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Verify",
    title: "Verify identity, privacy, device, connectivity, and data source",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for verify identity, privacy, device, connectivity, and data source within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in CL-SD-009, IT-SC-001, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-009, RPM Data Review and Response. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned Clinician ; Review RPM data at minimum daily for actively monitored patients. Document the review. ; Daily or per the plan of care. ; ; 6.3.2 ; Assigned Clinician ; When RPM data exceeds the established alert threshold, contact the patient by telephone within 2 hours to assess the clinical situation. Document the contact and findings. ; Within 2 hours of alert. ; ; 6.3.3 ; Assigned Clinician ; If the RPM alert indicates a clinically significant change, notify the physician per CL-CP-005, schedule an in-person visit if clinically warranted, and initiate a plan of care modification per CL-CP-002 if.",
      "Controlled-policy focus — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 ; Version: 6.0 ; Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: ; Rating ; Value ; Definition ; ; ; ; ; ; Low ; 1 ; Unlikely to occur within the next 12 months. ; ; Medium ; 2 ; Possible occurrence within the next 12 months. ; ; High ; 3.",
      "Controlled-policy focus — CL-CP-001, What Surveyors and Auditors Will Look For. CMS surveyors conducting a standard survey under the State Operations Manual (SOM) Appendix B will specifically verify under Tag G160 (42 CFR § 484.60): Evidence that a plan of care exists for every patient. Surveyors will request clinical records and verify that a written, physician-approved plan of care exists for each active patient and for each certification period of sampled past patients. Missing plans of care or unsigned plans are Condition-level deficiency risks. Evidence that the plan of care contains all required elements. Surveyors will review plans of care for completeness per 42 CFR § 484.60(a). Commonly cited deficiencies include: missing homebound status narrative, vague or unmeasurable goals, incomplete medication lists, and visit frequencies that do not match.",
      "Controlled-policy focus — IT-SC-001, 3\\. Scope. This policy applies to: All workforce members of Care Indeed Home Health Care, Inc. including full-time, part-time, per diem, temporary, and volunteer staff All contractors, consultants, and business associates who access, process, store, or transmit agency information or ePHI All information systems, applications, databases, networks, endpoints, mobile devices, and cloud services owned, leased, or operated by the agency All physical locations where agency information is accessed, processed, or stored including the main office, branch offices, staff home offices, and patient homes All forms of agency information regardless of format: electronic, paper, verbal, or visual This policy does not apply to: Patients' personal devices or home networks except to the extent that agency staff connect agency-managed devices to patient.",
      "Controlled-policy focus — IT-SC-001, 5\\. Definitions. Term ; Definition ; ; ; ; ; Information Security Program ; The comprehensive framework of policies, procedures, technical controls, and organizational measures designed to protect information assets from unauthorized access, use, disclosure, disruption, modification, or destruction. ; ; ePHI ; Electronic Protected Health Information — individually identifiable health information that is created, received, maintained, or transmitted in electronic form, as defined by 45 CFR § 160.103. ; ; Information Security Official (ISO) ; The individual designated by the Governing Body as responsible for the development and implementation of the security policies and procedures required by the HIPAA Security Rule. At Care Indeed, this role is fulfilled by the IT Director / CISO. ; ; Risk Analysis.",
      "Apply the controlled requirements to the three visible objects in the scene for verify identity, privacy, device, connectivity, and data source. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the pulse oximeter display, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Pulse Oximeter Display", detail: "Review the pulse oximeter display for the patient-specific finding. Reconcile it with the Wi-Fi router, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Wi-Fi Router", detail: "Review the Wi-Fi router for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR §484.55" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "tablet-screen-2-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 65, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "Observe the tablet screen as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with pulse oximeter display and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet screen establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify identity, privacy, device, connectivity, and data source." },
          { id: "i3", label: "Dismiss the conflict between the tablet screen and pulse oximeter display because one source appears more convenient. This identify option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet screen without confirming an applicable order and patient-specific authority. This decide option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Hand the tablet screen concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify identity, privacy, device, connectivity, and data source." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet screen before reassessment confirms the patient response. This document option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Copy the prior verify identity, privacy, device, connectivity, and data source narrative even though today’s tablet screen evidence is different. This document option concerns tablet screen during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify identity, privacy, device, connectivity, and data source." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "pulse-oximeter-display-2-2", label: "pulse oximeter display", shortLabel: "pulse oximeter display", ariaLabel: "Investigate pulse oximeter display",        x: 38, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "Observe the pulse oximeter display as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with Wi-Fi router and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter display as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with Wi-Fi router and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pulse oximeter display and omit the related change, symptom, or safety cue. This identify option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify identity, privacy, device, connectivity, and data source." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pulse oximeter display stand in for direct RN assessment. This identify option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter display." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pulse oximeter display issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter display is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for verify identity, privacy, device, connectivity, and data source instead of the current controlled clinical pathway. This decide option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify identity, privacy, device, connectivity, and data source." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pulse oximeter display and omit the discrepancy with Wi-Fi router. This document option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter display." },
          { id: "doc3", label: "Combine the pulse oximeter display issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pulse oximeter display during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify identity, privacy, device, connectivity, and data source." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter display as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter display as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with Wi-Fi router and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "wi-fi-router-2-3", label: "Wi-Fi router", shortLabel: "Wi-Fi router", ariaLabel: "Investigate Wi-Fi router",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "Observe the Wi-Fi router as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the Wi-Fi router as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat the Wi-Fi router as the complete assessment and do not compare the tablet screen, patient report, or current record. This identify option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for verify identity, privacy, device, connectivity, and data source." },
          { id: "i3", label: "Carry forward the prior visit conclusion for verify identity, privacy, device, connectivity, and data source without reassessing the patient today. This identify option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about Wi-Fi router." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the Wi-Fi router alone and seek clarification only after the intervention is complete. This decide option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for Wi-Fi router is resolved." },
          { id: "d3", label: "Defer the concern in the Wi-Fi router to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during verify identity, privacy, device, connectivity, and data source." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the Wi-Fi router was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Wi-Fi router." },
          { id: "doc3", label: "Keep the Wi-Fi router decision in personal notes rather than the governed patient record. This document option concerns Wi-Fi router during verify identity, privacy, device, connectivity, and data source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for verify identity, privacy, device, connectivity, and data source." },
        ],
        feedback: {
          observed: "Observe the Wi-Fi router as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the Wi-Fi router as patient-specific evidence for verify identity, privacy, device, connectivity, and data source. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for verify identity, privacy, device, connectivity, and data source, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for verify identity, privacy, device, connectivity, and data source. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Collect",
    title: "Collect and validate remote vital signs and symptom reports",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for collect and validate remote vital signs and symptom reports within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in CL-SD-009, IT-SC-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-009, 5\\. Definitions. Term ; Definition ; ; ; ; ; Telehealth ; The use of telecommunications technology to deliver clinical services remotely, including video visits and telephone encounters, as a supplement to in-person care. ; ; Remote Patient Monitoring (RPM) ; The use of electronic devices to collect and transmit patient physiological data (vital signs, weight, blood glucose, oxygen saturation) from the patient's home to the agency for clinical review. ; ; Video Visit ; A live, synchronous audio-visual encounter between a clinician and a patient conducted via a HIPAA-compliant telehealth platform. ; ; Telephone Encounter ; A clinical interaction conducted by telephone between a clinician and a patient, typically for follow-up, symptom assessment, or care coordination. ; ; Alert.",
      "Controlled-policy focus — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 ; Version: 6.0 ; Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: ; Rating ; Value ; Definition ; ; ; ; ; ; Low ; 1 ; Unlikely to occur within the next 12 months. ; ; Medium ; 2 ; Possible occurrence within the next 12 months. ; ; High ; 3.",
      "Controlled-policy focus — CL-SD-009, 4\\. Policy Statement. 4.1 Telehealth services at Care Indeed Home Health Care, Inc. include video visits, telephone encounters, and remote patient monitoring (e.g., automated transmission of vital signs, weight, blood glucose, oxygen saturation) used as supplements to the physician-approved plan of care. 4.2 Telehealth encounters shall not be used as a substitute for required in-person skilled visits. The agency shall ensure that all visits counted for Medicare billing purposes are in-person visits conducted in the patient's home. Telehealth encounters may supplement — but not replace — the visit frequencies specified in the plan of care. 4.3 All telehealth services shall be authorized by a physician order, reflected in the plan of care, and documented in the patient's clinical record. The plan.",
      "Controlled-policy focus — IT-SC-001, Compliance Indicators. Compliance Indicator ; Measurement Method ; Acceptable Standard ; ; ; ; ; ; Information Security Official is designated and documented. ; Review of Governing Body minutes; designation documentation. ; Current designation on file; no vacancy exceeds 14 days without interim. ; ; ISPP is current and Governing Body approved. ; Review of ISPP document; Governing Body minutes for approval. ; Approved within last 12 months. ; ; Risk analysis completed annually. ; Review of Risk Analysis Worksheet (Appendix A) with completion date. ; Completed within last 12 months; updated within 30 days of triggering events. ; ; Risk Register is current and complete. ; Review of Risk Register (Appendix B). ; All identified risks documented; reviewed quarterly.",
      "Controlled-policy focus — IT-SC-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Information Security Official designation ; Written designation in Governing Body minutes including name, qualifications, scope of authority, and effective date. ; Governing Body Chair ; Governing Body minutes; IT governance file. ; At designation; updated within 30 days of any change. ; ; Information Security Program Plan (ISPP) ; Written plan per Section 6.1.2. ; IT Director / CISO ; IT governance file; copy to Administrator and Compliance Officer. ; Initial within 90 days; annual update 30 days before review date. ; ; Risk Analysis documentation ; Completed Risk Analysis Worksheet (Appendix A) with all identified threats, vulnerabilities.",
      "Apply the controlled requirements to the three visible objects in the scene for collect and validate remote vital signs and symptom reports. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Pulse Oximeter Display", detail: "Review the pulse oximeter display for the patient-specific finding. Reconcile it with the tablet, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Tablet", detail: "Review the tablet for the patient-specific finding. Reconcile it with the charging cable partly disconnected, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Charging Cable Partly Disconnected", detail: "Review the charging cable partly disconnected for the patient-specific finding. Reconcile it with the pulse oximeter display, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR §484.55" },
      { kind: "External Authority", text: "42 CFR §484.60" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "pulse-oximeter-display-3-1", label: "pulse oximeter display", shortLabel: "pulse oximeter display", ariaLabel: "Investigate pulse oximeter display",        x: 20, y: 50, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "Observe the pulse oximeter display as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the pulse oximeter display as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the pulse oximeter display and omit the related change, symptom, or safety cue. This identify option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for collect and validate remote vital signs and symptom reports." },
          { id: "i3", label: "Let a blank, unreadable, or unverified pulse oximeter display stand in for direct RN assessment. This identify option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about pulse oximeter display." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the pulse oximeter display issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for pulse oximeter display is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for collect and validate remote vital signs and symptom reports instead of the current controlled clinical pathway. This decide option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during collect and validate remote vital signs and symptom reports." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the pulse oximeter display and omit the discrepancy with tablet. This document option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of pulse oximeter display." },
          { id: "doc3", label: "Combine the pulse oximeter display issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns pulse oximeter display during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for collect and validate remote vital signs and symptom reports." },
        ],
        feedback: {
          observed: "Observe the pulse oximeter display as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the pulse oximeter display as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the tablet, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For pulse oximeter display, compare the visible evidence with tablet and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to pulse oximeter display; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For pulse oximeter display, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "tablet-3-2", label: "tablet", shortLabel: "tablet", ariaLabel: "Investigate tablet",        x: 42, y: 40, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "Observe the tablet as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the charging cable partly disconnected, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with charging cable partly disconnected and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the charging cable partly disconnected, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with charging cable partly disconnected and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet as the complete assessment and do not compare the charging cable partly disconnected, patient report, or current record. This identify option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for collect and validate remote vital signs and symptom reports." },
          { id: "i3", label: "Carry forward the prior visit conclusion for collect and validate remote vital signs and symptom reports without reassessing the patient today. This identify option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet alone and seek clarification only after the intervention is complete. This decide option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet is resolved." },
          { id: "d3", label: "Defer the concern in the tablet to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during collect and validate remote vital signs and symptom reports." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For tablet, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For tablet, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet." },
          { id: "doc3", label: "Keep the tablet decision in personal notes rather than the governed patient record. This document option concerns tablet during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for collect and validate remote vital signs and symptom reports." },
        ],
        feedback: {
          observed: "Observe the tablet as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the charging cable partly disconnected, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the charging cable partly disconnected, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet, compare the visible evidence with charging cable partly disconnected and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For tablet, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "charging-cable-partly-disconnected-3-3", label: "charging cable partly disconnected", shortLabel: "charging cable partly", ariaLabel: "Investigate charging cable partly disconnected",        x: 76, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "Observe the charging cable partly disconnected as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For charging cable partly disconnected, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the charging cable partly disconnected as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For charging cable partly disconnected, compare the visible evidence with pulse oximeter display and the controlling source before classifying status." },
          { id: "i2", label: "Assume the charging cable partly disconnected establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for collect and validate remote vital signs and symptom reports." },
          { id: "i3", label: "Dismiss the conflict between the charging cable partly disconnected and pulse oximeter display because one source appears more convenient. This identify option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about charging cable partly disconnected." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to charging cable partly disconnected; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to charging cable partly disconnected; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the charging cable partly disconnected without confirming an applicable order and patient-specific authority. This decide option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for charging cable partly disconnected is resolved." },
          { id: "d3", label: "Hand the charging cable partly disconnected concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during collect and validate remote vital signs and symptom reports." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For charging cable partly disconnected, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For charging cable partly disconnected, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the charging cable partly disconnected before reassessment confirms the patient response. This document option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of charging cable partly disconnected." },
          { id: "doc3", label: "Copy the prior collect and validate remote vital signs and symptom reports narrative even though today’s charging cable partly disconnected evidence is different. This document option concerns charging cable partly disconnected during collect and validate remote vital signs and symptom reports.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for collect and validate remote vital signs and symptom reports." },
        ],
        feedback: {
          observed: "Observe the charging cable partly disconnected as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the charging cable partly disconnected as patient-specific evidence for collect and validate remote vital signs and symptom reports. Compare it with the pulse oximeter display, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for collect and validate remote vital signs and symptom reports, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For charging cable partly disconnected, compare the visible evidence with pulse oximeter display and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to charging cable partly disconnected; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for collect and validate remote vital signs and symptom reports. For charging cable partly disconnected, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Interpr",
    title: "Interpret trends within plan-of-care parameters",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for interpret trends within plan-of-care parameters within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in IT-SC-001, CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — IT-SC-001, Escalation and Exception Handling. Condition ; Escalation Path ; Corrective Action ; Timeframe ; ; ; ; ; ; ; Risk analysis not completed within the annual cycle ; IT Director / CISO notifies Administrator in writing ; Administrator directs immediate completion and reports to Governing Body at the next quarterly meeting. Compliance Officer documents the deficiency per QA-AE-003. ; Risk analysis completed within 30 calendar days of missed deadline. ; ; High or Critical risk identified without remediation plan ; IT Director / CISO escalates to Administrator and Compliance Officer ; Administrator convenes Information Security Steering Committee within 7 calendar days to develop remediation plan. Governing Body notified at next quarterly meeting. ; Remediation plan within 14 calendar days; Governing Body.",
      "Controlled-policy focus — CL-CP-001, Physician Approval Process. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned RN / Clinical Coordinator ; Within 24 hours of finalizing the plan of care in the EHR, transmit the plan of care to the patient's certifying physician for review, approval, and signature. Transmission shall be via fax, secure electronic transmission, or physician portal. Document the date, method, and recipient of transmission in the clinical record. ; Within 24 hours of POC finalization; documented at time of transmission. ; ; 6.3.2 ; Clinical Coordinator / Director of Nursing ; Initiate tracking of the pending physician signature in the agency's physician order tracking system per policy CL-CP-009. Log the date transmitted, the.",
      "Controlled-policy focus — IT-SC-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Information Security Official designation ; Written designation in Governing Body minutes including name, qualifications, scope of authority, and effective date. ; Governing Body Chair ; Governing Body minutes; IT governance file. ; At designation; updated within 30 days of any change. ; ; Information Security Program Plan (ISPP) ; Written plan per Section 6.1.2. ; IT Director / CISO ; IT governance file; copy to Administrator and Compliance Officer. ; Initial within 90 days; annual update 30 days before review date. ; ; Risk Analysis documentation ; Completed Risk Analysis Worksheet (Appendix A) with all identified threats, vulnerabilities.",
      "Controlled-policy focus — CL-CP-001, 7\\. Documentation Requirements. Requirement ; Document / Record ; Responsible Party ; Location ; Timeframe ; ; ; ; ; ; ; ; Completed plan of care ; Patient-specific plan of care including all required elements per Section 6.2 ; Assigned RN ; EHR — patient clinical record ; Developed within 24 hours of SOC visit; retained for minimum 7 years per CO-HP-007 ; ; Physician-signed plan of care ; Signed and dated CMS-485 or EHR equivalent ; Certifying physician / Medical Records ; EHR — patient clinical record ; Received and filed before claim submission; retained minimum 7 years ; ; Plan of care transmission record ; Documentation of date, method, and recipient of transmission to physician ; Clinical Coordinator.",
      "Controlled-policy focus — IT-SC-001, Risk Analysis and Risk Management. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; IT Director / CISO ; Conduct a comprehensive risk analysis of all systems that create, receive, maintain, or transmit ePHI. The risk analysis shall: (a) identify all ePHI repositories and data flows; (b) identify and document reasonably anticipated threats and vulnerabilities; (c) assess the likelihood and impact of each identified threat-vulnerability pair; (d) determine the current level of risk for each pair; (e) document the analysis using the Risk Analysis Worksheet (Appendix A). ; Annually; within 30 calendar days of any significant change to information systems, infrastructure, or operations. ; ; 6.2.2 ; IT Director / CISO ; Develop and maintain.",
      "Apply the controlled requirements to the three visible objects in the scene for interpret trends within plan-of-care parameters. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the weight scale, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Weight Scale", detail: "Review the weight scale for the patient-specific finding. Reconcile it with the symptom call button, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Symptom Call Button", detail: "Review the symptom call button for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR §484.60" },
      { kind: "External Authority", text: "42 CFR §484.75" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "tablet-screen-4-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 43, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "Observe the tablet screen as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the weight scale, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with weight scale and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the weight scale, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with weight scale and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the weight scale, patient report, or current record. This identify option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for interpret trends within plan-of-care parameters." },
          { id: "i3", label: "Carry forward the prior visit conclusion for interpret trends within plan-of-care parameters without reassessing the patient today. This identify option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during interpret trends within plan-of-care parameters." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during interpret trends within plan-of-care parameters.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interpret trends within plan-of-care parameters." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the weight scale, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the weight scale, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with weight scale and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "weight-scale-4-2", label: "weight scale", shortLabel: "weight scale", ariaLabel: "Investigate weight scale",        x: 49, y: 75, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "Observe the weight scale as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the symptom call button, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weight scale, compare the visible evidence with symptom call button and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the weight scale as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the symptom call button, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weight scale, compare the visible evidence with symptom call button and the controlling source before classifying status." },
          { id: "i2", label: "Assume the weight scale establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for interpret trends within plan-of-care parameters." },
          { id: "i3", label: "Dismiss the conflict between the weight scale and symptom call button because one source appears more convenient. This identify option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about weight scale." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weight scale; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weight scale; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the weight scale without confirming an applicable order and patient-specific authority. This decide option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for weight scale is resolved." },
          { id: "d3", label: "Hand the weight scale concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during interpret trends within plan-of-care parameters." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For weight scale, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For weight scale, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the weight scale before reassessment confirms the patient response. This document option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of weight scale." },
          { id: "doc3", label: "Copy the prior interpret trends within plan-of-care parameters narrative even though today’s weight scale evidence is different. This document option concerns weight scale during interpret trends within plan-of-care parameters.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interpret trends within plan-of-care parameters." },
        ],
        feedback: {
          observed: "Observe the weight scale as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the symptom call button, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the weight scale as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the symptom call button, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For weight scale, compare the visible evidence with symptom call button and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to weight scale; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For weight scale, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "symptom-call-button-4-3", label: "symptom call button", shortLabel: "symptom call button", ariaLabel: "Investigate symptom call button",        x: 83, y: 48, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "Observe the symptom call button as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom call button, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the symptom call button as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom call button, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the symptom call button and omit the related change, symptom, or safety cue. This identify option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for interpret trends within plan-of-care parameters." },
          { id: "i3", label: "Let a blank, unreadable, or unverified symptom call button stand in for direct RN assessment. This identify option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about symptom call button." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom call button; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom call button; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the symptom call button issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for symptom call button is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for interpret trends within plan-of-care parameters instead of the current controlled clinical pathway. This decide option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during interpret trends within plan-of-care parameters." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For symptom call button, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For symptom call button, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the symptom call button and omit the discrepancy with tablet screen. This document option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of symptom call button." },
          { id: "doc3", label: "Combine the symptom call button issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns symptom call button during interpret trends within plan-of-care parameters.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for interpret trends within plan-of-care parameters." },
        ],
        feedback: {
          observed: "Observe the symptom call button as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the symptom call button as patient-specific evidence for interpret trends within plan-of-care parameters. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for interpret trends within plan-of-care parameters, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For symptom call button, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to symptom call button; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for interpret trends within plan-of-care parameters. For symptom call button, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Respond",
    title: "Respond to threshold alerts and failed transmissions",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for respond to threshold alerts and failed transmissions within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in IT-SC-001, CL-CP-001, CL-SD-009, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 ; Version: 6.0 ; Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: ; Rating ; Value ; Definition ; ; ; ; ; ; Low ; 1 ; Unlikely to occur within the next 12 months. ; ; Medium ; 2 ; Possible occurrence within the next 12 months. ; ; High ; 3.",
      "Controlled-policy focus — CL-CP-001, 4\\. Policy Statement. 4.1 Care Indeed Home Health Care, Inc. shall establish a written, individualized plan of care for every patient admitted to home health services prior to or at the initiation of services, as required by 42 CFR § 484.60(a). 4.2 The plan of care shall be developed by the registered nurse responsible for the patient's care in collaboration with the patient, the patient's caregiver(s), the patient's attending physician or allowed practitioner, and all clinical disciplines involved in the patient's care. 4.3 No skilled home health services shall be provided to a patient without a physician-approved plan of care. Verbal orders for services may be initiated prior to written physician signature, provided the verbal order is received, documented, and authenticated.",
      "Controlled-policy focus — IT-SC-001, Information System Activity Review. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; IT Director / CISO ; Implement procedures for regular review of information system activity including: (a) audit logs; (b) access reports; (c) security incident tracking; (d) failed login attempts; (e) privilege escalation events. Document review methodology and frequency in the ISPP. ; Review conducted at least monthly; high-risk systems reviewed weekly. ; ; 6.5.2 ; IT Director / CISO ; Document all reviews using the System Activity Review Log (Appendix E). Escalate anomalies to the Administrator and Compliance Officer per the Security Incident Response policy (IT-DR-005). ; Monthly; immediate escalation of anomalies..",
      "Controlled-policy focus — CL-SD-009, 2\\. Purpose. This policy establishes the standards for the delivery, documentation, and oversight of telehealth services and remote patient monitoring (RPM) at Care Indeed Home Health Care, Inc. Telehealth and RPM technologies represent supplemental tools that can enhance patient monitoring, improve clinical outcomes, support earlier intervention, and reduce unnecessary hospitalizations — but they do not replace in-person skilled visits. Under current CMS rules, telehealth encounters are not counted as billable home health visits for Medicare payment purposes (though this may evolve with future CMS rulemaking). This policy ensures that telehealth services are used appropriately to complement the plan of care, are properly documented, and do not substitute for required in-person visits..",
      "Controlled-policy focus — CL-SD-009, 6\\. Procedures. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 1 ; Director of Nursing ; Review policy requirements and confirm role-based responsibilities for CL-SD-009. ; Prior to implementation and at annual review. ; ; 2 ; Assigned Staff ; Execute telehealth & remote monitoring services activities using approved tools, forms, and documentation standards. ; At point of care/operation and as events occur. ; ; 3 ; Compliance Officer / Designee ; Audit completion, remediate variances, and document corrective actions in the compliance log. ; Monthly and within 5 business days of identified variance..",
      "Apply the controlled requirements to the three visible objects in the scene for respond to threshold alerts and failed transmissions. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the phone, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Phone", detail: "Review the phone for the patient-specific finding. Reconcile it with the blood-pressure cuff, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Blood-pressure Cuff", detail: "Review the blood-pressure cuff for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR §484.75" },
      { kind: "External Authority", text: "42 CFR §484.80" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "tablet-screen-5-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 69, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "Observe the tablet screen as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with phone and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with phone and the controlling source before classifying status." },
          { id: "i2", label: "Assume the tablet screen establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respond to threshold alerts and failed transmissions." },
          { id: "i3", label: "Dismiss the conflict between the tablet screen and phone because one source appears more convenient. This identify option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the tablet screen without confirming an applicable order and patient-specific authority. This decide option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Hand the tablet screen concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respond to threshold alerts and failed transmissions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the tablet screen before reassessment confirms the patient response. This document option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Copy the prior respond to threshold alerts and failed transmissions narrative even though today’s tablet screen evidence is different. This document option concerns tablet screen during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respond to threshold alerts and failed transmissions." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the phone, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with phone and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "phone-5-2", label: "phone", shortLabel: "phone", ariaLabel: "Investigate phone",        x: 30, y: 49, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "Observe the phone as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the phone as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the phone and omit the related change, symptom, or safety cue. This identify option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respond to threshold alerts and failed transmissions." },
          { id: "i3", label: "Let a blank, unreadable, or unverified phone stand in for direct RN assessment. This identify option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about phone." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the phone issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for phone is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for respond to threshold alerts and failed transmissions instead of the current controlled clinical pathway. This decide option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respond to threshold alerts and failed transmissions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For phone, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For phone, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the phone and omit the discrepancy with blood-pressure cuff. This document option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of phone." },
          { id: "doc3", label: "Combine the phone issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns phone during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respond to threshold alerts and failed transmissions." },
        ],
        feedback: {
          observed: "Observe the phone as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the phone as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the blood-pressure cuff, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For phone, compare the visible evidence with blood-pressure cuff and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to phone; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For phone, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "blood-pressure-cuff-5-3", label: "blood-pressure cuff", shortLabel: "blood-pressure cuff", ariaLabel: "Investigate blood-pressure cuff",        x: 77, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "Observe the blood-pressure cuff as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the blood-pressure cuff as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Treat the blood-pressure cuff as the complete assessment and do not compare the tablet screen, patient report, or current record. This identify option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for respond to threshold alerts and failed transmissions." },
          { id: "i3", label: "Carry forward the prior visit conclusion for respond to threshold alerts and failed transmissions without reassessing the patient today. This identify option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about blood-pressure cuff." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the blood-pressure cuff alone and seek clarification only after the intervention is complete. This decide option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for blood-pressure cuff is resolved." },
          { id: "d3", label: "Defer the concern in the blood-pressure cuff to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during respond to threshold alerts and failed transmissions." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the blood-pressure cuff was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of blood-pressure cuff." },
          { id: "doc3", label: "Keep the blood-pressure cuff decision in personal notes rather than the governed patient record. This document option concerns blood-pressure cuff during respond to threshold alerts and failed transmissions.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for respond to threshold alerts and failed transmissions." },
        ],
        feedback: {
          observed: "Observe the blood-pressure cuff as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the blood-pressure cuff as patient-specific evidence for respond to threshold alerts and failed transmissions. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for respond to threshold alerts and failed transmissions, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For blood-pressure cuff, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to blood-pressure cuff; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for respond to threshold alerts and failed transmissions. For blood-pressure cuff, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Escalat",
    title: "Escalate urgent findings and convert to in-person or emergency care",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for escalate urgent findings and convert to in-person or emergency care within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in CL-CP-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-CP-001, Multidisciplinary Coordination in Plan of Care Development. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.4.1 ; Director of Nursing ; Ensure that all disciplines providing services to the patient have reviewed the plan of care and that their discipline-specific goals, interventions, and visit frequencies are accurately reflected. No discipline shall provide services that conflict with or exceed what is authorized in the plan of care without a new physician order. ; Within 48 hours of the SOC visit. ; ; 6.4.2 ; Each Clinical Discipline Provider ; Upon receiving a referral for a new patient, review the plan of care within 24 hours of assignment. Confirm that the ordered services are within the discipline's scope of practice.",
      "Controlled-policy focus — CL-CP-001, Patient and Caregiver Engagement in Plan of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.5.1 ; Assigned RN ; At the SOC visit, review the plan of care with the patient and caregiver(s) in plain language, ensuring they understand: (a) the services that will be provided and their frequency; (b) the goals of care; (c) their rights related to care decisions, including the right to refuse services; (d) how to contact the agency with questions or concerns; (e) safety measures specific to their condition and home environment. Provide the patient with a written copy of the plan of care or a plain-language summary in the patient's primary language. ; During the SOC visit. ; ; 6.5.2.",
      "Controlled-policy focus — CL-CP-001, Initiating the Plan of Care Process at Start of Care. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.1.1 ; Intake Staff / Administrator ; Upon acceptance of a referral and determination that the patient meets admission criteria per OP-IM-002, assign the case to a qualified registered nurse for the comprehensive assessment and plan of care development. Ensure the patient's attending physician has been identified and contact information is documented in the intake record. ; At the time of referral acceptance; assignment made no later than 1 business day before the scheduled SOC visit. ; ; 6.1.2 ; Assigned RN ; Prior to the SOC visit, review all available referral documentation including hospital discharge summaries, physician orders, medication lists, recent laboratory.",
      "Controlled-policy focus — CL-CP-001, 9\\. References. 9.1 Federal Regulations ; Citation ; Title ; Relevance ; ; ; ; ; ; 42 CFR § 484.60 ; Condition of Participation: Care Planning, Coordination, and Quality of Care ; Primary regulatory basis for plan of care requirements ; ; 42 CFR § 484.60(a) ; Standard: Plan of care ; Defines required elements of the plan of care ; ; 42 CFR § 484.60(b) ; Standard: Conformance with physician orders ; All services must conform to the physician-approved plan of care ; ; 42 CFR § 424.22 ; Requirements for home health services — plan of care and certifying physician ; Defines physician certification requirements for Medicare billing ; ; 42 CFR § 409.42 ; Skilled nursing.",
      "Controlled-policy focus — CL-CP-001, APPENDICES. Appendix A — Required Elements of the Plan of Care Checklist Care Indeed Home Health Care, Inc. ; Policy Reference: CL-CP-001 ; Version: 1.0 Purpose: To provide the assessing RN with a structured verification checklist confirming all required plan of care elements are present before transmission to the physician for signature. Instructions: The assessing RN shall complete this checklist for every new SOC plan of care before transmitting to the physician. File the completed checklist in the patient's clinical record. Patient Name: _________________________ MR#: _____________ SOC Date: _____________ ; # ; Required Element ; Present (Y/N) ; Notes / Findings ; ; ; ; ; ; ; 1 ; Patient full legal name, DOB, Medicare/Medicaid number.",
      "Apply the controlled requirements to the three visible objects in the scene for escalate urgent findings and convert to in-person or emergency care. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen Angled Away From Window", detail: "Review the tablet screen angled away from window for the patient-specific finding. Reconcile it with the privacy screen filter, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Privacy Screen Filter", detail: "Review the privacy screen filter for the patient-specific finding. Reconcile it with the Wi-Fi router, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Wi-Fi Router", detail: "Review the Wi-Fi router for the patient-specific finding. Reconcile it with the tablet screen angled away from window, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR §484.80" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "tablet-screen-angled-away-from-window-6-1", label: "tablet screen angled away from window", shortLabel: "tablet screen angled away", ariaLabel: "Investigate tablet screen angled away from window",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "Observe the tablet screen angled away from window as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the privacy screen filter, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen angled away from window, compare the visible evidence with privacy screen filter and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen angled away from window as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the privacy screen filter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen angled away from window, compare the visible evidence with privacy screen filter and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the tablet screen angled away from window and omit the related change, symptom, or safety cue. This identify option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for escalate urgent findings and convert to in-person or emergency care." },
          { id: "i3", label: "Let a blank, unreadable, or unverified tablet screen angled away from window stand in for direct RN assessment. This identify option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen angled away from window." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen angled away from window; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen angled away from window; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the tablet screen angled away from window issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen angled away from window is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for escalate urgent findings and convert to in-person or emergency care instead of the current controlled clinical pathway. This decide option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during escalate urgent findings and convert to in-person or emergency care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For tablet screen angled away from window, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For tablet screen angled away from window, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the tablet screen angled away from window and omit the discrepancy with privacy screen filter. This document option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen angled away from window." },
          { id: "doc3", label: "Combine the tablet screen angled away from window issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns tablet screen angled away from window during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalate urgent findings and convert to in-person or emergency care." },
        ],
        feedback: {
          observed: "Observe the tablet screen angled away from window as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the privacy screen filter, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen angled away from window as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the privacy screen filter, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen angled away from window, compare the visible evidence with privacy screen filter and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen angled away from window; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For tablet screen angled away from window, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "privacy-screen-filter-6-2", label: "privacy screen filter", shortLabel: "privacy screen filter", ariaLabel: "Investigate privacy screen filter",        x: 27, y: 58, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "Observe the privacy screen filter as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For privacy screen filter, compare the visible evidence with Wi-Fi router and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the privacy screen filter as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For privacy screen filter, compare the visible evidence with Wi-Fi router and the controlling source before classifying status." },
          { id: "i2", label: "Treat the privacy screen filter as the complete assessment and do not compare the Wi-Fi router, patient report, or current record. This identify option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for escalate urgent findings and convert to in-person or emergency care." },
          { id: "i3", label: "Carry forward the prior visit conclusion for escalate urgent findings and convert to in-person or emergency care without reassessing the patient today. This identify option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about privacy screen filter." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to privacy screen filter; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to privacy screen filter; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the privacy screen filter alone and seek clarification only after the intervention is complete. This decide option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for privacy screen filter is resolved." },
          { id: "d3", label: "Defer the concern in the privacy screen filter to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during escalate urgent findings and convert to in-person or emergency care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For privacy screen filter, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For privacy screen filter, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the privacy screen filter was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of privacy screen filter." },
          { id: "doc3", label: "Keep the privacy screen filter decision in personal notes rather than the governed patient record. This document option concerns privacy screen filter during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalate urgent findings and convert to in-person or emergency care." },
        ],
        feedback: {
          observed: "Observe the privacy screen filter as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the privacy screen filter as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the Wi-Fi router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For privacy screen filter, compare the visible evidence with Wi-Fi router and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to privacy screen filter; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For privacy screen filter, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "wi-fi-router-6-3", label: "Wi-Fi router", shortLabel: "Wi-Fi router", ariaLabel: "Investigate Wi-Fi router",        x: 80, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "Observe the Wi-Fi router as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the tablet screen angled away from window, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen angled away from window and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the Wi-Fi router as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the tablet screen angled away from window, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen angled away from window and the controlling source before classifying status." },
          { id: "i2", label: "Assume the Wi-Fi router establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for escalate urgent findings and convert to in-person or emergency care." },
          { id: "i3", label: "Dismiss the conflict between the Wi-Fi router and tablet screen angled away from window because one source appears more convenient. This identify option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about Wi-Fi router." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the Wi-Fi router without confirming an applicable order and patient-specific authority. This decide option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for Wi-Fi router is resolved." },
          { id: "d3", label: "Hand the Wi-Fi router concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during escalate urgent findings and convert to in-person or emergency care." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the Wi-Fi router before reassessment confirms the patient response. This document option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of Wi-Fi router." },
          { id: "doc3", label: "Copy the prior escalate urgent findings and convert to in-person or emergency care narrative even though today’s Wi-Fi router evidence is different. This document option concerns Wi-Fi router during escalate urgent findings and convert to in-person or emergency care.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalate urgent findings and convert to in-person or emergency care." },
        ],
        feedback: {
          observed: "Observe the Wi-Fi router as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the tablet screen angled away from window, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the Wi-Fi router as patient-specific evidence for escalate urgent findings and convert to in-person or emergency care. Compare it with the tablet screen angled away from window, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for escalate urgent findings and convert to in-person or emergency care, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For Wi-Fi router, compare the visible evidence with tablet screen angled away from window and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to Wi-Fi router; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for escalate urgent findings and convert to in-person or emergency care. For Wi-Fi router, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Documen",
    title: "Document encounter, data, actions, limitations, and follow-up",
    subtitle: "Telehealth & Remote Patient Monitoring",
    narration: [
      "This lesson develops registered-nurse reasoning for document encounter, data, actions, limitations, and follow-up within Telehealth & Remote Patient Monitoring. Use the current controlled requirements in CL-SD-009, IT-SC-001, the patient's actual presentation, current orders, and the individualized plan of care. Start with direct observation and patient or caregiver report, reconcile those findings with available records, identify inconsistencies, and distinguish urgent safety needs from issues that can follow the ordinary clinical communication path. Do not substitute a template, a prior visit, a device reading, or a colleague's assumption for the RN assessment and judgment required in the current encounter. Document what was observed, what it means in this patient's context, the decision and rationale, who was notified, and the follow-through still required. Course completion demonstrates knowledge only; it does not establish appointment, delegation, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-policy focus — CL-SD-009, RPM Data Review and Response. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.3.1 ; Assigned Clinician ; Review RPM data at minimum daily for actively monitored patients. Document the review. ; Daily or per the plan of care. ; ; 6.3.2 ; Assigned Clinician ; When RPM data exceeds the established alert threshold, contact the patient by telephone within 2 hours to assess the clinical situation. Document the contact and findings. ; Within 2 hours of alert. ; ; 6.3.3 ; Assigned Clinician ; If the RPM alert indicates a clinically significant change, notify the physician per CL-CP-005, schedule an in-person visit if clinically warranted, and initiate a plan of care modification per CL-CP-002 if.",
      "Controlled-policy focus — IT-SC-001, APPENDICES. Appendix A — Risk Analysis Worksheet Care Indeed Home Health Care, Inc. Policy Reference: IT-SC-001 ; Version: 6.0 ; Date: 2025-07-10 Instructions: The IT Director / CISO shall complete this worksheet at least annually and within 30 calendar days of any triggering event identified in Section 6.2.7. Each system or data repository that creates, receives, maintains, or transmits ePHI must be assessed. Use the Likelihood and Impact scales provided to calculate the Risk Score. Likelihood Scale: ; Rating ; Value ; Definition ; ; ; ; ; ; Low ; 1 ; Unlikely to occur within the next 12 months. ; ; Medium ; 2 ; Possible occurrence within the next 12 months. ; ; High ; 3.",
      "Controlled-policy focus — CL-SD-009, 4\\. Policy Statement. 4.1 Telehealth services at Care Indeed Home Health Care, Inc. include video visits, telephone encounters, and remote patient monitoring (e.g., automated transmission of vital signs, weight, blood glucose, oxygen saturation) used as supplements to the physician-approved plan of care. 4.2 Telehealth encounters shall not be used as a substitute for required in-person skilled visits. The agency shall ensure that all visits counted for Medicare billing purposes are in-person visits conducted in the patient's home. Telehealth encounters may supplement — but not replace — the visit frequencies specified in the plan of care. 4.3 All telehealth services shall be authorized by a physician order, reflected in the plan of care, and documented in the patient's clinical record. The plan.",
      "Controlled-policy focus — CL-SD-009, 5\\. Definitions. Term ; Definition ; ; ; ; ; Telehealth ; The use of telecommunications technology to deliver clinical services remotely, including video visits and telephone encounters, as a supplement to in-person care. ; ; Remote Patient Monitoring (RPM) ; The use of electronic devices to collect and transmit patient physiological data (vital signs, weight, blood glucose, oxygen saturation) from the patient's home to the agency for clinical review. ; ; Video Visit ; A live, synchronous audio-visual encounter between a clinician and a patient conducted via a HIPAA-compliant telehealth platform. ; ; Telephone Encounter ; A clinical interaction conducted by telephone between a clinician and a patient, typically for follow-up, symptom assessment, or care coordination. ; ; Alert.",
      "Controlled-policy focus — CL-SD-009, Telehealth Visit Execution. Step ; Responsible Party ; Action ; Timeframe ; ; ; ; ; ; ; 6.2.1 ; Assigned Clinician ; Conduct telehealth visits per the plan of care schedule using the agency-approved HIPAA-compliant platform. ; Per plan of care. ; ; 6.2.2 ; Assigned Clinician ; Document the telehealth encounter in the patient's EHR within 24 hours including: (a) date, time, and duration of the encounter; (b) platform used; (c) clinical assessment findings (within the limitations of the telehealth modality); (d) patient's reported symptoms and status; (e) interventions provided (education, medication review, care coordination); (f) plan for follow-up. ; Within 24 hours. ; ; 6.2.3 ; Assigned Clinician ; Clearly note in the documentation that the encounter was.",
      "Apply the controlled requirements to the three visible objects in the scene for document encounter, data, actions, limitations, and follow-up. Treat each object as one source of evidence rather than a complete answer. Corroborate the finding, decide whether immediate intervention, order clarification, provider communication, supervisory escalation, patient teaching, or plan-of-care revision is needed, and reassess the response. If sources conflict, preserve the discrepancy, use the controlled source hierarchy, seek the appropriate authorized reviewer, and avoid unsupported assumptions or universal numeric rules. A defensible record links the patient-specific assessment, skilled reasoning, intervention, response, communication, current orders, unresolved risk, and next responsible owner. The RN remains within current licensure, agency policy, validated competency, and patient-specific authorization boundaries.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Tablet Screen", detail: "Review the tablet screen for the patient-specific finding. Reconcile it with the manual backup notebook closed, current orders, and the controlled record before acting." },
      { icon: "🧭", title: "Manual Backup Notebook Closed", detail: "Review the manual backup notebook closed for the patient-specific finding. Reconcile it with the battery router, current orders, and the controlled record before acting." },
      { icon: "🛡️", title: "Battery Router", detail: "Review the battery router for the patient-specific finding. Reconcile it with the tablet screen, current orders, and the controlled record before acting." },
    ],
    clinicalTip: "Knowledge practice supports RN reasoning but never replaces current orders, observed competency, or authorization. Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-SD-009" },
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "IT-SC-001" },
      { kind: "Controlled Policy", text: "CO-HP-002" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "tablet-screen-7-1", label: "tablet screen", shortLabel: "tablet screen", ariaLabel: "Investigate tablet screen",        x: 14, y: 75, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "Observe the tablet screen as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the manual backup notebook closed, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with manual backup notebook closed and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the tablet screen as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the manual backup notebook closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with manual backup notebook closed and the controlling source before classifying status." },
          { id: "i2", label: "Treat the tablet screen as the complete assessment and do not compare the manual backup notebook closed, patient report, or current record. This identify option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document encounter, data, actions, limitations, and follow-up." },
          { id: "i3", label: "Carry forward the prior visit conclusion for document encounter, data, actions, limitations, and follow-up without reassessing the patient today. This identify option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about tablet screen." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Proceed using the tablet screen alone and seek clarification only after the intervention is complete. This decide option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for tablet screen is resolved." },
          { id: "d3", label: "Defer the concern in the tablet screen to the next routine visit even though its current clinical significance has not been assessed. This decide option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document encounter, data, actions, limitations, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For tablet screen, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For tablet screen, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Chart only that the tablet screen was checked, without the actual finding, clinical meaning, action, response, or notification. This document option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of tablet screen." },
          { id: "doc3", label: "Keep the tablet screen decision in personal notes rather than the governed patient record. This document option concerns tablet screen during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document encounter, data, actions, limitations, and follow-up." },
        ],
        feedback: {
          observed: "Observe the tablet screen as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the manual backup notebook closed, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the tablet screen as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the manual backup notebook closed, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For tablet screen, compare the visible evidence with manual backup notebook closed and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to tablet screen; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For tablet screen, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "manual-backup-notebook-closed-7-2", label: "manual backup notebook closed", shortLabel: "manual backup notebook closed", ariaLabel: "Investigate manual backup notebook closed",        x: 37, y: 65, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "Observe the manual backup notebook closed as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the battery router, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For manual backup notebook closed, compare the visible evidence with battery router and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the manual backup notebook closed as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the battery router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For manual backup notebook closed, compare the visible evidence with battery router and the controlling source before classifying status." },
          { id: "i2", label: "Assume the manual backup notebook closed establishes a universal rule for every patient and omit the individualized order or baseline. This identify option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document encounter, data, actions, limitations, and follow-up." },
          { id: "i3", label: "Dismiss the conflict between the manual backup notebook closed and battery router because one source appears more convenient. This identify option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about manual backup notebook closed." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to manual backup notebook closed; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to manual backup notebook closed; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Change the treatment, medication, device setting, or plan based on the manual backup notebook closed without confirming an applicable order and patient-specific authority. This decide option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for manual backup notebook closed is resolved." },
          { id: "d3", label: "Hand the manual backup notebook closed concern to an unrelated team member without closed-loop communication or retained RN accountability. This decide option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document encounter, data, actions, limitations, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For manual backup notebook closed, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For manual backup notebook closed, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Document the expected outcome for the manual backup notebook closed before reassessment confirms the patient response. This document option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of manual backup notebook closed." },
          { id: "doc3", label: "Copy the prior document encounter, data, actions, limitations, and follow-up narrative even though today’s manual backup notebook closed evidence is different. This document option concerns manual backup notebook closed during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document encounter, data, actions, limitations, and follow-up." },
        ],
        feedback: {
          observed: "Observe the manual backup notebook closed as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the battery router, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the manual backup notebook closed as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the battery router, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For manual backup notebook closed, compare the visible evidence with battery router and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to manual backup notebook closed; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For manual backup notebook closed, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
      {
        id: "battery-router-7-3", label: "battery router", shortLabel: "battery router", ariaLabel: "Investigate battery router",        x: 77, y: 41, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "Observe the battery router as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
        identifyChoices: [
          { id: "i1", label: "Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For battery router, compare the visible evidence with tablet screen and the controlling source before classifying status.", correct: true, rationale: "Correct. Observe the battery router as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For battery router, compare the visible evidence with tablet screen and the controlling source before classifying status." },
          { id: "i2", label: "Focus only on a reassuring feature of the battery router and omit the related change, symptom, or safety cue. This identify option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "This omits patient-specific reassessment or corroboration required for document encounter, data, actions, limitations, and follow-up." },
          { id: "i3", label: "Let a blank, unreadable, or unverified battery router stand in for direct RN assessment. This identify option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Use direct assessment, current orders, and controlled documentation rather than an assumption about battery router." },
        ],
        decideChoices: [
          { id: "d1", label: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to battery router; keep the exception visible until the assigned owner verifies the required result.", correct: true, rationale: "Correct. Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to battery router; keep the exception visible until the assigned owner verifies the required result." },
          { id: "d2", label: "Close the battery router issue when a message is sent, without confirming receipt, response, and patient outcome. This decide option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "That response acts before the clinical discrepancy, order, patient response, or competency boundary for battery router is resolved." },
          { id: "d3", label: "Use a familiar local shortcut for document encounter, data, actions, limitations, and follow-up instead of the current controlled clinical pathway. This decide option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The RN retains patient-specific assessment, escalation, and closed-loop responsibility during document encounter, data, actions, limitations, and follow-up." },
        ],
        documentChoices: [
          { id: "doc1", label: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For battery router, retain the evidence needed to reconstruct why the status changed.", correct: true, rationale: "Correct. Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For battery router, retain the evidence needed to reconstruct why the status changed." },
          { id: "doc2", label: "Record a generic normal finding for the battery router and omit the discrepancy with tablet screen. This document option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of battery router." },
          { id: "doc3", label: "Combine the battery router issue with unrelated tasks so the decision, communication, and next owner cannot be reconstructed. This document option concerns battery router during document encounter, data, actions, limitations, and follow-up.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for document encounter, data, actions, limitations, and follow-up." },
        ],
        feedback: {
          observed: "Observe the battery router as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting.",
          meaning: "Observe the battery router as patient-specific evidence for document encounter, data, actions, limitations, and follow-up. Compare it with the tablet screen, the current order or plan of care, and the controlled clinical record before acting. Identify the current patient-specific finding for document encounter, data, actions, limitations, and follow-up, reconcile the three scene objects with direct assessment and controlled documentation, and keep any discrepancy visible. For battery router, compare the visible evidence with tablet screen and the controlling source before classifying status.",
          action: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Apply that decision specifically to battery router; keep the exception visible until the assigned owner verifies the required result.",
          notify: "Notify the appropriate provider, clinical supervisor, emergency service, pharmacist, therapist, privacy or quality role according to the patient-specific finding and current agency pathway. Use closed-loop communication and do not leave a material risk without a named owner.",
          document: "Document the assessment evidence, skilled clinical reasoning, decision, intervention, patient response, communication, unresolved risk, and next responsible owner for document encounter, data, actions, limitations, and follow-up. For battery router, retain the evidence needed to reconstruct why the status changed.",
          policyRefs: ["CL-SD-009","CL-CP-001","IT-SC-001","CO-HP-002","42 CFR § 484.60","42 CFR §484.110","42 CFR §484.55","42 CFR §484.60","42 CFR §484.75","42 CFR §484.80","42 CFR § 484.60(a)","42 CFR § 424.22"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During determine ordered telehealth/rpm suitability and consent, the small Wi-Fi router conflicts with the tablet and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Defer the concern in the small Wi-Fi router to the next routine visit even though its current clinical significance has not been assessed. This option concerns determine ordered telehealth/rpm suitability and consent.",
      "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Proceed using the small Wi-Fi router alone and seek clarification only after the intervention is complete. This option concerns determine ordered telehealth/rpm suitability and consent.",
      "Assume the tablet is unchanged from the prior encounter and omit patient-specific reassessment during determine ordered telehealth/rpm suitability and consent.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for determine ordered telehealth/rpm suitability and consent within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 2,
    stem: "During verify identity, privacy, device, connectivity, and data source, the Wi-Fi router conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Change the treatment, medication, device setting, or plan based on the Wi-Fi router without confirming an applicable order and patient-specific authority. This option concerns verify identity, privacy, device, connectivity, and data source.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during verify identity, privacy, device, connectivity, and data source.",
      "Hand the Wi-Fi router concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns verify identity, privacy, device, connectivity, and data source.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for verify identity, privacy, device, connectivity, and data source within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 3,
    stem: "During collect and validate remote vital signs and symptom reports, the charging cable partly disconnected conflicts with the pulse oximeter display and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Use a familiar local shortcut for collect and validate remote vital signs and symptom reports instead of the current controlled clinical pathway. This option concerns collect and validate remote vital signs and symptom reports.",
      "Assume the pulse oximeter display is unchanged from the prior encounter and omit patient-specific reassessment during collect and validate remote vital signs and symptom reports.",
      "Close the charging cable partly disconnected issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns collect and validate remote vital signs and symptom reports.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for collect and validate remote vital signs and symptom reports within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 4,
    stem: "During interpret trends within plan-of-care parameters, the symptom call button conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during interpret trends within plan-of-care parameters.",
      "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the symptom call button to the next routine visit even though its current clinical significance has not been assessed. This option concerns interpret trends within plan-of-care parameters.",
      "Proceed using the symptom call button alone and seek clarification only after the intervention is complete. This option concerns interpret trends within plan-of-care parameters.",
    ],
    correct: 1,
    rationale: "Choose the safest patient-specific action for interpret trends within plan-of-care parameters within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 5,
    stem: "During respond to threshold alerts and failed transmissions, the blood-pressure cuff conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during respond to threshold alerts and failed transmissions.",
      "Hand the blood-pressure cuff concern to an unrelated team member without closed-loop communication or retained RN accountability. This option concerns respond to threshold alerts and failed transmissions.",
      "Change the treatment, medication, device setting, or plan based on the blood-pressure cuff without confirming an applicable order and patient-specific authority. This option concerns respond to threshold alerts and failed transmissions.",
      "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for respond to threshold alerts and failed transmissions within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 6,
    stem: "During escalate urgent findings and convert to in-person or emergency care, the Wi-Fi router conflicts with the tablet screen angled away from window and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Use a familiar local shortcut for escalate urgent findings and convert to in-person or emergency care instead of the current controlled clinical pathway. This option concerns escalate urgent findings and convert to in-person or emergency care.",
      "Assume the tablet screen angled away from window is unchanged from the prior encounter and omit patient-specific reassessment during escalate urgent findings and convert to in-person or emergency care.",
      "Close the Wi-Fi router issue when a message is sent, without confirming receipt, response, and patient outcome. This option concerns escalate urgent findings and convert to in-person or emergency care.",
      "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
    ],
    correct: 3,
    rationale: "Choose the safest patient-specific action for escalate urgent findings and convert to in-person or emergency care within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 7,
    stem: "During document encounter, data, actions, limitations, and follow-up, the battery router conflicts with the tablet screen and the current record. Which RN response best protects the patient and the clinical evidence chain?",
    options: [
      "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary.",
      "Defer the concern in the battery router to the next routine visit even though its current clinical significance has not been assessed. This option concerns document encounter, data, actions, limitations, and follow-up.",
      "Proceed using the battery router alone and seek clarification only after the intervention is complete. This option concerns document encounter, data, actions, limitations, and follow-up.",
      "Assume the tablet screen is unchanged from the prior encounter and omit patient-specific reassessment during document encounter, data, actions, limitations, and follow-up.",
    ],
    correct: 0,
    rationale: "Choose the safest patient-specific action for document encounter, data, actions, limitations, and follow-up within current orders, RN scope, agency policy, and validated competency; pause and escalate any unresolved risk or authority boundary. Controlled sources for this module include CL-SD-009, CL-CP-001, IT-SC-001, CO-HP-002.",
  },
  {
    id: 8,
    stem: "How should 42 CFR § 484.60 be used when applying Telehealth & Remote Patient Monitoring?",
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
    stem: "What connects the tablet screen and Wi-Fi router into defensible RN practice for Telehealth & Remote Patient Monitoring?",
    options: [
      "A verbal assumption that another discipline will address every unresolved issue.",
      "A familiar device display accepted without technique or context validation.",
      "A patient-specific assessment, current order and plan linkage, skilled reasoning, closed-loop communication, reassessment, and traceable documentation.",
      "A copied prior note that avoids documenting today’s conflicting findings.",
    ],
    correct: 2,
    rationale: "Cross-lesson synthesis requires a reconstructable patient-specific clinical chain.",
  },
  {
    id: 10,
    stem: "What does successful completion of Telehealth & Remote Patient Monitoring establish?",
    options: [
      "Automatic authority to perform every activity discussed in Telehealth & Remote Patient Monitoring without supervision.",
      "Knowledge of the controlled RN concepts in Telehealth & Remote Patient Monitoring, while appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate.",
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


const STORAGE_KEY = 'rn-013-progress-v6000';

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

export default function RN013() {
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
          <span className="brand-text">RN-013 — Telehealth</span>
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
