/**
 * DON-016 — Survey Readiness & Regulatory Inspection Management
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
import img01 from './assets/don-016/don-016-lesson-01.png';
import img02 from './assets/don-016/don-016-lesson-02.png';
import img03 from './assets/don-016/don-016-lesson-03.png';
import img04 from './assets/don-016/don-016-lesson-04.png';
import img05 from './assets/don-016/don-016-lesson-05.png';
import img06 from './assets/don-016/don-016-lesson-06.png';
import img07 from './assets/don-016/don-016-lesson-07.png';

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

const MODULE_META = { id: "DON-016", title: "Survey Readiness & Regulatory Inspection Management", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health DON leadership scene for Everyday survey readiness and clinical-system reliability, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Clinical-record selection, traceability, and evidence retrieval, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Personnel, competency, supervision, and policy evidence, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Managing survey arrival, requests, interviews, and observations, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Deficiency analysis and corrective-action planning, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Post-survey monitoring and sustained compliance, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Mock surveys, leadership reporting, and readiness culture, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Everyda",
    title: "Everyday survey readiness and clinical-system reliability",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for everyday survey readiness and clinical-system reliability within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-003 (Mock Survey Program), GV-EA-004 (What Surveyors and Auditors Will Look For), CO-RA-003 (Survey Readiness Binder Maintenance), CO-RA-003 (Staff Survey Interaction Training), QA-AE-003 (CMS Survey Plan of Correction). These sources are presented as a governed control map rather than pasted policy tables. For everyday survey readiness, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For clinical-system reliability, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for everyday survey readiness and clinical-system reliability centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to everyday survey readiness and clinical-system reliability. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for everyday survey readiness and clinical-system reliability should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for everyday survey readiness and clinical-system reliability, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Everyday Surveyor Request List", detail: "The everyday surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the clinical-system tabbed policy binder and current source before acting." },
      { icon: "🧭", title: "Clinical-system Tabbed Policy Binder", detail: "The clinical-system tabbed policy binder contains an approval tab with no approver name or date. Verify it against the exception mobile evidence cart and current source before acting." },
      { icon: "🛡️", title: "Exception Mobile Evidence Cart", detail: "The exception mobile evidence cart shows a completed check with no responsible verifier. Verify it against the everyday surveyor request list and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR § 484.100" },
      { kind: "External Authority", text: "42 CFR §484.100" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "everyday-surveyor-request-list-1-1", label: "everyday surveyor request list", shortLabel: "everyday surveyor request list", ariaLabel: "Investigate everyday surveyor request list",        x: 24, y: 42, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "The photographed everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. The adjacent clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability, while the clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. The adjacent clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability, while the clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat everyday surveyor request list as complete proof without comparing clinical-system tabbed policy binder or the controlled source. This identify option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for everyday survey readiness and clinical-system reliability." },
          { id: "i3", label: "Classify the everyday surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about everyday surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the everyday surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the everyday surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from everyday surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for everyday surveyor request list is resolved." },
          { id: "d3", label: "Send everyday surveyor request list to an unrelated department rather than the policy owner responsible for everyday survey readiness and clinical-system reliability. This decide option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during everyday survey readiness and clinical-system reliability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For everyday surveyor request list, record the exact visible discrepancy, the conflicting clinical-system tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For everyday surveyor request list, record the exact visible discrepancy, the conflicting clinical-system tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that everyday surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of everyday surveyor request list." },
          { id: "doc3", label: "Keep the everyday surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns everyday surveyor request list during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for everyday survey readiness and clinical-system reliability." },
        ],
        feedback: {
          observed: "The photographed everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. The adjacent clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. The adjacent clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability, while the clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the everyday surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For everyday survey readiness and clinical-system reliability, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For everyday surveyor request list, record the exact visible discrepancy, the conflicting clinical-system tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "clinical-system-tabbed-policy-binder-1-2", label: "clinical-system tabbed policy binder", shortLabel: "clinical-system tabbed policy", ariaLabel: "Investigate clinical-system tabbed policy binder",        x: 30, y: 71, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "The photographed clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. The adjacent exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability, while the exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. The adjacent exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability, while the exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume clinical-system tabbed policy binder applies to every role, patient, location, and exception described in everyday survey readiness and clinical-system reliability. This identify option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for everyday survey readiness and clinical-system reliability." },
          { id: "i3", label: "Use the oldest available clinical-system tabbed policy binder because prior approval is easier to confirm. This identify option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical-system tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-system tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-system tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in clinical-system tabbed policy binder remains unresolved. This decide option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical-system tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to clinical-system tabbed policy binder. This decide option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during everyday survey readiness and clinical-system reliability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-system tabbed policy binder, record the exact visible discrepancy, the conflicting exception mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-system tabbed policy binder, record the exact visible discrepancy, the conflicting exception mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark clinical-system tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical-system tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of clinical-system tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns clinical-system tabbed policy binder during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for everyday survey readiness and clinical-system reliability." },
        ],
        feedback: {
          observed: "The photographed clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. The adjacent exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. The adjacent exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability, while the exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-system tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For everyday survey readiness and clinical-system reliability, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-system tabbed policy binder, record the exact visible discrepancy, the conflicting exception mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "exception-mobile-evidence-cart-1-3", label: "exception mobile evidence cart", shortLabel: "exception mobile evidence cart", ariaLabel: "Investigate exception mobile evidence cart",        x: 83, y: 63, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "The photographed exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. The adjacent everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability, while the everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. The adjacent everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability, while the everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception mobile evidence cart only for favorable indicators and omit the exception evidence connected to everyday surveyor request list. This identify option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "This omits controlled-source verification or corroboration required for everyday survey readiness and clinical-system reliability." },
          { id: "i3", label: "Treat an unsigned or unverified exception mobile evidence cart as equivalent to the current controlled record. This identify option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the exception mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during everyday survey readiness and clinical-system reliability." },
        ],
        documentChoices: [
          { id: "doc1", label: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception mobile evidence cart, record the exact visible discrepancy, the conflicting everyday surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception mobile evidence cart, record the exact visible discrepancy, the conflicting everyday surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception mobile evidence cart." },
          { id: "doc3", label: "Combine exception mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception mobile evidence cart during everyday survey readiness and clinical-system reliability.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for everyday survey readiness and clinical-system reliability." },
        ],
        feedback: {
          observed: "The photographed exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. The adjacent everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability. The adjacent everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception mobile evidence cart shows a completed check with no responsible verifier for everyday survey readiness and clinical-system reliability, while the everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For everyday survey readiness and clinical-system reliability, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For everyday survey readiness and clinical-system reliability, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For everyday survey readiness and clinical-system reliability, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception mobile evidence cart, record the exact visible discrepancy, the conflicting everyday surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 Clinica",
    title: "Clinical-record selection, traceability, and evidence retrieval",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for clinical-record selection, traceability, and evidence retrieval within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-006 (4. Policy Statement), GV-EA-004 (What Surveyors and Auditors Will Look For), CO-RA-004 (2. Purpose), CO-RA-004 (Annual CoP Compliance Assessment), CO-RA-006 (2. Purpose). These sources are presented as a governed control map rather than pasted policy tables. For clinical-record selection, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For traceability, confirm that an operational practice does not silently expand beyond its approved scope. For evidence retrieval, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for clinical-record selection, traceability, and evidence retrieval centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to clinical-record selection, traceability, and evidence retrieval. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for clinical-record selection, traceability, and evidence retrieval should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for clinical-record selection, traceability, and evidence retrieval, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Clinical-record Tabbed Policy Binder", detail: "The clinical-record tabbed policy binder contains an approval tab with no approver name or date. Verify it against the traceability mobile evidence cart and current source before acting." },
      { icon: "🧭", title: "Traceability Mobile Evidence Cart", detail: "The traceability mobile evidence cart shows a completed check with no responsible verifier. Verify it against the evidence surveyor request list and current source before acting." },
      { icon: "🛡️", title: "Evidence Surveyor Request List", detail: "The evidence surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the clinical-record tabbed policy binder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR §484.100" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "clinical-record-tabbed-policy-binder-2-1", label: "clinical-record tabbed policy binder", shortLabel: "clinical-record tabbed policy", ariaLabel: "Investigate clinical-record tabbed policy binder",        x: 14, y: 56, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "The photographed clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. The adjacent traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval, while the traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. The adjacent traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval, while the traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume clinical-record tabbed policy binder applies to every role, patient, location, and exception described in clinical-record selection, traceability, and evidence retrieval. This identify option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-record selection, traceability, and evidence retrieval." },
          { id: "i3", label: "Use the oldest available clinical-record tabbed policy binder because prior approval is easier to confirm. This identify option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical-record tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-record tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-record tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in clinical-record tabbed policy binder remains unresolved. This decide option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical-record tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to clinical-record tabbed policy binder. This decide option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-record selection, traceability, and evidence retrieval." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-record tabbed policy binder, record the exact visible discrepancy, the conflicting traceability mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-record tabbed policy binder, record the exact visible discrepancy, the conflicting traceability mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark clinical-record tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical-record tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of clinical-record tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns clinical-record tabbed policy binder during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-record selection, traceability, and evidence retrieval." },
        ],
        feedback: {
          observed: "The photographed clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. The adjacent traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. The adjacent traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval, while the traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-record tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-record selection, traceability, and evidence retrieval, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For clinical-record tabbed policy binder, record the exact visible discrepancy, the conflicting traceability mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "traceability-mobile-evidence-cart-2-2", label: "traceability mobile evidence cart", shortLabel: "traceability mobile evidence", ariaLabel: "Investigate traceability mobile evidence cart",        x: 37, y: 42, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "The photographed traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. The adjacent evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval, while the evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. The adjacent evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval, while the evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read traceability mobile evidence cart only for favorable indicators and omit the exception evidence connected to evidence surveyor request list. This identify option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-record selection, traceability, and evidence retrieval." },
          { id: "i3", label: "Treat an unsigned or unverified traceability mobile evidence cart as equivalent to the current controlled record. This identify option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about traceability mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the traceability mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the traceability mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close traceability mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for traceability mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the traceability mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-record selection, traceability, and evidence retrieval." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For traceability mobile evidence cart, record the exact visible discrepancy, the conflicting evidence surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For traceability mobile evidence cart, record the exact visible discrepancy, the conflicting evidence surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for traceability mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of traceability mobile evidence cart." },
          { id: "doc3", label: "Combine traceability mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns traceability mobile evidence cart during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-record selection, traceability, and evidence retrieval." },
        ],
        feedback: {
          observed: "The photographed traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. The adjacent evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval. The adjacent evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval, while the evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the traceability mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-record selection, traceability, and evidence retrieval, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For traceability mobile evidence cart, record the exact visible discrepancy, the conflicting evidence surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "evidence-surveyor-request-list-2-3", label: "evidence surveyor request list", shortLabel: "evidence surveyor request list", ariaLabel: "Investigate evidence surveyor request list",        x: 80, y: 65, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "The photographed evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. The adjacent clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval, while the clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. The adjacent clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval, while the clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat evidence surveyor request list as complete proof without comparing clinical-record tabbed policy binder or the controlled source. This identify option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-record selection, traceability, and evidence retrieval." },
          { id: "i3", label: "Classify the evidence surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about evidence surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from evidence surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for evidence surveyor request list is resolved." },
          { id: "d3", label: "Send evidence surveyor request list to an unrelated department rather than the policy owner responsible for clinical-record selection, traceability, and evidence retrieval. This decide option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-record selection, traceability, and evidence retrieval." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For evidence surveyor request list, record the exact visible discrepancy, the conflicting clinical-record tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For evidence surveyor request list, record the exact visible discrepancy, the conflicting clinical-record tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that evidence surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of evidence surveyor request list." },
          { id: "doc3", label: "Keep the evidence surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns evidence surveyor request list during clinical-record selection, traceability, and evidence retrieval.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-record selection, traceability, and evidence retrieval." },
        ],
        feedback: {
          observed: "The photographed evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. The adjacent clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. The adjacent clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval, while the clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-record selection, traceability, and evidence retrieval, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-record selection, traceability, and evidence retrieval, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For evidence surveyor request list, record the exact visible discrepancy, the conflicting clinical-record tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Personn",
    title: "Personnel, competency, supervision, and policy evidence",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for personnel, competency, supervision, and policy evidence within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-006 (4. Policy Statement), GV-EA-004 (What Surveyors and Auditors Will Look For), QA-AE-003 (Monitoring and Effectiveness Verification), CO-RA-003 (2. Purpose), CO-RA-003 (3. Scope). These sources are presented as a governed control map rather than pasted policy tables. For personnel, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For competency, confirm that an operational practice does not silently expand beyond its approved scope. For supervision, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for personnel, competency, supervision, and policy evidence centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to personnel, competency, supervision, and policy evidence. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for personnel, competency, supervision, and policy evidence should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for personnel, competency, supervision, and policy evidence, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Personnel Mobile Evidence Cart", detail: "The personnel mobile evidence cart shows a completed check with no responsible verifier. Verify it against the competency surveyor request list and current source before acting." },
      { icon: "🧭", title: "Competency Surveyor Request List", detail: "The competency surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the supervision tabbed policy binder and current source before acting." },
      { icon: "🛡️", title: "Supervision Tabbed Policy Binder", detail: "The supervision tabbed policy binder contains an approval tab with no approver name or date. Verify it against the personnel mobile evidence cart and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR Part 484" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "personnel-mobile-evidence-cart-3-1", label: "personnel mobile evidence cart", shortLabel: "personnel mobile evidence cart", ariaLabel: "Investigate personnel mobile evidence cart",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "The photographed personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. The adjacent competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence, while the competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. The adjacent competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence, while the competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read personnel mobile evidence cart only for favorable indicators and omit the exception evidence connected to competency surveyor request list. This identify option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "This omits controlled-source verification or corroboration required for personnel, competency, supervision, and policy evidence." },
          { id: "i3", label: "Treat an unsigned or unverified personnel mobile evidence cart as equivalent to the current controlled record. This identify option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about personnel mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the personnel mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the personnel mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close personnel mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for personnel mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the personnel mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during personnel, competency, supervision, and policy evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For personnel mobile evidence cart, record the exact visible discrepancy, the conflicting competency surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For personnel mobile evidence cart, record the exact visible discrepancy, the conflicting competency surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for personnel mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of personnel mobile evidence cart." },
          { id: "doc3", label: "Combine personnel mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns personnel mobile evidence cart during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, competency, supervision, and policy evidence." },
        ],
        feedback: {
          observed: "The photographed personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. The adjacent competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. The adjacent competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence, while the competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the personnel mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For personnel, competency, supervision, and policy evidence, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For personnel mobile evidence cart, record the exact visible discrepancy, the conflicting competency surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "competency-surveyor-request-list-3-2", label: "competency surveyor request list", shortLabel: "competency surveyor request", ariaLabel: "Investigate competency surveyor request list",        x: 53, y: 72, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "The photographed competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. The adjacent supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence, while the supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. The adjacent supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence, while the supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat competency surveyor request list as complete proof without comparing supervision tabbed policy binder or the controlled source. This identify option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "This omits controlled-source verification or corroboration required for personnel, competency, supervision, and policy evidence." },
          { id: "i3", label: "Classify the competency surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about competency surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the competency surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the competency surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from competency surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for competency surveyor request list is resolved." },
          { id: "d3", label: "Send competency surveyor request list to an unrelated department rather than the policy owner responsible for personnel, competency, supervision, and policy evidence. This decide option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during personnel, competency, supervision, and policy evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For competency surveyor request list, record the exact visible discrepancy, the conflicting supervision tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For competency surveyor request list, record the exact visible discrepancy, the conflicting supervision tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that competency surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of competency surveyor request list." },
          { id: "doc3", label: "Keep the competency surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns competency surveyor request list during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, competency, supervision, and policy evidence." },
        ],
        feedback: {
          observed: "The photographed competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. The adjacent supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence. The adjacent supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The competency surveyor request list shows an active item that the source record identifies as discontinued for personnel, competency, supervision, and policy evidence, while the supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the competency surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For personnel, competency, supervision, and policy evidence, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For competency surveyor request list, record the exact visible discrepancy, the conflicting supervision tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "supervision-tabbed-policy-binder-3-3", label: "supervision tabbed policy binder", shortLabel: "supervision tabbed policy", ariaLabel: "Investigate supervision tabbed policy binder",        x: 82, y: 43, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "The photographed supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. The adjacent personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence, while the personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. The adjacent personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence, while the personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume supervision tabbed policy binder applies to every role, patient, location, and exception described in personnel, competency, supervision, and policy evidence. This identify option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "This omits controlled-source verification or corroboration required for personnel, competency, supervision, and policy evidence." },
          { id: "i3", label: "Use the oldest available supervision tabbed policy binder because prior approval is easier to confirm. This identify option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about supervision tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in supervision tabbed policy binder remains unresolved. This decide option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for supervision tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to supervision tabbed policy binder. This decide option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during personnel, competency, supervision, and policy evidence." },
        ],
        documentChoices: [
          { id: "doc1", label: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For supervision tabbed policy binder, record the exact visible discrepancy, the conflicting personnel mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For supervision tabbed policy binder, record the exact visible discrepancy, the conflicting personnel mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark supervision tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of supervision tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of supervision tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns supervision tabbed policy binder during personnel, competency, supervision, and policy evidence.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for personnel, competency, supervision, and policy evidence." },
        ],
        feedback: {
          observed: "The photographed supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. The adjacent personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence. The adjacent personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence, while the personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For personnel, competency, supervision, and policy evidence, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the supervision tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For personnel, competency, supervision, and policy evidence, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For personnel, competency, supervision, and policy evidence, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For supervision tabbed policy binder, record the exact visible discrepancy, the conflicting personnel mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Managin",
    title: "Managing survey arrival, requests, interviews, and observations",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for managing survey arrival, requests, interviews, and observations within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-003 (Mock Survey Program), GV-EA-004 (What Surveyors and Auditors Will Look For), CO-RA-003 (Staff Survey Interaction Training), CO-RA-003 (Survey Readiness Binder Maintenance), QA-AE-003 (Surveyor Expectations). These sources are presented as a governed control map rather than pasted policy tables. For managing survey arrival, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For requests, confirm that an operational practice does not silently expand beyond its approved scope. For interviews, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for managing survey arrival, requests, interviews, and observations centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to managing survey arrival, requests, interviews, and observations. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for managing survey arrival, requests, interviews, and observations should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for managing survey arrival, requests, interviews, and observations, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Managing Surveyor Request List", detail: "The managing surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the requests tabbed policy binder and current source before acting." },
      { icon: "🧭", title: "Requests Tabbed Policy Binder", detail: "The requests tabbed policy binder contains an approval tab with no approver name or date. Verify it against the interviews mobile evidence cart and current source before acting." },
      { icon: "🛡️", title: "Interviews Mobile Evidence Cart", detail: "The interviews mobile evidence cart shows a completed check with no responsible verifier. Verify it against the managing surveyor request list and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR Part 484" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "managing-surveyor-request-list-4-1", label: "managing surveyor request list", shortLabel: "managing surveyor request list", ariaLabel: "Investigate managing surveyor request list",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "The photographed managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. The adjacent requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations, while the requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. The adjacent requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations, while the requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat managing surveyor request list as complete proof without comparing requests tabbed policy binder or the controlled source. This identify option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "This omits controlled-source verification or corroboration required for managing survey arrival, requests, interviews, and observations." },
          { id: "i3", label: "Classify the managing surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about managing surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the managing surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the managing surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from managing surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for managing surveyor request list is resolved." },
          { id: "d3", label: "Send managing surveyor request list to an unrelated department rather than the policy owner responsible for managing survey arrival, requests, interviews, and observations. This decide option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during managing survey arrival, requests, interviews, and observations." },
        ],
        documentChoices: [
          { id: "doc1", label: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For managing surveyor request list, record the exact visible discrepancy, the conflicting requests tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For managing surveyor request list, record the exact visible discrepancy, the conflicting requests tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that managing surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of managing surveyor request list." },
          { id: "doc3", label: "Keep the managing surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns managing surveyor request list during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for managing survey arrival, requests, interviews, and observations." },
        ],
        feedback: {
          observed: "The photographed managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. The adjacent requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. The adjacent requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations, while the requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the managing surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For managing survey arrival, requests, interviews, and observations, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For managing surveyor request list, record the exact visible discrepancy, the conflicting requests tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "requests-tabbed-policy-binder-4-2", label: "requests tabbed policy binder", shortLabel: "requests tabbed policy binder", ariaLabel: "Investigate requests tabbed policy binder",        x: 35, y: 44, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "The photographed requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. The adjacent interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations, while the interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. The adjacent interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations, while the interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume requests tabbed policy binder applies to every role, patient, location, and exception described in managing survey arrival, requests, interviews, and observations. This identify option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "This omits controlled-source verification or corroboration required for managing survey arrival, requests, interviews, and observations." },
          { id: "i3", label: "Use the oldest available requests tabbed policy binder because prior approval is easier to confirm. This identify option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about requests tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the requests tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the requests tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in requests tabbed policy binder remains unresolved. This decide option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for requests tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to requests tabbed policy binder. This decide option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during managing survey arrival, requests, interviews, and observations." },
        ],
        documentChoices: [
          { id: "doc1", label: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For requests tabbed policy binder, record the exact visible discrepancy, the conflicting interviews mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For requests tabbed policy binder, record the exact visible discrepancy, the conflicting interviews mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark requests tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of requests tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of requests tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns requests tabbed policy binder during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for managing survey arrival, requests, interviews, and observations." },
        ],
        feedback: {
          observed: "The photographed requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. The adjacent interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. The adjacent interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations, while the interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the requests tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For managing survey arrival, requests, interviews, and observations, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For requests tabbed policy binder, record the exact visible discrepancy, the conflicting interviews mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "interviews-mobile-evidence-cart-4-3", label: "interviews mobile evidence cart", shortLabel: "interviews mobile evidence", ariaLabel: "Investigate interviews mobile evidence cart",        x: 83, y: 62, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "The photographed interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. The adjacent managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations, while the managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. The adjacent managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations, while the managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read interviews mobile evidence cart only for favorable indicators and omit the exception evidence connected to managing surveyor request list. This identify option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "This omits controlled-source verification or corroboration required for managing survey arrival, requests, interviews, and observations." },
          { id: "i3", label: "Treat an unsigned or unverified interviews mobile evidence cart as equivalent to the current controlled record. This identify option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about interviews mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interviews mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interviews mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close interviews mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for interviews mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the interviews mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during managing survey arrival, requests, interviews, and observations." },
        ],
        documentChoices: [
          { id: "doc1", label: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For interviews mobile evidence cart, record the exact visible discrepancy, the conflicting managing surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For interviews mobile evidence cart, record the exact visible discrepancy, the conflicting managing surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for interviews mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of interviews mobile evidence cart." },
          { id: "doc3", label: "Combine interviews mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns interviews mobile evidence cart during managing survey arrival, requests, interviews, and observations.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for managing survey arrival, requests, interviews, and observations." },
        ],
        feedback: {
          observed: "The photographed interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. The adjacent managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations. The adjacent managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The interviews mobile evidence cart shows a completed check with no responsible verifier for managing survey arrival, requests, interviews, and observations, while the managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For managing survey arrival, requests, interviews, and observations, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the interviews mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For managing survey arrival, requests, interviews, and observations, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For interviews mobile evidence cart, record the exact visible discrepancy, the conflicting managing surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Deficie",
    title: "Deficiency analysis and corrective-action planning",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for deficiency analysis and corrective-action planning within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-007 (Assessment and Response Planning), CO-RA-002 (Findings Reporting and Escalation), CO-RA-004 (5. Definitions), QA-AE-003 (4. Policy Statements), CO-RA-002 (Audit Execution — Standard Protocol). These sources are presented as a governed control map rather than pasted policy tables. For deficiency analysis, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For corrective-action planning, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for deficiency analysis and corrective-action planning centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to deficiency analysis and corrective-action planning. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for deficiency analysis and corrective-action planning should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for deficiency analysis and corrective-action planning, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Deficiency Tabbed Policy Binder", detail: "The deficiency tabbed policy binder contains an approval tab with no approver name or date. Verify it against the corrective-action mobile evidence cart and current source before acting." },
      { icon: "🧭", title: "Corrective-action Mobile Evidence Cart", detail: "The corrective-action mobile evidence cart shows a completed check with no responsible verifier. Verify it against the exception surveyor request list and current source before acting." },
      { icon: "🛡️", title: "Exception Surveyor Request List", detail: "The exception surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the deficiency tabbed policy binder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR § 484.60" },
      { kind: "External Authority", text: "42 CFR Part 488" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "deficiency-tabbed-policy-binder-5-1", label: "deficiency tabbed policy binder", shortLabel: "deficiency tabbed policy", ariaLabel: "Investigate deficiency tabbed policy binder",        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "The photographed deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. The adjacent corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning, while the corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. The adjacent corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning, while the corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume deficiency tabbed policy binder applies to every role, patient, location, and exception described in deficiency analysis and corrective-action planning. This identify option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for deficiency analysis and corrective-action planning." },
          { id: "i3", label: "Use the oldest available deficiency tabbed policy binder because prior approval is easier to confirm. This identify option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about deficiency tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the deficiency tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the deficiency tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in deficiency tabbed policy binder remains unresolved. This decide option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for deficiency tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to deficiency tabbed policy binder. This decide option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during deficiency analysis and corrective-action planning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For deficiency tabbed policy binder, record the exact visible discrepancy, the conflicting corrective-action mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For deficiency tabbed policy binder, record the exact visible discrepancy, the conflicting corrective-action mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark deficiency tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of deficiency tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of deficiency tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns deficiency tabbed policy binder during deficiency analysis and corrective-action planning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency analysis and corrective-action planning." },
        ],
        feedback: {
          observed: "The photographed deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. The adjacent corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. The adjacent corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning, while the corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the deficiency tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For deficiency analysis and corrective-action planning, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For deficiency tabbed policy binder, record the exact visible discrepancy, the conflicting corrective-action mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "corrective-action-mobile-evidence-cart-5-2", label: "corrective-action mobile evidence cart", shortLabel: "corrective-action mobile", ariaLabel: "Investigate corrective-action mobile evidence cart",        x: 49, y: 70, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "The photographed corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. The adjacent exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning, while the exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. The adjacent exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning, while the exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read corrective-action mobile evidence cart only for favorable indicators and omit the exception evidence connected to exception surveyor request list. This identify option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for deficiency analysis and corrective-action planning." },
          { id: "i3", label: "Treat an unsigned or unverified corrective-action mobile evidence cart as equivalent to the current controlled record. This identify option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about corrective-action mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective-action mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective-action mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close corrective-action mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for corrective-action mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the corrective-action mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during deficiency analysis and corrective-action planning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For corrective-action mobile evidence cart, record the exact visible discrepancy, the conflicting exception surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For corrective-action mobile evidence cart, record the exact visible discrepancy, the conflicting exception surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for corrective-action mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of corrective-action mobile evidence cart." },
          { id: "doc3", label: "Combine corrective-action mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns corrective-action mobile evidence cart during deficiency analysis and corrective-action planning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency analysis and corrective-action planning." },
        ],
        feedback: {
          observed: "The photographed corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. The adjacent exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning. The adjacent exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning, while the exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the corrective-action mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For deficiency analysis and corrective-action planning, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For corrective-action mobile evidence cart, record the exact visible discrepancy, the conflicting exception surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "exception-surveyor-request-list-5-3", label: "exception surveyor request list", shortLabel: "exception surveyor request", ariaLabel: "Investigate exception surveyor request list",        x: 83, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "The photographed exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. The adjacent deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning, while the deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. The adjacent deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning, while the deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat exception surveyor request list as complete proof without comparing deficiency tabbed policy binder or the controlled source. This identify option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "This omits controlled-source verification or corroboration required for deficiency analysis and corrective-action planning." },
          { id: "i3", label: "Classify the exception surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from exception surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception surveyor request list is resolved." },
          { id: "d3", label: "Send exception surveyor request list to an unrelated department rather than the policy owner responsible for deficiency analysis and corrective-action planning. This decide option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during deficiency analysis and corrective-action planning." },
        ],
        documentChoices: [
          { id: "doc1", label: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception surveyor request list, record the exact visible discrepancy, the conflicting deficiency tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception surveyor request list, record the exact visible discrepancy, the conflicting deficiency tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that exception surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception surveyor request list." },
          { id: "doc3", label: "Keep the exception surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns exception surveyor request list during deficiency analysis and corrective-action planning.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for deficiency analysis and corrective-action planning." },
        ],
        feedback: {
          observed: "The photographed exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. The adjacent deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. The adjacent deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning, while the deficiency tabbed policy binder contains an approval tab with no approver name or date for deficiency analysis and corrective-action planning. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For deficiency analysis and corrective-action planning, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For deficiency analysis and corrective-action planning, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For deficiency analysis and corrective-action planning, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception surveyor request list, record the exact visible discrepancy, the conflicting deficiency tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Post-su",
    title: "Post-survey monitoring and sustained compliance",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for post-survey monitoring and sustained compliance within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-004 (Annual CoP Compliance Assessment), CO-RA-005 (State Regulatory Compliance Monitoring), QA-AE-003 (Monitoring and Effectiveness Verification), CO-RA-004 (CoP Compliance Matrix Maintenance), CO-RA-005 (8. Compliance Measurement). These sources are presented as a governed control map rather than pasted policy tables. For post-survey monitoring, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For sustained compliance, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for post-survey monitoring and sustained compliance centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to post-survey monitoring and sustained compliance. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for post-survey monitoring and sustained compliance should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for post-survey monitoring and sustained compliance, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Post-survey Mobile Evidence Cart", detail: "The post-survey mobile evidence cart shows a completed check with no responsible verifier. Verify it against the sustained surveyor request list and current source before acting." },
      { icon: "🧭", title: "Sustained Surveyor Request List", detail: "The sustained surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the exception tabbed policy binder and current source before acting." },
      { icon: "🛡️", title: "Exception Tabbed Policy Binder", detail: "The exception tabbed policy binder contains an approval tab with no approver name or date. Verify it against the post-survey mobile evidence cart and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR Part 488" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "post-survey-mobile-evidence-cart-6-1", label: "post-survey mobile evidence cart", shortLabel: "post-survey mobile evidence", ariaLabel: "Investigate post-survey mobile evidence cart",        x: 15, y: 69, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "The photographed post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. The adjacent sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance, while the sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. The adjacent sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance, while the sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read post-survey mobile evidence cart only for favorable indicators and omit the exception evidence connected to sustained surveyor request list. This identify option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for post-survey monitoring and sustained compliance." },
          { id: "i3", label: "Treat an unsigned or unverified post-survey mobile evidence cart as equivalent to the current controlled record. This identify option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about post-survey mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the post-survey mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the post-survey mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close post-survey mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for post-survey mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the post-survey mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during post-survey monitoring and sustained compliance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For post-survey mobile evidence cart, record the exact visible discrepancy, the conflicting sustained surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For post-survey mobile evidence cart, record the exact visible discrepancy, the conflicting sustained surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for post-survey mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of post-survey mobile evidence cart." },
          { id: "doc3", label: "Combine post-survey mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns post-survey mobile evidence cart during post-survey monitoring and sustained compliance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-survey monitoring and sustained compliance." },
        ],
        feedback: {
          observed: "The photographed post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. The adjacent sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. The adjacent sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance, while the sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the post-survey mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For post-survey monitoring and sustained compliance, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For post-survey mobile evidence cart, record the exact visible discrepancy, the conflicting sustained surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "sustained-surveyor-request-list-6-2", label: "sustained surveyor request list", shortLabel: "sustained surveyor request", ariaLabel: "Investigate sustained surveyor request list",        x: 33, y: 39, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "The photographed sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. The adjacent exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance, while the exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. The adjacent exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance, while the exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat sustained surveyor request list as complete proof without comparing exception tabbed policy binder or the controlled source. This identify option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for post-survey monitoring and sustained compliance." },
          { id: "i3", label: "Classify the sustained surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about sustained surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the sustained surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the sustained surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from sustained surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for sustained surveyor request list is resolved." },
          { id: "d3", label: "Send sustained surveyor request list to an unrelated department rather than the policy owner responsible for post-survey monitoring and sustained compliance. This decide option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during post-survey monitoring and sustained compliance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For sustained surveyor request list, record the exact visible discrepancy, the conflicting exception tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For sustained surveyor request list, record the exact visible discrepancy, the conflicting exception tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that sustained surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of sustained surveyor request list." },
          { id: "doc3", label: "Keep the sustained surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns sustained surveyor request list during post-survey monitoring and sustained compliance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-survey monitoring and sustained compliance." },
        ],
        feedback: {
          observed: "The photographed sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. The adjacent exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance. The adjacent exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The sustained surveyor request list shows an active item that the source record identifies as discontinued for post-survey monitoring and sustained compliance, while the exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the sustained surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For post-survey monitoring and sustained compliance, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For sustained surveyor request list, record the exact visible discrepancy, the conflicting exception tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "exception-tabbed-policy-binder-6-3", label: "exception tabbed policy binder", shortLabel: "exception tabbed policy binder", ariaLabel: "Investigate exception tabbed policy binder",        x: 78, y: 55, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "The photographed exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. The adjacent post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance, while the post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. The adjacent post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance, while the post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume exception tabbed policy binder applies to every role, patient, location, and exception described in post-survey monitoring and sustained compliance. This identify option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for post-survey monitoring and sustained compliance." },
          { id: "i3", label: "Use the oldest available exception tabbed policy binder because prior approval is easier to confirm. This identify option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in exception tabbed policy binder remains unresolved. This decide option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to exception tabbed policy binder. This decide option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during post-survey monitoring and sustained compliance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception tabbed policy binder, record the exact visible discrepancy, the conflicting post-survey mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception tabbed policy binder, record the exact visible discrepancy, the conflicting post-survey mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark exception tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of exception tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns exception tabbed policy binder during post-survey monitoring and sustained compliance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for post-survey monitoring and sustained compliance." },
        ],
        feedback: {
          observed: "The photographed exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. The adjacent post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. The adjacent post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance, while the post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For post-survey monitoring and sustained compliance, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For post-survey monitoring and sustained compliance, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For post-survey monitoring and sustained compliance, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For exception tabbed policy binder, record the exact visible discrepancy, the conflicting post-survey mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 Mock",
    title: "Mock surveys, leadership reporting, and readiness culture",
    subtitle: "Survey Readiness & Regulatory Inspection Management",
    narration: [
      "This lesson develops Director of Nursing judgment for mock surveys, leadership reporting, and readiness culture within Survey Readiness & Regulatory Inspection Management. The leadership objective is continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses CO-RA-003 (Mock Survey Program), CO-RA-003 (Survey Readiness Binder Maintenance), CO-RA-003 (8. Compliance Measurement), CO-RA-006 (Accreditation Readiness), CO-RA-003 (7. Documentation Requirements). These sources are presented as a governed control map rather than pasted policy tables. For mock surveys, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For leadership reporting, confirm that an operational practice does not silently expand beyond its approved scope. For readiness culture, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for mock surveys, leadership reporting, and readiness culture centers on record tracers, personnel evidence, competencies, supervision, policies, interviews, observations, deficiency status, and correction proof. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to mock surveys, leadership reporting, and readiness culture. The safe leadership response is to address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for mock surveys, leadership reporting, and readiness culture should preserve request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for mock surveys, leadership reporting, and readiness culture, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Mock Surveyor Request List", detail: "The mock surveyor request list shows an active item that the source record identifies as discontinued. Verify it against the reporting tabbed policy binder and current source before acting." },
      { icon: "🧭", title: "Reporting Tabbed Policy Binder", detail: "The reporting tabbed policy binder contains an approval tab with no approver name or date. Verify it against the readiness mobile evidence cart and current source before acting." },
      { icon: "🛡️", title: "Readiness Mobile Evidence Cart", detail: "The readiness mobile evidence cart shows a completed check with no responsible verifier. Verify it against the mock surveyor request list and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "CO-RA-002" },
      { kind: "Controlled Policy", text: "CO-RA-003" },
      { kind: "Controlled Policy", text: "CO-RA-004" },
      { kind: "Controlled Policy", text: "CO-RA-005" },
      { kind: "Controlled Policy", text: "CO-RA-006" },
      { kind: "Controlled Policy", text: "CO-RA-007" },
      { kind: "Controlled Policy", text: "QA-AE-003" },
      { kind: "Controlled Policy", text: "GV-EA-004" },
      { kind: "External Authority", text: "42 CFR § 484.65" },
      { kind: "External Authority", text: "42 CFR §484.65(d)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "mock-surveyor-request-list-7-1", label: "mock surveyor request list", shortLabel: "mock surveyor request list", ariaLabel: "Investigate mock surveyor request list",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "The photographed mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. The adjacent reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture, while the reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. The adjacent reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture, while the reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat mock surveyor request list as complete proof without comparing reporting tabbed policy binder or the controlled source. This identify option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "This omits controlled-source verification or corroboration required for mock surveys, leadership reporting, and readiness culture." },
          { id: "i3", label: "Classify the mock surveyor request list by department custom even though its authority and current status are unverified. This identify option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about mock surveyor request list." },
        ],
        decideChoices: [
          { id: "d1", label: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the mock surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the mock surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from mock surveyor request list alone and seek the authorized owner only after implementation. This decide option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for mock surveyor request list is resolved." },
          { id: "d3", label: "Send mock surveyor request list to an unrelated department rather than the policy owner responsible for mock surveys, leadership reporting, and readiness culture. This decide option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during mock surveys, leadership reporting, and readiness culture." },
        ],
        documentChoices: [
          { id: "doc1", label: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For mock surveyor request list, record the exact visible discrepancy, the conflicting reporting tabbed policy binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For mock surveyor request list, record the exact visible discrepancy, the conflicting reporting tabbed policy binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that mock surveyor request list was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of mock surveyor request list." },
          { id: "doc3", label: "Keep the mock surveyor request list decision in personal notes rather than the governed evidence location. This document option concerns mock surveyor request list during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock surveys, leadership reporting, and readiness culture." },
        ],
        feedback: {
          observed: "The photographed mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. The adjacent reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. The adjacent reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture, while the reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the mock surveyor request list discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For mock surveys, leadership reporting, and readiness culture, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For mock surveyor request list, record the exact visible discrepancy, the conflicting reporting tabbed policy binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "reporting-tabbed-policy-binder-7-2", label: "reporting tabbed policy binder", shortLabel: "reporting tabbed policy binder", ariaLabel: "Investigate reporting tabbed policy binder",        x: 36, y: 55, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "The photographed reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. The adjacent readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture, while the readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. The adjacent readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture, while the readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume reporting tabbed policy binder applies to every role, patient, location, and exception described in mock surveys, leadership reporting, and readiness culture. This identify option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "This omits controlled-source verification or corroboration required for mock surveys, leadership reporting, and readiness culture." },
          { id: "i3", label: "Use the oldest available reporting tabbed policy binder because prior approval is easier to confirm. This identify option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about reporting tabbed policy binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in reporting tabbed policy binder remains unresolved. This decide option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for reporting tabbed policy binder is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to reporting tabbed policy binder. This decide option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during mock surveys, leadership reporting, and readiness culture." },
        ],
        documentChoices: [
          { id: "doc1", label: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For reporting tabbed policy binder, record the exact visible discrepancy, the conflicting readiness mobile evidence cart, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For reporting tabbed policy binder, record the exact visible discrepancy, the conflicting readiness mobile evidence cart, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark reporting tabbed policy binder closed on assignment, before completion and effectiveness evidence exist. This document option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of reporting tabbed policy binder." },
          { id: "doc3", label: "Retain only a summary of reporting tabbed policy binder and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns reporting tabbed policy binder during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock surveys, leadership reporting, and readiness culture." },
        ],
        feedback: {
          observed: "The photographed reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. The adjacent readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. The adjacent readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture, while the readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the reporting tabbed policy binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For mock surveys, leadership reporting, and readiness culture, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For reporting tabbed policy binder, record the exact visible discrepancy, the conflicting readiness mobile evidence cart, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
      {
        id: "readiness-mobile-evidence-cart-7-3", label: "readiness mobile evidence cart", shortLabel: "readiness mobile evidence cart", ariaLabel: "Investigate readiness mobile evidence cart",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "The photographed readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. The adjacent mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture, while the mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. The adjacent mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture, while the mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read readiness mobile evidence cart only for favorable indicators and omit the exception evidence connected to mock surveyor request list. This identify option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "This omits controlled-source verification or corroboration required for mock surveys, leadership reporting, and readiness culture." },
          { id: "i3", label: "Treat an unsigned or unverified readiness mobile evidence cart as equivalent to the current controlled record. This identify option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about readiness mobile evidence cart." },
        ],
        decideChoices: [
          { id: "d1", label: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the readiness mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the readiness mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close readiness mobile evidence cart when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for readiness mobile evidence cart is resolved." },
          { id: "d3", label: "Defer the readiness mobile evidence cart decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during mock surveys, leadership reporting, and readiness culture." },
        ],
        documentChoices: [
          { id: "doc1", label: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For readiness mobile evidence cart, record the exact visible discrepancy, the conflicting mock surveyor request list, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For readiness mobile evidence cart, record the exact visible discrepancy, the conflicting mock surveyor request list, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for readiness mobile evidence cart but omit the actual evidence, communications, and unresolved items. This document option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of readiness mobile evidence cart." },
          { id: "doc3", label: "Combine readiness mobile evidence cart with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns readiness mobile evidence cart during mock surveys, leadership reporting, and readiness culture.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for mock surveys, leadership reporting, and readiness culture." },
        ],
        feedback: {
          observed: "The photographed readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. The adjacent mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture. The adjacent mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The readiness mobile evidence cart shows a completed check with no responsible verifier for mock surveys, leadership reporting, and readiness culture, while the mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture. Classify this as an unresolved exception involving continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For mock surveys, leadership reporting, and readiness culture, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the readiness mobile evidence cart discrepancy, apply the immediate safeguard, use this escalation route: Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For mock surveys, leadership reporting, and readiness culture, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For mock surveys, leadership reporting, and readiness culture, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. For readiness mobile evidence cart, record the exact visible discrepancy, the conflicting mock surveyor request list, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["CO-RA-002","CO-RA-003","CO-RA-004","CO-RA-005","CO-RA-006","CO-RA-007","QA-AE-003","GV-EA-004","42 CFR § 484.100","42 CFR §484.100","42 CFR §484.110","42 CFR Part 484","42 CFR § 484.60","42 CFR Part 488","42 CFR § 484.65","42 CFR §484.65(d)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During everyday survey readiness and clinical-system reliability, the photographed everyday surveyor request list shows an active item that the source record identifies as discontinued for everyday survey readiness and clinical-system reliability; the clinical-system tabbed policy binder contains an approval tab with no approver name or date for everyday survey readiness and clinical-system reliability. Which finding can the Director of Nursing support before authorizing action?",
    options: [
      "Treat the mismatch between the everyday surveyor request list and clinical-system tabbed policy binder as an unresolved continuous survey readiness demonstrated by functioning clinical systems and rapidly retrievable evidence exception; verify the current source, patient impact, and authorized owner.",
      "Accept the everyday surveyor request list because its visible status appears more recent than the clinical-system tabbed policy binder.",
      "Average the two artifact statuses and classify everyday survey readiness and clinical-system reliability as partially complete.",
      "Remove the conflicting clinical-system tabbed policy binder so the file presents one consistent answer.",
    ],
    correct: 0,
    rationale: "The physical evidence conflicts. A supportable classification preserves both artifacts and verifies authority and patient impact before action. Controlled-policy traceability for this lesson includes CO-RA-002.",
  },
  {
    id: 2,
    stem: "During clinical-record selection, traceability, and evidence retrieval, the photographed traceability mobile evidence cart shows a completed check with no responsible verifier for clinical-record selection, traceability, and evidence retrieval; the evidence surveyor request list shows an active item that the source record identifies as discontinued for clinical-record selection, traceability, and evidence retrieval. What is the safest authorized next action?",
    options: [
      "Continue the affected work and ask the traceability mobile evidence cart author to correct it during the next routine review.",
      "Use the evidence surveyor request list as authority because it contains fewer blank fields.",
      "Transfer the entire decision to the artifact custodian and remove DON follow-through.",
      "For clinical-record selection, traceability, and evidence retrieval, address genuine gaps through a specific corrective system rather than a temporary pre-survey appearance. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. Apply that response to the traceability mobile evidence cart discrepancy and keep the exception visible pending verification.",
    ],
    correct: 3,
    rationale: "The response addresses the module-specific decision while preserving the discrepancy, accountable ownership, and effectiveness review. Controlled-policy traceability for this lesson includes CO-RA-003.",
  },
  {
    id: 3,
    stem: "During personnel, competency, supervision, and policy evidence, the photographed supervision tabbed policy binder contains an approval tab with no approver name or date for personnel, competency, supervision, and policy evidence; the personnel mobile evidence cart shows a completed check with no responsible verifier for personnel, competency, supervision, and policy evidence. Which escalation creates a closed clinical-leadership loop?",
    options: [
      "For personnel, competency, supervision, and policy evidence, escalate through or to the current Administrator, compliance, governing body, or legal counsel when survey authority or material deficiency requires it. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
      "Wait for the personnel mobile evidence cart owner to notice the conflict, because escalation would duplicate the record.",
      "Send only a screenshot of the supervision tabbed policy binder and omit the patient impact, safeguard, and unresolved question.",
      "Email an unassigned distribution list about the supervision tabbed policy binder without requesting a decision or confirmation.",
    ],
    correct: 0,
    rationale: "The module-specific route identifies what to communicate, who must own the response, and how receipt and follow-through are confirmed. Controlled-policy traceability for this lesson includes CO-RA-004.",
  },
  {
    id: 4,
    stem: "During managing survey arrival, requests, interviews, and observations, the photographed managing surveyor request list shows an active item that the source record identifies as discontinued for managing survey arrival, requests, interviews, and observations; the requests tabbed policy binder contains an approval tab with no approver name or date for managing survey arrival, requests, interviews, and observations. Which entry makes the DON decision reconstructable?",
    options: [
      "Record the planned result for the requests tabbed policy binder but omit the visible finding, source, owner, and communication.",
      "Mark the issue closed when the correction is assigned, before verification evidence exists.",
      "For managing survey arrival, requests, interviews, and observations, document request, evidence supplied, finding, source, immediate protection, systemic correction, owner, target status, and monitoring, including unresolved evidence and the next verification point. Identify the conflicting managing surveyor request list and requests tabbed policy binder, rather than recording only a completion status.",
      "Write “reviewed” beside the managing surveyor request list and keep the discrepancy in personal notes.",
    ],
    correct: 2,
    rationale: "A qualified reviewer must be able to reconstruct the exact evidence, source, rationale, communication, owner, and final verification. Controlled-policy traceability for this lesson includes CO-RA-005.",
  },
  {
    id: 5,
    stem: "During deficiency analysis and corrective-action planning, correction of the corrective-action mobile evidence cart is assigned while the photographed corrective-action mobile evidence cart shows a completed check with no responsible verifier for deficiency analysis and corrective-action planning; the exception surveyor request list shows an active item that the source record identifies as discontinued for deficiency analysis and corrective-action planning. What accountability remains with the DON?",
    options: [
      "Treat assignment of the corrective-action mobile evidence cart correction as transfer of all clinical-leadership accountability.",
      "Confirm that the assignee has authority and capacity, monitor patient and operational consequences, escalate the corrective-action mobile evidence cart conflict, and verify the corrected result.",
      "Let the assignee select a different governing source without documenting or escalating the change.",
      "Close the exception when the assignee acknowledges the task, even if the exception surveyor request list still conflicts.",
    ],
    correct: 1,
    rationale: "Delegating a task does not remove DON accountability for clinical consequences, escalation, and effectiveness verification. Controlled-policy traceability for this lesson includes CO-RA-006.",
  },
  {
    id: 6,
    stem: "During post-survey monitoring and sustained compliance, the photographed exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance; the post-survey mobile evidence cart shows a completed check with no responsible verifier for post-survey monitoring and sustained compliance. What evidence supports closure?",
    options: [
      "A meeting agenda lists the issue without a decision, owner, safeguard, or verification result.",
      "The assigned owner reports being busy but expects the post-survey mobile evidence cart to be corrected.",
      "The exception tabbed policy binder is uploaded to the governed location, even though its discrepancy remains.",
      "An authorized owner resolves the exception tabbed policy binder and post-survey mobile evidence cart conflict, documents the action and communication, and verifies the intended patient or operational result.",
    ],
    correct: 3,
    rationale: "Closure requires completed action plus objective verification; submission, assignment, or discussion alone is not effectiveness evidence. Controlled-policy traceability for this lesson includes CO-RA-007.",
  },
  {
    id: 7,
    stem: "During mock surveys, leadership reporting, and readiness culture, the photographed mock surveyor request list shows an active item that the source record identifies as discontinued for mock surveys, leadership reporting, and readiness culture; the reporting tabbed policy binder contains an approval tab with no approver name or date for mock surveys, leadership reporting, and readiness culture. How should the source conflict be resolved?",
    options: [
      "Choose the mock surveyor request list because it is easier to read and discard the reporting tabbed policy binder.",
      "Use department custom to resolve the conflict without checking the controlled source.",
      "Copy a conclusion from a prior case and omit the current patient and authority evidence.",
      "Preserve both artifacts, verify the controlled source and role authority, reconcile patient-specific evidence, document the resolution, and escalate any remaining mock surveyor request list exception.",
    ],
    correct: 3,
    rationale: "Conflicting physical evidence must remain traceable until current authority, patient-specific facts, ownership, and resolution are documented. Controlled-policy traceability for this lesson includes QA-AE-003.",
  },
  {
    id: 8,
    stem: "A staff member cites 42 CFR § 484.100 to override the patient-specific evidence and controlled workflow in Survey Readiness & Regulatory Inspection Management. How should the DON respond?",
    options: [
      "Apply the citation to roles and circumstances that were not verified within its subject or scope.",
      "Verify the external requirement’s current subject and scope, reconcile it with controlled agency policy and patient-specific evidence, and document any conflict before acting.",
      "Replace the patient-specific order and assessment with a remembered summary of the citation.",
      "Accept the citation label as proof that every local workflow and exception is governed by the same rule.",
    ],
    correct: 1,
    rationale: "External authority informs practice only after its current scope and controlled implementation are verified; a citation label alone does not resolve the case.",
  },
  {
    id: 9,
    stem: "The clinical-record tabbed policy binder contains an approval tab with no approver name or date for clinical-record selection, traceability, and evidence retrieval, while the later exception tabbed policy binder contains an approval tab with no approver name or date for post-survey monitoring and sustained compliance. What connects these distinct findings into defensible DON practice for Survey Readiness & Regulatory Inspection Management?",
    options: [
      "Preserve both findings; verify controlled authority and patient-specific impact; assign and confirm accountable action; then document effectiveness across the clinical-record tabbed policy binder and exception tabbed policy binder.",
      "Use the later exception tabbed policy binder to overwrite the earlier clinical-record tabbed policy binder without preserving the source conflict.",
      "Treat the clinical-record tabbed policy binder as a training issue and the exception tabbed policy binder as another department’s issue, with no shared owner or trend review.",
      "Close both findings because two different artifacts cannot be evaluated in one leadership evidence chain.",
    ],
    correct: 0,
    rationale: "Cross-lesson synthesis connects distinct evidence through current authority, clinical reasoning, closed-loop ownership, trend awareness, and verified outcomes.",
  },
  {
    id: 10,
    stem: "After a passing score in Survey Readiness & Regulatory Inspection Management, a learner asks to perform every discussed activity independently. What does successful completion actually establish?",
    options: [
      "Automatic authority to perform every activity discussed in Survey Readiness & Regulatory Inspection Management without supervision.",
      "Knowledge of the controlled DON concepts in Survey Readiness & Regulatory Inspection Management; appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate decisions.",
      "Observed clinical competency even though no authorized evaluator witnessed performance.",
      "Permission to replace current policies, orders, and role restrictions with the quiz result.",
    ],
    correct: 1,
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


const STORAGE_KEY = 'don-016-progress-v6000';

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

export default function DON016() {
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
          <span className="brand-text">DON-016 — Survey Readiness</span>
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
