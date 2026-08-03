import './assets.d.ts';
/**
 * DON-005 — Plan of Care Management
 * Canonical DON Pass 5 module from repository-root ONBOARDINGARCH v2.4 §3.3 and controlled policies.
 * Gold interaction shell: RN-001 Pass 5 corrected segmented panel.
 * Knowledge completion is separate from appointment, delegation, observed competency, legal sign-off, and independent-practice authorization.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Compass, Eye, FileText, MessageSquare, RotateCcw,
  ShieldCheck, Sparkles, X, XCircle,
} from 'lucide-react';
import img01 from './assets/don-005/don-005-lesson-01.png';
import img02 from './assets/don-005/don-005-lesson-02.png';
import img03 from './assets/don-005/don-005-lesson-03.png';
import img04 from './assets/don-005/don-005-lesson-04.png';
import img05 from './assets/don-005/don-005-lesson-05.png';
import img06 from './assets/don-005/don-005-lesson-06.png';
import img07 from './assets/don-005/don-005-lesson-07.png';

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

const MODULE_META = { id: "DON-005", title: "Plan of Care Management", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health DON leadership scene for Plan-of-care governance and assessment synthesis, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Individualized goals, interventions, frequency, and duration, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Physician orders, verbal orders, and authentication controls, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Implementation across disciplines and patient education, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Review, update, recertification, and change-in-condition response, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Order tracking, unresolved signatures, and escalation, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Plan-of-care audit, variance closure, and leadership reporting, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Plan-of",
    title: "Plan-of-care governance and assessment synthesis",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for plan-of-care governance and assessment synthesis within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-008 (Recertification Assessment and Plan of Care Transmission), CL-CP-001 (Initiating the Plan of Care Process at Start of Care), CL-CP-002 (Recertification Plan of Care Review), CL-CP-002 (Mid-Episode Plan of Care Modification (Significant Change)), CL-CP-008 (5. Definitions). These sources are presented as a governed control map rather than pasted policy tables. For plan-of-care governance, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For assessment synthesis, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for plan-of-care governance and assessment synthesis centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to plan-of-care governance and assessment synthesis. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for plan-of-care governance and assessment synthesis should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for plan-of-care governance and assessment synthesis, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Plan-of-care Care-plan Folder", detail: "The plan-of-care care-plan folder contains two conflicting versions with neither identified as current. Verify it against the assessment unsigned provider-order form and current source before acting." },
      { icon: "🧭", title: "Assessment Unsigned Provider-order Form", detail: "The assessment unsigned provider-order form uses a superseded approval block. Verify it against the exception visit-frequency calendar and current source before acting." },
      { icon: "🛡️", title: "Exception Visit-frequency Calendar", detail: "The exception visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the plan-of-care care-plan folder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "plan-of-care-care-plan-folder-1-1", label: "plan-of-care care-plan folder", shortLabel: "plan-of-care care-plan folder", ariaLabel: "Investigate plan-of-care care-plan folder",        x: 24, y: 39, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "The photographed plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. The adjacent assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis, while the assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. The adjacent assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis, while the assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat plan-of-care care-plan folder as complete proof without comparing assessment unsigned provider-order form or the controlled source. This identify option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care governance and assessment synthesis." },
          { id: "i3", label: "Classify the plan-of-care care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about plan-of-care care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from plan-of-care care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for plan-of-care care-plan folder is resolved." },
          { id: "d3", label: "Send plan-of-care care-plan folder to an unrelated department rather than the policy owner responsible for plan-of-care governance and assessment synthesis. This decide option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care governance and assessment synthesis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder, record the exact visible discrepancy, the conflicting assessment unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder, record the exact visible discrepancy, the conflicting assessment unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that plan-of-care care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of plan-of-care care-plan folder." },
          { id: "doc3", label: "Keep the plan-of-care care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns plan-of-care care-plan folder during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care governance and assessment synthesis." },
        ],
        feedback: {
          observed: "The photographed plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. The adjacent assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. The adjacent assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis, while the assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care governance and assessment synthesis, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder, record the exact visible discrepancy, the conflicting assessment unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "assessment-unsigned-provider-order-form-1-2", label: "assessment unsigned provider-order form", shortLabel: "assessment unsigned", ariaLabel: "Investigate assessment unsigned provider-order form",        x: 37, y: 65, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "The photographed assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. The adjacent exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis, while the exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. The adjacent exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis, while the exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume assessment unsigned provider-order form applies to every role, patient, location, and exception described in plan-of-care governance and assessment synthesis. This identify option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care governance and assessment synthesis." },
          { id: "i3", label: "Use the oldest available assessment unsigned provider-order form because prior approval is easier to confirm. This identify option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about assessment unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the assessment unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the assessment unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in assessment unsigned provider-order form remains unresolved. This decide option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for assessment unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to assessment unsigned provider-order form. This decide option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care governance and assessment synthesis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For assessment unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For assessment unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark assessment unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of assessment unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of assessment unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns assessment unsigned provider-order form during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care governance and assessment synthesis." },
        ],
        feedback: {
          observed: "The photographed assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. The adjacent exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. The adjacent exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis, while the exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the assessment unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care governance and assessment synthesis, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For assessment unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "exception-visit-frequency-calendar-1-3", label: "exception visit-frequency calendar", shortLabel: "exception visit-frequency", ariaLabel: "Investigate exception visit-frequency calendar",        x: 79, y: 50, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "The photographed exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. The adjacent plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis, while the plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. The adjacent plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis, while the plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception visit-frequency calendar only for favorable indicators and omit the exception evidence connected to plan-of-care care-plan folder. This identify option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care governance and assessment synthesis." },
          { id: "i3", label: "Treat an unsigned or unverified exception visit-frequency calendar as equivalent to the current controlled record. This identify option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the exception visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care governance and assessment synthesis." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception visit-frequency calendar." },
          { id: "doc3", label: "Combine exception visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception visit-frequency calendar during plan-of-care governance and assessment synthesis.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care governance and assessment synthesis." },
        ],
        feedback: {
          observed: "The photographed exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. The adjacent plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis. The adjacent plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care governance and assessment synthesis, while the plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care governance and assessment synthesis, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care governance and assessment synthesis, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care governance and assessment synthesis, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Individ",
    title: "Individualized goals, interventions, frequency, and duration",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for individualized goals, interventions, frequency, and duration within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-001 (Required Elements of the Plan of Care), CL-CP-001 (5. Definitions), CL-CP-002 (5. Definitions), CL-CP-001 (Patient and Caregiver Engagement in Plan of Care), CL-CP-001 (What Surveyors and Auditors Will Look For). These sources are presented as a governed control map rather than pasted policy tables. For individualized goals, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For interventions, confirm that an operational practice does not silently expand beyond its approved scope. For frequency, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for individualized goals, interventions, frequency, and duration centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to individualized goals, interventions, frequency, and duration. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for individualized goals, interventions, frequency, and duration should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for individualized goals, interventions, frequency, and duration, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Individualized Unsigned Provider-order Form", detail: "The individualized unsigned provider-order form uses a superseded approval block. Verify it against the interventions visit-frequency calendar and current source before acting." },
      { icon: "🧭", title: "Interventions Visit-frequency Calendar", detail: "The interventions visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the frequency care-plan folder and current source before acting." },
      { icon: "🛡️", title: "Frequency Care-plan Folder", detail: "The frequency care-plan folder contains two conflicting versions with neither identified as current. Verify it against the individualized unsigned provider-order form and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 484.60(a)" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "individualized-unsigned-provider-order-form-2-1", label: "individualized unsigned provider-order form", shortLabel: "individualized unsigned", ariaLabel: "Investigate individualized unsigned provider-order form",        x: 15, y: 68, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "The photographed individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. The adjacent interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration, while the interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. The adjacent interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration, while the interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume individualized unsigned provider-order form applies to every role, patient, location, and exception described in individualized goals, interventions, frequency, and duration. This identify option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "This omits controlled-source verification or corroboration required for individualized goals, interventions, frequency, and duration." },
          { id: "i3", label: "Use the oldest available individualized unsigned provider-order form because prior approval is easier to confirm. This identify option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about individualized unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the individualized unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the individualized unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in individualized unsigned provider-order form remains unresolved. This decide option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for individualized unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to individualized unsigned provider-order form. This decide option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during individualized goals, interventions, frequency, and duration." },
        ],
        documentChoices: [
          { id: "doc1", label: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For individualized unsigned provider-order form, record the exact visible discrepancy, the conflicting interventions visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For individualized unsigned provider-order form, record the exact visible discrepancy, the conflicting interventions visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark individualized unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of individualized unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of individualized unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns individualized unsigned provider-order form during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for individualized goals, interventions, frequency, and duration." },
        ],
        feedback: {
          observed: "The photographed individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. The adjacent interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. The adjacent interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration, while the interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the individualized unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For individualized goals, interventions, frequency, and duration, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For individualized unsigned provider-order form, record the exact visible discrepancy, the conflicting interventions visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "interventions-visit-frequency-calendar-2-2", label: "interventions visit-frequency calendar", shortLabel: "interventions visit-frequency", ariaLabel: "Investigate interventions visit-frequency calendar",        x: 33, y: 40, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "The photographed interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. The adjacent frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration, while the frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. The adjacent frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration, while the frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read interventions visit-frequency calendar only for favorable indicators and omit the exception evidence connected to frequency care-plan folder. This identify option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "This omits controlled-source verification or corroboration required for individualized goals, interventions, frequency, and duration." },
          { id: "i3", label: "Treat an unsigned or unverified interventions visit-frequency calendar as equivalent to the current controlled record. This identify option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about interventions visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interventions visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interventions visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close interventions visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for interventions visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the interventions visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during individualized goals, interventions, frequency, and duration." },
        ],
        documentChoices: [
          { id: "doc1", label: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For interventions visit-frequency calendar, record the exact visible discrepancy, the conflicting frequency care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For interventions visit-frequency calendar, record the exact visible discrepancy, the conflicting frequency care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for interventions visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of interventions visit-frequency calendar." },
          { id: "doc3", label: "Combine interventions visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns interventions visit-frequency calendar during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for individualized goals, interventions, frequency, and duration." },
        ],
        feedback: {
          observed: "The photographed interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. The adjacent frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration. The adjacent frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration, while the frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interventions visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For individualized goals, interventions, frequency, and duration, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For interventions visit-frequency calendar, record the exact visible discrepancy, the conflicting frequency care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "frequency-care-plan-folder-2-3", label: "frequency care-plan folder", shortLabel: "frequency care-plan folder", ariaLabel: "Investigate frequency care-plan folder",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "The photographed frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. The adjacent individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration, while the individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. The adjacent individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration, while the individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat frequency care-plan folder as complete proof without comparing individualized unsigned provider-order form or the controlled source. This identify option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "This omits controlled-source verification or corroboration required for individualized goals, interventions, frequency, and duration." },
          { id: "i3", label: "Classify the frequency care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about frequency care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the frequency care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the frequency care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from frequency care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for frequency care-plan folder is resolved." },
          { id: "d3", label: "Send frequency care-plan folder to an unrelated department rather than the policy owner responsible for individualized goals, interventions, frequency, and duration. This decide option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during individualized goals, interventions, frequency, and duration." },
        ],
        documentChoices: [
          { id: "doc1", label: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For frequency care-plan folder, record the exact visible discrepancy, the conflicting individualized unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For frequency care-plan folder, record the exact visible discrepancy, the conflicting individualized unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that frequency care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of frequency care-plan folder." },
          { id: "doc3", label: "Keep the frequency care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns frequency care-plan folder during individualized goals, interventions, frequency, and duration.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for individualized goals, interventions, frequency, and duration." },
        ],
        feedback: {
          observed: "The photographed frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. The adjacent individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. The adjacent individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration, while the individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the frequency care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For individualized goals, interventions, frequency, and duration, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For individualized goals, interventions, frequency, and duration, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For frequency care-plan folder, record the exact visible discrepancy, the conflicting individualized unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Physici",
    title: "Physician orders, verbal orders, and authentication controls",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for physician orders, verbal orders, and authentication controls within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-003 (Obtaining Physician Orders — General Requirements), CL-CP-004 (LVN Limitations on Verbal Orders), CL-CP-003 (Verbal Order Authentication), CL-CP-004 (Authentication Tracking and Follow-Up), CL-CP-004 (Verbal Order Receipt — Read-Back Protocol). These sources are presented as a governed control map rather than pasted policy tables. For physician orders, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For verbal orders, confirm that an operational practice does not silently expand beyond its approved scope. For authentication controls, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for physician orders, verbal orders, and authentication controls centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to physician orders, verbal orders, and authentication controls. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for physician orders, verbal orders, and authentication controls should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for physician orders, verbal orders, and authentication controls, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Physician Visit-frequency Calendar", detail: "The physician visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the verbal care-plan folder and current source before acting." },
      { icon: "🧭", title: "Verbal Care-plan Folder", detail: "The verbal care-plan folder contains two conflicting versions with neither identified as current. Verify it against the authentication unsigned provider-order form and current source before acting." },
      { icon: "🛡️", title: "Authentication Unsigned Provider-order Form", detail: "The authentication unsigned provider-order form uses a superseded approval block. Verify it against the physician visit-frequency calendar and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 424.22" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "physician-visit-frequency-calendar-3-1", label: "physician visit-frequency calendar", shortLabel: "physician visit-frequency", ariaLabel: "Investigate physician visit-frequency calendar",        x: 20, y: 48, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "The photographed physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. The adjacent verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls, while the verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. The adjacent verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls, while the verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read physician visit-frequency calendar only for favorable indicators and omit the exception evidence connected to verbal care-plan folder. This identify option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "This omits controlled-source verification or corroboration required for physician orders, verbal orders, and authentication controls." },
          { id: "i3", label: "Treat an unsigned or unverified physician visit-frequency calendar as equivalent to the current controlled record. This identify option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about physician visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the physician visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the physician visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close physician visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for physician visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the physician visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during physician orders, verbal orders, and authentication controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For physician visit-frequency calendar, record the exact visible discrepancy, the conflicting verbal care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For physician visit-frequency calendar, record the exact visible discrepancy, the conflicting verbal care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for physician visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of physician visit-frequency calendar." },
          { id: "doc3", label: "Combine physician visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns physician visit-frequency calendar during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for physician orders, verbal orders, and authentication controls." },
        ],
        feedback: {
          observed: "The photographed physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. The adjacent verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. The adjacent verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls, while the verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the physician visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For physician orders, verbal orders, and authentication controls, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For physician visit-frequency calendar, record the exact visible discrepancy, the conflicting verbal care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "verbal-care-plan-folder-3-2", label: "verbal care-plan folder", shortLabel: "verbal care-plan folder", ariaLabel: "Investigate verbal care-plan folder",        x: 42, y: 42, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "The photographed verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. The adjacent authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls, while the authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. The adjacent authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls, while the authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat verbal care-plan folder as complete proof without comparing authentication unsigned provider-order form or the controlled source. This identify option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "This omits controlled-source verification or corroboration required for physician orders, verbal orders, and authentication controls." },
          { id: "i3", label: "Classify the verbal care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about verbal care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the verbal care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the verbal care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from verbal care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for verbal care-plan folder is resolved." },
          { id: "d3", label: "Send verbal care-plan folder to an unrelated department rather than the policy owner responsible for physician orders, verbal orders, and authentication controls. This decide option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during physician orders, verbal orders, and authentication controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For verbal care-plan folder, record the exact visible discrepancy, the conflicting authentication unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For verbal care-plan folder, record the exact visible discrepancy, the conflicting authentication unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that verbal care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of verbal care-plan folder." },
          { id: "doc3", label: "Keep the verbal care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns verbal care-plan folder during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for physician orders, verbal orders, and authentication controls." },
        ],
        feedback: {
          observed: "The photographed verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. The adjacent authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls. The adjacent authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The verbal care-plan folder contains two conflicting versions with neither identified as current for physician orders, verbal orders, and authentication controls, while the authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the verbal care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For physician orders, verbal orders, and authentication controls, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For verbal care-plan folder, record the exact visible discrepancy, the conflicting authentication unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "authentication-unsigned-provider-order-form-3-3", label: "authentication unsigned provider-order form", shortLabel: "authentication unsigned", ariaLabel: "Investigate authentication unsigned provider-order form",        x: 74, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "The photographed authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. The adjacent physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls, while the physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. The adjacent physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls, while the physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume authentication unsigned provider-order form applies to every role, patient, location, and exception described in physician orders, verbal orders, and authentication controls. This identify option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "This omits controlled-source verification or corroboration required for physician orders, verbal orders, and authentication controls." },
          { id: "i3", label: "Use the oldest available authentication unsigned provider-order form because prior approval is easier to confirm. This identify option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about authentication unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authentication unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authentication unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in authentication unsigned provider-order form remains unresolved. This decide option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for authentication unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to authentication unsigned provider-order form. This decide option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during physician orders, verbal orders, and authentication controls." },
        ],
        documentChoices: [
          { id: "doc1", label: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For authentication unsigned provider-order form, record the exact visible discrepancy, the conflicting physician visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For authentication unsigned provider-order form, record the exact visible discrepancy, the conflicting physician visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark authentication unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of authentication unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of authentication unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns authentication unsigned provider-order form during physician orders, verbal orders, and authentication controls.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for physician orders, verbal orders, and authentication controls." },
        ],
        feedback: {
          observed: "The photographed authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. The adjacent physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls. The adjacent physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls, while the physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For physician orders, verbal orders, and authentication controls, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authentication unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For physician orders, verbal orders, and authentication controls, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For physician orders, verbal orders, and authentication controls, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For authentication unsigned provider-order form, record the exact visible discrepancy, the conflicting physician visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Impleme",
    title: "Implementation across disciplines and patient education",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for implementation across disciplines and patient education within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-001 (Patient and Caregiver Engagement in Plan of Care), CL-CP-001 (Initiating the Plan of Care Process at Start of Care), CL-CP-001 (4. Policy Statement), CL-CP-001 (5. Definitions), CL-CP-001 (Multidisciplinary Coordination in Plan of Care Development). These sources are presented as a governed control map rather than pasted policy tables. For implementation across disciplines, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For patient education, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for implementation across disciplines and patient education centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to implementation across disciplines and patient education. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for implementation across disciplines and patient education should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for implementation across disciplines and patient education, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Implementation Care-plan Folder", detail: "The implementation care-plan folder contains two conflicting versions with neither identified as current. Verify it against the patient unsigned provider-order form and current source before acting." },
      { icon: "🧭", title: "Patient Unsigned Provider-order Form", detail: "The patient unsigned provider-order form uses a superseded approval block. Verify it against the exception visit-frequency calendar L4 and current source before acting." },
      { icon: "🛡️", title: "Exception Visit-frequency Calendar L4", detail: "The exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received. Verify it against the implementation care-plan folder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 409.42(a)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "implementation-care-plan-folder-4-1", label: "implementation care-plan folder", shortLabel: "implementation care-plan", ariaLabel: "Investigate implementation care-plan folder",        x: 19, y: 40, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "The photographed implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. The adjacent patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education, while the patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. The adjacent patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education, while the patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat implementation care-plan folder as complete proof without comparing patient unsigned provider-order form or the controlled source. This identify option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "This omits controlled-source verification or corroboration required for implementation across disciplines and patient education." },
          { id: "i3", label: "Classify the implementation care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about implementation care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the implementation care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the implementation care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from implementation care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for implementation care-plan folder is resolved." },
          { id: "d3", label: "Send implementation care-plan folder to an unrelated department rather than the policy owner responsible for implementation across disciplines and patient education. This decide option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during implementation across disciplines and patient education." },
        ],
        documentChoices: [
          { id: "doc1", label: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For implementation care-plan folder, record the exact visible discrepancy, the conflicting patient unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For implementation care-plan folder, record the exact visible discrepancy, the conflicting patient unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that implementation care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of implementation care-plan folder." },
          { id: "doc3", label: "Keep the implementation care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns implementation care-plan folder during implementation across disciplines and patient education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation across disciplines and patient education." },
        ],
        feedback: {
          observed: "The photographed implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. The adjacent patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. The adjacent patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education, while the patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the implementation care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For implementation across disciplines and patient education, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For implementation care-plan folder, record the exact visible discrepancy, the conflicting patient unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "patient-unsigned-provider-order-form-4-2", label: "patient unsigned provider-order form", shortLabel: "patient unsigned", ariaLabel: "Investigate patient unsigned provider-order form",        x: 48, y: 69, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "The photographed patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. The adjacent exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education, while the exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. The adjacent exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education, while the exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume patient unsigned provider-order form applies to every role, patient, location, and exception described in implementation across disciplines and patient education. This identify option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "This omits controlled-source verification or corroboration required for implementation across disciplines and patient education." },
          { id: "i3", label: "Use the oldest available patient unsigned provider-order form because prior approval is easier to confirm. This identify option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about patient unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in patient unsigned provider-order form remains unresolved. This decide option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for patient unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to patient unsigned provider-order form. This decide option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during implementation across disciplines and patient education." },
        ],
        documentChoices: [
          { id: "doc1", label: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For patient unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar L4, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For patient unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar L4, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark patient unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of patient unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns patient unsigned provider-order form during implementation across disciplines and patient education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation across disciplines and patient education." },
        ],
        feedback: {
          observed: "The photographed patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. The adjacent exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. The adjacent exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education, while the exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For implementation across disciplines and patient education, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For patient unsigned provider-order form, record the exact visible discrepancy, the conflicting exception visit-frequency calendar L4, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "exception-visit-frequency-calendar-l4-4-3", label: "exception visit-frequency calendar L4", shortLabel: "exception visit-frequency", ariaLabel: "Investigate exception visit-frequency calendar L4",        x: 86, y: 54, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "The photographed exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. The adjacent implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education, while the implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. The adjacent implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education, while the implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception visit-frequency calendar L4 only for favorable indicators and omit the exception evidence connected to implementation care-plan folder. This identify option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "This omits controlled-source verification or corroboration required for implementation across disciplines and patient education." },
          { id: "i3", label: "Treat an unsigned or unverified exception visit-frequency calendar L4 as equivalent to the current controlled record. This identify option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception visit-frequency calendar L4." },
        ],
        decideChoices: [
          { id: "d1", label: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar L4 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar L4 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception visit-frequency calendar L4 when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception visit-frequency calendar L4 is resolved." },
          { id: "d3", label: "Defer the exception visit-frequency calendar L4 decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during implementation across disciplines and patient education." },
        ],
        documentChoices: [
          { id: "doc1", label: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar L4, record the exact visible discrepancy, the conflicting implementation care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar L4, record the exact visible discrepancy, the conflicting implementation care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception visit-frequency calendar L4 but omit the actual evidence, communications, and unresolved items. This document option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception visit-frequency calendar L4." },
          { id: "doc3", label: "Combine exception visit-frequency calendar L4 with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception visit-frequency calendar L4 during implementation across disciplines and patient education.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for implementation across disciplines and patient education." },
        ],
        feedback: {
          observed: "The photographed exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. The adjacent implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education. The adjacent implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception visit-frequency calendar L4 marks follow-up complete before the required evidence was received for implementation across disciplines and patient education, while the implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For implementation across disciplines and patient education, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception visit-frequency calendar L4 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For implementation across disciplines and patient education, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For exception visit-frequency calendar L4, record the exact visible discrepancy, the conflicting implementation care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Review",
    title: "Review, update, recertification, and change-in-condition response",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for review, update, recertification, and change-in-condition response within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-002 (Routine 30-Day Plan of Care Review), CL-CP-002 (Recertification Plan of Care Review), CL-CP-008 (Recertification Assessment and Plan of Care Transmission), CL-CP-008 (Recertification Tracking and Alerting), CL-CP-008 (Recertification Documentation and Filing). These sources are presented as a governed control map rather than pasted policy tables. For review, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For update, confirm that an operational practice does not silently expand beyond its approved scope. For recertification, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for review, update, recertification, and change-in-condition response centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to review, update, recertification, and change-in-condition response. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for review, update, recertification, and change-in-condition response should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for review, update, recertification, and change-in-condition response, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Review Unsigned Provider-order Form", detail: "The review unsigned provider-order form uses a superseded approval block. Verify it against the update visit-frequency calendar and current source before acting." },
      { icon: "🧭", title: "Update Visit-frequency Calendar", detail: "The update visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the recertification care-plan folder and current source before acting." },
      { icon: "🛡️", title: "Recertification Care-plan Folder", detail: "The recertification care-plan folder contains two conflicting versions with neither identified as current. Verify it against the review unsigned provider-order form and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "review-unsigned-provider-order-form-5-1", label: "review unsigned provider-order form", shortLabel: "review unsigned", ariaLabel: "Investigate review unsigned provider-order form",        x: 14, y: 71, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "The photographed review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. The adjacent update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response, while the update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. The adjacent update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response, while the update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume review unsigned provider-order form applies to every role, patient, location, and exception described in review, update, recertification, and change-in-condition response. This identify option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "This omits controlled-source verification or corroboration required for review, update, recertification, and change-in-condition response." },
          { id: "i3", label: "Use the oldest available review unsigned provider-order form because prior approval is easier to confirm. This identify option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about review unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in review unsigned provider-order form remains unresolved. This decide option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for review unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to review unsigned provider-order form. This decide option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during review, update, recertification, and change-in-condition response." },
        ],
        documentChoices: [
          { id: "doc1", label: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For review unsigned provider-order form, record the exact visible discrepancy, the conflicting update visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For review unsigned provider-order form, record the exact visible discrepancy, the conflicting update visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark review unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of review unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of review unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns review unsigned provider-order form during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and change-in-condition response." },
        ],
        feedback: {
          observed: "The photographed review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. The adjacent update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. The adjacent update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response, while the update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the review unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For review, update, recertification, and change-in-condition response, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For review unsigned provider-order form, record the exact visible discrepancy, the conflicting update visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "update-visit-frequency-calendar-5-2", label: "update visit-frequency calendar", shortLabel: "update visit-frequency", ariaLabel: "Investigate update visit-frequency calendar",        x: 31, y: 47, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "The photographed update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. The adjacent recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response, while the recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. The adjacent recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response, while the recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read update visit-frequency calendar only for favorable indicators and omit the exception evidence connected to recertification care-plan folder. This identify option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "This omits controlled-source verification or corroboration required for review, update, recertification, and change-in-condition response." },
          { id: "i3", label: "Treat an unsigned or unverified update visit-frequency calendar as equivalent to the current controlled record. This identify option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about update visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the update visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the update visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close update visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for update visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the update visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during review, update, recertification, and change-in-condition response." },
        ],
        documentChoices: [
          { id: "doc1", label: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For update visit-frequency calendar, record the exact visible discrepancy, the conflicting recertification care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For update visit-frequency calendar, record the exact visible discrepancy, the conflicting recertification care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for update visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of update visit-frequency calendar." },
          { id: "doc3", label: "Combine update visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns update visit-frequency calendar during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and change-in-condition response." },
        ],
        feedback: {
          observed: "The photographed update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. The adjacent recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response. The adjacent recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response, while the recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the update visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For review, update, recertification, and change-in-condition response, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For update visit-frequency calendar, record the exact visible discrepancy, the conflicting recertification care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "recertification-care-plan-folder-5-3", label: "recertification care-plan folder", shortLabel: "recertification care-plan", ariaLabel: "Investigate recertification care-plan folder",        x: 75, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "The photographed recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. The adjacent review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response, while the review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. The adjacent review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response, while the review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat recertification care-plan folder as complete proof without comparing review unsigned provider-order form or the controlled source. This identify option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "This omits controlled-source verification or corroboration required for review, update, recertification, and change-in-condition response." },
          { id: "i3", label: "Classify the recertification care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about recertification care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the recertification care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the recertification care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from recertification care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for recertification care-plan folder is resolved." },
          { id: "d3", label: "Send recertification care-plan folder to an unrelated department rather than the policy owner responsible for review, update, recertification, and change-in-condition response. This decide option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during review, update, recertification, and change-in-condition response." },
        ],
        documentChoices: [
          { id: "doc1", label: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For recertification care-plan folder, record the exact visible discrepancy, the conflicting review unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For recertification care-plan folder, record the exact visible discrepancy, the conflicting review unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that recertification care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of recertification care-plan folder." },
          { id: "doc3", label: "Keep the recertification care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns recertification care-plan folder during review, update, recertification, and change-in-condition response.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for review, update, recertification, and change-in-condition response." },
        ],
        feedback: {
          observed: "The photographed recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. The adjacent review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. The adjacent review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response, while the review unsigned provider-order form uses a superseded approval block for review, update, recertification, and change-in-condition response. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For review, update, recertification, and change-in-condition response, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the recertification care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For review, update, recertification, and change-in-condition response, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For review, update, recertification, and change-in-condition response, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For recertification care-plan folder, record the exact visible discrepancy, the conflicting review unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Order",
    title: "Order tracking, unresolved signatures, and escalation",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for order tracking, unresolved signatures, and escalation within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-003 (Obtaining Physician Orders — General Requirements), CL-CP-004 (Verbal Order Receipt — Read-Back Protocol), CL-CP-003 (Written Order Management), CL-CP-004 (Verbal Order Documentation in the EHR), CL-CP-004 (LVN Limitations on Verbal Orders). These sources are presented as a governed control map rather than pasted policy tables. For order tracking, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For unresolved signatures, confirm that an operational practice does not silently expand beyond its approved scope. For escalation, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for order tracking, unresolved signatures, and escalation centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to order tracking, unresolved signatures, and escalation. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for order tracking, unresolved signatures, and escalation should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for order tracking, unresolved signatures, and escalation, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Order Visit-frequency Calendar", detail: "The order visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the unresolved care-plan folder and current source before acting." },
      { icon: "🧭", title: "Unresolved Care-plan Folder", detail: "The unresolved care-plan folder contains two conflicting versions with neither identified as current. Verify it against the escalation unsigned provider-order form and current source before acting." },
      { icon: "🛡️", title: "Escalation Unsigned Provider-order Form", detail: "The escalation unsigned provider-order form uses a superseded approval block. Verify it against the order visit-frequency calendar and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 484.60(b)" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "order-visit-frequency-calendar-6-1", label: "order visit-frequency calendar", shortLabel: "order visit-frequency calendar", ariaLabel: "Investigate order visit-frequency calendar",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "The photographed order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. The adjacent unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation, while the unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. The adjacent unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation, while the unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read order visit-frequency calendar only for favorable indicators and omit the exception evidence connected to unresolved care-plan folder. This identify option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for order tracking, unresolved signatures, and escalation." },
          { id: "i3", label: "Treat an unsigned or unverified order visit-frequency calendar as equivalent to the current controlled record. This identify option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about order visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the order visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the order visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close order visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for order visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the order visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during order tracking, unresolved signatures, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For order visit-frequency calendar, record the exact visible discrepancy, the conflicting unresolved care-plan folder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For order visit-frequency calendar, record the exact visible discrepancy, the conflicting unresolved care-plan folder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for order visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of order visit-frequency calendar." },
          { id: "doc3", label: "Combine order visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns order visit-frequency calendar during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order tracking, unresolved signatures, and escalation." },
        ],
        feedback: {
          observed: "The photographed order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. The adjacent unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. The adjacent unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation, while the unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the order visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For order tracking, unresolved signatures, and escalation, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For order visit-frequency calendar, record the exact visible discrepancy, the conflicting unresolved care-plan folder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "unresolved-care-plan-folder-6-2", label: "unresolved care-plan folder", shortLabel: "unresolved care-plan folder", ariaLabel: "Investigate unresolved care-plan folder",        x: 44, y: 56, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "The photographed unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. The adjacent escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation, while the escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. The adjacent escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation, while the escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat unresolved care-plan folder as complete proof without comparing escalation unsigned provider-order form or the controlled source. This identify option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for order tracking, unresolved signatures, and escalation." },
          { id: "i3", label: "Classify the unresolved care-plan folder by department custom even though its authority and current status are unverified. This identify option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about unresolved care-plan folder." },
        ],
        decideChoices: [
          { id: "d1", label: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from unresolved care-plan folder alone and seek the authorized owner only after implementation. This decide option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for unresolved care-plan folder is resolved." },
          { id: "d3", label: "Send unresolved care-plan folder to an unrelated department rather than the policy owner responsible for order tracking, unresolved signatures, and escalation. This decide option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during order tracking, unresolved signatures, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For unresolved care-plan folder, record the exact visible discrepancy, the conflicting escalation unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For unresolved care-plan folder, record the exact visible discrepancy, the conflicting escalation unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that unresolved care-plan folder was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of unresolved care-plan folder." },
          { id: "doc3", label: "Keep the unresolved care-plan folder decision in personal notes rather than the governed evidence location. This document option concerns unresolved care-plan folder during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order tracking, unresolved signatures, and escalation." },
        ],
        feedback: {
          observed: "The photographed unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. The adjacent escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation. The adjacent escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The unresolved care-plan folder contains two conflicting versions with neither identified as current for order tracking, unresolved signatures, and escalation, while the escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the unresolved care-plan folder discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For order tracking, unresolved signatures, and escalation, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For unresolved care-plan folder, record the exact visible discrepancy, the conflicting escalation unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "escalation-unsigned-provider-order-form-6-3", label: "escalation unsigned provider-order form", shortLabel: "escalation unsigned", ariaLabel: "Investigate escalation unsigned provider-order form",        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "The photographed escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. The adjacent order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation, while the order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. The adjacent order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation, while the order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume escalation unsigned provider-order form applies to every role, patient, location, and exception described in order tracking, unresolved signatures, and escalation. This identify option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "This omits controlled-source verification or corroboration required for order tracking, unresolved signatures, and escalation." },
          { id: "i3", label: "Use the oldest available escalation unsigned provider-order form because prior approval is easier to confirm. This identify option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about escalation unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in escalation unsigned provider-order form remains unresolved. This decide option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for escalation unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to escalation unsigned provider-order form. This decide option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during order tracking, unresolved signatures, and escalation." },
        ],
        documentChoices: [
          { id: "doc1", label: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For escalation unsigned provider-order form, record the exact visible discrepancy, the conflicting order visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For escalation unsigned provider-order form, record the exact visible discrepancy, the conflicting order visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark escalation unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of escalation unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of escalation unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns escalation unsigned provider-order form during order tracking, unresolved signatures, and escalation.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for order tracking, unresolved signatures, and escalation." },
        ],
        feedback: {
          observed: "The photographed escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. The adjacent order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. The adjacent order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation, while the order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For order tracking, unresolved signatures, and escalation, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For order tracking, unresolved signatures, and escalation, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For order tracking, unresolved signatures, and escalation, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For escalation unsigned provider-order form, record the exact visible discrepancy, the conflicting order visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Plan-of",
    title: "Plan-of-care audit, variance closure, and leadership reporting",
    subtitle: "Plan of Care Management",
    narration: [
      "This lesson develops Director of Nursing judgment for plan-of-care audit, variance closure, and leadership reporting within Plan of Care Management. The leadership objective is an individualized plan of care supported by assessment, orders, coordination, and ongoing review. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CL-CP-001 (8. Compliance & Audit Considerations), CL-CP-002 (8. Compliance & Audit Considerations), CL-CP-003 (8. Compliance & Audit Considerations), CL-CP-004 (8. Compliance & Audit Considerations), CL-CP-008 (What Surveyors and Auditors Will Look For). These sources are presented as a governed control map rather than pasted policy tables. For plan-of-care audit, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For variance closure, confirm that an operational practice does not silently expand beyond its approved scope. For leadership reporting, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for plan-of-care audit, variance closure, and leadership reporting centers on patient goals, interventions, frequency, disciplines, orders, authentication status, changes, and implementation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to plan-of-care audit, variance closure, and leadership reporting. The safe leadership response is to clarify or correct the plan before unsupported care, billing, or closure proceeds. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for plan-of-care audit, variance closure, and leadership reporting should preserve assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for plan-of-care audit, variance closure, and leadership reporting, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Plan-of-care Care-plan Folder L7", detail: "The plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current. Verify it against the variance unsigned provider-order form and current source before acting." },
      { icon: "🧭", title: "Variance Unsigned Provider-order Form", detail: "The variance unsigned provider-order form uses a superseded approval block. Verify it against the reporting visit-frequency calendar and current source before acting." },
      { icon: "🛡️", title: "Reporting Visit-frequency Calendar", detail: "The reporting visit-frequency calendar marks follow-up complete before the required evidence was received. Verify it against the plan-of-care care-plan folder L7 and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CL-CP-001" },
      { kind: "Controlled Policy", text: "CL-CP-002" },
      { kind: "Controlled Policy", text: "CL-CP-003" },
      { kind: "Controlled Policy", text: "CL-CP-004" },
      { kind: "Controlled Policy", text: "CL-CP-008" },
      { kind: "Controlled Policy", text: "CL-CP-009" },
      { kind: "External Authority", text: "42 CFR § 409.42" },
      { kind: "External Authority", text: "42 CFR § 484.55" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "plan-of-care-care-plan-folder-l7-7-1", label: "plan-of-care care-plan folder L7", shortLabel: "plan-of-care care-plan folder", ariaLabel: "Investigate plan-of-care care-plan folder L7",        x: 16, y: 77, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "The photographed plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. The adjacent variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting, while the variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. The adjacent variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting, while the variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat plan-of-care care-plan folder L7 as complete proof without comparing variance unsigned provider-order form or the controlled source. This identify option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care audit, variance closure, and leadership reporting." },
          { id: "i3", label: "Classify the plan-of-care care-plan folder L7 by department custom even though its authority and current status are unverified. This identify option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about plan-of-care care-plan folder L7." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder L7 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder L7 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from plan-of-care care-plan folder L7 alone and seek the authorized owner only after implementation. This decide option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for plan-of-care care-plan folder L7 is resolved." },
          { id: "d3", label: "Send plan-of-care care-plan folder L7 to an unrelated department rather than the policy owner responsible for plan-of-care audit, variance closure, and leadership reporting. This decide option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care audit, variance closure, and leadership reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder L7, record the exact visible discrepancy, the conflicting variance unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder L7, record the exact visible discrepancy, the conflicting variance unsigned provider-order form, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that plan-of-care care-plan folder L7 was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of plan-of-care care-plan folder L7." },
          { id: "doc3", label: "Keep the plan-of-care care-plan folder L7 decision in personal notes rather than the governed evidence location. This document option concerns plan-of-care care-plan folder L7 during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care audit, variance closure, and leadership reporting." },
        ],
        feedback: {
          observed: "The photographed plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. The adjacent variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. The adjacent variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting, while the variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the plan-of-care care-plan folder L7 discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care audit, variance closure, and leadership reporting, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For plan-of-care care-plan folder L7, record the exact visible discrepancy, the conflicting variance unsigned provider-order form, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "variance-unsigned-provider-order-form-7-2", label: "variance unsigned provider-order form", shortLabel: "variance unsigned", ariaLabel: "Investigate variance unsigned provider-order form",        x: 39, y: 67, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "The photographed variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. The adjacent reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting, while the reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. The adjacent reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting, while the reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume variance unsigned provider-order form applies to every role, patient, location, and exception described in plan-of-care audit, variance closure, and leadership reporting. This identify option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care audit, variance closure, and leadership reporting." },
          { id: "i3", label: "Use the oldest available variance unsigned provider-order form because prior approval is easier to confirm. This identify option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about variance unsigned provider-order form." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the variance unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the variance unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in variance unsigned provider-order form remains unresolved. This decide option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for variance unsigned provider-order form is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to variance unsigned provider-order form. This decide option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care audit, variance closure, and leadership reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For variance unsigned provider-order form, record the exact visible discrepancy, the conflicting reporting visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For variance unsigned provider-order form, record the exact visible discrepancy, the conflicting reporting visit-frequency calendar, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark variance unsigned provider-order form closed on assignment, before completion and effectiveness evidence exist. This document option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of variance unsigned provider-order form." },
          { id: "doc3", label: "Retain only a summary of variance unsigned provider-order form and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns variance unsigned provider-order form during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care audit, variance closure, and leadership reporting." },
        ],
        feedback: {
          observed: "The photographed variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. The adjacent reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. The adjacent reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting, while the reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the variance unsigned provider-order form discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care audit, variance closure, and leadership reporting, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For variance unsigned provider-order form, record the exact visible discrepancy, the conflicting reporting visit-frequency calendar, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
      {
        id: "reporting-visit-frequency-calendar-7-3", label: "reporting visit-frequency calendar", shortLabel: "reporting visit-frequency", ariaLabel: "Investigate reporting visit-frequency calendar",        x: 78, y: 43, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "The photographed reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. The adjacent plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting, while the plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. The adjacent plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting, while the plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read reporting visit-frequency calendar only for favorable indicators and omit the exception evidence connected to plan-of-care care-plan folder L7. This identify option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for plan-of-care audit, variance closure, and leadership reporting." },
          { id: "i3", label: "Treat an unsigned or unverified reporting visit-frequency calendar as equivalent to the current controlled record. This identify option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about reporting visit-frequency calendar." },
        ],
        decideChoices: [
          { id: "d1", label: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close reporting visit-frequency calendar when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for reporting visit-frequency calendar is resolved." },
          { id: "d3", label: "Defer the reporting visit-frequency calendar decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during plan-of-care audit, variance closure, and leadership reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For reporting visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder L7, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For reporting visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder L7, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for reporting visit-frequency calendar but omit the actual evidence, communications, and unresolved items. This document option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reporting visit-frequency calendar." },
          { id: "doc3", label: "Combine reporting visit-frequency calendar with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns reporting visit-frequency calendar during plan-of-care audit, variance closure, and leadership reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for plan-of-care audit, variance closure, and leadership reporting." },
        ],
        feedback: {
          observed: "The photographed reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. The adjacent plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting. The adjacent plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting visit-frequency calendar marks follow-up complete before the required evidence was received for plan-of-care audit, variance closure, and leadership reporting, while the plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting. Classify this as an unresolved exception involving an individualized plan of care supported by assessment, orders, coordination, and ongoing review until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For plan-of-care audit, variance closure, and leadership reporting, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting visit-frequency calendar discrepancy, apply the immediate safeguard, use this escalation route: provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For plan-of-care audit, variance closure, and leadership reporting, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For plan-of-care audit, variance closure, and leadership reporting, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. For reporting visit-frequency calendar, record the exact visible discrepancy, the conflicting plan-of-care care-plan folder L7, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CL-CP-001","CL-CP-002","CL-CP-003","CL-CP-004","CL-CP-008","CL-CP-009","42 CFR § 484.60","42 CFR § 484.60(a)","42 CFR § 424.22","42 CFR § 409.42(a)","42 CFR §484.110","42 CFR § 484.60(b)","42 CFR § 409.42","42 CFR § 484.55"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During plan-of-care governance and assessment synthesis, the photographed plan-of-care care-plan folder contains two conflicting versions with neither identified as current for plan-of-care governance and assessment synthesis; the assessment unsigned provider-order form uses a superseded approval block for plan-of-care governance and assessment synthesis. Which finding can the Director of Nursing support before authorizing action?",
    options: [
      "Average the two artifact statuses and classify plan-of-care governance and assessment synthesis as partially complete.",
      "Treat the mismatch between the plan-of-care care-plan folder and assessment unsigned provider-order form as an unresolved an individualized plan of care supported by assessment, orders, coordination, and ongoing review exception; verify the current source, patient impact, and authorized owner.",
      "Remove the conflicting assessment unsigned provider-order form so the file presents one consistent answer.",
      "Accept the plan-of-care care-plan folder because its visible status appears more recent than the assessment unsigned provider-order form.",
    ],
    correct: 1,
    rationale: "The physical evidence conflicts. A supportable classification preserves both artifacts and verifies authority and patient impact before action. Controlled-policy traceability for this lesson includes CL-CP-001.",
  },
  {
    id: 2,
    stem: "During individualized goals, interventions, frequency, and duration, the photographed interventions visit-frequency calendar marks follow-up complete before the required evidence was received for individualized goals, interventions, frequency, and duration; the frequency care-plan folder contains two conflicting versions with neither identified as current for individualized goals, interventions, frequency, and duration. What is the safest authorized next action?",
    options: [
      "Transfer the entire decision to the artifact custodian and remove DON follow-through.",
      "For individualized goals, interventions, frequency, and duration, clarify or correct the plan before unsupported care, billing, or closure proceeds. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. Apply that response to the interventions visit-frequency calendar discrepancy and keep the exception visible pending verification.",
      "Continue the affected work and ask the interventions visit-frequency calendar author to correct it during the next routine review.",
      "Use the frequency care-plan folder as authority because it contains fewer blank fields.",
    ],
    correct: 1,
    rationale: "The response addresses the module-specific decision while preserving the discrepancy, accountable ownership, and effectiveness review. Controlled-policy traceability for this lesson includes CL-CP-002.",
  },
  {
    id: 3,
    stem: "During physician orders, verbal orders, and authentication controls, the photographed authentication unsigned provider-order form uses a superseded approval block for physician orders, verbal orders, and authentication controls; the physician visit-frequency calendar marks follow-up complete before the required evidence was received for physician orders, verbal orders, and authentication controls. Which escalation creates a closed clinical-leadership loop?",
    options: [
      "For physician orders, verbal orders, and authentication controls, escalate through or to the current provider, discipline lead, Administrator, or compliance when orders, implementation, or patient safety conflict. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
      "Send only a screenshot of the authentication unsigned provider-order form and omit the patient impact, safeguard, and unresolved question.",
      "Wait for the physician visit-frequency calendar owner to notice the conflict, because escalation would duplicate the record.",
      "Email an unassigned distribution list about the authentication unsigned provider-order form without requesting a decision or confirmation.",
    ],
    correct: 0,
    rationale: "The module-specific route identifies what to communicate, who must own the response, and how receipt and follow-through are confirmed. Controlled-policy traceability for this lesson includes CL-CP-003.",
  },
  {
    id: 4,
    stem: "During implementation across disciplines and patient education, the photographed implementation care-plan folder contains two conflicting versions with neither identified as current for implementation across disciplines and patient education; the patient unsigned provider-order form uses a superseded approval block for implementation across disciplines and patient education. Which entry makes the DON decision reconstructable?",
    options: [
      "Write “reviewed” beside the implementation care-plan folder and keep the discrepancy in personal notes.",
      "Mark the issue closed when the correction is assigned, before verification evidence exists.",
      "Record the planned result for the patient unsigned provider-order form but omit the visible finding, source, owner, and communication.",
      "For implementation across disciplines and patient education, document assessment linkage, order source, plan change, communication, responsible discipline, patient response, and closure, including unresolved evidence and the next verification point. Identify the conflicting implementation care-plan folder and patient unsigned provider-order form, rather than recording only a completion status.",
    ],
    correct: 3,
    rationale: "A qualified reviewer must be able to reconstruct the exact evidence, source, rationale, communication, owner, and final verification. Controlled-policy traceability for this lesson includes CL-CP-004.",
  },
  {
    id: 5,
    stem: "During review, update, recertification, and change-in-condition response, correction of the update visit-frequency calendar is assigned while the photographed update visit-frequency calendar marks follow-up complete before the required evidence was received for review, update, recertification, and change-in-condition response; the recertification care-plan folder contains two conflicting versions with neither identified as current for review, update, recertification, and change-in-condition response. What accountability remains with the DON?",
    options: [
      "Close the exception when the assignee acknowledges the task, even if the recertification care-plan folder still conflicts.",
      "Confirm that the assignee has authority and capacity, monitor patient and operational consequences, escalate the update visit-frequency calendar conflict, and verify the corrected result.",
      "Treat assignment of the update visit-frequency calendar correction as transfer of all clinical-leadership accountability.",
      "Let the assignee select a different governing source without documenting or escalating the change.",
    ],
    correct: 1,
    rationale: "Delegating a task does not remove DON accountability for clinical consequences, escalation, and effectiveness verification. Controlled-policy traceability for this lesson includes CL-CP-008.",
  },
  {
    id: 6,
    stem: "During order tracking, unresolved signatures, and escalation, the photographed escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation; the order visit-frequency calendar marks follow-up complete before the required evidence was received for order tracking, unresolved signatures, and escalation. What evidence supports closure?",
    options: [
      "The assigned owner reports being busy but expects the order visit-frequency calendar to be corrected.",
      "The escalation unsigned provider-order form is uploaded to the governed location, even though its discrepancy remains.",
      "An authorized owner resolves the escalation unsigned provider-order form and order visit-frequency calendar conflict, documents the action and communication, and verifies the intended patient or operational result.",
      "A meeting agenda lists the issue without a decision, owner, safeguard, or verification result.",
    ],
    correct: 2,
    rationale: "Closure requires completed action plus objective verification; submission, assignment, or discussion alone is not effectiveness evidence. Controlled-policy traceability for this lesson includes CL-CP-009.",
  },
  {
    id: 7,
    stem: "During plan-of-care audit, variance closure, and leadership reporting, the photographed plan-of-care care-plan folder L7 contains two conflicting versions with neither identified as current for plan-of-care audit, variance closure, and leadership reporting; the variance unsigned provider-order form uses a superseded approval block for plan-of-care audit, variance closure, and leadership reporting. How should the source conflict be resolved?",
    options: [
      "Use department custom to resolve the conflict without checking the controlled source.",
      "Choose the plan-of-care care-plan folder L7 because it is easier to read and discard the variance unsigned provider-order form.",
      "Copy a conclusion from a prior case and omit the current patient and authority evidence.",
      "Preserve both artifacts, verify the controlled source and role authority, reconcile patient-specific evidence, document the resolution, and escalate any remaining plan-of-care care-plan folder L7 exception.",
    ],
    correct: 3,
    rationale: "Conflicting physical evidence must remain traceable until current authority, patient-specific facts, ownership, and resolution are documented. Controlled-policy traceability for this lesson includes CL-CP-001.",
  },
  {
    id: 8,
    stem: "A staff member cites 42 CFR § 484.60 to override the patient-specific evidence and controlled workflow in Plan of Care Management. How should the DON respond?",
    options: [
      "Verify the external requirement’s current subject and scope, reconcile it with controlled agency policy and patient-specific evidence, and document any conflict before acting.",
      "Replace the patient-specific order and assessment with a remembered summary of the citation.",
      "Accept the citation label as proof that every local workflow and exception is governed by the same rule.",
      "Apply the citation to roles and circumstances that were not verified within its subject or scope.",
    ],
    correct: 0,
    rationale: "External authority informs practice only after its current scope and controlled implementation are verified; a citation label alone does not resolve the case.",
  },
  {
    id: 9,
    stem: "The individualized unsigned provider-order form uses a superseded approval block for individualized goals, interventions, frequency, and duration, while the later escalation unsigned provider-order form uses a superseded approval block for order tracking, unresolved signatures, and escalation. What connects these distinct findings into defensible DON practice for Plan of Care Management?",
    options: [
      "Close both findings because two different artifacts cannot be evaluated in one leadership evidence chain.",
      "Treat the individualized unsigned provider-order form as a training issue and the escalation unsigned provider-order form as another department’s issue, with no shared owner or trend review.",
      "Use the later escalation unsigned provider-order form to overwrite the earlier individualized unsigned provider-order form without preserving the source conflict.",
      "Preserve both findings; verify controlled authority and patient-specific impact; assign and confirm accountable action; then document effectiveness across the individualized unsigned provider-order form and escalation unsigned provider-order form.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis connects distinct evidence through current authority, clinical reasoning, closed-loop ownership, trend awareness, and verified outcomes.",
  },
  {
    id: 10,
    stem: "After a passing score in Plan of Care Management, a learner asks to perform every discussed activity independently. What does successful completion actually establish?",
    options: [
      "Permission to replace current policies, orders, and role restrictions with the quiz result.",
      "Automatic authority to perform every activity discussed in Plan of Care Management without supervision.",
      "Observed clinical competency even though no authorized evaluator witnessed performance.",
      "Knowledge of the controlled DON concepts in Plan of Care Management; appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate decisions.",
    ],
    correct: 3,
    rationale: "This assessment evaluates knowledge. It does not make an appointment, credentialing, competency, legal-sign-off, delegation, or independent-practice authorization decision.",
  },
];

const STYLES = `
.lvn002,.lvn002 *{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;box-sizing:border-box}
@keyframes lvn002-pop{0%{transform:scale(.96);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes lvn002-ping{75%,100%{transform:scale(1.75);opacity:0}}
@keyframes lvn002-slide{0%{transform:translateX(24px);opacity:0}100%{transform:translateX(0);opacity:1}}
.lvn002-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:#F8FAFC;color:#2D3748;z-index:40}
.lvn002-top{height:64px;background:#fff;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0}
.lvn002-brand{display:flex;align-items:center;gap:8px;color:#0F5B54;font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;flex-shrink:0}
.lvn002-tabs{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:none}
.lvn002-tabs::-webkit-scrollbar{display:none}
.lvn002-tab{border:0;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;background:transparent;color:#64748B;min-height:44px}
.lvn002-tab.active{background:#0F5B54;color:#fff;box-shadow:0 6px 16px rgba(15,91,84,.2)}
.lvn002-tab.quiz-tab{border:1px solid #B94718;color:#B94718}
.lvn002-tab.quiz-tab.active{background:#B94718;color:#fff;border-color:#B94718}
.lvn002-exit{flex-shrink:0;border-radius:10px;border:1px solid #B94718;background:#fff;color:#B94718;padding:8px 16px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;min-height:44px}
.lvn002-work{flex:1;min-height:0;display:flex;gap:0;padding:16px}
.lvn002-left{width:42%;min-width:280px;max-width:520px;overflow:auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px 0 0 16px;padding:22px}
.lvn002-right{flex:1;min-width:0;background:#fff;border:1px solid #E2E8F0;border-left:0;border-radius:0 16px 16px 0;padding:12px;display:flex}
.lvn002-stage-wrap{width:100%;height:100%;min-height:0;display:grid;place-items:center}
.lvn002-stage{position:relative;width:min(100%,calc(100cqh * 16 / 13));max-width:100%;max-height:100%;aspect-ratio:16/13;overflow:hidden;border-radius:14px;border:1px solid #E2E8F0;background:#fff;box-shadow:0 12px 36px rgba(15,91,84,.1)}
@supports not (width:1cqh){.lvn002-stage{width:100%;height:auto;aspect-ratio:16/13;max-height:100%}}
.lvn002-stage img.scene{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none}
.lvn002-hotspot{position:absolute;z-index:10;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:transparent;cursor:pointer;padding:0;min-width:48px;min-height:48px}
.lvn002-hotspot .orb{position:relative;width:48px;height:48px;min-width:48px;min-height:48px;border-radius:50%;display:grid;place-items:center;border:3px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,.18);color:#fff;font-weight:800;overflow:hidden}
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

@media (max-width:780px) and (min-width:621px){.don-key-action-grid{grid-template-columns:1fr!important}}
@media (max-width:420px){.don-key-action-grid{grid-template-columns:1fr!important}}
@media (prefers-reduced-motion:reduce){
  .lvn002-hotspot .ping,.lvn002-drawer-bg,.lvn002-quiz-card,.lvn002-path-step{animation:none!important}
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
.lvn002-modal{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.55);padding:12px;overscroll-behavior:contain}
.lvn002-modal-card{width:min(560px,100%);max-height:min(92dvh,760px);overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:16px;border:1px solid #E2E8F0;box-shadow:0 16px 48px rgba(0,0,0,.22)}
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
          {stage === 'identify' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What does this evidence mean for patient-specific DON practice?</div>{renderChoices(hotspot.identifyChoices, selectedIdentifyId, identifyLocked, (choice) => pick(choice, setSelectedIdentifyId, setIdentifyLocked, identifyLocked, 'decide'))}</>}
          {stage === 'decide' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>What should the DON do next within current orders and scope?</div>{renderChoices(hotspot.decideChoices, selectedDecideId, decideLocked, (choice) => pick(choice, setSelectedDecideId, setDecideLocked, decideLocked, 'document'))}</>}
          {stage === 'document' && <><div style={{ fontSize: 13, fontWeight: 700, color: CI.muted }}>How should this be documented?</div>{renderChoices(hotspot.documentChoices, selectedDocumentId, documentLocked, (choice) => pick(choice, setSelectedDocumentId, setDocumentLocked, documentLocked, 'feedback'))}</>}
          {stage === 'feedback' && <><h3 ref={feedbackHeadingRef} tabIndex={-1} style={{ margin: 0, fontSize: 18, color: CI.teal }}>Clinical feedback</h3><FeedbackBlock label="What you observed" body={feedback.observed} icon={<Eye size={14} />} /><FeedbackBlock label="What it means" body={feedback.meaning} icon={<AlertCircle size={14} />} /><FeedbackBlock label="What the DON should do" body={feedback.action} icon={<CheckCircle2 size={14} />} /><FeedbackBlock label="Who must be notified" body={feedback.notify} icon={<MessageSquare size={14} />} /><FeedbackBlock label="What must be documented" body={feedback.document} icon={<FileText size={14} />} /><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{feedback.policyRefs.map((reference) => <span key={reference} style={{ fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 6, background: CI.tealSoft, color: CI.teal, border: `1px solid ${CI.tealMuted}` }}>{reference}</span>)}</div><button type="button" onClick={() => { onComplete(); restoreTriggerFocus(); }} style={{ width: '100%', minHeight: 44, border: 0, borderRadius: 10, background: CI.orange, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Complete hotspot</button></>}
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
  const actionsId = `don-actions-${page.id}`;
  const sourcesId = `don-sources-${page.id}`;
  return (
    <div className="don-left-panel-system" data-left-panel="segmented">
      <div style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.teal, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, borderRadius: 999, padding: '4px 10px', marginBottom: 12 }}>{page.shortName} · {pageIndex + 1} of {total}</div>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, lineHeight: 1.25, color: '#1F1C1B' }}>{page.title}</h1>
      <p style={{ margin: '0 0 12px', color: CI.orange, fontSize: 15, fontWeight: 600 }}>{page.subtitle}</p>

      <section aria-label="Lesson focus" style={{ padding: 13, borderRadius: 12, background: CI.tealSoft, border: `1px solid ${CI.tealMuted}`, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: CI.teal, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}><Sparkles size={15} aria-hidden="true" />Lesson Focus</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: CI.ink }}>{focus}</p>
      </section>

      <section aria-labelledby={actionsId} style={{ marginBottom: 14 }}>
        <h2 id={actionsId} style={{ margin: '0 0 9px', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: CI.muted }}>Key DON Actions</h2>
        <div className="don-key-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
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

      <details className="don-lesson-details" style={{ border: `1px solid ${CI.border}`, borderRadius: 12, background: '#FAFBF8', marginBottom: 4 }}>
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


const STORAGE_KEY = 'don-005-progress-v6000';

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

function BrandMark({ size = 28 }: { size?: number }) {
  return <img src="/assets/navigation/logo-careindeed-orange.png" alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, flexShrink: 0, objectFit: 'contain' }} />;
}

export default function DON005() {
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
          <BrandMark size={28} />
          <span className="brand-text">DON-005 — Plan of Care</span>
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
