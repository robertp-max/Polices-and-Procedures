/// <reference path="./assets.d.ts" />
/**
 * DON-001 — DON Role, Authority & Regulatory Mandate
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
import img01 from './assets/don-001/don-001-lesson-01.png';
import img02 from './assets/don-001/don-001-lesson-02.png';
import img03 from './assets/don-001/don-001-lesson-03.png';
import img04 from './assets/don-001/don-001-lesson-04.png';
import img05 from './assets/don-001/don-001-lesson-05.png';
import img06 from './assets/don-001/don-001-lesson-06.png';
import img07 from './assets/don-001/don-001-lesson-07.png';

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

const MODULE_META = { id: "DON-001", title: "DON Role, Authority & Regulatory Mandate", pages: 7, quizCount: 10, passing: 80 };

const SCENE_ALT = [
  "Premium photorealistic PHI-safe home-health DON leadership scene for Regulatory mandate, appointment, and authority source, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for DON qualifications, role boundaries, and clinical governance, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Clinical-operations leadership and decision rights, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Delegation, retained accountability, and alternate coverage, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Escalation through administrator and governing body, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for Conflict resolution, patient-safety stops, and compliance reporting, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
  "Premium photorealistic PHI-safe home-health DON leadership scene for DON evidence portfolio and accountability practice, with three visible physical evidence objects aligned to keyboard-accessible hotspots.",
] as const;

const PAGES: PageData[] = [
  {
    id: 0,
    shortName: "1 Regulat",
    title: "Regulatory mandate, appointment, and authority source",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for regulatory mandate, appointment, and authority source within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses GV-OG-005 (Monitoring Delegated Authority), GV-OG-005 (4. Policy Statement), GV-OG-005 (Revocation of Delegated Authority), GV-OG-005 (5. Definitions), GV-OG-005 (Governing Body Delegation to the Administrator). These sources are presented as a governed control map rather than pasted policy tables. For regulatory mandate, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For appointment, confirm that an operational practice does not silently expand beyond its approved scope. For authority source, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for regulatory mandate, appointment, and authority source centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to regulatory mandate, appointment, and authority source. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for regulatory mandate, appointment, and authority source should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for regulatory mandate, appointment, and authority source, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Regulatory Appointment Letter", detail: "The regulatory appointment letter shows an effective date but no accepting signature. Verify it against the appointment credential portfolio and current source before acting." },
      { icon: "🧭", title: "Appointment Credential Portfolio", detail: "The appointment credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the authority binder and current source before acting." },
      { icon: "🛡️", title: "Authority Binder", detail: "The authority binder assigns an owner whose authority record is missing. Verify it against the regulatory appointment letter and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.115(b)" },
      { kind: "External Authority", text: "42 CFR § 484.30(c)" },
    ],
    sceneImage: img01,
    hotspots: [
      {
        id: "regulatory-appointment-letter-1-1", label: "regulatory appointment letter", shortLabel: "regulatory appointment letter", ariaLabel: "Investigate regulatory appointment letter",        x: 14, y: 41, zone: "authorized", leftAnchorId: "kp-0-0",
        observe: "The photographed regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. The adjacent appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source, while the appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. The adjacent appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source, while the appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat regulatory appointment letter as complete proof without comparing appointment credential portfolio or the controlled source. This identify option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "This omits controlled-source verification or corroboration required for regulatory mandate, appointment, and authority source." },
          { id: "i3", label: "Classify the regulatory appointment letter by department custom even though its authority and current status are unverified. This identify option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about regulatory appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the regulatory appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the regulatory appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from regulatory appointment letter alone and seek the authorized owner only after implementation. This decide option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for regulatory appointment letter is resolved." },
          { id: "d3", label: "Send regulatory appointment letter to an unrelated department rather than the policy owner responsible for regulatory mandate, appointment, and authority source. This decide option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during regulatory mandate, appointment, and authority source." },
        ],
        documentChoices: [
          { id: "doc1", label: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For regulatory appointment letter, record the exact visible discrepancy, the conflicting appointment credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For regulatory appointment letter, record the exact visible discrepancy, the conflicting appointment credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that regulatory appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of regulatory appointment letter." },
          { id: "doc3", label: "Keep the regulatory appointment letter decision in personal notes rather than the governed evidence location. This document option concerns regulatory appointment letter during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for regulatory mandate, appointment, and authority source." },
        ],
        feedback: {
          observed: "The photographed regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. The adjacent appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. The adjacent appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source, while the appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the regulatory appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For regulatory mandate, appointment, and authority source, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For regulatory appointment letter, record the exact visible discrepancy, the conflicting appointment credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "appointment-credential-portfolio-1-2", label: "appointment credential portfolio", shortLabel: "appointment credential", ariaLabel: "Investigate appointment credential portfolio",        x: 39, y: 61, zone: "conditional", leftAnchorId: "kp-0-1",
        observe: "The photographed appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. The adjacent authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source, while the authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. The adjacent authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source, while the authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume appointment credential portfolio applies to every role, patient, location, and exception described in regulatory mandate, appointment, and authority source. This identify option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "This omits controlled-source verification or corroboration required for regulatory mandate, appointment, and authority source." },
          { id: "i3", label: "Use the oldest available appointment credential portfolio because prior approval is easier to confirm. This identify option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about appointment credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the appointment credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the appointment credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in appointment credential portfolio remains unresolved. This decide option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for appointment credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to appointment credential portfolio. This decide option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during regulatory mandate, appointment, and authority source." },
        ],
        documentChoices: [
          { id: "doc1", label: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For appointment credential portfolio, record the exact visible discrepancy, the conflicting authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For appointment credential portfolio, record the exact visible discrepancy, the conflicting authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark appointment credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of appointment credential portfolio." },
          { id: "doc3", label: "Retain only a summary of appointment credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns appointment credential portfolio during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for regulatory mandate, appointment, and authority source." },
        ],
        feedback: {
          observed: "The photographed appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. The adjacent authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. The adjacent authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source, while the authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the appointment credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For regulatory mandate, appointment, and authority source, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For appointment credential portfolio, record the exact visible discrepancy, the conflicting authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "authority-binder-1-3", label: "authority binder", shortLabel: "authority binder", ariaLabel: "Investigate authority binder",        x: 78, y: 42, zone: "prohibited", leftAnchorId: "kp-0-2",
        observe: "The photographed authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. The adjacent regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source, while the regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. The adjacent regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source, while the regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read authority binder only for favorable indicators and omit the exception evidence connected to regulatory appointment letter. This identify option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "This omits controlled-source verification or corroboration required for regulatory mandate, appointment, and authority source." },
          { id: "i3", label: "Treat an unsigned or unverified authority binder as equivalent to the current controlled record. This identify option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for authority binder is resolved." },
          { id: "d3", label: "Defer the authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during regulatory mandate, appointment, and authority source." },
        ],
        documentChoices: [
          { id: "doc1", label: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For authority binder, record the exact visible discrepancy, the conflicting regulatory appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For authority binder, record the exact visible discrepancy, the conflicting regulatory appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of authority binder." },
          { id: "doc3", label: "Combine authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns authority binder during regulatory mandate, appointment, and authority source.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for regulatory mandate, appointment, and authority source." },
        ],
        feedback: {
          observed: "The photographed authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. The adjacent regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source. The adjacent regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The authority binder assigns an owner whose authority record is missing for regulatory mandate, appointment, and authority source, while the regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For regulatory mandate, appointment, and authority source, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For regulatory mandate, appointment, and authority source, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For regulatory mandate, appointment, and authority source, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For authority binder, record the exact visible discrepancy, the conflicting regulatory appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 1,
    shortName: "2 DON",
    title: "DON qualifications, role boundaries, and clinical governance",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for director of nursing qualifications, role boundaries, and clinical governance within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-TA-005 (Role-Specific / Clinical Orientation (Days 1-30)), CL-SD-008 (Director of Nursing Monthly Clinical Review), HR-JD-003 (3. Minimum Qualifications), HR-JD-003 (4. Essential Job Functions), HR-TA-005 (Orientation for Internal Transfers / Role Changes). These sources are presented as a governed control map rather than pasted policy tables. For director of nursing qualifications, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For role boundaries, confirm that an operational practice does not silently expand beyond its approved scope. For clinical governance, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for director of nursing qualifications, role boundaries, and clinical governance centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to director of nursing qualifications, role boundaries, and clinical governance. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for director of nursing qualifications, role boundaries, and clinical governance should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for director of nursing qualifications, role boundaries, and clinical governance, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Qualifications Credential Portfolio", detail: "The qualifications credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the role authority binder and current source before acting." },
      { icon: "🧭", title: "Role Authority Binder", detail: "The role authority binder assigns an owner whose authority record is missing. Verify it against the clinical appointment letter and current source before acting." },
      { icon: "🛡️", title: "Clinical Appointment Letter", detail: "The clinical appointment letter shows an effective date but no accepting signature. Verify it against the qualifications credential portfolio and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.30(c)" },
      { kind: "External Authority", text: "42 CFR §484.110" },
    ],
    sceneImage: img02,
    hotspots: [
      {
        id: "qualifications-credential-portfolio-2-1", label: "qualifications credential portfolio", shortLabel: "qualifications credential", ariaLabel: "Investigate qualifications credential portfolio",        x: 14, y: 64, zone: "authorized", leftAnchorId: "kp-1-0",
        observe: "The photographed qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. The adjacent role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance, while the role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. The adjacent role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance, while the role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume qualifications credential portfolio applies to every role, patient, location, and exception described in director of nursing qualifications, role boundaries, and clinical governance. This identify option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing qualifications, role boundaries, and clinical governance." },
          { id: "i3", label: "Use the oldest available qualifications credential portfolio because prior approval is easier to confirm. This identify option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about qualifications credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the qualifications credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the qualifications credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in qualifications credential portfolio remains unresolved. This decide option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for qualifications credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to qualifications credential portfolio. This decide option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For qualifications credential portfolio, record the exact visible discrepancy, the conflicting role authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For qualifications credential portfolio, record the exact visible discrepancy, the conflicting role authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark qualifications credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of qualifications credential portfolio." },
          { id: "doc3", label: "Retain only a summary of qualifications credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns qualifications credential portfolio during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        feedback: {
          observed: "The photographed qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. The adjacent role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. The adjacent role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance, while the role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the qualifications credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing qualifications, role boundaries, and clinical governance, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For qualifications credential portfolio, record the exact visible discrepancy, the conflicting role authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "role-authority-binder-2-2", label: "role authority binder", shortLabel: "role authority binder", ariaLabel: "Investigate role authority binder",        x: 34, y: 39, zone: "conditional", leftAnchorId: "kp-1-1",
        observe: "The photographed role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. The adjacent clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance, while the clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. The adjacent clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance, while the clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read role authority binder only for favorable indicators and omit the exception evidence connected to clinical appointment letter. This identify option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing qualifications, role boundaries, and clinical governance." },
          { id: "i3", label: "Treat an unsigned or unverified role authority binder as equivalent to the current controlled record. This identify option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about role authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the role authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the role authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close role authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for role authority binder is resolved." },
          { id: "d3", label: "Defer the role authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For role authority binder, record the exact visible discrepancy, the conflicting clinical appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For role authority binder, record the exact visible discrepancy, the conflicting clinical appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for role authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of role authority binder." },
          { id: "doc3", label: "Combine role authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns role authority binder during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        feedback: {
          observed: "The photographed role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. The adjacent clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance. The adjacent clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance, while the clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the role authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing qualifications, role boundaries, and clinical governance, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For role authority binder, record the exact visible discrepancy, the conflicting clinical appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "clinical-appointment-letter-2-3", label: "clinical appointment letter", shortLabel: "clinical appointment letter", ariaLabel: "Investigate clinical appointment letter",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-1-2",
        observe: "The photographed clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. The adjacent qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance, while the qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. The adjacent qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance, while the qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat clinical appointment letter as complete proof without comparing qualifications credential portfolio or the controlled source. This identify option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing qualifications, role boundaries, and clinical governance." },
          { id: "i3", label: "Classify the clinical appointment letter by department custom even though its authority and current status are unverified. This identify option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from clinical appointment letter alone and seek the authorized owner only after implementation. This decide option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical appointment letter is resolved." },
          { id: "d3", label: "Send clinical appointment letter to an unrelated department rather than the policy owner responsible for director of nursing qualifications, role boundaries, and clinical governance. This decide option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical appointment letter, record the exact visible discrepancy, the conflicting qualifications credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical appointment letter, record the exact visible discrepancy, the conflicting qualifications credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that clinical appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical appointment letter." },
          { id: "doc3", label: "Keep the clinical appointment letter decision in personal notes rather than the governed evidence location. This document option concerns clinical appointment letter during director of nursing qualifications, role boundaries, and clinical governance.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing qualifications, role boundaries, and clinical governance." },
        ],
        feedback: {
          observed: "The photographed clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. The adjacent qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. The adjacent qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance, while the qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing qualifications, role boundaries, and clinical governance, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing qualifications, role boundaries, and clinical governance, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical appointment letter, record the exact visible discrepancy, the conflicting qualifications credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 2,
    shortName: "3 Clinica",
    title: "Clinical-operations leadership and decision rights",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for clinical-operations leadership and decision rights within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses GV-OG-005 (Common Failure Points), GV-OG-005 (3. Scope), GV-OG-005 (5. Definitions), GV-OG-005 (Specific Delegation Requirements), GV-OG-005 (How Compliance Is Measured). These sources are presented as a governed control map rather than pasted policy tables. For clinical-operations leadership, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For decision rights, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for clinical-operations leadership and decision rights centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to clinical-operations leadership and decision rights. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for clinical-operations leadership and decision rights should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for clinical-operations leadership and decision rights, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Clinical-operations Authority Binder", detail: "The clinical-operations authority binder assigns an owner whose authority record is missing. Verify it against the decision appointment letter and current source before acting." },
      { icon: "🧭", title: "Decision Appointment Letter", detail: "The decision appointment letter shows an effective date but no accepting signature. Verify it against the exception credential portfolio and current source before acting." },
      { icon: "🛡️", title: "Exception Credential Portfolio", detail: "The exception credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the clinical-operations authority binder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.110" },
      { kind: "External Authority", text: "42 CFR § 484.105(a)" },
    ],
    sceneImage: img03,
    hotspots: [
      {
        id: "clinical-operations-authority-binder-3-1", label: "clinical-operations authority binder", shortLabel: "clinical-operations authority", ariaLabel: "Investigate clinical-operations authority binder",        x: 14, y: 45, zone: "authorized", leftAnchorId: "kp-2-0",
        observe: "The photographed clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. The adjacent decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights, while the decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. The adjacent decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights, while the decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read clinical-operations authority binder only for favorable indicators and omit the exception evidence connected to decision appointment letter. This identify option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-operations leadership and decision rights." },
          { id: "i3", label: "Treat an unsigned or unverified clinical-operations authority binder as equivalent to the current controlled record. This identify option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about clinical-operations authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-operations authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-operations authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close clinical-operations authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for clinical-operations authority binder is resolved." },
          { id: "d3", label: "Defer the clinical-operations authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-operations leadership and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical-operations authority binder, record the exact visible discrepancy, the conflicting decision appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical-operations authority binder, record the exact visible discrepancy, the conflicting decision appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for clinical-operations authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of clinical-operations authority binder." },
          { id: "doc3", label: "Combine clinical-operations authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns clinical-operations authority binder during clinical-operations leadership and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-operations leadership and decision rights." },
        ],
        feedback: {
          observed: "The photographed clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. The adjacent decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. The adjacent decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights, while the decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the clinical-operations authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-operations leadership and decision rights, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For clinical-operations authority binder, record the exact visible discrepancy, the conflicting decision appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "decision-appointment-letter-3-2", label: "decision appointment letter", shortLabel: "decision appointment letter", ariaLabel: "Investigate decision appointment letter",        x: 37, y: 41, zone: "conditional", leftAnchorId: "kp-2-1",
        observe: "The photographed decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. The adjacent exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights, while the exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. The adjacent exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights, while the exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat decision appointment letter as complete proof without comparing exception credential portfolio or the controlled source. This identify option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-operations leadership and decision rights." },
          { id: "i3", label: "Classify the decision appointment letter by department custom even though its authority and current status are unverified. This identify option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about decision appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from decision appointment letter alone and seek the authorized owner only after implementation. This decide option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for decision appointment letter is resolved." },
          { id: "d3", label: "Send decision appointment letter to an unrelated department rather than the policy owner responsible for clinical-operations leadership and decision rights. This decide option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-operations leadership and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For decision appointment letter, record the exact visible discrepancy, the conflicting exception credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For decision appointment letter, record the exact visible discrepancy, the conflicting exception credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that decision appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of decision appointment letter." },
          { id: "doc3", label: "Keep the decision appointment letter decision in personal notes rather than the governed evidence location. This document option concerns decision appointment letter during clinical-operations leadership and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-operations leadership and decision rights." },
        ],
        feedback: {
          observed: "The photographed decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. The adjacent exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights. The adjacent exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The decision appointment letter shows an effective date but no accepting signature for clinical-operations leadership and decision rights, while the exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the decision appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-operations leadership and decision rights, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For decision appointment letter, record the exact visible discrepancy, the conflicting exception credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "exception-credential-portfolio-3-3", label: "exception credential portfolio", shortLabel: "exception credential portfolio", ariaLabel: "Investigate exception credential portfolio",        x: 81, y: 62, zone: "prohibited", leftAnchorId: "kp-2-2",
        observe: "The photographed exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. The adjacent clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights, while the clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. The adjacent clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights, while the clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume exception credential portfolio applies to every role, patient, location, and exception described in clinical-operations leadership and decision rights. This identify option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "This omits controlled-source verification or corroboration required for clinical-operations leadership and decision rights." },
          { id: "i3", label: "Use the oldest available exception credential portfolio because prior approval is easier to confirm. This identify option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in exception credential portfolio remains unresolved. This decide option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to exception credential portfolio. This decide option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during clinical-operations leadership and decision rights." },
        ],
        documentChoices: [
          { id: "doc1", label: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception credential portfolio, record the exact visible discrepancy, the conflicting clinical-operations authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception credential portfolio, record the exact visible discrepancy, the conflicting clinical-operations authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark exception credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception credential portfolio." },
          { id: "doc3", label: "Retain only a summary of exception credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns exception credential portfolio during clinical-operations leadership and decision rights.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for clinical-operations leadership and decision rights." },
        ],
        feedback: {
          observed: "The photographed exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. The adjacent clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights. The adjacent clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights, while the clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For clinical-operations leadership and decision rights, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For clinical-operations leadership and decision rights, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For clinical-operations leadership and decision rights, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception credential portfolio, record the exact visible discrepancy, the conflicting clinical-operations authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 3,
    shortName: "4 Delegat",
    title: "Delegation, retained accountability, and alternate coverage",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for delegation, retained accountability, and alternate coverage within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses GV-OG-005 (Administrator Delegation to Department Heads and Designees), GV-OG-005 (Governing Body Delegation to the Administrator), GV-OG-005 (7. Documentation Requirements), GV-OG-005 (Specific Delegation Requirements), GV-OG-005 (4. Policy Statement). These sources are presented as a governed control map rather than pasted policy tables. For delegation, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For retained accountability, confirm that an operational practice does not silently expand beyond its approved scope. For alternate coverage, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for delegation, retained accountability, and alternate coverage centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to delegation, retained accountability, and alternate coverage. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for delegation, retained accountability, and alternate coverage should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for delegation, retained accountability, and alternate coverage, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Delegation Appointment Letter", detail: "The delegation appointment letter shows an effective date but no accepting signature. Verify it against the retained credential portfolio and current source before acting." },
      { icon: "🧭", title: "Retained Credential Portfolio", detail: "The retained credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the alternate authority binder and current source before acting." },
      { icon: "🛡️", title: "Alternate Authority Binder", detail: "The alternate authority binder assigns an owner whose authority record is missing. Verify it against the delegation appointment letter and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.105(a)" },
      { kind: "External Authority", text: "42 CFR § 484.105(b)" },
    ],
    sceneImage: img04,
    hotspots: [
      {
        id: "delegation-appointment-letter-4-1", label: "delegation appointment letter", shortLabel: "delegation appointment letter", ariaLabel: "Investigate delegation appointment letter",        x: 18, y: 43, zone: "authorized", leftAnchorId: "kp-3-0",
        observe: "The photographed delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. The adjacent retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage, while the retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. The adjacent retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage, while the retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat delegation appointment letter as complete proof without comparing retained credential portfolio or the controlled source. This identify option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "This omits controlled-source verification or corroboration required for delegation, retained accountability, and alternate coverage." },
          { id: "i3", label: "Classify the delegation appointment letter by department custom even though its authority and current status are unverified. This identify option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about delegation appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the delegation appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the delegation appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from delegation appointment letter alone and seek the authorized owner only after implementation. This decide option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for delegation appointment letter is resolved." },
          { id: "d3", label: "Send delegation appointment letter to an unrelated department rather than the policy owner responsible for delegation, retained accountability, and alternate coverage. This decide option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during delegation, retained accountability, and alternate coverage." },
        ],
        documentChoices: [
          { id: "doc1", label: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For delegation appointment letter, record the exact visible discrepancy, the conflicting retained credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For delegation appointment letter, record the exact visible discrepancy, the conflicting retained credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that delegation appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of delegation appointment letter." },
          { id: "doc3", label: "Keep the delegation appointment letter decision in personal notes rather than the governed evidence location. This document option concerns delegation appointment letter during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, retained accountability, and alternate coverage." },
        ],
        feedback: {
          observed: "The photographed delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. The adjacent retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. The adjacent retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage, while the retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the delegation appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For delegation, retained accountability, and alternate coverage, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For delegation appointment letter, record the exact visible discrepancy, the conflicting retained credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "retained-credential-portfolio-4-2", label: "retained credential portfolio", shortLabel: "retained credential portfolio", ariaLabel: "Investigate retained credential portfolio",        x: 32, y: 77, zone: "conditional", leftAnchorId: "kp-3-1",
        observe: "The photographed retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. The adjacent alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage, while the alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. The adjacent alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage, while the alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume retained credential portfolio applies to every role, patient, location, and exception described in delegation, retained accountability, and alternate coverage. This identify option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "This omits controlled-source verification or corroboration required for delegation, retained accountability, and alternate coverage." },
          { id: "i3", label: "Use the oldest available retained credential portfolio because prior approval is easier to confirm. This identify option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about retained credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the retained credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the retained credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in retained credential portfolio remains unresolved. This decide option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for retained credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to retained credential portfolio. This decide option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during delegation, retained accountability, and alternate coverage." },
        ],
        documentChoices: [
          { id: "doc1", label: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For retained credential portfolio, record the exact visible discrepancy, the conflicting alternate authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For retained credential portfolio, record the exact visible discrepancy, the conflicting alternate authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark retained credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of retained credential portfolio." },
          { id: "doc3", label: "Retain only a summary of retained credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns retained credential portfolio during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, retained accountability, and alternate coverage." },
        ],
        feedback: {
          observed: "The photographed retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. The adjacent alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. The adjacent alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage, while the alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the retained credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For delegation, retained accountability, and alternate coverage, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For retained credential portfolio, record the exact visible discrepancy, the conflicting alternate authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "alternate-authority-binder-4-3", label: "alternate authority binder", shortLabel: "alternate authority binder", ariaLabel: "Investigate alternate authority binder",        x: 80, y: 52, zone: "prohibited", leftAnchorId: "kp-3-2",
        observe: "The photographed alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. The adjacent delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage, while the delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. The adjacent delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage, while the delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read alternate authority binder only for favorable indicators and omit the exception evidence connected to delegation appointment letter. This identify option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "This omits controlled-source verification or corroboration required for delegation, retained accountability, and alternate coverage." },
          { id: "i3", label: "Treat an unsigned or unverified alternate authority binder as equivalent to the current controlled record. This identify option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about alternate authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the alternate authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the alternate authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close alternate authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for alternate authority binder is resolved." },
          { id: "d3", label: "Defer the alternate authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during delegation, retained accountability, and alternate coverage." },
        ],
        documentChoices: [
          { id: "doc1", label: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For alternate authority binder, record the exact visible discrepancy, the conflicting delegation appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For alternate authority binder, record the exact visible discrepancy, the conflicting delegation appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for alternate authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of alternate authority binder." },
          { id: "doc3", label: "Combine alternate authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns alternate authority binder during delegation, retained accountability, and alternate coverage.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for delegation, retained accountability, and alternate coverage." },
        ],
        feedback: {
          observed: "The photographed alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. The adjacent delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage. The adjacent delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The alternate authority binder assigns an owner whose authority record is missing for delegation, retained accountability, and alternate coverage, while the delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For delegation, retained accountability, and alternate coverage, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the alternate authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For delegation, retained accountability, and alternate coverage, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For alternate authority binder, record the exact visible discrepancy, the conflicting delegation appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 4,
    shortName: "5 Escalat",
    title: "Escalation through administrator and governing body",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for escalation through administrator and governing body within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses GV-OG-005 (Governing Body Delegation to the Administrator), GV-OG-005 (Administrator Delegation to Department Heads and Designees), GV-OG-005 (Escalation and Exception Handling), GV-OG-005 (7. Documentation Requirements), GV-OG-005 (4. Policy Statement). These sources are presented as a governed control map rather than pasted policy tables. For escalation through administrator, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For governing body, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for escalation through administrator and governing body centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to escalation through administrator and governing body. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for escalation through administrator and governing body should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for escalation through administrator and governing body, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Escalation Credential Portfolio", detail: "The escalation credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the governing authority binder and current source before acting." },
      { icon: "🧭", title: "Governing Authority Binder", detail: "The governing authority binder assigns an owner whose authority record is missing. Verify it against the exception appointment letter and current source before acting." },
      { icon: "🛡️", title: "Exception Appointment Letter", detail: "The exception appointment letter shows an effective date but no accepting signature. Verify it against the escalation credential portfolio and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR § 484.105(b)" },
      { kind: "External Authority", text: "42 CFR §484.100" },
    ],
    sceneImage: img05,
    hotspots: [
      {
        id: "escalation-credential-portfolio-5-1", label: "escalation credential portfolio", shortLabel: "escalation credential", ariaLabel: "Investigate escalation credential portfolio",        x: 14, y: 69, zone: "authorized", leftAnchorId: "kp-4-0",
        observe: "The photographed escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. The adjacent governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body, while the governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. The adjacent governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body, while the governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume escalation credential portfolio applies to every role, patient, location, and exception described in escalation through administrator and governing body. This identify option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation through administrator and governing body." },
          { id: "i3", label: "Use the oldest available escalation credential portfolio because prior approval is easier to confirm. This identify option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about escalation credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in escalation credential portfolio remains unresolved. This decide option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for escalation credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to escalation credential portfolio. This decide option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation through administrator and governing body." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For escalation credential portfolio, record the exact visible discrepancy, the conflicting governing authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For escalation credential portfolio, record the exact visible discrepancy, the conflicting governing authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark escalation credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of escalation credential portfolio." },
          { id: "doc3", label: "Retain only a summary of escalation credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns escalation credential portfolio during escalation through administrator and governing body.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation through administrator and governing body." },
        ],
        feedback: {
          observed: "The photographed escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. The adjacent governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. The adjacent governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body, while the governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the escalation credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation through administrator and governing body, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For escalation credential portfolio, record the exact visible discrepancy, the conflicting governing authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "governing-authority-binder-5-2", label: "governing authority binder", shortLabel: "governing authority binder", ariaLabel: "Investigate governing authority binder",        x: 33, y: 49, zone: "conditional", leftAnchorId: "kp-4-1",
        observe: "The photographed governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. The adjacent exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body, while the exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. The adjacent exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body, while the exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read governing authority binder only for favorable indicators and omit the exception evidence connected to exception appointment letter. This identify option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation through administrator and governing body." },
          { id: "i3", label: "Treat an unsigned or unverified governing authority binder as equivalent to the current controlled record. This identify option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about governing authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the governing authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the governing authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close governing authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for governing authority binder is resolved." },
          { id: "d3", label: "Defer the governing authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation through administrator and governing body." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For governing authority binder, record the exact visible discrepancy, the conflicting exception appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For governing authority binder, record the exact visible discrepancy, the conflicting exception appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for governing authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of governing authority binder." },
          { id: "doc3", label: "Combine governing authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns governing authority binder during escalation through administrator and governing body.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation through administrator and governing body." },
        ],
        feedback: {
          observed: "The photographed governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. The adjacent exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body. The adjacent exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body, while the exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the governing authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation through administrator and governing body, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For governing authority binder, record the exact visible discrepancy, the conflicting exception appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "exception-appointment-letter-5-3", label: "exception appointment letter", shortLabel: "exception appointment letter", ariaLabel: "Investigate exception appointment letter",        x: 79, y: 43, zone: "prohibited", leftAnchorId: "kp-4-2",
        observe: "The photographed exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. The adjacent escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body, while the escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. The adjacent escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body, while the escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat exception appointment letter as complete proof without comparing escalation credential portfolio or the controlled source. This identify option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "This omits controlled-source verification or corroboration required for escalation through administrator and governing body." },
          { id: "i3", label: "Classify the exception appointment letter by department custom even though its authority and current status are unverified. This identify option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from exception appointment letter alone and seek the authorized owner only after implementation. This decide option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception appointment letter is resolved." },
          { id: "d3", label: "Send exception appointment letter to an unrelated department rather than the policy owner responsible for escalation through administrator and governing body. This decide option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during escalation through administrator and governing body." },
        ],
        documentChoices: [
          { id: "doc1", label: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception appointment letter, record the exact visible discrepancy, the conflicting escalation credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception appointment letter, record the exact visible discrepancy, the conflicting escalation credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that exception appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception appointment letter." },
          { id: "doc3", label: "Keep the exception appointment letter decision in personal notes rather than the governed evidence location. This document option concerns exception appointment letter during escalation through administrator and governing body.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for escalation through administrator and governing body." },
        ],
        feedback: {
          observed: "The photographed exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. The adjacent escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. The adjacent escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body, while the escalation credential portfolio contains a signed summary but no source evidence for one required element for escalation through administrator and governing body. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For escalation through administrator and governing body, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For escalation through administrator and governing body, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For escalation through administrator and governing body, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception appointment letter, record the exact visible discrepancy, the conflicting escalation credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 5,
    shortName: "6 Conflic",
    title: "Conflict resolution, patient-safety stops, and compliance reporting",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for conflict resolution, patient-safety stops, and compliance reporting within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses GV-OG-005 (How Compliance Is Measured), HR-JD-003 (7. Compliance & Audit Considerations), GV-OG-005 (8. Compliance & Audit Considerations), CL-SD-008 (8. Compliance & Audit Considerations), HR-TA-005 (How Compliance Is Measured). These sources are presented as a governed control map rather than pasted policy tables. For conflict resolution, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For patient-safety stops, confirm that an operational practice does not silently expand beyond its approved scope. For compliance reporting, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for conflict resolution, patient-safety stops, and compliance reporting centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to conflict resolution, patient-safety stops, and compliance reporting. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for conflict resolution, patient-safety stops, and compliance reporting should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for conflict resolution, patient-safety stops, and compliance reporting, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Conflict Authority Binder", detail: "The conflict authority binder assigns an owner whose authority record is missing. Verify it against the patient-safety appointment letter and current source before acting." },
      { icon: "🧭", title: "Patient-safety Appointment Letter", detail: "The patient-safety appointment letter shows an effective date but no accepting signature. Verify it against the compliance credential portfolio and current source before acting." },
      { icon: "🛡️", title: "Compliance Credential Portfolio", detail: "The compliance credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the conflict authority binder and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.100" },
      { kind: "External Authority", text: "42 CFR §484.105(b)" },
    ],
    sceneImage: img06,
    hotspots: [
      {
        id: "conflict-authority-binder-6-1", label: "conflict authority binder", shortLabel: "conflict authority binder", ariaLabel: "Investigate conflict authority binder",        x: 14, y: 42, zone: "authorized", leftAnchorId: "kp-5-0",
        observe: "The photographed conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. The adjacent patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting, while the patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. The adjacent patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting, while the patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read conflict authority binder only for favorable indicators and omit the exception evidence connected to patient-safety appointment letter. This identify option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for conflict resolution, patient-safety stops, and compliance reporting." },
          { id: "i3", label: "Treat an unsigned or unverified conflict authority binder as equivalent to the current controlled record. This identify option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about conflict authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the conflict authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the conflict authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close conflict authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for conflict authority binder is resolved." },
          { id: "d3", label: "Defer the conflict authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For conflict authority binder, record the exact visible discrepancy, the conflicting patient-safety appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For conflict authority binder, record the exact visible discrepancy, the conflicting patient-safety appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for conflict authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of conflict authority binder." },
          { id: "doc3", label: "Combine conflict authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns conflict authority binder during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        feedback: {
          observed: "The photographed conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. The adjacent patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. The adjacent patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting, while the patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the conflict authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For conflict resolution, patient-safety stops, and compliance reporting, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For conflict authority binder, record the exact visible discrepancy, the conflicting patient-safety appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "patient-safety-appointment-letter-6-2", label: "patient-safety appointment letter", shortLabel: "patient-safety appointment", ariaLabel: "Investigate patient-safety appointment letter",        x: 32, y: 55, zone: "conditional", leftAnchorId: "kp-5-1",
        observe: "The photographed patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. The adjacent compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting, while the compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. The adjacent compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting, while the compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat patient-safety appointment letter as complete proof without comparing compliance credential portfolio or the controlled source. This identify option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for conflict resolution, patient-safety stops, and compliance reporting." },
          { id: "i3", label: "Classify the patient-safety appointment letter by department custom even though its authority and current status are unverified. This identify option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about patient-safety appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from patient-safety appointment letter alone and seek the authorized owner only after implementation. This decide option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for patient-safety appointment letter is resolved." },
          { id: "d3", label: "Send patient-safety appointment letter to an unrelated department rather than the policy owner responsible for conflict resolution, patient-safety stops, and compliance reporting. This decide option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For patient-safety appointment letter, record the exact visible discrepancy, the conflicting compliance credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For patient-safety appointment letter, record the exact visible discrepancy, the conflicting compliance credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that patient-safety appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of patient-safety appointment letter." },
          { id: "doc3", label: "Keep the patient-safety appointment letter decision in personal notes rather than the governed evidence location. This document option concerns patient-safety appointment letter during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        feedback: {
          observed: "The photographed patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. The adjacent compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting. The adjacent compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The patient-safety appointment letter shows an effective date but no accepting signature for conflict resolution, patient-safety stops, and compliance reporting, while the compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the patient-safety appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For conflict resolution, patient-safety stops, and compliance reporting, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For patient-safety appointment letter, record the exact visible discrepancy, the conflicting compliance credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "compliance-credential-portfolio-6-3", label: "compliance credential portfolio", shortLabel: "compliance credential", ariaLabel: "Investigate compliance credential portfolio",        x: 84, y: 62, zone: "prohibited", leftAnchorId: "kp-5-2",
        observe: "The photographed compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. The adjacent conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting, while the conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. The adjacent conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting, while the conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume compliance credential portfolio applies to every role, patient, location, and exception described in conflict resolution, patient-safety stops, and compliance reporting. This identify option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "This omits controlled-source verification or corroboration required for conflict resolution, patient-safety stops, and compliance reporting." },
          { id: "i3", label: "Use the oldest available compliance credential portfolio because prior approval is easier to confirm. This identify option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about compliance credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the compliance credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the compliance credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in compliance credential portfolio remains unresolved. This decide option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for compliance credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to compliance credential portfolio. This decide option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        documentChoices: [
          { id: "doc1", label: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For compliance credential portfolio, record the exact visible discrepancy, the conflicting conflict authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For compliance credential portfolio, record the exact visible discrepancy, the conflicting conflict authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark compliance credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of compliance credential portfolio." },
          { id: "doc3", label: "Retain only a summary of compliance credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns compliance credential portfolio during conflict resolution, patient-safety stops, and compliance reporting.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for conflict resolution, patient-safety stops, and compliance reporting." },
        ],
        feedback: {
          observed: "The photographed compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. The adjacent conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. The adjacent conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting, while the conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For conflict resolution, patient-safety stops, and compliance reporting, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the compliance credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For conflict resolution, patient-safety stops, and compliance reporting, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For conflict resolution, patient-safety stops, and compliance reporting, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For compliance credential portfolio, record the exact visible discrepancy, the conflicting conflict authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
  {
    id: 6,
    shortName: "7 DON",
    title: "DON evidence portfolio and accountability practice",
    subtitle: "DON Role, Authority & Regulatory Mandate",
    narration: [
      "This lesson develops Director of Nursing judgment for director of nursing evidence portfolio and accountability practice within DON Role, Authority & Regulatory Mandate. The leadership objective is documented DON appointment, qualifications, authority, and retained accountability. The DON begins with the current controlled source, patient-specific clinical evidence, documented appointment and authority, and the responsibilities retained by the Administrator and governing body. The work is not to memorize a policy excerpt. It is to recognize a material finding, reconcile competing evidence, protect the patient, assign the authorized owner, and verify that follow-through changed the intended outcome. Separate federal or California requirements, payer conditions, accreditation expectations, and higher Care Indeed standards instead of blending them into a universal rule. Knowledge completion supports reasoning but does not establish appointment, delegated authority, observed competency, legal sign-off, or authorization for independent practice.",
      "Controlled-source synthesis for this lesson uses HR-JD-003 (3. Minimum Qualifications), GV-OG-005 (What Surveyors and Auditors Will Look For), HR-JD-003 (4. Essential Job Functions), GV-OG-005 (2. Purpose), CL-SD-008 (4. Policy Statement). These sources are presented as a governed control map rather than pasted policy tables. For director of nursing evidence portfolio, determine which source is current, what role owns the decision, what evidence demonstrates compliance, and what exception path applies. For accountability practice, confirm that an operational practice does not silently expand beyond its approved scope. For exception handling, distinguish an assigned task from retained accountability. When a source title, staff statement, form, or software status conflicts with the controlled record, preserve the conflict and obtain qualified review instead of choosing whichever answer is most convenient.",
      "The evidence review for director of nursing evidence portfolio and accountability practice centers on appointment action, job description, delegation boundaries, alternate coverage, escalation evidence. Start by asking what each item actually proves, who created it, when its status was last verified, and what corroborating source is still required. A completed form can be incomplete evidence; a signed record can be outdated; a reassuring verbal report can conflict with patient findings; and an assigned owner can lack the authority or information needed to close the issue. The DON compares patient impact, clinical urgency, role boundaries, record integrity, and operational consequences. Missing evidence remains visible as an exception. It is never converted into a positive finding merely because a deadline, claim, survey, meeting, or staffing need is approaching.",
      "Decision practice must remain specific to director of nursing evidence portfolio and accountability practice. The safe leadership response is to hold action outside documented authority; obtain the authorized decision and protect affected patients. That response requires the DON to identify immediate patient protection, the controlling authority, available alternatives, and the point where work must pause. It also requires a named owner who has both authority and capacity to act. Delegation transfers a task, not the DON's obligation to monitor clinical consequences and escalate unresolved risk. When several pathways appear reasonable, compare them against the patient's current condition, applicable orders, verified policy scope, and the evidence needed for closure. Do not invent a universal cadence, threshold, credential, retention period, or legal conclusion to fill a gap in the source.",
      "Exception management is part of the clinical system, not an afterthought. Escalate through Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the objective finding, why it matters now, what has already been verified, what remains uncertain, and what response is requested. Use closed-loop communication: identify the recipient, confirm receipt and understanding, record the direction received, assign the next action, and reassess whether the risk changed. If the first contact does not resolve a material concern, continue through the current chain of command. A message sent without confirmed response is not closure. A committee referral without patient protection, accountable ownership, or an effectiveness check is also not closure.",
      "Documentation for director of nursing evidence portfolio and accountability practice should preserve source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure. Write for the qualified reviewer who was not present. The record should distinguish observed facts from interpretation, identify the controlled source without overstating its scope, explain the clinical-leadership rationale, and show how the decision protected patients or governed operations. Record unresolved questions and temporary safeguards rather than making the record appear cleaner than reality. Corrections follow the approved amendment pathway and preserve the original record. Completion is supported by objective evidence: the required action occurred, the responsible person confirmed it, the patient's or system's response was reassessed, and any recurrence or trend was routed into supervision, quality, compliance, or governing-body review.",
      "Apply this framework to the photographed scene. Treat the three objects as different evidence channels for director of nursing evidence portfolio and accountability practice, not as decorative labels or complete answers. Observe first; identify the source and discrepancy; decide within current authority; document the evidence chain; review feedback; and complete the hotspot only after the reasoning is reconstructable. Consider how the same control would behave during routine operations, an urgent patient-safety event, a staffing shortage, a survey request, and a disagreement between disciplines. The facts may change, but the method remains stable: use current sources, protect the patient, respect role boundaries, communicate through the authorized pathway, retain accountable ownership, and verify effectiveness before declaring the matter complete.",
    ],
    keyPoints: [
      { icon: "🔎", title: "Evidence Appointment Letter", detail: "The evidence appointment letter shows an effective date but no accepting signature. Verify it against the accountability credential portfolio and current source before acting." },
      { icon: "🧭", title: "Accountability Credential Portfolio", detail: "The accountability credential portfolio contains a signed summary but no source evidence for one required element. Verify it against the exception authority binder and current source before acting." },
      { icon: "🛡️", title: "Exception Authority Binder", detail: "The exception authority binder assigns an owner whose authority record is missing. Verify it against the evidence appointment letter and current source before acting." },
    ],
    clinicalTip: "Knowledge practice supports DON clinical-leadership reasoning but never replaces appointment, current authority, observed competency, or authorization. For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients.",
    sourceLabels: [
      { kind: "Controlled Policy", text: "HR-JD-003" },
      { kind: "Controlled Policy", text: "GV-OG-005" },
      { kind: "Controlled Policy", text: "CL-SD-008" },
      { kind: "Controlled Policy", text: "HR-TA-005" },
      { kind: "External Authority", text: "42 CFR §484.105(b)" },
      { kind: "External Authority", text: "42 CFR §484.105(c)" },
    ],
    sceneImage: img07,
    hotspots: [
      {
        id: "evidence-appointment-letter-7-1", label: "evidence appointment letter", shortLabel: "evidence appointment letter", ariaLabel: "Investigate evidence appointment letter",        x: 15, y: 72, zone: "authorized", leftAnchorId: "kp-6-0",
        observe: "The photographed evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. The adjacent accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice, while the accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. The adjacent accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice, while the accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Treat evidence appointment letter as complete proof without comparing accountability credential portfolio or the controlled source. This identify option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing evidence portfolio and accountability practice." },
          { id: "i3", label: "Classify the evidence appointment letter by department custom even though its authority and current status are unverified. This identify option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about evidence appointment letter." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Approve action from evidence appointment letter alone and seek the authorized owner only after implementation. This decide option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for evidence appointment letter is resolved." },
          { id: "d3", label: "Send evidence appointment letter to an unrelated department rather than the policy owner responsible for director of nursing evidence portfolio and accountability practice. This decide option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing evidence portfolio and accountability practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For evidence appointment letter, record the exact visible discrepancy, the conflicting accountability credential portfolio, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For evidence appointment letter, record the exact visible discrepancy, the conflicting accountability credential portfolio, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Record only that evidence appointment letter was reviewed, without source version, finding, decision, owner, communication, or status. This document option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of evidence appointment letter." },
          { id: "doc3", label: "Keep the evidence appointment letter decision in personal notes rather than the governed evidence location. This document option concerns evidence appointment letter during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing evidence portfolio and accountability practice." },
        ],
        feedback: {
          observed: "The photographed evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. The adjacent accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. The adjacent accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice, while the accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the evidence appointment letter discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing evidence portfolio and accountability practice, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For evidence appointment letter, record the exact visible discrepancy, the conflicting accountability credential portfolio, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "accountability-credential-portfolio-7-2", label: "accountability credential portfolio", shortLabel: "accountability credential", ariaLabel: "Investigate accountability credential portfolio",        x: 59, y: 73, zone: "conditional", leftAnchorId: "kp-6-1",
        observe: "The photographed accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. The adjacent exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice, while the exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. The adjacent exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice, while the exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Assume accountability credential portfolio applies to every role, patient, location, and exception described in director of nursing evidence portfolio and accountability practice. This identify option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing evidence portfolio and accountability practice." },
          { id: "i3", label: "Use the oldest available accountability credential portfolio because prior approval is easier to confirm. This identify option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about accountability credential portfolio." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Allow the affected activity to continue while the patient-safety or authority exception in accountability credential portfolio remains unresolved. This decide option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for accountability credential portfolio is resolved." },
          { id: "d3", label: "Replace the controlling requirement with an informal local workaround tailored to accountability credential portfolio. This decide option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing evidence portfolio and accountability practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For accountability credential portfolio, record the exact visible discrepancy, the conflicting exception authority binder, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For accountability credential portfolio, record the exact visible discrepancy, the conflicting exception authority binder, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Mark accountability credential portfolio closed on assignment, before completion and effectiveness evidence exist. This document option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of accountability credential portfolio." },
          { id: "doc3", label: "Retain only a summary of accountability credential portfolio and discard the source artifact needed to reconstruct the clinical-leadership decision. This document option concerns accountability credential portfolio during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing evidence portfolio and accountability practice." },
        ],
        feedback: {
          observed: "The photographed accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. The adjacent exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. The adjacent exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice, while the exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the accountability credential portfolio discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing evidence portfolio and accountability practice, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For accountability credential portfolio, record the exact visible discrepancy, the conflicting exception authority binder, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
      {
        id: "exception-authority-binder-7-3", label: "exception authority binder", shortLabel: "exception authority binder", ariaLabel: "Investigate exception authority binder",        x: 74, y: 39, zone: "prohibited", leftAnchorId: "kp-6-2",
        observe: "The photographed exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. The adjacent evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
        identifyChoices: [
          { id: "i1", label: "The exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice, while the evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.", correct: true, rationale: "Correct. The photographed exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. The adjacent evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice, while the evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled." },
          { id: "i2", label: "Read exception authority binder only for favorable indicators and omit the exception evidence connected to evidence appointment letter. This identify option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "This omits controlled-source verification or corroboration required for director of nursing evidence portfolio and accountability practice." },
          { id: "i3", label: "Treat an unsigned or unverified exception authority binder as equivalent to the current controlled record. This identify option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Use current authority, patient-specific evidence, and controlled documentation rather than an assumption about exception authority binder." },
        ],
        decideChoices: [
          { id: "d1", label: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness." },
          { id: "d2", label: "Close exception authority binder when work is submitted, without testing whether the correction changed the intended outcome. This decide option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "That response acts before the material discrepancy, patient risk, authority, or competency boundary for exception authority binder is resolved." },
          { id: "d3", label: "Defer the exception authority binder decision to a routine future cycle even though current clinical operations depend on it. This decide option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The DON retains clinical-leadership escalation and closed-loop accountability during director of nursing evidence portfolio and accountability practice." },
        ],
        documentChoices: [
          { id: "doc1", label: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception authority binder, record the exact visible discrepancy, the conflicting evidence appointment letter, the source used, communication, owner, safeguard, and verification result.", correct: true, rationale: "Correct. For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception authority binder, record the exact visible discrepancy, the conflicting evidence appointment letter, the source used, communication, owner, safeguard, and verification result." },
          { id: "doc2", label: "Document the expected result for exception authority binder but omit the actual evidence, communications, and unresolved items. This document option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "The record would not let a reviewer reconstruct the source, finding, decision, ownership, and status of exception authority binder." },
          { id: "doc3", label: "Combine exception authority binder with unrelated actions so no accountable owner or closure evidence can be traced. This document option concerns exception authority binder during director of nursing evidence portfolio and accountability practice.", correct: false, rationale: "Governed evidence must preserve accountable follow-through for director of nursing evidence portfolio and accountability practice." },
        ],
        feedback: {
          observed: "The photographed exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. The adjacent evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner.",
          meaning: "The photographed exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice. The adjacent evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Preserve both artifacts while verifying the current controlled source, patient impact, and authorized owner. The exception authority binder assigns an owner whose authority record is missing for director of nursing evidence portfolio and accountability practice, while the evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice. Classify this as an unresolved exception involving documented DON appointment, qualifications, authority, and retained accountability until the controlled source, patient impact, and authorized owner are reconciled.",
          action: "For director of nursing evidence portfolio and accountability practice, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. For the exception authority binder discrepancy, apply the immediate safeguard, use this escalation route: Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved, and keep the exception open until an authorized owner verifies effectiveness.",
          notify: "For director of nursing evidence portfolio and accountability practice, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
          document: "For director of nursing evidence portfolio and accountability practice, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. For exception authority binder, record the exact visible discrepancy, the conflicting evidence appointment letter, the source used, communication, owner, safeguard, and verification result.",
          policyRefs: ["HR-JD-003","GV-OG-005","CL-SD-008","HR-TA-005","42 CFR § 484.115(b)","42 CFR § 484.30(c)","42 CFR §484.110","42 CFR § 484.105(a)","42 CFR § 484.105(b)","42 CFR §484.100","42 CFR §484.105(b)","42 CFR §484.105(c)"],
        },
      },
    ],
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 1,
    stem: "During regulatory mandate, appointment, and authority source, the photographed regulatory appointment letter shows an effective date but no accepting signature for regulatory mandate, appointment, and authority source; the appointment credential portfolio contains a signed summary but no source evidence for one required element for regulatory mandate, appointment, and authority source. Which finding can the Director of Nursing support before authorizing action?",
    options: [
      "Remove the conflicting appointment credential portfolio so the file presents one consistent answer.",
      "Accept the regulatory appointment letter because its visible status appears more recent than the appointment credential portfolio.",
      "Treat the mismatch between the regulatory appointment letter and appointment credential portfolio as an unresolved documented DON appointment, qualifications, authority, and retained accountability exception; verify the current source, patient impact, and authorized owner.",
      "Average the two artifact statuses and classify regulatory mandate, appointment, and authority source as partially complete.",
    ],
    correct: 2,
    rationale: "The physical evidence conflicts. A supportable classification preserves both artifacts and verifies authority and patient impact before action. Controlled-policy traceability for this lesson includes HR-JD-003.",
  },
  {
    id: 2,
    stem: "During director of nursing qualifications, role boundaries, and clinical governance, the photographed role authority binder assigns an owner whose authority record is missing for director of nursing qualifications, role boundaries, and clinical governance; the clinical appointment letter shows an effective date but no accepting signature for director of nursing qualifications, role boundaries, and clinical governance. What is the safest authorized next action?",
    options: [
      "Transfer the entire decision to the artifact custodian and remove DON follow-through.",
      "Use the clinical appointment letter as authority because it contains fewer blank fields.",
      "For director of nursing qualifications, role boundaries, and clinical governance, hold action outside documented authority; obtain the authorized decision and protect affected patients. Name the authorized owner, immediate patient protection, escalation route, and effectiveness check. Apply that response to the role authority binder discrepancy and keep the exception visible pending verification.",
      "Continue the affected work and ask the role authority binder author to correct it during the next routine review.",
    ],
    correct: 2,
    rationale: "The response addresses the module-specific decision while preserving the discrepancy, accountable ownership, and effectiveness review. Controlled-policy traceability for this lesson includes GV-OG-005.",
  },
  {
    id: 3,
    stem: "During clinical-operations leadership and decision rights, the photographed exception credential portfolio contains a signed summary but no source evidence for one required element for clinical-operations leadership and decision rights; the clinical-operations authority binder assigns an owner whose authority record is missing for clinical-operations leadership and decision rights. Which escalation creates a closed clinical-leadership loop?",
    options: [
      "Wait for the clinical-operations authority binder owner to notice the conflict, because escalation would duplicate the record.",
      "Send only a screenshot of the exception credential portfolio and omit the patient impact, safeguard, and unresolved question.",
      "Email an unassigned distribution list about the exception credential portfolio without requesting a decision or confirmation.",
      "For clinical-operations leadership and decision rights, escalate through or to the current Administrator or governing body when authority, appointment, or patient-safety accountability is unresolved. Communicate the verified finding, immediate safeguard, requested decision, accountable owner, and next confirmation point; confirm receipt and retain DON accountability for clinical follow-through.",
    ],
    correct: 3,
    rationale: "The module-specific route identifies what to communicate, who must own the response, and how receipt and follow-through are confirmed. Controlled-policy traceability for this lesson includes CL-SD-008.",
  },
  {
    id: 4,
    stem: "During delegation, retained accountability, and alternate coverage, the photographed delegation appointment letter shows an effective date but no accepting signature for delegation, retained accountability, and alternate coverage; the retained credential portfolio contains a signed summary but no source evidence for one required element for delegation, retained accountability, and alternate coverage. Which entry makes the DON decision reconstructable?",
    options: [
      "Write “reviewed” beside the delegation appointment letter and keep the discrepancy in personal notes.",
      "Record the planned result for the retained credential portfolio but omit the visible finding, source, owner, and communication.",
      "Mark the issue closed when the correction is assigned, before verification evidence exists.",
      "For delegation, retained accountability, and alternate coverage, document source version, appointment or delegation evidence, decision rights, rationale, owner, escalation, and closure, including unresolved evidence and the next verification point. Identify the conflicting delegation appointment letter and retained credential portfolio, rather than recording only a completion status.",
    ],
    correct: 3,
    rationale: "A qualified reviewer must be able to reconstruct the exact evidence, source, rationale, communication, owner, and final verification. Controlled-policy traceability for this lesson includes HR-TA-005.",
  },
  {
    id: 5,
    stem: "During escalation through administrator and governing body, correction of the governing authority binder is assigned while the photographed governing authority binder assigns an owner whose authority record is missing for escalation through administrator and governing body; the exception appointment letter shows an effective date but no accepting signature for escalation through administrator and governing body. What accountability remains with the DON?",
    options: [
      "Let the assignee select a different governing source without documenting or escalating the change.",
      "Close the exception when the assignee acknowledges the task, even if the exception appointment letter still conflicts.",
      "Confirm that the assignee has authority and capacity, monitor patient and operational consequences, escalate the governing authority binder conflict, and verify the corrected result.",
      "Treat assignment of the governing authority binder correction as transfer of all clinical-leadership accountability.",
    ],
    correct: 2,
    rationale: "Delegating a task does not remove DON accountability for clinical consequences, escalation, and effectiveness verification. Controlled-policy traceability for this lesson includes HR-JD-003.",
  },
  {
    id: 6,
    stem: "During conflict resolution, patient-safety stops, and compliance reporting, the photographed compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting; the conflict authority binder assigns an owner whose authority record is missing for conflict resolution, patient-safety stops, and compliance reporting. What evidence supports closure?",
    options: [
      "An authorized owner resolves the compliance credential portfolio and conflict authority binder conflict, documents the action and communication, and verifies the intended patient or operational result.",
      "A meeting agenda lists the issue without a decision, owner, safeguard, or verification result.",
      "The compliance credential portfolio is uploaded to the governed location, even though its discrepancy remains.",
      "The assigned owner reports being busy but expects the conflict authority binder to be corrected.",
    ],
    correct: 0,
    rationale: "Closure requires completed action plus objective verification; submission, assignment, or discussion alone is not effectiveness evidence. Controlled-policy traceability for this lesson includes GV-OG-005.",
  },
  {
    id: 7,
    stem: "During director of nursing evidence portfolio and accountability practice, the photographed evidence appointment letter shows an effective date but no accepting signature for director of nursing evidence portfolio and accountability practice; the accountability credential portfolio contains a signed summary but no source evidence for one required element for director of nursing evidence portfolio and accountability practice. How should the source conflict be resolved?",
    options: [
      "Use department custom to resolve the conflict without checking the controlled source.",
      "Copy a conclusion from a prior case and omit the current patient and authority evidence.",
      "Choose the evidence appointment letter because it is easier to read and discard the accountability credential portfolio.",
      "Preserve both artifacts, verify the controlled source and role authority, reconcile patient-specific evidence, document the resolution, and escalate any remaining evidence appointment letter exception.",
    ],
    correct: 3,
    rationale: "Conflicting physical evidence must remain traceable until current authority, patient-specific facts, ownership, and resolution are documented. Controlled-policy traceability for this lesson includes CL-SD-008.",
  },
  {
    id: 8,
    stem: "A staff member cites 42 CFR § 484.115(b) to override the patient-specific evidence and controlled workflow in DON Role, Authority & Regulatory Mandate. How should the DON respond?",
    options: [
      "Replace the patient-specific order and assessment with a remembered summary of the citation.",
      "Verify the external requirement’s current subject and scope, reconcile it with controlled agency policy and patient-specific evidence, and document any conflict before acting.",
      "Accept the citation label as proof that every local workflow and exception is governed by the same rule.",
      "Apply the citation to roles and circumstances that were not verified within its subject or scope.",
    ],
    correct: 1,
    rationale: "External authority informs practice only after its current scope and controlled implementation are verified; a citation label alone does not resolve the case.",
  },
  {
    id: 9,
    stem: "The qualifications credential portfolio contains a signed summary but no source evidence for one required element for director of nursing qualifications, role boundaries, and clinical governance, while the later compliance credential portfolio contains a signed summary but no source evidence for one required element for conflict resolution, patient-safety stops, and compliance reporting. What connects these distinct findings into defensible DON practice for DON Role, Authority & Regulatory Mandate?",
    options: [
      "Close both findings because two different artifacts cannot be evaluated in one leadership evidence chain.",
      "Use the later compliance credential portfolio to overwrite the earlier qualifications credential portfolio without preserving the source conflict.",
      "Treat the qualifications credential portfolio as a training issue and the compliance credential portfolio as another department’s issue, with no shared owner or trend review.",
      "Preserve both findings; verify controlled authority and patient-specific impact; assign and confirm accountable action; then document effectiveness across the qualifications credential portfolio and compliance credential portfolio.",
    ],
    correct: 3,
    rationale: "Cross-lesson synthesis connects distinct evidence through current authority, clinical reasoning, closed-loop ownership, trend awareness, and verified outcomes.",
  },
  {
    id: 10,
    stem: "After a passing score in DON Role, Authority & Regulatory Mandate, a learner asks to perform every discussed activity independently. What does successful completion actually establish?",
    options: [
      "Observed clinical competency even though no authorized evaluator witnessed performance.",
      "Permission to replace current policies, orders, and role restrictions with the quiz result.",
      "Knowledge of the controlled DON concepts in DON Role, Authority & Regulatory Mandate; appointment, delegated duties, observed competency, legal sign-off, and independent-practice authorization remain separate decisions.",
      "Automatic authority to perform every activity discussed in DON Role, Authority & Regulatory Mandate without supervision.",
    ],
    correct: 2,
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


const STORAGE_KEY = 'don-001-progress-v6000';

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

export default function DON001() {
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
          <span className="brand-text">DON-001 — Role & Authority</span>
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
